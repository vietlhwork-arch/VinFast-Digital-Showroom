import pytest

from src.services.rag.common.chunking import (
    ChunkingConfig,
    build_semantic_chunks_with_embeddings,
)
from src.services.rag_chunker import build_semantic_chunks


class FakeEmbedder:
    async def aembed_documents(self, texts):
        return [[1.0, 0.0] if index < 4 else [0.0, 1.0] for index, _ in enumerate(texts)]


def test_chunks_keep_vehicle_and_semantic_group_identity():
    chunks = build_semantic_chunks(
        car_id="car-1",
        model_name="VF8 Plus",
        vehicle_line="VF8",
        identity_metadata={"version": "Plus", "category": "Personal"},
        semantic_groups={
            "overview_dimensions": "Số ghế: 5\nChiều dài: 4750 mm",
            "performance_energy": "Quãng đường: 457 km",
        },
    )

    assert [chunk.chunk_type for chunk in chunks] == [
        "overview_dimensions",
        "performance_energy",
    ]
    assert all("model_name: VF8 Plus" in chunk.chunk_text for chunk in chunks)
    assert all("vehicle_line: VF8" in chunk.chunk_text for chunk in chunks)
    assert all("semantic_group:" in chunk.chunk_text for chunk in chunks)
    assert all("version: Plus" in chunk.chunk_text for chunk in chunks)
    assert all("category: Personal" in chunk.chunk_text for chunk in chunks)


def test_long_group_is_split_without_mixing_groups():
    chunks = build_semantic_chunks(
        car_id="car-1",
        model_name="VF8 Plus",
        vehicle_line="VF8",
        semantic_groups={
            "performance_energy": "\n".join(f"Thông số {index}: giá trị của hệ truyền động" for index in range(8)),
            "exterior": "Màu sơn: Đen",
        },
        max_chars=260,
    )

    performance = [chunk for chunk in chunks if chunk.chunk_type == "performance_energy"]
    exterior = [chunk for chunk in chunks if chunk.chunk_type == "exterior"]

    assert len(performance) > 1
    assert [chunk.chunk_index for chunk in performance] == list(range(len(performance)))
    assert len(exterior) == 1
    assert all("semantic_group: exterior" not in chunk.chunk_text for chunk in performance)


def test_chunk_hash_is_deterministic_and_empty_groups_are_skipped():
    kwargs = {
        "car_id": "car-1",
        "model_name": "VF8 Plus",
        "vehicle_line": "VF8",
        "semantic_groups": {
            "overview_dimensions": "Số ghế: 5",
            "adas_parking": "",
        },
    }

    first = build_semantic_chunks(**kwargs)
    second = build_semantic_chunks(**kwargs)

    assert len(first) == 1
    assert first[0] == second[0]


@pytest.mark.asyncio
async def test_semantic_similarity_creates_boundary_inside_one_group():
    chunks = await build_semantic_chunks_with_embeddings(
        embedder=FakeEmbedder(),
        car_id="car-1",
        model_name="VF8 Plus",
        vehicle_line="VF8",
        semantic_groups={
            "performance_energy": "\n".join(f"Thông số nhóm {index}: giá trị kỹ thuật" for index in range(8))
        },
        config=ChunkingConfig(
            max_chars=300,
            min_chunk_chars=50,
            similarity_threshold=0.8,
            max_units_per_chunk=8,
        ),
    )

    assert len(chunks) == 2
    assert [chunk.chunk_index for chunk in chunks] == [0, 1]
    assert all(chunk.chunk_type == "performance_energy" for chunk in chunks)
