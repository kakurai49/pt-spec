"""Dynamic programming algorithms for tabular MDPs."""

from __future__ import annotations

from typing import List, Tuple

from sirius_rl.env.gridworld import GridWorldEnv, Transition


def value_iteration(
    env: GridWorldEnv,
    gamma: float,
    theta: float = 1e-6,
) -> Tuple[List[float], List[int]]:
    """Run value iteration returning value function and greedy policy."""

    V = [0.0 for _ in range(env.n_states)]
    model = env.model()

    while True:
        delta = 0.0
        for s in range(env.n_states):
            if s in env.terminal_states:
                continue
            v = V[s]
            q_values = []
            for a in range(env.n_actions):
                transitions = model[s][a]
                q = sum(
                    t.probability * (t.reward + gamma * V[t.next_state])
                    for t in transitions
                )
                q_values.append(q)
            V[s] = max(q_values)
            delta = max(delta, abs(v - V[s]))
        if delta < theta:
            break

    policy: List[int] = []
    for s in range(env.n_states):
        if s in env.terminal_states:
            policy.append(0)
            continue
        q_values = []
        for a in range(env.n_actions):
            transitions = model[s][a]
            q = sum(
                t.probability * (t.reward + gamma * V[t.next_state])
                for t in transitions
            )
            q_values.append(q)
        policy.append(int(max(range(len(q_values)), key=q_values.__getitem__)))

    return V, policy


def _policy_evaluation(env: GridWorldEnv, policy: List[int], gamma: float, theta: float) -> List[float]:
    model = env.model()
    V = [0.0 for _ in range(env.n_states)]
    while True:
        delta = 0.0
        for s in range(env.n_states):
            if s in env.terminal_states:
                continue
            v = V[s]
            action = policy[s]
            transitions: List[Transition] = model[s][action]
            V[s] = sum(
                t.probability * (t.reward + gamma * V[t.next_state])
                for t in transitions
            )
            delta = max(delta, abs(v - V[s]))
        if delta < theta:
            break
    return V


def policy_iteration(env: GridWorldEnv, gamma: float, theta: float = 1e-6) -> Tuple[List[float], List[int]]:
    """Iterative policy evaluation and improvement."""

    policy = [0 for _ in range(env.n_states)]
    model = env.model()

    while True:
        V = _policy_evaluation(env, policy, gamma, theta)
        policy_stable = True
        for s in range(env.n_states):
            if s in env.terminal_states:
                continue
            old_action = policy[s]
            action_values = []
            for a in range(env.n_actions):
                transitions = model[s][a]
                q = sum(
                    t.probability * (t.reward + gamma * V[t.next_state])
                    for t in transitions
                )
                action_values.append(q)
            best_action = int(max(range(len(action_values)), key=action_values.__getitem__))
            policy[s] = best_action
            if best_action != old_action:
                policy_stable = False
        if policy_stable:
            return V, policy
