"""Shared transactional vector persistence for catalog vehicle types."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from uuid import NAMESPACE_URL, UUID, uuid5

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.rag.common.chunking import SemanticChunk

EmbeddedChunk = tuple[SemanticChunk, Sequence[float]]


def _vector_id(chunk: SemanticChunk) -> UUID:
    source = ":".join(
        (
            "vinfast-agent",
            chunk.vehicle_type,
            chunk.vehicle_id,
            chunk.chunk_type,
            str(chunk.chunk_index),
            chunk.content_hash,
        )
    )
    return uuid5(NAMESPACE_URL, source)


def _vector_literal(vector: Sequence[float], dimensions: int) -> str:
    if len(vector) != dimensions:
        raise ValueError(f"Embedding dimension mismatch: expected {dimensions}, got {len(vector)}")
    return "[" + ",".join(format(float(value), ".17g") for value in vector) + "]"


async def replace_catalog_vectors(
    db: AsyncSession,
    embedded_chunks: Mapping[str, Sequence[EmbeddedChunk]],
    *,
    vehicle_type: str,
    embedding_dimensions: int,
    chunk_types: Sequence[str] | None = None,
    full_rebuild: bool = False,
) -> int:
    """Replace vectors for one vehicle type in one transaction."""
    vehicle_column = {
        "car": "car_id",
        "motorbike": "motorbike_id",
    }.get(vehicle_type)
    if vehicle_column is None:
        raise ValueError(f"Unsupported vehicle_type: {vehicle_type}")
    if full_rebuild and chunk_types:
        raise ValueError("full_rebuild cannot be combined with chunk_types")

    vehicle_values = (
        "CAST(:vehicle_id AS uuid), NULL" if vehicle_column == "car_id" else "NULL, CAST(:vehicle_id AS uuid)"
    )
    insert_statement = text(
        f"""
        INSERT INTO public.catalog_vectors (
            vector_id, car_id, motorbike_id, chunk_type, chunk_text,
            embedding, content_hash, chunk_index, source_paths
        )
        VALUES (
            CAST(:vector_id AS uuid), {vehicle_values},
            :chunk_type, :chunk_text, CAST(:embedding AS vector),
            :content_hash, :chunk_index, CAST(:source_paths AS text[])
        )
        ON CONFLICT (vector_id) DO UPDATE SET
            chunk_type = EXCLUDED.chunk_type,
            chunk_text = EXCLUDED.chunk_text,
            embedding = EXCLUDED.embedding,
            content_hash = EXCLUDED.content_hash,
            chunk_index = EXCLUDED.chunk_index,
            source_paths = EXCLUDED.source_paths,
            updated_at = CURRENT_TIMESTAMP
        """
    )
    delete_filter = "AND chunk_type = ANY(CAST(:chunk_types AS text[]))" if chunk_types else ""
    delete_statement = text(
        f"""
        DELETE FROM public.catalog_vectors
        WHERE {vehicle_column} = CAST(:vehicle_id AS uuid)
        {delete_filter}
        """
    )

    rows: list[dict[str, object]] = []
    for vehicle_id, chunks in embedded_chunks.items():
        for chunk, vector in chunks:
            if chunk.vehicle_type != vehicle_type or chunk.vehicle_id != vehicle_id:
                raise ValueError("Vector row belongs to a different vehicle type or ID")
            rows.append(
                {
                    "vector_id": str(_vector_id(chunk)),
                    "vehicle_id": vehicle_id,
                    "chunk_type": chunk.chunk_type,
                    "chunk_text": chunk.chunk_text,
                    "embedding": _vector_literal(vector, embedding_dimensions),
                    "content_hash": chunk.content_hash,
                    "chunk_index": chunk.chunk_index,
                    "source_paths": list(chunk.source_paths),
                }
            )

    async with db.begin():
        if full_rebuild:
            await db.execute(text(f"DELETE FROM public.catalog_vectors WHERE {vehicle_column} IS NOT NULL"))
        else:
            for vehicle_id in embedded_chunks:
                await db.execute(
                    delete_statement,
                    {
                        "vehicle_id": vehicle_id,
                        "chunk_types": list(chunk_types or ()),
                    },
                )
        if rows:
            await db.execute(insert_statement, rows)
    return len(rows)


__all__ = ["EmbeddedChunk", "replace_catalog_vectors"]
