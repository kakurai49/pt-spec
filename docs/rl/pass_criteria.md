# pass criteria (SIRIUS RL)

合格基準（CI ゲート）を明文化します。実装・テストはこの基準に合わせ、**非 flaky（seed 固定 / 決定論 / 期待値評価）** を最優先にします。

## 共通（CI 設計の原則）
- seed を固定し、グローバル RNG に依存しない。
- ratio / 期待値を優先して分散を下げる（例: regret は期待 regret）。
- 環境は可能な限り決定論的にし、確率的な遷移を CI に含めない。
- episodes / horizon / seeds は必要最小限で短時間に収束する構成を選ぶ。
- ログや可視化は CI から外す（scripts や notebooks 側に寄せる）。

## Mission 1 (Bandit) — regret gate
- metric: 期待 regret = `sum_t (max_p - probs[action_t])`
- thresholds:
  - `eps_regret <= baseline_regret * 0.75` を目安に改善
  - `ucb_regret <= eps_regret * 0.95` で上位手法の優位を確認
- setup: 少数のアーム（例: 3〜5）、短い horizon で安定する seed を使用
- notes: RNG を内部保持し tie-break も seed で再現する

## Mission 2 (MDP / DP) — expected policy gate
- env: 決定論 GridWorld（壁はその場に留まる、ゴールで終了）
- metrics:
  - 価値関数が閾値以内で収束（例: `|V_k - V_{k-1}| < tol`）
  - 方策が期待どおり（ゴールへの最短経路、壁回避）
- setup: 小規模 Grid（3x3〜5x5）で iteration 回数を抑え、seed 非依存
- notes: 遷移/報酬は `env.model()` 等で取得できることを確認

## Mission 3 (TD / Q-learning) — success_rate gate
- metric: success_rate >= 0.8
- setup:
  - episodes: 500〜2000 の範囲で最小の安定点を選択
  - seeds: 3〜5 で平均化し、固定 seed を明示
  - epsilon/alpha/gamma は既存設定に合わせ、rng はローカル管理
- notes: 確率的遷移を入れず、決定論 GridWorld 上で学習を評価する
