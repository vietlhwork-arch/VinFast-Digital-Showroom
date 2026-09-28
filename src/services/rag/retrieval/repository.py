"""PostgreSQL/pgvector repository used by hybrid catalog retrieval."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any, Protocol

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.rag.retrieval.bm25 import rank_bm25
from src.services.rag.retrieval.models import RetrievalFilters, SearchHit


class HybridSearchRepository(Protocol):
    async def dense_search(
        self,
        db: AsyncSession,
        *,
        query: str,
        embedding: Sequence[float],
        filters: RetrievalFilters,
        top_k: int,
    ) -> list[SearchHit]: ...

    async def lexical_search(
        self,
        db: AsyncSession,
        *,
        query: str,
        filters: RetrievalFilters,
        top_k: int,
    ) -> list[SearchHit]: ...


_BASE_SELECT = """
    SELECT
        v.vector_id::text AS vector_id,
        COALESCE(v.car_id::text, v.motorbike_id::text) AS vehicle_id,
        CASE WHEN v.car_id IS NOT NULL THEN 'car' ELSE 'motorbike' END AS vehicle_type,
        COALESCE(c.model_name, m.model_name, 'unknown') AS model_name,
        COALESCE(c.vehicle_line, m.vehicle_line, 'not_published') AS vehicle_line,
        COALESCE(c.version, m.version, 'not_published') AS version,
        COALESCE(c.category, m.category, 'not_published') AS category,
        COALESCE(c.image_url, m.image_url) AS image_url,
        v.chunk_type,
        v.chunk_index,
        v.chunk_text,
        v.embedding::text AS embedding_text
    FROM public.catalog_vectors v
    LEFT JOIN public.car_catalog c ON c.car_id = v.car_id
    LEFT JOIN public.motorbike_catalog m ON m.motorbike_id = v.motorbike_id
"""


def _filters_sql(filters: RetrievalFilters) -> tuple[str, dict[str, Any]]:
    conditions: list[str] = []
    params: dict[str, Any] = {}
    if filters.vehicle_type == "car":
        conditions.append("v.car_id IS NOT NULL")
    elif filters.vehicle_type == "motorbike":
        conditions.append("v.motorbike_id IS NOT NULL")

    if filters.vehicle_ids:
        params["vehicle_ids"] = list(filters.vehicle_ids)
        if filters.vehicle_type == "car":
            conditions.append("v.car_id = ANY(CAST(:vehicle_ids AS uuid[]))")
        elif filters.vehicle_type == "motorbike":
            conditions.append("v.motorbike_id = ANY(CAST(:vehicle_ids AS uuid[]))")
        else:
            conditions.append(
                "(v.car_id = ANY(CAST(:vehicle_ids AS uuid[])) OR v.motorbike_id = ANY(CAST(:vehicle_ids AS uuid[])))"
            )
    if filters.chunk_types:
        params["chunk_types"] = list(filters.chunk_types)
        conditions.append("v.chunk_type = ANY(CAST(:chunk_types AS text[]))")
    return (" AND ".join(conditions) or "TRUE"), params


def _vector_literal(vector: Sequence[float]) -> str:
    if not vector:
        raise ValueError("query embedding must not be empty")
    return "[" + ",".join(format(float(value), ".17g") for value in vector) + "]"


def _parse_embedding(value: Any) -> tuple[float, ...]:
    if value is None:
        return ()
    if isinstance(value, str):
        cleaned = value.strip().removeprefix("[").removesuffix("]")
        return tuple(float(item) for item in cleaned.split(",") if item)
    if isinstance(value, Sequence):
        return tuple(float(item) for item in value)
    raise TypeError(f"Unsupported vector value: {type(value).__name__}")


def _row_to_hit(
    row: Mapping[str, Any],
    *,
    modality: str,
    query: str,
    raw_score: float,
    rank: int,
) -> SearchHit:
    return SearchHit(
        vector_id=str(row["vector_id"]),
        vehicle_id=str(row["vehicle_id"]),
        vehicle_type=row["vehicle_type"],
        model_name=str(row["model_name"]),
        vehicle_line=str(row["vehicle_line"]),
        chunk_type=str(row["chunk_type"]),
        chunk_index=int(row["chunk_index"]),
        chunk_text=str(row["chunk_text"]),
        modality=modality,
        query=query,
        raw_score=float(raw_score),
        rank=rank,
        embedding=_parse_embedding(row.get("embedding_text")),
        version=str(row["version"]),
        category=str(row["category"]),
        image_url=str(row["image_url"]) if row.get("image_url") else None,
    )


class PostgresHybridSearchRepository:
    """Dense search in pgvector plus BM25 over the filtered catalog corpus."""

    async def dense_search(
        self,
        db: AsyncSession,
        *,
        query: str,
        embedding: Sequence[float],
        filters: RetrievalFilters,
        top_k: int,
    ) -> list[SearchHit]:
        where_sql, params = _filters_sql(filters)
        params.update(query_embedding=_vector_literal(embedding), top_k=top_k)
        statement = text(
            f"""
            SELECT source.*, 1 - (source.embedding <=> CAST(:query_embedding AS vector)) AS score
            FROM (
                SELECT selected.*, v.embedding
                FROM ({_BASE_SELECT} WHERE {where_sql}) selected
                JOIN public.catalog_vectors v
                    ON v.vector_id::text = selected.vector_id
            ) source
            ORDER BY source.embedding <=> CAST(:query_embedding AS vector), source.vector_id
            LIMIT :top_k
            """
        )
        result = await db.execute(statement, params)
        return [
            _row_to_hit(
                row,
                modality="dense",
                query=query,
                raw_score=row["score"],
                rank=rank,
            )
            for rank, row in enumerate(result.mappings().all(), start=1)
        ]

    async def lexical_search(
        self,
        db: AsyncSession,
        *,
        query: str,
        filters: RetrievalFilters,
        top_k: int,
    ) -> list[SearchHit]:
        where_sql, params = _filters_sql(filters)
        statement = text(f"{_BASE_SELECT} WHERE {where_sql} ORDER BY v.vector_id")
        result = await db.execute(statement, params)
        corpus = [
            _row_to_hit(
                row,
                modality="lexical",
                query=query,
                raw_score=0.0,
                rank=0,
            )
            for row in result.mappings().all()
        ]
        return rank_bm25(query, corpus, top_k=top_k)


__all__ = ["HybridSearchRepository", "PostgresHybridSearchRepository"]
