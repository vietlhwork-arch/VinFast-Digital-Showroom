"""Migrate the 21 active car rows to the runbook's canonical color schema."""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import unicodedata

from sqlalchemy import text

from src.services.database import SessionLocal, engine


def _code(value: str) -> str:
    value = unicodedata.normalize("NFD", value).replace("đ", "d").replace("Đ", "D")
    value = "".join(char for char in value if unicodedata.category(char) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")


def _color(
    name: str,
    official_name: str | None = None,
    *,
    advanced: bool = False,
    two_tone: bool = False,
    image_url: str | None = None,
) -> dict[str, object]:
    return {
        "name": name,
        "official_name": official_name,
        "color_code": _code(official_name or name),
        "type": "two_tone" if two_tone else "solid",
        "price_tier": "advanced" if advanced else "basic",
        "price_delta": 8_000_000 if advanced else 0,
        "image_url": image_url,
    }


def _solid(
    name: str,
    official: str | None,
    *,
    advanced: bool = False,
    image_url: str | None = None,
) -> dict[str, object]:
    return _color(name, official, advanced=advanced, image_url=image_url)


def _two_tone(
    name: str,
    official: str,
    *,
    advanced: bool = True,
    image_url: str | None = None,
) -> dict[str, object]:
    return _color(name, official, advanced=advanced, two_tone=True, image_url=image_url)


def _standard_colors() -> dict[tuple[str, str], list[dict[str, object]] | None]:
    basic = lambda name, official, **kwargs: _solid(name, official, **kwargs)
    advanced = lambda name, official, **kwargs: _solid(name, official, advanced=True, **kwargs)
    return {
        ("EBus", "EBus đô thị EB 6"): None,
        ("EC Van", "Tiêu chuẩn"): [
            advanced("Xanh lá nhạt", "Urban Mint"), basic("Đỏ", "Solar Ruby"),
            advanced("Vàng", "Yellow"), basic("Trắng", "Infinity Blanc"),
        ],
        ("Herio Green", "Service"): [
            basic("Đen", "Jet Black"), basic("Bạc", "Desat Silver"),
            basic("Đỏ", "Solar Ruby"), basic("Trắng", "Infinity Blanc"),
        ],
        ("Limo Green", "Service"): [
            basic("Bạc", "Desat Silver"), basic("Đen", "Jet Black"),
            basic("Trắng", "Infinity Blanc"), basic("Đỏ", "Solar Ruby"),
        ],
        ("Minio Green", "Green Service"): [
            basic("Đen", "Jet Black"), basic("Bạc", "Desat Silver"),
            basic("Trắng", "Infinity Blanc"), basic("Đỏ", "Solar Ruby"),
            _two_tone("Đen Vàng", "Jet Black Summer Yellow"),
            _two_tone("Bạc Đen", "Desat Silver Jet Black"),
            _two_tone("Vàng Trắng", "Summer Yellow Infinity Blanc"),
            advanced("Xanh lá", "Tropical Jade"), advanced("Hồng", "Rose Metallic"),
            _two_tone("Hồng Trắng", "Rose Metallic Infinity Blanc"),
            _two_tone("Hồng Xanh dương", "Rose Metallic Aqua Blue"),
            _two_tone("Xanh lá Trắng", "Tropical Jade Infinity Blanc"),
            _two_tone("Xanh lá Vàng", "Tropical Jade Summer Yellow"),
            _two_tone("Đỏ Trắng", "Solar Ruby Infinity Blanc"),
        ],
        # The runbook intentionally leaves Nerio commercial names unverified.
        ("Nerio Green", "Service"): [
            basic("Bạc", None), basic("Đen", None), basic("Đỏ", None), basic("Vàng", None),
        ],
        ("VF 2", "Tiêu chuẩn"): [
            basic("Trắng", "Infinity Blanc", image_url="/static/uploads/cars/colors/vf2/vf2-infinity-blanc.webp"),
            basic("Đỏ", "Solar Ruby", image_url="/static/uploads/cars/colors/vf2/vf2-solar-ruby.webp"),
            basic("Bạc", "Desat Silver", image_url="/static/uploads/cars/colors/vf2/vf2-desat-silver.webp"),
            advanced("Xanh lá nhạt", "Urban Mint", image_url="/static/uploads/cars/colors/vf2/vf2-urban-mint.webp"),
            advanced("Vàng", "Yellow", image_url="/static/uploads/cars/colors/vf2/vf2-yellow.webp"),
            advanced("Xanh dương", "Sky Blue", image_url="/static/uploads/cars/colors/vf2/vf2-sky-blue.webp"),
            advanced("Hồng", "Rose Pink", image_url="/static/uploads/cars/colors/vf2/vf2-rose-pink.webp"),
            advanced("Be", "Be Pebble", image_url="/static/uploads/cars/colors/vf2/vf2-pebble-beige.webp"),
        ],
        ("VF 3", "Eco"): [
            basic("Trắng", "Infinity Blanc", image_url="/static/uploads/cars/colors/vf3/vf3-infinity-blanc.webp"),
            basic("Xám", "Zenith Grey", image_url="/static/uploads/cars/colors/vf3/vf3-zenith-grey.webp"),
            basic("Đỏ", "Solar Ruby", image_url="/static/uploads/cars/colors/vf3/vf3-solar-ruby.webp"),
            _two_tone("Vàng Trắng", "Summer Yellow Infinity Blanc", image_url="/static/uploads/cars/colors/vf3/vf3-summer-yellow-infinity-blanc.webp"),
            _two_tone("Xanh dương Trắng", "Sky Blue Infinity Blanc", image_url="/static/uploads/cars/colors/vf3/vf3-sky-blue-infinity-blanc.webp"),
            _two_tone("Hồng Trắng", "Rose Pink Infinity Blanc", image_url="/static/uploads/cars/colors/vf3/vf3-rose-pink-infinity-blanc.webp"),
            advanced("Xanh lá nhạt", "Urban Mint", image_url="/static/uploads/cars/colors/vf3/vf3-urban-mint.webp"),
        ],
        ("VF 3", "Plus"): [
            basic("Trắng", "Infinity Blanc", image_url="/static/uploads/cars/colors/vf3/vf3-infinity-blanc.webp"),
            basic("Xám", "Zenith Grey", image_url="/static/uploads/cars/colors/vf3/vf3-zenith-grey.webp"),
            basic("Đỏ", "Solar Ruby", image_url="/static/uploads/cars/colors/vf3/vf3-solar-ruby.webp"),
            _two_tone("Vàng Trắng", "Summer Yellow Infinity Blanc", image_url="/static/uploads/cars/colors/vf3/vf3-summer-yellow-infinity-blanc.webp"),
            _two_tone("Xanh dương Trắng", "Sky Blue Infinity Blanc", image_url="/static/uploads/cars/colors/vf3/vf3-sky-blue-infinity-blanc.webp"),
            _two_tone("Hồng Trắng", "Rose Pink Infinity Blanc", image_url="/static/uploads/cars/colors/vf3/vf3-rose-pink-infinity-blanc.webp"),
            advanced("Xanh lá nhạt", "Urban Mint", image_url="/static/uploads/cars/colors/vf3/vf3-urban-mint.webp"),
        ],
        ("VF 5", "Tiêu chuẩn"): [
            basic("Trắng", "Infinity Blanc"), basic("Xám", "Zenith Grey"),
            basic("Đỏ", "Solar Ruby"), _two_tone("Vàng Đen", "Summer Yellow Jet Black"),
            _two_tone("Xanh dương Trắng", "Sky Blue Infinity Blanc"), advanced("Xanh lá nhạt", "Urban Mint"),
        ],
        ("VF 6", "Eco"): [
            basic("Trắng", "Infinity Blanc"), basic("Đen", "Jet Black"), basic("Xám", "Zenith Grey"),
            basic("Đỏ", "Solar Ruby"), basic("Xanh lá nhạt", "Urban Mint"),
        ],
        ("VF 6", "Plus"): [
            basic("Trắng", "Infinity Blanc"), basic("Đen", "Jet Black"), basic("Xám", "Zenith Grey"),
            basic("Đỏ", "Solar Ruby"), basic("Xanh lá nhạt", "Urban Mint"),
        ],
        ("VF 7", "Eco"): [
            basic("Trắng", "Infinity Blanc"), basic("Đen", "Jet Black"), basic("Xám", "Zenith Grey"),
            basic("Đỏ", "Solar Ruby"), basic("Xanh lá nhạt", "Urban Mint"),
        ],
        ("VF 7", "Plus AWD - Trần kính toàn cảnh"): [
            basic("Trắng", "Infinity Blanc"), basic("Đen", "Jet Black"), basic("Xám", "Zenith Grey"),
            basic("Đỏ", "Solar Ruby"), basic("Xanh lá nhạt", "Urban Mint"),
        ],
        ("VF 7", "Plus AWD - Trần thép"): [
            basic("Trắng", "Infinity Blanc"), basic("Đen", "Jet Black"), basic("Xám", "Zenith Grey"),
            basic("Đỏ", "Solar Ruby"), basic("Xanh lá nhạt", "Urban Mint"),
        ],
        ("VF 8", "Eco"): [
            basic("Trắng", "Infinity Blanc"), basic("Đen", "Jet Black"), basic("Đỏ", "Crimson Red"),
            basic("Xanh lá đậm", "Ivy Green"), _two_tone("Đỏ Nâu", "Crimson Velvet Mystery Bronze"),
            _two_tone("Xám Bạc", "Zenith Grey Desat Silver"), _two_tone("Trắng Xám", "Infinity Blanc Zenith Grey"),
            _two_tone("Đen Nâu", "Jet Black Mystery Bronze"),
        ],
        ("VF 8", "Plus"): [
            basic("Trắng", "Infinity Blanc"), basic("Đen", "Jet Black"), basic("Đỏ", "Crimson Red"),
            basic("Xanh lá đậm", "Ivy Green"), _two_tone("Đỏ Nâu", "Crimson Velvet Mystery Bronze"),
            _two_tone("Xám Bạc", "Zenith Grey Desat Silver"), _two_tone("Trắng Xám", "Infinity Blanc Zenith Grey"),
            _two_tone("Đen Nâu", "Jet Black Mystery Bronze"),
        ],
        ("VF 8", "The All New"): [
            basic("Trắng", "Infinity Blanc"), basic("Xanh dương", "Starburst Blue"), basic("Đỏ", "Solar Ruby"),
            basic("Đen", "Jet Black"), _two_tone("Đỏ Đen", "Solar Ruby Jet Black"),
            _two_tone("Cam Đen", "Vitality Orange Jet Black"), _two_tone("Xanh dương Trắng", "Starburst Blue Infinity Blanc"),
            _two_tone("Tím Xám", "Mysterioso Purple Stealth Gray"), _two_tone("Đen Xám", "Jet Black Stealth Gray"),
            _two_tone("Cam Trắng", "Vitality Orange Infinity Blanc"), advanced("Cam", "Vitality Orange"),
            advanced("Tím", "Mysterioso Purple"),
        ],
        ("VF 9", "Eco"): [
            basic("Trắng", "Infinity Blanc"), basic("Đen", "Jet Black"), basic("Xám", "Zenith Grey"),
            basic("Đỏ", "Crimson Red"), basic("Xanh lá nhạt", "Urban Mint"),
            basic("Xanh lá đậm", "Ivy Green"), basic("Bạc", "Desat Silver"),
        ],
        ("VF 9", "Plus"): [
            basic("Trắng", "Infinity Blanc"), basic("Đen", "Jet Black"), basic("Xám", "Zenith Grey"),
            basic("Đỏ", "Crimson Red"), basic("Xanh lá nhạt", "Urban Mint"),
            basic("Xanh lá đậm", "Ivy Green"), basic("Bạc", "Desat Silver"),
        ],
        ("VF MPV 7", "Tiêu chuẩn gia đình"): [
            basic("Trắng", "Infinity Blanc"), basic("Đen", "Jet Black"), basic("Xám", "Zenith Grey"),
            basic("Đỏ", "Solar Ruby"), basic("Xanh dương", "Moonlit Ocean"), basic("Nâu", "Introspective Brown"),
        ],
    }


async def migrate(apply: bool) -> None:
    expected = _standard_colors()
    async with SessionLocal() as db:
        rows = (await db.execute(text("""
            SELECT car_id, vehicle_line, version, model_name, colors
            FROM public.car_catalog
            WHERE is_active = true
            ORDER BY model_name, vehicle_line, version
        """))).mappings().all()
        actual = {(str(row["vehicle_line"]), str(row["version"])): row for row in rows}
        missing = sorted(set(expected) - set(actual))
        unexpected = sorted(set(actual) - set(expected))
        if missing or unexpected or len(rows) != 21:
            raise RuntimeError(f"Catalog does not match runbook: rows={len(rows)}, missing={missing}, unexpected={unexpected}")

        print(f"validated active car rows: {len(rows)}")
        if apply:
            # The original live schema made colors NOT NULL, but the runbook
            # intentionally reserves SQL NULL for EBus.
            await db.commit()
            await db.execute(text("ALTER TABLE public.car_catalog ALTER COLUMN colors DROP NOT NULL"))
        for key, colors in expected.items():
            row = actual[key]
            print(f"{row['model_name']}: colors={'NULL' if colors is None else len(colors)}")
            if apply:
                await db.execute(
                    text("""
                        UPDATE public.car_catalog
                        SET colors = CAST(:colors AS jsonb), updated_at = CURRENT_TIMESTAMP
                        WHERE car_id = CAST(:car_id AS uuid)
                    """),
                    {
                        "car_id": str(row["car_id"]),
                        # None must remain SQL NULL, not JSON scalar `null`.
                        "colors": None if colors is None else json.dumps(colors, ensure_ascii=False),
                    },
                )
        if apply:
            await db.commit()
            print("migration committed")
        else:
            await db.rollback()
            print("dry-run only; no database changes made")
    await engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write canonical colors to public.car_catalog")
    args = parser.parse_args()
    asyncio.run(migrate(args.apply))


if __name__ == "__main__":
    main()
