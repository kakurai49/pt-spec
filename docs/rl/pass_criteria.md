# Pass criteria（合格基準）とCI非flaky化

このリポジトリの合格は「CIのゲートを安定して通ること」です。確率要素は**seed固定**と**期待値評価**で吸収し、テストが揺れない設計にします。

## 共通原則（Non-flaky）
- **seed固定**: 乱数は `seed` から生成したrngに閉じ込める（グローバルrngを使わない）。
- **決定論の優先**: 環境は可能な限り決定論（GridWorldは決定論）。
- **期待値で評価**: Bandit regret はサンプル報酬ではなく「期待regret」を優先する。
- **CIを軽く**: horizon/episodes/seeds は最小構成で安定する値にする（テスト側で固定）。

---

## Mission 1（Bandit）
### 目的
- Bandit agents（EpsilonGreedy/UCB1/Thompson Sampling）を実装し、ベンチ関数＋pytestで安定に比較できるようにする。

### 合格基準（推奨ゲート）
- `bandit_bench` が複数seedで `mean_reward` / `mean_regret` を返せる。
- pytestで「random baseline より regret が十分小さい」ことを**相対**で判定する。
  - 例（推奨）:
    - `eps_regret <= baseline_regret * 0.75`
    - `ucb_regret <= eps_regret * 0.95`
    - `ts_regret` は baseline より良い、または eps より良い等の閾値を設定

### テスト安定化の推奨設定
- `probs = [0.1, 0.2, 0.8]` のように差が大きいもの
- `T=300〜800`、`seeds=5〜10` を目安に「最小で安定」する値に調整
- regret は **期待regret**:
  - `regret = sum_t (max(probs) - probs[action_t])`
  - ※サンプルrewardで計算すると分散が大きくなりflakyになりやすい

---

## Mission 2（MDP/GridWorld + DP）
### 目的
- 決定論GridWorld + `env.model()`（遷移表）を土台に、DP（価値反復/方策反復）を実装し、最適方策がテストで固定できるようにする。

### 合格基準（推奨ゲート）
- GridWorldが決定論である（壁はその場・遷移が固定）。
- `value_iteration` / `policy_iteration` が `env.model()` を使って最適方策（または価値）を導出できる。
- 小規模Gridで「期待どおりの最適方策」になることをpytestで検証できる。

---

## Mission 3（TD/Q-learning）
### 目的
- `q_learning` で学習し、greedy policy を導出し、deterministic GridWorld上で成功率（success_rate）を評価できるようにする。

### 合格基準（ゲート）
- `td_eval`（学習→評価）が複数seedで `success_rate` と `avg_return` を返す。
- pytestで `success_rate >= 0.8` を**非flaky**にゲートする（環境は決定論・seed固定）。

### テスト安定化の推奨設定
- 環境は deterministic GridWorld（小さく簡単な構成）
- ハイパーパラメータ（alpha/gamma/epsilon, episodes/max_steps）を固定
- seeds例: `[0,1,2,3,4]` のように固定し平均

---

## PRに必ず書くこと（再現性）
- Seed / Algorithm / Steps
- Time Spent(min) / Trials / Outcome(Pass/Fail) / Notes
- A_j（影響obligation）: 変更が効くIDを列挙（1行1ID）
