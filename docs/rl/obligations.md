# obligations (A_j) 一覧

このリポジトリでは、Issue/PRごとに **A_j（影響obligation）** を列挙して「変更が何に効くか」を追跡します。

## ID体系
- 形式: `S.mission.domain...`（ドット区切り）
- `S` は次のいずれか: `biz` / `gp` / `env` / `cur` / `eval` / `obs`
- `mission` は次のいずれか: `common` / `m1` / `m2` / `m3`
- 末尾は metric / gate / schema など、影響対象を表す（命名は固定し、後方互換を優先）

## 一覧
### COMMON（運用）
#### biz
- `biz.common.pass_criteria.definition`

#### gp
- `gp.common.issue_form.fields`
- `gp.common.labels.s_field_sync`
- `gp.common.pr_template.aj_required`
- `gp.common.pr_template.reproducibility`
- `gp.common.projects.status_workflow`
- `gp.common.repro.seed_fixed`

### M1（Bandit）
#### biz
- `biz.m1.bandit.pass_criteria.regret_ratio`

#### gp
- `gp.m1.bandit.learning_feedback`

#### cur
- `cur.m1.bandit.agent.eps_greedy`
- `cur.m1.bandit.agent.thompson_bernoulli`
- `cur.m1.bandit.agent.ucb1`

#### eval
- `eval.m1.bandit.bench.regret_mean`
- `eval.m1.bandit.bench.reward_mean`
- `eval.m1.bandit.bench.seed_aggregation`
- `eval.m1.bandit.pass_thresholds`
- `eval.m1.bandit.test.baseline_compare`
- `eval.m1.bandit.test.non_flaky_gate`

#### obs
- `obs.m1.bandit.regret_curve`

### M2（MDP/GridWorld + DP）
#### gp
- `gp.m2.docs.mdp_table`
- `gp.m2.docs.repro_steps`

#### env
- `env.m2.gridworld.action.up_down_left_right`
- `env.m2.gridworld.model.transition_table`
- `env.m2.gridworld.transition.deterministic`
- `env.m2.gridworld.wall_stay`

#### cur
- `cur.m2.dp.policy_iteration`
- `cur.m2.dp.value_iteration`

#### eval
- `eval.m2.dp.policy_expected`
- `eval.m2.dp.test.expected_policy`

### M3（TD/Q-learning）
#### biz
- `biz.m3.qlearn.pass_criteria.success_rate`

#### cur
- `cur.m3.td.greedy_policy`
- `cur.m3.td.q_learning`

#### eval
- `eval.m3.td.eval_runner`
- `eval.m3.td.pass_thresholds`
- `eval.m3.td.success_rate`
- `eval.m3.td.success_rate.ge_0_8`
- `eval.m3.td.test.non_flaky_gate`

#### obs
- `obs.m3.td.learning_curve`
- `obs.m3.td.metrics_schema_fixed`
- `obs.m3.td.reproducible_plot`
