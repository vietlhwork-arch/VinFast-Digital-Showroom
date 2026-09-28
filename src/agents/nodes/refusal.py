"""Single-Pass Refusal / De-escalation Node for VinFast AI Advisor.
Generates polite, natural refusals and guides users back to VinFast EV topics in 1 fast LLM call.
"""

from __future__ import annotations

import logging
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from src.agents.state import AgentState
from src.services.llm import get_llm

logger = logging.getLogger(__name__)

REFUSAL_SYSTEM_PROMPT = """Bạn là trợ lý tư vấn chuyên sâu của VinFast.
Khách hàng vừa hỏi một nội dung nằm ngoài phạm vi tư vấn sản phẩm/dịch vụ xe điện VinFast hoặc có yếu tố nhạy cảm/không phù hợp.

Nhiệm vụ:
1. Từ chối một cách khéo léo, lịch sự và duyên dáng (tuyệt đối không nói "Tôi là AI không hiểu" hay "Lỗi hệ thống").
2. Khéo léo dẫn dắt khách hàng quay lại chủ đề các dòng xe điện VinFast (ô tô điện VF 3 - VF 9, xe máy điện Evo200, Feliz S, Klara, trạm sạc, chính sách pin).
3. Độ dài ngắn gọn (1-2 câu). Xưng "em" và gọi "anh/chị"."""


async def refusal_node(state: AgentState) -> dict[str, Any]:
    """Single-Pass LLM Refusal Node (~300ms, 1 LLM call)."""
    raw_messages = list(state.get("messages") or [])
    query = state.get("query", "").strip()
    intent = state.get("intent", "out_of_scope")
    is_offensive = intent in ("toxic", "offensive", "prompt_injection")
    
    messages: list[Any] = []
    for m in raw_messages:
        if isinstance(m, (HumanMessage, AIMessage, SystemMessage)):
            messages.append(m)
        elif isinstance(m, dict):
            role = m.get("role")
            content = str(m.get("content") or "")
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))
            elif role == "system":
                messages.append(SystemMessage(content=content))

    if not messages and query:
        messages = [HumanMessage(content=query)]
        
    try:
        llm = get_llm(temperature=0.3)
        formatted_messages = [
            SystemMessage(content=f"{REFUSAL_SYSTEM_PROMPT}\n(Loại câu hỏi: {intent})")
        ] + messages
        response = await llm.ainvoke(formatted_messages)
        ai_text = response.content.strip()
    except Exception as e:
        logger.warning(f"Fallback refusal due to error: {e}")
        ai_text = (
            "Dạ em chỉ là trợ lý tư vấn chuyên sâu về các dòng sản phẩm và dịch vụ xe điện VinFast thôi ạ. "
            "Nếu anh/chị cần tìm hiểu thông số, giá bán hay ưu đãi các dòng xe điện VinFast thì cứ nhắn em nhé!"
        )

    return {
        "current_stage": "REFUSAL",
        "response": ai_text,
        "messages": messages + [AIMessage(content=ai_text)],
        "candidate_cars": state.get("candidate_cars", []),
        "user_profile": state.get("user_profile", {}),
        "is_blocked": is_offensive,
    }
