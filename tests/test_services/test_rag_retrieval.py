from __future__ import annotations

from dataclasses import replace

import pytest

from src.services.rag.config import MMRConfig, RetrievalConfig
from src.services.rag.retrieval.bm25 import rank_bm25
from src.services.rag.retrieval.models import (
    FusedCandidate,
    QueryPlan,
    RankedSearchList,
    RerankedCandidate,
    RetrievalFilters,
    SearchHit,
    VehicleIdentity,
)
from src.services.rag.retrieval.pipeline import CatalogRetrievalPipeline
from src.services.rag.retrieval.query_fusion import (
    FusionDecision,
    OpenAIQueryFusionPlanner,
)
from src.services.rag.retrieval.reranker import MMRReranker
from src.services.rag.retrieval.rrf import reciprocal_rank_fusion
from src.services.rag.retrieval.snippets import build_structured_snippets
from src.services.rag.retrieval.vehicle_resolver import match_vehicle_identities


@pytest.mark.asyncio
async def test_query_fusion_falls_back_to_original_query_when_llm_fails():
    class BrokenStructuredLLM:
        async def ainvoke(self, messages):
            del messages
            raise TimeoutError("fusion unavailable")

    class FakeLLM:
        def with_structured_output(self, *args, **kwargs):
            del args, kwargs
            return BrokenStructuredLLM()

    planner = OpenAIQueryFusionPlanner(FakeLLM(), max_queries=3)
    plan = await planner.plan("VF 8 pin bao nhiêu?")

    assert plan.queries == ("VF 8 pin bao nhiêu?",)
    assert plan.used_fusion is False


def _hit(
    vector_id: str,
    *,
    text: str = "VinFast VF 8 quãng đường 457 km",
    modality: str = "dense",
    query: str = "VF 8",
    rank: int = 1,
) -> SearchHit:
    return SearchHit(
        vector_id=vector_id,
        vehicle_id=f"vehicle-{vector_id}",
        vehicle_type="car",
        model_name="VF 8",
        vehicle_line="Plus",
        chunk_type="performance_energy",
        chunk_index=0,
        chunk_text=text,
        modality=modality,
        query=query,
        raw_score=1.0,
        rank=rank,
    )


def _candidate(rank: int) -> FusedCandidate:
    return FusedCandidate(
        vector_id=str(rank),
        vehicle_id=f"vehicle-{rank}",
        vehicle_type="car",
        model_name=f"VF {rank}",
        vehicle_line="Standard",
        chunk_type="overview_dimensions",
        chunk_index=0,
        chunk_text=f"Thông tin xe {rank}",
        rrf_score=1 / rank,
        rrf_rank=rank,
        matched_lists=("dense:0",),
    )


def test_bm25_prioritizes_exact_catalog_terms():
    documents = [
        _hit("1", text="VF 8 Plus dung lượng pin 87.7 kWh"),
        _hit("2", text="VF 3 kích thước và số ghế"),
    ]

    ranked = rank_bm25("VF 8 dung lượng pin", documents, top_k=20)

    assert ranked[0].vector_id == "1"
    assert ranked[0].modality == "lexical"
    assert ranked[0].rank == 1


def test_weighted_rrf_rewards_hits_shared_by_dense_and_lexical_lists():
    dense = RankedSearchList(
        name="dense:0",
        weight=0.6,
        hits=(_hit("shared", rank=2), _hit("dense-only", rank=1)),
    )
    lexical = RankedSearchList(
        name="lexical:0",
        weight=0.4,
        hits=(
            _hit("shared", modality="lexical", rank=1),
            _hit("lexical-only", modality="lexical", rank=2),
        ),
    )

    fused = reciprocal_rank_fusion([dense, lexical], rrf_k=60, top_k=20)

    assert fused[0].vector_id == "shared"
    assert set(fused[0].matched_lists) == {"dense:0", "lexical:0"}


@pytest.mark.asyncio
async def test_query_fusion_keeps_original_deduplicates_and_caps_variants():
    class FakeStructuredLLM:
        def with_structured_output(self, *args, **kwargs):
            return self

        async def ainvoke(self, messages):
            return FusionDecision(
                use_fusion=True,
                variants=[
                    "Thông số vận hành VF 8",
                    "Thông số vận hành VF 8",
                    "Khả năng di chuyển của VF 8",
                    "Biến thể vượt giới hạn",
                ],
            )

    planner = OpenAIQueryFusionPlanner(FakeStructuredLLM(), max_queries=3)

    plan = await planner.plan("VF 8 đi được bao xa?")

    assert plan.queries == (
        "VF 8 đi được bao xa?",
        "Thông số vận hành VF 8",
        "Khả năng di chuyển của VF 8",
    )
    assert plan.used_fusion is True


def test_snippet_order_keeps_best_first_and_second_best_last():
    reranked = [RerankedCandidate(_candidate(rank), 1 / rank, rank) for rank in range(1, 4)]

    snippets = build_structured_snippets(reranked, top_k=3)

    assert [snippet.rerank_rank for snippet in snippets] == [1, 3, 2]


def test_vehicle_resolver_prefers_specific_variant_and_keeps_comparison_model():
    vehicles = (
        VehicleIdentity("vf8-plus", "car", "VinFast VF 8 Plus", "VF 8", "Plus"),
        VehicleIdentity("vf8-eco", "car", "VinFast VF 8 Eco", "VF 8", "Eco"),
        VehicleIdentity("vf9", "car", "VinFast VF 9 Plus", "VF 9", "Plus"),
    )

    matched = match_vehicle_identities("So sánh VF 8 Plus và VF 9", vehicles)

    assert [vehicle.vehicle_id for vehicle in matched] == ["vf8-plus", "vf9"]


def test_vehicle_resolver_keeps_shorter_model_when_named_separately_in_comparison():
    vehicles = (
        VehicleIdentity("amio-s", "motorbike", "VinFast Amio S", "Amio S"),
        VehicleIdentity("amio-s2", "motorbike", "VinFast Amio S2", "Amio S2"),
    )

    comparison = match_vehicle_identities(
        "So sánh Amio S và Amio S2",
        vehicles,
    )
    specific = match_vehicle_identities("Amio S2 có giá bao nhiêu?", vehicles)

    assert [vehicle.vehicle_id for vehicle in comparison] == ["amio-s", "amio-s2"]
    assert [vehicle.vehicle_id for vehicle in specific] == ["amio-s2"]


def test_snippet_selector_covers_requested_vehicle_ids_before_duplicates():
    candidates = []
    definitions = [
        (1, "vf8", "performance_energy"),
        (2, "vf8", "performance_energy"),
        (3, "vf9", "performance_energy"),
        (4, "vf8", "chassis_safety"),
        (5, "vf9", "chassis_safety"),
    ]
    for rank, vehicle_id, chunk_type in definitions:
        candidate = replace(
            _candidate(rank),
            vehicle_id=vehicle_id,
            chunk_type=chunk_type,
        )
        candidates.append(RerankedCandidate(candidate, 1 / rank, rank))

    snippets = build_structured_snippets(
        candidates,
        top_k=4,
        preferred_vehicle_ids=("vf8", "vf9"),
    )

    assert {snippet.vehicle_id for snippet in snippets} == {"vf8", "vf9"}
    assert len({(snippet.vehicle_id, snippet.chunk_type) for snippet in snippets}) == 4


def test_open_recommendation_prefers_different_vehicle_ids():
    candidates = [
        RerankedCandidate(
            replace(_candidate(rank), vehicle_id=vehicle_id),
            1 / rank,
            rank,
        )
        for rank, vehicle_id in enumerate(
            ("vf8", "vf8", "vf9", "vf7", "vf6"),
            start=1,
        )
    ]

    snippets = build_structured_snippets(candidates, top_k=4)

    assert {snippet.vehicle_id for snippet in snippets} == {
        "vf8",
        "vf9",
        "vf7",
        "vf6",
    }


@pytest.mark.asyncio
async def test_mmr_keeps_relevance_while_reducing_vector_redundancy():
    candidates = [
        replace(_candidate(1), rrf_score=1.0, embedding=(1.0, 0.0)),
        replace(_candidate(2), rrf_score=0.9, embedding=(0.99, 0.01)),
        replace(_candidate(3), rrf_score=0.8, embedding=(0.0, 1.0)),
    ]
    reranker = MMRReranker(MMRConfig())

    result = await reranker.rerank(
        "VF 8",
        candidates,
        top_n=3,
    )

    assert [item.candidate.vector_id for item in result] == ["1", "3", "2"]
    assert [item.rerank_rank for item in result] == [1, 2, 3]


@pytest.mark.asyncio
async def test_pipeline_keeps_twenty_for_mmr_and_outputs_three_snippets():
    class FakePlanner:
        async def plan(self, query):
            return QueryPlan(query, (query, "biến thể 1", "biến thể 2"), True)

    class FakeEmbedder:
        async def aembed_documents(self, texts):
            return [[1.0, 0.0] for _ in texts]

    class FakeRepository:
        def __init__(self):
            self.dense_calls = []
            self.lexical_calls = []

        async def dense_search(self, db, **kwargs):
            self.dense_calls.append(kwargs)
            return [replace(_hit(str(index), rank=index), query=kwargs["query"]) for index in range(1, 21)]

        async def lexical_search(self, db, **kwargs):
            self.lexical_calls.append(kwargs)
            return [
                replace(
                    _hit(str(index), modality="lexical", rank=index),
                    query=kwargs["query"],
                )
                for index in range(1, 21)
            ]

    class FakeReranker:
        def __init__(self):
            self.top_n = None

        async def rerank(self, query, candidates, *, top_n):
            self.top_n = top_n
            return [
                RerankedCandidate(candidate, 1 / rank, rank)
                for rank, candidate in enumerate(candidates[:top_n], start=1)
            ]

    repository = FakeRepository()
    reranker = FakeReranker()
    pipeline = CatalogRetrievalPipeline(
        planner=FakePlanner(),
        embedder=FakeEmbedder(),
        repository=repository,
        reranker=reranker,
        config=RetrievalConfig(),
    )

    result = await pipeline.retrieve(
        object(),
        "So sánh VF 8",
        filters=RetrievalFilters(vehicle_type="car"),
    )

    assert len(repository.dense_calls) == 3
    assert len(repository.lexical_calls) == 3
    assert all(call["top_k"] == 20 for call in repository.dense_calls)
    assert all(call["top_k"] == 20 for call in repository.lexical_calls)
    assert len(result.fused_candidates) == 20
    assert reranker.top_n == 20
    assert len(result.reranked_candidates) == 20
    assert len(result.snippets) == 3
    assert [snippet.rerank_rank for snippet in result.snippets] == [1, 3, 2]
    assert result.context.startswith("[SNIPPET 1]")
