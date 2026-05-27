# BatchIn Developer Resources

Public SDK, MCP, and agent configuration resources for BatchIn.

BatchIn is a verification-first AI inference platform with OpenAI-compatible Model API, Media API, Spend Control, VaaS receipts, Dedicated Capacity, and Agent Workloads.

## Public discovery

- Website: https://batchin.tech
- API base: https://api.batchin.tech/v1
- OpenAPI: https://api.batchin.tech/openapi.json
- MCP manifest: https://batchin.tech/.well-known/mcp
- MCP endpoint: https://api.batchin.tech/v1/mcp
- Agent guide: https://batchin.tech/agents.md
- llms.txt: https://batchin.tech/llms.txt
- SDK package manifest: https://batchin.tech/.well-known/sdk-packages.json

## Packages

- packages/vaas-sdk-ts: TypeScript SDK for VaaS receipt and evidence APIs.
- packages/vaas-sdk-python: Python SDK and local bundle verifier for VaaS receipts.
- packages/mcp-server: Local MCP JSON-RPC server for authenticated BatchIn tools and resources.

These packages are source-ready in this public repository. Registry packages
are not advertised as installable until their npm or PyPI publication is
verified.

## Agent configs

See examples/agent-configs for Cursor, Windsurf, Claude Desktop, and MCP config examples.

This repository contains public integration resources only. It does not contain BatchIn production secrets or private infrastructure configuration.
