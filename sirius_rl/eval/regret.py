"""Regret utilities for bandit-style environments."""

from __future__ import annotations

from typing import Iterable, List, Sequence


def expected_regret(probs: Sequence[float], action: int) -> float:
    """Return the instantaneous expected regret for taking ``action``.

    Regret is defined as the difference between the optimal arm probability and
    the chosen arm's probability.
    """

    if not probs:
        raise ValueError("probs must be non-empty")
    if action < 0 or action >= len(probs):
        raise ValueError("action out of bounds")

    best = max(probs)
    return float(best - probs[action])


def cumulative_regret(probs: Sequence[float], actions: Iterable[int]) -> List[float]:
    """Compute cumulative expected regret sequence for a list of actions."""

    regrets: List[float] = []
    total = 0.0
    for action in actions:
        total += expected_regret(probs, action)
        regrets.append(total)
    return regrets
