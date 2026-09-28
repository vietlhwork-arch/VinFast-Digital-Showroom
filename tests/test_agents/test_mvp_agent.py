import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import pytest

from src.agents.graph import agent
from src.agents.nodes.recommendation import recommendation_node, select_best_vehicle_candidates


def test_select_best_vehicle_candidates_car():
    profile = {
        "vehicle_type_preference": "CAR",
        "budget_max": 800_000_000,
        "seat_count": 5,
    }
    candidates = select_best_vehicle_candidates(profile)
    assert len(candidates) > 0
    assert candidates[0]["seats"] <= 5
    assert candidates[0]["base_price"] <= 900_000_000


def test_select_best_vehicle_candidates_motorbike():
    profile = {
        "vehicle_type_preference": "MOTORBIKE",
        "budget_max": 40_000_000,
    }
    candidates = select_best_vehicle_candidates(profile)
    assert len(candidates) > 0
    assert candidates[0]["base_price"] <= 50_000_000


def test_recommendation_node_execution():
    state = {
        "user_profile": {
            "vehicle_type_preference": "CAR",
            "budget_max": 700_000_000,
            "seat_count": 5,
            "daily_distance_km": 40,
            "usage_purpose": "commute",
        }
    }
    out = recommendation_node(state)

    assert out["current_stage"] == "RECOMMENDATION"
    assert len(out["recommended_cars"]) > 0
    assert "total_rolling_cost" in out["tco_result"]["items"][0]
    assert "Mọi con số mang tính chất ước tính" in out["response"]


@pytest.mark.asyncio
async def test_end_to_end_mvp_agent_blocked_flow():
    # 1. Offensive query handled by agent
    res = await agent.ainvoke({"query": "Đm tư vấn linh tinh vcl"})
    assert "response" in res
    assert len(res.get("response", "")) > 0


@pytest.mark.asyncio
async def test_end_to_end_mvp_agent_guided_needs_flow():
    # 2. Incomplete query -> Guided question asking for missing profile
    res = await agent.ainvoke({"query": "Tôi muốn mua ô tô điện VinFast"})
    assert res.get("is_blocked") is False
    assert len(res.get("response", "")) > 10


@pytest.mark.asyncio
async def test_end_to_end_mvp_agent_full_recommendation_flow():
    # 3. Complete query specifying target model -> Full recommendation response
    res = await agent.ainvoke({"query": "Tư vấn cho tôi ô tô điện VF 5 Plus 5 chỗ tầm 600 triệu đi làm hàng ngày 30km"})
    assert "response" in res
    assert len(res.get("response", "")) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
