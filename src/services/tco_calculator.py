"""Deterministic Python TCO Calculator Tool.

Calculates rolling costs (phí lăn bánh) and monthly operating costs for VinFast electric vehicles
and e-scooters according to zero math hallucination rule (ADR 0003).
"""

from typing import Any, Literal

from pydantic import BaseModel, Field


class TCOCalculationRequest(BaseModel):
    vehicle_type: Literal["CAR", "MOTORBIKE"] = "CAR"
    model_id: str  # e.g., "vf3", "vf-5", "theon-s"
    variant_id: str | None = None
    province_code: Literal["HN", "HCM", "OTHER"] = "OTHER"
    battery_option: Literal["RENTAL", "BUY"] = "RENTAL"
    monthly_km_estimate: int = Field(default=1000, ge=0)
    base_price_override: int | None = None
    battery_buy_price_override: int | None = None
    battery_rent_monthly_override: int | None = None
    seat_count: int = Field(default=5, ge=2, le=9)


class RollingCostBreakdown(BaseModel):
    registration_fee_vnd: int = 0  # 0 VND for EV in Vietnam
    plate_fee_vnd: int
    road_maintenance_fee_vnd: int
    civil_insurance_vnd: int
    total_rolling_cost_vnd: int


class MonthlyOperatingCost(BaseModel):
    battery_subscription_fee_vnd: int
    charging_electricity_cost_vnd: int
    estimated_maintenance_vnd: int
    total_monthly_cost_vnd: int


class TCOCalculationResponse(BaseModel):
    vehicle_type: str
    model_id: str
    province_code: str
    battery_option: str
    monthly_km_estimate: int
    list_price_vnd: int
    rolling_cost_breakdown: RollingCostBreakdown
    monthly_operating_cost: MonthlyOperatingCost
    disclaimer_text: str
    comparison_summary: dict[str, Any] | None = None


DISCLAIMER_TEXT = "Mọi con số mang tính chất ước tính, vui lòng xác nhận báo giá chính thức với Tư vấn viên."
PUBLIC_CHARGING_RATE_VND_PER_KWH = 3858


def _find_vehicle_in_catalog(
    model_id: str,
    variant_id: str | None = None,
) -> tuple[dict[str, Any] | None, bool]:
    """Dynamically query catalog cache (backed by Supabase DB) for vehicle specs.

    Returns:
        tuple[vehicle_record_dict or None, is_car_boolean]
    """
    from src.services.catalog_service import (
        _normalize_model_key,
        fetch_cars_from_supabase,
        fetch_motorbikes_from_supabase,
        get_dynamic_model_keyword_map,
    )

    m_clean = str(model_id or "").lower().strip()
    if not m_clean:
        return None, True

    # 1. Resolve canonical alias dynamically from catalog DB records
    key_map = get_dynamic_model_keyword_map()
    canonical = key_map.get(m_clean) or key_map.get(_normalize_model_key(m_clean))

    # 2. Query target_model in cars
    cars = fetch_cars_from_supabase(target_model=canonical or m_clean)
    if cars:
        if variant_id:
            v_match = [c for c in cars if str(c.get("id", "")).lower() == variant_id.lower() or str(c.get("code", "")).lower() == variant_id.lower()]
            if v_match:
                return v_match[0], True
        return cars[0], True

    # 3. Query target_model in motorbikes
    bikes = fetch_motorbikes_from_supabase(target_model=canonical or m_clean)
    if bikes:
        return bikes[0], False

    # 4. Normalized full scan across all cars
    norm = _normalize_model_key(m_clean)
    cars_all = fetch_cars_from_supabase()
    for c in cars_all:
        if norm == _normalize_model_key(c.get("code", "")) or norm == _normalize_model_key(c.get("name", "")):
            return c, True

    # 5. Normalized full scan across all motorbikes
    bikes_all = fetch_motorbikes_from_supabase()
    for b in bikes_all:
        if norm == _normalize_model_key(b.get("code", "")) or norm == _normalize_model_key(b.get("name", "")):
            return b, False

    # 6. Base-prefix fuzzy matching (stripping trim suffixes: -plus, -eco, -s, -s2, 200, etc.)
    base_prefix = norm
    for suffix in ("s2", "s", "200", "lite", "plus", "eco", "green"):
        if base_prefix.endswith(suffix):
            trimmed = base_prefix[:-len(suffix)].strip()
            if len(trimmed) >= 3:
                base_prefix = trimmed
                break

    if len(base_prefix) >= 3:
        for b in bikes_all:
            if base_prefix in _normalize_model_key(b.get("code", "")) or base_prefix in _normalize_model_key(b.get("name", "")):
                return b, False
        for c in cars_all:
            if base_prefix in _normalize_model_key(c.get("code", "")) or base_prefix in _normalize_model_key(c.get("name", "")):
                return c, True

    return None, True


def calculate_tco(req: TCOCalculationRequest) -> TCOCalculationResponse:
    """Calculate deterministic rolling cost and monthly operating cost directly from database."""
    vehicle, is_car = _find_vehicle_in_catalog(req.model_id, req.variant_id)

    # Determine vehicle type
    if vehicle:
        v_type = "CAR" if is_car else "MOTORBIKE"
        v_code = str(vehicle.get("code") or "").lower()
        base_price = req.base_price_override or vehicle.get("base_price") or vehicle.get("list_price") or (500_000_000 if v_type == "CAR" else 30_000_000)
        seats = vehicle.get("seats") or req.seat_count
    else:
        v_type = req.vehicle_type
        v_code = str(req.model_id).lower().strip()
        base_price = req.base_price_override or (500_000_000 if v_type == "CAR" else 30_000_000)
        seats = req.seat_count

    # Battery buy price calculation
    if req.battery_buy_price_override:
        battery_buy_price = req.battery_buy_price_override
    elif vehicle and vehicle.get("battery_buy_price"):
        battery_buy_price = int(vehicle["battery_buy_price"])
    else:
        if any(k in v_code for k in ("vf-3", "vf3")):
            battery_buy_price = 322_000_000
        elif any(k in v_code for k in ("vf-5", "vf5")):
            battery_buy_price = 548_000_000
        elif any(k in v_code for k in ("vf-6", "vf6", "herio")):
            battery_buy_price = base_price + 90_000_000
        elif any(k in v_code for k in ("vf-7", "vf7", "nerio")):
            battery_buy_price = base_price + 149_000_000
        elif any(k in v_code for k in ("vf-8", "vf8")):
            battery_buy_price = base_price + 200_000_000
        elif any(k in v_code for k in ("vf-9", "vf9", "limo")):
            battery_buy_price = base_price + 493_000_000
        elif v_type == "CAR":
            battery_buy_price = base_price + 100_000_000
        else:
            battery_buy_price = base_price + 19_000_000

    # Battery monthly rental calculation
    if req.battery_rent_monthly_override:
        battery_rent_monthly = req.battery_rent_monthly_override
    elif vehicle and vehicle.get("battery_rent_monthly"):
        battery_rent_monthly = int(vehicle["battery_rent_monthly"])
    else:
        if any(k in v_code for k in ("vf-5", "vf5")):
            battery_rent_monthly = 1_600_000
        elif any(k in v_code for k in ("vf-3", "vf3", "vf-2", "minio", "ec-van")):
            battery_rent_monthly = 900_000
        elif any(k in v_code for k in ("vf-6", "vf6", "herio", "nerio")):
            battery_rent_monthly = 1_800_000
        elif any(k in v_code for k in ("vf-7", "vf7")):
            battery_rent_monthly = 2_100_000
        elif any(k in v_code for k in ("vf-8", "vf8")):
            battery_rent_monthly = 2_900_000
        elif any(k in v_code for k in ("vf-9", "vf9", "limo")):
            battery_rent_monthly = 4_200_000
        elif v_type == "CAR":
            battery_rent_monthly = 1_800_000
        else:
            battery_rent_monthly = 350_000

    if req.battery_option == "BUY":
        list_price = battery_buy_price
    else:
        list_price = base_price

    # 1. Rolling Cost (Phí lăn bánh)
    registration_fee = 0  # 0% for EV in VN

    if v_type == "CAR":
        if req.province_code in ["HN", "HCM"]:
            plate_fee = 20_000_000
        else:
            plate_fee = 1_000_000

        road_maintenance_fee = 1_560_000  # 1.56m VND/year for passenger cars

        if seats >= 7:
            civil_insurance = 794_000  # 794,000 VND for >= 7 seats
        else:
            civil_insurance = 437_000  # 437,000 VND for < 7 seats
    else:
        # MOTORBIKE
        if req.province_code in ["HN", "HCM"]:
            plate_fee = 2000000
        else:
            plate_fee = 150000

        road_maintenance_fee = 0
        civil_insurance = 66000

    total_rolling_cost = list_price + registration_fee + plate_fee + road_maintenance_fee + civil_insurance

    rolling_cost = RollingCostBreakdown(
        registration_fee_vnd=registration_fee,
        plate_fee_vnd=plate_fee,
        road_maintenance_fee_vnd=road_maintenance_fee,
        civil_insurance_vnd=civil_insurance,
        total_rolling_cost_vnd=total_rolling_cost,
    )

    # 2. Monthly Operating Cost
    if req.battery_option == "RENTAL":
        battery_fee = battery_rent_monthly
    else:
        battery_fee = 0

    if vehicle and vehicle.get("battery_kwh") and vehicle.get("range_km"):
        try:
            kwh = float(vehicle["battery_kwh"])
            rng = float(vehicle["range_km"])
            if rng > 0:
                kwh_per_100km = round((kwh / rng) * 100, 1)
            else:
                kwh_per_100km = 14.0 if v_type == "CAR" else 2.5
        except (ValueError, TypeError):
            kwh_per_100km = 14.0 if v_type == "CAR" else 2.5
    else:
        if any(k in v_code for k in ("vf-3", "vf3", "vf-2", "minio")):
            kwh_per_100km = 10.5
        elif any(k in v_code for k in ("vf-5", "vf5")):
            kwh_per_100km = 12.0
        elif any(k in v_code for k in ("vf-6", "vf6")):
            kwh_per_100km = 14.0
        elif any(k in v_code for k in ("vf-7", "vf7")):
            kwh_per_100km = 16.0
        elif any(k in v_code for k in ("vf-8", "vf8")):
            kwh_per_100km = 18.0
        elif any(k in v_code for k in ("vf-9", "vf9")):
            kwh_per_100km = 21.0
        elif v_type == "CAR":
            kwh_per_100km = 14.0
        else:
            kwh_per_100km = 2.5
    monthly_kwh = (req.monthly_km_estimate / 100.0) * kwh_per_100km
    charging_cost = int(round(monthly_kwh * PUBLIC_CHARGING_RATE_VND_PER_KWH))

    maintenance_cost = 200000 if v_type == "CAR" else 50000
    total_monthly = battery_fee + charging_cost + maintenance_cost

    monthly_cost = MonthlyOperatingCost(
        battery_subscription_fee_vnd=battery_fee,
        charging_electricity_cost_vnd=charging_cost,
        estimated_maintenance_vnd=maintenance_cost,
        total_monthly_cost_vnd=total_monthly,
    )

    # 3. Comparison summary between RENTAL & BUY
    delta_battery_buy = battery_buy_price - base_price
    breakeven_months = (delta_battery_buy // battery_rent_monthly) if battery_rent_monthly > 0 else 0

    comparison_summary = {
        "battery_buy_diff_vnd": delta_battery_buy,
        "monthly_rental_fee_vnd": battery_rent_monthly,
        "breakeven_months": breakeven_months,
        "recommendation": "Thuê pin phù hợp nếu đi vừa phải hoặc muốn tối ưu chi phí ban đầu. Mua pin phù hợp nếu di chuyển nhiều và sử dụng xe trên 3-5 năm."
    }

    return TCOCalculationResponse(
        vehicle_type=v_type,
        model_id=req.model_id,
        province_code=req.province_code,
        battery_option=req.battery_option,
        monthly_km_estimate=req.monthly_km_estimate,
        list_price_vnd=list_price,
        rolling_cost_breakdown=rolling_cost,
        monthly_operating_cost=monthly_cost,
        disclaimer_text=DISCLAIMER_TEXT,
        comparison_summary=comparison_summary,
    )
