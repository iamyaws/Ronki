/**
 * Print-ready A6 Flyer for KIDS — Variant "Sammelkarte".
 *
 * Voice direction: the flyer IS a trading card. Front face reads
 * exactly like a holo rarity card a 7-year-old would recognize from
 * Pokemon / Yu-Gi-Oh / Fußball-Sticker culture. Back has a personal
 * sign-and-name block (Trainer- and Drachen-Name), the peer hook
 * ("Willst du deinen eigenen Drachen?"), the 3-step how-to-install,
 * and the QR the parent scans.
 *
 * Dragon randomization: front art is rolled from a pool of 6
 * dragons in the art library. Default = random per page load. Lock
 * one via ?d=<slug> URL param. The sheet-printing page will assign
 * 4 different dragons to its 4 cells so each A4 yields a varied set.
 *
 * Kid reasoning: peer-status is the strongest single pull in 1st–2nd
 * grade. A card you can pocket and show at break > a Zettel. The
 * abilities are chosen to be things kids actually argue with their
 * parents about (Morgen, Zähne, Langeweile) — so the card plants
 * the premise without sounding like an ad.
 *
 * Print spec: A6 (105×148 mm), 2 pages. Heavy card stock (300g+)
 * recommended; holo foil optional.
 */

import { useEffect, useState } from 'react';

const QR_URL =
  'https://api.qrserver.com/v1/create-qr-code/?' +
  'data=https%3A%2F%2Fwww.ronki.de%2Finstallieren' +
  '&size=500x500&format=png&margin=8&color=1a3c3f&bgcolor=ffffff';

/* ── Dragon pool ─────────────────────────────────────────── *
 * Each dragon = a distinct Sammelkarten-Persona. Names are new
 * (kid-friendly German one-word) so each card feels like its own
 * creature, not just "another Ronki stage". HP + rarity + abilities
 * are chosen so the distribution feels like a real card set: one
 * starter (low HP, cute), one balanced mid (heroic Ronki), two
 * strong rares, one legendary, one bouncy newcomer.
 * ─────────────────────────────────────────────────────────── */

export type Dragon = {
  slug: string;
  name: string;
  type: string;
  hp: number;
  art: string;
  rarity: string;
  abilities: Array<{ name: string; on: number }>;
  /**
   * How the portrait image sits in the landscape card-portrait frame.
   * - 'cover' (default): image fills the frame, may crop top/bottom.
   *   Use for scene-style art that's already composed for landscape
   *   (dragon-majestic, dragon-mother, dragon-legendary).
   * - 'contain': image letterboxed inside yellow frame. Use for
   *   watercolor character portraits with whitespace padding around
   *   the creature (Feuerspitze, Glutfunke, Grünschwinge, Funkel),
   *   and for the transparent-bg Ronki brand icon.
   */
  fit?: 'cover' | 'contain';
};

export const DRAGONS: Dragon[] = [
  {
    slug: 'ronki',
    name: 'RONKI',
    type: 'DRACHEN · MUT-TYP',
    hp: 100,
    art: '/art/branding/ronki-icon-heroic-256.webp',
    rarity: '★ HOLO RARE ★',
    fit: 'contain',
    abilities: [
      { name: 'Morgen-Mut', on: 4 },
      { name: 'Zähne-Putz-Kraft', on: 3 },
      { name: 'Langweile-Schutz', on: 5 },
    ],
  },
  {
    slug: 'kruemel',
    name: 'KRÜMEL',
    type: 'DRACHEN · KUSCHEL-TYP',
    hp: 60,
    art: '/art/companion/dragon-baby.webp',
    rarity: '✦ FIRST EDITION ✦',
    abilities: [
      { name: 'Kuschel-Kraft', on: 5 },
      { name: 'Schlummer-Schutz', on: 4 },
      { name: 'Kicher-Attacke', on: 3 },
    ],
  },
  {
    slug: 'himmel',
    name: 'HIMMEL',
    type: 'DRACHEN · FLUG-TYP',
    hp: 110,
    art: '/art/companion/dragon-majestic.webp',
    rarity: '★ HOLO RARE ★',
    abilities: [
      { name: 'Wolken-Flug', on: 5 },
      { name: 'Wind-Ruf', on: 4 },
      { name: 'Regenbogen', on: 3 },
    ],
  },
  {
    slug: 'flamme',
    name: 'FLAMME',
    type: 'DRACHEN · LEGENDEN-TYP',
    hp: 120,
    art: '/art/companion/dragon-legendary.webp',
    rarity: '✦ LEGENDARY ✦',
    abilities: [
      { name: 'Feuer-Sturm', on: 5 },
      { name: 'Ur-Glut', on: 5 },
      { name: 'Alten-Mut', on: 4 },
    ],
  },
  {
    slug: 'feuerspitze',
    name: 'FEUERSPITZE',
    type: 'DRACHEN · GLUT-TYP',
    hp: 70,
    art: '/art/companion/dragon-feuerspitze.png',
    rarity: '★ RARE ★',
    fit: 'contain',
    abilities: [
      { name: 'Feuer-Kringel', on: 4 },
      { name: 'Neugier-Sprung', on: 5 },
      { name: 'Schwanz-Funken', on: 3 },
    ],
  },
  {
    slug: 'gruenschwinge',
    name: 'GRÜNSCHWINGE',
    type: 'DRACHEN · WALD-TYP',
    hp: 95,
    art: '/art/companion/dragon-gruenschwinge.png',
    rarity: '★ HOLO RARE ★',
    fit: 'contain',
    abilities: [
      { name: 'Blatt-Schwinge', on: 4 },
      { name: 'Wald-Weisheit', on: 5 },
      { name: 'Ruhe-Blick', on: 3 },
    ],
  },
  {
    slug: 'glutfunke',
    name: 'GLUTFUNKE',
    type: 'DRACHEN · FUNKEN-TYP',
    hp: 80,
    art: '/art/companion/dragon-glutfunke.png',
    rarity: '★ RARE ★',
    fit: 'contain',
    abilities: [
      { name: 'Funken-Flug', on: 4 },
      { name: 'Augen-Blitz', on: 5 },
      { name: 'Klein-aber-Fein', on: 3 },
    ],
  },
  {
    slug: 'funkel',
    name: 'DR. FUNKEL',
    type: 'FORSCHER · MINT-TYP',
    hp: 65,
    art: '/art/companion/char-funkel.png',
    rarity: '✦ FORSCHER-EDITION ✦',
    fit: 'contain',
    abilities: [
      { name: 'Lupen-Blick', on: 5 },
      { name: 'Kristall-Wissen', on: 5 },
      { name: 'Pilz-Pfiff', on: 3 },
    ],
  },
  {
    slug: 'mutter',
    name: 'DRACHEN-MUTTER',
    type: 'DRACHEN · MUTTER-TYP',
    hp: 140,
    art: '/art/companion/dragon-mother.png',
    rarity: '✦ MYTHIC ✦',
    abilities: [
      { name: 'Mond-Hauch', on: 5 },
      { name: 'Wolken-Reise', on: 5 },
      { name: 'Hüter-Blick', on: 5 },
    ],
  },
];

export function pickRandomDragon(excludeSlug?: string): Dragon {
  const pool = excludeSlug
    ? DRAGONS.filter((d) => d.slug !== excludeSlug)
    : DRAGONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickFourDistinct(): Dragon[] {
  // Fisher-Yates shuffle, then take first 4. If DRAGONS has fewer
  // than 4 entries, this still works (returns whatever's there).
  const arr = [...DRAGONS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 4);
}

export function findDragon(slug: string | null | undefined): Dragon | null {
  if (!slug) return null;
  return DRAGONS.find((d) => d.slug === slug.toLowerCase()) ?? null;
}

/* ── Named export: front card face ───────────────────────── */

export function CardFront({ dragon }: { dragon: Dragon }) {
  // Shrink the name font when the text is too long to fit one line
  // at 22pt. Without this the browser will auto-hyphenate long names
  // like "GRÜNSCHWINGE" → "GRÜN-\nSCHWINGE".
  const nameLen = dragon.name.length;
  const nameFontSize =
    nameLen >= 12 ? '15pt' : nameLen >= 9 ? '18pt' : '22pt';

  const fitClass = dragon.fit === 'contain' ? 'portrait-dragon fit-contain' : 'portrait-dragon';

  return (
    <section className="flyer-page card-front">
      {/* Holo shimmer background */}
      <div className="holo-bg" aria-hidden>
        <div className="holo-stripe s1" />
        <div className="holo-stripe s2" />
        <div className="holo-stripe s3" />
      </div>

      {/* Card frame */}
      <div className="card-frame">
        {/* Header bar */}
        <div className="card-header">
          <div className="card-name-block">
            <p className="card-type">{dragon.type}</p>
            <h1 className="card-name" style={{ fontSize: nameFontSize }}>
              {dragon.name}
            </h1>
          </div>
          <div className="card-hp">
            <span className="hp-label">✨</span>
            <span className="hp-value">{dragon.hp}</span>
          </div>
        </div>

        {/* Portrait */}
        <div className="card-portrait">
          <svg className="portrait-frame" viewBox="0 0 200 140" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="portraitBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE68A" />
                <stop offset="100%" stopColor="#F2BC5B" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="200" height="140" fill="url(#portraitBg)" />
            <g opacity="0.35" fill="#FFF8E3">
              <polygon points="100,70 0,40 0,0 40,0" />
              <polygon points="100,70 200,40 200,0 160,0" />
              <polygon points="100,70 0,100 0,140 40,140" />
              <polygon points="100,70 200,100 200,140 160,140" />
            </g>
          </svg>
          <img
            src={dragon.art}
            alt={dragon.name}
            className={fitClass}
            loading="eager"
          />
          <div className="portrait-corner tl" />
          <div className="portrait-corner tr" />
          <div className="portrait-corner bl" />
          <div className="portrait-corner br" />
        </div>

        {/* Abilities */}
        <div className="card-abilities">
          {dragon.abilities.map((a) => (
            <div className="ability" key={a.name}>
              <span className="ab-name">{a.name}</span>
              <span className="ab-bar">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className={i < a.on ? 'dot on' : 'dot off'} />
                ))}
              </span>
            </div>
          ))}
        </div>

        {/* Footer stamp row */}
        <div className="card-footer">
          <p className="rarity">{dragon.rarity}</p>
          <p className="set-info">
            Gefunden von <strong>Louis</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Named export: back (signable) ───────────────────────── */

export function CardBack() {
  return (
    <section className="flyer-page card-back">
      <div className="card-back-inner">
        <p className="back-eyebrow">Karten-Rückseite</p>

        <h2 className="back-headline">
          Willst du deinen
          <br />
          eigenen Drachen?
        </h2>

        <p className="back-sub">Er schlüpft, wenn du ihn rufst.</p>

        {/* Sign + name */}
        <div className="sign-block">
          <div className="sign-row">
            <label>Dein Name</label>
            <span className="sign-line" />
          </div>
          <div className="sign-row">
            <label>Dein Drache heißt</label>
            <span className="sign-line" />
          </div>
        </div>

        {/* 3-step parent instruction */}
        <ol className="back-steps">
          <li>
            <span className="bstep-num">1</span>
            <span className="bstep-text">Großen holen. Sie tippen.</span>
          </li>
          <li>
            <span className="bstep-num">2</span>
            <span className="bstep-text">
              Code scannen oder <strong>ronki.de</strong>
            </span>
          </li>
          <li>
            <span className="bstep-num">3</span>
            <span className="bstep-text">Drachen schlüpft.</span>
          </li>
        </ol>

        {/* QR for the parent */}
        <div className="back-qr-row">
          <img src={QR_URL} alt="QR-Code zu ronki.de/installieren" className="back-qr" />
          <div className="back-qr-text">
            <p className="qr-hint-lg">Erwachsener scannt</p>
            <p className="qr-hint-sm">für dich</p>
          </div>
        </div>

        <p className="back-foot">
          <strong>ronki.de</strong> &nbsp;·&nbsp; Geprüft. Werbefrei. Kein Streak.
        </p>
      </div>
    </section>
  );
}

/* ── Named export: variant CSS ───────────────────────────── *
 * Excludes .print-root wrapper and the A6 @page rules — those
 * belong to the specific preview/print page that wraps this. The
 * A4-sheet print page will reuse cardCss and add its own page CSS.
 * ─────────────────────────────────────────────────────────── */

export const cardCss = `
  .flyer-page {
    width: 105mm;
    height: 148mm;
    overflow: hidden;
    box-shadow: 0 10px 24px rgba(0,0,0,0.12);
    position: relative;
    /* Force Chrome/Edge/Safari to print backgrounds and solid fills
       as designed, without the user having to toggle "Hintergrund-
       grafiken drucken". Without this the dark teal card-front, the
       holo gradient, the yellow HP badge and the filled ability dots
       all disappear on print. */
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .flyer-page *,
  .flyer-page *::before,
  .flyer-page *::after {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  /* ── CARD FRONT ─────────────────────────────────── */
  .card-front {
    background: #040812;
    padding: 4mm;
  }

  .holo-bg {
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
  .holo-stripe {
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
  .holo-stripe.s1 { transform: rotate(-8deg) translateY(-10%); opacity: 0.55; }
  .holo-stripe.s2 { transform: rotate(-8deg) translateY(30%); opacity: 0.4; }
  .holo-stripe.s3 { transform: rotate(-8deg) translateY(80%); opacity: 0.5; }

  .card-frame {
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
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2mm;
  }
  .card-name-block { flex: 1; min-width: 0; }
  .card-type {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 6.5pt;
    font-weight: 800;
    letter-spacing: 0.18em;
    color: #FDD134;
    margin: 0 0 0.8mm;
    text-transform: uppercase;
  }
  .card-name {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 22pt;
    font-weight: 900;
    letter-spacing: 0.04em;
    color: #FFFFFF;
    margin: 0;
    line-height: 0.9;
    text-shadow: 0 0.5mm 1mm rgba(0,0,0,0.3);
    /* Prevent browser auto-hyphenation on long compound names like
       "GRÜNSCHWINGE" or "DRACHEN-MUTTER". CardFront also shrinks the
       font-size inline for 9+ char names so they fit one line. */
    hyphens: none;
    -webkit-hyphens: none;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
  }
  .card-hp {
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
  .hp-label { font-size: 7pt; font-weight: 800; }
  .hp-value {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 15pt;
    font-weight: 900;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  /* Portrait */
  .card-portrait {
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
  .portrait-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .portrait-dragon {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: drop-shadow(0 2mm 3mm rgba(181,83,9,0.2));
  }
  /* Watercolor characters (Ronki / Feuerspitze / Grünschwinge /
     Glutfunke / Dr. Funkel) have significant whitespace padding
     around the creature. Cropping them looks wrong. Use contain
     instead — the yellow sunburst frame fills the letterbox and
     reads as an intentional halo. */
  .portrait-dragon.fit-contain {
    object-fit: contain;
    padding: 2mm;
    filter: drop-shadow(0 2mm 3mm rgba(181,83,9,0.35));
  }
  .portrait-corner {
    position: absolute;
    width: 4mm;
    height: 4mm;
    border: 0.4mm solid #FDD134;
    opacity: 0.8;
    z-index: 2;
  }
  .portrait-corner.tl { top: 1mm; left: 1mm; border-right: 0; border-bottom: 0; }
  .portrait-corner.tr { top: 1mm; right: 1mm; border-left: 0; border-bottom: 0; }
  .portrait-corner.bl { bottom: 1mm; left: 1mm; border-right: 0; border-top: 0; }
  .portrait-corner.br { bottom: 1mm; right: 1mm; border-left: 0; border-top: 0; }

  /* Abilities */
  .card-abilities {
    display: flex;
    flex-direction: column;
    gap: 1.8mm;
    padding: 2.5mm 3mm;
    background: rgba(255,255,255,0.94);
    border-radius: 2.5mm;
    border: 0.3mm solid rgba(253,209,52,0.4);
  }
  .ability {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2mm;
  }
  .ab-name {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 9pt;
    color: #040812;
    letter-spacing: -0.01em;
  }
  .ab-bar { display: flex; gap: 1mm; }
  .dot {
    width: 2.5mm;
    height: 2.5mm;
    border-radius: 50%;
    display: inline-block;
  }
  .dot.on {
    background: #FDD134;
    box-shadow: inset 0 0 0 0.3mm #A83E2C;
  }
  .dot.off {
    background: transparent;
    box-shadow: inset 0 0 0 0.3mm rgba(4,8,18,0.25);
  }

  /* Footer */
  .card-footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2mm;
    padding-top: 2mm;
  }
  .rarity {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 8pt;
    font-weight: 900;
    letter-spacing: 0.16em;
    color: #FDD134;
    margin: 0;
    text-shadow: 0 0.3mm 0.5mm rgba(0,0,0,0.4);
  }
  .set-info {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 500;
    color: rgba(255,255,255,0.75);
    margin: 0;
  }
  .set-info strong { color: #FFFFFF; font-weight: 800; }

  /* ── CARD BACK ─────────────────────────────────── */
  .card-back {
    background: #FFFFFF;
    background-image:
      radial-gradient(ellipse 90% 60% at 100% 0%, rgba(5,68,176,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 90% 50% at 0% 100%, rgba(253,209,52,0.22) 0%, transparent 55%);
  }
  .card-back::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4mm;
    background: linear-gradient(90deg, #0544B0, #FDD134);
  }
  .card-back-inner {
    height: 100%;
    padding: 9mm 8mm 7mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .back-eyebrow {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 800;
    color: #0544B0;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin: 0 0 2.5mm;
  }

  .back-headline {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 17pt;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: #040812;
    margin: 0 0 1.5mm;
  }

  .back-sub {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 10.5pt;
    font-style: italic;
    color: #0544B0;
    margin: 0 0 4mm;
  }

  /* Sign + name block — the Unterschrift bit */
  .sign-block {
    display: flex;
    flex-direction: column;
    gap: 2.5mm;
    padding: 3mm 3mm;
    background: rgba(255,255,255,0.6);
    border-radius: 2mm;
    border: 0.3mm solid rgba(253,209,52,0.45);
    width: 100%;
    margin: 0 0 4mm;
  }
  .sign-row {
    display: flex;
    align-items: baseline;
    gap: 2mm;
    text-align: left;
  }
  .sign-row label {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 8pt;
    font-weight: 800;
    color: #040812;
    white-space: nowrap;
    flex-shrink: 0;
    letter-spacing: 0.01em;
  }
  .sign-line {
    flex: 1;
    height: 4mm;
    border-bottom: 0.4mm solid rgba(4,8,18,0.4);
  }

  /* 3-step parent instruction */
  .back-steps {
    list-style: none;
    padding: 0;
    margin: 0 0 4mm;
    display: flex;
    flex-direction: column;
    gap: 1.8mm;
    width: 100%;
  }
  .back-steps > li {
    display: flex;
    align-items: center;
    gap: 3mm;
    padding: 1.8mm 3mm;
    background: rgba(255,255,255,0.7);
    border-radius: 2.5mm;
    text-align: left;
  }
  .bstep-num {
    width: 6.5mm;
    height: 6.5mm;
    border-radius: 50%;
    background: #0544B0;
    color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 9pt;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    line-height: 1;
  }
  .bstep-text {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 600;
    font-size: 9pt;
    color: #040812;
    line-height: 1.25;
  }
  .bstep-text strong { color: #A83E2C; font-weight: 800; }

  /* QR row */
  .back-qr-row {
    display: flex;
    align-items: center;
    gap: 3mm;
    margin: 0 auto 3mm;
  }
  .back-qr {
    width: 20mm;
    height: 20mm;
    border-radius: 2mm;
    border: 0.4mm solid rgba(4,8,18,0.15);
  }
  .back-qr-text { text-align: left; }
  .qr-hint-lg {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 9pt;
    color: #040812;
    margin: 0;
    line-height: 1.1;
  }
  .qr-hint-sm {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 8pt;
    color: rgba(4,8,18,0.65);
    margin: 0.5mm 0 0;
  }

  .back-foot {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 6.5pt;
    color: rgba(4,8,18,0.55);
    margin: auto 0 0;
    text-align: center;
    letter-spacing: 0.04em;
  }
  .back-foot strong { color: #040812; font-weight: 800; }
`;

/* ── Local: A6 preview + print CSS ───────────────────────── */

const a6PrintCss = `
  .print-root {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    min-height: 100vh;
    padding: 32px 16px 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  .print-root * { box-sizing: border-box; }

  @media print {
    @page { size: A6; margin: 0; }
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
    .flyer-page {
      box-shadow: none !important;
      margin: 0 !important;
      page-break-after: always;
      break-after: page;
    }
    .flyer-page:last-of-type {
      page-break-after: auto;
      break-after: auto;
    }
    .no-print { display: none !important; }
  }
`;

/* ── Default export: single-card preview page ────────────── */

export default function PrintA6FlyerKidsCard() {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  const [dragon, setDragon] = useState<Dragon>(() => {
    const slug = new URLSearchParams(window.location.search).get('d');
    return findDragon(slug) ?? pickRandomDragon();
  });

  const roll = () => setDragon((d) => pickRandomDragon(d.slug));

  return (
    <div className="print-root">
      <div className="no-print" style={instructionBarStyle}>
        <strong style={{ fontWeight: 700 }}>
          Sammelkarte „{dragon.name}" Druckvorschau
        </strong>
        <span style={{ opacity: 0.7, marginLeft: 12 }}>
          6 Drachen im Pool &middot; Cmd/Ctrl + P &middot; A6 &middot; Ränder: Keine
        </span>
        <button onClick={roll} style={rollBtnStyle}>
          Anderer Drache 🎲
        </button>
        <button onClick={() => window.print()} style={printBtnStyle}>
          Drucken / Als PDF
        </button>
      </div>

      <CardFront dragon={dragon} />
      <CardBack />

      <style>{a6PrintCss + cardCss}</style>
    </div>
  );
}

const instructionBarStyle: React.CSSProperties = {
  position: 'sticky',
  top: 16,
  zIndex: 20,
  background: '#040812',
  color: '#FFFFFF',
  padding: '10px 18px',
  borderRadius: 999,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  maxWidth: 760,
  width: '100%',
};

const printBtnStyle: React.CSSProperties = {
  marginLeft: 'auto',
  background: '#FDD134',
  color: '#040812',
  border: 0,
  padding: '6px 14px',
  borderRadius: 999,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontWeight: 700,
  fontSize: 12,
  cursor: 'pointer',
  flexShrink: 0,
};

const rollBtnStyle: React.CSSProperties = {
  ...printBtnStyle,
  marginLeft: 'auto',
  background: '#0544B0',
  color: '#FFFFFF',
};
