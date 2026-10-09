import math
import unittest
from app.quantum.normalizer import (
    FeatureNormalizationError,
    normalize_cyber_features,
)


class TestFeatureNormalization(unittest.TestCase):
    """Unit tests for the cybersecurity telemetry normalizer."""

    def test_normal_typical_values(self):
        """Standard valid telemetry maps cleanly into floats in [0, 1]."""
        raw = {
            "packet_rate": 2500.0,   # 2500 / 5000 = 0.5
            "failed_logins": 5,      # 5 / 20 = 0.25
            "payload_entropy": 6.0,  # 6.0 / 8.0 = 0.75
            "request_rate": 50.0,    # 50 / 500 = 0.1
        }
        norm = normalize_cyber_features(raw)
        self.assertEqual(len(norm), 4)
        self.assertAlmostEqual(norm[0], 0.5)
        self.assertAlmostEqual(norm[1], 0.25)
        self.assertAlmostEqual(norm[2], 0.75)
        self.assertAlmostEqual(norm[3], 0.1)

    def test_lower_boundary_values(self):
        """Minimum allowable telemetry maps to exactly 0.0 across all 4 qubits."""
        raw = {
            "packet_rate": 0.0,
            "failed_logins": 0,
            "payload_entropy": 0.0,
            "request_rate": 0.0,
        }
        norm = normalize_cyber_features(raw)
        self.assertEqual(norm, [0.0, 0.0, 0.0, 0.0])

    def test_upper_boundary_values(self):
        """Maximum allowable telemetry maps to exactly 1.0 across all 4 qubits."""
        raw = {
            "packet_rate": 5000.0,
            "failed_logins": 20,
            "payload_entropy": 8.0,
            "request_rate": 500.0,
        }
        norm = normalize_cyber_features(raw)
        self.assertEqual(norm, [1.0, 1.0, 1.0, 1.0])

    def test_missing_features_raises_error(self):
        """Missing any required feature must raise FeatureNormalizationError."""
        incomplete = {
            "packet_rate": 100.0,
            "failed_logins": 2,
            # missing payload_entropy
            "request_rate": 15.0,
        }
        with self.assertRaises(FeatureNormalizationError) as ctx:
            normalize_cyber_features(incomplete)
        self.assertIn("payload_entropy", str(ctx.exception))

    def test_none_value_raises_error(self):
        """None value for a feature must raise FeatureNormalizationError."""
        bad_raw = {
            "packet_rate": 100.0,
            "failed_logins": None,
            "payload_entropy": 4.0,
            "request_rate": 15.0,
        }
        with self.assertRaises(FeatureNormalizationError) as ctx:
            normalize_cyber_features(bad_raw)
        self.assertIn("cannot be None", str(ctx.exception))

    def test_invalid_types_raise_error(self):
        """Non-numeric types (strings, booleans, dicts) must raise FeatureNormalizationError."""
        string_type = {
            "packet_rate": "high",
            "failed_logins": 0,
            "payload_entropy": 4.0,
            "request_rate": 15.0,
        }
        with self.assertRaises(FeatureNormalizationError) as ctx:
            normalize_cyber_features(string_type)
        self.assertIn("must be numeric", str(ctx.exception))

        bool_type = {
            "packet_rate": 100.0,
            "failed_logins": True,
            "payload_entropy": 4.0,
            "request_rate": 15.0,
        }
        with self.assertRaises(FeatureNormalizationError) as ctx:
            normalize_cyber_features(bool_type)
        self.assertIn("cannot be a boolean", str(ctx.exception))

    def test_non_finite_values_raise_error(self):
        """NaN and Inf values must raise FeatureNormalizationError."""
        nan_val = {
            "packet_rate": 100.0,
            "failed_logins": 0,
            "payload_entropy": math.nan,
            "request_rate": 15.0,
        }
        with self.assertRaises(FeatureNormalizationError) as ctx:
            normalize_cyber_features(nan_val)
        self.assertIn("finite", str(ctx.exception).lower())

        inf_val = {
            "packet_rate": math.inf,
            "failed_logins": 0,
            "payload_entropy": 4.0,
            "request_rate": 15.0,
        }
        with self.assertRaises(FeatureNormalizationError) as ctx:
            normalize_cyber_features(inf_val)
        self.assertIn("finite", str(ctx.exception).lower())

    def test_extreme_and_out_of_range_values_rejected(self):
        """Values exceeding maximum or minimum bounds must be explicitly rejected (no silent clamping)."""
        # Negative packet rate
        with self.assertRaises(FeatureNormalizationError) as ctx:
            normalize_cyber_features({
                "packet_rate": -1.0,
                "failed_logins": 0,
                "payload_entropy": 4.0,
                "request_rate": 10.0,
            })
        self.assertIn("outside allowable range", str(ctx.exception))

        # Packet rate exceeding maximum 5000
        with self.assertRaises(FeatureNormalizationError) as ctx:
            normalize_cyber_features({
                "packet_rate": 9999.0,
                "failed_logins": 0,
                "payload_entropy": 4.0,
                "request_rate": 10.0,
            })
        self.assertIn("outside allowable range", str(ctx.exception))

        # Shannon entropy exceeding theoretical maximum 8.0
        with self.assertRaises(FeatureNormalizationError) as ctx:
            normalize_cyber_features({
                "packet_rate": 100.0,
                "failed_logins": 0,
                "payload_entropy": 8.5,
                "request_rate": 10.0,
            })
        self.assertIn("outside allowable range", str(ctx.exception))

        # Failed logins exceeding 20
        with self.assertRaises(FeatureNormalizationError) as ctx:
            normalize_cyber_features({
                "packet_rate": 100.0,
                "failed_logins": 25,
                "payload_entropy": 4.0,
                "request_rate": 10.0,
            })
        self.assertIn("outside allowable range", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
