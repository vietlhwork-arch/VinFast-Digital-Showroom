import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from src.services.database import SessionLocal
from src.models.domain import Account
from src.services.security import verify_password, hash_password
from src.models.schemas import UserResponse, TokenResponse

async def test_login_logic():
    async with SessionLocal() as db:
        try:
            print("1. Querying Account...")
            result = await db.execute(select(Account).where(Account.email == "admin@vinfast.vn"))
            user = result.scalar_one_or_none()
            print("2. Account found:", user.email if user else None)
            
            print("3. Verifying password...")
            is_valid = verify_password("admin123", user.password_hash)
            print("4. Password valid:", is_valid)
            
            print("5. Validating UserResponse...")
            resp = UserResponse.model_validate(user)
            print("6. UserResponse:", resp)
            
            token_resp = TokenResponse(access_token="test", token_type="bearer", user=resp)
            print("7. TokenResponse:", token_resp)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_login_logic())
