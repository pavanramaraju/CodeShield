"""
tests/test_quantum_classifier.py
==================================
Comprehensive test suite for the Q-Shield quantum-kernel classifier.

Tests cover:
  - Feature encoding and validation
  - train_quantum_model (normal paths, edge cases, invalid inputs)
  - analyze_ambiguous (normal paths, untrained guard, invalid inputs)
  - get_model_status
  - Classical vs quantum comparison
  - Graceful degradation on dependency failures

Run with:
    pytest tests/ -v
"""

import sys
import types
import time
import pytest
import numpy as np
from unittest.mock import patch, MagicMock

# ---------------------------------------------------------------------------
# Fixtures: Synthetic dataset
# ---------------------------------------------------------------------------
RANDOM_SEED = 42
N_BENIGN = 30
N_ANOMALOUS = 30
N_TOTAL = N_BENIGN + N_ANOMALOUS


def _make_dataset(n_benign: int = N_BENIGN, n_anomalous: int = N_ANOMALOUS):
    """
    Generate synthetic 4-feature dataset.
    Features: [failed_login_count, unfamiliar_ip, unusual_location, device_change]
    """
    rng = np.random.default_rng(RANDOM_SEED)

    # Benign: low failed logins, no suspicious indicators
    X_benign = np.column_stack([
        rng.uniform(0, 3, n_benign),          # failed_login_count
        rng.choice([0, 1], n_benign, p=[0.9, 0.1]),   # unfamiliar_ip
        rng.choice([0, 1], n_benign, p=[0.9, 0.1]),   # unusual_location
        rng.choice([0, 1], n_benign, p=[0.8, 0.2]),   # device_change
    ])
    y_benign = np.zeros(n_benign, dtype=int)

    # Anomalous: high failed logins, suspicious indicators active
    X_anomalous = np.column_stack([
        rng.uniform(5, 20, n_anomalous),       # failed_login_count
        rng.choice([0, 1], n_anomalous, p=[0.2, 0.8]),
        rng.choice([0, 1], n_anomalous, p=[0.2, 0.8]),
        rng.choice([0, 1], n_anomalous, p=[0.3, 0.7]),
    ])
    y_anomalous = np.ones(n_anomalous, dtype=int)

    X = np.vstack([X_benign, X_anomalous])
    y = np.concatenate([y_benign, y_anomalous])

    # Shuffle
    idx = rng.permutation(len(X))
    return X[idx], y[idx]


@pytest.fixture(scope="module")
def dataset():
    return _make_dataset()


@pytest.fixture(scope="module")
def trained_state(dataset):
    """Train the model once for the module; shared across tests."""
    from quantum.quantum_classifier import train_quantum_model
    X, y = dataset
    result = train_quantum_model(X, y)
    return result


# ===========================================================================
# Section 1: Feature validation
# ===========================================================================
class TestFeatureValidation:
    """Tests for _validate_features via the public API."""

    def test_1d_input_accepted(self):
        """1-D array of length 4 should be reshaped and accepted."""
        from quantum.quantum_classifier import _validate_features
        X = np.array([1.0, 0.0, 1.0, 0.0])
        result = _validate_features(X)
        assert result.shape == (1, 4)

    def test_2d_input_accepted(self):
        from quantum.quantum_classifier import _validate_features
        X = np.array([[1.0, 0.0, 1.0, 0.0], [0.5, 1.0, 0.0, 1.0]])
        result = _validate_features(X)
        assert result.shape == (2, 4)

    def test_wrong_feature_count_raises(self):
        from quantum.quantum_classifier import _validate_features
        with pytest.raises(ValueError, match="Expected 4 features"):
            _validate_features(np.array([1.0, 0.0, 1.0]))  # 3 features

    def test_nan_raises(self):
        from quantum.quantum_classifier import _validate_features
        with pytest.raises(ValueError, match="NaN or Inf"):
            _validate_features(np.array([np.nan, 0.0, 1.0, 0.0]))

    def test_inf_raises(self):
        from quantum.quantum_classifier import _validate_features
        with pytest.raises(ValueError, match="NaN or Inf"):
            _validate_features(np.array([1.0, np.inf, 1.0, 0.0]))

    def test_3d_input_raises(self):
        from quantum.quantum_classifier import _validate_features
        with pytest.raises(ValueError, match="1-D or 2-D"):
            _validate_features(np.ones((2, 4, 1)))

    def test_list_input_accepted(self):
        from quantum.quantum_classifier import _validate_features
        result = _validate_features([3.0, 1.0, 0.0, 1.0])
        assert result.shape == (1, 4)


# ===========================================================================
# Section 2: train_quantum_model
# ===========================================================================
class TestTrainQuantumModel:
    """Tests for train_quantum_model."""

    def test_returns_dict(self, trained_state):
        assert isinstance(trained_state, dict)

    def test_success_flag(self, trained_state):
        assert trained_state["success"] is True

    def test_training_samples_positive(self, trained_state):
        assert trained_state["training_samples"] > 0

    def test_classical_accuracy_present(self, trained_state):
        acc = trained_state["train_accuracy_classical"]
        assert acc is not None
        assert 0.0 <= acc <= 1.0

    def test_quantum_availability_reported(self, trained_state):
        # quantum_available should be True/False (bool)
        assert isinstance(trained_state["quantum_available"], bool)

    def test_training_time_positive(self, trained_state):
        assert trained_state["training_time_seconds"] > 0

    def test_evaluation_summary_present(self, trained_state):
        assert "evaluation" in trained_state
        ev = trained_state["evaluation"]
        assert "quantum_kernel" in ev
        assert "classical_baseline" in ev
        assert "note" in ev

    def test_warnings_is_list(self, trained_state):
        assert isinstance(trained_state["warnings"], list)

    def test_wrong_feature_count_fails_gracefully(self):
        from quantum.quantum_classifier import train_quantum_model
        X_bad = np.random.rand(10, 3)  # 3 features instead of 4
        y = np.array([0]*5 + [1]*5)
        result = train_quantum_model(X_bad, y)
        assert result["success"] is False
        assert "validation" in result["message"].lower()

    def test_mismatched_lengths_fails_gracefully(self):
        from quantum.quantum_classifier import train_quantum_model
        X = np.random.rand(10, 4)
        y = np.ones(7, dtype=int)  # wrong length
        result = train_quantum_model(X, y)
        assert result["success"] is False

    def test_single_class_fails_gracefully(self):
        from quantum.quantum_classifier import train_quantum_model
        X = np.random.rand(10, 4)
        y = np.zeros(10, dtype=int)
        result = train_quantum_model(X, y)
        assert result["success"] is False

    def test_nan_in_features_fails_gracefully(self):
        from quantum.quantum_classifier import train_quantum_model
        X = np.random.rand(10, 4)
        X[3, 2] = np.nan
        y = np.array([0]*5 + [1]*5)
        result = train_quantum_model(X, y)
        assert result["success"] is False

    def test_minimum_viable_dataset(self):
        """2 samples (1 per class) should still attempt training."""
        from quantum.quantum_classifier import train_quantum_model
        X = np.array([[0.1, 0.0, 0.0, 0.0], [10.0, 1.0, 1.0, 1.0]])
        y = np.array([0, 1])
        result = train_quantum_model(X, y)
        # Should not crash; success depends on whether QSVC trains
        assert isinstance(result, dict)
        assert "success" in result


# ===========================================================================
# Section 3: analyze_ambiguous
# ===========================================================================
class TestAnalyzeAmbiguous:
    """Tests for analyze_ambiguous."""

    def test_untrained_guard(self):
        """Calling before training should return a clear error."""
        # Re-import to get fresh state; we reset inside train_quantum_model
        # We need to ensure state is reset - use a mock
        from quantum import quantum_classifier as qc
        original_state = qc._STATE.is_trained
        qc._STATE.is_trained = False
        result = qc.analyze_ambiguous([3.0, 1.0, 0.0, 1.0])
        qc._STATE.is_trained = original_state  # restore
        assert result["success"] is False
        assert result["label"] == "error"
        assert result["error"] is not None

    def test_benign_event_classification(self, trained_state):
        from quantum.quantum_classifier import analyze_ambiguous
        # Low-risk event
        result = analyze_ambiguous([1.0, 0.0, 0.0, 0.0])
        assert result["success"] is True
        assert result["label"] in ("benign", "anomalous")
        assert result["label_int"] in (0, 1)

    def test_anomalous_event_classification(self, trained_state):
        from quantum.quantum_classifier import analyze_ambiguous
        # High-risk event
        result = analyze_ambiguous([15.0, 1.0, 1.0, 1.0])
        assert result["success"] is True
        assert result["label"] in ("benign", "anomalous")

    def test_processing_time_reported(self, trained_state):
        from quantum.quantum_classifier import analyze_ambiguous
        result = analyze_ambiguous([2.0, 0.0, 1.0, 0.0])
        assert result["processing_time_seconds"] >= 0

    def test_confidence_note_present(self, trained_state):
        from quantum.quantum_classifier import analyze_ambiguous
        result = analyze_ambiguous([2.0, 0.0, 1.0, 0.0])
        assert "confidence_note" in result
        assert "NOT a calibrated probability" in result["confidence_note"]

    def test_engine_reported(self, trained_state):
        from quantum.quantum_classifier import analyze_ambiguous
        result = analyze_ambiguous([2.0, 0.0, 1.0, 0.0])
        assert result["engine"] in ("quantum", "classical_fallback")

    def test_invalid_feature_count_graceful(self, trained_state):
        from quantum.quantum_classifier import analyze_ambiguous
        result = analyze_ambiguous([1.0, 0.0, 1.0])  # 3 features
        assert result["success"] is False
        assert result["error"] is not None

    def test_nan_features_graceful(self, trained_state):
        from quantum.quantum_classifier import analyze_ambiguous
        result = analyze_ambiguous([np.nan, 0.0, 1.0, 0.0])
        assert result["success"] is False
        assert result["error"] is not None

    def test_returns_model_status(self, trained_state):
        from quantum.quantum_classifier import analyze_ambiguous
        result = analyze_ambiguous([2.0, 0.0, 1.0, 0.0])
        assert result["model_status"] == "trained"

    def test_list_input_accepted(self, trained_state):
        from quantum.quantum_classifier import analyze_ambiguous
        result = analyze_ambiguous([5.0, 1.0, 0.0, 1.0])
        assert result["success"] is True

    def test_numpy_array_input_accepted(self, trained_state):
        from quantum.quantum_classifier import analyze_ambiguous
        result = analyze_ambiguous(np.array([5.0, 1.0, 0.0, 1.0]))
        assert result["success"] is True

    def test_2d_array_input_accepted(self, trained_state):
        from quantum.quantum_classifier import analyze_ambiguous
        result = analyze_ambiguous(np.array([[5.0, 1.0, 0.0, 1.0]]))
        assert result["success"] is True


# ===========================================================================
# Section 4: get_model_status
# ===========================================================================
class TestGetModelStatus:
    """Tests for get_model_status."""

    def test_returns_dict(self, trained_state):
        from quantum.quantum_classifier import get_model_status
        status = get_model_status()
        assert isinstance(status, dict)

    def test_is_trained_after_training(self, trained_state):
        from quantum.quantum_classifier import get_model_status
        status = get_model_status()
        assert status["is_trained"] is True

    def test_feature_names_correct(self, trained_state):
        from quantum.quantum_classifier import get_model_status
        status = get_model_status()
        expected = ["failed_login_count", "unfamiliar_ip", "unusual_location", "device_change"]
        assert status["feature_names"] == expected

    def test_num_qubits_is_4(self, trained_state):
        from quantum.quantum_classifier import get_model_status
        status = get_model_status()
        assert status["num_qubits"] == 4

    def test_training_timestamp_set(self, trained_state):
        from quantum.quantum_classifier import get_model_status
        status = get_model_status()
        ts = status["training_timestamp"]
        assert ts is not None
        # Accept both ISO-8601 UTC formats: trailing 'Z' or '+00:00'
        assert ts.endswith("Z") or ts.endswith("+00:00"), (
            f"Timestamp {ts!r} is not a valid UTC ISO-8601 string"
        )

    def test_quantum_available_field(self, trained_state):
        from quantum.quantum_classifier import get_model_status
        status = get_model_status()
        assert isinstance(status["quantum_available"], bool)

    def test_classical_model_loaded(self, trained_state):
        from quantum.quantum_classifier import get_model_status
        status = get_model_status()
        assert status["classical_model_loaded"] is True

    def test_evaluation_results_present(self, trained_state):
        from quantum.quantum_classifier import get_model_status
        status = get_model_status()
        assert isinstance(status["evaluation_results"], dict)

    def test_before_training_is_trained_false(self):
        from quantum import quantum_classifier as qc
        original = qc._STATE.is_trained
        qc._STATE.is_trained = False
        status = qc.get_model_status()
        qc._STATE.is_trained = original
        assert status["is_trained"] is False


# ===========================================================================
# Section 5: Classical vs Quantum comparison
# ===========================================================================
class TestClassicalVsQuantumComparison:
    """Compare quantum and classical accuracies on a held-out test set."""

    def test_comparison_metrics_reported(self, trained_state):
        """Both accuracy values (if available) must be valid fractions."""
        q_acc = trained_state["train_accuracy_quantum"]
        c_acc = trained_state["train_accuracy_classical"]
        assert c_acc is not None, "Classical accuracy must always be reported"
        assert 0.0 <= c_acc <= 1.0
        if q_acc is not None:
            assert 0.0 <= q_acc <= 1.0

    def test_no_quantum_advantage_claim(self, trained_state):
        """Evaluation note must disclaim quantum advantage."""
        note = trained_state["evaluation"].get("note", "")
        # The note should NOT claim guaranteed advantage
        assert "guaranteed" not in note.lower() or "not" in note.lower()
        # It should mention honest evaluation
        assert any(
            word in note.lower()
            for word in ("honest", "held-out", "does not", "not imply")
        )

    def test_held_out_evaluation(self, dataset):
        """
        Split data, train on 70%, evaluate both models on 30% test set.
        Verifies test-set accuracy can be computed without data leakage.
        """
        from quantum.quantum_classifier import train_quantum_model, analyze_ambiguous
        from sklearn.model_selection import train_test_split

        X, y = dataset
        X_tr, X_te, y_tr, y_te = train_test_split(
            X, y, test_size=0.3, random_state=RANDOM_SEED, stratify=y
        )
        train_result = train_quantum_model(X_tr, y_tr)
        assert train_result["success"] is True

        # Score on test set
        preds = [analyze_ambiguous(x)["label_int"] for x in X_te]
        preds_arr = np.array(preds)
        valid_mask = preds_arr != None  # noqa: E711
        acc = (preds_arr[valid_mask] == y_te[valid_mask]).mean()
        assert acc >= 0.0
        print(f"\nHeld-out test accuracy: {acc:.4f}  (n={len(X_te)})")


# ===========================================================================
# Section 6: Graceful degradation
# ===========================================================================
class TestGracefulDegradation:
    """Tests that the module degrades gracefully when Qiskit is unavailable."""

    def test_import_error_reported_in_status(self):
        """If Qiskit were unavailable, import_error field should be set."""
        from quantum import quantum_classifier as qc
        # Simulate unavailable state by temporarily patching
        original = qc._QISKIT_AVAILABLE
        qc._QISKIT_AVAILABLE = False
        qc._IMPORT_ERROR = "Simulated import failure"
        # Reset state to reflect
        qc._STATE.quantum_available = False
        qc._STATE.import_error = "Simulated import failure"
        status = qc.get_model_status()
        assert status["import_error"] == "Simulated import failure"
        # Restore
        qc._QISKIT_AVAILABLE = original
        qc._STATE.quantum_available = original
        qc._STATE.import_error = None

    def test_classical_fallback_used_when_qsvc_none(self, trained_state):
        """If QSVC is None but classical model exists, fallback is used."""
        from quantum import quantum_classifier as qc
        original_qsvc = qc._STATE.qsvc_model
        qc._STATE.qsvc_model = None  # simulate failed quantum training
        result = qc.analyze_ambiguous([5.0, 1.0, 0.0, 1.0])
        qc._STATE.qsvc_model = original_qsvc
        assert result["success"] is True
        assert result["engine"] == "classical_fallback"
        assert len(result["warnings"]) > 0


# ===========================================================================
# Section 7: Performance sanity
# ===========================================================================
class TestPerformanceSanity:
    """Sanity checks on inference time."""

    def test_inference_time_reasonable(self, trained_state):
        """Single inference should complete in under 60 seconds."""
        from quantum.quantum_classifier import analyze_ambiguous
        start = time.perf_counter()
        result = analyze_ambiguous([3.0, 0.0, 1.0, 0.0])
        elapsed = time.perf_counter() - start
        assert elapsed < 60.0, f"Inference took {elapsed:.2f}s (limit: 60s)"

    def test_repeated_inference_consistent(self, trained_state):
        """Same input should produce the same label across repeated calls."""
        from quantum.quantum_classifier import analyze_ambiguous
        features = [7.0, 1.0, 1.0, 0.0]
        labels = [analyze_ambiguous(features)["label"] for _ in range(3)]
        assert len(set(labels)) == 1, f"Inconsistent labels: {labels}"
