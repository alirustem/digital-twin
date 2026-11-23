import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import worker from "../worker/dashboard-worker.js";
import {
  FROM_ADDRESS,
  FROM_NAME,
  MAX_MESSAGE,
  MAX_NAME,
  TO_ADDRESS,
  TURNSTILE_TEST_SECRET,
  assessPublicRequest,
  bearerToken,
  composePing,
  handleAuthorizedPing,
  interpretPingResponse,
  normalizeIp,
  originAllowed,
  safeEqual,
  sanitizeUpstream,
  turnstileHostAllowed,
  validatePing,
  verifyTurnstile,
  type ComposedMail,
  type PingDeps,
} from "./ping.ts";

const TOKEN = "XXXX.DUMMY.TOKEN.XXXX";
const MESSAGE = "Hi Ali,\n\nI visited your website and wanted to discuss a potential opportunity.";

function payload(overrides: Record<string, unknown> = {}) {
  return {
    name: "John Smith",
    email: "john@example.com",
    message: "Hello from the lab.",
    turnstile: TOKEN,
    ...overrides,
  };
}

async function silence<T>(fn: () => Promise<T>) {
  const errors: string[] = [];
  const logs: string[] = [];
  const originalError = console.error;
  const originalLog = console.log;
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
  };
  console.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };
  try {
    return { result: await fn(), errors, logs };
  } finally {
    console.error = originalError;
    console.log = originalLog;
  }
}

async function submit(raw: unknown, patch: Partial<PingDeps> = {}) {
  const sent: ComposedMail[] = [];
  let checks = 0;
  const deps: PingDeps = {
    verifyTurnstile: async () => {
      checks += 1;
      return true;
    },
    rateLimit: async () => true,
    send: async (mail) => {
      sent.push(mail);
    },
    ...patch,
  };
  const traced = await silence(() => handleAuthorizedPing(JSON.stringify(raw), "203.0.113.8", deps));
  return {
    status: traced.result.status,
    body: await traced.result.json(),
    sent,
    checks,
    errors: traced.errors,
    logs: traced.logs,
  };
}

function requestFor(
  method: string,
  origin: string | null,
  body?: string,
  headers: Record<string, string> = {},
) {
  return new Request("https://alirustem.com/api/ping", {
    method,
    headers: {
      host: "alirustem.com",
      ...(origin ? { origin } : {}),
      "content-type": "application/json",
      "cf-connecting-ip": "203.0.113.8",
      ...headers,
    },
    body: method === "GET" || method === "HEAD" ? undefined : body,
  });
}

describe("email composition", () => {
  it("builds the plain-text ping with a reply-to address", () => {
    const mail = composePing({ name: "John Smith", email: "john@example.com", message: MESSAGE });
    assert.equal(mail.subject, "[alirustem.com] New PING from John Smith");
    assert.equal(mail.to, TO_ADDRESS);
    assert.deepEqual(mail.from, { email: FROM_ADDRESS, name: FROM_NAME });
    assert.equal(mail.replyTo, "john@example.com");
    assert.equal(
      mail.text,
      `New message from alirustem.com\n\nName: John Smith\n\nEmail: john@example.com\n\nMessage:\n\n${MESSAGE}\n\n---\n\nSent through the PING contact form.`,
    );
  });

  it("marks a missing email as not provided and omits reply-to", () => {
    const mail = composePing({ name: "John Smith", email: null, message: "Hello" });
    assert.equal(mail.replyTo, undefined);
    assert.match(mail.text, /Email: Not provided/);
    assert.equal(mail.from.email, FROM_ADDRESS);
    assert.equal(mail.to, TO_ADDRESS);
  });

  it("keeps a visitor name with a line break on one subject line", () => {
    const validated = validatePing(payload({ name: "John\r\nBcc: evil@example.com" }));
    assert.equal(validated.ok, true);
    if (!validated.ok) return;
    const mail = composePing(validated.value);
    assert.equal(mail.subject, "[alirustem.com] New PING from John Bcc: evil@example.com");
    assert.equal(mail.text.split("\n")[2], "Name: John Bcc: evil@example.com");
    assert.equal(mail.text.includes("\r"), false);
    assert.equal(mail.from.email, FROM_ADDRESS);
  });
});

describe("submissions", () => {
  it("accepts a name, email, and message without putting the token in the mail", async () => {
    const outcome = await submit(payload({ message: MESSAGE }));
    assert.equal(outcome.status, 200);
    assert.deepEqual(outcome.body, { ok: true });
    assert.equal(outcome.sent.length, 1);
    assert.equal(outcome.sent[0].to, TO_ADDRESS);
    assert.equal(outcome.sent[0].from.email, FROM_ADDRESS);
    assert.equal(outcome.sent[0].replyTo, "john@example.com");
    assert.equal(outcome.sent[0].subject, "[alirustem.com] New PING from John Smith");
    assert.match(outcome.sent[0].text, /Email: john@example.com/);
    assert.equal(JSON.stringify(outcome.sent[0]).includes(TOKEN), false);
    assert.deepEqual(outcome.logs, ["ping accepted"]);
    assert.equal(outcome.logs.join(" ").includes("john@example.com"), false);
    assert.equal(outcome.logs.join(" ").includes("Hi Ali"), false);
  });

  it("accepts a submission with no email address", async () => {
    const { email: _email, ...withoutEmail } = payload();
    const outcome = await submit(withoutEmail);
    assert.equal(outcome.status, 200);
    assert.equal(outcome.sent[0].replyTo, undefined);
    assert.match(outcome.sent[0].text, /Email: Not provided/);
    assert.equal(outcome.sent[0].to, TO_ADDRESS);
  });

  it("treats a blank email as not provided", async () => {
    const outcome = await submit(payload({ email: "   " }));
    assert.equal(outcome.status, 200);
    assert.equal(outcome.sent[0].replyTo, undefined);
    assert.match(outcome.sent[0].text, /Email: Not provided/);
  });

  it("rejects an empty name", async () => {
    for (const name of ["", "   ", "\r\n\t"]) {
      const outcome = await submit(payload({ name }));
      assert.equal(outcome.status, 400, JSON.stringify(name));
      assert.equal(outcome.body.field, "name");
      assert.equal(outcome.sent.length, 0);
      assert.equal(outcome.checks, 0);
    }
  });

  it("rejects an empty message", async () => {
    const outcome = await submit(payload({ message: " \n\t " }));
    assert.equal(outcome.status, 400);
    assert.equal(outcome.body.field, "message");
    assert.equal(outcome.sent.length, 0);
  });

  it("rejects invalid email addresses", async () => {
    for (const email of ["not-an-email", "a@b", "a@b.c", "john @example.com", "john@example.com\r\nBcc: x@y.co"]) {
      const outcome = await submit(payload({ email }));
      assert.equal(outcome.status, 400, email);
      assert.equal(outcome.body.field, "email");
      assert.equal(outcome.sent.length, 0);
    }
  });

  it("rejects a message longer than 3000 characters and accepts one at the limit", async () => {
    const tooLong = await submit(payload({ message: "a".repeat(MAX_MESSAGE + 1) }));
    assert.equal(tooLong.status, 400);
    assert.equal(tooLong.body.field, "message");
    assert.equal(tooLong.sent.length, 0);

    const exact = await submit(payload({ message: "a".repeat(MAX_MESSAGE), email: "" }));
    assert.equal(exact.status, 200);
    assert.match(exact.sent[0].text, new RegExp(`Message:\\n\\n${"a".repeat(MAX_MESSAGE)}\\n`));
  });

  it("rejects a name longer than 100 characters and accepts one at the limit", async () => {
    const tooLong = await submit(payload({ name: "A".repeat(MAX_NAME + 1) }));
    assert.equal(tooLong.body.field, "name");
    const exact = await submit(payload({ name: "A".repeat(MAX_NAME), email: "" }));
    assert.equal(exact.status, 200);
    assert.equal(exact.sent[0].subject, `[alirustem.com] New PING from ${"A".repeat(MAX_NAME)}`);
  });

  it("rejects a malformed turnstile token before verification", async () => {
    const outcome = await submit(payload({ turnstile: "not a token" }));
    assert.equal(outcome.status, 400);
    assert.equal(outcome.body.field, "turnstile");
    assert.equal(outcome.checks, 0);
    assert.equal(outcome.sent.length, 0);
  });

  it("rejects a turnstile token the verifier refuses", async () => {
    let checks = 0;
    const outcome = await submit(payload(), {
      verifyTurnstile: async () => {
        checks += 1;
        return false;
      },
    });
    assert.equal(outcome.status, 403);
    assert.deepEqual(outcome.body, { ok: false, error: "turnstile" });
    assert.equal(checks, 1);
    assert.equal(outcome.sent.length, 0);
  });

  it("rate-limits a duplicate submission", async () => {
    let seen = 0;
    const rateLimit = async () => {
      seen += 1;
      return seen === 1;
    };
    const first = await submit(payload(), { rateLimit });
    const second = await submit(payload(), { rateLimit });
    assert.equal(first.status, 200);
    assert.equal(first.sent.length, 1);
    assert.equal(second.status, 429);
    assert.deepEqual(second.body, { ok: false, error: "rate" });
    assert.equal(second.sent.length, 0);
    assert.equal(second.logs.join(" ").includes("john@example.com"), false);
  });

  it("ignores a caller-supplied recipient and sender", async () => {
    const outcome = await submit({
      ...payload(),
      to: "evil@example.com",
      from: "spoofer@evil.com",
      replyTo: "also-evil@example.com",
    });
    assert.equal(outcome.sent[0].to, TO_ADDRESS);
    assert.equal(outcome.sent[0].from.email, FROM_ADDRESS);
    assert.equal(outcome.sent[0].replyTo, "john@example.com");
  });

  it("preserves message line breaks and a unicode name", async () => {
    const outcome = await submit(payload({ name: "علي", email: "", message: "Line one\r\nLine two" }));
    assert.equal(outcome.status, 200);
    assert.match(outcome.sent[0].subject, /علي$/);
    assert.match(outcome.sent[0].text, /Line one\nLine two/);
    assert.match(outcome.sent[0].text, /Email: Not provided/);
  });

  it("logs only an error code when sending fails", async () => {
    const outcome = await submit(payload(), {
      send: async () => {
        const error = new Error("mailbox alooshe.rstm@gmail.com rejected Hello from the lab.");
        (error as { code?: string }).code = "E_DELIVERY_FAILED";
        throw error;
      },
    });
    assert.equal(outcome.status, 502);
    assert.deepEqual(outcome.body, { ok: false, error: "unavailable" });
    assert.ok(outcome.errors.some((line) => line.includes("E_DELIVERY_FAILED")));
    assert.ok(outcome.errors.every((line) => !line.includes("alooshe") && !line.includes("Hello from the lab")));
  });

  it("does not log an unsafe error code or a rate-limit exception", async () => {
    const leaked = await submit(payload(), {
      send: async () => {
        throw Object.assign(new Error("john@example.com"), { code: "leaked john@example.com" });
      },
    });
    assert.ok(leaked.errors.some((line) => line.includes("send_failed")));
    assert.ok(leaked.errors.every((line) => !line.includes("john@example.com")));

    const limited = await submit(payload(), {
      rateLimit: async () => {
        throw new Error("203.0.113.8");
      },
    });
    assert.equal(limited.status, 503);
    assert.equal(limited.sent.length, 0);
    assert.ok(limited.errors.every((line) => !line.includes("203.0.113.8")));
  });

  it("rejects invalid JSON without sending", async () => {
    const sent: ComposedMail[] = [];
    const traced = await silence(() =>
      handleAuthorizedPing("{", "203.0.113.8", {
        verifyTurnstile: async () => true,
        rateLimit: async () => true,
        send: async (mail) => {
          sent.push(mail);
        },
      }),
    );
    assert.equal(traced.result.status, 400);
    assert.equal(sent.length, 0);
  });
});

describe("public request guard", () => {
  it("allows the production origin and returns a normalized address", async () => {
    const assessed = await assessPublicRequest(requestFor("POST", "https://alirustem.com", "{\"ok\":true}"));
    assert.equal(assessed.ok, true);
    if (!assessed.ok) return;
    assert.equal(assessed.text, "{\"ok\":true}");
    assert.equal(assessed.ip, "203.0.113.8");
  });

  it("rejects the wrong method, origin, content type, and oversized body", async () => {
    const method = await assessPublicRequest(requestFor("GET", "https://alirustem.com"));
    assert.equal(method.ok, false);
    if (!method.ok) assert.equal(method.response.status, 405);

    const origin = await assessPublicRequest(requestFor("POST", "https://evil.example", "{}"));
    assert.equal(origin.ok, false);
    if (!origin.ok) assert.equal(origin.response.status, 403);

    const missing = await assessPublicRequest(requestFor("POST", null, "{}"));
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.response.status, 403);

    const type = await assessPublicRequest(
      requestFor("POST", "https://alirustem.com", "{}", { "content-type": "text/plain" }),
    );
    assert.equal(type.ok, false);
    if (!type.ok) assert.equal(type.response.status, 415);

    const oversized = await assessPublicRequest(requestFor("POST", "https://alirustem.com", "x".repeat(20_000)));
    assert.equal(oversized.ok, false);
    if (!oversized.ok) {
      assert.equal(oversized.response.status, 413);
      assert.deepEqual(await oversized.response.json(), { ok: false, error: "payload" });
    }
  });

  it("drops a header-injected address", () => {
    assert.equal(normalizeIp("203.0.113.8"), "203.0.113.8");
    assert.equal(normalizeIp("203.0.113.8\r\nX-Evil: 1"), "unknown");
    assert.equal(normalizeIp("not an ip"), "unknown");
    assert.equal(normalizeIp(""), "unknown");
  });

  it("allows localhost and matching pages.dev hosts only", () => {
    assert.equal(originAllowed("https://alirustem.com", "alirustem.com"), true);
    assert.equal(originAllowed("https://www.alirustem.com", "www.alirustem.com"), true);
    assert.equal(originAllowed("http://alirustem.com", "alirustem.com"), false);
    assert.equal(originAllowed("http://localhost:3000", "localhost:3000"), true);
    assert.equal(originAllowed("http://127.0.0.1:8787", "127.0.0.1:8787"), true);
    assert.equal(originAllowed("https://digital-twin.pages.dev", "digital-twin.pages.dev"), true);
    assert.equal(originAllowed("https://digital-twin.pages.dev", "alirustem.com"), false);
    assert.equal(originAllowed("https://evil.example", "evil.example"), false);
    assert.equal(originAllowed("https://alirustem.com.evil.com", "alirustem.com.evil.com"), false);
    assert.equal(originAllowed("https://notpages.dev", "notpages.dev"), false);
    assert.equal(originAllowed(null, "alirustem.com"), false);
  });
});

describe("response sanitizing", () => {
  it("removes message content and addresses from upstream responses", async () => {
    const dirty = new Response(
      JSON.stringify({
        ok: false,
        error: "unavailable",
        email: "john@example.com",
        message: "secret message",
        stack: "Error at send",
      }),
      { status: 502 },
    );
    const clean = await sanitizeUpstream(dirty);
    assert.equal(clean.status, 502);
    assert.deepEqual(await clean.json(), { ok: false, error: "unavailable" });

    const lying = new Response(JSON.stringify({ ok: true, text: "secret message" }), { status: 500 });
    const rejected = await sanitizeUpstream(lying);
    assert.equal(rejected.status, 502);
    assert.deepEqual(await rejected.json(), { ok: false, error: "unavailable" });

    const accepted = new Response(JSON.stringify({ ok: true, messageId: "abc", text: "secret" }), { status: 200 });
    assert.deepEqual(await (await sanitizeUpstream(accepted)).json(), { ok: true });
    assert.deepEqual(interpretPingResponse({ ok: false, error: "method", email: "john@example.com" }), {
      ok: false,
      error: "unavailable",
    });
  });
});

describe("turnstile", () => {
  it("accepts the site hostname and the documented test hostname only for the test secret", () => {
    assert.equal(turnstileHostAllowed("alirustem.com", "real-secret"), true);
    assert.equal(turnstileHostAllowed("www.alirustem.com", "real-secret"), true);
    assert.equal(turnstileHostAllowed("localhost", "real-secret"), true);
    assert.equal(turnstileHostAllowed("example.com", "real-secret"), false);
    assert.equal(turnstileHostAllowed("example.com", TURNSTILE_TEST_SECRET), true);
    assert.equal(turnstileHostAllowed("evil.example", TURNSTILE_TEST_SECRET), false);
  });

  it("verifies a token server-side and does not log the token or secret", async () => {
    const original = globalThis.fetch;
    const originalError = console.error;
    const errors: string[] = [];
    const calls: { url: string; body: Record<string, string> }[] = [];
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    };
    globalThis.fetch = async (input, init) => {
      calls.push({ url: String(input), body: JSON.parse(String(init?.body)) });
      return new Response(JSON.stringify({ success: true, hostname: "alirustem.com" }));
    };
    try {
      assert.equal(await verifyTurnstile(TOKEN, "203.0.113.8", "real-secret"), true);
      assert.equal(calls[0].url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
      assert.equal(calls[0].body.response, TOKEN);
      assert.equal(calls[0].body.remoteip, "203.0.113.8");
      assert.equal(calls[0].body.secret, "real-secret");

      calls.length = 0;
      globalThis.fetch = async () => new Response(JSON.stringify({ success: true, hostname: "example.com" }));
      assert.equal(await verifyTurnstile(TOKEN, "unknown", TURNSTILE_TEST_SECRET), true);
      assert.equal(calls.length, 0);

      globalThis.fetch = async (_input, init) => {
        const body = JSON.parse(String(init?.body)) as { remoteip?: string };
        assert.equal(body.remoteip, undefined);
        return new Response(JSON.stringify({ success: true, hostname: "example.com" }));
      };
      assert.equal(await verifyTurnstile(TOKEN, "unknown", TURNSTILE_TEST_SECRET), true);

      globalThis.fetch = async () => new Response(JSON.stringify({ success: true, hostname: "example.com" }));
      assert.equal(await verifyTurnstile(TOKEN, "203.0.113.8", "real-secret"), false);

      globalThis.fetch = async () =>
        new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response", "john@example.com"] }));
      assert.equal(await verifyTurnstile(TOKEN, "203.0.113.8", "real-secret"), false);

      globalThis.fetch = async () => {
        throw new Error(`network ${TOKEN} real-secret`);
      };
      assert.equal(await verifyTurnstile(TOKEN, "203.0.113.8", "real-secret"), false);

      let called = false;
      globalThis.fetch = async () => {
        called = true;
        return new Response("{}");
      };
      assert.equal(await verifyTurnstile("not a token", "203.0.113.8", "real-secret"), false);
      assert.equal(await verifyTurnstile(TOKEN, "203.0.113.8", ""), false);
      assert.equal(called, false);
    } finally {
      globalThis.fetch = original;
      console.error = originalError;
    }
    const logged = errors.join("\n");
    assert.equal(logged.includes(TOKEN), false);
    assert.equal(logged.includes("real-secret"), false);
    assert.equal(logged.includes("john@example.com"), false);
    assert.match(logged, /invalid-input-response/);
  });
});

describe("secrets and binding configuration", () => {
  it("compares the internal token without accepting header injection", () => {
    const token = "ab".repeat(16);
    assert.equal(safeEqual(token, token), true);
    assert.equal(safeEqual(token, `${token.slice(0, -1)}c`), false);
    assert.equal(safeEqual(token, token.slice(0, -1)), false);
    assert.equal(safeEqual("", token), false);
    assert.equal(safeEqual("a".repeat(300), "a".repeat(300)), false);
    assert.equal(bearerToken(`Bearer ${token}`), token);
    assert.equal(bearerToken("Bearer short"), "");
    assert.equal(bearerToken("Bearer abc\r\nX-Evil: 1"), "");
    assert.equal(bearerToken(null), "");
  });

  it("locks the worker binding to the fixed mailbox and keeps it off the public internet", () => {
    const wrangler = readFileSync(new URL("../worker/wrangler.jsonc", import.meta.url), "utf8");
    const worker = readFileSync(new URL("../worker/src/index.ts", import.meta.url), "utf8");
    const proxy = readFileSync(new URL("../functions/api/ping.ts", import.meta.url), "utf8");
    assert.match(wrangler, /"destination_address": "alooshe\.rstm@gmail\.com"/);
    assert.match(wrangler, /"allowed_sender_addresses": \["ping@alirustem\.com"\]/);
    assert.match(wrangler, /"workers_dev": false/);
    assert.doesNotMatch(wrangler, /"routes"/);
    assert.match(worker, /TO_ADDRESS/);
    assert.match(worker, /FROM_ADDRESS/);
    assert.match(proxy, /MAILER/);
    assert.match(proxy, /alirustem-ping-mailer/);
    assert.equal(TO_ADDRESS, "alooshe.rstm@gmail.com");
    assert.equal(FROM_ADDRESS, "ping@alirustem.com");
  });
});

const DASHBOARD_TOKEN = "ab".repeat(16);

function dashboardEnv(patch: Record<string, unknown> = {}) {
  const sent: ComposedMail[] = [];
  const env = {
    PING_INTERNAL_TOKEN: DASHBOARD_TOKEN,
    TURNSTILE_SECRET_KEY: "real-secret",
    PING_LIMIT: { async limit() { return { success: true }; } },
    EMAIL: {
      async send(mail: ComposedMail) {
        sent.push(mail);
        return { messageId: "1" };
      },
    },
    ...patch,
  };
  return { env, sent };
}

function dashboardRequest(body: unknown, token = DASHBOARD_TOKEN) {
  return new Request("https://alirustem-ping-mailer/send", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
      "x-ping-ip": "203.0.113.8",
    },
    body: JSON.stringify(body),
  });
}

async function withTurnstile(hostname: string, success: boolean, fn: () => Promise<void>) {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ success, hostname, "error-codes": success ? [] : ["invalid-input-response"] }));
  try {
    await fn();
  } finally {
    globalThis.fetch = original;
  }
}

describe("dashboard worker", () => {
  it("is a single module with the mailbox locked in code and no deployed secrets", () => {
    const source = readFileSync(new URL("../worker/dashboard-worker.js", import.meta.url), "utf8");
    assert.match(source, /export default/);
    assert.doesNotMatch(source, /^import /m);
    assert.doesNotMatch(source, /\binterface\b/);
    assert.match(source, /const TO_ADDRESS = "alooshe\.rstm@gmail\.com"/);
    assert.match(source, /const FROM_ADDRESS = "ping@alirustem\.com"/);
    assert.match(source, /mail\.to !== TO_ADDRESS \|\| mail\.from\.email !== FROM_ADDRESS/);
    assert.match(source, /to: TO_ADDRESS/);
    assert.match(source, /email: FROM_ADDRESS/);
    assert.doesNotMatch(source, /TURNSTILE_SECRET_KEY\s*=\s*["']/);
    assert.doesNotMatch(source, /PING_INTERNAL_TOKEN\s*=\s*["']/);
  });

  it("accepts the same request the Pages function forwards", async () => {
    await withTurnstile("alirustem.com", true, async () => {
      const { env, sent } = dashboardEnv();
      const traced = await silence(() => worker.fetch(dashboardRequest(payload({ message: MESSAGE })), env));
      assert.equal(traced.result.status, 200);
      assert.deepEqual(await traced.result.json(), { ok: true });
      assert.equal(sent.length, 1);
      assert.equal(sent[0].to, "alooshe.rstm@gmail.com");
      assert.deepEqual(sent[0].from, { email: "ping@alirustem.com", name: "alirustem.com" });
      assert.equal(sent[0].replyTo, "john@example.com");
      assert.equal(sent[0].subject, "[alirustem.com] New PING from John Smith");
      assert.match(sent[0].text, /Email: john@example.com/);
      assert.equal(JSON.stringify(sent[0]).includes(TOKEN), false);
    });
  });

  it("sends Not provided when the Pages payload omits an email", async () => {
    await withTurnstile("alirustem.com", true, async () => {
      const { email: _email, ...withoutEmail } = payload();
      const { env, sent } = dashboardEnv();
      const traced = await silence(() => worker.fetch(dashboardRequest(withoutEmail), env));
      assert.equal(traced.result.status, 200);
      assert.equal(sent[0].replyTo, undefined);
      assert.match(sent[0].text, /Email: Not provided/);
      assert.equal(sent[0].to, "alooshe.rstm@gmail.com");
    });
  });

  it("rejects empty fields, a bad email, a bad turnstile token, and a duplicate", async () => {
    await withTurnstile("alirustem.com", true, async () => {
      const emptyName = dashboardEnv();
      const name = await silence(() => worker.fetch(dashboardRequest(payload({ name: "  " })), emptyName.env));
      assert.equal(name.result.status, 400);
      assert.equal((await name.result.json()).field, "name");
      assert.equal(emptyName.sent.length, 0);

      const emptyMessage = dashboardEnv();
      const message = await silence(() =>
        worker.fetch(dashboardRequest(payload({ message: " \n " })), emptyMessage.env),
      );
      assert.equal((await message.result.json()).field, "message");
      assert.equal(emptyMessage.sent.length, 0);

      const badEmail = dashboardEnv();
      const email = await silence(() =>
        worker.fetch(dashboardRequest(payload({ email: "john@example.com\r\nBcc: x@y.co" })), badEmail.env),
      );
      assert.equal((await email.result.json()).field, "email");
      assert.equal(badEmail.sent.length, 0);
    });

    await withTurnstile("alirustem.com", false, async () => {
      const { env, sent } = dashboardEnv();
      const traced = await silence(() => worker.fetch(dashboardRequest(payload()), env));
      assert.equal(traced.result.status, 403);
      assert.deepEqual(await traced.result.json(), { ok: false, error: "turnstile" });
      assert.equal(sent.length, 0);
    });

    await withTurnstile("alirustem.com", true, async () => {
      const { env, sent } = dashboardEnv({
        PING_LIMIT: { async limit() { return { success: false }; } },
      });
      const traced = await silence(() => worker.fetch(dashboardRequest(payload()), env));
      assert.equal(traced.result.status, 429);
      assert.equal(sent.length, 0);
    });
  });

  it("rejects a caller who does not present the internal token", async () => {
    const missing = dashboardEnv({ PING_INTERNAL_TOKEN: "" });
    const unconfigured = await silence(() => worker.fetch(dashboardRequest(payload(), DASHBOARD_TOKEN), missing.env));
    assert.equal(unconfigured.result.status, 503);

    const { env, sent } = dashboardEnv();
    const rejected = await silence(() => worker.fetch(dashboardRequest(payload(), "cd".repeat(16)), env));
    assert.equal(rejected.result.status, 401);
    assert.equal(sent.length, 0);

    const method = await worker.fetch(new Request("https://alirustem-ping-mailer/send", { method: "GET" }), env);
    assert.equal(method.status, 405);
  });
});
