import json
import sqlite3
from typing import Any, Dict, List, Optional
from app.storage.database import get_db_connection


def _row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    """Convert an SQLite Row object to an Event dictionary with JSON parsed."""
    d = dict(row)
    d["features"] = json.loads(d["features"]) if d.get("features") else {}
    d["quantum_result"] = (
        json.loads(d["quantum_result"]) if d.get("quantum_result") is not None else None
    )
    d["reasons"] = json.loads(d["reasons"]) if d.get("reasons") else []
    d["defense_actions"] = (
        json.loads(d["defense_actions"]) if d.get("defense_actions") else []
    )
    d["timeline"] = json.loads(d["timeline"]) if d.get("timeline") else []
    return d


def create_event(event: Dict[str, Any]) -> Dict[str, Any]:
    """Insert a new event into the SQLite database."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO events (
                event_id, timestamp, features, classical_risk_score,
                quantum_status, quantum_result, final_risk, risk_level,
                reasons, verification_status, defense_actions, timeline
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                event["event_id"],
                event["timestamp"],
                json.dumps(event.get("features", {})),
                float(event["classical_risk_score"]),
                event["quantum_status"],
                json.dumps(event["quantum_result"]) if event.get("quantum_result") is not None else None,
                float(event["final_risk"]),
                event["risk_level"],
                json.dumps(event.get("reasons", [])),
                event["verification_status"],
                json.dumps(event.get("defense_actions", [])),
                json.dumps(event.get("timeline", [])),
            ),
        )
    return event


def get_event_by_id(event_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve an event by its unique identifier."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM events WHERE event_id = ? LIMIT 1;", (event_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return _row_to_dict(row)


def list_events(
    limit: int = 50,
    offset: int = 0,
    risk_level: Optional[str] = None,
    verification_status: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Query a paginated list of events with optional filters."""
    query = "SELECT * FROM events"
    params: List[Any] = []
    conditions: List[str] = []

    if risk_level:
        conditions.append("risk_level = ?")
        params.append(risk_level.upper())

    if verification_status:
        conditions.append("verification_status = ?")
        params.append(verification_status.lower())

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?;"
    params.extend([limit, offset])

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [_row_to_dict(r) for r in rows]


def update_event_state(
    event_id: str,
    verification_status: Optional[str] = None,
    defense_actions: Optional[List[Dict[str, Any]]] = None,
    timeline: Optional[List[Dict[str, Any]]] = None,
) -> Optional[Dict[str, Any]]:
    """Update mutable event fields (verification status, defenses, and audit timeline)."""
    current = get_event_by_id(event_id)
    if not current:
        return None

    new_status = verification_status if verification_status is not None else current["verification_status"]
    new_defenses = defense_actions if defense_actions is not None else current["defense_actions"]
    new_timeline = timeline if timeline is not None else current["timeline"]

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE events
            SET verification_status = ?,
                defense_actions = ?,
                timeline = ?
            WHERE event_id = ?;
            """,
            (
                new_status,
                json.dumps(new_defenses),
                json.dumps(new_timeline),
                event_id,
            ),
        )

    return get_event_by_id(event_id)


def get_dashboard_summary_data() -> Dict[str, Any]:
    """Calculate aggregated metrics across all recorded events."""
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Total count and average risk score
        cursor.execute(
            "SELECT COUNT(*), COALESCE(AVG(final_risk), 0.0) FROM events;"
        )
        total_count, avg_risk = cursor.fetchone()

        # Risk distribution
        cursor.execute(
            "SELECT risk_level, COUNT(*) FROM events GROUP BY risk_level;"
        )
        risk_dist = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
        for level, count in cursor.fetchall():
            if level in risk_dist:
                risk_dist[level] = count
            else:
                risk_dist[level] = count

        # Verification distribution
        cursor.execute(
            "SELECT verification_status, COUNT(*) FROM events GROUP BY verification_status;"
        )
        verif_dist = {"unverified": 0, "verified": 0, "flagged": 0, "dismissed": 0}
        for status, count in cursor.fetchall():
            verif_dist[status] = count

        # Quantum pending count
        cursor.execute(
            "SELECT COUNT(*) FROM events WHERE quantum_status = 'pending';"
        )
        quantum_pending = cursor.fetchone()[0]

        # Total defense actions recorded across all events
        # We can also get recent 5 events
        cursor.execute(
            "SELECT * FROM events ORDER BY timestamp DESC LIMIT 5;"
        )
        recent_rows = cursor.fetchall()
        recent_events = [_row_to_dict(r) for r in recent_rows]

        # Count total simulated defense actions
        cursor.execute("SELECT defense_actions FROM events;")
        all_actions = cursor.fetchall()
        total_simulated_actions = 0
        for (actions_json,) in all_actions:
            if actions_json:
                total_simulated_actions += len(json.loads(actions_json))

    return {
        "total_events": total_count,
        "risk_distribution": risk_dist,
        "verification_distribution": verif_dist,
        "average_risk_score": round(float(avg_risk), 4),
        "quantum_pending_count": quantum_pending,
        "simulated_actions_count": total_simulated_actions,
        "recent_events": recent_events,
    }
