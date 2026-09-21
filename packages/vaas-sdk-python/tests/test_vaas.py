from __future__ import annotations

import pytest
from batchin_vaas.client import BatchInVaaSClient


def test_vaas_client_init():
    client = BatchInVaaSClient(api_key="vaas-key", base_url="https://api.batchin.tech/v1/")
    assert client.base_url == "https://api.batchin.tech/v1"
    assert client.api_key == "vaas-key"
    client.close()
