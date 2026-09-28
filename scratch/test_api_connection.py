import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from src.services.database import engine

async def test_db():
    async with engine.connect() as conn:
        res_cars = await conn.execute(text("SELECT COUNT(*) FROM car_catalog"))
        res_mbs = await conn.execute(text("SELECT COUNT(*) FROM motorbike_catalog"))
        res_accs = await conn.execute(text("SELECT COUNT(*) FROM accounts"))
        print(f"Cars count in DB: {res_cars.scalar()}")
        print(f"Motorbikes count in DB: {res_mbs.scalar()}")
        print(f"Accounts count in DB: {res_accs.scalar()}")

if __name__ == "__main__":
    asyncio.run(test_db())
