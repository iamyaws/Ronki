import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  submitScreener,
  type ChildAge,
  type Challenge,
  type WillingToTest,
} from '../lib/waitlist';

interface Props {
  email: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

type Status = 'idle' | 'submitting' | 'done';

const AGE_OPTIONS: { value: ChildAge; label: string }[] = [
  { value: '5-6', label: '5–6' },
  { value: '7-8', label: '7–8' },
  { value: '9-10', label: '9–10' },
  { value: 'älter', label: 'älter' },
];

const CHALLENGE_OPTIONS: { value: Challenge; label: string }[] = [
  { value: 'morgen', label: 'Morgenroutine' },
  { value: 'abend', label: 'Abendroutine' },
  { value: 'hausaufgaben', label: 'Hausaufgaben' },
  { value: 'bildschirmzeit', label: 'Bildschirmzeit' },
  { value: 'anderes', label: 'Etwas anderes' },
];

const TEST_OPTIONS: { value: WillingToTest; label: string }[] = [
  { value: 'ja', label: 'Ja, gern' },
  { value: 'vielleicht', label: 'Vielleicht' },
  { value: 'später', label: 'Lieber später' },
];

export function WaitlistScreener({ email, onComplete, onSkip }: Props) {
  const [childAges, setChildAges] = useState<ChildAge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [willingToTest, setWillingToTest] = useState<WillingToTest | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const toggleAge = (v: ChildAge) =>
    setChildAges((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  const toggleChallenge = (v: Challenge) =>
    setChallenges((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const canSubmit =
    childAges.length > 0 && challenges.length > 0 && willingToTest !== null && status === 'idle';

  async function handleSubmit() {
    if (!canSubmit || !willingToTest) return;
    setStatus('submitting');
    // Store multi-selections as comma-joined strings in the existing Supabase columns.
    await submitScreener({
      email,
      childAge: childAges.join(','),
      challenge: challenges.join(','),
      willingToTest,
    });
    setStatus('done');
    onComplete?.();
  }

  if (status === 'done') {
    // If willing_to_test === 'ja', invite them directly to the alpha app.
    if (willingToTest === 'ja') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 rounded-2xl border-2 border-mustard/40 bg-mustard/10 p-5 sm:p-6 shadow-sm"
        >
          <p className="text-xs uppercase tracking-[0.15em] font-display font-bold opacity-80 mb-2">
            Du bist dabei · Frühzugang
          </p>
          <p className="font-display font-bold text-lg leading-tight mb-3">
            Ronki ist schon online. Probiert es aus.
          </p>
          <p className="text-sm opacity-75 leading-relaxed mb-4">
            Es ist eine frühe Version, die sich noch verändert. Wenn etwas hakt, schreib uns kurz an{' '}
            <a href="mailto:hallo@ronki.de" className="underline hover:opacity-100">hallo@ronki.de</a>.
          </p>
          <a
            href="https://app.ronki.de"
            className="inline-flex items-center gap-2 rounded-full bg-teal-dark px-5 py-3 text-cream font-display font-bold text-sm shadow-sm hover:shadow-md hover:bg-teal transition-all"
          >
            Zur frühen Version
            <span aria-hidden>→</span>
          </a>
        </motion.div>
      );
    }

    // Otherwise: polite thanks, we'll reach out later.
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-4"
      >
        <p className="text-sm font-display font-semibold">Danke! Das hilft uns sehr.</p>
        <p className="mt-1 text-xs opacity-60">Wir melden uns, wenn es für euch losgeht.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-4 rounded-2xl border border-current/20 bg-current/[0.08] p-5 sm:p-6 shadow-sm"
    >
      <p className="text-xs uppercase tracking-[0.15em] opacity-70 font-medium mb-2">
        30 Sekunden, optional
      </p>
      <h3 className="font-display font-bold text-lg leading-tight mb-5 opacity-100">
        Magst du uns helfen, Ronki besser zu machen?
      </h3>

      <div className="flex flex-col gap-5">
        <Question label="Wie alt sind eure Kinder?" hint="mehrere möglich">
          <MultiPillGroup
            options={AGE_OPTIONS}
            values={childAges}
            onToggle={toggleAge}
          />
        </Question>

        <Question label="Wobei würde Ronki euch am meisten helfen?" hint="mehrere möglich">
          <MultiPillGroup
            options={CHALLENGE_OPTIONS}
            values={challenges}
            onToggle={toggleChallenge}
          />
        </Question>

        <Question label="Würdest du eine frühe Version testen?">
          <PillGroup
            options={TEST_OPTIONS}
            value={willingToTest}
            onChange={setWillingToTest}
          />
        </Question>

        <div className="flex items-center gap-3 mt-2">
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            whileHover={canSubmit ? { scale: 1.02 } : undefined}
            whileTap={canSubmit ? { scale: 0.97 } : undefined}
            className="inline-flex items-center gap-2 rounded-full bg-cobalt px-5 py-2.5 text-white font-display font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-transform enabled:hover:-translate-y-0.5"
          >
            {status === 'submitting' ? '…' : 'Abschicken'}
            <span>→</span>
          </motion.button>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs opacity-70 hover:opacity-100 transition-opacity font-medium"
          >
            Überspringen
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

function Question({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-display font-semibold opacity-85 mb-2.5">
        {label}
        {hint && (
          <span className="ml-2 text-[0.65rem] font-medium opacity-60 normal-case">
            {hint}
          </span>
        )}
      </p>
      {children}
    </div>
  );
}

interface PillGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}

function PillGroup<T extends string>({ options, value, onChange }: PillGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-full px-3.5 py-2 text-xs font-display font-semibold transition-all ${
                selected
                  ? 'bg-mustard text-ink shadow-sm'
                  : 'bg-current/15 ring-1 ring-current/20 hover:bg-current/25'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

interface MultiPillGroupProps<T extends string> {
  options: { value: T; label: string }[];
  values: T[];
  onToggle: (v: T) => void;
}

function MultiPillGroup<T extends string>({ options, values, onToggle }: MultiPillGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => onToggle(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-display font-semibold transition-all ${
              selected
                ? 'bg-mustard text-ink shadow-sm'
                : 'bg-current/15 ring-1 ring-current/20 hover:bg-current/25'
            }`}
          >
            <span
              aria-hidden
              className={`inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] transition-colors ${
                selected
                  ? 'bg-teal-dark text-mustard'
                  : 'bg-transparent ring-1 ring-current/35'
              }`}
            >
              {selected && (
                <svg viewBox="0 0 10 10" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 5.5 L4 7.5 L8.5 2.5" />
                </svg>
              )}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
