/**
 * ProfileCard — A6 two-faced trading-card style QR card.
 *
 * Lineage: borrows the visual grammar from PrintA6FlyerKidsCard
 * (holo gradient background, mustard-gold card frame, kid-name
 * header bar, portrait with sunburst frame + corner brackets, rarity
 * stamp footer) — and the front/back split + scannable-QR pattern
 * from BeyArena's qr-card.ts. Marc 3 May 2026: "the card itself is
 * superboring. take a look at the beyarena cards and how we drafted
 * them. use that for reference and get ronki art involved etc to
 * make it look cool while being functional."
 *
 * Two pages, A6 portrait, designed to print as a single sheet that
 * folds in half (or printed on both sides of a card stock):
 *   - FRONT: collector-card face — kid's name as the card name,
 *     heroic Ronki art in the portrait, profile-code eyebrow,
 *     rarity stamp footer. The "look at me" face.
 *   - BACK: scannable face — QR in a white framed box, three-step
 *     instructions, code fragment for manual fallback. The "use me"
 *     face.
 *
 * Usage from ProfilErstellen:
 *   <ProfileCardFront childName="Louis" tokenFragment="1421-4e89" />
 *   <ProfileCardBack
 *     childName="Louis"
 *     tokenFragment="1421-4e89"
 *     qrCanvasRef={ref}
 *   />
 *   <style>{profileCardCss}</style>
 */

import { RefObject } from 'react';

const RONKI_ART = '/art/branding/ronki-icon-heroic-256.webp';

interface FrontProps {
  childName: string;
  tokenFragment: string;
}

export function ProfileCardFront({ childName, tokenFragment }: FrontProps) {
  // Shrink the name font when the text is too long to fit one line.
  // Same approach as the flyer card so a 10+ char kid name doesn't
  // wrap or get hyphenated mid-letter.
  const nameLen = childName.length;
  const nameFontSize =
    nameLen >= 12 ? '15pt' : nameLen >= 9 ? '18pt' : '22pt';

  return (
    <section className="profile-card profile-card-front">
      {/* Holo shimmer background — 3 stacked stripes over a teal radial */}
      <div className="profile-holo-bg" aria-hidden>
        <div className="profile-holo-stripe s1" />
        <div className="profile-holo-stripe s2" />
        <div className="profile-holo-stripe s3" />
      </div>

      {/* Mustard-gold framed card surface */}
      <div className="profile-frame">
        {/* Header — left: eyebrow + kid name; right: HP-style badge */}
        <div className="profile-header">
          <div className="profile-name-block">
            <p className="profile-eyebrow">Drachen-Profil</p>
            <h1 className="profile-name" style={{ fontSize: nameFontSize }}>
              {childName.toUpperCase()}
            </h1>
          </div>
          <div className="profile-hp">
            <span className="profile-hp-icon">✦</span>
            <span className="profile-hp-text">RONKI</span>
          </div>
        </div>

        {/* Portrait — heroic Ronki on the sunburst */}
        <div className="profile-portrait">
          <svg
            className="profile-portrait-frame"
            viewBox="0 0 200 140"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="profileBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE68A" />
                <stop offset="100%" stopColor="#F2BC5B" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="200" height="140" fill="url(#profileBg)" />
            <g opacity="0.35" fill="#FFF8E3">
              <polygon points="100,70 0,40 0,0 40,0" />
              <polygon points="100,70 200,40 200,0 160,0" />
              <polygon points="100,70 0,100 0,140 40,140" />
              <polygon points="100,70 200,100 200,140 160,140" />
            </g>
          </svg>
          <img
            src={RONKI_ART}
            alt="Ronki"
            className="profile-portrait-art"
            loading="eager"
          />
          <div className="profile-portrait-corner tl" />
          <div className="profile-portrait-corner tr" />
          <div className="profile-portrait-corner bl" />
          <div className="profile-portrait-corner br" />
        </div>

        {/* Mission strip — replaces the flyer's abilities row. Big
            profile code so a parent reading from across the room
            recognizes the card; tagline reinforces the moment. */}
        <div className="profile-mission">
          <p className="profile-mission-label">Profil-Code</p>
          <p className="profile-mission-code">{tokenFragment.toUpperCase()}</p>
          <p className="profile-mission-tag">
            Drache &amp; Mensch — ein Team
          </p>
        </div>

        {/* Footer — rarity left, ownership right */}
        <div className="profile-footer">
          <p className="profile-rarity">★ HOLO RARE ★</p>
          <p className="profile-owner">
            Gehört <strong>{childName}</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

interface BackProps {
  childName: string;
  tokenFragment: string;
  qrCanvasRef: RefObject<HTMLCanvasElement | null>;
}

export function ProfileCardBack({ childName, tokenFragment, qrCanvasRef }: BackProps) {
  return (
    <section className="profile-card profile-card-back">
      <div className="profile-back-inner">
        <p className="profile-back-eyebrow">Karten-Rückseite</p>

        <h2 className="profile-back-headline">
          Halt mich vor’s
          <br />
          Tablet
        </h2>

        <p className="profile-back-sub">und Ronki ist da.</p>

        {/* QR box — white surface, mustard frame, drop shadow */}
        <div className="profile-back-qr-box">
          <canvas
            ref={qrCanvasRef}
            className="profile-back-qr-canvas"
            aria-label="QR-Code zum Scannen"
          />
          <p className="profile-back-qr-caption">↑ vor das Tablet halten ↑</p>
        </div>

        {/* 3-step kid-readable instructions */}
        <ol className="profile-back-steps">
          <li>
            <span className="profile-back-step-num">1</span>
            <span className="profile-back-step-text">Ronki-App auf dem Tablet öffnen.</span>
          </li>
          <li>
            <span className="profile-back-step-num">2</span>
            <span className="profile-back-step-text">„QR-Code scannen“ tippen.</span>
          </li>
          <li>
            <span className="profile-back-step-num">3</span>
            <span className="profile-back-step-text">Karte vor die Kamera.</span>
          </li>
        </ol>

        {/* Foot — code fragment + brand */}
        <div className="profile-back-foot">
          <p className="profile-back-foot-code">{tokenFragment.toUpperCase()}</p>
          <p className="profile-back-foot-brand">
            <strong>ronki.de</strong> · für {childName}
          </p>
          <p className="profile-back-foot-lost">
            Verloren? Eine neue Karte unter <strong>ronki.de/profil-erstellen</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * profileCardCss — drop into a <style> tag near the cards. Mirrors
 * the flyer Sammelkarte's CSS architecture (cardCss in
 * PrintA6FlyerKidsCard.tsx) but namespaced with `profile-` prefixes
 * so the two card systems can coexist on the same page.
 *
 * Print stylesheet (further down the file) handles the page-break
 * + isolation so window.print() emits the two faces alone.
 */
export const profileCardCss = `
  .profile-card {
    width: 105mm;
    height: 148mm;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(4,8,18,0.18);
    position: relative;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    border-radius: 4mm;
  }
  .profile-card *,
  .profile-card *::before,
  .profile-card *::after {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  /* ── FRONT ─────────────────────────────────── */
  .profile-card-front {
    background: #040812;
    padding: 4mm;
  }
  .profile-holo-bg {
    position: absolute;
    inset: 4mm;
    border-radius: 4mm;
    overflow: hidden;
    background:
      radial-gradient(ellipse 140% 100% at 30% 20%, #0544B0 0%, transparent 60%),
      radial-gradient(ellipse 120% 80% at 80% 80%, #0544B0 0%, transparent 55%),
      #040812;
    z-index: 1;
  }
  .profile-holo-stripe {
    position: absolute;
    inset: -20%;
    background: linear-gradient(
      115deg,
      transparent 30%,
      rgba(255,232,138,0.25) 42%,
      rgba(253,209,52,0.35) 48%,
      rgba(5,68,176,0.3) 52%,
      rgba(255,255,255,0.15) 58%,
      transparent 68%
    );
    mix-blend-mode: screen;
  }
  .profile-holo-stripe.s1 { transform: rotate(-8deg) translateY(-10%); opacity: 0.55; }
  .profile-holo-stripe.s2 { transform: rotate(-8deg) translateY(30%); opacity: 0.4; }
  .profile-holo-stripe.s3 { transform: rotate(-8deg) translateY(80%); opacity: 0.5; }

  .profile-frame {
    position: relative;
    z-index: 2;
    height: 100%;
    border-radius: 3.5mm;
    padding: 4mm 4mm 3.5mm;
    background: linear-gradient(180deg, rgba(4,8,18,0.35), rgba(4,8,18,0.15));
    border: 0.5mm solid rgba(253,209,52,0.6);
    box-shadow:
      inset 0 0 0 0.3mm rgba(253,209,52,0.25),
      inset 0 0 8mm rgba(4,8,18,0.4);
    display: flex;
    flex-direction: column;
    gap: 3mm;
  }

  /* Header */
  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2mm;
  }
  .profile-name-block { flex: 1; min-width: 0; }
  .profile-eyebrow {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 6.5pt;
    font-weight: 800;
    letter-spacing: 0.18em;
    color: #FDD134;
    margin: 0 0 0.8mm;
    text-transform: uppercase;
  }
  .profile-name {
    font-family: 'Fredoka', 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 22pt;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #FFFFFF;
    margin: 0;
    line-height: 0.9;
    text-shadow: 0 0.5mm 1mm rgba(0,0,0,0.3);
    hyphens: none;
    -webkit-hyphens: none;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
  }
  .profile-hp {
    background: #FDD134;
    color: #040812;
    border-radius: 2mm;
    padding: 1.2mm 2.2mm;
    display: flex;
    align-items: baseline;
    gap: 1mm;
    box-shadow: 0 1mm 2mm rgba(0,0,0,0.2);
    flex-shrink: 0;
  }
  .profile-hp-icon { font-size: 9pt; font-weight: 800; }
  .profile-hp-text {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 8.5pt;
    font-weight: 900;
    letter-spacing: 0.06em;
    line-height: 1;
  }

  /* Portrait */
  .profile-portrait {
    position: relative;
    aspect-ratio: 200/140;
    border-radius: 2.5mm;
    overflow: hidden;
    background: #FFE68A;
    border: 0.4mm solid #FDD134;
    box-shadow:
      inset 0 0 0 0.2mm rgba(4,8,18,0.2),
      0 1mm 3mm rgba(0,0,0,0.3);
  }
  .profile-portrait-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .profile-portrait-art {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    padding: 2mm;
    filter: drop-shadow(0 2mm 3mm rgba(181,83,9,0.35));
  }
  .profile-portrait-corner {
    position: absolute;
    width: 4mm;
    height: 4mm;
    border: 0.4mm solid #FDD134;
    opacity: 0.8;
    z-index: 2;
  }
  .profile-portrait-corner.tl { top: 1mm; left: 1mm; border-right: 0; border-bottom: 0; }
  .profile-portrait-corner.tr { top: 1mm; right: 1mm; border-left: 0; border-bottom: 0; }
  .profile-portrait-corner.bl { bottom: 1mm; left: 1mm; border-right: 0; border-top: 0; }
  .profile-portrait-corner.br { bottom: 1mm; right: 1mm; border-left: 0; border-top: 0; }

  /* Mission strip — replaces the flyer's abilities row */
  .profile-mission {
    text-align: center;
    padding: 3mm 3mm 2.5mm;
    background: rgba(255,255,255,0.94);
    border-radius: 2.5mm;
    border: 0.3mm solid rgba(253,209,52,0.4);
  }
  .profile-mission-label {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 6.5pt;
    font-weight: 800;
    letter-spacing: 0.20em;
    color: #0544B0;
    text-transform: uppercase;
    margin: 0 0 0.8mm;
  }
  .profile-mission-code {
    font-family: 'Fredoka', 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 17pt;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: #040812;
    margin: 0 0 1mm;
  }
  .profile-mission-tag {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 600;
    font-style: italic;
    color: #0544B0;
    margin: 0;
  }

  /* Footer */
  .profile-footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2mm;
    padding-top: 2mm;
  }
  .profile-rarity {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 8pt;
    font-weight: 900;
    letter-spacing: 0.16em;
    color: #FDD134;
    margin: 0;
    text-shadow: 0 0.3mm 0.5mm rgba(0,0,0,0.4);
  }
  .profile-owner {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 500;
    color: rgba(255,255,255,0.75);
    margin: 0;
  }
  .profile-owner strong { color: #FFFFFF; font-weight: 800; }

  /* ── BACK ─────────────────────────────────── */
  .profile-card-back {
    background: #FFFFFF;
    background-image:
      radial-gradient(ellipse 90% 60% at 100% 0%, rgba(5,68,176,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 90% 50% at 0% 100%, rgba(253,209,52,0.22) 0%, transparent 55%);
  }
  .profile-card-back::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4mm;
    background: linear-gradient(90deg, #0544B0, #FDD134);
  }
  .profile-back-inner {
    height: 100%;
    padding: 9mm 8mm 7mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .profile-back-eyebrow {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 800;
    color: #0544B0;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin: 0 0 2.5mm;
  }
  .profile-back-headline {
    font-family: 'Fredoka', 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 18pt;
    line-height: 1.05;
    letter-spacing: -0.01em;
    color: #040812;
    margin: 0 0 1.2mm;
  }
  .profile-back-sub {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 10pt;
    font-style: italic;
    color: #0544B0;
    margin: 0 0 4mm;
  }

  /* QR box */
  .profile-back-qr-box {
    background: #FFFFFF;
    border: 0.6mm solid #FDD134;
    border-radius: 2.5mm;
    padding: 4mm;
    margin: 0 0 4mm;
    box-shadow:
      0 1.2mm 2.5mm rgba(4,8,18,0.18),
      inset 0 0 0 0.2mm rgba(4,8,18,0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2mm;
  }
  .profile-back-qr-canvas {
    width: 52mm !important;
    height: 52mm !important;
    display: block;
  }
  .profile-back-qr-caption {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: rgba(4,8,18,0.65);
    margin: 0;
    text-transform: uppercase;
  }

  /* Steps */
  .profile-back-steps {
    list-style: none;
    margin: 0 0 4mm;
    padding: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.4mm;
  }
  .profile-back-steps li {
    display: flex;
    align-items: center;
    gap: 2.5mm;
    text-align: left;
  }
  .profile-back-step-num {
    width: 5mm;
    height: 5mm;
    border-radius: 50%;
    background: #0544B0;
    color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 8pt;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .profile-back-step-text {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 9pt;
    font-weight: 600;
    color: #040812;
    line-height: 1.3;
  }

  /* Foot */
  .profile-back-foot {
    margin-top: auto;
    padding-top: 2mm;
    border-top: 0.3mm dashed rgba(4,8,18,0.25);
    width: 100%;
  }
  .profile-back-foot-code {
    font-family: 'Fredoka', 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 12pt;
    font-weight: 700;
    letter-spacing: 0.20em;
    color: #040812;
    margin: 0 0 1mm;
    text-align: center;
  }
  .profile-back-foot-brand {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 8pt;
    font-weight: 600;
    color: #040812;
    margin: 0 0 0.8mm;
  }
  .profile-back-foot-brand strong { color: #0544B0; font-weight: 800; }
  .profile-back-foot-lost {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 6.5pt;
    font-weight: 500;
    color: rgba(4,8,18,0.55);
    margin: 0;
    line-height: 1.3;
  }
  .profile-back-foot-lost strong { color: #0544B0; }
`;

/**
 * Preview shell — wraps a real-mm card and downscales it visually so
 * it fits a phone/desktop modal. The card renders at 105×148mm (its
 * design grid) but the wrapper crops the layout to the scaled
 * footprint via overflow:hidden + absolute positioning.
 *
 * Use for inline preview (e.g. in the success state of /profil-
 * erstellen). The print copy lives in a separate body-portaled
 * wrapper that uses real mm.
 */
export const profileCardPreviewCss = `
  .profile-preview-shell {
    width: calc(105mm * 0.62);
    height: calc(148mm * 0.62);
    position: relative;
    overflow: hidden;
    margin: 0 auto;
    border-radius: 4mm;
  }
  .profile-preview-shell > .profile-card {
    position: absolute;
    top: 0;
    left: 0;
    transform: scale(0.62);
    transform-origin: top left;
  }
  @media (min-width: 480px) {
    .profile-preview-shell {
      width: calc(105mm * 0.78);
      height: calc(148mm * 0.78);
    }
    .profile-preview-shell > .profile-card {
      transform: scale(0.78);
    }
  }
`;

/**
 * Print-only stylesheet — drop alongside the cards. Hides everything
 * except the .profile-print-frame wrapper, force-prints both pages
 * (one card per page) with A6 portrait page setup.
 *
 * Pattern: the cards are wrapped in <div class="profile-print-frame">
 * which is portaled to body so the body > *:not() rule isolates it.
 */
export const profileCardPrintCss = `
  .profile-print-frame { display: none; }
  @media print {
    body > *:not(.profile-print-frame) { display: none !important; }
    .profile-print-frame {
      display: block !important;
      position: static !important;
      background: #ffffff !important;
    }
    .profile-print-frame .profile-card {
      box-shadow: none;
      border-radius: 0;
      margin: 0 auto;
      page-break-after: always;
      break-after: page;
    }
    .profile-print-frame .profile-card:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    @page { size: A6 portrait; margin: 0; }
  }
`;
