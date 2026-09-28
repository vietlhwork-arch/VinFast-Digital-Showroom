import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import asyncio
from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog

async def check():
    async with SessionLocal() as db:
        res = await db.execute(select(CarCatalog).where(CarCatalog.model_name.ilike('%EBus%')))
        ebus = res.scalar_one_or_none()
        if ebus:
            print("Model Name:", ebus.model_name)
            print("Seat Count column:", ebus.seat_count)
            print("Range KM column:", ebus.range_km)
            print("Additional Specs:", ebus.additional_specs)
        else:
            print("EBus not found!")

if __name__ == "__main__":
    asyncio.run(check())
