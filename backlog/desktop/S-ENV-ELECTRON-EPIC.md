# S-ENV-ELECTRON（Electronデスクトップ化 / 配布 / CI）EPIC

```md
TITLE: [EPIC][S-ENV] 既存Web資産をElectronデスクトップアプリ化し、配布・CIまで整備する
LABELS: S-ENV, electron, desktop, windows
S_COLUMN: S-ENV
DEPENDS_ON:
EST_SIZE: L

## S（Spec）/ 仕様
目的：
- 既存の静的Web資産（`index.html` から `bt7/`・`bt30/`・`qr/`・`index2.html` へ相対リンク）をElectronでWindowsデスクトップ化し、オフライン・secure context・インストーラ・CIまで一気通貫で整備する。

スコープ：
- Electronラッパー雛形追加（`desktop/`）
- Web資産同梱（オフライン対応）
- `app://` カスタムプロトコルと権限ハンドリング（カメラ等）
- electron-builderでNSISインストーラ生成
- GitHub ActionsでWindowsビルド&artifact化
- 開発/配布/トラブルシュートのドキュメント整備

フォルダ構成（想定）：
```
/ (repo root)
  index.html
  index2.html
  bt7/
  bt30/
  qr/
  desktop/
    package.json
    main.js
    preload.js
    app/        # 同梱コピー先（生成物）
    dist/       # ビルド成果物（生成物）
    scripts/    # sync-web-assets など
```

進行方針：
1) 雛形で「起動する」を最短で作る
2) オフライン同梱
3) secure context（`app://`）と権限制御
4) インストーラ生成
5) CI自動ビルド
6) ドキュメントで運用支援

受け入れ基準：
- 下記Issue群が完了し、`npm run start` で起動、`npm run dist:win` でNSIS生成、Actionsからartifact取得できる状態。

## H（How）/ Codex Prompt
あなたは既存の静的WebリポジトリをElectronでWindows向けデスクトップ化し、オフライン対応・secure context対応・インストーラ生成・CI自動ビルド・ドキュメント整備まで段階的に進める。各Issueの範囲を尊重し、1PR=1Issueで進めること。
```
