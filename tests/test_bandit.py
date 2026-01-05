from sirius_rl.env.bandit import BernoulliBanditEnv
from sirius_rl.eval import regret
from sirius_rl.eval.runner import evaluate_policy
from sirius_rl.utils.seed import create_rng


def test_bandit_seed_reproducible():
    probs = [0.3, 0.6]
    actions = [0, 1, 0, 1, 1]

    env_a = BernoulliBanditEnv(probs)
    env_b = BernoulliBanditEnv(probs)

    env_a.reset(seed=99)
    env_b.reset(seed=99)

    rewards_a = [env_a.step(a).reward for a in actions]
    rewards_b = [env_b.step(a).reward for a in actions]

    assert rewards_a == rewards_b


def test_expected_regret():
    probs = [0.1, 0.9]
    actions = [0, 1, 0, 1]
    cumulative = regret.cumulative_regret(probs, actions)

    assert cumulative[-1] == (0.9 - 0.1) * 2
    assert cumulative == [0.8, 0.8, 1.6, 1.6]


def test_random_policy_baseline_regret_and_reward():
    probs = [0.2, 0.8]
    env = BernoulliBanditEnv(probs)
    rng = create_rng(7)

    def random_policy(_obs):
        return rng.randrange(len(probs))

    result = evaluate_policy(
        env,
        random_policy,
        steps=20,
        episodes=5,
        seed=2024,
        regret_builder=lambda e: e.regret_function(),
    )

    # Deterministic thanks to fixed seeds
    assert result.average_reward == 10.2
    assert result.average_regret is not None
    assert round(result.average_regret, 3) == 6.12
