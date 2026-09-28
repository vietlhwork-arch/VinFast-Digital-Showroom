"""Public facade for the catalog RAG services."""

from functools import lru_cache

from langchain_openai import OpenAIEmbeddings
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import get_settings
from src.services.rag.cars.pipeline import CarIndexStats, index_car_catalog
from src.services.rag.common.chunking import (
    ChunkingConfig,
    SemanticChunk,
    build_semantic_chunks,
    build_semantic_chunks_with_embeddings,
)
from src.services.rag.common.embeddings import get_embedding_model as _build_embedding_model
from src.services.rag.config import RAG_CONFIG, RetrievalConfig
from src.services.rag.motorbikes.pipeline import (
    MotorbikeGroupedDocument,
    MotorbikeIndexStats,
    dry_run_motorbike,
    fetch_grouped_motorbikes,
    index_motorbike_catalog,
)
from src.services.rag.retrieval.models import RetrievalFilters, RetrievalResult
from src.services.rag.retrieval.pipeline import CatalogRetrievalPipeline
from src.services.rag.retrieval.query_fusion import build_query_planner
from src.services.rag.retrieval.repository import PostgresHybridSearchRepository
from src.services.rag.retrieval.reranker import build_reranker
from src.services.rag.retrieval.vehicle_resolver import PostgresVehicleResolver


def get_embedding_model() -> OpenAIEmbeddings:
    """Build the shared embedding client using the facade settings."""
    return _build_embedding_model(get_settings())


def get_chunking_config() -> ChunkingConfig:
    """Return code-owned chunking parameters for the RAG domain."""
    return RAG_CONFIG.chunking


def get_retrieval_config() -> RetrievalConfig:
    return RAG_CONFIG.retrieval


@lru_cache(maxsize=1)
def get_catalog_retrieval_pipeline() -> CatalogRetrievalPipeline:
    """Return one lazy-loaded retrieval pipeline per backend process.

    Keeping the pipeline alive reuses the OpenAI clients and retrieval components
    across requests without loading a local reranker model into RAM.
    """
    settings = get_settings()
    return CatalogRetrievalPipeline(
        planner=build_query_planner(settings, RAG_CONFIG.query_fusion),
        embedder=_build_embedding_model(settings),
        repository=PostgresHybridSearchRepository(),
        reranker=build_reranker(RAG_CONFIG.mmr),
        resolver=PostgresVehicleResolver(),
        config=get_retrieval_config(),
    )


async def retrieve_catalog(
    db: AsyncSession,
    query: str,
    *,
    filters: RetrievalFilters | None = None,
    pipeline: CatalogRetrievalPipeline | None = None,
) -> RetrievalResult:
    """Run the complete shared retrieval flow for an Agent or API caller."""
    service = pipeline or get_catalog_retrieval_pipeline()
    return await service.retrieve(db, query, filters=filters)

__all__ = [
    "ChunkingConfig",
    "SemanticChunk",
    "build_semantic_chunks",
    "build_semantic_chunks_with_embeddings",
    "CarIndexStats",
    "get_embedding_model",
    "get_chunking_config",
    "get_catalog_retrieval_pipeline",
    "get_retrieval_config",
    "index_car_catalog",
    "MotorbikeGroupedDocument",
    "MotorbikeIndexStats",
    "dry_run_motorbike",
    "fetch_grouped_motorbikes",
    "index_motorbike_catalog",
    "RetrievalFilters",
    "RetrievalResult",
    "retrieve_catalog",
]
