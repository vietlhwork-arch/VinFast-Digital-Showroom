"""Remove full-vehicle thumbnails that were incorrectly stored as color swatches.

The full-vehicle render remains in ``full_image_url``. A null ``image_url``
is used only where no verified small swatch exists; models with catalog-owned
swatches must keep their image URL so the card style stays consistent.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

from sqlalchemy import text

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.services.database import SessionLocal, engine


CSS_ONLY_SWATCHES = {
    "viper": {"sand-yellow"},
    "vf-drgnfly": {"black", "glossy-black", "gray-yellow-decal"},
}


def vehicle_slug(model_name: str) -> str | None:
    label = model_name.casefold()
    if "evo grand lite" in label:
        return None
    if "evo grand" in label:
        return "evo-grand"
    if "viper" in label:
        return "viper"
    if "drgnfly" in label:
        return "vf-drgnfly"
    return None


async def migrate(apply: bool) -> None:
    async with SessionLocal() as db:
        rows = (
            await db.execute(
                text(
                    """
                    SELECT motorbike_id, model_name, colors
                    FROM public.motorbike_catalog
                    WHERE is_active = true
                    ORDER BY model_name
                    """
                )
            )
        ).mappings().all()

        changed_rows = changed_colors = 0
        for row in rows:
            slug = vehicle_slug(str(row["model_name"]))
            if not slug or not isinstance(row["colors"], list):
                continue

            updated_colors = []
            row_changed = False
            for item in row["colors"]:
                if not isinstance(item, dict):
                    updated_colors.append(item)
                    continue
                updated = dict(item)
                code = str(updated.get("color_code") or "").strip()
                if code in CSS_ONLY_SWATCHES[slug] and updated.get("image_url") is not None:
                    updated["image_url"] = None
                    row_changed = True
                    changed_colors += 1
                updated_colors.append(updated)

            if row_changed:
                changed_rows += 1
                print(f"{row['model_name']}: cleared {changed_colors} photo swatch(es) so far")
                if apply:
                    await db.execute(
                        text(
                            """
                            UPDATE public.motorbike_catalog
                            SET colors = CAST(:colors AS jsonb), updated_at = CURRENT_TIMESTAMP
                            WHERE motorbike_id = CAST(:motorbike_id AS uuid)
                            """
                        ),
                        {
                            "motorbike_id": str(row["motorbike_id"]),
                            "colors": json.dumps(updated_colors, ensure_ascii=False),
                        },
                    )

        print(f"rows={len(rows)} changed_rows={changed_rows} changed_colors={changed_colors}")
        if apply:
            await db.commit()
            print("motorbike photo swatch cleanup committed")
        else:
            await db.rollback()
            print("dry-run only; no database changes made")
    await engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    asyncio.run(migrate(args.apply))


if __name__ == "__main__":
    main()
