import asyncio
from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import Quote

async def check():
    async with SessionLocal() as db:
        res = await db.scalars(select(Quote).order_by(Quote.created_at.desc()).limit(5))
        for q in res.all():
            print(f"{q.id} | {q.customer_name} | {q.customer_email} | {q.customer_phone} | {q.vehicle_name} | {q.vehicle_id} | {q.base_price} | {q.created_at}")

if __name__ == "__main__":
    asyncio.run(check())
