import React, { useState, useEffect } from 'react';
import { T, SHOP_ITEMS, BADGES as BADGE_DEFS } from '../../constants';
import SFX from '../../utils/sfx';
import { useGame } from '../../context/GameContext';
import { getCatStage } from '../../utils/helpers';
import RoomSVG from './RoomSVG';
import RoomCustomizer from './RoomCustomizer';

const COMPANION_SPOTS = {
  floor: { x: 200, y: 370 },
  bed: { x: 310, y: 310 },
  desk: { x: 110, y: 330 },
  window: { x: 130, y: 270 },
  rug: { x: 200, y: 390 },
};
const SPOT_KEYS = Object.keys(COMPANION_SPOTS);

export default function Room() {
  const { state, computed, actions, ui } = useGame();
  const { level, mood } = computed;
  const { setView, setShopTab } = ui;

  const has = (id) => (state.purchased || []).includes(id);
  const roomItems = (state.purchased || []).filter(id => id.startsWith("rm_")).length;
  const badges = BADGE_DEFS.map((b, i) => ({ ...b, u: getBadgeUnlocks(state, level)[i] }));
  const badgeCount = badges.filter(b => b.u).length;
  const roomScore = roomItems + badgeCount;
  const roomLevel = roomScore >= 18 ? 5 : roomScore >= 13 ? 4 : roomScore >= 8 ? 3 : roomScore >= 4 ? 2 : roomScore >= 1 ? 1 : 0;

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [companionSpot, setCompanionSpot] = useState('floor');

  useEffect(() => {
    const interval = setInterval(() => {
      setCompanionSpot(prev => {
        const others = SPOT_KEYS.filter(k => k !== prev);
        return others[Math.floor(Math.random() * others.length)];
      });
    }, 18000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, []);

  const [activeItem, setActiveItem] = useState(null);
  const [lampOn, setLampOn] = useState(false);

  const tapItem = (id) => {
    SFX.play("tap");
    if (id === "lamp") { setLampOn(prev => !prev); return; }
    if (id === "rug") { setCompanionSpot("rug"); return; }
    setActiveItem(id);
    setTimeout(() => setActiveItem(null), 1200);
  };

  const hour = new Date().getHours();
  const timeOfDay = hour >= 6 && hour < 10 ? 'morning' : hour < 17 ? 'day' : hour < 20 ? 'evening' : 'night';
  const theme = state.roomTheme || { wallColor: "#F5EDE3", floorType: "wood", windowStyle: "standard" };

  return (
    <div className="bodhi-pattern min-h-screen pb-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 px-6 items-start">

        {/* ── Room View (main area) ── */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative bg-surface-container-low rounded-xl overflow-hidden"
               style={{ minHeight: 500 }}>
            {/* Room header overlay */}
            <div className="absolute top-4 left-6 z-10">
              <h2 className="font-headline text-2xl text-primary font-bold">
                {state.catName || state.hero?.name}'s Zimmer
              </h2>
              <p className="font-body text-sm text-on-surface-variant">Dein Zufluchtsort.</p>
            </div>

            {/* Room SVG container */}
            <div className="w-full flex items-center justify-center pt-16">
              <RoomSVG
                has={has} badges={badges} state={state} level={level} mood={mood}
                theme={theme} timeOfDay={timeOfDay} lampOn={lampOn}
                activeItem={activeItem} companionSpot={companionSpot}
                companionSpots={COMPANION_SPOTS} onTapItem={tapItem}
                onTapCompanion={() => {
                  setCompanionSpot(prev => {
                    const idx = SPOT_KEYS.indexOf(prev);
                    return SPOT_KEYS[(idx + 1) % SPOT_KEYS.length];
                  });
                }}
              />
            </div>

            {/* Floating controls */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button onClick={() => setShowCustomizer(true)}
                className="btn-tap w-11 h-11 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">edit_square</span>
              </button>
            </div>
          </div>

          {/* Room level bar */}
          <div className="text-center space-y-2">
            <div className="flex justify-center gap-1.5">
              {[1,2,3,4,5].map(l => (
                <div key={l} className={`w-8 h-1.5 rounded-full ${l <= roomLevel ? 'bg-secondary-container' : 'bg-surface-container'}`} />
              ))}
            </div>
            <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Zimmer Level {roomLevel}
            </p>
            <p className="font-body text-xs text-on-surface-variant/60">
              {roomItems} / {SHOP_ITEMS.room.length} Items · {badgeCount} / 9 Badges
            </p>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Unlocked furniture */}
          <div className="mm-card p-5 shadow-sm">
            <h3 className="font-label font-bold uppercase tracking-widest text-xs text-on-surface-variant mb-4">
              Freigeschaltete Möbel
            </h3>
            <div className="space-y-3">
              {SHOP_ITEMS.room.slice(0, 4).map(item => {
                const unlocked = has(item.id);
                return (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg ${unlocked ? 'bg-surface-container-low' : 'bg-surface-container-low opacity-50'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${unlocked ? 'bg-secondary-container' : 'bg-surface-variant'}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-label font-bold text-sm text-on-surface truncate">{item.name}</h4>
                      <p className="font-body text-xs text-on-surface-variant">{item.unlock}</p>
                    </div>
                    <span className={`material-symbols-outlined text-lg ${unlocked ? 'text-emerald' : 'text-outline'}`}>
                      {unlocked ? 'check_circle' : 'lock'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Companion status card */}
          <div className="bg-primary-container text-white rounded-lg p-5 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-headline text-lg font-bold mb-2">Begleiter Status</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-label uppercase tracking-tight bg-white/20 px-2 py-0.5 rounded">
                  {(state.catHappy ?? 100) >= 75 ? 'Zufrieden' : 'Braucht Liebe'}
                </span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-secondary-container h-full rounded-full" style={{ width: `${Math.round(((state.catHunger ?? 100) + (state.catHappy ?? 100) + (state.catEnergy ?? 100)) / 3)}%` }} />
              </div>
              <p className="text-[11px] mt-2 font-label opacity-80 uppercase tracking-widest">
                Nächste Stufe: {state.catEvo || 0} EP
              </p>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl opacity-10" style={{ fontVariationSettings: "'FILL' 1" }}>
              potted_plant
            </span>
          </div>
        </div>
      </div>

      <RoomCustomizer
        visible={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        roomTheme={theme}
        roomLevel={roomLevel}
        onSetTheme={(t) => actions.setRoomTheme(t)}
      />
    </div>
  );
}

function getBadgeUnlocks(state, level) {
  return [
    state.xp > 0, state.sd >= 3, state.sd >= 7, level >= 5,
    (state.hist || []).length >= 50, level >= 10, state.sd >= 30,
    (state.hist || []).length >= 100, (state.acc || []).length > 0,
  ];
}
