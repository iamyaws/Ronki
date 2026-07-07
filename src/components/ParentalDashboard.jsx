import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { DEFAULT_FAMILY_CONFIG } from '../types/familyConfig';
import { getCatStage } from '../utils/helpers';
import { useRonkiStamina } from '../hooks/useRonkiStamina';
import FeedbackModal from './FeedbackModal';
// QuestLineEditor deleted Apr 2026 (cut #10f). NORTHSTAR: "not a skill tree".
import VoiceAudio from '../utils/voiceAudio';
import BackgroundMusic from '../utils/backgroundMusic';
import QRCode from 'qrcode';
import {
  getActiveToken,
  buildShareUrl,
  tokenDisplayFragment,
  generateToken,
  setActiveToken,
} from '../lib/profileToken';
import { useAnalytics } from '../hooks/useAnalytics';

const PIN_CODE = '1234';
const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😊', '🤩'];
const MOOD_LABELS = ['Traurig', 'Besorgt', 'Okay', 'Gut', 'Toll', 'Müde'];
const MOOD_COLORS = ['#ef4444', '#f97316', '#94a3b8', '#34d399', '#fcd34d', '#a78bfa'];
const DAY_LABELS_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const base = typeof import.meta !== 'undefined' ? import.meta.env.BASE_URL : '/';

// ── Bodhi Leaf Decoration ──
function BodhiLeaf({ className = '' }) {
  return (
    <div className={`flex justify-center py-4 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 120 120" fill="none" style={{ opacity: 0.15 }}>
        <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#124346" />
      </svg>
    </div>
  );
}

export default function ParentalDashboard({ onClose, currentView, preauthorized = false }) {
  const { state, actions } = useTask();
  const { t, lang, setLang } = useTranslation();
  const { track } = useAnalytics();
  const [pin, setPin] = useState('');
  // `preauthorized` short-circuits the legacy internal PIN gate. We now
  // surface a dedicated PinModal from App.jsx *before* the dashboard
  // mounts (Marc's flow: enter PIN on a focused screen, then the
  // dashboard opens cleanly). The internal gate is kept as a fallback
  // for any call sites that still mount the dashboard directly.
  const [authed, setAuthed] = useState(preauthorized);
  const [pinError, setPinError] = useState(false);
  const [tab, setTab] = useState('overview');
  const [showFeedback, setShowFeedback] = useState(false);
  const DAY_LABELS = lang === 'en' ? DAY_LABELS_EN : DAY_LABELS_DE;
  const tabBarRef = useRef(null);

  // Keep the active tab pill in view on every switch. Only matters when the
  // container actually overflows (very narrow phones); on wider screens the
  // flex row already fits and this is a no-op.
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const active = bar.querySelector(`[data-tab-id="${tab}"]`);
    if (active && typeof active.scrollIntoView === 'function') {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [tab]);

  // Analytics: parent.dashboard.open — fire exactly once per mount. A
  // separate pass will wire toggle UI (analyticsEnabled, mood-history,
  // etc.) elsewhere in this component; we deliberately don't add any
  // UI here beyond this one useEffect.
  useEffect(() => {
    track('parent.dashboard.open');
  }, [track]);

  if (!state) return null;

  // ── PIN Gate ──
  if (!authed) {
    const handleDigit = (d) => {
      const next = pin + d;
      setPinError(false);
      if (next.length === 4) {
        if (next === (localStorage.getItem('ronki_pin') || PIN_CODE)) {
          setAuthed(true);
        } else {
          setPinError(true);
          setPin('');
        }
      } else {
        setPin(next);
      }
    };

    return (
      <div className="fixed inset-0 z-[300] bg-surface flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Background texture */}
        <img src={base + 'art/bg-parchment.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,248,241,0.6)' }} />

        <button onClick={onClose}
          aria-label="Schließen"
          className="fixed right-3 z-[300] w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
          }}>
          <span className="material-symbols-outlined text-on-surface-variant text-2xl">close</span>
        </button>

        <div className="relative z-10 flex flex-col items-center">
          {/* Lock icon with glow */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
               style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px rgba(18,67,70,0.08)' }}>
            <span className="material-symbols-outlined text-4xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </div>
          <h2 className="font-headline font-bold text-2xl text-on-surface mb-1">Eltern-Bereich</h2>
          <p className="font-body text-on-surface-variant text-sm mb-8">PIN eingeben um fortzufahren</p>

          {/* PIN dots */}
          <div className="flex gap-4 mb-8">
            {[0,1,2,3].map(i => (
              <div key={i} className="w-4 h-4 rounded-full transition-all duration-300"
                   style={{
                     background: i < pin.length ? '#124346' : 'rgba(18,67,70,0.12)',
                     boxShadow: i < pin.length ? '0 0 8px rgba(18,67,70,0.25)' : 'none',
                     transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
                   }} />
            ))}
          </div>

          {pinError && (
            <p className="text-error font-label font-bold text-sm mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              Falscher PIN
            </p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3 max-w-xs w-full">
            {[1,2,3,4,5,6,7,8,9,null,0,'del'].map((d, i) => {
              if (d === null) return <div key={i} />;
              if (d === 'del') {
                return (
                  <button key={i} onClick={() => setPin(p => p.slice(0, -1))}
                    className="h-16 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
                    style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                    <span className="material-symbols-outlined text-on-surface-variant">backspace</span>
                  </button>
                );
              }
              return (
                <button key={i} onClick={() => handleDigit(String(d))}
                  className="h-16 rounded-2xl font-headline font-bold text-2xl text-on-surface flex items-center justify-center active:scale-95 transition-all"
                  style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                  {d}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-label text-on-surface-variant/40 mt-6 uppercase tracking-widest">Standard-PIN: 1234</p>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ──
  return (
    <div className="fixed inset-0 z-[300] bg-surface overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Background */}
      <img src={base + 'art/bg-warm-cream.png'} alt="" className="fixed inset-0 w-full h-full object-cover opacity-15 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'rgba(255,248,241,0.5)' }} />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-6 pb-2"
              style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))', background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
               style={{ background: 'rgba(18,67,70,0.08)' }}>
            <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_person
            </span>
          </div>
          <div>
            <h1 className="font-headline font-bold text-xl text-primary"
                style={{ textShadow: '0 1px 4px rgba(255,255,255,0.5)' }}>Eltern-Bereich</h1>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}>
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </button>
      </header>

      {/* Tab Bar — compact pills so all 4 fit on a 375px phone without
          horizontal scroll. Icon size, padding, gap and label size are all
          shrunk vs. the old tappable-but-clipped layout. Active tab also
          scrolls into view as a belt-and-braces fallback for narrower
          viewports (<360px) where even compact pills overflow. */}
      <div ref={tabBarRef}
           className="relative z-10 flex gap-1.5 px-3 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {[
          { id: 'overview', label: t('parent.tab.overview'), icon: 'dashboard' },
          { id: 'family', label: t('parent.tab.family'), icon: 'family_restroom' },
          // 'questlines' tab removed Apr 2026 (cut #10f, QuestLine deletion).
          { id: 'settings', label: t('parent.tab.settings'), icon: 'settings' },
        ].map(tb => (
          <button key={tb.id}
            data-tab-id={tb.id}
            onClick={() => setTab(tb.id)}
            className="flex-1 min-w-0 py-2 px-2 rounded-full font-label font-bold text-xs flex items-center justify-center gap-1 transition-all duration-300 whitespace-nowrap"
            style={{
              background: tab === tb.id ? '#124346' : 'rgba(255,255,255,0.6)',
              backdropFilter: tab !== tb.id ? 'blur(12px)' : undefined,
              border: tab === tb.id ? 'none' : '1px solid rgba(255,255,255,0.5)',
              color: tab === tb.id ? '#ffffff' : '#707979',
              boxShadow: tab === tb.id ? '0 4px 16px rgba(18,67,70,0.2)' : 'none',
            }}>
            <span className="material-symbols-outlined text-base shrink-0"
                  style={{ fontVariationSettings: tab === tb.id ? "'FILL' 1" : undefined }}>
              {tb.icon}
            </span>
            <span className="truncate">{tb.label}</span>
          </button>
        ))}
      </div>

      <main className="relative z-10 px-6 pb-12 max-w-lg mx-auto flex flex-col gap-5">
        {tab === 'overview' && <OverviewTab state={state} lang={lang} t={t} />}
        {tab === 'family' && <FamilyTab state={state} actions={actions} lang={lang} />}
        {/* tab==='questlines' removed Apr 2026 (cut #10f). */}
        {tab === 'settings' && <SettingsTab lang={lang} setLang={setLang} t={t} actions={actions} state={state} onOpenFeedback={() => setShowFeedback(true)} />}
        <BodhiLeaf />
      </main>

      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          currentView={currentView}
          ronkiStage={getCatStage(state?.catEvo || 0)}
          catEvo={state?.catEvo || 0}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════
function OverviewTab({ state, lang, t }) {
  const completedToday = (state.quests || []).filter(q => q.done && !q.sideQuest).length;
  const totalToday = (state.quests || []).filter(q => !q.sideQuest).length;
  const completionPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  // totalOrbs removed with the Wachstums-Orbs card — restore if orb feature ships

  // ─── Build the curator summary: what will the child actually see today? ───
  // Pulled from D3 (Kartenstapel) — parents are curators, not spectators. The
  // dashboard's first job is to answer "what's queued for today" at a glance.
  const activeQuestLines = (state.parentQuestLines || []).filter(ql => !ql.completed && !ql.archived);
  const activeArcId = state.arcEngine?.activeArcId;
  const offeredArcId = state.arcEngine?.offeredArcId;
  const activeMissions = (state.activeMissions || []);
  const parentMsgOn = !!state.familyConfig?.parentMessage?.enabled && !!state.familyConfig?.parentMessage?.body;
  const poemActive = !!state.poemQuest && !state.poemQuest.completed;

  const items = [];
  // Daily routine summary — always first, grounds everything else
  items.push({
    icon: 'check_circle',
    title: `${totalToday} Aufgaben heute`,
    sub: completedToday > 0 ? `${completedToday} bereits erledigt` : 'Noch nichts erledigt',
    color: '#059669',
    bg: 'rgba(5,150,105,0.08)',
  });
  // Active parent-created quest-lines — Gedicht, Hausaufgaben etc.
  activeQuestLines.forEach(ql => {
    const dayN = (ql.completedDayIds?.length || 0) + 1;
    items.push({
      icon: 'flag',
      title: `${ql.emoji || '📋'} ${ql.title}`,
      sub: `Tag ${dayN} von ${ql.days.length}`,
      color: '#6d28d9',
      bg: 'rgba(109,40,217,0.08)',
    });
  });
  // Legacy PoemQuest (only if mid-progress; CTA was removed earlier today)
  if (poemActive) {
    const dayN = (state.poemQuest.done?.length || 0) + 1;
    items.push({
      icon: 'menu_book',
      title: '📖 Mein Gedicht',
      sub: `Tag ${dayN} von 7`,
      color: '#059669',
      bg: 'rgba(5,150,105,0.08)',
    });
  }
  // Active arc — the Freund adventure Louis is in the middle of
  if (activeArcId) {
    items.push({
      icon: 'auto_stories',
      title: 'Abenteuer läuft',
      sub: 'Freund-Arc aktiv',
      color: '#A83E2C',
      bg: 'rgba(180,83,9,0.08)',
    });
  } else if (offeredArcId) {
    items.push({
      icon: 'email',
      title: 'Abenteuer wartet',
      sub: 'Neuer Arc wird angeboten',
      color: '#A83E2C',
      bg: 'rgba(180,83,9,0.08)',
    });
  }
  // Active missions
  if (activeMissions.length > 0) {
    items.push({
      icon: 'rocket_launch',
      title: `${activeMissions.length} Epische Mission${activeMissions.length > 1 ? 'en' : ''}`,
      sub: 'Mehrtägige Herausforderung',
      color: '#dc2626',
      bg: 'rgba(220,38,38,0.08)',
    });
  }
  // Parent message banner
  if (parentMsgOn) {
    const preview = state.familyConfig.parentMessage.body.slice(0, 40);
    items.push({
      icon: 'mail',
      title: 'Botschaft an',
      sub: `„${preview}${state.familyConfig.parentMessage.body.length > 40 ? '…' : ''}"`,
      color: '#735c00',
      bg: 'rgba(115,92,0,0.08)',
    });
  }

  return (
    <>
      {/* ─── Heute zeigen wir Louis ─── */}
      <div className="rounded-2xl p-5 mm-card" style={{
        background: 'linear-gradient(160deg, #fffbeb 0%, #fef3c7 60%, #fde68a 100%)',
        border: '1.5px solid rgba(217,119,6,0.2)',
        boxShadow: '0 4px 16px rgba(252,211,77,0.15)',
      }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-xl" style={{ color: '#A83E2C', fontVariationSettings: "'FILL' 1" }}>today</span>
          <h3 className="font-headline font-bold text-base" style={{ color: '#78350f' }}>
            Heute zeigen wir {state.familyConfig?.childName || 'deinem Kind'}:
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                 style={{ background: it.bg, border: `1px solid ${it.color}22` }}>
              <span className="material-symbols-outlined text-xl shrink-0"
                    style={{ color: it.color, fontVariationSettings: "'FILL' 1" }}>{it.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-label font-bold text-sm leading-tight" style={{ color: '#1f2937' }}>
                  {it.title}
                </p>
                <p className="font-body text-xs truncate mt-0.5" style={{ color: '#4b5563' }}>
                  {it.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="font-body text-xs italic mt-3 text-center" style={{ color: '#92400e99' }}>
          Du bestimmst, was im Kartenstapel landet. Feinheiten in den Tabs unten.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Completion Rate — Hero Card */}
        <div className="p-5 rounded-2xl relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #124346, #2d5a5e)', boxShadow: '0 8px 24px rgba(18,67,70,0.25)' }}>
          <p className="font-label font-bold text-xs text-white/50 uppercase tracking-widest">Abschlussrate</p>
          <p className="font-headline font-bold text-4xl text-white mt-1">{completionPct}%</p>
          <p className="font-label text-xs text-white/60 mt-1">{completedToday}/{totalToday} heute</p>
        </div>
        {/* HP */}
        <StatCard label="Sterne" value={state.hp || 0} sub="Verfügbar" />
        {/* Wachstums-Orbs removed — backlog item, not live yet. See
             backlog_evolution_orbs.md. Re-add when the orb sub-goals ship. */}
      </div>

      {/* Mood — today + 7-day history */}
      <div className="mm-card p-5">
        <div className="flex items-center justify-between">
          <SectionLabel icon="mood" text="Stimmung (7 Tage)" />
          {state.moodAM !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xl">{MOOD_EMOJIS[state.moodAM]}</span>
              <span className="font-label font-bold text-sm" style={{ color: MOOD_COLORS[state.moodAM] }}>
                {MOOD_LABELS[state.moodAM]}
              </span>
            </div>
          )}
        </div>
        <MoodHistoryChart history={state.journalHistory} lang={lang} />
        {state.moodAM === null && (
          <p className="font-body text-on-surface-variant italic text-xs mt-2">Noch keine Stimmung heute erfasst</p>
        )}
      </div>

      {/* Journal Entry */}
      {(state.journalMemory || (state.journalGratitude || []).length > 0) && (
        <div className="mm-card p-5">
          <SectionLabel icon="auto_stories" text="Journal-Eintrag heute" />
          {state.journalMemory && (
            <p className="font-body text-on-surface mt-3 p-3 rounded-xl italic text-sm"
               style={{ background: 'rgba(18,67,70,0.04)', border: '1px solid rgba(18,67,70,0.06)' }}>
              &ldquo;{state.journalMemory}&rdquo;
            </p>
          )}
          {(state.journalGratitude || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest self-center">Dankbar für:</span>
              {state.journalGratitude.map(g => (
                <span key={g} className="px-3 py-1 rounded-full font-label text-xs font-bold"
                      style={{ background: '#fcd34d', color: '#725b00' }}>{g}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quest Overview */}
      <div className="mm-card p-5">
        <SectionLabel icon="checklist" text="Aufgaben heute" />
        <div className="flex flex-col gap-1 mt-3">
          {(state.quests || []).filter(q => !q.sideQuest).map(q => (
            <div key={q.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors"
                 style={{ background: q.done ? 'rgba(52,211,153,0.06)' : 'transparent' }}>
              <span className="material-symbols-outlined text-lg"
                    style={{ color: q.done ? '#059669' : '#c0c8c9', fontVariationSettings: q.done ? "'FILL' 1" : undefined }}>
                {q.done ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className="text-sm">{q.icon}</span>
              <span className={'font-body text-sm flex-1' + (q.done ? ' line-through text-on-surface-variant/60' : ' text-on-surface')}>
                {t('quest.' + q.id)}
              </span>
              <span className="font-label text-xs font-bold uppercase tracking-wider"
                    style={{ color: q.done ? '#059669' : '#707979' }}>{q.xp} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Companion Status */}
      <div className="mm-card p-5">
        <SectionLabel icon="pets" text="Begleiter-Pflege" />
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: 'Gefüttert', done: state.catFed, icon: 'cookie' },
            { label: 'Gestreichelt', done: state.catPetted, icon: 'favorite' },
            { label: 'Gespielt', done: state.catPlayed, icon: 'sports_baseball' },
          ].map(c => (
            <div key={c.label} className="text-center p-3 rounded-xl"
                 style={{
                   background: c.done ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.5)',
                   border: c.done ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(0,0,0,0.06)',
                 }}>
              <span className="material-symbols-outlined text-xl mb-1 block"
                    style={{ color: c.done ? '#059669' : '#c0c8c9', fontVariationSettings: "'FILL' 1" }}>
                {c.done ? 'check_circle' : c.icon}
              </span>
              <p className="font-label font-bold text-xs uppercase tracking-widest"
                 style={{ color: c.done ? '#059669' : '#707979' }}>
                {c.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="p-5 rounded-2xl"
           style={{ background: 'rgba(18,67,70,0.04)', border: '1.5px solid rgba(18,67,70,0.08)', borderRadius: '1.25rem' }}>
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-primary text-xl shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
          <div>
            <p className="font-label font-bold text-sm text-primary">Eltern-Guide</p>
            <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
              Ronki begleitet dein Kind durch den Tag — beim Aufstehen, bei den
              Hausaufgaben, beim Schlafengehen. Keine Punktekonten, keine
              Bildschirmzeit-Tausche. Sterne sammeln sich für kleine echte
              Belohnungen, die ihr gemeinsam vereinbart.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}


// ═══════════════════════════════════════════════════════
// FAMILY TAB
// ═══════════════════════════════════════════════════════
function FamilyTab({ state, actions, lang }) {
  const DAY_LABELS = lang === 'en' ? DAY_LABELS_EN : DAY_LABELS_DE;
  // Merge with DEFAULT so partial/legacy configs (e.g. from older state where only
  // childName + parentMessage were saved) don't crash on `.siblings.length` etc.
  // The reducer should also guarantee this, but defence-in-depth keeps the
  // dashboard from throwing if anyone writes a partial config in the future.
  const rawConfig = state.familyConfig || {};
  const config = {
    ...DEFAULT_FAMILY_CONFIG,
    ...rawConfig,
    siblings: Array.isArray(rawConfig.siblings) ? rawConfig.siblings : DEFAULT_FAMILY_CONFIG.siblings,
    dailyHabits: Array.isArray(rawConfig.dailyHabits) ? rawConfig.dailyHabits : DEFAULT_FAMILY_CONFIG.dailyHabits,
    recurringActivities: Array.isArray(rawConfig.recurringActivities) ? rawConfig.recurringActivities : DEFAULT_FAMILY_CONFIG.recurringActivities,
    parentMessage: (rawConfig.parentMessage && typeof rawConfig.parentMessage === 'object')
      ? { ...DEFAULT_FAMILY_CONFIG.parentMessage, ...rawConfig.parentMessage }
      : DEFAULT_FAMILY_CONFIG.parentMessage,
    familyMotto: typeof rawConfig.familyMotto === 'string' ? rawConfig.familyMotto : DEFAULT_FAMILY_CONFIG.familyMotto,
    affirmation: typeof rawConfig.affirmation === 'string' ? rawConfig.affirmation : DEFAULT_FAMILY_CONFIG.affirmation,
  };
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(config)));
  const [saved, setSaved] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    setDraft(JSON.parse(JSON.stringify(config)));
  }, [config]);

  const update = (path, value) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    actions.updateFamilyConfig(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggle = (id) => setExpandedSection(prev => prev === id ? null : id);

  return (
    <>
      {/* Child Profile */}
      <SectionCard icon="face" title="Kind" subtitle={draft.childName || 'Name eingeben'}
        expanded={expandedSection === 'child'} onToggle={() => toggle('child')} tint="#124346">
        <div className="space-y-4">
          <FieldRow label="Name">
            <TextInput value={draft.childName} onChange={v => update('childName', v)} placeholder="Name des Kindes" />
          </FieldRow>
          <FieldRow label="Geburtstag">
            <input type="date" value={draft.childBirthday || ''}
              onChange={e => update('childBirthday', e.target.value)}
              className="w-full h-12 px-4 rounded-xl font-body text-on-surface focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
          </FieldRow>
          <FieldRow label="Pronomen">
            <ToggleRow options={[{ v: 'er', l: 'Er' }, { v: 'sie', l: 'Sie' }, { v: 'they', l: 'They' }]}
              value={draft.childPronouns} onChange={v => update('childPronouns', v)} />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Siblings */}
      <SectionCard icon="group" title="Geschwister"
        subtitle={draft.siblings.length === 0 ? 'Keine' : draft.siblings.map(s => s.name).join(', ')}
        expanded={expandedSection === 'siblings'} onToggle={() => toggle('siblings')} tint="#004532">
        <div className="space-y-4">
          {draft.siblings.map((sib, i) => (
            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
              <div className="flex justify-between items-center">
                <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">
                  Geschwister {i + 1}
                </span>
                <DeleteBtn onClick={() => { const n = [...draft.siblings]; n.splice(i, 1); update('siblings', n); }} />
              </div>
              <TextInput value={sib.name} onChange={v => { const n = [...draft.siblings]; n[i] = { ...n[i], name: v }; update('siblings', n); }} placeholder="Name" />
              <ToggleRow options={[{ v: 'Bruder', l: 'Bruder' }, { v: 'Schwester', l: 'Schwester' }, { v: 'Geschwister', l: 'Geschwister' }]}
                value={sib.relationship} onChange={v => { const n = [...draft.siblings]; n[i] = { ...n[i], relationship: v }; update('siblings', n); }} />
              <ToggleRow options={[{ v: 'er', l: 'Er' }, { v: 'sie', l: 'Sie' }, { v: 'they', l: 'They' }]}
                value={sib.pronouns} onChange={v => { const n = [...draft.siblings]; n[i] = { ...n[i], pronouns: v }; update('siblings', n); }} />
              <input type="date" value={sib.birthday || ''}
                onChange={e => { const n = [...draft.siblings]; n[i] = { ...n[i], birthday: e.target.value }; update('siblings', n); }}
                className="w-full h-11 px-4 rounded-xl font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
            </div>
          ))}
          <AddBtn label="Geschwister hinzufügen" onClick={() => {
            update('siblings', [...draft.siblings, { name: '', relationship: 'Geschwister', pronouns: 'er', birthday: '' }]);
          }} />
        </div>
      </SectionCard>

      {/* Daily Habits */}
      <SectionCard icon="routine" title="Tägliche Gewohnheiten"
        subtitle={`${draft.dailyHabits.length} Gewohnheit${draft.dailyHabits.length !== 1 ? 'en' : ''}`}
        expanded={expandedSection === 'habits'} onToggle={() => toggle('habits')} tint="#735c00">
        <div className="space-y-4">
          {draft.dailyHabits.map((habit, i) => (
            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{habit.icon}</span>
                  <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">
                    Gewohnheit {i + 1}
                  </span>
                </div>
                <DeleteBtn onClick={() => { const n = [...draft.dailyHabits]; n.splice(i, 1); update('dailyHabits', n); }} />
              </div>
              <div className="flex gap-2">
                <TextInput value={habit.name} onChange={v => { const n = [...draft.dailyHabits]; n[i] = { ...n[i], name: v }; update('dailyHabits', n); }} placeholder="Name" className="flex-1" />
                <div className="flex items-center gap-1">
                  <input type="number" min="1" max="50" value={habit.xp}
                    onChange={e => { const n = [...draft.dailyHabits]; n[i] = { ...n[i], xp: parseInt(e.target.value) || 5 }; update('dailyHabits', n); }}
                    className="w-16 h-12 px-2 rounded-xl font-body text-on-surface text-sm text-center outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
                  <span className="font-label text-xs text-outline uppercase tracking-widest">XP</span>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="font-label text-xs text-outline uppercase tracking-widest">Icon:</span>
                <EmojiInput value={habit.icon} onChange={v => { const n = [...draft.dailyHabits]; n[i] = { ...n[i], icon: v }; update('dailyHabits', n); }} />
                <span className="font-label text-xs text-outline uppercase tracking-widest ml-2">Erledigt:</span>
                <EmojiInput value={habit.iconDone} onChange={v => { const n = [...draft.dailyHabits]; n[i] = { ...n[i], iconDone: v }; update('dailyHabits', n); }} />
              </div>
            </div>
          ))}
          <AddBtn label="Gewohnheit hinzufügen" onClick={() => {
            update('dailyHabits', [...draft.dailyHabits, { id: 'habit_' + Date.now(), name: '', icon: '⭐', iconDone: '✅', xp: 5 }]);
          }} />
        </div>
      </SectionCard>

      {/* Recurring Activities */}
      <SectionCard icon="event_repeat" title="Wiederkehrende Aktivitäten"
        subtitle={`${draft.recurringActivities.length} Aktivität${draft.recurringActivities.length !== 1 ? 'en' : ''}`}
        expanded={expandedSection === 'activities'} onToggle={() => toggle('activities')} tint="#124346">
        <div className="space-y-4">
          {draft.recurringActivities.map((act, i) => (
            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{act.icon}</span>
                  <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">
                    {act.name || `Aktivität ${i + 1}`}
                  </span>
                </div>
                <DeleteBtn onClick={() => { const n = [...draft.recurringActivities]; n.splice(i, 1); update('recurringActivities', n); }} />
              </div>
              <div className="flex gap-2">
                <TextInput value={act.name} onChange={v => { const n = [...draft.recurringActivities]; n[i] = { ...n[i], name: v }; update('recurringActivities', n); }} placeholder="z.B. Fußball Training" className="flex-1" />
                <EmojiInput value={act.icon} onChange={v => { const n = [...draft.recurringActivities]; n[i] = { ...n[i], icon: v }; update('recurringActivities', n); }} />
              </div>
              {/* Day picker */}
              <div className="space-y-1.5">
                <span className="font-label text-xs text-outline uppercase tracking-widest">Wochentage:</span>
                <div className="flex gap-1.5">
                  {DAY_LABELS.map((label, dayIdx) => (
                    <button key={dayIdx}
                      onClick={() => {
                        const n = [...draft.recurringActivities];
                        const days = [...(n[i].days || [])];
                        const pos = days.indexOf(dayIdx);
                        if (pos >= 0) days.splice(pos, 1); else days.push(dayIdx);
                        days.sort();
                        n[i] = { ...n[i], days };
                        update('recurringActivities', n);
                      }}
                      className="flex-1 py-2.5 rounded-xl font-label text-xs font-bold transition-all duration-200"
                      style={{
                        background: (act.days || []).includes(dayIdx) ? '#124346' : 'rgba(255,255,255,0.5)',
                        color: (act.days || []).includes(dayIdx) ? '#ffffff' : '#707979',
                        border: (act.days || []).includes(dayIdx) ? 'none' : '1px solid rgba(0,0,0,0.08)',
                        boxShadow: (act.days || []).includes(dayIdx) ? '0 2px 8px rgba(18,67,70,0.2)' : 'none',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <input type="number" min="1" max="50" value={act.xp}
                    onChange={e => { const n = [...draft.recurringActivities]; n[i] = { ...n[i], xp: parseInt(e.target.value) || 5 }; update('recurringActivities', n); }}
                    className="w-16 h-11 px-2 rounded-xl font-body text-on-surface text-sm text-center outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
                  <span className="font-label text-xs text-outline uppercase tracking-widest">XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input type="number" min="0" max="120" value={act.minutes}
                    onChange={e => { const n = [...draft.recurringActivities]; n[i] = { ...n[i], minutes: parseInt(e.target.value) || 0 }; update('recurringActivities', n); }}
                    className="w-16 h-11 px-2 rounded-xl font-body text-on-surface text-sm text-center outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
                  <span className="font-label text-xs text-outline uppercase tracking-widest">Min</span>
                </div>
              </div>
            </div>
          ))}
          <AddBtn label="Aktivität hinzufügen" onClick={() => {
            update('recurringActivities', [...draft.recurringActivities, { id: 'activity_' + Date.now(), name: '', icon: '🏃', days: [], xp: 10, minutes: 10 }]);
          }} />
        </div>
      </SectionCard>

      {/* Parent Message */}
      <SectionCard icon="mail" title="Eltern-Nachricht"
        subtitle={draft.parentMessage.enabled ? draft.parentMessage.title : 'Aus — wird nicht angezeigt'}
        expanded={expandedSection === 'message'} onToggle={() => toggle('message')} tint="#735c00">
        <div className="space-y-4">
          {/* Enable toggle — default off so Hub stays quiet until a parent opts in */}
          <label className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer active:scale-[0.99] transition-all"
                 style={{
                   background: draft.parentMessage.enabled ? 'rgba(252,211,77,0.14)' : 'rgba(0,0,0,0.03)',
                   border: `1.5px solid ${draft.parentMessage.enabled ? 'rgba(217,119,6,0.3)' : 'rgba(0,0,0,0.08)'}`,
                 }}>
            <input
              type="checkbox"
              checked={!!draft.parentMessage.enabled}
              onChange={e => update('parentMessage.enabled', e.target.checked)}
              className="mt-0.5 w-5 h-5 accent-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="font-label font-bold text-sm text-on-surface">Nachricht auf dem Hub zeigen</p>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed mt-0.5">
                Standardmäßig aus. Nur aktivieren, wenn du wirklich etwas sagen willst — sonst bleibt der Hub ruhig.
              </p>
            </div>
          </label>
          <FieldRow label="Titel">
            <TextInput value={draft.parentMessage.title} onChange={v => update('parentMessage.title', v)} placeholder={`z.B. Botschaft für ${state.familyConfig?.childName || 'dein Kind'}`} />
          </FieldRow>
          <FieldRow label="Nachricht">
            <textarea value={draft.parentMessage.body}
              onChange={e => update('parentMessage.body', e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all resize-none"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }}
              placeholder="Eine liebe Nachricht an dein Kind..." />
          </FieldRow>
          <FieldRow label="Unterschrift">
            <TextInput value={draft.parentMessage.signature} onChange={v => update('parentMessage.signature', v)} placeholder="z.B. Mama & Papa lieben dich" />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Motto & Affirmation */}
      <SectionCard icon="auto_awesome" title="Motto & Affirmation"
        subtitle={draft.familyMotto.slice(0, 30) + (draft.familyMotto.length > 30 ? '...' : '')}
        expanded={expandedSection === 'motto'} onToggle={() => toggle('motto')} tint="#124346">
        <div className="space-y-4">
          <FieldRow label="Familien-Motto">
            <TextInput value={draft.familyMotto} onChange={v => update('familyMotto', v)} placeholder="z.B. Zusammen sind wir stark" />
          </FieldRow>
          <FieldRow label="Tägliche Affirmation">
            <TextInput value={draft.affirmation} onChange={v => update('affirmation', v)} placeholder="z.B. Ich bin geliebt, so wie ich bin." />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Save Button — Golden CTA */}
      <button onClick={handleSave}
        className="w-full py-4 rounded-full font-headline font-bold text-base flex items-center justify-center gap-3 active:scale-95 transition-all duration-200"
        style={{
          background: saved ? '#34d399' : '#fcd34d',
          color: saved ? '#ffffff' : '#725b00',
          boxShadow: saved ? '0 8px 24px rgba(52,211,153,0.3)' : '0 8px 24px rgba(252,211,77,0.4)',
        }}>
        <span className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}>
          {saved ? 'check_circle' : 'save'}
        </span>
        {saved ? 'Gespeichert!' : 'Änderungen speichern'}
      </button>

      <div className="h-2" />
    </>
  );
}


// ═══════════════════════════════════════════════════════
// REUSABLE SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

// ── 7-day mood bar chart ──
function MoodHistoryChart({ history, lang }) {
  const DAY_LABELS = lang === 'en' ? DAY_LABELS_EN : DAY_LABELS_DE;
  // Build last-7-days array
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const entry = (history || []).find(e => e.date === iso);
    return {
      label: DAY_LABELS[d.getDay()],
      mood: entry?.mood ?? null,
      iso,
    };
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex items-end gap-1.5 mt-4 h-20">
      {days.map((day, i) => {
        const hasMood = day.mood !== null;
        const barPct = hasMood ? (day.mood + 1) / 6 : 0;
        const color = hasMood ? MOOD_COLORS[day.mood] : 'rgba(18,67,70,0.08)';
        const isToday = day.iso === today;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            {hasMood && (
              <span className="text-xs" title={MOOD_LABELS[day.mood]}>
                {MOOD_EMOJIS[day.mood]}
              </span>
            )}
            {!hasMood && <div className="h-5" />}
            <div className="w-full rounded-t-md transition-all duration-500"
                 style={{
                   height: hasMood ? `${Math.max(barPct * 44, 8)}px` : '4px',
                   background: color,
                   opacity: hasMood ? 1 : 0.4,
                   boxShadow: hasMood ? `0 2px 8px ${color}60` : 'none',
                 }} />
            <span className="font-label text-xs uppercase tracking-widest"
                  style={{ color: isToday ? '#124346' : 'rgba(18,67,70,0.4)', fontWeight: isToday ? 700 : 500, fontSize: '0.6rem' }}>
              {day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SectionLabel({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <h3 className="font-label font-bold text-xs uppercase tracking-widest text-outline">{text}</h3>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="mm-card p-5">
      <p className="font-label font-bold text-xs text-outline uppercase tracking-widest">{label}</p>
      <p className="font-headline font-bold text-3xl text-on-surface mt-1">{value}</p>
      <p className="font-label text-xs text-on-surface-variant mt-1">{sub}</p>
    </div>
  );
}

function SectionCard({ icon, title, subtitle, expanded, onToggle, children, tint = '#124346' }) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
         style={{
           background: '#ffffff',
           border: expanded ? `1.5px solid ${tint}20` : '1.5px solid rgba(0,0,0,0.12)',
           boxShadow: expanded
             ? `0 4px 20px ${tint}12, 0 2px 6px rgba(0,0,0,0.06)`
             : '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
           borderRadius: '1.25rem',
         }}>
      {/* Header */}
      <button onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
             style={{
               background: expanded ? tint : `${tint}12`,
             }}>
          <span className="material-symbols-outlined text-lg transition-colors duration-300"
                style={{
                  color: expanded ? '#ffffff' : tint,
                  fontVariationSettings: "'FILL' 1",
                }}>
            {icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-headline font-bold text-sm text-on-surface">{title}</p>
          <p className="font-label text-xs text-on-surface-variant truncate uppercase tracking-wider">{subtitle}</p>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant/40 text-lg transition-transform duration-300"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
          expand_more
        </span>
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid rgba(18,67,70,0.06)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      className={`w-full h-12 px-4 rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary/10 outline-none transition-all ${className}`}
      style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }}
      placeholder={placeholder} />
  );
}

function EmojiInput({ value, onChange }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      className="w-14 h-12 px-2 rounded-xl text-center text-lg outline-none transition-all"
      style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
  );
}

function ToggleRow({ options, value, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className="flex-1 py-3 rounded-xl font-label text-xs font-bold transition-all duration-200"
          style={{
            background: value === o.v ? '#124346' : 'rgba(255,255,255,0.5)',
            color: value === o.v ? '#ffffff' : '#707979',
            border: value === o.v ? 'none' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: value === o.v ? '0 2px 8px rgba(18,67,70,0.2)' : 'none',
          }}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

function DeleteBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
      style={{ background: 'rgba(186,26,26,0.06)', border: '1px solid rgba(186,26,26,0.1)' }}>
      <span className="material-symbols-outlined text-error text-sm">delete</span>
    </button>
  );
}

function AddBtn({ label, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full py-3.5 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      style={{ background: 'rgba(18,67,70,0.04)', color: '#124346', border: '1.5px dashed rgba(18,67,70,0.15)' }}>
      <span className="material-symbols-outlined text-lg">add</span>
      {label}
    </button>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="font-label text-xs font-bold text-on-surface-variant/60 px-1 block uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SETTINGS TAB (Language Toggle)
// ═══════════════════════════════════════════════════════

function SettingsTab({ lang, setLang, t, actions, state, onOpenFeedback }) {
  const [pinPhase, setPinPhase] = useState(null); // null | 'current' | 'new' | 'confirm'
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState(null); // { ok: bool, text: string }
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [staminaFed, setStaminaFed] = useState(false);
  const stamina = useRonkiStamina();
  const storedPin = () => localStorage.getItem('ronki_pin') || PIN_CODE;

  const handleFeedRonki = () => {
    actions?.restoreStamina?.();
    setStaminaFed(true);
    setTimeout(() => setStaminaFed(false), 1800);
  };

  const handlePinDigit = (d) => {
    const next = pinInput + d;
    setPinMsg(null);
    if (next.length < 4) { setPinInput(next); return; }
    // 4th digit — evaluate
    if (pinPhase === 'current') {
      if (next === storedPin()) {
        setPinPhase('new'); setPinInput('');
      } else {
        setPinMsg({ ok: false, text: 'Falscher PIN' }); setPinInput('');
      }
    } else if (pinPhase === 'new') {
      setNewPin(next); setPinPhase('confirm'); setPinInput('');
    } else if (pinPhase === 'confirm') {
      if (next === newPin) {
        localStorage.setItem('ronki_pin', next);
        setPinMsg({ ok: true, text: 'PIN geändert!' });
        setPinPhase(null); setPinInput(''); setNewPin('');
      } else {
        setPinMsg({ ok: false, text: 'Stimmt nicht überein' }); setPinInput(''); setPinPhase('new');
      }
    }
  };

  const handleResetDay = () => {
    actions?.patchState?.({
      quests: (state?.quests || []).map(q => ({ ...q, done: false })),
      catFed: false,
      catPetted: false,
      catPlayed: false,
      waterIntake: 0,
      moodAM: null,
      moodPM: null,
    });
    setResetDone(true);
    setTimeout(() => { setResetDone(false); setShowResetConfirm(false); }, 1500);
  };

  const pinPrompts = { current: 'Aktuellen PIN eingeben', new: 'Neuen PIN wählen (4 Ziffern)', confirm: 'PIN wiederholen' };

  // Funkelzeit mode state removed in cut #6 (25 Apr 2026).

  // ── Zähneputzen-Modus (tooth-brush UI mode) ──
  const tbMode = state?.familyConfig?.toothBrushDefaultMode || 'tasche';
  const setTbMode = (next) => {
    const config = state?.familyConfig || DEFAULT_FAMILY_CONFIG;
    actions?.updateFamilyConfig?.({ ...config, toothBrushDefaultMode: next });
  };
  const TB_MODES = [
    { id: 'tasche', emoji: '📱', label: 'Tasche (empfohlen)', desc: 'Handy weglegen, Ronki meldet sich.' },
    { id: 'schau',  emoji: '🦷', label: 'Schau-Modus',        desc: 'Illustrierter Guide mit Zonen-Bildern.' },
  ];

  // ── Voice-Lines mute toggle (Ronki, Harry voice) ──
  const [voiceMuted, setVoiceMutedState] = useState(VoiceAudio.isMuted());
  const toggleVoiceMute = (next) => {
    VoiceAudio.setMuted(next);
    setVoiceMutedState(next);
  };
  // Drachenmutter narrator removed Apr 27 2026 (Marc: "Ronki's voice
  // only"). The toggle + state hook are gone; readNarratorMuted is
  // hard-true at the source. Audio files stay in public/audio/narrator/
  // as historical assets; playNarrator(...) is a no-op everywhere.

  // ── Profil & Geräte (QR auth Phase 1) ──
  // Apr 27 2026: BeyArena-pattern profile token. Phase 1 = display +
  // share the URL/code so parent can sync between devices via the
  // built-in URL. Phase 2 (deferred): Supabase profiles table for
  // cross-device cloud-load by token, QR rendering, PDF print, camera
  // scan flow. See docs/specs/qr-profile-auth.md.
  const [profileToken, setProfileTokenState] = useState(() => getActiveToken());
  const [shareCopied, setShareCopied] = useState(false);
  const handleShareLink = async () => {
    if (!profileToken) return;
    const url = buildShareUrl(profileToken);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Ronki — euer Profil', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2400);
    } catch { /* user cancelled / clipboard blocked — silent */ }
  };
  const handleResetToken = () => {
    if (!confirm('Neues Profil anlegen? Der alte QR-Code funktioniert dann nicht mehr.')) return;
    const fresh = generateToken();
    setActiveToken(fresh);
    setProfileTokenState(fresh);
  };
  // ── QR rendering (Phase 2 Apr 27 2026) ──
  // Two canvases: one inline (compact, dashboard view) and one
  // print-only (large, ~50mm box, prints with print stylesheet
  // below). Both encode the share URL as a Level-M QR with a generous
  // margin so phone cameras catch it cleanly even at 30mm screen size.
  const qrCanvasRef = useRef(null);
  const qrPrintCanvasRef = useRef(null);
  useEffect(() => {
    if (!profileToken) return;
    const url = buildShareUrl(profileToken);
    // Inline canvas (compact)
    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 168,
        color: { dark: '#0c4a6e', light: '#ffffff' },
      }).catch(() => { /* canvas not ready yet — next render handles it */ });
    }
    // Print-only canvas (large, dark navy on white for print contrast)
    if (qrPrintCanvasRef.current) {
      QRCode.toCanvas(qrPrintCanvasRef.current, url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 360,
        color: { dark: '#000000', light: '#ffffff' },
      }).catch(() => { /* same — silent */ });
    }
  }, [profileToken]);
  const handlePrintQR = () => {
    // Trigger native print dialog. Print stylesheet (in index.css)
    // hides everything except #qr-print-card. The kid + parent end up
    // with an A6-friendly card with the QR + 8-char code that can be
    // taped inside a wallet, fridge, school binder.
    try { window.print(); } catch { /* unsupported — silent */ }
  };
  // ── Background music toggle ──
  // Off by default. When on, a soft cave-ambient pad plays under the
  // app and ducks during voicelines. Currently driven by an in-code
  // synthesizer placeholder until Marc picks a real mp3 — see
  // docs/voice/voice-music-engine.md.
  const [musicOn, setMusicOnState] = useState(BackgroundMusic.isEnabled());
  const toggleMusic = (next) => {
    BackgroundMusic.setEnabled(next);
    setMusicOnState(next);
  };

  // ── Haptics (three-state: off / gentle / normal) — 'gentle' is the
  //    default for age 6 (halved pulse durations, widened pauses).
  //    Research backbone in memory/Onboarding cross-browser churn audit. ──
  const hapticsEnabled = state?.hapticsEnabled !== false;
  const hapticsMode = state?.hapticsMode || 'gentle';
  const setHapticsState = (enabled, mode) => {
    actions?.patchState?.({ hapticsEnabled: enabled, hapticsMode: mode });
  };

  // ── Analytics consent (default true with first-run disclosure) ──
  const analyticsEnabled = state?.analyticsEnabled !== false;
  const toggleAnalytics = (next) => {
    actions?.patchState?.({ analyticsEnabled: next });
  };

  // ── RPG-Modus (dormant feature for older-cohort expansion) — default
  //    off. When enabled, surfaces the boss mechanic with HP rewards
  //    and combat UI for a different, more RPG-flavored experience
  //    under the same Ronki umbrella. Parent-opt-in, off by default. ──
  const rpgModeEnabled = state?.rpgModeEnabled === true;
  const toggleRpgMode = (next) => {
    actions?.patchState?.({ rpgModeEnabled: next });
  };

  // ── Default-PIN warning banner — surfaces until parent customizes ──
  const showDefaultPinBanner = state?.parentPinIsDefault !== false;

  // ── Minigame access mode (22 Apr 2026 playtest rework) ──
  // Default flipped to 'frei' from routine-gated. Reasoning in
  // backlog: routine-gate backfired on weekends (Louis hit an invisible
  // wall). Parents who want the gate opt IN here.
  const minigameMode = state?.minigameAccessMode || 'frei';
  const minigameStaminaMax = state?.minigameStaminaMax ?? 10;
  const minigameTimeWindow = state?.minigameTimeWindow || { startHour: 16, endHour: 18 };
  const setMinigameMode = (next) => {
    actions?.patchState?.({ minigameAccessMode: next });
  };
  const setMinigameStaminaMax = (next) => {
    // Clamp stamina to the new max so a parent lowering 15→5 doesn't leave
    // Louis sitting on 12 impossible points.
    const currentStamina = Math.min(state?.ronkiStamina ?? next, next);
    actions?.patchState?.({
      minigameStaminaMax: next,
      ronkiStamina: currentStamina,
    });
  };
  const setMinigameTimeWindow = (next) => {
    actions?.patchState?.({ minigameTimeWindow: next });
  };

  const MINIGAME_MODES = [
    { id: 'frei', label: 'Frei', desc: 'Immer offen. Ihr entscheidet außerhalb der App, wann gespielt wird.' },
    { id: 'routine', label: 'Mit Routine verbunden', desc: 'Spielzimmer öffnet, wenn die heutige Routine fertig ist.' },
    { id: 'zeitfenster', label: 'Zeitfenster', desc: `Offen von ${String(minigameTimeWindow.startHour).padStart(2, '0')}:00 bis ${String(minigameTimeWindow.endHour).padStart(2, '0')}:00 Uhr.` },
  ];
  const STAMINA_OPTIONS = [
    { value: 5, label: 'Streng', desc: '5 Runden/Tag' },
    { value: 10, label: 'Normal', desc: '10 Runden/Tag' },
    { value: 15, label: 'Locker', desc: '15 Runden/Tag' },
  ];

  // ── Zeig-Moment toggle + counter reset ──
  // Default is OFF now (Marc Apr 2026: "rather annoying" out-of-the-box).
  // Parents opt IN and pick which ONE grown-up vouches. Single-vouch
  // keeps the moment simple — Louis shows ONE parent, not both.
  const zmEnabled = state?.familyConfig?.zeigMomentEnabled === true;
  const zmParent = state?.familyConfig?.zeigMomentParent === 'papa' ? 'papa' : 'mama';
  const zmCounts = state?.zeigMomentCounts || {};
  const setZmEnabled = (next) => {
    const config = state?.familyConfig || DEFAULT_FAMILY_CONFIG;
    actions?.updateFamilyConfig?.({ ...config, zeigMomentEnabled: next });
  };
  const setZmParent = (next) => {
    const config = state?.familyConfig || DEFAULT_FAMILY_CONFIG;
    actions?.updateFamilyConfig?.({ ...config, zeigMomentParent: next });
  };
  const resetZmCounts = () => {
    actions?.patchState?.({
      zeigMomentCounts: { morning: 0, evening: 0, bedtime: 0 },
      zeigMomentShownDates: {},
    });
  };

  return (
    <>
      {/* Default-PIN warning banner — shows until parent customizes.
           Yellow accent, low-intensity "nudge" tone; parent can ignore
           and keep 1234 but it doesn't fade until they act. */}
      {showDefaultPinBanner && (
        <div
          role="status"
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
            border: '1.5px solid rgba(234,179,8,0.45)',
            boxShadow: '0 2px 8px rgba(234,179,8,0.12)',
          }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'rgba(234,179,8,0.25)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#854d0e', fontVariationSettings: "'FILL' 1" }}>key</span>
          </div>
          <div className="flex-1">
            <p className="font-label font-bold text-sm" style={{ color: '#713f12' }}>
              PIN ist noch 1234
            </p>
            <p className="font-body text-xs mt-0.5 leading-relaxed" style={{ color: '#854d0e' }}>
              Setze einen eigenen PIN, damit dein Kind den Eltern-Bereich nicht zufällig öffnet. Unten unter „Eltern-PIN".
            </p>
          </div>
        </div>
      )}

      {/* Funkelzeit settings + Verlauf removed in cut #6 (25 Apr 2026
          northstar — Funkelzeit feature deleted entirely). */}

      {/* Zähneputzen-Modus */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(14,165,233,0.12)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#0369a1', fontVariationSettings: "'FILL' 1" }}>brush</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">Zähneputzen-Modus</p>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
          Tasche: Handy weglegen, Ronki meldet sich. Schau-Modus: Illustrierter Guide mit Zonen-Bildern.
        </p>
        <div className="flex flex-col gap-2.5">
          {TB_MODES.map(m => {
            const active = tbMode === m.id;
            return (
              <button key={m.id}
                onClick={() => setTbMode(m.id)}
                className="w-full flex items-start gap-3 p-4 rounded-2xl text-left active:scale-[0.98] transition-all"
                style={{
                  background: active ? 'rgba(14,165,233,0.08)' : 'rgba(255,255,255,0.6)',
                  border: active ? '1.5px solid rgba(14,165,233,0.35)' : '1.5px solid rgba(0,0,0,0.08)',
                  boxShadow: active ? '0 3px 12px rgba(14,165,233,0.12)' : 'none',
                }}
              >
                <span className="text-2xl mt-0.5" aria-hidden="true">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-label font-bold text-sm text-on-surface">{m.label}</p>
                    {active && (
                      <span className="material-symbols-outlined text-sm"
                            style={{ color: '#0369a1', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </div>
                  <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zeig-Moment */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(252,211,77,0.18)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#a16207', fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">Zeig-Moment</p>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
          Nach jeder Routine erinnert Ronki {state.familyConfig?.childName || 'dein Kind'} daran, <strong>einer</strong> Bezugsperson zu zeigen, was er geschafft hat. Nach 14 Mal pro Block verblasst die Erinnerung. Standardmäßig aus — viele Familien finden's am Anfang zu viel.
        </p>
        <div className="flex items-center justify-between mb-4 p-4 rounded-2xl"
             style={{ background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(161,98,7,0.15)' }}>
          <div>
            <p className="font-label font-bold text-sm text-on-surface">{zmEnabled ? 'An' : 'Aus'}</p>
            <p className="font-label text-xs text-on-surface-variant mt-0.5">
              Morgen {zmCounts.morning || 0}/14 · Nachmittag {zmCounts.evening || 0}/14 · Abend {zmCounts.bedtime || 0}/14
            </p>
          </div>
          <button
            onClick={() => setZmEnabled(!zmEnabled)}
            className="relative w-14 h-8 rounded-full transition-all active:scale-95"
            style={{
              background: zmEnabled ? '#fcd34d' : 'rgba(0,0,0,0.12)',
              boxShadow: zmEnabled ? '0 2px 8px rgba(252,211,77,0.35)' : 'none',
            }}
            aria-label={zmEnabled ? 'Zeig-Moment ausschalten' : 'Zeig-Moment einschalten'}
          >
            <span className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform"
                  style={{ transform: zmEnabled ? 'translateX(24px)' : 'translateX(0)' }} />
          </button>
        </div>

        {/* Single-parent vouch picker — only shown when Zeig-Moment is ON.
            Kept intentionally simple: radio between Mama and Papa. Only
            one vouches per cheer moment, never both. */}
        {zmEnabled && (
          <div className="mb-4">
            <p className="font-label font-bold text-xs text-on-surface-variant uppercase tracking-wide mb-2">
              Wem zeigt {state.familyConfig?.childName || 'dein Kind'}?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'mama', label: 'Mama', emoji: '👩' },
                { id: 'papa', label: 'Papa', emoji: '👨' },
              ].map((opt) => {
                const active = zmParent === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setZmParent(opt.id)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-label font-bold text-sm active:scale-[0.98] transition-all"
                    style={{
                      background: active ? 'rgba(252,211,77,0.18)' : 'rgba(255,255,255,0.6)',
                      border: active ? '1.5px solid rgba(252,211,77,0.6)' : '1.5px solid rgba(0,0,0,0.08)',
                      color: active ? '#92400e' : '#124346',
                      boxShadow: active ? '0 2px 8px rgba(252,211,77,0.2)' : 'none',
                    }}
                    aria-pressed={active}
                  >
                    <span className="text-base" aria-hidden="true">{opt.emoji}</span>
                    {opt.label}
                    {active && (
                      <span className="material-symbols-outlined text-sm"
                            style={{ color: '#92400e', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="font-label text-xs text-on-surface-variant mt-2 leading-relaxed">
              Nur <strong>eine</strong> Bezugsperson bestätigt pro Cheer-Moment — nicht beide.
            </p>
          </div>
        )}

        <button
          onClick={resetZmCounts}
          className="w-full py-3 rounded-xl font-label font-bold text-sm active:scale-[0.98] transition-all"
          style={{ background: 'rgba(18,67,70,0.05)', color: '#124346', border: '1.5px solid rgba(18,67,70,0.1)' }}
        >
          Zähler zurücksetzen (Lernphase neu starten)
        </button>
      </div>

      {/* Minispiele — access mode + stamina cap + optional time window */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(245,158,11,0.14)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#A83E2C', fontVariationSettings: "'FILL' 1" }}>sports_esports</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">Minispiele</p>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
          Wann darf dein Kind Ronkis Spielzimmer öffnen?
        </p>
        <div className="flex flex-col gap-2.5 mb-4">
          {MINIGAME_MODES.map(m => {
            const active = minigameMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMinigameMode(m.id)}
                className="w-full flex items-start gap-3 p-4 rounded-2xl text-left active:scale-[0.98] transition-all"
                style={{
                  background: active ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.6)',
                  border: active ? '1.5px solid rgba(180,83,9,0.4)' : '1.5px solid rgba(0,0,0,0.08)',
                }}
              >
                <div className="w-5 h-5 rounded-full mt-0.5 shrink-0 flex items-center justify-center"
                     style={{
                       background: active ? '#A83E2C' : 'transparent',
                       border: active ? 'none' : '2px solid rgba(0,0,0,0.2)',
                     }}>
                  {active && <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>check</span>}
                </div>
                <div className="flex-1">
                  <p className="font-label font-bold text-sm text-on-surface">{m.label}</p>
                  <p className="font-body text-xs text-on-surface-variant mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Time-window picker — only visible in zeitfenster mode */}
        {minigameMode === 'zeitfenster' && (
          <div className="mb-4 p-4 rounded-2xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(180,83,9,0.18)' }}>
            <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              Zeitfenster
            </p>
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <span className="font-label text-xs text-on-surface-variant block mb-1">Von</span>
                <select
                  value={minigameTimeWindow.startHour}
                  onChange={(e) => setMinigameTimeWindow({ ...minigameTimeWindow, startHour: parseInt(e.target.value, 10) })}
                  className="w-full py-2 px-3 rounded-xl font-label text-sm bg-white"
                  style={{ border: '1.5px solid rgba(0,0,0,0.1)' }}
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </label>
              <label className="flex-1">
                <span className="font-label text-xs text-on-surface-variant block mb-1">Bis</span>
                <select
                  value={minigameTimeWindow.endHour}
                  onChange={(e) => setMinigameTimeWindow({ ...minigameTimeWindow, endHour: parseInt(e.target.value, 10) })}
                  className="w-full py-2 px-3 rounded-xl font-label text-sm bg-white"
                  style={{ border: '1.5px solid rgba(0,0,0,0.1)' }}
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h} disabled={h <= minigameTimeWindow.startHour}>{String(h).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {/* Stamina cap — hidden in 'frei' because stamina is disabled there */}
        {minigameMode !== 'frei' && (
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              Ausdauer pro Tag
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STAMINA_OPTIONS.map(opt => {
                const active = minigameStaminaMax === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setMinigameStaminaMax(opt.value)}
                    className="p-3 rounded-xl text-center active:scale-[0.97] transition-all"
                    style={{
                      background: active ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.6)',
                      border: active ? '1.5px solid rgba(180,83,9,0.4)' : '1.5px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <p className="font-label font-bold text-sm" style={{ color: active ? '#A83E2C' : '#124346' }}>{opt.label}</p>
                    <p className="font-label text-xs text-on-surface-variant mt-1">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
            <p className="font-body text-xs text-on-surface-variant mt-3 leading-relaxed">
              Ausdauer füllt sich automatisch wieder auf (alle 20 Minuten +1).
            </p>
          </div>
        )}
      </div>

      {/* Haptik — three-state (Aus / Sanft / Normal). Default Sanft for
           age 6 per research. Sanft = halved pulses, widened pauses so
           the kid feels confirmation without startle. Normal = full
           Apple-style transients (10-30ms). Aus = completely silent. */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(236,72,153,0.12)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#be185d', fontVariationSettings: "'FILL' 1" }}>vibration</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">Haptik</p>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
          Leichtes Vibrieren zur Bestätigung von Taps und Erfolgen. iOS Safari unterstützt dies nur eingeschränkt.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'off', label: 'Aus', desc: 'Keine Vibration', enabled: false, mode: 'gentle' },
            { id: 'gentle', label: 'Sanft', desc: 'Für kleine Kinder', enabled: true, mode: 'gentle' },
            { id: 'normal', label: 'Normal', desc: 'Volle Stärke', enabled: true, mode: 'normal' },
          ].map(opt => {
            const active = opt.id === 'off' ? !hapticsEnabled : (hapticsEnabled && hapticsMode === opt.mode);
            return (
              <button
                key={opt.id}
                onClick={() => setHapticsState(opt.enabled, opt.mode)}
                className="p-3 rounded-xl text-center active:scale-[0.97] transition-all"
                style={{
                  background: active ? 'rgba(236,72,153,0.1)' : 'rgba(255,255,255,0.6)',
                  border: active ? '1.5px solid rgba(190,24,93,0.4)' : '1.5px solid rgba(0,0,0,0.08)',
                }}
              >
                <p className="font-label font-bold text-sm" style={{ color: active ? '#be185d' : '#124346' }}>{opt.label}</p>
                <p className="font-label text-xs text-on-surface-variant mt-1">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* RPG-Modus — parent-opt-in for older kids. When off (default),
           Ronki runs the calm routine+care loop. When on, surfaces the
           dormant boss mechanic with HP rewards for a more challenge-
           flavored experience. Positioned as "for older kids" so parents
           read the tradeoff before flipping. */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(168,85,247,0.12)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#7e22ce', fontVariationSettings: "'FILL' 1" }}>swords</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">RPG-Modus</p>
          <span className="ml-auto font-label text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(168,85,247,0.12)', color: '#7e22ce' }}>
            Ältere Kinder
          </span>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
          Aktiviert Bosse und Herausforderungen. Für ältere Kinder, die mehr Abenteuer wollen. Standard-Modus ist Routine + Pflege.
        </p>
        <div className="flex items-center justify-between p-4 rounded-2xl"
             style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <div>
            <p className="font-label font-bold text-sm text-on-surface">{rpgModeEnabled ? 'An' : 'Aus'}</p>
            <p className="font-label text-xs text-on-surface-variant mt-0.5">
              {rpgModeEnabled ? 'Bosse sichtbar, Belohnungen aktiv.' : 'Ruhiger Alltags-Modus.'}
            </p>
          </div>
          <button
            onClick={() => toggleRpgMode(!rpgModeEnabled)}
            className="relative w-14 h-8 rounded-full transition-all active:scale-95"
            style={{
              background: rpgModeEnabled ? '#7e22ce' : 'rgba(0,0,0,0.12)',
              boxShadow: rpgModeEnabled ? '0 2px 8px rgba(126,34,206,0.35)' : 'none',
            }}
            aria-label={rpgModeEnabled ? 'RPG-Modus deaktivieren' : 'RPG-Modus aktivieren'}
          >
            <span className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform"
                  style={{ transform: rpgModeEnabled ? 'translateX(24px)' : 'translateX(0)' }} />
          </button>
        </div>
      </div>

      {/* Analytics — opt-out of anonymous usage telemetry. Default ON
           with first-run disclosure in Track A. No content ever leaves
           the device (event names + enum props only — hard allowlist
           in src/lib/analytics.ts). */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(59,130,246,0.12)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#1d4ed8', fontVariationSettings: "'FILL' 1" }}>analytics</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">Nutzungsstatistiken</p>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
          Ronki sendet anonyme Ereignisse (z.B. „Quest fertig"), damit wir die App verbessern können. Keine Namen, keine Texte, kein Standort.
        </p>
        <div className="flex items-center justify-between p-4 rounded-2xl"
             style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div>
            <p className="font-label font-bold text-sm text-on-surface">{analyticsEnabled ? 'An' : 'Aus'}</p>
            <p className="font-label text-xs text-on-surface-variant mt-0.5">
              {analyticsEnabled ? 'Anonyme Statistiken aktiv.' : 'Keine Daten werden gesendet.'}
            </p>
          </div>
          <button
            onClick={() => toggleAnalytics(!analyticsEnabled)}
            className="relative w-14 h-8 rounded-full transition-all active:scale-95"
            style={{
              background: analyticsEnabled ? '#1d4ed8' : 'rgba(0,0,0,0.12)',
              boxShadow: analyticsEnabled ? '0 2px 8px rgba(29,78,216,0.35)' : 'none',
            }}
            aria-label={analyticsEnabled ? 'Nutzungsstatistiken deaktivieren' : 'Nutzungsstatistiken aktivieren'}
          >
            <span className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform"
                  style={{ transform: analyticsEnabled ? 'translateX(24px)' : 'translateX(0)' }} />
          </button>
        </div>
      </div>

      {/* Stimmen — Ronki + Drachenmutter audio toggles. Both default to ON
          since the 2026-04-27 voice ship (Harry as Ronki, Charlotte as
          Drachenmutter). Parent can mute either independently. */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(109,40,217,0.12)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#6d28d9', fontVariationSettings: "'FILL' 1" }}>
              {voiceMuted ? 'volume_off' : 'volume_up'}
            </span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">Stimmen</p>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
          Ronki spricht selten und kurz — beim Kennenlernen, bei Abenteuern, vor dem Schlafen.
        </p>

        {/* Ronki toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl mb-3"
             style={{ background: 'rgba(109,40,217,0.06)', border: '1px solid rgba(109,40,217,0.15)' }}>
          <div className="flex-1">
            <p className="font-label font-bold text-sm text-on-surface">Ronki</p>
            <p className="font-label text-xs text-on-surface-variant mt-0.5">
              {voiceMuted ? 'Stumm' : 'An — Kommentare zu Stimmung, Wetter, Aufgaben.'}
            </p>
          </div>
          <button
            onClick={() => toggleVoiceMute(!voiceMuted)}
            className="relative w-14 h-8 rounded-full transition-all active:scale-95 shrink-0"
            style={{
              background: !voiceMuted ? '#6d28d9' : 'rgba(0,0,0,0.12)',
              boxShadow: !voiceMuted ? '0 2px 8px rgba(109,40,217,0.35)' : 'none',
            }}
            aria-label={voiceMuted ? 'Ronkis Stimme einschalten' : 'Ronkis Stimme stumm schalten'}
          >
            <span className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform"
                  style={{ transform: !voiceMuted ? 'translateX(24px)' : 'translateX(0)' }} />
          </button>
        </div>

        {/* Drachenmutter toggle removed Apr 27 — Ronki is the only
            voice now. */}

        {/* Hintergrundmusik toggle — soft cave-ambient pad. Currently
            an in-code synth placeholder; swaps to a real mp3 once Marc
            picks one (see docs/voice/voice-music-engine.md). Ducks during
            any voiceline. */}
        <div className="flex items-center justify-between p-4 rounded-2xl"
             style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.20)' }}>
          <div className="flex-1">
            <p className="font-label font-bold text-sm text-on-surface">Hintergrundmusik</p>
            <p className="font-label text-xs text-on-surface-variant mt-0.5">
              {musicOn ? 'An — leise unter der App, leiser bei Stimmen.' : 'Aus'}
            </p>
          </div>
          <button
            onClick={() => toggleMusic(!musicOn)}
            className="relative w-14 h-8 rounded-full transition-all active:scale-95 shrink-0"
            style={{
              background: musicOn ? '#0ea5e9' : 'rgba(0,0,0,0.12)',
              boxShadow: musicOn ? '0 2px 8px rgba(14,165,233,0.35)' : 'none',
            }}
            aria-label={musicOn ? 'Hintergrundmusik aus' : 'Hintergrundmusik an'}
          >
            <span className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform"
                  style={{ transform: musicOn ? 'translateX(24px)' : 'translateX(0)' }} />
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          {t('parent.lang.title')}
        </p>
        <div className="flex gap-3">
          {[{ code: 'de', flag: '🇩🇪', label: 'Deutsch' }, { code: 'en', flag: '🇬🇧', label: 'English' }].map(opt => (
            <button key={opt.code} onClick={() => setLang(opt.code)}
              className="flex-1 py-3.5 rounded-2xl font-headline font-bold text-base flex items-center justify-center gap-2 transition-all"
              style={{
                background: lang === opt.code ? '#124346' : 'rgba(18,67,70,0.05)',
                color: lang === opt.code ? '#ffffff' : '#124346',
                border: lang === opt.code ? '2px solid #124346' : '2px solid rgba(18,67,70,0.1)',
                boxShadow: lang === opt.code ? '0 4px 16px rgba(18,67,70,0.2)' : 'none',
              }}>
              <span className="text-xl">{opt.flag}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profil & Geräte — QR auth Phase 2 (QR canvas + share + print) */}
      {profileToken && (
        <div className="rounded-2xl p-5"
             style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(14,165,233,0.12)' }}>
              <span className="material-symbols-outlined text-lg" style={{ color: '#0369a1', fontVariationSettings: "'FILL' 1" }}>devices</span>
            </div>
            <p className="font-label font-bold text-sm text-on-surface">Profil &amp; Geräte</p>
          </div>
          <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
            Auf neuem Gerät? Scannt den QR-Code, druckt ihn als Karte aus oder teilt den Link — Ronki begrüßt euch dort wieder mit denselben Sternen.
          </p>

          {/* QR canvas — primary affordance */}
          <div className="flex flex-col items-center p-4 rounded-2xl mb-3"
               style={{ background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.18)' }}>
            <canvas
              ref={qrCanvasRef}
              className="rounded-lg"
              style={{ width: 168, height: 168, background: '#ffffff' }}
              aria-label="QR-Code zum Verbinden eines weiteren Geräts"
            />
            <p className="font-label font-bold text-xs uppercase tracking-[0.10em] mt-3" style={{ color: '#0369a1' }}>
              Profil-Code
            </p>
            <p className="font-headline font-bold text-2xl tracking-widest mt-0.5" style={{ color: '#0c4a6e', fontFamily: 'Fredoka, sans-serif' }}>
              {tokenDisplayFragment(profileToken)}
            </p>
          </div>

          {/* Share + Print row */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={handleShareLink}
              className="py-3 rounded-full font-label font-bold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              style={{
                background: shareCopied ? 'rgba(52,211,153,0.18)' : '#0ea5e9',
                color: shareCopied ? '#047857' : 'white',
                border: shareCopied ? '1.5px solid rgba(52,211,153,0.45)' : 'none',
                boxShadow: shareCopied ? 'none' : '0 4px 12px rgba(14,165,233,0.35)',
                minHeight: 44,
              }}
              aria-label="Profil-Link teilen"
            >
              <span className="material-symbols-outlined text-base">{shareCopied ? 'check' : 'ios_share'}</span>
              {shareCopied ? 'Kopiert' : 'Teilen'}
            </button>
            <button
              onClick={handlePrintQR}
              className="py-3 rounded-full font-label font-bold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              style={{
                background: 'rgba(14,165,233,0.10)',
                color: '#0369a1',
                border: '1.5px solid rgba(14,165,233,0.30)',
                minHeight: 44,
              }}
              aria-label="QR-Code als Karte drucken"
            >
              <span className="material-symbols-outlined text-base">print</span>
              Drucken
            </button>
          </div>

          <button
            onClick={handleResetToken}
            className="w-full text-left px-4 py-3 rounded-xl font-label text-sm active:scale-[0.99] transition-transform"
            style={{
              background: 'transparent',
              color: '#dc2626',
              border: '1px solid rgba(220,38,38,0.20)',
            }}
          >
            Neues Profil anlegen (alten Code ungültig machen)
          </button>
        </div>
      )}

      {/* Print-only QR card — PORTALED TO body so it sits as a direct
          child of <body> for the print stylesheet's
          `body > *:not(#qr-print-card) { display: none }` selector to
          isolate just this card on the printed page. Without the
          portal, the card would be a deeply-nested descendant of
          #root and the body-level rule would hide its ancestors,
          taking the card with them. Layout fits A6 portrait (folded
          card, fridge magnet, school binder). */}
      {profileToken && typeof document !== 'undefined' && createPortal(
        <div id="qr-print-card" aria-hidden="true">
          <div className="qr-print-inner">
            <p className="qr-print-eyebrow">Ronki</p>
            <h2 className="qr-print-name">{state?.heroName || state?.familyConfig?.childName || 'Mein Profil'}</h2>
            <canvas
              ref={qrPrintCanvasRef}
              className="qr-print-canvas"
            />
            <p className="qr-print-code">{tokenDisplayFragment(profileToken)}</p>
            <p className="qr-print-hint">Scannt den Code, um Ronki auf einem anderen Gerät zu öffnen.</p>
            <p className="qr-print-url">app.ronki.de</p>
          </div>
        </div>,
        document.body,
      )}

      {/* PIN Change */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(18,67,70,0.08)' }}>
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">PIN ändern</p>
        </div>

        {pinPhase === null ? (
          <>
            {pinMsg && (
              <p className="font-label text-sm font-bold mb-3 flex items-center gap-1.5"
                 style={{ color: pinMsg.ok ? '#059669' : '#ba1a1a' }}>
                <span className="material-symbols-outlined text-sm">{pinMsg.ok ? 'check_circle' : 'error'}</span>
                {pinMsg.text}
              </p>
            )}
            <button onClick={() => { setPinPhase('current'); setPinInput(''); setPinMsg(null); }}
              className="w-full py-3 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: 'rgba(18,67,70,0.06)', color: '#124346', border: '1.5px solid rgba(18,67,70,0.12)' }}>
              <span className="material-symbols-outlined text-base">key</span>
              PIN jetzt ändern
            </button>
          </>
        ) : (
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              {pinPrompts[pinPhase]}
            </p>
            {/* PIN dots */}
            <div className="flex gap-3 mb-4 justify-center">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-3.5 h-3.5 rounded-full transition-all duration-200"
                     style={{ background: i < pinInput.length ? '#124346' : 'rgba(18,67,70,0.12)', transform: i < pinInput.length ? 'scale(1.2)' : 'scale(1)' }} />
              ))}
            </div>
            {pinMsg && <p className="font-label text-xs text-error mb-2 text-center">{pinMsg.text}</p>}
            {/* Mini numpad */}
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6,7,8,9,null,0,'del'].map((d, i) => {
                if (d === null) return <div key={i} />;
                if (d === 'del') return (
                  <button key={i} onClick={() => setPinInput(p => p.slice(0, -1))}
                    className="h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                    style={{ background: 'rgba(18,67,70,0.05)', border: '1px solid rgba(18,67,70,0.08)' }}>
                    <span className="material-symbols-outlined text-on-surface-variant text-base">backspace</span>
                  </button>
                );
                return (
                  <button key={i} onClick={() => handlePinDigit(String(d))}
                    className="h-12 rounded-xl font-headline font-bold text-xl text-on-surface flex items-center justify-center active:scale-95 transition-all"
                    style={{ background: 'rgba(18,67,70,0.05)', border: '1px solid rgba(18,67,70,0.08)' }}>
                    {d}
                  </button>
                );
              })}
            </div>
            <button onClick={() => { setPinPhase(null); setPinInput(''); setNewPin(''); }}
              className="w-full mt-3 py-2 font-label text-xs text-on-surface-variant active:opacity-70">
              Abbrechen
            </button>
          </div>
        )}
      </div>

      {/* Feedback */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(252,211,77,0.18)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#a16207', fontVariationSettings: "'FILL' 1" }}>forum</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">Feedback an Marc</p>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
          Bug, Idee oder was komisch war? Schreib's auf — kommt direkt zu mir.
        </p>
        <button onClick={onOpenFeedback}
          className="w-full py-3 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 4px 14px rgba(252,211,77,0.35)' }}>
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
          Feedback senden
        </button>
      </div>

      {/* Ronki füttern — restores stamina manually (only shown when < 5) */}
      {stamina.current < stamina.max && (
        <div className="rounded-2xl p-5"
             style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(252,211,77,0.18)' }}>
              <span className="material-symbols-outlined text-lg" style={{ color: '#a16207', fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <p className="font-label font-bold text-sm text-on-surface">Ronki füttern</p>
          </div>
          <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
            Setzt Ronkis Energie auf 5 zurück. Für Belohnungstage.
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Energie:</span>
            <div className="flex gap-1">
              {[0,1,2,3,4].map(i => (
                <span key={i} className="text-sm select-none"
                      style={{ filter: i < stamina.current ? 'none' : 'grayscale(1) opacity(0.35)' }}>
                  ⚡
                </span>
              ))}
            </div>
            <span className="font-label font-bold text-xs text-on-surface ml-1">{stamina.current}/{stamina.max}</span>
          </div>
          {staminaFed ? (
            <div className="flex items-center justify-center gap-2 py-3">
              <span className="material-symbols-outlined text-lg" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label font-bold text-sm" style={{ color: '#059669' }}>Ronki ist wieder fit!</span>
            </div>
          ) : (
            <button onClick={handleFeedRonki}
              className="w-full py-3 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 4px 14px rgba(252,211,77,0.35)' }}>
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Ronki füttern (+Energie)
            </button>
          )}
        </div>
      )}

      {/* Reset */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(186,26,26,0.06)' }}>
            <span className="material-symbols-outlined text-error text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>restart_alt</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">Tag zurücksetzen</p>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
          Setzt alle heutigen Aufgaben zurück, ohne Sterne oder Gesamtfortschritt zu löschen.
        </p>
        {!showResetConfirm ? (
          <button onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 rounded-xl font-label font-bold text-sm transition-all active:scale-[0.98]"
            style={{ background: 'rgba(186,26,26,0.06)', color: '#ba1a1a', border: '1.5px solid rgba(186,26,26,0.12)' }}>
            Tag zurücksetzen
          </button>
        ) : resetDone ? (
          <div className="flex items-center justify-center gap-2 py-3">
            <span className="material-symbols-outlined text-lg" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-label font-bold text-sm" style={{ color: '#059669' }}>Zurückgesetzt!</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-3 rounded-xl font-label font-bold text-sm transition-all active:scale-[0.98]"
              style={{ background: 'rgba(18,67,70,0.05)', color: '#124346', border: '1.5px solid rgba(18,67,70,0.1)' }}>
              Abbrechen
            </button>
            <button onClick={handleResetDay}
              className="flex-1 py-3 rounded-xl font-label font-bold text-sm transition-all active:scale-[0.98]"
              style={{ background: '#ba1a1a', color: 'white' }}>
              Ja, zurücksetzen
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// FUNKELZEIT-VERLAUF CARD
// ═══════════════════════════════════════════════════════

/** Relative-day label for recent dates, full date for older ones. */
function formatLogDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yd = new Date(now); yd.setDate(yd.getDate() - 1);
  const isYesterday = d.toDateString() === yd.toDateString();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (sameDay) return `Heute ${hh}:${mm}`;
  if (isYesterday) return `Gestern ${hh}:${mm}`;
  const day = d.getDate();
  const month = d.toLocaleDateString('de-DE', { month: 'long' });
  return `${day}. ${month} ${hh}:${mm}`;
}

// FunkelzeitVerlaufCard deleted in cut #6 (25 Apr 2026 — Funkelzeit
// removal). The dashboard no longer renders this section.
