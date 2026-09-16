#!/usr/bin/env node
/**
 * 打包 dist/ 成 CrazyGames 提交用的 zip,并按官方技术要求做硬断言。
 *
 * 阈值来源 https://docs.crazygames.com/requirements/technical/ (核对于 2026-09-16):
 *   - 总体积      <= 250 MB
 *   - 文件数      <= 1500
 *   - 初始下载    <= 50 MB(想上移动端首页推荐位要 <= 20 MB)
 *   - 只能用相对路径,绝对路径一律禁止
 *
 * 超标直接 exit 1。让问题在本地暴露,而不是上传之后被退回。
 */
import { createWriteStream } from 'node:fs';
import { readFile, readdir, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import archiver from 'archiver';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUT_DIR = path.join(ROOT, 'submissions');

const LIMITS = {
  totalBytes: 250 * 1024 * 1024,
  fileCount: 1500,
  initialBytes: 50 * 1024 * 1024,
  mobileInitialBytes: 20 * 1024 * 1024,
};

const checkOnly = process.argv.includes('--check-only');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else {
      out.push({ full, rel: path.relative(DIST, full), size: (await stat(full)).size });
    }
  }
  return out;
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function main() {
  const distStat = await stat(DIST).catch(() => null);
  if (!distStat) {
    console.error('✗ 找不到 dist/,先运行 npm run build');
    process.exit(1);
  }

  const files = await walk(DIST);
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  // 初始下载 = index.html + 它直接引用的 js/css。
  // 这是近似值,但足以在体积失控时提前报警。
  const html = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const referenced = [...html.matchAll(/(?:src|href)="\.?\/?([^"]+\.(?:js|css))"/g)].map((m) => m[1]);
  const initialBytes =
    Buffer.byteLength(html) +
    files.filter((f) => referenced.some((r) => f.rel.endsWith(path.basename(r)))).reduce((s, f) => s + f.size, 0);

  // 绝对路径是上传后白屏的头号原因,必须拦住
  const absolutePaths = [...html.matchAll(/(?:src|href)="(\/[^\/"][^"]*)"/g)].map((m) => m[1]);

  const failures = [];
  if (totalBytes > LIMITS.totalBytes) failures.push(`总体积 ${mb(totalBytes)} 超过 ${mb(LIMITS.totalBytes)}`);
  if (files.length > LIMITS.fileCount) failures.push(`文件数 ${files.length} 超过 ${LIMITS.fileCount}`);
  if (initialBytes > LIMITS.initialBytes) failures.push(`初始下载 ${mb(initialBytes)} 超过 ${mb(LIMITS.initialBytes)}`);
  if (absolutePaths.length > 0) failures.push(`index.html 里有绝对路径: ${absolutePaths.join(', ')}`);

  console.log('\n  CrazyGames 提交包检查');
  console.log('  ─────────────────────────────────────────────');
  console.log(`  文件数        ${String(files.length).padStart(6)} / ${LIMITS.fileCount}`);
  console.log(`  总体积        ${mb(totalBytes).padStart(9)} / ${mb(LIMITS.totalBytes)}`);
  console.log(`  初始下载      ${mb(initialBytes).padStart(9)} / ${mb(LIMITS.initialBytes)}`);
  console.log(
    `  移动端首页    ${initialBytes <= LIMITS.mobileInitialBytes ? '符合' : '不符合'} (需 <= ${mb(LIMITS.mobileInitialBytes)})`,
  );
  console.log(`  相对路径      ${absolutePaths.length === 0 ? '通过' : '失败'}`);
  console.log('  ─────────────────────────────────────────────');

  console.log('\n  体积明细(从大到小):');
  for (const f of [...files].sort((a, b) => b.size - a.size).slice(0, 10)) {
    console.log(`    ${kb(f.size).padStart(10)}  ${f.rel}`);
  }

  if (failures.length > 0) {
    console.error('\n✗ 不符合 CrazyGames 技术要求:');
    for (const f of failures) console.error(`    - ${f}`);
    process.exit(1);
  }

  console.log('\n✓ 全部检查通过');

  if (checkOnly) return;

  await mkdir(OUT_DIR, { recursive: true });
  const zipPath = path.join(OUT_DIR, 'pulse-dodger.zip');

  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    // 注意:index.html 必须在 zip 根目录,不能多一层文件夹
    archive.directory(DIST, false);
    void archive.finalize();
  });

  const zipSize = (await stat(zipPath)).size;
  console.log(`✓ 提交包已生成  submissions/pulse-dodger.zip  (${kb(zipSize)})\n`);
}

await main();
