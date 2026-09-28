import asyncio
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select, delete, func, text
from src.services.database import SessionLocal
from src.models.domain import VinfastLocation
from src.services.vinfast_locations_service import AUTHENTIC_VINFAST_LOCATIONS, sync_vinfast_locations_dataset

async def reset_locations():
    print(f"Total authentic locations to sync: {len(AUTHENTIC_VINFAST_LOCATIONS)}")
    async with SessionLocal() as db:
        # Check current count
        count_before = (await db.execute(select(func.count()).select_from(VinfastLocation))).scalar_one_or_none()
        print(f"Current count on Supabase: {count_before}")
        
        # Delete old locations
        print("Cleaning up old locations from Supabase...")
        await db.execute(delete(VinfastLocation))
        await db.commit()
        print("Deleted old records.")

        # Re-sync new dataset
        print("Syncing fresh ~100+ locations...")
        res = await sync_vinfast_locations_dataset(db)
        print(f"Sync result: {res}")

        # Verify new count
        count_after = (await db.execute(select(func.count()).select_from(VinfastLocation))).scalar_one_or_none()
        print(f"DONE: New count on Supabase: {count_after}")

if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    asyncio.run(reset_locations())

