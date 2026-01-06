# デスクトップラッパー

リポジトリ直下の `index.html` をネイティブウィンドウで開く、Electron ベースの Windows デスクトップラッパーです。

## 前提条件

- Node.js 20 以上
- npm

## 開発手順

1. 依存関係をインストール
   ```bash
   npm install
   ```
2. Electron を起動
   ```bash
   npm run start
   ```
   1200x820 のウィンドウが開き、リポジトリルートの `../index.html` を読み込みます。`http://` または `https://` へのリンクは既定ブラウザで開きます。
