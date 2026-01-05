"""Deterministic GridWorld environment for DP exercises."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from sirius_rl.env.base import BaseEnv, StepResult

Action = int
State = int


def _state_id(x: int, y: int, width: int) -> State:
    return y * width + x


def _coords(state: State, width: int) -> Tuple[int, int]:
    return state % width, state // width


@dataclass
class Transition:
    probability: float
    next_state: State
    reward: float
    terminated: bool


class GridWorldEnv(BaseEnv):
    """Tabular GridWorld with deterministic transitions."""

    ACTIONS: Sequence[Tuple[int, int]] = ((0, -1), (1, 0), (0, 1), (-1, 0))

    def __init__(
        self,
        width: int,
        height: int,
        *,
        walls: Optional[Iterable[Tuple[int, int]]] = None,
        start: Tuple[int, int] = (0, 0),
        terminals: Optional[Iterable[Tuple[int, int]]] = None,
        reward_map: Optional[Dict[Tuple[int, int], float]] = None,
        step_penalty: float = 0.0,
        seed: Optional[int] = None,
    ) -> None:
        super().__init__(seed=seed)
        self.width = width
        self.height = height
        self.start = start
        self.step_penalty = step_penalty
        self._walls = {
            _state_id(x, y, self.width)
            for (x, y) in walls
        } if walls else set()
        self._terminals = {
            _state_id(x, y, self.width)
            for (x, y) in terminals
        } if terminals else set()
        self._reward_map = {
            _state_id(x, y, self.width): reward
            for (x, y), reward in (reward_map or {}).items()
        }
        self._state: State = _state_id(*start, self.width)

    @property
    def state(self) -> State:
        return self._state

    @property
    def terminal_states(self) -> List[State]:
        return list(self._terminals)

    @property
    def walls(self) -> List[State]:
        return list(self._walls)

    @property
    def n_states(self) -> int:
        return self.width * self.height

    @property
    def n_actions(self) -> int:
        return len(self.ACTIONS)

    def _in_bounds(self, x: int, y: int) -> bool:
        return 0 <= x < self.width and 0 <= y < self.height

    def reset(self, seed: Optional[int] = None) -> State:
        if seed is not None:
            self.reseed(seed)
        self._state = _state_id(*self.start, self.width)
        return self._state

    def _next_state(self, action: Action) -> State:
        if action < 0 or action >= self.n_actions:
            raise ValueError("action out of bounds")

        dx, dy = self.ACTIONS[action]
        x, y = _coords(self._state, self.width)
        nx, ny = x + dx, y + dy
        candidate = _state_id(nx, ny, self.width) if self._in_bounds(nx, ny) else self._state
        if candidate in self._walls:
            return self._state
        return candidate

    def step(self, action: Action) -> StepResult:
        next_state = self._next_state(action)
        terminated = next_state in self._terminals
        reward = self._reward_map.get(next_state, 0.0) + self.step_penalty
        self._state = next_state
        info = {"state": self._state}
        return StepResult(
            observation=self._state,
            reward=reward,
            terminated=terminated,
            info=info,
        )

    def model(self) -> Dict[State, Dict[Action, List[Transition]]]:
        """Return full transition model for DP algorithms."""

        model: Dict[State, Dict[Action, List[Transition]]] = {}
        original_state = self._state
        for state in range(self.n_states):
            self._state = state
            model[state] = {}
            for action in range(self.n_actions):
                next_state = self._next_state(action)
                terminated = next_state in self._terminals
                reward = self._reward_map.get(next_state, 0.0) + self.step_penalty
                model[state][action] = [
                    Transition(
                        probability=1.0,
                        next_state=next_state,
                        reward=reward,
                        terminated=terminated,
                    )
                ]
        self._state = original_state
        return model
