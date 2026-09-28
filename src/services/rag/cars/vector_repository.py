"""Transactional writes for the car catalog vector index."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from uuid import NAMESPACE_URL, UUID, uuid5

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.rag.common.chunking import SemanticChunk

EmbeddedChunk = tuple[SemanticChunk, Sequence[float]]


async def delete_car_vectors_before_embedding(
    db: AsyncSession,
    *,
    car_ids: Sequence[str],
    chunk_types: Sequence[str] | None = None,
    full_rebuild: bool = False,
) -> int:
    """Delete the old car vectors before a new embedding run starts.

    This deliberately scopes deletion to car vectors, so motorbike vectors
    remain untouched. A full rebuild removes stale car vectors for cars that
    no longer exist in the source catalog; a partial rebuild removes only the
    requested cars/chunk types.
    """
    if full_rebuild and chunk_types:
        raise ValueError("full_rebuild cannot be combined with chunk_types")

    if full_rebuild:
        statement = text("DELETE FROM public.catalog_vectors WHERE car_id IS NOT NULL")
        params: dict[str, object] = {}
    elif not car_ids:
        return 0
    else:
        delete_filter = "AND chunk_type = ANY(CAST(:chunk_types AS text[]))" if chunk_types else ""
        statement = text(
            f"""
            DELETE FROM public.catalog_vectors
            WHERE car_id = ANY(CAST(:car_ids AS uuid[]))
            {delete_filter}
            """
        )
        params = {
            "car_ids": list(car_ids),
            "chunk_types": list(chunk_types or ()),
        }

    async with db.begin():
        result = await db.execute(statement, params)
    return int(result.rowcount or 0)


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


async def replace_car_vectors(
    db: AsyncSession,
    embedded_chunks: Mapping[str, Sequence[EmbeddedChunk]],
    *,
    embedding_model: str,
    embedding_dimensions: int,
    chunk_types: Sequence[str] | None = None,
    full_rebuild: bool = False,
) -> int:
    """Atomically replace all indexed vectors for the supplied cars.

    The caller should commit any preceding read transaction before calling this
    function. A single transaction is used for the delete-and-insert refresh so
    a failed indexing run cannot leave a partially refreshed car.
    """
    del embedding_model
    if full_rebuild and chunk_types:
        raise ValueError("full_rebuild cannot be combined with chunk_types")
    insert_statement = text(
        """
        INSERT INTO public.catalog_vectors (
            vector_id, car_id, motorbike_id, chunk_type, chunk_text,
            embedding, content_hash, chunk_index, source_paths
        )
        VALUES (
            CAST(:vector_id AS uuid), CAST(:car_id AS uuid), NULL,
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
        WHERE car_id = CAST(:car_id AS uuid)
        {delete_filter}
        """
    )

    rows: list[dict[str, object]] = []
    for car_id, chunks in embedded_chunks.items():
        for chunk, vector in chunks:
            if chunk.vehicle_type != "car" or chunk.vehicle_id != car_id:
                raise ValueError("All vector rows must belong to the supplied car")
            rows.append(
                {
                    "vector_id": str(_vector_id(chunk)),
                    "car_id": car_id,
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
            await db.execute(text("DELETE FROM public.catalog_vectors WHERE car_id IS NOT NULL"))
        else:
            for car_id in embedded_chunks:
                await db.execute(
                    delete_statement,
                    {"car_id": car_id, "chunk_types": list(chunk_types or ())},
                )
        if rows:
            await db.execute(insert_statement, rows)

    return len(rows)


__all__ = ["EmbeddedChunk", "delete_car_vectors_before_embedding", "replace_car_vectors"]
