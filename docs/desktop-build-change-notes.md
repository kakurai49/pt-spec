# Desktop Build workflow 更新内容メモ

## 変更点の概要

- Windows ビルドで NSIS インストーラと unpacked ディレクトリを作成し、成果物としてアップロードします。
- UI テスト用に GitHub-hosted runner で Python ランタイムと依存 wheel を作成し、self-hosted runner へ渡します。
- self-hosted runner 側は bundle 済み Python を使って venv を構築し、UI テストを実行します。
- 失敗時の診断情報（EventLog/診断スクリプト）とテスト成果物を収集します。

## メリット

- self-hosted runner の Python toolcache 破損や差分の影響を避け、UI テスト環境を安定化できます。
- wheel を事前に作成することで依存解決のブレを抑え、テストの再現性を向上できます。
- アーティファクトとして win-unpacked と installer を揃えることで、配布・検証の両方に使いやすくなります。
- 失敗時のログ/診断収集が明確になり、原因調査が速くなります。

## デメリット

- ビルド工程が増えるため、GitHub-hosted の実行時間とストレージ消費が増えます。
- Python ランタイム zip と wheel のアップロードによりアーティファクトサイズが増大します。
- self-hosted runner でオンライン fallback が発生する場合、ネットワーク依存が残ります。
