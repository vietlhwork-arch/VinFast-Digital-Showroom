# Retrieval Benchmark Report

- Generated: `2026-08-24T12:24:15.525393+00:00`
- Dataset: `vinfast-rag-retrieval-candidate`
- Dataset version: `1.0.0`
- Dataset SHA-256: `0fd707b00a7368f2a874ace843676c9bf39b0efd8d27d9fbf48b770b01dc15d2`
- Agent model: `gpt-4o-mini`
- Executions: **4**
- Unique cases: **4**
- Pass rate: **75.00%**
- Error rate: **0.00%**
- Quality gate: **not_certified_dataset**

> A report from a draft or needs-review dataset is never certified, even if all metric thresholds pass.

## Metrics

| Metric | Coverage | Mean | Std | 95% bootstrap CI |
|---|---:|---:|---:|---:|
| `vehicle_recall_at_20` | 100.00% | 1.0000 | 0.0000 | [1.0000, 1.0000] |
| `vehicle_recall_at_3` | 100.00% | 0.8333 | 0.3333 | [0.5000, 1.0000] |
| `chunk_recall_at_3` | 100.00% | 1.0000 | 0.0000 | [1.0000, 1.0000] |
| `vehicle_precision_at_3` | 100.00% | 0.8333 | 0.3333 | [0.5000, 1.0000] |
| `labeled_evidence_precision_at_3` | 100.00% | 0.4167 | 0.1667 | [0.3333, 0.5833] |
| `mrr_at_20` | 100.00% | 0.8333 | 0.3333 | [0.5000, 1.0000] |
| `ndcg_at_20` | 100.00% | 0.8626 | 0.1895 | [0.6705, 0.9831] |
| `latency_ms` | 100.00% | 12142.9062 | 7165.6733 | [6407.0676, 17878.7448] |
| `query_variants` | 100.00% | 2.5000 | 1.0000 | [1.5000, 3.0000] |

## Quality gate

| Check | Result |
|---|---|
| `vehicle_recall_at_20` | pass |
| `vehicle_recall_at_3` | fail |
| `chunk_recall_at_3` | pass |
| `vehicle_precision_at_3` | pass |
| `mrr_at_20` | pass |
| `p95_latency_ms` | fail |

## Category breakdown

| Category | Executions | Pass rate | Error rate |
|---|---:|---:|---:|
| `comparison` | 1 | 100.00% | 0.00% |
| `recommendation_filter` | 1 | 0.00% | 0.00% |
| `single_fact` | 1 | 100.00% | 0.00% |
| `unanswerable` | 1 | 100.00% | 0.00% |

## Split breakdown

| Split | Executions | Pass rate | Error rate |
|---|---:|---:|---:|
| `development` | 2 | 100.00% | 0.00% |
| `holdout` | 2 | 50.00% | 0.00% |

## Failure analysis

| Cause | Count | Case runs |
|---|---:|---|
| `retrieval_miss:vehicle_recall_at_3` | 1 | `REC-001#run-1` |
| `retrieval_noise:vehicle_precision_at_3` | 1 | `REC-001#run-1` |

## Failure sample

- `REC-001` run 1: `metric threshold failed`
