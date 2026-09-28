# Cài đặt · ai20k-mentor-qa-report

## Yêu cầu

- **Codex** (phiên bản mới nhất) — hoặc bất kỳ client tương thích `SKILL.md`
- **macOS** (vì skill dùng `screencapture`, `osascript`, Quartz API để chụp window)
- **Chrome** (để test sản phẩm web và chụp bằng chứng)
- **Python 3** (lấy CGWindowID qua Quartz — chỉ cần khi dùng chế độ screenshot)

## Cài đặt

### Option 1 — Personal (áp dụng mọi project)

```bash
unzip ai20k-mentor-qa-report.zip -d ~/.codex/skills/
```

### Option 2 — Project-only (chỉ project mentor hiện tại)

```bash
unzip ai20k-mentor-qa-report.zip -d .codex/skills/
```

## Cài đặt phụ thuộc screenshot (một lần, chỉ khi dùng chế độ 📸 SCREENSHOT)

```bash
pip3 install --break-system-packages pyobjc-framework-Quartz
```

Kiểm tra Quartz chạy được:

```bash
python3 -c "import Quartz; print('Quartz OK')"
```

## Xác nhận cài đặt

Khởi động lại Codex, rồi gọi skill bằng tên hoặc mô tả nhu cầu QA:

```
ai20k-mentor-qa-report
```

Skill sẽ hỏi bạn: URL production + chế độ chạy (headless / screenshot).

## Gỡ cài đặt

```bash
rm -rf ~/.codex/skills/ai20k-mentor-qa-report
```
