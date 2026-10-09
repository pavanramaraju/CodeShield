import random
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from app.quantum.adapter import (
    QuantumSimulationError,
    execute_quantum_circuit,
)
from app.quantum.normalizer import (
    FeatureNormalizationError,
    normalize_cyber_features,
)
from app.schemas.event import (
    EventRespondRequest,
    EventSimulateRequest,
    EventVerifyRequest,
)
from app.storage import event_repository


def _generate_timestamp() -> str:
    """Generate ISO 8601 formatted UTC timestamp."""
    return datetime.now(timezone.utc).isoformat()


# ==============================================================================
# MOCK CLASSICAL RISK ASSESSMENT ENGINE
# Note: Clearly labelled heuristic evaluation for Phase 2.
# Phase 3 will introduce Qiskit Quantum Feature Mapping & Anomaly Classification.
# ==============================================================================
def assess_classical_risk(features: Dict[str, Any]) -> Tuple[float, str, List[str]]:
    """
    Perform heuristic classical risk assessment on network telemetry.
    Returns:
        (classical_risk_score, risk_level, reasons)
    """
    score = 0.05
    reasons: List[str] = []

    packet_rate = float(features.get("packet_rate", 0))
    failed_logins = int(features.get("failed_logins", 0))
    payload_entropy = float(features.get("payload_entropy", 0.0))
    port = int(features.get("port", 0))
    request_rate = float(features.get("request_rate", 0))
    encryption_anomalies = bool(features.get("encryption_anomalies", False))

    if packet_rate > 2500:
        score += 0.50
        reasons.append(f"Severe volumetric flood detected: packet rate ({packet_rate:.1f} pps) exceeds 2500 pps critical threshold")
    elif packet_rate > 1000:
        score += 0.35
        reasons.append(f"High packet transmission rate ({packet_rate:.1f} pps) indicates volumetric flood")

    if failed_logins >= 5:
        score += 0.35
        reasons.append(f"Elevated authentication failure count ({failed_logins}) indicates brute-force attempt")

    if payload_entropy > 7.0:
        score += 0.25
        reasons.append(f"High Shannon entropy ({payload_entropy:.2f}) indicates encrypted or obfuscated payload")

    if port in {22, 23, 3389, 445}:
        score += 0.10
        reasons.append(f"Sensitive service port targeted ({port})")

    if request_rate > 100:
        score += 0.15
        reasons.append(f"High application request frequency ({request_rate:.1f} req/s)")

    if encryption_anomalies:
        score += 0.20
        reasons.append("Anomalous cryptographic handshake/cipher negotiation detected")

    if not reasons:
        reasons.append("Baseline telemetry within expected operational thresholds")

    # Clamp score between 0.05 and 0.99
    final_score = round(min(max(score, 0.05), 0.99), 2)

    # Classify risk level
    if final_score >= 0.75:
        level = "CRITICAL"
    elif final_score >= 0.50:
        level = "HIGH"
    elif final_score >= 0.25:
        level = "MEDIUM"
    else:
        level = "LOW"

    return final_score, level, reasons


def generate_scenario_features(scenario: Optional[str]) -> Dict[str, Any]:
    """Generate preset feature values based on threat scenario."""
    base_features: Dict[str, Any] = {
        "source_ip": f"192.168.1.{random.randint(10, 250)}",
        "destination_ip": "10.0.0.1",
        "protocol": "TCP",
        "packet_rate": 80.0,
        "failed_logins": 0,
        "payload_entropy": 3.8,
        "port": 443,
        "request_rate": 10.0,
        "encryption_anomalies": False,
    }

    if scenario == "ddos":
        base_features.update({
            "source_ip": f"203.0.113.{random.randint(1, 254)}",
            "protocol": "UDP",
            "packet_rate": 3500.0,
            "port": 80,
            "request_rate": 450.0,
            "payload_entropy": 4.1,
        })
    elif scenario == "brute_force":
        base_features.update({
            "source_ip": f"198.51.100.{random.randint(1, 254)}",
            "protocol": "TCP",
            "packet_rate": 45.0,
            "failed_logins": 14,
            "port": 22,
            "request_rate": 8.0,
            "payload_entropy": 4.0,
        })
    elif scenario == "data_exfiltration":
        base_features.update({
            "source_ip": "10.0.4.52",
            "destination_ip": f"198.51.100.{random.randint(1, 254)}",
            "protocol": "TCP",
            "packet_rate": 450.0,
            "failed_logins": 0,
            "port": 443,
            "payload_entropy": 7.85,
            "request_rate": 30.0,
            "encryption_anomalies": True,
        })
    elif scenario == "port_scan":
        base_features.update({
            "source_ip": f"198.51.100.{random.randint(1, 254)}",
            "protocol": "TCP",
            "packet_rate": 850.0,
            "port": 3389,
            "failed_logins": 0,
            "payload_entropy": 2.1,
            "request_rate": 120.0,
        })
    elif scenario == "quantum_anomaly":
        base_features.update({
            "source_ip": "172.16.0.44",
            "protocol": "TCP",
            "packet_rate": 210.0,
            "payload_entropy": 7.1,
            "port": 8443,
            "encryption_anomalies": True,
        })
    elif scenario == "normal":
        base_features.update({
            "source_ip": "10.0.1.15",
            "protocol": "TCP",
            "packet_rate": 42.0,
            "failed_logins": 0,
            "payload_entropy": 3.4,
            "port": 443,
            "request_rate": 5.0,
            "encryption_anomalies": False,
        })
    return base_features


# ==============================================================================
# EVENT SERVICE BUSINESS LOGIC
# ==============================================================================
def simulate_event(req: Optional[EventSimulateRequest] = None) -> Dict[str, Any]:
    """
    Ingest and simulate a cybersecurity telemetry event:
    1. Compiles features based on scenario and overrides.
    2. Runs classical risk heuristic scoring.
    3. Queues quantum status as 'pending' (ready for Phase 3).
    4. Initializes audit trail.
    5. Persists to SQLite.
    """
    scenario = req.scenario if req else None
    features = generate_scenario_features(scenario)
    if req and req.features:
        features.update(req.features)

    now = _generate_timestamp()
    event_id = f"evt_{uuid.uuid4().hex[:10]}"

    # Classical Risk Assessment
    classical_score, risk_level, reasons = assess_classical_risk(features)

    # 2. Quantum Analysis Pipeline (Phase 4 Integration)
    quantum_status = "pending"
    quantum_result: Dict[str, Any] = {}
    q_timeline_action = ""
    q_timeline_details = ""

    try:
        # Step A: Validate and normalize the 4 continuous cybersecurity telemetry features
        normalized_q_features = normalize_cyber_features(features)

        # Step B: Execute the actual 4-qubit quantum simulator via the existing adapter
        q_adapter_result = execute_quantum_circuit(normalized_q_features, shots=1024)

        quantum_status = "completed"
        quantum_result = {
            "status": "completed",
            "circuit_executed": True,
            "qubit_count": q_adapter_result.qubit_count,
            "shots": q_adapter_result.shots,
            "circuit_depth": q_adapter_result.circuit_depth,
            "encoded_features": q_adapter_result.encoded_features,
            "counts": q_adapter_result.counts,
            "statistic_name": q_adapter_result.statistic_name,
            "statistic_description": q_adapter_result.statistic_description,
            "quantum_measurement_statistic": q_adapter_result.quantum_measurement_statistic,
            "ground_state_probability": q_adapter_result.ground_state_probability,
            "disclaimer": q_adapter_result.disclaimer,
            "error_message": None,
        }
        q_timeline_action = (
            f"Quantum circuit executed ({q_adapter_result.statistic_name} = "
            f"{q_adapter_result.quantum_measurement_statistic})"
        )
        q_timeline_details = (
            f"4-qubit quantum simulation completed ({q_adapter_result.shots} shots, "
            f"depth {q_adapter_result.circuit_depth}). Encoded features: {normalized_q_features}. "
            f"State dispersion: {q_adapter_result.quantum_measurement_statistic}."
        )

    except FeatureNormalizationError as norm_err:
        quantum_status = "failed"
        quantum_result = {
            "status": "failed",
            "circuit_executed": False,
            "qubit_count": 4,
            "shots": 0,
            "circuit_depth": 0,
            "encoded_features": [],
            "counts": {},
            "statistic_name": "excited_state_ratio",
            "statistic_description": "Quantum circuit execution skipped due to invalid or out-of-range telemetry.",
            "quantum_measurement_statistic": 0.0,
            "ground_state_probability": 0.0,
            "disclaimer": "No quantum circuit executed. Telemetry did not pass normalization validation.",
            "error_message": f"Feature normalization failed: {str(norm_err)}",
        }
        q_timeline_action = "Quantum circuit skipped (normalization failure)"
        q_timeline_details = f"Telemetry normalization error: {str(norm_err)}"

    except (QuantumSimulationError, Exception) as sim_err:
        quantum_status = "failed"
        quantum_result = {
            "status": "failed",
            "circuit_executed": False,
            "qubit_count": 4,
            "shots": 0,
            "circuit_depth": 0,
            "encoded_features": [],
            "counts": {},
            "statistic_name": "excited_state_ratio",
            "statistic_description": "Quantum circuit simulator execution failed.",
            "quantum_measurement_statistic": 0.0,
            "ground_state_probability": 0.0,
            "disclaimer": "No quantum circuit executed due to simulator exception.",
            "error_message": f"Quantum simulation error: {str(sim_err)}",
        }
        q_timeline_action = "Quantum circuit execution failed"
        q_timeline_details = f"Simulator runtime error: {str(sim_err)}"

    # 3. Risk Assessment Policy (Preserved classical policy):
    # The quantum measurement statistic is exploratory telemetry and is NOT
    # treated as a validated attack probability or arbitrarily fused into the score.
    final_risk = classical_score

    # Initial audit timeline entries
    timeline = [
        {
            "timestamp": now,
            "stage": "INGESTION",
            "action": f"Event ingested via simulation (Scenario: {scenario or 'standard'})",
            "details": f"Telemetry recorded from {features.get('source_ip')} -> {features.get('destination_ip')}:{features.get('port')}",
        },
        {
            "timestamp": now,
            "stage": "CLASSICAL_ASSESSMENT",
            "action": f"Classical heuristic assessment completed: {risk_level} ({classical_score})",
            "details": "; ".join(reasons),
        },
        {
            "timestamp": now,
            "stage": "QUANTUM_ANALYSIS",
            "action": q_timeline_action,
            "details": q_timeline_details,
        },
    ]

    event_payload: Dict[str, Any] = {
        "event_id": event_id,
        "timestamp": now,
        "features": features,
        "classical_risk_score": classical_score,
        "quantum_status": quantum_status,
        "quantum_result": quantum_result,
        "final_risk": final_risk,
        "risk_level": risk_level,
        "reasons": reasons,
        "verification_status": "unverified",
        "defense_actions": [],
        "timeline": timeline,
    }

    return event_repository.create_event(event_payload)


def get_event(event_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve event by ID."""
    return event_repository.get_event_by_id(event_id)


def list_events(
    limit: int = 50,
    offset: int = 0,
    risk_level: Optional[str] = None,
    verification_status: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """List events with optional filtering."""
    return event_repository.list_events(
        limit=limit,
        offset=offset,
        risk_level=risk_level,
        verification_status=verification_status,
    )


def verify_event(event_id: str, req: EventVerifyRequest) -> Optional[Dict[str, Any]]:
    """
    Update event verification status and record audit timeline entry.
    Returns None if event_id does not exist.
    """
    event = event_repository.get_event_by_id(event_id)
    if not event:
        return None

    now = _generate_timestamp()
    timeline = list(event.get("timeline", []))
    timeline.append({
        "timestamp": now,
        "stage": "VERIFICATION",
        "action": f"Analyst updated status to '{req.verification_status}'",
        "details": req.notes or "Verification status modified by security analyst",
    })

    return event_repository.update_event_state(
        event_id=event_id,
        verification_status=req.verification_status,
        timeline=timeline,
    )


def respond_to_event(event_id: str, req: EventRespondRequest) -> Optional[Dict[str, Any]]:
    """
    Execute simulated defense response action and record audit timeline entry.
    SAFETY GUARANTEE: Response actions are strictly simulated and never affect real systems.
    Returns None if event_id does not exist.
    """
    event = event_repository.get_event_by_id(event_id)
    if not event:
        return None

    now = _generate_timestamp()
    target = req.target or event.get("features", {}).get("source_ip", "0.0.0.0")
    action_id = f"act_{uuid.uuid4().hex[:8]}"

    # Simulated action details
    action_record = {
        "action_id": action_id,
        "timestamp": now,
        "action_type": req.action,
        "target": target,
        "status": "SIMULATED_ENFORCED",
        "is_simulated": True,
        "details": (
            f"[SIMULATED DEFENSE] Action '{req.action}' successfully registered for target {target}. "
            "Safety sandbox active: no physical firewalls or network interfaces modified."
        ),
    }

    defense_actions = list(event.get("defense_actions", []))
    defense_actions.append(action_record)

    timeline = list(event.get("timeline", []))
    timeline.append({
        "timestamp": now,
        "stage": "RESPONSE",
        "action": f"Simulated defense executed: {req.action}",
        "details": f"Target: {target}. Simulated action ID: {action_id}",
    })

    return event_repository.update_event_state(
        event_id=event_id,
        defense_actions=defense_actions,
        timeline=timeline,
    )


def get_dashboard_summary() -> Dict[str, Any]:
    """Retrieve aggregated dashboard metrics."""
    return event_repository.get_dashboard_summary_data()
