/**
 * /tools/familien-charter — Familien-Medien-Charter Generator.
 *
 * Multi-step form (6 input steps + preview), each step focused on one
 * dimension of the family's media agreement (when, where, what, money,
 * push, pauses, parent-promise). Final step renders an A4-portrait
 * preview that's printable as PDF and downloadable as a 1240x1754 PNG.
 *
 * Brand-safe: every line is the family's own answer, written in our
 * voice. We don't say what's right or wrong. We give them a structure
 * to put their own decisions on paper.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { ToolDisclaimer } from '../../components/AppCheck/ToolDisclaimer';
import { ArrowRight } from '../../components/AppCheck/Icons';
import { CharterPreview } from '../../components/AppCheck/CharterPreview';
import {
  EMPTY_ANSWERS,
  GELD_LABELS,
  INHALT_LABELS,
  PAUSE_LABELS,
  PUSH_LABELS,
  STEPS,
  WANN_LABELS,
  WO_LABELS,
  isReady,
  type CharterAnswers,
  type GeldChoice,
  type InhaltChoice,
  type PauseChoice,
  type PushChoice,
  type WannChoice,
  type WoChoice,
} from '../../lib/familien-charter/charter';
import { EASE_OUT, fadeUp } from '../../lib/motion';

export default function FamilienCharter() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CharterAnswers>(EMPTY_ANSWERS);

  const totalInputSteps = STEPS.length - 1; // last is preview
  const isPreview = step === STEPS.length - 1;
  const ready = isReady(answers, step);

  function update<K extends keyof CharterAnswers>(
    key: K,
    value: CharterAnswers[K],
  ) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArray<T extends string>(key: keyof CharterAnswers, value: T) {
    setAnswers((prev) => {
      const current = prev[key] as unknown as T[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next as unknown as CharterAnswers[typeof key] };
    });
  }

  return (
    <PainterlyShell>
      <PageMeta
        title="Hausverfassung erstellen: die Familien-Medien-Charter"
        description="In sechs Schritten zur eigenen Hausverfassung — eurer einseitigen Familien-Medien-Charter zum Aufhängen. Druckbar als PDF, teilbar als Bild. Werkzeug für Eltern, kein Ratgeber-Dogma."
        canonicalPath="/tools/familien-charter"
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
            {/*
              Header: H1 + lead + (on the input steps only) a tilted
              miniature preview-poster that previews the output shape.
              The poster hides during step 6 (the real preview) because
              the actual rendered charter takes over visually.
            */}
            <header className="space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
                Werkzeug für Eltern
              </p>
              <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-start">
                <div className="space-y-4">
                  <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight">
                    Eure{' '}
                    <em className="italic text-sage">Hausverfassung</em>.
                  </h1>
                  <p className="text-base text-ink/75 leading-relaxed max-w-prose">
                    Sechs kurze Schritte zur einseitigen Familien-Medien-
                    Charter. Druckbar als PDF für den Kühlschrank, teilbar
                    als Bild für andere Eltern. Wir geben den Rahmen, ihr
                    füllt ihn — die Regeln in eurem Haus schreibt ihr selbst.
                  </p>
                </div>
                {!isPreview && <CharterMiniPoster reduced={reduced} />}
              </div>

              <p className="text-sm text-ink/70 pt-2">
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
                <FamilyStep
                  answers={answers}
                  onUpdate={update}
                />
              )}
              {step === 1 && (
                <WannWoStep
                  answers={answers}
                  onToggleWann={(v) => toggleArray('wann', v)}
                  onSetWo={(v) => update('wo', v)}
                />
              )}
              {step === 2 && (
                <InhalteStep
                  answers={answers}
                  onToggle={(v) => toggleArray('inhalte', v)}
                />
              )}
              {step === 3 && (
                <GeldPushStep
                  answers={answers}
                  onSetGeld={(v) => update('geld', v)}
                  onSetPush={(v) => update('push', v)}
                />
              )}
              {step === 4 && (
                <PausenStep
                  answers={answers}
                  onToggle={(v) => toggleArray('pausen', v)}
                />
              )}
              {step === 5 && (
                <VersprechenStep
                  versprechen={answers.versprechen}
                  wofuer={answers.wofuer}
                  onChangeVersprechen={(v) => update('versprechen', v)}
                  onChangeWofuer={(v) => update('wofuer', v)}
                />
              )}
              {isPreview && <CharterPreview answers={answers} />}
            </motion.div>

            {!isPreview && (
              <div className="flex flex-wrap gap-3 pt-2 no-print">
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
                  disabled={!ready}
                  className="group inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3 text-cream font-display font-semibold text-sm shadow-sm hover:bg-teal hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {step === totalInputSteps - 1 ? 'Charter zeigen' : 'Weiter'}
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            )}

            {isPreview && (
              <div className="flex flex-wrap gap-3 pt-2 no-print">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-2 rounded-full border border-teal/30 px-5 py-3 text-sm text-ink font-display font-medium hover:bg-teal-dark hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
                >
                  ← Bearbeiten
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

interface UpdateFn {
  <K extends keyof CharterAnswers>(key: K, value: CharterAnswers[K]): void;
}

function FamilyStep({
  answers,
  onUpdate,
}: {
  answers: CharterAnswers;
  onUpdate: UpdateFn;
}) {
  return (
    <div className="space-y-6">
      <p className="text-base text-ink/75 max-w-prose leading-relaxed">
        Zwei kurze Sachen für die Kopfzeile: Wie soll die Charter heißen, und
        wie viele Kinder im Grundschulalter sitzen bei euch am Tisch. Beides
        kannst du auch leer lassen.
      </p>
      <label className="block max-w-md">
        <span className="text-sm text-ink/70 mb-2 block">
          Familienname (optional)
        </span>
        <input
          type="text"
          value={answers.familyName}
          onChange={(e) => onUpdate('familyName', e.target.value)}
          placeholder="zum Beispiel Müller"
          maxLength={40}
          className="w-full rounded-xl border border-teal/20 bg-cream px-4 py-3 text-base text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:border-transparent"
        />
      </label>
      <div>
        <span className="text-sm text-ink/70 mb-3 block">Anzahl Kinder</span>
        <div role="radiogroup" aria-label="Anzahl Kinder" className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={answers.childCount === n}
              onClick={() => onUpdate('childCount', n)}
              className={`min-w-[3.5rem] py-2.5 px-3 rounded-xl border-2 font-display font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-all ${
                answers.childCount === n
                  ? 'border-teal bg-teal text-cream shadow-sm'
                  : 'border-teal/20 bg-cream text-ink hover:border-teal'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <label className="block max-w-md">
        <span className="text-sm text-ink/70 mb-2 block">
          Wer unterschreibt? (optional, Komma-getrennt)
        </span>
        <input
          type="text"
          value={answers.signatures}
          onChange={(e) => onUpdate('signatures', e.target.value)}
          placeholder="z.B. Anna, Lukas, Mama, Papa"
          maxLength={120}
          className="w-full rounded-xl border border-teal/20 bg-cream px-4 py-3 text-base text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:border-transparent"
        />
        <span className="text-xs text-ink/55 mt-1.5 block">
          Wir drucken pro Name eine echte Signaturzeile unten auf die Charter.
          Wenn ihr's leer lasst, kommen die Standard-Felder „Erwachsene"
          und „Kinder".
        </span>
      </label>
    </div>
  );
}

function WannWoStep({
  answers,
  onToggleWann,
  onSetWo,
}: {
  answers: CharterAnswers;
  onToggleWann: (v: WannChoice) => void;
  onSetWo: (v: WoChoice) => void;
}) {
  return (
    <div className="space-y-8">
      <ChoiceGroup
        legend="Wann ist die Bildschirm-Zeit bei euch offen? (mehrere möglich)"
        options={Object.entries(WANN_LABELS) as [WannChoice, string][]}
        selected={answers.wann}
        onToggle={onToggleWann}
        multi
      />
      <ChoiceGroup
        legend="Und wo wird gespielt oder geschaut?"
        options={Object.entries(WO_LABELS) as [WoChoice, string][]}
        selected={[answers.wo]}
        onToggle={(v) => onSetWo(v)}
      />
    </div>
  );
}

function InhalteStep({
  answers,
  onToggle,
}: {
  answers: CharterAnswers;
  onToggle: (v: InhaltChoice) => void;
}) {
  return (
    <ChoiceGroup
      legend="Welche Arten von Inhalten sind bei euch okay? (mehrere möglich)"
      options={Object.entries(INHALT_LABELS) as [InhaltChoice, string][]}
      selected={answers.inhalte}
      onToggle={onToggle}
      multi
    />
  );
}

function GeldPushStep({
  answers,
  onSetGeld,
  onSetPush,
}: {
  answers: CharterAnswers;
  onSetGeld: (v: GeldChoice) => void;
  onSetPush: (v: PushChoice) => void;
}) {
  return (
    <div className="space-y-8">
      <ChoiceGroup
        legend="Wie haltet ihr es mit Echtgeld in Apps?"
        options={Object.entries(GELD_LABELS) as [GeldChoice, string][]}
        selected={[answers.geld]}
        onToggle={(v) => onSetGeld(v)}
      />
      <ChoiceGroup
        legend="Und mit Push-Benachrichtigungen?"
        options={Object.entries(PUSH_LABELS) as [PushChoice, string][]}
        selected={[answers.push]}
        onToggle={(v) => onSetPush(v)}
      />
    </div>
  );
}

function PausenStep({
  answers,
  onToggle,
}: {
  answers: CharterAnswers;
  onToggle: (v: PauseChoice) => void;
}) {
  return (
    <div className="space-y-4">
      <ChoiceGroup
        legend="Welche Pausen wollt ihr fest verabreden? (mehrere möglich, optional)"
        options={Object.entries(PAUSE_LABELS) as [PauseChoice, string][]}
        selected={answers.pausen}
        onToggle={onToggle}
        multi
      />
      <p className="text-xs text-ink/55">
        Du kannst diesen Schritt auch leer lassen, falls bei euch nichts davon passt.
      </p>
    </div>
  );
}

function VersprechenStep({
  versprechen,
  wofuer,
  onChangeVersprechen,
  onChangeWofuer,
}: {
  versprechen: string;
  wofuer: string;
  onChangeVersprechen: (v: string) => void;
  onChangeWofuer: (v: string) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Wofür field — the positive frame. Renders as an italic line at the
          top of the printed Hausverfassung when filled, reframing the whole
          document from "list of nos" to "what we're protecting". */}
      <div className="space-y-3">
        <p className="text-base text-ink/75 max-w-prose leading-relaxed">
          Wofür macht ihr das? Ein einziger Satz, was ihr durch die Regeln
          schützen wollt. Zum Beispiel: „Damit wir abends noch Zeit zum
          Vorlesen haben." Wenn ihr's habt, landet der Satz oben auf der
          Charter und gibt allem darunter einen Sinn.
        </p>
        <label className="block">
          <span className="text-sm text-ink/70 mb-2 block">
            Wofür macht ihr das? (optional)
          </span>
          <textarea
            value={wofuer}
            onChange={(e) => onChangeWofuer(e.target.value)}
            maxLength={180}
            rows={2}
            placeholder="z.B. Damit wir abends noch Zeit zum Vorlesen haben."
            className="w-full rounded-xl border border-teal/20 bg-cream px-4 py-3 text-base text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:border-transparent leading-relaxed"
          />
          <span className="text-xs text-ink/55 mt-1 block tabular-nums">
            {wofuer.length} / 180
          </span>
        </label>
      </div>

      <div className="space-y-3 pt-2 border-t border-teal/15">
        <p className="text-base text-ink/75 max-w-prose leading-relaxed">
          Und ein oder zwei Sätze von euch Erwachsenen, die unten auf der
          Charter landen. Zum Beispiel: „Wir lesen am Abend selbst auch
          nicht das Handy" oder „Wir entscheiden Streitfälle gemeinsam,
          nicht spontan." Solche Sätze wirken mit Kindern oft stärker als
          sechs vorgegebene Regeln.
        </p>
        <label className="block">
          <span className="text-sm text-ink/70 mb-2 block">
            Euer Versprechen (optional)
          </span>
          <textarea
            value={versprechen}
            onChange={(e) => onChangeVersprechen(e.target.value)}
            maxLength={400}
            rows={4}
            placeholder="Schreib einfach das hin, was ihr euch heute Abend nochmal selbst sagen würdet."
            className="w-full rounded-xl border border-teal/20 bg-cream px-4 py-3 text-base text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:border-transparent leading-relaxed"
          />
          <span className="text-xs text-ink/55 mt-1 block tabular-nums">
            {versprechen.length} / 400
          </span>
        </label>
      </div>
    </div>
  );
}

function ChoiceGroup<T extends string>({
  legend,
  options,
  selected,
  onToggle,
  multi = false,
}: {
  legend: string;
  options: [T, string][];
  selected: T[];
  onToggle: (v: T) => void;
  multi?: boolean;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm text-ink/70 mb-2">{legend}</legend>
      <div className="space-y-2">
        {options.map(([value, label]) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              role={multi ? 'checkbox' : 'radio'}
              aria-checked={active}
              onClick={() => onToggle(value)}
              className={`w-full text-left rounded-xl border-2 px-5 py-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                active
                  ? 'border-teal bg-teal/8 text-ink shadow-sm'
                  : 'border-teal/20 bg-cream text-ink hover:border-teal'
              }`}
            >
              <span className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={`mt-1 inline-flex w-5 h-5 rounded-md border-2 items-center justify-center shrink-0 ${
                    active
                      ? 'border-teal bg-teal text-cream'
                      : 'border-teal/30 bg-cream'
                  }`}
                >
                  {active && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="text-sm sm:text-base leading-snug">
                  {label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Tilted miniature poster that previews the shape of the final
 * charter. Pure decoration — small enough not to distract on mobile,
 * tall enough on desktop to read as "this is what you're building".
 *
 * The poster mirrors the gradient stripe + mustard date sticker +
 * inner double-frame motifs from the real preview, so when the parent
 * lands on the preview step the visual language is already familiar.
 */
function CharterMiniPoster({ reduced }: { reduced: boolean | null }) {
  return (
    <motion.div
      aria-hidden
      initial={reduced ? false : { opacity: 0, scale: 0.92, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: -3 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.1 }}
      className="hidden sm:block relative w-[180px] h-[230px] -mr-2 -mt-1"
    >
      <div className="absolute inset-0 rounded-lg bg-cream/95 ring-1 ring-teal/20 shadow-md overflow-hidden">
        {/* Gradient stripe */}
        <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-mustard via-sage to-teal" />
        {/* Mustard sticker */}
        <span className="absolute right-2 top-3 -rotate-6 rounded-sm bg-mustard/90 ring-1 ring-mustard/60 px-1.5 py-0.5 text-[7px] font-display font-bold text-ink tabular-nums shadow-sm">
          STAND
        </span>
        {/* Inner double-frame */}
        <div className="absolute inset-1.5 rounded-md border border-teal/15 px-3 pt-4">
          <p className="text-[7px] uppercase tracking-[0.18em] text-teal font-semibold">
            Hausverfassung
          </p>
          <p className="text-[11px] font-display font-bold text-ink mt-1 leading-tight">
            Familie Beispiel
          </p>
          <div className="mt-2 space-y-1.5">
            <span className="block h-[3px] w-full rounded bg-teal/15" />
            <span className="block h-[3px] w-[80%] rounded bg-teal/15" />
            <span className="block h-[3px] w-full rounded bg-teal/15" />
            <span className="block h-[3px] w-[65%] rounded bg-teal/15" />
            <span className="block h-[3px] w-full rounded bg-teal/15" />
            <span className="block h-[3px] w-[75%] rounded bg-teal/15" />
            <span className="block h-[3px] w-[90%] rounded bg-teal/15" />
            <span className="block h-[3px] w-[55%] rounded bg-teal/15" />
          </div>
          {/* Signature line */}
          <div className="absolute bottom-3 left-3 right-3 space-y-1">
            <span className="block h-px w-[60%] bg-teal/30" />
            <span className="block text-[6px] uppercase tracking-[0.18em] text-ink/60 font-semibold">
              Unterschrieben
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
