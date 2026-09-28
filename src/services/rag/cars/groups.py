"""Semantic groups for the car catalog."""

from collections.abc import Mapping
from typing import Any

from src.services.rag.cars.normalizer import NormalizedCar

CAR_GROUP_ORDER = (
    "overview_dimensions",
    "performance_energy",
    "chassis_safety",
    "adas_parking",
    "interior_technology",
    "exterior",
)

CAR_NON_SEMANTIC_FIELDS = frozenset({"car_id", "created_at", "updated_at", "is_active"})

GROUP_FIELDS: Mapping[str, tuple[tuple[str, str], ...]] = {
    "overview_dimensions": (
        ("Phân loại", "category"),
        ("Số ghế", "seat_count"),
        ("Chiều dài (mm)", "length"),
        ("Chiều rộng (mm)", "width"),
        ("Chiều cao (mm)", "height"),
        ("Chiều dài cơ sở (mm)", "wheelbase"),
    ),
    "performance_energy": (
        ("Quãng đường (km)", "range_km"),
        ("Công suất tối đa (kW)", "maximum_power_kw"),
        ("Mô-men xoắn tối đa (Nm)", "maximum_torque_nm"),
        ("Dung lượng pin khả dụng (kWh)", "usable_battery_capacity_kwh"),
        ("Giá niêm yết", "list_price"),
    ),
    "exterior": (("Màu xe", "colors"),),
}

GROUP_ADDITIONAL_KEYS: Mapping[str, tuple[str, ...]] = {
    "overview_dimensions": (
        "ground_clearance",
        "ground_clearance_mm",
        "cargo_volume",
        "cargo_capacity_folded_liters",
        "curb_weight_kg",
        "turning_radius_m",
        "service_info",
        "warranty_text",
        "description_text",
        "notes",
    ),
    "performance_energy": (
        "drivetrain",
        "transmission",
        "engine_type",
        "battery_type",
        "charging_info",
        "charging_info_text",
        "standard_charger",
        "dc_charge_from_percent",
        "dc_charge_to_percent",
        "range_condition_text",
        "regenerative_braking",
        "motor_power_hp",
        "motor_power_kw_each",
        "maximum_speed_kmh",
        "acceleration_0_50_seconds",
        "acceleration_0_100_seconds",
        "battery_capacity_status",
        "price_info_text",
        "technical_specs_text",
    ),
    "chassis_safety": (
        "brakes",
        "front_brake",
        "rear_brake",
        "suspension",
        "front_suspension",
        "rear_suspension",
        "tires",
        "tires_wheels",
        "safety_features",
        "airbags",
    ),
    "adas_parking": (
        "driver_assistance_features",
        "parking_assistance",
        "parking_sensors",
        "cameras",
    ),
    "interior_technology": (
        "interior_features",
        "smart_features",
        "screen",
        "audio",
        "air_conditioning",
        "connectivity",
    ),
    "exterior": ("exterior_features", "lighting", "mirrors", "doors"),
}

FIELD_SOURCE_PATHS: Mapping[str, str] = {
    "category": "category",
    "seat_count": "seat_count",
    "length": "length_mm",
    "width": "width_mm",
    "height": "height_mm",
    "wheelbase": "wheelbase_mm",
    "range_km": "range_km",
    "maximum_power_kw": "maximum_power_kw",
    "maximum_torque_nm": "maximum_torque_nm",
    "usable_battery_capacity_kwh": "usable_battery_capacity",
    "list_price": "list_price",
    "colors": "colors",
}

IDENTITY_SOURCE_PATHS = ("model_name", "vehicle_line", "version", "category")


def _leaf_source_paths(value: Any, prefix: str) -> set[str]:
    if isinstance(value, Mapping):
        paths: set[str] = set()
        for key, nested in value.items():
            paths.update(_leaf_source_paths(nested, f"{prefix}.{key}"))
        return paths or {prefix}
    # List positions are not stable source identifiers, so the list field is
    # tracked as one source instead of using numeric indexes.
    return {prefix}


def _format_value(value: Any) -> str:
    if isinstance(value, Mapping):
        return "; ".join(f"{key}: {_format_value(value[key])}" for key in sorted(value))
    if isinstance(value, list | tuple):
        values = []
        for item in value:
            if isinstance(item, Mapping) and item.get("name"):
                name = str(item["name"])
                official_name = item.get("official_name")
                if official_name:
                    name = f"{name} ({official_name})"
                details = []
                for key in ("color_code", "type", "price_tier", "price_delta", "image_url"):
                    detail = item.get(key)
                    if detail not in (None, "", 0) or (key == "price_delta" and detail == 0):
                        details.append(f"{key}={detail}")
                values.append(f"{name} [{'; '.join(details)}]" if details else name)
            else:
                values.append(_format_value(item))
        return ", ".join(values)
    return str(value)


def build_car_semantic_groups(car: NormalizedCar) -> dict[str, str]:
    """Convert one normalized car into the six deterministic text groups."""
    groups: dict[str, list[str]] = {group: [] for group in CAR_GROUP_ORDER}

    for group, fields in GROUP_FIELDS.items():
        for label, field_name in fields:
            if field_name in car.fields:
                if field_name == "list_price" and car.fields[field_name] in (None, 0):
                    continue
                groups[group].append(f"{label}: {_format_value(car.fields[field_name])}")
                if group == "exterior" and field_name == "colors":
                    colors = car.fields[field_name]
                    if isinstance(colors, (list, tuple)):
                        groups[group].append(f"Số màu ngoại thất: {len(colors)}")

    for group, keys in GROUP_ADDITIONAL_KEYS.items():
        for key in keys:
            if key in car.additional_specs:
                groups[group].append(f"{key}: {_format_value(car.additional_specs[key])}")

    return {group: "\n".join(lines) for group, lines in groups.items() if lines}


def build_car_group_source_paths(car: NormalizedCar) -> dict[str, tuple[str, ...]]:
    """Track the catalog fields that contribute to every semantic group."""
    paths: dict[str, tuple[str, ...]] = {}
    for group in CAR_GROUP_ORDER:
        group_paths = set(IDENTITY_SOURCE_PATHS)
        for _, field_name in GROUP_FIELDS.get(group, ()):
            if field_name in car.fields:
                group_paths.add(FIELD_SOURCE_PATHS[field_name])
        for key in GROUP_ADDITIONAL_KEYS.get(group, ()):
            if key in car.additional_specs:
                group_paths.update(
                    _leaf_source_paths(
                        car.additional_specs[key],
                        f"additional_specs.{key}",
                    )
                )
        paths[group] = tuple(sorted(group_paths))
    return paths
