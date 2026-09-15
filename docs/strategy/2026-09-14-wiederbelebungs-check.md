# Ronki Wiederbelebungs-Check (14. September 2026)

_Anlass: Marc hat in der Google Search Console echten Traffic gesehen und fragt, ob wir das Projekt wieder aufnehmen. Dieser Check ist die Bestandsaufnahme dazu. Rohdaten: `docs/analytics/gsc-2026-09-14/`._

## Kurzfassung

- Ja, es gibt Traffic, aber wenig: 15 Klicks und rund 1.400 Impressionen in 90 Tagen (13. Juni bis 12. September). Über die Hälfte der Impressionen ist Rauschen. Internationale Tippfehler-Suchen wie "kroki", "proki" oder "rknhoki" landen auf /en.
- Der wertvolle Kern: Google zeigt ronki.de für echte Elternprobleme. Der Artikel "Morgenroutine Grundschulkind" steht auf Seite 1 (Position 6,5) und holt die meisten Klicks. Seit dem 8. September (Schulstart) steigen die Impressionen: 224 in der letzten Woche gegen 106 in der Woche davor.
- Der Haken: Seit Ende Mai ist das Backend tot. Supabase hat das Projekt `jdpxfvqaoxmnyvlxikce` um den 25. Mai pausiert (7 Tage Inaktivität) und um den 23. August eingefroren. Der Host löst im DNS nicht mehr auf. Damit sind Profil-Karte erstellen, QR-Login, Cloud-Sync, Warteliste und Feedback-Formular auf der Live-Seite seit dreieinhalb Monaten kaputt. Jeder der 15 Klicks lief gegen eine verschlossene Tür.
- Folge: Wir wissen nicht, ob Eltern Ronki wollen. Die Frage "wiederbeleben?" lässt sich mit den heutigen Daten nicht beantworten. Sie lässt sich aber billig beantwortbar machen.

## Was die Search Console sagt

| Kennzahl (Web, 13.6. bis 12.9.2026) | Wert |
|---|---|
| Klicks | 15 (Deutschland 11, Schweiz 2, USA 1, Chile 1) |
| Impressionen | 1.403 (Mobil 879, Desktop 511, Tablet 13) |
| Klicks pro Monat | Juni (ab 13.) 1, Juli 1, August 9, September (bis 12.) 4 |
| Impressionen letzte 7 Tage / 7 Tage davor | 224 / 106 |

Seiten, die arbeiten:

| Seite | Klicks | Impressionen | Position |
|---|---|---|---|
| /ratgeber/morgenroutine-grundschulkind | 5 | 75 | 6,5 |
| / | 4 | 92 | 6,6 |
| /en | 2 | 788 | 7,0 (fast nur Ausland, Tippfehler-Suchen) |
| /ratgeber/abendroutine-grundschulkind | 1 | 138 | 38 |
| /fuer-eltern | 1 | 131 | 51 |
| /ratgeber/morgen-troedeln | 0 | 96 | 31 |

Suchanfragen mit echter Absicht (alle bisher ohne Klick):

| Anfrage | Impressionen | Position |
|---|---|---|
| abendroutine kleinkind | 26 | 49 |
| kleinkind trödelt morgens | 20 | 21 |
| kind trödelt | 18 | 42 |
| abendroutine kinder, abendroutine für kinder, kinder abendroutine | 35 | 87 bis 93 |
| morgenroutine vorlage | 3 | 29 |
| abendroutine vorlage | 2 | 10,5 |
| morgenroutine kinder vorlage | 1 | 10 |

Lesart: Der Morgen-Cluster funktioniert. Der Abend-Cluster rankt schlecht (Seite 5 und tiefer). Die Vorlagen-Anfragen sind nah an Seite 1, hinter den Vorlagen-Seiten steckt aber kein PDF-Download.

## Stand der Bausteine

**Website (ronki.de).** Live auf Vercel, letzter Production-Deploy 3. Mai 2026 (Commit 2fa8ab5). Launch-State `public-alpha`, CTA "Ronki ausprobieren" führt auf app.ronki.de. 9 Ratgeber-Artikel (1.400 bis 2.600 Wörter), 3 Vorlagen-Seiten, 4 Tools. Plausible-Analytics läuft über Marcs Account und wurde hier nicht ausgelesen. /profil-erstellen existiert, steht aber nicht in der Sitemap und hat keinen direkten CTA von der Startseite.

**App (app.ronki.de).** Live auf Vercel, gleicher Stand vom 3. Mai. Startbildschirm "Hast du eine Karte?": QR scannen oder Eltern zu ronki.de/profil-erstellen schicken. Die Meta-Description im Bundle ist veraltet ("Held, Katze und täglichen Quests"). Die Juli-Commits (v2-PRD, Doku-Sortierung, Ferienmodus) liegen nur auf `experiment/drachennest` und sind reine Doku. Production kennt sie nicht. Die v2-Ausführung hat nie begonnen.

**Backend (Supabase).** Projekt Ronki (`jdpxfvqaoxmnyvlxikce`): Pausierungswarnungen am 15. und 24. Mai, pausiert ab etwa 25. Mai, Einfrier-Warnung am 18. August ("85 Tage pausiert, in 5 Tagen endgültig eingefroren", Mail ungelesen), heute kein DNS-Eintrag mehr. Laut Supabase-Mail lässt sich das Projekt nicht mehr reaktivieren, die Daten lassen sich aber noch herunterladen. Beide Live-Bundles (Website und App) haben genau diesen Host einkompiliert.

Was der Code braucht und was im Repo als SQL liegt:

| Tabelle oder Funktion | Genutzt von | SQL im Repo |
|---|---|---|
| waitlist, waitlist_count(), update_waitlist_screener() | Website | Tabelle ja, beide RPCs nein |
| site_feedback | Website | nein (Spalten in CLAUDE.md) |
| profiles (token-keyed RLS) | Website und App | nein (Spec in docs/specs/qr-profile-auth.md) |
| game_state, telemetry_events | App | ja |
| feedback | App | nein (Spalten in CLAUDE.md) |
| app_evals, View app_eval_counts | Website (App-Check) | nur in docs/superpowers/specs/2026-04-25-dark-pattern-scanner-design.md |

Wiederaufbau: neues Supabase-Projekt, Schema aus Migrationen plus CLAUDE.md plus Specs, Env-Vars in beiden Vercel-Projekten, Redeploy. Schätzung: ein Abend. Wartelisten-Mails und Profile vorher aus dem eingefrorenen Projekt herunterladen, solange das geht.

**Hygiene.** Der gh-pages-Branch löst bei jedem Push fehlgeschlagene Vercel-Builds aus (Branch in den Vercel-Projekteinstellungen ignorieren). Sitemap ohne /profil-erstellen. Der Test-Browser konnte die mobile Hero-Animation nicht abschließend prüfen (Tab lief versteckt, Animationen standen); am Desktop rendert alles. Einmal auf dem Handy gegenchecken.

## Was das für die Entscheidung heißt

Die Frage ist nicht "v2 bauen oder nicht". Die v2-PRD (3 Phasen, 30-Familien-Beta) ist Wochen an Abendarbeit, und die Abende gehören gerade EFG. Die Frage ist: Was ist der billigste Test, der zeigt, ob fremde Eltern das wollen? Dieser Test war die letzten dreieinhalb Monate unmöglich, weil die Tür zu war. Und jetzt ist Schulstart, die Saison, in der Google die Seite gerade hochzieht.

Vorschlag, in dieser Reihenfolge, jeder Schritt für sich nützlich:

1. **Tür aufmachen (1 Abend).** Daten aus dem eingefrorenen Supabase-Projekt herunterladen. Neues Projekt, Schema einspielen, Env-Vars in Vercel `ronki` und `ronki-app` setzen, Redeploy von main. Danach einmal selbst eine Karte erstellen und in der App scannen.
2. **Messen (1 Abend).** Plausible-Ziele: CTA-Klick, Karte erstellt, App geöffnet. Supabase: Zähler auf profiles. Startseiten-CTA für Eltern direkt auf /profil-erstellen, Seite in die Sitemap.
3. **Dort nachlegen, wo Google schon anbeißt (2 bis 3 Abende, optional).** Morgenroutine-Artikel für die Schulstart-Saison aktualisieren. Abendroutine-Artikel überarbeiten (rankt auf Seite 5). Vorlagen als PDF-Download. Artikel "Kind trödelt morgens" von Position 21 auf Seite 1 schieben. Interne Links zwischen Ratgeber, Vorlagen und Profil-Karte.
4. **Nach 30 Tagen entscheiden.** Schwelle vorher festlegen, Vorschlag: mindestens 10 fremde Familien mit erstellter Karte. Darüber: v2 Phase 1 (Funnel-Fix) starten. Darunter: Website als Content-Asset laufen lassen, App einfrieren, kein v2.

Nicht gemacht: nichts am Code geändert, nichts deployt, nichts committet. Dieser Check, die CSV-Kopie und der HANDOFF-Eintrag sind die einzigen Änderungen im Repo.

## Quellen

- Search Console Export: `docs/analytics/gsc-2026-09-14/` (Suchtyp Web, letzte 3 Monate, exportiert 14.9.2026)
- Supabase-Mails an marc.foerste@googlemail.com: 15. Mai und 24. Mai ("Your Supabase Project Ronki is going to be paused"), 18. August ("Your paused Supabase project is being permanently frozen soon")
- Vercel Team iamyaws-projects: Projekte `ronki` (prj_MEiuD7qUKzFNqhRwcr5nw9dps48K) und `ronki-app` (prj_MyD9RtQR9siqB5InkwtLVzpAM333), letzte Production-Deploys 3. Mai 2026
- Live-Bundles: www.ronki.de/assets/index-CBsCUO8p.js und app.ronki.de/assets/index-DAc7hKam.js, beide mit dem eingefrorenen Supabase-Host
- Repo: HANDOFF.md, docs/prd/RONKI-V2-PRD.md, website/src/config/launch-state.ts, website/src/routes.tsx
