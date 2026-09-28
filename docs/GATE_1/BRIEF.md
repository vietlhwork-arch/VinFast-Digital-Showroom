# 📋 BRIEF (BẢN TÓM TẮT DỰ ÁN VIN_AI)

> **Repository GitHub**: `https://github.com/AI20K-Build-Phase-Cohort-3/P-101`  
> **Mốc đánh giá**: Gate 1 — Chốt Đề Tài  
> **Team**: T-101  

---

## 📌 1. TÊN DỰ ÁN (PROJECT NAME)

**Hệ Thống Thương Mại Điện Tử VinFast O2O (Online-to-Offline) & AI Advisor Agent**  
*(VinFast O2O Sales System & AI Agent Tư Vấn Chọn Xe theo Nhu Cầu & Ngân Sách)*

---

## 💥 2. VẤN ĐỀ (PROBLEM STATEMENT)

Thị trường xe điện VinFast phát triển rất nhanh với dải sản phẩm rộng (31 mẫu xe bao gồm 16 Ô tô điện VF3–VF9 và 15 Xe máy điện Klara S, Feliz S, Theon S, Evo200...). Tuy nhiên, khách hàng và doanh nghiệp gặp phải 3 rào cản chính:

1. **Phức tạp về thông số & Bài toán Chi phí (TCO)**: Người mua khó tự tính toán tổng chi phí lăn bánh, phương án thuê pin vs mua pin, chi phí tiền điện sạc so với xe xăng cùng phân khúc.
2. **Trải nghiệm mua sắm phân mảnh giữa Online & Offline (O2O)**: Khách hàng tìm hiểu thông tin trên web nhưng khi tới Showroom thì tư vấn viên phải hỏi lại từ đầu.
3. **Showroom Sales quá tải**: Đội ngũ tư vấn tốn 30–45 phút cho mỗi bản báo giá và đặt lịch lái thử thủ công.

---

## 💡 3. GIẢI PHÁP (SOLUTION)

Hệ thống **VinFast O2O Sales & AI Advisor Agent** tích hợp toàn diện:

* **AI Advisor Widget**: Chatbot tư vấn cá nhân hóa đa bước, hỗ trợ tra cứu ngân sách, tìm mẫu xe phù hợp (Match Score %) và tư vấn thông số kỹ thuật.
* **Ma trận So Sánh Xe Song Song (Side-by-side Matrix)**: Công cụ so sánh từ 2–3 mẫu xe, tự động highlight ưu điểm (Giá rẻ nhất, Quãng đường xa nhất).
* **Đơn Báo Giá (`Quote`) & Đặt Lịch Lái Thử (`TestDriveBooking`)**: Quy trình đăng ký trải nghiệm O2O mượt mà.
* **Cổng Duyệt Tư Vấn Viên (Staff Console - HITL)**: Tư vấn viên xem đề xuất AI, điều chỉnh chiết khấu/quà tặng đại lý và duyệt báo giá gửi cho khách.
* **Admin Portal**: Quản trị danh mục 31 mẫu xe, người dùng và hệ thống báo cáo kinh doanh.

---

## 👥 4. ĐỐI TƯỢNG NGƯỜI DÙNG (TARGET USERS)

1. **Khách hàng cá nhân / Gia đình (Customer)**: Đăng nhập/Khách vãng lai xem catalog, so sánh xe, chat với AI Advisor, nhận báo giá & đặt lịch lái thử.
2. **Tư vấn viên bán hàng (Consultant / Staff)**: Sử dụng Staff Console để kiểm tra yêu cầu báo giá (`Quote`), lịch lái thử (`TestDriveBooking`) và phê duyệt đề xuất AI (`AIProposal`).
3. **Quản trị viên (Admin)**: Quản lý catalog 31 xe, phân quyền tài khoản người dùng và theo dõi hệ thống.

---

## 🛠️ 5. CÔNG NGHỆ & PHÂN CÔNG TEAM T-101

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
* **Backend**: FastAPI (Python 3.13), Async SQLAlchemy 2.0, Supabase PostgreSQL Cloud.
* **Phân công Team T-101**:
  * **Nguyễn Văn An** (Team Lead & Frontend): Quản lý dự án, xây dựng React/Vite UI & State Management (`App.tsx`).
  * **Đào Trung Hiếu** (Data Engineer): Chuẩn hóa dữ liệu catalog 31 xe VinFast (Specs JSON & RAG summary) & CSDL Supabase Postgres.
  * **Nguyễn Đăng Đức** (Backend Engineer): Thiết kế API RESTful FastAPI (`auth`, `cars`, `escooters`, `quotes`, `bookings`), Auth JWT.
  * **Bùi Đức Hiếu** (AI Engineer): Phát triển AI Advisor Agent (`AIChatWidget`), luồng đề xuất cá nhân hóa & HITL Workflow (`AIProposal`).
