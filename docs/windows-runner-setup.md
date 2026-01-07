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

## pywinauto 仮想環境の動作確認（依存ライブラリの確認）
> 目的: pywinauto と周辺ライブラリ（pylon、pywin32、comtypes）がインポートできるかを **対話セッション上** で確認する。

### 1) 仮想環境を有効化
例: pywinauto の仮想環境が `C:\path\to\venv` にある場合

```powershell
cd C:\path\to\venv
.\Scripts\Activate.ps1
```

### 2) バージョン確認（インストール済みの確認）
```powershell
python -m pip show pywinauto pypylon pywin32 comtypes
```

### 3) インポートのスモークテスト
```powershell
python - <<'PY'
import pywinauto
import pypylon
import win32api
import comtypes
print("pywinauto", pywinauto.__version__)
print("pypylon", pypylon.__version__)
print("pywin32", win32api.__file__)
print("comtypes", comtypes.__version__)
PY
```

### 4) UI 制御の最小確認（電卓を開けるか）
> ※ GUI セッション上で実行すること（ロック/切断状態では失敗しやすい）

```powershell
python - <<'PY'
from pywinauto import Application

app = Application(backend="uia").start("calc.exe")
window = app.window(title_re=".*電卓.*|.*Calculator.*")
window.wait("visible", timeout=10)
app.kill()
print("OK")
PY
```

## トラブル時の対処
- **runner が落ちた**: `run.cmd` のコンソールが閉じていないか確認し、ログイン後に再度 `run.cmd` を起動する。
- **画面ロックで失敗する**: ロック解除後に再実行し、電源/ロック設定を再確認する。
- **UIが掴めない/競合する**: 以前のテストで残ったアプリを終了してから runner を再起動する。
- **`No module named pip` / `ssl module is not available` で `pip install` が失敗する**:
  - 原因: `actions/setup-python` が参照する Python の SSL/ensurepip が欠けている（ツールキャッシュの破損など）。
  - 対策: `C:\actions-runner\_work\_tool\Python\` を削除して再取得するか、公式インストーラで Python を再インストールする。
  - 追加確認: `python -c "import ssl; print(ssl.OPENSSL_VERSION)"` が通ることを確認する。

## iPhone からの運用
- GitHub のモバイル/ブラウザで **Actions → 対象ワークフロー → Run workflow** を実行できる。
- 起動前に Windows runner が Online であることを確認する（Offline の場合は誰かにログインして `run.cmd` を起動してもらう）。
