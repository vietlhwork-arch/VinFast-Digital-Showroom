"""Synchronize public catalog mutations with the RAG vector index."""

from __future__ import annotations

import logging
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any, Literal

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.database import SessionLocal
from src.services.rag.cars.groups import CAR_GROUP_ORDER
from src.services.rag.cars.pipeline import group_car_row, index_car_catalog
from src.services.rag.motorbikes.groups import MOTORBIKE_GROUP_ORDER, build_motorbike_semantic_groups
from src.services.rag.motorbikes.pipeline import (
    group_motorbike_row,
    index_motorbike_catalog,
)

logger = logging.getLogger(__name__)
VehicleType = Literal["car", "motorbike"]


@dataclass(frozen=True, slots=True)
class CatalogRAGSnapshot:
    active: bool
    identity: tuple[object, ...]
    groups: Mapping[str, str]


def _value(model: Any, name: str) -> Any:
    return getattr(model, name, None)


def snapshot_car(model: Any) -> CatalogRAGSnapshot:
    document = group_car_row(
        {
            "car_id": str(_value(model, "car_id")),
            "model_name": _value(model, "model_name"),
            "vehicle_line": _value(model, "vehicle_line"),
            "version": _value(model, "version"),
            "category": _value(model, "category"),
            "image_url": _value(model, "image_url"),
            "colors": _value(model, "colors"),
            "seat_count": _value(model, "seat_count"),
            "length": _value(model, "length_mm"),
            "width": _value(model, "width_mm"),
            "height": _value(model, "height_mm"),
            "wheelbase": _value(model, "wheelbase_mm"),
            "range_km": _value(model, "range_km"),
            "maximum_power_kw": _value(model, "maximum_power_kw"),
            "maximum_torque_nm": _value(model, "maximum_torque_nm"),
            "usable_battery_capacity_kwh": _value(model, "usable_battery_capacity"),
            "list_price": _value(model, "list_price"),
            "additional_specs": _value(model, "additional_specs") or {},
            "is_active": bool(_value(model, "is_active")),
        }
    )
    return CatalogRAGSnapshot(
        active=bool(_value(model, "is_active")),
        identity=(
            _value(model, "model_name"),
            _value(model, "vehicle_line"),
            _value(model, "version"),
            _value(model, "category"),
        ),
        groups=dict(document.semantic_groups),
    )


def snapshot_motorbike(model: Any) -> CatalogRAGSnapshot:
    document = group_motorbike_row(
        {
            "motorbike_id": str(_value(model, "motorbike_id")),
            "model_name": _value(model, "model_name"),
            "vehicle_line": _value(model, "vehicle_line"),
            "version": _value(model, "version"),
            "category": _value(model, "category"),
            "image_url": _value(model, "image_url"),
            "colors": _value(model, "colors") or [],
            "range_km": _value(model, "range_km"),
            "charging_time_minutes": _value(model, "charging_time_minutes"),
            "battery_type": _value(model, "battery_type"),
            "battery_quantity": _value(model, "battery_quantity"),
            "battery_capacity_kwh": _value(model, "battery_capacity_kwh"),
            "motor_type": _value(model, "motor_type"),
            "maximum_power_w": _value(model, "maximum_power_w"),
            "maximum_speed_kmh": _value(model, "maximum_speed_kmh"),
            "weight_kg": _value(model, "weight_kg"),
            "length_mm": _value(model, "length_mm"),
            "width_mm": _value(model, "width_mm"),
            "height_mm": _value(model, "height_mm"),
            "front_brake": _value(model, "front_brake"),
            "rear_brake": _value(model, "rear_brake"),
            "front_suspension": _value(model, "front_suspension"),
            "rear_suspension": _value(model, "rear_suspension"),
            "additional_specs": _value(model, "additional_specs") or {},
            "is_active": bool(_value(model, "is_active")),
            "list_price": _value(model, "list_price"),
        }
    )
    return CatalogRAGSnapshot(
        active=bool(_value(model, "is_active")),
        identity=(
            _value(model, "model_name"),
            _value(model, "vehicle_line"),
            _value(model, "version"),
            _value(model, "category"),
        ),
        groups=dict(
            build_motorbike_semantic_groups(
                document.motorbike,
                document.group_data,
            )
        ),
    )


def changed_chunk_types(
    before: CatalogRAGSnapshot,
    after: CatalogRAGSnapshot,
    *,
    group_order: Sequence[str],
) -> tuple[str, ...]:
    """Return only groups whose embedded text or shared identity changed."""
    if not after.active:
        return ()
    if not before.active or before.identity != after.identity:
        return tuple(group_order)
    return tuple(group for group in group_order if before.groups.get(group, "") != after.groups.get(group, ""))


def changed_car_chunk_types(
    before: CatalogRAGSnapshot,
    after: CatalogRAGSnapshot,
) -> tuple[str, ...]:
    return changed_chunk_types(before, after, group_order=CAR_GROUP_ORDER)


def changed_motorbike_chunk_types(
    before: CatalogRAGSnapshot,
    after: CatalogRAGSnapshot,
) -> tuple[str, ...]:
    return changed_chunk_types(before, after, group_order=MOTORBIKE_GROUP_ORDER)


async def delete_vehicle_vectors(
    db: AsyncSession,
    *,
    vehicle_type: VehicleType,
    vehicle_id: str,
) -> int:
    column = "car_id" if vehicle_type == "car" else "motorbike_id"
    result = await db.execute(
        text(f"DELETE FROM public.catalog_vectors WHERE {column} = CAST(:vehicle_id AS uuid)"),
        {"vehicle_id": vehicle_id},
    )
    return int(result.rowcount or 0)


async def resolve_chunk_types_for_source_paths(
    db: AsyncSession,
    *,
    vehicle_type: VehicleType,
    vehicle_id: str,
    source_paths: Sequence[str],
) -> tuple[str, ...]:
    """Resolve normalized source fields directly to their persisted groups."""
    if not source_paths:
        return ()
    column = "car_id" if vehicle_type == "car" else "motorbike_id"
    result = await db.execute(
        text(
            f"""
            SELECT DISTINCT chunk_type
            FROM public.catalog_vectors
            WHERE {column} = CAST(:vehicle_id AS uuid)
              AND source_paths && CAST(:source_paths AS text[])
            ORDER BY chunk_type
            """
        ),
        {"vehicle_id": vehicle_id, "source_paths": list(source_paths)},
    )
    return tuple(str(row[0]) for row in result.all())


async def sync_vehicle_vectors(
    *,
    vehicle_type: VehicleType,
    vehicle_id: str,
    chunk_types: Sequence[str] | None = None,
) -> None:
    """Background-safe index refresh using a database session of its own."""
    try:
        async with SessionLocal() as db:
            if vehicle_type == "car":
                stats = await index_car_catalog(
                    db,
                    car_id=vehicle_id,
                    chunk_types=chunk_types,
                )
            else:
                stats = await index_motorbike_catalog(
                    db,
                    motorbike_id=vehicle_id,
                    chunk_types=chunk_types,
                )
            if stats.vehicles_processed == 0:
                await delete_vehicle_vectors(
                    db,
                    vehicle_type=vehicle_type,
                    vehicle_id=vehicle_id,
                )
                await db.commit()
    except Exception:
        logger.exception(
            "Catalog RAG synchronization failed for %s %s",
            vehicle_type,
            vehicle_id,
        )


__all__ = [
    "CatalogRAGSnapshot",
    "changed_car_chunk_types",
    "changed_chunk_types",
    "changed_motorbike_chunk_types",
    "delete_vehicle_vectors",
    "resolve_chunk_types_for_source_paths",
    "snapshot_car",
    "snapshot_motorbike",
    "sync_vehicle_vectors",
]
