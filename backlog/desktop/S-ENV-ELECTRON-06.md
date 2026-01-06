# S-ENV-ELECTRON Issue 6: ドキュメント整備

```md
TITLE: [desktop] Electronアプリの開発・配布手順をドキュメント化
LABELS: S-ENV, electron, desktop, docs, P?
S_COLUMN: S-ENV
DEPENDS_ON: [desktop] GitHub Actionsで Windowsインストーラをビルドし artifact としてアップロード
EST_SIZE: S

## S（Spec）/ 仕様
目的：
- 開発者が迷わないように、desktopアプリの手順を README として整備する。

スコープ：
- `desktop/README.md` を追加（QuickStart / build / よくある詰まり）
- ルートREADMEに最小リンクを追加（任意）
- secure context / permission / カメラ周りの注意を明記（`getUserMedia` はsecure context、Electron推奨設定を採用）

受け入れ基準：
- READMEの手順で `npm run start` / `npm run dist:win` が実行できる内容。

## H（How）/ Codex Prompt
実装タスク：
1) `desktop/README.md` を追加し、前提（Node LTS）、開発起動 (`npm run start`)、同期 (`npm run sync:web` のコピー対象)、ビルド (`npm run dist:win` の成果物場所)、トラブルシュート（カメラ権限/SmartScreen/パス長など）を記載。
2) ルート `README.md` があれば `desktop/README.md` へのリンクを控えめに追記。

完了確認：
- README記載の手順どおりに実行可能。
```
