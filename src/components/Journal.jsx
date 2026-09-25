import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import SFX from '../utils/sfx';
import VoiceAudio from '../utils/voiceAudio';
import PinnedRonki from './PinnedRonki';
import MoodChibi, { RonkiArt } from './MoodChibi';
import { TopBar, PaperCard, PillButton, ChoiceTile, DoodleIcon } from './bilderbuch';
import { FeelingDoodle } from './JournalFeelings';
import { useAnalytics } from '../hooks/useAnalytics';

// Stable mood enum for analytics. Index matches MOOD_EMOJIS order.
// Never localized, consistent with Hub.jsx.
const MOOD_ENUM = ['sad', 'worried', 'okay', 'good', 'magical', 'tired'];

const MOOD_LABELS = ["Traurig", "Besorgt", "Okay", "Gut", "Magisch", "Müde"];

const GRATITUDE = ["Familie", "Freunde", "Spielen", "Essen", "Natur", "Schule", "Ronki"];
const DAY_EMOJIS = ["⭐", "🎈", "🍦", "🎨", "⚽", "🍕", "🎮", "🌈", "🐶"];
const ACHIEVEMENTS = ["Quest erledigt", "Ronki gefüttert", "Draußen sein", "Lesen", "Geholfen"];

const DAILY_PROMPTS = [
  "Was hat dich heute zum Lachen gebracht?",
  "Was war das Beste an deinem Tag?",
  "Worüber hast du heute nachgedacht?",
  "Was hast du heute Neues gelernt?",
  "Was hat dich heute überrascht?",
  "Wem hast du heute ein Lächeln geschenkt?",
  "Was war dein mutigstes Abenteuer heute?",
];

function getDailyIndex(arr) {
  const day = Math.floor(Date.now() / 86400000);
  return day % arr.length;
}

// Notebook ruling for the paper pages: thin sky-wash lines every 32 px,
// drawn as a tiny SVG tile (lines, not a colour gradient).
const RULE_GAP = 32;
const RULED = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='${RULE_GAP}'%3E%3Crect y='${RULE_GAP - 2}' width='8' height='2' fill='%23b9e3fc'/%3E%3C/svg%3E")`,
  backgroundSize: `8px ${RULE_GAP}px`,
  backgroundRepeat: 'repeat',
};

/** Section title as a hand-lettered sun sticker. */
function Sticker({ children, className = '' }) {
  return (
    <span
      className={`bb-hand inline-block rounded-[10px] bg-sun px-3 py-1.5 text-lg uppercase leading-none text-ink ${className}`}
      style={{ transform: 'rotate(-2deg)' }}
    >
      {children}
    </span>
  );
}

/** A toggle chip: white with an ink line, sky-wash plus a check when on. */
function ToggleChip({ selected, onClick, children }) {
  return (
    <button
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink font-headline font-semibold text-ink transition-transform active:scale-95 ${selected ? 'bg-sky-wash' : 'bg-white'}`}
      style={{ padding: '9px 16px', minHeight: 44, fontSize: 16, lineHeight: 1 }}
      onClick={onClick}
    >
      {selected && (
        <span className="text-cobalt" style={{ lineHeight: 0 }}>
          <DoodleIcon name="check" size={16} stroke={8} />
        </span>
      )}
      {children}
    </button>
  );
}

/** A small read-only tag (summary and old entries). */
function Tag({ children, star = false }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-white font-headline font-semibold text-ink"
          style={{ padding: '5px 12px', fontSize: 16, lineHeight: 1 }}>
      {star && (
        <span className="text-sun-deep" style={{ lineHeight: 0 }}>
          <DoodleIcon name="star" size={14} filled stroke={3} />
        </span>
      )}
      {children}
    </span>
  );
}

export default function Journal({ onNavigate, onOpenParental }) {
  const { state, actions } = useTask();
  const { t, locale, lang } = useTranslation();
  const { track } = useAnalytics();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const moodLabels = [t('mood.sad'), t('mood.worried'), t('mood.okay'), t('mood.good'), t('mood.magical'), t('mood.tired')];
  const gratitudeLabels = [t('journal.gratitude.family'), t('journal.gratitude.friends'), t('journal.gratitude.play'), t('journal.gratitude.food'), t('journal.gratitude.nature'), t('journal.gratitude.school'), t('journal.gratitude.ronki')];
  const achievementLabels = [t('journal.achievement.quest'), t('journal.achievement.fed'), t('journal.achievement.outside'), t('journal.achievement.read'), t('journal.achievement.helped')];
  const dailyPrompts = Array.from({length: 7}, (_, i) => t(`journal.prompt.${i + 1}`));
  const [gratitude, setGratitude] = useState(state?.journalGratitude || []);
  const [dayEmoji, setDayEmoji] = useState(state?.journalDayEmoji ?? null);
  const [achievements, setAchievements] = useState(state?.journalAchievements || []);
  const [memory, setMemory] = useState(state?.journalMemory || '');
  const [bookOpen, setBookOpen] = useState(!state?.journalSaved);
  const [viewingEntry, setViewingEntry] = useState(null); // date string of old entry being viewed
  // Zuklapp-Feier overlay (v3 lines 1894-1960): a small celebration card
  // appears on save BEFORE the closed-summary view, with a nodding Ronki
  // and reward pills. On dismiss we flip bookOpen to false and continue.
  const [overlayOpen, setOverlayOpen] = useState(false);

  if (!state) return null;

  const toggleItem = (arr, setArr, item) => {
    setArr(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const todayPrompt = dailyPrompts[getDailyIndex(dailyPrompts)];
  const history = [...(state.journalHistory || [])].sort((a, b) => b.date.localeCompare(a.date));
  const hasTodayContent = memory || gratitude.length > 0 || dayEmoji !== null || achievements.length > 0;

  const handleSave = () => {
    actions.saveJournal({ memory, gratitude, dayEmoji, achievements });
    // Analytics: journal.write, COUNT ONLY. No content, no mood, no
    // gratitude tags, no achievements. Spec is explicit: never send
    // user-generated strings. The existence of the event is the data
    // product (sessions that end with a journal entry).
    track('journal.write');
    // Actual book close SFX (not Ronki's voice) + delayed Ronki encouragement
    SFX.play('pop');
    const encouragements = ['journal_done_01', 'journal_done_02', 'journal_done_03'];
    setTimeout(() => VoiceAudio.playLocalized(encouragements[Math.floor(Math.random() * encouragements.length)]), 800);
    // v3 Zuklapp-Feier: show the celebration overlay first, then bookOpen
    // flips only when the child taps "Schön!". Keeps the ritual felt.
    setOverlayOpen(true);
  };

  const dismissOverlay = () => {
    SFX.play('tap');
    setOverlayOpen(false);
    setBookOpen(false);
  };

  // v3 line 1994: close-book CTA gates on at least 2 filled fields. Count
  // what the child has put in today (mood, memo, gratitude, dayEmoji,
  // achievements) and show a soft fill-bar hint under the button when < 2.
  const filledCount = [
    state.moodAM !== null,
    memory.length > 0,
    gratitude.length > 0,
    dayEmoji !== null,
    achievements.length > 0,
  ].filter(Boolean).length;
  const canClose = filledCount >= 2;

  const handleReopen = () => {
    SFX.play('tap');
    setBookOpen(true);
  };

  // View an old entry
  const selectedEntry = viewingEntry ? history.find(e => e.date === viewingEntry) : null;

  return (
    <div className="relative pb-32 bg-white" style={{ minHeight: '100dvh' }}>
      <div className="relative" style={{ zIndex: 1 }}>

      {/* Top bar: back to the Nest on the left, the pinned Ronki on the
           right (he follows the kid across tabs). No parent lock here on
           purpose: the Tagebuch is kids-eyes-only (Marc: a parent gate on
           this view "feels fishy"). */}
      <TopBar
        onBack={() => onNavigate?.('hub')}
        backLabel={lang === 'de' ? 'Zurück zum Nest' : 'Back to the nest'}
        right={(
          <PinnedRonki
            size={46}
            onTap={() => onNavigate?.('ronki')}
            ariaLabel={lang === 'de' ? 'Zu Ronki' : 'Go to Ronki'}
          />
        )}
      />

      {/* ── Title page: Ronki with his leaf beside the book's name. ── */}
      <section style={{ padding: '2px 16px 0' }}>
        <PaperCard tone="paper" pad="none" className="relative overflow-hidden"
                   style={{ padding: '18px 16px 16px 20px', minHeight: 132 }}>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="bb-display text-ink" style={{ fontSize: 30, margin: '0 0 6px' }}>
                {lang === 'de' ? 'Abenteuer-Buch' : 'Adventure Book'}
              </h1>
              <p className="font-body text-ink-soft" style={{ fontSize: 16, lineHeight: 1.35, margin: 0 }}>
                {lang === 'de' ? 'Dein Tagebuch voller Erinnerungen' : 'Your journal full of memories'}
              </p>
            </div>
            <RonkiArt pose="leaf" size={112} className="shrink-0" style={{ marginRight: -6, marginBottom: -10 }} />
          </div>
        </PaperCard>
      </section>

      <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 22 }}>

      {/* ── Today's Entry ── */}
      {!bookOpen ? (
        /* ══ CLOSED BOOK: summary page ══ */
        <PaperCard tone="paper" lift pad="none" as="section" className="mb-8 overflow-hidden">
          <div className="flex items-center gap-4" style={{ padding: '18px 18px 14px', borderBottom: '2px solid var(--color-ink)' }}>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-ink bg-cobalt text-white">
              <DoodleIcon name="book" size={30} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-headline font-semibold text-cobalt" style={{ fontSize: 16, margin: 0 }}>{t('journal.todayEntry')}</p>
              <p className="font-headline font-bold text-ink" style={{ fontSize: 19, lineHeight: 1.2, margin: 0 }}>
                {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-leaf text-white">
              <DoodleIcon name="check" size={18} stroke={8} />
            </span>
          </div>

          {/* Summary, written on the ruled page */}
          <div className="flex flex-col gap-3" style={{ padding: '14px 18px 16px', ...RULED }}>
            {/* Mood */}
            {state.moodAM !== null && (
              <div className="flex items-center gap-2.5">
                <FeelingDoodle idx={state.moodAM} size={28} />
                <span className="font-headline font-semibold text-ink" style={{ fontSize: 17 }}>{moodLabels[state.moodAM]}</span>
              </div>
            )}
            {/* Day emoji */}
            {dayEmoji !== null && (
              <div className="flex items-center gap-2.5">
                <span style={{ fontSize: 26, lineHeight: 1 }}>{DAY_EMOJIS[dayEmoji]}</span>
                <span className="font-headline font-semibold text-ink-soft" style={{ fontSize: 16 }}>{t('journal.dayEmoji')}</span>
              </div>
            )}
            {/* Memory snippet */}
            {memory && (
              <p className="font-body text-ink line-clamp-2" style={{ fontSize: 17, lineHeight: `${RULE_GAP}px`, margin: 0 }}>
                „{memory}"
              </p>
            )}
            {/* Gratitude tags */}
            {gratitude.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {gratitude.map(g => <Tag key={g}>{g}</Tag>)}
              </div>
            )}
            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {achievements.map(a => <Tag key={a} star>{a}</Tag>)}
              </div>
            )}
          </div>

          {/* Reopen button */}
          <div className="flex justify-center" style={{ padding: '4px 18px 18px' }}>
            <PillButton tone="secondary" onClick={handleReopen}>
              {t('journal.edit')}
            </PillButton>
          </div>
        </PaperCard>
      ) : (
        /* ══ OPEN BOOK: full editor ══ */
        <>
          {/* ── Today strip: "Dein Tag" with today's date. ── */}
          <PaperCard tone="paper" pad="none" as="section" className="mb-6">
            <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 12, alignItems: 'center' }}>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-white text-cobalt">
                <DoodleIcon name="book" size={26} />
              </span>
              <h2 className="bb-display text-ink" style={{ margin: 0, fontSize: 22 }}>
                {t('journal.yourDay')}
              </h2>
              <div style={{ textAlign: 'right' }}>
                <span className="font-headline font-semibold text-ink-soft block" style={{ fontSize: 14, lineHeight: 1, marginBottom: 4 }}>
                  {t('common.today')}
                </span>
                <b className="font-headline font-bold text-cobalt" style={{ fontSize: 16, lineHeight: 1 }}>
                  {new Date().toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}
                </b>
              </div>
            </div>
          </PaperCard>

          {/* ── Mood selector: feelings as choice tiles, a doodle and
               one word each. The selected tile gets the drawn cobalt
               ring. ── */}
          <section className="mb-7">
            <div className="mb-4"><Sticker>{t('journal.mood.title')}</Sticker></div>
            <div className="grid grid-cols-3 gap-3">
              {[3, 4, 2, 0, 1, 5].map((idx) => {
                const isSelected = state.moodAM === idx;
                return (
                  <ChoiceTile key={idx}
                    label={moodLabels[idx]}
                    selected={isSelected}
                    style={{ minWidth: 0 }}
                    onClick={() => {
                      SFX.play('pop');
                      actions.setMood('moodAM', idx);
                      // Analytics: mood.pick. Journal mood picker writes
                      // moodAM too (same field Hub uses), so slot is AM
                      // regardless of actual time-of-day. Product team
                      // derives AM/PM from ts truncation if needed.
                      track('mood.pick', { mood: MOOD_ENUM[idx] || 'unknown', slot: 'AM' });
                    }}
                  >
                    <FeelingDoodle idx={idx} size={42} />
                  </ChoiceTile>
                );
              })}
            </div>
          </section>

          {/* ── Daily memory prompt: the question, then a ruled page to
               write on. Counter sits inside, bottom right. ── */}
          <PaperCard as="section" className="mb-6">
            <div className="mb-3"><Sticker>{t('journal.memory.title')}</Sticker></div>
            <p className="font-headline font-bold text-cobalt" style={{ fontSize: 19, lineHeight: 1.3, margin: '0 0 14px' }}>{todayPrompt}</p>
            <div style={{ position: 'relative' }}>
              <textarea
                className="w-full font-body text-ink resize-none focus:outline-none rounded-[18px] border-2 border-ink bg-paper"
                style={{
                  minHeight: RULE_GAP * 4 + 10,
                  padding: '4px 14px 30px',
                  fontSize: 17, lineHeight: `${RULE_GAP}px`, fontWeight: 500,
                  ...RULED,
                  backgroundPosition: '0 4px',
                  backgroundAttachment: 'local',
                }}
                placeholder={t('journal.memory.placeholder')}
                value={memory}
                onChange={e => setMemory(e.target.value)}
                maxLength={300}
              />
              <span className="font-headline font-semibold text-ink-soft" style={{
                position: 'absolute', bottom: 10, right: 14,
                fontSize: 14, lineHeight: 1,
                pointerEvents: 'none',
              }}>
                {memory.length}/300
              </span>
            </div>
          </PaperCard>

          {/* ── Gedanken heute ── */}
          <PaperCard as="section" className="mb-6">
            <div className="mb-5"><Sticker>{t('journal.thoughts')}</Sticker></div>

            {/* Gratitude stickers */}
            <div className="mb-7">
              <label className="font-headline font-bold text-ink block mb-3" style={{ fontSize: 18, lineHeight: 1.25 }}>
                {t('journal.gratitude.title')}
              </label>
              <div className="flex flex-wrap gap-2">
                {GRATITUDE.map((g, i) => (
                  <ToggleChip key={g}
                    selected={gratitude.includes(g)}
                    onClick={() => toggleItem(gratitude, setGratitude, g)}>
                    {gratitudeLabels[i]}
                  </ToggleChip>
                ))}
              </div>
            </div>

            {/* Day emoji: 3×3 grid of paper tiles, the picked one ringed */}
            <div className="mb-7">
              <label className="font-headline font-bold text-ink block mb-3" style={{ fontSize: 18, lineHeight: 1.25 }}>
                {t('journal.dayEmoji.title')}
              </label>
              <div className="grid grid-cols-3" style={{ gap: 12 }}>
                {DAY_EMOJIS.map((e, i) => {
                  const selected = dayEmoji === i;
                  return (
                    <button key={i}
                      aria-pressed={selected}
                      className="relative flex items-center justify-center rounded-[20px] border-2 border-ink bg-paper transition-transform active:scale-95"
                      style={{ aspectRatio: '1 / 1' }}
                      onClick={() => { SFX.play('tap'); setDayEmoji(i); }}
                    >
                      <span style={{ fontSize: 34, lineHeight: 1 }}>{e}</span>
                      {selected && (
                        <svg aria-hidden="true" focusable="false" viewBox="0 0 100 100" preserveAspectRatio="none"
                             className="pointer-events-none absolute"
                             style={{ inset: -8, width: 'calc(100% + 16px)', height: 'calc(100% + 16px)', overflow: 'visible', color: 'var(--color-cobalt)' }}>
                          <path d="M22 3 C 45 1 70 2 82 4 C 94 6 98 16 97 30 C 96 50 98 68 96 84 C 95 95 88 98 76 98 C 55 99 34 98 20 97 C 8 96 3 90 3 78 C 2 60 1 40 3 22 C 4 9 10 4 22 3 Z"
                                fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-7">
              <label className="font-headline font-bold text-ink block mb-3" style={{ fontSize: 18, lineHeight: 1.25 }}>
                {t('journal.achievements.title')}
              </label>
              <div className="flex flex-wrap gap-2">
                {ACHIEVEMENTS.map((a, i) => (
                  <ToggleChip key={a}
                    selected={achievements.includes(a)}
                    onClick={() => toggleItem(achievements, setAchievements, a)}>
                    {achievementLabels[i]}
                  </ToggleChip>
                ))}
              </div>
            </div>

            {/* Close-book button. Hard-disable was cruel: when fewer than
                 2 fields are filled it shows flat, with a drawn meter
                 toward the gate and a warm hint. At 2 or more it is the
                 one cobalt action of the page. */}
            <div className="flex flex-col items-center mt-6 gap-3">
              {canClose ? (
                <PillButton tone="primary" icon="book" size="lg" full onClick={handleSave}>
                  {t('journal.save')}
                </PillButton>
              ) : (
                <>
                  <PillButton tone="primary" icon="book" size="lg" full disabled>
                    {t('journal.save')}
                  </PillButton>
                  <div style={{
                    width: '80%', height: 12, borderRadius: 999,
                    border: '2px solid var(--color-ink)', background: 'var(--color-paper)', overflow: 'hidden',
                  }}>
                    <span style={{
                      display: 'block', height: '100%',
                      width: `${Math.min(100, (filledCount / 5) * 100)}%`,
                      background: 'var(--color-sun)',
                      transition: 'width .4s ease',
                    }} />
                  </div>
                  <p className="font-body text-ink-soft" style={{ fontSize: 16, textAlign: 'center', margin: 0 }}>
                    {t('journal.fillHint')} ({filledCount}/5)
                  </p>
                </>
              )}
            </div>
          </PaperCard>
        </>
      )}

      {/* ── Stimmungs-Kalender: 7-day strip. Each tile shows the last 7
             days' feeling doodle. Full month stays behind a "mehr"
             details. ── */}
      {(() => {
        // Build last 7 days (today at right) from journalHistory + today's live mood.
        const today = new Date();
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const iso = d.toISOString().slice(0, 10);
          const isToday = i === 0;
          const entry = isToday
            ? { mood: state.moodAM }
            : (state.journalHistory || []).find(h => h.date === iso);
          days.push({
            iso,
            label: d.toLocaleDateString(locale, { weekday: 'narrow' }),
            mood: entry?.mood ?? null,
            isToday,
          });
        }
        return (
          <section className="mb-7">
            <div className="flex items-center justify-between mb-4">
              <Sticker>{t('journal.moodCalendar')}</Sticker>
              <span className="font-headline font-semibold text-ink-soft" style={{ fontSize: 16 }}>
                {lang === 'de' ? 'letzte 7 Tage' : 'last 7 days'}
              </span>
            </div>
            <div className="grid grid-cols-7" style={{ gap: 5 }}>
              {days.map((d, i) => {
                const hasMood = d.mood !== null && d.mood !== undefined;
                return (
                  <div key={i}
                       className={`flex flex-col items-center justify-center rounded-[14px] ${d.isToday ? 'bg-sky-wash' : 'bg-paper'}`}
                       style={{
                         aspectRatio: '1 / 1.3',
                         border: d.isToday ? '2.5px solid var(--color-cobalt)' : '2px solid var(--color-ink)',
                         gap: 4,
                       }}>
                    <span className={`font-headline font-bold ${d.isToday ? 'text-cobalt' : 'text-ink-soft'}`}
                          style={{ fontSize: 15, lineHeight: 1 }}>
                      {d.label}
                    </span>
                    {hasMood ? (
                      <FeelingDoodle idx={d.mood} size={20} label={moodLabels[d.mood]} />
                    ) : (
                      <span className="text-ink-soft" style={{ fontSize: 18, lineHeight: 1, opacity: 0.5 }}>·</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Month expansion hidden behind details (legacy 28-day view) */}
            <details className="mt-4 rounded-[20px] border-2 border-ink bg-white group">
              <summary className="flex justify-between items-center px-4 cursor-pointer select-none list-none" style={{ minHeight: 48 }}>
                <span className="font-headline font-semibold text-ink" style={{ fontSize: 16 }}>
                  {lang === 'de' ? 'Ganzer Monat' : 'Full month'}
                </span>
                <span className="text-ink transition-transform group-open:-rotate-90 rotate-90" style={{ lineHeight: 0 }}>
                  <DoodleIcon name="arrow" size={14} stroke={8} />
                </span>
              </summary>
              <div className="px-4 pb-4">
                <div className="grid grid-cols-7 gap-y-2 gap-x-1.5">
                  {['M','D','M','D','F','S','S'].map((d, i) => (
                    <span key={i} className="font-headline font-semibold text-ink-soft text-center" style={{ fontSize: 14 }}>{d}</span>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => {
                    const dayNum = i + 1;
                    const td = today.getDate();
                    const isPast = dayNum < td;
                    const isToday = dayNum === td;
                    const colors = ['var(--color-leaf)', 'var(--color-sun)', 'var(--color-sky)', 'var(--color-sky-wash)', 'var(--color-paper-deep)'];
                    const col = isPast ? colors[dayNum % colors.length] : 'var(--color-paper-warm)';
                    return (
                      <div key={i} className="mx-auto rounded-full"
                           style={{
                             width: 14, height: 14,
                             border: isToday ? '2.5px solid var(--color-cobalt)' : '1.5px solid var(--color-ink)',
                             background: isToday && state.moodAM !== null ? 'var(--color-ember)' : col,
                           }} />
                    );
                  })}
                </div>
              </div>
            </details>
          </section>
        );
      })()}

      {/* ── Alte Abenteuer: past journal entries as paper pages with
             the feeling doodle, the day emoji, the date and a memory
             snippet. Tap opens the page. ── */}
      {history.length > 0 && (
        <section className="mb-8">
          <h3 className="flex items-center gap-2 mb-4">
            <Sticker>{lang === 'de' ? 'Alte Abenteuer' : 'Past adventures'}</Sticker>
            <span className="inline-flex items-center justify-center rounded-full border-2 border-ink bg-white font-headline font-bold text-ink"
                  style={{ minWidth: 30, height: 30, padding: '0 8px', fontSize: 15 }}>
              {history.length}
            </span>
          </h3>
          <div className="flex flex-col gap-3">
            {history.map(entry => {
              const open = viewingEntry === entry.date;
              return (
              <PaperCard key={entry.date} as="button" tone="paper" pad="none"
                onClick={() => { SFX.play('tap'); setViewingEntry(viewingEntry === entry.date ? null : entry.date); }}
                aria-expanded={open}
                className="w-full"
                style={{ padding: '12px 14px 12px 12px', borderWidth: open ? 3 : 2.5 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '34px 26px 1fr 20px',
                  gap: 10,
                  alignItems: 'center',
                }}>
                  <span className="flex items-center justify-center">
                    {entry.mood !== null && entry.mood !== undefined ? <FeelingDoodle idx={entry.mood} size={26} label={moodLabels[entry.mood]} /> : ''}
                  </span>
                  <span style={{ fontSize: 20, lineHeight: 1, textAlign: 'center' }}>
                    {entry.dayEmoji !== null && entry.dayEmoji !== undefined ? DAY_EMOJIS[entry.dayEmoji] : ''}
                  </span>
                  <div className="min-w-0">
                    <b className="font-headline font-bold text-ink block" style={{ fontSize: 17, lineHeight: 1.15, marginBottom: 2 }}>
                      {formatDate(entry.date)}
                    </b>
                    {!open && entry.memory && (
                      <span className="font-body text-ink-soft"
                            style={{
                              fontSize: 16, lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>
                        „{entry.memory}"
                      </span>
                    )}
                  </div>
                  <span className="text-ink flex justify-center" style={{ lineHeight: 0 }}>
                    <DoodleIcon name="arrow" size={14} stroke={8}
                                style={{ transform: open ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s ease' }} />
                  </span>
                </div>
                {/* Expanded page */}
                {open && (
                  <div className="mt-3 pt-3 flex flex-col gap-3" style={{ borderTop: '2px solid var(--color-ink)' }}>
                    {entry.memory && (
                      <p className="font-body text-ink rounded-[14px]"
                         style={{ fontSize: 17, lineHeight: `${RULE_GAP}px`, margin: 0, padding: '0 6px', ...RULED }}>
                        „{entry.memory}"
                      </p>
                    )}
                    {entry.gratitude.length > 0 && (
                      <div>
                        <p className="font-headline font-semibold text-ink-soft" style={{ fontSize: 16, margin: '0 0 6px' }}>{t('journal.gratefulFor')}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.gratitude.map(g => <Tag key={g}>{g}</Tag>)}
                        </div>
                      </div>
                    )}
                    {entry.achievements.length > 0 && (
                      <div>
                        <p className="font-headline font-semibold text-ink-soft" style={{ fontSize: 16, margin: '0 0 6px' }}>{t('journal.achieved')}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.achievements.map(a => <Tag key={a} star>{a}</Tag>)}
                        </div>
                      </div>
                    )}
                    {!entry.memory && entry.gratitude.length === 0 && entry.achievements.length === 0 && (
                      <p className="font-body text-ink-soft" style={{ fontSize: 16, margin: 0 }}>{t('journal.empty')}</p>
                    )}
                  </div>
                )}
              </PaperCard>
              );
            })}
          </div>
        </section>
      )}

      {/* v3 drops the separate Affirmation card: the rotating Ronki
           voice line at save handles the "felt" closing moment, and v3
           keeps the end of the scroll clean. Privacy line kept for
           kid-trust (Louis readability memo). */}

      {/* ── Privacy line ── */}
      <div className="flex justify-center items-center gap-2 py-6 text-ink-soft">
        <DoodleIcon name="lock" size={18} />
        <span className="font-headline font-semibold" style={{ fontSize: 16 }}>{t('journal.privacy')}</span>
      </div>
      </div>
      </div>

      {/* ── Zuklapp-Feier overlay (v3 lines 1894-1960).
             Flat dim night backdrop, a white paper card with the hard
             lift and a spring entrance (well under 1.5 s), the nodding
             Ronki face, the reward pills, "Schön!" to dismiss. Shown
             between handleSave and setBookOpen(false) so the ritual has
             a moment. ── */}
      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            key="close-overlay"
            className="fixed inset-0 grid place-items-center"
            style={{
              zIndex: 100,
              background: 'rgba(4, 34, 94, 0.55)',
              padding: 24,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={dismissOverlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="close-overlay-title">
            <motion.div
              className="text-center rounded-[28px] border-[3px] border-ink bg-white bb-lift"
              style={{
                width: '100%',
                maxWidth: 320,
                padding: '24px 22px 20px',
              }}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22, mass: 0.8 }}
              onClick={e => e.stopPropagation()}>
              {/* Nodding Ronki: the happy face in its sky-wash circle,
                   1.2s rotate -3deg to 3deg with a tiny y-float (off
                   under reduced motion via the global rule). */}
              <div style={{
                width: 104, height: 104, margin: '0 auto 18px',
                animation: 'ronkiNod 1.2s ease-in-out infinite',
              }}>
                <MoodChibi size={104} mood="gut" face />
              </div>
              <h3 id="close-overlay-title" className="bb-display text-ink"
                  style={{ margin: '0 0 8px', fontSize: 26 }}>
                {t('journal.celebrateTitle')}
              </h3>
              <p className="font-body text-ink-soft" style={{ margin: '0 0 16px', fontSize: 16, lineHeight: 1.4 }}>
                {t('journal.celebrateBody')}
              </p>
              <div className="flex flex-wrap justify-center" style={{ gap: 8, marginBottom: 20 }}>
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-sun font-headline font-bold text-ink"
                      style={{ padding: '6px 12px', fontSize: 16, lineHeight: 1 }}>
                  <span style={{ color: 'var(--color-ember)', lineHeight: 0 }}><DoodleIcon name="heart" size={16} filled stroke={3} /></span>
                  {t('journal.celebrateHp')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-sky-wash font-headline font-bold text-ink"
                      style={{ padding: '6px 12px', fontSize: 16, lineHeight: 1 }}>
                  <span className="text-cobalt" style={{ lineHeight: 0 }}><DoodleIcon name="book" size={16} /></span>
                  {t('journal.celebrateChapter')}
                </span>
              </div>
              <PillButton tone="primary" full onClick={dismissOverlay}>
                {t('journal.celebrateDone')}
              </PillButton>
            </motion.div>
            <style>{`
              @keyframes ronkiNod {
                0%, 100% { transform: rotate(-3deg); }
                50% { transform: rotate(3deg) translateY(-2px); }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
