import sqlite3
from contextlib import contextmanager
from .config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK(gender IN ('male','female')),
  age INTEGER,
  height INTEGER,
  education TEXT,
  job TEXT,
  city TEXT,
  intro TEXT,
  photo_url TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  value TEXT UNIQUE NOT NULL,
  scope TEXT NOT NULL CHECK(scope IN ('all_male','all_female','custom')),
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS token_guests (
  token_id TEXT NOT NULL,
  guest_id TEXT NOT NULL,
  PRIMARY KEY(token_id, guest_id),
  FOREIGN KEY(token_id) REFERENCES tokens(id) ON DELETE CASCADE,
  FOREIGN KEY(guest_id) REFERENCES guests(id) ON DELETE CASCADE
);
"""


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def get_conn():
    conn = _connect()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript(SCHEMA)
