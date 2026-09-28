import asyncio
import json
import httpx
from datetime import datetime, date

BASE_URL = "http://localhost:8000"


def parse_chat_response(resp: httpx.Response):
    """Parses response whether it is SSE stream or direct JSON."""
    text_accum = ""
    action_found = None
    try:
        data = resp.json()
        text_accum = data.get("response", "")
        action_found = data.get("action")
        return text_accum, action_found
    except Exception:
        pass

    for line in resp.text.split("\n"):
        if line.startswith("data: "):
            raw = line[6:].strip()
            if raw == "[DONE]":
                continue
            try:
                payload = json.loads(raw)
                if payload.get("token"):
                    text_accum += payload["token"]
                elif payload.get("content"):
                    text_accum += payload["content"]
                if payload.get("action"):
                    action_found = payload["action"]
            except Exception:
                pass
    return text_accum, action_found


async def main():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=60.0) as client:
        print("=" * 70)
        print("🚀 BẮT ĐẦU E2E TEST 3 TÀI KHOẢN VÀ CÁC TRƯỜNG HỢP HỘI THOẠI + LÁI THỬ")
        print("=" * 70)

        # -------------------------------------------------------------
        # TÀI KHOẢN 1: Trần Tuấn Anh (Xe 7 chỗ gia đình > 1.5 tỷ & Lái thử VF 9)
        # -------------------------------------------------------------
        print("\n[ACCOUNT 1] Đăng ký & Test Hội thoại: Trần Tuấn Anh (VF 9)")
        ts1 = int(datetime.utcnow().timestamp())
        acc1_email = f"tuananh_{ts1}@gmail.com"
        acc1_phone = f"0912{ts1 % 1000000:06d}"
        reg1_resp = await client.post("/api/auth/register", json={
            "email": acc1_email,
            "password": "Password123!",
            "full_name": "Trần Tuấn Anh",
            "phone": acc1_phone,
            "role": "customer"
        })
        assert reg1_resp.status_code == 201, f"Reg 1 failed: {reg1_resp.text}"
        acc1_data = reg1_resp.json()
        token1_resp = await client.post("/api/auth/login", json={
            "email": acc1_email,
            "password": "Password123!"
        })
        token1 = token1_resp.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}
        print(f"  ✅ Đăng ký thành công: user_id={acc1_data['id']}, SĐT={acc1_phone}")

        # Chat 1: Nhu cầu 7 chỗ
        session1 = f"session_acc1_{ts1}"
        chat1_resp = await client.post("/api/chat", json={
            "session_id": session1,
            "message": "Tôi cần tìm xe 7 chỗ rộng rãi cho gia đình đi du lịch, tầm giá trên 1 tỷ rưỡi",
            "user_id": acc1_data["id"]
        })
        chat1_text, _ = parse_chat_response(chat1_resp)
        print(f"  💬 User: 'Tôi cần tìm xe 7 chỗ rộng rãi cho gia đình đi du lịch, tầm giá trên 1 tỷ rưỡi'")
        print(f"  🤖 AI (trích đoạn): {chat1_text[:200]}...")

        # Chat 2: Đăng ký lái thử VF 9
        chat2_resp = await client.post("/api/chat", json={
            "session_id": session1,
            "message": "Tôi muốn đăng ký lái thử xe VF 9",
            "user_id": acc1_data["id"]
        })
        print(f"  💬 User: 'Tôi muốn đăng ký lái thử xe VF 9'")
        chat2_text, action_found_1 = parse_chat_response(chat2_resp)
        print(f"  🎯 Action trích xuất từ Chatbot: {action_found_1}")
        assert action_found_1 is not None, "Không tìm thấy action!"
        assert action_found_1.get("type") == "book_test_drive", f"Sai action type: {action_found_1}"

        # Submit Form Lái thử VF 9
        booking1_resp = await client.post("/api/bookings", json={
            "customer_name": "Trần Tuấn Anh",
            "customer_phone": acc1_phone,
            "vehicle_id": "vf-9",
            "vehicle_name": "VinFast VF 9 Plus",
            "preferred_date": "2026-08-25",
            "preferred_time": "09:30",
            "notes": "Hẹn lái thử tại Showroom Landmark 81"
        })
        assert booking1_resp.status_code == 201, f"Booking 1 failed: {booking1_resp.text}"
        print("  📅 Đã submit form lái thử thành công cho VF 9 Plus!")

        # Kiểm tra hồ sơ cá nhân của Account 1
        profile1_resp = await client.get("/api/customer-profiles/me", headers=headers1)
        assert profile1_resp.status_code == 200, f"Get profile 1 failed: {profile1_resp.text}"
        p1 = profile1_resp.json()
        print(f"  📊 Chân dung CRM Account 1:")
        print(f"     - User ID: {p1['user_id']}")
        print(f"     - Tên & SĐT từ Account: {p1['account']['full_name']} ({p1['account']['phone']})")
        print(f"     - Lead Score: {p1['lead_score']} | Lượt lái thử: {p1['total_test_drives']}")
        print(f"     - Dòng xe quan tâm: {p1['interested_models']}")

        # -------------------------------------------------------------
        # TÀI KHOẢN 2: Lê Minh Hoàng (Xe máy điện đi làm 20-30tr)
        # -------------------------------------------------------------
        print("\n[ACCOUNT 2] Đăng ký & Test Hội thoại: Lê Minh Hoàng (Xe máy điện Feliz S / Evo200)")
        ts2 = int(datetime.utcnow().timestamp()) + 10
        acc2_email = f"hoang_{ts2}@gmail.com"
        acc2_phone = f"0912{ts2 % 1000000:06d}"
        reg2_resp = await client.post("/api/auth/register", json={
            "email": acc2_email,
            "password": "Password123!",
            "full_name": "Lê Minh Hoàng",
            "phone": acc2_phone,
            "role": "customer"
        })
        assert reg2_resp.status_code == 201
        acc2_data = reg2_resp.json()
        token2_resp = await client.post("/api/auth/login", json={
            "email": acc2_email,
            "password": "Password123!"
        })
        token2 = token2_resp.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}
        print(f"  ✅ Đăng ký thành công: user_id={acc2_data['id']}, SĐT={acc2_phone}")

        session2 = f"session_acc2_{ts2}"
        chat2_1_resp = await client.post("/api/chat", json={
            "session_id": session2,
            "message": "Tư vấn giúp tôi xe máy điện đi làm hàng ngày, giá khoảng 20-30 triệu tiết kiệm điện",
            "user_id": acc2_data["id"]
        })
        chat2_1_text, _ = parse_chat_response(chat2_1_resp)
        print(f"  💬 User: 'Tư vấn giúp tôi xe máy điện đi làm hàng ngày, giá khoảng 20-30 triệu tiết kiệm điện'")
        print(f"  🤖 AI (trích đoạn): {chat2_1_text[:200]}...")

        chat2_2_resp = await client.post("/api/chat", json={
            "session_id": session2,
            "message": "Xe Feliz S và Evo200 xe nào đi xa hơn một lần sạc?",
            "user_id": acc2_data["id"]
        })
        chat2_2_text, _ = parse_chat_response(chat2_2_resp)
        print(f"  💬 User: 'Xe Feliz S và Evo200 xe nào đi xa hơn một lần sạc?'")
        print(f"  🤖 AI (trích đoạn so sánh quãng đường): {chat2_2_text[:200]}...")

        # -------------------------------------------------------------
        # TÀI KHOẢN 3: Phạm Thu Hà (Xe đô thị 500tr VF 5 Plus & Lái thử)
        # -------------------------------------------------------------
        print("\n[ACCOUNT 3] Đăng ký & Test Hội thoại: Phạm Thu Hà (VF 5 Plus)")
        ts3 = int(datetime.utcnow().timestamp()) + 20
        acc3_email = f"thuha_{ts3}@gmail.com"
        acc3_phone = f"0912{ts3 % 1000000:06d}"
        reg3_resp = await client.post("/api/auth/register", json={
            "email": acc3_email,
            "password": "Password123!",
            "full_name": "Phạm Thu Hà",
            "phone": acc3_phone,
            "role": "customer"
        })
        assert reg3_resp.status_code == 201
        acc3_data = reg3_resp.json()
        token3_resp = await client.post("/api/auth/login", json={
            "email": acc3_email,
            "password": "Password123!"
        })
        token3 = token3_resp.json()["access_token"]
        headers3 = {"Authorization": f"Bearer {token3}"}
        print(f"  ✅ Đăng ký thành công: user_id={acc3_data['id']}, SĐT={acc3_phone}")

        session3 = f"session_acc3_{ts3}"
        chat3_1_resp = await client.post("/api/chat", json={
            "session_id": session3,
            "message": "Tôi muốn mua ô tô điện cỡ nhỏ đi phố tầm 500 triệu như VF 5 Plus, có ưu đãi gì không?",
            "user_id": acc3_data["id"]
        })
        chat3_1_text, _ = parse_chat_response(chat3_1_resp)
        print(f"  💬 User: 'Tôi muốn mua ô tô điện cỡ nhỏ đi phố tầm 500 triệu như VF 5 Plus, có ưu đãi gì không?'")
        print(f"  🤖 AI (trích đoạn): {chat3_1_text[:200]}...")

        chat3_2_resp = await client.post("/api/chat", json={
            "session_id": session3,
            "message": "Tôi muốn đăng ký lái thử xe VF 5",
            "user_id": acc3_data["id"]
        })
        print(f"  💬 User: 'Tôi muốn đăng ký lái thử xe VF 5'")
        chat3_2_text, action_found_3 = parse_chat_response(chat3_2_resp)
        print(f"  🎯 Action trích xuất: {action_found_3}")
        assert action_found_3 is not None
        assert action_found_3.get("type") == "book_test_drive"

        # Submit Form Lái thử VF 5
        booking3_resp = await client.post("/api/bookings", json={
            "customer_name": "Phạm Thu Hà",
            "customer_phone": acc3_phone,
            "vehicle_id": "vf-5-plus",
            "vehicle_name": "VinFast VF 5 Plus",
            "preferred_date": "2026-08-26",
            "preferred_time": "14:00",
            "notes": "Chị muốn thử bán kính quay đầu và khả năng luồn lách phố nhỏ"
        })
        assert booking3_resp.status_code == 201
        print("  📅 Đã submit form lái thử thành công cho VF 5 Plus!")

        # -------------------------------------------------------------
        # TỔNG KẾT BẢNG CRM CUSTOMER PROFILES (ADMIN / CONSULTANT VIEW)
        # -------------------------------------------------------------
        print("\n" + "=" * 70)
        print("📋 TỔNG HỢP HỒ SƠ KHÁCH HÀNG CRM TRONG DATABASE (JOIN VỚI BẢNG ACCOUNTS):")
        print("=" * 70)
        crm_resp = await client.get("/api/customer-profiles")
        profiles = crm_resp.json()
        print(f"Tổng số hồ sơ trong hệ thống: {len(profiles)}")
        for idx, p in enumerate(profiles[:5], 1):
            acc = p.get("account") or {}
            print(f"\n[{idx}] Profile ID: {p['profile_id']}")
            print(f"    - User ID (Khóa ngoại accounts): {p['user_id']}")
            print(f"    - Khách hàng: {acc.get('full_name')} | SĐT: {acc.get('phone')} | Email: {acc.get('email')}")
            print(f"    - Đánh giá Lead: {p['lead_score']} (Trạng thái: {p['lead_status']})")
            print(f"    - Dòng xe quan tâm: {p['interested_models']}")
            print(f"    - Số lượt lái thử: {p['total_test_drives']} | Báo giá: {p['total_quotes']}")
        print("\n" + "=" * 70)
        print("🎉 TẤT CẢ CÁC TRƯỜNG HỢP ĐỀU ĐÃ ĐƯỢC KIỂM THỬ THÀNH CÔNG 100%!")
        print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
