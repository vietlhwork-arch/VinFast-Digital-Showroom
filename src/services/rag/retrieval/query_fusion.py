"""Generate bounded query variants with GPT-4o-mini structured output."""

from __future__ import annotations

from typing import Any, Protocol

from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from src.services.rag.config import QueryFusionConfig
from src.services.rag.retrieval.models import QueryPlan


class QueryPlanner(Protocol):
    async def plan(self, query: str) -> QueryPlan: ...


class FusionDecision(BaseModel):
    use_fusion: bool = Field(description="True only when alternate phrasings improve retrieval coverage.")
    variants: list[str] = Field(
        default_factory=list,
        description="Alternate Vietnamese search queries; never repeat the original query.",
    )


class OriginalQueryPlanner:
    async def plan(self, query: str) -> QueryPlan:
        cleaned = query.strip()
        if not cleaned:
            raise ValueError("query must not be empty")
        return QueryPlan(original_query=cleaned, queries=(cleaned,), used_fusion=False)


class OpenAIQueryFusionPlanner:
    """Use an LLM only to paraphrase; trusted filters stay outside this class."""

    _SYSTEM_PROMPT = """Bạn là bộ lập kế hoạch truy vấn cho catalog xe VinFast.
Hãy xác định câu hỏi có cần nhiều cách diễn đạt để tăng recall hay không.
- Câu hỏi thông số đơn giản, có tên xe và một thuộc tính rõ ràng: use_fusion=false.
- Câu hỏi mơ hồ, so sánh, tư vấn nhu cầu hoặc có nhiều ý: use_fusion=true.
- Không thay đổi tên xe, phiên bản, mã định danh, con số hoặc đơn vị.
- Không thêm thông tin mà người dùng không cung cấp.
- Mỗi biến thể phải ngắn, phù hợp để tìm kiếm, và giữ nguyên ý định.
"""

    def __init__(self, llm: Any, *, max_queries: int = 3) -> None:
        if not 1 <= max_queries <= 4:
            raise ValueError("max_queries must be between 1 and 4")
        self._max_queries = max_queries
        self._structured_llm = llm.with_structured_output(
            FusionDecision,
            method="json_schema",
        )

    async def plan(self, query: str) -> QueryPlan:
        cleaned = query.strip()
        if not cleaned:
            raise ValueError("query must not be empty")
        if self._max_queries == 1:
            return QueryPlan(cleaned, (cleaned,), False)

        try:
            response = await self._structured_llm.ainvoke(
                [
                    ("system", self._SYSTEM_PROMPT),
                    (
                        "human",
                        f"Câu hỏi gốc: {cleaned}\nTạo tối đa {self._max_queries - 1} biến thể nếu cần.",
                    ),
                ]
            )
        except Exception:
            return QueryPlan(cleaned, (cleaned,), False)
        decision = response if isinstance(response, FusionDecision) else FusionDecision.model_validate(response)
        if not decision.use_fusion:
            return QueryPlan(cleaned, (cleaned,), False)

        queries = [cleaned]
        seen = {cleaned.casefold()}
        for variant in decision.variants:
            candidate = variant.strip()
            key = candidate.casefold()
            if not candidate or key in seen:
                continue
            queries.append(candidate)
            seen.add(key)
            if len(queries) >= self._max_queries:
                break
        return QueryPlan(
            original_query=cleaned,
            queries=tuple(queries),
            used_fusion=len(queries) > 1,
        )


def build_query_planner(
    settings: Any,
    config: QueryFusionConfig,
) -> QueryPlanner:
    if not config.enabled:
        return OriginalQueryPlanner()
    api_key = settings.openai_api_key.strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required when RAG_QUERY_FUSION_ENABLED=true")
    llm = ChatOpenAI(
        model=config.model,
        api_key=api_key,
        temperature=0,
    )
    return OpenAIQueryFusionPlanner(llm, max_queries=config.max_queries)


__all__ = [
    "FusionDecision",
    "OpenAIQueryFusionPlanner",
    "OriginalQueryPlanner",
    "QueryPlanner",
    "build_query_planner",
]
