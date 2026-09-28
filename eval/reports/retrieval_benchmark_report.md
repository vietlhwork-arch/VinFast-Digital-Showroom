# Retrieval Benchmark Report

- Generated: `2026-08-27T08:08:59.192479+00:00`
- Dataset: `vinfast-rag-retrieval-candidate`
- Dataset version: `1.0.0`
- Dataset SHA-256: `d78d54f8026ab9ceac94fa2f4290bac4b46d613505494f7d0a18d3c3eb2e1095`
- Agent model: `gpt-4o-mini`
- Executions: **100**
- Unique cases: **100**
- Pass rate: **83.84%**
- Error rate: **0.00%**
- Quality gate: **not_certified_dataset**

> A report from a draft or needs-review dataset is never certified, even if all metric thresholds pass.

## Metrics

| Metric | Coverage | Mean | Std | 95% bootstrap CI |
|---|---:|---:|---:|---:|
| `vehicle_recall_at_20` | 99.00% | 0.9916 | 0.0601 | [0.9781, 1.0000] |
| `vehicle_recall_at_3` | 99.00% | 0.9601 | 0.1528 | [0.9276, 0.9869] |
| `chunk_recall_at_3` | 99.00% | 0.9141 | 0.2579 | [0.8636, 0.9596] |
| `vehicle_precision_at_3` | 99.00% | 0.9428 | 0.1784 | [0.9057, 0.9731] |
| `labeled_evidence_precision_at_3` | 99.00% | 0.3704 | 0.1957 | [0.3333, 0.4108] |
| `mrr_at_20` | 99.00% | 0.7928 | 0.2911 | [0.7361, 0.8471] |
| `ndcg_at_20` | 99.00% | 0.8234 | 0.2032 | [0.7834, 0.8609] |
| `latency_ms` | 100.00% | 149214.8089 | 110549.7917 | [128705.2790, 172153.8340] |
| `query_variants` | 100.00% | 2.4600 | 0.8924 | [2.2800, 2.6200] |

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
| `recommendation_filter` | 8 | 12.50% | 0.00% |
| `single_fact` | 66 | 93.94% | 0.00% |
| `unanswerable` | 8 | 85.71% | 0.00% |

## Split breakdown

| Split | Executions | Pass rate | Error rate |
|---|---:|---:|---:|
| `development` | 79 | 83.33% | 0.00% |
| `holdout` | 21 | 85.71% | 0.00% |

## Failure analysis

| Cause | Count | Case runs |
|---|---:|---|
| `retrieval_miss:chunk_recall_at_3` | 11 | `CAR-005#run-1`, `CAR-017#run-1`, `CAR-019#run-1`, `MOTO-012#run-1`, `REC-002#run-1`, `REC-004#run-1`, `CMP-011#run-1`, `CMP-013#run-1`, `CMP-014#run-1`, `CMP-015#run-1`, `NA-006#run-1` |
| `retrieval_noise:vehicle_precision_at_3` | 10 | `CAR-005#run-1`, `CMP-004#run-1`, `REC-001#run-1`, `REC-002#run-1`, `REC-003#run-1`, `REC-004#run-1`, `CAR-028#run-1`, `CMP-013#run-1`, `REC-006#run-1`, `NA-006#run-1` |
| `retrieval_miss:vehicle_recall_at_3` | 7 | `REC-001#run-1`, `REC-002#run-1`, `REC-003#run-1`, `REC-004#run-1`, `REC-005#run-1`, `REC-006#run-1`, `REC-007#run-1` |
| `retrieval_miss:vehicle_recall_at_20` | 2 | `REC-002#run-1`, `REC-003#run-1` |

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
