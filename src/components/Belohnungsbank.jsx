import React, { useState, useRef } from 'react';
import { DEFAULT_BELOHNUNGEN } from '../constants';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useVoice } from '../companion/useVoice';
import { Pearl, Hourglass } from './CurrencyIcons';
import VoiceBubble from './VoiceBubble';
import BelohnungRedeemModal from './BelohnungRedeemModal';
import FunkelzeitParentConfirm from './FunkelzeitParentConfirm';
import TopBar from './TopBar';
import { biomeBackground } from '../utils/biomeBackgrounds';

const ICON_MAP = {
  '🃏': 'playing_cards', '🎧': 'headphones', '🎮': 'sports_esports',
  '📺': 'tv', '🎬': 'movie', '🍬': 'icecream', '🍕': 'local_pizza',
  '🎢': 'attractions', '💪': 'fitness_center',
};

export default function Belohnungsbank({ onNavigate, onStartTimer, timerActive, onOpenParental }) {
  const { t } = useTranslation();
  const { state, actions } = useTask();
  const voice = useVoice();
  const hp = state?.hp || 0;
  const screenMin = state?.drachenEier || 0; // Screen minutes (repurposed from eggs)

  const [redeemTarget, setRedeemTarget] = useState(null);
  // Funkelzeit parent-confirm state — the chosen reward waiting for parent approval
  const [funkelzeitConfirm, setFunkelzeitConfirm] = useState(null);
  // Cap-reached banner (with override link) — only in 'strikt' mode
  const [capReached, setCapReached] = useState(null);

  // ── Funkelzeit mode (parental) ──
  const funkelzeitMode = state?.familyConfig?.funkelzeitMode || 'entspannt';
  const dailyCapMin = state?.familyConfig?.funkelzeitDailyCapMin ?? 30;
  const usedToday = state?.funkelzeitMinutesToday || 0;

  // Section refs so the two balance cards at the top of the shop act as
  // scroll-to chips (tester 25 Apr 2026: tapping "Sterne" / "Funkelzeit"
  // used to do nothing).
  const familySectionRef = useRef(null);
  const digitalSectionRef = useRef(null);
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const familyRewards = DEFAULT_BELOHNUNGEN.filter(b => b.active && (b.currency || 'hp') === 'hp');
  // Screen-time rewards are hidden entirely when mode === 'none'
  const screenRewards = funkelzeitMode === 'none'
    ? []
    : DEFAULT_BELOHNUNGEN.filter(b => b.active && b.currency === 'eggs');

  /**
   * Central Funkelzeit-redeem entry: runs the mode-specific gate before
   * committing currency + starting the timer.
   *
   * - entspannt: parent-confirm overlay (tester 25 Apr 2026 — screen time
   *   always needs oversight; Familien-Abenteuer already gated)
   * - normal: parent-confirm overlay, no cap
   * - strikt: check cap; if over, show cap-reached with override; else parent-confirm
   * - none: screen rewards are hidden, so this path never fires
   */
  const handleScreenRewardTap = (reward) => {
    if (!reward || timerActive) return;
    if (screenMin < reward.cost) return;

    if (funkelzeitMode === 'strikt') {
      if (usedToday + reward.minutes > dailyCapMin) {
        setCapReached(reward);
        return;
      }
    }
    // All non-'none' modes route through the parent-confirm overlay so the
    // kid can't redeem screen time without a grown-up in the loop.
    setFunkelzeitConfirm(reward);
  };

  const commitFunkelzeitStart = (reward) => {
    actions.redeemReward('eggs', reward.cost);
    actions.addFunkelzeitUsage(reward.minutes);
    onStartTimer?.(reward);
    setFunkelzeitConfirm(null);
    setCapReached(null);
  };

  // Reusable reward card per Polish v2 .reward spec — 1-row grid with
  // icon tile | name+price stacked | CTA. Always renders a 3px progress
  // bar (regardless of afford state) so the layout stays stable and the
  // page reads as "journey" rather than "gate". Digital variant flips
  // gold → teal for the icon tile, bar and CTA.
  const RewardRow = ({ reward, variant, canAfford, balance, ctaLabel, ctaDisabledLabel, onTap, disabled }) => {
    const matIcon = ICON_MAP[reward.emoji] || (variant === 'digital' ? 'devices' : 'redeem');
    const isDigital = variant === 'digital';
    const remaining = Math.max(0, reward.cost - balance);
    const pct = Math.min(100, (balance / reward.cost) * 100);
    return (
      <div
        className="grid items-center transition-all"
        style={{
          gridTemplateColumns: '52px 1fr auto',
          gap: 12,
          padding: '12px 14px 12px 12px',
          borderRadius: 18,
          background: '#fff',
          border: isDigital
            ? `1px solid ${canAfford ? 'rgba(13,148,136,0.22)' : 'rgba(18,67,70,0.10)'}`
            : `1px solid ${canAfford ? 'rgba(180,83,9,0.18)' : 'rgba(18,67,70,0.10)'}`,
          boxShadow: canAfford
            ? (isDigital
                ? '0 4px 12px -6px rgba(13,148,136,0.2)'
                : '0 4px 12px -6px rgba(180,83,9,0.2)')
            : '0 4px 12px -8px rgba(18,67,70,0.12)',
        }}
      >
        {/* Icon tile — 52×52, 14px radius, gold or teal gradient with 1px border */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: isDigital
              ? 'linear-gradient(160deg, #f0fdfa, #99f6e4)'
              : 'linear-gradient(160deg, #fef9e7, #fde68a)',
            border: isDigital
              ? '1px solid rgba(13,148,136,0.18)'
              : '1px solid rgba(180,83,9,0.3)',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 26,
              color: isDigital ? '#0d9488' : '#A83E2C',
              fontVariationSettings: "'FILL' 1, 'wght' 500",
            }}
          >
            {matIcon}
          </span>
        </div>

        {/* Body: name on top, price + progress stacked below */}
        <div className="min-w-0">
          <h4
            className="font-body"
            style={{ margin: 0, fontWeight: 600, fontSize: 14, lineHeight: 1.2, color: '#124346' }}
          >
            {t('bel.' + reward.id)}
          </h4>
          <div className="flex items-center gap-2.5 flex-wrap" style={{ marginTop: 4 }}>
            <span
              className="inline-flex items-center"
              style={{
                gap: 5,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: '0.02em',
                color: isDigital ? '#0f766e' : '#A83E2C',
              }}
            >
              {isDigital ? <Hourglass size={13} /> : <Pearl size={13} />}
              {reward.cost} {isDigital ? 'Min' : ''}
            </span>
            {!canAfford && !disabled && (
              <span
                style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  color: '#6b655b',
                }}
              >
                Noch <b style={{ color: '#124346', fontWeight: 800 }}>{remaining}</b>{' '}
                {isDigital ? 'Min' : 'Sterne'}
              </span>
            )}
          </div>
          {/* Always-present 3px bar — stable layout regardless of afford state */}
          <div
            className="overflow-hidden"
            style={{
              marginTop: 6,
              height: 3,
              borderRadius: 999,
              background: isDigital ? 'rgba(13,148,136,0.12)' : 'rgba(180,83,9,0.12)',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: isDigital
                  ? 'linear-gradient(90deg, #5eead4, #0d9488)'
                  : 'linear-gradient(90deg, #fcd34d, #f59e0b)',
              }}
            />
          </div>
        </div>

        {/* CTA or disabled label */}
        {canAfford && !disabled ? (
          <button
            onClick={onTap}
            className="font-label font-extrabold uppercase rounded-full transition-all active:scale-95 whitespace-nowrap"
            style={{
              background: isDigital ? '#0f766e' : '#124346',
              color: isDigital ? '#ccfbf1' : '#fef3c7',
              padding: '9px 14px',
              fontSize: 11,
              letterSpacing: '0.12em',
              boxShadow: isDigital
                ? '0 4px 10px -3px rgba(13,148,136,0.35)'
                : '0 4px 10px -3px rgba(18,67,70,0.35)',
            }}
          >
            {ctaLabel}
          </button>
        ) : (
          <span
            className="font-label font-bold whitespace-nowrap"
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              color: 'rgba(18,67,70,0.4)',
              padding: '9px 14px',
            }}
          >
            {ctaDisabledLabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="relative pb-32" style={{ minHeight: '100dvh' }}>

      {/* Biome-tinted honey-gold backdrop — Laden = afternoon treasure
           market. Cream wash dominates at the fold so reward cards read
           clearly; the warm gold tint bleeds through behind the TopBar
           pills giving this tab its own sunny afternoon mood. */}
      <div className="fixed inset-0 pointer-events-none"
           style={{
             zIndex: 0,
             background: biomeBackground('shop'),
             backgroundColor: '#fff8f2',
           }}
           aria-hidden="true" />

      {/* Relative wrapper so all content floats above the sky backdrop */}
      <div className="relative" style={{ zIndex: 1 }}>

      {/* TopBar sits ABOVE the hero card on the sky backdrop. */}
      <TopBar onNavigate={onNavigate} view="shop" onOpenParental={onOpenParental} />

      {/* Ronki bubble — warm reaction when a reward is approved. Sits
          under the TopBar so it lands in the kid's eye-line as the
          redeem modal fades out. Chip-variant matches Hub pattern. */}
      {voice.line && (
        <div className="w-full max-w-md mx-auto px-4 mt-2">
          <VoiceBubble line={voice.line} onDismiss={voice.dismiss} variant="chip" />
        </div>
      )}

      {/* ── Gilded hero card — cream→amber→gold radial gradient matching
             Polish .bb-hero. Eyebrow now distinct from h1 (per audit) and
             three twinkling sparks live in the portrait corner. ── */}
      <section style={{ padding: '6px 20px 0' }}>
        <div className="relative overflow-hidden"
             style={{
               // Deep forest-teal gradient matching the hero image's
               // emerald background so the picture sits in its native
               // color bed (Marc: "sits in the right color of green").
               // Gold accents (eyebrow, sparks, image glow) survive for
               // the "treasure" vibe; the dark card reads as an emerald
               // coffer holding the gold inside.
               background: `radial-gradient(circle at 15% 15%, rgba(94,234,212,0.28), transparent 55%), linear-gradient(135deg, #0f3236 0%, #164a48 50%, #0a2a2c 100%)`,
               border: '1px solid rgba(94,234,212,0.2)',
               borderRadius: 26,
               boxShadow: '0 16px 36px -14px rgba(12,50,54,0.55), inset 0 1px 0 rgba(94,234,212,0.12)',
             }}>
          <div className="flex items-end" style={{ padding: '20px 22px' }}>
            <div className="flex-1 z-10 pb-1">
              <p className="font-label font-extrabold uppercase"
                 style={{ fontSize: 10, letterSpacing: '0.28em', color: '#fcd34d', marginBottom: 6 }}>
                {t('shop.header.eyebrow')}
              </p>
              <h1 className="font-headline"
                  style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 500, fontSize: 26, letterSpacing: '-0.015em', color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                {t('shop.header.title')}
              </h1>
              <p className="font-body" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, lineHeight: 1.35 }}>
                {t('shop.header.subtitle')}
              </p>
            </div>
            <div className="relative" style={{ width: 110, height: 110 }}>
              <img src={import.meta.env.BASE_URL + 'art/hero-shop.webp'}
                   alt=""
                   className="w-full h-auto -mb-3 -mr-1"
                   style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.45))' }} />
              {/* Three sparks — gold so they read as treasure glints
                   against the deep emerald card. */}
              <span aria-hidden="true" className="bb-spark" style={{ position: 'absolute', top: 6, right: 8, fontSize: 14, color: '#fcd34d', textShadow: '0 0 6px rgba(252,211,77,0.8)', animation: 'bbTwinkle 2.4s ease-in-out infinite', animationDelay: '0s' }}>✦</span>
              <span aria-hidden="true" className="bb-spark" style={{ position: 'absolute', top: 22, left: 4, fontSize: 10, color: '#fcd34d', textShadow: '0 0 6px rgba(252,211,77,0.8)', animation: 'bbTwinkle 2.4s ease-in-out infinite', animationDelay: '0.7s' }}>✦</span>
              <span aria-hidden="true" className="bb-spark" style={{ position: 'absolute', bottom: 16, right: 2, fontSize: 12, color: '#fcd34d', textShadow: '0 0 6px rgba(252,211,77,0.8)', animation: 'bbTwinkle 2.4s ease-in-out infinite', animationDelay: '1.3s' }}>✦</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sparks keyframes — scoped locally so the hero stays self-contained
           and we don't need a global stylesheet change. */}
      <style>{`
        @keyframes bbTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.1); }
        }
      `}</style>

      {/* Main wrapper — per Polish .bb-main spec: 16/20 padding and a
           flex column with 22px gap between sections (replaces per-section
           mb-8 which caused visual jaggedness between blocks). */}
      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* ── Dual Balance Cards — Polish .purse/.hp-card/.sp-card spec.
             14/14/12 padding, 18px radius, and muted-grey job labels
             (not colored amber/teal) so the line reads as caption, not
             secondary currency. ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* HP Balance — tap to scroll to Family Adventures section */}
        <button type="button"
             onClick={() => scrollToSection(familySectionRef)}
             className="relative overflow-hidden text-left active:scale-[0.98] transition-transform"
             style={{
               padding: '14px 14px 12px',
               borderRadius: 18,
               background: 'linear-gradient(160deg, #fffdf5 0%, #fef3c7 100%)',
               border: '1px solid rgba(180,83,9,0.2)',
               boxShadow: '0 6px 14px -8px rgba(180,83,9,0.2), inset 0 1px 0 rgba(255,255,255,0.7)',
             }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Pearl size={22} />
            <p className="font-label font-extrabold uppercase" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#A83E2C' }}>{t('hub.boss.detail.heroPoints')}</p>
          </div>
          <div className="flex items-baseline" style={{ gap: 4, marginTop: 2 }}>
            <span className="font-headline" style={{ fontWeight: 500, fontSize: 28, color: '#124346', letterSpacing: '-0.02em', lineHeight: 1 }}>{hp}</span>
            <span className="font-label font-bold" style={{ fontSize: 11, color: '#6b655b', letterSpacing: '0.1em' }}>STERNE</span>
          </div>
          <p className="font-body" style={{ fontSize: 10, lineHeight: 1.3, color: '#6b655b', opacity: 0.85, marginTop: 2, fontWeight: 600 }}>
            Für Belohnungen aus dem Leben
          </p>
        </button>

        {/* Screen Minutes Balance — tap to scroll to Digital Time section */}
        <button type="button"
             onClick={() => scrollToSection(digitalSectionRef)}
             className="relative overflow-hidden text-left active:scale-[0.98] transition-transform"
             style={{
               padding: '14px 14px 12px',
               borderRadius: 18,
               background: 'linear-gradient(160deg, #f0fdfa 0%, #ccfbf1 100%)',
               border: '1px solid rgba(13,148,136,0.22)',
               boxShadow: '0 6px 14px -8px rgba(13,148,136,0.2), inset 0 1px 0 rgba(255,255,255,0.7)',
             }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Hourglass size={22} dark />
            <p className="font-label font-extrabold uppercase" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#0d9488' }}>{t('shop.screenMinutes')}</p>
          </div>
          <div className="flex items-baseline" style={{ gap: 4, marginTop: 2 }}>
            <span className="font-headline" style={{ fontWeight: 500, fontSize: 28, color: '#0f766e', letterSpacing: '-0.02em', lineHeight: 1 }}>{screenMin}</span>
            <span className="font-label font-bold" style={{ fontSize: 11, color: '#6b655b', letterSpacing: '0.1em' }}>MIN</span>
          </div>
          <p className="font-body" style={{ fontSize: 10, lineHeight: 1.3, color: '#6b655b', opacity: 0.85, marginTop: 2, fontWeight: 600 }}>
            Für Bildschirm-Zeit
          </p>
        </button>
      </div>

      {/* ── Family Adventures (HP currency) ── */}
      {familyRewards.length > 0 && (
        <div ref={familySectionRef} className="flex flex-col" style={{ gap: 10, scrollMarginTop: 16 }}>
          {/* Section label — Fredoka 500/18px with 4px gold accent bar */}
          <div className="flex items-center" style={{ gap: 10, padding: '0 2px' }}>
            <span style={{ width: 4, height: 18, borderRadius: 2, background: '#A83E2C' }} />
            <h3 className="font-headline" style={{ margin: 0, fontFamily: 'Fredoka, sans-serif', fontWeight: 500, fontSize: 18, letterSpacing: '-0.01em', color: '#124346', flex: 1 }}>
              {t('shop.familyAdventures')}
            </h3>
          </div>
          <div className="flex flex-col" style={{ gap: 8 }}>
            {familyRewards.map(reward => {
              const canAfford = hp >= reward.cost;
              return (
                <RewardRow
                  key={reward.id}
                  reward={reward}
                  variant="hp"
                  canAfford={canAfford}
                  balance={hp}
                  ctaLabel={t('shop.redeem')}
                  ctaDisabledLabel=""
                  onTap={() => setRedeemTarget({ ...reward, name: t('bel.' + reward.id) })}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mode 'none' notice — muted teal cream per v2 discipline (no
             violet which breaks the palette). ── */}
      {funkelzeitMode === 'none' && (
        <div className="rounded-2xl p-5"
             style={{
               background: 'linear-gradient(135deg, #fffdf5 0%, #f0fdfa 100%)',
               border: '1px solid rgba(13,148,136,0.18)',
             }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                 style={{ background: 'rgba(13,148,136,0.1)' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: '#0d9488', fontVariationSettings: "'FILL' 1" }}>nature</span>
            </div>
            <div className="flex-1">
              <h4 className="font-label font-bold text-base text-on-surface">Keine Bildschirmzeit als Belohnung.</h4>
              <p className="font-body text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Heute zählen andere Dinge mehr.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Digital Time (Screen minutes currency) ──
             Mini-Spiele gate has moved to Ronki (RonkiProfile) — it's
             screen content that belongs with the companion, not a third
             economy inside the reward bank. ── */}
      {screenRewards.length > 0 && (
        <div ref={digitalSectionRef} className="flex flex-col" style={{ gap: 10, scrollMarginTop: 16 }}>
          {/* Section label — teal accent bar */}
          <div className="flex items-center" style={{ gap: 10, padding: '0 2px' }}>
            <span style={{ width: 4, height: 18, borderRadius: 2, background: '#0d9488' }} />
            <h3 className="font-headline" style={{ margin: 0, fontFamily: 'Fredoka, sans-serif', fontWeight: 500, fontSize: 18, letterSpacing: '-0.01em', color: '#124346', flex: 1 }}>
              {t('shop.digitalTime')}
            </h3>
          </div>

          <div className="flex flex-col" style={{ gap: 8 }}>
            {screenRewards.map(reward => {
              const canAfford = screenMin >= reward.cost;
              const blocked = timerActive; // can't start a second timer
              return (
                <RewardRow
                  key={reward.id}
                  reward={reward}
                  variant="digital"
                  canAfford={canAfford && !blocked}
                  balance={screenMin}
                  ctaLabel={t('shop.redeem')}
                  ctaDisabledLabel={blocked ? t('shop.timerRunning') : ''}
                  onTap={() => handleScreenRewardTap(reward)}
                  disabled={blocked}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Guide — gold-warm per Polish .help-card (replaces violet) ── */}
      <div className="grid items-start"
           style={{
             gridTemplateColumns: '32px 1fr',
             gap: 12,
             padding: '14px 16px',
             borderRadius: 18,
             background: 'linear-gradient(160deg, rgba(252,211,77,0.12) 0%, rgba(245,158,11,0.06) 100%)',
             border: '1px solid rgba(180,83,9,0.14)',
           }}>
        <span className="material-symbols-outlined" style={{ color: '#A83E2C', fontSize: 24, fontVariationSettings: "'FILL' 1, 'wght' 500", marginTop: 2 }}>lightbulb</span>
        <div>
          <b className="font-label" style={{ display: 'block', fontWeight: 700, fontSize: 13, lineHeight: 1.2, letterSpacing: '0.04em', color: '#124346', marginBottom: 4 }}>
            {t('shop.howItWorks')}
          </b>
          <p className="font-body" style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: '#6b655b', fontWeight: 500 }}>
            {t('shop.howItWorksBody')}
          </p>
        </div>
      </div>

      {/* Bottom parent-lock removed — the TopBar (top-right .parent-btn)
           is the single entry point per Polish spec. Audit call-out #12:
           duplicate bottom button was redundant. */}

      {/* ── HP Reward approval modal ──
            Fires voice.say('reward_approved') alongside the redeem so a
            warm Ronki bubble lands as the modal fades out. Surface
            wired in the Apr 2026 character pass — see
            docs/ronki-voicelines.md (Lines 71). */}
      {redeemTarget && (
        <BelohnungRedeemModal
          reward={redeemTarget}
          onApprove={() => {
            voice.say('reward_approved');
            actions.redeemReward('hp', redeemTarget.cost);
            setRedeemTarget(null);
          }}
          onDismiss={() => setRedeemTarget(null)}
        />
      )}

      {/* ── Funkelzeit parent-confirm overlay (modes: normal + strikt under cap) ── */}
      {funkelzeitConfirm && (
        <FunkelzeitParentConfirm
          reward={{ ...funkelzeitConfirm, name: t('bel.' + funkelzeitConfirm.id) }}
          onApprove={() => commitFunkelzeitStart(funkelzeitConfirm)}
          onDismiss={() => setFunkelzeitConfirm(null)}
        />
      )}

      {/* ── Funkelzeit daily-cap reached (strikt mode) with parent override ── */}
      {capReached && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setCapReached(null); }}
          className="fixed inset-0 z-[650] flex items-center justify-center px-5 overflow-y-auto py-8"
          style={{ background: 'rgba(10,20,22,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden relative"
            style={{
              background: '#fff8f1',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
              border: '1px solid rgba(255,255,255,0.9)',
            }}
          >
            <div className="px-6 pt-10 pb-8 flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full mb-5 flex items-center justify-center"
                style={{ background: 'rgba(186,26,26,0.08)', border: '1px solid rgba(186,26,26,0.15)' }}
              >
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ color: '#A83E2C', fontVariationSettings: "'FILL' 1" }}
                >
                  bedtime
                </span>
              </div>
              <h2
                className="font-headline font-bold text-on-surface leading-tight"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.5rem' }}
              >
                Heute ist Schluss mit Funkelzeit.
              </h2>
              <p
                className="font-body text-on-surface-variant mt-3 leading-relaxed"
                style={{ fontSize: '1rem' }}
              >
                Morgen wieder!
              </p>
              <p
                className="font-label text-xs text-on-surface-variant mt-4 uppercase tracking-widest"
              >
                Heute genutzt: {usedToday} / {dailyCapMin} Min.
              </p>

              <button
                onClick={() => setCapReached(null)}
                className="mt-8 w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
                style={{ background: '#124346', color: 'white' }}
              >
                Okay
              </button>

              {/* Parent override link — small, ghost-style, trust-based */}
              <button
                onClick={() => {
                  const reward = capReached;
                  setCapReached(null);
                  setFunkelzeitConfirm(reward);
                }}
                className="mt-3 font-label text-xs underline active:opacity-70"
                style={{ color: '#9ca3af' }}
              >
                Eltern-Override
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  );
}
