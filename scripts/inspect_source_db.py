"""Print public table names and catalog row counts without modifying the source DB."""

from __future__ import annotations

import asyncio
import os

import asyncpg


CATALOG_TABLE_CANDIDATES = (
    "car_catalog",
    "cars",
    "motorbike_catalog",
    "motorbikes",
    "escooters",
)


async def main() -> None:
    database_url = os.environ.get("SOURCE_DATABASE_URL")
    if not database_url:
        raise SystemExit("Set SOURCE_DATABASE_URL before running this script")

    connection = await asyncpg.connect(database_url, ssl="require", timeout=12)
    try:
        rows = await connection.fetch(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = 'public' ORDER BY table_name"
        )
        table_names = [row["table_name"] for row in rows]
        print("Public tables:", ", ".join(table_names))
        for table_name in CATALOG_TABLE_CANDIDATES:
            if table_name in table_names:
                count = await connection.fetchval(
                    "SELECT count(*) FROM information_schema.tables "
                    "WHERE table_schema = 'public' AND table_name = $1",
                    table_name,
                )
                if count:
                    # The identifier comes from a fixed allowlist and was confirmed above.
                    row_count = await connection.fetchval(
                        f'SELECT count(*) FROM public."{table_name}"'
                    )
                    print(f"{table_name}: {row_count} rows")
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(main())
