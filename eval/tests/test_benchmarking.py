from __future__ import annotations

from types import SimpleNamespace

import pytest

from eval.benchmarking.config import BenchmarkConfig
from eval.benchmarking.datasets import DatasetNotReviewedError, load_dataset
from eval.benchmarking.metrics import (
    evaluate_agent_state,
    evaluate_retrieval_result,
    ndcg_at_k,
    reciprocal_rank,
)
from eval.benchmarking.models import (
    AgentExpectation,
    BenchmarkCase,
    BenchmarkDataset,
    DatasetMetadata,
    DatasetSplit,
    DialogueTurn,
    Difficulty,
    RetrievalExpectation,
    ReviewStatus,
    TrajectoryStep,
)
from eval.benchmarking.reporting import build_report
from eval.benchmarking.runners import AgentBenchmarkRunner, LangGraphObserver
from eval.review_dataset import apply_sheet, export_sheet, review_agreement


def _candidate(vehicle: str, chunk: str, rank: int) -> SimpleNamespace:
    return SimpleNamespace(
        vector_id=f"vector-{rank}",
        vehicle_id=vehicle,
        chunk_type=chunk,
    )


def test_rank_metrics_reward_early_relevant_evidence():
    relevance = [False, True, False, True]

    assert reciprocal_rank(relevance, 4) == 0.5
    assert 0.0 < ndcg_at_k(relevance, 4) < 1.0


def test_retrieval_evaluation_measures_top20_and_final_top3():
    result = SimpleNamespace(
        fused_candidates=(
            _candidate("vf8", "performance_energy", 1),
            _candidate("vf9", "performance_energy", 2),
            _candidate("noise", "exterior", 3),
        ),
        snippets=(
            _candidate("vf8", "performance_energy", 1),
            _candidate("noise", "exterior", 3),
            _candidate("vf9", "performance_energy", 2),
        ),
        resolved_vehicles=(SimpleNamespace(vehicle_id="vf8"), SimpleNamespace(vehicle_id="vf9")),
        query_plan=SimpleNamespace(queries=("q", "q2")),
    )
    expectation = RetrievalExpectation(
        vehicle_type="car",
        vehicle_ids=["vf8", "vf9"],
        chunk_types=["performance_energy"],
    )

    metrics = evaluate_retrieval_result(result, expectation, latency_ms=12.5)

    assert metrics["vehicle_recall_at_20"] == 1.0
    assert metrics["vehicle_recall_at_3"] == 1.0
    assert metrics["chunk_recall_at_3"] == 1.0
    assert metrics["vehicle_precision_at_3"] == pytest.approx(2 / 3)
    assert metrics["labeled_evidence_precision_at_3"] == pytest.approx(2 / 3)
    assert metrics["passed"] is True


def test_agent_evaluation_scores_route_action_and_trajectory_without_length_heuristic():
    state = {
        "is_blocked": False,
        "response": "VF 8 có thông tin pin trong catalog.",
        "extract_result": {
            "intent": "vinfast_query",
            "action_type": "direct_answer",
            "need_rag": True,
            "need_sql": False,
        },
        "evaluation_trace": {
            "catalog_lookup_used": False,
            "rag_context_used": True,
        },
    }
    expectation = AgentExpectation(
        intent_any_of=["vinfast_query"],
        action_any_of=["direct_answer"],
        blocked=False,
        use_rag=True,
        use_sql=False,
        required_nodes=["needs_discovery"],
    )

    result = evaluate_agent_state(
        state,
        [TrajectoryStep(node="preprocess"), TrajectoryStep(node="needs_discovery")],
        expectation,
    )

    assert result["passed"] is True
    assert result["task_completion"] == 1.0
    assert set(result["checks"]) == {"intent", "action", "blocked", "use_rag", "use_sql", "required_nodes"}


def test_agent_evaluation_uses_observed_execution_not_planned_flags():
    state = {
        "response": "comparison",
        "extract_result": {
            "intent": "vinfast_query",
            "action_type": "compare_vehicles",
            "need_rag": False,
            "need_sql": False,
        },
        "evaluation_trace": {
            "catalog_lookup_used": True,
            "rag_context_used": True,
        },
    }
    expectation = AgentExpectation(use_rag=True, use_sql=True)

    result = evaluate_agent_state(state, [], expectation)

    assert result["passed"] is True
    assert result["checks"] == {"use_rag": True, "use_sql": True}


def test_draft_dataset_requires_explicit_override(tmp_path):
    dataset = BenchmarkDataset(
        metadata=DatasetMetadata(
            name="draft",
            description="Draft benchmark",
            review_status=ReviewStatus.NEEDS_REVIEW,
        ),
        cases=[
            BenchmarkCase(
                id="R-1",
                kind="retrieval",
                category="single_fact",
                difficulty=Difficulty.EASY,
                conversation=[DialogueTurn(role="user", content="VF 8 giá bao nhiêu?")],
                retrieval=RetrievalExpectation(vehicle_type="car", vehicle_ids=["vf8"]),
                review_status=ReviewStatus.NEEDS_REVIEW,
            )
        ],
    )
    path = tmp_path / "dataset.json"
    path.write_text(dataset.model_dump_json(indent=2), encoding="utf-8")

    with pytest.raises(DatasetNotReviewedError):
        load_dataset(path)
    assert load_dataset(path, allow_draft=True).metadata.name == "draft"


def test_quality_gate_never_certifies_unreviewed_dataset():
    report = build_report(
        kind="retrieval",
        records=[
            {
                "case_id": "R-1",
                "run": 1,
                "kind": "retrieval",
                "category": "single_fact",
                "difficulty": "easy",
                "passed": True,
                "vehicle_recall_at_20": 1.0,
                "vehicle_recall_at_3": 1.0,
                "chunk_recall_at_3": 1.0,
                "vehicle_precision_at_3": 1.0,
                "labeled_evidence_precision_at_3": 1.0,
                "mrr_at_20": 1.0,
                "ndcg_at_20": 1.0,
                "latency_ms": 100.0,
            }
        ],
        dataset_info={"name": "draft", "sha256": "abc"},
        run_info={},
        config=BenchmarkConfig(),
        expert_reviewed=False,
        judge_enabled=False,
    )

    assert report["quality_gate"]["metric_passed"] is True
    assert report["quality_gate"]["certified"] is False
    assert report["quality_gate"]["status"] == "not_certified_dataset"


def test_report_groups_actionable_failure_causes():
    report = build_report(
        kind="agent",
        records=[
            {
                "case_id": "A-FAIL",
                "run": 1,
                "kind": "agent",
                "category": "answer",
                "difficulty": "hard",
                "passed": False,
                "deterministic_passed": False,
                "task_completion": 0.5,
                "checks": {"use_rag": False, "intent": True},
                "judge": {
                    "correctness": 0.2,
                    "faithfulness": 0.1,
                    "relevance": 0.9,
                    "completeness": 0.3,
                    "safety": 1.0,
                },
                "judge_correctness": 0.2,
                "judge_faithfulness": 0.1,
                "judge_relevance": 0.9,
                "judge_completeness": 0.3,
                "judge_safety": 1.0,
                "latency_ms": 100.0,
            }
        ],
        dataset_info={"name": "draft", "sha256": "abc"},
        run_info={},
        config=BenchmarkConfig(),
        expert_reviewed=False,
        judge_enabled=True,
    )

    failures = report["summary"]["failure_analysis"]
    assert failures["deterministic_check:use_rag"]["count"] == 1
    assert failures["judge_below_threshold:correctness"]["case_runs"] == ["A-FAIL#run-1"]
    assert "judge_below_threshold:relevance" not in failures


@pytest.mark.asyncio
async def test_langgraph_observer_collects_node_updates():
    class FakeGraph:
        async def astream(self, state, stream_mode):
            assert stream_mode == "updates"
            yield {"preprocess": {"is_blocked": False}}
            yield {"needs_discovery": {"response": "ok", "current_stage": "NEEDS_DISCOVERY"}}

    state, trajectory = await LangGraphObserver(FakeGraph()).invoke({"query": "hello"})

    assert state["response"] == "ok"
    assert [step.node for step in trajectory] == ["preprocess", "needs_discovery"]


@pytest.mark.asyncio
async def test_agent_runner_excludes_warmup_from_reported_records():
    class FakeGraph:
        def __init__(self):
            self.calls = 0

        async def astream(self, state, stream_mode):
            self.calls += 1
            yield {
                "needs_discovery": {
                    "response": "safe refusal",
                    "is_blocked": True,
                    "extract_result": {
                        "intent": "out_of_scope",
                        "action_type": "refusal",
                    },
                }
            }

    dataset = BenchmarkDataset(
        metadata=DatasetMetadata(name="agent", description="Agent benchmark"),
        cases=[
            BenchmarkCase(
                id="A-1",
                kind="agent",
                category="safety_out_of_scope",
                difficulty=Difficulty.ADVERSARIAL,
                conversation=[DialogueTurn(role="user", content="weather")],
                agent=AgentExpectation(
                    intent_any_of=["out_of_scope"],
                    action_any_of=["refusal"],
                    blocked=True,
                ),
            )
        ],
    )
    graph = FakeGraph()
    runner = AgentBenchmarkRunner(graph=graph)

    records = await runner.run(dataset, runs=2, warmup=1)

    assert graph.calls == 3
    assert len(records) == 2
    assert [record["run"] for record in records] == [1, 2]


@pytest.mark.asyncio
async def test_agent_runner_can_sample_each_category_deterministically():
    class FakeGraph:
        async def astream(self, state, stream_mode):
            yield {
                "needs_discovery": {
                    "response": "ok",
                    "extract_result": {"intent": "vinfast_query", "action_type": "direct_answer"},
                }
            }

    cases = []
    for category in ("answer", "safety"):
        for index in range(3):
            cases.append(
                BenchmarkCase(
                    id=f"{category}-{index}",
                    kind="agent",
                    category=category,
                    difficulty=Difficulty.EASY,
                    conversation=[DialogueTurn(role="user", content=f"question {index}")],
                    agent=AgentExpectation(required_nodes=["needs_discovery"]),
                )
            )
    dataset = BenchmarkDataset(
        metadata=DatasetMetadata(name="stratified", description="stratified sample"),
        cases=cases,
    )

    records = await AgentBenchmarkRunner(graph=FakeGraph()).run(
        dataset,
        runs=1,
        per_category=1,
    )

    assert [record["case_id"] for record in records] == ["answer-0", "safety-0"]


def test_two_expert_review_workflow(tmp_path):
    dataset = BenchmarkDataset(
        metadata=DatasetMetadata(name="review", description="review workflow"),
        cases=[
            BenchmarkCase(
                id="A-1",
                kind="agent",
                category="answer",
                difficulty=Difficulty.EASY,
                split=DatasetSplit.HOLDOUT,
                conversation=[DialogueTurn(role="user", content="question")],
                agent=AgentExpectation(reference_answer="answer"),
            )
        ],
    )
    dataset_path = tmp_path / "dataset.json"
    sheet_path = tmp_path / "review.csv"
    output_path = tmp_path / "approved.json"
    dataset_path.write_text(dataset.model_dump_json(indent=2), encoding="utf-8")
    export_sheet(dataset_path, sheet_path)
    text = sheet_path.read_text(encoding="utf-8-sig")
    text = text.replace(",,,,,,\n", ",expert_a,approve,ok,expert_b,approve,ok\n")
    sheet_path.write_text(text, encoding="utf-8-sig")

    apply_sheet(dataset_path, sheet_path, output_path)
    approved = load_dataset(output_path)

    assert approved.is_expert_reviewed
    assert approved.metadata.reviewers == ["expert_a", "expert_b"]
    agreement = review_agreement(sheet_path)
    assert agreement["coverage"] == 1.0
    assert agreement["kappa"] == 1.0
