import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog, MotorbikeCatalog

CAR_ADAS_MAP = {
    "VF 3": {
        "adas_features": "Cảnh báo va chạm phía trước, Hỗ trợ đỗ xe phía sau, Trợ lý ảo ViVi thông minh, Phanh ABS/EBD",
        "description_text": "VinFast VF 3 là mẫu xe điện mini SUV đô thị nhỏ gọn, thiết kế cá tính, linh hoạt trên mọi cung đường phố thị.",
        "brakes": "Phanh đĩa trước / Phanh tang trống sau / ABS / EBD",
        "suspension": "Treo trước Độc lập MacPherson / Treo sau Trục xoắn",
    },
    "VF 5": {
        "adas_features": "Cảnh báo điểm mù (BSD), Cảnh báo giao thông cắt ngang phía sau (RCTA), Cảnh báo mở cửa, Hỗ trợ đỗ xe phía sau, Trợ lý ảo ViVi",
        "description_text": "VinFast VF 5 Plus là mẫu A-SUV thuần điện lý tưởng cho gia đình trẻ và dịch vụ vận tải thông minh với chi phí vận hành tối ưu.",
        "brakes": "Phanh đĩa trước & sau / ABS / EBD / BA",
        "suspension": "Treo trước Độc lập MacPherson / Treo sau Dầm xoắn",
    },
    "VF 6": {
        "adas_features": "Hỗ trợ di chuyển khi ùn tắc (TJA), Hỗ trợ lái trên đường cao tốc, Cảnh báo lệch làn & Giữ làn (LKA), Cảnh báo điểm mù (BSD), Trợ lý ảo ViVi",
        "description_text": "VinFast VF 6 là dòng B-SUV thuần điện sang trọng, hiện đại với phạm vi di chuyển vượt trội và khoang nội thất rộng rãi hàng đầu phân khúc.",
        "brakes": "Phanh đĩa tản nhiệt trước & sau / ABS / EBD / BA / ESC",
        "suspension": "Treo trước MacPherson / Treo sau Đa điểm độc lập (Bản Plus)",
    },
    "VF 7": {
        "adas_features": "Hỗ trợ lái trên đường cao tốc (Highway Assist), Giám sát hành trình thích ứng (ACC), Cảnh báo điểm mù & Mở cửa, Nhận diện biển báo, Camera 360 độ",
        "description_text": "VinFast VF 7 là mẫu C-SUV thuần điện thiết kế phi thuyền vũ trụ cá tính, động cơ cực mạnh 349 mã lực và công nghệ trợ lái thông minh hàng đầu.",
        "brakes": "Phanh đĩa tản nhiệt 4 bánh / ABS / EBD / BA / TCS / VSC",
        "suspension": "Treo trước MacPherson / Treo sau Đa liên kết độc lập",
    },
    "VF 8": {
        "adas_features": "Hỗ trợ lái đường cao tốc, Hỗ trợ di chuyển khi ùn tắc, Tự động đỗ xe & Remote Parking, Giám sát người lái, Cảnh báo điểm mù, Trợ lý ảo ViVi đa vùng",
        "description_text": "VinFast VF 8 là mẫu D-SUV thuần điện toàn cầu đạt tiêu chuẩn an toàn 5 sao ASEAN NCAP & EURO NCAP, không gian nội thất da cao cấp đẳng cấp doanh nhân.",
        "brakes": "Phanh đĩa tản nhiệt đường kính lớn 4 bánh / ABS / EBD / BA / ESC",
        "suspension": "Treo trước Tay đúp (Double Wishbone) / Treo sau Đa liên kết độc lập",
    },
    "VF 9": {
        "adas_features": "Trợ lái ADAS Level 2 cao cấp: Hỗ trợ lái cao tốc, Tự động chuyển làn, Tự động đỗ xe thông minh, Giám sát tài xế, Camera 360 toàn cảnh, ViVi đa vùng",
        "description_text": "VinFast VF 9 là dòng E-SUV thuần điện 6-7 chỗ thương gia đỉnh cao của VinFast, trang bị ghế cơ trưởng massage, trần kính toàn cảnh Panorama.",
        "brakes": "Phanh đĩa tản nhiệt hiệu năng cao 4 bánh / ABS / EBD / BA / ESC",
        "suspension": "Treo khí nén thích ứng thông minh / Treo sau Đa liên kết độc lập",
    },
    "VF e34": {
        "adas_features": "Cảnh báo lệch làn đường, Cảnh báo phương tiện cắt ngang khi lùi, Cảnh báo điểm mù, Cảnh báo luồng giao thông khi mở cửa, Trợ lý ảo ViVi",
        "description_text": "VinFast VF e34 là mẫu C-SUV thuần điện đầu tiên của Việt Nam, tiên phong cho kỷ nguyên ô tô điện thông minh và thân thiện với môi trường.",
        "brakes": "Phanh đĩa trước & sau / ABS / EBD / BA / ESC",
        "suspension": "Treo trước MacPherson / Treo sau Thanh xoắn",
    },
    "VF Wild": {
        "adas_features": "Hệ thống trợ lái ADAS Level 2 bán tự động, Cảnh báo điểm mù, Camera 360 độ quanh xe, Giám sát hành trình thông minh",
        "description_text": "VinFast VF Wild là mẫu xe bán tải điện concept đột phá, sở hữu thiết kế hầm hố, khoang lật linh hoạt và công nghệ địa hình tiên tiến.",
        "brakes": "Phanh đĩa hiệu năng cao 4 bánh / ABS / EBD / BA",
        "suspension": "Treo trước Độc lập tay đúp / Treo sau Phụ thuộc nhíp lá heavy-duty",
    },
    "VF Bus": {
        "adas_features": "Cảnh báo điểm mù xe buýt, Cảnh báo chệch làn đường, Camera giám sát tài xế & khoang hành khách, Phanh khí nén EBS/ABS",
        "description_text": "VinFast VinBus là dòng xe buýt điện thông minh quy mô lớn, vận hành êm ái, không phát thải, đóng góp xanh cho giao thông công cộng đô thị.",
        "brakes": "Hệ thống phanh khí nén toàn phần / ABS / EBS / Phanh tái tạo năng lượng",
        "suspension": "Treo khí nén ECAS tự động nâng hạ gầm",
    }
}

MOTORBIKE_ADAS_MAP = {
    "Evo": "Chế độ lái Eco/Sport, Kết nối App VinFast Scooter, Khóa từ thông minh, Định vị GPS",
    "Feliz": "Chế độ lái Eco/Sport, Phanh đĩa an toàn, Kết nối App di động, Chuẩn kháng nước IP67",
    "Klara": "Chế độ lái Eco/Sport, Phanh đĩa ABS trước sau, Tìm xe từ xa qua App, eSIM thông minh",
    "Vento": "Phanh ABS chống bó cứng, Chìa khóa thông minh PAAK, Công nguyên khối Động cơ Side Motor, eSIM",
    "Theon": "Phanh ABS 2 kênhContinental, Khóa PAAK thông minh, Động cơ Trung tâm Center Motor 7100W, GPS",
}

async def seed_data():
    async with SessionLocal() as db:
        res_cars = await db.execute(select(CarCatalog))
        cars = res_cars.scalars().all()

        for c in cars:
            specs = c.additional_specs or {}
            model_name = c.model_name or ""
            
            # Match car model
            matched_key = None
            for key in CAR_ADAS_MAP:
                if key.lower() in model_name.lower():
                    matched_key = key
                    break

            if matched_key:
                info = CAR_ADAS_MAP[matched_key]
                has_adas_bool = True if "VF 3" not in matched_key else False
                adas_lvl = "Level 2" if has_adas_bool else "Tiêu chuẩn"
                airbag_cnt = 11 if "VF 8" in matched_key or "VF 9" in matched_key or "VF 7" in matched_key else (7 if "VF 6" in matched_key or "VF 5" in matched_key else 2)

                specs["has_adas"] = has_adas_bool
                specs["adas_level"] = adas_lvl
                specs["airbags"] = airbag_cnt
                specs["adas_features"] = info["adas_features"]
                specs["description_text"] = info["description_text"]
                specs["brakes"] = info["brakes"]
                specs["suspension"] = info["suspension"]

                # Structured JSON sub-objects inside additional_specs for ADAS & Safety
                specs["safety_tech"] = {
                    "has_adas": has_adas_bool,
                    "adas_level": adas_lvl,
                    "airbags": airbag_cnt,
                    "brakes": info["brakes"],
                    "suspension": info["suspension"],
                    "adas_features": info["adas_features"]
                }

                specs["safety_adas"] = {
                    "has_adas": has_adas_bool,
                    "adas_level": adas_lvl,
                    "airbags": airbag_cnt,
                    "features": info["adas_features"]
                }

                # Ensure legacy sources also don't contain objects in adas_features
                if "_legacy_source" in specs and "specifications" in specs["_legacy_source"]:
                    leg_add = specs["_legacy_source"]["specifications"].get("additional_specs", {})
                    if isinstance(leg_add, dict):
                        leg_add["features"] = info["adas_features"]
                        leg_add["description_text"] = info["description_text"]

            c.additional_specs = dict(specs)

        res_bikes = await db.execute(select(MotorbikeCatalog))
        bikes = res_bikes.scalars().all()

        for b in bikes:
            specs = b.additional_specs or {}
            name = b.model_name or ""

            matched_features = "Chế độ lái Eco/Sport, Kết nối App VinFast, Khóa Smartkey, Chuẩn kháng nước IP67"
            for key, feat in MOTORBIKE_ADAS_MAP.items():
                if key.lower() in name.lower():
                    matched_features = feat
                    break

            specs["adas_features"] = matched_features
            specs["description_text"] = f"Mẫu xe máy điện VinFast {name} thời trang, công nghệ thông minh, tiết kiệm chi phí vận hành."
            b.additional_specs = dict(specs)

        await db.commit()
        print("Successfully seeded ADAS features and description_text for ALL Cars and Motorbikes!")

if __name__ == "__main__":
    asyncio.run(seed_data())
