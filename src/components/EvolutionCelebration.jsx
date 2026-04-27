import React, { useState, useEffect, useMemo } from 'react';
import Companion from './Companion';
import VoiceBubble from './VoiceBubble';
import { useVoice } from '../companion/useVoice';
import { T, COMPANION_STAGES, CAT_STAGES } from '../constants';
import { getCompanionStageName } from '../utils/helpers';

/**
 * EvolutionCelebration -- Full-screen overlay when a companion evolves.
 *
 * Props:
 *   companionType   "cat" | "dragon" | "wolf" | "phoenix"
 *   companionVariant  e.g. "fire", "ice"
 *   oldStage        previous stage index
 *   newStage        new stage index
 *   stageName       resolved stage name string (fallback computed here)
 *   onClose         callback to dismiss
 *
 * Three phases over ~5 seconds:
 *   Phase 1 (0-1.5s):  "Dein Begleiter entwickelt sich!" + old companion shaking/glowing
 *   Phase 2 (1.5-3.5s): Flash + morph to new stage + particles + new stage name
 *   Phase 3 (3.5-5s):   Large reveal + floating animation + Weiter button
 */
export default function EvolutionCelebration({
  companionType = "cat",
  companionVariant,
  oldStage,
  newStage,
  stageName: stageNameProp,
  newBossTier,
  onClose,
}) {
  const [phase, setPhase] = useState(1);
  const voice = useVoice();

  // Resolve stage name from props or constants
  const stageInfo = getCompanionStageName(companionType, newStage);
  const resolvedName = stageNameProp || stageInfo.name;
  const stageEmoji = stageInfo.emoji;

  // Stable particle positions (won't jitter on re-render)
  const particles = useMemo(() => Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const dist = 60 + Math.random() * 80;
    const size = 4 + Math.random() * 8;
    return {
      px: Math.cos(angle) * dist, py: Math.sin(angle) * dist,
      size, delay: Math.random() * 0.4,
      color: `hsl(${40 + Math.random() * 20}, 95%, ${55 + Math.random() * 20}%)`,
    };
  }), []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 1500);
    const t2 = setTimeout(() => setPhase(3), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Fire the Storyteller-tier reveal line once Phase 3 lands. Self-aware
  // beat — Ronki notices himself, kid is the witness. See
  // docs/ronki-voicelines.md (evolution_reveal trigger added 2026-04-27).
  useEffect(() => {
    if (phase === 3) voice.say('evolution_reveal');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <>
      <style>{`
        @keyframes evo-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes evo-shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-4px) rotate(-2deg); }
          20% { transform: translateX(4px) rotate(2deg); }
          30% { transform: translateX(-3px) rotate(-1deg); }
          40% { transform: translateX(3px) rotate(1deg); }
          50% { transform: translateX(-2px); }
          60% { transform: translateX(2px); }
          70% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
          90% { transform: translateX(0); }
        }
        @keyframes evo-glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(251,191,36,0.4)); }
          50% { filter: drop-shadow(0 0 24px rgba(251,191,36,0.9)); }
        }
        @keyframes evo-flash {
          0% { opacity: 0.95; }
          100% { opacity: 0; }
        }
        @keyframes evo-particle {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; }
        }
        @keyframes evo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes evo-name-in {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes evo-btn-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes evo-arrow-bounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Fredoka', 'Nunito', sans-serif",
        color: "#fff",
        touchAction: "none",
      }}>

        {/* ── Phase 1: Announcement + old companion shaking ── */}
        {phase === 1 && (
          <>
            <div style={{
              fontSize: "1.4rem", fontWeight: 700,
              color: "#FCD34D",
              textAlign: "center",
              animation: "evo-pulse 1s ease-in-out infinite",
              textShadow: "0 0 20px rgba(251,191,36,0.6)",
              marginBottom: 32,
              padding: "0 24px",
            }}>
              Dein Begleiter entwickelt sich!
            </div>
            <div style={{
              animation: "evo-shake 0.5s ease-in-out infinite, evo-glow 1s ease-in-out infinite",
            }}>
              <Companion
                type={companionType}
                variant={companionVariant}
                mood="excited"
                size={120}
                stage={oldStage}
              />
            </div>
          </>
        )}

        {/* ── Phase 2: Flash + morph + particles + stage name ── */}
        {phase === 2 && (
          <>
            {/* White flash overlay */}
            <div style={{
              position: "fixed", inset: 0, zIndex: 201,
              background: "white",
              animation: "evo-flash 0.8s ease-out forwards",
              pointerEvents: "none",
            }} />

            {/* Golden particles (memoized to prevent jitter on re-render) */}
            {particles.map((pt, i) => (
              <div key={i} style={{
                position: "absolute", width: pt.size, height: pt.size,
                borderRadius: "50%", background: pt.color,
                boxShadow: "0 0 6px rgba(251,191,36,0.8)",
                "--px": `${pt.px}px`, "--py": `${pt.py}px`,
                animation: `evo-particle 1.2s ${pt.delay}s ease-out forwards`,
                zIndex: 202, top: "50%", left: "50%",
                marginTop: -pt.size / 2, marginLeft: -pt.size / 2,
                pointerEvents: "none",
              }} />
            ))}

            {/* New companion (morphed) */}
            <div style={{
              animation: "evo-glow 1s ease-in-out infinite",
              zIndex: 202,
            }}>
              <Companion
                type={companionType}
                variant={companionVariant}
                mood="excited"
                size={140}
                stage={newStage}
              />
            </div>

            {/* Arrow + new stage name */}
            <div style={{
              marginTop: 24,
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#FCD34D",
              textAlign: "center",
              animation: "evo-name-in 0.6s 0.3s ease-out both",
              textShadow: "0 0 16px rgba(251,191,36,0.5)",
              zIndex: 202,
            }}>
              <span style={{ animation: "evo-arrow-bounce 0.8s ease-in-out infinite", display: "inline-block" }}>
                {"\u2192"}
              </span>
              {" "}{resolvedName}!
            </div>
          </>
        )}

        {/* ── Phase 3: Reveal ── */}
        {phase === 3 && (
          <>
            {/* Large companion, floating */}
            <div style={{
              animation: "evo-float 2.5s ease-in-out infinite",
              filter: "drop-shadow(0 0 20px rgba(251,191,36,0.5))",
              marginBottom: 24,
            }}>
              <Companion
                type={companionType}
                variant={companionVariant}
                mood="excited"
                size={160}
                stage={newStage}
              />
            </div>

            {/* Stage name with emoji */}
            <div style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              fontFamily: "'Fredoka', 'Nunito', sans-serif",
              background: "linear-gradient(135deg, #A78BFA 0%, #FCD34D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textAlign: "center",
              animation: "evo-name-in 0.5s ease-out both",
              marginBottom: 8,
            }}>
              {stageEmoji} {resolvedName} {stageEmoji}
            </div>

            {/* Subtitle */}
            <div style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              marginBottom: 16,
              animation: "evo-name-in 0.5s 0.15s ease-out both",
            }}>
              {COMPANION_STAGES[companionType]?.[newStage]?.desc
                || CAT_STAGES[newStage]?.desc
                || "Eine neue Stufe!"}
            </div>

            {/* Ronki self-reveal bubble — Storyteller tier. Fires once
                Phase 3 mounts. Chip-variant so it sits inline below the
                subtitle without breaking the floating-companion focus. */}
            {voice.line && (
              <div style={{ marginBottom: newBossTier ? 16 : 24, animation: "evo-name-in 0.45s 0.25s ease-out both" }}>
                <VoiceBubble line={voice.line} onDismiss={voice.dismiss} variant="chip" />
              </div>
            )}

            {/* Boss tier unlock notification */}
            {newBossTier && (
              <div style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(239,68,68,0.25))",
                border: "2px solid #F59E0B",
                borderRadius: 14,
                padding: "10px 24px",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#FCD34D",
                textAlign: "center",
                marginBottom: 32,
                animation: "evo-name-in 0.6s 0.3s ease-out both",
                textShadow: "0 0 12px rgba(245,158,11,0.5)",
              }}>
                {"\u2694\uFE0F"} Neue Bosse freigeschaltet: {newBossTier}!
              </div>
            )}

            {/* Weiter button */}
            <button
              onClick={onClose}
              style={{
                background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                color: "#fff",
                border: "none",
                borderRadius: 16,
                padding: "14px 48px",
                fontSize: "1.2rem",
                fontWeight: 700,
                fontFamily: "'Fredoka', 'Nunito', sans-serif",
                cursor: "pointer",
                minHeight: 52,
                minWidth: 160,
                boxShadow: "0 4px 20px rgba(109,40,217,0.4), 0 0 30px rgba(251,191,36,0.2)",
                animation: "evo-btn-in 0.4s 0.3s ease-out both",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Weiter
            </button>
          </>
        )}
      </div>
    </>
  );
}
