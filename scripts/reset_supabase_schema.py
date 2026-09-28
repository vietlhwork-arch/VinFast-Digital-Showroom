import asyncio
import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from src.services.database import engine
from src.models.domain import Base


async def reset_schema():
    print("Connecting to Supabase PostgreSQL Database...")
    async with engine.begin() as conn:
        print("Dropping old deprecated tables if they exist...")
        old_tables = [
            "users",
            "cars",
            "e_scooters",
            "customer_profiles",
            "chat_sessions",
            "chat_messages",
            "ai_proposals"
        ]
        for tbl in old_tables:
            await conn.execute(text(f"DROP TABLE IF EXISTS {tbl} CASCADE;"))
            print(f"  -> Dropped old table: {tbl} (if existed)")

        print("Ensuring extensions exist...")
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS vector;'))

        print("Creating fresh clean tables from active models...")
        await conn.run_sync(Base.metadata.create_all)
        print("Schema reset successfully! Only active standard tables remain.")

if __name__ == "__main__":
    asyncio.run(reset_schema())
