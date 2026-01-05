# S-OBS（観測 / ログ / Goldilocks制御）

```md
TITLE: [SIRIUS][S-OBS][P1] 学習ログ/Outcomeから mastery(p) をベイズ更新し、次のガイドLv（Goldilocks帯）を提案する
LABELS: course:sirius, S-OBS, priority:P1
S_COLUMN: S-OBS
DEPENDS_ON: Issue02（PRテンプレ）, Issue03（ログ基盤）
EST_SIZE: M
A(S) COVERED: obs.01, obs.02, gp.ops.01

## S（Spec）/ 仕様
目的：
- PRテンプレの「所要時間・試行回数・Outcome」およびテスト結果を、次の課題/ガイドLv提案に使える形にする。
- FAQで言及されている “pをベイズ更新して次のガイドLv提案（Goldilocks帯維持）” を、最小実装として提供する。

仕様（最小）：
- mastery推定：Beta分布（成功/失敗）で p を更新
  - success=Pass、fail=Fail（まずは二値でOK）
- Goldilocks帯（例）：
  - p < 0.55 : 易しくする（ガイドLv↑ / 課題難度↓）
  - 0.55 <= p <= 0.80 : 維持
  - p > 0.80 : 難しくする（ガイドLv↓ / 課題難度↑）
- 生成物：
  - sirius_rl/obs/mastery.py（beta更新 + 推奨ガイドLv）
  - scripts/suggest_next.py（入力JSONから提案を出すCLI）
  - docs/rl/ops_goldilocks.md（運用説明）
  - tests/test_mastery.py（計算の正しさ）

受け入れ基準：
- [ ] `python scripts/suggest_next.py --input <file>` が動き、ガイドLv提案が出る
- [ ] Beta更新がテストで検証される
- [ ] docsに「入力フォーマット（最低限）」が書かれている

## H（How）/ Codex Prompt（実装指示）
~~~text
あなたは “Goldilocks帯維持” の最小実装を行います。GitHub APIは使わず、まずはローカル入力（JSON/JSONL）でOK。

手順：
1) sirius_rl/obs/mastery.py を追加：
   - update_beta(alpha, beta, success: bool) -> (alpha, beta)
   - mean_p(alpha,beta)
   - recommend_guide_level(p, current_level, rules) -> next_level
   - ルールは設定で変えられる形（定数でもOK）
2) scripts/suggest_next.py を追加：
   - 入力：JSONまたはJSONL
     - 例：{"attempts":[{"outcome":"pass","time_min":35,"trials":2}, ...], "current_level":2}
   - 出力：推定pと next_level（標準出力）
3) docs/rl/ops_goldilocks.md を追加：
   - 何を入力にするか（Outcome, time, trials）
   - どう更新するか（Beta）
   - Goldilocks帯の考え方
4) tests/test_mastery.py：
   - 小さな例で alpha/beta が期待通りに更新される
   - pに応じて next_level が期待通りになる

注意：
- 最小実装なので、まずは pass/fail のみでOK。
- 後で Issue09 の推薦ロジックに接続できるよう、APIは小さく整える。
~~~ 

## Definition of Done
- [ ] mastery.py / suggest_next.py / ops_goldilocks.md / tests 追加
- [ ] CI green
```
