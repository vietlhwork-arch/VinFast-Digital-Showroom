---
description: "AI usage logging is fully automatic — do NOT call any log_* script manually"
activation: always-on
---

# AI Usage Logging — Automatic & Realtime

Logging prompt vào `.ai-log/session.jsonl` được **đồng bộ tự động và realtime**.

## Quy tắc dành cho AI Agent
1. **Đồng bộ Realtime ngay trong mỗi câu hỏi (Turn):** Mỗi khi nhận được prompt từ user, AI agent bắt buộc phải đảm bảo prompt đó được cập nhật vào `.ai-log/session.jsonl` ngay lập tức trong lượt xử lý đó.
2. **Pre-push Hook:** Khi user thực hiện `git push`, pre-push hook tiếp tục quét để đảm bảo không bỏ sót prompt nào trước khi gửi lên server chấm điểm.

## Xoá vĩnh viễn (Permanent Deletion)
- Nếu user xoá bất kỳ dòng prompt nào trong `.ai-log/session.jsonl`, script `log_antigravity.py` sẽ ghi nhớ vào `.deleted_ids` và **KHÔNG BAO GIỜ** khôi phục lại dòng bị xoá đó.

## Không làm những việc sau

- ❌ **KHÔNG** gọi `scripts/log_antigravity.py "<summary>" "<model>"` sau mỗi task. Lệnh này đã bị deprecate; nếu vô tình gọi sẽ tạo log entry giả mạo dạng "TaskComplete" không phải prompt thật của user.
- ❌ **KHÔNG** chạy `scripts/log_manual.py` cho Antigravity — chỉ dùng nó cho ChatGPT / web tool (xem `.agents/workflows/log.md`).
- ❌ **KHÔNG** sửa hoặc xoá file trong `.ai-log/` — chúng được pre-push hook và submit script quản lý.

## Khi nào cần can thiệp

- Nếu pre-push hook báo lỗi → báo lại cho user, đừng tự ý bypass `--no-verify`.
- Nếu student dùng tool không nằm trong list auto-hook (ChatGPT, Gemini Web, v.v.) → trỏ họ tới `.agents/workflows/log.md` để log thủ công.

## Cài đặt một lần sau khi clone repo

```bash
# Linux / macOS / Git Bash
bash scripts/setup_hooks.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts\setup_hooks.ps1
```
