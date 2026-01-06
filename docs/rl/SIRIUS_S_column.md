# SIRIUS S列運用パック（2025-12-31ドキュメント反映）

G:(W,E)->(S,A(S)) の枠組みに沿って、SIRIUSミッション1/2/3の履修とレビューを迷子にさせないための運用セットをまとめる。出典は 2025-12-31 付けドキュメント（G理論）で、観点Sを gp/cur/env/eval/obs/biz の6列に再定義し、PRごとに影響obligation集合 A_j を推定・ゲートする形まで落としている。GitHubにコピペできるIssue集合は別ファイル（`SIRIUS_S_column_issues.md`）として格納した。

## 0. シラバスからの確定要件（ミッション1/2/3）

共通方針：14日プランで Bandit → MDP → Q-learning → 観点整理へ進む。ミッションはIssue化前提で、PRテンプレに seed / アルゴリズム / ステップ数 を残し再現性を担保する。制約Eは CI短時間・非flaky、seed固定、外部依存最小、ログは小さく固定スキーマ。

- ミッション1（Bandit）: `sirius_rl/agents/bandit.py` に EpsilonGreedy / UCB1 / ThompsonSampling(Bernoulli)。`sirius_rl/eval/bandit_bench.py` で複数seed平均の reward/regret。`tests/test_bandit_agents.py` で random baseline より平均regretが低いことを統計的に確認。目安は固定probs、T=300〜800、seeds=5〜10、例：ε-greedy <= baseline*0.75、UCB <= ε-greedy*0.95。
- ミッション2（MDP設計 / GridWorld / DP）: `sirius_rl/env/gridworld.py` で決定論的GridWorld（上下左右、壁はその場）。`sirius_rl/algorithms/dp.py` に value_iteration / policy_iteration を実装し、`env.model()` で遷移表を得る。`tests/test_gridworld_dp.py` で方策の期待どおりを確認し、MDP説明を `rl/overview.html` に反映。
- ミッション3（Q-learning素振り）: `sirius_rl/algorithms/td.py` に q_learning / derive_greedy_policy。`eval/td_eval.py` 等で学習後policyの成功率/平均報酬を複数seedで平均し、`tests/test_q_learning.py` で episodes 500〜2000・seeds 3〜5・成功率>=0.8を目安に安定判定。

## 1. S（観点）を迷子にならない形に再定義

観点束Sを gp/cur/env/eval/obs/biz の6列に整理し、必要に応じて `cur.m1.bandit.*` のように階層化して精密化する。A(S) は観点ごとに区別したい離散条件（同値クラス・境界・遷移・シナリオ等）。

- gp: ガイド導線・運用（Issue/PR/再現性、手順、提出フロー）
- cur: カリキュラム本体（学ぶためのアルゴリズム実装・学習ループ）
- env: 環境（状態・行動・遷移・報酬・seed・terminal）
- eval: 評価とゲート（bench/runner、指標、テスト、CI非flaky化）
- obs: 観測（ログ・可視化・曲線・デバッグ容易性。CIの外でもOK）
- biz: 合格定義・価値最大化（成功条件やGoldilocks帯）

## 2. Projects運用（index.html準拠）

- Issue作成はIssue Formで 受講者 / 期限 / ガイドLv / 時間上限 を入力。
- PRテンプレは seed / アルゴリズム / ステップ数 と Time / Trials / Outcome を残す。
- PR作成/更新でActionsがテストを実行。結果で mastery p を更新しガイドLvを提案。
- Projectsは Backlog → Doing → Submitted → Review → Rework → Done のStatusと、S列（gp/cur/env/eval/obs/biz）を分離して管理し、Viewを2つ持てば事故を防げる。

## 3. S列を自動で回すラベル設計

- ラベル（固定）：`S-GP`, `S-CUR`, `S-ENV`, `S-EVAL`, `S-OBS`, `S-BIZ`
- ミッション（固定）：`M1-BANDIT`, `M2-MDP`, `M3-QLEARN`
- 種別（固定）：`type:feature`, `type:test`, `type:docs`, `type:ops`, `type:analysis`
- 運用：Issue作成時に必ず `S-*` と `M*` を付与し、ProjectsのSフィールドと同期（自動追加またはActionで同期）。

## 4. A_j を機械的に埋めるID体系

IDは `<prefix>.<mission>.<component>.<object>.<detail>`。prefix は gp/cur/env/eval/obs/biz、mission は m1/m2/m3/common、component は bandit/gridworld/dp/td/repo 等。触ったファイルパスから `<prefix>.<mission>.<component>` を決め、追加・変更したクラス名や関数名を末尾に置けば A_j を自動的に列挙できる。

例: `cur.m1.bandit.agent.eps_greedy`, `eval.m1.bandit.test.non_flaky_gate`, `env.m2.gridworld.transition.deterministic`, `cur.m3.td.q_learning`, `gp.common.pr_template.seed_algo_steps`, `biz.common.pass_criteria.definition`。

## 5. Issue Formテンプレ（.github/ISSUE_TEMPLATE）

- `config.yml` は blank issue を閉じる。
- `rl_impl.yml`: 実装Issue。受講者 / 期限 / ミッション / S（観点） / ガイドLv / 時間上限 / A_j / DoD / Codex prompt を入力。
- `rl_eval.yml`: 評価/テストIssue。ミッション / 評価指標（Sの定義） / A_j / Codex prompt を入力。

## 6. Issue Index（実装順）

OPSで運用の土台（Projects/Labels/Issue Form/PRテンプレ、obligation定義）を整えた後、各ミッションは env → cur → eval → obs/gp/biz の順で回すと詰まりにくい。

```
[OPS]
1) [S-GP][COMMON] Projects/Labels/Issue Form/PRテンプレ整備
2) [S-BIZ][COMMON] obligation(ID体系)・合格基準を定義し、A_j運用を固定

[M1: Bandit]
3) [S-CUR][M1] EpsilonGreedyAgent 実装
4) [S-CUR][M1] UCB1Agent 実装
5) [S-CUR][M1] ThompsonSampling(Bernoulli) 実装
6) [S-EVAL][M1] bandit_bench: 複数seed評価 + regret算出
7) [S-EVAL][M1] test_bandit_agents: baseline比較（非flaky）
8) [S-OBS][M1] regret曲線の可視化（CI外）

[M2: MDP/GridWorld/DP]
9)  [S-ENV][M2] gridworld環境 + env.model()
10) [S-CUR][M2] dp.py: value_iteration / policy_iteration
11) [S-EVAL][M2] test_gridworld_dp: 期待方策の検証
12) [S-GP][M2] rl/overview.html: MDP設計の説明追記

[M3: Q-learning]
13) [S-CUR][M3] td.py: q_learning / derive_greedy_policy
14) [S-EVAL][M3] td_eval: 学習→評価(success_rate/avg_reward)
15) [S-EVAL][M3] test_q_learning: success_rate>=0.8
16) [S-OBS][M3] 学習曲線ログ/図（CI外、ログ小）
```

## 7. GitHubにコピペできるIssue集合（S列沿い）

S列（gp/cur/env/eval/obs/biz）に沿ってタイトル・本文をそのまま貼れるIssueテンプレートをまとめた別ファイル `docs/rl/SIRIUS_S_column_issues.md` を用意した。さらに、Sの観点ごとに分割した小ぶりなファイルを `backlog/` 配下（例: `backlog/SIRIUS_S_gp.md` など）に配置しているので、用途に応じて参照しやすい方を使う。ProjectsのS列ビューやラベル運用と組み合わせて使う。
