"""Normalize motorbike RAW rows before macro semantic grouping."""

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from src.services.rag.motorbikes.extractor import (
    extract_legacy_sections,
    first_present,
    flatten_mapping,
    is_usable,
)


@dataclass(frozen=True, slots=True)
class NormalizedMotorbike:
    motorbike_id: str
    model_name: str
    vehicle_line: str | None
    version: str | None
    category: str | None
    fields: Mapping[str, Any]
    field_sources: Mapping[str, str]
    additional_specs: Mapping[str, Any]


FIELD_PATHS: Mapping[str, tuple[tuple[str, ...], ...]] = {
    "weight_kg": (("weight_kg",), ("legacy", "wet_weight_kg")),
    "length_mm": (("length_mm",), ("legacy", "length_mm")),
    "width_mm": (("width_mm",), ("legacy", "width_mm")),
    "height_mm": (("height_mm",), ("legacy", "height_mm")),
    "motor_type": (("motor_type",), ("legacy", "motor_type")),
    "maximum_power_w": (
        ("maximum_power_w",),
        ("legacy", "maximum_motor_power_w"),
        ("legacy", "maximum_power_w"),
    ),
    "maximum_speed_kmh": (("maximum_speed_kmh",), ("legacy", "maximum_speed_kmh")),
    "range_km": (("range_km",), ("legacy", "range_km")),
    "battery_type": (("battery_type",), ("legacy", "battery_type")),
    "battery_quantity": (("battery_quantity",), ("legacy", "battery_quantity")),
    "battery_capacity_kwh": (
        ("battery_capacity_kwh",),
        ("legacy", "battery_capacity_kwh"),
    ),
    "charging_time_minutes": (
        ("charging_time_minutes",),
        ("legacy", "charging_time_minutes"),
    ),
    "front_brake": (("front_brake",), ("legacy", "front_brake")),
    "rear_brake": (("rear_brake",), ("legacy", "rear_brake")),
    "front_suspension": (("front_suspension",), ("legacy", "front_suspension")),
    "rear_suspension": (("rear_suspension",), ("legacy", "rear_suspension")),
    "colors": (
        ("colors",),
        ("legacy", "additional_specs", "colors"),
    ),
    # Kept both for structured filtering and the overview group.
    "list_price": (("list_price",), ("legacy", "list_price")),
}

NON_SEMANTIC_JSON_KEYS = frozenset(
    {
        "motorbike_id",
        "created_at",
        "updated_at",
        "is_active",
        "images",
        "source_refs",
    }
)
LEGACY_CONSUMED_KEYS = frozenset(
    path[-1] for paths in FIELD_PATHS.values() for path in paths if path and path[0] == "legacy" and len(path) == 2
)


def normalize_motorbike_row(row: Mapping[str, Any]) -> NormalizedMotorbike:
    specifications, legacy_additional = extract_legacy_sections(row)
    lookup = dict(row)
    lookup["legacy"] = specifications

    fields: dict[str, Any] = {}
    field_sources: dict[str, str] = {}
    for name, paths in FIELD_PATHS.items():
        value, source = first_present(lookup, paths)
        if is_usable(value):
            fields[name] = value
            field_sources[name] = source or "column"

    model_name = str(row["model_name"])
    vehicle_line, vehicle_line_source = first_present(
        lookup,
        (("vehicle_line",), ("legacy", "version")),
    )
    if not is_usable(vehicle_line):
        vehicle_line = None
    version, _ = first_present(
        lookup,
        (("version",), ("legacy", "version")),
    )
    if not is_usable(version):
        version = None
    category = row.get("category")
    if not is_usable(category):
        category = None

    additional: dict[str, Any] = {}
    for key, value in specifications.items():
        if (
            key not in NON_SEMANTIC_JSON_KEYS
            and key not in {"model_name", "version", "additional_specs"}
            and key not in LEGACY_CONSUMED_KEYS
            and key not in fields
            and is_usable(value)
        ):
            additional[key] = value
    for path, value in flatten_mapping(legacy_additional).items():
        if path.split(".", 1)[0] in NON_SEMANTIC_JSON_KEYS:
            continue
        if path in fields:
            continue
        if path in LEGACY_CONSUMED_KEYS:
            continue
        additional[path] = value

    # The source is retained for dry-run output even when vehicle_line is not
    # part of a semantic group.
    if vehicle_line is not None and vehicle_line_source:
        field_sources["vehicle_line"] = vehicle_line_source

    return NormalizedMotorbike(
        motorbike_id=str(row["motorbike_id"]),
        model_name=model_name,
        vehicle_line=str(vehicle_line) if vehicle_line is not None else None,
        version=str(version) if version is not None else None,
        category=str(category) if category is not None else None,
        fields=fields,
        field_sources=field_sources,
        additional_specs=additional,
    )


__all__ = ["FIELD_PATHS", "NormalizedMotorbike", "normalize_motorbike_row"]
