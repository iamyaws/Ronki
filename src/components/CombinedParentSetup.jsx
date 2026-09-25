import React, { useState } from 'react';
import { RonkiArt } from './MoodChibi';
import { DoodleIcon, PaperCard, PillButton, QuietLink } from './bilderbuch';
import RoutinePicker from './onboarding/RoutinePicker';
import { DEFAULT_ROUTINE, normalizeRoutine } from '../data/taskKinds';
import { DEFAULT_EVENING_START, EVENING_STARTS } from '../loop/types';

/**
 * CombinedParentSetup: the one short parent screen.
 *
 * Finch pass (26 Sep 2026, base design 2.2 plus spec section 2): the
 * parent comes in after the hatch, called by Ronki ("Holst du mal Mama
 * oder Papa?"), on the same tablet, for about 45 seconds. Top to bottom:
 *
 *   headline  "Ronki ist geschlüpft." and what happens every day
 *   name      the child's first name (required, the only typing)
 *   routine   collapsed under "Ronkis Morgen und Abend anpassen": the
 *             task pictures with the defaults pre-ticked, and the
 *             evening start chips (default 17:00)
 *   PIN       behind "PIN festlegen" (optional, empty = 1234)
 *   consent   anonymous usage data, default off
 *   tip       add to the home screen, "Schau mal, ob Ronki zurück ist."
 *   card      quiet "Habt ihr schon eine Karte von ronki.de? Karte
 *             scannen" (prop onScanCard; hidden when absent)
 *   pill      "Zurück zu {Name}", disabled until a name
 *
 * onComplete(payload) keeps the old fields and adds the routine:
 *   {
 *     parentOnboardingDone: true,
 *     parentPin, parentPinIsDefault, analyticsEnabled,
 *     familyConfig: { ...existing, childName, siblings: [], routine, eveningStart },
 *   }
 *
 * Parent register: white ground, ink labels, 2.5 px inputs, consent as
 * a sky-wash paper card, one cobalt pill. Nothing is wider than the
 * screen at 320 px (min-w-0 on every row, the pill label is shortened
 * for very long names).
 */

const PILL_NAME_MAX = 14;

function pillName(name) {
  const chars = Array.from(name);
  return chars.length > PILL_NAME_MAX ? `${chars.slice(0, PILL_NAME_MAX - 1).join('')}…` : name;
}

export default function CombinedParentSetup({ existingFamilyConfig, onComplete, onScanCard }) {
  const [childName, setChildName] = useState((existingFamilyConfig?.childName || '').trim());
  const [pinDigits, setPinDigits] = useState('');
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinError, setPinError] = useState('');
  const [routineOpen, setRoutineOpen] = useState(false);
  const [routine, setRoutine] = useState(() => normalizeRoutine(existingFamilyConfig?.routine ?? DEFAULT_ROUTINE));
  const [eveningStart, setEveningStart] = useState(() => (
    EVENING_STARTS.includes(existingFamilyConfig?.eveningStart) ? existingFamilyConfig.eveningStart : DEFAULT_EVENING_START
  ));

  const handlePinInput = (raw) => {
    // Accept digits only, max 4
    const digits = (raw || '').replace(/\D/g, '').slice(0, 4);
    setPinDigits(digits);
    setPinError('');
  };

  const name = childName.trim();
  const canSubmit = name.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    if (pinDigits && pinDigits.length !== 4) {
      setPinOpen(true);
      setPinError('Vier Ziffern, oder leer lassen.');
      return;
    }
    const usedDefault = !pinDigits;
    onComplete({
      parentOnboardingDone: true,
      parentPin: usedDefault ? null : pinDigits,
      parentPinIsDefault: usedDefault,
      analyticsEnabled: analyticsOptIn,
      familyConfig: {
        ...(existingFamilyConfig || {}),
        childName: name,
        siblings: [],
        routine,
        eveningStart,
      },
    });
  };

  const input = 'w-full min-w-0 rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-3 font-body text-lg text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-cobalt';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Eltern-Einstellungen"
      className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-white text-ink font-body"
    >
      <main
        className="relative z-10 min-h-full w-full flex flex-col px-5 max-w-md mx-auto min-w-0"
        style={{
          // Clear the fixed alpha banner (it already absorbs the iOS safe area).
          paddingTop: 'calc(var(--alpha-banner-h, 28px) + 1.25rem)',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Ronki just hatched: a small wave, one beat. */}
        <div className="flex justify-center mb-3">
          <RonkiArt pose="wave" size={96} label="Ronki" />
        </div>

        {/* Header */}
        <div className="text-center mb-7 min-w-0">
          <p className="bb-hand text-2xl text-cobalt mb-1">Für Mama oder Papa</p>
          <h1 className="bb-display text-4xl m-0">Ronki ist geschlüpft.</h1>
          <p className="text-lg text-ink-soft mt-3 leading-relaxed">
            Morgens und abends macht euer Kind seine Sachen mit Ronki. Dann fliegt Ronki los und kommt mit einer kleinen Geschichte zurück.
          </p>
        </div>

        {/* Child name */}
        <section className="mb-6 min-w-0">
          <label htmlFor="cps-childName" className="block font-headline font-semibold text-lg mb-2">
            Wie heißt euer Kind?
          </label>
          <input
            id="cps-childName"
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Vorname"
            autoComplete="off"
            className={input}
            required
          />
        </section>

        {/* Routine, collapsed */}
        <section className="mb-5 min-w-0">
          <QuietLink tone="cobalt" arrow onClick={() => setRoutineOpen((v) => !v)} aria-expanded={routineOpen}>
            Ronkis Morgen und Abend anpassen
          </QuietLink>
          {routineOpen && (
            <div className="mt-4">
              <RoutinePicker
                routine={routine}
                eveningStart={eveningStart}
                onChange={(next) => { setRoutine(next.routine); setEveningStart(next.eveningStart); }}
              />
            </div>
          )}
        </section>

        {/* PIN, behind a link */}
        <section className="mb-6 min-w-0">
          <QuietLink tone="cobalt" arrow onClick={() => setPinOpen((v) => !v)} aria-expanded={pinOpen}>
            PIN festlegen
          </QuietLink>
          {pinOpen && (
            <div className="mt-3 min-w-0">
              <label htmlFor="cps-pin" className="block font-headline font-semibold text-lg mb-2">
                PIN für den Eltern-Bereich (optional)
              </label>
              <div className="flex gap-3 items-center min-w-0">
                <input
                  id="cps-pin"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pinDigits}
                  onChange={(e) => handlePinInput(e.target.value)}
                  placeholder="••••"
                  autoComplete="new-password"
                  className={`${input} flex-1 tracking-[0.3em]`}
                  style={{ width: 0 }}
                />
                <PillButton
                  tone="secondary"
                  onClick={() => setShowPin((s) => !s)}
                  aria-label={showPin ? 'PIN verbergen' : 'PIN zeigen'}
                  className="shrink-0"
                  style={{ minHeight: 52, paddingLeft: 20, paddingRight: 20 }}
                >
                  {showPin ? 'Aus' : 'An'}
                </PillButton>
              </div>
              <p className="text-base text-ink-soft mt-2 leading-relaxed">
                Leer lassen heißt: Standard-PIN <strong className="text-ink">1234</strong>. Im Eltern-Bereich jederzeit änderbar.
              </p>
            </div>
          )}
          {pinError && (
            <p className="text-base text-error font-headline font-semibold mt-2" role="alert">{pinError}</p>
          )}
        </section>

        {/* Analytics consent */}
        <section className="mb-6 min-w-0">
          <PaperCard
            as="button"
            tone="sky-wash"
            pad="none"
            type="button"
            onClick={() => setAnalyticsOptIn((v) => !v)}
            aria-pressed={analyticsOptIn}
            className="w-full flex items-start gap-3 p-4"
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border-[2.5px] border-ink ${analyticsOptIn ? 'bg-cobalt text-white' : 'bg-white text-transparent'}`}
            >
              <DoodleIcon name="check" size={18} stroke={7} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-headline font-semibold text-lg leading-snug mb-1">
                Anonyme Nutzungsdaten teilen?
              </span>
              <span className="block text-base text-ink-soft leading-relaxed">
                Hilft uns Ronki zu verbessern. Keine Werbung, kein Tracking, nichts Drittes. Frankfurter Server. Jederzeit aus.
              </span>
            </span>
          </PaperCard>
        </section>

        {/* Tip line */}
        <p className="text-base text-ink leading-relaxed mb-6">
          <span className="font-headline font-semibold">Tipp: </span>
          Legt Ronki auf den Home-Bildschirm. Sagt eurem Kind morgens und abends einfach: Schau mal, ob Ronki zurück ist.
        </p>

        {/* CTA */}
        <PillButton full size="lg" arrow onClick={submit} disabled={!canSubmit} className="min-w-0 max-w-full">
          {canSubmit ? `Zurück zu ${pillName(name)}` : 'Zurück zum Kind'}
        </PillButton>

        {onScanCard && (
          <div className="mt-5 flex flex-col items-center text-center min-w-0">
            <p className="text-base text-ink-soft m-0">Habt ihr schon eine Karte von ronki.de?</p>
            <QuietLink tone="ink" onClick={onScanCard}>Karte scannen</QuietLink>
          </div>
        )}

        <p className="text-base text-center text-ink-soft mt-5 leading-relaxed">
          Keine Daten verlassen Deutschland. Mehr im Eltern-Bereich.
        </p>
      </main>
    </div>
  );
}
