# Finch pass design: pre-reader first (26 Sep 2026)

_Angle: a six-year-old who cannot read, at 07:05 with shoes to find, and at 19:10 in pyjamas. Every screen works by ear, picture and one big thing to tap. Test for every choice: can Louis do it alone, and does he want to come back tonight? Sources: census `docs/research/2026-09-26-ronki-feature-census.md` (cited as C with section), Finch teardown, own-read-spar, PRD v2 sections 1 to 7, NORTHSTAR, surface map, spot checks in `TaskContext.tsx`, `App.jsx`, `storage.ts`, `RonkisTag.jsx`, `constants.ts`, `voiceAudio.ts`._

Where I disagree with the own-read: (a) one day trip per day, not two; the second appointment is a dream Ronki tells on the next open, which costs one voiced sentence instead of a trip, a treasure and a story; (b) the mood check moves to the evening, after Ronki told his story, so the rushed morning has no extra step; (c) the kid does not pick routines from a list; the pre-reader version of "pick your goal" is "tap the picture you do first", which needs no new system; (d) growth counts days with Ronki (any day with one task), not trips, and the voice says "Tage mit dir".

---

## 1. The product and the loop in three sentences

Ronki is a small red-orange dragon who lives in a painted nest on the family tablet; the kid's morning things (each one a picture Ronki asks for out loud) warm his fire, and a warm fire lets him fly out while the kid is away. He is back when the sun is low with one treasure and a short spoken story, the kid's evening things warm him again for bed, and at night he promises where he flies tomorrow and dreams something he tells at the next open. Every day with Ronki adds a footprint on his path, and every few footprints he grows a little; nothing ever breaks, shrinks or scolds.

---

## 2. First session script

Conventions: voice ids play as `VoiceAudio.playLocalized(id)` from `public/audio/ronki/de_<id>.mp3`. **New** = generated tonight (section 11). **Have** = file exists. Seconds are wall time of that screen with a typical kid. Text on screen stays short and is always also spoken; a pre-reader never needs it.

### 2A. Family with NO card (cold open, no `?p=`, no token)

| # | Screen (file) | What the kid sees | Taps | Ronki says (id) | Sec |
|---|---|---|---|---|---|
| 1 | Egg shelf (MeetRonki `shelf`, now the first screen; approach cut to a 1.2 s crossfade) | Painted room loop, four eggs wobbling in turn, a drawn hand pointing at the eggs. Top right, small and quiet, for the parent only: "Wir haben eine Karte" | 1 egg | After 1.0 s: "Psst. Hier drin! Tipp mal auf ein Ei." (`ob_egg_call_01`, new); repeats once after 8 s without a tap | 5 |
| 2 | Wobble + hatch (unchanged clips, per egg) | Picked egg trembles, cracks, Ronki peeks out | none | silent (the clip carries it) | 6.4 |
| 3 | Meet | Ronki big, bubble | none | "Hallo. Ich hab auf dich gewartet. Glaub ich." (`meet_hello_01`, have) | 4.5 |
| 4 | Name chips (unchanged, e089cfd) | Six chips; each chip speaks when tapped; after a chip, the check pill pulses | 2 (chip, check pill) | "Hm, wie soll ich heißen?" (`meet_namequest_01`, have); chip voice (`name_chip_*`, have); 1.5 s after a chip: "Passt der Name? Dann drück auf den Haken." (`ob_name_hint_01`, new). The pill gets a big check doodle next to "so soll er heißen" | 8 to 12 |
| 5 | Name yes (replaces the close phase and its missing `meet_close_01`) | Ronki cheer pose, sticker burst | none, auto after the line | "Ja! So heiß ich jetzt. Komm, ich zeig dir was." (`ob_name_yes_01`, new) | 3.5 |
| 6 | First breath (TeachBreathBeat, sky ground) | Ronki tries to make fire, only smoke; big sun button with a pulsing hand | 2 holds | "Ich will Feuer machen. Hilfst du mir? Drück lange auf die Sonne und hol tief Luft." (`ob_teach_hold_01`, new); round 1 always smoke (`teach_fire_smoke_01`, have); "Nochmal. Ganz lange drücken. Ganz viel Luft." (`ob_teach_again_01`, new); "Jaaa! So geht's!" (`teach_fire_celebrate_01`, have); "Das vergess ich nie. Du hast es mir gezeigt." (`ob_teach_done_01`, new) | 20 to 28 |
| 7 | Fire intro (new `FireIntro.jsx`, on the nest scene) | The fire bowl appears beside the nest, half full, one flame flickers in. The footprint path fades in under the nest, first print glowing | none, auto | "Schau, das ist mein Feuer. Es ist erst halb warm." (`ob_fire_intro_01`) then "Wenn du deine Sachen machst, wird es ganz warm. Dann kann ich fliegen." (`ob_fire_intro_02`), both new | 8 |
| 8 | Parent ask (new `ParentAsk.jsx`) | Ronki waving, a big house-and-heart doodle. One cobalt pill for the adult: "Ich bin Mama oder Papa". Quiet link at the very bottom: "Später" | 1 (the parent taps) | "Jetzt brauch ich kurz Mama oder Papa. Holst du sie?" (`ob_parent_call_01`, new). If "Später": "Okay. Dann fragen wir sie später." (`ob_parent_later_01`, new) and go to 10 | 3 + wait |
| 9 | **Parent step** (CombinedParentSetup, trimmed) | Parent register, one screen, no kid copy | parent types | none | 40 to 60 |
| 10 | Handoff back (HandoffBackCard) | Ronki waving, the child's name in big letters ("Louis"), sun pill with arrow, tappable at once | 1 | "Da bist du ja wieder! Jetzt weiß ich, wie du heißt." (`ob_handoff_01`, new) | 3 |
| 11 | Home, day 1 (section 3) | Nest with Ronki, fire half full, the block's task pictures in a row, the big Jetzt card | 1 picture (optional), 1 big check | "Heute ist unser erster Tag!" (`d1_first_day_01`), then "Was machst du als Erstes? Tipp auf ein Bild." (`d1_pick_01`), both new; the picked card speaks its ask (`task_ask_<id>`, new) | 4 + real life |

**Exactly what the parent is asked in step 9** (top to bottom, nothing else):
1. "Wie heißt euer Kind?" one text field, placeholder "Vorname". Required for the pill.
2. "PIN für den Eltern-Bereich (optional)" as today, default 1234 note unchanged.
3. "Anonyme Nutzungsdaten teilen?" toggle, default off, copy unchanged.
4. New card at the bottom, "Ronki auf den Homescreen legen": the iOS three steps or the Android install button, moved here from the kid-facing `PWAInstallSheet` ("Toll gemacht!" to a child is wrong; the parent is the one who installs). Marks `pwaPromptShown`.
5. Quiet link: "Ihr habt schon eine Karte? Hier scannen" opens the existing scanner (NoProfileLanding scan mode, unchanged code). The hatched dragon survives the scan (section 9, merge rule M2).
6. Pill "Weiter zum Kind" (unchanged), which creates a token and claims the local profile exactly as the orphan-token path does today (App.jsx:900-919), so every in-app family gets a cloud row and counts for gate 1.

**First win**: the breath fire at step 6, about 35 s after the first tap. First routine task: about 2 minutes including the parent. Kid taps to the first task: 8 (egg, chip, check, hold, hold, handoff, picture, big check). Unskippable waits: 1.2 + 6.4 + 4.5 + 3.5 + 8 = 23.6 s, down from 24.7 s and every second of it is voiced or moving.

**Where onboarding ends depends on the clock** (the "first day is never empty" rule, all via the loop engine, section 4):
- 04:00 to 11:00: morning block; the fire starts half warm, so about half the morning pictures fill it and Ronki flies on day 1.
- 11:00 to 17:00: no block is due. Ronki flies straight after the fire intro: "Ich flieg los. Heute Abend erzähl ich dir alles. Tschüss!" (`trip_depart_01`). Back at max(17:00, now + 2 h).
- 17:00 to 04:00: evening block, fire half warm; three of five bedtime pictures fill it; Tonight ritual with the first-night lines; the first dream is told at the next open.

### 2B. Delta for the QR-card family

- **Card scanned in the app:** the parent taps "Wir haben eine Karte" on the egg shelf (step 1). That opens the unchanged NoProfileLanding scan screen, with one addition under the scanner for a denied camera: "Die Kamera schläft noch. Hol mal Mama oder Papa." (spoken, `ob_camera_sleep_01`) and a parent field "Link von der Karte hier einfügen" that accepts the share URL or the bare code and calls the same `setActiveToken` + reload. After the reload the chain runs exactly as today from MeetRonki (the seed has `parentOnboardingDone` and `parentHandoffBackSeen`), with the new steps 4 to 7. Steps 8 to 10 are skipped because the website already asked the parent. Step 11 greets with the child's name from the card.
- **Share link `?p=` opened directly:** identical to today (landing skipped), then steps 1 to 7 and 11. No card link is shown on the shelf when a token is active.
- The QR code path stays byte-for-byte in `NoProfileLanding.jsx` scan mode and `profileToken.ts`; only the error copy and the paste field are added.

### 2C. Delta for a returning kid on a second device

- The parent opens the `?p=` link or scans the card from the egg shelf link. `syncLoadByToken` finds an onboarded cloud row, `OnboardingGate` sees `onboardingDone` and renders the home at once: no egg, no name, no breath. The first open plays the return beat for the gap since the last open on any device (section 3) and the loop state comes from the cloud (a trip that is out on the old device is out here too).
- If the kid already hatched a new egg on this device before the parent linked it, the cloud dragon wins and the local hatch is discarded silently (merge rule M3, PRD 5.1).

---

## 3. The home screen after onboarding

**Layout on a 390 x 844 phone, top to bottom:** AlphaBanner (language toggle removed, section 8) · header row: left a small face doodle (feelings; tap says "Wie geht's dir?" with `mood` tiles as a sheet), centre "Hallo Louis" in small Fredoka (for the parent; the kid reads the picture), right a small ink lock (parents) · **the scene** (room loop, about 52 % of the height) with Ronki in his nest, the **fire bowl** at the nest's right edge, and the **footprint path** along the bottom edge of the frame ending in a small picture of the next, bigger Ronki · **Jetzt card**: the task picture at 150 px, a speaker doodle that replays the ask, and one big sun pill with a check doodle "Geschafft" (64 px tall, the loudest thing on white) · **block row**: the current block's pictures at 44 px, done ones with the sun check sticker; tapping one makes it the Jetzt card and speaks its ask (skip and reorder are free, Finch mechanic 9) · bottom nav with two tabs, Nest and Ronki.

**One tap on "Geschafft":** the picture flies into the fire bowl (CSS, 600 ms), the flame grows a step, Ronki does the cheer jump (1.4 s, existing), and says that task's own short line (`task_done_<id>`, one fixed line per task, never a rotating praise string). Undo: tapping a done picture in the row shows it on the Jetzt card with a quiet "doch nicht" link (parent-grade safety net for mis-taps).

**Gone from home:** the six-tile mood grid, "Bei Ronki sitzen" pill, "Heute Abend mit Ronki" card, "Heute auf der Schriftrolle", the Morgens / Nachmittag / Abends tiles, "Spielzeug", "Karte", the Fundstücke strip, the six rotating bubble lines, the FriendIntroCeremony takeover, the CompanionToast, the victory celebration, the tab unlock toasts and coachmarks. Roughly 24 one-tap targets become 10 to 12, and only one is loud.

| Moment | Scene | Loud thing | Ronki says | Ends with |
|---|---|---|---|---|
| **Morning** (first open 04:00 to 11:00) | `zuhause` loop, Ronki sitting, fire as an ember glow (never grey, never "empty") | Jetzt card on the first undone morning picture. "Aus dem Bett kommen" is ticked on the first morning open (the kid is awake; it moves the fire before the first tap) | One beat (priority below), then the Jetzt ask | Fire full: "Mein Feuer ist ganz warm! Jetzt kann ich fliegen." (`fire_full_am_01`) then `trip_depart_01`, Ronki (cloud pose) floats out of the frame, 2.5 s |
| **While away** (any open before `returnAt`) | Same room without Ronki (the loop is already empty), a paper note on the cushion, and a sun-to-moon arc drawn over the window with a small Ronki dot on it at the right place for the time | The note (tap plays "Bin unterwegs! Wenn die Sonne tief ist, bin ich wieder da." `trip_note_01`); the away window shows `RonkiAwayLoop` (Ronki on a cloud over the Morgenwald) | nothing unless the note is tapped | Remaining morning pictures still sit in the row; ticking one sends a spark to the bowl ("he feels it later"), no pressure line. After the trip leaves, the session has nothing loud: the natural end |
| **At his return** (first open after `returnAt`) | Ronki back in the nest, happy pose, a wrapped bundle (gift doodle on a paper tile) at his feet | The bundle | "Ich bin wieder da! Ich hab dir was mitgebracht." (`trip_back_01`), after 4 s idle "Tipp mal drauf." (`trip_open_01`) | Tap: treasure card (big emoji or doodle on a sun paper card) + the trip story (`trip_story_NN`, 8 to 12 s) + "Das stell ich ins Regal. Da kannst du es immer anschauen." (`trip_shelf_01`); the treasure sits beside the nest until the next trip |
| **Evening** (17:00 to 04:00, story told or no trip today) | `zuhause` loop, warmer light (CSS overlay), fire ember | First: the evening check sheet (once a day, only if a story was just told or it is the first evening open): "Und du? Wie war dein Tag?" (`eve_mood_ask_01`) with the six existing feeling tiles; each tile speaks its reaction (`mood_*_01` have, `eve_mood_magic_01` new) and writes `moodPM`. Then the Jetzt card on the bedtime block, and a moon pill "Schlafen" beside the row that is always there | task asks and acks | Fire full: "Jetzt bin ich warm und müde. Kommst du mit ins Bett?" (`fire_full_pm_01`) and the moon pill turns loud. Tap opens TonightRitual. The moon pill works at any fire level ("Schlafen gehen? Ich komm mit." `eve_moon_01`), bedtime is never earned |
| **Night** (after the ritual, until 04:00) | `nacht` loop, Ronki asleep | nothing | tap Ronki: "Mmh... bis morgen..." (`night_mumble_01`) | the app is done for the day |
| **After 1 day away** | Morning or evening layout as above | If a trip was out: the bundle is waiting, whatever the time | "Da bist du ja wieder! Ich hab dir was aufgehoben." (`nest_gap_gift_01`) then the bundle | The pending dream is dropped for that open (one story per open) |
| **After 5 days away** | Same as 1 day. Ronki is never shown worried or sad on return (Bilderbuch decision 4 kept; the scheduled bad days do not paint the home) | Bundle if a trip was out, else the Jetzt card | With a bundle `nest_gap_gift_01`, without "Da bist du ja wieder! Ich hab an dich gedacht." (`nest_gap_hello_01`) | No counting of days missed, no pile of treasures, no catch-up tasks. The footprint path shows exactly what it showed five days ago |

**Beat priority per open** (at most one story beat per open; an open = mount, or back to foreground after 30 min hidden): growth > trip return > dream > hello. Hello is just a voice line and a bubble (`greet_morning_01` / `greet_evening_01` have, or the two gap lines), never a blocking screen. Dream: "Weißt du was? Ich hab heute Nacht was geträumt." (`dream_intro_01`) + `dream_NN`, on the first open of a day after 04:00, unconditional, deterministic order, a small cloud card the kid can tap away.

---

## 4. The loop engine

A pure module `src/loop/loopEngine.ts` (no React, fully unit tested) owns every rule. TaskContext calls `advanceLoop(state, now)` on load, every 60 s while visible, and on `visibilitychange`; it persists the returned patch. Components read `getLoopView(state, now)`. The Expedition screen no longer drives transitions (census 2.4: return was only detected inside Expedition).

**Clock windows** (constants, tunable): `MORNING_START 04:00`, `MORNING_END 11:00`, `RETURN_HOUR 17:00`, `MIN_TRIP_MS 2 h`. Blocks: morning = main quests with anchor `morning`; bedtime = anchor `bedtime`. Afternoon quests (`s_move`, `ft`) and side quests never touch the fire (fixes the 71 % bug, C 2.1).

**Fire** (derived, never stored): `fire = min(1, head + done / total)` of the current block, where `head = 0.5` when `onboardingDate` is today, else 0. Drawn with an ember floor so zero looks like a warm glow.

| Phase | Entered when | Home shows | Leaves when |
|---|---|---|---|
| `morning` | 04:00 to 11:00, Ronki home | morning block, Jetzt card | fire full and no trip today → **depart** (live, with the departure beat); or 11:00 passes |
| `away` | `expedition.state = 'away'` and now < `returnAt` | empty nest, note, sun arc, away window | now ≥ `returnAt` → `waiting` |
| `back` | `expedition.state = 'waiting'` | bundle | kid opens the bundle → `receiveMemento` → `home`, `tripNo + 1` |
| `day` | 11:00 to 17:00, Ronki home, no trip out | Ronki resting, the afternoon card (`s_move` / `ft`) as the Jetzt card if present, else nothing loud | 17:00 |
| `evening` | 17:00 to 04:00, Ronki home, ritual not done since 17:00 | evening check, bedtime block, moon pill | ritual complete → `night` |
| `night` | `eveningRitualCompletedAt` after 17:00 today (or before 04:00) | sleeping Ronki | 04:00 → `morning` of the new day |

**Departure** (`departTrip(now, backdated?)`): only when `expedition.state = 'home'` and `lastTripDay !== today` (one day trip per day, fixes the repeatable trip, C 2.4). Writes `state 'away'`, `departedAt`, `returnAt = max(today RETURN_HOUR, departedAt + MIN_TRIP_MS)`, `pendingMemento = TRIPS[tripNo % 14]` (deterministic, replaces `Math.random`), `lastTripDay = today`. Fires `expedition.start`.

**Lazy departure** (the kid who never finishes the morning): on any advance, if Ronki is home, no trip today, now ≥ 11:00 and at least one morning main quest is done today, depart backdated to 11:00 (so `returnAt` = 17:00, and if that has passed the same advance moves on to `waiting`). No line mentions it; at 19:10 he is simply back with his story. Zero morning tasks means no trip today and no remark.

**Legacy states on old saves:** `leaving` (a trip started from RonkisTag but never walked out, C 2.4) departs at the next advance with `departedAt = now`. `away` with a past `returnAt` becomes `waiting` at once.

**Day rollover:** `applyDayTransition` stays as it is (quests rebuilt). The engine keys everything on the local date string, so missed days are not iterated and nothing accrues or decays while away.

**The cases Marc named:**
- **Weekends and school holidays:** identical. No line says "Schule"; the departure line is "Tschüss!" and the return is "wenn die Sonne tief ist". `buildDay` already drops the pack check at weekends. Ferienmodus stays PRD 11 and out of tonight.
- **Install at 19:30:** evening, head 0.5, three bedtime pictures fill the fire, ritual with `tonight_first_01` and `hook_first_01` ("Morgen früh erzähl ich dir meinen Traum."), night. Day 1 counts as the first day on the path. Next morning: dream 1 as the beat, morning block, first trip, back at 17:00.
- **A kid who opens only in the evening:** no morning tasks, so no trips; each evening open gets the day's dream as its beat (dreams are unconditional), the evening check, bedtime, ritual. Growth moves on every such day. Nothing on screen hints at a missed morning.
- **A kid who never finishes the morning:** one tap is enough for the lazy departure; full fire only decides whether he sees Ronki fly now. Every trip brings the same story and treasure, so a small fire never costs anything.
- **Opened at 14:00 after school while away:** empty nest, Ronki dot at about two thirds of the arc. Tap the note to hear when he is back.

**Growth hook in the engine:** the first completed main quest of a local date adds one day with Ronki (section 5). `getLoopView` exposes `stage`, `daysToNext`, and `beat = 'growth'` when `getCatStage(catEvo) > growthSeenStage`.

**`getLoopView(state, now)` contract** (lane B and D code against this on minute one):
```ts
{ phase: 'morning'|'away'|'back'|'day'|'evening'|'night',
  block: 'morning'|'bedtime'|'afternoon'|null, blockQuests: Quest[], nextQuestId: string|null,
  fire: number /* 0..1 */, firstDay: boolean,
  returnAt: string|null, arc: number /* 0..1 sun to moon while away */,
  beat: 'growth'|'trip'|'dream'|'hello'|null, helloId: string|null, dreamId: string|null,
  pendingTrip: TripEntry|null, gapDays: number,
  stage: number, daysToNext: number|null, nextStageArt: string|null }
```

---

## 5. Growth

**What counts:** a day with Ronki is any local date on which the kid ticks at least one routine picture (main quest, any block). One per day, counted in `complete()`: if `abenteuerLastDay !== today` then `abenteuerTage + 1`, `abenteuerLastDay = today`, `catEvo = max(catEvo, 3 + abenteuerTage)`. Nothing else writes growth; nothing ever subtracts (PRD 6). Days away simply do not add.

**Stages** (existing `CAT_STAGES` thresholds and art, no new art):

| catEvo | Stage | Days with Ronki | Looks it unlocks (never power) |
|---|---|---|---|
| 3 | Baby | 0 | shell hat, small fire |
| 9 | Jungtier | 6 | shell comes off, full Ronki with his mood faces (existing art), a second row on the treasure shelf in the passport |
| 18 | Stolz | 15 | the fire bowl sparkles (code-drawn star ticks in `FireBowl`), a sun sticker on the nest frame |
| 30 | Heranwachsend | 27 | `ronki/grown.webp` |
| 45 | Legendär | 42 | `ronki/legendary.webp`, the path turns gold |

**How a pre-reader sees the next step:** the footprint path under the nest shows one print per day still needed (max 15), filled prints from the left, and at its end the small picture of the next Ronki (`resolveRonkiArt` for the next stage). Tapping the path says the number: "Noch drei Tage mit dir, dann wachse ich." (`path_left_1` to `path_left_15`, new). At the top stage: "Größer geht's nicht. Aber ich wachse trotzdem weiter. Innen drin." (`path_top_01`).

**When catEvo moves and the growth beat:** the moment the first picture of a day lands and crosses a threshold, right after that task's ack: Ronki glows, sticker burst, the new art swaps in, stage line (`grow_stage2_01` to `grow_stage5_01`), 5 s, one tap to close. `growthSeenStage` is set; `ronki.evolve` fires (PRD 5.6). The kid sees the cause (my picture) and the effect (he grew) in the same second.

**Existing saves:** everyone is at catEvo 3. Migration seeds `abenteuerTage = min(5, floor(totalTasksDone / 10))` for onboarded saves, so a long-time player like Louis sits one print before Jungtier and grows on his first picture tomorrow morning. Nobody is pushed past a threshold without seeing the beat.

---

## 6. Ronki's page (the passport)

New `RonkiPassport.jsx`, the Ronki tab. White ground, paper cards, every row a picture first and a number second, every row speaks on tap.

1. **Ronki big** (`RonkiPortrait`, stage art, animated idle), his nickname in Fredoka, a cake doodle with **"{n} Tage alt"** (days since `onboardingDate`, count-up, it cannot break).
2. **"Freund von {Kind}"** with a heart; tap: "Wir zwei sind Freunde." (`pp_friend_01`).
3. **The growth row:** egg, baby, Ronki, grown, legendary silhouettes in a line with the current one ringed, and the same footprint path as the home (shared `GrowthPath`).
4. **Schätze:** a shelf grid of every treasure from `expeditionLog` (3 per row, 2 rows at Baby, more from Jungtier). Tap one: its story plays again in Ronki's voice (`trip_story_NN`). Intro on first tap: "Das sind alle meine Schätze. Tipp einen an, dann erzähl ich nochmal." (`pp_treasures_01`). Finite (14 distinct), free, no rarity.
5. **"Hat von dir gelernt":** the flame doodle for `taughtBreaths.flame` with the date; tap: "Du hast mir das Feuerpusten gezeigt. Weißt du noch?" (`pp_learned_fire_01`). Other taught flavours show when present (existing field), no new teaching flow tonight.
6. Quiet links at the bottom: "Bei Ronki sitzen" (BeiRonkiSein, the calm sit) and "Für Eltern" (lock, PinModal).

**It replaces** the RonkiProfile mood window, the Über / Details / Stärken drawer (with the "Tage zusammen 0" and "Abenteuer 0" rows that were always zero), the Freunde and Feuer segments, the EvolutionTree with "Noch {n} Aufgaben bis hier" (a stale countdown against a frozen catEvo), and the unreachable Pflege and Erinnerungen segments. `RonkiProfile.jsx` stays in the tree behind `legacyProfile` and renders the passport when the switch is off. Its production URL-param state patches (C 3.1, `?stage=`) get a DEV guard.

---

## 7. Cut list

Switch = `src/config/features.ts`, off by default, code kept. A parent toggle "Extras zeigen (Spiele, Tagebuch, Laden)" in the dashboard (`extrasEnabled` in state) turns the extras group back on without a deploy.

| Surface (census 3) | Ruling | Reason |
|---|---|---|
| Nest / RoomHub | keep, rebuilt as section 3 | the one home |
| Heute tab / RonkisTag | hide (`heuteTab`) | the home now is the day; its strip was a second world with 14 cards |
| Ronki tab / RonkiProfile | keep the tab, passport inside; old page hidden (`legacyProfile`) | pride of ownership without reading |
| Tagebuch / Journal | hide (extras) | a writing surface for a kid who cannot write; feelings move to the evening check |
| Laden / Belohnungsbank | hide (extras); Sterne keep accruing silently | points for real-life rewards pull toward a chore tracker (NORTHSTAR); it also held the only parent entry |
| Bei Ronki sitzen | keep, reached from the passport only | calm, strongest writing, but not loud on a rushed home |
| Expedition (Karte) view | hide (`expeditionView`) | departure, away, return and the diary now happen on home |
| RonkiAwayLoop | keep, mounted in the home away window | shows where he is without words |
| CaveStyleSheet | stays unreachable | no painted room pick yet (Bilderbuch decision 5) |
| Mood prompt tiles | keep, moved into the evening check sheet and the header face | pillar 1 kept, off the rushed morning |
| "Wie geht's dir?" pill | replaced by the face doodle | same entry, no reading |
| Ronki speech bubble (6 fixed lines) | keep the bubble, drive it from the loop beat; retire the six lines | "flying cookies" every day is not a relationship |
| Tap Ronki (hearts, `room_tap_*`) | keep | cheap joy, voiced already |
| Fundstücke strip | delete the strip from home; treasures live on the passport shelf and beside the nest | one place for pride |
| RonkisTag parts (Anchor card, EndOfDay, CheerMoment) | hidden with RonkisTag; CheerMoment's jump reused by name only (lane B copies the 1.4 s keyframes) | |
| ToothbrushTimer | stays unreachable | lengthens the morning; id fix is a separate call |
| TonightRitual | keep, extended (hook, first night, exit, state write) | the end beat |
| Profile Freunde segment, Micropedia | hide (`legacyProfile`) | a collection outside the loop |
| Profile Feuer segment, TeachRitualModal | hide (`legacyProfile`); `pendingRitual` keeps queuing | good "kid teaches" idea, next pass |
| Profile Pflege, Erinnerungen, Buch | stay unreachable, no change | dead today, big files |
| FriendIntroCeremony + discovery | hide (`friendCeremonies`), discovery still writes `micropediaDiscovered` silently | two full-screen takeovers in the first minutes (C 1B B3, B4) |
| FreundCallbackCard, FreundIntroModal | hide (with games / never fires) | |
| MemoryWall, DiscoveryLog, CreatureDiscoveryToast, ParentIntroOverlay, FreundSpriteReunion | unreachable, no change | |
| ChibiGallery, RonkiCompendium (`?compendium=1`), previews | keep as URLs | website links the compendium |
| Celebration victory ("Quest Complete!", "Weiter zum Belohnungs-Laden!") | stop queuing it (`victoryCelebration`) | the departure beat is the payoff; the button lied |
| Celebration levelUp / evolution / chest | unchanged (already hidden in public mode) | growth beat replaces evolution |
| TabUnlockCelebration + lock hints | hide (`tabUnlocks`), both tabs always open | nothing to unlock with two tabs |
| CompanionToast ("Super gemacht, Held!") | unmount (`companionToast`) | rotating praise, PRD 6 |
| SpendEffect, PinnedRonki, old TopBar | go with the Laden / Tagebuch | |
| QuestEater flyer | not used; the NowCard does its own fly-to-bowl | |
| AlphaBanner | keep; remove the kid-tappable "DE ▸ EN" (dashboard has language) | a pre-reader switched to English is lost |
| PWAInstallSheet | moved into the parent step and the dashboard; kid path never shows it | |
| PinModal | keep, new entry points | |
| Spielzeug / MiniGames + all 13 games, ForscherEcke, Stamina | hide (extras) | screen-time pull and +50 Sterne per MINT win; PRD 7 still wants Starfighter and CloudJump deleted, that stays a separate commit |
| Emotional tools (dev URLs) | no change | not kid-reachable today |

**Bottom navigation:** two tabs, **Nest** (home doodle) and **Ronki** (dragon doodle), both always open, tap voices `nav_tap_nest` / `nav_tap_ronki` (have). With extras on: Nest, Ronki, Tagebuch, Laden with the old unlock rules.

**How parents reach the dashboard:** the small ink lock top right on the home header and "Für Eltern" at the bottom of the passport, both into PinModal (checks `state.parentPin`, default 1234). No longer gated on 50 Sterne (C 3.1).

---

## 8. Census bugs fixed in the same pass (the ones that touch the loop)

1. Side quests block `morningDone` on about 71 % of days (C 2.1): the engine counts main quests only.
2. Trip return only detected inside Expedition, Ronki still on the cushion while away (C 2.4, 2.7): global advance + empty nest.
3. Return at min(now + 4 h, 14:00) (C 2.4): max(17:00, departure + 2 h).
4. Trip repeatable the same day (C 2.4): `lastTripDay` guard.
5. Trip started on RonkisTag stuck in `leaving` (C 2.4): engine departs it.
6. Memento picked with `Math.random` (TaskContext.tsx:768): deterministic by `tripNo`.
7. Return beat missing, greeting static, `besorgt` dead because `lastDate` is overwritten before the check (C 2.7, 2.8): `gapDays` computed at load from `lastSeenDay` (fallback `lastLoginDate`, then `lastDate`) before the day transition, then `lastSeenDay = today`.
8. `catEvo` frozen at 3, evolution tree counting "Aufgaben" against it (C 2.8, 4): days with Ronki feed it.
9. `totalTaskDays` read, never written; "Tage zusammen" always 0 (C 4): passport uses `onboardingDate` and `abenteuerTage`.
10. `meet_close_01` missing, silent close with an invisible button (C 1B B1): close phase replaced by `ob_name_yes_01`, auto-advance.
11. No kid path without a card (C 1A): egg first.
12. FriendIntroCeremony twice in the first minute (C 1B B3, B4): switched off.
13. Victory celebration always shows (`localStorage['hdx2']` never written) with a lying button (C 2.2): not queued.
14. Rotating CompanionToast praise (C 1B B4): unmounted, fixed per-task acks.
15. Parent dashboard only behind the Laden at 50 Sterne (C 3.1): lock on home and passport.
16. PIN split: dashboard "PIN ändern" uses `localStorage.ronki_pin`, the gate uses `state.parentPin` (C 3.7): dashboard reads and writes `state.parentPin` / `parentPinIsDefault` via `patchState`; the old key is read once as a fallback and then ignored.
17. TonightRitual has no exit for 6.8 s and writes no state (C 2.5): a close doodle from mount; writes `eveningRitualCompletedAt`; story index deterministic by day.
18. BeiRonkiSein text does not match its audio (C 2.5): show the TonightRitual texts that match `tonight_story_<i>` (cheap fix; voicing its own ten texts is the cut-first item).
19. Telemetry: `quest.complete` from the new tap, `mood.pick` from the evening check and header face, `ronki.evolve` on growth, plus the eight PRD 5.5 onboarding events added to the allowlist. The consent flag is mirrored into the analytics module in TaskProvider right after load, so onboarding events respect a website consent (C 7). The `TO authenticated` insert policy is a backend issue and stays open (section 13).
20. RonkiProfile URL params patch state in production (C 3.1): DEV guard.
21. Kid-tappable language toggle in AlphaBanner: removed from the banner.

---

## 9. State changes

All additive and optional; old fields tolerated; nothing is deleted from saves.

| Field | Type | Written by | Default for old saves |
|---|---|---|---|
| `abenteuerTage` | number | `complete()` first main quest of a date | `min(5, floor(totalTasksDone / 10))` if onboarded, else 0 |
| `abenteuerLastDay` | string `YYYY-MM-DD` | same | `''` |
| `tripNo` | number, completed day trips | `receiveMemento()` | `expeditionLog.length` |
| `dreamNo` | number, dreams told | `tellDream()` | 0 |
| `dreamLastDay` | string | `tellDream()` | `today()` on migration (no dream on the update morning if a trip is waiting; harmless) |
| `lastSeenDay` | string | load, after `gapDays` is computed | from `lastLoginDate` or `lastDate` |
| `growthSeenStage` | number | `markGrowthSeen()` | `getCatStage(catEvo)` after the seed |
| `eggFirstLocal` | boolean | MeetRonki completion without a token | absent |
| `parentSetupDeferred` | boolean | ParentAsk "Später" | absent |
| `extrasEnabled` | boolean | dashboard toggle | false |
| `_v_finch_loop` | boolean | migration | set once |
| `expedition.lastTripDay`, `expedition.tripIndex` | inside the existing `expedition` object | `departTrip()` | absent (the object is rehydrated whole, TaskContext.tsx:1055) |
| `pendingMemento.storyId`, `.hookId` | inside the memento | `departTrip()` | absent; old mementos play `trip_back_01` without a story voice and show their text quote |

Reused, now written: `moodPM` (evening check), `eveningRitualCompletedAt` (TonightRitual), `catEvo` (growth). Both are already in the rehydration list (TaskContext.tsx:1016, 1088).

**Derived, never stored:** fire, phase, beat, `gapDays` (kept in `computed`, not persisted), `daysToNext`, "Tage alt".

**Migration `_v_finch_loop`** (inside the existing rehydration block, before `applyDayTransition`): seed the fields above; `catEvo = max(catEvo, 3 + abenteuerTage)` for onboarded saves; `leaving` → handled by the engine; nothing else touched. Louis's save: catEvo 3 → 8, `tripNo` = his log length, shelf keeps every memento he has.

**Rehydration allowlist entries** to add in `TaskContext.tsx` (the explicit object at 1003 to 1199): `abenteuerTage: raw.abenteuerTage ?? undefined`, `abenteuerLastDay`, `tripNo`, `dreamNo`, `dreamLastDay`, `lastSeenDay`, `growthSeenStage`, `eggFirstLocal`, `parentSetupDeferred`, `extrasEnabled`, `_v_finch_loop`. Add them to the `TaskState` type (162 to 542). A test asserts each survives a save and reload (section 12).

**Storage merge rules** in `syncLoadByToken` (utils/storage.ts):
- M1 (unchanged): pristine local + card seed → seed wins. The QR path.
- M2 (new): local `eggFirstLocal && onboardingDone && !parentOnboardingDone` and cloud seed `parentOnboardingDone && !onboardingDone` → merged = local with the seed's `parentOnboardingDone`, `parentHandoffBackSeen`, `parentPin`, `parentPinIsDefault`, `analyticsEnabled`, `familyConfig`; `eggFirstLocal` cleared; pushed to cloud. The kid keeps the dragon, the card keeps the parent's data.
- M3 (new): local `eggFirstLocal` and cloud `onboardingDone` → cloud wins, local discarded (second device).
- In-app parent setup that mints a token clears `eggFirstLocal`.

**New TaskContext actions:** `departTrip(backdated?)`, `tellDream()`, `markGrowthSeen()`, `setEveningMood(i)`, `completeTonight()`, `deferParentSetup()`; `receiveMemento()` also bumps `tripNo`; `complete()` gains the day count and loses the victory queue. The DEV-only `?now=2026-09-26T19:10` param feeds a fake clock to the engine for browser checks.

---

## 10. Build lanes

Four lanes in parallel on `finch/loop-and-onboarding`, each in its own worktree folder per the global rule, merged by the integration pass. No file in two lanes. Contracts on minute one: `getLoopView` shape (section 4), `FEATURES` / `feature(name, state)`, `voiceLines.json` ids (section 11). Lane D writes `voiceLines.json` first (15 minutes, copied from section 11) so B and C can import real text; until then they use the ids.

**Lane A: engine, state, storage, telemetry**
- Owns: `src/loop/loopEngine.ts` (new), `src/loop/loopEngine.test.ts` (new), `src/loop/trips.ts` (new: 14 entries `{ n, emoji, name, place, storyId, hookId }` and 10 dream ids), `src/config/features.ts` (new) + `src/config/features.test.ts` (new), `src/context/TaskContext.tsx`, `src/context/TaskContext.finchLoop.test.jsx` (new), `src/utils/storage.ts`, `src/utils/storage.test.js`, `src/lib/analytics.ts`, `src/lib/analytics.test.ts`.
- Builds: sections 4, 5, 9; bugs 1 to 9, 13, 19 (allowlist and consent mirror); the 60 s advance and visibility listener; DEV clock.
- Tests: every engine case in section 12; migration fixture of an old save; M1 to M3; allowlist round trip.

**Lane B: the nest home**
- Owns: `src/components/drachennest/RoomHub.jsx`, `RoomHub.test.jsx`, `RoomHubBits.jsx`, `RonkiSpeechBubble.jsx`, `RonkiAwayLoop.jsx`, `BeiRonkiSein.jsx`; new `src/components/nest/NowCard.jsx`, `BlockRow.jsx`, `FireBowl.jsx`, `GrowthPath.jsx`, `TripBeat.jsx` (departure and return), `DreamBeat.jsx`, `GrowthBeat.jsx`, `EveningCheck.jsx`, `AwayWindow.jsx`, `taskArt.js` (the TASK_ART map and `artFor` copied out of RonkisTag so B does not touch RonkisTag), `nest.test.jsx`.
- Builds: section 3 in full; the face doodle and lock in the home header (lock calls a new `onOpenParental` prop); bug 18. Uses only Bilderbuch primitives and existing art; RoomHub keeps its measured Ronki geometry.
- Tests: section 12 home cases.

**Lane C: onboarding**
- Owns: `src/components/drachennest/MeetRonki.jsx`, `MeetRonki.test.jsx`, `src/components/NoProfileLanding.jsx`, `src/components/CombinedParentSetup.jsx`, `src/components/HandoffBackCard.jsx`, `src/components/onboarding/TeachFireStep.jsx`, `TeachBreathBeat.jsx`, new `src/components/onboarding/FireIntro.jsx`, `ParentAsk.jsx`, `OnboardingFlow.test.jsx`, `src/components/PWAInstallSheet.jsx` (gains an inline parent variant used by CombinedParentSetup), `src/hooks/usePWAPromptGate.js` (kid-path prompt off).
- Builds: section 2 in full. MeetRonki gets an `onHaveCard` prop and a `mode="egg-first"` that shortens the approach; the close phase becomes the name-yes beat; TeachBreathBeat plays Ronki lines at hold and retry and ends by rendering `FireIntro` instead of the "Weiter zum Lager" pill. NoProfileLanding adds the camera line and the paste field; the scan code is not touched.
- Tests: section 12 onboarding cases.

**Lane D: passport, nav, evening, parent, voice**
- Owns: `src/components/RonkiProfile.jsx`, new `src/components/passport/RonkiPassport.jsx` + `RonkiPassport.test.jsx`, `src/components/NavBar.jsx`, `src/data/tabUnlocks.ts`, `src/components/TabUnlockCelebration.jsx`, `src/components/drachennest/TonightRitual.jsx` + new `TonightRitual.test.jsx`, `src/components/ParentalDashboard.jsx`, `src/components/PinModal.jsx`, `src/components/AlphaBanner.jsx`, new `src/loop/voiceLines.json`, new `scripts/gen-finch-voices.py` (reuses `gen-ronki-voice-bank.py` like `gen-name-chip-voices.py` does, with `OUTPUT_DIR` pointed at this repo's `public/audio/ronki`; the bank's own default points at another folder), all new `public/audio/ronki/de_*.mp3`.
- Builds: sections 6, 7 (nav, dashboard toggle, lock), TonightRitual hook / first night / exit / write, bugs 16, 17, 20, 21; runs the voice batch (smoke 5 lines, listen, then full), checks each file with Whisper as the name chips were.
- Tests: passport, nav, PIN, TonightRitual.

**Integration pass** (orchestrator, after the four lanes land):
- Owns `src/App.jsx`, `src/hooks/useMicropediaDiscovery.ts`, new `src/loop/voiceFiles.test.ts`, `HANDOFF.md`.
- `OnboardingGate`: no token and no parent setup → `OnboardingChain mode="egg-first"` instead of `NoProfileLanding`; "Wir haben eine Karte" renders NoProfileLanding. `OnboardingChain` phase logic in egg-first mode: `!kidIntroSeen` → MeetRonki, else Teach (which calls `completeOnboarding` as today and sets `eggFirstLocal` when there is no token). After it, `AppContent` shows ParentAsk → CombinedParentSetup → HandoffBackCard as a one-time overlay while `!parentOnboardingDone && !parentSetupDeferred`.
- Views: `quests`, `streifen`, `journal`, `shop`, `games`, Expedition routes behind their switches; RoomHub gets `onOpenParental={openPinGate}` and `onOpenTonight`; `CompanionToast` unmounted; ceremonies gated in `useMicropediaDiscovery`; kid `PWAInstallSheet` mount removed.
- Runs `npm test`, `npm run check:names`, `npm run build`, the browser checks, then updates HANDOFF.

---

## 11. Content

All kid lines, Ronki's voice (Harry, `eleven_multilingual_v2`, settings of the bank). File `de_<id>.mp3`. Text in `src/loop/voiceLines.json` is the single source for the screen bubble and the voice script.

**Onboarding (12 new)**

| id | Text |
|---|---|
| ob_egg_call_01 | Psst. Hier drin! Tipp mal auf ein Ei. |
| ob_name_hint_01 | Passt der Name? Dann drück auf den Haken. |
| ob_name_yes_01 | Ja! So heiß ich jetzt. Komm, ich zeig dir was. |
| ob_teach_hold_01 | Ich will Feuer machen. Hilfst du mir? Drück lange auf die Sonne und hol tief Luft. |
| ob_teach_again_01 | Nochmal. Ganz lange drücken. Ganz viel Luft. |
| ob_teach_done_01 | Das vergess ich nie. Du hast es mir gezeigt. |
| ob_fire_intro_01 | Schau, das ist mein Feuer. Es ist erst halb warm. |
| ob_fire_intro_02 | Wenn du deine Sachen machst, wird es ganz warm. Dann kann ich fliegen. |
| ob_parent_call_01 | Jetzt brauch ich kurz Mama oder Papa. Holst du sie? |
| ob_parent_later_01 | Okay. Dann fragen wir sie später. |
| ob_handoff_01 | Da bist du ja wieder! Jetzt weiß ich, wie du heißt. |
| ob_camera_sleep_01 | Die Kamera schläft noch. Hol mal Mama oder Papa. |

**Home and loop (21 new)**

| id | Text |
|---|---|
| d1_first_day_01 | Heute ist unser erster Tag! |
| d1_pick_01 | Was machst du als Erstes? Tipp auf ein Bild. |
| nest_gap_gift_01 | Da bist du ja wieder! Ich hab dir was aufgehoben. |
| nest_gap_hello_01 | Da bist du ja wieder! Ich hab an dich gedacht. |
| fire_half_01 | Schon halb warm! |
| fire_full_am_01 | Mein Feuer ist ganz warm! Jetzt kann ich fliegen. |
| trip_depart_01 | Ich flieg los. Heute Abend erzähl ich dir alles. Tschüss! |
| trip_note_01 | Bin unterwegs! Wenn die Sonne tief ist, bin ich wieder da. |
| trip_back_01 | Ich bin wieder da! Ich hab dir was mitgebracht. |
| trip_open_01 | Tipp mal drauf. |
| trip_shelf_01 | Das stell ich ins Regal. Da kannst du es immer anschauen. |
| eve_mood_ask_01 | Und du? Wie war dein Tag? |
| eve_mood_magic_01 | Oh, ein Glitzertag! Das mag ich. |
| fire_full_pm_01 | Jetzt bin ich warm und müde. Kommst du mit ins Bett? |
| eve_moon_01 | Schlafen gehen? Ich komm mit. |
| night_mumble_01 | Mmh... bis morgen... |
| dream_intro_01 | Weißt du was? Ich hab heute Nacht was geträumt. |
| grow_stage2_01 | Hui! Schau mal! Meine Eierschale ist weg. Ich bin gewachsen! |
| grow_stage3_01 | Schau mal mein Feuer! Es funkelt jetzt. |
| grow_stage4_01 | Hui! Ich bin groß geworden. Fast so groß wie du! |
| grow_stage5_01 | Ich glaub, ich bin jetzt ein ganz besonderer Drache. Wegen dir. |

**Path counts (16 new):** `path_left_1` "Noch ein Tag mit dir, dann wachse ich." and `path_left_2` to `path_left_15` in the same frame with the number word (zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn, elf, zwölf, dreizehn, vierzehn, fünfzehn): "Noch {Zahl} Tage mit dir, dann wachse ich." `path_top_01`: "Größer geht's nicht. Aber ich wachse trotzdem weiter. Innen drin."

**Task asks (14 new voice files, 13 texts already in `constants.ts` as `ronkiAsk`):** `task_ask_s_wake`, `_s_water`, `_s_wash`, `_s_breakfast`, `_s_teeth_am`, `_s_dress`, `_s_packcheck`, `_s_move`, `_s_dinner`, `_s_teeth_pm`, `_s_wash_pm`, `_s_pyjama`, `_s_cuddle` voice the existing `ronkiAsk` text verbatim; `task_ask_ft` new: "Wollen wir uns bewegen? Ich hüpf mit." (also added as `ronkiAsk` on FOOTBALL).

**Task acks (14 new, one fixed line per task):**

| id | Text | id | Text |
|---|---|---|---|
| task_done_s_wake | Wach! Gut, dass du da bist. | task_done_s_move | Puh. Jetzt bin ich nicht mehr steif. |
| task_done_s_water | Ahh. Das tut gut. | task_done_ft | Hui, das war schön. |
| task_done_s_wash | Frisch wie ein Bach. | task_done_s_dinner | Satt und warm. |
| task_done_s_breakfast | Mmh. Jetzt ist der Bauch still. | task_done_s_teeth_pm | Sauber für die Nacht. |
| task_done_s_teeth_am | Blitzeblank! | task_done_s_wash_pm | Der Tag ist abgewaschen. |
| task_done_s_dress | Schick siehst du aus. | task_done_s_pyjama | So weich! |
| task_done_s_packcheck | Alles drin. Gut gemacht. | task_done_s_cuddle | Das war schön. Danke. |

**Trips (14 treasures, 14 stories, 14 hooks, all new voice).** Trip n = `TRIPS[tripNo % 14]`. The first 8 keep the existing memento emoji and name; their old `quote` stays as the shelf text for old log entries. Hook text: "Morgen flieg ich {Ort}. Mal sehen, was da ist." (`hook_NN`).

| NN | Treasure | Ort (hook) | trip_story_NN |
|---|---|---|---|
| 01 | 🍁 Ahornblatt | zum Birkenpfad | Ich war auf dem Birkenpfad. Da lag ein rotes Blatt, das hat in der Sonne geleuchtet. Das hab ich für dich mitgenommen. |
| 02 | 🪶 Feder | zur Lichtung | Auf der Lichtung ist eine Feder runtergesegelt. Ganz langsam, hin und her. Ich glaub, der Vogel braucht sie nicht mehr. |
| 03 | 🪨 Bachstein | zum Bach | Am Bach hab ich einen Stein gefunden. Der ist ganz glatt und kühl. Fühl mal, so glatt. |
| 04 | 🍂 Eichenblatt | zur dicken Eiche | Bei der dicken Eiche hat es bei jedem Schritt geknistert. Dieses Blatt ist ein bisschen golden. Wie mit Sonne angemalt. |
| 05 | 🌰 Eichel | zum Eichhörnchen-Baum | Ein Eichhörnchen hat mit mir Verstecken gespielt. Dabei hat es eine Eichel verloren. Mit einem kleinen Hut drauf! |
| 06 | 🍄 Roter Pilz | zum Tannenkreis | Im Tannenkreis stand ein roter Pilz mit weißen Punkten. Den darf man nicht essen, nur anschauen. Also hab ich ihn mir ganz genau gemerkt. |
| 07 | 🐌 Schneckenhaus | zum Sonnenstein | Auf einem warmen Stein lag ein leeres Schneckenhaus. Es ist rund und dreht sich so rum. Wie eine Schnecke eben. |
| 08 | 🌿 Moos | zum Wurzelhang | Am Wurzelhang wächst Moos, so weich wie ein Kissen. Ich hab kurz drauf geschlafen. Nur ganz kurz. |
| 09 | ☘️ Kleeblatt | zur großen Wiese | Auf der großen Wiese hab ich ein Kleeblatt gesucht. Ich hab die Blätter gezählt. Eins, zwei, drei. Oder vier? Zähl du mal. |
| 10 | 🌲 Tannenzapfen | zu den großen Tannen | Bei den großen Tannen ist mir ein Zapfen auf den Kopf gefallen. Plopp! Hat gar nicht weh getan. |
| 11 | 🌼 Gänseblümchen | auf den Hügel | Oben auf dem Hügel wachsen Gänseblümchen. Ich hab eins gepflückt, ganz vorsichtig. Das ist für dich. |
| 12 | 🫐 Heidelbeere | zum Beerenbusch | Am Beerenbusch hab ich Heidelbeeren gefunden. Ein paar hab ich gegessen. Eine ist noch übrig, die ist für dich. |
| 13 | 🪵 Stöckchen | zur kleinen Brücke | An der kleinen Brücke hab ich ein Stöckchen ins Wasser geworfen. Es ist weggeschwommen. Dann hab ich noch eins gefunden. Das ist jetzt deins. |
| 14 | 🌾 Grashalm | ins hohe Gras | Im hohen Gras hab ich versucht, mit einem Grashalm zu pfeifen. Es kam nur Pusten raus. Morgen üben wir zusammen, ja? |

**Dreams (10 new):** `dream_01` Ich hab geträumt, ich schwimme auf einer Wolke. Die war ganz weich und hat gekitzelt. · `dream_02` Ich hab geträumt, der Mond hat mir gewunken. Ich hab zurückgewunken. Glaub ich. · `dream_03` Im Traum war mein Feuer lila. Und es hat nach Keksen gerochen. · `dream_04` Ich hab geträumt, wir zwei bauen eine Höhle aus Kissen. Die war riesengroß. · `dream_05` Ich hab von einem Fisch geträumt, der singen kann. Er hat ganz schief gesungen. · `dream_06` Im Traum war ich so klein wie eine Ameise. Ein Grashalm war so groß wie ein Baum. · `dream_07` Ich hab geträumt, es regnet Blätter. Rote und gelbe. Ich hab ganz viele gefangen. · `dream_08` Ich hab geträumt, ich kann rückwärts fliegen. Dann bin ich gegen eine Wolke gestoßen. Bumm. · `dream_09` Im Traum hab ich einen Stern gefunden. Er war warm wie eine Tasse Kakao. · `dream_10` Ich hab gar nichts geträumt. Glaub ich. Oder doch? Ich hab's vergessen.

**Evening and passport (5 new):** `tonight_first_01` Heute war unser erster Tag. Das war schön. · `hook_first_01` Morgen früh erzähl ich dir meinen Traum. · `pp_friend_01` Wir zwei sind Freunde. · `pp_treasures_01` Das sind alle meine Schätze. Tipp einen an, dann erzähl ich nochmal. · `pp_learned_fire_01` Du hast mir das Feuerpusten gezeigt. Weißt du noch?

**Reused, no new file:** `meet_hello_01`, `meet_namequest_01`, `name_chip_*`, `teach_fire_smoke_01`, `teach_fire_celebrate_01`, `greet_morning_01`, `greet_evening_01`, `mood_happy_01`, `mood_okay_01`, `mood_sad_01`, `mood_worried_01`, `mood_tired_01` (bubble text for `mood_worried_01` rewritten without its dash: "Ist was passiert? Du kannst es mir erzählen. Oder einfach da sein."), `tonight_invite_01`, `tonight_story_0..9`, `room_tap_0..9`, `nav_tap_nest`, `nav_tap_ronki`, `expedition_return_01` (fallback for old mementos).

**Totals:** 12 + 21 + 16 + 14 + 14 + 28 (14 stories, 14 hooks; the treasures need no voice) + 10 + 5 = **120 new voice files** (about 7,500 characters). Optional cut-first extra: `sit_story_0..9` for BeiRonkiSein's own texts.

**Retired lines:** the six RonkiSpeechBubble lines (including "Ich hab heut Nacht von fliegenden Keksen geträumt."); CompanionToast strings (de.json 529 to 534); victory copy "Quest Complete!", "Alles geschafft! 🎉", "Weiter zum Belohnungs-Laden! 🎁"; MeetRonki close "Ich bin {nick}! Bis morgen. Versprochen." and "tippen zum schließen"; TeachFireStep "Weiter zum Lager"; tab unlock toasts and lock hints (de.json 758 to 767); PWA "Toll gemacht! Ronki ist jetzt dein Begleiter." on the kid path; RoomHub "Ronki ist bereit" card and RonkisTag "Ich geh mal kurz raus. Bin zum Mittag wieder da." (it promised midday); Expedition status "Kommt vor dem Mittag zurück" family. Keys stay in de.json (harmless) until a sweep.

**Art:** none new. Everything uses `public/art/bilderbuch/`: eggs and hatch loops, `ronki/*` moods, poses (wave, cheer, cloud, sleep), stages (baby, grown, legendary), `scenes/zuhause`, `nacht`, `morgenwald`, `loops/zuhause.mp4`, `nacht.mp4`, `ronki-cloud.webp`, and the 12 task pictures. The fire bowl, sun arc, footprints, note and bundle are code-drawn with `DoodleIcon` (flame, sun, moon, paw, gift) and ink outlines. Treasures show their emoji inside a sun paper card tonight; painted treasure stickers are the first art follow-up.

---

## 12. Tests

**Unit (vitest)**
- `loopEngine.test.ts`: fire math with and without the day-1 head; side and afternoon quests ignored; morning full → depart once, second full the same day → no trip; `returnAt` for departures at 07:40 (17:00), 12:00 (17:00), 16:30 (18:30); lazy departure at 11:00 with one task and none with zero; `away` → `waiting` at `returnAt` across a reload; legacy `leaving` departs; deterministic trip order and wrap at 14; dream once per date, dropped when a trip is waiting; beat priority growth > trip > dream > hello; `gapDays` 0, 1, 5; install at 19:30 (evening, three of five fill, first-night flags); evening-only kid over three simulated days (no trip, dream each day, three days on the path); weekend and holiday dates behave like weekdays; no function ever lowers `catEvo`, `abenteuerTage`, `tripNo` or `expeditionLog` length (property loop over random action sequences with a fixed seed).
- `TaskContext.finchLoop.test.jsx`: first main quest of a date adds one day, the second does not; catEvo crosses 9 on the sixth day and `beat = 'growth'`; victory is not queued; `quest.complete` tracked; migration of an old-save fixture shaped like Louis's (onboarded, catEvo 3, totalTasksDone 80, expeditionLog 5, expedition `leaving`, no new fields) gives catEvo 8, `tripNo` 5, the same `companionName`, `familyConfig`, `parentPin` and log; every new field survives save and reload through the allowlist.
- `storage.test.js`: M1 website seed still wins over a pristine local (existing case kept green); M2 egg-first local plus card seed keeps `companionName` and gains `childName`, PIN, consent; M3 egg-first local loses to an onboarded cloud; sibling guard unchanged.
- `OnboardingFlow.test.jsx`: no token → egg shelf first, card link visible; token set → no card link; egg → chips → check → name-yes (no invisible button, no "Bis morgen") → breath → FireIntro; ParentAsk "Später" sets `parentSetupDeferred` and reaches home; parent setup mints a token and clears `eggFirstLocal`; camera error shows the spoken line and the paste field, and a pasted `?p=` URL calls `setActiveToken`.
- `nest.test.jsx` + `RoomHub.test.jsx`: Jetzt card shows the first undone morning picture and plays `task_ask_<id>`; "Geschafft" completes, plays `task_done_<id>`, raises the fire; the row reorders the card; away shows no Ronki and the note plays `trip_note_01`; `back` shows the bundle and the story; evening shows the check once and writes `moodPM`; night shows the sleeping loop; no element text matches `/streak|verpasst|vermisst|Serie/i` in any phase (PRD 6 check).
- `RonkiPassport.test.jsx`: days old from `onboardingDate`, treasures from the log, tap plays the story id, learned fire row, "Für Eltern" opens the PIN gate. `NavBar`: two tabs with extras off, four with extras on. `ParentalDashboard`: PIN change writes `state.parentPin` and the gate accepts it. `TonightRitual.test.jsx`: close works at mount, hook id for the next trip, first-night lines, writes `eveningRitualCompletedAt`.
- `voiceFiles.test.ts` (integration): every id in `voiceLines.json`, `trips.ts` and the task maps has `public/audio/ronki/de_<id>.mp3`; no text in `voiceLines.json` contains an em-dash or en-dash.
- Existing suites stay green (222+), `npm run check:names` clean, `npm run build` green.

**Browser (preview, 390 x 844 frame rig from the surface map, DEV `?now=`)**
1. Clear site data, cold open: egg shelf within 2 s, egg voice plays, full no-card run to home, token and cloud row created (mock supabase).
2. Card path: create a card with `npm run mock:supabase` and the website form, open `?p=`: MeetRonki directly, no ParentAsk, "Hallo {Name}". Then the scan path via the card link with a test QR image.
3. Old save: inject the Louis-shaped fixture into IndexedDB, reload: no onboarding, catEvo 8, shelf intact, name intact, one morning picture grows him to Jungtier.
4. Clock walk with `?now=`: 07:05 morning → full fire → departure; 14:00 away with arc; 19:10 return, story, evening check, bedtime, ritual, night; next day 07:00 dream. Repeat with only one morning task (lazy departure) and with an install at 19:30.
5. Phone check that every kid screen has one loud thing, nothing clipped at 390 px, and the lock opens the dashboard.
6. After the merge: live bundle hash changed, one marker string (`ob_egg_call_01`) inside, an mp3 served.

---

## 13. Risks and what to cut first

**Risks**
- **The voice batch is the long pole** (120 files, Whisper check). If ElevenLabs quota or pronunciation fails on some lines, the screen still shows the bubble text, and a missing file is silent (voiceAudio falls back quietly). The voice-file test would fail the build gate, so it runs as a warning list for tonight and a hard check after.
- **English mode** has no new files; the language toggle leaves the kid path, so only a parent can switch, and missing EN files are silent. Acceptable for the German beta.
- **The merge rules touch the one path that must not break.** M1 code stays as is and its tests stay; M2 and M3 only fire on `eggFirstLocal`, which no existing save has.
- **Clock logic on real devices:** time zones and a tablet with a wrong clock. Everything uses local dates like the existing day transition; a wrong clock at worst makes Ronki early or late.
- **Louis loses games and the Laden overnight.** Marc can flip "Extras zeigen" in the dashboard in ten seconds. Watch whether he asks.
- **Session length:** the evening could grow (story, check, five pictures, ritual with a 12 s lullaby). Target 5 to 8 minutes; the check sheet is skippable with one tap.
- **Telemetry still may not land** (insert policy `TO authenticated`, C 7). The events are wired; whether they arrive needs a backend look, not tonight.
- **Content depth:** 14 trips repeat after about three school weeks. Enough for Louis and gate 1; PRD asks for 30.

**Cut order if time runs short** (first cut first; the core that must ship is egg-first, the home Jetzt card, fire, one trip per day with return, growth feed):
1. `sit_story_*` voicing (fix the BeiRonkiSein mismatch by showing the matching texts only).
2. Painted-quality extras on home: sun arc animation (show a static sun or moon doodle instead), fly-to-bowl animation (just grow the flame).
3. Passport treasure replay (show the shelf, no audio per treasure).
4. The paste field on NoProfileLanding (keep the spoken camera line).
5. Dreams (keep `hello` as the morning beat; the first-night hook becomes "Bis morgen früh.", voiced as `hook_first_01` alt).
6. Stage 3 sparkle and gold path cosmetics.
7. The dashboard "Extras zeigen" toggle (switches stay code-level).
8. Path count voices 1 to 15 (the path stays visual).
Never cut: the egg-first chain with the parent step, the global loop advance with the 17:00 return, the no-subtraction growth, the allowlist entries with the old-save test, and the unchanged QR scan.
