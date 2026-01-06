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

## Windows 向けビルド

```bash
cd desktop
npm run dist:win
```

`dist/` に NSIS インストーラが生成されます。Web 資産の同期は別 Issue で対応予定です。
