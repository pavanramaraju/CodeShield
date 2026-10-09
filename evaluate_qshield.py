"""
evaluate_qshield.py
===================
Standalone evaluation script for Q-Shield quantum-kernel classifier.

Generates a synthetic cyber-event dataset, trains the quantum and classical
models, evaluates on a held-out test set, and prints a comparative report.

Usage:
    python evaluate_qshield.py

NOTE: Results are reported honestly. This is an experimental prototype.
Quantum advantage over classical SVM is NOT guaranteed and depends heavily
on data characteristics, circuit expressibility, and hardware noise.
"""

import time
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)

RANDOM_SEED = 42
N_SAMPLES = 120  # keep small for simulator tractability


def make_synthetic_dataset(n: int = N_SAMPLES, seed: int = RANDOM_SEED):
    """
    Synthetic cyber-event dataset.
    Features: [failed_login_count, unfamiliar_ip, unusual_location, device_change]
    Labels:   0 = benign, 1 = anomalous
    """
    rng = np.random.default_rng(seed)
    half = n // 2

    X_benign = np.column_stack([
        rng.uniform(0, 3, half),
        rng.choice([0, 1], half, p=[0.9, 0.1]),
        rng.choice([0, 1], half, p=[0.9, 0.1]),
        rng.choice([0, 1], half, p=[0.8, 0.2]),
    ])
    X_anomalous = np.column_stack([
        rng.uniform(5, 20, half),
        rng.choice([0, 1], half, p=[0.2, 0.8]),
        rng.choice([0, 1], half, p=[0.2, 0.8]),
        rng.choice([0, 1], half, p=[0.3, 0.7]),
    ])
    X = np.vstack([X_benign, X_anomalous])
    y = np.concatenate([np.zeros(half, dtype=int), np.ones(half, dtype=int)])
    idx = rng.permutation(len(X))
    return X[idx], y[idx]


def evaluate():
    print("=" * 60)
    print("Q-Shield Quantum-Kernel Anomaly Detector")
    print("Evaluation Report")
    print("=" * 60)

    # 1. Dataset
    print(f"\n[1] Generating synthetic dataset (n={N_SAMPLES}) ...")
    X, y = make_synthetic_dataset()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=RANDOM_SEED, stratify=y
    )
    print(f"    Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"    Class distribution (train): {dict(zip(*np.unique(y_train, return_counts=True)))}")

    # 2. Train
    print("\n[2] Training models ...")
    t_start = time.perf_counter()
    from quantum.quantum_classifier import (
        train_quantum_model,
        analyze_ambiguous,
        get_model_status,
    )
    train_result = train_quantum_model(X_train, y_train)
    t_train = time.perf_counter() - t_start

    if not train_result["success"]:
        print(f"    ERROR: {train_result['message']}")
        return

    print(f"    Training time: {t_train:.2f}s")
    print(f"    Quantum available: {train_result['quantum_available']}")
    if train_result["warnings"]:
        for w in train_result["warnings"]:
            print(f"    [WARN] {w}")

    # 3. Evaluate on test set
    print("\n[3] Evaluating on held-out test set ...")
    preds = []
    scores = []
    engines = []
    t_inf_start = time.perf_counter()
    for x in X_test:
        r = analyze_ambiguous(x)
        preds.append(r["label_int"] if r["success"] else -1)
        scores.append(r["decision_score"])
        engines.append(r["engine"])
    t_inf = time.perf_counter() - t_inf_start

    preds_arr = np.array(preds)
    valid_mask = preds_arr >= 0
    y_te_valid = y_test[valid_mask]
    preds_valid = preds_arr[valid_mask]

    engine_used = engines[0] if engines else "unknown"
    print(f"    Engine: {engine_used}")
    print(f"    Total inference time: {t_inf:.3f}s  ({t_inf/len(X_test)*1000:.1f} ms/sample)")

    acc = accuracy_score(y_te_valid, preds_valid)
    print(f"\n[4] Classification Report ({engine_used}):")
    print(f"    Test accuracy: {acc:.4f}")
    print()
    print(classification_report(y_te_valid, preds_valid,
                                 target_names=["benign", "anomalous"]))

    print("    Confusion Matrix:")
    cm = confusion_matrix(y_te_valid, preds_valid)
    print(f"      TN={cm[0,0]}  FP={cm[0,1]}")
    print(f"      FN={cm[1,0]}  TP={cm[1,1]}")

    # AUC if scores available
    valid_scores = [s for s in scores if s is not None]
    if len(valid_scores) == len(y_te_valid):
        try:
            auc = roc_auc_score(y_te_valid, valid_scores)
            print(f"\n    ROC-AUC: {auc:.4f}")
            print("    Note: AUC uses raw SVM decision scores (NOT calibrated probabilities)")
        except Exception:
            pass

    # 5. Model status
    print("\n[5] Model Status:")
    status = get_model_status()
    print(f"    Quantum model loaded: {status['quantum_model_loaded']}")
    print(f"    Classical model loaded: {status['classical_model_loaded']}")
    print(f"    Num qubits: {status['num_qubits']}")
    print(f"    Feature map reps: {status['feature_map_reps']}")
    print(f"    Backend: {status['backend_name']}")
    print(f"    Trained at: {status['training_timestamp']}")
    print(f"    Train-set accuracy (quantum):   {status['train_accuracy_quantum']}")
    print(f"    Train-set accuracy (classical): {status['train_accuracy_classical']}")

    # 6. Honest summary
    print("\n[6] Honest Evaluation Summary:")
    print("    - This is an experimental quantum-kernel prototype.")
    print("    - Simulator results use exact statevector computation.")
    print("    - Real quantum hardware would introduce noise and decoherence.")
    print("    - Quantum advantage is NOT claimed or guaranteed.")
    print("    - For production use, validate on larger, real-world datasets.")
    print("    - Decision scores are raw SVM margins, NOT calibrated probabilities.")
    print("\n" + "=" * 60)
    print("Evaluation complete.")
    print("=" * 60)


if __name__ == "__main__":
    evaluate()
