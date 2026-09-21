# batchin-vaas

Official Python SDK and local bundle verifier for **BatchIn VaaS (Verifiable AI as a Service)**.

Provides cryptographic verification of inference receipts, evidence bundles, Ed25519 signatures, and SHA-256 Merkle proofs.

---

## Installation

```bash
pip install batchin-vaas
```

Or from source:

```bash
git clone https://github.com/aw3703/batchin-public.git
cd batchin-public/packages/vaas-sdk-python
pip install -e .
```

---

## Python Usage

```python
from batchin_vaas import BatchInVaaSClient

client = BatchInVaaSClient(
    base_url="https://api.batchin.tech",
    api_key="your-batchin-api-key",
)

record_id = "rec_98bf12"

# Fetch receipt and evidence bundle
receipt = client.get_receipt(record_id)
evidence = client.get_evidence(record_id)

# Verify cryptographically using public key
is_valid = client.verify_bundle(receipt=receipt, evidence=evidence)
print(f"Receipt verified: {is_valid}")
```

---

## CLI Local Verifier

Verify local evidence bundles offline:

```bash
batchin-vaas-verify --receipt receipt.json --evidence evidence.json
```
