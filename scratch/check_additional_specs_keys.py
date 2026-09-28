import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog

async def inspect_keys():
    async with SessionLocal() as db:
        res = await db.execute(select(CarCatalog))
        cars = res.scalars().all()
        for c in cars:
            if c.additional_specs and "_legacy_source" in c.additional_specs:
                specs = c.additional_specs["_legacy_source"].get("specifications", {})
                print(f"Car ID: {c.car_id}")
                print(f"  Keys in specifications: {list(specs.keys())}")
                print(f"  additional_specs nested: {specs.get('additional_specs')}")

if __name__ == "__main__":
    asyncio.run(inspect_keys())
