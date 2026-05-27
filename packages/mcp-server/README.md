# BatchIn MCP Server

MCP JSON-RPC connector for authenticated BatchIn developer workflows.

The server performs real BatchIn API calls. Customer operations require API-key
authentication and workspace entitlement checks.

## Configuration

This package is source-ready in the public BatchIn repository. Use the source
checkout until PyPI publication is verified:

    git clone https://github.com/aw3703/batchin-public.git
    cd batchin-public/packages/mcp-server
    python -m pip install -e .

Set these environment variables before starting the MCP process:

- BATCHIN_API_KEY: required customer API key used as Authorization: Bearer ...
- BATCHIN_API_BASE_URL: optional, defaults to https://api.batchin.tech
- BATCHIN_MCP_TIMEOUT_SECONDS: optional request timeout, defaults to 60

## Tools

The tool surface follows the authenticated BatchIn API and the caller's
workspace entitlements. Each tool includes MCP behavioral annotations for
read-only, idempotency, destructive, and open-world hints.

## Resources

- batchin://docs/agents
- batchin://openapi

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
