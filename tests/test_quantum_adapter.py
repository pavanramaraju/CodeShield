import math
import unittest
from app.quantum.adapter import (
    QuantumSimulationError,
    build_quantum_anomaly_circuit,
    execute_quantum_circuit,
    run_quantum_anomaly_circuit,
    validate_quantum_features,
)


class TestQuantumFeatureValidation(unittest.TestCase):
    """Unit tests verifying strict input validation for the 4-qubit quantum adapter."""

    def test_valid_normalized_features(self):
        """Standard valid inputs should parse cleanly into floats."""
        features = [0.12, 0.45, 0.78, 0.95]
        result = validate_quantum_features(features)
        self.assertEqual(len(result), 4)
        self.assertEqual(result, [0.12, 0.45, 0.78, 0.95])

    def test_valid_boundary_values(self):
        """Boundary inputs [0.0] and [1.0] should be accepted."""
        zeros = [0.0, 0.0, 0.0, 0.0]
        ones = [1.0, 1.0, 1.0, 1.0]
        self.assertEqual(validate_quantum_features(zeros), zeros)
        self.assertEqual(validate_quantum_features(ones), ones)

    def test_valid_integer_inputs_converted(self):
        """Integer 0 and 1 are valid numbers in range [0, 1] and convert to float."""
        result = validate_quantum_features([0, 1, 0.5, 1])
        self.assertEqual(result, [0.0, 1.0, 0.5, 1.0])

    def test_valid_tuple_input(self):
        """Tuples with 4 values should be supported."""
        result = validate_quantum_features((0.2, 0.4, 0.6, 0.8))
        self.assertEqual(result, [0.2, 0.4, 0.6, 0.8])

    def test_invalid_length_too_few(self):
        """Fewer than 4 features must raise ValueError."""
        with self.assertRaises(ValueError) as ctx:
            validate_quantum_features([0.1, 0.2, 0.3])
        self.assertIn("Expected exactly 4 features", str(ctx.exception))

    def test_invalid_length_too_many(self):
        """More than 4 features must raise ValueError."""
        with self.assertRaises(ValueError) as ctx:
            validate_quantum_features([0.1, 0.2, 0.3, 0.4, 0.5])
        self.assertIn("Expected exactly 4 features", str(ctx.exception))

    def test_invalid_none_input(self):
        """None input must raise ValueError."""
        with self.assertRaises(ValueError):
            validate_quantum_features(None)

    def test_invalid_out_of_bounds_negative(self):
        """Values below 0.0 must raise ValueError."""
        with self.assertRaises(ValueError) as ctx:
            validate_quantum_features([-0.05, 0.5, 0.5, 0.5])
        self.assertIn("outside valid normalized range", str(ctx.exception))

    def test_invalid_out_of_bounds_greater_than_one(self):
        """Values above 1.0 must raise ValueError."""
        with self.assertRaises(ValueError) as ctx:
            validate_quantum_features([0.5, 1.05, 0.5, 0.5])
        self.assertIn("outside valid normalized range", str(ctx.exception))

    def test_invalid_non_finite_nan(self):
        """NaN values must raise ValueError."""
        with self.assertRaises(ValueError) as ctx:
            validate_quantum_features([math.nan, 0.5, 0.5, 0.5])
        self.assertIn("must be finite numbers", str(ctx.exception))

    def test_invalid_non_finite_inf(self):
        """Infinite values must raise ValueError."""
        with self.assertRaises(ValueError) as ctx:
            validate_quantum_features([0.5, math.inf, 0.5, 0.5])
        self.assertIn("must be finite numbers", str(ctx.exception))

    def test_invalid_non_numeric_type(self):
        """String entries must raise TypeError."""
        with self.assertRaises(TypeError):
            validate_quantum_features(["invalid", 0.5, 0.5, 0.5])

    def test_invalid_boolean_type(self):
        """Boolean entries must raise TypeError."""
        with self.assertRaises(TypeError):
            validate_quantum_features([True, 0.5, 0.5, 0.5])


class TestQuantumCircuitAndSimulator(unittest.TestCase):
    """Unit tests verifying circuit construction, entanglement, and Qiskit simulation."""

    def test_circuit_architecture(self):
        """Verifies 4-qubit circuit structure, gate composition, and measurement register."""
        features = [0.25, 0.5, 0.75, 1.0]
        qc = build_quantum_anomaly_circuit(features)
        self.assertEqual(qc.num_qubits, 4)
        self.assertEqual(qc.num_clbits, 4)
        self.assertGreater(qc.depth(), 0)

        # Check gate composition includes Hadamard, RY, RZ, CX, and Measure
        gate_names = [inst.operation.name for inst in qc.data]
        self.assertIn("h", gate_names)
        self.assertIn("ry", gate_names)
        self.assertIn("cx", gate_names)
        self.assertIn("rz", gate_names)
        self.assertIn("measure", gate_names)

    def test_simulation_execution_and_output(self):
        """Tests that local simulator runs and returns counts with valid statistic."""
        features = [0.2, 0.4, 0.6, 0.8]
        shots = 500
        result = execute_quantum_circuit(features, shots=shots)

        self.assertEqual(result.status, "SUCCESS")
        self.assertEqual(result.shots, shots)
        self.assertEqual(result.qubit_count, 4)
        self.assertEqual(result.encoded_features, features)
        self.assertIsInstance(result.counts, dict)
        self.assertGreater(len(result.counts), 0)

        # Verify all keys are 4-bit strings
        total_counts = 0
        for bitstring, count in result.counts.items():
            self.assertEqual(len(bitstring), 4)
            self.assertTrue(all(c in "01" for c in bitstring))
            total_counts += count
        self.assertEqual(total_counts, shots)

        # Verify clearly labelled measurement statistic
        self.assertEqual(result.statistic_name, "excited_state_ratio")
        self.assertGreaterEqual(result.quantum_measurement_statistic, 0.0)
        self.assertLessEqual(result.quantum_measurement_statistic, 1.0)
        self.assertIsNotNone(result.statistic_description)
        self.assertIn("No quantum computational advantage claimed", result.disclaimer)

    def test_safe_wrapper_resilience(self):
        """Verifies run_quantum_anomaly_circuit handles bad inputs without raising exceptions."""
        # 1. Invalid input should return status: 'ERROR' without crashing
        bad_result = run_quantum_anomaly_circuit([1.5, 0.2, 0.3])
        self.assertEqual(bad_result["status"], "ERROR")
        self.assertEqual(bad_result["quantum_measurement_statistic"], 0.0)
        self.assertIsNotNone(bad_result["error_message"])

        # 2. NaN input should return status: 'ERROR' without crashing
        nan_result = run_quantum_anomaly_circuit([math.nan, 0.2, 0.3, 0.4])
        self.assertEqual(nan_result["status"], "ERROR")
        self.assertIn("finite", nan_result["error_message"].lower())

        # 3. Valid input should succeed cleanly
        good_result = run_quantum_anomaly_circuit([0.1, 0.2, 0.3, 0.4], shots=256)
        self.assertEqual(good_result["status"], "SUCCESS")
        self.assertEqual(sum(good_result["counts"].values()), 256)


if __name__ == "__main__":
    unittest.main()
