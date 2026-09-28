"""Live HTTP API Latency Benchmark Script.

Measures precise end-to-end HTTP response latency of FastAPI /api/chat endpoint
with Async Background DB Persistence and In-Memory Catalog Caching.
"""

import sys
import time
import requests


def measure_api_endpoint(query: str, session_id: str = "perf_test_session_888"):
    url = "http://127.0.0.1:8000/api/chat"
    payload = {"message": query, "session_id": session_id}

    t0 = time.perf_counter()
    res = requests.post(url, json=payload)
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)
    latency_s = round(latency_ms / 1000, 2)

    status_code = res.status_code
    resp_data = res.json() if status_code == 200 else {}
    resp_text = resp_data.get("response", "")

    return {
        "query": query,
        "status_code": status_code,
        "latency_ms": latency_ms,
        "latency_s": latency_s,
        "sla_passed": latency_ms < 3000,
        "response_preview": resp_text[:100] + "..." if len(resp_text) > 100 else resp_text,
    }


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    print("⚡ LIVE FASTAPI ENDPOINT LATENCY MEASUREMENT (<3s TARGET)")
    print("=" * 70)

    test_queries = [
        "Tôi muốn mua ô tô điện 5 chỗ tầm 600 triệu đi làm hàng ngày",
        "Có xe VF5 lai VF3 không em",
        "Dự báo thời tiết hôm nay thế nào",
        "Nhà tôi có 7 người tôi hợp mệnh thủy có xe nào không",
    ]

    for idx, q in enumerate(test_queries, 1):
        r = measure_api_endpoint(q, session_id=f"perf_live_{idx}")
        sla_icon = "✅ PASSED (<3s)" if r["sla_passed"] else "❌ EXCEEDED (>3s)"
        print(f"[Test {idx}] Q: '{q[:40]}'")
        print(f"  • Status Code : {r['status_code']}")
        print(f"  • Latency     : {r['latency_ms']} ms ({r['latency_s']}s)")
        print(f"  • SLA Status  : {sla_icon}")
        print(f"  • Preview     : {r['response_preview']}")
        print("-" * 70)


if __name__ == "__main__":
    main()
