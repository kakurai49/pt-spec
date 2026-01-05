from sirius_rl.algorithms.dp import policy_iteration, value_iteration
from sirius_rl.env.gridworld import GridWorldEnv


def sid(x: int, y: int, width: int) -> int:
    return y * width + x


def build_env():
    width, height = 4, 4
    return GridWorldEnv(
        width=width,
        height=height,
        walls=[(1, 1)],
        start=(0, 0),
        terminals=[(3, 3)],
        reward_map={(3, 3): 1.0},
        step_penalty=-0.04,
    )


def test_value_iteration_policy_moves_toward_goal():
    env = build_env()
    V, policy = value_iteration(env, gamma=0.9, theta=1e-5)

    start_action = policy[sid(0, 0, env.width)]
    assert start_action in (1, 2)  # right or down

    near_goal_state = sid(2, 3, env.width)
    assert policy[near_goal_state] == 1  # move right into the goal

    assert V[sid(3, 3, env.width)] == 0.0  # terminal state's value remains zero


def test_policy_iteration_converges_to_reasonable_policy():
    env = build_env()
    V, policy = policy_iteration(env, gamma=0.9, theta=1e-5)

    start_action = policy[sid(0, 0, env.width)]
    assert start_action in (1, 2)

    near_wall_state = sid(1, 0, env.width)
    assert policy[near_wall_state] in (1, 2)  # avoid walking back into start/left

    near_goal_state = sid(2, 3, env.width)
    assert V[near_goal_state] > V[sid(0, 0, env.width)]
    assert V[sid(0, 0, env.width)] > 0.0
