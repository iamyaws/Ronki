import React, { useRef, useState } from 'react';
import { T, ANCHORS, QUEST_GROUPS, RAINBOW, RAINBOW_LABELS, MOOD_EMOJIS, SCHOOL_QUESTS, VACATION_QUESTS, COMPANION_TYPES } from '../constants';
import SFX from '../utils/sfx';
import { useGame } from '../context/GameContext';
import useWeather, { getWeatherInfo } from '../hooks/useWeather';

const COMPANION_MESSAGES = [
  "fühlt sich stärker!",
  "freut sich über dich!",
  "wird glücklicher!",
  "bekommt Energie!",
  "ist stolz auf dich!",
  "wächst ein bisschen!",
];

export default function QuestBoard() {
  const { state, computed, actions, ui } = useGame();
  const { allDone, done, total, pct, byA, byGroup, level } = computed;
  const { pMode, setQuestOpen, nq, setNq } = ui;
  const nqRef = useRef(null);
  const fileRef = useRef(null);
  const { weather } = useWeather();
  const [companionMsg, setCompanionMsg] = useState(null);

  const companionName = state.catName || COMPANION_TYPES[state.companionType]?.name || "Begleiter";

  const handleComplete = (qId) => {
    actions.complete(qId);
    if (navigator.vibrate) navigator.vibrate(80);
    const msg = COMPANION_MESSAGES[Math.floor(Math.random() * COMPANION_MESSAGES.length)];
    setCompanionMsg(`${companionName} ${msg}`);
    setTimeout(() => setCompanionMsg(null), 4500);
  };

  function getClothingHint(temp) {
    if (temp === null || temp === undefined) return null;
    if (temp < 0) return { text: "Brr! Winterjacke + Mütze!", emoji: "🧥" };
    if (temp < 10) return { text: "Jacke + langer Pulli!", emoji: "🧥" };
    if (temp < 18) return { text: "Leichte Jacke mitnehmen!", emoji: "🧤" };
    if (temp < 25) return { text: "T-Shirt reicht!", emoji: "👕" };
    return { text: "Kurze Hose! Sonnencreme!", emoji: "☀️" };
  }

  // Weekly lunch local state
  const DAYS = ["Mo", "Di", "Mi", "Do", "Fr"];
  const [lunchDraft, setLunchDraft] = useState(() => {
    const wl = state.weeklyLunch || {};
    return { Mo: wl.Mo || "", Di: wl.Di || "", Mi: wl.Mi || "", Do: wl.Do || "", Fr: wl.Fr || "" };
  });

  // Special mission creator local state
  const [smName, setSmName] = useState("");
  const [smEmoji, setSmEmoji] = useState("🎁");
  const [smHp, setSmHp] = useState(30);
  const SM_EMOJIS = ["🎁", "🦷", "🏥", "⚽", "🎵", "📝", "🧹", "🎨"];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center">
      {/* Backdrop */}
      <div
        className="flex-none h-[50px] w-full bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={() => { setQuestOpen(false); window.scrollTo(0, 0); }}
      />

      {/* Sheet */}
      <div className="flex-1 w-full max-w-lg bg-surface rounded-t-[2rem] overflow-auto relative"
           style={{ animation: "slideUp .3s ease", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)", paddingBottom: 100 }}>

        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-xl pt-3 pb-2 px-6 rounded-t-[2rem]">
          <div className="w-11 h-1.5 rounded-full bg-outline-variant/30 mx-auto mb-3" />
          <div className="flex items-center gap-3">
            <button
              aria-label="Aufgaben schließen"
              onClick={() => { setQuestOpen(false); window.scrollTo(0, 0); }}
              className="btn-tap w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <h2 className="flex-1 font-headline text-xl font-bold text-on-surface">Abenteuer</h2>
            {!allDone && (
              <span className="font-label text-sm font-bold text-primary">{done}/{total}</span>
            )}
          </div>
        </div>

        <div className="px-6 pt-4 space-y-6">

          {/* ── Companion feedback ── */}
          {companionMsg && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary-container/20 border border-secondary-container/30"
                 style={{ animation: "celebText 2.5s ease-out forwards" }}>
              <span className="text-xl">{COMPANION_TYPES[state.companionType]?.emoji || "🐱"}</span>
              <span className="font-headline text-sm font-bold text-secondary">{companionMsg}</span>
            </div>
          )}

          {/* ── Phone-free reminder ── */}
          <div className="flex items-center gap-3 px-5 py-4 rounded-lg bg-primary-fixed/40 border border-primary/5">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              phone_disabled
            </span>
            <p className="font-label font-bold text-sm text-primary">
              Hände frei! Schau dir deine Aufgaben an und leg das Handy weg.
            </p>
          </div>

          {/* ── Comeback Quest ── */}
          {state.comebackActive && (
            <div className="mm-card p-5 border border-tertiary-fixed-dim/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
                  <span className="text-xl">🐱</span>
                </div>
                <div className="flex-1">
                  <p className="font-label font-bold text-sm text-tertiary uppercase tracking-wider">Willkommen zurück!</p>
                  <p className="font-body text-sm text-on-surface-variant">Deine Katze hat auf dich gewartet!</p>
                </div>
              </div>
              <button
                className="btn-tap w-full mt-3 py-3 rounded-full bg-primary-container text-white font-label font-bold text-sm"
                onClick={actions.completeComeback}
              >
                🐾 Ich bin wieder da! (+15 ⭐)
              </button>
            </div>
          )}

          {/* ── Overall Progress ── */}
          <div className={`rounded-lg p-5 ${allDone ? 'bg-emerald/5 border border-emerald/20' : 'bg-surface-container-lowest'}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`font-label font-bold text-sm uppercase tracking-wider ${allDone ? 'text-emerald-dark' : 'text-on-surface'}`}>
                {allDone ? "💪 Durchgehalten!" : `${done}/${total} Aufgaben`}
              </span>
              <span className="font-label font-bold text-sm text-primary">+{state.dt} Min</span>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-600"
                style={{
                  width: `${pct * 100}%`,
                  background: allDone
                    ? 'linear-gradient(90deg, #34D399, #6EE7B7)'
                    : 'linear-gradient(90deg, #5300b7, #6d28d9)',
                }}
              />
            </div>
          </div>

          {/* ── All-done celebration ── */}
          {allDone && (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">🏆</div>
              <h3 className="font-headline text-xl font-bold text-primary">Alle Aufgaben geschafft!</h3>
              <p className="font-body text-on-surface-variant mt-1">Du bist ein wahrer Held! Genieß den Rest des Tages.</p>
            </div>
          )}

          {/* ── Evening mood ── */}
          {allDone && state.moodPM === null && (
            <div className="mm-card p-5">
              <p className="font-label font-bold text-xs uppercase tracking-widest text-primary mb-4">
                🌙 Worauf bist du heute stolz?
              </p>
              <div role="group" aria-label="Abendstimmung wählen" className="flex justify-between gap-2">
                {MOOD_EMOJIS.map((e, i) => (
                  <button
                    key={i}
                    aria-label={`Stimmung ${i + 1} von 6`}
                    onClick={() => actions.setMood("moodPM", i)}
                    className={`btn-tap text-3xl p-2 rounded-full transition-all ${
                      state.moodPM === i ? 'bg-primary-container scale-110' : 'hover:bg-surface-container'
                    }`}
                    style={{ minHeight: 48, minWidth: 44 }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Rainbow ── */}
          <div className="mm-card p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant">
                🌈 Iss den Regenbogen
              </span>
              {(state.rainbow || []).every(Boolean) && (
                <span className="font-label font-bold text-xs text-emerald-dark">+25 ⭐! 🎉</span>
              )}
            </div>
            <div className="flex gap-2 justify-between">
              {RAINBOW.map((emoji, i) => {
                const d = (state.rainbow || [])[i];
                return (
                  <button
                    key={i}
                    aria-label={`${RAINBOW_LABELS[i]} ${d ? "gegessen" : "nicht gegessen"}`}
                    aria-pressed={d}
                    onClick={() => actions.toggleRainbow(i)}
                    className={`btn-tap flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                      d ? 'bg-emerald/10 border-2 border-emerald/30 opacity-100' : 'bg-surface-container border-2 border-transparent opacity-50'
                    }`}
                    style={{ minHeight: 48 }}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className={`font-label text-[10px] font-bold ${d ? 'text-emerald-dark' : 'text-on-surface-variant'}`}>
                      {RAINBOW_LABELS[i]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Parent nudge ── */}
          {allDone && (
            <div className="bg-secondary-fixed/20 border-l-4 border-secondary p-4 rounded-r-lg">
              <p className="font-body text-sm font-bold text-secondary text-center">
                Auch Mama und Papa dürfen das Handy mal weglegen 😄
              </p>
            </div>
          )}

          {/* ── Epic Quest Groups (collapsible) ── */}
          {Object.entries(QUEST_GROUPS).map(([a, m]) => {
            const qs = (byGroup?.[a] || []).filter(q => !q.sideQuest);
            if (!qs.length) return null;
            const secDone = qs.every(q => q.done);
            const doneCount = qs.filter(q => q.done).length;
            const firstUndoneIdx = qs.findIndex(q => !q.done);

            return (
              <details key={a} className="group mm-card overflow-hidden border border-primary/5" open={!secDone}>
                <summary className="p-5 cursor-pointer list-none lotus-pattern">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                           style={{ background: `${m.col}15` }}>
                        {m.icon}
                      </div>
                      <div>
                        <h3 className="font-headline text-xl font-bold text-on-surface">{m.label}</h3>
                        <p className="font-label text-sm font-medium text-on-surface/60">
                          {secDone ? 'Geschafft! ✓' : `Noch ${qs.length - doneCount} Aufgaben`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Progress ring */}
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                          <circle className="text-outline-variant/20" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4" />
                          <circle
                            cx="24" cy="24" fill="transparent" r="20" strokeWidth="4"
                            stroke={secDone ? '#34d399' : m.col}
                            strokeDasharray={125.6}
                            strokeDashoffset={125.6 - (doneCount / qs.length) * 125.6}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute font-label text-[10px] font-bold">{doneCount}/{qs.length}</span>
                      </div>
                      <span className="material-symbols-outlined text-on-surface/40 group-open:rotate-180 transition-transform">
                        expand_more
                      </span>
                    </div>
                  </div>
                </summary>

                <div className="px-5 pb-5 pt-2 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-4 rounded-full" style={{ background: m.col }} />
                    <span className="font-label text-xs font-bold uppercase tracking-wider text-on-surface/60">{m.label}-Aufgaben</span>
                  </div>

                  {qs.map((q, idx) => {
                    const isLast = idx === qs.length - 1;
                    const isNext = idx === firstUndoneIdx;
                    const isRepeatable = q.target && q.target > 1;
                    const curCompletions = q.completions || 0;
                    const maxTaps = isRepeatable ? (q.bonus || q.target) : 1;
                    const fullyDone = isRepeatable ? curCompletions >= maxTaps : q.done;
                    const atTarget = isRepeatable && curCompletions >= q.target;
                    const isBonus = isRepeatable && curCompletions >= q.target && curCompletions < maxTaps;
                    const canTap = isRepeatable ? curCompletions < maxTaps : !q.done;

                    return (
                      <div key={q.id} className="relative flex items-center gap-4">
                        {/* Checkmark circle */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            fullyDone
                              ? 'bg-emerald text-white'
                              : 'border-2 border-outline-variant hover:border-primary-container cursor-pointer'
                          }`}
                          onClick={() => canTap && !pMode && handleComplete(q.id)}
                        >
                          {fullyDone && (
                            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              check_circle
                            </span>
                          )}
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                          <div className={`absolute left-5 top-12 w-0.5 h-[calc(100%-12px)] ${fullyDone ? 'bg-emerald/40' : 'bg-outline-variant/20'}`} />
                        )}

                        {/* Quest card */}
                        <button
                          className={`btn-tap flex-1 flex items-center gap-4 p-5 rounded-xl transition-all ${
                            fullyDone
                              ? 'bg-surface-container-low/50 opacity-60'
                              : isNext && canTap
                                ? 'bg-surface-container-lowest border-2 border-primary/10 shadow-sm'
                                : 'bg-surface-container-lowest'
                          }`}
                          onClick={() => canTap && !pMode && handleComplete(q.id)}
                          disabled={!canTap && !pMode}
                          style={{ minHeight: 64 }}
                        >
                          <span className="text-xl">{q.icon}</span>
                          <div className="flex-1 text-left">
                            <p className={`font-label font-bold text-lg ${fullyDone ? 'line-through text-on-surface/40' : 'text-on-surface'}`}>
                              {q.name}
                            </p>
                            {/* Weather hint for Anziehen */}
                            {(q.id === "s4" || q.id === "v4") && !q.done && weather?.daily?.[0] && (() => {
                              const hint = getClothingHint(weather.daily[0].tempMax);
                              if (!hint) return null;
                              return (
                                <p className="font-body text-xs text-[#0284C7] mt-1">
                                  {hint.emoji} {weather.daily[0].tempMin}°/{weather.daily[0].tempMax}° — {hint.text}
                                </p>
                              );
                            })()}
                            {/* Rewards row */}
                            <div className="flex gap-2 mt-1 items-center flex-wrap">
                              <span className={`font-label text-sm font-bold ${fullyDone ? 'text-emerald-dark' : 'text-primary'}`}>+{q.xp} XP</span>
                              {q.streak > 0 && <span className="font-label text-xs font-bold text-tertiary">🔥{q.streak}</span>}
                              {isRepeatable && (
                                <span className={`font-label text-[10px] font-bold px-2 py-0.5 rounded-full ${atTarget ? 'bg-emerald/10 text-emerald-dark' : 'bg-primary/10 text-primary'}`}>
                                  {curCompletions}/{q.target}{atTarget ? " ✅" : ""}
                                </span>
                              )}
                              {isBonus && (
                                <span className="font-label text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                                  +1 Bonus!
                                </span>
                              )}
                            </div>
                          </div>

                          {/* XP reward badge */}
                          {canTap && (
                            <div className="flex flex-col items-center bg-secondary-container/20 border border-secondary-container/40 rounded-lg px-2 py-1.5">
                              <span className="text-sm">⭐</span>
                              <span className="font-label text-xs font-bold text-secondary">{q.xp}</span>
                            </div>
                          )}

                          {/* Parent remove button */}
                          {pMode && (
                            <button
                              aria-label={`${q.name} entfernen`}
                              onClick={e => { e.stopPropagation(); actions.rmQuest(q.id); }}
                              className="bg-error-container/50 border border-error/30 rounded-lg px-2 py-1 text-error font-bold text-xs"
                              style={{ minHeight: 36 }}
                            >✕</button>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}

          {/* ── Side-Quests (Bonus-Aufgaben) ── */}
          {(() => {
            const sideQuests = state.quests.filter(q => q.sideQuest);
            if (!sideQuests.length) return null;
            return (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">Bonus-Aufgaben</span>
                  <span className="font-label text-xs text-on-surface-variant">Optional</span>
                </div>
                <div className="space-y-2">
                  {sideQuests.map(q => {
                    const canTap = !q.done;
                    return (
                      <button
                        key={q.id}
                        className={`btn-tap w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                          q.done ? 'bg-secondary-fixed/20 opacity-70' : 'bg-surface-container-lowest border border-secondary-container/20'
                        }`}
                        onClick={() => canTap && !pMode && handleComplete(q.id)}
                        disabled={!canTap && !pMode}
                        style={{ minHeight: 56 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-secondary-fixed/30 flex items-center justify-center text-lg shrink-0">
                          {q.done ? "✅" : q.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`font-label font-bold text-sm ${q.done ? 'line-through text-on-surface/40' : 'text-on-surface'}`}>{q.name}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="font-label text-xs font-bold text-secondary">+{q.xp} ⭐</span>
                            <span className="font-label text-xs font-bold text-tertiary">+{q.minutes} Min</span>
                          </div>
                        </div>
                        {canTap && (
                          <div className="flex flex-col items-center bg-secondary-container/20 border border-secondary-container/40 rounded-lg px-2 py-1.5">
                            <span className="text-sm">⭐</span>
                            <span className="font-label text-xs font-bold text-secondary">{q.xp}</span>
                          </div>
                        )}
                        {pMode && (
                          <button
                            aria-label={`${q.name} entfernen`}
                            onClick={e => { e.stopPropagation(); actions.rmQuest(q.id); }}
                            className="bg-error-container/50 border border-error/30 rounded-lg px-2 py-1 text-error font-bold text-xs"
                          >✕</button>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ── Quest Chain Manager (parent mode) ── */}
          {pMode && (state.questChains || []).length > 0 && (
            <div className="mm-card p-5 border border-primary/10">
              <h3 className="font-label font-bold text-xs uppercase tracking-widest text-primary mb-4">🔗 Abenteuer-Ketten</h3>
              <div className="space-y-2">
                {(state.questChains || []).map(c => (
                  <div key={c.id} className={`flex items-center gap-3 p-3 rounded-lg border ${c.completed ? 'bg-emerald/5 border-emerald/20' : 'bg-surface-container-low border-transparent'}`}>
                    <span className="text-xl">{c.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-label font-bold text-sm ${c.completed ? 'line-through text-on-surface/40' : 'text-on-surface'}`}>{c.name}</p>
                      <p className="font-label text-xs font-bold text-primary">{c.steps.filter(s => s.done).length}/{c.steps.length} Schritte &middot; +{c.hp} HP</p>
                    </div>
                    <button onClick={() => actions.removeQuestChain(c.id)} className="bg-error-container/50 border border-error/30 rounded-lg px-2 py-1 text-error font-bold text-xs">❌</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Parent Panel ── */}
          {pMode && (
            <div className="mm-card p-6 border border-primary/10 space-y-4">
              <h3 className="font-label font-bold text-xs uppercase tracking-widest text-primary">⚙️ Eltern</h3>

              {/* Vacation toggle */}
              <button onClick={actions.togVac} className="w-full flex items-center justify-between p-4 rounded-lg bg-surface-container-low border border-outline-variant/20 transition-colors" style={{ minHeight: 48 }}>
                <span className="font-label font-bold text-sm">{state.vacMode ? "🏖️ Ferienmodus" : "📚 Schulmodus"}</span>
                <div className={`w-11 h-6 rounded-full relative transition-all ${state.vacMode ? 'bg-emerald' : 'bg-outline-variant/40'}`}>
                  <div className={`w-4.5 h-4.5 rounded-full bg-white absolute top-[3px] transition-all shadow-sm ${state.vacMode ? 'left-[23px]' : 'left-[3px]'}`} style={{ width: 18, height: 18 }} />
                </div>
              </button>

              {/* New quest creator */}
              <div className="space-y-2">
                <input ref={nqRef} value={nq.name} onChange={e => setNq(n => ({ ...n, name: e.target.value }))} placeholder="Neue Aufgabe..." className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3 font-body text-sm outline-none focus:border-primary/40 transition-colors" style={{ minHeight: 44 }} />
                <div className="flex gap-2">
                  <select value={nq.anchor} onChange={e => setNq(n => ({ ...n, anchor: e.target.value }))} className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 font-body text-sm" style={{ minHeight: 40 }}>
                    <option value="morning">🌅 Morgens</option>
                    <option value="evening">🌙 Abends</option>
                  </select>
                  <input type="number" value={nq.xp} onChange={e => setNq(n => ({ ...n, xp: +e.target.value }))} className="w-14 bg-surface-container-low border border-outline-variant/20 rounded-lg px-2 py-2 font-body text-sm text-center" placeholder="HP" style={{ minHeight: 40 }} />
                  <input type="number" value={nq.minutes} onChange={e => setNq(n => ({ ...n, minutes: +e.target.value }))} className="w-14 bg-surface-container-low border border-outline-variant/20 rounded-lg px-2 py-2 font-body text-sm text-center" placeholder="Min" style={{ minHeight: 40 }} />
                </div>
                <button onClick={() => actions.addQuest(nq, () => setNq(n => ({ ...n, name: "" })))} className="btn-tap w-full bg-primary-container text-white rounded-full py-3 font-label font-bold text-sm" style={{ minHeight: 44 }}>
                  Erstellen
                </button>
              </div>

              {/* Stats */}
              <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/10">
                <p className="font-label font-bold text-xs uppercase tracking-widest text-primary mb-3">📊 Übersicht</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: state.sd, l: "Tage-Streak", c: "text-primary" },
                    { v: state.bestStreak || state.sd, l: "Bester Streak", c: "text-tertiary" },
                    { v: `❄️ ${state.streakFreezes || 0}`, l: "Streak-Schutz", c: "text-primary" },
                    { v: state.hist?.length || 0, l: "Aufgaben gesamt", c: "text-emerald-dark" },
                    { v: (state.graduated || []).length, l: "Gemeistert 🎓", c: "text-secondary" },
                    { v: `Lvl ${level}`, l: `${state.xp} HP`, c: "text-primary" },
                  ].map((s, i) => (
                    <div key={i} className="mm-card p-3 text-center">
                      <div className={`font-headline text-lg font-bold ${s.c}`}>{s.v}</div>
                      <div className="font-body text-xs text-on-surface-variant">{s.l}</div>
                    </div>
                  ))}
                </div>
                {(state.graduated || []).length > 0 && (
                  <p className="mt-3 font-body text-xs text-on-surface-variant">
                    <span className="font-bold">Gemeistert:</span>{" "}
                    {(state.graduated || []).map(gid => { const q = [...SCHOOL_QUESTS, ...VACATION_QUESTS].find(x => x.id === gid); return q ? q.name : gid; }).join(", ")}
                  </p>
                )}
                {state.moodAM !== null && (
                  <p className="mt-2 font-body text-xs text-on-surface-variant">
                    Stimmung: {MOOD_EMOJIS[state.moodAM]} morgens{state.moodPM !== null ? `, ${MOOD_EMOJIS[state.moodPM]} abends` : ""}
                  </p>
                )}
              </div>

              {/* Export / Import / Reset */}
              <div className="flex gap-2">
                <button onClick={() => actions.exportState(state)} className="flex-1 bg-emerald/10 border border-emerald/30 rounded-lg py-2.5 text-emerald-dark font-label font-bold text-xs" style={{ minHeight: 44 }}>💾 Export</button>
                <button onClick={() => fileRef.current?.click()} className="flex-1 bg-primary/5 border border-primary/20 rounded-lg py-2.5 text-primary font-label font-bold text-xs" style={{ minHeight: 44 }}>📂 Import</button>
                <input ref={fileRef} type="file" accept=".json" onChange={actions.importState} className="hidden" />
              </div>
              <div className="flex gap-2">
                <button onClick={actions.resetDay} className="flex-1 bg-secondary-fixed/20 border border-secondary-container/40 rounded-lg py-2.5 text-secondary font-label font-bold text-xs" style={{ minHeight: 44 }}>🔄 Tag</button>
                <button onClick={actions.resetAll} className="flex-1 bg-error-container/50 border border-error/30 rounded-lg py-2.5 text-error font-label font-bold text-xs" style={{ minHeight: 44 }}>🗑️ Alles</button>
              </div>

              {/* Weekly Lunch */}
              <div className="bg-surface-container-low rounded-lg p-4 border border-secondary-container/20">
                <p className="font-label font-bold text-xs uppercase tracking-widest text-primary mb-3">🍽️ Wochenmenü</p>
                <div className="space-y-2">
                  {DAYS.map(day => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="font-label font-bold text-sm text-on-surface w-7 shrink-0">{day}</span>
                      <input
                        value={lunchDraft[day]}
                        onChange={e => setLunchDraft(prev => ({ ...prev, [day]: e.target.value }))}
                        placeholder={`${day} Mittagessen...`}
                        className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2.5 font-body text-sm outline-none focus:border-primary/40"
                        style={{ minHeight: 44 }}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={() => actions.updateWeeklyLunch(lunchDraft)} className="btn-tap w-full mt-3 bg-primary-container text-white rounded-full py-3 font-label font-bold text-sm" style={{ minHeight: 44 }}>
                  💾 Speichern
                </button>
              </div>

              {/* Special Mission Creator */}
              <div className="bg-surface-container-low rounded-lg p-4 border border-primary/10">
                <p className="font-label font-bold text-xs uppercase tracking-widest text-primary mb-3">🎯 Spezial-Mission erstellen</p>
                <div className="space-y-3">
                  <input value={smName} onChange={e => setSmName(e.target.value)} placeholder="z.B. Zahnarzt besuchen" className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 font-body text-sm outline-none focus:border-primary/40" style={{ minHeight: 44 }} />
                  <div>
                    <p className="font-label text-xs font-bold text-on-surface-variant mb-2">Emoji wählen:</p>
                    <div className="flex gap-2 flex-wrap">
                      {SM_EMOJIS.map(em => (
                        <button key={em} onClick={() => setSmEmoji(em)} className={`btn-tap text-xl p-2 rounded-lg transition-all ${smEmoji === em ? 'bg-primary/10 border-2 border-primary' : 'bg-surface-container border-2 border-transparent'}`} style={{ minWidth: 40, minHeight: 40 }}>
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-label text-xs font-bold text-on-surface-variant whitespace-nowrap">HP Belohnung:</span>
                    <input type="number" value={smHp} onChange={e => setSmHp(+e.target.value)} className="w-16 bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-2 py-2 font-headline text-sm text-center" style={{ minHeight: 44 }} />
                  </div>
                  <button onClick={() => { if (smName.trim()) { actions.addSpecialMission({ name: smName.trim(), emoji: smEmoji, hp: smHp }); setSmName(""); setSmEmoji("🎁"); setSmHp(30); } }} className="btn-tap w-full bg-primary-container text-white rounded-full py-3 font-label font-bold text-sm" style={{ minHeight: 44 }}>
                    Erstellen
                  </button>
                </div>
                {/* Active missions list */}
                {(state.specialMissions || []).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Aktive Spezial-Missionen</p>
                    {(state.specialMissions || []).map(m => (
                      <div key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border ${m.done ? 'bg-emerald/5 border-emerald/20' : 'bg-surface-container-lowest border-outline-variant/10'}`}>
                        <span className="text-xl">{m.emoji}</span>
                        <div className="flex-1">
                          <p className={`font-label font-bold text-sm ${m.done ? 'line-through text-on-surface/40' : 'text-on-surface'}`}>{m.name}</p>
                          <p className="font-label text-xs font-bold text-primary">+{m.hp} HP</p>
                        </div>
                        <button onClick={() => actions.removeSpecialMission(m.id)} className="bg-error-container/50 border border-error/30 rounded-lg px-2 py-1 text-error font-bold text-xs">❌</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bodhi leaf decorative divider */}
          <div className="flex justify-center py-4 opacity-10">
            <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
              <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#5300b7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
