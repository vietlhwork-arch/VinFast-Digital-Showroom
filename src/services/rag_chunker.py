"""Backward-compatible imports for the RAG chunker."""

from src.services.rag.common.chunking import (
    ChunkingConfig,
    SemanticChunk,
    build_semantic_chunks,
    build_semantic_chunks_with_embeddings,
)

__all__ = [
    "ChunkingConfig",
    "SemanticChunk",
    "build_semantic_chunks",
    "build_semantic_chunks_with_embeddings",
]
