import {
  bearerToken,
  FROM_ADDRESS,
  FROM_NAME,
  handleAuthorizedPing,
  jsonResponse,
  MAX_BODY_BYTES,
  readLimitedBody,
  safeEqual,
  TO_ADDRESS,
  verifyTurnstile,
  type ComposedMail,
} from "../../lib/ping";

interface Env {
  EMAIL?: {
    send(message: ComposedMail): Promise<{ messageId: string }>;
  };
  PING_LIMIT?: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  };
  TURNSTILE_SECRET_KEY?: string;
  PING_INTERNAL_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return jsonResponse(405, { ok: false, error: "unavailable" }, { allow: "POST" });
    }

    const configured = (env.PING_INTERNAL_TOKEN ?? "").trim();
    const presented = bearerToken(request.headers.get("authorization"));
    if (!configured || !safeEqual(presented, configured)) {
      console.error(configured ? "ping rejected" : "ping misconfigured");
      return jsonResponse(configured ? 401 : 503, { ok: false, error: "unavailable" });
    }

    if (!env.TURNSTILE_SECRET_KEY || !env.EMAIL || !env.PING_LIMIT) {
      console.error("ping misconfigured");
      return jsonResponse(503, { ok: false, error: "unavailable" });
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return jsonResponse(415, { ok: false, error: "unavailable" });
    }

    const body = await readLimitedBody(request, MAX_BODY_BYTES);
    if (!body.ok) {
      const error = body.status === 413 ? "payload" : "invalid";
      return jsonResponse(
        body.status,
        error === "invalid" ? { ok: false, error, field: "message" } : { ok: false, error },
      );
    }

    const secret = env.TURNSTILE_SECRET_KEY;
    const limiter = env.PING_LIMIT;
    const email = env.EMAIL;
    const ip = request.headers.get("x-ping-ip");

    return handleAuthorizedPing(body.text, ip ?? "unknown", {
      verifyTurnstile: (token, remote) => verifyTurnstile(token, remote, secret),
      rateLimit: async (key) => {
        const result = await limiter.limit({ key: `ip:${key}` });
        return result.success;
      },
      send: (mail) => {
        if (mail.to !== TO_ADDRESS || mail.from.email !== FROM_ADDRESS || mail.from.name !== FROM_NAME) {
          const blocked = new Error("blocked");
          (blocked as { code?: string }).code = "E_RECIPIENT_NOT_ALLOWED";
          throw blocked;
        }
        return email.send({
          to: TO_ADDRESS,
          from: { email: FROM_ADDRESS, name: FROM_NAME },
          ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
          subject: mail.subject,
          text: mail.text,
        });
      },
    });
  },
};
