import React, { useState } from 'react';
import { T, WHEEL_SEGMENTS } from '../constants';
import SFX from '../utils/sfx';

export default function SpinWheel({ onResult }) {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState(null);

  const spin = () => {
    if (spinning) return;
    SFX.play("tap");
    setSpinning(true);
    const idx = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const targetAngle = 360 * 5 + (idx * (360 / WHEEL_SEGMENTS.length)) + (360 / WHEEL_SEGMENTS.length / 2);
    setAngle(targetAngle);
    setTimeout(() => {
      SFX.play("celeb");
      setResult(WHEEL_SEGMENTS[idx]);
      setSpinning(false);
    }, 3500);
  };

  const segAngle = 360 / WHEEL_SEGMENTS.length;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9990, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .3s ease" }}>
      <div style={{ background: "white", borderRadius: 28, padding: 24, textAlign: "center", maxWidth: 340, width: "90%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.3rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", fontStyle: "italic", marginBottom: 4 }}>{"\u{1F3A1}"} Glücksrad!</div>
        <div style={{ fontSize: ".8rem", color: T.textSecondary, marginBottom: 16 }}>Dein Einsatz hat sich gelohnt!</div>
        <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto 16px" }}>
          <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", zIndex: 10, fontSize: "1.5rem" }}>{"\u25BC"}</div>
          <svg width="220" height="220" style={{ transform: `rotate(${angle}deg)`, transition: spinning ? "transform 3.5s cubic-bezier(0.17,0.67,0.12,0.99)" : "none" }}>
            {WHEEL_SEGMENTS.map((seg, i) => {
              const startA = (i * segAngle - 90) * Math.PI / 180;
              const endA = ((i + 1) * segAngle - 90) * Math.PI / 180;
              const x1 = 110 + 100 * Math.cos(startA), y1 = 110 + 100 * Math.sin(startA);
              const x2 = 110 + 100 * Math.cos(endA), y2 = 110 + 100 * Math.sin(endA);
              const midA = ((i + 0.5) * segAngle - 90) * Math.PI / 180;
              const tx = 110 + 60 * Math.cos(midA), ty = 110 + 60 * Math.sin(midA);
              return (
                <g key={i}>
                  <path d={`M110,110 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`} fill={seg.color} stroke="white" strokeWidth="2" />
                  <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize="20" transform={`rotate(${(i + 0.5) * segAngle},${tx},${ty})`}>{seg.icon}</text>
                </g>
              );
            })}
            <circle cx="110" cy="110" r="20" fill="white" stroke={T.primary} strokeWidth="3" />
          </svg>
        </div>
        {!result ? (
          <button onClick={spin} disabled={spinning} style={{
            background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`,
            border: "none", borderRadius: 50, padding: "16px 40px",
            color: "white", fontWeight: 800, fontSize: "1.05rem",
            cursor: spinning ? "default" : "pointer",
            fontFamily: "'Fredoka',sans-serif",
            opacity: spinning ? .6 : 1, boxShadow: `0 8px 24px ${T.primary}40`,
            minHeight: 48,
          }}>
            {spinning ? "Dreht..." : "Drehen! \u{1F3A1}"}
          </button>
        ) : (
          <div>
            <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{result.icon}</div>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: "1.05rem", color: T.primary, marginBottom: 4 }}>{result.label}</div>
            <button onClick={() => onResult(result)} style={{
              background: `linear-gradient(135deg,${T.success},${T.successDark})`,
              border: "none", borderRadius: 50, padding: "14px 36px",
              color: "white", fontWeight: 800, cursor: "pointer",
              fontFamily: "'Fredoka',sans-serif", marginTop: 8, minHeight: 48,
            }}>
              Einsammeln! {"\u2728"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
