"""Extract structured and legacy sections from one RAW motorbike row."""

import unicodedata
from collections.abc import Mapping, Sequence
from typing import Any


def mapping(value: Any) -> Mapping[str, Any]:
    return value if isinstance(value, Mapping) else {}


def extract_legacy_sections(
    row: Mapping[str, Any],
) -> tuple[Mapping[str, Any], Mapping[str, Any]]:
    """Return legacy specifications and its additional_specs section."""
    raw_json = mapping(row.get("additional_specs"))
    legacy_source = mapping(raw_json.get("_legacy_source"))
    specifications = mapping(legacy_source.get("specifications"))
    additional = mapping(specifications.get("additional_specs"))
    return specifications, additional


def is_usable(value: Any) -> bool:
    """Reject null-like and unpublished values without changing RAW data."""
    if value is None or value == "":
        return False
    if isinstance(value, Mapping | list | tuple | set) and not value:
        return False
    normalized = unicodedata.normalize("NFKD", str(value))
    normalized = normalized.encode("ascii", "ignore").decode().strip().casefold()
    return normalized not in {"chua cong bo", "not published", "not_published", "n/a", "null"}


def first_present(
    row: Mapping[str, Any],
    paths: Sequence[tuple[str, ...]],
) -> tuple[Any, str | None]:
    """Return the first usable value and its source category."""
    for path in paths:
        current: Any = row
        for key in path:
            current = mapping(current).get(key)
        if is_usable(current):
            source = "additional_specs" if path and path[0] == "legacy" else "column"
            return current, source
    return None, None


def flatten_mapping(value: Mapping[str, Any], prefix: str = "") -> dict[str, Any]:
    """Flatten nested JSON paths for centralized mapping and review."""
    flattened: dict[str, Any] = {}
    for key, child in value.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(child, Mapping):
            flattened.update(flatten_mapping(child, path))
        elif is_usable(child):
            flattened[path] = child
    return flattened


__all__ = [
    "extract_legacy_sections",
    "first_present",
    "flatten_mapping",
    "is_usable",
    "mapping",
]
