"""Resolve vehicle names in a query to trusted catalog UUIDs."""

from __future__ import annotations

import re
import unicodedata
from collections.abc import Sequence
from typing import Protocol

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.rag.retrieval.models import (
    ResolvedRetrievalScope,
    RetrievalFilters,
    VehicleIdentity,
)


class VehicleResolver(Protocol):
    async def resolve(
        self,
        db: AsyncSession,
        query: str,
        filters: RetrievalFilters,
    ) -> ResolvedRetrievalScope: ...


def _compact(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", value.casefold())
    without_marks = "".join(character for character in decomposed if unicodedata.category(character) != "Mn")
    return re.sub(r"[^a-z0-9]+", "", without_marks)


def _aliases(vehicle: VehicleIdentity) -> tuple[str, ...]:
    model = _compact(vehicle.model_name).removeprefix("vinfast")
    line = _compact(vehicle.vehicle_line)
    aliases = {model}
    if line and line not in {"notpublished", model}:
        aliases.add(line)
    return tuple(alias for alias in aliases if len(alias) >= 3)


def _occurrence_spans(value: str, substring: str) -> tuple[tuple[int, int], ...]:
    spans = []
    start = 0
    while True:
        index = value.find(substring, start)
        if index < 0:
            break
        spans.append((index, index + len(substring)))
        start = index + 1
    return tuple(spans)


def match_vehicle_identities(
    query: str,
    vehicles: Sequence[VehicleIdentity],
) -> tuple[VehicleIdentity, ...]:
    compact_query = _compact(query)
    matches: list[tuple[VehicleIdentity, str]] = []
    for vehicle in vehicles:
        matched_aliases = [alias for alias in _aliases(vehicle) if alias in compact_query]
        if matched_aliases:
            matches.append((vehicle, max(matched_aliases, key=len)))

    # "VF 8 Plus" must not also select every generic "VF 8" row. However,
    # comparisons such as "Amio S và Amio S2" must preserve the independently
    # written shorter model even though its alias is a prefix of the longer one.
    spans_by_alias = {
        alias: _occurrence_spans(compact_query, alias)
        for _, alias in matches
    }

    def has_independent_occurrence(alias: str) -> bool:
        for start, end in spans_by_alias[alias]:
            covered_by_longer_alias = any(
                alias != other_alias
                and alias in other_alias
                and any(
                    other_start <= start and end <= other_end
                    for other_start, other_end in spans_by_alias[other_alias]
                )
                for _, other_alias in matches
            )
            if not covered_by_longer_alias:
                return True
        return False

    filtered = [
        vehicle
        for vehicle, alias in matches
        if has_independent_occurrence(alias)
    ]
    unique: dict[str, VehicleIdentity] = {}
    for vehicle in filtered:
        unique.setdefault(vehicle.vehicle_id, vehicle)
    return tuple(unique.values())


_CATALOG_CACHE_TIME: float = 0.0
_CATALOG_CACHE_DATA: tuple[VehicleIdentity, ...] = ()
_CACHE_TTL_SECONDS: float = 3600.0


async def preload_catalog_cache(db: AsyncSession) -> tuple[VehicleIdentity, ...]:
    """Warm up and cache the entire vehicle catalog in memory."""
    global _CATALOG_CACHE_TIME, _CATALOG_CACHE_DATA
    import time

    now = time.time()
    try:
        # Check dialect
        dialect_name = getattr(db.bind, "name", "postgresql") if db.bind else "postgresql"
        if "sqlite" in dialect_name:
            statement = text(
                """
                SELECT vehicle_id, vehicle_type, model_name,
                       COALESCE(vehicle_line, 'not_published') AS vehicle_line,
                       COALESCE(version, 'not_published') AS version,
                       COALESCE(category, 'not_published') AS category,
                       image_url
                FROM (
                    SELECT car_id AS vehicle_id, 'car' AS vehicle_type,
                           model_name, vehicle_line, version, category, image_url
                    FROM car_catalog
                    WHERE is_active = 1
                    UNION ALL
                    SELECT motorbike_id AS vehicle_id, 'motorbike' AS vehicle_type,
                           model_name, vehicle_line, version, category, image_url
                    FROM motorbike_catalog
                    WHERE is_active = 1
                ) catalog
                ORDER BY model_name, vehicle_line, vehicle_id
                """
            )
        else:
            statement = text(
                """
                SELECT vehicle_id::text, vehicle_type, model_name,
                       COALESCE(vehicle_line, 'not_published') AS vehicle_line,
                       COALESCE(version, 'not_published') AS version,
                       COALESCE(category, 'not_published') AS category,
                       image_url
                FROM (
                    SELECT car_id AS vehicle_id, 'car'::text AS vehicle_type,
                           model_name, vehicle_line, version, category, image_url
                    FROM public.car_catalog
                    WHERE is_active = true
                    UNION ALL
                    SELECT motorbike_id AS vehicle_id, 'motorbike'::text AS vehicle_type,
                           model_name, vehicle_line, version, category, image_url
                    FROM public.motorbike_catalog
                    WHERE is_active = true
                ) catalog
                ORDER BY model_name, vehicle_line, vehicle_id
                """
            )
        result = await db.execute(statement)
        catalog = tuple(
            VehicleIdentity(
                vehicle_id=str(row["vehicle_id"]),
                vehicle_type=row["vehicle_type"],
                model_name=str(row["model_name"]),
                vehicle_line=str(row["vehicle_line"]),
                version=str(row["version"]),
                category=str(row["category"]),
                image_url=str(row["image_url"]) if row.get("image_url") else None,
            )
            for row in result.mappings().all()
        )
        if catalog:
            _CATALOG_CACHE_DATA = catalog
            _CATALOG_CACHE_TIME = now
            print(f"✅ Preloaded {len(catalog)} vehicles into catalog cache.")
            return catalog
    except Exception as e:
        print(f"Catalog preload notice: {e}")
    return _CATALOG_CACHE_DATA


class PostgresVehicleResolver:
    async def resolve(
        self,
        db: AsyncSession,
        query: str,
        filters: RetrievalFilters,
    ) -> ResolvedRetrievalScope:
        global _CATALOG_CACHE_TIME, _CATALOG_CACHE_DATA
        import time

        now = time.time()
        catalog: tuple[VehicleIdentity, ...] = ()

        if not filters.vehicle_ids and not filters.vehicle_type and _CATALOG_CACHE_DATA and (now - _CATALOG_CACHE_TIME < _CACHE_TTL_SECONDS):
            catalog = _CATALOG_CACHE_DATA
        else:
            catalog = await preload_catalog_cache(db)

        vehicles = (
            tuple(v for v in catalog if v.vehicle_id in filters.vehicle_ids)
            if filters.vehicle_ids
            else match_vehicle_identities(query, catalog)
        )
        if not vehicles:
            return ResolvedRetrievalScope(filters=filters)

        vehicle_types = {vehicle.vehicle_type for vehicle in vehicles}
        vehicle_type = next(iter(vehicle_types)) if len(vehicle_types) == 1 else filters.vehicle_type
        resolved_filters = RetrievalFilters(
            vehicle_type=vehicle_type,
            vehicle_ids=tuple(vehicle.vehicle_id for vehicle in vehicles),
            chunk_types=filters.chunk_types,
        )
        return ResolvedRetrievalScope(
            filters=resolved_filters,
            vehicles=vehicles,
        )


__all__ = [
    "PostgresVehicleResolver",
    "VehicleResolver",
    "match_vehicle_identities",
    "preload_catalog_cache",
]

