import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import Account
from src.services.security import hash_password

async def set_passwords():
    async with SessionLocal() as db:
        res = await db.execute(select(Account))
        accounts = res.scalars().all()
        h = hash_password("admin123")
        for acc in accounts:
            acc.hashed_password = h
            print(f"Set password 'admin123' for {acc.email} ({acc.role})")
        await db.commit()
        print("All account passwords set to 'admin123' successfully!")

if __name__ == "__main__":
    asyncio.run(set_passwords())
