# S-ENV-ELECTRON Issue 5: GitHub Actions で Windows ビルド

```md
TITLE: [desktop] GitHub Actionsで Windowsインストーラをビルドし artifact としてアップロード
LABELS: S-ENV, electron, desktop, ci, windows, P?
S_COLUMN: S-ENV
DEPENDS_ON: [desktop] electron-builder で Windows(NSIS)インストーラを生成する
EST_SIZE: M

## S（Spec）/ 仕様
目的：
- CIで Windows インストーラをビルドし、artifact として取得できるようにする。

スコープ：
- `.github/workflows/desktop-windows.yml` 追加
- トリガー: `workflow_dispatch` と `push` tags `v*`
- ジョブ: `windows-latest` で checkout → setup-node(lts) → `npm ci` → `npm run dist:win` → artifact upload

受け入れ基準：
- Actions 成功 & artifact から `.exe` ダウンロード可能

## H（How）/ Codex Prompt
実装タスク：
1) `.github/workflows/desktop-windows.yml` を追加。
2) トリガー: `workflow_dispatch`, `push` tags `v*`。
3) runs-on: `windows-latest`; checkout; setup-node (`lts/*`); `cd desktop && npm ci`; `cd desktop && npm run dist:win`; `desktop/dist/*.exe` を upload-artifact（例: `windows-installer`）。
4) npm cache を有効化できれば有効化。

完了確認：
- workflow 成功 & artifact から `.exe` 取得。
```
