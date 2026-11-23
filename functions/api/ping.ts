import { assessPublicRequest, bearerToken, jsonResponse, sanitizeUpstream } from "../../lib/ping";

interface Env {
  MAILER?: { fetch: typeof fetch };
  PING_INTERNAL_TOKEN?: string;
}

export function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  return handle(context.request, context.env);
}

async function handle(request: Request, env: Env): Promise<Response> {
  const assessed = await assessPublicRequest(request);
  if (!assessed.ok) return assessed.response;

  const token = bearerToken(`Bearer ${(env.PING_INTERNAL_TOKEN ?? "").trim()}`);
  if (!token || !env.MAILER) {
    console.error("ping misconfigured");
    return jsonResponse(503, { ok: false, error: "unavailable" });
  }

  try {
    const upstream = await env.MAILER.fetch("https://alirustem-ping-mailer/send", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json; charset=utf-8",
        "x-ping-ip": assessed.ip,
      },
      body: assessed.text,
    });
    return sanitizeUpstream(upstream);
  } catch {
    console.error("ping upstream failed");
    return jsonResponse(502, { ok: false, error: "unavailable" });
  }
}
