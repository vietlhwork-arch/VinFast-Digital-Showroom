"""Keep only the Lạc Hồng 900 LX in the public car catalog.

The migration is idempotent. It keeps fields unpublished when VinFast and
reputable post-launch reporting do not agree. Run without ``--apply`` first
to inspect the planned rows.
"""

from __future__ import annotations

import argparse
import asyncio
from copy import deepcopy
import sys
from typing import Any

from sqlalchemy import delete, select

from src.models.domain import CarCatalog
from src.services.database import SessionLocal, engine


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


OFFICIAL_BRAND_ARTICLE = (
    "https://vinfastauto.com/vn_vi/"
    "vinfast-quy-hoach-3-dong-thuong-hieu-o-to-chien-luoc-ra-mat-2-mau-xe-sieu-sang-moi"
)


LAC_HONG_ROWS: tuple[dict[str, Any], ...] = (
    {
        "model_name": "VinFast Lạc Hồng 900 LX",
        "vehicle_line": "Lạc Hồng",
        "version": "Tiêu chuẩn",
        "category": "Luxury",
        "image_url": "/static/uploads/cars/lac_hong_900_lx_catalog.png",
        "list_price": 0,
        "is_active": True,
        "seat_count": 5,
        "length_mm": 5342,
        "width_mm": None,
        "height_mm": None,
        "wheelbase_mm": 3349,
        "range_km": 595,
        "maximum_power_kw": 300,
        "maximum_torque_nm": 620,
        "usable_battery_capacity": None,
        "additional_specs": {
            "brand_line": "Lạc Hồng",
            "data_status": "official_plus_reputable_press",
            "availability": "Mẫu xe giới hạn phục vụ nhiệm vụ nguyên thủ và sự kiện cấp quốc gia",
            "description_text": "Mẫu SUV siêu sang giới hạn của VinFast, phát triển cho nhiệm vụ nguyên thủ và sự kiện cấp quốc gia.",
            "highlights": [
                "Hàng ghế nguyên thủ siêu rộng và bệ tỳ chân",
                "Vách ngăn khoang lái bằng kính cách âm, rèm chỉnh điện và điện đàm",
                "Vật liệu Golden Nanmu, da Nappa và vàng thật",
                "Bảo hành 10 năm hoặc 200.000 km",
            ],
            "source_urls": [
                "https://cmu-cdn.vinfast.vn/2026/03/6dd71cdf-lac-hong-900-lx-xe-sang-mang-hon-viet-2345.jpg",
                "https://vinfastauto.com/vn_vi/"
                "vinfast-ban-giao-lo-xe-lac-hong-dua-don-nguyen-thu-quoc-te-tai-dai-le-ky-niem-80-nam-quoc-khanh",
                "https://tuoitre.vn/lac-hong-900-lx-co-gi-ban-thuong-37-tinh-nang-adas-ban-chong-dan-5-tan-van-di-duoc-450km-sac-20250829140950986.htm",
                "https://vnexpress.net/vinfast-ra-mat-lac-hong-900-lx-suv-danh-cho-nguyen-thu-4932350.html",
                "https://vnexpress.net/chu-tich-fifa-duoc-dua-don-bang-xe-sang-lac-hong-5103445.html",
                "https://dantri.com.vn/o-to-xe-may/can-canh-lac-hong-900-lx-suv-dien-viet-dua-don-nguyen-thu-quoc-te-20250828021648407.htm",
            ],
            "source_notes": "Ưu tiên VinFast; bổ sung Tuổi Trẻ, VnExpress và Dân trí sau khi xe được giới thiệu chính thức. Dung lượng pin được để Chưa công bố vì các bài báo uy tín ghi 123 và 131 kWh; rộng/cao cũng không thống nhất giữa các bài.",
            "image_processing_note": "Ảnh catalog được hậu kỳ từ ảnh 900 LX chính thức có cảnh vật sang nền studio sáng để đồng bộ với các thẻ SUV; ảnh gốc được lưu trong source_urls.",
            "charging_info_text": "Chưa công bố chính thức",
            "drivetrain": "2 cầu AWD",
            "engine_type": "2 mô-tơ điện, 150 kW mỗi mô-tơ",
            "motor_power_hp": 402,
            "motor_power_kw_each": 150,
            "motor_torque_nm": 620,
            "maximum_speed_kmh": 200,
            "acceleration_0_100_seconds": 6.8,
            "battery_type": "Pin lithium-ion",
            "battery_capacity_status": "Chưa công bố (nguồn báo uy tín chưa thống nhất 123/131 kWh)",
            "curb_weight_kg": 3035,
            "ground_clearance_mm": 175,
            "turning_radius_m": 7,
            "tires_wheels": "Mâm 21 inch; lốp 275/40",
            "safety_features": {
                "armor_variant": "Có phiên bản chống đạn VPAM VR7",
                "airbags": 8,
                "other_features": "37 tính năng hỗ trợ lái ADAS",
            },
            "technology_features": {"adas": "37 tính năng hỗ trợ lái ADAS"},
            "interior_features": {
                "materials": "Gỗ Golden Nanmu, da Nappa và chi tiết mạ vàng",
                "executive_seats": "Hàng ghế nguyên thủ siêu rộng, bệ tỳ chân",
                "privacy_partition": "Vách ngăn kính cách âm và rèm chỉnh điện",
                "intercom": "Điện đàm giữa khoang trước và sau",
                "central_screen_inches": 15.6,
                "audio_speakers": 13,
                "air_conditioning": "Điều hòa tự động 2 vùng",
            },
            "smart_features": {
                "status": "confirmed",
                "items": [
                    {"key": "executive_comfort", "label": "Hàng ghế nguyên thủ, vách ngăn kính và điện đàm", "status": "confirmed"},
                    {"key": "adas", "label": "37 tính năng hỗ trợ lái ADAS", "status": "confirmed"},
                ],
            },
            "warranty_text": "Bảo hành 10 năm hoặc 200.000 km theo chính sách VinFast.",
            "price_info_text": "Chưa công bố giá niêm yết chính thức.",
            "technical_specs_text": "Thông số được đối chiếu từ Tuổi Trẻ, VnExpress và Dân trí: 300 kW/402 mã lực, 620 Nm, 595 km, 0-100 km/h trong 6,8 giây, tối đa 200 km/h, 3.035 kg, dài 5.342 mm, trục cơ sở 3.349 mm và 5 chỗ. Dung lượng pin cùng chiều rộng/chiều cao chưa công bố do nguồn báo không thống nhất.",
        },
    },
    {
        "model_name": "VinFast Lạc Hồng 900S",
        "vehicle_line": "Lạc Hồng",
        "version": "Dự kiến 2027",
        "category": "Luxury",
        "image_url": "https://static-cms-prod.vinfastauto.com/lac-hong-900s.jpg",
        "list_price": 0,
        "additional_specs": {
            "brand_line": "Lạc Hồng",
            "data_status": "official_partial",
            "availability": "Dự kiến bán ra thị trường năm 2027",
            "description_text": "Mẫu xe siêu sang Lạc Hồng mang phong cách kinh điển, vượt thời gian và lấy cảm hứng từ văn hóa Việt.",
            "highlights": [
                "Hệ thống treo chủ động toàn phần",
                "Ghế không trọng lực và cửa đóng mở tự động",
                "Cấu hình 3 động cơ, tổng công suất công bố lên tới 460 kW",
                "Dự kiến giao xe năm 2027",
            ],
            "source_urls": [
                OFFICIAL_BRAND_ARTICLE,
                "https://vinfastauto.com/vn_vi/"
                "vinfast-gioi-thieu-dong-xe-sieu-sang-lac-hong-900s",
            ],
            "drivetrain": "Chưa công bố",
            "engine_type": "Động cơ điện, cấu hình chi tiết chưa công bố",
            "maximum_power_announcement": "Tối đa 460 kW với cấu hình 3 động cơ; thông số phiên bản chưa công bố.",
            "battery_type": "Chưa công bố",
            "charging_info_text": "Chưa công bố chính thức",
            "technology_features": {
                "active_suspension": "Hệ thống treo chủ động toàn phần",
                "three_motor_option": "Có thể sử dụng 3 động cơ",
                "announced_maximum_power": "Lên tới 460 kW",
            },
            "interior_features": {
                "materials": "Da Nappa, gỗ quý và chi tiết mạ vàng",
                "zero_gravity_seats": "Ghế không trọng lực",
                "automatic_doors": "Cửa đóng mở tự động",
                "private_partition": "Vách kính ngăn riêng tư",
                "starry_roof": "Trần sao",
                "projector": "Máy chiếu cỡ lớn",
                "folding_desk": "Bàn làm việc gấp gọn",
            },
            "smart_features": {
                "status": "confirmed",
                "items": [
                    {"key": "active_suspension", "label": "Hệ thống treo chủ động toàn phần", "status": "confirmed"},
                    {"key": "zero_gravity_seats", "label": "Ghế không trọng lực", "status": "confirmed"},
                    {"key": "automatic_doors", "label": "Cửa đóng mở tự động", "status": "confirmed"},
                    {"key": "private_partition", "label": "Vách kính ngăn riêng tư", "status": "confirmed"},
                    {"key": "starry_roof", "label": "Trần sao và máy chiếu cỡ lớn", "status": "confirmed"},
                    {"key": "folding_desk", "label": "Bàn làm việc gấp gọn", "status": "confirmed"},
                ],
            },
            "warranty_text": "Bảo hành 10 năm hoặc 200.000 km theo chính sách VinFast.",
            "price_info_text": "Chưa công bố giá niêm yết.",
            "technical_specs_text": "VinFast công bố cấu hình 3 động cơ có tổng công suất lên tới 460 kW; các thông số định danh khác chưa công bố.",
        },
    },
    {
        "model_name": "VinFast Lạc Hồng 800S",
        "vehicle_line": "Lạc Hồng",
        "version": "Dự kiến 2027",
        "category": "Luxury",
        "image_url": "https://static-cms-prod.vinfastauto.com/lac_hong_lh_800s_new.png",
        "list_price": 0,
        "additional_specs": {
            "brand_line": "Lạc Hồng",
            "data_status": "official_partial",
            "availability": "Dự kiến bán ra thị trường năm 2027",
            "description_text": "Mẫu xe siêu sang Lạc Hồng mang phong cách mạnh mẽ, sang trọng và lịch lãm.",
            "highlights": [
                "Hệ thống treo chủ động toàn phần",
                "Ghế không trọng lực và cửa đóng mở tự động",
                "Cấu hình 3 động cơ, tổng công suất công bố lên tới 460 kW",
                "Dự kiến giao xe năm 2027",
            ],
            "source_urls": [
                OFFICIAL_BRAND_ARTICLE,
                "https://vinfastauto.com/vn_vi/"
                "vinfast-gioi-thieu-dong-xe-sieu-sang-lac-hong-800s",
            ],
            "drivetrain": "Chưa công bố",
            "engine_type": "Động cơ điện, cấu hình chi tiết chưa công bố",
            "maximum_power_announcement": "Tối đa 460 kW với cấu hình 3 động cơ; thông số phiên bản chưa công bố.",
            "battery_type": "Chưa công bố",
            "charging_info_text": "Chưa công bố chính thức",
            "technology_features": {
                "active_suspension": "Hệ thống treo chủ động toàn phần",
                "three_motor_option": "Có thể sử dụng 3 động cơ",
                "announced_maximum_power": "Lên tới 460 kW",
            },
            "interior_features": {
                "materials": "Da Nappa, gỗ quý và chi tiết mạ vàng",
                "zero_gravity_seats": "Ghế không trọng lực",
                "automatic_doors": "Cửa đóng mở tự động",
                "premium_audio": "Hệ thống giải trí từ thương hiệu hàng đầu thế giới",
            },
            "smart_features": {
                "status": "confirmed",
                "items": [
                    {"key": "active_suspension", "label": "Hệ thống treo chủ động toàn phần", "status": "confirmed"},
                    {"key": "zero_gravity_seats", "label": "Ghế không trọng lực", "status": "confirmed"},
                    {"key": "automatic_doors", "label": "Cửa đóng mở tự động", "status": "confirmed"},
                    {"key": "premium_audio", "label": "Hệ thống giải trí cao cấp", "status": "confirmed"},
                ],
            },
            "warranty_text": "Bảo hành 10 năm hoặc 200.000 km theo chính sách VinFast.",
            "price_info_text": "Chưa công bố giá niêm yết.",
            "technical_specs_text": "VinFast công bố cấu hình 3 động cơ có tổng công suất lên tới 460 kW; các thông số định danh khác chưa công bố.",
        },
    },
)

# 900 LX is one model with two official configurations.  Keep one database row
# per configuration so the UI can switch between the standard and armoured
# specifications without inventing a second model name.
LAC_HONG_ARMORED_ROW = deepcopy(LAC_HONG_ROWS[0])
LAC_HONG_ARMORED_ROW.update(
    {
        "version": "Chống đạn",
        "seat_count": 5,
        "length_mm": 5342,
        "width_mm": None,
        "height_mm": None,
        "wheelbase_mm": 3349,
        "range_km": 450,
        "maximum_power_kw": None,
        "maximum_torque_nm": 620,
        "usable_battery_capacity": None,
        "additional_specs": {
            **LAC_HONG_ARMORED_ROW["additional_specs"],
            "data_status": "official_plus_reputable_press",
            "drivetrain": "2 cầu AWD",
            "engine_type": "2 mô-tơ điện, 150 kW mỗi mô-tơ",
            "motor_power_hp": 455,
            "motor_power_kw_each": 150,
            "motor_torque_nm": 620,
            "maximum_speed_kmh": 150,
            "acceleration_0_100_seconds": 9.8,
            "battery_type": "Pin lithium-ion",
            "battery_capacity_status": "Chưa công bố (nguồn báo uy tín chưa thống nhất 123/131 kWh)",
            "curb_weight_kg": 5049,
            "ground_clearance_mm": 175,
            "turning_radius_m": 7,
            "tires_wheels": "Mâm 19 inch; lốp 275/55 run-flat",
            "availability": "Mẫu xe giới hạn phục vụ nhiệm vụ nguyên thủ và sự kiện cấp quốc gia",
            "description_text": "Phiên bản chống đạn của SUV Lạc Hồng 900 LX, được gia cố để phục vụ nhiệm vụ bảo vệ nguyên thủ.",
            "highlights": [
                "Thân vỏ, khung gầm, cửa kính và vách ngăn được bọc thép/gia cố",
                "Đạt tiêu chuẩn chống đạn VPAM VR7",
                "Lốp run-flat, có thể di chuyển khoảng 80-100 km khi bị xịt",
                "Có thể lắp thêm thiết bị chuyên dụng theo yêu cầu và mục đích sử dụng",
            ],
            "source_urls": [
                "https://vinfastauto.com/vn_vi/"
                "vinfast-ban-giao-lo-xe-lac-hong-dua-don-nguyen-thu-quoc-te-tai-dai-le-ky-niem-80-nam-quoc-khanh",
                "https://tuoitre.vn/lac-hong-900-lx-co-gi-ban-thuong-37-tinh-nang-adas-ban-chong-dan-5-tan-van-di-duoc-450km-sac-20250829140950986.htm",
                "https://vnexpress.net/vinfast-ra-mat-lac-hong-900-lx-suv-danh-cho-nguyen-thu-4932350.html",
                "https://vnexpress.net/chu-tich-fifa-duoc-dua-don-bang-xe-sang-lac-hong-5103445.html",
                "https://dantri.com.vn/o-to-xe-may/kham-pha-lac-hong-900-lx-ban-chong-dan-chiu-440-phat-ban-11-lan-no-min-20250828121341539.htm",
            ],
            "source_notes": "Ưu tiên VinFast; bổ sung Tuổi Trẻ, VnExpress và Dân trí sau khi xe được giới thiệu chính thức. Dung lượng pin được để Chưa công bố vì các bài báo uy tín ghi 123 và 131 kWh; rộng/cao cũng không thống nhất giữa các bài.",
            "technology_features": {"adas": "12 tính năng hỗ trợ lái ADAS"},
            "interior_features": {
                "materials": "Gỗ Golden Nanmu, da Nappa và chi tiết mạ vàng",
                "executive_seats": "Hàng ghế nguyên thủ, chỉnh điện, sưởi ấm, làm mát và massage",
                "privacy_partition": "Vách ngăn kính cách âm và rèm chỉnh điện",
                "intercom": "Điện đàm giữa khoang trước và sau",
                "central_screen_inches": 15.6,
                "audio_speakers": 11,
                "air_conditioning": "Điều hòa tự động 2 vùng",
            },
            "technical_specs_text": "Thông số được đối chiếu từ Tuổi Trẻ, VnExpress và Dân trí: 455 mã lực, 620 Nm, 450 km, 0-100 km/h trong 9,8 giây, tối đa 150 km/h, 5.049 kg, dài 5.342 mm, trục cơ sở 3.349 mm và 5 chỗ. Dung lượng pin cùng chiều rộng/chiều cao chưa công bố do nguồn báo không thống nhất.",
            "safety_features": {
                "armor_standard": "VPAM VR7",
                "armored_protection": "Thân vỏ, khung gầm, cửa kính và vách ngăn chống đạn được gia cố",
                "run_flat": "Lốp run-flat, di chuyển khoảng 80-100 km khi bị xịt",
                "airbags": 6,
                "other_features": "12 tính năng hỗ trợ lái ADAS",
            },
            "smart_features": {
                "status": "confirmed",
                "items": [
                    {"key": "armored_protection", "label": "Bảo vệ chống đạn chuẩn VPAM VR7", "status": "confirmed"},
                    {"key": "run_flat", "label": "Lốp run-flat", "status": "confirmed"},
                    {"key": "executive_comfort", "label": "Hàng ghế nguyên thủ, vách ngăn kính và điện đàm", "status": "confirmed"},
                    {"key": "adas", "label": "12 tính năng hỗ trợ lái ADAS", "status": "confirmed"},
                ],
            },
            "price_info_text": "Chưa công bố giá niêm yết chính thức.",
        },
    }
)

ACTIVE_LAC_HONG_ROWS = (LAC_HONG_ROWS[0], LAC_HONG_ARMORED_ROW)
RETIRE_LAC_HONG_MODELS = (
    "VinFast Lạc Hồng 900S",
    "VinFast Lạc Hồng 800S",
)


async def migrate(apply: bool) -> int:
    async with SessionLocal() as session:
        existing = {
            (row.model_name, row.version): row
            for row in (
                await session.execute(
                    select(CarCatalog).where(
                        CarCatalog.model_name.in_([r["model_name"] for r in ACTIVE_LAC_HONG_ROWS])
                    )
                )
            ).scalars().all()
        }
        changed = 0
        for payload in ACTIVE_LAC_HONG_ROWS:
            row = existing.get((payload["model_name"], payload["version"]))
            action = "UPDATE" if row else "INSERT"
            if row is None:
                row = CarCatalog()
                session.add(row)
            for key, value in payload.items():
                setattr(row, key, value)
            changed += 1
            print(f"{action}: {payload['model_name']} | image_url={payload['image_url']}")

        if apply:
            retired = await session.execute(
                delete(CarCatalog).where(CarCatalog.model_name.in_(RETIRE_LAC_HONG_MODELS))
            )
            await session.commit()
            print(f"APPLIED: {changed} Lạc Hồng catalog rows committed")
            print(f"REMOVED: {int(retired.rowcount or 0)} retired Lạc Hồng rows")
            verified = list(
                (
                    await session.execute(
                        select(CarCatalog).where(
                            CarCatalog.model_name.in_([r["model_name"] for r in ACTIVE_LAC_HONG_ROWS])
                        )
                    )
                ).scalars().all()
            )
            if len(verified) != len(ACTIVE_LAC_HONG_ROWS) or any(not row.image_url for row in verified):
                raise RuntimeError("Lạc Hồng catalog verification failed")
            print(f"VERIFIED: {len(verified)} rows with non-empty database image_url")
            for row in sorted(verified, key=lambda item: (item.model_name, item.version or "")):
                print(
                    f"- {row.model_name}: line={row.vehicle_line}, "
                    f"version={row.version}, "
                    f"price={row.list_price}, range={row.range_km}, "
                    f"smart_items={len((row.additional_specs or {}).get('smart_features', {}).get('items', []))}"
                )
        else:
            await session.rollback()
            print(f"PENDING REMOVE: {len(RETIRE_LAC_HONG_MODELS)} retired Lạc Hồng rows")
            print(f"DRY-RUN: {changed} rows planned; no database changes committed")
    return changed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="commit the catalog rows")
    args = parser.parse_args()

    async def run() -> int:
        try:
            return await migrate(args.apply)
        finally:
            await engine.dispose()

    try:
        asyncio.run(run())
    except Exception as exc:  # pragma: no cover - database dependent
        print(f"DATABASE ERROR: {type(exc).__name__}: {exc}")
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
