"""Final answer node grounded in catalog snippets and conversation memory."""

from __future__ import annotations

from collections.abc import Callable
from functools import lru_cache
from typing import Any

from langchain_openai import ChatOpenAI
from openai import APIConnectionError, APITimeoutError, AuthenticationError, RateLimitError

from src.agents.state import AgentState
from src.config import get_settings


def _format_recent_history(messages: list[Any], *, max_chars: int = 24000) -> str:
    """Keep the newest dialogue that fits the prompt budget."""
    selected: list[str] = []
    used = 0
    for message in reversed(messages):
        if isinstance(message, dict):
            role = str(message.get("role") or "user")
            content = str(message.get("content") or "").strip()
        else:
            role = str(getattr(message, "type", "user"))
            content = str(getattr(message, "content", "")).strip()
        if not content:
            continue
        line = f"{role}: {content}"
        if selected and used + len(line) > max_chars:
            break
        selected.append(line)
        used += len(line)
    return "\n".join(reversed(selected))


@lru_cache(maxsize=1)
def get_answer_llm() -> ChatOpenAI:
    settings = get_settings()
    api_key = settings.openai_api_key.strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    return ChatOpenAI(
        model=settings.model_name,
        api_key=api_key,
        temperature=0,
    )


def build_answer_node(*, llm_factory: Callable[[], Any] = get_answer_llm):
    async def answer_node(state: AgentState) -> dict[str, str]:
        query = state.get("query", "").strip()
        context = state.get("context", "").strip()
        summary = state.get("existing_summary", "").strip()
        messages = state.get("messages") or []
        prior_messages = messages
        if messages and isinstance(messages[-1], dict):
            last_message = messages[-1]
            if last_message.get("role") == "user" and str(last_message.get("content") or "").strip() == query:
                prior_messages = messages[:-1]
        history = _format_recent_history(prior_messages)
        rag_error = state.get("rag_error")

        if state.get("error") == "empty_query" or not query:
            return {"response": "Vui lòng nhập câu hỏi để mình có thể hỗ trợ."}
        if rag_error and not context:
            return {
                "response": (
                    "Xin lỗi, hiện mình chưa thể truy xuất dữ liệu catalog. "
                    "Bạn vui lòng thử lại sau."
                )
            }

        system_prompt = (
            "Bạn là trợ lý tư vấn xe VinFast chính hãng. "
            "Khi có dữ liệu catalog, chỉ sử dụng dữ liệu đó cho thông số, giá và chính sách; "
            "không suy đoán hoặc tự tạo con số. Nếu dữ liệu không đủ, hãy nói rõ giới hạn. "
            "TUYỆT ĐỐI KHÔNG nhắc đến các mốc thời gian trong quá khứ như 'tháng 10/2023' hay giới hạn dữ liệu cutoff của AI. Bạn đang đại diện trực tiếp cho Showroom VinFast hiện hành. "
            "Dùng phần tóm tắt và hội thoại để hiểu ngữ cảnh, nhưng luôn trả lời câu hỏi gốc. "
            "Trả lời tự nhiên, ngắn gọn và bằng tiếng Việt."
        )
        evidence = context or "Không có dữ liệu catalog; chỉ xử lý hội thoại thông thường."
        memory = summary or "Chưa có tóm tắt từ phiên trước."
        dialogue = history or "Chưa có hội thoại mới sau bản tóm tắt."

        try:
            response = await llm_factory().ainvoke(
                [
                    ("system", system_prompt),
                    (
                        "human",
                        f"Tóm tắt các phiên trước:\n{memory}\n\n"
                        f"Hội thoại mới chưa nằm trong bản tóm tắt:\n{dialogue}\n\n"
                        f"Dữ liệu catalog:\n{evidence}\n\n"
                        f"Câu hỏi gốc cần trả lời: {query}",
                    ),
                ]
            )
        except AuthenticationError:
            return {"response": "Dịch vụ AI chưa được cấu hình đúng API key."}
        except RateLimitError:
            return {"response": "Dịch vụ AI đang quá tải. Bạn vui lòng thử lại sau."}
        except (APIConnectionError, APITimeoutError, TimeoutError):
            return {"response": "Chưa thể kết nối dịch vụ AI. Bạn vui lòng thử lại sau."}
        except Exception:
            return {"response": "Đã xảy ra lỗi khi tạo câu trả lời. Bạn vui lòng thử lại sau."}

        content = response.content
        answer = content.strip() if isinstance(content, str) else str(content).strip()
        return {"response": answer or "Mình chưa thể tạo câu trả lời phù hợp."}

    return answer_node


answer_node = build_answer_node()


__all__ = [
    "answer_node",
    "build_answer_node",
    "get_answer_llm",
    "_format_recent_history",
]
