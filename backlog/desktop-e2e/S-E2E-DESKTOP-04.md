# S-E2E-DESKTOP Issue 4: pywinauto+pytestでリンク遷移E2E

```md
TITLE: [desktop-e2e] pywinauto+pytestでリンク遷移を自動検証する
LABELS: S-ENV, desktop, windows, pywinauto, pytest, P?
S_COLUMN: S-ENV
DEPENDS_ON: S-E2E-DESKTOP-03
EST_SIZE: L

## S（Spec）/ 仕様
目的：
- Windows上でビルド済みElectronアプリを起動し、主要リンクをクリックして `PATH:` オーバーレイが期待通りに更新されるかをpywinauto+pytestで検証する。

スコープ：
- `automation/requirements.txt` に pytest, pywinauto（必要ならpywin32等）を定義。
- `automation/tests/test_links.py` を追加し、以下を実装：
  - 環境変数 `APP_EXE` からEXEパス取得。未指定ならエラーにする。
  - `APP_EXE --e2e` でアプリ起動（backend="uia"）。メインウィンドウ取得。
  - 「VEGAを開始」「ALTAIRを開始」「DENEBを開始」等のリンクをクリックし、オーバーレイ `PATH:` が期待パスに変わるまでリトライで待機（例：10秒タイムアウト）。
  - 後片付けでアプリを終了。
  - 失敗時にスクリーンショット等を `artifacts/` に保存。

非スコープ：
- CIでの実行（Issue 6）
- ビルドジョブ（Issue 5）

受け入れ基準：
- Windows環境で `APP_EXE=<解凍したEXE> pytest -q` を実行すると、リンク遷移が検証され、失敗時はスクリーンショットが残る。

## H（How）/ Codex Prompt
automation/ 配下にpywinauto+pytestのE2Eテスト基盤を作ってください。

要件:
- automation/requirements.txt: pytest, pywinauto 等（必要に応じてpywin32も）
- automation/tests/test_links.py:
  - ビルド成果物のEXEパスを環境変数 APP_EXE から取得（なければエラー）
  - `APP_EXE --e2e` で起動
  - pywinauto(backend="uia")でメインウィンドウを取得
  - テキスト/リンク「VEGAを開始」「ALTAIRを開始」「DENEBを開始」などを順にクリックし、
    オーバーレイの `PATH:` 表示が期待のパスになるまで待ってassert
  - 後片付けでアプリを終了
- 待機はtime.sleep固定ではなく、リトライで最大タイムアウト（例: 10秒）にする
- 失敗時にスクリーンショットを artifacts/ に保存する（可能なら）
```
