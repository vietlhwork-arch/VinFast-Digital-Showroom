"""LangGraph / LangChain `@tool` wrapper for Test Drive Booking creation."""

from datetime import date, datetime

from langchain_core.tools import tool

from src.api.bookings import create_booking
from src.models.schemas import BookingCreate
from src.services.database import SessionLocal


@tool
async def book_test_drive_tool(
    customer_name: str,
    customer_phone: str,
    vehicle_name: str,
    preferred_date: str,
    preferred_time: str = "09:00",
    notes: str | None = None,
) -> str:
    """Đăng ký lịch hẹn lái thử xe VinFast trực tiếp cho khách hàng.

    Args:
        customer_name: Họ và tên của khách hàng (ví dụ: "Nguyễn Văn A")
        customer_phone: Số điện thoại liên hệ (ví dụ: "0987654321")
        vehicle_name: Tên dòng xe khách hàng muốn lái thử (ví dụ: "VinFast VF 8", "VF 5", "Feliz S")
        preferred_date: Ngày mong muốn trải nghiệm định dạng YYYY-MM-DD (ví dụ: "2026-08-20")
        preferred_time: Khung giờ trải nghiệm (ví dụ: "09:00", "10:00", "14:00", "15:30")
        notes: Ghi chú thêm về địa điểm/showroom hoặc yêu cầu lái thử tận nơi

    Returns:
        Thông báo kết quả đăng ký thành công kèm mã xác nhận đơn booking.
    """
    try:
        parsed_date = datetime.strptime(preferred_date.strip(), "%Y-%m-%d").date()
    except Exception:
        parsed_date = date.today()

    booking_payload = BookingCreate(
        customer_name=customer_name.strip(),
        customer_phone=customer_phone.strip(),
        vehicle_id=vehicle_name.strip().lower().replace(" ", "-"),
        vehicle_name=vehicle_name.strip(),
        preferred_date=parsed_date,
        preferred_time=preferred_time.strip(),
        notes=notes,
    )

    async with SessionLocal() as db:
        booking = await create_booking(db, booking_payload)
        return (
            f"✅ Đăng ký lịch hẹn lái thử thành công!\n"
            f"- Mã số đặt lịch: {booking.id}\n"
            f"- Khách hàng: {booking.customer_name} ({booking.customer_phone})\n"
            f"- Dòng xe trải nghiệm: {booking.vehicle_name}\n"
            f"- Thời gian: {booking.preferred_time} ngày {booking.preferred_date}\n"
            f"- Ghi chú: {booking.notes or 'Không có'}\n"
            f"Chuyên viên tư vấn VinFast sẽ gọi điện thoại xác nhận lịch hẹn trước 2 tiếng."
        )
