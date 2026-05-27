# batchin-vaas

Python integration client for authenticated BatchIn developer workflows.

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

Customer operations require API-key authentication and workspace entitlement
checks.
