# BatchIn external publishing checklist

This file tracks public surfaces that improve agent and search discoverability.
It is a release checklist, not a claim that the external listing is already live.

## Package registries

### NPM

- Package: @batchin/vaas
- Source: packages/vaas-sdk-ts
- Purpose: TypeScript SDK for VaaS receipt and evidence APIs.
- Publish command:

    cd packages/vaas-sdk-ts
    npm publish --access public

### PyPI

- Package: batchin-vaas
- Source: packages/vaas-sdk-python
- Purpose: Python SDK and local bundle verifier for VaaS receipts.
- Publish command:

    cd packages/vaas-sdk-python
    python -m build
    twine upload dist/*

- Package: batchin-mcp-server
- Source: packages/mcp-server
- Purpose: Local MCP JSON-RPC server for authenticated BatchIn tools.
- Publish command:

    cd packages/mcp-server
    python -m build
    twine upload dist/*

## MCP registries

Submit the public MCP surface with these fields:

- Name: BatchIn Public MCP
- Website: https://batchin.tech
- Manifest: https://batchin.tech/.well-known/mcp
- Server card: https://batchin.tech/.well-known/mcp/server-card.json
- Remote endpoint: https://api.batchin.tech/v1/mcp
- Local package: batchin-mcp-server
- Docs: https://batchin.tech/agents.md
- OpenAPI: https://api.batchin.tech/openapi.json

Targets:

- Smithery
- mcp.so
- Glama
- PulseMCP

## Agent platform configs

Example configs live in examples/agent-configs. Link that directory from any
public docs or package README used for registry submission.

## Skills registry

Submit an official skill using the content from:

- https://batchin.tech/.well-known/agent-skills/routing-and-billing.md
- https://batchin.tech/.well-known/agent-skills/vaas-and-enterprise-evidence.md

## ChatGPT app

Do not publish a marketing-only GPT. The app should answer from the public
docs, OpenAPI, model catalog, VaaS receipt docs, and pricing markdown, and it
should avoid claiming account-scoped capabilities are enabled before workspace
readiness confirms them.
