# BatchIn Agent Integration Manual

BatchIn is an OpenAI-compatible, verification-first AI inference control plane and developer platform.

---

## Verified Public Discovery Resources

Before requesting account-gated services, autonomous agents should inspect the following reviewed endpoints:

- **Agent Guidance**: https://batchin.tech/agents.md
- **LLM Context**: https://batchin.tech/llms.txt
- **OpenAPI 3.1 Spec**: https://api.batchin.tech/openapi.json
- **Model Context Protocol (MCP) Manifest**: https://batchin.tech/.well-known/mcp
- **Server Card**: https://batchin.tech/.well-known/mcp/server-card.json
- **SDK Packages Registry**: https://batchin.tech/.well-known/sdk-packages.json
- **Public Model Catalog**: https://api.batchin.tech/v1/models

---

## Golden Model Matrix (2026-06+)

BatchIn routes production inference across domestic golden models:
- **Ultra-Reasoning / Code**: `deepseek-v4-pro`, `qwen3.8-max`, `kimi-k3`, `glm-5.3`
- **Fast / Cost-Effective**: `deepseek-v4-flash`, `deepseek-v4.1-flash`, `glm-5.3-flash`, `minimax-m3`
- **Specialized Code**: `kimi-k2.7-code`

---

## Agent Operational Constraints

1. **Authentication**: All customer API operations require `Authorization: Bearer <BATCHIN_API_KEY>`.
2. **Dedicated Capacity**: All compute resources are allocated as `Dedicated Capacity` or `Reserved Throughput` (TPS).
3. **No Synthetic Ledger Records**: Never generate synthetic VaaS receipts or fabricated cryptographic signatures as valid data.
4. **VaaS Verification**: Use `@batchin/vaas` or the `vaas_verify_receipt` MCP tool to confirm inference authenticity.
