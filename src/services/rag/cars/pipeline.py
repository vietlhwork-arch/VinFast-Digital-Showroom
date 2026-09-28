"""Run the closed car catalog indexing pipeline."""

import asyncio
import logging
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.config import get_settings
from src.services.rag.cars.groups import (
    build_car_group_source_paths,
    build_car_semantic_groups,
)
from src.services.rag.cars.normalizer import NormalizedCar, normalize_car_row
from src.services.rag.cars.repository import fetch_car_catalog_rows
from src.services.rag.cars.vector_repository import (
    EmbeddedChunk,
    delete_car_vectors_before_embedding,
    replace_car_vectors,
)
from src.services.rag.common.chunking import (
    AsyncEmbedder,
    ChunkingConfig,
    build_semantic_chunks_with_embeddings,
)
from src.services.rag.common.embeddings import get_embedding_model
from src.services.rag.config import RAG_CONFIG

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class CarSemanticDocument:
    car: NormalizedCar
    semantic_groups: Mapping[str, str]
    group_source_paths: Mapping[str, tuple[str, ...]]


@dataclass(frozen=True, slots=True)
class CarIndexStats:
    vehicles_processed: int
    chunks_indexed: int


async def _embed_car(
    document: CarSemanticDocument,
    *,
    embedder: AsyncEmbedder,
    gate: asyncio.Semaphore,
    config: ChunkingConfig,
    chunk_types: tuple[str, ...] | None = None,
) -> tuple[EmbeddedChunk, ...]:
    """Chunk and embed one car while respecting the global concurrency gate."""
    async with gate:
        selected_groups = (
            {group: text for group, text in document.semantic_groups.items() if group in chunk_types}
            if chunk_types
            else document.semantic_groups
        )
        chunks = await build_semantic_chunks_with_embeddings(
            embedder=embedder,
            vehicle_id=document.car.car_id,
            vehicle_type="car",
            model_name=document.car.model_name,
            vehicle_line=document.car.vehicle_line,
            identity_metadata={
                "version": document.car.version,
                "category": document.car.fields.get("category"),
            },
            semantic_groups=selected_groups,
            group_source_paths={
                group: paths for group, paths in document.group_source_paths.items() if group in selected_groups
            },
            config=config,
        )
        if not chunks:
            return ()
        vectors = await embedder.aembed_documents([chunk.chunk_text for chunk in chunks])
        if len(vectors) != len(chunks):
            raise ValueError("The number of final embeddings must match the chunks")
        return tuple(zip(chunks, vectors, strict=True))


def group_car_row(row: Mapping[str, Any]) -> CarSemanticDocument:
    normalized = normalize_car_row(row)
    return CarSemanticDocument(
        car=normalized,
        semantic_groups=build_car_semantic_groups(normalized),
        group_source_paths=build_car_group_source_paths(normalized),
    )


async def fetch_grouped_cars(
    db: AsyncSession,
    *,
    car_id: str | None = None,
    active_only: bool = True,
) -> list[CarSemanticDocument]:
    """Query car_catalog and return normalized six-group documents."""
    rows = await fetch_car_catalog_rows(db, car_id=car_id, active_only=active_only)
    return [group_car_row(row) for row in rows]


async def index_car_catalog(
    db: AsyncSession,
    *,
    car_id: str | None = None,
    active_only: bool = True,
    embedder: AsyncEmbedder | None = None,
    max_concurrency: int | None = None,
    chunking_config: ChunkingConfig | None = None,
    chunk_types: Sequence[str] | None = None,
) -> CarIndexStats:
    """Query, group, semantically chunk, embed, and persist car vectors.

    Cars are embedded concurrently with a bounded global semaphore. Vector
    persistence is deliberately performed by one transaction after all
    embedding workers finish.
    """
    settings = get_settings()
    documents = await fetch_grouped_cars(
        db,
        car_id=car_id,
        active_only=active_only,
    )
    embedder = embedder or get_embedding_model(settings)
    config = chunking_config or RAG_CONFIG.chunking
    gate = asyncio.Semaphore(max_concurrency or RAG_CONFIG.embedding.max_concurrency)
    selected_chunk_types = tuple(dict.fromkeys(chunk_types or ())) or None
    full_rebuild = car_id is None and selected_chunk_types is None

    # Remove the old car index before embedding so a refresh cannot retain
    # stale color/spec chunks while the new batch is being generated.
    await db.commit()
    deleted_vectors = await delete_car_vectors_before_embedding(
        db,
        car_ids=tuple(document.car.car_id for document in documents),
        chunk_types=selected_chunk_types,
        full_rebuild=full_rebuild,
    )
    logger.info(
        "Deleted %d old car vectors before embedding (full_rebuild=%s, chunk_types=%s)",
        deleted_vectors,
        full_rebuild,
        selected_chunk_types,
    )

    results = await asyncio.gather(
        *(
            _embed_car(
                document,
                embedder=embedder,
                gate=gate,
                config=config,
                chunk_types=selected_chunk_types,
            )
            for document in documents
        )
    )

    # End the read transaction before opening the single write transaction.
    await db.commit()
    indexed_by_car = {document.car.car_id: result for document, result in zip(documents, results, strict=True)}
    chunks_indexed = await replace_car_vectors(
        db,
        indexed_by_car,
        embedding_model=settings.embedding_model,
        embedding_dimensions=settings.embedding_dimensions,
        chunk_types=selected_chunk_types,
        full_rebuild=full_rebuild,
    )
    return CarIndexStats(
        vehicles_processed=len(documents),
        chunks_indexed=chunks_indexed,
    )


__all__ = [
    "CarIndexStats",
    "CarSemanticDocument",
    "fetch_grouped_cars",
    "group_car_row",
    "index_car_catalog",
]
