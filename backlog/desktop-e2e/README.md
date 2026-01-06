# Desktop E2E Backlog

静的HTMLサイトをElectronでWindowsデスクトップ化し、pywinautoでUIテスト自動化まで回すためのBacklogです。iPhone中心の運用を想定し、GitHub Actionsとself-hosted runner（Windows）を組み合わせたフローを段階的に整備します。各ファイルのコードブロックを GitHub Issue に貼って利用してください。

- [S-E2E-DESKTOP（Electronラップ＋pywinauto自動化）EPIC](S-E2E-DESKTOP-EPIC.md) - 静的Web更新からデスクトップビルド、UIテスト自動化までの全体像。
- [S-E2E-DESKTOP Issue 1: Electronラッパー最小構成追加](S-E2E-DESKTOP-01.md) - `desktop/` 追加と起動確認。
- [S-E2E-DESKTOP Issue 2: Web資産同期スクリプト追加](S-E2E-DESKTOP-02.md) - ルートのHTML資産を `desktop/app/` に自動コピー。
- [S-E2E-DESKTOP Issue 3: E2Eモードのパス表示オーバーレイ](S-E2E-DESKTOP-03.md) - `--e2e` 起動時だけ `PATH:` を表示。
- [S-E2E-DESKTOP Issue 4: pywinauto+pytestでリンク遷移E2E](S-E2E-DESKTOP-04.md) - Windowsでリンク挙動を検証するUIテスト。
- [S-E2E-DESKTOP Issue 5: GitHub ActionsでWindows成果物をビルド](S-E2E-DESKTOP-05.md) - `win-unpacked.zip` と `Setup.exe` をartifact化。
- [S-E2E-DESKTOP Issue 6: self-hosted runnerでUIテスト実行](S-E2E-DESKTOP-06.md) - Windows実機上でのpywinautoテストジョブ。
- [S-E2E-DESKTOP Issue 7: Windows runnerセットアップ手順をドキュメント化](S-E2E-DESKTOP-07.md) - self-hosted runner運用の手順書化。
