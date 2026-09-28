"""Attach database-backed swatch and full-color image URLs to car catalog rows."""

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


ASSET_ROOT = Path("static/uploads/cars/colors")


def asset_slug(vehicle_line: str, version: str) -> str | None:
    line = vehicle_line.strip().casefold()
    version_key = version.strip().casefold()
    if line == "vf 8" and version_key == "the all new":
        return "vf8-the-all-new"
    if line == "vf mpv 7":
        return "vf-mpv-7"
    return {
        "vf 2": "vf2",
        "vf 3": "vf3",
        "vf 5": "vf5",
        "vf 6": "vf6",
        "vf 7": "vf7",
        "vf 8": "vf8",
        "vf 9": "vf9",
        "ec van": "ec-van",
        "herio green": "herio-green",
        "nerio green": "nerio-green",
        "limo green": "limo-green",
        "minio green": "minio-green",
    }.get(line)


def local_swatch_path(slug: str, color_code: str) -> str | None:
    relative = Path("/static/uploads/cars/colors") / slug / f"{slug}-{color_code}.webp"
    if (Path.cwd() / relative.as_posix().lstrip("/")).is_file():
        return relative.as_posix()
    return None


def local_full_image_path(slug: str, color_code: str) -> str | None:
    filename_code = {
        "be-pebble": "pebble-beige",
    }.get(color_code, color_code)
    relative = Path("/static/uploads/cars/colors") / slug / "full" / f"{slug}-{filename_code}.webp"
    if (Path.cwd() / relative.as_posix().lstrip("/")).is_file():
        return relative.as_posix()
    return None


NERIO_COLOR_ALIASES = {
    "bac": ("Bạc", "desat-silver", "/static/uploads/cars/colors/vf2/vf2-desat-silver.webp", "Desat Silver"),
    "den": ("Đen", "jet-black", "/static/uploads/cars/colors/vf8/vf8-jet-black.webp", "Jet Black"),
    "do": ("Đỏ", "crimson-red", "/static/uploads/cars/colors/vf2/vf2-solar-ruby.webp", "Crimson Red"),
    "vang": ("Vàng", "summer-yellow", "/static/uploads/cars/colors/vf2/vf2-yellow.webp", "Summer Yellow"),
}


async def migrate(apply: bool) -> None:
    async with SessionLocal() as db:
        rows = (
            await db.execute(
                text(
                    """
                    SELECT car_id, model_name, vehicle_line, version, colors
                    FROM public.car_catalog
                    WHERE is_active = true
                    ORDER BY model_name, version
                    """
                )
            )
        ).mappings().all()

        changed_rows = 0
        changed_colors = 0
        for row in rows:
            colors = row["colors"]
            slug = asset_slug(str(row["vehicle_line"]), str(row["version"]))
            if not slug or not isinstance(colors, list):
                continue

            updated_colors = []
            row_changed = False
            for color in colors:
                if not isinstance(color, dict):
                    updated_colors.append(color)
                    continue
                updated = dict(color)
                code = str(updated.get("color_code") or "").strip()
                if slug == "nerio-green" and code in NERIO_COLOR_ALIASES:
                    display_name, canonical_code, swatch_path, official_name = NERIO_COLOR_ALIASES[code]
                    updated["name"] = display_name
                    updated["color_code"] = canonical_code
                    updated["official_name"] = official_name
                    code = canonical_code
                    if updated.get("image_url") != swatch_path:
                        updated["image_url"] = swatch_path
                        row_changed = True
                        changed_colors += 1
                local_path = local_swatch_path(slug, code) if code else None
                if local_path and updated.get("image_url") != local_path:
                    updated["image_url"] = local_path
                    row_changed = True
                    changed_colors += 1
                full_image_path = local_full_image_path(slug, code) if code else None
                if full_image_path and updated.get("full_image_url") != full_image_path:
                    updated["full_image_url"] = full_image_path
                    row_changed = True
                    changed_colors += 1
                updated_colors.append(updated)

            if row_changed:
                changed_rows += 1
                print(f"{row['model_name']}: updated color swatches")
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
            print("car color image migration committed")
        else:
            await db.rollback()
            print("dry-run only; no database changes made")
    await engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write local swatch paths to public.car_catalog")
    args = parser.parse_args()
    asyncio.run(migrate(args.apply))


if __name__ == "__main__":
    main()
