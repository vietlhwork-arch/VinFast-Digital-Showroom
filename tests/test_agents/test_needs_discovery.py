import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import pytest

from src.agents.graph import agent
from src.agents.nodes.needs_discovery import (
    CustomerNeedsProfile,
    VehicleCriteria,
    build_discovery_prompt,
    decide_stage,
    format_dialogue_history,
    merge_criteria,
    needs_discovery_node,
)


def test_decide_stage_strict_rules():
    # Rule 1: matching_count == 1 -> Complete (Single candidate ready for quote)
    comp, reason = decide_stage(matching_count=1, has_target_model=False)
    assert comp is True
    assert reason == "single_candidate"

    # Rule 2: matching_count > 1 -> Not complete (Prompt user to choose variant)
    comp2, reason2 = decide_stage(matching_count=2, has_target_model=True)
    assert comp2 is False
    assert reason2 == "multiple_candidates"

    # Rule 3: matching_count == 0 -> Not complete
    comp3, reason3 = decide_stage(matching_count=0, has_target_model=False)
    assert comp3 is False
    assert reason3 == "zero_candidates"

    # Rule 4: matching_count > 1 without target -> Not complete
    comp4, reason4 = decide_stage(matching_count=5, has_target_model=False)
    assert comp4 is False
    assert reason4 == "multiple_candidates"


def test_merge_criteria():
    old = CustomerNeedsProfile()
    crit = VehicleCriteria(seat_count=5, budget_max=500_000_000, usage_purpose="commute", colors=["Đỏ"])
    updated = merge_criteria(old, crit)

    assert updated.seat_count == 5
    assert updated.budget_max == 500_000_000
    assert updated.usage_purpose == "commute"
    assert updated.colors == ["Đỏ"]


def test_build_discovery_prompt_jinja2():
    prompt = build_discovery_prompt(
        existing_summary="Khách thích xe điện nhỏ gọn",
        dialogue_history=[{"role": "user", "content": "VF5 giá bao nhiêu"}],
    )
    assert "Khách thích xe điện nhỏ gọn" in prompt
    assert "VF5 giá bao nhiêu" in prompt


def test_dialogue_history_keeps_more_than_six_messages_and_is_bounded():
    messages = [
        {"role": "user" if index % 2 == 0 else "assistant", "content": f"message-{index}"}
        for index in range(12)
    ]

    history = format_dialogue_history(messages)

    assert "message-0" in history
    assert "message-11" in history
    assert history.count("message-") == 12


def test_discovery_prompt_keeps_summary_separate_from_unsummarized_chat():
    prompt = build_discovery_prompt(
        existing_summary="SUMMARY_OLD",
        dialogue_history=[{"role": "user", "content": "NEW_CHAT"}],
    )

    assert "BẢN TÓM TẮT ĐÃ GHI NHẬN TỪ CÁC PHIÊN TRƯỚC:\nSUMMARY_OLD" in prompt
    assert "HỘI THOẠI MỚI CHƯA NẰM TRONG BẢN TÓM TẮT:\nKhách hàng: NEW_CHAT" in prompt


@pytest.mark.asyncio
async def test_needs_discovery_node_execution():
    state = {"query": "Tôi muốn tư vấn mua ô tô 5 chỗ tầm 700 triệu đi gia đình"}
    out = await needs_discovery_node(state)

    assert "current_stage" in out
    assert "is_blocked" in out


@pytest.mark.asyncio
async def test_discontinued_vehicle_handling():
    state = {
        "messages": [{"role": "user", "content": "Tôi muốn mua xe VinFast Fadil thì giá bao nhiêu và showroom còn bán không em?"}],
        "user_profile": {},
    }
    out = await needs_discovery_node(state)
    assert "response" in out
    resp_lower = out["response"].lower()
    assert any(k in resp_lower for k in ("ngừng", "dừng", "hết", "chuyển sang", "không còn"))
    assert any(k in resp_lower for k in ("vf 5", "xe điện", "vf5"))


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

