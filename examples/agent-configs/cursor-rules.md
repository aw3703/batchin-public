# Cursor rules for BatchIn

- Start with https://batchin.tech/agents.md and https://api.batchin.tech/openapi.json.
- Use https://api.batchin.tech/v1 as the OpenAI-compatible API base URL.
- Never create fake VaaS receipts, usage records, billing rows, or model output.
- Treat model availability as account-scoped unless the live API confirms it.
- Prefer MCP discovery at https://batchin.tech/.well-known/mcp for agent tools.
