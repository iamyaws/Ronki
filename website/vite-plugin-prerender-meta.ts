import { Plugin } from 'vite';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

interface RouteMeta {
  path: string;
  title: string;
  description: string;
  ogImage?: string;
}

const ROUTES: RouteMeta[] = [
  {
    path: '/en',
    title: 'Ronki. The morning routine companion for kids.',
    description:
      'Ronki is a dragon companion that reminds your child of their daily routines. No streaks, no ads, no dark patterns. Built by a parent, for parents.',
  },
  {
    path: '/wie-es-funktioniert',
    title: 'So funktioniert Ronki',
    description:
      'Drei Phasen: Begleiten, Loslassen, Erinnern. Wie Ronki Kindern hilft, eigene Routinen aufzubauen.',
    ogImage: '/og-wie-es-funktioniert.jpg',
  },
  {
    path: '/wissenschaft',
    title: 'Wissenschaftlicher Hintergrund: Ronki',
    description:
      'Welche Forschung hinter Ronki steckt: Selbstbestimmungstheorie, Fading Scaffolding und Montessori.',
    ogImage: '/og-wissenschaft.jpg',
  },
  {
    path: '/faq',
    title: 'Häufige Fragen zu Ronki',
    description:
      'Antworten auf die häufigsten Fragen von Eltern zu Ronki: Geräte, Alter, Datenschutz, Preis und was das Alpha-Programm bedeutet.',
    ogImage: '/og-faq.jpg',
  },
  {
    path: '/fuer-eltern',
    title: 'Für Eltern: Ronki',
    description:
      'Sechs ehrliche Antworten auf die Fragen, die Eltern sich zu Ronki stellen: Bildschirmzeit, Datenschutz, Motivation, Preis und Alpha.',
    ogImage: '/og-fuer-eltern.jpg',
  },
  {
    path: '/installieren',
    title: 'Ronki installieren · iPhone, Android, Fire Tablet, Desktop',
    description:
      'So legt ihr Ronki auf den Startbildschirm: Schritt-für-Schritt-Anleitung für iPhone, iPad, Android (Chrome, Samsung, Firefox), Amazon Fire Tablet und Desktop. Ohne App-Store, ohne Download.',
  },
  {
    path: '/vorlagen',
    title: 'Vorlagen zum Ausdrucken: Ronki',
    description:
      'Druckbare Routinen-Vorlagen für Kinder. Morgenroutine, Abendroutine, eine einfache Version für kleine Geschwister und ein Plan aus Bildern bei ADHS. Kostenlos, ohne Anmeldung.',
  },
  {
    path: '/ratgeber',
    title: 'Ratgeber: Ronki',
    description:
      'Ehrliche Artikel für Eltern von 5- bis 9-Jährigen. Morgenroutinen, Abendroutinen, Motivation und was in Kinder-Apps wirklich passiert. Kein Ratgeber-Kitsch, nur das, was wir selbst rausgefunden haben.',
    ogImage: '/og-ratgeber.jpg',
  },
  {
    path: '/ratgeber/morgen-troedeln',
    title: 'Kind trödelt morgens? Warum das normal ist und was wirklich hilft · Ratgeber · Ronki',
    description:
      'Dein Kind trödelt morgens? Kein Erziehungsproblem, sondern Entwicklung. Was dahinter steckt und vier Hebel, die wirken, auch wenn das Kleinkind morgens trödelt.',
    ogImage: '/og-ratgeber-morgen-troedeln.jpg',
  },
  {
    path: '/ratgeber/sticker-chart-alternative',
    title: 'Warum Sticker-Charts oft nicht halten · Ratgeber · Ronki',
    description:
      'Sticker-Charts funktionieren kurz, dann brauchst du immer größere Belohnungen. Was die Forschung sagt und was bei Grundschulkindern wirklich trägt.',
    ogImage: '/og-ratgeber-sticker-chart.jpg',
  },
  {
    path: '/ratgeber/dark-patterns-kinder-apps',
    title: 'Dark Patterns in Kinder-Apps · Ratgeber · Ronki',
    description:
      'Push-Benachrichtigungen, Streaks, Loot-Boxes, Endless-Scroll: wie Kinder-Apps designed sind, dich und dein Kind zurückzuholen. Und woran du eine gute App erkennst.',
    ogImage: '/og-ratgeber-dark-patterns.jpg',
  },
  {
    path: '/ratgeber/morgenroutine-grundschulkind',
    title: 'Die Morgenroutine, die wirklich klappt · Ratgeber · Ronki',
    description:
      'Eine Morgenroutine, die ein Grundschulkind selbst ausführen kann. Reihenfolge, Zeitplan, typische Stolpersteine und warum deine Routine vielleicht am falschen Ende anfängt.',
    ogImage: '/og-ratgeber-morgenroutine.jpg',
  },
  {
    path: '/ratgeber/morgenroutine-adhs',
    title: 'Morgenroutine bei ADHS: was Kindern mit schwachen Exekutivfunktionen wirklich hilft · Ratgeber · Ronki',
    description:
      'Morgenroutine ADHS: warum das Anfangen die eigentliche Arbeit ist, was bei schwachen Exekutivfunktionen hilft und wie ein Plan aus Bildern aussieht.',
  },
  {
    path: '/vorlagen/adhs',
    title: 'Mein Morgen, ein Schritt nach dem anderen: Vorlage bei ADHS · Ronki',
    description:
      'Druckbarer Morgenplan für Kinder mit ADHS oder schwachen Exekutivfunktionen. Sechs Schritte, ein Bild pro Schritt, eine Klammer zeigt, was jetzt dran ist. Kostenlos, ohne Anmeldung.',
  },
  {
    path: '/ratgeber/abendroutine-grundschulkind',
    title: 'Abendroutine für Kinder: der Ablauf, der bei 5- bis 8-Jährigen wirklich trägt · Ratgeber · Ronki',
    description:
      'Abendroutine für Kinder von 5 bis 8: warum 45 Minuten reichen, welche Reihenfolge trägt und was bei einer Abendroutine fürs Kleinkind anders läuft.',
    ogImage: '/og-ratgeber-abendroutine.jpg',
  },
  {
    path: '/ratgeber/zaehneputzen-ohne-streit',
    title: 'Zähneputzen ohne Streit · Ratgeber · Ronki',
    description:
      'Kind verweigert Zähneputzen? Warum das meistens kein Erziehungsproblem ist, was Kinderzahnärzt:innen raten, und drei Hebel, die bei Grundschulkindern wirken.',
    ogImage: '/og-ratgeber-zaehneputzen.jpg',
  },
  {
    path: '/ratgeber/einschulung-selbststaendigkeit',
    title: 'Vor der Einschulung: Selbstständigkeit ohne Druck · Ratgeber · Ronki',
    description:
      'Ein halbes Jahr vor der Einschulung: welche Fähigkeiten dein Kind wirklich braucht, was Schule voraussetzt, und wie du das entspannt aufbaust ohne Drill.',
    ogImage: '/og-ratgeber-einschulung.jpg',
  },
  {
    path: '/impressum',
    title: 'Impressum: Ronki',
    description: 'Anbieterkennzeichnung nach § 5 DDG und § 18 MStV.',
  },
  {
    path: '/datenschutz',
    title: 'Datenschutz: Ronki',
    description:
      'Wie wir mit deinen Daten umgehen. DSGVO-konform, EU-Hosting, kein Tracking.',
  },
  {
    path: '/agb',
    title: 'AGB: Ronki',
    description: 'Allgemeine Geschäftsbedingungen für die Nutzung von Ronki.',
  },
];

const DOMAIN = 'https://www.ronki.de';
const DEFAULT_OG = '/og-ronki.jpg';

function replaceMeta(html: string, route: RouteMeta): string {
  const og = route.ogImage || DEFAULT_OG;
  const url = `${DOMAIN}${route.path}`;

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${route.description}$2`,
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${route.title}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${route.description}$2`,
    )
    .replace(
      /(<meta\s+property="og:image"\s+content=")[^"]*(")/,
      `$1${DOMAIN}${og}$2`,
    )
    .replace(
      /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
      `$1${url}$2`,
    )
    .replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
      `$1${url}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
      `$1${route.title}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
      `$1${route.description}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,
      `$1${DOMAIN}${og}$2`,
    );
}

export function prerenderMeta(): Plugin {
  let distDir: string;

  return {
    name: 'prerender-meta',
    configResolved(config) {
      distDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      if (!distDir) return;

      let indexHtml: string;
      try {
        indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');
      } catch {
        console.warn('[prerender-meta] Could not read dist/index.html, skipping.');
        return;
      }

      let count = 0;
      for (const route of ROUTES) {
        const html = replaceMeta(indexHtml, route);
        const dir = join(distDir, route.path);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), html);
        count++;
      }

      console.log(`[prerender-meta] Generated ${count} static HTML files for social crawlers.`);
    },
  };
}
