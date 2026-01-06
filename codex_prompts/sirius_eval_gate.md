---
description: SIRIUS RL: Codex prompt for evaluation/tests (non-flaky gate)
argument-hint: TITLE="..." PATHS="..." MISSION="m1|m2|m3" AJ="id1,id2" TEST="pytest -q tests/..."
---

Title: $TITLE

Goal:
- Implement/adjust evaluation + tests so CI gate is stable (non-flaky).

Context:
- Mission: $MISSION
- Target files: $PATHS
- Non-flaky rules: seed-fixed, deterministic env, prefer expected metrics (e.g., expected regret)

A_j (affected obligations):
- $AJ

Requirements:
- [ ] Define metrics + thresholds explicitly (ratio/absolute)
- [ ] Failure message prints key numbers for debugging
- [ ] Keep runtime low (CI-friendly)

Verification:
- Run: $TEST
- Expected: test passes reliably with fixed seeds.
