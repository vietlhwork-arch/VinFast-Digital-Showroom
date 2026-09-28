import asyncio
import json
import re
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, Response, status
from fastapi.responses import StreamingResponse

from src.agents.graph import agent
from src.api.auth import router as auth_router
from src.api.bookings import router as bookings_router
from src.api.cars import router as cars_router
from src.api.customer_profiles import router as customer_profiles_router
from src.api.locations import router as locations_router
from src.api.motorbikes import router as motorbikes_router
from src.api.quotes import router as quotes_router
from src.api.tco import router as tco_router
from src.models.schemas import ChatRequest, ChatResponse, EndSessionRequest, EndSessionResponse
from src.services.chat_history_service import (
    bind_session_user,
    delete_guest_summary,
    end_session_and_summarize,
    get_guest_summary_record,
    get_latest_user_summary_record,
    get_session_messages,
    get_summary_checkpoint,
    merge_guest_summary_with_messages,
    merge_summary_with_messages,
    save_chat_message,
    should_rollup_messages,
)

router = APIRouter()

# Include Feature Routers
router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(cars_router, prefix="/cars", tags=["cars"])
router.include_router(motorbikes_router, prefix="/motorbikes", tags=["motorbikes"])
router.include_router(motorbikes_router, prefix="/escooters", tags=["escooters"])
router.include_router(locations_router, prefix="/locations", tags=["locations"])
router.include_router(quotes_router, prefix="/quotes", tags=["quotes"])
router.include_router(bookings_router, prefix="/bookings", tags=["bookings"])
router.include_router(customer_profiles_router, prefix="/customer-profiles", tags=["customer-profiles"])
router.include_router(customer_profiles_router, prefix="/crm/profiles", tags=["crm-profiles"])
router.include_router(tco_router, prefix="/tco", tags=["tco"])

import logging
import uuid as _uuid

from src.services.customer_profile_service import extract_vietnamese_phone, sync_from_chat_insights
from src.services.database import SessionLocal

logger = logging.getLogger("uvicorn")


async def _sync_customer_profile_bg(
    user_id_str: str | None,
    session_id: str | None,
    user_profile_data: dict | None,
    response_text: str,
    action_data: dict | None,
    user_message: str | None = None,
):
    if not user_id_str or not str(user_id_str).strip():
        return
    try:
        uid = _uuid.UUID(str(user_id_str).strip())
        # Calculate real customer demand summary (NEVER chatbot reply text)
        demand_summary = None
        if user_profile_data:
            demand_summary = user_profile_data.get("demand_summary")

        if not demand_summary and user_profile_data:
            b_min = user_profile_data.get("budget_min")
            b_max = user_profile_data.get("budget_max")
            target = user_profile_data.get("target_model")
            purpose = user_profile_data.get("usage_purpose")
            v_type = "xe máy điện" if user_profile_data.get("vehicle_type_preference") == "MOTORBIKE" else "ô tô điện"
            parts = []
            if target:
                parts.append(f"quan tâm {target}")
            if b_min and b_max:
                parts.append(f"ngân sách {b_min//1_000_000}-{b_max//1_000_000} triệu")
            elif b_max:
                parts.append(f"ngân sách < {b_max//1_000_000} triệu")
            elif b_min:
                parts.append(f"ngân sách > {b_min//1_000_000} triệu")
            if purpose:
                parts.append(f"mục đích {purpose}")
            if parts:
                demand_summary = f"Khách hàng tìm {v_type}: " + ", ".join(parts)

        extracted_phone = extract_vietnamese_phone(user_message) if user_message else None

        async with SessionLocal() as db:
            await sync_from_chat_insights(
                db=db,
                user_id=uid,
                session_id=session_id,
                needs_data=user_profile_data,
                ai_portrait=demand_summary,
                action_data=action_data,
                phone_number=extracted_phone,
            )
    except Exception as e:
        logger.warning(f"[CUSTOMER PROFILE] Sync background failed: {e}")


# Session State Store for active multi-turn HTTP requests
SESSION_STORE: dict[str, dict[str, Any]] = {}


def prepare_session_state(session_id: str, user_id: str | None, user_email: str | None, message: str) -> dict[str, Any]:
    """Helper to initialize or retrieve session state and handle rolling summary rollup."""
    session_state = SESSION_STORE.get(session_id)
    if not session_state:
        summary_record = (
            get_latest_user_summary_record(user_id)
            if user_id
            else get_guest_summary_record(session_id)
        )
        user_summary = str(summary_record.get("summary_text") or "") if summary_record else None
        checkpoint = get_summary_checkpoint(summary_record)
        db_messages = get_session_messages(session_id, after=checkpoint)

        session_state = {
            "messages": [{"role": m.get("role"), "content": m.get("content")} for m in db_messages] if db_messages else [],
            "user_profile": {},
            "current_stage": "GUARDRAIL",
            "provided_views": [],
        }
        if user_summary:
            session_state["existing_summary"] = user_summary

    prospective_messages = session_state["messages"] + [
        {"role": "user", "content": message}
    ]
    if session_state["messages"] and should_rollup_messages(prospective_messages):
        if user_id:
            new_summary = merge_summary_with_messages(
                user_id=user_id,
                messages=session_state["messages"],
                old_summary=session_state.get("existing_summary"),
            )
        else:
            new_summary = merge_guest_summary_with_messages(
                session_id=session_id,
                messages=session_state["messages"],
                old_summary=session_state.get("existing_summary"),
            )
        if new_summary:
            session_state["existing_summary"] = new_summary
            session_state["messages"] = []

    session_state["messages"].append({"role": "user", "content": message})
    session_state["query"] = message
    session_state["session_id"] = session_id
    session_state["user_id"] = user_id
    if user_email:
        session_state["user_email"] = user_email

    # Provide rich multi-pass & memory state context
    from src.services.catalog_service import get_dynamic_catalog_summary
    session_state["catalog_summary"] = get_dynamic_catalog_summary()
    session_state["chat_history"] = [{"role": m.get("role"), "content": m.get("content")} for m in session_state["messages"]]
    session_state["chat_summaries"] = session_state.get("existing_summary")
    session_state["long_term_memory"] = session_state.get("user_profile") or {}

    return session_state



@router.post("/chat")
async def chat(request: ChatRequest, background_tasks: BackgroundTasks) -> Any:
    """Chat với AI agent với hỗ trợ phản hồi token thời gian thực (Real-time SSE Streaming)."""
    try:
        session_id = request.session_id or "default_session"
        user_id = request.user_id

        if request.stream:
            async def event_generator():
                try:
                    # 1. Non-blocking Async Background Task for User Message Persistence
                    save_chat_message(
                        session_id=session_id,
                        role="user",
                        content=request.message,
                        user_id=user_id,
                    )

                    # 2. Prepare session state with rollup & history checkpointing
                    session_state = prepare_session_state(
                        session_id=session_id,
                        user_id=user_id,
                        user_email=request.user_email,
                        message=request.message,
                    )

                    # 3. Check API-level Factual Cache for Instant (< 5ms) Spec / Pricing Answers
                    from src.services.factual_cache import get_factual_cache, set_factual_cache
                    cached_result = None
                    is_single_turn = len(session_state.get("messages", [])) <= 1
                    if is_single_turn:
                        cached_result = await get_factual_cache(request.message)

                    if cached_result:
                        response_text = cached_result.get("response", "")
                        current_stage = cached_result.get("current_stage", "DIRECT_ANSWER")
                        result = cached_result
                    else:
                        # Yield initial active status event
                        q_lower = request.message.lower()
                        if any(k in q_lower for k in ["báo giá", "lăn bánh", "tính", "tco", "giá"]):
                            init_status = "Đang tra cứu bảng giá & thông số chính hãng..."
                        elif any(k in q_lower for k in ["so sánh", "khác", "hơn", "xe nào"]):
                            init_status = "Đang so sánh thông tin các dòng xe..."
                        elif any(k in q_lower for k in ["xe máy", "ô tô", "tìm xe", "ngân sách", "chỗ"]):
                            init_status = "Đang tìm kiếm trong kho dữ liệu VinFast..."
                        else:
                            init_status = "Đang xử lý..."

                        yield f"data: {json.dumps({'status': init_status}, ensure_ascii=False)}\n\n"
                        await asyncio.sleep(0.01)

                        # 4. Invoke LangGraph Agent with accumulated history & profile
                        try:
                            from src.agents.graph import agent as default_agent, get_checkpointed_agent
                            if agent is default_agent:
                                exec_agent = get_checkpointed_agent()
                                result = await exec_agent.ainvoke(session_state, config={"configurable": {"thread_id": session_id}})
                            else:
                                result = await agent.ainvoke(session_state)
                        except Exception:
                            result = await agent.ainvoke(session_state)

                        response_text = result.get("response", "")
                        current_stage = result.get("current_stage", "CHAT")

                        # Cache factual responses for fast repeat retrieval
                        if is_single_turn and (result.get("intent") == "spec_query" or current_stage == "DIRECT_ANSWER"):
                            asyncio.create_task(set_factual_cache(request.message, result))

                    # 5. Persist updated session state in-memory
                    SESSION_STORE[session_id] = {
                        "messages": session_state["messages"] + [{"role": "assistant", "content": response_text}],
                        "user_profile": result.get("user_profile") or session_state.get("user_profile", {}),
                        "current_stage": current_stage,
                        "provided_views": result.get("provided_views", []),
                        "existing_summary": result.get("existing_summary") or session_state.get("existing_summary", ""),
                        "metadata": result.get("metadata") or session_state.get("metadata", {}),
                        "session_id": session_id,
                        "user_id": user_id,
                    }

                    # 6. Assistant Message Persistence
                    save_chat_message(
                        session_id=session_id,
                        role="assistant",
                        content=response_text,
                        user_id=user_id,
                        metadata={"current_stage": current_stage},
                    )

                    # 7. Real-time SSE token streaming
                    tokens = re.findall(r'\S+\s*|\s+', response_text)
                    for token in tokens:
                        payload = json.dumps({"token": token, "stage": current_stage}, ensure_ascii=False)
                        yield f"data: {payload}\n\n"
                        await asyncio.sleep(0.001)

                    action_data = result.get("action")

                    # Đồng bộ hồ sơ khách hàng CRM 360° & Đợt nhu cầu theo thời gian thực
                    extracted_phone = extract_vietnamese_phone(request.message)
                    if user_id:
                        asyncio.create_task(
                            _sync_customer_profile_bg(
                                user_id_str=user_id,
                                session_id=session_id,
                                user_profile_data=result.get("user_profile"),
                                response_text=response_text,
                                action_data=action_data,
                                user_message=request.message,
                            )
                        )

                    done_payload = json.dumps({
                        "done": True,
                        "session_id": session_id,
                        "stage": current_stage,
                        "action": action_data,
                        "updated_user": {"phone": extracted_phone} if (extracted_phone and user_id) else None,
                    }, ensure_ascii=False)
                    yield f"data: {done_payload}\n\n"
                except Exception as ex:
                    err_payload = json.dumps({"error": str(ex)}, ensure_ascii=False)
                    yield f"data: {err_payload}\n\n"

            return StreamingResponse(event_generator(), media_type="text/event-stream")

        # Non-streaming standard response fallback (for tests / legacy callers)
        background_tasks.add_task(
            save_chat_message,
            session_id=session_id,
            role="user",
            content=request.message,
            user_id=user_id,
        )

        session_state = prepare_session_state(
            session_id=session_id,
            user_id=user_id,
            user_email=request.user_email,
            message=request.message,
        )

        from src.services.factual_cache import get_factual_cache, set_factual_cache
        cached_result = None
        is_single_turn = len(session_state.get("messages", [])) <= 1
        if is_single_turn:
            cached_result = await get_factual_cache(request.message)

        if cached_result:
            result = cached_result
            response_text = result.get("response", "")
            current_stage = result.get("current_stage", "DIRECT_ANSWER")
        else:
            try:
                from src.agents.graph import agent as default_agent, get_checkpointed_agent
                if agent is default_agent:
                    exec_agent = get_checkpointed_agent()
                    result = await exec_agent.ainvoke(session_state, config={"configurable": {"thread_id": session_id}})
                else:
                    result = await agent.ainvoke(session_state)
            except Exception:
                result = await agent.ainvoke(session_state)

            response_text = result.get("response", "")
            current_stage = result.get("current_stage", "CHAT")

            if is_single_turn and (result.get("intent") == "spec_query" or current_stage == "DIRECT_ANSWER"):
                background_tasks.add_task(set_factual_cache, request.message, result)

        SESSION_STORE[session_id] = {
            "messages": session_state["messages"] + [{"role": "assistant", "content": response_text}],
            "user_profile": result.get("user_profile") or session_state.get("user_profile", {}),
            "current_stage": current_stage,
            "provided_views": result.get("provided_views", []),
            "existing_summary": result.get("existing_summary") or session_state.get("existing_summary", ""),
            "metadata": result.get("metadata") or session_state.get("metadata", {}),
            "session_id": session_id,
            "user_id": user_id,
        }

        background_tasks.add_task(
            save_chat_message,
            session_id=session_id,
            role="assistant",
            content=response_text,
            user_id=user_id,
            metadata={"current_stage": current_stage},
        )

        extracted_phone = extract_vietnamese_phone(request.message)
        if user_id:
            background_tasks.add_task(
                _sync_customer_profile_bg,
                user_id_str=user_id,
                session_id=session_id,
                user_profile_data=result.get("user_profile"),
                response_text=response_text,
                action_data=result.get("action"),
                user_message=request.message,
            )

        return ChatResponse(
            response=response_text,
            analysis=result.get("analysis", ""),
            session_id=session_id,
            stage=current_stage,
            action=result.get("action"),
            updated_user={"phone": extracted_phone} if (extracted_phone and user_id) else None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/session/end", response_model=EndSessionResponse)
async def end_chat_session(request: EndSessionRequest) -> EndSessionResponse:
    """End a chat session.

    - Guest user (user_id IS NULL): Clears chat_history for session.
    - Logged-in user: Keeps chat_history, generates merged demand summary with LLM, and updates chat_summaries.
    """
    try:
        session_state = SESSION_STORE.get(request.session_id) or {}
        summary = end_session_and_summarize(
            session_id=request.session_id,
            user_id=request.user_id,
            messages=session_state.get("messages") if request.user_id else None,
        )
        SESSION_STORE.pop(request.session_id, None)
        msg = "Session ended and guest history cleared." if not request.user_id else "Session ended and user demand summary updated."
        return EndSessionResponse(
            status="success",
            message=msg,
            summary_text=summary,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/session/page-close", status_code=status.HTTP_204_NO_CONTENT)
async def close_chat_session_on_page_hide(request: Request) -> Response:
    """Finish a session from sendBeacon while the browser is unloading."""
    try:
        raw_body = (await request.body()).decode("utf-8")
        payload = EndSessionRequest.model_validate(json.loads(raw_body))
        session_state = SESSION_STORE.get(payload.session_id) or {}
        end_session_and_summarize(
            session_id=payload.session_id,
            user_id=payload.user_id,
            messages=session_state.get("messages") if payload.user_id else None,
        )
        SESSION_STORE.pop(payload.session_id, None)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError) as error:
        raise HTTPException(status_code=422, detail="Invalid page-close payload") from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@router.post("/chat/session/bind-user")
async def bind_user_to_session(request: EndSessionRequest):
    """Merge guest context into the user's summary, then start a fresh turn."""
    if not request.user_id:
        return {"status": "error", "message": "user_id is required"}

    session_state = SESSION_STORE.get(request.session_id)
    summary_record = get_latest_user_summary_record(request.user_id)
    account_summary = str(summary_record.get("summary_text") or "") if summary_record else ""
    guest_summary_record = get_guest_summary_record(request.session_id)
    persisted_guest_summary = (
        str(guest_summary_record.get("summary_text") or "").strip()
        if guest_summary_record
        else ""
    )
    guest_checkpoint = get_summary_checkpoint(guest_summary_record)

    if session_state is not None:
        guest_summary = (
            str(session_state.get("existing_summary") or "").strip()
            or persisted_guest_summary
        )
        guest_messages = list(session_state.get("messages") or [])
    else:
        guest_summary = persisted_guest_summary
        guest_messages = get_session_messages(
            request.session_id,
            after=guest_checkpoint,
        )

    transfer_messages: list[dict[str, Any]] = []
    if guest_summary:
        transfer_messages.append(
            {
                "role": "user",
                "content": f"Tóm tắt nhu cầu đã ghi nhận trong phiên khách: {guest_summary}",
            }
        )
    transfer_messages.extend(guest_messages)

    merged_summary = account_summary
    if transfer_messages:
        merged_summary = merge_summary_with_messages(
            user_id=request.user_id,
            messages=transfer_messages,
            old_summary=account_summary or None,
        ) or ""
        if not merged_summary:
            raise HTTPException(status_code=503, detail="Không thể hợp nhất lịch sử khách vào summary tài khoản")

    history_bound = bind_session_user(request.session_id, request.user_id)
    if not history_bound:
        raise HTTPException(status_code=503, detail="Không thể liên kết lịch sử phiên với tài khoản")

    if not delete_guest_summary(request.session_id):
        raise HTTPException(status_code=503, detail="Không thể xóa summary tạm sau khi đăng nhập")

    # The next question is intentionally the first unsummarized turn.
    SESSION_STORE[request.session_id] = {
        "messages": [],
        "user_profile": {},
        "current_stage": "GUARDRAIL",
        "provided_views": [],
        "existing_summary": merged_summary,
        "metadata": {},
        "session_id": request.session_id,
        "user_id": request.user_id,
    }
    return {
        "status": "success",
        "session_id": request.session_id,
        "user_id": request.user_id,
        "summary_text": merged_summary or None,
    }


@router.get("/status")
async def agent_status():
    """Kiểm tra trạng thái agent."""
    return {"status": "ready", "agent": "LangGraph Agent v1.0"}


@router.post("/warmup")
async def trigger_warmup(background_tasks: BackgroundTasks):
    """Endpoint để Frontend gọi ngầm ngay khi user mở widget để warm up pipeline."""
    from src.main import _background_warmup
    background_tasks.add_task(_background_warmup)
    return {"status": "warming_up", "message": "Pipeline warmup initiated"}


