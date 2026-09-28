import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import asyncio
from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import MotorbikeCatalog

async def check():
    async with SessionLocal() as db:
        res = await db.execute(select(MotorbikeCatalog).order_by(MotorbikeCatalog.model_name.asc()))
        mikes = res.scalars().all()
        for m in mikes:
            print(f"ID: {m.id} | Name: {m.model_name:<30} | Image: {m.image_url}")

if __name__ == "__main__":
    asyncio.run(check())
