"""Small in-process BM25 ranker for the current catalog-sized corpus."""

from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import replace

from src.services.rag.retrieval.models import SearchHit

_TOKEN = re.compile(r"[^\W_]+", flags=re.UNICODE)


def tokenize(text: str) -> list[str]:
    return [token.casefold() for token in _TOKEN.findall(text)]


def rank_bm25(
    query: str,
    documents: list[SearchHit],
    *,
    top_k: int,
    k1: float = 1.5,
    b: float = 0.75,
) -> list[SearchHit]:
    if top_k < 1 or not documents:
        return []
    query_tokens = tokenize(query)
    if not query_tokens:
        return []

    tokenized = [tokenize(document.chunk_text) for document in documents]
    average_length = sum(map(len, tokenized)) / len(tokenized) or 1.0
    document_frequency = Counter(token for tokens in tokenized for token in set(tokens))
    corpus_size = len(documents)
    scores: list[tuple[float, SearchHit]] = []

    for document, tokens in zip(documents, tokenized, strict=True):
        frequencies = Counter(tokens)
        length_normalizer = k1 * (1 - b + b * len(tokens) / average_length)
        score = 0.0
        for token in query_tokens:
            frequency = frequencies[token]
            if frequency == 0:
                continue
            frequency_in_corpus = document_frequency[token]
            inverse_document_frequency = math.log(
                1 + (corpus_size - frequency_in_corpus + 0.5) / (frequency_in_corpus + 0.5)
            )
            score += inverse_document_frequency * (frequency * (k1 + 1) / (frequency + length_normalizer))
        if score > 0:
            scores.append((score, document))

    scores.sort(key=lambda item: (-item[0], item[1].vector_id))
    return [
        replace(
            document,
            modality="lexical",
            query=query,
            raw_score=score,
            rank=rank,
        )
        for rank, (score, document) in enumerate(scores[:top_k], start=1)
    ]


__all__ = ["rank_bm25", "tokenize"]
