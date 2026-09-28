import sys
import requests

sys.stdout.reconfigure(encoding="utf-8")
url = "http://127.0.0.1:8000/api/chat"

test_cases = [
    "có xe vf9 lai xe vf4 không vậy bạn",
    "có xe Klara lai Feliz không",
    "có xe VF8 lai VF6 không em",
]

for q in test_cases:
    res = requests.post(url, json={"message": q, "session_id": "test_dynamic_hybrid_888"})
    data = res.json()
    print(f"Q: '{q}'")
    print(f"A: {data.get('response')}\n")
