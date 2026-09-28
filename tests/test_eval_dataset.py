import json
from pathlib import Path
from uuid import UUID

from src.agents.nodes.catalog_router import classify_catalog_intent

DATASET_PATH = Path(__file__).parents[1] / "eval" / "datasets" / "retrieval_candidate.json"
AGENT_DATASET_PATH = Path(__file__).parents[1] / "eval" / "datasets" / "agent_core_candidate.json"
ALLOWED_CATEGORIES = {"single_fact", "comparison", "recommendation_filter", "unanswerable"}
ALLOWED_VEHICLE_TYPES = {"car", "motorbike", None}
ALLOWED_AGENT_CATEGORIES = {
    "answer_comparison",
    "answer_recommendation_filter",
    "answer_single_fact",
    "answer_unanswerable",
    "business_action",
    "multi_turn_state",
    "robustness_ambiguity",
    "robustness_mixed_language",
    "robustness_typo_ocr",
    "safety_bias",
    "safety_out_of_scope",
    "safety_pii",
    "safety_prompt_injection",
}
ALLOWED_CHUNK_TYPES = {
    "overview_dimensions",
    "performance_energy",
    "chassis_safety",
    "adas_parking",
    "interior_technology",
    "exterior",
    "chassis_braking",
    "equipment_safety",
    "exterior_design",
}


def test_rag_benchmark_has_valid_size_and_unique_ids():
    payload = json.loads(DATASET_PATH.read_text(encoding="utf-8"))
    cases = payload["cases"]
    case_ids = [case["id"] for case in cases]
    normalized_questions = [case["conversation"][-1]["content"].strip().casefold() for case in cases]

    assert len(cases) == 100
    assert len(case_ids) == len(set(case_ids))
    assert len(normalized_questions) == len(set(normalized_questions))


def test_rag_benchmark_cases_have_machine_readable_expectations():
    cases = json.loads(DATASET_PATH.read_text(encoding="utf-8"))["cases"]

    for case in cases:
        question = case["conversation"][-1]["content"]
        expectation = case["retrieval"]
        assert question.strip()
        assert case["category"] in ALLOWED_CATEGORIES
        assert expectation["vehicle_type"] in ALLOWED_VEHICLE_TYPES
        assert isinstance(expectation["vehicle_ids"], list)
        assert isinstance(expectation["chunk_types"], list)
        if expectation["vehicle_ids"]:
            assert expectation["chunk_types"]
        else:
            assert case["category"] == "unanswerable"
        assert set(expectation["chunk_types"]) <= ALLOWED_CHUNK_TYPES
        assert isinstance(expectation["expected_answer"], dict) and expectation["expected_answer"]
        for vehicle_id in expectation["vehicle_ids"]:
            UUID(vehicle_id)


def test_agent_core_has_valid_unique_cases():
    cases = json.loads(AGENT_DATASET_PATH.read_text(encoding="utf-8"))["cases"]

    case_ids = [case["id"].strip() for case in cases]
    assert len(cases) >= 100
    assert len(case_ids) == len(set(case_ids))

    for case in cases:
        assert case["category"] in ALLOWED_AGENT_CATEGORIES
        assert case["kind"] == "agent"
        assert case["conversation"]
        assert case["conversation"][-1]["role"] == "user"
        assert case["agent"]
        assert case["agent"]["required_nodes"]
        assert case["split"] in {"development", "holdout"}


def test_all_rag_benchmark_queries_have_catalog_intent():
    cases = json.loads(DATASET_PATH.read_text(encoding="utf-8"))["cases"]

    not_routed = [
        case["id"]
        for case in cases
        if not classify_catalog_intent(
            case["conversation"][-1]["content"],
            has_matched_vehicle=bool(case["retrieval"]["vehicle_ids"]),
        )
    ]

    assert not_routed == []
