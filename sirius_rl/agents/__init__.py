"""Agent implementations for Sirius RL tasks."""

from sirius_rl.agents.bandit import (
    BanditAgent,
    BetaParams,
    EpsilonGreedyAgent,
    ThompsonSamplingBernoulliAgent,
    UCB1Agent,
)

__all__ = [
    "BanditAgent",
    "BetaParams",
    "EpsilonGreedyAgent",
    "ThompsonSamplingBernoulliAgent",
    "UCB1Agent",
]
