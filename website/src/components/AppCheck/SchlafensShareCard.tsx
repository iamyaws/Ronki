/**
 * 1200x675 share card for the Schlafens-Rechner result.
 *
 * Surfaces the four key clock times (Bildschirm aus, Bett-Vorbereiten,
 * Vorlesen, Bettzeit) plus a headline that ties them to the parent's
 * own input ("Mein 7-jähriges Kind sollte um 19:30 ins Bett."). Brand-
 * safe because every time on the card was computed from the parent's
 * own age + wake-up entry.
 */

import { useState } from 'react';
import type { ScheduleOutput } from '../../lib/schlafens-rechner/calculator';
import { ArrowRight } from './Icons';

interface Props {
  age: number;
  wakeUp: string;
  schedule: ScheduleOutput;
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

async function buildSchlafensCardPng({
  age,
  wakeUp,
  schedule,
}: Props): Promise<Blob> {
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
  ctx.fillText('RONKI · SCHLAFENS-RECHNER', 80, 70);

  // Headline
  ctx.fillStyle = COLORS.tealDark;
  ctx.font = 'bold 56px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`Mein ${age}-jähriges Kind`, 80, 120);
  ctx.fillText(`sollte um ${schedule.bedtime} ins Bett.`, 80, 188);

  // Sub
  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = '500 22px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.fillText(
    `Aufstehzeit ${wakeUp} · ${schedule.recommendation.recommendedHours} Stunden Schlaf empfohlen`,
    80,
    270,
  );

  // 4 time cards in a row
  const cardW = 245;
  const cardH = 140;
  const gap = 18;
  const rowY = 330;
  const totalW = cardW * 4 + gap * 3;
  const startX = (W - totalW) / 2;

  const cards: { label: string; time: string; tone: 'sage' | 'mustard' | 'teal' }[] = [
    { label: 'BILDSCHIRM AUS', time: schedule.screenOff, tone: 'sage' },
    { label: 'BETT-VORBEREITEN', time: schedule.bedtimePrep, tone: 'sage' },
    { label: 'VORLESEN', time: schedule.storyTime, tone: 'mustard' },
    { label: 'BETTZEIT', time: schedule.bedtime, tone: 'teal' },
  ];

  cards.forEach((c, i) => {
    const x = startX + i * (cardW + gap);
    // Card bg
    if (c.tone === 'teal') {
      ctx.fillStyle = COLORS.tealDark;
    } else if (c.tone === 'mustard') {
      ctx.fillStyle = 'rgba(253, 229, 137, 0.55)';
    } else {
      ctx.fillStyle = 'rgba(5, 68, 176, 0.18)';
    }
    roundRect(ctx, x, rowY, cardW, cardH, 16);
    ctx.fill();

    // Label
    ctx.fillStyle =
      c.tone === 'teal'
        ? 'rgba(255, 255, 255, 0.75)'
        : COLORS.teal;
    ctx.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(c.label, x + 18, rowY + 22);

    // Time
    ctx.fillStyle = c.tone === 'teal' ? COLORS.cream : COLORS.tealDark;
    ctx.font = 'bold 56px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(c.time, x + 18, rowY + 56);
  });

  // Bottom strip
  ctx.fillStyle = COLORS.tealDark;
  ctx.fillRect(0, H - 64, W, 64);
  ctx.fillStyle = COLORS.cream;
  ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('ronki.de/tools/schlafens-rechner', 80, H - 32);

  ctx.font = '500 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const tag = 'Schlafmedizin-Konsens, eingesetzt';
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

export function SchlafensShareCard(props: Props) {
  const [status, setStatus] = useState<'idle' | 'rendering' | 'error'>('idle');

  async function handleDownload() {
    try {
      setStatus('rendering');
      const blob = await buildSchlafensCardPng(props);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ronki-schlafens-rechner-${props.age}j-${props.wakeUp.replace(':', '')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5_000);
      setStatus('idle');
    } catch (err) {
      console.error('schlafens card render failed', err);
      setStatus('error');
    }
  }

  return (
    <div className="space-y-2">
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
            Baue Bild…
          </>
        ) : (
          <>
            Schlaf-Plan als Bild herunterladen
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
      <p className="text-xs text-ink/55 max-w-prose">
        Lädt eine 1200×675 Karte mit deinen Werten und allen vier Zeiten
        herunter. Nutzbar für LinkedIn, Instagram, WhatsApp oder einen
        Eltern-Chat.
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
