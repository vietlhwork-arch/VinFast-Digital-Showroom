import type { Vehicle } from '@/types';
import { getCloudAssetUrl } from '@/lib/cloudAssets';

export const vehicles: Vehicle[] = [
  {
    "id": "18a780b9-b8ed-4b29-ac68-8006e0b3c86f",
    "code": "EBus",
    "name": "VinFast EBus",
    "tagline": "Xe buýt điện EB 6 phục vụ vận tải hành khách đô thị, đưa đón học sinh, nhân viên và các tuyến xe hợp đồng.",
    "category": "commercial",
    "image": "/static/uploads/cars/EBus.jpg",
    "basePrice": 0,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 340,
    "battery": "179.5 kWh",
    "acceleration": "187 HP / 420 Nm",
    "topSpeed": 150,
    "seats": 30,
    "isNew": true,
    "colors": [
      "Xanh",
      "Vàng",
      "Trắng",
      "Đỏ"
    ],
    "description": "Xe buýt điện EB 6 phục vụ vận tải hành khách đô thị, đưa đón học sinh, nhân viên và các tuyến xe hợp đồng.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "18a780b9-b8ed-4b29-ac68-8006e0b3c86f",
      "id": "18a780b9-b8ed-4b29-ac68-8006e0b3c86f",
      "model_name": "VinFast EBus",
      "vehicle_line": "EBus",
      "name": "VinFast EBus",
      "code": "EBus",
      "version": "EBus đô thị EB 6",
      "category": "Bus",
      "list_price": 0,
      "base_price": 0,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/EBus.jpg",
      "seat_count": 30,
      "length_mm": 6200,
      "width_mm": 2200,
      "height_mm": 2900,
      "wheelbase_mm": 0,
      "range_km": 340,
      "maximum_power_kw": 140,
      "maximum_torque_nm": 420,
      "usable_battery_capacity": 179.5,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "18a780b9-b8ed-4b29-ac68-8006e0b3c86f",
            "model_name": "VinFast EBus"
          },
          "specifications": {
            "car_id": "18a780b9-b8ed-4b29-ac68-8006e0b3c86f",
            "version": "EBus đô thị EB 6",
            "range_km": 340,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 0,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 30,
            "motor_power_kw": 140,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 179.5,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Xanh"
                },
                {
                  "name": "Vàng"
                },
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đỏ"
                }
              ],
              "images": [],
              "width_mm": 2200,
              "height_mm": 2900,
              "length_mm": 6200,
              "wheelbase_mm": 0,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Single-speed",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Single-speed",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 187,
              "motor_torque_nm": 420,
              "price_info_text": "Giá xe chưa nhập vì chưa có bảng giá EBus hiện hành được VinFast công bố công khai.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Xe buýt điện EB 6 phục vụ vận tải hành khách đô thị, đưa đón học sinh, nhân viên và các tuyến xe hợp đồng.",
              "safety_features": {
                "airbags": 6
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "340.0 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 140.0 kW, mô-men xoắn 420.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Kích thước 6.200 x 2.200 x 2.900 mm; khoảng sáng gầm 180 mm; pin LFP; công suất sạc nhanh DC tối đa 120 kW; sạc từ 20% đến 80% trong 70 phút. Sức chứa tối đa 30 người, gồm hành khách ngồi, đứng và vị trí xe lăn.",
              "_conversion_note": "Converted from service vehicle to sale car",
              "airbags": 6
            },
            "airbags": 6
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "18a780b9-b8ed-4b29-ac68-8006e0b3c86f",
            "model_name": "VinFast EBus"
          },
          "specifications": {
            "car_id": "18a780b9-b8ed-4b29-ac68-8006e0b3c86f",
            "version": "EBus đô thị EB 6",
            "range_km": 340,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 0,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 30,
            "motor_power_kw": 140,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 179.5,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Xanh"
                },
                {
                  "name": "Vàng"
                },
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đỏ"
                }
              ],
              "images": [],
              "width_mm": 2200,
              "height_mm": 2900,
              "length_mm": 6200,
              "wheelbase_mm": 0,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Single-speed",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Single-speed",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 187,
              "motor_torque_nm": 420,
              "price_info_text": "Giá xe chưa nhập vì chưa có bảng giá EBus hiện hành được VinFast công bố công khai.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Xe buýt điện EB 6 phục vụ vận tải hành khách đô thị, đưa đón học sinh, nhân viên và các tuyến xe hợp đồng.",
              "safety_features": {
                "airbags": 6
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "340.0 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 140.0 kW, mô-men xoắn 420.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Kích thước 6.200 x 2.200 x 2.900 mm; khoảng sáng gầm 180 mm; pin LFP; công suất sạc nhanh DC tối đa 120 kW; sạc từ 20% đến 80% trong 70 phút. Sức chứa tối đa 30 người, gồm hành khách ngồi, đứng và vị trí xe lăn.",
              "_conversion_note": "Converted from service vehicle to sale car",
              "airbags": 6
            },
            "airbags": 6
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:44:26.436731Z"
    }
  },
  {
    "id": "9c5c27b7-0f05-49eb-b90b-49c10c0577fe",
    "code": "VF 2",
    "name": "VinFast VF 2 Tiêu chuẩn",
    "tagline": "VinFast VF 2 là mẫu ô tô điện mini 2 cửa, 4 chỗ, hướng đến nhu cầu di chuyển cá nhân trong đô thị và giá rẻ",
    "category": "suv",
    "image": "/static/uploads/cars/VF2_c96b52.jpg",
    "basePrice": 188000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 210,
    "battery": "18.3 kWh",
    "acceleration": "5.3s (0-50 km/h)",
    "topSpeed": 150,
    "seats": 4,
    "isNew": true,
    "colors": [
      { "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-infinity-blanc.webp" },
      { "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-solar-ruby.webp" },
      { "name": "Bạc", "official_name": "Desat Silver", "color_code": "desat-silver", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-desat-silver.webp" },
      { "name": "Xanh lá nhạt", "official_name": "Urban Mint", "color_code": "urban-mint", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-urban-mint.webp" },
      { "name": "Vàng", "official_name": "Yellow", "color_code": "yellow", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-yellow.webp" },
      { "name": "Xanh dương", "official_name": "Sky Blue", "color_code": "sky-blue", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-sky-blue.webp" },
      { "name": "Hồng", "official_name": "Rose Pink", "color_code": "rose-pink", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-rose-pink.webp" },
      { "name": "Be", "official_name": "Be Pebble", "color_code": "be-pebble", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-pebble-beige.webp" }
    ],
    "description": "VinFast VF 2 là mẫu ô tô điện mini 2 cửa, 4 chỗ, hướng đến nhu cầu di chuyển cá nhân trong đô thị và giá rẻ",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "9c5c27b7-0f05-49eb-b90b-49c10c0577fe",
      "id": "9c5c27b7-0f05-49eb-b90b-49c10c0577fe",
      "model_name": "VinFast VF 2 Tiêu chuẩn",
      "vehicle_line": "VF 2",
      "name": "VinFast VF 2 Tiêu chuẩn",
      "code": "VF 2",
      "version": "Tiêu chuẩn",
      "category": "Personal",
      "list_price": 188000000,
      "base_price": 188000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF2_c96b52.jpg",
      "seat_count": 4,
      "length_mm": 3090,
      "width_mm": 1496,
      "height_mm": 1663,
      "wheelbase_mm": 2065,
      "range_km": 210,
      "maximum_power_kw": 30,
      "maximum_torque_nm": 65,
      "usable_battery_capacity": 18.3,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "9c5c27b7-0f05-49eb-b90b-49c10c0577fe",
            "model_name": "VinFast VF 2"
          },
          "specifications": {
            "car_id": "9c5c27b7-0f05-49eb-b90b-49c10c0577fe",
            "version": "Tiêu chuẩn",
            "range_km": 210,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 188000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 4,
            "motor_power_kw": 30,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 18.3,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "images": [],
              "length_mm": 3090,
              "width_mm": 1496,
              "height_mm": 1663,
              "wheelbase_mm": 2065,
              "motor_torque_nm": 65,
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "transmission": "Hộp số đơn cấp",
              "curb_weight_kg": 1340,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "acceleration_0_50_seconds": 5.3,
              "motor_power_hp": 40,
              "ground_clearance_mm": 175,
              "drivetrain": "Hộp số đơn cấp",
              "tires_wheels": "La-zăng hợp kim",
              "cargo_capacity_folded_liters": 900,
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "price_info_text": "Giá niêm yết kèm pin: 188.000.000 VNĐ. Giá ưu đãi tham khảo hiện tại: khoảng 178.600.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "range_condition_text": "Quãng đường lên tới 210 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất tối đa 30 kW, mô-men xoắn 65 Nm, dẫn động cầu sau, tốc độ tối đa 80 km/h và tăng tốc 0–50 km/h trong khoảng 5,3 giây.",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "description_text": "VinFast VF 2 là mẫu ô tô điện mini 2 cửa, 4 chỗ, hướng đến nhu cầu di chuyển cá nhân trong đô thị và giá rẻ",
              "colors": [
                { "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-infinity-blanc.webp" },
                { "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-solar-ruby.webp" },
                { "name": "Bạc", "official_name": "Desat Silver", "color_code": "desat-silver", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-desat-silver.webp" },
                { "name": "Xanh lá nhạt", "official_name": "Urban Mint", "color_code": "urban-mint", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-urban-mint.webp" },
                { "name": "Vàng", "official_name": "Yellow", "color_code": "yellow", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-yellow.webp" },
                { "name": "Xanh dương", "official_name": "Sky Blue", "color_code": "sky-blue", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-sky-blue.webp" },
                { "name": "Hồng", "official_name": "Rose Pink", "color_code": "rose-pink", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-rose-pink.webp" },
                { "name": "Be", "official_name": "Be Pebble", "color_code": "be-pebble", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-pebble-beige.webp" }
              ],
              "safety_features": {
                "airbags": 1,
                "ba": false,
                "abs": false,
                "ebd": false,
                "esc": false,
                "hsa": false,
                "tcs": false,
                "tpms": false,
                "isofix": false,
                "anti_theft_system": false
              },
              "driver_assistance_features": {
                "rear_camera": false,
                "cruise_control": false,
                "blind_spot_warning": false,
                "rear_parking_sensor": false,
                "rear_cross_traffic_alert": false,
                "safe_exit_warning": false,
                "vietnamese_voice_assistant": false
              },
              "exterior_features": {
                "headlights": "Đèn LED",
                "wheels": "Mâm kích thước 13 inch",
                "mirrors": "Gương chiếu hậu chỉnh cơ",
                "daytime_running_lights": "Đèn LED định vị ban ngày",
                "rear_spoiler": false
              },
              "interior_features": {
                "driver_seat": "Ghế lái chỉnh cơ 4 hướng",
                "air_conditioning": "Điều hòa cabin"
              }
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "9c5c27b7-0f05-49eb-b90b-49c10c0577fe",
            "model_name": "VinFast VF 2"
          },
          "specifications": {
            "car_id": "9c5c27b7-0f05-49eb-b90b-49c10c0577fe",
            "version": "Tiêu chuẩn",
            "range_km": 210,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 188000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 4,
            "motor_power_kw": 30,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 18.3,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "images": [],
              "length_mm": 3090,
              "width_mm": 1496,
              "height_mm": 1663,
              "wheelbase_mm": 2065,
              "motor_torque_nm": 65,
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "transmission": "Hộp số đơn cấp",
              "curb_weight_kg": 1340,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "acceleration_0_50_seconds": 5.3,
              "motor_power_hp": 40,
              "ground_clearance_mm": 175,
              "drivetrain": "Hộp số đơn cấp",
              "tires_wheels": "La-zăng hợp kim",
              "cargo_capacity_folded_liters": 900,
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "price_info_text": "Giá niêm yết kèm pin: 188.000.000 VNĐ. Giá ưu đãi tham khảo hiện tại: khoảng 178.600.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "range_condition_text": "Quãng đường lên tới 210 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất tối đa 30 kW, mô-men xoắn 65 Nm, dẫn động cầu sau, tốc độ tối đa 80 km/h và tăng tốc 0–50 km/h trong khoảng 5,3 giây.",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "description_text": "VinFast VF 2 là mẫu ô tô điện mini 2 cửa, 4 chỗ, hướng đến nhu cầu di chuyển cá nhân trong đô thị và giá rẻ",
              "colors": [
                { "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-infinity-blanc.webp" },
                { "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-solar-ruby.webp" },
                { "name": "Bạc", "official_name": "Desat Silver", "color_code": "desat-silver", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-desat-silver.webp" },
                { "name": "Xanh lá nhạt", "official_name": "Urban Mint", "color_code": "urban-mint", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-urban-mint.webp" },
                { "name": "Vàng", "official_name": "Yellow", "color_code": "yellow", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-yellow.webp" },
                { "name": "Xanh dương", "official_name": "Sky Blue", "color_code": "sky-blue", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-sky-blue.webp" },
                { "name": "Hồng", "official_name": "Rose Pink", "color_code": "rose-pink", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-rose-pink.webp" },
                { "name": "Be", "official_name": "Be Pebble", "color_code": "be-pebble", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf2/vf2-pebble-beige.webp" }
              ],
              "safety_features": {
                "airbags": 1,
                "ba": false,
                "abs": false,
                "ebd": false,
                "esc": false,
                "hsa": false,
                "tcs": false,
                "tpms": false,
                "isofix": false,
                "anti_theft_system": false
              },
              "driver_assistance_features": {
                "rear_camera": false,
                "cruise_control": false,
                "blind_spot_warning": false,
                "rear_parking_sensor": false,
                "rear_cross_traffic_alert": false,
                "safe_exit_warning": false,
                "vietnamese_voice_assistant": false
              },
              "exterior_features": {
                "headlights": "Đèn LED",
                "wheels": "Mâm kích thước 13 inch",
                "mirrors": "Gương chiếu hậu chỉnh cơ",
                "daytime_running_lights": "Đèn LED định vị ban ngày",
                "rear_spoiler": false
              },
              "interior_features": {
                "driver_seat": "Ghế lái chỉnh cơ 4 hướng",
                "air_conditioning": "Điều hòa cabin"
              }
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-12T09:41:16.906107Z"
    }
  },
  {
    "id": "e8437457-b673-40d9-ad5d-eef97a6c0371",
    "code": "EC Van",
    "name": "VinFast EC Van Tiêu chuẩn",
    "tagline": "Xe tải van điện thương mại 2 chỗ, tối ưu cho vận chuyển hàng hóa nội đô và kinh doanh hộ gia đình.",
    "category": "commercial",
    "image": "/static/uploads/cars/EC_Van.jpg",
    "basePrice": 268000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 175,
    "battery": "18.3 kWh",
    "acceleration": "40 HP / 110 Nm",
    "topSpeed": 150,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Xanh ngọc",
      "Vàng",
      "Trắng",
      "Đỏ"
    ],
    "description": "Xe tải van điện thương mại 2 chỗ, tối ưu cho vận chuyển hàng hóa nội đô và kinh doanh hộ gia đình.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "e8437457-b673-40d9-ad5d-eef97a6c0371",
      "id": "e8437457-b673-40d9-ad5d-eef97a6c0371",
      "model_name": "VinFast EC Van Tiêu chuẩn",
      "vehicle_line": "EC Van",
      "name": "VinFast EC Van Tiêu chuẩn",
      "code": "EC Van",
      "version": "Tiêu chuẩn",
      "category": "Commercial",
      "list_price": 268000000,
      "base_price": 268000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/EC_Van.jpg",
      "seat_count": 2,
      "length_mm": 3767,
      "width_mm": 1680,
      "height_mm": 1790,
      "wheelbase_mm": 2520,
      "range_km": 175,
      "maximum_power_kw": 30,
      "maximum_torque_nm": 110,
      "usable_battery_capacity": 18.3,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "e8437457-b673-40d9-ad5d-eef97a6c0371",
            "model_name": "VinFast EC Van"
          },
          "specifications": {
            "car_id": "e8437457-b673-40d9-ad5d-eef97a6c0371",
            "version": "Plus",
            "range_km": 175,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 268000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 2,
            "motor_power_kw": 30,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 18.3,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                "Xanh ngọc",
                "Vàng",
                "Trắng",
                "Đỏ"
              ],
              "images": [],
              "width_mm": 1680,
              "height_mm": 1790,
              "length_mm": 3767,
              "wheelbase_mm": 2520,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Dầm xoắn",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 40,
              "motor_torque_nm": 110,
              "price_info_text": "Giá niêm yết hiện tại đã bao gồm pin: 268.000.000 VNĐ. Giá ưu đãi tham khảo trên trang VinFast: 254.600.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Xe tải van điện thương mại 2 chỗ, tối ưu cho vận chuyển hàng hóa nội đô và kinh doanh hộ gia đình.",
              "safety_features": {
                "airbags": 2
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "175.0 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 30.0 kW, mô-men xoắn 110.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Chiều dài 3.767 mm; chiều rộng 1.680 mm; chiều cao 1.790 mm; chiều dài cơ sở 2.520 mm; khoảng sáng gầm 165 mm; bán kính quay vòng 5,1 m; công suất sạc nhanh DC tối đa 24,2 kW; thời gian sạc nhanh 10%-70% là 42 phút; quãng đường công bố theo NEDC.",
              "_conversion_note": "Converted from service vehicle to sale car"
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "e8437457-b673-40d9-ad5d-eef97a6c0371",
            "model_name": "VinFast EC Van"
          },
          "specifications": {
            "car_id": "e8437457-b673-40d9-ad5d-eef97a6c0371",
            "version": "Plus",
            "range_km": 175,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 268000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 2,
            "motor_power_kw": 30,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 18.3,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                "Xanh ngọc",
                "Vàng",
                "Trắng",
                "Đỏ"
              ],
              "images": [],
              "width_mm": 1680,
              "height_mm": 1790,
              "length_mm": 3767,
              "wheelbase_mm": 2520,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Dầm xoắn",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 40,
              "motor_torque_nm": 110,
              "price_info_text": "Giá niêm yết hiện tại đã bao gồm pin: 268.000.000 VNĐ. Giá ưu đãi tham khảo trên trang VinFast: 254.600.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Xe tải van điện thương mại 2 chỗ, tối ưu cho vận chuyển hàng hóa nội đô và kinh doanh hộ gia đình.",
              "safety_features": {
                "airbags": 2
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "175.0 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 30.0 kW, mô-men xoắn 110.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Chiều dài 3.767 mm; chiều rộng 1.680 mm; chiều cao 1.790 mm; chiều dài cơ sở 2.520 mm; khoảng sáng gầm 165 mm; bán kính quay vòng 5,1 m; công suất sạc nhanh DC tối đa 24,2 kW; thời gian sạc nhanh 10%-70% là 42 phút; quãng đường công bố theo NEDC.",
              "_conversion_note": "Converted from service vehicle to sale car"
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "fa35147b-3892-4146-9832-1ea8ba0bd893",
    "code": "Minio Green",
    "name": "VinFast Minio Green",
    "tagline": "Xe điện mini 4 chỗ, 2 cửa, được VinFast thiết kế tối ưu cho kinh doanh dịch vụ vận tải và di chuyển đô thị. Xe có kích thước nhỏ gọn, phù hợp với đường phố và khu vực đông đúc.",
    "category": "commercial",
    "image": "/static/uploads/cars/Minio_green.jpg",
    "basePrice": 269000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 210,
    "battery": "18.3 kWh",
    "acceleration": "40 HP / 65 Nm",
    "topSpeed": 150,
    "seats": 4,
    "isNew": true,
    "colors": [
      "Xanh lá Tropical Jade",
      "Đen Jet Black",
      "Bạc Desat Silver",
      "Vàng Summer Yellow",
      "Hồng Rose Metallic"
    ],
    "description": "Xe điện mini 4 chỗ, 2 cửa, được VinFast thiết kế tối ưu cho kinh doanh dịch vụ vận tải và di chuyển đô thị. Xe có kích thước nhỏ gọn, phù hợp với đường phố và khu vực đông đúc.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "fa35147b-3892-4146-9832-1ea8ba0bd893",
      "id": "fa35147b-3892-4146-9832-1ea8ba0bd893",
      "model_name": "VinFast Minio Green",
      "vehicle_line": "Minio Green",
      "name": "VinFast Minio Green",
      "code": "Minio Green",
      "version": "Green Service",
      "category": "Service",
      "list_price": 269000000,
      "base_price": 269000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/Minio_green.jpg",
      "seat_count": 4,
      "length_mm": 3090,
      "width_mm": 1496,
      "height_mm": 0,
      "wheelbase_mm": 2065,
      "range_km": 210,
      "maximum_power_kw": 30,
      "maximum_torque_nm": 65,
      "usable_battery_capacity": 18.3,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "fa35147b-3892-4146-9832-1ea8ba0bd893",
            "model_name": "VinFast Minio Green"
          },
          "specifications": {
            "car_id": "fa35147b-3892-4146-9832-1ea8ba0bd893",
            "version": "Green Service",
            "range_km": 210,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 269000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 4,
            "motor_power_kw": 30,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 18.3,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Xanh lá Tropical Jade"
                },
                {
                  "name": "Đen Jet Black"
                },
                {
                  "name": "Bạc Desat Silver"
                },
                {
                  "name": "Vàng Summer Yellow"
                },
                {
                  "name": "Hồng Rose Metallic"
                }
              ],
              "images": [],
              "width_mm": 1496,
              "height_mm": 0,
              "length_mm": 3090,
              "wheelbase_mm": 2065,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km; bảo hành pin cao áp 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 40,
              "motor_torque_nm": 65,
              "price_info_text": "MSRP kèm pin 269.000.000 VNĐ. Trang sản phẩm VinFast hiện hiển thị mức giá ưu đãi tham khảo từ 178.600.000 VNĐ và giá tham khảo 188.000.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Xe điện mini 4 chỗ, 2 cửa, được VinFast thiết kế tối ưu cho kinh doanh dịch vụ vận tải và di chuyển đô thị. Xe có kích thước nhỏ gọn, phù hợp với đường phố và khu vực đông đúc.",
              "safety_features": {
                "airbags": 1
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "210.0 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 30.0 kW, mô-men xoắn 65.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Quãng đường 210 km theo tiêu chuẩn NEDC. Sạc nhanh từ 10% đến 70% khoảng 34 phút. VinFast công bố Minio Green là dòng xe Green được phép khai thác dịch vụ mà không mất quyền bảo hành.",
              "_conversion_note": "Converted from service vehicle to sale car",
              "airbags": 1
            },
            "airbags": 1
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "fa35147b-3892-4146-9832-1ea8ba0bd893",
            "model_name": "VinFast Minio Green"
          },
          "specifications": {
            "car_id": "fa35147b-3892-4146-9832-1ea8ba0bd893",
            "version": "Green Service",
            "range_km": 210,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 269000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 4,
            "motor_power_kw": 30,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 18.3,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Xanh lá Tropical Jade"
                },
                {
                  "name": "Đen Jet Black"
                },
                {
                  "name": "Bạc Desat Silver"
                },
                {
                  "name": "Vàng Summer Yellow"
                },
                {
                  "name": "Hồng Rose Metallic"
                }
              ],
              "images": [],
              "width_mm": 1496,
              "height_mm": 0,
              "length_mm": 3090,
              "wheelbase_mm": 2065,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km; bảo hành pin cao áp 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 40,
              "motor_torque_nm": 65,
              "price_info_text": "MSRP kèm pin 269.000.000 VNĐ. Trang sản phẩm VinFast hiện hiển thị mức giá ưu đãi tham khảo từ 178.600.000 VNĐ và giá tham khảo 188.000.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Xe điện mini 4 chỗ, 2 cửa, được VinFast thiết kế tối ưu cho kinh doanh dịch vụ vận tải và di chuyển đô thị. Xe có kích thước nhỏ gọn, phù hợp với đường phố và khu vực đông đúc.",
              "safety_features": {
                "airbags": 1
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "210.0 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 30.0 kW, mô-men xoắn 65.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Quãng đường 210 km theo tiêu chuẩn NEDC. Sạc nhanh từ 10% đến 70% khoảng 34 phút. VinFast công bố Minio Green là dòng xe Green được phép khai thác dịch vụ mà không mất quyền bảo hành.",
              "_conversion_note": "Converted from service vehicle to sale car",
              "airbags": 1
            },
            "airbags": 1
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:44:41.557622Z"
    }
  },
  {
    "id": "aab966fe-2f0c-437e-8b1a-fcd83c1a4bcf",
    "code": "VF 3",
    "name": "VinFast VF 3 Eco",
    "tagline": "VinFast VF 3 Eco là ô tô điện mini-SUV 2 cửa, 4 chỗ ngồi, sử dụng động cơ điện đặt tại cầu sau.",
    "category": "suv",
    "image": "/static/uploads/cars/VF3_Plus.jpg",
    "basePrice": 285000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 215,
    "battery": "18.64 kWh",
    "acceleration": "40 HP / 110 Nm",
    "topSpeed": 150,
    "seats": 4,
    "isNew": true,
    "colors": [
      { "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-infinity-blanc.webp" },
      { "name": "Xám", "official_name": "Zenith Grey", "color_code": "zenith-grey", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-zenith-grey.webp" },
      { "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-solar-ruby.webp" },
      { "name": "Vàng Trắng", "official_name": "Summer Yellow Infinity Blanc", "color_code": "summer-yellow-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-summer-yellow-infinity-blanc.webp" },
      { "name": "Xanh dương Trắng", "official_name": "Sky Blue Infinity Blanc", "color_code": "sky-blue-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-sky-blue-infinity-blanc.webp" },
      { "name": "Hồng Trắng", "official_name": "Rose Pink Infinity Blanc", "color_code": "rose-pink-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-rose-pink-infinity-blanc.webp" },
      { "name": "Xanh lá nhạt", "official_name": "Urban Mint", "color_code": "urban-mint", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-urban-mint.webp" }
    ],
    "description": "VinFast VF 3 Eco là ô tô điện mini-SUV 2 cửa, 4 chỗ ngồi, sử dụng động cơ điện đặt tại cầu sau.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "aab966fe-2f0c-437e-8b1a-fcd83c1a4bcf",
      "id": "aab966fe-2f0c-437e-8b1a-fcd83c1a4bcf",
      "model_name": "VinFast VF 3 Eco",
      "vehicle_line": "VF 3",
      "name": "VinFast VF 3 Eco",
      "code": "VF 3",
      "version": "Eco",
      "category": "Personal",
      "list_price": 285000000,
      "base_price": 285000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF3_Plus.jpg",
      "seat_count": 4,
      "length_mm": 3190,
      "width_mm": 1679,
      "height_mm": 1622,
      "wheelbase_mm": 2075,
      "range_km": 215,
      "maximum_power_kw": 30,
      "maximum_torque_nm": 110,
      "usable_battery_capacity": 18.64,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "aab966fe-2f0c-437e-8b1a-fcd83c1a4bcf",
            "model_name": "VinFast VF 3"
          },
          "specifications": {
            "car_id": "aab966fe-2f0c-437e-8b1a-fcd83c1a4bcf",
            "version": "Plus",
            "range_km": 215,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 285000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 4,
            "motor_power_kw": 30,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 18.64,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-infinity-blanc.webp"
                },
                {
                  "name": "Xám", "official_name": "Zenith Grey", "color_code": "zenith-grey", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-zenith-grey.webp"
                },
                {
                  "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-solar-ruby.webp"
                },
                {
                  "name": "Vàng Trắng", "official_name": "Summer Yellow Infinity Blanc", "color_code": "summer-yellow-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-summer-yellow-infinity-blanc.webp"
                },
                {
                  "name": "Xanh dương Trắng", "official_name": "Sky Blue Infinity Blanc", "color_code": "sky-blue-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-sky-blue-infinity-blanc.webp"
                },
                {
                  "name": "Hồng Trắng", "official_name": "Rose Pink Infinity Blanc", "color_code": "rose-pink-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-rose-pink-infinity-blanc.webp"
                },
                {
                  "name": "Xanh lá nhạt", "official_name": "Urban Mint", "color_code": "urban-mint", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-urban-mint.webp"
                }
              ],
              "images": [],
              "width_mm": 1679,
              "height_mm": 1622,
              "length_mm": 3190,
              "wheelbase_mm": 2075,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu sau RWD",
              "front_brake": "Phanh đĩa, caliper nổi",
              "rear_brake": "Phanh tang trống, phanh cơ",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Phụ thuộc, dạng trục cứng với thanh xoắn Panhard",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM, 01 mô-tơ đặt ở cầu sau",
              "battery_type": "Pin Lithium-ion",
              "tires_wheels": "La-zăng thép 16 inch, lốp 175/75R16",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Pin được bảo hành 8 năm không giới hạn số km.",
              "curb_weight_kg": 857,
              "motor_power_hp": 40,
              "motor_torque_nm": 110,
              "price_info_text": "Giá niêm yết hiện tại: 285.000.000 VNĐ. Giá ưu đãi tham khảo: 270.750.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong 36 phút. Sạc chậm AC tại nhà từ 10% đến 70% trong khoảng 5 giờ.",
              "description_text": "VinFast VF 3 Eco là ô tô điện mini-SUV 2 cửa, 4 chỗ ngồi, sử dụng động cơ điện đặt tại cầu sau.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "hsa": true,
                "tcs": true,
                "airbags": 1,
                "anti_theft_system": true,
                "automatic_door_lock_above_5_kmh": true
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "android_auto": true,
                "apple_carplay": true,
                "vinfast_remote_app": true,
                "rear_parking_sensor": true,
                "electronic_parking_brake": true
              },
              "exterior_features": {
                "mirrors": "Chỉnh cơ, ốp gương màu đen",
                "body_type": "Mini-SUV 2 cửa",
                "logo_trim": "Logo cánh chim phủ sơn bạc",
                "headlights": "Halogen",
                "taillights": "Halogen",
                "wheel_design": "La-zăng thép 16 inch",
                "body_cladding": "Vòm bánh xe và cản trước/sau ốp nhựa đen",
                "daytime_running_lights": "Halogen"
              },
              "interior_features": {
                "dashboard": "Tích hợp trên màn hình trung tâm",
                "rear_seat": "Gập gọn hoàn toàn",
                "gear_selector": "Cần số điện tử dạng gạt sau vô-lăng",
                "seat_material": "Nỉ tối màu",
                "steering_wheel": "Vô-lăng 2 chấu thể thao D-Cut",
                "seat_adjustment": "Ghế lái và ghế phụ chỉnh cơ 4 hướng",
                "air_conditioning": "Chỉnh cơ 1 vùng",
                "cargo_capacity_liters": 36,
                "central_screen_inches": 10,
                "cargo_capacity_folded_liters": 285
              },
              "ground_clearance_mm": 191,
              "cargo_capacity_folded_liters": 285,
              "standard_charger": "Sạc chậm AC tại nhà, công suất khoảng 3,3 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "215 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có tích hợp phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện nam châm vĩnh cửu PMSM, công suất 32 kW tương đương 43 mã lực, mô-men xoắn 110 Nm, tốc độ tối đa 100 km/h.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "aab966fe-2f0c-437e-8b1a-fcd83c1a4bcf",
            "model_name": "VinFast VF 3"
          },
          "specifications": {
            "car_id": "aab966fe-2f0c-437e-8b1a-fcd83c1a4bcf",
            "version": "Plus",
            "range_km": 215,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 285000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 4,
            "motor_power_kw": 30,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 18.64,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-infinity-blanc.webp"
                },
                {
                  "name": "Xám", "official_name": "Zenith Grey", "color_code": "zenith-grey", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-zenith-grey.webp"
                },
                {
                  "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-solar-ruby.webp"
                },
                {
                  "name": "Vàng Trắng", "official_name": "Summer Yellow Infinity Blanc", "color_code": "summer-yellow-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-summer-yellow-infinity-blanc.webp"
                },
                {
                  "name": "Xanh dương Trắng", "official_name": "Sky Blue Infinity Blanc", "color_code": "sky-blue-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-sky-blue-infinity-blanc.webp"
                },
                {
                  "name": "Hồng Trắng", "official_name": "Rose Pink Infinity Blanc", "color_code": "rose-pink-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-rose-pink-infinity-blanc.webp"
                },
                {
                  "name": "Xanh lá nhạt", "official_name": "Urban Mint", "color_code": "urban-mint", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-urban-mint.webp"
                }
              ],
              "images": [],
              "width_mm": 1679,
              "height_mm": 1622,
              "length_mm": 3190,
              "wheelbase_mm": 2075,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu sau RWD",
              "front_brake": "Phanh đĩa, caliper nổi",
              "rear_brake": "Phanh tang trống, phanh cơ",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Phụ thuộc, dạng trục cứng với thanh xoắn Panhard",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM, 01 mô-tơ đặt ở cầu sau",
              "battery_type": "Pin Lithium-ion",
              "tires_wheels": "La-zăng thép 16 inch, lốp 175/75R16",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Pin được bảo hành 8 năm không giới hạn số km.",
              "curb_weight_kg": 857,
              "motor_power_hp": 40,
              "motor_torque_nm": 110,
              "price_info_text": "Giá niêm yết hiện tại: 285.000.000 VNĐ. Giá ưu đãi tham khảo: 270.750.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong 36 phút. Sạc chậm AC tại nhà từ 10% đến 70% trong khoảng 5 giờ.",
              "description_text": "VinFast VF 3 Eco là ô tô điện mini-SUV 2 cửa, 4 chỗ ngồi, sử dụng động cơ điện đặt tại cầu sau.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "hsa": true,
                "tcs": true,
                "airbags": 1,
                "anti_theft_system": true,
                "automatic_door_lock_above_5_kmh": true
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "android_auto": true,
                "apple_carplay": true,
                "vinfast_remote_app": true,
                "rear_parking_sensor": true,
                "electronic_parking_brake": true
              },
              "exterior_features": {
                "mirrors": "Chỉnh cơ, ốp gương màu đen",
                "body_type": "Mini-SUV 2 cửa",
                "logo_trim": "Logo cánh chim phủ sơn bạc",
                "headlights": "Halogen",
                "taillights": "Halogen",
                "wheel_design": "La-zăng thép 16 inch",
                "body_cladding": "Vòm bánh xe và cản trước/sau ốp nhựa đen",
                "daytime_running_lights": "Halogen"
              },
              "interior_features": {
                "dashboard": "Tích hợp trên màn hình trung tâm",
                "rear_seat": "Gập gọn hoàn toàn",
                "gear_selector": "Cần số điện tử dạng gạt sau vô-lăng",
                "seat_material": "Nỉ tối màu",
                "steering_wheel": "Vô-lăng 2 chấu thể thao D-Cut",
                "seat_adjustment": "Ghế lái và ghế phụ chỉnh cơ 4 hướng",
                "air_conditioning": "Chỉnh cơ 1 vùng",
                "cargo_capacity_liters": 36,
                "central_screen_inches": 10,
                "cargo_capacity_folded_liters": 285
              },
              "ground_clearance_mm": 191,
              "cargo_capacity_folded_liters": 285,
              "standard_charger": "Sạc chậm AC tại nhà, công suất khoảng 3,3 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "215 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có tích hợp phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện nam châm vĩnh cửu PMSM, công suất 32 kW tương đương 43 mã lực, mô-men xoắn 110 Nm, tốc độ tối đa 100 km/h.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "e5562f0c-5dee-41b6-8f68-8919ab5159cd",
    "code": "VF 3",
    "name": "VinFast VF 3 Plus",
    "tagline": "VinFast VF 3 Plus là ô tô điện Mini-SUV 2 cửa, 4 chỗ ngồi.",
    "category": "suv",
    "image": "/static/uploads/cars/VF3_Plus.jpg",
    "basePrice": 296000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 215,
    "battery": "18.64 kWh",
    "acceleration": "40 HP / 110 Nm",
    "topSpeed": 150,
    "seats": 4,
    "isNew": true,
    "colors": [
      { "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-infinity-blanc.webp" },
      { "name": "Xám", "official_name": "Zenith Grey", "color_code": "zenith-grey", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-zenith-grey.webp" },
      { "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-solar-ruby.webp" },
      { "name": "Vàng Trắng", "official_name": "Summer Yellow Infinity Blanc", "color_code": "summer-yellow-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-summer-yellow-infinity-blanc.webp" },
      { "name": "Xanh dương Trắng", "official_name": "Sky Blue Infinity Blanc", "color_code": "sky-blue-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-sky-blue-infinity-blanc.webp" },
      { "name": "Hồng Trắng", "official_name": "Rose Pink Infinity Blanc", "color_code": "rose-pink-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-rose-pink-infinity-blanc.webp" },
      { "name": "Xanh lá nhạt", "official_name": "Urban Mint", "color_code": "urban-mint", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-urban-mint.webp" }
    ],
    "description": "VinFast VF 3 Plus là ô tô điện Mini-SUV 2 cửa, 4 chỗ ngồi.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "e5562f0c-5dee-41b6-8f68-8919ab5159cd",
      "id": "e5562f0c-5dee-41b6-8f68-8919ab5159cd",
      "model_name": "VinFast VF 3 Plus",
      "vehicle_line": "VF 3",
      "name": "VinFast VF 3 Plus",
      "code": "VF 3",
      "version": "Plus",
      "category": "Personal",
      "list_price": 296000000,
      "base_price": 296000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF3_Plus.jpg",
      "seat_count": 4,
      "length_mm": 3190,
      "width_mm": 1679,
      "height_mm": 1622,
      "wheelbase_mm": 2075,
      "range_km": 215,
      "maximum_power_kw": 30,
      "maximum_torque_nm": 110,
      "usable_battery_capacity": 18.64,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "e5562f0c-5dee-41b6-8f68-8919ab5159cd",
            "model_name": "VinFast VF 3"
          },
          "specifications": {
            "car_id": "e5562f0c-5dee-41b6-8f68-8919ab5159cd",
            "version": "Plus",
            "range_km": 215,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 296000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 4,
            "motor_power_kw": 30,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 18.64,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-infinity-blanc.webp"
                },
                {
                  "name": "Xám", "official_name": "Zenith Grey", "color_code": "zenith-grey", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-zenith-grey.webp"
                },
                {
                  "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-solar-ruby.webp"
                },
                {
                  "name": "Vàng Trắng", "official_name": "Summer Yellow Infinity Blanc", "color_code": "summer-yellow-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-summer-yellow-infinity-blanc.webp"
                },
                {
                  "name": "Xanh dương Trắng", "official_name": "Sky Blue Infinity Blanc", "color_code": "sky-blue-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-sky-blue-infinity-blanc.webp"
                },
                {
                  "name": "Hồng Trắng", "official_name": "Rose Pink Infinity Blanc", "color_code": "rose-pink-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-rose-pink-infinity-blanc.webp"
                },
                {
                  "name": "Xanh lá nhạt", "official_name": "Urban Mint", "color_code": "urban-mint", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-urban-mint.webp"
                }
              ],
              "images": [],
              "width_mm": 1679,
              "height_mm": 1622,
              "length_mm": 3190,
              "wheelbase_mm": 2075,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu sau RWD",
              "front_brake": "Phanh đĩa, caliper nổi",
              "rear_brake": "Phanh tang trống",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Phụ thuộc, dạng trục cứng với thanh xoắn Panhard",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM, một mô-tơ đặt ở cầu sau",
              "battery_type": "Pin Lithium-ion",
              "tires_wheels": "La-zăng thép 16 inch có ốp trang trí, lốp 175/75R16",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Bảo hành pin 8 năm không giới hạn số km.",
              "curb_weight_kg": 857,
              "motor_power_hp": 40,
              "motor_torque_nm": 110,
              "price_info_text": "Giá niêm yết hiện tại: 296.000.000 VNĐ. Giá ưu đãi tham khảo: 281.200.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong 36 phút. Sạc chậm AC tại nhà từ 10% đến 70% trong khoảng 5 giờ.",
              "description_text": "VinFast VF 3 Plus là ô tô điện Mini-SUV 2 cửa, 4 chỗ ngồi.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "hsa": true,
                "tcs": true,
                "airbags": 1,
                "anti_theft_system": true,
                "automatic_door_lock_above_5_kmh": true
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "android_auto": true,
                "apple_carplay": true,
                "vinfast_remote_app": true,
                "rear_parking_sensor": true,
                "electronic_parking_brake": true
              },
              "exterior_features": {
                "body_type": "Mini-SUV 2 cửa",
                "headlights": "Halogen",
                "taillights": "Halogen",
                "power_folding_mirrors": true,
                "black_plastic_cladding": true,
                "daytime_running_lights": "Halogen",
                "decorative_wheel_cover": true,
                "power_adjustable_mirrors": true
              },
              "interior_features": {
                "rear_seat": "Gập gọn hoàn toàn",
                "gear_selector": "Cần số điện tử dạng gạt sau vô-lăng",
                "seat_material": "Nỉ tối màu",
                "steering_wheel": "Vô-lăng 2 chấu D-Cut",
                "seat_adjustment": "Ghế lái và ghế phụ chỉnh cơ 4 hướng",
                "air_conditioning": "Chỉnh cơ 1 vùng",
                "central_screen_inches": 10
              },
              "ground_clearance_mm": 191,
              "cargo_capacity_folded_liters": 285,
              "standard_charger": "Sạc chậm AC tại nhà, thời gian sạc từ 10% đến 70% khoảng 5 giờ",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "215 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có tích hợp hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện nam châm vĩnh cửu PMSM, công suất 32 kW tương đương 43 mã lực, mô-men xoắn 110 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "e5562f0c-5dee-41b6-8f68-8919ab5159cd",
            "model_name": "VinFast VF 3"
          },
          "specifications": {
            "car_id": "e5562f0c-5dee-41b6-8f68-8919ab5159cd",
            "version": "Plus",
            "range_km": 215,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 296000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 4,
            "motor_power_kw": 30,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 18.64,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-infinity-blanc.webp"
                },
                {
                  "name": "Xám", "official_name": "Zenith Grey", "color_code": "zenith-grey", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-zenith-grey.webp"
                },
                {
                  "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf3/vf3-solar-ruby.webp"
                },
                {
                  "name": "Vàng Trắng", "official_name": "Summer Yellow Infinity Blanc", "color_code": "summer-yellow-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-summer-yellow-infinity-blanc.webp"
                },
                {
                  "name": "Xanh dương Trắng", "official_name": "Sky Blue Infinity Blanc", "color_code": "sky-blue-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-sky-blue-infinity-blanc.webp"
                },
                {
                  "name": "Hồng Trắng", "official_name": "Rose Pink Infinity Blanc", "color_code": "rose-pink-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-rose-pink-infinity-blanc.webp"
                },
                {
                  "name": "Xanh lá nhạt", "official_name": "Urban Mint", "color_code": "urban-mint", "type": "solid", "price_tier": "advanced", "price_delta": 8000000, "image_url": "/static/uploads/cars/colors/vf3/vf3-urban-mint.webp"
                }
              ],
              "images": [],
              "width_mm": 1679,
              "height_mm": 1622,
              "length_mm": 3190,
              "wheelbase_mm": 2075,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu sau RWD",
              "front_brake": "Phanh đĩa, caliper nổi",
              "rear_brake": "Phanh tang trống",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Phụ thuộc, dạng trục cứng với thanh xoắn Panhard",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM, một mô-tơ đặt ở cầu sau",
              "battery_type": "Pin Lithium-ion",
              "tires_wheels": "La-zăng thép 16 inch có ốp trang trí, lốp 175/75R16",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Bảo hành pin 8 năm không giới hạn số km.",
              "curb_weight_kg": 857,
              "motor_power_hp": 40,
              "motor_torque_nm": 110,
              "price_info_text": "Giá niêm yết hiện tại: 296.000.000 VNĐ. Giá ưu đãi tham khảo: 281.200.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong 36 phút. Sạc chậm AC tại nhà từ 10% đến 70% trong khoảng 5 giờ.",
              "description_text": "VinFast VF 3 Plus là ô tô điện Mini-SUV 2 cửa, 4 chỗ ngồi.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "hsa": true,
                "tcs": true,
                "airbags": 1,
                "anti_theft_system": true,
                "automatic_door_lock_above_5_kmh": true
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "android_auto": true,
                "apple_carplay": true,
                "vinfast_remote_app": true,
                "rear_parking_sensor": true,
                "electronic_parking_brake": true
              },
              "exterior_features": {
                "body_type": "Mini-SUV 2 cửa",
                "headlights": "Halogen",
                "taillights": "Halogen",
                "power_folding_mirrors": true,
                "black_plastic_cladding": true,
                "daytime_running_lights": "Halogen",
                "decorative_wheel_cover": true,
                "power_adjustable_mirrors": true
              },
              "interior_features": {
                "rear_seat": "Gập gọn hoàn toàn",
                "gear_selector": "Cần số điện tử dạng gạt sau vô-lăng",
                "seat_material": "Nỉ tối màu",
                "steering_wheel": "Vô-lăng 2 chấu D-Cut",
                "seat_adjustment": "Ghế lái và ghế phụ chỉnh cơ 4 hướng",
                "air_conditioning": "Chỉnh cơ 1 vùng",
                "central_screen_inches": 10
              },
              "ground_clearance_mm": 191,
              "cargo_capacity_folded_liters": 285,
              "standard_charger": "Sạc chậm AC tại nhà, thời gian sạc từ 10% đến 70% khoảng 5 giờ",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "215 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có tích hợp hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện nam châm vĩnh cửu PMSM, công suất 32 kW tương đương 43 mã lực, mô-men xoắn 110 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "0345ead4-fd69-40a1-861c-68e2dac7d04a",
    "code": "VF 5",
    "name": "VinFast VF 5",
    "tagline": "VinFast VF 5 là mẫu SUV điện đô thị cỡ A, 5 chỗ ngồi.",
    "category": "suv",
    "image": "/static/uploads/cars/VF5.jpg",
    "basePrice": 496000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 326.4,
    "battery": "37.23 kWh",
    "acceleration": "134 HP / 135 Nm",
    "topSpeed": 150,
    "seats": 5,
    "isNew": true,
    "colors": [
      "Trắng",
      "Đen",
      "Xám",
      "Đỏ",
      "Vàng",
      "Xanh Dương",
      "Xanh Mint"
    ],
    "description": "VinFast VF 5 là mẫu SUV điện đô thị cỡ A, 5 chỗ ngồi.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "0345ead4-fd69-40a1-861c-68e2dac7d04a",
      "id": "0345ead4-fd69-40a1-861c-68e2dac7d04a",
      "model_name": "VinFast VF 5",
      "vehicle_line": "VF 5",
      "name": "VinFast VF 5",
      "code": "VF 5",
      "version": "Tiêu chuẩn",
      "category": "Personal",
      "list_price": 496000000,
      "base_price": 496000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF5.jpg",
      "seat_count": 5,
      "length_mm": 3967,
      "width_mm": 1723,
      "height_mm": 1579,
      "wheelbase_mm": 2514,
      "range_km": 326.4,
      "maximum_power_kw": 100,
      "maximum_torque_nm": 135,
      "usable_battery_capacity": 37.23,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "0345ead4-fd69-40a1-861c-68e2dac7d04a",
            "model_name": "VinFast VF 5"
          },
          "specifications": {
            "car_id": "0345ead4-fd69-40a1-861c-68e2dac7d04a",
            "version": "Tiêu chuẩn",
            "range_km": 326.4,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 496000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 100,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 37.23,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Xám"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Vàng"
                },
                {
                  "name": "Xanh Dương"
                },
                {
                  "name": "Xanh Mint"
                }
              ],
              "images": [],
              "width_mm": 1723,
              "height_mm": 1579,
              "length_mm": 3967,
              "wheelbase_mm": 2514,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Dầm xoắn",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 17 inch, lốp 205/55R17",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Bảo hành pin 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 134,
              "motor_torque_nm": 135,
              "price_info_text": "Giá niêm yết hiện tại: 496.000.000 VNĐ. Giá ưu đãi tham khảo: 471.200.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút. Sạc chậm AC công suất tối đa 6,6 kW.",
              "description_text": "VinFast VF 5 là mẫu SUV điện đô thị cỡ A, 5 chỗ ngồi.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 6,
                "anti_theft_system": true
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "cruise_control": true,
                "safe_exit_warning": true,
                "blind_spot_warning": true,
                "rear_parking_sensor": true,
                "rear_cross_traffic_alert": true,
                "vietnamese_voice_assistant": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 17 inch",
                "mirrors": "Chỉnh điện, tích hợp báo rẽ",
                "body_type": "A-SUV",
                "headlights": "Halogen tự động bật/tắt",
                "rear_spoiler": true,
                "daytime_running_lights": "Halogen"
              },
              "interior_features": {
                "driver_seat": "Chỉnh cơ 6 hướng",
                "seat_material": "Giả da",
                "audio_speakers": 4,
                "steering_wheel": "D-cut, chỉnh cơ 2 hướng",
                "air_conditioning": "Chỉnh cơ 1 vùng, lọc PM2.5",
                "front_passenger_seat": "Chỉnh cơ 4 hướng",
                "central_screen_inches": 8,
                "instrument_cluster_inches": 7
              },
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6,6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "326,4 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 100 kW, tương đương 134 mã lực, mô-men xoắn 135 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "0345ead4-fd69-40a1-861c-68e2dac7d04a",
            "model_name": "VinFast VF 5"
          },
          "specifications": {
            "car_id": "0345ead4-fd69-40a1-861c-68e2dac7d04a",
            "version": "Tiêu chuẩn",
            "range_km": 326.4,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 496000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 100,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 37.23,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Xám"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Vàng"
                },
                {
                  "name": "Xanh Dương"
                },
                {
                  "name": "Xanh Mint"
                }
              ],
              "images": [],
              "width_mm": 1723,
              "height_mm": 1579,
              "length_mm": 3967,
              "wheelbase_mm": 2514,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Dầm xoắn",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 17 inch, lốp 205/55R17",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Bảo hành pin 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 134,
              "motor_torque_nm": 135,
              "price_info_text": "Giá niêm yết hiện tại: 496.000.000 VNĐ. Giá ưu đãi tham khảo: 471.200.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút. Sạc chậm AC công suất tối đa 6,6 kW.",
              "description_text": "VinFast VF 5 là mẫu SUV điện đô thị cỡ A, 5 chỗ ngồi.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 6,
                "anti_theft_system": true
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "cruise_control": true,
                "safe_exit_warning": true,
                "blind_spot_warning": true,
                "rear_parking_sensor": true,
                "rear_cross_traffic_alert": true,
                "vietnamese_voice_assistant": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 17 inch",
                "mirrors": "Chỉnh điện, tích hợp báo rẽ",
                "body_type": "A-SUV",
                "headlights": "Halogen tự động bật/tắt",
                "rear_spoiler": true,
                "daytime_running_lights": "Halogen"
              },
              "interior_features": {
                "driver_seat": "Chỉnh cơ 6 hướng",
                "seat_material": "Giả da",
                "audio_speakers": 4,
                "steering_wheel": "D-cut, chỉnh cơ 2 hướng",
                "air_conditioning": "Chỉnh cơ 1 vùng, lọc PM2.5",
                "front_passenger_seat": "Chỉnh cơ 4 hướng",
                "central_screen_inches": 8,
                "instrument_cluster_inches": 7
              },
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6,6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "326,4 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 100 kW, tương đương 134 mã lực, mô-men xoắn 135 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "eeaec0b5-e2eb-46cd-acdc-2fa734c799f4",
    "code": "Herio Green",
    "name": "VinFast Herio Green",
    "tagline": "Mẫu SUV điện 5 chỗ thuộc dòng xe Green, được VinFast thiết kế và tối ưu cho hoạt động kinh doanh dịch vụ vận tải.",
    "category": "commercial",
    "image": "/static/uploads/cars/Herio_green.jpg",
    "basePrice": 499000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 326,
    "battery": "37.23 kWh",
    "acceleration": "134 HP / 135 Nm",
    "topSpeed": 150,
    "seats": 5,
    "isNew": true,
    "colors": [
      "Jet Black",
      "Black",
      "Silver",
      "Red"
    ],
    "description": "Mẫu SUV điện 5 chỗ thuộc dòng xe Green, được VinFast thiết kế và tối ưu cho hoạt động kinh doanh dịch vụ vận tải.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "eeaec0b5-e2eb-46cd-acdc-2fa734c799f4",
      "id": "eeaec0b5-e2eb-46cd-acdc-2fa734c799f4",
      "model_name": "VinFast Herio Green",
      "vehicle_line": "Herio Green",
      "name": "VinFast Herio Green",
      "code": "Herio Green",
      "version": "Service",
      "category": "Service",
      "list_price": 499000000,
      "base_price": 499000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/Herio_green.jpg",
      "seat_count": 5,
      "length_mm": 3967,
      "width_mm": 1723,
      "height_mm": 1579,
      "wheelbase_mm": 2514,
      "range_km": 326,
      "maximum_power_kw": 100,
      "maximum_torque_nm": 135,
      "usable_battery_capacity": 37.23,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "eeaec0b5-e2eb-46cd-acdc-2fa734c799f4",
            "model_name": "VinFast Herio Green"
          },
          "specifications": {
            "car_id": "eeaec0b5-e2eb-46cd-acdc-2fa734c799f4",
            "version": "Service",
            "range_km": 326,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 499000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 100,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 37.23,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Jet Black"
                },
                {
                  "name": "Black"
                },
                {
                  "name": "Silver"
                },
                {
                  "name": "Red"
                }
              ],
              "images": [],
              "width_mm": 1723,
              "height_mm": 1579,
              "length_mm": 3967,
              "wheelbase_mm": 2514,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km; bảo hành pin cao áp 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 134,
              "motor_torque_nm": 135,
              "price_info_text": "MSRP kèm pin hiện được VinFast công bố theo nhóm sản xuất khoảng 479.000.000 đến 499.000.000 VNĐ. Giá lưu trữ sử dụng mức 499.000.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Mẫu SUV điện 5 chỗ thuộc dòng xe Green, được VinFast thiết kế và tối ưu cho hoạt động kinh doanh dịch vụ vận tải.",
              "safety_features": {
                "airbags": 6
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "326.0 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 100.0 kW, mô-men xoắn 135.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Quãng đường 326 km theo tiêu chuẩn NEDC. Sạc nhanh 10%-70% khoảng 33 phút. Sạc AC tối đa 6,6 kW và sạc DC tối đa 50 kW. Cốp 331 lít, có thể mở rộng lên 1.015 lít khi gập hàng ghế sau. VinFast công bố camera lùi và hỗ trợ đỗ xe phía sau là phụ kiện chính hãng.",
              "_conversion_note": "Converted from service vehicle to sale car",
              "airbags": 6
            },
            "airbags": 6
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "eeaec0b5-e2eb-46cd-acdc-2fa734c799f4",
            "model_name": "VinFast Herio Green"
          },
          "specifications": {
            "car_id": "eeaec0b5-e2eb-46cd-acdc-2fa734c799f4",
            "version": "Service",
            "range_km": 326,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 499000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 100,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 37.23,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Jet Black"
                },
                {
                  "name": "Black"
                },
                {
                  "name": "Silver"
                },
                {
                  "name": "Red"
                }
              ],
              "images": [],
              "width_mm": 1723,
              "height_mm": 1579,
              "length_mm": 3967,
              "wheelbase_mm": 2514,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km; bảo hành pin cao áp 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 134,
              "motor_torque_nm": 135,
              "price_info_text": "MSRP kèm pin hiện được VinFast công bố theo nhóm sản xuất khoảng 479.000.000 đến 499.000.000 VNĐ. Giá lưu trữ sử dụng mức 499.000.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Mẫu SUV điện 5 chỗ thuộc dòng xe Green, được VinFast thiết kế và tối ưu cho hoạt động kinh doanh dịch vụ vận tải.",
              "safety_features": {
                "airbags": 6
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "326.0 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 100.0 kW, mô-men xoắn 135.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Quãng đường 326 km theo tiêu chuẩn NEDC. Sạc nhanh 10%-70% khoảng 33 phút. Sạc AC tối đa 6,6 kW và sạc DC tối đa 50 kW. Cốp 331 lít, có thể mở rộng lên 1.015 lít khi gập hàng ghế sau. VinFast công bố camera lùi và hỗ trợ đỗ xe phía sau là phụ kiện chính hãng.",
              "_conversion_note": "Converted from service vehicle to sale car",
              "airbags": 6
            },
            "airbags": 6
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:44:54.372031Z"
    }
  },
  {
    "id": "e6f4cbb6-87b9-4b9e-87df-bf84d8d2582f",
    "code": "VF 6",
    "name": "VinFast VF 6 Eco",
    "tagline": "VinFast VF 6 Eco là mẫu SUV điện đô thị cỡ B, 5 chỗ ngồi.",
    "category": "suv",
    "image": "/static/uploads/cars/VF6_Plus.jpg",
    "basePrice": 646000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 485,
    "battery": "59.6 kWh",
    "acceleration": "174 HP / 250 Nm",
    "topSpeed": 150,
    "seats": 5,
    "isNew": true,
    "colors": [
      "Trắng",
      "Đen",
      "Bạc",
      "Đỏ",
      "Xanh"
    ],
    "description": "VinFast VF 6 Eco là mẫu SUV điện đô thị cỡ B, 5 chỗ ngồi.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "e6f4cbb6-87b9-4b9e-87df-bf84d8d2582f",
      "id": "e6f4cbb6-87b9-4b9e-87df-bf84d8d2582f",
      "model_name": "VinFast VF 6 Eco",
      "vehicle_line": "VF 6",
      "name": "VinFast VF 6 Eco",
      "code": "VF 6",
      "version": "Eco",
      "category": "Personal",
      "list_price": 646000000,
      "base_price": 646000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF6_Plus.jpg",
      "seat_count": 5,
      "length_mm": 4241,
      "width_mm": 1834,
      "height_mm": 1580,
      "wheelbase_mm": 2730,
      "range_km": 485,
      "maximum_power_kw": 130,
      "maximum_torque_nm": 250,
      "usable_battery_capacity": 59.6,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "e6f4cbb6-87b9-4b9e-87df-bf84d8d2582f",
            "model_name": "VinFast VF 6"
          },
          "specifications": {
            "car_id": "e6f4cbb6-87b9-4b9e-87df-bf84d8d2582f",
            "version": "Eco",
            "range_km": 485,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 646000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 130,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 59.6,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Bạc"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh"
                }
              ],
              "images": [],
              "width_mm": 1834,
              "height_mm": 1580,
              "length_mm": 4241,
              "wheelbase_mm": 2730,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 18 inch, lốp 215/60R18",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Bảo hành pin 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1630,
              "motor_power_hp": 174,
              "motor_torque_nm": 250,
              "price_info_text": "Giá niêm yết hiện tại: 646.000.000 VNĐ. Giá ưu đãi tham khảo: 613.700.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "VinFast VF 6 Eco là mẫu SUV điện đô thị cỡ B, 5 chỗ ngồi.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "ess": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "airbags": 4,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "pet_mode": true,
                "camp_mode": true,
                "rear_camera": true,
                "blind_spot_warning": true,
                "rear_parking_sensor": true,
                "vietnamese_voice_assistant": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 18 inch",
                "mirrors": "Chỉnh điện, gập điện, tích hợp báo rẽ và sấy gương",
                "body_type": "B-SUV",
                "headlights": "LED",
                "taillights": "LED",
                "rear_spoiler": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "rear_seat": "Gập linh hoạt",
                "driver_seat": "Chỉnh cơ 6 hướng",
                "seat_material": "Nỉ kết hợp giả da",
                "audio_speakers": 6,
                "steering_wheel": "D-cut bọc da, chỉnh cơ 2 hướng",
                "air_conditioning": "Tự động 1 vùng, lọc không khí PM2.5",
                "front_passenger_seat": "Chỉnh cơ 4 hướng",
                "central_screen_inches": 12.9
              },
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 1576,
              "standard_charger": "Sạc chậm AC công suất tối đa 7,2 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "485 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Phanh tái sinh 3 cấp độ",
              "technical_specs_text": "Động cơ điện công suất 130 kW, mô-men xoắn 250 Nm, hệ dẫn động cầu trước FWD.",
              "acceleration_0_50_seconds": "chưa công bố",
              "airbags": 4
            },
            "airbags": 4
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "e6f4cbb6-87b9-4b9e-87df-bf84d8d2582f",
            "model_name": "VinFast VF 6"
          },
          "specifications": {
            "car_id": "e6f4cbb6-87b9-4b9e-87df-bf84d8d2582f",
            "version": "Eco",
            "range_km": 485,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 646000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 130,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 59.6,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Bạc"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh"
                }
              ],
              "images": [],
              "width_mm": 1834,
              "height_mm": 1580,
              "length_mm": 4241,
              "wheelbase_mm": 2730,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 18 inch, lốp 215/60R18",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Bảo hành pin 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1630,
              "motor_power_hp": 174,
              "motor_torque_nm": 250,
              "price_info_text": "Giá niêm yết hiện tại: 646.000.000 VNĐ. Giá ưu đãi tham khảo: 613.700.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "VinFast VF 6 Eco là mẫu SUV điện đô thị cỡ B, 5 chỗ ngồi.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "ess": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "airbags": 4,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "pet_mode": true,
                "camp_mode": true,
                "rear_camera": true,
                "blind_spot_warning": true,
                "rear_parking_sensor": true,
                "vietnamese_voice_assistant": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 18 inch",
                "mirrors": "Chỉnh điện, gập điện, tích hợp báo rẽ và sấy gương",
                "body_type": "B-SUV",
                "headlights": "LED",
                "taillights": "LED",
                "rear_spoiler": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "rear_seat": "Gập linh hoạt",
                "driver_seat": "Chỉnh cơ 6 hướng",
                "seat_material": "Nỉ kết hợp giả da",
                "audio_speakers": 6,
                "steering_wheel": "D-cut bọc da, chỉnh cơ 2 hướng",
                "air_conditioning": "Tự động 1 vùng, lọc không khí PM2.5",
                "front_passenger_seat": "Chỉnh cơ 4 hướng",
                "central_screen_inches": 12.9
              },
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 1576,
              "standard_charger": "Sạc chậm AC công suất tối đa 7,2 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "485 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Phanh tái sinh 3 cấp độ",
              "technical_specs_text": "Động cơ điện công suất 130 kW, mô-men xoắn 250 Nm, hệ dẫn động cầu trước FWD.",
              "acceleration_0_50_seconds": "chưa công bố",
              "airbags": 4
            },
            "airbags": 4
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T15:54:59.927282Z"
    }
  },
  {
    "id": "e270f57a-2660-431d-997f-6c831b0c4bd6",
    "code": "Nerio Green",
    "name": "VinFast Nerio Green",
    "tagline": "Mẫu B-SUV điện 5 chỗ thuộc dòng xe Green, được VinFast phát triển từ nền tảng VF e34 và tối ưu cho hoạt động vận tải hành khách.",
    "category": "commercial",
    "image": "/static/uploads/cars/Nerio_green.jpg",
    "basePrice": 668000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 318.6,
    "battery": "41.9 kWh",
    "acceleration": "147 HP / 242 Nm",
    "topSpeed": 150,
    "seats": 5,
    "isNew": true,
    "colors": [
      { "name": "Đỏ", "official_name": "Crimson Red", "color_code": "crimson-red", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-solar-ruby.webp" },
      { "name": "Bạc", "official_name": "Desat Silver", "color_code": "desat-silver", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-desat-silver.webp" },
      { "name": "Đen", "official_name": "Jet Black", "color_code": "jet-black", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8/vf8-jet-black.webp" },
      { "name": "Vàng", "official_name": "Summer Yellow", "color_code": "summer-yellow", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-yellow.webp" }
    ],
    "description": "Mẫu B-SUV điện 5 chỗ thuộc dòng xe Green, được VinFast phát triển từ nền tảng VF e34 và tối ưu cho hoạt động vận tải hành khách.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "e270f57a-2660-431d-997f-6c831b0c4bd6",
      "id": "e270f57a-2660-431d-997f-6c831b0c4bd6",
      "model_name": "VinFast Nerio Green",
      "vehicle_line": "Nerio Green",
      "name": "VinFast Nerio Green",
      "code": "Nerio Green",
      "version": "Service",
      "category": "Service",
      "list_price": 668000000,
      "base_price": 668000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/Nerio_green.jpg",
      "seat_count": 5,
      "length_mm": 4300,
      "width_mm": 1768,
      "height_mm": 1615,
      "wheelbase_mm": 2611,
      "range_km": 318.6,
      "maximum_power_kw": 110,
      "maximum_torque_nm": 242,
      "usable_battery_capacity": 41.9,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "e270f57a-2660-431d-997f-6c831b0c4bd6",
            "model_name": "VinFast Nerio Green"
          },
          "specifications": {
            "car_id": "e270f57a-2660-431d-997f-6c831b0c4bd6",
            "version": "Service",
            "range_km": 318.6,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 668000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 110,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 41.9,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                { "name": "Đỏ", "official_name": "Crimson Red", "color_code": "crimson-red", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-solar-ruby.webp" },
                { "name": "Bạc", "official_name": "Desat Silver", "color_code": "desat-silver", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-desat-silver.webp" },
                { "name": "Đen", "official_name": "Jet Black", "color_code": "jet-black", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8/vf8-jet-black.webp" },
                { "name": "Vàng", "official_name": "Summer Yellow", "color_code": "summer-yellow", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-yellow.webp" }
              ],
              "images": [],
              "width_mm": 1768,
              "height_mm": 1615,
              "length_mm": 4300,
              "wheelbase_mm": 2611,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km; bảo hành pin cao áp 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 147,
              "motor_torque_nm": 242,
              "price_info_text": "Trang sản phẩm VinFast hiện hiển thị giá từ 668.000.000 VNĐ. Chính sách MSRP trước đó ghi mức 628.000.000 VNĐ kèm pin.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Mẫu B-SUV điện 5 chỗ thuộc dòng xe Green, được VinFast phát triển từ nền tảng VF e34 và tối ưu cho hoạt động vận tải hành khách.",
              "safety_features": {
                "airbags": 6
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "318.6 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 110.0 kW, mô-men xoắn 242.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Quãng đường 318,6 km theo tiêu chuẩn NEDC. Sạc AC tối đa 6,6 kW, sạc DC tối đa 60 kW và sạc nhanh 10%-70% khoảng 25 phút. Cốp 469 lít, mở rộng lên 1.328 lít khi gập hàng ghế sau. Xe có 2 túi khí, ISOFIX và camera 360.",
              "_conversion_note": "Converted from service vehicle to sale car",
              "airbags": 6
            },
            "airbags": 6
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "e270f57a-2660-431d-997f-6c831b0c4bd6",
            "model_name": "VinFast Nerio Green"
          },
          "specifications": {
            "car_id": "e270f57a-2660-431d-997f-6c831b0c4bd6",
            "version": "Service",
            "range_km": 318.6,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 668000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 110,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 41.9,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                { "name": "Đỏ", "official_name": "Crimson Red", "color_code": "crimson-red", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-solar-ruby.webp" },
                { "name": "Bạc", "official_name": "Desat Silver", "color_code": "desat-silver", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-desat-silver.webp" },
                { "name": "Đen", "official_name": "Jet Black", "color_code": "jet-black", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8/vf8-jet-black.webp" },
                { "name": "Vàng", "official_name": "Summer Yellow", "color_code": "summer-yellow", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf2/vf2-yellow.webp" }
              ],
              "images": [],
              "width_mm": 1768,
              "height_mm": 1615,
              "length_mm": 4300,
              "wheelbase_mm": 2611,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km; bảo hành pin cao áp 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 147,
              "motor_torque_nm": 242,
              "price_info_text": "Trang sản phẩm VinFast hiện hiển thị giá từ 668.000.000 VNĐ. Chính sách MSRP trước đó ghi mức 628.000.000 VNĐ kèm pin.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Mẫu B-SUV điện 5 chỗ thuộc dòng xe Green, được VinFast phát triển từ nền tảng VF e34 và tối ưu cho hoạt động vận tải hành khách.",
              "safety_features": {
                "airbags": 6
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "318.6 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 110.0 kW, mô-men xoắn 242.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Quãng đường 318,6 km theo tiêu chuẩn NEDC. Sạc AC tối đa 6,6 kW, sạc DC tối đa 60 kW và sạc nhanh 10%-70% khoảng 25 phút. Cốp 469 lít, mở rộng lên 1.328 lít khi gập hàng ghế sau. Xe có 2 túi khí, ISOFIX và camera 360.",
              "_conversion_note": "Converted from service vehicle to sale car",
              "airbags": 6
            },
            "airbags": 6
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:45:06.734773Z"
    }
  },
  {
    "id": "f0a9d6f1-c03d-48b7-8afc-b1930b2e49ce",
    "code": "Limo Green",
    "name": "VinFast Limo Green",
    "tagline": "Mẫu MPV điện 7 chỗ thuộc dòng xe Green, được tối ưu cho vận tải hành khách, taxi, đưa đón sân bay và các chuyến đi đường dài.",
    "category": "commercial",
    "image": "/static/uploads/cars/Limo_green.jpg",
    "basePrice": 699000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 450,
    "battery": "60.13 kWh",
    "acceleration": "201 HP / 280 Nm",
    "topSpeed": 150,
    "seats": 7,
    "isNew": true,
    "colors": [
      "Jet Black",
      "Desat Silver",
      "Solar Ruby",
      "Infinity Blanc"
    ],
    "description": "Mẫu MPV điện 7 chỗ thuộc dòng xe Green, được tối ưu cho vận tải hành khách, taxi, đưa đón sân bay và các chuyến đi đường dài.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "f0a9d6f1-c03d-48b7-8afc-b1930b2e49ce",
      "id": "f0a9d6f1-c03d-48b7-8afc-b1930b2e49ce",
      "model_name": "VinFast Limo Green",
      "vehicle_line": "Limo Green",
      "name": "VinFast Limo Green",
      "code": "Limo Green",
      "version": "Service",
      "category": "Service",
      "list_price": 699000000,
      "base_price": 699000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/Limo_green.jpg",
      "seat_count": 7,
      "length_mm": 4740,
      "width_mm": 1872,
      "height_mm": 1729,
      "wheelbase_mm": 2840,
      "range_km": 450,
      "maximum_power_kw": 150,
      "maximum_torque_nm": 280,
      "usable_battery_capacity": 60.13,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "f0a9d6f1-c03d-48b7-8afc-b1930b2e49ce",
            "model_name": "VinFast Limo Green"
          },
          "specifications": {
            "car_id": "f0a9d6f1-c03d-48b7-8afc-b1930b2e49ce",
            "version": "Service",
            "range_km": 450,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 699000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 7,
            "motor_power_kw": 150,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 60.13,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Jet Black"
                },
                {
                  "name": "Desat Silver"
                },
                {
                  "name": "Solar Ruby"
                },
                {
                  "name": "Infinity Blanc"
                }
              ],
              "images": [],
              "width_mm": 1872,
              "height_mm": 1729,
              "length_mm": 4740,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km; bảo hành pin cao áp 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 201,
              "motor_torque_nm": 280,
              "price_info_text": "MSRP kèm pin theo chính sách VinFast là 699.000.000 VNĐ. Giá ưu đãi hiện thị từ khoảng 664.050.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Mẫu MPV điện 7 chỗ thuộc dòng xe Green, được tối ưu cho vận tải hành khách, taxi, đưa đón sân bay và các chuyến đi đường dài.",
              "safety_features": {
                "airbags": 7
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "450.0 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 150.0 kW, mô-men xoắn 280.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Quãng đường 450 km theo tiêu chuẩn NEDC. Sạc nhanh DC tối đa 80 kW, sạc 10%-70% khoảng 30 phút. Dung tích khoang hành lý 606 lít khi gập hàng ghế thứ ba và 1.240 lít khi gập hàng ghế thứ hai. Xe có 4 túi khí, ISOFIX và camera lùi.",
              "_conversion_note": "Converted from service vehicle to sale car",
              "airbags": 7
            },
            "airbags": 7
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "f0a9d6f1-c03d-48b7-8afc-b1930b2e49ce",
            "model_name": "VinFast Limo Green"
          },
          "specifications": {
            "car_id": "f0a9d6f1-c03d-48b7-8afc-b1930b2e49ce",
            "version": "Service",
            "range_km": 450,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 699000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 7,
            "motor_power_kw": 150,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 60.13,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Jet Black"
                },
                {
                  "name": "Desat Silver"
                },
                {
                  "name": "Solar Ruby"
                },
                {
                  "name": "Infinity Blanc"
                }
              ],
              "images": [],
              "width_mm": 1872,
              "height_mm": 1729,
              "length_mm": 4740,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, kiểu MacPherson",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km; bảo hành pin cao áp 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 201,
              "motor_torque_nm": 280,
              "price_info_text": "MSRP kèm pin theo chính sách VinFast là 699.000.000 VNĐ. Giá ưu đãi hiện thị từ khoảng 664.050.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "Mẫu MPV điện 7 chỗ thuộc dòng xe Green, được tối ưu cho vận tải hành khách, taxi, đưa đón sân bay và các chuyến đi đường dài.",
              "safety_features": {
                "airbags": 7
              },
              "driver_assistance_features": {},
              "exterior_features": {},
              "interior_features": {},
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất tối đa 6.6 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "450.0 km sau mỗi lần sạc đầy.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 150.0 kW, mô-men xoắn 280.0 Nm.",
              "acceleration_0_50_seconds": "chưa công bố",
              "notes": "Quãng đường 450 km theo tiêu chuẩn NEDC. Sạc nhanh DC tối đa 80 kW, sạc 10%-70% khoảng 30 phút. Dung tích khoang hành lý 606 lít khi gập hàng ghế thứ ba và 1.240 lít khi gập hàng ghế thứ hai. Xe có 4 túi khí, ISOFIX và camera lùi.",
              "_conversion_note": "Converted from service vehicle to sale car",
              "airbags": 7
            },
            "airbags": 7
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:45:16.123960Z"
    }
  },
  {
    "id": "2a60584b-f02a-4700-9ce7-122b6b0f7df2",
    "code": "VF 6",
    "name": "VinFast VF 6 Plus",
    "tagline": "VinFast VF 6 Plus là mẫu SUV điện cỡ B, 5 chỗ ngồi.",
    "category": "suv",
    "image": "/static/uploads/cars/VF6_Plus.jpg",
    "basePrice": 699000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 460,
    "battery": "59.6 kWh",
    "acceleration": "201 HP / 310 Nm",
    "topSpeed": 150,
    "seats": 5,
    "isNew": true,
    "colors": [
      "Trắng",
      "Đen",
      "Bạc",
      "Đỏ",
      "Xanh Dương"
    ],
    "description": "VinFast VF 6 Plus là mẫu SUV điện cỡ B, 5 chỗ ngồi.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "2a60584b-f02a-4700-9ce7-122b6b0f7df2",
      "id": "2a60584b-f02a-4700-9ce7-122b6b0f7df2",
      "model_name": "VinFast VF 6 Plus",
      "vehicle_line": "VF 6",
      "name": "VinFast VF 6 Plus",
      "code": "VF 6",
      "version": "Plus",
      "category": "Personal",
      "list_price": 699000000,
      "base_price": 699000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF6_Plus.jpg",
      "seat_count": 5,
      "length_mm": 4241,
      "width_mm": 1834,
      "height_mm": 1580,
      "wheelbase_mm": 2730,
      "range_km": 460,
      "maximum_power_kw": 150,
      "maximum_torque_nm": 310,
      "usable_battery_capacity": 59.6,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "2a60584b-f02a-4700-9ce7-122b6b0f7df2",
            "model_name": "VinFast VF 6"
          },
          "specifications": {
            "car_id": "2a60584b-f02a-4700-9ce7-122b6b0f7df2",
            "version": "Plus",
            "range_km": 460,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 699000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 150,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 59.6,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "code": "Brahminy White",
                  "name": "Trắng"
                },
                {
                  "code": "Jet Black",
                  "name": "Đen"
                },
                {
                  "code": "Desat Silver",
                  "name": "Bạc"
                },
                {
                  "code": "Crimson Red",
                  "name": "Đỏ"
                },
                {
                  "code": "VinFast Blue",
                  "name": "Xanh Dương"
                }
              ],
              "images": [],
              "width_mm": 1834,
              "height_mm": 1580,
              "length_mm": 4241,
              "wheelbase_mm": 2730,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, dạng đa liên kết",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 19 inch, lốp 235/45R19",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Bảo hành pin 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1700,
              "motor_power_hp": 201,
              "motor_torque_nm": 310,
              "price_info_text": "Giá niêm yết hiện tại: 699.000.000 VNĐ. Giá ưu đãi tham khảo: 664.050.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 25 phút. Sạc chậm AC công suất tối đa 7,2 kW.",
              "description_text": "VinFast VF 6 Plus là mẫu SUV điện cỡ B, 5 chỗ ngồi.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "ess": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 7,
                "anti_theft_system": true,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "pet_mode": true,
                "camp_mode": true,
                "android_auto": true,
                "apple_carplay": true,
                "highway_assist": true,
                "lane_keep_assist": true,
                "safe_exit_warning": true,
                "blind_spot_warning": true,
                "traffic_jam_assist": true,
                "emergency_lane_keep": true,
                "surround_view_camera": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 19 inch",
                "mirrors": "Chỉnh điện, gập điện, báo rẽ LED, sấy gương",
                "body_type": "B-SUV",
                "fog_lights": "LED",
                "headlights": "Full-LED Matrix",
                "taillights": "LED",
                "rear_spoiler": true,
                "panoramic_roof": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "driver_seat": "Chỉnh điện 8 hướng",
                "ambient_light": true,
                "seat_material": "Da tổng hợp cao cấp",
                "audio_speakers": 8,
                "rear_air_vents": true,
                "steering_wheel": "D-cut bọc da, có sưởi",
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng, lọc PM2.5",
                "front_passenger_seat": "Chỉnh điện 4 hướng",
                "cargo_capacity_liters": 423,
                "central_screen_inches": 12.9,
                "front_seat_heating_cooling": true,
                "cargo_capacity_folded_liters": 1576
              },
              "ground_clearance_mm": 170,
              "cargo_capacity_folded_liters": 1576,
              "standard_charger": "Sạc chậm AC công suất tối đa 7,2 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "460 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Phanh tái sinh có nhiều cấp độ điều chỉnh",
              "technical_specs_text": "Động cơ điện công suất 150 kW, tương đương 201 mã lực, mô-men xoắn 310 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "2a60584b-f02a-4700-9ce7-122b6b0f7df2",
            "model_name": "VinFast VF 6"
          },
          "specifications": {
            "car_id": "2a60584b-f02a-4700-9ce7-122b6b0f7df2",
            "version": "Plus",
            "range_km": 460,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 699000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 150,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 59.6,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "code": "Brahminy White",
                  "name": "Trắng"
                },
                {
                  "code": "Jet Black",
                  "name": "Đen"
                },
                {
                  "code": "Desat Silver",
                  "name": "Bạc"
                },
                {
                  "code": "Crimson Red",
                  "name": "Đỏ"
                },
                {
                  "code": "VinFast Blue",
                  "name": "Xanh Dương"
                }
              ],
              "images": [],
              "width_mm": 1834,
              "height_mm": 1580,
              "length_mm": 4241,
              "wheelbase_mm": 2730,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, dạng đa liên kết",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 19 inch, lốp 235/45R19",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Bảo hành pin 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1700,
              "motor_power_hp": 201,
              "motor_torque_nm": 310,
              "price_info_text": "Giá niêm yết hiện tại: 699.000.000 VNĐ. Giá ưu đãi tham khảo: 664.050.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 25 phút. Sạc chậm AC công suất tối đa 7,2 kW.",
              "description_text": "VinFast VF 6 Plus là mẫu SUV điện cỡ B, 5 chỗ ngồi.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "ess": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 7,
                "anti_theft_system": true,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "pet_mode": true,
                "camp_mode": true,
                "android_auto": true,
                "apple_carplay": true,
                "highway_assist": true,
                "lane_keep_assist": true,
                "safe_exit_warning": true,
                "blind_spot_warning": true,
                "traffic_jam_assist": true,
                "emergency_lane_keep": true,
                "surround_view_camera": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 19 inch",
                "mirrors": "Chỉnh điện, gập điện, báo rẽ LED, sấy gương",
                "body_type": "B-SUV",
                "fog_lights": "LED",
                "headlights": "Full-LED Matrix",
                "taillights": "LED",
                "rear_spoiler": true,
                "panoramic_roof": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "driver_seat": "Chỉnh điện 8 hướng",
                "ambient_light": true,
                "seat_material": "Da tổng hợp cao cấp",
                "audio_speakers": 8,
                "rear_air_vents": true,
                "steering_wheel": "D-cut bọc da, có sưởi",
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng, lọc PM2.5",
                "front_passenger_seat": "Chỉnh điện 4 hướng",
                "cargo_capacity_liters": 423,
                "central_screen_inches": 12.9,
                "front_seat_heating_cooling": true,
                "cargo_capacity_folded_liters": 1576
              },
              "ground_clearance_mm": 170,
              "cargo_capacity_folded_liters": 1576,
              "standard_charger": "Sạc chậm AC công suất tối đa 7,2 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "460 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Phanh tái sinh có nhiều cấp độ điều chỉnh",
              "technical_specs_text": "Động cơ điện công suất 150 kW, tương đương 201 mã lực, mô-men xoắn 310 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "9748ae62-9d19-4bad-9db0-fef755217b64",
    "code": "VF 7",
    "name": "VinFast VF 7 Eco",
    "tagline": "VinFast VF 7 Eco là mẫu SUV điện cỡ C, 5 chỗ ngồi.",
    "category": "suv",
    "image": "/static/uploads/cars/VF7_Plus_thuong.jpg",
    "basePrice": 740000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 440,
    "battery": "59.6 kWh",
    "acceleration": "174 HP / 250 Nm",
    "topSpeed": 150,
    "seats": 5,
    "isNew": true,
    "colors": [
      "Trắng",
      "Đen",
      "Bạc",
      "Đỏ",
      "Xanh Dương",
      "Xanh Lục"
    ],
    "description": "VinFast VF 7 Eco là mẫu SUV điện cỡ C, 5 chỗ ngồi.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "9748ae62-9d19-4bad-9db0-fef755217b64",
      "id": "9748ae62-9d19-4bad-9db0-fef755217b64",
      "model_name": "VinFast VF 7 Eco",
      "vehicle_line": "VF 7",
      "name": "VinFast VF 7 Eco",
      "code": "VF 7",
      "version": "Eco",
      "category": "Personal",
      "list_price": 740000000,
      "base_price": 740000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF7_Plus_thuong.jpg",
      "seat_count": 5,
      "length_mm": 4545,
      "width_mm": 1890,
      "height_mm": 1636,
      "wheelbase_mm": 2840,
      "range_km": 440,
      "maximum_power_kw": 130,
      "maximum_torque_nm": 250,
      "usable_battery_capacity": 59.6,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "9748ae62-9d19-4bad-9db0-fef755217b64",
            "model_name": "VinFast VF 7"
          },
          "specifications": {
            "car_id": "9748ae62-9d19-4bad-9db0-fef755217b64",
            "version": "Eco",
            "range_km": 440,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 740000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 130,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 59.6,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Bạc"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh Dương"
                },
                {
                  "name": "Xanh Lục"
                }
              ],
              "images": [],
              "width_mm": 1890,
              "height_mm": 1636,
              "length_mm": 4545,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, dạng đa liên kết",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 19 inch, lốp 235/50R19",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 174,
              "motor_torque_nm": 250,
              "price_info_text": "Giá niêm yết: 740.000.000 VNĐ. Giá ưu đãi tham khảo: 703.000.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 24 phút. Sạc chậm AC công suất 7,2 kW.",
              "description_text": "VinFast VF 7 Eco là mẫu SUV điện cỡ C, 5 chỗ ngồi.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "airbags": 4,
                "anti_theft_system": true,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "cruise_control": true,
                "blind_spot_warning": true,
                "rear_cross_traffic_alert": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 19 inch",
                "mirrors": "Chỉnh điện, gập điện, sấy gương, báo rẽ LED",
                "body_type": "C-SUV",
                "headlights": "Full-LED",
                "hidden_door_handles": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "driver_seat": "Chỉnh cơ 6 hướng",
                "seat_material": "Nỉ kết hợp giả da",
                "audio_speakers": 8,
                "rear_air_vents": true,
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng, lọc PM2.5",
                "front_passenger_seat": "Chỉnh cơ 4 hướng",
                "central_screen_inches": 12.9
              },
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất 7,2 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "440 km sau mỗi lần sạc đầy theo tiêu chuẩn công bố của VinFast.",
              "regenerative_braking": "Có nhiều mức phanh tái sinh",
              "technical_specs_text": "Động cơ điện công suất 130 kW, tương đương khoảng 174 mã lực, mô-men xoắn 250 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "9748ae62-9d19-4bad-9db0-fef755217b64",
            "model_name": "VinFast VF 7"
          },
          "specifications": {
            "car_id": "9748ae62-9d19-4bad-9db0-fef755217b64",
            "version": "Eco",
            "range_km": 440,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 740000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 130,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 59.6,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Bạc"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh Dương"
                },
                {
                  "name": "Xanh Lục"
                }
              ],
              "images": [],
              "width_mm": 1890,
              "height_mm": 1636,
              "length_mm": 4545,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, dạng đa liên kết",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 19 inch, lốp 235/50R19",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 174,
              "motor_torque_nm": 250,
              "price_info_text": "Giá niêm yết: 740.000.000 VNĐ. Giá ưu đãi tham khảo: 703.000.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 24 phút. Sạc chậm AC công suất 7,2 kW.",
              "description_text": "VinFast VF 7 Eco là mẫu SUV điện cỡ C, 5 chỗ ngồi.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "airbags": 4,
                "anti_theft_system": true,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "cruise_control": true,
                "blind_spot_warning": true,
                "rear_cross_traffic_alert": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 19 inch",
                "mirrors": "Chỉnh điện, gập điện, sấy gương, báo rẽ LED",
                "body_type": "C-SUV",
                "headlights": "Full-LED",
                "hidden_door_handles": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "driver_seat": "Chỉnh cơ 6 hướng",
                "seat_material": "Nỉ kết hợp giả da",
                "audio_speakers": 8,
                "rear_air_vents": true,
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng, lọc PM2.5",
                "front_passenger_seat": "Chỉnh cơ 4 hướng",
                "central_screen_inches": 12.9
              },
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất 7,2 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "440 km sau mỗi lần sạc đầy theo tiêu chuẩn công bố của VinFast.",
              "regenerative_braking": "Có nhiều mức phanh tái sinh",
              "technical_specs_text": "Động cơ điện công suất 130 kW, tương đương khoảng 174 mã lực, mô-men xoắn 250 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-12T09:25:51.223300Z"
    }
  },
  {
    "id": "e81a52d7-f06e-44b7-af39-ea0fe13b5d84",
    "code": "VF MPV 7",
    "name": "VinFast VF MPV 7 Tiêu chuẩn gia đình",
    "tagline": "VinFast VF MPV 7 là mẫu MPV điện 7 chỗ dành cho gia đình, phát triển trên nền tảng Limo Green.",
    "category": "suv",
    "image": "/static/uploads/cars/VF7_MPV.jpg",
    "basePrice": 819000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 450,
    "battery": "60.13 kWh",
    "acceleration": "201 HP / 280 Nm",
    "topSpeed": 150,
    "seats": 7,
    "isNew": true,
    "colors": [
      "Trắng",
      "Đen",
      "Xám",
      "Đỏ",
      "Xanh Dương",
      "Nâu"
    ],
    "description": "VinFast VF MPV 7 là mẫu MPV điện 7 chỗ dành cho gia đình, phát triển trên nền tảng Limo Green.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "e81a52d7-f06e-44b7-af39-ea0fe13b5d84",
      "id": "e81a52d7-f06e-44b7-af39-ea0fe13b5d84",
      "model_name": "VinFast VF MPV 7 Tiêu chuẩn gia đình",
      "vehicle_line": "VF MPV 7",
      "name": "VinFast VF MPV 7 Tiêu chuẩn gia đình",
      "code": "VF MPV 7",
      "version": "Tiêu chuẩn gia đình",
      "category": "Personal",
      "list_price": 819000000,
      "base_price": 819000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF7_MPV.jpg",
      "seat_count": 7,
      "length_mm": 4740,
      "width_mm": 1872,
      "height_mm": 1734,
      "wheelbase_mm": 2840,
      "range_km": 450,
      "maximum_power_kw": 150,
      "maximum_torque_nm": 280,
      "usable_battery_capacity": 60.13,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "e81a52d7-f06e-44b7-af39-ea0fe13b5d84",
            "model_name": "VinFast VF MPV 7"
          },
          "specifications": {
            "car_id": "e81a52d7-f06e-44b7-af39-ea0fe13b5d84",
            "version": "Plus",
            "range_km": 450,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 819000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 7,
            "motor_power_kw": 150,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 60.13,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng",
                  "category": "Cơ bản"
                },
                {
                  "name": "Đen",
                  "category": "Cơ bản"
                },
                {
                  "name": "Xám",
                  "category": "Cơ bản"
                },
                {
                  "name": "Đỏ",
                  "category": "Cơ bản"
                },
                {
                  "name": "Xanh Dương",
                  "category": "Nâng cao"
                },
                {
                  "name": "Nâu",
                  "category": "Nâng cao"
                }
              ],
              "images": [],
              "width_mm": 1872,
              "height_mm": 1734,
              "length_mm": 4740,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, dạng đa liên kết",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin LFP",
              "tires_wheels": "La-zăng hợp kim 19 inch",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Thông tin bảo hành pin cần đối chiếu theo chính sách cụ thể của VF MPV 7.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 201,
              "motor_torque_nm": 280,
              "price_info_text": "Giá niêm yết MSRP kèm pin: 819.000.000 VNĐ. Giá ưu đãi màu cơ bản: 750.000.000 VNĐ. Giá ưu đãi màu nâng cao: 760.000.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 30 phút. Sạc chậm AC tại nhà khoảng 7 đến 9 giờ.",
              "description_text": "VinFast VF MPV 7 là mẫu MPV điện 7 chỗ dành cho gia đình, phát triển trên nền tảng Limo Green.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "ess": true,
                "hsa": true,
                "rom": true,
                "tcs": true,
                "side_airbags": true,
                "front_airbags": true,
                "airbags": 7
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "android_auto": true,
                "apple_carplay": true,
                "cruise_control": true,
                "rear_parking_sensors": true,
                "remote_vehicle_tracking": true,
                "vietnamese_voice_assistant": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 19 inch",
                "mirrors": "Chỉnh điện, gập điện, tích hợp báo rẽ LED",
                "tailgate": "Đóng mở chỉnh cơ",
                "body_type": "MPV 7 chỗ",
                "headlights": "Full-LED",
                "taillights": "LED",
                "daytime_running_lights": "LED hình chữ V"
              },
              "interior_features": {
                "driver_seat": "Chỉnh cơ 6 hướng",
                "gear_selector": "Cần số điện tử dạng gạt sau vô-lăng",
                "seat_material": "Da tổng hợp cao cấp",
                "audio_speakers": 4,
                "rear_air_vents": true,
                "steering_wheel": "D-cut bọc da",
                "air_conditioning": "Tự động 1 vùng, lọc PM2.5",
                "central_screen_inches": 10.1,
                "seating_configuration": "3 hàng ghế, 7 chỗ",
                "maximum_cargo_capacity_liters": 1240
              },
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 1240,
              "standard_charger": "Sạc chậm AC tại nhà",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "450 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 150 kW, tương đương khoảng 201 mã lực, mô-men xoắn 280 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "e81a52d7-f06e-44b7-af39-ea0fe13b5d84",
            "model_name": "VinFast VF MPV 7"
          },
          "specifications": {
            "car_id": "e81a52d7-f06e-44b7-af39-ea0fe13b5d84",
            "version": "Plus",
            "range_km": 450,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 819000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 7,
            "motor_power_kw": 150,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 60.13,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng",
                  "category": "Cơ bản"
                },
                {
                  "name": "Đen",
                  "category": "Cơ bản"
                },
                {
                  "name": "Xám",
                  "category": "Cơ bản"
                },
                {
                  "name": "Đỏ",
                  "category": "Cơ bản"
                },
                {
                  "name": "Xanh Dương",
                  "category": "Nâng cao"
                },
                {
                  "name": "Nâu",
                  "category": "Nâng cao"
                }
              ],
              "images": [],
              "width_mm": 1872,
              "height_mm": 1734,
              "length_mm": 4740,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, dạng đa liên kết",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin LFP",
              "tires_wheels": "La-zăng hợp kim 19 inch",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km. Thông tin bảo hành pin cần đối chiếu theo chính sách cụ thể của VF MPV 7.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 201,
              "motor_torque_nm": 280,
              "price_info_text": "Giá niêm yết MSRP kèm pin: 819.000.000 VNĐ. Giá ưu đãi màu cơ bản: 750.000.000 VNĐ. Giá ưu đãi màu nâng cao: 760.000.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 30 phút. Sạc chậm AC tại nhà khoảng 7 đến 9 giờ.",
              "description_text": "VinFast VF MPV 7 là mẫu MPV điện 7 chỗ dành cho gia đình, phát triển trên nền tảng Limo Green.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "ess": true,
                "hsa": true,
                "rom": true,
                "tcs": true,
                "side_airbags": true,
                "front_airbags": true,
                "airbags": 7
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "android_auto": true,
                "apple_carplay": true,
                "cruise_control": true,
                "rear_parking_sensors": true,
                "remote_vehicle_tracking": true,
                "vietnamese_voice_assistant": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 19 inch",
                "mirrors": "Chỉnh điện, gập điện, tích hợp báo rẽ LED",
                "tailgate": "Đóng mở chỉnh cơ",
                "body_type": "MPV 7 chỗ",
                "headlights": "Full-LED",
                "taillights": "LED",
                "daytime_running_lights": "LED hình chữ V"
              },
              "interior_features": {
                "driver_seat": "Chỉnh cơ 6 hướng",
                "gear_selector": "Cần số điện tử dạng gạt sau vô-lăng",
                "seat_material": "Da tổng hợp cao cấp",
                "audio_speakers": 4,
                "rear_air_vents": true,
                "steering_wheel": "D-cut bọc da",
                "air_conditioning": "Tự động 1 vùng, lọc PM2.5",
                "central_screen_inches": 10.1,
                "seating_configuration": "3 hàng ghế, 7 chỗ",
                "maximum_cargo_capacity_liters": 1240
              },
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 1240,
              "standard_charger": "Sạc chậm AC tại nhà",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "450 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 150 kW, tương đương khoảng 201 mã lực, mô-men xoắn 280 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "f14d17f4-4988-46c2-9f52-16e642d4f7d0",
    "code": "VF 7",
    "name": "VinFast VF 7 Plus AWD - Trần thép",
    "tagline": "VinFast VF 7 Plus AWD trần thép là mẫu SUV điện cỡ C sử dụng hai mô-tơ điện.",
    "category": "suv",
    "image": "/static/uploads/cars/VF7_Plus_thuong.jpg",
    "basePrice": 830000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 500.5,
    "battery": "70 kWh",
    "acceleration": "349 HP / 500 Nm",
    "topSpeed": 150,
    "seats": 5,
    "isNew": true,
    "colors": [
      "Trắng",
      "Đen",
      "Bạc",
      "Đỏ",
      "Xanh Dương",
      "Xanh Lục"
    ],
    "description": "VinFast VF 7 Plus AWD trần thép là mẫu SUV điện cỡ C sử dụng hai mô-tơ điện.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "f14d17f4-4988-46c2-9f52-16e642d4f7d0",
      "id": "f14d17f4-4988-46c2-9f52-16e642d4f7d0",
      "model_name": "VinFast VF 7 Plus AWD - Trần thép",
      "vehicle_line": "VF 7",
      "name": "VinFast VF 7 Plus AWD - Trần thép",
      "code": "VF 7",
      "version": "Plus AWD - Trần thép",
      "category": "Personal",
      "list_price": 830000000,
      "base_price": 830000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF7_Plus_thuong.jpg",
      "seat_count": 5,
      "length_mm": 4545,
      "width_mm": 1890,
      "height_mm": 1636,
      "wheelbase_mm": 2840,
      "range_km": 500.5,
      "maximum_power_kw": 260,
      "maximum_torque_nm": 500,
      "usable_battery_capacity": 70,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "f14d17f4-4988-46c2-9f52-16e642d4f7d0",
            "model_name": "VinFast VF 7"
          },
          "specifications": {
            "car_id": "f14d17f4-4988-46c2-9f52-16e642d4f7d0",
            "version": "Plus",
            "range_km": 500.5,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 830000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 260,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 70,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Bạc"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh Dương"
                },
                {
                  "name": "Xanh Lục"
                }
              ],
              "images": [],
              "width_mm": 1890,
              "height_mm": 1636,
              "length_mm": 4545,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hai cầu toàn thời gian AWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, dạng đa liên kết",
              "engine_type": "Hai động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 20 inch, lốp 245/45R20",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 349,
              "motor_torque_nm": 500,
              "price_info_text": "Giá niêm yết: 830.000.000 VNĐ. Giá ưu đãi tham khảo: 788.500.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 24 phút. Sạc chậm AC công suất 7,2 kW.",
              "description_text": "VinFast VF 7 Plus AWD trần thép là mẫu SUV điện cỡ C sử dụng hai mô-tơ điện.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "airbags": 7,
                "anti_theft_system": true,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "lane_keep_assist": true,
                "blind_spot_warning": true,
                "surround_view_camera": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 20 inch",
                "mirrors": "Chỉnh điện, gập điện, sấy gương, camera 360",
                "body_type": "C-SUV",
                "headlights": "Full-LED Matrix",
                "electric_tailgate": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "driver_seat": "Chỉnh điện 8 hướng",
                "ambient_light": true,
                "seat_material": "Da tổng hợp cao cấp",
                "audio_speakers": 8,
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng, lọc PM2.5",
                "front_seat_cooling": true,
                "front_passenger_seat": "Chỉnh điện 6 hướng",
                "central_screen_inches": 12.9,
                "heated_steering_wheel": true
              },
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất 7,2 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "500,5 km sau mỗi lần sạc đầy theo tiêu chuẩn công bố của VinFast.",
              "regenerative_braking": "Có nhiều mức phanh tái sinh",
              "technical_specs_text": "Hai mô-tơ điện, công suất 260 kW tương đương khoảng 349 mã lực, mô-men xoắn 500 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "f14d17f4-4988-46c2-9f52-16e642d4f7d0",
            "model_name": "VinFast VF 7"
          },
          "specifications": {
            "car_id": "f14d17f4-4988-46c2-9f52-16e642d4f7d0",
            "version": "Plus",
            "range_km": 500.5,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 830000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 260,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 70,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Bạc"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh Dương"
                },
                {
                  "name": "Xanh Lục"
                }
              ],
              "images": [],
              "width_mm": 1890,
              "height_mm": 1636,
              "length_mm": 4545,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hai cầu toàn thời gian AWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, dạng đa liên kết",
              "engine_type": "Hai động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 20 inch, lốp 245/45R20",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 349,
              "motor_torque_nm": 500,
              "price_info_text": "Giá niêm yết: 830.000.000 VNĐ. Giá ưu đãi tham khảo: 788.500.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 24 phút. Sạc chậm AC công suất 7,2 kW.",
              "description_text": "VinFast VF 7 Plus AWD trần thép là mẫu SUV điện cỡ C sử dụng hai mô-tơ điện.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "airbags": 7,
                "anti_theft_system": true,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "lane_keep_assist": true,
                "blind_spot_warning": true,
                "surround_view_camera": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 20 inch",
                "mirrors": "Chỉnh điện, gập điện, sấy gương, camera 360",
                "body_type": "C-SUV",
                "headlights": "Full-LED Matrix",
                "electric_tailgate": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "driver_seat": "Chỉnh điện 8 hướng",
                "ambient_light": true,
                "seat_material": "Da tổng hợp cao cấp",
                "audio_speakers": 8,
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng, lọc PM2.5",
                "front_seat_cooling": true,
                "front_passenger_seat": "Chỉnh điện 6 hướng",
                "central_screen_inches": 12.9,
                "heated_steering_wheel": true
              },
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất 7,2 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "500,5 km sau mỗi lần sạc đầy theo tiêu chuẩn công bố của VinFast.",
              "regenerative_braking": "Có nhiều mức phanh tái sinh",
              "technical_specs_text": "Hai mô-tơ điện, công suất 260 kW tương đương khoảng 349 mã lực, mô-men xoắn 500 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "4126ecdd-a0be-4175-87a0-18a2ab09c09d",
    "code": "VF 7",
    "name": "VinFast VF 7 Plus AWD - Trần kính toàn cảnh",
    "tagline": "VinFast VF 7 Plus AWD trần kính toàn cảnh là mẫu SUV điện cỡ C cao cấp.",
    "category": "suv",
    "image": "/static/uploads/cars/VF7_Plus_thuong.jpg",
    "basePrice": 850000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 500.5,
    "battery": "70 kWh",
    "acceleration": "349 HP / 500 Nm",
    "topSpeed": 150,
    "seats": 5,
    "isNew": true,
    "colors": [
      "Trắng",
      "Đen",
      "Bạc",
      "Đỏ",
      "Xanh Dương",
      "Xanh Lục"
    ],
    "description": "VinFast VF 7 Plus AWD trần kính toàn cảnh là mẫu SUV điện cỡ C cao cấp.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "4126ecdd-a0be-4175-87a0-18a2ab09c09d",
      "id": "4126ecdd-a0be-4175-87a0-18a2ab09c09d",
      "model_name": "VinFast VF 7 Plus AWD - Trần kính toàn cảnh",
      "vehicle_line": "VF 7",
      "name": "VinFast VF 7 Plus AWD - Trần kính toàn cảnh",
      "code": "VF 7",
      "version": "Plus AWD - Trần kính toàn cảnh",
      "category": "Personal",
      "list_price": 850000000,
      "base_price": 850000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF7_Plus_thuong.jpg",
      "seat_count": 5,
      "length_mm": 4545,
      "width_mm": 1890,
      "height_mm": 1636,
      "wheelbase_mm": 2840,
      "range_km": 500.5,
      "maximum_power_kw": 260,
      "maximum_torque_nm": 500,
      "usable_battery_capacity": 70,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "4126ecdd-a0be-4175-87a0-18a2ab09c09d",
            "model_name": "VinFast VF 7"
          },
          "specifications": {
            "car_id": "4126ecdd-a0be-4175-87a0-18a2ab09c09d",
            "version": "Plus",
            "range_km": 500.5,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 850000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 260,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 70,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Bạc"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh Dương"
                },
                {
                  "name": "Xanh Lục"
                }
              ],
              "images": [],
              "width_mm": 1890,
              "height_mm": 1636,
              "length_mm": 4545,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hai cầu toàn thời gian AWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, dạng đa liên kết",
              "engine_type": "Hai động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 20 inch, lốp 245/45R20",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 349,
              "motor_torque_nm": 500,
              "price_info_text": "Giá niêm yết: 850.000.000 VNĐ. Giá ưu đãi tham khảo: 807.500.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 24 phút. Sạc chậm AC công suất 7,2 kW.",
              "description_text": "VinFast VF 7 Plus AWD trần kính toàn cảnh là mẫu SUV điện cỡ C cao cấp.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "airbags": 7,
                "anti_theft_system": true,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "lane_keep_assist": true,
                "blind_spot_warning": true,
                "surround_view_camera": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 20 inch",
                "mirrors": "Chỉnh điện, gập điện, sấy gương, camera 360",
                "body_type": "C-SUV",
                "headlights": "Full-LED Matrix",
                "panoramic_roof": true,
                "electric_tailgate": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "driver_seat": "Chỉnh điện 8 hướng",
                "ambient_light": true,
                "seat_material": "Da tổng hợp cao cấp",
                "audio_speakers": 8,
                "panoramic_roof": true,
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng, lọc PM2.5",
                "front_seat_cooling": true,
                "front_passenger_seat": "Chỉnh điện 6 hướng",
                "central_screen_inches": 12.9,
                "heated_steering_wheel": true
              },
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất 7,2 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "500,5 km sau mỗi lần sạc đầy theo tiêu chuẩn công bố của VinFast.",
              "regenerative_braking": "Có nhiều mức phanh tái sinh",
              "technical_specs_text": "Hai mô-tơ điện, công suất 260 kW tương đương khoảng 349 mã lực, mô-men xoắn 500 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "4126ecdd-a0be-4175-87a0-18a2ab09c09d",
            "model_name": "VinFast VF 7"
          },
          "specifications": {
            "car_id": "4126ecdd-a0be-4175-87a0-18a2ab09c09d",
            "version": "Plus",
            "range_km": 500.5,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 850000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 260,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 70,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Bạc"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh Dương"
                },
                {
                  "name": "Xanh Lục"
                }
              ],
              "images": [],
              "width_mm": 1890,
              "height_mm": 1636,
              "length_mm": 4545,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hai cầu toàn thời gian AWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa",
              "front_suspension": "Độc lập, kiểu MacPherson",
              "rear_suspension": "Độc lập, dạng đa liên kết",
              "engine_type": "Hai động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion LFP",
              "tires_wheels": "La-zăng hợp kim 20 inch, lốp 245/45R20",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 349,
              "motor_torque_nm": 500,
              "price_info_text": "Giá niêm yết: 850.000.000 VNĐ. Giá ưu đãi tham khảo: 807.500.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 24 phút. Sạc chậm AC công suất 7,2 kW.",
              "description_text": "VinFast VF 7 Plus AWD trần kính toàn cảnh là mẫu SUV điện cỡ C cao cấp.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "airbags": 7,
                "anti_theft_system": true,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "lane_keep_assist": true,
                "blind_spot_warning": true,
                "surround_view_camera": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 20 inch",
                "mirrors": "Chỉnh điện, gập điện, sấy gương, camera 360",
                "body_type": "C-SUV",
                "headlights": "Full-LED Matrix",
                "panoramic_roof": true,
                "electric_tailgate": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "driver_seat": "Chỉnh điện 8 hướng",
                "ambient_light": true,
                "seat_material": "Da tổng hợp cao cấp",
                "audio_speakers": 8,
                "panoramic_roof": true,
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng, lọc PM2.5",
                "front_seat_cooling": true,
                "front_passenger_seat": "Chỉnh điện 6 hướng",
                "central_screen_inches": 12.9,
                "heated_steering_wheel": true
              },
              "ground_clearance_mm": 160,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc chậm AC công suất 7,2 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "500,5 km sau mỗi lần sạc đầy theo tiêu chuẩn công bố của VinFast.",
              "regenerative_braking": "Có nhiều mức phanh tái sinh",
              "technical_specs_text": "Hai mô-tơ điện, công suất 260 kW tương đương khoảng 349 mã lực, mô-men xoắn 500 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "eea392bc-847e-449e-ba0a-704fe27b0fee",
    "code": "VF 8",
    "name": "VinFast VF 8 Eco",
    "tagline": "VinFast VF 8 Eco là mẫu SUV điện 5 chỗ, sử dụng hệ dẫn động cầu trước.",
    "category": "suv",
    "image": "/static/uploads/cars/VF8_Plus.jpg",
    "basePrice": 898000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 562,
    "battery": "87.7 kWh",
    "acceleration": "201 HP / 310 Nm",
    "topSpeed": 150,
    "seats": 5,
    "isNew": true,
    "colors": [
      "Trắng",
      "Đen",
      "Đỏ",
      "Xanh Lục"
    ],
    "description": "VinFast VF 8 Eco là mẫu SUV điện 5 chỗ, sử dụng hệ dẫn động cầu trước.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "eea392bc-847e-449e-ba0a-704fe27b0fee",
      "id": "eea392bc-847e-449e-ba0a-704fe27b0fee",
      "model_name": "VinFast VF 8 Eco",
      "vehicle_line": "VF 8",
      "name": "VinFast VF 8 Eco",
      "code": "VF 8",
      "version": "Eco",
      "category": "Personal",
      "list_price": 898000000,
      "base_price": 898000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF8_Plus.jpg",
      "seat_count": 5,
      "length_mm": 4750,
      "width_mm": 1934,
      "height_mm": 1667,
      "wheelbase_mm": 2950,
      "range_km": 562,
      "maximum_power_kw": 150,
      "maximum_torque_nm": 310,
      "usable_battery_capacity": 87.7,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "eea392bc-847e-449e-ba0a-704fe27b0fee",
            "model_name": "VinFast VF 8"
          },
          "specifications": {
            "car_id": "eea392bc-847e-449e-ba0a-704fe27b0fee",
            "version": "Plus",
            "range_km": 562,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 898000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 150,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 87.7,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh Lục"
                }
              ],
              "images": [],
              "width_mm": 1934,
              "height_mm": 1667,
              "length_mm": 4750,
              "wheelbase_mm": 2950,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Treo độc lập thông minh",
              "rear_suspension": "Thanh điều hướng đa điểm",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion",
              "tires_wheels": "La-zăng hợp kim 19 inch, lốp 235/55R19",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe theo chính sách hiện hành của VinFast.",
              "curb_weight_kg": 2328,
              "motor_power_hp": 201,
              "motor_torque_nm": 310,
              "price_info_text": "Giá niêm yết hiện tại: 898.000.000 VNĐ. Giá ưu đãi tham khảo: 853.100.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 31 phút. Sạc AC công suất 11 kW.",
              "description_text": "VinFast VF 8 Eco là mẫu SUV điện 5 chỗ, sử dụng hệ dẫn động cầu trước.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "ess": true,
                "hsa": true,
                "rom": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 6,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "driver_monitoring": true,
                "blind_spot_warning": true,
                "basic_cruise_control": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 19 inch",
                "mirrors": "Chỉnh điện, gập điện, sấy gương, báo rẽ LED",
                "tailgate": "Chỉnh cơ",
                "body_type": "D-SUV",
                "headlights": "LED tự động bật/tắt",
                "taillights": "LED",
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "driver_seat": "Chỉnh điện 6 hướng",
                "seat_material": "Giả da",
                "audio_speakers": 8,
                "steering_wheel": "D-cut bọc da",
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng",
                "wireless_charging": true,
                "air_quality_control": true,
                "front_passenger_seat": "Chỉnh điện 6 hướng",
                "central_screen_inches": 15.6
              },
              "ground_clearance_mm": 162,
              "cargo_capacity_folded_liters": 1373,
              "standard_charger": "Sạc chậm AC công suất 11 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "562 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 150 kW, tương đương 201 mã lực, mô-men xoắn 310 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "eea392bc-847e-449e-ba0a-704fe27b0fee",
            "model_name": "VinFast VF 8"
          },
          "specifications": {
            "car_id": "eea392bc-847e-449e-ba0a-704fe27b0fee",
            "version": "Plus",
            "range_km": 562,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 898000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 150,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 87.7,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh Lục"
                }
              ],
              "images": [],
              "width_mm": 1934,
              "height_mm": 1667,
              "length_mm": 4750,
              "wheelbase_mm": 2950,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Cầu trước FWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Treo độc lập thông minh",
              "rear_suspension": "Thanh điều hướng đa điểm",
              "engine_type": "Động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion",
              "tires_wheels": "La-zăng hợp kim 19 inch, lốp 235/55R19",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe theo chính sách hiện hành của VinFast.",
              "curb_weight_kg": 2328,
              "motor_power_hp": 201,
              "motor_torque_nm": 310,
              "price_info_text": "Giá niêm yết hiện tại: 898.000.000 VNĐ. Giá ưu đãi tham khảo: 853.100.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 31 phút. Sạc AC công suất 11 kW.",
              "description_text": "VinFast VF 8 Eco là mẫu SUV điện 5 chỗ, sử dụng hệ dẫn động cầu trước.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "ess": true,
                "hsa": true,
                "rom": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 6,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "rear_camera": true,
                "driver_monitoring": true,
                "blind_spot_warning": true,
                "basic_cruise_control": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 19 inch",
                "mirrors": "Chỉnh điện, gập điện, sấy gương, báo rẽ LED",
                "tailgate": "Chỉnh cơ",
                "body_type": "D-SUV",
                "headlights": "LED tự động bật/tắt",
                "taillights": "LED",
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "driver_seat": "Chỉnh điện 6 hướng",
                "seat_material": "Giả da",
                "audio_speakers": 8,
                "steering_wheel": "D-cut bọc da",
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng",
                "wireless_charging": true,
                "air_quality_control": true,
                "front_passenger_seat": "Chỉnh điện 6 hướng",
                "central_screen_inches": 15.6
              },
              "ground_clearance_mm": 162,
              "cargo_capacity_folded_liters": 1373,
              "standard_charger": "Sạc chậm AC công suất 11 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "562 km sau mỗi lần sạc đầy theo tiêu chuẩn NEDC.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Động cơ điện công suất 150 kW, tương đương 201 mã lực, mô-men xoắn 310 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "80b40bf0-c40d-4d0a-8012-07f05622c0ac",
    "code": "VF 8",
    "name": "VinFast VF 8 The All New",
    "tagline": "VinFast VF 8 The All New là mẫu SUV điện 5 chỗ, trang bị hệ thống ADAS, màn hình trung tâm 12,9 inch và khả năng sạc nhanh dưới 30 phút.",
    "category": "suv",
    "image": "/static/uploads/cars/VF8_thehemoi_a54a92.jpg",
    "basePrice": 999000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 490,
    "battery": "60.13 kWh",
    "acceleration": "228 HP / 330 Nm",
    "topSpeed": 150,
    "seats": 5,
    "isNew": true,
    "colors": [
      { "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-infinity-blanc.webp" },
      { "name": "Xanh dương", "official_name": "Starburst Blue", "color_code": "starburst-blue", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-starburst-blue.webp" },
      { "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-solar-ruby.webp" },
      { "name": "Đen", "official_name": "Jet Black", "color_code": "jet-black", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-jet-black.webp" },
      { "name": "Đỏ - nóc đen", "official_name": "Solar Ruby Body - Jet Black Roof", "color_code": "solar-ruby-jet-black", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-solar-ruby-jet-black.webp" },
      { "name": "Cam - nóc đen", "official_name": "Vitality Orange Body - Jet Black Roof", "color_code": "vitality-orange-jet-black", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-vitality-orange-jet-black.webp" },
      { "name": "Xanh dương - nóc trắng", "official_name": "Starburst Blue Body - Infinity Blanc Roof", "color_code": "starburst-blue-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-starburst-blue-infinity-blanc.webp" },
      { "name": "Tím - nóc xám", "official_name": "Mysterioso Purple Body - Stealth Gray Roof", "color_code": "mysterioso-purple-stealth-gray", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-mysterioso-purple-stealth-gray.webp" },
      { "name": "Đen - nóc xám", "official_name": "Jet Black Body - Stealth Gray Roof", "color_code": "jet-black-stealth-gray", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-jet-black-stealth-gray.webp" },
      { "name": "Cam - nóc trắng", "official_name": "Vitality Orange Body - Infinity Blanc Roof", "color_code": "vitality-orange-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-vitality-orange-infinity-blanc.webp" },
      { "name": "Cam", "official_name": "Vitality Orange", "color_code": "vitality-orange", "type": "solid", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-vitality-orange.webp" },
      { "name": "Tím", "official_name": "Mysterioso Purple", "color_code": "mysterioso-purple", "type": "solid", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-mysterioso-purple.webp" }
    ],
    "description": "VinFast VF 8 The All New là mẫu SUV điện 5 chỗ, trang bị hệ thống ADAS, màn hình trung tâm 12,9 inch và khả năng sạc nhanh dưới 30 phút.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "80b40bf0-c40d-4d0a-8012-07f05622c0ac",
      "id": "80b40bf0-c40d-4d0a-8012-07f05622c0ac",
      "model_name": "VinFast VF 8 The All New",
      "vehicle_line": "VF 8",
      "name": "VinFast VF 8 The All New",
      "code": "VF 8",
      "version": "The All New",
      "category": "Personal",
      "list_price": 999000000,
      "base_price": 999000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF8_thehemoi_a54a92.jpg",
      "seat_count": 5,
      "length_mm": 4701,
      "width_mm": 1872,
      "height_mm": 1670,
      "wheelbase_mm": 2840,
      "range_km": 490,
      "maximum_power_kw": 170,
      "maximum_torque_nm": 330,
      "usable_battery_capacity": 60.13,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "80b40bf0-c40d-4d0a-8012-07f05622c0ac",
            "model_name": "VinFast VF 8"
          },
          "specifications": {
            "car_id": "80b40bf0-c40d-4d0a-8012-07f05622c0ac",
            "version": "The All New",
            "range_km": 490,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 999000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 170,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 60.13,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                { "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-infinity-blanc.webp" },
                { "name": "Xanh dương", "official_name": "Starburst Blue", "color_code": "starburst-blue", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-starburst-blue.webp" },
                { "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-solar-ruby.webp" },
                { "name": "Đen", "official_name": "Jet Black", "color_code": "jet-black", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-jet-black.webp" },
                { "name": "Đỏ - nóc đen", "official_name": "Solar Ruby Body - Jet Black Roof", "color_code": "solar-ruby-jet-black", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-solar-ruby-jet-black.webp" },
                { "name": "Cam - nóc đen", "official_name": "Vitality Orange Body - Jet Black Roof", "color_code": "vitality-orange-jet-black", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-vitality-orange-jet-black.webp" },
                { "name": "Xanh dương - nóc trắng", "official_name": "Starburst Blue Body - Infinity Blanc Roof", "color_code": "starburst-blue-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-starburst-blue-infinity-blanc.webp" },
                { "name": "Tím - nóc xám", "official_name": "Mysterioso Purple Body - Stealth Gray Roof", "color_code": "mysterioso-purple-stealth-gray", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-mysterioso-purple-stealth-gray.webp" },
                { "name": "Đen - nóc xám", "official_name": "Jet Black Body - Stealth Gray Roof", "color_code": "jet-black-stealth-gray", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-jet-black-stealth-gray.webp" },
                { "name": "Cam - nóc trắng", "official_name": "Vitality Orange Body - Infinity Blanc Roof", "color_code": "vitality-orange-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-vitality-orange-infinity-blanc.webp" },
                { "name": "Cam", "official_name": "Vitality Orange", "color_code": "vitality-orange", "type": "solid", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-vitality-orange.webp" },
                { "name": "Tím", "official_name": "Mysterioso Purple", "color_code": "mysterioso-purple", "type": "solid", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-mysterioso-purple.webp" }
              ],
              "images": [],
              "width_mm": 1872,
              "height_mm": 1670,
              "length_mm": 4701,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió.",
              "rear_brake": "Phanh đĩa thông gió.",
              "front_suspension": "Hệ thống treo độc lập phía trước.",
              "rear_suspension": "Hệ thống treo độc lập phía trước.",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion",
              "tires_wheels": "Mâm hợp kim 19 inch",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km, tùy điều kiện nào đến trước. Bảo hành pin 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 228,
              "motor_torque_nm": 330,
              "price_info_text": "Giá niêm yết: 999.000.000 VNĐ. Giá ưu đãi có thể dao động khoảng 848.000.000–899.000.000 VNĐ tùy chương trình.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "VinFast VF 8 The All New là mẫu SUV điện 5 chỗ, trang bị hệ thống ADAS, màn hình trung tâm 12,9 inch và khả năng sạc nhanh dưới 30 phút.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "airbags": 11,
                "anti_theft": true
              },
              "driver_assistance_features": {
                "hud": true,
                "adas": "Hệ thống hỗ trợ lái xe nâng cao ADAS",
                "lane_assist": true,
                "voice_assistant": "Trợ lý ảo VinFast tiếng Việt",
                "automatic_parking": true,
                "adaptive_cruise_control": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "wheels": "Mâm hợp kim 19 inch",
                "mirrors": "Gương chỉnh điện, gập điện, sấy gương",
                "lighting": "Đèn LED projector",
                "vinfast_signature": "Dải LED nhận diện thương hiệu hình cánh chim"
              },
              "interior_features": {
                "audio": "Hệ thống âm thanh 8 loa",
                "seats": "Ghế bọc da cao cấp",
                "screen": "Màn hình trung tâm 12,9 inch",
                "driver_seat": "Ghế lái chỉnh điện 6 hướng, có nhớ vị trí",
                "steering_wheel": "Vô-lăng bọc da tích hợp phím điều khiển",
                "air_conditioning": "Điều hòa tự động đa vùng, lọc không khí PM2.5"
              },
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc AC 7,2 kW; sạc nhanh DC công suất tối đa khoảng 100 kW.",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "Quãng đường khoảng 480–500 km theo tiêu chuẩn NEDC, tùy điều kiện vận hành.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng.",
              "technical_specs_text": "VinFast VF 8 The All New: công suất 170 kW, mô-men xoắn 330 Nm, pin 60,13 kWh, tầm hoạt động 480–500 km NEDC, hệ dẫn động cầu trước.",
              "acceleration_0_50_seconds": "chưa công bố",
              "airbags": 11
            },
            "airbags": 11
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "80b40bf0-c40d-4d0a-8012-07f05622c0ac",
            "model_name": "VinFast VF 8"
          },
          "specifications": {
            "car_id": "80b40bf0-c40d-4d0a-8012-07f05622c0ac",
            "version": "The All New",
            "range_km": 490,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 999000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 170,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 60.13,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                { "name": "Trắng", "official_name": "Infinity Blanc", "color_code": "infinity-blanc", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-infinity-blanc.webp" },
                { "name": "Xanh dương", "official_name": "Starburst Blue", "color_code": "starburst-blue", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-starburst-blue.webp" },
                { "name": "Đỏ", "official_name": "Solar Ruby", "color_code": "solar-ruby", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-solar-ruby.webp" },
                { "name": "Đen", "official_name": "Jet Black", "color_code": "jet-black", "type": "solid", "price_tier": "basic", "price_delta": 0, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-jet-black.webp" },
                { "name": "Đỏ - nóc đen", "official_name": "Solar Ruby Body - Jet Black Roof", "color_code": "solar-ruby-jet-black", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-solar-ruby-jet-black.webp" },
                { "name": "Cam - nóc đen", "official_name": "Vitality Orange Body - Jet Black Roof", "color_code": "vitality-orange-jet-black", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-vitality-orange-jet-black.webp" },
                { "name": "Xanh dương - nóc trắng", "official_name": "Starburst Blue Body - Infinity Blanc Roof", "color_code": "starburst-blue-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-starburst-blue-infinity-blanc.webp" },
                { "name": "Tím - nóc xám", "official_name": "Mysterioso Purple Body - Stealth Gray Roof", "color_code": "mysterioso-purple-stealth-gray", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-mysterioso-purple-stealth-gray.webp" },
                { "name": "Đen - nóc xám", "official_name": "Jet Black Body - Stealth Gray Roof", "color_code": "jet-black-stealth-gray", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-jet-black-stealth-gray.webp" },
                { "name": "Cam - nóc trắng", "official_name": "Vitality Orange Body - Infinity Blanc Roof", "color_code": "vitality-orange-infinity-blanc", "type": "two_tone", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-vitality-orange-infinity-blanc.webp" },
                { "name": "Cam", "official_name": "Vitality Orange", "color_code": "vitality-orange", "type": "solid", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-vitality-orange.webp" },
                { "name": "Tím", "official_name": "Mysterioso Purple", "color_code": "mysterioso-purple", "type": "solid", "price_tier": "advanced", "price_delta": 12000000, "image_url": "/static/uploads/cars/colors/vf8-the-all-new/vf8-the-all-new-mysterioso-purple.webp" }
              ],
              "images": [],
              "width_mm": 1872,
              "height_mm": 1670,
              "length_mm": 4701,
              "wheelbase_mm": 2840,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hộp số đơn cấp",
              "front_brake": "Phanh đĩa thông gió.",
              "rear_brake": "Phanh đĩa thông gió.",
              "front_suspension": "Hệ thống treo độc lập phía trước.",
              "rear_suspension": "Hệ thống treo độc lập phía trước.",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion",
              "tires_wheels": "Mâm hợp kim 19 inch",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 7 năm hoặc 160.000 km, tùy điều kiện nào đến trước. Bảo hành pin 8 năm hoặc 160.000 km.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 228,
              "motor_torque_nm": 330,
              "price_info_text": "Giá niêm yết: 999.000.000 VNĐ. Giá ưu đãi có thể dao động khoảng 848.000.000–899.000.000 VNĐ tùy chương trình.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 33 phút.",
              "description_text": "VinFast VF 8 The All New là mẫu SUV điện 5 chỗ, trang bị hệ thống ADAS, màn hình trung tâm 12,9 inch và khả năng sạc nhanh dưới 30 phút.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "tcs": true,
                "tpms": true,
                "airbags": 11,
                "anti_theft": true
              },
              "driver_assistance_features": {
                "hud": true,
                "adas": "Hệ thống hỗ trợ lái xe nâng cao ADAS",
                "lane_assist": true,
                "voice_assistant": "Trợ lý ảo VinFast tiếng Việt",
                "automatic_parking": true,
                "adaptive_cruise_control": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "wheels": "Mâm hợp kim 19 inch",
                "mirrors": "Gương chỉnh điện, gập điện, sấy gương",
                "lighting": "Đèn LED projector",
                "vinfast_signature": "Dải LED nhận diện thương hiệu hình cánh chim"
              },
              "interior_features": {
                "audio": "Hệ thống âm thanh 8 loa",
                "seats": "Ghế bọc da cao cấp",
                "screen": "Màn hình trung tâm 12,9 inch",
                "driver_seat": "Ghế lái chỉnh điện 6 hướng, có nhớ vị trí",
                "steering_wheel": "Vô-lăng bọc da tích hợp phím điều khiển",
                "air_conditioning": "Điều hòa tự động đa vùng, lọc không khí PM2.5"
              },
              "ground_clearance_mm": 175,
              "cargo_capacity_folded_liters": 900,
              "standard_charger": "Sạc AC 7,2 kW; sạc nhanh DC công suất tối đa khoảng 100 kW.",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "Quãng đường khoảng 480–500 km theo tiêu chuẩn NEDC, tùy điều kiện vận hành.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng.",
              "technical_specs_text": "VinFast VF 8 The All New: công suất 170 kW, mô-men xoắn 330 Nm, pin 60,13 kWh, tầm hoạt động 480–500 km NEDC, hệ dẫn động cầu trước.",
              "acceleration_0_50_seconds": "chưa công bố",
              "airbags": 11
            },
            "airbags": 11
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "15596e66-6b01-4d4c-b2d5-fa0f9c678b04",
    "code": "VF 8",
    "name": "VinFast VF 8 Plus",
    "tagline": "VinFast VF 8 Plus là mẫu SUV điện 5 chỗ, sử dụng hệ dẫn động AWD hai mô-tơ điện.",
    "category": "suv",
    "image": "/static/uploads/cars/VF8_Plus.jpg",
    "basePrice": 1079000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 457,
    "battery": "87.7 kWh",
    "acceleration": "402 HP / 620 Nm",
    "topSpeed": 150,
    "seats": 5,
    "isNew": true,
    "colors": [
      "Trắng",
      "Đen",
      "Đỏ",
      "Xanh Lục"
    ],
    "description": "VinFast VF 8 Plus là mẫu SUV điện 5 chỗ, sử dụng hệ dẫn động AWD hai mô-tơ điện.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "15596e66-6b01-4d4c-b2d5-fa0f9c678b04",
      "id": "15596e66-6b01-4d4c-b2d5-fa0f9c678b04",
      "model_name": "VinFast VF 8 Plus",
      "vehicle_line": "VF 8",
      "name": "VinFast VF 8 Plus",
      "code": "VF 8",
      "version": "Plus",
      "category": "Personal",
      "list_price": 1079000000,
      "base_price": 1079000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF8_Plus.jpg",
      "seat_count": 5,
      "length_mm": 4750,
      "width_mm": 1934,
      "height_mm": 1667,
      "wheelbase_mm": 2950,
      "range_km": 457,
      "maximum_power_kw": 300,
      "maximum_torque_nm": 620,
      "usable_battery_capacity": 87.7,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "15596e66-6b01-4d4c-b2d5-fa0f9c678b04",
            "model_name": "VinFast VF 8"
          },
          "specifications": {
            "car_id": "15596e66-6b01-4d4c-b2d5-fa0f9c678b04",
            "version": "Plus",
            "range_km": 457,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 1079000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 300,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 87.7,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh Lục"
                }
              ],
              "images": [],
              "width_mm": 1934,
              "height_mm": 1667,
              "length_mm": 4750,
              "wheelbase_mm": 2950,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hai cầu toàn thời gian AWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Treo độc lập thông minh",
              "rear_suspension": "Thanh điều hướng đa điểm",
              "engine_type": "Hai động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion",
              "tires_wheels": "La-zăng hợp kim 20 inch, lốp 245/45R20",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe theo chính sách hiện hành của VinFast.",
              "curb_weight_kg": 2520,
              "motor_power_hp": 402,
              "motor_torque_nm": 620,
              "price_info_text": "Giá niêm yết hiện tại: 1.079.000.000 VNĐ. Giá ưu đãi tham khảo: 1.025.050.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 31 phút. Sạc AC công suất 11 kW.",
              "description_text": "VinFast VF 8 Plus là mẫu SUV điện 5 chỗ, sử dụng hệ dẫn động AWD hai mô-tơ điện.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "ess": true,
                "hsa": true,
                "rom": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 11,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "highway_assist": true,
                "lane_keep_assist": true,
                "driver_monitoring": true,
                "safe_exit_warning": true,
                "blind_spot_warning": true,
                "traffic_jam_assist": true,
                "emergency_lane_keep": true,
                "surround_view_camera": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 20 inch",
                "mirrors": "Chỉnh điện, gập điện, sấy gương, camera 360",
                "body_type": "D-SUV",
                "headlights": "LED tự động điều chỉnh dải sáng",
                "taillights": "LED",
                "panoramic_roof": true,
                "electric_tailgate": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "subwoofer": true,
                "driver_seat": "Chỉnh điện 12 hướng, nhớ vị trí, sưởi và thông gió",
                "ambient_light": true,
                "seat_material": "Da nhân tạo",
                "audio_speakers": 10,
                "panoramic_roof": true,
                "steering_wheel": "Bọc da, có sưởi",
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng, ion hóa không khí",
                "wireless_charging": true,
                "air_quality_control": true,
                "front_passenger_seat": "Chỉnh điện 10 hướng, sưởi và thông gió",
                "central_screen_inches": 15.6
              },
              "ground_clearance_mm": 157,
              "cargo_capacity_folded_liters": 1373,
              "standard_charger": "Sạc chậm AC công suất 11 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "457 km sau mỗi lần sạc đầy theo tiêu chuẩn WLTP.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Hai mô-tơ điện công suất 300 kW, tương đương 402 mã lực, mô-men xoắn 620 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "15596e66-6b01-4d4c-b2d5-fa0f9c678b04",
            "model_name": "VinFast VF 8"
          },
          "specifications": {
            "car_id": "15596e66-6b01-4d4c-b2d5-fa0f9c678b04",
            "version": "Plus",
            "range_km": 457,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 1079000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 5,
            "motor_power_kw": 300,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 87.7,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                {
                  "name": "Trắng"
                },
                {
                  "name": "Đen"
                },
                {
                  "name": "Đỏ"
                },
                {
                  "name": "Xanh Lục"
                }
              ],
              "images": [],
              "width_mm": 1934,
              "height_mm": 1667,
              "length_mm": 4750,
              "wheelbase_mm": 2950,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hai cầu toàn thời gian AWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Treo độc lập thông minh",
              "rear_suspension": "Thanh điều hướng đa điểm",
              "engine_type": "Hai động cơ điện nam châm vĩnh cửu PMSM",
              "battery_type": "Pin Lithium-ion",
              "tires_wheels": "La-zăng hợp kim 20 inch, lốp 245/45R20",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe theo chính sách hiện hành của VinFast.",
              "curb_weight_kg": 2520,
              "motor_power_hp": 402,
              "motor_torque_nm": 620,
              "price_info_text": "Giá niêm yết hiện tại: 1.079.000.000 VNĐ. Giá ưu đãi tham khảo: 1.025.050.000 VNĐ.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% trong khoảng 31 phút. Sạc AC công suất 11 kW.",
              "description_text": "VinFast VF 8 Plus là mẫu SUV điện 5 chỗ, sử dụng hệ dẫn động AWD hai mô-tơ điện.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "ess": true,
                "hsa": true,
                "rom": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 11,
                "automatic_door_lock": true
              },
              "driver_assistance_features": {
                "highway_assist": true,
                "lane_keep_assist": true,
                "driver_monitoring": true,
                "safe_exit_warning": true,
                "blind_spot_warning": true,
                "traffic_jam_assist": true,
                "emergency_lane_keep": true,
                "surround_view_camera": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "front_rear_parking_sensors": true,
                "vietnamese_voice_assistant": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "wheels": "La-zăng hợp kim 20 inch",
                "mirrors": "Chỉnh điện, gập điện, sấy gương, camera 360",
                "body_type": "D-SUV",
                "headlights": "LED tự động điều chỉnh dải sáng",
                "taillights": "LED",
                "panoramic_roof": true,
                "electric_tailgate": true,
                "daytime_running_lights": "LED hình cánh chim"
              },
              "interior_features": {
                "subwoofer": true,
                "driver_seat": "Chỉnh điện 12 hướng, nhớ vị trí, sưởi và thông gió",
                "ambient_light": true,
                "seat_material": "Da nhân tạo",
                "audio_speakers": 10,
                "panoramic_roof": true,
                "steering_wheel": "Bọc da, có sưởi",
                "head_up_display": true,
                "air_conditioning": "Tự động 2 vùng, ion hóa không khí",
                "wireless_charging": true,
                "air_quality_control": true,
                "front_passenger_seat": "Chỉnh điện 10 hướng, sưởi và thông gió",
                "central_screen_inches": 15.6
              },
              "ground_clearance_mm": 157,
              "cargo_capacity_folded_liters": 1373,
              "standard_charger": "Sạc chậm AC công suất 11 kW",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "457 km sau mỗi lần sạc đầy theo tiêu chuẩn WLTP.",
              "regenerative_braking": "Có hệ thống phanh tái sinh năng lượng",
              "technical_specs_text": "Hai mô-tơ điện công suất 300 kW, tương đương 402 mã lực, mô-men xoắn 620 Nm.",
              "acceleration_0_50_seconds": "chưa công bố"
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "d1dd0427-2f7e-4454-90b7-fc0b5cb9b7cd",
    "code": "VF 9",
    "name": "VinFast VF 9 Eco",
    "tagline": "VinFast VF 9 Eco là mẫu SUV điện cỡ lớn 7 chỗ, trang bị hệ thống ADAS cấp độ 2, hệ thống treo đa liên kết và giảm chấn khí nén cầu sau.",
    "category": "suv",
    "image": "/static/uploads/cars/VF9_Plus.jpg",
    "basePrice": 1348000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 626,
    "battery": "123 kWh",
    "acceleration": "6.8s (0-50 km/h)",
    "topSpeed": 150,
    "seats": 7,
    "isNew": true,
    "colors": [
      "Trắng",
      "Đen",
      "Xám",
      "Bạc",
      "Đỏ",
      "Xanh Dương",
      "Xanh Lục"
    ],
    "description": "VinFast VF 9 Eco là mẫu SUV điện cỡ lớn 7 chỗ, trang bị hệ thống ADAS cấp độ 2, hệ thống treo đa liên kết và giảm chấn khí nén cầu sau.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "d1dd0427-2f7e-4454-90b7-fc0b5cb9b7cd",
      "id": "d1dd0427-2f7e-4454-90b7-fc0b5cb9b7cd",
      "model_name": "VinFast VF 9 Eco",
      "vehicle_line": "VF 9",
      "name": "VinFast VF 9 Eco",
      "code": "VF 9",
      "version": "Eco",
      "category": "Personal",
      "list_price": 1348000000,
      "base_price": 1348000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF9_Plus.jpg",
      "seat_count": 7,
      "length_mm": 5119,
      "width_mm": 2004,
      "height_mm": 1691,
      "wheelbase_mm": 3149,
      "range_km": 626,
      "maximum_power_kw": 300,
      "maximum_torque_nm": 620,
      "usable_battery_capacity": 123,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "d1dd0427-2f7e-4454-90b7-fc0b5cb9b7cd",
            "model_name": "VinFast VF 9"
          },
          "specifications": {
            "car_id": "d1dd0427-2f7e-4454-90b7-fc0b5cb9b7cd",
            "version": "Plus",
            "range_km": 626,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 1348000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 7,
            "motor_power_kw": 300,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 123,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                "Trắng",
                "Đen",
                "Xám",
                "Bạc",
                "Đỏ",
                "Xanh Dương",
                "Xanh Lục"
              ],
              "images": [],
              "width_mm": 2004,
              "height_mm": 1691,
              "length_mm": 5119,
              "wheelbase_mm": 3149,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hai cầu toàn thời gian AWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Hệ thống treo độc lập",
              "rear_suspension": "Hệ thống treo đa liên kết, giảm chấn khí nén cầu sau",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion CATL 123 kWh",
              "tires_wheels": "Mâm hợp kim 20 inch",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 10 năm hoặc 200.000 km, tùy điều kiện nào đến trước. Chính sách bảo hành pin áp dụng theo chính sách hiện hành của VinFast.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 402,
              "motor_torque_nm": 620,
              "price_info_text": "Giá niêm yết kèm pin: 1.348.000.000 VNĐ. Giá ưu đãi tham khảo: 1.280.600.000 VNĐ. Giá chưa bao gồm tùy chọn ghế cơ trưởng.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% khoảng 35 phút. Sạc AC tối đa 6,6 kW điện 1 pha hoặc 11 kW điện 3 pha.",
              "description_text": "VinFast VF 9 Eco là mẫu SUV điện cỡ lớn 7 chỗ, trang bị hệ thống ADAS cấp độ 2, hệ thống treo đa liên kết và giảm chấn khí nén cầu sau.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "rom": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 11,
                "anti_theft": true,
                "automatic_door_lock": true,
                "emergency_seat_belt": true
              },
              "driver_assistance_features": {
                "camera": "Camera 360 độ",
                "adas_level": 2,
                "highway_assist": true,
                "parking_assist": "Hỗ trợ đỗ xe trước và sau",
                "voice_assistant": "Trợ lý ảo VinFast tiếng Việt",
                "lane_keep_assist": true,
                "door_open_warning": true,
                "driver_monitoring": true,
                "adaptive_high_beam": true,
                "blind_spot_warning": true,
                "traffic_jam_assist": true,
                "emergency_lane_keep": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "intelligent_speed_assist": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "design": "Thiết kế bởi Pininfarina",
                "wheels": "Mâm hợp kim 20 inch",
                "mirrors": "Gương chỉnh điện, gập điện, sấy gương và tự động điều chỉnh khi lùi",
                "tailgate": "Cốp sau chỉnh điện",
                "headlights": "Đèn pha Full LED Matrix",
                "rear_lights": "Đèn hậu LED",
                "vehicle_type": "SUV điện cỡ lớn",
                "daytime_running_lights": "Dải đèn LED hình cánh chim VinFast"
              },
              "interior_features": {
                "hud": true,
                "audio": "Hệ thống âm thanh 11 loa",
                "seats": "7 chỗ",
                "screen": "Màn hình trung tâm cảm ứng 15,6 inch",
                "second_row": "Hàng ghế thứ hai chỉnh điện 4 hướng",
                "driver_seat": "Ghế lái chỉnh điện 8 hướng, có sưởi ghế",
                "passenger_seat": "Ghế phụ chỉnh điện 6 hướng, có sưởi ghế",
                "rear_air_vents": "Có cửa gió điều hòa cho hàng ghế thứ ba",
                "air_conditioning": "Điều hòa tự động 3 vùng, lọc không khí và ion hóa",
                "wireless_charging": true
              },
              "ground_clearance_mm": 197,
              "cargo_capacity_folded_liters": 926,
              "standard_charger": "Sạc AC tối đa 6,6 kW điện 1 pha hoặc 11 kW điện 3 pha",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "626 km theo tiêu chuẩn WLTP với phiên bản Eco sử dụng pin CATL. Quãng đường thực tế phụ thuộc điều kiện vận hành.",
              "regenerative_braking": "Phanh tái sinh 3 cấp độ",
              "technical_specs_text": "VinFast VF 9 Eco: công suất 300 kW, mô-men xoắn 620 Nm, pin CATL 123 kWh, tầm hoạt động 626 km WLTP, dẫn động AWD, 7 chỗ.",
              "acceleration_0_50_seconds": 6.8
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "d1dd0427-2f7e-4454-90b7-fc0b5cb9b7cd",
            "model_name": "VinFast VF 9"
          },
          "specifications": {
            "car_id": "d1dd0427-2f7e-4454-90b7-fc0b5cb9b7cd",
            "version": "Plus",
            "range_km": 626,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 1348000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 7,
            "motor_power_kw": 300,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 123,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                "Trắng",
                "Đen",
                "Xám",
                "Bạc",
                "Đỏ",
                "Xanh Dương",
                "Xanh Lục"
              ],
              "images": [],
              "width_mm": 2004,
              "height_mm": 1691,
              "length_mm": 5119,
              "wheelbase_mm": 3149,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hai cầu toàn thời gian AWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Hệ thống treo độc lập",
              "rear_suspension": "Hệ thống treo đa liên kết, giảm chấn khí nén cầu sau",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion CATL 123 kWh",
              "tires_wheels": "Mâm hợp kim 20 inch",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 10 năm hoặc 200.000 km, tùy điều kiện nào đến trước. Chính sách bảo hành pin áp dụng theo chính sách hiện hành của VinFast.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 402,
              "motor_torque_nm": 620,
              "price_info_text": "Giá niêm yết kèm pin: 1.348.000.000 VNĐ. Giá ưu đãi tham khảo: 1.280.600.000 VNĐ. Giá chưa bao gồm tùy chọn ghế cơ trưởng.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% khoảng 35 phút. Sạc AC tối đa 6,6 kW điện 1 pha hoặc 11 kW điện 3 pha.",
              "description_text": "VinFast VF 9 Eco là mẫu SUV điện cỡ lớn 7 chỗ, trang bị hệ thống ADAS cấp độ 2, hệ thống treo đa liên kết và giảm chấn khí nén cầu sau.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "rom": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 11,
                "anti_theft": true,
                "automatic_door_lock": true,
                "emergency_seat_belt": true
              },
              "driver_assistance_features": {
                "camera": "Camera 360 độ",
                "adas_level": 2,
                "highway_assist": true,
                "parking_assist": "Hỗ trợ đỗ xe trước và sau",
                "voice_assistant": "Trợ lý ảo VinFast tiếng Việt",
                "lane_keep_assist": true,
                "door_open_warning": true,
                "driver_monitoring": true,
                "adaptive_high_beam": true,
                "blind_spot_warning": true,
                "traffic_jam_assist": true,
                "emergency_lane_keep": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "intelligent_speed_assist": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "design": "Thiết kế bởi Pininfarina",
                "wheels": "Mâm hợp kim 20 inch",
                "mirrors": "Gương chỉnh điện, gập điện, sấy gương và tự động điều chỉnh khi lùi",
                "tailgate": "Cốp sau chỉnh điện",
                "headlights": "Đèn pha Full LED Matrix",
                "rear_lights": "Đèn hậu LED",
                "vehicle_type": "SUV điện cỡ lớn",
                "daytime_running_lights": "Dải đèn LED hình cánh chim VinFast"
              },
              "interior_features": {
                "hud": true,
                "audio": "Hệ thống âm thanh 11 loa",
                "seats": "7 chỗ",
                "screen": "Màn hình trung tâm cảm ứng 15,6 inch",
                "second_row": "Hàng ghế thứ hai chỉnh điện 4 hướng",
                "driver_seat": "Ghế lái chỉnh điện 8 hướng, có sưởi ghế",
                "passenger_seat": "Ghế phụ chỉnh điện 6 hướng, có sưởi ghế",
                "rear_air_vents": "Có cửa gió điều hòa cho hàng ghế thứ ba",
                "air_conditioning": "Điều hòa tự động 3 vùng, lọc không khí và ion hóa",
                "wireless_charging": true
              },
              "ground_clearance_mm": 197,
              "cargo_capacity_folded_liters": 926,
              "standard_charger": "Sạc AC tối đa 6,6 kW điện 1 pha hoặc 11 kW điện 3 pha",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "626 km theo tiêu chuẩn WLTP với phiên bản Eco sử dụng pin CATL. Quãng đường thực tế phụ thuộc điều kiện vận hành.",
              "regenerative_braking": "Phanh tái sinh 3 cấp độ",
              "technical_specs_text": "VinFast VF 9 Eco: công suất 300 kW, mô-men xoắn 620 Nm, pin CATL 123 kWh, tầm hoạt động 626 km WLTP, dẫn động AWD, 7 chỗ.",
              "acceleration_0_50_seconds": 6.8
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "85eabeaa-8674-4bf9-b7e9-ca99dbc002e2",
    "code": "VF 9",
    "name": "VinFast VF 9 Plus",
    "tagline": "VinFast VF 9 Plus là phiên bản cao cấp, có ghế cơ trưởng, trần kính Panorama, hệ thống âm thanh 13 loa và nhiều tính năng tiện nghi nâng cao.",
    "category": "suv",
    "image": "/static/uploads/cars/VF9_Plus.jpg",
    "basePrice": 1529000000,
    "batteryBuyPrice": null,
    "batteryRentMonthly": null,
    "range": 602,
    "battery": "123 kWh",
    "acceleration": "6.8s (0-50 km/h)",
    "topSpeed": 150,
    "seats": 7,
    "isNew": true,
    "colors": [
      "Trắng",
      "Đen",
      "Xám",
      "Bạc",
      "Đỏ",
      "Xanh Dương",
      "Xanh Lục"
    ],
    "description": "VinFast VF 9 Plus là phiên bản cao cấp, có ghế cơ trưởng, trần kính Panorama, hệ thống âm thanh 13 loa và nhiều tính năng tiện nghi nâng cao.",
    "highlights": [
      "Công nghệ VinFast tiên phong",
      "Trợ lý ảo Tiếng Việt ViVi",
      "Sạc siêu nhanh DC",
      "Bảo hành chính hãng 7-10 năm"
    ],
    "rawSpecs": {
      "car_id": "85eabeaa-8674-4bf9-b7e9-ca99dbc002e2",
      "id": "85eabeaa-8674-4bf9-b7e9-ca99dbc002e2",
      "model_name": "VinFast VF 9 Plus",
      "vehicle_line": "VF 9",
      "name": "VinFast VF 9 Plus",
      "code": "VF 9",
      "version": "Plus",
      "category": "Personal",
      "list_price": 1529000000,
      "base_price": 1529000000,
      "battery_buy_price": null,
      "battery_rent_monthly": null,
      "description": null,
      "image_url": "/static/uploads/cars/VF9_Plus.jpg",
      "seat_count": 7,
      "length_mm": 5119,
      "width_mm": 2004,
      "height_mm": 1697,
      "wheelbase_mm": 3149,
      "range_km": 602,
      "maximum_power_kw": 300,
      "maximum_torque_nm": 620,
      "usable_battery_capacity": 123,
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "85eabeaa-8674-4bf9-b7e9-ca99dbc002e2",
            "model_name": "VinFast VF 9"
          },
          "specifications": {
            "car_id": "85eabeaa-8674-4bf9-b7e9-ca99dbc002e2",
            "version": "Plus",
            "range_km": 602,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 1529000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 7,
            "motor_power_kw": 300,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 123,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                "Trắng",
                "Đen",
                "Xám",
                "Bạc",
                "Đỏ",
                "Xanh Dương",
                "Xanh Lục"
              ],
              "images": [],
              "width_mm": 2004,
              "height_mm": 1697,
              "length_mm": 5119,
              "wheelbase_mm": 3149,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hai cầu toàn thời gian AWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Hệ thống treo độc lập",
              "rear_suspension": "Hệ thống treo đa liên kết, giảm chấn khí nén cầu sau",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion CATL 123 kWh",
              "tires_wheels": "Mâm hợp kim 21 inch",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 10 năm hoặc 200.000 km, tùy điều kiện nào đến trước. Chính sách bảo hành pin áp dụng theo chính sách hiện hành của VinFast.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 402,
              "motor_torque_nm": 620,
              "price_info_text": "Giá niêm yết kèm pin: 1.529.000.000 VNĐ. Giá ưu đãi tham khảo: 1.452.550.000 VNĐ. Giá chưa bao gồm tùy chọn ghế cơ trưởng.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% khoảng 35 phút. Sạc AC tối đa 6,6 kW điện 1 pha hoặc 11 kW điện 3 pha.",
              "description_text": "VinFast VF 9 Plus là phiên bản cao cấp, có ghế cơ trưởng, trần kính Panorama, hệ thống âm thanh 13 loa và nhiều tính năng tiện nghi nâng cao.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "rom": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 11,
                "anti_theft": true,
                "automatic_door_lock": true,
                "emergency_seat_belt": true
              },
              "driver_assistance_features": {
                "camera": "Camera 360 độ",
                "adas_level": 2,
                "highway_assist": true,
                "parking_assist": "Hỗ trợ đỗ xe trước và sau",
                "voice_assistant": "Trợ lý ảo VinFast tiếng Việt",
                "lane_keep_assist": true,
                "automatic_parking": true,
                "door_open_warning": true,
                "driver_monitoring": true,
                "adaptive_high_beam": true,
                "blind_spot_warning": true,
                "traffic_jam_assist": true,
                "emergency_lane_keep": true,
                "automatic_lane_change": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "intelligent_speed_assist": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "design": "Thiết kế bởi Pininfarina",
                "wheels": "Mâm hợp kim 21 inch",
                "mirrors": "Gương chỉnh điện, gập điện, sấy gương, nhớ vị trí và tích hợp camera 360",
                "tailgate": "Cốp sau chỉnh điện, mở cốp rảnh tay",
                "headlights": "Đèn pha Full LED Matrix",
                "rear_lights": "Đèn hậu LED",
                "vehicle_type": "SUV điện cỡ lớn hạng sang",
                "panoramic_roof": "Trần kính toàn cảnh Panorama",
                "daytime_running_lights": "Dải đèn LED hình cánh chim VinFast"
              },
              "interior_features": {
                "hud": true,
                "audio": "Hệ thống âm thanh 13 loa kèm loa trầm và ampli",
                "seats": "7 chỗ tiêu chuẩn hoặc 6 chỗ với ghế cơ trưởng",
                "screen": "Màn hình trung tâm cảm ứng 15,6 inch",
                "second_row": "Hàng ghế thứ hai chỉnh điện 8 hướng, có sưởi, thông gió và massage",
                "driver_seat": "Ghế lái chỉnh điện 12 hướng, nhớ vị trí, sưởi, thông gió và massage",
                "rear_screen": "Màn hình cảm ứng 8 inch cho hàng ghế thứ hai",
                "ambient_light": "Đèn viền nội thất đa màu",
                "captain_seats": "Tùy chọn ghế cơ trưởng cho cấu hình 6 chỗ",
                "passenger_seat": "Ghế phụ chỉnh điện 10 hướng, sưởi, thông gió và massage",
                "rear_air_vents": "Có cửa gió điều hòa cho hàng ghế thứ ba",
                "air_conditioning": "Điều hòa tự động 3 vùng, lọc không khí và ion hóa",
                "wireless_charging": true
              },
              "ground_clearance_mm": 197,
              "cargo_capacity_folded_liters": 926,
              "standard_charger": "Sạc AC tối đa 6,6 kW điện 1 pha hoặc 11 kW điện 3 pha",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "602 km theo tiêu chuẩn WLTP với phiên bản Plus sử dụng pin CATL. Có thể tùy chọn cấu hình 6 chỗ với ghế cơ trưởng.",
              "regenerative_braking": "Phanh tái sinh 3 cấp độ",
              "technical_specs_text": "VinFast VF 9 Plus: công suất 300 kW, mô-men xoắn 620 Nm, pin CATL 123 kWh, tầm hoạt động 602 km WLTP, dẫn động AWD, cấu hình 7 chỗ hoặc 6 chỗ.",
              "acceleration_0_50_seconds": 6.8
            }
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "car_id": "85eabeaa-8674-4bf9-b7e9-ca99dbc002e2",
            "model_name": "VinFast VF 9"
          },
          "specifications": {
            "car_id": "85eabeaa-8674-4bf9-b7e9-ca99dbc002e2",
            "version": "Plus",
            "range_km": 602,
            "body_type": "A-SUV",
            "fuel_type": "Điện",
            "is_active": true,
            "list_price": 1529000000,
            "model_year": 2023,
            "payload_kg": 325,
            "seat_count": 7,
            "motor_power_kw": 300,
            "maximum_speed_kmh": 130,
            "battery_capacity_kwh": 123,
            "cargo_capacity_liters": 260,
            "charging_time_minutes": 33,
            "additional_specs": {
              "colors": [
                "Trắng",
                "Đen",
                "Xám",
                "Bạc",
                "Đỏ",
                "Xanh Dương",
                "Xanh Lục"
              ],
              "images": [],
              "width_mm": 2004,
              "height_mm": 1697,
              "length_mm": 5119,
              "wheelbase_mm": 3149,
              "created_at": "2026-07-31T07:52:35.004559+00:00",
              "updated_at": "2026-07-31T08:02:22.742045+00:00",
              "drivetrain": "Hai cầu toàn thời gian AWD",
              "front_brake": "Phanh đĩa thông gió",
              "rear_brake": "Phanh đĩa thông gió",
              "front_suspension": "Hệ thống treo độc lập",
              "rear_suspension": "Hệ thống treo đa liên kết, giảm chấn khí nén cầu sau",
              "engine_type": "Động cơ điện",
              "battery_type": "Pin Lithium-ion CATL 123 kWh",
              "tires_wheels": "Mâm hợp kim 21 inch",
              "transmission": "Hộp số đơn cấp",
              "warranty_text": "Bảo hành xe 10 năm hoặc 200.000 km, tùy điều kiện nào đến trước. Chính sách bảo hành pin áp dụng theo chính sách hiện hành của VinFast.",
              "curb_weight_kg": 1340,
              "motor_power_hp": 402,
              "motor_torque_nm": 620,
              "price_info_text": "Giá niêm yết kèm pin: 1.529.000.000 VNĐ. Giá ưu đãi tham khảo: 1.452.550.000 VNĐ. Giá chưa bao gồm tùy chọn ghế cơ trưởng.",
              "charging_info_text": "Sạc nhanh DC từ 10% đến 70% khoảng 35 phút. Sạc AC tối đa 6,6 kW điện 1 pha hoặc 11 kW điện 3 pha.",
              "description_text": "VinFast VF 9 Plus là phiên bản cao cấp, có ghế cơ trưởng, trần kính Panorama, hệ thống âm thanh 13 loa và nhiều tính năng tiện nghi nâng cao.",
              "safety_features": {
                "ba": true,
                "abs": true,
                "ebd": true,
                "esc": true,
                "hsa": true,
                "rom": true,
                "tcs": true,
                "tpms": true,
                "isofix": true,
                "airbags": 11,
                "anti_theft": true,
                "automatic_door_lock": true,
                "emergency_seat_belt": true
              },
              "driver_assistance_features": {
                "camera": "Camera 360 độ",
                "adas_level": 2,
                "highway_assist": true,
                "parking_assist": "Hỗ trợ đỗ xe trước và sau",
                "voice_assistant": "Trợ lý ảo VinFast tiếng Việt",
                "lane_keep_assist": true,
                "automatic_parking": true,
                "door_open_warning": true,
                "driver_monitoring": true,
                "adaptive_high_beam": true,
                "blind_spot_warning": true,
                "traffic_jam_assist": true,
                "emergency_lane_keep": true,
                "automatic_lane_change": true,
                "lane_departure_warning": true,
                "adaptive_cruise_control": true,
                "intelligent_speed_assist": true,
                "rear_cross_traffic_alert": true,
                "traffic_sign_recognition": true,
                "forward_collision_warning": true,
                "automatic_emergency_braking": true
              },
              "exterior_features": {
                "design": "Thiết kế bởi Pininfarina",
                "wheels": "Mâm hợp kim 21 inch",
                "mirrors": "Gương chỉnh điện, gập điện, sấy gương, nhớ vị trí và tích hợp camera 360",
                "tailgate": "Cốp sau chỉnh điện, mở cốp rảnh tay",
                "headlights": "Đèn pha Full LED Matrix",
                "rear_lights": "Đèn hậu LED",
                "vehicle_type": "SUV điện cỡ lớn hạng sang",
                "panoramic_roof": "Trần kính toàn cảnh Panorama",
                "daytime_running_lights": "Dải đèn LED hình cánh chim VinFast"
              },
              "interior_features": {
                "hud": true,
                "audio": "Hệ thống âm thanh 13 loa kèm loa trầm và ampli",
                "seats": "7 chỗ tiêu chuẩn hoặc 6 chỗ với ghế cơ trưởng",
                "screen": "Màn hình trung tâm cảm ứng 15,6 inch",
                "second_row": "Hàng ghế thứ hai chỉnh điện 8 hướng, có sưởi, thông gió và massage",
                "driver_seat": "Ghế lái chỉnh điện 12 hướng, nhớ vị trí, sưởi, thông gió và massage",
                "rear_screen": "Màn hình cảm ứng 8 inch cho hàng ghế thứ hai",
                "ambient_light": "Đèn viền nội thất đa màu",
                "captain_seats": "Tùy chọn ghế cơ trưởng cho cấu hình 6 chỗ",
                "passenger_seat": "Ghế phụ chỉnh điện 10 hướng, sưởi, thông gió và massage",
                "rear_air_vents": "Có cửa gió điều hòa cho hàng ghế thứ ba",
                "air_conditioning": "Điều hòa tự động 3 vùng, lọc không khí và ion hóa",
                "wireless_charging": true
              },
              "ground_clearance_mm": 197,
              "cargo_capacity_folded_liters": 926,
              "standard_charger": "Sạc AC tối đa 6,6 kW điện 1 pha hoặc 11 kW điện 3 pha",
              "turning_diameter_m": "chưa công bố",
              "roof_load_capacity_kg": "chưa công bố",
              "dc_charge_from_percent": 10,
              "dc_charge_to_percent": 70,
              "range_condition_text": "602 km theo tiêu chuẩn WLTP với phiên bản Plus sử dụng pin CATL. Có thể tùy chọn cấu hình 6 chỗ với ghế cơ trưởng.",
              "regenerative_braking": "Phanh tái sinh 3 cấp độ",
              "technical_specs_text": "VinFast VF 9 Plus: công suất 300 kW, mô-men xoắn 620 Nm, pin CATL 123 kWh, tầm hoạt động 602 km WLTP, dẫn động AWD, cấu hình 7 chỗ hoặc 6 chỗ.",
              "acceleration_0_50_seconds": 6.8
            }
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-05T17:05:37.395004Z",
      "updated_at": "2026-08-09T14:26:25.907424Z"
    }
  },
  {
    "id": "e3f05172-145a-4192-911b-65a396873d3c",
    "code": "Amio",
    "name": "VinFast Amio Tiêu chuẩn",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Amio.jpg",
    "basePrice": 11600000,
    "range": 65,
    "battery": "Lithium Iron Phosphate (LFP)",
    "acceleration": "Vận tốc max: 30 km/h",
    "topSpeed": 30,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đỏ",
      "Trắng",
      "Xám",
      "Đen",
      "Xanh"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 800W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "e3f05172-145a-4192-911b-65a396873d3c",
      "id": "e3f05172-145a-4192-911b-65a396873d3c",
      "model_name": "VinFast Amio Tiêu chuẩn",
      "vehicle_line": "Amio",
      "name": "VinFast Amio Tiêu chuẩn",
      "code": "Amio",
      "version": "Tiêu chuẩn",
      "category": "motorbike",
      "list_price": 11600000,
      "base_price": 11600000,
      "colors": [
        "Đỏ",
        "Trắng",
        "Xám",
        "Đen",
        "Xanh"
      ],
      "image_url": "/static/uploads/motorbikes/Amio.jpg",
      "range_km": 65,
      "charging_time_minutes": 360,
      "battery_type": "Lithium Iron Phosphate (LFP)",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.024,
      "motor_type": "Động cơ điện Inhub",
      "maximum_power_w": 800,
      "maximum_speed_kmh": 30,
      "weight_kg": null,
      "length_mm": 1910,
      "width_mm": 692,
      "height_mm": 1083,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "motorbike_id": "e3f05172-145a-4192-911b-65a396873d3c",
            "model_name": "VinFast Amio"
          },
          "specifications": {
            "additional_specs": {
              "description_text": "Xe máy điện nhỏ gọn dành cho nhu cầu di chuyển đô thị.",
              "front_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "rear_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "warranty_text": "Bảo hành xe 6 năm, không giới hạn quãng đường.",
              "colors": [
                "Đỏ",
                "Trắng",
                "Xám",
                "Đen",
                "Xanh"
              ]
            },
            "motorbike_id": "e3f05172-145a-4192-911b-65a396873d3c",
            "version": "Tiêu chuẩn",
            "range_km": 65,
            "width_mm": 692,
            "height_mm": 1083,
            "length_mm": 1910,
            "is_active": true,
            "list_price": 11600000,
            "model_year": 2024,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "wet_weight_kg": 150,
            "charger_power_w": 400,
            "battery_quantity": 1,
            "maximum_speed_kmh": 30,
            "removable_battery": true,
            "battery_capacity_kwh": 1.024,
            "charging_time_minutes": 360,
            "maximum_motor_power_w": 800,
            "battery_swap_supported": true,
            "underseat_storage_liters": 22
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "motorbike_id": "e3f05172-145a-4192-911b-65a396873d3c",
            "model_name": "VinFast Amio"
          },
          "specifications": {
            "additional_specs": {
              "description_text": "Xe máy điện nhỏ gọn dành cho nhu cầu di chuyển đô thị.",
              "front_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "rear_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "warranty_text": "Bảo hành xe 6 năm, không giới hạn quãng đường.",
              "colors": [
                "Đỏ",
                "Trắng",
                "Xám",
                "Đen",
                "Xanh"
              ]
            },
            "motorbike_id": "e3f05172-145a-4192-911b-65a396873d3c",
            "version": "Tiêu chuẩn",
            "range_km": 65,
            "width_mm": 692,
            "height_mm": 1083,
            "length_mm": 1910,
            "is_active": true,
            "list_price": 11600000,
            "model_year": 2024,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "wet_weight_kg": 150,
            "charger_power_w": 400,
            "battery_quantity": 1,
            "maximum_speed_kmh": 30,
            "removable_battery": true,
            "battery_capacity_kwh": 1.024,
            "charging_time_minutes": 360,
            "maximum_motor_power_w": 800,
            "battery_swap_supported": true,
            "underseat_storage_liters": 22
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "51b1fcdc-c1e1-4bfe-b410-ea6be3a8b616",
    "code": "Amio S",
    "name": "VinFast Amio S",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Amio_S.jpg",
    "basePrice": 11600000,
    "range": 65,
    "battery": "Lithium Iron Phosphate (LFP)",
    "acceleration": "Vận tốc max: 25 km/h",
    "topSpeed": 25,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đỏ tươi",
      "Trắng ngọc trai",
      "Xám xi măng",
      "Đen bóng",
      "Xanh ngọc"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 800W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "51b1fcdc-c1e1-4bfe-b410-ea6be3a8b616",
      "id": "51b1fcdc-c1e1-4bfe-b410-ea6be3a8b616",
      "model_name": "VinFast Amio S",
      "vehicle_line": "Amio S",
      "name": "VinFast Amio S",
      "code": "Amio S",
      "version": "Amio S",
      "category": "motorbike",
      "list_price": 11600000,
      "base_price": 11600000,
      "colors": [
        "Đỏ tươi",
        "Trắng ngọc trai",
        "Xám xi măng",
        "Đen bóng",
        "Xanh ngọc"
      ],
      "image_url": "/static/uploads/motorbikes/Amio_S.jpg",
      "range_km": 65,
      "charging_time_minutes": 360,
      "battery_type": "Lithium Iron Phosphate (LFP)",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.024,
      "motor_type": "Động cơ điện Inhub",
      "maximum_power_w": 800,
      "maximum_speed_kmh": 25,
      "weight_kg": null,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast",
            "motorbike_id": "51b1fcdc-c1e1-4bfe-b410-ea6be3a8b616"
          },
          "specifications": {
            "version": "Amio S",
            "range_km": 65,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 11600000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "51b1fcdc-c1e1-4bfe-b410-ea6be3a8b616",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đỏ tươi",
                "Trắng ngọc trai",
                "Xám xi măng",
                "Đen bóng",
                "Xanh ngọc"
              ],
              "images": [],
              "rear_tire": "10 x 3.0",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "10 x 3.0",
              "rear_brake": "Phanh cơ",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "Phanh cơ",
              "source_refs": [],
              "warranty_text": "Bảo hành xe 6 năm, không giới hạn quãng đường.",
              "price_info_text": "Giá đã bao gồm VAT, 01 pin và bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Đặt dưới sàn để chân",
              "description_text": "Xe máy điện học sinh, tốc độ tối đa khoảng 25 km/h.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "LED",
                "turn_signal": "LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 6 giờ.",
              "technology_features": {
                "lock": "Khóa cơ",
                "display": "LED Color",
                "license_required": false
              },
              "range_condition_text": "Đo ở tốc độ 25 km/h, tải trọng 1 người 65 kg.",
              "technical_specs_text": "Động cơ Inhub; công suất định mức khoảng 240 W; công suất tối đa khoảng 800 W.",
              "battery_capacity_text": "Pin LFP 1,024 kWh"
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 25,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.024,
            "charging_time_minutes": 360,
            "maximum_motor_power_w": 800,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast",
            "motorbike_id": "51b1fcdc-c1e1-4bfe-b410-ea6be3a8b616"
          },
          "specifications": {
            "version": "Amio S",
            "range_km": 65,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 11600000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "51b1fcdc-c1e1-4bfe-b410-ea6be3a8b616",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đỏ tươi",
                "Trắng ngọc trai",
                "Xám xi măng",
                "Đen bóng",
                "Xanh ngọc"
              ],
              "images": [],
              "rear_tire": "10 x 3.0",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "10 x 3.0",
              "rear_brake": "Phanh cơ",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "Phanh cơ",
              "source_refs": [],
              "warranty_text": "Bảo hành xe 6 năm, không giới hạn quãng đường.",
              "price_info_text": "Giá đã bao gồm VAT, 01 pin và bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Đặt dưới sàn để chân",
              "description_text": "Xe máy điện học sinh, tốc độ tối đa khoảng 25 km/h.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "LED",
                "turn_signal": "LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 6 giờ.",
              "technology_features": {
                "lock": "Khóa cơ",
                "display": "LED Color",
                "license_required": false
              },
              "range_condition_text": "Đo ở tốc độ 25 km/h, tải trọng 1 người 65 kg.",
              "technical_specs_text": "Động cơ Inhub; công suất định mức khoảng 240 W; công suất tối đa khoảng 800 W.",
              "battery_capacity_text": "Pin LFP 1,024 kWh"
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 25,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.024,
            "charging_time_minutes": 360,
            "maximum_motor_power_w": 800,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "eb42f46a-ae7e-4684-9380-5aa5d508e6eb",
    "code": "Amio S2",
    "name": "VinFast Amio S2",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Amio_S2.jpg",
    "basePrice": 12000000,
    "range": 65,
    "battery": "Lithium Iron Phosphate (LFP)",
    "acceleration": "Vận tốc max: 25 km/h",
    "topSpeed": 25,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đen bóng",
      "Trắng đen",
      "Đỏ tươi",
      "Xanh ngọc",
      "Trắng tím"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 800W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "eb42f46a-ae7e-4684-9380-5aa5d508e6eb",
      "id": "eb42f46a-ae7e-4684-9380-5aa5d508e6eb",
      "model_name": "VinFast Amio S2",
      "vehicle_line": "Amio S2",
      "name": "VinFast Amio S2",
      "code": "Amio S2",
      "version": "Amio S2",
      "category": "motorbike",
      "list_price": 12000000,
      "base_price": 12000000,
      "colors": [
        "Đen bóng",
        "Trắng đen",
        "Đỏ tươi",
        "Xanh ngọc",
        "Trắng tím"
      ],
      "image_url": "/static/uploads/motorbikes/Amio_S2.jpg",
      "range_km": 65,
      "charging_time_minutes": 360,
      "battery_type": "Lithium Iron Phosphate (LFP)",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.024,
      "motor_type": "Động cơ điện Inhub",
      "maximum_power_w": 800,
      "maximum_speed_kmh": 25,
      "weight_kg": null,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast",
            "motorbike_id": "eb42f46a-ae7e-4684-9380-5aa5d508e6eb"
          },
          "specifications": {
            "version": "Amio S2",
            "range_km": 65,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 12000000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "eb42f46a-ae7e-4684-9380-5aa5d508e6eb",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đen bóng",
                "Trắng đen",
                "Đỏ tươi",
                "Xanh ngọc",
                "Trắng tím"
              ],
              "images": [],
              "rear_tire": "10 x 3.0",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "10 x 3.0",
              "rear_brake": "Phanh cơ",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "Phanh cơ",
              "source_refs": [],
              "warranty_text": "Bảo hành xe 6 năm, không giới hạn quãng đường.",
              "price_info_text": "Giá đã bao gồm VAT, 01 pin và bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Đặt dưới sàn để chân",
              "description_text": "Xe máy điện học sinh phiên bản Amio S2.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "LED",
                "turn_signal": "LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 6 giờ.",
              "technology_features": {
                "lock": "Chưa xác nhận loại khóa",
                "display": "LED Color"
              },
              "range_condition_text": "Đo ở tốc độ 25 km/h, tải trọng 1 người 65 kg.",
              "technical_specs_text": "Động cơ Inhub; công suất tối đa khoảng 800 W; tốc độ tối đa 25 km/h.",
              "battery_capacity_text": "Pin LFP 1,024 kWh"
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 25,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.024,
            "charging_time_minutes": 360,
            "maximum_motor_power_w": 800,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast",
            "motorbike_id": "eb42f46a-ae7e-4684-9380-5aa5d508e6eb"
          },
          "specifications": {
            "version": "Amio S2",
            "range_km": 65,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 12000000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "eb42f46a-ae7e-4684-9380-5aa5d508e6eb",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đen bóng",
                "Trắng đen",
                "Đỏ tươi",
                "Xanh ngọc",
                "Trắng tím"
              ],
              "images": [],
              "rear_tire": "10 x 3.0",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "10 x 3.0",
              "rear_brake": "Phanh cơ",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "Phanh cơ",
              "source_refs": [],
              "warranty_text": "Bảo hành xe 6 năm, không giới hạn quãng đường.",
              "price_info_text": "Giá đã bao gồm VAT, 01 pin và bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Đặt dưới sàn để chân",
              "description_text": "Xe máy điện học sinh phiên bản Amio S2.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "LED",
                "turn_signal": "LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 6 giờ.",
              "technology_features": {
                "lock": "Chưa xác nhận loại khóa",
                "display": "LED Color"
              },
              "range_condition_text": "Đo ở tốc độ 25 km/h, tải trọng 1 người 65 kg.",
              "technical_specs_text": "Động cơ Inhub; công suất tối đa khoảng 800 W; tốc độ tối đa 25 km/h.",
              "battery_capacity_text": "Pin LFP 1,024 kWh"
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 25,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.024,
            "charging_time_minutes": 360,
            "maximum_motor_power_w": 800,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "7a5f9251-d80f-496b-a24c-35d699dcf85a",
    "code": "ZGoo",
    "name": "VinFast ZGoo Tiêu chuẩn",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/ZGoo.jpg",
    "basePrice": 13300000,
    "range": 70,
    "battery": "Lithium Iron Phosphate (LFP)",
    "acceleration": "Vận tốc max: 39 km/h",
    "topSpeed": 39,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đỏ tươi - Đen nhám",
      "Đen bóng",
      "Xanh rêu",
      "Trắng ngọc trai"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 1100W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "7a5f9251-d80f-496b-a24c-35d699dcf85a",
      "id": "7a5f9251-d80f-496b-a24c-35d699dcf85a",
      "model_name": "VinFast ZGoo Tiêu chuẩn",
      "vehicle_line": "ZGoo",
      "name": "VinFast ZGoo Tiêu chuẩn",
      "code": "ZGoo",
      "version": "Tiêu chuẩn",
      "category": "motorbike",
      "list_price": 13300000,
      "base_price": 13300000,
      "colors": [
        "Đỏ tươi - Đen nhám",
        "Đen bóng",
        "Xanh rêu",
        "Trắng ngọc trai"
      ],
      "image_url": "/static/uploads/motorbikes/ZGoo.jpg",
      "range_km": 70,
      "charging_time_minutes": 390,
      "battery_type": "Lithium Iron Phosphate (LFP)",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.2,
      "motor_type": "Động cơ điện Inhub",
      "maximum_power_w": 1100,
      "maximum_speed_kmh": 39,
      "weight_kg": null,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast ZGoo",
            "motorbike_id": "7a5f9251-d80f-496b-a24c-35d699dcf85a"
          },
          "specifications": {
            "version": "Tiêu chuẩn",
            "range_km": 70,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 13300000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "7a5f9251-d80f-496b-a24c-35d699dcf85a",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đỏ tươi - Đen nhám",
                "Đen bóng",
                "Xanh rêu",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "10 x 3.0",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "10 x 3.0",
              "rear_brake": "Phanh cơ",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "Phanh cơ",
              "source_refs": [],
              "warranty_text": "Bảo hành xe 6 năm, không giới hạn quãng đường.",
              "price_info_text": "Giá đã bao gồm VAT, 01 pin LFP 1,2 kWh và bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Cố định dưới sàn để chân",
              "description_text": "Xe máy điện đô thị nhỏ gọn, không yêu cầu bằng lái.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "LED Projector",
                "rear_light": "LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 6 giờ 30 phút.",
              "technology_features": {
                "display": "HMI LED Color",
                "license_required": false
              },
              "range_condition_text": "Đo ở tốc độ 30 km/h theo điều kiện kiểm thử của VinFast.",
              "technical_specs_text": "Động cơ Inhub; công suất định mức 600 W; công suất tối đa 1100 W; tốc độ tối đa 39 km/h.",
              "battery_capacity_text": "Pin LFP 1,2 kWh"
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 39,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.2,
            "charging_time_minutes": 390,
            "maximum_motor_power_w": 1100,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast ZGoo",
            "motorbike_id": "7a5f9251-d80f-496b-a24c-35d699dcf85a"
          },
          "specifications": {
            "version": "Tiêu chuẩn",
            "range_km": 70,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 13300000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "7a5f9251-d80f-496b-a24c-35d699dcf85a",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đỏ tươi - Đen nhám",
                "Đen bóng",
                "Xanh rêu",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "10 x 3.0",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "10 x 3.0",
              "rear_brake": "Phanh cơ",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "Phanh cơ",
              "source_refs": [],
              "warranty_text": "Bảo hành xe 6 năm, không giới hạn quãng đường.",
              "price_info_text": "Giá đã bao gồm VAT, 01 pin LFP 1,2 kWh và bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Cố định dưới sàn để chân",
              "description_text": "Xe máy điện đô thị nhỏ gọn, không yêu cầu bằng lái.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "LED Projector",
                "rear_light": "LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 6 giờ 30 phút.",
              "technology_features": {
                "display": "HMI LED Color",
                "license_required": false
              },
              "range_condition_text": "Đo ở tốc độ 30 km/h theo điều kiện kiểm thử của VinFast.",
              "technical_specs_text": "Động cơ Inhub; công suất định mức 600 W; công suất tối đa 1100 W; tốc độ tối đa 39 km/h.",
              "battery_capacity_text": "Pin LFP 1,2 kWh"
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 39,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.2,
            "charging_time_minutes": 390,
            "maximum_motor_power_w": 1100,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "4cfc0636-edb7-4326-bc92-c3e115cb517f",
    "code": "Evo Lite Neo",
    "name": "VinFast Evo Lite Neo Kèm ắc quy",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Evo_lite_neo.jpg",
    "basePrice": 14400000,
    "range": 78,
    "battery": "Ắc quy chì axit kín khí",
    "acceleration": "Vận tốc max: 49 km/h",
    "topSpeed": 49,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đen nhám",
      "Đỏ tươi",
      "Xanh tím than",
      "Xanh rêu",
      "Trắng ngọc trai"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 1600W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "4cfc0636-edb7-4326-bc92-c3e115cb517f",
      "id": "4cfc0636-edb7-4326-bc92-c3e115cb517f",
      "model_name": "VinFast Evo Lite Neo Kèm ắc quy",
      "vehicle_line": "Evo Lite Neo",
      "name": "VinFast Evo Lite Neo Kèm ắc quy",
      "code": "Evo Lite Neo",
      "version": "Kèm ắc quy",
      "category": "motorbike",
      "list_price": 14400000,
      "base_price": 14400000,
      "colors": [
        "Đen nhám",
        "Đỏ tươi",
        "Xanh tím than",
        "Xanh rêu",
        "Trắng ngọc trai"
      ],
      "image_url": "/static/uploads/motorbikes/Evo_lite_neo.jpg",
      "range_km": 78,
      "charging_time_minutes": 600,
      "battery_type": "Ắc quy chì axit kín khí",
      "battery_quantity": 5,
      "battery_capacity_kwh": 1.26,
      "motor_type": "Động cơ Inhub BLDC",
      "maximum_power_w": 1600,
      "maximum_speed_kmh": 49,
      "weight_kg": 105,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Evo Lite Neo",
            "motorbike_id": "4cfc0636-edb7-4326-bc92-c3e115cb517f"
          },
          "specifications": {
            "version": "Kèm ắc quy",
            "range_km": 78,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 14400000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub BLDC",
            "battery_type": "Ắc quy chì axit kín khí",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "4cfc0636-edb7-4326-bc92-c3e115cb517f",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đen nhám",
                "Đỏ tươi",
                "Xanh tím than",
                "Xanh rêu",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "Phanh tang trống",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "Phanh đĩa",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá niêm yết: 14.400.000 VNĐ, đã bao gồm VAT, 1 bộ sạc và ắc quy.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Ắc quy cố định dưới sàn để chân.",
              "description_text": "VinFast Evo Lite Neo là xe máy điện giới hạn tốc độ, sử dụng ắc quy chì axit và phù hợp người dùng không có bằng lái.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Đèn Full LED và đèn pha Projector",
                "tail_light": "Đèn hậu LED",
                "turn_signal": "Đèn xi-nhan LED"
              },
              "charging_info_text": "Sạc bằng bộ sạc 220 W, khoảng 8 giờ đạt 80% và khoảng 10 giờ đạt 100%.",
              "technology_features": {
                "display": "Màn hình HMI kỹ thuật số 4,5 inch",
                "battery_type": "Ắc quy chì axit kín khí",
                "license_requirement": "Không yêu cầu bằng lái do tốc độ tối đa 49 km/h"
              },
              "range_condition_text": "Khoảng 78 km cho 1 lần sạc theo điều kiện kiểm thử của VinFast.",
              "technical_specs_text": "VinFast Evo Lite Neo sử dụng động cơ BLDC Inhub công suất định mức 1.200 W, công suất tối đa 1.600 W, ắc quy chì axit 1,26 kWh và tốc độ tối đa 49 km/h.",
              "battery_capacity_text": "5 bình ắc quy chì axit 12V–21Ah mắc nối tiếp."
            },
            "battery_quantity": 5,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 49,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.26,
            "charging_time_minutes": 600,
            "maximum_motor_power_w": 1600,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Evo Lite Neo",
            "motorbike_id": "4cfc0636-edb7-4326-bc92-c3e115cb517f"
          },
          "specifications": {
            "version": "Kèm ắc quy",
            "range_km": 78,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 14400000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub BLDC",
            "battery_type": "Ắc quy chì axit kín khí",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "4cfc0636-edb7-4326-bc92-c3e115cb517f",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đen nhám",
                "Đỏ tươi",
                "Xanh tím than",
                "Xanh rêu",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "Phanh tang trống",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "Phanh đĩa",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá niêm yết: 14.400.000 VNĐ, đã bao gồm VAT, 1 bộ sạc và ắc quy.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Ắc quy cố định dưới sàn để chân.",
              "description_text": "VinFast Evo Lite Neo là xe máy điện giới hạn tốc độ, sử dụng ắc quy chì axit và phù hợp người dùng không có bằng lái.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Đèn Full LED và đèn pha Projector",
                "tail_light": "Đèn hậu LED",
                "turn_signal": "Đèn xi-nhan LED"
              },
              "charging_info_text": "Sạc bằng bộ sạc 220 W, khoảng 8 giờ đạt 80% và khoảng 10 giờ đạt 100%.",
              "technology_features": {
                "display": "Màn hình HMI kỹ thuật số 4,5 inch",
                "battery_type": "Ắc quy chì axit kín khí",
                "license_requirement": "Không yêu cầu bằng lái do tốc độ tối đa 49 km/h"
              },
              "range_condition_text": "Khoảng 78 km cho 1 lần sạc theo điều kiện kiểm thử của VinFast.",
              "technical_specs_text": "VinFast Evo Lite Neo sử dụng động cơ BLDC Inhub công suất định mức 1.200 W, công suất tối đa 1.600 W, ắc quy chì axit 1,26 kWh và tốc độ tối đa 49 km/h.",
              "battery_capacity_text": "5 bình ắc quy chì axit 12V–21Ah mắc nối tiếp."
            },
            "battery_quantity": 5,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 49,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.26,
            "charging_time_minutes": 600,
            "maximum_motor_power_w": 1600,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "4897a89d-0b2f-43e9-a6a6-b892b1d1273a",
    "code": "Flazz",
    "name": "VinFast Flazz Tiêu chuẩn",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Flazz.jpg",
    "basePrice": 16000000,
    "range": 135,
    "battery": "Lithium Iron Phosphate (LFP)",
    "acceleration": "Vận tốc max: 39 km/h",
    "topSpeed": 39,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đỏ tươi",
      "Đen nhám",
      "Đen bóng",
      "Xanh rêu",
      "Trắng ngọc trai"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 2000W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "4897a89d-0b2f-43e9-a6a6-b892b1d1273a",
      "id": "4897a89d-0b2f-43e9-a6a6-b892b1d1273a",
      "model_name": "VinFast Flazz Tiêu chuẩn",
      "vehicle_line": "Flazz",
      "name": "VinFast Flazz Tiêu chuẩn",
      "code": "Flazz",
      "version": "Tiêu chuẩn",
      "category": "motorbike",
      "list_price": 16000000,
      "base_price": 16000000,
      "colors": [
        "Đỏ tươi",
        "Đen nhám",
        "Đen bóng",
        "Xanh rêu",
        "Trắng ngọc trai"
      ],
      "image_url": "/static/uploads/motorbikes/Flazz.jpg",
      "range_km": 135,
      "charging_time_minutes": 390,
      "battery_type": "Lithium Iron Phosphate (LFP)",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.2,
      "motor_type": "",
      "maximum_power_w": null,
      "maximum_speed_kmh": 39,
      "weight_kg": null,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Flazz",
            "motorbike_id": "4897a89d-0b2f-43e9-a6a6-b892b1d1273a"
          },
          "specifications": {
            "version": "Tiêu chuẩn",
            "range_km": 135,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 16000000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "4897a89d-0b2f-43e9-a6a6-b892b1d1273a",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đỏ tươi",
                "Đen nhám",
                "Đen bóng",
                "Xanh rêu",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "Bảo hành xe 6 năm; bảo hành pin 8 năm.",
              "price_info_text": "Giá đã bao gồm VAT, 01 pin LFP 1,2 kWh và bộ sạc.",
              "rear_suspension": "Phuộc trước dạng ống lồng; thông tin giảm xóc sau chưa được VinFast công bố rõ trên trang sản phẩm.",
              "battery_location": "Pin chính đặt cố định dưới sàn để chân; có thể sử dụng thêm pin phụ.",
              "description_text": "Xe máy điện compact đô thị, không yêu cầu giấy phép lái xe.",
              "front_suspension": "chưa công bố",
              "lighting_features": {
                "headlight": "Đèn LED",
                "rear_light": "Đèn hậu LED",
                "turn_signal": "Đèn xi-nhan LED"
              },
              "charging_info_text": "Sạc điện tại nhà; thời gian sạc đầy khoảng 6 giờ 30 phút.",
              "technology_features": {
                "smartphone_app": "VinFast e-Scooter",
                "digital_display": true,
                "license_required": false
              },
              "range_condition_text": "Khoảng 70 km với pin chính; tổng khoảng 135 km khi sử dụng pin phụ theo điều kiện công bố của VinFast.",
              "technical_specs_text": "Động cơ điện; pin LFP 1,2 kWh; tốc độ tối đa khoảng 39 km/h; kích thước 1745 x 700 x 1050 mm; dung tích cốp khoảng 14 lít.",
              "battery_capacity_text": "Pin Lithium Iron Phosphate (LFP), dung lượng 1,2 kWh."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 39,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.2,
            "charging_time_minutes": 390,
            "maximum_motor_power_w": 2300,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Flazz",
            "motorbike_id": "4897a89d-0b2f-43e9-a6a6-b892b1d1273a"
          },
          "specifications": {
            "version": "Tiêu chuẩn",
            "range_km": 135,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 16000000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "4897a89d-0b2f-43e9-a6a6-b892b1d1273a",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đỏ tươi",
                "Đen nhám",
                "Đen bóng",
                "Xanh rêu",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "Bảo hành xe 6 năm; bảo hành pin 8 năm.",
              "price_info_text": "Giá đã bao gồm VAT, 01 pin LFP 1,2 kWh và bộ sạc.",
              "rear_suspension": "Phuộc trước dạng ống lồng; thông tin giảm xóc sau chưa được VinFast công bố rõ trên trang sản phẩm.",
              "battery_location": "Pin chính đặt cố định dưới sàn để chân; có thể sử dụng thêm pin phụ.",
              "description_text": "Xe máy điện compact đô thị, không yêu cầu giấy phép lái xe.",
              "front_suspension": "chưa công bố",
              "lighting_features": {
                "headlight": "Đèn LED",
                "rear_light": "Đèn hậu LED",
                "turn_signal": "Đèn xi-nhan LED"
              },
              "charging_info_text": "Sạc điện tại nhà; thời gian sạc đầy khoảng 6 giờ 30 phút.",
              "technology_features": {
                "smartphone_app": "VinFast e-Scooter",
                "digital_display": true,
                "license_required": false
              },
              "range_condition_text": "Khoảng 70 km với pin chính; tổng khoảng 135 km khi sử dụng pin phụ theo điều kiện công bố của VinFast.",
              "technical_specs_text": "Động cơ điện; pin LFP 1,2 kWh; tốc độ tối đa khoảng 39 km/h; kích thước 1745 x 700 x 1050 mm; dung tích cốp khoảng 14 lít.",
              "battery_capacity_text": "Pin Lithium Iron Phosphate (LFP), dung lượng 1,2 kWh."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 39,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.2,
            "charging_time_minutes": 390,
            "maximum_motor_power_w": 2300,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "cb5115ae-36e5-49eb-8696-c98649661164",
    "code": "Flazz Max",
    "name": "VinFast Flazz Max",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Flazz_max.jpg",
    "basePrice": 17300000,
    "range": 87,
    "battery": "Lithium Iron Phosphate (LFP)",
    "acceleration": "Vận tốc max: 49 km/h",
    "topSpeed": 49,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đỏ - Đen",
      "Đen",
      "Xanh dương",
      "Trắng - Cam"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 1500W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "cb5115ae-36e5-49eb-8696-c98649661164",
      "id": "cb5115ae-36e5-49eb-8696-c98649661164",
      "model_name": "VinFast Flazz Max",
      "vehicle_line": "Flazz Max",
      "name": "VinFast Flazz Max",
      "code": "Flazz Max",
      "version": "Flazz Max",
      "category": "motorbike",
      "list_price": 17300000,
      "base_price": 17300000,
      "colors": [
        "Đỏ - Đen",
        "Đen",
        "Xanh dương",
        "Trắng - Cam"
      ],
      "image_url": "/static/uploads/motorbikes/Flazz_max.jpg",
      "range_km": 87,
      "charging_time_minutes": 480,
      "battery_type": "Lithium Iron Phosphate (LFP)",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.5,
      "motor_type": "Động cơ điện Inhub BLDC",
      "maximum_power_w": 1500,
      "maximum_speed_kmh": 49,
      "weight_kg": null,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast",
            "motorbike_id": "cb5115ae-36e5-49eb-8696-c98649661164"
          },
          "specifications": {
            "version": "Flazz Max",
            "range_km": 87,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 17300000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub BLDC",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "cb5115ae-36e5-49eb-8696-c98649661164",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đỏ - Đen",
                "Đen",
                "Xanh dương",
                "Trắng - Cam"
              ],
              "images": [],
              "rear_tire": "10 x 3.0",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "10 x 3.0",
              "rear_brake": "Phanh cơ",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "Phanh cơ",
              "source_refs": [],
              "warranty_text": "Thông tin thời hạn bảo hành được để trống do chưa xác nhận được từ trang sản phẩm hiện tại.",
              "price_info_text": "Giá mua kèm pin đã bao gồm VAT và bộ sạc. Giá không kèm pin tham khảo là 12.500.000 VNĐ.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Pin đặt trong cốp xe.",
              "description_text": "Xe máy điện đô thị phiên bản thể thao Flazz Max.",
              "front_suspension": "Phuộc ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Cụm đèn LED",
                "rear_light": "Đèn hậu LED",
                "daytime_running_light": "Đèn định vị LED"
              },
              "charging_info_text": "Sạc tại nhà bằng bộ sạc 210 W; thời gian sạc đầy khoảng 8 giờ.",
              "technology_features": {
                "lock": "Khóa cơ",
                "display": "Màn hình HMI LED màu",
                "riding_modes": [
                  "Eco",
                  "Sport"
                ]
              },
              "range_condition_text": "Quãng đường khoảng 87 km mỗi lần sạc theo công bố của VinFast.",
              "technical_specs_text": "Động cơ Inhub; công suất định mức 1000 W; công suất tối đa 1500 W; tốc độ tối đa 49 km/h ở chế độ Sport và 30 km/h ở chế độ Eco; kích thước 1745 x 700 x 1050 mm.",
              "battery_capacity_text": "Pin Lithium Iron Phosphate (LFP), dung lượng 1,5 kWh."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 49,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 480,
            "maximum_motor_power_w": 1500,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast",
            "motorbike_id": "cb5115ae-36e5-49eb-8696-c98649661164"
          },
          "specifications": {
            "version": "Flazz Max",
            "range_km": 87,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 17300000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub BLDC",
            "battery_type": "Lithium Iron Phosphate (LFP)",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "cb5115ae-36e5-49eb-8696-c98649661164",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đỏ - Đen",
                "Đen",
                "Xanh dương",
                "Trắng - Cam"
              ],
              "images": [],
              "rear_tire": "10 x 3.0",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "10 x 3.0",
              "rear_brake": "Phanh cơ",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "Phanh cơ",
              "source_refs": [],
              "warranty_text": "Thông tin thời hạn bảo hành được để trống do chưa xác nhận được từ trang sản phẩm hiện tại.",
              "price_info_text": "Giá mua kèm pin đã bao gồm VAT và bộ sạc. Giá không kèm pin tham khảo là 12.500.000 VNĐ.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Pin đặt trong cốp xe.",
              "description_text": "Xe máy điện đô thị phiên bản thể thao Flazz Max.",
              "front_suspension": "Phuộc ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Cụm đèn LED",
                "rear_light": "Đèn hậu LED",
                "daytime_running_light": "Đèn định vị LED"
              },
              "charging_info_text": "Sạc tại nhà bằng bộ sạc 210 W; thời gian sạc đầy khoảng 8 giờ.",
              "technology_features": {
                "lock": "Khóa cơ",
                "display": "Màn hình HMI LED màu",
                "riding_modes": [
                  "Eco",
                  "Sport"
                ]
              },
              "range_condition_text": "Quãng đường khoảng 87 km mỗi lần sạc theo công bố của VinFast.",
              "technical_specs_text": "Động cơ Inhub; công suất định mức 1000 W; công suất tối đa 1500 W; tốc độ tối đa 49 km/h ở chế độ Sport và 30 km/h ở chế độ Eco; kích thước 1745 x 700 x 1050 mm.",
              "battery_capacity_text": "Pin Lithium Iron Phosphate (LFP), dung lượng 1,5 kWh."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 49,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 480,
            "maximum_motor_power_w": 1500,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "b9131bd0-b129-42a5-af34-2c314c0c400d",
    "code": "VF DrgnFly",
    "name": "VinFast VF DrgnFly eBike",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/VF_DrgnFly_eBike.jpg",
    "basePrice": 18690000,
    "range": 110,
    "battery": "Lithium-ion",
    "acceleration": "Vận tốc max: 70 km/h",
    "topSpeed": 70,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đen bóng",
      "Xám decal vàng"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 250W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "b9131bd0-b129-42a5-af34-2c314c0c400d",
      "id": "b9131bd0-b129-42a5-af34-2c314c0c400d",
      "model_name": "VinFast VF DrgnFly eBike",
      "vehicle_line": "VF DrgnFly",
      "name": "VinFast VF DrgnFly eBike",
      "code": "VF DrgnFly",
      "version": "eBike",
      "category": "motorbike",
      "list_price": 18690000,
      "base_price": 18690000,
      "colors": [
        "Đen bóng",
        "Xám decal vàng"
      ],
      "image_url": "/static/uploads/motorbikes/VF_DrgnFly_eBike.jpg",
      "range_km": 110,
      "charging_time_minutes": 300,
      "battery_type": "Lithium-ion",
      "battery_quantity": 1,
      "battery_capacity_kwh": 0.64,
      "motor_type": "Động cơ điện moay-ơ bánh sau",
      "maximum_power_w": 250,
      "maximum_speed_kmh": null,
      "weight_kg": null,
      "length_mm": 1910,
      "width_mm": 692,
      "height_mm": 1083,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "motorbike_id": "b9131bd0-b129-42a5-af34-2c314c0c400d",
            "model_name": "VinFast VF DrgnFly"
          },
          "specifications": {
            "additional_specs": {
              "description_text": "Xe đạp điện trợ lực phong cách Scrambler, không có cốp xe.",
              "front_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "rear_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "warranty_text": "Bảo hành chính hãng 2 năm.",
              "colors": [
                "Đen bóng",
                "Xám decal vàng"
              ]
            },
            "motorbike_id": "b9131bd0-b129-42a5-af34-2c314c0c400d",
            "version": "eBike",
            "range_km": 110,
            "width_mm": 692,
            "height_mm": 1083,
            "length_mm": 1910,
            "is_active": true,
            "list_price": 18690000,
            "model_year": 2024,
            "motor_type": "Động cơ điện moay-ơ bánh sau",
            "battery_type": "Lithium-ion",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "wet_weight_kg": 150,
            "charger_power_w": 400,
            "battery_quantity": 1,
            "maximum_speed_kmh": 78,
            "removable_battery": true,
            "battery_capacity_kwh": 0.64,
            "charging_time_minutes": 300,
            "maximum_motor_power_w": 250,
            "battery_swap_supported": true,
            "underseat_storage_liters": 22
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "motorbike_id": "b9131bd0-b129-42a5-af34-2c314c0c400d",
            "model_name": "VinFast VF DrgnFly"
          },
          "specifications": {
            "additional_specs": {
              "description_text": "Xe đạp điện trợ lực phong cách Scrambler, không có cốp xe.",
              "front_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "rear_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "warranty_text": "Bảo hành chính hãng 2 năm.",
              "colors": [
                "Đen bóng",
                "Xám decal vàng"
              ]
            },
            "motorbike_id": "b9131bd0-b129-42a5-af34-2c314c0c400d",
            "version": "eBike",
            "range_km": 110,
            "width_mm": 692,
            "height_mm": 1083,
            "length_mm": 1910,
            "is_active": true,
            "list_price": 18690000,
            "model_year": 2024,
            "motor_type": "Động cơ điện moay-ơ bánh sau",
            "battery_type": "Lithium-ion",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "wet_weight_kg": 150,
            "charger_power_w": 400,
            "battery_quantity": 1,
            "maximum_speed_kmh": 78,
            "removable_battery": true,
            "battery_capacity_kwh": 0.64,
            "charging_time_minutes": 300,
            "maximum_motor_power_w": 250,
            "battery_swap_supported": true,
            "underseat_storage_liters": 22
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "05fa274c-894d-4b1f-96ed-393de8fba613",
    "code": "Evo Lite",
    "name": "VinFast Evo Lite Kèm pin",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Evo_lite.jpg",
    "basePrice": 18900000,
    "range": 165,
    "battery": "Lithium Iron Phosphate LFP",
    "acceleration": "Vận tốc max: 49 km/h",
    "topSpeed": 49,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Xanh Oliu",
      "Đỏ tươi",
      "Đen nhám",
      "Trắng ngọc trai"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 2300W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "05fa274c-894d-4b1f-96ed-393de8fba613",
      "id": "05fa274c-894d-4b1f-96ed-393de8fba613",
      "model_name": "VinFast Evo Lite Kèm pin",
      "vehicle_line": "Evo Lite",
      "name": "VinFast Evo Lite Kèm pin",
      "code": "Evo Lite",
      "version": "Kèm pin",
      "category": "motorbike",
      "list_price": 18900000,
      "base_price": 18900000,
      "colors": [
        "Xanh Oliu",
        "Đỏ tươi",
        "Đen nhám",
        "Trắng ngọc trai"
      ],
      "image_url": "/static/uploads/motorbikes/Evo_lite.jpg",
      "range_km": 165,
      "charging_time_minutes": 270,
      "battery_type": "Lithium Iron Phosphate LFP",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.5,
      "motor_type": "Động cơ Inhub",
      "maximum_power_w": 2300,
      "maximum_speed_kmh": 49,
      "weight_kg": 86,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Evo Lite",
            "motorbike_id": "05fa274c-894d-4b1f-96ed-393de8fba613"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 165,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 18900000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "05fa274c-894d-4b1f-96ed-393de8fba613",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Xanh Oliu",
                "Đỏ tươi",
                "Đen nhám",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá kèm pin: 18.900.000 VNĐ. Giá không kèm pin: 14.300.000 VNĐ. Đã bao gồm VAT và 1 bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Pin đặt dưới cốp xe.",
              "description_text": "VinFast Evo Lite là phiên bản giới hạn tốc độ, phù hợp học sinh và người dùng không có bằng lái.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Đèn Full LED và đèn pha LED Projector",
                "tail_light": "Đèn hậu LED",
                "turn_signal": "Đèn xi-nhan LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 4 giờ 30 phút bằng bộ sạc 400 W. Có hỗ trợ đổi pin.",
              "technology_features": {
                "battery_swap": true,
                "smart_management": "Quản lý pin, định vị và lịch sử di chuyển qua ứng dụng VinFast",
                "license_requirement": "Không yêu cầu bằng lái do tốc độ tối đa 49 km/h"
              },
              "range_condition_text": "Khoảng 85 km với 1 pin và tăng thêm khoảng 80 km khi lắp pin phụ. Tổng quãng đường khoảng 165 km với 2 pin.",
              "technical_specs_text": "VinFast Evo Lite có công suất tối đa 2.300 W, tốc độ tối đa 49 km/h và pin LFP 1,5 kWh.",
              "battery_capacity_text": "Pin LFP 1,5 kWh; có thể lắp thêm pin phụ."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 49,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 2300,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Evo Lite",
            "motorbike_id": "05fa274c-894d-4b1f-96ed-393de8fba613"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 165,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 18900000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "05fa274c-894d-4b1f-96ed-393de8fba613",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Xanh Oliu",
                "Đỏ tươi",
                "Đen nhám",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá kèm pin: 18.900.000 VNĐ. Giá không kèm pin: 14.300.000 VNĐ. Đã bao gồm VAT và 1 bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Pin đặt dưới cốp xe.",
              "description_text": "VinFast Evo Lite là phiên bản giới hạn tốc độ, phù hợp học sinh và người dùng không có bằng lái.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Đèn Full LED và đèn pha LED Projector",
                "tail_light": "Đèn hậu LED",
                "turn_signal": "Đèn xi-nhan LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 4 giờ 30 phút bằng bộ sạc 400 W. Có hỗ trợ đổi pin.",
              "technology_features": {
                "battery_swap": true,
                "smart_management": "Quản lý pin, định vị và lịch sử di chuyển qua ứng dụng VinFast",
                "license_requirement": "Không yêu cầu bằng lái do tốc độ tối đa 49 km/h"
              },
              "range_condition_text": "Khoảng 85 km với 1 pin và tăng thêm khoảng 80 km khi lắp pin phụ. Tổng quãng đường khoảng 165 km với 2 pin.",
              "technical_specs_text": "VinFast Evo Lite có công suất tối đa 2.300 W, tốc độ tối đa 49 km/h và pin LFP 1,5 kWh.",
              "battery_capacity_text": "Pin LFP 1,5 kWh; có thể lắp thêm pin phụ."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 49,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 2300,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "bca33992-3ea5-410c-bbf8-27ee68af484a",
    "code": "Evo Grand Lite",
    "name": "VinFast Evo Grand Lite Kèm pin",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Evo_grand_lite.jpg",
    "basePrice": 19900000,
    "range": 198,
    "battery": "Lithium Iron Phosphate LFP",
    "acceleration": "Vận tốc max: 48 km/h",
    "topSpeed": 48,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Tr\u1eafng ng\u1ecdc trai",
      "\u0110en nh\u00e1m",
      "Lavender S\u1eefa",
      "V\u00e0ng"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 2000W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "bca33992-3ea5-410c-bbf8-27ee68af484a",
      "id": "bca33992-3ea5-410c-bbf8-27ee68af484a",
      "model_name": "VinFast Evo Grand Lite Kèm pin",
      "vehicle_line": "Evo Grand Lite",
      "name": "VinFast Evo Grand Lite Kèm pin",
      "code": "Evo Grand Lite",
      "version": "Kèm pin",
      "category": "motorbike",
      "list_price": 19900000,
      "base_price": 19900000,
      "colors": [
        "Tr\u1eafng ng\u1ecdc trai",
        "\u0110en nh\u00e1m",
        "Lavender S\u1eefa",
        "V\u00e0ng"
      ],
      "image_url": "/static/uploads/motorbikes/Evo_grand_lite.jpg",
      "range_km": 198,
      "charging_time_minutes": null,
      "battery_type": "Lithium Iron Phosphate LFP",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.2,
      "motor_type": "Động cơ Inhub",
      "maximum_power_w": null,
      "maximum_speed_kmh": 48,
      "weight_kg": null,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Evo Grand Lite",
            "motorbike_id": "bca33992-3ea5-410c-bbf8-27ee68af484a"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 198,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 19900000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "bca33992-3ea5-410c-bbf8-27ee68af484a",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Xanh Oliu",
                "Đỏ tươi",
                "Đen nhám",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá kèm pin tham khảo: 19.900.000 VNĐ, đã bao gồm VAT.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Pin đặt trong cốp xe.",
              "description_text": "VinFast Evo Grand Lite là phiên bản giới hạn tốc độ, phù hợp học sinh và hỗ trợ đổi pin.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Đèn LED",
                "tail_light": "Đèn hậu LED",
                "turn_signal": "Đèn xi-nhan LED"
              },
              "charging_info_text": "Sạc AC tại nhà hoặc đổi pin tại trạm VinFast.",
              "technology_features": {
                "battery_swap": true,
                "license_requirement": "Phiên bản giới hạn tốc độ",
                "battery_configuration": "Hỗ trợ 1 hoặc 2 pin"
              },
              "range_condition_text": "Khoảng 198 km khi sử dụng 2 pin theo điều kiện kiểm thử của VinFast.",
              "technical_specs_text": "VinFast Evo Grand Lite sử dụng pin LFP 1,2 kWh mỗi pin, hỗ trợ 2 pin và tốc độ tối đa khoảng 48 km/h.",
              "battery_capacity_text": "Pin LFP 1,2 kWh mỗi pin; hỗ trợ lắp tối đa 2 pin."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 48,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.2,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 2300,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Evo Grand Lite",
            "motorbike_id": "bca33992-3ea5-410c-bbf8-27ee68af484a"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 198,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 19900000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "bca33992-3ea5-410c-bbf8-27ee68af484a",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Xanh Oliu",
                "Đỏ tươi",
                "Đen nhám",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá kèm pin tham khảo: 19.900.000 VNĐ, đã bao gồm VAT.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Pin đặt trong cốp xe.",
              "description_text": "VinFast Evo Grand Lite là phiên bản giới hạn tốc độ, phù hợp học sinh và hỗ trợ đổi pin.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Đèn LED",
                "tail_light": "Đèn hậu LED",
                "turn_signal": "Đèn xi-nhan LED"
              },
              "charging_info_text": "Sạc AC tại nhà hoặc đổi pin tại trạm VinFast.",
              "technology_features": {
                "battery_swap": true,
                "license_requirement": "Phiên bản giới hạn tốc độ",
                "battery_configuration": "Hỗ trợ 1 hoặc 2 pin"
              },
              "range_condition_text": "Khoảng 198 km khi sử dụng 2 pin theo điều kiện kiểm thử của VinFast.",
              "technical_specs_text": "VinFast Evo Grand Lite sử dụng pin LFP 1,2 kWh mỗi pin, hỗ trợ 2 pin và tốc độ tối đa khoảng 48 km/h.",
              "battery_capacity_text": "Pin LFP 1,2 kWh mỗi pin; hỗ trợ lắp tối đa 2 pin."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 48,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.2,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 2300,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "59b9610f-c3c9-4a91-a18a-8ea30e0e9c17",
    "code": "Evo Grand",
    "name": "VinFast Evo Grand Kèm pin",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Evo_Grand.jpg",
    "basePrice": 22500000,
    "range": 262,
    "battery": "Lithium Iron Phosphate LFP",
    "acceleration": "Vận tốc max: 70 km/h",
    "topSpeed": 70,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Trắng ngọc trai",
      "Đen nhám",
      "Xanh Oliu",
      "Đỏ tươi",
      "Vàng cát"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 2250W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "59b9610f-c3c9-4a91-a18a-8ea30e0e9c17",
      "id": "59b9610f-c3c9-4a91-a18a-8ea30e0e9c17",
      "model_name": "VinFast Evo Grand Kèm pin",
      "vehicle_line": "Evo Grand",
      "name": "VinFast Evo Grand Kèm pin",
      "code": "Evo Grand",
      "version": "Kèm pin",
      "category": "motorbike",
      "list_price": 22500000,
      "base_price": 22500000,
      "colors": [
        "Trắng ngọc trai",
        "Đen nhám",
        "Xanh Oliu",
        "Đỏ tươi",
        "Vàng cát"
      ],
      "image_url": "/static/uploads/motorbikes/Evo_Grand.jpg",
      "range_km": 262,
      "charging_time_minutes": 390,
      "battery_type": "Lithium Iron Phosphate LFP",
      "battery_quantity": 1,
      "battery_capacity_kwh": 2.4,
      "motor_type": "Động cơ Inhub",
      "maximum_power_w": 2250,
      "maximum_speed_kmh": 70,
      "weight_kg": 92,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Evo Grand",
            "motorbike_id": "59b9610f-c3c9-4a91-a18a-8ea30e0e9c17"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 262,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 22500000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "59b9610f-c3c9-4a91-a18a-8ea30e0e9c17",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Trắng ngọc trai",
                "Đen nhám",
                "Xanh Oliu",
                "Đỏ tươi",
                "Vàng cát"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá bán tham khảo: 22.500.000 VNĐ, đã bao gồm VAT, 1 pin và 1 bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Pin chính đặt dưới sàn để chân; pin phụ đặt trong cốp.",
              "description_text": "VinFast Evo Grand là xe máy điện scooter thân rộng, hỗ trợ pin phụ tháo rời và đổi pin tại trạm.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Hệ thống đèn Full LED",
                "turn_signal": "Đèn tín hiệu LED",
                "daytime_running_light": "Đèn định vị LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 6 giờ 30 phút. Có hỗ trợ đổi pin.",
              "technology_features": {
                "gps": "Định vị GPS và quản lý xe qua ứng dụng VinFast",
                "smart_key": true,
                "battery_swap": true,
                "battery_configuration": "Hỗ trợ 1 hoặc 2 pin"
              },
              "range_condition_text": "Khoảng 134 km với 1 pin và tăng thêm khoảng 128 km khi lắp pin phụ. Tổng quãng đường khoảng 262 km với 2 pin.",
              "technical_specs_text": "VinFast Evo Grand sử dụng pin LFP 2,4 kWh, công suất tối đa 2.250 W, tốc độ tối đa 70 km/h và quãng đường tối đa khoảng 262 km với 2 pin.",
              "battery_capacity_text": "Pin LFP 2,4 kWh; có thể lắp thêm pin phụ."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 2.4,
            "charging_time_minutes": 390,
            "maximum_motor_power_w": 2250,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Evo Grand",
            "motorbike_id": "59b9610f-c3c9-4a91-a18a-8ea30e0e9c17"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 262,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 22500000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "59b9610f-c3c9-4a91-a18a-8ea30e0e9c17",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Trắng ngọc trai",
                "Đen nhám",
                "Xanh Oliu",
                "Đỏ tươi",
                "Vàng cát"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá bán tham khảo: 22.500.000 VNĐ, đã bao gồm VAT, 1 pin và 1 bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Pin chính đặt dưới sàn để chân; pin phụ đặt trong cốp.",
              "description_text": "VinFast Evo Grand là xe máy điện scooter thân rộng, hỗ trợ pin phụ tháo rời và đổi pin tại trạm.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Hệ thống đèn Full LED",
                "turn_signal": "Đèn tín hiệu LED",
                "daytime_running_light": "Đèn định vị LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 6 giờ 30 phút. Có hỗ trợ đổi pin.",
              "technology_features": {
                "gps": "Định vị GPS và quản lý xe qua ứng dụng VinFast",
                "smart_key": true,
                "battery_swap": true,
                "battery_configuration": "Hỗ trợ 1 hoặc 2 pin"
              },
              "range_condition_text": "Khoảng 134 km với 1 pin và tăng thêm khoảng 128 km khi lắp pin phụ. Tổng quãng đường khoảng 262 km với 2 pin.",
              "technical_specs_text": "VinFast Evo Grand sử dụng pin LFP 2,4 kWh, công suất tối đa 2.250 W, tốc độ tối đa 70 km/h và quãng đường tối đa khoảng 262 km với 2 pin.",
              "battery_capacity_text": "Pin LFP 2,4 kWh; có thể lắp thêm pin phụ."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 2.4,
            "charging_time_minutes": 390,
            "maximum_motor_power_w": 2250,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "fb836a3f-e4a9-4637-a3cc-3623084016f5",
    "code": "Evo",
    "name": "VinFast Evo Kèm pin",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Evo.jpg",
    "basePrice": 24100000,
    "range": 165,
    "battery": "Lithium Iron Phosphate LFP",
    "acceleration": "Vận tốc max: 70 km/h",
    "topSpeed": 70,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Xanh Oliu",
      "Đỏ tươi",
      "Đen nhám",
      "Trắng ngọc trai"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 2450W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "fb836a3f-e4a9-4637-a3cc-3623084016f5",
      "id": "fb836a3f-e4a9-4637-a3cc-3623084016f5",
      "model_name": "VinFast Evo Kèm pin",
      "vehicle_line": "Evo",
      "name": "VinFast Evo Kèm pin",
      "code": "Evo",
      "version": "Kèm pin",
      "category": "motorbike",
      "list_price": 24100000,
      "base_price": 24100000,
      "colors": [
        "Xanh Oliu",
        "Đỏ tươi",
        "Đen nhám",
        "Trắng ngọc trai"
      ],
      "image_url": "/static/uploads/motorbikes/Evo.jpg",
      "range_km": 165,
      "charging_time_minutes": 270,
      "battery_type": "Lithium Iron Phosphate LFP",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.5,
      "motor_type": "Động cơ Inhub",
      "maximum_power_w": 2450,
      "maximum_speed_kmh": 70,
      "weight_kg": 86,
      "length_mm": 1910,
      "width_mm": 692,
      "height_mm": 1083,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "motorbike_id": "fb836a3f-e4a9-4637-a3cc-3623084016f5",
            "model_name": "VinFast Evo"
          },
          "specifications": {
            "additional_specs": {
              "description_text": "VinFast Evo là xe máy điện scooter đô thị, hỗ trợ 1 pin chính và 1 pin phụ, phù hợp nhu cầu di chuyển hằng ngày.",
              "front_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "rear_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "warranty_text": "chưa công bố",
              "colors": [
                "Xanh Oliu",
                "Đỏ tươi",
                "Đen nhám",
                "Trắng ngọc trai"
              ]
            },
            "motorbike_id": "fb836a3f-e4a9-4637-a3cc-3623084016f5",
            "version": "Kèm pin",
            "range_km": 165,
            "width_mm": 692,
            "height_mm": 1083,
            "length_mm": 1910,
            "is_active": true,
            "list_price": 24100000,
            "model_year": 2024,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "wet_weight_kg": 150,
            "charger_power_w": 400,
            "battery_quantity": 1,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 2450,
            "battery_swap_supported": true,
            "underseat_storage_liters": 22
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "motorbike_id": "fb836a3f-e4a9-4637-a3cc-3623084016f5",
            "model_name": "VinFast Evo"
          },
          "specifications": {
            "additional_specs": {
              "description_text": "VinFast Evo là xe máy điện scooter đô thị, hỗ trợ 1 pin chính và 1 pin phụ, phù hợp nhu cầu di chuyển hằng ngày.",
              "front_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "rear_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "warranty_text": "chưa công bố",
              "colors": [
                "Xanh Oliu",
                "Đỏ tươi",
                "Đen nhám",
                "Trắng ngọc trai"
              ]
            },
            "motorbike_id": "fb836a3f-e4a9-4637-a3cc-3623084016f5",
            "version": "Kèm pin",
            "range_km": 165,
            "width_mm": 692,
            "height_mm": 1083,
            "length_mm": 1910,
            "is_active": true,
            "list_price": 24100000,
            "model_year": 2024,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "wet_weight_kg": 150,
            "charger_power_w": 400,
            "battery_quantity": 1,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 2450,
            "battery_swap_supported": true,
            "underseat_storage_liters": 22
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "e397e4ed-1ba4-4216-a389-75fd78e1b1c0",
    "code": "Feliz 2025",
    "name": "VinFast Feliz 2025 Kèm pin",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Feliz_2025.jpg",
    "basePrice": 27900000,
    "range": 262,
    "battery": "Lithium Iron Phosphate LFP",
    "acceleration": "Vận tốc max: 70 km/h",
    "topSpeed": 70,
    "seats": 2,
    "isNew": true,
    "colors": [
      "\u0110en b\u00f3ng",
      "Xanh R\u00eau",
      "Xanh Oliu",
      "Tr\u1eafng Ng\u1ecdc Trai"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 2000W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "e397e4ed-1ba4-4216-a389-75fd78e1b1c0",
      "id": "e397e4ed-1ba4-4216-a389-75fd78e1b1c0",
      "model_name": "VinFast Feliz 2025 Kèm pin",
      "vehicle_line": "Feliz 2025",
      "name": "VinFast Feliz 2025 Kèm pin",
      "code": "Feliz 2025",
      "version": "Kèm pin",
      "category": "motorbike",
      "list_price": 27900000,
      "base_price": 27900000,
      "colors": [
        "\u0110en b\u00f3ng",
        "Xanh R\u00eau",
        "Xanh Oliu",
        "Tr\u1eafng Ng\u1ecdc Trai"
      ],
      "image_url": "/static/uploads/motorbikes/Feliz_2025.jpg",
      "range_km": 262,
      "charging_time_minutes": null,
      "battery_type": "Lithium Iron Phosphate LFP",
      "battery_quantity": 2,
      "battery_capacity_kwh": 2.4,
      "motor_type": "",
      "maximum_power_w": null,
      "maximum_speed_kmh": 70,
      "weight_kg": null,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Feliz 2025",
            "motorbike_id": "e397e4ed-1ba4-4216-a389-75fd78e1b1c0"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 262,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 27900000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "e397e4ed-1ba4-4216-a389-75fd78e1b1c0",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Xanh Oliu",
                "Đỏ tươi",
                "Đen nhám",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá niêm yết kèm pin: 27.900.000 VNĐ, đã bao gồm VAT.",
              "rear_suspension": "chưa công bố",
              "battery_location": "Thông tin vị trí pin cần xác nhận theo brochure của phiên bản Feliz 2025.",
              "description_text": "Xe máy điện đô thị VinFast Feliz 2025, sử dụng pin LFP và cấu hình hỗ trợ 2 pin.",
              "front_suspension": "chưa công bố",
              "lighting_features": {
                "headlight": "Đèn LED",
                "tail_light": "Đèn hậu LED",
                "daytime_running_light": "Đèn LED nhận diện"
              },
              "charging_info_text": "chưa công bố",
              "technology_features": {
                "model": "Feliz 2025",
                "other_features": "Thông tin chi tiết cần xác nhận theo brochure chính thức",
                "battery_configuration": "Hỗ trợ cấu hình 2 pin"
              },
              "range_condition_text": "Khoảng 262 km khi sử dụng 2 pin theo điều kiện kiểm thử của VinFast, tốc độ 30 km/h và người lái 65 kg.",
              "technical_specs_text": "VinFast Feliz 2025 có tốc độ tối đa 70 km/h, dung tích cốp khoảng 34 lít và quãng đường khoảng 262 km khi sử dụng 2 pin.",
              "battery_capacity_text": "Pin LFP 2,4 kWh; cấu hình sử dụng 2 pin để đạt quãng đường khoảng 262 km."
            },
            "battery_quantity": 2,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 2.4,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 2300,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Feliz 2025",
            "motorbike_id": "e397e4ed-1ba4-4216-a389-75fd78e1b1c0"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 262,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 27900000,
            "model_year": 2026,
            "motor_type": "Động cơ Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "e397e4ed-1ba4-4216-a389-75fd78e1b1c0",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Xanh Oliu",
                "Đỏ tươi",
                "Đen nhám",
                "Trắng ngọc trai"
              ],
              "images": [],
              "rear_tire": "chưa công bố",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "chưa công bố",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá niêm yết kèm pin: 27.900.000 VNĐ, đã bao gồm VAT.",
              "rear_suspension": "chưa công bố",
              "battery_location": "Thông tin vị trí pin cần xác nhận theo brochure của phiên bản Feliz 2025.",
              "description_text": "Xe máy điện đô thị VinFast Feliz 2025, sử dụng pin LFP và cấu hình hỗ trợ 2 pin.",
              "front_suspension": "chưa công bố",
              "lighting_features": {
                "headlight": "Đèn LED",
                "tail_light": "Đèn hậu LED",
                "daytime_running_light": "Đèn LED nhận diện"
              },
              "charging_info_text": "chưa công bố",
              "technology_features": {
                "model": "Feliz 2025",
                "other_features": "Thông tin chi tiết cần xác nhận theo brochure chính thức",
                "battery_configuration": "Hỗ trợ cấu hình 2 pin"
              },
              "range_condition_text": "Khoảng 262 km khi sử dụng 2 pin theo điều kiện kiểm thử của VinFast, tốc độ 30 km/h và người lái 65 kg.",
              "technical_specs_text": "VinFast Feliz 2025 có tốc độ tối đa 70 km/h, dung tích cốp khoảng 34 lít và quãng đường khoảng 262 km khi sử dụng 2 pin.",
              "battery_capacity_text": "Pin LFP 2,4 kWh; cấu hình sử dụng 2 pin để đạt quãng đường khoảng 262 km."
            },
            "battery_quantity": 2,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 2.4,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 2300,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "d79e7756-c2dc-427d-a983-a77738fd0f20",
    "code": "Feliz II",
    "name": "VinFast Feliz II Kèm pin",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Feliz_II.jpg",
    "basePrice": 28700000,
    "range": 156,
    "battery": "Lithium Iron Phosphate LFP",
    "acceleration": "Vận tốc max: 70 km/h",
    "topSpeed": 70,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đỏ",
      "Trắng",
      "Đen",
      "Xanh Oliu"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 3000W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "d79e7756-c2dc-427d-a983-a77738fd0f20",
      "id": "d79e7756-c2dc-427d-a983-a77738fd0f20",
      "model_name": "VinFast Feliz II Kèm pin",
      "vehicle_line": "Feliz II",
      "name": "VinFast Feliz II Kèm pin",
      "code": "Feliz II",
      "version": "Kèm pin",
      "category": "motorbike",
      "list_price": 28700000,
      "base_price": 28700000,
      "colors": [
        "Đỏ",
        "Trắng",
        "Đen",
        "Xanh Oliu"
      ],
      "image_url": "/static/uploads/motorbikes/Feliz_II.jpg",
      "range_km": 156,
      "charging_time_minutes": 270,
      "battery_type": "Lithium Iron Phosphate LFP",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.5,
      "motor_type": "Động cơ BLDC Inhub",
      "maximum_power_w": 3000,
      "maximum_speed_kmh": 70,
      "weight_kg": null,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Feliz II",
            "motorbike_id": "d79e7756-c2dc-427d-a983-a77738fd0f20"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 156,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 28700000,
            "model_year": 2026,
            "motor_type": "Động cơ BLDC Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "d79e7756-c2dc-427d-a983-a77738fd0f20",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đỏ",
                "Trắng",
                "Đen",
                "Xanh Oliu"
              ],
              "images": [],
              "rear_tire": "110/80-14",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "90/90-14",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "Bảo hành xe 6 năm. Bảo hành pin 8 năm theo chính sách VinFast hiện hành.",
              "price_info_text": "Giá xe kèm pin: 28.700.000 VNĐ. Giá xe không kèm pin: 23.000.000 VNĐ. Đã bao gồm VAT và 1 bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Pin đặt trong cốp xe.",
              "description_text": "VinFast Feliz II là xe máy điện scooter đô thị, hỗ trợ sạc tại nhà và đổi pin nhanh.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Đèn pha LED Projector",
                "tail_light": "Đèn hậu LED",
                "turn_signal": "Đèn xi-nhan LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 4 giờ 30 phút. Xe hỗ trợ đổi pin tại hệ thống đổi pin VinFast.",
              "technology_features": {
                "screen": "Màn hình hiển thị thông tin",
                "braking": "Có phanh tái sinh",
                "smart_key": "Khóa cơ",
                "battery_swap": true,
                "battery_management": "Hỗ trợ hệ thống đổi pin VinFast"
              },
              "range_condition_text": "Khoảng 82 km với 1 pin và tăng thêm khoảng 74 km khi lắp pin phụ. Tổng cộng khoảng 156 km theo điều kiện kiểm thử của VinFast.",
              "technical_specs_text": "VinFast Feliz II sử dụng động cơ BLDC Inhub, công suất tối đa 3.000 W, tốc độ tối đa 70 km/h, pin LFP 1,5 kWh và hỗ trợ lắp pin phụ.",
              "battery_capacity_text": "Pin LFP 1,5 kWh mỗi pin; có thể lắp thêm pin phụ."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 3000,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Feliz II",
            "motorbike_id": "d79e7756-c2dc-427d-a983-a77738fd0f20"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 156,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 28700000,
            "model_year": 2026,
            "motor_type": "Động cơ BLDC Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "d79e7756-c2dc-427d-a983-a77738fd0f20",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đỏ",
                "Trắng",
                "Đen",
                "Xanh Oliu"
              ],
              "images": [],
              "rear_tire": "110/80-14",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "90/90-14",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "Bảo hành xe 6 năm. Bảo hành pin 8 năm theo chính sách VinFast hiện hành.",
              "price_info_text": "Giá xe kèm pin: 28.700.000 VNĐ. Giá xe không kèm pin: 23.000.000 VNĐ. Đã bao gồm VAT và 1 bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Pin đặt trong cốp xe.",
              "description_text": "VinFast Feliz II là xe máy điện scooter đô thị, hỗ trợ sạc tại nhà và đổi pin nhanh.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Đèn pha LED Projector",
                "tail_light": "Đèn hậu LED",
                "turn_signal": "Đèn xi-nhan LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 4 giờ 30 phút. Xe hỗ trợ đổi pin tại hệ thống đổi pin VinFast.",
              "technology_features": {
                "screen": "Màn hình hiển thị thông tin",
                "braking": "Có phanh tái sinh",
                "smart_key": "Khóa cơ",
                "battery_swap": true,
                "battery_management": "Hỗ trợ hệ thống đổi pin VinFast"
              },
              "range_condition_text": "Khoảng 82 km với 1 pin và tăng thêm khoảng 74 km khi lắp pin phụ. Tổng cộng khoảng 156 km theo điều kiện kiểm thử của VinFast.",
              "technical_specs_text": "VinFast Feliz II sử dụng động cơ BLDC Inhub, công suất tối đa 3.000 W, tốc độ tối đa 70 km/h, pin LFP 1,5 kWh và hỗ trợ lắp pin phụ.",
              "battery_capacity_text": "Pin LFP 1,5 kWh mỗi pin; có thể lắp thêm pin phụ."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 3000,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "ecfc9264-7b81-41ed-bfab-fd1a4ed9fa2b",
    "code": "Vero X",
    "name": "VinFast Vero X Tiêu chuẩn",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Vero_X.jpg",
    "basePrice": 34900000,
    "range": 262,
    "battery": "Lithium Iron Phosphate LFP",
    "acceleration": "Vận tốc max: 70 km/h",
    "topSpeed": 70,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đen nhám",
      "Xanh rêu",
      "Trắng ngọc trai",
      "Xanh Oliu"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 2250W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "ecfc9264-7b81-41ed-bfab-fd1a4ed9fa2b",
      "id": "ecfc9264-7b81-41ed-bfab-fd1a4ed9fa2b",
      "model_name": "VinFast Vero X Tiêu chuẩn",
      "vehicle_line": "Vero X",
      "name": "VinFast Vero X Tiêu chuẩn",
      "code": "Vero X",
      "version": "Tiêu chuẩn",
      "category": "motorbike",
      "list_price": 34900000,
      "base_price": 34900000,
      "colors": [
        "Đen nhám",
        "Xanh rêu",
        "Trắng ngọc trai",
        "Xanh Oliu"
      ],
      "image_url": "/static/uploads/motorbikes/Vero_X.jpg",
      "range_km": 262,
      "charging_time_minutes": 390,
      "battery_type": "Lithium Iron Phosphate LFP",
      "battery_quantity": 1,
      "battery_capacity_kwh": 2.4,
      "motor_type": "Động cơ BLDC Inhub",
      "maximum_power_w": 2250,
      "maximum_speed_kmh": 70,
      "weight_kg": 92,
      "length_mm": 1910,
      "width_mm": 692,
      "height_mm": 1083,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "motorbike_id": "ecfc9264-7b81-41ed-bfab-fd1a4ed9fa2b",
            "model_name": "VinFast Vero X"
          },
          "specifications": {
            "additional_specs": {
              "description_text": "VinFast Vero X là xe máy điện tay ga hỗ trợ 1 pin chính và 1 pin phụ tháo rời.",
              "front_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "rear_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "warranty_text": "Bảo hành xe 6 năm không giới hạn số km. Bảo hành pin 8 năm không giới hạn số km.",
              "colors": [
                "Đen nhám",
                "Xanh rêu",
                "Trắng ngọc trai",
                "Xanh Oliu"
              ]
            },
            "motorbike_id": "ecfc9264-7b81-41ed-bfab-fd1a4ed9fa2b",
            "version": "Tiêu chuẩn",
            "range_km": 262,
            "width_mm": 692,
            "height_mm": 1083,
            "length_mm": 1910,
            "is_active": true,
            "list_price": 34900000,
            "model_year": 2024,
            "motor_type": "Động cơ BLDC Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "wet_weight_kg": 150,
            "charger_power_w": 400,
            "battery_quantity": 1,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_kwh": 2.4,
            "charging_time_minutes": 390,
            "maximum_motor_power_w": 2250,
            "battery_swap_supported": true,
            "underseat_storage_liters": 22
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "motorbike_id": "ecfc9264-7b81-41ed-bfab-fd1a4ed9fa2b",
            "model_name": "VinFast Vero X"
          },
          "specifications": {
            "additional_specs": {
              "description_text": "VinFast Vero X là xe máy điện tay ga hỗ trợ 1 pin chính và 1 pin phụ tháo rời.",
              "front_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "rear_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "warranty_text": "Bảo hành xe 6 năm không giới hạn số km. Bảo hành pin 8 năm không giới hạn số km.",
              "colors": [
                "Đen nhám",
                "Xanh rêu",
                "Trắng ngọc trai",
                "Xanh Oliu"
              ]
            },
            "motorbike_id": "ecfc9264-7b81-41ed-bfab-fd1a4ed9fa2b",
            "version": "Tiêu chuẩn",
            "range_km": 262,
            "width_mm": 692,
            "height_mm": 1083,
            "length_mm": 1910,
            "is_active": true,
            "list_price": 34900000,
            "model_year": 2024,
            "motor_type": "Động cơ BLDC Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "wet_weight_kg": 150,
            "charger_power_w": 400,
            "battery_quantity": 1,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_kwh": 2.4,
            "charging_time_minutes": 390,
            "maximum_motor_power_w": 2250,
            "battery_swap_supported": true,
            "underseat_storage_liters": 22
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "437f2203-ed23-4ad0-85c3-1f89d10a30c7",
    "code": "Kyo",
    "name": "VinFast Kyo Kèm pin",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Kyo.jpg",
    "basePrice": 35300000,
    "range": 160,
    "battery": "Lithium Iron Phosphate LFP",
    "acceleration": "Vận tốc max: 70 km/h",
    "topSpeed": 70,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đen Bóng",
      "Xanh Oliu",
      "Đỏ",
      "Trắng Ngọc Trai",
      "Nâu Ánh Kim"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 3000W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "437f2203-ed23-4ad0-85c3-1f89d10a30c7",
      "id": "437f2203-ed23-4ad0-85c3-1f89d10a30c7",
      "model_name": "VinFast Kyo Kèm pin",
      "vehicle_line": "Kyo",
      "name": "VinFast Kyo Kèm pin",
      "code": "Kyo",
      "version": "Kèm pin",
      "category": "motorbike",
      "list_price": 35300000,
      "base_price": 35300000,
      "colors": [
        "Đen Bóng",
        "Xanh Oliu",
        "Đỏ",
        "Trắng Ngọc Trai",
        "Nâu Ánh Kim"
      ],
      "image_url": "/static/uploads/motorbikes/Kyo.jpg",
      "range_km": 160,
      "charging_time_minutes": 270,
      "battery_type": "Lithium Iron Phosphate LFP",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.5,
      "motor_type": "Động cơ điện Inhub",
      "maximum_power_w": 3000,
      "maximum_speed_kmh": 70,
      "weight_kg": null,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Kyo",
            "motorbike_id": "437f2203-ed23-4ad0-85c3-1f89d10a30c7"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 160,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 35300000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "437f2203-ed23-4ad0-85c3-1f89d10a30c7",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đen Bóng",
                "Xanh Oliu",
                "Đỏ",
                "Trắng Ngọc Trai",
                "Nâu Ánh Kim"
              ],
              "images": [],
              "rear_tire": "120/70-14",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "90/90-14",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá xe kèm pin: 35.300.000 VNĐ. Giá xe không kèm pin: 30.000.000 VNĐ. Đã bao gồm VAT và 1 bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "chưa công bố",
              "description_text": "VinFast Kyo là xe máy điện scooter đô thị, có thể lắp thêm pin thứ hai và có quãng đường khoảng 160 km.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Đèn LED",
                "tail_light": "Đèn hậu LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 4 giờ 30 phút.",
              "technology_features": {
                "display": "Màn hình TFT kết nối Bluetooth",
                "smart_key": true,
                "license_requirement": "Cần bằng lái theo quy định do tốc độ tối đa 70 km/h",
                "battery_configuration": "Pin LFP 1,5 kWh, tùy chọn lắp thêm pin"
              },
              "range_condition_text": "Khoảng 160 km khi lắp 2 pin theo điều kiện kiểm thử của VinFast.",
              "technical_specs_text": "VinFast Kyo sử dụng động cơ Inhub công suất định mức 1.800 W, công suất tối đa khoảng 3.000 W, tốc độ tối đa 70 km/h và pin LFP 1,5 kWh.",
              "battery_capacity_text": "Pin LFP 1,5 kWh; có tùy chọn lắp thêm pin thứ hai."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 3000,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Kyo",
            "motorbike_id": "437f2203-ed23-4ad0-85c3-1f89d10a30c7"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 160,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 35300000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "437f2203-ed23-4ad0-85c3-1f89d10a30c7",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Đen Bóng",
                "Xanh Oliu",
                "Đỏ",
                "Trắng Ngọc Trai",
                "Nâu Ánh Kim"
              ],
              "images": [],
              "rear_tire": "120/70-14",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "90/90-14",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá xe kèm pin: 35.300.000 VNĐ. Giá xe không kèm pin: 30.000.000 VNĐ. Đã bao gồm VAT và 1 bộ sạc.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "chưa công bố",
              "description_text": "VinFast Kyo là xe máy điện scooter đô thị, có thể lắp thêm pin thứ hai và có quãng đường khoảng 160 km.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Đèn LED",
                "tail_light": "Đèn hậu LED"
              },
              "charging_info_text": "Sạc đầy từ 0% đến 100% trong khoảng 4 giờ 30 phút.",
              "technology_features": {
                "display": "Màn hình TFT kết nối Bluetooth",
                "smart_key": true,
                "license_requirement": "Cần bằng lái theo quy định do tốc độ tối đa 70 km/h",
                "battery_configuration": "Pin LFP 1,5 kWh, tùy chọn lắp thêm pin"
              },
              "range_condition_text": "Khoảng 160 km khi lắp 2 pin theo điều kiện kiểm thử của VinFast.",
              "technical_specs_text": "VinFast Kyo sử dụng động cơ Inhub công suất định mức 1.800 W, công suất tối đa khoảng 3.000 W, tốc độ tối đa 70 km/h và pin LFP 1,5 kWh.",
              "battery_capacity_text": "Pin LFP 1,5 kWh; có tùy chọn lắp thêm pin thứ hai."
            },
            "battery_quantity": 1,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 3000,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "f5d9fbcd-6329-4fa5-89b0-191b3251ac3b",
    "code": "Viper",
    "name": "VinFast Viper Kèm pin",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Viper.jpg",
    "basePrice": 45500000,
    "range": 156,
    "battery": "Lithium Iron Phosphate LFP",
    "acceleration": "Vận tốc max: 70 km/h",
    "topSpeed": 70,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Đỏ Đen",
      "Trắng",
      "Đen",
      "Xám Xi Măng",
      "Vàng Cát"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 3000W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "f5d9fbcd-6329-4fa5-89b0-191b3251ac3b",
      "id": "f5d9fbcd-6329-4fa5-89b0-191b3251ac3b",
      "model_name": "VinFast Viper Kèm pin",
      "vehicle_line": "Viper",
      "name": "VinFast Viper Kèm pin",
      "code": "Viper",
      "version": "Kèm pin",
      "category": "motorbike",
      "list_price": 45500000,
      "base_price": 45500000,
      "colors": [
        "Đỏ Đen",
        "Trắng",
        "Đen",
        "Xám Xi Măng",
        "Vàng Cát"
      ],
      "image_url": "/static/uploads/motorbikes/Viper.jpg",
      "range_km": 156,
      "charging_time_minutes": 270,
      "battery_type": "Lithium Iron Phosphate LFP",
      "battery_quantity": 1,
      "battery_capacity_kwh": 1.5,
      "motor_type": "Động cơ BLDC Inhub",
      "maximum_power_w": 3000,
      "maximum_speed_kmh": 70,
      "weight_kg": null,
      "length_mm": 1910,
      "width_mm": 692,
      "height_mm": 1083,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "motorbike_id": "f5d9fbcd-6329-4fa5-89b0-191b3251ac3b",
            "model_name": "VinFast Viper"
          },
          "specifications": {
            "additional_specs": {
              "description_text": "VinFast Viper là xe máy điện kiểu dáng thể thao, hỗ trợ lắp thêm pin phụ.",
              "front_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "rear_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "warranty_text": "Bảo hành xe 6 năm. Bảo hành pin 8 năm theo chính sách VinFast hiện hành.",
              "colors": [
                "Đỏ Đen",
                "Trắng",
                "Đen",
                "Xám Xi Măng",
                "Vàng Cát"
              ]
            },
            "motorbike_id": "f5d9fbcd-6329-4fa5-89b0-191b3251ac3b",
            "version": "Kèm pin",
            "range_km": 156,
            "width_mm": 692,
            "height_mm": 1083,
            "length_mm": 1910,
            "is_active": true,
            "list_price": 45500000,
            "model_year": 2024,
            "motor_type": "Động cơ BLDC Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "wet_weight_kg": 150,
            "charger_power_w": 400,
            "battery_quantity": 1,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 3000,
            "battery_swap_supported": true,
            "underseat_storage_liters": 22
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "motorbike_id": "f5d9fbcd-6329-4fa5-89b0-191b3251ac3b",
            "model_name": "VinFast Viper"
          },
          "specifications": {
            "additional_specs": {
              "description_text": "VinFast Viper là xe máy điện kiểu dáng thể thao, hỗ trợ lắp thêm pin phụ.",
              "front_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "rear_suspension": "Giảm xóc ống lồng trước / Lò xo đôi sau",
              "warranty_text": "Bảo hành xe 6 năm. Bảo hành pin 8 năm theo chính sách VinFast hiện hành.",
              "colors": [
                "Đỏ Đen",
                "Trắng",
                "Đen",
                "Xám Xi Măng",
                "Vàng Cát"
              ]
            },
            "motorbike_id": "f5d9fbcd-6329-4fa5-89b0-191b3251ac3b",
            "version": "Kèm pin",
            "range_km": 156,
            "width_mm": 692,
            "height_mm": 1083,
            "length_mm": 1910,
            "is_active": true,
            "list_price": 45500000,
            "model_year": 2024,
            "motor_type": "Động cơ BLDC Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "wet_weight_kg": 150,
            "charger_power_w": 400,
            "battery_quantity": 1,
            "maximum_speed_kmh": 70,
            "removable_battery": true,
            "battery_capacity_kwh": 1.5,
            "charging_time_minutes": 270,
            "maximum_motor_power_w": 3000,
            "battery_swap_supported": true,
            "underseat_storage_liters": 22
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  },
  {
    "id": "95582801-f8a2-4aea-9d19-902fb996e2c9",
    "code": "Kinet",
    "name": "VinFast Kinet Kèm pin",
    "tagline": "Mẫu xe máy điện thông minh VinFast",
    "category": "scooter",
    "image": "/static/uploads/motorbikes/Kinet.jpg",
    "basePrice": 49900000,
    "range": 145,
    "battery": "Lithium Iron Phosphate LFP",
    "acceleration": "Vận tốc max: 90 km/h",
    "topSpeed": 90,
    "seats": 2,
    "isNew": true,
    "colors": [
      "Xám Xi Măng",
      "Đen Bóng",
      "Đỏ Đen",
      "Trắng Ngọc Trai",
      "Nâu Ánh Kim"
    ],
    "description": "",
    "highlights": [
      "Công suất tối đa: 5200W",
      "Kháng nước IP67 (0.5m trong 30p)",
      "Pin LFP tuổi thọ cao",
      "Định vị GPS & Khóa Smartkey"
    ],
    "rawSpecs": {
      "motorbike_id": "95582801-f8a2-4aea-9d19-902fb996e2c9",
      "id": "95582801-f8a2-4aea-9d19-902fb996e2c9",
      "model_name": "VinFast Kinet Kèm pin",
      "vehicle_line": "Kinet",
      "name": "VinFast Kinet Kèm pin",
      "code": "Kinet",
      "version": "Kèm pin",
      "category": "motorbike",
      "list_price": 49900000,
      "base_price": 49900000,
      "colors": [
        "Xám Xi Măng",
        "Đen Bóng",
        "Đỏ Đen",
        "Trắng Ngọc Trai",
        "Nâu Ánh Kim"
      ],
      "image_url": "/static/uploads/motorbikes/Kinet.jpg",
      "range_km": 145,
      "charging_time_minutes": 540,
      "battery_type": "Lithium Iron Phosphate LFP",
      "battery_quantity": 2,
      "battery_capacity_kwh": 3,
      "motor_type": "Động cơ điện Inhub",
      "maximum_power_w": 5200,
      "maximum_speed_kmh": 90,
      "weight_kg": null,
      "length_mm": null,
      "width_mm": null,
      "height_mm": null,
      "front_brake": "",
      "rear_brake": "",
      "front_suspension": "",
      "rear_suspension": "",
      "additional_specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Kinet",
            "motorbike_id": "95582801-f8a2-4aea-9d19-902fb996e2c9"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 145,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 49900000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "95582801-f8a2-4aea-9d19-902fb996e2c9",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Xám Xi Măng",
                "Đen Bóng",
                "Đỏ Đen",
                "Trắng Ngọc Trai",
                "Nâu Ánh Kim"
              ],
              "images": [],
              "rear_tire": "120/70-14 không săm",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "90/90-14 không săm",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá niêm yết kèm pin: 49.900.000 VNĐ, đã bao gồm VAT và 1 bộ sạc. Giá không kèm pin: 40.000.000 VNĐ.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Hai pin đặt dưới sàn/yên xe.",
              "description_text": "VinFast Kinet là xe máy điện kiểu dáng thể thao, sử dụng hai pin LFP và có quãng đường khoảng 145 km theo điều kiện kiểm thử của VinFast.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Cụm đèn Full LED",
                "daytime_running_light": "Dải đèn LED định vị ban ngày"
              },
              "charging_info_text": "Sạc tiêu chuẩn khoảng 9 giờ. Nếu sử dụng bộ sạc 1.000 W, thời gian sạc khoảng 3,5 giờ.",
              "technology_features": {
                "gps": "Kết nối ứng dụng VinFast e-Scooter",
                "display": "Màn hình TFT",
                "auto_hold": true,
                "bluetooth": true,
                "smart_key": true,
                "riding_modes": "Eco và Sport",
                "battery_management": true
              },
              "range_condition_text": "Khoảng 145 km theo điều kiện kiểm thử của VinFast với 2 pin.",
              "technical_specs_text": "Động cơ Inhub, công suất định mức 3.000 W, công suất tối đa khoảng 5.200 W, tốc độ tối đa 90 km/h, hai pin LFP tổng dung lượng 3,0 kWh.",
              "battery_capacity_text": "Hai pin LFP, mỗi pin 1,5 kWh."
            },
            "battery_quantity": 2,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 90,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 3,
            "charging_time_minutes": 540,
            "maximum_motor_power_w": 5200,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "specs": {
        "_legacy_source": {
          "catalog": {
            "model_name": "VinFast Kinet",
            "motorbike_id": "95582801-f8a2-4aea-9d19-902fb996e2c9"
          },
          "specifications": {
            "version": "Kèm pin",
            "range_km": 145,
            "width_mm": 683,
            "height_mm": 1133,
            "is_active": true,
            "length_mm": 1856,
            "list_price": 49900000,
            "model_year": 2026,
            "motor_type": "Động cơ điện Inhub",
            "battery_type": "Lithium Iron Phosphate LFP",
            "charger_type": "Bộ sạc tiêu chuẩn dùng điện gia đình",
            "motorbike_id": "95582801-f8a2-4aea-9d19-902fb996e2c9",
            "wet_weight_kg": 86,
            "charger_power_w": 400,
            "additional_specs": {
              "colors": [
                "Xám Xi Măng",
                "Đen Bóng",
                "Đỏ Đen",
                "Trắng Ngọc Trai",
                "Nâu Ánh Kim"
              ],
              "images": [],
              "rear_tire": "120/70-14 không săm",
              "created_at": "2026-07-31T08:55:21.58509+00:00",
              "front_tire": "90/90-14 không săm",
              "rear_brake": "chưa công bố",
              "updated_at": "2026-07-31T08:55:21.58509+00:00",
              "front_brake": "chưa công bố",
              "source_refs": [],
              "warranty_text": "chưa công bố",
              "price_info_text": "Giá niêm yết kèm pin: 49.900.000 VNĐ, đã bao gồm VAT và 1 bộ sạc. Giá không kèm pin: 40.000.000 VNĐ.",
              "rear_suspension": "Giảm xóc đôi, giảm chấn thủy lực",
              "battery_location": "Hai pin đặt dưới sàn/yên xe.",
              "description_text": "VinFast Kinet là xe máy điện kiểu dáng thể thao, sử dụng hai pin LFP và có quãng đường khoảng 145 km theo điều kiện kiểm thử của VinFast.",
              "front_suspension": "Ống lồng, giảm chấn thủy lực",
              "lighting_features": {
                "headlight": "Cụm đèn Full LED",
                "daytime_running_light": "Dải đèn LED định vị ban ngày"
              },
              "charging_info_text": "Sạc tiêu chuẩn khoảng 9 giờ. Nếu sử dụng bộ sạc 1.000 W, thời gian sạc khoảng 3,5 giờ.",
              "technology_features": {
                "gps": "Kết nối ứng dụng VinFast e-Scooter",
                "display": "Màn hình TFT",
                "auto_hold": true,
                "bluetooth": true,
                "smart_key": true,
                "riding_modes": "Eco và Sport",
                "battery_management": true
              },
              "range_condition_text": "Khoảng 145 km theo điều kiện kiểm thử của VinFast với 2 pin.",
              "technical_specs_text": "Động cơ Inhub, công suất định mức 3.000 W, công suất tối đa khoảng 5.200 W, tốc độ tối đa 90 km/h, hai pin LFP tổng dung lượng 3,0 kWh.",
              "battery_capacity_text": "Hai pin LFP, mỗi pin 1,5 kWh."
            },
            "battery_quantity": 2,
            "battery_voltage_v": null,
            "maximum_speed_kmh": 90,
            "removable_battery": true,
            "battery_capacity_ah": null,
            "rated_motor_power_w": null,
            "battery_capacity_kwh": 3,
            "charging_time_minutes": 540,
            "maximum_motor_power_w": 5200,
            "battery_swap_supported": true,
            "underseat_storage_liters": 12,
            "water_resistance_standard": null
          }
        }
      },
      "is_active": true,
      "is_available": true,
      "created_at": "2026-08-09T09:00:58.840125Z",
      "updated_at": "2026-08-09T15:03:55.415054Z"
    }
  }
];

export const heroSlides = [
  {
    vehicleId: 'vf9',
    modelName: 'VF 9',
    title: 'Lựa Chọn Hạng Thương Gia Đỉnh Cao',
    subtitle: 'Mẫu SUV điện 7 chỗ Flagship thượng lưu, sở hữu trần kính toàn cảnh, ghế thương gia massage & tầm xa di chuyển tới 602 km.',
    imageFallback: '/VINpng/AdsCars/vf9-4k.png',
    badge: 'FLAGSHIP SUV 7 CHỖ',
    stats: [
      { value: '602 km', label: 'Tầm hoạt động' },
      { value: '402 HP', label: 'Công suất cực đại' },
      { value: '6.5s', label: '0-100 km/h' }
    ]
  },
  {
    vehicleId: 'vf8',
    modelName: 'VF 8',
    title: 'Chinh Phục Mọi Hành Trình Đỉnh Cao',
    subtitle: 'SUV điện hạng D toàn cầu với công suất 402 mã lực, hệ thống dẫn động 2 cầu AWD và trợ lý ảo thông minh vượt trội.',
    imageFallback: '/VINpng/AdsCars/vf8-4k.png',
    badge: 'SUV HẠNG D CAO CẤP',
    stats: [
      { value: '471 km', label: 'Tầm hoạt động' },
      { value: '402 HP', label: 'Công suất cực đại' },
      { value: '5.5s', label: '0-100 km/h' }
    ]
  },
  {
    vehicleId: 'vf6',
    modelName: 'VF 6',
    title: 'Tuyệt Phẩm SUV Hạng B Đô Thị',
    subtitle: 'Thiết kế cá tính bởi Torino Design, trang bị màn hình 12.9 inch cùng hệ thống hỗ trợ lái thông minh ADAS cấp độ 2.',
    imageFallback: '/VINpng/AdsCars/vf6-4k.png',
    badge: 'MỚI RA MẮT',
    stats: [
      { value: '485 km', label: 'Tầm hoạt động' },
      { value: '201 HP', label: 'Công suất cực đại' },
      { value: '8.9s', label: '0-100 km/h' }
    ]
  }
];
