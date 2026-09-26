# Changelog

All notable changes to mattpocock-native.

## [0.2.0] — 2026-09-26

### 入口重设计：海龟汤引导取代智能路由

用户深度使用技能包后拍板：智能路由（关键词匹配 → 自动开跑技能）是过期产品。ask-matt 从「查表路由器」重写为「海龟汤式对话引导」。

- **新增：海龟汤六问入口**（ADR-0004）— ask-matt 重写为完整权威版：性质/规模/留痕/交付物/对象/代码库状态六问，一次一问、命中即收敛、推荐带理由、等用户点头才启动。纯对话引导，不做工具。
- **移除：智能路由** — 一切关键词匹配、自动路由、权重排序作废，不留兼容层。
- **变更：主航道重排** — 8 段改为 5 段 + done：grill-with-docs → to-spec → to-tickets → implement → code-review → done。
- **变更：setup 移出主航道** — 改为前置提醒（空目录/新仓库时主动问是否铺地基），不再是状态机阶段。
- **变更：fix-confirm 并入 code-review** — 确认闸与独立审查闸合并为 code-review 大闸门，双条件（报告独立 + findings 全确认）满足才放行 done。
- **新增：提醒框架五层**（ADR-0005）— S1 常驻 / S2 硬约束 / S3 主动提醒 16 项 / S4 内部联动 / S5 静默。
- **新增：七个自动自检点** — 完工无 review、上下文近 150k、术语混乱、危险 git、困惑信号、模糊大想法、涉及他人。
- **变更：_trigger 重写** — 从路由触发改为浓缩便签（框架摘要 + 自检点），会话开始注入。
- **新增：测试** — test-gates.js 适配新阶段序（17 例），新增 test-docs.js 静态文档防漂移（31 项断言）。
- **新增：ADR-0004/0005**、SPEC.md 0.2.0 重写、CONTEXT/README/AGENTS 同步更新。

### 0.2.0 双轴独立审查修复（2026-09-26 同日）

由两个独立 subagent（ming=standards 轴 / butter=spec 轴）审查后修复 4 项 findings（用户确认后执行）：

- **F-301** (major)：清除 lib/flow.js 三处 fix-confirm 旧阶段残留（注释与错误消息），表述对齐 code-review 合并大闸门
- **F-302** (minor)：提醒框架计数统一为 16 项（含 grill-with-docs 首选入口），全库 6 处文档同步
- **F-303** (minor)：删除 tools 两文件冗余 require('path')
- **F-401** (minor)：engineering README 的 ask-matt 描述改为海龟汤入口，清除 router 残留

## [0.1.0] — 2026-09-26

### 重构起点（自 mattpocock-bridge 0.6.0 彻底重构）

需求已完全改变，名称与版本全部重起。旧插件是「技能适配层」，把流程做成软建议（nextSteps），实际使用中 Agent 自由发挥：跳过验收、自做自查、不确认就修。新插件是「流程本能层」，用结构替代提醒。

- **新增：三闸门机制（ADR-0001）**
  - 验收闸：阶段推进必须经 matt-flow 工具，清单全 `[x]` 才放行，否则拒绝并写 `.matt-flow/denied.md`
  - 独立审查闸：code-review 强制双轴（Standards + Spec），双报告执行者必须不同，自做自查被拒绝
  - 确认闸：findings 全部确认/豁免才收尾，确认前不许修复
- **新增：文件即状态（ADR-0002）** — 一切状态落盘 `.matt-flow/`，工具只校验+写文件
- **变更：技能内容换为官方 skills 1.2.3（ADR-0003）** — 弃用 execute.js 自造工作流，技能知识直接内嵌官方 SKILL.md
- **变更：工具极简** — 从 matt-exec/matt-load 两个路由器改为 matt-flow/matt-review 两个闸门工具
- **新增：测试** — tests/test-gates.js，覆盖三闸门的违规拒绝与合规放行
- **新增：触发技能** — skills/_trigger/SKILL.md，纪律在会话一开始生效

### 0.1.0 双轴独立审查修复（2026-09-26 同日）

由两个独立 subagent（ming=standards 轴 / butter=spec 轴）审查后修复 7 项 findings：

- **F-101** (major)：manifest 补 cwd 参数声明，与工具 schema 契约对齐
- **F-102/F-201** (minor)：修正 stage 参数描述（advance 不接受 stage）
- **F-103** (minor)：status 改为只读，首次调用才初始化 state.json
- **F-104** (minor)：提取 lib/shared.js，消除 extractIds/路径函数双份定义
- **F-202** (minor)：双轴报告按 latest.json dispatchId 精确配对，杜绝旧报告冒充当前轮次
- **F-203** (minor)：验收闸强校验清单条目必须 `[x]` 且数量与模板一致，`[X]`/`[-]`/删行均拒绝（新增 2 个测试用例）
