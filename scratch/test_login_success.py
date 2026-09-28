import asyncio
import httpx

async def test_login():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        res = await client.post("/api/auth/login", json={"email": "admin@vinfast.vn", "password": "admin123"})
        print("Status code:", res.status_code)
        data = res.json()
        print("Access Token received:", "access_token" in data)
        print("User full_name:", data.get("user", {}).get("full_name"))
        print("User role:", data.get("user", {}).get("role"))

if __name__ == "__main__":
    asyncio.run(test_login())
