"""Execution adapters for the catalog retriever and LangGraph Agent."""

from __future__ import annotations

import asyncio
import time
from collections.abc import Iterable
from typing import Any

from eval.benchmarking.judge import AnswerJudge
from eval.benchmarking.metrics import evaluate_agent_state, evaluate_retrieval_result
from eval.benchmarking.models import BenchmarkCase, BenchmarkDataset, DialogueTurn, TrajectoryStep


def _selected_cases(
    dataset: BenchmarkDataset,
    *,
    kind: str,
    categories: set[str] | None,
    split: str | None,
    per_category: int | None,
    limit: int | None,
) -> list[BenchmarkCase]:
    cases = [case for case in dataset.cases if case.kind == kind]
    if categories:
        cases = [case for case in cases if case.category in categories]
    if split:
        cases = [case for case in cases if case.split.value == split]
    if per_category is not None:
        if per_category < 1:
            raise ValueError("per_category must be at least 1")
        category_counts: dict[str, int] = {}
        stratified: list[BenchmarkCase] = []
        for case in cases:
            count = category_counts.get(case.category, 0)
            if count >= per_category:
                continue
            stratified.append(case)
            category_counts[case.category] = count + 1
        cases = stratified
    return cases[:limit] if limit else cases


class RetrievalBenchmarkRunner:
    def __init__(self, *, concurrency: int = 1) -> None:
        if concurrency < 1:
            raise ValueError("concurrency must be at least 1")
        self._concurrency = concurrency

    async def run(
        self,
        dataset: BenchmarkDataset,
        *,
        runs: int,
        warmup: int = 0,
        categories: set[str] | None = None,
        split: str | None = None,
        per_category: int | None = None,
        limit: int | None = None,
    ) -> list[dict[str, Any]]:
        from src.services.database import SessionLocal
        from src.services.rag.retrieval.models import RetrievalFilters
        from src.services.rag_service import retrieve_catalog

        cases = _selected_cases(
            dataset,
            kind="retrieval",
            categories=categories,
            split=split,
            per_category=per_category,
            limit=limit,
        )
        semaphore = asyncio.Semaphore(self._concurrency)

        async def execute(case: BenchmarkCase, run_number: int) -> dict[str, Any]:
            started = time.perf_counter()
            try:
                assert case.retrieval is not None
                filters = RetrievalFilters(vehicle_type=case.retrieval.vehicle_type)
                async with semaphore:
                    async with SessionLocal() as db:
                        result = await retrieve_catalog(db, case.question, filters=filters)
                latency_ms = (time.perf_counter() - started) * 1000
                metrics = evaluate_retrieval_result(
                    result,
                    case.retrieval,
                    latency_ms=latency_ms,
                )
                return {
                    "case_id": case.id,
                    "run": run_number,
                    "kind": case.kind,
                    "category": case.category,
                    "difficulty": case.difficulty.value,
                    "split": case.split.value,
                    "review_status": case.review_status.value,
                    **metrics,
                }
            except Exception as error:
                return {
                    "case_id": case.id,
                    "run": run_number,
                    "kind": case.kind,
                    "category": case.category,
                    "difficulty": case.difficulty.value,
                    "split": case.split.value,
                    "review_status": case.review_status.value,
                    "passed": False,
                    "latency_ms": (time.perf_counter() - started) * 1000,
                    "error": f"{type(error).__name__}: {error}",
                }

        output: list[dict[str, Any]] = []
        if warmup:
            await asyncio.gather(*(execute(case, 0) for case in cases[:warmup]))
        for run_number in range(1, runs + 1):
            output.extend(await asyncio.gather(*(execute(case, run_number) for case in cases)))
        return output


class LangGraphObserver:
    def __init__(self, graph: Any) -> None:
        self._graph = graph

    async def invoke(self, state: dict[str, Any]) -> tuple[dict[str, Any], list[TrajectoryStep]]:
        if not hasattr(self._graph, "astream"):
            return await self._graph.ainvoke(state), []

        accumulated = dict(state)
        trajectory: list[TrajectoryStep] = []
        try:
            async for event in self._graph.astream(state, stream_mode="updates"):
                if not isinstance(event, dict):
                    continue
                for node, update in event.items():
                    if isinstance(update, dict):
                        accumulated.update(update)
                        trajectory.append(TrajectoryStep(node=str(node), output_keys=sorted(map(str, update.keys()))))
                    else:
                        trajectory.append(TrajectoryStep(node=str(node)))
            return accumulated, trajectory
        except TypeError:
            return await self._graph.ainvoke(state), trajectory


def _json_safe_state(state: dict[str, Any]) -> dict[str, Any]:
    keys = (
        "current_stage",
        "is_blocked",
        "response",
        "action",
        "analysis",
        "extract_result",
        "rag_context",
        "last_query_result",
        "metadata",
        "user_profile",
    )
    return {key: state.get(key) for key in keys if key in state}


def _context_from_state(state: dict[str, Any]) -> list[str]:
    contexts: list[str] = []
    direct = state.get("rag_context")
    if isinstance(direct, str) and direct.strip():
        contexts.append(direct)
    cached = state.get("last_query_result")
    if isinstance(cached, dict):
        value = cached.get("rag_context")
        if isinstance(value, str) and value.strip():
            contexts.append(value)
        cand_str = cached.get("candidates_json") or cached.get("raw_cars")
        if isinstance(cand_str, str) and cand_str.strip():
            contexts.append(cand_str)
    # Include SQL candidates as evidence for Judge
    candidates_json = state.get("candidates_json")
    if isinstance(candidates_json, str) and candidates_json.strip():
        contexts.append(candidates_json)
    return contexts



def _usage_from_state(state: dict[str, Any]) -> dict[str, float]:
    metadata = state.get("metadata") if isinstance(state.get("metadata"), dict) else {}
    candidates = [state.get("usage"), metadata.get("usage"), metadata.get("llm_usage")]
    usage = next((item for item in candidates if isinstance(item, dict)), {})
    aliases = {
        "input_tokens": ("input_tokens", "prompt_tokens"),
        "output_tokens": ("output_tokens", "completion_tokens"),
        "cost_usd": ("cost_usd", "total_cost_usd"),
    }
    output: dict[str, float] = {}
    for normalized, names in aliases.items():
        value = next((usage.get(name) for name in names if usage.get(name) is not None), None)
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            output[normalized] = float(value)
    return output


class AgentBenchmarkRunner:
    def __init__(
        self,
        *,
        graph: Any,
        judge: AnswerJudge | None = None,
        concurrency: int = 1,
    ) -> None:
        if concurrency < 1:
            raise ValueError("concurrency must be at least 1")
        self._observer = LangGraphObserver(graph)
        self._judge = judge
        self._concurrency = concurrency

    async def _run_conversation(
        self,
        turns: Iterable[DialogueTurn],
    ) -> tuple[dict[str, Any], list[TrajectoryStep]]:
        carried: dict[str, Any] = {}
        history: list[dict[str, str]] = []
        full_trajectory: list[TrajectoryStep] = []
        final_state: dict[str, Any] = {}

        for turn in turns:
            history.append({"role": turn.role, "content": turn.content})
            if turn.role != "user":
                continue
            state = {
                **carried,
                "query": turn.content,
                "messages": list(history),
                "chat_history": list(history),
            }
            final_state, trajectory = await self._observer.invoke(state)
            full_trajectory.extend(trajectory)
            response = str(final_state.get("response") or "")
            if response:
                history.append({"role": "assistant", "content": response})
            carried = {
                key: final_state[key]
                for key in (
                    "user_profile",
                    "existing_summary",
                    "metadata",
                    "last_query_hash",
                    "last_query_result",
                )
                if key in final_state
            }
        return final_state, full_trajectory

    async def run(
        self,
        dataset: BenchmarkDataset,
        *,
        runs: int,
        warmup: int = 0,
        categories: set[str] | None = None,
        split: str | None = None,
        per_category: int | None = None,
        limit: int | None = None,
    ) -> list[dict[str, Any]]:
        cases = _selected_cases(
            dataset,
            kind="agent",
            categories=categories,
            split=split,
            per_category=per_category,
            limit=limit,
        )
        semaphore = asyncio.Semaphore(self._concurrency)

        async def execute(case: BenchmarkCase, run_number: int) -> dict[str, Any]:
            started = time.perf_counter()
            try:
                assert case.agent is not None
                async with semaphore:
                    state, trajectory = await self._run_conversation(case.conversation)
                latency_ms = (time.perf_counter() - started) * 1000
                deterministic = evaluate_agent_state(state, trajectory, case.agent)
                record: dict[str, Any] = {
                    "case_id": case.id,
                    "run": run_number,
                    "kind": case.kind,
                    "category": case.category,
                    "difficulty": case.difficulty.value,
                    "split": case.split.value,
                    "review_status": case.review_status.value,
                    "latency_ms": latency_ms,
                    "deterministic_passed": deterministic["passed"],
                    "task_completion": deterministic["task_completion"],
                    "checks": deterministic["checks"],
                    "actual_intent": deterministic["actual_intent"],
                    "actual_action": deterministic["actual_action"],
                    "trajectory": [step.model_dump(mode="json") for step in trajectory],
                    "observed_tools": deterministic["observed_tools"],
                    "response": deterministic["response"],
                    "state": _json_safe_state(state),
                    **_usage_from_state(state),
                }
                if self._judge is not None:
                    verdict = await self._judge.evaluate(
                        question=case.question,
                        answer=deterministic["response"],
                        reference_answer=case.agent.reference_answer,
                        expected_facts=case.agent.expected_facts,
                        contexts=_context_from_state(state),
                        must_abstain=case.agent.must_abstain,
                    )
                    judge_payload = verdict.model_dump(mode="json")
                    record["judge"] = judge_payload
                    for key, value in judge_payload.items():
                        if isinstance(value, (int, float)) and not isinstance(value, bool):
                            record[f"judge_{key}"] = value
                    record["judge_passed"] = verdict.passed
                    record["passed"] = bool(deterministic["passed"] and verdict.passed)
                else:
                    record["judge"] = None
                    record["judge_passed"] = None
                    record["passed"] = bool(deterministic["passed"])
                return record
            except Exception as error:
                return {
                    "case_id": case.id,
                    "run": run_number,
                    "kind": case.kind,
                    "category": case.category,
                    "difficulty": case.difficulty.value,
                    "split": case.split.value,
                    "review_status": case.review_status.value,
                    "passed": False,
                    "latency_ms": (time.perf_counter() - started) * 1000,
                    "error": f"{type(error).__name__}: {error}",
                }

        output: list[dict[str, Any]] = []
        if warmup:
            await asyncio.gather(*(execute(case, 0) for case in cases[:warmup]))
        for run_number in range(1, runs + 1):
            output.extend(await asyncio.gather(*(execute(case, run_number) for case in cases)))
        return output


__all__ = ["AgentBenchmarkRunner", "LangGraphObserver", "RetrievalBenchmarkRunner"]
