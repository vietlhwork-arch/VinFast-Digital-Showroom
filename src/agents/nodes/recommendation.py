"""AI Recommendation & Reasoning Engine Node for VinFast AI Advisor Agent.

Synthesizes user profile, dynamic Supabase DB catalog queries (car_catalog & motorbike_catalog),
and TCO calculator results to generate personalized vehicle recommendations with
multi-turn Dialogue State Tracking (DST) & legal disclaimers (ADR 0003, ADR 0005).
"""

from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from src.agents.state import AgentState
from src.config import get_settings
from src.services.catalog_service import (
    fetch_cars_for_models,
    fetch_cars_from_supabase,
    fetch_motorbikes_for_models,
    fetch_motorbikes_from_supabase,
    get_dynamic_model_keyword_map,
)
from src.services.llm import extract_text_from_content, get_llm
from src.services.tco_calculator import TCOCalculationRequest, calculate_tco

settings = get_settings()


def select_best_vehicle_candidates(profile: dict[str, Any]) -> list[dict[str, Any]]:
    """Filter and select top 1-3 vehicle candidates by querying Supabase Cloud catalog dynamically."""
    pref = profile.get("vehicle_type_preference", "CAR")
    target_model = profile.get("target_model")
    budget_min = profile.get("budget_min")
    budget_max = profile.get("budget_max")
    seat_count = profile.get("seat_count")

    if pref == "MOTORBIKE":
        candidates = fetch_motorbikes_from_supabase(
            budget_min=budget_min,
            budget_max=budget_max,
            target_model=target_model,
            colors=profile.get("colors"),
        )
    else:
        candidates = fetch_cars_from_supabase(
            budget_min=budget_min,
            budget_max=budget_max,
            seat_count=seat_count,
            seat_counts=profile.get("seat_counts"),
            target_model=target_model,
            colors=profile.get("colors"),
            usage_purpose=profile.get("usage_purpose"),
            drivetrain=profile.get("drivetrain"),
            body_type=profile.get("body_type"),
            category=profile.get("category"),
            min_range_km=profile.get("min_range_km"),
            min_power_kw=profile.get("min_power_kw"),
        )

    if not target_model and (not budget_max or budget_max >= 1_000_000_000):
        candidates = sorted(candidates, key=lambda x: x.get("base_price", 0), reverse=True)

    if target_model and candidates:
        t_model_lower = str(target_model).lower().strip()
        t_clean = t_model_lower.replace("-", " ")
        # 1. Exact or substring match in name or code
        exact_matches = [c for c in candidates if t_clean in c["name"].lower() or t_model_lower in c["code"].lower()]
        if exact_matches:
            return exact_matches[:1]

        # 2. Specific trim matching (e.g. Plus vs Eco)
        if "plus" in t_model_lower:
            plus_matches = [c for c in candidates if "plus" in c["name"].lower() or "plus" in c["code"].lower()]
            if plus_matches:
                return plus_matches[:1]
        elif "eco" in t_model_lower:
            eco_matches = [c for c in candidates if "eco" in c["name"].lower() or "eco" in c["code"].lower()]
            if eco_matches:
                return eco_matches[:1]

    return candidates[:1]


def recommendation_node(state: AgentState) -> dict[str, Any]:
    """LangGraph Node for AI Vehicle Recommendation & TCO Calculation with DST State Tracking."""
    profile = state.get("user_profile") or {}
    pref = profile.get("vehicle_type_preference", "CAR")
    daily_km = profile.get("daily_distance_km") or 30
    monthly_km = daily_km * 30
    query = state.get("query") or ""
    query_lower = query.lower()
    provided_views = list(state.get("provided_views") or [])

    # Check if user requests detailed breakdown OR overview was already sent
    is_detail_request = any(k in query_lower for k in ["báo giá chi tiết", "chi tiết", "phí lăn bánh chi tiết", "bóc tách", "thủ tục", "lệ phí"])
    is_detailed_mode = is_detail_request or ("OVERVIEW_SENT" in provided_views)

    is_comparison_query = any(k in query_lower for k in ["so sánh", "khác nhau", "hơn kém", "khác gì", "nên mua xe nào", "xe nào hơn", "so với"])

    # Dynamically extract mentioned models using catalog keywords
    model_kw_map = get_dynamic_model_keyword_map()
    known_models = sorted(model_kw_map.keys(), key=len, reverse=True)
    matched_keywords: list[str] = []
    mentioned_models: list[str] = []
    for km in known_models:
        if km in query_lower and not any(km in existing for existing in matched_keywords):
            matched_keywords.append(km)
            code = model_kw_map[km]
            if code not in mentioned_models:
                mentioned_models.append(code)

    if (is_comparison_query or len(mentioned_models) >= 2) and len(mentioned_models) >= 2:
        comp_candidates = fetch_cars_for_models(mentioned_models) or fetch_motorbikes_for_models(mentioned_models)
        if len(comp_candidates) >= 2:
            candidates = comp_candidates
            is_comparison_mode = True
        else:
            raw_candidates = state.get("candidate_cars") or select_best_vehicle_candidates(profile)
            candidates = raw_candidates[:1] if raw_candidates else []
            is_comparison_mode = False
    elif len(mentioned_models) == 1:
        single_candidate = fetch_cars_for_models(mentioned_models) or fetch_motorbikes_for_models(mentioned_models)
        if single_candidate:
            candidates = single_candidate[:1]
        else:
            raw_candidates = state.get("candidate_cars") or select_best_vehicle_candidates(profile)
            candidates = raw_candidates[:1] if raw_candidates else []
        is_comparison_mode = False
    else:
        raw_candidates = state.get("candidate_cars") or select_best_vehicle_candidates(profile)
        candidates = raw_candidates[:1] if raw_candidates else []
        is_comparison_mode = False

    tco_results = []

    for v in candidates:
        raw_seats = v.get("seats")
        seats_val = raw_seats if (isinstance(raw_seats, int) and 2 <= raw_seats <= 9) else (2 if pref == "MOTORBIKE" else 5)

        tco_req = TCOCalculationRequest(
            vehicle_type="MOTORBIKE" if pref == "MOTORBIKE" else "CAR",
            model_id=v["code"],
            province_code="HN",
            battery_option="RENTAL",
            monthly_km_estimate=monthly_km,
            base_price_override=v["base_price"],
            battery_buy_price_override=v.get("battery_buy_price"),
            battery_rent_monthly_override=v.get("rent_monthly"),
            seat_count=seats_val,
        )
        res = calculate_tco(tco_req)
        rb = res.rolling_cost_breakdown
        tco_results.append({
            "model_name": v["name"],
            "base_price": v["base_price"],
            "battery_buy_price": v.get("battery_buy_price"),
            "total_rolling_cost": rb.total_rolling_cost_vnd,
            "registration_tax": rb.registration_fee_vnd,
            "plate_fee": rb.plate_fee_vnd,
            "road_fee": rb.road_maintenance_fee_vnd,
            "inspection_fee": getattr(rb, "inspection_fee_vnd", 90_000),
            "insurance_fee": rb.civil_insurance_vnd,
            "monthly_charging_cost": res.monthly_operating_cost.charging_electricity_cost_vnd,
            "total_monthly_operating_cost": res.monthly_operating_cost.total_monthly_cost_vnd,
            "disclaimer": res.disclaimer_text,
        })

    target_car = candidates[0] if candidates else None
    # ONLY generate quote action if exactly ONE vehicle is selected and not in comparison mode
    action_payload = (
        {
            "type": "create_quote",
            "vehicle_id": target_car.get("code"),
            "vehicle_name": target_car.get("name"),
            "base_price": target_car.get("base_price") or 0,
        }
        if (target_car and target_car.get("code") and target_car.get("name") and len(candidates) == 1 and not is_comparison_mode)
        else None
    )

    # Format user profile values cleanly
    raw_purpose = profile.get("usage_purpose")
    purpose_map = {
        "commute": "đi làm hàng ngày",
        "family": "phục vụ gia đình",
        "ride_hailing": "kinh doanh dịch vụ",
        "travel": "du lịch đi xa",
    }
    purpose_clean = purpose_map.get(raw_purpose, "di chuyển hàng ngày")
    b_max_val = profile.get("budget_max") or 0
    b_str = f"{b_max_val:,} VNĐ" if b_max_val > 0 else "Linh hoạt / Thỏa mái chọn các dòng xe cao cấp"
    seats_val = profile.get("seat_count")
    seats_str = f"{seats_val} chỗ" if seats_val else "phù hợp"

    # Formulate prompt based on DST mode (OVERVIEW vs DETAILED_BREAKDOWN)
    if is_detailed_mode:
        if "DETAILED_BREAKDOWN_SENT" not in provided_views:
            provided_views.append("DETAILED_BREAKDOWN_SENT")

        # Mode 2: Detailed Financial Breakdown
        try:
            llm = get_llm(temperature=0.3)
            tco_detail_str = ""
            for idx, t in enumerate(tco_results, 1):
                tco_detail_str += (
                    f"\n--- BÓC TÁCH TÀI CHÍNH CHI TIẾT MẪU XE: {t['model_name']} ---\n"
                    f"1. Giá niêm yết (Thuê pin): {t['base_price']:,} VNĐ\n"
                    f"2. Lệ phí trước bạ (Ưu đãi 0% dành riêng cho Xe Điện VinFast): {t['registration_tax']:,} VNĐ\n"
                    f"3. Phí cấp biển số (Hà Nội / TP.HCM): {t['plate_fee']:,} VNĐ\n"
                    f"4. Phí bảo trì đường bộ (1 năm): {t['road_fee']:,} VNĐ\n"
                    f"5. Phí đăng kiểm: {t['inspection_fee']:,} VNĐ\n"
                    f"6. Bảo hiểm TNDS bắt buộc: {t['insurance_fee']:,} VNĐ\n"
                    f"👉 TỔNG CHI PHÍ LĂN BÁNH ƯỚC TÍNH: {t['total_rolling_cost']:,} VNĐ\n"
                    f"7. Phí sạc điện hàng tháng ({daily_km} km/ngày): {t['monthly_charging_cost']:,} VNĐ/tháng\n"
                    f"8. Tổng chi phí nuôi xe/tháng (Sạc + Thuê pin): {t['total_monthly_operating_cost']:,} VNĐ/tháng\n"
                )

            import os

            from jinja2 import Environment, FileSystemLoader
            prompts_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts")
            jinja_env = Environment(loader=FileSystemLoader(prompts_dir), autoescape=False)

            tpl_detailed = jinja_env.get_template("recommendation_detailed.jinja2")
            system_prompt = tpl_detailed.render(
                b_str=b_str,
                seats_str=seats_str,
                purpose_clean=purpose_clean,
                tco_detail_str=tco_detail_str,
            )
            res = llm.invoke([SystemMessage(content=system_prompt), HumanMessage(content=query)])
            llm_response = extract_text_from_content(res.content)
            if llm_response and len(llm_response) > 30:
                if "Mọi con số mang tính chất ước tính" not in llm_response:
                    llm_response += "\n\n⚠️ *Mọi con số mang tính chất ước tính, vui lòng xác nhận báo giá chính thức với Tư vấn viên.*"
                return {
                    "current_stage": "RECOMMENDATION",
                    "user_profile": profile,
                    "recommended_cars": candidates,
                    "tco_result": {"items": tco_results},
                    "provided_views": provided_views,
                    "response": llm_response,
                    "action": action_payload,
                }
        except Exception:
            pass

    else:
        if "OVERVIEW_SENT" not in provided_views:
            provided_views.append("OVERVIEW_SENT")

        # Mode 1: Vehicle Recommendation Overview Pitch
        try:
            llm = get_llm(temperature=0.7)
            tco_summary_str = ""
            for idx, t in enumerate(tco_results, 1):
                tco_summary_str += (
                    f"\nMẫu xe Top {idx}: {t['model_name']}\n"
                    f"- Giá niêm yết (Thuê pin): {t['base_price']:,} VNĐ\n"
                    f"- Giá mua đứt pin: {t['battery_buy_price']:,} VNĐ\n"
                    f"- Tổng phí lăn bánh ước tính (Thuế trước bạ 0%): {t['total_rolling_cost']:,} VNĐ\n"
                    f"- Chi phí sạc điện/tháng: {t['monthly_charging_cost']:,} VNĐ\n"
                    f"- Tổng chi phí sử dụng/tháng (sạc + thuê pin): {t['total_monthly_operating_cost']:,} VNĐ\n"
                )

            import os

            from jinja2 import Environment, FileSystemLoader
            prompts_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts")
            jinja_env = Environment(loader=FileSystemLoader(prompts_dir), autoescape=False)

            tpl_overview = jinja_env.get_template("recommendation_overview.jinja2")
            system_prompt = tpl_overview.render(
                b_str=b_str,
                seats_str=seats_str,
                purpose_clean=purpose_clean,
                daily_km=daily_km,
                tco_summary_str=tco_summary_str,
                is_comparison=is_comparison_mode,
            )
            raw_user_query = state.get("query") or "Tư vấn chọn xe điện VinFast"
            res = llm.invoke([SystemMessage(content=system_prompt), HumanMessage(content=raw_user_query)])
            llm_response = extract_text_from_content(res.content)
            if "Mọi con số mang tính chất ước tính" not in llm_response:
                llm_response += "\n\n⚠️ *Mọi con số mang tính chất ước tính, vui lòng xác nhận báo giá chính thức với Tư vấn viên.*"
            return {
                "current_stage": "RECOMMENDATION",
                "user_profile": profile,
                "recommended_cars": candidates,
                "tco_result": {"items": tco_results},
                "provided_views": provided_views,
                "response": llm_response,
                "action": action_payload,
            }
        except Exception:
            pass

    # Ensure dynamic response from LLM
    res = llm.invoke([{"role": "system", "content": f"Tư vấn tổng quan sản phẩm VinFast cho nhu cầu {b_str} {seats_str}."}, {"role": "user", "content": query or "Tư vấn xe tối ưu"}])
    if isinstance(res.content, list):
        resp_text = "".join([str(item.get("text", item)) if isinstance(item, dict) else str(item) for item in res.content]).strip()
    else:
        resp_text = str(res.content).strip()
    if "Mọi con số mang tính chất ước tính" not in resp_text:
        resp_text += "\n\n⚠️ *Mọi con số mang tính chất ước tính, vui lòng xác nhận báo giá chính thức với Tư vấn viên.*"

    return {
        "current_stage": "RECOMMENDATION",
        "user_profile": profile,
        "recommended_cars": candidates,
        "tco_result": {"items": tco_results},
        "provided_views": provided_views,
        "response": resp_text,
        "action": action_payload,
    }
