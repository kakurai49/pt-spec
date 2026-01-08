# CI実行ログ調査レポート（現行）

## 目的
CI関連のトラブルについて、「どこで・どの環境でテストが実行されたか」を**実行ログの証跡**で確認し、
根拠とともに整理する。

## 調査結果サマリ
- **現時点の環境（この作業環境）からは GitHub Actions の実行ログにアクセスできない**ため、
  実行ログの証跡（ジョブのホスト名や runner 名、実行コマンドの出力）を**直接取得できていない**。
- そのため、本レポートは **「取得すべきログの種類・場所」と「抽出観点」**を明示し、
  **実行ログのスクリーンショット/引用を貼り付ける欄**を用意した。
- 取得後、このドキュメントに貼り付けることで「どこで・どう実行されたか」を証跡付きで確定できる。

> 注: 実行ログの取得は GitHub Actions の UI 上（Actionsタブ）で行う必要がある。

---

## 対象ワークフローとログで確認すべき証跡

### 1) Desktop Build（`.github/workflows/desktop-build.yml`）

#### 1-1. build-windows ジョブ（GitHub-hosted runner）
- **runs-on**: `windows-latest`
- **ログで確認すべき証跡**
  - ジョブ開始時の runner 情報（"Hosted runner"/"windows-latest" 表記）
  - `npm ci`, `npm run sync:web`, `npm run dist:win` の実行ログ
  - `Upload win-unpacked artifact` / `Upload installer artifact` の実行ログ

**証跡貼り付け欄**
- [ ] ジョブ概要のスクリーンショット（runner情報が分かる箇所）
- [ ] `npm run dist:win` のログ抜粋
- [ ] artifact upload のログ抜粋

#### 1-2. ui-tests-windows ジョブ（self-hosted runner）
- **runs-on**: `[self-hosted, windows, win-uia]`
- **ログで確認すべき証跡**
  - ジョブ開始時の runner 情報（self-hosted / runner 名）
  - `actions/setup-python@v5` 実行ログ
  - `pytest -q` 実行ログ（UIテストの実行結果）
  - `Upload UI test artifacts` の実行ログ

**証跡貼り付け欄**
- [ ] ジョブ概要のスクリーンショット（runner名が分かる箇所）
- [ ] `pytest -q` 実行ログ抜粋
- [ ] artifact upload のログ抜粋

---

### 2) python-ci（`.github/workflows/python-ci.yml`）

#### 2-1. test ジョブ（GitHub-hosted runner）
- **runs-on**: `ubuntu-latest`
- **ログで確認すべき証跡**
  - ジョブ開始時の runner 情報（"Hosted runner"/"ubuntu-latest" 表記）
  - `ruff check .` と `pytest` の実行ログ

**証跡貼り付け欄**
- [ ] ジョブ概要のスクリーンショット（runner情報が分かる箇所）
- [ ] `ruff check .` のログ抜粋
- [ ] `pytest` のログ抜粋

---

## 実行ログの取得手順（GitHub Actions UI）

1. GitHub リポジトリの **Actions タブ**を開く。
2. 対象ワークフロー（`Desktop Build`, `python-ci`）を選択。
3. 最新の実行を開き、該当ジョブのログ画面へ。
4. ジョブの最上部にある **Runner 情報**（self-hosted/hosted）を確認しスクリーンショット取得。
5. 該当ステップのログを開き、重要な抜粋をコピーする。

---

## 証跡整理フォーマット（貼り付け用）

### Desktop Build / build-windows
- 実行日時: 
- 対象コミット: 
- runner情報（スクリーンショット）: 
- ログ抜粋:
  - `npm run dist:win`:
  - artifact upload:

### Desktop Build / ui-tests-windows
- 実行日時: 
- 対象コミット: 
- runner情報（スクリーンショット）: 
- ログ抜粋:
  - `pytest -q`:
  - artifact upload:

### python-ci / test
- 実行日時: 
- 対象コミット: 
- runner情報（スクリーンショット）: 
- ログ抜粋:
  - `ruff check .`:
  - `pytest`:

---

## 補足
- self-hosted runner は **Windows PC上で `run.cmd` を対話セッションとして動かす必要がある**。
- runnerがサービスとして起動されている場合、GUIテストは動作しない可能性が高い。
- 取得した証跡（ログ・スクリーンショット）をこのドキュメントに貼り付けることで、
  「どこでどう実行されたか」を確定できる。
