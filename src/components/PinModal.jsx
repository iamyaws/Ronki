import React from 'react';
import { T } from '../constants';

export default function PinModal({ pin, setPin, onSuccess, onClose }) {
  const handleKey = (n) => {
    if (n === null) return;
    if (n === "\u232B") { setPin(p => p.slice(0, -1)); return; }
    const nx = pin + n;
    setPin(nx);
    if (nx.length === 4) {
      if (nx === "1234") { onSuccess(); }
      setPin("");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s ease" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 28, padding: 28, textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.15)", minWidth: 280 }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 800, marginBottom: 16 }}>Eltern-PIN</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: 48, height: 56, borderRadius: 14, background: T.bg, border: "2px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: T.primary }}>
              {pin[i] ? "\u25CF" : ""}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, maxWidth: 220, margin: "0 auto" }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "\u232B"].map((n, i) => (
            <button key={i} onClick={() => handleKey(n)} style={{
              background: n === null ? "transparent" : T.bg,
              border: "none", borderRadius: 12, padding: "14px 0",
              color: T.textPrimary, fontSize: "1.3rem", fontWeight: 800,
              cursor: n === null ? "default" : "pointer",
              visibility: n === null ? "hidden" : "visible",
              minHeight: 48,
            }}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
