# Documentation

## ホームページの構造（[`hp/index.html`](../hp/index.html)）
宇宙をテーマにしたトップページで、下記のコンポーネントで構成されています。リンク先のファイル群は、後述の[リポジトリ構造](#リポジトリ構造概要)の`hp/`配下にまとまっています。

- **ヘッダー**：ブランド名「SPACE ADVENTURE」とキャッチコピー、アンカーリンク（「6つのリンクへ」）を表示。
- **メイン（6つの惑星への入口）**：カード型グリッドで`file1〜file6`への導線を配置。各ページから、それぞれの孫ページ（`file*_sub.html`）へ遷移できます。
  - `file1.html`：宇宙アートと流れ星アクション
  - `file2.html`：壁で跳ねるボタン＋効果音（ON操作で有効）
  - `file3.html`：回数制限付きじゃんけん
  - `file4.html`：Eカード風の簡易対戦
  - `file5.html`：懐中電灯付きのホラー探索
  - `file6.html`：太陽をタップして花を咲かせる惑星
- **フッター**：音量操作の注意書きとクレジット。

## リポジトリ構造（概要）
主要ディレクトリの俯瞰図です。ホームページ関連は`hp/`、本ドキュメント群は`docs/`に格納されています。

```
pt-spec/
├── hp/                      # ホームページ一式（index + file1〜file6 と孫ページ）
│   ├── index.html
│   ├── file1.html … file6.html
│   └── file1_sub.html … file6_sub.html
├── docs/                    # ドキュメント（このREADME含む）
│   └── rl/                  # RLコース関連資料
├── sirius_rl/               # RL実装（algorithms / agents / env / obs / utils / eval / recommend）
├── backlog/                 # 要件・UIラフ類（desktop / web）
├── desktop/                 # デスクトップ向け資材（scripts ほか）
├── scripts/                 # ルート共通スクリプト
├── tests/                   # テストコード
├── .github/                 # ワークフローとIssueテンプレート
├── index.html, index2.html  # ルート直下のHTMLサンプル
├── requirements.txt         # Python依存定義
└── その他のサブディレクトリ（bb, bt7, bt30, cp, cx, ec, qr, rl など）
```

## RL関連ドキュメント
- [RLコース設計ドキュメント](rl/G_W_E_S_A.md): W/E/S/A(S) とobligation ↔ Issue対応の一覧
- [PR Gate (SIRIUS RL)](rl/PR_GATE.md): PR本文テンプレとゲート運用の方針
