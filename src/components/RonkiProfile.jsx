import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTask } from '../context/TaskContext';
import { useHaptic } from '../hooks/useHaptic';
import { useTranslation } from '../i18n/LanguageContext';
import { getCatStage, getDragonArt } from '../utils/helpers';
import { CAT_STAGES } from '../constants';
import { findArc } from '../arcs/arcs';
import { SEED_BY_ID, SEED_CREATURES } from '../data/creatures';
import { isDevMode } from '../utils/mode';
import { getVariant } from '../data/companionVariants';
import SFX from '../utils/sfx';
import { useGameAccess } from '../hooks/useGameAccess';
import MoodChibi, { RonkiArt } from './MoodChibi';
import { PaperCard, DoodleIcon, ChoiceTile, SpeechBubble, MotionTicks } from './bilderbuch';
import ChibiFriend, { hasChibiFriend } from './drachennest/ChibiFriend';
// RealFriends deleted Apr 2026 (cut #10c). Three-emoji-code social
// layer was unreachable for a 6yo; the Pilzhüter / 7-friends arc
// (creatures Ronki meets on adventures) survives in ForscherEcke
// and is the canonical "friends" surface now.
import FireBreathCollection from './FireBreathCollection';

/**
 * RonkiProfile: Ronki's page (Bilderbuch pass, 25 Sep 2026).
 *
 * White ground. At the top the mood window: Ronki on the sky-wash
 * circle (MoodChibi, animated idle when calm) with motion ticks, a
 * speech bubble for his quip, then one headline about his mood.
 * Attached below it the "Mein Drache" drawer (Über, Details, Stärken
 * with the growth tree), then the Freunde / Feuer switch.
 *
 * Every card is an ink-outlined PaperCard, every icon a DoodleIcon,
 * every Ronki from MoodChibi or RonkiArt. State, storage, timers and
 * the segment rules are unchanged from Profile Polish v2.
 */

// Six names for the six CAT_STAGES (the old list had five, so stage 4
// read Legendär and stage 5 was blank).
const STAGE_NAMES_DE = ['Ei', 'Baby', 'Jungtier', 'Stolz', 'Heranwachsend', 'Legendär'];
const STAGE_NAMES_EN = ['Egg', 'Baby', 'Juvenile', 'Proud', 'Growing', 'Legendary'];

// Stage art for the growth tree: one drawn Ronki per CAT_STAGES entry
// (Ei, Baby, Jungtier, Stolz, Heranwachsend, Legendär).
const STAGE_ART = ['egg-cream', 'baby', 'calm', 'proud', 'grown', 'legendary'];

// Fun facts about Ronki, data from the old CompanionProfile
const FACTS = {
  species: { de: 'Rồng (Drache)', en: 'Rồng (Dragon)' },
  likes: { de: 'Feuer, Flüge, Abenteuer', en: 'Fire, flights, adventures' },
  dislikes: { de: 'Kälte, Langeweile', en: 'Cold weather, boredom' },
  talent: { de: 'Kann kleine Flammen pusten', en: 'Can blow tiny flames' },
  motto: { de: 'Mut ist stärker als Feuer!', en: 'Courage is stronger than fire!' },
  heights: ['20 cm', '45 cm', '80 cm', '1.2 m', '2 m'],
  weights: ['1 kg', '5 kg', '15 kg', '40 kg', '100 kg'],
};

// Trait seeds: Phase 2 will earn these from arcs. For now, derive from milestones.
// Labels kept to first-grade-readable German (per Marc: "wesenszüge und sanftmütig
// are not really words that kids know"). "Stärken" replaces the "Wesenszüge" frame.
// `score` is a progress-bar heuristic (0-100) based on live state so the strengths
// tab feels responsive without waiting on Phase 2 arc grants.
const TRAIT_POOL = [
  { id: 'brave',    label: { de: 'Mutig',      en: 'Brave' },    icon: 'shield',        color: '#f59e0b', when: (s) => (s.arcEngine?.completedArcIds?.length || 0) >= 1, score: (s) => clamp(40 + (s.arcEngine?.completedArcIds?.length || 0) * 15) },
  { id: 'gentle',   label: { de: 'Lieb',       en: 'Kind' },     icon: 'favorite',      color: '#f472b6', when: (s) => (s.catEvo || 0) >= 3,                                score: (s) => clamp(30 + (s.catEvo || 0) * 10) },
  { id: 'curious',  label: { de: 'Neugierig',  en: 'Curious' },  icon: 'explore',       color: '#0ea5e9', when: (s) => true,                                                score: (s) => clamp(55 + (s.micropediaDiscovered?.length || 0) * 6) },
  { id: 'loyal',    label: { de: 'Treu',       en: 'Loyal' },    icon: 'handshake',     color: '#34d399', when: (s) => (s.totalTaskDays || 0) >= 3,                         score: (s) => clamp(35 + (s.totalTaskDays || 0) * 4) },
  { id: 'dreamer',  label: { de: 'Träumer',    en: 'Dreamer' },  icon: 'auto_awesome',  color: '#a855f7', when: (s) => (s.journalHistory?.length || 0) >= 3,                score: (s) => clamp(35 + (s.journalHistory?.length || 0) * 8) },
  { id: 'mapmaker', label: { de: 'Entdecker',  en: 'Explorer' }, icon: 'map',           color: '#fb923c', when: (s) => (s.arcEngine?.completedArcIds || []).includes('first-adventure'), score: (s) => (s.arcEngine?.completedArcIds || []).includes('first-adventure') ? 90 : 40 },
];

function clamp(n) { return Math.max(20, Math.min(100, Math.round(n))); }

const base = import.meta.env.BASE_URL;

// ── Mood-description copy ──
// Shown under the mood window on every day. Day count ("Heute · 3
// Tage") + mood headline + short body. On bad days the body nudges
// toward the gentle reactions.

const MOOD_CARD_COPY = {
  normal: {
    title: { de: 'Ronki ist gut drauf.', en: 'Ronki is doing well.' },
    body:  { de: 'Ein normaler Tag zusammen. Alles gut.', en: 'A normal day together. All good.' },
  },
  sad: {
    title: { de: 'Ronki ist heute traurig.', en: 'Ronki is sad today.' },
    body:  { de: 'Manchmal passiert das einfach. Was könnte Ronki helfen?', en: 'It just happens sometimes. What could help Ronki?' },
  },
  tired: {
    title: { de: 'Ronki ist heute müde.', en: 'Ronki is tired today.' },
    body:  { de: 'Leise Tage sind auch wichtig. Was tut ihm gut?', en: 'Quiet days matter too. What would feel good?' },
  },
};

// Profile-card quips: Ronki occasionally says something first-person
// in the speech bubble (tap the chibi to hear another line). Per Marc's
// Begleiter Polish ask 24 Apr 2026: "text things he says randomly."
// Pool per mood so a sad Ronki doesn't say chirpy lines.
const PROFILE_QUIPS = {
  normal: [
    'Die Sonne mag mich.',
    'Mein Lieblingsstein hat einen Namen.',
    'Ich könnte ewig hier sitzen.',
    'Riech mal. Das ist Abenteuer.',
    'Du siehst wach aus.',
    'Erzähl mir was Neues.',
  ],
  sad: [
    'Ich bin heute leise.',
    'Bleib einfach kurz bei mir.',
    'Mein Herz ist schwer.',
    'Du musst nichts sagen.',
  ],
  tired: [
    'Mhhh, ich blinzel nur kurz.',
    'Meine Augen sind schwer.',
    'Nach dem Schläfchen spielen wir.',
    'Kuscheln ist auch Abenteuer.',
  ],
};

function pickProfileQuip(mood, rollKey) {
  const pool = PROFILE_QUIPS[mood] || PROFILE_QUIPS.normal;
  const dayIdx = Math.floor(Date.now() / 86_400_000);
  const idx = Math.abs((dayIdx + rollKey * 2654435761) % pool.length);
  return pool[idx];
}

// ── Bonding Agent ──
// Sad-day reaction cards. Returned as a plain array so the component
// stays simple. If Louis has taught Ronki a skill (e.g. Box-Atmung), a
// 4th card appears letting Ronki offer it back: the Rollentausch
// moment the Feature Previews spec calls "the deepest bonding move of
// all engagement reports". `doodle` is the drawn symbol in the bubble.
function SAD_REACTIONS(lang, hasLearnedBox) {
  const base = [
    {
      id: 'kuscheln',
      doodle: 'heart',
      title: lang === 'de' ? 'Kuscheln' : 'Cuddle',
      sub: lang === 'de' ? 'Leise neben ihm sitzen · nichts müssen' : 'Sit beside him · no pressure',
    },
    {
      id: 'stille',
      doodle: 'leaf',
      title: lang === 'de' ? 'Still zusammen sitzen' : 'Sit in silence',
      sub: lang === 'de' ? 'Einfach da sein · 3 Min Stille' : 'Just be there · 3 min silence',
    },
    {
      id: 'tee',
      doodle: 'drop',
      title: lang === 'de' ? 'Warmen Tee kochen' : 'Make warm tea',
      sub: lang === 'de' ? 'Für Ronki und dich · kleine Geste' : 'For Ronki and you · small gesture',
    },
  ];
  if (hasLearnedBox) {
    base.push({
      id: 'atmen',
      doodle: 'cloud',
      title: lang === 'de' ? 'Atmen mit Ronki' : 'Breathe with Ronki',
      sub: lang === 'de' ? 'Box-Atmung · die er von dir gelernt hat' : 'Box breathing · the skill he learned from you',
    });
  }
  return base;
}

// Section kicker: a sun sticker in the hand-lettered note voice, set
// slightly crooked like it was stuck on by hand.
function Kicker({ children }) {
  return (
    <p style={{ margin: '0 0 12px 4px' }}>
      <span
        className="bb-hand inline-block rounded-[10px] bg-sun px-3 py-1.5 text-lg uppercase leading-none text-ink"
        style={{ transform: 'rotate(-2deg)' }}
      >
        {children}
      </span>
    </p>
  );
}

// The short hand-drawn dash under an active tab (same stroke as the
// NavBar's active tab).
function DrawnDash({ visible }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 40 8"
      width="28"
      height="6"
      style={{ overflow: 'visible', opacity: visible ? 1 : 0, transition: 'opacity 0.2s' }}
    >
      <path d="M3 5 C 12 2.5 24 6 37 3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// A flat drawn meter: ink outline, paper track, one colour fill. No
// gradient, no glow.
function Meter({ pct, fill = 'var(--color-sun)', height = 12 }) {
  return (
    <div
      style={{
        height, borderRadius: 999, overflow: 'hidden',
        border: '2px solid var(--color-ink)', background: 'var(--color-paper)',
      }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%',
          background: fill, borderRight: pct > 0 && pct < 100 ? '2px solid var(--color-ink)' : 'none',
          transition: 'width .7s ease',
        }}
      />
    </div>
  );
}

export default function RonkiProfile({ onNavigate }) {
  const { t, lang } = useTranslation();
  const { state, actions } = useTask();
  const haptic = useHaptic();
  const { unlocked: gamesUnlocked } = useGameAccess();
  const [tab, setTab] = useState('about');
  // Finch-style drawer (Marc 23 Apr 2026): the Mein Drache tab block
  // is a collapsible card. Tapping the currently-selected tab toggles
  // the drawer open/closed; tapping a different tab switches content
  // AND opens the drawer. Default: closed, so the profile starts tidy
  // and Louis reaches for info when he wants it.
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Profile-card quip (Marc 24 Apr Begleiter Polish ask). Starts hidden
  // on mount; auto-appears after ~900 ms so the mood card has a moment
  // to settle first. Tap the chibi to roll a new line + reset the
  // auto-fade. Goes away after ~7 s.
  const [quipRollKey, setQuipRollKey] = useState(0);
  const [quipVisible, setQuipVisible] = useState(false);
  const quipTimerRef = useRef(null);
  const onDrawerTab = (id) => {
    if (id === tab) {
      setDrawerOpen(v => !v);
    } else {
      setTab(id);
      setDrawerOpen(true);
    }
  };
  // Top segmented control: 4 destinations inside the Ronki world.
  // Pflege is the landing (mood portrait + today's care); Freunde /
  // Spiele / Erinnerungen are first-class siblings instead of drill-ins.
  // Bottom app-nav stays the single "home": switching segments doesn't
  // replace the main tab bar (Marc: "kids get confused by two nav bars").
  // Default segment 'freunde' since the 'pflege' tab moved to the
  // Drachennest care row 25 Apr 2026.
  const [segment, setSegment] = useState('freunde');
  const [thankYou, setThankYou] = useState(null); // thank-you bubble after a reaction choice
  const dev = isDevMode();

  // Bonding Agent sync: run once per mount. Expires yesterday's bad
  // mood and fires a new scheduled bad day if due. Idempotent per-day.
  useEffect(() => {
    actions.syncRonkiMood?.();
    // Dev shortcut: allow ?ronkiMood=sad|tired|normal in the URL so
    // parents (and Marc during testing) can force a mood without
    // pasting into the console: Chrome blocks that on first paste.
    // Also accepts ?boxAtmung=learned and ?boxAtmung=N to seed the
    // practice counter for quick verification of the teaching flow.
    const params = new URLSearchParams(window.location.search);
    const mood = params.get('ronkiMood');
    const boxParam = params.get('boxAtmung');
    const patch = {};
    if (mood === 'sad' || mood === 'tired' || mood === 'normal' || mood === 'besorgt' || mood === 'gut' || mood === 'magisch') {
      patch.ronkiMood = mood;
      patch.ronkiMoodSetDate = mood === 'normal' ? undefined : new Date().toISOString().slice(0, 10);
    }
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
    // ?variant=amber|teal|rose|violet|forest|sunset: preview each
    // colorway. ?stage=0..3: preview evolution stage. Both apply to
    // the profile mood chibi + the Begleiter icon; persist into state
    // so Louis sees the chosen combo until reset.
    const variantParam = params.get('variant');
    if (/^(amber|teal|rose|violet|forest|sunset)$/.test(variantParam || '')) {
      patch.companionVariant = variantParam;
    }
    const stageParam = params.get('stage');
    if (stageParam && /^[0-5]$/.test(stageParam)) {
      // Thresholds from constants.ts CAT_STAGES: 0 Ei, 1 Baby, 2 Jungtier,
      // 3 Stolz, 4 Heranwachsend (Teen), 5 Legendär.
      patch.catEvo = [0, 3, 9, 18, 30, 45][parseInt(stageParam, 10)];
    }
    if (Object.keys(patch).length > 0) actions.patchState?.(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Care action wrapper: plays pop, triggers haptic, runs the action.
  // Pulled up from Sanctuary so Louis can Füttern/Streicheln/Spielen
  // without a separate Pflege tab (nav merged April 2026).
  const handleCare = (action, alreadyDone) => {
    if (alreadyDone) return;
    SFX.play('pop');
    haptic('success');
    action();
  };

  // Gentle reaction on a bad-Ronki day. All choices are "right": no
  // XP, no winner. Writes a journal memory via TaskContext + shows a
  // brief thank-you bubble, then reverts to normal mood.
  const handleSadReaction = (reactionId) => {
    SFX.play('pop');
    // 'select': kid picks a comfort gesture, mirrors mood/variant-pick
    // category. Intentionally softer than a care-success since the ritual
    // is gentle-empathy, not a transaction.
    haptic('select');
    actions.pickRonkiSadReaction?.(reactionId);
    const kidName = (state?.familyConfig?.childName || '').trim();
    const thanks = lang === 'de'
      ? (kidName ? `Danke, ${kidName}.` : 'Danke.')
      : (kidName ? `Thank you, ${kidName}.` : 'Thank you.');
    setThankYou(thanks);
    setTimeout(() => setThankYou(t => (t === thanks ? null : t)), 3000);
  };

  // Profile quip: show a Ronki-says bubble on mount after a short
  // delay, auto-fade at ~7s. Tapping the chibi rolls a new line +
  // resets the timer. Timer cleaned up on unmount.
  useEffect(() => {
    const showAfter = setTimeout(() => setQuipVisible(true), 900);
    const hideAfter = setTimeout(() => setQuipVisible(false), 7900);
    return () => { clearTimeout(showAfter); clearTimeout(hideAfter); };
    // Re-fires when the roll key changes so tapping resets the fade.
  }, [quipRollKey]);
  useEffect(() => () => {
    if (quipTimerRef.current) clearTimeout(quipTimerRef.current);
  }, []);
  const handleChibiTap = () => {
    SFX.play('tap');
    // 'tap': chibi-tap rolls a new quip, UI-nav feel, not a commit.
    haptic('tap');
    setQuipRollKey(k => k + 1);
    setQuipVisible(true);
  };

  if (!state) return null;

  const evo = state.catEvo || 0;
  const stage = getCatStage(evo);
  const artFile = getDragonArt(stage);
  const stageName = (lang === 'en' ? STAGE_NAMES_EN : STAGE_NAMES_DE)[stage];
  const daysTogether = state.totalTaskDays || 0;
  const heroName = (state.familyConfig?.childName || '').trim();
  const heroDisplay = heroName || (lang === 'de' ? 'dein Held' : 'your hero');
  // Freund arcs don't count as "complete" until the delayed callback (beat 4)
  // has fired. Until then, they live in engine.completedArcIds but not in
  // freundArcsCompleted: so we filter them out here to avoid spoiling the
  // delayed-return moment in the profile.
  const freundArcsDone = state.freundArcsCompleted || [];
  const completedArcs = (state.arcEngine?.completedArcIds || []).filter(arcId => {
    const arc = findArc(arcId);
    if (arc?.freundId) return freundArcsDone.includes(arcId);
    return true;
  });
  const stateTraits = state.earnedTraits || [];
  // Combine: traits granted by arcs (state) + milestone-inferred (legacy visual feedback)
  const earnedTraits = TRAIT_POOL.filter(tr => stateTraits.includes(tr.id) || tr.when(state));

  // Next evo threshold
  const THRESHOLDS = [0, 3, 9, 18, 30];
  const nextThreshold = THRESHOLDS[stage + 1];
  const evoPct = nextThreshold ? Math.min(100, ((evo - THRESHOLDS[stage]) / (nextThreshold - THRESHOLDS[stage])) * 100) : 100;

  // Freunde preview: last 4 discoveries, enriched from seeds.
  // Denominator = SEED_CREATURES.length (what Louis can actually find today),
  // not the 60-slot grid ceiling which is aspirational.
  const { recentFreunde, totalFound, totalCreatures } = useMemo(() => {
    const raw = state.micropediaDiscovered || [];
    const sorted = [...raw]
      .sort((a, b) => {
        const ta = a.discoveredAt ? new Date(a.discoveredAt).getTime() : 0;
        const tb = b.discoveredAt ? new Date(b.discoveredAt).getTime() : 0;
        return tb - ta;
      });
    const recent = sorted
      .slice(0, 4)
      .map(d => SEED_BY_ID.get(d.id))
      .filter(Boolean);
    return { recentFreunde: recent, totalFound: raw.length, totalCreatures: SEED_CREATURES.length };
  }, [state.micropediaDiscovered]);

  // Rarity label under Ronki (stage · rarity). Stage name in dev mode,
  // variant name in public mode: same identity rule as before.
  const rarityLabel = dev
    ? stageName
    : (state.companionVariant
      ? (getVariant(state.companionVariant).name[lang] || getVariant(state.companionVariant).name.de)
      : stageName);
  const rarityRare = lang === 'de' ? 'Rar' : 'Rare';

  // ── Bonding Agent ──
  // Ronki's mood drives portrait + Pflege action set. On a bad day
  // ('sad' / 'tired'), the mood-portrait takes on a tinted circle with
  // rain or z particles; the Pflege card replaces Füttern/Streicheln/
  // Spielen with three gentle reactions. Louis's mood (moodAM/moodPM)
  // is untouched: this is Ronki's state, not Louis's.
  const ronkiMood = state.ronkiMood || 'normal';
  const isBadDay = ronkiMood === 'sad' || ronkiMood === 'tired';
  const practiceCount = state.ronkiSkillPractice?.boxAtmung || 0;
  const hasLearnedBox = (state.ronkiLearnedSkills || []).includes('boxAtmung');
  const showLearnBanner = hasLearnedBox && !(state.ronkiLearnBannerSeen || {}).boxAtmung;

  // What the mood window shows. 'besorgt' is set when the kid has not
  // been around for two days; per the Bilderbuch motion guardrails
  // Ronki is never shown worried or sad because something was skipped,
  // so that mood draws as calm here (state is untouched).
  const heroMood = ronkiMood === 'besorgt' ? 'normal' : ronkiMood;
  const moodCopy = MOOD_CARD_COPY[ronkiMood] || MOOD_CARD_COPY.normal;
  const quiet = ronkiMood === 'sad' || ronkiMood === 'tired';

  return (
    <div className="relative min-h-dvh pb-32 bg-white">
      <main className="max-w-lg mx-auto"
            style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', paddingLeft: 0, paddingRight: 0 }}>

        <div className="px-4">

          {/* ═══ MOOD WINDOW: top of the profile.
               Ronki on the sky-wash circle (MoodChibi in its ringed
               mode, animated idle loop when calm), motion ticks beside
               his head, his quip in a speech bubble above. Tap him for
               another line (Marc 24 Apr Begleiter Polish). ═══ */}
          <section className="relative flex flex-col items-center text-center">
            {/* Quip slot: fixed height so Ronki does not jump when the
                 bubble fades in and out. */}
            <div
              aria-live="polite"
              className="flex items-end justify-center"
              style={{ minHeight: 84, width: '100%', position: 'relative', zIndex: 3 }}
            >
              <div
                style={{
                  transform: `translateY(${quipVisible ? 0 : 6}px) scale(${quipVisible ? 1 : 0.94})`,
                  opacity: quipVisible ? 1 : 0,
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                  pointerEvents: 'none',
                  maxWidth: 300,
                }}
              >
                <SpeechBubble side="bottom" tone="white">
                  {pickProfileQuip(ronkiMood, quipRollKey)}
                </SpeechBubble>
              </div>
            </div>

            <div className="relative" style={{ width: 220, height: 220, marginTop: 26 }}>
              <button
                onClick={handleChibiTap}
                aria-label={lang === 'de' ? 'Ronki antippen' : 'Tap Ronki'}
                className="block rounded-full"
                style={{ background: 'transparent', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
              >
                <MoodChibi size={220} mood={heroMood} animated
                           variant={state.companionVariant}
                           stage={Math.min(3, stage)} />
              </button>
              {!quiet && (
                <MotionTicks tone="cobalt" size={34} rotate={-40}
                             style={{ position: 'absolute', right: -22, top: 22, pointerEvents: 'none' }} />
              )}
              {!quiet && (
                <MotionTicks tone="cobalt" size={30} rotate={-140}
                             style={{ position: 'absolute', left: -20, top: 34, pointerEvents: 'none' }} />
              )}
              {/* Tired days: two slow z's drift up beside his head. */}
              {ronkiMood === 'tired' && (
                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {[
                    { right: -6, top: '26%', delay: '0s', size: 24 },
                    { right: -22, top: '12%', delay: '1.8s', size: 30 },
                  ].map((z, i) => (
                    <span key={i} className="bb-display text-cobalt" style={{
                      position: 'absolute', right: z.right, top: z.top,
                      fontSize: z.size,
                      animation: `rp-card-zzz 3.6s ease-out ${z.delay} infinite`,
                    }}>z</span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, maxWidth: 340 }}>
              <span
                className="bb-hand inline-block rounded-[10px] bg-sun px-3 py-1.5 text-lg uppercase leading-none text-ink"
                style={{ transform: 'rotate(-2deg)' }}
              >
                {daysTogether > 0
                  ? `${lang === 'de' ? 'Heute' : 'Today'} · ${daysTogether} ${daysTogether === 1 ? (lang === 'de' ? 'Tag' : 'day') : (lang === 'de' ? 'Tage' : 'days')}`
                  : (lang === 'de' ? 'Heute' : 'Today')}
              </span>
              {/* Stage label: quiet second line under the kicker.
                  "Baby · Stufe 1" shape. Per Marc 24 Apr 2026
                  Begleiter Polish list. */}
              <p className="font-headline font-semibold text-ink-soft"
                 style={{ fontSize: 16, lineHeight: 1.2, margin: '12px 0 6px 0' }}>
                {stageName} · {lang === 'de' ? 'Stufe' : 'Stage'} {stage}
              </p>
              <h1 className="bb-display text-ink" style={{ fontSize: 30, margin: '0 0 8px 0' }}>
                {moodCopy.title[lang] || MOOD_CARD_COPY.normal.title[lang] || MOOD_CARD_COPY.normal.title.de}
              </h1>
              <p className="font-body text-ink-soft"
                 style={{ fontSize: 17, lineHeight: 1.45, margin: 0, textWrap: 'pretty' }}>
                {moodCopy.body[lang] || MOOD_CARD_COPY.normal.body[lang] || MOOD_CARD_COPY.normal.body.de}
              </p>
            </div>
          </section>

          {/* ═══ MEIN DRACHE DRAWER: Finch-style collapsible card.
               One paper card holds the three tab buttons + the content
               below; tapping the active tab closes the drawer, tapping
               a different tab opens with content swap. Content area
               uses grid-template-rows 0fr to 1fr for a smooth auto-height
               expand that doesn't require JS-measured max-heights. ═══ */}
          <PaperCard pad="none" className="mt-7 mb-4 overflow-hidden">

            {/* Tab row: lives inside the same card as the content */}
            <div className="flex" style={{ padding: '6px 6px 0' }}>
              {[
                { id: 'about', label: lang === 'de' ? 'Über' : 'About', icon: 'dragon' },
                { id: 'details', label: 'Details', icon: 'star' },
                { id: 'traits', label: lang === 'de' ? 'Stärken' : 'Strengths', icon: 'bolt' },
              ].map(tb => {
                const active = tab === tb.id;
                const openAndActive = active && drawerOpen;
                return (
                  <button key={tb.id}
                    onClick={() => onDrawerTab(tb.id)}
                    aria-expanded={openAndActive}
                    className="flex-1 flex flex-col items-center justify-center font-headline font-semibold"
                    style={{
                      padding: '10px 2px 4px',
                      minHeight: 60,
                      gap: 3,
                      color: openAndActive ? 'var(--color-cobalt)' : 'var(--color-ink)',
                      opacity: openAndActive || active ? 1 : 0.78,
                      fontSize: 16,
                      lineHeight: 1,
                    }}>
                    <span className="flex items-center gap-1.5">
                      <DoodleIcon name={tb.icon} size={20} stroke={openAndActive ? 6 : 5} />
                      {tb.label}
                      <DoodleIcon name="arrow" size={12} stroke={8}
                                  style={{
                                    transform: openAndActive ? 'rotate(-90deg)' : 'rotate(90deg)',
                                    transition: 'transform 0.25s ease',
                                    opacity: active ? 0.9 : 0.45,
                                  }} />
                    </span>
                    <DrawnDash visible={openAndActive} />
                  </button>
                );
              })}
            </div>

            {/* Content area: grid-template-rows trick for smooth
                 height animation without measuring DOM. When closed,
                 `0fr` collapses to zero; when open, `1fr` expands to
                 natural content height. The inner `min-height: 0`
                 prevents the child from fighting the collapse. */}
            <div style={{
              display: 'grid',
              gridTemplateRows: drawerOpen ? '1fr' : '0fr',
              transition: 'grid-template-rows 0.32s ease, padding 0.32s ease',
              padding: drawerOpen ? '10px 16px 18px' : '0 16px',
              borderTop: drawerOpen ? '2px solid var(--color-ink)' : '2px solid transparent',
            }}>
              <div style={{ overflow: 'hidden', minHeight: 0 }}>

          {/* About tab */}
          {tab === 'about' && (
            <div className="flex flex-col gap-4" style={{ paddingTop: 6 }}>
              <p className="font-body text-ink" style={{
                margin: 0,
                padding: '4px 2px 0',
                fontSize: 17,
                lineHeight: 1.5,
                textWrap: 'pretty',
              }}>
                {completedArcs.length > 0
                  ? (lang === 'de'
                    ? `Ronki schlüpfte am Tag, als ${heroDisplay} sein erstes Abenteuer begann. Seitdem haben die beiden ${completedArcs.length} Abenteuer bestanden und ${daysTogether} Tage Seite an Seite verbracht. ${FACTS.motto.de}`
                    : `Ronki hatched on the day ${heroDisplay} started their first adventure. Since then, they've survived ${completedArcs.length} adventure${completedArcs.length !== 1 ? 's' : ''} and spent ${daysTogether} days side by side. ${FACTS.motto.en}`)
                  : (lang === 'de'
                    ? `Ronki ist gerade erst geschlüpft und wartet auf das erste gemeinsame Abenteuer mit ${heroDisplay}. ${FACTS.motto.de}`
                    : `Ronki just hatched and is waiting for their first adventure with ${heroDisplay}. ${FACTS.motto.en}`)
                }
              </p>
              {/* Über fact cards: doodle + label on top, the value in
                   bold below. Paper tiles with a thin ink line. */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: lang === 'de' ? 'Spezies' : 'Species', value: FACTS.species[lang] || FACTS.species.de, icon: 'dragon', tint: 'var(--color-ember)' },
                  { label: lang === 'de' ? 'Größe'   : 'Height',  value: FACTS.heights[stage],                    icon: 'arrow',  tint: 'var(--color-cobalt)', turn: -90 },
                  { label: lang === 'de' ? 'Mag'     : 'Likes',   value: FACTS.likes[lang] || FACTS.likes.de,     icon: 'heart',  tint: 'var(--color-ember)' },
                  { label: lang === 'de' ? 'Talent'  : 'Talent',  value: FACTS.talent[lang] || FACTS.talent.de,   icon: 'flame',  tint: 'var(--color-ember)' },
                ].map((fact, i) => (
                  <div key={i} className="rounded-[20px] border-2 border-ink bg-paper"
                       style={{ padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="flex items-center gap-2">
                      <span style={{ color: fact.tint, lineHeight: 0 }}>
                        <DoodleIcon name={fact.icon} size={24} style={fact.turn ? { transform: `rotate(${fact.turn}deg)` } : undefined} />
                      </span>
                      <span className="font-headline font-semibold text-ink-soft" style={{ fontSize: 16, lineHeight: 1 }}>
                        {fact.label}
                      </span>
                    </div>
                    <p className="font-headline font-bold text-ink" style={{ margin: 0, fontSize: 17, lineHeight: 1.25 }}>
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details tab */}
          {tab === 'details' && (
            <div className="flex flex-col gap-4 mb-2" style={{ paddingTop: 6 }}>
              {dev && (
                <div className="rounded-[20px] border-2 border-ink bg-paper p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-ink">
                      <DoodleIcon name="sparkle" size={22} />
                      <span className="font-headline font-semibold" style={{ fontSize: 16 }}>
                        {lang === 'de' ? 'Entwicklung' : 'Evolution'}
                      </span>
                    </div>
                    <span className="font-headline font-bold text-cobalt" style={{ fontSize: 16 }}>{stageName}</span>
                  </div>
                  <div className="mb-2">
                    <Meter pct={evoPct} fill="var(--color-cobalt)" />
                  </div>
                  <p className="font-body text-ink-soft" style={{ fontSize: 16, margin: 0 }}>
                    {nextThreshold
                      ? `${evo} / ${nextThreshold} ${lang === 'de' ? 'Pflege-Punkte' : 'care points'}`
                      : (lang === 'de' ? 'Maximale Entwicklung erreicht!' : 'Max evolution reached!')}
                  </p>
                  {nextThreshold && (
                    <p className="font-body text-cobalt" style={{ fontSize: 16, margin: '4px 0 0' }}>
                      {lang === 'de'
                        ? `Noch ${nextThreshold - evo} bis ${(lang === 'en' ? STAGE_NAMES_EN : STAGE_NAMES_DE)[stage + 1]}`
                        : `${nextThreshold - evo} more to ${STAGE_NAMES_EN[stage + 1]}`}
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: lang === 'de' ? 'Tage zusammen' : 'Days together', value: daysTogether, icon: 'sun', tint: 'var(--color-sun-deep)' },
                  { label: lang === 'de' ? 'Sterne' : 'Stars', value: state.hp || 0, icon: 'star', tint: 'var(--color-sun-deep)', filled: true },
                  { label: lang === 'de' ? 'Abenteuer' : 'Adventures', value: completedArcs.length, icon: 'book', tint: 'var(--color-cobalt)' },
                ].map((stat, i) => (
                  <div key={i} className="rounded-[20px] border-2 border-ink bg-paper text-center"
                       style={{ padding: '12px 6px 12px' }}>
                    <span className="block" style={{ color: stat.tint, lineHeight: 0 }}>
                      <DoodleIcon name={stat.icon} size={26} filled={stat.filled} />
                    </span>
                    <p className="bb-display text-ink" style={{ fontSize: 28, margin: '6px 0 4px' }}>{stat.value}</p>
                    <p className="font-headline font-semibold text-ink-soft" style={{ fontSize: 16, lineHeight: 1.1, margin: 0 }}>{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-[20px] border-2 border-ink bg-paper p-3 text-center">
                  <span className="font-headline font-semibold text-ink-soft block mb-1" style={{ fontSize: 16 }}>
                    {lang === 'de' ? 'Gewicht' : 'Weight'}
                  </span>
                  <span className="bb-display text-ink" style={{ fontSize: 24 }}>{FACTS.weights[stage]}</span>
                </div>
                <div className="rounded-[20px] border-2 border-ink bg-paper p-3 text-center">
                  <span className="font-headline font-semibold text-ink-soft block mb-1" style={{ fontSize: 16 }}>
                    {lang === 'de' ? 'Größe' : 'Height'}
                  </span>
                  <span className="bb-display text-ink" style={{ fontSize: 24 }}>{FACTS.heights[stage]}</span>
                </div>
              </div>
            </div>
          )}

          {/* Traits tab */}
          {tab === 'traits' && (
            <div className="flex flex-col gap-4 mb-2" style={{ paddingTop: 6 }}>
              <div className="rounded-[20px] border-2 border-ink bg-paper p-4">
                <div className="flex items-center gap-2 mb-4 text-ink">
                  <DoodleIcon name="bolt" size={22} />
                  <span className="font-headline font-semibold" style={{ fontSize: 17 }}>
                    {lang === 'de' ? 'Ronkis Wesen' : "Ronki's Traits"}
                  </span>
                </div>
                <div className="flex flex-col gap-3" style={{ padding: '2px 2px 0' }}>
                  {earnedTraits.map(tr => {
                    const score = tr.score(state);
                    return (
                      <div key={tr.id}
                           className="grid items-center"
                           style={{ gridTemplateColumns: '92px 1fr 34px', gap: 10 }}>
                        <b className="font-headline font-semibold text-ink" style={{ fontSize: 16, lineHeight: 1 }}>
                          {tr.label[lang] || tr.label.de}
                        </b>
                        <Meter pct={score} />
                        <span className="font-headline font-bold text-ink" style={{ fontSize: 16, lineHeight: 1, textAlign: 'right' }}>
                          {score}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="font-body text-ink-soft" style={{ fontSize: 16, lineHeight: 1.45, margin: '16px 0 0' }}>
                  {lang === 'de'
                    ? 'Ronki wird bei jedem Abenteuer stärker.'
                    : 'Ronki grows stronger with every adventure.'}
                </p>
              </div>
              {/* Evolution tree (Marc 25 Apr 2026): vertical timeline
                  with the drawn Ronki of every stage, the current stage
                  ringed, past stages showing the rolled trait, future
                  stages faded with the unlock hint pulled from
                  CAT_STAGES thresholds. */}
              <EvolutionTree state={state} lang={lang} />
            </div>
          )}

              </div>
            </div>
          </PaperCard>
          {/* ═══ END MEIN DRACHE DRAWER ═══ */}

          {/* ═══ SEGMENTED CONTROL: destinations inside the Ronki world.
               Sits BELOW the profile + identity unit. Bottom app-nav
               stays the single way home so kids don't get two competing
               nav bars (Marc call 21 Apr 2026). ═══ */}
          <div className="flex gap-3 mb-5 mt-5">
            {[
              // 'pflege' segment removed 25 Apr 2026 (Marc: "we have
              // a duplicate, the one appears in the Nest the other at
              // the Ronki view, I'd probably get rid of it"). The
              // Drachennest's care row is now the single home for
              // Füttern / Streicheln / Spielen so the kid only ever
              // sees that interaction in one place. The Pflege block
              // below stays in source for now (keeps its bad-day
              // gentle-reaction code paths reachable from future
              // surfaces) but no segment tab routes here.
              { id: 'freunde',      label: lang === 'de' ? 'Freunde'      : 'Friends',  icon: 'paw' },
              // Feuer replaced Spiele 24 Apr 2026 (Marc): the mini-games
              // pass-through moved to the main NavBar, and this slot now
              // shows the kid's fire-breath collection + pending-ritual
              // handoff. Shows a dot when pendingRitual is set so the
              // kid sees something new in their profile.
              { id: 'feuer',        label: lang === 'de' ? 'Feuer'        : 'Fire',     icon: 'flame',
                pulse: !!state?.pendingRitual },
              // Erinnerungen segment dropped 24 Apr 2026 (Marc): memory
              // access now lives as a single "Eure Chronik" CTA inside
              // the Pflege flow that opens the Buch directly.
            ].map(s => {
              const on = segment === s.id;
              return (
                <button key={s.id}
                  onClick={() => setSegment(s.id)}
                  aria-pressed={on}
                  className={`flex-1 flex items-center justify-center gap-2 relative rounded-full font-headline font-semibold transition-colors ${on ? 'bg-sky-wash text-ink border-ink' : 'bg-white text-ink-soft border-outline-variant'}`}
                  style={{ minHeight: 52, fontSize: 17, borderWidth: 2.5, borderStyle: 'solid' }}>
                  <span style={{ color: on ? (s.id === 'feuer' ? 'var(--color-ember)' : 'var(--color-ink)') : 'currentColor', lineHeight: 0 }}>
                    <DoodleIcon name={s.icon} size={22} stroke={on ? 6 : 5} />
                  </span>
                  {s.label}
                  {/* Dot: signals "there's something waiting here",
                      e.g. a pending teach ritual on the Feuer tab. */}
                  {s.pulse && !on && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 14,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: 'var(--color-ember)',
                        border: '2px solid var(--color-ink)',
                        animation: 'rp-pulse 1.4s ease-in-out infinite',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {segment === 'pflege' && (<>
          {/* ═══ PFLEGE: mood-aware care card.
               Normal days: Füttern / Streicheln / Spielen as choice tiles.
               Bad days (ronkiMood sad/tired): gentle reactions as speech
               bubbles the kid can offer. Box-Atmung teaching block +
               Helden-Kodex follow. ═══ */}

          {isBadDay ? (
            <>
              {/* 3 (or 4) gentle reactions, no XP. */}
              <Kicker>{lang === 'de' ? 'Wähle eine sanfte Reaktion' : 'Pick a gentle response'}</Kicker>
              <section style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {SAD_REACTIONS(lang, hasLearnedBox).map((r, i) => (
                  <button key={r.id}
                    onClick={() => handleSadReaction(r.id)}
                    className="w-full text-left active:scale-[0.98] transition-transform"
                    style={{ background: 'transparent', border: 'none', padding: '0 0 22px' }}>
                    <SpeechBubble side={i % 2 ? 'right' : 'left'} tone="white" rotate={i % 2 ? 0.6 : -0.6} className="w-full">
                      <span className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-sky-wash text-ink">
                          <DoodleIcon name={r.doodle} size={24} />
                        </span>
                        <span className="min-w-0">
                          <b className="block" style={{ fontSize: 18, lineHeight: 1.2 }}>{r.title}</b>
                          <span className="block font-body font-medium text-ink-soft" style={{ fontSize: 16, lineHeight: 1.3 }}>{r.sub}</span>
                        </span>
                      </span>
                    </SpeechBubble>
                  </button>
                ))}
              </section>
            </>
          ) : (
            <>
              {/* Normal-day Pflege: three choice tiles, a doodle and one
                   word each. Done = the drawn cobalt ring and a check. */}
              <Kicker>{lang === 'de' ? 'Kümmere dich um Ronki' : 'Take care of Ronki'}</Kicker>
              <section style={{ marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { key: 'fed',    state: state.catFed,    onTap: actions.feedCompanion, icon: 'leaf',  title: t('care.feed'), color: 'var(--color-leaf-deep)' },
                  { key: 'petted', state: state.catPetted, onTap: actions.petCompanion,  icon: 'heart', title: t('care.pet'),  color: 'var(--color-ember)' },
                  { key: 'played', state: state.catPlayed, onTap: actions.playCompanion, icon: 'bolt',  title: t('care.play'), color: 'var(--color-cobalt)' },
                ].map(a => (
                  <ChoiceTile key={a.key}
                    label={a.title}
                    doodle={a.state ? 'check' : a.icon}
                    doodleColor={a.color}
                    selected={!!a.state}
                    aria-disabled={a.state ? 'true' : undefined}
                    onClick={() => handleCare(a.onTap, a.state)}
                    style={{ minWidth: 0 }}
                  />
                ))}
              </section>
            </>
          )}

          {/* ═══ BOX-ATMUNG TEACHING BLOCK ═══
               Dashed cobalt square with a traveling sun dot: the visual
               breathing rhythm (4s Einatmen / Halten / Ausatmen / Ruhen).
               Dot loops continuously so Louis can breathe along at any
               time. The actual practice count advances when Louis uses
               the exercise in Gefühlsecke (WuetendFlow). At 5 Ronki
               "learns" the skill: ronkiLearnedSkills flips, this block
               hides, and the learn banner fires. On the next bad-Ronki
               day, Ronki offers Box-Atmung back to Louis as a 4th
               reaction option. */}
          {/* Visible when Louis has already practiced at least once, OR
               when Ronki is having a bad day: surfaces the tool during
               the moment it's actually useful instead of hiding it until
               Louis stumbles into Gefühlsecke. Marc Apr 2026: "when mood=sad
               there should also be the box breathing thingy." */}
          {!hasLearnedBox && (practiceCount > 0 || ronkiMood === 'sad' || ronkiMood === 'tired') && (
            <>
              {/* Kicker personalised per child ("Louis" used to be hardcoded).
                  Fallback string drops the name cleanly if no childName is set. */}
              <Kicker>{lang === 'de'
                ? (heroName ? `${heroName} bringt Ronki bei` : 'Du bringst Ronki bei')
                : (heroName ? `${heroName} teaches Ronki` : 'You teach Ronki')}</Kicker>
              <PaperCard tone="sky-wash" className="mb-4" style={{ padding: '16px 18px 18px' }}>
                <div className="flex items-start gap-3 mb-2">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-cobalt text-white">
                    <DoodleIcon name="cloud" size={24} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <b className="font-headline font-bold text-ink block" style={{ fontSize: 19, lineHeight: 1.2 }}>
                      {lang === 'de' ? 'Box-Atmung' : 'Box breathing'}
                    </b>
                    <span className="font-body text-ink-soft" style={{ fontSize: 16, lineHeight: 1.4 }}>
                      {lang === 'de'
                        ? 'Benutze sie 5× in der Gefühlsecke. Dann lernt Ronki sie von dir.'
                        : 'Use it 5× in the Gefühlsecke. Then Ronki learns it from you.'}
                    </span>
                  </div>
                </div>

                {/* Dashed square with traveling dot: 16s loop matching
                     the 4-4-4-4 rhythm. Labels sit outside the square so
                     Ruhen / Halten don't kiss the dashed edge. */}
                <div style={{
                  position: 'relative',
                  width: 132, height: 132,
                  margin: '34px auto 40px',
                  border: '3px dashed var(--color-cobalt)',
                  borderRadius: 18,
                }}>
                  {[
                    { k: lang === 'de' ? 'Einatmen' : 'Inhale', pos: { top: -12, left: '50%', transform: 'translate(-50%, -100%)' } },
                    { k: lang === 'de' ? 'Halten' : 'Hold', pos: { top: '50%', right: -12, transform: 'translate(100%, -50%)' } },
                    { k: lang === 'de' ? 'Ausatmen' : 'Exhale', pos: { bottom: -12, left: '50%', transform: 'translate(-50%, 100%)' } },
                    { k: lang === 'de' ? 'Ruhen' : 'Rest', pos: { top: '50%', left: -12, transform: 'translate(-100%, -50%)' } },
                  ].map(l => (
                    <span key={l.k} className="font-headline font-semibold text-cobalt"
                          style={{ position: 'absolute', fontSize: 16, lineHeight: 1, whiteSpace: 'nowrap', ...l.pos }}>
                      {l.k}
                    </span>
                  ))}
                  <div aria-hidden="true" style={{
                    position: 'absolute',
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'var(--color-sun)',
                    border: '2.5px solid var(--color-ink)',
                    top: -10, left: -10,
                    animation: 'rp-box-travel 16s linear infinite',
                  }} />
                </div>

                {/* Progress row + 5 tick bars */}
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <span className="font-headline font-semibold text-ink-soft" style={{ fontSize: 16 }}>
                    {lang === 'de' ? 'Dein Fortschritt' : 'Your progress'}
                  </span>
                  <b className="font-headline font-bold text-ink" style={{ fontSize: 16 }}>
                    {practiceCount} {lang === 'de' ? 'von' : 'of'} 5
                  </b>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{
                      flex: 1, height: 12, borderRadius: 999,
                      border: '2px solid var(--color-ink)',
                      background: i < practiceCount ? 'var(--color-cobalt)' : '#ffffff',
                      transition: 'background 0.4s ease',
                    }} />
                  ))}
                </div>
              </PaperCard>

              {/* Keyframes for the traveling dot. Corners align exactly
                   with the dashed square's edges; linear timing keeps
                   each side at 4s. */}
              <style>{`
                @keyframes rp-box-travel {
                  0%,100% { top: -11px;  left: -11px; }
                  25%     { top: -11px;  left: calc(100% - 9px); }
                  50%     { top: calc(100% - 9px); left: calc(100% - 9px); }
                  75%     { top: calc(100% - 9px); left: -11px; }
                }
              `}</style>
            </>
          )}

          {/* ═══ LEARN BANNER ═══
               Fires the once Ronki crosses the learn threshold for a skill.
               Sun card, dismissable, marks ronkiLearnBannerSeen so it
               doesn't re-show on next app open. Next bad-Ronki day Ronki
               will offer the skill back to Louis (Rollentausch). */}
          {showLearnBanner && (
            <PaperCard tone="sun" pad="sm" className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-ink">
                <DoodleIcon name="cloud" size={24} />
              </span>
              <div className="flex-1 min-w-0">
                <b className="font-headline font-bold text-ink block" style={{ fontSize: 17, lineHeight: 1.2 }}>
                  {lang === 'de' ? 'Ronki hat Box-Atmung gelernt!' : 'Ronki learned box breathing!'}
                </b>
                <span className="font-body text-ink" style={{ fontSize: 16, lineHeight: 1.3 }}>
                  {lang === 'de' ? 'Nächstes Mal atmet er mit dir. Ohne Worte.' : 'Next time he\'ll breathe with you. Without words.'}
                </span>
              </div>
              <button
                aria-label={lang === 'de' ? 'Schließen' : 'Close'}
                onClick={() => actions.markLearnBannerSeen?.('boxAtmung')}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-ink active:scale-95 transition-transform">
                <DoodleIcon name="close" size={18} stroke={7} />
              </button>
            </PaperCard>
          )}

          {/* Mini-Spiele CTA + Freunde card moved to their dedicated
               segments below; no longer duplicated on the Pflege landing.
               Helden-Kodex stays because it's a standalone hero, not one
               of the sub-nav destinations. */}

          {/* ═══ EURE CHRONIK: the Abenteuer-Buch card linking to the
               Buch. Replaces the dropped Erinnerungen segment (Marc 24
               Apr 2026). Single tappable card showing days together +
               new-pages hint. */}
          <ChronikCta state={state} lang={lang} onNavigate={onNavigate} />

          {/* ═══ HELDEN-KODEX: a quiet paper row with a heart doodle
               (Marc 24 Apr 2026: must not compete with the Chronik
               card above). ═══ */}
          {!dev && (
            <PaperCard as="button" pad="none"
              onClick={() => onNavigate?.('kodex')}
              className="w-full mb-4 flex items-center gap-3"
              style={{ padding: '12px 14px' }}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper" style={{ color: 'var(--color-ember)' }}>
                <DoodleIcon name="heart" size={22} filled />
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-headline font-semibold text-ink-soft block" style={{ fontSize: 16, lineHeight: 1.1, marginBottom: 2 }}>
                  {lang === 'de' ? 'Für Helden' : 'For heroes'}
                </span>
                <span className="font-headline font-bold text-ink" style={{ fontSize: 17, lineHeight: 1.25 }}>
                  {lang === 'de' ? 'Was einen Helden ausmacht' : 'What makes a hero'}
                </span>
              </div>
              <span className="shrink-0 text-ink"><DoodleIcon name="arrow" size={16} stroke={8} /></span>
            </PaperCard>
          )}

          {/* Mein Drache tabs were here: moved to the top of the Pflege
               segment (23 Apr 2026) per Marc: "right below the sub-nav". */}

          </>)}

          {/* ═══ FREUNDE SEGMENT ═══
               Louis's preferred style (22 Apr 2026): single tappable
               card, paw doodle + "Ronkis Freunde" + "X von Y getroffen"
               subtitle + chevron. Horizontal strip of 6 circle avatars:
               discovered first, locked slots filling the rest. The card
               itself navigates to the full Micropedia, so no separate
               button (fewer tap targets = less visual noise). */}
          {segment === 'freunde' && (
            <>
              {/* Real-kid friendship layer (RealFriends) deleted Apr 2026
                  (cut #10c). The chibi-creature gallery below now stands
                  as the canonical "Ronkis Freunde" surface: friends Ronki
                  meets on expeditions. */}
            <section style={{ marginBottom: 14 }}>
              <Kicker>{lang === 'de' ? 'Ronkis Freunde' : "Ronki's Friends"}</Kicker>
              <PaperCard as="button" tone="paper" lift pad="none"
                onClick={() => onNavigate?.('micropedia')}
                className="w-full"
                style={{ padding: '16px 16px 18px' }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-ink">
                    <DoodleIcon name="paw" size={24} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-ink" style={{ fontSize: 19, lineHeight: 1.15, margin: 0 }}>
                      {lang === 'de' ? 'Ronkis Freunde' : "Ronki's Friends"}
                    </h3>
                    <p className="font-body text-ink-soft" style={{ fontSize: 16, margin: '2px 0 0' }}>
                      {totalFound} {lang === 'de' ? 'von' : 'of'} {totalCreatures} {lang === 'de' ? 'getroffen' : 'met'}
                    </p>
                  </div>
                  <span className="shrink-0 text-ink"><DoodleIcon name="arrow" size={18} stroke={8} /></span>
                </div>
                {/* Compact strip of 6 circle avatars: discovered first,
                     locked circles filling the rest. Scrolls
                     horizontally if Louis has met more than 6 creatures.
                     Discovered avatars render as ChibiFriend; creatures
                     not in the chibi roster yet fall back to their old
                     portrait (other creatures may keep their old art). */}
                <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {recentFreunde.slice(0, 6).map(f => (
                    hasChibiFriend(f.id) ? (
                      <ChibiFriend key={f.id} id={f.id} size={56} />
                    ) : (
                      <div key={f.id}
                           className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-ink bg-white">
                        {f.art ? (
                          <img src={base + f.art} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-paper text-ink">
                            <DoodleIcon name="paw" size={22} />
                          </div>
                        )}
                      </div>
                    )
                  ))}
                  {/* Locked slots: fill out to 6 so the row always reads
                       "part of a bigger set". */}
                  {Array.from({ length: Math.max(0, 6 - recentFreunde.length) }).map((_, i) => (
                    <ChibiFriend key={`locked-${i}`} id="__locked__" size={56} locked />
                  ))}
                </div>
              </PaperCard>
            </section>
            </>
          )}

          {/* ═══ FEUER SEGMENT ═══
               Replaced the thin "Spiele" pass-through 24 Apr 2026 (Marc).
               Games are still reachable via the main NavBar; this slot
               now hosts the fire-breath progression collection: a visual
               compendium of unlocked vs. locked breaths + the pending
               teach-ritual card when totalTasksDone crosses a threshold.
               See backlog_fire_breath_progression.md. */}
          {segment === 'feuer' && (
            <FireBreathCollection />
          )}

          {/* ═══ ERINNERUNGEN SEGMENT ═══
               Merged destination combining the Abenteuer-Chronik
               (completed arcs), Erinnerungen (badges) and the journal
               history, including the bonding-agent memory entries
               written when Louis picks a gentle reaction on a
               bad-Ronki day. Chronological scrollable list. */}
          {segment === 'erinnerungen' && (
            <ErinnerungenList state={state} lang={lang} t={t} onNavigate={onNavigate} />
          )}

        </div>
      </main>

      {/* Thank-you bubble: shown for ~2.8s after Louis picks a gentle
           reaction on a bad-Ronki day. Ronki says it in a speech bubble;
           does not block interaction. The `<style>` block lives OUTSIDE
           role="status" so screen readers don't announce the raw CSS
           with aria-live. */}
      <style>{`
        @keyframes rp-thx-in {
          from { opacity: 0; transform: translateY(10px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        /* Tired-day z's drifting up beside Ronki's head. */
        @keyframes rp-card-zzz {
          0%   { transform: translate(0, 0) scale(0.6); opacity: 0; }
          25%  { opacity: 0.9; }
          100% { transform: translate(-22px, -40px) scale(1.1); opacity: 0; }
        }
      `}</style>
      {thankYou && (
        <div role="status" aria-live="polite"
             className="fixed inset-x-0 flex justify-center pointer-events-none"
             style={{ bottom: 120, zIndex: 400 }}>
          <div style={{ animation: 'rp-thx-in 0.3s ease-out' }}>
            <SpeechBubble side="bottom" tone="white" size="lg">
              {thankYou}
            </SpeechBubble>
          </div>
        </div>
      )}

      {/* Local keyframes used by the segment dot (Feuer tab when a
          ritual is pending). */}
      <style>{`
        @keyframes rp-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}

// ── Erinnerungen segment: merged memories list ───────────────────────
// Folds three previously-separate destinations into one chronological
// scroll: journal memories (state.journalHistory), completed quest arcs
// (state.arcEngine.completedArcIds, arc title + completion date), and
// badge milestones. The bonding-agent writes into journalHistory when
// Louis picks a sad-day reaction, so those moments naturally flow in
// too. Interim surface: Buch v2 will be the full storybook home.

// ── ChronikCta: "Abenteuer-Buch" card that opens the Buch ──
// Renamed from "Chronik" (not first-grade-friendly) to "Abenteuer-Buch"
// per Marc 24 Apr 2026. Two visual states:
//   · default: a quiet white paper row matching the Helden-Kodex row
//              so it doesn't shout on every visit
//   · excited: a sun card with a hard paper lift and three sparkle
//              doodles when a new chapter just dropped (new journal
//              entry today or all daily routines completed).
// Visual separation means Louis only sees the bright pull when there's
// actually something fresh to open.

function ChronikCta({ state, lang, onNavigate }) {
  const totalDays = state?.totalTaskDays || 0;
  const today = new Date().toISOString().slice(0, 10);
  // Excited state fires when EITHER today's journal has an entry
  // (chapter just written) OR all main quests done today (new chapter
  // at end-of-day). Kid sees the pull once per day of real progress.
  const todaysJournal = (state?.journalHistory || []).find(j => j.date === today);
  const mainQuests = (state?.quests || []).filter(q => !q.sideQuest);
  const allRoutinesDone = mainQuests.length > 0 && mainQuests.every(q => q.done);
  const isExcited = !!todaysJournal || allRoutinesDone;
  // Count journal entries written in the last 7 days as "new pages".
  const weekAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  })();
  const newPages = (state?.journalHistory || []).filter(j => j.date && j.date >= weekAgo).length;

  const title = lang === 'de' ? 'Abenteuer-Buch' : 'Adventure Book';
  const subtitle = newPages > 0
    ? (lang === 'de' ? `${newPages} neue Seite${newPages === 1 ? '' : 'n'} diese Woche` : `${newPages} new page${newPages === 1 ? '' : 's'} this week`)
    : (lang === 'de' ? 'Eure Geschichte, Kapitel für Kapitel.' : 'Your story, chapter by chapter.');
  const daysLabel = `${totalDays} ${totalDays === 1 ? (lang === 'de' ? 'Tag' : 'day') : (lang === 'de' ? 'Tage' : 'days')}`;

  if (!isExcited) {
    // State A: quiet paper row (matches the Helden-Kodex row)
    return (
      <PaperCard as="button" pad="none"
        onClick={() => onNavigate?.('buch')}
        className="w-full mb-4 flex items-center gap-3"
        style={{ padding: '12px 14px' }}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper text-cobalt">
          <DoodleIcon name="book" size={22} />
        </span>
        <div className="flex-1 min-w-0">
          <span className="font-headline font-semibold text-ink-soft block" style={{ fontSize: 16, lineHeight: 1.1, marginBottom: 2 }}>
            {totalDays > 0 ? daysLabel : (lang === 'de' ? 'Buch' : 'Book')}
          </span>
          <span className="font-headline font-bold text-ink" style={{ fontSize: 17, lineHeight: 1.25 }}>
            {title}
          </span>
        </div>
        <span className="shrink-0 text-ink"><DoodleIcon name="arrow" size={16} stroke={8} /></span>
      </PaperCard>
    );
  }

  // State B: excited (new chapter waiting). Sun card, paper lift,
  // sparkle doodles that twinkle slowly.
  return (
    <PaperCard as="button" tone="sun" lift pad="none"
      onClick={() => onNavigate?.('buch')}
      className="w-full mb-5 flex items-center gap-4 overflow-hidden"
      style={{ padding: '18px 16px' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[
          { left: '58%', top: '14%', delay: '0s',   size: 16 },
          { left: '74%', top: '62%', delay: '0.9s', size: 12 },
          { left: '46%', top: '70%', delay: '1.7s', size: 10 },
        ].map((s, i) => (
          <span key={i} className="text-white" style={{
            position: 'absolute', left: s.left, top: s.top, lineHeight: 0,
            animation: `abCtaSparkle 2.6s ease-in-out ${s.delay} infinite`,
          }}>
            <DoodleIcon name="sparkle" size={s.size} filled stroke={3} />
          </span>
        ))}
      </div>
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-cobalt">
        <DoodleIcon name="book" size={26} />
      </span>
      <div className="flex-1 min-w-0 relative">
        <span className="bb-hand block uppercase text-ink" style={{ fontSize: 17, lineHeight: 1, marginBottom: 4 }}>
          {lang === 'de' ? 'Neues Kapitel' : 'New chapter'}
        </span>
        <b className="font-headline font-bold text-ink block" style={{ fontSize: 18, lineHeight: 1.15 }}>
          {title}
          {totalDays > 0 && ` · ${daysLabel}`}
        </b>
        <span className="font-body text-ink block" style={{ fontSize: 16, lineHeight: 1.3, marginTop: 2 }}>
          {subtitle}
        </span>
      </div>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-ink">
        <DoodleIcon name="arrow" size={16} stroke={8} />
      </span>
      <style>{`
        @keyframes abCtaSparkle {
          0%, 100% { transform: scale(0.6); }
          50%      { transform: scale(1); }
        }
      `}</style>
    </PaperCard>
  );
}

// Doodles for the memory kinds in the Erinnerungen list.
const MEMORY_DOODLE = {
  bonding: { name: 'heart', color: 'var(--color-ember)' },
  journal: { name: 'book', color: 'var(--color-cobalt)' },
  arc: { name: 'sparkle', color: 'var(--color-sun-deep)' },
  badge: { name: 'star', color: 'var(--color-sun-deep)' },
};

function ErinnerungenList({ state, lang, t, onNavigate }) {
  const entries = React.useMemo(() => {
    const out = [];
    // Journal memories (bonding-agent reactions + daily journal saves)
    (state?.journalHistory || []).forEach((j, i) => {
      if (!j?.memory) return;
      const isBondingAgent = (j.achievements || []).includes('ronki-bad-day');
      out.push({
        key: `j-${i}-${j.date}`,
        date: j.date,
        kind: isBondingAgent ? 'bonding' : 'journal',
        title: isBondingAgent
          ? (lang === 'de' ? 'Für Ronki da gewesen' : 'Being there for Ronki')
          : (lang === 'de' ? 'Tagebuch' : 'Journal'),
        body: j.memory,
      });
    });
    // Completed arcs
    (state?.arcEngine?.completedArcIds || []).forEach((arcId, i) => {
      const arc = findArc(arcId);
      if (!arc) return;
      out.push({
        key: `a-${arcId}-${i}`,
        date: state?.arcEngine?.completedAt?.[arcId] || null,
        kind: 'arc',
        title: t ? t(arc.titleKey) : arcId,
        body: lang === 'de' ? 'Abenteuer bestanden' : 'Adventure survived',
      });
    });
    // Boss trophies removed from the Erinnerungen list (Marc 23 Apr
    // 2026: "let's remove boss besiegt under eure geschichte"). Bosses
    // live in the Boss tab / trophy wall instead.
    // Badges
    (state?.unlockedBadges || []).forEach((badgeId, i) => {
      out.push({
        key: `badge-${badgeId}-${i}`,
        date: null,
        kind: 'badge',
        title: lang === 'de' ? 'Abzeichen' : 'Badge',
        body: badgeId,
      });
    });
    // Sort newest first; entries without dates bubble to the end.
    out.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });
    return out;
  }, [state?.journalHistory, state?.arcEngine?.completedArcIds, state?.unlockedBadges, lang, t]);

  const totalDays = state?.totalTaskDays || 0;

  return (
    <section style={{ marginBottom: 14 }}>
      {/* Header: day count + memory count. */}
      <div className="flex items-baseline justify-between mb-3 px-1">
        <b className="bb-display text-ink" style={{ fontSize: 26 }}>
          {totalDays > 0
            ? `${totalDays} ${totalDays === 1 ? (lang === 'de' ? 'Tag' : 'day') : (lang === 'de' ? 'Tage' : 'days')}`
            : (lang === 'de' ? 'Eure Geschichte' : 'Your story')}
        </b>
        <span className="font-headline font-semibold text-ink-soft" style={{ fontSize: 16 }}>
          {entries.length} {entries.length === 1
            ? (lang === 'de' ? 'Erinnerung' : 'memory')
            : (lang === 'de' ? 'Erinnerungen' : 'memories')}
        </span>
      </div>

      {/* Open-in-Buch card: the storybook view is the richer home.
           Always visible (even when Erinnerungen is empty) so kids
           discover the Buch from day one. */}
      <PaperCard as="button" tone="paper" lift pad="none"
        onClick={() => onNavigate?.('buch')}
        className="w-full flex items-center gap-3 mb-4"
        style={{ padding: '14px 16px' }}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-cobalt">
          <DoodleIcon name="book" size={24} />
        </span>
        <div className="flex-1 min-w-0">
          <b className="font-headline font-bold text-ink block" style={{ fontSize: 18, lineHeight: 1.2 }}>
            {lang === 'de' ? 'Euer Buch öffnen' : 'Open your Book'}
          </b>
          <span className="font-body text-ink-soft" style={{ fontSize: 16, lineHeight: 1.3 }}>
            {lang === 'de'
              ? 'Eure Geschichte als Kapitel-Buch.'
              : 'Your story as a chapter book.'}
          </span>
        </div>
        <span className="shrink-0 text-ink"><DoodleIcon name="arrow" size={18} stroke={8} /></span>
      </PaperCard>

      {entries.length === 0 ? (
        <PaperCard tone="paper" className="text-center flex flex-col items-center">
          <RonkiArt pose="leaf" size={120} />
          <b className="font-headline font-bold text-ink block mt-2 mb-1" style={{ fontSize: 18 }}>
            {lang === 'de' ? 'Eure Geschichte beginnt bald' : 'Your story begins soon'}
          </b>
          <p className="font-body text-ink-soft" style={{ fontSize: 16, margin: 0 }}>
            {lang === 'de'
              ? 'Jedes Abenteuer, jeder kleine Moment landet hier.'
              : 'Every adventure, every small moment lands here.'}
          </p>
        </PaperCard>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.slice(0, 30).map(e => {
            const d = MEMORY_DOODLE[e.kind] || MEMORY_DOODLE.journal;
            return (
              <PaperCard key={e.key} tone="paper" pad="sm" className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white" style={{ color: d.color }}>
                  <DoodleIcon name={d.name} size={22} filled={e.kind === 'badge'} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <b className="font-headline font-bold text-ink" style={{ fontSize: 17, lineHeight: 1.2 }}>
                      {e.title}
                    </b>
                    {e.date && (
                      <span className="font-body text-ink-soft" style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                        {e.date}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-ink" style={{ fontSize: 16, lineHeight: 1.4, margin: '3px 0 0' }}>
                    {e.body}
                  </p>
                </div>
              </PaperCard>
            );
          })}
          {entries.length > 30 && (
            <p className="font-body text-ink-soft text-center mt-2" style={{ fontSize: 16 }}>
              {lang === 'de'
                ? `${entries.length - 30} weitere werden im Buch gesammelt.`
                : `${entries.length - 30} more collected in the Buch.`}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Evolution tree ─────────────────────────────────────────
// Vertical timeline of the 6 CAT_STAGES (Ei to Legendär), each with
// its drawn stage art (eggs/egg-cream, ronki/baby, calm, proud,
// grown, legendary).
//   · Stages BELOW current: full colour, with the trait that was
//     rolled at that stage (from state.hatchTraits if present).
//   · CURRENT stage: sky-wash row with the cobalt drawn ring,
//     "Hier seid ihr gerade."
//   · Stages ABOVE current: faded art with the
//     'Noch X Aufgaben bis hier' hint pulled from the CAT_STAGES
//     thresholds + state.catEvo delta.
function EvolutionTree({ state, lang }) {
  const evo = state?.catEvo || 0;
  const currentStage = getCatStage(evo);
  const traits = Array.isArray(state?.hatchTraits) ? state.hatchTraits : [];

  return (
    <PaperCard tone="paper" pad="none" style={{ padding: 16 }}>
      <div className="flex items-center gap-2 mb-3 text-ink">
        <span style={{ color: 'var(--color-leaf-deep)', lineHeight: 0 }}><DoodleIcon name="leaf" size={22} /></span>
        <span className="font-headline font-semibold" style={{ fontSize: 17 }}>
          {lang === 'de' ? 'Wie Ronki wächst' : "How Ronki grows"}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CAT_STAGES.map((stg, idx) => {
          const past    = idx < currentStage;
          const current = idx === currentStage;
          const future  = idx > currentStage;
          const traitId = past ? traits[idx - 1] : null;  // trait rolled at THIS stage advance
          const nextThreshold = future ? stg.threshold : null;
          const remaining = nextThreshold ? Math.max(0, nextThreshold - evo) : 0;
          return (
            <div
              key={stg.id ?? idx}
              className={current ? 'bg-sky-wash' : ''}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr',
                gap: 12,
                alignItems: 'center',
                padding: '6px 12px 6px 8px',
                borderRadius: 18,
                border: current ? '2.5px solid var(--color-cobalt)' : '2px solid transparent',
              }}
            >
              <div style={{ width: 60, height: 60, opacity: future ? 0.38 : 1 }}>
                <RonkiArt pose={STAGE_ART[idx] || 'calm'} size={60} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="font-headline font-bold text-ink" style={{ fontSize: 17, lineHeight: 1.2 }}>
                  {stg.name || stg.label?.de || stg.id}
                </div>
                <div className={`font-body ${current ? 'text-ink' : 'text-ink-soft'}`} style={{ fontSize: 16, lineHeight: 1.35, marginTop: 2 }}>
                  {current
                    ? (lang === 'de' ? 'Hier seid ihr gerade.' : "You're here.")
                    : past
                    ? (traitId
                        ? (lang === 'de' ? `Mitgebracht: ${formatTraitId(traitId)}` : `Earned: ${formatTraitId(traitId)}`)
                        : (lang === 'de' ? 'Schon erlebt.' : 'Past stage.'))
                    : (remaining > 0
                        ? (lang === 'de'
                            ? `Noch ${remaining} ${remaining === 1 ? 'Aufgabe' : 'Aufgaben'} bis hier.`
                            : `${remaining} more ${remaining === 1 ? 'task' : 'tasks'} until here.`)
                        : (lang === 'de' ? 'Bald.' : 'Soon.'))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="font-body text-ink-soft" style={{ margin: '14px 4px 0', fontSize: 16, lineHeight: 1.45 }}>
        {lang === 'de'
          ? 'Mit jeder Entwicklung bekommt Ronki ein neues Merkmal.'
          : 'With every evolution Ronki gains a new trait.'}
      </p>
    </PaperCard>
  );
}

// Tiny helper: turn a trait ID like 'gold-tip' into the display
// label used by the Compendium chip. Kept inline so we don't import
// the variant data here. Falls back to the raw id if unknown.
function formatTraitId(id) {
  const map = {
    'gold-tip': 'Gold-Spitze ✨',
    'sun-freckle': 'Sonnen-Sommersprosse ☀️',
    'ember-puff': 'Glut-Schweif 🔥',
    'wave-curve': 'Wellen-Schwung 🌊',
    'pearl-dot': 'Perlen-Punkt 🫧',
    'sea-foam': 'Seeschaum 💧',
    'heart-pair': 'Herz-Paar 💕',
    'blush': 'Erröten 🌸',
    'petal': 'Blüten-Schweif 🌷',
    'spiral': 'Spiral-Horn 🌀',
    'star-mark': 'Stern-Mal ✦',
    'mist': 'Nebel-Hauch ✧',
    'leaf-tip': 'Blatt-Spitze 🌿',
    'moss-mark': 'Moos-Punkt 🍃',
    'fern-tuft': 'Farn-Schweif 🌱',
    'flame-tip': 'Flammen-Spitze 🔥',
    'sunset': 'Abendrot-Streif 🌅',
    'spark': 'Funken-Schweif ✨',
  };
  return map[id] || id;
}
