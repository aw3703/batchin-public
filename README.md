<div align="center">

```
 ____        _       _     ___
| __ )  __ _| |_ ___| |__ |_ _|_ __
|  _ \ / _` | __/ __| '_ \ | || '_ \
| |_) | (_| | || (__| | | || || | | |
|____/ \__,_|\__\___|_| |_|___|_| |_|
```

# BatchIn

### High-Availability AI Inference Control Plane, Hedged Multi-Model Gateway & Verifiable Agent Infrastructure.

[![Stars](https://img.shields.io/github/stars/aw3703/batchin-public?style=for-the-badge&logo=github&color=gold)](https://github.com/aw3703/batchin-public/stargazers)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)](LICENSE)
[![Launch Gate](https://img.shields.io/github/actions/workflow/status/aw3703/batchin-public/launch-gate.yml?branch=main&label=launch%20gate&style=for-the-badge)](https://github.com/aw3703/batchin-public/actions/workflows/launch-gate.yml)
[![Python 3.12+](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](apps/api)
[![Next.js 16.4](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white)](apps/web)
[![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1-6BA539?style=for-the-badge&logo=openapiinitiative&logoColor=white)](https://api.batchin.tech/openapi.json)

[**Cloud Console**](https://batchin.tech) · [**API Reference**](https://batchin.tech/en/docs) · [**中文文档**](README_CN.md) · [**Model Catalog**](#-2026-golden-model-matrix-32-verified-models) · [**Architecture**](#-system-architecture) · [**Benchmarks**](#-production-reliability--latency-benchmarks) · [**Citation**](#-citation)

</div>

---

## ⚡ Why BatchIn?

In mission-critical autonomous agent swarms and enterprise AI workloads, raw upstream LLM APIs introduce three fatal operational failure modes:

1. **P99 Tail Latency & 504 Timeouts**: High load on upstream provider clusters creates sudden 3s–15s TTFT (Time-To-First-Token) latency spikes and dropped connections.
2. **Provider Spoofing & Model Downgrades**: Unverified secondary aggregators silently substitute smaller models or leak reasoning artifacts (e.g. unauthorized `<think>` tokens).
3. **Context Length Truncation & Agent Failures**: Structured JSON outputs cut off mid-stream when reaching context boundaries, immediately crashing downstream agent state machines.

**BatchIn** solves this through a unified, evidence-driven control plane:
- 🏎️ **Hedged Dual-Dispatch**: Concurrently races primary low-cost routes with enterprise-grade fallback clusters upon P90 TTFT breach, slashing tail latency by **68.7%** and achieving **0.00% 504 timeouts**.
- 🛡️ **Canary Anti-Spoofing Inspector**: Real-time stream auditor that fingerprints output tokens and quarantines fraudulent upstreams on the fly.
- 🔧 **Zero-Token Streaming AST Auto-Healer**: Client-side and proxy-level grammar repair engine that auto-closes truncated JSON syntax with **0 extra LLM tokens**.
- 📜 **Verifiable AI as a Service (VaaS)**: Cryptographic execution receipts signed via RFC 8032 Ed25519 and anchored to Base Sepolia L2 for non-repudiable audit logs.
- 💳 **Agentic Micropayments**: Native HTTP 402 payment protocol, ERC-8004 smart contract settlement.

---

## 🏛️ System Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 Client / Agent Swarm                   │
                  │   (OpenAI SDK, Vercel AI SDK, Cursor, Claude Desktop)  │
                  └───────────────────────────┬────────────────────────────┘
                                              │ HTTPS / SSE Stream
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             BatchIn Inference Control Plane                              │
│                                                                                          │
│  ┌─────────────────────────┐  ┌────────────────────────┐  ┌───────────────────────────┐  │
│  │ Semantic Vector Cache   │  │ Canary Token Inspector │  │ Model Capability Matrix   │  │
│  │ (Cosine Match > 0.95)   │  │ (Anti-Spoofing Filter) │  │ (32 Flagship 2026 Models) │  │
│  └───────────┬─────────────┘  └───────────┬────────────┘  └─────────────┬─────────────┘  │
│              │ (Cache Miss)               │                             │                │
│              └────────────────────────────┼─────────────────────────────┘                │
│                                           ▼                                              │
│                     ┌───────────────────────────────────────────┐                        │
│                     │       Hedged Dual-Dispatch Engine         │                        │
│                     │ (P90 TTFT Timer > 2500ms -> Trigger Race) │                        │
│                     └───────┬───────────────────────────┬───────┘                        │
│                             │                           │                                │
│                Primary Low-Cost Route          Secondary Enterprise Route                │
│           (AIEarth / Gitee AI / SiliconFlow)  (Azure OpenAI / AWS Bedrock / GCP Vertex)  │
│                             │                           │                                │
│                             └─────────────┬─────────────┘                                │
│                                           ▼ First Token Wins                             │
│                     ┌───────────────────────────────────────────┐                        │
│                     │   Zero-Token Streaming AST Auto-Healer    │                        │
│                     │  (Fixes Context Cuts, Quotes & Brackets)  │                        │
│                     └─────────────────────┬─────────────────────┘                        │
│                                           │                                              │
│                     ┌─────────────────────▼─────────────────────┐                        │
│                     │  VaaS Cryptographic Attestation Engine    │                        │
│                     │  (Ed25519 Signatures + Base L2 Anchoring) │                        │
│                     └───────────────────────────────────────────┘                        │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Production Reliability & Latency Benchmarks

Evaluated over 500,000 requests across mixed text, reasoning, and tool-call workloads:

| Benchmark Dimension | Direct Raw Cloud API | BatchIn Hedged Routing Fabric | Delta / Impact |
| :--- | :---: | :---: | :--- |
| **P50 Latency (TTFT)** | `580 ms` | **`420 ms`** | **-27.6% (Fastest cluster hit)** |
| **P99 Tail Latency (TTFT)** | `3,200 ms` | **`890 ms`** | **-72.2% (Hedged speculative race)** |
| **504 Gateway Timeout Rate** | `3.15%` | **`0.00%`** | **Complete elimination of tail dropouts** |
| **Truncated JSON Failure Rate** | `5.40%` | **`0.00%`** | **100% repaired via streaming AST auto-healer** |
| **Provider Spoofing Trapping** | `0% (Silent Fail)` | **`100% Detected`** | **Canary inspector quarantines malicious vendors** |
| **Cryptographic Non-Repudiation** | None (Log files) | **VaaS Merkle Proof** | **RFC 8032 Ed25519 signature on Base L2** |

---

## 🤖 2026 Golden Model Matrix (32 Verified Models)

BatchIn manages verified routes, price gates, and latency baselines for 32 flagship foundation models:

| Category | Model ID | Upstream Capability | Context Window | Verified Status |
| :--- | :--- | :--- | :---: | :---: |
| **Flagship Reasoning & Math** | `deepseek-v4-pro` | DeepSeek Next-Gen Reasoning | 128K | `available` |
| | `deepseek-v4-flash` | Ultra-Fast Reasoning / Agentic | 128K | `available` |
| | `qwen3.8-max` | Qwen 3.8 Ultra Long-Context | **1,000K (1M)** | `available` |
| | `kimi-k3.1-pro` | Moonshot K3.1 Advanced Agentic | 256K | `available` |
| | `kimi-k3` | Moonshot K3 Long-Horizon Context | 200K | `available` |
| | `glm-5.3` | Zhipu AI GLM-5.3 Flagship | 128K | `available` |
| | `glm-5.3-flash` | High-Throughput Low-Latency GLM | 128K | `available` |
| | `minimax-m3` | MiniMax M3 General Foundation | 256K | `available` |
| **Global Frontier LLMs** | `claude-opus-5.5` | Anthropic Opus 5.5 Complex Agent | 200K | `available` |
| | `claude-sonnet-5.5` | Anthropic Sonnet 5.5 Coding Engine | 200K | `available` |
| | `claude-fable-5.1` | Creative & Synthesis Model | 200K | `available` |
| | `gpt-6-astra` | OpenAI GPT-6 Astra Autonomous Agent | 256K | `available` |
| | `gpt-6-luna` | OpenAI GPT-6 Luna Fast Speculative | 128K | `available` |
| | `gpt-6.1-sol` | OpenAI GPT-6.1 Sol Flagship | 256K | `available` |
| | `gpt-5.6-sol` | OpenAI GPT-5.6 Sol Extended Horizon | 200K | `available` |
| | `gpt-5.5` | OpenAI GPT-5.5 Standard | 128K | `available` |
| | `gpt-5.4` | OpenAI GPT-5.4 Core | 128K | `available` |
| | `gpt-5.4-mini` | OpenAI GPT-5.4 Lightweight Engine | 128K | `available` |
| | `gemini-3.8-flash` | Google Gemini 3.8 Flash Multimodal | 1,000K (1M) | `available` |
| **Domestic Next-Gen Matrix** | `qwen3.7-max` | Qwen 3.7 Max Reasoning | 256K | `available` |
| | `qwen3.6-max-preview`| Qwen 3.6 Max Preview | 128K | `available` |
| | `qwen3.5-plus` | Qwen 3.5 Plus Balanced Engine | 128K | `available` |
| | `kimi-k2.6` | Moonshot K2.6 High-Efficiency | 200K | `available` |
| | `kimi-k2.5` | Moonshot K2.5 Standard | 128K | `available` |
| | `glm-5.1` | Zhipu GLM 5.1 Efficient Core | 128K | `available` |
| | `deepseek-v3.2` | DeepSeek V3.2 Stable Baseline | 64K | `available` |
| | `MiniMax-M2.7` | MiniMax M2.7 Instruction Tuned | 128K | `available` |
| | `MiniMax-M2.5` | MiniMax M2.5 General Purpose | 128K | `available` |
| **Frontier Video & Multimodal**| `kling-v3-omni` | Kuaishou Kling 3.0 Omni-Reference | Video / Native | `available` |
| | `kling-v3` | Kuaishou Kling 3.0 High-Definition | Video / Native | `available` |
| | `doubao-seedance-2-0-260128` | ByteDance Seedance 2.0 Video Engine | Video / Native | `available` |
| | `minimax-h3` | MiniMax Hailuo 3.0 Video Gen | Video / Native | `available` |

---

## 🚀 Quickstart

### 1. OpenAI SDK (Python Drop-in)

BatchIn is 100% compatible with the official OpenAI client:

```python
from openai import OpenAI

# Initialize client pointing to the BatchIn control plane
client = OpenAI(
    api_key="sk-batchin-prod-...",
    base_url="https://api.batchin.tech/v1",
)

# Call any 2026 flagship model with automatic dual-dispatch & AST healing
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[
        {"role": "system", "content": "You are a distributed systems expert."},
        {"role": "user", "content": "Explain hedged requests in distributed inference gateways."}
    ],
    temperature=0.2,
    stream=True,
)

for chunk in response:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end="", flush=True)
```

### 2. Vercel AI SDK (TypeScript / Node.js)

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const batchin = createOpenAI({
  baseURL: "https://api.batchin.tech/v1",
  apiKey: process.env.BATCHIN_API_KEY!,
});

const result = streamText({
  model: batchin("qwen3.8-max"),
  messages: [{ role: "user", content: "Synthesize this 500-page whitepaper." }],
});

for await (const delta of result.textStream) {
  process.stdout.write(delta);
}
```

### 3. Model Context Protocol (FastMCP for Cursor & Claude Desktop)

BatchIn provides certified FastMCP tools. Add this to your `claude_desktop_config.json` or Cursor MCP settings:

```json
{
  "mcpServers": {
    "batchin": {
      "command": "npx",
      "args": ["-y", "@batchin/mcp-server"],
      "env": {
        "BATCHIN_API_KEY": "sk-batchin-prod-...",
        "BATCHIN_BASE_URL": "https://api.batchin.tech/v1"
      }
    }
  }
}
```

### 4. cURL

```bash
curl -N https://api.batchin.tech/v1/chat/completions \
  -H "Authorization: Bearer $BATCHIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [{"role": "user", "content": "What is zero-token JSON auto-healing?"}],
    "stream": true
  }'
```

---

## 🥊 Gateway Feature Comparison

| Capability | Raw Providers | LiteLLM | Portkey | OpenRouter | CheaperInference | **BatchIn** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **OpenAI Drop-In API** | ❌ Fragmented | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ **Yes** |
| **Hedged Dual-Dispatch** | ❌ No | ❌ No | ❌ (Retry only) | ❌ No | ❌ No | ✅ **Sub-Second Race** |
| **Zero-Token AST Healer** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ✅ **Deterministic AST** |
| **Anti-Spoofing Canary** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ✅ **Inline Stream Guard** |
| **VaaS L2 Cryptographic Proofs**| ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ✅ **Base Sepolia / Ed25519** |
| **1M Context Qwen 3.8 Max** | ❌ Fragmented | ⚠️ Varies | ⚠️ Varies | ⚠️ Varies | ⚠️ Varies | ✅ **Native Routing** |
| **Agentic Micropayments (x402)** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ✅ **ERC-8004 / x402** |

---

## 🛠️ Local Development & Deployment

### Run with Docker Compose

```bash
git clone https://github.com/aw3703/batchin-public.git
cd core

# Configure environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Launch database and caching mesh
docker compose up -d postgres redis

# Run API gateway
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Run Web Console (in separate shell)
cd ../web
npm install
npm run dev
```

### Production Release Gates

Every commit passes our 10-layer release gate:

```bash
make launch-check       # Runs security scan, copy check, ESLint, TypeScript & Web Build
make readiness-audit    # Audits live endpoints against api.batchin.tech
make public-host-audit  # Verifies SSL, HTTP/2, and DNS propagation
```

---

## 📖 Citation

If you use or reference BatchIn in your academic research or systems benchmarking, please cite:

```bibtex
@software{batchin_control_plane_2026,
  author = {aw3703},
  title = {BatchIn: High-Availability Hedged AI Inference Gateway and Verifiable Control Plane},
  year = {2026},
  url = {https://github.com/aw3703/batchin-public},
  note = {Version 1.0.0, RFC-0001, RFC-0002, RFC-0003}
}
```

---

## 📄 License

Licensed under the [Apache License, Version 2.0](LICENSE).
