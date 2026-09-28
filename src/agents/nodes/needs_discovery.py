"""
src/agents/nodes/needs_discovery.py (v3.2 – All 5 Types Pass Through LLM Composer)
Kiến trúc: Extract (LLM) -> Query (DB + Cache) -> Compose (LLM)
- B3 Composer không còn early return: Mọi action_type (greeting, refusal, direct_answer, discontinued, empty, normal) đều qua LLM
- Cache theo criteria hash trong state ở B2
- 100% data grounded từ Supabase CSDL
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
from typing import Any

from jinja2 import Environment, FileSystemLoader
from langchain_core.messages import AIMessage
from langsmith import traceable
from pydantic import BaseModel, Field

from src.services.catalog_service import (
    fetch_cars_for_models,
    fetch_cars_from_supabase,
    fetch_motorbikes_for_models,
    fetch_motorbikes_from_supabase,
    get_catalog_aggregation,
    get_dynamic_catalog_summary,
    get_dynamic_model_keyword_map,
    get_fallback_recommendations,
)
from src.services.chat_history_service import create_pending_quote_in_supabase
from src.services.database import SessionLocal
from src.services.llm import get_llm
from src.services.rag.retrieval.models import RetrievalFilters
from src.services.rag_service import retrieve_catalog

logger = logging.getLogger(__name__)

PROMPTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts")
env = Environment(loader=FileSystemLoader(PROMPTS_DIR), autoescape=False)

# Pre-compile templates at module import time
EXTRACT_TEMPLATE = env.get_template("extract_criteria.jinja2")
COMPOSE_TEMPLATE = env.get_template("compose_response.jinja2")

_extract_structured_llm = None
_compose_structured_llm = None


def get_extract_structured_llm():
    global _extract_structured_llm
    if _extract_structured_llm is None:
        llm = get_llm(temperature=0.0)
        try:
            _extract_structured_llm = llm.with_structured_output(ExtractOutput, method="function_calling")
        except TypeError:
            _extract_structured_llm = llm.with_structured_output(ExtractOutput)
    return _extract_structured_llm


def get_compose_structured_llm():
    global _compose_structured_llm
    if _compose_structured_llm is None:
        llm = get_llm(temperature=0.2)
        try:
            _compose_structured_llm = llm.with_structured_output(ComposeOutput, method="function_calling")
        except TypeError:
            _compose_structured_llm = llm.with_structured_output(ComposeOutput)
    return _compose_structured_llm


class VehicleIncludeCriteria(BaseModel):
    budget_min: int | None = Field(default=None, description="Ngân sách tối thiểu bằng VNĐ (VD: 450000000 cho 450 triệu)")
    budget_max: int | None = Field(default=None, description="Ngân sách tối đa bằng VNĐ (VD: 600000000 cho 600 triệu)")
    seat_count: int | None = Field(default=None, description="Số chỗ ngồi (VD: 5, 7)")
    seat_counts: list[int] | None = Field(default=None, description="Danh sách các số chỗ ngồi mong muốn (VD: [4, 7])")
    drivetrain: str | None = Field(default=None, description="Hệ dẫn động: FWD (1 cầu trước) | RWD (1 cầu sau) | AWD (2 cầu toàn thời gian)")
    body_type: str | None = Field(default=None, description="Kiểu dáng thân xe: SUV | MPV | Sedan | Hatchback | Van")
    category: str | None = Field(default=None, description="Phân khúc xe: Personal | Service | Commercial | Bus | Luxury")
    min_range_km: float | None = Field(default=None, description="Tầm hoạt động tối thiểu (km)")
    min_power_kw: float | None = Field(default=None, description="Công suất tối thiểu (kW)")
    usage_purpose: str | None = Field(default=None, description="Mục đích sử dụng: family | service | commute | travel | cargo | ride_hailing | taxi")
    battery_preference: str | None = Field(default=None, description="Nhu cầu pin: rent (thuê pin) | buy (kèm pin/mua pin)")
    charging_condition: str | None = Field(default=None, description="Điều kiện sạc: home (tại nhà) | public_station (trạm sạc) | apartment (chung cư)")
    colors: list[str] | None = Field(default=None, description="Màu xe khách muốn tìm, ví dụ ['Đỏ', 'Trắng']")
    aggregation: str | None = Field(default=None, description="most_expensive | cheapest | longest_range | most_powerful | largest_trunk")
    target_user: str | None = Field(default=None, description="self | child | grandchild | spouse | parent | other")
    target_user_age_group: str | None = Field(default="unknown", description="infant_or_primary | secondary_student | highschool_student | adult | unknown")
    target_user_age_explicit: int | None = Field(default=None, description="Explicit age number in years (e.g. 12)")
    driver_type: str | None = Field(default=None, description="child_self_drive | parent_drive | self_drive")
    legal_safety_action: str | None = Field(default="none", description="none | ask_age | block_underage_moto | block_infant_moto | block_underage_car")
    vehicle_type_preference: str | None = Field(default="CAR", description="Loại xe: CAR | MOTORBIKE | BOTH")
    preferred_vehicle_line: str | None = Field(default=None, description="Dòng xe ưu tiên (nếu có)")
    target_model: str | None = Field(default=None, description="Mẫu xe cụ thể (VD: VF 5, VF 8...)")


class VehicleCriteria(BaseModel):
    include: VehicleIncludeCriteria = Field(default_factory=VehicleIncludeCriteria)
    exclude: Any | None = Field(default_factory=dict)

    def __init__(self, include: Any = None, exclude: Any = None, **kwargs):
        if include is not None or exclude is not None or not kwargs:
            super().__init__(include=include or VehicleIncludeCriteria(), exclude=exclude or {})
        else:
            super().__init__(include=VehicleIncludeCriteria(**kwargs), exclude={})


class ExtractOutput(BaseModel):
    intent: str = Field(default="vinfast_query", description="vinfast_query | out_of_scope | sensitive | toxic")
    action_type: str = Field(default="filter_candidates", description="greeting | collect_criteria | filter_candidates | compare_vehicles | recommend_vehicle | request_quote | book_test_drive | direct_answer | refusal")
    criteria: VehicleCriteria | None = Field(default_factory=VehicleCriteria)
    need_sql: bool = Field(default=False)
    need_rag: bool = Field(default=False)
    rag_query: str | None = Field(default=None)
    target_model: str | None = Field(default=None)
    demand_summary: str | None = Field(default=None, description="Tóm tắt ngắn gọn 1 câu về chân dung & nhu cầu khách hàng")
    direct_response: str | None = Field(default=None)
    refusal_message: str | None = Field(default=None)
    next_question: str | None = Field(default=None)


class ComposeOutput(BaseModel):
    next_question: str = Field(..., description="Câu trả lời tự nhiên, đầy đủ cho khách hàng. Nếu liệt kê danh sách các mẫu xe thì trình bày rõ ràng từng mẫu xe kèm giá và link chi tiết.")


class CustomerNeedsProfile(BaseModel):
    target_model: str | None = Field(default=None, description="Explicitly specified model code (e.g. vf-5)")
    seat_count: int | None = Field(default=None, description="Number of seats (e.g. 4, 5, 6, 7)")
    seat_counts: list[int] | None = Field(default=None, description="Multiple seat options (e.g. [4, 7])")
    drivetrain: str | None = Field(default=None, description="Drivetrain (AWD, FWD, RWD)")
    body_type: str | None = Field(default=None, description="Body type (SUV, MPV, Sedan, etc.)")
    category: str | None = Field(default=None, description="Category (Personal, Service, Commercial, Bus, Luxury)")
    min_range_km: float | None = Field(default=None, description="Minimum range in km")
    min_power_kw: float | None = Field(default=None, description="Minimum power in kW")
    budget_min: int | None = Field(default=None, description="Minimum budget in VND")
    budget_max: int | None = Field(default=None, description="Maximum budget in VND")
    aggregation: str | None = Field(default=None, description="most_expensive | cheapest | longest_range | most_powerful | largest_trunk")
    target_user: str | None = Field(default=None, description="self | child | grandchild | spouse | parent | other")
    target_user_age_group: str | None = Field(default="unknown", description="infant_or_primary | secondary_student | highschool_student | adult | unknown")
    target_user_age_explicit: int | None = Field(default=None, description="Explicit age number in years")
    driver_type: str | None = Field(default=None, description="child_self_drive | parent_drive | self_drive")
    legal_safety_action: str | None = Field(default="none", description="none | ask_age | block_underage_moto | block_infant_moto | block_underage_car")
    daily_distance_km: int | None = Field(default=None, description="Daily travel distance in km")
    charging_access: str | None = Field(default=None, description="Charging setup")
    charging_condition: str | None = Field(default=None, description="Charging condition")
    colors: list[str] = Field(default_factory=list, description="Preferred vehicle colors")
    usage_purpose: str | None = Field(default=None, description="Primary purpose: family, service, commute, travel, cargo, ride_hailing, taxi")
    battery_preference: str | None = Field(default=None, description="Battery preference: rent or buy")
    demand_summary: str | None = Field(default=None, description="Concise demand summary")
    vehicle_type_preference: str = Field(default="CAR", description="Preferred vehicle type (CAR, MOTORBIKE, BOTH, etc.)")
    is_complete: bool = Field(default=False, description="True when enough information gathered to make recommendation")
    missing_fields: list[str] = Field(default_factory=list)
    matching_count: int = Field(default=0, description="Count of vehicles matching current criteria in DB")



# Backwards compatibility aliases
DiscoveryOutput = ExtractOutput


def format_dialogue_history(messages: list[dict[str, Any]]) -> str:
    """Format dialogue history into text lines."""
    lines = []
    for m in messages:
        role = "Khách hàng" if m.get("role") in ("user", "human") else "Tư vấn viên"
        content = m.get("content", "")
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


def build_discovery_prompt(existing_summary: str = "", dialogue_history: list[dict[str, Any]] | None = None) -> str:
    """Build discovery prompt for backwards compatibility."""
    history_text = format_dialogue_history(dialogue_history or [])
    parts = []
    if existing_summary:
        parts.append(f"BẢN TÓM TẮT ĐÃ GHI NHẬN TỪ CÁC PHIÊN TRƯỚC:\n{existing_summary}")
    if history_text:
        parts.append(f"HỘI THOẠI MỚI CHƯA NẰM TRONG BẢN TÓM TẮT:\n{history_text}")
    return "\n\n".join(parts)


def decide_stage(matching_count: int, has_target_model: bool = False) -> tuple[bool, str]:
    if matching_count == 1:
        return True, "single_candidate"
    if matching_count == 0:
        return False, "zero_candidates"
    return False, "multiple_candidates"


def _normalize_model_code(raw_input: Any) -> str | None:
    if not raw_input:
        return None
    raw_m = str(raw_input).lower().strip()
    model_kw_map = get_dynamic_model_keyword_map()
    if raw_m in model_kw_map:
        return model_kw_map[raw_m]
    for pat, code in sorted(model_kw_map.items(), key=lambda x: len(x[0]), reverse=True):
        if pat == raw_m or (len(pat) >= 3 and pat in raw_m):
            return code
    return raw_m


def merge_criteria(
    old_profile: CustomerNeedsProfile,
    new_criteria: Any,
    target_model_override: str | None = None,
    extract_output: ExtractOutput | None = None,
) -> CustomerNeedsProfile:
    updated = old_profile.model_copy()
    if target_model_override:
        norm = _normalize_model_code(target_model_override)
        if norm:
            updated.target_model = norm

    def _merge_dict(data: dict):
        if data.get("budget_min") is not None:
            updated.budget_min = data["budget_min"]
        if data.get("budget_max") is not None:
            updated.budget_max = data["budget_max"]
        if data.get("seat_count") is not None:
            updated.seat_count = data["seat_count"]
        if data.get("seat_counts"):
            updated.seat_counts = [int(s) for s in data["seat_counts"] if s is not None]
        if data.get("drivetrain"):
            updated.drivetrain = str(data["drivetrain"])
        if data.get("body_type"):
            updated.body_type = str(data["body_type"])
        if data.get("category"):
            updated.category = str(data["category"])
        if data.get("min_range_km") is not None:
            updated.min_range_km = float(data["min_range_km"])
        if data.get("min_power_kw") is not None:
            updated.min_power_kw = float(data["min_power_kw"])
        if data.get("usage_purpose"):
            updated.usage_purpose = str(data["usage_purpose"])
        if data.get("battery_preference"):
            updated.battery_preference = str(data["battery_preference"])
        if data.get("charging_condition") or data.get("charging_access"):
            val = str(data.get("charging_condition") or data.get("charging_access"))
            updated.charging_condition = val
            updated.charging_access = val
        if data.get("colors"):
            updated.colors = _coerce_color_list(data["colors"])
        if data.get("vehicle_type_preference"):
            updated.vehicle_type_preference = str(data["vehicle_type_preference"])
        if data.get("daily_distance_km") is not None:
            updated.daily_distance_km = data["daily_distance_km"]
        if data.get("target_model"):
            norm = _normalize_model_code(data["target_model"])
            if norm:
                updated.target_model = norm
        elif data.get("preferred_vehicle_line") and not updated.target_model:
            norm = _normalize_model_code(data["preferred_vehicle_line"])
            if norm:
                updated.target_model = norm
        if data.get("aggregation"):
            updated.aggregation = str(data["aggregation"])
        if data.get("target_user"):
            updated.target_user = str(data["target_user"])
        if data.get("target_user_age_group"):
            updated.target_user_age_group = str(data["target_user_age_group"])
        if data.get("target_user_age_explicit") is not None:
            updated.target_user_age_explicit = int(data["target_user_age_explicit"])
        if data.get("driver_type"):
            updated.driver_type = str(data["driver_type"])
        if data.get("legal_safety_action"):
            updated.legal_safety_action = str(data["legal_safety_action"])

    if extract_output:
        if extract_output.demand_summary:
            updated.demand_summary = extract_output.demand_summary
        inc_obj = getattr(extract_output.criteria, "include", None)
        if isinstance(inc_obj, BaseModel):
            inc_dict = inc_obj.model_dump(exclude_unset=True)
        elif isinstance(inc_obj, dict):
            inc_dict = inc_obj
        else:
            inc_dict = {}
        _merge_dict(inc_dict)

    # Merge from new_criteria (Pydantic model or dict)
    inc = None
    if isinstance(new_criteria, BaseModel):
        if hasattr(new_criteria, "include"):
            inc_data = getattr(new_criteria, "include")
            inc = inc_data.model_dump(exclude_unset=True) if isinstance(inc_data, BaseModel) else inc_data
        else:
            inc = new_criteria.model_dump(exclude_unset=True)
    elif isinstance(new_criteria, dict):
        inc = new_criteria.get("include") if isinstance(new_criteria.get("include"), dict) else new_criteria

    if isinstance(inc, dict):
        _merge_dict(inc)

    return updated


def _coerce_color_list(value: Any) -> list[str]:
    """Normalize LLM/profile color output to a list of display names."""
    if isinstance(value, str):
        return [value.strip()] if value.strip() else []
    if not isinstance(value, (list, tuple, set)):
        return []

    colors: list[str] = []
    for item in value:
        if isinstance(item, dict):
            item = item.get("name") or item.get("color") or item.get("label")
        if item is not None and str(item).strip():
            colors.append(str(item).strip())
    return colors


# =============================================================================
# CACHE UTILS
# =============================================================================

def _make_query_key(extract: ExtractOutput) -> str:
    """Tạo hash duy nhất từ extract để cache query."""
    criteria_dict = extract.criteria.model_dump() if hasattr(extract.criteria, "model_dump") else extract.criteria
    data = {
        "criteria": criteria_dict,
        "need_sql": extract.need_sql,
        "need_rag": extract.need_rag,
        "rag_query": extract.rag_query,
        "target_model": extract.target_model,
        "action_type": extract.action_type,
    }
    normalized = json.dumps(data, sort_keys=True, ensure_ascii=False)
    return hashlib.md5(normalized.encode()).hexdigest()


# =============================================================================
# NODE CHÍNH (3 BƯỚC – KHÔNG CÒN EARLY RETURN Ở B3)
# =============================================================================

def _find_recent_vehicle_in_history(messages: list, chat_history: list, current_query: str = "") -> dict | None:
    """Quét ngược lịch sử hội thoại từ tin nhắn gần nhất để nhận diện chính xác dòng xe VinFast đang được thảo luận."""
    all_items = []
    if messages:
        all_items.extend(reversed(messages))
    if chat_history:
        all_items.extend(reversed(chat_history))

    is_awd_query = any(k in current_query.lower() for k in ("awd", "2 cầu", "hai cầu", "4 bánh"))
    model_map = get_dynamic_model_keyword_map()
    patterns = sorted(model_map.items(), key=lambda x: len(x[0]), reverse=True)

    for m in all_items:
        txt = m.get("content", "") if isinstance(m, dict) else getattr(m, "content", "")
        if not txt or not str(txt).strip():
            continue

        # 1. Check for explicit vehicle detail links: [Tên xe](/#detail-<id_or_code>)
        link_matches = re.findall(r"\[([^\]]+)\]\(/?#detail-([^\)]+)\)", txt)
        for link_text, car_id_or_code in link_matches:
            clean_name = re.sub(r"^(Khám phá|Xem|Chi tiết)\s+", "", link_text, flags=re.IGNORECASE).strip()
            matches = (
                fetch_cars_from_supabase(target_model=car_id_or_code)
                or fetch_cars_from_supabase(target_model=clean_name)
                or fetch_motorbikes_from_supabase(target_model=car_id_or_code)
                or fetch_motorbikes_from_supabase(target_model=clean_name)
            )
            if matches:
                if is_awd_query:
                    awd_match = [c for c in matches if (c.get("drivetrain") or "").upper() == "AWD" or "awd" in c.get("name", "").lower()]
                    if awd_match:
                        return awd_match[0]
                    if "vf-7" in matches[0].get("code", ""):
                        awd_vf7 = fetch_cars_from_supabase(target_model="vf-7-plus-awd---trần-kính-toàn-cảnh")
                        if awd_vf7:
                            return awd_vf7[0]
                return matches[0]

        # 2. Check for vehicle keywords in the text (cleaning boilerplate examples)
        cleaned = re.sub(r"\(như[^\)]*\)", "", txt, flags=re.IGNORECASE)
        cleaned = re.sub(r"\(ví dụ[^\)]*\)", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"vf\s*3\s*(-|đến|to)\s*vf\s*9", "", cleaned, flags=re.IGNORECASE)
        low = cleaned.lower()

        for pat, code in patterns:
            if pat in low:
                matches = fetch_cars_from_supabase(target_model=code) or fetch_motorbikes_from_supabase(target_model=code)
                if matches:
                    if is_awd_query:
                        if (matches[0].get("drivetrain") or "").upper() == "AWD" or "awd" in matches[0].get("name", "").lower():
                            return matches[0]
                        line_code = matches[0].get("code", "")
                        if "vf-7" in line_code:
                            awd_vf7 = fetch_cars_from_supabase(target_model="vf-7-plus-awd---trần-kính-toàn-cảnh")
                            if awd_vf7:
                                return awd_vf7[0]
                    return matches[0]

    if is_awd_query:
        awd_vf7 = fetch_cars_from_supabase(target_model="vf-7-plus-awd---trần-kính-toàn-cảnh")
        if awd_vf7:
            return awd_vf7[0]

    return None


@traceable(name="needs_discovery_node_v3")
async def needs_discovery_node(state: dict[str, Any]) -> dict[str, Any]:
    """
    LangGraph Node cho Needs Discovery (v3.2 All 5 Types Pass Through LLM Composer):
      B1. LLM Extract: bóc tách criteria + cờ SQL/RAG
      B2. Query DB: query Supabase + RAG (có state cache)
      B3. LLM Compose: tất cả 5 action_type đều được LLM compose thành câu trả lời tự nhiên
    """
    messages = state.get("messages", [])
    chat_history = state.get("chat_history", [])
    long_term_memory = state.get("long_term_memory", {})
    catalog_summary = state.get("catalog_summary") or get_dynamic_catalog_summary()
    user_id = state.get("user_id")
    user_email = state.get("user_email")

    effective_history = list(chat_history or [])
    last_message = ""
    if messages:
        last = messages[-1]
        last_message = last.get("content", "") if isinstance(last, dict) else getattr(last, "content", "")
        if not effective_history and len(messages) > 1:
            effective_history = messages[:-1]
    if not last_message and state.get("query"):
        last_message = state.get("query")

    profile_dict = state.get("user_profile") or {}
    profile = CustomerNeedsProfile(**profile_dict)

    # =====================================================================
    # B1. EXTRACT (LLM call #1)
    # =====================================================================
    extract = await _extract_criteria(
        last_message=last_message,
        chat_history=effective_history,
        long_term_memory=long_term_memory,
        catalog_summary=catalog_summary,
    )

    # Intent guard: If user explicitly asks for quote or test drive
    if any(k in last_message.lower() for k in ("báo giá", "xin báo giá", "lên báo giá", "gửi báo giá", "tôi xin báo giá")):
        extract.action_type = "request_quote"
        extract.need_sql = True
    elif any(k in last_message.lower() for k in ("lái thử", "đăng ký lái thử", "đặt lịch lái thử")):
        extract.action_type = "book_test_drive"
        extract.need_sql = True

    logger.info(f"[EXTRACT] intent={extract.intent}, action={extract.action_type}, target_model={extract.target_model}, sql={extract.need_sql}, rag={extract.need_rag}")

    # =====================================================================
    # B2. QUERY DB (conditional + state-based cache)
    # =====================================================================
    candidates = None
    rag_context = None
    discontinued_info = None
    aggregation_info = None
    legal_block = None
    cache_hit = False

    updated_profile = merge_criteria(profile, extract.criteria, target_model_override=extract.target_model, extract_output=extract)
    requested_colors = list(updated_profile.colors or [])

    if extract.action_type not in ("greeting", "refusal"):
        if extract.need_sql or extract.need_rag or bool(extract.target_model) or (extract.action_type in ("filter_candidates", "compare_vehicles", "recommend_vehicle", "request_quote", "book_test_drive", "direct_answer")):
            query_key = _make_query_key(extract)
            cached = state.get("last_query_result")

            # --- CACHE HIT ---
            if state.get("last_query_hash") == query_key and cached is not None:
                candidates = cached.get("candidates")
                rag_context = cached.get("rag_context")
                discontinued_info = cached.get("discontinued_info")
                legal_block = cached.get("legal_block")
                cache_hit = True
                car_cnt = len(candidates.get("cars", [])) if candidates else 0
                mb_cnt = len(candidates.get("motorbikes", [])) if candidates else 0
                logger.info(f"[CACHE HIT] key={query_key}, cars={car_cnt}, motorbikes={mb_cnt}")

            # --- CACHE MISS ---
            else:
                candidates, rag_context, discontinued_info, aggregation_info, legal_block = await _query_database(extract, updated_profile, last_message=last_message)
                car_cnt = len(candidates.get("cars", [])) if candidates else 0
                mb_cnt = len(candidates.get("motorbikes", [])) if candidates else 0
                logger.info(f"[CACHE MISS] key={query_key}, cars={car_cnt}, motorbikes={mb_cnt}")
    else:
        logger.info("[QUERY] SKIPPED (greeting/refusal)")
        aggregation_info = None
        legal_block = None

    # Flatten candidate list for LangGraph state compatibility
    flat_candidates = []
    if candidates:
        flat_candidates = (candidates.get("cars") or []) + (candidates.get("motorbikes") or [])
    updated_profile.matching_count = len(flat_candidates)

    # Action: request_quote
    action_payload = None
    if extract.action_type == "request_quote":
        # Resolve target car from extract, profile, or backwards scan of conversation history
        target_car = None
        target_m = extract.target_model or updated_profile.target_model
        if target_m:
            c_matches = fetch_cars_from_supabase(target_model=target_m) or fetch_motorbikes_from_supabase(target_model=target_m)
            if c_matches:
                target_car = c_matches[0]

        if not target_car:
            target_car = _find_recent_vehicle_in_history(messages, effective_history, current_query=last_message)

        if not target_car and flat_candidates and len(flat_candidates) == 1:
            target_car = flat_candidates[0]

        if target_car and target_car.get("name") and target_car.get("code"):
            v_name = target_car["name"]
            v_code = target_car["code"]
            v_price = target_car.get("base_price") or target_car.get("list_price") or 0
            updated_profile.target_model = v_code
            action_payload = {
                "type": "create_quote",
                "vehicle_id": v_code,
                "vehicle_name": v_name,
                "base_price": v_price,
                "status": "pending",
            }
        else:
            action_payload = None

    # Action: book_test_drive
    elif extract.action_type in ("book_test_drive", "request_test_drive") or any(k in last_message.lower() for k in ("lái thử", "đăng ký lái thử", "đặt lịch lái thử")):
        target_car = None
        target_m = extract.target_model or updated_profile.target_model
        if target_m:
            c_matches = fetch_cars_from_supabase(target_model=target_m) or fetch_motorbikes_from_supabase(target_model=target_m)
            if c_matches:
                target_car = c_matches[0]

        if not target_car:
            target_car = _find_recent_vehicle_in_history(messages, effective_history, current_query=last_message)

        if not target_car and flat_candidates and len(flat_candidates) == 1:
            target_car = flat_candidates[0]

        if target_car and target_car.get("name") and target_car.get("code"):
            v_name = target_car["name"]
            v_code = target_car["code"]
            updated_profile.target_model = v_code
            action_payload = {"type": "book_test_drive", "vehicle_id": v_code, "vehicle_name": v_name, "status": "pending"}
        else:
            action_payload = None

    # =====================================================================
    # SALES ADVISORY DECISION LOGIC: CONTEXT SUFFICIENCY & FALLBACK
    # =====================================================================
    has_target = bool(updated_profile.target_model)
    has_golden_trio = bool(
        (updated_profile.seat_count or updated_profile.seat_counts)
        and updated_profile.usage_purpose
        and (updated_profile.budget_max or updated_profile.budget_min)
    )
    # Candidate convergence only qualifies if user provided at least one of (seats, purpose) or specific model
    has_meaningful_constraint = bool(
        updated_profile.usage_purpose 
        or updated_profile.seat_count 
        or updated_profile.seat_counts
        or has_target
    )
    is_context_sufficient = bool(
        has_target
        or has_golden_trio
        or (0 < len(flat_candidates) <= 2 and has_meaningful_constraint)
        or (extract.action_type in ("request_quote", "book_test_drive", "direct_answer"))
    )

    missing_focus = None
    if not is_context_sufficient:
        if not updated_profile.usage_purpose:
            missing_focus = "purpose"
        elif not (updated_profile.budget_max or updated_profile.budget_min):
            missing_focus = "budget"
        elif not (updated_profile.seat_count or updated_profile.seat_counts):
            missing_focus = "seats"

    fallback_recommendations = None
    if (not flat_candidates) and (updated_profile.seat_count or updated_profile.seat_counts or updated_profile.budget_max):
        fallback_recommendations = get_fallback_recommendations(
            seat_count=updated_profile.seat_count,
            seat_counts=updated_profile.seat_counts,
            budget_max=updated_profile.budget_max,
            category=updated_profile.category,
        )
        if not fallback_recommendations.get("same_budget_cars") and not fallback_recommendations.get("same_seats_cars"):
            fallback_recommendations = None

    # =====================================================================
    # B3. COMPOSE (LLM call #2 – NO EARLY RETURN, ALWAYS RENDERS TEMPLATE)
    # =====================================================================
    response_text = await _compose_response(
        last_message=last_message,
        chat_history=effective_history,
        extract=extract,
        candidates=candidates,
        rag_context=rag_context,
        discontinued_info=discontinued_info,
        aggregation_info=aggregation_info,
        requested_colors=requested_colors,
        legal_block=legal_block,
        is_context_sufficient=is_context_sufficient,
        missing_focus=missing_focus,
        fallback_recommendations=fallback_recommendations,
    )

    # =====================================================================
    # BUILD RETURN (merge cache vào state)
    # =====================================================================
    is_complete = is_context_sufficient
    is_blocked = extract.intent in ("out_of_scope", "sensitive", "toxic") or (extract.action_type == "refusal")

    if is_blocked:
        next_stage = "BLOCKED"
    elif is_complete:
        next_stage = "RECOMMENDATION"
    else:
        next_stage = "NEEDS_DISCOVERY"

    result = {
        "messages": [AIMessage(content=response_text)],
        "current_stage": next_stage,
        "is_blocked": is_blocked,
        "is_context_sufficient": is_context_sufficient,
        "missing_focus": missing_focus,
        "response": response_text,
        "action": action_payload,
        "analysis": f"intent={extract.intent}, action={extract.action_type}, cache={'hit' if cache_hit else 'miss/skip'}",
        "user_profile": updated_profile.model_dump(),
        "candidate_cars": flat_candidates,
        "extracted_criteria": extract.criteria,
        # Structured observability fields used by evaluation and tracing. These
        # mirror decisions already made by the node and do not alter routing.
        "extract_result": extract.model_dump(mode="json"),
        "rag_context": rag_context,
        "query_results": flat_candidates,
        "evaluation_trace": {
            "catalog_lookup_used": candidates is not None,
            "rag_context_used": bool(rag_context),
            "cache_hit": cache_hit,
        },
    }

    # Lưu cache vào state nếu vừa query (cache miss)
    if not cache_hit and (extract.need_sql or extract.need_rag) and extract.action_type not in ("greeting", "refusal", "direct_answer"):
        result["last_query_hash"] = _make_query_key(extract)
        result["last_query_result"] = {
            "candidates": candidates,
            "rag_context": rag_context,
            "discontinued_info": discontinued_info,
        }
    else:
        if state.get("last_query_hash"):
            result["last_query_hash"] = state["last_query_hash"]
            result["last_query_result"] = state.get("last_query_result")

    return result


# =============================================================================
# B1. EXTRACT
# =============================================================================

async def _extract_criteria(
    last_message: str,
    chat_history: list,
    long_term_memory: dict,
    catalog_summary: str,
) -> ExtractOutput:
    structured_llm = get_extract_structured_llm()

    prompt = EXTRACT_TEMPLATE.render(
        catalog_summary=catalog_summary,
        chat_history=_fmt_history(chat_history, max_turns=3),
        long_term_memory=json.dumps(long_term_memory, ensure_ascii=False, indent=2) if long_term_memory else "{}",
        last_message=last_message,
    )

    if hasattr(structured_llm, "ainvoke"):
        result = await structured_llm.ainvoke([
            ("system", prompt),
            ("human", "Phân tích tin nhắn này và trả về JSON."),
        ])
    else:
        result = structured_llm.invoke([
            ("system", prompt),
            ("human", "Phân tích tin nhắn này và trả về JSON."),
        ])

    return result


# =============================================================================
# B2. QUERY (Pure Backend & Legal Safety Guard)
# =============================================================================

def check_legal_safety(
    last_message: str,
    extract: ExtractOutput,
    profile: CustomerNeedsProfile,
) -> dict | None:
    """
    4-Tier Legal Compliance & Safety Guardrail:
    - 0-10 years (infant / kindergarten / primary / infant_or_primary): Cannot operate any vehicle. Offer ISOFIX family cars or parent-driven vehicle.
    - 11-15 years (secondary school / under 16 / secondary_student): Cannot drive electric motorbikes. Offer DrgnFly e-bike or parent driving.
    - Child without age (ask_age): Clarify age/grade.
    - 16-17 years (highschool_student): Permitted to drive electric motorbikes.
    - >= 18 years (adult): Permitted to drive all vehicles.
    """
    msg_low = (last_message or "").lower()

    crit_obj = extract.criteria
    if hasattr(crit_obj, "model_dump"):
        crit_dict = crit_obj.model_dump()
    elif isinstance(crit_obj, dict):
        crit_dict = crit_obj
    else:
        crit_dict = {}
    include = crit_dict.get("include", {}) if isinstance(crit_dict.get("include"), dict) else {}

    target_user = include.get("target_user") or profile.target_user
    target_age_group = include.get("target_user_age_group") or profile.target_user_age_group or "unknown"
    explicit_age = include.get("target_user_age_explicit") or profile.target_user_age_explicit
    driver_type = include.get("driver_type") or profile.driver_type
    legal_action = include.get("legal_safety_action") or profile.legal_safety_action or "none"

    # 1. Explicit age override (exact number takes highest precedence)
    if explicit_age is not None:
        if explicit_age <= 10:
            target_age_group = "infant_or_primary"
        elif explicit_age <= 15:
            target_age_group = "secondary_student"
        elif explicit_age <= 17:
            target_age_group = "highschool_student"
        else:
            target_age_group = "adult"

    # 2. Check parent driving intent
    is_parent_driving = False
    if driver_type == "parent_drive":
        is_parent_driving = True
    elif re.search(r"(tôi\s*chở|bố\s*mẹ\s*chở|ba\s*mẹ\s*chở|mẹ\s*chở|bố\s*chở|đưa\s*đón|chở\s*con|chở\s*cháu|phụ\s*huynh\s*lái|tôi\s*lái|mua\s*để\s*chở)", msg_low):
        is_parent_driving = True

    # 3. Fallback semantic regex detection if age group is unknown
    if target_age_group == "unknown":
        if re.search(r"(sơ\s*sinh|em\s*bé|mầm\s*non|mẫu\s*giáo|cấp\s*1|tiểu\s*học|lớp\s*[12345]|\b[0-9]\s*tuổi|cháu\s*nhỏ)", msg_low):
            target_age_group = "infant_or_primary"
        elif re.search(r"(cấp\s*2|thcs|trung\s*học\s*cơ\s*sở|lớp\s*[6789]|1[12345]\s*tuổi|cháu\s*1[12345]|con\s*1[12345]|dưới\s*16\s*tuổi)", msg_low):
            target_age_group = "secondary_student"
        elif re.search(r"(cấp\s*3|thpt|trung\s*học\s*phổ\s*thông|lớp\s*(10|11|12)|1[67]\s*tuổi)", msg_low):
            target_age_group = "highschool_student"

    # TIER 1: Infant / Kindergarten / Primary (0-10 years)
    if target_age_group in ("infant_or_primary", "under_10"):
        return {
            "blocked": True,
            "action": "block_infant_moto",
            "reason": "Bé còn nhỏ (0-10 tuổi) chưa thể tự điều khiển bất kỳ phương tiện giao thông nào trên đường.",
            "suggested_products": ["vf-3", "vf-5"],
        }

    # TIER 2: Secondary School / Under 16 (11-15 years)
    if target_age_group in ("secondary_student", "under_16") and not is_parent_driving:
        return {
            "blocked": True,
            "action": "block_underage_moto",
            "reason": "Theo Luật Giao thông đường bộ, học sinh cấp 2 / người dưới 16 tuổi chưa được phép điều khiển xe máy điện.",
            "suggested_products": ["drgnfly"],
            "fallback_question": "Anh/chị mua để tự lái chở con đi học hay mua cho cháu tự đi ạ?",
        }

    # TIER 2.5: Ambiguous child driving ("mua cho con đi học" without age or level)
    if (target_user in ("child", "grandchild")) and target_age_group == "unknown" and not is_parent_driving:
        if legal_action == "ask_age" or re.search(r"(cho\s*con|cho\s*cháu|mua\s*cho\s*con|mua\s*cho\s*cháu)", msg_low):
            return {
                "blocked": True,
                "action": "ask_age",
                "reason": "Khách mua xe cho con/cháu nhưng chưa rõ độ tuổi hoặc cấp học.",
            }

    return None


async def _query_database(
    extract: ExtractOutput,
    profile: CustomerNeedsProfile,
    last_message: str = "",
) -> tuple[dict | None, str | None, dict | None, dict | None, dict | None]:
    crit_obj = extract.criteria
    if hasattr(crit_obj, "model_dump"):
        crit_dict = crit_obj.model_dump()
    elif isinstance(crit_obj, dict):
        crit_dict = crit_obj
    else:
        crit_dict = {}

    include = crit_dict.get("include", {}) if isinstance(crit_dict.get("include"), dict) else {}

    cars = []
    motorbikes = []
    rag_ctx = None
    discontinued_info = None

    # Check vehicle type preference
    vtype = profile.vehicle_type_preference
    if include.get("vehicle_type_preference"):
        vtype = include["vehicle_type_preference"]
    requested_colors = _coerce_color_list(include.get("colors")) or list(profile.colors or [])
    is_motorbike = (vtype == "MOTORBIKE")

    # --- P0 Legal Safety Check ---
    legal_block = check_legal_safety(last_message, extract, profile)

    # --- In-Memory Aggregation Calculation (0ms RAM Speed) ---
    agg_type = None
    if include.get("aggregation"):
        agg_type = str(include["aggregation"])
    elif profile.aggregation:
        agg_type = str(profile.aggregation)

    if not agg_type:
        raw_msg_lower = (extract.rag_query or "") + " " + (extract.demand_summary or "") + " " + last_message.lower()
        if any(k in raw_msg_lower for k in ("đắt nhất", "cao giá nhất", "mắc nhất", "max price", "highest price")):
            agg_type = "most_expensive"
        elif any(k in raw_msg_lower for k in ("rẻ nhất", "ít tiền nhất", "thấp nhất", "min price", "cheapest")):
            agg_type = "cheapest"
        elif any(k in raw_msg_lower for k in ("tầm xa nhất", "chạy xa nhất", "pin trâu nhất", "đi xa nhất", "longest range")):
            agg_type = "longest_range"
        elif any(k in raw_msg_lower for k in ("mạnh nhất", "công suất lớn nhất", "khỏe nhất", "most powerful")):
            agg_type = "most_powerful"
        elif any(k in raw_msg_lower for k in ("cốp to nhất", "cốp rộng nhất", "cốp lớn nhất", "largest trunk")):
            agg_type = "largest_trunk"

    # --- Seat Count Detection Fallback ---
    found_seats = [int(s) for s in re.findall(r"\b(2|4|5|7)\s*chỗ\b", last_message.lower())]
    if len(found_seats) > 1:
        seat_cnts = list(dict.fromkeys(found_seats))
        seat_cnt = None
        profile.seat_counts = seat_cnts
        profile.seat_count = None
    elif len(found_seats) == 1:
        seat_cnt = found_seats[0]
        seat_cnts = None
        profile.seat_count = seat_cnt
        profile.seat_counts = None
    else:
        seat_cnt = include.get("seat_count") or profile.seat_count
        seat_cnts = include.get("seat_counts") or profile.seat_counts

    # --- SQL Filter ---
    # 1. If comparing vehicles or query mentions multiple models, fetch all mentioned models
    query_str = (extract.rag_query or "") + " " + (profile.target_model or "")
    if extract.action_type == "compare_vehicles" or any(k in query_str.lower() for k in ("so sánh", "khác nhau", "khác gì", "chênh nhau", "mẫu nào", "với", "hay")):
        model_kw_map = get_dynamic_model_keyword_map()
        # Sort keywords longest first to prevent shorter names (e.g. 'vf 7') from shadowing longer ones ('vf mpv 7')
        known_models = sorted(model_kw_map.keys(), key=len, reverse=True)
        matched_keywords: list[str] = []
        found_models: list[str] = []
        low_q = query_str.lower()
        for km in known_models:
            if km in low_q and not any(km in existing for existing in matched_keywords):
                matched_keywords.append(km)
                canonical_code = model_kw_map[km]
                if canonical_code not in found_models:
                    found_models.append(canonical_code)
        if len(found_models) >= 2:
            matched_cars = fetch_cars_for_models(found_models, colors=requested_colors)
            matched_bikes = fetch_motorbikes_for_models(found_models, colors=requested_colors)
            if matched_cars:
                cars = matched_cars
            if matched_bikes:
                motorbikes = matched_bikes
            if not matched_cars:
                is_motorbike = True

    # 2. If target_model is specified and not already populated via multi-model
    if not cars and not motorbikes:
        if profile.target_model:
            cars = fetch_cars_from_supabase(target_model=profile.target_model, colors=requested_colors, aggregation=agg_type)
            motorbikes = fetch_motorbikes_from_supabase(target_model=profile.target_model, colors=requested_colors, aggregation=agg_type)
            if motorbikes and not cars:
                is_motorbike = True
        elif is_motorbike:
            motorbikes = fetch_motorbikes_from_supabase(
                budget_min=profile.budget_min,
                budget_max=profile.budget_max,
                target_model=profile.target_model,
                colors=requested_colors,
                aggregation=agg_type,
            )
        else:
            # Resolve category dynamically without sticky pollution from previous turns
            q_check = (last_message or "") + " " + (extract.rag_query or "")
            is_service_mention = any(k in q_check.lower() for k in ("dòng xe dịch vụ", "xe dịch vụ", "dịch vụ có mấy mẫu", "mẫu xe dịch vụ", "chạy taxi", "xe taxi", "green series", "chạy grab"))
            is_personal_mention = any(k in q_check.lower() for k in ("xe gia đình", "xe cá nhân", "đi làm", "du lịch"))

            if is_service_mention:
                cat = "Service"
                profile.category = "Service"
            elif is_personal_mention:
                cat = "Personal"
                profile.category = "Personal"
            elif include.get("category"):
                cat = str(include["category"])
                profile.category = cat
            else:
                # General query: do not constrain to previous session's category
                cat = None
                profile.category = None

            # Protect against hallucinated service purpose (e.g. from '500Đ' or generic budget queries)
            if not is_service_mention and profile.usage_purpose == "service":
                profile.usage_purpose = None

            cars = fetch_cars_from_supabase(
                budget_min=profile.budget_min,
                budget_max=profile.budget_max,
                seat_count=seat_cnt,
                seat_counts=seat_cnts or profile.seat_counts,
                target_model=profile.target_model,
                colors=requested_colors,
                usage_purpose=profile.usage_purpose,
                drivetrain=profile.drivetrain,
                body_type=profile.body_type,
                category=cat,
                min_range_km=profile.min_range_km,
                min_power_kw=profile.min_power_kw,
                aggregation=agg_type,
            )

    # Build aggregation_info directly from the filtered results (guaranteed to match criteria)
    aggregation_info = None
    if agg_type:
        target_list = motorbikes if is_motorbike else cars
        if target_list:
            agg_vehicle = target_list[0]
            car_id = agg_vehicle.get("id") or agg_vehicle.get("car_id") or agg_vehicle.get("code") or ""
            aggregation_info = {
                "aggregation_type": agg_type,
                "name": agg_vehicle.get("name") or agg_vehicle.get("model_name"),
                "version": agg_vehicle.get("version"),
                "price": agg_vehicle.get("base_price") or agg_vehicle.get("list_price"),
                "seats": agg_vehicle.get("seat_count") or agg_vehicle.get("seats"),
                "range_km": agg_vehicle.get("range_km"),
                "power_kw": agg_vehicle.get("power_kw"),
                "detail_url": agg_vehicle.get("detail_url") or f"/#detail-{car_id}",
            }

    # --- RAG ---
    if extract.need_rag or (extract.action_type == "compare_vehicles"):
        rag_query_text = extract.rag_query
        if not rag_query_text:
            items = motorbikes if is_motorbike else cars
            cand_names = [r.get("name") for r in items[:3] if r.get("name")]
            if cand_names:
                rag_query_text = f"So sánh thông số và tính năng {' và '.join(cand_names)}"
            else:
                rag_query_text = "Thông số và tính năng xe điện VinFast"

        try:
            cand_list = motorbikes if is_motorbike else cars
            cand_ids = [str(c.get("id")) for c in (cand_list or []) if c.get("id")]
            v_filters = RetrievalFilters(
                vehicle_type="motorbike" if is_motorbike else "car",
                vehicle_ids=tuple(cand_ids) if cand_ids and len(cand_ids) <= 4 else (),
            )
            async with SessionLocal() as db:
                rag_resp = await retrieve_catalog(
                    db,
                    rag_query_text,
                    filters=v_filters,
                )
                if rag_resp.snippets:
                    snippets_text = [f"- [{s.model_name}] ({s.chunk_type}): {s.text}" for s in rag_resp.snippets]
                    rag_ctx = "\n".join(snippets_text)
        except Exception as e:
            logger.warning(f"RAG failed: {e}")

    # Check if target vehicle is discontinued (is_active == False)
    all_matched = (cars or []) + (motorbikes or [])
    inactive_matches = [v for v in all_matched if v.get("is_active") is False]
    if inactive_matches:
        v = inactive_matches[0]
        v_specs = v.get("specs") or v.get("additional_specs") or {}
        discontinued_info = {
            "model_name": v.get("name") or v.get("model_name"),
            "reason": v_specs.get("discontinued_reason", "Mẫu xe này đã chính thức dừng sản xuất/kinh doanh trên thị trường."),
            "alternative_model": v_specs.get("alternative_model", "các dòng xe điện thế mới của VinFast"),
        }

    if legal_block:
        action = legal_block.get("action")
        if action == "block_underage_moto":
            motorbikes = fetch_motorbikes_for_models(["drgnfly"])
        elif action == "block_infant_moto":
            cars = fetch_cars_for_models(["vf 3", "vf 5"])
            motorbikes = fetch_motorbikes_for_models(["amio", "feliz s"])

    candidates = {"cars": cars, "motorbikes": motorbikes} if (cars or motorbikes) else None
    return candidates, rag_ctx, discontinued_info, aggregation_info, legal_block



# =============================================================================
# B3. COMPOSE (Luôn chạy LLM, render đầy đủ biến)
# =============================================================================

async def _compose_response(
    last_message: str,
    chat_history: list,
    extract: ExtractOutput,
    candidates: dict | None,
    rag_context: str | None,
    discontinued_info: dict | None,
    aggregation_info: dict | None = None,
    requested_colors: list[str] | None = None,
    legal_block: dict | None = None,
    is_context_sufficient: bool = False,
    missing_focus: str | None = None,
    fallback_recommendations: dict | None = None,
) -> str:
    # 1. Tính toán các biến cho template
    is_empty_candidates = (candidates is None) or (not candidates.get("cars") and not candidates.get("motorbikes"))
    direct_response_hint = extract.direct_response if extract.action_type in ("greeting", "refusal") else None
    refusal_message_hint = extract.refusal_message

    candidates_json = None
    personal_cars_json = None
    service_cars_json = None
    if candidates:
        clean_list = []
        car_candidates = candidates.get("cars") or []
        if not requested_colors and len(car_candidates) > 4:
            selected = []
            seen_lines = set()
            # 1. First pass: ensure every distinct model line gets a representative
            for c in car_candidates:
                c_name = (c.get("name") or "").lower()
                c_code = (c.get("code") or "").lower()
                line_key = None
                for prefix in ("vf mpv 7", "vf 2", "vf 3", "vf 5", "vf 6", "vf 7", "vf 8", "vf 9", "minio", "herio", "nerio", "limo", "ec van", "ebus"):
                    if prefix in c_name or prefix.replace(" ", "-") in c_code:
                        line_key = prefix
                        break
                if not line_key:
                    line_key = c_code

                if line_key not in seen_lines:
                    seen_lines.add(line_key)
                    selected.append(c)
            # 2. Second pass: only if fewer than 4 distinct model lines, add more trims up to 6 total
            if len(seen_lines) < 4:
                for c in car_candidates:
                    if len(selected) >= 6:
                        break
                    if c not in selected:
                        selected.append(c)
            # Group: Personal cars first (sorted by price), then Service cars
            personal_cars = [c for c in selected if (c.get("category") or "").lower() == "personal"]
            service_cars = [c for c in selected if (c.get("category") or "").lower() == "service"]
            car_candidates = (personal_cars + service_cars)[:8]

        def _fmt_car_item(c):
            car_id = c.get("id") or c.get("car_id") or c.get("code") or ""
            return {
                "type": "car",
                "name": c.get("name") or c.get("model_name"),
                "version": c.get("version"),
                "category": c.get("category"),
                "body_type": c.get("body_type"),
                "drivetrain": c.get("drivetrain"),
                "price": c.get("base_price") or c.get("list_price"),
                "seats": c.get("seat_count") or c.get("seats"),
                "range_km": c.get("range_km"),
                "power_kw": c.get("power_kw"),
                "torque_nm": c.get("torque_nm"),
                "battery": {
                    "usable_kwh": c.get("battery_kwh") or c.get("usable_battery_capacity"),
                    "type": c.get("battery_type"),
                },
                "dimensions_mm": c.get("dimensions"),
                "ground_clearance_mm": c.get("ground_clearance_mm"),
                "trunk_liters": c.get("trunk_liters"),
                "safety": {
                    "airbags": c.get("airbags"),
                    "adas": c.get("adas"),
                },
                "colors": c.get("colors") or [],
                "detail_url": c.get("detail_url") or f"/#detail-{car_id}",
            }

        p_list = [c for c in car_candidates if (c.get("category") or "").lower() == "personal"]
        s_list = [c for c in car_candidates if (c.get("category") or "").lower() == "service"]
        personal_cars_json = None
        service_cars_json = None
        if p_list and s_list:
            personal_cars_json = json.dumps([_fmt_car_item(c) for c in p_list], ensure_ascii=False, indent=2)
            service_cars_json = json.dumps([_fmt_car_item(c) for c in s_list], ensure_ascii=False, indent=2)

        for c in car_candidates:
            clean_list.append(_fmt_car_item(c))
        for m in (candidates.get("motorbikes") or [])[:3]:
            bike_id = m.get("id") or m.get("motorbike_id") or m.get("code") or "feliz-s"
            clean_list.append({
                "type": "motorbike",
                "name": m.get("name") or m.get("model_name"),
                "version": m.get("version"),
                "price": m.get("base_price") or m.get("list_price"),
                "range_km": m.get("range_km"),
                "power_w": m.get("power_w"),
                "max_speed_kmh": m.get("max_speed_kmh"),
                "charging_time_minutes": m.get("charging_time_minutes"),
                "battery_type": m.get("battery_type"),
                "colors": m.get("colors") or [],
                "detail_url": m.get("detail_url") or f"/#detail-{bike_id}",
            })
        if clean_list:
            candidates_json = json.dumps(clean_list, ensure_ascii=False, indent=2)

    aggregation_json = None
    if aggregation_info:
        aggregation_json = json.dumps(aggregation_info, ensure_ascii=False, indent=2)

    fallback_json = None
    if fallback_recommendations:
        fb_formatted = {}
        if fallback_recommendations.get("same_budget_cars"):
            fb_formatted["same_budget_cars"] = [
                {
                    "name": c.get("name"),
                    "seats": c.get("seats"),
                    "price": c.get("base_price"),
                    "detail_url": c.get("detail_url") or f"/#detail-{c.get('code') or c.get('id')}",
                }
                for c in fallback_recommendations["same_budget_cars"]
            ]
        if fallback_recommendations.get("same_seats_cars"):
            fb_formatted["same_seats_cars"] = [
                {
                    "name": c.get("name"),
                    "seats": c.get("seats"),
                    "price": c.get("base_price"),
                    "detail_url": c.get("detail_url") or f"/#detail-{c.get('code') or c.get('id')}",
                }
                for c in fallback_recommendations["same_seats_cars"]
            ]
        if fb_formatted:
            fallback_json = json.dumps(fb_formatted, ensure_ascii=False, indent=2)

    # 2. Render pre-compiled Jinja2 template
    prompt = COMPOSE_TEMPLATE.render(
        action_type=extract.action_type,
        discontinued_info=discontinued_info,
        is_empty_candidates=is_empty_candidates,
        direct_response_hint=direct_response_hint,
        refusal_message_hint=refusal_message_hint,
        candidates_json=candidates_json,
        personal_cars_json=personal_cars_json,
        service_cars_json=service_cars_json,
        aggregation_json=aggregation_json,
        fallback_json=fallback_json,
        is_context_sufficient=is_context_sufficient,
        missing_focus=missing_focus,
        legal_block=legal_block,
        rag_context=rag_context,
        chat_history=_fmt_history(chat_history, max_turns=3),
        last_message=last_message,
    )

    # 3. Invoke LLM for natural, complete response
    llm = get_llm(temperature=0.2)
    if type(llm).__name__ in ("MockChatModel", "SmartMockChatLLM"):
        structured_llm = get_compose_structured_llm()
        result = await structured_llm.ainvoke([("system", prompt), ("human", "Viết câu trả lời cho khách hàng.")])
        return result.next_question

    if hasattr(llm, "ainvoke"):
        result = await llm.ainvoke([
            ("system", prompt),
            ("human", "Viết câu trả lời cho khách hàng."),
        ])
    else:
        result = llm.invoke([
            ("system", prompt),
            ("human", "Viết câu trả lời cho khách hàng."),
        ])

    text = result.content if hasattr(result, "content") else str(result)
    return text.strip()


# =============================================================================
# UTILS
# =============================================================================

def _fmt_history(chat_history: list, max_turns: int = 3) -> str:
    lines = []
    for turn in chat_history[-max_turns:]:
        if isinstance(turn, dict):
            role = turn.get("role", "user")
            content = turn.get("content", "")
        else:
            role = "user" if getattr(turn, "type", "") == "human" else "assistant"
            content = getattr(turn, "content", "")
        lines.append(f"{role.upper()}: {content}")
    return "\n".join(lines) or "(Chưa có hội thoại trước)"
