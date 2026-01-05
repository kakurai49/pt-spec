# コースSIRIUS ミッション1/2/3 シラバス

コースSIRIUSでミッション1〜3をクリアするための到達像、提出物、評価観点をリポジトリ内の情報だけでまとめたシラバスです。GitHub運用・再現性に関する共通方針も併記します。

## 全体像と共通方針

- 14日プランの流れ：Day1-2でBandit UIとseed再現、Day3-5でε-greedy/UCB比較、Day6-8でMDP設計、Day9-11でQ-learning素振り、Day12-14で観点整理と再現手順の確立。【F:rl/index.html†L91-L103】
- ミッションはIssue化を前提とし、PRテンプレに「seed」「アルゴリズム」「ステップ数」を記録すると再現性が担保できる。【F:rl/index.html†L108-L124】
- 制約E：CIは短時間・非flaky、seed固定で再現、外部依存最小、静的ページを壊さない、ログは小さくスキーマ固定。【F:docs/rl/G_W_E_S_A.md†L12-L18】
- 観点束Sとobligation：UI導線（gp.*）、評価安定性（eval.*）、環境実装（env.*）、カリキュラム（cur.*）などをIDで管理し、PR本文でA_jとして列挙する。【F:docs/rl/G_W_E_S_A.md†L19-L64】【F:docs/rl/G_W_E_S_A.md†L75-L88】
- 参照ページ：Scope/Index/Overview/Specの4ページと設計ドキュメント（G_W_E_S_A, PR_GATE）。【F:rl/index.html†L127-L135】

## ミッション1: Bandit（探索と活用の入口）

- ねらい：自作のp配列でBanditを回し、ε-greedyとrandomを比較して探索・活用の基礎を体験する。【F:rl/index.html†L111-L124】
- 主要提出物（Python実装）：
  - `sirius_rl/agents/bandit.py` に EpsilonGreedyAgent / UCB1Agent / ThompsonSamplingBernoulliAgent。【F:backlog/S-CUR.md†L16-L33】
  - `sirius_rl/eval/bandit_bench.py` で複数seed平均のreward/regretを返す評価関数。【F:backlog/S-CUR.md†L16-L33】
  - `tests/test_bandit_agents.py` でrandom baselineより平均regretが低いことを統計的に確認。【F:rl/index.html†L138-L147】
- 合格・評価の目安：固定probsとT=300〜800、seeds=5〜10でbaselineより平均regretが小さい（例：ε-greedy <= baseline*0.75、UCB <= ε-greedy*0.95）。【F:backlog/S-CUR.md†L24-L34】
- 作業ヒント：CI安定を最優先にseedとステップ数を明示し、判定は平均値/相対評価にする。【F:rl/index.html†L138-L147】【F:backlog/S-CUR.md†L35-L59】

## ミッション2: MDP設計（GridWorld/DP）

- ねらい：MDPの状態・行動・遷移・報酬を表形式で設計し、価値反復/方策反復を通じて最適方策を理解する。【F:rl/index.html†L115-L124】【F:rl/overview.html†L149-L155】
- 実装・提出物の提案：
  - `sirius_rl/env/gridworld.py` で決定論的なGridWorld環境を実装（上下左右4行動、壁はその場）。【F:backlog/S-ENV.md†L123-L139】【F:rl/overview.html†L149-L155】
  - `sirius_rl/algorithms/dp.py` に value_iteration / policy_iteration を実装し、`env.model()` から遷移表を得る。【F:backlog/S-ENV.md†L139-L163】
  - `tests/test_gridworld_dp.py` で小規模グリッドの方策が期待どおりになることを確認。【F:backlog/S-ENV.md†L143-L174】
- 合格・評価の目安：小さなGridで最適方策が期待どおり、pytestが安定して通る、MDP説明をrl/overview.htmlに反映。【F:backlog/S-ENV.md†L143-L174】
- 記録方法：PRや資料で状態遷移表と報酬設計の意図を短く説明し、図や表を共有する。【F:rl/index.html†L115-L123】

## ミッション3: Q-learning素振り

- ねらい：学習率・割引率を変えつつQ-learningを回し、エピソード報酬の推移を観測して方策改善を確認する。【F:rl/index.html†L119-L123】
- 実装・提出物の提案：
  - `sirius_rl/algorithms/td.py` に q_learning と derive_greedy_policy を実装（状態は離散int、行動数はenvから取得）。【F:backlog/S-CUR.md†L69-L112】
  - `eval/td_eval.py` などで学習後policyの成功率/平均報酬を測定し、seed複数で平均化。【F:backlog/S-CUR.md†L69-L113】
  - `tests/test_q_learning.py` を追加し、episodes 500〜2000・seeds 3〜5程度で成功率>=0.8を目安に安定判定。【F:backlog/S-CUR.md†L69-L113】
- 合格・評価の目安：Q-learning実装と学習→評価ハーネスが揃い、pytestが安定して通ること。【F:backlog/S-CUR.md†L83-L113】
- 記録方法：seedやハイパーパラメータをPRに残し、エピソード報酬曲線の変化をログ/図で共有する。【F:rl/index.html†L119-L123】【F:docs/rl/G_W_E_S_A.md†L12-L18】

## 共有リソース

- Banditブラウザデモ（rl/spec.html）でp配列やseedを調整し、Issue/PRで再現条件を共有可能。【F:rl/spec.html†L20-L189】
- Python基盤：Envインターフェース、seed/ログ統一、評価runnerが`sirius_rl`パッケージに揃っているので、各ミッションの実装や検証に再利用する。【F:rl/overview.html†L128-L136】
