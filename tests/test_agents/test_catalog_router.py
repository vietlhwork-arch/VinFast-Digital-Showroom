from __future__ import annotations

import pytest

from src.agents.nodes.catalog_router import (
    build_catalog_router_node,
    classify_catalog_intent,
)
from src.services.rag.retrieval.models import (
    ResolvedRetrievalScope,
    VehicleIdentity,
)


class FakeSessionContext:
    async def __aenter__(self):
        return object()

    async def __aexit__(self, exc_type, exc, traceback):
        return False


class FakeResolver:
    def __init__(self, vehicles=()):
        self.vehicles = tuple(vehicles)

    async def resolve(self, db, query, filters):
        del db, query
        return ResolvedRetrievalScope(filters=filters, vehicles=self.vehicles)


@pytest.mark.asyncio
async def test_dynamic_catalog_vehicle_routes_to_rag_and_preserves_trusted_id():
    kinet = VehicleIdentity(
        vehicle_id="95582801-f8a2-4aea-9d19-902fb996e2c9",
        vehicle_type="motorbike",
        model_name="VinFast Kinet Kèm pin",
        vehicle_line="Kinet",
        version="Kèm pin",
    )
    node = build_catalog_router_node(
        session_factory=FakeSessionContext,
        resolver=FakeResolver((kinet,)),
    )

    update = await node({"query": "Kinet dùng pin gì?"})

    assert update["use_catalog_rag"] is True
    route = update["metadata"]["catalog_route"]
    assert route["resolved_vehicle_type"] == "motorbike"
    assert route["resolved_vehicle_ids"] == [kinet.vehicle_id]


@pytest.mark.asyncio
async def test_generic_catalog_filter_routes_without_a_named_vehicle():
    node = build_catalog_router_node(
        session_factory=FakeSessionContext,
        resolver=FakeResolver(),
    )

    update = await node({"query": "Liệt kê xe máy không cần bằng lái"})

    assert update["use_catalog_rag"] is True
    assert update["metadata"]["catalog_route"]["resolved_vehicle_ids"] == []


def test_open_ended_buying_journey_stays_in_needs_discovery():
    assert classify_catalog_intent("Tôi muốn mua ô tô điện VinFast") is False
    assert classify_catalog_intent("Tôi muốn tìm xe theo ngân sách") is False


def test_explicit_fact_about_a_resolved_vehicle_uses_rag_during_a_journey():
    assert classify_catalog_intent(
        "Tôi muốn biết Kinet dùng pin gì",
        has_matched_vehicle=True,
    ) is True


@pytest.mark.asyncio
async def test_catalog_lookup_failure_keeps_safe_deterministic_fallback():
    class FailingResolver:
        async def resolve(self, db, query, filters):
            del db, query, filters
            raise RuntimeError("database unavailable")

    node = build_catalog_router_node(
        session_factory=FakeSessionContext,
        resolver=FailingResolver(),
    )
    update = await node({"query": "VinFast EBus pin bao nhiêu?"})

    assert update["use_catalog_rag"] is True
    assert (
        update["metadata"]["catalog_route"]["status"]
        == "catalog_lookup_unavailable"
    )
