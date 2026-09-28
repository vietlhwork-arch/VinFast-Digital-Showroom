"""Deterministic metrics for retrieval and observable Agent behavior."""

from __future__ import annotations

import math
import re
import unicodedata
from collections.abc import Iterable, Sequence
from typing import Any

from eval.benchmarking.models import AgentExpectation, RetrievalExpectation, TrajectoryStep


def _ratio(found: int, total: int) -> float:
    return found / total if total else 1.0


def recall_at_k(expected: set[str], ranked: Sequence[str], k: int) -> float:
    if not expected:
        return 1.0
    return len(expected.intersection(ranked[:k])) / len(expected)


def precision_at_k(relevance: Sequence[bool], k: int) -> float:
    window = relevance[:k]
    return sum(window) / len(window) if window else 0.0


def reciprocal_rank(relevance: Sequence[bool], k: int | None = None) -> float:
    window = relevance if k is None else relevance[:k]
    for rank, relevant in enumerate(window, start=1):
        if relevant:
            return 1.0 / rank
    return 0.0


def ndcg_at_k(relevance: Sequence[bool], k: int) -> float:
    gains = [1.0 if value else 0.0 for value in relevance[:k]]
    dcg = sum(gain / math.log2(rank + 1) for rank, gain in enumerate(gains, start=1))
    ideal = sorted(gains, reverse=True)
    idcg = sum(gain / math.log2(rank + 1) for rank, gain in enumerate(ideal, start=1))
    return dcg / idcg if idcg else 0.0


def normalize_text(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", value.casefold())
    without_marks = "".join(char for char in decomposed if unicodedata.category(char) != "Mn")
    return re.sub(r"\s+", " ", without_marks).strip()


def _candidate_relevant(candidate: Any, expectation: RetrievalExpectation) -> bool:
    vehicle_match = not expectation.vehicle_ids or str(candidate.vehicle_id) in expectation.vehicle_ids
    chunk_match = not expectation.chunk_types or str(candidate.chunk_type) in expectation.chunk_types
    vector_match = not expectation.relevant_vector_ids or str(candidate.vector_id) in expectation.relevant_vector_ids
    return vehicle_match and chunk_match and vector_match


def evaluate_retrieval_result(
    result: Any,
    expectation: RetrievalExpectation,
    *,
    latency_ms: float,
) -> dict[str, Any]:
    fused = list(result.fused_candidates)
    snippets = list(result.snippets)
    expected_vehicles = set(expectation.vehicle_ids)
    expected_chunks = set(expectation.chunk_types)
    fused_vehicle_ids = [str(item.vehicle_id) for item in fused]
    final_vehicle_ids = [str(item.vehicle_id) for item in snippets]
    final_chunk_types = [str(item.chunk_type) for item in snippets]
    fused_relevance = [_candidate_relevant(item, expectation) for item in fused]
    final_relevance = [_candidate_relevant(item, expectation) for item in snippets]
    final_vehicle_relevance = [
        not expected_vehicles or vehicle_id in expected_vehicles for vehicle_id in final_vehicle_ids
    ]

    if expectation.must_abstain and not expected_vehicles:
        return {
            "scored": False,
            "requires_answer_evaluation": True,
            "latency_ms": latency_ms,
            "query_variants": len(result.query_plan.queries),
            "fused_vehicle_ids": list(dict.fromkeys(fused_vehicle_ids)),
            "final_vehicle_ids": list(dict.fromkeys(final_vehicle_ids)),
            "passed": None,
        }

    vehicle_recall_20 = recall_at_k(expected_vehicles, fused_vehicle_ids, 20)
    vehicle_recall_3 = recall_at_k(expected_vehicles, final_vehicle_ids, 3)
    chunk_recall_3 = recall_at_k(expected_chunks, final_chunk_types, 3)
    vehicle_precision_3 = precision_at_k(final_vehicle_relevance, 3)
    labeled_evidence_precision_3 = precision_at_k(final_relevance, 3)
    metrics = {
        "scored": True,
        "requires_answer_evaluation": False,
        "vehicle_recall_at_20": vehicle_recall_20,
        "vehicle_recall_at_3": vehicle_recall_3,
        "chunk_recall_at_3": chunk_recall_3,
        "vehicle_precision_at_3": vehicle_precision_3,
        "labeled_evidence_precision_at_3": labeled_evidence_precision_3,
        "mrr_at_20": reciprocal_rank(fused_relevance, 20),
        "ndcg_at_20": ndcg_at_k(fused_relevance, 20),
        "latency_ms": latency_ms,
        "query_variants": len(result.query_plan.queries),
        "resolved_vehicle_ids": [str(item.vehicle_id) for item in result.resolved_vehicles],
        "fused_vehicle_ids": list(dict.fromkeys(fused_vehicle_ids)),
        "final_vehicle_ids": list(dict.fromkeys(final_vehicle_ids)),
        "final_chunk_types": list(dict.fromkeys(final_chunk_types)),
    }
    metrics["passed"] = (
        all(value >= 1.0 for value in (vehicle_recall_20, vehicle_recall_3, chunk_recall_3))
        and vehicle_precision_3 > 0.0
    )
    return metrics


def _extract_observed_tools(state: dict[str, Any]) -> list[dict[str, Any]]:
    tools: list[dict[str, Any]] = []
    action = state.get("action")
    if isinstance(action, dict) and action.get("type"):
        tools.append({"name": str(action["type"]), "arguments": action})
    metadata = state.get("metadata")
    if isinstance(metadata, dict):
        raw_tools = metadata.get("tool_calls")
        if isinstance(raw_tools, list):
            tools.extend(item for item in raw_tools if isinstance(item, dict))
    return tools


def evaluate_agent_state(
    state: dict[str, Any],
    trajectory: Sequence[TrajectoryStep],
    expectation: AgentExpectation,
) -> dict[str, Any]:
    extract = state.get("extract_result") if isinstance(state.get("extract_result"), dict) else {}
    actual_intent = str(extract.get("intent") or "")
    actual_action = str(extract.get("action_type") or "")
    response = str(state.get("response") or "")
    normalized_response = normalize_text(response)
    actual_nodes = [step.node for step in trajectory]
    evaluation_trace = state.get("evaluation_trace") if isinstance(state.get("evaluation_trace"), dict) else {}
    checks: dict[str, bool] = {}

    if expectation.intent_any_of:
        checks["intent"] = actual_intent in expectation.intent_any_of
    if expectation.action_any_of:
        checks["action"] = actual_action in expectation.action_any_of
    if expectation.blocked is not None:
        checks["blocked"] = bool(state.get("is_blocked")) is expectation.blocked
    if expectation.use_rag is not None:
        observed_rag = bool(evaluation_trace.get("rag_context_used"))
        checks["use_rag"] = observed_rag is expectation.use_rag
    if expectation.use_sql is not None:
        observed_sql = bool(evaluation_trace.get("catalog_lookup_used"))
        checks["use_sql"] = observed_sql is expectation.use_sql
    if expectation.action_payload_type:
        action = state.get("action") if isinstance(state.get("action"), dict) else {}
        checks["action_payload_type"] = action.get("type") == expectation.action_payload_type
    if expectation.required_nodes:
        checks["required_nodes"] = set(expectation.required_nodes).issubset(actual_nodes)
    if expectation.forbidden_nodes:
        checks["forbidden_nodes"] = not set(expectation.forbidden_nodes).intersection(actual_nodes)
    if expectation.required_terms:
        checks["required_terms"] = all(
            normalize_text(term) in normalized_response for term in expectation.required_terms
        )
    if expectation.prohibited_terms:
        checks["prohibited_terms"] = not any(
            normalize_text(term) in normalized_response for term in expectation.prohibited_terms
        )

    observed_tools = _extract_observed_tools(state)
    if expectation.tool_calls:
        for expected_tool in expectation.tool_calls:
            matching = [tool for tool in observed_tools if tool.get("name") == expected_tool.name]
            key = f"tool:{expected_tool.name}"
            if not expected_tool.required:
                checks[key] = not matching
                continue
            checks[key] = bool(matching) and all(
                any(tool.get("arguments", {}).get(arg_name) == arg_value for tool in matching)
                for arg_name, arg_value in expected_tool.arguments_subset.items()
            )

    passed = all(checks.values()) if checks else True
    return {
        "passed": passed,
        "checks": checks,
        "task_completion": _ratio(sum(checks.values()), len(checks)) if checks else 1.0,
        "actual_intent": actual_intent or None,
        "actual_action": actual_action or None,
        "actual_nodes": actual_nodes,
        "observed_tools": observed_tools,
        "response": response,
    }


def mean(values: Iterable[float]) -> float:
    materialized = list(values)
    return sum(materialized) / len(materialized) if materialized else 0.0


__all__ = [
    "evaluate_agent_state",
    "evaluate_retrieval_result",
    "mean",
    "ndcg_at_k",
    "normalize_text",
    "precision_at_k",
    "recall_at_k",
    "reciprocal_rank",
]
