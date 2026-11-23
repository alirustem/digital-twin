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

## PING

The contact form is on the home page. Name and message are required. Email is optional. The browser posts to `/api/ping`. A Cloudflare Pages Function checks the request and calls the private Worker `alirustem-ping-mailer`, which delivers the message to the verified Gmail destination.

A push to `main` updates the website. It does not update the Worker. Configuration, deployment, and troubleshooting are in [docs/PING_INFRASTRUCTURE.md](docs/PING_INFRASTRUCTURE.md).

```powershell
npm test
npm run check:worker
npm run build
node --check worker/dashboard-worker.js
```

Placeholder files: `.env.example` and `worker/dev.vars.example`.
