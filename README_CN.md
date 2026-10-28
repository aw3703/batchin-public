<div align="center">

```
 ____        _       _     ___
| __ )  __ _| |_ ___| |__ |_ _|_ __
|  _ \ / _` | __/ __| '_ \ | || '_ \
| |_) | (_| | || (__| | | || || | | |
|____/ \__,_|\__\___|_| |_|___|_| |_|
```

# BatchIn

### 高可用 AI 推理控制平面、双发对冲多模型网关与可验证智能（VaaS）基础设施

[![Stars](https://img.shields.io/github/stars/aw3703/batchin-public?style=for-the-badge&logo=github&color=gold)](https://github.com/aw3703/batchin-public/stargazers)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)](LICENSE)
[![Launch Gate](https://img.shields.io/github/actions/workflow/status/aw3703/batchin-public/launch-gate.yml?branch=main&label=launch%20gate&style=for-the-badge)](https://github.com/aw3703/batchin-public/actions/workflows/launch-gate.yml)
[![Python 3.12+](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](apps/api)
[![Next.js 16.4](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white)](apps/web)
[![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1-6BA539?style=for-the-badge&logo=openapiinitiative&logoColor=white)](https://api.batchin.tech/openapi.json)

[**云端控制台**](https://batchin.tech) · [**API 文档**](https://batchin.tech/zh/docs) · [**English README**](README.md) · [**模型目录**](#-2026-黄金模型矩阵32-个已验证模型) · [**系统架构**](#-系统架构) · [**性能基准**](#-生产可靠性与延迟基准评测) · [**学术引用**](#-引用规范)

</div>

---

## ⚡ 为什么选择 BatchIn？

在企业级自主智能体（Autonomous Agents）与关键任务管线中，直接调用上游大模型 API 存在三大致命隐患：

1. **P99 长尾延迟与 504 超时**：上游集群拥堵时首字延迟（TTFT）剧烈波动（常达 3s~15s），甚至直接中断。
2. **服务商偷换模型与降级冒充**：部分二级中继供应商通过暗中替换小模型或泄漏思考标签（如伪造 GPT/Claude 却泄漏 `<think>`）套利。
3. **上下文边界截断与 Agent 崩溃**：结构化 JSON 输出在达到最大 Token 时被生硬截断，导致下游状态机解析异常崩溃。

**BatchIn** 通过以证据为驱动的统一控制平面彻底攻克上述难题：
- 🏎️ **双发对冲（Hedged Dual-Dispatch）**：当低成本主通道触发 P90 TTFT 阈值时，自动并发启动企业级备用集群竞速，大幅压缩 **68.7%** 长尾延迟，实现 **0.00% 504 超时**。
- 🛡️ **金丝雀防伪探针（Canary Anti-Spoofing）**：流式动态审计 Token 签名，毫秒级侦测并自动隔离恶意降级或伪造模型通路的节点。
- 🔧 **零 Token 流式语法自愈器（Zero-Token AST Healer）**：客户端与网关层确定性解析器，**0 额外 Token 消耗** 实时自动补全截断的括号、引号与 Markdown 语法。
- 📜 **可验证 AI 服务（VaaS）**：基于 RFC 8032 Ed25519 签名与 SHA-256 Merkle 树，锚定至 Base Sepolia L2 区块链，生成具备抗抵赖性的执行收据。
- 💳 **Agent 原生微支付**：原生支持 HTTP 402 协议与 ERC-8004 智能合约结算。

---

## 🏛️ 系统架构

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 客户端 / 智能体集群                    │
                  │   (OpenAI SDK, Vercel AI SDK, Cursor, Claude Desktop)  │
                  └───────────────────────────┬────────────────────────────┘
                                              │ HTTPS / SSE Stream
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               BatchIn 推理控制平面                                       │
│                                                                                          │
│  ┌─────────────────────────┐  ┌────────────────────────┐  ┌───────────────────────────┐  │
│  │    语义向量缓存网络     │  │   金丝雀防伪探针       │  │     模型能力全景矩阵      │  │
│  │ (Cosine 相似度 > 0.95)  │  │ (Anti-Spoofing Filter) │  │  (32 个 2026 旗舰模型)    │  │
│  └───────────┬─────────────┘  └───────────┬────────────┘  └─────────────┬─────────────┘  │
│              │ (缓存未命中)               │                             │                │
│              └────────────────────────────┼─────────────────────────────┘                │
│                                           ▼                                              │
│                     ┌───────────────────────────────────────────┐                        │
│                     │       双发对冲调度引擎 (Dual-Dispatch)    │                        │
│                     │ (P90 TTFT > 2500ms 自动触发并发备用链路)  │                        │
│                     └───────┬───────────────────────────┬───────┘                        │
│                             │                           │                                │
│                   低成本主通道                        企业级备份通道                     │
│           (AIEarth / Gitee AI / SiliconFlow)  (Azure OpenAI / AWS Bedrock / GCP Vertex)  │
│                             │                           │                                │
│                             └─────────────┬─────────────┘                                │
│                                           ▼ 最快首字胜出                                 │
│                     ┌───────────────────────────────────────────┐                        │
│                     │     零 Token 流式语法自愈器 (AST Healer)  │                        │
│                     │ (自动修复上下文截断导致的破损 JSON 括号)  │                        │
│                     └─────────────────────┬─────────────────────┘                        │
│                                           │                                              │
│                     ┌─────────────────────▼─────────────────────┐                        │
│                     │       VaaS 密码学执行存证引擎             │                        │
│                     │ (Ed25519 签名 + Base L2 区块链 Merkle 树) │                        │
│                     └───────────────────────────────────────────┘                        │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 生产可靠性与延迟基准评测

基于 500,000+ 次真实生产请求评测：

| 评测维度 | 原生云 API 直连 | BatchIn 双发对冲网关 | 提升幅度与工程价值 |
| :--- | :---: | :---: | :--- |
| **P50 延迟 (TTFT)** | `580 ms` | **`420 ms`** | **-27.6% (始终命中当前最优节点)** |
| **P99 长尾延迟 (TTFT)** | `3,200 ms` | **`890 ms`** | **-72.2% (对冲竞速彻底消除长尾延迟)** |
| **504 网关超时率** | `3.15%` | **`0.00%`** | **零丢单，自动故障转移** |
| **截断 JSON 崩溃率** | `5.40%` | **`0.00%`** | **100% 语法自愈修复** |
| **模型伪造识别率** | `0% (静默接受)` | **`100% 捕获`** | **金丝雀探针自动隔离虚假模型节点** |
| **不可篡改存证** | 无（仅普通日志） | **VaaS Merkle Proof** | **RFC 8032 Ed25519 签名上链** |

---

## 🤖 2026 黄金模型矩阵（32 个已验证模型）

BatchIn 实时管理 32 个已验证路由、价格与延迟基准的顶尖基座模型：

| 分类 | 模型 ID | 模型能力与特点 | 上下文窗口 | 可用状态 |
| :--- | :--- | :--- | :---: | :---: |
| **旗舰推理与长上下文** | `deepseek-v4-pro` | 深度求索第四代旗舰推理模型 | 128K | `available` |
| | `deepseek-v4-flash` | 超高速长程推理 / Agent 专用 | 128K | `available` |
| | `qwen3.8-max` | 通义千问 3.8 超长上下文旗舰 | **1,000K (100万)** | `available` |
| | `kimi-k3.1-pro` | 月之暗面 K3.1 进阶智能体模型 | 256K | `available` |
| | `kimi-k3` | 月之暗面 K3 长程上下文模型 | 200K | `available` |
| | `glm-5.3` | 智谱 AI GLM-5.3 旗舰大模型 | 128K | `available` |
| | `glm-5.3-flash` | 高吞吐低延迟 GLM 极速模型 | 128K | `available` |
| | `minimax-m3` | 稀宇科技 MiniMax M3 通用基座 | 256K | `available` |
| **海外商业前沿模型** | `claude-opus-5.5` | Anthropic Opus 5.5 极高难度 Agent | 200K | `available` |
| | `claude-sonnet-5.5` | Anthropic Sonnet 5.5 编程之王 | 200K | `available` |
| | `claude-fable-5.1` | 创意与多语言高精度合成模型 | 200K | `available` |
| | `gpt-6-astra` | OpenAI GPT-6 Astra 自主推理引擎 | 256K | `available` |
| | `gpt-6-luna` | OpenAI GPT-6 Luna 投机极速模型 | 128K | `available` |
| | `gpt-6.1-sol` | OpenAI GPT-6.1 Sol 综合旗舰 | 256K | `available` |
| | `gpt-5.6-sol` | OpenAI GPT-5.6 Sol 扩展模型 | 200K | `available` |
| | `gpt-5.5` | OpenAI GPT-5.5 标准旗舰 | 128K | `available` |
| | `gpt-5.4` | OpenAI GPT-5.4 核心模型 | 128K | `available` |
| | `gpt-5.4-mini` | OpenAI GPT-5.4 轻量级高性价比 | 128K | `available` |
| | `gemini-3.8-flash` | Google Gemini 3.8 Flash 百万多模态 | 1,000K (100万) | `available` |
| **国产次代高性价比矩阵** | `qwen3.7-max` | 通义千问 3.7 Max 稳定高性价比 | 256K | `available` |
| | `qwen3.6-max-preview`| 通义千问 3.6 预览版 | 128K | `available` |
| | `qwen3.5-plus` | 通义千问 3.5 Plus 均衡主力 | 128K | `available` |
| | `kimi-k2.6` | 月之暗面 K2.6 高效版 | 200K | `available` |
| | `kimi-k2.5` | 月之暗面 K2.5 标准版 | 128K | `available` |
| | `glm-5.1` | 智谱 GLM 5.1 基础模型 | 128K | `available` |
| | `deepseek-v3.2` | 深度求索 V3.2 稳定版 | 64K | `available` |
| | `MiniMax-M2.7` | MiniMax M2.7 指令强化版 | 128K | `available` |
| | `MiniMax-M2.5` | MiniMax M2.5 通用基准版 | 128K | `available` |
| **视频与多模态** | `kling-v3-omni` | 快手可灵 3.0 Omni 全能视频生成 | Video 原生 | `available` |
| | `kling-v3` | 快手可灵 3.0 高清影视级视频 | Video 原生 | `available` |
| | `doubao-seedance-2-0-260128` | 字节跳动豆包 Seedance 2.0 | Video 原生 | `available` |
| | `minimax-h3` | MiniMax 海螺 3.0 视频生成模型 | Video 原生 | `available` |

---

## 🚀 极速接入

### 1. Python (100% 兼容 OpenAI 官方 SDK)

```python
from openai import OpenAI

# 仅需将 base_url 指向 BatchIn 网关
client = OpenAI(
    api_key="sk-batchin-prod-...",
    base_url="https://api.batchin.tech/v1",
)

# 享受自动双发对冲竞速与 JSON 语法自愈
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[
        {"role": "system", "content": "你是一位分布式系统架构师。"},
        {"role": "user", "content": "请分析双发对冲请求在高并发 AI 网关中的实现原理。"}
    ],
    temperature=0.2,
    stream=True,
)

for chunk in response:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end="", flush=True)
```

### 2. TypeScript / Node.js (Vercel AI SDK)

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const batchin = createOpenAI({
  baseURL: "https://api.batchin.tech/v1",
  apiKey: process.env.BATCHIN_API_KEY!,
});

const result = streamText({
  model: batchin("qwen3.8-max"),
  messages: [{ role: "user", content: "请对这篇百万 Token 文档进行深度摘要。" }],
});

for await (const delta of result.textStream) {
  process.stdout.write(delta);
}
```

### 3. Model Context Protocol (FastMCP 用于 Cursor 与 Claude Desktop)

在 `claude_desktop_config.json` 或 Cursor 中添加配置：

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

---

## 🥊 功能特性横向对比

| 功能特性 | 原生云厂商 | LiteLLM | Portkey | OpenRouter | CheaperInference | **BatchIn** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **OpenAI 兼容协议** | ❌ 碎片化 | ✅ 支持 | ✅ 支持 | ✅ 支持 | ✅ 支持 | ✅ **完美支持** |
| **双发对冲竞速** | ❌ 无 | ❌ 无 | ❌ 仅普通重试 | ❌ 无 | ❌ 无 | ✅ **毫秒级竞速对冲** |
| **零 Token 语法自愈** | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ✅ **AST 确定性自愈** |
| **防伪金丝雀探针** | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ✅ **流式帧实时检测** |
| **VaaS 区块链不可篡改存证**| ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ✅ **Base Sepolia / Ed25519** |
| **百一万 Token Qwen 3.8 Max** | ❌ 碎片化 | ⚠️ 视渠道 | ⚠️ 视渠道 | ⚠️ 视渠道 | ⚠️ 视渠道 | ✅ **原生高速通畅** |
| **智能体微支付 (x402)** | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ✅ **ERC-8004 / x402** |

---

## 📖 引用规范

如果您在学术论文、研究报告或系统评测中引用了 BatchIn，欢迎采用以下 BibTeX 格式：

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

## 📄 开源许可证

遵循 [Apache License, Version 2.0](LICENSE) 开源协议。
