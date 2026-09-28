import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        r = await client.post("http://localhost:8000/api/auth/login", json={"email": "admin@vinfast.vn", "password": "admin123"})
        print("Login Status Code:", r.status_code)
        if r.status_code == 200:
            data = r.json()
            print("Login SUCCESS!")
            print("Access Token:", data["access_token"][:30] + "...")
            print("User Name:", data["user"]["full_name"])
            print("User Role:", data["user"]["role"])
        else:
            print("Error Response:", r.text)

if __name__ == "__main__":
    asyncio.run(main())
