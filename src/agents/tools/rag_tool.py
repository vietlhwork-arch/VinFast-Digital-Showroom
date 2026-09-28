"""LangGraph / LangChain `@tool` wrapper for Catalog RAG Search."""

from langchain_core.tools import tool

from src.services.database import SessionLocal
from src.services.rag.retrieval.models import RetrievalFilters
from src.services.rag_service import retrieve_catalog


@tool
async def search_vehicle_catalog_tool(query: str, vehicle_type: str | None = None) -> str:
    """Tìm kiếm thông số kỹ thuật, trang bị, giá bán và ưu đãi của các dòng xe VinFast qua Vector RAG.

    Args:
        query: Câu hỏi hoặc từ khóa tìm kiếm (ví dụ: "VF 8 Eco dung lượng pin bao nhiêu kWh?")
        vehicle_type: Lọc theo loại xe ('CAR' hoặc 'MOTORBIKE') nếu có.

    Returns:
        Top 3 đoạn văn bản chính xác nhất trích xuất từ catalog VinFast.
    """
    normalized_type = (vehicle_type or "").strip().lower()
    if normalized_type not in {"car", "motorbike"}:
        normalized_type = None

    async with SessionLocal() as db:
        result = await retrieve_catalog(
            db,
            query,
            filters=RetrievalFilters(vehicle_type=normalized_type),
        )
        if not result.snippets:
            return "Không tìm thấy thông tin phù hợp trong danh mục xe VinFast."

        lines = [f"Tìm thấy {len(result.snippets)} kết quả cho câu hỏi: '{query}':\n"]
        for idx, snippet in enumerate(result.snippets, 1):
            lines.append(
                f"--- Chunk {idx} [{snippet.model_name}] "
                f"({snippet.chunk_type}, MMR: {snippet.rerank_score:.3f}) ---"
            )
            lines.append(snippet.text)
            lines.append("")
        return "\n".join(lines)
