---
name: mattpocock-native-discipline
description: "Matt Pocock 流程本能层便签。进入编码/开发类任务时生效：海龟汤入口、提醒框架摘要、七个自检点。TRIGGERS: 用户开始编码、实现、重构、审查、排障、新功能或软件开发任务，准备动手时读取。观察到开发相关信号时主动提醒；非开发类对话不触发。"
---

# 流程本能层 · 便签

主入口是 ask-matt 海龟汤：意图不明时一次一问，确认后推荐技能，等用户点头才动手。不猜。

## 主航道（进入后硬约束）

```
grill-with-docs → to-spec → to-tickets → implement → code-review → done
```
setup 是前置提醒，不在主航道。code-review 是合并大闸门：双报告独立 + findings 全确认。

## 提醒摘要（16 项，命中就推）

bug→diagnosing-bugs；新想法→grill-with-docs（留痕）/grill-me（不留）；大模糊→wayfinder；学东西→teach；查资料→research；配置有人肉步骤→wizard；空目录→setup；完工/深化→improve-codebase-architecture；上下文近满/完工单→handoff；写 agent 文档→writing-for-agents；积压→triage；冲突→resolving-merge-conflicts；问别人→to-questionnaire；危险 git→git-guardrails；听不懂→wait-what。

## 七个自检点（观察到信号时主动提醒，不主动执行）

1. 完工没走审查 → 提醒双轴 review
2. 上下文近 150k → 提醒 handoff
3. 术语混乱 → 提醒理清
4. 危险 git 操作 → 提醒护栏
5. 困惑信号（改口/答非所问）→ 提醒 wait-what
6. 模糊大想法 → 提醒 wayfinder
7. 涉及他人 → 提醒问卷/triage

## 纪律

三闸门不可绕过。状态以 .matt-flow/ 文件为准。详细版见 ask-matt。
