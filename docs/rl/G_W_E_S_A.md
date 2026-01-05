# RLコース G:(W,E)->(S,A(S)) カタログ

強化学習コース（SIRIUS）を「World W」と見なし、制約E・観点束S・obligation族A(S)を固定します。以後のIssue/PRはここに紐づくIDを使って、影響範囲と証拠を明示してください。

## W（追加範囲 / World）
- RLコースの静的ページ一式（scope/index/overview/spec）
- 強化学習用のPythonコード（env/agents/algorithms/eval/obs/recommend）
- CI（pytest, lint）と再現用seed管理
- ブラウザデモ（Banditなど）とログ/メトリクス可視化
- ミッション配布と次課題推薦（Goldilocks, Bandit推薦）

## E（制約 / Environment constraints）
- CI所要時間は短く（数分以内）、flakeを避ける
- seedを固定して実行を再現可能にする
- 外部依存は最小（標準ライブラリ + 最小限のPyPI）
- 静的サイト（既存HTML/CSS）を壊さず導線を保つ
- ログ/成果物は最小サイズ・明示的なスキーマで残す

## S（観点束）
- S-GP: 導線 / UI / 体験設計
- S-EVAL: 採点 / 強制ゲート / CI
- S-ENV: 環境 / 世界 / 仕様
- S-CUR: カリキュラム / ミッション
- S-OBS: 観測 / ログ / Goldilocks制御
- S-BIZ: 最大収益の代理目的 / 推薦

## Obligation catalog A(S)
### gp.*
- gp.01: RLコースがホーム/ショートカットから辿れ、4ページ間ナビが生きている
- gp.02: コースカード/ページが既存テーマに沿ったトーンで提供されている
- gp.03: rl/spec.html で “動く仕様書” デモを提供し、体験を崩さない
- gp.ops.01: PR/Issue運用とログ収集の導線がUIに組み込まれている
- env.ux.01: デモUIが軽量で、ブラウザ単体で完結する

### eval.*
- eval.00: RLコースのG:(W,E)->(S,A(S))が1箇所に整理されている
- eval.01: PRテンプレートに A_j / Test Evidence を書ける
- eval.02: PRで自動CI（pytest+lint）が走る
- eval.bandit.00: Bandit系の評価ベンチ/CIが安定している
- eval.bandit.01: Bandit課題の合格テストが統計的に安定
- eval.td.01: TD系（Q-learning等）の合格テストが安定
- meta.00: obligation定義がIssue/PRに使えるよう公開されている

### env.*
- env.00: Envインターフェース/seed/ログの基盤がある
- env.01: 評価ハーネス（runner, logger）が共通化されている
- env.02: Bandit環境がseed付きで再現する
- env.03: regret計算とbaselineが提供されている
- env.04: GridWorldなどMDP環境がDPに使える形で提供されている

### cur.*
- cur.bandit.01: Banditアルゴリズム課題の学習/評価が定義されている
- cur.dp.00: DP課題（Value/Policy Iteration）の教材が整備されている
- cur.td.01: TD学習課題（Q-learning等）が評価付きで用意されている

### obs.*
- obs.00: ログスキーマが固定され観測が壊れない
- obs.01: Beta更新で mastery(p) を推定できる
- obs.02: Goldilocks帯に基づくガイドLv提案ができる
- obs.03: 収益代理の観測が推薦に接続できる

### biz.*
- biz.01: North Star（収益代理）の報酬設計が明文化されている
- biz.02: 次ミッション推薦がBandit等で実装されている

## North Star と Reward設計（S-BIZ）
- 収益の代理として「継続/修了の確率を上げつつ計算コストを抑える」ことを最大化する。
- 暫定North Star: 期待LTVの代理報酬 R を以下で定義し、E[R] を最大化。
  - R = +1.0: 次ミッション合格（修了/継続に寄与）
  - R = +0.2: 提出まで到達（エンゲージメント維持）
  - R = -0.5: 連続Fail/タイムアウト/離脱（継続悪化のペナルティ）
  - R = -0.1 * log(計算コスト + 1): CI時間や試行回数の代理（コスト抑制）
- 上記報酬は Bandit や Goldilocks 推薦の観測に接続し、計測→推薦→改善のループを回す。

## obligation ↔ Issue番号
- Issue00: [S-GP P0] RLコース導線を追加 — gp.01, gp.02
- Issue01: [S-EVAL P0] G:(W,E)->(S,A(S))を固定 — eval.00, meta.00
- Issue02: [S-EVAL P0] GitHub運用最小セット（PRテンプレ/CI） — eval.01, eval.02
- Issue03: [S-ENV P0] RLコア基盤（Env/seed/log/runner） — env.00, env.01, obs.00
- Issue04: [S-ENV P0] Bandit環境 + regret評価 — env.02, env.03, eval.bandit.00
- Issue05: [S-GP P1] 動く仕様書デモ拡充 — gp.03, env.ux.01
- Issue06: [S-CUR P0] Mission: Banditアルゴリズム — cur.bandit.01, eval.bandit.01
- Issue07: [S-ENV P1] GridWorld + DP — env.04, cur.dp.00
- Issue08: [S-CUR P1] Mission: Q-learning — cur.td.01, eval.td.01
- Issue09: [S-OBS P1] mastery推定 + Goldilocks運用 — obs.01, obs.02, gp.ops.01
- Issue10: [S-BIZ P2] 次ミッション推薦（収益代理最適化） — biz.01, biz.02, obs.03

## Notes
- PR本文では docs/rl/PR_GATE.md のテンプレを用い、A_j に上記IDを列挙してください。
- seed・CI時間・ログスキーマは “E（制約）” を守る形で調整します。
- W/E/S/A(S) への追加・変更は新しいIssueでレビューし、ここに追記します。

## 実装メモ（Python基盤）
- `sirius_rl/env/base.py` に Envインターフェース（`reset(seed)`/`step(action)`）と `StepResult` を定義。
- `sirius_rl/utils/seed.py` の `create_rng` で乱数生成器を統一（標準ライブラリのみ）。
- `sirius_rl/utils/logging.py` の `JsonlLogger` は `{run_id, seed, t, episode, reward, info}` を固定スキーマでJSONL出力。
- `sirius_rl/eval/runner.py` は方策と環境を与えて複数エピソードを回し、平均報酬や後悔（regret）を計算。
- `sirius_rl/env/bandit.py` で Bernoulli Bandit、`sirius_rl/eval/regret.py` で期待後悔を算出。
- `sirius_rl/env/gridworld.py` と `sirius_rl/algorithms/dp.py` で GridWorld + Value/Policy Iteration を提供。
