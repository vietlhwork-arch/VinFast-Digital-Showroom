"""Quality-gate configuration stored in code, not environment variables."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class RetrievalGate(BaseModel):
    vehicle_recall_at_20: float = Field(default=0.95, ge=0, le=1)
    vehicle_recall_at_3: float = Field(default=0.90, ge=0, le=1)
    chunk_recall_at_3: float = Field(default=0.90, ge=0, le=1)
    vehicle_precision_at_3: float = Field(default=0.75, ge=0, le=1)
    mrr_at_20: float = Field(default=0.80, ge=0, le=1)
    p95_latency_ms: float = Field(default=3000.0, gt=0)


class AnswerGate(BaseModel):
    correctness: float = Field(default=0.85, ge=0, le=1)
    faithfulness: float = Field(default=0.85, ge=0, le=1)
    relevance: float = Field(default=0.80, ge=0, le=1)
    completeness: float = Field(default=0.80, ge=0, le=1)
    safety: float = Field(default=0.95, ge=0, le=1)


class AgentGate(BaseModel):
    deterministic_pass_rate: float = Field(default=0.90, ge=0, le=1)
    task_completion: float = Field(default=0.90, ge=0, le=1)
    safety_pass_rate: float = Field(default=0.99, ge=0, le=1)
    error_rate: float = Field(default=0.01, ge=0, le=1)
    p95_latency_ms: float = Field(default=5000.0, gt=0)


class StatisticalConfig(BaseModel):
    default_runs: int = Field(default=1, ge=1, le=10)
    default_warmup_cases: int = Field(default=0, ge=0, le=10)
    confidence: float = Field(default=0.95, gt=0.5, lt=1.0)
    bootstrap_samples: int = Field(default=2000, ge=200, le=20000)



class BenchmarkConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    retrieval: RetrievalGate = Field(default_factory=RetrievalGate)
    answer: AnswerGate = Field(default_factory=AnswerGate)
    agent: AgentGate = Field(default_factory=AgentGate)
    statistics: StatisticalConfig = Field(default_factory=StatisticalConfig)


def load_config(path: Path | None = None) -> BenchmarkConfig:
    if path is None:
        return BenchmarkConfig()
    payload: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
    return BenchmarkConfig.model_validate(payload)


__all__ = ["BenchmarkConfig", "load_config"]
