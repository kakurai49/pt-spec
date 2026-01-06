# S-E2E-DESKTOP Issue 5: GitHub ActionsでWindows成果物をビルド

```md
TITLE: [desktop-e2e] Actionsでwin-unpacked.zipとSetup.exeをビルド&artifact化する
LABELS: S-ENV, desktop, electron, windows, ci, github-actions, P?
S_COLUMN: S-ENV
DEPENDS_ON: S-E2E-DESKTOP-02
EST_SIZE: L

## S（Spec）/ 仕様
目的：
- `push main` および `workflow_dispatch` でGitHub ActionsがElectronのWindows成果物を生成し、`win-unpacked.zip`（テスト用）と `Setup.exe`（配布用）をartifactとして残す。

スコープ：
- `.github/workflows/desktop-build.yml` を追加（または既存ワークフローにジョブ追加）。
- ジョブ `build-windows`（runs-on: windows-latest）で以下を実行：
  - checkout、Node LTSセットアップ。
  - `cd desktop && npm ci`。
  - `npm run sync:web` でWeb資産同期。
  - `npm run dist:win` でNSISインストーラ生成。
  - `electron-builder -w --dir` で `win-unpacked` を生成しzip化。
  - `actions/upload-artifact` で `desktop-win-unpacked` と `desktop-win-installer` をアップロード（保持日数は短めで可）。

非スコープ：
- UIテストジョブ（Issue 6）
- pywinauto実装（Issue 4）

受け入れ基準：
- `main` へのpushまたは手動実行でworkflowが成功し、Actions artifactに `win-unpacked.zip` と `Setup.exe` が保存される。

## H（How）/ Codex Prompt
GitHub ActionsでElectronのWindows成果物を作るworkflowを追加してください。

要件:
- .github/workflows/desktop-build.yml を追加
- trigger: push(main), workflow_dispatch
- job: build-windows (runs-on: windows-latest)
  - checkout
  - setup-node (LTS)
  - `cd desktop && npm ci`
  - `npm run sync:web`
  - `npm run dist:win`（NSIS installer）
  - 追加で `electron-builder -w --dir` も実行して win-unpacked を作りzip化（テスト用）
  - actions/upload-artifact で
    - artifact name: desktop-win-unpacked
    - artifact name: desktop-win-installer
  - artifacts保持日数は短めで良い（例: 7日）でもOK
```
