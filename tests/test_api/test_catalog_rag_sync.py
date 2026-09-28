import inspect
import uuid

import pytest
from fastapi import BackgroundTasks

from src.api.cars import create_car, delete_car, update_car
from src.api.motorbikes import update_motorbike
from src.models.domain import CarCatalog, MotorbikeCatalog


def _arguments(function, **overrides):
    values = {}
    for name, parameter in inspect.signature(function).parameters.items():
        if name in overrides:
            values[name] = overrides[name]
            continue
        default = parameter.default
        if hasattr(default, "default"):
            values[name] = default.default
        elif default is not inspect.Parameter.empty:
            values[name] = default
    return values


class ScalarResult:
    def __init__(self, value=None, *, rowcount=0):
        self._value = value
        self.rowcount = rowcount

    def scalar_one_or_none(self):
        return self._value


class FakeDB:
    def __init__(self, model=None):
        self.model = model
        self.added = []
        self.deleted = []
        self.statements = []

    def add(self, model):
        self.added.append(model)

    async def execute(self, statement, params=None):
        sql = str(statement)
        self.statements.append((sql, params))
        if sql.lstrip().upper().startswith("SELECT"):
            return ScalarResult(self.model)
        return ScalarResult(rowcount=3)

    async def commit(self):
        return None

    async def refresh(self, model):
        return None

    async def delete(self, model):
        self.deleted.append(model)


@pytest.mark.asyncio
async def test_create_car_schedules_full_vehicle_indexing():
    tasks = BackgroundTasks()
    db = FakeDB()
    car = await create_car(
        **_arguments(
            create_car,
            background_tasks=tasks,
            current_user=object(),
            db=db,
            model_name="VinFast Test",
            vehicle_line="Test",
            version="Plus",
            category="Personal",
            list_price=500_000_000,
        )
    )

    assert db.added == [car]
    assert len(tasks.tasks) == 1
    assert tasks.tasks[0].kwargs == {
        "vehicle_type": "car",
        "vehicle_id": str(car.car_id),
    }


@pytest.mark.asyncio
async def test_update_car_schedules_only_the_changed_performance_group():
    car_id = uuid.UUID("00000000-0000-0000-0000-000000000301")
    car = CarCatalog(
        car_id=car_id,
        model_name="VinFast VF 8 Plus",
        vehicle_line="VF 8",
        version="Plus",
        category="Personal",
        list_price=1_200_000_000,
        range_km=457,
        additional_specs={
            "_legacy_source": {
                "catalog": {"model_name": "VinFast VF 8"},
                "specifications": {
                    "version": "Plus",
                    "range_km": 457,
                    "list_price": 1_200_000_000,
                    "seat_count": 5,
                    "motor_power_kw": 100,
                    "battery_capacity_kwh": 37.23,
                    "is_active": True,
                    "additional_specs": {},
                },
            }
        },
        is_active=True,
    )
    tasks = BackgroundTasks()
    db = FakeDB(car)
    await update_car(
        **_arguments(
            update_car,
            car_id=car_id,
            background_tasks=tasks,
            current_user=object(),
            db=db,
            range_km=500,
        )
    )

    assert len(tasks.tasks) == 1
    assert tasks.tasks[0].kwargs["chunk_types"] == ("performance_energy",)


@pytest.mark.asyncio
async def test_deactivate_motorbike_deletes_vectors_without_embedding_task():
    motorbike_id = uuid.UUID("00000000-0000-0000-0000-000000000302")
    motorbike = MotorbikeCatalog(
        motorbike_id=motorbike_id,
        model_name="VinFast Evo",
        vehicle_line="Evo",
        version="Kèm pin",
        category="motorbike",
        list_price=25_000_000,
        additional_specs={},
        is_active=True,
    )
    tasks = BackgroundTasks()
    db = FakeDB(motorbike)
    await update_motorbike(
        **_arguments(
            update_motorbike,
            motorbike_id=motorbike_id,
            background_tasks=tasks,
            current_user=object(),
            db=db,
            is_active=False,
        )
    )

    assert tasks.tasks == []
    assert any("DELETE FROM public.catalog_vectors" in sql for sql, _ in db.statements)


@pytest.mark.asyncio
async def test_delete_car_explicitly_deletes_vectors_in_the_same_request():
    car_id = uuid.UUID("00000000-0000-0000-0000-000000000303")
    car = CarCatalog(
        car_id=car_id,
        model_name="VinFast Delete Test",
        vehicle_line="Test",
        version="Base",
        category="Personal",
        list_price=1,
        additional_specs={},
        is_active=True,
    )
    db = FakeDB(car)
    await delete_car(car_id=car_id, current_user=object(), db=db)

    assert db.deleted == [car]
    assert any("DELETE FROM public.catalog_vectors" in sql for sql, _ in db.statements)
