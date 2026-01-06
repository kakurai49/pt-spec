# S-E2E-DESKTOP Issue 2: Web資産同期スクリプト追加

```md
TITLE: [desktop-e2e] Web資産をdesktop/appへ同期するスクリプトを追加
LABELS: S-ENV, electron, desktop, automation, P?
S_COLUMN: S-ENV
DEPENDS_ON: S-E2E-DESKTOP-01
EST_SIZE: M

## S（Spec）/ 仕様
目的：
- ホームページの更新を手作業なくデスクトップアプリに反映できるよう、リポジトリルートから `desktop/app/` へのコピーを自動化する。

スコープ：
- `npm run sync:web` のスクリプトを `desktop/package.json` に追加。
- Node.jsスクリプト（例：`desktop/scripts/sync-web.js`）で以下をコピーする：
  - `index.html`, `index2.html`
  - `bt7/`, `bt30/`, `qr/` （存在するものだけ）
- 既存ファイルは上書きでOK。相対リンクを壊さないようディレクトリ構造を維持。
- READMEに「Web更新→sync→start」の流れを追記。

非スコープ：
- オーバーレイ追加（Issue 3）
- CI/CDジョブ（Issue 5以降）

受け入れ基準：
- `npm run sync:web` 実行で上記ファイル/ディレクトリが `desktop/app/` にコピーされる。
- 同期後に `npm run start` で相対リンクが壊れずに閲覧できる。

## H（How）/ Codex Prompt
desktop/ に Web資産同期機能を実装してください。

要件:
- desktop/package.json に "sync:web" スクリプトを追加
- Node.js で動く同期スクリプトを desktop/scripts/sync-web.js などとして追加
- コピー元: リポジトリルート
- コピー先: desktop/app
- 対象: index.html, index2.html, bt7/, bt30/, qr/ （存在するものだけコピー）
- 既存ファイルは上書き。不要ファイルは消しても良いが、まずは上書きでOK
- これにより `desktop/app/index.html` からの相対リンクが壊れない状態を保証する

合わせて README に「Web更新→sync→start」の流れを追記してください。
```
