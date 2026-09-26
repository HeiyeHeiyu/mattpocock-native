# mattpocock-native 执行纪律

本插件的使命：让 Matt Pocock 的工程流程成为你的本能。以下规则全部是 **MANDATORY**，没有例外。

## 主航道（进入后必须按序走完，不能跳过任何阶段）

```
grill-with-docs → to-spec → to-tickets → implement → code-review → done
```

- 阶段推进**只能**通过 `matt-flow` 工具完成，且必须满足当前阶段的验收闸。
- 任何阶段未过闸就进入下一阶段的工作，视为流程违规，必须回退。
- setup 是前置提醒（空目录/新仓库时问用户是否铺地基），不在主航道，不受闸门约束。
- 分支（prototype / handoff / diagnosing-bugs / triage / wayfinder）挂在主航道对应位置，进入主航道前提醒用户是否分支，不是绕开闸门的借口。

## 入口：海龟汤引导

- 用户意图不明时，用 ask-matt 的海龟汤六问逐步缩小（一次一问，命中即收敛），确认后推荐技能并说明理由，**等用户点头才启动**。
- 严禁凭一句话猜技能，严禁自动匹配、权重排序、关键词表。

## 三道闸门

### 1. 验收闸

每个阶段完成时：
1. 调用 `matt-flow({ action: "gate" })` 把当前阶段验收清单写入 `.matt-flow/gates/<stage>.md`。
2. 用 read 读清单，逐项自证，全部通过才把对应项从 `[ ]` 改为 `[x]`。
3. 调用 `matt-flow({ action: "advance" })`。校验失败会写入 `.matt-flow/denied.md`，此时**不许**继续下一阶段的工作。

### 2. 独立审查闸

code-review 阶段：
1. 调用 `matt-review({ action: "dispatch", target: "<审查对象>" })` 生成两张独立任务卡。
2. **必须派两个独立 subagent** 各自执行一张卡，各自写报告到 `.matt-flow/reviews/`。
3. 主 agent 严禁自己审查自己的工作，严禁替 subagent 写报告，严禁两轴共用同一个 subagent。

### 3. 确认闸（并入 code-review 大闸门）

code-review 阶段同时校验两道条件，缺一不放行到 done：
1. 双轴报告存在且执行者不同（独立审查闸）。
2. findings 全部获得用户确认或豁免，记录在 `.matt-flow/confirmations.json`（确认闸）。

**确认之前，一行修复代码都不许写。** 没有独立 fix-confirm 阶段，确认是 code-review 的一部分。

## 七个自检点（观察到信号时主动提醒，不擅自执行）

1. 完工没走审查 → 主动问要不要双轴 review
2. 上下文近 ~150k → 主动提 handoff
3. 术语混乱 → 主动理清（domain-modeling）
4. 危险 git 操作 → 亮护栏（git-guardrails）
5. 困惑信号 → 主动 wait-what
6. 模糊大想法 → 亮 wayfinder
7. 涉及他人 → 亮 to-questionnaire / triage

## 状态与工具

- 一切状态在 `.matt-flow/` 文件里，不在工具返回值里。永远以文件为准。
- `matt-flow`：status / gate / advance / reset（reset 用于新项目，重置到 grill-with-docs）。
- `matt-review`：dispatch / confirm。
- 技能知识直接 read `skills/<bucket>/<skill>/SKILL.md`。

## 文档分工

- ask-matt SKILL.md：完整权威版（六问 + 触发场景 + 提醒框架全文）。
- _trigger SKILL.md：会话开始注入的浓缩便签（框架摘要 + 自检点）。
- 本文件：纪律条文。三处不互相抄。
