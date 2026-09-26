// release.js — 打包发布脚本
// 用法: node scripts/release.js [输出目录]
// 默认输出到上一级目录: mattpocock-native-<version>.zip

var fs = require('fs');
var path = require('path');
var os = require('os');
var cp = require('child_process');

var ROOT = path.resolve(__dirname, '..');
var manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf-8'));
var VERSION = manifest.version;
var OUT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.dirname(ROOT);
var OUT_ZIP = path.join(OUT_DIR, 'mattpocock-native-' + VERSION + '.zip');

// 明确打包清单（不含 .matt-flow、.scratch、review 报告、测试临时产物）
var INCLUDE = [
  'manifest.json',
  'AGENTS.md',
  'CONTEXT.md',
  'README.md',
  'SPEC.md',
  'CHANGELOG.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'SECURITY.md',
  '.gitignore',
  'docs',
  'lib',
  'tools',
  'skills',
  'tests'
];

var EXCLUDE_DIRS = ['.matt-flow', '.scratch', 'node_modules'];

// 1. 建临时目录，按清单拷贝
var tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'matt-native-release-'));
var pkgDir = path.join(tmp, 'mattpocock-native');
fs.mkdirSync(pkgDir, { recursive: true });

function copyTree(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  var entries = fs.readdirSync(src, { withFileTypes: true });
  entries.forEach(function (entry) {
    if (EXCLUDE_DIRS.indexOf(entry.name) !== -1) return;
    var s = path.join(src, entry.name);
    var d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyTree(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  });
}

INCLUDE.forEach(function (item) {
  var src = path.join(ROOT, item);
  if (!fs.existsSync(src)) {
    console.error('缺失: ' + item);
    process.exit(1);
  }
  var stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyTree(src, path.join(pkgDir, item));
  } else {
    fs.copyFileSync(src, path.join(pkgDir, item));
  }
});

// 2. 打包（用系统 PowerShell 的 Compress-Archive，处理中文路径稳妥）
var zipCmd = 'powershell -NoProfile -Command "Compress-Archive -Path \'' + pkgDir.replace(/'/g, "''") + '\\*\' -DestinationPath \'' + OUT_ZIP.replace(/'/g, "''") + '\' -Force"';
cp.execSync(zipCmd, { stdio: 'inherit' });

// 3. 清理临时目录
fs.rmSync(tmp, { recursive: true, force: true });

console.log('打包完成: ' + OUT_ZIP);
console.log('版本: ' + VERSION);
