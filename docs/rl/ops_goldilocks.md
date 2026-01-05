# Goldilocks 帯の運用メモ

テストの Outcome（Pass/Fail）から Beta 分布で学習者の mastery を推定し、次のガイドレベルを提案するための最小実装です。

## 入力フォーマット

- JSON または JSONL を受け付けます。
- 推奨構造（JSON の例）:

```json
{
  "current_level": 2,
  "attempts": [
    {"outcome": "pass", "time_min": 35, "trials": 2},
    {"outcome": "fail", "time_min": 42, "trials": 1}
  ]
}
```

- JSONL の場合は 1 行 1 レコードで、`attempts` 配列を使わずに直接 `outcome` を含めても処理されます。
- `outcome` は `pass` / `fail`（大文字小文字は問わない）のみを評価対象とし、`time_min` や `trials` はログ保持用です（現状の推定では未使用）。

## 推定と更新ロジック

- 事前分布は Beta(α=1, β=1) を既定とし、Pass で α、Fail で β を +1 更新します。
- 推定 mastery は Beta 分布の平均 `p = α / (α + β)` を用います。

## Goldilocks 帯の推奨ルール（既定）

- `p < 0.55` : ガイドを手厚くする（ガイド Lv を 1 上げる）
- `0.55 <= p <= 0.80` : 現状維持
- `p > 0.80` : ガイドを絞る（ガイド Lv を 1 下げる）
- 境界値やステップ幅は `scripts/suggest_next.py` の引数で上書きできます。

## CLI の使い方

```bash
python scripts/suggest_next.py --input path/to/log.json
```

オプション:

- `--current-level` : 入力に `current_level` がない場合の明示指定
- `--alpha0` / `--beta0` : Beta 事前分布の初期値（既定は 1.0 / 1.0）
- `--easier-than` / `--harder-than` / `--step` / `--min-level` / `--max-level` : Goldilocks ルールの上書き

出力は推定された `p` と `next_level` を含む JSON で、標準出力に表示されます。
