# デスクトップ化パイプラインのアーキテクチャ & テスト結果まとめ

## 目的
Webアプリ更新後に「Windows向けビルド → 配布 → デプロイ → UIテスト」までを自動で流す仕組みを、
アーキテクチャとステップ単位のテスト結果が追える形で記録します。

---

## アーキテクチャ（全体像）

```
[Web更新 (index.html など)]
        |
        v
[GitHub Actions: desktop-build.yml]
  ├─ job: build-windows (windows-latest)
  |   ├─ npm ci
  |   ├─ npm run sync:web
  |   ├─ npm run dist:win (NSIS installer)
  |   ├─ dist/*.exe を Setup.exe に正規化
  |   ├─ electron-builder -w --dir (unpacked)
  |   ├─ win-unpacked.zip 作成
  |   ├─ Python runtime を portable zip 化
  |   ├─ UIテスト依存を wheels 化
  |   └─ artifacts: win-unpacked.zip / Setup.exe / python-runtime.zip / ui-wheels
  |
  └─ job: ui-tests-windows (self-hosted, windows, win-uia)
      ├─ artifacts download
      ├─ win-unpacked 展開
      ├─ Python runtime 展開
      ├─ bundled Python で venv 作成
      ├─ wheels 優先で依存導入（失敗時はオンライン）
      ├─ win-unpacked/ffmpeg.dll を検証（SHA256表示）
      ├─ Python/venvの事前ヘルスチェック
      ├─ pytest -q (pywinauto UIテスト)
      ├─ failure時: Windows EventLog / diagnostics 収集
      └─ artifacts: pytest.log / screenshots / test-results
```

**成果物の保存先**: GitHub Actions の artifacts に保存（7日保持）。

---

## ステップ別の処理内容とテスト結果の保存場所

| ステップ | 実行場所 | 内容 | テスト/検証 | 成果物/ログの保存先 |
| --- | --- | --- | --- | --- |
| 1. Web更新 | 開発端末 or GitHub | HTMLや静的ファイルを更新しコミット | - | Git履歴（コミット） |
| 2. ビルド準備 | GitHub Actions (windows-latest) | Node.jsセットアップ & 依存インストール | - | Actionsログ |
| 3. Web同期 | GitHub Actions (windows-latest) | `npm run sync:web` で `desktop/app/` に同期 | - | Actionsログ |
| 4. Windowsビルド | GitHub Actions (windows-latest) | NSIS/Unpackedビルド + installer名を `Setup.exe` に正規化 + win-unpacked.zip 作成 | - | `desktop-win-unpacked` / `desktop-win-installer` artifacts |
| 5. UIテスト準備 | GitHub Actions (windows-latest) | Python runtime を portable zip 化 + UI依存を wheels 化 | - | `ui-python-runtime-win-x64` / `ui-python-wheels-win-x64` artifacts |
| 6. デプロイ | self-hosted runner | win-unpacked 展開 & EXE準備 | - | Actionsログ |
| 7. UIテスト | self-hosted runner | Python/venvの事前チェック + `pytest -q` (pywinauto) | **UIテスト結果** | `desktop-ui-test-artifacts` (pytest.log / screenshots / test-results) |

---

## テスト結果（記録欄）

> **更新方法**: Actionsの実行結果と artifacts を確認し、下記に記録する。

| 実行日時 | 対象コミット | 結果 | 参照した証跡 | 備考 |
| --- | --- | --- | --- | --- |
| 未記録 | - | - | - | 直近のActions結果を確認して記入 |

---

## 参照先（ワークフロー）

- `.github/workflows/desktop-build.yml`
  - build-windows（ビルド/配布）
  - ui-tests-windows（UIテスト）

---

## 差分内容の効果（リバースエンジニアリング結果）

### UIテストの再現性と安定性の向上
- GitHub-hosted で Python runtime を portable zip として作成し、self-hosted ではそれを展開して venv を構築するため、runner 側の壊れた toolcache 影響を回避できる。
- UIテスト依存を wheels として固めて配布し、self-hosted 側では offline install を優先するため、依存解決のブレが減る。
- `APP_EXE` はサイズ降順→フルパス昇順で決定論的に選定されるため、同一成果物に対して常に同じEXEが選ばれる。

### 成果物の健全性チェック強化
- ui-tests-windows 側で展開後の `win-unpacked/ffmpeg.dll` を検証するため、転送/展開時の破損が可視化される。

### 失敗時の診断性向上
- UIテスト失敗時に Windows EventLog と診断スクリプトを収集するため、クラッシュや環境要因の切り分けが容易になる。
