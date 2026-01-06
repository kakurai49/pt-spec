# S-E2E-DESKTOP（Electronラップ＋pywinauto自動化）EPIC

```md
TITLE: [EPIC][desktop-e2e] 静的HTML→Electron→pywinauto自動化をiPhone運用で回す
LABELS: S-ENV, electron, desktop, windows, e2e, pywinauto
S_COLUMN: S-ENV
DEPENDS_ON:
EST_SIZE: XL

## S（Spec）/ 仕様
目的：
- ホームページ（静的HTML）の更新をトリガーに、ElectronでWindowsデスクトップアプリを生成し、pywinautoでリンク遷移を自動検証する一連のパイプラインを整備する。操作端末はiPhone中心とし、PCはWindows（self-hosted runner）＋任意でLinuxバックアップを前提にする。

成果物：
- GitHub Actions（windows-latest）で生成した `win-unpacked.zip`（展開起動用）と `Setup.exe`（NSISインストーラ）。
- Windows self-hosted runner 上で pywinauto + pytest によるUIテストログ／スクリーンショットartifact。

アーキテクチャ：
- iPhone：Codex指示とGitHub UIからPR作成・マージ・Actions実行/確認・artifactダウンロード。
- GitHub：ソース管理＋Actionsでビルド/テストとartifact保管。
- Windows PC：self-hosted runner（通常アプリ起動、サービス化しない）。Actionsから成果物を受け取りUIテスト実行。画面ロック/サービス起動ではGUIテストが失敗する点を設計に織り込む。
- Linux PC（任意）：artifactミラーや監視用途（なくても成立）。

運用の要点：
- 相対リンクを壊さないようWeb資産を `desktop/app/` に同期して同梱。
- E2Eモード（起動オプション/環境変数）でのみ `PATH: ...` オーバーレイを表示し、pywinautoが遷移を検証可能にする。
- Actionsは「ビルドジョブ（windows-latest）」と「UIテストジョブ（self-hosted Windows）」に分割し、artifactを介して連携。UIテストジョブは併走防止のためconcurrency設定を行う。

受け入れ基準：
- 下記Issue 1〜7が完了し、iPhoneからのPRマージでビルドとWindows UIテストが自動実行され、成果物とテスト結果をActionsで確認できる状態。

## H（How）/ Codex Prompt
あなたは静的HTMLサイトをElectronでWindowsデスクトップ化し、pywinautoでリンク遷移を自動検証するパイプラインを整える。以下のIssueを順に完了し、iPhoneだけで「原稿更新→ビルド→UIテスト確認」が回る状態にすること。
```
