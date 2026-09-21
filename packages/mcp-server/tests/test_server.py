from __future__ import annotations

import json
from batchin_mcp.server import TOOLS, RESOURCES, handle_request


def test_mcp_tools_registration():
    tool_names = [t["name"] for t in TOOLS]
    expected = [
        "chat_completion",
        "batch_submit",
        "usage_query",
        "quote",
        "vaas_verify_receipt",
        "vaas_get_receipt",
        "batchin_query_pricing",
        "batchin_agent_trace_run",
        "batchin_model_fallback",
    ]
    for exp in expected:
        assert exp in tool_names, f"Missing MCP tool: {exp}"


def test_mcp_resources_registration():
    uris = [r["uri"] for r in RESOURCES]
    assert "batchin://docs/agents" in uris
    assert "batchin://docs/pricing" in uris
    assert "batchin://openapi" in uris
    assert "batchin://catalog/models" in uris


def test_json_rpc_tools_list():
    req = {"jsonrpc": "2.0", "id": 1, "method": "tools/list"}
    resp = handle_request(req)
    assert resp["id"] == 1
    assert "tools" in resp["result"]
    assert len(resp["result"]["tools"]) >= 8


def test_json_rpc_resources_read():
    req = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "resources/read",
        "params": {"uri": "batchin://docs/agents"},
    }
    resp = handle_request(req)
    assert resp["id"] == 2
    contents = resp["result"]["contents"]
    assert len(contents) == 1
    assert "BatchIn agent guide" in contents[0]["text"]
