import json
import os
import unittest
import urllib.error
import urllib.request
from typing import Any, Dict

from app.schemas.event import EventRespondRequest, EventSimulateRequest, EventVerifyRequest
from app.services import event_service
from app.storage.database import init_db

BASE_URL = os.getenv("QSHIELD_API_URL", "http://127.0.0.1:8000")


def make_request(method: str, path: str, data: Dict[str, Any] = None) -> Tuple_Response:
    """Helper to perform HTTP requests using standard library urllib."""
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")

    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None

    try:
        with urllib.request.urlopen(req, data=encoded_data, timeout=5) as response:
            status_code = response.getcode()
            body = json.loads(response.read().decode("utf-8"))
            return status_code, body
    except urllib.error.HTTPError as e:
        status_code = e.code
        try:
            body = json.loads(e.read().decode("utf-8"))
        except Exception:
            body = {"detail": str(e)}
        return status_code, body


Tuple_Response = tuple[int, Dict[str, Any]]


class TestEventServiceUnit(unittest.TestCase):
    """Unit tests for business logic and classical risk engine."""

    def setUp(self):
        init_db()

    def test_classical_risk_heuristics_high_traffic(self):
        """Volumetric packet flood should yield HIGH or CRITICAL score."""
        features = {
            "packet_rate": 3000.0,
            "failed_logins": 0,
            "payload_entropy": 4.0,
            "port": 80,
            "request_rate": 10.0,
            "encryption_anomalies": False,
        }
        score, level, reasons = event_service.assess_classical_risk(features)
        self.assertGreaterEqual(score, 0.40)
        self.assertIn(level, ["HIGH", "CRITICAL"])
        self.assertTrue(any("volumetric flood" in r.lower() for r in reasons))

    def test_classical_risk_heuristics_normal(self):
        """Normal traffic should produce LOW risk score."""
        features = {
            "packet_rate": 20.0,
            "failed_logins": 0,
            "payload_entropy": 3.0,
            "port": 443,
            "request_rate": 5.0,
            "encryption_anomalies": False,
        }
        score, level, reasons = event_service.assess_classical_risk(features)
        self.assertLess(score, 0.25)
        self.assertEqual(level, "LOW")

    def test_simulation_generates_required_fields(self):
        """Simulation must generate all 12 required event fields."""
        req = EventSimulateRequest(scenario="brute_force")
        event = event_service.simulate_event(req)

        expected_fields = [
            "event_id",
            "timestamp",
            "features",
            "classical_risk_score",
            "quantum_status",
            "quantum_result",
            "final_risk",
            "risk_level",
            "reasons",
            "verification_status",
            "defense_actions",
            "timeline",
        ]
        for field in expected_fields:
            self.assertIn(field, event, f"Missing required field: {field}")

        self.assertEqual(event["quantum_status"], "completed")
        self.assertTrue(event["quantum_result"]["circuit_executed"])
        self.assertEqual(event["verification_status"], "unverified")


class TestLiveApiEndpoints(unittest.TestCase):
    """Integration tests executing against the live FastAPI Uvicorn server."""

    def test_01_health_endpoint(self):
        """Preserved GET /api/health returns healthy status."""
        code, body = make_request("GET", "/api/health")
        self.assertEqual(code, 200)
        self.assertEqual(body.get("status"), "healthy")
        self.assertEqual(body.get("service"), "Q-SHIELD Backend")

    def test_02_simulate_event(self):
        """POST /api/events/simulate creates a new cyber anomaly event with integrated quantum execution."""
        payload = {"scenario": "brute_force"}
        code, body = make_request("POST", "/api/events/simulate", payload)
        self.assertEqual(code, 201)
        self.assertIn("event_id", body)
        self.assertEqual(body["quantum_status"], "completed")
        self.assertTrue(body["quantum_result"]["circuit_executed"])
        self.assertGreater(len(body["quantum_result"]["counts"]), 0)
        self.assertEqual(body["verification_status"], "unverified")

        # Save event_id for subsequent tests
        TestLiveApiEndpoints.test_event_id = body["event_id"]

    def test_03_get_event_by_id(self):
        """GET /api/events/{event_id} retrieves specific event details."""
        event_id = getattr(TestLiveApiEndpoints, "test_event_id", None)
        self.assertIsNotNone(event_id, "No event_id from simulation")

        code, body = make_request("GET", f"/api/events/{event_id}")
        self.assertEqual(code, 200)
        self.assertEqual(body["event_id"], event_id)

    def test_04_get_event_not_found(self):
        """GET /api/events/{invalid_id} returns 404."""
        code, body = make_request("GET", "/api/events/non_existent_event_9999")
        self.assertEqual(code, 404)
        self.assertIn("detail", body)

    def test_05_list_events(self):
        """GET /api/events lists recorded events with filtering support."""
        code, body = make_request("GET", "/api/events?limit=10")
        self.assertEqual(code, 200)
        self.assertIsInstance(body, list)
        self.assertGreaterEqual(len(body), 1)

    def test_06_verify_event(self):
        """POST /api/events/{event_id}/verify updates status and audit timeline."""
        event_id = getattr(TestLiveApiEndpoints, "test_event_id", None)
        self.assertIsNotNone(event_id)

        payload = {
            "verification_status": "flagged",
            "notes": "Analyst confirmed suspicious brute force pattern.",
        }
        code, body = make_request("POST", f"/api/events/{event_id}/verify", payload)
        self.assertEqual(code, 200)
        self.assertEqual(body["verification_status"], "flagged")
        # Check timeline audit trail
        last_timeline = body["timeline"][-1]
        self.assertEqual(last_timeline["stage"], "VERIFICATION")
        self.assertIn("flagged", last_timeline["action"])

    def test_07_respond_event(self):
        """POST /api/events/{event_id}/respond creates simulated defense action."""
        event_id = getattr(TestLiveApiEndpoints, "test_event_id", None)
        self.assertIsNotNone(event_id)

        payload = {
            "action": "isolate_host",
            "target": "198.51.100.5",
        }
        code, body = make_request("POST", f"/api/events/{event_id}/respond", payload)
        self.assertEqual(code, 200)
        self.assertGreaterEqual(len(body["defense_actions"]), 1)
        action = body["defense_actions"][-1]
        self.assertEqual(action["action_type"], "isolate_host")
        self.assertTrue(action["is_simulated"], "Safety requirement: must be simulated")

        # Check timeline audit trail
        last_timeline = body["timeline"][-1]
        self.assertEqual(last_timeline["stage"], "RESPONSE")

    def test_08_dashboard_summary(self):
        """GET /api/dashboard/summary returns aggregated analytics."""
        code, body = make_request("GET", "/api/dashboard/summary")
        self.assertEqual(code, 200)
        self.assertIn("total_events", body)
        self.assertIn("risk_distribution", body)
        self.assertIn("verification_distribution", body)
        self.assertIn("average_risk_score", body)
        self.assertIn("quantum_pending_count", body)
        self.assertIn("simulated_actions_count", body)
        self.assertIn("recent_events", body)
        self.assertGreaterEqual(body["total_events"], 1)


if __name__ == "__main__":
    unittest.main()
