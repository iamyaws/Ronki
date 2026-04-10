import React from 'react';
import { T, CAT_STAGES, COMPANION_STAGES, COMPANION_TYPES } from '../constants';
import { getCatStage, getCatStageProg, getCatMood } from '../utils/helpers';
import { ViewHeader } from './ui';
import Companion from './Companion';
import GearSlots from './GearSlots';
import EvolutionTracker from './EvolutionTracker';
import { useGame } from '../context/GameContext';

const FUN_FACTS = {
  cat: {
    species: "Hauskatze",
    likes: "Sonnenstrahlen, Fisch, Streicheleinheiten",
    dislikes: "Regen, laute Geräusche",
    talent: "Kann im Schlaf schnurren",
    motto: "Schnurr... das Leben ist schön!",
    heights: ["15 cm", "22 cm", "30 cm", "38 cm", "45 cm"],
    weights: ["0.8 kg", "2.5 kg", "4 kg", "5.5 kg", "7 kg"],
  },
  dragon: {
    species: "Vietnamesischer Rồng",
    likes: "Feuer, Flüge, Abenteuer",
    dislikes: "Kälte, Langeweile",
    talent: "Kann kleine Flammen pusten",
    motto: "Mut ist stärker als Feuer!",
    heights: ["20 cm", "45 cm", "80 cm", "1.2 m", "2 m"],
    weights: ["1 kg", "5 kg", "15 kg", "40 kg", "100 kg"],
  },
  wolf: {
    species: "Grauer Wolf",
    likes: "Mondschein, Teamwork, Rennen",
    dislikes: "Einsamkeit, Hitze",
    talent: "Spürt Gefühle anderer",
    motto: "Zusammen sind wir stark!",
    heights: ["25 cm", "40 cm", "65 cm", "80 cm", "95 cm"],
    weights: ["2 kg", "8 kg", "20 kg", "35 kg", "50 kg"],
  },
  phoenix: {
    species: "Feuerphönix",
    likes: "Sonnenaufgänge, Musik, Wärme",
    dislikes: "Dunkelheit, Ketten",
    talent: "Leuchtet im Dunkeln",
    motto: "Aus der Asche wird Licht!",
    heights: ["12 cm", "25 cm", "50 cm", "75 cm", "1 m"],
    weights: ["0.3 kg", "1.5 kg", "4 kg", "8 kg", "15 kg"],
  },
};

export default function CompanionProfile() {
  const { state, actions, ui, computed } = useGame();
  const { mood } = computed;
  const type = state.companionType || "cat";
  const stage = getCatStage(state.catEvo || 0);
  const stageNames = COMPANION_STAGES[type] || COMPANION_STAGES.cat;
  const stageInfo = stageNames[stage];
  const typeInfo = COMPANION_TYPES[type] || COMPANION_TYPES.cat;
  const facts = FUN_FACTS[type] || FUN_FACTS.cat;
  const companionMood = getCatMood(state.catHunger, state.catHappy, state.catEnergy);
  const hunger = state.catHunger ?? 100;
  const happy = state.catHappy ?? 100;
  const energy = state.catEnergy ?? 100;
  const createdDate = state.hist?.[0]?.d;
  const ageDays = createdDate ? Math.max(1, Math.floor((Date.now() - createdDate) / 86400000)) : 1;

  return (
    <div className="view-enter" style={{ minHeight: "100vh", padding: "12px 16px 100px", background: "#FFF8F0" }}>
      <ViewHeader onBack={() => ui.setView("hub")} title={`${state.catName || typeInfo.name}`} icon={typeInfo.emoji} />
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ width: 180, height: 180, margin: "0 auto", borderRadius: "50%", background: "radial-gradient(circle, rgba(252,211,77,0.15) 0%, transparent 70%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ animation: "heroFloat 3s ease-in-out infinite" }}>
            <Companion type={type} variant={state.catVariant} mood={companionMood === "sleepy" ? "sleepy" : mood} size={150} stage={stage} gear={state.equippedGear} />
          </div>
        </div>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: T.textPrimary, marginTop: 8 }}>{state.catName || typeInfo.name}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4, background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))", border: "1.5px solid rgba(245,158,11,0.2)", borderRadius: 50, padding: "4px 14px" }}>
          <span style={{ fontSize: "1rem" }}>{stageInfo?.emoji}</span>
          <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 700, color: "#B45309" }}>{stageInfo?.name}</span>
        </div>
      </div>

      <div className="game-card" style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".9rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", marginBottom: 12 }}>Steckbrief</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{ label: "Art", value: facts.species, icon: "\uD83D\uDCCB" }, { label: "Alter", value: `${ageDays} Tag${ageDays !== 1 ? "e" : ""}`, icon: "\uD83C\uDF82" }, { label: "Gr\u00f6\u00dfe", value: facts.heights[stage], icon: "\uD83D\uDCCF" }, { label: "Gewicht", value: facts.weights[stage], icon: "\u2696\uFE0F" }].map((s, i) => (
            <div key={i} style={{ background: "rgba(180,120,40,0.04)", borderRadius: 14, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.1rem" }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: ".75rem", fontWeight: 700, color: T.textLight, textTransform: "uppercase" }}>{s.label}</div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {[{ label: "Mag", value: facts.likes, icon: "\u2764\uFE0F" }, { label: "Mag nicht", value: facts.dislikes, icon: "\uD83D\uDE45" }, { label: "Talent", value: facts.talent, icon: "\u2B50" }].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0" }}>
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{s.icon}</span>
              <div><span style={{ fontSize: ".8rem", fontWeight: 800, color: T.textSecondary }}>{s.label}: </span><span style={{ fontSize: ".9rem", fontWeight: 600, color: T.textPrimary }}>{s.value}</span></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "10px 14px", background: "linear-gradient(135deg, rgba(109,40,217,0.06), rgba(167,139,250,0.04))", borderRadius: 14, border: "1.5px solid rgba(109,40,217,0.1)", fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 600, color: T.primary, fontStyle: "italic", textAlign: "center" }}>
          \"{facts.motto}\"
        </div>
      </div>

      <div className="game-card" style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".9rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", marginBottom: 12 }}>Zustand</div>
        {[{ label: "Hunger", value: hunger, color: "#F97316", icon: "\uD83C\uDF63" }, { label: "Gl\u00fcck", value: happy, color: "#EC4899", icon: "\uD83D\uDC9B" }, { label: "Energie", value: energy, color: "#3B82F6", icon: "\u26A1" }].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: "1.1rem", width: 24, textAlign: "center" }}>{s.icon}</span>
            <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textSecondary, width: 55 }}>{s.label}</div>
            <div style={{ flex: 1, height: 10, background: "rgba(0,0,0,0.06)", borderRadius: 50, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 50, width: `${s.value}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)`, transition: "width .4s ease" }} /></div>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".9rem", fontWeight: 700, color: s.color, width: 36, textAlign: "right" }}>{s.value}%</div>
          </div>
        ))}
      </div>

      <div className="game-card" style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".9rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", marginBottom: 12 }}>Evolution</div>
        <EvolutionTracker catEvo={state.catEvo || 0} companionType={type} currentStage={stage} />
      </div>

      <div className="game-card" style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".9rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", marginBottom: 12 }}>Ausr\u00fcstung</div>
        <GearSlots equippedGear={state.equippedGear || {}} purchased={state.purchased || []} onEquip={(slot, id) => actions.equipGear(slot, id)} onUnequip={(slot) => actions.unequipGear(slot)} />
      </div>

      <button className="btn-tap" onClick={() => ui.setView("cat")} style={{ width: "100%", padding: "16px", background: `linear-gradient(135deg, ${T.primary}, ${T.primaryLight})`, border: "none", borderRadius: 18, cursor: "pointer", fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, boxShadow: `0 6px 20px ${T.primary}30` }}>
        {typeInfo.emoji} {state.catName} pflegen
      </button>
    </div>
  );
}
