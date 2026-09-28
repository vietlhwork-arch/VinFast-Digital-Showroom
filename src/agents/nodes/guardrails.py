"""3-Layer Defense Guardrails Node for VinFast AI Advisor Agent.

Implements Input Rails, LLM System Prompt Hardening, Output Rails, and Intent Classification
according to OWASP Top 10 for LLM Applications (ADR 0006).
"""

import re
from typing import Any, Literal

from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from src.agents.state import AgentState
from src.config import get_settings
from src.services.llm import get_llm

settings = get_settings()


class GuardrailResult(BaseModel):
    intent: Literal["IN_SCOPE_VINFAST", "OUT_OF_SCOPE", "OFFENSIVE"]
    is_safe: bool
    refusal_response: str | None = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    flagged_reasons: list[str] = Field(default_factory=list)


REFUSAL_OUT_OF_SCOPE = (
    "Em xin phép chỉ hỗ trợ tư vấn các thông tin liên quan đến sản phẩm, dịch vụ và chính sách của xe điện VinFast. "
    "Anh/chị có muốn tìm hiểu dòng ô tô (VF 3 - VF 9) hay xe máy điện VinFast không ạ?"
)

REFUSAL_OFFENSIVE = (
    "Em xin phép chỉ hỗ trợ các thông tin liên quan đến tư vấn sản phẩm xe điện VinFast. "
    "Rất mong anh/chị giữ đàm thoại lịch sự để em hỗ trợ tốt nhất ạ!"
)

# Rule-based Layer 1 Injection & Safety Patterns
PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous\s+)?instructions",
    r"forget\s+(all\s+)?(previous\s+)?instructions",
    r"forget\s+(all\s+)?rules",
    r"system\s+prompt",
    r"system\s+instructions",
    r"reveal\s+(secret|password|key|prompt)",
    r"api\s+keys|database\s+password",
    r"you\s+are\s+now\s+dan",
    r"act\s+as\s+dan",
    r"hacker|hack\s+hệ\s+thống",
    r"override\s+safety",
    r"disregard\s+rules",
    r"bỏ\s+qua\s+(toàn\s+bộ\s+)?hướng\s+dẫn",
    r"bỏ\s+qua\s+kiểm\s+tra",
    r"tiết\ lộ\s+system\s+prompt",
    r"sql\s+injection|'\s*or\s*'1'\s*=\s*'1",
    r"<script>",
]

OFFENSIVE_KEYWORDS = [
    "đái", "ỉa", "chửi", "đm", "vcl", "clmm", "đoạn chửi", "dùm tao", "địt", "lồn", "bố mày"
]

EXPLICIT_OUT_OF_SCOPE_TOPICS = [
    "thời tiết", "bóng đá", "phở", "quán phở", "nấu ăn", "công thức", "món ăn", "nhà hàng",
    "quán ăn", "tổng thống", "chính trị", "lịch sử", "code", "python", "javascript",
    "toyota", "hyundai", "honda", "tesla", "byd", "nissan", "ford", "bmw", "audi", "mercedes", "mazda", "kia", "mitsubishi"
]

VINFAST_SPECIFIC_TERMS = [
    "vinfast", "vf", "vf3", "vf 3", "vf4", "vf 4", "vf5", "vf 5", "vf6", "vf 6", "vf7", "vf 7", "vf8", "vf 8", "vf9", "vf 9",
    "evo200", "feliz", "klara", "theon", "vento", "drgnfly", "xe điện", "xe máy điện", "sạc điện", "thuê pin",
    "mua pin", "showroom", "lái thử", "báo giá", "lăn bánh", "thuế trước bạ", "ô tô", "xe hơi", "xe máy", "ngân sách", "chỗ", "ghế",
    "cá nhân", "nhu cầu cá nhân", "đi làm", "gia đình", "dịch vụ", "du lịch", "sạc nhà", "sạc công cộng", "phục vụ cá nhân",
    "mua", "tặng", "hàng ngày", "di chuyển", "đi lại", "chạy", "cần", "muốn"
]


def classify_intent_and_guardrails(user_input: str, is_active_chat: bool = False) -> GuardrailResult:
    """Classify user intent with 3-Layer Defense Rails."""
    query = user_input.strip()
    if not query:
        return GuardrailResult(
            intent="OUT_OF_SCOPE",
            is_safe=True,
            refusal_response=REFUSAL_OUT_OF_SCOPE,
            confidence=1.0,
            flagged_reasons=["Empty query"],
        )

    q_lower = query.lower()

    # 1. Input Layer Rule-based Injection Detector (From Settings)
    for pattern in getattr(settings, "guardrails_injection_patterns_list", []):
        if re.search(pattern, q_lower):
            return GuardrailResult(
                intent="OFFENSIVE",
                is_safe=False,
                refusal_response=REFUSAL_OFFENSIVE,
                confidence=1.0,
                flagged_reasons=["Prompt Injection attempt detected"],
            )

    # 2. Input Layer Toxic/Offensive Keyword Detector (From Settings)
    for kw in getattr(settings, "guardrails_offensive_keywords_list", []):
        if kw in q_lower:
            return GuardrailResult(
                intent="OFFENSIVE",
                is_safe=False,
                refusal_response=REFUSAL_OFFENSIVE,
                confidence=1.0,
                flagged_reasons=["Toxic or offensive language detected"],
            )

    dynamic_keywords = _get_dynamic_vinfast_keywords()
    has_vinfast_mention = any(k in q_lower for k in dynamic_keywords)

    for topic in getattr(settings, "guardrails_out_of_scope_topics_list", []):
        if topic in q_lower and not has_vinfast_mention:
            return GuardrailResult(
                intent="OUT_OF_SCOPE",
                is_safe=True,
                refusal_response=REFUSAL_OUT_OF_SCOPE,
                confidence=0.95,
                flagged_reasons=[f"Out of scope topic '{topic}' mentioned"],
            )

    # 4. Active Conversation Protection: user answers during active chat are in-scope
    if is_active_chat:
        return GuardrailResult(intent="IN_SCOPE_VINFAST", is_safe=True, confidence=0.98)

    # 5. Standalone Numbers (e.g. "5", "4", "500", "7")
    if re.match(r"^\d+$", q_lower):
        return GuardrailResult(intent="IN_SCOPE_VINFAST", is_safe=True, confidence=0.95)

    # 6. Greetings (From Settings)
    greetings = getattr(settings, "guardrails_greetings_list", [])
    if any(g in q_lower for g in greetings):
        return GuardrailResult(intent="IN_SCOPE_VINFAST", is_safe=True, confidence=0.95)

    # 7. VinFast Specific Terms & Budget/Seat Numbers
    if has_vinfast_mention or re.search(r"\d+", q_lower):
        return GuardrailResult(intent="IN_SCOPE_VINFAST", is_safe=True, confidence=0.95)

    # 8. LLM Semantic Classification (If OpenAI API Key available)
    if settings.openai_api_key and settings.openai_api_key != "" and settings.openai_api_key != "mock-key-for-local-testing":
        try:
            from src.prompts import GUARDRAIL_CLASSIFIER_PROMPT
            llm = get_llm(temperature=0.0)
            system_prompt = GUARDRAIL_CLASSIFIER_PROMPT
            res = llm.invoke([SystemMessage(content=system_prompt), HumanMessage(content=query)])
            llm_intent = res.content.strip().upper()
            if "IN_SCOPE_VINFAST" in llm_intent:
                return GuardrailResult(intent="IN_SCOPE_VINFAST", is_safe=True, confidence=0.98)
            elif "OFFENSIVE" in llm_intent:
                return GuardrailResult(
                    intent="OFFENSIVE",
                    is_safe=False,
                    refusal_response=REFUSAL_OFFENSIVE,
                    confidence=0.95,
                    flagged_reasons=["LLM classified as offensive"],
                )
            else:
                return GuardrailResult(
                    intent="OUT_OF_SCOPE",
                    is_safe=True,
                    refusal_response=REFUSAL_OUT_OF_SCOPE,
                    confidence=0.90,
                    flagged_reasons=["LLM classified as out-of-scope"],
                )
        except Exception:
            pass  # Fallback to local rules

def _get_dynamic_vinfast_keywords() -> set[str]:
    """Dynamically get all brand and model keywords from the database catalog."""
    from src.services.catalog_service import get_dynamic_model_keyword_map
    
    brand_terms = {
        "vinfast", "xe điện", "xe dien", "ô tô điện", "o to dien", "xe máy điện", "xe may dien",
        "trạm sạc", "tram sac", "thuê pin", "thue pin", "mua pin", "lái thử", "lai thu", "báo giá", "bao gia"
    }
    
    try:
        model_map = get_dynamic_model_keyword_map()
        return brand_terms.union(model_map.keys())
    except Exception:
        return brand_terms


def classify_intent_lightweight(user_input: str, is_active_chat: bool = False) -> str:
    """Classify user intent into one of 4 main routes using fast rule-based classifier (< 1ms)."""
    query = user_input.strip()
    if not query:
        return "refusal"

    q_lower = query.lower()

    # 1. Prompt Injection / Hacking (Loaded from Settings)
    injection_patterns = getattr(settings, "guardrails_injection_patterns_list", [])
    for pattern in injection_patterns:
        if re.search(pattern, q_lower):
            return "refusal"

    # 2. Toxic / Offensive (Loaded from Settings)
    offensive_words = getattr(settings, "guardrails_offensive_keywords_list", [])
    for kw in offensive_words:
        if kw in q_lower:
            return "refusal"

    # 3. Dynamic Catalog Vehicle Mentions
    dynamic_keywords = _get_dynamic_vinfast_keywords()
    has_vinfast_mention = any(k in q_lower for k in dynamic_keywords)

    # 4. Explicit Out-of-Scope (Loaded from Settings)
    out_of_scope_topics = getattr(settings, "guardrails_out_of_scope_topics_list", [])
    for topic in out_of_scope_topics:
        if topic in q_lower and not has_vinfast_mention:
            return "refusal"

    # 5. Direct Specs / Comparison / Discontinued query (Loaded from Settings)
    spec_keywords = getattr(settings, "guardrails_spec_keywords_list", [])
    has_spec_intent = any(sk in q_lower for sk in spec_keywords)
    if has_spec_intent and has_vinfast_mention:
        return "spec_query"

    # 6. Conversational Greetings (Loaded from Settings)
    greetings = getattr(settings, "guardrails_greetings_list", [])
    is_greeting_intent = any(
        q_lower == g or q_lower.startswith(g + " ") or q_lower.startswith(g + "!") or q_lower.startswith(g + ",")
        for g in greetings
    )
    
    # If it's a greeting without specific model specs or budget filter -> Route 1
    if is_greeting_intent and not has_spec_intent and not re.search(r"\b(triệu|tỷ|chỗ|ghế|\d{3,})\b", q_lower):
        return "greeting"

    # 7. Default to Needs Discovery & Recommendation (Route 3)
    return "needs_discovery"


def guardrail_node(state: AgentState) -> dict[str, Any]:
    """LangGraph Node for fast Intent Classification & Guardrails (~0ms)."""
    messages = state.get("messages", [])
    query = state.get("query", "")
    if not query and messages:
        query = messages[-1].get("content", "")
    query = query.strip()
    is_active = len(messages) > 1
    
    intent = classify_intent_lightweight(query, is_active_chat=is_active)
    
    return {
        "intent": intent,
        "current_stage": "GUARDRAIL",
        "is_blocked": intent == "refusal",
        "guardrail_result": {"intent": intent, "is_safe": intent != "refusal"},
        "candidate_cars": state.get("candidate_cars", []),
        "user_profile": state.get("user_profile", {}),
    }
