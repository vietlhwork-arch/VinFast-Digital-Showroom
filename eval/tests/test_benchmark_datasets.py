from __future__ import annotations

from pathlib import Path

from eval.benchmarking.datasets import dataset_inventory, load_dataset
from eval.benchmarking.models import ReviewStatus

EVAL_DIR = Path(__file__).resolve().parents[1]


def test_retrieval_benchmark_has_100_unique_candidate_cases():
    dataset = load_dataset(
        EVAL_DIR / "datasets" / "retrieval_candidate.json",
        allow_draft=True,
    )
    inventory = dataset_inventory(dataset)

    assert inventory["total_cases"] == 100
    assert inventory["categories"] == {
        "comparison": 18,
        "recommendation_filter": 8,
        "single_fact": 66,
        "unanswerable": 8,
    }
    assert inventory["difficulties"]["adversarial"] >= 10
    assert inventory["splits"]["holdout"] >= 20
    assert dataset.metadata.review_status == ReviewStatus.NEEDS_REVIEW
    assert len({case.id for case in dataset.cases}) == 100


def test_agent_production_v2_is_stratified_and_not_falsely_certified():
    dataset = load_dataset(
        EVAL_DIR / "datasets" / "agent_core_candidate.json",
        allow_draft=True,
    )
    inventory = dataset_inventory(dataset)
    categories = inventory["categories"]

    assert inventory["total_cases"] >= 100
    assert categories["answer_single_fact"] >= 30
    assert categories["multi_turn_state"] == 8
    assert categories["business_action"] == 6
    assert sum(count for name, count in categories.items() if name.startswith("safety_")) == 18
    assert sum(count for name, count in categories.items() if name.startswith("robustness_")) == 12
    assert inventory["splits"]["development"] > inventory["splits"]["holdout"]
    assert inventory["splits"]["holdout"] >= 20
    assert dataset.metadata.review_status == ReviewStatus.NEEDS_REVIEW
    assert inventory["review_coverage"] == 0.0


def test_blocked_safety_cases_stop_before_needs_discovery():
    dataset = load_dataset(
        EVAL_DIR / "datasets" / "agent_core_candidate.json",
        allow_draft=True,
    )
    blocked = [
        case for case in dataset.cases if case.category.startswith("safety_") and case.agent and case.agent.blocked
    ]

    assert blocked
    assert all("preprocess" in case.agent.required_nodes for case in blocked if case.agent)
    assert all("needs_discovery" in case.agent.forbidden_nodes for case in blocked if case.agent)


def test_agent_core_has_semantic_references_for_answer_cases():
    dataset = load_dataset(
        EVAL_DIR / "datasets" / "agent_core_candidate.json",
        allow_draft=True,
    )
    answer_cases = [case for case in dataset.cases if case.category.startswith("answer_")]

    assert answer_cases
    assert all(case.agent and case.agent.reference_answer for case in answer_cases)
    assert all(case.agent and case.agent.required_nodes for case in dataset.cases)
