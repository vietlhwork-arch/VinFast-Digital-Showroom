"""LangGraph node adapter for the catalog RAG service."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import asdict
from typing import Any

from openai import APIConnectionError, APITimeoutError, AuthenticationError, RateLimitError
from sqlalchemy.exc import SQLAlchemyError

from src.agents.state import AgentState
from src.services.database import SessionLocal
from src.services.rag.retrieval.models import RetrievalFilters
from src.services.rag_service import retrieve_catalog


def build_catalog_rag_node(
    *,
    session_factory: Callable[[], Any] = SessionLocal,
    retrieve: Callable[..., Any] = retrieve_catalog,
):
    async def catalog_rag_node(state: AgentState) -> dict[str, Any]:
        query = state.get("query", "").strip()
        if not query:
            return {"error": "CatalogRAGNode requires a non-empty query"}

        metadata = dict(state.get("metadata", {}))
        route_metadata = metadata.get("catalog_route") or {}
        resolved_vehicle_ids = tuple(
            str(vehicle_id)
            for vehicle_id in route_metadata.get("resolved_vehicle_ids") or ()
        )
        resolved_vehicle_type = route_metadata.get("resolved_vehicle_type")
        filters = (
            RetrievalFilters(
                vehicle_type=resolved_vehicle_type,
                vehicle_ids=resolved_vehicle_ids,
            )
            if resolved_vehicle_ids
            else None
        )

        def failed(error_code: str) -> dict[str, Any]:
            metadata["rag"] = {
                "status": "error",
                "error_code": error_code,
                "query_variants": [],
                "resolved_vehicles": [],
                "snippets": [],
            }
            return {
                "current_stage": "CATALOG_RAG",
                "context": "",
                "rag_error": error_code,
                "metadata": metadata,
            }

        try:
            async with session_factory() as db:
                result = await retrieve(db, query, filters=filters)
        except AuthenticationError:
            return failed("openai_authentication_failed")
        except RateLimitError:
            return failed("openai_rate_limited")
        except (APIConnectionError, APITimeoutError, TimeoutError):
            return failed("openai_unavailable")
        except SQLAlchemyError:
            return failed("database_unavailable")
        except ValueError:
            return failed("invalid_retrieval_data")
        except Exception:
            return failed("rag_retrieval_failed")

        metadata["rag"] = {
            "status": "ok",
            "selection_strategy": "mmr",
            "used_query_fusion": result.query_plan.used_fusion,
            "query_variants": list(result.query_plan.queries),
            "resolved_vehicles": [
                asdict(vehicle) for vehicle in result.resolved_vehicles
            ],
            "snippets": [asdict(snippet) for snippet in result.snippets],
        }
        return {
            "current_stage": "CATALOG_RAG",
            "context": result.context,
            "metadata": metadata,
        }

    return catalog_rag_node


catalog_rag_node = build_catalog_rag_node()


__all__ = ["build_catalog_rag_node", "catalog_rag_node"]
