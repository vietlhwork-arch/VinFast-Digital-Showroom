"""Lightweight MMR selection for fused catalog candidates."""

from __future__ import annotations

import math
from typing import Protocol

from src.services.rag.config import MMRConfig
from src.services.rag.retrieval.models import FusedCandidate, RerankedCandidate


class Reranker(Protocol):
    async def rerank(
        self,
        query: str,
        candidates: list[FusedCandidate],
        *,
        top_n: int,
    ) -> list[RerankedCandidate]: ...


def _cosine_similarity(
    left: tuple[float, ...],
    right: tuple[float, ...],
) -> float:
    if not left or not right:
        return 0.0
    if len(left) != len(right):
        raise ValueError("MMR candidate embeddings must have the same dimensions")
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))
    if left_norm == 0.0 or right_norm == 0.0:
        return 0.0
    return sum(a * b for a, b in zip(left, right, strict=True)) / (left_norm * right_norm)


def _normalized_relevance(candidates: list[FusedCandidate]) -> list[float]:
    """Normalize Weighted-RRF relevance while preserving its hybrid signal."""
    maximum = max((candidate.rrf_score for candidate in candidates), default=0.0)
    if maximum > 0.0:
        return [candidate.rrf_score / maximum for candidate in candidates]
    return [1.0 / max(candidate.rrf_rank, 1) for candidate in candidates]


class MMRReranker:
    """Balance Weighted-RRF relevance against candidate-vector redundancy."""

    def __init__(self, config: MMRConfig) -> None:
        self._lambda = config.lambda_mult

    async def rerank(
        self,
        query: str,
        candidates: list[FusedCandidate],
        *,
        top_n: int,
    ) -> list[RerankedCandidate]:
        del query  # Relevance already comes from Hybrid Search + Weighted RRF.
        if not candidates or top_n < 1:
            return []

        relevance = _normalized_relevance(candidates)
        remaining = set(range(len(candidates)))
        selected: list[int] = []
        selection_scores: list[float] = []

        while remaining and len(selected) < min(top_n, len(candidates)):
            scored: list[tuple[float, float, int, str, int]] = []
            for index in remaining:
                redundancy = max(
                    (
                        _cosine_similarity(
                            candidates[index].embedding,
                            candidates[selected_index].embedding,
                        )
                        for selected_index in selected
                    ),
                    default=0.0,
                )
                mmr_score = self._lambda * relevance[index] - (1.0 - self._lambda) * redundancy
                scored.append(
                    (
                        mmr_score,
                        relevance[index],
                        -candidates[index].rrf_rank,
                        candidates[index].vector_id,
                        index,
                    )
                )

            mmr_score, _, _, _, best_index = max(scored)
            selected.append(best_index)
            selection_scores.append(mmr_score)
            remaining.remove(best_index)

        return [
            RerankedCandidate(
                candidate=candidates[index],
                rerank_score=float(selection_scores[rank - 1]),
                rerank_rank=rank,
            )
            for rank, index in enumerate(selected, start=1)
        ]


def build_reranker(config: MMRConfig) -> Reranker:
    return MMRReranker(config)


__all__ = ["MMRReranker", "Reranker", "build_reranker"]
