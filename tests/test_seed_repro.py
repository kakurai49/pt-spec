import json
from pathlib import Path

from sirius_rl.env.bandit import BernoulliBanditEnv
from sirius_rl.eval.runner import evaluate_policy
from sirius_rl.utils.logging import JsonlLogger


def test_runner_reproducible():
    probs = [0.2, 0.8]
    env1 = BernoulliBanditEnv(probs)
    env2 = BernoulliBanditEnv(probs)

    def policy(_: object) -> int:
        return 1

    res1 = evaluate_policy(env1, policy, steps=10, episodes=3, seed=42)
    res2 = evaluate_policy(env2, policy, steps=10, episodes=3, seed=42)

    assert res1.average_reward == res2.average_reward
    assert [ep.total_reward for ep in res1.episode_results] == [
        ep.total_reward for ep in res2.episode_results
    ]


def test_jsonl_logger_schema(tmp_path: Path):
    log_path = tmp_path / "train.log"
    logger = JsonlLogger(log_path, run_id="run-1")
    logger.log(seed=123, t=0, episode=0, reward=1.0, info={"note": "ok"})

    with log_path.open() as fp:
        line = fp.readline()
    record = json.loads(line)
    for field in ("run_id", "seed", "t", "episode", "reward", "info"):
        assert field in record
    assert record["run_id"] == "run-1"
    assert record["seed"] == 123
    assert record["t"] == 0
    assert record["episode"] == 0
    assert record["reward"] == 1.0
    assert record["info"] == {"note": "ok"}
