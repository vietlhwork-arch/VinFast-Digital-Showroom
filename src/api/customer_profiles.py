import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.domain import CustomerProfile, User
from src.models.schemas import CustomerProfileResponse, CustomerProfileUpdate
from src.services.customer_profile_service import (
    get_customer_profile_by_id,
    get_customer_profiles_list,
)
from src.services.database import get_db
from src.services.security import get_current_user, require_roles

router = APIRouter()


@router.get("", response_model=list[CustomerProfileResponse])
async def list_profiles(
    lead_score: str | None = Query(None, description="Lọc theo độ tiềm năng: HOT, WARM, COLD"),
    lead_status: str | None = Query(None, description="Lọc theo trạng thái: NEW, CONTACTED, TEST_DRIVEN, QUOTED, WON, LOST"),
    search: str | None = Query(None, description="Tìm kiếm theo Tên, SĐT, Email"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_roles(["admin", "consultant"])),
    db: AsyncSession = Depends(get_db),
):
    """Lấy danh sách hồ sơ khách hàng (Dành cho Tư vấn viên & Quản trị viên)."""
    return await get_customer_profiles_list(
        db=db,
        lead_score=lead_score,
        lead_status=lead_status,
        search=search,
        skip=skip,
        limit=limit,
    )


from sqlalchemy.orm import selectinload


@router.get("/me", response_model=CustomerProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Khách hàng xem hồ sơ cá nhân của chính mình."""
    stmt = select(CustomerProfile).options(selectinload(CustomerProfile.account)).where(CustomerProfile.user_id == current_user.user_id)
    res = await db.execute(stmt)
    profile = res.scalars().first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chưa tìm thấy hồ sơ khách hàng cho tài khoản này.",
        )
    return profile


@router.get("/{profile_id}", response_model=CustomerProfileResponse)
async def get_profile_detail(
    profile_id: uuid.UUID,
    current_user: User = Depends(require_roles(["admin", "consultant"])),
    db: AsyncSession = Depends(get_db),
):
    """Xem chi tiết chân dung khách hàng 360° theo ID."""
    profile = await get_customer_profile_by_id(db, profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hồ sơ khách hàng.",
        )
    return profile


@router.put("/{profile_id}", response_model=CustomerProfileResponse)
async def update_profile(
    profile_id: uuid.UUID,
    payload: CustomerProfileUpdate,
    current_user: User = Depends(require_roles(["admin", "consultant"])),
    db: AsyncSession = Depends(get_db),
):
    """Tư vấn viên cập nhật trạng thái hoặc thông tin hồ sơ khách hàng."""
    profile = await get_customer_profile_by_id(db, profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hồ sơ khách hàng để cập nhật.",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(profile, field, val)

    await db.commit()
    await db.refresh(profile)
    return profile


from src.models.schemas import CustomerDemandResponse, CustomerProfileFull360Response
from src.services.customer_profile_service import get_customer_demands, get_customer_full_360


@router.get("/user/{user_id}/demands", response_model=list[CustomerDemandResponse])
async def list_user_demands(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(["admin", "consultant"])),
    db: AsyncSession = Depends(get_db),
):
    """Lấy danh sách lịch sử tất cả các đợt nhu cầu tìm xe của khách hàng."""
    return await get_customer_demands(db, user_id)


@router.get("/user/{user_id}/history", response_model=CustomerProfileFull360Response)
async def get_user_full_360_history(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(["admin", "consultant"])),
    db: AsyncSession = Depends(get_db),
):
    """Lấy trọn vẹn Chân dung khách hàng 360° kèm lịch sử Demands, Quotes, Test Drives."""
    full_data = await get_customer_full_360(db, user_id)
    if not full_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hồ sơ khách hàng cho tài khoản này.",
        )
    return full_data

