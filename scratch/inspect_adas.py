import asyncio
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog, MotorbikeCatalog

async def inspect_adas_and_description():
    async with SessionLocal() as db:
        res_cars = await db.execute(select(CarCatalog))
        cars = res_cars.scalars().all()

        res_bikes = await db.execute(select(MotorbikeCatalog))
        bikes = res_bikes.scalars().all()

        print("=== CAR CATALOG ADAS & DESCRIPTION ===")
        for c in cars:
            specs = c.additional_specs or {}
            leg = specs.get('_legacy_source', {}).get('specifications', {})
            add_spec = leg.get('additional_specs', {})
            print(f"\nID: {c.id} | Model: {c.model_name}")
            print(f"  Description column: {c.description[:50] if c.description else 'NONE'}")
            print(f"  add_spec description_text: {add_spec.get('description_text', 'NONE')[:50] if isinstance(add_spec, dict) else 'NONE'}")
            print(f"  specs adas_features: {specs.get('adas_features')}")
            print(f"  add_spec type: {type(add_spec)}")

if __name__ == "__main__":
    asyncio.run(inspect_adas_and_description())
