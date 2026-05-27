# BatchIn external publishing checklist

This file tracks publication mechanics for public developer resources. It is a
release checklist, not a product capability list and not a claim that any
external listing is already live.

## Package registries

### NPM

- Package: @batchin/vaas
- Source: packages/vaas-sdk-ts
- Purpose: TypeScript client for authenticated BatchIn developer workflows.
- Publish command:

    cd packages/vaas-sdk-ts
    npm publish --access public

### PyPI

- Package: batchin-vaas
- Source: packages/vaas-sdk-python
- Purpose: Python client for authenticated BatchIn developer workflows.
- Publish command:

    cd packages/vaas-sdk-python
    python -m build
    twine upload dist/*

- Package: batchin-mcp-server
- Source: packages/mcp-server
- Purpose: Local MCP JSON-RPC connector for authenticated BatchIn workflows.
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

Submit only after the public manifest, package metadata, and workspace
entitlement wording have been reviewed.

## Agent platform configs

Example configs live in examples/agent-configs. Link that directory from any
public docs or package README used for registry submission.

## Skills registry

Submit official skills only after the public skill copy has been reviewed for
product-scope leakage.

## ChatGPT app

Do not publish a marketing-only GPT. The app should answer only from reviewed
public docs and must avoid claiming account-scoped capabilities are enabled
before workspace readiness confirms them.
