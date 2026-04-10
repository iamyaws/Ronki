import React, { useState, useEffect } from 'react';
import { T } from '../../constants';
import { getCatStage } from '../../utils/helpers';
import HeroSprite from '../HeroSprite';
import Companion from '../Companion';

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
  [262, 114], [280, 120], [298, 126],
  [265, 137], [283, 143], [301, 149],
  [265, 162], [283, 168], [301, 174],
];

// Map each item to a unique animation class
const ITEM_ANIMATIONS = {
  window: "room-zoom",
  map: "room-shake",
  poster: "room-zoom",
  globe: "room-spin",
  trophy: "room-sparkle",
  figure: "room-bounce",
  fish: "room-swim",
  bed: "room-shake",
  desk: "room-pulse",
  computer: "room-hue",
  lamp: "room-pulse",
  skateboard: "room-roll",
  plant: "room-shake",
  nightstand: "room-bounce",
  chair: "room-shake",
  rug: "room-pulse",
};

// Floor color helpers
const FLOOR_COLOR_MAP = {
  wood: { c1: "#D4A06A", c2: "#C49060" },
  carpet: { c1: "#8B5CF6", c2: "#7C3AED" },
  stone: { c1: "#94A3B8", c2: "#64748B" },
};

export default function RoomSVG({
  has, badges, state, level, mood, theme,
  timeOfDay, lampOn, activeItem, companionSpot, companionSpots,
  onTapItem, onTapCompanion,
}) {
  // Speech bubbles (auto-dialogue)
  const [heroBubble, setHeroBubble] = useState(null);
  const [catBubble, setCatBubble] = useState(null);

  const heroLines = HERO_LINES[mood] || HERO_LINES.neutral;
  const catLines = CAT_LINES[mood] || CAT_LINES.neutral;

  useEffect(() => {
    const showHero = () => {
      const lines = HERO_LINES[mood] || HERO_LINES.neutral;
      setHeroBubble(lines[Math.floor(Math.random() * lines.length)]);
      setTimeout(() => setHeroBubble(null), 4500);
    };
    const showCat = () => {
      const lines = CAT_LINES[mood] || CAT_LINES.neutral;
      setCatBubble(lines[Math.floor(Math.random() * lines.length)]);
      setTimeout(() => setCatBubble(null), 4500);
    };
    setTimeout(showHero, 600);
    setTimeout(showCat, 2000);
    const heroTimer = setInterval(showHero, 8000);
    const catTimer = setInterval(showCat, 10000);
    return () => { clearInterval(heroTimer); clearInterval(catTimer); };
  }, [mood]);

  // Theme colors
  const wallL = theme.wallColor || "#F5EDE3";
  const wallR = adjustBrightness(wallL, -12);
  const trim = "#B8956A";
  const wood = "#A0845C";
  const woodD = "#92400E";
  const woodDD = "#78350F";
  const floorColors = FLOOR_COLOR_MAP[theme.floorType] || FLOOR_COLOR_MAP.wood;

  // Item animation helper
  const itemClass = (id) => activeItem === id ? (ITEM_ANIMATIONS[id] || "") : "";

  // Companion position
  const cPos = companionSpots[companionSpot] || companionSpots.floor;

  return (
    <div style={{ position: "relative", margin: "0 auto", maxWidth: 460, width: "100%", padding: "0 4px" }}>
      <svg viewBox="0 0 400 480" style={{ width: "100%", display: "block" }}>
        <defs>
          <linearGradient id="floorGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={floorColors.c1} />
            <stop offset="100%" stopColor={floorColors.c2} />
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
            <stop offset="0%" stopColor={timeOfDay === 'night' ? "#1E1B4B" : timeOfDay === 'evening' ? "#F97316" : "#60A5FA"} />
            <stop offset="100%" stopColor={timeOfDay === 'night' ? "#312E81" : timeOfDay === 'evening' ? "#FB923C" : "#93C5FD"} />
          </linearGradient>
        </defs>

        {/* ── Walls ── */}
        <polygon points="50,130 200,30 200,230 50,330" fill={wallL} />
        <polygon points="200,30 350,130 350,330 200,230" fill={wallR} />

        {/* ── Floor ── */}
        <polygon points="50,330 200,230 350,330 200,430" fill="url(#floorGrad)" />

        {/* Floor plank lines (wood only) */}
        {theme.floorType !== "carpet" && [1,2,3,4,5,6,7].map(i => {
          const t = i / 8;
          return <line key={i} x1={50 + t * 150} y1={330 - t * 100} x2={200 + t * 150} y2={430 - t * 100} stroke={floorColors.c2} strokeWidth="1" opacity="0.25" />;
        })}

        {/* Corner edge */}
        <line x1="200" y1="30" x2="200" y2="230" stroke="#D4C4B0" strokeWidth="1.5" />

        {/* Baseboards */}
        <line x1="50" y1="330" x2="200" y2="230" stroke={trim} strokeWidth="4" />
        <line x1="200" y1="230" x2="350" y2="330" stroke={trim} strokeWidth="4" />

        {/* Ceiling edges */}
        <line x1="50" y1="130" x2="200" y2="30" stroke="#D4C4B0" strokeWidth="1" opacity="0.5" />
        <line x1="200" y1="30" x2="350" y2="130" stroke="#D4C4B0" strokeWidth="1" opacity="0.5" />

        {/* ── Fairy Lights ── */}
        {has("rm_fairy") && (() => {
          const left = [[70,120],[100,105],[130,90],[160,75]];
          const right = [[230,70],[260,85],[290,100],[320,115]];
          return <g>
            <polyline points={left.map(p => p.join(",")).join(" ")} fill="none" stroke="#FCD34D" strokeWidth="1" opacity="0.4" />
            {left.map(([x,y],i) => <circle key={`fl${i}`} cx={x} cy={y} r="2.5" fill="#FCD34D" style={{ animation: `fairyGlow 2s ease-in-out infinite ${i * 0.4}s` }} />)}
            <polyline points={right.map(p => p.join(",")).join(" ")} fill="none" stroke="#FCD34D" strokeWidth="1" opacity="0.4" />
            {right.map(([x,y],i) => <circle key={`fr${i}`} cx={x} cy={y} r="2.5" fill="#FCD34D" style={{ animation: `fairyGlow 2s ease-in-out infinite ${i * 0.4 + 0.2}s` }} />)}
          </g>;
        })()}

        {/* ── Stars on walls ── */}
        {has("rm_stars") && [[75,148],[140,98],[170,68],[235,72],[315,112],[335,132]].map(([x,y],i) => (
          <text key={`st${i}`} x={x} y={y} fontSize="8" style={{ animation: `starTwinkle ${1.5 + i * 0.3}s ease-in-out infinite ${i * 0.5}s` }}>{"\u2B50"}</text>
        ))}

        {/* ── Window ── */}
        <g className={itemClass("window")} onClick={() => onTapItem("window")} style={{ cursor: "pointer" }}>
          <polygon points="100,200 150,175 150,128 100,153" fill="url(#windowSky)" stroke={trim} strokeWidth="3" />
          <line x1="125" y1="187" x2="125" y2="140" stroke={trim} strokeWidth="1.5" />
          <line x1="100" y1="176" x2="150" y2="151" stroke={trim} strokeWidth="1.5" />
          {/* Stars in window at night */}
          {timeOfDay === 'night' && <>
            <circle cx="115" cy="140" r="1.5" fill="#FCD34D" opacity="0.8" />
            <circle cx="135" cy="145" r="1" fill="#FCD34D" opacity="0.6" />
            <circle cx="125" cy="135" r="1.2" fill="#FCD34D" opacity="0.7" />
          </>}
          {/* Moon at night */}
          {timeOfDay === 'night' && <circle cx="140" cy="138" r="4" fill="#FEF3C7" opacity="0.9" />}
          {/* Sun in morning */}
          {timeOfDay === 'morning' && <circle cx="125" cy="140" r="6" fill="#FCD34D" opacity="0.5" />}
        </g>
        {/* Window light on floor */}
        <polygon points="100,330 155,298 210,330 155,362" fill="url(#windowLight)" />

        {/* ── Map on left wall ── */}
        {has("rm_map") && <g className={itemClass("map")} onClick={() => onTapItem("map")} style={{ cursor: "pointer" }}>
          <polygon points="65,180 90,167 90,142 65,155" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
          <line x1="77" y1="173" x2="77" y2="148" stroke="#93C5FD" strokeWidth="0.5" opacity="0.5" />
          <line x1="65" y1="167" x2="90" y2="154" stroke="#93C5FD" strokeWidth="0.5" opacity="0.5" />
          <circle cx="80" cy="157" r="2" fill="#EF4444" opacity="0.7" />
        </g>}

        {/* ── Poster on right wall ── */}
        {has("rm_poster") && <g className={itemClass("poster")} onClick={() => onTapItem("poster")} style={{ cursor: "pointer" }}>
          <polygon points="315,140 338,152 338,180 315,168" fill="url(#posterGrad)" />
          <polygon points="315,140 338,152 338,180 315,168" fill="none" stroke={wood} strokeWidth="2" />
          <text x="326" y="164" fontSize="12" textAnchor="middle" fill="white">{"\u2B50"}</text>
        </g>}

        {/* ── Badge / Trophy Shelf ── */}
        <line x1="250" y1="122" x2="310" y2="142" stroke={wood} strokeWidth="3" strokeLinecap="round" />
        <line x1="253" y1="145" x2="313" y2="165" stroke={wood} strokeWidth="3" strokeLinecap="round" />
        <line x1="253" y1="170" x2="313" y2="190" stroke={wood} strokeWidth="3" strokeLinecap="round" />

        {/* Badge display */}
        {badges.map((b, i) => {
          const [bx, by] = BADGE_POS[i];
          return (
            <g key={`badge${i}`} onClick={() => b.u && onTapItem(`badge_${i}`)} style={{ cursor: b.u ? "pointer" : "default" }}>
              <circle cx={bx} cy={by} r={8} fill={b.u ? "rgba(255,255,255,0.9)" : wallR} stroke={b.u ? wood : "none"} strokeWidth={b.u ? 1 : 0} opacity={b.u ? 1 : 0.45} />
              <text x={bx} y={by + 4} fontSize={b.u ? "10" : "7"} textAnchor="middle" opacity={b.u ? 1 : 0.45}>
                {b.u ? b.i : "?"}
              </text>
            </g>
          );
        })}

        {/* ── Trophy on shelf ── */}
        {has("rm_trophy") && <g className={itemClass("trophy")} onClick={() => onTapItem("trophy")} style={{ cursor: "pointer" }}>
          <text x="310" y="137" fontSize="14" textAnchor="middle">{"\u{1F3C6}"}</text>
        </g>}

        {/* ── Globe on shelf ── */}
        {has("rm_globe") && <g className={itemClass("globe")} onClick={() => onTapItem("globe")} style={{ cursor: "pointer" }}>
          <text x="250" y="118" fontSize="12" textAnchor="middle">{"\u{1F30D}"}</text>
        </g>}

        {/* ── Figure on shelf ── */}
        {has("rm_figure") && <g className={itemClass("figure")} onClick={() => onTapItem("figure")} style={{ cursor: "pointer" }}>
          <text x="310" y="160" fontSize="11" textAnchor="middle">{"\u{1F9B8}"}</text>
        </g>}

        {/* ── Rug on floor ── */}
        {has("rm_rug") && <ellipse className={itemClass("rug")} cx="195" cy="368" rx="42" ry="18" fill="#8B5CF6" opacity="0.35" onClick={() => onTapItem("rug")} style={{ cursor: "pointer" }} />}

        {/* ── Nightstand ── */}
        <g className={itemClass("nightstand")} onClick={() => onTapItem("nightstand")} style={{ cursor: "pointer" }}>
          <polygon points="225,320 241,312 257,320 241,328" fill={wood} />
          <polygon points="225,320 225,330 241,338 241,328" fill={woodD} />
          <polygon points="241,328 241,338 257,330 257,320" fill={woodDD} />
        </g>

        {/* ── Fish tank on nightstand ── */}
        {has("rm_fish") && <g className={itemClass("fish")} onClick={() => onTapItem("fish")} style={{ cursor: "pointer" }}>
          <polygon points="233,312 241,308 249,312 241,316" fill="#60A5FA" opacity="0.5" />
          <polygon points="233,312 233,305 241,301 241,308" fill="#93C5FD" opacity="0.4" />
          <polygon points="241,308 241,301 249,305 249,312" fill="#3B82F6" opacity="0.4" />
          <text x="241" y="310" fontSize="7" textAnchor="middle">{"\u{1F420}"}</text>
        </g>}

        {/* ── Bed ── */}
        <g className={itemClass("bed")} onClick={() => onTapItem("bed")} style={{ cursor: "pointer" }}>
          <polygon points="260,310 300,290 350,310 310,330" fill="#E0E7FF" />
          <polygon points="260,310 260,322 310,342 310,330" fill="#C7D2FE" />
          <polygon points="310,330 310,342 350,322 350,310" fill="#A5B4FC" />
          <polygon points="300,290 300,278 350,298 350,310" fill="#7C3AED" opacity="0.3" />
          <ellipse cx="320" cy="298" rx="12" ry="5" fill="white" opacity="0.9" transform="rotate(26, 320, 298)" />
        </g>

        {/* ── Desk ── */}
        <g className={itemClass("desk")} onClick={() => onTapItem("desk")} style={{ cursor: "pointer" }}>
          <polygon points="65,318 105,300 145,318 105,336" fill={woodD} />
          <polygon points="65,318 65,332 105,350 105,336" fill={woodDD} />
          <polygon points="105,336 105,350 145,332 145,318" fill="#6B3410" />
          {/* Pencil cup */}
          <polygon points="78,312 84,309 90,312 84,315" fill="#475569" />
          <polygon points="78,312 78,306 84,303 84,309" fill="#334155" />
          <line x1="81" y1="306" x2="80" y2="299" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="84" y1="304" x2="85" y2="297" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
          {/* Paper on desk */}
          <polygon points="118,306 128,301 136,306 126,311" fill="#DBEAFE" />
          <line x1="121" y1="308" x2="130" y2="303" stroke="#93C5FD" strokeWidth="0.5" opacity="0.6" />
          <line x1="122" y1="309" x2="131" y2="304" stroke="#93C5FD" strokeWidth="0.5" opacity="0.6" />
        </g>

        {/* ── Computer on desk ── */}
        {has("rm_computer") && <g className={itemClass("computer")} onClick={() => onTapItem("computer")} style={{ cursor: "pointer" }}>
          <polygon points="96,312 108,306 120,312 108,318" fill="#1E293B" />
          <polygon points="96,312 96,302 108,296 108,306" fill="#334155" />
          <polygon points="98,311 98,303 106,298 106,306" fill="#60A5FA" opacity="0.6" />
        </g>}

        {/* ── Lamp on desk ── */}
        {has("rm_lamp") && <g className={itemClass("lamp")} onClick={() => onTapItem("lamp")} style={{ cursor: "pointer" }}>
          <text x="140" y="310" fontSize="14" textAnchor="middle">{"\u{1FA94}"}</text>
        </g>}

        {/* Lamp glow effect */}
        {lampOn && <circle cx="140" cy="320" r="60" fill="#FEF3C7" opacity="0.15" />}

        {/* ── Chair ── */}
        <g className={itemClass("chair")} onClick={() => onTapItem("chair")} style={{ cursor: "pointer" }}>
          <polygon points="80,333 100,323 100,334 80,344" fill={wood} />
          <polygon points="80,344 100,334 120,344 100,354" fill={woodD} />
          <polygon points="80,344 80,350 100,360 100,354" fill={woodDD} />
          <polygon points="100,354 100,360 120,350 120,344" fill="#6B3410" />
        </g>

        {/* ── Skateboard ── */}
        {has("rm_skateboard") && <g className={itemClass("skateboard")} onClick={() => onTapItem("skateboard")} style={{ cursor: "pointer" }}>
          <text x="57" y="320" fontSize="16">{"\u{1F6F9}"}</text>
        </g>}

        {/* ── Plant near bed ── */}
        {has("rm_plant") && <g className={itemClass("plant")} onClick={() => onTapItem("plant")} style={{ cursor: "pointer" }}>
          <text x="340" y="318" fontSize="22">{"\u{1FAB4}"}</text>
        </g>}

        {/* ── Hero (foreignObject) ── */}
        <foreignObject x="145" y="340" width="100" height="120">
          <div xmlns="http://www.w3.org/1999/xhtml" style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Hero speech bubble */}
            {heroBubble && (
              <div style={{
                position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                background: "white", borderRadius: 14, padding: "6px 12px", marginBottom: 8,
                fontSize: "11px", fontWeight: 700, color: T.textPrimary, whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "fadeIn 0.3s ease",
                fontFamily: "'Nunito',sans-serif", zIndex: 10,
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
                setTimeout(() => setHeroBubble(null), 4500);
              }}>
              <HeroSprite shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} size={90} level={level} />
            </div>
          </div>
        </foreignObject>

        {/* ── Companion (foreignObject with walking transition) ── */}
        <g style={{
          transform: `translate(${cPos.x}px, ${cPos.y}px)`,
          transition: "transform 1.2s ease-in-out",
        }}>
          <foreignObject x="-30" y="-40" width="60" height="70">
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ position: "relative", width: "100%", height: "100%" }}>
              {/* Companion speech bubble */}
              {catBubble && (
                <div style={{
                  position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                  background: "white", borderRadius: 14, padding: "5px 10px", marginBottom: 6,
                  fontSize: "10px", fontWeight: 700, color: T.textPrimary, whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "fadeIn 0.3s ease",
                  fontFamily: "'Nunito',sans-serif", zIndex: 10,
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
                onClick={onTapCompanion}>
                <Companion
                  type={state.companionType}
                  variant={state.catVariant}
                  mood={mood}
                  size={48}
                  stage={getCatStage(state.catEvo || 0)}
                  gear={state.equippedGear}
                />
              </div>
            </div>
          </foreignObject>
        </g>

        {/* ── Time-of-day overlay ── */}
        {timeOfDay === 'morning' && <rect x="0" y="0" width="400" height="480" fill="#FEF3C7" opacity="0.06" pointerEvents="none" />}
        {timeOfDay === 'evening' && <rect x="0" y="0" width="400" height="480" fill="#F97316" opacity="0.08" pointerEvents="none" />}
        {timeOfDay === 'night' && <rect x="0" y="0" width="400" height="480" fill="#1E1B4B" opacity="0.2" pointerEvents="none" />}
      </svg>
    </div>
  );
}

// Darken/lighten a hex color by a percentage
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + Math.round(255 * percent / 100)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + Math.round(255 * percent / 100)));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + Math.round(255 * percent / 100)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
