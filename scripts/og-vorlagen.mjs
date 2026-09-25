// Share pictures (1200 x 630) for the four template pages.
//
// Why: a template link shared in WhatsApp or LinkedIn used to show the
// generic Ronki picture. Parents decide in the preview whether to tap, so the
// preview now shows the real sheet they will print.
//
// Renders one HTML card per template with headless Edge (same approach as
// scripts/print-vorlagen.mjs), then converts to JPG with ImageMagick.
// Output: website/public/og-vorlage-<slug>.jpg
//
// Run: node scripts/og-vorlagen.mjs

import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ROOT = resolve(import.meta.dirname, '..');
const PUBLIC = join(ROOT, 'website', 'public');

const CARDS = [
  { slug: 'morgenroutine', headline: 'Morgenroutine für Kinder', sub: 'Vier Schritte mit Bildern, zum Abhaken.' },
  { slug: 'abendroutine', headline: 'Abendroutine für Kinder', sub: 'Vier Schritte bis ins Bett, zum Abhaken.' },
  { slug: 'kleine-geschwister', headline: 'Routine für Kleinkinder', sub: 'Vier große Bilder, kein Text.' },
  { slug: 'adhs', headline: 'Morgenplan bei ADHS', sub: 'Sechs kleine Schritte, ein Bild pro Schritt.' },
];

const font = (file) => pathToFileURL(join(PUBLIC, 'fonts', file)).href;

function html({ slug, headline, sub }) {
  const preview = pathToFileURL(join(PUBLIC, 'vorlagen', 'previews', `${slug}.png`)).href;
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Jakarta'; font-weight: 500; src: url('${font('plus-jakarta-sans-500.woff2')}'); }
@font-face { font-family: 'Jakarta'; font-weight: 800; src: url('${font('plus-jakarta-sans-800.woff2')}'); }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
body { background: #fff8f1; font-family: 'Jakarta', sans-serif; color: #1f3f43; position: relative; }
.blob { position: absolute; right: -120px; top: -140px; width: 520px; height: 520px; border-radius: 50%; background: #fde589; opacity: .55; }
.sheet { position: absolute; left: 90px; top: 40px; height: 550px; transform: rotate(-3deg);
  box-shadow: 0 18px 40px rgba(31,63,67,.22), 0 2px 6px rgba(31,63,67,.12); border-radius: 6px; background: #fff; }
.text { position: absolute; left: 560px; right: 70px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; }
.eyebrow { font-weight: 800; font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: #2d5a5e; margin-bottom: 18px; }
h1 { font-weight: 800; font-size: 64px; line-height: 1.04; margin: 0 0 22px; }
.mark { background: linear-gradient(transparent 62%, #fcd34d 62%); }
p { font-weight: 500; font-size: 30px; line-height: 1.3; margin: 0; color: #1a1f1d; }
.foot { position: absolute; left: 560px; bottom: 44px; font-weight: 800; font-size: 26px; color: #2d5a5e; }
.foot span { font-weight: 500; color: #1a1f1d; }
</style></head><body>
<div class="blob"></div>
<img class="sheet" src="${preview}" alt="">
<div class="text">
  <div class="eyebrow">Kostenlos zum Ausdrucken</div>
  <h1><span class="mark">${headline}</span></h1>
  <p>${sub}</p>
</div>
<div class="foot">ronki.de <span>· ohne Anmeldung</span></div>
</body></html>`;
}

const work = mkdtempSync(join(tmpdir(), 'ronki-og-'));
try {
  for (const card of CARDS) {
    const page = join(work, `${card.slug}.html`);
    const png = join(work, `${card.slug}.png`);
    const jpg = join(PUBLIC, `og-vorlage-${card.slug}.jpg`);
    writeFileSync(page, html(card), 'utf8');
    const edge = spawnSync(EDGE, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
      '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=4000',
      `--screenshot=${png}`, pathToFileURL(page).href,
    ], { stdio: 'pipe' });
    if (edge.status !== 0 || !existsSync(png)) throw new Error(`Edge failed for ${card.slug}: ${edge.stderr}`);
    const magick = spawnSync('magick', [png, '-strip', '-quality', '86', jpg], { stdio: 'pipe' });
    if (magick.status !== 0) throw new Error(`ImageMagick failed for ${card.slug}: ${magick.stderr}`);
    console.log(`wrote ${jpg}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
