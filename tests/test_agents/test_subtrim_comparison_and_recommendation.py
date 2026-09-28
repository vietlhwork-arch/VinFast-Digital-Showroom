import pytest
from src.services.catalog_service import (
    get_dynamic_model_keyword_map,
    fetch_cars_for_models,
    fetch_cars_from_supabase,
)
from src.agents.nodes.needs_discovery import CustomerNeedsProfile, VehicleCriteria, merge_criteria
from src.agents.nodes.recommendation import select_best_vehicle_candidates, recommendation_node


def test_vf7_subtrim_comparison_aliases():
    """Test Bug 1 & 2: Sub-trim comparison 'VF 7 Plus trần kính khác gì trần thép'."""
    km = get_dynamic_model_keyword_map()
    query = "VF 7 Plus trần kính khác gì trần thép"
    low_q = query.lower()
    known_models = sorted(km.keys(), key=len, reverse=True)
    matched_keywords = []
    found_models = []
    for m in known_models:
        if m in low_q and not any(m in existing for existing in matched_keywords):
            matched_keywords.append(m)
            code = km[m]
            if code not in found_models:
                found_models.append(code)

    assert len(found_models) == 2
    matched_cars = fetch_cars_for_models(found_models)
    car_names = [c["name"] for c in matched_cars]

    assert len(matched_cars) == 2
    assert any("Trần kính" in n for n in car_names)
    assert any("Trần thép" in n for n in car_names)
    assert not any("VF MPV 7" in n for n in car_names)
    assert not any("VF 7 Eco" in n for n in car_names)


def test_model_normalization_preserves_trims():
    """Test Bug 1: Trim normalization preserves Plus, Eco, and does not conflate models."""
    km = get_dynamic_model_keyword_map()
    # VF 7 Eco vs VF 7 Plus
    assert km.get("vf 7 eco") == "vf-7-eco"
    assert "vf-7-plus" in km.get("vf 7 plus", "")


def test_recommendation_multi_attribute_forwarding():
    """Test Bug 4: select_best_vehicle_candidates forwards multi-attribute filters."""
    # 7-seater filter
    profile_7seats = {"seat_counts": [7], "usage_purpose": "family"}
    res_7seats = select_best_vehicle_candidates(profile_7seats)
    assert res_7seats and res_7seats[0]["seats"] == 7

    # AWD filter
    profile_awd = {"drivetrain": "AWD"}
    res_awd = select_best_vehicle_candidates(profile_awd)
    assert res_awd and "awd" in str(res_awd[0].get("drivetrain", "")).lower()


def test_recommendation_node_dynamic_model_matching():
    """Test Bug 4: recommendation_node matches comparison without hardcoded regex."""
    state_comp = {
        "query": "So sánh Minio Green và Herio Green",
        "user_profile": {"vehicle_type_preference": "CAR"},
    }
    out = recommendation_node(state_comp)
    assert len(out.get("recommended_cars", [])) == 2
    assert len(out.get("tco_result", {}).get("items", [])) == 2
    assert out.get("action") is None
