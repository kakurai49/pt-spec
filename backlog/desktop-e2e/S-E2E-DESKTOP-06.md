# S-E2E-DESKTOP Issue 6: self-hosted runnerでUIテスト実行

```md
TITLE: [desktop-e2e] self-hosted Windows runnerでpywinauto UIテストを自動実行する
LABELS: S-ENV, desktop, windows, pywinauto, github-actions, ci, P?
S_COLUMN: S-ENV
DEPENDS_ON: S-E2E-DESKTOP-04, S-E2E-DESKTOP-05
EST_SIZE: L

## S（Spec）/ 仕様
目的：
- Windows self-hosted runner上でpywinauto UIテストを自動実行し、ビルドジョブの成果物を用いてリンク遷移を検証する。サービス起動ではなく通常アプリとしてrunnerを動かす前提を明文化する。

スコープ：
- 既存の desktop-build.yml に2ジョブ目として追加するか、新規 `desktop-e2e.yml` を作成。
- UIテストジョブ：
  - `runs-on: [self-hosted, windows, win-uia]` などラベル指定（READMEに必要ラベルを記載）。
  - `needs: build-windows` でビルドジョブ後に実行。
  - `actions/download-artifact` で `win-unpacked.zip` を取得し展開。
  - Python環境セットアップ（`actions/setup-python` 等）。
  - `pip install -r automation/requirements.txt`。
  - `APP_EXE` を展開したEXEに設定して `pytest -q` を実行。
  - テストログ/スクリーンショットを `actions/upload-artifact` でアップロード。
  - 併走防止のため `concurrency` グループを設定。

非スコープ：
- ビルドジョブ定義（Issue 5）
- runnerセットアップ手順書（Issue 7）

受け入れ基準：
- self-hosted Windows runnerでジョブが動作し、pywinautoテストが実行され、結果がartifactとして保存される。

## H（How）/ Codex Prompt
GitHub ActionsにUIテスト用ジョブを追加してください。self-hosted runner上でpywinautoを動かします。

要件:
- 既存の desktop-build.yml に2ジョブ目を追加するか、desktop-e2e.yml を新規作成
- UIテストジョブ:
  - runs-on: [self-hosted, windows, win-uia] のようにラベル指定（ラベルはREADMEに記載）
  - needs: build-windows
  - actions/download-artifact で win-unpacked.zip を取得して展開
  - Pythonセットアップ（可能ならactions/setup-python or 事前インストール前提でもOK）
  - `pip install -r automation/requirements.txt`
  - `APP_EXE` を展開したexeに設定して `pytest -q`
  - テストログ/スクショ等を actions/upload-artifact でアップロード
- 併走防止のため concurrency group を設定（同時にUIテストが走らない）
```
