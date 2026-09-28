"""Convert motorbike catalog colors to the same DB shape used by VF5.

Each color becomes an object containing the display name, stable color code,
swatch URL, and full-vehicle URL. URLs intentionally use the existing
``/static/uploads`` paths so the current serving flow remains unchanged.
Run without ``--apply`` first to inspect the migration.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
import unicodedata
from pathlib import Path

from sqlalchemy import text

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.services.database import SessionLocal, engine


ASSET_ROOT = PROJECT_ROOT / "static" / "uploads" / "motorbikes" / "colors"


def normalize_label(value: str) -> str:
    text_value = unicodedata.normalize("NFD", value.casefold().strip())
    text_value = text_value.replace("đ", "d")
    text_value = "".join(ch for ch in text_value if unicodedata.category(ch) != "Mn")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", text_value)).strip("-")


COLOR_CODES = {
    "do": "red",
    "do-tuoi": "bright-red",
    "do-den": "red-black",
    "do-tuoi-den-nham": "bright-red-matte-black",
    "trang": "white",
    "trang-ngoc-trai": "pearl-white",
    "trang-den": "white-black",
    "trang-cam": "white-orange",
    "trang-tim": "white-purple",
    "den": "black",
    "den-nham": "matte-black",
    "den-bong": "glossy-black",
    "xam": "gray",
    "xam-xi-mang": "cement-gray",
    "xam-decal-vang": "gray-yellow-decal",
    "xanh": "green",
    "xanh-ngoc": "tropical-jade",
    "xanh-reu": "moss-green",
    "xanh-tim-than": "navy-blue",
    "xanh-duong": "blue",
    "xanh-oliu": "olive-green",
    "lavender-sua": "milk-lavender",
    "vang": "yellow",
    "vang-cat": "sand-yellow",
    "be-kem": "sand-yellow",
    "nau-anh-kim": "metallic-brown",
}


# These palettes are already the catalog-approved palettes used by the UI.
# Persisting them here removes the temporary frontend override and keeps the
# order/names identical in cards and detail views.
OFFICIAL_PALETTES = {
    "evo": ["Xanh Oliu", "Đỏ tươi", "Đen nhám", "Trắng ngọc trai"],
    "evo-lite": ["Xanh Oliu", "Đỏ tươi", "Đen nhám", "Trắng ngọc trai"],
    "evo-grand-lite": ["Trắng ngọc trai", "Đen nhám", "Lavender Sữa", "Vàng"],
    "evo-grand": ["Trắng ngọc trai", "Đen nhám", "Xanh Oliu", "Đỏ tươi", "Be Kem"],
    "kyo": ["Nâu Ánh Kim", "Trắng Ngọc Trai", "Đỏ", "Đen Bóng", "Xanh Oliu"],
    "kinet": ["Xám Xi Măng", "Trắng Ngọc Trai", "Đỏ Đen", "Đen Bóng", "Nâu Ánh Kim"],
    "feliz-2025": ["Đen bóng", "Xanh Rêu", "Xanh Oliu", "Trắng Ngọc Trai"],
    "vf-drgnfly": ["Đen bóng", "Xám Decal Vàng"],
}

OFFICIAL_NAME_OVERRIDES = {
    "sand-yellow": "Cream Beige",
}


# The official pages expose these swatches remotely. Keeping the URLs in the
# catalog avoids adding another copy to the repository's static folders.
REMOTE_SWATCH_URLS = {
    "evo-grand": {
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
        # The official Viper page lists Sand Yellow but does not expose a
        # separate swatch. This image is from an authorized VinFast dealer.
        "sand-yellow": "/static/uploads/motorbikes/colors/evo-grand-lite/evo-grand-lite-yellow-swatch.webp",
    },
}

# These are vehicle renders, not color-chip assets. Keep them out of
# image_url so the frontend can render the small circle from CSS.
CSS_ONLY_SWATCHES = {
    "vf-drgnfly": {"black", "glossy-black", "gray-yellow-decal"},
}


def asset(slug: str, code: str, swatch_file: str | None, full_file: str) -> dict[str, str | None]:
    swatch = (
        swatch_file
        if swatch_file and swatch_file.startswith("/")
        else f"/static/uploads/motorbikes/colors/{slug}/{swatch_file}" if swatch_file else None
    )
    full = f"/static/uploads/motorbikes/colors/{slug}/full/{full_file}"
    return {"image_url": swatch, "full_image_url": full}


ASSETS: dict[str, dict[str, dict[str, str | None]]] = {
    "amio": {
        "black": asset("amio", "black", "amio-black.png", "amio-black.webp"),
        "gray": asset("amio", "gray", "amio-gray.png", "amio-gray.webp"),
        "green": asset("amio", "green", "amio-green.png", "amio-green.webp"),
        "white": asset("amio", "white", "amio-white.png", "amio-white.webp"),
        "red": asset("amio", "red", "amio-red.png", "amio-red.webp"),
    },
    "amio-s": {
        code: asset("amio-s", code, f"amio-s-{code}.webp", f"amio-s-{code}.webp")
        for code in ("cement-gray", "glossy-black", "pearl-white", "tropical-jade", "bright-red")
    },
    "amio-s2": {
        code: asset("amio-s2", code, f"amio-s2-{code}.webp" if code != "white-purple" else "amio-s2-white-purple.png", f"amio-s2-{code}.png")
        for code in ("glossy-black", "white-black", "bright-red", "tropical-jade", "white-purple")
    },
    "evo-lite-neo": {
        code: asset("evo-lite-neo", code, f"{code}.webp", f"evo-lite-neo-{code}.webp")
        for code in ("matte-black", "bright-red", "navy-blue", "moss-green", "pearl-white")
    },
    "evo": {
        code: asset("evo", code, f"{code}.webp", f"{code}.webp")
        for code in ("bright-red", "olive-green", "matte-black", "pearl-white")
    },
    "evo-lite": {
        code: asset("evo-lite", code, f"{code}.webp", f"{code}.webp")
        for code in ("bright-red", "olive-green", "matte-black", "pearl-white")
    },
    "evo-grand": {
        code: asset(
            "evo-grand",
            code,
            {
                "bright-red": "/static/uploads/motorbikes/colors/evo/bright-red.webp",
                "pearl-white": "/static/uploads/motorbikes/colors/evo/pearl-white.webp",
                "matte-black": "/static/uploads/motorbikes/colors/evo/matte-black.webp",
                "olive-green": "/static/uploads/motorbikes/colors/evo/olive-green.webp",
                "sand-yellow": "/static/uploads/motorbikes/colors/evo-grand-lite/evo-grand-lite-yellow-swatch.webp",
            }[code],
            f"evo-grand-{code}.webp",
        )
        for code in ("bright-red", "pearl-white", "matte-black", "olive-green", "sand-yellow")
    },
    "evo-grand-lite": {
        code: asset("evo-grand-lite", code, f"evo-grand-lite-{code}-swatch.webp", f"evo-grand-lite-{code}.webp")
        for code in ("pearl-white", "matte-black", "milk-lavender", "yellow")
    },
    "flazz": {
        "bright-red": asset("flazz", "bright-red", "bright-red.webp", "flazz-red.webp"),
        "matte-black": asset("flazz", "matte-black", "matte-black.webp", "flazz-black.webp"),
        "glossy-black": asset("flazz", "glossy-black", "matte-black.webp", "flazz-black.webp"),
        "moss-green": asset("flazz", "moss-green", "moss-green.webp", "flazz-blue.webp"),
        "pearl-white": asset("flazz", "pearl-white", "pearl-white.webp", "flazz-white.webp"),
    },
    "flazz-max": {
        code: asset("flazz-max", code, f"{code}.webp", f"flazz-max-{code}.webp")
        for code in ("red-black", "black", "blue", "white-orange")
    },
    "zgoo": {
        "bright-red-matte-black": asset("zgoo", "bright-red-matte-black", "bright-red-matte-black.png", "zgoo-red-black.webp"),
        "glossy-black": asset("zgoo", "glossy-black", "glossy-black.webp", "zgoo-glossy-black.webp"),
        "moss-green": asset("zgoo", "moss-green", "moss-green.webp", "zgoo-moss-green.webp"),
        "pearl-white": asset("zgoo", "pearl-white", "pearl-white.webp", "zgoo-pearl-white.webp"),
    },
    "viper": {
        "red-black": asset("viper", "red-black", "red-black.png", "viper-red-black.webp"),
        "black": asset("viper", "black", None, "viper-black.webp"),
        "white": asset("viper", "white", None, "viper-white.webp"),
        "cement-gray": asset("viper", "cement-gray", None, "viper-cement-gray.webp"),
        "sand-yellow": asset(
            "viper",
            "sand-yellow",
            "/static/uploads/motorbikes/colors/evo-grand-lite/evo-grand-lite-yellow-swatch.webp",
            "viper-sand-yellow.webp",
        ),
    },
    "feliz-2025": {
        code: asset("feliz-2025", code, f"{code}.png" if code != "matte-black" else "matte-black.webp", f"feliz-2025-{code}.webp")
        for code in ("moss-green", "glossy-black", "matte-black", "pearl-white", "olive-green")
    },
    "feliz-ii": {
        "red": asset("feliz-ii", "red", "bright-red.webp", "feliz-ii-bright-red.webp"),
        **{
            code: asset("feliz-ii", code, f"{code}.webp", f"feliz-ii-{code}.webp")
            for code in ("bright-red", "white", "black", "olive-green")
        },
    },
    "vero-x": {
        code: asset("vero-x", code, f"{code}.webp", f"vero-x-{code}.webp")
        for code in ("olive-green", "matte-black", "moss-green", "pearl-white")
    },
    "vf-drgnfly": {
        "black": asset("vf-drgnfly", "black", "glossy-black.png", "vf-drgnfly-glossy-black.png"),
        "glossy-black": asset("vf-drgnfly", "glossy-black", "glossy-black.png", "vf-drgnfly-glossy-black.png"),
        "gray-yellow-decal": asset("vf-drgnfly", "gray-yellow-decal", "gray-yellow-decal.png", "vf-drgnfly-gray-yellow-decal.png"),
    },
    "kyo": {
        code: asset("kyo", code, f"{code}.webp", f"kyo-{code}.webp")
        for code in ("metallic-brown", "pearl-white", "red", "glossy-black", "olive-green")
    },
    "kinet": {
        code: asset("kinet", code, f"{code}.webp", f"kinet-{code}.webp")
        for code in ("cement-gray", "pearl-white", "red-black", "glossy-black", "metallic-brown")
    },
}


def vehicle_slug(model_name: str, version: str | None) -> str | None:
    label = f"{model_name} {version or ''}".casefold()
    for token, slug in (
        ("amio s2", "amio-s2"),
        ("amio s", "amio-s"),
        ("evo grand lite", "evo-grand-lite"),
        ("evo grand", "evo-grand"),
        ("evo lite neo", "evo-lite-neo"),
        ("evo lite", "evo-lite"),
        ("evo", "evo"),
        ("flazz max", "flazz-max"),
        ("flazz", "flazz"),
        ("feliz 2025", "feliz-2025"),
        ("feliz ii", "feliz-ii"),
        ("vero x", "vero-x"),
        ("vf drgnfly", "vf-drgnfly"),
        ("zgoo", "zgoo"),
        ("viper", "viper"),
        ("kyo", "kyo"),
        ("kinet", "kinet"),
        ("amio", "amio"),
    ):
        if token in label:
            return slug
    return None


def color_code(label: str) -> str:
    normalized = normalize_label(label)
    return COLOR_CODES.get(normalized, normalized)


def file_exists(url: str | None) -> bool:
    return bool(url) and (PROJECT_ROOT / url.lstrip("/").replace("/", "/")).is_file()


async def migrate(apply: bool) -> None:
    async with SessionLocal() as db:
        rows = (
            await db.execute(
                text(
                    """
                    SELECT motorbike_id, model_name, version, colors
                    FROM public.motorbike_catalog
                    WHERE is_active = true
                    ORDER BY model_name, version
                    """
                )
            )
        ).mappings().all()

        changed_rows = changed_colors = missing_assets = 0
        for row in rows:
            slug = vehicle_slug(str(row["model_name"]), row["version"])
            colors = row["colors"]
            if not slug or not isinstance(colors, list):
                continue

            source_colors = OFFICIAL_PALETTES.get(slug, colors)
            updated_colors = []
            row_changed = False
            for item in source_colors:
                if isinstance(item, str):
                    name = item.strip()
                    updated = {"name": name}
                elif isinstance(item, dict):
                    updated = dict(item)
                    name = str(updated.get("name") or "").strip()
                else:
                    updated_colors.append(item)
                    continue

                code = color_code(name)
                mapped = ASSETS.get(slug, {}).get(code)
                if not mapped:
                    missing_assets += 1
                    print(f"MISSING MAPPING: {row['model_name']} / {name} -> {code}")
                    updated_colors.append(updated)
                    continue

                swatch_url = None if code in CSS_ONLY_SWATCHES.get(slug, set()) else (
                    REMOTE_SWATCH_URLS.get(slug, {}).get(code) or mapped["image_url"]
                )
                if not file_exists(mapped["full_image_url"]):
                    missing_assets += 1
                    print(f"MISSING FILE: {mapped['full_image_url']}")
                if swatch_url and swatch_url.startswith("/") and not file_exists(swatch_url):
                    missing_assets += 1
                    print(f"MISSING FILE: {swatch_url}")

                updated.update(
                    {
                        "name": name,
                        "official_name": OFFICIAL_NAME_OVERRIDES.get(code) or updated.get("official_name"),
                        "color_code": code,
                        "type": "two_tone" if "-" in code and code in {
                            "red-black", "bright-red-matte-black", "white-black", "white-orange", "white-purple", "gray-yellow-decal"
                        } else "solid",
                        "price_tier": updated.get("price_tier", "basic"),
                        "price_delta": updated.get("price_delta", 0),
                        # A CSS-only swatch must explicitly clear a previously
                        # persisted photo URL; other missing swatches retain
                        # an existing remote value for repeatable migrations.
                        "image_url": (
                            None
                            if code in CSS_ONLY_SWATCHES.get(slug, set())
                            else swatch_url or updated.get("image_url")
                        ),
                        "full_image_url": mapped["full_image_url"],
                    }
                )
                updated_colors.append(updated)
                if item != updated:
                    row_changed = True
                    changed_colors += 1

            if row_changed:
                changed_rows += 1
                print(f"{row['model_name']}: {len(updated_colors)} colors -> DB objects")
                if apply:
                    await db.execute(
                        text(
                            """
                            UPDATE public.motorbike_catalog
                            SET colors = CAST(:colors AS jsonb), updated_at = CURRENT_TIMESTAMP
                            WHERE motorbike_id = CAST(:motorbike_id AS uuid)
                            """
                        ),
                        {"motorbike_id": str(row["motorbike_id"]), "colors": json.dumps(updated_colors, ensure_ascii=False)},
                    )

        print(f"rows={len(rows)} changed_rows={changed_rows} changed_colors={changed_colors} missing_assets={missing_assets}")
        if apply:
            await db.commit()
            print("motorbike color image migration committed")
        else:
            await db.rollback()
            print("dry-run only; no database changes made")
    await engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write color objects to public.motorbike_catalog")
    args = parser.parse_args()
    asyncio.run(migrate(args.apply))


if __name__ == "__main__":
    main()
