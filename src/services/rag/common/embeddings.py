"""OpenAI embedding client shared by catalog pipelines."""

from langchain_openai import OpenAIEmbeddings

from src.config import get_settings
from src.services.rag.config import RAG_CONFIG


def get_embedding_model(settings=None) -> OpenAIEmbeddings:
    settings = settings or get_settings()
    execution = RAG_CONFIG.embedding
    api_key = settings.openai_api_key.strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured. Add it to .env before using embeddings.")
    return OpenAIEmbeddings(
        model=settings.embedding_model,
        dimensions=settings.embedding_dimensions,
        api_key=api_key,
        chunk_size=execution.batch_size,
        max_retries=execution.max_retries,
        retry_min_seconds=execution.retry_min_seconds,
        retry_max_seconds=execution.retry_max_seconds,
    )
