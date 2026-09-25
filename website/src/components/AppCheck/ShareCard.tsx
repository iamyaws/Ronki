/**
 * Auto-generated PNG quote card for sharing an app-check result on
 * LinkedIn / Instagram / WhatsApp / X.
 *
 * Renders to an offscreen Canvas at 1200x675 (16:9 OG card size), then
 * triggers a download. Uses the same brand colors and font stack as
 * the rest of the site so it reads as a Ronki artifact even without
 * the watermark.
 *
 * Brand-safe content: the card surfaces the parent's score + band +
 * one key "what this app teaches" line drawn from the parent's
 * flagged answers. No Ronki-asserted claim about the app.
 */

import { useState } from 'react';
import { QUESTIONS, type AnswersMap } from '../../lib/app-check/questions';
import { bandForScore } from '../../lib/app-check/score';
import { ArrowRight } from './Icons';

interface Props {
  appName: string;
  answers: AnswersMap;
  score: number;
}

const CARD_W = 1200;
const CARD_H = 675;

const COLORS = {
  cream: '#FFFFFF',
  teal: '#040812',
  tealDark: '#0E2A2C',
  sage: '#0544B0',
  mustard: '#FDD134',
  ink: '#1A2022',
  inkSoft: 'rgba(26, 32, 34, 0.65)',
};

function pickHeadlineLearning(answers: AnswersMap): string | null {
  // Priority order — the patterns most parents find most striking.
  const priority: Array<keyof typeof QUESTIONS_BY_ID> = [
    'q1', // streaks
    'q4', // cosmetics
    'q6', // playable ads
    'q3', // reward economy
    'q8', // mechanic vs content
    'q2', // push
    'q7', // leaderboards
    'q10', // no end signal
    'q5', // ads
    'q9', // data
  ];
  const QUESTIONS_BY_ID: Record<string, typeof QUESTIONS[number]> = Object.fromEntries(
    QUESTIONS.map((q) => [q.id, q]),
  );
  for (const id of priority) {
    const q = QUESTIONS_BY_ID[id];
    if (!q) continue;
    const v = answers[q.id];
    if (!v || v === 'unklar') continue;
    if (q.scoreContribution(v) === 1) {
      return q.teaches;
    }
  }
  return null;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
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
    // Graceful fallback to system fonts; shouldn't happen.
  }
}

async function buildCardPng(props: Props): Promise<Blob> {
  await ensureFontsReady();

  const dpr = 2; // crisp on retina + LinkedIn upscales
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W * dpr;
  canvas.height = CARD_H * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-2d-unavailable');
  ctx.scale(dpr, dpr);

  const band = bandForScore(props.score);

  // Background — warm cream
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Soft mustard glow (top-left)
  const tlGlow = ctx.createRadialGradient(180, 140, 40, 180, 140, 380);
  tlGlow.addColorStop(0, 'rgba(253, 209, 52, 0.32)');
  tlGlow.addColorStop(1, 'rgba(253, 209, 52, 0)');
  ctx.fillStyle = tlGlow;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Soft sage glow (bottom-right)
  const brGlow = ctx.createRadialGradient(
    CARD_W - 200,
    CARD_H - 160,
    40,
    CARD_W - 200,
    CARD_H - 160,
    420,
  );
  brGlow.addColorStop(0, 'rgba(5, 68, 176, 0.30)');
  brGlow.addColorStop(1, 'rgba(5, 68, 176, 0)');
  ctx.fillStyle = brGlow;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Top eyebrow
  ctx.fillStyle = COLORS.teal;
  ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('RONKI · APP-CHECK', 80, 70);

  // App name (small)
  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = '500 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`Bewertete App: ${props.appName}`, 80, 110);

  // Big score
  ctx.fillStyle = COLORS.tealDark;
  ctx.font = 'bold 200px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(String(props.score), 80, 170);

  // Score denominator
  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = '500 28px "Plus Jakarta Sans", system-ui, sans-serif';
  const scoreWidth = ctx.measureText(String(props.score)).width;
  // Re-measure with the bigger font
  ctx.font = 'bold 200px "Plus Jakarta Sans", system-ui, sans-serif';
  const bigScoreW = ctx.measureText(String(props.score)).width;
  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = '500 28px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('/ 10 Pattern', 80 + bigScoreW + 14, 290);
  ctx.fillText('beobachtet', 80 + bigScoreW + 14, 322);

  // Band label
  ctx.fillStyle = COLORS.tealDark;
  ctx.font = 'bold 38px "Plus Jakarta Sans", system-ui, sans-serif';
  const bandLines = wrapText(ctx, band.label, 1040);
  let bandY = 410;
  for (const line of bandLines) {
    ctx.fillText(line, 80, bandY);
    bandY += 50;
  }

  // Teaches line, if any
  const teaches = pickHeadlineLearning(props.answers);
  if (teaches) {
    ctx.fillStyle = COLORS.teal;
    ctx.font = 'italic 24px "Be Vietnam Pro", system-ui, sans-serif';
    const teachesLines = wrapText(ctx, teaches, 1040);
    let ty = bandY + 28;
    for (const line of teachesLines) {
      ctx.fillText(line, 80, ty);
      ty += 32;
    }
  }

  // Bottom strip
  const stripY = CARD_H - 64;
  ctx.fillStyle = COLORS.tealDark;
  ctx.fillRect(0, stripY, CARD_W, 64);

  ctx.fillStyle = COLORS.cream;
  ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('ronki.de/tools/app-check', 80, stripY + 32);

  ctx.font = '500 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const ctaText = 'Eltern-Check für Kinder-Apps';
  const ctaW = ctx.measureText(ctaText).width;
  ctx.fillText(ctaText, CARD_W - 80 - ctaW, stripY + 32);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob-empty'))),
      'image/png',
      0.95,
    );
  });
}

export function ShareCard(props: Props) {
  const [status, setStatus] = useState<'idle' | 'rendering' | 'error'>('idle');

  async function handleDownload() {
    try {
      setStatus('rendering');
      const blob = await buildCardPng(props);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = props.appName
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);
      a.download = `ronki-app-check-${slug || 'bewertung'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5_000);
      setStatus('idle');
    } catch (err) {
      console.error('share-card render failed', err);
      setStatus('error');
    }
  }

  return (
    <div className="space-y-3">
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
            Bild zum Teilen herunterladen
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
      <p className="text-xs text-ink/55 max-w-prose">
        Lädt eine PNG-Karte (1200×675) mit deinem Score und einer
        Schlüssel-Erkenntnis herunter. Nutzbar für LinkedIn, Instagram,
        WhatsApp oder ein Eltern-Chat.
      </p>
      {status === 'error' && (
        <p role="alert" className="text-sm text-ink">
          Bild-Erzeugung hat nicht geklappt. Versuch es bitte gleich noch
          mal, oder mach einen Screenshot der Result-Seite.
        </p>
      )}
    </div>
  );
}
