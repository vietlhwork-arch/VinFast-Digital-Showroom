"""Weighted reciprocal-rank fusion without mixing raw retriever scores."""

from __future__ import annotations

from collections import defaultdict

from src.services.rag.retrieval.models import (
    FusedCandidate,
    RankedSearchList,
    SearchHit,
)


def reciprocal_rank_fusion(
    ranked_lists: list[RankedSearchList],
    *,
    rrf_k: int = 60,
    top_k: int = 20,
) -> list[FusedCandidate]:
    if rrf_k < 1 or top_k < 1:
        raise ValueError("rrf_k and top_k must be positive")

    modality_counts: dict[str, int] = defaultdict(int)
    for ranked_list in ranked_lists:
        if ranked_list.hits:
            modality_counts[ranked_list.hits[0].modality] += 1

    scores: dict[str, float] = defaultdict(float)
    matches: dict[str, list[str]] = defaultdict(list)
    canonical: dict[str, SearchHit] = {}
    for ranked_list in ranked_lists:
        if not ranked_list.hits:
            continue
        modality = ranked_list.hits[0].modality
        normalized_weight = ranked_list.weight / modality_counts[modality]
        for fallback_rank, hit in enumerate(ranked_list.hits, start=1):
            rank = hit.rank or fallback_rank
            scores[hit.vector_id] += normalized_weight / (rrf_k + rank)
            matches[hit.vector_id].append(ranked_list.name)
            canonical.setdefault(hit.vector_id, hit)

    ordered_ids = sorted(scores, key=lambda vector_id: (-scores[vector_id], vector_id))[:top_k]
    fused: list[FusedCandidate] = []
    for rank, vector_id in enumerate(ordered_ids, start=1):
        hit = canonical[vector_id]
        fused.append(
            FusedCandidate(
                vector_id=hit.vector_id,
                vehicle_id=hit.vehicle_id,
                vehicle_type=hit.vehicle_type,
                model_name=hit.model_name,
                vehicle_line=hit.vehicle_line,
                chunk_type=hit.chunk_type,
                chunk_index=hit.chunk_index,
                chunk_text=hit.chunk_text,
                rrf_score=scores[vector_id],
                rrf_rank=rank,
                matched_lists=tuple(matches[vector_id]),
                embedding=hit.embedding,
                version=hit.version,
                category=hit.category,
                image_url=hit.image_url,
            )
        )
    return fused


__all__ = ["reciprocal_rank_fusion"]
