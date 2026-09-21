"""
BatchIn Official Python SDK
Modern, OpenAI-compatible client for BatchIn AI Inference Control Plane.
"""

from __future__ import annotations

import json
import os
from typing import Any, AsyncIterator, Iterator, Mapping, Sequence
import httpx


class BatchInError(Exception):
    """Base exception for BatchIn API errors."""

    def __init__(self, message: str, status_code: int | None = None, payload: Any = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload


class AuthenticationError(BatchInError):
    """Raised when API key is missing or invalid."""
    pass


class RateLimitError(BatchInError):
    """Raised when rate limit or quota is exceeded."""
    pass


class _ChatCompletions:
    def __init__(self, client: BatchIn) -> None:
        self._client = client

    def create(
        self,
        *,
        model: str,
        messages: Sequence[Mapping[str, Any]],
        stream: bool = False,
        temperature: float | None = None,
        top_p: float | None = None,
        max_tokens: int | None = None,
        tools: Sequence[Mapping[str, Any]] | None = None,
        tool_choice: str | Mapping[str, Any] | None = None,
        **kwargs: Any,
    ) -> dict[str, Any] | Iterator[dict[str, Any]]:
        payload: dict[str, Any] = {
            "model": model,
            "messages": list(messages),
            "stream": stream,
            **kwargs,
        }
        if temperature is not None:
            payload["temperature"] = temperature
        if top_p is not None:
            payload["top_p"] = top_p
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if tools is not None:
            payload["tools"] = list(tools)
        if tool_choice is not None:
            payload["tool_choice"] = tool_choice

        if stream:
            return self._stream_completions(payload)
        return self._client.request("POST", "/chat/completions", json=payload)

    def _stream_completions(self, payload: dict[str, Any]) -> Iterator[dict[str, Any]]:
        with self._client._http_client.stream(
            "POST",
            f"{self._client.base_url}/chat/completions",
            json=payload,
            headers={"Accept": "text/event-stream"},
        ) as response:
            if response.status_code != 200:
                text = response.read().decode("utf-8")
                raise BatchInError(f"Streaming failed with status {response.status_code}: {text}", response.status_code)
            for line in response.iter_lines():
                line = line.strip()
                if not line or line.startswith(":"):
                    continue
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    try:
                        yield json.loads(data)
                    except json.JSONDecodeError:
                        continue


class _AsyncChatCompletions:
    def __init__(self, client: AsyncBatchIn) -> None:
        self._client = client

    async def create(
        self,
        *,
        model: str,
        messages: Sequence[Mapping[str, Any]],
        stream: bool = False,
        temperature: float | None = None,
        top_p: float | None = None,
        max_tokens: int | None = None,
        tools: Sequence[Mapping[str, Any]] | None = None,
        tool_choice: str | Mapping[str, Any] | None = None,
        **kwargs: Any,
    ) -> dict[str, Any] | AsyncIterator[dict[str, Any]]:
        payload: dict[str, Any] = {
            "model": model,
            "messages": list(messages),
            "stream": stream,
            **kwargs,
        }
        if temperature is not None:
            payload["temperature"] = temperature
        if top_p is not None:
            payload["top_p"] = top_p
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if tools is not None:
            payload["tools"] = list(tools)
        if tool_choice is not None:
            payload["tool_choice"] = tool_choice

        if stream:
            return self._stream_completions(payload)
        return await self._client.request("POST", "/chat/completions", json=payload)

    async def _stream_completions(self, payload: dict[str, Any]) -> AsyncIterator[dict[str, Any]]:
        async with self._client._http_client.stream(
            "POST",
            f"{self._client.base_url}/chat/completions",
            json=payload,
            headers={"Accept": "text/event-stream"},
        ) as response:
            if response.status_code != 200:
                text = (await response.aread()).decode("utf-8")
                raise BatchInError(f"Streaming failed with status {response.status_code}: {text}", response.status_code)
            async for line in response.aiter_lines():
                line = line.strip()
                if not line or line.startswith(":"):
                    continue
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    try:
                        yield json.loads(data)
                    except json.JSONDecodeError:
                        continue


class _Models:
    def __init__(self, client: BatchIn | AsyncBatchIn) -> None:
        self._client = client

    def list(self) -> dict[str, Any]:
        if isinstance(self._client, AsyncBatchIn):
            raise RuntimeError("Use await client.models.alist() in async client")
        return self._client.request("GET", "/models")

    async def alist(self) -> dict[str, Any]:
        if not isinstance(self._client, AsyncBatchIn):
            raise RuntimeError("Use client.models.list() in sync client")
        return await self._client.request("GET", "/models")


class _Usage:
    def __init__(self, client: BatchIn | AsyncBatchIn) -> None:
        self._client = client

    def get(self, view: str = "summary") -> dict[str, Any]:
        if isinstance(self._client, AsyncBatchIn):
            raise RuntimeError("Use await client.usage.aget() in async client")
        return self._client.request("GET", f"/usage/{view}")

    async def aget(self, view: str = "summary") -> dict[str, Any]:
        if not isinstance(self._client, AsyncBatchIn):
            raise RuntimeError("Use client.usage.get() in sync client")
        return await self._client.request("GET", f"/usage/{view}")


class _VaaS:
    def __init__(self, client: BatchIn | AsyncBatchIn) -> None:
        self._client = client

    def get_receipt(self, record_id: str) -> dict[str, Any]:
        if isinstance(self._client, AsyncBatchIn):
            raise RuntimeError("Use await client.vaas.aget_receipt() in async client")
        return self._client.request("GET", f"/audit/{record_id}/receipt")

    async def aget_receipt(self, record_id: str) -> dict[str, Any]:
        if not isinstance(self._client, AsyncBatchIn):
            raise RuntimeError("Use client.vaas.get_receipt() in sync client")
        return await self._client.request("GET", f"/audit/{record_id}/receipt")

    def get_bundle(self, record_id: str) -> dict[str, Any]:
        if isinstance(self._client, AsyncBatchIn):
            raise RuntimeError("Use await client.vaas.aget_bundle() in async client")
        return self._client.request("GET", f"/vaas/{record_id}/bundle")

    async def aget_bundle(self, record_id: str) -> dict[str, Any]:
        if not isinstance(self._client, AsyncBatchIn):
            raise RuntimeError("Use client.vaas.get_bundle() in sync client")
        return await self._client.request("GET", f"/vaas/{record_id}/bundle")


class BatchIn:
    """Synchronous BatchIn API Client."""

    def __init__(
        self,
        *,
        api_key: str | None = None,
        base_url: str | None = None,
        timeout: float = 60.0,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self.api_key = api_key or os.environ.get("BATCHIN_API_KEY")
        self.base_url = (base_url or os.environ.get("BATCHIN_API_BASE_URL") or "https://api.batchin.tech/v1").rstrip("/")
        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        self._http_client = httpx.Client(
            base_url=self.base_url,
            headers=headers,
            timeout=timeout,
            transport=transport,
        )

        self.chat = type("Chat", (), {"completions": _ChatCompletions(self)})()
        self.models = _Models(self)
        self.usage = _Usage(self)
        self.vaas = _VaaS(self)

    def request(self, method: str, path: str, **kwargs: Any) -> dict[str, Any]:
        try:
            response = self._http_client.request(method, path, **kwargs)
        except httpx.HTTPError as exc:
            raise BatchInError(f"HTTP transport error: {exc}") from exc

        if response.status_code == 401:
            raise AuthenticationError("Invalid or missing BatchIn API key", response.status_code, response.text)
        if response.status_code == 429:
            raise RateLimitError("BatchIn rate limit or quota exceeded", response.status_code, response.text)
        if response.status_code >= 400:
            raise BatchInError(f"BatchIn API error ({response.status_code}): {response.text}", response.status_code)

        try:
            return response.json()
        except Exception:
            return {"text": response.text}

    def close(self) -> None:
        self._http_client.close()

    def __enter__(self) -> BatchIn:
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()


class AsyncBatchIn:
    """Asynchronous BatchIn API Client."""

    def __init__(
        self,
        *,
        api_key: str | None = None,
        base_url: str | None = None,
        timeout: float = 60.0,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self.api_key = api_key or os.environ.get("BATCHIN_API_KEY")
        self.base_url = (base_url or os.environ.get("BATCHIN_API_BASE_URL") or "https://api.batchin.tech/v1").rstrip("/")
        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        self._http_client = httpx.AsyncClient(
            base_url=self.base_url,
            headers=headers,
            timeout=timeout,
            transport=transport,
        )

        self.chat = type("Chat", (), {"completions": _AsyncChatCompletions(self)})()
        self.models = _Models(self)
        self.usage = _Usage(self)
        self.vaas = _VaaS(self)

    async def request(self, method: str, path: str, **kwargs: Any) -> dict[str, Any]:
        try:
            response = await self._http_client.request(method, path, **kwargs)
        except httpx.HTTPError as exc:
            raise BatchInError(f"HTTP transport error: {exc}") from exc

        if response.status_code == 401:
            raise AuthenticationError("Invalid or missing BatchIn API key", response.status_code, response.text)
        if response.status_code == 429:
            raise RateLimitError("BatchIn rate limit or quota exceeded", response.status_code, response.text)
        if response.status_code >= 400:
            raise BatchInError(f"BatchIn API error ({response.status_code}): {response.text}", response.status_code)

        try:
            return response.json()
        except Exception:
            return {"text": response.text}

    async def aclose(self) -> None:
        await self._http_client.aclose()

    async def __aenter__(self) -> AsyncBatchIn:
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.aclose()


# Backward compatibility alias
BatchInClient = BatchIn
