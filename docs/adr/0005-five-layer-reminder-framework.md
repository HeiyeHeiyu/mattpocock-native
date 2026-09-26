# ADR-0005: Five-layer reminder framework with three-way doc split

插件的角色定位是助手：主动推荐自己的能力、引导用户愉快到达目标。我们决定把所有技能统一进五层提醒框架：S1 常驻（ask-matt 永远在线）、S2 主航道硬约束（进入后流程接管，不需要提醒）、S3 主动提醒（15 项，命中时机就主动推并等确认）、S4 内部联动（prototype/tdd/domain-modeling/codebase-design/grilling 由其他技能带出，不单独提醒）、S5 静默（migrate-to-shoehorn/scaffold-exercises/in-progress 不推）。另加 7 个自动自检点（完工无 review、上下文近 150k、术语混乱、危险 git 操作、困惑信号、模糊大想法、涉及他人），让助手「活着」。

文档分工三处不互相抄：ask-matt SKILL.md 是完整权威版（6 问 + 触发场景 + 提醒框架全文），_trigger 是会话开始的浓缩便签（框架摘要 + 7 自检点），AGENTS.md 只讲纪律条文（三闸门、主航道、状态机）。

**Consequences**: 新增文档为 ask-matt 与 _trigger 两份（重写），AGENTS.md 保持纪律专注；提醒框架变更只改 ask-matt 一处，_trigger 同步摘要。
