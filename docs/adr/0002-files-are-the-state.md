# ADR-0002: Files are the state, tool returns are not

Hana 平台将插件工具返回值渲染为视觉卡片，Agent 无法直接读取工具返回的结构化数据。因此流程状态不能依赖工具返回值传递。我们决定：一切状态落盘到 `.matt-flow/`（`state.json`、`gates/`、`reviews/`、`confirmations.json`），插件工具只做「校验 + 落盘」，Agent 通过 read 文件感知状态、通过调用工具推进状态。工具拒绝推进时写入 `.matt-flow/denied.md` 说明原因，Agent 读得到，就无法装作推进成功。

**Consequences**: 状态对 Agent 完全可见、可审计；工具逻辑保持极薄（无状态，只校验和写文件）。
