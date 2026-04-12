import React, { useRef, useState } from 'react';
import { T, SCHOOL_QUESTS, VACATION_QUESTS, MOOD_EMOJIS } from '../constants';
import { useGame } from '../context/GameContext';

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr"];
const SM_EMOJIS = ["🎁", "🦷", "🏥", "⚽", "🎵", "📝", "🧹", "🎨"];

export default function ParentPanel() {
  const { state, computed, actions, ui } = useGame();
  const { level } = computed;
  const { nq, setNq } = ui;
  const nqRef = useRef(null);
  const fileRef = useRef(null);

  const [lunchDraft, setLunchDraft] = useState(() => {
    const wl = state.weeklyLunch || {};
    return { Mo: wl.Mo || "", Di: wl.Di || "", Mi: wl.Mi || "", Do: wl.Do || "", Fr: wl.Fr || "" };
  });
  const [smName, setSmName] = useState("");
  const [smEmoji, setSmEmoji] = useState("🎁");
  const [smHp, setSmHp] = useState(30);

  const completionRate = state.hist?.length > 0
    ? Math.round((state.totalDone || 0) / Math.max(1, (state.hist || []).length) * 10)
    : 0;

  return (
    <div className="bodhi-pattern px-6 pb-32 space-y-6 max-w-7xl mx-auto">

      {/* ── Bento Stats Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mood History Card */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-lg p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-label text-lg font-bold text-on-surface">Stimmungsverlauf</h2>
              <p className="text-on-surface-variant text-sm">Letzte 7 Tage</p>
            </div>
            <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-full">monitoring</span>
          </div>
          <div className="flex items-end justify-between h-32 gap-1.5">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, i) => {
              const isToday = (i + 1) % 7 === new Date().getDay();
              const h = 40 + Math.random() * 80; // Simulated mood bar height
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-full ${isToday ? 'bg-primary-container shadow-lg shadow-primary/20' : 'bg-secondary-container opacity-60'}`}
                    style={{ height: `${isToday ? 100 : h}%` }}
                  />
                  <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-primary' : 'text-on-surface/50'}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-primary-container text-white rounded-lg p-5 flex flex-col justify-between h-[160px]">
            <span className="material-symbols-outlined text-2xl">emoji_events</span>
            <div>
              <p className="text-3xl font-bold font-headline leading-none opacity-90">{completionRate}%</p>
              <p className="text-white/80 font-bold uppercase text-[11px] tracking-widest mt-2">Quest Abschlussrate</p>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-lg p-5 flex flex-col justify-between h-[160px]">
            <span className="material-symbols-outlined text-2xl text-secondary">stars</span>
            <div>
              <p className="text-3xl font-bold font-headline leading-none text-on-surface">{state.xp || 0}</p>
              <p className="text-on-surface/40 font-bold uppercase text-[11px] tracking-widest mt-2">Verfügbare XP</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quest & Config Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Quests */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-label text-lg font-bold text-on-surface">Aktive Quests</h3>
            <button className="text-primary font-bold text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-base">add_circle</span> Neue Quest
            </button>
          </div>

          {/* New quest creator */}
          <div className="bg-surface-container-lowest rounded-lg p-4 space-y-2">
            <input ref={nqRef} value={nq.name} onChange={e => setNq(n => ({ ...n, name: e.target.value }))}
              placeholder="Neue Aufgabe..."
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 font-body text-sm outline-none focus:border-primary/40" style={{ minHeight: 44 }} />
            <div className="flex gap-2">
              <select value={nq.anchor} onChange={e => setNq(n => ({ ...n, anchor: e.target.value }))}
                className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 font-body text-sm" style={{ minHeight: 40 }}>
                <option value="morning">🌅 Morgens</option>
                <option value="evening">🌙 Abends</option>
              </select>
              <input type="number" value={nq.xp} onChange={e => setNq(n => ({ ...n, xp: +e.target.value }))}
                className="w-14 bg-surface-container-low border border-outline-variant/20 rounded-lg px-2 py-2 font-body text-sm text-center" placeholder="XP" style={{ minHeight: 40 }} />
              <input type="number" value={nq.minutes} onChange={e => setNq(n => ({ ...n, minutes: +e.target.value }))}
                className="w-14 bg-surface-container-low border border-outline-variant/20 rounded-lg px-2 py-2 font-body text-sm text-center" placeholder="Min" style={{ minHeight: 40 }} />
            </div>
            <button onClick={() => actions.addQuest(nq, () => setNq(n => ({ ...n, name: "" })))}
              className="btn-tap w-full bg-primary-container text-white rounded-full py-2.5 font-label font-bold text-sm" style={{ minHeight: 44 }}>
              Erstellen
            </button>
          </div>

          {/* Vacation toggle */}
          <div className="bg-surface-container-lowest p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">
                {state.vacMode ? 'beach_access' : 'school'}
              </span>
              <div>
                <p className="font-bold text-on-surface text-sm">{state.vacMode ? "Ferienmodus" : "Schulmodus"}</p>
                <p className="text-xs text-on-surface/50">{state.vacMode ? "Ferien-Aufgaben aktiv" : "Schul-Aufgaben aktiv"}</p>
              </div>
            </div>
            <button onClick={actions.togVac} className="btn-tap">
              <div className={`w-11 h-6 rounded-full relative transition-all ${state.vacMode ? 'bg-emerald' : 'bg-outline-variant/40'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${state.vacMode ? 'left-6' : 'left-1'}`} />
              </div>
            </button>
          </div>

          {/* Stats grid */}
          <div className="bg-surface-container-low rounded-lg p-4">
            <p className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-3">📊 Übersicht</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: state.sd, l: "Tage-Streak", c: "text-primary" },
                { v: state.bestStreak || state.sd, l: "Bester Streak", c: "text-tertiary" },
                { v: `❄️ ${state.streakFreezes || 0}`, l: "Streak-Schutz", c: "text-primary" },
                { v: (state.hist || []).length, l: "Aufgaben gesamt", c: "text-emerald-dark" },
                { v: (state.graduated || []).length, l: "Gemeistert 🎓", c: "text-secondary" },
                { v: `Lvl ${level}`, l: `${state.xp} HP`, c: "text-primary" },
              ].map((s, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-lg p-3 text-center">
                  <div className={`font-headline text-lg font-bold ${s.c}`}>{s.v}</div>
                  <div className="font-body text-xs text-on-surface-variant">{s.l}</div>
                </div>
              ))}
            </div>
            {state.moodAM !== null && (
              <p className="mt-3 font-body text-xs text-on-surface-variant">
                Stimmung: {MOOD_EMOJIS[state.moodAM]} morgens{state.moodPM !== null ? `, ${MOOD_EMOJIS[state.moodPM]} abends` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-3">
          <h3 className="font-label text-lg font-bold text-on-surface px-1">Konfiguration</h3>

          <div className="bg-surface-container-low rounded-lg divide-y divide-outline-variant/10 overflow-hidden">
            {[
              { icon: "lock_reset", label: "PIN Code ändern", desc: "Sicherheitseinstellungen", color: "text-primary" },
              { icon: "notifications_active", label: "Push-Benachrichtigungen", desc: "Quest-Abschluss Berichte", color: "text-primary", toggle: true },
              { icon: "dark_mode", label: "Schlafenszeit-Modus", desc: "Automatisches Dimmen", color: "text-primary", toggle: true, off: true },
            ].map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-white/40 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{item.label}</p>
                    <p className="text-xs text-on-surface/50">{item.desc}</p>
                  </div>
                </div>
                {item.toggle ? (
                  <div className={`w-10 h-6 rounded-full relative p-1 ${item.off ? 'bg-outline-variant' : 'bg-emerald'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full ${item.off ? '' : 'ml-auto'}`} />
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-on-surface/30">chevron_right</span>
                )}
              </div>
            ))}

            {/* Danger zone */}
            <div className="p-4 flex items-center gap-3 cursor-pointer group" onClick={actions.resetAll}>
              <span className="material-symbols-outlined text-error group-hover:scale-110 transition-transform">delete_sweep</span>
              <div>
                <p className="font-bold text-error text-sm">Fortschritt zurücksetzen</p>
                <p className="text-xs text-error/60">Alle Daten löschen</p>
              </div>
            </div>
          </div>

          {/* Export / Import */}
          <div className="flex gap-2">
            <button onClick={() => actions.exportState(state)} className="btn-tap flex-1 bg-emerald/10 border border-emerald/30 rounded-lg py-2.5 text-emerald-dark font-label font-bold text-xs" style={{ minHeight: 44 }}>
              💾 Export
            </button>
            <button onClick={() => fileRef.current?.click()} className="btn-tap flex-1 bg-primary/5 border border-primary/20 rounded-lg py-2.5 text-primary font-label font-bold text-xs" style={{ minHeight: 44 }}>
              📂 Import
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={actions.importState} className="hidden" />
          </div>
          <button onClick={actions.resetDay} className="btn-tap w-full bg-secondary-fixed/20 border border-secondary-container/40 rounded-lg py-2.5 text-secondary font-label font-bold text-xs" style={{ minHeight: 44 }}>
            🔄 Tag zurücksetzen
          </button>

          {/* Weekly Lunch */}
          <div className="bg-surface-container-lowest rounded-lg p-4">
            <p className="font-label font-bold text-xs uppercase tracking-widest text-primary mb-3">🍽️ Wochenmenü</p>
            <div className="space-y-2">
              {DAYS.map(day => (
                <div key={day} className="flex items-center gap-3">
                  <span className="font-label font-bold text-sm text-on-surface w-7 shrink-0">{day}</span>
                  <input value={lunchDraft[day]} onChange={e => setLunchDraft(prev => ({ ...prev, [day]: e.target.value }))}
                    placeholder={`${day} Mittagessen...`}
                    className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 font-body text-sm outline-none focus:border-primary/40" style={{ minHeight: 40 }} />
                </div>
              ))}
            </div>
            <button onClick={() => actions.updateWeeklyLunch(lunchDraft)}
              className="btn-tap w-full mt-3 bg-primary-container text-white rounded-full py-2.5 font-label font-bold text-sm" style={{ minHeight: 44 }}>
              💾 Speichern
            </button>
          </div>

          {/* Special Mission Creator */}
          <div className="bg-surface-container-lowest rounded-lg p-4">
            <p className="font-label font-bold text-xs uppercase tracking-widest text-primary mb-3">🎯 Spezial-Mission</p>
            <div className="space-y-2">
              <input value={smName} onChange={e => setSmName(e.target.value)} placeholder="z.B. Zahnarzt besuchen"
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 font-body text-sm outline-none focus:border-primary/40" style={{ minHeight: 44 }} />
              <div className="flex gap-2 flex-wrap">
                {SM_EMOJIS.map(em => (
                  <button key={em} onClick={() => setSmEmoji(em)}
                    className={`btn-tap text-xl p-1.5 rounded-lg ${smEmoji === em ? 'bg-primary/10 border-2 border-primary' : 'bg-surface-container border-2 border-transparent'}`}
                    style={{ minWidth: 36, minHeight: 36 }}>{em}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-label text-xs font-bold text-on-surface-variant">HP:</span>
                <input type="number" value={smHp} onChange={e => setSmHp(+e.target.value)}
                  className="w-16 bg-surface-container-low border border-outline-variant/20 rounded-lg px-2 py-1.5 font-label text-sm text-center" style={{ minHeight: 36 }} />
              </div>
              <button onClick={() => { if (smName.trim()) { actions.addSpecialMission({ name: smName.trim(), emoji: smEmoji, hp: smHp }); setSmName(""); setSmEmoji("🎁"); setSmHp(30); } }}
                className="btn-tap w-full bg-primary-container text-white rounded-full py-2.5 font-label font-bold text-sm" style={{ minHeight: 44 }}>
                Erstellen
              </button>
            </div>
            {(state.specialMissions || []).length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Aktiv</p>
                {(state.specialMissions || []).map(m => (
                  <div key={m.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${m.done ? 'bg-emerald/5 border-emerald/20' : 'bg-surface-container-low border-transparent'}`}>
                    <span className="text-lg">{m.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-label font-bold text-sm ${m.done ? 'line-through text-on-surface/40' : 'text-on-surface'}`}>{m.name}</p>
                      <p className="font-label text-xs font-bold text-primary">+{m.hp} HP</p>
                    </div>
                    <button onClick={() => actions.removeSpecialMission(m.id)} className="text-error text-xs font-bold">❌</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
