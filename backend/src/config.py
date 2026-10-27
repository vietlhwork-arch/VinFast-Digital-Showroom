import os
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Từ backend/src/config.py, đường dẫn này trỏ đến thư mục gốc của repository
# khi chạy từ mã nguồn. Trong Docker, nó trỏ đến "/". Hãy đặt biến môi trường
# ghi đè đường dẫn trong container (ví dụ STATIC_DIR=/app/static); nếu không,
# các giá trị mặc định bên dưới có thể nằm ngoài /app và không ghi được bởi user thường.
REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
WEAK_SECRETS = {
    "change-this-development-secret",
    "change-this-development-secret-key",
    "replace-with-at-least-32-random-characters",
}


def normalize_database_url(url: str) -> str:
    """Accept provider URLs such as postgres:// and select the async driver."""
    if url.startswith("postgres://"):
        return "postgresql+asyncpg://" + url.removeprefix("postgres://")
    if url.startswith("postgresql://"):
        return "postgresql+asyncpg://" + url.removeprefix("postgresql://")
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(REPOSITORY_ROOT / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "VinFast Digital Showroom"
    app_env: Literal["development", "production", "test"] = "development"
    app_host: str = "0.0.0.0"
    app_port: int = Field(default=8000, ge=1, le=65535)
    api_prefix: str = "/api/v1"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    database_url: str = "sqlite+aiosqlite:///./vinfast.db"
    secret_key: str = "change-this-development-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=60 * 24 * 7, ge=1)

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000"

    # Các đường dẫn runtime. Docker cần cấu hình rõ các giá trị này (xem backend/Dockerfile).
    # Docker chép tệp static vào /app/static, nên cần ghi đè giá trị mặc định tại đó.
    static_dir: Path = REPOSITORY_ROOT / "static"
    seed_data_dir: Path = REPOSITORY_ROOT / "data" / "catalog"
    frontend_dist_dir: Path = REPOSITORY_ROOT / "frontend" / "dist"

    # Các tùy chọn này chỉ có tác dụng khi phần code sử dụng chúng; hãy kiểm tra
    # code khởi động/seed trước khi dựa vào giá trị ghi đè từ biến môi trường.
    seed_reference_data: bool = True
    seed_demo_accounts: bool | None = None
    max_upload_bytes: int = Field(default=8 * 1024 * 1024, ge=1024)

    @field_validator("database_url")
    @classmethod
    def _normalize_database_url(cls, value: str) -> str:
        return normalize_database_url(value)

    @property
    def effective_database_url(self) -> str:
        if os.environ.get("VERCEL") and "sqlite" in self.database_url:
            return "sqlite+aiosqlite:////tmp/vinfast.db"
        return self.database_url

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def should_seed_demo_accounts(self) -> bool:
        if self.seed_demo_accounts is not None:
            return self.seed_demo_accounts
        return self.app_env != "production"

    def validate_for_runtime(self) -> None:
        # Đảm bảo luồng khởi động ứng dụng gọi phương thức này; nếu không, các
        # kiểm tra SECRET_KEY và CORS dành cho production sẽ không được thực thi.
        if self.app_env != "production":
            return
        if len(self.secret_key) < 32 or self.secret_key in WEAK_SECRETS:
            raise RuntimeError("SECRET_KEY must be a private random value of at least 32 characters in production")
        if "*" in self.cors_origins_list:
            raise RuntimeError("CORS_ORIGINS must list explicit origins in production")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
