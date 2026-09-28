-- =================================================================
-- FOREIGN KEY CONSTRAINTS MIGRATION FOR VINFAST SHOWROOM DB
-- Aligns PostgreSQL database with the ERD diagram relationships
-- =================================================================

-- 1. Foreign Key for chat_history -> accounts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_history') THEN
        ALTER TABLE chat_history
            DROP CONSTRAINT IF EXISTS fk_chat_history_user,
            ADD CONSTRAINT fk_chat_history_user
            FOREIGN KEY (user_id) REFERENCES accounts(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Foreign Key for chat_summaries -> accounts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_summaries') THEN
        ALTER TABLE chat_summaries
            DROP CONSTRAINT IF EXISTS fk_chat_summaries_user,
            ADD CONSTRAINT fk_chat_summaries_user
            FOREIGN KEY (user_id) REFERENCES accounts(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Foreign Keys for long_term_memory -> accounts & chat_history
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'long_term_memory') THEN
        ALTER TABLE long_term_memory
            DROP CONSTRAINT IF EXISTS fk_long_term_memory_user,
            ADD CONSTRAINT fk_long_term_memory_user
            FOREIGN KEY (user_id) REFERENCES accounts(user_id) ON DELETE CASCADE;

        ALTER TABLE long_term_memory
            DROP CONSTRAINT IF EXISTS fk_long_term_memory_message,
            ADD CONSTRAINT fk_long_term_memory_message
            FOREIGN KEY (source_message_id) REFERENCES chat_history(message_id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Foreign Keys for catalog_vectors -> car_catalog & motorbike_catalog
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalog_vectors') THEN
        ALTER TABLE catalog_vectors
            DROP CONSTRAINT IF EXISTS fk_catalog_vectors_car,
            ADD CONSTRAINT fk_catalog_vectors_car
            FOREIGN KEY (car_id) REFERENCES car_catalog(car_id) ON DELETE CASCADE;

        ALTER TABLE catalog_vectors
            DROP CONSTRAINT IF EXISTS fk_catalog_vectors_motorbike,
            ADD CONSTRAINT fk_catalog_vectors_motorbike
            FOREIGN KEY (motorbike_id) REFERENCES motorbike_catalog(motorbike_id) ON DELETE CASCADE;
    END IF;
END $$;
