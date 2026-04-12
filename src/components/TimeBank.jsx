import React, { useState } from 'react';
import { T } from '../constants';
import { useGame } from '../context/GameContext';

const EMOJI_PICKS = [
  "🎮", "📺", "🍬", "🎬", "🎢", "🍔",
  "🎵", "🚲", "⚽", "🎨", "📖", "🧩",
  "🍕", "🍦", "🎂", "🎁", "🎠", "🏖️",
];

function generateId() {
  return "bel_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

export default function TimeBank() {
  const { state, actions, ui } = useGame();
  const belohnungen = state.belohnungen || [];
  const log = state.belohnungenLog || [];
  const coins = state.coins || 0;
  const isPMode = ui.pMode;

  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const isFreeDay = isWeekend || state.vacMode;

  function isAvailableNow(bel) {
    const timeLimit = isFreeDay ? (bel.availableAfterFree || bel.availableAfter) : bel.availableAfter;
    if (!timeLimit) return true;
    const [h, m] = timeLimit.split(":").map(Number);
    const now = new Date();
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
  }

  const [editDraft, setEditDraft] = useState(null);
  const [emojiPicker, setEmojiPicker] = useState(null);
  const [confirmRedeem, setConfirmRedeem] = useState(null);

  const activeRewards = isPMode ? belohnungen : belohnungen.filter(b => b.active);

  const startEdit = () => setEditDraft(belohnungen.map(b => ({ ...b })));
  const cancelEdit = () => { setEditDraft(null); setEmojiPicker(null); };
  const saveEdit = () => {
    if (editDraft) actions.updateBelohnungen(editDraft.filter(b => b.name.trim().length > 0));
    setEditDraft(null); setEmojiPicker(null);
  };
  const updateDraft = (id, field, value) => setEditDraft(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  const removeDraft = (id) => setEditDraft(prev => prev.filter(b => b.id !== id));
  const addDraft = () => setEditDraft(prev => [...prev, { id: generateId(), name: "", emoji: "⭐", cost: 20, active: true }]);

  const handleRedeem = (belId) => { actions.redeemReward(belId); setConfirmRedeem(null); };
  const resolveRewardName = (belId) => { const f = belohnungen.find(b => b.id === belId); return f ? `${f.emoji} ${f.name}` : belId; };
  const formatDate = (iso) => { try { return new Date(iso).toLocaleDateString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

  const isEditing = editDraft !== null;

  return (
    <div className="lotus-pattern px-6 pb-32 space-y-6">

      {/* ── Header ── */}
      <section className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold font-headline text-on-surface">Belohnungsbank</h2>
            <p className="text-on-surface-variant font-body text-base mt-1">
              Wandle deine Heldenpunkte in tolle Belohnungen um!
            </p>
          </div>
          {isPMode && !isEditing && (
            <button onClick={startEdit} className="btn-tap bg-primary/10 border border-primary/20 rounded-full px-4 py-2 font-label font-bold text-sm text-primary">
              Bearbeiten
            </button>
          )}
        </div>
      </section>

      {/* ── Balance Card ── */}
      <div className="relative overflow-hidden bg-primary text-white p-6 rounded-lg bodhi-pattern flex justify-between items-center group transition-all">
        <div className="relative z-10">
          <p className="font-label font-bold uppercase tracking-widest text-xs text-white/60 mb-1">Dein Guthaben</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-headline font-bold">{coins}</span>
            <span className="text-xl font-label font-bold opacity-80">HP</span>
          </div>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
        </div>
        <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <span className="material-symbols-outlined text-9xl">filter_vintage</span>
        </div>
      </div>

      {/* Dragon eggs secondary balance */}
      {(state.drachenEier || 0) > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-tertiary-fixed/30 rounded-lg border border-tertiary-fixed-dim/20">
          <span className="text-2xl">🥚</span>
          <span className="font-headline text-lg font-bold text-tertiary">{state.drachenEier || 0}</span>
          <span className="font-label text-sm font-bold text-on-surface-variant">Drachen-Eier</span>
        </div>
      )}

      {/* ── Weekend discount ── */}
      {isFreeDay && !isEditing && (
        <div className="bg-emerald text-white rounded-lg px-4 py-3 text-center font-headline font-bold text-sm">
          🏖️ {state.vacMode ? "Ferien" : "Wochenend"}-Rabatt aktiv!
        </div>
      )}

      {/* ── EDIT MODE ── */}
      {isEditing ? (
        <div className="space-y-4">
          <h3 className="font-label font-bold text-sm uppercase tracking-widest text-on-surface/40 px-1">
            Belohnungen bearbeiten
          </h3>

          {editDraft.map(bel => (
            <div key={bel.id} className={`bg-surface-container-lowest rounded-lg p-5 space-y-3 border ${bel.active ? 'border-primary/10' : 'border-error/20 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => setEmojiPicker(emojiPicker === bel.id ? null : bel.id)}
                  className="btn-tap w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center text-2xl border border-primary/20">
                  {bel.emoji}
                </button>
                <input type="text" value={bel.name} onChange={e => updateDraft(bel.id, "name", e.target.value)}
                  placeholder="Name der Belohnung..."
                  className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 font-body text-sm outline-none focus:border-primary/40"
                  style={{ minHeight: 44 }} />
              </div>

              {emojiPicker === bel.id && (
                <div className="flex flex-wrap gap-2 p-3 bg-primary-fixed/30 rounded-lg">
                  {EMOJI_PICKS.map(em => (
                    <button key={em} onClick={() => { updateDraft(bel.id, "emoji", em); setEmojiPicker(null); }}
                      className={`btn-tap w-10 h-10 rounded-lg text-xl flex items-center justify-center ${bel.emoji === em ? 'bg-white border-2 border-primary' : 'border-2 border-transparent'}`}>
                      {em}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <input type="number" value={bel.cost} onChange={e => updateDraft(bel.id, "cost", Math.max(1, parseInt(e.target.value) || 1))} min={1}
                    className="w-16 bg-surface-container-low border border-outline-variant/20 rounded-lg px-2 py-2 font-label text-sm text-center outline-none" style={{ minHeight: 40 }} />
                  <span className="font-label text-xs text-on-surface-variant">HP</span>
                </div>
                <button onClick={() => updateDraft(bel.id, "active", !bel.active)}
                  className={`btn-tap rounded-full px-3 py-1.5 font-label text-xs font-bold ${bel.active ? 'bg-emerald/10 text-emerald-dark border border-emerald/30' : 'bg-error-container/50 text-error border border-error/30'}`}>
                  {bel.active ? "Aktiv" : "Aus"}
                </button>
                <button onClick={() => removeDraft(bel.id)} className="btn-tap w-10 h-10 rounded-lg bg-error-container/50 border border-error/20 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          ))}

          <button onClick={addDraft} className="btn-tap w-full border-2 border-dashed border-primary/30 rounded-lg py-4 text-center font-label font-bold text-sm text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
            + Neue Belohnung
          </button>

          <div className="flex gap-3 pt-2">
            <button onClick={cancelEdit} className="btn-tap flex-1 bg-surface-container text-on-surface-variant rounded-full py-3.5 font-label font-bold text-sm">
              Abbrechen
            </button>
            <button onClick={saveEdit} className="btn-tap flex-1 bg-emerald text-white rounded-full py-3.5 font-label font-bold text-sm shadow-lg shadow-emerald/30">
              Speichern
            </button>
          </div>
        </div>
      ) : (
        /* ── NORMAL MODE ── */
        <div className="space-y-4">
          <h3 className="font-label font-bold text-sm uppercase tracking-widest text-on-surface/40 px-1">
            Verfügbare Belohnungen
          </h3>

          {activeRewards.length === 0 && (
            <div className="bg-surface-container-lowest rounded-lg p-8 text-center text-on-surface-variant font-body">
              {isPMode ? 'Noch keine Belohnungen. Tippe "Bearbeiten"!' : "Keine Belohnungen verfügbar."}
            </div>
          )}

          {activeRewards.map(bel => {
            const effectiveCost = (isFreeDay && bel.weekendCost) ? bel.weekendCost : bel.cost;
            const available = isAvailableNow(bel);
            const currencyEmoji = bel.currency === "eggs" ? "🥚" : "⭐";
            const balance = bel.currency === "eggs" ? (state.drachenEier || 0) : coins;
            const canAfford = balance >= effectiveCost;
            const gameRemaining = bel.id === "bel_game20" ? Math.max(0, 2 - (state.dailyGameRedemptions || 0)) : null;
            const gameLocked = bel.id === "bel_game20" && gameRemaining === 0;
            const canRedeem = canAfford && available && !gameLocked;
            const isConfirming = confirmRedeem === bel.id;

            return (
              <div key={bel.id} className={`bg-surface-container-lowest rounded-lg p-5 flex items-center justify-between group transition-all duration-300 ${canRedeem ? 'hover:shadow-[0_8px_24px_rgba(30,27,23,0.06)]' : ''} ${!available || !canAfford ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-surface-container-low flex items-center justify-center">
                    <span className="text-3xl">{bel.emoji}</span>
                  </div>
                  <div>
                    <h4 className="font-label font-bold text-base text-on-surface">{bel.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                      {isFreeDay && bel.weekendCost && bel.weekendCost < bel.cost ? (
                        <span className="text-secondary font-bold font-label text-sm">
                          <span className="line-through opacity-50 mr-1">{bel.cost}</span>
                          <span className="text-error font-extrabold">{bel.weekendCost} HP</span>
                        </span>
                      ) : (
                        <span className="text-secondary font-bold font-label text-sm">{effectiveCost} {bel.currency === "eggs" ? "Eier" : "HP"}</span>
                      )}
                    </div>
                    {!available && bel.availableAfter && (
                      <p className="font-label text-xs text-on-surface-variant mt-0.5">
                        🔒 Ab {isFreeDay ? (bel.availableAfterFree || bel.availableAfter) : bel.availableAfter} Uhr
                      </p>
                    )}
                    {gameRemaining !== null && (
                      <p className={`font-label text-xs font-bold mt-0.5 ${gameLocked ? 'text-error' : 'text-emerald-dark'}`}>
                        {gameLocked ? "🔒 Heute ausgeschöpft" : `Noch ${gameRemaining} übrig`}
                      </p>
                    )}
                  </div>
                </div>

                {isConfirming ? (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setConfirmRedeem(null)} className="btn-tap bg-surface-container text-on-surface-variant rounded-full px-4 py-2.5 font-label font-bold text-xs" style={{ minHeight: 44 }}>
                      Nein
                    </button>
                    <button onClick={() => handleRedeem(bel.id)} className="btn-tap bg-emerald text-white rounded-full px-4 py-2.5 font-label font-bold text-xs shadow-md" style={{ minHeight: 44 }}>
                      Ja!
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => canRedeem && !isPMode && setConfirmRedeem(bel.id)}
                    disabled={!canRedeem || isPMode}
                    className={`btn-tap rounded-full px-5 py-2.5 font-label font-bold text-sm shrink-0 transition-all ${
                      canRedeem && !isPMode
                        ? 'bg-secondary-container text-on-secondary-container hover:opacity-90'
                        : 'bg-surface-variant text-outline cursor-not-allowed'
                    }`}
                    style={{ minHeight: 44 }}
                  >
                    {canRedeem ? "Einlösen" : "Zu wenig HP"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Info Card ── */}
      {!isEditing && (
        <div className="bg-secondary-fixed/20 border-l-4 border-secondary p-5 rounded-r-lg">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-secondary">lightbulb</span>
            <div>
              <h5 className="font-label font-bold text-secondary text-sm">So funktioniert's</h5>
              <p className="font-body text-sm text-on-surface-variant mt-1 leading-relaxed">
                Wenn du eine Belohnung einlöst, zeige den Bestätigungscode deinen Eltern. Sie helfen dir dann dabei, deine Belohnung zu erhalten!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Redemption History ── */}
      {!isEditing && log.length > 0 && (
        <div>
          <h3 className="font-label font-bold text-sm uppercase tracking-widest text-on-surface/40 px-1 mb-3">
            Letzte Einlösungen
          </h3>
          <div className="bg-surface-container-lowest rounded-lg p-4 divide-y divide-outline-variant/10">
            {log.slice(-5).reverse().map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <span className="font-label font-bold text-sm text-on-surface">{resolveRewardName(entry.id)}</span>
                <span className="font-label text-xs text-on-surface-variant">{formatDate(entry.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Parent mode hint ── */}
      {isPMode && !isEditing && (
        <p className="text-center font-body text-sm text-on-surface-variant italic">
          Elternmodus aktiv — Einlösen deaktiviert
        </p>
      )}

      {/* Bodhi leaf */}
      <div className="flex justify-center py-2 opacity-10">
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
          <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#5300b7" />
        </svg>
      </div>
    </div>
  );
}
