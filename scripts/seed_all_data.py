import asyncio
import csv
import json
import os
import sys
import uuid
from datetime import datetime

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select, delete, text
from src.models.domain import Account, CarCatalog, MotorbikeCatalog
from src.services.database import SessionLocal, engine


CAR_IMAGE_MAP = {
    "vf3": "/static/uploads/cars/VF3_Plus.jpg",
    "vf2": "/static/uploads/cars/VF3_Eco.jpg",
    "vf5": "/static/uploads/cars/VF5.jpg",
    "vf6": "/static/uploads/cars/VF6_Plus.jpg",
    "vf7": "/static/uploads/cars/VF7_Plus_thuong.jpg",
    "vf8": "/static/uploads/cars/VF8_Plus.jpg",
    "vf9": "/static/uploads/cars/VF9_Plus.jpg",
    "nerio": "/static/uploads/cars/Nerio_green.jpg",
    "herio": "/static/uploads/cars/Herio_green.jpg",
    "minio": "/static/uploads/cars/Minio_green.jpg",
    "limo": "/static/uploads/cars/Limo_green.jpg",
    "ec van": "/static/uploads/cars/EC_Van.jpg",
    "ecvan": "/static/uploads/cars/EC_Van.jpg",
    "ebus": "/static/uploads/cars/EBus.jpg",
    "mpv": "/static/uploads/cars/VF7_MPV.jpg",
}

ESCOOTER_IMAGE_MAP = {
    "evo-lite": "/static/uploads/escooters/Evo_lite.jpg",
    "kyo": "/static/uploads/escooters/Kyo.jpg",
    "flazz": "/static/uploads/escooters/Flazz.jpg",
    "evo-lite-neo": "/static/uploads/escooters/Evo_lite_neo.jpg",
    "amio-s": "/static/uploads/escooters/Amio_S2.jpg",
    "evo-grand": "/static/uploads/escooters/Evo.jpg",
    "zgoo": "/static/uploads/escooters/ZGoo.jpg",
    "kinet": "/static/uploads/escooters/Kinet.jpg",
    "vf-drgnfly": "/static/uploads/escooters/DrgnFly.jpg",
    "feliz": "/static/uploads/escooters/Feliz_2025.jpg",
    "vento": "/static/uploads/escooters/Vento.jpg",
    "theon": "/static/uploads/escooters/Theon.jpg",
    "klara": "/static/uploads/escooters/Klara.jpg",
}


def parse_datetime(dt_str):
    if not dt_str:
        return datetime.utcnow()
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except Exception:
        try:
            return datetime.strptime(dt_str[:19], "%Y-%m-%d %H:%M:%S")
        except Exception:
            return datetime.utcnow()


def safe_int(val):
    if not val or val == "null":
        return None
    try:
        return int(float(val))
    except Exception:
        return None


def safe_float(val):
    if not val or val == "null":
        return None
    try:
        return float(val)
    except Exception:
        return None


async def seed_users(session):
    print("--- 1. Seeding Accounts from users_rows.csv ---")
    await session.execute(text("DROP TABLE IF EXISTS accounts CASCADE;"))
    await session.commit()
    
    async with engine.begin() as conn:
        await conn.run_sync(Account.__table__.create)

    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "users_rows.csv")
    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        return

    with open(csv_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            user_id = uuid.UUID(row["id"].strip())
            email = row["email"].strip().lower()
            
            stmt = select(Account).where(Account.user_id == user_id)
            res = await session.execute(stmt)
            acc = res.scalar_one_or_none()

            is_act = str(row["is_active"]).strip().lower() == "true"
            created_at_dt = parse_datetime(row.get("created_at"))

            if not acc:
                acc = Account(
                    user_id=user_id,
                    email=email,
                    phone=row["phone"].strip(),
                    hashed_password=row["hashed_password"].strip(),
                    full_name=row["full_name"].strip(),
                    role=row["role"].strip(),
                    is_active=is_act,
                    created_at=created_at_dt
                )
                session.add(acc)
            else:
                acc.email = email
                acc.phone = row["phone"].strip()
                acc.hashed_password = row["hashed_password"].strip()
                acc.full_name = row["full_name"].strip()
                acc.role = row["role"].strip()
                acc.is_active = is_act

            count += 1
        await session.commit()
        print(f"Successfully seeded {count} accounts!")


async def seed_motorbikes(session):
    print("--- 2. Seeding Motorbike Catalog from motorbike_catalog_rows.csv ---")
    await session.execute(text("DROP TABLE IF EXISTS motorbike_catalog CASCADE;"))
    await session.commit()

    async with engine.begin() as conn:
        await conn.run_sync(MotorbikeCatalog.__table__.create)

    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "motorbike_catalog_rows.csv")
    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        return

    with open(csv_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            m_id = uuid.UUID(row["motorbike_id"].strip())
            raw_model_name = row["model_name"].strip()

            raw_line = row.get("vehicle_line", "").strip()
            version = raw_line
            clean_line = raw_model_name.replace("VinFast", "").strip()
            if not clean_line:
                clean_line = "E-Scooter"

            model_slug = clean_line.lower().replace(" ", "-")
            img_url = None
            for key, path in ESCOOTER_IMAGE_MAP.items():
                if key in model_slug:
                    img_url = path
                    break
            if not img_url:
                img_url = f"/static/uploads/escooters/{model_slug}.jpg"

            colors_data = []
            if row.get("colors"):
                try:
                    colors_data = json.loads(row["colors"])
                except Exception:
                    pass

            add_specs = {}
            if row.get("additional_specs"):
                try:
                    add_specs = json.loads(row["additional_specs"])
                    colors_from_spec = add_specs.get("colors") or add_specs.get("_legacy_source", {}).get("specifications", {}).get("additional_specs", {}).get("colors", [])
                    if colors_from_spec and not colors_data:
                        colors_data = colors_from_spec
                except Exception:
                    pass

            full_model_name = f"{raw_model_name} {version}".strip() if version and version not in raw_model_name else raw_model_name

            price = int(safe_float(row.get("list_price")) or 0)
            is_act = str(row.get("is_active")).strip().lower() == "true"

            mb = MotorbikeCatalog(
                motorbike_id=m_id,
                model_name=full_model_name,
                vehicle_line=clean_line,
                version=version,
                category="Scooter",
                image_url=img_url,
                colors=colors_data,
                list_price=price,
                range_km=safe_float(row.get("range_km")),
                charging_time_minutes=safe_int(row.get("charging_time_minutes")),
                battery_type=row.get("battery_type"),
                battery_quantity=safe_int(row.get("battery_quantity")),
                battery_capacity_kwh=safe_float(row.get("battery_capacity_kwh")),
                motor_type=row.get("motor_type"),
                maximum_power_w=safe_float(row.get("maximum_power_w")),
                maximum_speed_kmh=safe_float(row.get("maximum_speed_kmh")),
                weight_kg=safe_float(row.get("weight_kg")),
                length_mm=safe_int(row.get("length_mm")),
                width_mm=safe_int(row.get("width_mm")),
                height_mm=safe_int(row.get("height_mm")),
                front_brake=row.get("front_brake"),
                rear_brake=row.get("rear_brake"),
                front_suspension=row.get("front_suspension"),
                rear_suspension=row.get("rear_suspension"),
                additional_specs=add_specs,
                is_active=is_act
            )
            session.add(mb)
            count += 1

        await session.commit()
        print(f"Successfully seeded {count} motorbikes from CSV!")


async def seed_cars(session):
    print("--- 3. Seeding Car Catalog from car_catalog_rows.csv ---")
    await session.execute(text("DROP TABLE IF EXISTS car_catalog CASCADE;"))
    await session.commit()

    async with engine.begin() as conn:
        await conn.run_sync(CarCatalog.__table__.create)

    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "car_catalog_rows.csv")
    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        return

    with open(csv_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            c_id = uuid.UUID(row["car_id"].strip())
            raw_model_name = row["model_name"].strip()  # e.g., "VinFast VF 5"
            raw_vehicle_line = row.get("vehicle_line", "").strip()  # e.g., "Plus", "Eco", "Service"
            version = raw_vehicle_line

            # Clean vehicle_line (family name like "VF 5", "VF 8", "EBus", "Nerio Green")
            clean_line = raw_model_name.replace("VinFast", "").strip()
            if version and clean_line.endswith(version):
                clean_line = clean_line[:-len(version)].strip()
            if not clean_line:
                clean_line = "VF"

            # Derive category (Personal, Service, Bus, SUV)
            if version == "Service" or "Green" in raw_model_name or "Service" in raw_model_name:
                category = "Service"
            elif "Bus" in raw_model_name or "EBus" in raw_model_name:
                category = "Bus"
            else:
                category = "Personal"

            # Form complete model_name (e.g. "VinFast VF 5 Plus")
            if version and not raw_model_name.endswith(version):
                full_model_name = f"{raw_model_name} {version}"
            else:
                full_model_name = raw_model_name

            # Match image_url
            model_slug = raw_model_name.lower().replace(" ", "")
            img_url = None
            for key, path in CAR_IMAGE_MAP.items():
                clean_k = key.lower().replace(" ", "")
                if clean_k in model_slug:
                    img_url = path
                    break
            if not img_url:
                img_url = f"/static/uploads/cars/{model_slug}.jpg"

            # Parse additional_specs
            add_specs = {}
            if row.get("additional_specs"):
                try:
                    add_specs = json.loads(row["additional_specs"])
                except Exception:
                    pass

            price = int(safe_float(row.get("list_price")) or 0)
            is_act = str(row.get("is_active")).strip().lower() == "true"
            created_at_dt = parse_datetime(row.get("created_at"))
            updated_at_dt = parse_datetime(row.get("updated_at"))

            car = CarCatalog(
                car_id=c_id,
                model_name=full_model_name,
                vehicle_line=clean_line,
                version=version,
                category=category,
                image_url=img_url,
                list_price=price,
                seat_count=safe_int(row.get("seat_count")),
                length_mm=safe_int(row.get("length_mm")),
                width_mm=safe_int(row.get("width_mm")),
                height_mm=safe_int(row.get("height_mm")),
                wheelbase_mm=safe_int(row.get("wheelbase_mm")),
                range_km=safe_float(row.get("range_km")),
                maximum_power_kw=safe_float(row.get("maximum_power_kw")),
                maximum_torque_nm=safe_float(row.get("maximum_torque_nm")),
                usable_battery_capacity=safe_float(row.get("usable_battery_capacity_kwh")),
                additional_specs=add_specs,
                is_active=is_act,
                created_at=created_at_dt,
                updated_at=updated_at_dt
            )
            session.add(car)
            count += 1

        await session.commit()
        print(f"Successfully seeded {count} cars from car_catalog_rows.csv!")


async def main():
    async with SessionLocal() as session:
        await seed_users(session)
        await seed_motorbikes(session)
        await seed_cars(session)
        print("\nALL DATA FROM 3 CSV FILES MAPPED & SEEDED TO SUPABASE SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
