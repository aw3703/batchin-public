"""
BatchIn LangChain Adapter
Enables one-line integration with LangChain and LangGraph for BatchIn's authenticated API.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from batchin.client import BatchIn


class ChatBatchIn:
    """
    Lightweight LangChain-compatible Chat Model for BatchIn.
    Supports invoke(), stream(), and dictionary/string prompt passing.
    """

    def __init__(
        self,
        model: str = "deepseek-v4-pro",
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        temperature: Optional[float] = None,
        **kwargs: Any,
    ) -> None:
        self.model = model
        self.temperature = temperature
        self.client = BatchIn(api_key=api_key, base_url=base_url)
        self.extra_kwargs = kwargs

    def invoke(self, input_data: Any, **kwargs: Any) -> Any:
        messages: List[Dict[str, str]] = []
        if isinstance(input_data, str):
            messages = [{"role": "user", "content": input_data}]
        elif isinstance(input_data, list):
            for item in input_data:
                if hasattr(item, "content"):
                    role = getattr(item, "type", "user")
                    if role == "human":
                        role = "user"
                    elif role == "ai":
                        role = "assistant"
                    messages.append({"role": role, "content": str(item.content)})
                elif isinstance(item, dict):
                    messages.append(item)
        elif isinstance(input_data, dict):
            messages = [input_data]
        else:
            messages = [{"role": "user", "content": str(input_data)}]

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            **self.extra_kwargs,
            **kwargs,
        }
        if self.temperature is not None and "temperature" not in payload:
            payload["temperature"] = self.temperature

        res = self.client.chat.completions.create(**payload)
        content = res.get("choices", [{}])[0].get("message", {}).get("content", "")

        # Return a response object mimicking LangChain AIMessage
        class BatchInAIMessage:
            def __init__(self, text: str, raw: Dict[str, Any]) -> None:
                self.content = text
                self.response_metadata = {
                    "model": raw.get("model", ""),
                    "id": raw.get("id", ""),
                    "usage": raw.get("usage", {}),
                    "vaas_record_id": raw.get("vaas_record_id"),
                }

            def __repr__(self) -> str:
                return f"BatchInAIMessage(content={self.content!r})"

        return BatchInAIMessage(content, res)
