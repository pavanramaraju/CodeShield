"""Q-SHIELD Feature Normalization Service.

Maps raw continuous cybersecurity telemetry into normalized floats in [0.0, 1.0]
for 4-qubit quantum circuit angle encoding.
"""

import math
from typing import Any, Dict, List, Tuple


class FeatureNormalizationError(ValueError):
    """Raised when telemetry features are missing, non-numeric, non-finite, or out of bounds."""
    pass


# Feature configuration specifying canonical bounds for the 4-qubit encoding
# Qubit 0: packet_rate (volumetric flood metric, 0 to 5000 pps)
# Qubit 1: failed_logins (authentication brute force metric, 0 to 20 attempts)
# Qubit 2: payload_entropy (Shannon entropy for encryption/packing, 0.0 to 8.0 bits/byte)
# Qubit 3: request_rate (application layer L7 surge metric, 0 to 500 req/s)
FEATURE_SPEC: List[Tuple[str, float, float]] = [
    ("packet_rate", 0.0, 5000.0),
    ("failed_logins", 0.0, 20.0),
    ("payload_entropy", 0.0, 8.0),
    ("request_rate", 0.0, 500.0),
]


def normalize_cyber_features(features: Dict[str, Any]) -> List[float]:
    """
    Validate and normalize four raw cybersecurity telemetry features into [0.0, 1.0].

    Features extracted:
        0. packet_rate: [0.0, 5000.0] pps
        1. failed_logins: [0, 20] attempts
        2. payload_entropy: [0.0, 8.0] Shannon entropy
        3. request_rate: [0.0, 500.0] req/s

    Returns:
        List[float]: Exactly four floats, each in inclusive range [0.0, 1.0].

    Raises:
        FeatureNormalizationError: If any feature is missing, of invalid type,
        non-finite (NaN/Inf), or strictly outside the allowable telemetry range.
    """
    if not isinstance(features, dict):
        raise FeatureNormalizationError(
            f"Expected features to be a dictionary, got '{type(features).__name__}'."
        )

    normalized: List[float] = []

    for name, min_val, max_val in FEATURE_SPEC:
        if name not in features:
            raise FeatureNormalizationError(
                f"Missing required telemetry feature: '{name}'."
            )

        val = features[name]

        if val is None:
            raise FeatureNormalizationError(
                f"Feature '{name}' cannot be None."
            )

        if isinstance(val, bool):
            raise FeatureNormalizationError(
                f"Feature '{name}' cannot be a boolean (got {val})."
            )

        if not isinstance(val, (int, float)):
            raise FeatureNormalizationError(
                f"Feature '{name}' must be numeric (int or float), got '{type(val).__name__}'."
            )

        float_val = float(val)

        if not math.isfinite(float_val):
            raise FeatureNormalizationError(
                f"Feature '{name}' must be a finite number, got {float_val}."
            )

        if float_val < min_val or float_val > max_val:
            raise FeatureNormalizationError(
                f"Feature '{name}' value {float_val} is outside allowable range [{min_val}, {max_val}]."
            )

        # Scale into [0.0, 1.0]
        norm = (float_val - min_val) / (max_val - min_val)
        # Round to 6 decimals to prevent floating point inaccuracies
        normalized.append(round(norm, 6))

    return normalized
