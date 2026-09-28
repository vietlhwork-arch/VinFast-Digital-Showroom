"""Embedding-aware semantic chunking for normalized catalog groups."""

from __future__ import annotations

import math
import re
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, replace
from hashlib import sha256
from typing import Protocol

DEFAULT_GROUP_ORDER = (
    "overview_dimensions",
    "performance_energy",
    "chassis_safety",
    "adas_parking",
    "interior_technology",
    "exterior",
)


class AsyncEmbedder(Protocol):
    async def aembed_documents(self, texts: list[str]) -> list[list[float]]: ...


@dataclass(frozen=True, slots=True)
class ChunkingConfig:
    max_chars: int = 1500
    min_chunk_chars: int = 350
    similarity_threshold: float = 0.74
    max_units_per_chunk: int = 8

    def __post_init__(self) -> None:
        if self.max_chars < 200:
            raise ValueError("max_chars must be at least 200")
        if self.min_chunk_chars < 50 or self.min_chunk_chars >= self.max_chars:
            raise ValueError("min_chunk_chars must be between 50 and max_chars")
        if not 0.0 <= self.similarity_threshold <= 1.0:
            raise ValueError("similarity_threshold must be between 0 and 1")
        if self.max_units_per_chunk < 1:
            raise ValueError("max_units_per_chunk must be at least 1")


@dataclass(frozen=True, slots=True)
class SemanticChunk:
    vehicle_id: str
    vehicle_type: str
    model_name: str
    vehicle_line: str
    chunk_type: str
    chunk_index: int
    chunk_text: str
    content_hash: str
    source_paths: tuple[str, ...] = ()

    @property
    def car_id(self) -> str | None:
        return self.vehicle_id if self.vehicle_type == "car" else None


def _clean(value: str) -> str:
    return "\n".join(line for line in (re.sub(r"[ \t]+", " ", x).strip() for x in value.splitlines()) if line)


def _units(text: str, max_chars: int) -> list[str]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if len(lines) == 1:
        lines = [part.strip() for part in re.split(r"(?<=[.!?])\s+", lines[0]) if part.strip()]
    result: list[str] = []
    for line in lines:
        if len(line) <= max_chars:
            result.append(line)
            continue
        current = ""
        for word in line.split():
            candidate = f"{current} {word}".strip()
            if current and len(candidate) > max_chars:
                result.append(current)
                current = word
            else:
                current = candidate
        if current:
            result.append(current)
    return result


def _join(units: Sequence[str]) -> str:
    return "\n".join(units)


def _length_split(units: Sequence[str], max_chars: int) -> list[str]:
    pieces: list[str] = []
    current: list[str] = []
    for unit in units:
        candidate = _join((*current, unit))
        if current and len(candidate) > max_chars:
            pieces.append(_join(current))
            current = [unit]
        else:
            current.append(unit)
    if current:
        pieces.append(_join(current))
    return pieces


def _cosine(left: Sequence[float], right: Sequence[float]) -> float:
    if len(left) != len(right):
        raise ValueError("Embedding vectors must have the same dimensions")
    left_norm = math.sqrt(sum(x * x for x in left))
    right_norm = math.sqrt(sum(x * x for x in right))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return sum(a * b for a, b in zip(left, right, strict=True)) / (left_norm * right_norm)


def _similarity_split(
    units: Sequence[str],
    vectors: Sequence[Sequence[float]],
    config: ChunkingConfig,
) -> list[str]:
    if len(units) != len(vectors):
        raise ValueError("The number of embeddings must match the number of text units")
    if len(units) < 2:
        return _length_split(units, config.max_chars)

    similarities = [_cosine(vectors[i], vectors[i + 1]) for i in range(len(vectors) - 1)]
    segments: list[list[str]] = []
    current: list[str] = []
    for index, unit in enumerate(units):
        candidate = [*current, unit]
        if current and (len(_join(candidate)) > config.max_chars or len(current) >= config.max_units_per_chunk):
            segments.append(current)
            current = [unit]
        else:
            current = candidate

        next_similarity = similarities[index] if index < len(similarities) else None
        if (
            next_similarity is not None
            and next_similarity < config.similarity_threshold
            and len(_join(current)) >= min(config.min_chunk_chars, config.max_chars)
        ):
            segments.append(current)
            current = []
    if current:
        segments.append(current)

    merged: list[list[str]] = []
    for segment in segments:
        if merged and len(_join(segment)) < config.min_chunk_chars:
            candidate = [*merged[-1], *segment]
            if len(candidate) <= config.max_units_per_chunk and len(_join(candidate)) <= config.max_chars:
                merged[-1] = candidate
                continue
        merged.append(segment)
    return [_join(segment) for segment in merged]


def _resolve_id(vehicle_id: str | None, car_id: str | None) -> str:
    if vehicle_id and car_id and vehicle_id != car_id:
        raise ValueError("vehicle_id and car_id refer to different records")
    resolved = (vehicle_id or car_id or "").strip()
    if not resolved:
        raise ValueError("vehicle_id must not be empty")
    return resolved


def _make_chunks(
    *,
    vehicle_id: str,
    vehicle_type: str,
    model_name: str,
    vehicle_line: str | None,
    identity_metadata: Mapping[str, object] | None,
    groups: Mapping[str, str],
    group_source_paths: Mapping[str, Sequence[str]] | None,
    group_order: Sequence[str],
    pieces: Mapping[str, Sequence[str]],
) -> list[SemanticChunk]:
    line = _clean(vehicle_line or "") or "not_published"
    metadata_lines = []
    for key, value in (identity_metadata or {}).items():
        cleaned = _clean(str(value)) if value is not None else ""
        if cleaned:
            metadata_lines.append(f"{key}: {cleaned}")
    chunks: list[SemanticChunk] = []
    for group in group_order:
        if not _clean(groups.get(group, "")):
            continue
        identity = "\n".join(
            (
                f"vehicle_type: {vehicle_type}",
                f"model_name: {model_name.strip()}",
                f"vehicle_line: {line}",
                *metadata_lines,
                f"semantic_group: {group}",
            )
        )
        for index, piece in enumerate(pieces.get(group, ())):
            text = f"{identity}\n\n{piece}"
            source = "\n".join((vehicle_id, vehicle_type, model_name.strip(), group, str(index), text))
            chunks.append(
                SemanticChunk(
                    vehicle_id=vehicle_id,
                    vehicle_type=vehicle_type,
                    model_name=model_name.strip(),
                    vehicle_line=line,
                    chunk_type=group,
                    chunk_index=index,
                    chunk_text=text,
                    content_hash=sha256(source.encode("utf-8")).hexdigest(),
                    source_paths=tuple(sorted(set((group_source_paths or {}).get(group, ())))),
                )
            )
    return chunks


def _config(config: ChunkingConfig | None, max_chars: int | None) -> ChunkingConfig:
    resolved = config or ChunkingConfig()
    if max_chars is None:
        return resolved
    min_chars = min(resolved.min_chunk_chars, max(50, max_chars // 3))
    return replace(resolved, max_chars=max_chars, min_chunk_chars=min_chars)


def build_semantic_chunks(
    *,
    model_name: str,
    vehicle_line: str | None,
    semantic_groups: Mapping[str, str],
    identity_metadata: Mapping[str, object] | None = None,
    group_source_paths: Mapping[str, Sequence[str]] | None = None,
    vehicle_id: str | None = None,
    vehicle_type: str = "car",
    car_id: str | None = None,
    group_order: Sequence[str] = DEFAULT_GROUP_ORDER,
    config: ChunkingConfig | None = None,
    max_chars: int | None = None,
) -> list[SemanticChunk]:
    """Build deterministic length-based chunks without an API call."""
    resolved = _config(config, max_chars)
    identifier = _resolve_id(vehicle_id, car_id)
    pieces = {
        group: _length_split(_units(_clean(semantic_groups.get(group, "")), resolved.max_chars), resolved.max_chars)
        for group in group_order
        if _clean(semantic_groups.get(group, ""))
    }
    return _make_chunks(
        vehicle_id=identifier,
        vehicle_type=vehicle_type,
        model_name=model_name,
        vehicle_line=vehicle_line,
        identity_metadata=identity_metadata,
        groups=semantic_groups,
        group_source_paths=group_source_paths,
        group_order=group_order,
        pieces=pieces,
    )


async def build_semantic_chunks_with_embeddings(
    *,
    embedder: AsyncEmbedder,
    model_name: str,
    vehicle_line: str | None,
    semantic_groups: Mapping[str, str],
    identity_metadata: Mapping[str, object] | None = None,
    group_source_paths: Mapping[str, Sequence[str]] | None = None,
    vehicle_id: str | None = None,
    vehicle_type: str = "car",
    car_id: str | None = None,
    group_order: Sequence[str] = DEFAULT_GROUP_ORDER,
    config: ChunkingConfig | None = None,
    max_chars: int | None = None,
) -> list[SemanticChunk]:
    """Use adjacent-unit cosine similarity plus size guards for boundaries."""
    resolved = _config(config, max_chars)
    identifier = _resolve_id(vehicle_id, car_id)
    pieces: dict[str, list[str]] = {}
    for group in group_order:
        text = _clean(semantic_groups.get(group, ""))
        if not text:
            continue
        units = _units(text, resolved.max_chars)
        if len(units) < 2:
            pieces[group] = _length_split(units, resolved.max_chars)
            continue
        vectors = await embedder.aembed_documents(units)
        pieces[group] = _similarity_split(units, vectors, resolved)
    return _make_chunks(
        vehicle_id=identifier,
        vehicle_type=vehicle_type,
        model_name=model_name,
        vehicle_line=vehicle_line,
        identity_metadata=identity_metadata,
        groups=semantic_groups,
        group_source_paths=group_source_paths,
        group_order=group_order,
        pieces=pieces,
    )
