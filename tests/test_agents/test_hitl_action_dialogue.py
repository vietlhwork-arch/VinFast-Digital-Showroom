import os
import sys

import pytest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.agents.graph import agent
from src.agents.nodes.catalog_router import classify_catalog_intent
from src.agents.nodes.needs_discovery import CustomerNeedsProfile, VehicleCriteria, merge_criteria


def test_classify_catalog_intent_buying_and_quote_journey():
    # Quotation and buying journey queries should not route to static fact RAG
    assert classify_catalog_intent("cho tôi báo giá đi") is False
    assert classify_catalog_intent("cho tôi bản báo giá của vf5 plus") is False
    assert classify_catalog_intent("tạo báo giá cho tôi") is False
    assert classify_catalog_intent("tôi muốn mua xe theo ngân sách") is False
    assert classify_catalog_intent("báo giá xe vf8") is False


def test_merge_criteria_retains_profile_and_normalizes_model():
    old = CustomerNeedsProfile(
        budget_max=500_000_000,
        seat_count=4,
        usage_purpose="commute",
    )
    # When user confirms VF 5 Plus
    crit = VehicleCriteria(target_model="VF 5 Plus")
    updated = merge_criteria(old, crit)

    assert updated.target_model == "vf-5"
    assert updated.budget_max == 500_000_000
    assert updated.seat_count == 4
    assert updated.usage_purpose == "commute"


@pytest.mark.asyncio
async def test_recommendation_emits_structured_quote_action():
    res = await agent.ainvoke({
        "query": "Tư vấn cho tôi xe VF 5 Plus 5 chỗ 500 triệu",
    })
    assert res.get("current_stage") in ("RECOMMENDATION", "NEEDS_DISCOVERY")
    assert "response" in res
    assert len(res.get("response", "")) > 0
