# Kế hoạch Pha 1, Pha 2 và phân công nhóm

## Definition of Done Pha 1

- Có REST JSON với GET, POST, DELETE; OpenAPI mở được và schema khớp runtime.
- Business chat không import FastAPI/SQLAlchemy; persistence đi qua repository.
- Login JWT, protected GET/POST và RBAC tập trung hoạt động đúng.
- Customer và staff trao đổi realtime; reload trang vẫn đọc được lịch sử.
- Customer không đọc được hội thoại của customer khác.
- Docker build được; healthcheck trả database status.
- `pytest`, typecheck và frontend build pass.
- README, API spec, kiến trúc và hướng dẫn load test khớp code.

## Phân công ba thành viên

Mỗi hạng mục có một owner và một reviewer. Lead không ôm toàn bộ implementation; trách nhiệm tích hợp được tách khỏi quyền phê duyệt chất lượng.

| Thành viên | Owner Pha 1 | Deliverable kiểm chứng được | Reviewer |
|---|---|---|---|
| **Lê Hoàng Việt (Lead)** | Kiến trúc, auth/RBAC, tích hợp, Docker, chuẩn API/docs | dependency rule; JWT/role tests; OpenAPI; Docker smoke test; release checklist | Minh review auth; Toán review docs/UI contract |
| **Hoàng Lê Minh** | Catalog, quote, booking, repository/data và load test | seed idempotent; CRUD tests; ownership quote/booking; Kaggle baseline JSON/CSV | Việt review backend; Toán thử luồng UI |
| **Nguyễn Văn Toán** | Realtime chat frontend, UX ba role và E2E | widget responsive; reconnect/fallback; customer–staff scenario; ảnh/video demo | Việt review socket security; Minh review data/history |

### Checklist Lê Hoàng Việt

- Duy trì sơ đồ dependency và review không cho business import framework/ORM.
- Chuẩn hóa lỗi `401/403/404/422`, CORS và secret production.
- Chạy integration suite, typecheck, build; gắn tag release Pha 1.
- Đảm bảo Swagger và tài liệu endpoint không lệch code.

### Checklist Hoàng Lê Minh

- Kiểm tra dữ liệu catalog từ nguồn snapshot, không ghi đè bản ghi đã chỉnh tay.
- Viết test quyền sở hữu quote/booking và CRUD catalog.
- Chuẩn bị notebook Kaggle, giữ nguyên CPU/dataset/commit cho mọi lần đo.
- Xuất bảng RPS, p95, p99, error rate; lưu raw result để tái lập.

### Checklist Nguyễn Văn Toán

- Hoàn thiện empty/loading/error/offline states của chat.
- Kiểm tra customer tạo hội thoại, staff nhận, hai phía gửi, đóng và tải lại history.
- Kiểm tra mobile/desktop, keyboard focus, màu tương phản và nội dung trạng thái.
- Viết kịch bản demo 3–5 phút dựa đúng API hiện hành.

## Cách chia nhánh và commit

- Nhánh: `feature/auth-rbac`, `feature/catalog-workflow`, `feature/realtime-chat`, `docs/phase-delivery`.
- Commit nhỏ theo Conventional Commits: `feat(chat): ...`, `test(auth): ...`, `docs(api): ...`.
- PR phải nêu mục tiêu, ảnh/UI nếu có, endpoint thay đổi, cách test và rủi ro.
- Ít nhất một thành viên khác review; author tự merge chỉ khi sửa lỗi khẩn cấp có ghi chú.

## Lịch Pha 1 đề xuất

| Mốc | Việt | Minh | Toán | Cổng nghiệm thu |
|---|---|---|---|---|
| Ngày 1–2 | chốt scope/architecture | chuẩn hóa data/seed | wireflow chat | API contract được duyệt |
| Ngày 3–5 | auth/RBAC/Docker | quote/booking/catalog tests | REST + WebSocket UI | integration flow pass |
| Ngày 6 | tích hợp và sửa contract | baseline load | E2E responsive | không còn blocker |
| Ngày 7 | release/docs | báo cáo số đo | demo video | Definition of Done pass |

## Pha 2: cải tiến dựa trên bằng chứng

### Thí nghiệm A — hiệu năng catalog

- Giả thuyết: pagination + composite index giảm p95 ít nhất 30% ở concurrency 20.
- Baseline: chạy script 3 lần, 120 giây/lần, dataset cố định.
- Thay đổi: thêm pagination/index; không đổi hardware/concurrency.
- Quyết định: giữ nếu p95 cải thiện và error rate không tăng; nếu không, rollback và giải thích.
- Owner: Minh; Việt review thiết kế đo; Toán kiểm tra UX pagination.

### Thí nghiệm B — scale realtime

- Giả thuyết: Redis Pub/Sub cho phép 2 worker vẫn giao message đúng room với p95 delivery dưới 300 ms.
- Baseline: connection manager một process.
- Thay đổi: adapter event bus; business service giữ nguyên.
- Đo: số socket đồng thời, p95 delivery, lost/duplicate messages, CPU/RAM.
- Owner: Toán; Việt review architecture/security; Minh xây workload.

### Thí nghiệm C — reliability của event

- Chỉ thực hiện nếu test phát hiện lost/duplicate khi restart hoặc nhiều worker.
- Đề xuất transactional outbox + idempotency key, không ghép vào Pha 1 khi chưa có số liệu.
- Đo recovery time, duplicate rate và tỷ lệ event được relay.

## Hồ sơ nộp bài

- Link GitHub public với history commit có ý nghĩa.
- README và bốn tài liệu chuẩn trong `docs/`.
- Ảnh Swagger, kết quả `pytest`, typecheck/build.
- File raw load-test của ba lần chạy trước và sau, ghi commit hash/cấu hình Kaggle.
- Bảng kết luận: giả thuyết, thay đổi, số đo, trade-off, quyết định giữ/rollback.
- Video demo theo vai trò customer → consultant → admin, không trình diễn chức năng ngoài scope.
