import React from 'react';
import { T, CAT_STAGES } from '../constants';

// Stage thresholds from CAT_STAGES used for all companion types
const STAGE_LABELS = CAT_STAGES.map(s => s.name);
const STAGE_EMOJIS = CAT_STAGES.map(s => s.emoji);

export default function EvolutionTracker({ catEvo = 0, companionType = "cat", currentStage = 0 }) {
  const totalStages = CAT_STAGES.length;

  // Compute progress within current stage toward next
  const curThreshold = CAT_STAGES[currentStage]?.threshold || 0;
  const nextThreshold = CAT_STAGES[currentStage + 1]?.threshold;
  const isMaxStage = currentStage >= totalStages - 1;
  const progressInStage = nextThreshold
    ? Math.min(1, (catEvo - curThreshold) / (nextThreshold - curThreshold))
    : 1;
  const curEpInStage = catEvo - curThreshold;
  const neededEp = nextThreshold ? nextThreshold - curThreshold : 0;

  const currentName = STAGE_LABELS[currentStage] || "???";
  const nextName = STAGE_LABELS[currentStage + 1];

  return (
    <div className="game-card" style={{ padding: 16, marginBottom: 14 }}>
      {/* Header */}
      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: ".85rem", fontWeight: 800,
        color: T.primary, textTransform: "uppercase", marginBottom: 12,
      }}>
        Entwicklungspfad
      </div>

      {/* --- Stage Milestones Row --- */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 0, position: "relative", marginBottom: 6,
      }}>
        {Array.from({ length: totalStages }).map((_, i) => {
          const isCompleted = i < currentStage;
          const isCurrent = i === currentStage;
          const isFuture = i > currentStage;

          return (
            <React.Fragment key={i}>
              {/* Connector line before this node (skip first) */}
              {i > 0 && (
                <div style={{
                  flex: 1, height: 3, minWidth: 12,
                  background: i <= currentStage
                    ? "linear-gradient(90deg, #FCD34D, #F59E0B)"
                    : "rgba(180,120,40,0.12)",
                  borderRadius: 2,
                }} />
              )}

              {/* Stage node */}
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                position: "relative", zIndex: 1, flexShrink: 0,
              }}>
                <div style={{
                  width: isCurrent ? 38 : 28,
                  height: isCurrent ? 38 : 28,
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isCurrent ? "1.1rem" : ".8rem",
                  fontWeight: 800,
                  background: isCompleted
                    ? "linear-gradient(135deg, #FCD34D, #F59E0B)"
                    : isCurrent
                      ? "linear-gradient(135deg, #EDE9FE, #DDD6FE)"
                      : "rgba(180,120,40,0.06)",
                  border: isCompleted
                    ? "2.5px solid #D97706"
                    : isCurrent
                      ? "2.5px solid #7C3AED"
                      : "2.5px solid rgba(180,120,40,0.12)",
                  boxShadow: isCurrent
                    ? "0 0 12px rgba(124,58,217,0.35), 0 0 24px rgba(124,58,217,0.15)"
                    : "none",
                  color: isCompleted
                    ? "white"
                    : isCurrent
                      ? T.primary
                      : T.textLight,
                  transition: "all .3s ease",
                  animation: isCurrent ? "pulseGlow 2s ease-in-out infinite" : "none",
                }}>
                  {isCompleted ? "\u2713" : isCurrent ? STAGE_EMOJIS[i] : "\uD83D\uDD12"}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* --- Stage Labels Row --- */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: 14, paddingLeft: 0, paddingRight: 0,
      }}>
        {Array.from({ length: totalStages }).map((_, i) => {
          const isCompleted = i < currentStage;
          const isCurrent = i === currentStage;

          return (
            <div key={i} style={{
              flex: 1, textAlign: "center",
              fontSize: ".7rem", fontWeight: 700,
              fontFamily: "'Fredoka',sans-serif",
              color: isCompleted ? "#D97706" : isCurrent ? T.primary : T.textLight,
              lineHeight: 1.2, minWidth: 0,
            }}>
              {STAGE_LABELS[i]}
              {isCurrent && (
                <div style={{
                  fontSize: ".6rem", fontWeight: 600,
                  color: T.primary, marginTop: 1,
                }}>
                  {"\u2190"} hier
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- Progress bar to next stage --- */}
      {!isMaxStage && nextName && (
        <div>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 4,
          }}>
            <span style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: ".85rem", fontWeight: 700, color: T.textPrimary,
            }}>
              {currentName} {"\u2192"} {nextName}
            </span>
            <span style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: ".85rem", fontWeight: 700, color: T.accent,
            }}>
              {curEpInStage}/{neededEp} EP
            </span>
          </div>
          <div style={{
            background: "rgba(180,120,40,0.08)",
            borderRadius: 50, height: 8, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 50,
              width: `${Math.max(2, progressInStage * 100)}%`,
              background: "linear-gradient(90deg, #6D28D9, #A78BFA)",
              transition: "width .6s ease",
            }} />
          </div>
        </div>
      )}

      {/* Max stage message */}
      {isMaxStage && (
        <div style={{
          textAlign: "center", fontSize: ".9rem",
          fontWeight: 800, color: T.success,
          fontFamily: "'Fredoka',sans-serif",
        }}>
          {"\u2B50"} Maximale Stufe erreicht!
        </div>
      )}

      {/* Pulse animation keyframes injected inline */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 12px rgba(124,58,217,0.35), 0 0 24px rgba(124,58,217,0.15); }
          50% { box-shadow: 0 0 18px rgba(124,58,217,0.5), 0 0 32px rgba(124,58,217,0.25); }
        }
      `}</style>
    </div>
  );
}
