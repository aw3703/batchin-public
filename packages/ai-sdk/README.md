# @batchin/ai-sdk

Official [Vercel AI SDK](https://sdk.vercel.ai/docs) Provider for BatchIn 2026 Golden Models and VaaS Cryptographic Verification.

## Installation

```bash
npm install @batchin/ai-sdk ai
```

## Quick Start

```typescript
import { batchin } from "@batchin/ai-sdk";
import { streamText, generateText } from "ai";

// 1. Text streaming with DeepSeek-V4 Pro
const result = await streamText({
  model: batchin("deepseek-v4-pro"),
  prompt: "Explain how VaaS Merkle proofs ensure data integrity.",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}

// 2. Structured generation with Qwen 3.8 Max
const completion = await generateText({
  model: batchin("qwen3.8-max"),
  prompt: "Synthesize 3 key agent design patterns in 2026.",
});

console.log(completion.text);
```

## Custom Configuration

```typescript
import { createBatchIn } from "@batchin/ai-sdk";

const customBatchIn = createBatchIn({
  apiKey: process.env.CUSTOM_BATCHIN_KEY,
  baseURL: "https://api.batchin.tech/v1",
});

const model = customBatchIn("glm-5.3");
```

## Supported Models

- `deepseek-v4-pro`
- `deepseek-v4-flash`
- `deepseek-v4.1-flash`
- `qwen3.8-max`
- `hy4-preview`
- `glm-5.3`
- `glm-5.3-flash`
- `kimi-k3`
- `kimi-k2.7-code`
- `minimax-m3`

## License

Apache-2.0
