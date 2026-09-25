/**
 * Renders the finished Familien-Charter as both an on-screen preview
 * (printable via window.print()) and as a downloadable PNG via Canvas
 * API. Layout is A4-ish portrait (1240x1754 at print scale) so it
 * looks right hanging on the fridge.
 */

import { useState } from 'react';
import {
  ARTICLE_TITLES,
  GELD_LABELS,
  INHALT_LABELS,
  PAUSE_LABELS,
  PUSH_LABELS,
  WANN_LABELS,
  WO_LABELS,
  computeReviewDate,
  parseSignatures,
  type CharterAnswers,
} from '../../lib/familien-charter/charter';
import { ArrowRight } from './Icons';
import { CharterShareCard } from './CharterShareCard';

interface Props {
  answers: CharterAnswers;
}

const W = 1240;
const H = 1754;

const COLORS = {
  cream: '#FFFFFF',
  teal: '#040812',
  tealDark: '#0E2A2C',
  sage: '#0544B0',
  mustard: '#FDD134',
  ink: '#1A2022',
  inkSoft: 'rgba(26, 32, 34, 0.65)',
  hairline: 'rgba(4, 8, 18, 0.20)',
};

function todayISODate(): string {
  return new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function reviewISODate(): string {
  return computeReviewDate().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function familyHeading(answers: CharterAnswers): string {
  const name = answers.familyName.trim();
  if (name) return `Familie ${name}`;
  return 'Unsere Familie';
}

function bulletsFor(answers: CharterAnswers, kind: 'wann' | 'inhalte' | 'pausen'): string[] {
  if (kind === 'wann') return answers.wann.map((c) => WANN_LABELS[c]);
  if (kind === 'inhalte') return answers.inhalte.map((c) => INHALT_LABELS[c]);
  return answers.pausen.map((c) => PAUSE_LABELS[c]);
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
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
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

async function buildCharterPng(answers: CharterAnswers): Promise<Blob> {
  await ensureFontsReady();
  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctxRaw = canvas.getContext('2d');
  if (!ctxRaw) throw new Error('canvas-2d-unavailable');
  // Capture into a non-nullable local so TypeScript keeps the narrowing
  // through the inner-function closures below.
  const ctx: CanvasRenderingContext2D = ctxRaw;
  ctx.scale(dpr, dpr);

  // ────────────── Background layer ──────────────
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(0, 0, W, H);

  // Soft mustard glow top-left
  const tlGlow = ctx.createRadialGradient(120, 120, 30, 120, 120, 480);
  tlGlow.addColorStop(0, 'rgba(253, 209, 52, 0.30)');
  tlGlow.addColorStop(1, 'rgba(253, 209, 52, 0)');
  ctx.fillStyle = tlGlow;
  ctx.fillRect(0, 0, W, H);

  // Sage glow bottom-right
  const brGlow = ctx.createRadialGradient(W - 120, H - 200, 30, W - 120, H - 200, 520);
  brGlow.addColorStop(0, 'rgba(5, 68, 176, 0.25)');
  brGlow.addColorStop(1, 'rgba(5, 68, 176, 0)');
  ctx.fillStyle = brGlow;
  ctx.fillRect(0, 0, W, H);

  // ────────────── Top gradient stripe (4px) ──────────────
  // House ribbon: mustard → sage → teal across the full width, mirrors the
  // tool-card stripe so the page reads as part of the same family.
  const stripeH = 6;
  const stripe = ctx.createLinearGradient(0, 0, W, 0);
  stripe.addColorStop(0, COLORS.mustard);
  stripe.addColorStop(0.5, COLORS.sage);
  stripe.addColorStop(1, COLORS.teal);
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, W, stripeH);

  // ────────────── Inner double-frame ──────────────
  // 1px hairline rectangle inset 60px from each edge — gives the page
  // the "printed certificate" feel.
  const frameInset = 60;
  ctx.strokeStyle = COLORS.hairline;
  ctx.lineWidth = 1;
  ctx.strokeRect(
    frameInset,
    frameInset,
    W - frameInset * 2,
    H - frameInset * 2 - 70, // leave room for the bottom strip
  );

  // ────────────── Header ──────────────
  ctx.fillStyle = COLORS.teal;
  ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('HAUSVERFASSUNG · FAMILIEN-MEDIEN-CHARTER', 100, 100);

  // Family heading: split into "Familie " + name (sage italic) when name
  // is provided, so the brand's italic-sage signature device lands on
  // the part the parent actually owns.
  const fname = answers.familyName.trim();
  ctx.fillStyle = COLORS.tealDark;
  ctx.font = 'bold 64px "Plus Jakarta Sans", system-ui, sans-serif';
  if (fname) {
    const prefix = 'Familie ';
    ctx.fillText(prefix, 100, 140);
    const prefixW = ctx.measureText(prefix).width;
    ctx.fillStyle = COLORS.sage;
    ctx.font = 'italic bold 64px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(fname, 100 + prefixW, 140);
  } else {
    ctx.fillStyle = COLORS.sage;
    ctx.font = 'italic bold 64px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('Unsere', 100, 140);
    const unsereW = ctx.measureText('Unsere').width;
    ctx.fillStyle = COLORS.tealDark;
    ctx.font = 'bold 64px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(' Familie', 100 + unsereW, 140);
  }

  // Wofür italic line — the artifact's emotional anchor when filled.
  // Wraps at full body width since the printed PDF has no sticker on
  // the right side to dodge.
  let headerCursor = 220;
  const wofuerText = answers.wofuer.trim();
  if (wofuerText) {
    ctx.fillStyle = 'rgba(14, 42, 44, 0.85)';
    ctx.font = 'italic 600 22px "Plus Jakarta Sans", system-ui, sans-serif';
    const wofLines = wrapText(ctx, wofuerText, W - 200);
    for (const line of wofLines.slice(0, 3)) {
      ctx.fillText(line, 100, headerCursor);
      headerCursor += 30;
    }
    headerCursor += 8;
  }

  // Child-count subline
  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = '500 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    `${answers.childCount} ${answers.childCount === 1 ? 'Kind' : 'Kinder'} · auf eine Seite gebracht`,
    100,
    headerCursor,
  );

  // (No mustard date sticker on the printed PDF — the dates live in the
  // dedication line, the review-cadence line, and the bottom strip
  // already. The sticker is an on-screen reminder for the parent, not
  // part of the printed Hausverfassung.)

  // Hairline divider below header
  ctx.fillStyle = COLORS.hairline;
  const dividerY = Math.max(headerCursor + 50, 290);
  ctx.fillRect(100, dividerY, W - 200, 1);

  let y = dividerY + 40;

  /**
   * Article renderer with Roman-numeral prefix in sage. The numeral
   * sits in front of the title separated by a small vertical hairline,
   * giving the page the feel of a real Verfassung document.
   */
  function article(numeral: string, title: string, render: () => void) {
    // Numeral
    ctx.fillStyle = COLORS.sage;
    ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(numeral, 100, y);
    const numW = ctx.measureText(numeral).width;
    // Hairline separator
    ctx.fillStyle = COLORS.hairline;
    ctx.fillRect(100 + numW + 10, y + 2, 1, 16);
    // Title (oath)
    ctx.fillStyle = COLORS.teal;
    ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(title.toUpperCase(), 100 + numW + 22, y + 2);
    y += 38;
    render();
    y += 26;
  }

  /**
   * Items render as plain stacked paragraphs (no bullet marks). Each
   * label is already a full sentence ending in a period, so a list
   * marker would be redundant — and looked inconsistent when only one
   * item was selected per article.
   */
  function bulletList(items: string[]) {
    ctx.fillStyle = COLORS.ink;
    ctx.font = '500 22px "Be Vietnam Pro", system-ui, sans-serif';
    for (const item of items) {
      const lines = wrapText(ctx, item, W - 200);
      let lineY = y;
      for (const line of lines) {
        ctx.fillText(line, 100, lineY);
        lineY += 32;
      }
      y = lineY + 8;
    }
  }

  function paragraph(text: string) {
    ctx.fillStyle = COLORS.ink;
    ctx.font = '500 22px "Be Vietnam Pro", system-ui, sans-serif';
    const lines = wrapText(ctx, text, W - 200);
    for (const line of lines) {
      ctx.fillText(line, 100, y);
      y += 32;
    }
  }

  article('I', ARTICLE_TITLES.wann, () => bulletList(bulletsFor(answers, 'wann')));
  article('II', ARTICLE_TITLES.wo, () => paragraph(WO_LABELS[answers.wo]));
  article('III', ARTICLE_TITLES.inhalte, () =>
    bulletList(bulletsFor(answers, 'inhalte')),
  );
  article('IV', ARTICLE_TITLES.geld, () => paragraph(GELD_LABELS[answers.geld]));
  article('V', ARTICLE_TITLES.push, () => paragraph(PUSH_LABELS[answers.push]));
  if (answers.pausen.length > 0) {
    article('VI', ARTICLE_TITLES.pausen, () => bulletList(bulletsFor(answers, 'pausen')));
  }

  // Versprechen pull-quote — sage-tinted band, matching the on-screen
  // figure treatment.
  const versprechen = answers.versprechen.trim();
  if (versprechen) {
    y += 6;
    const pqX = 100;
    const pqW = W - 200;
    const pqStartY = y;
    // Background
    ctx.fillStyle = 'rgba(5, 68, 176, 0.12)';
    // We need to know the height before we draw the background, so
    // measure the wrapped text height first, then draw the box, then
    // draw the text inside.
    ctx.font = 'italic 600 24px "Be Vietnam Pro", system-ui, sans-serif';
    const quotedText = `„${versprechen}"`;
    const pqLines = wrapText(ctx, quotedText, pqW - 56);
    const pqContentH = 56 /* eyebrow + gap */ + pqLines.length * 36 + 28;
    roundRect(ctx, pqX, pqStartY, pqW, pqContentH, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(5, 68, 176, 0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, pqX, pqStartY, pqW, pqContentH, 16);
    ctx.stroke();
    // Eyebrow with VII numeral
    ctx.fillStyle = COLORS.sage;
    ctx.font = 'bold 14px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(`VII   ${ARTICLE_TITLES.versprechen.toUpperCase()}`, pqX + 28, pqStartY + 22);
    // Quote body
    ctx.fillStyle = COLORS.tealDark;
    ctx.font = 'italic 600 24px "Be Vietnam Pro", system-ui, sans-serif';
    let pqY = pqStartY + 56;
    for (const line of pqLines) {
      ctx.fillText(line, pqX + 28, pqY);
      pqY += 36;
    }
    y = pqStartY + pqContentH + 24;
  }

  // ────────────── Review-cadence + dedication + signature block ──────────────
  // Anchored to the bottom of the page so it always reads as the closing
  // gesture, regardless of how much content sat above it.
  const namesParsed = parseSignatures(answers.signatures);
  const sigBlockTop = H - 320;

  // Review-cadence line
  ctx.fillStyle = 'rgba(14, 42, 44, 0.65)';
  ctx.font = 'italic 500 18px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.fillText(
    `Wir lesen das am ${reviewISODate()} nochmal. Vielleicht ändern wir was, vielleicht auch nicht.`,
    100,
    sigBlockTop,
  );

  // Dedication line, italic — drops the .toLowerCase() that was a German
  // grammar bug ("familie müller" lowercase mid-sentence).
  ctx.fillStyle = 'rgba(14, 42, 44, 0.78)';
  ctx.font = 'italic 600 22px "Plus Jakarta Sans", system-ui, sans-serif';
  const ded = `Aufgeschrieben am ${todayISODate()}, von und für ${familyHeading(answers)}.`;
  ctx.fillText(ded, 100, sigBlockTop + 36);

  // "Wer hier unterschreibt" anchor line + signature lines
  ctx.fillStyle = COLORS.teal;
  ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    'WER HIER UNTERSCHREIBT, HÄLT SICH DRAN. AUCH DIE ERWACHSENEN.',
    100,
    sigBlockTop + 90,
  );

  ctx.strokeStyle = COLORS.hairline;
  ctx.lineWidth = 1;
  const sigRowY = sigBlockTop + 160;
  if (namesParsed.length > 0) {
    const cols = Math.min(2, namesParsed.length);
    const sigW = (W - 200 - 40 * (cols - 1)) / cols;
    const rowGap = 60;
    for (let i = 0; i < namesParsed.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 100 + col * (sigW + 40);
      const yLine = sigRowY + row * rowGap;
      // Eyebrow ABOVE the line (name as small label, line stays empty
      // for the actual signature)
      ctx.fillStyle = 'rgba(14, 42, 44, 0.7)';
      ctx.font = '600 12px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(namesParsed[i].toUpperCase(), x, yLine - 16);
      // Empty signature line
      ctx.beginPath();
      ctx.moveTo(x, yLine);
      ctx.lineTo(x + sigW, yLine);
      ctx.stroke();
    }
  } else {
    // Fallback: generic two-column eyebrow + line layout
    const cols = 2;
    const sigW = (W - 240) / cols;
    for (let col = 0; col < cols; col++) {
      const x = 100 + col * (sigW + 40);
      ctx.fillStyle = 'rgba(14, 42, 44, 0.7)';
      ctx.font = '600 12px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(col === 0 ? 'ERWACHSENE' : 'KINDER', x, sigRowY - 16);
      ctx.beginPath();
      ctx.moveTo(x, sigRowY);
      ctx.lineTo(x + sigW, sigRowY);
      ctx.stroke();
    }
  }

  // ────────────── Bottom teal strip ──────────────
  ctx.fillStyle = COLORS.tealDark;
  ctx.fillRect(0, H - 70, W, 70);
  ctx.fillStyle = COLORS.cream;
  ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('ronki.de · Hausverfassung', 100, H - 35);

  // Right-aligned page indicator
  ctx.font = '600 14px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const pageTag = `STAND ${todayISODate()} · SEITE 1 / 1`;
  const pageTagW = ctx.measureText(pageTag).width;
  ctx.fillText(pageTag, W - 100 - pageTagW, H - 35);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob-empty'))),
      'image/png',
      0.95,
    );
  });
}

/**
 * Tiny rounded-rect helper used by the date sticker. Same shape as the
 * one in CharterShareCard, kept local so the file has no cross-file
 * dependency for canvas geometry.
 */
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

export function CharterPreview({ answers }: Props) {
  const [status, setStatus] = useState<'idle' | 'rendering' | 'error'>('idle');

  async function handleDownload() {
    try {
      setStatus('rendering');
      const blob = await buildCharterPng(answers);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = (answers.familyName || 'familie')
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '');
      a.download = `familien-medien-charter-${slug || 'familie'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5_000);
      setStatus('idle');
    } catch (err) {
      console.error('charter render failed', err);
      setStatus('error');
    }
  }

  function handlePrint() {
    if (typeof window !== 'undefined') window.print();
  }

  const wann = bulletsFor(answers, 'wann');
  const inhalte = bulletsFor(answers, 'inhalte');
  const pausen = bulletsFor(answers, 'pausen');
  const signatureNames = parseSignatures(answers.signatures);
  const wofuer = answers.wofuer.trim();
  const versprechen = answers.versprechen.trim();
  const today = todayISODate();
  const review = reviewISODate();

  /**
   * Articles rendered in the two-column grid. Roman numerals are tied to
   * each article's NAME, not its grid position — so even when an optional
   * article (Pausen / Versprechen) is missing, the remaining numerals
   * stay stable. That's the way a real Verfassung numbers its articles:
   * Article IV is always Article IV, regardless of whether Article III
   * was rendered above it.
   *
   * Versprechen is intentionally NOT in this list — it gets a full-width
   * pull-quote treatment below the grid because it's the artifact's
   * emotional pivot and doesn't deserve to be one cell among six.
   */
  const articles: Array<{
    numeral: string;
    title: string;
    body?: string;
    items?: string[];
  }> = [
    { numeral: 'I', title: ARTICLE_TITLES.wann, items: wann },
    { numeral: 'II', title: ARTICLE_TITLES.wo, body: WO_LABELS[answers.wo] },
    { numeral: 'III', title: ARTICLE_TITLES.inhalte, items: inhalte },
    { numeral: 'IV', title: ARTICLE_TITLES.geld, body: GELD_LABELS[answers.geld] },
    { numeral: 'V', title: ARTICLE_TITLES.push, body: PUSH_LABELS[answers.push] },
  ];
  if (pausen.length > 0) {
    articles.push({ numeral: 'VI', title: ARTICLE_TITLES.pausen, items: pausen });
  }

  /**
   * Family heading split: when a name is provided, render the surname
   * with italic-sage emphasis (the brand's signature device, otherwise
   * reserved for H1 nouns). Without a name, italic-sage falls on the
   * "Unsere" word so the heading still carries the painterly flourish.
   */
  const fname = answers.familyName.trim();

  return (
    <div className="space-y-6">
      {/*
        On-screen preview. Also drives window.print(): the @media print
        block at the bottom hides everything outside .charter-preview.

        Composition (from outside in):
          1. Outer relative wrapper with painterly accent stripe at top
             plus mustard TL + sage BR background glows (mirroring the
             canvas PDF render, so screen and print feel like one
             artifact).
          2. Inner double-frame: outer card + nested inner border, so
             the page reads as a printed certificate, not a UI card.
          3. Tilted two-line mustard date sticker, top-right of header —
             "STAND DD.MM" + "WIR PRÜFEN AM DD.MM" (4 months out). The
             revisit date converts the artifact from "permanent verdict"
             into "checkpoint," which family-ritual research shows
             roughly quadruples its functional half-life on the fridge.
      */}
      <div
        className="charter-preview relative rounded-2xl bg-cream/95 border border-teal/15 shadow-sm overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 88% 12%, rgba(253, 209, 52, 0.18) 0%, transparent 55%), radial-gradient(circle at 8% 92%, rgba(5, 68, 176, 0.14) 0%, transparent 60%)',
        }}
      >
        {/* Top accent ribbon — house gradient stripe */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-mustard via-sage to-teal"
        />

        {/* Inner double-frame */}
        <div className="m-2.5 sm:m-3 rounded-xl border border-teal/20 px-6 py-7 sm:px-9 sm:py-9 space-y-7">
          {/* Header with two-line tilted date stamp. The right-side
              padding makes room for the sticker on screen; in print
              mode the stylesheet below removes the sticker AND drops
              this padding so the header text reflows full-width. */}
          <header className="charter-header relative pr-32 sm:pr-36 space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-teal font-semibold">
              Hausverfassung{' '}
              <span className="text-teal/40 mx-1">·</span>{' '}
              <span className="text-teal/70">
                Familien-Medien-Charter
              </span>
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight">
              {fname ? (
                <>
                  Familie{' '}
                  <em className="italic text-sage not-italic-fix">{fname}</em>
                </>
              ) : (
                <>
                  <em className="italic text-sage not-italic-fix">Unsere</em>{' '}
                  Familie
                </>
              )}
            </h2>
            {wofuer ? (
              <p className="font-display italic text-base sm:text-lg text-ink/85 leading-snug max-w-prose">
                {wofuer}
              </p>
            ) : null}
            <p className="text-sm text-ink/65">
              {answers.childCount === 1 ? '1 Kind' : `${answers.childCount} Kinder`}{' '}
              · auf eine Seite gebracht
            </p>
            {/* Two-line mustard date stamp — on-screen reminder only,
                hidden in print (the dates still appear in the
                dedication, review-cadence, and bottom-strip lines). */}
            <div
              aria-hidden
              className="charter-date-sticker absolute right-0 top-0 -rotate-3 flex flex-col items-center"
            >
              <div className="rounded-md bg-mustard/90 ring-1 ring-mustard/60 shadow-sm px-3 py-1.5 text-center min-w-[7rem]">
                <p className="text-[9px] uppercase tracking-[0.18em] text-ink/80 font-semibold leading-tight">
                  Stand
                </p>
                <p className="text-sm font-display font-bold text-ink tabular-nums leading-tight">
                  {today}
                </p>
                <span className="block h-px bg-teal-dark/15 my-1" aria-hidden />
                <p className="text-[9px] uppercase tracking-[0.18em] text-ink/80 font-semibold leading-tight">
                  Wir prüfen am
                </p>
                <p className="text-sm font-display font-bold text-ink tabular-nums leading-tight">
                  {review}
                </p>
              </div>
              <p className="rotate-3 text-[9px] uppercase tracking-[0.16em] text-ink/40 font-medium mt-1.5">
                Nicht im Druck
              </p>
            </div>
          </header>

          <hr className="border-teal/15" />

          {/* Two-column article grid — reads like a magazine spread.
              Roman numerals on each section eyebrow give the page rhythm
              and make scanning back to "Article IV" actually possible. */}
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
            {articles.map((a) => (
              <CharterArticle
                key={a.numeral}
                numeral={a.numeral}
                title={a.title}
                body={a.body}
                items={a.items}
              />
            ))}
          </div>

          {/* Versprechen pull-quote — the artifact's emotional pivot. The
              parent wrote this themselves, so it earns full-width sage
              band treatment instead of being one cell among six in the
              grid above. */}
          {versprechen ? (
            <figure className="rounded-2xl bg-sage/12 ring-1 ring-inset ring-sage/30 px-6 py-6 sm:px-8 sm:py-7 m-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-sage font-bold mb-3">
                <span className="font-display font-extrabold mr-2">VII</span>
                {ARTICLE_TITLES.versprechen}
              </p>
              <blockquote className="font-display italic font-semibold text-lg sm:text-xl text-ink leading-snug max-w-prose">
                <span aria-hidden className="text-sage/55 text-2xl leading-none mr-1">
                  „
                </span>
                {versprechen}
                <span aria-hidden className="text-sage/55 text-2xl leading-none ml-1">
                  "
                </span>
              </blockquote>
            </figure>
          ) : null}

          {/* Review-cadence line + dedication */}
          <div className="space-y-2 pt-2">
            <p className="text-sm italic text-ink/65 max-w-prose leading-relaxed">
              Wir lesen das am {review} nochmal. Vielleicht ändern wir was,
              vielleicht auch nicht.
            </p>
            <p className="font-display italic text-base text-ink/80 leading-snug max-w-prose">
              Aufgeschrieben am {today}, von und für{' '}
              {fname ? `Familie ${fname}` : 'unsere Familie'}.
            </p>
          </div>

          <hr className="border-teal/15" />

          {/* Signature block — name as eyebrow above empty line, so the
              act of signing means physically writing your name onto the
              line, not signing on top of pre-printed authority. */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] text-teal font-semibold">
              Wer hier unterschreibt, hält sich dran. Auch die Erwachsenen.
            </p>
            {signatureNames.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6 pt-3">
                {signatureNames.map((name) => (
                  <div key={name} className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-ink/70 font-semibold">
                      {name}
                    </p>
                    <span className="block border-b border-teal/35 h-7" aria-hidden />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6 pt-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-ink/70 font-semibold">
                    Erwachsene
                  </p>
                  <span className="block border-b border-teal/35 h-7" aria-hidden />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-ink/70 font-semibold">
                    Kinder
                  </p>
                  <span className="block border-b border-teal/35 h-7" aria-hidden />
                </div>
              </div>
            )}
          </div>

          {/* Practical footer line — kept inside the cream area, above
              the dark band, so it reads as advice from the document
              rather than brand chrome. */}
          <p className="font-display italic text-sm text-ink/75 leading-snug max-w-prose pt-2">
            Wenn euch was schwerfällt: gilt nicht als Versagen. Gilt als
            Punkt zwei der nächsten Verfassung.
          </p>
        </div>

        {/* Bottom teal-dark band — full-bleed, mirrors the canvas PDF.
            Closes the page with weight instead of a tiny right-aligned
            URL line, so the on-screen and screenshot states match the
            printed PDF. */}
        <div className="bg-teal-dark px-6 sm:px-9 py-4 flex items-center justify-between text-cream/90 charter-bottom-strip">
          <p className="font-display font-bold text-sm tracking-wide">
            ronki.de
            <span className="text-cream/40 mx-2">·</span>
            Hausverfassung
          </p>
          <p className="font-display text-[11px] tracking-[0.18em] uppercase text-cream/70 tabular-nums hidden sm:block">
            Stand {today}
            <span className="text-cream/30 mx-2">·</span>
            Seite 1 / 1
          </p>
        </div>
      </div>

      {/* Action buttons (hidden in print) */}
      <div className="flex flex-wrap gap-3 no-print">
        <button
          type="button"
          onClick={handleDownload}
          disabled={status === 'rendering'}
          className="group inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3 text-cream font-display font-semibold text-sm shadow-sm hover:bg-teal hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {status === 'rendering' ? (
            <>
              <span
                aria-hidden
                className="inline-block w-3.5 h-3.5 rounded-full border-2 border-cream/30 border-t-cream animate-spin"
              />
              Baue Bild…
            </>
          ) : (
            <>
              Als Bild herunterladen
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-full border border-teal/30 px-6 py-3 text-sm text-ink font-display font-semibold hover:bg-teal-dark hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
        >
          Als PDF drucken
        </button>
      </div>

      {status === 'error' && (
        <p role="alert" className="text-sm text-ink">
          Bild-Erzeugung hat nicht geklappt. Versuch es bitte gleich noch
          mal.
        </p>
      )}

      {/* Second download path: 1200x675 LinkedIn social card. The full
          A4 charter goes on the fridge; the social card goes in feeds. */}
      <div className="pt-2 border-t border-teal/10">
        <CharterShareCard answers={answers} />
      </div>

      {/* Print-only stylesheet: hide everything except .charter-preview.
          Force color rendering so the gradient ribbon, sage pull-quote,
          signature lines, and bottom teal strip all actually print
          instead of getting flattened to white by browser default
          print modes.

          The mustard date sticker is INTENTIONALLY hidden in print:
          it's an on-screen reminder for the parent (when generated +
          when to revisit), but the printed Hausverfassung shouldn't
          carry that UI scaffolding. The dates still appear in the
          dedication line, the review-cadence line, and the bottom
          strip — printout has the info three times over without the
          sticker chrome. */}
      <style>{`
        .charter-bottom-strip {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media print {
          html, body {
            background: #FFFFFF !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body * { visibility: hidden; }
          .charter-preview, .charter-preview * { visibility: visible; }
          .charter-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #FFFFFF !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .charter-date-sticker {
            display: none !important;
            visibility: hidden !important;
          }
          .charter-header {
            padding-right: 0 !important;
          }
          .charter-bottom-strip {
            background: #0E2A2C !important;
            color: #FFFFFF !important;
          }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
}

/**
 * One article in the Hausverfassung. Roman numeral + oath title +
 * body/bullets. The numeral sits in front of the title in sage as a
 * tiny serial number, the way a real Verfassung article reads
 * (Article I, Article II, etc.) — gives the page rhythm and makes
 * scanning back to a specific article actually possible.
 *
 * Items render as plain stacked paragraphs (no bullet marks). Each
 * label in charter.ts is already a full sentence ending in a period,
 * so a list-marker would be redundant — and inconsistent visually
 * when only a single item is selected for an article.
 */
function CharterArticle({
  numeral,
  title,
  body,
  items,
}: {
  numeral: string;
  title: string;
  body?: string;
  items?: string[];
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-baseline gap-2.5 text-xs uppercase tracking-[0.18em] text-teal font-semibold">
        <span className="font-display font-extrabold text-sage text-[15px] tabular-nums leading-none">
          {numeral}
        </span>
        <span className="border-l border-teal/20 pl-2.5">{title}</span>
      </h3>
      {body && (
        <p className="text-base text-ink/85 leading-relaxed max-w-prose">
          {body}
        </p>
      )}
      {items && items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <p
              key={item}
              className="text-base text-ink/85 leading-relaxed max-w-prose"
            >
              {item}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
