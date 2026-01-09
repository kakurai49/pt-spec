# デスクトップラッパー最小構成

Electron で `app://bundle/index.html` を表示する最小セットです（`desktop/app/` を配信）。既存の静的 HTML は後続の Issue で同期予定のため、現在はダミーの `index.html` を読み込ませています。

## 前提

- Node.js LTS（推奨: v20 系）
- Windows 環境での動作を想定

## セットアップ & 起動

```bash
cd desktop
npm install
npm run start
```

- 1200x820 のウィンドウが開き、`app://bundle/index.html` が表示されます。
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

`dist/` に `PT Spec Setup <version>.exe` 形式の NSIS インストーラが生成されます。GitHub Actions では `Setup.exe` に正規化して artifact に保存します。

## CI（Windows self-hosted runner）

UIテストは `runs-on: [self-hosted, windows, win-uia]` を要求します。セットアップ手順は `docs/windows-runner-setup.md` を参照してください。

## E2Eモード（PATHオーバーレイ）

- `npm run start -- --e2e` または環境変数 `PT_SPEC_E2E=1` を付けて起動すると、画面右下に `PATH: ...` オーバーレイが表示されます。
- 通常起動ではオーバーレイは表示されません。
- E2Eモードでは `prefers-reduced-motion` を強制し、バックグラウンド処理の負荷を抑える設定になります（通常起動には影響しません）。
