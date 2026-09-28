"""Extract structured and legacy sections from one RAW car row."""

from collections.abc import Mapping
from typing import Any


def _mapping(value: Any) -> Mapping[str, Any]:
    return value if isinstance(value, Mapping) else {}


def extract_legacy_sections(row: Mapping[str, Any]) -> tuple[Mapping[str, Any], Mapping[str, Any]]:
    """Return legacy specifications and its additional_specs section."""
    raw_json = _mapping(row.get("additional_specs"))
    legacy_source = _mapping(raw_json.get("_legacy_source"))
    specifications = _mapping(legacy_source.get("specifications"))
    additional = _mapping(specifications.get("additional_specs"))
    return specifications, additional


def first_present(row: Mapping[str, Any], *paths: tuple[str, ...]) -> Any:
    """Read the first non-empty value from structured or legacy paths."""
    for path in paths:
        current: Any = row
        for key in path:
            current = _mapping(current).get(key)
        if current not in (None, ""):
            return current
    return None
