"""Bandit environment implementation."""

from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional, Sequence

from sirius_rl.env.base import BaseEnv, StepResult
from sirius_rl.eval import regret


class BernoulliBanditEnv(BaseEnv):
    """Simple Bernoulli multi-armed bandit environment."""

    def __init__(self, probs: Sequence[float], seed: Optional[int] = None) -> None:
        if not probs:
            raise ValueError("probs must be non-empty")
        self._probs: List[float] = [float(p) for p in probs]
        for p in self._probs:
            if p < 0.0 or p > 1.0:
                raise ValueError("probabilities must be in [0, 1]")
        super().__init__(seed=seed)

    def reset(self, seed: Optional[int] = None) -> None:
        if seed is not None:
            self.reseed(seed)
        return None

    def step(self, action: int) -> StepResult:
        if action < 0 or action >= len(self._probs):
            raise ValueError("action out of bounds")

        p = self._probs[action]
        reward = float(self.rng.random() < p)
        info: Dict[str, Any] = {"action": action, "p": p}
        return StepResult(observation=None, reward=reward, terminated=False, info=info)

    @property
    def probs(self) -> List[float]:
        return list(self._probs)

    @property
    def action_space(self) -> range:
        return range(len(self._probs))

    def regret_function(self):
        """Return a regret function bound to this environment."""

        def _regret(action: int) -> float:
            return regret.expected_regret(self._probs, action)

        return _regret

    def rollout(self, actions: Iterable[int]) -> List[float]:
        rewards: List[float] = []
        for action in actions:
            result = self.step(action)
            rewards.append(result.reward)
        return rewards
