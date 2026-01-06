# S-E2E-DESKTOP：EPIC＋Issue 1〜7 を一括でこなす総合Issue

```md
TITLE: [desktop-e2e] EPIC＋Issue 1〜7 を一括実行するオールインワンIssue
LABELS: S-ENV, electron, desktop, windows, e2e, pywinauto, github-actions, docs
S_COLUMN: S-ENV
DEPENDS_ON:
EST_SIZE: XL

## S（Spec）/ 仕様
目的：
- 静的HTML→Electron化→Windowsビルド→pywinauto UIテスト→self-hosted runner運用までを一本のIssueで完了させ、iPhoneだけで「原稿更新→ビルド→UIテスト確認」が回る状態にする。元EPICで途中だったCodex向けプロンプトをここで完結させる。

成果物：
- Electronラッパー（desktop/）＋Web資産同期スクリプト＋E2E専用オーバーレイ。
- pywinauto＋pytestのE2EテストコードとArtifacts保存処理。
- GitHub Actions（windows-latestビルド + self-hosted Windows UIテスト）の2ジョブ構成ワークフロー。
- Windows self-hosted runnerセットアップ手順ドキュメント。

アーキテクチャ：
- iPhone：Codex指示＋GitHub UIでPR/Actions/artifact確認。
- GitHub：ソース管理＋Actions（ビルドジョブ＝windows-latest、UIテストジョブ＝self-hosted Windows）。
- Windows PC：self-hosted runner（サービス化せず常駐、画面ロック不可）でpywinauto UIテスト実行。必要ならLinux PCでartifactミラー。

受け入れ基準：
- 下記タスクA〜Gが完了し、`main`へのpushまたは手動実行でビルドartifact（win-unpacked.zip, Setup.exe）とUIテスト結果artifactが取得できる。
- `APP_EXE=<展開exe> pytest -q` がWindowsで成功し、E2EオーバーレイでPATHが遷移更新される。

## H（How）/ Codex Prompt
あなたは静的HTMLサイトをElectronでWindowsデスクトップ化し、pywinautoでリンク遷移を自動検証するパイプラインを全て実装し切る。以下のタスクA〜Gを順に進め、一気通貫で動く状態を作ってください。

### タスクA（Issue 1相当）：Electron最小ラッパー追加
- `desktop/` に Electron 基本ファイル（package.json, main.js, preload.js, README.md, app/index.htmlダミー）を追加。
- BrowserWindow(1200x820) で `desktop/app/index.html` を `loadFile`。`ready-to-show` で表示。`window.open` を `shell.openExternal` に転送。
- セキュリティ：`nodeIntegration:false`、`contextIsolation:true`、`sandbox:true`。`build.win.target: nsis`、`build.files` に main.js/preload.js/app/*** を含める。
- 受入れ：`cd desktop && npm install && npm run start` でWindows起動し、app/index.html表示。

### タスクB（Issue 2相当）：Web資産同期スクリプト
- `npm run sync:web` を `desktop/package.json` に追加。Nodeスクリプトを `desktop/scripts/sync-web.js` 等で実装。
- ルートから `index.html`, `index2.html`, `bt7/`, `bt30/`, `qr/`（存在分のみ）を `desktop/app/` にコピー。上書きでOK。
- READMEに「Web更新→sync→start」手順を追記。
- 受入れ：`npm run sync:web` 後に相対リンクが壊れず `npm run start` で閲覧できる。

### タスクC（Issue 3相当）：E2Eモード用PATHオーバーレイ
- `--e2e` 起動オプションまたは環境変数でE2Eモード判定。
- E2E時のみ `<div id="e2e-path">PATH: ...</div>` を renderer に注入し、`location.pathname + location.hash` を更新表示。右下固定・小さめでクリック阻害しないCSS。
- 実装は `preload.js` で DOMContentLoaded 後に挿入し、`contextIsolation:true` を維持。通常起動では非表示。
- 受入れ：`Python Training.exe --e2e` でPATHが遷移ごとに更新し、`--e2e` 無しでは表示されない。

### タスクD（Issue 4相当）：pywinauto+pytest E2E
- `automation/requirements.txt` に pytest, pywinauto（必要ならpywin32等）。
- `automation/tests/test_links.py` を追加。`APP_EXE` 環境変数からEXE取得（無い場合はエラー）。`APP_EXE --e2e` で起動し backend="uia" でメインウィンドウ取得。
- 「VEGAを開始」「ALTAIRを開始」「DENEBを開始」等のリンクをクリックし、`PATH:` オーバーレイが期待パスに変わるまでリトライ（例10秒）で待機してassert。終了時にアプリを閉じ、失敗時は `artifacts/` にスクショを保存。
- 受入れ：`APP_EXE=<解凍EXE> pytest -q` がWindowsで通る。

### タスクE（Issue 5相当）：ActionsでWindows成果物ビルド
- `.github/workflows/desktop-build.yml` を追加。trigger: `push`(main) + `workflow_dispatch`。
- ジョブ build-windows（runs-on: windows-latest）：checkout→Node LTS→`cd desktop && npm ci`→`npm run sync:web`→`npm run dist:win`（NSIS installer）→`electron-builder -w --dir` で `win-unpacked` 生成→zip化。
- `actions/upload-artifact` で `desktop-win-unpacked`（win-unpacked.zip）と `desktop-win-installer`（Setup.exe）をアップロード（保存日数短め可）。
- 受入れ：workflow成功しartifact2種が取得できる。

### タスクF（Issue 6相当）：self-hosted runnerでUIテスト
- 既存 desktop-build.yml に2ジョブ目追加、または新規 desktop-e2e.yml を作成。
- UIテストジョブ：`runs-on: [self-hosted, windows, win-uia]`（READMEにラベル明記）、`needs: build-windows`。`actions/download-artifact` で `win-unpacked.zip` を展開。
- Pythonセットアップ→`pip install -r automation/requirements.txt`。`APP_EXE` を展開EXEに設定し `pytest -q`。
- テストログ/スクショを `actions/upload-artifact` で保存。併走防止に `concurrency` group を設定。
- 受入れ：self-hosted Windows runnerでpywinautoテストが動き、結果がartifact化。

### タスクG（Issue 7相当）：Windows runner手順ドキュメント
- `docs/windows-runner-setup.md` を作成。`Settings→Actions→Runners→New self-hosted runner` の追加手順リンクを記載。
- GUIテストのため「サービス化しない」運用を明記し、ログイン常駐・ロック/スリープ無効化・画面ロックで失敗する旨を記述。VNC等で画面保持する運用のヒントと死活監視のTips。iPhoneからActionsをRunする運用例を追記。
- 受入れ：上記注意を含む手順書が追加されている。

## T（Test）/ 動作確認
- Windowsローカル：`cd desktop && npm install && npm run sync:web && npm run start` で画面が開きリンクが有効。`Python Training.exe --e2e` でPATHオーバーレイが更新すること。
- Windowsローカル：`APP_EXE=<win-unpacked内exeパス> pytest -q` でE2Eが通る。失敗時スクショが `automation/tests/artifacts/` 等に残ることを確認。
- GitHub Actions：`workflow_dispatch` でビルドジョブartifact（win-unpacked.zip, Setup.exe）とUIテストartifact（ログ/スクショ）が取得できる。
```
