# auth.md

You are an agent. ifuentes.net does not use authentication: there are no accounts, sign-up, registration, API keys, OAuth or tokens. Everything is public and read-only.

## Call these without credentials

| Resource | Endpoint | Protocol |
| --- | --- | --- |
| MCP server | https://ifuentes.net/mcp | MCP Streamable HTTP. Tools: `get_profile`, `get_resume`, `get_now` |
| A2A agent | https://ifuentes.net/a2a | A2A JSON-RPC 2.0, `message/send` |
| Markdown | https://ifuentes.net/llms.txt, https://ifuentes.net/llms-full.txt, https://ifuentes.net/resume.md, https://ifuentes.net/now.md | HTTPS GET |
| API catalog | https://ifuentes.net/.well-known/api-catalog | RFC 9727 linkset |

## Rules

- Do not send user credentials, cookies or tokens. They are not needed and are ignored.
- Do not look for a registration or claim flow: there is none, and there is no OAuth metadata to discover.
- Cache responses for a few minutes. Content changes rarely; each document shows when it was last updated.
- Problems or questions: inaki@ifuentes.net
