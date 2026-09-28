from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

from dotenv import dotenv_values
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


def _project_openai_settings() -> dict[str, Any]:
    """Ưu tiên OPENAI_API_KEY của chính dự án hơn key cũ trong process."""
    value = dotenv_values(PROJECT_ENV_FILE).get("OPENAI_API_KEY")
    key = str(value or "").strip()
    return {"openai_api_key": key} if key else {}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=PROJECT_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        del cls, settings_cls
        return (
            init_settings,
            _project_openai_settings,
            env_settings,
            dotenv_settings,
            file_secret_settings,
        )

    # App
    app_name: str = "VinFast Digital Showroom"
    app_env: Literal["development", "production", "test"] = "development"
    app_port: int = Field(default=8000, ge=1, le=65535)
    app_host: str = "0.0.0.0"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    api_prefix: str = "/api/v1"

    # CORS
    backend_cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    cors_origins: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        import os
        env_origins = os.environ.get("CORS_ORIGINS") or os.environ.get("BACKEND_CORS_ORIGINS") or ""
        combined = f"{self.backend_cors_origins},{self.cors_origins},{env_origins}"
        return list(set(origin.strip() for origin in combined.split(",") if origin.strip()))

    # Security / JWT
    secret_key: str = "vinfast-secret-key-super-secret-123456"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # LLM
    openai_api_key: str = ""
    cohere_api_key: str = ""
    model_name: str = "gpt-4o-mini"
    llm_temperature: float = Field(default=0.7, ge=0.0, le=2.0)

    # Embeddings; dimensions phải khớp kiểu vector(1536) trong PostgreSQL.
    embedding_model: str = "text-embedding-3-large"
    embedding_dimensions: int = Field(default=1536, ge=1, le=3072)

    # Database (SQLite default for local dev)
    database_url: str = "sqlite+aiosqlite:///./vinfast.db"

    # Supabase REST API. Keep the misspelled legacy name working locally.
    supabase_url: str = ""
    supabase_key: str = Field(
        default="",
        validation_alias=AliasChoices("SUPABASE_KEY", "SUPEBASE_KEY"),
    )

    @property
    def supebase_key(self) -> str:
        return self.supabase_key

    @property
    def effective_database_url(self) -> str:
        import os
        if os.environ.get("VERCEL") and "sqlite" in self.database_url:
            return "sqlite+aiosqlite:////tmp/vinfast.db"
        return self.database_url

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Guardrails Config (Comma-separated for clean .env override)
    guardrails_greetings: str = Field(
        default="alo,chào,chao,xin chào,xin chao,hi,hello,hé lô,helo,ad ơi,admin ơi,shop ơi,tư vấn,tu van,bạn ơi,em ơi,hey,yo"
    )
    guardrails_spec_keywords: str = Field(
        default="so sánh,so sanh,công suất,cong suat,dung tích,dung tich,cốp,cop,quãng đường,quang duong,km/h,thông số,thong so,mã lực,ma luc,ngừng bán,ngung ban,dừng bán,khác nhau,khac nhau"
    )
    guardrails_offensive_keywords: str = Field(
        default="đái,ỉa,chửi,đm,vcl,clmm,đoạn chửi,dùm tao,địt,lồn,bố mày"
    )
    guardrails_out_of_scope_topics: str = Field(
        default="thời tiết,bóng đá,phở,quán phở,nấu ăn,công thức,món ăn,nhà hàng,quán ăn,tổng thống,chính trị,lịch sử,code,python,javascript,toyota,hyundai,honda,tesla,byd,nissan,ford,bmw,audi,mercedes,mazda,kia,mitsubishi"
    )
    guardrails_injection_patterns: str = Field(
        default="ignore.*instructions,forget.*instructions,forget.*rules,system.*prompt,system.*instructions,reveal.*password,reveal.*key,api.*keys,database.*password,act as dan,override safety,disregard rules,bỏ qua.*hướng dẫn,tiết lộ.*prompt,sql injection"
    )
    guardrails_max_greeting_words: int = Field(default=5, ge=1, le=20)

    @property
    def guardrails_greetings_list(self) -> list[str]:
        return [g.strip().lower() for g in self.guardrails_greetings.split(",") if g.strip()]

    @property
    def guardrails_spec_keywords_list(self) -> list[str]:
        return [k.strip().lower() for k in self.guardrails_spec_keywords.split(",") if k.strip()]

    @property
    def guardrails_offensive_keywords_list(self) -> list[str]:
        return [w.strip().lower() for w in self.guardrails_offensive_keywords.split(",") if w.strip()]

    @property
    def guardrails_out_of_scope_topics_list(self) -> list[str]:
        return [t.strip().lower() for t in self.guardrails_out_of_scope_topics.split(",") if t.strip()]

    @property
    def guardrails_injection_patterns_list(self) -> list[str]:
        return [p.strip().lower() for p in self.guardrails_injection_patterns.split(",") if p.strip()]

    # Vector Store
    chroma_persist_dir: str = "./data/chroma"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
