from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EventFeatures(BaseModel):
    """Network and cyber telemetry feature set."""
    source_ip: str = Field(default="192.168.1.105", description="Source IP address")
    destination_ip: str = Field(default="10.0.0.5", description="Destination IP address")
    protocol: str = Field(default="TCP", description="Network protocol (TCP, UDP, ICMP)")
    packet_rate: float = Field(default=120.0, description="Packets per second")
    failed_logins: int = Field(default=0, description="Number of recent failed authentication attempts")
    payload_entropy: float = Field(default=4.5, description="Shannon entropy score of the packet payload (0-8)")
    port: int = Field(default=443, description="Target destination port")
    request_rate: float = Field(default=15.0, description="HTTP/service requests per second")
    encryption_anomalies: bool = Field(default=False, description="Whether anomalous cipher/handshake was detected")

    model_config = {"extra": "allow"}


class TimelineEntry(BaseModel):
    """Audit log entry tracking the lifecycle of an event."""
    timestamp: str = Field(description="ISO 8601 timestamp")
    stage: str = Field(description="Lifecycle stage (INGESTION, CLASSICAL_ASSESSMENT, VERIFICATION, RESPONSE)")
    action: str = Field(description="Action summary")
    details: str = Field(description="Detailed description of the action or rationale")


class DefenseAction(BaseModel):
    """Simulated countermeasure executed in response to an anomaly."""
    action_id: str = Field(description="Unique action identifier")
    timestamp: str = Field(description="ISO 8601 timestamp of execution")
    action_type: str = Field(description="Type of response (e.g., block_ip, isolate_host, rate_limit)")
    target: str = Field(description="Target IP, host, or user subject")
    status: str = Field(default="SIMULATED_ENFORCED", description="Execution status")
    is_simulated: bool = Field(default=True, description="Always true; safety guarantee that no real systems are affected")
    details: str = Field(description="Description of what this defensive action simulates")


class EventSimulateRequest(BaseModel):
    """Request payload for simulating a new cybersecurity event."""
    scenario: Optional[str] = Field(
        default=None,
        description="Optional scenario preset: 'ddos', 'brute_force', 'data_exfiltration', 'port_scan', 'quantum_anomaly', or 'normal'",
    )
    features: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Custom feature values to override defaults",
    )


class EventVerifyRequest(BaseModel):
    """Request payload for updating an event's verification status."""
    verification_status: str = Field(
        ...,
        description="New verification status: 'verified', 'flagged', 'dismissed', or 'unverified'",
        examples=["verified"],
    )
    notes: Optional[str] = Field(
        default="Analyst verified anomaly indicator",
        description="Analyst verification notes recorded in audit timeline",
    )


class EventRespondRequest(BaseModel):
    """Request payload for triggering a simulated defense response."""
    action: str = Field(
        ...,
        description="Simulated defense action type: 'block_ip', 'isolate_host', 'rate_limit', or 'alert_soc'",
        examples=["block_ip"],
    )
    target: Optional[str] = Field(
        default=None,
        description="Target subject for defense (defaults to source_ip)",
    )
    parameters: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional parameters for the simulated action (e.g., duration, limit rate)",
    )


class EventResponse(BaseModel):
    """Complete cybersecurity event representation."""
    event_id: str
    timestamp: str
    features: Dict[str, Any]
    classical_risk_score: float
    quantum_status: str
    quantum_result: Optional[Dict[str, Any]] = None
    final_risk: float
    risk_level: str
    reasons: List[str]
    verification_status: str
    defense_actions: List[Dict[str, Any]]
    timeline: List[Dict[str, Any]]


class DashboardSummaryResponse(BaseModel):
    """Aggregated statistics for SOC dashboard monitoring."""
    total_events: int
    risk_distribution: Dict[str, int]
    verification_distribution: Dict[str, int]
    average_risk_score: float
    quantum_pending_count: int
    simulated_actions_count: int
    recent_events: List[EventResponse]
