"""VinFast AI Vehicle Advisor Agent - StateGraph Implementation (v4.0).
Features:
- Single-Pass LLM Path for Route 1 (Greeting) & Route 4 (Refusal)
- Direct Answer Path for Route 2 (Specs / Comparisons / Discontinued queries)
- Full Graph Path for Route 3 (Needs Discovery / Filtering / Recommendation)
- Native Redis Checkpointer (Sub-millisecond RAM State Persistence)
"""

from __future__ import annotations

import logging
from typing import Any

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from src.agents.nodes.direct_answer import direct_answer_node
from src.agents.nodes.greeting import greeting_node
from src.agents.nodes.guardrails import guardrail_node
from src.agents.nodes.needs_discovery import needs_discovery_node
from src.agents.nodes.recommendation import recommendation_node
from src.agents.nodes.refusal import refusal_node
from src.agents.state import AgentState
from src.config import get_settings

logger = logging.getLogger(__name__)


def route_after_guardrails(state: AgentState) -> str:
    """Route based on lightweight intent classification."""
    intent = state.get("intent", "needs_discovery")
    
    if intent == "greeting":
        return "greeting_node"
    elif intent == "refusal" or state.get("is_blocked"):
        return "refusal_node"
    elif intent == "spec_query":
        return "direct_answer"
    else:
        return "needs_discovery"


def route_after_needs_discovery(state: AgentState) -> str:
    """Route after multi-pass needs discovery."""
    action = state.get("action") or {}
    if action.get("type") in ("recommend_vehicle", "request_quote") and state.get("candidate_cars"):
        return "recommendation"
    return END


def get_default_checkpointer():
    """Returns AsyncShallowRedisSaver when Redis is online, otherwise falls back to MemorySaver."""
    settings = get_settings()
    if settings.redis_url:
        try:
            import redis
            # Quick sync ping check to verify connectivity
            r = redis.Redis.from_url(settings.redis_url, socket_timeout=1.0)
            r.ping()

            from langgraph.checkpoint.redis.ashallow import AsyncShallowRedisSaver
            saver = AsyncShallowRedisSaver(redis_url=settings.redis_url)
            # Setup indices in background
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    asyncio.create_task(saver.asetup())
                else:
                    loop.run_until_complete(saver.asetup())
            except Exception:
                pass
            logger.info("⚡ LangGraph using AsyncShallowRedisSaver for sub-millisecond RAM checkpointing.")
            return saver
        except Exception as e:
            logger.warning(f"AsyncShallowRedisSaver unavailable ({e}), using MemorySaver fallback.")
            
    return MemorySaver()


def build_graph(checkpointer: Any = None) -> StateGraph:
    """Builds and compiles the 4-Route LangGraph Agent."""
    builder = StateGraph(AgentState)

    # 1. Add All Active Nodes
    builder.add_node("guardrails", guardrail_node)
    builder.add_node("greeting_node", greeting_node)
    builder.add_node("refusal_node", refusal_node)
    builder.add_node("direct_answer", direct_answer_node)
    builder.add_node("needs_discovery", needs_discovery_node)
    builder.add_node("recommendation", recommendation_node)

    # 2. Add Entry & Conditional Edges
    builder.add_edge(START, "guardrails")
    builder.add_conditional_edges(
        "guardrails",
        route_after_guardrails,
        {
            "greeting_node": "greeting_node",
            "refusal_node": "refusal_node",
            "direct_answer": "direct_answer",
            "needs_discovery": "needs_discovery",
            END: END,
        },
    )

    # 3. Add Exit & Intermediate Edges
    builder.add_edge("greeting_node", END)
    builder.add_edge("refusal_node", END)
    builder.add_edge("direct_answer", END)
    
    builder.add_conditional_edges(
        "needs_discovery",
        route_after_needs_discovery,
        {
            "recommendation": "recommendation",
            END: END,
        },
    )
    builder.add_edge("recommendation", END)

    return builder.compile(checkpointer=checkpointer) if checkpointer is not None else builder.compile()


agent = build_graph(checkpointer=None)
checkpointed_agent = None


def get_checkpointed_agent():
    """Lazy-load agent with Redis checkpointer for production API."""
    global checkpointed_agent
    if checkpointed_agent is None:
        checkpointed_agent = build_graph(checkpointer=get_default_checkpointer())
    return checkpointed_agent


__all__ = [
    "agent",
    "build_graph",
    "get_checkpointed_agent",
    "get_default_checkpointer",
    "route_after_guardrails",
    "route_after_needs_discovery",
]
