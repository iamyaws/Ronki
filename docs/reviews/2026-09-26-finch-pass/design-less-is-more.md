# Finch pass, design lane "Less is more" (26 Sep 2026)

_Angle: cut Ronki to the smallest set of surfaces that carries the essence, then make that small set deeper than Finch. Built on the census (`docs/research/2026-09-26-ronki-feature-census.md`), the Finch teardown, PRD sections 1 to 7 and NORTHSTAR. Line references point at main `b5643e9`._

**Where I part from the own read.** (a) One trip a day, not two: the trip leaves whenever Ronki's fire fills first, and comes back at the next routine time. A kid who fills it in the morning gets a day trip and an evening return; a kid who fills it in the evening gets a dream trip and a morning return. One story a day, one rule, half the content. (b) Two tabs, not three: Nest and Ronki. The day strip opens from the one loud pill on the Nest and closes back to it. (c) No goal picker tonight: the strip opens on the current block and the kid chooses the order by tapping any card. The parent-set routine is backlog. Everything else in the own read I keep.

---

## 1. The product and the loop in three sentences

Ronki is a small dragon who lives in a nest on the family tablet and needs the kid's real morning and evening to keep his fire warm. Four things done (brushing, dressing, pyjama) fill his fire, a full fire sends him off to the Morgenwald or on a dream trip, and he is back at the next routine time with one treasure and a short story he tells out loud. Every return fills one growth dot, a row of dots makes him grow, nothing ever goes down, and every session ends with Ronki leaving, arriving or falling asleep.

---

## 2. First session script

Times are for a German first grader on a tablet at 07:05. Voice ids play `public/audio/ronki/de_<id>.mp3` through `VoiceAudio.playLocalized(id)`. **New** marks a line from section 11. Existing art only.

### 2A. Family with NO card (the new default path)

| # | Screen (file) | Kid sees | Kid does | Ronki says (voice id) | Seconds |
|---|---|---|---|---|---|
| 1 | Boot → egg shelf (`MeetRonki` approach + shelf). NoProfileLanding is no longer the first screen | Painted room loop, caption "Da hinten leuchtet etwas.", then four eggs wobbling one after the other. Top right, small, for the parent: quiet link "Ich hab eine Karte" | nothing, then taps one egg | silent (pre-hatch stays silent) | 3.6 + tap |
| 2 | Wobble + hatch (`MeetRonki`) | the picked egg trembles, the matching Seedance clip cracks it | watches | silent | 1.4 + 5.0 |
| 3 | Meet | Ronki peeks out wearing the shell | watches | "Hallo. Ich hab auf dich gewartet. Glaub ich." (`meet_hello_01`) | 4.5 |
| 4 | Name | six voiced chips, "selbst schreiben" quiet link | taps a chip (hears it), taps "so soll er heißen" | `meet_namequest_01`, `name_chip_*` | ~8 |
| 5 | Close, **changed** | Ronki large, bubble "Ich bin {nick}!" and a visible pill "Mama oder Papa holen" from the first frame (PRD 5.4) | taps the pill (or the parent does) | **New** "Holst du mal Mama oder Papa? Ich will Hallo sagen." (`onb_get_parent_01`) | 3 |
| 6 | **PARENT COMES IN HERE.** `CombinedParentSetup`, trimmed | Headline "Ronki ist geschlüpft." Two parent sentences: "Morgens und abends macht euer Kind seine Sachen mit Ronki. Dann fliegt Ronki los und kommt mit einer kleinen Geschichte zurück." | The parent is asked exactly three things: **(1) "Wie heißt euer Kind?"** first name, required; **(2) "PIN für den Eltern-Bereich"**, collapsed behind "PIN festlegen", optional, empty means 1234; **(3) "Anonyme Nutzungsdaten teilen?"**, off by default. One pill "Fertig, zurück zum Kind". Quiet link "Wir haben schon eine Karte" opens the scan (2B). Footer: "Die Karte zum Ausdrucken findet ihr später im Eltern-Bereich." | none (parent register, no voice) | 30 to 45 |
| 7 | `HandoffBackCard` | sun sticker "Fertig!", Ronki waving | taps anywhere | **New** "Da bist du ja wieder! Ich will Feuer machen. Hilfst du mir?" (`onb_handback_01`) | 3 |
| 8 | `TeachFireStep` / `TeachBreathBeat` (unchanged beats) | sky ground, hold to breathe, smoke on try 1, fire on try 2 | two holds | `teach_fire_smoke_01`, `teach_fire_celebrate_01` | 6.8 + holds |
| 9 | Teach end, **changed** | two of four flames under Ronki light up one by one; the pill "Weiter zum Lager" becomes "Los geht's" | taps "Los geht's" | **New** before 15:00: "Oh! Mein Feuer brennt schon ein bisschen. Noch zwei Sachen, dann flieg ich los!" (`onb_fire_half_day_01`); from 15:00: `onb_fire_half_night_01` | 4 |
| 10 | Nest, day 1 (`RoomHub`) | Ronki in his nest, fire meter at 2 of 4, one cobalt pill "Los geht's" with a sun doodle. No ceremony, no toast, no install sheet | taps the pill | **New** "Heute ist unser erster Tag!" (`nest_day1_01`) | 3 |
| 11 | Day strip (`RonkisTag`), morning block | the fire meter in the header, the task pictures | does two real things, taps each card | flame 3: **New** "Noch eins, dann ist es voll!" (`fire_3_01`) | real time |
| 12 | Send-off sheet (`SendOff`, new) on the 4th flame | Ronki on his cloud (`loops/ronki-cloud.webp`), the Morgenwald behind, pill "Tschüss, {nick}!" | taps it, watches him fly out (2 s) | **New** `trip_depart_day_01`, then `trip_bye_01` | 6 |
| 13 | Nest, away | the empty room loop (`loops/zuhause.mp4`), Ronki's paper note with a paw print, a moon doodle "zurück am Abend" | may tap the note | **New** `nest_away_note_01` on tap | end |

Kid-facing screen time before the first real task: about 60 s plus the parent's 30 to 45 s. Taps: egg, chip, name pill, parent pill, (parent form), handback, two holds, "Los geht's" twice, two task cards, "Tschüss". The session ends with Ronki gone, which is the natural end beat.

**Install at 19:30:** identical to step 9, then line `onb_fire_half_night_01`; the strip opens on the evening block; the 4th flame shows the send-off in night form (`trip_depart_night_01`, pill "Gute Nacht sagen") which opens `TonightRitual`; it ends on the night loop with Ronki asleep. At 06:00 the dream trip is back (section 4).

### 2B. Delta for the QR card family (card made on ronki.de)

- **Share link `?p=` opened:** exactly as today. `getActiveToken()` consumes the token, `syncLoadByToken` loads the seed, the seed carries `parentOnboardingDone:true` and `parentHandoffBackSeen:true`, so the phase function (section 10, lane C) returns MeetRonki then TeachFire. No parent step, no handback.
- **Scan on the tablet:** the egg shelf's quiet link "Ich hab eine Karte" (or the parent's link in step 6) opens `NoProfileLanding` in scan mode. The scan code, `setActiveToken` and the reload are untouched.
- **Step 5 changes for card families:** no parent call. The pill is "Weiter" and Ronki says **New** "Ich weiß noch gar nichts. Zeigst du mir was?" (`meet_close_card_01`), which leads straight into the breath beat.
- **Egg picked before the scan:** MeetRonki writes `{companionName, companionVariant}` to `localStorage.ronki_pending_hatch` before `setActiveToken`. After the reload, if the loaded state has `kidIntroSeen:false` and no `onboardingDone`, the chain applies the stash and skips to the breath beat. If the cloud already has a hatched dragon, the cloud dragon wins and the stash is dropped (PRD 5.1 rule).
- **Camera refused:** kid copy "Die Kamera schläft noch. Hol mal Mama oder Papa." (**New** `onb_camera_sleep_01`), a field for the parent "Code oder Link einfügen" (parses `p=` from a pasted link or takes the raw code, then the same `setActiveToken` + reload), and a quiet link "Zurück zum Ei".

### 2C. Delta for a returning kid on a second device

- The parent opens the share link from the dashboard (Profil & Geräte) on the new device. The cloud state has `onboardingDone:true`, so the Nest shows straight away with the cloud trip state. Any local pending-hatch stash is dropped.
- If a trip came back while nobody looked, the Nest opens in the "back" state and the return plays here (section 3). The greeting uses `lastGapDays` from the cloud `lastDate`, so it is the same line on either device.

---

## 3. The home screen after onboarding (the Nest)

**Always on the Nest:** "Hallo {Kind}!" with the small "Wie geht's dir?" pill until today's feeling is picked; a small lock top right for parents (PinModal, then the dashboard); the room scene with Ronki; Ronki's one line in a speech bubble, voiced once per day part; **one** loud pill or none; a quiet link "Meine Sachen" to the strip; the treasure shelf (last three) at the bottom; the bottom nav with two tabs.

**Gone from the Nest:** "Heute auf der Schriftrolle", the three block tiles, "Spielzeug", "Karte", "Heute Abend mit Ronki" as a standing card, "Bei Ronki sitzen" as a standing pill (it comes back after a heavy feeling), the six rotating bubble lines, the "Ronki ist bereit" sun card, the six mood tiles as a block (they become one row that only shows until picked).

| Nest state | Scene and Ronki | Fire meter | Ronki's line | Loud pill |
|---|---|---|---|---|
| **Morning, fire warming** (home, no trip today, flames < 4) | `zuhause-ronki` loop, Ronki seated, stage art | shown, 0 to 3 of 4 | `nest_morning_01` or `_02` (alternating by day, not random) | "Los geht's" → strip |
| Feeling row (morning, until picked) | six tiles under the scene | | reaction line per feeling (section 11); after Traurig or Besorgt also `mood_sit_offer_01` | after a heavy feeling, the pill becomes "Bei Ronki sitzen" → BeiRonkiSein, then back |
| **School time, fire not full** (08:00 to 15:00) | Ronki seated | shown | `nest_school_01`, no guilt | "Meine Sachen" |
| **Away, day trip** | empty room loop `loops/zuhause.mp4`, paper note with paw, moon doodle | hidden | note plays `nest_away_note_01` on tap | none. Quiet link "Meine Sachen" |
| **Back** (return due) | `zuhause-ronki` with Ronki in `wave` pose (stage 2 and up; baby keeps its art), gift doodle beside him | hidden | `trip_back_day_01`, `trip_back_night_01` or `trip_back_late_01` | "Schau mal!" → TripReturn |
| **Evening, trip done today** | Ronki seated, new treasure on the shelf | hidden | `nest_evening_01` | "Abendsachen" → strip (evening block); once the block is done or from 19:00: "Gute Nacht sagen" → TonightRitual |
| **Evening, no trip yet** | Ronki seated | shown | `nest_evening_fire_01` | "Abendsachen" |
| **Night trip set, still awake** (kind night, before 19:00 and before the ritual) | Ronki seated, full fire | full, glowing | `nest_night_ready_01` | "Gute Nacht sagen" |
| **Night** (ritual done today, or a night trip after 19:00) | `loops/nacht.mp4`, Ronki asleep (a dream trip is Ronki asleep) | hidden | none | none |

**After 1 day away** (`lastGapDays` = 2, one missed day): the greeting is `nest_back_short_01` "Du bist wieder da! Ich hab von dir geträumt." If a trip is waiting, the Back state comes first and the greeting is the return line. Nothing else differs. No worried face (Marc's decision 4 of 25 Sep).

**After 5 days away** (`lastGapDays` ≥ 3): with a treasure waiting, `trip_back_late_01` "Da bist du ja! Ich hab auf dich gewartet. Schau mal, was ich dir aufgehoben hab." then the normal return. Without one, `nest_back_long_02` "Da bist du ja wieder! Schön, dass du da bist." Fire starts at 0 like any day, growth dots are exactly where they were.

**Morning after a dream trip:** the Back state uses `scenes/morgen.webp` (Ronki yawning in bed) as the TripReturn backdrop, then the Nest goes to "Morning, fire warming".

**TripReturn sheet** (new, lane B): backdrop by kind (`zuhause-ronki` by day, `morgen` after a dream), the treasure emoji large on a sun `PaperCard`, its place ("Am Bach"), the story voiced automatically (`treasure_<slug>`) with the text under it for the parent, one pill "Aufs Regal" (`trip_shelf_01`). Then the growth row: one dot fills with a 1 s pop and `grow_dot_01`; the first time only, `grow_dots_01` explains the dots; with one dot left, `grow_one_left_01`. If the row is full, Ronki's art swaps to the next stage with a `StickerBurst` and `grow_step_01`. Then back to the Nest. About 15 s, 2 taps.

---

## 4. The loop engine

Pure functions in `src/loop/tripEngine.ts`, fed by `now` from `src/loop/loopClock.ts` (DEV override `?loopNow=2026-09-26T17:05` for tests and the browser checks). Stored state keeps the existing `expedition.state` names; the UI phase is derived.

### 4.1 Values

- `flamesToday = min(4, mainDoneToday + (onboardingDate === today ? 2 : 0))`. Main means `!q.sideQuest` and done today. Side quests never count (fixes the RoomHub bug). The breath on day 1 is worth two flames, so the first trip always happens on day 1.
- `FIRE_FULL = 4`. Morning has 6 to 7 main tasks, evening 5, so four is reachable in either block alone.
- `kindFor(now) = hour < 15 ? 'day' : 'night'`.
- `returnAtFor(kind, departedAt)`: day → 17:00 on the departure date; night → 06:00 on the next date. Local time.
- One trip per calendar date: `lastTripDate !== today`.

### 4.2 States and transitions

| Stored `expedition.state` | Meaning | Leaves by |
|---|---|---|
| `home` | Ronki is in the nest | **T1 depart** |
| `away` | on a trip, `kind`, `departedAt`, `returnAt`, `pendingMemento` set | **T2 due** |
| `waiting` | back, treasure not yet shown | **T3 receive** |
| `leaving` (legacy) | stuck state from the old RonkisTag path | migrated to `home` on load |

- **T1 depart:** after every `complete()` and after T3, inside the same state updater: if `state === 'home'` and `flamesToday >= 4` and `lastTripDate !== today` → `away`, `kind = kindFor(now)`, `returnAt`, `pendingMemento = nextTreasure(log)`, `lastTripDate = today`, `track('expedition.start')`. Departure is automatic at the 4th flame; the send-off sheet is the ceremony, so a kid who closes the app at that moment still sends Ronki off.
- **T2 due:** `useTrip` re-checks on mount, every 60 s while visible, and on `visibilitychange`: if `away` and `now >= returnAt` → `waiting`, `track('expedition.return')`. This replaces the poll that only ran inside Expedition.
- **T3 receive:** the "Aufs Regal" tap → `home`, treasure into `expeditionLog` (cap 24 stays), `adventuresDone + 1`, growth step (section 5), `track('memento.received')`, then T1 again (if the fire is already full and no trip left today, he leaves again with `trip_depart_again_01`).
- **Day change:** the load transition sets `lastGapDays` from the previous `lastDate`; flames are derived, so they start at 0; `tonightDoneDate` is date-compared, so nothing to reset. If the tablet stays open past midnight, `useTrip` sees the date change on the next visible tick and reloads the page, so `applyDayTransition` runs (today it only runs on load).

### 4.3 Derived UI phase (for the Nest and the strip)

`warming` (home, flames < 4) · `away-day` · `away-night-awake` (night kind, before 19:00 and tonight not done) · `away-night-asleep` · `back` (waiting) · `rest` (home, trip done today) · `night` (tonight done today).

### 4.4 The cases

| Case | What happens |
|---|---|
| Normal school day | 07:10 four morning things → day trip, back 17:00. 18:30 open: Back, treasure, dot. Evening strip, "Gute Nacht sagen", ritual, night loop |
| Weekend | Same rules, no packcheck task. A 09:30 departure is back at 17:00 |
| School holidays | Same rules; nothing says "Schule". Ferienmodus (PRD 11) stays backlog |
| Install at 19:30 | Two flames from the breath, two evening tasks → night trip at about 19:45, back 06:00. Morning: dream return, then a fresh fire for a day trip. Two trips in 24 h, each on its own date |
| Kid who opens only in the evening | Evening tasks fill the fire → night trip. Next evening: `trip_back_late_01` if more than 18 h passed since `returnAt`, else `trip_back_night_01`; then the evening fire sends him again |
| Kid who never finishes the morning | Flames stay for the whole day. School time line `nest_school_01`. Evening tasks finish the fire → night trip. If the day ends at 3 of 4, tomorrow starts at 0 and Ronki says the normal morning line. No trip, no loss, no mention |
| Fire filled while a treasure waits | T1 blocks until T3; the receive then sends him off at once |
| Fire filled 15:00 to 19:00 | Night trip is set but Ronki stays visibly awake (`nest_night_ready_01`) until the ritual or 19:00 |
| Kid away for days | `waiting` persists. Ronki waits with the treasure; nothing decays |

### 4.5 Guardrail check (PRD 6)

Fire resets each morning like a new day, never shown as lost; no counter of days in a row exists anywhere. Treasures come in a fixed order (no `Math.random` in the pick), every trip brings one. Growth only adds. No notification. Praise is one fixed line per flame count, not a rotating string. Every session ends on a send-off, a return or sleep. No screen time is gated or unlocked.

---

## 5. Growth

- **What counts:** one adventure = one received trip (T3). At most one trip starts per date, so adventures are adventure days. Stored as `adventuresDone`.
- **catEvo moves at the return**, never at load: `catEvo = min(3 + adventuresDone, nextThreshold(catEvo))`. So one return can grow Ronki by at most one stage, and a save that carries old trips catches up one step per return. Thresholds stay `CAT_STAGES` (3, 9, 18, 30, 45): 6 adventures to Jungtier (about a week), then 9, 12, 15. Finch uses 7 to the toddler stage.
- **How a pre-reader sees the next step:** a row of round dots under Ronki on the TripReturn sheet and on his page. Filled = `catEvo − stageStart`, total = `nextThreshold − stageStart` (6, 9, 12, 15 dots). One dot fills per return with a pop and a voice line. No numbers on kid surfaces; the passport prints the count small for the parent.
- **What each stage unlocks, looks only:**

| Stage (catEvo) | Look | Where it shows |
|---|---|---|
| Baby (3) | shell hat of his egg (`ronki/baby-<egg>.webp`) | Nest, passport |
| Jungtier (9) | shell off, full mood set, `wave` pose when he comes back | Nest moods, Back state |
| Stolz (18) | `proud` pose on his page; the `cheer` jump (`loops/ronki-cheer.webp`) on every send-off | passport, SendOff |
| Heranwachsend (30) | `grown` art | everywhere |
| Legendär (45) | `legendary` art, the dots row is replaced by `grow_top_01` | everywhere |

- On each step: `track('ronki.evolve', {stage})` (the event exists in the allowlist and never fired).

---

## 6. Ronki's page (the passport)

New `src/components/RonkiPass.jsx` on the Ronki tab. It replaces `RonkiProfile` in the tab (mood window, the Über/Details/Stärken drawer, EvolutionTree, the Freunde and Feuer segments) and it replaces Expedition's Naturtagebuch and DiaryModal as the place where finds live. `RonkiProfile.jsx` stays in the repo, unrouted.

Top to bottom, white ground, one screen plus the shelf:

1. Ronki large in his current stage art, a sound button that plays `pass_intro_01`.
2. Name "{nick}", and under it three fact stickers with doodles: egg doodle "aus dem {Farbe} Ei" (from `companionVariant`), heart "Freund von {Kind}", cake "{n} Tage alt" (`today − onboardingDate + 1`, count-up only; fixes the "Tage zusammen: 0" bug).
3. Growth: stage name ("Baby", "Jungtier", ...) and the dots row; tapping the dots plays `grow_dots_01`.
4. "Hat von {Kind} gelernt" with a flame doodle: "Feuer machen" (`taughtSignature`), tap plays `pass_taught_fire_01`.
5. Places: one card with `scenes/morgenwald.webp`, "Morgenwald".
6. Treasure shelf: 14 slots in trip order, found ones show their emoji, open ones a dotted outline. Tapping a found one plays its story (`treasure_<slug>`) and shows the text. Legacy finds from old saves show with their old quote and no voice. When all 14 are found, `trip_regal_full_01` plays once.
7. Small parent line at the bottom: "{adventuresDone} Abenteuer".

No segments, no drawer, no numbers the kid must read, no second scroll page.

---

## 7. Cut list

Switch: `src/config/features.ts` exports `extrasOn(state)` = `state.extrasEnabled === true` (DEV also `?extras=1`). The parent turns it on in the dashboard: "Mehr zum Spielen (Spiele, Tagebuch, Laden)", default off for everyone, Louis included. With extras on, the old tabs and tiles come back exactly as they are today. Sterne keep counting silently either way.

| Surface (census 3) | Ruling | Reason |
|---|---|---|
| Nest (RoomHub) | **keep, rebuilt** | the home of the loop |
| Heute (RonkisTag) | **keep, not a tab** | reached from the one pill; its own back already covers the nav |
| Ronki tab (RonkiProfile) | **hide behind switch**, replaced by RonkiPass | seven tappables and dead counters; the passport carries the pride |
| Tagebuch (Journal) | **hide behind switch** | a writing surface for a pre-reader; feelings live on the Nest; PRD 7 folds it away |
| Laden (Belohnungsbank, redeem modal, TopBar Sterne) | **hide behind switch** | an extrinsic shop is the opposite of the care inversion; was the only parent entry (moved to the Nest lock) |
| Bei Ronki sitzen | **keep, offered after Traurig or Besorgt** | feelings pillar with one warm tool instead of a tool list |
| Expedition + Naturtagebuch + DiaryModal | **hide behind switch** (tile "Karte" gone) | return plays on the Nest; finds live on the passport |
| RonkiAwayLoop | **hide** (inside Expedition) | away is shown as the empty nest |
| CaveStyleSheet | **stays hidden** | already off (`SHOW_ROOM_STYLE`) |
| Mood prompt + "Wie geht's dir?" pill | **keep** | once a day, one tap, voiced reaction |
| RonkiSpeechBubble | **keep, state-driven** | the six random lines go |
| Tap Ronki (hearts, `room_tap_*`) | **keep** | presence, not a reward |
| Fundstücke shelf | **keep** | last three treasures, the "today is different" trace |
| RonkisTag parts | **keep**; AnchorCompleteCard → SendOff; CheerMoment stays; EndOfDayScene pill "Gute Nacht sagen" | one ending per block |
| ToothbrushTimer | **stays hidden** | unreachable today; a 2-minute on-screen timer lengthens the session |
| TonightRitual | **keep, trimmed** | the night end beat; "Nochmal" goes, a close button from the first second |
| Profile segments Freunde, Feuer, Pflege, Erinnerungen; Buch; TeachRitualModal; FireBreathCollection | **hide** (with RonkiProfile) | collections and rituals at 30/70/130 tasks lengthen and branch the loop |
| Micropedia, FriendIntroCeremony, FreundCallbackCard, FreundIntroModal | **hide behind switch** | the ceremony takes over the first home arrival and the first task; discoveries still record silently |
| FreundSpriteReunion, MemoryWall, DiscoveryLog, BaumPoseBeat | **leave** | already unreachable |
| ChibiGallery (dev), RonkiCompendium (public `?compendium=1`) | **keep** | dev tool; the website links the public book |
| CelebrationQueue | **keep** | infra |
| Celebration victory "Quest Complete!" | **stop queueing** | "Weiter zum Belohnungs-Laden" and a second finale compete with the send-off |
| TabUnlockCelebration + locks | **unmount when extras off** | no locked tabs left |
| CompanionToast | **unmount** | random praise strings ("Super gemacht, Held!") are slot-machine praise |
| SpendEffect, QuestEater, PinnedRonki | **hide** (with Laden and Tagebuch) | only mounted there |
| CreatureDiscoveryToast, ParentIntroOverlay | **delete** | imported, never rendered (provably dead) |
| AlphaBanner | **keep, label only** | "DE ▸ EN" and "Rückmeldung" are kid-tappable; both already live in the dashboard |
| SWUpdateBanner | **leave** | cannot fire (SW unregistered) |
| PWAInstallSheet | **keep, from day 2** | on day 1 it lands on top of the send-off |
| PinModal | **keep** | the parent gate |
| MiniGames + Memory, StarCatcher, Potion, KristallHöhle, ForscherEcke and the MINT games, stamina UI | **hide behind switch** ("Spielzeug" tile gone) | session lengtheners; one MINT win pays five tasks in Sterne |
| Starfighter, CloudJump | **delete tiles** (files stay until a later sweep) | PRD 7 kill list, wrong genre |
| CampfireVisitors | **leave** (dev) | |
| Emotional tools (DreiDanke, LöwenPose, ...) | **leave** (dev) | not reachable today; the tool pillar comes back as one tool at a time |
| Legacy TaskList, DailyHabits, ToothBrushGuide | **delete** | never rendered; PRD 7 says delete |
| Special quests, arcs | **gate behind switch** | silent xp and arc offers with no UI |
| ParentalDashboard | **keep, fixed** | PIN fix, the extras switch |

**Bottom navigation:** two tabs, "Nest" (house doodle) and "Ronki" (dragon doodle), both open from the first second (no locks, no unlock toast). With extras on: Nest, Ronki, Tagebuch, Laden with today's unlock rules.

**Parents reach the dashboard** through the small lock at the top right of the Nest → PinModal (`state.parentPin`, default 1234) → ParentalDashboard. Nothing else changes for them.

---

## 8. Census bugs to fix in the same pass

1. Return only detected inside Expedition (Expedition.jsx:155-167) → global T2 in `useTrip`.
2. RonkisTag start leaves the trip at `leaving` (RonkisTag.jsx:631-654, App.jsx:442-445) → automatic T1; migrate `leaving` to `home`.
3. Trips repeat the same day (TaskContext.tsx:1990-1998) → `lastTripDate`.
4. Return at min(now + 4 h, 14:00) (TaskContext.tsx:2012-2018) → next routine time.
5. Side quests counted in `morningDone` (RoomHub.jsx:165-172) → engine counts main only.
6. RoomHub keeps Ronki on the cushion while away (RoomHub.jsx:309-378) → Nest states.
7. `meet_close_01` requested but missing (MeetRonki.jsx:152) → new close lines.
8. Greeting bank unwired and `besorgt` absence trigger dead (TaskContext.tsx:1440 vs 2477) → `lastGapDays` and state greetings.
9. CompanionToast random praise (CompanionToast.jsx:6-13) → unmounted; fixed flame lines.
10. Victory celebration with the Laden button (TaskContext.tsx:1577, Celebration.jsx:119-165) → not queued from `complete()`.
11. FriendIntroCeremony on first arrival and after the first task (App.jsx:256-273) → gated.
12. TonightRitual: no exit for 6.8 s, writes no state (TonightRitual.jsx:130-134) → close button, `tonightDoneDate`.
13. BeiRonkiSein shows ten texts but plays the TonightRitual audio (BeiRonkiSein.jsx:24-35 vs 87) → show the texts the audio says.
14. Dashboard reachable only through the Laden at 50 Sterne (TopBar.jsx:25, 62-65) → lock on the Nest.
15. PIN split: dashboard "PIN ändern" uses `localStorage.ronki_pin` (ParentalDashboard.jsx:1022-1052), the gate uses `state.parentPin` (PinModal.jsx:12-21) → dashboard reads and writes `state.parentPin` and `parentPinIsDefault`.
16. "Tage zusammen" always 0 (`totalTaskDays` never written) → passport counts from `onboardingDate`.
17. `catEvo` frozen at 3 → growth at T3.
18. Telemetry: `quest.complete` from RonkisTag, `mood.pick` from the Nest, `ronki.evolve`, and the PRD 5.5 funnel names added to the allowlist (analytics.ts:26-55); TaskProvider mirrors `analyticsEnabled` into the module flag right after load so raw `track()` during onboarding respects the website consent.
19. Day transition only on load → reload on a date change while visible.
20. PWA sheet on day 1 (usePWAPromptGate.js:102-123) → requires `onboardingDate !== today`.
21. Kid-facing camera error and no fallback (NoProfileLanding.jsx:183-191) → 2B copy and the paste field.

Not in this pass: teeth id mismatch (the timer stays hidden), `hdx2` key (victory no longer queued), `arcEngine` rehydration, the PRD 7 removal of dead economy fields (a migration on live saves is not worth the risk tonight).

---

## 9. State changes

All optional, all additive. Old fields stay and are tolerated. No Supabase change: the state is one JSON blob per card.

| Field | Type | Written by | Default on rehydrate (old saves) |
|---|---|---|---|
| `adventuresDone` | number | T3 | `expeditionLog.length` (trips the kid really did) |
| `lastTripDate` | `YYYY-MM-DD` | T1 | date of `expedition.departedAt` when `away` or `waiting`, else undefined |
| `expedition.kind` | `'day' \| 'night'` | T1 | `'day'` when missing |
| `pendingMemento.treasureId` / log entry `treasureId` | string | T1 | mapped by `name` through `treasureByName`; unknown names ("Roter Pilz") stay legacy |
| `lastGapDays` | number | `applyDayTransition` (days between the old `lastDate` and today) | 1 |
| `lastGreetAt` | ISO string | Nest after the greeting voice (plays again after 3 h) | undefined |
| `tonightDoneDate` | `YYYY-MM-DD` | TonightRitual end | undefined |
| `sendOffSeenFor` | ISO string (the trip's `departedAt`) | SendOff | undefined |
| `extrasEnabled` | boolean | dashboard switch | `false` |

**Derived, never stored:** `flamesToday`, UI phase, `returnAt` label (sun or moon), dots filled and total, stage index, days together, next treasure.

**Migration on load (inside the existing rehydration, TaskContext.tsx:1003-1199):** `expedition.state === 'leaving'` → `{state:'home', biome:'morgenwald'}`; `away` with an old short `returnAt` is kept (it simply comes back sooner); `waiting` is kept; `catEvo` is **not** touched on load (the first return does the step, so Louis gets a real growth moment instead of a silent jump).

**Rehydration allowlist entries to add:** `adventuresDone`, `lastTripDate`, `lastGapDays`, `lastGreetAt`, `tonightDoneDate`, `sendOffSeenFor`, `extrasEnabled`; `expedition` already passes through raw and gets the migration and the `kind` default.

**Local storage (not state):** `ronki_pending_hatch` for the card-after-hatch case, cleared once used or once `onboardingDone` is true.

**Untouched:** the website seed (`website/src/lib/profileSetup.ts`), `utils/storage.ts` (sync, sibling guard, pristine guard), `lib/profileToken.ts`, the Supabase schema.

---

## 10. Build lanes

Rules for all lanes: no lane edits a file another lane owns; nobody edits `src/App.jsx` except the integration pass; kid copy and voice ids come from `src/data/loopLines.ts` (lane D writes it first, in its first 15 minutes, from section 11 verbatim; until then lanes import the ids and fall back to the text); no em-dashes; `npm test` and `npm run check:names` green before handing over.

### Lane A: loop engine and state

**Owns:** `src/context/TaskContext.tsx`, `src/loop/tripEngine.ts` (new), `src/loop/tripEngine.test.ts` (new), `src/loop/loopClock.ts` (new), `src/hooks/useTrip.ts` (new), `src/config/features.ts` (new), `src/lib/analytics.ts`, `src/hooks/usePWAPromptGate.js`, `src/context/TaskContext.loop.test.tsx` (new), `src/context/__fixtures__/save-2026-09-louis-shape.json` (new).

**Builds:** the section 9 fields, defaults, migration and allowlist entries; `tripEngine` pure functions (`flamesToday`, `kindFor`, `returnAtFor`, `canDepart`, `uiPhase`, `nextTreasure`, `growthAfterReturn`, `dots`, `daysTogether`, `greetingFor`); T1 inside `complete()`, a new `receiveTrip()` action (T3, wraps `receiveMemento`), `markTripBack()` (T2), `setExtrasEnabled`, `markGreeted`, `markTonightDone`, `markSendOffSeen`; `lastGapDays` in `applyDayTransition`; stop queueing victory in `complete()`; `useTrip()` returning `{phase, flames, kind, returnAt, treasure, dots, stage}` with the 60 s tick, visibility re-check and the midnight reload; `extrasOn(state)`; analytics allowlist additions (`onboarding.landing.view`, `onboarding.egg.pick`, `onboarding.hatch`, `onboarding.name.confirm`, `onboarding.scan.start`, `onboarding.scan.result`, `onboarding.teachfire.complete`, `first.task.complete`) and the module-flag sync after load; PWA gate `onboardingDate !== today`. `startExpedition`/`rangerDeparted` stay for the hidden Expedition.

**Tests:** `tripEngine.test.ts` (flames with and without the day-1 bonus, side quests ignored, kind at 14:59 and 15:00, returnAt for 07:30, 14:59, 15:00, 19:30, 23:59 and a month end, one trip per date, T1 blocked while `waiting`, treasure order fixed and skipping collected names, legacy name map, growth capped at one stage per return, dots per stage, legendary end); `TaskContext.loop.test.tsx` (the fixture loads without onboarding, fields defaulted, `leaving` migrated, `adventuresDone` from the log, `catEvo` unchanged on load, complete ×4 departs once, second fill the same day does not depart, receive grows and logs, `lastGapDays` after a 5-day gap, `extrasEnabled` false).

### Lane B: the Nest and the day

**Owns:** `src/components/drachennest/RoomHub.jsx`, `RoomHubBits.jsx`, `RoomHub.test.jsx`, `RonkiSpeechBubble.jsx`, `FireMeter.jsx` (new), `FireMeter.test.jsx` (new), `TripReturn.jsx` (new), `TripReturn.test.jsx` (new), `SendOff.jsx` (new), `RonkisTag.jsx`, `RonkisTag.test.jsx`, `BeiRonkiSein.jsx`.

**Builds:** the Nest per section 3 (state table driven by `useTrip().phase`, one loud pill, lock button calling a new `onOpenParental` prop, quiet "Meine Sachen", feeling row with voiced reactions and the sit offer, `mood.pick` event, greeting once per day part via `markGreeted`, Ronki's note when away, extras-only "Spielzeug" and "Karte" tiles behind `extrasOn`); `FireMeter` (four flame doodles, lit ones in ember with the `bb-lift` offset, a 400 ms pop on light, `aria-label` "Feuer {n} von 4"); `SendOff` (day and night forms, cloud or cheer pose by stage, `markSendOffSeen`); `TripReturn` (section 3 sheet, `receiveTrip`, dots and growth step); RonkisTag: FireMeter in the header, fixed flame lines, `quest.complete` and `first.task.complete` events in `handleTap`, SendOff instead of AnchorCompleteCard, EndOfDayScene pill "Gute Nacht sagen", a new `onSendOff` prop is not needed (SendOff renders inside the strip); BeiRonkiSein shows the texts that match `tonight_story_<i>`.

**Tests:** RoomHub (each phase renders its one loud pill and line; lock calls `onOpenParental`; no "Spielzeug" when extras off; feeling pick fires `mood.pick`; heavy feeling shows "Bei Ronki sitzen"); FireMeter (0 to 4, aria label); TripReturn (plays the treasure voice id, "Aufs Regal" calls `receiveTrip`, growth step renders the next stage); RonkisTag (tap lights a flame, 4th tap shows SendOff, no CompanionToast text, `quest.complete` fired).

### Lane C: the first session

**Owns:** `src/components/onboarding/onboardingPhase.ts` (new) + `onboardingPhase.test.ts` (new), `src/lib/pendingHatch.ts` (new) + `pendingHatch.test.ts` (new), `src/components/drachennest/MeetRonki.jsx`, `MeetRonki.test.jsx`, `src/components/NoProfileLanding.jsx`, `src/components/NoProfileLanding.test.jsx` (new), `src/components/CombinedParentSetup.jsx`, `src/components/HandoffBackCard.jsx`, `src/components/onboarding/TeachFireStep.jsx`, `src/components/onboarding/TeachBreathBeat.jsx`, `src/i18n/de.json`, `src/i18n/en.json` (the only lane that touches the i18n files; it also takes other lanes' key requests).

**Builds:** `pickPhase(state, {hasToken, wantsCard})` returning `'landing' | 'meet' | 'parent' | 'handback' | 'teach' | 'app'` in the new order (meet first; parent and handback only when `!parentOnboardingDone`; landing only when `wantsCard` and no token); MeetRonki quiet link "Ich hab eine Karte" (calls a `onWantsCard` prop), the close phase with a visible pill from frame one and the two close variants (`needsParent` prop), writing the pending-hatch stash, funnel events; NoProfileLanding kid camera copy, the paste field, "Zurück zum Ei"; CombinedParentSetup trimmed per step 6 (PIN collapsed, the two loop sentences, "Wir haben schon eine Karte", the 390 px overflow fix from the surface map); HandoffBackCard voice line; TeachBreathBeat end: two flames light, pill "Los geht's", the day or night line, `onboarding.teachfire.complete`.

**Tests:** `pickPhase` (no token, no flags → meet; after meet → parent; after parent → handback → teach; website seed → meet → teach; orphan token → meet → parent; `wantsCard` → landing; `onboardingDone` → app); pendingHatch (write, apply only when the loaded state is not hatched, drop when `onboardingDone`); MeetRonki (existing 7 stay green, link calls `onWantsCard`, pill visible at once in the close phase, card variant plays `meet_close_card_01`); NoProfileLanding (paste of `https://app.ronki.de/?p=abc` and of `abc` both call `setActiveToken('abc')`, denied camera shows the kid line).

### Lane D: Ronki's page, the evening, parents, words and voice

**Owns:** `src/components/RonkiPass.jsx` (new) + `RonkiPass.test.jsx` (new), `src/components/drachennest/TonightRitual.jsx`, `TonightRitual.test.jsx` (new), `src/components/NavBar.jsx`, `src/data/tabUnlocks.ts`, `src/components/ParentalDashboard.jsx`, `src/components/AlphaBanner.jsx`, `src/data/loopLines.ts` (new), `src/data/treasures.ts` (new), `src/data/loopLines.test.ts` (new), `scripts/gen-loop-voices.py` (new), `public/audio/ronki/de_<new ids>.mp3` (new files).

**Builds:** `loopLines.ts` first (every section 11 line: `{id, text}`; lookups by phase, feeling and flame), `treasures.ts` (14 entries `{slug, name, emoji, location, story, voiceId}`, `TREASURE_ORDER`, `treasureByName` with the legacy map); the voice script (a copy of the Harry settings from `gen-ronki-voice-bank.py`, reads `loopLines.ts` and `treasures.ts` so text and audio can never drift, `--smoke` for five lines first, Whisper check as for the name chips) and the 56 files; RonkiPass per section 6; TonightRitual: close button from the first frame, "Nochmal" gone, the hook line by phase at the black screen, `markTonightDone`; NavBar two tabs when extras off (Nest, Ronki), four with extras; tabUnlocks returns unlocked for `ronki` when extras off; dashboard: PIN on `state.parentPin`, the switch "Mehr zum Spielen (Spiele, Tagebuch, Laden)", one line in Übersicht "Ronki heute: im Morgenwald / zu Hause / schläft"; AlphaBanner label only.

**Tests:** `loopLines.test.ts` (every id unique, no em-dash (U+2014) or en-dash (U+2013) in any text, every id has `public/audio/ronki/de_<id>.mp3` on disk, every treasure has a story of at most three sentences); RonkiPass (renders name, days, dots, 14 slots, tap plays the story id, legacy find shows without voice); TonightRitual (close works during enter, no "Nochmal", hook line id per phase, `markTonightDone` called); NavBar (two tabs by default, four with extras); dashboard PIN (a PIN set in setup opens the change dialog, a changed PIN opens PinModal).

### Integration pass (orchestrator, after the four lanes)

**Owns:** `src/App.jsx`, `src/components/MiniGames.jsx`, deletions, `HANDOFF.md`.

1. `OnboardingGate` and `OnboardingChain` call `pickPhase`; `wantsCard` is component state set by MeetRonki's link and CombinedParentSetup's link; the chain applies the pending hatch after load; `needsParent = !state.parentOnboardingDone`.
2. View `ronki` renders `RonkiPass`; views `journal`, `shop`, `games`, `buch`, `mint-game`, Micropedia only when `extrasOn(state)`, else fall back to `hub`.
3. RoomHub gets `onOpenParental={openPinGate}`; RonkisTag loses `onOpenExpedition`.
4. Unmount `CompanionToast` and `FreundCallbackCard`; `TabUnlockCelebration`, `useSpecialQuests` and the FriendIntroCeremony queue call only with extras (discoveries keep recording).
5. MiniGames: drop the Starfighter and CloudJump tiles. Delete `CreatureDiscoveryToast.jsx`, `ParentIntroOverlay.jsx`, `TaskList.jsx`, `DailyHabits.jsx`, `ToothBrushGuide.jsx` and their imports; `check:names` must stay clean.
6. Run section 12, fix, then HANDOFF: what changed, the extras switch for Louis, the open questions.

---

## 11. Content

All lines are Ronki (Harry) unless marked. Files `public/audio/ronki/de_<id>.mp3`. No numbers in voiced lines, no names in voiced lines (the bubble shows `{nick}` and `{Kind}`; the audio never does).

### 11.1 Onboarding (lane C uses them)

| id | Text |
|---|---|
| `onb_get_parent_01` | Holst du mal Mama oder Papa? Ich will Hallo sagen. |
| `meet_close_card_01` | Ich weiß noch gar nichts. Zeigst du mir was? |
| `onb_handback_01` | Da bist du ja wieder! Ich will Feuer machen. Hilfst du mir? |
| `onb_fire_half_day_01` | Oh! Mein Feuer brennt schon ein bisschen. Noch zwei Sachen, dann flieg ich los! |
| `onb_fire_half_night_01` | Oh! Mein Feuer brennt schon ein bisschen. Noch zwei Sachen, dann flieg ich heute Nacht im Traum los! |
| `onb_camera_sleep_01` | Die Kamera schläft noch. Hol mal Mama oder Papa. |
| `nest_day1_01` | Heute ist unser erster Tag! |

### 11.2 The Nest (lane B)

| id | When | Text |
|---|---|---|
| `nest_morning_01` | morning, even days | Guten Morgen! Wärmst du mein Feuer? |
| `nest_morning_02` | morning, odd days | Guten Morgen! Ich bin noch ganz verschlafen. Machst du mit mir die Morgensachen? |
| `nest_back_short_01` | one missed day | Du bist wieder da! Ich hab von dir geträumt. |
| `nest_back_long_02` | several days, nothing waiting | Da bist du ja wieder! Schön, dass du da bist. |
| `nest_school_01` | 08:00 to 15:00, fire not full | Mein Feuer ist noch nicht ganz voll. Heute Abend machen wir weiter. |
| `nest_away_note_01` | tap on the note | Ich bin im Morgenwald! Heute Abend bin ich wieder da. |
| `nest_evening_01` | evening, trip done | Schön, dass du da bist. Machen wir es uns gemütlich? |
| `nest_evening_fire_01` | evening, no trip yet | Hilfst du mir noch mit meinem Feuer? Dann flieg ich heute Nacht im Traum los. |
| `nest_night_ready_01` | night trip set, awake | Mein Feuer ist voll. Heute Nacht flieg ich im Traum los. |
| `mood_magic_01` | feeling Magisch | Magisch? Dann glitzert heute bestimmt was. |
| `mood_sit_offer_01` | after Besorgt (Traurig's own line already asks) | Magst du kurz bei mir sitzen? |

Feeling reactions reuse existing files: Gut `mood_happy_01`, Okay `mood_okay_01`, Traurig `mood_sad_01`, Besorgt `mood_worried_01` (bubble text without the dash: "Ist was passiert? Du kannst mir erzählen. Oder einfach da sein."), Müde `mood_tired_01`.

### 11.3 Fire and trips (lane B)

| id | Text |
|---|---|
| `fire_1_01` | Oh, das wärmt! |
| `fire_2_01` | Mein Feuer wird größer. |
| `fire_3_01` | Noch eins, dann ist es voll! |
| `eve_done_01` | Alles fertig. Jetzt ist Kuschelzeit. |
| `trip_depart_day_01` | Mein Feuer ist voll! Ich flieg in den Morgenwald. Heute Abend bin ich wieder da. |
| `trip_depart_night_01` | Mein Feuer ist voll! Heute Nacht flieg ich im Traum los. Morgen früh erzähl ich dir alles. |
| `trip_depart_again_01` | Und mein Feuer ist schon wieder voll. Ich flieg gleich wieder los! |
| `trip_bye_01` | Tschüss! Ich bring dir was mit. |
| `trip_back_day_01` | Ich bin wieder da! Schau mal, was ich gefunden hab. |
| `trip_back_night_01` | Guten Morgen! Ich hab vom Morgenwald geträumt. Und schau mal, was neben meinem Kissen lag! |
| `trip_back_late_01` | Da bist du ja! Ich hab auf dich gewartet. Schau mal, was ich dir aufgehoben hab. |
| `trip_shelf_01` | Das stellen wir aufs Regal. |
| `trip_again_01` | Den kennst du schon! Ich hab noch so einen gefunden, für dich. |
| `trip_regal_full_01` | Mein Regal ist voll! Alle Schätze aus dem Morgenwald. |

A task tapped while Ronki is away gets the sun check and `sfx_complete`, no voice. A task after the fire is full and Ronki is home gets no voice either.

### 11.4 Growth (lanes B and D)

| id | Text |
|---|---|
| `grow_dot_01` | Ein Punkt mehr! |
| `grow_dots_01` | Siehst du die Punkte? Wenn alle voll sind, wachse ich. |
| `grow_one_left_01` | Noch ein Abenteuer, dann wachse ich! |
| `grow_step_01` | Schau mal! Ich bin gewachsen! |
| `grow_top_01` | Jetzt bin ich ganz groß. Und immer noch dein Freund. |

### 11.5 Evening and passport (lane D)

| id | Text |
|---|---|
| `tonight_hook_day_01` | Morgen früh wärmen wir wieder mein Feuer. Schlaf gut. |
| `tonight_hook_night_01` | Jetzt flieg ich im Traum los. Morgen früh erzähl ich dir alles. |
| `tonight_hook_rest_01` | Morgen ist ein neuer Tag. Ich bin da, wenn du aufwachst. |
| `pass_intro_01` | Das bin ich! Und das haben wir zusammen erlebt. |
| `pass_taught_fire_01` | Feuer machen hab ich von dir gelernt. |

### 11.6 Treasures (14, one place, fixed order; voice id `treasure_<slug>`)

| # | slug | Emoji, name, place | Story |
|---|---|---|---|
| 1 | `ahornblatt` | 🍁 Ahornblatt, hinter den Birken | Im Morgenwald hat ein rotes Blatt geleuchtet, ganz hell in der Sonne. Das hab ich für dich mitgenommen. |
| 2 | `feder` | 🪶 Feder, auf der Lichtung | Eine Feder ist ganz langsam vom Baum gesegelt, direkt vor meine Nase. Ich glaub, der Vogel braucht sie nicht mehr. |
| 3 | `bachstein` | 🪨 Bachstein, am kleinen Bach | Am Bach lag ein Stein, ganz glatt und kühl. Fühl mal, der ist wie ein kleines Geheimnis. |
| 4 | `eichel` | 🌰 Eichel, unter der dicken Eiche | Unter der dicken Eiche lag eine Eichel. Die hat sogar noch ihr kleines Hütchen auf. |
| 5 | `schneckenhaus` | 🐌 Schneckenhaus, auf einem warmen Stein | Auf einem warmen Stein lag ein Schneckenhaus, ganz leer und rund. Ich hab reingeguckt. Da wohnt keiner mehr. |
| 6 | `kleeblatt` | 🍀 Kleeblatt, auf der Wiese | Auf der Wiese hab ich ganz lange gesucht und ein Kleeblatt gefunden. Ich hab die Blätter gezählt. Vier, glaub ich! |
| 7 | `zauberstock` | 🪵 Zauberstock, am Wegrand | Ich hab einen Stock gefunden, der sieht aus wie ein Zauberstab. Zaubern kann er noch nicht. Vielleicht bald. |
| 8 | `moos` | 🌿 Moos, am alten Wurzelhang | Das Moos am alten Baum ist so weich wie ein Kissen. Ich hab ein kleines Stück ganz vorsichtig mitgebracht. |
| 9 | `gaensebluemchen` | 🌼 Gänseblümchen, mitten auf dem Weg | Mitten auf dem Weg stand ein Gänseblümchen. Ich hab es gefragt, ob es mit will. Es hat genickt, im Wind. |
| 10 | `grashalm` | 🌾 Grashalm, am Waldrand | Wenn man auf einem Grashalm pustet, pfeift er. Bei mir kam nur Rauch raus. Probier du mal! |
| 11 | `eichenblatt` | 🍂 Eichenblatt, vor der Eiche | Das Blatt hat geknistert, als ich draufgetreten bin. Es sieht aus, als hätte jemand es mit Gold angemalt. |
| 12 | `sonnenblumenkern` | 🌻 Sonnenblumenkern, bei der kleinen Maus | Eine kleine Maus hat mir einen Sonnenblumenkern geschenkt. Ich glaub, jetzt sind wir Freunde. |
| 13 | `tannenzweig` | 🌲 Tannenzweig, im Tannenkreis | Der Tannenzweig riecht nach Wald. Und ein bisschen nach Weihnachten. Riech mal! |
| 14 | `muschel` | 🐚 Muschel, im Bach | Im Bach hat was geglitzert. Das war eine kleine Muschel. Halt sie mal ans Ohr, vielleicht hörst du den Bach. |

After the 14th unique find the order starts again with `trip_again_01` before the story; the shelf stays complete. Legacy map: "Moosbüschel" → `moos`; "Roter Pilz" stays a legacy find with its old quote. **Count: 42 new lines + 14 stories = 56 files**, about 3,000 characters for ElevenLabs. No new art: every state uses `scenes/zuhause-ronki`, `loops/zuhause.mp4`, `scenes/morgen`, `loops/nacht.mp4`, `scenes/morgenwald`, `loops/ronki-cloud`, `loops/ronki-cheer` and the stage and pose files already in `public/art/bilderbuch/`.

### 11.7 Retired lines

`meet_close_01` (never existed, the call goes); the close bubble "Ich bin {nick}! Bis morgen. Versprochen."; `expedition_return_01` in the loop (stays in hidden Expedition); `tag_warmth_01` (replaced by the flame lines); `nav_unlock_ronki`, `nav_unlock_journal`, `nav_unlock_shop`, `nav_coach_*` (no locks with extras off); the CompanionToast strings (de.json:529-534); the six RonkiSpeechBubble lines (RonkiSpeechBubble.jsx:22-31); the victory strings "Quest Complete!", "Alles geschafft!", "Weiter zum Belohnungs-Laden!" (de.json:143-149, 378); "Weiter zum Lager"; the old camera errors on the kid screen; the MORGENWALD_MEMENTOS quotes as the voiced source (kept only for legacy display). Files stay on disk.

---

## 12. Tests

**Unit (vitest, run with `npm test`):** everything listed per lane in section 10, plus these that must stay green untouched: `src/utils/storage.test.js` (16, includes the website card seed and the sibling guard: the QR path), `TaskContext.companionName.test.jsx` (7, the name split), `MeetRonki.test.jsx` (7 existing), `RoomHub.test.jsx` feeling entry tests, bilderbuch primitives. Target: the 222+ existing tests green plus about 60 new.

**Old-save fixture:** `save-2026-09-louis-shape.json` built from the real field list: `onboardingDone:true`, `catEvo:3`, `companionName`, `familyConfig.childName`, `expedition:{state:'leaving'}` in one variant and `{state:'away', returnAt:<yesterday 11:30>}` in another, `expeditionLog` with 5 old mementos including "Roter Pilz", `hp:120`, no new fields, `lastDate` five days back. Assertions: loads to AppContent, no onboarding, phase `back` for the away variant, `home` for the leaving variant, `adventuresDone:5`, `catEvo:3` until the first receive, then `catEvo:9` (`min(3 + 6, 9)`, Jungtier) with 0 of 9 dots, greeting line `trip_back_late_01`, `hp` untouched, `extrasEnabled:false`.

**Guards:** `npm run check:names` clean; `npm run build` green; a grep for U+2014 and U+2013 over every touched file and `loopLines.ts` returns nothing; `loopLines.test.ts` proves every audio file exists.

**Browser checks** (local build against `npm run mock:supabase`, 390 x 844 frame as in the surface map, a fresh origin per path):
1. No card, 07:05 (`?loopNow`): egg first, "Ich hab eine Karte" visible, hatch, name, parent step asks the three things, handback, breath, fire at 2, two tasks, SendOff, empty Nest with the note. Screenshot each.
2. Same device, `?loopNow=…T17:05`: Back state, TripReturn plays `treasure_ahornblatt`, one dot, Nest evening, "Gute Nacht sagen", ritual closes from the first second, night loop.
3. Install at 19:30: night lines, ritual, `?loopNow=` next day 06:30: dream return on `morgen.webp`, then a fresh fire.
4. QR path: card made on the website against the mock, `?p=` link on a fresh origin: no parent step, child name kept, MeetRonki card close line, breath, home. Then the scan route: egg shelf link → NoProfileLanding (camera refused in the test browser → kid line, paste the link → reload → MeetRonki).
5. Egg picked, then "Wir haben schon eine Karte" and the paste: after the reload the kid lands on the breath beat with the same egg and name.
6. Old save: write the fixture into IndexedDB on a fresh origin, reload: Nest in the Back state, no crash, receive grows Ronki to Jungtier.
7. Second device: open the same `?p=` on another origin: Nest with the same trip state and greeting.
8. Parent: Nest lock → PinModal (1234, then a PIN set in setup) → dashboard → extras on → Tagebuch and Laden tabs and "Spielzeug" come back → off again.
9. Reduced motion: every video shows its poster; SendOff and dots still readable.

---

## 13. Risks, and what to cut first

| Risk | Likelihood | What we see on Louis's tablet | Mitigation |
|---|---|---|---|
| Louis misses the games, the Laden or his Sterne | medium | "Wo ist Spielzeug?" | extras switch in the dashboard, no deploy needed; Sterne keep counting; tell Marc in the HANDOFF |
| Old save in an odd trip state crashes the Nest | low with the fixture, high without | blank home | migration plus the fixture test; `uiPhase` falls back to `warming` on any unknown value |
| QR path regression | low | card families land on the egg without their card | `storage.ts` and `profileToken.ts` untouched, `storage.test.js` green, browser check 4 |
| Voice generation fails or runs late | medium | silent lines | lines show as bubbles; playback of a missing file is already silent; generate in the first hour of lane D |
| Device clock or time zone wrong | low | trip back at odd times | everything local-time; worst case a trip comes back early |
| Tablet left open overnight | medium | yesterday's flames in the morning | reload on a date change while visible |
| Two devices write the trip at once | low | a treasure shown twice | last write wins, as today; T3 only acts on `waiting` |
| Fire of four too hard on a slow morning | medium | no trip on some days | evening tasks fill the same fire; the dream trip covers it; tune `FIRE_FULL` to 3 after Louis's first week |
| Integration conflicts in App.jsx | medium | build breaks late | App.jsx has one owner; lanes expose props, not edits |

**Cut first, in this order:** (1) the NoProfileLanding paste field (the kid line alone still fixes the dead end); (2) the pending-hatch stash (then the card wins and the kid picks the egg again); (3) passport sections 4 and 5 (keep Ronki, name, days, dots, shelf); (4) the dashboard "Ronki heute" line and the PIN fix; (5) the deletion sweep of dead files; (6) the funnel events (keep `quest.complete` and `mood.pick`); (7) the awake/asleep split of the night trip (show him asleep at once).

**Never cut:** egg first with the parent after the hatch, the global return (T2) on the Nest, one trip a day that comes back at the next routine time, the fixed treasure order with voiced stories, growth at the return, two tabs with the extras switch, the rehydration migration and its fixture test, and the QR path checks.
