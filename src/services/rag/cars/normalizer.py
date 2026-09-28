"""Normalize car RAW rows before semantic grouping."""

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from src.services.rag.cars.extractor import extract_legacy_sections, first_present


@dataclass(frozen=True, slots=True)
class NormalizedCar:
    car_id: str
    model_name: str
    vehicle_line: str | None
    version: str | None
    fields: Mapping[str, Any]
    additional_specs: Mapping[str, Any]


FIELD_PATHS: Mapping[str, tuple[tuple[str, ...], ...]] = {
    "category": (("category",),),
    "colors": (
        ("colors",),
        ("additional_specs", "colors"),
        ("legacy", "additional_specs", "colors"),
    ),
    "seat_count": (("seat_count",), ("legacy", "seat_count")),
    "length": (("length_mm",), ("length",), ("legacy", "dimensions", "length")),
    "width": (("width_mm",), ("width",), ("legacy", "dimensions", "width")),
    "height": (("height_mm",), ("height",), ("legacy", "dimensions", "height")),
    "wheelbase": (("wheelbase_mm",), ("wheelbase",), ("legacy", "wheelbase")),
    "range_km": (("range_km",), ("legacy", "range_km")),
    "maximum_power_kw": (("maximum_power_kw",), ("legacy", "motor_power_kw")),
    "maximum_torque_nm": (("maximum_torque_nm",), ("legacy", "motor_torque_nm")),
    "usable_battery_capacity_kwh": (
        ("usable_battery_capacity",),
        ("usable_battery_capacity_kwh",),
        ("legacy", "battery_capacity_kwh"),
    ),
    "list_price": (("list_price",), ("legacy", "list_price")),
}


def _usable(value: Any) -> bool:
    if value is None or value == "":
        return False
    if isinstance(value, (list, tuple, set, Mapping)) and not value:
        return False
    return str(value).strip().casefold() not in {
        "chưa công bố",
        "chua cong bo",
        "not_published",
        "n/a",
        "null",
    }


def normalize_car_row(row: Mapping[str, Any]) -> NormalizedCar:
    specifications, legacy_additional = extract_legacy_sections(row)
    lookup = dict(row)
    lookup["legacy"] = specifications

    fields = {}
    for name, paths in FIELD_PATHS.items():
        # The top-level colors column is authoritative. An explicit NULL must
        # not resurrect stale legacy colors (especially for EBus).
        value = lookup.get("colors") if name == "colors" and "colors" in lookup else first_present(lookup, *paths)
        if _usable(value):
            fields[name] = value

    additional = {
        key: value for key, value in dict(legacy_additional).items() if not key.startswith("_") and _usable(value)
    }
    raw_additional = row.get("additional_specs")
    if isinstance(raw_additional, Mapping):
        for key, value in raw_additional.items():
            if not key.startswith("_") and key not in additional and _usable(value):
                additional[key] = value

    return NormalizedCar(
        car_id=str(row["car_id"]),
        model_name=str(row["model_name"]),
        vehicle_line=str(row["vehicle_line"]) if row.get("vehicle_line") else None,
        version=str(row["version"]) if row.get("version") else None,
        fields=fields,
        additional_specs=additional,
    )
