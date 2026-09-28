import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import asyncio
from sqlalchemy import select, update
from src.services.database import SessionLocal
from src.models.domain import CarCatalog, MotorbikeCatalog

async def migrate():
    async with SessionLocal() as db:
        # Check CarCatalog
        res = await db.execute(select(CarCatalog))
        cars = res.scalars().all()
        updated_cars = 0
        for c in cars:
            if c.image_url and '/static/uploads/escooters/' in c.image_url:
                c.image_url = c.image_url.replace('/static/uploads/escooters/', '/static/uploads/motorbikes/')
                updated_cars += 1
        
        # Check MotorbikeCatalog
        res_m = await db.execute(select(MotorbikeCatalog))
        mikes = res_m.scalars().all()
        updated_mikes = 0
        for m in mikes:
            if m.image_url and '/static/uploads/escooters/' in m.image_url:
                m.image_url = m.image_url.replace('/static/uploads/escooters/', '/static/uploads/motorbikes/')
                updated_mikes += 1

            # also check specs JSON if any
            if m.specs and isinstance(m.specs, dict):
                specs_str = str(m.specs)
                if '/static/uploads/escooters/' in specs_str:
                    m.specs = eval(specs_str.replace('/static/uploads/escooters/', '/static/uploads/motorbikes/'))

        await db.commit()
        print(f"Updated {updated_cars} cars and {updated_mikes} motorbikes DB image_url records to /static/uploads/motorbikes/")

if __name__ == "__main__":
    asyncio.run(migrate())
