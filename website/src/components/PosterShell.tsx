/**
 * Shared print-ready A4 poster shell.
 *
 * Each concrete poster (Hort, Bäckerei, Kinderarzt, Zähne, Anti-Engagement,
 * etc.) is a thin component that instantiates this shell with its own data.
 * Keeps layout + print-CSS + theme variables in one place so new variants
 * can be added in a few lines.
 *
 * Optional `phoneScreenshot` prop swaps the hero for a phone-frame with a
 * real app screenshot inside. When omitted, only the painterly hero renders.
 */

import { ReactNode, useEffect } from 'react';
import { PhoneMockup } from './PhoneMockup';

type PosterTheme = 'warm' | 'evening' | 'morning' | 'quiet' | 'cool' | 'bold';

type PhoneMockupVariant =
  | 'morgen-anchor'
  | 'zahne-quest'
  | 'nacht-anchor'
  | 'mood-grid'
  | 'clean-aufgaben';

export interface PosterStep {
  content: ReactNode;
}

export interface PosterConfig {
  /** Small uppercase caption above the wordmark */
  eyebrow: string;
  /** Massive top headline */
  headline: ReactNode;
  /** One-line subline under the headline */
  subline: ReactNode;
  /** Multi-sentence body paragraph */
  body: ReactNode;
  /** Short intro above the numbered step list */
  ctaHeading: string;
  /** Optional bridge line between ctaHeading and steps (for posters that need
   *  a practical fallback when the step list isn't action-oriented, e.g.
   *  Kinderarzt shows academic sources but still wants an 'try the app' prompt). */
  ctaBridge?: ReactNode;
  /** 3-4 numbered steps */
  steps: PosterStep[];
  /** Small grey footer line below the steps */
  footer: string;
  /** Painterly hero image path (e.g. /art/companion/dragon-baby.webp) */
  heroSrc: string;
  heroAlt?: string;
  /** Optional phone-frame inset with app screenshot — overlays bottom-right.
   *  Prefer `phoneMockup` for crisp vector UI; this is kept as a raster fallback. */
  phoneScreenshot?: {
    src: string;
    caption?: string;
  };
  /** Preferred: inline HTML/CSS mockup of an app screen. Print-crisp, no
   *  resolution issues. When set, takes precedence over phoneScreenshot. */
  phoneMockup?: {
    variant: PhoneMockupVariant;
    caption?: string;
  };
  /** QR code destination path on ronki.de (default: /installieren) */
  qrPath?: string;
  /** Color palette variant */
  theme: PosterTheme;
}

const QR_BASE =
  'https://api.qrserver.com/v1/create-qr-code/?size=800x800&format=png&margin=8';

export function PosterShell({ config }: { config: PosterConfig }) {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  const qrTarget = encodeURIComponent(
    `https://www.ronki.de${config.qrPath || '/installieren'}`,
  );
  const qrColor = config.theme === 'bold' ? 'fdf8f0' : '1a3c3f';
  const qrBg = config.theme === 'bold' ? '1a3c3f' : 'fdf8f0';
  const qrUrl = `${QR_BASE}&data=${qrTarget}&color=${qrColor}&bgcolor=${qrBg}`;

  return (
    <div className="print-root">
      {/* ── Instruction bar (hidden in print) ─────────────────────── */}
      <div className="no-print">
        <strong style={{ fontWeight: 700 }}>A4-Poster Druckvorschau</strong>
        <span style={{ opacity: 0.7, marginLeft: 12 }}>
          Cmd/Ctrl + P &middot; Papierformat: A4 &middot; Ränder: Keine &middot;
          Hintergrundgrafiken: Ein
        </span>
        <button onClick={() => window.print()} className="print-btn">
          Drucken / Als PDF
        </button>
      </div>

      {/* ── Poster page ──────────────────────────────────────────── */}
      <section className={`poster-page poster-${config.theme}`}>
        <div className="poster-inner">
          <div className="wordmark" aria-label="Ronki">
            <img
              src="/art/branding/ronki-icon-heroic-128.webp"
              alt=""
              className="wordmark-icon"
              aria-hidden
            />
            <span className="wordmark-text">ronki</span>
          </div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h1 className="headline">{config.headline}</h1>
          <p className="subline">{config.subline}</p>

          <div className="hero-wrap">
            <img
              src={config.heroSrc}
              alt={config.heroAlt || ''}
              className="hero"
              width={600}
              height={600}
            />
            {config.phoneMockup ? (
              <figure className="phone-inset">
                <div className="phone-frame">
                  <div className="phone-notch" aria-hidden />
                  <div className="phone-screen phone-screen-mockup">
                    <PhoneMockup variant={config.phoneMockup.variant} />
                  </div>
                </div>
                {config.phoneMockup.caption && (
                  <figcaption className="phone-caption">
                    {config.phoneMockup.caption}
                  </figcaption>
                )}
              </figure>
            ) : config.phoneScreenshot ? (
              <figure className="phone-inset">
                <div className="phone-frame">
                  <div className="phone-notch" aria-hidden />
                  <img
                    src={config.phoneScreenshot.src}
                    alt=""
                    className="phone-screen"
                    onError={(e) => {
                      // Graceful fallback: if the screenshot file isn't in
                      // the repo yet, hide the whole phone inset so the
                      // poster still looks good with only the painterly hero.
                      const inset = (e.currentTarget as HTMLElement).closest('.phone-inset');
                      if (inset) (inset as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                {config.phoneScreenshot.caption && (
                  <figcaption className="phone-caption">
                    {config.phoneScreenshot.caption}
                  </figcaption>
                )}
              </figure>
            ) : null}
          </div>

          <div className="body-text">{config.body}</div>

          <div className="bottom-row">
            <div className="cta-text">
              <p className="cta-heading">{config.ctaHeading}</p>
              {config.ctaBridge && (
                <p className="cta-bridge">{config.ctaBridge}</p>
              )}
              <ol className="cta-steps">
                {config.steps.map((step, i) => (
                  <li key={i}>{step.content}</li>
                ))}
              </ol>
              <p className="cta-footer">{config.footer}</p>
            </div>
            <div className="qr-wrap">
              <img
                src={qrUrl}
                alt={`QR-Code zu ronki.de${config.qrPath || '/installieren'}`}
                className="qr"
              />
              <p className="qr-label">Scannen &amp; starten</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* ── Base ───────────────────────────────────────────────── */
        .print-root {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          color: #040812;
          min-height: 100vh;
          padding: 32px 16px 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .print-root * { box-sizing: border-box; }

        .no-print {
          position: sticky;
          top: 16px;
          z-index: 20;
          background: #040812;
          color: #FFFFFF;
          padding: 10px 18px;
          border-radius: 999px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          max-width: 720px;
          width: 100%;
        }
        .print-btn {
          margin-left: auto;
          background: #FDD134;
          color: #040812;
          border: 0;
          padding: 6px 14px;
          border-radius: 999px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* ── Poster Page ────────────────────────────────────────── */
        .poster-page {
          width: 210mm;
          height: 297mm;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
          position: relative;
          --bg: #FFFFFF;
          --bg-accent-1: rgba(253,209,52,0.22);
          --bg-accent-2: rgba(5,68,176,0.14);
          --stripe: #FDD134;
          --text-primary: #040812;
          --text-secondary: #0544B0;
          --text-muted: rgba(4,8,18,0.55);
          --highlight: #0544B0;
          --step-number: #0544B0;
          --border: rgba(4,8,18,0.15);
        }
        /* Step-number color was sage #0544B0 — contrast on cream was ~3.1:1
         * (sub-WCAG-AA for 8pt text). Tightened to teal #0544B0 across all
         * light themes (~5.3:1). Keeps brand, fixes legibility. */
        /* All light themes share the brand Tertiary (Sage #0544B0) as
         * the --highlight per DESIGN.md: Sage IS the accent color. Earlier
         * teal-2 #0544B0 was too close to the base ink #040812 and made
         * em/strong text look "same color". Mustard #FDD134 stays reserved
         * for "Quest Gold" (achievement moments), so it doesn't land on
         * light-theme headlines.
         *
         * --step-number stays Teal-2 on light themes: at 8pt the stronger
         * contrast of #0544B0 on cream (7.1:1) keeps tiny step counters
         * readable. Sage at 3.2:1 on cream fails WCAG AA for small text. */
        .poster-warm {
          --bg: #FFFFFF;
          --bg-accent-1: rgba(253,209,52,0.22);
          --bg-accent-2: rgba(5,68,176,0.14);
          --stripe: #FDD134;
          --highlight: #0544B0;
          --step-number: #0544B0;
        }
        .poster-evening {
          --bg: #FFFFFF;
          --bg-accent-1: rgba(4,8,18,0.14);
          --bg-accent-2: rgba(253,209,52,0.20);
          --stripe: #040812;
          --highlight: #0544B0;
          --step-number: #0544B0;
        }
        .poster-morning {
          --bg: #FFFFFF;
          --bg-accent-1: rgba(253,209,52,0.32);
          --bg-accent-2: rgba(217,119,6,0.10);
          --stripe: #FDD134;
          --highlight: #0544B0;
          --step-number: #0544B0;
        }
        .poster-quiet {
          --bg: #FFFFFF;
          --bg-accent-1: rgba(5,68,176,0.16);
          --bg-accent-2: rgba(4,8,18,0.08);
          --stripe: #0544B0;
          --highlight: #0544B0;
          --step-number: #0544B0;
        }
        .poster-cool {
          --bg: #F4FAF7;
          --bg-accent-1: rgba(5,68,176,0.22);
          --bg-accent-2: rgba(4,8,18,0.10);
          --stripe: #0544B0;
          --highlight: #0544B0;
          --step-number: #0544B0;
        }
        .poster-bold {
          --bg: #040812;
          --bg-accent-1: rgba(253,209,52,0.22);
          --bg-accent-2: rgba(5,68,176,0.14);
          --stripe: #FDD134;
          --text-primary: #FFFFFF;
          --text-secondary: #FDD134;
          --text-muted: rgba(255,255,255,0.55);
          --highlight: #FDD134;
          --step-number: #FDD134;
          --border: rgba(255,255,255,0.15);
        }
        .poster-page {
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 70% 45% at 75% 18%, var(--bg-accent-1) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 15% 82%, var(--bg-accent-2) 0%, transparent 60%),
            radial-gradient(ellipse 55% 35% at 85% 95%, var(--bg-accent-1) 0%, transparent 65%);
          color: var(--text-primary);
        }
        .poster-page::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4mm;
          background: var(--stripe);
        }
        .poster-inner {
          height: 100%;
          padding: 20mm 18mm 16mm;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* ── Wordmark (brand anchor, top-right) ───────────────────
         * Simple text-based mark with a mustard dot accent. Reuses
         * themed colors so it adapts to light/bold themes. */
        .wordmark {
          position: absolute;
          top: 10mm;
          right: 14mm;
          display: inline-flex;
          align-items: center;
          gap: 2mm;
          z-index: 2;
        }
        .wordmark-icon {
          width: 6mm;
          height: 6mm;
          display: block;
          flex-shrink: 0;
        }
        .wordmark-text {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 13pt;
          letter-spacing: -0.04em;
          color: var(--text-primary);
          line-height: 1;
        }

        .eyebrow {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 9pt;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.28em;
          text-transform: uppercase;
          margin: 0 0 6mm;
          text-align: center;
        }
        .headline {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 42pt;
          /* 1.0 was too tight for 2-line display type (Anti-Engagement).
           * 1.05 keeps it bold but lets tall letters breathe. */
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin: 0;
          text-align: center;
          /* Predictable wrapping via explicit <br /> in each poster.
           * text-wrap: balance caused Figma capture artifacts (browser
           * wrapped at one place, Figma measured differently). Forced
           * breaks are uglier to maintain but render consistently. */
          max-width: 174mm;
          margin-left: auto;
          margin-right: auto;
        }
        .headline em {
          font-style: italic;
          color: var(--highlight);
          font-weight: 800;
        }
        /* Non-italic accent — use when italic on short fragments
         * (numbers, bare adverbs) feels typographically off. */
        .headline strong {
          font-style: normal;
          color: var(--highlight);
          font-weight: 800;
        }
        .subline {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 600;
          font-size: 15pt;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: var(--text-secondary);
          margin: 6mm 0 0;
          text-align: center;
          text-wrap: balance;
        }

        /* hero-wrap absorbs leftover vertical space (flex: 1). Hero image
         * stays fixed at 68mm and centers within the expanded wrap, so the
         * image reads as "breathing" rather than "cramped". Posters with
         * short bodies still look balanced; posters with long bodies keep
         * the 72mm minimum. */
        .hero-wrap {
          flex: 1 1 auto;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 4mm 0 6mm;
          min-height: 72mm;
        }
        /* Hero shrunk from 92 → 68mm. Original size was visually dominant
         * and crowded the body-text "proof" section. Smaller hero gives
         * the mid-section room to hold attention. */
        .hero {
          width: 68mm;
          height: 68mm;
          object-fit: cover;
          border-radius: 8mm;
          box-shadow: 0 8mm 16mm -4mm rgba(4,8,18,0.22);
        }

        /* Phone inset — bottom right of hero area
         * Original 38x68mm + bottom: -4mm was cramped against the 92mm hero
         * (only 3mm gap at A4 inner width). Shrunk to 32x58mm, anchored
         * cleanly on the baseline (bottom: 0). */
        .phone-inset {
          position: absolute;
          right: 4mm;
          bottom: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .phone-frame {
          width: 32mm;
          height: 58mm;
          background: #040812;
          border-radius: 4.5mm;
          padding: 1.3mm;
          box-shadow: 0 5mm 12mm -3mm rgba(4,8,18,0.4);
          position: relative;
        }
        .phone-notch {
          position: absolute;
          top: 2mm;
          left: 50%;
          transform: translateX(-50%);
          width: 10mm;
          height: 2mm;
          background: #040812;
          border-radius: 1mm;
          z-index: 2;
        }
        .phone-screen {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 3.5mm;
          display: block;
        }
        .phone-screen-mockup {
          /* div-based vector mockup wrapper — same size/radius, no object-fit */
          overflow: hidden;
        }
        .phone-caption {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 7pt;
          font-weight: 600;
          color: var(--text-muted);
          margin: 2mm 0 0;
          text-align: center;
          letter-spacing: 0.02em;
          max-width: 34mm;
        }

        /* Body wrapper — renders caller's children. Callers MUST wrap
         * individual paragraphs in <p>…</p> so the shell can apply
         * per-paragraph typography + inter-paragraph spacing.
         *
         * Typography hierarchy:
         *   - First <p> → "lead" (larger, heavier, full opacity) — the
         *     primary claim, the attention-holder in the mid-section
         *   - Subsequent <p> → supporting (smaller, lighter) — the
         *     proof-beats that reinforce the lead
         *
         * Mid-section pop: headline grabs → lead paragraph delivers the
         * core claim in display type → supporting paragraphs carry the
         * reasoning → CTA closes. */
        .body-text {
          max-width: 150mm;
          margin: 0 auto 8mm;
          padding: 0 4mm;
          display: flex;
          flex-direction: column;
          gap: 4mm;
        }
        .body-text p {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          margin: 0;
          text-align: center;
          text-wrap: pretty;
          color: var(--text-primary);
        }
        /* Lead paragraph — the mid-section anchor */
        .body-text p:first-child {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 14pt;
          font-weight: 600;
          line-height: 1.3;
          letter-spacing: -0.015em;
          opacity: 0.95;
          max-width: 140mm;
          margin-left: auto;
          margin-right: auto;
        }
        /* Supporting paragraphs — smaller, readable, slightly recessed */
        .body-text p:not(:first-child) {
          font-size: 10.5pt;
          line-height: 1.5;
          font-weight: 400;
          opacity: 0.72;
          max-width: 130mm;
          margin-left: auto;
          margin-right: auto;
        }
        .poster-bold .body-text p:first-child { opacity: 1; }
        .poster-bold .body-text p:not(:first-child) { opacity: 0.82; }
        .body-text em {
          font-style: italic;
          color: var(--highlight);
          font-weight: 700;
          opacity: 1;
        }
        .body-text strong {
          color: var(--highlight);
          font-weight: 700;
          opacity: 1;
          font-style: normal;
        }

        /* bottom-row sits naturally after body-text. Leftover vertical
         * space is absorbed by hero-wrap (flex: 1 auto above), keeping
         * the image area balanced rather than leaving awkward empty
         * space at the very bottom or right above the CTA. */
        .bottom-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10mm;
          align-items: center;
          padding-top: 6mm;
          border-top: 0.5mm solid var(--border);
        }
        .cta-text { min-width: 0; }
        .cta-heading {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 12pt;
          color: var(--text-primary);
          margin: 0 0 2mm;
          letter-spacing: -0.01em;
        }
        .cta-bridge {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 9.5pt;
          line-height: 1.4;
          font-style: italic;
          color: var(--text-secondary);
          margin: 0 0 3mm;
        }
        .cta-bridge strong {
          color: var(--text-primary);
          font-weight: 700;
          font-style: normal;
        }
        .cta-steps {
          counter-reset: step;
          list-style: none;
          padding: 0;
          margin: 0 0 4mm;
          display: flex;
          flex-direction: column;
          gap: 1.8mm;
        }
        .cta-steps > li {
          counter-increment: step;
          position: relative;
          padding-left: 6.5mm;
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 9.5pt;
          line-height: 1.35;
          color: var(--text-primary);
        }
        .cta-steps > li::before {
          content: counter(step, decimal-leading-zero);
          position: absolute;
          left: 0;
          top: 0;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 8pt;
          color: var(--step-number);
          letter-spacing: 0.03em;
        }
        .cta-steps strong {
          color: var(--text-primary);
          font-weight: 700;
        }
        .cta-footer {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 7pt;
          color: var(--text-muted);
          margin: 0;
          letter-spacing: 0.02em;
          line-height: 1.4;
        }

        .qr-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2mm;
        }
        .qr {
          width: 42mm;
          height: 42mm;
          border-radius: 3mm;
          background: var(--bg);
        }
        .qr-label {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 8pt;
          color: var(--text-secondary);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0;
        }

        /* ── Print ──────────────────────────────────────────────── */
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .print-root {
            padding: 0 !important;
            gap: 0 !important;
            align-items: stretch !important;
            min-height: 0 !important;
          }
          .poster-page {
            box-shadow: none !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
