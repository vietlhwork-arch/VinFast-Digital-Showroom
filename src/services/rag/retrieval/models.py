"""Typed contracts shared by the catalog retrieval stages."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

VehicleType = Literal["car", "motorbike"]
SearchModality = Literal["dense", "lexical"]


@dataclass(frozen=True, slots=True)
class RetrievalFilters:
    """Hard filters supplied by trusted application state, not invented by an LLM."""

    vehicle_type: VehicleType | None = None
    vehicle_ids: tuple[str, ...] = ()
    chunk_types: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class VehicleIdentity:
    vehicle_id: str
    vehicle_type: VehicleType
    model_name: str
    vehicle_line: str
    version: str | None = None
    category: str | None = None
    image_url: str | None = None


@dataclass(frozen=True, slots=True)
class ResolvedRetrievalScope:
    filters: RetrievalFilters
    vehicles: tuple[VehicleIdentity, ...] = ()


@dataclass(frozen=True, slots=True)
class QueryPlan:
    original_query: str
    queries: tuple[str, ...]
    used_fusion: bool


@dataclass(frozen=True, slots=True)
class SearchHit:
    vector_id: str
    vehicle_id: str
    vehicle_type: VehicleType
    model_name: str
    vehicle_line: str
    chunk_type: str
    chunk_index: int
    chunk_text: str
    modality: SearchModality
    query: str
    raw_score: float
    rank: int
    embedding: tuple[float, ...] = ()
    version: str | None = None
    category: str | None = None
    image_url: str | None = None


@dataclass(frozen=True, slots=True)
class RankedSearchList:
    name: str
    weight: float
    hits: tuple[SearchHit, ...]


@dataclass(frozen=True, slots=True)
class FusedCandidate:
    vector_id: str
    vehicle_id: str
    vehicle_type: VehicleType
    model_name: str
    vehicle_line: str
    chunk_type: str
    chunk_index: int
    chunk_text: str
    rrf_score: float
    rrf_rank: int
    matched_lists: tuple[str, ...]
    embedding: tuple[float, ...] = ()
    version: str | None = None
    category: str | None = None
    image_url: str | None = None


@dataclass(frozen=True, slots=True)
class RerankedCandidate:
    candidate: FusedCandidate
    rerank_score: float
    rerank_rank: int


@dataclass(frozen=True, slots=True)
class StructuredSnippet:
    vehicle_id: str
    vehicle_type: VehicleType
    model_name: str
    vehicle_line: str
    chunk_type: str
    chunk_index: int
    text: str
    retrieval_rank: int
    retrieval_score: float
    rerank_rank: int
    rerank_score: float
    version: str | None = None
    category: str | None = None
    image_url: str | None = None


@dataclass(frozen=True, slots=True)
class RetrievalResult:
    query_plan: QueryPlan
    resolved_vehicles: tuple[VehicleIdentity, ...]
    fused_candidates: tuple[FusedCandidate, ...]
    reranked_candidates: tuple[RerankedCandidate, ...]
    snippets: tuple[StructuredSnippet, ...]
    context: str


__all__ = [
    "FusedCandidate",
    "QueryPlan",
    "RankedSearchList",
    "RerankedCandidate",
    "ResolvedRetrievalScope",
    "RetrievalFilters",
    "RetrievalResult",
    "SearchHit",
    "StructuredSnippet",
    "VehicleIdentity",
]
