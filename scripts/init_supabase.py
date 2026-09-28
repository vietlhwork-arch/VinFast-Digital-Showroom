import asyncio
import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from src.services.database import engine
from src.models.domain import Base


async def init_db():
    print("Connecting to Supabase PostgreSQL Database...")
    async with engine.begin() as conn:
        print("Creating pgvector and uuid extensions if not exist...")
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS vector;'))
        
        print("Creating all tables according to updated models...")
        await conn.run_sync(Base.metadata.create_all)
        print("Successfully created database tables on Supabase!")

if __name__ == "__main__":
    asyncio.run(init_db())
