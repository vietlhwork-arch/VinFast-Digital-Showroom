"""Single-Pass Greeting Node for VinFast AI Advisor.
Generates warm, natural, and personalized discovery openings in a single fast LLM call (~300ms).
"""

from __future__ import annotations

import logging
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from src.agents.state import AgentState
from src.services.llm import get_llm

logger = logging.getLogger(__name__)

GREETING_SYSTEM_PROMPT = """Bạn là chuyên viên tư vấn cao cấp của VinFast - thương hiệu xe điện thông minh Việt Nam.
Phong cách: Duyên dáng, ấm áp, lịch thiệp, xưng hô "em" và gọi khách là "anh/chị" (hoặc theo đại từ xưng hô khách dùng).

Nhiệm vụ: Chào đón khách hàng và KHÉO LÉO GỢI MỞ NHU CẦU một cách tự nhiên (1-2 câu ngắn gọn):
- Hỏi khách đang quan tâm đến dòng Ô tô điện (VF 3 - VF 9) hay Xe máy điện thông minh (Evo, Feliz, Klara, Vento, Theon)?
- Hoặc hỏi nhu cầu sử dụng chính (đi làm gia đình, chạy dịch vụ, hay ngân sách dự kiến tầm bao nhiêu)?
- Tuyệt đối không liệt kê danh sách cứng nhắc, hãy trò chuyện tự nhiên như người thật."""


async def greeting_node(state: AgentState) -> dict[str, Any]:
    """Single-Pass LLM Greeting Node (~300ms, 1 LLM call)."""
    raw_messages = list(state.get("messages") or [])
    query = state.get("query", "").strip()
    
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
        llm = get_llm(temperature=0.4)
        formatted_messages = [SystemMessage(content=GREETING_SYSTEM_PROMPT)] + messages
        response = await llm.ainvoke(formatted_messages)
        ai_text = response.content.strip()
    except Exception as e:
        logger.warning(f"Fallback greeting due to error: {e}")
        ai_text = (
            "Dạ em chào anh/chị! Em là chuyên viên tư vấn của VinFast. "
            "Anh/chị đang quan tâm đến dòng ô tô điện (VF 3 - VF 9) hay xe máy điện để em hỗ trợ tư vấn chi tiết ạ?"
        )

    return {
        "current_stage": "GREETING",
        "response": ai_text,
        "messages": messages + [AIMessage(content=ai_text)],
        "candidate_cars": state.get("candidate_cars", []),
        "user_profile": state.get("user_profile", {}),
        "is_blocked": False,
    }
