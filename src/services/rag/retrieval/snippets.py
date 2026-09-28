"""Create compact structured context while mitigating lost-in-the-middle."""

from __future__ import annotations

from src.services.rag.retrieval.models import RerankedCandidate, StructuredSnippet


def _context_order(
    candidates: list[RerankedCandidate],
) -> list[RerankedCandidate]:
    if len(candidates) <= 2:
        return candidates
    # Keep the strongest evidence first and the second strongest at the end.
    return [candidates[0], *candidates[2:], candidates[1]]


def build_structured_snippets(
    candidates: list[RerankedCandidate],
    *,
    top_k: int,
    preferred_vehicle_ids: tuple[str, ...] = (),
) -> list[StructuredSnippet]:
    unique_candidates: list[RerankedCandidate] = []
    seen_vectors: set[str] = set()
    for candidate in candidates:
        vector_id = candidate.candidate.vector_id
        if vector_id not in seen_vectors:
            unique_candidates.append(candidate)
            seen_vectors.add(vector_id)

    selected: list[RerankedCandidate] = []
    selected_vectors: set[str] = set()
    coverage_vehicle_ids = preferred_vehicle_ids or tuple(
        dict.fromkeys(item.candidate.vehicle_id for item in unique_candidates)
    )
    for vehicle_id in coverage_vehicle_ids:
        candidate = next(
            (
                item
                for item in unique_candidates
                if item.candidate.vehicle_id == vehicle_id and item.candidate.vector_id not in selected_vectors
            ),
            None,
        )
        if candidate is not None and len(selected) < top_k:
            selected.append(candidate)
            selected_vectors.add(candidate.candidate.vector_id)

    used_groups = {(item.candidate.vehicle_id, item.candidate.chunk_type) for item in selected}
    for candidate in unique_candidates:
        group = (candidate.candidate.vehicle_id, candidate.candidate.chunk_type)
        if len(selected) < top_k and candidate.candidate.vector_id not in selected_vectors and group not in used_groups:
            selected.append(candidate)
            selected_vectors.add(candidate.candidate.vector_id)
            used_groups.add(group)

    for candidate in unique_candidates:
        if len(selected) >= top_k:
            break
        if candidate.candidate.vector_id not in selected_vectors:
            selected.append(candidate)
            selected_vectors.add(candidate.candidate.vector_id)

    selected.sort(key=lambda item: item.rerank_rank)
    selected = _context_order(selected)
    return [
        StructuredSnippet(
            vehicle_id=item.candidate.vehicle_id,
            vehicle_type=item.candidate.vehicle_type,
            model_name=item.candidate.model_name,
            vehicle_line=item.candidate.vehicle_line,
            chunk_type=item.candidate.chunk_type,
            chunk_index=item.candidate.chunk_index,
            text=item.candidate.chunk_text,
            retrieval_rank=item.candidate.rrf_rank,
            retrieval_score=item.candidate.rrf_score,
            rerank_rank=item.rerank_rank,
            rerank_score=item.rerank_score,
            version=item.candidate.version,
            category=item.candidate.category,
            image_url=item.candidate.image_url,
        )
        for item in selected
    ]


def format_structured_context(snippets: list[StructuredSnippet]) -> str:
    blocks = []
    for position, snippet in enumerate(snippets, start=1):
        header = (
            f"[SNIPPET {position}]\n"
            f"vehicle_type: {snippet.vehicle_type}\n"
            f"vehicle_id: {snippet.vehicle_id}\n"
            f"model_name: {snippet.model_name}\n"
            f"vehicle_line: {snippet.vehicle_line}\n"
            f"version: {snippet.version or 'not_published'}\n"
            f"category: {snippet.category or 'not_published'}\n"
            f"chunk_type: {snippet.chunk_type}\n"
            f"retrieval_rank: {snippet.retrieval_rank}\n"
            f"rerank_rank: {snippet.rerank_rank}"
        )
        blocks.append(f"{header}\ncontent:\n{snippet.text}\n[/SNIPPET {position}]")
    return "\n\n".join(blocks)


__all__ = ["build_structured_snippets", "format_structured_context"]
