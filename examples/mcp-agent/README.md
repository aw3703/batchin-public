# BatchIn MCP Agent Integration Example

This example demonstrates how to integrate BatchIn Model Context Protocol (MCP) tools into autonomous agents such as Claude Desktop, Cursor, Windsurf, or custom LangChain / LlamaIndex workflows.

---

## 1. Claude Desktop Setup

Edit your `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "batchin": {
      "command": "python3",
      "args": ["-m", "batchin_mcp.server"],
      "env": {
        "BATCHIN_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Once configured, restart Claude Desktop. The hammer icon will reveal 8 tools:
- `chat_completion`
- `batch_submit`
- `usage_query`
- `quote`
- `vaas_verify_receipt`
- `vaas_get_receipt`
- `batchin_query_pricing`
- `batchin_agent_trace_run`
- `batchin_model_fallback`

---

## 2. Cursor IDE Setup

Add to `.cursor/mcp.json` in your workspace:

```json
{
  "mcpServers": {
    "batchin": {
      "command": "python3",
      "args": ["-m", "batchin_mcp.server"],
      "env": {
        "BATCHIN_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Now Cursor can natively dispatch batch requests and verify VaaS cryptographic receipts directly in the Composer or Chat window.
