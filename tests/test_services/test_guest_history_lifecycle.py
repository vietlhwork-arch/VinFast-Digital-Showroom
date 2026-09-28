from src.services import chat_history_service


class _Response:
    status_code = 204

    def json(self):
        return []


def test_guest_session_delete_only_targets_unowned_rows(monkeypatch):
    called = []

    def delete(url, **kwargs):
        called.append(url)
        return _Response()

    monkeypatch.setattr(chat_history_service.requests, "delete", delete)
    result = chat_history_service.end_session_and_summarize("guest-session")

    assert result is None
    assert any("chat_history" in url and "metadata->>session_id=eq.guest-session" in url for url in called)
    assert any("chat_summaries" in url and "session_id=eq.guest-session" in url for url in called)
    assert all("user_id=is.null" in url for url in called)


def test_bind_only_claims_unowned_rows(monkeypatch):
    called = {}

    def patch(url, **kwargs):
        called["url"] = url
        called["json"] = kwargs["json"]
        return _Response()

    monkeypatch.setattr(chat_history_service.requests, "patch", patch)
    assert chat_history_service.bind_session_user("guest-session", "user-1") is True
    assert "user_id=is.null" in called["url"]
    assert called["json"] == {"user_id": "user-1"}


def test_save_user_summary_persists_supplied_text(monkeypatch):
    called = {}

    def get(url, **kwargs):
        return _Response()

    def post(url, **kwargs):
        called["json"] = kwargs["json"]
        return _Response()

    monkeypatch.setattr(chat_history_service.requests, "get", get)
    monkeypatch.setattr(chat_history_service.requests, "post", post)

    assert chat_history_service.save_user_summary("user-1", "Summary mới") is True
    assert called["json"]["user_id"] == "user-1"
    assert called["json"]["summary_text"] == "Summary mới"


def test_save_guest_summary_persists_session_owner(monkeypatch):
    called = {}

    def get(url, **kwargs):
        return _Response()

    def post(url, **kwargs):
        called["json"] = kwargs["json"]
        return _Response()

    monkeypatch.setattr(chat_history_service.requests, "get", get)
    monkeypatch.setattr(chat_history_service.requests, "post", post)

    assert chat_history_service.save_guest_summary("guest-session", "Guest summary") is True
    assert called["json"]["user_id"] is None
    assert called["json"]["session_id"] == "guest-session"
    assert called["json"]["summary_text"] == "Guest summary"
