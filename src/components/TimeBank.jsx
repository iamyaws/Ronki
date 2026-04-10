import React, { useState } from 'react';
import { T } from '../constants';
import { ViewHeader } from './ui';
import { useGame } from '../context/GameContext';

// ── Belohnungsbank (Reward Bank) ──
// Louis spends his Heldenpunkte on real-world rewards configured by parents.

const EMOJI_PICKS = [
  "\u{1F3AE}", "\u{1F4FA}", "\u{1F36C}", "\u{1F3AC}", "\u{1F3A2}", "\u{1F354}",
  "\u{1F3B5}", "\u{1F6B2}", "\u26BD", "\u{1F3A8}", "\u{1F4D6}", "\u{1F9E9}",
  "\u{1F355}", "\u{1F366}", "\u{1F382}", "\u{1F381}", "\u{1F3A0}", "\u{1F3D6}\uFE0F",
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

  // ── Weekend/vacation & time-of-day logic ──
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const isFreeDay = isWeekend || state.vacMode;

  function isAvailableNow(bel) {
    const timeLimit = isFreeDay ? (bel.availableAfterFree || bel.availableAfter) : bel.availableAfter;
    if (!timeLimit) return true;
    const [h, m] = timeLimit.split(":").map(Number);
    const now = new Date();
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
  }

  // ── Parent edit state ──
  const [editDraft, setEditDraft] = useState(null); // null = not editing, array = working copy
  const [emojiPicker, setEmojiPicker] = useState(null); // id of reward showing picker
  const [confirmRedeem, setConfirmRedeem] = useState(null); // id of reward being confirmed

  const activeRewards = isPMode ? belohnungen : belohnungen.filter(b => b.active);

  // ── Start editing ──
  const startEdit = () => setEditDraft(belohnungen.map(b => ({ ...b })));
  const cancelEdit = () => { setEditDraft(null); setEmojiPicker(null); };
  const saveEdit = () => {
    if (editDraft) {
      const cleaned = editDraft.filter(b => b.name.trim().length > 0);
      actions.updateBelohnungen(cleaned);
    }
    setEditDraft(null);
    setEmojiPicker(null);
  };

  const updateDraft = (id, field, value) => {
    setEditDraft(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };
  const removeDraft = (id) => setEditDraft(prev => prev.filter(b => b.id !== id));
  const addDraft = () => {
    setEditDraft(prev => [...prev, { id: generateId(), name: "", emoji: "\u2B50", cost: 20, active: true }]);
  };

  // ── Redeem flow ──
  const handleRedeem = (belId) => {
    actions.redeemReward(belId);
    setConfirmRedeem(null);
  };

  // ── Resolve reward name from log entries ──
  const resolveRewardName = (belId) => {
    const found = belohnungen.find(b => b.id === belId);
    return found ? `${found.emoji} ${found.name}` : belId;
  };

  // ── Format date for log ──
  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  };

  const isEditing = editDraft !== null;

  return (
    <div className="view-enter" style={{
      minHeight: "100vh",
      padding: "12px 16px 100px",
      background: T.bg,
      fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Header */}
      <ViewHeader
        onBack={() => ui.setView("hub")}
        title={"\u2B50 Belohnungsbank"}
        right={isPMode && !isEditing ? (
          <button className="btn-tap" onClick={startEdit} style={{
            background: `${T.primary}14`,
            border: `2px solid ${T.primary}30`,
            borderRadius: 50,
            padding: "8px 16px",
            fontSize: ".85rem",
            fontWeight: 800,
            color: T.primary,
            cursor: "pointer",
            fontFamily: "'Fredoka', sans-serif",
            minHeight: 48,
          }}>
            Bearbeiten
          </button>
        ) : undefined}
      />

      {/* ── Balance display ── */}
      <div className="game-card" style={{
        padding: "24px 28px",
        textAlign: "center",
        marginBottom: 24,
        background: `linear-gradient(135deg, ${T.accent}18, ${T.accent}08)`,
        borderColor: `${T.accent}40`,
      }}>
        <div style={{ fontSize: "2.4rem", marginBottom: 4 }}>{"\u2B50"}</div>
        <div style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "2.8rem",
          fontWeight: 700,
          color: T.accentDark,
          lineHeight: 1.1,
        }}>
          {coins}
        </div>
        <div style={{
          fontSize: ".95rem",
          color: T.textSecondary,
          fontWeight: 700,
          marginTop: 4,
          letterSpacing: ".02em",
        }}>
          Heldenpunkte
        </div>
      </div>

      {/* ── Weekend discount badge ── */}
      {isFreeDay && !isEditing && (
        <div style={{
          background: "linear-gradient(135deg, #059669, #10b981)",
          borderRadius: 14,
          padding: "10px 18px",
          marginBottom: 12,
          textAlign: "center",
          color: "white",
          fontWeight: 800,
          fontSize: "1rem",
          fontFamily: "'Fredoka', sans-serif",
          boxShadow: "0 4px 14px rgba(5,150,105,0.25)",
        }}>
          {"\u{1F3D6}\uFE0F"} {state.vacMode ? "Ferien" : "Wochenend"}-Rabatt!
        </div>
      )}

      {/* ── Section label ── */}
      <div style={{
        fontFamily: "'Fredoka', sans-serif",
        fontWeight: 800,
        fontSize: ".85rem",
        color: T.textSecondary,
        textTransform: "uppercase",
        letterSpacing: ".08em",
        marginBottom: 12,
      }}>
        {isEditing ? "Belohnungen bearbeiten" : "Belohnungen"}
      </div>

      {/* ── EDIT MODE ── */}
      {isEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {editDraft.map((bel) => (
            <div key={bel.id} className="game-card" style={{
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              borderColor: bel.active ? `${T.primary}30` : `${T.danger}20`,
              opacity: bel.active ? 1 : 0.6,
            }}>
              {/* Row 1: Emoji + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="btn-tap" onClick={() => setEmojiPicker(emojiPicker === bel.id ? null : bel.id)} style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: T.primaryPale,
                  border: `2px solid ${T.primary}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.6rem", cursor: "pointer",
                  minHeight: 48, minWidth: 48,
                }}>
                  {bel.emoji}
                </button>
                <input
                  type="text"
                  value={bel.name}
                  onChange={e => updateDraft(bel.id, "name", e.target.value)}
                  placeholder="Name der Belohnung..."
                  style={{
                    flex: 1, border: `2px solid ${T.primary}20`,
                    borderRadius: 12, padding: "10px 14px",
                    fontSize: ".95rem", fontWeight: 700,
                    fontFamily: "'Nunito', sans-serif",
                    color: T.textPrimary,
                    background: "white",
                    outline: "none",
                    minHeight: 48,
                  }}
                />
              </div>

              {/* Emoji picker (collapsible) */}
              {emojiPicker === bel.id && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 6,
                  padding: "8px 4px",
                  background: `${T.primaryPale}60`,
                  borderRadius: 12,
                }}>
                  {EMOJI_PICKS.map(em => (
                    <button key={em} className="btn-tap" onClick={() => { updateDraft(bel.id, "emoji", em); setEmojiPicker(null); }} style={{
                      width: 44, height: 44, borderRadius: 10,
                      border: bel.emoji === em ? `2px solid ${T.primary}` : "2px solid transparent",
                      background: bel.emoji === em ? "white" : "transparent",
                      fontSize: "1.3rem", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {em}
                    </button>
                  ))}
                </div>
              )}

              {/* Row 2: Cost + active toggle + delete */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                  <span style={{ fontSize: ".85rem", fontWeight: 700, color: T.textSecondary }}>{"\u2B50"}</span>
                  <input
                    type="number"
                    value={bel.cost}
                    onChange={e => updateDraft(bel.id, "cost", Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    style={{
                      width: 72, border: `2px solid ${T.primary}20`,
                      borderRadius: 10, padding: "8px 10px",
                      fontSize: ".9rem", fontWeight: 700, textAlign: "center",
                      fontFamily: "'Nunito', sans-serif",
                      color: T.textPrimary,
                      background: "white",
                      outline: "none",
                      minHeight: 44,
                    }}
                  />
                  <span style={{ fontSize: ".8rem", fontWeight: 600, color: T.textLight }}>HP</span>
                </div>

                {/* Active toggle */}
                <button className="btn-tap" onClick={() => updateDraft(bel.id, "active", !bel.active)} style={{
                  background: bel.active ? `${T.success}15` : `${T.danger}10`,
                  border: `2px solid ${bel.active ? T.success : T.danger}30`,
                  borderRadius: 50, padding: "8px 14px",
                  fontSize: ".8rem", fontWeight: 800, cursor: "pointer",
                  color: bel.active ? T.successDark : T.danger,
                  fontFamily: "'Fredoka', sans-serif",
                  minHeight: 44,
                }}>
                  {bel.active ? "Aktiv" : "Aus"}
                </button>

                {/* Delete */}
                <button className="btn-tap" onClick={() => removeDraft(bel.id)} style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${T.danger}10`,
                  border: `2px solid ${T.danger}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.1rem", cursor: "pointer",
                  color: T.danger,
                }}>
                  {"\u2716"}
                </button>
              </div>
            </div>
          ))}

          {/* Add new reward button */}
          <button className="btn-tap" onClick={addDraft} style={{
            background: `${T.primary}08`,
            border: `2.5px dashed ${T.primary}30`,
            borderRadius: 18,
            padding: "18px 16px",
            textAlign: "center",
            cursor: "pointer",
            fontSize: ".95rem",
            fontWeight: 800,
            color: T.primary,
            fontFamily: "'Fredoka', sans-serif",
            minHeight: 56,
          }}>
            + Neue Belohnung
          </button>

          {/* Save / Cancel buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn-tap" onClick={cancelEdit} style={{
              flex: 1,
              background: "rgba(0,0,0,0.04)",
              border: "2px solid rgba(0,0,0,0.08)",
              borderRadius: 50,
              padding: "14px 20px",
              fontSize: ".9rem",
              fontWeight: 800,
              color: T.textSecondary,
              cursor: "pointer",
              fontFamily: "'Fredoka', sans-serif",
              minHeight: 52,
            }}>
              Abbrechen
            </button>
            <button className="btn-tap" onClick={saveEdit} style={{
              flex: 1,
              background: `linear-gradient(135deg, ${T.success}, ${T.successDark})`,
              border: "none",
              borderRadius: 50,
              padding: "14px 20px",
              fontSize: ".9rem",
              fontWeight: 800,
              color: "white",
              cursor: "pointer",
              fontFamily: "'Fredoka', sans-serif",
              boxShadow: `0 6px 20px ${T.success}40`,
              minHeight: 52,
            }}>
              Speichern
            </button>
          </div>
        </div>
      ) : (
        /* ── NORMAL MODE: reward cards ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activeRewards.length === 0 && (
            <div className="game-card" style={{
              padding: "32px 20px",
              textAlign: "center",
              color: T.textLight,
              fontSize: ".95rem",
              fontWeight: 600,
            }}>
              {isPMode
                ? 'Noch keine Belohnungen. Tippe "Bearbeiten" um welche hinzuzuf\u00FCgen!'
                : "Keine Belohnungen verf\u00FCgbar."}
            </div>
          )}

          {activeRewards.map(bel => {
            const effectiveCost = (isFreeDay && bel.weekendCost) ? bel.weekendCost : bel.cost;
            const available = isAvailableNow(bel);
            const canAfford = coins >= effectiveCost;
            const canRedeem = canAfford && available;
            const isConfirming = confirmRedeem === bel.id;

            return (
              <div key={bel.id} className="game-card" style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                opacity: !available ? 0.7 : canAfford ? 1 : 0.5,
                borderColor: canRedeem ? `${T.accent}40` : undefined,
                boxShadow: canRedeem ? `0 4px 16px ${T.accent}12` : undefined,
                transition: "all .25s ease",
              }}>
                {/* Emoji icon */}
                <div style={{
                  width: 56, height: 56,
                  borderRadius: 16,
                  background: canRedeem ? `${T.accent}18` : "rgba(180,120,40,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.8rem",
                  flexShrink: 0,
                }}>
                  {bel.emoji}
                </div>

                {/* Name + cost */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: T.textPrimary,
                    marginBottom: 2,
                  }}>
                    {bel.name}
                  </div>
                  <div style={{
                    fontSize: ".85rem",
                    color: canAfford ? T.accentDark : T.textLight,
                    fontWeight: 700,
                  }}>
                    {"\u2B50"}{" "}
                    {isWeekend && bel.weekendCost && bel.weekendCost < bel.cost ? (
                      <>
                        <span style={{ textDecoration: "line-through", opacity: 0.5, marginRight: 4 }}>{bel.cost}</span>
                        <span style={{ color: "#059669", fontWeight: 800 }}>{bel.weekendCost} {"\u2B50"}</span>
                      </>
                    ) : (
                      <span>{effectiveCost} HP</span>
                    )}
                    {!available && " \u{1F512}"}
                  </div>
                  {!available && bel.availableAfter && (
                    <div style={{
                      fontSize: ".78rem",
                      color: T.textLight,
                      fontWeight: 600,
                      marginTop: 2,
                    }}>
                      Ab {isFreeDay ? (bel.availableAfterFree || bel.availableAfter) : bel.availableAfter} Uhr
                    </div>
                  )}
                </div>

                {/* Redeem button / lock icon */}
                {isConfirming ? (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button className="btn-tap" onClick={() => setConfirmRedeem(null)} style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "none", borderRadius: 50,
                      padding: "10px 14px",
                      fontSize: ".8rem", fontWeight: 800,
                      color: T.textSecondary, cursor: "pointer",
                      fontFamily: "'Fredoka', sans-serif",
                      minHeight: 44,
                    }}>
                      Nein
                    </button>
                    <button className="btn-tap" onClick={() => handleRedeem(bel.id)} style={{
                      background: `linear-gradient(135deg, ${T.success}, ${T.successDark})`,
                      border: "none", borderRadius: 50,
                      padding: "10px 16px",
                      fontSize: ".8rem", fontWeight: 800,
                      color: "white", cursor: "pointer",
                      fontFamily: "'Fredoka', sans-serif",
                      boxShadow: `0 4px 12px ${T.success}30`,
                      minHeight: 44,
                    }}>
                      Ja!
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-tap"
                    onClick={() => canRedeem && !isPMode && setConfirmRedeem(bel.id)}
                    disabled={!canRedeem || isPMode}
                    style={{
                      background: canRedeem && !isPMode
                        ? `linear-gradient(135deg, ${T.primary}, ${T.primaryLight})`
                        : "rgba(0,0,0,0.04)",
                      border: "none",
                      borderRadius: 50,
                      padding: "10px 20px",
                      fontSize: ".85rem",
                      fontWeight: 800,
                      color: canRedeem && !isPMode ? "white" : T.textLight,
                      cursor: canRedeem && !isPMode ? "pointer" : "default",
                      fontFamily: "'Fredoka', sans-serif",
                      opacity: !canRedeem ? 0.5 : 1,
                      boxShadow: canRedeem && !isPMode ? `0 4px 12px ${T.primary}30` : "none",
                      minHeight: 48,
                      flexShrink: 0,
                    }}
                  >
                    {canRedeem ? "Einl\u00F6sen" : "\u{1F512}"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Redemption history ── */}
      {!isEditing && log.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 800,
            fontSize: ".85rem",
            color: T.textSecondary,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            marginBottom: 10,
          }}>
            Letzte Einl\u00F6sungen
          </div>
          <div className="game-card" style={{ padding: "12px 16px" }}>
            {log.slice(-5).reverse().map((entry, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: i < Math.min(log.length, 5) - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
              }}>
                <div style={{
                  fontSize: ".9rem",
                  fontWeight: 700,
                  color: T.textPrimary,
                }}>
                  {resolveRewardName(entry.id)}
                </div>
                <div style={{
                  fontSize: ".8rem",
                  fontWeight: 600,
                  color: T.textLight,
                }}>
                  {formatDate(entry.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Parent mode hint (when not editing) ── */}
      {isPMode && !isEditing && (
        <div style={{
          marginTop: 20,
          textAlign: "center",
          fontSize: ".85rem",
          fontWeight: 600,
          color: T.textLight,
          fontStyle: "italic",
        }}>
          Elternmodus aktiv &mdash; Einl&ouml;sen deaktiviert
        </div>
      )}
    </div>
  );
}
