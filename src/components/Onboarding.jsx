import React, { useState, useEffect, useRef } from 'react';
import { T, HERO_COLORS, HERO_HAIRS, SKIN_TONES, HAIR_COLORS, COMPANION_TYPES, OB_CHEST_REWARD } from '../constants';
import { OBWrap, OBTitle, OBSub, OBBtn, OBGrid, OBChip } from './ui';
import HeroSprite from './HeroSprite';
import Egg from './Egg';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [hero, setHero] = useState({
    shape: "circle", color: HERO_COLORS[0], eyes: "round", hair: "short",
    name: "", skinTone: SKIN_TONES[1], hairColor: HAIR_COLORS[0],
  });
  const [selectedEgg, setSelectedEgg] = useState(null); // "dragon" | "wolf" | "phoenix"
  const [companionName, setCompanionName] = useState("");
  const nameRef = useRef(null);
  const companionNameRef = useRef(null);

  const advanceStep = (nextStep) => {
    setStep(nextStep);
  };

  useEffect(() => { if (step === 2) setTimeout(() => nameRef.current?.focus(), 100); }, [step]);
  useEffect(() => { if (step === 4) setTimeout(() => companionNameRef.current?.focus(), 100); }, [step]);

  const totalSteps = 6;

  // ── Progress dots (6 dots, gold active) ──
  const Dots = () => (
    <div style={{ display: "flex", gap: 5, marginBottom: 16, justifyContent: "center" }}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} style={{
          width: i === step ? 20 : 7, height: 7, borderRadius: 4,
          background: i < step ? "#FFD700" : i === step ? "#FFD700" : "rgba(0,0,0,0.08)",
          transition: "all .3s",
        }} />
      ))}
    </div>
  );

  // ── Shared input style ──
  const inputStyle = {
    width: "100%", maxWidth: 320, background: "white", borderRadius: 16,
    padding: "16px 20px", color: T.textPrimary, fontSize: "1.15rem",
    fontFamily: "'Fredoka',sans-serif", textAlign: "center",
    outline: "none", fontWeight: 700, boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    minHeight: 48,
  };

  // ── Hair style labels ──
  const hairLabels = {
    short: "Kurz", spiky: "Stachelig", curly: "Lockig",
    long: "Lang", cap: "Kappe", none: "Keine",
  };
  const hairIcons = {
    short: "\u2702\uFE0F", spiky: "\u26A1", curly: "\uD83C\uDF00",
    long: "\uD83D\uDC87", cap: "\uD83E\uDDE2", none: "\uD83D\uDEAB",
  };

  // ── Swatch button helper ──
  const Swatch = ({ color, selected, onClick, size = 48 }) => (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: 14, background: color,
      border: selected ? "3px solid #2D2A1E" : "3px solid transparent",
      cursor: "pointer", margin: "0 auto",
      boxShadow: selected ? `0 4px 16px ${color}60` : "0 2px 6px rgba(0,0,0,0.08)",
      transition: "all .15s", minHeight: 48, minWidth: 48,
    }} />
  );

  // ═══ Step 0: Welcome ═══
  if (step === 0) return (
    <OBWrap>
      <img src={import.meta.env.BASE_URL + "ronki-wordmark.png"} alt="Ronki" style={{ width: "min(280px, 70vw)", marginBottom: 24, animation: "heroFloat 3s ease-in-out infinite" }} />
      <OBSub>Erstelle deinen Helden und finde dein Begleiter-Ei!</OBSub>
      <OBBtn onClick={() => setStep(1)} big>Los geht's! 🚀</OBBtn>
    </OBWrap>
  );

  // ═══ Step 1: Combined Avatar Builder ═══
  if (step === 1) return (
    <OBWrap>
      <Dots />
      <OBTitle>Erstelle deinen Helden!</OBTitle>

      {/* Live hero preview */}
      <div style={{ marginBottom: 20, animation: "heroFloat 3s ease-in-out infinite" }}>
        <HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair}
          size={150} level={1} skinTone={hero.skinTone} hairColor={hero.hairColor} />
      </div>

      {/* Skin tone */}
      <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textSecondary, marginBottom: 6, textAlign: "center" }}>Hautfarbe</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14 }}>
        {SKIN_TONES.map(tone => (
          <Swatch key={tone} color={tone} selected={hero.skinTone === tone}
            onClick={() => setHero(h => ({ ...h, skinTone: tone }))} />
        ))}
      </div>

      {/* Hair style */}
      <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textSecondary, marginBottom: 6, textAlign: "center" }}>Frisur</div>
      <OBGrid cols={3}>
        {HERO_HAIRS.map(h2 => (
          <OBChip key={h2} selected={hero.hair === h2}
            onClick={() => setHero(h => ({ ...h, hair: h2 }))}>
            {hairIcons[h2]}
            <div style={{ fontSize: ".7rem", marginTop: 2 }}>{hairLabels[h2]}</div>
          </OBChip>
        ))}
      </OBGrid>

      {/* Hair color */}
      <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textSecondary, marginTop: 14, marginBottom: 6, textAlign: "center" }}>Haarfarbe</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
        {HAIR_COLORS.map(c => (
          <Swatch key={c} color={c} selected={hero.hairColor === c}
            onClick={() => setHero(h => ({ ...h, hairColor: c }))} />
        ))}
      </div>

      {/* Outfit color */}
      <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textSecondary, marginBottom: 6, textAlign: "center" }}>Outfit</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
        {HERO_COLORS.map(c => (
          <Swatch key={c} color={c} selected={hero.color === c}
            onClick={() => setHero(h => ({ ...h, color: c }))} />
        ))}
      </div>

      <OBBtn onClick={() => advanceStep(2)}>Weiter →</OBBtn>
    </OBWrap>
  );

  // ═══ Step 2: Hero Name ═══
  if (step === 2) return (
    <OBWrap>
      <Dots />
      <OBTitle>Dein Heldenname</OBTitle>
      <div style={{ marginBottom: 16 }}>
        <HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair}
          size={150} level={1} skinTone={hero.skinTone} hairColor={hero.hairColor} />
      </div>
      <input ref={nameRef} value={hero.name}
        onChange={e => setHero(h => ({ ...h, name: e.target.value }))}
        placeholder="Name eingeben..."
        style={{ ...inputStyle, border: `2px solid ${hero.name.trim() ? "#FFD700" : "rgba(0,0,0,0.1)"}` }}
      />
      <div style={{ marginTop: 16 }}>
        <OBBtn onClick={() => advanceStep(3)} disabled={!hero.name.trim()}>Weiter →</OBBtn>
      </div>
    </OBWrap>
  );

  // ═══ Step 3: Egg Selection ═══
  if (step === 3) {
    const eggs = [
      { type: "dragon", label: "Feuer-Ei 🔥" },
      { type: "wolf", label: "Mond-Ei 🌙" },
      { type: "phoenix", label: "Sonnen-Ei ☀️" },
    ];

    return (
      <OBWrap>
        <Dots />
        <OBTitle>Wähle dein Begleiter-Ei! 🥚</OBTitle>
        <OBSub>Dein Begleiter wartet darauf zu schlüpfen!</OBSub>

        <div style={{
          display: "flex", gap: 16, justifyContent: "center",
          alignItems: "center", marginBottom: 20, flexWrap: "wrap",
        }}>
          {eggs.map(egg => (
            <button key={egg.type} onClick={() => setSelectedEgg(egg.type)}
              style={{
                background: selectedEgg === egg.type ? "#FFD70020" : T.card,
                border: selectedEgg === egg.type ? "3px solid #FFD700" : "3px solid transparent",
                borderRadius: 20, padding: "16px 12px", cursor: "pointer",
                transition: "all .2s", textAlign: "center", minWidth: 100,
                boxShadow: selectedEgg === egg.type
                  ? "0 6px 24px rgba(255,215,0,0.3)"
                  : "0 2px 12px rgba(0,0,0,0.06)",
              }}>
              <Egg type={egg.type} size={90} progress={0} />
              <div style={{
                fontSize: ".8rem", fontWeight: 800, marginTop: 8,
                color: T.textPrimary, fontFamily: "'Nunito',sans-serif",
              }}>
                {egg.label}
              </div>
            </button>
          ))}
        </div>

        {/* Companion info for selected egg */}
        {selectedEgg && COMPANION_TYPES[selectedEgg] && (
          <div style={{
            background: "white", borderRadius: 16, padding: "12px 20px",
            marginBottom: 16, textAlign: "center", maxWidth: 320,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: T.primary }}>
              {COMPANION_TYPES[selectedEgg].emoji} {COMPANION_TYPES[selectedEgg].name}
            </div>
            <div style={{ fontSize: ".85rem", color: T.textSecondary, marginTop: 4 }}>
              {COMPANION_TYPES[selectedEgg].desc}
            </div>
          </div>
        )}

        <OBBtn onClick={() => advanceStep(4)} disabled={!selectedEgg}>Weiter →</OBBtn>
      </OBWrap>
    );
  }

  // ═══ Step 4: Companion Name ═══
  if (step === 4) return (
    <OBWrap>
      <Dots />
      <OBTitle>Name für deinen Begleiter?</OBTitle>

      {/* Selected egg with subtle glow */}
      <div style={{
        marginBottom: 16, filter: "drop-shadow(0 0 12px rgba(255,215,0,0.4))",
      }}>
        <Egg type={selectedEgg || "dragon"} size={100} progress={0} />
      </div>

      <input ref={companionNameRef} value={companionName}
        onChange={e => setCompanionName(e.target.value)}
        placeholder="Name eingeben..."
        style={{ ...inputStyle, border: `2px solid ${companionName.trim() ? "#FFD700" : "rgba(0,0,0,0.1)"}` }}
      />

      <div style={{ marginTop: 16 }}>
        <OBBtn onClick={() => advanceStep(5)} disabled={!companionName.trim()}>Weiter →</OBBtn>
      </div>
    </OBWrap>
  );

  // ═══ Step 5: Activate ═══
  if (step === 5) return (
    <OBWrap>
      <Dots />
      <OBTitle>Bereit für dein Abenteuer!</OBTitle>

      {/* Hero + egg together */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ animation: "heroFloat 3s ease-in-out infinite" }}>
          <HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair}
            size={120} level={1} skinTone={hero.skinTone} hairColor={hero.hairColor} />
        </div>
        <div style={{ filter: "drop-shadow(0 0 12px rgba(255,215,0,0.4))" }}>
          <Egg type={selectedEgg || "dragon"} size={80} progress={0} />
        </div>
      </div>

      {/* Chest reward */}
      <div style={{
        background: "#FFD70015", borderRadius: 16, padding: "14px 20px",
        marginBottom: 20, textAlign: "center", maxWidth: 320,
      }}>
        <div style={{ fontSize: "2rem", marginBottom: 4 }}>{OB_CHEST_REWARD.icon}</div>
        <div style={{ fontSize: ".95rem", fontWeight: 800, color: T.primary }}>{OB_CHEST_REWARD.text}</div>
        <div style={{ fontSize: ".85rem", color: T.textSecondary, marginTop: 6, lineHeight: 1.5 }}>
          Sammle Heldenpunkte durch deine täglichen Aufgaben!
        </div>
      </div>

      <OBBtn
        onClick={() => {
          onComplete({
            hero: { ...hero, skinTone: hero.skinTone, hairColor: hero.hairColor },
            catVariant: "tiger",
            catName: companionName,
            startXP: 1,
            startCoins: 1,
            companionType: selectedEgg,
            eggType: selectedEgg,
          });
        }}
        big
      >
        Abenteuer starten! 🐉
      </OBBtn>
    </OBWrap>
  );

  return null;
}
