"""Verify catalog and vector state for the two active Lạc Hồng 900 LX rows."""

from __future__ import annotations

import asyncio
import sys

from sqlalchemy import text

from src.services.database import SessionLocal, engine


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


async def main() -> None:
    try:
        async with SessionLocal() as db:
            rows = (
                await db.execute(
                    text(
                        """
                        SELECT model_name, version, is_active, list_price,
                               seat_count, length_mm, width_mm, height_mm,
                               wheelbase_mm, range_km, maximum_power_kw,
                               maximum_torque_nm, usable_battery_capacity,
                               additional_specs
                        FROM public.car_catalog
                        WHERE model_name = 'VinFast Lạc Hồng 900 LX'
                        ORDER BY version
                        """
                    )
                )
            ).mappings().all()
            retired_count = int(
                (
                    await db.execute(
                        text(
                            """
                            SELECT COUNT(*)
                            FROM public.car_catalog
                            WHERE model_name IN ('VinFast Lạc Hồng 900S', 'VinFast Lạc Hồng 800S')
                            """
                        )
                    )
                ).scalar_one()
            )
            vector_rows = (
                await db.execute(
                    text(
                        """
                        SELECT c.version, COUNT(v.vector_id) AS vector_count,
                               COUNT(*) FILTER (WHERE v.embedding IS NULL) AS null_embeddings,
                               STRING_AGG(v.chunk_type || ': ' || v.chunk_text, E'\n' ORDER BY v.chunk_type, v.chunk_index) AS chunks
                        FROM public.car_catalog c
                        LEFT JOIN public.catalog_vectors v ON v.car_id = c.car_id
                        WHERE c.model_name = 'VinFast Lạc Hồng 900 LX'
                        GROUP BY c.version
                        ORDER BY c.version
                        """
                    )
                )
            ).mappings().all()

            if len(rows) != 2 or {row["version"] for row in rows} != {"Tiêu chuẩn", "Chống đạn"}:
                raise RuntimeError(f"Unexpected 900 LX rows: {rows}")
            if retired_count:
                raise RuntimeError(f"Retired 900S/800S rows still present: {retired_count}")
            if any(int(row["vector_count"] or 0) == 0 or int(row["null_embeddings"] or 0) for row in vector_rows):
                raise RuntimeError(f"Invalid vector state: {vector_rows}")

            for row in rows:
                specs = row["additional_specs"] or {}
                print(
                    f"CATALOG {row['version']}: active={row['is_active']}, price={row['list_price']}, "
                    f"seats={row['seat_count']}, length={row['length_mm']}, width={row['width_mm']}, "
                    f"height={row['height_mm']}, wheelbase={row['wheelbase_mm']}, range={row['range_km']}, "
                    f"power_kw={row['maximum_power_kw']}, torque_nm={row['maximum_torque_nm']}, "
                    f"battery_kwh={row['usable_battery_capacity']}, battery_status={specs.get('battery_capacity_status')}"
                )
            for row in vector_rows:
                print(
                    f"VECTORS {row['version']}: count={row['vector_count']}, "
                    f"null_embeddings={row['null_embeddings']}"
                )
                print(row["chunks"])
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
