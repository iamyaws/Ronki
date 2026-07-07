import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AuthProvider, useAuth, LoginScreen } from './context/AuthContext';
import { TaskProvider, useTask } from './context/TaskContext';
import { CelebrationQueueProvider, useCelebrationQueue } from './context/CelebrationQueue';
import { useTranslation } from './i18n/LanguageContext';
import PinModal from './components/PinModal';
import NavBar from './components/NavBar';
import TabUnlockCelebration from './components/TabUnlockCelebration';
import SpendEffect from './components/SpendEffect';
import { QuestEaterProvider } from './components/QuestEater';
import TaskList from './components/TaskList';
import Belohnungsbank from './components/Belohnungsbank';
// Cuts #4–#5 (25 Apr 2026 northstar): Hub.jsx + Sanctuary +
// HeldenKodex deleted. RoomHub is the only primary surface.
import RoomHub from './components/drachennest/RoomHub';
import Journal from './components/Journal';
// Onboarding.jsx (8-step kid flow) deleted Apr 26 2026 in the
// onboarding-trim. Replaced by MeetRonki + TeachFireStep run in
// sequence after the parent setup. See OnboardingChain below.
import TeachFireStep from './components/onboarding/TeachFireStep';
import CombinedParentSetup from './components/CombinedParentSetup';
import BackgroundMusic from './utils/backgroundMusic';
import { getActiveToken, ensureTokenForExistingProfile, generateToken, setActiveToken } from './lib/profileToken';
import NoProfileLanding from './components/NoProfileLanding';
import TeachFirePreview from './components/TeachFirePreview';
import TeachRitualPreview from './components/TeachRitualPreview';
// ParentOnboarding (5-step) replaced by CombinedParentSetup (1-step).
// KidIntro (greeting + handoff sub-screens) replaced by MeetRonki's
// in-cave approach beat. Both deleted Apr 26 2026 in the onboarding-trim.
import HandoffBackCard from './components/HandoffBackCard';
import PWAInstallSheet from './components/PWAInstallSheet';
import { usePWAInstall } from './hooks/usePWAInstall';
import { usePWAPromptGate } from './hooks/usePWAPromptGate';
import ParentalDashboard from './components/ParentalDashboard';
import Celebration from './components/Celebration';
// Arc offer system paused — see backlog_arc_offer_rework.md
// import ArcOfferCard from './components/ArcOfferCard';
import FreundCallbackCard from './components/FreundCallbackCard';
import MiniGames from './components/MiniGames';
// Spielzeugkiste — all legacy mini-games kept alongside StarCatcher
// (Marc 26 Apr 2026: "please add back all mini games to spielzeugkiste").
// The cuts removed unused tiles to slim the routine surface; on the
// dedicated games tab the kid actively chooses, so the full library
// belongs there.
import StarCatcherGame from './components/StarCatcherGame';
import MemoryGame from './components/MemoryGame';
import PotionGame from './components/PotionGame';
import CloudJumpGame from './components/CloudJumpGame';
import StarfighterGame from './components/StarfighterGame';
// KristallSortiererGame deleted again. Louis tested it "super boring."
import ToolErrorBoundary from './components/ToolErrorBoundary';
// ── Lazy-loaded tools + games ──────────────────────────────────────────
// These surfaces are mounted conditionally (URL param shortcuts, post-
// routine tool launches, MINT-game selection) and account for the
// majority of our JS bundle weight despite most users never opening
// them in a given session. Code-split via React.lazy + dynamic import
// so the initial chunk ships only the core Hub/Aufgaben/Care/Journal
// flow — each tool/game arrives on demand when Louis actually opens it.
//
// KristallSortiererGame + StarfighterGame + CloudJumpGame deleted in
// cut #5 (25 Apr 2026 — wrong-genre minigames don't serve the
// companion thesis).
const ZahlenjagdGame = lazy(() => import('./components/ZahlenjagdGame'));
const MusterMemoryGame = lazy(() => import('./components/MusterMemoryGame'));
const WurzelLabyrinthGame = lazy(() => import('./components/WurzelLabyrinthGame'));
const PilzWaageGame = lazy(() => import('./components/PilzWaageGame'));
const KristallKetteGame = lazy(() => import('./components/KristallKetteGame'));
const KristallHoehleGame = lazy(() => import('./components/KristallHoehleGame'));
const CampfireVisitorsGame = lazy(() => import('./components/CampfireVisitorsGame'));
const DreiDankeTool = lazy(() => import('./components/DreiDankeTool'));
// KraftwortTool re-shipped Apr 2026 as the BeiRonkiSein-tier replacement
// for the sticker-of-the-day version deleted in cut #8.
const KraftwortTool = lazy(() => import('./components/KraftwortTool'));
const LoewenPoseTool = lazy(() => import('./components/LoewenPoseTool'));
const SteinUndGummiTool = lazy(() => import('./components/SteinUndGummiTool'));
const GedankenWolkenTool = lazy(() => import('./components/GedankenWolkenTool'));
const HoermomentTool = lazy(() => import('./components/HoermomentTool'));
const RonkiAusmalbild = lazy(() => import('./components/RonkiAusmalbild'));
const RonkiCompendium = lazy(() => import('./components/RonkiCompendium'));
// ── End lazy tools/games ───────────────────────────────────────────────
import CompanionToast from './components/CompanionToast';
import ParentIntroOverlay from './components/ParentIntroOverlay';
// ScreenTimer deleted in cut #6 (25 Apr 2026 — Funkelzeit removal).
import RonkiProfile from './components/RonkiProfile';
import Buch from './components/Buch';
import ChibiGallery from './components/ChibiGallery';
import MemoryWall from './components/MemoryWall';
import DiscoveryLog from './components/DiscoveryLog';
import Micropedia from './components/Micropedia';
// QuestLineView deleted Apr 2026 (cut #10f). NORTHSTAR: "not a skill tree".
import { useSpecialQuests } from './hooks/useSpecialQuests';
// Easter-egg system paused Apr 2026 — Marc: "don't feel it anymore".
// Hook + component files kept so we can re-enable by restoring these imports.
// useEggSystem deleted Apr 2026 (cut #10h). Egg-spawner mechanic
// retired entirely.
import { useMicropediaDiscovery } from './hooks/useMicropediaDiscovery';
import { useQuietAttention } from './hooks/useQuietAttention';
// EggOverlay deleted Apr 2026 (cut #10h).
import CreatureDiscoveryToast from './components/CreatureDiscoveryToast';
import FriendIntroCeremony from './components/drachennest/FriendIntroCeremony';
import MeetRonki from './components/drachennest/MeetRonki';
import TonightRitual from './components/drachennest/TonightRitual';
import RonkisTag from './components/drachennest/RonkisTag';
import AlphaBanner from './components/AlphaBanner';
import SWUpdateBanner from './components/SWUpdateBanner';
import { useAnalytics } from './hooks/useAnalytics';

// Tiny Suspense fallback for lazy-loaded tools/games. Intentionally
// minimal — the chunks are small and a full "loading screen" treatment
// would flash on fast networks. Shows a breath-sized pause message so a
// 6yo knows something's arriving rather than assuming the tap broke.
function ToolLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-surface">
      <p className="font-label text-sm text-on-surface-variant">Einen Moment…</p>
    </div>
  );
}

// View → tool-id map for analytics. These names match the spec enum
// (box_atmung / drei_danke / kraftwort / loewe / stein_gummi / ausmalbild).
// Views not in this map don't fire tool.open (Hub / Aufgaben / etc.).
const TOOL_VIEW_IDS = {
  'drei-danke': 'drei_danke',
  kraftwort: 'kraftwort',
  loewe: 'loewe',
  'stein-gummi': 'stein_gummi',
  'gedanken-wolken': 'gedanken_wolken',
  hoermoment: 'hoermoment',
  ausmalbild: 'ausmalbild',
};

function AppContent() {
  const { t } = useTranslation();
  const { state, actions, loading, toastTrigger } = useTask();
  const { track } = useAnalytics();
  // Dev URL shortcuts — apply on mount so they propagate to every
  // component (not just the Ronki tab where RonkiProfile reads them).
  //   ?gallery=1            — jump to the standalone ChibiGallery
  //   ?variant=teal|...     — seed companionVariant (affects campfire
  //                            Ronki, profile, any future chibi)
  //   ?stage=0..3           — seed catEvo to the matching stage threshold
  //
  // All of these param shortcuts are QA/dev affordances — gated behind
  // import.meta.env.DEV so production bundles don't accept them. The
  // actual in-app entries to each tool (Gefühlsecke → Box-Atmung etc.)
  // remain untouched; only the ?loewe=1 / ?cave=1 / ?dreiDanke=1 style
  // URL shortcuts are dev-only.
  const initialView = (() => {
    if (!import.meta.env.DEV) return 'hub';
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('gallery') === '1') return 'gallery';
      if (p.get('cave') === '1') return 'hoehle';
      if (p.get('visitors') === '1') return 'visitors';
      if (p.get('dreiDanke') === '1') return 'drei-danke';
      if (p.get('kraftwort') === '1') return 'kraftwort';
      if (p.get('loewe') === '1') return 'loewe';
      if (p.get('steinGummi') === '1') return 'stein-gummi';
      if (p.get('gedankenWolken') === '1') return 'gedanken-wolken';
      if (p.get('hoermoment') === '1') return 'hoermoment';
      if (p.get('ausmalbild') === '1') return 'ausmalbild';
      // Claude Design hi-fi previews (26 Apr 2026 handoff)
      if (p.get('meet') === '1') return 'meet';
      if (p.get('tonight') === '1') return 'tonight';
      if (p.get('streifen') === '1') return 'streifen';
    }
    return 'hub';
  })();
  const [view, setView] = useState(initialView);
  const urlParamsAppliedRef = useRef(false);
  useEffect(() => {
    // Wait for the persisted state to load before patching — firing at
    // bare App mount would either no-op (actions not wired) or get
    // overwritten when TaskContext loads from storage. Guarded with a
    // ref so the patch fires exactly once.
    if (!state || urlParamsAppliedRef.current) return;
    urlParamsAppliedRef.current = true;
    if (typeof window === 'undefined') return;
    // All state-seed params (?variant, ?stage, ?ronkiMood, ?boxAtmung)
    // exist purely for QA previews across devices. Gating them behind
    // import.meta.env.DEV means production builds ignore the query even
    // if someone bookmarks an old preview URL.
    if (!import.meta.env.DEV) return;
    const p = new URLSearchParams(window.location.search);
    const patch = {};
    const v = p.get('variant');
    if (/^(amber|teal|rose|violet|forest|sunset)$/.test(v || '')) {
      patch.companionVariant = v;
    }
    const s = p.get('stage');
    if (s && /^[0-5]$/.test(s)) {
      // Thresholds match CAT_STAGES in constants.ts — 0 Ei, 1 Baby,
      // 2 Jungtier, 3 Stolz, 4 Heranwachsend, 5 Legendär.
      patch.catEvo = [0, 3, 9, 18, 30, 45][parseInt(s, 10)];
    }
    const mood = p.get('ronkiMood');
    if (['sad', 'tired', 'normal', 'besorgt', 'gut', 'magisch'].includes(mood)) {
      patch.ronkiMood = mood;
      patch.ronkiMoodSetDate = mood === 'normal'
        ? undefined
        : new Date().toISOString().slice(0, 10);
    }
    const boxParam = p.get('boxAtmung');
    if (boxParam === 'learned') {
      patch.ronkiSkillPractice = { boxAtmung: 5 };
      patch.ronkiLearnedSkills = ['boxAtmung'];
      patch.ronkiLearnBannerSeen = { boxAtmung: true };
    } else if (boxParam === 'learning') {
      patch.ronkiSkillPractice = { boxAtmung: 4 };
      patch.ronkiLearnedSkills = [];
      patch.ronkiLearnBannerSeen = {};
    } else if (boxParam && /^\d+$/.test(boxParam)) {
      const n = Math.min(5, Math.max(0, parseInt(boxParam, 10)));
      patch.ronkiSkillPractice = { boxAtmung: n };
      patch.ronkiLearnedSkills = n >= 5 ? ['boxAtmung'] : [];
    }
    if (Object.keys(patch).length > 0 && actions?.patchState) {
      actions.patchState(patch);
    }
  }, [state, actions]);
  // activeQuestLineId state removed Apr 2026 (cut #10f, QuestLine deletion).
  const [activeMintGame, setActiveMintGame] = useState(null); // MINT game id when view==='mint-game'
  const [showParental, setShowParental] = useState(false);
  // PIN gate — intercepts every parental-dashboard entry (lock tap, long
  // press). Dashboard only opens after the correct 4-digit PIN.
  const [pinGateOpen, setPinGateOpen] = useState(false);
  const [pin, setPin] = useState('');
  const openPinGate = () => { setPin(''); setPinGateOpen(true); };
  // Cut #6 (25 Apr 2026): screenTimer state removed alongside Funkelzeit.

  // Post-engagement PWA install prompt. Replaces the upfront step-7 prompt
  // the old Onboarding.jsx fired. Opens only after kid+parent onboarding
  // are done AND the first habit is complete (totalTasksDone >= 1), AND
  // the app isn't already installed as standalone. Fires at most twice
  // per user (day-1 + day-2 retry). See src/hooks/usePWAPromptGate.js.
  const { shouldPrompt: shouldPromptPWA, markShown: markPWAShown } = usePWAPromptGate();
  const { isIOS, androidPrompt, promptInstall } = usePWAInstall();

  useSpecialQuests(); // side-effect only — silently completes special quests
  // useEggSystem deleted Apr 2026 (cut #10h).
  useQuietAttention(view); // gentle voice brake when Louis zooms through screens

  // Creature discovery — Drachennest reframe (Marc 25 Apr 2026):
  // first-time encounters fire the FriendIntroCeremony full-screen
  // takeover; small in-app toasts only fire on celebrations the
  // kid has already seen the ceremony for. Routed through the
  // CelebrationQueue's modal slot so the ceremony serializes with
  // any other celebration in flight (no two takeovers at once).
  const { enqueue: enqueueCelebration } = useCelebrationQueue();
  const [introCreatureId, setIntroCreatureId] = useState(null);
  useMicropediaDiscovery((id) => {
    // useMicropediaDiscovery only fires on creatures NOT in
    // state.micropediaDiscovered, so every fire is a first-ever
    // encounter — perfect entry point for the ceremony. Queued as
    // a modal so it owns the screen until the kid taps through.
    enqueueCelebration({
      id: `discover-${id}`,
      kind: 'modal',
      sfx: 'coin',
      render: ({ dismiss }) => (
        <FriendIntroCeremony
          creatureId={id}
          onClose={() => { setIntroCreatureId(null); dismiss(); }}
        />
      ),
    });
    setIntroCreatureId(id);
  });

  useEffect(() => {
    // Flush any queued feedback from previous offline sessions
    import('./utils/feedback').then(m => m.flushFeedbackQueue()).catch(() => {});
  }, []);

  // Stamp lastLoginDate after hydration settles. Intentionally delayed so
  // usePWAPromptGate's day-2 retry effect observes the pre-stamp value —
  // without the delay, the hook would always see lastLoginDate === today
  // and the retry would never fire.
  //
  // Guarded by a ref so it runs once per mount; the 150ms timeout lets
  // the PWA hook's useEffect schedule (it runs on state load via its own
  // dependencies) before we clobber the old date.
  const lastLoginStampedRef = useRef(false);
  useEffect(() => {
    if (!state || lastLoginStampedRef.current) return;
    if (!actions?.patchState) return;
    const todayIso = new Date().toISOString().slice(0, 10);
    if (state.lastLoginDate === todayIso) {
      lastLoginStampedRef.current = true;
      return;
    }
    const id = setTimeout(() => {
      actions.patchState({ lastLoginDate: todayIso });
      lastLoginStampedRef.current = true;
    }, 150);
    return () => clearTimeout(id);
  }, [state, actions]);

  // app.open — one per session. The analytics module dedups via
  // sessionStorage so hot-reloads / StrictMode double-mounts don't
  // double-count. Fires as soon as AppContent mounts (post-auth,
  // post-onboarding) so we measure actual engaged sessions, not
  // login-screen bounces.
  useEffect(() => {
    track('app.open');
  }, [track]);

  // tool.open / tool.complete — bridged from view transitions. We keep a
  // ref to the currently-open tool + its open timestamp; when view moves
  // off the tool, fire tool.complete with the elapsed duration. This
  // keeps per-tool files untouched (DreiDankeTool / KraftwortTool / etc.
  // remain out of the wiring scope). A tool that transitions to another
  // tool fires complete-then-open correctly.
  const activeToolRef = useRef(null); // { id, startedAt }
  useEffect(() => {
    const prev = activeToolRef.current;
    const nextId = TOOL_VIEW_IDS[view] || null;

    // Leaving a tool — fire tool.complete first.
    if (prev && prev.id !== nextId) {
      const durationSec = Math.max(0, Math.round((Date.now() - prev.startedAt) / 1000));
      track('tool.complete', { tool: prev.id, durationSec });
      activeToolRef.current = null;
    }

    // Entering a tool — fire tool.open + record start time for duration.
    if (nextId && (!prev || prev.id !== nextId)) {
      track('tool.open', { tool: nextId });
      activeToolRef.current = { id: nextId, startedAt: Date.now() };
    }
  }, [view, track]);

  // Scroll to top whenever the active view changes; also record first-time visits
  useEffect(() => {
    // Belt-and-suspenders: works across iOS PWA, Android WebView, desktop
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    actions.recordViewVisit(view); // track first-time feature discovery
  }, [view]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-surface">
        <p className="font-headline text-xl font-bold text-primary">{t('app.loading')}</p>
      </div>
    );
  }

  // Onboarding (Apr 26 2026 trim): handled upstream by OnboardingGate
  // → OnboardingChain (4 screens). When AppContent mounts,
  // state.onboardingDone is already true; AppContent never has to
  // worry about onboarding gating. ExperimentAutoPrime is dead.

  // Long-press backdoor removed — the lock button on Buch + Laden gives a
  // focused, intentional parental entry, and a 1.5s anywhere-hold was
  // triggering on scroll holds. If parents need backdoor access on views
  // without a lock (Aufgaben), we'll add the lock there instead.

  return (
    <>
      <div className="min-h-dvh max-w-lg mx-auto"
           style={{
             // Transparent wrapper — no cream bg. Each view hosts its own
             // TopBar internally (Hub pattern: pill floats over the view's
             // own sky/scene backdrop instead of sitting on a cream band).
             // Hub + Care render their own headers; other views pull in the
             // shared TopBar as the first child inside their own relative
             // container so the pills always sit on whatever sky that view
             // paints underneath.
             paddingTop: ['hub', 'care'].includes(view) ? 0 : 'var(--alpha-banner-h, 0px)',
             paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
           }}>
        {view === 'quests' && (
          // HEUTE bottom-nav now routes to RonkisTag (Streifen) — the
          // new comic-strip daily surface, same component the cave's
          // 'aufgaben' tile mounts. Marc 27 Apr 2026: HEUTE was firing
          // the old TaskList; the brutal-honesty audit had aligned its
          // section labels but the kid was still landing on the
          // checklist surface, not the new strip. Both nav paths now
          // converge on the same surface. TaskList component is left
          // in the codebase for the moment (downstream questline
          // back-buttons may still poke it) but is no longer reachable
          // through normal user flow — Tier-1 candidate for deletion
          // in the next trim sweep.
          <RonkisTag
            onClose={() => setView('hub')}
            onOpenExpedition={() => {
              actions?.startExpedition?.();
              setView('hub');
            }}
            onOpenTonight={() => setView('tonight')}
          />
        )}
        {view === 'shop' && <Belohnungsbank onNavigate={setView} onOpenParental={() => openPinGate()} />}
        {view === 'hub' && (
          // Cut #4 (Marc 25 Apr 2026 — northstar lock-in): RoomHub
          // is the only primary surface. The legacy Hub.jsx
          // chore-tracker is no longer reachable; the `?legacyHub=1`
          // dev fallback was removed when the northstar locked the
          // companion direction. Hub.jsx + its mission/boss/gear
          // surfaces get deleted entirely in cut #5.
          <RoomHub
            onNavigate={(target, opts) => {
              // 'aufgaben' from the cave routes to RonkisTag
              // (Streifen, hi-fi Direction A from the 26 Apr 2026
              // brief) — the daily surface as a story-of-the-day
              // strip rather than a checklist. The legacy TaskList
              // still mounts on view==='quests' for questline
              // back-buttons and any direct setView('quests') call,
              // but the cave's primary entry now lands on Streifen.
              // The anchor hint is preserved on the URL hash for a
              // future scroll-to-anchor pass.
              if (target === 'aufgaben') {
                if (opts?.anchor && typeof window !== 'undefined') {
                  history.replaceState(null, '', `#anchor=${opts.anchor}`);
                }
                setView('streifen');
              }
              else if (target === 'belohnungen') setView('shop');
              else if (target === 'buch') setView('buch');
              else if (target === 'spiele') setView('games');
              else setView(target);
            }}
          />
        )}
        {view === 'journal' && <Journal onNavigate={setView} onOpenParental={() => openPinGate()} />}
        {view === 'meet' && (
          <MeetRonki onComplete={() => setView('hub')} />
        )}
        {view === 'tonight' && (
          <TonightRitual onClose={() => setView('hub')} />
        )}
        {view === 'streifen' && (
          <RonkisTag
            onClose={() => setView('hub')}
            onOpenExpedition={() => {
              actions?.startExpedition?.();
              setView('hub');
            }}
            onOpenTonight={() => setView('tonight')}
          />
        )}
        {view === 'ronki' && <RonkiProfile onNavigate={setView} />}
        {view === 'memories' && <MemoryWall />}
        {view === 'buch' && <Buch onNavigate={setView} />}
        {view === 'gallery' && <ChibiGallery onClose={() => setView('hub')} />}
        {view === 'discovery' && <DiscoveryLog onNavigate={setView} />}
        {view === 'micropedia' && <Micropedia onNavigate={setView} />}
        {/* view==='questline' route removed Apr 2026 (cut #10f). */}
        {view === 'games' && (
          <MiniGames
            onPlay={(id) => setView(id)}
            onNavigate={setView}
            onPlayMint={(id) => {
              setActiveMintGame(id);
              setView('mint-game');
            }}
          />
        )}
      </div>
      <NavBar active={view} onNavigate={setView} />
      <TabUnlockCelebration view={view} />
      <SpendEffect />
      {/* ── MINT games — rendered OUTSIDE the max-w-lg wrapper so they
             cover the full viewport (same pattern as MemoryGame/PotionGame
             below). Previously nested inside the wrapper they got clipped
             to the max-w-lg "banner" width. Marc flagged WurzelLabyrinth
             opening "within the banner" — this moves all MINT games to the
             top-level overlay layer. ── */}
      {view === 'mint-game' && activeMintGame === 'zahlenjagd' && (
        <ToolErrorBoundary toolName="ZahlenjagdGame" onBack={() => { setActiveMintGame(null); setView('hub'); }}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <ZahlenjagdGame onComplete={(reward) => {
              if (reward?.hp > 0) actions.addHP(reward.hp);
              setActiveMintGame(null);
              setView('hub');
            }} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'mint-game' && activeMintGame === 'muster-memory' && (
        <ToolErrorBoundary toolName="MusterMemoryGame" onBack={() => { setActiveMintGame(null); setView('hub'); }}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <MusterMemoryGame onComplete={(reward) => {
              if (reward?.hp > 0) actions.addHP(reward.hp);
              setActiveMintGame(null);
              setView('hub');
            }} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'mint-game' && activeMintGame === 'wurzel-labyrinth' && (
        <ToolErrorBoundary toolName="WurzelLabyrinthGame" onBack={() => { setActiveMintGame(null); setView('hub'); }}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <WurzelLabyrinthGame onComplete={(reward) => {
              if (reward?.hp > 0) actions.addHP(reward.hp);
              setActiveMintGame(null);
              setView('hub');
            }} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'mint-game' && activeMintGame === 'pilz-waage' && (
        <ToolErrorBoundary toolName="PilzWaageGame" onBack={() => { setActiveMintGame(null); setView('hub'); }}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <PilzWaageGame onComplete={(reward) => {
              if (reward?.hp > 0) actions.addHP(reward.hp);
              setActiveMintGame(null);
              setView('hub');
            }} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'mint-game' && activeMintGame === 'kristall-sortierer' && (
        <ToolErrorBoundary toolName="KristallKetteGame" onBack={() => { setActiveMintGame(null); setView('hub'); }}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <KristallKetteGame onComplete={(reward) => {
              if (reward?.hp > 0) actions.addHP(reward.hp);
              setActiveMintGame(null);
              setView('hub');
            }} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'hoehle' && (
        <ToolErrorBoundary toolName="KristallHoehleGame" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <KristallHoehleGame onClose={() => setView('hub')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'visitors' && (
        <ToolErrorBoundary toolName="CampfireVisitorsGame" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <CampfireVisitorsGame onClose={() => setView('hub')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'drei-danke' && (
        <ToolErrorBoundary toolName="DreiDankeTool" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <DreiDankeTool onComplete={() => setView('ronki')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'kraftwort' && (
        <ToolErrorBoundary toolName="KraftwortTool" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <KraftwortTool onComplete={() => setView('ronki')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'loewe' && (
        <ToolErrorBoundary toolName="LoewenPoseTool" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <LoewenPoseTool onComplete={() => setView('ronki')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'stein-gummi' && (
        <ToolErrorBoundary toolName="SteinUndGummiTool" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <SteinUndGummiTool onComplete={() => setView('ronki')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'gedanken-wolken' && (
        <ToolErrorBoundary toolName="GedankenWolkenTool" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <GedankenWolkenTool onComplete={() => setView('ronki')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'hoermoment' && (
        <ToolErrorBoundary toolName="HoermomentTool" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <HoermomentTool onComplete={() => setView('ronki')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'ausmalbild' && (
        <ToolErrorBoundary toolName="RonkiAusmalbild" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <RonkiAusmalbild onClose={() => setView('hub')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {pinGateOpen && (
        <PinModal
          pin={pin}
          setPin={setPin}
          onSuccess={() => {
            setPinGateOpen(false);
            setPin('');
            setShowParental(true);
          }}
          onClose={() => { setPinGateOpen(false); setPin(''); }}
        />
      )}
      {showParental && <ParentalDashboard onClose={() => setShowParental(false)} currentView={view} preauthorized />}
      {/* Spielzeugkiste — all 6 legacy mini-games (Marc 26 Apr 2026
          restored after the routine-side cut sweep). They live on the
          dedicated games tab where the kid actively chooses, separate
          from the daily routine surface. */}
      {view === 'memory' && <MemoryGame onComplete={() => {
        actions.claimGameReward('memory');
        setView('games');
      }} />}
      {view === 'starfall' && <StarCatcherGame onComplete={() => {
        actions.claimGameReward('starfall');
        setView('games');
      }} />}
      {view === 'potion' && <PotionGame onComplete={() => {
        actions.claimGameReward('potion');
        setView('games');
      }} />}
      {view === 'clouds' && <CloudJumpGame onComplete={() => {
        actions.claimGameReward('clouds');
        setView('games');
      }} />}
      {view === 'starfighter' && <StarfighterGame onComplete={(reward) => {
        if (reward?.hp > 0) actions.addHP(reward.hp);
        actions.claimGameReward('starfighter');
        setView('games');
      }} />}
      {/* Egg system deleted Apr 2026 (cut #10h). state.pendingEgg may
          linger in old saves but is never rendered or mutated. */}
      <CompanionToast trigger={toastTrigger} />
      {/* ParentIntroOverlay retired 25 Apr 2026. The ParentOnboarding
          flow now introduces the parent area up-front (and the Eltern-
          Bereich entry icon in the top chrome makes it discoverable),
          so a later "ah, hier gibts noch was für Mama & Papa" resume
          popup is redundant. Component + state flag stay for history. */}
      {/* Variant-migration modal removed — Marc has already talked Louis through
          the change in person, so the in-app "Ronki hat eine neue Form" beat is
          redundant. The component file is kept for reference but no longer mounted. */}
      <Celebration />
      {/* <ArcOfferCard /> — paused, see backlog_arc_offer_rework.md */}
      <FreundCallbackCard />
      {/* ScreenTimer mount deleted in cut #6 (Funkelzeit removal). */}
      {/* CreatureDiscoveryToast is rendered by CelebrationQueue's
           current-surface slot; it mounts only when the queue pops a
           `discover-*` event. See useMicropediaDiscovery wiring above. */}
      {/* Post-engagement PWA install prompt. Fires at the app-shell layer
          (not inside Onboarding) after the first habit completes. Only
          shown outside the Hub tab would feel disruptive, so we let it
          render anywhere — the bottom sheet is already z-[800] and the
          Gate hook's guards (onboardingDone, totalTasksDone >= 1,
          !standalone, !pwaPromptShown) prevent it from firing mid-
          onboarding or on an already-installed instance. */}
      {shouldPromptPWA && (
        <PWAInstallSheet
          isIOS={isIOS}
          androidPrompt={androidPrompt}
          onInstall={async () => {
            await promptInstall();
            markPWAShown();
          }}
          onSkip={() => {
            markPWAShown();
          }}
        />
      )}
    </>
  );
}

function AuthGate() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  // Background music engine — boots once, attaches its own first-
  // gesture listener so audio respects browser autoplay policy.
  // Off by default; parental toggle in dashboard turns it on.
  React.useEffect(() => {
    BackgroundMusic.init();
  }, []);

  // QR-auth Phase 1 (Apr 27 2026): consume any ?p=<token> URL param
  // on first mount so subsequent boots have the token persisted to
  // localStorage. The full Supabase-keyed cloud-load by token is
  // Phase 2; for now this just tags the device with whichever
  // profile the parent shared. See docs/specs/qr-profile-auth.md.
  React.useEffect(() => {
    getActiveToken();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-surface">
        <div className="text-center">
          <img src={`${import.meta.env.BASE_URL}art/ronki-egg-logo.svg`} alt="Ronki" className="w-20 h-auto mx-auto mb-4 drop-shadow-lg" />
          <p className="font-headline text-xl font-bold text-primary">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  // Public routes — no auth required. ?compendium=1 renders the
  // Ronki-Sammelbuch for website visitors and for showing Louis.
  // ?onboardingPreview=1 renders the onboarding flow for QA across
  // viewports/browsers without needing an auth session.
  //
  // Both remain reachable in production — they're intentional public
  // routes (Sammelbuch is linked from the marketing site; onboarding
  // preview is how we smoke-test cross-device). Everything else that
  // reads URL params is gated behind import.meta.env.DEV further down.
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search);
    if (p.get('compendium') === '1') {
      // RonkiCompendium is lazy — wrap in Suspense so the chunk can load,
      // and ToolErrorBoundary so a chunk-load failure surfaces the warm
      // fallback rather than blanking the public URL.
      return (
        <ToolErrorBoundary
          toolName="RonkiCompendium"
          onBack={() => { window.location.search = ''; }}
        >
          <Suspense fallback={<ToolLoadingFallback />}>
            <RonkiCompendium />
          </Suspense>
        </ToolErrorBoundary>
      );
    }
    if (p.get('onboardingPreview') === '1') {
      // Public QA route — runs the full lean chain end-to-end without
      // an auth session. Wrapped in TaskProvider so MeetRonki and
      // TeachFireStep can patch state via useTask hooks. The chain
      // loops on completion (sets onboardingDone, then resets it
      // after a beat) so a designer can keep cycling the flow.
      return (
        <TaskProvider>
          <CelebrationQueueProvider>
            <QuestEaterProvider>
              <OnboardingChain onComplete={() => { /* loops via state reset */ }} previewLoop />
            </QuestEaterProvider>
          </CelebrationQueueProvider>
        </TaskProvider>
      );
    }
    // Dedicated iteration harness for TeachFireStep v2 — replay pill +
    // variant swatches so Marc can loop the fire/smoke sequence without
    // refreshing the browser between runs. Public route like
    // onboardingPreview — no auth required. See TeachFirePreview.jsx.
    if (p.get('teachFirePreview') === '1') {
      return <TeachFirePreview />;
    }
    // Harness for the post-onboarding unlock rituals (Herzfeuer /
    // Funkenstern / Glut / Regenbogenfeuer). Replay pill + flavor
    // swatches let Marc iterate on copy + palette per flavor without
    // triggering the real milestone gates. See TeachRitualPreview.jsx.
    if (p.get('teachRitualPreview') === '1') {
      return <TeachRitualPreview />;
    }
    // ?parentFirstPreview=1 was the QA harness for the now-deleted
    // KidIntro → ParentOnboarding → HandoffBack → Onboarding chain
    // (23 Apr 2026 rework). The new lean chain is reachable via
    // ?onboardingPreview=1 above. Old param redirects there for any
    // bookmarked preview links.
    if (p.get('parentFirstPreview') === '1') {
      const url = new URL(window.location.href);
      url.searchParams.delete('parentFirstPreview');
      url.searchParams.set('onboardingPreview', '1');
      window.location.replace(url.toString());
      return null;
    }

    // Dev fast-path — lands straight on the Hub, skipping auth + all
    // onboarding gates. Useful for UI iteration + local testing without
    // a Supabase user. Use `?devHub=1` (optionally `&variant=forest`
    // to set the chibi colorway). DEV-only — the flag is ignored in
    // production builds.
    if (p.get('devHub') === '1' && import.meta.env.DEV) {
      const variant = p.get('variant') || 'forest';
      return (
        <TaskProvider>
          <CelebrationQueueProvider>
            <QuestEaterProvider>
              <DevHubPrime variant={variant} />
              <AppContent />
            </QuestEaterProvider>
          </CelebrationQueueProvider>
        </TaskProvider>
      );
    }
  }

  // LoginScreen still bypassed for the prototype — restore when auth
  // graduates. Real users land in onboarding-gate; once gates flip,
  // AppContent renders.
  return (
    <TaskProvider>
      <CelebrationQueueProvider>
        <QuestEaterProvider>
          <OnboardingGate />
        </QuestEaterProvider>
      </CelebrationQueueProvider>
    </TaskProvider>
  );
}

/**
 * OnboardingGate — renders OnboardingChain until all onboarding
 * gates flip, then unmounts itself and renders AppContent. The
 * 4-flag legacy state (kidIntroSeen, parentOnboardingDone,
 * parentHandoffBackSeen, onboardingDone) is preserved for save-data
 * compatibility; the new chain flips them in order.
 *
 * QR-auth (3 May 2026 northstar): the app stays a kid-only space.
 * Setup happens on the website (ronki.de/profil-erstellen — parent
 * picks child name + optional PIN, the site generates the token,
 * seeds the cloud row with parentOnboardingDone + parentHandoffBack-
 * Seen pre-flipped, and renders a printable QR card). The kid scans
 * that card on their tablet, syncLoadByToken pulls the seeded state,
 * and the chain skips straight to phase 2 (MeetRonki).
 *
 * If the user lands on this device with no active token AND no
 * onboarded state, NoProfileLanding renders — that screen now has a
 * single primary CTA ("QR-Code scannen") plus a parent callout
 * pointing to the website. There is no in-app "Neues Profil anlegen"
 * entry anymore; CombinedParentSetup remains in the codebase only as
 * the orphan-token fallback (rare: user has a token in localStorage
 * but the cloud row never existed).
 */
function OnboardingGate() {
  const { state } = useTask();
  // Gate considers onboarding complete only when state.onboardingDone.
  // The other 3 flags are stage markers used by the chain's resume
  // logic (so a kid who closes the app mid-flow lands back on the
  // right screen). Pre-rework saves auto-mark these on rehydrate.
  if (!state) return null;
  if (!state.onboardingDone) {
    if (!getActiveToken() && !state.parentOnboardingDone) {
      return <NoProfileLanding />;
    }
    return <OnboardingChain />;
  }
  return <AppContent />;
}

/**
 * OnboardingChain — the lean 4-screen onboarding flow.
 *
 * Phases:
 *   0 — CombinedParentSetup        sets parentOnboardingDone, parentPin,
 *                                  analyticsEnabled, familyConfig
 *   1 — HandoffBackCard            sets parentHandoffBackSeen
 *   2 — MeetRonki                  collects {heroName, companionVariant};
 *                                  sets kidIntroSeen
 *   3 — TeachFireStep              calls completeOnboarding(...) which
 *                                  sets onboardingDone + taughtSignature
 *
 * Resume logic: phase advances based on which gates are already true,
 * so a kid who closes the app mid-flow returns to the right screen.
 *
 * `previewLoop` (?onboardingPreview=1): after onboardingDone fires,
 * waits ~2s and resets the gates so designers can cycle the chain.
 */
function OnboardingChain({ previewLoop, onComplete }) {
  const { state, actions } = useTask();
  // TeachFireStep at phase 3 expects a translation function. Without
  // it, TeachBreathBeat throws "t is not a function" the moment the
  // kid finishes naming Ronki — the most embarrassing possible time
  // to crash. Pulling it once at the chain level so all phases share it.
  const { t } = useTranslation();
  const [meetData, setMeetData] = React.useState({ heroName: '', companionVariant: 'forest' });

  // Compute phase from state gates so resume works.
  const phase =
    !state?.parentOnboardingDone ? 0 :
    !state?.parentHandoffBackSeen ? 1 :
    !state?.kidIntroSeen ? 2 :
                          3;

  // Preview loop — when onboardingDone flips, wait 2s then reset
  // the gates so the cycle replays. Real users skip this branch.
  React.useEffect(() => {
    if (!previewLoop || !state?.onboardingDone) return;
    const t = setTimeout(() => {
      actions.patchState?.({
        onboardingDone: false,
        kidIntroSeen: false,
        parentOnboardingDone: false,
        parentHandoffBackSeen: false,
      });
    }, 2200);
    return () => clearTimeout(t);
  }, [previewLoop, state?.onboardingDone, actions]);

  if (phase === 0) {
    return (
      <CombinedParentSetup
        existingFamilyConfig={state?.familyConfig}
        onComplete={(payload) => {
          actions.patchState?.(payload);
          if (payload.familyConfig) actions.updateFamilyConfig?.(payload.familyConfig);
          // QR-auth Phase 2: anchor every fresh profile to a cloud
          // row from the moment parent setup completes. Subsequent
          // saves go through cloudSaveByToken (TaskContext) so a
          // device swap mid-onboarding (parent fills setup on phone,
          // hands tablet to kid) can resume via the shared link.
          // Skip if a token already exists — this happens when the
          // parent pasted a code on NoProfileLanding before opting
          // into "Neues Profil" anyway, or for ensureTokenForExist-
          // ingProfile tagging on Phase-1-era saves.
          try {
            if (!getActiveToken()) {
              const fresh = generateToken();
              setActiveToken(fresh);
            }
          } catch { /* private mode / quota — survive silently */ }
        }}
      />
    );
  }
  if (phase === 1) {
    return (
      <HandoffBackCard
        onContinue={() => actions.patchState?.({ parentHandoffBackSeen: true })}
      />
    );
  }
  if (phase === 2) {
    return (
      <MeetRonki
        onComplete={({ heroName, companionVariant }) => {
          // Persist what the kid picked + named — TeachFireStep needs
          // companionVariant for its theming, completeOnboarding needs
          // heroName when TeachFireStep finishes.
          setMeetData({ heroName: heroName || '', companionVariant: companionVariant || 'forest' });
          actions.patchState?.({
            kidIntroSeen: true,
            heroName: heroName || state?.heroName,
            companionVariant: companionVariant || state?.companionVariant,
          });
        }}
      />
    );
  }
  // phase === 3 — TeachFireStep is the finisher. completeOnboarding
  // flips state.onboardingDone, OnboardingGate unmounts the chain,
  // AppContent takes over.
  // TeachFireStep contract: { variant, t, ProgressBar, onComplete }.
  // ProgressBar is a child component the original Onboarding.jsx
  // rendered above the beat. We pass a no-op so the beat stays
  // self-contained without the 8-pip onboarding bar.
  const NoProgressBar = () => null;
  return (
    <TeachFireStep
      variant={state?.companionVariant || meetData.companionVariant}
      t={t}
      ProgressBar={NoProgressBar}
      onComplete={() => {
        actions.completeOnboarding?.({
          companionVariant: state?.companionVariant || meetData.companionVariant,
          heroName: state?.heroName || meetData.heroName,
          heroGender: null,
          taughtSignature: 'fire',
        });
        if (typeof onComplete === 'function') onComplete();
      }}
    />
  );
}

// ExperimentAutoPrime deleted Apr 26 2026 in the onboarding-trim.
// The lean OnboardingChain runs in prod; the auto-bypass it provided
// is no longer needed.

function ErrorBoundary({ children }) {
  const { t } = useTranslation();
  const [error, setError] = React.useState(null);
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh bg-surface px-6 text-center">
        <div className="text-5xl mb-4">😿</div>
        <h2 className="font-headline text-xl font-bold text-error mb-2">{t('app.error.title')}</h2>
        <p className="font-body text-on-surface-variant mb-6">{t('app.error.desc')}</p>
        <button
          onClick={() => { setError(null); window.location.reload(); }}
          className="bg-primary-container text-white px-8 py-3 rounded-full font-label font-bold"
        >
          {t('app.error.retry')}
        </button>
      </div>
    );
  }
  return (
    <ErrorBoundaryInner onError={setError}>
      {children}
    </ErrorBoundaryInner>
  );
}

class ErrorBoundaryInner extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  componentDidCatch(e, info) {
    // Surface real error during dev so it's debuggable. Without this
    // the ErrorBoundary's UI just says "Etwas ist schiefgelaufen" with
    // no clue what threw.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] caught:', e, info?.componentStack);
    if (typeof window !== 'undefined') {
      window.__lastError = { message: e?.message, stack: e?.stack, componentStack: info?.componentStack };
    }
    this.props.onError(e);
  }
  render() { return this.state.hasError ? null : this.props.children; }
}

// ── DevHubPrime ───────────────────────────────────────────────────────
// On-mount prime that flips every onboarding gate true so the app
// renders straight into the Hub. DEV-only — gated by import.meta.env.DEV
// in AuthGate before this ever mounts. No-op when state is already
// onboarded (kid using the fast-path after the first prime).
function DevHubPrime({ variant = 'forest' }) {
  const { state, actions } = useTask();
  React.useEffect(() => {
    if (!state || !actions) return;
    if (!state.onboardingDone) {
      actions.completeOnboarding({
        companionVariant: variant,
        heroName: 'Dev',
        heroGender: 'boy',
      });
    }
    if (!state.kidIntroSeen || !state.parentHandoffBackSeen) {
      actions.patchState?.({
        kidIntroSeen: true,
        parentHandoffBackSeen: true,
      });
    }
    // Dev-only pendingRitual priming — useful for testing the Feuer tab
    // without grinding to the milestone threshold. Usage:
    //   ?devHub=1&pendingRitual=sparkle
    //   ?devHub=1&pendingRitual=heart
    //   ?devHub=1&pendingRitual=ember
    //   ?devHub=1&pendingRitual=rainbow
    const p = new URLSearchParams(window.location.search);
    const pendingFlag = p.get('pendingRitual');
    const validFlavors = ['sparkle', 'heart', 'ember', 'rainbow'];
    if (pendingFlag && validFlavors.includes(pendingFlag) && state.pendingRitual !== pendingFlag) {
      actions.patchState?.({ pendingRitual: pendingFlag });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.onboardingDone, state?.kidIntroSeen, state?.parentHandoffBackSeen, state?.pendingRitual]);
  return null;
}

// ParentFirstPreview deleted Apr 26 2026 in the onboarding-trim.
// The lean chain (OnboardingChain) is reachable via ?onboardingPreview=1
// and previews itself via the previewLoop branch.

export default function App() {
  return (
    <ErrorBoundary>
      <AlphaBanner />
      <SWUpdateBanner />
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ErrorBoundary>
  );
}
