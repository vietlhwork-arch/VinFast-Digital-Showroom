"""Rebuild the public catalog vector index without leaving stale rows."""

from __future__ import annotations

import argparse
import asyncio

from sqlalchemy import text

from src.services.database import SessionLocal, engine
from src.services.rag.cars.pipeline import index_car_catalog
from src.services.rag.motorbikes.pipeline import index_motorbike_catalog


async def _verify() -> dict[str, int]:
    async with SessionLocal() as db:
        row = (
            await db.execute(
                text(
                    """
                    SELECT
                        COUNT(*) FILTER (WHERE car_id IS NOT NULL) AS car_vectors,
                        COUNT(*) FILTER (WHERE motorbike_id IS NOT NULL) AS motorbike_vectors,
                        COUNT(DISTINCT car_id) FILTER (WHERE car_id IS NOT NULL) AS indexed_cars,
                        COUNT(DISTINCT motorbike_id) FILTER (WHERE motorbike_id IS NOT NULL) AS indexed_motorbikes,
                        COUNT(*) FILTER (WHERE embedding IS NULL) AS null_embeddings,
                        COUNT(*) FILTER (
                            WHERE (car_id IS NULL AND motorbike_id IS NULL)
                               OR (car_id IS NOT NULL AND motorbike_id IS NOT NULL)
                        ) AS invalid_owners,
                        COUNT(*) FILTER (
                            WHERE car_id IS NOT NULL AND NOT EXISTS (
                                SELECT 1 FROM public.car_catalog c
                                WHERE c.car_id = catalog_vectors.car_id AND c.is_active = true
                            )
                        ) + COUNT(*) FILTER (
                            WHERE motorbike_id IS NOT NULL AND NOT EXISTS (
                                SELECT 1 FROM public.motorbike_catalog m
                                WHERE m.motorbike_id = catalog_vectors.motorbike_id AND m.is_active = true
                            )
                        ) AS stale_vectors
                    FROM public.catalog_vectors
                    """
                )
            )
        ).mappings().one()
        return {key: int(value or 0) for key, value in row.items()}


async def rebuild(vehicle_type: str) -> None:
    if vehicle_type in {"all", "car"}:
        async with SessionLocal() as db:
            stats = await index_car_catalog(db)
        print(f"cars: vehicles={stats.vehicles_processed}, vectors={stats.chunks_indexed}")

    if vehicle_type in {"all", "motorbike"}:
        async with SessionLocal() as db:
            stats = await index_motorbike_catalog(db)
        print(f"motorbikes: vehicles={stats.vehicles_processed}, vectors={stats.chunks_indexed}")

    verification = await _verify()
    print("verification:", verification)
    if verification["null_embeddings"] or verification["invalid_owners"] or verification["stale_vectors"]:
        raise RuntimeError("Catalog vector verification failed")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--vehicle-type",
        choices=("all", "car", "motorbike"),
        default="all",
    )
    args = parser.parse_args()

    async def run_and_close() -> None:
        try:
            await rebuild(args.vehicle_type)
        finally:
            await engine.dispose()

    asyncio.run(run_and_close())


if __name__ == "__main__":
    main()
