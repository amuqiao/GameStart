#!/usr/bin/env node
/**
 * Generate CrazyGames submission materials for Pulse Dodger.
 *
 * Outputs:
 *   materials/screenshots/menu.png
 *   materials/screenshots/gameplay.png
 *   materials/screenshots/result.png
 *   materials/covers/landscape-1920x1080.png
 *   materials/covers/portrait-800x1200.png
 *   materials/covers/square-800x800.png
 *   materials/videos/preview.mp4
 *   materials/videos/preview-portrait.mp4
 *
 * The screenshots and video are captured from the local production preview by
 * controlling Chrome through the Chrome DevTools Protocol. The covers are
 * rendered from deterministic HTML/CSS art, then captured by the same browser.
 */
import { spawn, execFile } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const MATERIALS = path.join(ROOT, 'materials');
const SCREENSHOTS = path.join(MATERIALS, 'screenshots');
const COVERS = path.join(MATERIALS, 'covers');
const VIDEOS = path.join(MATERIALS, 'videos');
const FRAMES = path.join(VIDEOS, 'frames');
const COVER_SOURCES = path.join(MATERIALS, 'sources');

const PREVIEW_PORT = 8081;
const DEBUG_PORT = 9223;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}/`;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureDirs() {
  await mkdir(SCREENSHOTS, { recursive: true });
  await mkdir(COVERS, { recursive: true });
  await mkdir(VIDEOS, { recursive: true });
  await mkdir(COVER_SOURCES, { recursive: true });
  await rm(FRAMES, { recursive: true, force: true });
  await mkdir(FRAMES, { recursive: true });
}

async function waitForHttp(url, timeoutMs = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Keep waiting while the preview server boots.
    }
    await wait(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function execFileChecked(command, args, options = {}) {
  await new Promise((resolve, reject) => {
    const child = execFile(command, args, { cwd: ROOT, ...options }, (error, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (error) reject(error);
      else resolve();
    });
    child.on('error', reject);
  });
}

function startPreviewServer() {
  const child = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));
  return child;
}

function startChrome() {
  return spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${path.join('/tmp', 'pulse-dodger-chrome-profile')}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();

    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result ?? {});
        return;
      }
      const listeners = this.events.get(message.method);
      if (listeners) {
        for (const listener of listeners) listener(message.params ?? {});
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    const listeners = this.events.get(method) ?? [];
    listeners.push(listener);
    this.events.set(method, listeners);
  }

  close() {
    this.ws.close();
  }
}

async function connectPage() {
  await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
  const targets = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`).then((r) => r.json());
  const page = targets.find((target) => target.type === 'page');
  if (!page?.webSocketDebuggerUrl) {
    throw new Error('Chrome did not expose a page target');
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  const cdp = new CdpClient(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', { urls: ['*sdk.crazygames.com/*'] });
  return cdp;
}

async function setViewport(cdp, width, height, mobile = false) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
}

async function navigate(cdp, url) {
  await cdp.send('Page.navigate', { url });
  await wait(1200);
}

async function waitForCanvas(cdp) {
  const started = Date.now();
  while (Date.now() - started < 12_000) {
    const result = await cdp.send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("canvas"))',
      returnByValue: true,
    });
    if (result.result?.value === true) return;
    await wait(250);
  }
  throw new Error('Game canvas did not appear');
}

async function evaluate(cdp, expression) {
  return cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
}

async function click(cdp, x, y) {
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    clickCount: 1,
  });
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button: 'left',
    clickCount: 1,
  });
}

async function mouseMove(cdp, x, y) {
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
}

async function screenshot(cdp, outputPath) {
  const result = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(outputPath, Buffer.from(result.data, 'base64'));
  console.log(`✓ wrote ${path.relative(ROOT, outputPath)}`);
}

async function loadGame(cdp) {
  await setViewport(cdp, 1920, 1080, false);
  await navigate(cdp, PREVIEW_URL);
  await waitForCanvas(cdp);
  await evaluate(
    cdp,
    `
      localStorage.setItem('pulse-dodger:runs-played', '3');
      localStorage.setItem('pulse-dodger:best-score', '360');
      localStorage.removeItem('pulse-dodger:user-muted');
      true;
    `,
  );
  await navigate(cdp, PREVIEW_URL);
  await waitForCanvas(cdp);
  await wait(700);
}

async function captureGameMaterials(cdp) {
  await loadGame(cdp);
  await screenshot(cdp, path.join(SCREENSHOTS, 'menu.png'));

  await click(cdp, 960, 680);
  for (let i = 0; i < 16; i += 1) {
    const t = i / 16;
    await mouseMove(cdp, 960 + Math.sin(t * Math.PI * 2) * 280, 540 + Math.cos(t * Math.PI * 2) * 160);
    await wait(110);
  }
  await screenshot(cdp, path.join(SCREENSHOTS, 'gameplay.png'));

  for (let frame = 1; frame <= 144; frame += 1) {
    const t = frame / 8;
    const x = 960 + Math.sin(t * 1.35) * 420 + Math.sin(t * 2.1) * 110;
    const y = 540 + Math.cos(t * 1.05) * 230;
    await mouseMove(cdp, Math.round(x), Math.round(y));
    await screenshot(cdp, path.join(FRAMES, `frame-${String(frame).padStart(3, '0')}.png`));
    await wait(125);
  }

  await execFileChecked('ffmpeg', [
    '-y',
    '-framerate',
    '8',
    '-i',
    path.join(FRAMES, 'frame-%03d.png'),
    '-vf',
    'fps=30,format=yuv420p',
    '-an',
    '-movflags',
    '+faststart',
    path.join(VIDEOS, 'preview.mp4'),
  ]);
  console.log(`✓ wrote ${path.relative(ROOT, path.join(VIDEOS, 'preview.mp4'))}`);

  await execFileChecked('ffmpeg', [
    '-y',
    '-i',
    path.join(VIDEOS, 'preview.mp4'),
    '-vf',
    'crop=720:1080:600:0,scale=800:1200,format=yuv420p',
    '-an',
    '-movflags',
    '+faststart',
    path.join(VIDEOS, 'preview-portrait.mp4'),
  ]);
  console.log(`✓ wrote ${path.relative(ROOT, path.join(VIDEOS, 'preview-portrait.mp4'))}`);
  await rm(FRAMES, { recursive: true, force: true });

  await loadGame(cdp);
  await click(cdp, 960, 680);
  await mouseMove(cdp, 960, 540);
  await wait(8500);
  await screenshot(cdp, path.join(SCREENSHOTS, 'result.png'));
}

function coverHtml(width, height, mode) {
  const isPortrait = height > width;
  const titleSize = isPortrait ? 96 : mode === 'square' ? 82 : 124;
  const orb = isPortrait ? 210 : mode === 'square' ? 170 : 240;
  const shardCount = mode === 'square' ? 10 : 16;
  const shards = Array.from({ length: shardCount }, (_, i) => {
    const angle = (i / shardCount) * Math.PI * 2;
    const ring = isPortrait ? 390 : mode === 'square' ? 270 : 470;
    const cx = width / 2 + Math.cos(angle) * ring;
    const cy = height / 2 + Math.sin(angle * 1.12) * (isPortrait ? 450 : 280);
    const rotate = Math.round((angle * 180) / Math.PI + 24);
    const size = 28 + (i % 4) * 12;
    return `<div class="shard" style="left:${cx}px;top:${cy}px;width:${size}px;height:${size * 1.55}px;transform:rotate(${rotate}deg) skew(-12deg);"></div>`;
  }).join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: ${width}px; height: ${height}px; overflow: hidden; }
  body {
    position: relative;
    background:
      radial-gradient(circle at 50% 46%, rgba(94,234,212,.18), transparent 18%),
      radial-gradient(circle at 28% 20%, rgba(56,189,248,.24), transparent 23%),
      radial-gradient(circle at 78% 78%, rgba(244,63,94,.20), transparent 24%),
      linear-gradient(150deg, #080b14 0%, #111827 52%, #0a1020 100%);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #e2e8f0;
  }
  .star { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: rgba(226,232,240,.55); }
  .pulse {
    position: absolute; left: 50%; top: 48%; width: ${orb}px; height: ${orb}px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, #5eead4 0 24%, rgba(94,234,212,.48) 25% 35%, rgba(94,234,212,.08) 36% 68%, transparent 69%);
    box-shadow: 0 0 46px rgba(94,234,212,.82), 0 0 140px rgba(250,204,21,.22);
  }
  .ring {
    position: absolute; left: 50%; top: 48%; width: ${orb * 2.15}px; height: ${orb * 2.15}px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: ${Math.max(8, Math.round(orb * 0.045))}px solid rgba(250,204,21,.82);
    box-shadow: 0 0 38px rgba(250,204,21,.35);
  }
  .shard {
    position: absolute;
    background: linear-gradient(180deg, #fb7185, #be123c);
    clip-path: polygon(50% 0%, 100% 72%, 50% 100%, 0% 72%);
    filter: drop-shadow(0 0 20px rgba(244,63,94,.72));
  }
  .mote {
    position: absolute; border-radius: 50%; background: #38bdf8;
    box-shadow: 0 0 24px rgba(56,189,248,.8);
  }
  .title {
    position: absolute; left: 50%; ${isPortrait ? 'bottom: 142px;' : 'bottom: 116px;'}
    transform: translateX(-50%);
    width: 92%;
    text-align: center;
    font-size: ${titleSize}px;
    line-height: .95;
    font-weight: 900;
    letter-spacing: 2px;
    color: #f8fafc;
    text-shadow: 0 5px 0 rgba(15,23,42,.72), 0 0 30px rgba(94,234,212,.42);
  }
</style>
</head>
<body>
  ${Array.from({ length: 42 }, (_, i) => {
    const x = Math.round(((i * 137) % width));
    const y = Math.round(((i * 251) % height));
    const alpha = 0.22 + (i % 5) * 0.1;
    return `<div class="star" style="left:${x}px;top:${y}px;opacity:${alpha}"></div>`;
  }).join('')}
  ${shards}
  <div class="mote" style="left:${width * 0.24}px;top:${height * 0.42}px;width:28px;height:28px;"></div>
  <div class="mote" style="left:${width * 0.73}px;top:${height * 0.29}px;width:22px;height:22px;"></div>
  <div class="mote" style="left:${width * 0.66}px;top:${height * 0.58}px;width:18px;height:18px;"></div>
  <div class="ring"></div>
  <div class="pulse"></div>
  <div class="title">PULSE DODGER</div>
</body>
</html>`;
}

async function captureCover(cdp, filename, width, height, mode) {
  const htmlPath = path.join(COVER_SOURCES, `${filename}.html`);
  await writeFile(htmlPath, coverHtml(width, height, mode), 'utf8');
  await setViewport(cdp, width, height, false);
  await navigate(cdp, pathToFileURL(htmlPath).href);
  await wait(300);
  await screenshot(cdp, path.join(COVERS, `${filename}.png`));
}

async function generateCovers(cdp) {
  await captureCover(cdp, 'landscape-1920x1080', 1920, 1080, 'landscape');
  await captureCover(cdp, 'portrait-800x1200', 800, 1200, 'portrait');
  await captureCover(cdp, 'square-800x800', 800, 800, 'square');
}

async function writeMetadata() {
  await writeFile(
    path.join(MATERIALS, 'metadata.md'),
    `# Pulse Dodger Portal Metadata

Use this text in CrazyGames Developer Portal.

## Game Name

Pulse Dodger

## Short Description

Dodge red shards, collect blue energy, and unleash pulse blasts to survive as long as you can.

## Long Description

Pulse Dodger is a fast arcade survival game built around clean movement and quick reactions. Move through a neon arena, avoid incoming red shards, collect blue motes to charge your pulse, then release a blast to clear nearby danger and push your score higher. Each run is short, readable, and built for instant replay on desktop and mobile.

## Instructions

Avoid the red shards and collect blue energy motes. When your pulse is charged, release it to clear nearby shards. Survive longer, chain risky collections, and beat your best score.

## Controls

Desktop:
- Move with mouse.
- Click or press Space to release a pulse.
- Press Esc to pause.

Mobile:
- Drag to move.
- Tap to release a pulse when charged.

## Suggested Portal Fields

| Field | Value |
| --- | --- |
| Launch type | Basic |
| Game engine | HTML5 |
| Save progress | Yes, using the Data Module from the CrazyGames SDK |
| Supports mobile devices | Yes |
| Online multiplayer | No |
| Supports CrazyGames muting audio through SDK | Yes |
| Category | Arcade |
| Orientation | Landscape |

## Material Paths

| Material | Path |
| --- | --- |
| Menu screenshot | materials/screenshots/menu.png |
| Gameplay screenshot | materials/screenshots/gameplay.png |
| Result screenshot | materials/screenshots/result.png |
| Landscape cover | materials/covers/landscape-1920x1080.png |
| Portrait cover | materials/covers/portrait-800x1200.png |
| Square cover | materials/covers/square-800x800.png |
| Landscape preview video | materials/videos/preview.mp4 |
| Portrait preview video | materials/videos/preview-portrait.mp4 |
| Submission ZIP | submissions/pulse-dodger.zip |
`,
    'utf8',
  );
}

async function main() {
  await ensureDirs();
  await writeMetadata();

  let preview = null;
  let chrome = null;
  let cdp = null;

  try {
    preview = startPreviewServer();
    await waitForHttp(PREVIEW_URL);

    chrome = startChrome();
    chrome.stderr.on('data', (chunk) => process.stderr.write(chunk));

    cdp = await connectPage();
    await generateCovers(cdp);
    await captureGameMaterials(cdp);
  } finally {
    cdp?.close();
    if (chrome) chrome.kill('SIGTERM');
    if (preview) preview.kill('SIGTERM');
  }

  for (const video of ['preview.mp4', 'preview-portrait.mp4']) {
    await execFileChecked('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration,size',
      '-of',
      'default=noprint_wrappers=1',
      path.join(VIDEOS, video),
    ]);
  }
}

await main();
