import React, { useState, useEffect } from 'react';
import { T } from '../constants';

// ── Confetti Celebration ──
export default function Celebration({ active, onDone }) {
  const [p, setP] = useState([]);
  const [msg, setMsg] = useState("");
  const MSGS = [
    "\u{1F4AA} Drangeblieben!",
    "\u{1F525} Weiter so!",
    "\u{1F680} Du gibst Gas!",
    "\u2B50 Nicht aufgegeben!",
    "\u{1F3AF} Ziel erreicht!",
    "\u26A1 Du packst das!",
    "\u{1F44F} Gut gemacht!",
    "\u2728 Einsatz zahlt sich aus!",
    "\u{1F31F} Jeden Tag besser!",
    "\u{1F9E0} Klug durchgezogen!",
    "\u{1F3C3} Voll dabei!",
    "\u{1F389} Geschafft!",
  ];
  useEffect(() => {
    if (!active) return;
    setMsg(MSGS[Math.floor(Math.random() * MSGS.length)]);
    setP(Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - .5) * 70,
      y: 50 + (Math.random() - .5) * 70,
      color: [T.accent, "#F472B6", T.success, "#60A5FA", T.primaryLight, T.accentDark][i % 6],
      size: 6 + Math.random() * 12,
      delay: Math.random() * .4,
    })));
    const t = setTimeout(() => { setP([]); onDone?.(); }, 2000);
    return () => clearTimeout(t);
  }, [active]);
  if (!p.length) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {p.map(pt => <div key={pt.id} style={{ position: "absolute", left: `${pt.x}%`, top: `${pt.y}%`, width: pt.size, height: pt.size, backgroundColor: pt.color, borderRadius: "50%", animation: `celebPop 1.8s ease-out ${pt.delay}s forwards`, opacity: 0 }} />)}
      <div style={{ fontSize: "3rem", animation: "celebText 1.8s ease-out forwards", zIndex: 10 }}>{msg}</div>
    </div>
  );
}

// ── Reward Toast ──
export function RewardToast({ show, text, icon }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)", zIndex: 9999, animation: "rewardPop .8s ease forwards", pointerEvents: "none" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "16px 28px", boxShadow: "0 12px 40px rgba(109,40,217,0.25)", border: `2px solid ${T.accent}`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "1.8rem" }}>{icon}</span>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: ".95rem", color: T.primary }}>{text}</div>
      </div>
    </div>
  );
}

// ── Rare Drop Toast ──
export function RareDropToast({ drop, onDone }) {
  useEffect(() => { if (drop) { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); } }, [drop]);
  if (!drop) return null;
  return (
    <div style={{ position: "fixed", top: "18%", left: "50%", transform: "translateX(-50%)", zIndex: 9998, animation: "rewardPop 2.5s ease forwards", pointerEvents: "none" }}>
      <div style={{ background: "linear-gradient(135deg,#FCD34D,#F59E0B)", borderRadius: 20, padding: "16px 28px", boxShadow: "0 12px 40px rgba(245,158,11,0.4)", display: "flex", alignItems: "center", gap: 10, border: "3px solid white" }}>
        <span style={{ fontSize: "2rem" }}>{drop.icon}</span>
        <div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: ".9rem", color: "white" }}>Seltener Fund!</div>
          <div style={{ fontSize: ".8rem", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{drop.label}</div>
        </div>
      </div>
    </div>
  );
}
