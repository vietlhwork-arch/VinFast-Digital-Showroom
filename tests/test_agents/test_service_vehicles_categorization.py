import pytest
from src.services.catalog_service import (
    fetch_cars_from_supabase,
    get_dynamic_catalog_summary,
)
from src.services.rag.retrieval.models import RetrievalFilters
from src.services.rag.retrieval.vehicle_resolver import match_vehicle_identities, PostgresVehicleResolver
from src.services.database import SessionLocal

def test_fetch_service_cars_returns_four_green_models():
    cars = fetch_cars_from_supabase(category="Service")
    names = [c["name"] for c in cars]
    assert len(names) == 4
    assert "VinFast Minio Green" in names
    assert "VinFast Herio Green" in names
    assert "VinFast Nerio Green" in names
    assert "VinFast Limo Green" in names
    # Ensure EC Van and EBus are NOT in Service category
    assert not any("ec van" in n.lower() for n in names)
    assert not any("ebus" in n.lower() for n in names)

def test_catalog_summary_groups_categories():
    summary = get_dynamic_catalog_summary()
    assert "Category: Service - Dải xe Green Series gồm 4 mẫu" in summary
    assert "VinFast Minio Green" in summary
    assert "VinFast Herio Green" in summary
    assert "VinFast Nerio Green" in summary
    assert "VinFast Limo Green" in summary
    assert "Category: Commercial" in summary
    assert "EC Van" in summary
    assert "Category: Bus" in summary
    assert "EBus" in summary

@pytest.mark.asyncio
async def test_vehicle_resolver_respects_vehicle_ids():
    cars = fetch_cars_from_supabase(category="Service")
    cand_ids = tuple(str(c["id"]) for c in cars if c.get("id"))
    assert len(cand_ids) == 4

    filters = RetrievalFilters(vehicle_type="car", vehicle_ids=cand_ids)
    async with SessionLocal() as db:
        resolver = PostgresVehicleResolver()
        scope = await resolver.resolve(db, "xe dịch vụ", filters=filters)
        resolved_ids = set(v.vehicle_id for v in scope.vehicles)
        assert resolved_ids.issubset(set(cand_ids))
