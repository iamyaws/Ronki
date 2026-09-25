import React, { useEffect, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { track } from '../../lib/analytics';
import { getActiveToken, generateToken, setActiveToken, claimLocalProfile } from '../../lib/profileToken';
import { savePendingHatch, takePendingHatch, clearPendingHatch } from '../../lib/pendingHatch';
import { pickPhase } from './onboardingPhase';
import MeetRonki from '../drachennest/MeetRonki';
import NoProfileLanding from '../NoProfileLanding';
import CombinedParentSetup from '../CombinedParentSetup';
import HandoffBackCard from '../HandoffBackCard';
import TeachFireStep from './TeachFireStep';
import FirstDayIntro from './FirstDayIntro';

/**
 * OnboardingChain: egg first for everyone (Finch pass, 26 Sep 2026).
 *
 * Moved out of App.jsx. The screen comes from pickPhase()
 * (./onboardingPhase.ts) so a reload lands on the right one:
 *
 *   meet      MeetRonki: egg, hatch, name. Asks for a parent when the
 *             parent step is still open, or greets the child by name
 *             when a ronki.de card already carried it.
 *   scan      NoProfileLanding as a sheet, from "Ich habe schon eine
 *             Karte" (egg screens) or "Karte scannen" (parent step).
 *   parent    CombinedParentSetup; creates the profile token.
 *   handback  HandoffBackCard: "Jetzt bist du wieder dran!" and "Jetzt
 *             kenn ich dich".
 *   teach     TeachFireStep, the first breath.
 *   firstday  FirstDayIntro (local UI state after the teach beat), then
 *             completeOnboarding(...) exactly as before.
 *
 * A card scanned after a local hatch: the child's picks go into the
 * ronki_pending_hatch stash just before the token is stored, and are
 * applied after the reload when the loaded card has not met Ronki yet
 * and the active token is the one the stash was written for (spec R7,
 * src/lib/pendingHatch.ts).
 *
 * `previewLoop` (?onboardingPreview=1): after onboardingDone fires, waits
 * about 2 s and resets the gates so designers can cycle the chain.
 *
 * useAnalytics() is mounted here so the consent flag mirrors from the
 * first onboarding screen on (census 7).
 */

function hasProfileToken() {
  try { return !!getActiveToken(); } catch { return false; }
}

export default function OnboardingChain({ previewLoop, onComplete }) {
  const { state, actions } = useTask();
  // TeachBreathBeat expects a translation function; pulled once here.
  const { t } = useTranslation();
  useAnalytics();

  const [meetData, setMeetData] = useState({ companionName: '', companionVariant: 'forest' });
  const [wantsCard, setWantsCard] = useState(false);
  const [teachDone, setTeachDone] = useState(false);
  const [tokenTick, setTokenTick] = useState(0);
  const hasToken = hasProfileToken();
  // tokenTick only forces a fresh read of the token after the parent step.
  void tokenTick;

  const phase = pickPhase(state, { hasToken, wantsCard, teachDone });

  // A hatch that waited for a card scan: apply once, on the loaded state.
  const stashCheckedRef = useRef(false);
  useEffect(() => {
    if (!state || stashCheckedRef.current) return;
    stashCheckedRef.current = true;
    let token = null;
    try { token = getActiveToken(); } catch { token = null; }
    // Bound to the card it was written for: under any other token it is dropped.
    const fields = takePendingHatch(state, { token });
    if (fields) actions.patchState?.(fields);
  }, [state, actions]);

  // Preview loop: when onboardingDone flips, wait 2 s, then reset the
  // gates so the cycle replays. Real users skip this branch.
  useEffect(() => {
    if (!previewLoop || !state?.onboardingDone) return undefined;
    const id = setTimeout(() => {
      setTeachDone(false);
      setWantsCard(false);
      actions.patchState?.({
        onboardingDone: false,
        kidIntroSeen: false,
        parentOnboardingDone: false,
        parentHandoffBackSeen: false,
      });
    }, 2200);
    return () => clearTimeout(id);
  }, [previewLoop, state?.onboardingDone, actions]);

  if (!state || phase === 'done') return null;

  const companionVariant = state.companionVariant || meetData.companionVariant;
  const childName = state.familyConfig?.childName || '';

  if (phase === 'scan') {
    // From the egg the way back is the egg; from the parent step it is that step.
    return (
      <NoProfileLanding
        onBack={() => setWantsCard(false)}
        backToEgg={!state.kidIntroSeen}
        onBeforeOpen={(token) => {
          // The child already met Ronki on this device: keep the dragon,
          // bound to the card that is about to open.
          if (state.kidIntroSeen && state.companionName && token) {
            savePendingHatch({
              companionName: state.companionName,
              companionVariant: state.companionVariant || 'forest',
              token,
            });
          }
        }}
      />
    );
  }

  if (phase === 'meet') {
    return (
      <MeetRonki
        onWantsCard={hasToken ? undefined : () => setWantsCard(true)}
        needsParent={!state.parentOnboardingDone}
        childName={childName}
        onComplete={({ companionName, companionVariant: variant }) => {
          // The name is Ronki's nickname (companionName); the child's own
          // name comes only from the parent step or the card.
          setMeetData({ companionName: companionName || '', companionVariant: variant || 'forest' });
          actions.patchState?.({
            kidIntroSeen: true,
            companionName: companionName || state.companionName,
            companionVariant: variant || state.companionVariant,
          });
        }}
      />
    );
  }

  if (phase === 'parent') {
    return (
      <CombinedParentSetup
        existingFamilyConfig={state.familyConfig}
        onScanCard={hasToken ? undefined : () => setWantsCard(true)}
        onComplete={(payload) => {
          actions.patchState?.(payload);
          const fc = payload.familyConfig;
          if (fc) actions.updateFamilyConfig?.(fc);
          if (fc?.routine) actions.setRoutine?.(fc.routine);
          if (fc?.eveningStart) actions.setEveningStart?.(fc.eveningStart);
          // QR-auth phase 2: anchor every fresh profile to a cloud row
          // from the moment the parent step completes. Skip when a token
          // already exists (a card, or an orphan token).
          try {
            if (!getActiveToken()) {
              const fresh = generateToken();
              setActiveToken(fresh);
              claimLocalProfile(fresh);
            }
          } catch { /* private mode or quota: survive silently */ }
          setTokenTick((n) => n + 1);
          track('onboarding.parent.done');
        }}
      />
    );
  }

  if (phase === 'handback') {
    return (
      <HandoffBackCard
        childName={childName}
        variant={companionVariant}
        onContinue={() => actions.patchState?.({ parentHandoffBackSeen: true })}
      />
    );
  }

  if (phase === 'teach') {
    // TeachFireStep contract: { variant, t, ProgressBar, onComplete }.
    return (
      <TeachFireStep
        variant={companionVariant}
        t={t}
        ProgressBar={NoProgressBar}
        onComplete={() => {
          track('onboarding.teachfire.complete');
          setTeachDone(true);
        }}
      />
    );
  }

  // phase === 'firstday': the finisher. completeOnboarding flips
  // onboardingDone, OnboardingGate unmounts the chain, AppContent takes over.
  return (
    <FirstDayIntro
      eveningStart={state.familyConfig?.eveningStart}
      onDone={() => {
        track('onboarding.firstday.done');
        clearPendingHatch();
        actions.completeOnboarding?.({
          companionVariant,
          heroGender: null,
          taughtSignature: 'fire',
        });
        if (typeof onComplete === 'function') onComplete();
      }}
    />
  );
}

function NoProgressBar() {
  return null;
}
