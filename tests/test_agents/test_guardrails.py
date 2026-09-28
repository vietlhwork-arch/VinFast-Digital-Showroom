import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import pytest

from src.agents.graph import agent
from src.agents.nodes.guardrails import (
    classify_intent_and_guardrails,
    guardrail_node,
)


def test_guardrails_in_scope_vinfast():
    res1 = classify_intent_and_guardrails("VF 8 Eco dung lượng pin bao nhiêu kWh?")
    assert res1.intent == "IN_SCOPE_VINFAST"
    assert res1.is_safe is True


def test_guardrail_node_execution_passthrough():
    state = {"query": "Tôi muốn mua xe VF 5 Plus"}
    out = guardrail_node(state)

    assert out["is_blocked"] is False
    assert out["current_stage"] in ("GUARDRAIL", "NEEDS_DISCOVERY")


@pytest.mark.asyncio
async def test_agent_graph_with_guardrail_out_of_scope():
    res = await agent.ainvoke({"query": "Hỏi về bóng đá Ngoại hạng Anh"})
    assert "response" in res or "current_stage" in res


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
