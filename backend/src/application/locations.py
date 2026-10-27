from __future__ import annotations

from collections.abc import Callable, Sequence

from src.domain.errors import PermissionDeniedError
from src.domain.identity import Actor
from src.domain.locations import Location
from src.domain.unit_of_work import UnitOfWork

ALL_PROVINCES_LABEL = "tất cả tỉnh thành"

LocationDataset = Callable[[], Sequence[Location]]


class LocationService:
    def __init__(self, uow: UnitOfWork, dataset: LocationDataset):
        self.uow = uow
        self.dataset = dataset

    async def list_locations(
        self,
        demand_type: str | None = None,
        province: str | None = None,
        search: str | None = None,
    ) -> list[Location]:
        # Chuẩn hóa bộ lọc tỉnh; nhãn "tất cả tỉnh thành" tương đương không lọc.
        province = (province or "").strip()
        if province.lower() == ALL_PROVINCES_LABEL:
            province = ""
        locations = await self.uow.locations.list_active(province or None, (search or "").strip() or None)

        # Lọc tiếp theo loại nhu cầu ở tầng ứng dụng; hỗ trợ nhiều loại phân tách bằng dấu phẩy.
        wanted = [item.strip() for item in (demand_type or "").split(",") if item.strip()]
        if not wanted:
            return locations
        return [location for location in locations if any(kind in location.types for kind in wanted)]

    async def synchronize(self, actor: Actor) -> int:
        """Reload the reviewed reference dataset into the database (idempotent upsert)."""
        if not actor.is_admin:
            raise PermissionDeniedError("Chỉ quản trị viên được đồng bộ dữ liệu địa điểm")
        # Upsert giúp đồng bộ nhiều lần mà không tạo bản ghi trùng lặp.
        total = await self.uow.locations.upsert_many(list(self.dataset()))
        await self.uow.commit()
        return total
