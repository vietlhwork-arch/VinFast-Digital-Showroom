from types import SimpleNamespace

import pytest

from src.services import rag_service


@pytest.fixture(autouse=True)
def clear_catalog_retrieval_pipeline_cache():
    rag_service.get_catalog_retrieval_pipeline.cache_clear()
    yield
    rag_service.get_catalog_retrieval_pipeline.cache_clear()


def test_get_embedding_model_uses_configured_openai_model(monkeypatch):
    settings = SimpleNamespace(
        openai_api_key="sk-test-key",
        embedding_model="text-embedding-3-large",
        embedding_dimensions=1536,
    )
    monkeypatch.setattr(rag_service, "get_settings", lambda: settings)

    embeddings = rag_service.get_embedding_model()

    assert embeddings.model == "text-embedding-3-large"
    assert embeddings.dimensions == 1536


def test_get_embedding_model_requires_api_key(monkeypatch):
    settings = SimpleNamespace(
        openai_api_key="",
        embedding_model="text-embedding-3-large",
        embedding_dimensions=1536,
    )
    monkeypatch.setattr(rag_service, "get_settings", lambda: settings)

    with pytest.raises(RuntimeError, match="OPENAI_API_KEY"):
        rag_service.get_embedding_model()


def test_get_catalog_retrieval_pipeline_reuses_one_instance(monkeypatch):
    settings = SimpleNamespace(openai_api_key="sk-test-key")
    created_repositories = []

    monkeypatch.setattr(rag_service, "get_settings", lambda: settings)
    monkeypatch.setattr(rag_service, "build_query_planner", lambda *_: object())
    monkeypatch.setattr(rag_service, "_build_embedding_model", lambda *_: object())
    monkeypatch.setattr(rag_service, "build_reranker", lambda *_: object())
    monkeypatch.setattr(rag_service, "PostgresVehicleResolver", lambda: object())

    def build_repository():
        repository = object()
        created_repositories.append(repository)
        return repository

    monkeypatch.setattr(rag_service, "PostgresHybridSearchRepository", build_repository)

    first = rag_service.get_catalog_retrieval_pipeline()
    second = rag_service.get_catalog_retrieval_pipeline()

    assert first is second
    assert len(created_repositories) == 1
