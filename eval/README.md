# RAG and Agent Benchmark

Benchmark tách riêng Retrieval, Answer Quality, Agent Trajectory, Safety và
Operational metrics. Kết quả không được chứng nhận chỉ vì đạt threshold: dataset
phải có trạng thái `expert_reviewed` và danh sách người duyệt.

## Cấu trúc

- `benchmarking/models.py`: schema cho dataset, expectation và Judge scores.
- `benchmarking/metrics.py`: Recall@K, Precision@K, MRR, nDCG và Agent checks.
- `benchmarking/judge.py`: LLM-as-Judge reference-based, temperature 0.
- `benchmarking/runners.py`: chạy Retrieval hoặc LangGraph và thu trajectory.
- `benchmarking/reporting.py`: JSON/Markdown, bootstrap CI, strata và quality gate.
- Báo cáo nhóm nguyên nhân lỗi theo retrieval miss/noise, deterministic check và
  từng chiều LLM-as-Judge để phục vụ root-cause analysis.
- `benchmark_config.json`: threshold kỹ thuật, không đặt trong `.env`.
- `datasets/retrieval_candidate.json`: 100 ca Retrieval phân tầng.
- `datasets/agent_core_candidate.json`: 100 ca Agent production candidate.

## Trạng thái dataset

Các dataset hiện là `needs_review`, không phải golden set đã chứng nhận. Migration
chỉ làm nhãn machine-readable, không thay thế việc kiểm tra của domain expert.

Quy trình duyệt:

1. Kiểm tra câu hỏi, expected fact và ID xe với catalog snapshot.
2. Kiểm tra intent, action, RAG/SQL/tool expectation với kiến trúc Agent.
3. Sửa hoặc loại ca mơ hồ, trùng ý và dữ liệu đã lỗi thời.
4. Hai chuyên gia độc lập cùng duyệt từng case; chỉ `approve` khi cả hai đồng ý.
5. Chỉ chuyển metadata toàn dataset sang `expert_reviewed` khi mọi case đã duyệt.

Không được mass-update trạng thái review nếu chưa đọc từng expected result.

## Lệnh sử dụng

Kiểm tra schema và độ phủ:

```powershell
python eval/run_benchmark.py validate --dataset eval/datasets/retrieval_candidate.json
python eval/run_benchmark.py validate --dataset eval/datasets/agent_core_candidate.json
```

Xuất bảng duyệt cho hai chuyên gia:

```powershell
python eval/review_dataset.py export `
  --dataset eval/datasets/agent_core_candidate.json `
  --output eval/reviews/agent_review.csv
```

Sau khi hai người hoàn thành các cột reviewer, decision và notes, áp dụng kết quả:

```powershell
python eval/review_dataset.py apply `
  --dataset eval/datasets/agent_core_candidate.json `
  --review eval/reviews/agent_review.csv `
  --output eval/datasets/agent_core_reviewed.json
```

Kiểm tra độ phủ review và Cohen's kappa trước khi chứng nhận; lệnh trả exit code
`2` nếu chưa duyệt đủ 100% hoặc `kappa < 0.6`:

```powershell
python eval/review_dataset.py audit --review eval/reviews/agent_review.csv
```

Smoke test Retrieval trên dataset chưa duyệt:

```powershell
python eval/run_benchmark.py retrieval `
  --dataset eval/datasets/retrieval_candidate.json `
  --allow-draft --runs 1 --limit 5 --concurrency 1
```

Chạy baseline tạm có phân tầng, lấy số ca bằng nhau từ mỗi category:

```powershell
python eval/run_benchmark.py agent `
  --dataset eval/datasets/agent_core_candidate.json `
  --allow-draft --runs 1 --per-category 1 --concurrency 1 `
  --output eval/reports/agent_stratified_baseline.json
```

`--per-category` chọn ca theo thứ tự cố định trong dataset để kết quả có thể lặp
lại. Đây chỉ là baseline chẩn đoán; không thay thế full run trên dataset đã được
hai chuyên gia duyệt.

Chạy Retrieval đầy đủ theo khuyến nghị thống kê:

```powershell
python eval/run_benchmark.py retrieval `
  --dataset eval/datasets/retrieval_candidate.json `
  --allow-draft --runs 3 --concurrency 1 `
  --output eval/reports/retrieval.json
```

Chạy Agent deterministic checks, trajectory và operational metrics:

```powershell
python eval/run_benchmark.py agent `
  --dataset eval/datasets/agent_core_candidate.json `
  --allow-draft --split development --runs 3 --concurrency 1 `
  --output eval/reports/agent.json
```

Chỉ chạy holdout để đánh giá trước release:

```powershell
python eval/run_benchmark.py agent `
  --dataset eval/datasets/agent_core_candidate.json `
  --allow-draft --split holdout --runs 3 --concurrency 1 `
  --output eval/reports/agent_holdout.json
```

Thêm Answer Quality bằng LLM-as-Judge:

```powershell
python eval/run_benchmark.py agent `
  --dataset eval/datasets/agent_core_candidate.json `
  --allow-draft --runs 3 --concurrency 1 --judge `
  --judge-model gpt-4o-mini `
  --output eval/reports/agent_judged.json
```

Judge dùng `OPENAI_API_KEY` hiện có và luôn ghi tên model vào report. Với tài khoản
Tier 1, giữ `--concurrency 1`. Nên hiệu chỉnh Judge với ít nhất 50 output đã được
con người chấm trước khi dùng điểm Judge làm release gate.

Mặc định runner warm-up 1 case rồi mới ghi latency để loại chi phí tải tokenizer
và preload cache khỏi steady-state P50/P95. Dùng `--warmup 0` nếu chủ đích đo
cold-start; báo cáo cold-start và steady-state phải tách riêng.

Sau khi dataset được expert review, bỏ `--allow-draft` và thêm `--enforce-gate`
trong CI. Lệnh trả exit code `2` nếu dataset chưa được chứng nhận hoặc quality gate
không đạt.

## Một hệ thống Eval duy nhất

Trong dự án này, benchmark là eval có dataset cố định và quality gate. Bộ 300 câu
cũ và các runner cũ đã được loại bỏ. Chỉ dùng `run_benchmark.py` với hai dataset:
Retrieval 100 ca và Agent production 100 ca.

## Chiến lược benchmark cần duy trì

Benchmark là bộ bài kiểm tra cố định, có expected result và phiên bản dữ liệu rõ ràng.
Mục đích là so sánh chất lượng giữa các lần thay đổi RAG, prompt, model và Agent.

### Tầng RAG Retrieval

Bộ 100 câu dùng để đánh giá khả năng tìm đúng bằng chứng trước khi LLM sinh câu trả lời:

- Nhận diện đúng loại xe, tên xe và `vehicle_id`.
- Xe đúng có xuất hiện trong Hybrid Top 20 hay không.
- Xe và `chunk_type` đúng có xuất hiện trong Top 3 cuối hay không.
- Có nhầm thông tin giữa các xe hoặc phiên bản không.
- Mức độ bao phủ xe, nhóm dữ liệu và loại câu hỏi.

Benchmark theo dõi `Recall@20`, `Recall@3`, `Vehicle Precision@3`,
`Labeled Evidence Precision@3`, `MRR@20`, `nDCG@20`, recall `chunk_type`,
latency P50/P95 và tỷ lệ lỗi. `Vehicle Precision@3` được dùng làm quality gate;
`Labeled Evidence Precision@3` chỉ là chỉ báo chẩn đoán cho tới khi từng vector
liên quan đã được chuyên gia gắn nhãn đầy đủ. Độ chính xác câu
trả lời được chấm riêng ở tầng Agent/Answer thay vì trộn với Retrieval.

### Tầng Agent end-to-end

Bộ Agent core dùng để đánh giá toàn bộ quá trình hiểu, hành động và trả lời:

- Intent, routing và quyết định dùng SQL, RAG hoặc tool.
- Chọn tool và tham số tool đúng; hoàn thành đúng task.
- Factual correctness, groundedness/faithfulness, answer relevance và abstention.
- Tư vấn, so sánh, TCO, guardrail, HITL và hội thoại nhiều lượt.
- Duy trì state, chat history, summary và memory đúng người dùng.
- Latency P50/P95, tỷ lệ lỗi, token và chi phí trên mỗi task.

### Nguyên tắc để kết quả đáng tin cậy

- Golden set phải đại diện cho dữ liệu thật, có ca khó, ca không trả lời
  được và hội thoại nhiều lượt.
- Tách development set và holdout set để tránh tối ưu prompt theo đúng bộ test.
- Version hóa dataset, catalog snapshot, model, prompt và tham số retrieval.
- Kết hợp deterministic checks, LLM-as-Judge và mẫu kiểm tra thủ công của con người.
- Chạy lặp lại các test có LLM để phát hiện tính không ổn định, không chỉ
  dựa vào một lần chạy.
- Benchmark RAG xác minh hệ thống tìm đúng dữ liệu, không chứng minh dữ liệu
  gốc trong database là chính xác.
