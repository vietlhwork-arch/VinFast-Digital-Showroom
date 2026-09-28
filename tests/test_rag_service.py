import pytest

from src.services.rag.retrieval.models import RetrievalFilters
from src.services.rag_service import retrieve_catalog


@pytest.mark.asyncio
async def test_retrieve_catalog_delegates_to_the_modular_pipeline():
    expected = object()

    class FakePipeline:
        async def retrieve(self, db, query, *, filters):
            assert db == "db"
            assert query == "VF 8 pin bao nhiêu?"
            assert filters.vehicle_type == "car"
            return expected

    result = await retrieve_catalog(
        "db",
        "VF 8 pin bao nhiêu?",
        filters=RetrievalFilters(vehicle_type="car"),
        pipeline=FakePipeline(),
    )

    assert result is expected
