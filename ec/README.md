# Eカード（カイジ）動く仕様書（HTML + JavaScript）

このフォルダは、提供された仕様書（Eカードのルール＋DTDテスト生成）を **ブラウザで動く形**にしたデモ実装です。

## 使い方

### 1) そのまま開く（最短）
- `index.html` をダブルクリックして開いてください。
- 外部ライブラリは不要です（CDN 依存なし）。

### 2) ローカルサーバで開く（推奨）
スマホ確認やキャッシュ挙動を揃えたい場合は、静的サーバで開くのが簡単です。

```bash
# このフォルダで
python -m http.server 8000
```

- PC: `http://localhost:8000`
- スマホ: 同一LANなら PC のIPアドレスでアクセス（例 `http://192.168.x.x:8000`）

## ファイル構成

- `index.html` : 画面（ホームページ）
- `styles.css` : レスポンシブ対応のスタイル
- `ecardspec.js` : コアロジック（Domain / Application / DTD）
- `app.js` : 画面操作（DOM）

## 実装メモ（仕様への対応）

- ルール（三すくみ）: `ecardspec.js -> resolveRound()`
- bout の進行: `stepBout()`, `BoutRunner`
- 不正検出:
  - NOT_IN_HAND: 手札にないカード提出
  - AFTER_TERMINAL: 決着後に提出
- match:
  - `MatchConfig`, `roleAssignmentForBout`, `runMatchSim`
- DTD:
  - Universe（18 obligations）: `OBLIGATIONS_UNIVERSE`
  - 候補生成: `generateBaseCandidates`, `generateRandomCandidates`
  - 観測/被覆: `executeScenario`
  - 集合被覆: `greedySetCover`

