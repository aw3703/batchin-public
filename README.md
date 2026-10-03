<div align="center">

```
  ____            _         _     ___
 | __ )   __ _  | |_  ___ | |__ |_ _| _ __
 |  _ \  / _` | | __|/ __|| '_ \ | | | '_ \
 | |_) || (_| | | |_| (__ | | | || | | | | |
 |____/  \__,_|  \__|\___||_| |_||___|_| |_|
```

# BatchIn Public Developer Resources

SDKs, a CLI, an MCP connector, and VaaS receipt verification for the BatchIn API.

[![Stars](https://img.shields.io/github/stars/aw3703/batchin-public?style=for-the-badge&logo=github&color=gold)](https://github.com/aw3703/batchin-public/stargazers)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/aw3703/batchin-public/ci.yml?branch=main&label=CI&style=for-the-badge)](https://github.com/aw3703/batchin-public/actions/workflows/ci.yml)
[![Security](https://img.shields.io/badge/security-policy-2f855a?style=for-the-badge)](SECURITY.md)

[Website](https://batchin.tech) · [API reference](https://api.batchin.tech/openapi.json) · [Discussions](https://github.com/aw3703/batchin-public/discussions) · [Contributing](CONTRIBUTING.md) · [中文 README](README_CN.md)

</div>

---

## What is in this repository?

This repository contains the public client surface for BatchIn. It does not contain the private control plane, provider credentials, customer data, or a static guarantee that a particular model, route, price, payment rail, or chain anchor is available.

The hosted API is the source of truth. A model is usable only when the account is entitled and the API catalog reports verified provider, pricing, usage, and billing evidence. The SDKs surface provider errors and unavailable states; they do not turn a catalog row into a fabricated success.

## Quickstart

Install the SDK for your language:

```bash
npm install @batchin/sdk
```

```python
pip install batchin
```

Discover the models enabled for the API key, then use a returned ID. Do not copy a model ID from an old README or a cached example:

```bash
curl https://api.batchin.tech/v1/models \
  -H "Authorization: Bearer $BATCHIN_API_KEY"
```

```python
from batchin import BatchIn

client = BatchIn(api_key="your_batchin_api_key")
models = client.models.list()
model_id = models["data"][0]["id"]
response = client.chat.completions.create(
    model=model_id,
    messages=[{"role": "user", "content": "Hello BatchIn"}],
)
print(response)
```

For OpenAI-compatible clients, use `https://api.batchin.tech/v1` as the base URL and follow the API reference for the exact route and supported parameters. Multimodal and asynchronous media tasks have separate request contracts and require an enabled route.

## Packages

| Package | Ecosystem | Scope |
| --- | --- | --- |
| [`@batchin/sdk`](packages/sdk-ts) | npm | Authenticated TypeScript requests, streaming, model discovery, and usage metadata |
| [`batchin`](packages/sdk-python) | PyPI | Authenticated Python client and framework adapters |
| [`@batchin/ai-sdk`](packages/ai-sdk) | npm | Vercel AI SDK provider adapter |
| [`batchin-mcp-server`](packages/mcp-server) | PyPI | MCP tools for catalog, inference, pricing, traces, and receipt workflows |
| [`@batchin/cli`](packages/cli-ts) | npm | Authenticated API checks and model discovery |
| [`@batchin/vaas`](packages/vaas-sdk-ts) | npm | Receipt and evidence verification client |
| [`batchin-vaas`](packages/vaas-sdk-python) | PyPI | Python receipt verification client |
| [`@batchin/contracts`](packages/contracts) | npm / Solidity | Public VaaS contract interfaces; deployment status must be verified before use |

Package tests use deterministic fixtures and mocked transports so they can run without credentials. A passing local test proves client behavior only; it is not provider, payment, model, or chain smoke evidence.

## VaaS and payment readiness

VaaS receipts can be verified locally when a real receipt bundle is supplied. Chain anchoring, x402, USDC, and payment settlement are account- and environment-gated. Use the API readiness endpoints and ledger records before presenting those paths as available to a customer.

```bash
npx @batchin/vaas verify <receipt-file-or-record-id> \
  --endpoint https://api.batchin.tech
```

Never treat a test fixture, a contract source file, an HTTP 200 response, or a model-list entry as production settlement or inference evidence.

## Local development

```bash
git clone https://github.com/aw3703/batchin-public.git
cd batchin-public
npm install
npm run typecheck
npm run build
npm run test:ts
npm run test:py
npm run compliance
```

Python package tests require Python 3.10+; Node packages require Node 20+. Read the package README before publishing or using a generated build. Do not commit `.env` files, API keys, provider credentials, payment secrets, or customer prompts.

## Reporting issues

For runtime failures, include the package and version, route, model ID, request ID or trace ID, and a sanitized error. Use the model request template for onboarding requests. Report vulnerabilities privately under [SECURITY.md](SECURITY.md), not in a public issue.

## Roadmap

The public repository tracks client contracts and adapters. Hosted model availability, pricing, provider routing, multimodal execution, billing, VaaS anchoring, and agent payment settlement are released from the private control plane only after live smoke and ledger evidence. Follow releases and discussions for verified changes.

## License

Licensed under the [Apache License, Version 2.0](LICENSE).
