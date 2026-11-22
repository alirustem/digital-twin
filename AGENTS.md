
## Corporate Proxy
- ALWAYS use the corporate proxy for external network operations, including pip, uv, npm, npx, git, curl, and other package managers or download tools.
- Proxy: `http://135.245.192.7:8000`
- In PowerShell, set before network operations:
  ```powershell
  $env:HTTP_PROXY="http://135.245.192.7:8000"
  $env:HTTPS_PROXY="http://135.245.192.7:8000"
  ```
- Apply the proxy proactively, not after a connection failure.
- Respect NO_PROXY for internal services and localhost.
- Never disable SSL verification to fix connectivity.

## Simplicity First
- ALWAYS choose the simplest solution that works.
- Never overengineer or introduce unnecessary abstractions, dependencies, or files.
- Follow existing project conventions and reuse existing code.
- Implement only what was requested. Avoid unrelated changes.

## Efficiency
- Act independently when requirements are clear.
- Avoid unnecessary questions, planning, commands, and explanations.
- Diagnose errors before retrying. Never repeat failing commands blindly.
- Make minimal, targeted changes and verify they work.
- Stop when the task is complete.

## Safety
- Never expose or commit secrets.
- Ask before destructive operations, Git pushes, or deployments.

## Core Principle
**Think like a senior engineer: simple, efficient, reliable, and maintainable.**
