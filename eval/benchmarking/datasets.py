"""Load, validate, hash, and certify benchmark datasets."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from eval.benchmarking.models import BenchmarkDataset


class DatasetNotReviewedError(RuntimeError):
    pass


def load_dataset(path: Path, *, allow_draft: bool = False) -> BenchmarkDataset:
    dataset = BenchmarkDataset.model_validate_json(path.read_text(encoding="utf-8"))
    if not allow_draft and not dataset.is_expert_reviewed:
        raise DatasetNotReviewedError(
            f"{path} is '{dataset.metadata.review_status.value}', not expert_reviewed. "
            "Complete domain review or pass --allow-draft for a non-certified development run."
        )
    return dataset


def dataset_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def dataset_inventory(dataset: BenchmarkDataset) -> dict[str, object]:
    categories: dict[str, int] = {}
    difficulties: dict[str, int] = {}
    splits: dict[str, int] = {}
    tags: dict[str, int] = {}
    reviewed = 0
    for case in dataset.cases:
        categories[case.category] = categories.get(case.category, 0) + 1
        difficulty = case.difficulty.value
        difficulties[difficulty] = difficulties.get(difficulty, 0) + 1
        split = case.split.value
        splits[split] = splits.get(split, 0) + 1
        for tag in set(case.tags):
            tags[tag] = tags.get(tag, 0) + 1
        reviewed += case.review_status.value == "expert_reviewed"
    return {
        "total_cases": len(dataset.cases),
        "categories": dict(sorted(categories.items())),
        "difficulties": dict(sorted(difficulties.items())),
        "splits": dict(sorted(splits.items())),
        "tags": dict(sorted(tags.items())),
        "expert_reviewed_cases": reviewed,
        "review_coverage": reviewed / len(dataset.cases),
    }


def write_dataset(dataset: BenchmarkDataset, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(dataset.model_dump(mode="json"), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


__all__ = [
    "DatasetNotReviewedError",
    "dataset_inventory",
    "dataset_sha256",
    "load_dataset",
    "write_dataset",
]
