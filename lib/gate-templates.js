// gate-templates.js — 各阶段验收清单模板（写入工作区 .matt-flow/gates/）
// ES5: var, function, 无 const/let/箭头函数/模板字符串

var FLOW_ORDER = [
  'grill-with-docs',
  'to-spec',
  'to-tickets',
  'implement',
  'code-review',
  'done'
];

var GATE_TEMPLATES = {
  'grill-with-docs': [
    '[ ] 需求经过 interview（海龟汤 6 问或 grilling rounds，关键问题问完）',
    '[ ] 关键决策已记录到 docs/adr/',
    '[ ] 本次需求的目标与边界写入 CONTEXT.md 或项目文档'
  ],
  'to-spec': [
    '[ ] SPEC.md 存在（或项目约定的规格文档）',
    '[ ] 每个需求项都有可验收标准（可测试，不模糊）',
    '[ ] 范围明确：in-scope 与 out-of-scope 已列出'
  ],
  'to-tickets': [
    '[ ] tickets 已拆分（.scratch/<feature>/issues/ 或真实 tracker）',
    '[ ] 每个 ticket 声明了 blocking edges',
    '[ ] 已按 blockers-first 排序，可逐个实施'
  ],
  'implement': [
    '[ ] TDD 红绿循环完成（每个切片先见红再见绿）',
    '[ ] 代码已落盘，无未完成文件',
    '[ ] 本地测试全部通过'
  ],
  'code-review': [
    '[ ] standards 轴报告存在（.matt-flow/reviews/ 下 *-standards.md）',
    '[ ] spec 轴报告存在（.matt-flow/reviews/ 下 *-spec.md）',
    '[ ] 双轴执行者不同（报告头部 Executed by 不同）',
    '[ ] findings 已汇总到 .matt-flow/findings.md',
    '[ ] 所有 findings 已获得用户确认或豁免（.matt-flow/confirmations.json）'
  ],
  'done': []
};

module.exports = {
  FLOW_ORDER: FLOW_ORDER,
  GATE_TEMPLATES: GATE_TEMPLATES
};
