"""
quantum_classifier.py
=====================
Q-Shield Quantum-Kernel Anomaly Detector
-----------------------------------------
Implements a four-qubit ZZFeatureMap -> FidelityQuantumKernel -> QSVC pipeline
for cyber-event anomaly detection inside the CodeShield platform.

Agreed feature order (4 features, matching classical ML developer contract):
    [0] failed_login_count      - normalised count of failed auth attempts
    [1] unfamiliar_ip           - binary indicator (0 / 1)
    [2] unusual_location        - binary indicator (0 / 1)
    [3] device_change           - binary indicator (0 / 1)

Public API
----------
    train_quantum_model(X_train, y_train) -> dict
    analyze_ambiguous(event_features)     -> dict
    get_model_status()                    -> dict
"""

from __future__ import annotations

import logging
import time
import warnings
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
import datetime

import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy imports - gracefully degrade if Qiskit deps are missing
# ---------------------------------------------------------------------------
_QISKIT_AVAILABLE = False
_IMPORT_ERROR: Optional[str] = None

try:
    from qiskit.circuit.library import ZZFeatureMap
    from qiskit.primitives import StatevectorSampler
    from qiskit_machine_learning.state_fidelities import ComputeUncompute
    from qiskit_machine_learning.kernels import FidelityQuantumKernel
    from qiskit_machine_learning.algorithms import QSVC
    _QISKIT_AVAILABLE = True
except ImportError as exc:
    _IMPORT_ERROR = str(exc)
    logger.warning("Qiskit ML not available - quantum inference disabled: %s", exc)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
NUM_QUBITS = 4
FEATURE_REPS = 2
FEATURE_NAMES = [
    "failed_login_count",
    "unfamiliar_ip",
    "unusual_location",
    "device_change",
]
LABEL_MAP = {0: "benign", 1: "anomalous"}
MAX_TRAIN_SAMPLES = 150
MAX_KERNEL_EVAL_SAMPLES = 50


# ---------------------------------------------------------------------------
# Module-level state
# ---------------------------------------------------------------------------
@dataclass
class _ModelState:
    is_trained: bool = False
    quantum_available: bool = _QISKIT_AVAILABLE
    import_error: Optional[str] = _IMPORT_ERROR
    training_timestamp: Optional[str] = None
    training_samples: int = 0
    feature_names: List[str] = field(default_factory=lambda: FEATURE_NAMES.copy())
    num_qubits: int = NUM_QUBITS
    feature_map_reps: int = FEATURE_REPS
    qsvc_model: Any = None
    classical_baseline: Any = None
    scaler: Optional[StandardScaler] = None
    X_train_scaled: Optional[np.ndarray] = None
    y_train: Optional[np.ndarray] = None
    train_accuracy_quantum: Optional[float] = None
    train_accuracy_classical: Optional[float] = None
    evaluation_results: Dict[str, Any] = field(default_factory=dict)
    backend_name: str = "statevector_simulator"
    warnings: List[str] = field(default_factory=list)


_STATE = _ModelState()


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
def _validate_features(X: np.ndarray) -> np.ndarray:
    X = np.asarray(X, dtype=float)
    if X.ndim == 1:
        X = X.reshape(1, -1)
    if X.ndim != 2:
        raise ValueError(f"Feature array must be 1-D or 2-D, got {X.ndim}-D.")
    if X.shape[1] != NUM_QUBITS:
        raise ValueError(
            f"Expected {NUM_QUBITS} features {FEATURE_NAMES}, "
            f"got {X.shape[1]} columns."
        )
    if not np.all(np.isfinite(X)):
        raise ValueError("Feature array contains NaN or Inf values.")
    return X


def _build_feature_map():
    return ZZFeatureMap(feature_dimension=NUM_QUBITS, reps=FEATURE_REPS)


def _build_quantum_kernel(feature_map) -> "FidelityQuantumKernel":
    sampler = StatevectorSampler(seed=42)
    fidelity = ComputeUncompute(sampler=sampler)
    return FidelityQuantumKernel(feature_map=feature_map, fidelity=fidelity)


def _cap_training_set(
    X: np.ndarray, y: np.ndarray
) -> Tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(42)
    classes = np.unique(y)
    if len(X) <= MAX_TRAIN_SAMPLES:
        return X, y
    idx_list: List[np.ndarray] = []
    per_class = MAX_TRAIN_SAMPLES // len(classes)
    for cls in classes:
        cls_idx = np.where(y == cls)[0]
        chosen = rng.choice(cls_idx, size=min(per_class, len(cls_idx)), replace=False)
        idx_list.append(chosen)
    chosen_idx = np.concatenate(idx_list)
    rng.shuffle(chosen_idx)
    logger.info(
        "Training set capped from %d to %d samples for simulator performance.",
        len(X), len(chosen_idx),
    )
    return X[chosen_idx], y[chosen_idx]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def train_quantum_model(X_train: Any, y_train: Any) -> Dict[str, Any]:
    """
    Train the quantum-kernel classifier (QSVC) and a classical RBF-SVC baseline.

    Parameters
    ----------
    X_train : array-like, shape (n_samples, 4)
        [failed_login_count, unfamiliar_ip, unusual_location, device_change]
    y_train : array-like, shape (n_samples,)
        Binary labels - 0 (benign) or 1 (anomalous).

    Returns
    -------
    dict
    """
    global _STATE
    t0 = time.perf_counter()
    _STATE = _ModelState()

    result: Dict[str, Any] = {
        "success": False,
        "message": "",
        "training_samples": 0,
        "quantum_available": _QISKIT_AVAILABLE,
        "train_accuracy_quantum": None,
        "train_accuracy_classical": None,
        "training_time_seconds": 0.0,
        "warnings": [],
        "evaluation": {},
    }

    # 1. Validate
    try:
        X = _validate_features(X_train)
        y = np.asarray(y_train, dtype=int).ravel()
    except (ValueError, TypeError) as exc:
        result["message"] = f"Input validation failed: {exc}"
        result["training_time_seconds"] = round(time.perf_counter() - t0, 3)
        return result

    if len(X) != len(y):
        result["message"] = f"X_train rows ({len(X)}) != y_train length ({len(y)})."
        result["training_time_seconds"] = round(time.perf_counter() - t0, 3)
        return result

    if len(np.unique(y)) < 2:
        result["message"] = "Training data must contain at least two distinct classes."
        result["training_time_seconds"] = round(time.perf_counter() - t0, 3)
        return result

    # 2. Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 3. Cap
    X_capped, y_capped = _cap_training_set(X_scaled, y)
    if len(X_capped) < len(X_scaled):
        w = (
            f"Training set reduced from {len(X_scaled)} to {len(X_capped)} "
            f"samples (MAX={MAX_TRAIN_SAMPLES}) to keep kernel matrix tractable."
        )
        result["warnings"].append(w)

    # 4. Classical baseline
    logger.info("Training classical RBF-SVC baseline ...")
    classical_svc = SVC(kernel="rbf", C=1.0, gamma="scale", random_state=42)
    classical_svc.fit(X_capped, y_capped)
    classical_train_acc = float(classical_svc.score(X_capped, y_capped))
    _STATE.classical_baseline = classical_svc

    # 5. Quantum QSVC
    qsvc_model = None
    quantum_train_acc: Optional[float] = None

    if not _QISKIT_AVAILABLE:
        w = f"Qiskit ML unavailable ({_IMPORT_ERROR}); quantum model not trained."
        result["warnings"].append(w)
        logger.warning(w)
    else:
        try:
            logger.info("Building ZZFeatureMap (%d qubits, %d reps) ...", NUM_QUBITS, FEATURE_REPS)
            feature_map = _build_feature_map()
            quantum_kernel = _build_quantum_kernel(feature_map)
            logger.info(
                "Training QSVC on %d samples (kernel matrix %dx%d) ...",
                len(X_capped), len(X_capped), len(X_capped),
            )
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", DeprecationWarning)
                qsvc_model = QSVC(quantum_kernel=quantum_kernel)
                qsvc_model.fit(X_capped, y_capped)
            quantum_train_acc = float(qsvc_model.score(X_capped, y_capped))
        except Exception as exc:
            w = (
                f"Quantum training failed: {type(exc).__name__}: {exc}. "
                "Classical baseline still available."
            )
            result["warnings"].append(w)
            logger.exception("Quantum training exception:")
            qsvc_model = None
            quantum_train_acc = None

    # 6. Persist state
    _STATE.is_trained = True
    _STATE.qsvc_model = qsvc_model
    _STATE.scaler = scaler
    _STATE.X_train_scaled = X_capped
    _STATE.y_train = y_capped
    _STATE.training_samples = len(X_capped)
    _STATE.training_timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    _STATE.train_accuracy_quantum = quantum_train_acc
    _STATE.train_accuracy_classical = classical_train_acc
    _STATE.warnings = result["warnings"].copy()

    eval_summary = {
        "quantum_kernel": "ZZFeatureMap (4-qubit, 2 reps) -> FidelityQuantumKernel",
        "classical_baseline": "SVC (RBF kernel, C=1.0)",
        "train_accuracy_quantum": quantum_train_acc,
        "train_accuracy_classical": classical_train_acc,
        "note": (
            "Training-set accuracy is in-sample only. "
            "It does NOT imply generalisation or quantum advantage. "
            "Use a held-out test set for honest evaluation."
        ),
        "samples_used": len(X_capped),
        "simulator_backend": "StatevectorSampler (exact statevector fidelity)",
    }
    _STATE.evaluation_results = eval_summary

    elapsed = round(time.perf_counter() - t0, 3)
    result.update(
        success=True,
        message=(
            "Quantum QSVC trained successfully."
            if qsvc_model is not None
            else "Classical baseline trained; quantum model unavailable."
        ),
        training_samples=len(X_capped),
        train_accuracy_quantum=quantum_train_acc,
        train_accuracy_classical=classical_train_acc,
        training_time_seconds=elapsed,
        evaluation=eval_summary,
    )
    logger.info(
        "Training complete in %.2fs  Q-acc=%s  C-acc=%.4f",
        elapsed, quantum_train_acc, classical_train_acc,
    )
    return result


def analyze_ambiguous(event_features: Any) -> Dict[str, Any]:
    """
    Classify a single ambiguous cyber-event.

    This is the primary integration point for the CodeShield backend.
    Returns ONLY a classification result - no defensive actions are triggered.

    Parameters
    ----------
    event_features : array-like, length 4
        [failed_login_count, unfamiliar_ip, unusual_location, device_change]

    Returns
    -------
    dict
    """
    t0 = time.perf_counter()
    result: Dict[str, Any] = {
        "success": False,
        "label": "error",
        "label_int": None,
        "decision_score": None,
        "confidence_note": (
            "Decision score is a raw SVM margin distance. "
            "Positive values favour 'anomalous', negative favour 'benign'. "
            "This is NOT a calibrated probability."
        ),
        "engine": "error",
        "processing_time_seconds": 0.0,
        "model_status": "not_trained",
        "warnings": [],
        "error": None,
    }

    if not _STATE.is_trained:
        result["error"] = (
            "Model has not been trained. "
            "Call train_quantum_model(X_train, y_train) first."
        )
        result["processing_time_seconds"] = round(time.perf_counter() - t0, 4)
        return result

    result["model_status"] = "trained"

    try:
        X = _validate_features(event_features)
    except (ValueError, TypeError) as exc:
        result["error"] = f"Feature validation error: {exc}"
        result["processing_time_seconds"] = round(time.perf_counter() - t0, 4)
        return result

    try:
        X_scaled = _STATE.scaler.transform(X)
    except Exception as exc:
        result["error"] = f"Scaling error: {exc}"
        result["processing_time_seconds"] = round(time.perf_counter() - t0, 4)
        return result

    label_int: Optional[int] = None
    decision_score: Optional[float] = None
    engine: str = "error"

    try:
        if _STATE.qsvc_model is not None:
            engine = "quantum"
            model = _STATE.qsvc_model
        elif _STATE.classical_baseline is not None:
            engine = "classical_fallback"
            model = _STATE.classical_baseline
            result["warnings"].append(
                "Quantum model unavailable; using classical RBF-SVC fallback."
            )
        else:
            result["error"] = "No model available for inference."
            result["processing_time_seconds"] = round(time.perf_counter() - t0, 4)
            return result

        label_int = int(model.predict(X_scaled)[0])
        try:
            dec = model.decision_function(X_scaled)
            decision_score = float(dec[0])
        except Exception:
            decision_score = None

    except Exception as exc:
        result["error"] = f"Inference error ({type(exc).__name__}): {exc}"
        result["processing_time_seconds"] = round(time.perf_counter() - t0, 4)
        return result

    elapsed = round(time.perf_counter() - t0, 4)
    result.update(
        success=True,
        label=LABEL_MAP.get(label_int, "unknown"),
        label_int=label_int,
        decision_score=decision_score,
        engine=engine,
        processing_time_seconds=elapsed,
        model_status="trained",
        error=None,
    )
    logger.info(
        "analyze_ambiguous -> label=%s  score=%s  engine=%s  time=%.4fs",
        result["label"], decision_score, engine, elapsed,
    )
    return result


def get_model_status() -> Dict[str, Any]:
    """
    Return a structured snapshot of current model state.

    Returns
    -------
    dict
    """
    return {
        "is_trained": _STATE.is_trained,
        "quantum_available": _STATE.quantum_available,
        "import_error": _STATE.import_error,
        "training_timestamp": _STATE.training_timestamp,
        "training_samples": _STATE.training_samples,
        "feature_names": _STATE.feature_names,
        "num_qubits": _STATE.num_qubits,
        "feature_map_reps": _STATE.feature_map_reps,
        "backend_name": _STATE.backend_name,
        "train_accuracy_quantum": _STATE.train_accuracy_quantum,
        "train_accuracy_classical": _STATE.train_accuracy_classical,
        "evaluation_results": _STATE.evaluation_results,
        "warnings": _STATE.warnings,
        "quantum_model_loaded": _STATE.qsvc_model is not None,
        "classical_model_loaded": _STATE.classical_baseline is not None,
    }
