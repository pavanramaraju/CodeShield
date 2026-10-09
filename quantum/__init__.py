"""
Q-Shield Quantum Module
=======================
Quantum-kernel anomaly detection for the CodeShield cyber-security platform.

Exposes:
    train_quantum_model(X_train, y_train) -> dict
    analyze_ambiguous(event_features)     -> dict
    get_model_status()                    -> dict
"""

from .quantum_classifier import (
    train_quantum_model,
    analyze_ambiguous,
    get_model_status,
)

__all__ = [
    "train_quantum_model",
    "analyze_ambiguous",
    "get_model_status",
]

__version__ = "1.0.0"
