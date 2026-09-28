import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import asyncio
from sqlalchemy import delete
from src.services.database import SessionLocal
from src.models.domain import CarCatalog

async def delete_junk():
    async with SessionLocal() as db:
        await db.execute(delete(CarCatalog).where(CarCatalog.model_name == 'sfsafsf'))
        await db.commit()
        print("Deleted junk car sfsafsf!")

if __name__ == "__main__":
    asyncio.run(delete_junk())
