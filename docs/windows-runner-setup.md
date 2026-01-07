# Windows self-hosted runner セットアップ（GUI E2E向け）

## 目的
- GUIテスト（pywinauto）用に、Windows の通常ログインセッションで runner を動かし続ける。
- サービス化せず、画面が操作可能な状態を維持する。

## self-hosted runner の追加手順
1) GitHub の **Settings → Actions → Runners → New self-hosted runner** を開く。
2) **Windows / x64** を選択し、表示される手順に従って runner をダウンロード・展開する（例: `C:\actions-runner`）。
3) 管理者 PowerShell で表示された `config.cmd --labels win-uia` を実行して登録する。
4) **Windowsサービスとして登録しない**。GUIテストでは対話的なデスクトップが必要なため、ログインしたユーザーのセッションで `run.cmd` を起動し、そのまま開いておく。

## win-uia ラベルの付与/確認
- `ui-tests-windows` ジョブは `runs-on: [self-hosted, windows, win-uia]` を要求するため、**win-uia ラベルが必須**。
- 既存 runner に後付けする場合は、`run.cmd` を停止したうえで `config.cmd --labels win-uia` を再実行する。
  - ラベルが更新されない場合は `config.cmd remove` → `config.cmd --labels win-uia` で再登録する。
- GitHub の **Settings → Actions → Runners** で該当 runner に `win-uia` が付いていることを確認する。

## 常時ログイン・ロック/スリープ無効化の指針
- runner 用アカウントで常時ログインしたままにする。
- スリープ、画面オフ、ロックを無効化する（テスト実行時間を通じて画面が操作可能であることが必須）。
- リモート接続を使う場合も、コンソールセッションが維持される方式で接続し、セッション切断やロックを避ける。

## トラブル時の対処
- **runner が落ちた**: `run.cmd` のコンソールが閉じていないか確認し、ログイン後に再度 `run.cmd` を起動する。
- **画面ロックで失敗する**: ロック解除後に再実行し、電源/ロック設定を再確認する。
- **UIが掴めない/競合する**: 以前のテストで残ったアプリを終了してから runner を再起動する。

## iPhone からの運用
- GitHub のモバイル/ブラウザで **Actions → 対象ワークフロー → Run workflow** を実行できる。
- 起動前に Windows runner が Online であることを確認する（Offline の場合は誰かにログインして `run.cmd` を起動してもらう）。
