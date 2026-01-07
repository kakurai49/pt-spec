# PT Spec

Pythonトレーニング用の静的サイトとコース仕様（HTML / Python実装）をまとめたリポジトリです。ルートの`index.html`から各コース（VEGA / ALTAIR / DENEB / SPICA / RIGEL / SIRIUS）や関連ドキュメントへ遷移できます。

## ディレクトリ構成（主要部分）

```text
pt-spec/
├── index.html               # メインのランディングページ（コース一覧）
├── index2.html              # トップページの別案
├── docs/                    # リポジトリ説明やRL関連ドキュメント
├── backlog/                 # Web/Electron向けBacklog（Issue下書き）
├── desktop/                 # デスクトップ版向け資材
├── scripts/                 # ルート共通スクリプト
├── tests/                   # テストコード
├── sirius_rl/               # SIRIUS RLコースのPython実装（agents/env/eval等）
├── bt7/                     # VEGA: 1週間でBEAT楽器を作るコース（scope/index/overview/spec）
├── bt30/                    # ALTAIR: 3ヶ月のBEAT楽器MVP Issue Pack（scope/index/overview/spec）
├── qr/                      # DENEB: QR→CSVパイプライン仕様とサンプルQR
├── btd/                     # SPICA: Beat Diffusion（条件付き生成）の設計/実装ガイド
├── ec/                      # RIGEL: Eカード題材の観点束・obligationテスト設計
├── rl/                      # SIRIUS RL: Bandit→GridWorld→Q-learningのページ一式
├── tu/                      # SIRIUS(タロット)フルスタック: 占いアプリの仕様/Issue/デモ
├── hp/                      # 宇宙テーマの別ホームページセット
└── course_dark.css, requirements.txt ほか共有リソース
```

## デスクトップ版のWeb資産更新

デスクトップ版の静的アセットを更新するときは、以下の流れで同期してください。

1. ルートのWeb資産を更新
2. `desktop/` で `npm run sync:web` を実行
3. `npm run start` でデスクトップ版を起動
