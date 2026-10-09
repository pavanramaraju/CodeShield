"""Q-SHIELD Quantum Computing Module.
Provides local quantum circuit adapters, feature normalization, and simulation execution.
"""
from app.quantum.adapter import (
    QuantumAdapterResult,
    QuantumSimulationError,
    build_quantum_anomaly_circuit,
    execute_quantum_circuit,
    run_quantum_anomaly_circuit,
    validate_quantum_features,
)
from app.quantum.normalizer import (
    FEATURE_SPEC,
    FeatureNormalizationError,
    normalize_cyber_features,
)

__all__ = [
    "QuantumAdapterResult",
    "QuantumSimulationError",
    "FeatureNormalizationError",
    "FEATURE_SPEC",
    "validate_quantum_features",
    "build_quantum_anomaly_circuit",
    "execute_quantum_circuit",
    "run_quantum_anomaly_circuit",
    "normalize_cyber_features",
]
