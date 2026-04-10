import React, { useState } from 'react';
import { T, CHEST_REWARDS } from '../constants';
import SFX from '../utils/sfx';

export default function SurpriseChest({ onOpen, streakDays }) {
  const [opened, setOpened] = useState(false);
  const [reward, setReward] = useState(null);

  const open = () => {
    SFX.play("celeb");
    const r = CHEST_REWARDS[Math.floor(Math.random() * CHEST_REWARDS.length)];
    setReward(r);
    setOpened(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9990, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .3s ease" }}>
      <div style={{ background: "white", borderRadius: 28, padding: 28, textAlign: "center", maxWidth: 320, width: "90%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", fontStyle: "italic", marginBottom: 4 }}>{"\u{1F381}"} Überraschungstruhe!</div>
        <div style={{ fontSize: ".8rem", color: T.textSecondary, marginBottom: 16 }}>{streakDays} Tage am Stück drangeblieben!</div>
        {!opened ? <>
          <div style={{ fontSize: "5rem", animation: "heroFloat 1.5s ease-in-out infinite", marginBottom: 16 }}>{"\u{1F381}"}</div>
          <button onClick={open} style={{
            background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
            border: "none", borderRadius: 50, padding: "16px 40px",
            color: "white", fontWeight: 800, fontSize: "1.05rem", cursor: "pointer",
            fontFamily: "'Fredoka',sans-serif",
            boxShadow: "0 8px 24px rgba(245,158,11,0.4)", minHeight: 48,
          }}>
            Öffnen! {"\u{1F513}"}
          </button>
        </> : <>
          <div style={{ fontSize: "3.5rem", marginBottom: 8 }}>{reward.icon}</div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: T.primary, marginBottom: 4 }}>{reward.label}</div>
          <button onClick={() => onOpen(reward)} style={{
            background: `linear-gradient(135deg,${T.success},${T.successDark})`,
            border: "none", borderRadius: 50, padding: "14px 36px",
            color: "white", fontWeight: 800, cursor: "pointer",
            fontFamily: "'Fredoka',sans-serif", marginTop: 12, minHeight: 48,
          }}>
            Weiter so! {"\u{1F4AA}"}
          </button>
        </>}
      </div>
    </div>
  );
}
