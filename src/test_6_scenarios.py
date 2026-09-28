# src/test_6_scenarios.py
import json
import time
import urllib.request

SCENARIOS = [
    {
        "title": "HỘI THOẠI 1: Xe máy học sinh cấp 3 (Ngân sách < 20tr -> Evo Lite Neo vs Amio -> Báo giá)",
        "turns": [
            "Chào em, em tư vấn giúp anh mua xe máy cho con gái học cấp 3 đi học nhé",
            "cháu chưa có bằng lái, ngân sách dưới 20 triệu",
            "mẫu Evo Lite Neo này pin đi được bao xa và có an toàn không?",
            "thế ngoài mẫu này còn chiếc nào dưới 20 triệu nữa không?",
            "so sánh mẫu Evo Lite Neo với Amio S2 chiếc nào tốt hơn?",
            "cho anh xin báo giá xe Evo Lite Neo kèm pin nhé"
        ]
    },
    {
        "title": "HỘI THOẠI 2: Đổi từ xe xăng sang ô tô điện (Ngân sách 500-600tr -> VF 5 / VF 6 -> Báo giá)",
        "turns": [
            "Xin chào, tôi đang đi xe xăng Vios muốn đổi sang xe điện VinFast",
            "nhà ở chung cư nên cần xe sạc tiện, ngân sách tầm 500-600 triệu",
            "mẫu VF 6 với VF 5 thì chiếc nào rộng rãi hơn?",
            "VF 6 bản Base với Plus giá khoảng bao nhiêu?",
            "xe có hỗ trợ tính năng lái thông minh ADAS không?",
            "tạo giúp tôi báo giá chiếc VF 6 Plus nhé"
        ]
    },
    {
        "title": "HỘI THOẠI 3: Mua xe 7 chỗ chạy kinh doanh / dịch vụ (VF MPV 7 chỗ -> Chi phí pin -> Báo giá)",
        "turns": [
            "Chào bạn, tôi muốn mua xe chạy dịch vụ gia đình 7 chỗ",
            "ngân sách tầm 800 triệu đến 1 tỷ, ưu tiên tiết kiệm chi phí sạc",
            "mẫu VF MPV 7 chỗ này có không gian chở đồ rộng không?",
            "chi phí sạc pin và thuê pin mỗi tháng chạy nhiều có tiết kiệm hơn xăng không?",
            "thời gian sạc pin nhanh từ 10% lên 70% mất khoảng bao lâu?",
            "gửi cho tôi bản tính chi phí và báo giá xe VF MPV 7 chỗ"
        ]
    },
    {
        "title": "HỘI THOẠI 4: Xe máy thể thao cao cấp (Viper & Xmet tầm 40-50tr -> So sánh -> Báo giá)",
        "turns": [
            "Alo em, có xe máy điện nào kiểu dáng thể thao, cá tính không?",
            "tầm tiền khoảng 40 đến 50 triệu",
            "chiếc Viper với Xmet khác nhau điểm gì em?",
            "mẫu Viper này tốc độ tối đa bao nhiêu và đi đường mưa ngập có sao không?",
            "mẫu xe Viper này đi được bao nhiêu km một lần sạc?",
            "lên cho anh báo giá chiếc VinFast Viper kèm pin nhé"
        ]
    },
    {
        "title": "HỘI THOẠI 5: Doanh nhân / Xe hạng sang cao cấp (VF 9 Plus 6 chỗ -> Ghế thương gia -> Báo giá)",
        "turns": [
            "Chào em, tôi cần tìm một mẫu SUV sang trọng để đón đối tác và đi công tác",
            "ngân sách trên 1.5 tỷ, yêu cầu hàng ghế sau phải thật thoải mái",
            "bản VF 9 Plus 6 chỗ ghế thương gia có tiện nghi gì nổi bật?",
            "quãng đường đi thực tế của VF 9 Plus là bao nhiêu km mỗi lần sạc?",
            "VinFast có những điểm mạnh gì về hệ thống trạm sạc cho VF 9 đi đường dài?",
            "tạo báo giá chính thức chiếc VF 9 Plus bản 6 chỗ cho tôi"
        ]
    },
    {
        "title": "HỘI THOẠI 6: Khách hàng hỏi câu hỏi hóc búa (Bán tải điện -> Xe nhỏ VF 3 -> Báo giá)",
        "turns": [
            "VinFast có xe bán tải điện không em?",
            "thế có dòng ô tô điện nào nhỏ gọn gầm cao giá mềm dưới 400 triệu không?",
            "chiếc VF 3 sạc ở nhà bằng điện dân dụng 220V được không?",
            "pin của VF 3 có bền không và đi được bao nhiêu km?",
            "nếu đi đường ngập nước ở đô thị thì xe có an toàn không?",
            "chốt lại cho anh xin báo giá xe VF 3 nhé"
        ]
    }
]

def run_tests():
    total_turns = 0
    total_time = 0.0
    latencies = []

    print("================================================================================")
    print("           BẮT ĐẦU KIỂM THỬ 6 HỘI THOẠI HOÀN CHỈNH (MỖI HỘI THOẠI 6 LƯỢT)        ")
    print("================================================================================")

    for s_idx, scen in enumerate(SCENARIOS, 1):
        sess_id = f"test_6scen_{s_idx}_{int(time.time())}"
        print(f"\n{'#'*80}")
        print(f"[{s_idx}/6] {scen['title']}")
        print(f"Session ID: {sess_id}")
        print(f"{'#'*80}")

        for t_idx, msg in enumerate(scen["turns"], 1):
            total_turns += 1
            t_start = time.time()
            payload = json.dumps({"message": msg, "session_id": sess_id}).encode("utf-8")
            req = urllib.request.Request(
                "http://localhost:8000/api/chat",
                data=payload,
                headers={"Content-Type": "application/json"}
            )
            try:
                res = urllib.request.urlopen(req)
                out = json.loads(res.read().decode("utf-8"))
                elapsed = round(time.time() - t_start, 2)
                latencies.append(elapsed)
                total_time += elapsed

                resp = out.get("response", "")
                act = out.get("action")
                stage = out.get("stage", "")
                analysis = out.get("analysis", "")

                print(f"\n  [Lượt {t_idx}/6] ({elapsed}s)")
                print(f"  👤 Khách: \"{msg}\"")
                print(f"  🤖 Bot:   {resp}")
                if act:
                    print(f"  ⚡ Action: {json.dumps(act, ensure_ascii=False)}")
                print(f"  📊 Trace: stage={stage} | {analysis}")

            except Exception as e:
                print(f"\n  [Lượt {t_idx}/6] ❌ LỖI: {e}")
            time.sleep(0.3)

    avg_latency = round(total_time / max(total_turns, 1), 2)
    print("\n" + "="*80)
    print(f"✅ HOÀN THÀNH KIỂM THỬ 6 HỘI THOẠI (Tổng cộng {total_turns} lượt chat)")
    print(f"⏱️ Tổng thời gian chạy: {round(total_time, 2)}s")
    print(f"⚡ Độ trễ trung bình: {avg_latency}s / lượt")
    print(f"📉 Min Latency: {min(latencies)}s | Max Latency: {max(latencies)}s")
    print("="*80)

if __name__ == "__main__":
    run_tests()
