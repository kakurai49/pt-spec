from sirius_rl.recommend.bandit_recommender import BanditRecommender
from scripts.sim_recommender import ARMS, compare


def test_recommender_has_three_arms():
    recommender = BanditRecommender(ARMS)
    assert len(recommender.arms) >= 3


def test_bandit_beats_random_on_average():
    results = compare(steps=180, seeds=[0, 1, 2])
    assert results["bandit_mean_reward"] > results["random_mean_reward"] + 0.05
