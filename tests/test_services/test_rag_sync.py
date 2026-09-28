from types import SimpleNamespace

import pytest

from src.services.rag.cars.groups import CAR_GROUP_ORDER
from src.services.rag.cars.pipeline import group_car_row
from src.services.rag.common.chunking import build_semantic_chunks
from src.services.rag.motorbikes.groups import MOTORBIKE_GROUP_ORDER
from src.services.rag.sync import (
    changed_car_chunk_types,
    changed_motorbike_chunk_types,
    delete_vehicle_vectors,
    resolve_chunk_types_for_source_paths,
    snapshot_car,
    snapshot_motorbike,
)


def _car(**changes):
    values = {
        "car_id": "00000000-0000-0000-0000-000000000101",
        "model_name": "VinFast VF 8 Plus",
        "vehicle_line": "VF 8",
        "version": "Plus",
        "category": "Personal",
        "image_url": "/vf8.jpg",
        "list_price": 1_200_000_000,
        "seat_count": 5,
        "length_mm": 4750,
        "width_mm": 1934,
        "height_mm": 1667,
        "wheelbase_mm": 2950,
        "range_km": 457,
        "maximum_power_kw": 300,
        "maximum_torque_nm": 620,
        "usable_battery_capacity": 87.7,
        "additional_specs": {
            "safety_features": {"airbags": 8},
            "interior_features": {"screen": "15.6 inch"},
        },
        "is_active": True,
    }
    values.update(changes)
    return SimpleNamespace(**values)


def _motorbike(**changes):
    values = {
        "motorbike_id": "00000000-0000-0000-0000-000000000201",
        "model_name": "VinFast Evo Grand Kèm pin",
        "vehicle_line": "Evo Grand",
        "version": "Kèm pin",
        "category": "motorbike",
        "image_url": "/evo.jpg",
        "colors": ["Black"],
        "list_price": 25_000_000,
        "range_km": 165,
        "charging_time_minutes": 270,
        "battery_type": "LFP",
        "battery_quantity": 1,
        "battery_capacity_kwh": 1.5,
        "motor_type": "Inhub",
        "maximum_power_w": 2450,
        "maximum_speed_kmh": 70,
        "weight_kg": 86,
        "length_mm": 1856,
        "width_mm": 683,
        "height_mm": 1133,
        "front_brake": "Disc",
        "rear_brake": "Drum",
        "front_suspension": "Telescopic",
        "rear_suspension": "Dual shock",
        "additional_specs": {},
        "is_active": True,
    }
    values.update(changes)
    return SimpleNamespace(**values)


def test_car_update_reindexes_only_the_changed_direct_field_group():
    before = snapshot_car(_car())
    after = snapshot_car(_car(range_km=500))

    assert changed_car_chunk_types(before, after) == ("performance_energy",)


def test_car_color_update_reindexes_only_the_exterior_group():
    before = snapshot_car(_car(colors=[{"name": "Trắng"}]))
    after = snapshot_car(_car(colors=[{"name": "Trắng"}, {"name": "Đỏ"}]))

    assert changed_car_chunk_types(before, after) == ("exterior",)


def test_car_json_update_reindexes_only_the_changed_semantic_group():
    before = snapshot_car(_car())
    after = snapshot_car(
        _car(
            additional_specs={
                "safety_features": {"airbags": 10},
                "interior_features": {"screen": "15.6 inch"},
            }
        )
    )

    assert changed_car_chunk_types(before, after) == ("chassis_safety",)


def test_identity_update_reindexes_every_car_group_but_image_does_not():
    original = snapshot_car(_car())
    version_changed = snapshot_car(_car(version="Eco"))
    image_changed = snapshot_car(_car(image_url="/new-vf8.jpg"))

    assert changed_car_chunk_types(original, version_changed) == CAR_GROUP_ORDER
    assert changed_car_chunk_types(original, image_changed) == ()


def test_inactive_vehicle_requests_no_reindex_groups():
    assert (
        changed_car_chunk_types(
            snapshot_car(_car()),
            snapshot_car(_car(is_active=False)),
        )
        == ()
    )


def test_motorbike_price_update_reindexes_only_overview():
    before = snapshot_motorbike(_motorbike())
    after = snapshot_motorbike(_motorbike(list_price=27_000_000))

    assert changed_motorbike_chunk_types(before, after) == ("overview_dimensions",)
    assert len(MOTORBIKE_GROUP_ORDER) == 5


def test_motorbike_category_update_reindexes_every_group():
    before = snapshot_motorbike(_motorbike(category="Scooter"))
    after = snapshot_motorbike(_motorbike(category="eBike"))

    assert changed_motorbike_chunk_types(before, after) == MOTORBIKE_GROUP_ORDER


def test_chunks_preserve_source_paths_from_the_prechunk_group():
    row = vars(_car()) | {
        "length": 4750,
        "width": 1934,
        "height": 1667,
        "wheelbase": 2950,
        "usable_battery_capacity_kwh": 87.7,
    }
    document = group_car_row(row)
    chunks = build_semantic_chunks(
        vehicle_id=document.car.car_id,
        vehicle_type="car",
        model_name=document.car.model_name,
        vehicle_line=document.car.vehicle_line,
        identity_metadata={"version": document.car.version},
        semantic_groups=document.semantic_groups,
        group_source_paths=document.group_source_paths,
    )

    performance = next(chunk for chunk in chunks if chunk.chunk_type == "performance_energy")
    safety = next(chunk for chunk in chunks if chunk.chunk_type == "chassis_safety")
    assert "range_km" in performance.source_paths
    assert "version" in performance.source_paths
    assert "additional_specs.safety_features.airbags" in safety.source_paths


@pytest.mark.asyncio
async def test_delete_vectors_targets_the_vehicle_id_without_similarity_search():
    class Result:
        rowcount = 3

    class FakeDB:
        def __init__(self):
            self.params = None
            self.sql = ""

        async def execute(self, statement, params):
            self.sql = str(statement)
            self.params = params
            return Result()

    db = FakeDB()
    deleted = await delete_vehicle_vectors(
        db,
        vehicle_type="car",
        vehicle_id="00000000-0000-0000-0000-000000000101",
    )

    assert deleted == 3
    assert "car_id" in db.sql
    assert db.params["vehicle_id"].endswith("0101")


@pytest.mark.asyncio
async def test_source_path_resolves_directly_to_its_chunk_type():
    class Result:
        def all(self):
            return [("performance_energy",)]

    class FakeDB:
        async def execute(self, statement, params):
            assert "source_paths &&" in str(statement)
            assert params["source_paths"] == ["range_km"]
            return Result()

    groups = await resolve_chunk_types_for_source_paths(
        FakeDB(),
        vehicle_type="car",
        vehicle_id="00000000-0000-0000-0000-000000000101",
        source_paths=("range_km",),
    )

    assert groups == ("performance_energy",)
