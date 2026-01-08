# Windows UIテスト依存関係インストール失敗のバグレポート

## 概要
Windows UIテストの依存関係インストール中に `pillow` の取得が失敗し、ジョブが終了する問題が発生した。

## 症状
- `pip install -r automation/requirements.txt` 実行時に HTTPS 接続が失敗する。
- 具体的には `SSLError("Can't connect to HTTPS URL because the SSL module is not available.")` が表示され、`pillow` の取得に失敗する。
- 結果として `No matching distribution found for pillow` で終了する。

## 影響
- Windows UIテストの依存関係インストールが失敗し、UIテストが実行されない。
- `desktop-build.yml` の `ui-tests-windows` ジョブで発生する。

## 原因（推測）
- `pip` コマンドが `actions/setup-python` でセットアップした Python ではなく、自己ホストランナー上の別の Python/venv を参照していた可能性が高い。
- その別環境の Python に SSL モジュールが組み込まれておらず、HTTPS 経由の PyPI 接続が失敗した。
- 直接 `pip` を呼ぶと PATH 依存になり、複数 Python がある環境では誤った環境を引くリスクがある。

## 再現条件（推定）
- 自己ホスト Windows ランナーに複数の Python/venv が存在し、PATH 上の `pip` が SSL 非対応の Python を指している。
- `ui-tests-windows` で `pip install -r automation/requirements.txt` を実行する。

## 対応方針
- `pip` を直接呼ばず、`python -m pip` を用いて `actions/setup-python` の Python に紐づく pip を強制する。
- `ui-tests-windows` の依存関係インストールで `python -m pip install -r automation/requirements.txt` に統一する。

## 関連箇所
- `.github/workflows/desktop-build.yml` の `Install UI test dependencies` ステップ。
