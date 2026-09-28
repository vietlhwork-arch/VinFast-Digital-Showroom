import logging
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.domain import Account, CustomerProfile, TestDriveBooking

logger = logging.getLogger(__name__)


async def sync_from_account_register(db: AsyncSession, account: Account) -> CustomerProfile:
    """Tạo hồ sơ khách hàng 360° khi người dùng đăng ký tài khoản (không trùng lặp thuộc tính)."""
    try:
        stmt = select(CustomerProfile).where(CustomerProfile.user_id == account.user_id)
        result = await db.execute(stmt)
        profile = result.scalars().first()

        if profile:
            return profile

        new_profile = CustomerProfile(
            user_id=account.user_id,
            lead_score="WARM",
            lead_status="NEW",
            all_interested_models=[],
        )
        db.add(new_profile)
        await db.commit()
        await db.refresh(new_profile)
        logger.info(f"[CUSTOMER PROFILE] Created clean profile for user_id={account.user_id}")
        return new_profile
    except Exception as e:
        logger.error(f"[CUSTOMER PROFILE] Error syncing from account: {e}")
        await db.rollback()
        raise


async def sync_from_test_drive_booking(
    db: AsyncSession,
    booking: TestDriveBooking,
    user_id: uuid.UUID | None = None
) -> CustomerProfile | None:
    """Cập nhật thông tin lái thử vào hồ sơ của khách hàng (nếu đã có tài khoản hoặc tìm thấy theo SĐT)."""
    try:
        target_user_id = user_id

        # Nếu không truyền user_id, thử tìm tài khoản theo số điện thoại
        if not target_user_id and booking.customer_phone:
            acc_stmt = select(Account).where(Account.phone == booking.customer_phone.strip())
            acc_res = await db.execute(acc_stmt)
            acc = acc_res.scalars().first()
            if acc:
                target_user_id = acc.user_id

        if not target_user_id:
            # Khách vãng lai chưa có tài khoản -> Đơn lái thử đã lưu trong test_drive_bookings
            logger.info(f"[CUSTOMER PROFILE] Guest test drive booking recorded for {booking.customer_phone}")
            return None

        # Tìm hoặc tạo profile cho target_user_id
        stmt = select(CustomerProfile).where(CustomerProfile.user_id == target_user_id)
        result = await db.execute(stmt)
        profile = result.scalars().first()

        v_name = booking.vehicle_name or ""

        if not profile:
            profile = CustomerProfile(
                user_id=target_user_id,
                all_interested_models=[v_name] if v_name else [],
                total_test_drives=1,
                lead_score="HOT",
                lead_status="TEST_DRIVEN",
            )
            db.add(profile)
        else:
            current_models = list(profile.all_interested_models or [])
            if v_name and v_name not in current_models:
                current_models.append(v_name)
                profile.all_interested_models = current_models

            profile.total_test_drives = (profile.total_test_drives or 0) + 1
            profile.lead_score = "HOT"
            profile.lead_status = "TEST_DRIVEN"
            profile.last_interaction_at = datetime.utcnow()
            profile.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(profile)
        logger.info(f"[CUSTOMER PROFILE] Updated test drive stats for user_id={target_user_id}")
        return profile
    except Exception as e:
        logger.error(f"[CUSTOMER PROFILE] Error syncing from test drive booking: {e}")
        await db.rollback()
        return None


from src.models.domain import Account, CustomerDemand, CustomerProfile, Quote, TestDriveBooking


async def record_or_update_demand(
    db: AsyncSession,
    user_id: uuid.UUID,
    session_id: str | None = None,
    needs_data: dict[str, Any] | None = None,
    demand_summary: str | None = None,
    action_data: dict[str, Any] | None = None,
) -> CustomerDemand | None:
    """
    Ghi nhận hoặc cập nhật đợt nhu cầu cụ thể (1-N) cho khách hàng.
    Mỗi phiên trò chuyện hoặc đợt tìm xe khác nhau sẽ là một bản ghi CustomerDemand độc lập.
    """
    if not user_id:
        return None

    try:
        # 1. Tìm demand đang active theo session_id (hoặc tạo mới nếu là session mới)
        demand = None
        if session_id:
            stmt = select(CustomerDemand).where(
                CustomerDemand.user_id == user_id,
                CustomerDemand.session_id == session_id
            ).order_by(desc(CustomerDemand.updated_at))
            res = await db.execute(stmt)
            demand = res.scalars().first()

        v_type = "CAR"
        if needs_data and needs_data.get("vehicle_type_preference"):
            v_type = str(needs_data["vehicle_type_preference"])

        if not demand:
            demand = CustomerDemand(
                user_id=user_id,
                session_id=session_id,
                vehicle_type=v_type,
                target_models=[],
                status="ACTIVE",
            )
            db.add(demand)

        cur_targets = list(demand.target_models or [])

        if needs_data:
            if needs_data.get("vehicle_type_preference"):
                demand.vehicle_type = str(needs_data["vehicle_type_preference"])
            if needs_data.get("budget_min") is not None:
                demand.budget_min = needs_data["budget_min"]
            if needs_data.get("budget_max") is not None:
                demand.budget_max = needs_data["budget_max"]
            if needs_data.get("usage_purpose"):
                demand.usage_purpose = str(needs_data["usage_purpose"])
            if needs_data.get("battery_preference"):
                demand.battery_preference = str(needs_data["battery_preference"])

            c_cond = needs_data.get("charging_condition") or needs_data.get("charging_access")
            if c_cond:
                demand.charging_condition = str(c_cond)

            t_m = needs_data.get("target_model")
            if t_m and str(t_m).strip() and str(t_m).strip() not in cur_targets:
                cur_targets.append(str(t_m).strip())

            for m in (needs_data.get("interested_models") or []):
                if m and m not in cur_targets:
                    cur_targets.append(m)

        if action_data:
            v_name = action_data.get("vehicle_name")
            if v_name and v_name not in cur_targets:
                cur_targets.append(v_name)
            if action_data.get("type") == "create_quote":
                demand.status = "QUOTED"
            elif action_data.get("type") == "book_test_drive":
                demand.status = "TEST_DRIVEN"

        demand.target_models = cur_targets
        if demand_summary and str(demand_summary).strip():
            demand.demand_summary = str(demand_summary).strip()

        demand.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(demand)
        return demand
    except Exception as e:
        logger.error(f"[CUSTOMER DEMAND] Error recording demand: {e}")
        await db.rollback()
        return None


import re

def extract_vietnamese_phone(text: str | None) -> str | None:
    """Trích xuất và chuẩn hóa số điện thoại Việt Nam từ văn bản người dùng."""
    if not text:
        return None
    cleaned = re.sub(r"[\s\.\-]", "", text)
    match = re.search(r"(?:\+84|84|0)[35789]\d{8}\b", cleaned)
    if match:
        raw = match.group(0)
        if raw.startswith("+84"):
            return "0" + raw[3:]
        if raw.startswith("84") and len(raw) == 11:
            return "0" + raw[2:]
        return raw
    return None


async def sync_from_chat_insights(
    db: AsyncSession,
    user_id: uuid.UUID | None = None,
    session_id: str | None = None,
    needs_data: dict[str, Any] | None = None,
    ai_portrait: str | None = None,
    action_data: dict[str, Any] | None = None,
    phone_number: str | None = None,
) -> CustomerProfile | None:
    """
    Cập nhật chân dung khách hàng tổng thể từ trích xuất hội thoại AI và lưu vết đợt nhu cầu.
    Đồng bộ số điện thoại vào bảng Accounts nếu khách hàng cung cấp qua chat.
    QUY TẮC: Chỉ áp dụng khi user đã đăng nhập (user_id).
    """
    if not user_id:
        return None

    try:
        # 0. Đồng bộ số điện thoại vào bảng Accounts nếu khách hàng vừa cung cấp
        if phone_number and str(phone_number).strip():
            clean_phone = str(phone_number).strip()
            acc_stmt = select(Account).where(Account.user_id == user_id)
            acc_res = await db.execute(acc_stmt)
            acc = acc_res.scalars().first()
            if acc:
                acc.phone = clean_phone
                acc.updated_at = datetime.utcnow()
                try:
                    import os, sqlite3
                    from src.config import DATA_DIR
                    db_path = "/tmp/vinfast.db" if os.environ.get("VERCEL") else os.path.join(DATA_DIR, "vinfast.db")
                    if os.path.exists(db_path):
                        conn = sqlite3.connect(db_path)
                        cur = conn.cursor()
                        cur.execute("UPDATE accounts SET phone = ? WHERE user_id = ? OR id = ? OR email = ?", (clean_phone, str(user_id), str(user_id), acc.email))
                        cur.execute("UPDATE users SET phone = ? WHERE id = ? OR email = ?", (clean_phone, str(user_id), acc.email))
                        conn.commit()
                        conn.close()
                except Exception:
                    pass
        # 1. Ghi nhận / Cập nhật đợt nhu cầu cụ thể (1-N)
        await record_or_update_demand(
            db=db,
            user_id=user_id,
            session_id=session_id,
            needs_data=needs_data,
            demand_summary=ai_portrait,
            action_data=action_data,
        )

        # 2. Cập nhật chân dung khách hàng 360° tổng quan (1-1)
        stmt = select(CustomerProfile).where(CustomerProfile.user_id == user_id)
        result = await db.execute(stmt)
        profile = result.scalars().first()

        if not profile:
            profile = CustomerProfile(
                user_id=user_id,
                lead_score="WARM",
                lead_status="NEW",
                all_interested_models=[],
            )
            db.add(profile)

        current_models = list(profile.all_interested_models or [])

        if needs_data:
            t_model = needs_data.get("target_model")
            if t_model and str(t_model).strip():
                clean_m = str(t_model).strip()
                if clean_m not in current_models:
                    current_models.append(clean_m)

            new_models = needs_data.get("interested_models") or []
            if isinstance(new_models, list):
                for m in new_models:
                    if m and m not in current_models:
                        current_models.append(m)

        # Process action
        if action_data:
            act_type = action_data.get("type")
            v_name = action_data.get("vehicle_name")
            if v_name and v_name not in current_models:
                current_models.append(v_name)

            if act_type == "create_quote":
                profile.total_quotes = (profile.total_quotes or 0) + 1
                profile.lead_status = "QUOTED"
                profile.lead_score = "HOT"
            elif act_type == "book_test_drive":
                profile.lead_score = "HOT"

        profile.all_interested_models = current_models

        # Tính tổng số đợt nhu cầu (demands count)
        total_d = await db.scalar(
            select(func.count(CustomerDemand.demand_id)).where(CustomerDemand.user_id == user_id)
        )
        profile.total_demands = total_d or 1

        # Chân dung AI đa chiều
        if ai_portrait and str(ai_portrait).strip():
            profile.ai_customer_portrait = str(ai_portrait).strip()
        elif not profile.ai_customer_portrait:
            portrait_parts = []
            if profile.total_demands and profile.total_demands > 1:
                portrait_parts.append(f"Khách hàng có {profile.total_demands} đợt tìm xe khác nhau")
            if profile.all_interested_models:
                portrait_parts.append(f"Các dòng xe quan tâm: {', '.join(profile.all_interested_models)}")
            if portrait_parts:
                profile.ai_customer_portrait = " | ".join(portrait_parts)

        profile.last_interaction_at = datetime.utcnow()
        profile.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(profile)
        logger.info(f"[CUSTOMER PROFILE] Successfully synced AI insights and demand history for user_id={user_id}")
        return profile
    except Exception as e:
        logger.error(f"[CUSTOMER PROFILE] Error syncing chat insights: {e}")
        await db.rollback()
        return None


async def get_customer_demands(
    db: AsyncSession,
    user_id: uuid.UUID
) -> list[CustomerDemand]:
    """Lấy danh sách lịch sử tất cả các đợt tìm xe của khách hàng."""
    stmt = select(CustomerDemand).where(CustomerDemand.user_id == user_id).order_by(desc(CustomerDemand.created_at))
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_customer_profiles_list(
    db: AsyncSession,
    lead_score: str | None = None,
    lead_status: str | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 50
) -> list[CustomerProfile]:
    """Truy vấn danh sách hồ sơ khách hàng, JOIN với bảng accounts để lấy Họ tên, SĐT, Email."""
    stmt = select(CustomerProfile).join(CustomerProfile.account)

    if lead_score:
        stmt = stmt.where(CustomerProfile.lead_score == lead_score)
    if lead_status:
        stmt = stmt.where(CustomerProfile.lead_status == lead_status)
    if search:
        search_fmt = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Account.full_name.ilike(search_fmt),
                Account.phone.ilike(search_fmt),
                Account.email.ilike(search_fmt)
            )
        )

    stmt = stmt.order_by(desc(CustomerProfile.last_interaction_at)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_customer_profile_by_id(
    db: AsyncSession,
    profile_id: uuid.UUID
) -> CustomerProfile | None:
    """Lấy chi tiết 1 hồ sơ khách hàng."""
    stmt = select(CustomerProfile).options(selectinload(CustomerProfile.account)).where(CustomerProfile.profile_id == profile_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_customer_full_360(
    db: AsyncSession,
    user_id: uuid.UUID
) -> dict[str, Any] | None:
    """Truy vấn trọn vẹn Chân dung khách hàng 360° kèm lịch sử Demands, Quotes, Test Drives."""
    # 1. Profile
    p_stmt = select(CustomerProfile).options(selectinload(CustomerProfile.account)).where(CustomerProfile.user_id == user_id)
    p_res = await db.execute(p_stmt)
    profile = p_res.scalars().first()
    if not profile:
        return None

    # 2. Demands
    d_stmt = select(CustomerDemand).where(CustomerDemand.user_id == user_id).order_by(desc(CustomerDemand.created_at))
    demands = list((await db.execute(d_stmt)).scalars().all())

    # 3. Quotes
    q_stmt = select(Quote).where(Quote.user_id == str(user_id)).order_by(desc(Quote.created_at))
    quotes = list((await db.execute(q_stmt)).scalars().all())

    # 4. Test Drives
    # Tìm qua user_id hoặc phone
    b_stmt = select(TestDriveBooking).order_by(desc(TestDriveBooking.created_at))
    if profile.account and profile.account.phone:
        b_stmt = b_stmt.where(TestDriveBooking.customer_phone == profile.account.phone)
    test_drives = list((await db.execute(b_stmt)).scalars().all())

    return {
        "profile": profile,
        "demands": demands,
        "quotes": quotes,
        "test_drives": test_drives,
    }

