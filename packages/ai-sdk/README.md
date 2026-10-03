# @batchin/ai-sdk

Vercel [AI SDK](https://sdk.vercel.ai/docs) provider adapter for BatchIn's authenticated inference API.

## Installation

```bash
npm install @batchin/ai-sdk ai
```

## Quick Start

```typescript
import { batchin } from "@batchin/ai-sdk";
import { streamText, generateText } from "ai";

// Use a model ID returned by the authenticated /v1/models catalog.
const modelId = process.env.BATCHIN_MODEL_ID;
if (!modelId) throw new Error("Set BATCHIN_MODEL_ID from /v1/models");

const result = await streamText({
  model: batchin(modelId),
  prompt: "Explain how a signed inference receipt is verified.",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}

const completion = await generateText({
  model: batchin(modelId),
  prompt: "Synthesize three agent design patterns.",
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

const model = customBatchIn(process.env.BATCHIN_MODEL_ID ?? "");
```

## Model availability

Model IDs and access change with provider smoke, pricing, and account entitlement. Fetch `/v1/models` with the same API key before constructing a provider instance. A fixed model list in client documentation is intentionally not maintained.

## License

Apache-2.0
