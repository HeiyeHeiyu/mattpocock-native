# ADR-0003: Ship official 1.2.3 skill content, drop self-built workflows

旧插件为每个技能写了 execute.js 自造工作流。官方 skills 包已演进到 1.2.3（Claude Code 插件形态，纯 SKILL.md + agents 配置，无 execute.js）。自造工作流偏离官方、维护成本高、且没有带来纪律收益（纪律由三闸门提供，不由 execute.js 提供）。我们决定：技能知识直接内嵌官方 1.2.3 内容，不再维护 execute.js；纪律由 ADR-0001 的三闸门独立提供。Agent 用 read 直接读技能 SKILL.md，不再经 execute 模式。

**Consequences**: 技能内容与官方保持同步，更新技能 = 替换 skills/ 目录；插件体积缩小，移除了 factory/dispatch/registry 等适配层代码。
