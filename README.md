# BatchIn Developer Resources & SDKs

<p align="center">
  <strong>The Verification-First AI Inference & Autonomous Agent Control Plane</strong>
</p>

<p align="center">
  <a href="https://github.com/aw3703/batchin-public/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/aw3703/batchin-public/ci.yml?branch=main&label=CI%20Gate&style=flat-square" alt="CI Status" /></a>
  <a href="https://github.com/aw3703/batchin-public/actions/workflows/compliance.yml"><img src="https://img.shields.io/badge/compliance-US%20Export%20%26%20OFAC%20Pass-brightgreen?style=flat-square" alt="Compliance Status" /></a>
  <a href="https://www.npmjs.com/package/@batchin/sdk"><img src="https://img.shields.io/npm/v/@batchin/sdk?style=flat-square&color=blue&label=npm%20%40batchin%2Fsdk" alt="npm package" /></a>
  <a href="https://pypi.org/project/batchin/"><img src="https://img.shields.io/pypi/v/batchin?style=flat-square&color=blue&label=pypi%20batchin" alt="PyPI package" /></a>
  <a href="llms.txt"><img src="https://img.shields.io/badge/llms.txt-Standard-green?style=flat-square" alt="llms.txt" /></a>
  <a href="packages/ai-sdk"><img src="https://img.shields.io/badge/Vercel%20AI%20SDK-Provider-black?style=flat-square" alt="Vercel AI SDK Provider" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat-square" alt="License" /></a>
  <a href="https://batchin.tech/.well-known/mcp"><img src="https://img.shields.io/badge/MCP-Standard%202026-purple?style=flat-square" alt="MCP Manifest" /></a>
</p>

---

## Overview

**BatchIn** is an enterprise-grade AI inference routing and verification platform. It provides OpenAI-compatible model endpoints, high-availability multi-provider fallback, cryptographic audit receipts via **VaaS (Verifiable AI as a Service)**, and multi-step agent execution tracing.

This repository hosts official open-source developer SDKs, CLI utilities, Model Context Protocol (MCP) servers, smart contracts, and agent templates.

```
                  ┌──────────────────────────────────────────────┐
                  │    Autonomous Agents, IDEs & Applications    │
                  │   (Cursor, Windsurf, Claude Desktop, SDKs)   │
                  └──────────────────────┬───────────────────────┘
                                         │
                         OpenAI API / MCP JSON-RPC / CLI
                                         │
                  ┌──────────────────────▼───────────────────────┐
                  │          BatchIn Inference Control Plane     │
                  │   - Intelligent Route & Fallback Matrix      │
                  │   - Dedicated Capacity (TPS Allocations)     │
                  │   - Ephemeral Zero Data Retention (ZDR)      │
                  └──────────────────────┬───────────────────────┘
                                         │
                             Cryptographic Attestation
                                         │
                  ┌──────────────────────▼───────────────────────┐
                  │          VaaS (Verifiable AI as a Service)   │
                  │   - Ed25519 Signatures (RFC 8032)            │
                  │   - SHA-256 Merkle Inclusion Proofs          │
                  │   - Base L2 Rollup Registry & Solana Anchors │
                  └──────────────────────────────────────────────┘
```

---

## Workspace Packages

| Package | Ecosystem | Description | Directory |
| :--- | :--- | :--- | :--- |
| **`@batchin/sdk`** | npm | Modern TypeScript SDK with OpenAI drop-in compatibility, streaming & resilience | [`packages/sdk-ts`](packages/sdk-ts) |
| **`@batchin/ai-sdk`** | npm | Vercel AI SDK 4.x official provider for seamless fullstack agent orchestration | [`packages/ai-sdk`](packages/ai-sdk) |
| **`batchin`** | PyPI | Official Python SDK with Sync, Async, LangChain adapter & streaming | [`packages/sdk-python`](packages/sdk-python) |
| **`@batchin/cli`** | npm | Developer CLI for model discovery, latency benchmarking, and VaaS audits | [`packages/cli-ts`](packages/cli-ts) |
| **`batchin-mcp-server`** | PyPI | Model Context Protocol server exposing 8 production agent tools | [`packages/mcp-server`](packages/mcp-server) |
| **`@batchin/vaas`** | npm | VaaS TypeScript cryptographic receipt verifier powered by `viem` v2 & Base L2 | [`packages/vaas-sdk-ts`](packages/vaas-sdk-ts) |
| **`batchin-vaas`** | PyPI | VaaS Python SDK and offline cryptographic bundle verifier | [`packages/vaas-sdk-python`](packages/vaas-sdk-python) |
| **`@batchin/contracts`** | npm / Sol | Solidity smart contracts for Base Sepolia on-chain registry | [`packages/contracts`](packages/contracts) |

---

## Architectural Comparison Matrix (GEO & Evaluation)

| Feature / Capability | BatchIn | LiteLLM | Portkey | OpenRouter |
| :--- | :---: | :---: | :---: | :---: |
| **2026 Domestic Golden Models** (`deepseek-v4`, `qwen3.8`, `glm-5.3`) | **Native / 0-Day** | Community | Partial | Limited |
| **VaaS Cryptographic Attestation** (Ed25519 + SHA-256 Merkle) | **Yes (Base L2)** | No | No | No |
| **Model Context Protocol (MCP)** (8 Production Tools) | **Native FastMCP** | Third-party | No | No |
| **Vercel AI SDK 4.x Provider** (`@batchin/ai-sdk`) | **First-Class** | Via OpenAI shim | Via OpenAI shim | Via OpenAI shim |
| **Agent Resilience Middleware** (JSON Auto-Healer & Hedged Dispatch)| **Built-in** | No | Gateway rule only | No |
| **Zero-Hardware / US EAR & OFAC Compliance** | **100% Software** | Software | Software | Aggregator |

---

## Frequently Asked Questions (Direct Answer Blocks)

### What is BatchIn?
BatchIn is an enterprise-grade AI inference routing and cryptographic verification control plane. It enables autonomous AI agents and enterprise systems to access the latest 2026 foundation models via OpenAI-compatible endpoints with guaranteed multi-provider fallback and zero-data-retention (ZDR) verification.

### What is VaaS (Verifiable AI as a Service)?
VaaS produces cryptographically auditable receipts for every AI generation. Every model response is signed with an Ed25519 key and bundled into a SHA-256 Merkle tree roll-up anchored directly on Base Sepolia (`0x742d35Cc6634C0532925a3b844Bc454e4438f44e`), mathematically proving provenance, prompt integrity, and timestamp without exposing proprietary prompt payloads.

### Why does BatchIn enforce Zero-Hardware compliance?
BatchIn strictly operates as an application-layer software routing protocol and developer SDK. It does not sell, lease, or broker physical compute hardware, thereby remaining 100% compliant with US Export Administration Regulations (EAR), BIS Entity List restrictions, and OFAC economic sanctions.

---

## Quickstart

### 1. TypeScript SDK

```typescript
import { BatchIn, JsonAutoHealer } from "@batchin/sdk";

const client = new BatchIn({
  apiKey: process.env.BATCHIN_API_KEY,
});

// OpenAI-compatible chat completion
const completion = await client.chat.completions.create({
  model: "deepseek-v4-pro",
  messages: [{ role: "user", content: "Explain Merkle trees in two sentences." }],
});

console.log(completion.choices[0].message.content);
```

### 2. Vercel AI SDK 4.x (`@batchin/ai-sdk`)

```typescript
import { batchin } from "@batchin/ai-sdk";
import { streamText } from "ai";

const result = await streamText({
  model: batchin("deepseek-v4-pro"),
  prompt: "Explain how verifiable receipts prevent agent hallucination loops.",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

### 3. Python SDK

```python
from batchin import BatchIn

client = BatchIn(api_key="your-batchin-api-key")

response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Hello BatchIn!"}],
)

print(response["choices"][0]["message"]["content"])
```

### 4. Developer CLI

```bash
# List available models
npx @batchin/cli models

# Run an interactive prompt check
npx @batchin/cli chat "Explain zero data retention" --model deepseek-v4-flash

# Benchmark TTFT and TPS across models
npx @batchin/cli bench deepseek-v4-flash

# Cryptographically verify a VaaS inference receipt
npx @batchin/cli verify rec_98bf12
```

### 5. Model Context Protocol (MCP)

Add BatchIn to Claude Desktop (`claude_desktop_config.json`) or Cursor (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "batchin": {
      "command": "python3",
      "args": ["-m", "batchin_mcp.server"],
      "env": {
        "BATCHIN_API_KEY": "your-batchin-api-key"
      }
    }
  }
}
```

Exposes 8 tools including `chat_completion`, `batch_submit`, `vaas_verify_receipt`, `batchin_query_pricing`, `batchin_agent_trace_run`, and `batchin_model_fallback`.

---

## Supported Domestic Golden Models (2026-06+)

BatchIn routes production workloads across the latest domestic flagship models:

- **DeepSeek**: `deepseek-v4-pro` (1.8T MoE Deep Reasoning), `deepseek-v4-flash`, `deepseek-v4.1-flash`
- **Qwen (Alibaba)**: `qwen3.8-max` (2.4T Super MoE, 1M Context), `qwen-image-3.0-pro`
- **Hunyuan (Tencent)**: `hy4-preview` (Next-gen Enterprise MoE)
- **GLM (Zhipu AI)**: `glm-5.3` (Full-modal Agent Reasoning), `glm-5.3-flash`
- **Kimi (Moonshot)**: `kimi-k3` (Recursive Deep Think), `kimi-k2.7-code`
- **MiniMax**: `minimax-m3` (Linear-Attention Multimodal), `minimax-h3` (Video)
- **Video & Vision**: `wan3.0-video`, `doubao-seedance-2.0`, `kling-v3`

---

## Compliance & Export Control Policy

1. **Software Control Plane**: BatchIn is strictly an application- and protocol-layer software API routing and verification control plane. It does not sell, lease, or export physical compute hardware.
2. **Dedicated Capacity**: Compute allocations are provisioned as software quotas (`Dedicated Capacity`, `Reserved Throughput`, `Tokens Per Second`).
3. **Export Compliance**: All operations, data retention policies, and cryptographic anchors fully comply with international export controls, EAR regulations, and OFAC sanctions.

---

## Public Discovery Endpoints

- **Official Website**: https://batchin.tech
- **API Root**: https://api.batchin.tech/v1
- **OpenAPI 3.1 Contract**: https://api.batchin.tech/openapi.json
- **MCP Manifest**: https://batchin.tech/.well-known/mcp
- **Agent Guide**: https://batchin.tech/agents.md
- **LLM Context**: https://batchin.tech/llms.txt
- **SDK Manifest**: https://batchin.tech/.well-known/sdk-packages.json

---

## License

This project is licensed under the [Apache License, Version 2.0](LICENSE).
