import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.domain import Account
from src.models.schemas import GoogleLoginRequest, TokenResponse, UserLogin, UserRegister, UserResponse, UserUpdate
from src.services.customer_profile_service import sync_from_account_register
from src.services.database import get_db
from src.services.security import create_access_token, get_current_user, hash_password, require_roles, verify_password

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Account).where(Account.email == payload.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email này đã được đăng ký trong hệ thống!",
        )

    valid_roles = ["customer", "consultant", "admin"]
    role = payload.role if payload.role in valid_roles else "customer"

    new_user = Account(
        email=payload.email.lower(),
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=role,
        status="active",
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Tự động tạo / liên kết hồ sơ khách hàng 360°
    await sync_from_account_register(db, new_user)

    return new_user


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account).where(Account.email == payload.email.lower()))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác!",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa!",
        )

    access_token = create_access_token(data={"sub": str(user.user_id), "role": user.role})
    return TokenResponse(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/google", response_model=TokenResponse)
async def google_login(payload: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    """Xác thực Google Token (ID Token hoặc Access Token) và đăng nhập/tự động đăng ký khách hàng."""
    token = payload.id_token.strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Token không được để trống!",
        )

    # Verify Google Token with Google OAuth2 API
    email = None
    full_name = None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Try ID token verification
            resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
            if resp.status_code == 200:
                google_data = resp.json()
                email = google_data.get("email")
                full_name = google_data.get("name") or google_data.get("given_name") or "Khách hàng Google"
            else:
                # 2. Try Access token verification
                userinfo_resp = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if userinfo_resp.status_code == 200:
                    google_data = userinfo_resp.json()
                    email = google_data.get("email")
                    full_name = google_data.get("name") or google_data.get("given_name") or "Khách hàng Google"
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Google Token không hợp lệ hoặc đã hết hạn!",
                    )

            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Không thể lấy thông tin Email từ Google Token!",
                )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi xác thực Google Token: {str(e)}",
        )

    email = email.lower()

    # Check if Account exists in DB
    result = await db.execute(select(Account).where(Account.email == email))
    user = result.scalar_one_or_none()

    if not user:
        # Create new Customer Account automatically
        user = Account(
            email=email,
            phone="",
            password_hash=hash_password(str(uuid.uuid4())),
            full_name=full_name,
            role="customer",
            status="active",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        await sync_from_account_register(db, user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa!",
        )

    access_token = create_access_token(data={"sub": str(user.user_id), "role": user.role})
    return TokenResponse(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))



@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Account = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=list[UserResponse])
async def get_all_users(
    current_user: Account = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Account).order_by(Account.created_at.desc()))
    return result.scalars().all()


@router.post("/create-staff", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_staff_by_admin(
    payload: UserRegister,
    current_user: Account = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(Account).where(Account.email == payload.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email này đã được đăng ký trong hệ thống!",
        )

    new_staff = Account(
        email=payload.email.lower(),
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role if payload.role in ["consultant", "admin"] else "consultant",
        status="active",
    )
    db.add(new_staff)
    await db.commit()
    await db.refresh(new_staff)
    return new_staff


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    payload: UserUpdate,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cho phép người dùng tự cập nhật thông tin cá nhân của chính mình (Họ tên, SĐT, Mật khẩu)."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.password:
        current_user.password_hash = hash_password(payload.password)

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cập nhật thông tin tài khoản: Người dùng sửa chính mình hoặc Admin sửa mọi tài khoản."""
    if current_user.user_id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền sửa thông tin của tài khoản khác!",
        )

    res = await db.execute(select(Account).where(Account.user_id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản này!")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.phone is not None:
        user.phone = payload.phone

    # Chỉ Admin mới có quyền đổi vai trò hoặc khóa/mở khóa tài khoản
    if current_user.role == "admin":
        if payload.role is not None:
            user.role = payload.role
        if payload.is_active is not None:
            user.status = "active" if payload.is_active else "inactive"

    if payload.password:
        user.password_hash = hash_password(payload.password)

    await db.commit()
    await db.refresh(user)
    return user



@router.delete("/users/{user_id}")
async def delete_user_by_admin(
    user_id: uuid.UUID,
    current_user: Account = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db),
):
    if current_user.user_id == user_id:
        raise HTTPException(status_code=400, detail="Không thể tự xóa tài khoản Admin đang đăng nhập!")

    res = await db.execute(select(Account).where(Account.user_id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản này!")

    await db.delete(user)
    await db.commit()
    return {"message": "Đã xóa tài khoản thành công"}
