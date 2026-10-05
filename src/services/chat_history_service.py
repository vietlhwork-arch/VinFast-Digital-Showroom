"""Chat History & Memory Persistence Service for VinFast AI Advisor Agent.

Manages active session messages in Supabase `public.chat_history` and
long-term user demand summaries in `public.chat_summaries`.
"""

from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

import requests

from src.config import get_settings
from src.services.llm import get_llm

settings = get_settings()
UTC = timezone.utc

# Keep the active, unsummarized conversation comfortably below the model's
# context window. At 80%, previous turns are merged into the rolling summary.
UNSUMMARIZED_CHAT_TOKEN_LIMIT = 6_000
ROLLING_SUMMARY_TRIGGER_TOKENS = 4_800


def estimate_text_tokens(value: str) -> int:
    """Conservative tokenizer-free estimate suitable for Vietnamese text."""
    text = str(value or "").strip()
    return max(1, (len(text) + 3) // 4) if text else 0


def estimate_messages_tokens(messages: list[dict[str, Any]]) -> int:
    return sum(
        estimate_text_tokens(str(message.get("content") or "")) + 4
        for message in messages
    )


def should_rollup_messages(messages: list[dict[str, Any]]) -> bool:
    return estimate_messages_tokens(messages) >= ROLLING_SUMMARY_TRIGGER_TOKENS


def get_supabase_headers(schema: str = "public") -> dict[str, str]:
    """Get Supabase REST API headers with schema selection."""
    key = settings.supabase_key.strip()
    if not key:
        raise RuntimeError("SUPABASE_KEY is not configured")
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept-Profile": schema,
        "Content-Profile": schema,
    }


def get_supabase_url() -> str:
    """Get base Supabase URL."""
    url = settings.supabase_url.strip()
    if not url:
        raise RuntimeError("SUPABASE_URL is not configured")
    return url.rstrip("/")


def save_chat_message(
    session_id: str,
    role: str,
    content: str,
    user_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    """Save one user/assistant message to public.chat_history."""
    meta = metadata.copy() if metadata else {}
    meta["session_id"] = session_id

    payload = {
        "role": role,
        "content": content,
        "metadata": meta,
    }
    if user_id and user_id.strip() != "":
        payload["user_id"] = user_id
    else:
        payload["user_id"] = None

    try:
        url = f"{get_supabase_url()}/rest/v1/chat_history"
        headers = get_supabase_headers()
        res = requests.post(url, json=payload, headers=headers, timeout=1.5)
        if res.status_code in [200, 201]:
            return res.json() if res.content else payload
    except Exception as e:
        print(f"[Supabase] Error saving chat message: {e}")
    return None


def get_latest_user_summary_record(user_id: str) -> dict[str, Any] | None:
    """Fetch summary text and its checkpoint timestamp from public."""
    if not user_id or user_id.strip() == "":
        return None

    try:
        url = f"{get_supabase_url()}/rest/v1/chat_summaries?user_id=eq.{user_id}&select=summary_id,summary_text,summarized_through,updated_at&order=updated_at.desc&limit=1"
        headers = get_supabase_headers()
        res = requests.get(url, headers=headers, timeout=1.5)
        if res.status_code == 200:
            data = res.json()
            if data and len(data) > 0:
                return data[0]
    except Exception as e:
        print(f"[Supabase] Error fetching user summary: {e}")
    return None


def get_latest_user_summary(user_id: str) -> str | None:
    record = get_latest_user_summary_record(user_id)
    return str(record.get("summary_text") or "") if record else None


def get_guest_summary_record(session_id: str) -> dict[str, Any] | None:
    """Fetch the durable rolling summary owned by one anonymous session."""
    if not session_id or not session_id.strip():
        return None

    try:
        encoded_session = quote(session_id, safe="")
        url = (
            f"{get_supabase_url()}/rest/v1/chat_summaries"
            f"?session_id=eq.{encoded_session}&user_id=is.null"
            "&select=summary_id,summary_text,summarized_through,updated_at"
            "&order=updated_at.desc&limit=1"
        )
        res = requests.get(url, headers=get_supabase_headers(), timeout=1.5)
        if res.status_code == 200:
            data = res.json()
            if data:
                return data[0]
    except Exception as error:
        print(f"[Supabase] Error fetching guest summary: {error}")
    return None


def get_summary_checkpoint(record: dict[str, Any] | None) -> str | None:
    """Use the explicit message checkpoint, falling back for legacy rows."""
    if not record:
        return None
    value = record.get("summarized_through") or record.get("updated_at")
    return str(value) if value else None


def get_session_messages(
    session_id: str,
    *,
    after: str | None = None,
) -> list[dict[str, Any]]:
    """Fetch only messages newer than the latest summary checkpoint."""
    try:
        encoded_session = quote(session_id, safe="")
        url = f"{get_supabase_url()}/rest/v1/chat_history?metadata->>session_id=eq.{encoded_session}&select=role,content,created_at&order=created_at.asc"
        if after:
            url += f"&created_at=gt.{quote(str(after), safe=':-.TZ')}"
        headers = get_supabase_headers()
        res = requests.get(url, headers=headers, timeout=1.5)
        if res.status_code == 200:
            return res.json()
    except Exception as e:
        print(f"[Supabase] Error fetching session messages: {e}")
    return []


def _format_dialogue_for_summary(messages: list[dict[str, Any]]) -> str:
    lines: list[str] = []
    for message in messages:
        role_label = "Khách hàng" if message.get("role") == "user" else "AI Advisor"
        lines.append(f"{role_label}: {str(message.get('content') or '').strip()}")
    return "\n".join(line for line in lines if not line.endswith(": "))


def summarize_messages(
    *,
    messages: list[dict[str, Any]],
    old_summary: str | None = None,
) -> str | None:
    """Merge messages into a summary without writing any database row."""
    if not messages:
        return old_summary

    previous = old_summary or "Chưa có thông tin nhu cầu trước đây."
    dialogue_str = _format_dialogue_for_summary(messages)
    if not dialogue_str:
        return previous

    try:
        import os

        from jinja2 import Environment, FileSystemLoader
        from langchain_core.messages import HumanMessage, SystemMessage

        prompts_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agents", "prompts")
        template = Environment(
            loader=FileSystemLoader(prompts_dir),
            autoescape=False,
        ).get_template("summary_merger.jinja2")
        prompt = template.render(old_summary=previous, dialogue_str=dialogue_str)
        response = get_llm(temperature=0.3).invoke(
            [
                SystemMessage(content=prompt),
                HumanMessage(content="Hãy tạo một bản tóm tắt nhu cầu hợp nhất duy nhất."),
            ]
        )
        new_summary = str(response.content or "").strip()
        return new_summary or None
    except Exception as error:
        print(f"[Summary] Error generating chat summary: {error}")
        return None


def save_user_summary(
    user_id: str,
    summary_text: str,
    *,
    summarized_through: str | None = None,
) -> bool:
    """Upsert one durable summary for an authenticated user."""
    if not user_id or not summary_text.strip():
        return False
    try:
        url_base = get_supabase_url()
        headers = get_supabase_headers()
        check_url = f"{url_base}/rest/v1/chat_summaries?user_id=eq.{user_id}&select=summary_id&limit=1"
        check = requests.get(check_url, headers=headers, timeout=2.0)
        checkpoint = summarized_through or datetime.now(UTC).isoformat()
        payload = {
            "summary_text": summary_text,
            "summarized_through": checkpoint,
            "updated_at": datetime.now(UTC).isoformat(),
        }

        if check.status_code == 200 and check.json():
            summary_id = check.json()[0].get("summary_id")
            save = requests.patch(
                f"{url_base}/rest/v1/chat_summaries?summary_id=eq.{summary_id}",
                json=payload,
                headers=headers,
                timeout=2.0,
            )
        else:
            payload["user_id"] = user_id
            payload["session_id"] = None
            save = requests.post(
                f"{url_base}/rest/v1/chat_summaries",
                json=payload,
                headers=headers,
                timeout=2.0,
            )
        if save.status_code not in (200, 201, 204):
            return False
        return True
    except Exception as error:
        print(f"[Supabase] Error saving chat summary: {error}")
        return False


def save_guest_summary(
    session_id: str,
    summary_text: str,
    *,
    summarized_through: str | None = None,
) -> bool:
    """Upsert one temporary summary for an anonymous session."""
    if not session_id or not session_id.strip() or not summary_text.strip():
        return False

    try:
        url_base = get_supabase_url()
        headers = get_supabase_headers()
        encoded_session = quote(session_id, safe="")
        check_url = (
            f"{url_base}/rest/v1/chat_summaries"
            f"?session_id=eq.{encoded_session}&user_id=is.null"
            "&select=summary_id&limit=1"
        )
        check = requests.get(check_url, headers=headers, timeout=2.0)
        checkpoint = summarized_through or datetime.now(UTC).isoformat()
        payload = {
            "summary_text": summary_text,
            "summarized_through": checkpoint,
            "updated_at": datetime.now(UTC).isoformat(),
        }

        if check.status_code == 200 and check.json():
            summary_id = check.json()[0].get("summary_id")
            save = requests.patch(
                f"{url_base}/rest/v1/chat_summaries?summary_id=eq.{summary_id}",
                json=payload,
                headers=headers,
                timeout=2.0,
            )
        else:
            payload.update({"user_id": None, "session_id": session_id})
            save = requests.post(
                f"{url_base}/rest/v1/chat_summaries",
                json=payload,
                headers=headers,
                timeout=2.0,
            )
        return save.status_code in (200, 201, 204)
    except Exception as error:
        print(f"[Supabase] Error saving guest summary: {error}")
        return False


def merge_summary_with_messages(
    *,
    user_id: str,
    messages: list[dict[str, Any]],
    old_summary: str | None = None,
    summarized_through: str | None = None,
) -> str | None:
    """Merge one checkpoint into the user's durable rolling summary."""
    if not user_id or not messages:
        return old_summary

    previous = old_summary or get_latest_user_summary(user_id)
    new_summary = summarize_messages(messages=messages, old_summary=previous)
    if not new_summary or not save_user_summary(
        user_id,
        new_summary,
        summarized_through=summarized_through,
    ):
        return None
    return new_summary


def merge_guest_summary_with_messages(
    *,
    session_id: str,
    messages: list[dict[str, Any]],
    old_summary: str | None = None,
    summarized_through: str | None = None,
) -> str | None:
    """Merge and persist one anonymous session's rolling summary."""
    if not session_id or not messages:
        return old_summary

    previous = old_summary
    if previous is None:
        record = get_guest_summary_record(session_id)
        previous = str(record.get("summary_text") or "") if record else None
    new_summary = summarize_messages(messages=messages, old_summary=previous)
    if not new_summary or not save_guest_summary(
        session_id,
        new_summary,
        summarized_through=summarized_through,
    ):
        return None
    return new_summary


def delete_guest_summary(session_id: str) -> bool:
    """Delete only the anonymous summary belonging to one session."""
    if not session_id:
        return False
    try:
        encoded_session = quote(session_id, safe="")
        url = (
            f"{get_supabase_url()}/rest/v1/chat_summaries"
            f"?session_id=eq.{encoded_session}&user_id=is.null"
        )
        response = requests.delete(
            url,
            headers=get_supabase_headers(),
            timeout=2.0,
        )
        return response.status_code in (200, 204)
    except Exception as error:
        print(f"[Supabase] Error deleting guest summary: {error}")
        return False


def delete_guest_session_data(session_id: str) -> bool:
    """Forget both messages and summary for exactly one anonymous session."""
    if not session_id:
        return False
    try:
        encoded_session = quote(session_id, safe="")
        history_url = (
            f"{get_supabase_url()}/rest/v1/chat_history"
            f"?metadata->>session_id=eq.{encoded_session}&user_id=is.null"
        )
        history = requests.delete(
            history_url,
            headers=get_supabase_headers(),
            timeout=2.0,
        )
        summary_deleted = delete_guest_summary(session_id)
        return history.status_code in (200, 204) and summary_deleted
    except Exception as error:
        print(f"[Supabase] Error deleting guest session data: {error}")
        return False


def end_session_and_summarize(
    session_id: str,
    user_id: str | None = None,
    messages: list[dict[str, Any]] | None = None,
) -> str | None:
    """End a chat session.

    1. Guest user (user_id is None): Delete chat_history and chat_summaries for session.
    2. Logged-in user: merge old summary + completed session into public.chat_summaries.
    """
    # Case 1: Anonymous / Guest user -> delete all temporary session data.
    if not user_id or user_id.strip() == "":
        deleted = delete_guest_session_data(session_id)
        print(f"[Supabase] Cleared guest session '{session_id}': success={deleted}")
        return None

    # Case 2: Logged-in user -> summarize only messages after the checkpoint.
    summary_record = get_latest_user_summary_record(user_id)
    old_summary = str(summary_record.get("summary_text") or "") if summary_record else None
    checkpoint = get_summary_checkpoint(summary_record)
    session_msgs = messages if messages is not None else get_session_messages(session_id, after=checkpoint)
    if not session_msgs:
        return old_summary

    return merge_summary_with_messages(
        user_id=user_id,
        messages=session_msgs,
        old_summary=old_summary,
        summarized_through=datetime.now(UTC).isoformat(),
    ) or old_summary


def bind_session_user(session_id: str, user_id: str) -> bool:
    """Associate all unauthenticated messages in a session_id with a newly logged-in user_id."""
    if not session_id or not user_id:
        return False
    try:
        url_base = get_supabase_url()
        headers = get_supabase_headers()
        encoded_session = quote(session_id, safe="")
        patch_url = (
            f"{url_base}/rest/v1/chat_history?metadata->>session_id=eq.{encoded_session}"
            "&user_id=is.null"
        )
        res = requests.patch(patch_url, json={"user_id": user_id}, headers=headers, timeout=2.0)
        print(f"[Supabase] Bound session '{session_id}' to user '{user_id}': status {res.status_code}")
        return res.status_code in [200, 204]
    except Exception as e:
        print(f"[Supabase] Error binding session user: {e}")
        return False


def create_pending_quote_in_supabase(
    user_id: str | None,
    customer_name: str,
    customer_phone: str,
    vehicle_id: str,
    vehicle_name: str,
    base_price: int,
    final_price: int | None = None,
    customer_email: str | None = None,
) -> dict[str, Any] | None:
    """Insert pending quote record directly into Supabase Cloud quotes table."""
    import uuid as _uuid

    calc_final_price = final_price
    if calc_final_price is None:
        try:
            from src.services.tco_calculator import TCOCalculationRequest, calculate_tco
            v_code = (vehicle_id or "").lower().strip()
            is_motorbike = v_code in ["evo-lite", "feliz-s", "klara-s2", "vento-s", "theon-s", "evo200"]
            t_req = TCOCalculationRequest(
                vehicle_type="MOTORBIKE" if is_motorbike else "CAR",
                model_id=v_code or "vf9",
                province_code="HN",
                base_price_override=base_price,
            )
            t_res = calculate_tco(t_req)
            calc_final_price = t_res.rolling_cost_breakdown.total_rolling_cost_vnd
        except Exception as e:
            print(f"[Supabase] Note: TCO calc fallback to base_price: {e}")
            calc_final_price = base_price

    real_name = customer_name
    real_phone = customer_phone

    if (user_id and user_id.strip()) or (customer_email and customer_email.strip()):
        try:
            import uuid as _u

            from sqlalchemy import select

            from src.models.domain import Account
            from src.services.database import SessionLocal

            with SessionLocal() as db_session:
                query = select(Account)
                if user_id and user_id.strip():
                    try:
                        query = query.where(Account.user_id == _u.UUID(user_id.strip()))
                    except Exception:
                        if customer_email and customer_email.strip():
                            query = query.where(Account.email == customer_email.strip().lower())
                elif customer_email and customer_email.strip():
                    query = query.where(Account.email == customer_email.strip().lower())

                acc = db_session.execute(query).scalar_one_or_none()
                if acc:
                    if acc.full_name and (not real_name or real_name in ["Khách hàng VinFast", ""]):
                        real_name = acc.full_name
                    if acc.phone and (not real_phone or real_phone in ["0900000000", "0901234567", ""]):
                        real_phone = acc.phone
        except Exception as e_acc:
            print(f"[Supabase] Account lookup info: {e_acc}")

    payload = {
        "id": str(_uuid.uuid4()),  # Supabase REST API requires explicit UUID (no server-side DEFAULT)
        "user_id": user_id if (user_id and user_id.strip()) else None,
        "customer_name": real_name or "Khách hàng VinFast",
        "customer_email": customer_email if (customer_email and customer_email.strip()) else None,
        "customer_phone": real_phone if (real_phone and real_phone.strip() and real_phone not in ["0900000000", "0901234567"]) else "Chưa cập nhật",

        "vehicle_id": vehicle_id or "vf9",
        "vehicle_name": vehicle_name or "VinFast VF 9 Eco",
        "base_price": base_price or 1589000000,
        "final_price": calc_final_price or base_price or 1589000000,
        "discount": 0,
        "status": "pending",
        "notes": "Yêu cầu báo giá khởi tạo tự động từ Trợ lý AI Advisor",
    }

    try:
        url = f"{get_supabase_url()}/rest/v1/quotes"
        headers = get_supabase_headers()
        res = requests.post(url, json=payload, headers=headers, timeout=2.0)
        print(f"[Supabase] Created pending quote for '{vehicle_name}': status {res.status_code}, final_price {calc_final_price}")
        if res.status_code in [200, 201]:
            return res.json() if res.content else payload
        else:
            print(f"[Supabase] Quote insert failed: {res.text[:200]}")
    except Exception as e:
        print(f"[Supabase] Error creating pending quote: {e}")
    return None

