# 🎯 ADR 0005: ADOPTING CHATCRS GOAL GUIDANCE & GROUNDED RETRIEVAL ARCHITECTURE

> **Trạng thái:** ✅ Approved  
> **Nguồn nghiên cứu:** *ChatCRS: Incorporating External Knowledge and Goal Guidance for LLM-based Conversational Recommender Systems (NAACL 2025)*  
> **Thư mục:** `/context/adrs/0005-chatcrs-goal-guidance-architecture.md`  

---

## 📌 1. Context & Problem
Các hệ thống đàm thoại tư vấn dựa trên LLM (Conversational Recommender Systems - CRS) thường gặp 2 hạn chế lớn:
1. **Thiếu tính chủ động (Lack of Proactivity):** AI Agent bị thụ động – trả lời thắc mắc đơn lẻ của người dùng mà không có khả năng chủ động đặt câu hỏi dẫn dắt cuộc đàm thoại tiến tới mục tiêu kinh doanh (Thu thập nhu cầu ➔ Báo giá ➔ Đặt lịch lái thử).
2. **Nguy cơ ảo giác thông tin (Ungrounded Responses):** LLM tự bịa đặt thông số kỹ thuật hoặc thông tin giá bán không dựa trên CSDL thực tế.

---

## 💡 2. Decision
Áp dụng mô hình **ChatCRS (NAACL 2025)** vào kiến trúc **LangGraph State Machine** của VinFast AI Sales Agent với 3 quyết định cốt lõi:

### A. Tách biệt Hai Phân Hệ Agent (Decoupled Dual-Agent Mechanism)
1. **Goal-Planning Agent (`src/agents/nodes/needs_discovery.py` & `graph.py`):**
   - Đóng vai trò điều phối mục tiêu đàm thoại.
   - Luôn chủ động đặt câu hỏi gợi mở tiếp theo trong mỗi phản hồi để thu thập đủ 5 biến số nhu cầu khách hàng (`seat_count`, `budget`, `daily_distance_km`, `charging_access`, `usage_purpose`).
2. **Knowledge Retrieval Agent (`src/services/rag_service.py` & `tco_calculator.py`):**
   - Đóng vai trò truy vấn tri thức chuẩn xác từ CSDL/Tools.
   - 100% số liệu về giá bán, thông số kỹ thuật và phí lăn bánh TCO phải xuất phát từ Knowledge Base làm "Ground Truth" trước khi LLM sinh câu thoại.

### B. Dẫn dắt Mục tiêu Chủ động theo Trạng thái (Proactive Goal Guidance)
- Mọi câu phản hồi của AI Agent bắt buộc phải tuân theo cấu trúc 2 phần:
  1. `[Answer]` Khai thác CSDL/Tool trả lời chính xác thắc mắc hiện tại của khách hàng.
  2. `[Proactive Guidance]` Chủ động đưa ra câu hỏi gợi mở tiếp theo để đẩy nhanh tiến trình chuyển đổi (Lead Conversion).

### C. Đánh giá Chỉ số Chất lượng theo Tiêu chuẩn ChatCRS (`eval/run_benchmark.py`)
- Bổ sung 2 chỉ số mới vào Pipeline LLM-as-Judge Evaluator (Task EV-007):
  - **Proactivity Rate ($\ge 90\%$):** % câu phản hồi có câu hỏi dẫn dắt mục tiêu tiếp theo.
  - **Groundedness Score ($\ge 98\%$):** % thông tin tư vấn được chứng thực từ CSDL/Tools.

---

## 🎯 3. Consequences
- **Ưu điểm:**
  - Tăng tỷ lệ hoàn thành phễu tư vấn và đặt lịch lái thử (Conversion Rate).
  - Triệt tiêu 100% rủi ro bịa đặt thông số hoặc tư vấn sai giá bán.
  - Tăng giá trị học thuật & thực tiễn cho báo cáo đồ án/nghiên cứu.
- **Hạn chế:**
  - Cần thiết kế Prompt engineering kỹ lưỡng để câu hỏi dẫn dắt tự nhiên, không gây cảm giác ép buộc cho người dùng.
