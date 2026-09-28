-- Move the catalog RAG vector store to the application's public schema.
-- Safe to run repeatedly: existing catalog and vector rows are preserved.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE public.catalog_vectors
    ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE public.catalog_vectors
    ADD COLUMN IF NOT EXISTS source_paths TEXT[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.catalog_vectors
        WHERE embedding IS NULL
    ) THEN
        ALTER TABLE public.catalog_vectors
            ALTER COLUMN embedding SET NOT NULL;
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_catalog_vectors_car_id
    ON public.catalog_vectors (car_id);

CREATE INDEX IF NOT EXISTS idx_catalog_vectors_motorbike_id
    ON public.catalog_vectors (motorbike_id);

CREATE INDEX IF NOT EXISTS idx_catalog_vectors_chunk_type
    ON public.catalog_vectors (chunk_type);

CREATE INDEX IF NOT EXISTS idx_catalog_vectors_car_group
    ON public.catalog_vectors (car_id, chunk_type);

CREATE INDEX IF NOT EXISTS idx_catalog_vectors_motorbike_group
    ON public.catalog_vectors (motorbike_id, chunk_type);

CREATE INDEX IF NOT EXISTS idx_catalog_vectors_source_paths
    ON public.catalog_vectors USING GIN (source_paths);
