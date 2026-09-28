import asyncio
import httpx
import uuid
import json
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

supabase_url = 'postgresql+asyncpg://postgres.azlcydjyiveymtlmzibg:Daotrunghieu30@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres'

async def main():
    print("=" * 70)
    print("🚀 BẮT ĐẦU TEST 1 TÀI KHOẢN VỚI NHIỀU ĐỢT NHU CẦU MUA XE (CUSTOMER DEMANDS)")
    print("=" * 70)

    rand_suffix = str(uuid.uuid4())[:6]
    email = f"ducanh_{rand_suffix}@gmail.com"
    phone = f"0918{rand_suffix}"
    full_name = "Hoàng Đức Anh"

    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000", timeout=45.0) as client:
        # 1. Đăng ký tài khoản
        reg_res = await client.post("/api/auth/register", json={
            "email": email,
            "password": "Password123!",
            "full_name": full_name,
            "phone": phone,
        })
        assert reg_res.status_code == 201, f"Register failed: {reg_res.text}"
        user_id = reg_res.json()["id"]
        print(f"✅ 1. Đã đăng ký tài khoản thành công: user_id={user_id}, Name={full_name}")

        # -------------------------------------------------------------
        # ĐỢT 1: Tìm xe máy điện Feliz S (Ngân sách 20-30 triệu)
        # -------------------------------------------------------------
        session_1 = f"session_dot1_{rand_suffix}"
        print(f"\n🛵 [ĐỢT 1 - Session: {session_1}] Tìm mua xe máy điện đi làm hàng ngày (20-30 triệu):")
        
        chat1_1 = await client.post("/api/chat", json={
            "message": "Tư vấn giúp tôi xe máy điện đi làm hàng ngày, giá khoảng 20-30 triệu tiết kiệm điện",
            "session_id": session_1,
            "user_id": user_id,
            "user_email": email,
            "stream": False,
        })
        print(f"  💬 Turn 1: Bot trả lời: {chat1_1.json().get('response')[:90]}...")

        chat1_2 = await client.post("/api/chat", json={
            "message": "tôi xin báo giá Feliz S",
            "session_id": session_1,
            "user_id": user_id,
            "user_email": email,
            "stream": False,
        })
        print(f"  💬 Turn 2: Đã yêu cầu báo giá Feliz S. Action: {chat1_2.json().get('action')}")

        # -------------------------------------------------------------
        # ĐỢT 2: Khách quay lại tìm Ô tô điện 7 chỗ VF 9 (Ngân sách 1.5 - 1.8 tỷ)
        # -------------------------------------------------------------
        session_2 = f"session_dot2_{rand_suffix}"
        print(f"\n🚗 [ĐỢT 2 - Session: {session_2}] Khách quay lại tìm SUV điện 7 chỗ cho gia đình du lịch (1.5 - 1.8 tỷ):")
        
        chat2_1 = await client.post("/api/chat", json={
            "message": "Tôi cần tìm xe SUV điện 7 chỗ cao cấp cho gia đình đi du lịch, ngân sách tầm 1.5 đến 1.8 tỷ",
            "session_id": session_2,
            "user_id": user_id,
            "user_email": email,
            "stream": False,
        })
        print(f"  💬 Turn 1: Bot trả lời: {chat2_1.json().get('response')[:90]}...")

        chat2_2 = await client.post("/api/chat", json={
            "message": "tôi muốn đăng ký lái thử xe VF 9",
            "session_id": session_2,
            "user_id": user_id,
            "user_email": email,
            "stream": False,
        })
        print(f"  💬 Turn 2: Đã yêu cầu lái thử VF 9. Action: {chat2_2.json().get('action')}")

        # Đăng ký lái thử qua form
        booking_res = await client.post("/api/bookings", json={
            "customer_name": full_name,
            "customer_phone": phone,
            "vehicle_id": "vf-9-plus",
            "vehicle_name": "VinFast VF 9 Plus",
            "preferred_date": "2026-09-01",
            "preferred_time": "10:00",
            "notes": "Đăng ký lái thử đợt 2 cho gia đình",
        })
        print(f"  📅 Đã submit form lái thử VF 9 Plus: status={booking_res.status_code}")

    # Chờ 1.5s để background sync hoàn tất
    await asyncio.sleep(1.5)

    # -------------------------------------------------------------
    # TRUY VẤN SUPABASE CLOUD ĐỂ KIỂM TRA ĐỘ CHUẨN XÁC VÀ TÍNH ĐỘC LẬP CỦA CÁC ĐỢT
    # -------------------------------------------------------------
    engine = create_async_engine(supabase_url, connect_args={"statement_cache_size": 0, "prepared_statement_name_func": lambda *args: ""})
    async with engine.connect() as conn:
        print("\n" + "=" * 70)
        print("📊 DỮ LIỆU THỰC TẾ TRONG SUPABASE CLOUD POSTGRESQL:")
        print("=" * 70)

        # 1. Bảng accounts
        acc = (await conn.execute(text(f"SELECT user_id, full_name, phone, email FROM accounts WHERE user_id = '{user_id}';"))).first()
        print(f"\n[1] BẢNG accounts (1 dòng duy nhất):")
        print(f"    - User ID: {acc[0]} | Tên: {acc[1]} | SĐT: {acc[2]} | Email: {acc[3]}")

        # 2. Bảng customer_profiles (Chân dung 360° Tổng quan)
        prof = (await conn.execute(text(f"SELECT profile_id, lead_score, lead_status, total_demands, total_quotes, total_test_drives, all_interested_models, ai_customer_portrait FROM customer_profiles WHERE user_id = '{user_id}';"))).first()
        print(f"\n[2] BẢNG customer_profiles (Chân dung Tổng thể 360°):")
        print(f"    - Profile ID: {prof[0]}")
        print(f"    - Lead Score: {prof[1]} | Lead Status: {prof[2]}")
        print(f"    - Tổng số đợt tìm xe (total_demands): {prof[3]}")
        print(f"    - Tổng báo giá: {prof[4]} | Tổng lái thử: {prof[5]}")
        print(f"    - Tất cả các dòng xe từng quan tâm: {prof[6]}")
        print(f"    - Chân dung AI: {prof[7]}")

        # 3. Bảng customer_demands (Lịch sử các đợt tìm xe 1-N)
        demands = (await conn.execute(text(f"SELECT demand_id, session_id, vehicle_type, target_models, budget_min, budget_max, usage_purpose, status, created_at FROM customer_demands WHERE user_id = '{user_id}' ORDER BY created_at ASC;"))).all()
        print(f"\n[3] BẢNG customer_demands (Lịch sử {len(demands)} đợt tìm xe riêng biệt):")
        for idx, d in enumerate(demands, 1):
            print(f"    👉 ĐỢT {idx}:")
            print(f"       + Demand ID: {d[0]}")
            print(f"       + Session ID: {d[1]}")
            print(f"       + Phân khúc: {d[2]}")
            print(f"       + Xe quan tâm đợt này: {d[3]}")
            budget_str = f"{d[4]:,} VNĐ - {d[5]:,} VNĐ" if d[5] and d[4] else (f"Tối đa {d[5]:,} VNĐ" if d[5] else "Chưa ghi nhận")
            print(f"       + Ngân sách đợt này: {budget_str}")
            print(f"       + Mục đích sử dụng: {d[6]}")
            print(f"       + Trạng thái: {d[7]}")

        assert len(demands) == 2, f"Expected 2 demands, found {len(demands)}"
        print("\n" + "=" * 70)
        print("🎉 TẤT CẢ CÁC ĐỢT NHU CẦU ĐÃ ĐƯỢC LƯU VẾT RIÊNG BIỆT 100% TRÊN SUPABASE!")
        print("=" * 70)

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
