# S-ENV-ELECTRON Issue 1: Electronラッパー雛形追加

```md
TITLE: [desktop] Electronアプリ雛形追加（desktop/）
LABELS: S-ENV, electron, desktop, P?
S_COLUMN: S-ENV
DEPENDS_ON:
EST_SIZE: M

## S（Spec）/ 仕様
目的：
- 既存のWeb（静的HTML）をWindowsデスクトップアプリのウィンドウで表示。`npm run start` で起動できる雛形を作る。

背景/前提：
- `index.html` から `bt7/`・`bt30/`・`qr/` 等へ相対リンク。
- Electron推奨：`nodeIntegration:false`, `contextIsolation:true`, `sandbox:true`。([Electron][2])

スコープ：
- `desktop/` 追加、Electron最小構成
- `BrowserWindow` で既存Webの `index.html` を表示
- 外部リンク（http/https）はOS既定ブラウザで開く

非スコープ：
- Web資産同梱（Issue 2）
- secure context（Issue 3）
- インストーラ（Issue 4）

受け入れ基準：
- `cd desktop && npm install && npm run start` でウィンドウ起動
- `index.html` が表示される
- 外部リンクは既定ブラウザで開く

## H（How）/ Codex Prompt
制約：
- 既存Web資産は触らない。変更は基本 `desktop/` 配下（`.gitignore` 追記のみ例外）。
- `nodeIntegration:false`, `contextIsolation:true`, `sandbox:true` を設定。

実装タスク：
1) ルート直下に `desktop/` を新設し、`package.json`, `main.js`, `preload.js` を追加。`start` スクリプトを用意。
2) `main.js` は 1200x820 程度のウィンドウを作り、repoルートの `index.html` を `loadFile` で表示。
3) `setWindowOpenHandler` と `will-navigate` で http/https を `shell.openExternal`、それ以外はアプリ内遷移。
4) `.gitignore` に `desktop/node_modules/` を追加（既存あれば不要）。

完了確認：
- `cd desktop && npm install && npm run start` で `index.html` 表示
- 外部リンクが既定ブラウザで開く
```
