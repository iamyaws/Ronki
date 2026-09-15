/**
 * Shared source of truth for Ratgeber articles.
 *
 * Used by:
 *   - /ratgeber (Ratgeber.tsx), full listing
 *   - / (Home.tsx), featured block (3 direct links for SEO crawl signal)
 *
 * Extracted to data/ so Home doesn't have to import from the lazy-loaded
 * Ratgeber page, which would defeat code-splitting.
 */

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  readMinutes: number;
  image: string;
  featured?: boolean;
}

export const ARTICLES: Article[] = [
  {
    slug: 'morgen-troedeln',
    title: 'Kind trödelt morgens? Warum das normal ist und was wirklich hilft',
    description:
      'Dein Kind trödelt morgens? Das ist kein Erziehungsproblem, sondern Entwicklung. Was dahinter steckt, warum Schreien bremst und vier Hebel, die wirken.',
    category: 'Morgenroutine',
    readMinutes: 8,
    image: '/art/routines/getting-ready.webp',
    featured: true,
  },
  {
    slug: 'sticker-chart-alternative',
    title: 'Warum Sticker-Charts oft nicht halten (und was stattdessen funktioniert)',
    description:
      'Sticker-Charts funktionieren kurz, dann brauchst du immer größere Belohnungen. Was die Forschung zu extrinsischer Motivation bei Kindern sagt, und was bei Grundschulkindern wirklich trägt.',
    category: 'Belohnung & Motivation',
    readMinutes: 11,
    image: '/art/bioms/Naschgarten_temptaion-garden.webp',
  },
  {
    slug: 'was-kinder-apps-machen',
    title: 'Was Kinder-Apps mit deinem Kind machen',
    description:
      'Pokémon Go, Streaks, Paywalls, Werbung die selbst ein Spiel ist: was ich nach anderthalb Jahren Kinder-Apps mit meinem Sohn gelernt habe und was bei uns funktioniert.',
    category: 'Digitale Mündigkeit',
    readMinutes: 12,
    image: '/art/marketing/was-kinder-apps-machen.png',
  },
  {
    slug: 'dark-patterns-kinder-apps',
    title: 'Dark Patterns in Kinder-Apps: Was Eltern 2026 wissen sollten',
    description:
      'Push-Benachrichtigungen, Streaks, Loot-Boxes, Endless-Scroll: wie Kinder-Apps designed sind, dich und dein Kind zurückzuholen. Und woran du eine gute App erkennst.',
    category: 'Digitale Mündigkeit',
    readMinutes: 12,
    image: '/art/bioms/Wolkengrat_mountain-ridge.webp',
  },
  {
    slug: 'morgenroutine-grundschulkind',
    title: 'Die Morgenroutine, die wirklich klappt: was für 6- bis 8-Jährige funktioniert',
    description:
      'Eine Morgenroutine, die ein Grundschulkind selbst ausführen kann. Reihenfolge, Zeitplan, typische Stolpersteine und warum deine Routine vielleicht am falschen Ende anfängt.',
    category: 'Morgenroutine',
    readMinutes: 8,
    image: '/art/bioms/Morgenwald_dawn-forest.webp',
  },
  {
    slug: 'abendroutine-grundschulkind',
    title: 'Abendroutine für Kinder: der Ablauf, der bei 5- bis 8-Jährigen wirklich trägt',
    description:
      'Abendroutine für Kinder von 5 bis 8: warum 45 Minuten reichen, welche Reihenfolge trägt und wie die Abendroutine Kinder ruhiger ins Bett bringt.',
    category: 'Abendroutine',
    readMinutes: 10,
    image: '/art/bioms/Sternenmeer_sea-of-stars.webp',
  },
  {
    slug: 'zaehneputzen-ohne-streit',
    title: 'Zähneputzen ohne Streit: was bei 5- bis 8-Jährigen wirklich hilft',
    description:
      'Kind verweigert Zähneputzen? Warum das meistens kein Erziehungsproblem ist, was Kinderzahnärzt:innen raten, und drei Hebel, die bei Grundschulkindern wirken.',
    category: 'Hygiene & Zähne',
    readMinutes: 7,
    image: '/art/routines/brushing-teeth.webp',
  },
  {
    slug: 'einschulung-selbststaendigkeit',
    title: 'Vor der Einschulung: Selbstständigkeit ohne Druck',
    description:
      'Ein halbes Jahr vor der Einschulung: welche Fähigkeiten dein Kind wirklich braucht, was Schule voraussetzt, und wie du das entspannt aufbaust ohne Drill.',
    category: 'Einschulung',
    readMinutes: 8,
    image: '/art/bioms/Sonnenglast_sun-highlands.webp',
  },
  {
    slug: 'eltern-bereich',
    title: 'Der Eltern-Bereich in Ronki: was drin ist und wie du hinkommst',
    description:
      'Ronki ist für dein Kind gebaut, nicht für dich. Der Eltern-Bereich ist die eine Ausnahme: ein PIN-geschützter Ort für Einstellungen, eigene Vorhaben und einen ruhigen Blick auf die Woche.',
    category: 'Ronki nutzen',
    readMinutes: 5,
    image: '/art/bioms/Sonnenglast_sun-highlands.webp',
  },
];
