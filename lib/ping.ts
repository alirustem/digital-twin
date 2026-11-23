export const TO_ADDRESS = "alooshe.rstm@gmail.com";
export const FROM_ADDRESS = "ping@alirustem.com";
export const FROM_NAME = "alirustem.com";

export const MAX_NAME = 100;
export const MAX_MESSAGE = 3000;
export const MAX_EMAIL = 254;
export const MAX_BODY_BYTES = 16_384;
export const MAX_TURNSTILE_TOKEN = 2048;

/** Public Cloudflare test secret. Accepts only the dummy token, and only for local checks. */
export const TURNSTILE_TEST_SECRET = "1x0000000000000000000000000000000AA";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TOKEN_PATTERN = /^[A-Za-z0-9._-]{1,2048}$/;
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export type PingField = "name" | "email" | "message" | "turnstile";

export type PingInput = {
  name: string;
  email: string | null;
  message: string;
};

export type ValidatedPing =
  | { ok: true; value: PingInput; turnstile: string }
  | { ok: false; field: PingField };

export type ComposedMail = {
  to: string;
  from: { email: string; name: string };
  replyTo?: string;
  subject: string;
  text: string;
};

export type PingResult =
  | { ok: true }
  | { ok: false; error: "invalid"; field: PingField }
  | { ok: false; error: "rate" | "turnstile" | "unavailable" | "payload" };

export function jsonResponse(status: number, body: unknown, extra?: HeadersInit): Response {
  const headers = new Headers(extra);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-robots-tag", "noindex");
  return new Response(JSON.stringify(body), { status, headers });
}

export function statusFor(result: PingResult): number {
  if (result.ok) return 200;
  switch (result.error) {
    case "invalid":
      return 400;
    case "rate":
      return 429;
    case "turnstile":
      return 403;
    case "payload":
      return 413;
    default:
      return 502;
  }
}

export function interpretPingResponse(data: unknown): PingResult {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "unavailable" };
  }
  const body = data as Record<string, unknown>;
  if (body.ok === true) return { ok: true };
  if (body.error === "invalid" && isField(body.field)) {
    return { ok: false, error: "invalid", field: body.field };
  }
  const error = publicError(body.error);
  if (error) return { ok: false, error };
  return { ok: false, error: "unavailable" };
}

export function validatePing(raw: unknown): ValidatedPing {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, field: "message" };
  }
  const data = raw as Record<string, unknown>;

  if (typeof data.name !== "string") return { ok: false, field: "name" };
  const name = cleanName(data.name);
  if (!name || name.length > MAX_NAME) return { ok: false, field: "name" };

  let email: string | null = null;
  if (data.email !== undefined && data.email !== null && data.email !== "") {
    if (typeof data.email !== "string") return { ok: false, field: "email" };
    const candidate = data.email.trim();
    if (candidate) {
      if (!isEmail(candidate)) return { ok: false, field: "email" };
      email = candidate;
    }
  }

  if (typeof data.message !== "string") return { ok: false, field: "message" };
  const message = cleanMessage(data.message);
  if (!message || message.length > MAX_MESSAGE) return { ok: false, field: "message" };

  if (typeof data.turnstile !== "string" || !isTurnstileToken(data.turnstile)) {
    return { ok: false, field: "turnstile" };
  }

  return { ok: true, value: { name, email, message }, turnstile: data.turnstile };
}

export function composePing(input: PingInput): ComposedMail {
  const mail: ComposedMail = {
    to: TO_ADDRESS,
    from: { email: FROM_ADDRESS, name: FROM_NAME },
    subject: `[alirustem.com] New PING from ${input.name}`,
    text: [
      "New message from alirustem.com",
      "",
      `Name: ${input.name}`,
      "",
      `Email: ${input.email ?? "Not provided"}`,
      "",
      "Message:",
      "",
      input.message,
      "",
      "---",
      "",
      "Sent through the PING contact form.",
    ].join("\n"),
  };
  if (input.email) mail.replyTo = input.email;
  return mail;
}

export function originAllowed(origin: string | null, hostHeader: string | null): boolean {
  if (!origin) return false;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.origin !== origin || url.username || url.password) return false;

  const hostname = url.hostname;
  if (hostname === "alirustem.com" || hostname === "www.alirustem.com") {
    return url.protocol === "https:";
  }
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return url.protocol === "http:" || url.protocol === "https:";
  }

  const requestHost = (hostHeader ?? "").replace(/:\d+$/, "").toLowerCase();
  return (
    url.protocol === "https:" &&
    hostname.endsWith(".pages.dev") &&
    hostname === requestHost &&
    hostname.split(".").length >= 3
  );
}

export function normalizeIp(raw: string | null): string {
  if (!raw) return "unknown";
  const value = raw.trim();
  if (value.length < 2 || value.length > 64) return "unknown";
  if (!/^[A-Za-z0-9:.]+$/.test(value)) return "unknown";
  return value;
}

export function bearerToken(header: string | null): string {
  if (!header || header.length > 300) return "";
  const match = /^Bearer ([A-Za-z0-9._~+/-]{16,256})$/.exec(header);
  return match?.[1] ?? "";
}

export function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length > 256 || b.length > 256) return false;
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  const length = Math.max(left.length, right.length);
  let mismatch = left.length === right.length ? 0 : 1;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return mismatch === 0;
}

export async function readLimitedBody(
  request: Request,
  max = MAX_BODY_BYTES,
): Promise<{ ok: true; text: string } | { ok: false; status: 400 | 413 }> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    if (!/^\d+$/.test(declared)) return { ok: false, status: 400 };
    if (Number(declared) > max) {
      await request.body?.cancel();
      return { ok: false, status: 413 };
    }
  }
  if (!request.body) return { ok: false, status: 400 };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > max) {
        await reader.cancel();
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400 };
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(bytes) };
}

export async function assessPublicRequest(
  request: Request,
): Promise<{ ok: true; text: string; ip: string } | { ok: false; response: Response }> {
  if (request.method !== "POST") {
    return {
      ok: false,
      response: jsonResponse(405, { ok: false, error: "method" }, { allow: "POST" }),
    };
  }
  if (!originAllowed(request.headers.get("origin"), request.headers.get("host"))) {
    return { ok: false, response: jsonResponse(403, { ok: false, error: "origin" }) };
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return { ok: false, response: jsonResponse(415, { ok: false, error: "unavailable" }) };
  }

  const body = await readLimitedBody(request);
  if (!body.ok) {
    if (body.status === 413) {
      return { ok: false, response: jsonResponse(413, { ok: false, error: "payload" }) };
    }
    return { ok: false, response: jsonResponse(400, { ok: false, error: "invalid", field: "message" }) };
  }
  return { ok: true, text: body.text, ip: normalizeIp(request.headers.get("cf-connecting-ip")) };
}

export async function sanitizeUpstream(response: Response): Promise<Response> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return jsonResponse(502, { ok: false, error: "unavailable" });
  }
  const result = interpretPingResponse(data);
  if (result.ok && !response.ok) {
    return jsonResponse(502, { ok: false, error: "unavailable" });
  }
  return jsonResponse(statusFor(result), result);
}

export type PingDeps = {
  verifyTurnstile: (token: string, ip: string) => Promise<boolean>;
  rateLimit: (ip: string) => Promise<boolean>;
  send: (mail: ComposedMail) => Promise<unknown>;
};

export async function handleAuthorizedPing(bodyText: string, ip: string, deps: PingDeps): Promise<Response> {
  let allowed = false;
  try {
    allowed = await deps.rateLimit(normalizeIp(ip));
  } catch {
    console.error("ping rate limit failed");
    return jsonResponse(503, { ok: false, error: "unavailable" });
  }
  if (!allowed) {
    console.error("ping rate limited");
    return jsonResponse(429, { ok: false, error: "rate" });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return jsonResponse(400, { ok: false, error: "invalid", field: "message" });
  }

  const validated = validatePing(parsed);
  if (!validated.ok) {
    return jsonResponse(400, { ok: false, error: "invalid", field: validated.field });
  }

  let turnstileOk = false;
  try {
    turnstileOk = await deps.verifyTurnstile(validated.turnstile, normalizeIp(ip));
  } catch {
    console.error("ping turnstile unreachable");
    return jsonResponse(503, { ok: false, error: "unavailable" });
  }
  if (!turnstileOk) return jsonResponse(403, { ok: false, error: "turnstile" });

  try {
    await deps.send(composePing(validated.value));
  } catch (error) {
    console.error("ping send failed", errorCode(error));
    return jsonResponse(502, { ok: false, error: "unavailable" });
  }

  console.log("ping accepted");
  return jsonResponse(200, { ok: true });
}

export function turnstileHostAllowed(hostname: string, secret: string): boolean {
  if (!/^[A-Za-z0-9.-]{1,253}$/.test(hostname)) return false;
  if (
    hostname === "alirustem.com" ||
    hostname === "www.alirustem.com" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  ) {
    return true;
  }
  return secret === TURNSTILE_TEST_SECRET && hostname === "example.com";
}

export async function verifyTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  if (!secret || !isTurnstileToken(token)) return false;

  const payload: Record<string, string> = { secret, response: token };
  const remote = normalizeIp(ip);
  if (remote !== "unknown") payload.remoteip = remote;

  let response: Response;
  try {
    response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    console.error("ping turnstile unreachable");
    return false;
  }

  if (!response.ok) {
    console.error("ping turnstile http", response.status);
    return false;
  }

  let result: { success?: unknown; hostname?: unknown; "error-codes"?: unknown };
  try {
    result = await response.json();
  } catch {
    console.error("ping turnstile rejected", "bad-json");
    return false;
  }

  if (result.success !== true || typeof result.hostname !== "string") {
    console.error("ping turnstile rejected", safeCodes(result["error-codes"]));
    return false;
  }
  if (!turnstileHostAllowed(result.hostname, secret)) {
    console.error("ping turnstile rejected", "host");
    return false;
  }
  return true;
}

function cleanName(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F\u2028\u2029]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function cleanMessage(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[\r\u2028\u2029]/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function isEmail(value: string): boolean {
  if (value.length > MAX_EMAIL || value.length < 5) return false;
  if (/[\s\u0000-\u001F\u007F\u2028\u2029]/.test(value)) return false;
  const at = value.indexOf("@");
  if (at <= 0 || at !== value.lastIndexOf("@")) return false;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (local.length > 64 || domain.length > 253) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..") || domain.includes("@")) {
    return false;
  }
  const tld = domain.slice(domain.lastIndexOf(".") + 1);
  if (tld.length < 2) return false;
  return EMAIL_PATTERN.test(value);
}

function isTurnstileToken(value: string): boolean {
  return value.length <= MAX_TURNSTILE_TOKEN && TOKEN_PATTERN.test(value);
}

function isField(value: unknown): value is PingField {
  return value === "name" || value === "email" || value === "message" || value === "turnstile";
}

function publicError(value: unknown): "rate" | "turnstile" | "unavailable" | "payload" | null {
  if (value === "rate" || value === "turnstile" || value === "unavailable" || value === "payload") {
    return value;
  }
  return null;
}

function errorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === "string" && /^[A-Z0-9_]{1,64}$/.test(code)) return code;
  }
  return "send_failed";
}

function safeCodes(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .filter((item): item is string => typeof item === "string" && /^[a-z0-9-]{1,40}$/.test(item))
    .slice(0, 4)
    .join(",");
}
