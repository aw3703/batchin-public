"""JSON-RPC handler for BatchIn MCP tooling."""

from __future__ import annotations

import json
import os
import sys
from collections.abc import Mapping
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from typing import Any

JSON_RPC_VERSION = "2.0"
DEFAULT_API_BASE_URL = "https://api.batchin.tech"
TOOLS = [
    {
        "name": "chat_completion",
        "description": "Call BatchIn /v1/chat/completions.",
        "annotations": {
            "title": "Create chat completion",
            "readOnlyHint": False,
            "destructiveHint": False,
            "idempotentHint": False,
            "openWorldHint": True,
        },
    },
    {
        "name": "batch_submit",
        "description": "Submit a BatchIn /v1/batches job.",
        "annotations": {
            "title": "Submit batch job",
            "readOnlyHint": False,
            "destructiveHint": False,
            "idempotentHint": False,
            "openWorldHint": True,
        },
    },
    {
        "name": "usage_query",
        "description": "Query BatchIn usage data.",
        "annotations": {
            "title": "Query usage",
            "readOnlyHint": True,
            "destructiveHint": False,
            "idempotentHint": True,
            "openWorldHint": False,
        },
    },
    {
        "name": "quote",
        "description": "Create a BatchIn cost quote.",
        "annotations": {
            "title": "Request quote",
            "readOnlyHint": False,
            "destructiveHint": False,
            "idempotentHint": False,
            "openWorldHint": True,
        },
    },
]
RESOURCES = [
    {
        "uri": "batchin://docs/agents",
        "name": "BatchIn agent guide",
        "description": "Reviewed public guidance for authenticated BatchIn agent integrations.",
        "mimeType": "text/markdown",
    },
    {
        "uri": "batchin://docs/pricing",
        "name": "BatchIn workspace guide",
        "description": "Reviewed public guidance for account-scoped BatchIn workspace behavior.",
        "mimeType": "text/markdown",
    },
    {
        "uri": "batchin://openapi",
        "name": "BatchIn OpenAPI",
        "description": "Location and usage notes for the public OpenAPI 3.1 contract.",
        "mimeType": "application/json",
    },
    {
        "uri": "batchin://catalog/models",
        "name": "BatchIn catalog pointer",
        "description": "Discovery pointer for account-scoped catalog state.",
        "mimeType": "application/json",
    },
]


@dataclass(frozen=True)
class BatchInClientConfig:
    base_url: str
    api_key: str
    timeout_seconds: float


class BatchInClientError(RuntimeError):
    def __init__(self, message: str, *, status_code: int | None = None, payload: Any | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload


def _ok(request_id: Any, result: Any) -> dict[str, Any]:
    return {"jsonrpc": JSON_RPC_VERSION, "id": request_id, "result": result}


def _fail(request_id: Any, code: int, message: str) -> dict[str, Any]:
    return {"jsonrpc": JSON_RPC_VERSION, "id": request_id, "error": {"code": code, "message": message}}


def _load_client_config() -> BatchInClientConfig:
    api_key = os.getenv("BATCHIN_API_KEY", "").strip()
    if not api_key:
        raise BatchInClientError("BATCHIN_API_KEY is required for BatchIn MCP tool calls.")
    base_url = (os.getenv("BATCHIN_API_BASE_URL") or os.getenv("BATCHIN_API_URL") or DEFAULT_API_BASE_URL).strip().rstrip("/")
    if not base_url.startswith(("https://", "http://")):
        raise BatchInClientError("BATCHIN_API_BASE_URL must be an HTTP(S) URL.")
    try:
        timeout_seconds = max(1.0, min(float(os.getenv("BATCHIN_MCP_TIMEOUT_SECONDS", "60")), 300.0))
    except ValueError:
        timeout_seconds = 60.0
    return BatchInClientConfig(base_url=base_url, api_key=api_key, timeout_seconds=timeout_seconds)


def _json_tool_result(payload: Any) -> dict[str, Any]:
    text = json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True)
    return {"content": [{"type": "text", "text": text}], "structuredContent": payload}


def _decode_json_or_text(raw: bytes) -> Any:
    text = raw.decode("utf-8", errors="replace")
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"text": text}


def _resource_contents(uri: str) -> dict[str, Any]:
    if uri == "batchin://docs/agents":
        return {
            "uri": uri,
            "mimeType": "text/markdown",
            "text": (
                "# BatchIn agent guide\n\n"
                "Start from the reviewed public discovery files, MCP manifest, agents.md, llms.txt, "
                "OpenAPI spec, and API catalog. Customer-callable operations require API-key authentication "
                "and workspace entitlement checks."
            ),
        }
    if uri == "batchin://docs/pricing":
        return {
            "uri": uri,
            "mimeType": "text/markdown",
            "text": (
                "# BatchIn workspace guide\n\n"
                "Workspace-specific pricing and availability are account-scoped. Use reviewed public docs "
                "and authenticated workspace readiness before presenting any capability as enabled."
            ),
        }
    if uri == "batchin://openapi":
        return {
            "uri": uri,
            "mimeType": "application/json",
            "text": json.dumps(
                {"openapi": "3.1", "url": "https://api.batchin.tech/openapi.json", "baseUrl": "https://api.batchin.tech/v1"}
            ),
        }
    if uri == "batchin://catalog/models":
        return {
            "uri": uri,
            "mimeType": "application/json",
            "text": json.dumps(
                {"catalog": "https://batchin.tech/en/models", "api": "https://api.batchin.tech/v1/models", "status": "workspace scoped"}
            ),
        }
    raise KeyError(uri)


def _request_json(
    method: str,
    path: str,
    *,
    body: Mapping[str, Any] | None = None,
    query: Mapping[str, Any] | None = None,
) -> Any:
    config = _load_client_config()
    filtered_query = {key: value for key, value in dict(query or {}).items() if value is not None and value != ""}
    url = f"{config.base_url}{path}"
    if filtered_query:
        url = f"{url}?{urlencode(filtered_query, doseq=True)}"
    data = None
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {config.api_key}",
        "User-Agent": "batchin-mcp-server/0.1.0",
    }
    if body is not None:
        data = json.dumps(dict(body), ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
    request = Request(url, data=data, headers=headers, method=method)
    try:
        with urlopen(request, timeout=config.timeout_seconds) as response:
            return _decode_json_or_text(response.read())
    except HTTPError as exc:
        payload = _decode_json_or_text(exc.read())
        raise BatchInClientError(
            f"BatchIn API returned HTTP {exc.code} for {path}.",
            status_code=exc.code,
            payload=payload,
        ) from exc
    except URLError as exc:
        raise BatchInClientError(f"BatchIn API request failed for {path}: {exc.reason}") from exc


def _required(arguments: Mapping[str, Any], key: str) -> Any:
    value = arguments.get(key)
    if value is None or value == "":
        raise ValueError(f"Missing required argument: {key}")
    return value


def _tool_error(exc: Exception) -> dict[str, Any]:
    if isinstance(exc, BatchInClientError):
        payload: dict[str, Any] = {"error": str(exc)}
        if exc.status_code is not None:
            payload["status_code"] = exc.status_code
        if exc.payload is not None:
            payload["response"] = exc.payload
        return {"isError": True, **_json_tool_result(payload)}
    return {"isError": True, **_json_tool_result({"error": str(exc)})}


def _handle_tool_call(name: str, arguments: Mapping[str, Any]) -> dict[str, Any]:
    if name == "chat_completion":
        try:
            payload = {key: value for key, value in arguments.items() if value is not None}
            payload["model"] = _required(arguments, "model")
            payload["messages"] = _required(arguments, "messages")
            return _json_tool_result(_request_json("POST", "/v1/chat/completions", body=payload))
        except Exception as exc:
            return _tool_error(exc)
    if name == "batch_submit":
        try:
            payload = {key: value for key, value in arguments.items() if value is not None}
            return _json_tool_result(_request_json("POST", "/v1/batches", body=payload))
        except Exception as exc:
            return _tool_error(exc)
    if name == "usage_query":
        try:
            view = str(arguments.get("view") or "summary").strip().strip("/")
            allowed_views = {"summary", "logs", "meter-events", "cost-breakdown", "by-api-key"}
            if view not in allowed_views:
                raise ValueError(f"usage_query view must be one of: {', '.join(sorted(allowed_views))}")
            query = {key: value for key, value in arguments.items() if key != "view"}
            return _json_tool_result(_request_json("GET", f"/v1/usage/{view}", query=query))
        except Exception as exc:
            return _tool_error(exc)
    if name == "quote":
        try:
            payload = {key: value for key, value in arguments.items() if value is not None}
            payload["model"] = _required(arguments, "model")
            payload["estimated_input_tokens"] = _required(arguments, "estimated_input_tokens")
            payload["estimated_output_tokens"] = _required(arguments, "estimated_output_tokens")
            return _json_tool_result(_request_json("POST", "/v1/quote", body=payload))
        except Exception as exc:
            return _tool_error(exc)
    raise KeyError(name)


def handle_request(request: Mapping[str, Any]) -> dict[str, Any] | None:
    """Handle a single JSON-RPC MCP request."""
    request_id = request.get("id")
    if request.get("jsonrpc") != JSON_RPC_VERSION:
        return _fail(request_id, -32600, "Invalid JSON-RPC version")

    method = request.get("method")
    if method == "initialize":
        return _ok(
            request_id,
            {
                "protocolVersion": "2024-11-05",
                "serverInfo": {"name": "batchin-mcp-server", "version": "0.1.0"},
                "capabilities": {"tools": {}, "resources": {}},
            },
        )
    if method == "tools/list":
        return _ok(request_id, {"tools": TOOLS})
    if method == "resources/list":
        return _ok(request_id, {"resources": RESOURCES})
    if method == "resources/read":
        params = request.get("params")
        if not isinstance(params, Mapping):
            return _fail(request_id, -32602, "resources/read params must be an object")
        uri = params.get("uri")
        if not isinstance(uri, str):
            return _fail(request_id, -32602, "resources/read requires a uri")
        try:
            return _ok(request_id, {"contents": [_resource_contents(uri)]})
        except KeyError:
            return _fail(request_id, -32602, f"Unknown resource: {uri}")
    if method == "tools/call":
        params = request.get("params")
        if not isinstance(params, Mapping):
            return _fail(request_id, -32602, "tools/call params must be an object")
        name = params.get("name")
        arguments = params.get("arguments", {})
        if not isinstance(name, str) or not isinstance(arguments, Mapping):
            return _fail(request_id, -32602, "Invalid tool call")
        try:
            return _ok(request_id, _handle_tool_call(name, arguments))
        except KeyError:
            return _fail(request_id, -32601, f"Unknown tool: {name}")
    if method == "notifications/initialized" and "id" not in request:
        return None
    return _fail(request_id, -32601, f"Method not found: {method}")


def main() -> None:
    """Run a newline-delimited JSON-RPC loop over stdin/stdout."""
    for line in sys.stdin:
        text = line.strip()
        if not text:
            continue
        try:
            request = json.loads(text)
        except json.JSONDecodeError:
            print(json.dumps(_fail(None, -32700, "Parse error")), flush=True)
            continue
        response = handle_request(request)
        if response is not None:
            print(json.dumps(response), flush=True)


if __name__ == "__main__":
    main()
