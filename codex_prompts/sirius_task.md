# SIRIUS RL — Task Prompt (Implementation)

Use this prompt when sending implementation work to Codex. Keep it short and focused on paths, requirements, and verification.

```
You are working on the SIRIUS RL repository.
Follow AGENTS.md (minimal diff, seed-fixed RNG, non-flaky tests, no print/log).

Mission: <m1/m2/m3/common>
Scope (S column): <gp/cur/env/obs/biz>
Goal:
- <bullet list of done conditions>

Relevant paths:
- <sirius_rl/... or docs/...>

Requirements / constraints:
- No new dependencies
- Deterministic env (if applicable)
- RNG = local Generator seeded via input
- No debug prints; keep CI fast

A_j (impacted obligations):
- <id from docs/rl/obligations.md>

Verification (fastest reproducible):
- pytest -q <tests/...>  # keep short

Return only the code diff with minimal commentary.
```
