import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import Account
from src.services.security import verify_password, hash_password

async def check_admin():
    async with SessionLocal() as db:
        res = await db.execute(select(Account).where(Account.email == "admin@vinfast.vn"))
        admin = res.scalar_one_or_none()
        if admin:
            print(f"Found Admin ID: {admin.id}")
            print(f"Email: {admin.email}")
            print(f"Role: {admin.role}")
            print(f"Hashed Password: {admin.hashed_password}")
            is_valid = verify_password("admin123", admin.hashed_password)
            print(f"Verify 'admin123': {is_valid}")
            if not is_valid:
                admin.hashed_password = hash_password("admin123")
                await db.commit()
                print("Updated admin password to 'admin123' hash successfully!")
        else:
            print("Admin account not found! Creating admin account...")
            new_admin = Account(
                email="admin@vinfast.vn",
                full_name="Quản trị viên VinFast",
                role="admin",
                phone="0909090909",
                hashed_password=hash_password("admin123"),
                is_active=True
            )
            db.add(new_admin)
            await db.commit()
            print("Created admin@vinfast.vn with password 'admin123'!")

if __name__ == "__main__":
    asyncio.run(check_admin())
