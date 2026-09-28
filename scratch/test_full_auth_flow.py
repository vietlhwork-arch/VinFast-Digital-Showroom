import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        for email in ["admin@vinfast.vn", "staff@vinfast.vn", "customer@gmail.com"]:
            r = await client.post("http://localhost:8000/api/auth/login", json={"email": email, "password": "admin123"})
            print(f"Login {email}: Status {r.status_code}")
            assert r.status_code == 200
            token = r.json()["access_token"]
            me_res = await client.get("http://localhost:8000/api/auth/me", headers={"Authorization": f"Bearer {token}"})
            assert me_res.status_code == 200
            print(f"  -> Auth me OK for {email} ({me_res.json()['role']})")

if __name__ == "__main__":
    asyncio.run(main())
