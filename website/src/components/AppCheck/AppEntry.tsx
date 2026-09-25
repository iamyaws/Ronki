/**
 * App selection screen for the Dark Pattern Scanner.
 *
 * Hybrid input:
 *   - Curated dropdown grouped by category (40 most-common DACH kid apps)
 *   - Free-text fallback for any other app
 *
 * After app is chosen, optionally shows the running counter "X parents
 * have evaluated this app" as soft social proof. Counter is the only
 * aggregated info exposed publicly; individual scores stay per-permalink.
 */

import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CATEGORY_LABELS, CURATED_APPS, type CuratedApp } from '../../lib/app-check/curated-apps';
import { fetchEvalCount } from '../../lib/app-check/storage';
import { ArrowRight } from './Icons';
import { EASE_OUT } from '../../lib/motion';

interface Props {
  onContinue: (selection: { name: string; curatedId: string | null }) => void;
}

export function AppEntry({ onContinue }: Props) {
  const reduced = useReducedMotion();
  const togglePillId = useId();
  const [mode, setMode] = useState<'curated' | 'free'>('curated');
  const [curatedId, setCuratedId] = useState<string>('');
  const [freeText, setFreeText] = useState<string>('');
  const [count, setCount] = useState<number | null>(null);

  // Group curated apps by category for the dropdown.
  const grouped = CURATED_APPS.reduce<Record<string, CuratedApp[]>>(
    (acc, app) => {
      (acc[app.category] = acc[app.category] || []).push(app);
      return acc;
    },
    {},
  );

  const selectedApp = CURATED_APPS.find((a) => a.id === curatedId);
  const effectiveName =
    mode === 'curated' ? selectedApp?.name ?? '' : freeText.trim();

  // Load counter when selection becomes meaningful.
  useEffect(() => {
    setCount(null);
    if (!effectiveName || effectiveName.length < 2) return;
    let cancelled = false;
    fetchEvalCount(effectiveName).then((n) => {
      if (!cancelled) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, [effectiveName]);

  const canContinue = effectiveName.length >= 2;

  return (
    <div className="space-y-8 max-w-xl">
      {/* Mode toggle. The active background pill slides between the two
          buttons via shared layoutId, so swapping modes feels physical
          rather than a hard color flip. Buttons stay accessible and use
          aria-pressed for screen readers. */}
      <div
        className="inline-flex rounded-full bg-cream/70 border border-teal/15 p-1"
        role="tablist"
        aria-label="App-Auswahl-Modus"
      >
        {([
          { key: 'curated', label: 'Aus Liste wählen' },
          { key: 'free', label: 'Andere App eingeben' },
        ] as const).map(({ key, label }) => {
          const active = mode === key;
          return (
            <motion.button
              key={key}
              type="button"
              role="tab"
              aria-pressed={active}
              onClick={() => setMode(key)}
              whileTap={reduced ? undefined : { scale: 0.97 }}
              className="relative px-4 py-1.5 rounded-full text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
            >
              {active && (
                <motion.span
                  layoutId={togglePillId}
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-teal"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 360, damping: 32 }
                  }
                />
              )}
              <span
                className={`relative z-10 ${
                  active ? 'text-cream' : 'text-ink hover:text-teal'
                }`}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Input */}
      {mode === 'curated' ? (
        <label className="block">
          <span className="text-sm text-ink/70 mb-2 block">App auswählen</span>
          <select
            value={curatedId}
            onChange={(e) => setCuratedId(e.target.value)}
            className="w-full rounded-xl border border-teal/20 bg-cream px-4 py-3 text-base text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:border-transparent"
          >
            <option value="">Bitte wählen…</option>
            {Object.entries(grouped).map(([cat, apps]) => (
              <optgroup
                key={cat}
                label={CATEGORY_LABELS[cat as CuratedApp['category']]}
              >
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      ) : (
        <label className="block">
          <span className="text-sm text-ink/70 mb-2 block">App-Name</span>
          <input
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="z.B. Anton, Duolingo ABC, Pokémon Go"
            maxLength={80}
            className="w-full rounded-xl border border-teal/20 bg-cream px-4 py-3 text-base text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:border-transparent"
          />
        </label>
      )}

      {/* Counter */}
      <AnimatePresence mode="wait">
        {effectiveName && (
          <motion.div
            key={effectiveName + (count ?? 'loading')}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="text-sm text-ink/65 min-h-[1.25rem]"
          >
            {count === null && <span>Schau nach…</span>}
            {count === 0 && (
              <span>
                <strong>{effectiveName}</strong> wurde hier noch nicht bewertet.
              </span>
            )}
            {count !== null && count > 0 && (
              <span>
                {count === 1 ? 'Eine andere Person hat' : `${count} andere Personen haben`}{' '}
                <strong>{effectiveName}</strong> bisher geprüft.
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <button
        type="button"
        disabled={!canContinue}
        onClick={() =>
          onContinue({
            name: effectiveName,
            curatedId: mode === 'curated' && curatedId ? curatedId : null,
          })
        }
        className="group inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3 text-cream font-display font-semibold text-sm shadow-sm hover:bg-teal hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Mit den zehn Fragen loslegen
        <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
