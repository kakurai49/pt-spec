# SIRIUS Issue Pack (S=OBS)

S列: obs（観測・ログ・可視化）。タイトルと本文をそのままIssueに貼れる形式。

---

```text
Title: [S-OBS][M1] Bandit: regret曲線を可視化できるスクリプトを追加（CI外）
Labels: S-OBS, M1-BANDIT, type:analysis
S: obs
Mission: m1

Body:
## 目的
学習効果を体感できるように、regretの推移を可視化する（履修体験の改善）。
※CIゲートには入れない（obsは学習支援）

成果物（例）
- `scripts/plot_bandit_regret.py` など
- もしくは `sirius_rl/obs/` 配下にユーティリティ

## 受入条件（DoD）
- [ ] 1コマンドで実行できる
- [ ] seed/probs/T を引数で指定可能
- [ ] 出力は画像 or 標準出力（どちらでもOK）
- [ ] CIでは走らない

## A_j（影響obligation）
- obs.m1.bandit.regret_curve
- gp.m1.bandit.learning_feedback

## Codex prompt
Banditの可視化スクリプトを追加してください。

要件:
1) `bandit_bench` を拡張して per_step regret を返せるようにするか、
   スクリプト内で per_step の記録を行う。
2) matplotlib が使えるなら折れ線で regret 曲線を保存（png）。
   使えない/依存追加が嫌なら、CSVに出すだけでもOK。
3) 使い方例を docstring に書く:
   `python scripts/plot_bandit_regret.py --probs 0.1 0.2 0.8 --T 500 --seed 0`
制約: CIに影響しない。ログ/ファイルは小さく。
```

```text
Title: [S-OBS][M3] Q-learning: 学習曲線（episode return）をログ/図で保存（CI外）
Labels: S-OBS, M3-QLEARN, type:analysis
S: obs
Mission: m3

Body:
## 目的
Q-learningの「上達」を目で見える形にする（素振りの主目的）。
※テストは success_rate で判定し、曲線は学習支援として残す。

成果物（例）
- `scripts/plot_q_learning_curve.py`
- または `eval/td_eval.py` に `--plot` オプション

## 受入条件（DoD）
- [ ] episodeごとの return を記録
- [ ] seed固定で再現
- [ ] 出力はpngまたはCSV（小さく）
- [ ] CIでは実行しない

## A_j（影響obligation）
- obs.m3.td.learning_curve
- obs.m3.td.reproducible_plot

## Codex prompt
Q-learning の学習曲線可視化を追加してください。

実装案:
- `q_learning` に `callback(episode, return)` を渡せるようにする
- `td_eval` から callback を渡して episode return の配列を収集
- `--plot` が指定されたらpng保存、なければCSV/JSONL出力

注意:
- CIのテストは plot を使わず success_rate のみで判定。
- 追加ログは最小に。
```
