"""
Agent Resilience: JSON Auto-Healer
Recovers and repairs truncated or slightly corrupted JSON tool calls.
"""
from __future__ import annotations

import json
import re
from typing import Any


class JsonAutoHealer:
    @staticmethod
    def repair(raw: str) -> Any:
        if not raw or not isinstance(raw, str):
            raise ValueError("Input must be a non-empty string")

        text = raw.strip()

        # 1. Strip markdown fences if present
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
            text = re.sub(r"\s*```$", "", text).strip()

        # Try direct parse
        try:
            return json.loads(text)
        except Exception:
            pass

        # 2. Locate start of JSON structure
        first_brace = text.find("{")
        first_bracket = text.find("[")
        start_idx = -1

        if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
            start_idx = first_brace
        elif first_bracket != -1:
            start_idx = first_bracket

        if start_idx != -1:
            text = text[start_idx:]

        # 3. Remove trailing commas before closing braces
        text = re.sub(r",\s*([}\]])", r"\1", text)
        text = re.sub(r",\s*$", "", text)

        # 4. Balance quotes and brackets
        in_string = False
        escape = False
        stack: list[str] = []

        for char in text:
            if escape:
                escape = False
                continue
            if char == "\\":
                escape = True
                continue
            if char == '"':
                in_string = not in_string
                continue
            if not in_string:
                if char in ("{", "["):
                    stack.append(char)
                elif char == "}" and stack and stack[-1] == "{":
                    stack.pop()
                elif char == "]" and stack and stack[-1] == "[":
                    stack.pop()

        if in_string:
            text += '"'

        text = re.sub(r",\s*$", "", text)

        while stack:
            open_char = stack.pop()
            if open_char == "{":
                text += "}"
            elif open_char == "[":
                text += "]"

        return json.loads(text)
