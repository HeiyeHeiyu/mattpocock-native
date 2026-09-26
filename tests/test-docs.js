// test-docs.js — 静态文档检查（防漂移）
// 用法: node test-docs.js
// 检查 ask-matt / _trigger / AGENTS.md / manifest 的关键承诺是否存在，防止文档漂移与智能路由复活。

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var results = [];
var failures = 0;

function check(name, cond, extra) {
  results.push({ name: name, ok: !!cond, extra: extra || '' });
  if (!cond) failures++;
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8');
}

// ── ask-matt：海龟汤 6 问 + 提醒框架 + 无路由词 ───────────────────────
var askMatt = read('skills/engineering/ask-matt/SKILL.md');
var sixQuestions = ['性质', '规模', '留痕', '交付物', '对象', '代码库状态'];
sixQuestions.forEach(function (q) {
  check('ask-matt 含海龟汤第几问（' + q + '）', askMatt.indexOf(q) !== -1);
});
var reminderSkills = ['triage', 'resolving-merge-conflicts', 'to-questionnaire', 'git-guardrails', 'setup-matt-pocock-skills', 'grill-me', 'wayfinder', 'wizard', 'improve-codebase-architecture', 'diagnosing-bugs', 'research', 'handoff', 'teach', 'wait-what', 'writing-for-agents'];
reminderSkills.forEach(function (s) {
  check('ask-matt 含提醒技能 ' + s, askMatt.indexOf(s) !== -1);
});
var selfChecks = ['完工', '上下文', '术语', '危险', '困惑', '模糊', '他人'];
selfChecks.forEach(function (k) {
  check('ask-matt 含自检点关键词（' + k + '）', askMatt.indexOf(k) !== -1);
});
check('ask-matt 无智能路由词（auto-route）', askMatt.indexOf('auto-route') === -1 && askMatt.toLowerCase().indexOf('router over') === -1);
check('ask-matt 无权重词（priority/权重）', askMatt.indexOf('priority') === -1 && askMatt.indexOf('权重') === -1);

// ── _trigger：浓缩便签 + 自检点 + 无路由词 ─────────────────────────────
var trigger = read('skills/_trigger/SKILL.md');
check('_trigger 含海龟汤提示', trigger.indexOf('海龟汤') !== -1);
selfChecks.forEach(function (k) {
  check('_trigger 含自检点关键词（' + k + '）', trigger.indexOf(k) !== -1);
});
check('_trigger 无路由词（auto-route）', trigger.indexOf('auto-route') === -1 && trigger.indexOf('ROUTES') === -1);
check('_trigger 比 ask-matt 短（便签属性）', trigger.length < askMatt.length * 0.6);

// ── AGENTS.md：纪律只讲新阶段序，无弃用阶段 ───────────────────────────
var agents = read('AGENTS.md');
check('AGENTS.md 含新主航道', agents.indexOf('grill-with-docs → to-spec → to-tickets → implement → code-review → done') !== -1);
check('AGENTS.md 无 setup 独立阶段', agents.indexOf('setup → grill-with-docs') === -1);
check('AGENTS.md 无 fix-confirm 独立阶段', agents.indexOf('fix-confirm → done') === -1);
check('AGENTS.md 无智能路由词', agents.indexOf('智能路由') === -1 && agents.indexOf('auto-route') === -1);

// ── manifest：版本 ─────────────────────────────────────────────────────
var manifest = JSON.parse(read('manifest.json'));
check('manifest 版本 0.2.0', manifest.version === '0.2.0');

// ── 输出 ───────────────────────────────────────────────────────────────
console.log('=== 静态文档检查 ===');
results.forEach(function (r) {
  console.log((r.ok ? 'PASS' : 'FAIL') + '  ' + r.name + (r.ok ? '' : '  [' + r.extra + ']'));
});
console.log('---');
console.log(failures === 0 ? '全部通过' : failures + ' 个用例失败');
process.exit(failures === 0 ? 0 : 1);
