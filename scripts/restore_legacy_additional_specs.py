import asyncio
import csv
import json
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog, MotorbikeCatalog


def build_car_legacy_source(car_id, model_name, version, range_km, list_price, seat_count, power_kw,
                            torque_nm, battery_kwh, length_mm, width_mm, height_mm, wheelbase_mm,
                            is_active, existing_specs):
    if not isinstance(existing_specs, dict):
        existing_specs = {}

    # If _legacy_source already exists and is intact, update its internal catalog/specs fields
    if "_legacy_source" in existing_specs and "specifications" in existing_specs["_legacy_source"]:
        leg = existing_specs["_legacy_source"]
        specs = leg.get("specifications", {})
        add = specs.get("additional_specs", {})
        
        raw_model = model_name
        if version and raw_model.endswith(version):
            raw_model = raw_model[:-len(version)].strip()

        leg["catalog"]["car_id"] = str(car_id)
        leg["catalog"]["model_name"] = raw_model
        specs["car_id"] = str(car_id)
        specs["version"] = version or specs.get("version") or "Plus"
        specs["range_km"] = range_km or specs.get("range_km") or 300.0
        specs["list_price"] = list_price or specs.get("list_price") or 0
        specs["seat_count"] = seat_count or specs.get("seat_count") or 5
        specs["motor_power_kw"] = power_kw or specs.get("motor_power_kw") or 100
        specs["battery_capacity_kwh"] = battery_kwh or specs.get("battery_capacity_kwh") or 37.23
        specs["is_active"] = is_active if is_active is not None else True

        if length_mm: add["length_mm"] = length_mm
        if width_mm: add["width_mm"] = width_mm
        if height_mm: add["height_mm"] = height_mm
        if wheelbase_mm: add["wheelbase_mm"] = wheelbase_mm
        if torque_nm: add["motor_torque_nm"] = torque_nm

        return {"_legacy_source": leg}

    # Otherwise construct a clean _legacy_source
    raw_model = model_name
    if version and raw_model.endswith(version):
        raw_model = raw_model[:-len(version)].strip()

    desc = existing_specs.get("description_text") or existing_specs.get("description") or f"VinFast {raw_model} là mẫu ô tô điện thông minh, hiện đại."
    driver_assistance = existing_specs.get("driver_assistance_features") or {}
    safety_feat = existing_specs.get("safety_features") or {}
    interior = existing_specs.get("interior_features") or {}
    exterior = existing_specs.get("exterior_features") or {}
    colors = existing_specs.get("colors") or []

    inner_add_specs = {
        "colors": colors,
        "images": existing_specs.get("images") or [],
        "width_mm": width_mm or 1723,
        "height_mm": height_mm or 1579,
        "length_mm": length_mm or 3967,
        "wheelbase_mm": wheelbase_mm or 2514,
        "created_at": existing_specs.get("created_at") or "2026-07-31T07:52:35.004559+00:00",
        "updated_at": existing_specs.get("updated_at") or "2026-07-31T08:02:22.742045+00:00",
        "drivetrain": existing_specs.get("drivetrain") or "Cầu trước FWD",
        "front_brake": existing_specs.get("front_brake") or "Phanh đĩa thông gió",
        "rear_brake": existing_specs.get("rear_brake") or "Phanh đĩa",
        "front_suspension": existing_specs.get("front_suspension") or "Độc lập, kiểu MacPherson",
        "rear_suspension": existing_specs.get("rear_suspension") or "Dầm xoắn",
        "engine_type": existing_specs.get("engine_type") or "Động cơ điện",
        "battery_type": existing_specs.get("battery_type") or "Pin Lithium-ion LFP",
        "tires_wheels": existing_specs.get("tires_wheels") or "La-zăng hợp kim",
        "transmission": existing_specs.get("transmission") or "Hộp số đơn cấp",
        "warranty_text": existing_specs.get("warranty_text") or "Bảo hành xe 7 năm hoặc 160.000 km.",
        "curb_weight_kg": existing_specs.get("curb_weight_kg") or 1340,
        "motor_power_hp": existing_specs.get("motor_power_hp") or int((power_kw or 100) * 1.34),
        "motor_torque_nm": torque_nm or 135,
        "price_info_text": existing_specs.get("price_info_text") or f"Giá niêm yết hiện tại: {list_price or 0:,} VNĐ.".replace(",", "."),
        "charging_info_text": existing_specs.get("charging_info_text") or "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
        "description_text": desc,
        "safety_features": safety_feat,
        "driver_assistance_features": driver_assistance,
        "exterior_features": exterior,
        "interior_features": interior,
        "ground_clearance_mm": existing_specs.get("ground_clearance_mm") or 160,
        "cargo_capacity_folded_liters": existing_specs.get("cargo_capacity_folded_liters") or 900,
        "standard_charger": existing_specs.get("standard_charger") or "Sạc chậm AC công suất tối đa 6.6 kW",
        "turning_diameter_m": existing_specs.get("turning_diameter_m") or "chưa công bố",
        "roof_load_capacity_kg": existing_specs.get("roof_load_capacity_kg") or "chưa công bố",
        "dc_charge_from_percent": existing_specs.get("dc_charge_from_percent") or 10,
        "dc_charge_to_percent": existing_specs.get("dc_charge_to_percent") or 70,
        "range_condition_text": existing_specs.get("range_condition_text") or f"{range_km or 300} km sau mỗi lần sạc đầy.",
        "regenerative_braking": existing_specs.get("regenerative_braking") or "Có hệ thống phanh tái sinh năng lượng",
        "technical_specs_text": existing_specs.get("technical_specs_text") or f"Động cơ điện công suất {power_kw or 100} kW, mô-men xoắn {torque_nm or 135} Nm.",
        "acceleration_0_50_seconds": existing_specs.get("acceleration_0_50_seconds") or "chưa công bố"
    }

    for k, v in existing_specs.items():
        if k not in inner_add_specs and k not in ["_legacy_source", "description", "has_adas", "adas_features"]:
            inner_add_specs[k] = v

    return {
        "_legacy_source": {
            "catalog": {
                "car_id": str(car_id),
                "model_name": raw_model
            },
            "specifications": {
                "car_id": str(car_id),
                "version": version or "Plus",
                "range_km": range_km or 300.0,
                "body_type": existing_specs.get("body_type") or "A-SUV",
                "fuel_type": "Điện",
                "is_active": is_active if is_active is not None else True,
                "list_price": list_price or 0,
                "model_year": existing_specs.get("model_year") or 2023,
                "payload_kg": existing_specs.get("payload_kg") or 325,
                "seat_count": seat_count or 5,
                "motor_power_kw": power_kw or 100,
                "maximum_speed_kmh": existing_specs.get("maximum_speed_kmh") or 130,
                "battery_capacity_kwh": battery_kwh or 37.23,
                "cargo_capacity_liters": existing_specs.get("cargo_capacity_liters") or 260,
                "charging_time_minutes": existing_specs.get("charging_time_minutes") or 33,
                "additional_specs": inner_add_specs
            }
        }
    }


def clean_csv_files():
    car_csv = os.path.join(PROJECT_ROOT, "car_catalog_rows.csv")

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

                legacy_specs = build_car_legacy_source(
                    car_id=row.get("car_id"),
                    model_name=row.get("model_name"),
                    version=row.get("version"),
                    range_km=float(row["range_km"]) if row.get("range_km") else 300.0,
                    list_price=int(float(row["list_price"])) if row.get("list_price") else 0,
                    seat_count=int(row["seat_count"]) if row.get("seat_count") else 5,
                    power_kw=float(row["maximum_power_kw"]) if row.get("maximum_power_kw") else 100.0,
                    torque_nm=float(row["maximum_torque_nm"]) if row.get("maximum_torque_nm") else 135.0,
                    battery_kwh=float(row["usable_battery_capacity_kwh"]) if row.get("usable_battery_capacity_kwh") else 37.23,
                    length_mm=int(row["length_mm"]) if row.get("length_mm") else 3967,
                    width_mm=int(row["width_mm"]) if row.get("width_mm") else 1723,
                    height_mm=int(row["height_mm"]) if row.get("height_mm") else 1579,
                    wheelbase_mm=int(row["wheelbase_mm"]) if row.get("wheelbase_mm") else 2514,
                    is_active=row.get("is_active", "").lower() == "true",
                    existing_specs=raw_specs
                )
                row["additional_specs"] = json.dumps(legacy_specs, ensure_ascii=False)
                rows.append(row)

        with open(car_csv, mode="w", encoding="utf-8", newline="") as f:
            writer = csv.DictReader  # just to avoid name clash
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f"Updated {len(rows)} car rows with _legacy_source structure in {car_csv}")


async def update_database():
    async with SessionLocal() as db:
        res_cars = await db.execute(select(CarCatalog))
        cars = res_cars.scalars().all()
        for car in cars:
            legacy_specs = build_car_legacy_source(
                car_id=car.car_id,
                model_name=car.model_name,
                version=car.version,
                range_km=car.range_km,
                list_price=car.list_price,
                seat_count=car.seat_count,
                power_kw=car.maximum_power_kw,
                torque_nm=car.maximum_torque_nm,
                battery_kwh=car.usable_battery_capacity,
                length_mm=car.length_mm,
                width_mm=car.width_mm,
                height_mm=car.height_mm,
                wheelbase_mm=car.wheelbase_mm,
                is_active=car.is_active,
                existing_specs=car.additional_specs or {}
            )
            car.additional_specs = legacy_specs

        await db.commit()
        print(f"Updated {len(cars)} cars in database with _legacy_source structure!")


async def main():
    print("=== 1. Restoring CSV files with _legacy_source ===")
    clean_csv_files()
    print("\n=== 2. Restoring Database records with _legacy_source ===")
    await update_database()
    print("\nSUCCESS: All car additional_specs restored to _legacy_source structure!")


if __name__ == "__main__":
    asyncio.run(main())
