# ADR-0004: Ask-matt becomes a turtle-soup dialogue, smart routing is dead

0.1.0 起技能内容来自官方包（无 execute.js），但 ask-matt 的定位仍是「路由器」。用户深度使用后判定：关键词正则匹配 → 自动路由到技能（旧插件 0.6.0 的 ROUTES 表）是过期产品，机器猜不如人引导。我们决定：ask-matt 重写为海龟汤式对话引导（一次一问，6 问命中即收敛，确认后推荐技能并等用户点头），彻底移除智能路由的一切痕迹。它是纯对话行为，不做成工具，靠描述常驻 + 主动引导，不依赖调用才想起来。

**Consequences**: ask-matt 从「查表路由器」变成「对话式引导者」，不可自动化测试，手感由用户演练验收；一切自动路由关键词、权重、auto/route/list 步骤作废。
