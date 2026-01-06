# SIRIUS Issue Pack (S=EVAL)

S列: eval（評価・テスト・CIゲート）。タイトルと本文をそのままIssueに貼れる形式。

---

```text
Title: [S-EVAL][M1] bandit_bench: 複数seedの reward/regret を返す評価関数を実装
Labels: S-EVAL, M1-BANDIT, type:test
S: eval
Mission: m1

Body:
## 目的
ミッション1の評価指標（reward/regret）をベンチ関数として実装し、テストから使えるようにする。

## 成果物
- `sirius_rl/eval/bandit_bench.py`
  - 複数seedで平均した reward と regret を返す関数
  - 例: evaluate(agent_cls, probs, T, seeds, **agent_kwargs) -> dict

## 受入条件（DoD）
- [ ] 乱数seedを入力として受け取れる
- [ ] 固定probs、T=300〜800、seeds=5〜10程度で安定
- [ ] regret を定義できている（最適腕との差分など）
- [ ] 実行が短い（CI想定）

## A_j（影響obligation）
- eval.m1.bandit.bench.reward_mean
- eval.m1.bandit.bench.regret_mean
- eval.m1.bandit.bench.seed_aggregation

## Codex prompt
`bandit_bench.py` を実装してください。

要件:
1) Bernoulli bandit を前提に `probs: list[float]` を受け取る。
2) 1 trial:
   - env: arm i を引くと Bernoulli(probs[i]) のreward
   - agent: select_action -> update
   - horizon T 回まわす
3) regret:
   - 期待最適報酬: max(probs)
   - 期待regret（推奨）: sum_t (max_p - probs[action_t])
     ※サンプルrewardではなく期待値で計算すると分散が小さくCIが安定
4) 複数seed:
   - seedsごとにtrialを回して平均を返す
5) 返り値:
   - mean_reward（サンプル平均でもOK）
   - mean_regret（上の期待regret推奨）
   - optional: per_seed 結果、per_step 曲線（CI外用途）

制約:
- 速度重視。Tとseedsはテストで小さく。
- numpyが既にあるなら使って良いが、新規依存は追加しない。
```

```text
Title: [S-EVAL][M1] test_bandit_agents: random baselineより平均regretが低いことを安定に検証
Labels: S-EVAL, M1-BANDIT, type:test
S: eval
Mission: m1

Body:
## 目的
ミッション1の合格ゲートを pytest で安定化する（非flaky）。

## 成果物
- `tests/test_bandit_agents.py`
  - random baseline と ε-greedy/UCB/TS を比較するテスト
  - シラバス目安の比率ゲートを採用

## 受入条件（DoD）
- [ ] seeds固定、平均値/相対評価で判定（非flaky）
- [ ] 目安:
  - ε-greedy <= baseline*0.75
  - UCB <= ε-greedy*0.95
  （必要ならTSも同様に設定）
- [ ] CI時間が短い（T=300〜800、seeds=5〜10）

## A_j（影響obligation）
- eval.m1.bandit.test.baseline_compare
- eval.m1.bandit.test.non_flaky_gate
- biz.m1.bandit.pass_criteria.regret_ratio

## Codex prompt
`tests/test_bandit_agents.py` を追加してください。

実装方針:
1) `bandit_bench` を呼び出して mean_regret を取得。
2) baseline:
   - もし RandomAgent が無ければテスト内で簡易実装（均一ランダム）するか、既存を探して使う。
3) テストの安定化:
   - regretを「期待regret」（max_p - probs[action] の和）で計算しているなら分散が低く安定する
   - seedsを固定し、seeds数で平均する
   - 閾値は \"相対\"（ratio）にする
4) 推奨パラメータ:
   - probs = [0.1, 0.2, 0.8] のように差が大きいもの
   - T=500, seeds=10（CIと相談）
5) assert:
   - eps <= baseline*0.75
   - ucb <= eps*0.95
   - （TSは baseline*? を設定、または epsより良い程度にする）

注意:
- 失敗時メッセージに mean_regret 値を出してデバッグ可能にする。
```

```text
Title: [S-EVAL][M2] test_gridworld_dp: 小規模Gridで最適方策が期待どおりになることを検証
Labels: S-EVAL, M2-MDP, type:test
S: eval
Mission: m2

Body:
## 目的
GridWorld + DP の合格判定を pytest で安定化する。

## 成果物
- `tests/test_gridworld_dp.py`

## 受入条件（DoD）
- [ ] 小規模グリッドで最適方策が期待どおり
- [ ] pytest が安定して通る（決定論）
- [ ] 実行が短い

## A_j（影響obligation）
- eval.m2.dp.test.expected_policy
- env.m2.gridworld.model.transition_table
- cur.m2.dp.value_iteration

## Codex prompt
`tests/test_gridworld_dp.py` を追加してください。

手順:
1) GridWorldの最小構成を作る（例: 3x3 or 4x4、壁1つ、startとgoal）。
2) `value_iteration` と `policy_iteration` を実行して policy を得る。
3) policy の期待検証:
   - startからpolicyに従って進むと、最短（または期待どおりの）経路でgoalに到達する
   - 壁でその場停止が正しく起きる
4) assert:
   - goal到達までのステップ数が一定以内
   - ある特定stateでは行動が決め打ち（例: 右に行くべき等）を1-2箇所確認

注意:
- reward設計がパラメータなら、テスト内で明示して固定。
- 収束tol/max_iterは小さくし、CIを短時間に。
```

```text
Title: [S-EVAL][M3] td_eval: 学習→評価(success_rate/avg_reward) を複数seedで返す
Labels: S-EVAL, M3-QLEARN, type:test
S: eval
Mission: m3

Body:
## 目的
Q-learningの学習後policyを、複数seedで安定に評価できるハーネスを作る。

## 成果物
- `eval/td_eval.py`（または既存evalディレクトリ方針に合わせた場所）
  - train -> derive policy -> evaluate を行う関数/CLI
  - success_rate / avg_reward を返す

## 受入条件（DoD）
- [ ] seeds 3〜5程度で平均化できる
- [ ] 成功率>=0.8などのゲートに使える
- [ ] ログは小さく（必要ならjson1行など）

## A_j（影響obligation）
- eval.m3.td.eval_runner
- eval.m3.td.success_rate
- obs.m3.td.metrics_schema_fixed

## Codex prompt
`eval/td_eval.py` を追加/実装してください。

要件:
1) 対象env:
   - まずは GridWorld を使う（M2で実装した env を再利用）
2) train:
   - `q_learning(env, episodes=..., alpha=..., gamma=..., epsilon=..., seed=...)` でQを学習
   - `derive_greedy_policy(Q)` でpolicyを得る
3) evaluate:
   - 複数episode（例: 50）を greedy policy で回し success を判定
   - successの定義は env の done/goal 到達
4) 返り値:
   - `{\"success_rate\": float, \"avg_return\": float}` を seeds で平均したもの
5) CIを意識:
   - episodesは500〜2000の範囲で、テストが安定する最小を選ぶ（テスト側で固定する）

注意:
- 確率環境にしない（非flaky）。
- seedからrngを作り、episodeごとのseed派生を一定規則にする（例: seed+episode）。
```

```text
Title: [S-EVAL][M3] test_q_learning: success_rate>=0.8 を非flakyにゲートする
Labels: S-EVAL, M3-QLEARN, type:test
S: eval
Mission: m3

Body:
## 目的
ミッション3合格基準（成功率>=0.8）をpytestで安定判定する。

## 成果物
- `tests/test_q_learning.py`

## 受入条件（DoD）
- [ ] episodes 500〜2000、seeds 3〜5程度で success_rate>=0.8
- [ ] seed固定、非flaky
- [ ] CI短時間

## A_j（影響obligation）
- eval.m3.td.test.non_flaky_gate
- eval.m3.td.success_rate.ge_0_8
- biz.m3.qlearn.pass_criteria.success_rate

## Codex prompt
`tests/test_q_learning.py` を追加してください。

手順:
1) `td_eval` の評価関数を呼び出し、`success_rate` を得る。
2) env は deterministic GridWorld を固定構成で使う（小さく簡単なもの）。
3) ハイパーパラメータを固定:
   - alpha/gamma/epsilon、episodes/max_steps を固定値にする
4) seeds:
   - 例: seeds=[0,1,2,3,4] など固定
5) assert:
   - success_rate >= 0.8
6) 失敗時に success_rate, avg_return を出力してデバッグ可能にする。

注意:
- 収束が遅い場合は、環境の報酬設計（step penalty等）を調整できるようにしておく（env側パラメータ）。
- ただしCIが重くならないよう最小構成で。
```
