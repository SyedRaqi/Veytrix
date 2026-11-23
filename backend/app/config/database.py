"""Database connection placeholder.

Database credentials and policies will be configured during the Supabase phase.
Do not add service-role credentials to frontend configuration.
"""

import os


def get_database_url() -> str | None:
    return os.getenv("DATABASE_URL")
