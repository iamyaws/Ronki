/**
 * 1200x675 LinkedIn / Open-Graph share card for the Familien-Medien-
 * Charter. Different shape than the printable A4 portrait: this one is
 * built for social feeds, surfaces the family + 3 key decisions, and
 * stops there. Same brand visual grammar as the app-check ShareCard.
 */

import { useState } from 'react';
import {
  GELD_LABELS,
  PAUSE_LABELS,
  PUSH_LABELS,
  WANN_LABELS,
  WO_LABELS,
  type CharterAnswers,
} from '../../lib/familien-charter/charter';
import { ArrowRight } from './Icons';

interface Props {
  answers: CharterAnswers;
}

const W = 1200;
const H = 675;

const COLORS = {
  cream: '#FFFFFF',
  teal: '#040812',
  tealDark: '#0E2A2C',
  sage: '#0544B0',
  mustard: '#FDD134',
  ink: '#1A2022',
  inkSoft: 'rgba(26, 32, 34, 0.65)',
};

function familyHeading(answers: CharterAnswers): string {
  const name = answers.familyName.trim();
  if (name) return `Familie ${name}`;
  return 'Unsere Familie';
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function ensureFontsReady(): Promise<void> {
  if (typeof document === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fonts = (document as any).fonts;
  if (!fonts || typeof fonts.ready?.then !== 'function') return;
  try {
    await fonts.ready;
  } catch {
    /* ignore */
  }
}

/**
 * Picks up to three short highlights from the charter answers to put
 * on the social card. Order matters: pull the most concrete, "this
 * makes you go 'oh interesting'" decisions first.
 */
function pickHighlights(answers: CharterAnswers): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];

  // First selected wann choice (most specific time slot decision)
  if (answers.wann.length > 0) {
    out.push({
      label: 'Wann',
      value: WANN_LABELS[answers.wann[0]] +
        (answers.wann.length > 1
          ? ` (+${answers.wann.length - 1})`
          : ''),
    });
  }

  // Wo
  out.push({ label: 'Wo', value: WO_LABELS[answers.wo].split(',')[0] });

  // Geld
  out.push({
    label: 'Geld',
    value: GELD_LABELS[answers.geld].split('.')[0],
  });

  // Push (only if not the all-aus default — defaults are less interesting)
  if (answers.push !== 'alle-aus' && out.length < 4) {
    out.push({
      label: 'Push',
      value: PUSH_LABELS[answers.push].split('.')[0],
    });
  }

  // Pause (if any)
  if (answers.pausen.length > 0 && out.length < 4) {
    out.push({
      label: 'Pause',
      value: PAUSE_LABELS[answers.pausen[0]] +
        (answers.pausen.length > 1
          ? ` (+${answers.pausen.length - 1})`
          : ''),
    });
  }

  return out.slice(0, 4);
}

async function buildCharterSocialPng(answers: CharterAnswers): Promise<Blob> {
  await ensureFontsReady();
  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctxRaw = canvas.getContext('2d');
  if (!ctxRaw) throw new Error('canvas-2d-unavailable');
  const ctx: CanvasRenderingContext2D = ctxRaw;
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(0, 0, W, H);

  // Mustard glow top-left
  const tl = ctx.createRadialGradient(180, 140, 40, 180, 140, 380);
  tl.addColorStop(0, 'rgba(253, 209, 52, 0.32)');
  tl.addColorStop(1, 'rgba(253, 209, 52, 0)');
  ctx.fillStyle = tl;
  ctx.fillRect(0, 0, W, H);

  // Sage glow bottom-right
  const br = ctx.createRadialGradient(W - 200, H - 160, 40, W - 200, H - 160, 420);
  br.addColorStop(0, 'rgba(5, 68, 176, 0.30)');
  br.addColorStop(1, 'rgba(5, 68, 176, 0)');
  ctx.fillStyle = br;
  ctx.fillRect(0, 0, W, H);

  // Eyebrow
  ctx.fillStyle = COLORS.teal;
  ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('RONKI · FAMILIEN-MEDIEN-CHARTER', 80, 70);

  // Family heading
  ctx.fillStyle = COLORS.tealDark;
  ctx.font = 'bold 72px "Plus Jakarta Sans", system-ui, sans-serif';
  const headLines = wrapText(ctx, familyHeading(answers), 1040);
  let hy = 120;
  for (const line of headLines.slice(0, 2)) {
    ctx.fillText(line, 80, hy);
    hy += 80;
  }

  // Subline
  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = '500 24px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.fillText(
    'Wir haben unsere Bildschirm-Regeln auf eine Seite gebracht.',
    80,
    hy + 8,
  );

  // Highlight chips, two columns
  const highlights = pickHighlights(answers);
  const colWidth = 510;
  const rowHeight = 92;
  const startX = 80;
  const startY = hy + 75;
  highlights.forEach((h, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = startX + col * (colWidth + 30);
    const y = startY + row * (rowHeight + 14);

    // Chip box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeStyle = 'rgba(4, 8, 18, 0.18)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, colWidth, rowHeight, 14);
    ctx.fill();
    ctx.stroke();

    // Label
    ctx.fillStyle = COLORS.teal;
    ctx.font = '600 14px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(h.label.toUpperCase(), x + 18, y + 16);

    // Value (truncate to one line for layout safety)
    ctx.fillStyle = COLORS.tealDark;
    ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
    const valueLines = wrapText(ctx, h.value, colWidth - 36);
    ctx.fillText(valueLines[0], x + 18, y + 42);
    if (valueLines.length > 1) {
      ctx.fillText(valueLines[1], x + 18, y + 64);
    }
  });

  // Bottom strip
  ctx.fillStyle = COLORS.tealDark;
  ctx.fillRect(0, H - 64, W, 64);
  ctx.fillStyle = COLORS.cream;
  ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('ronki.de/tools/familien-charter', 80, H - 32);

  ctx.font = '500 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const tag = 'Eltern bauen ihre eigenen Regeln';
  const tagW = ctx.measureText(tag).width;
  ctx.fillText(tag, W - 80 - tagW, H - 32);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob-empty'))),
      'image/png',
      0.95,
    );
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function CharterShareCard({ answers }: Props) {
  const [status, setStatus] = useState<'idle' | 'rendering' | 'error'>('idle');

  async function handleDownload() {
    try {
      setStatus('rendering');
      const blob = await buildCharterSocialPng(answers);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = (answers.familyName || 'familie')
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '');
      a.download = `ronki-familien-charter-social-${slug || 'familie'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5_000);
      setStatus('idle');
    } catch (err) {
      console.error('charter social card render failed', err);
      setStatus('error');
    }
  }

  return (
    <div className="space-y-2 no-print">
      <button
        type="button"
        onClick={handleDownload}
        disabled={status === 'rendering'}
        className="group inline-flex items-center gap-2 rounded-full border border-teal/30 bg-cream px-5 py-3 text-sm text-ink font-display font-semibold hover:bg-teal-dark hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'rendering' ? (
          <>
            <span
              aria-hidden
              className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
            />
            Baue Social-Card…
          </>
        ) : (
          <>
            Social-Card für LinkedIn herunterladen
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
      <p className="text-xs text-ink/55 max-w-prose">
        Lädt eine zweite Karte im 1200×675 Format herunter, optimiert für
        LinkedIn, X und Instagram-Posts. Die volle A4-Charter bleibt für den
        Kühlschrank.
      </p>
      {status === 'error' && (
        <p role="alert" className="text-sm text-ink">
          Bild-Erzeugung hat nicht geklappt. Versuch es bitte gleich noch
          mal.
        </p>
      )}
    </div>
  );
}
