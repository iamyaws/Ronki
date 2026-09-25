import React, { useState } from 'react';
import MoodChibi, { RonkiArt } from './MoodChibi';
import CampfireScene from './CampfireScene';
import FireBreathPuff from './FireBreathPuff';
import ChibiFriend, { CHIBI_FRIEND_IDS } from './drachennest/ChibiFriend';
import { SEED_BY_ID } from '../data/creatures';
import { FREUNDE } from '../data/freunde';

/**
 * RonkiCompendium — public-facing "Sammelbuch" showcase.
 *
 * Accessible via /?compendium=1. Does NOT require auth (AuthGate exempts
 * this route). Designed to be shown to a kid as a "look at everything
 * Ronki can be" book, and to be linked from ronki.de for parents who
 * want to see what's in the app before onboarding.
 *
 * Five sections:
 *   1. Triff die Ronkis — 6 colorways
 *   2. Wachstum — 6 evolution stages
 *   3. Gefühle — 6 mood states
 *   4. Feuer-Kräfte — 5 fire-breath flavors
 *   5. Himmel & Wetter — Lager atmosphere demos
 *
 * All chibis render live from MoodChibi / CampfireScene so any future
 * design changes flow through automatically.
 */

const STAGES = [
  { id: 0, name: 'Ei',            desc: 'Alles beginnt im Ei. Ein leises Leuchten, ein erster Riss — Ronki will raus.' },
  { id: 1, name: 'Baby',          desc: 'Frisch geschlüpft! Kleine Hörner, winzige Flügel, riesige Augen.' },
  { id: 2, name: 'Jungtier',      desc: 'Wächst und übt. Kann schon kleine Flammen pusten.' },
  { id: 3, name: 'Stolz',         desc: 'Der erste große Schwanz, richtige Flügel, mutige Haltung.' },
  { id: 4, name: 'Heranwachsend', desc: 'Fast erwachsen. Hörner mit goldener Spitze, die Flügel spreizen sich weit.' },
  { id: 5, name: 'Legendär',      desc: 'Eine Krone aus drei Hörnern, Sternenlicht im Rücken, ein Kristall auf der Brust.' },
];

const MOODS = [
  { id: 'normal',  name: 'Okay',     when: 'Der Alltag. Ronki atmet ruhig, zufrieden.' },
  { id: 'gut',     name: 'Gut',      when: 'Wenn du alle Aufgaben geschafft hast. Ronki hüpft vor Freude.' },
  { id: 'magisch', name: 'Magisch',  when: 'Bei besonderen Tagen — Geburtstag, Abenteuer-Rückkehr, neue Freunde. Ronki leuchtet.' },
  { id: 'besorgt', name: 'Besorgt',  when: 'Wenn Ronki auf etwas wartet. Kleine Gedanken-Punkte schweben über ihm.' },
  { id: 'tired',   name: 'Müde',     when: 'Am Abend, nach langen Tagen. Ronki döst mit Zs über dem Kopf.' },
  { id: 'sad',     name: 'Traurig',  when: 'Selten, nur an schweren Tagen. Ronki braucht dich dann besonders.' },
];

const FIRE_FLAVORS = [
  { id: 'flame',   name: 'Flamme',        when: 'Bei alltäglichen Aufgaben. Der klassische Drachen-Feueratem.' },
  { id: 'ember',   name: 'Glutfunken',    when: 'Bei Bonus-Aufgaben. Acht kleine Funken sprühen wie Feuerwerk.' },
  { id: 'sparkle', name: 'Sternenstaub',  when: 'Bei MINT-Spielen und täglichen Gewohnheiten. Sterne schweben nach oben.' },
  { id: 'heart',   name: 'Herzensatem',   when: 'Bei Freund-Abenteuern. Ein pinkes Herz steigt auf.' },
  { id: 'rainbow', name: 'Regenbogen',    when: 'Bei Streak-Feiern. Alle Farben auf einmal.' },
];

const WEATHER_BANDS = [
  { id: undefined, name: 'Sonnig',   desc: 'Klares Wetter — warmes Licht, deutliche Schatten.' },
  { id: 'cloud',   name: 'Bewölkt',  desc: 'Wolken ziehen auf, die Szene wird gedämpft.' },
  { id: 'rain',    name: 'Regen',    desc: 'Sechs sanfte Tropfen fallen schräg. Ronki bleibt im Trockenen am Feuer.' },
  { id: 'snow',    name: 'Schnee',   desc: 'Flocken schweben langsam durchs Bild.' },
  { id: 'thunder', name: 'Gewitter', desc: 'Dunkle Wolken + Regen, alle 18 Sekunden ein Blitz.' },
];

export default function RonkiCompendium() {
  const [activeMood, setActiveMood] = useState('normal');
  const [activeVariant] = useState('violet');
  const [activeFlavor, setActiveFlavor] = useState(null);
  const [flavorKey, setFlavorKey] = useState(0);
  const [activeWeather, setActiveWeather] = useState(undefined);

  const handleFlavorDemo = (id) => {
    setActiveFlavor(id);
    setFlavorKey(k => k + 1);
    setTimeout(() => setActiveFlavor(null), 1400);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #fef3c7 0%, #fff8f2 16%, #fff8f2 100%)',
      color: '#1e2b2e',
      paddingBottom: 80,
      fontFamily: 'Nunito, system-ui, sans-serif',
    }}>

      {/* ── Hero ── */}
      <header style={{
        padding: '56px 24px 32px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <p style={{
          margin: 0,
          fontSize: 11, letterSpacing: '0.28em',
          textTransform: 'uppercase', fontWeight: 800,
          color: '#A83E2C',
        }}>
          Das Ronki-Sammelbuch
        </p>
        <h1 style={{
          margin: '12px 0 6px',
          fontFamily: 'Fredoka, sans-serif',
          fontWeight: 600, fontSize: 44,
          color: '#124346',
          letterSpacing: '-0.02em',
          textWrap: 'balance',
        }}>
          Alle Ronkis, alle Formen,<br />alle Gefühle.
        </h1>
        <p style={{
          margin: '12px auto 20px',
          maxWidth: 520,
          fontSize: 15, lineHeight: 1.55,
          color: 'rgba(30,43,46,0.68)',
        }}>
          Ronki wächst mit dir. Je nach Tag, Stimmung und Abenteuer
          sieht er anders aus. Blätter durch und entdecke, was alles
          möglich ist.
        </p>
        {/* A hero chibi in the middle — switches with activeVariant + activeMood */}
        <div style={{
          margin: '18px auto 0',
          width: 220, height: 220,
          display: 'grid', placeItems: 'center',
          background: 'radial-gradient(ellipse at 50% 40%, #fff8e1 0%, rgba(255,248,225,0) 70%)',
        }}>
          <MoodChibi size={200} mood={activeMood} variant={activeVariant} stage={3} bare />
        </div>
      </header>

      {/* ── Section 1: Aus dem Ei ── */}
      {/* Bilderbuch (25 Sep 2026): Ronki is always red-orange now, so the
          old six-colour picker would show six identical dragons. The egg
          a kid picks stays a choice of egg, not of dragon colour. */}
      <Section
        kicker="Vier Eier"
        title="Triff Ronki"
        subtitle="Du suchst dir ein Ei aus. Heraus kommt immer Ronki, rot wie ein kleines Feuer."
      >
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 16,
          maxWidth: 900,
          margin: '0 auto',
        }}>
          {['egg-cream', 'egg-ember', 'egg-sun', 'egg-cobalt', 'egg-peek'].map(pose => (
            <RonkiArt key={pose} pose={pose} size={pose === 'egg-peek' ? 140 : 110} />
          ))}
        </div>
      </Section>

      {/* ── Section 2: Wachstum ── */}
      <Section
        kicker="Sechs Stufen"
        title="Wachstum"
        subtitle="Vom Ei zur Legende. Ronki entwickelt sich, je mehr Abenteuer ihr zusammen erlebt."
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          {STAGES.map(s => (
            <div key={s.id} style={{
              background: '#fff8f2',
              borderRadius: 22,
              padding: '18px 16px 20px',
              border: '1px solid rgba(18,67,70,0.1)',
              boxShadow: '0 6px 18px -8px rgba(18,67,70,0.15)',
              textAlign: 'center',
              position: 'relative',
            }}>
              {/* Ribbon: stage number */}
              <div style={{
                position: 'absolute', top: 10, left: 10,
                background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                color: '#725b00',
                fontSize: 10, fontWeight: 800,
                letterSpacing: '0.18em',
                padding: '3px 9px',
                borderRadius: 999,
                textTransform: 'uppercase',
              }}>
                Stufe {s.id}
              </div>
              <div style={{
                width: 140, height: 140, margin: '8px auto 0',
                display: 'grid', placeItems: 'center',
              }}>
                <MoodChibi size={130} mood="normal" variant={activeVariant} stage={s.id} bare />
              </div>
              <p style={{
                margin: '10px 0 4px',
                fontFamily: 'Fredoka, sans-serif',
                fontWeight: 600, fontSize: 18,
                color: '#124346',
              }}>
                {s.name}
              </p>
              <p style={{
                margin: 0,
                fontSize: 13, lineHeight: 1.45,
                color: 'rgba(30,43,46,0.7)',
              }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Section 3: Gefühle ── */}
      <Section
        kicker="Sechs Stimmungen"
        title="Ronki's Gefühle"
        subtitle="Ronki fühlt mit dir mit. Jede Stimmung sieht anders aus. Tippe eine an, um Ronki oben zu zeigen."
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          {MOODS.map(m => {
            const isActive = activeMood === m.id;
            return (
              <button key={m.id} onClick={() => setActiveMood(m.id)}
                style={{
                  background: '#fff8f2',
                  borderRadius: 22,
                  padding: '16px 16px 20px',
                  border: isActive ? '2px solid #fcd34d' : '1px solid rgba(18,67,70,0.1)',
                  boxShadow: isActive
                    ? '0 10px 24px -8px rgba(252,211,77,0.55)'
                    : '0 4px 12px -6px rgba(18,67,70,0.12)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: isActive ? 'translateY(-3px)' : 'none',
                }}>
                <div style={{
                  width: 110, height: 110, margin: '0 auto 10px',
                  display: 'grid', placeItems: 'center',
                }}>
                  <MoodChibi size={104} mood={m.id} variant={activeVariant} stage={2} />
                </div>
                <p style={{
                  margin: 0,
                  fontFamily: 'Fredoka, sans-serif',
                  fontWeight: 600, fontSize: 18, textAlign: 'center',
                  color: '#124346',
                }}>
                  {m.name}
                </p>
                <p style={{
                  margin: '6px 0 0',
                  fontSize: 12, lineHeight: 1.5,
                  color: 'rgba(30,43,46,0.7)',
                  textAlign: 'center',
                }}>
                  {m.when}
                </p>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Section 4: Feuer-Kräfte ── */}
      <Section
        kicker="Fünf Flammen"
        title="Feuer-Kräfte"
        subtitle="Wenn du eine Aufgabe schaffst, pustet Ronki Feuer. Je nach Art der Aufgabe sieht es anders aus. Tippe eine an, um es zu sehen."
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          {FIRE_FLAVORS.map(f => (
            <button key={f.id} onClick={() => handleFlavorDemo(f.id)}
              style={{
                background: '#fff8f2',
                borderRadius: 22,
                padding: '16px 16px 20px',
                border: '1px solid rgba(18,67,70,0.1)',
                boxShadow: '0 4px 12px -6px rgba(18,67,70,0.12)',
                textAlign: 'left',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}>
              {/* Live preview area */}
              <div style={{
                position: 'relative',
                width: 120, height: 110,
                margin: '0 auto 10px',
                background: 'radial-gradient(ellipse at 50% 55%, #2a2420 0%, #140c06 100%)',
                borderRadius: 14,
                overflow: 'hidden',
              }}>
                <FireBreathPuff
                  flavor={f.id}
                  fireKey={activeFlavor === f.id ? flavorKey : 0}
                />
                <span style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: 26, color: '#fde68a',
                  opacity: 0.22,
                  pointerEvents: 'none',
                }}>
                  🔥
                </span>
              </div>
              <p style={{
                margin: 0,
                fontFamily: 'Fredoka, sans-serif',
                fontWeight: 600, fontSize: 17, textAlign: 'center',
                color: '#124346',
              }}>
                {f.name}
              </p>
              <p style={{
                margin: '6px 0 0',
                fontSize: 12, lineHeight: 1.5,
                color: 'rgba(30,43,46,0.7)',
                textAlign: 'center',
              }}>
                {f.when}
              </p>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Section 5: Himmel & Wetter ── */}
      <Section
        kicker="Himmel & Wetter"
        title="Der Himmel spielt mit"
        subtitle="Die Szene am Lagerfeuer ändert sich mit der Tageszeit und mit echtem Wetter. Tippe einen an, um die Szene umzustellen."
      >
        <div style={{
          maxWidth: 720, margin: '0 auto',
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 18px 40px -16px rgba(18,67,70,0.28)',
          border: '1px solid rgba(18,67,70,0.08)',
        }}>
          <CampfireScene
            variant={activeVariant}
            stage={3}
            mood="normal"
            weather={activeWeather}
            greetingText={null}
            height={280}
          />
        </div>
        <div style={{
          display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
          marginTop: 20, maxWidth: 720, margin: '20px auto 0',
          padding: '0 16px',
        }}>
          {WEATHER_BANDS.map(w => {
            const isActive = activeWeather === w.id;
            return (
              <button key={w.name} onClick={() => setActiveWeather(w.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 999,
                  border: isActive ? '1.5px solid #124346' : '1px solid rgba(18,67,70,0.15)',
                  background: isActive ? '#124346' : '#fff8f2',
                  color: isActive ? '#fff' : '#124346',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 6px 14px -4px rgba(18,67,70,0.35)' : 'none',
                }}>
                {w.name}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Section 6: Ronkis Freunde ──
           Marc 25 Apr 2026: "update the compendium with the friends to
           show our universe in one glimpse." Twelve chibi-style
           friends across five biomes, all rendered live from the same
           SVG renderer the in-app gallery uses so the compendium stays
           in sync with whatever ships. */}
      <Section
        kicker="Zwanzig Wesen"
        title="Ronkis Freunde"
        subtitle="Auf seinen Streifzügen begegnet Ronki kleinen Wesen aus den fünf Biomen. Tippe eins an, um seinen Namen zu lesen."
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 14,
          maxWidth: 900,
          margin: '0 auto',
        }}>
          {/* Filter to creature IDs only — the arc-initiator friends
              (pilzhueter, windreiterin, etc.) get their own section
              below since they're characters Ronki MEETS, not creatures
              he COLLECTS. */}
          {CHIBI_FRIEND_IDS.filter(id => SEED_BY_ID.has(id)).map(id => {
            const seed = SEED_BY_ID.get(id);
            return (
              <div key={id} style={{
                background: '#fff8f2',
                borderRadius: 18,
                padding: '14px 10px 12px',
                border: '1.5px solid rgba(18,67,70,0.10)',
                boxShadow: '0 4px 12px -6px rgba(18,67,70,0.14)',
                textAlign: 'center',
              }}>
                <div style={{ width: 84, height: 84, margin: '0 auto' }}>
                  <ChibiFriend id={id} size={84} />
                </div>
                <p style={{
                  margin: '10px 0 2px',
                  fontFamily: 'Fredoka, sans-serif',
                  fontWeight: 500, fontSize: 15,
                  color: '#124346',
                }}>
                  {seed?.name?.de || id}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: 9, letterSpacing: '0.22em',
                  textTransform: 'uppercase', fontWeight: 800,
                  color: 'rgba(120,53,15,0.6)',
                }}>
                  {seed?.chapter || ''}
                </p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Section 7: Arc-initiator friends ──
           The seven character friends Ronki meets across the five
           Micropedia chapters. More anthropomorphic than the
           creature roster — keepers, riders, weavers, builders.
           Each hosts a reunion arc that surfaces once the kid has
           discovered enough creatures in their chapter. */}
      <Section
        kicker="Sieben Charaktere"
        title="Charaktere, die Ronki trifft"
        subtitle="Diese sieben Freundinnen und Freunde tauchen auf, wenn Ronki ihr Biom genug erkundet hat, und laden ihn zu einer Geschichte ein."
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          maxWidth: 900,
          margin: '0 auto',
        }}>
          {FREUNDE.map(f => (
            <div key={f.id} style={{
              background: 'linear-gradient(160deg, #fff8f2 0%, #fef3c7 100%)',
              borderRadius: 20,
              padding: '16px 14px 14px',
              border: '1.5px solid rgba(180,83,9,0.18)',
              boxShadow: '0 6px 16px -8px rgba(180,83,9,0.22), inset 0 1px 0 rgba(255,255,255,0.5)',
              textAlign: 'center',
            }}>
              <div style={{ width: 110, height: 110, margin: '0 auto' }}>
                <ChibiFriend id={f.id} size={110} />
              </div>
              <p style={{
                margin: '12px 0 2px',
                fontFamily: 'Fredoka, sans-serif',
                fontWeight: 500, fontSize: 16,
                color: '#124346',
                letterSpacing: '-0.01em',
              }}>
                {f.name.de}
              </p>
              <p style={{
                margin: 0,
                fontSize: 10, letterSpacing: '0.20em',
                textTransform: 'uppercase', fontWeight: 800,
                color: '#A83E2C',
              }}>
                {f.chapter}
              </p>
              <p style={{
                margin: '6px 0 0',
                fontSize: 11, lineHeight: 1.4,
                color: 'rgba(30,43,46,0.7)',
              }}>
                {f.skillName.de}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 24px 0',
        color: 'rgba(30,43,46,0.5)',
        fontSize: 12,
      }}>
        <p>
          Noch mehr Ronkis kommen bald: neue Freunde, neue Spiele, neue Geschichten.
        </p>
        <p style={{ marginTop: 16 }}>
          <a href="/" style={{ color: '#A83E2C', fontWeight: 700, textDecoration: 'none' }}>
            Zurück zur App →
          </a>
        </p>
      </footer>
    </div>
  );
}

// ── Helper: Section wrapper with kicker + title ──
function Section({ kicker, title, subtitle, children }) {
  return (
    <section style={{
      padding: '48px 20px 24px',
      maxWidth: 1080,
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{
          margin: 0,
          fontSize: 10, letterSpacing: '0.28em',
          textTransform: 'uppercase', fontWeight: 800,
          color: '#A83E2C',
        }}>
          {kicker}
        </p>
        <h2 style={{
          margin: '6px 0 4px',
          fontFamily: 'Fredoka, sans-serif',
          fontWeight: 600, fontSize: 30,
          color: '#124346',
          letterSpacing: '-0.02em',
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{
            margin: '4px auto 0',
            maxWidth: 540,
            fontSize: 14, lineHeight: 1.5,
            color: 'rgba(30,43,46,0.65)',
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
