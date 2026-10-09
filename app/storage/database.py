import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

# Default database file path: qshield.db in the project root
DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent.parent / "qshield.db"
DB_PATH = Path(os.getenv("QSHIELD_DB_PATH", str(DEFAULT_DB_PATH)))


def get_db_path() -> Path:
    """Return the currently configured SQLite database file path."""
    return DB_PATH


@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    """Provide a transactional SQLite database connection with row factory configured."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """Initialize SQLite database tables and indexes if they do not exist."""
    # Ensure parent directory exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
                event_id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                features TEXT NOT NULL,
                classical_risk_score REAL NOT NULL,
                quantum_status TEXT NOT NULL,
                quantum_result TEXT,
                final_risk REAL NOT NULL,
                risk_level TEXT NOT NULL,
                reasons TEXT NOT NULL,
                verification_status TEXT NOT NULL,
                defense_actions TEXT NOT NULL,
                timeline TEXT NOT NULL
            );
            """
        )
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_events_timestamp 
            ON events(timestamp DESC);
            """
        )
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_events_risk_level 
            ON events(risk_level);
            """
        )
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_events_verification 
            ON events(verification_status);
            """
        )
