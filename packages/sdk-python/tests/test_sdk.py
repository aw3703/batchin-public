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


def test_auto_healer():
    from batchin import JsonAutoHealer

    truncated = '```json\n{"tool": "database_query", "params": {"query": "SELECT 1"'
    repaired = JsonAutoHealer.repair(truncated)
    assert repaired["tool"] == "database_query"
    assert repaired["params"]["query"] == "SELECT 1"


def test_chat_batchin_adapter(monkeypatch):
    from batchin import ChatBatchIn

    def mock_request(self, method, path, json=None):
        return {
            "id": "chatcmpl-mock",
            "model": "deepseek-v4-pro",
            "choices": [{"message": {"content": "Adapter works!"}}],
        }

    from batchin.client import BatchIn
    monkeypatch.setattr(BatchIn, "request", mock_request)

    model = ChatBatchIn(model="deepseek-v4-pro", api_key="mock-key")
    res = model.invoke("Say hello")
    assert res.content == "Adapter works!"
    assert res.response_metadata["model"] == "deepseek-v4-pro"

