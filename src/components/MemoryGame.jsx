import React, { useState, useEffect, useCallback } from 'react';
import { T } from '../constants';
import SFX from '../utils/sfx';

const ALL_EMOJIS = [
  "\u{1F436}","\u{1F431}","\u{1F98A}","\u{1F438}","\u{1F98B}","\u{1F308}",
  "\u{1F43C}","\u{1F984}","\u{1F419}","\u{1F981}","\u{1F422}","\u2B50",
  "\u{1F42C}","\u{1F99C}",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryGame({ onComplete }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const picked = shuffle(ALL_EMOJIS).slice(0, 6);
    setCards(shuffle([...picked, ...picked]).map((emoji, i) => ({ id: i, emoji })));
  }, []);

  const flipCard = useCallback((idx) => {
    if (busy || flipped.includes(idx) || matched.has(idx) || won) return;
    SFX.play("tap");

    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      setMoves(m => m + 1);
      setBusy(true);

      if (cards[next[0]].emoji === cards[next[1]].emoji) {
        setTimeout(() => {
          SFX.play("match");
          const newMatched = new Set([...matched, next[0], next[1]]);
          setMatched(newMatched);
          setFlipped([]);
          setBusy(false);
          if (newMatched.size === cards.length) {
            setTimeout(() => { SFX.play("celeb"); setWon(true); }, 400);
          }
        }, 400);
      } else {
        setTimeout(() => { setFlipped([]); setBusy(false); }, 1000);
      }
    }
  }, [flipped, matched, cards, busy, won]);

  const reward = {
    xp: moves <= 8 ? 40 : moves <= 12 ? 25 : 15,
    coins: moves <= 8 ? 30 : moves <= 12 ? 20 : 10,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9990, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .3s ease" }}>
      <div style={{ background: "white", borderRadius: 28, padding: 24, textAlign: "center", maxWidth: 360, width: "92%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.3rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", fontStyle: "italic", marginBottom: 4 }}>{"\u{1F9E0}"} Memo-Spiel!</div>
        <div style={{ fontSize: ".8rem", color: T.textSecondary, marginBottom: 12 }}>
          {won ? `Geschafft in ${moves} Versuchen!` : "Finde alle Paare!"}
        </div>

        {!won && <div style={{ fontSize: ".7rem", color: T.textLight, marginBottom: 8 }}>Versuche: {moves}</div>}

        {!won ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
            {cards.map((card, i) => {
              const isFlipped = flipped.includes(i);
              const isMatched = matched.has(i);
              const showFace = isFlipped || isMatched;
              return (
                <button key={card.id} onClick={() => flipCard(i)} style={{
                  width: "100%", aspectRatio: "1", borderRadius: 12, border: "none",
                  fontSize: showFace ? "1.6rem" : "1.2rem",
                  cursor: isMatched ? "default" : "pointer",
                  background: isMatched ? `${T.success}20` : showFace ? `${T.primary}10` : `linear-gradient(135deg, ${T.primary}, ${T.primaryLight})`,
                  color: showFace ? "inherit" : "rgba(255,255,255,0.8)",
                  transition: "all .2s ease",
                  transform: showFace ? "scale(1)" : "scale(0.95)",
                  boxShadow: isMatched ? `0 0 0 2px ${T.success}40` : showFace ? "none" : "0 2px 8px rgba(0,0,0,0.1)",
                  minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: isMatched ? 0.7 : 1,
                }}>
                  {showFace ? card.emoji : "?"}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: "3rem", marginBottom: 8 }}>{"\u{1F389}"}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ background: `${T.primary}15`, borderRadius: 12, padding: "8px 16px" }}>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: T.primary }}>+{reward.xp}</div>
                <div style={{ fontSize: ".6rem", color: T.textSecondary, fontWeight: 700 }}>XP</div>
              </div>
              <div style={{ background: `${T.accent}20`, borderRadius: 12, padding: "8px 16px" }}>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: T.accentDark }}>+{reward.coins}</div>
                <div style={{ fontSize: ".6rem", color: T.textSecondary, fontWeight: 700 }}>M\u00FCnzen</div>
              </div>
            </div>
            {moves <= 8 && <div style={{ fontSize: ".75rem", color: T.success, fontWeight: 800 }}>{"\u2B50"} Meister-Ged\u00E4chtnis!</div>}
            <button onClick={() => onComplete(reward)} style={{
              background: `linear-gradient(135deg, ${T.success}, ${T.successDark})`,
              border: "none", borderRadius: 50, padding: "14px 36px",
              color: "white", fontWeight: 800, cursor: "pointer",
              fontFamily: "'Fredoka',sans-serif", marginTop: 12, minHeight: 48,
              fontSize: "1rem",
            }}>
              Einsammeln! {"\u2728"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
