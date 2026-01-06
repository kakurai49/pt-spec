# デスクトップラッパー

リポジトリ直下の静的コンテンツをネイティブウィンドウで開く、Electron ベースの Windows デスクトップラッパーです。`app://bundle` という secure context のカスタムスキームで配信し、`getUserMedia` などの権限はこのスキーム経由のものだけを許可しています。

## 背景

- ブラウザ向けに積み上げた HTML/JS 資産をそのまま活用しつつ、オフライン動作やデバイス固有権限（カメラ）を安定して扱うために PC アプリ化しました。
- Windows への配布・起動を Electron が肩代わりし、UI やルーティングは既存の Web コンテンツを流用することで開発コストを最小化しています。
- Web 版との乖離を防ぐため、リポジトリ直下の静的ファイルをそのまま同梱するワークフローに寄せ、更新時も同じソースを参照する形にしています。

## 仕組み（Web → PC アプリ化の流れ）

1. リポジトリ直下の `index.html` / `index2.html` / `bt7` / `bt30` / `qr` など、Web 版で利用する静的コンテンツをビルド不要で取り込む。
2. `npm run sync:web`（内部では `scripts/sync-web-assets.mjs`）で上記アセットを `desktop/app/` にコピーし、Electron が参照できる形に揃える。
3. Electron の `BrowserWindow` から `app://bundle/index.html` をロードする。`app://bundle` は secure context として登録し、`media` 権限のみを許可。
4. `http://` / `https://` の外部リンクは既定ブラウザで開くため、デスクトップアプリ内ではローカル配信された Web コンテンツだけが実行される。

## デプロイ（配布手順）

1. Web 資産を更新したら、リポジトリルートで `npm run sync:web` を実行し `desktop/app/` を最新化する。
2. Windows 環境で `npm run dist:win` を実行すると、`desktop/dist/` に NSIS インストーラ（`PT Spec Setup <version>.exe`）が生成される。
   - 署名する場合は electron-builder の証明書設定を行う（自己署名の場合、SmartScreen の警告が出る点に注意）。
3. 配布は生成された `.exe` を共有するだけでよく、ユーザーはインストーラ実行後にスタートメニューから起動できる。
4. Web 版の更新に追随する場合も同じ手順で再ビルドし、インストーラを配布すれば良い（アセットは `sync:web` で毎回取り込み）。

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
