import type { ReactNode } from 'react';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';
import { ARTICLES } from '../data/ratgeber-articles';
import {
  Chalkboard,
  ChecklistItem,
  CrayonBarChart,
  Doodle,
  DOODLE_NAMES,
  DrawnLink,
  HandNote,
  IndexCard,
  MarkerHighlight,
  MarkerUnderline,
  NotebookPage,
  PictureFrame,
  PillButton,
  Polaroid,
  PrintedSheet,
  Ribbon,
  SheetRow,
  SpeechBubble,
  Stamp,
  StickerLabel,
  StickyNote,
  Ticket,
  TicketLine,
  TornNote,
} from '../components/bausteine';

/* ------------------------------------------------------------------ */
/* Page furniture                                                      */
/* ------------------------------------------------------------------ */

type StageTone = 'paper' | 'white' | 'sky-wash' | 'night' | 'cobalt';

const STAGE_CLASS: Record<StageTone, string> = {
  paper: 'bg-paper',
  white: 'bg-white',
  'sky-wash': 'bg-sky-wash',
  night: 'bg-night',
  cobalt: 'bg-cobalt',
};

/** The tray a live example sits on, so a white block on a white page
 *  still has an edge you can see. */
function Stage({
  children,
  tone = 'paper',
  className = '',
}: {
  children: ReactNode;
  tone?: StageTone;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] border-2 border-dashed border-ink/20 px-4 py-8 sm:px-8 sm:py-10 ${STAGE_CLASS[tone]} ${className}`}
    >
      {children}
    </div>
  );
}

/** One numbered block: what it is, what it is for, what it is not for,
 *  and the thing itself with real Ronki copy in it. */
function Entry({
  n,
  name,
  fuer,
  nichtFuer,
  children,
}: {
  n: number;
  name: string;
  fuer: string;
  nichtFuer: string;
  children: ReactNode;
}) {
  return (
    <section
      id={`baustein-${n}`}
      className="scroll-mt-24 border-t-2 border-dashed border-ink/15 pt-10"
    >
      <div className="grid gap-7 lg:grid-cols-[270px_1fr] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-4">
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <svg aria-hidden viewBox="0 0 64 64" className="absolute inset-0 h-14 w-14">
                <circle cx="32" cy="32" r="29" fill="#FDD134" />
              </svg>
              <span className="bb-display relative text-[1.7rem] leading-none text-ink">{n}</span>
            </span>
            <h2 className="bb-display text-[1.7rem] sm:text-[1.9rem] text-ink [hyphens:none]">
              {name}
            </h2>
          </div>

          <dl className="mt-5 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Doodle name="check" size={18} className="mt-1 text-cobalt" rough={false} />
              <div>
                <dt className="bb-hand text-lg uppercase leading-none text-cobalt">Wofür</dt>
                <dd className="mt-1 text-[0.97rem] leading-relaxed text-ink/85">{fuer}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Doodle name="cross" size={18} className="mt-1 text-ink/60" rough={false} />
              <div>
                <dt className="bb-hand text-lg uppercase leading-none text-ink/70">Nicht für</dt>
                <dd className="mt-1 text-[0.97rem] leading-relaxed text-ink/85">{nichtFuer}</dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

/** A caption under a variant, so Marc can name the tone he means. */
function VariantLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-center font-display text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-ink/55">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Base layer                                                          */
/* ------------------------------------------------------------------ */

const COLOURS: { name: string; hex: string; note: string; ring?: boolean }[] = [
  { name: 'Weiß', hex: '#FFFFFF', note: 'Grund', ring: true },
  { name: 'Papier', hex: '#FDFBF3', note: 'Zettel, Karten', ring: true },
  { name: 'Seite', hex: '#E8DBBF', note: 'Buchkante' },
  { name: 'Tinte', hex: '#040812', note: 'Text, Umrisse' },
  { name: 'Kobalt', hex: '#0544B0', note: 'Aktion, Haken' },
  { name: 'Himmel', hex: '#41A2FB', note: 'Flächen' },
  { name: 'Himmel hell', hex: '#B9E3FC', note: 'Linien, Grund' },
  { name: 'Glut', hex: '#EE4F35', note: 'Nur Formen' },
  { name: 'Sonne', hex: '#FDD134', note: 'Nur Flächen' },
  { name: 'Nacht', hex: '#04225E', note: 'Abend, Schluss' },
];

function BaseLayer() {
  return (
    <div className="mt-10 flex flex-col gap-10">
      <div>
        <StickerLabel tone="sky-wash" rotate={-2}>
          Farben
        </StickerLabel>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COLOURS.map((c) => (
            <li key={c.hex} className="min-w-0">
              <span
                className={`block h-16 w-full rounded-[12px] border-[2.5px] border-ink`}
                style={{ background: c.hex }}
              />
              <p className="mt-2 font-display text-[0.95rem] font-bold text-ink">{c.name}</p>
              <p className="text-[0.8rem] uppercase tracking-wide text-ink/60">{c.hex}</p>
              <p className="text-[0.85rem] text-ink/75">{c.note}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.95rem] text-ink/75">
          Sonne und Glut tragen nie Text auf Weiß. Sie sind Flächen, Marker und Formen.
        </p>
      </div>

      <div>
        <StickerLabel tone="sky-wash" rotate={2}>
          Schriften
        </StickerLabel>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div className="rounded-[14px] bg-paper px-5 py-5">
            <p className="text-[0.8rem] uppercase tracking-[0.1em] text-ink/55">
              Fredoka · Überschriften
            </p>
            <p className="bb-display mt-3 text-[2rem] leading-none text-ink">Ein Tag mit Ronki</p>
          </div>
          <div className="rounded-[14px] bg-paper px-5 py-5">
            <p className="text-[0.8rem] uppercase tracking-[0.1em] text-ink/55">
              Gochi Hand · Notizen
            </p>
            <p className="bb-hand mt-3 text-[1.7rem] leading-tight text-cobalt">
              Steht so im Code.
            </p>
          </div>
          <div className="rounded-[14px] bg-paper px-5 py-5">
            <p className="text-[0.8rem] uppercase tracking-[0.1em] text-ink/55">
              Be Vietnam Pro · Fließtext
            </p>
            <p className="mt-3 text-[1.02rem] leading-relaxed text-ink/85">
              Ronki erinnert, du begleitest. Mehr macht die App nicht.
            </p>
          </div>
        </div>
      </div>

      <div>
        <StickerLabel tone="sky-wash" rotate={-2}>
          Knöpfe und Links
        </StickerLabel>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Stage tone="white" className="flex flex-wrap items-center justify-center gap-4">
            <PillButton href="#baustein-16">Karte erstellen</PillButton>
            <PillButton href="#baustein-16" tone="outline" arrow={false}>
              Vorlage holen
            </PillButton>
          </Stage>
          <Stage tone="cobalt" className="flex flex-wrap items-center justify-center gap-4">
            <PillButton href="#baustein-16" tone="on-dark">
              Karte erstellen
            </PillButton>
            <PillButton href="#baustein-16" tone="on-night" arrow={false}>
              App öffnen
            </PillButton>
          </Stage>
        </div>
        <div className="mt-4">
          <Stage tone="white" className="flex justify-center">
            <DrawnLink href="/wissenschaft">Wissenschaftlicher Hintergrund</DrawnLink>
          </Stage>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rules                                                               */
/* ------------------------------------------------------------------ */

function RulePair({
  n,
  rule,
  falsch,
  richtig,
}: {
  n: number;
  rule: string;
  falsch?: ReactNode;
  richtig?: ReactNode;
}) {
  return (
    <li className="border-t-2 border-dashed border-ink/15 pt-7">
      <p className="bb-display text-[1.25rem] sm:text-[1.4rem] text-ink [hyphens:none]">
        <span className="text-cobalt">{n}.</span> {rule}
      </p>
      {(falsch || richtig) && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-2 font-display text-[0.8rem] font-bold uppercase tracking-[0.08em] text-ink/60">
              <Doodle name="cross" size={16} rough={false} /> So nicht
            </p>
            <Stage tone="white" className="min-h-[132px]">
              {falsch}
            </Stage>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-2 font-display text-[0.8rem] font-bold uppercase tracking-[0.08em] text-cobalt">
              <Doodle name="check" size={16} rough={false} /> So
            </p>
            <Stage tone="white" className="min-h-[132px]">
              {richtig}
            </Stage>
          </div>
        </div>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Styleguide() {
  const article = ARTICLES[0];

  return (
    <PainterlyShell>
      <PageMeta
        title="Bausteine: Ronki"
        description="Die Bausteine der Ronki-Oberfläche, mit Beispiel und Regel."
        noindex
      />

      {/* ─────────── Kopf ─────────── */}
      <header className="px-5 sm:px-6 pt-28 pb-10 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-4">
            <Ribbon tone="cobalt">Bausteine</Ribbon>
            <Stamp tone="ember">Interne Seite</Stamp>
          </div>

          <h1 className="bb-display mt-8 text-[2.6rem] sm:text-[3.4rem] text-ink">
            Das sind die Bausteine, aus denen Ronki{' '}
            <MarkerUnderline>gebaut ist.</MarkerUnderline>
          </h1>

          <p className="mt-5 max-w-2xl text-[1.05rem] sm:text-lg leading-relaxed text-ink/85">
            Jeder Baustein macht eine Sache. Du erkennst ihn, auch wenn du den Text darin nicht
            liest. Wenn zwei nebeneinander gleich aussehen, ist einer davon der falsche. Unten
            steht jeder einmal, mit Nummer, damit wir über „Nummer neun" reden können statt über
            „das Ding mit den Löchern".
          </p>

          <HandNote rotate={-3} className="mt-7">
            Nicht verlinkt. Nur für uns.
          </HandNote>

          <BaseLayer />
        </div>
      </header>

      {/* ─────────── Die 17 ─────────── */}
      <main className="px-5 sm:px-6 pb-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          {/* 1 */}
          <Entry
            n={1}
            name="NotebookPage"
            fuer="Listen, die jemand von Hand geschrieben haben könnte. Abhaken, streichen, nachtragen."
            nichtFuer="Fließtext und alles mit Bild. Ein Heftblatt mit Foto darauf ist kein Heftblatt mehr."
          >
            <Stage>
              <NotebookPage className="mx-auto max-w-md">
                <p className="bb-display text-[1.35rem] text-ink">Morgens, bevor die Schule losgeht</p>
                <ul className="mt-2">
                  <ChecklistItem mark="check">Gesicht waschen</ChecklistItem>
                  <ChecklistItem mark="check">Anziehen</ChecklistItem>
                  <ChecklistItem mark="check">Frühstücken</ChecklistItem>
                  <ChecklistItem mark="cross">Tasche packen</ChecklistItem>
                </ul>
              </NotebookPage>
            </Stage>
          </Entry>

          {/* 2 */}
          <Entry
            n={2}
            name="TornNote"
            fuer="Einschränkungen, Kleingedrucktes, das Ehrliche am Rand. Kurz gehalten."
            nichtFuer="Überschriften und lange Absätze. Ein Fetzen mit zehn Zeilen sieht nicht mehr abgerissen aus."
          >
            {/* Zwei Bühnen: der Papier-Zettel braucht Weiß unter sich,
             *  der weiße Zettel braucht Papier. */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Stage tone="white">
                  <TornNote>
                    <p className="font-display text-[1.05rem] font-bold text-ink">
                      Die ersten zwei Wochen dauern länger.
                    </p>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/85">
                      Nicht kürzer. Erst danach läuft die Routine von selbst.
                    </p>
                  </TornNote>
                </Stage>
                <VariantLabel>Papier auf Weiß, Pinnnadel</VariantLabel>
              </div>
              <div>
                <Stage tone="paper">
                  <TornNote tone="white" pin="tape" rotate={1.6}>
                    <p className="font-display text-[1.05rem] font-bold text-ink">Frühe Version.</p>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/85">
                      Es gibt Ecken, die noch haken.
                    </p>
                  </TornNote>
                </Stage>
                <VariantLabel>Weiß auf Papier, Klebeband</VariantLabel>
              </div>
            </div>
          </Entry>

          {/* 3 */}
          <Entry
            n={3}
            name="StickyNote"
            fuer="Ein Begriff, der nebenbei erklärt werden muss. Genau einer pro Seite."
            nichtFuer="Zwei davon nebeneinander. Ab dem zweiten ist es kein Einwurf mehr, sondern Layout."
          >
            <Stage>
              <div className="mx-auto max-w-sm">
                <StickyNote eyebrow="Kurz erklärt" title="Dark Patterns" rotate={1.4}>
                  So nennt man Tricks in Apps, die Kinder länger binden oder zurücklocken.
                  Lootboxen, Streaks mit schlechtem Gewissen, Push-Nachrichten am Abend. Wir haben
                  sie uns angesehen und weggelassen.
                </StickyNote>
              </div>
            </Stage>
          </Entry>

          {/* 4 */}
          <Entry
            n={4}
            name="PrintedSheet"
            fuer="Alles, was es auch auf Papier gibt: Routinen, Pläne, Listen zum Abhaken."
            nichtFuer="Werbetexte. Auf einem ausgedruckten Blatt steht nie ein Verkaufsargument."
          >
            <Stage tone="sky-wash">
              <div className="mx-auto max-w-sm">
                <PrintedSheet label="Abend" title="Abendroutine" corner="🌙" tilt={-1.2}>
                  <ul className="mt-4 flex flex-col gap-1">
                    <SheetRow state="done">Zähne putzen</SheetRow>
                    <SheetRow state="done">Gesicht waschen</SheetRow>
                    <SheetRow state="current">Pyjama an</SheetRow>
                    <SheetRow state="open">Licht aus</SheetRow>
                  </ul>
                </PrintedSheet>
                <VariantLabel>Zeilen: erledigt, jetzt dran, offen</VariantLabel>
              </div>
            </Stage>
          </Entry>

          {/* 5 */}
          <Entry
            n={5}
            name="SpeechBubble"
            fuer="Ronki, der spricht. Ein Elternsatz. Eine Antwort in den häufigen Fragen."
            nichtFuer="Fließtext. Eine Blase mit sechs Zeilen ist eine Karte mit Zacken."
          >
            <Stage>
              <div className="grid gap-y-10 gap-x-6 sm:grid-cols-3">
                <div className="flex flex-col items-start pb-8">
                  <SpeechBubble tail="left" className="mb-6">
                    Drei von vier geschafft. Die Tasche machen wir gleich zusammen.
                  </SpeechBubble>
                  <VariantLabel>Weiß</VariantLabel>
                </div>
                <div className="flex flex-col items-start pb-8">
                  <SpeechBubble tone="cobalt" tail="bottom" rotate={1} className="mb-6">
                    Ronki ist kostenlos. Ohne Store, ohne Anmeldung.
                  </SpeechBubble>
                  <VariantLabel>Kobalt</VariantLabel>
                </div>
                <div className="flex flex-col items-start pb-8">
                  <SpeechBubble tone="sun" tail="right" rotate={-1.6} className="mb-6">
                    Braucht mein Kind ein eigenes Gerät? Nein.
                  </SpeechBubble>
                  <VariantLabel>Sonne</VariantLabel>
                </div>
              </div>
            </Stage>
          </Entry>

          {/* 6 */}
          <Entry
            n={6}
            name="Polaroid"
            fuer="Echte Fotos. Menschen, Küchentische, ausgedruckte Blätter an der Wand."
            nichtFuer="Zeichnungen. Ein gemaltes Bild im Fotorahmen behauptet, es sei passiert."
          >
            <Stage>
              <div className="flex justify-center">
                <Polaroid
                  src="/art/founders/marc-louis-play.webp"
                  alt="Marc und Louis spielen zusammen auf dem Boden."
                  caption="Marc und Louis"
                  rotate={-2.2}
                  tape
                  className="w-[260px]"
                />
              </div>
            </Stage>
          </Entry>

          {/* 7 */}
          <Entry
            n={7}
            name="PictureFrame"
            fuer="Gezeichnete Bilder: Ronki, die sieben Freunde, jede Illustration."
            nichtFuer="Fotos, Bildschirmfotos und Text ohne Bild."
          >
            <Stage tone="cobalt">
              <div className="flex flex-wrap items-start justify-center gap-10">
                <div className="w-[220px]">
                  <PictureFrame
                    src="/art/freunde/lichtbringerin.webp"
                    alt="Die Lichtbringerin, eine Figur aus Ronkis Welt."
                    caption="Lichtbringerin"
                    tone="white"
                    rotate={-2}
                  />
                  <VariantLabel>
                    <span className="text-white/70">Weiß auf Kobalt</span>
                  </VariantLabel>
                </div>
                <div className="w-[220px]">
                  <div className="rounded-[20px] bg-white p-4">
                    <PictureFrame
                      src="/art/freunde/flackerfuchs.webp"
                      alt="Der Flackerfuchs, eine Figur aus Ronkis Welt."
                      caption="Flackerfuchs"
                      rotate={2}
                    />
                  </div>
                  <VariantLabel>
                    <span className="text-white/70">Tinte auf Weiß</span>
                  </VariantLabel>
                </div>
              </div>
            </Stage>
          </Entry>

          {/* 8 */}
          <Entry
            n={8}
            name="IndexCard"
            fuer="Ein Artikel, eine Vorlage, ein Werkzeug. Der Reiter nennt die Schublade."
            nichtFuer="Den Haupttext einer Seite. Eine Karteikarte verweist, sie erzählt nicht."
          >
            <Stage>
              <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-2">
                <IndexCard
                  tab={article.category}
                  title={article.title}
                  meta={`${article.readMinutes} Minuten`}
                  image={article.image}
                  imageAlt=""
                >
                  Warum Trödeln am Morgen normal ist, und vier Hebel, die wirklich etwas ändern.
                </IndexCard>
                <IndexCard
                  tab="Vorlage"
                  title="Abendroutine zum Ausdrucken"
                  meta="A4, kostenlos"
                  rotate={1}
                >
                  Vier Schritte, große Felder zum Abhaken. Ohne Anmeldung.
                </IndexCard>
              </div>
            </Stage>
          </Entry>

          {/* 9 */}
          <Entry
            n={9}
            name="Ticket"
            fuer="Schritte und alles, was man zählen kann. Der Abriss trägt die Nummer."
            nichtFuer="Aufzählungen ohne Reihenfolge. Ein Ticket verspricht, dass es weitergeht."
          >
            <Stage>
              <div className="mx-auto flex max-w-lg flex-col gap-5">
                <Ticket stub="1">
                  <TicketLine title="Seite öffnen">
                    Öffne Ronki in Safari auf deinem iPhone oder iPad.
                  </TicketLine>
                </Ticket>
                <Ticket stub="2" tone="sun" rotate={0.8}>
                  <TicketLine title="Teilen antippen">
                    Tippe auf das Teilen-Symbol unten in der Leiste.
                  </TicketLine>
                </Ticket>
                <Ticket stub="3" tone="cobalt" rotate={-0.5}>
                  <TicketLine title="Zum Home-Bildschirm">
                    Wähle „Zum Home-Bildschirm" und tippe auf „Hinzufügen".
                  </TicketLine>
                </Ticket>
              </div>
            </Stage>
          </Entry>

          {/* 10 */}
          <Entry
            n={10}
            name="Chalkboard"
            fuer="Den Abend, das Ruhige, jede dunkle Fläche. Sonne und Glut dürfen hier Text sein."
            nichtFuer="Lange Erklärungen. Auf eine Tafel schreibt man drei Zeilen, nicht dreißig."
          >
            <Stage tone="paper">
              <div className="mx-auto max-w-lg">
                <Chalkboard eyebrow="Abends um sieben" title="Ronki liegt schon im Nest.">
                  Zähne, Pyjama, Licht aus. Das Licht macht Louis gleich selbst aus. Niemand muss
                  dreimal rufen.
                </Chalkboard>
              </div>
            </Stage>
          </Entry>

          {/* 11 */}
          <Entry
            n={11}
            name="Ribbon"
            fuer="Den Anfang eines Kapitels, wenn ein kleiner Aufkleber zu leise wäre."
            nichtFuer="Ganze Sätze und zwei Bänder untereinander."
          >
            <Stage>
              <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10 px-8">
                <div>
                  <Ribbon tone="cobalt">Ein Tag mit Ronki</Ribbon>
                  <VariantLabel>Kobalt</VariantLabel>
                </div>
                <div>
                  <Ribbon tone="sun" rotate={1.4}>
                    Ronkis Welt
                  </Ribbon>
                  <VariantLabel>Sonne</VariantLabel>
                </div>
              </div>
            </Stage>
          </Entry>

          {/* 12 */}
          <Entry
            n={12}
            name="MarkerHighlight"
            fuer="Zwei, drei Wörter in einem Satz. Der Strich läuft über den Zeilenumbruch mit."
            nichtFuer="Ganze Sätze. Was überall markiert ist, ist nirgends markiert."
          >
            <Stage>
              <div className="mx-auto max-w-xl">
                <p className="text-[1.15rem] leading-[2.1] text-ink">
                  Ronki erinnert, <MarkerHighlight>du begleitest</MarkerHighlight>. Am Anfang
                  begleitet der Drache intensiv, dann zieht er sich zurück, bis dein Kind seine
                  Routinen <MarkerHighlight tone="sky-wash">aus eigenem Antrieb</MarkerHighlight>{' '}
                  macht.
                </p>
                <p className="bb-display mt-8 text-[2rem] text-ink">
                  Ein Tag. Drei ruhige <MarkerUnderline>Routinen.</MarkerUnderline>
                </p>
                <VariantLabel>Oben: Marker. Unten: MarkerUnderline.</VariantLabel>
              </div>
            </Stage>
          </Entry>

          {/* 13 */}
          <Entry
            n={13}
            name="Stamp"
            fuer="Einen Zustand: frühe Version, kostenlos, geprüft. Ein Wort, schief gedruckt."
            nichtFuer="Werbeversprechen. Ein Stempel sagt, was ist, nicht was toll ist."
          >
            <Stage>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
                <div>
                  <Stamp tone="ember">Frühe Version</Stamp>
                  <VariantLabel>Glut, eckig</VariantLabel>
                </div>
                <div>
                  <Stamp tone="cobalt" shape="round" rotate={6}>
                    Kostenlos
                  </Stamp>
                  <VariantLabel>Kobalt, rund</VariantLabel>
                </div>
              </div>
              <p className="mt-6 text-center text-[0.9rem] text-ink/70">
                Glut-Stempel setzen ihr Wort in Tinte. Glut als Schrift auf Weiß ist gegen die
                Regel.
              </p>
            </Stage>
          </Entry>

          {/* 14 */}
          <Entry
            n={14}
            name="CrayonBarChart"
            fuer="Anteile an einem Ganzen. Ein Balken, zwei Farben, eine Handzeile darunter."
            nichtFuer="Verläufe über die Zeit, Vergleiche mit Achsen, jede zweite Diagrammart."
          >
            <Stage>
              <div className="mx-auto max-w-md rounded-[26px] border-[3px] border-ink bg-paper p-6 sm:p-7">
                <StickerLabel tone="sun" rotate={-3}>
                  So wird Ronki leiser
                </StickerLabel>
                <CrayonBarChart
                  className="mt-6"
                  rows={[
                    {
                      label: 'Woche 1',
                      caption: 'Ronki erinnert, lobt, begleitet',
                      parts: [
                        { value: 85, tone: 'sun' },
                        { value: 15, tone: 'cobalt' },
                      ],
                    },
                    {
                      label: 'Woche 6',
                      caption: 'Dein Kind macht es selbst',
                      parts: [
                        { value: 20, tone: 'sun' },
                        { value: 80, tone: 'cobalt' },
                      ],
                    },
                  ]}
                  legend={[
                    { tone: 'sun', label: 'Externe Begleitung' },
                    { tone: 'cobalt', label: 'Eigener Antrieb' },
                  ]}
                />
              </div>
            </Stage>
          </Entry>

          {/* 15 */}
          <Entry
            n={15}
            name="Doodle"
            fuer="Satzzeichen neben Text: ein Stern, ein Pfeil, ein Gekritzel. Farbe kommt vom Text daneben."
            nichtFuer="Ein Icon-Set. Ein Doodle erklärt nichts allein und ersetzt kein Wort."
          >
            <Stage>
              <ul className="grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-6">
                {DOODLE_NAMES.map((name, i) => (
                  <li key={name} className="flex flex-col items-center gap-2 text-center">
                    <Doodle
                      name={name}
                      size={40}
                      className={i % 3 === 0 ? 'text-cobalt' : i % 3 === 1 ? 'text-ink' : 'text-ember'}
                    />
                    <span className="text-[0.75rem] leading-tight text-ink/70">{name}</span>
                  </li>
                ))}
              </ul>
            </Stage>
          </Entry>

          {/* 16 */}
          <Entry
            n={16}
            name="DrawnLink und PillButton"
            fuer="Genau eine Aktion pro Seite trägt die Pille. Alles andere ist ein gezeichneter Link."
            nichtFuer="Links in Kästen. Ein Kasten verspricht Inhalt, ein Link führt weg."
          >
            <Stage>
              <div className="flex flex-col items-center gap-8">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <PillButton href="#baustein-16" size="lg">
                    Karte für euer Kind erstellen
                  </PillButton>
                  <PillButton href="#baustein-16" tone="outline" size="lg" arrow={false}>
                    Vorlage holen
                  </PillButton>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-8">
                  <DrawnLink href="/wissenschaft">Wissenschaftlicher Hintergrund</DrawnLink>
                  <DrawnLink href="/vorlagen" arrow={false}>
                    Alle Vorlagen ansehen
                  </DrawnLink>
                </div>
              </div>
            </Stage>
            <div className="mt-4">
              <Stage tone="night" className="flex flex-wrap items-center justify-center gap-6">
                <PillButton href="#baustein-16" tone="on-night">
                  Karte erstellen
                </PillButton>
                <DrawnLink href="/installieren" tone="white">
                  Wie installiere ich das?
                </DrawnLink>
              </Stage>
            </div>
          </Entry>

          {/* 17 */}
          <Entry
            n={17}
            name="Spread"
            fuer="Der Rahmen eines Abschnitts: Grund, Abstände, gerissene Kante, Aufkleber, Randnotiz."
            nichtFuer="Einzelne Elemente. Ein Spread ist eine Seite, kein Kasten in einer Seite."
          >
            <div className="overflow-hidden rounded-[18px] border-2 border-dashed border-ink/20">
              {/* Zwei Spreads untereinander, damit die gerissene Kante
               *  dazwischen sichtbar ist. Nachgebaut, damit die Demo
               *  keine echte Seite verändert. */}
              <div className="bg-white px-6 py-10">
                <StickerLabel tone="sky-wash" rotate={-3}>
                  Ronkis Welt
                </StickerLabel>
                <p className="bb-display mt-4 text-[1.6rem] text-ink">Dein Kind ist nicht allein.</p>
                <p className="mt-3 max-w-md text-[1rem] leading-relaxed text-ink/85">
                  Sieben Begleiter, die an den richtigen Momenten des Tages auftauchen.
                </p>
              </div>
              <div className="relative">
                <div className="relative bg-sky-wash px-6 pt-12 pb-10">
                  <svg
                    aria-hidden
                    focusable="false"
                    viewBox="0 0 1440 56"
                    preserveAspectRatio="none"
                    className="absolute left-0 right-0 -top-[30px] h-[52px] w-full text-sky-wash"
                    style={{ filter: 'url(#bb-tear)' }}
                  >
                    <path
                      d="M0 56 L0 22 C 120 34 232 18 356 28 C 470 37 590 20 708 30 C 838 41 940 22 1064 24 C 1200 26 1326 40 1440 28 L1440 56 Z"
                      fill="currentColor"
                    />
                  </svg>
                  <StickerLabel tone="white" rotate={-2}>
                    Wie ein Tag mit Ronki aussieht
                  </StickerLabel>
                  <p className="bb-display mt-4 text-[1.6rem] text-ink">Ein Tag. Drei Routinen.</p>
                  <HandNote rotate={-4} className="mt-5">
                    Drei kleine Listen, mehr nicht.
                  </HandNote>
                </div>
              </div>
            </div>
          </Entry>

          {/* ─────────── Regeln ─────────── */}
          <section id="regeln" className="scroll-mt-24 pt-4">
            <Ribbon tone="sun">Regeln</Ribbon>
            <ul className="mt-8 flex flex-col gap-8">
              <RulePair
                n={1}
                rule="Nie zwei gleiche Bausteine nebeneinander."
                falsch={
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1].map((i) => (
                      <div key={i} className="rounded-[18px] border-[3px] border-ink bg-white p-4">
                        <p className="font-display text-[0.95rem] font-bold text-ink">
                          Keine Werbung. Nie.
                        </p>
                        <p className="mt-1 text-[0.85rem] text-ink/80">
                          Ronki verdient kein Geld mit der Aufmerksamkeit von Kindern.
                        </p>
                      </div>
                    ))}
                  </div>
                }
                richtig={
                  <div className="flex flex-col gap-4">
                    <NotebookPage ruleHeight={28}>
                      <ul>
                        <ChecklistItem mark="check">Keine Werbung. Nie.</ChecklistItem>
                        <ChecklistItem mark="check">Keine Streaks.</ChecklistItem>
                      </ul>
                    </NotebookPage>
                    <TornNote rotate={1.5} className="w-[78%] self-end">
                      <p className="text-[0.85rem] leading-relaxed text-ink/85">
                        Kein Ersatz für dich. Ronki erinnert, du begleitest.
                      </p>
                    </TornNote>
                  </div>
                }
              />

              <RulePair
                n={2}
                rule="Links sehen nie aus wie Kästen."
                falsch={
                  <span className="inline-block rounded-[16px] border-[3px] border-ink bg-white px-5 py-3 font-display font-bold text-ink">
                    Wissenschaftlicher Hintergrund
                  </span>
                }
                richtig={<DrawnLink href="/wissenschaft">Wissenschaftlicher Hintergrund</DrawnLink>}
              />

              <RulePair
                n={3}
                rule="Ein Klebezettel pro Seite."
                falsch={
                  <div className="grid grid-cols-2 gap-3">
                    <StickyNote title="Dark Patterns" rotate={1.4} tape={false} curl={false}>
                      <span className="text-[0.85rem]">Tricks, die Kinder binden.</span>
                    </StickyNote>
                    <StickyNote title="Streaks" rotate={-1.4} tape={false} curl={false}>
                      <span className="text-[0.85rem]">Zähler, die reißen können.</span>
                    </StickyNote>
                  </div>
                }
                richtig={
                  <div className="mx-auto max-w-[240px]">
                    <StickyNote title="Dark Patterns" rotate={1.4}>
                      <span className="text-[0.85rem]">
                        Tricks, die Kinder binden. Haben wir weggelassen.
                      </span>
                    </StickyNote>
                  </div>
                }
              />

              <RulePair
                n={4}
                rule="Sonne und Glut nie als Text auf Weiß."
                falsch={
                  <p className="bb-display text-[1.5rem] text-sun">Ein Tag. Drei Routinen.</p>
                }
                richtig={
                  <p className="bb-display text-[1.5rem] text-ink">
                    Ein Tag. <MarkerHighlight>Drei Routinen.</MarkerHighlight>
                  </p>
                }
              />

              <RulePair
                n={5}
                rule="Handnotizen nur, wo Platz ist."
                falsch={
                  <div className="relative">
                    <p className="text-[0.9rem] leading-relaxed text-ink/85">
                      Kinder-Apps arbeiten oft mit externen Belohnungen: Punkte, Abzeichen,
                      Lootboxen. Das funktioniert kurzfristig, tötet aber die natürliche
                      Motivation.
                    </p>
                    <HandNote rotate={-6} className="absolute left-6 top-2 w-[150px]">
                      Steht so im Code.
                    </HandNote>
                  </div>
                }
                richtig={
                  <div className="flex items-start gap-4">
                    <p className="max-w-[60%] text-[0.9rem] leading-relaxed text-ink/85">
                      Kinder-Apps arbeiten oft mit externen Belohnungen. Das funktioniert kurz und
                      tötet die natürliche Motivation.
                    </p>
                    <HandNote rotate={-4} className="w-[130px] shrink-0">
                      Steht so im Code.
                    </HandNote>
                  </div>
                }
              />
            </ul>
          </section>

          {/* ─────────── Zusammen ─────────── */}
          <section id="zusammen" className="scroll-mt-24 pt-4">
            <Ribbon tone="cobalt">Zusammen</Ribbon>
            <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink/85">
              Zwei Beispiele, wie die Bausteine nebeneinander stehen, ohne dass etwas doppelt
              aussieht. Beide gibt es nur hier, auf keiner echten Seite.
            </p>

            {/* (a) */}
            <div className="mt-8">
              <p className="bb-hand text-xl uppercase leading-none text-cobalt">
                a. Die ehrliche Liste
              </p>
              <Stage tone="white" className="mt-4">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                  <NotebookPage>
                    <p className="bb-display text-[1.3rem] text-ink">Was wir weggelassen haben</p>
                    <ul className="mt-2">
                      <ChecklistItem mark="check">Keine Streaks, die reißen können.</ChecklistItem>
                      <ChecklistItem mark="check">Keine Werbung. Nie.</ChecklistItem>
                      <ChecklistItem mark="check">Keine Loot-Boxen.</ChecklistItem>
                      <ChecklistItem mark="check">Keine Push-Nachrichten.</ChecklistItem>
                    </ul>
                  </NotebookPage>

                  <div className="flex flex-col gap-7">
                    <TornNote rotate={1.8}>
                      <p className="font-display text-[1.02rem] font-bold text-ink">
                        Was Ronki nicht kann
                      </p>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/85">
                        Kein Ersatz für dich. Nicht jedes Kind springt drauf an. Manche brauchen
                        das Blatt Papier, nicht die App.
                      </p>
                    </TornNote>
                    <DrawnLink href="/wissenschaft" className="self-start">
                      Wissenschaftlicher Hintergrund
                    </DrawnLink>
                  </div>
                </div>
              </Stage>
            </div>

            {/* (b) */}
            <div className="mt-10">
              <p className="bb-hand text-xl uppercase leading-none text-cobalt">
                b. Die drei Schritte, abends
              </p>
              <div className="mt-4 rounded-[18px] bg-night px-5 py-10 sm:px-8">
                <div className="grid gap-9 lg:grid-cols-[1fr_0.85fr] lg:items-center">
                  <div className="flex flex-col gap-4">
                    <Ticket stub="1" ground="night">
                      <TicketLine title="Seite öffnen">
                        Öffne Ronki in Safari auf deinem iPhone.
                      </TicketLine>
                    </Ticket>
                    <Ticket stub="2" tone="sun" ground="night" rotate={0.9}>
                      <TicketLine title="Teilen antippen">
                        Tippe auf das Teilen-Symbol unten in der Leiste.
                      </TicketLine>
                    </Ticket>
                    <Ticket stub="3" tone="cobalt" ground="night" rotate={-0.7}>
                      <TicketLine title="Zum Home-Bildschirm">
                        Wähle „Zum Home-Bildschirm" und tippe auf „Hinzufügen".
                      </TicketLine>
                    </Ticket>
                  </div>

                  <div className="flex flex-col items-start gap-8">
                    <SpeechBubble tone="sun" tail="left" className="mb-4 max-w-[280px]">
                      Kein Store, kein Download, keine Anmeldung. Danach liegt Ronki auf dem
                      Startbildschirm.
                    </SpeechBubble>
                    <HandNote tone="sun" rotate={-4} icon="heart" className="origin-left">
                      Karte drucken, fertig.
                    </HandNote>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer closing={false} />
    </PainterlyShell>
  );
}
