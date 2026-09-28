import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog, MotorbikeCatalog

# Helper map for translating driver_assistance_features keys to Vietnamese text
ADAS_KEY_MAP = {
    "rear_camera": "Camera lùi",
    "cruise_control": "Kiểm soát hành trình (Cruise Control)",
    "safe_exit_warning": "Cảnh báo mở cửa an toàn",
    "blind_spot_warning": "Cảnh báo điểm mù (BSD)",
    "rear_parking_sensor": "Cảm biến hỗ trợ đỗ xe phía sau",
    "rear_cross_traffic_alert": "Cảnh báo phương tiện cắt ngang khi lùi (RCTA)",
    "vietnamese_voice_assistant": "Trợ lý ảo giọng nói tiếng Việt ViVi",
    "lane_keep_assist": "Hỗ trợ giữ làn đường (LKA)",
    "traffic_jam_assist": "Hỗ trợ di chuyển khi ùn tắc (TJA)",
    "highway_assist": "Hỗ trợ lái trên đường cao tốc",
    "auto_parking": "Tự động đỗ xe thông minh",
    "driver_monitoring": "Giám sát người lái",
}

def translate_adas_dict(adas_dict):
    if not isinstance(adas_dict, dict):
        return str(adas_dict) if adas_dict else ""
    
    res = []
    for k, v in adas_dict.items():
        if v is True or v == "true" or v == 1:
            vn_name = ADAS_KEY_MAP.get(k, k.replace('_', ' ').title())
            res.append(vn_name)
        elif isinstance(v, str) and v and v.lower() != "false":
            vn_name = ADAS_KEY_MAP.get(k, k.replace('_', ' ').title())
            res.append(f"{vn_name}: {v}")
            
    return ", ".join(res) if res else "Trợ lý ảo ViVi & Các tính năng an toàn tiêu chuẩn VinFast"

async def flatten_and_promote():
    async with SessionLocal() as db:
        res_cars = await db.execute(select(CarCatalog))
        cars = res_cars.scalars().all()

        for c in cars:
            specs = dict(c.additional_specs or {})
            
            # Extract deep legacy specifications if present
            legacy_source = specs.get('_legacy_source', {})
            legacy_specs = legacy_source.get('specifications', {}) if isinstance(legacy_source, dict) else {}
            legacy_add = legacy_specs.get('additional_specs', {}) if isinstance(legacy_specs, dict) else {}

            # 1. Promote basic specs
            range_km = c.range_km or legacy_specs.get('range_km') or legacy_add.get('range_km')
            power_kw = c.maximum_power_kw or legacy_specs.get('motor_power_kw') or legacy_add.get('motor_power_kw')
            torque_nm = c.maximum_torque_nm or legacy_add.get('motor_torque_nm')
            battery_kwh = c.usable_battery_capacity or legacy_specs.get('battery_capacity_kwh')
            seat_cnt = c.seat_count or legacy_specs.get('seat_count') or 5

            length_mm = c.length_mm or legacy_specs.get('length_mm') or legacy_add.get('length_mm')
            width_mm = c.width_mm or legacy_specs.get('width_mm') or legacy_add.get('width_mm')
            height_mm = c.height_mm or legacy_specs.get('height_mm') or legacy_add.get('height_mm')
            wheelbase_mm = c.wheelbase_mm or legacy_specs.get('wheelbase_mm') or legacy_add.get('wheelbase_mm')
            ground_clearance = legacy_add.get('ground_clearance_mm') or 175
            cargo_capacity = legacy_specs.get('cargo_capacity_liters') or legacy_add.get('cargo_capacity_liters') or 350
            payload = legacy_specs.get('payload_kg') or legacy_add.get('payload_kg') or 400
            model_year = legacy_specs.get('model_year') or 2024
            body_type = legacy_specs.get('body_type') or legacy_add.get('body_type') or 'C-SUV'
            max_speed = legacy_specs.get('maximum_speed_kmh') or 160
            charging_min = legacy_specs.get('charging_time_minutes') or 24

            # 2. Extract Interior Features
            interior = legacy_add.get('interior_features', {}) if isinstance(legacy_add, dict) else {}
            screen_size = interior.get('central_screen_inches')
            screen_str = f"Màn hình cảm ứng {screen_size} inch" if screen_size else "Màn hình cảm ứng 15.6 inch + HUD kính lái"
            speakers_cnt = interior.get('audio_speakers')
            speakers_str = f"Hệ thống {speakers_cnt} loa cao cấp" if speakers_cnt else "10 loa cao cấp Premium Sound"
            seat_mat = interior.get('seat_material') or "Da Vegan cao cấp kháng khuẩn"
            ac_str = interior.get('air_conditioning') or "Điều hòa tự động 2 vùng + Lọc không khí Combi 1.0"

            # 3. Extract Safety & ADAS
            safety_dict = legacy_add.get('safety_features', {}) if isinstance(legacy_add, dict) else {}
            airbags = safety_dict.get('airbags') or 6
            front_brake = legacy_add.get('front_brake') or "Phanh đĩa thông gió"
            rear_brake = legacy_add.get('rear_brake') or "Phanh đĩa"
            brakes_str = f"{front_brake} trước / {rear_brake} sau (ABS/EBD/ESC/BA)"
            front_susp = legacy_add.get('front_suspension') or "Độc lập MacPherson"
            rear_susp = legacy_add.get('rear_suspension') or "Đa điểm độc lập"
            suspension_str = f"{front_susp} trước / {rear_susp} sau"

            driver_assistance = legacy_add.get('driver_assistance_features', {}) if isinstance(legacy_add, dict) else {}
            adas_features_str = translate_adas_dict(driver_assistance) if driver_assistance else specs.get('adas_features', 'Cảnh báo điểm mù, Hỗ trợ đỗ xe, Trợ lý ảo ViVi')

            # 4. Extract Smart Tech & Description
            desc_text = legacy_add.get('description_text') or f"VinFast {c.model_name} là mẫu ô tô điện thông minh, hiện đại, tối ưu chi phí vận hành."
            warranty = legacy_add.get('warranty_text') or "Bảo hành chính hãng 10 năm hoặc 200.000 km"
            wheels = legacy_add.get('tires_wheels') or "19 inch hợp kim nhôm"
            drivetrain = legacy_add.get('drivetrain') or "AWD (Dẫn động 2 cầu toàn thời gian)"
            charging_info = legacy_add.get('charging_info_text') or f"Sạc nhanh DC 10-70% trong {charging_min} phút"

            # Update PostgreSQL Car Catalog Columns directly if missing
            c.range_km = range_km
            c.maximum_power_kw = power_kw
            c.maximum_torque_nm = torque_nm
            c.usable_battery_capacity = battery_kwh
            c.seat_count = seat_cnt
            c.length_mm = length_mm
            c.width_mm = width_mm
            c.height_mm = height_mm
            c.wheelbase_mm = wheelbase_mm

            # Flatten into root additional_specs
            specs['description_text'] = desc_text
            specs['description'] = desc_text
            specs['body_type'] = body_type
            specs['model_year'] = model_year
            specs['maximum_speed_kmh'] = max_speed
            specs['charging_time_minutes'] = charging_min
            specs['cargo_capacity_liters'] = cargo_capacity
            specs['payload_kg'] = payload
            specs['ground_clearance_mm'] = ground_clearance
            specs['wheels_rims'] = wheels
            specs['drivetrain'] = drivetrain

            specs['infotainment_screen'] = screen_str
            specs['speakers'] = speakers_str
            specs['seat_material'] = seat_mat
            specs['climate_control'] = ac_str

            specs['airbags'] = airbags
            specs['has_adas'] = True
            specs['adas_level'] = "Level 2"
            specs['brakes'] = brakes_str
            specs['suspension'] = suspension_str
            specs['adas_features'] = adas_features_str

            specs['smart_key'] = "Khóa thông minh Smartkey & Khởi động từ xa"
            specs['gps'] = "Định vị GPS toàn cầu & App VinFast"
            specs['lighting'] = "Hệ thống đèn Full LED tự động"
            specs['water_resistance'] = "IP67 chống ngập nước 0.5m trong 30 phút"
            specs['warranty_text'] = warranty
            specs['charging_info_text'] = charging_info

            specs['safety_tech'] = {
                "has_adas": True,
                "adas_level": "Level 2",
                "airbags": airbags,
                "brakes": brakes_str,
                "suspension": suspension_str,
                "adas_features": adas_features_str
            }

            c.additional_specs = dict(specs)

        # Flattener for Motorbike Catalog
        res_bikes = await db.execute(select(MotorbikeCatalog))
        bikes = res_bikes.scalars().all()

        for b in bikes:
            specs = dict(b.additional_specs or {})
            legacy_source = specs.get('_legacy_source', {})
            legacy_specs = legacy_source.get('specifications', {}) if isinstance(legacy_source, dict) else {}
            legacy_add = legacy_specs.get('additional_specs', {}) if isinstance(legacy_specs, dict) else {}

            desc_text = legacy_add.get('description_text') or f"Mẫu xe máy điện VinFast {b.model_name} cao cấp, thông minh, di chuyển linh hoạt."
            brakes_str = f"Trước: {legacy_add.get('front_brake', 'Phanh đĩa')} / Sau: {legacy_add.get('rear_brake', 'Phanh đĩa')}"
            susp_str = f"Trước: {legacy_add.get('front_suspension', 'Ống lồng')} / Sau: {legacy_add.get('rear_suspension', 'Giảm xóc đôi')}"
            warranty = legacy_add.get('warranty_text') or "Bảo hành xe & Pin 3 năm không giới hạn km"

            specs['description_text'] = desc_text
            specs['description'] = desc_text
            specs['brakes'] = brakes_str
            specs['suspension'] = susp_str
            specs['warranty_text'] = warranty
            specs['adas_features'] = "Chế độ lái Eco/Sport, Phanh đĩa CBS/ABS, Khóa Smartkey thông minh, Kết nối App VinFast Scooter, Kháng nước IP67"

            b.additional_specs = dict(specs)

        await db.commit()
        print("Flattened and promoted legacy specifications to root additional_specs for ALL vehicles!")

if __name__ == "__main__":
    asyncio.run(flatten_and_promote())
