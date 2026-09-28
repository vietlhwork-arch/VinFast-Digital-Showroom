import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import dotenv_values

# Local AI configuration is authoritative for this project. This prevents an
# obsolete key inherited by the terminal/IDE from overriding D:\P-101\.env.
_PROJECT_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
_PROJECT_ENV = dotenv_values(_PROJECT_ENV_FILE)
_RUNNING_TESTS = "pytest" in sys.modules or bool(os.environ.get("PYTEST_CURRENT_TEST"))
for _name in (
    "OPENAI_API_KEY",
    "EMBEDDING_MODEL",
    "EMBEDDING_DIMENSIONS",
    "LANGSMITH_API_KEY",
    "LANGSMITH_TRACING",
    "LANGSMITH_PROJECT",
    # Legacy aliases are retained for existing local .env files.
    "LANGCHAIN_API_KEY",
    "LANGCHAIN_TRACING_V2",
    "LANGCHAIN_PROJECT",
):
    _value = str(_PROJECT_ENV.get(_name) or "").strip()
    if _value:
        os.environ[_name] = _value
_langsmith_key = str(os.environ.get("LANGSMITH_API_KEY") or os.environ.get("LANGCHAIN_API_KEY") or "").strip()
if _RUNNING_TESTS or not _langsmith_key or _langsmith_key.startswith("your-") or _langsmith_key.startswith("sk-your"):
    os.environ["LANGSMITH_TRACING"] = "false"
    os.environ["LANGCHAIN_TRACING_V2"] = "false"

try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.routes import router
from src.config import get_settings
from src.models.domain import Base
from src.services.database import engine, get_db

settings = get_settings()

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = "/tmp/static" if os.environ.get("VERCEL") else os.path.join(PROJECT_ROOT, "static")
DATA_DIR = "/tmp/data" if os.environ.get("VERCEL") else os.path.join(PROJECT_ROOT, "data")
try:
    os.makedirs(STATIC_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
except Exception:
    pass




async def seed_default_users():
    try:
        from sqlalchemy import select

        from src.models.domain import User
        from src.services.database import SessionLocal
        from src.services.security import hash_password

        async with SessionLocal() as db:
            default_users = [
                {
                    "email": "admin@vinfast.vn",
                    "phone": "0900000001",
                    "hashed_password": hash_password("admin123"),
                    "full_name": "Quản trị viên VinFast",
                    "role": "admin",
                    "is_active": True,
                },
                {
                    "email": "staff@vinfast.vn",
                    "phone": "0900000002",
                    "hashed_password": hash_password("staff123"),
                    "full_name": "Tư vấn viên VinFast",
                    "role": "consultant",
                    "is_active": True,
                },
                {
                    "email": "customer@gmail.com",
                    "phone": "0900000003",
                    "hashed_password": hash_password("123456"),
                    "full_name": "Khách hàng Demo",
                    "role": "customer",
                    "is_active": True,
                },
            ]
            for user_data in default_users:
                stmt = select(User).where(User.email == user_data["email"])
                res = await db.execute(stmt)
                existing = res.scalar_one_or_none()
                if not existing:
                    new_user = User(**user_data)
                    db.add(new_user)
                    print(f"✅ Seeded user {user_data['email']} ({user_data['role']})")
                else:
                    existing.role = user_data["role"]
                    existing.hashed_password = user_data["hashed_password"]
                    existing.is_active = True
                    print(f"🔄 Enforced role '{user_data['role']}' for {user_data['email']}")
            await db.commit()
    except Exception as e:
        print(f"User seed notice: {e}")


def ensure_static_public_assets():
    """Ensure static upload images and VINpng assets are synced into frontend/public/VINpng for Vite & Vercel builds."""
    if os.environ.get("VERCEL"):
        return
    import shutil

    try:
        frontend_public = os.path.join(PROJECT_ROOT, "frontend", "public")
        os.makedirs(frontend_public, exist_ok=True)

        # 1. Sync static/uploads <-> frontend/public/static/uploads
        static_uploads = os.path.join(PROJECT_ROOT, "static", "uploads")
        target_uploads = os.path.join(frontend_public, "static", "uploads")
        os.makedirs(static_uploads, exist_ok=True)
        os.makedirs(target_uploads, exist_ok=True)

        if os.path.exists(target_uploads):
            shutil.copytree(target_uploads, static_uploads, dirs_exist_ok=True)
        if os.path.exists(static_uploads):
            shutil.copytree(static_uploads, target_uploads, dirs_exist_ok=True)
            print("✅ Synced static/uploads <-> frontend/public/static/uploads")

        # 2. Consolidate into frontend/public/VINpng (without space)
        vin_png_space = os.path.join(frontend_public, "VIN png")
        vin_png_nospace = os.path.join(frontend_public, "VINpng")
        root_vinpng = os.path.join(PROJECT_ROOT, "frontend", "VINpng")

        # Copy root frontend/VINpng if exists, then delete duplicate root folder
        if os.path.exists(root_vinpng):
            shutil.copytree(root_vinpng, vin_png_nospace, dirs_exist_ok=True)
            try:
                shutil.rmtree(root_vinpng)
                print("🗑️ Removed duplicate root 'frontend/VINpng' folder")
            except Exception as re:
                print(f"Notice deleting root VINpng: {re}")
            print("✅ Consolidated root 'VINpng' -> 'frontend/public/VINpng'")

        # Copy old VIN png if exists, then remove it
        if os.path.exists(vin_png_space):
            shutil.copytree(vin_png_space, vin_png_nospace, dirs_exist_ok=True)
            try:
                shutil.rmtree(vin_png_space)
                print("🗑️ Removed legacy 'VIN png' folder")
            except Exception as re:
                print(f"Notice deleting VIN png: {re}")
            print("✅ Consolidated 'VIN png' -> 'frontend/public/VINpng'")
    except Exception as e:
        print(f"Asset sync notice: {e}")


def setup_vercel_db():
    """Copy seed database with all cars, escooters & specs to /tmp/vinfast.db when running on Vercel."""
    if os.environ.get("VERCEL"):
        tmp_db_path = "/tmp/vinfast.db"
        root_db_path = os.path.join(PROJECT_ROOT, "data", "vinfast.db")
        root_db_path_alt = os.path.join(PROJECT_ROOT, "vinfast.db")

        import shutil
        if not os.path.exists(tmp_db_path) or os.path.getsize(tmp_db_path) < 10000:
            if os.path.exists(root_db_path):
                shutil.copy2(root_db_path, tmp_db_path)
                print(f"✅ Copied seed DB from {root_db_path} to {tmp_db_path}")
            elif os.path.exists(root_db_path_alt):
                shutil.copy2(root_db_path_alt, tmp_db_path)
                print(f"✅ Copied seed DB from {root_db_path_alt} to {tmp_db_path}")


async def normalize_lac_hong_smart_features():
    """Remove armored-only smart features from non-armored 900 LX rows.

    This keeps older bundled/seed databases compatible with the current
    catalog migration, including the SQLite database used by serverless
    deployments.
    """
    from copy import deepcopy

    from sqlalchemy import select

    from src.models.domain import CarCatalog
    from src.services.database import SessionLocal

    try:
        async with SessionLocal() as db:
            result = await db.execute(
                select(CarCatalog).where(CarCatalog.model_name == "VinFast Lạc Hồng 900 LX")
            )
            changed = 0
            for car in result.scalars().all():
                version = str(car.version or "").strip().casefold()
                if "chống đạn" in version:
                    continue

                specs = deepcopy(car.additional_specs or {})
                smart = specs.get("smart_features")
                if not isinstance(smart, dict) or not isinstance(smart.get("items"), list):
                    continue

                filtered = [
                    item for item in smart["items"]
                    if not isinstance(item, dict)
                    or item.get("key") not in {"run_flat", "armored_protection"}
                ]
                if len(filtered) == len(smart["items"]):
                    continue

                smart["items"] = filtered
                specs["smart_features"] = smart
                car.additional_specs = specs
                changed += 1

            if changed:
                await db.commit()
                print(f"✅ Normalized smart_features for {changed} non-armored Lạc Hồng 900 LX row(s)")
    except Exception as exc:
        print(f"Lạc Hồng smart_features normalization notice: {exc}")


async def apply_database_foreign_keys(conn):
    if conn.dialect.name == "postgresql":
        fk_statements = [
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'chat_summaries'
                ) THEN
                    ALTER TABLE public.chat_summaries
                        ALTER COLUMN user_id DROP NOT NULL,
                        ADD COLUMN IF NOT EXISTS session_id TEXT,
                        ADD COLUMN IF NOT EXISTS summarized_through TIMESTAMPTZ;

                    ALTER TABLE public.chat_summaries
                        DROP CONSTRAINT IF EXISTS ck_chat_summaries_owner;
                    ALTER TABLE public.chat_summaries
                        ADD CONSTRAINT ck_chat_summaries_owner
                        CHECK (
                            user_id IS NOT NULL
                            OR NULLIF(TRIM(session_id), '') IS NOT NULL
                        );

                    CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_summaries_user
                        ON public.chat_summaries(user_id)
                        WHERE user_id IS NOT NULL;
                    CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_summaries_guest_session
                        ON public.chat_summaries(session_id)
                        WHERE user_id IS NULL;
                END IF;
            END $$;
            """,
            """
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_history') AND
                   EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') THEN
                    ALTER TABLE chat_history
                        DROP CONSTRAINT IF EXISTS fk_chat_history_user,
                        ADD CONSTRAINT fk_chat_history_user
                        FOREIGN KEY (user_id) REFERENCES accounts(user_id) ON DELETE CASCADE;
                END IF;
            END $$;
            """,
            """
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_summaries') AND
                   EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') THEN
                    ALTER TABLE chat_summaries
                        DROP CONSTRAINT IF EXISTS fk_chat_summaries_user,
                        ADD CONSTRAINT fk_chat_summaries_user
                        FOREIGN KEY (user_id) REFERENCES accounts(user_id) ON DELETE CASCADE;
                END IF;
            END $$;
            """,
            """
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'long_term_memory') AND
                   EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') THEN
                    ALTER TABLE long_term_memory
                        DROP CONSTRAINT IF EXISTS fk_long_term_memory_user,
                        ADD CONSTRAINT fk_long_term_memory_user
                        FOREIGN KEY (user_id) REFERENCES accounts(user_id) ON DELETE CASCADE;

                    ALTER TABLE long_term_memory
                        DROP CONSTRAINT IF EXISTS fk_long_term_memory_message,
                        ADD CONSTRAINT fk_long_term_message
                        FOREIGN KEY (source_message_id) REFERENCES chat_history(message_id) ON DELETE SET NULL;
                END IF;
            END $$;
            """,
            """
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalog_vectors') THEN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'car_catalog') THEN
                        ALTER TABLE catalog_vectors
                            DROP CONSTRAINT IF EXISTS fk_catalog_vectors_car,
                            ADD CONSTRAINT fk_catalog_vectors_car
                            FOREIGN KEY (car_id) REFERENCES car_catalog(car_id) ON DELETE CASCADE;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'motorbike_catalog') THEN
                        ALTER TABLE catalog_vectors
                            DROP CONSTRAINT IF EXISTS fk_catalog_vectors_motorbike,
                            ADD CONSTRAINT fk_catalog_vectors_motorbike
                            FOREIGN KEY (motorbike_id) REFERENCES motorbike_catalog(motorbike_id) ON DELETE CASCADE;
                    END IF;
                END IF;
            END $$;
            """
        ]
        for stmt in fk_statements:
            try:
                await conn.execute(text(stmt))
            except Exception as e:
                print(f"FK Migration Notice: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.app_name} in {settings.app_env} mode")
    try:
        setup_vercel_db()

        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
            await apply_database_foreign_keys(connection)

        await normalize_lac_hong_smart_features()
        await seed_default_users()

        # Seed locations and warm up catalog cache to avoid cold-start query delay
        from src.services.database import SessionLocal
        from src.services.rag.retrieval.vehicle_resolver import preload_catalog_cache
        from src.services.vinfast_locations_service import seed_vinfast_locations_if_empty
        async with SessionLocal() as db:
            await seed_vinfast_locations_if_empty(db)
            await preload_catalog_cache(db)

        # 4. Trigger background warmup for persistent SSL connection & LLM pipeline
        import asyncio
        asyncio.create_task(_background_warmup())
    except Exception as e:
        print(f"Lifespan DB setup notice: {e}")
    yield
    try:
        await engine.dispose()

    except Exception:
        pass
    print("Shutting down...")


async def _background_warmup():
    """Warms up SSL handshake, templates, and structured LLM inference at startup."""
    try:
        from src.agents.graph import agent
        from src.agents.nodes.needs_discovery import get_compose_structured_llm, get_extract_structured_llm
        from src.services.catalog_service import get_dynamic_catalog_summary

        # Preload catalog into RAM
        get_dynamic_catalog_summary()

        # Warm up Redis Checkpointer & Factual Cache
        try:
            from src.agents.graph import get_checkpointed_agent
            from src.services.factual_cache import get_factual_cache
            get_checkpointed_agent()
            await get_factual_cache("vf8")
        except Exception:
            pass

        # Warm up SSL connection to LLM API and prime the Constrained Decoding engine
        await agent.ainvoke({
            "messages": [{"role": "user", "content": "Xin chào"}],
            "session_id": "sys_startup_warmup",
        })
        print("🔥 [WARMUP COMPLETE] Pipeline, Redis & LLM connection are 100% warmed up!")
    except Exception as e:
        print(f"⚠️ [WARMUP NOTICE] Background warmup finished with info: {e}")




def sync_ensure_admin_users():
    try:
        setup_vercel_db()

        import sqlite3
        import uuid

        from src.services.security import hash_password

        db_path = "/tmp/vinfast.db" if os.environ.get("VERCEL") else os.path.join(DATA_DIR, "vinfast.db")
        os.makedirs(os.path.dirname(db_path), exist_ok=True)

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id CHAR(36) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20) NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'customer',
                is_active BOOLEAN NOT NULL DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        admin_pass = hash_password("admin123")
        staff_pass = hash_password("staff123")
        cust_pass = hash_password("123456")

        users_to_ensure = [
            ("admin@vinfast.vn", "0900000001", admin_pass, "Quản trị viên VinFast", "admin"),
            ("staff@vinfast.vn", "0900000002", staff_pass, "Tư vấn viên VinFast", "consultant"),
            ("customer@gmail.com", "0900000003", cust_pass, "Khách hàng Demo", "customer"),
        ]

        for email, phone, hpass, name, role in users_to_ensure:
            cursor.execute("SELECT id FROM users WHERE email = ?", (email.lower(),))
            row = cursor.fetchone()
            if row:
                cursor.execute("UPDATE users SET role = ?, hashed_password = ?, is_active = 1 WHERE email = ?", (role, hpass, email.lower()))
            else:
                cursor.execute("INSERT INTO users (id, email, phone, hashed_password, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)",
                               (str(uuid.uuid4()), email.lower(), phone, hpass, name, role))

        conn.commit()
        conn.close()
        print("✅ Synchronously enforced admin & staff users in SQLite database!")
    except Exception as e:
        print(f"Sync DB seed notice: {e}")


# Run sync asset copier and DB setup on module load
ensure_static_public_assets()
setup_vercel_db()
sync_ensure_admin_users()


app = FastAPI(
    title=settings.app_name,
    description="Nền tảng showroom số và bán hàng O2O cho hệ sinh thái xe điện VinFast",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.exists(STATIC_DIR) and os.path.isdir(STATIC_DIR):
    try:
        app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
    except Exception as e:
        print(f"Static mount notice: {e}")


app.include_router(router, prefix=settings.api_prefix)
app.include_router(router, prefix="/api")


@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected", "env": settings.app_env}
    except Exception:
        return {"status": "ok", "database": "unavailable", "env": settings.app_env}


# -------------------------------------------------------------
# Frontend SPA Static & Client Routing Support
# -------------------------------------------------------------
FRONTEND_DIST = os.path.join(PROJECT_ROOT, "frontend", "dist")

if os.path.exists(FRONTEND_DIST) and os.path.isdir(FRONTEND_DIST):
    # Mount /assets if exists
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        try:
            app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")
        except Exception as e:
            print(f"Frontend assets mount notice: {e}")

    # Catch-all route to serve SPA index.html and root static assets
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        target_file = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return {"detail": "Frontend index.html not found"}



