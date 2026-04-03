"""
Shared serialization helpers.
"""

import json
from typing import Any


def to_json(data: dict[str, Any] | None) -> str | None:
    if data is None:
        return None
    return json.dumps(data, default=str)


def from_json(data: str | None, default: Any = None) -> Any:
    if data is None:
        return default
    try:
        return json.loads(data)
    except json.JSONDecodeError:
        return default
