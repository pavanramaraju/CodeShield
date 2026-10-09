import pytest

from app.schemas.event import EventSimulateRequest
from app.services import event_service
from app.storage.database import init_db
from tests.test_api import make_request

# Initialize database schema before running test suite
init_db()

# Test matrix for the five primary Q-SHIELD cybersecurity threat scenarios
SCENARIO_DETECTION_MATRIX = [
    (
        "normal",
        "LOW",
        0.05,
        ["baseline telemetry within expected operational thresholds"],
    ),
    (
        "ddos",
        "HIGH",
        0.70,
        [
            "severe volumetric flood detected",
            "high application request frequency",
        ],
    ),
    (
        "brute_force",
        "HIGH",
        0.50,
        [
            "elevated authentication failure count",
            "sensitive service port targeted (22)",
        ],
    ),
    (
        "data_exfiltration",
        "HIGH",
        0.50,
        [
            "high shannon entropy",
            "anomalous cryptographic handshake",
        ],
    ),
    (
        "port_scan",
        "MEDIUM",
        0.30,
        [
            "sensitive service port targeted (3389)",
            "high application request frequency",
        ],
    ),
]


@pytest.mark.parametrize(
    "scenario,expected_level,expected_score,expected_reason_substrings",
    SCENARIO_DETECTION_MATRIX,
)
def test_scenario_service_detection(
    scenario: str,
    expected_level: str,
    expected_score: float,
    expected_reason_substrings: list,
):
    """
    Test scenario detection at the service level:
    - Verifies event creation with all required telemetry.
    - Validates classical heuristic risk score and categorical risk level.
    - Asserts domain-specific reason strings are populated.
    - Confirms successful 4-qubit quantum simulation (completed status, 1024 shots).
    """
    req = EventSimulateRequest(scenario=scenario)
    event = event_service.simulate_event(req)

    # 1. Event creation checks
    assert event["event_id"].startswith("evt_")
    assert event["verification_status"] == "unverified"
    assert len(event["features"]) > 0

    # 2. Risk classification and fusion policy check
    assert event["risk_level"] == expected_level
    assert event["classical_risk_score"] == pytest.approx(expected_score, abs=0.01)
    assert event["final_risk"] == event["classical_risk_score"]

    # 3. Explanatory reason checks
    all_reasons = " ".join(event["reasons"]).lower()
    for expected_str in expected_reason_substrings:
        assert expected_str in all_reasons, (
            f"Expected substring '{expected_str}' not found in scenario '{scenario}' reasons: {event['reasons']}"
        )

    # 4. Quantum simulation execution checks
    assert event["quantum_status"] == "completed"
    q_result = event["quantum_result"]
    assert q_result is not None
    assert q_result["status"] == "completed"
    assert q_result["circuit_executed"] is True
    assert q_result["qubit_count"] == 4
    assert q_result["shots"] == 1024
    assert q_result["circuit_depth"] > 0
    assert len(q_result["encoded_features"]) == 4

    # Verify counts structure and total shots
    counts = q_result["counts"]
    assert isinstance(counts, dict)
    assert sum(counts.values()) == 1024
    assert all(len(b) == 4 and set(b).issubset({"0", "1"}) for b in counts.keys())

    # Verify quantum measurement statistic
    assert q_result["statistic_name"] == "excited_state_ratio"
    assert 0.0 <= q_result["quantum_measurement_statistic"] <= 1.0
    assert q_result["error_message"] is None

    # 5. Timeline audit stage verification
    stages = [entry["stage"] for entry in event["timeline"]]
    assert "INGESTION" in stages
    assert "CLASSICAL_ASSESSMENT" in stages
    assert "QUANTUM_ANALYSIS" in stages


@pytest.mark.parametrize(
    "scenario,expected_level,expected_score,expected_reason_substrings",
    SCENARIO_DETECTION_MATRIX,
)
def test_scenario_api_endpoint_and_persistence(
    scenario: str,
    expected_level: str,
    expected_score: float,
    expected_reason_substrings: list,
):
    """
    Test scenario detection end-to-end via the live HTTP API:
    - POST /api/events/simulate returns HTTP 201.
    - Confirms risk level, scores, and quantum_status.
    - Retrieves event via GET /api/events/{event_id} to verify SQLite persistence.
    """
    # 1. Simulate via HTTP POST
    code, created = make_request("POST", "/api/events/simulate", {"scenario": scenario})
    assert code == 201

    event_id = created["event_id"]
    assert created["risk_level"] == expected_level
    assert created["classical_risk_score"] == pytest.approx(expected_score, abs=0.01)
    assert created["quantum_status"] == "completed"
    assert created["quantum_result"]["circuit_executed"] is True

    # 2. Verify SQLite persistence via HTTP GET
    get_code, fetched = make_request("GET", f"/api/events/{event_id}")
    assert get_code == 200
    assert fetched["event_id"] == event_id
    assert fetched["risk_level"] == expected_level
    assert fetched["quantum_status"] == "completed"
    assert fetched["quantum_result"]["circuit_executed"] is True
    assert fetched["quantum_result"]["counts"] == created["quantum_result"]["counts"]
    assert (
        fetched["quantum_result"]["quantum_measurement_statistic"]
        == created["quantum_result"]["quantum_measurement_statistic"]
    )
