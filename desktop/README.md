# デスクトップラッパー最小構成

Electron で `desktop/app/index.html` を表示する最小セットです。既存の静的 HTML は後続の Issue で同期予定のため、現在はダミーの `index.html` を読み込ませています。

## 前提

- Node.js LTS（推奨: v20 系）
- Windows 環境での動作を想定

## セットアップ & 起動

```bash
cd desktop
npm install
npm run start
```

- 1200x820 のウィンドウが開き、`desktop/app/index.html` が表示されます。
- セキュリティ設定は `nodeIntegration: false` / `contextIsolation: true` / `sandbox: true` で有効化しています。

## Web 資産の同期

ルートディレクトリで Web を更新したら、以下の順で同期・起動してください。

```bash
cd desktop
npm run sync:web
npm run start
```

## Windows 向けビルド

```bash
cd desktop
npm run dist:win
```

`dist/` に NSIS インストーラが生成されます。

## E2Eモード（PATHオーバーレイ）

- `npm run start -- --e2e` または環境変数 `PT_SPEC_E2E=1` を付けて起動すると、画面右下に `PATH: ...` オーバーレイが表示されます。
- 通常起動ではオーバーレイは表示されません。
