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
  |   ├─ dist/win-unpacked/ffmpeg.dll を検証（SHA256表示）
  |   └─ artifacts: win-unpacked.zip / Setup.exe（正規化済み）
  |
  └─ job: ui-tests-windows (self-hosted, windows, win-uia)
      ├─ artifacts download
      ├─ win-unpacked 展開
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
| 4. Windowsビルド | GitHub Actions (windows-latest) | NSIS/Unpackedビルド + installer名を `Setup.exe` に正規化 | - | `desktop-win-unpacked` / `desktop-win-installer` artifacts |
| 5. 配布 | GitHub Actions | artifacts を保存 | - | artifacts（zip/Setup.exe） |
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

### 成果物の健全性チェック強化
- build-windows で `dist/win-unpacked/ffmpeg.dll` の有無とSHA256を検証するため、欠損した成果物が早期に検出される。
- ui-tests-windows 側でも展開後の `win-unpacked/ffmpeg.dll` を再検証するため、転送/展開時の破損が可視化される。

### UIテストの再現性と安定性の向上
- Python のtoolcache/stdlib健全性を事前確認し、`PYTHONHOME`/`PYTHONPATH` を除去してクリーンな venv を作成するため、ランナーの状態差による失敗が減る。
- `APP_EXE` はサイズ降順→フルパス昇順で決定論的に選定されるため、同一成果物に対して常に同じEXEが選ばれる。

### 失敗時の診断性向上
- UIテスト失敗時に Windows EventLog と診断スクリプトを収集するため、クラッシュや環境要因の切り分けが容易になる。
