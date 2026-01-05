"""Core environment interfaces and helpers for RL tasks."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional, Protocol, runtime_checkable

from sirius_rl.utils.seed import create_rng


@dataclass
class StepResult:
    """Result container returned by environment steps."""

    observation: Any
    reward: float
    terminated: bool
    info: Dict[str, Any]


@runtime_checkable
class Environment(Protocol):
    """Minimal environment protocol used across Sirius RL tasks."""

    def reset(self, seed: Optional[int] = None) -> Any:
        """Reset the environment.

        Parameters
        ----------
        seed:
            Optional seed for deterministic resets.
        """

    def step(self, action: Any) -> StepResult:
        """Advance one step in the environment."""


class BaseEnv:
    """Base class that offers RNG management for derived environments."""

    def __init__(self, seed: Optional[int] = None) -> None:
        self._seed: Optional[int] = seed
        self.rng = create_rng(seed)

    def reseed(self, seed: Optional[int]) -> None:
        """Recreate the RNG with the provided seed."""

        self._seed = seed
        self.rng = create_rng(seed)

    @property
    def seed(self) -> Optional[int]:
        return self._seed
