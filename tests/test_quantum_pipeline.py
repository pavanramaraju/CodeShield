import math
import unittest
from unittest.mock import patch

from app.quantum.adapter import QuantumSimulationError
from app.schemas.event import EventSimulateRequest
from app.services import event_service
from app.storage.database import init_db
from tests.test_api import make_request


class TestQuantumPipelineIntegration(unittest.TestCase):
    """Integration tests for end-to-end quantum analysis within event processing and persistence."""

    def setUp(self):
        init_db()

    def test_integrated_quantum_analysis_success(self):
        """Simulating an event with valid telemetry executes quantum circuit and populates all quantum metrics."""
        req = EventSimulateRequest(scenario="ddos")
        event = event_service.simulate_event(req)

        self.assertEqual(event["quantum_status"], "completed")
        q_res = event["quantum_result"]
        self.assertIsNotNone(q_res)
        self.assertTrue(q_res["circuit_executed"])
        self.assertEqual(q_res["qubit_count"], 4)
        self.assertEqual(q_res["shots"], 1024)
        self.assertGreater(q_res["circuit_depth"], 0)
        self.assertEqual(len(q_res["encoded_features"]), 4)
        for f in q_res["encoded_features"]:
            self.assertGreaterEqual(f, 0.0)
            self.assertLessEqual(f, 1.0)

        # Verify measurement counts sum to total shots
        self.assertIsInstance(q_res["counts"], dict)
        self.assertEqual(sum(q_res["counts"].values()), 1024)

        # Verify statistic is bounded
        self.assertEqual(q_res["statistic_name"], "excited_state_ratio")
        self.assertGreaterEqual(q_res["quantum_measurement_statistic"], 0.0)
        self.assertLessEqual(q_res["quantum_measurement_statistic"], 1.0)

        # Check timeline stage
        quantum_stages = [t for t in event["timeline"] if t["stage"] == "QUANTUM_ANALYSIS"]
        self.assertEqual(len(quantum_stages), 1)
        self.assertIn("completed", quantum_stages[0]["details"])

    def test_quantum_event_persistence_in_sqlite(self):
        """Verifies that quantum metrics and measurement counts are preserved upon SQLite persistence and retrieval."""
        code, created_event = make_request("POST", "/api/events/simulate", {"scenario": "data_exfiltration"})
        self.assertEqual(code, 201)
        event_id = created_event["event_id"]

        # Retrieve through GET endpoint
        get_code, fetched_event = make_request("GET", f"/api/events/{event_id}")
        self.assertEqual(get_code, 200)

        self.assertEqual(fetched_event["event_id"], event_id)
        self.assertEqual(fetched_event["quantum_status"], "completed")
        self.assertTrue(fetched_event["quantum_result"]["circuit_executed"])
        self.assertEqual(
            fetched_event["quantum_result"]["counts"],
            created_event["quantum_result"]["counts"],
        )
        self.assertEqual(
            fetched_event["quantum_result"]["quantum_measurement_statistic"],
            created_event["quantum_result"]["quantum_measurement_statistic"],
        )

    def test_invalid_telemetry_normalization_failure(self):
        """Out-of-range telemetry gracefully marks quantum_status as 'failed' without crashing the API."""
        bad_payload = {
            "features": {
                "packet_rate": 99999.0,  # Exceeds allowable 5000.0 bound
                "failed_logins": 0,
                "payload_entropy": 4.0,
                "request_rate": 10.0,
            }
        }
        code, body = make_request("POST", "/api/events/simulate", bad_payload)
        self.assertEqual(code, 201)
        self.assertEqual(body["quantum_status"], "failed")
        self.assertFalse(body["quantum_result"]["circuit_executed"])
        self.assertIn("outside allowable range", body["quantum_result"]["error_message"])

        # Classical risk engine must still complete and determine risk
        self.assertGreater(body["classical_risk_score"], 0.0)
        self.assertEqual(body["final_risk"], body["classical_risk_score"])

    def test_simulator_failure_resilience(self):
        """Simulated backend failure or timeout does not crash the server and records a failed quantum status."""
        with patch(
            "app.services.event_service.execute_quantum_circuit",
            side_effect=QuantumSimulationError("Simulated backend QPU timeout"),
        ):
            req = EventSimulateRequest(scenario="normal")
            event = event_service.simulate_event(req)

            self.assertEqual(event["quantum_status"], "failed")
            self.assertFalse(event["quantum_result"]["circuit_executed"])
            self.assertIn("timeout", event["quantum_result"]["error_message"].lower())
            self.assertEqual(event["final_risk"], event["classical_risk_score"])

            # Timeline should record the failure
            quantum_stages = [t for t in event["timeline"] if t["stage"] == "QUANTUM_ANALYSIS"]
            self.assertEqual(len(quantum_stages), 1)
            self.assertIn("failed", quantum_stages[0]["action"].lower())


if __name__ == "__main__":
    unittest.main()
