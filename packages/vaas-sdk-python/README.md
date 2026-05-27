# batchin-vaas

Python SDK for BatchIn VaaS receipt, evidence, bundle, and audit-chain APIs.

## Install

This package is source-ready in the public BatchIn repository. Use the source
checkout until PyPI publication is verified:

    git clone https://github.com/aw3703/batchin-public.git
    cd batchin-public/packages/vaas-sdk-python
    python -m pip install -e .

## Usage

    from batchin_vaas import VaasClient

    client = VaasClient(
        base_url="https://api.batchin.tech",
        api_key="BATCHIN_API_KEY",
    )

    receipt = client.get_receipt("request_or_record_id")
    evidence = client.get_evidence("request_or_record_id")
    print(client.verify_bundle(receipt=receipt, evidence=evidence))

The CLI verifies local JSON bundles:

    batchin-vaas-verify --receipt receipt.json --evidence evidence.json
