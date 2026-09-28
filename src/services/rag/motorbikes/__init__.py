"""Motorbike catalog normalization and macro-grouping pipeline."""

from src.services.rag.motorbikes.pipeline import (
    MotorbikeGroupedDocument,
    MotorbikeIndexStats,
    dry_run_motorbike,
    fetch_grouped_motorbikes,
    group_motorbike_row,
    index_motorbike_catalog,
)

__all__ = [
    "MotorbikeGroupedDocument",
    "MotorbikeIndexStats",
    "dry_run_motorbike",
    "fetch_grouped_motorbikes",
    "group_motorbike_row",
    "index_motorbike_catalog",
]
