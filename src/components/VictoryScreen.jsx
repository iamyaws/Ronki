import React, { useState, useEffect } from 'react';
import { T } from '../constants';
import HeroSprite from './HeroSprite';
import Companion from './Companion';
import SFX from '../utils/sfx';
import { useGame } from '../context/GameContext';

export default function VictoryScreen({ onClose, onSpinWheel, onMemoryGame }) {
  const { state, computed } = useGame();
  const { level, done, total } = computed;

  const [phase, setPhase] = useState(0); // 0=burst, 1=summary, 2=ready
  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
    SFX.play("victory");
    const fw = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 15 + Math.random() * 50,
      color: [T.accent, "#F472B6", T.success, "#60A5FA", T.primaryLight, "#FCD34D", "#F97316"][i % 7],
      size: 4 + Math.random() * 10,
      dx: (Math.random() - 0.5) * 200,
      dy: (Math.random() - 0.5) * 200,
      delay: Math.random() * 0.6,
    }));
    setFireworks(fw);
    setTimeout(() => setPhase(1), 800);
    setTimeout(() => setPhase(2), 1600);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9995,
      background: "linear-gradient(180deg, #0F172A 0%, #1E1B4B 30%, #312E81 60%, #4C1D95 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, overflow: "hidden",
    }}>
      {/* Firework particles */}
      {fireworks.map(fw => (
        <div key={fw.id} style={{
          position: "absolute",
          left: `${fw.x}%`, top: `${fw.y}%`,
          width: fw.size, height: fw.size,
          backgroundColor: fw.color,
          borderRadius: "50%",
          animation: `fireworkDot 1.5s ease-out ${fw.delay}s forwards`,
          transform: `translate(${fw.dx}px, ${fw.dy}px)`,
          opacity: 0,
        }} />
      ))}

      {/* Stars background */}
      {Array.from({ length: 20 }, (_, i) => (
        <div key={`s${i}`} style={{
          position: "absolute", width: 2, height: 2, borderRadius: "50%",
          background: "white", top: `${5 + Math.random() * 90}%`, left: `${5 + Math.random() * 90}%`,
          animation: `starTwinkle ${1 + Math.random() * 2}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 2}s`,
        }} />
      ))}

      {/* Hero + Cat */}
      <div style={{
        animation: phase >= 1 ? "victorySlideUp 0.6s ease forwards" : "none",
        opacity: phase >= 1 ? 1 : 0,
        display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 24,
      }}>
        <div style={{ animation: "heroFloat 2.5s ease-in-out infinite" }}>
          <HeroSprite shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} size={140} level={level} />
        </div>
        <div style={{ animation: "catIdle 3s ease-in-out infinite" }}>
          <Companion type={state.companionType} variant={state.catVariant} mood="excited" size={64} />
        </div>
      </div>

      {/* Title */}
      <div style={{
        animation: phase >= 1 ? "victorySlideUp 0.6s ease 0.2s forwards" : "none",
        opacity: phase >= 1 ? undefined : 0,
        textAlign: "center", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: "2rem" }}>{"\u{1F33F}"}</span>
          <div style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1.8rem", fontWeight: 900,
            color: T.accent, textTransform: "uppercase", fontStyle: "italic",
            textShadow: "0 0 20px rgba(252,211,77,0.6), 0 2px 8px rgba(0,0,0,0.4)", letterSpacing: "-0.02em",
          }}>
            Du hast durchgehalten!
          </div>
          <span style={{ fontSize: "2rem", transform: "scaleX(-1)", display: "inline-block" }}>{"\u{1F33F}"}</span>
        </div>
        <div style={{ fontSize: ".9rem", color: "rgba(255,255,255,0.7)", fontWeight: 600, marginTop: 4 }}>
          {state.hero.name} hat heute nicht aufgegeben — das macht echte Helden aus!
        </div>
      </div>

      {/* Summary Card */}
      {phase >= 2 && (
        <div style={{
          animation: "victorySlideUp 0.5s ease forwards",
          background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)",
          borderRadius: 24, padding: 20, width: "100%", maxWidth: 340,
          border: "1px solid rgba(255,255,255,0.15)", marginBottom: 24,
        }}>
          <div style={{ fontSize: ".85rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12, textAlign: "center" }}>Tagesübersicht</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Aufgaben", value: `${done}/${total}`, icon: "\u2694\uFE0F" },
              { label: "Verdient", value: `+${state.dt}min`, icon: "\u23F0" },
              { label: "Streak", value: `${state.sd}d`, icon: "\u{1F525}" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "white" }}>{s.value}</div>
                <div style={{ fontSize: ".85rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
            <div style={{ background: `${T.primary}30`, borderRadius: 50, padding: "4px 12px", fontSize: ".85rem", fontWeight: 800, color: T.primaryLight }}>Lvl {level} {"\u26A1"} {state.xp} HP</div>
            <div style={{ background: `${T.accent}30`, borderRadius: 50, padding: "4px 12px", fontSize: ".85rem", fontWeight: 800, color: T.accent }}>{"\u2B50"} {state.coins}</div>
          </div>
        </div>
      )}

      {/* Buttons */}
      {phase >= 2 && (
        <div style={{ animation: "victorySlideUp 0.5s ease 0.2s forwards", display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
          {!state.wheelSpun && (
            <button className="btn-tap" onClick={onSpinWheel} style={{
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,
              border: "none", borderRadius: 50, padding: "16px 36px",
              color: "white", fontWeight: 800, fontSize: "1.05rem", cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              boxShadow: "0 8px 24px rgba(252,211,77,0.4)",
              textTransform: "uppercase", minHeight: 52,
            }}>
              {"\u{1F3A1}"} Glücksrad drehen!
            </button>
          )}
          {!state.memoryPlayed && (
            <button className="btn-tap" onClick={onMemoryGame} style={{
              background: `linear-gradient(135deg, #8B5CF6, #A78BFA)`,
              border: "none", borderRadius: 50, padding: "14px 36px",
              color: "white", fontWeight: 800, fontSize: ".95rem", cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              boxShadow: "0 8px 24px rgba(139,92,246,0.3)",
              minHeight: 48,
            }}>
              {"\u{1F9E0}"} Memo-Spiel spielen!
            </button>
          )}
          <button className="btn-tap" onClick={onClose} style={{
            background: state.wheelSpun ? `linear-gradient(135deg, ${T.primary}, ${T.primaryLight})` : "rgba(255,255,255,0.15)",
            border: "none", borderRadius: 50, padding: "14px 36px",
            color: "white", fontWeight: 800, fontSize: state.wheelSpun ? "1.05rem" : ".9rem",
            cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
            boxShadow: state.wheelSpun ? `0 8px 24px ${T.primary}40` : "none",
            minHeight: 48,
          }}>
            Gute Nacht! {"\u{1F319}"}
          </button>
        </div>
      )}
    </div>
  );
}
