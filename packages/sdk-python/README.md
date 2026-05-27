# batchin

Python SDK for authenticated BatchIn API workflows.

## Install

This package is source-ready. Registry publication must be verified before
installing by package name.

    git clone https://github.com/aw3703/batchin-public.git
    cd batchin-public/packages/sdk-python
    python -m pip install -e .

## Quickstart

    from batchin import BatchInClient

    client = BatchInClient(api_key="BATCHIN_API_KEY")
    models = client.models()

Customer operations require API-key authentication and workspace entitlement
checks.
