from __future__ import annotations

import pytest
from batchin import BatchIn, AsyncBatchIn, BatchInError, AuthenticationError, RateLimitError


def test_batchin_client_init():
    client = BatchIn(api_key="test-key-abc", base_url="https://api.batchin.tech/v1/")
    assert client.base_url == "https://api.batchin.tech/v1"
    assert client.api_key == "test-key-abc"
    client.close()


def test_async_batchin_client_init():
    client = AsyncBatchIn(api_key="test-key-xyz")
    assert client.base_url == "https://api.batchin.tech/v1"
    assert client.api_key == "test-key-xyz"


def test_error_hierarchy():
    auth_err = AuthenticationError("Auth failed", 401)
    assert isinstance(auth_err, BatchInError)
    assert auth_err.status_code == 401

    rate_err = RateLimitError("Rate limited", 429)
    assert isinstance(rate_err, BatchInError)
    assert rate_err.status_code == 429
