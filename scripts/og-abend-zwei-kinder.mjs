#!/usr/bin/env node
/**
 * Share picture (1200 x 630) for /tools/abend-mit-zwei-kindern, and a check
 * that the heaviest plans still print on one A4 page.
 *
 * Share picture: opens the tool with an example evening in headless Edge,
 * prints it to PDF (the page prints only the sheet), renders page 1 with
 * pdftoppm and lays it into the same Bilderbuch card as
 * scripts/og-nachmittagsplan.mjs: white ground, sky-wash blob, the sheet
 * tilted with sun tape, Fredoka headline, Gochi Hand sticker.
 * Output: website/public/og-tool-abend-zwei-kinder.jpg
 *
 * Check (--check <dir>): opens the worst case (six steps per child, each
 * with an own step of 24 characters, every step marked "braucht dich",
 * different lights-out times, two steps done together) and the tallest
 * overview (twelve steps that never share a row). For both it fails if the
 * overview, a card, a label or the page is cut off, prints to PDF and fails
 * on more than one page. Writes the PDFs, PNGs of them and full-page
 * screenshots of the tool at 375 px and 1280 px into <dir> to look at by eye.
 *
 * Same approach as scripts/og-nachmittagsplan.mjs: Edge over the DevTools
 * protocol, no dependencies. Needs pdftoppm, pdfinfo (poppler) and magick.
 *
 * Usage:
 *   node scripts/og-abend-zwei-kinder.mjs                 build, serve on 4177, write the JPG
 *   node scripts/og-abend-zwei-kinder.mjs --base http://localhost:4193
 *   node scripts/og-abend-zwei-kinder.mjs --base http://localhost:4193 --check <dir> [--no-og]
 */

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const PUBLIC = join(ROOT, 'website', 'public');
const OG_OUT = join(PUBLIC, 'og-tool-abend-zwei-kinder.jpg');
const PORT = 4177;
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TOOL = '/tools/abend-mit-zwei-kindern';

// A usual evening that fits with one adult: the Stern-Kind listens to a
// Hörspiel while the adult reads to the Mond-Kind, then comes back for
// "Licht aus". Dinner and teeth together.
const EXAMPLE = '?s=azwho&sa=1940&sm=20.3.3.20.1&sb=azo&m=azylo&mb=azlo&z=az';

// Two own steps of 24 characters (one a single long word that has to break).
const OWN_STAR = 'Nachtlichtbatterietausch';
const OWN_MOON = 'Gute-Nacht-Lied zu zweit';

// Six steps per child, all "braucht dich", lights out at 20:00 and 19:45,
// dinner and teeth together at the same time. Two adults, so it prints.
const WORST =
  `?a=2&s=azxlho&se=${encodeURIComponent(OWN_STAR)}&sa=2000&sb=azlhox` +
  `&m=azwyxo&me=${encodeURIComponent(OWN_MOON)}&ma=1945&mm=20.3.3.3.9.1&mb=azwyox&z=az`;

// Twelve steps that never share a five-minute row, with the longest hints
// of the catalogue on the cards: the tallest overview and the tallest cards.
const TALLEST =
  `?s=gpnyxo&se=${encodeURIComponent(OWN_STAR)}&sa=1830&sm=5.5.5.5.5.1&sb=gpnyxo` +
  `&m=gpesxo&me=${encodeURIComponent(OWN_MOON)}&ma=2100&mm=5.5.5.5.5.1&mb=gpesxo`;

/* ------------------------------------------------------------------ */
/* Args                                                                */
/* ------------------------------------------------------------------ */

const argv = process.argv.slice(2);
const flagValue = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};
const baseArg = flagValue('--base');
const checkDir = flagValue('--check');
const writeOg = !argv.includes('--no-og');

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

function pdfPages(path) {
  return Number(/Pages:\s+(\d+)/.exec(must('pdfinfo', [path], 'pdfinfo'))?.[1] ?? 0);
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
      '--allow-file-access-from-files',
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

// Resolves once the sheet is on the page, the fonts are in and every image
// has loaded and decoded.
const WAIT_FOR_SHEET = `(async () => {
  const deadline = Date.now() + 30000;
  while (!document.querySelector('.az-print .az-sheet')) {
    if (Date.now() > deadline) return { ok: false, reason: 'the sheet never rendered' };
    await new Promise((r) => setTimeout(r, 100));
  }
  await Promise.all([
    document.fonts.load("700 38px 'Fredoka'"),
    document.fonts.load("600 13px 'Fredoka'"),
    document.fonts.load("27px 'Gochi Hand'"),
    document.fonts.load("500 13px 'Plus Jakarta Sans'"),
  ]);
  await document.fonts.ready;
  const images = [...document.images];
  await Promise.all(images.map((img) => img.complete ? null : new Promise((r) => {
    img.addEventListener('load', r, { once: true });
    img.addEventListener('error', r, { once: true });
  })));
  await Promise.all(images.map((img) => img.decode().catch(() => null)));
  const broken = images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src);
  return { ok: broken.length === 0, reason: 'images did not load: ' + broken.join(', '), images: images.length };
})()`;

// Runs in print media. The overview, both cards, every label and the page
// must show all of their content, and the footer must sit inside the sheet.
const MEASURE_PRINT = `(() => {
  const root = document.querySelector('.az-print');
  const clipped = [];
  const sheet = root.querySelector('.az-sheet');
  if (!sheet || sheet.getBoundingClientRect().height < 100) return { clipped: ['the sheet is not shown'], rows: 0, cards: 0 };
  const page = root.querySelector('.rs-page');
  if (page.scrollHeight - page.clientHeight > 1) clipped.push('page by ' + (page.scrollHeight - page.clientHeight) + ' px');
  const foot = root.querySelector('.rs-foot').getBoundingClientRect();
  if (foot.bottom > sheet.getBoundingClientRect().bottom + 0.5) clipped.push('footer below the sheet');
  for (const box of root.querySelectorAll('.az-over, .az-rows, [data-card]')) {
    const name = box.dataset.card ? box.dataset.card + ' card' : box.className;
    const over = box.scrollHeight - box.clientHeight;
    const wide = box.scrollWidth - box.clientWidth;
    if (over > 1) clipped.push(name + ' by ' + over + ' px');
    if (wide > 1) clipped.push(name + ' is ' + wide + ' px too wide');
  }
  for (const text of root.querySelectorAll('.az-label, .az-time, .az-col-name, .az-col-aus, .az-card-label, .az-card-hint, .az-card-time, .az-band')) {
    if (text.scrollWidth - text.clientWidth > 1) clipped.push('text "' + text.textContent + '" overflows');
  }
  // The last row of the overview must end inside it.
  const over = root.querySelector('.az-over').getBoundingClientRect();
  const rows = [...root.querySelectorAll('.az-row')];
  const last = rows[rows.length - 1];
  if (last && last.getBoundingClientRect().bottom > over.bottom + 0.5) clipped.push('last overview row below the box');
  const spare = Math.round(over.bottom - (last ? last.getBoundingClientRect().bottom : over.top));
  return { clipped, rows: rows.length, cards: root.querySelectorAll('[data-card]').length, spare };
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
/* Share picture                                                       */
/* ------------------------------------------------------------------ */

const font = (file) => pathToFileURL(join(PUBLIC, 'fonts', file)).href;

function ogHtml(previewPng) {
  const preview = pathToFileURL(previewPng).href;
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Fredoka'; font-weight: 300 700; src: url('${font('fredoka-latin.woff2')}'); }
@font-face { font-family: 'Gochi'; src: url('${font('gochi-hand-latin.woff2')}'); }
@font-face { font-family: 'Jakarta'; font-weight: 500; src: url('${font('plus-jakarta-sans-500.woff2')}'); }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
body { background: #ffffff; font-family: 'Jakarta', sans-serif; color: #040812; position: relative; }
.blob { position: absolute; left: 30px; top: 70px; width: 520px; height: 500px; background: #b9e3fc;
  border-radius: 46% 54% 58% 42% / 52% 44% 56% 48%; transform: rotate(-8deg); }
.sheet { position: absolute; left: 110px; top: 44px; height: 540px; transform: rotate(-3deg);
  border: 3px solid #040812; border-radius: 14px; background: #fff; }
.tape { position: absolute; left: 150px; top: 26px; width: 130px; height: 38px; background: #fdd134; opacity: .9;
  transform: rotate(4deg); border-radius: 4px; }
.text { position: absolute; left: 600px; right: 60px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; }
.sticker { align-self: flex-start; font-family: 'Gochi'; font-size: 30px; text-transform: uppercase; background: #fdd134; color: #040812;
  padding: 8px 20px 6px; border-radius: 10px; transform: rotate(-3deg); margin-bottom: 26px; }
h1 { font-family: 'Fredoka'; font-weight: 700; font-size: 62px; line-height: 1.02; letter-spacing: -0.01em; margin: 0 0 22px; }
.under { background: linear-gradient(transparent 72%, #fdd134 72%, #fdd134 92%, transparent 92%); }
p { font-size: 30px; line-height: 1.3; margin: 0; }
.foot { position: absolute; left: 600px; bottom: 44px; font-family: 'Fredoka'; font-weight: 700; font-size: 30px; color: #0544b0; }
.foot span { font-family: 'Jakarta'; font-weight: 500; color: #040812; font-size: 26px; }
</style></head><body>
<div class="blob"></div>
<img class="sheet" src="${preview}" alt="">
<div class="tape"></div>
<div class="text">
  <div class="sticker">Kostenlos zum Ausdrucken</div>
  <h1><span class="under">Abend mit zwei Kindern</span></h1>
  <p>Wer braucht wann deine Hilfe? Beide Abende auf einem Blatt.</p>
</div>
<div class="foot">ronki.de <span>· ohne Anmeldung</span></div>
</body></html>`;
}

async function renderOg(edge, base, work) {
  const tab = await openTab(edge, `${base}${TOOL}${EXAMPLE}`);
  const pdf = join(work, 'example.pdf');
  try {
    await printPdf(edge, tab.sessionId, pdf);
  } finally {
    await edge.send('Target.closeTarget', { targetId: tab.targetId }).catch(() => null);
  }
  if (pdfPages(pdf) !== 1) throw new Error('example sheet did not print on one page');
  const png = pdfToPng(pdf, join(work, 'example'), 662);

  const page = join(work, 'og.html');
  const shot = join(work, 'og.png');
  writeFileSync(page, ogHtml(png), 'utf8');
  const edgeShot = spawnSync(
    EDGE,
    [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
      '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=4000',
      `--user-data-dir=${join(work, 'og-profile')}`, `--screenshot=${shot}`, pathToFileURL(page).href,
    ],
    { stdio: 'pipe' },
  );
  if (edgeShot.status !== 0) throw new Error(`Edge screenshot failed: ${edgeShot.stderr}`);
  must('magick', [shot, '-strip', '-quality', '86', OG_OUT], 'magick');
  console.log(`wrote ${OG_OUT}`);
}

/* ------------------------------------------------------------------ */
/* Worst-case check                                                    */
/* ------------------------------------------------------------------ */

async function measureCase(edge, base, name, search) {
  const tab = await openTab(edge, `${base}${TOOL}${search}`);
  try {
    await edge.send('Emulation.setEmulatedMedia', { media: 'print' }, tab.sessionId);
    const measured = await evaluate(edge, tab.sessionId, MEASURE_PRINT);
    await edge.send('Emulation.setEmulatedMedia', { media: '' }, tab.sessionId);
    console.log(`${name}: ${measured.rows} overview rows, ${measured.cards} cards, ${measured.spare} px spare in the overview`);
    if (measured.clipped.length) throw new Error(`${name} is cut off: ${measured.clipped.join('; ')}`);
    if (measured.cards !== 2) throw new Error(`${name} shows ${measured.cards} cards, expected 2`);
    return tab;
  } catch (err) {
    await edge.send('Target.closeTarget', { targetId: tab.targetId }).catch(() => null);
    throw err;
  }
}

async function printCase(edge, tab, dir, name) {
  const pdf = join(dir, `abend-zwei-kinder-${name}.pdf`);
  await printPdf(edge, tab.sessionId, pdf);
  const pages = pdfPages(pdf);
  const png = pdfToPng(pdf, join(dir, `abend-zwei-kinder-${name}`), 1240);
  console.log(`${name} PDF: ${pages} page(s) -> ${pdf}, ${png}`);
  if (pages !== 1) throw new Error(`${name} printed on ${pages} pages`);
}

async function checkWorstCase(edge, base, dir) {
  mkdirSync(dir, { recursive: true });
  const example = await measureCase(edge, base, 'example', EXAMPLE);
  await edge.send('Target.closeTarget', { targetId: example.targetId }).catch(() => null);

  const tallest = await measureCase(edge, base, 'tallest', TALLEST);
  try {
    await printCase(edge, tallest, dir, 'tallest');
  } finally {
    await edge.send('Target.closeTarget', { targetId: tallest.targetId }).catch(() => null);
  }

  const tab = await measureCase(edge, base, 'worst-case', WORST);
  try {
    await printCase(edge, tab, dir, 'worst-case');
    const phone = await fullPageShot(edge, tab.sessionId, 375, true, join(dir, 'tool-375.png'));
    const desk = await fullPageShot(edge, tab.sessionId, 1280, false, join(dir, 'tool-1280.png'));
    console.log(`screenshots: 375 px (${phone.height} px tall, x-overflow ${phone.overflowX}), 1280 px (${desk.height} px tall, x-overflow ${desk.overflowX})`);
    if (phone.overflowX > 0) throw new Error(`the page scrolls sideways at 375 px by ${phone.overflowX} px`);
  } finally {
    await edge.send('Target.closeTarget', { targetId: tab.targetId }).catch(() => null);
  }
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

let server = null;
let edge = null;
const work = mkdtempSync(join(tmpdir(), 'ronki-abend-zwei-'));

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

  edge = await launchEdge(join(work, 'profile'));
  if (checkDir) await checkWorstCase(edge, base, resolve(checkDir));
  if (writeOg) await renderOg(edge, base, work);
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
