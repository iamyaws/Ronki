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

  const advanceStep = (nextStep) => setStep(nextStep);

  useEffect(() => { if (step === 2) setTimeout(() => nameRef.current?.focus(), 100); }, [step]);
  useEffect(() => { if (step === 4) setTimeout(() => companionNameRef.current?.focus(), 100); }, [step]);

  const totalSteps = 6;

  const hairLabels = { short: "Kurz", spiky: "Stachelig", curly: "Lockig", long: "Lang", cap: "Kappe", none: "Keine" };
  const hairIcons = { short: "content_cut", spiky: "bolt", curly: "laps", long: "face_5", cap: "school", none: "block" };

  // ── Progress dots ──
  const Dots = () => (
    <div className="flex gap-1.5 justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
          i <= step ? 'bg-secondary-container' : 'bg-surface-container'
        }`} style={{ width: i === step ? 24 : 8 }} />
      ))}
    </div>
  );

  // ═══ Step 0: Welcome ═══
  if (step === 0) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden">
      {/* Bodhi bg motifs */}
      <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bodhi-pattern rotate-12 pointer-events-none opacity-40" />
      <div className="absolute bottom-[10%] left-[-10%] w-80 h-80 bodhi-pattern -rotate-45 pointer-events-none opacity-20" />

      {/* Logo */}
      <header className="flex flex-col items-center gap-2 relative z-10">
        <div className="relative w-20 h-24 bg-primary-container rounded-[40%_40%_50%_50%] flex items-center justify-center shadow-lg shadow-primary/15">
          <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>egg</span>
        </div>
        <h1 className="text-4xl font-extrabold font-headline text-primary tracking-tight mt-4">Ronki</h1>
      </header>

      {/* Hero illustration */}
      <div className="relative py-8">
        <div className="absolute inset-0 bg-secondary-container opacity-20 rounded-full blur-3xl scale-125" />
        <img src={import.meta.env.BASE_URL + "ronki-wordmark.png"} alt="Ronki"
          className="w-64 h-auto object-contain drop-shadow-xl relative z-10"
          style={{ animation: "heroFloat 3s ease-in-out infinite" }} />
      </div>

      {/* CTA */}
      <footer className="w-full flex flex-col items-center text-center space-y-6 relative z-10">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold font-headline text-on-surface">Willkommen bei Ronki!</h2>
          <p className="font-body text-lg text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            Dein Abenteuer beginnt hier. Erstelle deinen Helden und finde dein Begleiter-Ei!
          </p>
        </div>
        <button onClick={() => setStep(1)}
          className="btn-tap w-full max-w-sm bg-primary-container text-white font-label font-bold text-lg py-5 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-3">
          Los geht's!
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </footer>
    </div>
  );

  // ═══ Step 1: Avatar Builder ═══
  if (step === 1) return (
    <div className="min-h-screen bg-surface px-6 pt-8 pb-40">
      <Dots />
      <h2 className="font-headline text-3xl font-bold text-center text-on-surface mb-6">Wähle deinen Look!</h2>

      {/* Avatar preview */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/5 blur-[40px] rounded-full scale-125" />
          <div className="relative w-48 h-48 bg-white rounded-[2rem] shadow-xl shadow-primary/5 flex items-center justify-center p-4 border-4 border-white">
            <div style={{ animation: "heroFloat 3s ease-in-out infinite" }}>
              <HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair}
                size={140} level={1} skinTone={hero.skinTone} hairColor={hero.hairColor} />
            </div>
            <div className="absolute -top-3 -right-3 bg-secondary-container p-2.5 rounded-full shadow-lg border-4 border-white">
              <span className="material-symbols-outlined text-on-surface text-lg">auto_fix_high</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-8">
        {/* Skin tone */}
        <section>
          <h3 className="font-headline text-base mb-3 flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-primary">face</span> Hautton
          </h3>
          <div className="flex gap-3 justify-center">
            {SKIN_TONES.map(tone => (
              <button key={tone} onClick={() => setHero(h => ({ ...h, skinTone: tone }))}
                className={`btn-tap w-12 h-12 rounded-full border-4 border-white shadow-md transition-all ${hero.skinTone === tone ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                style={{ background: tone, minHeight: 48, minWidth: 48 }} />
            ))}
          </div>
        </section>

        {/* Hair style */}
        <section>
          <h3 className="font-headline text-base mb-3 flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-primary">content_cut</span> Frisur
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {HERO_HAIRS.map(h2 => (
              <button key={h2} onClick={() => setHero(h => ({ ...h, hair: h2 }))}
                className={`btn-tap p-3 rounded-2xl flex flex-col items-center gap-1 shadow-sm transition-all ${
                  hero.hair === h2 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-black/5 hover:bg-primary/5'
                }`}>
                <span className="material-symbols-outlined text-2xl">{hairIcons[h2]}</span>
                <span className="font-label text-[10px] uppercase tracking-wider font-extrabold">{hairLabels[h2]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Hair color */}
        <section>
          <h3 className="font-headline text-base mb-3 flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-primary">palette</span> Haarfarbe
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {HAIR_COLORS.map(c => (
              <button key={c} onClick={() => setHero(h => ({ ...h, hairColor: c }))}
                className={`btn-tap w-11 h-11 rounded-full border-4 border-white shadow-md transition-all ${hero.hairColor === c ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                style={{ background: c }} />
            ))}
          </div>
        </section>

        {/* Outfit color */}
        <section>
          <h3 className="font-headline text-base mb-3 flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-primary">apparel</span> Outfit
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {HERO_COLORS.map(c => (
              <button key={c} onClick={() => setHero(h => ({ ...h, color: c }))}
                className={`btn-tap w-11 h-11 rounded-full border-4 border-white shadow-md transition-all ${hero.color === c ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                style={{ background: c }} />
            ))}
          </div>
        </section>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-8 left-0 w-full px-6 z-40">
        <button onClick={() => advanceStep(2)}
          className="btn-tap w-full max-w-md mx-auto block bg-primary-container text-white font-label font-bold text-base py-4 rounded-full shadow-lg shadow-primary/20">
          Weiter →
        </button>
      </div>
    </div>
  );

  // ═══ Step 2: Hero Name ═══
  if (step === 2) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-12">
      <Dots />
      <h2 className="font-headline text-3xl font-bold text-center text-on-surface mb-8">Wie heißt dein Held?</h2>

      <div className="mb-8" style={{ animation: "heroFloat 3s ease-in-out infinite" }}>
        <HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair}
          size={140} level={1} skinTone={hero.skinTone} hairColor={hero.hairColor} />
      </div>

      <div className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-sm border border-black/5">
        <div className="relative">
          <input ref={nameRef} value={hero.name}
            onChange={e => setHero(h => ({ ...h, name: e.target.value }))}
            placeholder="Gib hier einen Namen ein..."
            className="w-full bg-surface border-none rounded-2xl py-5 px-6 font-headline text-xl text-center placeholder:opacity-30 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-40">
            <span className="material-symbols-outlined text-xl">edit</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button onClick={() => advanceStep(3)} disabled={!hero.name.trim()}
          className={`btn-tap px-12 py-4 rounded-full font-label font-bold text-base transition-all ${
            hero.name.trim() ? 'bg-primary-container text-white shadow-lg shadow-primary/20' : 'bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed'
          }`}>
          Weiter →
        </button>
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
        <h2 className="font-headline text-3xl font-bold text-center text-on-surface mb-2">Wähle dein Begleiter-Ei!</h2>
        <p className="font-body text-base text-on-surface-variant mb-8">Dein Begleiter wartet darauf zu schlüpfen!</p>

        <div className="flex gap-5 justify-center items-center mb-8 flex-wrap">
          {eggs.map(egg => (
            <button key={egg.type} onClick={() => setSelectedEgg(egg.type)}
              className={`btn-tap rounded-2xl p-5 transition-all text-center ${
                selectedEgg === egg.type
                  ? 'bg-secondary-container/20 border-2 border-secondary-container shadow-xl shadow-secondary-container/30 scale-105'
                  : 'bg-white border-2 border-transparent shadow-md hover:shadow-lg'
              }`}
              style={{ minWidth: 110 }}>
              <Egg type={egg.type} size={90} progress={0} />
              <p className="font-label text-xs font-extrabold mt-3 text-on-surface">{egg.label}</p>
            </button>
          ))}
        </div>

        {selectedEgg && COMPANION_TYPES[selectedEgg] && (
          <div className="bg-white rounded-2xl px-6 py-4 mb-6 text-center max-w-xs shadow-md border border-black/5">
            <p className="font-label font-bold text-base text-primary">
              {COMPANION_TYPES[selectedEgg].emoji} {COMPANION_TYPES[selectedEgg].name}
            </p>
            <p className="font-body text-sm text-on-surface-variant mt-2">{COMPANION_TYPES[selectedEgg].desc}</p>
          </div>
        )}

        <button onClick={() => advanceStep(4)} disabled={!selectedEgg}
          className={`btn-tap px-12 py-4 rounded-full font-label font-bold text-base transition-all ${
            selectedEgg ? 'bg-primary-container text-white shadow-lg shadow-primary/20' : 'bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed'
          }`}>
          Weiter →
        </button>
      </div>
    );
  }

  // ═══ Step 4: Companion Name ═══
  if (step === 4) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-12">
      <Dots />
      <h2 className="font-headline text-3xl font-bold text-center text-on-surface mb-8">Name für deinen Begleiter?</h2>

      <div className="mb-8" style={{ filter: "drop-shadow(0 0 16px rgba(252,211,77,0.4))" }}>
        <Egg type={selectedEgg || "dragon"} size={100} progress={0} />
      </div>

      <div className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-sm border border-black/5">
        <input ref={companionNameRef} value={companionName}
          onChange={e => setCompanionName(e.target.value)}
          placeholder="Name eingeben..."
          className="w-full bg-surface border-none rounded-2xl py-5 px-6 font-headline text-xl text-center placeholder:opacity-30 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
        />
      </div>

      <div className="mt-8">
        <button onClick={() => advanceStep(5)} disabled={!companionName.trim()}
          className={`btn-tap px-12 py-4 rounded-full font-label font-bold text-base transition-all ${
            companionName.trim() ? 'bg-primary-container text-white shadow-lg shadow-primary/20' : 'bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed'
          }`}>
          Weiter →
        </button>
      </div>
    </div>
  );

  // ═══ Step 5: Confirmation ═══
  if (step === 5) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-12">
      <Dots />
      <h2 className="font-headline text-3xl font-bold text-center text-on-surface mb-8">Bereit für dein Abenteuer!</h2>

      {/* Hero + egg together */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <div style={{ animation: "heroFloat 3s ease-in-out infinite" }}>
          <HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair}
            size={120} level={1} skinTone={hero.skinTone} hairColor={hero.hairColor} />
        </div>
        <div style={{ filter: "drop-shadow(0 0 12px rgba(252,211,77,0.4))" }}>
          <Egg type={selectedEgg || "dragon"} size={80} progress={0} />
        </div>
      </div>

      {/* Chest reward */}
      <div className="bg-secondary-container/10 rounded-2xl px-6 py-5 mb-8 text-center max-w-xs border border-secondary-container/20">
        <div className="text-3xl mb-2">{OB_CHEST_REWARD.icon}</div>
        <p className="font-label font-bold text-sm text-primary">{OB_CHEST_REWARD.text}</p>
        <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
          Sammle Heldenpunkte durch deine täglichen Aufgaben!
        </p>
      </div>

      <button
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
        className="btn-tap w-full max-w-sm bg-primary text-white font-headline text-xl font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
      >
        Abenteuer starten!
        <span className="material-symbols-outlined text-2xl">auto_fix_normal</span>
      </button>
      <p className="text-center mt-4 text-on-surface/40 font-label font-bold text-sm">
        Dein Abenteuer wartet auf dich!
      </p>
    </div>
  );

  return null;
}
