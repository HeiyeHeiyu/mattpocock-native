// matt-flow — 流程看门狗工具。薄封装 lib/flow.js。
// 原则（ADR-0002）：一切状态以文件为准，返回值仅供展示。

var flow = require('../lib/flow.js');

exports.name = 'matt-flow';
exports.description = '流程看门狗。管理主航道状态机与验收闸：status 读状态，gate 生成当前阶段验收清单，advance 校验清单并推进阶段，reset 重置状态机（新项目）。所有状态落盘 .matt-flow/，返回值仅供展示，以文件为准。';
exports.parameters = {
  type: 'object',
  required: ['action'],
  properties: {
    action: {
      type: 'string',
      enum: ['status', 'gate', 'advance', 'reset'],
      description: 'status: 读当前状态。gate: 生成当前阶段验收清单到 .matt-flow/gates/。advance: 校验验收清单并推进到下一阶段。reset: 重置状态机（仅新项目开始时使用）。'
    },
    stage: {
      type: 'string',
      description: '仅 gate 在特殊情况下显式指定阶段；正常流程不传，工具自动用当前阶段。'
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
    var result;
    switch (action) {
      case 'status':
        result = flow.handleStatus(workDir);
        break;
      case 'gate':
        result = flow.handleGate(workDir, params.stage);
        break;
      case 'advance':
        result = flow.handleAdvance(workDir);
        break;
      case 'reset':
        result = flow.handleReset(workDir);
        break;
      default:
        return { success: false, content: 'action 必须是 status/gate/advance/reset 之一。', details: null };
    }
    return result;
  } catch (err) {
    return { success: false, content: 'matt-flow 异常：' + err.message, details: null };
  }
};
