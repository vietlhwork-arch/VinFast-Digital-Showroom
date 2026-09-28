from __future__ import annotations

import pytest

from src.agents.nodes.catalog_rag import build_catalog_rag_node
from src.services.rag.retrieval.models import (
    QueryPlan,
    RetrievalResult,
    StructuredSnippet,
    VehicleIdentity,
)


@pytest.mark.asyncio
async def test_catalog_rag_node_writes_context_and_trace_metadata():
    class FakeSessionContext:
        async def __aenter__(self):
            return object()

        async def __aexit__(self, exc_type, exc, traceback):
            return False

    snippet = StructuredSnippet(
        vehicle_id="vf8-id",
        vehicle_type="car",
        model_name="VinFast VF 8",
        vehicle_line="Plus",
        chunk_type="performance_energy",
        chunk_index=0,
        text="Dung lượng pin: 87.7 kWh",
        retrieval_rank=1,
        retrieval_score=0.02,
        rerank_rank=1,
        rerank_score=0.95,
    )
    retrieval_result = RetrievalResult(
        query_plan=QueryPlan("VF 8 pin bao nhiêu?", ("VF 8 pin bao nhiêu?",), False),
        resolved_vehicles=(
            VehicleIdentity("vf8-id", "car", "VinFast VF 8", "Plus"),
        ),
        fused_candidates=(),
        reranked_candidates=(),
        snippets=(snippet,),
        context="structured context",
    )

    async def fake_retrieve(db, query, *, filters=None):
        assert query == "VF 8 pin bao nhiêu?"
        assert filters is not None
        assert filters.vehicle_type == "car"
        assert filters.vehicle_ids == ("vf8-id",)
        return retrieval_result

    node = build_catalog_rag_node(
        session_factory=FakeSessionContext,
        retrieve=fake_retrieve,
    )

    update = await node(
        {
            "query": "VF 8 pin bao nhiêu?",
            "metadata": {
                "trace": "1",
                "catalog_route": {
                    "resolved_vehicle_type": "car",
                    "resolved_vehicle_ids": ["vf8-id"],
                },
            },
        }
    )

    assert update["context"] == "structured context"
    assert update["metadata"]["trace"] == "1"
    assert update["metadata"]["rag"]["resolved_vehicles"][0]["vehicle_id"] == "vf8-id"
    assert update["metadata"]["rag"]["snippets"][0]["rerank_score"] == 0.95


@pytest.mark.asyncio
async def test_catalog_rag_node_converts_retrieval_failure_to_safe_state():
    class FakeSessionContext:
        async def __aenter__(self):
            return object()

        async def __aexit__(self, exc_type, exc, traceback):
            return False

    async def failing_retrieve(db, query, *, filters=None):
        del filters
        raise RuntimeError("sensitive internal detail")

    node = build_catalog_rag_node(
        session_factory=FakeSessionContext,
        retrieve=failing_retrieve,
    )
    update = await node({"query": "VF 8"})

    assert update["rag_error"] == "rag_retrieval_failed"
    assert update["context"] == ""
    assert update["metadata"]["rag"]["status"] == "error"
    assert "sensitive internal detail" not in str(update)
