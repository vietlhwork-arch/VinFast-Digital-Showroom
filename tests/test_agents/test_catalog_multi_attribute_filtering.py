import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import pytest
from src.agents.nodes.needs_discovery import (
    CustomerNeedsProfile,
    VehicleCriteria,
    merge_criteria,
)
from src.services.catalog_service import (
    fetch_cars_from_supabase,
    format_car_record,
    format_motorbike_record,
    get_dynamic_model_keyword_map,
)


def test_format_car_record_full_passthrough():
    """Verify that all columns and additional_specs pass through without loss."""
    raw_car = {
        "id": "test-car-1",
        "code": "test-car-1",
        "name": "VinFast Test Car",
        "model_name": "Test Car",
        "version": "Plus",
        "category": "Personal",
        "body_type": "SUV",
        "drivetrain": "AWD",
        "base_price": 900_000_000,
        "list_price": 900_000_000,
        "seat_count": 5,
        "range_km": 450,
        "power_kw": 260,
        "usable_battery_capacity": 87.7,
        "length_mm": 4750,
        "width_mm": 1900,
        "height_mm": 1660,
        "wheelbase_mm": 2950,
        "additional_specs": {
            "airbags": 11,
            "adas": ["Adaptive Cruise Control", "Lane Keep Assist"],
            "trunk_capacity_liters": 500,
            "ground_clearance_mm": 175,
        },
        "is_active": True,
    }
    formatted = format_car_record(raw_car)

    # Core passthrough
    assert formatted["drivetrain"] == "AWD"
    assert formatted["body_type"] == "SUV"
    assert formatted["battery_kwh"] == 87.7
    assert formatted["airbags"] == 11
    assert formatted["adas"] == ["Adaptive Cruise Control", "Lane Keep Assist"]
    assert formatted["trunk_liters"] == 500
    assert formatted["ground_clearance_mm"] == 175
    assert formatted["dimensions"] == {
        "length_mm": 4750,
        "width_mm": 1900,
        "height_mm": 1660,
        "wheelbase_mm": 2950,
    }


def test_merge_criteria_multi_attribute():
    """Test merge_criteria with seat_counts, drivetrain, body_type, category, min_range_km."""
    profile = CustomerNeedsProfile()
    crit = VehicleCriteria(
        seat_counts=[4, 7],
        drivetrain="AWD",
        body_type="SUV",
        category="Personal",
        min_range_km=400,
        min_power_kw=150,
    )
    merged = merge_criteria(profile, crit)

    assert merged.seat_counts == [4, 7]
    assert merged.drivetrain == "AWD"
    assert merged.body_type == "SUV"
    assert merged.category == "Personal"
    assert merged.min_range_km == 400.0
    assert merged.min_power_kw == 150.0


def test_non_retail_exclusion_from_general_discovery():
    """Lạc Hồng 900 LX and EBus must NOT be returned in general discovery."""
    general_cars = fetch_cars_from_supabase()
    car_codes = [c.get("code", "").lower() for c in general_cars]
    car_names = [c.get("name", "").lower() for c in general_cars]

    for name in car_names:
        assert "lạc hồng" not in name, f"Lạc Hồng found in general discovery: {name}"
    for code in car_codes:
        assert "ebus" not in code, f"EBus found in general discovery: {code}"


def test_multi_seat_filtering():
    """Verify seat_counts=[4, 7] returns vehicles with either 4 or 7 seats."""
    results = fetch_cars_from_supabase(seat_counts=[4, 7])
    for c in results:
        assert c.get("seats") in (4, 7), f"Expected 4 or 7 seats, got {c.get('seats')} for {c.get('name')}"


def test_drivetrain_filtering():
    """Verify drivetrain='AWD' returns only AWD vehicles."""
    results = fetch_cars_from_supabase(drivetrain="AWD")
    assert len(results) > 0
    for c in results:
        assert c.get("drivetrain") == "AWD", f"Expected AWD, got {c.get('drivetrain')} for {c.get('name')}"


def test_body_type_filtering():
    """Verify body_type='MPV' finds the VF MPV 7."""
    results = fetch_cars_from_supabase(body_type="MPV")
    assert len(results) > 0
    assert any("mpv" in c.get("code", "").lower() for c in results)


def test_dynamic_keyword_mpv_vs_vf7():
    """Ensure 'mpv 7' does NOT map to 'vf-7'."""
    kw_map = get_dynamic_model_keyword_map()
    assert "mpv 7" in kw_map
    assert kw_map["mpv 7"] == "vf-mpv-7-tiêu-chuẩn-gia-đình"
    assert kw_map["mpv 7"] != "vf-7"
    assert kw_map["vf mpv 7"] == "vf-mpv-7-tiêu-chuẩn-gia-đình"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
