#!/usr/bin/env node
/**
 * One-page check for the clock faces on the morning builder
 * (/vorlagen/morgenroutine, "Wie steht die Uhrzeit auf dem Blatt?").
 *
 * Opens the heaviest morning plan (six steps with the longest hints, an own
 * step of 24 characters, times on, every row with its own time and so its
 * own clock face) once per style: Als Zahl, Als Uhr, Beides. For each it
 * fails if the page, a row, a label, a hint or a time is cut off, if a
 * clock face sticks out of its row or the count of faces is wrong, prints
 * to PDF and fails on more than one page. Writes the PDFs, PNGs of them and
 * full-page screenshots of the page with "Beides" at 375 px and 1280 px
 * into <dir> to look at by eye.
 *
 * Same approach as the --check part of scripts/og-abend-zwei-kinder.mjs:
 * Edge over the DevTools protocol, no dependencies. Needs pdfinfo and
 * pdftoppm (poppler).
 *
 * Usage:
 *   node scripts/check-morgen-uhr.mjs --out <dir>                  build, serve on 4178, check
 *   node scripts/check-morgen-uhr.mjs --base http://localhost:4193 --out <dir>
 */

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const PORT = 4178;
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PAGE = '/vorlagen/morgenroutine';

// 24 characters with one long word that has to fit the row.
const OWN = 'Hausaufgabenheft abhaken';

// Aufstehen, Anziehen, Haare kämmen, Tier füttern, the own step, Jacke:
// the longest hints of the catalogue. Five minutes or more per step, so
// every row prints its own time (7:05, 7:10, 7:20, 7:25, 7:30, 7:35).
const HEAVIEST = `?s=adhnxj&e=${encodeURIComponent(OWN)}&los=0740&m=5.10.5.5.5.5`;
const STEPS = 6;

const STYLES = [
  { name: 'zahl', query: '', faces: 0, leave: 0, words: STEPS },
  { name: 'uhr', query: '&u=uhr', faces: STEPS, leave: 1, words: 0 },
  { name: 'beides', query: '&u=beides', faces: STEPS, leave: 1, words: STEPS },
];

/* ------------------------------------------------------------------ */
/* Args                                                                */
/* ------------------------------------------------------------------ */

const argv = process.argv.slice(2);
const flagValue = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};
const baseArg = flagValue('--base');
const outArg = flagValue('--out');
if (!outArg) {
  console.error('usage: node scripts/check-morgen-uhr.mjs [--base <url>] --out <dir>');
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hostAnswers(host, port) {
  return new Promise((done) => {
    const socket = createConnection({ host, port });
    const finish = (ok) => {
      socket.destroy();
      done(ok);
    };
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    setTimeout(() => finish(false), 1000);
  });
}

async function portAnswers(port) {
  // vite preview binds to localhost, which on Windows may be ::1 only.
  for (const host of ['127.0.0.1', '::1']) if (await hostAnswers(host, port)) return true;
  return false;
}

function must(cmd, args, label) {
  const result = spawnSync(cmd, args, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${label} failed: ${result.stderr || result.error}`);
  return result.stdout;
}

function pdfInfo(path) {
  const info = must('pdfinfo', [path], 'pdfinfo');
  return {
    pages: Number(/Pages:\s+(\d+)/.exec(info)?.[1] ?? 0),
    size: /Page size:\s+([^\n]+)/.exec(info)?.[1]?.trim() ?? '?',
  };
}

function pdfToPng(pdf, outBase, width) {
  must('pdftoppm', ['-png', '-singlefile', '-f', '1', '-scale-to-x', String(width), '-scale-to-y', '-1', pdf, outBase], 'pdftoppm');
  return `${outBase}.png`;
}

/* ------------------------------------------------------------------ */
/* Edge over the DevTools protocol                                     */
/* ------------------------------------------------------------------ */

async function launchEdge(profile) {
  rmSync(profile, { recursive: true, force: true });
  const proc = spawn(
    EDGE,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--hide-scrollbars',
      `--user-data-dir=${profile}`,
      '--remote-debugging-port=0',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );

  const wsUrl = await new Promise((resolveUrl, reject) => {
    let buffer = '';
    const timer = setTimeout(() => reject(new Error('Edge did not open a DevTools port')), 30_000);
    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', (chunk) => {
      buffer += chunk;
      const match = /DevTools listening on (ws:\/\/\S+)/.exec(buffer);
      if (match) {
        clearTimeout(timer);
        resolveUrl(match[1]);
      }
    });
    proc.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Edge exited early (code ${code})`));
    });
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((ok, reject) => {
    ws.addEventListener('open', ok, { once: true });
    ws.addEventListener('error', () => reject(new Error(`cannot connect to ${wsUrl}`)), { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  const waiters = [];
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { ok, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
      else ok(msg.result);
      return;
    }
    for (const waiter of [...waiters]) {
      if (waiter.method === msg.method && waiter.sessionId === msg.sessionId) {
        waiters.splice(waiters.indexOf(waiter), 1);
        waiter.ok(msg.params);
      }
    }
  });

  const send = (method, params = {}, sessionId) =>
    new Promise((ok, reject) => {
      const id = ++nextId;
      pending.set(id, { ok, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });

  const once = (method, sessionId, timeoutMs = 30_000) =>
    new Promise((ok, reject) => {
      const waiter = { method, sessionId, ok };
      waiters.push(waiter);
      setTimeout(() => {
        const i = waiters.indexOf(waiter);
        if (i >= 0) {
          waiters.splice(i, 1);
          reject(new Error(`timed out waiting for ${method}`));
        }
      }, timeoutMs);
    });

  const close = async () => {
    try {
      await Promise.race([send('Browser.close'), sleep(3000)]);
    } catch {
      // Already gone.
    }
    ws.close();
    if (proc.exitCode === null) proc.kill();
  };

  return { send, once, close };
}

// Resolves once the sheet shows all steps, the fonts are in and every image
// has loaded and decoded.
const WAIT_FOR_SHEET = `(async () => {
  const deadline = Date.now() + 30000;
  while (document.querySelectorAll('.rs-sheet .rs-row').length < ${STEPS}) {
    if (Date.now() > deadline) return { ok: false, reason: 'the sheet never showed ${STEPS} rows' };
    await new Promise((r) => setTimeout(r, 100));
  }
  await Promise.all([
    document.fonts.load("700 28px 'Fredoka'"),
    document.fonts.load("600 14px 'Fredoka'"),
    document.fonts.load("21px 'Gochi Hand'"),
    document.fonts.load("500 14px 'Plus Jakarta Sans'"),
  ]);
  await document.fonts.ready;
  // Only the sheet's own pictures: the guide further down loads lazily and
  // never fires in a headless tab that does not scroll.
  const images = [...document.querySelectorAll('.rs-sheet img')];
  await Promise.all(images.map((img) => img.complete ? null : new Promise((r) => {
    img.addEventListener('load', r, { once: true });
    img.addEventListener('error', r, { once: true });
  })));
  await Promise.all(images.map((img) => img.decode().catch(() => null)));
  const broken = images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src);
  return { ok: broken.length === 0, reason: 'images did not load: ' + broken.join(', ') };
})()`;

// Runs in print media. The page, every row and every text must show all of
// their content, the footer must sit inside the sheet, and every clock face
// must sit inside its row.
const MEASURE_PRINT = `(() => {
  const clipped = [];
  const sheet = document.querySelector('.rs-sheet');
  if (!sheet || sheet.getBoundingClientRect().height < 100) return { clipped: ['the sheet is not shown'] };
  const builder = document.getElementById('eure-schritte');
  if (builder && builder.getBoundingClientRect().height > 0) clipped.push('the builder shows in print');
  const page = sheet.querySelector('.rs-page');
  if (page.scrollHeight - page.clientHeight > 1) clipped.push('page by ' + (page.scrollHeight - page.clientHeight) + ' px');
  const sheetBox = sheet.getBoundingClientRect();
  const foot = sheet.querySelector('.rs-foot').getBoundingClientRect();
  if (foot.bottom > sheetBox.bottom + 0.5) clipped.push('footer below the sheet');
  const done = sheet.querySelector('.rs-done');
  if (done && done.getBoundingClientRect().bottom > foot.top + 0.5) clipped.push('done band runs into the footer');
  const rows = [...sheet.querySelectorAll('.rs-row')];
  const heights = [];
  rows.forEach((row, i) => {
    const box = row.getBoundingClientRect();
    heights.push(Math.round(box.height));
    if (row.scrollWidth - row.clientWidth > 1) clipped.push('row ' + (i + 1) + ' is ' + (row.scrollWidth - row.clientWidth) + ' px too wide');
    const face = row.querySelector('svg[data-clock]');
    if (face) {
      const f = face.getBoundingClientRect();
      if (f.width < 20) clipped.push('clock in row ' + (i + 1) + ' is only ' + f.width + ' px wide');
      if (f.top < box.top - 0.5 || f.bottom > box.bottom + 0.5 || f.left < box.left || f.right > box.right)
        clipped.push('clock in row ' + (i + 1) + ' sticks out of its row');
    }
  });
  for (const text of sheet.querySelectorAll('.rs-label, .rs-hint, .rs-time')) {
    if (text.scrollWidth - text.clientWidth > 1) clipped.push('text "' + text.textContent + '" overflows');
  }
  const faces = [...sheet.querySelectorAll('.rs-row svg[data-clock]')].filter((f) => f.getBoundingClientRect().width > 0);
  const leave = done ? [...done.querySelectorAll('svg[data-clock]')].filter((f) => f.getBoundingClientRect().width > 0) : [];
  if (leave.length && done) {
    const l = leave[0].getBoundingClientRect();
    const d = done.getBoundingClientRect();
    if (l.top < d.top - 0.5 || l.bottom > d.bottom + 0.5 || l.right > d.right + 0.5) clipped.push('leave clock sticks out of the done band');
  }
  return {
    clipped,
    rows: rows.length,
    faces: faces.length,
    leave: leave.length,
    leaveSize: leave.length ? Math.round(leave[0].getBoundingClientRect().width) : 0,
    faceSize: faces.length ? Math.round(faces[0].getBoundingClientRect().width) : 0,
    words: sheet.querySelectorAll('[data-time]').length,
    hidden: sheet.querySelectorAll('[data-clock-label]').length,
    heights,
    spare: Math.round(foot.top - (done ? done.getBoundingClientRect().bottom : rows[rows.length - 1].getBoundingClientRect().bottom)),
  };
})()`;

async function openTab(edge, url) {
  const { targetId } = await edge.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await edge.send('Target.attachToTarget', { targetId, flatten: true });
  await edge.send('Page.enable', {}, sessionId);
  const loaded = edge.once('Page.loadEventFired', sessionId);
  const nav = await edge.send('Page.navigate', { url }, sessionId);
  if (nav.errorText) throw new Error(`cannot open ${url}: ${nav.errorText}`);
  await loaded;
  const { result, exceptionDetails } = await edge.send(
    'Runtime.evaluate',
    { expression: WAIT_FOR_SHEET, awaitPromise: true, returnByValue: true },
    sessionId,
  );
  if (exceptionDetails) throw new Error(`page check failed: ${exceptionDetails.text}`);
  if (!result.value.ok) throw new Error(`${url}: ${result.value.reason}`);
  return { targetId, sessionId };
}

async function evaluate(edge, sessionId, expression) {
  const { result, exceptionDetails } = await edge.send(
    'Runtime.evaluate',
    { expression, awaitPromise: true, returnByValue: true },
    sessionId,
  );
  if (exceptionDetails) throw new Error(exceptionDetails.text);
  return result.value;
}

async function printPdf(edge, sessionId, out) {
  const { data } = await edge.send(
    'Page.printToPDF',
    { printBackground: true, preferCSSPageSize: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 },
    sessionId,
  );
  writeFileSync(out, Buffer.from(data, 'base64'));
}

async function fullPageShot(edge, sessionId, width, mobile, out) {
  await edge.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile }, sessionId);
  await sleep(600);
  const { cssContentSize } = await edge.send('Page.getLayoutMetrics', {}, sessionId);
  const height = Math.ceil(cssContentSize.height);
  const { data } = await edge.send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } },
    sessionId,
  );
  writeFileSync(out, Buffer.from(data, 'base64'));
  const overflowX = await evaluate(edge, sessionId, 'document.documentElement.scrollWidth - document.documentElement.clientWidth');
  return { height, overflowX };
}

/* ------------------------------------------------------------------ */
/* Check                                                               */
/* ------------------------------------------------------------------ */

async function checkStyle(edge, base, dir, style) {
  const tab = await openTab(edge, `${base}${PAGE}${HEAVIEST}${style.query}`);
  try {
    await edge.send('Emulation.setEmulatedMedia', { media: 'print' }, tab.sessionId);
    const m = await evaluate(edge, tab.sessionId, MEASURE_PRINT);
    await edge.send('Emulation.setEmulatedMedia', { media: '' }, tab.sessionId);
    console.log(
      `${style.name}: ${m.rows} rows (${m.heights.join(', ')} px), ${m.faces} clock faces` +
        `${m.faces ? ` at ${m.faceSize} px` : ''}, ${m.leave} leave clock${m.leave ? ` at ${m.leaveSize} px` : ''}, ${m.words} times in words, ${m.hidden} for screen readers only, ` +
        `${m.spare} px spare above the footer`,
    );
    if (m.clipped.length) throw new Error(`${style.name} is cut off: ${m.clipped.join('; ')}`);
    if (m.rows !== STEPS) throw new Error(`${style.name} shows ${m.rows} rows, expected ${STEPS}`);
    if (m.faces !== style.faces) throw new Error(`${style.name} shows ${m.faces} clock faces, expected ${style.faces}`);
    if (m.leave !== style.leave) throw new Error(`${style.name} shows ${m.leave} leave clocks, expected ${style.leave}`);
    if (m.words !== style.words) throw new Error(`${style.name} shows ${m.words} times in words, expected ${style.words}`);

    const pdf = join(dir, `morgen-uhr-${style.name}.pdf`);
    await printPdf(edge, tab.sessionId, pdf);
    const { pages, size } = pdfInfo(pdf);
    const png = pdfToPng(pdf, join(dir, `morgen-uhr-${style.name}`), 1240);
    console.log(`${style.name} PDF: ${pages} page(s), ${size} -> ${pdf}, ${png}`);
    if (pages !== 1) throw new Error(`${style.name} printed on ${pages} pages`);

    if (style.name === 'beides') {
      const phone = await fullPageShot(edge, tab.sessionId, 375, true, join(dir, 'morgenroutine-beides-375.png'));
      const desk = await fullPageShot(edge, tab.sessionId, 1280, false, join(dir, 'morgenroutine-beides-1280.png'));
      console.log(
        `screenshots: 375 px (${phone.height} px tall, x-overflow ${phone.overflowX}), 1280 px (${desk.height} px tall, x-overflow ${desk.overflowX})`,
      );
      if (phone.overflowX > 0) throw new Error(`the page scrolls sideways at 375 px by ${phone.overflowX} px`);
    }
    return m;
  } finally {
    await edge.send('Target.closeTarget', { targetId: tab.targetId }).catch(() => null);
  }
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

let server = null;
let edge = null;
const work = mkdtempSync(join(tmpdir(), 'ronki-morgen-uhr-'));

async function main() {
  let base = baseArg;
  if (!base) {
    console.log('> building website');
    const build = spawnSync('npm', ['run', 'build:web'], { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
    if (build.status !== 0) throw new Error('npm run build:web failed');
    if (await portAnswers(PORT)) throw new Error(`Port ${PORT} is busy. Pass --base instead.`);
    server = spawn('npx', ['vite', 'preview', '--config', 'website/vite.config.ts', '--port', String(PORT), '--strictPort'], {
      cwd: ROOT,
      stdio: 'ignore',
      shell: process.platform === 'win32',
    });
    const deadline = Date.now() + 90_000;
    while (!(await portAnswers(PORT))) {
      if (Date.now() > deadline) throw new Error(`vite preview did not answer on ${PORT}`);
      await sleep(400);
    }
    base = `http://localhost:${PORT}`;
  }

  const dir = resolve(outArg);
  mkdirSync(dir, { recursive: true });
  edge = await launchEdge(join(work, 'profile'));
  const results = {};
  for (const style of STYLES) results[style.name] = await checkStyle(edge, base, dir, style);

  // A face never makes a row taller than the same row with the time in words.
  for (const name of ['uhr', 'beides']) {
    results[name].heights.forEach((h, i) => {
      if (h > results.zahl.heights[i] + 1) {
        console.log(`note: row ${i + 1} is ${h - results.zahl.heights[i]} px taller with "${name}" than with "zahl"`);
      }
    });
  }
  console.log('all three styles print on one A4 page with nothing cut off');
}

main()
  .catch((err) => {
    console.error(`\n${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (edge) await edge.close();
    if (server) {
      if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
      else server.kill();
    }
    await sleep(300);
    rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  });
