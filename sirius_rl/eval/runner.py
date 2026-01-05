"""Evaluation harness for environments and policies."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional

from sirius_rl.env.base import Environment, StepResult
from sirius_rl.utils.logging import JsonlLogger
from sirius_rl.utils.seed import create_rng

Policy = Callable[[Any], Any]


@dataclass
class EpisodeResult:
    total_reward: float
    steps: int
    regrets: Optional[List[float]] = None


@dataclass
class EvaluationResult:
    episode_results: List[EpisodeResult]

    @property
    def average_reward(self) -> float:
        if not self.episode_results:
            return 0.0
        return sum(ep.total_reward for ep in self.episode_results) / len(
            self.episode_results
        )

    @property
    def average_regret(self) -> Optional[float]:
        regrets = [ep.regrets[-1] for ep in self.episode_results if ep.regrets]
        if not regrets:
            return None
        return sum(regrets) / len(regrets)


def _run_single_episode(
    env: Environment,
    policy: Policy,
    *,
    steps: int,
    seed: Optional[int],
    episode_index: int,
    logger: Optional[JsonlLogger],
    regret_fn: Optional[Callable[[Any], float]],
) -> EpisodeResult:
    observation = env.reset(seed=seed)
    regrets: List[float] = []
    cumulative_regret = 0.0
    total_reward = 0.0
    step_count = -1

    for t in range(steps):
        step_count = t
        action = policy(observation)
        step_result: StepResult = env.step(action)
        observation = step_result.observation
        total_reward += step_result.reward
        if regret_fn:
            cumulative_regret += regret_fn(action)
            regrets.append(cumulative_regret)

        if logger:
            logger.log(
                seed=seed,
                t=t,
                episode=episode_index,
                reward=step_result.reward,
                info=step_result.info,
                extra={
                    "action": action,
                    "observation": observation,
                },
            )

        if step_result.terminated:
            break

    return EpisodeResult(total_reward=total_reward, steps=max(step_count + 1, 0), regrets=regrets or None)


def evaluate_policy(
    env: Environment,
    policy: Policy,
    *,
    steps: int,
    episodes: int = 1,
    seed: Optional[int] = None,
    logger: Optional[JsonlLogger] = None,
    regret_builder: Optional[Callable[[Any], Callable[[Any], float]]] = None,
) -> EvaluationResult:
    """Evaluate a policy on the provided environment.

    Parameters
    ----------
    env:
        Environment implementing the base protocol.
    policy:
        Callable mapping observation to an action.
    steps:
        Maximum steps per episode.
    episodes:
        Number of episodes to run.
    seed:
        Optional master seed for reproducibility.
    logger:
        Optional JsonlLogger to emit per-step records.
    regret_builder:
        Optional callable producing a regret function given the environment. It
        should return a function that accepts an action and returns regret.
    """

    runner_rng = create_rng(seed)
    episode_results: List[EpisodeResult] = []

    regret_fn: Optional[Callable[[Any], float]] = None
    if regret_builder:
        regret_fn = regret_builder(env)

    for ep in range(episodes):
        episode_seed = runner_rng.randrange(1_000_000) if seed is not None else None
        episode_results.append(
            _run_single_episode(
                env,
                policy,
                steps=steps,
                seed=episode_seed,
                episode_index=ep,
                logger=logger,
                regret_fn=regret_fn,
            )
        )

    return EvaluationResult(episode_results=episode_results)
