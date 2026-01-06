# SIRIUS S列沿いのGitHub Issue集合（コピペ用）

各Issueは「タイトル欄」と「本文」をそのままGitHub Issueに貼れる形式。S列（gp/cur/env/eval/obs/biz）とミッション（M1/M2/M3）で整理している。ラベルは `S-*`, `M*`, `type:*` を併用する想定。

---

## S=GP（運用・導線）

```text
Title: [S-GP][COMMON] Projects/Labels/Issue Form/PRテンプレ整備（SIRIUS RL）
Labels: S-GP, type:ops
S: gp
Mission: common

Body:
## 目的
SIRIUSミッション1/2/3を「Issue→PR→CI→合格」まで迷わず回すための運用土台を整える。

## 背景（要点）
- Issue Formで 受講者/期限/ガイドLv/時間上限 を入力する運用にする
- PRテンプレには 所要時間/試行回数/Outcome と、再現性（seed/アルゴリズム/ステップ数）を残す
- Projectsで Backlog→Doing→Submitted→Review→Rework→Done を追跡し、自動追加も可能にする
- mainはテスト必須で保護

## 作業内容（DoD）
- [ ] Labels を作成
  - S-GP / S-CUR / S-ENV / S-EVAL / S-OBS / S-BIZ
  - M1-BANDIT / M2-MDP / M3-QLEARN
  - type:feature / type:test / type:docs / type:ops / type:analysis
- [ ] GitHub Projects (v2) を作成 or 既存にフィールド追加
  - Status: Backlog, Doing, Submitted, Review, Rework, Done
  - S: GP/CUR/ENV/EVAL/OBS/BIZ
  - Mission: M1/M2/M3
- [ ] Issue Forms を .github/ISSUE_TEMPLATE に追加（この回答のテンプレを採用）
- [ ] PRテンプレを追加/更新（seed/アルゴリズム/ステップ数 + 所要時間/試行回数/Outcome）
- [ ] Actions(python-ci) が Issue→PR の流れで確実に走ることを確認
- [ ] mainブランチ保護：CI通過必須（マージ不可）

## A_j（影響obligation）
- gp.common.projects.status_workflow
- gp.common.labels.s_field_sync
- gp.common.issue_form.fields
- gp.common.pr_template.reproducibility

## Codex prompt
あなたはリポジトリ管理者の補助です。以下を実装してください。
1) `.github/ISSUE_TEMPLATE/` に issue forms YAML を追加。`config.yml`, `rl_impl.yml`, `rl_eval.yml` を作る。
2) `.github/pull_request_template.md`（または既存PRテンプレ）を編集し、以下のセクションを追加:
   - Seed / Algorithm / Steps
   - Time Spent(min) / Trials / Outcome(Pass/Fail) / Notes
3) 可能なら `.github/workflows/` に "label -> Projects(Sフィールド)" 同期のActionを追加（GitHub Projects v2 API）。
   - できない場合は README に手動運用手順を追記。
4) 変更後、テンプレがGitHub上で選択できること、PRテンプレが表示されることを確認。
制約: 既存CIを壊さない。外部依存を増やさない。
```

```text
Title: [S-BIZ][COMMON] obligation(ID体系)・合格基準(pass criteria)を定義し、A_j運用を固定
Labels: S-BIZ, type:ops
S: biz
Mission: common

Body:
## 目的
「何を最大収益(=成功)にするか」を明文化し、ミッション1/2/3の合格基準を"定数"として固定する。
あわせて obligation ID体系（gp/eval/env/cur/obs/biz）をリポジトリに正式に置く。

## 方針（最大収益の定義）
- M1: 期待報酬を最大化（= regret最小化）
- M2: 価値反復/方策反復で最適方策を得る（= 期待割引収益最大化）
- M3: 学習後方策の成功率を最大化（>=0.8 をゲートにする）
※CIは短時間・非flaky・seed固定で再現可能にする

## 作業内容（DoD）
- [ ] `docs/rl/obligations.md`（または `docs/rl/obligations.yml`）を作成し、
      prefix別（gp/cur/env/eval/obs/biz）に obligation を列挙
- [ ] `docs/rl/pass_criteria.md` を作成し、ミッション別の閾値を明記
  - M1: ε-greedy <= baseline*0.75, UCB <= ε-greedy*0.95 など（シラバス準拠）
  - M3: success_rate>=0.8, episodes=500..2000, seeds=3..5（シラバス準拠）
- [ ] PRテンプレに「A_j（影響obligation）」セクションを追加（なければ）
- [ ] 以後の全Issueで A_j を必須入力にする

## A_j（影響obligation）
- biz.common.pass_criteria.definition
- gp.common.pr_template.aj_required
- eval.m1.bandit.pass_thresholds
- eval.m3.td.pass_thresholds

## Codex prompt
あなたはドキュメント整備担当です。
1) `docs/rl/obligations.md` を新規作成。ID体系ルールと、ミッション1-3のobligation一覧を記載。
2) `docs/rl/pass_criteria.md` を新規作成。ミッション別の合格基準と、CI非flaky化の注意を書く。
3) PRテンプレに「A_j（影響obligation）」欄が無ければ追加。
制約: 既存ページ/CIを壊さない。短く読みやすく。
```

---

## S=CUR（実装：アルゴリズム/カリキュラム）

```text
Title: [S-CUR][M1] Bandit: EpsilonGreedyAgent を実装する（seed再現・単体動作）
Labels: S-CUR, M1-BANDIT, type:feature
S: cur
Mission: m1

Body:
## 目的
Banditの探索/活用の入口として、EpsilonGreedyAgent を実装する。
（後続のbench/testで評価するため、まずは単体として正しく動く状態にする）

## 成果物
- `sirius_rl/agents/bandit.py`
  - `EpsilonGreedyAgent` クラス実装（既存のAgentインターフェースに準拠）

## 受入条件（DoD）
- [ ] 既存インターフェースに合致（初期化、select_action、update など）
- [ ] seed固定で同じ挙動が再現できる（乱数は RNG を内部保持）
- [ ] 探索率 epsilon をパラメータ化（既定値あり）
- [ ] ログは最小（CIで不要なprintなし）

## A_j（影響obligation）
- cur.m1.bandit.agent.eps_greedy
- gp.common.repro.seed_fixed

## Codex prompt
あなたはPython実装者です。リポジトリの既存設計に合わせて Bandit agent を実装してください。

手順:
1) `sirius_rl/agents/bandit.py` を開き、既存の `Agent` 基底やプロトコル（メソッド名/引数）を確認する。
2) `EpsilonGreedyAgent` を実装:
   - 内部に `rng`（例: numpy.random.Generator）を持ち、コンストラクタで `seed` を受ける（または外部seed注入の仕組みに合わせる）。
   - `select_action()`:
     - 確率 epsilon でランダムに腕を選ぶ（0..n_arms-1）
     - それ以外は推定平均が最大の腕を選ぶ（同値はrngでタイブレーク）
   - `update(action, reward)`:
     - 各腕の試行回数と平均推定を更新（オンライン更新式）
3) docstring/type hints を付与。
4) 既存の unit test があれば壊さない。なければこのIssueではテスト追加不要（次のIssueでまとめて行う）。

制約:
- 外部依存を増やさない（numpyが既にある場合のみ使う）。
- CIを重くしない。print/debugログは禁止。
```

```text
Title: [S-CUR][M1] Bandit: UCB1Agent を実装する（探索の別解）
Labels: S-CUR, M1-BANDIT, type:feature
S: cur
Mission: m1

Body:
## 目的
Banditの代表手法として UCB1Agent を実装する。

## 成果物
- `sirius_rl/agents/bandit.py`
  - `UCB1Agent` クラス実装

## 受入条件（DoD）
- [ ] UCB1スコア（平均 + 探索ボーナス）で腕を選択
- [ ] 0回の腕は優先的に試す（ゼロ除算/inf回避）
- [ ] seed固定で再現できる（タイブレークのみ乱数）

## A_j（影響obligation）
- cur.m1.bandit.agent.ucb1
- gp.common.repro.seed_fixed

## Codex prompt
`bandit.py` の既存インターフェースに合わせて `UCB1Agent` を追加実装してください。

仕様:
- 状態: 各腕の試行回数 n_i、推定平均 mean_i、総試行回数 t を保持
- `select_action()`:
  - n_i==0 の腕があればそれを返す（複数ならrngで選ぶ）
  - それ以外は `mean_i + c*sqrt(log(t)/n_i)`（cはパラメータ、既定値あり）最大の腕
- `update(action, reward)` で統計量更新

注意:
- t の定義（update前/後）で式が変わらないように一貫させる。
- 乱数はタイブレークのみに使用。
```

```text
Title: [S-CUR][M1] Bandit: ThompsonSamplingBernoulliAgent を実装する（ベイズ探索）
Labels: S-CUR, M1-BANDIT, type:feature
S: cur
Mission: m1

Body:
## 目的
Bernoulli bandit のThompson Samplingを実装し、探索戦略の比較材料を揃える。

## 成果物
- `sirius_rl/agents/bandit.py`
  - `ThompsonSamplingBernoulliAgent` クラス実装

## 受入条件（DoD）
- [ ] Beta事前(a,b) を持ち、各腕で成功/失敗を更新
- [ ] `select_action()` で各腕の Beta からサンプルして最大を選ぶ
- [ ] seed固定で再現できる

## A_j（影響obligation）
- cur.m1.bandit.agent.thompson_bernoulli
- gp.common.repro.seed_fixed

## Codex prompt
`bandit.py` に `ThompsonSamplingBernoulliAgent` を実装してください。

仕様:
- 各腕iに Beta(alpha_i, beta_i) を持つ（初期は alpha=1, beta=1 などパラメータ化）
- `select_action()`:
  - 各腕から `theta_i ~ Beta(alpha_i, beta_i)` をサンプル
  - 最大の腕を選ぶ（同値はrngでタイブレーク）
- `update(action, reward)`:
  - reward は 0/1 を想定（Bernoulli）
  - reward==1 -> alpha +=1、reward==0 -> beta +=1
- 乱数は内部rngを使い seed で固定

注意:
- reward がfloatで来る可能性がある場合は、0/1に丸めるか assertion するか設計に合わせる。
```

```text
Title: [S-CUR][M2] DP: value_iteration / policy_iteration を実装する（env.model()前提）
Labels: S-CUR, M2-MDP, type:feature
S: cur
Mission: m2

Body:
## 目的
MDPの「遷移表」から最適方策を計算する DP（価値反復/方策反復）を実装する。

成果物
- `sirius_rl/algorithms/dp.py`
  - `value_iteration`
  - `policy_iteration`
  - （必要なら）`extract_policy` など補助関数

## 受入条件（DoD）
- [ ] `env.model()` から遷移表を取得して計算できる
- [ ] 小規模GridWorldで期待どおりの方策が出る（テストは別Issue）
- [ ] 収束条件（delta < tol 等）と max_iter を持つ

## A_j（影響obligation）
- cur.m2.dp.value_iteration
- cur.m2.dp.policy_iteration
- eval.m2.dp.policy_expected

## Codex prompt
あなたはDPアルゴリズム実装者です。

1) `sirius_rl/algorithms/dp.py` を開き、既存の方針（関数シグネチャ、型、docstring）を確認。
2) `env.model()` の返す形式に合わせて実装する。
   典型例:
   - states: 0..n_states-1
   - actions: 0..n_actions-1
   - P[s][a] = list of (prob, s_next, reward, done) あるいは同等
3) value_iteration:
   - Vを0初期化
   - ベルマン最適方程式で反復更新
   - 収束後、greedy方策を導出して返す（Vとpolicy両方返す等、既存設計に合わせる）
4) policy_iteration:
   - 初期policy（ランダム等）
   - policy_evaluation（反復評価）
   - policy_improvement（greedy）
   - 収束判定

制約:
- CI短時間。状態数が大きい前提ではなく小規模で十分。
- 外部依存を増やさない。
```

```text
Title: [S-CUR][M3] TD: q_learning / derive_greedy_policy を実装する（離散状態）
Labels: S-CUR, M3-QLEARN, type:feature
S: cur
Mission: m3

Body:
## 目的
Q-learning を回し、学習率/割引率などの効果を観測できる「素振り」実装を作る。

## 成果物
- `sirius_rl/algorithms/td.py`
  - `q_learning`
  - `derive_greedy_policy`

## 受入条件（DoD）
- [ ] 状態は離散int、行動数はenvから取得（シラバス準拠）
- [ ] epsilon-greedy探索あり
- [ ] seed固定で再現（探索の乱数を固定）
- [ ] 学習済みQから greedy policy を作れる

## A_j（影響obligation）
- cur.m3.td.q_learning
- cur.m3.td.greedy_policy
- gp.common.repro.seed_fixed

## Codex prompt
`td.py` に Q-learning を実装してください。既存の Env インターフェースに合わせること。

仕様（典型）:
- q_learning(env, *, episodes, alpha, gamma, epsilon, seed, max_steps, ...) -> Q（shape: [n_states, n_actions]）
- 各episode:
  - s = env.reset(seed=seed_for_episode) もしくは既存設計に従う
  - for step in range(max_steps):
    - a = epsilon-greedy(Q[s])
    - s2, r, done, info = env.step(a)
    - Q[s,a] = Q[s,a] + alpha*(r + gamma*max(Q[s2]) - Q[s,a])
    - s = s2
    - if done: break
- derive_greedy_policy(Q) -> policy（各stateでargmax）

注意:
- tie-break はrngで決めると再現性が必要。seedからrngを作る。
- Envが `n_actions` / `action_space.n` / `num_actions()` など何で提供しているかを確認して合わせる。
```

---

## S=ENV（環境）

```text
Title: [S-ENV][M2] GridWorld環境を実装する（決定論・壁はその場・env.model()提供）
Labels: S-ENV, M2-MDP, type:feature
S: env
Mission: m2

Body:
## 目的
MDPの状態・行動・遷移・報酬を明示できる最小GridWorldを実装し、DP/Q-learningの共通土台にする。

## 成果物
- `sirius_rl/env/gridworld.py`
  - reset/step
  - 状態の離散化（int）
  - 上下左右4行動
  - 壁はその場
  - `model()` で遷移表を返す

## 受入条件（DoD）
- [ ] 決定論的（同じseed/初期状態で同じ遷移）
- [ ] terminal/goalの定義あり
- [ ] `env.model()` が dp.py から使える形式で遷移表を返す
- [ ] 外部依存なし、CI短時間

## A_j（影響obligation）
- env.m2.gridworld.transition.deterministic
- env.m2.gridworld.action.up_down_left_right
- env.m2.gridworld.wall_stay
- env.m2.gridworld.model.transition_table

## Codex prompt
あなたは環境実装者です。`sirius_rl/env/gridworld.py` を実装してください。

手順:
1) 既存のEnv基底/インターフェース（reset/step/seedの扱い）を確認し、それに合わせる。
2) グリッド定義:
   - 幅/高さ、壁セル、開始セル、ゴールセルを引数で受け取れるようにする（既定値あり）。
3) 状態表現:
   - (x,y) を state_id(int) に変換（例: y*width + x）
4) 行動:
   - 0:up, 1:right, 2:down, 3:left（または既存規約）
   - 壁/境界なら位置は変わらず、rewardは設計に従う
5) 報酬設計:
   - 仕様が無ければ「goal到達で+1、通常0、step上限あり」など最小で良い
   - ただし dp/test が書きやすいように、rewardはコンストラクタで設定可能にする
6) `model()`:
   - 全state×action について遷移先と報酬、done を列挙し、dp.py で使える形式で返す

制約:
- CI非flakyのため、乱数に依存しない（決定論）。
- ログ/print禁止。
```

---

## S=EVAL（評価・テスト・CIゲート）

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
   - 閾値は "相対"（ratio）にする
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

---

## S=OBS（観測・可視化）

```text
Title: [S-OBS][M1] Bandit: regret曲線を可視化できるスクリプトを追加（CI外）
Labels: S-OBS, M1-BANDIT, type:analysis
S: obs
Mission: m1

Body:
## 目的
学習効果を体感できるように、regretの推移を可視化する（履修体験の改善）。
※CIゲートには入れない（obsは学習支援）

成果物（例）
- `scripts/plot_bandit_regret.py` など
- もしくは `sirius_rl/obs/` 配下にユーティリティ

## 受入条件（DoD）
- [ ] 1コマンドで実行できる
- [ ] seed/probs/T を引数で指定可能
- [ ] 出力は画像 or 標準出力（どちらでもOK）
- [ ] CIでは走らない

## A_j（影響obligation）
- obs.m1.bandit.regret_curve
- gp.m1.bandit.learning_feedback

## Codex prompt
Banditの可視化スクリプトを追加してください。

要件:
1) `bandit_bench` を拡張して per_step regret を返せるようにするか、
   スクリプト内で per_step の記録を行う。
2) matplotlib が使えるなら折れ線で regret 曲線を保存（png）。
   使えない/依存追加が嫌なら、CSVに出すだけでもOK。
3) 使い方例を docstring に書く:
   `python scripts/plot_bandit_regret.py --probs 0.1 0.2 0.8 --T 500 --seed 0`
制約: CIに影響しない。ログ/ファイルは小さく。
```

```text
Title: [S-OBS][M3] Q-learning: 学習曲線（episode return）をログ/図で保存（CI外）
Labels: S-OBS, M3-QLEARN, type:analysis
S: obs
Mission: m3

Body:
## 目的
Q-learningの「上達」を目で見える形にする（素振りの主目的）。
※テストは success_rate で判定し、曲線は学習支援として残す。

成果物（例）
- `scripts/plot_q_learning_curve.py`
- または `eval/td_eval.py` に `--plot` オプション

## 受入条件（DoD）
- [ ] episodeごとの return を記録
- [ ] seed固定で再現
- [ ] 出力はpngまたはCSV（小さく）
- [ ] CIでは実行しない

## A_j（影響obligation）
- obs.m3.td.learning_curve
- obs.m3.td.reproducible_plot

## Codex prompt
Q-learning の学習曲線可視化を追加してください。

実装案:
- `q_learning` に `callback(episode, return)` を渡せるようにする
- `td_eval` から callback を渡して episode return の配列を収集
- `--plot` が指定されたらpng保存、なければCSV/JSONL出力

注意:
- CIのテストは plot を使わず success_rate のみで判定。
- 追加ログは最小に。
```

---

## S=GP（ドキュメント/導線：ミッション2）

```text
Title: [S-GP][M2] rl/overview.html に MDP設計（状態/行動/遷移/報酬）の説明を反映
Labels: S-GP, M2-MDP, type:docs
S: gp
Mission: m2

Body:
## 目的
ミッション2の「MDPを表形式で設計する」学習ゴールを、ドキュメントで再現可能にする。

## 成果物
- `rl/overview.html`（またはリポジトリの該当ドキュメント）
  - GridWorldの状態定義、行動、遷移、報酬の表/図
  - value_iteration / policy_iteration の説明（簡潔に）

## 受入条件（DoD）
- [ ] “この環境のMDP定義はこれ” が1ページで分かる
- [ ] seed/パラメータ/合格基準へのリンクがある（可能なら）
- [ ] 静的ページを壊さない

## A_j（影響obligation）
- gp.m2.docs.mdp_table
- gp.m2.docs.repro_steps

## Codex prompt
`rl/overview.html` を更新してください。

内容:
1) GridWorldのMDPを表形式で記載:
   - 状態: (x,y) -> id の対応
   - 行動: up/right/down/left
   - 遷移: 決定論、壁はその場
   - 報酬: goal到達/通常/壁衝突（実装に合わせて）
2) DPアルゴリズムの概要（数行）と、どの関数に実装されているか（ファイルパス）を書く。
3) 再現方法:
   - `pytest -q` や `python -m ...` など、最短コマンドを追記。
制約: HTML崩れを起こさない。差分は最小。
```
