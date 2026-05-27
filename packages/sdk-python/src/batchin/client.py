from __future__ import annotations

from typing import Any

import httpx


class BatchInClient:
    def __init__(
        self,
        *,
        base_url: str = "https://api.batchin.tech/v1",
        api_key: str | None = None,
        transport: httpx.BaseTransport | None = None,
        timeout: float = 30.0,
    ) -> None:
        headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
        self._client = httpx.Client(
            base_url=base_url.rstrip("/"),
            headers=headers,
            timeout=timeout,
            transport=transport,
        )

    def request(self, method: str, path: str, **kwargs: Any) -> dict[str, Any]:
        response = self._client.request(method, path, **kwargs)
        response.raise_for_status()
        return response.json()

    def models(self) -> dict[str, Any]:
        return self.request("GET", "/models")

    def chat_completions(self, body: dict[str, Any]) -> dict[str, Any]:
        return self.request("POST", "/chat/completions", json=body)

    def usage(self, view: str = "summary") -> dict[str, Any]:
        return self.request("GET", f"/usage/{view}")

    def receipt(self, record_id: str) -> dict[str, Any]:
        return self.request("GET", f"/audit/{record_id}/receipt")
