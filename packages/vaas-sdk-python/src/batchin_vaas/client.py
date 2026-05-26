"""BatchIn VaaS client for live audit receipts and evidence bundles."""

from __future__ import annotations

from typing import Any

import httpx


class VaasClient:
    def __init__(
        self,
        *,
        base_url: str,
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

    def _get(self, path: str) -> dict[str, Any]:
        response = self._client.get(path)
        response.raise_for_status()
        return response.json()

    def _post(self, path: str, body: dict[str, Any]) -> dict[str, Any]:
        response = self._client.post(path, json=body)
        response.raise_for_status()
        return response.json()

    def verify_signature(self, record_id: str) -> dict[str, Any]:
        return self._get(f"/v1/audit/{record_id}/verify")

    def get_audit(self, record_id: str) -> dict[str, Any]:
        return self._get(f"/v1/audit/{record_id}")

    def get_chain(self) -> dict[str, Any]:
        return self._get("/v1/audit/chain/integrity")

    def get_evidence(self, record_id: str) -> dict[str, Any]:
        return self._get(f"/v1/audit/{record_id}/evidence")

    def get_receipt(self, record_id: str) -> dict[str, Any]:
        return self._get(f"/v1/audit/{record_id}/receipt")

    def get_bundle(self, record_id: str) -> dict[str, Any]:
        return self._get(f"/v1/audit/{record_id}/bundle")

    def verify_bundle(self, *, receipt: dict[str, Any], evidence: dict[str, Any]) -> dict[str, Any]:
        return self._post("/v1/audit/verify-bundle", {"receipt": receipt, "evidence": evidence})

    def get_pubkey_current(self) -> dict[str, Any]:
        return self._get("/v1/audit/pubkey/current")
