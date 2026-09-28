# 🚀 Bài Đăng Xin Feedback Sản Phẩm VinCar (P-101)

> **Ghi chú:** Bài viết này được kiểm tra chính xác 100% từ codebase repo `P-101` (Sử dụng Google Gemini `gemini-3.1-flash-lite`, LangGraph, FastAPI, React Vite, Supabase Postgres pgvector).

Bạn có thể sao chép toàn bộ nội dung bên dưới để đăng bài xin feedback trên các cộng đồng:

---

Xin chào mọi người, nhóm mình muốn xin feedback về sản phẩm hiện tại của nhóm ạ. Rất mong nhận được sự góp ý của mọi người để nhóm tiếp tục hoàn thiện sản phẩm❤️

🔨 **Tên sản phẩm:** VinCar — Hệ thống Thương mại điện tử O2O & AI Agent Tư vấn Bán hàng Xe VinFast

📝 **Mô tả:** 
Nền tảng thương mại điện tử trải nghiệm **O2O (Online-to-Offline)** kết hợp **AI Agent tư vấn bán hàng thông minh 24/7** cho toàn bộ 31+ mẫu xe VinFast (16 mẫu Ô tô điện từ VF 3 đến VF 9 và 15 mẫu Xe máy điện như Evo200, Feliz S, Klara S, Theon S...).

🤖 **Kiến trúc AI Agent (LangGraph Multi-node Workflow):**
* **Guardrails Node:** Kiểm duyệt và lọc nội dung câu hỏi an toàn trước khi đi vào agent.
* **Catalog Router & Intent Classifier:** Tự động phân loại intent người dùng (hỏi đáp dữ kiện kỹ thuật RAG vs. phỏng vấn nhu cầu mua xe Needs Discovery).
* **Needs Discovery & Personalized Recommendation:** Thu thập mục đích di chuyển, ngân sách, số lượng chỗ ngồi để tự động đề xuất dòng xe tối ưu kèm phân tích tổng chi phí sở hữu (TCO - Total Cost of Ownership).
* **Catalog RAG Tool (pgvector):** Truy xuất tài liệu kỹ thuật, phạm vi di chuyển, dung lượng pin, thời gian sạc và bảng giá niêm yết chính thức.
* **Real-time SSE Streaming:** Phản hồi token dạng dòng chảy thời gian thực mượt mà.
* **Memory Rollup System:** Tự động nén và hợp nhất lịch sử trò chuyện thành Chat Summaries giúp tối ưu token và lưu context dài hạn.

🚗 **Trải nghiệm Thương mại Điện tử & O2O Sales Pipeline:**
* **So Sánh Xe Song Song (Side-by-side Matrix):** Chọn và so sánh từ 2 đến 3 mẫu xe bất kỳ, tự động highlight ưu điểm vượt trội (giá rẻ nhất, quãng đường đi xa nhất, dung lượng pin lớn nhất,...).
* **Yêu cầu Báo Giá & Đặt Lịch Lái Thử:** Form tính giá lăn bánh chi tiết (kèm tùy chọn mua pin / thuê pin, tính ưu đãi) và đăng ký lịch hẹn trải nghiệm xe thực tế tại Showroom.
* **Dashboard Quản trị CRM (Admin Portal & Staff Console):** Cổng quản lý phân quyền (Admin / Consultant Staff / Customer) cho phép duyệt yêu cầu báo giá, quản lý lịch hẹn lái thử, chỉnh sửa catalog 31+ mẫu xe và quản lý tài khoản người dùng.

🔗 **Link demo:** https://p-101.vercel.app/

⚙️ **Tech stack:**
* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Supabase Client SDK
* **Backend:** FastAPI (Python 3.13), Async SQLAlchemy 2.0, REST API + SSE Streaming
* **AI Agent:** LangGraph, LangChain, **Google Gemini (`gemini-3.1-flash-lite`)**, LangSmith Tracing
* **Database & Vector Store:** Supabase Cloud (PostgreSQL + pgvector)
* **Deploy:** Vercel (Frontend) + Render / Cloudflare (Backend)

🔐 **Tài khoản trải nghiệm (Demo Accounts):**
* 👑 **Quản trị viên (Admin):** `admin@vinfast.vn` | Mật khẩu: `admin123`
* 💼 **Tư vấn viên (Staff):** `staff@vinfast.vn` | Mật khẩu: `staff123`
* 👤 **Khách hàng Demo:** `customer@gmail.com` | Mật khẩu: `123456`

❓ **Cần feedback về:**
1. **Độ thông minh & tự nhiên của AI Advisor (Gemini LLM):** Khả năng tư vấn dòng xe hợp ngân sách/nhu cầu gia đình, giải đáp thông số kỹ thuật xe VinFast (ô tô & xe máy điện) và tốc độ phản hồi SSE streaming.
2. **Trải nghiệm So sánh Xe (Comparison Matrix):** Độ tiện dụng khi so sánh 2-3 xe song song, giao diện highlight thông số vượt trội tự động.
3. **Luồng trải nghiệm O2O (Báo giá lăn bánh & Đặt lịch lái thử):** UX/UI form tính giá lăn bánh (mua pin/thuê pin) và quy trình đăng ký trải nghiệm xe tại showroom.
4. **Dashboard Quản trị CRM (Admin & Staff Console):** Giao diện cho Tư vấn viên/Admin (duyệt đơn báo giá, quản lý lịch hẹn lái thử, cập nhật danh mục xe) đã trực quan, mượt mà và đủ tiện ích cho vận hành thực tế chưa.

---
*Cảm ơn mọi người rất nhiều! Nhóm rất trân trọng mọi góp ý của các bạn!* 🙏✨
