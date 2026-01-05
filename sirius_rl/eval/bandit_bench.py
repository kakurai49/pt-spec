"""Benchmark utilities for bandit agents."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Iterable, List, Optional

from sirius_rl.agents.bandit import BanditAgent
from sirius_rl.env.bandit import BernoulliBanditEnv


@dataclass
class BanditBenchmarkResult:
    average_reward: float
    average_regret: float
    rewards: List[float]
    regrets: List[float]


def run_bandit_benchmark(
    env: BernoulliBanditEnv,
    agent_factory: Callable[[Optional[int]], BanditAgent],
    *,
    seeds: Iterable[int],
    steps: int,
) -> BanditBenchmarkResult:
    """Run a bandit benchmark across multiple seeds.

    Parameters
    ----------
    env:
        Prototype environment. The benchmark will recreate environments with
        the same probability vector for each seed.
    agent_factory:
        Callable that returns a fresh agent when provided a seed.
    seeds:
        Iterable of seeds to average over.
    steps:
        Number of pulls per seed.
    """

    if steps <= 0:
        raise ValueError("steps must be positive")

    probs = env.probs
    regrets: List[float] = []
    rewards: List[float] = []
    seed_list = list(seeds)
    if not seed_list:
        raise ValueError("seeds must be non-empty")

    for seed in seed_list:
        run_env = BernoulliBanditEnv(probs, seed=seed)
        agent = agent_factory(seed)
        regret_fn = run_env.regret_function()

        total_reward = 0.0
        cumulative_regret = 0.0

        for _ in range(steps):
            action = agent(None)
            result = run_env.step(action)
            total_reward += result.reward
            cumulative_regret += regret_fn(action)
            agent.update(action, result.reward)

        regrets.append(cumulative_regret / steps)
        rewards.append(total_reward / steps)

    avg_regret = sum(regrets) / len(regrets)
    avg_reward = sum(rewards) / len(rewards)
    return BanditBenchmarkResult(
        average_reward=avg_reward,
        average_regret=avg_regret,
        rewards=rewards,
        regrets=regrets,
    )
