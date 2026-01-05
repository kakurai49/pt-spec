"""Simple simulation comparing random vs bandit-based recommendation."""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field
from typing import Dict, List

from sirius_rl.recommend import BanditRecommender
from sirius_rl.utils.seed import create_rng


ARMS = ["bandit_easy", "bandit_standard", "bandit_hard"]


@dataclass
class SimulatedLearner:
    rng_seed: int
    mastery: float = field(init=False)
    rng: random.Random = field(init=False)
    last_outcome: str = field(default="unknown", init=False)
    last_time_spent: float = field(default=1.0, init=False)
    trials: int = field(default=0, init=False)
    mastery_estimate: float = field(default=0.5, init=False)

    def __post_init__(self) -> None:
        self.rng = create_rng(self.rng_seed)
        self.mastery = self.rng.uniform(0.25, 0.8)

    @property
    def context(self) -> Dict[str, float | str]:
        return {
            "mastery_estimate": self.mastery_estimate,
            "last_outcome": self.last_outcome,
            "time_spent": self.last_time_spent,
            "trials": self.trials,
        }

    def step(self, arm: str) -> tuple[float, Dict[str, float | str]]:
        difficulty = {
            "bandit_easy": 0.25,
            "bandit_standard": 0.55,
            "bandit_hard": 0.8,
        }[arm]

        # Higher cost for harder missions.
        base_time = 3.0 * difficulty + 0.5
        variability = self.rng.random()
        time_spent = base_time * (0.8 + 0.4 * variability)

        skill_gap = self.mastery - difficulty
        success_prob = max(0.05, min(0.95, 0.5 + 0.8 * skill_gap))

        submitted = self.rng.random() < (0.92 - 0.25 * max(0.0, -skill_gap))
        success = submitted and (self.rng.random() < success_prob)

        reward = -0.1 * math.log(time_spent + 1.0)
        if submitted:
            reward += 0.2
            if success:
                reward += 1.0
                self.mastery = min(1.0, self.mastery + 0.02 * (1.0 - self.mastery))
                self.last_outcome = "success"
            else:
                reward -= 0.5
                self.mastery = max(0.05, self.mastery - 0.01 * self.mastery)
                self.last_outcome = "fail"
        else:
            reward -= 0.5
            self.last_outcome = "timeout"

        # Update mastery estimate via exponential moving average of successes.
        outcome_signal = 1.0 if success else 0.0
        self.mastery_estimate = 0.7 * self.mastery_estimate + 0.3 * outcome_signal
        self.last_time_spent = time_spent
        self.trials += 1
        return reward, self.context


def run_policy(policy: str, steps: int, seed: int) -> float:
    learner = SimulatedLearner(seed)
    rng = create_rng(seed + 99)
    recommender = BanditRecommender(ARMS, seed=seed) if policy == "bandit" else None

    rewards: List[float] = []
    for _ in range(steps):
        context = learner.context
        if policy == "bandit" and recommender is not None:
            arm = recommender.recommend(context)
        else:
            arm = rng.choice(ARMS)

        reward, _ = learner.step(arm)
        rewards.append(reward)

        if recommender is not None:
            recommender.update(context, arm, reward)

    return sum(rewards) / len(rewards)


def compare(steps: int = 200, seeds: list[int] | None = None) -> dict[str, float]:
    seeds = seeds or [0, 1, 2, 3, 4]
    bandit_scores: List[float] = []
    random_scores: List[float] = []

    for seed in seeds:
        bandit_scores.append(run_policy("bandit", steps, seed))
        random_scores.append(run_policy("random", steps, seed))

    return {
        "bandit_mean_reward": sum(bandit_scores) / len(bandit_scores),
        "random_mean_reward": sum(random_scores) / len(random_scores),
    }


if __name__ == "__main__":
    results = compare()
    print("Recommender vs Random (average reward)")
    print(results)
