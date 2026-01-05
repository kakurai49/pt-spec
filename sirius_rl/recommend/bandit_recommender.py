"""Contextual bandit recommender for next-mission selection.

This module implements a light-weight Beta-Bernoulli Thompson Sampling policy
that can be used to recommend the next mission (arm) based on a coarse context.
Contexts are discretized (binned) for stability and to keep the state space
small for the educational demo.
"""
from __future__ import annotations

from typing import Dict, Iterable, Mapping, MutableMapping, Sequence

from sirius_rl.utils.seed import create_rng

Context = Mapping[str, object]


class BanditRecommender:
    """Beta-Bernoulli Thompson Sampling with simple context binning.

    Attributes:
        arms: List of available arms (missions or guidance levels).
    """

    def __init__(
        self,
        arms: Sequence[str],
        alpha: float = 1.0,
        beta: float = 1.0,
        seed: int | None = None,
    ) -> None:
        if len(arms) < 3:
            raise ValueError("arms must include at least three options")

        self.arms = list(arms)
        self._alpha0 = alpha
        self._beta0 = beta
        self._posteriors: Dict[str, MutableMapping[str, list[float]]] = {}
        self._rng = create_rng(seed)

    def recommend(self, context: Context) -> str:
        """Sample an arm conditioned on the (binned) context."""

        key = self._context_key(context)
        self._ensure_context(key)

        samples = {}
        for arm in self.arms:
            alpha, beta = self._posteriors[key][arm]
            samples[arm] = self._rng.betavariate(alpha, beta)
        best_arm = max(samples, key=samples.get)
        return best_arm

    def update(self, context: Context, arm: str, reward: float) -> None:
        """Update the posterior for an arm given an observed reward.

        The Beta-Bernoulli model expects rewards in ``{0, 1}``. Continuous
        rewards from the simulator are mapped to success if they are positive.
        This keeps the implementation simple while still preferring arms that
        yield higher expected rewards.
        """

        if arm not in self.arms:
            raise ValueError(f"Unknown arm: {arm}")

        key = self._context_key(context)
        self._ensure_context(key)

        success = 1.0 if reward > 0 else 0.0
        alpha, beta = self._posteriors[key][arm]
        self._posteriors[key][arm] = [alpha + success, beta + (1.0 - success)]

    def _ensure_context(self, key: str) -> None:
        if key not in self._posteriors:
            self._posteriors[key] = {
                arm: [self._alpha0, self._beta0] for arm in self.arms
            }

    def _context_key(self, context: Context) -> str:
        mastery = float(context.get("mastery_estimate", 0.5))
        mastery_bin = self._bin_value(mastery, [0.33, 0.66], labels=("low", "mid", "high"))

        last_outcome = context.get("last_outcome", "unknown")
        trials = int(context.get("trials", 0))
        trial_bin = self._bin_value(trials, [1, 3], labels=("short", "mid", "long"))
        return f"mastery:{mastery_bin}|outcome:{last_outcome}|trials:{trial_bin}"

    @staticmethod
    def _bin_value(value: float, edges: Iterable[float], labels: Sequence[str]) -> str:
        """Assign ``value`` to a bin defined by ``edges`` and ``labels``."""

        bins = list(edges)
        for idx, edge in enumerate(bins):
            if value <= edge:
                return labels[idx]
        return labels[len(bins)]

    def expected_success(self, context: Context) -> Dict[str, float]:
        """Expose posterior means for debugging/visualization."""

        key = self._context_key(context)
        self._ensure_context(key)
        return {
            arm: alpha / (alpha + beta)
            for arm, (alpha, beta) in self._posteriors[key].items()
        }

    def reset(self) -> None:
        """Reset posteriors to the prior for reuse in experiments."""

        self._posteriors.clear()
