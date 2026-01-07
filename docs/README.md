# Documentation

## ホームページの構造（[`index.html`](../index.html)）
Pythonトレーニングのランディングページです。グローバルナビとヒーローを中心に、下記のセクションで構成されています（`hp/`配下は別ホームページのセットで本ページとは独立）。

- **ヘッダー／ナビゲーション**：ブランド、アンカーリンク（コース / 進め方 / コンセプト / FAQ）とCTAを表示。
- **ヒーロー**：キャッチコピー、各コースの学習目安、Quick Start / Shortcutsのガイド。
- **コース一覧**：VEGA / ALTAIR / DENEB / SPICA / RIGEL / SIRIUSのカード。`bt7/`、`bt30/`、`qr/`、`btd/`、`ec/`、`rl/`などへの導線を掲載。
- **進め方（Flow）**：GitHubで課題を受け取りPRで提出する手順。
- **コンセプト（About）**：トレーニングの考え方や設計意図。
- **FAQ**：よくある質問のまとめ。

## リポジトリ構造（概要）
主要ディレクトリの俯瞰図です。メイントップはルート直下の`index.html`で、`hp/`配下は別ホームページのリソース、本ドキュメント群は`docs/`に格納されています。

```
pt-spec/
├── index.html               # Pythonトレーニングのトップページ
├── index2.html              # トップページの別案（サンプル）
├── hp/                      # 宇宙テーマの別ホームページ（index + file1〜file6 と孫ページ）
│   ├── index.html           # hp/配下のトップ
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

## デスクトップ化パイプライン
- [デスクトップ化パイプラインのアーキテクチャ & テスト結果まとめ](desktop_pipeline_report.md)
