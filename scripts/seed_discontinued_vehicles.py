"""Seed Discontinued Vehicles (is_active = False) into Supabase Database.

Inserts historical gasoline cars and legacy e-scooters into `car_catalog` and `motorbike_catalog`
with `is_active = False`. Fully idempotent.
"""

import asyncio
import uuid
import logging
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog, MotorbikeCatalog

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DISCONTINUED_CARS = [
    {
        "model_name": "VinFast Fadil Tiêu Chuẩn (Base)",
        "vehicle_line": "Fadil",
        "version": "Base",
        "category": "Personal",
        "image_url": "/static/uploads/cars/fadil.jpg",
        "list_price": 425_000_000,
        "seat_count": 5,
        "length_mm": 3676,
        "width_mm": 1632,
        "height_mm": 1490,
        "wheelbase_mm": 2385,
        "range_km": None,
        "maximum_power_kw": 73.0,
        "maximum_torque_nm": 128.0,
        "usable_battery_capacity": None,
        "additional_specs": {
            "fuel_type": "gasoline",
            "engine": "1.4L DOHC 4 xi-lanh",
            "transmission": "CVT",
            "is_discontinued": True,
            "discontinued_year": 2022,
            "discontinued_reason": "VinFast đã chính thức dừng sản xuất các dòng xe xăng từ cuối năm 2022 để chuyển đổi hoàn toàn 100% sang hệ sinh thái xe điện thuần túy.",
            "alternative_model": "VinFast VF 5 Plus",
        },
        "is_active": False,
    },
    {
        "model_name": "VinFast Fadil Nâng Cao (Plus)",
        "vehicle_line": "Fadil",
        "version": "Plus",
        "category": "Personal",
        "image_url": "/static/uploads/cars/fadil.jpg",
        "list_price": 459_000_000,
        "seat_count": 5,
        "length_mm": 3676,
        "width_mm": 1632,
        "height_mm": 1490,
        "wheelbase_mm": 2385,
        "range_km": None,
        "maximum_power_kw": 73.0,
        "maximum_torque_nm": 128.0,
        "usable_battery_capacity": None,
        "additional_specs": {
            "fuel_type": "gasoline",
            "engine": "1.4L DOHC 4 xi-lanh",
            "transmission": "CVT",
            "is_discontinued": True,
            "discontinued_year": 2022,
            "discontinued_reason": "VinFast đã dừng sản xuất xe xăng để tập trung cho các dòng SUV điện đô thị.",
            "alternative_model": "VinFast VF 5 Plus",
        },
        "is_active": False,
    },
    {
        "model_name": "VinFast Lux A2.0 Tiêu Chuẩn",
        "vehicle_line": "Lux A2.0",
        "version": "Tiêu Chuẩn",
        "category": "Personal",
        "image_url": "/static/uploads/cars/lux_a.jpg",
        "list_price": 1_115_000_000,
        "seat_count": 5,
        "length_mm": 4973,
        "width_mm": 1900,
        "height_mm": 1464,
        "wheelbase_mm": 2968,
        "range_km": None,
        "maximum_power_kw": 130.0,
        "maximum_torque_nm": 300.0,
        "usable_battery_capacity": None,
        "additional_specs": {
            "fuel_type": "gasoline",
            "engine": "2.0L DOHC I4 Turbo",
            "transmission": "ZF 8 cấp tự động",
            "is_discontinued": True,
            "discontinued_year": 2022,
            "discontinued_reason": "Dòng sedan hạng E chạy xăng đã dừng sản xuất, khách hàng có thể chuyển hướng sang dòng SUV điện cao cấp VF 8.",
            "alternative_model": "VinFast VF 8 Plus",
        },
        "is_active": False,
    },
    {
        "model_name": "VinFast Lux A2.0 Cao Cấp (Premium)",
        "vehicle_line": "Lux A2.0",
        "version": "Cao Cấp",
        "category": "Personal",
        "image_url": "/static/uploads/cars/lux_a.jpg",
        "list_price": 1_358_000_000,
        "seat_count": 5,
        "length_mm": 4973,
        "width_mm": 1900,
        "height_mm": 1464,
        "wheelbase_mm": 2968,
        "range_km": None,
        "maximum_power_kw": 170.0,
        "maximum_torque_nm": 350.0,
        "usable_battery_capacity": None,
        "additional_specs": {
            "fuel_type": "gasoline",
            "engine": "2.0L DOHC I4 Turbo",
            "transmission": "ZF 8 cấp tự động",
            "is_discontinued": True,
            "discontinued_year": 2022,
            "discontinued_reason": "Dòng sedan hạng E chạy xăng đã dừng sản xuất, khách hàng có thể chuyển hướng sang dòng SUV điện cao cấp VF 8.",
            "alternative_model": "VinFast VF 8 Plus",
        },
        "is_active": False,
    },
    {
        "model_name": "VinFast Lux SA2.0 Tiêu Chuẩn",
        "vehicle_line": "Lux SA2.0",
        "version": "Tiêu Chuẩn",
        "category": "Personal",
        "image_url": "/static/uploads/cars/lux_sa.jpg",
        "list_price": 1_552_000_000,
        "seat_count": 7,
        "length_mm": 4940,
        "width_mm": 1960,
        "height_mm": 1773,
        "wheelbase_mm": 2933,
        "range_km": None,
        "maximum_power_kw": 170.0,
        "maximum_torque_nm": 350.0,
        "usable_battery_capacity": None,
        "additional_specs": {
            "fuel_type": "gasoline",
            "engine": "2.0L DOHC I4 Turbo",
            "transmission": "ZF 8 cấp tự động",
            "is_discontinued": True,
            "discontinued_year": 2022,
            "discontinued_reason": "Dòng SUV 7 chỗ chạy xăng đã dừng sản xuất để chuyển giao cho thế hệ SUV điện đầu bảng VF 9.",
            "alternative_model": "VinFast VF 9 Eco",
        },
        "is_active": False,
    },
    {
        "model_name": "VinFast President V8 Limited",
        "vehicle_line": "President",
        "version": "V8 Limited",
        "category": "Personal",
        "image_url": "/static/uploads/cars/president.jpg",
        "list_price": 4_600_000_000,
        "seat_count": 7,
        "length_mm": 5146,
        "width_mm": 1987,
        "height_mm": 1760,
        "wheelbase_mm": 3133,
        "range_km": None,
        "maximum_power_kw": 313.0,
        "maximum_torque_nm": 624.0,
        "usable_battery_capacity": None,
        "additional_specs": {
            "fuel_type": "gasoline",
            "engine": "6.2L V8 Hút khí tự nhiên",
            "transmission": "ZF 8 cấp",
            "is_discontinued": True,
            "discontinued_year": 2022,
            "discontinued_reason": "Phiên bản giới hạn 500 chiếc độc bản đã kết thúc thương mại. Dòng SUV điện siêu cao cấp tương đương hiện nay là VF 9 Plus Ghế Cơ Trưởng.",
            "alternative_model": "VinFast VF 9 Plus (6 Chỗ Cơ Trưởng)",
        },
        "is_active": False,
    },
]

DISCONTINUED_MOTORBIKES = [
    {
        "model_name": "VinFast Ludo",
        "vehicle_line": "Ludo",
        "version": "Ắc quy chì",
        "category": "Scooter",
        "image_url": "/static/uploads/motorbikes/ludo.jpg",
        "colors": ["Đỏ", "Trắng", "Xanh dương", "Đen"],
        "list_price": 12_900_000,
        "range_km": 75.0,
        "charging_time_minutes": 300,
        "battery_type": "Lead-acid / Lithium đời đầu",
        "battery_quantity": 1,
        "battery_capacity_kwh": 1.2,
        "motor_type": "Bosch Hub Motor",
        "maximum_power_w": 500.0,
        "maximum_speed_kmh": 35.0,
        "weight_kg": 68.0,
        "length_mm": 1700,
        "width_mm": 715,
        "height_mm": 1070,
        "front_brake": "Phanh đĩa",
        "rear_brake": "Phanh cơ",
        "front_suspension": "Giảm chấn thủy lực",
        "rear_suspension": "Giảm xóc đơn",
        "additional_specs": {
            "is_discontinued": True,
            "discontinued_reason": "Đã hoàn thành vòng đời sản phẩm và ngừng bán để thay thế bằng dòng xe máy điện pin LFP thông minh thế hệ mới Evo 200 Lite.",
            "alternative_model": "VinFast Evo 200 Lite",
        },
        "is_active": False,
    },
    {
        "model_name": "VinFast Impes",
        "vehicle_line": "Impes",
        "version": "Ắc quy chì",
        "category": "Scooter",
        "image_url": "/static/uploads/motorbikes/impes.jpg",
        "colors": ["Đỏ", "Xanh đen", "Trắng", "Xám"],
        "list_price": 14_900_000,
        "range_km": 70.0,
        "charging_time_minutes": 300,
        "battery_type": "Lead-acid",
        "battery_quantity": 1,
        "battery_capacity_kwh": 1.3,
        "motor_type": "Bosch Hub Motor",
        "maximum_power_w": 1200.0,
        "maximum_speed_kmh": 49.0,
        "weight_kg": 75.0,
        "length_mm": 1800,
        "width_mm": 710,
        "height_mm": 1070,
        "front_brake": "Phanh đĩa",
        "rear_brake": "Phanh cơ",
        "front_suspension": "Ống lồng thủy lực",
        "rear_suspension": "Monoshock",
        "additional_specs": {
            "is_discontinued": True,
            "discontinued_reason": "Đã ngừng kinh doanh và chuyển sang dòng xe pin LFP đi xa 203 km Evo 200.",
            "alternative_model": "VinFast Evo 200",
        },
        "is_active": False,
    },
    {
        "model_name": "VinFast Klara A1 (Pin Lithium V1)",
        "vehicle_line": "Klara A1",
        "version": "Lithium V1",
        "category": "Scooter",
        "image_url": "/static/uploads/motorbikes/klara_a1.jpg",
        "colors": ["Đỏ", "Trắng", "Xám", "Xanh"],
        "list_price": 39_900_000,
        "range_km": 80.0,
        "charging_time_minutes": 360,
        "battery_type": "Lithium-ion V1",
        "battery_quantity": 1,
        "battery_capacity_kwh": 1.5,
        "motor_type": "Bosch Motor",
        "maximum_power_w": 1200.0,
        "maximum_speed_kmh": 50.0,
        "weight_kg": 95.0,
        "length_mm": 1910,
        "width_mm": 685,
        "height_mm": 1130,
        "front_brake": "Phanh đĩa Nissin",
        "rear_brake": "Phanh đĩa",
        "front_suspension": "Ống lồng giảm chấn",
        "rear_suspension": "Giảm chấn đôi",
        "additional_specs": {
            "is_discontinued": True,
            "discontinued_reason": "Thế hệ Klara đầu tiên đã ngừng kinh doanh, nâng cấp toàn diện thành dòng Klara S (2022) và Klara S2 dùng pin LFP hiện hành.",
            "alternative_model": "VinFast Klara S2",
        },
        "is_active": False,
    },
    {
        "model_name": "VinFast Tempest",
        "vehicle_line": "Tempest",
        "version": "Tiêu chuẩn",
        "category": "Scooter",
        "image_url": "/static/uploads/motorbikes/tempest.jpg",
        "colors": ["Đỏ", "Xanh", "Trắng", "Đen"],
        "list_price": 19_250_000,
        "range_km": 80.0,
        "charging_time_minutes": 480,
        "battery_type": "Ắc quy chì",
        "battery_quantity": 1,
        "battery_capacity_kwh": 1.2,
        "motor_type": "VinFast E-Motor",
        "maximum_power_w": 1600.0,
        "maximum_speed_kmh": 49.0,
        "weight_kg": 130.0,
        "length_mm": 1800,
        "width_mm": 710,
        "height_mm": 1063,
        "front_brake": "Phanh đĩa",
        "rear_brake": "Phanh cơ",
        "front_suspension": "Giảm xóc dầu",
        "rear_suspension": "Lò xo kép",
        "additional_specs": {
            "is_discontinued": True,
            "discontinued_reason": "Đã ngừng sản xuất để chuyển sang Feliz S và Evo 200.",
            "alternative_model": "VinFast Feliz S",
        },
        "is_active": False,
    },
]


async def seed_discontinued():
    async with SessionLocal() as db:
        # 1. Cars
        for car_data in DISCONTINUED_CARS:
            existing = (
                await db.execute(
                    select(CarCatalog).where(
                        CarCatalog.model_name == car_data["model_name"]
                    )
                )
            ).scalar_one_or_none()

            if not existing:
                car = CarCatalog(
                    car_id=uuid.uuid4(),
                    **car_data
                )
                db.add(car)
                logger.info(f"Adding discontinued car: {car_data['model_name']} (is_active=False)")
            else:
                existing.is_active = False
                existing.additional_specs = car_data["additional_specs"]
                logger.info(f"Updated existing car to is_active=False: {car_data['model_name']}")

        # 2. Motorbikes
        for bike_data in DISCONTINUED_MOTORBIKES:
            existing = (
                await db.execute(
                    select(MotorbikeCatalog).where(
                        MotorbikeCatalog.model_name == bike_data["model_name"]
                    )
                )
            ).scalar_one_or_none()

            if not existing:
                bike = MotorbikeCatalog(
                    motorbike_id=uuid.uuid4(),
                    **bike_data
                )
                db.add(bike)
                logger.info(f"Adding discontinued motorbike: {bike_data['model_name']} (is_active=False)")
            else:
                existing.is_active = False
                existing.additional_specs = bike_data["additional_specs"]
                logger.info(f"Updated existing motorbike to is_active=False: {bike_data['model_name']}")

        await db.commit()
        logger.info("Successfully seeded discontinued vehicles into Supabase!")


if __name__ == "__main__":
    asyncio.run(seed_discontinued())
