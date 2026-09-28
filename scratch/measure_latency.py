"""Latency Measurement & Performance Profiling Benchmark.

Measures precise millisecond latency for each pipeline stage:
1. Supabase Cloud History Fetch
2. Guardrails Node Execution
3. Catalog DB Query
4. LLM Generation
5. Supabase Async Persistence
"""

import sys
import os
import time
import asyncio
from typing import Any

sys.path.insert(0, os.path.abspath("."))

from src.agents.graph import agent
from src.services.catalog_service import fetch_cars_from_supabase
from src.services.chat_history_service import get_session_messages, save_chat_message
from src.services.llm import get_llm


async def measure_pipeline_latency(user_query: str, session_id: str = "latency_test_session"):
    """Profile latency of each step in the pipeline."""
    timings = {}
    total_start = time.perf_counter()

    # Step 1: Fetch Chat History from Supabase Cloud DB
    t0 = time.perf_counter()
    history = get_session_messages(session_id)
    timings["1_fetch_chat_history_ms"] = round((time.perf_counter() - t0) * 1000, 2)

    # Step 2: Query Catalog DB from Supabase Cloud DB
    t0 = time.perf_counter()
    cars = fetch_cars_from_supabase(budget_max=600_000_000, seat_count=5)
    timings["2_query_catalog_db_ms"] = round((time.perf_counter() - t0) * 1000, 2)

    # Step 3: Full AI Agent Graph Execution (Guardrails + Needs Discovery + Rec)
    t0 = time.perf_counter()
    graph_res = await agent.ainvoke({"query": user_query})
    timings["3_agent_graph_execution_ms"] = round((time.perf_counter() - t0) * 1000, 2)

    # Step 4: Persistence to Supabase Cloud DB
    t0 = time.perf_counter()
    save_chat_message(session_id, "user", user_query)
    save_chat_message(session_id, "assistant", graph_res.get("response", ""))
    timings["4_save_history_db_ms"] = round((time.perf_counter() - t0) * 1000, 2)

    total_latency_ms = round((time.perf_counter() - total_start) * 1000, 2)
    timings["total_end_to_end_ms"] = total_latency_ms
    timings["total_end_to_end_s"] = round(total_latency_ms / 1000, 2)
    timings["sla_status"] = "PASSED (< 3s)" if total_latency_ms < 3000 else "EXCEEDED (> 3s)"

    return timings, graph_res


async def main():
    sys.stdout.reconfigure(encoding="utf-8")
    print("⏱️ RUNNING CHATBOT LATENCY & PERFORMANCE PROFILING TEST...")
    print("=" * 70)

    test_queries = [
        "Tôi muốn mua ô tô điện 5 chỗ tầm 600 triệu đi làm hàng ngày",
        "Có xe VF5 lai VF3 không em",
        "Dự báo thời tiết hôm nay thế nào",
    ]

    for idx, q in enumerate(test_queries, 1):
        print(f"\n[Test {idx}] Query: '{q}'")
        timings, res = await measure_pipeline_latency(q, session_id=f"latency_test_{idx}")
        print(f"  • Fetch History Latency : {timings['1_fetch_chat_history_ms']} ms")
        print(f"  • DB Catalog Query      : {timings['2_query_catalog_db_ms']} ms")
        print(f"  • Agent Graph Invocation: {timings['3_agent_graph_execution_ms']} ms")
        print(f"  • DB Save History       : {timings['4_save_history_db_ms']} ms")
        print(f"  -------------------------------------------------------------")
        print(f"  ⚡ TOTAL LATENCY        : {timings['total_end_to_end_ms']} ms ({timings['total_end_to_end_s']}s)")
        print(f"  🎯 SLA TARGET (<3s)     : {timings['sla_status']}")
        print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
