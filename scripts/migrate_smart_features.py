"""Normalize smart/connected vehicle features in the catalog JSON.

The catalog already stores model-specific data in ``additional_specs``. This
migration adds a stable ``smart_features`` object there instead of changing
the table schema. It is deliberately dry-run by default:

    python scripts/migrate_smart_features.py
    python scripts/migrate_smart_features.py --apply

The migration preserves existing JSON and never replaces a non-empty,
explicitly curated ``smart_features.items`` list.
"""

from __future__ import annotations

import argparse
import asyncio
import copy
import os
import sys
from collections.abc import Mapping
from datetime import date
from typing import Any

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from sqlalchemy import select

from src.models.domain import CarCatalog, MotorbikeCatalog
from src.services.database import SessionLocal

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


CAR_FEATURES = {
    "vietnamese_voice_assistant": "Trợ lý ảo ViVi Tiêu chuẩn",
    "voice_assistant": "Trợ lý ảo ViVi Tiêu chuẩn",
    "vinfast_remote_app": "Quản lý xe từ xa qua App VinFast",
    "pet_mode": "Chế độ thú cưng",
    "camp_mode": "Chế độ cắm trại",
    "android_auto": "Android Auto",
    "apple_carplay": "Apple CarPlay",
}

VIVI_SOURCE_URL = "https://shop.vinfastauto.com/vn_vi/vinfast-connect.html"
OFFICIAL_VIVI_MODELS = (
    "herio green",
    "limo green",
    "vf 5",
    "vf 6",
    "vf 7",
    "vf 8",
    "vf 9",
    "vf mpv 7",
)

VIVI_SOURCE_BY_MODEL = {
    "herio green": "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw34b76547/Document/250422_Brochure_Herio_Green_VN.pdf",
    "nerio green": "https://vinfastauto.com/vn_en/tro-ly-ao",
}

BIKE_FEATURES = {
    "gps": "Định vị GPS",
    "smart_key": "Khóa Smartkey",
    "smart_management": "Quản lý thông minh",
    "smartphone_app": "Ứng dụng VinFast",
    "smartphone_connection": "Kết nối điện thoại",
    "bluetooth": "Kết nối Bluetooth",
    "auto_hold": "Auto Hold",
    "riding_modes": "Các chế độ lái",
    "ota_update": "Cập nhật phần mềm OTA",
    "battery_management": "Quản lý pin thông minh",
    "battery_swap": "Hỗ trợ đổi pin",
    "battery_configuration": "Cấu hình pin",
    "two_battery_support": "Hỗ trợ hai pin",
    "display": "Màn hình hiển thị",
    "digital_display": "Màn hình kỹ thuật số",
    "screen": "Màn hình hiển thị",
    "lock": "Khóa xe",
}


def record(value: Any) -> dict[str, Any]:
    return dict(value) if isinstance(value, Mapping) else {}


def containers(additional: Any) -> list[dict[str, Any]]:
    root = record(additional)
    nested_legacy = record(record(root.get("_legacy_source")).get("specifications"))
    legacy = record(record(root.get("_legacy_source")).get("specifications"))
    nested_additional = record(nested_legacy.get("additional_specs"))
    return [root, nested_additional, nested_legacy, legacy]


def first(conts: list[dict[str, Any]], key: str) -> Any:
    for item in conts:
        value = item.get(key)
        if value is not None:
            return value
    return None


def is_present(value: Any) -> bool:
    if value is None or value is False or value == 0:
        return False
    if isinstance(value, str) and value.strip().lower() in {"", "false", "0", "none", "null", "chưa xác nhận"}:
        return False
    return True


def item_status(value: Any) -> str:
    text = str(value or "").lower()
    return "optional" if "tùy chọn" in text or "optional" in text else "confirmed"


def feature_label(key: str, value: Any, label: str) -> str:
    if value is True or value == 1 or str(value).lower() == "true":
        return label
    if key in {"vietnamese_voice_assistant", "voice_assistant", "vinfast_remote_app"}:
        return str(value)
    if key in {"smart_management", "smartphone_app", "lock", "smart_key"}:
        return str(value)
    return f"{label}: {value}"


def explicit_items(conts: list[dict[str, Any]]) -> list[dict[str, str]]:
    for item in conts:
        smart = record(item.get("smart_features"))
        values = smart.get("items")
        if not isinstance(values, list):
            continue
        result = []
        for value in values:
            if isinstance(value, str) and value.strip():
                result.append({"key": value, "label": value, "status": "confirmed"})
            elif isinstance(value, Mapping) and value.get("label"):
                status = str(value.get("status") or "confirmed")
                if status not in {"confirmed", "optional", "unconfirmed"}:
                    status = "confirmed"
                result.append({
                    "key": str(value.get("key") or value["label"]),
                    "label": str(value["label"]),
                    "status": status,
                })
        if result:
            return result
    return []


def build_smart_features(
    additional: Any,
    is_car: bool,
    model_name: str | None = None,
    vehicle_line: str | None = None,
) -> dict[str, Any]:
    conts = containers(additional)
    items = explicit_items(conts)

    if not items:
        source = record(first(conts, "driver_assistance_features")) if is_car else record(first(conts, "technology_features"))
        mapping = CAR_FEATURES if is_car else BIKE_FEATURES
        for key, label in mapping.items():
            value = source.get(key)
            if not is_present(value):
                continue
            items.append({
                "key": key,
                "label": feature_label(key, value, label),
                "status": item_status(value),
            })

    identity = f"{model_name or ''} {vehicle_line or ''}".strip().lower()
    vivi_supported = is_car and any(model in identity for model in OFFICIAL_VIVI_MODELS)
    if vivi_supported:
        items = [item for item in items if item["key"] not in {"vietnamese_voice_assistant", "voice_assistant", "vivi"}]
        items.insert(0, {"key": "vivi", "label": "Trợ lý ảo ViVi Tiêu chuẩn", "status": "confirmed"})
    else:
        # Do not retain an older inferred ViVi entry for a model whose
        # current sources only say "virtual assistant" or do not mention it.
        items = [item for item in items if item["key"] not in {"vietnamese_voice_assistant", "voice_assistant", "vivi"}]

    deduped: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for item in items:
        identity = (item["key"], item["label"])
        if identity not in seen and item["status"] != "unconfirmed":
            seen.add(identity)
            deduped.append(item)

    source_refs = first(conts, "source_refs")
    source_url = source_refs[0] if isinstance(source_refs, list) and source_refs and isinstance(source_refs[0], str) else None
    if vivi_supported:
        source_url = next(
            (url for model, url in VIVI_SOURCE_BY_MODEL.items() if model in identity),
            VIVI_SOURCE_URL,
        )
    return {
        "status": "confirmed" if deduped else "unconfirmed",
        "items": deduped,
        "source_url": source_url,
        "source_checked_at": date.today().isoformat(),
    }


def with_smart_features(additional: Any, smart_features: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(record(additional))
    legacy_source = record(result.get("_legacy_source"))
    legacy_specs = record(legacy_source.get("specifications"))
    if legacy_source and legacy_specs:
        legacy_additional = record(legacy_specs.get("additional_specs"))
        legacy_additional["smart_features"] = smart_features
        legacy_specs["additional_specs"] = legacy_additional
        legacy_source["specifications"] = legacy_specs
        result["_legacy_source"] = legacy_source
    else:
        result["smart_features"] = smart_features
    return result


async def migrate(apply: bool) -> int:
    async with SessionLocal() as session:
        cars = list((await session.execute(select(CarCatalog))).scalars().all())
        bikes = list((await session.execute(select(MotorbikeCatalog))).scalars().all())
        changes: list[tuple[str, str, dict[str, Any]]] = []

        for vehicle in [*cars, *bikes]:
            old = vehicle.additional_specs or {}
            smart = build_smart_features(
                old,
                isinstance(vehicle, CarCatalog),
                model_name=vehicle.model_name,
                vehicle_line=vehicle.vehicle_line,
            )
            updated = with_smart_features(old, smart)
            if updated != old:
                kind = "car" if isinstance(vehicle, CarCatalog) else "motorbike"
                name = f"{vehicle.model_name} {vehicle.version or ''}".strip()
                changes.append((kind, name, smart))
                if apply:
                    vehicle.additional_specs = updated

        print(f"catalog rows: cars={len(cars)}, motorbikes={len(bikes)}")
        print(f"smart_features changes: {len(changes)}")
        for kind, name, smart in changes:
            labels = ", ".join(item["label"] for item in smart["items"]) or "(chưa xác nhận)"
            print(f"- {kind}: {name}: {smart['status']} -> {labels}")

        if apply:
            await session.commit()
            print("APPLIED: additional_specs.smart_features updated")
        else:
            print("DRY-RUN: no database changes; rerun with --apply to write")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="commit catalog JSON changes")
    args = parser.parse_args()
    try:
        return asyncio.run(migrate(args.apply))
    except Exception as exc:  # pragma: no cover - environment/database dependent
        print(f"DATABASE ERROR: {type(exc).__name__}: {exc}")
        print("No catalog changes were committed.")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
