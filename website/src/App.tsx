import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppRoutes } from './routes';
import { BilderbuchDefs } from './components/primitives/BilderbuchDefs';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // Routes are lazy loaded, so the hash target may mount a moment after
    // navigation. Retry a few times before giving up.
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const attempt = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        return;
      }
      if (tries++ < 15) timer = setTimeout(attempt, 100);
    };
    attempt();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      {/* Drawn chevrons, checks, rings, blob and the crayon filter.
       *  Mounted once for every route, screen and print alike. */}
      <BilderbuchDefs />
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}
