## Corporate Proxy
- ALWAYS use the corporate proxy for external network operations, including pip, uv, npm, npx, git, curl, and other package managers or download tools.
- Proxy: `http://135.245.192.7:8000`
- In PowerShell, configure:
  ```powershell
  $env:HTTP_PROXY="http://135.245.192.7:8000"
  $env:HTTPS_PROXY="http://135.245.192.7:8000"
  $env:NO_PROXY="localhost,127.0.0.1,::1"
  ```
- Apply the proxy proactively, not after a connection failure.
- ALWAYS bypass the proxy for localhost and local development servers.
- Respect NO_PROXY for internal corporate services.
- NEVER disable the corporate proxy globally to fix local development issues.
- Never disable SSL verification. Use the corporate CA certificate if needed.

## Simplicity First
- ALWAYS choose the simplest solution that works.
- Never overengineer or introduce unnecessary abstractions, dependencies, or files.
- Follow existing project conventions and reuse existing code.
- Implement only what was requested. Avoid unrelated changes.

## Efficiency
- Act independently when requirements are clear.
- NEVER request control of my screen or computer. Use available terminal commands, tools, and APIs instead. If manual interaction is required, explain the steps.
- Avoid unnecessary questions, planning, commands, and explanations.
- Diagnose errors before retrying. Never repeat failing commands blindly.
- Make minimal, targeted changes and verify they work.
- For development servers, check the actual port, terminal output, and running processes before troubleshooting.
- Stop when the task is complete.

## Safety
- Never expose or commit secrets.
- Identify processes before terminating them or freeing occupied ports.
- Ask before destructive operations, Git pushes, or deployments.
- Never bypass security controls to make something work.

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

## Core Principle
**Think like a senior engineer: simple, efficient, reliable, and maintainable.**
