/* ────────────────────────────────────────────────────────────────────────────
 * Custom editorial figures for Ratgeber articles.
 *
 * Each component is a stand-alone SVG/HTML block that illustrates one specific
 * point in an article. Clean palette (teal-dark, teal, sage, mustard, cream),
 * Plus Jakarta Sans for display text, Be Vietnam Pro for captions.
 * ──────────────────────────────────────────────────────────────────────────── */

import { ReactNode } from 'react';

const COLOR = {
  tealDark: '#040812',
  teal: '#0544B0',
  sage: '#0544B0',
  mustard: '#FDD134',
  mustardDeep: '#EE4F35',
  cream: '#FFFFFF',
  ink: '#040812',
} as const;

/* ─────────── Shared figure wrapper ─────────────────────────────────────── */

function FigureWrap({
  children,
  caption,
  wide = false,
  label,
}: {
  children: ReactNode;
  caption?: string;
  wide?: boolean;
  label?: string;
}) {
  return (
    <figure
      className={`ratgeber-figure ratgeber-figure--custom ${wide ? 'ratgeber-figure--wide' : ''}`}
      role="img"
      aria-label={label}
    >
      <div className="ratgeber-figure__canvas">{children}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/* ─────────── Timeline (used by Morgenroutine + Abendroutine) ───────────── */

export interface TimelineStop {
  time: string;
  label: string;
  body?: string;
  highlight?: boolean;
}

export function Timeline({
  stops,
  caption,
  direction = 'morning',
  ariaLabel,
}: {
  stops: TimelineStop[];
  caption?: string;
  direction?: 'morning' | 'evening';
  ariaLabel?: string;
}) {
  return (
    <FigureWrap caption={caption} wide label={ariaLabel}>
      <div className={`rg-timeline rg-timeline--${direction}`}>
        <div className="rg-timeline__rail" aria-hidden>
          <div className="rg-timeline__line" />
        </div>
        <ol className="rg-timeline__stops">
          {stops.map((s, i) => (
            <li
              key={`${s.time}-${i}`}
              className={`rg-timeline__stop ${s.highlight ? 'is-highlight' : ''}`}
            >
              <span className="rg-timeline__time">{s.time}</span>
              <span className="rg-timeline__dot" aria-hidden />
              <span className="rg-timeline__label">{s.label}</span>
              {s.body && <span className="rg-timeline__body">{s.body}</span>}
            </li>
          ))}
        </ol>
      </div>
    </FigureWrap>
  );
}

/* ─────────── StickerDecayCurve — reward-inflation visual joke ──────────── */

export function StickerDecayCurve() {
  const bars = [
    { x: 100, height: 60, label: '1 Sticker', week: 'Woche 1' },
    { x: 250, height: 130, label: 'ein Eis?', week: 'Woche 3' },
    { x: 400, height: 220, label: 'Lego?', week: 'Woche 5' },
  ];
  const baselineY = 280;

  return (
    <FigureWrap
      wide
      label="Balkendiagramm, das zeigt, wie die geforderte Belohnung Woche für Woche steigt bis das Sticker-Chart verschwindet."
      caption="Die Kurve jeder Sticker-Reform, die ich in Elterngruppen je gesehen habe."
    >
      <svg
        viewBox="0 0 680 340"
        xmlns="http://www.w3.org/2000/svg"
        className="rg-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Axis title */}
        <text
          x="40"
          y="40"
          fontFamily="Plus Jakarta Sans"
          fontWeight="700"
          fontSize="13"
          fill={COLOR.teal}
          letterSpacing="2"
        >
          WAS DAS KIND FORDERT
        </text>

        {/* Baseline */}
        <line
          x1="40"
          y1={baselineY}
          x2="640"
          y2={baselineY}
          stroke={COLOR.teal}
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />

        {/* Escalating mustard bars */}
        {bars.map((b) => (
          <g key={b.week}>
            <rect
              x={b.x}
              y={baselineY - b.height}
              width="110"
              height={b.height}
              rx="6"
              fill={COLOR.mustard}
            />
            {/* subtle inner highlight */}
            <rect
              x={b.x + 4}
              y={baselineY - b.height + 4}
              width="4"
              height={b.height - 8}
              rx="2"
              fill="#fff"
              opacity="0.3"
            />
            {/* Ask label */}
            <text
              x={b.x + 55}
              y={baselineY - b.height - 16}
              textAnchor="middle"
              fontFamily="Plus Jakarta Sans"
              fontWeight="700"
              fontSize="18"
              fill={COLOR.tealDark}
            >
              {b.label}
            </text>
            {/* Week label */}
            <text
              x={b.x + 55}
              y={baselineY + 28}
              textAnchor="middle"
              fontFamily="Plus Jakarta Sans"
              fontWeight="600"
              fontSize="12"
              fill={COLOR.teal}
              letterSpacing="1"
            >
              {b.week.toUpperCase()}
            </text>
          </g>
        ))}

        {/* Week 8: ghost bar, chart forgotten */}
        <g>
          <rect
            x="550"
            y={baselineY - 120}
            width="110"
            height="120"
            rx="6"
            fill="none"
            stroke={COLOR.teal}
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <text
            x="605"
            y={baselineY - 136}
            textAnchor="middle"
            fontFamily="Plus Jakarta Sans"
            fontWeight="600"
            fontSize="14"
            fill={COLOR.teal}
            opacity="0.7"
          >
            (Chart verschwindet)
          </text>
          <text
            x="605"
            y={baselineY + 28}
            textAnchor="middle"
            fontFamily="Plus Jakarta Sans"
            fontWeight="600"
            fontSize="12"
            fill={COLOR.teal}
            opacity="0.7"
            letterSpacing="1"
          >
            WOCHE 8
          </text>
        </g>

        {/* Arrow pointing down into ghost bar */}
        <path
          d="M 500 160 Q 525 170 540 195"
          fill="none"
          stroke={COLOR.mustardDeep}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 4"
        />
        <path
          d="M 538 192 l 3 8 l 8 -3"
          fill="none"
          stroke={COLOR.mustardDeep}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </FigureWrap>
  );
}

/* ─────────── DarkPatternMockup — annotated kids-app screen ─────────────── */

export function DarkPatternMockup() {
  return (
    <FigureWrap
      wide
      label="Stilisierte Kinder-App mit vier markierten Dark-Pattern-Elementen: Streak, Fortschritts-Druck, Sozialer Vergleich, Mystery-Box."
      caption="Eine Fantasie-App, aber jedes einzelne Element gibt's da draußen. Mehrfach."
    >
      <svg
        viewBox="0 0 680 500"
        xmlns="http://www.w3.org/2000/svg"
        className="rg-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="phoneShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.15" />
            <stop offset="1" stopColor="#000" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Phone frame */}
        <g transform="translate(430, 30)">
          {/* shadow */}
          <rect x="4" y="8" width="220" height="440" rx="36" fill="url(#phoneShadow)" />
          {/* body */}
          <rect
            x="0"
            y="0"
            width="220"
            height="440"
            rx="36"
            fill={COLOR.tealDark}
          />
          {/* screen */}
          <rect x="10" y="10" width="200" height="420" rx="28" fill={COLOR.cream} />
          {/* notch */}
          <rect x="80" y="18" width="60" height="14" rx="7" fill={COLOR.tealDark} />

          {/* ── fake UI ── */}

          {/* Streak banner */}
          <g transform="translate(22, 50)">
            <rect width="176" height="42" rx="10" fill={COLOR.mustardDeep} fillOpacity="0.15" />
            <circle cx="20" cy="21" r="10" fill={COLOR.mustardDeep} />
            <text x="20" y="26" textAnchor="middle" fontSize="11" fill="#fff" fontFamily="Plus Jakarta Sans" fontWeight="700">🔥</text>
            <text x="40" y="19" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="700" fill={COLOR.tealDark}>
              12 TAGE SERIE!
            </text>
            <text x="40" y="32" fontSize="9" fontFamily="Plus Jakarta Sans" fill={COLOR.tealDark} opacity="0.7">
              nicht verlieren
            </text>
          </g>

          {/* Progress bar */}
          <g transform="translate(22, 110)">
            <text x="0" y="0" fontSize="9" fontFamily="Plus Jakarta Sans" fontWeight="600" fill={COLOR.teal} letterSpacing="1">
              87% GESCHAFFT
            </text>
            <rect x="0" y="10" width="176" height="8" rx="4" fill={COLOR.teal} fillOpacity="0.15" />
            <rect x="0" y="10" width="153" height="8" rx="4" fill={COLOR.sage} />
            <text x="176" y="34" textAnchor="end" fontSize="8.5" fontFamily="Plus Jakarta Sans" fill={COLOR.tealDark} opacity="0.7">
              nur noch 13% bis Level 4!
            </text>
          </g>

          {/* Social bubble */}
          <g transform="translate(22, 170)">
            <rect width="176" height="50" rx="10" fill={COLOR.teal} fillOpacity="0.08" />
            <circle cx="22" cy="25" r="12" fill={COLOR.sage} />
            <text x="22" y="29" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="Plus Jakarta Sans" fontWeight="700">M</text>
            <text x="42" y="22" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="700" fill={COLOR.tealDark}>
              Max war fleißig!
            </text>
            <text x="42" y="35" fontSize="9" fontFamily="Plus Jakarta Sans" fill={COLOR.tealDark} opacity="0.7">
              5 Aufgaben heute 🏆
            </text>
          </g>

          {/* Mystery Box */}
          <g transform="translate(22, 240)">
            <rect width="176" height="70" rx="12" fill={COLOR.mustard} />
            <rect x="22" y="14" width="32" height="32" rx="4" fill={COLOR.tealDark} />
            <text x="38" y="34" textAnchor="middle" fontSize="16" fontFamily="Plus Jakarta Sans" fill={COLOR.mustard}>?</text>
            <text x="66" y="28" fontSize="11" fontFamily="Plus Jakarta Sans" fontWeight="800" fill={COLOR.tealDark}>
              MYSTERY-BOX
            </text>
            <text x="66" y="42" fontSize="9" fontFamily="Plus Jakarta Sans" fill={COLOR.tealDark} opacity="0.8">
              was drin ist? wer weiß!
            </text>
            <rect x="20" y="52" width="136" height="4" rx="2" fill={COLOR.tealDark} opacity="0.1" />
          </g>

          {/* Push banner at top */}
          <g transform="translate(22, 340)">
            <rect width="176" height="60" rx="10" fill={COLOR.tealDark} />
            <text x="12" y="20" fontSize="9" fontFamily="Plus Jakarta Sans" fontWeight="700" fill={COLOR.mustard} letterSpacing="1">
              PUSH · GERADE EBEN
            </text>
            <text x="12" y="36" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="700" fill={COLOR.cream}>
              Dein Drache vermisst dich 🐉
            </text>
            <text x="12" y="50" fontSize="9.5" fontFamily="Plus Jakarta Sans" fill={COLOR.cream} opacity="0.75">
              komm zurück bevor dein Ei kühl wird
            </text>
          </g>
        </g>

        {/* ── Annotations on the left ── */}
        {[
          { y: 68, label: 'Streak + Verlust-Angst', note: '"nicht verlieren" macht aus einem Gefühl eine Verpflichtung' },
          { y: 180, label: 'Sozialer Druck', note: 'andere Kinder als Tempo-Vorgabe' },
          { y: 270, label: 'Variable Belohnung', note: 'das Casino-Prinzip, kindgerecht verpackt' },
          { y: 370, label: 'FOMO-Push', note: 'emotionaler Appell zur App-Rückkehr' },
        ].map((a, i) => (
          <g key={i}>
            <text
              x="30"
              y={a.y}
              fontFamily="Plus Jakarta Sans"
              fontWeight="800"
              fontSize="15"
              fill={COLOR.tealDark}
              letterSpacing="-0.005em"
            >
              {a.label}
            </text>
            <text
              x="30"
              y={a.y + 20}
              fontFamily="Be Vietnam Pro"
              fontSize="12.5"
              fill={COLOR.teal}
              opacity="0.85"
            >
              {a.note}
            </text>
            {/* connecting line */}
            <path
              d={`M 300 ${a.y - 4} Q 380 ${a.y - 4} 420 ${a.y + 12}`}
              fill="none"
              stroke={COLOR.mustardDeep}
              strokeWidth="1.2"
              strokeOpacity="0.55"
              strokeDasharray="3 4"
            />
            <circle cx="420" cy={a.y + 12} r="3" fill={COLOR.mustardDeep} />
          </g>
        ))}
      </svg>
    </FigureWrap>
  );
}

/* ─────────── EinschulungComparison — erwartet vs. nicht erwartet ───────── */

export function EinschulungComparison() {
  const expected = [
    'Sich selbst an- und ausziehen',
    'Ranzen alleine packen und tragen',
    '20 bis 30 Minuten zuhören',
    'Einfache Anweisungen umsetzen',
    'Eigenen Namen schreiben',
    'Zählen bis 10',
    'Konflikte mit Worten anfangen',
  ];
  const notExpected = [
    'Lesen können',
    'Flüssig rechnen',
    '45 Minuten stillsitzen',
    'Schleife perfekt binden',
    'Groß- und Kleinbuchstaben',
  ];

  return (
    <FigureWrap
      wide
      label="Zwei-Spalten-Vergleich: was die Schule bei Einschulung erwartet versus was sie nicht erwartet."
    >
      <div className="rg-compare">
        <div className="rg-compare__col rg-compare__col--yes">
          <p className="rg-compare__label">Das erwartet die Schule</p>
          <ul className="rg-compare__list">
            {expected.map((t) => (
              <li key={t}>
                <span className="rg-compare__mark" aria-hidden>
                  <svg viewBox="0 0 12 12" width="12" height="12">
                    <path d="M2 6.5 L5 9 L10 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rg-compare__col rg-compare__col--no">
          <p className="rg-compare__label">Das erwartet sie nicht</p>
          <ul className="rg-compare__list">
            {notExpected.map((t) => (
              <li key={t}>
                <span className="rg-compare__mark" aria-hidden>
                  <svg viewBox="0 0 12 12" width="12" height="12">
                    <path d="M3 3 L9 9 M9 3 L3 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FigureWrap>
  );
}

/* ─────────── TroedelLoop — stress feedback loop ────────────────────────── */

export function TroedelLoop() {
  const nodes = [
    { angle: -90, label: 'Zeitdruck', body: 'die Uhr tickt' },
    { angle: 0, label: 'Cortisol', body: 'Stress steigt' },
    { angle: 90, label: 'Exekutivfunktion', body: 'blockiert' },
    { angle: 180, label: 'Kind verlangsamt', body: 'Tank leer' },
  ];
  const cx = 340;
  const cy = 225;
  const r = 170;

  return (
    <FigureWrap
      wide
      label="Kreis-Diagramm mit vier Stationen einer Stress-Schleife: Zeitdruck, Cortisol, blockierte Exekutivfunktion, Kind verlangsamt."
      caption="Je lauter du wirst, desto langsamer wird das Kind. Der Kreis schließt sich von selbst."
    >
      <svg
        viewBox="0 0 680 440"
        xmlns="http://www.w3.org/2000/svg"
        className="rg-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Circle path */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={COLOR.sage}
          strokeOpacity="0.3"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />

        {/* Arrow heads on the loop */}
        {[45, 135, 225, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = cx + Math.cos(rad) * r;
          const y = cy + Math.sin(rad) * r;
          const tangentRad = rad + Math.PI / 2;
          const tx = Math.cos(tangentRad);
          const ty = Math.sin(tangentRad);
          const size = 8;
          return (
            <polygon
              key={deg}
              points={`${x},${y} ${x - tx * size - ty * 4},${y - ty * size + tx * 4} ${x - tx * size + ty * 4},${y - ty * size - tx * 4}`}
              fill={COLOR.mustardDeep}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = cx + Math.cos(rad) * r;
          const y = cy + Math.sin(rad) * r;
          return (
            <g key={n.label}>
              <circle cx={x} cy={y} r="48" fill={COLOR.cream} stroke={COLOR.mustard} strokeWidth="2" />
              <text
                x={x}
                y={y - 3}
                textAnchor="middle"
                fontFamily="Plus Jakarta Sans"
                fontWeight="800"
                fontSize="13"
                fill={COLOR.tealDark}
              >
                {n.label}
              </text>
              <text
                x={x}
                y={y + 13}
                textAnchor="middle"
                fontFamily="Be Vietnam Pro"
                fontSize="10.5"
                fill={COLOR.teal}
                opacity="0.85"
              >
                {n.body}
              </text>
            </g>
          );
        })}

        {/* Center label */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontFamily="Plus Jakarta Sans"
          fontWeight="700"
          fontSize="11"
          fill={COLOR.mustardDeep}
          letterSpacing="2"
        >
          DIE STRESS-SCHLEIFE
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fontFamily="Be Vietnam Pro"
          fontSize="11"
          fill={COLOR.teal}
          opacity="0.7"
        >
          läuft ohne dein Zutun
        </text>
      </svg>
    </FigureWrap>
  );
}

/* ─────────── Shared styles ─────────────────────────────────────────────── */

export function RatgeberFiguresStyles() {
  return (
    <style>{`
      .ratgeber-figure--custom .ratgeber-figure__canvas {
        background: linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%);
        border-radius: 1.25rem;
        padding: 1.5rem 1rem;
        ring: 1px solid rgba(5, 68, 176, 0.15);
        box-shadow: 0 8px 24px -12px rgba(4, 8, 18, 0.1);
      }
      @media (min-width: 640px) {
        .ratgeber-figure--custom .ratgeber-figure__canvas {
          padding: 2rem 1.5rem;
        }
      }
      .ratgeber-figure--custom .rg-svg {
        width: 100%;
        height: auto;
        display: block;
      }

      /* ── Timeline ──────────────────────────────────────────────────── */
      .rg-timeline {
        position: relative;
        padding: 0.5rem 0.5rem 0;
      }
      .rg-timeline__rail {
        position: absolute;
        left: 0;
        right: 0;
        top: 44px;
        height: 2px;
      }
      .rg-timeline__line {
        position: absolute;
        left: 2rem;
        right: 2rem;
        top: 0;
        height: 2px;
        background: repeating-linear-gradient(to right, #0544B0 0 6px, transparent 6px 12px);
        opacity: 0.5;
      }
      .rg-timeline__stops {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 0.5rem;
        list-style: none;
        padding: 0;
        margin: 0;
        position: relative;
      }
      @media (max-width: 640px) {
        .rg-timeline__rail { display: none; }
        .rg-timeline__stops {
          grid-template-columns: 1fr;
          gap: 0.9rem;
        }
      }
      .rg-timeline__stop {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 0;
        margin: 0;
      }
      @media (max-width: 640px) {
        .rg-timeline__stop {
          flex-direction: row;
          align-items: flex-start;
          text-align: left;
          gap: 0.75rem;
        }
        .rg-timeline__stop::before {
          content: '';
          position: absolute;
          left: 2.15rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: repeating-linear-gradient(to bottom, #0544B0 0 4px, transparent 4px 9px);
          opacity: 0.3;
        }
      }
      .rg-timeline__time {
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-weight: 700;
        font-size: 0.75rem;
        color: #0544B0;
        letter-spacing: 0.08em;
        margin-bottom: 0.4rem;
        text-align: center;
      }
      @media (max-width: 640px) {
        .rg-timeline__time {
          min-width: 2.75rem;
          margin-bottom: 0;
          padding-top: 0.35rem;
        }
      }
      .rg-timeline__dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #FFFFFF;
        border: 2px solid #FDD134;
        position: relative;
        z-index: 1;
      }
      @media (max-width: 640px) {
        .rg-timeline__dot {
          margin-top: 0.4rem;
        }
      }
      .rg-timeline__stop.is-highlight .rg-timeline__dot {
        background: #FDD134;
        box-shadow: 0 0 0 4px rgba(253, 209, 52, 0.25);
      }
      .rg-timeline__label {
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-weight: 700;
        font-size: 0.95rem;
        color: #040812;
        margin-top: 0.6rem;
        line-height: 1.2;
      }
      @media (max-width: 640px) {
        .rg-timeline__label { margin-top: 0; }
      }
      .rg-timeline__body {
        font-family: 'Be Vietnam Pro', system-ui, sans-serif;
        font-size: 0.78rem;
        color: rgba(26, 32, 34, 0.65);
        margin-top: 0.25rem;
        line-height: 1.35;
      }

      /* ── Compare ───────────────────────────────────────────────────── */
      .rg-compare {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      @media (min-width: 640px) {
        .rg-compare {
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
      }
      .rg-compare__col {
        padding: 1.5rem 1.25rem;
        border-radius: 1rem;
      }
      .rg-compare__col--yes {
        background: rgba(5, 68, 176, 0.1);
        color: #040812;
      }
      .rg-compare__col--yes .rg-compare__mark {
        background: #0544B0;
        color: #fff;
      }
      .rg-compare__col--no {
        background: rgba(4, 8, 18, 0.92);
        color: #FFFFFF;
      }
      .rg-compare__col--no .rg-compare__mark {
        background: #FDD134;
        color: #040812;
      }
      .rg-compare__label {
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-weight: 800;
        font-size: 0.7rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        margin: 0 0 1rem;
        opacity: 0.85;
      }
      .rg-compare__col--no .rg-compare__label {
        color: #FDD134;
      }
      .rg-compare__list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .rg-compare__list li {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-weight: 600;
        font-size: 1rem;
        line-height: 1.4;
      }
      .rg-compare__col--no .rg-compare__list li {
        color: rgba(255, 255, 255, 0.95);
      }
      .rg-compare__mark {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        margin-top: 1px;
      }
    `}</style>
  );
}
