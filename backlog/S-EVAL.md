# S-EVAL（採点 / 強制ゲート / CI）

```md
TITLE: [SIRIUS][S-EVAL][P0] RLコースの G:(W,E)->(S,A(S)) / obligationカタログ / PRゲートをリポジトリに固定
LABELS: course:sirius, S-EVAL, priority:P0
S_COLUMN: S-EVAL
DEPENDS_ON: なし
EST_SIZE: S
A(S) COVERED: eval.00, meta.00

## S（Spec）/ 仕様
目的：
- RLコース追加を「World W」として、観点Sとobligation A(S)をドキュメント化し、以後のIssue/PRがブレない状態に固定する。
- PRごとに影響obligation集合 A_j を書き、テスト/証拠でゲートする最小運用を標準化する。

成果物（ファイル）：
- docs/rl/G_W_E_S_A.md
  - W（追加範囲）: RLコースページ、RL用Pythonコード、CI、デモ、ログ/メトリクス、次課題推薦
  - E（制約）: CI時間上限、seed再現性、外部依存最小、静的サイト壊さない…等
  - S（観点束）: S-GP/S-EVAL/S-ENV/S-CUR/S-OBS/S-BIZ
  - A(S)（obligation族）: 本Issueセットに対応するID一覧（gp.*, eval.*, env.*, cur.*, obs.*, biz.*）
- docs/rl/PR_GATE.md
  - PR本文テンプレ（A_j / テスト証拠 / リスク）をコピペ可能な形で記述

受け入れ基準：
- [ ] 上記2ファイルが追加され、README または rl/index.html から辿れる
- [ ] A(S) が Issue番号と紐づく（例：「Issue04がenv.01を満たす」）
- [ ] PRテンプレとして貼れる「A_j セクション」が docs/rl/PR_GATE.md にある

## H（How）/ Codex Prompt（実装指示）
~~~text
あなたはこのリポジトリのメンテナです。設計ドキュメントを追加し、以後のPRがブレないようにします。

手順：
1) 既存の docs/ や各コース（bt7/qr/ec/btd 等）のドキュメント書式を確認し、同じノリに合わせる。
2) docs/rl/ を新規作成し、以下2ファイルを追加する：
   - docs/rl/G_W_E_S_A.md
   - docs/rl/PR_GATE.md
3) docs/rl/G_W_E_S_A.md に以下を記述：
   - W/E/S の定義（短い文章でOK）
   - S列の一覧（S-GP/S-EVAL/S-ENV/S-CUR/S-OBS/S-BIZ）
   - obligation ID 一覧（gp.01... のように）
   - obligation ↔ Issue番号 の対応（箇条書きでOK）
4) docs/rl/PR_GATE.md に以下を記述：
   - PR本文テンプレ（A_j / 実行テスト / 証拠リンク / 影響範囲 / リスク）
   - “PRを小さくする理由” を3行で明文化（影響推定を小さく、検証を速く、学習を速く）
5) README.md があるなら末尾に「RLコース設計ドキュメント」リンクを追記。無い場合は docs/README.md を作ってリンクを置く。

注意：
- コードは増やさない（このIssueはドキュメントのみ）。
- 既存リンク/導線を壊さない。
~~~ 

## Definition of Done
- [ ] docs/rl/G_W_E_S_A.md 作成
- [ ] docs/rl/PR_GATE.md 作成
- [ ] どこかから導線追加
```

```md
TITLE: [SIRIUS][S-EVAL][P0] GitHub運用の最小セットを追加（Issue/PRテンプレ + python-ci）
LABELS: course:sirius, S-EVAL, priority:P0
S_COLUMN: S-EVAL
DEPENDS_ON: Issue01（推奨）
EST_SIZE: M
A(S) COVERED: eval.01, eval.02

## S（Spec）/ 仕様
目的：
- RLコースも「課題配布→PR提出→テスト採点」で回るように、テンプレとCIを整備する。
- PR本文に A_j（影響obligation）と、テスト証拠を残せるようにする。

成果物：
- .github/pull_request_template.md（無ければ作成、あれば拡張）
  - 所要時間 / 試行回数 / Outcome
  - A_j（影響obligation ID）
  - 実行したテスト（コマンド）と結果
- .github/ISSUE_TEMPLATE/（任意：RL用テンプレ）
  - Mission Issue用（目的/受け入れ基準/提出物/参考/Codex Prompt欄）
- .github/workflows/python-ci.yml（既存があれば統合）
  - PRで pytest + lint（ruff等）が走り、Failなら落ちる

受け入れ基準：
- [ ] PR作成でCIが自動実行される
- [ ] PRテンプレが自動で本文に出る
- [ ] python-ci が Pass/Fail を返す（最低1つのダミーテストでOK）

## H（How）/ Codex Prompt（実装指示）
~~~text
あなたはGitHub運用（Issue→PR→Actionsテスト）を整備します。

手順：
1) .github/ があるか確認。無ければ作成。
2) PRテンプレを追加/更新: .github/pull_request_template.md
   - セクション:
     - Summary（何をしたか）
     - Time/Trials/Outcome
     - A_j（影響obligation IDの箇条書き）
     - Test Evidence（実行コマンドと結果、ログの貼り方）
3) 可能なら .github/ISSUE_TEMPLATE/sirius_mission.md を追加：
   - Goal / Acceptance Criteria / Submission / Notes / Codex Prompt 欄
4) CIを整備：
   - 既に workflow があるなら、pytest と lint が走るように統合
   - 無ければ .github/workflows/python-ci.yml を新規作成
   - python-version は既存方針に合わせる（不明なら 3.11）
5) Pythonのテスト基盤が無い場合：
   - pytest を導入（requirements.txt または pyproject.toml）
   - tests/test_smoke.py を追加してCIが必ず動く状態にする

注意：
- 既存CIがある場合は“置換”ではなく“拡張/統合”。
- CI実行時間が長くならない構成にする。
~~~ 

## Definition of Done
- [ ] PRテンプレ導入
- [ ] python-ci がPRで走る
- [ ] pytest が最低1本通る
```
