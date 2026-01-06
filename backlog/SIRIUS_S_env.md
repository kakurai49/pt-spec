# SIRIUS Issue Pack (S=ENV)

S列: env（環境・世界・仕様）。タイトルと本文をそのままIssueに貼れる形式。

---

```text
Title: [S-ENV][M2] GridWorld環境を実装する（決定論・壁はその場・env.model()提供）
Labels: S-ENV, M2-MDP, type:feature
S: env
Mission: m2

Body:
## 目的
MDPの状態・行動・遷移・報酬を明示できる最小GridWorldを実装し、DP/Q-learningの共通土台にする。

## 成果物
- `sirius_rl/env/gridworld.py`
  - reset/step
  - 状態の離散化（int）
  - 上下左右4行動
  - 壁はその場
  - `model()` で遷移表を返す

## 受入条件（DoD）
- [ ] 決定論的（同じseed/初期状態で同じ遷移）
- [ ] terminal/goalの定義あり
- [ ] `env.model()` が dp.py から使える形式で遷移表を返す
- [ ] 外部依存なし、CI短時間

## A_j（影響obligation）
- env.m2.gridworld.transition.deterministic
- env.m2.gridworld.action.up_down_left_right
- env.m2.gridworld.wall_stay
- env.m2.gridworld.model.transition_table

## Codex prompt
あなたは環境実装者です。`sirius_rl/env/gridworld.py` を実装してください。

手順:
1) 既存のEnv基底/インターフェース（reset/step/seedの扱い）を確認し、それに合わせる。
2) グリッド定義:
   - 幅/高さ、壁セル、開始セル、ゴールセルを引数で受け取れるようにする（既定値あり）。
3) 状態表現:
   - (x,y) を state_id(int) に変換（例: y*width + x）
4) 行動:
   - 0:up, 1:right, 2:down, 3:left（または既存規約）
   - 壁/境界なら位置は変わらず、rewardは設計に従う
5) 報酬設計:
   - 仕様が無ければ「goal到達で+1、通常0、step上限あり」など最小で良い
   - ただし dp/test が書きやすいように、rewardはコンストラクタで設定可能にする
6) `model()`:
   - 全state×action について遷移先と報酬、done を列挙し、dp.py で使える形式で返す

制約:
- CI非flakyのため、乱数に依存しない（決定論）。
- ログ/print禁止。
```
