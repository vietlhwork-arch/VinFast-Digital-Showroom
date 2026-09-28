"""Rebuild only the two active Lạc Hồng 900 LX vector documents."""

from __future__ import annotations

import asyncio
import sys

from sqlalchemy import text

from src.services.database import SessionLocal, engine
from src.services.rag.cars.pipeline import index_car_catalog


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


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
                          AND model_name = 'VinFast Lạc Hồng 900 LX'
                        ORDER BY version
                        """
                    )
                )
            ).mappings().all()

            if {row["version"] for row in rows} != {"Tiêu chuẩn", "Chống đạn"}:
                raise RuntimeError(f"Expected exactly two 900 LX versions, found {rows}")

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
