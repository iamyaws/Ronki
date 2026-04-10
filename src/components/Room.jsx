import React, { useState, useEffect } from 'react';
import { T, SHOP_ITEMS, BADGES as BADGE_DEFS } from '../constants';
import HeroSprite from './HeroSprite';
import Companion from './Companion';
import SFX from '../utils/sfx';
import { useGame } from '../context/GameContext';

const HERO_LINES = {
  sleepy: ["Guten Morgen! \u2600\uFE0F", "Was steht heute an?", "Bereit f\u00FCr den Tag! \u{1F4AA}"],
  neutral: ["Weiter geht's! \u{1F3AF}", "Schritt f\u00FCr Schritt! \u{1F680}", "Jede Aufgabe z\u00E4hlt!"],
  happy: ["L\u00E4uft bei mir! \u{1F60A}", "Ich werde jeden Tag besser! \u{1F4C8}", "Nicht aufgeben! \u{1F525}"],
  excited: ["Heute alles geschafft! \u{1F4AA}", "Das war mein Einsatz! \u{1F3C6}", "Ich hab durchgehalten! \u2B50"],
};

const CAT_LINES = {
  sleepy: ["*g\u00E4hnt* Morgen! \u{1F634}", "Miau... aufstehen? \u{1F43E}", "Schnurr... 5 Minuten noch..."],
  neutral: ["Miau! Wir schaffen das! \u{1F63A}", "Noch eine Aufgabe? \u{1F4AA}", "Los geht's! \u{1F3AF}"],
  happy: ["Schnurr... l\u00E4uft gut! \u{1F638}", "Zusammen sind wir stark! \u{1F43E}", "Ich glaub an dich! \u2B50"],
  excited: ["MIAU! Wir haben's geschafft! \u{1F389}", "*schnurrt mega laut* \u{1F638}", "Bestes Team ever! \u{1F43E}\u2B50"],
};

const BADGE_POS = [
  [262, 74], [280, 80], [298, 86],
  [265, 97], [283, 103], [301, 109],
  [265, 122], [283, 128], [301, 134],
];

const getBadgeUnlocks = (state, level) => [
  state.xp > 0, state.sd >= 3, state.sd >= 7, level >= 5,
  state.hist.length >= 50, level >= 10, state.sd >= 30,
  state.hist.length >= 100, (state.acc || []).length > 0,
];

export default function Room() {
  const { state, computed, ui } = useGame();
  const { level, mood } = computed;
  const { setView, setShopTab } = ui;

  const has = (id) => (state.purchased || []).includes(id);
  const roomItems = (state.purchased || []).filter(id => id.startsWith("rm_")).length;
  const badges = BADGE_DEFS.map((b, i) => ({ ...b, u: getBadgeUnlocks(state, level)[i] }));
  const badgeCount = badges.filter(b => b.u).length;
  const roomScore = roomItems + badgeCount;
  const roomLevel = roomScore >= 18 ? 5 : roomScore >= 13 ? 4 : roomScore >= 8 ? 3 : roomScore >= 4 ? 2 : roomScore >= 1 ? 1 : 0;

  const [heroBubble, setHeroBubble] = useState(null);
  const [catBubble, setCatBubble] = useState(null);
  const [wiggle, setWiggle] = useState(null);

  const heroLines = HERO_LINES[mood] || HERO_LINES.neutral;
  const catLines = CAT_LINES[mood] || CAT_LINES.neutral;

  const tap = (id) => {
    SFX.play("tap");
    setWiggle(id);
    setTimeout(() => setWiggle(null), 500);
  };

  useEffect(() => {
    const showHero = () => {
      const lines = HERO_LINES[mood] || HERO_LINES.neutral;
      setHeroBubble(lines[Math.floor(Math.random() * lines.length)]);
      setTimeout(() => setHeroBubble(null), 3000);
    };
    const showCat = () => {
      const lines = CAT_LINES[mood] || CAT_LINES.neutral;
      setCatBubble(lines[Math.floor(Math.random() * lines.length)]);
      setTimeout(() => setCatBubble(null), 2500);
    };
    setTimeout(showHero, 600);
    setTimeout(showCat, 2000);
    const heroTimer = setInterval(showHero, 8000);
    const catTimer = setInterval(showCat, 10000);
    return () => { clearInterval(heroTimer); clearInterval(catTimer); };
  }, [mood]);

  const wallL = "#F5EDE3";
  const wallR = "#E8DDD0";
  const trim = "#B8956A";
  const wood = "#A0845C";
  const woodD = "#92400E";
  const woodDD = "#78350F";

  const bounce = (id) => wiggle === id
    ? <animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="0.35s" />
    : null;

  return (
    <div className="view-enter" style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #1E293B 0%, #334155 40%, #475569 100%)",
      padding: "env(safe-area-inset-top, 12px) 0 80px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 8px" }}>
        <button className="btn-tap" onClick={() => { SFX.play("tap"); setView("hub"); }} style={{
          background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 50,
          padding: "10px 20px", cursor: "pointer", fontWeight: 800, fontSize: ".85rem",
          backdropFilter: "blur(8px)", minHeight: 48, color: "white",
        }}>{"\u2190 Zur\u00FCck"}</button>
        <div style={{
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1.1rem", fontWeight: 800,
          color: "white", textTransform: "uppercase", fontStyle: "italic",
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}>{state.hero.name}'s Zimmer</div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 50, padding: "6px 12px", fontSize: ".85rem", fontWeight: 800, color: "#FCD34D", backdropFilter: "blur(8px)" }}>Lvl {roomLevel}</div>
      </div>

      {/* Isometric Room */}
      <div style={{ position: "relative", margin: "0 auto", maxWidth: 460, width: "100%", padding: "0 4px" }}>
        <svg viewBox="0 0 400 330" style={{ width: "100%", display: "block" }}>
          <defs>
            <linearGradient id="floorGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D4A06A" />
              <stop offset="100%" stopColor="#C49060" />
            </linearGradient>
            <linearGradient id="windowLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,200,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,200,0)" />
            </linearGradient>
            <linearGradient id="posterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="windowSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
          </defs>

          {/* Walls */}
          <polygon points="50,95 200,20 200,150 50,225" fill={wallL} />
          <polygon points="200,20 350,95 350,225 200,150" fill={wallR} />

          {/* Floor */}
          <polygon points="50,225 200,150 350,225 200,300" fill="url(#floorGrad)" />

          {/* Floor plank lines */}
          {[1,2,3,4,5,6,7].map(i => {
            const t = i / 8;
            return <line key={i} x1={50 + t * 150} y1={225 - t * 75} x2={200 + t * 150} y2={300 - t * 75} stroke="#C49060" strokeWidth="1" opacity="0.25" />;
          })}

          {/* Corner edge */}
          <line x1="200" y1="20" x2="200" y2="150" stroke="#D4C4B0" strokeWidth="1.5" />

          {/* Baseboards */}
          <line x1="50" y1="225" x2="200" y2="150" stroke={trim} strokeWidth="4" />
          <line x1="200" y1="150" x2="350" y2="225" stroke={trim} strokeWidth="4" />

          {/* Ceiling edges */}
          <line x1="50" y1="95" x2="200" y2="20" stroke="#D4C4B0" strokeWidth="1" opacity="0.5" />
          <line x1="200" y1="20" x2="350" y2="95" stroke="#D4C4B0" strokeWidth="1" opacity="0.5" />

          {/* Fairy Lights */}
          {has("rm_fairy") && (() => {
            const left = [[70,85],[100,70],[130,55],[160,40]];
            const right = [[230,35],[260,50],[290,65],[320,80]];
            return <g>
              <polyline points={left.map(p => p.join(",")).join(" ")} fill="none" stroke="#FCD34D" strokeWidth="1" opacity="0.4" />
              {left.map(([x,y],i) => <circle key={`fl${i}`} cx={x} cy={y} r="2.5" fill="#FCD34D" style={{ animation: `fairyGlow 2s ease-in-out infinite ${i * 0.4}s` }} />)}
              <polyline points={right.map(p => p.join(",")).join(" ")} fill="none" stroke="#FCD34D" strokeWidth="1" opacity="0.4" />
              {right.map(([x,y],i) => <circle key={`fr${i}`} cx={x} cy={y} r="2.5" fill="#FCD34D" style={{ animation: `fairyGlow 2s ease-in-out infinite ${i * 0.4 + 0.2}s` }} />)}
            </g>;
          })()}

          {/* Stars on walls */}
          {has("rm_stars") && [[75,108],[140,58],[170,38],[235,42],[315,72],[335,92]].map(([x,y],i) => (
            <text key={`st${i}`} x={x} y={y} fontSize="8" style={{ animation: `starTwinkle ${1.5 + i * 0.3}s ease-in-out infinite ${i * 0.5}s` }}>{"\u2B50"}</text>
          ))}

          {/* Window */}
          <g onClick={() => tap("window")} style={{ cursor: "pointer" }}>
            {bounce("window")}
            <polygon points="100,160 150,135 150,88 100,113" fill="url(#windowSky)" stroke={trim} strokeWidth="3" />
            <line x1="125" y1="147" x2="125" y2="100" stroke={trim} strokeWidth="1.5" />
            <line x1="100" y1="136" x2="150" y2="111" stroke={trim} strokeWidth="1.5" />
          </g>
          <polygon points="100,225 155,198 210,225 155,252" fill="url(#windowLight)" />

          {/* Map on left wall */}
          {has("rm_map") && <g onClick={() => tap("map")} style={{ cursor: "pointer" }}>
            {bounce("map")}
            <polygon points="65,140 90,127 90,102 65,115" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
            <line x1="77" y1="133" x2="77" y2="108" stroke="#93C5FD" strokeWidth="0.5" opacity="0.5" />
            <line x1="65" y1="127" x2="90" y2="114" stroke="#93C5FD" strokeWidth="0.5" opacity="0.5" />
            <circle cx="80" cy="117" r="2" fill="#EF4444" opacity="0.7" />
          </g>}

          {/* Poster on right wall */}
          {has("rm_poster") && <g onClick={() => tap("poster")} style={{ cursor: "pointer" }}>
            {bounce("poster")}
            <polygon points="315,100 338,112 338,140 315,128" fill="url(#posterGrad)" />
            <polygon points="315,100 338,112 338,140 315,128" fill="none" stroke={wood} strokeWidth="2" />
            <text x="326" y="124" fontSize="12" textAnchor="middle" fill="white">{"\u2B50"}</text>
          </g>}

          {/* Badge / Trophy Shelf */}
          <line x1="250" y1="82" x2="310" y2="102" stroke={wood} strokeWidth="3" strokeLinecap="round" />
          <line x1="253" y1="105" x2="313" y2="125" stroke={wood} strokeWidth="3" strokeLinecap="round" />
          <line x1="253" y1="130" x2="313" y2="150" stroke={wood} strokeWidth="3" strokeLinecap="round" />

          {/* Badge display */}
          {badges.map((b, i) => {
            const [bx, by] = BADGE_POS[i];
            return (
              <g key={`badge${i}`} onClick={() => b.u && tap(`badge_${i}`)} style={{ cursor: b.u ? "pointer" : "default" }}>
                {bounce(`badge_${i}`)}
                <circle cx={bx} cy={by} r={8} fill={b.u ? "rgba(255,255,255,0.9)" : wallR} stroke={b.u ? wood : "none"} strokeWidth={b.u ? 1 : 0} opacity={b.u ? 1 : 0.45} />
                <text x={bx} y={by + 4} fontSize={b.u ? "10" : "7"} textAnchor="middle" opacity={b.u ? 1 : 0.45}>
                  {b.u ? b.i : "?"}
                </text>
              </g>
            );
          })}

          {/* Trophy on shelf */}
          {has("rm_trophy") && <g onClick={() => tap("trophy")} style={{ cursor: "pointer" }}>
            {bounce("trophy")}
            <text x="310" y="97" fontSize="14" textAnchor="middle">{"\u{1F3C6}"}</text>
          </g>}

          {/* Globe on shelf */}
          {has("rm_globe") && <g onClick={() => tap("globe")} style={{ cursor: "pointer" }}>
            {bounce("globe")}
            <text x="250" y="78" fontSize="12" textAnchor="middle">{"\u{1F30D}"}</text>
          </g>}

          {/* Figure on shelf */}
          {has("rm_figure") && <g onClick={() => tap("figure")} style={{ cursor: "pointer" }}>
            {bounce("figure")}
            <text x="310" y="120" fontSize="11" textAnchor="middle">{"\u{1F9B8}"}</text>
          </g>}

          {/* Rug on floor */}
          {has("rm_rug") && <ellipse cx="195" cy="258" rx="42" ry="18" fill="#8B5CF6" opacity="0.35" onClick={() => tap("rug")} style={{ cursor: "pointer" }} />}

          {/* Nightstand */}
          <g onClick={() => tap("nightstand")} style={{ cursor: "pointer" }}>
            {bounce("nightstand")}
            <polygon points="225,220 241,212 257,220 241,228" fill={wood} />
            <polygon points="225,220 225,230 241,238 241,228" fill={woodD} />
            <polygon points="241,228 241,238 257,230 257,220" fill={woodDD} />
          </g>

          {/* Fish tank on nightstand */}
          {has("rm_fish") && <g onClick={() => tap("fish")} style={{ cursor: "pointer" }}>
            {bounce("fish")}
            <polygon points="233,212 241,208 249,212 241,216" fill="#60A5FA" opacity="0.5" />
            <polygon points="233,212 233,205 241,201 241,208" fill="#93C5FD" opacity="0.4" />
            <polygon points="241,208 241,201 249,205 249,212" fill="#3B82F6" opacity="0.4" />
            <text x="241" y="210" fontSize="7" textAnchor="middle">{"\u{1F420}"}</text>
          </g>}

          {/* Bed */}
          <g onClick={() => tap("bed")} style={{ cursor: "pointer" }}>
            {bounce("bed")}
            <polygon points="260,210 300,190 350,210 310,230" fill="#E0E7FF" />
            <polygon points="260,210 260,222 310,242 310,230" fill="#C7D2FE" />
            <polygon points="310,230 310,242 350,222 350,210" fill="#A5B4FC" />
            <polygon points="300,190 300,178 350,198 350,210" fill="#7C3AED" opacity="0.3" />
            <ellipse cx="320" cy="198" rx="12" ry="5" fill="white" opacity="0.9" transform="rotate(26, 320, 198)" />
          </g>

          {/* Desk */}
          <g onClick={() => tap("desk")} style={{ cursor: "pointer" }}>
            {bounce("desk")}
            <polygon points="65,218 105,200 145,218 105,236" fill={woodD} />
            <polygon points="65,218 65,232 105,250 105,236" fill={woodDD} />
            <polygon points="105,236 105,250 145,232 145,218" fill="#6B3410" />
            <polygon points="78,212 84,209 90,212 84,215" fill="#475569" />
            <polygon points="78,212 78,206 84,203 84,209" fill="#334155" />
            <line x1="81" y1="206" x2="80" y2="199" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="84" y1="204" x2="85" y2="197" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
            <polygon points="118,206 128,201 136,206 126,211" fill="#DBEAFE" />
            <line x1="121" y1="208" x2="130" y2="203" stroke="#93C5FD" strokeWidth="0.5" opacity="0.6" />
            <line x1="122" y1="209" x2="131" y2="204" stroke="#93C5FD" strokeWidth="0.5" opacity="0.6" />
          </g>

          {/* Computer on desk */}
          {has("rm_computer") && <g onClick={() => tap("computer")} style={{ cursor: "pointer" }}>
            {bounce("computer")}
            <polygon points="96,212 108,206 120,212 108,218" fill="#1E293B" />
            <polygon points="96,212 96,202 108,196 108,206" fill="#334155" />
            <polygon points="98,211 98,203 106,198 106,206" fill="#60A5FA" opacity="0.6" />
          </g>}

          {/* Lamp on desk */}
          {has("rm_lamp") && <g onClick={() => tap("lamp")} style={{ cursor: "pointer" }}>
            {bounce("lamp")}
            <text x="140" y="210" fontSize="14" textAnchor="middle">{"\u{1FA94}"}</text>
          </g>}

          {/* Chair */}
          <g onClick={() => tap("chair")} style={{ cursor: "pointer" }}>
            {bounce("chair")}
            <polygon points="80,233 100,223 100,234 80,244" fill={wood} />
            <polygon points="80,244 100,234 120,244 100,254" fill={woodD} />
            <polygon points="80,244 80,250 100,260 100,254" fill={woodDD} />
            <polygon points="100,254 100,260 120,250 120,244" fill="#6B3410" />
          </g>

          {/* Skateboard */}
          {has("rm_skateboard") && <g onClick={() => tap("skateboard")} style={{ cursor: "pointer" }}>
            {bounce("skateboard")}
            <text x="57" y="220" fontSize="16">{"\u{1F6F9}"}</text>
          </g>}

          {/* Plant near bed */}
          {has("rm_plant") && <g onClick={() => tap("plant")} style={{ cursor: "pointer" }}>
            {bounce("plant")}
            <text x="340" y="218" fontSize="22">{"\u{1FAB4}"}</text>
          </g>}
        </svg>

        {/* Hero + Cat overlay with speech bubbles */}
        <div style={{
          position: "absolute", bottom: "16%", left: "44%",
          transform: "translateX(-50%)",
          display: "flex", alignItems: "flex-end", gap: 8, zIndex: 2,
        }}>
          {/* Hero with bubble */}
          <div style={{ position: "relative" }}>
            {heroBubble && (
              <div style={{
                position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                background: "white", borderRadius: 14, padding: "6px 12px", marginBottom: 8,
                fontSize: ".85rem", fontWeight: 700, color: T.textPrimary, whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "fadeIn 0.3s ease",
                fontFamily: "'Nunito',sans-serif",
              }}>
                {heroBubble}
                <div style={{
                  position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
                  borderTop: "6px solid white",
                }} />
              </div>
            )}
            <div style={{ animation: "heroFloat 3s ease-in-out infinite", cursor: "pointer" }}
              onClick={() => {
                setHeroBubble(heroLines[Math.floor(Math.random() * heroLines.length)]);
                setTimeout(() => setHeroBubble(null), 3000);
              }}>
              <HeroSprite shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} size={90} level={level} />
            </div>
          </div>

          {/* Cat with bubble */}
          <div style={{ position: "relative" }}>
            {catBubble && (
              <div style={{
                position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                background: "white", borderRadius: 14, padding: "5px 10px", marginBottom: 6,
                fontSize: ".85rem", fontWeight: 700, color: T.textPrimary, whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "fadeIn 0.3s ease",
                fontFamily: "'Nunito',sans-serif",
              }}>
                {catBubble}
                <div style={{
                  position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
                  borderTop: "5px solid white",
                }} />
              </div>
            )}
            <div style={{ animation: "catIdle 4s ease-in-out infinite", cursor: "pointer" }}
              onClick={() => {
                setCatBubble(catLines[Math.floor(Math.random() * catLines.length)]);
                setTimeout(() => setCatBubble(null), 2500);
              }}>
              <Companion type={state.companionType} variant={state.catVariant} mood={mood} size={48} />
            </div>
          </div>
        </div>
      </div>

      {/* Room info */}
      <div style={{ padding: "12px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 6 }}>
          {[1,2,3,4,5].map(l => (
            <div key={l} style={{
              width: 32, height: 6, borderRadius: 3,
              background: l <= roomLevel ? "linear-gradient(90deg, #FCD34D, #F59E0B)" : "rgba(255,255,255,0.15)",
              transition: "background .3s ease",
            }} />
          ))}
        </div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800,
          color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: ".05em",
        }}>Zimmer Level {roomLevel}</div>
        <div style={{ fontSize: ".85rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
          {roomItems} / {SHOP_ITEMS.room.length} Items {"\u00B7"} {badgeCount} / 9 Badges
        </div>
        <button className="btn-tap" onClick={() => { SFX.play("tap"); setView("shop"); setShopTab("room"); }} style={{
          marginTop: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 50, padding: "12px 28px", fontWeight: 800, fontSize: ".85rem",
          cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
          color: "white", backdropFilter: "blur(8px)", minHeight: 48,
        }}>{"\u{1F6CD}\uFE0F"} Zimmer dekorieren</button>
      </div>
    </div>
  );
}
