"""Attach the verified VF MPV 7 full-image paths to catalog color records."""

from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

from sqlalchemy import text

from src.services.database import SessionLocal, engine


MODEL_LINE = "vf mpv 7"
ASSET_ROOT = Path("static/uploads/cars/colors/vf-mpv-7/full")
IMAGE_BASE = "/static/uploads/cars/colors/vf-mpv-7/full"


async def migrate(apply: bool) -> None:
    codes = (
        "infinity-blanc",
        "jet-black",
        "zenith-grey",
        "solar-ruby",
        "moonlit-ocean",
        "introspective-brown",
    )
    missing = [
        code for code in codes
        if not (ASSET_ROOT / f"vf-mpv-7-{code}.webp").is_file()
    ]
    if missing:
        raise FileNotFoundError(f"Missing VF MPV 7 assets: {', '.join(missing)}")

    async with SessionLocal() as db:
        rows = (
            await db.execute(
                text(
                    """
                    SELECT car_id, model_name, colors
                    FROM public.car_catalog
                    WHERE is_active = true AND lower(vehicle_line) = :vehicle_line
                    """
                ),
                {"vehicle_line": MODEL_LINE},
            )
        ).mappings().all()

        changed_rows = 0
        changed_colors = 0
        for row in rows:
            colors = row["colors"]
            if not isinstance(colors, list):
                continue

            updated_colors = []
            row_changed = False
            row_changed_colors = 0
            for color in colors:
                if not isinstance(color, dict):
                    updated_colors.append(color)
                    continue
                updated = dict(color)
                code = str(updated.get("color_code") or "").strip()
                if code in codes:
                    path = f"{IMAGE_BASE}/vf-mpv-7-{code}.webp"
                    if updated.get("full_image_url") != path:
                        updated["full_image_url"] = path
                        row_changed = True
                        row_changed_colors += 1
                        changed_colors += 1
                updated_colors.append(updated)

            if row_changed:
                changed_rows += 1
                print(f"{row['model_name']}: update full_image_url for {row_changed_colors} color(s)")
                if apply:
                    await db.execute(
                        text(
                            """
                            UPDATE public.car_catalog
                            SET colors = CAST(:colors AS jsonb), updated_at = CURRENT_TIMESTAMP
                            WHERE car_id = CAST(:car_id AS uuid)
                            """
                        ),
                        {
                            "car_id": str(row["car_id"]),
                            "colors": json.dumps(updated_colors, ensure_ascii=False),
                        },
                    )

        print(f"rows={len(rows)} changed_rows={changed_rows} changed_colors={changed_colors}")
        if apply:
            await db.commit()
            print("VF MPV 7 full image links committed")
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
