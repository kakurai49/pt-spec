# デスクトップラッパー

リポジトリ直下の静的コンテンツをネイティブウィンドウで開く、Electron ベースの Windows デスクトップラッパーです。`app://bundle` という secure context のカスタムスキームで配信し、`getUserMedia` などの権限はこのスキーム経由のものだけを許可しています。

## 前提条件

- Node.js LTS（推奨: v20 系）
- npm（Node.js 同梱）
- Windows 環境（`npm run dist:win` のビルドターゲット）

## Quick Start

1. 依存関係をインストール
   ```bash
   npm install
   ```
2. アセットを同期（`npm run start` や `npm run dist:win` 実行時も自動で実行されます）
   ```bash
   npm run sync:web
   ```
   - `./scripts/sync-web-assets.mjs` がリポジトリルートの `index.html` `index2.html` `bt7` `bt30` `qr` を `desktop/app/` 以下にコピーします。
3. 開発用に起動
   ```bash
   npm run start
   ```
   1200x820 のウィンドウが開き、`app://bundle/index.html` をロードします。`http://` / `https://` へのリンクは既定ブラウザで開かれます。

## ビルド（Windows インストーラ）

- Windows で以下を実行します。
  ```bash
  npm run dist:win
  ```
- `desktop/dist/` に NSIS インストーラ（`PT Spec Setup <version>.exe`）が生成されます。ビルド前に `sync:web` が走り、`desktop/app/` に最新の静的アセットが取り込まれます。

## よくある詰まり・注意事項

- **カメラ (getUserMedia)**: `app://bundle` は secure context として登録しており、`media` 権限のみを許可します。OS 側のカメラ権限が無効な場合は映像が取得できません。Web コンテンツを差し替える場合も `app://` でホストされるよう `sync:web` で取り込み直してください。
- **SmartScreen 警告**: 自己署名ビルドでは初回実行時に Windows SmartScreen が警告を出すことがあります。発行元の署名を行うか、テスト環境では「詳細情報 > 実行」を選択します。
- **パス長/アンチウイルス**: Windows のパス長制限やウイルス対策ソフトが `node_modules` 配下をブロックするとビルドが失敗することがあります。短いパスの作業ディレクトリに配置する、または一時的にリアルタイム保護から除外してください。
