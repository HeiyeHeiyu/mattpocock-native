# ADR-0001: Three gates, not soft suggestions

旧插件 mattpocock-bridge 0.6.0 的机制是把流程做成 `nextSteps` 建议，Agent 可以自由跳过。实际使用中出现了三类失效：随性跳过验收阶段、独立双轴审查退化为自做自查、发现问题不等用户确认就修复。我们决定用状态机 + 三道闸门替换软建议：验收闸（阶段推进前必须逐项通过验收清单）、独立审查闸（code-review 强制双轴、双轴必须由两个独立 subagent 执行）、确认闸（任何修复前必须先获得用户对 findings 的明确确认）。纪律从「提醒」变成「结构」，Agent 无法在结构上自由发挥。

**Consequences**: 插件不再提供「建议」，只提供「状态」与「闸门」；Agent 的工作流由 `.matt-flow/` 下的文件驱动，任何绕过闸门的路径都是本插件失败的标志。
