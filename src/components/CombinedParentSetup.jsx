import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { RonkiArt } from './MoodChibi';
import { DoodleIcon, PaperCard, PillButton } from './bilderbuch';

/**
 * CombinedParentSetup: single-screen replacement for ParentOnboarding.
 *
 * Tier-2 onboarding trim (26 Apr 2026): the prior 5-step parent flow
 * collapsed to one form. Same data captured, no re-confirm on the PIN.
 *
 * Sections, top to bottom:
 *   1. Wer setzt das ein?  child name (required, single field)
 *   2. PIN für Eltern-Bereich  optional, single 4-digit field; leaving
 *      it empty keeps 1234 as the default with a banner nag in the
 *      dashboard
 *   3. Hilfst du uns?  analytics opt-in, default off
 *
 * On submit, calls onComplete with the same payload shape as the old
 * ParentOnboarding so consumers downstream do not need to change:
 *   {
 *     parentOnboardingDone: true,
 *     parentPin,
 *     parentPinIsDefault,
 *     analyticsEnabled,
 *     familyConfig: { ...existing, childName, siblings: [] },
 *   }
 *
 * Siblings array intentionally always empty here (killed in the trim).
 *
 * Bilderbuch cut (25 Sep 2026): parent register, calm density. White
 * ground, ink labels, inputs with a 2.5 px ink outline, consent as a
 * sky-wash paper card, one cobalt pill. The 390 px overflow of the old
 * layout came from the PIN input's intrinsic width inside a flex row;
 * it now has min-width 0.
 */
export default function CombinedParentSetup({ existingFamilyConfig, onComplete }) {
  useTranslation();
  const [childName, setChildName] = useState((existingFamilyConfig?.childName || '').trim());
  const [pinDigits, setPinDigits] = useState('');
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  const handlePinInput = (raw) => {
    // Accept digits only, max 4
    const digits = (raw || '').replace(/\D/g, '').slice(0, 4);
    setPinDigits(digits);
    setPinError('');
  };

  const submit = () => {
    if (!childName.trim()) return;
    if (pinDigits && pinDigits.length !== 4) {
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
        childName: childName.trim(),
        siblings: [],
      },
    });
  };

  const canSubmit = childName.trim().length > 0;
  const input = 'w-full min-w-0 rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-3 font-body text-lg text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-cobalt';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Eltern-Einstellungen"
      className="fixed inset-0 overflow-y-auto bg-white text-ink font-body"
    >
      <main
        className="relative z-10 min-h-full flex flex-col px-5 max-w-md mx-auto"
        style={{
          paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Small egg, one beat. The parent stays blind to Ronki. */}
        <div className="flex justify-center mb-4">
          <RonkiArt pose="egg-sun" size={84} idle="bb-egg-wobble" label="Ein Ei" />
        </div>

        {/* Header */}
        <div className="text-center mb-7">
          <p className="bb-hand text-2xl text-cobalt mb-1">Kurz einrichten</p>
          <h1 className="bb-display text-4xl">Drei kleine Sachen.</h1>
          <p className="text-lg text-ink-soft mt-3 leading-relaxed">Dann darf mit Ronki gespielt werden.</p>
        </div>

        {/* Section 1: Child name */}
        <section className="mb-6">
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

        {/* Section 2: PIN */}
        <section className="mb-6">
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
          {pinError && (
            <p className="text-base text-error font-headline font-semibold mt-2">{pinError}</p>
          )}
          <p className="text-base text-ink-soft mt-2 leading-relaxed">
            Leer lassen heißt: Standard-PIN <strong className="text-ink">1234</strong>. Im Eltern-Bereich jederzeit änderbar.
          </p>
        </section>

        {/* Section 3: Analytics consent */}
        <section className="mb-8">
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

        {/* CTA */}
        <PillButton full size="lg" arrow onClick={submit} disabled={!canSubmit}>
          Weiter zum Kind
        </PillButton>

        <p className="text-base text-center text-ink-soft mt-5 leading-relaxed">
          Keine Daten verlassen Deutschland. Mehr im Eltern-Bereich.
        </p>
      </main>
    </div>
  );
}
