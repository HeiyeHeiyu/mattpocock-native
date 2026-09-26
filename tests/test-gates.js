// test-gates.js — 验证三闸门机制（0.2.0 阶段序）
// 用法: node test-gates.js
// 覆盖：新主航道（grill-with-docs → to-spec → to-tickets → implement → code-review → done）、
//       code-review 合并大闸门（双报告独立 + findings 全确认，缺一不放行）、setup/fix-confirm 不在阶段序。

var fs = require('fs');
var path = require('path');
var os = require('os');

var flowTool = require('../tools/matt-flow.js');
var reviewTool = require('../tools/matt-review.js');

var workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'matt-native-test-'));
var results = [];
var failures = 0;

function check(name, cond, extra) {
  results.push({ name: name, ok: !!cond, extra: extra || '' });
  if (!cond) failures++;
}

function checkAllGate(stage) {
  var g = flowTool.execute({ action: 'gate', cwd: workDir });
  if (!g.success) throw new Error('gate failed: ' + g.content);
  var p = path.join(workDir, '.matt-flow', 'gates', stage + '.md');
  var content = fs.readFileSync(p, 'utf-8').replace(/\[ \]/g, '[x]');
  fs.writeFileSync(p, content, 'utf-8');
}

function currentStage() {
  return flowTool.execute({ action: 'status', cwd: workDir }).details.currentStage;
}

// ── 用例 0：阶段序正确性 ────────────────────────────────────────────────
check('初始阶段是 grill-with-docs（无 setup）', currentStage() === 'grill-with-docs', currentStage());
var order = require('../lib/gate-templates.js').FLOW_ORDER;
check('FLOW_ORDER 无 setup / fix-confirm', order.indexOf('setup') === -1 && order.indexOf('fix-confirm') === -1, order.join('->'));
check('FLOW_ORDER 顺序正确', order.join(',') === 'grill-with-docs,to-spec,to-tickets,implement,code-review,done', order.join(','));

// ── 用例 1：验收闸 ────────────────────────────────────────────────────
var r1 = flowTool.execute({ action: 'advance', cwd: workDir });
check('验收闸：无清单直接 advance 被拒绝', !r1.success, r1.content);
check('验收闸：拒绝原因写入 denied.md', fs.existsSync(path.join(workDir, '.matt-flow', 'denied.md')));

checkAllGate('grill-with-docs');
check('合规：grill-with-docs 清单全勾 advance 放行', flowTool.execute({ action: 'advance', cwd: workDir }).success && currentStage() === 'to-spec', currentStage());

// 违规：[X] 大写、删行仍被拒（F-203 强语义保留）
var gX = flowTool.execute({ action: 'gate', cwd: workDir });
var pX = path.join(workDir, '.matt-flow', 'gates', 'to-spec.md');
fs.writeFileSync(pX, fs.readFileSync(pX, 'utf-8').replace(/\[ \]/g, '[X]'), 'utf-8');
check('验收闸：[X] 大写不算通过 advance 被拒绝', !flowTool.execute({ action: 'advance', cwd: workDir }).success);
fs.unlinkSync(pX);

// ── 合规：to-spec、to-tickets、implement 依次过闸 ─────────────────────
checkAllGate('to-spec');
check('合规：to-spec 放行', flowTool.execute({ action: 'advance', cwd: workDir }).success && currentStage() === 'to-tickets', currentStage());
checkAllGate('to-tickets');
check('合规：to-tickets 放行', flowTool.execute({ action: 'advance', cwd: workDir }).success && currentStage() === 'implement', currentStage());
checkAllGate('implement');
check('合规：implement 放行到 code-review', flowTool.execute({ action: 'advance', cwd: workDir }).success && currentStage() === 'code-review', currentStage());

// ── 用例 2：code-review 合并大闸门（双条件缺一不放行）────────────────
checkAllGate('code-review');

// 违规：没有审查报告 → 拒（独立审查闸）
var r3 = flowTool.execute({ action: 'advance', cwd: workDir });
check('code-review：无报告 advance 被拒绝', !r3.success, r3.content);

// 违规：主 agent 自做自查（同执行者双报告）→ 拒
var ts = new Date().toISOString().replace(/[:.]/g, '-');
fs.mkdirSync(path.join(workDir, '.matt-flow', 'reviews'), { recursive: true });
var sReport = path.join(workDir, '.matt-flow', 'reviews', 'review-' + ts + '-standards.md');
var pReport = path.join(workDir, '.matt-flow', 'reviews', 'review-' + ts + '-spec.md');
fs.writeFileSync(sReport, 'Executed by: main-agent\n\n| F-001 | a.js | 风格问题 | minor |\n', 'utf-8');
fs.writeFileSync(pReport, 'Executed by: main-agent\n\n| F-002 | a.js | 缺验收 | blocking |\n', 'utf-8');
var r4 = flowTool.execute({ action: 'advance', cwd: workDir });
check('code-review：双报告同一执行者 advance 被拒绝', !r4.success, r4.content);

// 违规：双报告独立了，但 findings 未汇总/未确认 → 拒（确认闸）
fs.writeFileSync(sReport, 'Executed by: sub-agent-standards\n\n| F-001 | a.js | 风格问题 | minor |\n', 'utf-8');
fs.writeFileSync(pReport, 'Executed by: sub-agent-spec\n\n| F-002 | a.js | 缺验收 | blocking |\n', 'utf-8');
var r5 = flowTool.execute({ action: 'advance', cwd: workDir });
check('code-review：报告独立但 findings 未汇总 advance 被拒绝', !r5.success, r5.content);

// 违规：findings 只确认部分 → 拒
fs.writeFileSync(path.join(workDir, '.matt-flow', 'findings.md'),
  '| F-001 | a.js | 风格问题 | minor |\n| F-002 | a.js | 缺验收 | blocking |\n', 'utf-8');
reviewTool.execute({ action: 'confirm', findingIds: ['F-001'], cwd: workDir });
var r6 = flowTool.execute({ action: 'advance', cwd: workDir });
check('code-review：只确认部分 findings advance 被拒绝', !r6.success, r6.content);
check('code-review：未确认的 F-002 在拒绝原因中', r6.content.indexOf('F-002') !== -1, r6.content);

// 合规：全部确认 → 放行到 done（无 fix-confirm 中间站）
reviewTool.execute({ action: 'confirm', findingIds: ['F-002'], cwd: workDir });
var r7 = flowTool.execute({ action: 'advance', cwd: workDir });
check('合规：双条件满足直接放行到 done（无 fix-confirm）', r7.success && currentStage() === 'done', currentStage());

// 违规：done 再 advance → 拒
var r8 = flowTool.execute({ action: 'advance', cwd: workDir });
check('合规：done 后 advance 被拒绝', !r8.success, r8.content);

// ── 输出 ───────────────────────────────────────────────────────────────
console.log('=== 三闸门机制验证（0.2.0 阶段序）===');
results.forEach(function (r) {
  console.log((r.ok ? 'PASS' : 'FAIL') + '  ' + r.name + (r.ok ? '' : '  [' + r.extra + ']'));
});
console.log('---');
console.log(failures === 0 ? '全部通过' : failures + ' 个用例失败');
process.exit(failures === 0 ? 0 : 1);
