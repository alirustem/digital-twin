# AGENTS.md — alirustem.com

## Project Scope

- This repository contains the alirustem.com personal portfolio website and its supporting infrastructure.
- Follow the global engineering rules for network access, package management, efficiency, simplicity, and safety.
- Preserve the existing architecture and project conventions.
- Prefer minimal, targeted changes.
- Do not introduce unnecessary dependencies, services, or infrastructure.

## PING Infrastructure Maintenance

Whenever modifying the PING contact form, Pages Function, Cloudflare Worker, Turnstile integration, email bindings, rate limiting, or deployment configuration:

1. Review `docs/PING_INFRASTRUCTURE.md` before making changes.
2. Update the runbook whenever architecture, configuration, deployment, or troubleshooting procedures change.
3. Maintain consistency between `worker/src/index.ts`, shared logic, and `worker/dashboard-worker.js`.
4. Keep `worker/wrangler.jsonc` aligned with the intended Cloudflare configuration.
5. Never commit credentials, secret keys, tokens, or actual secret values.
6. Never expose the private Worker through a public endpoint without explicit approval.
7. Never change the fixed email destination without explicit approval.
8. Preserve the existing free-tier architecture unless instructed otherwise.
9. Test relevant behaviour after changes.
10. Remember that GitHub pushes do not automatically update the manually deployed Worker.

## Deployment Safety

- Never deploy to production without explicit approval.
- Never push changes to GitHub without explicit approval.
- Never modify Cloudflare dashboard settings, bindings, routes, or secrets without explicit approval.
- Distinguish local code changes from changes that affect live infrastructure.
- Verify changes locally whenever practical.
- Do not assume the deployed Worker matches the repository source.

## Documentation

- Keep documentation accurate and consistent with implementation.
- Update existing documentation rather than creating duplicate documents.
- Document significant infrastructure or deployment changes.
- Never document actual secret values.

## Core Principle

**Keep the website simple, the infrastructure secure, and production changes deliberate.**