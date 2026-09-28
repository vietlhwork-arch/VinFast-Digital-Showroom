"""Typed benchmark contracts.

The contracts deliberately separate retrieval evidence, Agent behavior, and
answer quality. A case is not considered expert-reviewed merely because it can
be parsed or executed.
"""

from __future__ import annotations

from datetime import UTC, date, datetime
from enum import StrEnum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ReviewStatus(StrEnum):
    DRAFT = "draft"
    NEEDS_REVIEW = "needs_review"
    EXPERT_REVIEWED = "expert_reviewed"


class Difficulty(StrEnum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    ADVERSARIAL = "adversarial"


class DatasetSplit(StrEnum):
    DEVELOPMENT = "development"
    HOLDOUT = "holdout"


class DialogueTurn(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(min_length=1)


class RetrievalExpectation(BaseModel):
    vehicle_type: Literal["car", "motorbike"] | None = None
    vehicle_ids: list[str] = Field(default_factory=list)
    chunk_types: list[str] = Field(default_factory=list)
    relevant_vector_ids: list[str] = Field(default_factory=list)
    expected_answer: dict[str, Any] = Field(default_factory=dict)
    must_abstain: bool = False


class ToolExpectation(BaseModel):
    name: str = Field(min_length=1)
    required: bool = True
    arguments_subset: dict[str, Any] = Field(default_factory=dict)


class AgentExpectation(BaseModel):
    intent_any_of: list[str] = Field(default_factory=list)
    action_any_of: list[str] = Field(default_factory=list)
    blocked: bool | None = None
    use_rag: bool | None = None
    use_sql: bool | None = None
    action_payload_type: str | None = None
    required_nodes: list[str] = Field(default_factory=list)
    forbidden_nodes: list[str] = Field(default_factory=list)
    tool_calls: list[ToolExpectation] = Field(default_factory=list)
    required_terms: list[str] = Field(default_factory=list)
    prohibited_terms: list[str] = Field(default_factory=list)
    reference_answer: str | None = None
    expected_facts: dict[str, Any] = Field(default_factory=dict)
    must_abstain: bool = False


class BenchmarkCase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    kind: Literal["retrieval", "agent"]
    category: str = Field(min_length=1)
    difficulty: Difficulty
    split: DatasetSplit = DatasetSplit.DEVELOPMENT
    tags: list[str] = Field(default_factory=list)
    conversation: list[DialogueTurn] = Field(min_length=1)
    retrieval: RetrievalExpectation | None = None
    agent: AgentExpectation | None = None
    review_status: ReviewStatus = ReviewStatus.DRAFT
    created_by: str = "migration"
    created_at: date = Field(default_factory=date.today)
    reviewed_by: list[str] = Field(default_factory=list)
    review_notes: str | None = None

    @model_validator(mode="after")
    def validate_expectations(self) -> BenchmarkCase:
        if self.kind == "retrieval" and self.retrieval is None:
            raise ValueError("retrieval cases require retrieval expectations")
        if self.kind == "agent" and self.agent is None:
            raise ValueError("agent cases require agent expectations")
        if self.review_status == ReviewStatus.EXPERT_REVIEWED and len(set(self.reviewed_by)) < 2:
            raise ValueError("expert-reviewed cases require at least two independent reviewers")
        if self.conversation[-1].role != "user":
            raise ValueError("the last conversation turn must be a user turn")
        return self

    @property
    def question(self) -> str:
        return self.conversation[-1].content


class DatasetMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: Literal[2] = 2
    dataset_version: str = Field(default="1.0.0", min_length=1)
    name: str = Field(min_length=1)
    description: str = Field(min_length=1)
    domain: str = "vinfast_vehicle_advisor"
    language: str = "vi"
    catalog_snapshot: str | None = None
    source: list[str] = Field(default_factory=list)
    review_status: ReviewStatus = ReviewStatus.DRAFT
    reviewers: list[str] = Field(default_factory=list)
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class BenchmarkDataset(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metadata: DatasetMetadata
    cases: list[BenchmarkCase] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_dataset(self) -> BenchmarkDataset:
        ids = [case.id for case in self.cases]
        if len(ids) != len(set(ids)):
            raise ValueError("benchmark case IDs must be unique")
        if self.metadata.review_status == ReviewStatus.EXPERT_REVIEWED:
            if len(set(self.metadata.reviewers)) < 2:
                raise ValueError("an expert-reviewed dataset requires at least two independent reviewers")
            unreviewed = [case.id for case in self.cases if case.review_status != ReviewStatus.EXPERT_REVIEWED]
            if unreviewed:
                raise ValueError("expert-reviewed dataset contains unreviewed cases: " + ", ".join(unreviewed[:5]))
        return self

    @property
    def is_expert_reviewed(self) -> bool:
        return self.metadata.review_status == ReviewStatus.EXPERT_REVIEWED


class TrajectoryStep(BaseModel):
    node: str
    output_keys: list[str] = Field(default_factory=list)
    status: Literal["ok", "error"] = "ok"
    error: str | None = None


class JudgeScores(BaseModel):
    correctness: float = Field(ge=0.0, le=1.0)
    faithfulness: float = Field(ge=0.0, le=1.0)
    relevance: float = Field(ge=0.0, le=1.0)
    completeness: float = Field(ge=0.0, le=1.0)
    coherence: float = Field(ge=0.0, le=1.0)
    safety: float = Field(ge=0.0, le=1.0)
    abstention: float = Field(ge=0.0, le=1.0)
    passed: bool
    rationale: str = Field(min_length=1, max_length=1200)


__all__ = [
    "AgentExpectation",
    "BenchmarkCase",
    "BenchmarkDataset",
    "DatasetMetadata",
    "DatasetSplit",
    "DialogueTurn",
    "Difficulty",
    "JudgeScores",
    "RetrievalExpectation",
    "ReviewStatus",
    "ToolExpectation",
    "TrajectoryStep",
]
