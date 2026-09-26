# mattpocock-native 0.2.0 重构规格（SPEC）

在 0.1.0（三闸门机制）基础上重新设计入口与流程编排。用户深度使用后拍板：智能路由弃用，ask-matt 改为海龟汤式对话引导，主航道重排。

## 背景

0.1.0 交付后用户深度使用技能包，结论：智能路由（关键词正则匹配 → 自动开跑技能）是过期产品。机器猜不如人引导。本次重构把「入口」从被动匹配改为主动对话，主航道硬约束保留并强化。

## 需求（全部经 grill-with-docs 逐项拍板）

| 编号 | 需求 | 拍板要点 |
|------|------|---------|
| R1 | ask-matt 海龟汤入口 | 纯对话引导，不做工具；像海龟汤一样逐步提问缩小意图，一次一问，确认后推荐技能并说明理由，等用户点头才启动 |
| R2 | 海龟汤 6 问 | 性质/规模/留痕/交付物/对象/代码库状态，命中即收敛，不穷举 |
| R3 | 主航道硬约束 | grill-with-docs → to-spec → to-tickets → implement → code-review → done，进入后强制走完不可飘移 |
| R4 | setup 移出主航道 | 不再是状态机阶段，改为前置提醒（检测空目录/新仓库时主动问是否铺地基） |
| R5 | fix-confirm 并入 code-review | 确认闸前移到 code-review 推进校验：双报告独立 + findings 全确认，双条件满足才放行到 done |
| R6 | 智能路由全部移除 | ROUTES 正则表、auto/route/list 步骤、旧触发路由全部删除，不留兼容层 |
| R7 | 提醒框架 | S1 常驻（ask-matt）/ S2 主航道硬约束 / S3 主动提醒 16 项 / S4 内部联动 / S5 静默；加 7 个自动自检点 |
| R8 | _trigger 保留重写 | 内容改为海龟汤引导 + 提醒框架摘要 + 7 自检点，会话开始注入 |
| R9 | 文档分工 | ask-matt = 完整权威版；_trigger = 浓缩便签；AGENTS.md = 纪律条文，三处不互相抄 |
| R10 | 版本与命名 | 0.2.0，名称 mattpocock-native 不变 |
| R11 | 测试边界 | 状态机逻辑测试 + 静态文档检查（防漂移）+ 人工演练验收（海龟汤手感，不可自动化） |

## 范围

- in-scope：ask-matt SKILL.md 海龟汤重写、状态机改序、确认闸前移、_trigger 重写、AGENTS.md/manifest/README/CONTEXT/CHANGELOG 更新、ADR-0004/0005、测试适配（test-gates.js 新序 + code-review 双条件 + 静态文档检查）
- out-of-scope：wizard/teach/research 等技能内容本身（官方 1.2.3 内嵌不动）、in-progress 技能、真实 issue tracker 集成

## 约束

- 技能内容仍以官方 1.2.3 为准，只重写 ask-matt 与 _trigger 两个文件（面向 Hana 助手身份的引导层）
- 状态以文件为准（ADR-0002 不变）
- 工具极简不变：matt-flow + matt-review 两个
- ES5 风格不变

## 可验收性

- 状态机测试覆盖新阶段序、code-review 双条件、setup 不在主航道
- 静态文档检查：ask-matt 含 6 问、_trigger 含 7 自检点、AGENTS.md 无弃用路由词
- 人工演练：海龟汤引导手感由用户验收
