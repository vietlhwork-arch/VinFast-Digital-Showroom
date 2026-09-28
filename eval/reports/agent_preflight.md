# Agent Benchmark Report

- Generated: `2026-08-24T12:24:15.142327+00:00`
- Dataset: `vinfast-agent-production-candidate`
- Dataset version: `1.0.0`
- Dataset SHA-256: `800d92e706753287f922b17175ee2a58fde513d6b1d5ba68aff14f0a8106f585`
- Agent model: `gpt-4o-mini`
- Executions: **3**
- Unique cases: **3**
- Pass rate: **0.00%**
- Error rate: **0.00%**
- Quality gate: **not_certified_dataset**

> A report from a draft or needs-review dataset is never certified, even if all metric thresholds pass.

## Metrics

| Metric | Coverage | Mean | Std | 95% bootstrap CI |
|---|---:|---:|---:|---:|
| `task_completion` | 100.00% | 0.8000 | 0.0000 | [0.8000, 0.8000] |
| `latency_ms` | 100.00% | 9976.1688 | 3142.3620 | [6872.3798, 13155.7332] |

Unmeasured signals: `judge_correctness`, `judge_faithfulness`, `judge_relevance`, `judge_completeness`, `judge_coherence`, `judge_safety`, `judge_abstention`, `input_tokens`, `output_tokens`, `cost_usd`.

## Quality gate

| Check | Result |
|---|---|
| `deterministic_pass_rate` | fail |
| `task_completion` | fail |
| `error_rate` | pass |
| `p95_latency_ms` | fail |
| `safety_pass_rate` | not measured |
| `answer_quality` | not measured |

## Category breakdown

| Category | Executions | Pass rate | Error rate |
|---|---:|---:|---:|
| `answer_single_fact` | 3 | 0.00% | 0.00% |

## Split breakdown

| Split | Executions | Pass rate | Error rate |
|---|---:|---:|---:|
| `development` | 2 | 0.00% | 0.00% |
| `holdout` | 1 | 0.00% | 0.00% |

## Failure analysis

| Cause | Count | Case runs |
|---|---:|---|
| `deterministic_check:use_rag` | 3 | `AG-CAR-001#run-1`, `AG-CAR-002#run-1`, `AG-CAR-003#run-1` |

## Failure sample

- `AG-CAR-001` run 1: `{'intent': True, 'action': True, 'blocked': True, 'use_rag': False, 'required_nodes': True}`
- `AG-CAR-002` run 1: `{'intent': True, 'action': True, 'blocked': True, 'use_rag': False, 'required_nodes': True}`
- `AG-CAR-003` run 1: `{'intent': True, 'action': True, 'blocked': True, 'use_rag': False, 'required_nodes': True}`
