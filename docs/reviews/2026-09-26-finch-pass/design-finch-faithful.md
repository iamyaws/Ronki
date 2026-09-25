# Finch pass, design lane: Finch-faithful (26 Sep 2026)

_Angle: map every Finch mechanic that passes PRD section 6 as closely as a six-year-old allows, and add what a pre-reader needs. Sources read: feature census (26 Sep), Finch teardown (25 Sep), own-read-spar, Astra spar, PRD v2 sections 1 to 7, NORTHSTAR, repo CLAUDE.md, HANDOFF top, Bilderbuch surface map, plus spot checks in `App.jsx`, `TaskContext.tsx`, `RonkisTag.jsx`, `helpers.ts`, `constants.ts`, `MoodChibi.jsx`, the voice scripts and `public/art/bilderbuch/`. No new art is needed: every picture below exists today._

## 1. The product and the loop in three sentences

Ronki is a small dragon who hatches from an egg the child picks, learns to breathe fire from the child, and then lives the child's school day alongside them. Every morning task warms his fire, and a warm fire sends him off on a trip while the child is at school; at evening routine time he is back in the nest with a treasure and a short spoken story, and the evening tasks carry him to bed with a promise about tomorrow's trip. Each trip is one adventure, adventures make him grow, and nothing ever shrinks, breaks or runs out.

### 1.1 Finch's ten mechanics, mapped

| # | Finch | Ronki tonight | What replaces what Ronki cannot do |
|---|---|---|---|
| 1 | Invest before friction | Egg shelf is the first screen for everyone; the parent comes in only after the name, called by Ronki himself | Card link stays, as a quiet line for parents |
| 2 | Care inversion | Tasks light Ronki's fire (FireBowl), not a score for the child; no Sterne on home | |
| 3 | The pet talks and asks | Ronki asks the child's name, asks to be taught fire, asks for each task in his voice | Finch's typed "your name": a pre-reader cannot type, so Ronki sends the child to fetch a parent. The ask becomes the handoff |
| 4 | Suggestion first | Name chips (shipped), routine pictures pre-ticked for the parent, face tiles for mood | |
| 5 | One loop, one meter, one screen | Nest = Ronki + FireBowl + one big "Jetzt" card + small task row; two tabs | |
| 6 | Cold start solved | Day 1 fire starts half warm "vom Pusten"; an afternoon install sends Ronki off at once | |
| 7 | The appointment | Trip until evening start (day trip) or breakfast (dream trip); the nest is empty while he is out | Sun and moon path instead of a countdown clock |
| 8 | Growth in adventures, next step visible | `adventureCount` feeds `catEvo`; stepping stones plus a spoken "Noch zwei Abenteuer" | Stones, not "1/7" |
| 9 | Forgiving | "Heute nicht" on every task, trips wait forever, warm return lines, no worried face after absence | |
| 10 | Pride of ownership | Ronki's passport, the treasure shelf, five growth looks | Finch's shop and dress-up stay out (currency and rerolls fail section 6) |

Finch pieces that stay out: streaks and repairs, the shop, stones, rerolls, email, paywall, the self-diagnosis questions. Finch's notification ("From Peaches: I believe in you") is replaced by the parent: the setup screen tells them "Sagt einfach: Schau mal, ob Ronki zurück ist." No push is built.

Pre-reader layer on top of Finch: every kid line is spoken by Ronki (tap the bubble to hear it again), every task is a picture, time is sun and moon, counts are stones, one loud action per screen.

## 2. First session script

### 2.1 Family with no card (tablet, fresh install)

Voice ids are base ids played through `VoiceAudio.playLocalized(id)` (file `public/audio/ronki/de_<id>.mp3`). "new" = recorded tonight (section 11). Seconds are what the child waits or does.

| # | Screen | Child sees | Child taps | Ronki says (German) | Voice | Sec |
|---|---|---|---|---|---|---|
| 1 | Approach (MeetRonki) | Room loop, "Da hinten leuchtet etwas." Quiet parent line at the bottom: "Ich habe schon eine Karte" | nothing | silent (pre-hatch) | none | 3.6 |
| 2 | Egg shelf | Four eggs, "Welches Ei fühlt sich richtig an?" | one egg | | none | ~5 |
| 3 | Wobble, hatch | Egg trembles, per-egg clip cracks it | nothing | | none | 6.4 |
| 4 | Meet | Ronki peeks out | nothing | "Hallo. Ich hab auf dich gewartet. Glaub ich." | `meet_hello_01` | 4.5 |
| 5 | Name | Six voiced chips, "so soll er heißen" | chip, pill | "Hm, wie soll ich heißen?" | `meet_namequest_01`, `name_chip_*` | ~8 |
| 6 | Ask the name (new, replaces the old close) | Ronki big, bubble "Ich bin {Nick}! Und wie heißt du?" then "Das kann ich noch nicht lesen. Holst du mal Mama oder Papa?"; sun pill "Mama oder Papa ist da" | pill | both lines | `meet_askname_01`, `meet_getparent_01` (new) | ~7 |
| 7 | **Parent comes in**: Kurz einrichten (CombinedParentSetup, rebuilt) | Parent screen, see 2.2 | parent types and taps | none (parent register, text only) | none | ~45 |
| 8 | Handoff back | "Fertig! Jetzt bist du dran." sun pill "Los geht's" | pill | "Jetzt bist du wieder dran!" | `handoff_back_01` (new) | 3 |
| 9 | Ronki knows you | Ronki waves, the child's name big in `.bb-display`: "Hallo {Kind}!" | anywhere, pill visible at once | "Jetzt kenn ich dich. Schön!" | `meet_nowiknow_01` (new) | 3 |
| 10 | First breath (TeachBreathBeat, sky ground) | "Der erste Funke", hold button | hold, release | round 1 always ends with a spark, never "zu kurz": "Oh, ein Funke! Nochmal. Ganz lange Luft holen." | `teach_fire_spark_01` (new, replaces `teach_fire_smoke_01`) | ~8 |
| 11 | First breath, round 2 | Big flame | hold, release | "Jaaa! So geht's!" then "Das hast du mir gezeigt. Das vergess ich nie." | `teach_fire_celebrate_01`, `teach_fire_learned_01` (new) | ~7 |
| 12 | FirstDayIntro 1 (new screen, white ground) | Ronki beside the FireBowl, half the flames lit | anywhere | "Schau, mein Feuer. Vom Pusten ist es schon halb warm." | `fd_fire_half_01` | 4 |
| 13 | FirstDayIntro 2 | Picture row: full fire, Ronki on his cloud (`loops/ronki-cloud.webp`), a gift doodle | anywhere | "Wenn es ganz warm ist, flieg ich los. Und ich bring dir was mit." | `fd_fire_trip_01` | 5 |
| 14 | Day 1 card | Paper card, sun sticker, Ronki cheer: "Heute ist unser erster Tag!" and the time line (below) | sun pill "Los geht's" | "Heute ist unser erster Tag!" + one of the three start lines | `fd_day1_01` + `fd_start_*` | 4 |
| 15 | Nest, first open | Home as in section 3; the Jetzt slot first shows six face tiles | one face or "später" | "Wie geht's dir heute?" then the matching reply | `mood_ask_01` (new), `mood_*_01` (exist) | ~6 |
| 16 | First task | Big picture of the next task, sun pill "Geschafft" | pill | the task ask, e.g. "Zähne putzen! Ich hör so gern die Bürste." | `task_teeth_pm` (new) | real time |

The start line on screen 14 depends on the clock (section 4 defines the blocks):
- Morning (before 11:00, 12:00 on weekends): "Machen wir zusammen den Morgen?" (`fd_start_morning_01`). Home shows the morning fire, half lit.
- Day (11:00 to the evening start): "Ich flieg jetzt gleich los. Wenn es Abend wird, bin ich wieder da." (`fd_start_day_01`). Home opens straight on the DepartureSheet: the first trip leaves on day 1, as in Finch.
- Evening (after the evening start): "Machen wir zusammen den Abend? Dann schlaf ich gut." (`fd_start_evening_01`). Home shows the bedtime fire, half lit.

Time from the first tap to the first task picture: about 2:15, of which the parent holds the tablet about 45 s. First win (the hatch) arrives at 15 s, the first shared success (the flame) at about 1:30.

### 2.2 What the parent is asked (screen 7, one scroll, about 45 s)

Headline "Kurz einrichten" and a line "Ronki hat nach dem Namen gefragt. Das hier dauert eine Minute." Then, in order:
1. "Wie heißt euer Kind?" field "Vorname" (required; the only typing).
2. "Ronkis Morgen" and "Ronkis Abend": the task pictures with names, each a toggle tile. New families get 5 morning pictures on (Aufstehen, Frühstück, Zähne, Anziehen, Schultasche) and Wasser, Waschen off; 4 evening pictures on (Zähne, Waschen, Pyjama, Vorlesen) and Abendbrot off. Line: "Jede Aufgabe macht Ronkis Feuer wärmer. Weniger ist am Anfang mehr."
3. "Wann fängt bei euch der Abend an?" chips 17:00 (default), 17:30, 18:00, 18:30. Line: "Dann kommt Ronki von seiner Reise zurück."
4. PIN for the parent area (existing, optional) and "Anonyme Nutzungsdaten teilen?" (existing, default off).
5. One tip line, no sheet: "Legt Ronki auf den Home-Bildschirm. Sagt eurem Kind morgens und abends einfach: Schau mal, ob Ronki zurück ist."
6. Quiet link "Habt ihr schon eine Karte von ronki.de? Karte scannen" (opens the scan sheet, 2.3).

Sun pill "Zurück zu {Kind}" (disabled until a name). On tap: the existing payload (`parentOnboardingDone`, PIN, consent, `familyConfig.childName`), plus `familyConfig.routine` and `familyConfig.eveningStart`, plus the existing fresh token and `claimLocalProfile`. Buffered funnel events flush or drop with the consent choice (section 8).

### 2.3 Delta: family with a QR card

The load path does not change: `?p=` or a scan stores the token, `syncLoadByToken` pulls the website seed (`parentOnboardingDone`, `parentHandoffBackSeen`, `childName`, PIN, consent), the chain lands on MeetRonki. Differences from 2.1:
- The scan is reached from the quiet line on screens 1 and 2 ("Ich habe schon eine Karte") instead of a landing wall. The scan sheet is today's NoProfileLanding scan mode, restyled, with a kid-readable error "Die Kamera schläft noch. Hol mal Mama oder Papa." (`scan_camera_sleep_01`, new) and a parent field "Profil-Code oder Link einfügen" that calls `setActiveToken` and reloads, so a denied camera no longer ends the flow (PRD 5.3).
- Screen 6 becomes "Ich bin {Nick}! Und dich kenn ich schon. Mama oder Papa haben mir von dir erzählt." (`meet_knowname_01`) with the name big and a sun pill "Ja, das bin ich" which plays "Schön, dass du da bist!" (`meet_yes_01`). Screens 7 and 8 are skipped (the seed has both flags); screen 9 is skipped too.
- The routine is not asked; `familyConfig.routine` is absent, so the child gets the full default list of the old code until a parent edits it in the dashboard. `eveningStart` defaults to 17:00.
- Share link opened directly: same as above without the scan, about 8 taps to the first task.

### 2.4 Delta: returning child on a second device

- Parent opens the dashboard on the first device ("Profil & Geräte": share link, QR, print card; all exist) and opens the link on the new tablet, or scans the card from the quiet line on screen 1. The cloud row is onboarded, so the gate goes straight to the Nest: return beat as after a gap (section 3.5), same Ronki, same treasures.
- If the child hatched an egg first and the parent scans afterwards (from screen 7): the cloud row is onboarded, so it wins and the local hatch is dropped silently (PRD 5.1). The child sees their own Ronki with "Da bist du ja wieder! Schön." Nothing of the cloud save changes.
- If the cloud row exists but is not yet hatched (a card made on the website, scanned after a local hatch): the local `companionName`, `companionVariant` and `kidIntroSeen` are carried into the seed, so the child keeps the dragon they just met (section 9.3, Lane B test).

## 3. The home screen after onboarding (Nest)

One screen, top to bottom: header ("Hallo {Kind}!", face button, small parent lock), the room scene with Ronki and his bubble, the FireBowl in the lower right corner of the scene, the one loud card (the Jetzt card, or the trip or treasure card), a small row of task pictures, the shelf with the last three treasures, one quiet link. Bottom nav: **Nest** and **Ronki**. Nothing else.

Gone from home: "Heute auf der Schriftrolle", the Morgens / Nachmittag / Abends tiles, "Spielzeug", "Karte", the "Ronki ist bereit" sun card, the six rotating bubble lines, the random praise toast, tab unlock toasts, the automatic friend ceremonies, the victory takeover, the kid-tappable "DE ▸ EN" and "Rückmeldung" in the Alpha banner.

The bubble always carries a context line from section 11 and is spoken once on arrival; tapping it replays it. Tapping Ronki keeps today's hearts and `room_tap_*` voice.

### 3.1 Morning (Ronki home, fire building)
- Loud: the **Jetzt card**: the next undone task picture at 120 px, its name in small type, the sun pill "Geschafft", the quiet link "Heute nicht". It speaks the task ask on appear (`task_<kind>`).
- First open of the day: the Jetzt slot shows the six face tiles first ("Wie geht's dir heute?", `mood_ask_01`); a face or "später" hands the slot to the task. The face button in the header opens the same tiles at any time of day.
- FireBowl: one flame per task of the block, lit ones drawn filled. A done task lights the next flame with the existing 1.4 s cheer and a crackle (`sfx_complete`); no toast, no number.
- Task row: small pictures of the block; done ones carry a flame sticker; tapping one makes it the Jetzt card (does not complete it).
- Quiet link: "Bei Ronki sitzen".
- Fire full: Ronki cheers, "Mein Feuer ist ganz warm! Jetzt kann ich losfliegen." (`fire_full_morning_01`), then the **DepartureSheet**: Ronki on his cloud over `scenes/morgenwald.webp`, the sun-to-moon path with a marker at "now", the stepping stones to the next look with the spoken count (`grow_left_*`), one sun pill "Tschüss, {Nick}!". On tap: "Tschüss! Jetzt geht dein Tag los. Viel Spaß in der Schule!" (`trip_bye_school_01`; weekends and holidays `trip_bye_free_01`), Ronki floats up out of the frame, the room stays empty. That is the end beat of the morning session.

### 3.2 While Ronki is away
- Scene: the empty room loop (`loops/zuhause.mp4`, no cut-out), no bubble.
- Loud: the **AwayCard**, a paper postcard with `ronki/cloud.webp` and the sun-to-moon path; tapping it plays "Ich bin unterwegs. Wenn es Abend wird, bin ich wieder da." (`away_day_01`) and opens the existing RonkiAwayLoop for a short look.
- Afternoon tasks (`s_move`, Mon/Wed `ft`) show as a Jetzt card without fire.
- Day 1 extra: the morning tasks not needed for the half fire stay in the row with "Mach ruhig weiter" as the card's line (parent value: the whole morning).

### 3.3 At his return (state `waiting`, detected anywhere in the app)
- Scene: Ronki back in the room (`ronki/wave.webp`), StickerBurst, "Ich bin wieder da! Ich hab dir was mitgebracht." (`trip_back_01`).
- Loud: the wrapped treasure card (gift doodle, sun paper), pill "Aufmachen". Opens **TreasureReveal**: the treasure large on paper over the Morgenwald scene, its name, the spoken story (`trip_story_NN`, 2 to 3 sentences, text shown in `.bb-display`), sun pill "Ins Regal stellen" ("Das stellen wir ins Regal.", `treasure_shelf_01`). The treasure flies to the shelf; the adventure counts.
- If a stage is crossed: **GrowthBeat** right after (section 5).
- Then the evening Jetzt card, or, before the evening start, Ronki simply stays in the nest.

### 3.4 Evening
- Same layout as the morning with the bedtime tasks. The TonightRitual night card is always present as a quiet link ("Heute Abend mit {Nick}"), never gated.
- Fire full: "Mein Feuer ist warm. Jetzt werd ich müde. Kommst du mit ans Fenster?" (`fire_full_evening_01`); the loud card becomes the night paper card with the sun pill "Gute Nacht, {Nick}" into TonightRitual.
- TonightRitual keeps its flow and its 10 bedtime lines, adds tomorrow's hook before the curtain ("Morgen flieg ich zum Bach.", `trip_hook_NN` of the next trip), writes `eveningRitualCompletedAt`. If there was no trip today, the hook is replaced by "Heute Nacht flieg ich im Traum los. Zum Frühstück bin ich wieder da." (`night_trip_01`) and the dream trip starts on close.
- After TonightRitual: the Nest shows `scenes/nacht.webp` with Ronki asleep; tapping plays "Chrrr. Ich träum grad was Schönes." (`away_sleep_01`). No card. Session over.

### 3.5 After 1 day and after 5 days away
Nothing is lost and nothing looks different except the greeting. The return line is picked from `lastGapDays` (section 9):
- Normal next day: "Guten Morgen! Ich hab von dir geträumt." (`greet_day_01`, before 11:00) or "Hallo! Schön, dass du da bist." (`greet_day_02`).
- 2 to 4 days: "Da bist du ja wieder! Schön." (`return_short_01`).
- 5 days or more: "Da bist du ja! Ich freu mich so, dass du wieder da bist." (`return_long_01`).
- A trip that was out is simply back (`waiting`): the treasure card is the loud item, with its story; it never expires.
- Ronki shows happy, never worried or sad on a return day (the `besorgt` trigger is removed, and the scheduled bad day is pushed by one day when `lastGapDays >= 2`).
- The fire is today's fresh block; the adventure count is where it was.

## 4. The loop engine

### 4.1 Blocks of the day (pure function `blockAt(now, cfg)` in `src/loop/dayPhase.ts`)

| Block | From | To | Fire |
|---|---|---|---|
| `morning` | 04:00 | 11:00 weekdays, 12:00 Sat/Sun and holidays | main quests with `anchor: 'morning'` |
| `day` | morning end | `familyConfig.eveningStart` (default 17:00) | none (afternoon tasks shown without fire) |
| `evening` | eveningStart | 04:00, or until TonightRitual is done today | main quests with `anchor: 'bedtime'` |
| `night` | TonightRitual done today (`eveningRitualCompletedAt` is today) | 04:00 | none |

Fire (`fireFor(state, now)` in `src/loop/fire.ts`): slots = main quests of the block (never side quests), filtered by `familyConfig.routine` when present. `lit = done + skipped`. `full = lit === slots.length && done >= 1`. Day 1 bonus (`onboardingDate === today && adventureCount === 0`): `floor(n / 2)` flames start lit, so `full` needs `ceil(n / 2)` tasks.

### 4.2 Trip states (existing `expedition.state`, extended)

| State | Meaning | Nest shows | Leaves when |
|---|---|---|---|
| `home` | Ronki in the nest | fire, Jetzt card | morning fire full and `lastTripDate !== today` → `departTrip('day')`; day-1 day block → `departTrip('day')` on "Tschüss"; TonightRitual closed with no trip today → `departTrip('night')` |
| `away` | on a trip (`kind` day or night) | AwayCard (day) or sleeping Ronki (night) | `now >= returnAt` → `arriveTrip()` |
| `waiting` | back with a treasure | treasure card | kid taps "Ins Regal stellen" → `receiveTreasure()` → `home` |
| `leaving` | legacy only | never shown | migrated to `home` on load |

Timings:
- Day trip: `returnAt = today at eveningStart`; day 1 afternoon: `max(eveningStart, now + 45 min)`.
- Night trip: `returnAt = tomorrow 05:00`, so it is back before any breakfast open.
- `departTrip` sets `lastTripDate = today`, picks `TRIPS[tripCursor % 14]`, stores `expedition.tripId` and the treasure as `pendingMemento` (with `tripId`), fires `expedition.start {kind}`. It no-ops unless state is `home`.
- `arriveTrip` is called by `useTripClock` (mounted once in AppContent): on load, on `visibilitychange`, and every 30 s. It no longer needs Expedition to be mounted.
- `receiveTreasure` (replaces `receiveMemento`, same guard): pushes to `expeditionLog` (cap raised from 24 to 60), adds `tripId` to `treasuresFound`, `adventureCount += 1`, `tripCursor += 1`, `catEvo = max(catEvo, 3 + adventureCount)`, fires `memento.received`, and `ronki.evolve` when the stage index grows. Double taps are idempotent (no `pendingMemento`, no count).
- One trip per calendar day, so at most one adventure per day. The waiting treasure blocks the next departure: if the fire fills while a treasure is unopened, the treasure card comes first and ends with the departure.

### 4.3 The cases

- **Weekends**: same shape; `buildDay` already drops `s_packcheck`; the morning block runs to 12:00; the send-off says `trip_bye_free_01`. Ronki is out all afternoon on a weekend too; the AwayCard is the only thing to see, which is the point.
- **School holidays**: the parent toggles "Ferien" in the dashboard (existing `vacMode`, now with a writer), from the next day `VACATION_QUESTS` are used, morning ends at 12:00, send-off line is the free one. The idea board of PRD 11 is not built tonight.
- **Install at 19:30**: evening block, fire half lit, 2 or 3 bedtime tasks, fire full, "Gute Nacht", TonightRitual with `night_trip_01`, dream trip. Next morning: "Guten Morgen! Heute Nacht bin ich im Traum geflogen. Schau mal!" (`trip_back_night_01`), treasure, first adventure. The morning fire then fills as normal, but `lastTripDate` is yesterday, so a day trip also runs today. That is two trips in the first 24 hours and one per day after, which is Finch's day-1 generosity.
- **A child who opens only in the evening**: no morning fire ever; every evening the fire fills, TonightRitual sends Ronki on a dream trip, the treasure waits for the next evening (it came back at 05:00). One adventure a day, same growth speed.
- **A child who never finishes the morning**: at the end of the morning block the unfinished morning tasks leave the row silently; Ronki stays home in the day block with "Heute bleib ich im Nest. Heute Abend machen wir mein Feuer warm." (`home_stay_01`); the evening fire can still send him on a dream trip. No sad face, no "missed".
- **Nothing done all day**: TonightRitual is still one tap away; Ronki sleeps at home; no trip, no credit, no trace tomorrow.
- **All tasks set aside with "Heute nicht"**: the fire needs one done task, so the bowl shows the last flame waiting; the Jetzt card says "Eine Sache machen wir noch zusammen?" (text only, reuses the task ask for the voice).
- **Clock oddities**: all day math on local `YYYY-MM-DD` strings (the existing DST-safe helper), `returnAt` as ISO; midnight inside a trip changes nothing; a device clock set back cannot un-return a trip (`waiting` is sticky).

## 5. Growth

- **What counts**: one adventure per opened treasure. Nothing else: not tasks, not days, not games. Adventures never go down.
- **catEvo**: `catEvo = max(stored, 3 + adventureCount)` against the existing `CAT_STAGES` thresholds (3, 9, 18, 30, 45). Stage 2 after 6 adventures (about a school week and a half), stage 3 after 15, stage 4 after 27, stage 5 after 42. Old saves at 3 stay 3; `adventureCount` is backfilled from `expeditionLog.length`, so a child who already brought treasures home grows at once and sees one GrowthBeat.
- **How a pre-reader sees the next step**: a path of stepping stones from the current look to a soft silhouette of the next look (6, 9, 12 and 15 stones for the four spans). Filled stones are behind him. It shows on the DepartureSheet, after every TreasureReveal, and on the passport. Ronki says the count: `grow_left_1` "Nur noch ein Abenteuer, dann werd ich größer!", `grow_left_2`, `grow_left_3`, and `grow_left_more` for four and up. No numbers for the child; the parent dashboard shows the number.
- **GrowthBeat**: the old look crossfades into the new one on paper, StickerBurst, one line, one pill "Weiter". Shown once per stage (`stageSeen`).
- **What each stage unlocks, looks only** (all art exists):

| Stage | Adventures | Look (file) | Ronki says |
|---|---|---|---|
| 1 Baby | 0 | `ronki/baby*.webp`, shell hat in the egg colour | |
| 2 Jungtier | 6 | shell hat off, `ronki/calm.webp` with all mood faces and the idle loop | "Schau mal! Meine Eierschale ist ab!" (`grow_stage_2`) |
| 3 Stolz | 15 | stands up: `ronki/proud.webp` as the calm art of stage 3 (one-line map change in MoodChibi, so stages 2 and 3 no longer look the same) | "Schau mal! Ich kann jetzt richtig stehen!" (`grow_stage_3`) |
| 4 Heranwachsend | 27 | small wings, `ronki/grown.webp` | "Schau mal! Ich hab Flügel!" (`grow_stage_4`) |
| 5 Legendär | 42 | big wings, `ronki/legendary.webp` | "Schau mal, wie groß ich bin! Das haben wir zusammen geschafft." (`grow_stage_5`) |

Growth never changes what Ronki can do, what the child may do, or how many tasks there are.

## 6. Ronki's page (the passport)

New `RonkiPassport.jsx` on the **Ronki** tab, open from day 1 (no unlock). White ground, paper stickers, one scroll, no segments, no drawer:
1. Ronki large in his current look and mood; tap plays "Das bin ich! Und das alles haben wir zusammen gemacht." (`passport_hello_01`). His name in `.bb-display`; below it "Der Freund von {Kind}".
2. Stickers (count-ups only): "{d} Tage alt" (days since `onboardingDate`, plus one), "{a} Abenteuer", "Kann Feuer pusten. {Kind} hat es ihm gezeigt." (from `taughtSignature`), "Aus dem {Farbe} Ei" (from `companionVariant`).
3. The stepping stones to the next look (section 5).
4. "Ronkis Schatzregal": the treasures found so far, emoji on small paper tiles, with the place underneath. Tap one: its story plays again (`trip_story_NN`). Only found treasures show; no empty slots and no "7 von 14", so there is nothing to catch up on.

It replaces RonkiProfile on the tab: the mood window, the Über / Details / Stärken drawer with the always-zero "Tage zusammen", the EvolutionTree with "Noch {n} Aufgaben bis hier", the Freunde and Feuer segments. RonkiProfile.jsx stays in the code behind `FEATURES.legacyProfile`.

## 7. Cut list

Switches live in the new `src/config/features.ts` (code defaults) plus one parent toggle "Extras" in the dashboard (`extrasEnabled`, default off for every save, Louis included; Marc can turn it on for Louis in ten seconds). "Extras" brings back Tagebuch, Laden and Spielzeug together.

| Surface (census 3) | Ruling | Reason |
|---|---|---|
| Nest (RoomHub) | keep, rebuilt | it is the one screen |
| Heute tab (RonkisTag) | hide, `FEATURES.dayStrip` | its job moves to the Jetzt card and task row; two surfaces for one list confuse |
| Ronki tab (RonkiProfile) | hide, `legacyProfile`; tab shows the passport | passport is the pride screen |
| Tagebuch (Journal) | hide, Extras | long free-text surface, re-locks daily; feelings stay via the face button |
| Laden (Belohnungsbank, redeem modal, old TopBar, SpendEffect) | hide, Extras | a currency shop pulls toward bargaining; it also held the only parent entry, which moves to the Nest |
| Bei Ronki sitzen | keep, quiet link while Ronki is home | calm presence, pillar 1 |
| Expedition screen (Karte, Naturtagebuch, DiaryModal) | hide, `FEATURES.expeditionMap` | departure and return now happen in the nest |
| RonkiAwayLoop | keep, from the AwayCard | the peek at the trip |
| CaveStyleSheet | stays hidden | nothing paints it yet |
| Mood prompt tiles | keep, moved into the Jetzt slot and the face button | once a day, never a gate |
| "Wie geht's dir?" pill | replace with the face button | same job, smaller |
| Ronki speech bubble | keep, context lines only | the six rotating lines retire |
| Tap Ronki | keep | cheap delight, unconditional |
| Fundstücke | keep as the treasure shelf | shows the trips |
| ToothbrushTimer | stays unreachable | id mismatch; fix in a later pass |
| TonightRitual | keep, plus hook and dream trip | the evening end beat |
| Profile segments Freunde, Feuer, TeachRitualModal | hide with the profile | ritual cards at 30/70 tasks count tasks, not adventures |
| Micropedia, FriendIntroCeremony, FreundCallbackCard | hide, `FEATURES.friends` | two full-screen takeovers land on the first home and the first task |
| Pflege, Erinnerungen, Buch, MemoryWall, DiscoveryLog, FreundSpriteReunion, ParentIntroOverlay | no change (already unreachable) | |
| MiniRonki, BaumPoseBeat, CreatureDiscoveryToast | delete | provably dead (no importer, or imported and never rendered) |
| ChibiGallery, Compendium (`?compendium=1`), onboarding preview URLs | keep | dev or public links the website uses |
| Celebration victory ("Quest Complete!", "Weiter zum Belohnungs-Laden") | hide (TaskContext stops queueing `victory`) | the departure beat is the day's moment |
| TabUnlockCelebration and unlock hints | hide, `FEATURES.tabUnlocks` | two tabs, both open |
| CompanionToast | hide, `FEATURES.praiseToast` | random praise strings (section 6: no slot-machine praise) |
| QuestEater, PinnedRonki | hidden with Tagebuch and Laden | |
| AlphaBanner | keep the label, remove "DE ▸ EN" and "Rückmeldung" | both live in the dashboard already |
| SWUpdateBanner | keep | harmless |
| PWAInstallSheet | hide for the child (`usePWAPromptGate` returns false) | install is a parent line in setup |
| PinModal | keep, opened from the Nest lock | |
| Spielzeug (MiniGames): Memory, Sternenfänger, Farbmix, Wolkensprung, Starfighter, Kristall-Höhle, stamina UI | hide, Extras | session lengtheners, off the loop |
| ForscherEcke and MINT games (Zahlenjagd, MusterMemory, WurzelLabyrinth, PilzWaage, KristallKette) | hide, Extras | +50 Sterne per win outweighs five routine tasks |
| CampfireVisitors, emotional tools, Ausmalbild | no change (dev-only) | |
| ParentalDashboard | keep, gains routine, evening time, Ferien, Extras; PIN bug fixed | |

**Bottom navigation**: two tabs, Nest (`home` doodle) and Ronki (`dragon` doodle). With Extras on: Nest, Ronki, Tagebuch, Laden (as today, unlocked).

**Parents reach the dashboard** through a small lock doodle at the right of the Nest header, then PinModal (PIN from setup, the website or default 1234), then ParentalDashboard. It no longer depends on 50 Sterne.

## 8. Census bugs fixed in the same pass

1. Side quests count toward RoomHub's `morningDone` (about 71 % of days it can never be true): the fire uses main quests only.
2. The trip only leaves (`leaving → away`) and only returns (`away → waiting`) while Expedition is mounted: `departTrip` does both steps; `useTripClock` returns him anywhere.
3. Trips repeat the same day: `lastTripDate` guard.
4. Return time is at most 4 h and capped at 14:00: return at the evening start.
5. `meet_close_01` is requested but missing: the close phase is rewritten with new, recorded lines.
6. `besorgt` never fires but is still coded, and a scheduled bad day can land on a return: `besorgt` step removed, bad day pushed on return days.
7. Hidden streak: `magisch` fires on 7/14/21 days of a per-quest streak map: removed; `magisch` fires on a GrowthBeat day instead.
8. `catEvo` frozen at 3: fed by adventures.
9. "Tage zusammen" always 0 (`totalTaskDays` never written): the passport counts days since `onboardingDate` and adventures.
10. No `quest.complete` on the live surface, no `mood.pick` from home, `ronki.evolve` never fires, no funnel events: all fired from the new surfaces (Jetzt card, face tiles, receiveTreasure, chain), plus `quest.skip`.
11. Consent timing: `ronki.hatch` uses raw `track()` before the hook mirrors consent: the chain mounts `useAnalytics`; funnel events before the parent step are buffered in memory and flushed or dropped by the consent choice.
12. PIN split: "PIN ändern" reads and writes `localStorage.ronki_pin` while the gate checks `state.parentPin`: the dashboard reads and writes `state.parentPin` and `parentPinIsDefault`.
13. The only parent entry sits in the Laden (50 Sterne): lock on the Nest.
14. `dailyHabits` / `recurringActivities` edits change nothing for the child: replaced by `familyConfig.routine`, which `buildDay` reads.
15. BeiRonkiSein shows 10 texts but plays the TonightRitual audio: it shows the TonightRitual texts that match the files.
16. `vacMode` has no writer: the dashboard "Ferien" toggle writes it.
17. `arcEngine` and four other fields are missing from the rehydration allowlist: not loop, left alone, noted for later.

Not fixable tonight without a schema change: the telemetry insert policy is `TO authenticated` while the app never signs in (census 7). Events will be correct in the client and may still not land; flagged for Marc.

## 9. State changes

### 9.1 New fields (all optional, all additive)

| Field | Type | Default for old saves | Written by |
|---|---|---|---|
| `adventureCount` | number | `expeditionLog.length` (backfill when absent) | receiveTreasure |
| `lastTripDate` | `YYYY-MM-DD` or null | null | departTrip |
| `tripCursor` | number | 0 (everyone starts the new story sequence at trip 1) | receiveTreasure |
| `treasuresFound` | string[] (trip ids) | [] | receiveTreasure |
| `stageSeen` | number | stage of the stored `catEvo` before backfill | GrowthBeat |
| `lastGapDays` | number | 0 | applyDayTransition (days between the previous `lastDate` and today) |
| `greetedDate` | `YYYY-MM-DD` | undefined | RoomHub after the return line plays |
| `extrasEnabled` | boolean | false | dashboard |
| `expedition.kind`, `expedition.tripId` | `'day' \| 'night'`, string | absent | departTrip |
| `ExpeditionMemento.tripId` | string | absent (old mementos keep their quote) | departTrip |
| `quests[].skipped` | boolean | absent; quests rebuild daily | skipQuest |
| `familyConfig.routine` | `{ morning: string[]; evening: string[] }` of kinds (`wake`, `teeth_am`, `pyjama` ...) | absent = today's full list | parent setup, dashboard via `setRoutine` |
| `familyConfig.eveningStart` | `'17:00' \| '17:30' \| '18:00' \| '18:30'` | '17:00' | parent setup, dashboard |

Existing fields newly written: `vacMode` (dashboard), `eveningRitualCompletedAt` (TonightRitual), `catEvo` (receiveTreasure), `parentPin` (dashboard). Kinds are the quest id without its `s_` or `v_` prefix, so the routine works for school and holiday lists alike.

### 9.2 Derived, not stored
`blockAt(now)`, `fireFor(state, now)` (slots, lit, needed, full, day-1 bonus), `stageIndex = getCatStage(catEvo)`, `stonesToNext`, `returnLineFor(state, now)`, `nextTrip = TRIPS[tripCursor % TRIPS.length]`, `isFirstDay`.

### 9.3 Migration on load (TaskContext rehydration, one place)
- Every new field listed in 9.1 gets a line in the allowlist (TaskContext.tsx 1003-1199) with its default; `familyConfig` already spreads, so `routine` and `eveningStart` survive without a new line, only the type grows (`src/types/familyConfig.ts`).
- `expedition.state === 'leaving'` becomes `home` (no memento was ever picked for it). `away` and `waiting` are kept as they are, including an old `returnAt`.
- `catEvo = max(raw.catEvo, 3 + adventureCount)` only when `onboardingDone`.
- `ronkiMood === 'besorgt'` loads as `normal`.
- No field is deleted, renamed or retyped. The PRD 7 removal of dead economy keys is not done tonight.
- Storage (`syncLoadByToken`): the pristine-local rule stays. One new branch: local not onboarded but `kidIntroSeen`, cloud not onboarded and `kidIntroSeen` false → copy `companionName`, `companionVariant`, `kidIntroSeen` from local into the result. Every other case is exactly today's code.

## 10. Build lanes

### Step 0, the orchestrator, before the lanes (about 30 min)
Writes the contract files that every lane reads and no lane edits: `src/config/features.ts` (flags and `extrasOn(state)`), `src/data/ronkiLines.ts` (every line of section 11 as `{ id, text }`, plus `lineForGap`, `growLeftLine`), `src/data/trips.ts` (the 14 trips: `id`, `place`, `emoji`, `treasure`, `story`, `hook`, voice ids), `src/loop/types.ts` (Block, FireState, TripKind and the new action signatures). Then writes `scripts/gen-finch-voice.py` (a copy of the Harry settings in `gen-ronki-voice-bank.py`, reading ids and texts from a JSON export of `ronkiLines.ts` and `trips.ts`, writing into this repo's `public/audio/ronki/`, not the old `louis-quest` path) and runs it in the background with `--smoke` first, then Whisper-checks the umlaut lines as for the name chips.

### Lane A: onboarding (owns)
- `src/components/onboarding/OnboardingChain.jsx` (new; the chain moves out of App.jsx; new phase order: `!kidIntroSeen` MeetRonki, `!parentOnboardingDone` ParentSetup, `!parentHandoffBackSeen` HandoffBack + "Jetzt kenn ich dich", else TeachFire then FirstDayIntro then `completeOnboarding`; mounts `useAnalytics`; buffers funnel events)
- `src/components/drachennest/MeetRonki.jsx`, `MeetRonki.test.jsx` (quiet card line on approach and shelf; close phase becomes the name ask or the known-name confirm)
- `src/components/NoProfileLanding.jsx` (becomes the scan sheet: restyle, kid error line, code or link field; keeps its default export)
- `src/components/CombinedParentSetup.jsx` (section 2.2; fixes the 390 px overflow noted in the surface map)
- `src/components/HandoffBackCard.jsx` (voice line)
- `src/components/onboarding/TeachFireStep.jsx`, `TeachBreathBeat.jsx` (spark line, learned line, "Weiter")
- `src/components/onboarding/FirstDayIntro.jsx` (new: two intro beats, the day-1 card, the time line)
- `src/components/onboarding/RoutinePicker.jsx` (new: picture toggles and evening chips; props `value`, `onChange`, `vac`; Lane D imports it)
- Tests: `OnboardingChain.test.jsx` (phase order for no token, seed, orphan token; resume at every phase), `FirstDayIntro.test.jsx` (three clock variants), `RoutinePicker.test.jsx` (defaults, toggles, kinds), MeetRonki tests updated.

### Lane B: loop engine and state (owns)
- `src/context/TaskContext.tsx` (fields, allowlist, migration; actions `departTrip`, `arriveTrip`, `receiveTreasure`, `skipQuest`, `setRoutine`, `markStageSeen`, `markGreeted`; stop queueing `victory`; `lastGapDays` in applyDayTransition; remove `besorgt` and streak `magisch`; bad-day guard; fire `quest.complete` inside `complete`)
- `src/types/familyConfig.ts`
- `src/utils/helpers.ts`, `src/utils/helpers.test.js` (`buildDay(vac, routine)` filters by kind)
- `src/utils/storage.ts`, `src/utils/storage.test.js` (the one carry-over branch)
- `src/lib/analytics.ts`, `src/lib/analytics.test.ts` (new names: `onboarding.landing.view`, `onboarding.egg.pick`, `onboarding.hatch`, `onboarding.name.confirm`, `onboarding.parent.done`, `onboarding.scan.start`, `onboarding.scan.result`, `onboarding.teachfire.complete`, `first.task.complete`, `quest.skip`; `expedition.start` gains `kind`; a small `bufferUntilConsent` queue)
- `src/loop/dayPhase.ts`, `src/loop/fire.ts`, `src/loop/growth.ts`, `src/loop/clock.ts` (`now()`; in DEV honours `?clock=2026-09-28T07:10`)
- `src/hooks/useTripClock.ts`
- Tests: `src/loop/dayPhase.test.ts`, `fire.test.ts`, `growth.test.ts`, `src/context/TaskContext.loop.test.ts`, `src/context/TaskContext.rehydrate.test.ts`, fixtures `src/test/fixtures/save-louis-like.json`, `save-card-seed.json`, `save-mid-trip.json`, `save-leaving.json`.

### Lane C: the Nest and the trip beats (owns)
- `src/components/drachennest/RoomHub.jsx`, `RoomHub.test.jsx`, `RoomHubBits.jsx` (new layout, five states, lock and face button, props `onOpenParental`, `onOpenTonight`, `onOpenAwayLoop`, `onSit`)
- `src/components/drachennest/RonkiSpeechBubble.jsx` (context line, tap to replay)
- New in `src/components/drachennest/`: `FireBowl.jsx`, `NowCard.jsx`, `TaskRow.jsx`, `DepartureSheet.jsx`, `AwayCard.jsx`, `TreasureReveal.jsx`, `GrowthBeat.jsx`, `returnBeat.js` (picks the line from `lastGapDays`, block and trip state)
- `src/components/drachennest/TonightRitual.jsx` (hook or dream-trip line, writes `eveningRitualCompletedAt`, calls `departTrip('night')` on close when there was no trip today)
- `src/components/drachennest/BeiRonkiSein.jsx` (texts matched to the audio)
- `src/data/taskArt.ts` (new; the `artFor` and `TASK_ART` map copied from RonkisTag, which stays untouched)
- Tests: `FireBowl.test.jsx`, `NowCard.test.jsx` (done, skip, events), `TreasureReveal.test.jsx` (receive once), `returnBeat.test.js`, `TonightRitual.test.jsx` (hook vs dream trip), RoomHub tests rewritten per state.

### Lane D: passport, navigation, cuts, parent area (owns)
- `src/components/RonkiPassport.jsx` (new), `src/components/RonkiPassport.test.jsx`
- `src/components/NavBar.jsx`, `src/components/NavBar.test.jsx` (new: two tabs, four with Extras)
- `src/data/tabUnlocks.ts` (Ronki always open)
- `src/components/ParentalDashboard.jsx` ("Ronkis Tag" section with RoutinePicker and evening time, Ferien toggle, Extras toggle, adventures number in Übersicht, PIN fix)
- `src/components/PinModal.jsx` (only if the PIN fix needs it)
- `src/components/AlphaBanner.jsx` (buttons removed)
- `src/components/MoodChibi.jsx` (stage 3 calm uses `proud.webp`), `src/components/MoodChibi.stage.test.jsx` (new)
- `src/hooks/usePWAPromptGate.js` (off for the child)
- Deletes: `src/components/MiniRonki.jsx`, `src/components/BaumPoseBeat.jsx`, `src/components/CreatureDiscoveryToast.jsx` (its App import goes in integration).

### Integration pass (the orchestrator, after the lanes)
- `src/App.jsx`: OnboardingGate always renders the chain until `onboardingDone` (NoProfileLanding only as the sheet); import OnboardingChain and remove the inline one; mount `useTripClock`; view `ronki` renders RonkiPassport; `quests` and `streifen` go to `hub` unless `FEATURES.dayStrip`; `journal`, `shop`, `games`, `mint-game` only with `extrasOn`; FriendIntroCeremony discovery, CompanionToast, TabUnlockCelebration behind their flags; pass `onOpenParental={openPinGate}` and the other props to RoomHub; drop the CreatureDiscoveryToast import.
- `src/i18n/de.json`, `src/i18n/en.json`: only keys the lanes list in their hand-over notes (nav labels, teach copy).
- Run `npm test`, `npm run check:names`, `npm run build`, `npm run build:web`, the browser checks of section 12, the em-dash grep, then the Astra code review before the merge, then `HANDOFF.md`.

## 11. Content

All new kid lines, spoken by Ronki (Harry). Ids without the `de_` prefix. No line is longer than two short sentences except the stories.

### 11.1 Onboarding
| Id | German |
|---|---|
| `meet_askname_01` | Und wie heißt du? |
| `meet_getparent_01` | Das kann ich noch nicht lesen. Holst du mal Mama oder Papa? |
| `meet_knowname_01` | Und dich kenn ich schon. Mama oder Papa haben mir von dir erzählt. |
| `meet_yes_01` | Schön, dass du da bist! |
| `handoff_back_01` | Jetzt bist du wieder dran! |
| `meet_nowiknow_01` | Jetzt kenn ich dich. Schön! |
| `scan_camera_sleep_01` | Die Kamera schläft noch. Hol mal Mama oder Papa. |
| `teach_fire_spark_01` | Oh, ein Funke! Nochmal. Ganz lange Luft holen. |
| `teach_fire_learned_01` | Das hast du mir gezeigt. Das vergess ich nie. |
| `fd_fire_half_01` | Schau, mein Feuer. Vom Pusten ist es schon halb warm. |
| `fd_fire_trip_01` | Wenn es ganz warm ist, flieg ich los. Und ich bring dir was mit. |
| `fd_day1_01` | Heute ist unser erster Tag! |
| `fd_start_morning_01` | Machen wir zusammen den Morgen? |
| `fd_start_day_01` | Ich flieg jetzt gleich los. Wenn es Abend wird, bin ich wieder da. |
| `fd_start_evening_01` | Machen wir zusammen den Abend? Dann schlaf ich gut. |

### 11.2 Nest, fire and tasks
| Id | German |
|---|---|
| `greet_day_01` | Guten Morgen! Ich hab von dir geträumt. |
| `greet_day_02` | Hallo! Schön, dass du da bist. |
| `return_short_01` | Da bist du ja wieder! Schön. |
| `return_long_01` | Da bist du ja! Ich freu mich so, dass du wieder da bist. |
| `mood_ask_01` | Wie geht's dir heute? |
| `task_wake` | Stehst du mit mir auf? |
| `task_water` | Holst du uns ein Glas Wasser? |
| `task_wash` | Waschen wir uns das Gesicht? |
| `task_breakfast` | Mein Bauch grummelt. Frühstücken wir? |
| `task_teeth_am` | Zähne putzen! Ich hör so gern die Bürste. |
| `task_dress` | Was ziehst du heute an? |
| `task_packcheck` | Ist alles in der Schultasche? |
| `task_move` | Hüpfen wir ein bisschen? (also `ft`) |
| `task_outside` | Gehen wir raus spielen? |
| `task_dinner` | Komm, wir essen Abendbrot. |
| `task_teeth_pm` | Letzte Putzrunde für heute! |
| `task_wash_pm` | Waschen wir uns den Tag ab? |
| `task_pyjama` | Zeit für den weichen Pyjama! |
| `task_cuddle` | Liest du mir noch was vor? |
| `task_skip_01` | Okay, heute nicht. Ist nicht schlimm. |
| `fire_full_morning_01` | Mein Feuer ist ganz warm! Jetzt kann ich losfliegen. |
| `fire_full_evening_01` | Mein Feuer ist warm. Jetzt werd ich müde. Kommst du mit ans Fenster? |
| `trip_bye_school_01` | Tschüss! Jetzt geht dein Tag los. Viel Spaß in der Schule! |
| `trip_bye_free_01` | Tschüss! Viel Spaß heute! |
| `away_day_01` | Ich bin unterwegs. Wenn es Abend wird, bin ich wieder da. |
| `away_sleep_01` | Chrrr. Ich träum grad was Schönes. |
| `home_stay_01` | Heute bleib ich im Nest. Heute Abend machen wir mein Feuer warm. |
| `trip_back_01` | Ich bin wieder da! Ich hab dir was mitgebracht. |
| `trip_back_night_01` | Guten Morgen! Heute Nacht bin ich im Traum geflogen. Schau mal! |
| `trip_again_01` | Da war ich schon mal. Aber es war wieder schön. |
| `treasure_shelf_01` | Das stellen wir ins Regal. |
| `night_trip_01` | Heute Nacht flieg ich im Traum los. Zum Frühstück bin ich wieder da. |

### 11.3 Growth and passport
| Id | German |
|---|---|
| `grow_left_1` | Nur noch ein Abenteuer, dann werd ich größer! |
| `grow_left_2` | Noch zwei Abenteuer, dann werd ich größer. |
| `grow_left_3` | Noch drei Abenteuer, dann werd ich größer. |
| `grow_left_more` | Noch ein paar Abenteuer, dann werd ich größer. |
| `grow_stage_2` | Schau mal! Meine Eierschale ist ab! |
| `grow_stage_3` | Schau mal! Ich kann jetzt richtig stehen! |
| `grow_stage_4` | Schau mal! Ich hab Flügel! |
| `grow_stage_5` | Schau mal, wie groß ich bin! Das haben wir zusammen geschafft. |
| `passport_hello_01` | Das bin ich! Und das alles haben wir zusammen gemacht. |

### 11.4 The 14 trips (fixed order, one per adventure; voice `trip_story_NN` and `trip_hook_NN`)
The treasure set is finite (14) and free to complete. Order never depends on behaviour. After trip 14 the order starts again with `trip_again_01` before the story and no new treasure; the next content wave (PRD pool to 30) should land before a daily child reaches trip 15, about 2.5 weeks after install.

| NN | Place | Treasure | Story (`trip_story_NN`) | Hook for tomorrow (`trip_hook_NN`, told the evening before this trip) |
|---|---|---|---|---|
| 01 | Birkenpfad | 🍁 Ahornblatt | Hinter den Birken ist ein kleiner Pfad. Da lag ein rotes Blatt. Wenn die Sonne drauf scheint, leuchtet es. | Morgen flieg ich zu den Birken. Da ist ein kleiner Pfad. |
| 02 | Lichtung | 🪶 Feder | Auf der Lichtung war es ganz still. Dann ist eine Feder runtergesegelt, direkt vor meine Nase. Ich glaub, der Vogel braucht sie nicht mehr. | Morgen flieg ich zur Lichtung. Da ist es ganz still. |
| 03 | Bach | 🪨 Bachstein | Am Bach hab ich die Füße ins Wasser gehalten. Brrr, kalt! Dann hab ich einen Stein gefunden, ganz glatt vom Wasser. | Morgen flieg ich zum Bach. Ich hör ihn schon plätschern. |
| 04 | Dicke Eiche | 🌰 Eichel | Unter der dicken Eiche lagen ganz viele Eicheln. Eine hatte noch ihr Hütchen auf. Sieht aus wie eine Mütze für einen Zwerg, oder? | Morgen flieg ich zur dicken Eiche. |
| 05 | Sonnenstein | 🐌 Schneckenhaus | Auf dem warmen Stein lag ein Schneckenhaus. Ich hab ganz leise gefragt, ob jemand zu Hause ist. Keiner. Die Schnecke ist wohl umgezogen. | Morgen flieg ich zum großen Stein in der Sonne. |
| 06 | Wurzelhang | 🌿 Moos | Am Wurzelhang wächst Moos, weich wie ein Kissen. Ich hab mich kurz reingelegt. Na gut, ein bisschen länger. | Morgen flieg ich zum Wurzelhang. Da ist alles weich. |
| 07 | Tannenkreis | 🍄 Pilz-Bild | Im Tannenkreis stand ein roter Pilz mit weißen Punkten. Den darf man nicht pflücken. Deshalb hab ich ihn für dich gemalt. | Morgen flieg ich zum Tannenkreis. Mal sehen, wer da wohnt. |
| 08 | Hohe Tanne | 🌲 Tannenzapfen | Die Tanne ist so hoch, ich hab die Spitze gar nicht gesehen. Dann ist mir ein Zapfen auf den Kopf gefallen. Plopp! | Morgen flieg ich zur hohen Tanne. Die ist so hoch! |
| 09 | Wiese | 🌼 Gänseblümchen | Auf der Wiese waren tausend kleine Blumen. Na ja, ich hab bei zwölf aufgehört zu zählen. Die schönste ist für dich. | Morgen flieg ich zur Wiese am Waldrand. |
| 10 | Waldsee | 🐚 Muschel | Der Waldsee war glatt wie ein Spiegel. Ich hab gewunken, und der Ronki im Wasser hat zurückgewunken. Am Ufer lag eine kleine Muschel. | Morgen flieg ich zum Waldsee. |
| 11 | Wegesrand | 🍂 Goldblatt | Am Wegesrand hat es geknistert. Knister, knister. Dieses Blatt sieht aus, als hätte jemand mit Sonne gemalt. | Morgen flieg ich den Weg entlang. Da knistert es immer. |
| 12 | Windhügel | 🌾 Pfeifhalm | Auf dem Hügel weht immer Wind. Ein Hase hat mir gezeigt, wie man auf einem Grashalm pfeift. Ich kann's noch nicht so gut. Pfff. | Morgen flieg ich zum Hügel. Da wohnt der Wind. |
| 13 | Wolken | ☁️ Wolke im Glas | Ganz oben auf der Wolke war es weich und ein bisschen nass. Ich hab ein Stück ins Glas getan. Guck, es ist fast weg. Wolken sind so. | Morgen flieg ich ganz hoch, zu den Wolken! |
| 14 | Sternenhügel | ⭐ Sternenstein | Auf dem Hügel liegen Steine, die glitzern wie kleine Sterne. Ich hab den glitzerigsten ausgesucht. Der ist für dich. | Morgen flieg ich zum Sternenhügel. Da glitzert es. |

`trip_hook_NN` belongs to trip NN and is told the evening before it. Trip 01's hook is never needed on day 1 (the day-1 lines cover it) and is used when the order starts again.

Count: 15 onboarding + 32 nest + 9 growth and passport + 28 trip lines = **84 new voice files**, about 3,400 characters for ElevenLabs. English stays silent for these lines tonight (the language switch moves into the parent area).

### 11.5 Retired lines (text and playback removed from the child's path; files stay on disk)
"Ich bin {nick}! Bis morgen. Versprochen." and the missing `meet_close_01`; `teach_fire_smoke_01` "Hmm das war glaub ich noch zu kurz..." and the muted narrator "Er hat's gelernt. Er vergisst das nie."; "Weiter zum Lager"; the six RonkiSpeechBubble rotation lines (including "Ich hab heut Nacht von fliegenden Keksen geträumt."); the CompanionToast praise strings (de.json 529-534); the victory screen "Quest Complete!", "Alles geschafft! 🎉", "Weiter zum Belohnungs-Laden! 🎁"; the three nav lock hints and unlock toasts; RoomHub "Ronki ist bereit" and its quote; RonkisTag AnchorCompleteCard "Ich geh mal kurz raus. Bin zum Mittag wieder da."; the Expedition status lines ("Kommt vor dem Mittag zurück" and so on); the PWA sheet kid copy "Toll gemacht! ..."; the eight Morgenwald memento quotes as new content (old mementos in saves keep their text).

## 12. Tests

### 12.1 Unit (vitest, all new files named in section 10)
- **Blocks**: every boundary (03:59, 04:00, 10:59, 11:00, weekday vs Saturday noon, eveningStart 17:30, night after TonightRitual).
- **Fire**: side quests never count; routine filter by kind for school and holiday ids; skip counts as lit; all skipped is not full; day-1 half bonus with 3, 4 and 5 slots.
- **Trips**: `departTrip` no-ops unless `home` and unless `lastTripDate !== today`; `returnAt` for day, day-1 afternoon, and night; `arriveTrip` flips `away → waiting` with no Expedition mounted (fake timers, visibility event); `receiveTreasure` twice counts once; cursor wraps after 14 with `trip_again_01`; a treasure never expires across 5 simulated days; DST weekend (25 Oct 2026) and midnight inside a trip.
- **Growth**: `catEvo` never decreases; stage crossings at 6, 15, 27, 42; `ronki.evolve` once per crossing; `stageSeen` blocks a second GrowthBeat; stage 3 resolves to `proud.webp`.
- **Return lines**: gap 0, 1, 3, 5, 30 days; never `worried` art on a return day; `besorgt` never set.
- **Old saves** (fixtures): Louis-like save (catEvo 3, 5 mementos, companionName, parentPin, journal) loads with no field lost, `adventureCount` 5, stage unchanged, all new fields defaulted; `leaving` becomes `home`; a mid-trip `away` save keeps its `returnAt`; save, reload and cloud round trip keep every new field (allowlist test that enumerates 9.1).
- **QR path**: all existing `storage.test.js` cases pass unchanged; new cases: local hatch plus seed carries the three fields; local hatch plus onboarded cloud keeps the cloud untouched; sibling guard unchanged.
- **Onboarding**: chain order for no token, seed and orphan token; resume at each phase after a reload; scan line present on approach and shelf; parent pill disabled without a name; routine and evening time land in `familyConfig`; funnel events dropped when consent stays off and flushed when on.
- **Nest**: each state renders its one loud item; Jetzt card fires `quest.complete` and `first.task.complete` once; skip fires `quest.skip`; face tile fires `mood.pick`; lock opens the PIN gate.
- **Passport and nav**: two tabs by default, four with Extras; passport shows name, "Der Freund von", days, adventures, treasures; no "streak" or "Tage in Folge" string anywhere in kid-facing files.
- **Content guard**: every id in `ronkiLines.ts` and `trips.ts` has an mp3 in `public/audio/ronki/`; no em-dash or en-dash in any new string or file of the pass.

### 12.2 Browser (vite preview on the production build, local Supabase mock, 390 x 844 frame, DEV `?clock=`)
1. Fresh device, no card, at 07:10: egg to first task; count taps and seconds; fire half; finish, departure, empty nest.
2. Same at 13:00 (send-off at once, back at 17:00) and at 19:30 (dream trip, treasure at `?clock=` next day 07:00).
3. Website card made on the mock, opened by `?p=` link and by the scan sheet's code field: lands on the egg shelf, name known, parent step skipped, home.
4. Denied camera: kid line shows, code field works.
5. Louis-like save injected into localStorage: nothing lost, growth beat if the log is 6 or more, Extras off, dashboard reachable from the lock with his PIN.
6. Trip round trip without opening any map: close the tab after departure, reopen at eveningStart, treasure card, story plays, shelf, passport count +1.
7. Second device: hatch locally, then scan an onboarded card from the parent screen: the cloud Ronki appears with the return line.
8. Five days away (`?clock=` +5): warm long line, happy face, waiting treasure, fresh fire.
9. Reduced motion and a muted device: every screen still works without video and without sound (text is always on screen).
10. `npm test`, `npm run check:names`, `npm run build`, `npm run build:web` green; after the deploy, the live bundle hash changes and contains the `trip_story_01` path.

## 13. Risks, and what to cut first

| Risk | Likelihood | Guard |
|---|---|---|
| A reload or scan attaches the hatch to the wrong cloud row (Astra A1) | medium | storage change is one guarded branch with four tests; cloud onboarded always wins |
| RoomHub rewrite is the biggest lane and every other lane lands on it | high | Lane C starts from the state list in section 3 and ships states in the order morning, away, return, evening, night |
| The child reads the task row as "tap to complete" and ticks everything | medium | row only selects; only the Jetzt pill completes |
| Two trips in the first 24 hours of an evening install feel like a rule the child then misses | low | only day 1; the second is a normal morning |
| Louis misses games or the Tagebuch | high for one child | Extras toggle, reversible in seconds; Marc decides tonight |
| Voice batch fails or mispronounces umlauts | medium | smoke run first; text is always on screen; missing files stay silent, never block |
| Trip 15 arrives before new content | certain after about 2.5 weeks | `trip_again_01` makes repeats honest; plan the content wave |
| Telemetry still does not land (insert policy) | high | out of scope without a schema change; told to Marc |

Cut order if time runs short (first cut first): (1) the stage-3 `proud.webp` mapping and GrowthBeat polish (growth still counts, the beat can be a sticker line); (2) the passport treasure replay; (3) the dashboard "Ronkis Tag" section (setup still writes it; the dashboard can follow); (4) the storage carry-over branch (then a scan after a local hatch simply re-hatches from the seed); (5) the day-1 afternoon send-off (afternoon installs then wait for the evening fire). Never cut: egg first with the card line, the global trip clock, the one-trip-per-day guard, the rehydration of every new field, the QR tests, the parent lock on the Nest.
