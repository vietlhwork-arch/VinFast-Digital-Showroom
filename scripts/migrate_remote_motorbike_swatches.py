"""Attach verified motorbike swatches to the catalog."""

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


REMOTE_SWATCH_URLS = {
    "evo-grand": {
        # Small swatches already verified in the catalog. These are reused by
        # name/code only; the full Evo Grand vehicle renders stay model-owned.
        "pearl-white": "/static/uploads/motorbikes/colors/evo/pearl-white.webp",
        "matte-black": "/static/uploads/motorbikes/colors/evo/matte-black.webp",
        "olive-green": "/static/uploads/motorbikes/colors/evo/olive-green.webp",
        "bright-red": "/static/uploads/motorbikes/colors/evo/bright-red.webp",
        "sand-yellow": "/static/uploads/motorbikes/colors/evo-grand-lite/evo-grand-lite-yellow-swatch.webp",
    },
    "viper": {
        "black": "https://vinfastauto.com/themes/porto/img/pdp-page/viper/black.png",
        "white": "https://vinfastauto.com/themes/porto/img/pdp-page/viper/white.png",
        "cement-gray": "https://vinfastauto.com/themes/porto/img/pdp-page/viper/gray.png",
        "sand-yellow": "/static/uploads/motorbikes/colors/evo-grand-lite/evo-grand-lite-yellow-swatch.webp",
    },
}

DISPLAY_NAME_OVERRIDES = {
    "evo-grand": {"sand-yellow": "Be Kem"},
    "viper": {"sand-yellow": "Be Kem"},
}

OFFICIAL_NAME_OVERRIDES = {
    "evo-grand": {"sand-yellow": "Cream Beige"},
    "viper": {"sand-yellow": "Cream Beige"},
}


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
            model = str(row["model_name"]).casefold()
            slug = (
                "evo-grand"
                if "evo grand" in model and "evo grand lite" not in model
                else "viper"
                if "viper" in model
                else None
            )
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
                remote_url = REMOTE_SWATCH_URLS.get(slug, {}).get(code)
                display_name = DISPLAY_NAME_OVERRIDES.get(slug, {}).get(code)
                if display_name and updated.get("name") != display_name:
                    updated["name"] = display_name
                    row_changed = True
                    changed_colors += 1
                official_name = OFFICIAL_NAME_OVERRIDES.get(slug, {}).get(code)
                if official_name and updated.get("official_name") != official_name:
                    updated["official_name"] = official_name
                    row_changed = True
                    changed_colors += 1
                if updated.get("image_url") != remote_url:
                    updated["image_url"] = remote_url
                    row_changed = True
                    changed_colors += 1
                updated_colors.append(updated)

            if row_changed:
                changed_rows += 1
                print(f"{row['model_name']}: remote swatches updated")
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
            print("remote motorbike swatch migration committed")
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
