"""Apply the official VF3 color schema to the two active VF3 catalog rows."""

from __future__ import annotations

import argparse
import asyncio
import json

from sqlalchemy import text

from src.services.database import SessionLocal, engine


VF3_COLORS = [
    {
        "name": "Trắng",
        "official_name": "Infinity Blanc",
        "color_code": "infinity-blanc",
        "type": "solid",
        "price_tier": "basic",
        "price_delta": 0,
        "image_url": "/static/uploads/cars/colors/vf3/vf3-infinity-blanc.webp",
    },
    {
        "name": "Xám",
        "official_name": "Zenith Grey",
        "color_code": "zenith-grey",
        "type": "solid",
        "price_tier": "basic",
        "price_delta": 0,
        "image_url": "/static/uploads/cars/colors/vf3/vf3-zenith-grey.webp",
    },
    {
        "name": "Đỏ",
        "official_name": "Solar Ruby",
        "color_code": "solar-ruby",
        "type": "solid",
        "price_tier": "basic",
        "price_delta": 0,
        "image_url": "/static/uploads/cars/colors/vf3/vf3-solar-ruby.webp",
    },
    {
        "name": "Vàng Trắng",
        "official_name": "Summer Yellow Infinity Blanc",
        "color_code": "summer-yellow-infinity-blanc",
        "type": "two_tone",
        "price_tier": "advanced",
        "price_delta": 8_000_000,
        "image_url": "/static/uploads/cars/colors/vf3/vf3-summer-yellow-infinity-blanc.webp",
    },
    {
        "name": "Xanh dương Trắng",
        "official_name": "Sky Blue Infinity Blanc",
        "color_code": "sky-blue-infinity-blanc",
        "type": "two_tone",
        "price_tier": "advanced",
        "price_delta": 8_000_000,
        "image_url": "/static/uploads/cars/colors/vf3/vf3-sky-blue-infinity-blanc.webp",
    },
    {
        "name": "Hồng Trắng",
        "official_name": "Rose Pink Infinity Blanc",
        "color_code": "rose-pink-infinity-blanc",
        "type": "two_tone",
        "price_tier": "advanced",
        "price_delta": 8_000_000,
        "image_url": "/static/uploads/cars/colors/vf3/vf3-rose-pink-infinity-blanc.webp",
    },
    {
        "name": "Xanh lá nhạt",
        "official_name": "Urban Mint",
        "color_code": "urban-mint",
        "type": "solid",
        "price_tier": "advanced",
        "price_delta": 8_000_000,
        "image_url": "/static/uploads/cars/colors/vf3/vf3-urban-mint.webp",
    },
]


async def migrate(apply: bool) -> None:
    async with SessionLocal() as db:
        rows = (
            await db.execute(
                text(
                    """
                    SELECT car_id, model_name, vehicle_line, version, colors
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
            old_count = len(row["colors"]) if isinstance(row["colors"], list) else 0
            print(f"{row['model_name']} ({row['version']}): {old_count} -> {len(VF3_COLORS)} colors")

        if not apply:
            await db.rollback()
            print("dry-run only; no database changes made")
            return

        payload = json.dumps(VF3_COLORS, ensure_ascii=False)
        for row in rows:
            await db.execute(
                text(
                    """
                    UPDATE public.car_catalog
                    SET colors = CAST(:colors AS jsonb),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE car_id = CAST(:car_id AS uuid)
                    """
                ),
                {"colors": payload, "car_id": str(row["car_id"])},
            )
        await db.commit()
        print("VF3 colors migrated in public.car_catalog")

    await engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write VF3 colors to public.car_catalog")
    args = parser.parse_args()
    asyncio.run(migrate(args.apply))


if __name__ == "__main__":
    main()
