from fastapi import BackgroundTasks

import src.api.routes as routes
from src.models.schemas import ChatRequest, EndSessionRequest
from src.services.chat_history_service import (
    ROLLING_SUMMARY_TRIGGER_TOKENS,
    estimate_messages_tokens,
    should_rollup_messages,
)


def test_rolling_summary_uses_token_ceiling():
    below = [{"role": "user", "content": "a" * 1_000}]
    near_ceiling = [{"role": "user", "content": "a" * 20_000}]

    assert estimate_messages_tokens(below) < ROLLING_SUMMARY_TRIGGER_TOKENS
    assert should_rollup_messages(below) is False
    assert should_rollup_messages(near_ceiling) is True


async def test_chat_rolls_previous_messages_but_keeps_current_question(monkeypatch):
    session_id = "rolling-summary-test"
    routes.SESSION_STORE[session_id] = {
        "messages": [
            {"role": "user", "content": "Tôi cần xe 5 chỗ"},
            {"role": "assistant", "content": "Ngân sách của anh chị là bao nhiêu?"},
        ],
        "existing_summary": "Khách cần xe gia đình.",
        "user_profile": {},
        "provided_views": [],
    }

    monkeypatch.setattr(routes, "should_rollup_messages", lambda messages: True)
    monkeypatch.setattr(
        routes,
        "merge_summary_with_messages",
        lambda **kwargs: "Khách cần xe gia đình 5 chỗ.",
    )

    class FakeAgent:
        async def ainvoke(self, state):
            assert state["existing_summary"] == "Khách cần xe gia đình 5 chỗ."
            assert state["messages"] == [
                {"role": "user", "content": "Ngân sách 700 triệu"}
            ]
            return {"response": "Đã ghi nhận.", "current_stage": "NEEDS_DISCOVERY"}

    monkeypatch.setattr(routes, "agent", FakeAgent())
    result = await routes.chat(
        ChatRequest(
            message="Ngân sách 700 triệu",
            session_id=session_id,
            user_id="00000000-0000-0000-0000-000000000001",
        ),
        BackgroundTasks(),
    )

    assert result.response == "Đã ghi nhận."
    assert routes.SESSION_STORE[session_id]["existing_summary"] == "Khách cần xe gia đình 5 chỗ."
    assert routes.SESSION_STORE[session_id]["messages"] == [
        {"role": "user", "content": "Ngân sách 700 triệu"},
        {"role": "assistant", "content": "Đã ghi nhận."},
    ]
    routes.SESSION_STORE.pop(session_id, None)


async def test_guest_rollup_is_persisted_by_session(monkeypatch):
    session_id = "guest-rolling-summary-test"
    routes.SESSION_STORE[session_id] = {
        "messages": [{"role": "user", "content": "Tôi cần xe gia đình"}],
        "user_profile": {},
        "provided_views": [],
    }
    monkeypatch.setattr(routes, "should_rollup_messages", lambda messages: True)
    monkeypatch.setattr(
        routes,
        "merge_guest_summary_with_messages",
        lambda **kwargs: "Khách vãng lai cần xe gia đình.",
    )

    class FakeAgent:
        async def ainvoke(self, state):
            assert state["existing_summary"] == "Khách vãng lai cần xe gia đình."
            assert state["messages"] == [{"role": "user", "content": "Ngân sách 500 triệu"}]
            return {"response": "Đã ghi nhận.", "current_stage": "NEEDS_DISCOVERY"}

    monkeypatch.setattr(routes, "agent", FakeAgent())
    result = await routes.chat(
        ChatRequest(message="Ngân sách 500 triệu", session_id=session_id),
        BackgroundTasks(),
    )

    assert result.response == "Đã ghi nhận."
    assert routes.SESSION_STORE[session_id]["existing_summary"] == "Khách vãng lai cần xe gia đình."
    assert routes.SESSION_STORE[session_id]["user_id"] is None
    routes.SESSION_STORE.pop(session_id, None)


async def test_login_merges_guest_context_then_next_query_is_first_turn(monkeypatch):
    session_id = "guest-login-transfer-test"
    user_id = "00000000-0000-0000-0000-000000000001"
    routes.SESSION_STORE[session_id] = {
        "messages": [
            {"role": "user", "content": "Tôi có gia đình 5 người"},
            {"role": "assistant", "content": "Anh chị có ngân sách bao nhiêu?"},
        ],
        "existing_summary": "Khách đang tìm ô tô.",
        "user_profile": {},
        "provided_views": [],
    }
    monkeypatch.setattr(
        routes,
        "get_latest_user_summary_record",
        lambda uid: {"summary_text": "Tài khoản từng quan tâm VF 8.", "updated_at": "2026-01-01T00:00:00Z"},
    )
    monkeypatch.setattr(routes, "get_guest_summary_record", lambda session: None)

    def merge(**kwargs):
        assert kwargs["user_id"] == user_id
        assert kwargs["old_summary"] == "Tài khoản từng quan tâm VF 8."
        assert "Khách đang tìm ô tô." in kwargs["messages"][0]["content"]
        assert kwargs["messages"][1]["content"] == "Tôi có gia đình 5 người"
        return "Cần xe cho 5 người, từng quan tâm VF 8."

    monkeypatch.setattr(routes, "merge_summary_with_messages", merge)
    monkeypatch.setattr(routes, "bind_session_user", lambda session, user: True)
    monkeypatch.setattr(routes, "delete_guest_summary", lambda session: True)

    bound = await routes.bind_user_to_session(
        EndSessionRequest(session_id=session_id, user_id=user_id)
    )
    assert bound["summary_text"] == "Cần xe cho 5 người, từng quan tâm VF 8."
    assert routes.SESSION_STORE[session_id]["messages"] == []

    monkeypatch.setattr(routes, "should_rollup_messages", lambda messages: False)

    class FakeAgent:
        async def ainvoke(self, state):
            assert state["existing_summary"] == "Cần xe cho 5 người, từng quan tâm VF 8."
            assert state["messages"] == [{"role": "user", "content": "Tôi có 500 triệu"}]
            return {"response": "Tôi sẽ tìm xe phù hợp.", "current_stage": "NEEDS_DISCOVERY"}

    monkeypatch.setattr(routes, "agent", FakeAgent())
    response = await routes.chat(
        ChatRequest(
            message="Tôi có 500 triệu",
            session_id=session_id,
            user_id=user_id,
        ),
        BackgroundTasks(),
    )
    assert response.response == "Tôi sẽ tìm xe phù hợp."
    routes.SESSION_STORE.pop(session_id, None)
