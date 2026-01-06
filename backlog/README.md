# Backlog

会議で決定したBacklogを、S列（Projects列）ごとに整理しています。各ファイルのコードブロックを GitHub Issue にコピペして活用してください。

## フォルダ構成
- `web/`: ブラウザ版プロダクト向けのBacklog（導線・採点・環境・カリキュラム・観測・ビジネス要件）。
- `desktop/`: Electronを使ったデスクトップ版向けのBacklog（オフライン化や配布、CIまでを含む）。
- `desktop-e2e/`: 静的HTMLをElectron化しpywinautoでUIテスト自動化するためのBacklog（iPhone中心運用）。

## Web（ブラウザ版）
- [S-GP（導線 / UI）](web/S-GP.md) - 画面導線やUI改善に関するタスク。
- [S-EVAL（採点 / 強制ゲート / CI）](web/S-EVAL.md) - 採点ロジックや強制ゲート、CI連携に関するタスク。
- [S-ENV（環境 / 世界 / 仕様）](web/S-ENV.md) - 環境や仕様整備に関するタスク。
- [S-CUR（カリキュラム / ミッション）](web/S-CUR.md) - カリキュラム構成やミッション設計に関するタスク。
- [S-OBS（観測 / ログ / Goldilocks制御）](web/S-OBS.md) - 観測、ログ、制御系に関するタスク。
- [S-BIZ（最大収益の代理目的 / 推薦）](web/S-BIZ.md) - 収益最大化や推薦機能に関するタスク。

## Desktop（Electron版）
- [S-ENV-ELECTRON（Electronデスクトップ化 / 配布 / CI）EPIC](desktop/S-ENV-ELECTRON-EPIC.md) - デスクトップ化の全体方針とスコープ。
- [S-ENV-ELECTRON Issue 1: Electronラッパー雛形追加](desktop/S-ENV-ELECTRON-01.md) - 雛形追加と起動確認。
- [S-ENV-ELECTRON Issue 2: Web資産同梱でオフライン起動](desktop/S-ENV-ELECTRON-02.md) - オフライン起動のための資産同梱。
- [S-ENV-ELECTRON Issue 3: app:// カスタムプロトコルと権限制御](desktop/S-ENV-ELECTRON-03.md) - カスタムプロトコルと権限ハンドリング。
- [S-ENV-ELECTRON Issue 4: electron-builder で NSIS インストーラ生成](desktop/S-ENV-ELECTRON-04.md) - インストーラ生成のビルド設定。
- [S-ENV-ELECTRON Issue 5: GitHub Actions で Windows ビルド](desktop/S-ENV-ELECTRON-05.md) - CIでのWindowsビルドとartifact化。
- [S-ENV-ELECTRON Issue 6: ドキュメント整備](desktop/S-ENV-ELECTRON-06.md) - 開発・配布手順ドキュメント。
