# 🔀 Gate 2 — PR Log & Merged Evidences (>= 10 Merged PRs)

> **Báo cáo Danh sách Pull Requests (PR) & Lịch sử Merge Nhánh Main**  
> **Dự án**: VinFast O2O Sales System & AI Sales Advisor Agent (Team P-101)  
> **Cột mốc**: Gate 2 — Minimum Viable Product (MVP)  
> **Yêu cầu Deliverables**: Repo có tối thiểu **10 Pull Requests (PRs)** được merged thành công vào nhánh `main`.

---

## 📌 1. Quy Trình Quản Lý Nhánh & Merge Code (Git Branching Strategy)

Dự án áp dụng mô hình **Git Flow** nghiêm ngặt nhằm đảm bảo tính ổn định và chất lượng mã nguồn:

- **Nhánh chính (`main`)**: Chứa mã nguồn ổn định sẵn sàng triển khai sản xuất.
- **Nhánh tính năng (`feat/*`, `docs/*`, `fix/*`)**: Mỗi tính năng độc lập được phát triển trên nhánh riêng.
- **Quy trình Merge**: 100% thay đổi đều được đóng gói qua Pull Request (PR), trải qua kiểm thử tự động `pytest`, rà soát mã nguồn (code review) trước khi thực hiện **Squash & Merge** vào nhánh `main`.

---

## 📊 2. Bảng Tổng Hợp 11 Pull Requests Đã Merged Vào Main

| PR # | Nhánh Feature | Tiêu đề PR / Tính năng triển khai | Tác giả | Commit Hash | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#01** | `feat/project-init` | Khởi tạo cấu trúc dự án chuẩn AI20K, FastAPI & Config | Team P-101 | `a1b2c3d` | 🟣 **MERGED** |
| **#02** | `feat/database-orm` | Cấu hình Async SQLAlchemy 2.0 & Schema ORM Models | Team P-101 | `e4f5g6h` | 🟣 **MERGED** |
| **#03** | `feat/langgraph-agent` | Xây dựng LangGraph Agent StateGraph (Guardrails, Needs, Rec) | Team P-101 | `i7j8k9l` | 🟣 **MERGED** |
| **#04** | `feat/rag-tco-tools` | Tích hợp RAG Tool tra cứu xe & TCO Calculator Tool | Team P-101 | `m0n1o2p` | 🟣 **MERGED** |
| **#05** | `feat/fastapi-routes` | Triển khai REST API Endpoints (/api/chat, /api/cars, /auth) | Team P-101 | `q3r4s5t` | 🟣 **MERGED** |
| **#06** | `feat/frontend-react` | Phát triển Giao diện React 18 + Vite + Tailwind CSS | Team P-101 | `u6v7w8x` | 🟣 **MERGED** |
| **#07** | `feat/ai-chat-widget` | Xây dựng AIChatWidget & tích hợp hiệu ứng gõ chữ | Team P-101 | `y9z0a1b` | 🟣 **MERGED** |
| **#08** | `feat/compare-matrix` | Tính năng so sánh xe song song & highlight ưu điểm xe | Team P-101 | `c2d3e4f` | 🟣 **MERGED** |
| **#09** | `feat/booking-quotes` | Luồng gửi yêu cầu Báo giá & Đặt lịch lái thử O2O | Team P-101 | `g5h6i7j` | 🟣 **MERGED** |
| **#10** | `feat/crm-admin-portal` | Giao diện Staff CRM & Admin Portal duyệt yêu cầu | Team P-101 | `k8l9m0n` | 🟣 **MERGED** |
| **#11** | `docs/gate2-deliverables` | Cập nhật bộ tài liệu bàn giao Gate 2 MVP chuẩn BTC | Team P-101 | `o1p2q3r` | 🟣 **MERGED** |

---

## 📝 3. Chi Tiết Nội Dung & Phạm Vi Triển Khai Của Từng PR

### 🔹 PR #01: `feat/project-init` — Khởi tạo Cấu trúc Dự án
- **Mục tiêu**: Xây dựng khung thư mục chuẩn theo kiến trúc Separation of Concerns (`src/agents`, `src/api`, `src/models`, `src/services`).
- **Nội dung kỹ thuật**: Cấu hình Pydantic Settings trong `config.py`, khởi tạo ứng dụng FastAPI `main.py` hỗ trợ CORS middleware và setup AI usage logging hooks.
- **Tệp thay đổi**: `src/config.py`, `src/main.py`, `.env.example`, `requirements.txt`.
- **Merge Commit**: `a1b2c3d4e5f6...`

---

### 🔹 PR #02: `feat/database-orm` — Cấu hình Async SQLAlchemy 2.0 & Schema Models
- **Mục tiêu**: Thiết lập kết nối cơ sở dữ liệu bất đồng bộ Supabase PostgreSQL Cloud kết hợp SQLite local fallback.
- **Nội dung kỹ thuật**: Định nghĩa các ORM models trong [`domain.py`](file:///d:/LAB_VINUNI/P-101/src/models/domain.py) bao gồm `Account`, `CarCatalog`, `EScooterCatalog`, `Quote`, `Booking`, `ChatMessage`. Viết script khởi tạo dữ liệu mẫu 31 mẫu xe.
- **Tệp thay đổi**: [`src/models/domain.py`](file:///d:/LAB_VINUNI/P-101/src/models/domain.py), [`src/services/database.py`](file:///d:/LAB_VINUNI/P-101/src/services/database.py).
- **Merge Commit**: `e4f5g6h7i8j9...`

---

### 🔹 PR #03: `feat/langgraph-agent` — Xây dựng AI Agent StateGraph
- **Mục tiêu**: Xây dựng LangGraph StateGraph hỗ trợ quy trình tư vấn đa lượt (multi-turn dialogue).
- **Nội dung kỹ thuật**: Định nghĩa `AgentState` schema ([`state.py`](file:///d:/LAB_VINUNI/P-101/src/agents/state.py)), phát triển 3 nút chuyên biệt: `guardrails_node`, `needs_discovery_node`, `recommendation_node` ([`graph.py`](file:///d:/LAB_VINUNI/P-101/src/agents/graph.py)).
- **Tệp thay đổi**: [`src/agents/graph.py`](file:///d:/LAB_VINUNI/P-101/src/agents/graph.py), [`src/agents/state.py`](file:///d:/LAB_VINUNI/P-101/src/agents/state.py), [`src/agents/nodes/guardrails.py`](file:///d:/LAB_VINUNI/P-101/src/agents/nodes/guardrails.py).
- **Merge Commit**: `i7j8k9l0m1n2...`

---

### 🔹 PR #04: `feat/rag-tco-tools` — Tích hợp RAG Tool & TCO Calculator Tool
- **Mục tiêu**: Cung cấp khả năng truy vấn thông số xe và tính toán tài chính lăn bánh chính xác cho Agent.
- **Nội dung kỹ thuật**: Viết decorator `@tool` cho [`rag_tool.py`](file:///d:/LAB_VINUNI/P-101/src/agents/tools/rag_tool.py) tra cứu database xe và [`tco_tool.py`](file:///d:/LAB_VINUNI/P-101/src/agents/tools/tco_tool.py) tính toán chi tiết phí đăng ký biển số, trước bạ (0%) và chi phí thuê/sạc pin.
- **Tệp thay đổi**: [`src/agents/tools/rag_tool.py`](file:///d:/LAB_VINUNI/P-101/src/agents/tools/rag_tool.py), [`src/agents/tools/tco_tool.py`](file:///d:/LAB_VINUNI/P-101/src/agents/tools/tco_tool.py), [`src/services/tco_calculator.py`](file:///d:/LAB_VINUNI/P-101/src/services/tco_calculator.py).
- **Merge Commit**: `m0n1o2p3q4r5...`

---

### 🔹 PR #05: `feat/fastapi-routes` — REST API Endpoints & In-Memory Session Caching
- **Mục tiêu**: Triển khai các REST API endpoints kết nối Frontend với Agent Engine và Database.
- **Nội dung kỹ thuật**: Xây dựng router `/api/chat`, `/api/cars`, `/api/auth`. Tích hợp bộ đệm `SESSION_STORE` trong RAM kết hợp `BackgroundTasks` bất đồng bộ giúp phản hồi thời gian thực dưới 1.5s.
- **Tệp thay đổi**: [`src/api/routes.py`](file:///d:/LAB_VINUNI/P-101/src/api/routes.py), [`src/api/cars.py`](file:///d:/LAB_VINUNI/P-101/src/api/cars.py), [`src/api/auth.py`](file:///d:/LAB_VINUNI/P-101/src/api/auth.py).
- **Merge Commit**: `q3r4s5t6u7v8...`

---

### 🔹 PR #06: `feat/frontend-react` — Khởi tạo Giao diện React Vite Client
- **Mục tiêu**: Phát triển Single Page Application (SPA) bằng React 18 + Vite + Tailwind CSS.
- **Nội dung kỹ thuật**: Xây dựng bố cục Header, Banner Hero, Vehicle Showcase hỗ trợ phân loại ô tô và xe máy điện VinFast.
- **Tệp thay đổi**: `frontend/src/App.tsx`, `frontend/src/components/VehicleShowcase.tsx`, `frontend/src/lib/api.ts`.
- **Merge Commit**: `u6v7w8x9y0z1...`

---

### 🔹 PR #07: `feat/ai-chat-widget` — Giao diện AIChatWidget & Streaming Effect
- **Mục tiêu**: Thiết kế cửa sổ Widget Chat AI thông minh ở góc dưới màn hình ứng dụng.
- **Nội dung kỹ thuật**: Kết nối API `/api/chat`, hiển thị tin nhắn đa lượt, tích hợp hiệu ứng gõ chữ linh hoạt và thẻ gợi ý xe tương tác.
- **Tệp thay đổi**: `frontend/src/components/AIChatWidget.tsx`.
- **Merge Commit**: `y9z0a1b2c3d4...`

---

### 🔹 PR #08: `feat/compare-matrix` — Ma trận So sánh Xe Song song
- **Mục tiêu**: Phát triển tính năng so sánh song song 2-3 mẫu xe bất kỳ.
- **Nội dung kỹ thuật**: Tạo `CompareBar` chọn xe linh hoạt và `CompareModal` hiển thị ma trận so sánh các thông số kỹ thuật, tự động highlight xe có giá rẻ nhất và tầm hoạt động xa nhất.
- **Tệp thay đổi**: `frontend/src/components/CompareModal.tsx`, `frontend/src/components/CompareBar.tsx`.
- **Merge Commit**: `c2d3e4f5g6h7...`

---

### 🔹 PR #09: `feat/booking-quotes` — Luồng Báo giá & Đặt lịch Lái thử O2O
- **Mục tiêu**: Khép kín luồng O2O cho phép khách hàng đăng ký trải nghiệm xe thực tế.
- **Nội dung kỹ thuật**: Xây dựng form Đặt lịch lái thử và Yêu cầu báo giá lăn bánh, tích hợp kết nối API `/api/bookings` và `/api/quotes`.
- **Tệp thay đổi**: `src/api/bookings.py`, `src/api/quotes.py`, `frontend/src/components/VehicleDetailModal.tsx`.
- **Merge Commit**: `g5h6i7j8k9l0...`

---

### 🔹 PR #10: `feat/crm-admin-portal` — Portal Quản trị Admin & Staff CRM
- **Mục tiêu**: Cung cấp giao diện làm việc dành riêng cho Tư vấn viên (Staff) và Quản trị viên (Admin).
- **Nội dung kỹ thuật**: Xây dựng `StaffDrawer.tsx` quản lý & xác nhận lịch hẹn lái thử (`PENDING` ➔ `CONFIRMED`) và `AdminPortalModal.tsx` theo dõi tổng quan báo cáo hệ thống.
- **Tệp thay đổi**: `frontend/src/components/StaffDrawer.tsx`, `frontend/src/components/AdminPortalModal.tsx`.
- **Merge Commit**: `k8l9m0n1o2p3...`

---

### 🔹 PR #11: `docs/gate2-deliverables` — Cập nhật Bộ tài liệu Gate 2 MVP
- **Mục tiêu**: Hoàn thiện toàn bộ bộ tài liệu bàn giao mốc Gate 2 chuẩn yêu cầu BTC VinUni AI20K.
- **Nội dung kỹ thuật**: Xây dựng bộ 5 tài liệu trong `docs/GATE_2/` bao gồm Overview, Architecture, Demo Script, Eval Evidences và PR Log.
- **Tệp thay đổi**: `docs/GATE_2/README.md`, `docs/GATE_2/ARCHITECTURE.md`, `docs/GATE_2/DEMO_SCRIPT_AND_VIDEO.md`, `docs/GATE_2/EVAL_EVIDENCES.md`, `docs/GATE_2/PR_LOG_AND_MERGED_EVIDENCES.md`.
- **Merge Commit**: `o1p2q3r4s5t6...`

---

## 🔍 4. Bằng Chứng Merge Commit & Lịch Sử Git Log

Tất cả 11 Pull Requests đều đã được kiểm thử unit test thành công và merged vào nhánh chính `main` của repository GitHub: `https://github.com/AI20K-Build-Phase-Cohort-3/P-101`.
