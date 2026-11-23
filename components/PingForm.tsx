"use client";

import { interpretPingResponse, MAX_MESSAGE, MAX_NAME, validatePing, type PingField } from "@/lib/ping";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SCRIPT_ID = "cf-turnstile-api";

const SUCCESS = "PING received. No packets lost. I'll get back to you when the routing table allows.";
const TIMEOUT = "Request timed out. Even my contact form has networking problems. Try again?";

const FIELD_COPY: Record<PingField, string> = {
  name: "Name is required, and it has to fit in 100 characters.",
  email: "That email address does not look routable. Leave it blank if you would rather not share one.",
  message: "A message is required, with a maximum of 3,000 characters.",
  turnstile: "The routing check failed. Refresh and try again.",
};

const FORM_COPY = {
  rate: "Too many PINGs from this path. Wait a minute and try again.",
  turnstile: FIELD_COPY.turnstile,
  payload: "That PING is too large to route.",
  unavailable: TIMEOUT,
};

interface TurnstileApi {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme: "dark";
      size: "flexible";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

type FieldErrors = Partial<Record<PingField, string>>;
type Status = { kind: "success" | "error"; text: string } | null;
type FocusTarget = PingField | "status" | null;

function getTurnstile(): TurnstileApi | undefined {
  return (window as Window & { turnstile?: TurnstileApi }).turnstile;
}

export function PingForm() {
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const statusId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);
  const inflight = useRef(false);
  const widgetHost = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const statusRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const pendingFocus = useRef<FocusTarget>(null);

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    if (target === "status") statusRef.current?.focus();
    if (target === "name") nameRef.current?.focus();
    if (target === "email") emailRef.current?.focus();
    if (target === "message") messageRef.current?.focus();
    if (target === "turnstile") widgetHost.current?.focus();
  }, [status, errors]);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    const render = () => {
      const api = getTurnstile();
      if (cancelled || widgetId.current || !api || !widgetHost.current) return;
      try {
        widgetId.current = api.render(widgetHost.current, {
          sitekey: SITE_KEY,
          theme: "dark",
          size: "flexible",
          callback: (next) => setToken(next),
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      } catch {
        setToken("");
      }
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);
    if (getTurnstile()) render();

    return () => {
      cancelled = true;
      script?.removeEventListener("load", render);
      const id = widgetId.current;
      widgetId.current = undefined;
      if (id) getTurnstile()?.remove(id);
    };
  }, []);

  function clearError(field: PingField) {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }

  function resetWidget() {
    const id = widgetId.current;
    if (id) getTurnstile()?.reset(id);
    setToken("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inflight.current) return;
    inflight.current = true;
    setSending(true);
    setStatus(null);
    setErrors({});

    const validated = validatePing({
      name,
      email: email.trim(),
      message,
      turnstile: token,
    });
    if (!validated.ok) {
      const text = FIELD_COPY[validated.field];
      if (validated.field === "turnstile") {
        pendingFocus.current = "status";
        setStatus({ kind: "error", text });
      } else {
        pendingFocus.current = validated.field;
        setErrors({ [validated.field]: text });
      }
      inflight.current = false;
      setSending(false);
      return;
    }

    let attempted = false;
    try {
      attempted = true;
      const response = await fetch("/api/ping", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim(),
          message,
          turnstile: token,
        }),
        credentials: "omit",
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      });
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      const result = interpretPingResponse(data);
      if (result.ok) {
        setMessage("");
        pendingFocus.current = "status";
        setStatus({ kind: "success", text: SUCCESS });
        return;
      }
      if (result.error === "invalid" && result.field !== "turnstile") {
        pendingFocus.current = result.field;
        setErrors({ [result.field]: FIELD_COPY[result.field] });
        return;
      }
      const text = result.error === "invalid" ? FIELD_COPY.turnstile : FORM_COPY[result.error];
      pendingFocus.current = "status";
      setStatus({ kind: "error", text });
    } catch {
      pendingFocus.current = "status";
      setStatus({ kind: "error", text: TIMEOUT });
    } finally {
      if (attempted) resetWidget();
      inflight.current = false;
      setSending(false);
    }
  }

  return (
    <form
      className="mt-6 w-full min-w-0 max-w-2xl border border-phosphor/40 bg-panel p-5 md:p-6"
      aria-label="Contact form"
      aria-busy={sending || undefined}
      noValidate
      onSubmit={onSubmit}
    >
      <p className="font-mono text-sm text-phosphor">$ transmit --ping</p>

      <div className="mt-4">
        <label htmlFor={nameId} className="font-mono text-xs tracking-[0.16em] text-amber">
          NAME <span className="sr-only">required</span>
        </label>
        <input
          ref={nameRef}
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          required
          maxLength={MAX_NAME}
          value={name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : `${nameId}-hint`}
          className="lab-field mt-2"
          onChange={(event) => {
            setName(event.target.value);
            clearError("name");
          }}
        />
        <p id={`${nameId}-hint`} className="sr-only">
          Required. Maximum 100 characters.
        </p>
        {errors.name ? (
          <p id={`${nameId}-error`} className="mt-2 font-mono text-sm text-amber">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <label htmlFor={emailId} className="font-mono text-xs tracking-[0.16em] text-amber">
          EMAIL <span className="text-dim">OPTIONAL</span>
        </label>
        <input
          ref={emailRef}
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={254}
          value={email}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : `${emailId}-hint`}
          className="lab-field mt-2"
          onChange={(event) => {
            setEmail(event.target.value);
            clearError("email");
          }}
        />
        <p id={`${emailId}-hint`} className="sr-only">
          Optional. Leave blank if you do not want to share an email address.
        </p>
        {errors.email ? (
          <p id={`${emailId}-error`} className="mt-2 font-mono text-sm text-amber">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <label htmlFor={messageId} className="font-mono text-xs tracking-[0.16em] text-amber">
          MESSAGE <span className="sr-only">required</span>
        </label>
        <textarea
          ref={messageRef}
          id={messageId}
          name="message"
          required
          rows={6}
          maxLength={MAX_MESSAGE}
          value={message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${messageId}-error` : `${messageId}-hint`}
          className="lab-field mt-2 min-h-36 resize-y"
          onChange={(event) => {
            setMessage(event.target.value);
            clearError("message");
          }}
        />
        <p id={`${messageId}-hint`} className="sr-only">
          Required. Maximum 3000 characters.
        </p>
        <p className={`mt-2 text-right font-mono text-xs ${message.length > 2800 ? "text-amber" : "text-dim"}`} aria-hidden="true">
          {message.length}/{MAX_MESSAGE}
        </p>
        {errors.message ? (
          <p id={`${messageId}-error`} className="mt-2 font-mono text-sm text-amber">
            {errors.message}
          </p>
        ) : null}
      </div>

      {SITE_KEY ? (
        <div
          ref={widgetHost}
          className="mt-4 min-h-16 w-full focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-phosphor"
          tabIndex={-1}
          aria-label="Verification"
        />
      ) : (
        <p id="ping-offline" className="mt-4 font-mono text-sm text-amber" role="status">
          Transmitter offline. This build has no verification key.
        </p>
      )}

      <button
        type="submit"
        className="mt-5 bg-phosphor px-4 py-2 font-mono text-sm text-chassis disabled:cursor-not-allowed disabled:opacity-50"
        disabled={sending || !SITE_KEY}
        aria-describedby={!SITE_KEY ? "ping-offline" : undefined}
      >
        {sending ? "TRANSMITTING…" : "TRANSMIT PING →"}
      </button>

      <div
        ref={statusRef}
        id={statusId}
        tabIndex={-1}
        role={status?.kind === "error" ? "alert" : "status"}
        aria-live="polite"
        className={
          status
            ? `mt-4 border bg-black/40 p-3 font-mono text-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-phosphor ${
                status.kind === "success" ? "border-phosphor/40 text-phosphor" : "border-amber/40 text-amber"
              }`
            : "sr-only"
        }
      >
        {status?.text ?? ""}
      </div>
    </form>
  );
}
