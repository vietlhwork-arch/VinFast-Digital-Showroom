import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog, MotorbikeCatalog

UNANNOUNCED_TEXT = "Chưa thấy công bố trong thông tin chính thức hiện tại"

# Official VinFast Catalog Matrix
OFFICIAL_CAR_MATRIX = {
    "VF 3": {
        "airbags": 1,
        "airbags_text": "1 túi khí (Người lái)",
        "has_adas": False,
        "adas_level": "Không trang bị",
        "adas_features": "Chưa có trang bị ADAS (Chỉ có Camera lùi và Cảm biến hỗ trợ đỗ xe)",
    },
    "VF 5": {
        "airbags": 6,
        "airbags_text": "6 túi khí an toàn",
        "has_adas": True,
        "adas_level": "Level 1+",
        "adas_features": "Cảnh báo điểm mù (BSD), Cảnh báo phương tiện cắt ngang khi lùi (RCTA), Cảnh báo mở cửa an toàn, Cảm biến hỗ trợ đỗ xe, Trợ lý ảo ViVi",
    },
    "VF 6 Eco": {
        "airbags": 4,
        "airbags_text": "4 túi khí an toàn",
        "has_adas": True,
        "adas_level": "Level 2",
        "adas_features": "Hỗ trợ di chuyển khi ùn tắc (TJA), Hỗ trợ lái đường cao tốc, Cảnh báo lệch làn & Giữ làn (LKA), Cảnh báo điểm mù (BSD), Trợ lý ảo ViVi",
    },
    "VF 6 Plus": {
        "airbags": 7,
        "airbags_text": "7 túi khí an toàn",
        "has_adas": True,
        "adas_level": "Level 2",
        "adas_features": "Hỗ trợ di chuyển khi ùn tắc (TJA), Hỗ trợ lái đường cao tốc, Cảnh báo lệch làn & Giữ làn (LKA), Cảnh báo điểm mù (BSD), Trợ lý ảo ViVi, Pet Mode, Camp Mode",
    },
    "VF 6": {
        "airbags": 7,
        "airbags_text": "7 túi khí an toàn",
        "has_adas": True,
        "adas_level": "Level 2",
        "adas_features": "Hỗ trợ di chuyển khi ùn tắc (TJA), Hỗ trợ lái đường cao tốc, Cảnh báo lệch làn & Giữ làn (LKA), Cảnh báo điểm mù (BSD), Trợ lý ảo ViVi",
    },
    "VF 7 Eco": {
        "airbags": 6,
        "airbags_text": "6 túi khí an toàn",
        "has_adas": True,
        "adas_level": "Level 2",
        "adas_features": "Hỗ trợ lái trên đường cao tốc (Highway Assist), Giám sát hành trình thích ứng (ACC), Cảnh báo điểm mù & Mở cửa, Nhận diện biển báo giao thông",
    },
    "VF 7 Plus": {
        "airbags": 8,
        "airbags_text": "8 túi khí an toàn",
        "has_adas": True,
        "adas_level": "Level 2",
        "adas_features": "Hỗ trợ lái trên đường cao tốc (Highway Assist), Giám sát hành trình thích ứng (ACC), Cảnh báo điểm mù & Mở cửa, Camera 360 toàn cảnh, Nhận diện biển báo giao thông",
    },
    "VF 7": {
        "airbags": 8,
        "airbags_text": "8 túi khí an toàn",
        "has_adas": True,
        "adas_level": "Level 2",
        "adas_features": "Hỗ trợ lái trên đường cao tốc (Highway Assist), Giám sát hành trình thích ứng (ACC), Cảnh báo điểm mù & Mở cửa, Camera 360 toàn cảnh, Nhận diện biển báo giao thông",
    },
    "VF 8 Eco": {
        "airbags": 11,
        "airbags_text": "11 túi khí an toàn cao cấp",
        "has_adas": True,
        "adas_level": "Level 2+",
        "adas_features": "Hỗ trợ di chuyển khi ùn tắc (TJA), Hỗ trợ lái đường cao tốc, Tự động chuyển làn, Cảnh báo điểm mù, Giám sát lái xe (Driver Monitoring), ViVi đa vùng",
    },
    "VF 8": {
        "airbags": 11,
        "airbags_text": "11 túi khí an toàn cao cấp",
        "has_adas": True,
        "adas_level": "Level 2+",
        "adas_features": "Hỗ trợ di chuyển khi ùn tắc (TJA), Hỗ trợ lái đường cao tốc, Tự động chuyển làn, Tự động đỗ xe & Remote Parking, Giám sát lái xe (Driver Monitoring), ViVi đa vùng",
    },
    "VF 9": {
        "airbags": 11,
        "airbags_text": "11 túi khí an toàn cao cấp",
        "has_adas": True,
        "adas_level": "Level 2+",
        "adas_features": "Trợ lái ADAS Level 2 cao cấp: Hỗ trợ lái cao tốc, Tự động chuyển làn, Tự động đỗ xe thông minh, Giám sát tài xế, Camera 360 toàn cảnh, ViVi thương gia",
    },
    "VF e34": {
        "airbags": 6,
        "airbags_text": "6 túi khí an toàn",
        "has_adas": True,
        "adas_level": "Level 1+",
        "adas_features": "Cảnh báo lệch làn đường, Cảnh báo phương tiện cắt ngang khi lùi, Cảnh báo điểm mù, Cảnh báo luồng giao thông khi mở cửa, Trợ lý ảo ViVi tiếng Việt",
    },
    "EBus": {
        "airbags": 0,
        "airbags_text": UNANNOUNCED_TEXT,
        "has_adas": True,
        "adas_level": "Tiêu chuẩn Xe buýt",
        "adas_features": "Cảnh báo điểm mù xe buýt lớn, Cảnh báo chệch làn đường, Camera đếm lượt khách & Giám sát khoang xe, Phanh khí nén EBS/ABS, Quản lý hành trình VinBus Fleet",
    },
}

async def update_airbags_and_adas():
    async with SessionLocal() as db:
        res_cars = await db.execute(select(CarCatalog))
        cars = res_cars.scalars().all()

        for c in cars:
            name = c.model_name or ""
            specs = dict(c.additional_specs or {})

            # Match model against official matrix
            matched_key = None
            for key in OFFICIAL_CAR_MATRIX:
                if key.lower() in name.lower():
                    matched_key = key
                    break

            if matched_key:
                info = OFFICIAL_CAR_MATRIX[matched_key]
                c.seat_count = c.seat_count or 5
                specs["airbags"] = info["airbags"]
                specs["airbags_text"] = info["airbags_text"]
                specs["has_adas"] = info["has_adas"]
                specs["adas_level"] = info["adas_level"]
                specs["adas_features"] = info["adas_features"]
            else:
                # Custom/Concept/Unannounced Fleet models (VF 2, EC Van, Herio Green, Limo Green, Nerio Green, Minio Green)
                specs["airbags"] = 0
                specs["airbags_text"] = UNANNOUNCED_TEXT
                specs["has_adas"] = False
                specs["adas_level"] = UNANNOUNCED_TEXT
                specs["adas_features"] = UNANNOUNCED_TEXT

            # Synchronize safety_tech and safety_adas sub-objects
            specs["safety_tech"] = {
                "has_adas": specs.get("has_adas", False),
                "adas_level": specs.get("adas_level", UNANNOUNCED_TEXT),
                "airbags": specs.get("airbags", 0),
                "airbags_text": specs.get("airbags_text", UNANNOUNCED_TEXT),
                "brakes": specs.get("brakes", UNANNOUNCED_TEXT),
                "suspension": specs.get("suspension", UNANNOUNCED_TEXT),
                "adas_features": specs.get("adas_features", UNANNOUNCED_TEXT)
            }

            specs["safety_adas"] = {
                "has_adas": specs.get("has_adas", False),
                "adas_level": specs.get("adas_level", UNANNOUNCED_TEXT),
                "airbags": specs.get("airbags", 0),
                "airbags_text": specs.get("airbags_text", UNANNOUNCED_TEXT),
                "features": specs.get("adas_features", UNANNOUNCED_TEXT)
            }

            c.additional_specs = dict(specs)

        # Update Motorbikes Catalog
        res_bikes = await db.execute(select(MotorbikeCatalog))
        bikes = res_bikes.scalars().all()

        for b in bikes:
            specs = dict(b.additional_specs or {})
            specs["airbags"] = 0
            specs["airbags_text"] = "Không trang bị (Xe máy điện)"
            specs["has_adas"] = False
            specs["adas_level"] = "Không áp dụng"
            b.additional_specs = dict(specs)

        await db.commit()
        print("Successfully audited airbags and ADAS info with official VinFast data & unannounced fallbacks!")

if __name__ == "__main__":
    asyncio.run(update_airbags_and_adas())
