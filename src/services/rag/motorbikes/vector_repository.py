"""Transactional vector persistence for motorbike chunks."""

from collections.abc import Mapping, Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from src.services.rag.common.chunking import SemanticChunk
from src.services.rag.common.vector_repository import replace_catalog_vectors

EmbeddedChunk = tuple[SemanticChunk, Sequence[float]]


async def replace_motorbike_vectors(
    db: AsyncSession,
    embedded_chunks: Mapping[str, Sequence[EmbeddedChunk]],
    *,
    embedding_dimensions: int,
    chunk_types: Sequence[str] | None = None,
    full_rebuild: bool = False,
) -> int:
    """Refresh only motorbike_id rows in catalog_vectors."""
    return await replace_catalog_vectors(
        db,
        embedded_chunks,
        vehicle_type="motorbike",
        embedding_dimensions=embedding_dimensions,
        chunk_types=chunk_types,
        full_rebuild=full_rebuild,
    )


__all__ = ["EmbeddedChunk", "replace_motorbike_vectors"]
