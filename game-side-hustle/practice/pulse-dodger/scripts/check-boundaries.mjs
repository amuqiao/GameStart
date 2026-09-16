#!/usr/bin/env node
/**
 * 依赖边界检查 —— 把架构约束写成会 exit 1 的断言,而不是写在会过期的文档里。
 *
 * 这个脚本本身就是这个工程想教的一件事:
 * **架构里那些"不许反过来依赖"的规矩,是可以被机器检查的。**
 * 它不需要任何框架,60 行正则就够。
 *
 * 规则刻意只有四条 —— 每条教一个不同的点,而不是追求覆盖率。
 * 十条规则、100% 覆盖率,不如四条规则、四个能说清楚的理由。
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');

/**
 * 每条规则 = 一个目录 + 它不许依赖什么 + 这条规则在教什么。
 * `teaches` 会被打印出来,所以这个脚本的输出就是一张可读的依赖表。
 */
const RULES = [
  {
    dir: '.',
    label: '只有 src/game/** 可以 import phaser',
    teaches: '引擎依赖是有边界的:dom/ 和 platform/ 换引擎时不用动',
    check: (rel, line) =>
      /^\s*(import|export)\s.*from\s+['"]phaser['"]/.test(line) && !rel.startsWith('game/'),
    why: '只有 src/game/ 下的代码可以知道游戏引擎是 Phaser',
  },
  {
    dir: 'game/core',
    label: 'core/ 只依赖 core/ 自身和 tuning',
    teaches: '规则层为什么能用 node --test 直接跑,不需要浏览器和引擎',
    check: (_rel, line) => {
      const m = /^\s*(?:import|export)\s(.*)from\s+['"](\.[^'"]+)['"]/.exec(line);
      if (!m) return false;
      // `import type` 在编译后被完全擦除,运行时不参与模块解析,
      // 所以它不受"必须带 .ts 扩展名"的约束。
      if (/^\s*type\s/.test(m[1])) return false;
      const target = m[2];
      const allowed =
        /^\.\/[^/]+\.ts$/.test(target) ||
        /^\.\.\/tuning\.ts$/.test(target) ||
        /^\.\.\/viewport\.ts$/.test(target);
      return !allowed;
    },
    why: 'core/ 必须能被 node --test 直接执行:相对 import 只许指向 core/ 内部、../tuning.ts 或 ../viewport.ts,且必须带 .ts 扩展名(Node 原生 ESM 不认省略扩展名)。import type 例外,它在运行时已被擦除',
  },
  {
    dir: 'game/effects',
    label: 'effects/ 不许 import core/',
    teaches: '依赖是单向的:表现可以被规则驱动,规则不知道表现存在',
    check: (_rel, line) => /^\s*(import|export)\s.*from\s+['"]\.\.\/core\//.test(line),
    why: '粒子、震屏、音效只负责"让玩家感觉到",不许反过来改游戏规则',
  },
  {
    dir: 'platform',
    label: 'platform/ 不许 import game/',
    teaches: '平台适配层既不知道引擎也不知道游戏,所以能整块搬到别的项目',
    check: (_rel, line) => /^\s*(import|export)\s.*from\s+['"].*\/game\//.test(line),
    why: '平台层是最外层,不许反向依赖游戏代码',
  },
];

/**
 * 遍历目录。**目录不存在时直接抛,不要静默返回空数组。**
 *
 * 原来这里写的是 `readdir(dir).catch(() => [])`,后果是:规则点名的目录
 * 一旦被删掉或改名,这条规则会扫到 0 个文件、打一个 ✓、exit 0 ——
 * **护栏瞎了,但它报告自己很健康。** 这比没有护栏更危险。
 * 门禁的第一要务是能发现自己失效。
 */
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.ts$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)) out.push(full);
  }
  return out;
}

const violations = [];

for (const rule of RULES) {
  const ruleDir = path.join(SRC, rule.dir);
  const files = await walk(ruleDir).catch(() => {
    console.error(`\n✗ 规则指向的目录不存在: src/${rule.dir}`);
    console.error('   规则和目录结构脱节了 —— 这条边界现在没人在看。\n');
    process.exit(1);
  });

  for (const file of files) {
    const rel = path.relative(SRC, file);
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      if (rule.check(rel, line)) {
        violations.push({ rel, line: i + 1, code: line.trim(), why: rule.why, label: rule.label });
      }
    });
  }
}

console.log('\n  依赖边界');
console.log('  ─────────────────────────────────────────────────────────────');
for (const rule of RULES) {
  const bad = violations.filter((v) => v.label === rule.label).length;
  console.log(`  ${bad === 0 ? '✓' : '✗'} ${rule.label}`);
  console.log(`      ${rule.teaches}`);
}
console.log('  ─────────────────────────────────────────────────────────────');

if (violations.length > 0) {
  console.error('\n✗ 破坏了依赖边界:');
  for (const v of violations) {
    console.error(`\n    src/${v.rel}:${v.line}`);
    console.error(`      ${v.code}`);
    console.error(`      → ${v.why}`);
  }
  console.error('');
  process.exit(1);
}

console.log('\n✓ 依赖边界完好\n');
