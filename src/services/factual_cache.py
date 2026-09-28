"""Factual and Catalog Query Semantic Cache.
Caches context-independent factual queries (specs, prices, battery info) in Redis with RAM fallback.
Key: hash(normalize(query_text)) -> < 5ms response time for repeat queries.
"""

from __future__ import annotations

import hashlib
import json
import logging
import re
from typing import Any

try:
    from redis.asyncio import Redis
except ImportError:
    Redis = None  # type: ignore

from src.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_redis_client: Any | None = None
_local_lru_cache: dict[str, Any] = {}
_MAX_LOCAL_CACHE = 500


def _get_redis() -> Any | None:
    global _redis_client
    if Redis is None:
        return None
    if _redis_client is None:
        try:
            _redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
        except Exception as e:
            logger.warning(f"Could not connect to Redis for factual cache: {e}")
            _redis_client = None
    return _redis_client


def normalize_query_for_cache(query: str) -> str:
    """Normalize query text: lowercase, trim whitespace, remove extra spaces and basic punctuation."""
    q = query.lower().strip()
    q = re.sub(r"[?!.,:;]+", "", q)
    q = re.sub(r"\s+", " ", q)
    return q


def compute_cache_key(query: str) -> str:
    norm_q = normalize_query_for_cache(query)
    q_hash = hashlib.sha256(norm_q.encode("utf-8")).hexdigest()[:16]
    return f"cache:factual:{q_hash}"


async def get_factual_cache(query: str) -> dict[str, Any] | None:
    """Retrieve cached factual query response if present (< 5ms)."""
    key = compute_cache_key(query)
    try:
        r = _get_redis()
        if r:
            cached = await r.get(key)
            if cached:
                return json.loads(cached)
    except Exception as e:
        logger.debug(f"Redis get cache failed: {e}")

    # Fallback to local RAM
    return _local_lru_cache.get(key)


async def set_factual_cache(query: str, data: dict[str, Any], ttl_seconds: int = 3600) -> None:
    """Persist factual response to Redis and local RAM with TTL."""
    key = compute_cache_key(query)
    try:
        r = _get_redis()
        if r:
            await r.set(key, json.dumps(data, ensure_ascii=False), ex=ttl_seconds)
    except Exception as e:
        logger.debug(f"Redis set cache failed: {e}")

    # Local fallback
    if len(_local_lru_cache) > _MAX_LOCAL_CACHE:
        _local_lru_cache.clear()
    _local_lru_cache[key] = data
