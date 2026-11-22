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

## Core Principle
**Think like a senior engineer: simple, efficient, reliable, and maintainable.**
