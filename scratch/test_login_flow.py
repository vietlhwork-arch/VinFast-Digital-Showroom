import asyncio
import os
import sys
import httpx

async def test_auth():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        print("Testing POST /api/auth/token...")
        try:
            res = await client.post("/api/auth/token", json={"email": "admin@vinfast.vn", "password": "admin123"})
            print(f"Status: {res.status_code}")
            print(f"Response: {res.text}")
            if res.status_code == 200:
                data = res.json()
                token = data.get("access_token")
                print("\nTesting GET /api/auth/me...")
                me_res = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
                print(f"Me Status: {me_res.status_code}")
                print(f"Me Response: {me_res.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_auth())
