# SIRIUS Issue Pack (S=GP)

S列: gp（導線・運用・再現性）。タイトルと本文をそのままIssueに貼れる形式。

---

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
