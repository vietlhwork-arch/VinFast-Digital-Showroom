# 📑 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Hệ Thống VinFast O2O Sales & AI Advisor Agent (Vin_ai)

> **Repository GitHub**: `https://github.com/AI20K-Build-Phase-Cohort-3/P-101`  
> **Team**: T-101  
> **Mốc hoàn thành**: Gate 1 — PRD Deliverable  

---

## 🎯 1. MỤC TIÊU DỰ ÁN (GOALS)

1. **Mục tiêu sản phẩm**: Xây dựng nền tảng thương mại điện tử O2O kết hợp AI Advisor Agent giúp khách hàng tìm hiểu, so sánh 31 mẫu xe VinFast (16 ô tô + 15 xe máy điện), nhận báo giá và đặt lịch lái thử trong dưới 3 phút.
2. **Mục tiêu kỹ thuật**:
   * API Response Latency (FastAPI + Async SQLAlchemy): **dưới 300 ms**.
   * AI Advisor response: **dưới 1.5 giây**.
   * Đồng bộ 100% dữ liệu danh mục xe thực tế lên CSDL Cloud Supabase PostgreSQL.
3. **Mục tiêu O2O & Sales**:
   * Hỗ trợ Sales Consultant duyệt báo giá và đơn đăng ký lái thử qua Staff Console trong 1 phút nhờ cơ chế Human-in-the-Loop (`AIProposal` & `Quote`).

---

## 📖 2. USER STORIES THỰC TẾ TRONG HỆ THỐNG

### 2.1 Khách hàng (Customer User Stories)
* **US-01**: *Là một người tìm mua xe VinFast*, tôi muốn **xem danh mục 31 mẫu xe (Ô tô điện & Xe máy điện) kèm bộ lọc theo chủng loại**, để **tra cứu nhanh thông số kỹ thuật và bảng giá niêm yết**.
* **US-02**: *Là một người dùng cần tư vấn*, tôi muốn **trò chuyện với VinFast AI Advisor (`AIChatWidget`)**, để **nhận gợi ý dòng xe phù hợp với ngân sách và số chỗ ngồi của gia đình**.
* **US-03**: *Là một người phân vân giữa các mẫu xe*, tôi muốn **chọn từ 2 đến 3 mẫu xe để so sánh song song (`CompareModal`)**, để **thấy rõ mẫu xe có giá rẻ nhất, quãng đường xa nhất và công suất cao nhất**.
* **US-04**: *Là một người muốn mua xe*, tôi muốn **gửi yêu cầu báo giá (`Quote`) hoặc đặt lịch lái thử (`TestDriveBooking`)**, để **nhận phản hồi xác nhận từ tư vấn viên Showroom**.

### 2.2 Tư vấn viên (Staff / Sales Consultant User Stories)
* **US-05**: *Là một Tư vấn viên*, tôi muốn **đăng nhập vào Staff Console (`StaffDrawer`)**, để **xem toàn bộ các Đơn báo giá (`Quote`) và Đơn lái thử (`TestDriveBooking`) đang chờ duyệt (Pending)**.
* **US-06**: *Là một Tư vấn viên*, tôi muốn **điều chỉnh chiết khấu (`discount`) và giá nộp chính thức (`final_price`)**, để **phê duyệt báo giá gửi cho khách hàng**.

### 2.3 Quản trị viên (Admin User Stories)
* **US-07**: *Là một Admin*, tôi muốn **truy cập Admin Dashboard (`AdminDashboardModal`)**, để **thống kê tổng quan dữ liệu hệ thống (Xe, Quotes, Bookings, Users) và quản lý phân quyền**.

---

## ⚡ 3. DANH SÁCH TÍNH NĂNG CHÍNH (FEATURES LIST)

| STT | Tên Tính Năng | Mô Tả Kỹ Thuật Chi Tiết |
| :---: | :--- | :--- |
| **1** | **Vehicle Showcase & Catalog** | Hỗ trợ 31 mẫu xe VinFast (16 Ô tô điện VF3–VF9 + 15 Xe máy điện Klara S, Feliz S, Theon S, Evo200...). Modal chi tiết thông số (`VehicleDetailModal`). |
| **2** | **Side-by-side Compare Matrix** | Cho phép chọn 2–3 mẫu xe so sánh song song. Tự động tính toán và highlight ưu điểm vượt trội (`CompareBar` + `CompareModal`). |
| **3** | **VinFast AI Advisor Agent** | Chatbot tư vấn thông minh (`AIChatWidget`), thu thập nhu cầu, gợi ý dòng xe theo ngân sách, tính chi phí sở hữu TCO và báo giá. |
| **4** | **Quotes & Test Drive Engine** | Form đăng ký báo giá lăn bánh (`/api/quotes`) & Đặt lịch lái thử (`/api/bookings`) lưu trữ trên Supabase Postgres. |
| **5** | **Staff HITL Console** | Giao diện dành riêng cho Consultant (`StaffDrawer`) để duyệt báo giá, thêm ưu đãi showroom và chốt đơn O2O. |
| **6** | **Admin Dashboard & System Auth** | Hệ thống Auth 3 vai trò (Customer, Consultant, Admin) với mã hóa Password Hashing, JWT Auth và Dashboard quản trị. |

---

## 🎯 4. PHẠM VI BUILD PHASE (SCOPE OF WORK)

### 4.1 Những gì SẼ LÀM (In-Scope - Đã & Đang Cài Đặt)
* **CSDL**: Supabase Cloud PostgreSQL với 31 mẫu xe sẵn có (`cars`, `e_scooters`, `users`, `quotes`, `test_drive_bookings`, `chat_sessions`, `ai_proposals`).
* **Backend FastAPI**: Phân chia kiến trúc `core`, `domain`, `features` (Auth, Cars, EScooters, Quotes, Bookings).
* **Frontend React 18 + Vite**: Giao diện hoàn thiện responsive, Dark/Light elements, Lucide Icons.
* **AI Integration**: AI Advisor Agent trong `AIChatWidget` & Phoenix AI Logging.

### 4.2 Những gì KHÔNG LÀM trong Build Phase này (Out-of-Scope)
* Thanh toán đặt cọc xe trực tuyến qua cổng VNPAY/MOMO (chỉ nhận yêu cầu giữ chỗ & báo giá O2O).
* Tích hợp trực tiếp với phần mềm CRM hãng VinFast (Salesforce/D365).

---

## 📊 5. CHỈ SỐ ĐO LƯỜNG (METRICS), KPI MỤC TIÊU & USE CASES CHI TIẾT

### 5.1 Hệ thống Metrics & KPI Mục tiêu (Technical & Business KPIs)

Để đảm bảo dự án phát triển đúng định hướng, hệ thống được quản lý và đánh giá thông qua 2 nhóm chỉ số KPI cốt lõi:

#### 🛠️ Nhóm 1: Technical KPI (Độ Chính Xác AI & Hiệu Năng Kỹ Thuật)
* **KPI 1.1 - AI Spec & Intent Precision (Độ chính xác tư vấn thông số & ý định)**:
  * **Chỉ số**: **$\ge 90\%$** câu trả lời trùng khớp chính xác 100% với dữ liệu xe thực tế từ CSDL Supabase PostgreSQL.
  * **Đo lường**: Truy xuất log từ **Arize Phoenix AI Tracing** & kiểm thử trên Golden Dataset (50+ kịch bản mẫu).
* **KPI 1.2 - Hallucination Rate (Tỷ lệ ảo giác thông tin)**:
  * **Chỉ số**: **$< 2\%$** (Hướng tới 0% ảo giác thông số kỹ thuật & giá bán xe).
  * **Đo lường**: Sử dụng **Strict RAG / Grounded Prompting** bắt buộc AI đối chiếu trực tiếp dữ liệu DB.
* **KPI 1.3 - API & AI Latency (Tốc độ phản hồi hệ thống)**:
  * **Chỉ số**: Latency API FastAPI **$< 300\text{ ms}$**, Tốc độ phản hồi Chatbot AI Advisor **$< 1.5\text{s}$**.

#### 💼 Nhóm 2: Business KPI (Chuyển Đổi & Hiệu Quả Đơn Đăng Ký O2O)
* **KPI 2.1 - Session-to-Lead Conversion Rate (Tỷ lệ chuyển đổi khách hàng gửi đơn)**:
  * **Chỉ số**: **$\ge 15\%$** người dùng sau khi tương tác với Chatbot hoặc Bảng so sánh xe thực hiện gửi thành công Đơn báo giá (`Quote`) hoặc Đăng ký lái thử (`TestDriveBooking`).
* **KPI 2.2 - Time-to-Submit (Thời gian hoàn thành đơn O2O)**:
  * **Chỉ số**: **$< 3\text{ phút}$** từ lúc tìm hiểu xe đến khi gửi form đăng ký thành công (nhờ cơ chế Auto-fill thông tin xe chọn sẵn).
* **KPI 2.3 - Staff Approval Latency (Tốc độ xử lý của Tư vấn viên)**:
  * **Chỉ số**: **$< 1\text{ phút}$** tiếp nhận, điền chiết khấu và phê duyệt đơn trên giao diện Staff Console (`StaffDrawer`).
* **KPI 2.4 - Successful Demo Submissions (Tổng số đơn ghi nhận thực tế)**:
  * **Chỉ số**: **100% đơn demo được lưu trữ bất biến (persistent)** trên Supabase PostgreSQL trong buổi báo cáo Demo Gate 1.

---

### 5.2 Kỳ Vọng Đầu Ra & Kết Quả Đạt Được (System Expectations)

1. **Đối với Khách hàng (Customer)**:
   * Nhận tư vấn chính xác 100% dòng xe phù hợp với ngân sách và quy mô gia đình trong dưới 1.5s.
   * Dễ dàng gửi yêu cầu báo giá/lái thử mượt mà không gặp rào cản thao tác.
2. **Đối với Tư vấn viên (Sales Consultant)**:
   * Giảm 80% thời gian xử lý thủ công nhờ dữ liệu Lead đã được AI tóm tắt nhu cầu và tính sẵn giá dự toán.
   * Duyệt đơn O2O gửi cho khách chỉ với 1 click qua giao diện Staff Console.

---

### 5.3 Kịch Bản Use Case Cụ Thể (Specific Use Cases Execution Flow)

---

#### 💡 USE CASE 1: Tư Vấn Chọn Xe Gia Đình & Lập Dự Toán Báo Giá (Gắn với Technical KPI 1 - AI Accuracy)

* **Mục tiêu**: AI Advisor tư vấn đúng 100% thông số xe, đề xuất tối ưu theo ngân sách và lập dự toán chi phí lăn bánh chính xác không ảo giác.
* **Actor**: Khách hàng cá nhân & AI Advisor Agent (`AIChatWidget`).
* **Kịch bản thực hiện (Step-by-Step Flow)**:
  1. **Khách hàng gửi yêu cầu**: *"Gia đình tôi có 5 người, tài chính khoảng 650 - 750 triệu VNĐ, muốn mua một chiếc ô tô điện chạy đô thị hằng ngày và thỉnh thoảng về quê 250km. Nên chọn xe nào và chi phí lăn bánh ra sao?"*
  2. **AI Intent Extraction & Query**: AI bóc tách điều kiện: `passengers = 5`, `price_range = [650m, 750m]`, `range >= 250km`, thực hiện SQL Query tới CSDL Supabase bảng `cars`.
  3. **AI Phản hồi & Dự toán**: Trong **1.2 giây**, AI gợi ý mẫu **VinFast VF 6 Plus** (Giá niêm yết 711 triệu, tầm xa 399km/lần sạc), liệt kê chi tiết phí lăn bánh (Lệ phí trước bạ 0%, bảo hiểm, đăng kiểm, thuê pin hàng tháng).
  4. **Call-to-Action O2O**: AI hiển thị nút tương tác nhanh: **[Nhận báo giá VF 6]** và **[Đặt lịch lái thử]**.

* **Kỳ vọng & Tiêu chí nghiệm thu**:
  * Thông số VF 6 (399km, 5 chỗ, 711 triệu) trùng khớp 100% CSDL.
  * Tốc độ phản hồi $< 1.5$s.

---

#### 🚗 USE CASE 2: So Sánh Xe & Chuyển Đổi Khách Hàng Gửi Đơn Đăng Ký (Gắn với Business KPI 2 - Sales Conversion)

* **Mục tiêu**: Giúp khách hàng so sánh đa phân khúc và dễ dàng gửi Đơn đăng ký báo giá / lái thử O2O, chuyển về Staff Console xử lý dưới 1 phút.
* **Actor**: Khách hàng, Frontend React/Vite, Backend FastAPI, Tư vấn viên (Staff Consultant).
* **Kịch bản thực hiện (Step-by-Step Flow)**:
  1. **So sánh đa xe**: Khách chọn 3 mẫu xe (**VF 3**, **VF 5 Plus**, **Evo200**) trên giao diện và mở modal `CompareModal`.
  2. **Ma trận so sánh & Quyết định**: Khách xem các điểm highlight ưu việt và quyết định bấm nút **"Nhận Báo Giá Lăn Bánh"** ngay dưới dòng xe **VF 5 Plus**.
  3. **Submit Form Auto-fill**: Form `QuoteForm` tự động điền sẵn tên xe `VinFast VF 5 Plus`. Khách chỉ cần nhập SĐT & Showroom chọn lựa -> Bấm **"Gửi yêu cầu Báo giá"** (Thao tác tốn $< 2.5$ phút).
  4. **Xử lý Backend & Staff Console**: Backend ghi nhận record vào bảng `quotes` trên Supabase (trạng thái `PENDING`). Tư vấn viên mở `StaffDrawer`, xem thông tin, thêm ưu đãi voucher 10 triệu và bấm **"Phê duyệt"** (trạng thái đổi thành `APPROVED` trong $< 45$ giây).

* **Kỳ vọng & Tiêu chí nghiệm thu**:
  * Tỷ lệ chuyển đổi người dùng gửi đơn thành công cao ($\ge 15\%$).
  * Toàn bộ dữ liệu đơn O2O được ghi nhận chính xác 100% trên Supabase PostgreSQL.

