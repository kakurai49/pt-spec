# 手順書：ホームページ更新 → ElectronでWindowsアプリ化 → pywinauto UIテスト自動化（iPhone運用前提）

## 1. あなたがやりたいこと（ゴールの明文化）

1. **ホームページ（静的HTML）を原稿更新**する（GitHubにコミット）
2. そのホームページを **Windowsデスクトップアプリ（Electron）** にして成果物を作る（.exe/zip）
3. Windows上で **pywinauto** を使い、アプリを起動して **リンクをクリックして遷移が正しいか確認**する
4. 1〜3を **自動化**して、基本 **iPhoneだけで回せる**ようにする

---

## 2. 結論：今回に最適な「成果物」と「デプロイ方法」

### 最適解（最初のスコープ）

* **CIで作る成果物（テスト用）**：

  * `win-unpacked.zip`（インストール不要。展開してEXEを起動できる）
  * 理由：UIテストの自動実行で**UAC/管理者権限/インストール対話**が最も事故りやすいので、まずは **“展開して起動”**で安定化するのが最短です。

* **CIで作る成果物（配布用・任意）**：

  * `Setup.exe`（NSISインストーラ）
  * 理由：配布形として分かりやすい。Electron-builderはWindows向けにNSIS等のターゲットをサポート。 ([electron.build][1])

### 「Windowsにアプリをインストールしてテスト」自動化の要点

* UI自動化（pywinauto）は **“アクティブなデスクトップが必要”**。
  CIエージェントを **Windowsサービスとして動かすとGUIテストが動かない**（GUIが作れない/操作できない）ケースが典型です。pywinauto公式のリモート実行ガイドでも、**エージェントをサービスで動かすとGUIテストは動かない**、**通常アプリとして動かすのが唯一の動作ケース**と明記されています。 ([pywinauto.readthedocs.io][2])
* したがって今回の最適解は：

  * **Windows PCに self-hosted runner を置く**
  * その runner を **サービスではなく「ログインユーザーの通常アプリ」として常駐**させる（起動時自動起動）
  * GitHub Actions から、その runner 上で **アプリを起動→pywinautoでUIテスト**まで回す

---

## 3. 全体アーキテクチャ（あなたの2台PC + iPhone運用に最適化）

### 役割

* **iPhone（あなたの操作端末）**

  * Codexで実装指示 → PR作成 → マージ
  * GitHub Actions の結果確認 / 手動実行（workflow_dispatch）
  * 成果物（zip/Setup.exe）のダウンロード

* **GitHub（中枢）**

  * ソース管理（ホームページ原稿）
  * CI/CD（Electronビルド、成果物保管、テスト結果表示）

* **Windows PC（テスト実行機）**

  * self-hosted runnerとして待機
  * GitHub Actionsからジョブが飛んできたら、成果物を受け取ってUIテスト実行（pywinauto）

* **Linux PC（任意・なくても成立）**

  * 使うなら：成果物のミラー（長期保管）、家サーバー（VNC/ログ保管）、バックアップ用途
  * ただし「基本使わない」方針なら省略可能

### IPが違っても成立する理由

self-hosted runner は **GitHubへ外向き通信**できれば動きます（同一LAN不要）。 ([GitHub Docs][3])

---

## 4. リポジトリ側の構成方針（Web開発を崩さず“デスクトップ化”を追加する）

### 重要ポイント：相対リンクを壊さない

あなたの `index.html` は `bt7/scope.html` など、複数フォルダへの**相対リンク**を前提にしています。よって Electron 側でも同じフォルダ構成で同梱するのが基本です。 

---

## 5. 具体手順（One-time setup）

### 5.1 リポジトリに `desktop/`（Electronラッパー）を追加する

#### 推奨ディレクトリ

```
repo-root/
  (既存のWeb: index.html, bt7/, bt30/, qr/ ...)

  desktop/
    app/              # Electronに同梱する静的サイト（ビルド時に自動同期）
    main.js
    preload.js
    package.json
    README.md
```

#### なぜ `desktop/app/` を作るのか

* Electron-builderの `files` 設定で「同梱範囲」を明示しやすい
* Web資産をそのままコピーするだけで動く（相対パスが保てる）

（Electron-builderのWindowsターゲット/NSIS等の概念は公式ドキュメント参照） ([electron.build][1])

---

### 5.2 Web資産→`desktop/app/` への“自動同期”を用意する（重要）

あなたは「ホームページを更新したら、そのままアプリにも反映したい」ので、**同期を人手にしない**のがコツです。

**方針（推奨）**

* Webの正本はこれまで通り `repo-root/` に置く
* Electronビルド時に、必要なファイルだけ `desktop/app/` にコピーする

  * 例：`index.html`, `bt7/**`, `bt30/**`, `qr/**`, `index2.html` …
* GitHub Actions でも同じ同期を実行する（iPhone運用でも常に一致）

---

### 5.3 pywinautoテストしやすい“E2Eフック”を入れる（必須級）

pywinautoは基本 **UIA（UI Automation）** で「画面に見えるもの」を操作します。
ところが「リンクをクリックして、遷移先が正しい」を検証するには、**遷移結果をUIで観測できる仕掛け**が必要です（DOMを直接読むのはpywinautoの守備範囲外になりがち）。

#### 推奨：E2Eモード時だけ、画面右下に「現在のパス」を出す

* `--e2e` 起動オプション（または環境変数）でE2EモードON
* E2Eモードの時だけ、固定表示の小さなラベルをDOMに挿入し、

  * 例：`PATH: /bt7/index.html`
  * を常に更新する
* こうすると pywinauto はそのラベルの文字列を拾って **遷移確認**できます

---

## 6. GitHub Actions で “ビルド→成果物→UIテスト” を自動化

### 6.1 ワークフローの設計（推奨）

1つのworkflow内に2ジョブに分けるのが扱いやすいです。

* **job A（ビルド）**：GitHub-hosted runner（`windows-latest`）でElectronをビルド
  → `win-unpacked.zip` と `Setup.exe` を作って artifact としてアップロード
* **job B（UIテスト）**：あなたのWindows PC（self-hosted runner）で
  → artifact をダウンロードして展開
  → EXE起動
  → pywinautoでリンククリック＆遷移確認
  → 結果（ログ/スクショ/JUnit）をartifactアップロード

Artifactsは `actions/upload-artifact` / `actions/download-artifact` を使うのが定石です。 ([GitHub][4])
（デフォルトでアーティファクトは一定期間保持、必要なら保持日数も設定可能） ([GitHub][4])

### 6.2 トリガー（iPhone運用に最適）

* **基本は `push` to `main`** で自動実行
* 追加で **`workflow_dispatch`**（手動実行ボタン）もつける

  * iPhoneから「今すぐテストしたい」時に押せる
  * GitHub公式手順：Actionsタブで「Run workflow」 ([GitHub Docs][5])

---

## 7. Windows PC（テスト実行機）のセットアップ

### 7.1 必須：self-hosted runner を入れる

GitHub公式の「Adding self-hosted runners」の手順に従って、リポジトリに紐付けます。 ([GitHub Docs][6])

### 7.2 重要：runner を “サービスで動かさない” こと

* GitHub Docsには「runnerをサービス化する方法」がありますが、GUIテスト目的なら注意が必要です。 ([GitHub Docs][7])
* pywinauto公式ガイドは、GUIテストは**アクティブデスクトップ必須**で、**エージェントをサービスとして動かすとGUIテストが動かない**と明示しています。 ([pywinauto.readthedocs.io][2])

**推奨運用**

* Windowsにテスト専用ユーザーを作る
* 自動ログオン（または常時ログイン）＋画面ロック/スリープ無効化
* ログイン後に runner を `run.cmd` で起動（通常アプリとして常駐）

### 7.3 画面がロックされるとUIテストは死ぬ（設計として織り込む）

pywinautoのリモート実行ガイドでも、RDP最小化/切断でアクティブデスクトップが消えたりロックされたりしてGUIテストが失敗する旨が整理されています。 ([pywinauto.readthedocs.io][2])

**対策（選択肢）**

* もっとも堅い：Windows PCを「テスト専用機」と割り切って、常時ログイン＆ロックしない
* iPhoneから画面も見たい：VNCで接続（VNCは切断してもアクティブデスクトップが維持されやすい、とpywinautoガイドが説明） ([pywinauto.readthedocs.io][2])

---

## 8. iPhoneだけで回せる運用フロー（完成形）

### 8.1 日常運用（あなたがやること）

1. iPhoneで GitHub を開く
2. 原稿（HTML）を更新する

   * 直接編集 or Codexに依頼してPRを作らせる
3. PRを作成 → レビュー（自分）→ mainへマージ
4. GitHub Actions が自動で走る

   * ビルド（win-unpacked/Setup.exe生成）
   * Windows self-hosted runner がUIテスト実行
5. iPhoneで Actions の結果を確認

   * 失敗ならログを見る→Codexに修正させる→PR→マージ

### 8.2 手動実行（ボタンで今すぐ回す）

* `workflow_dispatch` をつけておくと、iPhoneから Actions タブで「Run workflow」が押せます。 ([GitHub Docs][5])

---

## 9. Linux PCを使うなら（任意：なくても成立）

「基本Linuxは使わない」前提なら不要ですが、使うなら以下が便利です。

* **成果物の長期保管/ミラー**

  * GitHub Actions のアーティファクトを Linux に落としてNAS保存
  * GitHub CLIの `gh run download` で取得できます。 ([GitHub Docs][8])
* **Windowsの死活監視**（runner落ちたら通知など）
* **家サーバーとしてVNC/ログ置き場**

---

## 10. トラブルシューティング（最初にハマる所）

* UIテストが「ウィンドウが見つからない」で落ちる

  * Windowsがロック/スリープ/セッションが無い可能性大
  * 対策：常時ログイン、ロック無効、VNC運用 ([pywinauto.readthedocs.io][2])

* self-hosted runner をサービス化したらUIが出ない

  * 典型事例（プロセスはいるが画面に出ない）
  * 対策：サービスではなく「通常アプリ」として起動 ([pywinauto.readthedocs.io][2])

---

# 実装を進めるための Issue 分割案（Codexプロンプト付き）

> ここから先は「GitHub Issueに貼って、そのままCodexに投げられる」粒度で分割しています。
> まずは **“最小で回る”** を最優先にしています（あとから機能追加しやすい形）。

---

## Issue 1: `desktop/` にElectronラッパーの最小構成を追加する

**目的**
静的サイトを `file://` で読み込むElectronアプリを起動できるようにする。

**受け入れ条件**

* `npm install` → `npm run start` でWindows上にウィンドウが開き、`desktop/app/index.html` が表示される
* セキュリティ推奨（`nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`）を維持

**Codex用プロンプト**

```
あなたは既存の静的HTMLサイトをElectronで包む担当です。
リポジトリに desktop/ ディレクトリを追加し、以下を満たす最小構成を作ってください。

- desktop/package.json:
  - scripts: start (electron .), dist:win (electron-builder -w)
  - devDependencies: electron, electron-builder
  - build.files: main.js, preload.js, app/**/*
  - build.win.target: nsis
- desktop/main.js:
  - BrowserWindow(1200x820) で desktop/app/index.html を loadFile
  - nodeIntegration false, contextIsolation true, sandbox true, preload 有効
  - ready-to-showで表示（白フラッシュ防止）
  - window.openはshell.openExternalで外部ブラウザへ
- desktop/preload.js: まずは空でOK
- desktop/README.md: 開発起動とdist手順を記載

既存Web資産は後続Issueで同期するので、現時点では desktop/app/index.html だけで動けばOK。
```

---

## Issue 2: Web資産を `desktop/app/` に同期するスクリプトを追加する

**目的**
ホームページ更新がそのままデスクトップアプリに反映されるようにする（手作業コピー排除）。

**受け入れ条件**

* `npm run sync:web`（例）で、repo-rootの `index.html` と必要フォルダ群が `desktop/app/` にコピーされる
* 同期対象は最低限 `index.html`, `bt7/`, `bt30/`, `qr/`, `index2.html`（存在するもの）を含む
  （あなたの `index.html` が相対リンク前提なので、同梱が必須） 

**Codex用プロンプト**

```
desktop/ に Web資産同期機能を実装してください。

要件:
- desktop/package.json に "sync:web" スクリプトを追加
- Node.js で動く同期スクリプトを desktop/scripts/sync-web.js などとして追加
- コピー元: リポジトリルート
- コピー先: desktop/app
- 対象: index.html, index2.html, bt7/, bt30/, qr/ （存在するものだけコピー）
- 既存ファイルは上書き。不要ファイルは消しても良いが、まずは上書きでOK
- これにより `desktop/app/index.html` からの相対リンクが壊れない状態を保証する

合わせて README に「Web更新→sync→start」の流れを追記してください。
```

---

## Issue 3: E2E用の「現在パス表示」オーバーレイをE2Eモード時だけ表示する

**目的**
pywinautoが「遷移したか」をUIで確実に検証できるようにする。

**受け入れ条件**

* `Python Training.exe --e2e` で起動すると、画面内に `PATH: ...` のラベルが出る
* 通常起動（`--e2e`なし）では表示されない
* リンククリック後に `PATH:` が遷移先に更新される

**Codex用プロンプト**

```
ElectronアプリをpywinautoでUIテストしやすくするため、E2Eモード機能を追加してください。

要件:
- `--e2e` 起動オプション（process.argv）または環境変数でE2Eモードを判定
- E2Eモードの時だけ、renderer DOMに固定表示のオーバーレイ要素を挿入する
  - 例: <div id="e2e-path">PATH: /index.html</div>
  - location.pathname + location.hash を定期更新（on popstate/hashchange/interval等）
  - CSSで右下固定、小さめ、クリックの邪魔にならない
- 通常起動では一切挿入しない
- preload.js で DOMContentLoaded 時に注入する実装が望ましい（contextIsolation維持）
```

---

## Issue 4: `automation/` に pywinauto + pytest のUIテストを追加する

**目的**
Windowsアプリを起動し、主要リンクをクリックして `PATH:` を検証する最小E2Eを作る。

**受け入れ条件**

* `pytest -q` で以下が検証される

  * アプリ起動できる
  * ホーム画面で「VEGAを開始」等のリンクをクリックすると `PATH:` が期待通りに変わる
* 失敗時にスクリーンショット等のログが残る（最低1点）

**Codex用プロンプト**

```
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

---

## Issue 5: GitHub Actions（ビルド）を追加して `win-unpacked.zip` と `Setup.exe` を作る

**目的**
iPhoneからPR→マージするだけでWindows向け成果物が作れる。

**受け入れ条件**

* `push main` で workflow が走り、成果物が Actions Artifact として残る
* `win-unpacked.zip`（テスト用）と `Setup.exe`（配布用）が生成される

**Codex用プロンプト**

```
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

（Artifactsのアップロード/ダウンロードは公式アクションを使ってください） ([GitHub][4])

---

## Issue 6: GitHub Actions（UIテスト）を self-hosted runner で実行する

**目的**
Windows実機で pywinauto UIテストを自動実行し、PR/コミットごとに結果が見える。

**受け入れ条件**

* self-hosted runner（Windows）でジョブが動く
* build成果物をダウンロードして展開→テスト実行→結果をartifactとしてアップロード

**Codex用プロンプト**

```
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

---

## Issue 7: Windows self-hosted runner セットアップ手順（ドキュメント化）

**目的**
Windows側の「一度きりのセットアップ」を再現可能にする（あなたが未来に忘れても復元できる）。

**受け入れ条件**

* `docs/windows-runner-setup.md` を追加
* 「サービス化しない」「常時ログイン」「ロック/スリープ対策」「VNC運用（任意）」が書かれている
* GitHub公式の runner 追加手順へのリンク（参照）を含む ([GitHub Docs][6])
* pywinautoの“アクティブデスクトップ必須”注意を明記 ([pywinauto.readthedocs.io][2])

**Codex用プロンプト**

```
docs/windows-runner-setup.md を作成してください。

含める内容:
- self-hosted runner追加手順（GitHubのSettings→Actions→Runners→New self-hosted runner）参照
- 重要: GUIテスト目的のため runner は Windowsサービス化しない（pywinautoのremote execution guideの説明を引用せず要約で）
- 常時ログイン、ロック/スリープ無効化の指針
- トラブル時（runnerが落ちた/画面ロックで失敗する）対処
- iPhoneからは GitHub Actions のRun workflowで起動できる運用
```

---

以上です。
この設計であれば、**初期構築（Windows側にrunner導入）だけ一度やれば**、以後は

* iPhoneで原稿更新 → PR → mainマージ
* GitHub Actionsがビルド
* Windows self-hosted runnerがUIテスト
* iPhoneで結果確認

という流れを **ほぼ完全にiPhoneだけ**で回せます（Windowsは“動かしておく対象”になります）。

[1]: https://www.electron.build/
[2]: https://pywinauto.readthedocs.io/en/latest/remote_execution.html
[3]: https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners
[4]: https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts
[5]: https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow
[6]: https://docs.github.com/en/actions/hosting-your-own-runners/adding-self-hosted-runners
[7]: https://docs.github.com/en/actions/hosting-your-own-runners/configuring-the-self-hosted-runner-application-as-a-service
[8]: https://cli.github.com/manual/gh_run_download
