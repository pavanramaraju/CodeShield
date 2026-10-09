import math
from typing import Any, Dict, List, Optional, Sequence, Union
from pydantic import BaseModel, Field

try:
    from qiskit import QuantumCircuit
    from qiskit.primitives import StatevectorSampler
    QISKIT_AVAILABLE = True
except ImportError:
    QuantumCircuit = None
    StatevectorSampler = None
    QISKIT_AVAILABLE = False


class QuantumSimulationError(Exception):
    """Raised when quantum circuit simulation fails."""
    pass


class QuantumAdapterResult(BaseModel):
    """Standardized result returned by the Quantum Circuit Adapter."""
    status: str = Field(description="'SUCCESS' or 'ERROR'")
    counts: Dict[str, int] = Field(default_factory=dict, description="Bitstring measurement counts, e.g. {'0000': 512, ...}")
    quantum_measurement_statistic: float = Field(default=0.0, description="Normalized measurement statistic in [0.0, 1.0]")
    statistic_name: str = Field(default="excited_state_ratio", description="Label identifying the computed measurement statistic")
    statistic_description: str = Field(
        default="Fraction of shots in non-ground states (1 - P(|0000>)), indicating degree of feature-induced state dispersion.",
        description="Human-readable explanation of the measurement statistic",
    )
    ground_state_probability: float = Field(default=0.0, description="Empirical probability of measuring the |0000> ground state")
    shots: int = Field(default=1024, description="Number of simulation execution shots")
    qubit_count: int = Field(default=4, description="Number of qubits in the circuit")
    encoded_features: List[float] = Field(default_factory=list, description="The validated normalized inputs [x0, x1, x2, x3]")
    circuit_depth: int = Field(default=0, description="Depth of the simulated quantum circuit")
    error_message: Optional[str] = Field(default=None, description="Error details if status is 'ERROR'")
    disclaimer: str = Field(
        default="No quantum computational advantage claimed. Local simulator measurement statistic for exploratory anomaly analysis.",
        description="Scientific integrity and scope disclaimer",
    )


def validate_quantum_features(features: Any) -> List[float]:
    """
    Validate that exactly four finite numerical feature values in [0, 1] are supplied.

    Raises:
        TypeError: If input is not a sequence or contains non-numeric types.
        ValueError: If input length is not 4, or values are non-finite or outside [0, 1].
    """
    if features is None:
        raise ValueError("Features input cannot be None. Expected exactly 4 normalized values.")

    if isinstance(features, (str, bytes, dict)):
        raise TypeError(f"Features must be a sequence of numbers, not {type(features).__name__}.")

    if not isinstance(features, Sequence):
        try:
            features = list(features)
        except Exception:
            raise TypeError("Features must be an iterable collection of 4 numbers.")

    if len(features) != 4:
        raise ValueError(
            f"Expected exactly 4 features for the 4-qubit circuit, but received {len(features)}."
        )

    validated: List[float] = []
    for idx, val in enumerate(features):
        if isinstance(val, bool):
            raise TypeError(
                f"Feature at index {idx} is a boolean, expected float or int in range [0, 1]."
            )

        if not isinstance(val, (int, float)):
            raise TypeError(
                f"Feature at index {idx} has invalid type '{type(val).__name__}'. Expected float or int in range [0, 1]."
            )

        float_val = float(val)

        if not math.isfinite(float_val):
            raise ValueError(
                f"Feature at index {idx} is non-finite ({float_val}). All features must be finite numbers."
            )

        if float_val < 0.0 or float_val > 1.0:
            raise ValueError(
                f"Feature at index {idx} with value {float_val} is outside valid normalized range [0.0, 1.0]."
            )

        validated.append(float_val)

    return validated


def build_quantum_anomaly_circuit(features: List[float]) -> Any:
    """
    Construct a 4-qubit quantum circuit:
    1. Superposition initialization via Hadamard gates.
    2. Feature angle encoding (RY rotations by pi * x_i).
    3. Entanglement layer (CNOT ring between adjacent qubits).
    4. Phase encoding (RZ rotations by 2 * pi * x_i).
    5. Second entangling layer (Cross-qubit CNOTs).
    6. Measurement of all 4 qubits into classical register.
    """
    if not QISKIT_AVAILABLE:
        raise QuantumSimulationError("Qiskit library is not installed or available in the environment.")

    qc = QuantumCircuit(4, 4, name="qshield_4qubit_anomaly_map")

    # Layer 1: Superposition
    for i in range(4):
        qc.h(i)

    # Layer 2: Feature Angle Encoding (RY rotations)
    for i in range(4):
        theta = features[i] * math.pi
        qc.ry(theta, i)

    # Layer 3: Entangling Ladder/Ring (CNOTs)
    qc.cx(0, 1)
    qc.cx(1, 2)
    qc.cx(2, 3)
    qc.cx(3, 0)

    # Layer 4: Phase Interference Encoding (RZ rotations)
    for i in range(4):
        phi = features[i] * 2.0 * math.pi
        qc.rz(phi, i)

    # Layer 5: Secondary Cross-Entanglement
    qc.cx(0, 2)
    qc.cx(1, 3)

    # Layer 6: Measurement
    qc.measure(range(4), range(4))

    return qc


def execute_quantum_circuit(
    features: Sequence[Union[int, float]],
    shots: int = 1024,
) -> QuantumAdapterResult:
    """
    Validate features, construct the 4-qubit circuit, and simulate using Qiskit StatevectorSampler.

    Returns:
        QuantumAdapterResult containing measurement counts and labelled statistic.

    Raises:
        ValueError, TypeError: On invalid feature inputs.
        QuantumSimulationError: On simulation execution failure.
    """
    validated_features = validate_quantum_features(features)

    if shots <= 0:
        raise ValueError(f"Shots must be a positive integer, got {shots}.")

    if not QISKIT_AVAILABLE:
        raise QuantumSimulationError("Qiskit is not available in the current Python environment.")

    try:
        qc = build_quantum_anomaly_circuit(validated_features)
        sampler = StatevectorSampler()
        job = sampler.run([qc], shots=shots)
        pub_result = job.result()[0]

        # Extract counts from classical register BitArray
        counts: Dict[str, int] = {}
        if hasattr(pub_result.data, "c"):
            counts = dict(pub_result.data.c.get_counts())
        elif hasattr(pub_result.data, "meas"):
            counts = dict(pub_result.data.meas.get_counts())
        else:
            for attr_name in dir(pub_result.data):
                attr = getattr(pub_result.data, attr_name)
                if hasattr(attr, "get_counts"):
                    counts = dict(attr.get_counts())
                    break

        total_measured = sum(counts.values()) or shots
        ground_state_count = counts.get("0000", 0)
        ground_state_prob = round(ground_state_count / total_measured, 4)

        # Clearly labelled statistic: fraction of shots observed in excited / non-ground states
        # When all features are 0.0 or under uniform rotation, this tracks state dispersion
        excited_state_ratio = round(1.0 - ground_state_prob, 4)

        return QuantumAdapterResult(
            status="SUCCESS",
            counts=counts,
            quantum_measurement_statistic=excited_state_ratio,
            statistic_name="excited_state_ratio",
            statistic_description=(
                "Fraction of measurement shots in non-ground states (1 - P(|0000>)), "
                "representing quantum state dispersion under the applied feature rotations."
            ),
            ground_state_probability=ground_state_prob,
            shots=shots,
            qubit_count=4,
            encoded_features=validated_features,
            circuit_depth=qc.depth(),
            error_message=None,
        )

    except (ValueError, TypeError):
        raise
    except Exception as exc:
        raise QuantumSimulationError(f"Quantum simulator execution error: {str(exc)}") from exc


def run_quantum_anomaly_circuit(
    features: Any,
    shots: int = 1024,
) -> Dict[str, Any]:
    """
    Safe wrapper designed for FastAPI service integration:
    Executes the quantum adapter and handles any simulator or validation error gracefully
    without raising unhandled exceptions or crashing the server.
    """
    try:
        result = execute_quantum_circuit(features, shots=shots)
        return result.model_dump()
    except (ValueError, TypeError, QuantumSimulationError, Exception) as exc:
        return QuantumAdapterResult(
            status="ERROR",
            counts={},
            quantum_measurement_statistic=0.0,
            statistic_name="excited_state_ratio",
            statistic_description="Execution failed; statistic set to 0.0 fallback.",
            ground_state_probability=0.0,
            shots=shots,
            qubit_count=4,
            encoded_features=features if isinstance(features, list) and len(features) == 4 else [],
            circuit_depth=0,
            error_message=str(exc),
        ).model_dump()
