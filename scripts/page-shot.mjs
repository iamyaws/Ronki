// Full-page screenshot at a true phone width, through headless Edge over the
// DevTools protocol. Plain `--window-size=390,...` does not work: headless
// windows have a minimum width near 500 px, so the page lays out wider and the
// shot is cropped on the right (Astra PP-01, 26 Sep 2026). Device metrics
// emulation sets the layout width itself.
//
// Run: node scripts/page-shot.mjs <url> <out.png> [width=390]
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, out, widthArg] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node page-shot.mjs <url> <out.png> [width]');
  process.exit(1);
}
const width = Number(widthArg || 390);
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), 'page-shot-'));
const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });

const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  proc.stderr.setEncoding('utf8');
  proc.stderr.on('data', (c) => {
    buf += c;
    const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf);
    if (m) resolve(m[1]);
  });
  setTimeout(() => reject(new Error('Edge did not open a DevTools port')), 30_000);
});

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const n = ++id;
  pending.set(n, { resolve, reject });
  ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
});

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  const mobile = width < 768;
  await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile }, sessionId);
  await send('Page.navigate', { url }, sessionId);
  await sleep(2500);
  await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true }, sessionId);
  const { result } = await send('Runtime.evaluate', {
    expression: 'JSON.stringify({h: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})',
    returnByValue: true,
  }, sessionId);
  const dims = JSON.parse(result.value);
  await send('Emulation.setDeviceMetricsOverride', { width, height: dims.h, deviceScaleFactor: 1, mobile }, sessionId);
  await sleep(800);
  const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log(`${out}: layout ${dims.cw} px wide, scrollWidth ${dims.sw}, height ${dims.h}`);
  if (dims.sw > dims.cw) console.log(`WARNING: page scrolls sideways by ${dims.sw - dims.cw} px`);
} finally {
  try { await Promise.race([send('Browser.close'), sleep(3000)]); } catch {}
  ws.close();
  if (proc.exitCode === null) proc.kill();
  await sleep(500);
  rmSync(profile, { recursive: true, force: true });
}
