# S-E2E-DESKTOP Issue 1: Electronラッパー最小構成追加

```md
TITLE: [desktop-e2e] Electron最小ラッパーを追加し起動確認する
LABELS: S-ENV, electron, desktop, P?
S_COLUMN: S-ENV
DEPENDS_ON:
EST_SIZE: M

## S（Spec）/ 仕様
目的：
- 既存の静的HTMLサイトを `desktop/` ディレクトリに追加したElectronラッパーで表示し、Windowsで `npm run start` で起動できる状態を作る。

背景/前提：
- 既存Webは `index.html` から `bt7/`・`bt30/`・`qr/`・`index2.html` へ相対リンクしている。
- Electronの推奨設定：`nodeIntegration:false`、`contextIsolation:true`、`sandbox:true`。

スコープ：
- `desktop/` 配下に Electron 基本ファイル（`package.json`, `main.js`, `preload.js`, `README.md`, `app/` ダミー `index.html`）を追加。
- `BrowserWindow(1200x820)` で `app://bundle/index.html` を `loadURL`。`ready-to-show` で表示開始。`window.open` は `shell.openExternal` に転送。
- `build.files` で `main.js`, `preload.js`, `app/**/*` を同梱し、`build.win.target: nsis` を設定。

非スコープ：
- Web資産の同期（Issue 2）
- E2E用オーバーレイ（Issue 3）
- CIビルド/テスト（Issue 5以降）

受け入れ基準：
- `cd desktop && npm install && npm run start` でWindowsにウィンドウが開き、`app://bundle/index.html` が表示される。
- セキュリティ設定（`nodeIntegration:false`, `contextIsolation:true`, `sandbox:true`）が有効。

## H（How）/ Codex Prompt
あなたは既存の静的HTMLサイトをElectronで包む担当です。リポジトリに `desktop/` ディレクトリを追加し、以下を満たす最小構成を作ってください。

- desktop/package.json:
  - scripts: start (electron .), dist:win (electron-builder -w)
  - devDependencies: electron, electron-builder
  - build.files: main.js, preload.js, app/**/*
  - build.win.target: nsis
- desktop/main.js:
  - BrowserWindow(1200x820) で app://bundle/index.html を loadURL
  - nodeIntegration false, contextIsolation true, sandbox true, preload 有効
  - ready-to-showで表示（白フラッシュ防止）
  - window.openはshell.openExternalで外部ブラウザへ
- desktop/preload.js: まずは空でOK
- desktop/README.md: 開発起動とdist手順を記載

既存Web資産は後続Issueで同期するので、現時点では app://bundle/index.html だけで動けばOK。
```
