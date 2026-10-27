from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class Coordinates(BaseModel):
    """Tọa độ địa lý của một địa điểm."""

    lat: float
    lng: float


class LocationResponse(BaseModel):
    """Thông tin một địa điểm, được trả về theo cấu trúc mà giao diện bản đồ sử dụng."""

    # Cho phép nhận tên thuộc tính Python và xuất tên trường theo alias cho frontend.
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    types: list[str]
    type_label: str = Field(serialization_alias="typeLabel")
    province: str
    district: str
    ward: str | None = None
    address: str
    coordinates: Coordinates
    phone: str | None = None
    hotline_service: str | None = Field(None, serialization_alias="hotlineService")
    opening_hours: str = Field(serialization_alias="openingHours")
    charging_info: dict[str, Any] | None = Field(None, serialization_alias="chargingInfo")
    source: str


class LocationListResponse(BaseModel):
    """Phản hồi danh sách địa điểm kèm tổng số bản ghi."""

    status: str = "success"
    total: int
    data: list[LocationResponse]


class LocationSyncResponse(BaseModel):
    """Kết quả đồng bộ dữ liệu địa điểm."""

    status: str = "success"
    message: str
    total_synced: int
