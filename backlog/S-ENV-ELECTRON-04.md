# S-ENV-ELECTRON Issue 4: electron-builder で NSIS インストーラ生成

```md
TITLE: [desktop] electron-builder で Windows(NSIS)インストーラを生成する
LABELS: S-ENV, electron, desktop, release, P?
S_COLUMN: S-ENV
DEPENDS_ON: [desktop] app:// カスタムプロトコルで読み込み（file://回避）＋ permission handler 実装
EST_SIZE: M

## S（Spec）/ 仕様
目的：
- Windows向けに配布可能な NSIS インストーラ（.exe）を生成できるようにする。

スコープ：
- `desktop` に `electron-builder` を導入
- `npm run dist:win` で `desktop/dist/` に .exe 生成
- ビルド前に `sync:web` が走る

受け入れ基準：
- Windowsで `cd desktop && npm ci && npm run dist:win` が成功し、`dist` に .exe が出る
- インストーラでインストール→起動できる（手動）

## H（How）/ Codex Prompt
実装タスク：
1) `desktop/package.json` に `electron-builder` を devDependency 追加。
2) scripts: `dist:win`: `npm run sync:web && electron-builder -w`。
3) `build` 設定を追加：`appId`、`productName`、`files`（`main.js`, `preload.js`, `app/**/*` など）、`win.target: nsis`、`nsis` 最小設定。`directories.output` を `desktop/dist/` に。
4) 生成物出力を `desktop/dist/` に統一。

完了確認：
- `npm run dist:win` で `desktop/dist/` にインストーラ生成。
```
