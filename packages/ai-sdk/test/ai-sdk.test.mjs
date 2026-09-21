import test from "node:test";
import assert from "node:assert/strict";
import { createBatchIn, batchin } from "../dist/index.js";

test("batchin default model factory creates language model with modelId", () => {
  const model = batchin("deepseek-v4-pro");
  assert.equal(model.provider, "batchin");
  assert.equal(model.modelId, "deepseek-v4-pro");
  assert.equal(model.specificationVersion, "v1");
});

test("createBatchIn with custom settings", () => {
  const custom = createBatchIn({
    apiKey: "custom-key",
    baseURL: "https://mock.batchin.local/v1",
  });
  const model = custom("qwen3.8-max");
  assert.equal(model.provider, "batchin");
  assert.equal(model.modelId, "qwen3.8-max");
});

test("doGenerate parses simulated response and receipts", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    return {
      ok: true,
      headers: new Headers({
        "content-type": "application/json",
        "x-vaas-receipt-id": "rec_test_123",
      }),
      json: async () => ({
        id: "chatcmpl-test",
        model: "deepseek-v4-pro",
        choices: [
          {
            message: { role: "assistant", content: "AI SDK Test OK" },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      }),
    };
  };

  try {
    const custom = createBatchIn({ apiKey: "test-key" });
    const model = custom("deepseek-v4-pro");
    const result = await model.doGenerate({
      prompt: [{ role: "user", content: "test" }],
    });

    assert.equal(result.text, "AI SDK Test OK");
    assert.equal(result.finishReason, "stop");
    assert.equal(result.usage.promptTokens, 10);
    assert.equal(result.response.vaasReceiptId, "rec_test_123");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
