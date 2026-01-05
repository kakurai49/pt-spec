"""Bandit agents implemented for exploration/exploitation exercises."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Optional

from sirius_rl.utils.seed import create_rng


class BanditAgent:
    """Interface for bandit agents.

    Agents map observations (often ``None`` in bandit settings) to actions and
    can optionally learn from rewards via ``update``.
    """

    def __init__(self, n_actions: int, seed: Optional[int] = None) -> None:
        if n_actions <= 0:
            raise ValueError("n_actions must be positive")
        self.n_actions = n_actions
        self.rng = create_rng(seed)

    def act(self, observation=None) -> int:  # noqa: ANN001
        raise NotImplementedError

    def update(self, action: int, reward: float) -> None:
        del action, reward
        return None

    def __call__(self, observation=None) -> int:  # noqa: ANN001
        return self.act(observation)


class EpsilonGreedyAgent(BanditAgent):
    """Classic epsilon-greedy agent with sample-average value estimates."""

    def __init__(self, n_actions: int, epsilon: float = 0.1, seed: Optional[int] = None) -> None:
        if epsilon < 0.0 or epsilon > 1.0:
            raise ValueError("epsilon must be in [0, 1]")
        super().__init__(n_actions, seed=seed)
        self.epsilon = epsilon
        self.counts = [0] * n_actions
        self.estimates = [0.0] * n_actions

    def act(self, observation=None) -> int:  # noqa: ANN001
        untried_actions = [i for i, c in enumerate(self.counts) if c == 0]
        if untried_actions:
            return self.rng.choice(untried_actions)

        if self.rng.random() < self.epsilon:
            return self.rng.randrange(self.n_actions)

        max_value = max(self.estimates)
        best_actions = [i for i, v in enumerate(self.estimates) if v == max_value]
        return self.rng.choice(best_actions)

    def update(self, action: int, reward: float) -> None:
        self.counts[action] += 1
        count = self.counts[action]
        estimate = self.estimates[action]
        self.estimates[action] = estimate + (reward - estimate) / count


class UCB1Agent(BanditAgent):
    """Upper Confidence Bound (UCB1) agent using Hoeffding bounds."""

    def __init__(self, n_actions: int, c: float = 1.0, seed: Optional[int] = None) -> None:
        if c <= 0:
            raise ValueError("c must be positive")
        super().__init__(n_actions, seed=seed)
        self.c = c
        self.counts = [0] * n_actions
        self.estimates = [0.0] * n_actions
        self.total_steps = 0

    def act(self, observation=None) -> int:  # noqa: ANN001
        self.total_steps += 1

        untried_actions = [i for i, c in enumerate(self.counts) if c == 0]
        if untried_actions:
            return self.rng.choice(untried_actions)

        ucb_scores = []
        log_total = math.log(self.total_steps)
        for estimate, count in zip(self.estimates, self.counts):
            bonus = math.sqrt((self.c * log_total) / count)
            ucb_scores.append(estimate + bonus)

        max_score = max(ucb_scores)
        best_actions = [i for i, score in enumerate(ucb_scores) if score == max_score]
        return self.rng.choice(best_actions)

    def update(self, action: int, reward: float) -> None:
        self.counts[action] += 1
        count = self.counts[action]
        estimate = self.estimates[action]
        self.estimates[action] = estimate + (reward - estimate) / count


class ThompsonSamplingBernoulliAgent(BanditAgent):
    """Thompson sampling agent for Bernoulli rewards using Beta priors."""

    def __init__(self, n_actions: int, seed: Optional[int] = None) -> None:
        super().__init__(n_actions, seed=seed)
        self.params = [BetaParams() for _ in range(n_actions)]

    def act(self, observation=None) -> int:  # noqa: ANN001
        samples = [self.rng.betavariate(p.alpha, p.beta) for p in self.params]
        max_value = max(samples)
        best_actions = [i for i, v in enumerate(samples) if v == max_value]
        return self.rng.choice(best_actions)

    def update(self, action: int, reward: float) -> None:
        params = self.params[action]
        params.alpha += reward
        params.beta += 1 - reward


@dataclass
class BetaParams:
    alpha: float = 1.0
    beta: float = 1.0
