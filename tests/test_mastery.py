from sirius_rl.obs.mastery import DEFAULT_RULES, mean_p, recommend_guide_level, update_beta


def test_update_beta_and_mean():
    alpha, beta = 1.0, 1.0

    alpha, beta = update_beta(alpha, beta, True)
    assert (alpha, beta) == (2.0, 1.0)

    alpha, beta = update_beta(alpha, beta, False)
    assert (alpha, beta) == (2.0, 2.0)

    assert mean_p(alpha, beta) == 0.5


def test_recommend_guide_level():
    rules = {**DEFAULT_RULES, "min_level": 1, "max_level": 5}

    assert recommend_guide_level(0.4, 3, rules) == 4  # easier
    assert recommend_guide_level(0.6, 3, rules) == 3  # stay
    assert recommend_guide_level(0.9, 3, rules) == 2  # harder

    # Respect bounds
    assert recommend_guide_level(0.2, 5, rules) == 5
    assert recommend_guide_level(0.95, 1, rules) == 1
