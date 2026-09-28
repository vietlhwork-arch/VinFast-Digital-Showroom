# Retrieval Benchmark Report

- Generated: `2026-08-27T10:08:41.735804+00:00`
- Dataset: `vinfast-rag-retrieval-candidate`
- Dataset version: `1.0.0`
- Dataset SHA-256: `d78d54f8026ab9ceac94fa2f4290bac4b46d613505494f7d0a18d3c3eb2e1095`
- Agent model: `gpt-4o-mini`
- Executions: **100**
- Unique cases: **100**
- Pass rate: **82.83%**
- Error rate: **0.00%**
- Quality gate: **not_certified_dataset**

> A report from a draft or needs-review dataset is never certified, even if all metric thresholds pass.

## Metrics

| Metric | Coverage | Mean | Std | 95% bootstrap CI |
|---|---:|---:|---:|---:|
| `vehicle_recall_at_20` | 99.00% | 0.9966 | 0.0335 | [0.9899, 1.0000] |
| `vehicle_recall_at_3` | 99.00% | 0.9554 | 0.1569 | [0.9222, 0.9832] |
| `chunk_recall_at_3` | 99.00% | 0.9192 | 0.2546 | [0.8636, 0.9646] |
| `vehicle_precision_at_3` | 99.00% | 0.9394 | 0.1805 | [0.9024, 0.9697] |
| `labeled_evidence_precision_at_3` | 99.00% | 0.3636 | 0.1910 | [0.3266, 0.4040] |
| `mrr_at_20` | 99.00% | 0.7928 | 0.2911 | [0.7339, 0.8465] |
| `ndcg_at_20` | 99.00% | 0.8274 | 0.2039 | [0.7858, 0.8654] |
| `latency_ms` | 100.00% | 158772.2092 | 127496.0418 | [135252.9922, 185707.1993] |
| `query_variants` | 100.00% | 2.4000 | 0.9211 | [2.2200, 2.5800] |

## Quality gate

| Check | Result |
|---|---|
| `vehicle_recall_at_20` | pass |
| `vehicle_recall_at_3` | pass |
| `chunk_recall_at_3` | pass |
| `vehicle_precision_at_3` | pass |
| `mrr_at_20` | fail |
| `p95_latency_ms` | fail |

## Category breakdown

| Category | Executions | Pass rate | Error rate |
|---|---:|---:|---:|
| `comparison` | 18 | 77.78% | 0.00% |
| `recommendation_filter` | 8 | 0.00% | 0.00% |
| `single_fact` | 66 | 93.94% | 0.00% |
| `unanswerable` | 8 | 85.71% | 0.00% |

## Split breakdown

| Split | Executions | Pass rate | Error rate |
|---|---:|---:|---:|
| `development` | 79 | 83.33% | 0.00% |
| `holdout` | 21 | 80.95% | 0.00% |

## Failure analysis

| Cause | Count | Case runs |
|---|---:|---|
| `retrieval_noise:vehicle_precision_at_3` | 11 | `CAR-005#run-1`, `CMP-004#run-1`, `REC-001#run-1`, `REC-002#run-1`, `REC-003#run-1`, `REC-004#run-1`, `CAR-028#run-1`, `CMP-013#run-1`, `REC-006#run-1`, `REC-008#run-1`, `NA-006#run-1` |
| `retrieval_miss:chunk_recall_at_3` | 10 | `CAR-005#run-1`, `CAR-017#run-1`, `CAR-019#run-1`, `MOTO-012#run-1`, `REC-002#run-1`, `CMP-011#run-1`, `CMP-013#run-1`, `CMP-014#run-1`, `CMP-015#run-1`, `NA-006#run-1` |
| `retrieval_miss:vehicle_recall_at_3` | 8 | `REC-001#run-1`, `REC-002#run-1`, `REC-003#run-1`, `REC-004#run-1`, `REC-005#run-1`, `REC-006#run-1`, `REC-007#run-1`, `REC-008#run-1` |
| `retrieval_miss:vehicle_recall_at_20` | 1 | `REC-003#run-1` |

## Failure sample

- `CAR-005` run 1: `metric threshold failed`
- `CAR-017` run 1: `metric threshold failed`
- `CAR-019` run 1: `metric threshold failed`
- `MOTO-012` run 1: `metric threshold failed`
- `REC-001` run 1: `metric threshold failed`
- `REC-002` run 1: `metric threshold failed`
- `REC-003` run 1: `metric threshold failed`
- `REC-004` run 1: `metric threshold failed`
- `CMP-011` run 1: `metric threshold failed`
- `CMP-013` run 1: `metric threshold failed`
