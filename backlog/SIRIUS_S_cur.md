# SIRIUS Issue Pack (S=CUR)

S列: cur（カリキュラム・アルゴリズム実装）。タイトルと本文をそのままIssueに貼れる形式。

---

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
