# Q-Shield: Quantum-Kernel Cyber Anomaly Detection

> **Branch:** `feature/qiskit-ml`  
> **Module:** `quantum/`  
> **Role:** Quantum ML Developer contribution to CodeShield

## Overview

Q-Shield implements an experimental **quantum-kernel classifier** for cyber-event anomaly detection. It uses a **4-qubit ZZFeatureMap**, **FidelityQuantumKernel**, and **QSVC** (Quantum Support Vector Classifier) from Qiskit Machine Learning, running on a local statevector simulator.

This module integrates into the **CodeShield** security platform, providing an alternative classification engine for ambiguous events that classical heuristics cannot definitively categorise.

---

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the evaluation

```bash
python evaluate_qshield.py
```

### 3. Run the tests

```bash
pytest tests/ -v
```

---

## Dependency Versions

| Package                  | Version tested |
|--------------------------|----------------|
| Python                   | 3.13.x         |
| qiskit                   | 2.5.2          |
| qiskit-aer               | 0.17.2         |
| qiskit-machine-learning  | 0.9.1          |
| scikit-learn             | 1.9.0          |
| numpy                    | 2.5.2          |
| scipy                    | 1.18.0         |

---

## Agreed Feature Contract

Features **must** be provided in this exact order (4 values):

| Index | Feature               | Type    | Description                        |
|-------|-----------------------|---------|------------------------------------|
| 0     | `failed_login_count`  | float   | Number of failed auth attempts     |
| 1     | `unfamiliar_ip`       | 0 or 1  | IP not seen before                 |
| 2     | `unusual_location`    | 0 or 1  | Login from unexpected location     |
| 3     | `device_change`       | 0 or 1  | Device fingerprint change detected |

All features are **scaled internally** using `StandardScaler` fitted on training data. Do not pre-scale before calling.

---

## Public API

### `train_quantum_model(X_train, y_train) -> dict`

Trains QSVC + classical RBF-SVC baseline. Call once before inference.

```python
from quantum import train_quantum_model

result = train_quantum_model(X_train, y_train)
# {
#   "success": True,
#   "training_samples": 90,
#   "quantum_available": True,
#   "train_accuracy_quantum": 1.0,
#   "train_accuracy_classical": 1.0,
#   "training_time_seconds": 42.3,
#   "warnings": [],
#   "evaluation": { ... }
# }
```

### `analyze_ambiguous(event_features) -> dict`

Classifies a single event. **Primary integration point for the backend.**

```python
from quantum import analyze_ambiguous

result = analyze_ambiguous([7, 1, 0, 1])
# {
#   "success": True,
#   "label": "anomalous",        # "anomalous" | "benign"
#   "label_int": 1,              # 1 = anomalous, 0 = benign
#   "decision_score": 0.87,      # raw SVM margin - NOT a probability
#   "confidence_note": "...",    # always explains score semantics
#   "engine": "quantum",         # "quantum" | "classical_fallback"
#   "processing_time_seconds": 0.23,
#   "model_status": "trained",
#   "warnings": [],
#   "error": null
# }
```

> **Important:** `decision_score` is a **raw SVM signed-distance** from the decision hyperplane. Positive = anomalous direction, negative = benign direction. This is **NOT** a calibrated probability. Do not display it as a percentage confidence.

### `get_model_status() -> dict`

Returns a snapshot of the current model state.

```python
from quantum import get_model_status

status = get_model_status()
# {
#   "is_trained": True,
#   "quantum_available": True,
#   "quantum_model_loaded": True,
#   "classical_model_loaded": True,
#   "num_qubits": 4,
#   "feature_names": ["failed_login_count", ...],
#   "training_timestamp": "2026-10-09T15:55:40Z",
#   ...
# }
```

---

## Architecture

```
quantum/
    __init__.py             - Public API exports
    quantum_classifier.py   - Core classifier (ZZFeatureMap + QSVC)

tests/
    test_quantum_classifier.py  - 30+ test cases

evaluate_qshield.py         - Standalone evaluation with honest reporting
requirements.txt            - Production dependencies
requirements-dev.txt        - Dev/test dependencies
INTEGRATION.md              - Backend integration guide
```

### Algorithm Pipeline

```
Raw Event Features (4)
        |
   StandardScaler             <- fitted on training data only (no leakage)
        |
   ZZFeatureMap (4 qubits, 2 reps)
        |
   FidelityQuantumKernel
   (ComputeUncompute + StatevectorSampler)
        |
   QSVC.fit / QSVC.predict
        |
   { label, decision_score, engine, ... }
```

---

## Performance Considerations

- The quantum kernel matrix is **O(n²)** in kernel evaluations.
- Training is capped at **150 samples** by default (`MAX_TRAIN_SAMPLES`) to keep the simulator tractable.
- The **StatevectorSampler** provides **exact** fidelity computation (no shot noise), which is accurate but slow for large datasets.
- On this hardware, training 60 samples takes approximately 30-90 seconds.

---

## Honest Evaluation Disclaimer

> This is an **experimental research prototype**.  
> - Quantum advantage over classical SVMs is **not guaranteed** and remains an open research question.  
> - Simulator results use exact statevector computation; real quantum hardware introduces noise.  
> - All reported metrics are measured on held-out data; no cherry-picked results.  
> - Do not deploy in production without validation on real-world datasets at scale.

---

## Integration Notes for Backend Developer

1. Call `train_quantum_model` at startup or on model refresh (not per-request).
2. Store the result of `get_model_status()` to expose model metadata via API.
3. Call `analyze_ambiguous(features)` per ambiguous event; check `result["success"]` before using `result["label"]`.
4. The `engine` field tells you whether quantum or classical fallback was used.
5. Quantum classification is **separated from defensive actions** — this module never triggers alerts, blocks, or logs. It only returns a classification.
6. If `quantum_available` is False, the module automatically falls back to the classical RBF-SVC.

---

## Branch Strategy

- Branch: `feature/qiskit-ml`
- Merge target: `main`
- PR should include: evaluation results, dependency freeze, and this README.
