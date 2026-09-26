// matt-review — 双轴独立审查调度 + 确认闸工具。薄封装 lib/reviews.js。
// 原则（ADR-0002）：一切状态以文件为准，返回值仅供展示。

var reviews = require('../lib/reviews.js');

exports.name = 'matt-review';
exports.description = '双轴独立审查调度 + 确认闸。dispatch 生成 standards/spec 两张独立 subagent 任务卡，confirm 记录用户对 findings 的确认或豁免。主 agent 不得自做自查。';
exports.parameters = {
  type: 'object',
  required: ['action'],
  properties: {
    action: {
      type: 'string',
      enum: ['dispatch', 'confirm'],
      description: 'dispatch: 生成双轴审查任务卡到 .matt-flow/reviews/dispatch/。confirm: 把用户确认/豁免的 finding 写入 .matt-flow/confirmations.json。'
    },
    target: {
      type: 'string',
      description: 'dispatch 用：审查对象（commit/branch/目录路径）。'
    },
    findingIds: {
      type: 'array',
      items: { type: 'string' },
      description: 'confirm 用：用户确认的 finding id 列表（如 ["F-001"]）。'
    },
    rejectedIds: {
      type: 'array',
      items: { type: 'string' },
      description: 'confirm 用：用户豁免/拒绝的 finding id 列表。'
    },
    cwd: {
      type: 'string',
      description: '可选：工作目录（存放 .matt-flow/）。默认当前目录。'
    }
  }
};

exports.execute = function (params) {
  try {
    var action = params.action;
    var workDir = params.cwd || process.cwd();
    if (action === 'dispatch') {
      return reviews.dispatchReview(workDir, params.target);
    }
    if (action === 'confirm') {
      return reviews.recordConfirmations(workDir, params.findingIds, params.rejectedIds);
    }
    return { success: false, content: 'action 必须是 dispatch/confirm 之一。', details: null };
  } catch (err) {
    return { success: false, content: 'matt-review 异常：' + err.message, details: null };
  }
};
