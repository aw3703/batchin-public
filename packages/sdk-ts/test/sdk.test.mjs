import test from "node:test";
import assert from "node:assert/strict";
import { BatchIn, BatchInError } from "../src/index.js";

test("BatchIn initialization with custom apiKey and baseUrl", () => {
  const client = new BatchIn({
    apiKey: "test-key-123",
    baseUrl: "https://custom.batchin.ai/v1/",
  });
  assert.equal(client.baseUrl, "https://custom.batchin.ai/v1");
});

test("BatchIn should throw BatchInError on non-ok HTTP responses", async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 401,
    text: async () => JSON.stringify({ error: "Invalid API Key" }),
  });

  const client = new BatchIn({
    apiKey: "bad-key",
    fetchImpl: mockFetch,
  });

  await assert.rejects(
    async () => {
      await client.chat.completions.create({
        model: "deepseek-v4-pro",
        messages: [{ role: "user", content: "hi" }],
      });
    },
    (err) => {
      assert.ok(err instanceof BatchInError);
      assert.equal(err.status, 401);
      return true;
    }
  );
});

test("BatchIn chat completion parses successful response", async () => {
  const mockPayload = {
    id: "chatcmpl-test",
    object: "chat.completion",
    created: 1234567890,
    model: "qwen3.8-max",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: "Hello from BatchIn!" },
        finish_reason: "stop",
      },
    ],
  };

  const mockFetch = async (url, init) => {
    assert.ok(url.endsWith("/chat/completions"));
    assert.equal(init.method, "POST");
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockPayload),
    };
  };

  const client = new BatchIn({
    apiKey: "valid-key",
    fetchImpl: mockFetch,
  });

  const res = await client.chat.completions.create({
    model: "qwen3.8-max",
    messages: [{ role: "user", content: "Hello" }],
  });

  assert.equal(res.id, "chatcmpl-test");
  assert.equal(res.choices[0].message.content, "Hello from BatchIn!");
});
