"""Remove the rejected Feliz 2025 color and rebuild its public RAG vectors."""

from __future__ import annotations

import asyncio
import json

from sqlalchemy import text

from src.services.database import SessionLocal, engine
from src.services.rag.motorbikes.pipeline import index_motorbike_catalog


FELIZ_2025_COLORS = [
    "\u0110en b\u00f3ng",
    "Xanh R\u00eau",
    "Xanh Oliu",
    "Tr\u1eafng Ng\u1ecdc Trai",
]


async def main() -> None:
    try:
        async with SessionLocal() as db:
            rows = (
                await db.execute(
                    text(
                        """
                        SELECT motorbike_id, model_name, vehicle_line, colors
                        FROM public.motorbike_catalog
                        WHERE is_active = true
                          AND lower(vehicle_line) = 'feliz 2025'
                        ORDER BY model_name, version
                        """
                    )
                )
            ).mappings().all()

            if not rows:
                raise RuntimeError("No active Feliz 2025 row found")

            for row in rows:
                print(f"before {row['motorbike_id']}: {row['colors']}")
                await db.execute(
                    text(
                        """
                        UPDATE public.motorbike_catalog
                        SET colors = CAST(:colors AS jsonb)
                        WHERE motorbike_id = CAST(:motorbike_id AS uuid)
                        """
                    ),
                    {
                        "motorbike_id": str(row["motorbike_id"]),
                        "colors": json.dumps(FELIZ_2025_COLORS, ensure_ascii=False),
                    },
                )
            await db.commit()

        for row in rows:
            async with SessionLocal() as db:
                stats = await index_motorbike_catalog(
                    db,
                    motorbike_id=str(row["motorbike_id"]),
                )
                print(
                    f"indexed {row['model_name']}: "
                    f"vehicles={stats.vehicles_processed}, vectors={stats.chunks_indexed}"
                )

        async with SessionLocal() as db:
            result = (
                await db.execute(
                    text(
                        """
                        SELECT
                            m.motorbike_id,
                            m.colors,
                            COUNT(v.vector_id) AS vector_count,
                            COUNT(*) FILTER (
                                WHERE v.chunk_text ILIKE '%Vàng Cát%'
                            ) AS vectors_with_removed_color
                        FROM public.motorbike_catalog AS m
                        LEFT JOIN public.catalog_vectors AS v
                          ON v.motorbike_id = m.motorbike_id
                        WHERE m.is_active = true
                          AND lower(m.vehicle_line) = 'feliz 2025'
                        GROUP BY m.motorbike_id, m.colors
                        """
                    )
                )
            ).mappings().all()
            for row in result:
                print(dict(row))
                if row["vectors_with_removed_color"]:
                    raise RuntimeError("Removed Feliz color is still present in catalog vectors")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
