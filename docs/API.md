# Tài liệu API — VinFast Digital Showroom

## Quy ước chung

- Base URL khuyến nghị: `http://localhost:8000/api/v1`
- Alias tương thích: `http://localhost:8000/api`
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
- Các request JSON sử dụng header `Content-Type: application/json`.
- Endpoint được bảo vệ sử dụng header `Authorization: Bearer <access_token>`.
- Các endpoint tạo/cập nhật phương tiện nhận `multipart/form-data` để hỗ trợ tải ảnh.

### Vai trò

| Ký hiệu | Quyền |
| --- | --- |
| Public | Không yêu cầu đăng nhập |
| Authenticated | Mọi tài khoản đã đăng nhập |
| Consultant | Tư vấn viên hoặc quản trị viên |
| Admin | Chỉ quản trị viên |

## Hệ thống

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Kiểm tra trạng thái ứng dụng và kết nối database. Endpoint này nằm ở root, không có prefix `/api/v1`. |
| `GET` | `/api/v1/status` | Public | Kiểm tra trạng thái pipeline trợ lý tư vấn. |
| `POST` | `/api/v1/warmup` | Public | Khởi động nóng pipeline tư vấn ở background để giảm độ trễ request đầu tiên. |

## Xác thực và tài khoản

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Public | Tạo tài khoản khách hàng bằng email, số điện thoại, mật khẩu và họ tên. |
| `POST` | `/api/v1/auth/login` | Public | Đăng nhập bằng email/mật khẩu và nhận JWT access token. |
| `POST` | `/api/v1/auth/google` | Public | Đăng nhập hoặc tự động đăng ký bằng Google ID/access token. |
| `GET` | `/api/v1/auth/me` | Authenticated | Lấy thông tin tài khoản hiện tại. |
| `PUT` | `/api/v1/auth/me` | Authenticated | Cập nhật họ tên, số điện thoại hoặc mật khẩu của tài khoản hiện tại. |
| `GET` | `/api/v1/auth/users` | Admin | Lấy danh sách tài khoản. |
| `POST` | `/api/v1/auth/create-staff` | Admin | Tạo tài khoản nhân viên/tư vấn viên. |
| `PUT` | `/api/v1/auth/users/{user_id}` | Owner/Admin | Chủ tài khoản cập nhật chính mình; admin có thể cập nhật vai trò và trạng thái. |
| `DELETE` | `/api/v1/auth/users/{user_id}` | Admin | Xóa một tài khoản; admin không thể tự xóa tài khoản đang đăng nhập. |

Ví dụ đăng nhập:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"your-password"}'
```

## Danh mục ô tô

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/api/v1/cars` | Public | Lấy danh sách ô tô; hỗ trợ query `category`. |
| `GET` | `/api/v1/cars/{car_id_or_code}` | Public | Lấy một mẫu xe bằng UUID hoặc mã xe. |
| `POST` | `/api/v1/cars` | Consultant | Tạo mẫu/phiên bản ô tô bằng `multipart/form-data`. |
| `PUT` | `/api/v1/cars/{car_id}` | Consultant | Cập nhật dữ liệu và hình ảnh ô tô. |
| `DELETE` | `/api/v1/cars/{car_id}` | Admin | Xóa một bản ghi ô tô. |

## Danh mục xe máy điện

`/escooters` là alias của `/motorbikes`; hai đường dẫn trả về cùng tài nguyên.

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/api/v1/motorbikes` | Public | Lấy danh sách xe máy điện; hỗ trợ query `category`. |
| `GET` | `/api/v1/motorbikes/{motorbike_id_or_code}` | Public | Lấy xe máy điện bằng UUID hoặc mã xe. |
| `POST` | `/api/v1/motorbikes` | Consultant | Tạo mẫu/phiên bản xe máy điện bằng `multipart/form-data`. |
| `PUT` | `/api/v1/motorbikes/{motorbike_id}` | Consultant | Cập nhật dữ liệu và hình ảnh xe máy điện. |
| `DELETE` | `/api/v1/motorbikes/{motorbike_id}` | Admin | Xóa một bản ghi xe máy điện. |

## Showroom và trạm sạc

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/api/v1/locations` | Public | Tìm địa điểm; hỗ trợ `demand_type`, `province`, `search`, `skip`, `limit`. |
| `POST` | `/api/v1/locations/sync` | Public | Đồng bộ lại tập dữ liệu showroom và trạm sạc vào database. |

> Khi triển khai production, nên giới hạn endpoint `locations/sync` cho admin hoặc tác vụ nội bộ.

## Tính TCO

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `POST` | `/api/v1/tco/calculate` | Public | Ước tính giá xe, chi phí lăn bánh và chi phí vận hành hằng tháng. |

Ví dụ:

```bash
curl -X POST http://localhost:8000/api/v1/tco/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_type": "CAR",
    "model_id": "vf-5",
    "province_code": "HCM",
    "battery_option": "BUY",
    "monthly_km_estimate": 1200,
    "seat_count": 5
  }'
```

Các giá trị chính:

- `vehicle_type`: `CAR` hoặc `MOTORBIKE`.
- `province_code`: `HN`, `HCM` hoặc `OTHER`.
- `battery_option`: `RENTAL` hoặc `BUY`.
- Kết quả chỉ mang tính ước tính; báo giá thực tế cần được tư vấn viên xác nhận.

## Báo giá

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/api/v1/quotes` | Public | Tra cứu báo giá; hỗ trợ lọc theo `user_id`, `email` hoặc `phone`. |
| `POST` | `/api/v1/quotes` | Public | Tạo yêu cầu báo giá mới. |
| `PUT` | `/api/v1/quotes/{quote_id}` | Consultant | Duyệt/từ chối, ghi chú, điều chỉnh giảm giá hoặc giá cuối. |

## Lịch lái thử

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/api/v1/bookings` | Public | Tra cứu lịch hẹn theo `phone`, `email` hoặc `status`. |
| `POST` | `/api/v1/bookings` | Public | Tạo yêu cầu lái thử với ngày, giờ và mẫu xe mong muốn. |
| `PUT` | `/api/v1/bookings/{booking_id}` | Consultant | Cập nhật trạng thái `pending`, `confirmed`, `completed` hoặc `cancelled`. |

## CRM và hồ sơ khách hàng

Hai prefix `/customer-profiles` và `/crm/profiles` ánh xạ tới cùng nhóm chức năng.

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/api/v1/customer-profiles` | Consultant | Danh sách hồ sơ; lọc theo lead score, trạng thái, từ khóa và phân trang. |
| `GET` | `/api/v1/customer-profiles/me` | Authenticated | Khách hàng xem hồ sơ của chính mình. |
| `GET` | `/api/v1/customer-profiles/{profile_id}` | Consultant | Xem chi tiết hồ sơ khách hàng 360°. |
| `PUT` | `/api/v1/customer-profiles/{profile_id}` | Consultant | Cập nhật trạng thái và thông tin hồ sơ. |
| `GET` | `/api/v1/customer-profiles/user/{user_id}/demands` | Consultant | Lấy lịch sử các đợt nhu cầu tìm xe. |
| `GET` | `/api/v1/customer-profiles/user/{user_id}/history` | Consultant | Lấy hồ sơ 360° kèm nhu cầu, báo giá và lịch lái thử. |

## Trợ lý tư vấn tích hợp

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `POST` | `/api/v1/chat` | Public | Gửi tin nhắn; trả JSON hoặc SSE khi `stream=true`. |
| `POST` | `/api/v1/chat/session/end` | Public | Kết thúc phiên và hợp nhất/tóm tắt nhu cầu nếu có người dùng đăng nhập. |
| `POST` | `/api/v1/chat/session/page-close` | Public | Kết thúc phiên qua `sendBeacon` khi người dùng đóng trang; trả `204`. |
| `POST` | `/api/v1/chat/session/bind-user` | Public | Gắn phiên khách vãng lai vào tài khoản sau đăng nhập. |

Ví dụ request không streaming:

```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tôi muốn tìm xe 5 chỗ dưới 800 triệu",
    "session_id": "demo-session-01",
    "stream": false
  }'
```

## Mã phản hồi thường gặp

| HTTP status | Ý nghĩa |
| --- | --- |
| `200` | Request thành công. |
| `201` | Tạo tài nguyên thành công. |
| `204` | Thành công và không có response body. |
| `400` | Dữ liệu hoặc nghiệp vụ không hợp lệ. |
| `401` | Thiếu token hoặc token không hợp lệ. |
| `403` | Tài khoản không có quyền thực hiện. |
| `404` | Không tìm thấy tài nguyên. |
| `422` | Request không đúng schema Pydantic. |
| `500` | Lỗi nội bộ server. |
