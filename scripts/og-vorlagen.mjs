// Share pictures (1200 x 630) for the four template pages, Bilderbuch style.
//
// Why: a template link shared in WhatsApp or LinkedIn used to show the
// generic Ronki picture. Parents decide in the preview whether to tap, so the
// preview now shows the real sheet they will print.
//
// Look follows docs/design-briefs/2026-09-16-bilderbuch-design-system.md:
// white ground, ink outlines instead of shadows, Fredoka Bold headline, a sun
// sticker label in Gochi Hand, sun only as decoration, one sky-wash blob.
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
@font-face { font-family: 'Fredoka'; font-weight: 300 700; src: url('${font('fredoka-latin.woff2')}'); }
@font-face { font-family: 'Gochi'; src: url('${font('gochi-hand-latin.woff2')}'); }
@font-face { font-family: 'Jakarta'; font-weight: 500; src: url('${font('plus-jakarta-sans-500.woff2')}'); }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
body { background: #ffffff; font-family: 'Jakarta', sans-serif; color: #040812; position: relative; }
.blob { position: absolute; left: 30px; top: 70px; width: 520px; height: 500px; background: #b9e3fc;
  border-radius: 46% 54% 58% 42% / 52% 44% 56% 48%; transform: rotate(-8deg); }
.sheet { position: absolute; left: 110px; top: 44px; height: 540px; transform: rotate(-3deg);
  border: 3px solid #040812; border-radius: 14px; background: #fff; }
.tape { position: absolute; left: 172px; top: 26px; width: 130px; height: 38px; background: #fdd134; opacity: .9;
  transform: rotate(4deg); border-radius: 4px; }
.text { position: absolute; left: 600px; right: 60px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; }
.sticker { align-self: flex-start; font-family: 'Gochi'; font-size: 30px; text-transform: uppercase; background: #fdd134; color: #040812;
  padding: 8px 20px 6px; border-radius: 10px; transform: rotate(-3deg); margin-bottom: 26px; }
h1 { font-family: 'Fredoka'; font-weight: 700; font-size: 68px; line-height: 1.02; letter-spacing: -0.01em; margin: 0 0 22px; }
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
  <h1><span class="under">${headline}</span></h1>
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
