from logging.config import fileConfig
import sys
from pathlib import Path
from sqlalchemy import pool

from alembic import context

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.db import Base
import app.models  # noqa: F401 — register all tables
target_metadata = Base.metadata

# DATABASE_URL comes from env (never hardcoded); alembic.ini placeholder overridden here.
def _db_url() -> str:
    try:
        from app.config import get_settings
        return get_settings().DATABASE_URL
    except Exception:
        return config.get_main_option("sqlalchemy.url")


def run_migrations_offline() -> None:
    context.configure(url=_db_url(), target_metadata=target_metadata, literal_binds=True,
                      dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    from sqlalchemy import create_engine
    connectable = create_engine(_db_url(), poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
