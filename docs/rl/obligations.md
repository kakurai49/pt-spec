# obligations (SIRIUS RL)

このページは **「守るべき約束（obligation）」** を ID で管理するための一覧です。Issue / PR では影響した obligation を **A_j** に列挙してください。

## ID 体系
- 形式: `<prefix>.<mission>.<domain>.<name>`
- prefix:
  - `biz` = 合格定義・価値最大化（Gate/基準の固定）
  - `gp` = 導線・運用・再現性（テンプレ/ラベル/Projects/再現）
  - `env` = 環境・世界・仕様（MDP/遷移/報酬）
  - `cur` = カリキュラム・アルゴリズム実装（Agents/DP/TD）
  - `eval` = 評価・テスト・CI ゲート（bench/test）
  - `obs` = 観測・ログ・可視化（CI 外の学習支援）

## 共通（全ミッション）
- `gp.common.repro.seed_fixed` — 乱数はローカル RNG（`numpy.random.Generator` 等）で seed 固定し、グローバル状態に依存しない。
- `gp.common.ops.minimal_diff` — 既存設計/命名/構造に沿い、不要なリファクタや大規模変更を避ける。
- `gp.common.ops.no_logs` — ライブラリコードやテストに print/debug ログを追加しない。
- `gp.common.ops.fast_ci` — CI 時間を短く、期待値評価や決定論を優先して非 flaky にする。
- `biz.common.review.a_j_required` — すべての Issue/PR で A_j（影響 obligation）を明記する。
- `obs.common.viz.ci_opt_out` — 可視化は `scripts/` 側など CI 外に置き、依存増・時間増を避ける。

## Mission 1 (Bandit)
- `env.m1.bandit.arms.probs_static` — アーム確率は固定で決定論的に扱い、ベンチマークが再現できること。
- `cur.m1.bandit.agent.eps_greedy` — ε-greedy などの agent は seed 入力を受け取り、rng を内部保持する。
- `cur.m1.bandit.agent.ucb` — UCB 系の実装も同様に再現性を維持する。
- `eval.m1.bandit.bench.expected_regret` — regret は `max_p - probs[action_t]` の期待 regret を用いて分散を抑える。
- `eval.m1.bandit.test.non_flaky_gate` — horizon/episodes/seeds は最小構成で安定し、テストが非 flaky であること。

## Mission 2 (MDP / DP)
- `env.m2.gridworld.deterministic` — GridWorld は決定論的な遷移と報酬を持つ（壁はその場に留まる等）。
- `env.m2.gridworld.model_fn` — `env.model()` などの API で遷移確率/報酬を取得できる。
- `cur.m2.dp.value_iteration` — Value Iteration の実装は小規模 Grid で収束し、seed 非依存。
- `cur.m2.dp.policy_iteration` — Policy Iteration も決定論環境で期待通りの方策に収束する。
- `eval.m2.dp.test.expected_policy` — 期待される価値/方策をテストで検証し、確率的要素を排除する。

## Mission 3 (TD / Q-learning)
- `env.m3.gridworld.deterministic` — TD でも確率的要素を入れず、決定論 GridWorld を使う。
- `cur.m3.td.q_learning` — Q-learning は epsilon 制御や学習率が seed で再現可能、RNG はローカル管理。
- `eval.m3.td.success_rate_gate` — success_rate >= 0.8 を合格基準とし、episodes/seeds は最小で安定化。
- `eval.m3.td.test.non_flaky_gate` — テストは固定 seed + 平均化で非 flaky、実行時間を短く保つ。

## 追加・更新の扱い
- obligation が未定義なら、本ファイルに ID 体系を守って追加する。
- 既存の obligation に影響した場合、PR の A_j に該当 ID を列挙する。
- 不要になった obligation を削除する際は、根拠と影響範囲を説明する。
