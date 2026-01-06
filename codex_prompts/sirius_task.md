---
description: SIRIUS RL: produce a Codex-ready task prompt (minimal, issue-style)
argument-hint: TITLE="..." PATHS="..." MISSION="m1|m2|m3|common" AJ="id1,id2" TESTS="pytest -q ..."
---

Title: $TITLE

Goal:
- <What must be true when done?>

Context:
- Mission: $MISSION
- Relevant paths: $PATHS
- Reference implementation/pattern: <optional>
- Constraints: no new deps, no print/log, keep diffs minimal, keep CI fast & non-flaky

A_j (affected obligations):
- $AJ

Requirements:
- [ ] <bullet requirements>

Verification:
- Run:
  - $TESTS
- Acceptance criteria:
  - <observable expected outcomes>

Deliverable:
- Implement + adjust/add minimal tests/docs if needed.
- Report commands you ran and outcomes (brief).
