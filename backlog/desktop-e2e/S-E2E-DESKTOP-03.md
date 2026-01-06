# S-E2E-DESKTOP Issue 3: E2Eモードのパス表示オーバーレイ

```md
TITLE: [desktop-e2e] E2Eモード時にPATH表示オーバーレイを追加する
LABELS: S-ENV, electron, desktop, e2e, pywinauto, P?
S_COLUMN: S-ENV
DEPENDS_ON: S-E2E-DESKTOP-02
EST_SIZE: M

## S（Spec）/ 仕様
目的：
- pywinautoがリンク遷移をUI経由で検証できるよう、E2E起動時だけ画面に現在のパスを表示するオーバーレイを追加する。

スコープ：
- `--e2e` 起動オプション（または環境変数）でE2Eモードを判定。
- E2Eモード時のみ、renderer DOMに固定表示の `<div id="e2e-path">PATH: ...</div>` を注入し、`location.pathname + location.hash` を更新表示。
- CSSは右下固定・小さめでクリックを邪魔しない。通常起動では一切表示しない。
- 実装は `preload.js` で DOMContentLoaded 時に注入し、`contextIsolation:true` を維持。

非スコープ：
- pywinautoテスト本体（Issue 4）
- CIジョブ追加（Issue 5以降）

受け入れ基準：
- `Python Training.exe --e2e` のようにE2Eモードで起動すると画面右下に `PATH: ...` が表示され、リンク遷移後に更新される。
- `--e2e` なしではオーバーレイが表示されない。

## H（How）/ Codex Prompt
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
