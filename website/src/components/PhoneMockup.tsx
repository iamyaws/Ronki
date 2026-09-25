/**
 * Phone mockup — print-crisp inline HTML/CSS recreations of Ronki app screens.
 *
 * Replaces low-res raster screenshots. Each variant shows ONE zoomed-in slice
 * of the app matched to a poster narrative.
 *
 * Design decisions:
 * - Inline SVG icons, no icon-font dependency
 * - Plus Jakarta Sans + Be Vietnam Pro (poster fonts, not app's Fredoka) so
 *   the mockup reads as "the app's product" rather than a foreign paste-in
 * - Brand palette (#040812 teal, #0544B0 teal-2, #0544B0 sage, #FDD134 mustard,
 *   #FFFFFF cream)
 * - Shows FEWER elements at BIGGER size than a literal screenshot would
 *
 * Scale model:
 * - `scale` prop (default 1) drives `--mockup-scale` CSS var
 * - All internal dimensions use `calc(X * var(--mockup-scale))`
 * - Print uses scale=1 (calibrated for 32×58mm phone-frame)
 * - Web hero: ~2.5; web inline: ~1.5
 */

import { CSSProperties, ReactNode } from 'react';

type Locale = 'de' | 'en';

/**
 * Locale strings for the mockup. Keep variant-scoped keys nested so each
 * variant's dictionary can grow without colliding. Only variants that have
 * been translated need both locales; untranslated variants stay DE-only and
 * ignore the locale prop.
 */
const L = {
  de: {
    back: 'Lager',
    nav: {
      lager: 'Lager',
      quests: 'Quests',
      laden: 'Laden',
      buch: 'Buch',
      ronki: 'Ronki',
    },
    morgenAnchor: {
      eyebrow: 'Mittwoch · Woche 3',
      h1Prefix: 'Deine Aufgaben, ',
      h1Suffix: '.',
      sectionTitle: 'Morgen',
      sectionHint: 'Noch 4 offen.',
      taskGetDressed: 'Anziehen',
      taskGetDressedHint: '8° / 14°, Jacke mit',
      taskBreakfast: 'Frühstück',
      taskBrushTeeth: 'Zähne putzen',
    },
  },
  en: {
    back: 'Camp',
    nav: {
      lager: 'Camp',
      quests: 'Quests',
      laden: 'Shop',
      buch: 'Book',
      ronki: 'Ronki',
    },
    morgenAnchor: {
      eyebrow: 'Wednesday · Week 3',
      h1Prefix: 'Your quests, ',
      h1Suffix: '.',
      sectionTitle: 'Morning',
      sectionHint: '4 left to go.',
      taskGetDressed: 'Get dressed',
      taskGetDressedHint: '8° / 14°, bring a jacket',
      taskBreakfast: 'Breakfast',
      taskBrushTeeth: 'Brush teeth',
    },
  },
} as const;

type PhoneMockupVariant =
  | 'morgen-anchor'
  | 'zahne-quest'
  | 'nacht-anchor'
  | 'mood-grid'
  | 'clean-aufgaben';

interface PhoneMockupProps {
  variant: PhoneMockupVariant;
  /** Scale factor for all internal dimensions. 1 = print. Web: 1.5-3. */
  scale?: number;
  /**
   * Display language. Defaults to German. Currently only `morgen-anchor`
   * honours the locale; other variants render DE regardless.
   */
  locale?: Locale;
}

// ─── Shared sub-components ────────────────────────────────────────────

function TopBar({
  hp = 128,
  rightSlot,
  locale = 'de',
}: {
  hp?: number | null;
  rightSlot?: ReactNode;
  locale?: Locale;
}) {
  return (
    <div className="pm-topbar">
      <div className="pm-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>{L[locale].back}</span>
      </div>
      {rightSlot
        ? rightSlot
        : hp !== null && (
            <div className="pm-hp">
              <span className="pm-pearl" aria-hidden />
              <b>{hp}</b>
              <span className="pm-hp-label">HP</span>
            </div>
          )}
    </div>
  );
}

function ParentLockButton() {
  return (
    <div className="pm-parent-lock" aria-label="Eltern-Bereich">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11 V7 a4 4 0 0 1 8 0 V11" />
      </svg>
    </div>
  );
}

function NavBar({
  active,
  locale = 'de',
}: {
  active: 'lager' | 'quests' | 'laden' | 'buch' | 'ronki';
  locale?: Locale;
}) {
  const t = L[locale].nav;
  const items: Array<{ key: typeof active; label: string; icon: ReactNode }> = [
    {
      key: 'lager',
      label: t.lager,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2 L7 9 H9 L5 15 H8 L4 21 H20 L16 15 H19 L15 9 H17 Z" />
        </svg>
      ),
    },
    {
      key: 'quests',
      label: t.quests,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2 L14.5 8.5 L22 9.3 L16.5 14 L18 21 L12 17.5 L6 21 L7.5 14 L2 9.3 L9.5 8.5 Z" />
        </svg>
      ),
    },
    {
      key: 'laden',
      label: t.laden,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 7 h14 l-1.5 13 H6.5 z" />
          <path d="M9 7 V5 a3 3 0 0 1 6 0 V7" />
        </svg>
      ),
    },
    {
      key: 'buch',
      label: t.buch,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 5 a2 2 0 0 1 2-2 h12 v17 H6 a2 2 0 0 0-2 2 V5 z" />
          <line x1="8" y1="8" x2="15" y2="8" />
          <line x1="8" y1="12" x2="15" y2="12" />
        </svg>
      ),
    },
    {
      key: 'ronki',
      label: t.ronki,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="7" cy="9" r="2.3" />
          <circle cx="17" cy="9" r="2.3" />
          <circle cx="5" cy="14" r="1.8" />
          <circle cx="19" cy="14" r="1.8" />
          <ellipse cx="12" cy="18" rx="5" ry="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="pm-navbar">
      {items.map((item) => (
        <div key={item.key} className={`pm-nav-btn ${active === item.key ? 'active' : ''}`}>
          <div className="pm-nav-icon">{item.icon}</div>
          <span>{item.label}</span>
        </div>
      ))}
    </nav>
  );
}

function MiniRing({ done, total, color = '#FDD134' }: { done: number; total: number; color?: string }) {
  const R = 7;
  const C = 2 * Math.PI * R;
  const pct = total > 0 ? done / total : 0;
  return (
    <div className="pm-mini-ring">
      <svg viewBox="0 0 20 20">
        <circle cx="10" cy="10" r={R} fill="none" stroke="rgba(4,8,18,0.14)" strokeWidth="2" />
        <circle
          cx="10"
          cy="10"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - pct * C}
          transform="rotate(-90 10 10)"
        />
      </svg>
      <span>
        {done}/{total}
      </span>
    </div>
  );
}

function QuestRow({
  icon,
  title,
  hint,
  xp,
  status,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  xp: number;
  status: 'done' | 'next' | 'todo';
}) {
  return (
    <div className={`pm-qrow pm-qrow-${status}`}>
      <div className="pm-qicon">{icon}</div>
      <div className="pm-qbody">
        <p className="pm-qtitle">{title}</p>
        {hint && <p className="pm-qhint">{hint}</p>}
      </div>
      {status === 'done' ? (
        <svg className="pm-qcheck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <span className="pm-qxp">+{xp}</span>
      )}
    </div>
  );
}

// ─── Anchor icons (reusable across variants) ─────────────────────────

const SunIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="5" y1="5" x2="7" y2="7" />
    <line x1="17" y1="17" x2="19" y2="19" />
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
  </svg>
);

const MoonIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ─── Variant: MorgenAnchor ────────────────────────────────────────────

function MorgenAnchor({ locale = 'de' }: { locale?: Locale }) {
  const t = L[locale].morgenAnchor;
  return (
    <>
      <TopBar hp={128} locale={locale} />
      <div className="pm-body">
        <div className="pm-header">
          <p className="pm-eyebrow">{t.eyebrow}</p>
          <h1 className="pm-h1">
            {t.h1Prefix}
            <em>Louis</em>
            {t.h1Suffix}
          </h1>
        </div>

        <section className="pm-anchor pm-anchor-morning">
          <div className="pm-anchor-head">
            <div className="pm-anchor-icon pm-icon-morning">{SunIcon}</div>
            <div className="pm-anchor-body">
              <h3>{t.sectionTitle}</h3>
              <p>{t.sectionHint}</p>
            </div>
            <MiniRing done={2} total={6} />
          </div>
          <div className="pm-quests">
            <QuestRow icon={<span className="pm-emoji">👕</span>} title={t.taskGetDressed} hint={t.taskGetDressedHint} xp={10} status="done" />
            <QuestRow icon={<span className="pm-emoji">🥐</span>} title={t.taskBreakfast} xp={15} status="next" />
            <QuestRow icon={<span className="pm-emoji">🪥</span>} title={t.taskBrushTeeth} xp={12} status="todo" />
          </div>
        </section>
      </div>
      <NavBar active="quests" locale={locale} />
    </>
  );
}

// ─── Variant: NachtAnchor ─────────────────────────────────────────────

function NachtAnchor() {
  return (
    <>
      <TopBar hp={148} />
      <div className="pm-body">
        <div className="pm-header">
          <p className="pm-eyebrow">Abend · vor dem Schlafen</p>
          <h1 className="pm-h1">
            Gute Nacht, <em>Louis</em>.
          </h1>
        </div>

        <section className="pm-anchor pm-anchor-evening">
          <div className="pm-anchor-head">
            <div className="pm-anchor-icon pm-icon-evening">{MoonIcon}</div>
            <div className="pm-anchor-body">
              <h3>Nacht</h3>
              <p>Ruhig runterfahren.</p>
            </div>
            <MiniRing done={1} total={4} color="#6366F1" />
          </div>
          <div className="pm-quests">
            <QuestRow icon={<span className="pm-emoji">🪥</span>} title="Zähne putzen" xp={12} status="done" />
            <QuestRow icon={<span className="pm-emoji">📖</span>} title="Buch vorlesen" xp={15} status="next" />
            <QuestRow icon={<span className="pm-emoji">🌙</span>} title="Ins Bett" xp={8} status="todo" />
          </div>
        </section>
      </div>
      <NavBar active="quests" />
    </>
  );
}

// ─── Variant: ZahneQuest (single-focus) ───────────────────────────────

function ZahneQuest() {
  const R = 22;
  const C = 2 * Math.PI * R;
  const pct = 0.35;
  return (
    <>
      <TopBar hp={140} />
      <div className="pm-body">
        <div className="pm-header">
          <p className="pm-eyebrow">Abendroutine</p>
          <h1 className="pm-h1">
            <em>Zähne</em> putzen.
          </h1>
        </div>

        <section className="pm-focus-card">
          <div className="pm-focus-emoji">🪥</div>
          <div className="pm-timer-ring" aria-label="2-Minuten-Timer">
            <svg viewBox="0 0 50 50">
              <circle cx="25" cy="25" r={R} fill="none" stroke="rgba(4,8,18,0.12)" strokeWidth="3" />
              <circle
                cx="25"
                cy="25"
                r={R}
                fill="none"
                stroke="#0544B0"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C - pct * C}
                transform="rotate(-90 25 25)"
              />
            </svg>
            <div className="pm-timer-label">
              <b>1:17</b>
              <span>von 2:00</span>
            </div>
          </div>
          <p className="pm-focus-hint">Alle Seiten dran. Ronki bleibt dabei.</p>
          <div className="pm-zone-dots" aria-hidden>
            <span className="active" />
            <span className="done" />
            <span />
            <span />
          </div>
        </section>
      </div>
      <NavBar active="quests" />
    </>
  );
}

// ─── Variant: MoodGrid (Buch) ─────────────────────────────────────────

const MOODS: Array<{ id: string; label: string; face: string; tint: string; ink: string }> = [
  { id: 'gut', label: 'Gut', face: '🙂', tint: '#fef3c7', ink: '#A83E2C' },
  { id: 'magisch', label: 'Magisch', face: '🤩', tint: '#fce7f3', ink: '#be185d' },
  { id: 'okay', label: 'Okay', face: '😐', tint: '#e0e7ff', ink: '#4338ca' },
  { id: 'traurig', label: 'Traurig', face: '😔', tint: '#dbeafe', ink: '#1d4ed8' },
  { id: 'besorgt', label: 'Besorgt', face: '😟', tint: '#ede9fe', ink: '#6d28d9' },
  { id: 'muede', label: 'Müde', face: '😴', tint: '#cffafe', ink: '#0e7490' },
];

function MoodGrid() {
  return (
    <>
      <TopBar hp={null} rightSlot={<ParentLockButton />} />
      <div className="pm-body">
        <div className="pm-journal-hero">
          <div className="pm-journal-body">
            <p className="pm-eyebrow">Abenteuer-Buch</p>
            <h1 className="pm-h1">Dein Tag.</h1>
          </div>
          <div className="pm-journal-date">
            <span>Heute</span>
            <b>Di., 21. Apr.</b>
          </div>
        </div>

        <p className="pm-section-label">Aktuelle Stimmung</p>
        <div className="pm-mood-grid">
          {MOODS.map((m, i) => (
            <div
              key={m.id}
              className={`pm-mood-tile ${i === 0 ? 'sel' : ''}`}
              style={i === 0 ? ({ '--mood-tint': m.tint, '--mood-ink': m.ink } as CSSProperties) : undefined}
            >
              <span className="pm-mood-face">{m.face}</span>
              <span className="pm-mood-label">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
      <NavBar active="buch" />
    </>
  );
}

// ─── Variant: CleanAufgaben (Anti-Engagement — completion state) ──────

function CleanAufgaben() {
  return (
    <>
      <TopBar hp={128} />
      <div className="pm-body">
        <div className="pm-header">
          <p className="pm-eyebrow">Mittwoch · Routine durch</p>
          <h1 className="pm-h1">
            Alles geschafft, <em>Louis</em>.
          </h1>
        </div>

        <section className="pm-anchor pm-anchor-done">
          <div className="pm-anchor-head">
            <div className="pm-done-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="pm-anchor-body">
              <h3>Morgen</h3>
              <p>Starker Start.</p>
            </div>
          </div>
          <div className="pm-quests">
            <QuestRow icon={<span className="pm-emoji">👕</span>} title="Anziehen" xp={10} status="done" />
            <QuestRow icon={<span className="pm-emoji">🥐</span>} title="Frühstück" xp={15} status="done" />
            <QuestRow icon={<span className="pm-emoji">🪥</span>} title="Zähne putzen" xp={12} status="done" />
          </div>
        </section>
      </div>
      <NavBar active="quests" />
    </>
  );
}

// ─── Main component ──────────────────────────────────────────────────

export function PhoneMockup({ variant, scale = 1, locale = 'de' }: PhoneMockupProps) {
  const style = { '--mockup-scale': scale } as CSSProperties;
  return (
    <div className="phone-mockup" style={style}>
      {variant === 'morgen-anchor' && <MorgenAnchor locale={locale} />}
      {variant === 'nacht-anchor' && <NachtAnchor />}
      {variant === 'zahne-quest' && <ZahneQuest />}
      {variant === 'mood-grid' && <MoodGrid />}
      {variant === 'clean-aufgaben' && <CleanAufgaben />}

      <style>{`
        /* ── Scale system ──────────────────────────────────────────
         * Every internal mm/pt value is wrapped in calc(X * s) where
         * s = var(--mockup-scale, 1). Print: 1 (calibrated for 32×58mm
         * phone-frame). Web: pass scale prop, e.g. 2.5 for hero. */
        .phone-mockup {
          --s: var(--mockup-scale, 1);
          width: 100%;
          height: 100%;
          background: #FFFFFF;
          background-image:
            radial-gradient(ellipse 90% 40% at 50% 0%, rgba(253,209,52,0.18) 0%, transparent 70%);
          border-radius: calc(3.5mm * var(--s));
          overflow: hidden;
          display: flex;
          flex-direction: column;
          color: #040812;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          position: relative;
        }

        /* ── TopBar ─────────────────────────────────────────────── */
        .pm-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: calc(1.5mm * var(--s)) calc(1.6mm * var(--s)) calc(1mm * var(--s));
          flex-shrink: 0;
        }
        .pm-back {
          display: flex;
          align-items: center;
          gap: calc(0.6mm * var(--s));
          background: rgba(4,8,18,0.08);
          padding: calc(0.8mm * var(--s)) calc(1.4mm * var(--s)) calc(0.8mm * var(--s)) calc(1mm * var(--s));
          border-radius: calc(2mm * var(--s));
          font-size: calc(4.5pt * var(--s));
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #040812;
        }
        .pm-back svg {
          width: calc(2.2mm * var(--s));
          height: calc(2.2mm * var(--s));
        }
        .pm-hp {
          display: flex;
          align-items: center;
          gap: calc(0.6mm * var(--s));
          background: #040812;
          color: #FDD134;
          padding: calc(0.8mm * var(--s)) calc(1.6mm * var(--s));
          border-radius: calc(2mm * var(--s));
          font-size: calc(4.5pt * var(--s));
        }
        .pm-hp b {
          font-weight: 800;
          font-size: calc(5.5pt * var(--s));
          color: #FFFFFF;
          letter-spacing: -0.02em;
        }
        .pm-hp-label {
          font-weight: 700;
          opacity: 0.8;
          letter-spacing: 0.05em;
        }
        .pm-pearl {
          width: calc(1.8mm * var(--s));
          height: calc(1.8mm * var(--s));
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #FFE88A, #FDD134 60%, #D4A017);
          box-shadow: inset 0 0 calc(0.3mm * var(--s)) rgba(255,255,255,0.4);
        }
        .pm-parent-lock {
          width: calc(4mm * var(--s));
          height: calc(4mm * var(--s));
          border-radius: calc(1.2mm * var(--s));
          background: rgba(4,8,18,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #040812;
        }
        .pm-parent-lock svg {
          width: calc(2mm * var(--s));
          height: calc(2mm * var(--s));
        }

        /* ── Body ────────────────────────────────────────────────── */
        .pm-body {
          flex: 1;
          padding: 0 calc(1.6mm * var(--s));
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: calc(1mm * var(--s));
          min-height: 0;
        }

        .pm-header {
          display: flex;
          flex-direction: column;
          gap: calc(0.4mm * var(--s));
        }
        .pm-eyebrow {
          font-size: calc(4pt * var(--s));
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(4,8,18,0.55);
          margin: 0;
        }
        .pm-h1 {
          font-size: calc(7.5pt * var(--s));
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #040812;
          margin: 0;
        }
        .pm-h1 em {
          font-style: italic;
          color: #0544B0;
          font-weight: 700;
        }
        .pm-section-label {
          font-size: calc(4pt * var(--s));
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(4,8,18,0.55);
          margin: calc(0.6mm * var(--s)) 0 calc(0.2mm * var(--s));
        }

        /* ── Anchor card ─────────────────────────────────────────── */
        .pm-anchor {
          border-radius: calc(2mm * var(--s));
          padding: calc(0.9mm * var(--s)) calc(1mm * var(--s)) calc(0.8mm * var(--s));
        }
        .pm-anchor-morning {
          background: #fffbeb;
          border: calc(0.15mm * var(--s)) solid rgba(253,209,52,0.45);
        }
        .pm-anchor-evening {
          background: #eef2ff;
          border: calc(0.15mm * var(--s)) solid rgba(99,102,241,0.25);
        }
        .pm-anchor-done {
          background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
          border: calc(0.15mm * var(--s)) solid rgba(52,211,153,0.35);
        }
        .pm-anchor-head {
          display: flex;
          align-items: center;
          gap: calc(1.2mm * var(--s));
          padding-bottom: calc(1mm * var(--s));
          border-bottom: calc(0.1mm * var(--s)) solid rgba(4,8,18,0.08);
          margin-bottom: calc(1mm * var(--s));
        }
        .pm-anchor-morning .pm-anchor-head { border-bottom-color: rgba(217,119,6,0.15); }
        .pm-anchor-evening .pm-anchor-head { border-bottom-color: rgba(99,102,241,0.15); }
        .pm-anchor-done .pm-anchor-head { border-bottom-color: rgba(52,211,153,0.25); }
        .pm-anchor-icon {
          width: calc(4.5mm * var(--s));
          height: calc(4.5mm * var(--s));
          border-radius: calc(1.2mm * var(--s));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pm-icon-morning {
          background: rgba(217,119,6,0.14);
          color: #A83E2C;
        }
        .pm-icon-evening {
          background: rgba(99,102,241,0.14);
          color: #4338CA;
        }
        .pm-anchor-icon svg {
          width: calc(3mm * var(--s));
          height: calc(3mm * var(--s));
        }
        .pm-done-badge {
          width: calc(4.5mm * var(--s));
          height: calc(4.5mm * var(--s));
          border-radius: calc(1.2mm * var(--s));
          background: rgba(52,211,153,0.18);
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pm-done-badge svg {
          width: calc(3mm * var(--s));
          height: calc(3mm * var(--s));
        }
        .pm-anchor-body {
          flex: 1;
          min-width: 0;
        }
        .pm-anchor-body h3 {
          font-size: calc(6pt * var(--s));
          font-weight: 800;
          color: #040812;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .pm-anchor-body p {
          font-size: calc(4.5pt * var(--s));
          color: rgba(4,8,18,0.6);
          margin: calc(0.2mm * var(--s)) 0 0;
          font-weight: 500;
        }
        .pm-anchor-done .pm-anchor-body h3 { color: #065f46; }
        .pm-anchor-done .pm-anchor-body p { color: rgba(6,95,70,0.75); }
        .pm-mini-ring {
          position: relative;
          width: calc(5mm * var(--s));
          height: calc(5mm * var(--s));
          flex-shrink: 0;
        }
        .pm-mini-ring svg {
          width: 100%;
          height: 100%;
        }
        .pm-mini-ring span {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: calc(4pt * var(--s));
          font-weight: 800;
          color: #040812;
        }

        /* ── Quest rows ──────────────────────────────────────────── */
        .pm-quests {
          display: flex;
          flex-direction: column;
          gap: calc(0.7mm * var(--s));
        }
        .pm-qrow {
          display: flex;
          align-items: center;
          gap: calc(1mm * var(--s));
          background: #FFFFFF;
          border: calc(0.1mm * var(--s)) solid rgba(4,8,18,0.08);
          border-radius: calc(1.5mm * var(--s));
          padding: calc(0.7mm * var(--s)) calc(1mm * var(--s));
        }
        .pm-qrow-next {
          background: #fff;
          border-color: rgba(217,119,6,0.35);
          box-shadow: 0 calc(0.3mm * var(--s)) calc(0.6mm * var(--s)) rgba(217,119,6,0.08);
        }
        .pm-anchor-evening .pm-qrow-next {
          border-color: rgba(99,102,241,0.35);
          box-shadow: 0 calc(0.3mm * var(--s)) calc(0.6mm * var(--s)) rgba(99,102,241,0.08);
        }
        .pm-qrow-done {
          background: rgba(52,211,153,0.08);
          border-color: rgba(52,211,153,0.25);
        }
        .pm-qicon {
          width: calc(4mm * var(--s));
          height: calc(4mm * var(--s));
          border-radius: calc(1mm * var(--s));
          background: rgba(217,119,6,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: calc(3.5pt * var(--s));
        }
        .pm-anchor-evening .pm-qicon { background: rgba(99,102,241,0.12); }
        .pm-qrow-done .pm-qicon {
          background: rgba(52,211,153,0.18);
        }
        .pm-emoji {
          font-size: calc(7pt * var(--s));
          line-height: 1;
        }
        .pm-qrow-next .pm-emoji {
          font-size: calc(8pt * var(--s));
        }
        .pm-qbody {
          flex: 1;
          min-width: 0;
        }
        .pm-qtitle {
          font-size: calc(5pt * var(--s));
          font-weight: 700;
          color: #040812;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .pm-qrow-done .pm-qtitle {
          text-decoration: line-through;
          text-decoration-color: rgba(6,95,70,0.5);
          color: rgba(4,8,18,0.55);
        }
        .pm-qhint {
          font-size: calc(4pt * var(--s));
          color: rgba(4,8,18,0.65);
          margin: calc(0.2mm * var(--s)) 0 0;
          font-weight: 500;
        }
        .pm-qxp {
          font-size: calc(4.2pt * var(--s));
          font-weight: 800;
          color: #A83E2C;
          background: rgba(253,209,52,0.28);
          padding: calc(0.4mm * var(--s)) calc(1mm * var(--s));
          border-radius: calc(1mm * var(--s));
          letter-spacing: -0.01em;
          flex-shrink: 0;
        }
        .pm-qrow-next .pm-qxp {
          background: #FDD134;
          color: #040812;
        }
        .pm-anchor-evening .pm-qrow-next .pm-qxp {
          background: #6366F1;
          color: #FFFFFF;
        }
        .pm-qcheck {
          width: calc(2.5mm * var(--s));
          height: calc(2.5mm * var(--s));
          color: #059669;
          flex-shrink: 0;
        }

        /* ── Focus card (ZahneQuest) ───────────────────────────── */
        .pm-focus-card {
          background: #F4FAF7;
          border: calc(0.15mm * var(--s)) solid rgba(5,68,176,0.35);
          border-radius: calc(2.5mm * var(--s));
          padding: calc(1.5mm * var(--s)) calc(1.2mm * var(--s)) calc(1.2mm * var(--s));
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: calc(0.8mm * var(--s));
        }
        .pm-focus-emoji {
          font-size: calc(14pt * var(--s));
          line-height: 1;
        }
        .pm-timer-ring {
          position: relative;
          width: calc(14mm * var(--s));
          height: calc(14mm * var(--s));
        }
        .pm-timer-ring svg {
          width: 100%;
          height: 100%;
        }
        .pm-timer-label {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: calc(0.1mm * var(--s));
        }
        .pm-timer-label b {
          font-size: calc(8pt * var(--s));
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #040812;
          line-height: 1;
          font-feature-settings: "tnum";
        }
        .pm-timer-label span {
          font-size: calc(3.5pt * var(--s));
          color: rgba(4,8,18,0.6);
          font-weight: 600;
          letter-spacing: 0.03em;
        }
        .pm-focus-hint {
          font-size: calc(4.5pt * var(--s));
          color: rgba(4,8,18,0.7);
          text-align: center;
          margin: 0;
          font-weight: 500;
          line-height: 1.3;
          max-width: 80%;
        }
        .pm-zone-dots {
          display: flex;
          gap: calc(1mm * var(--s));
          margin-top: calc(0.4mm * var(--s));
        }
        .pm-zone-dots span {
          width: calc(1.8mm * var(--s));
          height: calc(1.8mm * var(--s));
          border-radius: 50%;
          background: rgba(4,8,18,0.15);
        }
        .pm-zone-dots span.done {
          background: #0544B0;
        }
        .pm-zone-dots span.active {
          background: #0544B0;
          box-shadow: 0 0 0 calc(0.5mm * var(--s)) rgba(5,68,176,0.25);
        }

        /* ── Journal / Mood grid ────────────────────────────────── */
        .pm-journal-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: calc(1.5mm * var(--s));
          padding: calc(0.4mm * var(--s)) 0;
        }
        .pm-journal-body {
          flex: 1;
          min-width: 0;
        }
        .pm-journal-date {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
          padding: calc(0.4mm * var(--s)) calc(0.8mm * var(--s));
          border-radius: calc(1mm * var(--s));
          background: rgba(4,8,18,0.05);
        }
        .pm-journal-date span {
          font-size: calc(3.5pt * var(--s));
          color: rgba(4,8,18,0.55);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .pm-journal-date b {
          font-size: calc(5pt * var(--s));
          font-weight: 800;
          color: #040812;
          letter-spacing: -0.01em;
        }
        .pm-mood-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: calc(0.7mm * var(--s));
        }
        .pm-mood-tile {
          background: #fff;
          border: calc(0.15mm * var(--s)) solid rgba(4,8,18,0.08);
          border-radius: calc(1.5mm * var(--s));
          padding: calc(0.8mm * var(--s)) calc(0.3mm * var(--s));
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: calc(0.2mm * var(--s));
        }
        .pm-mood-tile.sel {
          background: var(--mood-tint);
          border-color: var(--mood-ink);
          box-shadow: 0 calc(0.3mm * var(--s)) calc(0.6mm * var(--s)) rgba(180, 83, 9, 0.15);
        }
        .pm-mood-face {
          font-size: calc(9pt * var(--s));
          line-height: 1;
        }
        .pm-mood-label {
          font-size: calc(3.8pt * var(--s));
          font-weight: 700;
          color: rgba(4,8,18,0.7);
          letter-spacing: -0.01em;
        }
        .pm-mood-tile.sel .pm-mood-label {
          color: var(--mood-ink);
        }

        /* ── Clean quiet note ─────────────────────────────────── */
        .pm-quiet-note {
          font-size: calc(4pt * var(--s));
          color: rgba(4,8,18,0.6);
          font-weight: 500;
          font-style: italic;
          text-align: center;
          margin: calc(1mm * var(--s)) 0 0;
          line-height: 1.35;
        }

        /* ── NavBar ──────────────────────────────────────────────── */
        .pm-navbar {
          display: flex;
          justify-content: space-around;
          align-items: stretch;
          background: #fff;
          border-top: calc(0.1mm * var(--s)) solid rgba(4,8,18,0.12);
          padding: calc(0.8mm * var(--s)) calc(0.5mm * var(--s)) calc(1mm * var(--s));
          flex-shrink: 0;
          margin-top: auto;
        }
        .pm-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: calc(0.2mm * var(--s));
          flex: 1;
          color: rgba(4,8,18,0.45);
        }
        .pm-nav-btn.active {
          color: #040812;
        }
        .pm-nav-icon {
          width: calc(3mm * var(--s));
          height: calc(3mm * var(--s));
        }
        .pm-nav-icon svg {
          width: 100%;
          height: 100%;
        }
        .pm-nav-btn span {
          font-size: calc(3.2pt * var(--s));
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .pm-nav-btn.active span {
          color: #040812;
        }
      `}</style>
    </div>
  );
}
