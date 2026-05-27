# BatchIn Developer Resources

Public integration resources for authenticated BatchIn developer workflows.

This repository intentionally keeps public GitHub copy narrow. Product
capability details, availability, and account-scoped operations are served from
BatchIn-controlled public endpoints and authenticated workspaces.

## Public discovery

- Website: https://batchin.tech
- API base: https://api.batchin.tech/v1
- OpenAPI: https://api.batchin.tech/openapi.json
- MCP manifest: https://batchin.tech/.well-known/mcp
- MCP endpoint: https://api.batchin.tech/v1/mcp
- Agent guide: https://batchin.tech/agents.md
- llms.txt: https://batchin.tech/llms.txt
- SDK package manifest: https://batchin.tech/.well-known/sdk-packages.json

## Source packages

- packages/vaas-sdk-ts
- packages/vaas-sdk-python
- packages/mcp-server

These packages are source-ready in this public repository. Registry packages
are not advertised as installable until their npm or PyPI publication is
verified.

## Agent configs

See examples/agent-configs for Cursor, Windsurf, Claude Desktop, and MCP config examples.

This repository contains public integration resources only. It does not contain BatchIn production secrets or private infrastructure configuration.
