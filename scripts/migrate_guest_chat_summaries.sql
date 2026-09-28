-- Persist anonymous rolling summaries by session without mixing guest users.
ALTER TABLE public.chat_summaries
    ALTER COLUMN user_id DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS session_id TEXT,
    ADD COLUMN IF NOT EXISTS summarized_through TIMESTAMPTZ;

ALTER TABLE public.chat_summaries
    DROP CONSTRAINT IF EXISTS ck_chat_summaries_owner;

ALTER TABLE public.chat_summaries
    ADD CONSTRAINT ck_chat_summaries_owner
    CHECK (user_id IS NOT NULL OR NULLIF(TRIM(session_id), '') IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_summaries_user
    ON public.chat_summaries(user_id)
    WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_summaries_guest_session
    ON public.chat_summaries(session_id)
    WHERE user_id IS NULL;
