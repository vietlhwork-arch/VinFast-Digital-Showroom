"""Machine-readable and human-readable benchmark reports."""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from eval.benchmarking.config import BenchmarkConfig
from eval.benchmarking.statistics import summarize_numeric

RETRIEVAL_METRICS = (
    "vehicle_recall_at_20",
    "vehicle_recall_at_3",
    "chunk_recall_at_3",
    "vehicle_precision_at_3",
    "labeled_evidence_precision_at_3",
    "mrr_at_20",
    "ndcg_at_20",
    "latency_ms",
    "query_variants",
)
AGENT_METRICS = (
    "task_completion",
    "judge_correctness",
    "judge_faithfulness",
    "judge_relevance",
    "judge_completeness",
    "judge_coherence",
    "judge_safety",
    "judge_abstention",
    "latency_ms",
    "input_tokens",
    "output_tokens",
    "cost_usd",
)


def _pass_rate(records: list[dict[str, Any]], key: str = "passed") -> float:
    scored = [record for record in records if isinstance(record.get(key), bool)]
    return sum(bool(record[key]) for record in scored) / len(scored) if scored else 0.0


def _strata(records: list[dict[str, Any]], field: str) -> dict[str, dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        grouped[str(record.get(field) or "unknown")].append(record)
    return {
        key: {
            "cases": len(group),
            "pass_rate": _pass_rate(group),
            "error_rate": sum("error" in item for item in group) / len(group),
        }
        for key, group in sorted(grouped.items())
    }


def _run_variability(records: list[dict[str, Any]]) -> dict[str, Any]:
    grouped: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        grouped[int(record.get("run", 1))].append(record)
    run_rates = [_pass_rate(group) for _, group in sorted(grouped.items())]
    return summarize_numeric([{"pass_rate": value} for value in run_rates], "pass_rate")


def _failure_analysis(
    kind: str,
    records: list[dict[str, Any]],
    config: BenchmarkConfig,
) -> dict[str, dict[str, Any]]:
    """Group failures into actionable causes instead of only listing failed cases."""

    grouped: dict[str, list[str]] = defaultdict(list)

    def add(cause: str, record: dict[str, Any]) -> None:
        case_key = f"{record.get('case_id', 'unknown')}#run-{record.get('run', 1)}"
        if case_key not in grouped[cause]:
            grouped[cause].append(case_key)

    for record in records:
        if record.get("error"):
            error_type = str(record["error"]).split(":", 1)[0]
            add(f"runtime_error:{error_type}", record)
            continue

        if kind == "retrieval":
            for metric in ("vehicle_recall_at_20", "vehicle_recall_at_3", "chunk_recall_at_3"):
                value = record.get(metric)
                if isinstance(value, (int, float)) and value < 1.0:
                    add(f"retrieval_miss:{metric}", record)
            precision = record.get("vehicle_precision_at_3")
            if isinstance(precision, (int, float)) and precision < 1.0:
                add("retrieval_noise:vehicle_precision_at_3", record)
            continue

        checks = record.get("checks")
        if isinstance(checks, dict):
            for check_name, passed in checks.items():
                if passed is False:
                    add(f"deterministic_check:{check_name}", record)

        judge = record.get("judge")
        if isinstance(judge, dict):
            thresholds = {
                "correctness": config.answer.correctness,
                "faithfulness": config.answer.faithfulness,
                "relevance": config.answer.relevance,
                "completeness": config.answer.completeness,
                "safety": config.answer.safety,
            }
            for dimension, threshold in thresholds.items():
                score = judge.get(dimension)
                if isinstance(score, (int, float)) and score < threshold:
                    add(f"judge_below_threshold:{dimension}", record)

    return {
        cause: {"count": len(case_keys), "case_runs": case_keys[:20]}
        for cause, case_keys in sorted(grouped.items(), key=lambda item: (-len(item[1]), item[0]))
    }


def _quality_gate(
    kind: str,
    summary: dict[str, Any],
    config: BenchmarkConfig,
    *,
    expert_reviewed: bool,
    judge_enabled: bool,
) -> dict[str, Any]:
    checks: dict[str, bool | None] = {}
    metrics = summary["metrics"]
    if kind == "retrieval":
        gate = config.retrieval
        for metric in (
            "vehicle_recall_at_20",
            "vehicle_recall_at_3",
            "chunk_recall_at_3",
            "vehicle_precision_at_3",
            "mrr_at_20",
        ):
            checks[metric] = metrics.get(metric, {}).get("mean", 0.0) >= getattr(gate, metric)
        checks["p95_latency_ms"] = metrics.get("latency_ms", {}).get("p95", float("inf")) <= gate.p95_latency_ms
    else:
        gate = config.agent
        checks["deterministic_pass_rate"] = summary["deterministic_pass_rate"] >= gate.deterministic_pass_rate
        checks["task_completion"] = metrics.get("task_completion", {}).get("mean", 0.0) >= gate.task_completion
        checks["error_rate"] = summary["error_rate"] <= gate.error_rate
        checks["p95_latency_ms"] = metrics.get("latency_ms", {}).get("p95", float("inf")) <= gate.p95_latency_ms
        safety_records = [
            record
            for record in summary["_records"]
            if "safety" in str(record.get("category", "")) or "guardrail" in str(record.get("category", ""))
        ]
        checks["safety_pass_rate"] = (
            _pass_rate(safety_records, "deterministic_passed") >= gate.safety_pass_rate if safety_records else None
        )
        if judge_enabled:
            answer_gate = config.answer
            for metric in ("correctness", "faithfulness", "relevance", "completeness", "safety"):
                checks[f"judge_{metric}"] = metrics.get(f"judge_{metric}", {}).get("mean", 0.0) >= getattr(
                    answer_gate, metric
                )
        else:
            checks["answer_quality"] = None

    measured_checks = [value for value in checks.values() if value is not None]
    metric_passed = bool(measured_checks) and all(measured_checks)
    return {
        "certified": expert_reviewed and metric_passed,
        "metric_passed": metric_passed,
        "dataset_expert_reviewed": expert_reviewed,
        "checks": checks,
        "status": "passed"
        if expert_reviewed and metric_passed
        else ("not_certified_dataset" if not expert_reviewed else "failed"),
    }


def build_report(
    *,
    kind: str,
    records: list[dict[str, Any]],
    dataset_info: dict[str, Any],
    run_info: dict[str, Any],
    config: BenchmarkConfig,
    expert_reviewed: bool,
    judge_enabled: bool,
) -> dict[str, Any]:
    metric_names = RETRIEVAL_METRICS if kind == "retrieval" else AGENT_METRICS
    successful = [record for record in records if "error" not in record]
    summary: dict[str, Any] = {
        "total_executions": len(records),
        "unique_cases": len({record["case_id"] for record in records}),
        "error_cases": sum("error" in record for record in records),
        "error_rate": sum("error" in record for record in records) / len(records) if records else 0.0,
        "pass_rate": _pass_rate(records),
        "deterministic_pass_rate": _pass_rate(records, "deterministic_passed") if kind == "agent" else None,
        "metrics": {
            metric: summarize_numeric(successful, metric)
            for metric in metric_names
            if any(metric in record for record in successful)
        },
        "measurement_coverage": {
            metric: (sum(metric in record for record in successful) / len(successful) if successful else 0.0)
            for metric in metric_names
        },
        "by_category": _strata(records, "category"),
        "by_difficulty": _strata(records, "difficulty"),
        "by_split": _strata(records, "split"),
        "run_variability": _run_variability(records),
        "failure_analysis": _failure_analysis(kind, records, config),
        "_records": records,
    }
    gate = _quality_gate(
        kind,
        summary,
        config,
        expert_reviewed=expert_reviewed,
        judge_enabled=judge_enabled,
    )
    summary.pop("_records")
    return {
        "schema_version": 2,
        "generated_at": datetime.now(UTC).isoformat(),
        "kind": kind,
        "dataset": dataset_info,
        "run": run_info,
        "summary": summary,
        "quality_gate": gate,
        "results": records,
    }


def render_markdown(report: dict[str, Any]) -> str:
    summary = report["summary"]
    gate = report["quality_gate"]
    lines = [
        f"# {report['kind'].title()} Benchmark Report",
        "",
        f"- Generated: `{report['generated_at']}`",
        f"- Dataset: `{report['dataset']['name']}`",
        f"- Dataset version: `{report['dataset'].get('dataset_version', 'unknown')}`",
        f"- Dataset SHA-256: `{report['dataset']['sha256']}`",
        f"- Agent model: `{report['run'].get('system_under_test', {}).get('agent_model', 'unknown')}`",
        f"- Executions: **{summary['total_executions']}**",
        f"- Unique cases: **{summary['unique_cases']}**",
        f"- Pass rate: **{summary['pass_rate']:.2%}**",
        f"- Error rate: **{summary['error_rate']:.2%}**",
        f"- Quality gate: **{gate['status']}**",
        "",
        "> A report from a draft or needs-review dataset is never certified, even if all metric thresholds pass.",
        "",
        "## Metrics",
        "",
        "| Metric | Coverage | Mean | Std | 95% bootstrap CI |",
        "|---|---:|---:|---:|---:|",
    ]
    for name, values in summary["metrics"].items():
        lines.append(
            f"| `{name}` | {summary['measurement_coverage'].get(name, 0):.2%} | "
            f"{values.get('mean', 0):.4f} | {values.get('std', 0):.4f} | "
            f"[{values.get('ci_low', 0):.4f}, {values.get('ci_high', 0):.4f}] |"
        )
    missing = [name for name, coverage in summary["measurement_coverage"].items() if coverage == 0.0]
    if missing:
        lines.extend(
            [
                "",
                "Unmeasured signals: " + ", ".join(f"`{name}`" for name in missing) + ".",
            ]
        )
    lines.extend(["", "## Quality gate", "", "| Check | Result |", "|---|---|"])
    for name, value in gate["checks"].items():
        rendered = "not measured" if value is None else ("pass" if value else "fail")
        lines.append(f"| `{name}` | {rendered} |")
    lines.extend(
        ["", "## Category breakdown", "", "| Category | Executions | Pass rate | Error rate |", "|---|---:|---:|---:|"]
    )
    for name, values in summary["by_category"].items():
        lines.append(f"| `{name}` | {values['cases']} | {values['pass_rate']:.2%} | {values['error_rate']:.2%} |")
    lines.extend(
        ["", "## Split breakdown", "", "| Split | Executions | Pass rate | Error rate |", "|---|---:|---:|---:|"]
    )
    for name, values in summary["by_split"].items():
        lines.append(f"| `{name}` | {values['cases']} | {values['pass_rate']:.2%} | {values['error_rate']:.2%} |")
    lines.extend(["", "## Failure analysis", ""])
    if not summary["failure_analysis"]:
        lines.append("No failure causes detected in this run.")
    else:
        lines.extend(["| Cause | Count | Case runs |", "|---|---:|---|"])
        for cause, values in summary["failure_analysis"].items():
            case_runs = ", ".join(f"`{case_run}`" for case_run in values["case_runs"])
            lines.append(f"| `{cause}` | {values['count']} | {case_runs} |")
    failures = [record for record in report["results"] if record.get("passed") is False]
    lines.extend(["", "## Failure sample", ""])
    if not failures:
        lines.append("No failed cases in this run.")
    else:
        for record in failures[:10]:
            detail = record.get("error") or record.get("checks") or "metric threshold failed"
            lines.append(f"- `{record['case_id']}` run {record.get('run', 1)}: `{detail}`")
    return "\n".join(lines) + "\n"


def write_report(report: dict[str, Any], output_json: Path) -> tuple[Path, Path]:
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(report, ensure_ascii=False, indent=2, default=str) + "\n", encoding="utf-8")
    markdown_path = output_json.with_suffix(".md")
    markdown_path.write_text(render_markdown(report), encoding="utf-8")
    return output_json, markdown_path


__all__ = ["build_report", "render_markdown", "write_report"]
