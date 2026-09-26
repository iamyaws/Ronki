#!/usr/bin/env node
/**
 * Renders the four Vorlagen print routes to A4 PDFs in website/public/vorlagen/
 * and a preview picture of each PDF in website/public/vorlagen/previews/.
 *
 * The sheets carry pictures now (the drawn task pictures and Ronki), so the
 * script waits until the sheet is on the page, the fonts are loaded and
 * every image has loaded and decoded before it prints. A broken image stops
 * the run instead of shipping a PDF with a hole in it.
 *
 * Why headless Edge: it ships with Windows and needs no install. The script
 * drives it over the DevTools protocol (Node 24 has WebSocket built in), so
 * it can wait for the real page state instead of guessing a time budget.
 * No deps.
 *
 * Previews: pdftoppm (poppler) renders page 1 of each PDF at 662 x 936, the
 * size the template pages and scripts/og-vorlagen.mjs expect.
 *
 * Usage:
 *   node scripts/print-vorlagen.mjs
 *       Builds the website, starts vite preview on 4174, prints, stops it again.
 *
 *   node scripts/print-vorlagen.mjs --base http://localhost:5174
 *       Uses a server that is already running (dev or preview) and skips the build.
 *
 *   node scripts/print-vorlagen.mjs --keep-server
 *       Leaves the preview server running afterwards (handy while iterating).
 */

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const OUT_DIR = resolve(ROOT, 'website/public/vorlagen');
const PREVIEW_DIR = resolve(OUT_DIR, 'previews');
const PREVIEW_SIZE = { width: 662, height: 936 };
const PORT = 4174;
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const TEMPLATES = [
  { route: '/print/vorlage-morgen', file: 'morgenroutine.pdf' },
  { route: '/print/vorlage-abend', file: 'abendroutine.pdf' },
  { route: '/print/vorlage-kleine-geschwister', file: 'kleine-geschwister.pdf' },
  { route: '/print/vorlage-adhs', file: 'adhs.pdf' },
];

/* ------------------------------------------------------------------ */
/* Args                                                                */
/* ------------------------------------------------------------------ */

const argv = process.argv.slice(2);
function flagValue(name) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
}
const baseArg = flagValue('--base');
const keepServer = argv.includes('--keep-server');

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// vite preview binds to localhost, which on Windows resolves to ::1 only.
// Probing 127.0.0.1 alone reports the server as down, so try both stacks.
const HOSTS = ['127.0.0.1', '::1'];

function hostAnswers(host, port) {
  return new Promise((resolveHost) => {
    const socket = createConnection({ host, port });
    const done = (ok) => {
      socket.destroy();
      resolveHost(ok);
    };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    setTimeout(() => done(false), 1000);
  });
}

async function portAnswers(port) {
  for (const host of HOSTS) {
    if (await hostAnswers(host, port)) return true;
  }
  return false;
}

async function waitForPort(port, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await portAnswers(port)) return true;
    await sleep(400);
  }
  return false;
}

function run(cmd, args, label) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function pdfInfo(path) {
  const probe = spawnSync('pdfinfo', [path], { encoding: 'utf8' });
  if (probe.status !== 0 || !probe.stdout) return null;
  const pages = /Pages:\s+(\d+)/.exec(probe.stdout)?.[1] ?? '?';
  const size = /Page size:\s+(.+)/.exec(probe.stdout)?.[1]?.trim() ?? '?';
  return { pages, size };
}

function pdfFontFamilies(path) {
  const probe = spawnSync('pdffonts', [path], { encoding: 'utf8' });
  if (probe.status !== 0 || !probe.stdout) return null;
  const names = probe.stdout
    .split(/\r?\n/)
    .slice(2)
    .map((line) => line.split(/\s+/)[0]?.replace(/^[A-Z]{6}\+/, ''))
    .filter(Boolean);
  return [...new Set(names.map((n) => n.split('-')[0]))];
}

/** Page 1 of the PDF as a PNG preview, via pdftoppm. */
function renderPreview(pdfPath) {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  const name = basename(pdfPath, '.pdf');
  const outBase = resolve(PREVIEW_DIR, name);
  const result = spawnSync(
    'pdftoppm',
    [
      '-png',
      '-singlefile',
      '-f',
      '1',
      '-scale-to-x',
      String(PREVIEW_SIZE.width),
      '-scale-to-y',
      String(PREVIEW_SIZE.height),
      pdfPath,
      outBase,
    ],
    { stdio: 'pipe', encoding: 'utf8' },
  );
  if (result.status !== 0) {
    throw new Error(`pdftoppm failed for ${name}: ${result.stderr || result.error}`);
  }
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
  await new Promise((resolveOpen, reject) => {
    ws.addEventListener('open', resolveOpen, { once: true });
    ws.addEventListener('error', () => reject(new Error(`cannot connect to ${wsUrl}`)), { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  const waiters = [];
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolveCall, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
      else resolveCall(msg.result);
      return;
    }
    for (const waiter of [...waiters]) {
      if (waiter.method === msg.method && waiter.sessionId === msg.sessionId) {
        waiters.splice(waiters.indexOf(waiter), 1);
        waiter.resolveEvent(msg.params);
      }
    }
  });

  const send = (method, params = {}, sessionId) =>
    new Promise((resolveCall, reject) => {
      const id = ++nextId;
      pending.set(id, { resolveCall, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });

  const once = (method, sessionId, timeoutMs = 30_000) =>
    new Promise((resolveEvent, reject) => {
      const waiter = { method, sessionId, resolveEvent };
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

// Runs inside the page. Resolves once the sheet is rendered, the sheet
// fonts are loaded and every image has loaded and decoded.
const WAIT_FOR_SHEET = `(async () => {
  const deadline = Date.now() + 30000;
  while (!document.querySelector('.rs-sheet')) {
    if (Date.now() > deadline) return { ok: false, reason: 'the sheet never rendered' };
    await new Promise((r) => setTimeout(r, 100));
  }
  await Promise.all([
    document.fonts.load("700 48px 'Fredoka'"),
    document.fonts.load("600 17px 'Fredoka'"),
    document.fonts.load("20px 'Gochi Hand'"),
    document.fonts.load("500 14px 'Plus Jakarta Sans'"),
  ]);
  await document.fonts.ready;
  const images = [...document.images];
  await Promise.all(images.map((img) => img.complete ? null : new Promise((r) => {
    img.addEventListener('load', r, { once: true });
    img.addEventListener('error', r, { once: true });
  })));
  await Promise.all(images.map((img) => img.decode().catch(() => null)));
  const broken = images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src);
  const fonts = [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')))];
  return { ok: broken.length === 0, reason: broken.length ? 'images did not load: ' + broken.join(', ') : '', images: images.length, fonts };
})()`;

async function printRoute(edge, url, out) {
  const { targetId } = await edge.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await edge.send('Target.attachToTarget', { targetId, flatten: true });
  try {
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
    const state = result.value;
    if (!state.ok) throw new Error(`${url}: ${state.reason}`);

    const { data } = await edge.send(
      'Page.printToPDF',
      {
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
      },
      sessionId,
    );
    writeFileSync(out, Buffer.from(data, 'base64'));
    return state;
  } finally {
    await edge.send('Target.closeTarget', { targetId }).catch(() => null);
  }
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

let server = null;
let edge = null;

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  let base = baseArg;

  if (!base) {
    console.log('> building website');
    run('npm', ['run', 'build:web'], 'npm run build:web');

    if (await portAnswers(PORT)) {
      throw new Error(
        `Port ${PORT} is already in use. Stop that server or pass --base http://localhost:${PORT}.`,
      );
    }

    console.log(`> starting vite preview on ${PORT}`);
    server = spawn(
      'npx',
      [
        'vite',
        'preview',
        '--config',
        'website/vite.config.ts',
        '--port',
        String(PORT),
        '--strictPort',
      ],
      { cwd: ROOT, stdio: 'ignore', shell: process.platform === 'win32' },
    );

    const up = await waitForPort(PORT);
    if (!up) throw new Error(`vite preview did not answer on port ${PORT}`);
    base = `http://localhost:${PORT}`;
  }

  console.log(`> printing from ${base}`);
  // Profile outside public/, otherwise the next build copies it into dist.
  const profile = resolve(tmpdir(), 'ronki-edge-print-vorlagen');
  edge = await launchEdge(profile);
  const written = [];

  for (const { route, file } of TEMPLATES) {
    const out = resolve(OUT_DIR, file);
    const state = await printRoute(edge, `${base}${route}`, out);
    const preview = renderPreview(out);
    written.push({ file, out, state });
    console.log(
      `  ${route} -> website/public/vorlagen/${file} (${state.images} images loaded), previews/${basename(preview)}`,
    );
  }

  await edge.close();
  edge = null;

  console.log('\nResult');
  let problems = 0;
  for (const { file, out } of written) {
    const kb = (statSync(out).size / 1024).toFixed(1);
    const info = pdfInfo(out);
    const fonts = pdfFontFamilies(out);
    const detail = info ? `${info.pages} page(s), ${info.size}` : 'pdfinfo not available';
    console.log(`  ${file.padEnd(26)} ${String(kb).padStart(7)} KB   ${detail}`);
    if (fonts) console.log(`  ${''.padEnd(26)} fonts: ${fonts.join(', ')}`);
    if (info && info.pages !== '1') {
      console.error(`  ! ${file} has ${info.pages} pages, expected 1`);
      problems++;
    }
    if (fonts && !(fonts.some((f) => f.startsWith('Fredoka')) && fonts.some((f) => f.startsWith('GochiHand')))) {
      console.error(`  ! ${file} is missing Fredoka or Gochi Hand`);
      problems++;
    }
  }
  if (problems) throw new Error(`${problems} problem(s) in the printed sheets`);
}

function stopServer() {
  if (!server || keepServer) return;
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' });
    } else {
      server.kill('SIGTERM');
    }
  } catch {
    // Nothing to do, the process is already gone.
  }
  server = null;
}

main()
  .then(() => {
    stopServer();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(`\n${err.message}`);
    if (edge) await edge.close();
    stopServer();
    process.exit(1);
  });
