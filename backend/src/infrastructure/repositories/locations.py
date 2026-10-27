from __future__ import annotations

from dataclasses import asdict

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.locations import Location
from src.infrastructure.orm import LocationRow


def to_location(row: LocationRow) -> Location:
    # Chuyển bản ghi ORM sang entity của domain để tầng ứng dụng không phụ thuộc SQLAlchemy.
    return Location(
        id=row.id,
        name=row.name,
        # Chuẩn hóa types thành list rỗng nếu dữ liệu trong DB đang là None.
        types=list(row.types or []),
        type_label=row.type_label,
        province=row.province,
        district=row.district,
        ward=row.ward,
        address=row.address,
        latitude=row.latitude,
        longitude=row.longitude,
        phone=row.phone,
        hotline_service=row.hotline_service,
        opening_hours=row.opening_hours,
        charging_info=row.charging_info,
        source=row.source,
        is_active=row.is_active,
    )


class SqlAlchemyLocationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_active(self, province: str | None = None, search: str | None = None) -> list[Location]:
        statement = select(LocationRow).where(LocationRow.is_active.is_(True))
        if province:
            statement = statement.where(LocationRow.province.ilike(f"%{province}%"))
        if search:
            # Tìm kiếm không phân biệt hoa thường trên các trường địa chỉ phổ biến.
            term = f"%{search}%"
            statement = statement.where(
                or_(
                    LocationRow.name.ilike(term),
                    LocationRow.address.ilike(term),
                    LocationRow.district.ilike(term),
                    LocationRow.province.ilike(term),
                )
            )
        rows = await self.session.scalars(statement.order_by(LocationRow.province, LocationRow.name))
        return [to_location(row) for row in rows]

    async def count(self) -> int:
        return int(await self.session.scalar(select(func.count()).select_from(LocationRow)) or 0)

    async def upsert_many(self, locations: list[Location]) -> int:
        """Portable upsert: update existing ids in place, insert the rest."""
        # Tải trước các bản ghi có ID trùng để cập nhật tại chỗ, tránh phụ thuộc cú pháp upsert riêng của DB.
        existing = {
            row.id: row
            for row in await self.session.scalars(
                select(LocationRow).where(LocationRow.id.in_([location.id for location in locations]))
            )
        }
        for location in locations:
            values = asdict(location)
            row = existing.get(location.id)
            if row is None:
                self.session.add(LocationRow(**values))
            else:
                for key, value in values.items():
                    setattr(row, key, value)
        await self.session.flush()
        return len(locations)
