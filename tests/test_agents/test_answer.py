from types import SimpleNamespace

import pytest

from src.agents.nodes.answer import build_answer_node


@pytest.mark.asyncio
async def test_answer_node_grounds_prompt_in_catalog_context():
    class FakeLLM:
        async def ainvoke(self, messages):
            assert "VF 8 đi được 457 km" in messages[1][1]
            return SimpleNamespace(content="VF 8 có phạm vi di chuyển 457 km.")

    node = build_answer_node(llm_factory=FakeLLM)
    result = await node(
        {
            "query": "VF 8 đi được bao xa?",
            "context": "VF 8 đi được 457 km",
        }
    )

    assert result["response"] == "VF 8 có phạm vi di chuyển 457 km."


@pytest.mark.asyncio
async def test_answer_node_returns_safe_fallback_for_rag_error():
    def should_not_build_llm():
        raise AssertionError("LLM should not run when RAG failed")

    node = build_answer_node(llm_factory=should_not_build_llm)
    result = await node(
        {
            "query": "VF 8 đi được bao xa?",
            "rag_error": "database_unavailable",
        }
    )

    assert "chưa thể truy xuất dữ liệu catalog" in result["response"]
