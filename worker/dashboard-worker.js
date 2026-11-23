// Paste this whole file into the alirustem-ping-mailer module editor.
// Bindings and secrets stay in the dashboard. This file does not contain them.
// EMAIL: send_email binding. PING_LIMIT: rate limit, namespace 71021, 5 per 60 seconds.
// Secrets: TURNSTILE_SECRET_KEY, PING_INTERNAL_TOKEN.

const TO_ADDRESS = "alooshe.rstm@gmail.com";
const FROM_ADDRESS = "ping@alirustem.com";
const FROM_NAME = "alirustem.com";

const MAX_NAME = 100;
const MAX_MESSAGE = 3000;
const MAX_EMAIL = 254;
const MAX_BODY_BYTES = 16384;
const MAX_TURNSTILE_TOKEN = 2048;

// Cloudflare's published dummy secret. It only accepts the dummy token.
const TURNSTILE_TEST_SECRET = "1x0000000000000000000000000000000AA";
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TOKEN_PATTERN = /^[A-Za-z0-9._-]{1,2048}$/;
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function jsonResponse(status, body, extra) {
  const headers = new Headers(extra);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-robots-tag", "noindex");
  return new Response(JSON.stringify(body), { status, headers });
}

function cleanName(value) {
  return value
    .replace(/[\u0000-\u001F\u007F\u2028\u2029]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function cleanMessage(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[\r\u2028\u2029]/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function isEmail(value) {
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

function isTurnstileToken(value) {
  return value.length <= MAX_TURNSTILE_TOKEN && TOKEN_PATTERN.test(value);
}

function validatePing(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, field: "message" };
  }

  if (typeof raw.name !== "string") return { ok: false, field: "name" };
  const name = cleanName(raw.name);
  if (!name || name.length > MAX_NAME) return { ok: false, field: "name" };

  let email = null;
  if (raw.email !== undefined && raw.email !== null && raw.email !== "") {
    if (typeof raw.email !== "string") return { ok: false, field: "email" };
    const candidate = raw.email.trim();
    if (candidate) {
      if (!isEmail(candidate)) return { ok: false, field: "email" };
      email = candidate;
    }
  }

  if (typeof raw.message !== "string") return { ok: false, field: "message" };
  const message = cleanMessage(raw.message);
  if (!message || message.length > MAX_MESSAGE) return { ok: false, field: "message" };

  if (typeof raw.turnstile !== "string" || !isTurnstileToken(raw.turnstile)) {
    return { ok: false, field: "turnstile" };
  }

  return { ok: true, value: { name, email, message }, turnstile: raw.turnstile };
}

function composePing(input) {
  const mail = {
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

function normalizeIp(raw) {
  if (!raw) return "unknown";
  const value = raw.trim();
  if (value.length < 2 || value.length > 64) return "unknown";
  if (!/^[A-Za-z0-9:.]+$/.test(value)) return "unknown";
  return value;
}

function bearerToken(header) {
  if (!header || header.length > 300) return "";
  const match = /^Bearer ([A-Za-z0-9._~+/-]{16,256})$/.exec(header);
  return match ? match[1] : "";
}

function safeEqual(a, b) {
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

async function readLimitedBody(request, max = MAX_BODY_BYTES) {
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
  const chunks = [];
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

function errorCode(error) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = error.code;
    if (typeof code === "string" && /^[A-Z0-9_]{1,64}$/.test(code)) return code;
  }
  return "send_failed";
}

function safeCodes(value) {
  if (!Array.isArray(value)) return "";
  return value
    .filter((item) => typeof item === "string" && /^[a-z0-9-]{1,40}$/.test(item))
    .slice(0, 4)
    .join(",");
}

function turnstileHostAllowed(hostname, secret) {
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

async function verifyTurnstile(token, ip, secret) {
  if (!secret || !isTurnstileToken(token)) return false;

  const payload = { secret, response: token };
  const remote = normalizeIp(ip);
  if (remote !== "unknown") payload.remoteip = remote;

  let response;
  try {
    response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    console.error("ping turnstile unreachable");
    return false;
  }

  if (!response.ok) {
    console.error("ping turnstile http", response.status);
    return false;
  }

  let result;
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

async function handleAuthorizedPing(bodyText, ip, deps) {
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

  let parsed;
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

export default {
  async fetch(request, env) {
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
          blocked.code = "E_RECIPIENT_NOT_ALLOWED";
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
