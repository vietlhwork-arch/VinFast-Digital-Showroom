import asyncio
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog, MotorbikeCatalog

async def dump_all_keys():
    async with SessionLocal() as db:
        res_cars = await db.execute(select(CarCatalog))
        cars = res_cars.scalars().all()

        res_bikes = await db.execute(select(MotorbikeCatalog))
        bikes = res_bikes.scalars().all()

        car_keys = set()
        bike_keys = set()

        def extract_keys(obj, parent_key=''):
            keys = set()
            if isinstance(obj, dict):
                for k, v in obj.items():
                    full_key = f"{parent_key}.{k}" if parent_key else k
                    keys.add(full_key)
                    if isinstance(v, dict):
                        keys.update(extract_keys(v, full_key))
            return keys

        for c in cars:
            if c.additional_specs:
                car_keys.update(extract_keys(c.additional_specs))

        for b in bikes:
            if b.additional_specs:
                bike_keys.update(extract_keys(b.additional_specs))

        print("=== UNIQUE KEYS IN CAR CATALOG additional_specs ===")
        for k in sorted(car_keys):
            print(" -", k)

        print("\n=== UNIQUE KEYS IN MOTORBIKE CATALOG additional_specs ===")
        for k in sorted(bike_keys):
            print(" -", k)

if __name__ == "__main__":
    asyncio.run(dump_all_keys())
