import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import CarCatalog

async def inspect_cars():
    async with SessionLocal() as db:
        res = await db.execute(select(CarCatalog).limit(3))
        cars = res.scalars().all()
        for c in cars:
            print(f"=== {c.model_name} ===")
            print(f"Top-level columns: range_km={c.range_km}, max_power={c.maximum_power_kw}, torque={c.maximum_torque_nm}, battery={c.usable_battery_capacity}, seats={c.seat_count}, L={c.length_mm}, W={c.width_mm}, H={c.height_mm}")
            print(f"additional_specs keys: {list(c.additional_specs.keys()) if c.additional_specs else None}")
            if c.additional_specs and "_legacy_source" in c.additional_specs:
                specs = c.additional_specs["_legacy_source"].get("specifications", {})
                print(f" Legacy specs keys: {list(specs.keys())}")

if __name__ == "__main__":
    asyncio.run(inspect_cars())
