# batchin

Official Python SDK for the **BatchIn AI Inference Control Plane**.

Provides an OpenAI-compatible interface, high-availability model routing, real-time streaming, usage tracking, and cryptographic VaaS receipt verification.

---

## Installation

```bash
pip install batchin
```

Or from source:

```bash
git clone https://github.com/aw3703/batchin-public.git
cd batchin-public/packages/sdk-python
pip install -e .
```

---

## Quickstart

### Synchronous Chat Completions

```python
from batchin import BatchIn

client = BatchIn(api_key="your-batchin-api-key")

response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[
        {"role": "system", "content": "You are a helpful coding assistant."},
        {"role": "user", "content": "Write a quicksort function in Python."},
    ],
    temperature=0.7,
)

print(response["choices"][0]["message"]["content"])
```

### Real-Time Streaming

```python
for chunk in client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[{"role": "user", "content": "Explain Merkle trees in two sentences."}],
    stream=True,
):
    delta = chunk["choices"][0]["delta"].get("content", "")
    print(delta, end="", flush=True)
print()
```

### Asynchronous Client

```python
import asyncio
from batchin import AsyncBatchIn

async def main():
    async with AsyncBatchIn(api_key="your-batchin-api-key") as client:
        response = await client.chat.completions.create(
            model="qwen3.8-max",
            messages=[{"role": "user", "content": "Hello from async python!"}],
        )
        print(response)

asyncio.run(main())
```

### VaaS Cryptographic Receipt Retrieval

```python
receipt = client.vaas.get_receipt("rec_98bf12")
bundle = client.vaas.get_bundle("rec_98bf12")
print("VaaS evidence bundle:", bundle)
```
