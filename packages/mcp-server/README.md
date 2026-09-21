# batchin-mcp-server

The official Model Context Protocol (MCP) server for the **BatchIn AI Inference Control Plane**.

Exposes production-ready tools for OpenAI-compatible inference, batch dispatch, cryptographic VaaS receipt verification, real-time pricing queries, and multi-agent trace correlation to Cursor, Windsurf, Claude Desktop, and autonomous agents.

---

## Capabilities & Tools

| Tool Name | Type | Description |
| :--- | :--- | :--- |
| `chat_completion` | Inference | OpenAI-compatible chat completion via BatchIn high-availability routes |
| `batch_submit` | Batch | Asynchronous batch job dispatch |
| `usage_query` | Billing | Real-time workspace quota and usage querying |
| `quote_estimate` | Pricing | Cost estimation for model inference requests |
| `vaas_verify_receipt` | Security / VaaS | Cryptographically verify Ed25519 signatures and SHA-256 Merkle proofs for inference receipts |
| `vaas_get_receipt` | Security / VaaS | Fetch verifiable evidence bundles, input/output hashes, and Merkle proofs by record ID |
| `batchin_query_pricing` | Pricing | Query live token and multimodal pricing across all active models |
| `batchin_agent_trace_run` | Observability | Trace and correlate multi-step agent runs, tool calls, and cumulative VaaS spend |
| `batchin_model_fallback` | Routing | Query intelligent fallback hierarchies across high, mid, and low reasoning tiers |

---

## Installation

Install from the repository source:

```bash
git clone https://github.com/aw3703/batchin-public.git
cd batchin-public/packages/mcp-server
python3 -m pip install -e .
```

Or run directly with `uvx` / `python`:

```bash
python3 -m batchin_mcp.server
```

---

## Configuration

### Environment Variables
- `BATCHIN_API_KEY`: Required. Your authenticated BatchIn API key.
- `BATCHIN_API_BASE_URL`: Optional. Defaults to `https://api.batchin.tech`.

### Claude Desktop Integration
Add the following to your `claude_desktop_config.json`:

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

### Cursor Integration
Configure in `.cursor/mcp.json`:

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

---

## Compliance & Dedicated Capacity

BatchIn MCP server queries software endpoints, token metrics, and `Dedicated Capacity` allocations. It does not interface with or reference physical compute hardware. All models align with current international safety and export regulations.
