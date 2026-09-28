"""Small dependency-free statistical summaries for benchmark reports."""

from __future__ import annotations

import math
import random
import statistics
from collections.abc import Iterable
from typing import Any


def percentile(values: Iterable[float], quantile: float) -> float:
    ordered = sorted(float(value) for value in values)
    if not ordered:
        return 0.0
    if len(ordered) == 1:
        return ordered[0]
    position = (len(ordered) - 1) * quantile
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return ordered[lower]
    weight = position - lower
    return ordered[lower] * (1.0 - weight) + ordered[upper] * weight


def bootstrap_mean_ci(
    values: Iterable[float],
    *,
    confidence: float = 0.95,
    samples: int = 2000,
    seed: int = 101,
) -> dict[str, float]:
    observed = [float(value) for value in values]
    if not observed:
        return {"mean": 0.0, "std": 0.0, "ci_low": 0.0, "ci_high": 0.0}
    if len(observed) == 1:
        value = observed[0]
        return {"mean": value, "std": 0.0, "ci_low": value, "ci_high": value}
    rng = random.Random(seed)
    bootstrap_means = [statistics.fmean(rng.choice(observed) for _ in observed) for _ in range(samples)]
    alpha = (1.0 - confidence) / 2.0
    return {
        "mean": statistics.fmean(observed),
        "std": statistics.stdev(observed),
        "ci_low": percentile(bootstrap_means, alpha),
        "ci_high": percentile(bootstrap_means, 1.0 - alpha),
    }


def summarize_numeric(records: list[dict[str, Any]], metric: str) -> dict[str, float]:
    values = [
        float(record[metric])
        for record in records
        if isinstance(record.get(metric), (int, float)) and not isinstance(record.get(metric), bool)
    ]
    summary = bootstrap_mean_ci(values)
    summary["count"] = float(len(values))
    if metric == "latency_ms":
        summary["p50"] = percentile(values, 0.50)
        summary["p95"] = percentile(values, 0.95)
    return summary


__all__ = ["bootstrap_mean_ci", "percentile", "summarize_numeric"]
