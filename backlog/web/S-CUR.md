# S-CUR（カリキュラム / ミッション）

```md
TITLE: [SIRIUS][S-CUR][P0] Mission1: Banditアルゴリズム（ε-greedy/UCB/Thompson）+ 合格テスト（統計的）
LABELS: course:sirius, S-CUR, priority:P0
S_COLUMN: S-CUR
DEPENDS_ON: Issue04
EST_SIZE: M
A(S) COVERED: cur.bandit.01, eval.bandit.01

## S（Spec）/ 仕様
目的：
- “強化学習スキル獲得” の最短入口として、探索と活用の基本を課題化する。
- 確率タスクなので合格判定は「複数seed平均」など統計的にする（CIで安定させる）。

実装対象（提案）：
- sirius_rl/agents/bandit.py
  - EpsilonGreedyAgent
  - UCB1Agent
  - ThompsonSamplingBernoulliAgent（Beta-Bernoulli）
- sirius_rl/eval/bandit_bench.py
  - 複数seedで平均regret/平均rewardを返す

合格条件（例：CI安定優先で後で調整OK）：
- 固定probs（例: [0.1,0.2,0.8,0.4,0.3]）
- T=300〜800, seeds=5〜10 で
  - random baseline より平均regretが小さい（相対評価）
  - 例：ε-greedy <= baseline*0.75、UCB <= ε-greedy*0.95 など

受け入れ基準：
- [ ] 3アルゴリズムが動作
- [ ] 複数seed平均で評価できる
- [ ] pytestで合格判定が安定して通る

## H（How）/ Codex Prompt（実装指示）
~~~text
あなたはBanditの学習アルゴリズム課題を実装します。外部RLライブラリは禁止（学習用に自前実装）。

手順：
1) sirius_rl/agents/bandit.py を新規作成（または既存に追加）。
   - Agentは (obs)->action を返せる形
   - update(action, reward) を持たせてもよい（runner側で呼ぶ）
2) eval/bandit_bench.py に run_bandit_benchmark(env, agent, seeds, T) を作り、
   - 平均reward、平均regret を返す。
3) tests/test_bandit_agents.py を追加：
   - 固定probs環境で random baseline と比較して、相対的に良いことをassert
   - flaky回避：seedsを複数、閾値に余裕、Tは短めから
4) rl/index.html に「Mission1: Bandit」章を追記：
   - 目的、提出物（対象ファイル/クラス）、合格の考え方

注意：
- CIで落ちない（flakyにしない）のが最優先。
~~~ 

## Definition of Done
- [ ] 3エージェント実装
- [ ] ベンチ + テスト追加
- [ ] rl/index.html 更新
```

```md
TITLE: [SIRIUS][S-CUR][P1] Mission2: 表形式Q-learning（+SARSA任意）+ 合格テスト
LABELS: course:sirius, S-CUR, priority:P1
S_COLUMN: S-CUR
DEPENDS_ON: Issue06
EST_SIZE: M
A(S) COVERED: cur.td.01, eval.td.01

## S（Spec）/ 仕様
目的：
- “モデルフリー強化学習” の基本として、Q-learning をGridWorldで動かし、学習で方策が改善することを体験できるようにする。

仕様（提案）：
- sirius_rl/algorithms/td.py
  - q_learning(env, episodes, alpha, gamma, epsilon_schedule, seed) -> Q
  - derive_greedy_policy(Q) -> policy
- 評価:
  - 学習後の greedy policy を Nエピソード評価して成功率/平均報酬を測る

合格条件（例）：
- 固定GridWorldで、学習後の成功率 >= 0.8（seeds複数で平均）

受け入れ基準：
- [ ] Q-learning 実装
- [ ] 学習→評価のハーネスがある
- [ ] pytest が安定して通る

## H（How）/ Codex Prompt（実装指示）
~~~text
あなたはQ-learning課題を実装します。

手順：
1) sirius_rl/algorithms/td.py を追加し、q_learning を実装。
   - 状態は離散 int（GridWorldのstate_id）
   - 行動数は env から取得
2) epsilon は定数でも良いが、可能なら線形減衰スケジュールを用意（簡単でOK）。
3) 評価関数を追加：
   - eval/td_eval.py 等に policy をGridWorldで回して成功率/平均報酬を返す関数
4) tests/test_q_learning.py を追加：
   - episodesはCI時間に合わせる（例：500〜2000）
   - seeds複数（例：3〜5）で平均成功率が閾値超え
   - 環境はできるだけ決定論に（flaky回避）
5) rl/index.html に Mission2 の提出物と合格条件（概念）を追記。

注意：
- 速度と安定性重視。学習が遅い場合は環境/報酬/episodesを調整してテストを安定化。
~~~ 

## Definition of Done
- [ ] td.py 実装
- [ ] eval + テスト
- [ ] rl/index.html 更新
```
