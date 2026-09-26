// shared.js — flow.js 与 reviews.js 共享的路径与工具函数
// 单一真相源，避免两份 extractIds / 路径函数漂移（对应审查 F-104）
// ES5: var, function, 无 const/let/箭头函数/模板字符串

var path = require('path');

function flowDir(workDir) {
  return path.join(workDir, '.matt-flow');
}

function reviewsDir(workDir) {
  return path.join(flowDir(workDir), 'reviews');
}

function findingsPath(workDir) {
  return path.join(flowDir(workDir), 'findings.md');
}

function confirmationsPath(workDir) {
  return path.join(flowDir(workDir), 'confirmations.json');
}

function extractIds(text) {
  var ids = [];
  var m;
  var re = /F-\d+/g;
  while ((m = re.exec(text)) !== null) {
    if (ids.indexOf(m[0]) === -1) ids.push(m[0]);
  }
  return ids;
}

module.exports = {
  flowDir: flowDir,
  reviewsDir: reviewsDir,
  findingsPath: findingsPath,
  confirmationsPath: confirmationsPath,
  extractIds: extractIds
};
