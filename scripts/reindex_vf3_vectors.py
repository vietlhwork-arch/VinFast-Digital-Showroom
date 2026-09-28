"""Refresh only VF3 vectors after the catalog color migration."""

from __future__ import annotations

import asyncio

from sqlalchemy import text

from src.services.database import SessionLocal, engine
from src.services.rag.cars.pipeline import index_car_catalog


async def main() -> None:
    try:
        async with SessionLocal() as db:
            rows = (
                await db.execute(
                    text(
                        """
                        SELECT car_id, model_name, version
                        FROM public.car_catalog
                        WHERE is_active = true
                          AND lower(vehicle_line) = 'vf 3'
                        ORDER BY version
                        """
                    )
                )
            ).mappings().all()

            if len(rows) != 2:
                raise RuntimeError(f"Expected exactly 2 active VF3 rows, found {len(rows)}")

            for row in rows:
                stats = await index_car_catalog(db, car_id=str(row["car_id"]))
                print(
                    f"{row['model_name']} ({row['version']}): "
                    f"vehicles={stats.vehicles_processed}, vectors={stats.chunks_indexed}"
                )
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
