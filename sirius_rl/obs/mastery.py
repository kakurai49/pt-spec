"""Mastery estimation utilities for Goldilocks-style guide level suggestions."""

from __future__ import annotations

from typing import Any, Dict, Optional

# Default thresholds for the Goldilocks band logic.
DEFAULT_RULES: Dict[str, Any] = {
    "easier_than": 0.55,
    "harder_than": 0.80,
    "step": 1,
    "min_level": None,
    "max_level": None,
}


def update_beta(alpha: float, beta: float, success: bool) -> tuple[float, float]:
    """Update Beta distribution parameters given a new Bernoulli outcome."""

    if alpha <= 0 or beta <= 0:
        raise ValueError("Alpha and beta must be positive.")

    if success:
        alpha += 1
    else:
        beta += 1
    return alpha, beta


def mean_p(alpha: float, beta: float) -> float:
    """Return the mean of a Beta distribution."""

    if alpha <= 0 or beta <= 0:
        raise ValueError("Alpha and beta must be positive.")
    return alpha / (alpha + beta)


def recommend_guide_level(
    p: float,
    current_level: int,
    rules: Optional[Dict[str, Any]] = None,
) -> int:
    """Recommend the next guide level using Goldilocks band thresholds.

    The ``rules`` dictionary can include:
    - ``easier_than``: threshold below which the level should increase (easier).
    - ``harder_than``: threshold above which the level should decrease (harder).
    - ``step``: increment/decrement applied to the current level.
    - ``min_level`` / ``max_level``: optional bounds for the recommended level.
    """

    selected_rules: Dict[str, Any] = {**DEFAULT_RULES, **(rules or {})}
    next_level = current_level

    if p < selected_rules["easier_than"]:
        next_level = current_level + selected_rules["step"]
    elif p > selected_rules["harder_than"]:
        next_level = current_level - selected_rules["step"]

    min_level = selected_rules.get("min_level")
    max_level = selected_rules.get("max_level")

    if min_level is not None:
        next_level = max(min_level, next_level)
    if max_level is not None:
        next_level = min(max_level, next_level)

    return next_level


__all__ = [
    "DEFAULT_RULES",
    "update_beta",
    "mean_p",
    "recommend_guide_level",
]
