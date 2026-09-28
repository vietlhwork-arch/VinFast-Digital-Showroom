import asyncio
import csv
import json
import os
import sys

# Ensure backend root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog, MotorbikeCatalog

ADAS_KEY_MAP = {
    "rear_camera": "Camera lùi",
    "cruise_control": "Kiểm soát hành trình (Cruise Control)",
    "adaptive_cruise_control": "Kiểm soát hành trình thích ứng (ACC)",
    "safe_exit_warning": "Cảnh báo mở cửa an toàn (SEW)",
    "blind_spot_warning": "Cảnh báo điểm mù (BSD)",
    "rear_parking_sensor": "Cảm biến đỗ xe phía sau",
    "front_rear_parking_sensors": "Cảm biến đỗ xe trước/sau",
    "parking_assist": "Hỗ trợ đỗ xe",
    "rear_cross_traffic_alert": "Cảnh báo phương tiện cắt ngang khi lùi (RCTA)",
    "vietnamese_voice_assistant": "Trợ lý ảo tiếng Việt ViVi",
    "voice_assistant": "Trợ lý ảo VinFast tiếng Việt",
    "lane_keep_assist": "Hỗ trợ giữ làn (LKA)",
    "emergency_lane_keep": "Hỗ trợ giữ làn khẩn cấp (ELK)",
    "lane_departure_warning": "Cảnh báo lệch làn (LDW)",
    "traffic_jam_assist": "Hỗ trợ di chuyển khi ùn tắc (TJA)",
    "highway_assist": "Hỗ trợ lái trên cao tốc",
    "auto_parking": "Tự động đỗ xe thông minh",
    "automatic_parking": "Tự động đỗ xe thông minh",
    "driver_monitoring": "Giám sát người lái",
    "surround_view_camera": "Camera 360 độ",
    "camera": "Camera 360 độ",
    "forward_collision_warning": "Cảnh báo va chạm phía trước (FCW)",
    "automatic_emergency_braking": "Phanh tự động khẩn cấp (AEB)",
    "traffic_sign_recognition": "Nhận diện biển báo giao thông (TSR)",
    "pet_mode": "Chế độ thú cưng",
    "camp_mode": "Chế độ cắm trại",
    "android_auto": "Android Auto",
    "apple_carplay": "Apple CarPlay",
    "hud": "Màn hình hiển thị trên kính lái HUD",
    "intelligent_speed_assist": "Hỗ trợ giới hạn tốc độ thông minh",
    "adaptive_high_beam": "Đèn pha tự động thích ứng",
    "automatic_lane_change": "Tự động chuyển làn",
    "door_open_warning": "Cảnh báo mở cửa",
    "electronic_parking_brake": "Phanh tay điện tử",
    "vinfast_remote_app": "Quản lý xe từ xa qua App VinFast",
}


def build_adas_string(adas_dict):
    if not isinstance(adas_dict, dict):
        return str(adas_dict) if adas_dict else ""

    res = []
    for k, v in adas_dict.items():
        if v is True or v == "true" or v == 1:
            vn = ADAS_KEY_MAP.get(k, k.replace("_", " ").title())
            res.append(vn)
        elif isinstance(v, str) and v and v.lower() != "false":
            vn = ADAS_KEY_MAP.get(k, k.replace("_", " ").title())
            if v == vn:
                res.append(vn)
            else:
                res.append(f"{vn}: {v}")
    return ", ".join(res) if res else ""


def clean_car_specs(raw_specs: dict) -> dict:
    if not isinstance(raw_specs, dict):
        return {}

    # Extract source dictionary from _legacy_source or direct keys
    legacy_source = raw_specs.get("_legacy_source", {})
    legacy_specs = legacy_source.get("specifications", {}) if isinstance(legacy_source, dict) else {}
    legacy_add = legacy_specs.get("additional_specs", {}) if isinstance(legacy_specs, dict) else {}

    cleaned = {}

    # 1. Description
    desc = (
        raw_specs.get("description_text")
        or raw_specs.get("description")
        or legacy_add.get("description_text")
        or legacy_specs.get("description_text")
        or ""
    )
    if desc:
        cleaned["description_text"] = desc

    # 2. ADAS & Safety Features (preserves detailed dictionary structures)
    driver_assistance = (
        legacy_add.get("driver_assistance_features")
        or raw_specs.get("driver_assistance_features")
        or {}
    )
    safety_feat = (
        legacy_add.get("safety_features")
        or raw_specs.get("safety_features")
        or {}
    )

    if driver_assistance:
        cleaned["driver_assistance_features"] = driver_assistance
        adas_str = build_adas_string(driver_assistance)
        cleaned["has_adas"] = True
        cleaned["adas_features"] = adas_str or "Trợ lý ảo ViVi & Các tính năng ADAS nâng cao"
    else:
        existing_adas = raw_specs.get("adas_features")
        if existing_adas:
            cleaned["has_adas"] = True
            cleaned["adas_features"] = existing_adas
        else:
            cleaned["has_adas"] = False

    if safety_feat:
        cleaned["safety_features"] = safety_feat

    smart_feat = legacy_add.get("smart_features") or raw_specs.get("smart_features")
    if smart_feat:
        cleaned["smart_features"] = smart_feat

    # 3. Interior & Exterior Features (preserves detailed dictionaries)
    interior = legacy_add.get("interior_features") or raw_specs.get("interior_features")
    if interior:
        cleaned["interior_features"] = interior

    exterior = legacy_add.get("exterior_features") or raw_specs.get("exterior_features")
    if exterior:
        cleaned["exterior_features"] = exterior

    # 4. Colors
    colors = legacy_add.get("colors") or raw_specs.get("colors")
    if colors:
        cleaned["colors"] = colors

    # 5. Technical details & text fields
    copy_fields = [
        "drivetrain", "front_brake", "rear_brake", "front_suspension", "rear_suspension",
        "battery_type", "tires_wheels", "transmission", "warranty_text", "charging_info_text",
        "price_info_text", "technical_specs_text", "ground_clearance_mm", "cargo_capacity_folded_liters",
        "standard_charger", "engine_type", "curb_weight_kg", "motor_power_hp", "motor_torque_nm",
        "turning_diameter_m", "roof_load_capacity_kg", "dc_charge_from_percent", "dc_charge_to_percent",
        "acceleration_0_50_seconds", "range_condition_text", "regenerative_braking", "notes",
        "maintenance_cost_estimate", "fleet_code", "infotainment_screen", "speakers", "seat_material",
        "climate_control", "airbags", "brakes", "suspension", "smart_key", "gps", "lighting", "water_resistance"
    ]

    for field in copy_fields:
        val = raw_specs.get(field) or legacy_add.get(field) or legacy_specs.get(field)
        if val is not None and val != "" and val != "chưa công bố":
            cleaned[field] = val

    if "_conversion_note" in raw_specs:
        cleaned["_conversion_note"] = raw_specs["_conversion_note"]

    return cleaned


def clean_bike_specs(raw_specs: dict) -> dict:
    if not isinstance(raw_specs, dict):
        return {}

    legacy_source = raw_specs.get("_legacy_source", {})
    legacy_specs = legacy_source.get("specifications", {}) if isinstance(legacy_source, dict) else {}
    legacy_add = legacy_specs.get("additional_specs", {}) if isinstance(legacy_specs, dict) else {}

    cleaned = {}

    desc = (
        raw_specs.get("description_text")
        or raw_specs.get("description")
        or legacy_add.get("description_text")
        or legacy_specs.get("description_text")
        or ""
    )
    if desc:
        cleaned["description_text"] = desc

    tech_feat = legacy_add.get("technology_features") or raw_specs.get("technology_features")
    if tech_feat:
        cleaned["technology_features"] = tech_feat

    light_feat = legacy_add.get("lighting_features") or raw_specs.get("lighting_features")
    if light_feat:
        cleaned["lighting_features"] = light_feat

    colors = legacy_add.get("colors") or raw_specs.get("colors")
    if colors:
        cleaned["colors"] = colors

    copy_fields = [
        "drivetrain", "front_brake", "rear_brake", "front_suspension", "rear_suspension",
        "front_tire", "rear_tire", "battery_capacity_text", "battery_location", "warranty_text",
        "charging_info_text", "price_info_text", "range_condition_text", "technical_specs_text",
        "brakes", "suspension", "adas_features", "has_adas"
    ]

    for field in copy_fields:
        val = raw_specs.get(field) or legacy_add.get(field) or legacy_specs.get(field)
        if val is not None and val != "":
            cleaned[field] = val

    return cleaned


def clean_csv_files():
    car_csv = os.path.join(PROJECT_ROOT, "car_catalog_rows.csv")
    bike_csv = os.path.join(PROJECT_ROOT, "motorbike_catalog_rows.csv")

    # Clean Car CSV
    if os.path.exists(car_csv):
        rows = []
        with open(car_csv, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            for row in reader:
                raw_specs_str = row.get("additional_specs", "{}")
                try:
                    raw_specs = json.loads(raw_specs_str)
                except Exception:
                    raw_specs = {}
                cleaned = clean_car_specs(raw_specs)
                row["additional_specs"] = json.dumps(cleaned, ensure_ascii=False)
                rows.append(row)

        with open(car_csv, mode="w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f"Cleaned {len(rows)} car rows in {car_csv}")

    # Clean Motorbike CSV
    if os.path.exists(bike_csv):
        rows = []
        with open(bike_csv, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            for row in reader:
                raw_specs_str = row.get("additional_specs", "{}")
                try:
                    raw_specs = json.loads(raw_specs_str)
                except Exception:
                    raw_specs = {}
                cleaned = clean_bike_specs(raw_specs)
                row["additional_specs"] = json.dumps(cleaned, ensure_ascii=False)
                rows.append(row)

        with open(bike_csv, mode="w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f"Cleaned {len(rows)} motorbike rows in {bike_csv}")


async def clean_database():
    async with SessionLocal() as db:
        res_cars = await db.execute(select(CarCatalog))
        cars = res_cars.scalars().all()
        for car in cars:
            cleaned = clean_car_specs(car.additional_specs or {})
            car.additional_specs = cleaned

        res_bikes = await db.execute(select(MotorbikeCatalog))
        bikes = res_bikes.scalars().all()
        for bike in bikes:
            cleaned = clean_bike_specs(bike.additional_specs or {})
            bike.additional_specs = cleaned

        await db.commit()
        print(f"Cleaned {len(cars)} cars and {len(bikes)} motorbikes in database!")


async def main():
    print("=== 1. Cleaning CSV files ===")
    clean_csv_files()
    print("\n=== 2. Cleaning Database records ===")
    await clean_database()
    print("\nSUCCESS: All additional_specs cleaned and unbloated!")


if __name__ == "__main__":
    asyncio.run(main())
