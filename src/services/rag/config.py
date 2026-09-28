"""Code-owned configuration for the catalog RAG domain."""

from __future__ import annotations

from dataclasses import dataclass, field

from src.services.rag.common.chunking import ChunkingConfig


@dataclass(frozen=True, slots=True)
class EmbeddingExecutionConfig:
    max_concurrency: int = 4
    batch_size: int = 64
    max_retries: int = 5
    retry_min_seconds: int = 1
    retry_max_seconds: int = 20


@dataclass(frozen=True, slots=True)
class QueryFusionConfig:
    enabled: bool = True
    model: str = "gpt-4o-mini"
    max_queries: int = 3


@dataclass(frozen=True, slots=True)
class RetrievalConfig:
    dense_top_k: int = 20
    lexical_top_k: int = 20
    rrf_top_k: int = 20
    rrf_k: int = 60
    semantic_weight: float = 0.6
    lexical_weight: float = 0.4
    rerank_top_k: int = 20
    final_top_k: int = 3

    def __post_init__(self) -> None:
        limits = (
            self.dense_top_k,
            self.lexical_top_k,
            self.rrf_top_k,
            self.rrf_k,
            self.rerank_top_k,
        )
        if any(value < 1 for value in limits):
            raise ValueError("retrieval limits must be positive")
        if not 3 <= self.final_top_k <= 5:
            raise ValueError("final_top_k must be between 3 and 5")
        if self.semantic_weight < 0 or self.lexical_weight < 0:
            raise ValueError("retrieval weights must not be negative")
        if self.semantic_weight + self.lexical_weight <= 0:
            raise ValueError("at least one retrieval weight must be positive")


@dataclass(frozen=True, slots=True)
class MMRConfig:
    lambda_mult: float = 0.65

    def __post_init__(self) -> None:
        if not 0.0 <= self.lambda_mult <= 1.0:
            raise ValueError("lambda_mult must be between 0 and 1")


@dataclass(frozen=True, slots=True)
class RagConfig:
    embedding: EmbeddingExecutionConfig = field(default_factory=EmbeddingExecutionConfig)
    chunking: ChunkingConfig = field(
        default_factory=lambda: ChunkingConfig(
            max_chars=1500,
            min_chunk_chars=350,
            similarity_threshold=0.74,
            max_units_per_chunk=8,
        )
    )
    query_fusion: QueryFusionConfig = field(default_factory=QueryFusionConfig)
    retrieval: RetrievalConfig = field(default_factory=RetrievalConfig)
    mmr: MMRConfig = field(default_factory=MMRConfig)


RAG_CONFIG = RagConfig()


__all__ = [
    "EmbeddingExecutionConfig",
    "MMRConfig",
    "QueryFusionConfig",
    "RAG_CONFIG",
    "RagConfig",
    "RetrievalConfig",
]
