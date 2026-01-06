# SIRIUS Issue Pack (S=BIZ)

S列: biz（合格定義・価値最大化）。タイトルと本文をそのままIssueに貼れる形式。

---

```text
Title: [S-BIZ][COMMON] obligation(ID体系)・合格基準(pass criteria)を定義し、A_j運用を固定
Labels: S-BIZ, type:ops
S: biz
Mission: common

Body:
## 目的
「何を最大収益(=成功)にするか」を明文化し、ミッション1/2/3の合格基準を\"定数\"として固定する。
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
