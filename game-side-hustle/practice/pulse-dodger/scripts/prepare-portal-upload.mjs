#!/usr/bin/env node
/**
 * Prepare the folder that should be dragged into the CrazyGames upload zone.
 *
 * Current Developer Portal behavior rejects archive files and expects the game
 * files directly in the upload zone. Keep pulse-dodger.zip as an offline
 * archive, but upload the contents of submissions/portal-upload/.
 */
import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'submissions', 'portal-upload');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else {
      out.push({ full, rel: path.relative(OUT, full), size: (await stat(full)).size });
    }
  }
  return out;
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function main() {
  const indexPath = path.join(DIST, 'index.html');
  await stat(indexPath).catch(() => {
    throw new Error('dist/index.html not found. Run npm run build first.');
  });

  const html = await readFile(indexPath, 'utf8');
  const absolutePaths = [...html.matchAll(/(?:src|href)="(\/[^\/"][^"]*)"/g)].map((m) => m[1]);
  if (absolutePaths.length > 0) {
    throw new Error(`index.html contains absolute paths: ${absolutePaths.join(', ')}`);
  }

  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.dirname(OUT), { recursive: true });
  await cp(DIST, OUT, { recursive: true });

  const files = await walk(OUT);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  console.log('\n  CrazyGames Portal upload folder');
  console.log('  ─────────────────────────────────────────────');
  console.log(`  Path       submissions/portal-upload/`);
  console.log(`  Files      ${files.length}`);
  console.log(`  Size       ${kb(totalBytes)}`);
  console.log('  Upload     Drag the contents of this folder, not pulse-dodger.zip');
  console.log('  ─────────────────────────────────────────────\n');

  for (const file of files) {
    console.log(`  ${file.rel}`);
  }
  console.log('');
}

await main();
