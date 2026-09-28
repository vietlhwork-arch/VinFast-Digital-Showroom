import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import pytest
from src.agents.nodes.direct_answer import direct_answer_node


@pytest.mark.asyncio
async def test_direct_answer_motorbike_query_no_car_fallback():
    """Bug 2.1: General motorbike questions must not fallback to 4 random cars."""
    state = {
        "query": "xe máy điện VinFast có những tính năng an toàn gì?",
        "messages": [],
    }
    result = await direct_answer_node(state)

    assert "candidate_cars" in result
    candidates = result["candidate_cars"]
    if candidates:
        # All candidates must be motorbikes, not cars
        for c in candidates:
            is_car = c.get("seats") is not None and c.get("seats") > 2
            assert not is_car, f"Found car in motorbike candidates: {c.get('name')}"

    assert result["user_profile"].get("vehicle_type_preference") == "MOTORBIKE"


@pytest.mark.asyncio
async def test_direct_answer_policy_query_no_candidate_pollution():
    """Bug 2.1: General battery/charging policy questions must not be polluted with cars."""
    state = {
        "query": "chính sách thuê pin và sạc tại trạm VinFast như thế nào?",
        "messages": [],
    }
    result = await direct_answer_node(state)

    assert len(result["candidate_cars"]) == 0, "Candidates must be empty for policy queries"


@pytest.mark.asyncio
async def test_direct_answer_user_profile_persistence():
    """Bug 2.3: direct_answer_node must persist target_model and vehicle_type_preference in user_profile."""
    state = {
        "query": "VF 8 chạy được bao xa sau mỗi lần sạc?",
        "messages": [],
        "user_profile": {"prior_tag": "test_tag"},
    }
    result = await direct_answer_node(state)

    profile = result["user_profile"]
    assert profile.get("prior_tag") == "test_tag", "Must preserve existing profile fields"
    assert "vf-8" in profile.get("target_model", "").lower()
    assert profile.get("vehicle_type_preference") == "CAR"
    assert "recent_models" in profile
