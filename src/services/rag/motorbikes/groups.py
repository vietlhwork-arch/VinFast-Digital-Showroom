"""Centralized macro-group mapping for the motorbike catalog."""

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from src.services.rag.motorbikes.normalizer import NormalizedMotorbike

MOTORBIKE_GROUP_ORDER = (
    "overview_dimensions",
    "performance_energy",
    "chassis_braking",
    "equipment_safety",
    "exterior_design",
)

DIRECT_GROUP_FIELDS: Mapping[str, tuple[str, ...]] = {
    "overview_dimensions": (
        "list_price",
        "weight_kg",
        "length_mm",
        "width_mm",
        "height_mm",
    ),
    "performance_energy": (
        "motor_type",
        "maximum_power_w",
        "maximum_speed_kmh",
        "range_km",
        "battery_type",
        "battery_quantity",
        "battery_capacity_kwh",
        "charging_time_minutes",
    ),
    "chassis_braking": (
        "front_brake",
        "rear_brake",
        "front_suspension",
        "rear_suspension",
    ),
    "equipment_safety": (),
    "exterior_design": ("colors",),
}

ADDITIONAL_GROUP_FIELDS: Mapping[str, tuple[str, ...]] = {
    "overview_dimensions": (
        "underseat_storage_liters",
        "model_year",
        "price_info_text",
        "description_text",
        "warranty_text",
    ),
    "performance_energy": (
        "charger_type",
        "charger_power_w",
        "battery_voltage_v",
        "battery_capacity_ah",
        "rated_motor_power_w",
        "maximum_motor_power_w",
        "removable_battery",
        "battery_swap_supported",
        "battery_location",
        "charging_info_text",
        "range_condition_text",
        "technical_specs_text",
        "battery_capacity_text",
        "technology_features.battery_configuration",
        "technology_features.battery_swap",
        "technology_features.two_battery_support",
    ),
    "chassis_braking": (
        "front_tire",
        "rear_tire",
        "technology_features.braking",
    ),
    "equipment_safety": (
        "technology_features.auto_hold",
        "technology_features.battery_management",
        "technology_features.bluetooth",
        "technology_features.charging_port",
        "technology_features.digital_display",
        "technology_features.display",
        "technology_features.gps",
        "technology_features.license_required",
        "technology_features.license_requirement",
        "technology_features.lock",
        "technology_features.ota_update",
        "technology_features.other_features",
        "technology_features.riding_modes",
        "technology_features.screen",
        "technology_features.smart_key",
        "technology_features.smart_management",
        "smart_features.status",
        "smart_features.items",
        "technology_features.smartphone_app",
        "technology_features.smartphone_connection",
        "technology_features.torque_sensor",
        "technology_features.usb",
    ),
    "exterior_design": (
        "lighting_features.daytime_running_light",
        "lighting_features.headlight",
        "lighting_features.rear_light",
        "lighting_features.tail_light",
        "lighting_features.turn_signal",
    ),
}

NON_SEMANTIC_JSON_KEYS = frozenset({"motorbike_id", "created_at", "updated_at", "is_active", "images", "source_refs"})
IDENTITY_SOURCE_PATHS = ("model_name", "vehicle_line", "version", "category")


def _format_value(value: Any) -> str:
    if isinstance(value, Mapping):
        return "; ".join(f"{key}: {_format_value(value[key])}" for key in sorted(value))
    if isinstance(value, list | tuple):
        return ", ".join(_format_value(item) for item in value)
    return str(value)


@dataclass(frozen=True, slots=True)
class MotorbikeGroupData:
    groups: Mapping[str, Mapping[str, Any]]
    field_sources: Mapping[str, Mapping[str, str]]
    unmapped_fields: Mapping[str, Any]

    def as_dict(self) -> dict[str, Any]:
        return {
            "groups": {name: dict(values) for name, values in self.groups.items()},
            "unmapped_fields": dict(self.unmapped_fields),
        }

    def dry_run_rows(self) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        for group_name, values in self.groups.items():
            sources = self.field_sources.get(group_name, {})
            for field_name, value in values.items():
                rows.append(
                    {
                        "group_name": group_name,
                        "field_name": field_name,
                        "value": value,
                        "source": sources.get(field_name, "column"),
                    }
                )
        return rows


def build_motorbike_group_data(motorbike: NormalizedMotorbike) -> MotorbikeGroupData:
    """Map only known fields into five groups and retain unknown JSON paths."""
    groups: dict[str, dict[str, Any]] = {}
    sources: dict[str, dict[str, str]] = {}
    consumed: set[str] = set()

    for group_name in MOTORBIKE_GROUP_ORDER:
        values: dict[str, Any] = {}
        group_sources: dict[str, str] = {}
        for field_name in DIRECT_GROUP_FIELDS.get(group_name, ()):
            if field_name in motorbike.fields:
                values[field_name] = motorbike.fields[field_name]
                group_sources[field_name] = motorbike.field_sources.get(field_name, "column")
        for path in ADDITIONAL_GROUP_FIELDS.get(group_name, ()):
            if path in motorbike.additional_specs:
                values[path] = motorbike.additional_specs[path]
                group_sources[path] = "additional_specs"
                consumed.add(path)
        if values:
            groups[group_name] = values
            sources[group_name] = group_sources

    unmapped = {
        path: value
        for path, value in motorbike.additional_specs.items()
        if path not in consumed and path not in NON_SEMANTIC_JSON_KEYS
    }
    return MotorbikeGroupData(
        groups=groups,
        field_sources=sources,
        unmapped_fields=unmapped,
    )


def build_motorbike_semantic_groups(
    motorbike: NormalizedMotorbike,
    group_data: MotorbikeGroupData | None = None,
) -> dict[str, str]:
    """Build deterministic text inputs without including unmapped fields."""
    grouped = group_data or build_motorbike_group_data(motorbike)
    return {
        group_name: "\n".join(f"{field_name}: {_format_value(value)}" for field_name, value in values.items())
        for group_name, values in grouped.groups.items()
        if values
    }


def build_motorbike_group_source_paths(
    motorbike: NormalizedMotorbike,
    group_data: MotorbikeGroupData | None = None,
) -> dict[str, tuple[str, ...]]:
    """Track direct columns and normalized JSON paths used by each group."""
    grouped = group_data or build_motorbike_group_data(motorbike)
    paths: dict[str, tuple[str, ...]] = {}
    for group_name, values in grouped.groups.items():
        group_paths = set(IDENTITY_SOURCE_PATHS)
        for field_name in values:
            if field_name in DIRECT_GROUP_FIELDS.get(group_name, ()):
                group_paths.add(field_name)
            else:
                group_paths.add(f"additional_specs.{field_name}")
        paths[group_name] = tuple(sorted(group_paths))
    return paths


__all__ = [
    "ADDITIONAL_GROUP_FIELDS",
    "DIRECT_GROUP_FIELDS",
    "MOTORBIKE_GROUP_ORDER",
    "MotorbikeGroupData",
    "build_motorbike_group_data",
    "build_motorbike_group_source_paths",
    "build_motorbike_semantic_groups",
]
