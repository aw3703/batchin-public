# @batchin/sdk

Official TypeScript SDK for the **BatchIn AI Inference Control Plane**.

Provides an OpenAI-compatible interface, high-performance SSE streaming, usage querying, and cryptographic VaaS receipt integration.

---

## Installation

```bash
npm install @batchin/sdk
```

---

## Quickstart

### 1. OpenAI-Compatible Chat Completions

```typescript
import { BatchIn } from "@batchin/sdk";

const client = new BatchIn({
  apiKey: process.env.BATCHIN_API_KEY,
});

const models = await client.models.list();
const modelId = models.data[0].id;
const completion = await client.chat.completions.create({
  model: modelId,
  messages: [
    { role: "system", content: "You are an elite software architect." },
    { role: "user", content: "Explain how VaaS provides zero-trust AI auditability." },
  ],
  temperature: 0.7,
});

console.log(completion.choices[0].message.content);
```

### 2. Real-Time Streaming with Async Iterables

```typescript
const stream = await client.chat.completions.create({
  model: modelId,
  messages: [{ role: "user", content: "Write a haiku about cryptography." }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || "";
  process.stdout.write(content);
}
console.log();
```

### 3. Model Catalog & VaaS Evidence

```typescript
// Query models currently available to this API key
const models = await client.models.list();
console.log("Available models:", models.data.map(m => m.id));

// Retrieve cryptographic VaaS receipt
const receipt = await client.vaas.getReceipt("rec_98bf12");
console.log("Inference receipt:", receipt);
```
