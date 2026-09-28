import json
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import pytest

import src.api.routes as routes


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_chat_empty_message(client):
    response = await client.post("/api/v1/chat", json={"message": ""})
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_agent_status(client):
    response = await client.get("/api/v1/status")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_page_close_ends_exact_session_from_text_beacon(client, monkeypatch):
    captured = {}
    session_id = "page-close-test-session"
    routes.SESSION_STORE[session_id] = {"messages": [{"role": "user", "content": "Xin chào"}]}

    def finish_session(**kwargs):
        captured.update(kwargs)
        return None

    monkeypatch.setattr(routes, "end_session_and_summarize", finish_session)
    response = await client.post(
        "/api/v1/chat/session/page-close",
        content=json.dumps({"session_id": session_id}),
        headers={"Content-Type": "text/plain;charset=UTF-8"},
    )

    assert response.status_code == 204
    assert captured["session_id"] == session_id
    assert captured["user_id"] is None
    assert session_id not in routes.SESSION_STORE


@pytest.mark.asyncio
async def test_chat_streaming_endpoint(client):
    response = await client.post(
        "/api/v1/chat",
        json={"message": "Xin chào tư vấn viên", "stream": True, "session_id": "test-stream-session"}
    )
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")
    content = response.text
    assert "data:" in content


@pytest.mark.asyncio
async def test_chat_non_streaming_endpoint(client):
    response = await client.post(
        "/api/v1/chat",
        json={"message": "So sánh thông số xe VF 6 Eco với Plus", "stream": False, "session_id": "test-direct-session"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert len(data["response"]) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
