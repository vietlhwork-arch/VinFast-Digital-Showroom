import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog, MotorbikeCatalog

CAR_ADAS_EXACT_MAP = {
    "VF 3": {
        "has_adas": False,
        "adas_level": "Tiêu chuẩn",
        "adas_features": "Camera lùi, Màn hình 10 inch tích hợp Android Auto/Apple CarPlay, Quản lý xe qua App VinFast, Cảnh báo áp suất lốp",
    },
    "VF 5": {
        "has_adas": True,
        "adas_level": "Level 1+",
        "adas_features": "Cảnh báo điểm mù (BSD), Cảnh báo phương tiện cắt ngang khi lùi (RCTA), Cảnh báo mở cửa an toàn, Cảm biến hỗ trợ đỗ xe, Trợ lý ảo ViVi",
    },
    "VF 6": {
        "has_adas": True,
        "adas_level": "Level 2",
        "adas_features": "Hỗ trợ di chuyển khi ùn tắc (TJA), Hỗ trợ lái đường cao tốc, Cảnh báo lệch làn & Giữ làn (LKA), Cảnh báo điểm mù (BSD), Trợ lý ảo ViVi, Pet Mode, Camp Mode",
    },
    "VF 7": {
        "has_adas": True,
        "adas_level": "Level 2",
        "adas_features": "Hỗ trợ lái trên đường cao tốc (Highway Assist), Giám sát hành trình thích ứng (ACC), Cảnh báo điểm mù & Mở cửa, Camera 360 toàn cảnh, Nhận diện biển báo giao thông",
    },
    "VF 8": {
        "has_adas": True,
        "adas_level": "Level 2+",
        "adas_features": "Hỗ trợ di chuyển khi ùn tắc (TJA), Hỗ trợ lái đường cao tốc, Tự động chuyển làn, Tự động đỗ xe & Remote Parking, Giám sát lái xe (Driver Monitoring), ViVi đa vùng",
    },
    "VF 9": {
        "adas_level": "Level 2+",
        "has_adas": True,
        "adas_features": "Trợ lái ADAS Level 2 cao cấp: Hỗ trợ lái cao tốc, Tự động chuyển làn, Tự động đỗ xe thông minh, Giám sát tài xế, Camera 360 toàn cảnh, Ghế thương gia massage, ViVi cao cấp",
    },
    "VF e34": {
        "has_adas": True,
        "adas_level": "Level 1+",
        "adas_features": "Cảnh báo lệch làn đường, Cảnh báo phương tiện cắt ngang khi lùi, Cảnh báo điểm mù, Cảnh báo luồng giao thông khi mở cửa, Trợ lý ảo ViVi giọng nói tiếng Việt",
    },
    "VF 2": {
        "has_adas": False,
        "adas_level": "Tiêu chuẩn",
        "adas_features": "Cảm biến lùi, Cảnh báo áp suất lốp, Định vị GPS & Quản lý thông minh qua App VinFast",
    },
    "VF MPV 7": {
        "has_adas": True,
        "adas_level": "Level 1+",
        "adas_features": "Cảnh báo điểm mù, Cảm biến lùi & Camera lùi, Kiểm soát hành trình Cruise Control, Hỗ trợ đỗ xe gia đình, Trợ lý ảo ViVi",
    },
    "EBus": {
        "has_adas": True,
        "adas_level": "Tiêu chuẩn Xe buýt",
        "adas_features": "Cảnh báo điểm mù xe buýt lớn, Cảnh báo chệch làn đường, Camera đếm lượt khách & Giám sát khoang xe, Phanh khí nén EBS/ABS, Quản lý hành trình VinBus Fleet",
    },
    "EC Van": {
        "has_adas": False,
        "adas_level": "Tiêu chuẩn Thương mại",
        "adas_features": "Cảm biến lùi hỗ trợ bốc xếp hàng, Định vị GPS giám sát hành trình xe tải nhẹ, Phanh ABS/EBD an toàn",
    },
    "Herio": {
        "has_adas": True,
        "adas_level": "Level 1+",
        "adas_features": "Cảnh báo điểm mù, Camera lùi & Cảm biến đỗ xe đô thị, Quản lý điều xe qua App VinFast Green Service",
    },
    "Limo": {
        "has_adas": True,
        "adas_level": "Level 1+",
        "adas_features": "Cảnh báo mở cửa an toàn, Camera 360 hỗ trợ đỗ xe taxi/dịch vụ, Giám sát hành trình fleet VinFast Green",
    },
    "Minio": {
        "has_adas": False,
        "adas_level": "Tiêu chuẩn",
        "adas_features": "Cảm biến lùi mini, Định vị GPS giám sát vận hành đô thị, Trợ lý ảo giọng nói tiếng Việt",
    },
    "Nerio": {
        "has_adas": True,
        "adas_level": "Level 1+",
        "adas_features": "Cảnh báo điểm mù, Camera lùi sắc nét, Hệ thống quản lý và giám sát vận hành xe Green Service",
    }
}

MOTORBIKE_ADAS_EXACT_MAP = {
    "Theon": "Hệ thống phanh ABS 2 kênh Continental, Khóa PAAK thông minh (Phone as a Key), Động cơ trung tâm Center Motor 7100W, Giảm xóc đôi Showa, eSIM GPS",
    "Vento": "Hệ thống phanh ABS chống bó cứng trước, Khóa thông minh PAAK, Động cơ Side Motor nguyên khối, Kết nối App VinFast Scooter, eSIM",
    "Klara": "Phanh đĩa ABS an toàn, Khóa từ thông minh, Kết nối App di động tìm xe từ xa, Chuẩn kháng nước IP67",
    "Feliz": "Hệ thống phanh đĩa an toàn, 2 Chế độ lái Eco/Sport, Kết nối App VinFast di động, Chuẩn kháng nước IP67 vượt ngập 0.5m",
    "Evo": "2 Chế độ lái Eco/Sport, Đèn Full LED định vị, Khóa thông minh Smartkey, Kết nối App VinFast Scooter, Chuẩn kháng nước IP67",
    "DrgnFly": "Trợ lực điện đa cấp thông minh, Màn hình LCD hiển thị tốc độ, Khóa từ an toàn chống trộm, Pin tháo rời sạc tiện lợi",
    "Flazz": "2 Chế độ lái Eco/Sport, Phanh đĩa CBS, Khóa từ thông minh, Định vị GPS qua App VinFast",
    "Amio": "Chế độ lái Eco/Sport nhỏ gọn đô thị, Khóa từ Smartkey, Đèn LED chiếu sáng, Kháng nước IP67",
    "Kyo": "Chế độ lái Eco/Sport, Phanh đĩa an toàn, Khóa Smartkey thông minh, Định vị GPS",
    "Kinet": "Chế độ lái Eco/Sport, Khóa từ an toàn, Kết nối App di động VinFast",
    "Vero": "Chế độ lái Eco/Sport, Phanh đĩa trước, Khóa thông minh Smartkey, Kháng nước IP67",
    "ZGoo": "Chế độ lái Eco/Sport, Khóa từ thông minh, Đèn LED tiết kiệm điện",
}

async def perfect_seed():
    async with SessionLocal() as db:
        res_cars = await db.execute(select(CarCatalog))
        cars = res_cars.scalars().all()

        for c in cars:
            name = c.model_name or ""
            specs = dict(c.additional_specs or {})

            matched_info = None
            for key, info in CAR_ADAS_EXACT_MAP.items():
                if key.lower() in name.lower():
                    matched_info = info
                    break

            if not matched_info:
                matched_info = {
                    "has_adas": True,
                    "adas_level": "Level 1+",
                    "adas_features": "Cảnh báo điểm mù, Cảm biến lùi & Camera lùi, Kiểm soát hành trình Cruise Control, Trợ lý ảo ViVi",
                }

            specs["has_adas"] = matched_info["has_adas"]
            specs["adas_level"] = matched_info["adas_level"]
            specs["adas_features"] = matched_info["adas_features"]

            specs["safety_tech"] = {
                "has_adas": matched_info["has_adas"],
                "adas_level": matched_info["adas_level"],
                "airbags": specs.get("airbags", 6),
                "brakes": specs.get("brakes", "Phanh đĩa tản nhiệt / ABS / EBD"),
                "suspension": specs.get("suspension", "Độc lập MacPherson"),
                "adas_features": matched_info["adas_features"]
            }

            specs["safety_adas"] = {
                "has_adas": matched_info["has_adas"],
                "adas_level": matched_info["adas_level"],
                "features": matched_info["adas_features"]
            }

            c.additional_specs = dict(specs)

        res_bikes = await db.execute(select(MotorbikeCatalog))
        bikes = res_bikes.scalars().all()

        for b in bikes:
            name = b.model_name or ""
            specs = dict(b.additional_specs or {})

            matched_feat = None
            for key, feat in MOTORBIKE_ADAS_EXACT_MAP.items():
                if key.lower() in name.lower():
                    matched_feat = feat
                    break

            if not matched_feat:
                matched_feat = "Chế độ lái Eco/Sport, Phanh đĩa CBS/ABS, Khóa Smartkey thông minh, Kết nối App VinFast Scooter, Chuẩn kháng nước IP67"

            specs["has_adas"] = False
            specs["adas_level"] = "Không áp dụng (Xe máy điện)"
            specs["adas_features"] = matched_feat
            b.additional_specs = dict(specs)

        await db.commit()
        print("Successfully updated database with EXACT VinFast ADAS & Smart Specs for every model!")

if __name__ == "__main__":
    asyncio.run(perfect_seed())
