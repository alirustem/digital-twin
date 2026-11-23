# PING infrastructure

Runbook for the contact form on [alirustem.com](https://alirustem.com). It describes the working production system so it can be maintained, troubleshot, and rebuilt without repeating the original Cloudflare dashboard work.

Two sources are used here:

- Application behavior comes from this repository.
- Cloudflare settings come from the manual production setup. Live end-to-end delivery was verified on November 22, 2026: a message submitted on the website arrived in Gmail.

This document was written without reopening the Cloudflare dashboard, redeploying, or sending another message. Where a live setting could not be checked again, it is marked **unverified**.

Do not put secret values in this file, in git, or in logs.

## Overview and purpose

PING is the contact form in the home page section `#contact`. A visitor can send a plain-text note to Ali. The form is a static part of the Next.js site. Delivery is handled by Cloudflare, not by a server running in this repository.

Requirements of the working system:

- Name is required. Maximum 100 characters.
- Email is optional. When present, it must look like an email address and be at most 254 characters.
- Message is required. Maximum 3,000 characters.
- Notifications are delivered to `alooshe.rstm@gmail.com`.
- The design uses no Gmail SMTP connection and no Gmail App Password.
- The design stores no messages in a database.
- The design runs no dedicated backend server.
- The design does not use Cloudflare's paid Email Sending subscription.
- The Pages Function and the Worker both validate the request on the server. The browser validates first so the visitor gets an immediate field error.
- Cloudflare Turnstile provides bot protection. The widget name is `alirustem-ping` and its mode is Managed.
- A Worker rate-limit binding slows repeated submissions.
- The mailer is a private Cloudflare Worker. It has no public URL.

The fixed sender is `ping@alirustem.com`, with the display name `alirustem.com`. A visitor email is copied only to the Reply-To header, and only after it passes validation.

## Architecture

```text
Visitor
   |
   v
alirustem.com
Cloudflare Pages (Static Next.js)
   |
   v
POST /api/ping
Cloudflare Pages Function
   |
   | Private MAILER service binding
   | PING_INTERNAL_TOKEN
   v
alirustem-ping-mailer
Private Cloudflare Worker
   |
   +-- Internal authentication
   +-- Request validation
   +-- Rate limiting
   +-- Turnstile verification
   +-- Fixed sender/recipient enforcement
   |
   v
Cloudflare EMAIL binding
   |
   v
alooshe.rstm@gmail.com
```

### Why the site stays a static export

`next.config.ts` sets `output: "export"`. `npm run build` writes the site to `out/`. There is no Node server to host an API route. The form in `components/PingForm.tsx` calls `POST /api/ping` on the same origin. Cloudflare Pages serves the static files and, separately, the Pages Function in `functions/api/ping.ts`.

### Why a second Worker exists

The email binding is attached to `alirustem-ping-mailer`. The Pages Function cannot send mail itself. The repository records this constraint directly: Pages Functions cannot hold a `send_email` binding. The Function's job is to accept the public request, check its shape and origin, and hand it to the Worker over a private binding.

### Why the Worker has no public endpoint

The Worker is reachable only from the Pages service binding named `MAILER`. Production was configured with all of the following:

- The `workers.dev` URL is disabled.
- Preview URLs are disabled.
- No custom domain is attached.
- No public route is attached.

`worker/wrangler.jsonc` records the same intent with `"workers_dev": false`, `"preview_urls": false`, and no `routes` entry. The Function calls:

```text
env.MAILER.fetch("https://alirustem-ping-mailer/send", ...)
```

That hostname is an internal service-binding address. It is not a public DNS name, and it should not be opened from a browser or registered as a route.

### What the token and the binding each do

`PING_INTERNAL_TOKEN` is a shared random string. The Pages Function sends it as `Authorization: Bearer <token>`. The Worker compares it with the token stored in its own secret. Both copies must be identical. The comparison uses a length-checked XOR loop in `safeEqual`. The bearer value must be 16 to 256 characters from `A-Za-z0-9._~+/-`.

The service binding is what keeps the Worker off the public internet. Another client cannot call the Worker by URL while `workers.dev`, preview URLs, routes, and custom domains stay disabled.

The token is an additional authorization check. It does not replace the privacy of the service binding. It still matters: if a public route were added later, or if another Cloudflare project were given a binding to this Worker, the token would be the remaining check before mail could be sent. Keep both.

## Cloudflare Pages configuration

Production project: `alirustem`

Production domain: `alirustem.com`

Repository: `https://github.com/alirustem/digital-twin` on branch `main`.

| Name | Type | Purpose |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Text | Public Turnstile site key. Next.js reads it while building the static site. |
| `PING_INTERNAL_TOKEN` | Secret | Sent by the Pages Function to authenticate to the Worker. |
| `MAILER` | Service binding | Private connection to the Worker `alirustem-ping-mailer`. |

The earlier setup notes also say to set the token and the `MAILER` binding for Preview. Whether Preview has those three settings was not re-checked. Treat Preview as **unverified**.

### The site key is fixed at build time

Next.js inlines `NEXT_PUBLIC_*` variables into the client bundle during `next build`. The form reads `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY` in `components/PingForm.tsx`. Changing the key in the dashboard does nothing to the already published JavaScript. Save the variable, then rebuild and redeploy the Pages project. Confirm the Turnstile widget renders on the new deployment before testing a submission.

The token is different. `functions/api/ping.ts` reads `env.PING_INTERNAL_TOKEN` when a request arrives. It must be available to the Pages Function at runtime. It must not be inlined into the public site.

The exact dashboard control that marks a Pages variable as build-time, runtime, or both was not copied down. **Unverified** as a checkbox label. What is required: the site key must be present for the production build, and the token must be present when the Function runs.

### Dashboard steps

Menu labels in Cloudflare move. Match these names if a button is worded differently. These steps describe the production environment of project `alirustem`.

1. Open **Workers & Pages** and select the Pages project `alirustem`.
2. Open the production environment variables.
3. Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` as plain text, not as a secret. The value is the Turnstile site key. It is public by design.
4. Add `PING_INTERNAL_TOKEN` as an encrypted secret. Use the same value stored on the Worker. Do not paste it into git.
5. Open production bindings and add a service binding. Variable name: `MAILER`. Service: `alirustem-ping-mailer`.
6. Redeploy the production site so the build picks up the site key.

The Pages build settings were not re-opened for this runbook. **Unverified** as dashboard fields. The repository's build is `npm run build`, and the static files are written to `out/`. The deployment must keep publishing that output together with `functions/`. If `functions/api/ping.ts` is not deployed, `POST /api/ping` returns 404.

## Cloudflare Worker configuration

Worker name: `alirustem-ping-mailer`

Public access, as configured for production:

- `workers.dev` production URL: disabled
- Preview URL: disabled
- Custom domain: none
- Public route: none
- Caller: the Pages service binding `MAILER`

`worker/wrangler.jsonc` agrees with that public-access posture. Its `compatibility_date` is `2026-11-22`. The compatibility date of the copy running in the dashboard editor was not recorded. **Unverified.**

### Bindings

| Name | Type | What it does |
|---|---|---|
| `EMAIL` | Email Service (`send_email`) | Sends the composed message through Cloudflare Email Routing. |
| `PING_LIMIT` | Rate limiter | Limits how often a key may submit. Namespace `71021`, 5 requests per 60 seconds. |

The Worker returns 503 to itself when `EMAIL` or `PING_LIMIT` is missing. The Pages Function then shows that failure to the visitor as 502. See the status map in Troubleshooting.

### Secrets

| Name | Type | What it does |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | Encrypted secret | Server-side Turnstile secret. Sent only to Turnstile Siteverify. |
| `PING_INTERNAL_TOKEN` | Encrypted secret | Must be identical to the Pages secret of the same name. |

The Worker returns 503 to itself when the token or the Turnstile secret is missing. A token that is present but does not match the caller's bearer token returns 401 from the Worker. Neither of those Worker statuses reaches the browser unchanged. See Troubleshooting.

Never write the token or the Turnstile secret into a file that is committed. Placeholder names only:

- `.env.example` documents the public site key.
- `worker/dev.vars.example` documents the secret names for a local Wrangler session. Production was not configured from that file.

### Dashboard steps

1. Open **Workers & Pages** and select `alirustem-ping-mailer`.
2. In domains and routes, keep the `workers.dev` URL off, keep preview URLs off, and add no custom domain or route.
3. In bindings, confirm `EMAIL` is an Email Service binding and `PING_LIMIT` is the rate-limit binding described below.
4. In variables and secrets, set the encrypted secrets `TURNSTILE_SECRET_KEY` and `PING_INTERNAL_TOKEN`.
5. Deploy code only by the dashboard procedure in Deployment. A git push does not do this.

## Email configuration

| Role | Value |
|---|---|
| Recipient | `alooshe.rstm@gmail.com` |
| Sender address | `ping@alirustem.com` |
| Sender name | `alirustem.com` |

Production email path:

- Cloudflare Email Routing is activated for `alirustem.com`.
- The Gmail destination is verified.
- The Worker uses its native `EMAIL` binding to send.
- Cloudflare's paid Email Sending product is not part of this design.
- No mailbox was created on the domain. Outbound mail to the verified destination does not need one.

The DNS records created by Email Routing were not copied into the repository. **Unverified** as individual records. If routing is turned off, enable it again in the Cloudflare Email Routing page and verify the Gmail destination before the next test.

The earlier README noted an optional routing rule from `ping@alirustem.com` to the same Gmail inbox, for replies and bounces sent to the From address. Outbound delivery does not require that rule. Whether the rule exists was not recorded. **Unverified.**

### Reply-To

`composePing` sets Reply-To to the visitor's email only when validation accepted one. If the visitor left email blank, the message body says `Email: Not provided` and there is no Reply-To header.

The subject is `[alirustem.com] New PING from <name>`. The body is plain text: name, email, message, and a short footer. The Turnstile token is not included.

### Visitor input must not become From

The visitor chooses the name, the optional email, and the message. Those values are cleaned and placed in the subject or body. Extra JSON fields such as `to`, `from`, or `replyTo` are ignored. The visitor email is never copied into the authenticated From address. A newline in the name is folded into a single line so it cannot inject headers.

### Two different restriction layers

These layers are not the same, and only the first one is visible in the deployed script.

**Application restrictions, enforced in code.** Both `worker/src/index.ts` and `worker/dashboard-worker.js` do this before calling `EMAIL.send`:

- `composePing` sets `to` to `alooshe.rstm@gmail.com` and `from` to `ping@alirustem.com` / `alirustem.com`.
- `send` throws `E_RECIPIENT_NOT_ALLOWED` if `to`, `from.email`, or `from.name` is anything else.
- The object passed to `EMAIL.send` uses those constants again, not the object the caller supplied.
- Reply-To is the only visitor-controlled address, and only after email validation.

**Intended Wrangler binding restrictions, not verified on the live binding.** `worker/wrangler.jsonc` also asks Cloudflare to restrict the binding:

```json
"destination_address": "alooshe.rstm@gmail.com",
"allowed_sender_addresses": ["ping@alirustem.com"]
```

The Email Service binding created in the browser dashboard uses the variable name `EMAIL`. That dashboard UI does not expose these sender and recipient restriction fields. This runbook does not claim that the live binding enforces them. Until someone confirms those fields on the binding, the application checks above are the restrictions that actually run.

## Rate limiting

| Setting | Value |
|---|---|
| Binding name | `PING_LIMIT` |
| Namespace ID | `71021` |
| Limit | 5 requests |
| Period | 60 seconds |

The Worker calls `limiter.limit({ key })` and allows the request only when `success` is true. A refused key returns 429. A thrown limiter error returns 503 from the Worker, which the Pages Function presents as 502.

Cloudflare's rate-limit binding is approximate. Counters are scoped to Cloudflare locations. They are not one strict counter shared by every location worldwide. Two requests from the same IP can land in different locations and be counted separately. Do not treat "5 per minute" as a global lock.

### How the key is chosen

1. The Pages Function reads `CF-Connecting-IP`.
2. `normalizeIp` trims it. The value must be 2 to 64 characters and contain only letters, digits, `.`, and `:`. Anything else, including a newline, becomes `unknown`.
3. The Function forwards that result in the header `x-ping-ip`. This header is set by the Function, not taken from the visitor.
4. The Worker normalizes `x-ping-ip` again.
5. The limiter key is `ip:` plus that value. A missing address shares the key `ip:unknown` with every other missing address.

The visitor's address is not written into the application logs. A limiter exception is logged as `ping rate limit failed` with no address.

## Cloudflare Turnstile

| Setting | Value |
|---|---|
| Widget name | `alirustem-ping` |
| Mode | Managed |
| Public value | Site key, in the Pages text variable `NEXT_PUBLIC_TURNSTILE_SITE_KEY` |
| Private value | Secret key, in the Worker secret `TURNSTILE_SECRET_KEY` |

The site key is public. It ships in the static JavaScript. The secret stays in the Worker. The Pages project does not need the secret.

The repository's setup notes say the production widget should list `alirustem.com` and `www.alirustem.com`, and should leave localhost off the widget. The live hostname list was not re-opened. **Unverified.**

The verifier in `lib/ping.ts` and in `worker/dashboard-worker.js` accepts a Siteverify `hostname` of `alirustem.com`, `www.alirustem.com`, `localhost`, or `127.0.0.1`. The hostname `example.com` is accepted only when the secret is Cloudflare's published test secret. That test secret is not the production secret.

### Server-side check

After the rate limit allows the request, the Worker sends the visitor token to:

```text
POST https://challenges.cloudflare.com/turnstile/v0/siteverify
```

The JSON body contains `secret`, `response`, and `remoteip` when the IP normalized to a real address. The Worker accepts the token only when `success` is true and `hostname` is allowed. The form resets the widget after each attempted submit. Turnstile tokens expire and cannot be reused, so a failed attempt needs a new widget token. Refresh the page if the widget does not issue one.

Logs include Turnstile's short error codes, such as `invalid-input-secret`. They do not include the token, the secret, or the message.

### Secret rotation during the original setup

The Turnstile secret was rotated while the system was first being configured. The Worker still had the previous secret. Siteverify rejected it. The Worker secret was then replaced with the current secret. The procedure, with no secret values, was:

1. In the browser Network tab, `POST /api/ping` returned `403` with `{"ok":false,"error":"turnstile"}`. The request body was not copied. It contains the visitor message and the Turnstile token.
2. The Worker log line was `ping turnstile rejected invalid-input-secret`.
3. That code means Siteverify rejected the secret the Worker sent. It does not mean the visitor failed the widget challenge.
4. The Worker secret `TURNSTILE_SECRET_KEY` was replaced with the current secret from the `alirustem-ping` widget.
5. The Worker change was deployed.
6. The website was refreshed so the widget could issue a new token.
7. A new message was submitted. That submission was delivered to Gmail on November 22, 2026.

Use the same procedure if this error returns. Do not reuse the token from the failed request.

## Source file reference

| File | Responsibility |
|---|---|
| `app/page.tsx` | Renders `<PingForm />` in the home page contact section. |
| `components/PingForm.tsx` | Browser form. Loads Turnstile, validates locally, posts JSON to `/api/ping`, and maps the JSON result to visible text. |
| `lib/ping.ts` | Shared rules: field limits, email composition, origin check, body size, IP normalization, token comparison, Turnstile Siteverify, rate-limit handling, and the authorized mail handler. |
| `lib/ping.test.mts` | Tests for `lib/ping.ts` and for `worker/dashboard-worker.js`. Also checks that `wrangler.jsonc` still names the fixed mailbox and stays off the public internet. |
| `functions/api/ping.ts` | The public Pages Function. Checks method, origin, content type, and size. Forwards the body, the bearer token, and `x-ping-ip` through `MAILER`. Strips anything unexpected from the Worker response. |
| `worker/src/index.ts` | TypeScript Worker entry. This is the module `wrangler.jsonc` points at. It authenticates the bearer token, requires the bindings, and calls the shared handler. |
| `worker/dashboard-worker.js` | Standalone JavaScript for the Cloudflare dashboard editor. Production was deployed by pasting this file. It repeats the shared logic because that editor cannot import `lib/ping.ts`. |
| `worker/wrangler.jsonc` | Intended Worker name, public-access flags, `EMAIL` binding, and rate-limit namespace. It is the configuration record. It is not what currently publishes the live script. |
| `worker/dev.vars.example` | Placeholder names for a local Wrangler session. |
| `worker/tsconfig.json` | Typecheck for the TypeScript Worker, the Pages Function, and `lib/ping.ts`. |
| `.env.example` | Placeholder for the public Turnstile site key. |
| `next.config.ts` | Static export. This is why the API lives in `functions/` rather than in a Next.js server. |
| `package.json` | `npm test`, `npm run check:worker`, and `npm run build`. |

### How the three copies stay aligned

`functions/api/ping.ts` and `worker/src/index.ts` import `lib/ping.ts`. That file is the source of truth for validation, composition, Turnstile, and the authorized handler.

`worker/dashboard-worker.js` is a separate JavaScript copy of the same behavior, plus the Worker `fetch` entry. The dashboard editor typechecks the pasted file. During the original deploy it reported:

```text
Property 'code' does not exist on type 'Error'. ts(2339)
```

The pasted file now throws with `Object.assign(new Error("blocked"), { code: "E_RECIPIENT_NOT_ALLOWED" })`. The TypeScript entry keeps the same runtime behavior with a type assertion, which `tsc` already accepts. Do not change one copy and leave the other behind. `npm test` loads the dashboard file and will fail if its mailbox lock or module shape drifts.

The live dashboard script was not downloaded for a byte-for-byte diff. After any future edit, paste the repository file again and deploy it, or the running Worker can drift from git.

## Deployment procedures

The website and the Worker deploy by different paths. Pushing to GitHub updates Pages only.

Do not deploy either one as part of a documentation change. Do not run `wrangler deploy` against this account unless a Worker change was explicitly approved. Wrangler would publish `worker/src/index.ts` and would also apply the binding block in `wrangler.jsonc`. That is a different action from the dashboard paste that produced the live Worker.

### Website deployment

1. Commit the site change and push `main` to `https://github.com/alirustem/digital-twin`.
2. Cloudflare Pages deploys that branch for project `alirustem`. The git connection itself was not re-opened for this runbook. It is the production process that published the working site.
3. Wait until the production deployment succeeds.
4. Open `https://alirustem.com` and confirm the contact form is present.
5. Confirm the Turnstile widget renders. If the page says `Transmitter offline`, the production build did not contain `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
6. Submit a real test message only when you intend to deliver mail. In the browser Network tab, `POST /api/ping` should return `200` and `{"ok":true}`. Then confirm the message in Gmail. The HTTP success and the inbox are two separate checks.

### Worker deployment through the dashboard

1. Open **Workers & Pages**.
2. Select `alirustem-ping-mailer`.
3. Open **Edit code**.
4. Replace the module with the full contents of `worker/dashboard-worker.js`.
5. Deploy that version.
6. Confirm the new version is the active deployment.
7. Confirm the `workers.dev` URL and preview URL are still disabled, and that no custom domain or route was added.
8. Submit one end-to-end test from `https://alirustem.com` and confirm Gmail delivery.

Manual edits in the dashboard editor are a common source of drift. If the running script and `worker/dashboard-worker.js` differ, the repository is no longer a reliable copy of production. Paste from the repository on purpose. Do not tidy the script only in the browser.

Changing a secret in the dashboard can require a deploy before the new value is what requests see. The Turnstile repair above included a deploy after the secret was replaced.

## Troubleshooting guide

The form's visible sentence is a coarse signal. Several different failures show the same timeout text. Use the Network tab for `POST /api/ping`, and use the Worker logs for the short `ping ...` line.

### How to look without leaking data

In the browser, open DevTools, then Network, and select `ping`. Record the HTTP status and the JSON `error` and `field` fields. Do not copy the request payload, the `Authorization` header, or the response beyond that small JSON object. The payload contains the message and the Turnstile token.

In Cloudflare, open **Workers & Pages**, then `alirustem-ping-mailer`, then the live logs. The application logs short lines such as `ping accepted`, `ping rejected`, `ping misconfigured`, `ping rate limited`, `ping turnstile rejected invalid-input-secret`, and `ping send failed E_RECIPIENT_NOT_ALLOWED`. It does not log the message, the addresses, the token, or the secrets. Do not enable a logger that dumps request bodies. Do not paste secret fields into notes.

### What the visitor's browser actually receives

The Pages Function rewrites the Worker JSON before the browser sees it. `unavailable` from the Worker becomes HTTP 502. A Worker 401 or 503 therefore usually appears in the Network tab as 502.

| What you see in the browser | JSON | Usual meaning |
|---|---|---|
| 200 | `{"ok":true}` | The Worker accepted the send call. |
| 400 | `{"ok":false,"error":"invalid","field":"..."}` | Name, email, message, or Turnstile token failed validation. |
| 403 | `{"ok":false,"error":"turnstile"}` | Siteverify rejected the token, or the Turnstile call failed inside the verifier. |
| 403 | `{"ok":false,"error":"origin"}` | The `Origin` header is not an allowed site. The form shows the timeout sentence for this body. |
| 413 | `{"ok":false,"error":"payload"}` | The body is larger than 16,384 bytes. |
| 429 | `{"ok":false,"error":"rate"}` | The rate-limit key was refused. |
| 502 | `{"ok":false,"error":"unavailable"}` | Send failed, the Worker was misconfigured, the token did not match, or the Function could not use the Worker response. |
| 503 | `{"ok":false,"error":"unavailable"}` | The Pages Function itself is missing a usable token or the `MAILER` binding. |
| 404 | often HTML, not this JSON | The Pages Function is not on that deployment. |
| 405 | `{"ok":false,"error":"method"}` | The public request was not `POST`. |

The form shows "PING received..." only for `{"ok":true}`. It shows "The routing check failed..." for a Turnstile failure. It shows "Too many PINGs from this path..." for 429. It shows "That PING is too large to route." for a payload error. Most other failures show "Request timed out. Even my contact form has networking problems. Try again?"

### Transmitter offline

Symptom: the form shows `Transmitter offline. This build has no verification key.` and the submit button is disabled.

Cause: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` was empty when that production bundle was built.

Check: view source or the built JavaScript for a missing key only in the sense that the widget host is absent. Do not need the secret for this check.

Fix: set the Pages text variable to the current site key and redeploy the website so Next builds again. Confirm the widget appears on the new deployment.

### Missing Turnstile widget

Symptom: the amber offline line is absent, but the widget area stays empty. Submit may say the routing check failed before any request is sent.

Cause: the site key was present, and the browser could not load or render `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`. A content blocker, a network block, or a widget error callback can clear the token.

Check: the Network tab for the Turnstile script, and the widget frame. A failed script never calls `/api/ping`.

Fix: allow the Turnstile script, reload the page, and complete the widget before submitting. If the key was rotated, rebuild the site with the new site key. The secret is a different value. Replacing the site key does not update `TURNSTILE_SECRET_KEY`.

### 400 invalid input

Symptom: `400` and `{"ok":false,"error":"invalid","field":"name"|"email"|"message"|"turnstile"}`.

Cause: the server-side rules rejected the field. Empty name, empty message, a name over 100 characters, a message over 3,000 characters, a bad email, or a Turnstile token with illegal characters. The browser usually catches these first. A 400 means the request still failed the Worker or the shared validator.

Check: the `field` value only. Do not copy the submitted message into a ticket.

Fix: correct that field, complete Turnstile again, and resubmit. A malformed JSON body uses `field` `message` as well.

### 401 authorization failure

Symptom on the Worker: HTTP 401, body `{"ok":false,"error":"unavailable"}`, log line `ping rejected`.

Symptom in the browser: usually **502**, not 401, with `{"ok":false,"error":"unavailable"}` and the timeout sentence. The Pages Function maps the Worker's `unavailable` body onto 502.

Cause: the Worker has a token, and the bearer token from Pages does not match it. A missing Pages token is a different case and returns 503 from the Function before the Worker runs.

Check: compare the two secrets only by replacing one with a newly generated value in both places. Do not print either value. Confirm the Pages value matches the bearer pattern: one line, 16 to 256 characters, no quotes and no trailing space. The Function trims the Pages value before sending it. The Worker trims its own copy before comparing.

Fix: generate one token with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Store it as `PING_INTERNAL_TOKEN` on the Pages project and on the Worker. Deploy the Worker if the new secret needs a deploy. Retry with a fresh Turnstile token.

### 403 Turnstile failure

Symptom: `403` and `{"ok":false,"error":"turnstile"}`. The form says the routing check failed.

This is the production failure from the original setup:

```text
POST /api/ping
403 Forbidden
{"ok":false,"error":"turnstile"}
```

Worker logs:

```text
ping turnstile rejected invalid-input-secret
```

Cause of that incident: `TURNSTILE_SECRET_KEY` on the Worker was invalid or was not the secret of the widget that issued the token. The secret had been rotated, and the Worker still held the old one.

Fix that was used: replace the Worker secret with the current Turnstile secret, deploy, refresh the website, and submit a new message. Do not retry the old token.

Other log lines for the same browser response:

| Log | Meaning |
|---|---|
| `ping turnstile rejected invalid-input-secret` | Wrong, empty, or rotated secret on the Worker. |
| `ping turnstile rejected invalid-input-response` | Token was missing, reused, expired, or already checked. Refresh and try again. |
| `ping turnstile rejected host` | Siteverify succeeded for a hostname the application does not allow. |
| `ping turnstile unreachable` | The Worker could not complete the Siteverify call. The current code turns that into the same 403, because the verifier returns false instead of throwing. |
| `ping turnstile http <status>` | Siteverify returned an HTTP error. Also a 403 to the visitor. |

A 403 with `error` `origin` is not a Turnstile failure. The origin must be `https://alirustem.com`, `https://www.alirustem.com`, a local `http://localhost` or `http://127.0.0.1` origin, or an `https://*.pages.dev` host that matches the request `Host` header.

### 404 on `/api/ping`

Symptom: the Network tab shows 404. The form shows the timeout sentence because the body is not the expected JSON.

Cause: that deployment has no Pages Function at `functions/api/ping.ts`. A static host with only `out/` will do this. A push that did not include `functions/` will do this.

Check: the production deployment file list or build logs for `functions/api/ping.ts`. Confirm the request URL is `/api/ping` with no extra slash. The form posts to `/api/ping`.

Fix: deploy the Pages project from this repository so `functions/api/ping.ts` is included, then request `POST /api/ping` again.

### 429 rate limit exceeded

Symptom: `429` and `{"ok":false,"error":"rate"}`. The form asks the visitor to wait a minute. The Worker log is `ping rate limited`.

Cause: the key `ip:<address>` exceeded 5 requests in 60 seconds in that Cloudflare location. Repeated tests from one network hit this quickly. Failed Turnstile checks happen after the limiter runs, so a rejected challenge still consumes a count.

Check: wait for the period to pass. Do not raise the limit as a workaround for a test loop.

Fix: wait and submit once. If the namespace was recreated, its ID will change. Update both the dashboard binding and `worker/wrangler.jsonc` together. Do not invent a second limiter with a new name. The code looks up `PING_LIMIT`.

### 502 email delivery failure

Symptom: `502` and `{"ok":false,"error":"unavailable"}`. The Worker log is `ping send failed` plus a short code such as `E_RECIPIENT_NOT_ALLOWED` or `send_failed`.

Cause: `EMAIL.send` threw. The binding may be missing a verified destination, Email Routing may be off, or the application lock rejected the addresses. The message is not queued. Nothing in this system retries it.

Check: the log code only. `E_RECIPIENT_NOT_ALLOWED` means the composed recipient, sender address, or sender name did not match the constants. `send_failed` means the thrown error had no safe code. Confirm Email Routing is on and `alooshe.rstm@gmail.com` is still a verified destination.

Fix: restore routing and the verified destination, or fix the constants in both Worker copies together. Deploy the Worker. Submit one new message. A 502 does not mean the earlier message is waiting somewhere.

### 503 Worker misconfiguration

Symptom in the browser: `503` and `{"ok":false,"error":"unavailable"}`. The Pages log is `ping misconfigured`.

Cause: the Function refused to call the Worker. Either `PING_INTERNAL_TOKEN` is missing or does not match the bearer pattern, or the `MAILER` binding is missing.

A broken Worker configuration is easy to confuse with this. If the Worker is missing its token, Turnstile secret, `EMAIL`, or `PING_LIMIT`, the Worker logs `ping misconfigured` and returns 503, and the Function turns that into **502** for the browser. A thrown rate limiter does the same, with the log `ping rate limit failed`.

Check: which side logged `ping misconfigured`. Pages log means the Function environment. Worker log means the Worker environment. A browser 503 points at Pages. A browser 502 with that Worker log points at the Worker.

Fix: restore the missing secret or binding named in this runbook. Keep the token identical on both sides. Deploy the Worker after a Worker secret change if the dashboard requires it. Rebuild the website only when the public site key changed.

### Successful submission but no Gmail delivery

Symptom: the form says the PING was received, and the Network tab shows `200` with `{"ok":true}`. The inbox does not show the message.

Cause: `200` means `EMAIL.send` returned. It does not mean Gmail displayed the message. Mail can be delayed or filed as spam, or Email Routing can accept the Worker call and still fail later. This system has no delivery receipt.

Check:

- Worker logs for `ping accepted` on that request.
- The inbox and spam folder for `alooshe.rstm@gmail.com`.
- The subject prefix `[alirustem.com] New PING from`.
- Email Routing still shows the destination as verified.

Fix: resolve routing or the spam decision, then send one new test. Do not loop the form. There is no stored copy to resend. If the Worker log does not say `ping accepted`, the browser result was not a real acceptance. Use the status map above.

## Recovery procedure

Rebuild in this order. Store generated secrets in a password manager. Do not put them in the repository, in shell history notes, or in this file.

1. Use the Cloudflare account that controls `alirustem.com`.
2. Turn on Email Routing for `alirustem.com`. Verify the destination `alooshe.rstm@gmail.com`. Do not create a domain mailbox. Do not enable the paid Email Sending product.
3. Create a Turnstile widget named `alirustem-ping` in Managed mode. The setup notes list hostnames `alirustem.com` and `www.alirustem.com`, with localhost left off the production widget. Keep the site key and the secret outside git.
4. Generate the internal token:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Create the Worker `alirustem-ping-mailer`. Disable the `workers.dev` URL and preview URLs. Add no custom domain and no route.
6. Add the binding `EMAIL` as an Email Service binding. The dashboard may not show destination or sender restrictions. The script enforces `alooshe.rstm@gmail.com` and `ping@alirustem.com`. If the UI offers the Wrangler restriction fields, set the destination to `alooshe.rstm@gmail.com` and the allowed sender to `ping@alirustem.com`.
7. Add the binding `PING_LIMIT`. Namespace ID `71021`, limit 5, period 60 seconds. If Cloudflare assigns a new namespace ID, record the new ID in `worker/wrangler.jsonc` in the same change.
8. Add the encrypted secrets `TURNSTILE_SECRET_KEY` and `PING_INTERNAL_TOKEN`.
9. Open **Edit code**, paste the whole file `worker/dashboard-worker.js`, and deploy it. Confirm the active version is that deploy, and confirm no public URL appeared.
10. On Pages project `alirustem`, production, set the text variable `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, the secret `PING_INTERNAL_TOKEN` to the same token, and the service binding `MAILER` to `alirustem-ping-mailer`.
11. Deploy the website from `main` so the production build contains the site key and `functions/api/ping.ts`.
12. Open `https://alirustem.com`. Confirm the form and the Turnstile widget load.
13. Submit one message. Confirm `POST /api/ping` returns `200` and `{"ok":true}`.
14. Confirm the message is in Gmail, including the spam folder if the inbox is empty.
15. Confirm the Worker log says `ping accepted` and does not contain the message text.

Local checks before you push a code change:

```powershell
npm test
npm run check:worker
npm run build
node --check worker/dashboard-worker.js
```

Use the corporate proxy from `AGENTS.md` for any install or other external command. Do not point Wrangler at the production Worker unless that replacement was explicitly approved.

## Operational limitations

- The free path is Email Routing plus the Worker email binding to a verified destination. Numerical quotas for mail, Worker requests, and Turnstile were not recorded in this repository and were not copied from the dashboard. Check the account's current limits in Cloudflare before assuming there is room. Do not add quota numbers from memory.
- The rate limit is approximate and counted per Cloudflare location. It is not a globally synchronized lock.
- The live Worker is updated by pasting `worker/dashboard-worker.js` in the dashboard. A push to GitHub updates the Pages site and leaves the Worker as it was.
- Dashboard edits drift from git. `worker/src/index.ts`, `lib/ping.ts`, and `worker/dashboard-worker.js` can also drift from each other if only one is edited.
- `worker/wrangler.jsonc` records binding restrictions the dashboard Email Service form does not expose. Those binding restrictions are not verified on the live `EMAIL` binding. The script's own address checks are the verified enforcement.
- The dashboard Worker's compatibility date, the Pages Preview environment, the optional inbound rule for `ping@alirustem.com`, and the Pages build-command fields were not re-checked.
- Messages are not stored by this application. They exist in the email delivered to Gmail and in Cloudflare's mail path. Logs are written to avoid message contents, addresses, tokens, and secrets. Treat the inbox as the sensitive copy. Do not add body logging to make debugging easier.
- HTTP `200` and the on-screen success sentence mean the Worker send call returned. They do not, by themselves, prove that Gmail showed the message.
