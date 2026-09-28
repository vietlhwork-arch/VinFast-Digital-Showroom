"""Read-only repository for the RAW motorbike catalog."""

from collections.abc import Mapping
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

_COLUMNS = """
    motorbike_id, model_name, vehicle_line, version, category, image_url, colors,
    range_km, charging_time_minutes, battery_type,
    battery_quantity, battery_capacity_kwh, motor_type,
    maximum_power_w, maximum_speed_kmh, weight_kg,
    length_mm, width_mm, height_mm,
    front_brake, rear_brake, front_suspension, rear_suspension,
    additional_specs, is_active, list_price
"""


async def fetch_motorbike_catalog_rows(
    db: AsyncSession,
    *,
    motorbike_id: str | None = None,
    active_only: bool = True,
) -> list[Mapping[str, Any]]:
    """Fetch motorbike RAW rows without management timestamps."""
    conditions = ["1 = 1"]
    params: dict[str, Any] = {}
    if active_only:
        conditions.append("is_active = true")
    if motorbike_id:
        conditions.append("motorbike_id = CAST(:motorbike_id AS uuid)")
        params["motorbike_id"] = motorbike_id

    statement = text(
        f"SELECT {_COLUMNS} FROM public.motorbike_catalog "
        f"WHERE {' AND '.join(conditions)} ORDER BY model_name, vehicle_line"
    )
    result = await db.execute(statement, params)
    return list(result.mappings().all())


__all__ = ["fetch_motorbike_catalog_rows"]
