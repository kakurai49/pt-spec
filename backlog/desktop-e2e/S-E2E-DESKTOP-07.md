# S-E2E-DESKTOP Issue 7: Windows runnerセットアップ手順をドキュメント化

```md
TITLE: [desktop-e2e] Windows self-hosted runnerセットアップ手順をドキュメント化する
LABELS: S-ENV, desktop, windows, docs, runner, P?
S_COLUMN: S-ENV
DEPENDS_ON:
EST_SIZE: M

## S（Spec）/ 仕様
目的：
- GUI必須のpywinautoテストを安定させるため、Windows self-hosted runnerを「サービス化しない通常アプリ」として常駐させる運用手順をドキュメント化する。

スコープ：
- `docs/windows-runner-setup.md` を追加し、以下を記載：
  - GitHubの「Settings→Actions→Runners→New self-hosted runner」での追加手順（公式Docs参照リンク）。
  - GUIテストのためrunnerをサービス化しないこと、ログインユーザーとして常駐させること。
  - 常時ログイン／ロック・スリープ無効化の推奨と、画面ロックでpywinautoが失敗する旨。
  - VNCなどで画面を保持する運用（任意）と、runner死活監視のヒント。
  - iPhoneからは Actions の Run workflow で起動できる運用例。

非スコープ：
- Actionsジョブ実装（Issue 5, 6）
- pywinautoテストコード（Issue 4）

受け入れ基準：
- 上記内容を含む手順書が `docs/windows-runner-setup.md` に追加され、GUIテストに必要な注意点（サービス化しない等）が明記されている。

## H（How）/ Codex Prompt
docs/windows-runner-setup.md を作成してください。

含める内容:
- self-hosted runner追加手順（GitHubのSettings→Actions→Runners→New self-hosted runner）参照
- 重要: GUIテスト目的のため runner は Windowsサービス化しない（pywinautoのremote execution guideの説明を引用せず要約で）
- 常時ログイン、ロック/スリープ無効化の指針
- トラブル時（runnerが落ちた/画面ロックで失敗する）対処
- iPhoneからは GitHub Actions のRun workflowで起動できる運用
```
