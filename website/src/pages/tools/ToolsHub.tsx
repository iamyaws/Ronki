/**
 * /tools — index page listing the available parent tools.
 *
 * Composition pattern (Tool Design Standard §15-§20):
 *   1. Eyebrow + H1 + lead (no italic-sage on category words)
 *   2. 2x2 card grid where each card carries a different accent tone
 *      (cream → sage → mustard → teal-dark) so the grid has visual
 *      rhythm instead of four identical cream tiles
 *   3. Closing teal-dark "Vermisst du was?" block — the page's single
 *      dark anchor + Marc-voice trust signal in one component
 */

import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { ArrowRight } from '../../components/AppCheck/Icons';
import { EASE_OUT, fadeUp } from '../../lib/motion';

type ToolTone = 'cream' | 'sage' | 'mustard' | 'teal';

export default function ToolsHub() {
  const reduced = useReducedMotion();
  return (
    <PainterlyShell>
      <PageMeta
        title="Werkzeuge für Eltern: Ronki"
        description="Kleine Werkzeuge die Eltern helfen, digitale Entscheidungen für ihr Kind selbst zu treffen. Aktuell: der App-Check für Kinder-Apps."
        canonicalPath="/tools"
      />

      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp(0, reduced)}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink focus:outline-none focus-visible:text-ink focus-visible:underline underline-offset-4 transition-colors mb-8"
            >
              <span aria-hidden>←</span> Startseite
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold mb-6">
              Werkzeug für Eltern
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-ink">
              Werkzeuge, die <em className="italic text-sage">dir</em> den
              Rücken freihalten.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
              Du bewertest, wir geben dir den Rahmen. Kleine Werkzeuge für
              die Momente, in denen du als Elternteil eine digitale
              Entscheidung für dein Kind triffst. Kostenlos, ohne
              Anmeldung, ohne Cookies.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <ul className="grid sm:grid-cols-2 gap-6">
            <ToolCard
              index={0}
              reduced={reduced}
              tone="cream"
              eyebrow="App-Check"
              to="/tools/app-check"
              title="Was steckt eigentlich in der App, die dein Kind so will?"
              description="Zehn Beobachtungs-Fragen. Du klickst durch, was dir auffällt. Am Ende siehst du, welche Muster die App nutzt und wie schwer sie wiegen."
              meta="3 Min · Score + Erklärungen + teilbarer Permalink"
            />
            <ToolCard
              index={1}
              reduced={reduced}
              tone="sage"
              eyebrow="Schlafens-Rechner"
              to="/tools/schlafens-rechner"
              title="19:30 oder doch 20:15?"
              description="Alter und Aufstehzeit rein, vier Uhrzeiten raus: Bildschirm aus, Bett vorbereiten, Vorlesen, Bettzeit. Kein Urteil. Nur Mathematik."
              meta="30 Sek · vier Uhrzeiten + Share-Bild"
            />
            <ToolCard
              index={2}
              reduced={reduced}
              tone="mustard"
              eyebrow="Familien-Medien-Charter"
              to="/tools/familien-charter"
              title="Eure Regeln. Eine Seite. An den Kühlschrank."
              description="Sechs Schritte, dann hängt eure Vereinbarung am Kühlschrank. Nichts vorgegeben. Nur das, was ihr in der Familie eh schon entschieden habt, an einer Stelle."
              meta="5 Min · Druckbar als PDF + Social-Card"
            />
            <ToolCard
              index={3}
              reduced={reduced}
              tone="teal"
              eyebrow="Konsolen-Check"
              to="/tools/konsolen-check"
              title="Bevor der Karton aufgemacht wird."
              description="Zehn Fragen, bevor das Ding ausgepackt wird. Konto, Ort, Käufe, Zeit. Am Ende weißt du, was du an Tag eins einstellst, und ob die Plattform überhaupt zu eurer Familie passt."
              meta="5 Min · Pro/Kontra + Plattform-Checkliste"
            />
          </ul>
        </div>
      </section>

      <section className="px-6 pb-28 sm:pb-32">
        <div className="max-w-4xl mx-auto">
          <ClosingBlock reduced={reduced} />
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}

/**
 * Tone-driven class table. Each tone produces a coherent set of bg /
 * ring / text classes. The teal-dark tone is the page's interior visual
 * anchor (Tool Design Standard §5: every tool screen needs at least one
 * dark teal block) — when the parent's eye lands there last, the grid
 * resolves into a real composition instead of four cream tiles.
 *
 * The gradient ribbon at the top stays on the light tones (cream / sage
 * / mustard) where it reads as accent, and disappears on the teal-dark
 * card where it would clash with the inverted background.
 */
const TONE_STYLES: Record<
  ToolTone,
  {
    card: string;
    ribbon: boolean;
    eyebrow: string;
    title: string;
    description: string;
    meta: string;
    cta: string;
    focusRingOffset: string;
  }
> = {
  cream: {
    card: 'bg-cream/70 backdrop-blur-sm border border-teal/10',
    ribbon: true,
    eyebrow: 'text-teal',
    title: 'text-ink',
    description: 'text-ink/70',
    meta: 'text-ink/55',
    cta: 'text-teal',
    focusRingOffset: 'focus-visible:ring-offset-cream',
  },
  sage: {
    card: 'bg-sage/15 ring-1 ring-inset ring-sage/30 border border-transparent',
    ribbon: true,
    eyebrow: 'text-teal',
    title: 'text-ink',
    description: 'text-ink/75',
    meta: 'text-ink/60',
    cta: 'text-ink',
    focusRingOffset: 'focus-visible:ring-offset-cream',
  },
  mustard: {
    card: 'bg-mustard-soft/55 ring-1 ring-inset ring-mustard/35 border border-transparent',
    ribbon: true,
    eyebrow: 'text-ink',
    title: 'text-ink',
    description: 'text-ink/80',
    meta: 'text-ink/65',
    cta: 'text-ink',
    focusRingOffset: 'focus-visible:ring-offset-cream',
  },
  teal: {
    card: 'bg-teal-dark ring-1 ring-inset ring-teal-dark/40 border border-transparent',
    ribbon: false,
    eyebrow: 'text-mustard',
    title: 'text-cream',
    description: 'text-cream/85',
    meta: 'text-cream/55',
    cta: 'text-mustard',
    focusRingOffset: 'focus-visible:ring-offset-cream',
  },
};

function ToolCard({
  index,
  reduced,
  tone,
  eyebrow,
  to,
  title,
  description,
  meta,
}: {
  index: number;
  reduced: boolean | null;
  tone: ToolTone;
  eyebrow: string;
  to: string;
  title: string;
  description: string;
  meta: string;
}) {
  const t = TONE_STYLES[tone];
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: EASE_OUT,
        delay: reduced ? 0 : 0.08 + index * 0.05,
      }}
    >
      <Link
        to={to}
        className={`group relative block h-full rounded-2xl ${t.card} p-7 hover:shadow-lg hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 ${t.focusRingOffset} transition-all duration-300 overflow-hidden`}
      >
        {t.ribbon && (
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mustard via-sage to-teal"
          />
        )}
        <p className={`text-xs uppercase tracking-[0.18em] ${t.eyebrow} font-semibold mb-3`}>
          {eyebrow}
        </p>
        <h2 className={`font-display font-bold text-2xl ${t.title} leading-snug mb-3`}>
          {title}
        </h2>
        <p className={`text-sm ${t.description} leading-relaxed mb-4`}>
          {description}
        </p>
        <p className={`text-xs ${t.meta} mb-5 tabular-nums`}>{meta}</p>
        <span className={`inline-flex items-center gap-1.5 text-sm ${t.cta} font-semibold group-hover:gap-2 transition-all`}>
          Werkzeug öffnen
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.li>
  );
}

/**
 * Closing teal-dark block — the page's interior visual full-stop and
 * trust signal in one. Carries Marc's parent-to-parent voice (Vater von
 * Louis credit) so the hub doesn't end on a corporate "schreib uns"
 * sign-off.
 */
function ClosingBlock({ reduced }: { reduced: boolean | null }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: EASE_OUT,
        delay: reduced ? 0 : 0.4,
      }}
      className="rounded-2xl bg-teal-dark px-7 py-8 sm:px-10 sm:py-9"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-mustard font-semibold mb-3">
        Vermisst du was?
      </p>
      <p className="font-display font-semibold text-base sm:text-lg text-cream leading-relaxed max-w-prose">
        Diese vier sind der Anfang. Wenn dir ein Werkzeug fehlt, das eine
        Eltern-Entscheidung leichter macht, schreib mir kurz. Ich bau die
        Werkzeuge selbst, eins nach dem anderen.
      </p>
      <a
        href="mailto:hallo@ronki.de"
        className="group inline-flex items-center gap-2 mt-5 text-mustard font-display font-semibold text-sm hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard focus-visible:ring-offset-2 focus-visible:ring-offset-teal-dark rounded-full transition-all"
      >
        hallo@ronki.de
        <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
      </a>
      <p className="mt-4 text-xs text-cream/55">Marc, Vater von Louis (8)</p>
    </motion.div>
  );
}
