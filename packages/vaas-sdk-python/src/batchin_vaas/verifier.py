"""Local verifier helpers for BatchIn VaaS receipts and evidence bundles."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import nacl.encoding
import nacl.exceptions
import nacl.signing


def canonicalize(value: dict[str, Any]) -> str:
    def normalize(node: Any) -> Any:
        if isinstance(node, dict):
            return {key: normalize(node[key]) for key in sorted(node)}
        if isinstance(node, list):
            return [normalize(item) for item in node]
        return node

    return json.dumps(normalize(value), sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _normalize_public_key(raw: str) -> str:
    return raw.removeprefix("ed25519:pk_").removeprefix("ed25519:")


def _normalize_signature(raw: str) -> str:
    return raw.removeprefix("ed25519:")


def _sha256_prefixed(payload: dict[str, Any]) -> str:
    import hashlib

    return "sha256:" + hashlib.sha256(canonicalize(payload).encode("utf-8")).hexdigest()


def verify_detached_payload(*, payload: dict[str, Any], signature: str, public_key: str) -> bool:
    try:
        verify_key = nacl.signing.VerifyKey(_normalize_public_key(public_key), encoder=nacl.encoding.HexEncoder)
        verify_key.verify(canonicalize(payload).encode("utf-8"), bytes.fromhex(_normalize_signature(signature)))
        return True
    except (nacl.exceptions.BadSignatureError, TypeError, ValueError):
        return False


def verify_receipt(receipt: dict[str, Any]) -> dict[str, Any]:
    payload = receipt.get("receipt_payload")
    payload_ok = isinstance(payload, dict)
    receipt_hash_ok = payload_ok and receipt.get("receipt_hash") == _sha256_prefixed(payload)
    receipt_signature_ok = payload_ok and verify_detached_payload(
        payload=payload,
        signature=str(receipt.get("receipt_signature") or ""),
        public_key=str(receipt.get("public_key") or ""),
    )
    checks = [
        {"name": "receipt_payload", "valid": bool(payload_ok)},
        {"name": "receipt_hash", "valid": bool(receipt_hash_ok)},
        {"name": "receipt_signature", "valid": bool(receipt_signature_ok)},
    ]
    return {"valid": all(item["valid"] for item in checks), "checks": checks}


def verify_evidence(evidence: dict[str, Any]) -> dict[str, Any]:
    payload = evidence.get("payload")
    payload_ok = isinstance(payload, dict)
    payload_hash_ok = payload_ok and evidence.get("payload_hash") == _sha256_prefixed(payload)
    payload_signature_ok = payload_ok and verify_detached_payload(
        payload=payload,
        signature=str(evidence.get("signature") or ""),
        public_key=str(evidence.get("public_key") or evidence.get("key_id") or ""),
    )
    checks = [
        {"name": "evidence_payload", "valid": bool(payload_ok)},
        {"name": "evidence_hash", "valid": bool(payload_hash_ok)},
        {"name": "evidence_signature", "valid": bool(payload_signature_ok)},
    ]
    return {"valid": all(item["valid"] for item in checks), "checks": checks}


def verify_bundle(*, receipt: dict[str, Any], evidence: dict[str, Any]) -> dict[str, Any]:
    receipt_result = verify_receipt(receipt)
    evidence_result = verify_evidence(evidence)
    evidence_payload = evidence.get("payload") if isinstance(evidence.get("payload"), dict) else {}
    linkage_ok = (
        receipt.get("record_id") == evidence.get("record_id")
        and receipt.get("record_signature") == evidence.get("signature")
        and receipt.get("public_key") == (evidence.get("public_key") or evidence.get("key_id"))
        and receipt.get("request_hash") == evidence_payload.get("input_hash")
        and receipt.get("response_hash") == evidence_payload.get("output_hash")
    )
    checks = [
        *receipt_result["checks"],
        *evidence_result["checks"],
        {"name": "bundle_linkage", "valid": bool(linkage_ok)},
    ]
    return {
        "valid": all(item["valid"] for item in checks),
        "checks": checks,
        "record_id": receipt.get("record_id") or evidence.get("record_id"),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify a BatchIn VaaS receipt bundle.")
    parser.add_argument("--receipt", required=True, help="Path to receipt JSON")
    parser.add_argument("--evidence", required=True, help="Path to evidence JSON")
    args = parser.parse_args()

    receipt = json.loads(Path(args.receipt).read_text(encoding="utf-8"))
    evidence = json.loads(Path(args.evidence).read_text(encoding="utf-8"))
    result = verify_bundle(receipt=receipt, evidence=evidence)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["valid"] else 1
