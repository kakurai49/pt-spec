# S-ENV-ELECTRON Issue 2: Web資産同梱でオフライン起動

```md
TITLE: [desktop] Web資産を desktop/app に同期し、オフラインで起動できるようにする
LABELS: S-ENV, electron, desktop, offline, P?
S_COLUMN: S-ENV
DEPENDS_ON: [desktop] Electronアプリ雛形追加（desktop/）
EST_SIZE: M

## S（Spec）/ 仕様
目的：
- Electronアプリがオフライン完結するよう、Web資産を `desktop/app/` に同期し、そこから起動する。

スコープ：
- `desktop/scripts/sync-web-assets.*` 追加でコピー
- `npm run start` 前に `sync` 実行
- Electronは `desktop/app/index.html` を読む

受け入れ基準：
- `npm run sync:web` で `desktop/app/index.html` が生成
- `npm run start` で `desktop/app/index.html` 表示
- `desktop/app/` は生成物として `.gitignore` 対応

## H（How）/ Codex Prompt
要件：
- `desktop/app/` にWeb資産をコピー。同梱対象（存在する場合）：`index.html`, `index2.html`, `bt7/**`, `bt30/**`, `qr/**`。
- 「固定リスト＋存在チェック」方式でOK。存在しないパスはスキップ＆ログ。

実装タスク：
1) `desktop/scripts/sync-web-assets.mjs` を作成。ソース：repo root、宛先：`desktop/app/`。Windows対応のパス処理。存在しないパスはスキップ＆ログ。
2) `desktop/package.json` に `sync:web` と `prestart`（`npm run sync:web`）を追加。
3) `desktop/main.js` を `desktop/app/index.html` ロードに変更。
4) `.gitignore` に `desktop/app/`, `desktop/dist/` を追加。

完了確認：
- `cd desktop && npm install && npm run sync:web && npm run start` で起動。
```
