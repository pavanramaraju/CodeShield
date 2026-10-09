from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.event import (
    DashboardSummaryResponse,
    EventRespondRequest,
    EventResponse,
    EventSimulateRequest,
    EventVerifyRequest,
)
from app.services import event_service

router = APIRouter(prefix="/api", tags=["Cyber Events & Dashboard"])


@router.get("/events", response_model=List[EventResponse])
def get_events(
    limit: int = Query(default=50, ge=1, le=100, description="Max number of events to return"),
    offset: int = Query(default=0, ge=0, description="Number of events to skip"),
    risk_level: Optional[str] = Query(default=None, description="Filter by risk level (LOW, MEDIUM, HIGH, CRITICAL)"),
    verification_status: Optional[str] = Query(default=None, description="Filter by verification status"),
):
    """List recorded cyber events with pagination and filtering."""
    return event_service.list_events(
        limit=limit,
        offset=offset,
        risk_level=risk_level,
        verification_status=verification_status,
    )


@router.post(
    "/events/simulate",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
)
def post_simulate_event(payload: Optional[EventSimulateRequest] = None):
    """
    Ingest and simulate a new cyber anomaly event.
    Evaluates telemetry using the classical heuristic risk engine,
    marks quantum status as pending, and persists to SQLite.
    """
    return event_service.simulate_event(payload)


@router.get("/events/{event_id}", response_model=EventResponse)
def get_event_by_id(event_id: str):
    """Retrieve full event details and audit timeline by event ID."""
    event = event_service.get_event(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cyber event with ID '{event_id}' not found.",
        )
    return event


@router.post("/events/{event_id}/verify", response_model=EventResponse)
def post_verify_event(event_id: str, payload: EventVerifyRequest):
    """
    Update verification status (e.g., 'verified', 'flagged', 'dismissed')
    and record an entry in the event audit timeline.
    """
    updated = event_service.verify_event(event_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cyber event with ID '{event_id}' not found.",
        )
    return updated


@router.post("/events/{event_id}/respond", response_model=EventResponse)
def post_respond_to_event(event_id: str, payload: EventRespondRequest):
    """
    Trigger a simulated defense action (e.g., 'block_ip', 'isolate_host', 'rate_limit').
    SAFETY: Defense actions are purely simulated and will never alter live production systems.
    """
    updated = event_service.respond_to_event(event_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cyber event with ID '{event_id}' not found.",
        )
    return updated


@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary():
    """Return aggregated SOC dashboard metrics and recent security events."""
    return event_service.get_dashboard_summary()
