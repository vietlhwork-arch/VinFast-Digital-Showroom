from __future__ import annotations

from typing import Any, TypedDict


class AgentState(TypedDict, total=False):
    """State schema cho LangGraph VinFast AI Advisor Agent.

    Mỗi node đọc và ghi vào state này.
    total=False cho phép tất cả fields là optional.
    """

    user_id: str
    user_email: str
    query: str
    intent: str
    use_catalog_rag: bool
    messages: list[dict[str, Any]]
    current_stage: str  # "GUARDRAIL", "NEEDS_DISCOVERY", "CATALOG_RAG", "TCO_CALCULATION", "RECOMMENDATION", "BLOCKED"
    is_blocked: bool
    guardrail_result: dict[str, Any]
    user_profile: dict[str, Any]
    criteria: dict[str, Any]
    candidate_ids: list[str]  # Lightweight vehicle code references (e.g. ["vf-5", "vf6-eco"])
    candidate_cars: list[dict[str, Any]]
    recommended_cars: list[dict[str, Any]]
    tco_result: dict[str, Any]
    context: str
    analysis: str
    response: str
    error: str
    rag_error: str
    existing_summary: str
    metadata: dict[str, Any]
    action: dict[str, Any] | None

    # Multi-pass & Memory State Fields
    chat_history: list[dict[str, Any]]
    chat_summaries: str | None
    long_term_memory: dict[str, Any]
    catalog_summary: str
    extract_result: dict[str, Any] | None
    query_results: list[dict[str, Any]]
    rag_context: str | None
    evaluation_trace: dict[str, Any]
    compose_result: dict[str, Any] | None
    is_context_sufficient: bool
    missing_focus: str | None

