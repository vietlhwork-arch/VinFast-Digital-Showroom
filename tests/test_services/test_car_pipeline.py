from src.services.rag.cars.pipeline import group_car_row


def test_car_row_is_grouped_without_metadata_fields():
    row = {
        "car_id": "car-1",
        "model_name": "VF8 Plus",
        "vehicle_line": "VF8",
        "version": "Plus",
        "category": "Personal",
        "seat_count": 5,
        "length": 4750,
        "width": 1934,
        "height": 1667,
        "wheelbase": 2950,
        "range_km": 457,
        "maximum_power_kw": 300,
        "maximum_torque_nm": 620,
        "usable_battery_capacity_kwh": 87.7,
        "list_price": 1079000000,
        "colors": [{"name": "Trắng"}, {"name": "Đỏ"}],
        "created_at": "must-not-appear",
        "updated_at": "must-not-appear",
        "is_active": True,
        "additional_specs": {
            "_legacy_source": {
                "specifications": {
                    "seat_count": 99,
                    "additional_specs": {
                        "drivetrain": "AWD",
                        "charging_info_text": "Sáº¡c nhanh 10-70%",
                        "ground_clearance_mm": 179,
                        "cargo_capacity_folded_liters": 1373,
                        "front_brake": "Phanh Ä‘Ä©a",
                        "rear_suspension": "Äa liĂªn káº¿t",
                        "tires_wheels": "R19",
                        "warranty_text": "10 nÄƒm",
                        "safety_features": {"airbags": 8},
                        "driver_assistance_features": {"lane_keep": True},
                        "interior_features": {"screen": "15.6 inch"},
                        "exterior_features": {"lights": "LED"},
                    },
                }
            }
        },
    }

    document = group_car_row(row)

    assert set(document.semantic_groups) == {
        "overview_dimensions",
        "performance_energy",
        "chassis_safety",
        "adas_parking",
        "interior_technology",
        "exterior",
    }
    assert "Số ghế: 5" in document.semantic_groups["overview_dimensions"]
    assert "Số ghế: 99" not in document.semantic_groups["overview_dimensions"]
    assert "created_at" not in "\n".join(document.semantic_groups.values())
    assert "updated_at" not in "\n".join(document.semantic_groups.values())
    assert "Personal" in document.semantic_groups["overview_dimensions"]
    assert "Màu xe: Trắng, Đỏ" in document.semantic_groups["exterior"]
    assert "colors" in document.group_source_paths["exterior"]
    assert "ground_clearance_mm: 179" in document.semantic_groups["overview_dimensions"]
    assert "cargo_capacity_folded_liters: 1373" in document.semantic_groups["overview_dimensions"]
    assert "warranty_text: 10 nÄƒm" in document.semantic_groups["overview_dimensions"]
    assert "charging_info_text: Sáº¡c nhanh 10-70%" in document.semantic_groups["performance_energy"]
    assert "front_brake: Phanh Ä‘Ä©a" in document.semantic_groups["chassis_safety"]
    assert "rear_suspension: Äa liĂªn káº¿t" in document.semantic_groups["chassis_safety"]
    assert "tires_wheels: R19" in document.semantic_groups["chassis_safety"]
    assert document.car.version == "Plus"


def test_color_metadata_and_count_are_kept_in_exterior_chunk():
    document = group_car_row(
        {
            "car_id": "car-color-1",
            "model_name": "VF5",
            "vehicle_line": "VF 5",
            "version": "Tiêu chuẩn",
            "colors": [
                {
                    "name": "Đỏ",
                    "official_name": "Solar Ruby",
                    "color_code": "solar-ruby",
                    "type": "solid",
                    "price_tier": "basic",
                    "price_delta": 0,
                    "image_url": None,
                }
            ],
            "additional_specs": {"colors": [{"name": "Màu cũ"}]},
        }
    )

    exterior = document.semantic_groups["exterior"]
    assert "Màu xe: Đỏ (Solar Ruby)" in exterior
    assert "color_code=solar-ruby" in exterior
    assert "price_delta=0" in exterior
    assert "Số màu ngoại thất: 1" in exterior


def test_ebus_null_colors_do_not_fallback_to_legacy_colors():
    document = group_car_row(
        {
            "car_id": "bus-1",
            "model_name": "VinFast EBus",
            "vehicle_line": "EBus",
            "version": "EB 6",
            "colors": None,
            "additional_specs": {
                "_legacy_source": {
                    "specifications": {"additional_specs": {"colors": ["Đỏ"]}}
                }
            },
        }
    )

    assert "exterior" not in document.semantic_groups
    assert "colors" not in document.group_source_paths["exterior"]
