import React, { useState, useEffect, useRef } from 'react';
import { T, HERO_COLORS, HERO_HAIRS, SKIN_TONES, HAIR_COLORS, COMPANION_TYPES, OB_CHEST_REWARD } from '../constants';
import HeroSprite from './HeroSprite';
import Egg from './Egg';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [hero, setHero] = useState({
    shape: "circle", color: HERO_COLORS[0], eyes: "round", hair: "short",
    name: "", skinTone: SKIN_TONES[1], hairColor: HAIR_COLORS[0],
  });
  const [selectedEgg, setSelectedEgg] = useState(null);
  const [companionName, setCompanionName] = useState("");
  const nameRef = useRef(null);
  const companionNameRef = useRef(null);

  useEffect(() => { if (step === 2) setTimeout(() => nameRef.current?.focus(), 100); }, [step]);
  useEffect(() => { if (step === 4) setTimeout(() => companionNameRef.current?.focus(), 100); }, [step]);

  const totalSteps = 6;
  const hairLabels = { short: "Kurz", spiky: "Stachelig", curly: "Lockig", long: "Lang", cap: "Kappe", none: "Keine" };
  const hairIcons = { short: "content_cut", spiky: "bolt", curly: "laps", long: "face_5", cap: "school", none: "block" };

  // ── Progress dots ──
  const Dots = () => (
    <div className="flex gap-1.5 justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
          i <= step ? 'bg-secondary-container' : 'bg-surface-container'
        }`} style={{ width: i === step ? 28 : 10 }} />
      ))}
    </div>
  );

  // ── Shared pill button ──
  const PillButton = ({ onClick, disabled, children, big }) => (
    <button onClick={onClick} disabled={disabled}
      className={`btn-tap w-full max-w-sm mx-auto block bg-primary-container text-white font-label font-bold rounded-full shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-xl active:scale-95'
      } ${big ? 'text-lg py-5' : 'text-base py-4'}`}>
      {children}
    </button>
  );

  // ═══ Step 0: Welcome ═══
  if (step === 0) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-8 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bodhi-pattern rotate-12 pointer-events-none opacity-40" />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-sm w-full">
        {/* Egg logo */}
        <div className="w-20 h-24 bg-primary-container rounded-[40%_40%_50%_50%] flex items-center justify-center shadow-lg shadow-primary/15">
          <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>egg</span>
        </div>

        {/* Wordmark */}
        <img src={import.meta.env.BASE_URL + "ronki-wordmark.png"} alt="Ronki"
          className="w-52 h-auto object-contain"
          style={{ animation: "heroFloat 3s ease-in-out infinite" }} />

        {/* Copy */}
        <div className="text-center space-y-2 mt-4">
          <h2 className="text-3xl font-bold font-headline text-on-surface">Willkommen bei Ronki!</h2>
          <p className="font-body text-base text-on-surface-variant leading-relaxed">
            Erstelle deinen Helden und finde dein Begleiter-Ei!
          </p>
        </div>
      </div>

      {/* CTA pinned to bottom */}
      <div className="w-full max-w-sm pt-6">
        <PillButton onClick={() => setStep(1)} big>
          Los geht's!
          <span className="material-symbols-outlined">arrow_forward</span>
        </PillButton>
      </div>
    </div>
  );

  // ═══ Step 1: Avatar Builder ═══
  if (step === 1) return (
    <div className="min-h-screen bg-surface px-6 pt-6 pb-28">
      <Dots />
      <h2 className="font-headline text-2xl font-bold text-center text-on-surface mb-4">Wähle deinen Look!</h2>

      {/* Avatar preview — compact */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="relative w-36 h-36 mm-card flex items-center justify-center p-3" style={{ borderRadius: '1.5rem' }}>
            <div style={{ animation: "heroFloat 3s ease-in-out infinite" }}>
              <HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair}
                size={110} level={1} skinTone={hero.skinTone} hairColor={hero.hairColor} />
            </div>
            <div className="absolute -top-2 -right-2 bg-secondary-container p-2 rounded-full shadow-md border-3 border-white">
              <span className="material-symbols-outlined text-on-surface text-sm">auto_fix_high</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto space-y-5">
        {/* Skin tone */}
        <section>
          <h3 className="font-headline text-sm mb-2 flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-primary text-lg">face</span> Hautton
          </h3>
          <div className="flex gap-3 justify-center">
            {SKIN_TONES.map(tone => (
              <button key={tone} onClick={() => setHero(h => ({ ...h, skinTone: tone }))}
                className={`btn-tap w-11 h-11 rounded-full border-3 border-white shadow-sm transition-all ${hero.skinTone === tone ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                style={{ background: tone }} />
            ))}
          </div>
        </section>

        {/* Hair style */}
        <section>
          <h3 className="font-headline text-sm mb-2 flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-primary text-lg">content_cut</span> Frisur
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {HERO_HAIRS.map(h2 => (
              <button key={h2} onClick={() => setHero(h => ({ ...h, hair: h2 }))}
                className={`btn-tap py-2.5 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  hero.hair === h2 ? 'bg-primary text-white shadow-md' : 'mm-card hover:bg-primary/5'
                }`}>
                <span className="material-symbols-outlined text-xl">{hairIcons[h2]}</span>
                <span className="font-label text-[9px] uppercase tracking-wider font-extrabold">{hairLabels[h2]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Hair color */}
        <section>
          <h3 className="font-headline text-sm mb-2 flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-primary text-lg">palette</span> Haarfarbe
          </h3>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {HAIR_COLORS.map(c => (
              <button key={c} onClick={() => setHero(h => ({ ...h, hairColor: c }))}
                className={`btn-tap w-10 h-10 rounded-full border-3 border-white shadow-sm transition-all ${hero.hairColor === c ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                style={{ background: c }} />
            ))}
          </div>
        </section>

        {/* Outfit color */}
        <section>
          <h3 className="font-headline text-sm mb-2 flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-primary text-lg">apparel</span> Outfit
          </h3>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {HERO_COLORS.map(c => (
              <button key={c} onClick={() => setHero(h => ({ ...h, color: c }))}
                className={`btn-tap w-10 h-10 rounded-full border-3 border-white shadow-sm transition-all ${hero.color === c ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                style={{ background: c }} />
            ))}
          </div>
        </section>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 w-full px-6 pb-8 pt-4 bg-gradient-to-t from-surface via-surface to-transparent z-40">
        <PillButton onClick={() => setStep(2)}>Weiter →</PillButton>
      </div>
    </div>
  );

  // ═══ Step 2: Hero Name ═══
  if (step === 2) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-8 py-12">
      <Dots />
      <h2 className="font-headline text-2xl font-bold text-center text-on-surface mb-6">Wie heißt dein Held?</h2>

      <div className="mb-8" style={{ animation: "heroFloat 3s ease-in-out infinite" }}>
        <HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair}
          size={120} level={1} skinTone={hero.skinTone} hairColor={hero.hairColor} />
      </div>

      <div className="w-full max-w-sm mm-card p-5">
        <input ref={nameRef} value={hero.name}
          onChange={e => setHero(h => ({ ...h, name: e.target.value }))}
          placeholder="Gib hier einen Namen ein..."
          className="w-full bg-surface rounded-2xl py-4 px-5 font-headline text-lg text-center placeholder:opacity-30 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="w-full max-w-sm mt-8">
        <PillButton onClick={() => setStep(3)} disabled={!hero.name.trim()}>Weiter →</PillButton>
      </div>
    </div>
  );

  // ═══ Step 3: Egg Selection ═══
  if (step === 3) {
    const eggs = [
      { type: "dragon", label: "Feuer-Ei 🔥" },
      { type: "wolf", label: "Mond-Ei 🌙" },
      { type: "phoenix", label: "Sonnen-Ei ☀️" },
    ];

    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-12">
        <Dots />
        <h2 className="font-headline text-2xl font-bold text-center text-on-surface mb-2">Wähle dein Begleiter-Ei!</h2>
        <p className="font-body text-base text-on-surface-variant mb-8 text-center">Dein Begleiter wartet darauf zu schlüpfen!</p>

        <div className="flex gap-4 justify-center items-start mb-6 w-full max-w-sm">
          {eggs.map(egg => (
            <button key={egg.type} onClick={() => setSelectedEgg(egg.type)}
              className={`btn-tap flex-1 mm-card p-4 transition-all text-center ${
                selectedEgg === egg.type ? 'ring-2 ring-secondary-container ring-offset-2 shadow-lg' : ''
              }`}>
              <Egg type={egg.type} size={80} progress={0} />
              <p className="font-label text-xs font-extrabold mt-2 text-on-surface">{egg.label}</p>
            </button>
          ))}
        </div>

        {selectedEgg && COMPANION_TYPES[selectedEgg] && (
          <div className="mm-card px-5 py-4 mb-6 text-center max-w-xs">
            <p className="font-label font-bold text-sm text-primary">
              {COMPANION_TYPES[selectedEgg].emoji} {COMPANION_TYPES[selectedEgg].name}
            </p>
            <p className="font-body text-xs text-on-surface-variant mt-1">{COMPANION_TYPES[selectedEgg].desc}</p>
          </div>
        )}

        <div className="w-full max-w-sm mt-2">
          <PillButton onClick={() => setStep(4)} disabled={!selectedEgg}>Weiter →</PillButton>
        </div>
      </div>
    );
  }

  // ═══ Step 4: Companion Name ═══
  if (step === 4) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-8 py-12">
      <Dots />
      <h2 className="font-headline text-2xl font-bold text-center text-on-surface mb-6">Name für deinen Begleiter?</h2>

      <div className="mb-8" style={{ filter: "drop-shadow(0 0 16px rgba(252,211,77,0.4))" }}>
        <Egg type={selectedEgg || "dragon"} size={100} progress={0} />
      </div>

      <div className="w-full max-w-sm mm-card p-5">
        <input ref={companionNameRef} value={companionName}
          onChange={e => setCompanionName(e.target.value)}
          placeholder="Name eingeben..."
          className="w-full bg-surface rounded-2xl py-4 px-5 font-headline text-lg text-center placeholder:opacity-30 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="w-full max-w-sm mt-8">
        <PillButton onClick={() => setStep(5)} disabled={!companionName.trim()}>Weiter →</PillButton>
      </div>
    </div>
  );

  // ═══ Step 5: Confirmation ═══
  if (step === 5) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-8 py-12">
      <Dots />
      <h2 className="font-headline text-2xl font-bold text-center text-on-surface mb-8">Bereit für dein Abenteuer!</h2>

      <div className="flex items-center justify-center gap-6 mb-8">
        <div style={{ animation: "heroFloat 3s ease-in-out infinite" }}>
          <HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair}
            size={110} level={1} skinTone={hero.skinTone} hairColor={hero.hairColor} />
        </div>
        <div style={{ filter: "drop-shadow(0 0 12px rgba(252,211,77,0.4))" }}>
          <Egg type={selectedEgg || "dragon"} size={70} progress={0} />
        </div>
      </div>

      <div className="mm-card px-6 py-5 mb-8 text-center max-w-xs">
        <div className="text-3xl mb-2">{OB_CHEST_REWARD.icon}</div>
        <p className="font-label font-bold text-sm text-primary">{OB_CHEST_REWARD.text}</p>
        <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
          Sammle Heldenpunkte durch deine täglichen Aufgaben!
        </p>
      </div>

      <div className="w-full max-w-sm">
        <button
          onClick={() => {
            onComplete({
              hero: { ...hero, skinTone: hero.skinTone, hairColor: hero.hairColor },
              catVariant: "tiger", catName: companionName,
              startXP: 1, startCoins: 1,
              companionType: selectedEgg, eggType: selectedEgg,
            });
          }}
          className="btn-tap w-full bg-primary text-white font-headline text-xl font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
        >
          Abenteuer starten!
          <span className="material-symbols-outlined text-2xl">auto_fix_normal</span>
        </button>
        <p className="text-center mt-4 text-on-surface/40 font-label font-bold text-xs">
          Dein Abenteuer wartet auf dich!
        </p>
      </div>
    </div>
  );

  return null;
}
