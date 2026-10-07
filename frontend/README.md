# Frontend

React/Vite client cho VinFast Digital Showroom. UI hỗ trợ ba vai trò customer, consultant và admin; hội thoại là chat trực tiếp giữa người dùng và nhân viên.

```powershell
npm install
npm run dev
npm run typecheck
npm run build
```

Vite dev server mặc định proxy `/api` và `/static` sang backend tại
`http://127.0.0.1:8000`. Chỉ đặt biến sau nếu backend chạy ở host khác:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Các phần chính:

```text
src/App.tsx                         bố cục và trạng thái đăng nhập
src/components/SupportChatWidget.tsx  REST + WebSocket chat người thật
src/pages/StaffPortalPage.tsx       màn hình xử lý nghiệp vụ của staff
src/components/AdminDashboardModal.tsx màn hình quản trị
src/lib/api.ts                      client HTTP/WebSocket tập trung
src/types/index.ts                  kiểu dữ liệu dùng chung
```

Frontend không truy cập database trực tiếp và không cần API key. Mọi thao tác dữ liệu đi qua backend để áp dụng xác thực và phân quyền thống nhất.
