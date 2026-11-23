# Ali Rustem

Personal site for a senior IP/MPLS engineer. Lab aesthetic, career facts, real links.

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000

## Static export

```powershell
npm run build
```

The site is written to `out/`. Cloudflare Pages publishes that directory and the `functions/` proxy with it.

## PING contact form

Visitors submit the form to `/api/ping`. A Pages Function checks the request and calls a private Worker. The Worker sends one plain-text email to the verified Gmail destination with Cloudflare's `send_email` binding. It does not use Email Sending, SMTP, or a third-party mail service.

Pages Functions cannot hold a `send_email` binding, so the Worker stays private: `workers_dev` is false and it has no public route.

Before the form can deliver mail:

1. Create a Turnstile widget for `alirustem.com` and `www.alirustem.com`. Leave localhost off the production widget.
2. In the Pages project, set the plain build variable `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to the widget site key, then rebuild. The static export only sees the key at build time.
3. Generate one shared token: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. From `worker/`, deploy the mailer and set its secrets. Use the corporate proxy for `npx`.
5. In Pages, add the encrypted secret `PING_INTERNAL_TOKEN` with that same token, for Production and Preview.
6. In Pages, add a service binding named `MAILER` pointed at `alirustem-ping-mailer`, for Production and Preview.

Do not onboard the domain under Email Sending. Sending to the verified destination is free with Email Routing alone. Do not add a public route for the mailer.

Optional: a routing rule for `ping@alirustem.com` to the same Gmail inbox, so replies and bounces to the From address arrive. Outbound send does not require that rule.

```powershell
$env:HTTP_PROXY="http://135.245.192.7:8000"
$env:HTTPS_PROXY="http://135.245.192.7:8000"
$env:NO_PROXY="localhost,127.0.0.1,::1"
npx wrangler deploy --config worker/wrangler.jsonc
npx wrangler secret put TURNSTILE_SECRET_KEY --config worker/wrangler.jsonc
npx wrangler secret put PING_INTERNAL_TOKEN --config worker/wrangler.jsonc
npm test
npm run build
```

Placeholder configuration lives in `.env.example` and `worker/dev.vars.example`.
