"""Export and apply a two-expert review sheet for benchmark datasets."""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from eval.benchmarking.datasets import load_dataset, write_dataset  # noqa: E402
from eval.benchmarking.models import ReviewStatus  # noqa: E402

FIELDS = (
    "case_id",
    "split",
    "category",
    "difficulty",
    "question",
    "expectation_json",
    "reviewer_1",
    "decision_1",
    "notes_1",
    "reviewer_2",
    "decision_2",
    "notes_2",
)
VALID_DECISIONS = {"approve", "reject"}


def export_sheet(dataset_path: Path, output_path: Path) -> None:
    dataset = load_dataset(dataset_path, allow_draft=True)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=FIELDS)
        writer.writeheader()
        for case in dataset.cases:
            expectation = case.retrieval or case.agent
            writer.writerow(
                {
                    "case_id": case.id,
                    "split": case.split.value,
                    "category": case.category,
                    "difficulty": case.difficulty.value,
                    "question": case.question,
                    "expectation_json": json.dumps(
                        expectation.model_dump(mode="json") if expectation else {},
                        ensure_ascii=False,
                        sort_keys=True,
                    ),
                    "reviewer_1": "",
                    "decision_1": "",
                    "notes_1": "",
                    "reviewer_2": "",
                    "decision_2": "",
                    "notes_2": "",
                }
            )


def apply_sheet(dataset_path: Path, review_path: Path, output_path: Path) -> None:
    dataset = load_dataset(dataset_path, allow_draft=True)
    with review_path.open(encoding="utf-8-sig", newline="") as stream:
        rows = {row["case_id"].strip(): row for row in csv.DictReader(stream)}

    expected_ids = {case.id for case in dataset.cases}
    if set(rows) != expected_ids:
        missing = sorted(expected_ids - set(rows))
        extra = sorted(set(rows) - expected_ids)
        raise ValueError(f"review sheet IDs do not match dataset; missing={missing[:5]}, extra={extra[:5]}")

    all_reviewers: set[str] = set()
    for case in dataset.cases:
        row = rows[case.id]
        reviewers = [row["reviewer_1"].strip(), row["reviewer_2"].strip()]
        decisions = [row["decision_1"].strip().casefold(), row["decision_2"].strip().casefold()]
        approved = decisions == ["approve", "approve"]
        if approved and len(set(reviewers)) == 2 and all(reviewers):
            case.reviewed_by = reviewers
            case.review_status = ReviewStatus.EXPERT_REVIEWED
            all_reviewers.update(reviewers)
            notes = [row["notes_1"].strip(), row["notes_2"].strip()]
            case.review_notes = " | ".join(note for note in notes if note) or "Approved by two experts."
        else:
            case.review_status = ReviewStatus.NEEDS_REVIEW
            case.reviewed_by = []

    if all(case.review_status == ReviewStatus.EXPERT_REVIEWED for case in dataset.cases):
        dataset.metadata.review_status = ReviewStatus.EXPERT_REVIEWED
        dataset.metadata.reviewers = sorted(all_reviewers)
    else:
        dataset.metadata.review_status = ReviewStatus.NEEDS_REVIEW
        dataset.metadata.reviewers = sorted(all_reviewers)
    write_dataset(dataset, output_path)


def review_agreement(review_path: Path) -> dict[str, float | int]:
    with review_path.open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    decisions = [(row["decision_1"].strip().casefold(), row["decision_2"].strip().casefold()) for row in rows]
    complete = [pair for pair in decisions if pair[0] in VALID_DECISIONS and pair[1] in VALID_DECISIONS]
    if not complete:
        return {"total_cases": len(rows), "reviewed_cases": 0, "coverage": 0.0, "raw_agreement": 0.0, "kappa": 0.0}
    observed = sum(left == right for left, right in complete) / len(complete)
    left_approve = sum(left == "approve" for left, _ in complete) / len(complete)
    right_approve = sum(right == "approve" for _, right in complete) / len(complete)
    expected = left_approve * right_approve + (1 - left_approve) * (1 - right_approve)
    kappa = (observed - expected) / (1 - expected) if expected < 1 else 1.0
    return {
        "total_cases": len(rows),
        "reviewed_cases": len(complete),
        "coverage": len(complete) / len(rows) if rows else 0.0,
        "raw_agreement": observed,
        "kappa": kappa,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    export = subparsers.add_parser("export")
    export.add_argument("--dataset", type=Path, required=True)
    export.add_argument("--output", type=Path, required=True)
    apply = subparsers.add_parser("apply")
    apply.add_argument("--dataset", type=Path, required=True)
    apply.add_argument("--review", type=Path, required=True)
    apply.add_argument("--output", type=Path, required=True)
    audit = subparsers.add_parser("audit")
    audit.add_argument("--review", type=Path, required=True)
    args = parser.parse_args()
    if args.command == "export":
        export_sheet(args.dataset, args.output)
    elif args.command == "apply":
        apply_sheet(args.dataset, args.review, args.output)
    else:
        result = review_agreement(args.review)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        if result["coverage"] < 1.0 or result["kappa"] < 0.6:
            raise SystemExit(2)


if __name__ == "__main__":
    main()
