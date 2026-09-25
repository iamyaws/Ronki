import { useEffect, useState, FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { OrganizationSchema, SoftwareApplicationSchema } from '../components/JsonLd';
import { PainterlyShell } from '../components/PainterlyShell';
import { EASE_OUT, fadeUp } from '../lib/motion';
import { isValidEmail, submitWaitlistEmail } from '../lib/waitlist';

/* ------------------------------------------------------------------ */
/* Simple EN waitlist — separate from WaitlistCTA (which is German)    */
/* ------------------------------------------------------------------ */

type FormStatus = 'idle' | 'submitting' | 'success' | 'duplicate' | 'invalid' | 'error';

function EnglishWaitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus('invalid');
      return;
    }
    setStatus('submitting');
    const result = await submitWaitlistEmail(email, 'en');
    if (result.ok) {
      setStatus('success');
      setEmail('');
    } else if (result.reason === 'duplicate') {
      setStatus('duplicate');
    } else if (result.reason === 'invalid') {
      setStatus('invalid');
    } else {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="py-4">
        <p className="text-lg font-display font-semibold">You're in. We'll reach out when it's your turn.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md" noValidate>
      <div className="relative flex items-center rounded-full border-2 border-cream/25 bg-cream focus-within:border-cream/70 focus-within:shadow-md transition-all">
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email"
          required
          className="flex-1 bg-transparent pl-6 pr-2 py-3.5 text-base text-ink placeholder:text-ink/35 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="group m-1 inline-flex items-center gap-2 rounded-full bg-teal-dark px-5 py-2.5 text-cream font-display font-semibold text-sm disabled:opacity-50 shadow-sm hover:shadow-md transition-shadow"
        >
          {status === 'submitting' ? '…' : 'Count me in'}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>
      <p className="text-xs opacity-60 pl-6">
        One email, on launch day. After that, you won't hear from us.
      </p>
      <p className="text-[0.65rem] text-center opacity-40">
        By submitting you agree to our{' '}
        <Link to="/datenschutz" className="underline hover:opacity-70">Privacy Policy</Link>
        {' '}(German).
      </p>
      {status === 'invalid' && (
        <p role="alert" className="text-sm text-sage pl-6">Please enter a valid email address.</p>
      )}
      {status === 'duplicate' && (
        <p role="alert" className="text-sm text-sage pl-6">You're already on the list. We'll reach out when it's your turn.</p>
      )}
      {status === 'error' && (
        <p role="alert" className="text-sm text-sage pl-6">Something went wrong. Please try again in a moment.</p>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomeEN() {
  const reduced = useReducedMotion();

  useEffect(() => {
    document.documentElement.lang = 'en';
    return () => {
      document.documentElement.lang = 'de';
    };
  }, []);

  return (
    <PainterlyShell>
      <PageMeta
        title="Ronki. The morning routine companion for kids."
        description="Ronki is a dragon companion that reminds your child of their daily routines. No streaks, no ads, no dark patterns. Built by a parent, for parents."
        canonicalPath="/en"
        locale="en"
        alternates={{ de: '/', en: '/en' }}
      />
      <OrganizationSchema />
      <SoftwareApplicationSchema />

      {/* ─────────── Hero ─────────── */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[92vh] px-6 pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden bg-teal-dark"
        aria-label="Hero"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <motion.div
            initial={{ opacity: 0 }}
            animate={reduced ? { opacity: 0.07 } : { opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full"
            style={{ background: 'radial-gradient(circle, #FDD134 0%, transparent 70%)' }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={reduced ? { opacity: 0.06 } : { opacity: [0.04, 0.09, 0.04] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full"
            style={{ background: 'radial-gradient(circle, #0544B0 0%, transparent 65%)' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 lg:gap-16 items-center">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <motion.p
              {...fadeUp(0.1, reduced)}
              className="text-sm uppercase tracking-[0.18em] text-cream/60 mb-8 font-medium"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-mustard align-middle mr-3 animate-pulse" />
              Launching 2026
            </motion.p>

            <motion.h1
              {...fadeUp(0.2, reduced)}
              className="font-display font-extrabold leading-[0.95] tracking-tight text-[2.5rem] sm:text-[3.2rem] lg:text-[4rem] xl:text-[4.5rem] text-cream"
            >
              Imagine saying it{' '}
              <span className="relative inline-block">
                <span className="relative z-10">just once.</span>
                <motion.span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-3 rounded-sm bg-mustard/30"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: reduced ? 0 : 0.9, ease: EASE_OUT }}
                  style={{ originX: 0 }}
                />
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.4, reduced)}
              className="mt-8 text-lg sm:text-xl text-cream/80 leading-relaxed max-w-lg"
            >
              Brush teeth, get dressed, pack the bag. Ronki is the dragon companion that reminds your child. Not you. Not for the tenth time.
            </motion.p>

            <motion.div {...fadeUp(0.55, reduced)} className="mt-10 w-full max-w-md text-cream">
              <EnglishWaitlist />
            </motion.div>

            <motion.p
              {...fadeUp(0.7, reduced)}
              className="mt-6 text-base sm:text-lg font-display font-semibold text-mustard/80 italic"
            >
              What if your child actually wanted the routine?
            </motion.p>

            <motion.div
              {...fadeUp(0.8, reduced)}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center md:justify-start"
            >
              <TrustBadge label="No ads" />
              <TrustBadge label="No streaks" />
              <TrustBadge label="No in-app purchases" />
            </motion.div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <motion.div
              initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: EASE_OUT }}
            >
              <motion.div
                animate={reduced ? {} : { y: [-3, 3, -3] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute -inset-10 rounded-full blur-3xl opacity-30"
                    style={{ background: 'radial-gradient(circle, #FDD134 0%, transparent 70%)' }}
                  />
                  <img
                    src="/art/routines/brushing-teeth.webp"
                    alt="A small boy and his dragon companion Ronki, brushing teeth together."
                    width={520}
                    height={520}
                    className="relative w-[360px] lg:w-[440px] xl:w-[500px] rounded-[2rem] shadow-2xl"
                    style={{ boxShadow: '0 32px 72px rgba(0,0,0,0.4)' }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          {...fadeUp(0.5, reduced)}
          className="relative z-10 mt-10 flex md:hidden justify-center w-full"
        >
          <img
            src="/art/routines/brushing-teeth.webp"
            alt="A small boy and his dragon companion Ronki."
            width={320}
            height={320}
            className="w-64 sm:w-72 rounded-[1.5rem] shadow-2xl"
          />
        </motion.div>
      </section>

      {/* ─────────── What it does ─────────── */}
      <section className="px-6 py-24 sm:py-28 border-t border-teal/10">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.2em] text-teal mb-6 font-medium"
          >
            What Ronki is
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-ink max-w-3xl"
          >
            Your child's dragon.{' '}
            <em className="italic text-sage whitespace-nowrap">Not your alarm clock.</em>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 space-y-5 text-base sm:text-lg text-ink/75 leading-relaxed"
          >
            <p>
              Ronki is a small dragon companion who lives on your child's device and quietly reminds them of the three or four things that matter each day. Teeth. Getting dressed. Packing their bag. Reading a book before bed.
            </p>
            <p>
              Kids love it because the dragon is theirs. You love it because you don't have to repeat yourself ten times. The whole thing is designed to fade away once the routine sticks. The dragon literally goes to sleep.
            </p>
            <p className="font-display font-semibold text-ink">
              No ads. No streaks that break. No data sold to anyone. Built in Germany, fully DSGVO/GDPR compliant.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─────────── What we don't do ─────────── */}
      <section className="px-6 py-24 sm:py-28 bg-cream/40 border-t border-teal/10">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-6"
          >
            Our promise
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-ink mb-10"
          >
            The honest list.
          </motion.h2>

          <ul className="flex flex-col">
            {ANTI_FEATURES.map((item, i) => (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_OUT }}
                className="group border-t border-teal/15 last:border-b py-7 sm:py-9"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-8">
                  <span className="text-xs font-display font-semibold text-teal/70 tracking-[0.2em] sm:min-w-[3ch]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <p className="relative font-display font-bold text-2xl sm:text-3xl leading-tight inline-block text-ink">
                      {item.label}
                      <motion.span
                        aria-hidden
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, margin: '-10%' }}
                        transition={{ duration: 0.7, delay: i * 0.08 + 0.4, ease: EASE_OUT }}
                        className="absolute left-0 top-1/2 h-[3px] w-full origin-left bg-teal-dark/75 rounded-full"
                      />
                    </p>
                    <p className="mt-3 text-sm sm:text-base opacity-75 leading-relaxed max-w-xl text-ink">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─────────── Who builds this ─────────── */}
      <section className="px-6 py-24 sm:py-28 border-t border-teal/10">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.2em] text-teal mb-6 font-medium"
          >
            About the maker
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-ink"
          >
            Ronki isn't a product. It's an{' '}
            <em className="italic text-sage whitespace-nowrap">experiment</em> with my son.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 space-y-5 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl"
          >
            <p>
              I've worked as a consultant in gaming and esports for years. I know how apps are made today. Where the casino mechanics hide. Why some apps can hold kids' attention for hours. How the dopamine loops work. Part of me has helped build that professionally. Another part never wanted to see it in my son's hands.
            </p>
            <p>
              Then Louis started first grade and suddenly every kid talks about Roblox and Fortnite while we're still fighting about brushing teeth and packing the schoolbag. I thought: if other apps are so good at capturing attention, why not build one that does the opposite? One that quietly reminds, accompanies, and eventually makes itself unnecessary.
            </p>
            <p className="font-display font-semibold text-ink">
              My measure of success: Ronki has done its job when your child doesn't need it anymore. As a gamer-dad, I know that's a terrible engagement metric. But it's a damn good parenting metric.
            </p>
            <p className="text-ink/60">
              Marc Förster, father of two, Munich area
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─────────── PWA explainer ─────────── */}
      <section className="px-6 py-24 sm:py-28 border-t border-teal/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto rounded-3xl bg-teal-dark p-8 sm:p-12 lg:p-16 relative overflow-hidden"
          style={{ boxShadow: '0 30px 60px -20px rgba(4,8,18,0.5)' }}
        >
          <div
            aria-hidden
            className="absolute top-0 right-0 w-96 h-96 -mr-32 -mt-32 rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'rgba(5,68,176,0.35)' }}
          />
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-cream/70 font-semibold mb-4">
              No app store needed
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-cream leading-tight mb-5">
              Just tap and it's there.{' '}
              <em className="italic text-mustard inline-block">Like any other app.</em>
            </h2>
            <p className="text-base sm:text-lg text-cream/70 leading-relaxed max-w-xl mx-auto mb-10">
              Open Ronki in your browser and add it to your home screen once. Then your child taps an icon, just like any other app. No ads. No trackers. No download.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center pt-4 border-t border-cream/10">
              <TrustDot label="No third-party trackers" />
              <TrustDot label="No ads" />
              <TrustDot label="Works offline" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────── Final CTA + language switcher ─────────── */}
      <section className="px-6 py-24 sm:py-28 border-t border-teal/10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-4"
          >
            Ready?
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-ink mb-4"
          >
            Ronki is waiting for your child.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-base sm:text-lg text-ink/70 leading-relaxed mb-8 max-w-xl mx-auto"
          >
            We open Ronki in small groups. Leave your email and we'll reach out when it's your turn.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <EnglishWaitlist />
          </motion.div>
        </div>
      </section>

      {/* ─────────── Footer ─────────── */}
      <footer className="relative px-6 pt-10 pb-12 border-t border-teal/10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-sm text-ink/60">
              © {new Date().getFullYear()} Ronki · An independent project. No advertisers, no trackers.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-ink/75 hover:text-ink transition-colors font-display font-semibold">
              🇩🇪 Deutsche Seite
            </Link>
            <Link to="/impressum" className="text-ink/75 hover:text-ink transition-colors">
              Imprint (DE)
            </Link>
            <Link to="/datenschutz" className="text-ink/75 hover:text-ink transition-colors">
              Privacy (DE)
            </Link>
          </div>
        </div>
      </footer>
    </PainterlyShell>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const ANTI_FEATURES = [
  { label: 'No streaks that can break.', detail: 'Consistency grows as a place in Ronki\'s world. Not as a counter that\'s alive today and gone tomorrow.' },
  { label: 'No ads. Ever.', detail: 'Ronki doesn\'t make money from kids\' attention.' },
  { label: 'No loot boxes, no gambling mechanics.', detail: 'Rewards are predictable and tied to real actions.' },
  { label: 'No push notifications.', detail: 'Ronki waits patiently at home. Doesn\'t shout across the house after you.' },
  { label: 'No data sharing with third parties.', detail: 'No trackers, no analytics at launch. Supabase in the EU. Fully GDPR-compliant.' },
];

/* ------------------------------------------------------------------ */
/* Small reusable bits                                                 */
/* ------------------------------------------------------------------ */

function TrustBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-cream/50 font-medium">
      <span aria-hidden className="h-1 w-1 rounded-full bg-cream/30" />
      {label}
    </span>
  );
}

function TrustDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-cream/55 font-medium">
      <span aria-hidden className="h-1 w-1 rounded-full bg-mustard/60" />
      {label}
    </span>
  );
}
