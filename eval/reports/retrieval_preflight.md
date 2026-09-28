# Retrieval Benchmark Report

- Generated: `2026-08-24T12:24:15.408727+00:00`
- Dataset: `vinfast-rag-retrieval-candidate`
- Dataset version: `1.0.0`
- Dataset SHA-256: `0fd707b00a7368f2a874ace843676c9bf39b0efd8d27d9fbf48b770b01dc15d2`
- Agent model: `gpt-4o-mini`
- Executions: **3**
- Unique cases: **3**
- Pass rate: **100.00%**
- Error rate: **0.00%**
- Quality gate: **not_certified_dataset**

> A report from a draft or needs-review dataset is never certified, even if all metric thresholds pass.

## Metrics

| Metric | Coverage | Mean | Std | 95% bootstrap CI |
|---|---:|---:|---:|---:|
| `vehicle_recall_at_20` | 100.00% | 1.0000 | 0.0000 | [1.0000, 1.0000] |
| `vehicle_recall_at_3` | 100.00% | 1.0000 | 0.0000 | [1.0000, 1.0000] |
| `chunk_recall_at_3` | 100.00% | 1.0000 | 0.0000 | [1.0000, 1.0000] |
| `vehicle_precision_at_3` | 100.00% | 1.0000 | 0.0000 | [1.0000, 1.0000] |
| `labeled_evidence_precision_at_3` | 100.00% | 0.3333 | 0.0000 | [0.3333, 0.3333] |
| `mrr_at_20` | 100.00% | 1.0000 | 0.0000 | [1.0000, 1.0000] |
| `ndcg_at_20` | 100.00% | 1.0000 | 0.0000 | [1.0000, 1.0000] |
| `latency_ms` | 100.00% | 11762.2248 | 3775.9389 | [7847.9329, 15382.6367] |
| `query_variants` | 100.00% | 2.3333 | 1.1547 | [1.0000, 3.0000] |

## Quality gate

| Check | Result |
|---|---|
| `vehicle_recall_at_20` | pass |
| `vehicle_recall_at_3` | pass |
| `chunk_recall_at_3` | pass |
| `vehicle_precision_at_3` | pass |
| `mrr_at_20` | pass |
| `p95_latency_ms` | fail |

## Category breakdown

| Category | Executions | Pass rate | Error rate |
|---|---:|---:|---:|
| `single_fact` | 3 | 100.00% | 0.00% |

## Split breakdown

| Split | Executions | Pass rate | Error rate |
|---|---:|---:|---:|
| `development` | 3 | 100.00% | 0.00% |

## Failure analysis

No failure causes detected in this run.

## Failure sample

No failed cases in this run.
