# 🏃 SPRINT 04 PLAN: AI CONVERSATIONAL MEMORY RECALL & LLM-AS-JUDGE EVALUATIONS

> **Thời gian:** Tuần 4  
> **Thư mục:** `/context/planning/sprints/sprint-04.md`  
> **Mục tiêu Sprint:** Triển khai Ký ức dài hạn Conversational Memory Recall cho AI Agent, xây dựng Pipeline đánh giá chất lượng LLM-as-Judge 50+ benchmark test cases và hoàn thiện HITL Gateway Console.

---

## 🎯 CÁC TASKS AI CHUYÊN SÂU TRONG SPRINT 04

### 1. 🧠 **AI Conversational Memory Recall (`src/services/memory_service.py`, `src/agents/nodes/memory_recall.py`):**
   - Tự động tóm tắt lịch sử đàm thoại `chat_summaries` bằng LLM.
   - Khôi phục ký ức & sở thích cũ khi khách hàng quay lại đàm thoại mới (`long_term_memory`).

### 2. ⚖️ **Benchmark/Eval (`eval/run_benchmark.py`, `eval/datasets/agent_core_candidate.json`):**
   - Bộ dataset 50+ test cases thực tế.
   - Script tự động đánh giá Factual Accuracy ($\ge 98\%$), Hallucination Rate ($0\%$) và Guardrails Compliance ($100\%$).

### 3. 🤝 **HITL Gateway Approval Console & Analytics Dashboard (Hạ tầng phụ trợ):**
   - Cổng duyệt báo giá 1-Click cho Sales và Dashboard đo lường phễu chuyển đổi.

---

## ✅ DEFINITION OF DONE (DOD) SPRINT 04
- [x] AI Agent tự động khôi phục đúng sở thích khách hàng cũ sau khi quay lại.
- [x] Evaluation suite đạt Factual Accuracy $\ge 98\%$ và Hallucination Rate $= 0\%$.
- [x] Hệ thống sẵn sàng cho Production Deployment.
