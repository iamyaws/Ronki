/**
 * /tools/konsolen-check — pre-purchase decision tool for parents
 * weighing a console / tablet / phone for their kid.
 *
 * Five input steps grouped by theme, then a single result page with
 * three sections: Risiko-Profil + Pro/Kontra-Liste + plattform-spezifische
 * Konfigurations-Checkliste.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { ToolDisclaimer } from '../../components/AppCheck/ToolDisclaimer';
import { ArrowRight } from '../../components/AppCheck/Icons';
import {
  ACCOUNT_LABELS,
  CONFLICT_LABELS,
  EMPTY_ANSWERS,
  GAME_PICKING_LABELS,
  IAP_LABELS,
  PAYER_LABELS,
  PLATTFORM_LABELS,
  PLACE_LABELS,
  REVIEW_LABELS,
  SETUP_LABELS,
  TIME_LIMIT_LABELS,
  computeResult,
  type AccountType,
  type Conflict,
  type GamePicking,
  type IapPolicy,
  type KonsolenAnswers,
  type Payer,
  type Place,
  type Platform,
  type Review,
  type Setup,
  type TimeLimit,
} from '../../lib/konsolen-check/check';
import { EASE_OUT, fadeUp } from '../../lib/motion';

const STEPS = [
  { title: 'Welche Plattform?' },
  { title: 'Wer zahlt, wer richtet ein?' },
  { title: 'Wo gespielt, welche Spiele?' },
  { title: 'Käufe und Zeit' },
  { title: 'Streit und Review' },
  { title: 'Euer Profil' },
];

export default function KonsolenCheck() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<KonsolenAnswers>(EMPTY_ANSWERS);
  const isResult = step === STEPS.length - 1;

  function update<K extends keyof KonsolenAnswers>(
    key: K,
    value: KonsolenAnswers[K],
  ) {
    setA((prev) => ({ ...prev, [key]: value }));
  }

  const result = isResult ? computeResult(a) : null;

  return (
    <PainterlyShell>
      <PageMeta
        title="Konsolen-Check: vor dem Kauf gemeinsam denken"
        description="Bevor ihr eine Konsole, ein Tablet oder ein Phone fürs Kind kauft: zehn Fragen die euch durch Setup, Hausregeln und Konfigurations-Schritte führen. Druckbare Hausregel am Ende."
        canonicalPath="/tools/konsolen-check"
      />

      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink focus:outline-none focus-visible:text-ink focus-visible:underline underline-offset-4 transition-colors mb-8"
          >
            <span aria-hidden>←</span> Werkzeuge
          </Link>

          <motion.div {...fadeUp(0, reduced)} className="space-y-8">
            <header className="space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
                Werkzeug für Eltern
              </p>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight">
                Konsole, Tablet oder Phone? Vorher{' '}
                <em className="italic text-sage">denken</em>.
              </h1>
              <p className="text-base text-ink/75 max-w-2xl leading-relaxed">
                Bevor das Gerät im Karton bei euch zuhause steht: zehn Fragen
                zu Konto, Ort, Käufen, Zeit. Am Ende eine Konfigurations-Liste
                für genau eure Plattform, kein Kaufversprechen.
              </p>
              <PlatformStrip />
              <p className="text-sm text-ink/70 pt-1">
                Schritt {Math.min(step + 1, STEPS.length)} von {STEPS.length} ·{' '}
                {STEPS[step].title}
              </p>
              <div
                className="h-1.5 bg-cream/70 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={step + 1}
                aria-valuemin={1}
                aria-valuemax={STEPS.length}
              >
                <motion.div
                  className="h-full bg-sage rounded-full"
                  initial={false}
                  animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                  transition={
                    reduced ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT }
                  }
                />
              </div>
            </header>

            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="space-y-8"
            >
              {step === 0 && (
                <ChoiceGroup<Platform>
                  legend="Welche Plattform überlegt ihr?"
                  options={Object.entries(PLATTFORM_LABELS) as [Platform, string][]}
                  selected={[a.plattform]}
                  onSelect={(v) => update('plattform', v)}
                />
              )}

              {step === 1 && (
                <div className="space-y-8">
                  <ChoiceGroup<Payer>
                    legend="Wer zahlt?"
                    options={Object.entries(PAYER_LABELS) as [Payer, string][]}
                    selected={[a.payer]}
                    onSelect={(v) => update('payer', v)}
                  />
                  <ChoiceGroup<Setup>
                    legend="Wer richtet das Gerät ein?"
                    options={Object.entries(SETUP_LABELS) as [Setup, string][]}
                    selected={[a.setup]}
                    onSelect={(v) => update('setup', v)}
                  />
                  <ChoiceGroup<AccountType>
                    legend="Welches Konto wird verwendet?"
                    options={Object.entries(ACCOUNT_LABELS) as [AccountType, string][]}
                    selected={[a.account]}
                    onSelect={(v) => update('account', v)}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <ChoiceGroup<Place>
                    legend="Wo wird gespielt?"
                    options={Object.entries(PLACE_LABELS) as [Place, string][]}
                    selected={[a.place]}
                    onSelect={(v) => update('place', v)}
                  />
                  <ChoiceGroup<GamePicking>
                    legend="Wer wählt die Spiele aus?"
                    options={Object.entries(GAME_PICKING_LABELS) as [GamePicking, string][]}
                    selected={[a.gamePicking]}
                    onSelect={(v) => update('gamePicking', v)}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <ChoiceGroup<IapPolicy>
                    legend="Wie regelt ihr In-App-Käufe?"
                    options={Object.entries(IAP_LABELS) as [IapPolicy, string][]}
                    selected={[a.iap]}
                    onSelect={(v) => update('iap', v)}
                  />
                  <ChoiceGroup<TimeLimit>
                    legend="Welche Zeitlimits plant ihr?"
                    options={Object.entries(TIME_LIMIT_LABELS) as [TimeLimit, string][]}
                    selected={[a.timeLimit]}
                    onSelect={(v) => update('timeLimit', v)}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <ChoiceGroup<Conflict>
                    legend="Wie geht ihr mit Streitfällen um?"
                    options={Object.entries(CONFLICT_LABELS) as [Conflict, string][]}
                    selected={[a.conflict]}
                    onSelect={(v) => update('conflict', v)}
                  />
                  <ChoiceGroup<Review>
                    legend="Wann schaut ihr die Regeln nochmal an?"
                    options={Object.entries(REVIEW_LABELS) as [Review, string][]}
                    selected={[a.review]}
                    onSelect={(v) => update('review', v)}
                  />
                </div>
              )}

              {isResult && result && (
                <div className="space-y-10">
                  <div className="rounded-2xl bg-cream/80 ring-1 ring-inset ring-teal/15 px-7 py-7 sm:px-10 sm:py-9 space-y-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
                      Euer Profil für {PLATTFORM_LABELS[a.plattform]}
                    </p>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink leading-tight">
                      {result.riskHeadline}
                    </h2>
                  </div>

                  {result.pros.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-xl text-ink">
                        Was bei euch funktioniert
                      </h3>
                      <ul className="space-y-3 list-none pl-0">
                        {result.pros.map((p, i) => (
                          <li
                            key={i}
                            className="rounded-xl bg-sage/10 border border-sage/25 p-5 text-sm text-ink/80 leading-relaxed max-w-prose"
                          >
                            {p.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.contras.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-xl text-ink">
                        Wo ihr genauer hinschauen solltet
                      </h3>
                      <ul className="space-y-3 list-none pl-0">
                        {result.contras.map((c, i) => (
                          <li
                            key={i}
                            className="rounded-xl bg-cream/80 border border-teal/20 p-5 text-sm text-ink/80 leading-relaxed max-w-prose"
                          >
                            {c.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-xl text-ink">
                      Konfigurations-Checkliste für{' '}
                      {PLATTFORM_LABELS[a.plattform]}
                    </h3>
                    <ol className="space-y-4 list-none pl-0">
                      {result.configSteps.map((s, i) => (
                        <li
                          key={i}
                          className="rounded-xl bg-cream/70 border border-teal/10 p-5 sm:p-6 flex gap-4"
                        >
                          <span
                            aria-hidden
                            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-dark text-cream font-display font-bold text-sm tabular-nums"
                          >
                            {i + 1}
                          </span>
                          <div className="space-y-1.5 flex-1">
                            <p className="font-display font-bold text-ink text-base">
                              {s.title}
                            </p>
                            <p className="text-sm text-ink/75 leading-relaxed max-w-prose">
                              {s.detail}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="rounded-2xl bg-teal-dark/8 border border-teal-dark/15 px-6 py-6 sm:px-8 sm:py-7">
                    <p className="font-display font-semibold text-base text-ink leading-relaxed max-w-prose">
                      Diese Liste ist Anker, kein Vertrag. Setzt euch eine
                      Erinnerung im Kalender für{' '}
                      {a.review === 'drei-monate'
                        ? 'in drei Monaten'
                        : a.review === 'sechs-monate'
                        ? 'in sechs Monaten'
                        : a.review === 'jaehrlich'
                        ? 'in einem Jahr'
                        : 'einen Eltern-Gipfel sobald etwas hakt'}{' '}
                      und prüft dann gemeinsam, was geblieben ist und was
                      nachjustiert werden muss.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {!isResult && (
              <div className="flex flex-wrap gap-3 pt-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="inline-flex items-center gap-2 rounded-full border border-teal/30 px-5 py-3 text-sm text-ink font-display font-medium hover:bg-teal-dark hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
                  >
                    ← Zurück
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStep(Math.min(step + 1, STEPS.length - 1))}
                  className="group inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3 text-cream font-display font-semibold text-sm shadow-sm hover:bg-teal hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-all"
                >
                  {step === STEPS.length - 2 ? 'Profil zeigen' : 'Weiter'}
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            )}

            {isResult && (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="inline-flex items-center gap-2 rounded-full border border-teal/30 px-5 py-3 text-sm text-ink font-display font-medium hover:bg-teal-dark hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
                >
                  ← Anderes Profil durchgehen
                </button>
              </div>
            )}

            <ToolDisclaimer variant="tool" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}

/**
 * Tiny horizontal strip of the platforms the tool covers. Sits below
 * the lead paragraph as a visual anchor — tells the parent at a glance
 * "your system is in here" without making them read another paragraph.
 *
 * Pure decoration, no interaction. The actual platform pick happens in
 * step 1 of the form below.
 */
function PlatformStrip() {
  const platforms = [
    'PS5',
    'Xbox',
    'Switch',
    'iPad',
    'iPhone',
    'Android-Tablet',
    'Gaming-PC',
  ];
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {platforms.map((p) => (
        <span
          key={p}
          className="inline-flex items-center rounded-full bg-cream/70 ring-1 ring-inset ring-teal/20 px-3 py-1 text-xs font-display font-semibold text-ink"
        >
          {p}
        </span>
      ))}
    </div>
  );
}

function ChoiceGroup<T extends string>({
  legend,
  options,
  selected,
  onSelect,
}: {
  legend: string;
  options: [T, string][];
  selected: T[];
  onSelect: (v: T) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm text-ink/70 mb-2 font-medium">{legend}</legend>
      <div className="space-y-2">
        {options.map(([value, label]) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(value)}
              className={`w-full text-left rounded-xl border-2 px-5 py-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                active
                  ? 'border-teal bg-teal/8 text-ink shadow-sm'
                  : 'border-teal/20 bg-cream text-ink hover:border-teal'
              }`}
            >
              <span className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={`mt-1 inline-flex w-5 h-5 rounded-full border-2 items-center justify-center shrink-0 ${
                    active
                      ? 'border-teal bg-teal'
                      : 'border-teal/30 bg-cream'
                  }`}
                >
                  {active && (
                    <span className="w-2 h-2 rounded-full bg-cream" aria-hidden />
                  )}
                </span>
                <span className="text-sm sm:text-base leading-snug">{label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
