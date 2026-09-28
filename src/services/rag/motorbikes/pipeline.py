"""Read and group motorbike RAW data; stop before text/chunk/embedding."""

import asyncio
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.config import get_settings
from src.services.rag.common.chunking import (
    AsyncEmbedder,
    ChunkingConfig,
    build_semantic_chunks_with_embeddings,
)
from src.services.rag.common.embeddings import get_embedding_model
from src.services.rag.config import RAG_CONFIG
from src.services.rag.motorbikes.groups import (
    MOTORBIKE_GROUP_ORDER,
    MotorbikeGroupData,
    build_motorbike_group_data,
    build_motorbike_group_source_paths,
    build_motorbike_semantic_groups,
)
from src.services.rag.motorbikes.normalizer import (
    NormalizedMotorbike,
    normalize_motorbike_row,
)
from src.services.rag.motorbikes.repository import fetch_motorbike_catalog_rows
from src.services.rag.motorbikes.vector_repository import (
    EmbeddedChunk,
    replace_motorbike_vectors,
)


@dataclass(frozen=True, slots=True)
class MotorbikeGroupedDocument:
    motorbike: NormalizedMotorbike
    group_data: MotorbikeGroupData

    def as_dict(self) -> dict[str, Any]:
        return {
            "motorbike_id": self.motorbike.motorbike_id,
            "model_name": self.motorbike.model_name,
            "vehicle_line": self.motorbike.vehicle_line,
            "version": self.motorbike.version,
            "category": self.motorbike.category,
            **self.group_data.as_dict(),
        }

    def dry_run(self) -> dict[str, Any]:
        return {
            "motorbike_id": self.motorbike.motorbike_id,
            "model_name": self.motorbike.model_name,
            "vehicle_line": self.motorbike.vehicle_line,
            "version": self.motorbike.version,
            "category": self.motorbike.category,
            "fields": self.group_data.dry_run_rows(),
            "unmapped_fields": dict(self.group_data.unmapped_fields),
        }


@dataclass(frozen=True, slots=True)
class MotorbikeIndexStats:
    vehicles_processed: int
    chunks_indexed: int


async def _embed_motorbike(
    document: MotorbikeGroupedDocument,
    *,
    embedder: AsyncEmbedder,
    gate: asyncio.Semaphore,
    config: ChunkingConfig,
    chunk_types: tuple[str, ...] | None = None,
) -> tuple[EmbeddedChunk, ...]:
    """Chunk and embed one motorbike inside the global concurrency limit."""
    async with gate:
        semantic_groups = build_motorbike_semantic_groups(
            document.motorbike,
            document.group_data,
        )
        if chunk_types:
            semantic_groups = {group: text for group, text in semantic_groups.items() if group in chunk_types}
        chunks = await build_semantic_chunks_with_embeddings(
            embedder=embedder,
            vehicle_id=document.motorbike.motorbike_id,
            vehicle_type="motorbike",
            model_name=document.motorbike.model_name,
            vehicle_line=document.motorbike.vehicle_line,
            identity_metadata={
                "version": document.motorbike.version,
                "category": document.motorbike.category,
            },
            semantic_groups=semantic_groups,
            group_source_paths=build_motorbike_group_source_paths(
                document.motorbike,
                document.group_data,
            ),
            group_order=chunk_types or MOTORBIKE_GROUP_ORDER,
            config=config,
        )
        if not chunks:
            return ()
        vectors = await embedder.aembed_documents([chunk.chunk_text for chunk in chunks])
        if len(vectors) != len(chunks):
            raise ValueError("The number of final embeddings must match the chunks")
        return tuple(zip(chunks, vectors, strict=True))


def group_motorbike_row(row: Mapping[str, Any]) -> MotorbikeGroupedDocument:
    normalized = normalize_motorbike_row(row)
    return MotorbikeGroupedDocument(
        motorbike=normalized,
        group_data=build_motorbike_group_data(normalized),
    )


async def fetch_grouped_motorbikes(
    db: AsyncSession,
    *,
    motorbike_id: str | None = None,
    active_only: bool = True,
) -> list[MotorbikeGroupedDocument]:
    """Query motorbike_catalog and return normalized macro-group objects."""
    rows = await fetch_motorbike_catalog_rows(
        db,
        motorbike_id=motorbike_id,
        active_only=active_only,
    )
    return [group_motorbike_row(row) for row in rows]


async def dry_run_motorbike(
    db: AsyncSession,
    motorbike_id: str,
    *,
    active_only: bool = False,
) -> dict[str, Any]:
    """Return one motorbike's grouping/debug view without any write."""
    documents = await fetch_grouped_motorbikes(
        db,
        motorbike_id=motorbike_id,
        active_only=active_only,
    )
    if not documents:
        raise LookupError(f"Motorbike not found: {motorbike_id}")
    return documents[0].dry_run()


async def index_motorbike_catalog(
    db: AsyncSession,
    *,
    motorbike_id: str | None = None,
    active_only: bool = True,
    embedder: AsyncEmbedder | None = None,
    max_concurrency: int | None = None,
    chunking_config: ChunkingConfig | None = None,
    chunk_types: Sequence[str] | None = None,
) -> MotorbikeIndexStats:
    """Query, group, chunk, embed, and persist motorbike vectors."""
    settings = get_settings()
    documents = await fetch_grouped_motorbikes(
        db,
        motorbike_id=motorbike_id,
        active_only=active_only,
    )
    embedder = embedder or get_embedding_model(settings)
    config = chunking_config or RAG_CONFIG.chunking
    gate = asyncio.Semaphore(max_concurrency or RAG_CONFIG.embedding.max_concurrency)
    selected_chunk_types = tuple(dict.fromkeys(chunk_types or ())) or None
    results = await asyncio.gather(
        *(
            _embed_motorbike(
                document,
                embedder=embedder,
                gate=gate,
                config=config,
                chunk_types=selected_chunk_types,
            )
            for document in documents
        )
    )

    await db.commit()
    indexed_by_motorbike = {
        document.motorbike.motorbike_id: result for document, result in zip(documents, results, strict=True)
    }
    chunks_indexed = await replace_motorbike_vectors(
        db,
        indexed_by_motorbike,
        embedding_dimensions=settings.embedding_dimensions,
        chunk_types=selected_chunk_types,
        full_rebuild=motorbike_id is None and selected_chunk_types is None,
    )
    return MotorbikeIndexStats(
        vehicles_processed=len(documents),
        chunks_indexed=chunks_indexed,
    )


__all__ = [
    "MotorbikeIndexStats",
    "MotorbikeGroupedDocument",
    "dry_run_motorbike",
    "fetch_grouped_motorbikes",
    "group_motorbike_row",
    "index_motorbike_catalog",
]
