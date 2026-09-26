// reviews.js — 双轴独立审查调度 + 确认闸记录
// ES5: var, function, 无 const/let/箭头函数/模板字符串

var fs = require('fs');
var path = require('path');
var shared = require('./shared.js');

function reviewsDir(workDir) {
  return shared.reviewsDir(workDir);
}

function latestPath(workDir) {
  return path.join(reviewsDir(workDir), 'latest.json');
}

function confirmationsPath(workDir) {
  return shared.confirmationsPath(workDir);
}

function findingsPath(workDir) {
  return shared.findingsPath(workDir);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function dispatchReview(workDir, target) {
  if (!target) {
    return { success: false, content: 'dispatch 需要 target：审查对象（commit/branch/目录路径）。', details: null };
  }
  ensureDir(reviewsDir(workDir));
  var ts = new Date().toISOString().replace(/[:.]/g, '-');
  var manifest = {
    dispatchId: 'R-' + ts,
    target: target,
    ts: ts,
    standardsReport: 'review-' + ts + '-standards.md',
    specReport: 'review-' + ts + '-spec.md'
  };
  fs.writeFileSync(latestPath(workDir), JSON.stringify(manifest, null, 2), 'utf-8');

  var taskDir = path.join(reviewsDir(workDir), 'dispatch');
  ensureDir(taskDir);

  var standardsTask = [
    '# 双轴审查任务卡：Standards 轴',
    '',
    'dispatchId: ' + manifest.dispatchId,
    '审查对象: ' + target,
    '',
    '**轴定义（Standards）**：代码是否符合本仓库文档化的编码标准（code-quality、CONTEXT.md、AGENTS.md 约定）。',
    '',
    '**执行要求（MANDATORY）**：',
    '- 由独立 subagent 执行。主 agent 自审或代写 = 违反独立审查闸。',
    '- 禁止与 Spec 轴共用同一个 subagent。',
    '- 报告写入：.matt-flow/reviews/' + manifest.standardsReport,
    '- 报告第一行必须是：Executed by: <你的 subagent id>',
    '',
    '**报告内容**：按严重程度列出 findings，每条格式：',
    '| F-编号 | 文件 | 问题 | 严重程度(blocking/major/minor) |',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(taskDir, 'standards-task.md'), standardsTask, 'utf-8');

  var specTask = [
    '# 双轴审查任务卡：Spec 轴',
    '',
    'dispatchId: ' + manifest.dispatchId,
    '审查对象: ' + target,
    '',
    '**轴定义（Spec）**：代码是否符合规格要求（SPEC.md / tickets / 用户需求原文）。',
    '',
    '**执行要求（MANDATORY）**：',
    '- 由独立 subagent 执行。主 agent 自审或代写 = 违反独立审查闸。',
    '- 禁止与 Standards 轴共用同一个 subagent。',
    '- 报告写入：.matt-flow/reviews/' + manifest.specReport,
    '- 报告第一行必须是：Executed by: <你的 subagent id>',
    '',
    '**报告内容**：按严重程度列出 findings，每条格式：',
    '| F-编号 | 文件 | 问题 | 严重程度(blocking/major/minor) |',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(taskDir, 'spec-task.md'), specTask, 'utf-8');

  return {
    success: true,
    content: '双轴任务卡已生成到 .matt-flow/reviews/dispatch/。派两个独立 subagent 各自执行一张卡，报告分别写入 review-' + ts + '-standards.md 和 review-' + ts + '-spec.md。',
    details: manifest
  };
}

function recordConfirmations(workDir, confirmedIds, rejectedIds) {
  var p = confirmationsPath(workDir);
  ensureDir(path.dirname(p));
  var existing = { confirmedIds: [], rejectedIds: [] };
  if (fs.existsSync(p)) {
    try {
      existing = JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch (e) { /* 重置 */ }
  }
  var confirmed = (confirmedIds || []).filter(Boolean);
  var rejected = (rejectedIds || []).filter(Boolean);
  existing.confirmedIds = existing.confirmedIds.concat(confirmed.filter(function (id) { return existing.confirmedIds.indexOf(id) === -1; }));
  existing.rejectedIds = existing.rejectedIds.concat(rejected.filter(function (id) { return existing.rejectedIds.indexOf(id) === -1; }));
  existing.updatedAt = new Date().toISOString();
  fs.writeFileSync(p, JSON.stringify(existing, null, 2), 'utf-8');

  // 校验：传入 id 是否都存在于 findings.md
  var fp = findingsPath(workDir);
  var known = [];
  if (fs.existsSync(fp)) known = shared.extractIds(fs.readFileSync(fp, 'utf-8'));
  var unknown = confirmed.concat(rejected).filter(function (id) { return known.indexOf(id) === -1; });
  var warn = unknown.length > 0 ? ' 注意：以下 id 不在 findings.md 中：' + unknown.join(', ') : '';

  return {
    success: true,
    content: '确认记录已更新：confirmed=' + existing.confirmedIds.join(',') + ' rejected=' + existing.rejectedIds.join(',') + '。' + warn,
    details: existing
  };
}

module.exports = {
  dispatchReview: dispatchReview,
  recordConfirmations: recordConfirmations
};
