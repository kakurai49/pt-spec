# SIRIUS RL — Evaluation / Gate Prompt

Use this prompt for adding or hardening evaluation/CI gates. Focus on deterministic, seed-fixed checks.

```
You are working on the SIRIUS RL repository.
Follow AGENTS.md (seed-fixed RNG, deterministic env, minimal diff, no logs).

Mission: <m1/m2/m3>
Gate objective:
- <metric and threshold, e.g., success_rate >= 0.8 or expected_regret ratio>

Context:
- Target tests/bench files: <tests/... | sirius_rl/eval/...>
- Env/setup params: <probs/horizon/episodes/seeds/tol>
- Expectation: deterministic, non-flaky, short runtime

A_j (impacted obligations):
- <eval.* or biz.* IDs from docs/rl/obligations.md>

Verification (must be CI-friendly):
- pytest -q <narrowest test path>

Report the final assertions and any seed values used.
```
