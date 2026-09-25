import React, { useEffect, useState, useRef } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import CooldownButton from './CooldownButton';
import { isDevMode } from '../utils/mode';
import MoodChibi from './MoodChibi';
import { StickerBurst, PaperCard, DoodleIcon, MotionTicks } from './bilderbuch';

/**
 * Celebration (Bilderbuch, 25 Sep 2026). Same five moments, same
 * gating and tapering logic as before; the look is the picture book:
 * white ground, one big Fredoka headline, a sticker burst instead of
 * the confetti canvas, paper cards with ink outlines, one cobalt pill.
 */

// One cobalt pill per screen. CooldownButton keeps its ring and delay.
const PILL = 'w-full inline-flex items-center justify-center rounded-full bg-cobalt text-white font-headline font-bold text-xl min-h-[60px] px-8 bb-press bb-press--night';

function Burst() {
  // Fires once on mount; the burst unmounts itself when done.
  const [on, setOn] = useState(true);
  return <StickerBurst fixed active={on} size={420} count={30} onDone={() => setOn(false)} />;
}

function Headline({ children }) {
  return <h2 className="bb-display text-[2.6rem] text-ink text-center">{children}</h2>;
}

// ── Evolution ──
function EvolutionCelebration({ stage, name, emoji, onDismiss }) {
  const { t } = useTranslation();
  return (
    <main className="relative flex flex-col items-center justify-center min-h-dvh px-6 pt-20 pb-24 text-center">
      <Burst />
      <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
        <div className="relative mb-6">
          <MoodChibi size={240} stage={stage ?? 2} mood="gut" bare />
          <span className="absolute -top-2 -right-4"><MotionTicks tone="sun" size={34} rotate={-40} /></span>
          <span className="absolute bottom-6 -left-6 text-cobalt"><DoodleIcon name="sparkle" size={30} filled /></span>
        </div>

        <div className="space-y-4 px-2">
          <span className="bb-hand inline-block rounded-[10px] bg-sun px-4 py-1.5 text-lg uppercase leading-none text-ink" style={{ transform: 'rotate(-3deg)' }}>
            {t('celebrate.evolution.label')}
          </span>
          <Headline>{t('celebrate.evolution.title')}</Headline>
          <p className="font-body text-xl text-ink-soft max-w-md mx-auto leading-relaxed">
            Dein <span className="font-bold text-cobalt">Ronki</span> ist jetzt: <span className="font-bold text-cobalt">{name}</span> {emoji}
          </p>
        </div>

        <div className="w-full mt-10 grid grid-cols-2 gap-4">
          <PaperCard tone="paper" pad="md" className="text-left">
            <div className="flex items-center gap-2 mb-2 text-cobalt">
              <DoodleIcon name="bolt" size={22} />
              <span className="font-headline font-semibold text-sm text-ink-soft">{t('celebrate.evolution.energy')}</span>
            </div>
            <div className="text-2xl font-headline font-bold text-ink">+250</div>
          </PaperCard>
          <PaperCard tone="sky-wash" pad="md" className="text-left translate-y-3">
            <div className="flex items-center gap-2 mb-2 text-ember">
              <DoodleIcon name="heart" size={22} filled />
              <span className="font-headline font-semibold text-sm text-ink-soft">{t('celebrate.evolution.bond')}</span>
            </div>
            <div className="text-2xl font-headline font-bold text-ink">{t('celebrate.evolution.stage', { stage: (stage || 0) + 1 })}</div>
          </PaperCard>
        </div>

        <div className="mt-12 w-full px-2">
          <CooldownButton delay={4} onClick={onDismiss} icon="arrow_forward" className={PILL}>
            {t('celebrate.evolution.button')}
          </CooldownButton>
        </div>
      </div>
    </main>
  );
}

// ── Level up ──
function LevelUpCelebration({ level, onDismiss }) {
  const { t } = useTranslation();
  return (
    <main className="min-h-dvh w-full max-w-2xl px-6 pb-32 flex flex-col items-center justify-center relative overflow-hidden mx-auto"
          style={{ paddingTop: 'calc(6rem + env(safe-area-inset-top, 0px))' }}>
      <Burst />
      <div className="relative w-full flex flex-col items-center text-center">
        <div className="relative mb-8">
          <span className="absolute -top-3 -left-6 text-sun"><DoodleIcon name="sparkle" size={30} filled stroke={4} /></span>
          <span className="absolute top-10 -right-8"><MotionTicks tone="cobalt" size={30} rotate={-20} /></span>
          <div className="w-36 h-36 rounded-full flex items-center justify-center bg-sun border-[3px] border-ink">
            <div className="flex flex-col items-center">
              <span className="font-headline font-bold text-5xl text-ink leading-none">{level}</span>
              <span className="font-headline font-semibold text-sm text-ink mt-1">{t('celebrate.levelup.label')}</span>
            </div>
          </div>
        </div>

        <Headline>{t('celebrate.levelup.title')}</Headline>

        <PaperCard tone="paper" pad="lg" className="w-full max-w-sm mt-6 mb-12 flex flex-col items-center">
          <div className="mb-3 text-cobalt"><DoodleIcon name="star" size={64} filled stroke={4} /></div>
          <p className="font-body text-lg text-ink leading-relaxed max-w-[240px]">
            {t('celebrate.levelup.power', { level })}
          </p>
        </PaperCard>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <CooldownButton delay={4} onClick={onDismiss} className={PILL}>
            {t('celebrate.levelup.button')}
          </CooldownButton>
        </div>
      </div>
    </main>
  );
}

// ── Victory: all tasks done ──
function VictoryCelebration({ onDismiss }) {
  const { t } = useTranslation();
  const { state } = useTask();
  const done = (state?.quests || []).filter(q => q.done && !q.sideQuest);

  return (
    <main className="min-h-dvh pt-24 pb-32 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      <Burst />
      <section className="relative w-full max-w-lg flex flex-col items-center text-center">
        <div className="relative mb-6">
          <MoodChibi size={230} mood="magisch" bare />
          <span className="absolute -top-1 right-0"><MotionTicks tone="sun" size={36} rotate={-50} /></span>
        </div>

        <div className="space-y-3 mb-10">
          <Headline>{t('celebrate.victory.title')}</Headline>
          <p className="text-xl text-ink-soft font-body px-4">{t('celebrate.victory.message')}</p>
        </div>

        <div className="w-full mb-10">
          <h3 className="font-headline font-bold text-2xl text-ink mb-4 text-center">{t('celebrate.victory.summary')}</h3>
          <PaperCard tone="paper" pad="md" className="space-y-3">
            {done.slice(0, 5).map(q => (
              <div key={q.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border-[2.5px] border-ink text-leaf shrink-0">
                  <DoodleIcon name="check" size={22} stroke={7} />
                </div>
                <p className="font-headline font-semibold text-lg text-ink text-left">{q.icon} {t('quest.' + q.id)}</p>
              </div>
            ))}
            {done.length > 5 && (
              <p className="font-headline text-sm text-ink-soft text-center">
                {t('celebrate.victory.more', { count: done.length - 5 })}
              </p>
            )}
          </PaperCard>
        </div>

        <div className="w-full max-w-sm">
          <CooldownButton delay={5} onClick={onDismiss} icon="redeem" className={PILL}>
            {t('celebrate.victory.button')}
          </CooldownButton>
        </div>
      </section>
    </main>
  );
}

// ── Forscher-Ecke graduation: all MINT games done ──
function ForscherGraduationCelebration({ onDismiss }) {
  const { t } = useTranslation();
  return (
    <main className="min-h-dvh pt-24 pb-32 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      <Burst />
      <section className="relative w-full max-w-lg flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="w-48 h-48 rounded-full bg-sky-wash border-[3px] border-ink flex items-center justify-center">
            <span className="text-[6rem] leading-none">&#x1f52c;</span>
          </div>
          <span className="absolute -top-3 -right-3 text-sun"><DoodleIcon name="sparkle" size={34} filled stroke={4} /></span>
          <span className="absolute bottom-3 -left-5 text-leaf"><DoodleIcon name="leaf" size={30} filled /></span>
        </div>

        <div className="space-y-3 mb-10">
          <Headline>{t('celebrate.forscher.title')}</Headline>
          <p className="text-xl text-ink-soft font-body px-4">{t('celebrate.forscher.message')}</p>
        </div>

        <div className="w-full max-w-sm">
          <CooldownButton delay={4} onClick={onDismiss} icon="sports_esports" className={PILL}>
            {t('celebrate.forscher.button')}
          </CooldownButton>
        </div>
      </section>
    </main>
  );
}

// ── Chest: milestone ──
function ChestCelebration({ milestone, reward, onDismiss }) {
  const { t } = useTranslation();
  return (
    <main className="min-h-dvh pt-24 pb-32 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      <Burst />
      <section className="relative w-full max-w-lg flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="w-48 h-48 rounded-full bg-sun border-[3px] border-ink flex items-center justify-center text-ink">
            <DoodleIcon name="gift" size={104} stroke={4} />
          </div>
          <span className="absolute -top-3 -right-3"><MotionTicks tone="cobalt" size={34} rotate={-45} /></span>
          <span className="absolute bottom-3 -left-5 text-ember"><DoodleIcon name="sparkle" size={28} filled /></span>
        </div>

        <div className="space-y-3 mb-10">
          <Headline>{t('celebrate.chest.title')}</Headline>
          <p className="text-xl text-ink-soft font-body px-4">{t('celebrate.chest.daysInRow', { days: milestone })}</p>
        </div>

        <PaperCard tone="paper" pad="lg" className="w-full mb-10 flex flex-col items-center">
          <div className="mb-3 text-cobalt"><DoodleIcon name="star" size={56} filled stroke={4} /></div>
          <p className="font-body text-xl text-ink leading-relaxed">{t('celebrate.chest.earned', { reward })}</p>
        </PaperCard>

        <div className="w-full max-w-sm">
          <CooldownButton delay={4} onClick={onDismiss} icon="redeem" className={PILL}>
            {t('celebrate.chest.button')}
          </CooldownButton>
        </div>
      </section>
    </main>
  );
}

export default function Celebration() {
  const { t } = useTranslation();
  const { celebration, actions } = useTask();
  const [visible, setVisible] = useState(false);
  const skipRef = useRef(false);

  useEffect(() => {
    if (celebration) {
      // Public mode: skip RPG-flavored celebrations entirely (levelUp +
      // evolution). State still updates under the hood; just don't show
      // modals that contradict the "one stable companion, no ladder"
      // framing Marc wants in public mode.
      if ((celebration.type === 'levelUp' || celebration.type === 'evolution') && !isDevMode()) {
        skipRef.current = true;
        actions.dismissCelebration();
        return;
      }
      // Reward tapering: based on days since onboarding, some celebrations
      // are silently skipped in later phases. Evolution/chest always show.
      if (celebration.type === 'victory' || celebration.type === 'levelUp') {
        let daysSince = 0;
        try {
          const raw = localStorage.getItem('hdx2');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.onboardingDate) {
              daysSince = Math.floor((Date.now() - new Date(parsed.onboardingDate).getTime()) / 86400000);
            }
          }
        } catch {}
        // Phase 1 (days 1-7): always show. Phase 2 (8-21): 85%. Phase 3 (22-45): 50%. Phase 4 (46+): 15%.
        const prob = daysSince <= 7 ? 1.0 : daysSince <= 21 ? 0.85 : daysSince <= 45 ? 0.5 : 0.15;
        if (Math.random() > prob) {
          // Silently dismiss: the reward was already given, just skip the animation
          skipRef.current = true;
          actions.dismissCelebration();
          return;
        }
      }
      skipRef.current = false;
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [celebration]);

  if (!celebration || skipRef.current) return null;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => actions.dismissCelebration(), 300);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-white overflow-y-auto transition-all duration-300"
         style={{
           opacity: visible ? 1 : 0,
           transform: visible ? 'translateY(0)' : 'translateY(20px)',
         }}>
      {/* Top bar: close chevron, headline, nothing else. */}
      <header className="fixed top-0 w-full z-50 bg-white flex justify-between items-center px-4 h-16 text-ink"
              style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <button type="button" onClick={handleDismiss} aria-label="Schließen" className="flex h-12 w-12 items-center justify-center rounded-full active:scale-95">
          <DoodleIcon name="close" size={24} stroke={7} />
        </button>
        <h1 className="bb-display text-2xl">{t('celebrate.header')}</h1>
        <div className="w-12" />
      </header>

      {celebration.type === 'victory' && <VictoryCelebration onDismiss={handleDismiss} />}
      {celebration.type === 'levelUp' && <LevelUpCelebration level={celebration.payload?.level} onDismiss={handleDismiss} />}
      {celebration.type === 'evolution' && <EvolutionCelebration {...(celebration.payload || {})} onDismiss={handleDismiss} />}
      {celebration.type === 'chest' && <ChestCelebration {...(celebration.payload || {})} onDismiss={handleDismiss} />}
      {celebration.type === 'forscherGraduation' && <ForscherGraduationCelebration onDismiss={handleDismiss} />}
    </div>
  );
}
