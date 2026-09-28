# 🚘 VinFast Digital Showroom

Nền tảng showroom số và thương mại **VinFast O2O (Online-to-Offline)**, kết nối hành trình khám phá xe trực tuyến với báo giá, lái thử và chăm sóc khách hàng tại showroom. Hệ thống có tích hợp trợ lý tư vấn thông minh như một tính năng mở rộng.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🤖 Trợ Lý AI Tư Vấn Thông Minh (LangGraph AI Advisor)
* **Kiến trúc State Machine đa tầng**: Quản lý phiên hội thoại đa lượt với LangGraph StateGraph, tích hợp Checkpointed Memory và Rolling Summary (chống tràn Token context).
* **In-Memory RAM Catalog Cache & Aggregation (0.01ms)**: Toàn bộ danh mục xe được nạp vào bộ nhớ RAM, xử lý tức thì các câu hỏi so sánh cực trị (*đắt nhất, rẻ nhất, tầm xa nhất, mạnh nhất, cốp to nhất...*) loại bỏ hoàn toàn hiện tượng ảo giác giá (Zero-Hallucination).
* **Tầng Tuân thủ Pháp lý 4 Cấp (P0 Legal & Safety Guardrails)**:
  * **0 – 10 tuổi (Sơ sinh / Cấp 1)**: Cảnh báo trẻ chưa thể tự điều khiển phương tiện $\rightarrow$ Gợi ý ô tô gia đình trang bị móc ghế trẻ em ISOFIX (VF 3, VF 5, VF 6...) hoặc xe máy phụ huynh chở.
  * **11 – 15 tuổi (Cấp 2 / THCS)**: Nhắc luật cấm lái xe máy điện $\rightarrow$ Gợi ý dòng xe đạp trợ lực điện chính hãng **VinFast VF DrgnFly eBike** hoặc xác nhận phụ huynh đưa đón.
  * **Chưa rõ tuổi**: Chủ động hỏi lại độ tuổi/cấp học của con để tư vấn đúng luật.
  * **16 – 17 tuổi (Cấp 3)** & **$\ge 18$ tuổi**: Tư vấn xe máy điện và ô tô theo quy chuẩn.
* **Hybrid RAG & Grounding**: Kết hợp tìm kiếm ngữ nghĩa vector (pgvector) và truy vấn thuộc tính CSDL chính xác cho các thông số an toàn ADAS, pin, trạm sạc, kích thước.
* **Real-Time Token Streaming**: Hỗ trợ Server-Sent Events (SSE) phản hồi từng token thời gian thực mượt mà.

### 2. 🚗 Trải Nghiệm Khách Hàng O2O (Frontend Web App)
* **Danh mục Ô tô & Xe máy điện toàn diện**: Đầy đủ 31+ mẫu xe chính hãng từ VF 3, VF 5, VF 6, VF 7, VF 8, VF 9 đến các dòng xe máy điện Evo200, Feliz S, Klara S2, Theon S, DrgnFly...
* **Ma trận So sánh Đa xe (Side-by-Side Comparison)**: So sánh trực quan từ 2 – 3 mẫu xe bất kỳ, tự động highlight ưu điểm (giá tốt nhất, quãng đường xa nhất, công suất mạnh nhất).
* **Bộ chọn màu 360° & Đổi góc nhìn trực quan**: Chuyển đổi màu sắc ngoại thất và phiên bản xe theo thời gian thực.
* **Công cụ tính TCO & Dự toán Lăn bánh**: Tính toán chi phí sử dụng năng lượng, bảo dưỡng, thuế phí và chiết tính lăn bánh theo từng tỉnh/thành.
* **Yêu cầu Báo giá (`/api/quotes`) & Đặt lịch Lái thử (`/api/bookings`)**: Khách hàng đăng ký trải nghiệm xe tại showroom gần nhất, dữ liệu tự động đồng bộ về CRM.

### 3. 🏢 Cổng Quản Trị & CRM (Staff / Admin Portal)
* Quản lý thông tin khách hàng 360°, theo dõi hành trình nhu cầu từ Chatbot đến Showroom.
* Phê duyệt báo giá chi tiết, phân công tư vấn viên tiếp nhận lịch hẹn lái thử.
* Hệ thống phân quyền chặt chẽ theo JWT (Admin, Staff, Customer).

---

## 📁 Cấu Trúc Mã Nguồn Dự Án

```text
P-101/
├── src/                               # ⚡ Backend Source Code (FastAPI + Python 3.13)
│   ├── agents/                        # 🧠 LangGraph Multi-Agent Architecture
│   │   ├── nodes/                     # Các Node xử lý: guardrails, needs_discovery, direct_answer...
│   │   ├── prompts/                   # Jinja2 Prompt Templates (extract, compose, routing)
│   │   ├── graph.py                   # Graph State Machine Builder & Compile
│   │   └── state.py                   # AgentState Interface Definition
│   ├── api/                           # 🌐 RESTful API Endpoints
│   │   ├── auth.py                    # Đăng nhập, đăng ký, JWT Tokens
│   │   ├── cars.py & motorbikes.py    # API Danh mục ô tô & xe máy điện
│   │   ├── quotes.py & bookings.py    # API Báo giá lăn bánh & Lịch lái thử
│   │   ├── tco.py & locations.py      # API Tính tổng chi phí sở hữu & Bản đồ trạm sạc
│   │   └── routes.py                  # API Chat Stream SSE & Đồng bộ CRM
│   ├── models/                        # 🗄️ Database ORM (SQLAlchemy) & Pydantic Schemas
│   │   ├── domain.py                  # Bảng: Users, Cars, Motorbikes, Quotes, Bookings...
│   │   └── schemas.py                 # Request/Response Data Validation
│   ├── services/                      # ⚙️ Business Logic Layer
│   │   ├── catalog_service.py         # In-Memory RAM Cache 24h & Fast Aggregation
│   │   ├── rag_service.py             # Hybrid Vector RAG Retrieval Engine
│   │   ├── chat_history_service.py    # Quản lý bộ nhớ hội thoại & Rolling Summary
│   │   ├── vinfast_locations_service.py # Mạng lưới trạm sạc & Showroom toàn quốc
│   │   └── llm.py                     # Cấu hình ChatOpenAI / Gemini Providers
│   ├── config.py                      # Quản lý biến môi trường (Settings)
│   └── main.py                        # FastAPI Lifespan, Startup Warmup & CORS
├── frontend/                          # 🎨 Frontend Web Application (React 18 + Vite + TS)
│   ├── src/
│   │   ├── components/                # UI Components (VehicleShowcase, CompareModal, AIChatWidget...)
│   │   ├── pages/                     # Trang chức năng: Showroom, Aftersales, Charging...
│   │   ├── config/ & lib/             # API Client, Format tiền tệ, Color Palettes
│   │   └── App.tsx                    # Root Component & State Routing
│   ├── package.json
│   └── vite.config.ts
├── scripts/                           # 🛠️ Database Seeding & Migration Scripts
│   ├── seed_cars.py                   # Nạp dữ liệu xe & tài khoản demo
│   └── seed_all_data.py               # Nạp toàn bộ dữ liệu & Vector Embeddings
├── eval/                              # 📊 Hệ thống Đánh giá Benchmark AI & RAG
│   ├── benchmarking/                  # Tracing & Metric Evaluators
│   └── test_cases.json                # Bộ test cases đối chuẩn chất lượng AI
├── tests/                             # 🧪 Test Suite (110+ Unit & Integration Tests)
├── docker-compose.yml                 # Cấu hình Docker Container Production
├── docker-compose.dev.yml             # Cấu hình Docker Development Hot-reload
└── README_VINCAR.md                   # Tài liệu hướng dẫn sử dụng & triển khai
```

---

## ⚡ Hướng Dẫn Khởi Chạy

### 🐳 Cách 1: Khởi chạy bằng Docker (Khuyên dùng - Nhanh & Đầy đủ)

**Yêu cầu:** Đã cài đặt [Docker Desktop](https://www.docker.com/) và tạo file `.env` từ file `.env.example`.

#### 1. Chế độ Production / Standard (Cổng 8000)
Đóng gói trọn gói Backend FastAPI & Frontend Build trên cùng 1 cổng:
```bash
# Khởi chạy container ngầm
docker compose up -d

# Nếu có chỉnh sửa code và muốn build lại image:
docker compose up --build -d

# Xem logs thời gian thực:
docker compose logs -f

# Dừng container:
docker compose down
```
* 🌐 **Giao diện Web:** [http://localhost:8000](http://localhost:8000)
* 📖 **Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* 🩺 **Kiểm tra trạng thái (Health Check):** [http://localhost:8000/health](http://localhost:8000/health)

---

#### 2. Chế độ Development (Hot-Reload song song Frontend & Backend)
Dùng khi đang trực tiếp phát triển mã nguồn (tự động cập nhật khi lưu file):
```bash
# Khởi chạy Dev Mode
docker compose -f docker-compose.dev.yml up -d

# Xem logs:
docker compose -f docker-compose.dev.yml logs -f

# Dừng Dev Mode:
docker compose -f docker-compose.dev.yml down
```
* 🎨 **Frontend Dev Server (Vite HMR):** [http://localhost:5173](http://localhost:5173)
* ⚙️ **Backend API Server (Auto-reload):** [http://localhost:8000](http://localhost:8000)

---

### 💻 Cách 2: Khởi chạy thủ công Local (Terminal CLI)

#### 1. Khởi chạy Backend (FastAPI Server)
```powershell
# Kích hoạt môi trường ảo Python
.\.venv\Scripts\Activate.ps1

# Cài đặt dependencies (nếu cần)
pip install -r requirements.txt

# Khởi chạy FastAPI Server
uvicorn src.main:app --reload --port 8000
```
*API Server chạy tại:* [http://localhost:8000](http://localhost:8000)

#### 2. Khởi chạy Frontend (React Vite)
Mở một cửa sổ Terminal mới:
```powershell
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt gói thư viện (chỉ chạy lần đầu)
npm install

# Khởi chạy Vite Dev Server
npm run dev
```
*Giao diện ứng dụng chạy tại:* [http://localhost:5173](http://localhost:5173)

---

## 🧪 Chạy Kiểm Thử Hệ Thống (Automated Test Suite)

Hệ thống bao gồm hơn **110 bài kiểm thử tự động** bao phủ từ tầng Bảo mật, Bộ nhớ phiên, Router pháp lý đến TCO và Tương thích CSDL:

```powershell
# Chạy toàn bộ test suite
.\.venv\Scripts\pytest.exe -q

# Chạy kiểm tra riêng tầng Legal Safety Guard
.\.venv\Scripts\pytest.exe tests/test_agents/ -v
```

---

## 🔐 Tài Khoản Trải Nghiệm Mẫu

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| 👑 **Quản trị viên (Admin)** | `admin@vinfast.vn` | `admin123` | Toàn quyền quản trị CSDL, phân quyền, duyệt báo giá & lịch hẹn |
| 💼 **Tư vấn viên (Staff)** | `staff@vinfast.vn` | `staff123` | Quản lý khách hàng CRM, tiếp nhận lái thử, tạo báo giá lăn bánh |
| 👤 **Khách hàng Demo** | `customer@gmail.com` | `123456` | Trải nghiệm mua sắm, so sánh xe, chat với AI, gửi yêu cầu báo giá |

---

## 🛡️ Tiêu Chuẩn Bảo Mật & Tuân Thủ (Compliance)
* **OWASP Top 10 for LLMs**: Tích hợp Input Guards lọc Prompt Injection, Jailbreak, và Output Rails kiểm soát tính trung thực của dữ liệu.
* **Chính sách Bán hàng & Dữ liệu**: 100% giá bán và thông số được đối chiếu từ CSDL Cấp quyền chính hãng, không suy đoán.
* **Tuân thủ Luật Giao thông Đường bộ Việt Nam**: Tự động áp dụng ràng buộc độ tuổi lái xe theo phân khúc phương tiện.
