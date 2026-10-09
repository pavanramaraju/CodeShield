# INTEGRATION.md
# Q-Shield Backend Integration Guide
# ====================================
# This document is for the CodeShield backend developer.

## Module Contract

The quantum module exposes exactly three functions:

```python
from quantum import train_quantum_model, analyze_ambiguous, get_model_status
```

### Interface Types

```python
# Input to train_quantum_model
X_train: np.ndarray  # shape (n, 4) - float64
y_train: np.ndarray  # shape (n,)   - int {0, 1}

# Input to analyze_ambiguous
event_features: list | np.ndarray  # length 4 or shape (1, 4)

# All three functions return a plain Python dict (JSON-serializable)
```

## Feature Order (agreed contract)

```
Index 0: failed_login_count   (float, raw count - do NOT normalise before calling)
Index 1: unfamiliar_ip        (int: 0 or 1)
Index 2: unusual_location     (int: 0 or 1)
Index 3: device_change        (int: 0 or 1)
```

The quantum module handles all internal scaling via StandardScaler.

## Typical Usage Pattern

```python
import numpy as np
from quantum import train_quantum_model, analyze_ambiguous, get_model_status

# --- Startup / training phase ---
X_train = np.load("training_data.npy")  # shape (n, 4)
y_train = np.load("training_labels.npy")  # shape (n,)

result = train_quantum_model(X_train, y_train)
if not result["success"]:
    raise RuntimeError(f"Training failed: {result['message']}")

# --- Per-event inference (ambiguous events only) ---
event = [7, 1, 0, 1]  # [failed_logins, unfamiliar_ip, unusual_loc, device_change]
classification = analyze_ambiguous(event)

if classification["success"]:
    label = classification["label"]           # "anomalous" or "benign"
    label_int = classification["label_int"]   # 1 or 0
    score = classification["decision_score"]  # raw SVM margin (NOT probability)
    engine = classification["engine"]         # "quantum" or "classical_fallback"
else:
    # Handle error - check classification["error"]
    pass

# --- Model metadata for API ---
status = get_model_status()
```

## Error Handling

Always check `result["success"]` before using the classification.
The module never raises exceptions through the public API - all errors are captured into the returned dict.

```python
result = analyze_ambiguous(bad_input)
if not result["success"]:
    log.warning("Quantum classification failed: %s", result["error"])
    # Fall back to your own heuristics
```

## JSON Serialization

All returned dicts are JSON-serializable (no numpy types leak through):

```python
import json
result = analyze_ambiguous([7, 1, 0, 1])
json_str = json.dumps(result)  # works cleanly
```

## Important: Separation of Concerns

The quantum module ONLY classifies. It never:
- Triggers alerts
- Blocks connections
- Writes to databases
- Sends notifications

All defensive actions remain the backend's responsibility.

## Thread Safety

The module uses a module-level singleton `_STATE`. 
- `get_model_status()` and `analyze_ambiguous()` are **read-only** after training and are safe for concurrent reads.
- `train_quantum_model()` **resets state** and is **not thread-safe**. Call it only from a single thread during the training phase.

## Quantum vs Classical Fallback

The `engine` field in the response always tells you which model made the decision:

| `engine`             | Meaning                                                 |
|----------------------|---------------------------------------------------------|
| `"quantum"`          | QSVC with quantum kernel was used                       |
| `"classical_fallback"` | RBF-SVC was used (quantum model unavailable or failed) |
| `"error"`            | Neither model could classify (check `error` field)      |

## Decision Score Semantics

```
decision_score > 0  -> model leans toward "anomalous"
decision_score < 0  -> model leans toward "benign"
decision_score = 0  -> on the decision boundary (maximum uncertainty)
```

**DO NOT** display this as a percentage or probability to end users.
