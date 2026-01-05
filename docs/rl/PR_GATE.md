# PR Gate for SIRIUS (RL)

PR本文にこのテンプレートを貼り付け、影響obligation集合 A_j とテスト証拠を明示してください。

## PRテンプレ（コピペ用）
```md
## Summary
- 何を変更したか（1〜3行）

## Time / Trials / Outcome
- Time: XX min / Trials: N
- Outcome: Pass | Fail | Partial （必要なら学びや再発防止も）

## A_j (Impacted obligations)
- eval.00 / gp.01 / env.02 ... のように、影響したIDを列挙
- 影響なしなら "A_j: none" と明記

## Test Evidence
- 実行コマンドと結果ログを箇条書き（例: `pytest tests/test_smoke.py`）
- ブラウザデモなど手動確認は手順とスクショ/seedを併記

## Impact / Risk
- 影響範囲（UI, CI, env, docs など）
- リスクと緩和策（例: flaky懸念→seed固定、CI時間→ステップ数短縮）
```

## PRを小さくする理由（3行）
- 影響範囲を小さく保ち、推定とレビューを容易にするため
- 検証を速くし、CI/手動チェックのコストを下げるため
- 学習サイクルを短縮し、失敗からのフィードバックを早く得るため

## Gate運用メモ
- A_j に含めた obligation は、証拠（テストログ/スクショ/seedなど）で裏付ける
- A_j を外した領域に変更が波及した場合はリスク欄で明記し、追加観点を相談
- 大きな変更はIssueを分割し、小さなPRを積み重ねる
