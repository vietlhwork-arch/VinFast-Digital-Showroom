# 🧪 TASK EV-007: LLM-AS-JUDGE EVALUATION PIPELINE FOR AI AGENT

> **Task ID:** EV-007  
> **Domain:** AI Quality Assurance & Benchmark Evaluation  
> **Thư mục:** `/context/tasks/EV-007-llm-as-judge-evals.md`  
> **Trạng thái:** 🟢 Ready for Implementation  

---

## 📌 MỤC TIÊU TỔNG QUAN
Xây dựng pipeline đánh giá tự động chất lượng AI Chatbot Agent dựa trên phương pháp **LLM-as-Judge**, đảm bảo AI tư vấn chính xác, không nói dối (Zero Hallucination) và tuân thủ Guardrails.

---

## 🎯 CÁC SUB-TASKS AI EVALUATION CHI TIẾT

### 📋 Sub-Task 7.1: Benchmark Dataset Creation (`eval/datasets/agent_core_candidate.json`)
- **Nhiệm vụ:** Xây dựng tập dataset 50+ kịch bản test thực tế.
- **Bao gồm:**
  - 20 câu hỏi thông số kỹ thuật & giá xe (RAG Accuracy Test).
  - 15 câu hỏi tính toán phí lăn bánh TCO (Zero Math Hallucination Test).
  - 15 câu hỏi Out-of-Scope (Guardrails Rejection Test).

### ⚖️ Sub-Task 7.2: LLM-as-Judge Automated Assessor (`eval/run_benchmark.py`)
- **Nhiệm vụ:** Viết script tự động gửi test case qua Agent và dùng LLM Giám Khảo (Judge) chấm điểm theo 3 tiêu chí:
  1. `Factual Accuracy Score` ($\ge 98\%$)
  2. `Hallucination Rate` ($0\%$)
  3. `Guardrail Rejection Compliance Rate` ($100\%$)

### 📊 Sub-Task 7.3: Evaluation Metric Report & JSON Output (`eval/reports/`)
- **Nhiệm vụ:** Xuất báo cáo điểm số chi tiết dạng Markdown & JSON báo cáo kết quả trước khi deploy hệ thống lên Production.

---

## 🧪 KHẢO SÁT & VERIFICATION
- Chạy command `python eval/run_benchmark.py agent --dataset eval/datasets/agent_core_candidate.json --allow-draft --judge` để xuất báo cáo JSON và Markdown.
