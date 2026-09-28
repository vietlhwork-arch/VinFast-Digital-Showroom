"""LangGraph / LangChain `@tool` wrapper for TCO Calculator Engine."""

from langchain_core.tools import tool

from src.services.tco_calculator import TCOCalculationRequest, calculate_tco


@tool
def calculate_tco_tool(
    vehicle_type: str = "CAR",
    model_id: str = "vf-5",
    province_code: str = "HN",
    battery_option: str = "RENTAL",
    monthly_km_estimate: int = 1000,
    base_price_override: int | None = None,
    seat_count: int | None = None,
    battery_buy_price_override: int | None = None,
    battery_rent_monthly_override: int | None = None,
    variant_id: str | None = None,
) -> str:
    """Tính toán chi tiết phí lăn bánh và chi phí sạc điện vận hành hàng tháng cho xe VinFast.

    Args:
        vehicle_type: Loai xe ('CAR' hoặc 'MOTORBIKE')
        model_id: Mã dòng xe (ví dụ: 'vf3', 'vf-5', 'vf8-eco', 'limo-green', 'feliz-s')
        province_code: Mã tỉnh thành tính biển số ('HN', 'HCM', hoặc 'OTHER')
        battery_option: Tùy chọn pin ('RENTAL' là thuê pin, 'BUY' là mua đứt pin)
        monthly_km_estimate: Số km dự kiến di chuyển hàng tháng (ví dụ: 1000)
        base_price_override: Giá xe niêm yết tùy chỉnh (VNĐ) nếu có
        seat_count: Số chỗ ngồi tùy chỉnh (ví dụ: 4, 5, 7) nếu muốn tính bảo hiểm TNDS chính xác
        battery_buy_price_override: Giá mua đứt kèm pin tùy chỉnh (VNĐ)
        battery_rent_monthly_override: Phí thuê pin hàng tháng tùy chỉnh (VNĐ)
        variant_id: Mã phiên bản cụ thể nếu cần

    Returns:
        Chuỗi JSON / Văn bản kết quả phí lăn bánh, chi phí sạc điện và disclaimer pháp lý.
    """
    req_kwargs: dict[str, Any] = {
        "vehicle_type": vehicle_type,
        "model_id": model_id,
        "province_code": province_code,
        "battery_option": battery_option,
        "monthly_km_estimate": monthly_km_estimate,
    }
    if base_price_override is not None:
        req_kwargs["base_price_override"] = base_price_override
    if seat_count is not None:
        req_kwargs["seat_count"] = seat_count
    if battery_buy_price_override is not None:
        req_kwargs["battery_buy_price_override"] = battery_buy_price_override
    if battery_rent_monthly_override is not None:
        req_kwargs["battery_rent_monthly_override"] = battery_rent_monthly_override
    if variant_id is not None:
        req_kwargs["variant_id"] = variant_id

    req = TCOCalculationRequest(**req_kwargs)
    res = calculate_tco(req)
    return res.model_dump_json(indent=2)
