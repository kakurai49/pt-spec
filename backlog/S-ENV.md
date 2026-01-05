# S-ENV（環境 / 世界 / 仕様）

```md
TITLE: [SIRIUS][S-ENV][P0] RLコア基盤（Envインターフェース/seed/ログ/評価ハーネス）を追加
LABELS: course:sirius, S-ENV, priority:P0
S_COLUMN: S-ENV
DEPENDS_ON: Issue02
EST_SIZE: M
A(S) COVERED: env.00, env.01, obs.00

## S（Spec）/ 仕様
目的：
- RL課題で必須の「環境API契約」「seed再現」「ログ」「評価」の共通基盤を先に固める。
- 後続の Bandit / GridWorld / Q-learning が同じ枠で動く状態にする。

成果物（例：既存構成に合わせて調整OK）：
- sirius_rl/（または既存のPython構成に合わせたパッケージ）
  - env/base.py : Environmentプロトコル（reset(seed), step(action)）
  - utils/seed.py : RNG管理
  - utils/logging.py : 学習ログ共通フォーマット（JSON Lines推奨）
  - eval/runner.py : “方策/アルゴリズム”を与えてNステップ回す評価関数
- tests/
  - test_seed_repro.py : seedで再現すること
  - test_log_schema.py : ログスキーマが壊れないこと

受け入れ基準：
- [ ] `pytest` が通る
- [ ] 同一seedなら評価結果が一致する（少なくとも同一env+policyで）
- [ ] ログが一定スキーマで出る（最低: seed / step / reward / info）

## H（How）/ Codex Prompt（実装指示）
~~~text
あなたはRL用のPython共通基盤を実装します。外部依存は最小。

手順：
1) 既存Python構成を確認（src/配下 or 直下パッケージ、pyproject/requirements）。
   - 既存流儀に合わせて sirius_rl/ を配置。
2) Envインターフェースを定義：
   - reset(seed: int | None) -> obs
   - step(action) -> (obs, reward: float, terminated: bool, info: dict)
   - 可能なら dataclass StepResult でもOK
3) seed管理：
   - numpy.random.Generator か random を使う（どちらかに統一）
   - envが内部にRNGを保持し、reset(seed)で再初期化する
4) ログ：
   - jsonl で append できる logger を用意
   - schema例: { "run_id":..., "seed":..., "t":..., "episode":..., "reward":..., "info":... }
5) 評価runner：
   - agent（callable: obs->action）と env を渡して N step/episode 実行
   - cumulative reward 等を返す
6) tests：
   - seed固定でrunner結果が一致するテスト
   - loggerが必須フィールドを出すテスト

注意：
- CI時間を食わない。
- 後続IssueでBandit/GridWorldを載せるので拡張しやすい形にする。
~~~ 

## Definition of Done
- [ ] Env interface + seed + logger + runner 実装
- [ ] pytest green
- [ ] 簡単な使い方を docs/rl/G_W_E_S_A.md か rl/overview.html に追記
```

```md
TITLE: [SIRIUS][S-ENV][P0] Multi-Armed Bandit環境 + regret評価 + 再現テスト
LABELS: course:sirius, S-ENV, priority:P0
S_COLUMN: S-ENV
DEPENDS_ON: Issue03
EST_SIZE: M
A(S) COVERED: env.02, env.03, eval.bandit.00

## S（Spec）/ 仕様
目的：
- 最小のRL世界として Bandit を実装し、以後のアルゴリズム課題（ε-greedy/UCB/TS）の土台にする。
- 確率性があるので “再現性” と “評価” を最初からテストで担保する。

仕様（提案）：
- BernoulliBanditEnv(K, probs, seed)
  - action: 0..K-1
  - reward: {0,1}（Bernoulli）
  - obs: None でもOK（簡単で良い）
- regret計算：
  - best_prob = max(probs)
  - expected_regret += best_prob - probs[action]
- baseline：
  - random policy baseline（固定seedで）

受け入れ基準：
- [ ] 同一seedでbanditの報酬系列が再現する
- [ ] regret計算が正しい（ユニットテスト）
- [ ] 評価関数で baseline の平均reward/regret が取れる

## H（How）/ Codex Prompt（実装指示）
~~~text
あなたはBandit環境を実装します。

手順：
1) Issue03のEnvインターフェースに準拠し、sirius_rl/env/bandit.py を追加。
2) BernoulliBanditEnv を実装：
   - probs: list[float] を受け取り 0<=p<=1 をvalidate
   - reset(seed)でRNG初期化
   - step(action)で Bernoulli(p[action]) をサンプルして reward を返す
   - terminated は常に False（ステップタスク）でOK
3) regret計算ユーティリティを追加（1箇所にまとめる）。
4) tests：
   - seed固定でNステップ回した reward 列が一致するテスト
   - regret計算が正しいテスト（手計算できるケース）
5) rl/overview.html に Bandit（状態/行動/報酬/目的）を追記。

注意：
- テストは軽く（N小さく、seed固定）。
~~~ 

## Definition of Done
- [ ] bandit env + regret + baseline
- [ ] pytest green
- [ ] rl/overview.html 更新
```

```md
TITLE: [SIRIUS][S-ENV][P1] GridWorld環境 + 動的計画法（Value Iteration / Policy Iteration）+ テスト
LABELS: course:sirius, S-ENV, priority:P1
S_COLUMN: S-ENV
DEPENDS_ON: Issue03
EST_SIZE: M
A(S) COVERED: env.04, cur.dp.00

## S（Spec）/ 仕様
目的：
- Banditの次として “状態があるMDP” を実装し、価値反復/方策反復を学べる土台を作る。

仕様（提案）：
- GridWorldEnv(width,height,walls,start,terminals,reward_map,step_penalty)
  - action: 0..3（上下左右）
  - 遷移: 基本は決定論（壁ならその場）
  - terminated: terminal到達で True
- DP:
  - value_iteration(env, gamma, theta) -> V, policy
  - policy_iteration(env, gamma) -> V, policy

受け入れ基準：
- [ ] 小さなGridで最適方策が期待どおりになる
- [ ] `pytest` が安定して通る
- [ ] rl/overview.html に MDP(状態/行動/遷移/報酬/割引) の説明がある

## H（How）/ Codex Prompt（実装指示）
~~~text
あなたはGridWorldとDPアルゴリズムを実装します（教育用途・小さな状態数でOK）。

手順：
1) sirius_rl/env/gridworld.py を追加し、Envインターフェースに従う。
   - reset(seed)で開始状態へ
   - step(action)で次状態、報酬、terminated、infoを返す
   - 離散状態を int state_id として扱えるようにする（例：y*W+x）
2) DP実装：sirius_rl/algorithms/dp.py を追加
   - value_iteration と policy_iteration を実装
   - envが “全状態・全行動の遷移/報酬” を取得できるAPIを提供する（例：env.model()）
3) tests/test_gridworld_dp.py を追加：
   - 例：4x4、ゴール(+1)、step_penalty(-0.01)で、スタートから最短に近い方策になることを確認
   - 期待方策の一部一致（最初の一手など）でもOK（壊れにくいテストに）
4) rl/overview.html にGridWorld章を追加し、DPの狙いを説明。

注意：
- 外部依存なし。
- CI時間を食わない。
~~~ 

## Definition of Done
- [ ] gridworld env 実装
- [ ] dp 実装
- [ ] テスト green
- [ ] rl/overview.html 更新
```
