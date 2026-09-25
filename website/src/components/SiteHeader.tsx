import { Link, useLocation } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';
import { RonkiWordmark } from './primitives/RonkiWordmark';

const NAV = [
  { to: '/wie-es-funktioniert', label: 'Wie es funktioniert' },
  { to: '/fuer-eltern', label: 'Für Eltern' },
  { to: '/ratgeber', label: 'Ratgeber' },
  { to: '/vorlagen', label: 'Vorlagen' },
];

/**
 * Site header: wordmark left, nav in the middle, one pill on the right.
 *
 * The header sits absolutely over the top of the page, and every page
 * already reserves the space for it with its own top padding. On the
 * start page the top of the page is the cobalt hero, so the header
 * flips to its light-on-dark set. That is decided from the route, not
 * from a scroll listener, so it never flickers and costs nothing.
 */
export function SiteHeader() {
  const { pathname } = useLocation();
  const onDark = pathname === '/';

  const navClass = onDark
    ? 'text-white/85 hover:text-white'
    : 'text-ink/70 hover:text-ink';
  const pillClass = onDark
    ? 'bg-white text-ink'
    : 'bg-cobalt text-white';

  return (
    <header className="absolute top-0 left-0 right-0 z-40 px-6 pt-5 sm:pt-6">
      <div className="max-w-6xl mx-auto flex items-center gap-5">
        <Link to="/" aria-label="Ronki, zur Startseite" className="shrink-0">
          <RonkiWordmark size={32} tone={onDark ? 'white' : 'ink'} />
        </Link>

        <nav
          aria-label="Hauptnavigation"
          className="hidden lg:flex items-center gap-7"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`font-display font-semibold text-sm transition-colors ${navClass}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/profil-erstellen"
          onClick={() => trackEvent('CTA Klick', { cta: 'header', source: 'header' })}
          className={`ml-auto shrink-0 inline-flex items-center rounded-full px-5 py-2.5 font-display font-bold text-sm transition-transform hover:-translate-y-0.5 [hyphens:none] ${pillClass}`}
        >
          Karte erstellen
        </Link>
      </div>
    </header>
  );
}
