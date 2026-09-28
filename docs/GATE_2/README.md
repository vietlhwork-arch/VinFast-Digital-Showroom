# 🚀 Gate 2 — MVP Overview & Setup Instructions

> **Hệ thống Thương mại Điện tử O2O VinFast & AI Advisor Agent Tư vấn Bán hàng Thông minh**  
> **Dự án**: VinUni AI20K Build Phase — Cohort 3 (Team P-101)  
> **Cột mốc**: Gate 2 — Minimum Viable Product (MVP)  
> **Trạng thái**: 🚀 Sẵn sàng Đánh giá & Bàn giao (Ready for Evaluation)  

---

## 📌 1. Tổng Quan Dự Án & Mục Tiêu MVP Gate 2

Dự án **VinFast O2O Sales System** kết hợp **AI Sales Advisor Agent** được phát triển nhằm tự động hóa và nâng cao trải nghiệm mua sắm sản phẩm ô tô và xe máy điện VinFast theo mô hình khép kín từ Online đến Offline (O2O). 

Cột mốc **Gate 2 — Minimum Viable Product (MVP)** đáp ứng 100% tiêu chí chạy end-to-end với mô hình ngôn ngữ lớn (LLM OpenAI GPT-4o-mini thực tế, không mock), hỗ trợ khách hàng từ khâu tra cứu thông số kỹ thuật, tư vấn nhu cầu tài chính, tính toán tổng chi phí sở hữu (TCO), so sánh dòng xe song song đến đặt lịch trải nghiệm và gửi yêu cầu báo giá lăn bánh.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LUỒNG TRẢI NGHIỆM KHÁCH HÀNG END-TO-END (O2O USER FLOW)                               │
├─────────────────┬───────────────────┬──────────────────────┬───────────────────────────┤
│ 1. Khám phá     │ 2. AI Tư vấn      │ 3. So sánh & TCO     │ 4. Chuyển đổi O2O         │
│ Xem danh mục 31 │ Chatbot phân tích │ So sánh song song &  │ Đặt lịch lái thử / Báo giá│
│ mẫu ô tô & xe   │ tài chính, số     │ tính toán chi phí lăn│ ➔ Đồng bộ tức thì tới CRM │
│ máy điện VinFast│ chỗ & nhu cầu đi  │ bánh theo tỉnh thành │ của Tư vấn viên & Admin   │
└─────────────────┴───────────────────┴──────────────────────┴───────────────────────────┘
```

### 🌟 Các Đặc Điểm Kỹ Thuật Nổi Bật của MVP:
1. **LangGraph Pipeline Đa Lượt (Multi-turn Agent)**: Kiến trúc StateGraph điều hướng linh hoạt 3 nút chính:
   - `Guardrails Node`: Phân loại Intent và lọc các thắc mắc nằm ngoài phạm vi xe VinFast (Out-of-Scope).
   - `Needs Discovery Node`: Bóc tách thông tin nhu cầu (ngân sách tối đa, số chỗ ngồi, loại xe, quãng đường di chuyển).
   - `Recommendation Node`: Kích hoạt custom tools tra cứu database và xuất bảng đề xuất xe tối ưu.
2. **RAG & Custom Tools Thực Tế (@tool)**:
   - [`rag_tool.py`](file:///d:/LAB_VINUNI/P-101/src/agents/tools/rag_tool.py): Tra cứu cơ sở dữ liệu 31 dòng ô tô điện (VF 3 đến VF 9) và xe máy điện (Feliz S, Evo200, Klara S, Vento S, Theon S).
   - [`tco_tool.py`](file:///d:/LAB_VINUNI/P-101/src/agents/tools/tco_tool.py): Tính toán chính xác tổng chi phí sở hữu (TCO), phí biển số, lệ phí trước bạ (0% cho xe điện), bảo hiểm và gói thuê/sạc pin hàng tháng.
3. **Phản Hồi Siêu Tốc (Sub-1.5s Latency)**: Quản lý session state trong RAM (`SESSION_STORE`) phục vụ phản hồi tức thì cho Client, kết hợp `BackgroundTasks` bất đồng bộ để lưu nhật ký hội thoại vào cơ sở dữ liệu mà không gây nghẽn luồng (non-blocking).
4. **Bảo Mật & Tuân Thủ Chuẩn Doanh Nghiệp**: Tự động chèn Tuyên bố pháp lý (Legal Disclaimer) ở cuối câu trả lời tư vấn tài chính lăn bánh và tích hợp xác thực JWT Role-Based Access Control (RBAC).

---

## 🎬 Video Demo MVP (03:36)

- 📹 **Link Video Demo (Google Drive)**: [https://drive.google.com/drive/folders/1kTHHzcbjIAmUHgjDHXvyl46tJT_b7GGM?usp=sharing](https://drive.google.com/drive/folders/1kTHHzcbjIAmUHgjDHXvyl46tJT_b7GGM?usp=sharing)
- ⏱️ **Thời lượng**: 03:36 (Trình diễn trọn vẹn luồng O2O User Flow End-to-End với LLM OpenAI thực tế)

---

## 📂 2. Cấu Trúc Thư Mục Dự ÁnChi Tiết (Directory Structure)

```
team-P-101/
├── README.md                      # 📖 README chính của Repository
├── ARCHITECTURE.md                # 📐 Sơ đồ Kiến trúc Hệ thống
├── JOURNAL.md / WORKLOG.md        # 📝 Nhật ký phát triển dự án
├── .env.example                   # 🔑 Biến môi trường mẫu
├── Dockerfile / docker-compose.yml# 🐳 Cấu hình Containerize
├── requirements.txt               # 📦 Dependencies Python
├── src/                           # 🧠 Backend Core Engine (FastAPI & LangGraph)
│   ├── main.py                    # 🚀 Entrypoint ứng dụng FastAPI (CORS, Routes, Static)
│   ├── config.py                  # ⚙️ Pydantic Settings quản lý env vars
│   ├── agents/                    # 🤖 AI Agent Engine (LangGraph)
│   │   ├── graph.py               #    Xây dựng StateGraph (Guardrails ➔ Needs ➔ Recommendation)
│   │   ├── state.py               #    Định nghĩa AgentState (TypedDict)
│   │   ├── nodes/                 #    Các nút xử lý của Agent
│   │   │   ├── guardrails.py      #    Nút kiểm soát & phân loại Intent
│   │   │   ├── needs_discovery.py #    Nút phân tích & trích xuất nhu cầu khách hàng
│   │   │   └── recommendation.py  #    Nút tư vấn xe & chèn Disclaimer
│   │   └── tools/                 #    Custom Tools của Agent (@tool)
│   │       ├── rag_tool.py        #    RAG tra cứu danh mục xe VinFast
│   │       └── tco_tool.py        #    Tool tính toán chi phí lăn bánh TCO
│   ├── api/                       # 🌐 FastAPI Endpoints Router
│   │   ├── routes.py              #    Router chính (/api/chat)
│   │   ├── cars.py                #    Router xe ô tô (/api/cars)
│   │   ├── motorbikes.py          #    Router xe máy điện (/api/motorbikes)
│   │   ├── auth.py                #    Router xác thực JWT (/api/auth)
│   │   ├── bookings.py            #    Router đặt lịch lái thử (/api/bookings)
│   │   └── quotes.py              #    Router báo giá (/api/quotes)
│   ├── models/                    # 🗄️ Database & Schemas
│   │   ├── domain.py              #    SQLAlchemy ORM Models (Account, CarCatalog, Quote, Booking)
│   │   └── schemas.py             #    Pydantic Schemas request/response
│   └── services/                  # 🔧 Business Logic & Operations
│       ├── database.py            #    Async SQLAlchemy session engine (PostgreSQL/SQLite)
│       └── tco_calculator.py      #    Thuật toán tính chi phí lăn bánh & nuôi xe
├── frontend/                      # 🌐 Client SPA (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── App.tsx                #    Main SPA Layout & Context Provider
│   │   ├── components/            #    UI Components
│   │   │   ├── AIChatWidget.tsx   #    Widget Chat AI với hiệu ứng typing & đề xuất
│   │   │   ├── VehicleShowcase.tsx#    Giao diện danh mục xe
│   │   │   ├── CompareBar.tsx     #    Thanh chọn xe so sánh linh hoạt
│   │   │   ├── CompareModal.tsx   #    Ma trận so sánh song song & Highlight thông minh
│   │   │   ├── StaffDrawer.tsx    #    Portal CRM cho Tư vấn viên duyệt lịch
      │   │   └── AdminPortalModal.tsx#   Dashboard Admin quản trị doanh số & tài khoản
│   │   └── lib/api.ts             #    Axios / Fetch API Client
├── docs/                          # 📖 Tài liệu Dự án
│   └── GATE_2/                    # 📦 Bộ tài liệu bàn giao Gate 2 MVP
│       ├── README.md              #    Tài liệu Hướng dẫn Setup & Tổng quan
│       ├── ARCHITECTURE.md        #    Sơ đồ Kiến trúc & Data Flow
│       ├── DEMO_SCRIPT_AND_VIDEO.md#   Kịch bản Demo Video 3 phút
│       ├── EVAL_EVIDENCES.md      #    Bằng chứng 05 Test Cases Manual thực tế
│       └── PR_LOG_AND_MERGED_EVIDENCES.md # Log 11 Merged PRs
├── eval/                          # 📊 Framework Đánh giá Quality (Golden Dataset)
└── tests/                         # 🧪 Bộ Unit & Integration Tests (pytest)
```

---

## ⚡ 3. Hướng Dẫn Khởi Chạy Môi Trường (Setup Instructions)

### 📋 Yêu cầu hệ thống:
- **Python**: `>= 3.11` (Khuyên dùng Python 3.11 hoặc 3.13)
- **Node.js**: `>= 18.x` & `npm >= 9.x`
- **Git**

---

### Bước 1: Clone Repository & Cấu hình Python Backend

```bash
# 1. Di chuyển vào thư mục dự án
cd team-P-101

# 2. Khởi tạo virtual environment
python -m venv .venv

# 3. Kích hoạt môi trường ảo:
# Trên Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Trên Linux / macOS:
source .venv/bin/activate

# 4. Cài đặt toàn bộ dependencies backend
pip install -e ".[dev]"
```

---

### Bước 2: Cấu hình Frontend React Client

Mở cửa sổ Terminal thứ 2:

```bash
cd frontend
npm install
cd ..
```

---

## 🔑 4. Cấu Hình Biến Môi Trường (Environment Variables)

Tạo file `.env` tại thư mục gốc của dự án (`P-101/.env`) dựa trên file mẫu `.env.example`:

| Tên Biến | Ý Nghĩa & Mục Đích | Giá Trị Mẫu / Khuyên Dùng |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | Key truy cập API của OpenAI để gọi mô hình GPT-4o-mini | `sk-proj-xxxxxx...your-key...` |
| `OPENAI_MODEL` | Tên mô hình ngôn ngữ được Agent sử dụng | `gpt-4o-mini` |
| `DATABASE_URL` | Chuỗi kết nối Database Async SQLAlchemy (PostgreSQL / SQLite) | `postgresql+asyncpg://postgres:pass@db.supabase.co:5432/postgres` |
| `JWT_SECRET` | Khóa bí mật mã hóa và giải mã JSON Web Token | `vinfast_o2o_super_secret_jwt_key_2026` |
| `JWT_ALGORITHM` | Thuật toán mã hóa chữ ký số JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Thời gian hết hạn của Access Token (phút) | `1440` (24 giờ) |
| `VITE_API_URL` | URL kết nối Backend API dành cho Frontend Client | `http://localhost:8000` |

---

## 🏃 5. Lệnh Chạy Server (Quickstart Commands)

### 🔹 1. Chạy FastAPI Backend Server
```powershell
# Chạy uvicorn từ thư mục gốc P-101
.\.venv\Scripts\uvicorn src.main:app --reload --port 8000
```
- **FastAPI Base URL**: `http://localhost:8000`
- **Swagger Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

### 🔹 2. Chạy Frontend React Client Server
```powershell
# Mở Terminal thứ 2 tại thư mục frontend/
cd frontend
npm run dev
```
- **Giao diện Client chạy tại**: [http://localhost:5173](http://localhost:5173)

---

## 🌐 6. Danh Sách REST API Endpoints Chính

| HTTP Method | Endpoint | Mô Tả Chức Năng | Phân Quyền |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat` | Gửi tin nhắn chat tới AI Advisor Agent (giao tiếp đa lượt) | Public / Customer |
| `GET` | `/api/cars` | Lấy danh sách 31 dòng ô tô điện VinFast (có bộ lọc) | Public |
| `GET` | `/api/motorbikes` | Lấy danh sách các dòng xe máy điện VinFast | Public |
| `POST` | `/api/bookings` | Đăng ký lịch hẹn lái thử trải nghiệm xe | Customer |
| `GET` | `/api/bookings` | Lấy danh sách lịch hẹn cần duyệt (cho CRM Staff) | Staff / Admin |
| `PUT` | `/api/bookings/{id}` | Cập nhật trạng thái lịch hẹn (`PENDING` ➔ `CONFIRMED`) | Staff / Admin |
| `POST` | `/api/quotes` | Gửi yêu cầu nhận báo giá lăn bánh chi tiết | Customer |
| `POST` | `/api/auth/login` | Đăng nhập hệ thống & lấy JWT Bearer Token | Public |

---

## 💬 7. Mẫu Câu Lệnh Trải Nghiệm AI Advisor Agent (Sample Queries)

Bạn có thể thử nghiệm trực tiếp tại Widget Chat góc dưới màn hình ứng dụng Web:

1. **Tư vấn tài chính & nhu cầu xe gia đình**:
   > *"Gia đình tôi có 5 người, ngân sách khoảng 600 triệu muốn tìm ô tô điện VinFast đi làm hàng ngày 30km, tư vấn xe phù hợp."*
   - *Kỳ vọng*: Agent trích xuất nhu cầu (`CAR`, `600M`, `5 chỗ`), gợi ý **VF 5 Plus** và **VF e34**, chèn bảng so sánh chi phí đi lại.

2. **Tra cứu xe máy điện cho học sinh / sinh viên**:
   > *"Tôi cần tìm xe máy điện VinFast cho học sinh đi học hàng ngày, tầm giá dưới 25 triệu như Feliz S hoặc Evo200."*
   - *Kỳ vọng*: Agent truy vấn danh mục xe máy điện (`escooter_catalog`), đề xuất **Evo200 Lite** (không cần bằng lái) và **Feliz S**.

3. **Tính toán tổng chi phí sở hữu (TCO) & lăn bánh**:
   > *"Tính chi phí lăn bánh và chi phí vận hành hàng tháng cho xe VF 8 Eco mua pin ở Hà Nội chạy 1,500 km/tháng."*
   - *Kỳ vọng*: Agent kích hoạt `tco_tool.py`, xuất bảng phân rã chi phí trước bạ (0%), phí biển số Hà Nội (20 tr), phí đăng ký và chi phí thuê/sạc pin hàng tháng.

4. **Kiểm thử An toàn & Chặn câu hỏi ngoài phạm vi (Guardrails)**:
   > *"Dự báo thời tiết Hà Nội hôm nay thế nào?"* hoặc *"Tỷ số trận derby Manchester tối qua là bao nhiêu?"*
   - *Kỳ vọng*: Nút `guardrails_node` nhận diện intent `OUT_OF_SCOPE`, ngay lập tức chặn và từ chối lịch sự, hướng dẫn người dùng quay lại chủ đề bán hàng xe VinFast.

---

## 🔐 8. Danh Sách Tài Khoản Thử Nghiệm (Test Accounts)

Hệ thống hỗ trợ 3 phân quyền đăng nhập sẵn để kiểm thử trọn vẹn luồng O2O:

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng kiểm thử chính |
| :--- | :--- | :--- | :--- |
| **👑 Admin (Quản trị)** | `admin@vinfast.vn` | `admin123` | Mở **Admin Portal Modal**: Xem tổng quan doanh số, quản lý tài khoản người dùng, duyệt đơn báo giá lăn bánh. |
| **💼 Staff (Tư vấn viên)** | `staff@vinfast.vn` | `staff123` | Mở **Staff Drawer CRM**: Tiếp nhận lịch hẹn lái thử của khách hàng từ Web, cập nhật trạng thái `PENDING` ➔ `CONFIRMED`. |
| **👤 Customer (Khách hàng)** | `customer@gmail.com` | `123456` | Trải nghiệm AI Advisor Chat, chọn xe so sánh song song, gửi form Đặt lịch lái thử và Yêu cầu báo giá. |

---

## 🧪 9. Hướng Dẫn Chạy Automated Tests

Dự án tích hợp bộ kiểm thử tự động với `pytest` kiểm tra tính đúng đắn của Agent Graph và các REST API endpoints:

```powershell
# Run toàn bộ test suite
.\.venv\Scripts\pytest

# Run chi tiết test luồng Agent Graph
.\.venv\Scripts\pytest tests/test_agents/test_graph.py -v

# Run test các API Endpoints
.\.venv\Scripts\pytest tests/test_api/ -v
```

---

## ❓ 10. Các Vấn Đề Thường Gặp & Cách Xử Lý (Troubleshooting FAQ)

1. **Lỗi kết nối OpenAI API (Rate limit hoặc Invalid Key)**:
   - *Nguyên nhân*: Chưa điền `OPENAI_API_KEY` trong file `.env` hoặc tài khoản hết hạn ngạch.
   - *Khắc phục*: Kiểm tra file `.env` tại thư mục gốc, cập nhật key mới còn hiệu lực.
2. **Lỗi không kết nối được Database PostgreSQL Supabase**:
   - *Nguyên nhân*: Mạng gián đoạn hoặc chuỗi `DATABASE_URL` sai mật khẩu.
   - *Khắc phục*: Chuyển `DATABASE_URL` sang dùng SQLite local để test offline:  
     `DATABASE_URL=sqlite+aiosqlite:///./data/vinfast.db`
3. **Lỗi Read-only File System trên Vercel / Cloud Serverless**:
   - *Nguyên nhân*: Serverless môi trường Cloud không cho ghi tệp tĩnh vào thư mục root.
   - *Khắc phục*: Hệ thống đã được tích hợp tự động chuyển thư mục ghi tạm sang `/tmp/static` tại `src/main.py`.

---

## 📄 11. Liên Hệ & Hỗ Trợ (Team P-101)

- **Đơn vị chủ quản**: VinUni AI20K Build Phase (Cohort 3)
- **Đội ngũ phát triển**: Team P-101
- **Mentor hướng dẫn**: Lê Văn Thể
- **Repository chính thức**: [`AI20K-Build-Phase-Cohort-3/P-101`](https://github.com/AI20K-Build-Phase-Cohort-3/P-101)
