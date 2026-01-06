# AGENTS.md (SIRIUS RL)

このリポジトリで Codex が作業するときの共通ルールです。**差分は最小**、**CI は非flaky**、**再現性（seed 固定）**を最優先にします。

## ゴール
- Mission 1: Bandit（agent 実装 + bench + 非flaky テスト）
- Mission 2: GridWorld（決定論） + DP（value/policy iteration） + テスト
- Mission 3: TD（Q-learning） + 評価（success_rate） + 非flaky テスト
- すべての PR は「A_j（影響 obligation）」を明記してレビュー可能にする。

## 作業規約
- **最小差分**: 既存設計・命名・フォルダ構成に合わせる。不要なリファクタ禁止。
- **非flaky**: テストは確率に依存しない/依存を最小化する（期待値・固定 seed・決定論環境）。
- **seed 固定**:
  - 乱数はグローバル状態に依存しない（`random` のグローバル、`np.random` のグローバルは避ける）。
  - 必要なら `numpy.random.Generator` を内部に保持し、`seed` から生成する。
  - tie-break（同値 max の選択）は rng で行い、seed で再現できるようにする。
- **CI を軽く**: episode/horizon/seeds を必要最小に。重い可視化は CI 外（scripts 等）へ。
- **ログ禁止**: print / debug ログを追加しない（失敗時はテスト assert メッセージで分かるようにする）。
- **型と docstring**: public 関数/クラスには type hints と短い docstring を付ける。

## 評価の原則（重要）
- Bandit の regret は CI 安定のため **期待 regret**（`max_p - probs[action_t]` の和）を推奨。
- Q-learning の合否は deterministic GridWorld 上で success_rate を見る（確率環境にしない）。

## 変更後の基本チェック
- 可能なら `pytest -q`（または最小の関連テスト）を実行し、失敗しないことを確認する。
- PR には以下を必ず記載する:
  - Seed / Algorithm / Steps
  - Time Spent(min) / Trials / Outcome(Pass/Fail) / Notes
  - A_j（影響 obligation）: 1 行 1 ID で列挙
