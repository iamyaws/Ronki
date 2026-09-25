import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import de from './de.json';
import en from './en.json';

// ── Types ──
type Lang = 'de' | 'en';
type Translations = Record<string, string>;
type Vars = Record<string, string | number>;

interface LanguageContextValue {
  lang: Lang;
  locale: string;            // BCP-47 locale for Intl APIs
  setLang: (l: Lang) => void;
  /**
   * Translate a key. Second arg is polymorphic for convenience:
   *   t('hello')                              // → translation or key
   *   t('hello', 'Hello world')               // fallback string if key is missing
   *   t('greet', { name: 'Louis' })           // vars interpolation
   *   t('greet', { name: 'Louis' }, 'Hi {name}') // vars + fallback
   *
   * Fallback is used when the key is missing from BOTH the active lang
   * and the German source-of-truth. Interpolates vars through the
   * fallback too, so callers can write 'Hi {name}' defaults.
   *
   * Rationale: protects us from rename/missing-key regressions (like the
   * April s_wake bug where a quest label rendered as raw id 'quest.s_wake').
   */
  t: (key: string, varsOrFallback?: Vars | string, fallback?: string) => string;
}

const TRANSLATIONS: Record<Lang, Translations> = { de, en };
const LOCALES: Record<Lang, string> = { de: 'de-DE', en: 'en-US' };
const STORAGE_KEY = 'ronki-lang';

function getInitialLang(): Lang {
  // 1. Explicit user choice (persisted from settings or onboarding)
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'de') return saved;
  } catch {}
  // 2. No auto-detect for now (Finch pass, 26 Sep 2026, review
  // INTEGRATION-3): Ronki's new lines and voices exist only in German, so
  // an English browser would get English buttons next to German bubbles.
  // German until a parent picks English in the Eltern-Bereich.
  return 'de';
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'de',
  locale: 'de-DE',
  setLang: () => {},
  t: (k) => k,
});

// Throttled dev-only missing-key warner. One warn per unique key per session
// is enough to catch regressions without spamming the console during
// renders-in-a-loop. Production builds never warn.
const warnedMissingKeys = new Set<string>();
function warnMissing(key: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((import.meta as any).env?.PROD) return;
  if (warnedMissingKeys.has(key)) return;
  warnedMissingKeys.add(key);
  // eslint-disable-next-line no-console
  console.warn(`[i18n] Missing translation for key "${key}" — falling back.`);
}

function interpolate(str: string, vars?: Vars): string {
  if (!vars) return str;
  let out = str;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return out;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const t = useCallback<LanguageContextValue['t']>((key, varsOrFallback, fallback) => {
    // Normalize the polymorphic second arg.
    const vars: Vars | undefined =
      typeof varsOrFallback === 'object' && varsOrFallback !== null ? varsOrFallback : undefined;
    const explicitFallback: string | undefined =
      typeof varsOrFallback === 'string' ? varsOrFallback : fallback;

    const hit = TRANSLATIONS[lang][key] ?? TRANSLATIONS.de[key];
    if (hit !== undefined) return interpolate(hit, vars);

    // Miss: warn once per key (dev only), then use the explicit fallback
    // if the caller gave us one; otherwise return the raw key so the
    // broken surface is at least visible.
    warnMissing(key);
    return interpolate(explicitFallback ?? key, vars);
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    locale: LOCALES[lang],
    setLang,
    t,
  }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

export default LanguageContext;
