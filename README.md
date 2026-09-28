# VinFast Digital Showroom

Nền tảng showroom số và bán hàng O2O (Online-to-Offline) dành cho hệ sinh thái xe điện VinFast. Hệ thống kết nối hành trình khám phá xe trực tuyến với báo giá, đặt lịch lái thử, chăm sóc khách hàng và vận hành CRM tại showroom.

> Đây là dự án học tập/trình diễn độc lập, không phải sản phẩm chính thức của VinFast.

## Chức năng chính

- Danh mục ô tô và xe máy điện, hiển thị phiên bản, màu sắc và thông số kỹ thuật.
- So sánh trực quan 2–3 mẫu xe và làm nổi bật ưu điểm của từng mẫu.
- Tính chi phí lăn bánh và tổng chi phí sở hữu (TCO) theo nhu cầu sử dụng.
- Tra cứu showroom và trạm sạc theo tỉnh/thành.
- Gửi yêu cầu báo giá và đặt lịch lái thử.
- Tài khoản theo vai trò `customer`, `consultant` và `admin`.
- CRM quản lý hồ sơ khách hàng, nhu cầu, báo giá và lịch hẹn.
- Trợ lý tư vấn tích hợp LangGraph và RAG (tính năng mở rộng của showroom số).

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI, Python, Pydantic |
| Database | SQLAlchemy Async, SQLite/PostgreSQL, Supabase |
| Authentication | JWT, phân quyền theo vai trò |
| AI/RAG | LangGraph, LangChain, OpenAI/Google GenAI, pgvector |
| Triển khai | Docker, Vercel, Render |

## Cấu trúc dự án

```text
.
├── frontend/            # Ứng dụng React/Vite
├── src/
│   ├── agents/          # Luồng trợ lý tư vấn LangGraph
│   ├── api/             # REST API FastAPI
│   ├── models/          # Pydantic schema và SQLAlchemy model
│   └── services/        # Nghiệp vụ, database, RAG và TCO
├── tests/               # Unit và integration tests
├── eval/                # Kịch bản benchmark/evaluation
├── docs/                # Tài liệu kỹ thuật
├── scripts/             # Script thiết lập và dữ liệu
├── Dockerfile
└── docker-compose.yml
```

## Chạy bằng Docker

Yêu cầu: Docker Desktop và một file `.env` được tạo từ `.env.example`.

```bash
docker compose up --build -d
```

Sau khi khởi động:

- Web app: <http://localhost:8000>
- Swagger UI: <http://localhost:8000/docs>
- OpenAPI JSON: <http://localhost:8000/openapi.json>
- Health check: <http://localhost:8000/health>

## Chạy ở chế độ phát triển

Yêu cầu: Python 3.11 trở lên và Node.js 18 trở lên.

### Backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn src.main:app --reload --port 8000
```

### Frontend

Mở terminal khác:

```powershell
Set-Location frontend
npm install
npm run dev
```

Frontend chạy tại <http://localhost:5173> và backend tại <http://localhost:8000>.

## Cấu hình môi trường

Sao chép `.env.example` thành `.env`, sau đó điền các giá trị phù hợp. Không commit file `.env` hoặc khóa bí mật lên Git.

Các nhóm biến quan trọng:

- `DATABASE_URL`: kết nối SQLite/PostgreSQL.
- `SECRET_KEY`: khóa ký JWT; bắt buộc thay bằng giá trị mạnh khi triển khai.
- `CORS_ORIGINS`: danh sách origin được phép gọi API.
- `SUPABASE_URL`, `SUPABASE_KEY`: kết nối Supabase nếu sử dụng.
- `OPENAI_API_KEY`: chỉ cần khi bật tính năng trợ lý tư vấn.
- `LANGSMITH_*`: cấu hình tracing tùy chọn.

## API

Base URL được khuyến nghị là `http://localhost:8000/api/v1`. Hệ thống hiện cũng duy trì alias `/api` để tương thích với frontend và client cũ.

Các nhóm endpoint gồm:

- `/auth`: đăng ký, đăng nhập và quản lý tài khoản.
- `/cars`, `/motorbikes`: danh mục và quản trị phương tiện.
- `/locations`: showroom và trạm sạc.
- `/tco`: tính chi phí sở hữu.
- `/quotes`, `/bookings`: báo giá và lịch lái thử.
- `/customer-profiles`, `/crm/profiles`: hồ sơ khách hàng và CRM.
- `/chat`: trợ lý tư vấn tích hợp.

Xem bảng endpoint, quyền truy cập, tham số và ví dụ request tại [docs/API.md](docs/API.md).

## Kiểm thử

```powershell
pytest -q
Set-Location frontend
npm run typecheck
npm run build
```

## Thành viên

- Lê Hoàng Việt
- Hoàng Lê Minh
- Nguyễn Văn A

## Repository

<https://github.com/vietlhwork-arch/VinFast-Digital-Showroom>
