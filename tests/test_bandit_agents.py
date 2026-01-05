import math

from sirius_rl.agents.bandit import (
    EpsilonGreedyAgent,
    ThompsonSamplingBernoulliAgent,
    UCB1Agent,
)
from sirius_rl.env.bandit import BernoulliBanditEnv
from sirius_rl.eval.bandit_bench import run_bandit_benchmark
from sirius_rl.utils.seed import create_rng


class RandomAgent:
    def __init__(self, n_actions: int, seed: int) -> None:
        self.n_actions = n_actions
        self.rng = create_rng(seed)

    def __call__(self, observation=None):  # noqa: ANN001
        return self.rng.randrange(self.n_actions)

    def update(self, action: int, reward: float) -> None:
        return None


def test_bandit_agents_beat_random_baseline():
    probs = [0.1, 0.2, 0.8, 0.4, 0.3]
    steps = 400
    seeds = list(range(5))
    env = BernoulliBanditEnv(probs)

    baseline = run_bandit_benchmark(
        env, lambda seed: RandomAgent(len(probs), seed), seeds=seeds, steps=steps
    )

    epsilon_result = run_bandit_benchmark(
        env,
        lambda seed: EpsilonGreedyAgent(len(probs), epsilon=0.1, seed=seed),
        seeds=seeds,
        steps=steps,
    )
    ucb_result = run_bandit_benchmark(
        env,
        lambda seed: UCB1Agent(len(probs), c=0.5, seed=seed),
        seeds=seeds,
        steps=steps,
    )
    thompson_result = run_bandit_benchmark(
        env,
        lambda seed: ThompsonSamplingBernoulliAgent(len(probs), seed=seed),
        seeds=seeds,
        steps=steps,
    )

    assert epsilon_result.average_regret < baseline.average_regret * 0.75
    assert epsilon_result.average_reward > baseline.average_reward

    assert ucb_result.average_regret < epsilon_result.average_regret * 0.95
    assert thompson_result.average_regret < epsilon_result.average_regret * 0.95

    assert math.isclose(baseline.average_regret, 0.44, rel_tol=0.1)
    assert epsilon_result.average_reward > 0.6
    assert ucb_result.average_reward > 0.65
    assert thompson_result.average_reward > 0.65
