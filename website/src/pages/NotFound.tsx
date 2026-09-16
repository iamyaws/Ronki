import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PageMeta } from '../components/PageMeta';

export default function NotFound() {
  const reduced = useReducedMotion();

  const drift = (dur: number, reverse = false) =>
    reduced
      ? {}
      : {
          animate: { x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] },
          transition: { duration: dur, repeat: Infinity, ease: 'linear' as const },
        };

  return (
    <>
      <PageMeta
        title="Seite nicht gefunden: Ronki"
        description="Diese Seite existiert nicht."
        noindex={true}
      />

      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-teal-dark">
        {/* Sky gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #04225E 0%, #040812 20%, #0544B0 45%, #41A2FB 70%, #0544B0 100%)',
          }}
        />

        {/* Subtle stars / sparkle dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cream/20"
              style={{
                left: `${8 + (i * 7.3) % 84}%`,
                top: `${5 + (i * 11.7) % 35}%`,
              }}
              animate={reduced ? {} : { opacity: [0.1, 0.4, 0.1] }}
              transition={{
                duration: 2 + (i % 3),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        {/* Mustard glow behind dragon area */}
        <div
          className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(253,209,52,0.10) 0%, transparent 60%)' }}
          aria-hidden
        />

        {/* ---- CLOUD LAYERS (filling bottom 2/3) ---- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>

          {/* Layer 1 — tall billowy clouds, far back, very slow */}
          <motion.div className="absolute w-[200%] bottom-[45%]" {...drift(40)}>
            <svg viewBox="0 0 2400 300" className="w-full h-40 sm:h-56 md:h-64" preserveAspectRatio="none">
              <path
                d="M0,200 C100,120 200,180 350,130 C500,80 550,160 700,120 C850,80 950,50 1100,100 C1250,150 1300,80 1450,130 C1600,180 1700,90 1850,140 C2000,190 2100,100 2250,160 C2350,200 2400,150 2400,200 L2400,300 L0,300 Z"
                fill="rgba(255,255,255,0.04)"
              />
            </svg>
          </motion.div>

          {/* Layer 2 — wide rounded bumps */}
          <motion.div className="absolute w-[200%] bottom-[35%]" {...drift(32, true)}>
            <svg viewBox="0 0 2400 280" className="w-full h-36 sm:h-48 md:h-56" preserveAspectRatio="none">
              <path
                d="M0,160 C180,80 280,200 500,140 C720,80 800,180 1000,120 C1200,60 1350,190 1500,140 C1650,90 1800,200 2000,130 C2200,60 2300,160 2400,160 L2400,280 L0,280 Z"
                fill="rgba(255,255,255,0.06)"
              />
            </svg>
          </motion.div>

          {/* Layer 3 — chunky cumulus shapes */}
          <motion.div className="absolute w-[200%] bottom-[25%]" {...drift(26)}>
            <svg viewBox="0 0 2400 260" className="w-full h-32 sm:h-44 md:h-52" preserveAspectRatio="none">
              <path
                d="M0,140 C60,180 180,70 360,120 C540,170 620,60 800,110 C980,160 1060,50 1200,100 C1340,150 1460,70 1600,130 C1740,190 1860,80 2000,140 C2140,200 2260,90 2400,140 L2400,260 L0,260 Z"
                fill="rgba(255,255,255,0.08)"
              />
            </svg>
          </motion.div>

          {/* Layer 4 — softer rolling hills */}
          <motion.div className="absolute w-[200%] bottom-[14%]" {...drift(22, true)}>
            <svg viewBox="0 0 2400 220" className="w-full h-28 sm:h-40 md:h-48" preserveAspectRatio="none">
              <path
                d="M0,100 C200,50 400,160 650,90 C900,20 1050,150 1200,100 C1350,50 1550,140 1800,80 C2050,20 2200,120 2400,100 L2400,220 L0,220 Z"
                fill="rgba(255,255,255,0.10)"
              />
            </svg>
          </motion.div>

          {/* Layer 5 — thick front clouds */}
          <motion.div className="absolute w-[200%] bottom-[4%]" {...drift(18)}>
            <svg viewBox="0 0 2400 200" className="w-full h-24 sm:h-36 md:h-44" preserveAspectRatio="none">
              <path
                d="M0,80 C150,130 350,30 550,90 C750,150 900,50 1100,100 C1300,150 1450,40 1650,80 C1850,120 2050,50 2200,100 C2350,150 2400,80 2400,80 L2400,200 L0,200 Z"
                fill="rgba(255,255,255,0.14)"
              />
            </svg>
          </motion.div>

          {/* Layer 6 — densest bottom fog */}
          <motion.div className="absolute w-[200%] -bottom-[2%]" {...drift(14, true)}>
            <svg viewBox="0 0 2400 160" className="w-full h-20 sm:h-28 md:h-36" preserveAspectRatio="none">
              <path
                d="M0,40 C200,90 450,20 700,60 C950,100 1100,30 1350,50 C1600,70 1750,100 2000,40 C2200,0 2350,70 2400,40 L2400,160 L0,160 Z"
                fill="rgba(255,255,255,0.18)"
              />
            </svg>
          </motion.div>
        </div>

        {/* ---- CONTENT ---- */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 -mt-12 sm:-mt-16">
          {/* Dragon floating above clouds */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mb-8"
          >
            <motion.div
              animate={reduced ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-8 rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(253,209,52,0.20) 0%, transparent 55%)' }}
                />
                <img
                  src="/art/companion/dragon-404.webp"
                  alt="Ronki, der kleine Drache, schaut neugierig um eine Steinmauer."
                  width={280}
                  height={280}
                  className="relative w-40 sm:w-52 md:w-60 rounded-2xl shadow-2xl"
                  style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Pun headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-cream tracking-tight leading-tight"
          >
            Verflogen. Aber nicht verloren.
          </motion.h1>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-display font-bold text-ink hover:bg-mustard transition-colors shadow-lg"
            >
              <span aria-hidden>←</span>
              Zurück zur Startseite
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
