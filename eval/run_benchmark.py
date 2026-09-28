"""Run versioned Retrieval or Agent benchmarks and emit JSON + Markdown reports."""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import importlib.metadata
import json
import subprocess
import sys
from dataclasses import asdict
from datetime import datetime
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from eval.benchmarking.config import load_config  # noqa: E402
from eval.benchmarking.datasets import (  # noqa: E402
    dataset_inventory,
    dataset_sha256,
    load_dataset,
)
from eval.benchmarking.judge import OpenAIAnswerJudge  # noqa: E402
from eval.benchmarking.reporting import build_report, write_report  # noqa: E402
from eval.benchmarking.runners import AgentBenchmarkRunner, RetrievalBenchmarkRunner  # noqa: E402

EVAL_DIR = Path(__file__).resolve().parent


def _git_commit() -> str | None:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            cwd=PROJECT_ROOT,
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        return None


def _dataset_info(path: Path, dataset: Any) -> dict[str, Any]:
    return {
        "name": dataset.metadata.name,
        "path": str(path),
        "sha256": dataset_sha256(path),
        "schema_version": dataset.metadata.schema_version,
        "dataset_version": dataset.metadata.dataset_version,
        "review_status": dataset.metadata.review_status.value,
        "catalog_snapshot": dataset.metadata.catalog_snapshot,
        "inventory": dataset_inventory(dataset),
    }


def _runtime_info() -> dict[str, Any]:
    from src.config import get_settings
    from src.services.rag.config import RAG_CONFIG

    settings = get_settings()
    prompt_hashes = {
        str(path.relative_to(PROJECT_ROOT)).replace("\\", "/"): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in sorted((PROJECT_ROOT / "src" / "agents" / "prompts").glob("*.jinja2"))
    }
    package_versions: dict[str, str | None] = {}
    for package in ("langchain", "langchain-core", "langchain-openai", "langgraph", "openai"):
        try:
            package_versions[package] = importlib.metadata.version(package)
        except importlib.metadata.PackageNotFoundError:
            package_versions[package] = None
    return {
        "agent_model": settings.model_name,
        "agent_temperature": settings.llm_temperature,
        "embedding_model": settings.embedding_model,
        "embedding_dimensions": settings.embedding_dimensions,
        "rag_config": asdict(RAG_CONFIG),
        "prompt_sha256": prompt_hashes,
        "package_versions": package_versions,
    }


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    validate = subparsers.add_parser("validate", help="Validate schema and print dataset inventory.")
    validate.add_argument("--dataset", type=Path, required=True)

    for command in ("retrieval", "agent"):
        sub = subparsers.add_parser(command)
        sub.add_argument("--dataset", type=Path, required=True)
        sub.add_argument("--config", type=Path, default=EVAL_DIR / "benchmark_config.json")
        sub.add_argument("--runs", type=int)
        sub.add_argument("--warmup", type=int)
        sub.add_argument("--concurrency", type=int, default=1, choices=range(1, 5))
        sub.add_argument("--limit", type=int)
        sub.add_argument(
            "--per-category",
            type=int,
            help="Deterministically select at most N cases from every selected category.",
        )
        sub.add_argument("--category", action="append", dest="categories")
        sub.add_argument("--split", choices=("development", "holdout"))
        sub.add_argument("--allow-draft", action="store_true")
        sub.add_argument("--enforce-gate", action="store_true")
        sub.add_argument("--output", type=Path)
        if command == "agent":
            sub.add_argument("--judge", action="store_true")
            sub.add_argument("--judge-model")
    return parser


async def _execute(args: argparse.Namespace) -> tuple[dict[str, Any], Path, Path]:
    config = load_config(args.config)
    dataset = load_dataset(args.dataset, allow_draft=args.allow_draft)
    runs = args.runs or config.statistics.default_runs
    warmup = args.warmup if args.warmup is not None else config.statistics.default_warmup_cases
    if runs < 1:
        raise ValueError("runs must be at least 1")
    if warmup < 0:
        raise ValueError("warmup must be non-negative")
    categories = set(args.categories) if args.categories else None
    judge = None
    judge_model = None

    if args.command == "retrieval":
        runner = RetrievalBenchmarkRunner(concurrency=args.concurrency)
    else:
        from src.agents.graph import agent
        from src.config import get_settings

        settings = get_settings()
        if args.judge:
            judge_model = args.judge_model or settings.model_name
            judge = OpenAIAnswerJudge(
                api_key=settings.openai_api_key,
                model_name=judge_model,
            )
        runner = AgentBenchmarkRunner(
            graph=agent,
            judge=judge,
            concurrency=args.concurrency,
        )

    records = await runner.run(
        dataset,
        runs=runs,
        warmup=warmup,
        categories=categories,
        split=args.split,
        per_category=args.per_category,
        limit=args.limit,
    )
    run_info = {
        "git_commit": _git_commit(),
        "runs": runs,
        "warmup_cases": warmup,
        "concurrency": args.concurrency,
        "limit": args.limit,
        "per_category": args.per_category,
        "categories": sorted(categories) if categories else None,
        "split": args.split,
        "judge_enabled": judge is not None,
        "judge_model": judge_model,
        "system_under_test": _runtime_info(),
        "config": config.model_dump(mode="json"),
    }
    report = build_report(
        kind=args.command,
        records=records,
        dataset_info=_dataset_info(args.dataset, dataset),
        run_info=run_info,
        config=config,
        expert_reviewed=dataset.is_expert_reviewed,
        judge_enabled=judge is not None,
    )
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output = args.output or EVAL_DIR / "reports" / f"{args.command}_benchmark_{timestamp}.json"
    json_path, markdown_path = write_report(report, output)
    return report, json_path, markdown_path


def main() -> None:
    args = _parser().parse_args()
    if args.command == "validate":
        dataset = load_dataset(args.dataset, allow_draft=True)
        print(json.dumps(dataset_inventory(dataset), ensure_ascii=False, indent=2))
        return

    report, json_path, markdown_path = asyncio.run(_execute(args))
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"JSON report: {json_path}")
    print(f"Markdown report: {markdown_path}")
    print(f"Quality gate: {report['quality_gate']['status']}")
    if args.enforce_gate and not report["quality_gate"]["certified"]:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
