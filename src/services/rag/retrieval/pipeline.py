"""Closed retrieval flow: fusion, hybrid search, RRF, rerank, snippets."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from src.services.rag.common.chunking import AsyncEmbedder
from src.services.rag.config import RetrievalConfig
from src.services.rag.retrieval.models import (
    RankedSearchList,
    ResolvedRetrievalScope,
    RetrievalFilters,
    RetrievalResult,
)
from src.services.rag.retrieval.query_fusion import QueryPlanner
from src.services.rag.retrieval.repository import HybridSearchRepository
from src.services.rag.retrieval.reranker import Reranker
from src.services.rag.retrieval.rrf import reciprocal_rank_fusion
from src.services.rag.retrieval.snippets import (
    build_structured_snippets,
    format_structured_context,
)
from src.services.rag.retrieval.vehicle_resolver import VehicleResolver


class CatalogRetrievalPipeline:
    def __init__(
        self,
        *,
        planner: QueryPlanner,
        embedder: AsyncEmbedder,
        repository: HybridSearchRepository,
        reranker: Reranker,
        resolver: VehicleResolver | None = None,
        config: RetrievalConfig | None = None,
    ) -> None:
        self._planner = planner
        self._embedder = embedder
        self._repository = repository
        self._reranker = reranker
        self._resolver = resolver
        self._config = config or RetrievalConfig()

    async def retrieve(
        self,
        db: AsyncSession,
        query: str,
        *,
        filters: RetrievalFilters | None = None,
    ) -> RetrievalResult:
        base_filters = filters or RetrievalFilters()
        scope = (
            await self._resolver.resolve(db, query, base_filters)
            if self._resolver is not None
            else ResolvedRetrievalScope(filters=base_filters)
        )
        resolved_filters = scope.filters
        query_plan = await self._planner.plan(query)
        embeddings = await self._embedder.aembed_documents(list(query_plan.queries))
        if len(embeddings) != len(query_plan.queries):
            raise ValueError("The number of query embeddings must match query variants")

        ranked_lists: list[RankedSearchList] = []
        for index, (variant, embedding) in enumerate(zip(query_plan.queries, embeddings, strict=True)):
            dense_hits = await self._repository.dense_search(
                db,
                query=variant,
                embedding=embedding,
                filters=resolved_filters,
                top_k=self._config.dense_top_k,
            )
            lexical_hits = await self._repository.lexical_search(
                db,
                query=variant,
                filters=resolved_filters,
                top_k=self._config.lexical_top_k,
            )
            ranked_lists.extend(
                (
                    RankedSearchList(
                        name=f"dense:{index}",
                        weight=self._config.semantic_weight,
                        hits=tuple(dense_hits),
                    ),
                    RankedSearchList(
                        name=f"lexical:{index}",
                        weight=self._config.lexical_weight,
                        hits=tuple(lexical_hits),
                    ),
                )
            )

        fused = reciprocal_rank_fusion(
            ranked_lists,
            rrf_k=self._config.rrf_k,
            top_k=self._config.rrf_top_k,
        )
        reranked = await self._reranker.rerank(
            query_plan.original_query,
            fused,
            top_n=min(self._config.rerank_top_k, len(fused)),
        )
        snippets = build_structured_snippets(
            reranked,
            top_k=self._config.final_top_k,
            preferred_vehicle_ids=tuple(vehicle.vehicle_id for vehicle in scope.vehicles),
        )
        return RetrievalResult(
            query_plan=query_plan,
            resolved_vehicles=scope.vehicles,
            fused_candidates=tuple(fused),
            reranked_candidates=tuple(reranked),
            snippets=tuple(snippets),
            context=format_structured_context(snippets),
        )


__all__ = ["CatalogRetrievalPipeline", "RetrievalConfig"]
