# mattpocock-native

Glossary of domain terms for this project.

## Language

**mattpocock-native**:
A Hana plugin that makes Matt Pocock's engineering discipline an instinct of the agent: a turtle-soup entry (ask-matt) that guides intent through questions, and a main flow enforced by three gates instead of soft suggestions.
_Avoid_: Skill loader, bridge, adapter, smart router

**Turtle soup entry（海龟汤入口）**:
ask-matt 的引导方式：像海龟汤一样一次一问，六问（性质/规模/留痕/交付物/对象/代码库状态）逐步缩小意图，命中即收敛，确认后推荐技能并说明理由，等用户点头才启动。纯对话引导，不做工具。
_Avoid_: Keyword matching, auto-routing, weighted ranking

**Main flow（主航道）**:
grill-with-docs → to-spec → to-tickets → implement → code-review → done。进入后硬约束走完，无法飘移。setup 是前置提醒（空目录/新仓库），不在主航道。
_Avoid_: Free-form phases, setup as a stage

**Three gates（三闸门）**:
验收闸（阶段推进必须清单全 [x]）、独立审查闸（双轴报告必须两个不同 subagent）、确认闸（findings 必须全部确认/豁免）。确认闸并入 code-review 大闸门：code-review 双条件（报告独立 + findings 全确认）满足才放行 done。
_Avoid_: Soft reminders, self-review, fix-before-confirm

**Reminder framework（提醒框架）**:
五层策略：S1 常驻（ask-matt）、S2 主航道硬约束、S3 主动提醒（16 项，命中就推）、S4 内部联动（prototype/tdd/domain-modeling/codebase-design/grilling 由其他技能带出）、S5 静默（migrate-to-shoehorn/scaffold-exercises/in-progress 不推）。另有七个自动自检点。
_Avoid_: Passive waiting, silent skills

**Self-checks（自检点）**:
七个观察到信号时主动提醒的检查：完工无 review、上下文近 150k、术语混乱、危险 git 操作、困惑信号、模糊大想法、涉及他人。提醒不执行，决定权在用户。
_Avoid_: Waiting for the user to ask

**Doc split（文档分工）**:
ask-matt SKILL.md = 完整权威版；_trigger SKILL.md = 会话开始注入的浓缩便签；AGENTS.md = 纪律条文。三处不互相抄。
_Avoid_: Duplicated content, three sources of truth

**Flow state machine（流程状态机）**:
Persistent stage state in `.matt-flow/state.json`. Advancing requires passing the current stage's gate; state lives in files, not tool returns.
_Avoid_: In-memory state, tool-return-driven flow

## Rules

- 三道闸门任何一道被绕过，就是本插件失败的标志，等同 bug。
- 智能路由已弃用（ADR-0004）：一切关键词匹配、自动路由、权重排序作废。
- 技能内容以官方 skills 1.2.3 为准，只重写 ask-matt 与 _trigger 两个引导文件。
- 插件不提供「建议」，只提供「状态」与「闸门」；入口提供「引导」。
