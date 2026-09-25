import React, { useMemo } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { findArc } from '../arcs/arcs';
import { RonkiArt } from './MoodChibi';
import { TopBar, PaperCard, DoodleIcon } from './bilderbuch';
import { FeelingDoodle } from './JournalFeelings';

/**
 * Buch: storybook chapter view ("Unser Buch", Bilderbuch pass 25 Sep 2026).
 *
 * Marc Apr 2026: "start the v2 storybook redesign so that we can fold
 * it into the Erinnerungen tab in the profile." This is the full home
 * for Louis's story with Ronki: every journaled day and every adventure
 * survived lives here as a chapter card.
 *
 * Architecture:
 *   · Data source = same as the profile's ErinnerungenList but richer:
 *     journalHistory entries + completed arcs + badges.
 *   · One chapter per journal-history day, ordered newest-first.
 *     Arc/badge milestones fold into the chapter for the day they
 *     happened; if no journal entry exists for that date, a synthetic
 *     "milestone-only" chapter is created.
 *   · Chapter card: a white page with the hard paper lift on the paper
 *     ground of the book. Chapter number as a sun sticker, the date,
 *     the feeling marks, a drawn Ronki pose per chapter, the narrative
 *     title, the log entries, and a polaroid + sticker strip + star
 *     pill at the bottom. Milestone days get the forest scene.
 */

export default function Buch({ onNavigate }) {
  const { state } = useTask();
  const { t, locale, lang } = useTranslation();

  const chapters = useMemo(() => buildChapters(state, t, lang), [state, t, lang]);
  const totalDays = state?.totalTaskDays || chapters.length;

  return (
    <div className="relative min-h-dvh pb-32 bg-paper">
      {/* The paper ground of the book reaches under the alpha banner
           spacer too, so no white band shows above the page. */}
      <div aria-hidden="true" className="fixed inset-0 bg-paper pointer-events-none" style={{ zIndex: -1 }} />
      {/* Top bar: back to Ronki's page. */}
      <TopBar
        onBack={() => onNavigate?.('ronki')}
        backLabel={lang === 'de' ? 'Zurück zu Ronki' : 'Back to Ronki'}
      />

      {/* Title page */}
      <header className="max-w-lg mx-auto px-5" style={{ paddingTop: 4 }}>
        <h1 className="bb-display text-ink" style={{ fontSize: 38, margin: '0 0 8px' }}>
          {lang === 'de' ? 'Euer Buch' : 'Your Book'}
        </h1>
        <p className="font-headline font-semibold text-ink-soft" style={{ fontSize: 17, lineHeight: 1.35, margin: 0, maxWidth: 340 }}>
          {totalDays > 0
            ? (lang === 'de'
              ? `${totalDays} ${totalDays === 1 ? 'Tag' : 'Tage'} · ${chapters.length} ${chapters.length === 1 ? 'Kapitel' : 'Kapitel'}`
              : `${totalDays} ${totalDays === 1 ? 'day' : 'days'} · ${chapters.length} ${chapters.length === 1 ? 'chapter' : 'chapters'}`)
            : (lang === 'de' ? 'Eure Geschichte beginnt bald.' : 'Your story begins soon.')}
        </p>
      </header>

      {/* Chapters */}
      <main className="max-w-lg mx-auto px-5 pt-6">
        {chapters.length === 0 ? (
          <PaperCard lift className="text-center flex flex-col items-center">
            <RonkiArt pose="wave" size={140} />
            <b className="font-headline font-bold text-ink block mt-2 mb-1" style={{ fontSize: 20 }}>
              {lang === 'de' ? 'Das erste Kapitel wartet' : 'The first chapter is waiting'}
            </b>
            <p className="font-body text-ink-soft" style={{ fontSize: 16, lineHeight: 1.5, margin: 0 }}>
              {lang === 'de'
                ? 'Schreib heute etwas ins Tagebuch, und Ronki erinnert sich daran.'
                : 'Write something in the journal today, and Ronki will remember.'}
            </p>
          </PaperCard>
        ) : (
          <div className="flex flex-col gap-7">
            {chapters.map((c, idx) => (
              <ChapterCard key={c.key}
                           chapter={c}
                           chapterNum={chapters.length - idx}
                           locale={locale}
                           lang={lang} />
            ))}
            <p className="text-center font-headline font-semibold text-ink-soft py-6" style={{ fontSize: 16, margin: 0 }}>
              {lang === 'de' ? 'Mehr Kapitel folgen.' : 'More chapters to come.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// ── ChapterCard ───────────────────────────────────────────────────────
// One chapter = one day worth of memories: a white page with the hard
// paper lift. Milestone days (completed arcs, badges) carry the forest
// scene and a "Meilenstein" sticker. Every chapter has one drawn Ronki:
// cheering on milestone days, with his cloud on a day he needed the
// kid, waving or holding a leaf on the other days.

const ART = `${import.meta.env.BASE_URL}art/bilderbuch/`;

function chapterPose(chapter, chapterNum) {
  if (chapter.milestones.length > 0) return 'cheer';
  if (chapter.logEntries.some(e => e.tag)) return 'cloud';
  return chapterNum % 2 ? 'wave' : 'leaf';
}

function ChapterCard({ chapter, chapterNum, locale, lang }) {
  const dateText = formatDate(chapter.date, locale);
  const isMilestone = chapter.milestones.length > 0;

  return (
    <PaperCard as="article" lift pad="none" className="relative"
               style={{ padding: '18px 18px 16px' }}>
      {/* Ronki for this chapter, stepping out of the top corner of the page */}
      <RonkiArt pose={chapterPose(chapter, chapterNum)} size={88}
                style={{ position: 'absolute', top: -26, right: 6, pointerEvents: 'none' }} />

      {/* Head: chapter number as a sun sticker + date + feeling marks */}
      <header className="flex flex-col gap-2 mb-3" style={{ paddingRight: 86 }}>
        <span className="bb-hand self-start inline-block rounded-[10px] bg-sun px-3 py-1.5 text-lg uppercase leading-none text-ink"
              style={{ transform: 'rotate(-2.5deg)' }}>
          {lang === 'de' ? `Kapitel ${chapterNum}` : `Chapter ${chapterNum}`}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-headline font-semibold text-ink-soft" style={{ fontSize: 16 }}>
            {dateText}
          </span>
          {chapter.metaBubbles.slice(0, 3).map((m, i) => (
            <span key={i} className="inline-flex items-center justify-center rounded-full border-2 border-ink bg-white"
                  style={{ width: 32, height: 32 }}>
              {m.kind === 'mood' ? (
                <FeelingDoodle idx={m.idx} size={18} />
              ) : (
                <span className="text-sun-deep" style={{ lineHeight: 0 }}>
                  <DoodleIcon name={m.kind === 'arc' ? 'sparkle' : 'star'} size={16} filled stroke={3} />
                </span>
              )}
            </span>
          ))}
        </div>
      </header>

      {/* Chapter title: narrative phrase */}
      <h2 className="bb-display text-ink"
          style={{ fontSize: 23, lineHeight: 1.15, margin: '0 0 14px 0' }}>
          {chapter.title}
      </h2>

      {/* Scene: only on milestone chapters (completed arcs, badges),
          where it carries meaning. Normal-day chapters skip it so they
          don't read as empty rectangles (Marc 24 Apr 2026: "all look
          flawed"). */}
      {isMilestone && chapter.scene && (
        <div className="bb-frame relative mb-4" style={{ width: '100%', aspectRatio: '16 / 7' }}>
          <img src={chapter.scene} alt="" loading="lazy" decoding="async"
               style={{ objectPosition: '50% 62%' }} />
          <span className="bb-hand absolute inline-block rounded-[10px] bg-sun px-3 py-1.5 text-lg uppercase leading-none text-ink"
                style={{ top: 10, right: 10, transform: 'rotate(2deg)', border: '2px solid var(--color-ink)' }}>
            {lang === 'de' ? 'Meilenstein' : 'Milestone'}
          </span>
        </div>
      )}

      {/* Log: dashed leader, Louis-voice entries + optional Ronki tag */}
      {chapter.logEntries.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 12,
          padding: '0 2px 0 16px',
          marginBottom: 14,
          marginLeft: 4,
          borderLeft: '2.5px dashed var(--color-paper-deep)',
        }}>
          {chapter.logEntries.map((entry, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <span aria-hidden="true" style={{
                position: 'absolute', left: -25, top: 5,
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--color-sun)',
                border: '2px solid var(--color-ink)',
              }} />
              {entry.tag && (
                <span className="inline-block rounded-full border-2 border-ink bg-sky-wash font-headline font-semibold text-ink"
                      style={{ padding: '3px 10px', fontSize: 14, lineHeight: 1.1, marginBottom: 6 }}>
                  {entry.tag}
                </span>
              )}
              <p className="font-body text-ink" style={{
                margin: 0,
                fontSize: 17, lineHeight: 1.5,
                textWrap: 'pretty',
              }}>
                {entry.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer: polaroid + sticker wall + star pill */}
      {(chapter.polaroid || chapter.stickers.length > 0 || chapter.xpEarned > 0) && (
      <footer className="grid gap-4 pt-4"
              style={{
                gridTemplateColumns: chapter.polaroid && (chapter.stickers.length > 0 || chapter.xpEarned > 0) ? '1fr 1.2fr' : '1fr',
                borderTop: '2px dashed var(--color-paper-deep)',
              }}>
        {chapter.polaroid && (
          <div
            className="border-2 border-ink bg-white"
            style={{
              padding: '8px 8px 12px',
              transform: 'rotate(-1.5deg)',
              transformOrigin: 'center',
              maxWidth: 150,
            }}>
            <div className="border-2 border-ink" style={{
              aspectRatio: '1 / 1',
              background: chapter.polaroidBg,
              display: 'grid', placeItems: 'center',
              borderRadius: 4,
              marginBottom: 8,
              fontSize: 40,
            }}>
              {chapter.polaroid}
            </div>
            <p className="font-headline font-semibold text-ink text-center" style={{ margin: 0, fontSize: 14, lineHeight: 1.2 }}>
              {chapter.polaroidCaption}
            </p>
          </div>
        )}
        {(chapter.stickers.length > 0 || chapter.xpEarned > 0) && (
          <div className="flex flex-col gap-2">
            {chapter.stickers.length > 0 && (
              <>
                <span className="font-headline font-semibold text-ink-soft" style={{ fontSize: 16, lineHeight: 1.2 }}>
                  {lang === 'de' ? 'Was lebendig blieb' : 'What stayed alive'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {chapter.stickers.map((s, i) => (
                    <div key={i}
                         title={s.label}
                         className="rounded-[12px] border-2 border-ink bg-paper"
                         style={{
                           width: 38, height: 38,
                           display: 'grid', placeItems: 'center',
                           fontSize: 20,
                           transform: `rotate(${i % 2 ? 3 : -3}deg)`,
                         }}>
                      {s.emoji}
                    </div>
                  ))}
                </div>
              </>
            )}
            {chapter.xpEarned > 0 && (
              <div style={{ marginTop: 'auto', paddingTop: 4 }}>
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-sun font-headline font-bold text-ink"
                      style={{ padding: '5px 12px', fontSize: 16, lineHeight: 1 }}>
                  <DoodleIcon name="star" size={16} filled stroke={3} />
                  +{chapter.xpEarned}
                </span>
              </div>
            )}
          </div>
        )}
      </footer>
      )}
    </PaperCard>
  );
}

// ── Chapter builder ───────────────────────────────────────────────────
// Groups raw state into one chapter per date. Journal entries provide
// the narrative body + polaroid emoji; arcs/badges land as milestones
// that give the chapter the forest scene and a "Meilenstein" sticker.

const GRATITUDE_EMOJI = {
  Familie: '👨‍👩‍👧', Freunde: '👋', Spielen: '🎮', Essen: '🍎',
  Natur: '🌳', Schule: '🏫', Ronki: '🐉',
  Family: '👨‍👩‍👧', Friends: '👋', Play: '🎮', Food: '🍎', Nature: '🌳', School: '🏫',
};

// Polaroid "photo" grounds: flat token colours, no gradient.
const POLAROID_BG = 'var(--color-sky-wash)';
const POLAROID_BG_BONDING = 'var(--color-paper-deep)';

function buildChapters(state, t, lang) {
  if (!state) return [];
  const byDate = new Map();

  const ensureBucket = (date) => {
    if (!byDate.has(date)) {
      byDate.set(date, { date, logEntries: [], milestones: [], stickers: [], metaBubbles: [], polaroid: null, polaroidBg: POLAROID_BG, polaroidCaption: '', xpEarned: 0 });
    }
    return byDate.get(date);
  };

  // 1. Journal history: the primary narrative source.
  (state.journalHistory || []).forEach(j => {
    if (!j?.date) return;
    const bucket = ensureBucket(j.date);
    const isBondingAgent = (j.achievements || []).includes('ronki-bad-day');
    if (j.memory) {
      bucket.logEntries.push({
        text: j.memory,
        tag: isBondingAgent ? (lang === 'de' ? 'Ronki-Moment' : 'Ronki moment') : null,
      });
    }
    if (j.dayEmoji !== null && j.dayEmoji !== undefined) {
      const dayEmojis = ["⭐", "🎈", "🍦", "🎨", "⚽", "🍕", "🎮", "🌈", "🐶"];
      const emoji = dayEmojis[j.dayEmoji] || '📔';
      bucket.polaroid = emoji;
      bucket.polaroidCaption = formatDate(j.date, lang === 'de' ? 'de-DE' : 'en-US');
    } else if (isBondingAgent && !bucket.polaroid) {
      bucket.polaroid = '🫂';
      bucket.polaroidCaption = lang === 'de' ? 'Für Ronki da' : 'For Ronki';
      bucket.polaroidBg = POLAROID_BG_BONDING;
    }
    (j.gratitude || []).forEach(g => {
      bucket.stickers.push({ emoji: GRATITUDE_EMOJI[g] || '💛', label: g });
    });
    if (typeof j.mood === 'number') {
      // Feeling mark: the same doodle as in the Tagebuch.
      bucket.metaBubbles.push({ kind: 'mood', idx: j.mood });
    }
  });

  // 2. Completed arcs: milestones with their own synthetic logline.
  const completedAt = state?.arcEngine?.completedAt || {};
  (state?.arcEngine?.completedArcIds || []).forEach(arcId => {
    const arc = findArc(arcId);
    if (!arc) return;
    const date = completedAt[arcId] || null;
    if (!date) return; // skip arcs without a landing date
    const bucket = ensureBucket(date);
    const arcTitle = t ? t(arc.titleKey) : arcId;
    bucket.milestones.push({ kind: 'arc', label: arcTitle });
    bucket.logEntries.push({
      text: lang === 'de'
        ? `„${arcTitle}" bestanden. Ronki und ich waren tapfer.`
        : `Survived "${arcTitle}". Ronki and I were brave.`,
      tag: null,
    });
    bucket.metaBubbles.push({ kind: 'arc' });
  });

  // 3. Badges: attach to today (no dated log exists) with a synthetic
  // milestone. Boss trophies removed from the Buch chapter builder
  // (Marc 23 Apr 2026: "let's remove boss besiegt under eure geschichte").
  // Bosses belong on the trophy wall, not mixed into the memory chapters.
  const today = new Date().toISOString().slice(0, 10);
  (state?.unlockedBadges || []).forEach(badgeId => {
    const bucket = ensureBucket(today);
    bucket.milestones.push({ kind: 'badge', label: badgeId });
    bucket.metaBubbles.push({ kind: 'badge' });
  });

  // Build the ordered list + synthesize titles, scenes, star totals.
  // Drop buckets with NO real content (no log entries, no milestone,
  // no polaroid, no stickers); otherwise we render hollow "Ein leiser
  // Tag" chapters (Marc 24 Apr 2026: "the book so far doesn't really
  // create real entries as they all look flawed").
  const list = Array.from(byDate.values())
    .filter(b =>
      b.logEntries.length > 0 ||
      b.milestones.length > 0 ||
      !!b.polaroid ||
      b.stickers.length > 0
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return list.map(bucket => {
    const isMilestone = bucket.milestones.length > 0;
    const title = synthesizeTitle(bucket, lang);
    const scene = isMilestone ? `${ART}scenes/morgenwald.webp` : null;
    const xpEarned = bucket.milestones.length * 10 + bucket.logEntries.length * 2;
    return {
      ...bucket,
      key: bucket.date,
      title,
      scene,
      xpEarned,
    };
  });
}

// Synthesize a narrative title for the chapter. Uses milestone info
// when it exists; otherwise pulls from the first log entry or falls
// back to a gentle default. Future: LLM-assisted naming; for now,
// template-driven keeps it predictable.
function synthesizeTitle(bucket, lang) {
  const de = lang === 'de';
  // If an arc is the main milestone, use its title prefixed with "Der Tag…"
  const arcMs = bucket.milestones.find(m => m.kind === 'arc');
  if (arcMs) {
    return de ? `Der Tag, an dem wir „${arcMs.label}" bestanden` : `The day we survived "${arcMs.label}"`;
  }
  // Boss-milestone titles removed with the boss-entries removal above
  // (Marc 23 Apr 2026). If future trophies re-enter the Buch, add the
  // kind === 'boss' branch back here.
  const bondingEntry = bucket.logEntries.find(e => e.tag);
  if (bondingEntry) {
    return de ? 'Der Tag, an dem Ronki mich brauchte' : 'The day Ronki needed me';
  }
  if (bucket.logEntries.length > 0) {
    const firstLine = bucket.logEntries[0].text;
    // Use the first sentence as the title, truncated if needed
    const firstSentence = firstLine.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 0 && firstSentence.length < 60) {
      return firstSentence;
    }
  }
  return de ? 'Ein leiser Tag' : 'A quiet day';
}

function formatDate(dateStr, locale) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString(locale || 'de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch (_) {
    return dateStr;
  }
}
