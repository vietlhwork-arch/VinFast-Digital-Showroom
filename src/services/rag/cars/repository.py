"""Read-only repository for the RAW car catalog."""

from collections.abc import Mapping
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

_COLUMNS = """
    car_id, model_name, vehicle_line, version, category, image_url, colors, seat_count,
    length_mm AS length, width_mm AS width,
    height_mm AS height, wheelbase_mm AS wheelbase, range_km,
    maximum_power_kw, maximum_torque_nm,
    usable_battery_capacity AS usable_battery_capacity_kwh, list_price,
    additional_specs, is_active
"""


async def fetch_car_catalog_rows(
    db: AsyncSession,
    *,
    car_id: str | None = None,
    active_only: bool = True,
) -> list[Mapping[str, Any]]:
    """Fetch RAW rows without selecting created_at/updated_at."""
    conditions = ["1 = 1"]
    params: dict[str, Any] = {}
    if active_only:
        conditions.append("is_active = true")
    if car_id:
        conditions.append("car_id = CAST(:car_id AS uuid)")
        params["car_id"] = car_id

    statement = text(
        f"SELECT {_COLUMNS} FROM public.car_catalog WHERE {' AND '.join(conditions)} ORDER BY model_name, vehicle_line"
    )
    result = await db.execute(statement, params)
    return list(result.mappings().all())
