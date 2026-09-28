"""Single-Pass Direct Answer Node for VinFast AI Advisor.
Extracts models directly, queries Supabase SQL + RAG in 1 pass, and composes grounded response via LLM.
"""

from __future__ import annotations

import logging
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from src.agents.state import AgentState
from src.services.catalog_service import (
    fetch_cars_for_models,
    fetch_cars_from_supabase,
    fetch_motorbikes_for_models,
    fetch_motorbikes_from_supabase,
    get_catalog_aggregation,
    get_dynamic_model_keyword_map,
)
from src.services.database import SessionLocal
from src.services.llm import get_llm
from src.services.rag.retrieval.models import RetrievalFilters
from src.services.rag_service import retrieve_catalog

logger = logging.getLogger(__name__)

DIRECT_ANSWER_SYSTEM_PROMPT = """Bạn là chuyên viên tư vấn cao cấp của VinFast.
Nhiệm vụ: Trả lời chính xác, trung thực và tự nhiên câu hỏi của khách hàng dựa trên DỮ LIỆU THẬT được cung cấp.

QUY TẮC PHÁP LÝ BẮT BUỘC (ĐỘ ƯU TIÊN CAO NHẤT):
- Theo Luật Giao thông đường bộ: Mọi dòng xe máy điện VinFast (kể cả bản không cần bằng lái như Amio, Motio, Evo 200 Lite...) CHỈ dành cho người từ ĐỦ 16 TUỔI TRỞ LÊN.
- Nếu khách hàng đề cập "học sinh cấp 2", "THCS", "lớp 6-9", "con 11-15 tuổi", "dưới 16 tuổi" tự đi/tự lái: TUYỆT ĐỐI KHÔNG tư vấn xe máy điện. BẮT BUỘC nhắc nhở quy định pháp luật về độ tuổi, sau đó gợi ý mẫu xe đạp trợ lực điện hợp pháp [Khám phá VinFast VF DrgnFly eBike](/#detail-vf-drgnfly) hoặc xác nhận lại xem bố mẹ có mua để tự lái đưa đón con không.

Quy tắc cốt lõi:
1. Độ chính xác 100%: Dùng chính xác giá tiền, công suất, quãng đường, dung tích cốp từ CSDL được cấp bên dưới.
2. Gắn link xem chi tiết xe: Khi nhắc đến, tư vấn hoặc so sánh bất kỳ dòng xe nào, BẮT BUỘC gắn link markdown xem chi tiết: `[Khám phá <Tên xe>](/#detail-<mã_xe>)` (ví dụ: `[Khám phá VinFast VF 3](/#detail-vf-3)`). TUYỆT ĐỐI dùng link tương đối `/#detail-...`.
3. Báo giá, chi phí lăn bánh & TCO: Nếu khách hỏi về báo giá, chi phí lăn bánh hoặc tổng chi phí sở hữu (TCO), hãy đưa ra một KHOẢNG ƯỚC CHỪNG RỘNG HƠN quanh con số đó (ví dụ: khoảng 240 - 275 triệu đồng tùy tỉnh thành và gói pin). Nếu khách chưa để lại số điện thoại trong hội thoại, hãy lịch sự xin số điện thoại để chuyên viên tư vấn liên hệ gửi bảng chiết tính chi tiết và ưu đãi.
4. So sánh xe: Nếu khách so sánh 2+ xe, trình bày dạng bảng rõ ràng (Giá, Công suất, Quãng đường/pin, Kích thước/Ghế) kèm link chi tiết của từng xe và phân tích ngắn gọn ưu/nhược điểm từng bản.
5. Xe đã ngừng kinh doanh: Nếu khách hỏi xe ngừng bán (Ludo, Tempest, Impes, Klara A1/A2, Fadil, Lux...), giải thích rõ lý do hoàn thành vòng đời và nhiệt tình giới thiệu mẫu xe điện thế hệ mới thay thế kèm link `/#detail-...`.
6. Giọng điệu: Tự nhiên, ấm áp, xưng "em" và gọi "anh/chị"."""


def _extract_mentioned_models(query: str) -> list[str]:
    """Fast regex/keyword matching for VinFast car and motorbike models."""
    q_lower = query.lower()
    keyword_map = get_dynamic_model_keyword_map()
    matched = []
    
    # Priority order longest match first
    for kw in sorted(keyword_map.keys(), key=len, reverse=True):
        if kw in q_lower:
            model = keyword_map[kw]
            if model not in matched:
                matched.append(model)
                
    return matched


async def direct_answer_node(state: AgentState) -> dict[str, Any]:
    """Single-Pass Direct Answer Node (~800-1200ms, 1 LLM call + SQL/RAG)."""
    raw_messages = list(state.get("messages") or [])
    query = state.get("query", "").strip()
    
    messages: list[Any] = []
    for m in raw_messages:
        if isinstance(m, (HumanMessage, AIMessage, SystemMessage)):
            messages.append(m)
        elif isinstance(m, dict):
            role = m.get("role")
            content = str(m.get("content") or "")
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))
            elif role == "system":
                messages.append(SystemMessage(content=content))

    if not messages and query:
        messages = [HumanMessage(content=query)]

    mentioned_models = _extract_mentioned_models(query)
    q_low = query.lower()

    # Detect domain intent
    is_motorbike_query = any(k in q_low for k in ("xe máy", "xe may", "xe máy điện", "scooter", "hai bánh", "2 bánh", "xe 2 bánh", "xe dap", "xe đạp", "ebike", "e-bike", "drgnfly", "motio", "amio", "evo", "feliz", "klara", "vento", "theon"))
    is_car_query = any(k in q_low for k in ("ô tô", "oto", "xe hơi", "suv", "sedan", "4 bánh", "xe 4 bánh", "tải van", "xe buýt", "car", "mpv"))
    is_policy_query = any(k in q_low for k in ("thuê pin", "chính sách pin", "đổi pin", "mua pin", "trạm sạc", "sạc pin", "bảo hành", "bảo dưỡng", "tổng đài", "showroom", "đại lý", "hậu mãi", "cứu hộ", "phí sạc", "trụ sạc", "tco", "lăn bánh"))
    is_service_query = any(k in q_low for k in ("dịch vụ", "taxi", "chạy dịch vụ", "green series"))

    # 1. Fetch Real Data from In-Memory Catalog Cache (Domain-Aware, No Blind Car Fallback)
    candidates: list[dict[str, Any]] = []
    try:
        if mentioned_models:
            cars = fetch_cars_for_models(mentioned_models)
            mbs = fetch_motorbikes_for_models(mentioned_models)
            candidates = cars + mbs
        else:
            agg_type = None
            if any(k in q_low for k in ("đắt nhất", "cao giá nhất", "mắc nhất", "max price")):
                agg_type = "most_expensive"
            elif any(k in q_low for k in ("rẻ nhất", "ít tiền nhất", "thấp nhất", "min price")):
                agg_type = "cheapest"
            elif any(k in q_low for k in ("tầm xa nhất", "chạy xa nhất", "pin trâu nhất", "đi xa nhất")):
                agg_type = "longest_range"
            elif any(k in q_low for k in ("mạnh nhất", "công suất lớn nhất", "khỏe nhất")):
                agg_type = "most_powerful"
            elif any(k in q_low for k in ("cốp to nhất", "cốp rộng nhất", "cốp lớn nhất")):
                agg_type = "largest_trunk"

            if agg_type:
                agg_v_type = "MOTORBIKE" if is_motorbike_query and not is_car_query else "CAR"
                seat_cnt = 7 if any(k in q_low for k in ("7 chỗ", "7-chỗ", "7 cho")) else (5 if any(k in q_low for k in ("5 chỗ", "5-chỗ", "5 cho")) else (4 if any(k in q_low for k in ("4 chỗ", "4-chỗ", "4 cho")) else None))
                cat = "Service" if is_service_query else None
                agg_vehicle = get_catalog_aggregation(agg_type, vehicle_type=agg_v_type, seat_count=seat_cnt, category=cat)
                if agg_vehicle:
                    candidates = [agg_vehicle]
            elif is_service_query and not is_motorbike_query:
                # Service passenger cars (Green Series)
                candidates = fetch_cars_from_supabase(category="Service")[:4]
            elif is_motorbike_query and not is_car_query and not is_policy_query:
                # Motorbike query without model name: fetch representative motorbikes
                candidates = fetch_motorbikes_from_supabase()[:4]
            elif is_car_query and not is_motorbike_query and not is_policy_query:
                # Car query without model name: fetch representative cars
                candidates = fetch_cars_from_supabase()[:4]
            # When query is policy/charging/battery/warranty without vehicle target, keep candidates empty
            # so prompt is not polluted with unrelated vehicles.
    except Exception as e:
        logger.warning(f"Error fetching SQL data in direct_answer: {e}")

    # 2. Build RAG Filters and Fetch Grounded Context
    rag_context = ""
    try:
        # Determine RAG filters: scope to vehicle_ids and vehicle_type
        v_ids: list[str] = []
        for c in candidates:
            c_id = str(c.get("id") or c.get("car_id") or c.get("motorbike_id") or c.get("code") or "").strip()
            if c_id:
                v_ids.append(c_id)

        rag_v_type: str | None = None
        if candidates:
            all_mbs = all("motor_type" in c or c.get("type") == "motorbike" or c.get("category") == "Scooter" for c in candidates)
            all_cars = all("seats" in c or c.get("type") == "car" or c.get("category") in ("Personal", "Service", "Commercial", "Bus", "Luxury") for c in candidates)
            if all_mbs:
                rag_v_type = "motorbike"
            elif all_cars:
                rag_v_type = "car"
        elif is_motorbike_query and not is_car_query:
            rag_v_type = "motorbike"
        elif is_car_query and not is_motorbike_query:
            rag_v_type = "car"

        filters: RetrievalFilters | None = None
        if v_ids:
            filters = RetrievalFilters(vehicle_type=rag_v_type, vehicle_ids=tuple(v_ids))  # type: ignore
        elif rag_v_type:
            filters = RetrievalFilters(vehicle_type=rag_v_type)  # type: ignore

        async with SessionLocal() as db:
            rag_res = await retrieve_catalog(db, query, filters=filters)
            if rag_res and rag_res.context:
                rag_context = rag_res.context
    except Exception as e:
        logger.warning(f"Error fetching RAG data in direct_answer: {e}")

    # 3. LLM 1-Pass Compose
    context_parts = []
    if candidates:
        context_parts.append(f"--- DỮ LIỆU XE TỪ CSDL SUPABASE ---\n{candidates}")
    if rag_context:
        context_parts.append(f"--- THÔNG TIN RAG CHI TIẾT ---\n{rag_context}")
    context_str = "\n\n".join(context_parts) if context_parts else "--- KHÔNG CÓ DỮ LIỆU ĐẶC THÙ (DÙNG KIẾN THỨC CHUẨN VINFAST) ---"

    try:
        llm = get_llm(temperature=0.2)
        formatted_messages = [
            SystemMessage(content=f"{DIRECT_ANSWER_SYSTEM_PROMPT}\n\n{context_str}")
        ] + messages
        response = await llm.ainvoke(formatted_messages)
        ai_text = response.content.strip()
    except Exception as e:
        logger.warning(f"Fallback direct answer compose: {e}")
        ai_text = f"Dạ em đã tra cứu thông tin cho anh/chị. Dưới đây là các thông tin chi tiết: {candidates or rag_context}"

    # 4. Update user_profile so multi-turn context is preserved
    user_profile = dict(state.get("user_profile") or {})
    if mentioned_models:
        user_profile["target_model"] = mentioned_models[0]
        recent = list(user_profile.get("recent_models") or [])
        for m in mentioned_models:
            if m not in recent:
                recent.append(m)
        user_profile["recent_models"] = recent[-5:]
    elif candidates and len(candidates) == 1:
        c_code = candidates[0].get("code") or candidates[0].get("id")
        if c_code:
            user_profile["target_model"] = str(c_code)

    if is_motorbike_query and not is_car_query:
        user_profile["vehicle_type_preference"] = "MOTORBIKE"
    elif is_car_query and not is_motorbike_query:
        user_profile["vehicle_type_preference"] = "CAR"
    elif candidates:
        has_car = any("seats" in c or c.get("type") == "car" or c.get("category") in ("Personal", "Service", "Commercial", "Bus", "Luxury") for c in candidates)
        has_bike = any("motor_type" in c or c.get("type") == "motorbike" or c.get("category") == "Scooter" for c in candidates)
        if has_car and not has_bike:
            user_profile["vehicle_type_preference"] = "CAR"
        elif has_bike and not has_car:
            user_profile["vehicle_type_preference"] = "MOTORBIKE"

    if is_service_query:
        user_profile["category"] = "Service"
        user_profile["usage_purpose"] = "service"

    return {
        "current_stage": "DIRECT_ANSWER",
        "response": ai_text,
        "messages": messages + [AIMessage(content=ai_text)],
        "candidate_cars": candidates,
        "user_profile": user_profile,
        "is_blocked": False,
    }
