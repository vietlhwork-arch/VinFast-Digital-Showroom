import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog, MotorbikeCatalog

async def check():
    async with SessionLocal() as db:
        res = await db.execute(select(CarCatalog))
        cars = res.scalars().all()

        print("=== CURRENT CAR CATALOG ADAS IN DB ===")
        for c in cars:
            specs = c.additional_specs or {}
            name = c.model_name or "N/A"
            adas = str(specs.get('adas_features', '')).encode('utf-8', errors='ignore').decode('utf-8')
            print(f"ID: {str(c.id)[:8]}... | Name: {name:<25} | ADAS: {adas[:60]}")

        res_b = await db.execute(select(MotorbikeCatalog))
        bikes = res_b.scalars().all()
        print("\n=== CURRENT MOTORBIKE CATALOG ADAS IN DB ===")
        for b in bikes:
            specs = b.additional_specs or {}
            bname = b.model_name or "N/A"
            adas = str(specs.get('adas_features', '')).encode('utf-8', errors='ignore').decode('utf-8')
            print(f"ID: {str(b.id)[:8]}... | Name: {bname:<25} | ADAS: {adas[:60]}")

if __name__ == "__main__":
    asyncio.run(check())
