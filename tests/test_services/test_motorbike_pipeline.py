import asyncio
from types import SimpleNamespace

import src.services.rag.motorbikes.pipeline as motorbike_pipeline
from src.services.rag.motorbikes.pipeline import group_motorbike_row
from src.services.rag.motorbikes.groups import build_motorbike_semantic_groups


def test_motorbike_row_is_grouped_into_five_macro_groups():
    row = {
        "motorbike_id": "00000000-0000-0000-0000-000000000001",
        "model_name": "VF Evo",
        "vehicle_line": "Standard",
        "version": "Kèm pin",
        "category": "motorbike",
        "colors": ["Black", "White"],
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
        "list_price": 24100000,
        "created_at": "must-not-appear",
        "updated_at": "must-not-appear",
        "is_active": True,
        "additional_specs": {
            "_legacy_source": {
                "specifications": {
                    "wet_weight_kg": 99,
                    "maximum_motor_power_w": 9999,
                    "additional_specs": {
                        "model_year": 2026,
                        "price_info_text": "GiĂ¡ Ä‘Ă£ gá»“m pin",
                        "description_text": "Xe mĂ¡y Ä‘iá»‡n Ä‘Ă´ thá»‹",
                        "warranty_text": "Báº£o hĂ nh 3 nÄƒm",
                        "front_tire": "90/90-14",
                        "rear_tire": "110/80-14",
                        "charging_info_text": "Charge at home",
                        "technology_features": {
                            "gps": True,
                            "unknown_key": "review-me",
                        },
                        "lighting_features": {"headlight": "LED"},
                        "created_at": "must-not-appear",
                        "images": [],
                    },
                }
            }
        },
    }

    document = group_motorbike_row(row)

    assert set(document.group_data.groups) == {
        "overview_dimensions",
        "performance_energy",
        "chassis_braking",
        "equipment_safety",
        "exterior_design",
    }
    assert document.group_data.groups["overview_dimensions"]["weight_kg"] == 86
    assert document.group_data.groups["performance_energy"]["maximum_power_w"] == 2450
    assert document.group_data.groups["chassis_braking"]["front_tire"] == "90/90-14"
    assert document.group_data.groups["equipment_safety"]["technology_features.gps"] is True
    assert document.group_data.groups["exterior_design"]["lighting_features.headlight"] == "LED"
    assert document.motorbike.fields["list_price"] == 24100000
    assert document.group_data.groups["overview_dimensions"]["list_price"] == 24100000
    assert document.group_data.groups["overview_dimensions"]["model_year"] == 2026
    assert document.group_data.groups["overview_dimensions"]["price_info_text"] == "GiĂ¡ Ä‘Ă£ gá»“m pin"
    assert document.group_data.groups["overview_dimensions"]["description_text"] == "Xe mĂ¡y Ä‘iá»‡n Ä‘Ă´ thá»‹"
    assert document.group_data.groups["overview_dimensions"]["warranty_text"] == "Báº£o hĂ nh 3 nÄƒm"
    assert "list_price" not in document.group_data.groups["performance_energy"]
    assert "technology_features.unknown_key" in document.group_data.unmapped_fields
    assert "model_year" not in document.group_data.unmapped_fields
    assert "price_info_text" not in document.group_data.unmapped_fields
    assert "description_text" not in document.group_data.unmapped_fields
    assert "warranty_text" not in document.group_data.unmapped_fields
    assert "created_at" not in document.group_data.unmapped_fields
    assert "updated_at" not in document.group_data.unmapped_fields


def test_motorbike_dry_run_keeps_source_metadata():
    row = {
        "motorbike_id": "00000000-0000-0000-0000-000000000002",
        "model_name": "VF Mini",
        "vehicle_line": None,
        "version": None,
        "category": "motorbike",
        "colors": [],
        "additional_specs": {
            "_legacy_source": {
                "specifications": {
                    "version": "Legacy line",
                    "additional_specs": {
                        "technology_features": {"display": "LED"},
                    },
                }
            }
        },
    }

    document = group_motorbike_row(row)
    dry_run_rows = document.dry_run()["fields"]

    assert document.motorbike.vehicle_line == "Legacy line"
    assert {
        "group_name": "equipment_safety",
        "field_name": "technology_features.display",
        "value": "LED",
        "source": "additional_specs",
    } in dry_run_rows


def test_motorbike_colors_are_grouped_from_catalog_column_before_chunking():
    catalog_colors = [
        {
            "name": "Xanh ngọc",
            "official_name": "Tropical Jade",
            "color_code": "tropical-jade",
            "type": "solid",
        },
        {
            "name": "Đỏ tươi",
            "official_name": None,
            "color_code": "bright-red",
            "type": "solid",
        },
    ]
    document = group_motorbike_row(
        {
            "motorbike_id": "00000000-0000-0000-0000-000000000099",
            "model_name": "VinFast Evo",
            "vehicle_line": "Evo",
            "version": "Kèm pin",
            "category": "motorbike",
            "colors": catalog_colors,
            "additional_specs": {
                # Legacy data must not override or duplicate the top-level
                # catalog column when the row already has colors.
                "colors": [{"name": "Màu cũ", "color_code": "legacy"}],
                "lighting_features": {"headlight": "LED"},
            },
        }
    )

    exterior = document.group_data.groups["exterior_design"]
    assert exterior["colors"] == catalog_colors
    assert document.group_data.field_sources["exterior_design"]["colors"] == "column"
    assert "colors" not in document.group_data.unmapped_fields

    semantic_groups = build_motorbike_semantic_groups(document.motorbike, document.group_data)
    assert semantic_groups["exterior_design"].count("colors:") == 1
    assert "tropical-jade" in semantic_groups["exterior_design"]
    assert "legacy" not in semantic_groups["exterior_design"]


def test_motorbike_index_pipeline_embeds_and_writes_only_motorbike_rows(monkeypatch):
    documents = [
        group_motorbike_row(
            {
                "motorbike_id": f"00000000-0000-0000-0000-00000000000{index}",
                "model_name": f"VF {index}",
                "vehicle_line": "Line",
                "version": "Standard",
                "category": "motorbike",
                "colors": ["Black"],
                "range_km": 100 + index,
                "motor_type": "Inhub",
                "maximum_power_w": 1000,
                "maximum_speed_kmh": 50,
                "additional_specs": {},
            }
        )
        for index in (3, 4)
    ]

    class FakeEmbedder:
        def __init__(self):
            self.inflight = 0
            self.max_inflight = 0
            self.texts = []

        async def aembed_documents(self, texts):
            self.texts.extend(texts)
            self.inflight += 1
            self.max_inflight = max(self.max_inflight, self.inflight)
            await asyncio.sleep(0)
            self.inflight -= 1
            return [[1.0, 0.0, 0.0] for _ in texts]

    class FakeDB:
        async def commit(self):
            pass

    settings = SimpleNamespace(
        embedding_model="text-embedding-3-large",
        embedding_dimensions=3,
        embedding_max_concurrency=4,
        rag_max_chunk_chars=1500,
        rag_min_chunk_chars=350,
        rag_similarity_threshold=0.74,
        rag_max_units_per_chunk=8,
    )
    written = {}
    write_options = {}

    async def fetch(*args, **kwargs):
        return documents

    async def write(db, embedded_chunks, **kwargs):
        written.update(embedded_chunks)
        write_options.update(kwargs)
        return sum(len(chunks) for chunks in embedded_chunks.values())

    monkeypatch.setattr(motorbike_pipeline, "fetch_grouped_motorbikes", fetch)
    monkeypatch.setattr(motorbike_pipeline, "replace_motorbike_vectors", write)
    monkeypatch.setattr(motorbike_pipeline, "get_settings", lambda: settings)

    embedder = FakeEmbedder()
    stats = asyncio.run(
        motorbike_pipeline.index_motorbike_catalog(
            FakeDB(),
            embedder=embedder,
            max_concurrency=2,
        )
    )

    assert stats.vehicles_processed == 2
    assert stats.chunks_indexed > 0
    assert embedder.max_inflight <= 2
    assert any("category: motorbike" in text for text in embedder.texts)
    assert write_options["full_rebuild"] is True
    assert all(chunk.vehicle_type == "motorbike" for chunks in written.values() for chunk, _ in chunks)
