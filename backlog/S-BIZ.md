# S-BIZ（最大収益の代理目的 / 推薦）

```md
TITLE: [SIRIUS][S-BIZ][P2] 収益/継続を最大化する “次ミッション推薦” の報酬設計 + バンディット実装（デモ/テスト付き）
LABELS: course:sirius, S-BIZ, priority:P2
S_COLUMN: S-BIZ
DEPENDS_ON: Issue05（推奨）+ Issue10（あると強い）
EST_SIZE: M
A(S) COVERED: biz.01, biz.02, obs.03

## S（Spec）/ 仕様
目的：
- 「何を最大化すると最大収益に近づくか」をコース内に明文化し、計測→推薦→改善のループを作る。
- 実装はまず軽量な “コンテキスト付きバンディット” で良い（運用コストが低い）。

North Star（暫定・代理目的）：
- 期待LTVの代理として：
  - R = +1.0（次ミッション合格）
  - R = +0.2（提出まで到達）
  - R = -0.5（連続Fail/タイムアウト/離脱）
  - R = -0.1 * log(計算コスト+1)（CI時間・試行回数の代理）
- 目的：E[R] を最大化（= 継続/修了率を上げつつコストを抑える）

実装要件：
- sirius_rl/recommend/bandit_recommender.py
  - context: { last_outcome, time_spent, trials, mastery_estimate } など（最初は簡単でOK）
  - arms: 次に出すミッション（例: bandit_easy/bandit_hard/gridworld_dp/q_learning）やガイドLv
  - algorithm: Thompson sampling（Beta-Bernoulli）または簡易LinUCB
- デモ:
  - scripts/sim_recommender.py（擬似ユーザで比較）
- テスト:
  - 擬似環境で “ランダム推薦より平均報酬が高い” を統計的に確認（flaky注意）

受け入れ基準：
- [ ] reward設計（上記）が docs/rl/G_W_E_S_A.md に追記されている
- [ ] recommender 実装 + シミュレーションが動く
- [ ] pytest で最低限の検証が通る（flakyにしない）

## H（How）/ Codex Prompt（実装指示）
~~~text
あなたは「最大収益（の代理）を最適化する推薦」を、教育用途の軽量実装で作ります。

手順：
1) docs/rl/G_W_E_S_A.md に “North Star と Reward設計” セクションを追記。
   - 収益の代理として継続/修了/コストを使うことを明記。
2) sirius_rl/recommend/bandit_recommender.py を追加。
   - arms を最低3つ列挙
   - API: recommend(context)->arm / update(context, arm, reward)
   - アルゴリズムは Beta-Bernoulli Thompson Sampling でOK
   - コンテキストは最初は「ビニング」でもOK（例：mastery_low/mid/high）
3) scripts/sim_recommender.py を追加。
   - 擬似ユーザモデル（難しすぎると失敗、易しすぎると飽きる）を実装
   - random vs recommender で平均報酬を比較して表示
4) tests/test_recommender.py を追加。
   - seed固定 + 複数seed平均で random より期待報酬が高いことを確認
   - flaky回避：閾値に余裕、試行回数を調整
5) （任意）rl/overview.html に「推薦はBanditで作れる」短い説明を追記。

注意：
- “課金”の実装はしない（設計と計測と推薦の形を作る）。
~~~ 

## Definition of Done
- [ ] Reward設計がdocsに入る
- [ ] recommender + sim + test
- [ ] CI green
```
