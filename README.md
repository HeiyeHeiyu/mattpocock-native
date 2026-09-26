# Matt Pocock Native

让 Matt Pocock 的工程流程成为 Hana 的本能，而不是需要提醒的习惯。

版本：`0.2.0`（0.1.0 三闸门机制 + 0.2.0 海龟汤入口与提醒框架）

## 它是什么

- **入口（0.2.0 新增）**：ask-matt 海龟汤引导。像海龟汤一样一次一问，六问逐步缩小意图，命中即收敛，确认后推荐技能并说明理由，等用户点头才启动。纯对话引导。
- **主航道（硬约束）**：grill-with-docs → to-spec → to-tickets → implement → code-review → done。进入后流程接管，无法飘移。setup 是前置提醒，不在主航道。
- **三道闸门（结构强制）**：验收闸（清单全 [x] 才推进）、独立审查闸（双轴必须两个不同 subagent）、确认闸（findings 全确认才收尾，并入 code-review 大闸门）。
- **提醒框架（0.2.0 新增）**：五层策略（常驻/硬约束/主动提醒 16 项/内部联动/静默）+ 七个自动自检点，助手不等用户开口主动引导。

## 三道闸门

| 闸门 | 解决的问题 | 机制 |
|------|-----------|------|
| 验收闸 | 跳过验收阶段 | 阶段推进必须经 `matt-flow`，清单全 `[x]` 才放行；未生成或未全过，`advance` 必被拒并写 `.matt-flow/denied.md` |
| 独立审查闸 | 双轴变自做自查 | code-review 强制双轴，两个独立 subagent 各写报告，头部声明 `Executed by`；同执行者一律拒绝 |
| 确认闸 | 问题不等确认就修 | findings 逐条呈报用户，`matt-review` 记录确认/豁免；未确认的 findings 拦住 code-review 放行，**确认前一行修复都不许写** |

## 主航道

```
grill-with-docs → to-spec → to-tickets → implement → code-review → done
```

分支（prototype / handoff / diagnosing-bugs / triage / wayfinder）挂在对应位置，进入主航道前提醒用户是否分支。

## 安装

```
plugin.dev.install({ sourcePath: "path/to/mattpocock-native" })
```

启用插件，同时安装触发技能（会话开始注入便签，纪律不依赖提醒）：

```
install_skill({ local_path: "path/to/mattpocock-native/skills/_trigger", reason: "..." })
```

## 使用

两个工具，极简：

```
matt-flow({ action: "status" })                 // 读当前阶段
matt-flow({ action: "gate" })                   // 生成当前阶段验收清单
matt-flow({ action: "advance" })                // 校验清单并推进（闸门在此拦截）
matt-flow({ action: "reset" })                  // 新项目重置状态机到 grill-with-docs

matt-review({ action: "dispatch", target })     // 生成双轴独立审查任务卡
matt-review({ action: "confirm", findingIds, rejectedIds })  // 记录用户确认/豁免
```

入口不需要工具：ask-matt 是对话引导，意图不明时直接开问。

## 架构

```
mattpocock-native/
├── manifest.json          ← 注册 matt-flow / matt-review，版本 0.2.0
├── AGENTS.md              ← 纪律核心（MANDATORY）
├── CONTEXT.md             ← 领域术语（海龟汤/提醒框架/文档分工）
├── SPEC.md                ← 0.2.0 重构规格
├── docs/adr/              ← 0001-0005（三闸门/文件即状态/官方技能/海龟汤/提醒框架）
├── lib/
│   ├── flow.js            ← 状态机 + 三闸门校验（code-review 合并大闸门）
│   ├── gate-templates.js  ← 各阶段验收清单（5 阶段 + done）
│   ├── reviews.js         ← 双轴任务卡 + 确认记录
│   └── shared.js          ← 共享 helper
├── tools/
│   ├── matt-flow.js
│   └── matt-review.js
└── skills/
    ├── _trigger/          ← 浓缩便签（会话开始生效）
    ├── engineering/       ← ask-matt 海龟汤重写 + 官方 1.2.3 其余技能
    ├── productivity/
    └── misc/
```

## 状态文件（.matt-flow/）

一切状态以文件为准（ADR-0002）。工具返回值渲染成卡片，Agent 读不到，永远以文件为准：

- `state.json` — 当前阶段与历史
- `gates/<stage>.md` — 各阶段验收清单
- `reviews/` — 双轴任务卡与报告
- `findings.md` — findings 汇总
- `confirmations.json` — 用户确认/豁免记录
- `denied.md` — 闸门拒绝原因

## 更新技能内容

技能知识内嵌官方 skills 1.2.3（ADR-0003），ask-matt 与 _trigger 是本插件的引导层（已重写）。skills/ 内容来自 [Matt Pocock skills](https://github.com/mattpocock/skills) 包 1.2.3，MIT License；本插件的 ask-matt 与 _trigger 为面向 Hana 的重写版。更新 = 替换 `skills/` 目录，重新安装。

## 开发

- 海龟汤六问 / 提醒框架：改 `skills/engineering/ask-matt/SKILL.md`（唯一真相），同步 `skills/_trigger/SKILL.md` 摘要
- 阶段验收项：改 `lib/gate-templates.js`
- 闸门校验：改 `lib/flow.js`
- 测试：`node tests/test-gates.js`（状态机）、`node tests/test-docs.js`（静态文档防漂移）
