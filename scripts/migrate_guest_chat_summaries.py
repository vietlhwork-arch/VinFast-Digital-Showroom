"""Migrate public.chat_summaries for guest sessions and optionally purge guest chat."""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from sqlalchemy import text

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.services.database import engine


MIGRATION_STATEMENTS = (
    """
    ALTER TABLE public.chat_summaries
        ALTER COLUMN user_id DROP NOT NULL,
        ADD COLUMN IF NOT EXISTS session_id TEXT,
        ADD COLUMN IF NOT EXISTS summarized_through TIMESTAMPTZ
    """,
    """
    ALTER TABLE public.chat_summaries
        DROP CONSTRAINT IF EXISTS ck_chat_summaries_owner
    """,
    """
    ALTER TABLE public.chat_summaries
        ADD CONSTRAINT ck_chat_summaries_owner
        CHECK (user_id IS NOT NULL OR NULLIF(TRIM(session_id), '') IS NOT NULL)
    """,
    """
    CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_summaries_user
        ON public.chat_summaries(user_id)
        WHERE user_id IS NOT NULL
    """,
    """
    CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_summaries_guest_session
        ON public.chat_summaries(session_id)
        WHERE user_id IS NULL
    """,
)


async def migrate(*, purge_null_history: bool) -> None:
    if engine.dialect.name != "postgresql":
        raise RuntimeError("Migration này chỉ được phép chạy trên PostgreSQL public schema")

    async with engine.begin() as connection:
        await connection.execute(text(MIGRATION_STATEMENTS[0]))

        ownerless_summaries = int(
            await connection.scalar(
                text(
                    """
                    SELECT count(*)
                    FROM public.chat_summaries
                    WHERE user_id IS NULL
                      AND NULLIF(TRIM(session_id), '') IS NULL
                    """
                )
            )
            or 0
        )
        if ownerless_summaries:
            raise RuntimeError(
                f"Có {ownerless_summaries} summary cũ không có user_id/session_id; "
                "chưa xóa vì ngoài phạm vi purge chat_history"
            )

        for statement in MIGRATION_STATEMENTS[1:]:
            await connection.execute(text(statement))

        before = int(
            await connection.scalar(
                text("SELECT count(*) FROM public.chat_history WHERE user_id IS NULL")
            )
            or 0
        )
        deleted = 0
        if purge_null_history:
            result = await connection.execute(
                text("DELETE FROM public.chat_history WHERE user_id IS NULL")
            )
            deleted = int(result.rowcount or 0)

        after = int(
            await connection.scalar(
                text("SELECT count(*) FROM public.chat_history WHERE user_id IS NULL")
            )
            or 0
        )

    print("chat_summaries migration: OK")
    print(f"chat_history user_id NULL: before={before}, deleted={deleted}, after={after}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--purge-null-history",
        action="store_true",
        help="Delete every public.chat_history row whose user_id is NULL.",
    )
    args = parser.parse_args()
    asyncio.run(migrate(purge_null_history=args.purge_null_history))


if __name__ == "__main__":
    main()
