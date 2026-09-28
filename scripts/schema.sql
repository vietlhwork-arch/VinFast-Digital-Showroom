-- =================================================================
-- SUPABASE / POSTGRESQL SCHEMA INITIALIZATION FOR VINFAST AI ADVISOR
-- Database Connection: postgresql+asyncpg://...
-- =================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    phone         TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'customer', -- 'customer', 'consultant', 'admin'
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. Car Catalog Table
CREATE TABLE IF NOT EXISTS car_catalog (
    car_id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name              TEXT NOT NULL,              -- VD: 'VinFast VF 5 Plus'
    vehicle_line            TEXT NOT NULL,              -- VD: 'VF 5', 'VF 8', 'VF 9'
    version                 TEXT,                       -- VD: 'Plus', 'Eco', 'Base', 'Tiêu chuẩn'
    category                TEXT NOT NULL DEFAULT 'Personal',-- VD: 'Personal', 'Service', 'Bus'
    image_url               TEXT,                       -- Ảnh đại diện chính hiển thị UI
    colors                  JSONB,                      -- Màu ngoại thất; NULL nếu chưa có nguồn xác minh (EBus)
    list_price              NUMERIC NOT NULL,           -- Giá niêm yết (VNĐ)
    seat_count              INT2,                       -- Số chỗ ngồi
    length_mm               INT4,                       -- Chiều dài (mm)
    width_mm                INT4,                       -- Chiều rộng (mm)
    height_mm               INT4,                       -- Chiều cao (mm)
    wheelbase_mm            INT4,                       -- Chiều dài cơ sở (mm)
    range_km                NUMERIC,                    -- Quãng đường di chuyển (km)
    maximum_power_kw        NUMERIC,                    -- Công suất tối đa (kW)
    maximum_torque_nm       NUMERIC,                    -- Mô-men xoắn tối đa (Nm)
    usable_battery_capacity NUMERIC,                    -- Dung lượng pin sử dụng (kWh)
    additional_specs        JSONB DEFAULT '{}'::jsonb,  -- Toàn bộ JSON chi tiết gốc
    is_active               BOOLEAN DEFAULT true,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now()
);

-- 4. Motorbike Catalog Table
CREATE TABLE IF NOT EXISTS motorbike_catalog (
    motorbike_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name            TEXT NOT NULL,                -- VD: 'VinFast Evo Lite'
    vehicle_line          TEXT NOT NULL,                -- VD: 'Evo', 'Feliz', 'Klara'
    version               TEXT,                         -- VD: 'Kèm pin', 'Thuê pin'
    category              TEXT NOT NULL DEFAULT 'Scooter', -- 'Scooter'
    image_url             TEXT,                         -- Ảnh đại diện chính hiển thị UI
    colors                JSONB DEFAULT '[]'::jsonb,    -- Danh sách màu sắc
    list_price            NUMERIC NOT NULL,             -- Giá niêm yết (VNĐ)
    range_km              NUMERIC,                      -- Quãng đường di chuyển (km)
    charging_time_minutes INT4,                         -- Thời gian sạc đầy (phút)
    battery_type          TEXT,                         -- Loại pin
    battery_quantity      INT2 DEFAULT 1,               -- Số lượng pin
    battery_capacity_kwh  NUMERIC,                      -- Dung lượng pin (kWh)
    motor_type            TEXT,                         -- Loại động cơ
    maximum_power_w       NUMERIC,                      -- Công suất tối đa (W)
    maximum_speed_kmh     NUMERIC,                      -- Vận tốc tối đa (km/h)
    weight_kg             NUMERIC,                      -- Trọng lượng xe (kg)
    length_mm             INT4,                         -- Chiều dài (mm)
    width_mm              INT4,                         -- Chiều rộng (mm)
    height_mm             INT4,                         -- Chiều cao (mm)
    front_brake           TEXT,
    rear_brake            TEXT,
    front_suspension      TEXT,
    rear_suspension       TEXT,
    additional_specs      JSONB DEFAULT '{}'::jsonb,    -- Toàn bộ JSON chi tiết gốc
    is_active             BOOLEAN DEFAULT true,
    created_at            TIMESTAMPTZ DEFAULT now(),
    updated_at            TIMESTAMPTZ DEFAULT now()
);

-- 5. Catalog Vectors Table (RAG Search)
CREATE TABLE IF NOT EXISTS catalog_vectors (
    vector_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id       UUID REFERENCES car_catalog(car_id) ON DELETE CASCADE,
    motorbike_id UUID REFERENCES motorbike_catalog(motorbike_id) ON DELETE CASCADE,
    chunk_type   TEXT NOT NULL,        -- 'specs', 'description', 'summary', 'faq'
    chunk_text   TEXT NOT NULL,
    embedding    vector(1536) NOT NULL,-- Vector embedding
    content_hash TEXT NOT NULL,
    chunk_index  INT2 NOT NULL DEFAULT 0,
    source_paths TEXT[] NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

-- 6. Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES accounts(user_id) ON DELETE CASCADE,
    role       TEXT NOT NULL,         -- 'user', 'assistant', 'system'
    content    TEXT NOT NULL,
    metadata   JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Chat Summaries Table
CREATE TABLE IF NOT EXISTS chat_summaries (
    summary_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES accounts(user_id) ON DELETE CASCADE,
    session_id   TEXT,
    summary_text TEXT NOT NULL,
    summarized_through TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT ck_chat_summaries_owner
        CHECK (user_id IS NOT NULL OR NULLIF(TRIM(session_id), '') IS NOT NULL)
);

-- 8. Long-term Memory Table
CREATE TABLE IF NOT EXISTS long_term_memory (
    memory_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID REFERENCES accounts(user_id) ON DELETE CASCADE,
    memory_key        TEXT NOT NULL,
    memory_value      JSONB NOT NULL,
    source_message_id UUID REFERENCES chat_history(message_id) ON DELETE SET NULL,
    confidence        NUMERIC DEFAULT 1.0,
    created_at        TIMESTAMPTZ DEFAULT now(),
    updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Fast Query Performance
CREATE INDEX IF NOT EXISTS idx_car_catalog_line ON car_catalog(vehicle_line);
CREATE INDEX IF NOT EXISTS idx_car_catalog_category ON car_catalog(category);
CREATE INDEX IF NOT EXISTS idx_motorbike_catalog_line ON motorbike_catalog(vehicle_line);
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_summaries_user
    ON chat_summaries(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_summaries_guest_session
    ON chat_summaries(session_id) WHERE user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_memory_user ON long_term_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_catalog_vectors_car_group ON catalog_vectors(car_id, chunk_type);
CREATE INDEX IF NOT EXISTS idx_catalog_vectors_motorbike_group ON catalog_vectors(motorbike_id, chunk_type);
CREATE INDEX IF NOT EXISTS idx_catalog_vectors_source_paths ON catalog_vectors USING GIN(source_paths);
