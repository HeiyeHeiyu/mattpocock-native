// flow.js — 流程状态机与验收闸（看门狗核心）
// ES5: var, function, 无 const/let/箭头函数/模板字符串
// 原则（ADR-0002）：一切状态以文件为准，返回值仅供展示。

var fs = require('fs');
var path = require('path');
var templates = require('./gate-templates.js');
var shared = require('./shared.js');

var FLOW_ORDER = templates.FLOW_ORDER;

// ── 路径工具（本模块私有路径；共享路径见 shared.js）──────────────────

function flowDir(workDir) {
  return shared.flowDir(workDir);
}

function statePath(workDir) {
  return path.join(flowDir(workDir), 'state.json');
}

function gatePath(workDir, stage) {
  return path.join(flowDir(workDir), 'gates', stage + '.md');
}

function deniedPath(workDir) {
  return path.join(flowDir(workDir), 'denied.md');
}

function findingsPath(workDir) {
  return shared.findingsPath(workDir);
}

function confirmationsPath(workDir) {
  return shared.confirmationsPath(workDir);
}

function reviewsDir(workDir) {
  return shared.reviewsDir(workDir);
}

// ── 状态读写 ────────────────────────────────────────────────────────────

function readState(workDir) {
  var p = statePath(workDir);
  if (fs.existsSync(p)) {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch (e) {
      // 损坏则重置
    }
  }
  return { currentStage: 'grill-with-docs', startedAt: new Date().toISOString(), history: [] };
}

function writeState(workDir, state) {
  var dir = flowDir(workDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(statePath(workDir), JSON.stringify(state, null, 2), 'utf-8');
}

function writeDenied(workDir, reason) {
  var p = deniedPath(workDir);
  var dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  var body = '## 闸门拒绝（advance denied）\n\n时间：' + new Date().toISOString() + '\n\n' + reason + '\n';
  fs.writeFileSync(p, body, 'utf-8');
}

function ensureFlowDir(workDir) {
  var dir = flowDir(workDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ── 验收闸校验（强语义：清单条目必须 [x] 全过，数量必须与模板一致）──

function gatePassed(workDir, stage) {
  var p = gatePath(workDir, stage);
  if (!fs.existsSync(p)) {
    return { ok: false, reasons: ['验收清单不存在：' + p + '。先运行 matt-flow({ action: "gate" }) 生成清单。'] };
  }
  var lines = fs.readFileSync(p, 'utf-8').split(/\r?\n/);
  var expected = templates.GATE_TEMPLATES[stage];
  var expectedCount = (expected || []).length;
  var itemLines = [];
  for (var i = 0; i < lines.length; i++) {
    if (/^\s*\[(.)\]/.test(lines[i])) itemLines.push(lines[i]);
  }
  var failed = [];
  if (itemLines.length !== expectedCount) {
    failed.push('清单条目数量异常：期望 ' + expectedCount + ' 条，实际 ' + itemLines.length + ' 条。不允许删行或加行。');
  }
  for (var j = 0; j < itemLines.length; j++) {
    if (!/^\s*\[x\]/.test(itemLines[j])) {
      failed.push('未通过（不是 [x]）：' + itemLines[j].trim());
    }
  }
  if (failed.length > 0) {
    return { ok: false, reasons: failed };
  }
  return { ok: true, reasons: [] };
}

// ── 独立审查闸校验（code-review 大闸门前置）──────────────────

function reviewIndependencePassed(workDir) {
  var dir = reviewsDir(workDir);
  if (!fs.existsSync(dir)) {
    return { ok: false, reasons: ['没有审查报告目录 .matt-flow/reviews/。先运行 matt-review({ action: "dispatch" }) 并派独立 subagent 完成双轴审查。'] };
  }

  // 优先按 latest.json 的 dispatchId 精确配对当前轮次报告（对应 F-202）
  var latestPath = path.join(dir, 'latest.json');
  var standardsFile = null;
  var specFile = null;
  if (fs.existsSync(latestPath)) {
    try {
      var latest = JSON.parse(fs.readFileSync(latestPath, 'utf-8'));
      standardsFile = latest.standardsReport || null;
      specFile = latest.specReport || null;
    } catch (e) { /* 回退到后缀扫描 */ }
  }

  if (!standardsFile || !specFile) {
    var files = fs.readdirSync(dir).filter(function (f) {
      return /-standards\.md$/.test(f) || /-spec\.md$/.test(f);
    });
    var standards = files.filter(function (f) { return /-standards\.md$/.test(f); });
    var spec = files.filter(function (f) { return /-spec\.md$/.test(f); });
    standardsFile = standards.length > 0 ? standards[0] : null;
    specFile = spec.length > 0 ? spec[0] : null;
  }

  if (!standardsFile || !specFile) {
    return { ok: false, reasons: ['双轴报告不全。需要一份 *-standards.md 和一份 *-spec.md（与 latest.json dispatchId 配对），各自来自独立 subagent。'] };
  }

  var sPath = path.join(dir, standardsFile);
  var pPath = path.join(dir, specFile);
  if (!fs.existsSync(sPath) || !fs.existsSync(pPath)) {
    return { ok: false, reasons: ['当前轮次报告缺失：' + standardsFile + ' / ' + specFile + '。请按任务卡写入。'] };
  }

  var sAuthor = authorOf(sPath);
  var pAuthor = authorOf(pPath);
  if (!sAuthor || !pAuthor) {
    return { ok: false, reasons: ['审查报告缺少执行者声明（头部 Executed by）。这是防自做自查的关键字段。'] };
  }
  if (sAuthor === pAuthor) {
    return { ok: false, reasons: ['双轴报告执行者相同（' + sAuthor + '），违反独立审查闸。两轴必须由两个不同 subagent 执行。'] };
  }
  return { ok: true, reasons: [] };
}

function authorOf(filePath) {
  if (!fs.existsSync(filePath)) return null;
  var head = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/).slice(0, 20).join('\n');
  var m = head.match(/^Executed\s+by:\s*(.+)$/m);
  return m ? m[1].trim() : null;
}

// ── 确认闸校验（并入 code-review 大闸门）─────────────────────────────

function confirmationsComplete(workDir) {
  var fp = findingsPath(workDir);
  var cp = confirmationsPath(workDir);
  if (!fs.existsSync(fp)) {
    return { ok: false, reasons: ['没有 findings.md，无法核对确认覆盖。先把双轴 findings 汇总到 .matt-flow/findings.md。'] };
  }
  var findingIds = shared.extractIds(fs.readFileSync(fp, 'utf-8'));
  if (findingIds.length === 0) {
    return { ok: false, reasons: ['findings.md 中没有 F-xxx 编号的条目，无法核对确认。'] };
  }
  if (!fs.existsSync(cp)) {
    return { ok: false, reasons: ['没有 confirmations.json。code-review 大闸门要求 findings 已确认或豁免，先运行 matt-review({ action: "confirm" }) 记录用户确认。'] };
  }
  var conf;
  try {
    conf = JSON.parse(fs.readFileSync(cp, 'utf-8'));
  } catch (e) {
    return { ok: false, reasons: ['confirmations.json 损坏。'] };
  }
  var handled = (conf.confirmedIds || []).concat(conf.rejectedIds || []);
  var missing = findingIds.filter(function (id) { return handled.indexOf(id) === -1; });
  if (missing.length > 0) {
    return { ok: false, reasons: ['以下 findings 尚未获得用户确认或豁免：' + missing.join(', ') + '。确认前不许修复，未处理的不得收尾。'] };
  }
  return { ok: true, reasons: [] };
}

// ── 动作：status / gate / advance / reset ──────────────────────────────

function handleStatus(workDir) {
  ensureFlowDir(workDir);
  var p = statePath(workDir);
  if (!fs.existsSync(p)) {
    // 首次 status：初始化 state.json，之后只读
    writeState(workDir, readState(workDir));
  }
  var state = readState(workDir);
  return {
    success: true,
    content: '当前阶段：' + state.currentStage + '。推进次数：' + state.history.length + '。详见 .matt-flow/state.json。',
    details: state
  };
}

function handleGate(workDir, stageOverride) {
  ensureFlowDir(workDir);
  var state = readState(workDir);
  var stage = stageOverride || state.currentStage;
  var tmpl = templates.GATE_TEMPLATES[stage];
  if (!tmpl) {
    return { success: false, content: '阶段 ' + stage + ' 没有验收清单模板。', details: null };
  }
  var p = gatePath(workDir, stage);
  var dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(p)) {
    return { success: true, content: '验收清单已存在：' + p + '（保留现有勾选，不覆盖）。', details: { stage: stage, gateFile: p } };
  }
  fs.writeFileSync(p, '# 验收清单：' + stage + '\n\n逐项自证，全部通过后把 [ ] 改为 [x]，再调用 matt-flow({ action: "advance" })。\n\n' + tmpl.join('\n') + '\n', 'utf-8');
  return { success: true, content: '已生成验收清单：' + p, details: { stage: stage, gateFile: p } };
}

function handleAdvance(workDir) {
  ensureFlowDir(workDir);
  var state = readState(workDir);
  var cur = state.currentStage;
  var idx = FLOW_ORDER.indexOf(cur);
  if (idx === -1) {
    return { success: false, content: '未知阶段：' + cur, details: null };
  }
  if (cur === 'done') {
    return { success: false, content: '流程已完成（done），无需再推进。', details: null };
  }

  // 1. 验收闸：当前阶段清单必须全过（[x] 全过且条目数一致）
  var gate = gatePassed(workDir, cur);
  if (!gate.ok) {
    writeDenied(workDir, gate.reasons.join('\n'));
    return { success: false, content: '验收闸未通过：' + gate.reasons.join('；'), details: { denied: gate.reasons } };
  }

  // 2. 特殊闸：阶段相关的强制校验
  // code-review 是合并大闸门（ADR-0005 / SPEC R5）：独立审查闸 + 确认闸同时检查
  if (cur === 'code-review') {
    var review = reviewIndependencePassed(workDir);
    if (!review.ok) {
      writeDenied(workDir, review.reasons.join('\n'));
      return { success: false, content: '独立审查闸未通过：' + review.reasons.join('；'), details: { denied: review.reasons } };
    }
    var conf = confirmationsComplete(workDir);
    if (!conf.ok) {
      writeDenied(workDir, conf.reasons.join('\n'));
      return { success: false, content: '确认闸未通过：' + conf.reasons.join('；'), details: { denied: conf.reasons } };
    }
  }

  // 3. 推进
  var next = FLOW_ORDER[idx + 1];
  state.history.push({ from: cur, to: next, at: new Date().toISOString() });
  state.currentStage = next;
  writeState(workDir, state);
  return {
    success: true,
    content: '已推进：' + cur + ' → ' + next + '。下一阶段验收闸：先跑 matt-flow({ action: "gate" })。',
    details: { from: cur, to: next, state: state }
  };
}

function handleReset(workDir) {
  ensureFlowDir(workDir);
  var state = readState(workDir);
  state.history.push({ from: state.currentStage, to: 'grill-with-docs', at: new Date().toISOString(), note: 'reset' });
  state.currentStage = 'grill-with-docs';
  writeState(workDir, state);
  return { success: true, content: '状态机已重置到 grill-with-docs。历史文件保留。新项目从主航道入口重新走。', details: state };
}

module.exports = {
  handleStatus: handleStatus,
  handleGate: handleGate,
  handleAdvance: handleAdvance,
  handleReset: handleReset
};
