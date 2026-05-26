# BatchIn MCP Server

MCP JSON-RPC server for exposing authenticated BatchIn backend tools.

The server performs real BatchIn API calls. It does not return mock results or
placeholder payloads.

## Configuration

Set these environment variables before starting the MCP process:

- BATCHIN_API_KEY: required customer API key used as Authorization: Bearer ...
- BATCHIN_API_BASE_URL: optional, defaults to https://api.batchin.tech
- BATCHIN_MCP_TIMEOUT_SECONDS: optional request timeout, defaults to 60

## Tools

- chat_completion: POST /v1/chat/completions
- batch_submit: POST /v1/batches
- usage_query: GET /v1/usage/{summary|logs|meter-events|cost-breakdown|by-api-key}
- quote: POST /v1/quote

Each tool includes MCP behavioral annotations for read-only, idempotency,
destructive, and open-world hints.

## Resources

- batchin://docs/agents
- batchin://docs/pricing
- batchin://openapi
- batchin://catalog/models

## Claude Desktop

Point your local MCP client at python -m batchin_mcp.server with the
environment above.

Example config:

    {
      "mcpServers": {
        "batchin": {
          "command": "python",
          "args": ["-m", "batchin_mcp.server"],
          "env": {
            "BATCHIN_API_KEY": "BATCHIN_API_KEY",
            "BATCHIN_API_BASE_URL": "https://api.batchin.tech"
          }
        }
      }
    }

## Cursor

Use the same entrypoint and expose the package path packages/mcp-server/src.
