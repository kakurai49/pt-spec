# S-ENV-ELECTRON Issue 3: app:// カスタムプロトコルと権限制御

```md
TITLE: [desktop] app:// カスタムプロトコルで読み込み（file://回避）＋ permission handler 実装
LABELS: S-ENV, electron, desktop, security, P?
S_COLUMN: S-ENV
DEPENDS_ON: [desktop] Web資産を desktop/app に同期し、オフラインで起動できるようにする
EST_SIZE: M

## S（Spec）/ 仕様
目的：
- `file://` を避け `app://` カスタムプロトコルで secure context を確保し、カメラ等の権限を制御する。

スコープ：
- `app://` を `standard:true`, `secure:true` で登録
- `protocol.handle('app', ...)` で `desktop/app/` を安全に配信（パストラバーサル防止）
- permission handler で `media` のみ許可（`app://` 由来に限定）

受け入れ基準：
- `app://...` で起動している（`getURL()` が app://）
- 相対リンク遷移（`bt7/` 等）が動く
- カメラ権限が必要なページで許可動作が確認できる（手動）

## H（How）/ Codex Prompt
重要：
- `protocol.registerSchemesAsPrivileged` は ready 前・一度だけ。([Electron][4])
- `protocol.handle` 推奨。([Electron][4])

実装タスク：
1) `desktop/main.js` に `protocol.registerSchemesAsPrivileged([{ scheme:'app', privileges:{ standard:true, secure:true, supportFetchAPI:true } }])` を ready 前に追加。
2) `app.whenReady()` 後に `protocol.handle('app', ...)` を登録し、`app://bundle/...` で `desktop/app/` を配信。`path.relative` でbase外アクセスを拒否。`net.fetch(pathToFileURL(...))` で返却。
3) 起動URLを `win.loadURL('app://bundle/index.html')` に変更。
4) `session.defaultSession.setPermissionRequestHandler` で `app://` 由来の `media` のみ許可、それ以外拒否。
5) 外部リンク制御（既定ブラウザで開く）は維持。

完了確認：
- `npm run start` で `app://bundle/index.html` 起動
- 相対遷移が壊れない
- カメラ権限が必要なページで許可確認（手動）
```
