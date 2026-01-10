# バグレポート: win-unpacked アーティファクトが不完全で UI テストの Preflight が失敗

## タイトル
Windows の win-unpacked アーティファクトが不完全で ffmpeg.dll が含まれず、self-hosted UI テストの Preflight が失敗する

## 概要
GitHub-hosted のビルドで生成した `desktop/dist/win-unpacked.zip` を self-hosted Windows に展開すると、`win-unpacked` 直下に `PT Spec.exe` しか存在せず、Electron ランタイム一式（例: `ffmpeg.dll` や `resources`）が欠落している。これにより Preflight の `ffmpeg.dll` チェックが失敗し、UI テストが実行されない。

## 影響
- self-hosted Windows での UI テストが Preflight で失敗し、E2E/UI テストが走らない。
- 「ビルド成果物をアーティファクト化し、同一成果物でテストする」という目的が成立しない。

## 発生環境
- 実行環境: Windows（GitHub Actions）
- Python: 3.11.9
- 失敗ステップ: Preflight UI test environment（PowerShell）

## 実際の結果
- `win-unpacked` 直下の一覧が `PT Spec.exe` のみ。
- `ffmpeg.dll` が root に存在せず、再帰検索でも見つからないため Preflight が失敗。

### ログ抜粋
```
== win-unpacked root listing ==

Name          Length
----          ------
PT Spec.exe 30146560

ffmpeg.dll not found at root, searching recursively...
ffmpeg.dll not found in win-unpacked
##[error]Process completed with exit code 1
```

## 期待結果
- 展開後の `win-unpacked` に Electron 配布物として通常存在するファイルが揃っていること。
- 少なくとも `win-unpacked\ffmpeg.dll` が存在すること。
- `resources` ディレクトリが存在すること。
- Preflight が成功し UI テストが継続されること。

## 再現手順
1. workflow で `desktop/dist/win-unpacked.zip` を生成・アーティファクト化する。
2. self-hosted 側で `win-unpacked.zip` を `win-unpacked/` へ展開する。
3. Preflight で `Test-Path win-unpacked\ffmpeg.dll` が `false` となり、再帰探索でも見つからず例外で終了する。

## 原因仮説
- **仮説A（最有力）**: `npx electron-builder -w --dir` の出力先や生成内容が変更され、`dist/win-unpacked` が実際の unpacked ディレクトリではなくなっている。
- **仮説B**: zip 化対象パスが誤っており、必要ファイルが zip に入っていない。
- **仮説C**: Electron 配布物の同梱ポリシー変更により `ffmpeg.dll` が除外されている。

## 関連ファイル
- workflow 定義: `.github/workflows/desktop-build.yml`
  - `Zip unpacked build` で `dist/win-unpacked/*` を zip 化
  - `Preflight UI test environment` で `win-unpacked\ffmpeg.dll` を必須チェック

## 対応案
- **対応1**: `electron-builder -w --dir` の直後に unpacked 出力の検証（`resources` などの存在チェック、再帰 listing 出力）を追加する。
- **対応2**: `npx electron-builder -w --dir` の実際の出力先を検出し、正しい unpacked ディレクトリを zip 化する。
- **対応3**: Preflight 失敗時に必ず `win-unpacked` の再帰 listing を出力し、診断容易性を高める。

## 完了条件
- `win-unpacked` に `ffmpeg.dll` が存在すること。
- `resources` を含む Electron ランタイム一式が含まれること。
- Preflight が成功し UI テストが最後まで走ること。
