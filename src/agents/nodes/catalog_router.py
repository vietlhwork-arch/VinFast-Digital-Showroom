"""Route catalog questions using dynamic vehicle identities and LLM intent classification."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import asdict
from typing import Any

from pydantic import BaseModel, Field

from src.agents.state import AgentState
from src.config import get_settings
from src.services.database import SessionLocal
from src.services.rag.retrieval.models import RetrievalFilters
from src.services.rag.retrieval.vehicle_resolver import (
    PostgresVehicleResolver,
    VehicleResolver,
)

settings = get_settings()


class CatalogIntentOutput(BaseModel):
    is_factual_or_spec_query: bool = Field(
        description="True nếu người dùng hỏi tra cứu thông số kỹ thuật, pin, sạc, trang bị, tính năng, hoặc so sánh chi tiết xe. False nếu người dùng đang tìm mua xe, nhờ tư vấn chọn xe theo ngân sách/nhu cầu, xin báo giá, tạo báo giá hoặc bắt đầu hành trình mua xe."
    )
    reasoning: str = Field(
        default="",
        description="Lý do phân loại ngắn gọn."
    )


ROUTER_SYSTEM_PROMPT = """Bạn là Bộ Định Tuyến Ý Định (Intent Router) thông minh cho Trợ lý Xe điện VinFast.
Nhiệm vụ: Phân loại câu hỏi của người dùng vào 1 trong 2 luồng xử lý:
1. TRA CỨU THÔNG SỐ / DỮ KIỆN CATALOG (is_factual_or_spec_query = True):
   - Hỏi thông số kỹ thuật (dung lượng pin, quãng đường di chuyển, công suất, kích thước, thời gian sạc, tính năng an toàn, trang bị ADAS...).
   - So sánh thông số kỹ thuật giữa 2 hay nhiều dòng xe.
   - Hỏi danh sách liệt kê các xe theo tiêu chí kỹ thuật cụ thể (ví dụ: xe không cần bằng lái, xe có cửa sổ trời...).
2. TƯ VẤN MUA XE / BÁO GIÁ / KHÁM PHÁ NHU CẦU (is_factual_or_spec_query = False):
   - Nhờ tư vấn chọn xe, tìm xe theo tầm giá/ngân sách hoặc nhu cầu đi lại cá nhân/gia đình.
   - Yêu cầu báo giá, nhận báo giá, tạo báo giá chính thức, hỏi chi phí lăn bánh tổng thể theo gói mua.
   - Trò chuyện mở đầu, cung cấp tiêu chí chọn xe.

Quy tắc:
- Các câu hỏi tìm xe theo ngân sách ("500 triệu", "xe tầm 600tr"), nhờ tư vấn ("tư vấn cho tôi"), xin báo giá ("cho tôi báo giá", "tạo báo giá") -> BẮT BUỘC trả về is_factual_or_spec_query = False.
- Các câu hỏi tra cứu cụ thể về pin, sạc, thông số của 1 xe ("VF 8 pin bao nhiêu kWh", "Kinet dùng pin gì") -> trả về is_factual_or_spec_query = True.
"""


def classify_catalog_intent(
    query: str,
    *,
    has_matched_vehicle: bool = False,
) -> bool:
    """Return whether an in-scope query needs grounded catalog retrieval without calling LLM."""
    q = (query or "").strip()
    if not q:
        return False

    q_lower = q.lower()

    if has_matched_vehicle:
        return True

    # Priority 1: Technical, spec, battery, equipment & feature queries -> catalog_rag
    spec_keywords = (
        "pin", "sạc", "thông số", "dung lượng", "quãng đường", "kích thước",
        "công suất", "mã lực", "bằng lái", "động cơ", "túi khí", "adas",
        "so sánh", "trang bị", "bảo hành", "khoảng sáng gầm", "tiêu chuẩn",
        "liệt kê", "dài bao nhiêu", "rộng bao nhiêu", "cao bao nhiêu", "bao nhiêu kwh",
        "đi được bao xa", "mất bao lâu", "khóa thông minh", "tính năng", "định vị", "kết nối",
        "giá bao nhiêu", "giá niêm yết"
    )
    is_spec_or_compare = any(kw in q_lower for kw in spec_keywords)
    if is_spec_or_compare:
        return True

    # Priority 2: Open-ended buying, budgeting & general quotation journeys -> needs_discovery
    buying_keywords = (
        "báo giá", "tư vấn", "ngân sách", "tôi muốn mua", "tôi cần mua",
        "tìm xe", "chọn xe", "tầm giá", "tài chính", "trả góp", "vay",
        "dưới 500", "dưới 600", "dưới 700", "dưới 800", "dưới 1 tỷ", "dưới 2 tỷ",
        "hôm nay", "chi phí lăn bánh", "thủ tục"
    )
    is_buying_or_quote = any(kw in q_lower for kw in buying_keywords)
    if is_buying_or_quote:
        return False

    if has_matched_vehicle:
        return True

    # Default to needs_discovery (Single-call handles everything)
    return False


def build_catalog_router_node(
    *,
    session_factory: Callable[[], Any] = SessionLocal,
    resolver: VehicleResolver | None = None,
):
    vehicle_resolver = resolver or PostgresVehicleResolver()

    async def catalog_router_node(state: AgentState) -> dict[str, Any]:
        query = (state.get("query") or "").strip()
        metadata = dict(state.get("metadata") or {})
        resolved_vehicles = ()
        status = "ok"

        if query:
            try:
                # Fast in-memory vehicle matching first
                from src.services.rag.retrieval.vehicle_resolver import _CATALOG_CACHE_DATA, match_vehicle_identities
                if _CATALOG_CACHE_DATA:
                    resolved_vehicles = match_vehicle_identities(query, _CATALOG_CACHE_DATA)
                else:
                    async with session_factory() as db:
                        scope = await vehicle_resolver.resolve(
                            db,
                            query,
                            RetrievalFilters(),
                        )
                    resolved_vehicles = scope.vehicles
            except Exception:
                status = "catalog_lookup_unavailable"

        use_catalog_rag = classify_catalog_intent(
            query,
            has_matched_vehicle=bool(resolved_vehicles),
        )
        vehicle_types = {vehicle.vehicle_type for vehicle in resolved_vehicles}
        resolved_vehicle_type = (
            next(iter(vehicle_types)) if len(vehicle_types) == 1 else None
        )
        metadata["catalog_route"] = {
            "status": status,
            "use_catalog_rag": use_catalog_rag,
            "resolved_vehicle_type": resolved_vehicle_type,
            "resolved_vehicle_ids": [
                vehicle.vehicle_id for vehicle in resolved_vehicles
            ],
            "resolved_vehicles": [
                asdict(vehicle) for vehicle in resolved_vehicles
            ],
        }
        return {
            "use_catalog_rag": use_catalog_rag,
            "metadata": metadata,
        }

    return catalog_router_node


catalog_router_node = build_catalog_router_node()


__all__ = [
    "build_catalog_router_node",
    "catalog_router_node",
    "classify_catalog_intent",
]

