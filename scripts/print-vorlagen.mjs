#!/usr/bin/env node
/**
 * Renders the four Vorlagen print routes to A4 PDFs in website/public/vorlagen/.
 *
 * Why headless Edge and not Playwright or Puppeteer: Edge ships with Windows,
 * prints to PDF from the command line and needs no install. Node 24, no deps.
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
import { mkdirSync, statSync } from 'node:fs';
import { createConnection } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const OUT_DIR = resolve(ROOT, 'website/public/vorlagen');
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
  const probe = spawnSync('pdfinfo', [path], { encoding: 'utf8', shell: true });
  if (probe.status !== 0 || !probe.stdout) return null;
  const pages = /Pages:\s+(\d+)/.exec(probe.stdout)?.[1] ?? '?';
  const size = /Page size:\s+(.+)/.exec(probe.stdout)?.[1]?.trim() ?? '?';
  return { pages, size };
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

let server = null;

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
  const written = [];

  for (const { route, file } of TEMPLATES) {
    const out = resolve(OUT_DIR, file);
    const url = `${base}${route}`;
    // Profile outside public/, otherwise the next build copies it into dist.
    const profile = resolve(tmpdir(), `ronki-edge-${file.replace(/\W+/g, '-')}`);

    const result = spawnSync(
      EDGE,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${profile}`,
        '--no-pdf-header-footer',
        `--print-to-pdf=${out}`,
        '--virtual-time-budget=12000',
        url,
      ],
      { stdio: 'inherit' },
    );

    if (result.status !== 0) {
      throw new Error(`Edge failed for ${url} (exit ${result.status})`);
    }
    written.push({ file, out });
    console.log(`  ${route} -> website/public/vorlagen/${file}`);
  }

  console.log('\nResult');
  for (const { file, out } of written) {
    const bytes = statSync(out).size;
    const kb = (bytes / 1024).toFixed(1);
    const info = pdfInfo(out);
    const detail = info ? `${info.pages} page(s), ${info.size}` : 'pdfinfo not available';
    console.log(`  ${file.padEnd(26)} ${String(kb).padStart(7)} KB   ${detail}`);
  }
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
  .catch((err) => {
    console.error(`\n${err.message}`);
    stopServer();
    process.exit(1);
  });
