# Ronki feature census (branch `design/bilderbuch-app`, HEAD `e089cfd`, 25 Sep 2026)

Read-only audit of `C:\Users\öööö\ronki-bilderbuch-app`. Nothing was run in the repo (no tests, no build). Clip and voice durations were measured with ffprobe on the files in `public/` (read-only). Paths are relative to the repo root. German copy is quoted verbatim; where the source contains an em-dash I write `{Gedankenstrich}` so this report stays free of the character.

Legend for "reach": **tab** = bottom nav; **in X** = a button inside surface X; **unlock** = gated by `src/data/tabUnlocks.ts`; **dev** = only via a DEV-gated URL param (`import.meta.env.DEV`, App.jsx:153-173, 188); **public URL** = URL param that also works in production; **unreachable** = imported or defined, no path renders it.

---

## 1. Onboarding chain, as it runs today

### 1.0 Gates that decide the first screen

- `AuthGate` (App.jsx:674-806): boots `BackgroundMusic.init()` (681-683), calls `getActiveToken()` which consumes and strips `?p=<token>` into `localStorage.ronki_profile_token` (App.jsx:690-692, lib/profileToken.ts:73-94). Public, non-DEV routes: `?compendium=1`, `?onboardingPreview=1`, `?teachFirePreview=1`, `?teachRitualPreview=1` (App.jsx:714-760). LoginScreen is bypassed (App.jsx:794).
- `TaskProvider` load (context/TaskContext.tsx:958-1282): with a token it calls `storage.syncLoadByToken` (975); a website seed without quests gets `buildDay(false)` (983-985).
- `OnboardingGate` (App.jsx:831-845): if `!onboardingDone`: no token AND `!parentOnboardingDone` → `NoProfileLanding`; otherwise `OnboardingChain`. The chain picks its phase from flags (App.jsx:875-879): `parentOnboardingDone` false → 0 CombinedParentSetup; `parentHandoffBackSeen` false → 1 HandoffBackCard; `kidIntroSeen` false → 2 MeetRonki; else 3 TeachFireStep.
- No analytics event fires anywhere before `ronki.hatch` (grep of `track(`, section 7).

### 1A. Cold first open (no profile, no token)

**Screen A1: NoProfileLanding** (`src/components/NoProfileLanding.jsx`, 352 lines)
- Sees: wobbling sun egg (214), "Willkommen", "Hast du eine Karte?", "Mama oder Papa haben dir eine Karte gezeigt oder gegeben? Halte sie gleich vor die Kamera." (222-229); pill "QR-Code scannen" (241-244); "Halte die Kamera auf die Karte. Dann geht es los." (246); parent card "Für Eltern" / "Noch keine Karte? Erstellt sie in einer Minute auf der Webseite. Kein Konto, keine Mail, kein Passwort." with link "ronki.de/profil-erstellen" (target `_blank`, 251-264).
- Scan mode (268-316): "QR-Code scannen", "Halte die Kamera auf den ausgedruckten oder gezeigten QR-Code.", status "Kamera wird gestartet…" / "Halte den QR-Code in den Rahmen." / "Code erkannt. Du wirst weitergeleitet…", secondary pill "Abbrechen".
- Errors (183-191): "Kamera-Zugriff fehlt. Bitte in den Browser-Einstellungen erlauben.", "Keine Kamera gefunden.", "Dein Browser unterstützt keinen Kamera-Zugriff.", "Kamera konnte nicht gestartet werden." No fallback button, no code entry field.
- Taps: 1 ("QR-Code scannen"), plus the browser's camera permission dialog.
- Voice: none. Analytics: none. Animations: none blocking.
- State: `setActiveToken(token)` (163), then `window.location.reload()` (167).
- **Without a card there is no in-app way forward.** The only exits are the camera or the external website link. (PRD 5.1 egg-first and 5.3 camera fallback: not built.)

**In-app parent setup only exists for an "orphan token"**: a token is set but the cloud row is empty or failed to load (`syncLoadByToken` returns null, utils/storage.ts:290 → fresh `createInitialState()`, TaskContext.tsx:1260-1263 → phase 0). Normal cold opens never reach it.

**Screen A2 (orphan token only): CombinedParentSetup** (`src/components/CombinedParentSetup.jsx`, 196 lines)
- Sees: small wobbling egg (93); "Kurz einrichten", "Drei kleine Sachen.", "Dann darf mit Ronki gespielt werden." (98-100); "Wie heißt euer Kind?" placeholder "Vorname" (105-117); "PIN für den Eltern-Bereich (optional)", toggle "An"/"Aus", "Leer lassen heißt: Standard-PIN 1234. Im Eltern-Bereich jederzeit änderbar." (122-154); consent card "Anonyme Nutzungsdaten teilen?" / "Hilft uns Ronki zu verbessern. Keine Werbung, kein Tracking, nichts Drittes. Frankfurter Server. Jederzeit aus." (159-182, default off, 41); pill "Weiter zum Kind", disabled until a name (186-188); footer "Keine Daten verlassen Deutschland. Mehr im Eltern-Bereich."; PIN error "Vier Ziffern, oder leer lassen." (55).
- Taps: typing the name + 1 (optional PIN typing, optional consent tap).
- State (App.jsx:900-919): `patchState({parentOnboardingDone:true, parentPin, parentPinIsDefault, analyticsEnabled, familyConfig:{...,childName, siblings:[]}})`, `updateFamilyConfig`, and a fresh token + `claimLocalProfile` if none exists.
- Voice: none. Analytics: none.

**Screen A3 (orphan token only): HandoffBackCard** (`src/components/HandoffBackCard.jsx`, 107 lines)
- Sees: sun check sticker, "Fertig!", "Jetzt bist du dran.", pill "Los geht's", hint "Tippe irgendwo weiter" (i18n de.json:274-276; component 65-101). Fade 0.4 s, hint appears at 1.0 s; the whole screen is tappable from mount (31).
- Taps: 1. State: `parentHandoffBackSeen: true` (App.jsx:926). Voice: none. Analytics: none.

Then the chain continues exactly as 1B from MeetRonki.

### 1B. QR-card path (card created on ronki.de, scanned in the app)

- Website seed (`website/src/lib/profileSetup.ts:82-96`): `parentOnboardingDone:true`, `parentHandoffBackSeen:true`, `parentPin`, `parentPinIsDefault`, `analyticsEnabled` (from the website form), `familyConfig:{childName, siblings:[]}`, `kidIntroSeen:false`, `onboardingDone:false`; RPC `profile_upsert` (102); Plausible "Karte erstellt" (110).
- App: NoProfileLanding, 1 tap + camera permission tap, point the camera, hard reload. Opening the share URL (`?p=`) instead skips the landing entirely.
- Load: `syncLoadByToken` (utils/storage.ts:231-291): sibling guard (243-249), pristine-local guard so the seed wins (257-262), cloud cached locally. Chain starts at phase 2 (HandoffBackCard is skipped by the seed).

**Screen B1: MeetRonki** (`src/components/drachennest/MeetRonki.jsx`, 597 lines; `zIndex 950`, 206)

| Phase | What the kid sees (copy) | Tap | Auto time | Voice |
|---|---|---|---|---|
| approach | painted room loop (`loops/zuhause.mp4`, 4.5 s loop), caption "Da hinten leuchtet etwas." (80, 209-213) | none | 3.6 s (125) | none (pre-hatch is silent, 78-79) |
| shelf | "Welches Ei fühlt sich richtig an?" (81, 226-228), four egg ChoiceTiles "Weiß", "Rot", "Gelb", "Blau" (63-68, 229-247) | 1 (egg) | waits | none |
| wobble | picked egg trembles on the hatch poster, caption "Eines zittert leicht." (82) | none | 1.4 s (132) | none |
| hatch | per-egg Seedance clip `loops/hatch[-ember|-sun|-cobalt].mp4` (54-57), 5.04 s measured; still fallback 1.4 s (492-498) under reduced motion or refused play; safety cap 8 s (75, 137) | none | ~5.0 s | none |
| meet | bubble "Hallo. Ich hab auf dich gewartet. Glaub ich." (84, 347-357), "spricht" sticker | none | 4.5 s (142) | `meet_hello_01` (3.44 s) |
| name (e089cfd) | bubble "Hm, wie soll ich heißen?" (85); six voiced chips "Ronki", "Funki", "Flämmchen", "Glut", "Pieks", "Knisti" (97-104, 281-294); quiet link "selbst schreiben" (316-318) opens a field "hier tippen" capped at 18 chars (296-312); sticky pill "so soll er heißen" (325-337) | 2 (chip + pill) | waits | `meet_namequest_01` (1.76 s); chip tap plays `de_name_chip_<id>` (176, ~1.4 s) |
| close | Ronki large, bubble "Ich bin {nick}! Bis morgen. Versprochen." (106-109, 264); full-screen invisible button, hint "tippen zum schließen" fades in after 3 s (362-376) | 1 (anywhere, active immediately) | waits | `meet_close_01` requested (152) but **the file does not exist** in `public/audio/ronki/` → silent |

- Finish (186-194): `track('ronki.hatch')` (raw module track, see section 7), `onComplete({companionVariant, companionName})`.
- State (App.jsx:939-944): `kidIntroSeen:true`, `companionName` (nickname only; since e089cfd it no longer overwrites `familyConfig.childName`), `companionVariant` (egg → `forest|sunset|amber|teal`, MeetRonki.jsx:63-68).
- Taps in MeetRonki: 4. Unskippable: 3.6 + 1.4 + 5.0 + 4.5 = **14.5 s**.

**Screen B2: TeachFireStep → TeachBreathBeat** (`src/components/onboarding/TeachFireStep.jsx` 44 lines, `TeachBreathBeat.jsx` 463 lines; sky ground, TeachFireStep.jsx:22)

| Phase | Copy (de.json:405-415) | Tap | Auto time | Voice |
|---|---|---|---|---|
| intro | title "Der erste Funke"; "Ronki ist gerade geschlüpft. Er weiß noch nichts. Zeig ihm, wie man tief Luft holt." | none | 2.2 s (49, 154-158) | narrator `teach_fire_intro_01`, hard-muted (utils/voiceAudio.ts:27-43) |
| prompt 1 | "Er will Feuer machen … schafft's aber nicht." + sun hold button "Halte gedrückt" | hold ≥ 220 ms (45, 191-206) | waits | none |
| inhaling | "Tief einatmen. Lass los, wenn der Bauch ganz voll ist." | release | kid-driven | none |
| smoke (always on round 1, 208-218) | "Hmm das war glaub ich noch zu kurz, da kam nur bisschen Rauch raus statt Feuer." | none | 2.1 s (46) | `teach_fire_smoke_01` (3.3 s) |
| prompt 2 | "Probier nochmal und diesmal die Luft ganz lange anhalten bevor du loslässt." | hold | waits | narrator `teach_fire_tryagain_01`, muted |
| released → solo | "Jaaa! So geht's!" → "Er hat's gelernt. Er vergisst das nie." | none | 1.3 s + 1.2 s (47-48) | `teach_fire_celebrate_01` (2.0 s); narrator `teach_fire_done_01` muted |
| done | sun pill "Weiter zum Lager" (408-419) | 1 | waits | none |

- No skip link exists. `variant={variant.id}` (TeachBreathBeat.jsx:299) receives a string, so MoodChibi gets `undefined` (no visible effect since Ronki is single-colour).
- On "Weiter zum Lager", App calls `completeOnboarding({companionVariant, heroGender:null, taughtSignature:'fire'})` (App.jsx:962-971) which writes (TaskContext.tsx:1807-1850): `onboardingDone:true`, `onboardingDate`, `eggType`, `heroGender`, `catEvo = max(catEvo, 3)` (stage Baby), `companionVariant`, `taughtSignature`, `taughtAt`, `taughtBreaths.flame`.
- Taps: 2 holds + 1 tap. Unskippable: 2.2 + 2.1 + 1.3 + 1.2 = **6.8 s** plus the two holds.

**Screen B3: first home arrival (AppContent + RoomHub)**
- `app.open` (App.jsx:309-311), `lastLoginDate` stamped after 150 ms (289-302), `recordViewVisit('hub')` (344).
- **FriendIntroCeremony fires immediately**: `useMicropediaDiscovery` sees `catEvo 3 ≥ 2` → creature `hearth_0` "Goldauge" (hooks/useMicropediaDiscovery.ts:49; data/creatures.ts:37) → queued as a CelebrationQueue modal (App.jsx:256-273). `src/components/drachennest/FriendIntroCeremony.jsx` (319 lines, `zIndex 950`): staged reveal, "Ronki erzählt", the creature's how-met line, "Ronki sagt: {lesson}", CTA "Schön dich kennenzulernen" appears at 3.4 s (36-43, 281-303). Voices `creature_name_hearth_0`, `creature_lore_hearth_0` (73-81). 1 tap. Writes `micropediaDiscovered`.
- Toasts are dropped for the first 2 days after `onboardingDate` (context/CelebrationQueue.tsx:94-99, 124-127); modals still fire.
- ParentIntroOverlay: imported (App.jsx:82) but **not mounted** (635-639). PWA install prompt: not yet (needs `totalTasksDone ≥ 2`, see B5).
- RoomHub then shows (details in section 2 and 5).

**Screen B4: first task**
- Tap "Heute auf der Schriftrolle" (RoomHub.jsx:488-496) or an anchor tile, or tab "Heute" → `RonkisTag` (App.jsx:419-424, 379-399). RonkisTag mount: narrator `tag_intro_01` muted, Ronki `tag_warmth_01` after 4.2 s (RonkisTag.jsx:177-181).
- Tap the first task card (StripScene, RonkisTag.jsx:437-503) → `handleTap` (209-227): `eatQuest` is skipped because no PinnedRonki is mounted on this surface (components/QuestEater.jsx:65-71); `actions.complete(id)`; CheerMoment sticker burst + cheer jump 1.4 s (658-705); CompanionToast 1.2 s with a random line such as "Super gemacht, Held!" or "Ronki fühlt sich stärker!" (CompanionToast.jsx:6-13, de.json:529-534). No SFX, no haptic, no analytics on this tap.
- Cascade after the first completion: tab Ronki unlocks (`totalTasksDone ≥ 1`, tabUnlocks.ts:38) → toast "🔓 Ronki wartet jetzt auf dich!" (de.json:761; bypasses quiet hours, TabUnlockCelebration.jsx:79-95) + voice `nav_unlock_ronki`; creature `forest_0` "Glutfunke" → a second FriendIntroCeremony takeover on top of the strip (useMicropediaDiscovery.ts:22, z 950); special quest `sq_first_task` adds 15 xp silently (hooks/useSpecialQuests.ts:44-49, data/specialQuests.ts).

**Screen B5: PWA install prompt** (`src/components/PWAInstallSheet.jsx`, 135 lines; gate `src/hooks/usePWAPromptGate.js`, 150 lines)
- Shows when onboarded, not standalone, `pwaPromptShown` false, `totalTasksDone ≥ 2`, and 8 s after the last completion (usePWAPromptGate.js:102-123; App.jsx:657-669; the App.jsx comment "≥ 1" is out of date). One day-2 retry (usePWAPromptGate.js:85-100).
- Copy: "Toll gemacht!", "Ronki ist jetzt dein Begleiter. Leg ihn auf den Homescreen, damit ihr euch morgen schneller wiederseht." (de.json:277-278); iOS steps "Teilen-Knopf antippen", "Zum Home-Bildschirm", "Hinzufügen antippen" + "Verstanden!"; Android "Jetzt installieren" / "Überspringen"; else "Weiter". Voice `pwa_install_01` (50). Writes `pwaPromptShown`.

### 1C. Count to the first completed routine task

| Path | Taps | Forced waits |
|---|---|---|
| QR card scanned in app | 12 (scan 1, camera permission 1, egg 1, chip 1, "so soll er heißen" 1, close 1, hold 1, hold 1, "Weiter zum Lager" 1, ceremony CTA 1, "Heute auf der Schriftrolle" 1, task 1) | 14.5 s (MeetRonki) + 6.8 s (teach) + 3.4 s (ceremony CTA) = **~24.7 s**, plus camera start, hard reload, cloud load, two ≥ 0.22 s holds |
| Share link `?p=` opened directly | 10 | same ~24.7 s |
| Orphan token (in-app setup) | 12 + typing the child's name | same ~24.7 s |
| Cold open, no card | no path in the app | |

---

## 2. The daily loop as it runs today

### 2.1 How tasks are defined
- Hard-coded in `src/constants.ts`: `SCHOOL_QUESTS` (45-77) = 7 morning (`s_wake` "Aus dem Bett kommen", `s_water`, `s_wash`, `s_breakfast`, `s_teeth_am`, `s_dress`, `s_packcheck`), 1 "evening" anchor shown as Nachmittag (`s_move` "10 Min bewegen"), 5 bedtime (`s_dinner`, `s_teeth_pm`, `s_wash_pm`, `s_pyjama`, `s_cuddle`); each `xp: 10` and a `ronkiAsk` line (the asks are not rendered by RonkisTag). `VACATION_QUESTS` (79-101). `FOOTBALL` "Bewegung" added Mon/Wed (103; utils/helpers.ts:30). Weekend drops `s_packcheck` (helpers.ts:21, 28). Two random `SIDE_QUESTS` per day (constants.ts:575-583; helpers.ts:31-34).
- Main tasks per day: 13 (14 on Mon/Wed, 12 on weekends).
- **Not parent-configurable.** The Familie tab edits `dailyHabits` and `recurringActivities` (ParentalDashboard.jsx:635-744), but only `TaskList`/`DailyHabits` read them and TaskList is imported, never rendered (App.jsx:11, 379-399). `vacMode` has no live writer (only the unreachable `hooks/useGamePersistence.ts:27`).
- RonkisTag groups main quests into morning / afternoon (evening + hobby) / bedtime (RonkisTag.jsx:49-53, 161-171); "now" is by hour: < 11 morning, < 17 afternoon, else evening (108-112). **Side quests never show on the strip** (163) but **RoomHub counts them** (RoomHub.jsx:165-172 has no `sideQuest` filter). 3 of 7 side quests have anchor morning (constants.ts:576, 580, 581), so on about 71 % of days (1 − C(4,2)/C(7,2)) RoomHub's `morningDone` can never become true.
- Teeth detour dead: `TEETH_QUEST_IDS = ['s3','s12','v3','v10']` (RonkisTag.jsx:42) matches none of today's ids, so `ToothbrushTimer` never opens.

### 2.2 What completing a task does: `complete(id)` (TaskContext.tsx:1476-1674)
Fields written: `quests[].completions/done` (1482-1488); `dt += minutes` (1490); `hp += q.xp` (Sterne, +10, 1491-1492); `drachenEier += 1` and +3 when all main done (1493, 1578; the type comment at 169-173 says it is no longer mutated); `xp += q.xp` (1494-1495); `boss.hp -= max(5, floor(xp*0.8))` plus gear courage, `bossDmgToday`, `bossTrophies`, `bossKilledToday` (1497-1534); `orbs[key] += 1` via an id map that uses old ids (1536-1555); `heroStats` (1557-1563); `totalTasksDone += 1` (1582); `unlockedBadges` (1584-1601); `arcEngine` advance if the quest has `arcBeatId` (1603-1615); `arcBeatAdvancedToday`; `totalQuestCompletions` (1617-1618); `pendingRitual` at 30/70/130/200 tasks (1620-1637; thresholds 53-58); `lastTaskCompletionAt` (1662). Pass-through, not changed: `careTokens`, `ronkiVitals`, `expedition` (1652-1654). **Not touched: `catEvo`.**
After: `toastTrigger++` → CompanionToast (1666); `syncRonkiMood` → `gut` when all main quests are done (1673, 2458-2465).
Queued celebrations: `levelUp` on a level change (1566-1570) but Celebration hides levelUp and evolution unless `?mode=dev` (Celebration.jsx:244-248, utils/mode.ts); `victory` on all main done (1576-1577), shown full screen: header "Quest Complete!" (de.json:378), "Alles geschafft! 🎉", "Ronki ist mega stolz auf dich! Du hast heute alles gegeben.", button "Weiter zum Belohnungs-Laden! 🎁" that only closes (Celebration.jsx:119-165, de.json:143-149). The tapering reads `localStorage['hdx2']` (Celebration.jsx:254) which nothing writes (storage key is `hdx2_drachennest`, utils/storage.ts:15-16), so it always shows.

### 2.3 Energy / Feuer meter
- None on RoomHub or RonkisTag. `ronkiVitals`/`careTokens` are frozen since cut #9 (TaskContext.tsx:1639-1653).
- Closest thing: PinnedRonki's per-block progress arc (components/PinnedRonki.jsx:46-57), mounted only in the Tagebuch and Laden top bars (Journal.jsx:183; TopBar.jsx:52-55). "Ausdauer" (`ronkiStamina`) is minigame stamina, not routine (hooks/useRonkiStamina.ts).

### 2.4 Expedition
- **Start, path 1**: RoomHub sun card "Ronki ist bereit" / "\"Lass uns auf Abenteuer gehen, ich bringe dir was Schönes mit.\"" when every quest with anchor morning is done (side quests included) and `expedition.state === 'home'` (RoomHub.jsx:456-480) → `startExpedition()` + opens Expedition.
- **Start, path 2**: RonkisTag AnchorCompleteCard "Morgen ist gemacht" / "\"Ich geh mal kurz raus. Bin zum Mittag wieder da.\"" / pill "Reise verfolgen" when the main morning block is done, state home, not evening (RonkisTag.jsx:189, 293-295, 631-654) → `startExpedition()` then back to the hub (App.jsx:442-445) **without opening Expedition**, so the state waits at `leaving` until the kid taps "Karte".
- `leaving → away` only while Expedition is mounted: 2.5 s walk-out, then `rangerDeparted()` (Expedition.jsx:141-153). Voices: `expedition_pack_0x`, `expedition_depart_0x` at 1.6 s, then `expedition_arrive_morgenwald` and a browse line at 5 s (108-136).
- Return time: `min(now + 4 h, 14:00 today when 14:00 falls inside that window)` (TaskContext.tsx:2012-2018). A 7:30 start returns 11:30; 12:00 returns 14:00; 15:00 returns 19:00. Not 6 to 8 h, not tied to the evening routine. Status copy maps the hour: "Kommt vor dem Mittag zurück" / "Kommt zum Mittagessen zurück" / "Kommt am Nachmittag zurück" / "Kommt zum Abendessen zurück" / "Kommt morgen früh zurück" (Expedition.jsx:835-846).
- `away → waiting` only by a 30 s poll inside Expedition (155-167). There is no global check, and the RoomHub scene keeps Ronki on the cushion while he is "away" (RoomHub.jsx:309-378 never reads `expedition`).
- Return: open "Karte" → "Ronki ist zurück." / "Er hat etwas mitgebracht", bubble "Ich hab dir was mitgebracht. Willst du es sehen?", sticker burst, voice `expedition_return_01` (Expedition.jsx:131-134, 176-181, 327-331) → "Tagebuch öffnen" → DiaryModal "Heute · HH:MM", "Ein {name}", the memento quote, card "Spur · Für dich", "Morgenwald entdeckt {n}%" of 24, pill "Aufs Regal stellen" (716-800) → `receiveMemento()` (TaskContext.tsx:2050-2083; log capped at 24).
- Pool: **8 mementos, 1 biome** (TaskContext.tsx:754-763), avoids the last 2 (765-775). The quote is text only, not voiced.
- No daily cap: after `receiveMemento` the state is `home` again and the start card reappears while the morning is done (`startExpedition` guards only `state !== 'home'`, 1990-1998).

### 2.5 TonightRitual (`src/components/drachennest/TonightRitual.jsx`, 504 lines)
- Entry: RoomHub night card "Heute Abend" / "mit Ronki" (RoomHub.jsx:435-452), or RonkisTag EndOfDayScene "Ins Lager" when all three blocks are done (RonkisTag.jsx:709-737: "{Wochentag}, zu Ende", "Ein guter Tag.", "\"Wir haben heute alles geteilt. Sogar das Brot mit den Krümeln.\"").
- Flow: enter 2.4 s "Heute Abend" / "wir schauen kurz raus, du und ich" (narrator muted) → lookup 4.4 s, bedroom night loop, voice `tonight_invite_01` → story: "Ronki erzählt" + one of 10 fixed lines, voiced `tonight_story_<i>`, quiet link "Tippen wenn du müde bist" after 4 s → tap → curtain 12 s with lullaby `public/audio/lullaby/tonight_lullaby_01.mp3` (skippable by tap) → black: sleeping Ronki, "Schlaf gut.", "Nochmal" / "Schließen" (43-57, 93-161, 259-290).
- No way out during enter and lookup (6.8 s): the dialog sits at `zIndex 950` over the nav and only ESC closes it (130-134).
- Writes no state (`eveningRitualCompletedAt` has no writer). Fires `tonight.start`, `tonight.complete`. Stories are not linked to the expedition or to tomorrow.
- Related mismatch: BeiRonkiSein shows 10 different story texts but plays the same `tonight_story_<i>` audio files (BeiRonkiSein.jsx:24-35 vs 87; the audio text matches TonightRitual, scripts/gen-mega-batch-2026-04-27.py:117-121).

### 2.6 New day: `applyDayTransition` (TaskContext.tsx:1342-1473), run once on load when `lastDate !== today` (1253-1255)
- `sm` per-quest streak map: +1 for yesterday's done quests, reset to 0 for undone ones (1343-1352); copied into `quests[].streak` (1401-1404). No kid-facing reader; it feeds the hidden `magisch` mood at 7/14/21... (2450-2457).
- Weekly missions, gear, mission `catEvo` bonus (1360-1398): no live caller starts a mission (`startMission` has no UI caller), so this never pays out.
- Rebuilds quests (`buildDay`), archives yesterday's journal into `journalHistory` (1406-1420), builds `dreamHighlights` (1422-1431, never read by any UI).
- Resets: `dt`, `moodAM`, `moodPM`, `dailyWaterCount`, `boss` (new), `catFed/Petted/Played`, `dailyHabits`, `loginBonusClaimed`, journal day fields, `bossDmgToday`, `gamesPlayedToday`, `ronkiStamina` to max, `bossKilledToday`, `arcBeatAdvancedToday`, `funkelzeitMinutesToday` (1433-1472).
- Only the last played day is processed; missed days in between are not iterated.

### 2.7 Returning kid
- **After 1 day**: RoomHub looks identical to any other day: "Ronkis Zimmer", "Hallo {childName}!" (fallback "du", RoomHub.jsx:142, 256-261), "Wie geht's dir?" pill and the six mood tiles again (moodAM was reset), the same 6 rotating bubble lines every 4.2 s, including "Ich hab heut Nacht von fliegenden Keksen geträumt." (RonkiSpeechBubble.jsx:22-31). No greeting voice: a `hub_open` greeting bank exists (`companion/lines/de.ts:46-50`, e.g. "Du bist da! Endlich!", files `de_greet_*.mp3` present) but its only consumer `useVoice` is used by the unreachable TaskList.
- If a trip was running: state is still `away` or `leaving`; the start card is hidden, RonkisTag's card is hidden, Ronki still sits on the cushion; the return plays only after the kid opens "Karte".
- **After 5 days**: the same as 1 day. The `besorgt` absence trigger (TaskContext.tsx:2466-2481) compares today with `lastDate`, but the load transition already set `lastDate` to today (1440), so it never fires; RoomHub maps `besorgt` to calm anyway (MoodChibi.jsx:57-60). A scheduled bad day (`sad`/`tired`, every 14 to 21 days, 732-745, 2484-2493) can still land on return; it shows on RoomHub as the sad or sleepy art (ambientMood passes those through) and the reaction UI for it sits in the unreachable Pflege segment.
- CelebrationQueue quiet hours key off `onboardingDate`, not absence.

### 2.8 PRD v2 section 4 status

| PRD 4 element | Status | Evidence |
|---|---|---|
| Return beat ("Du bist wieder da!") | **Missing** | Static greeting RoomHub.jsx:256-261; voice bank unwired (companion/useVoice.ts only in TaskList); `besorgt` dead (TaskContext.tsx:1440 vs 2477) |
| Mood check once a day | **Exists** | RoomHub.jsx:267-287, 407-416, 638-690; no `mood.pick` event from here |
| Feuer-Energie meter | **Missing** | vitals frozen (TaskContext.tsx:1639-1653); only PinnedRonki arc on Tagebuch/Laden |
| Per-task QuestEater beat | **Half** | flyer skipped on RonkisTag (no target); CheerMoment 1.4 s + toast 1.2 s instead |
| Timed expedition appointment | **Half** | manual start after morning; ≤ 4 h, capped 14:00 (TaskContext.tsx:2012-2018); return only detected inside Expedition (Expedition.jsx:155-167); repeatable same day |
| Memento + voiced 2 to 3 sentence story | **Half** | memento with text quote, 8 items, 1 biome (754-763); no voiced trip story; generic `expedition_return_01` |
| Tomorrow's hook in TonightRitual | **Missing** | TonightRitual ends "Schlaf gut." (270-272); fixed pool of 10 |
| Abenteuertage counter | **Missing** | `totalTaskDays` read in 7 places, written only by unreachable `hooks/useGameActions.ts:204`; profile "Tage zusammen" always 0 (RonkiProfile.jsx:371, 681) |
| Counter feeds evolution (`catEvo`) | **Missing, and evolution is frozen** | live writers of `catEvo`: onboarding only (sets 3). feed/pet/play sit in the unreachable Pflege segment (RonkiProfile.jsx:821-1055, 860-862); `drinkWater` and missions have no UI caller. Every kid stays "Baby · Stufe 1"; the Evolution tree still says "Noch {n} Aufgaben bis hier." (RonkiProfile.jsx:1479-1480, remaining = threshold − catEvo) |
| Stage unlocks cave customization | **Missing** | CaveStyleSheet hidden (`SHOW_ROOM_STYLE = false`, RoomHub.jsx:58, 562-571) |
| Session end beat | **Exists** | TonightRitual black screen; BeiRonkiSein one line |

PRD section 5 for reference: 5.1 egg-first **missing**; 5.2 name chips **done** (e089cfd); 5.3 camera fallback **missing** (copy unchanged, NoProfileLanding.jsx:184); 5.4 close phase **half** (tappable at once, hint still fades in at 3 s, MeetRonki.jsx:372); 5.5 funnel events **missing** (no `onboarding.*` names in the allowlist, lib/analytics.ts:26-55); 5.6 repairs **missing** (no `quest.complete` in RonkisTag, no `mood.pick` in RoomHub, `ronki.evolve` never fired).

---

## 3. Feature census

Lines = current `wc -l`. Core loop = routine → Ronki → return tomorrow.

### 3.1 Tabs and home

| Surface | File(s) | Lines | Reach | Purpose | Reads / writes | Core loop | Tests |
|---|---|---|---|---|---|---|---|
| Nest (hub) | drachennest/RoomHub.jsx, RoomHubBits.jsx | 735, 40 | tab `hub` (NavBar.jsx:42) | home scene, mood ask, entries | reads quests, catEvo, ronkiMood, moodAM, expedition, expeditionLog, childName; writes moodAM, expedition (start) | yes | RoomHub.test.jsx (6, mood entry only) |
| Heute (quests) | drachennest/RonkisTag.jsx | 737 | tab `quests` and RoomHub `aufgaben` (App.jsx:379-399, 419-424, 439-448) | the day strip, task taps | reads quests, taughtBreaths, expedition; writes via complete, startExpedition | yes | RonkisTag.test.jsx (4) |
| Ronki | RonkiProfile.jsx | 1554 | tab `ronki`, unlock `totalTasksDone ≥ 1` (tabUnlocks.ts:37-42) | Ronki's page | reads mood, catEvo, hp, arcEngine, micropediaDiscovered, companionName; writes ronkiMood (sync), URL-param patches in prod (271-315, not DEV-gated) | partly | RonkiProfile.nickname.test.jsx (3) |
| Tagebuch (journal) | Journal.jsx, JournalFeelings.jsx | 735, 51 | tab `journal`, unlock `journalEverUnlocked` OR (≥ 3 tasks AND today's mood) (tabUnlocks.ts:43-56); `journalEverUnlocked` has no writer, so it re-locks every new day until a mood is picked | mood, prompt, gratitude, day emoji, save | reads/writes journal*, moodAM; saveJournal | partly | none |
| Laden (shop) | Belohnungsbank.jsx, BelohnungRedeemModal.jsx, TopBar.jsx, CurrencyIcons.jsx | 168, 130, 99, 128 | tab `shop`, unlock `hp ≥ 50` (tabUnlocks.ts:57-64) | spend Sterne on real-life rewards | reads hp; writes hp via redeemReward (TaskContext.tsx:2117-2124) | partly | none |

Laden detail: 6 rewards `bel_coloring` 50, `bel_candy` 80, `bel_storytime` 120, `bel_evoboost` "Begleiter-Boost (+5 EP)" 200 (deducts Sterne, adds no EP), `bel_vote` 300, `bel_trip` 500 (constants.ts:457-462). Redeem sheet: "Zeig das deinen Eltern! 👋", "Genehmigt! ✓" (no PIN), "Abbrechen" (BelohnungRedeemModal.jsx:102-126). Subtitle "Wandle Punkte in tolle Erlebnisse um!" and how-it-works text still names "Funkelzeit" (de.json:472, 484). The parent lock in this top bar is **the only entry to the Eltern-Bereich** (TopBar.jsx:25, 62-65; App.jsx:400; Journal passes `onOpenParental` but renders no lock), so parents cannot open the dashboard until the kid has 50 Sterne.

### 3.2 RoomHub sub-surfaces

| Surface | File(s) | Lines | Reach | Purpose | Reads / writes | Core loop | Tests |
|---|---|---|---|---|---|---|---|
| Bei Ronki sitzen | drachennest/BeiRonkiSein.jsx | 167 | in RoomHub pill "Bei Ronki sitzen" / "ohne Sterne" (420-432) | calm sit, one story line, "Tipp irgendwo, um zurück zu gehen" | reads variant, catEvo; writes none; `companion.sit` | partly | none |
| Expedition (Ronkis Reise) | drachennest/Expedition.jsx | 862 | in RoomHub tile "Karte" (532-540) or sun card (456-480) | trip state machine, Naturtagebuch, diary | reads expedition, expeditionLog, quests; writes via rangerDeparted/Arrived, receiveMemento | yes | none |
| RonkiAwayLoop | drachennest/RonkiAwayLoop.jsx | 98 | inside Expedition while `away` (Expedition.jsx:335-337) | Ronki on a cloud over the Morgenwald, discovered friends peek | reads micropediaDiscovered | partly | none |
| CaveStyleSheet (Einrichten) | drachennest/CaveStyleSheet.jsx, data/caveStyles.ts | 223, 159 | **unreachable** (`SHOW_ROOM_STYLE = false`, RoomHub.jsx:58) | wallpaper and floor picker | writes caveStyle (nothing paints it) | no | none |
| Mood prompt | RoomHub.jsx:638-690 | in 735 | RoomHub while `moodAM === null` | "Ronki fragt" / "Wie geht's dir heute, {name}?" six tiles Gut, Magisch, Okay, Traurig, Besorgt, Müde | writes moodAM | partly | RoomHub.test.jsx |
| "Wie geht's dir?" pill | RoomHub.jsx:121-136, 267-287 | in 735 | RoomHub header while `moodAM === null` | scrolls to and rings the mood tiles | none | no | RoomHub.test.jsx |
| Ronki speech bubble | drachennest/RonkiSpeechBubble.jsx | 111 | RoomHub scene | 6 fixed lines, tap to dismiss, 6 s quiet | none | no | none |
| Tap Ronki | RoomHub.jsx:185-221 | in 735 | RoomHub scene | hearts, "hihi", body move every 3rd tap, voice `room_tap_0..9` (7 s cooldown, 1 in 3) | `companion.tap` | no | none |
| Fundstücke | RoomHub.jsx:698-735 | in 735 | RoomHub, display only | last 3 mementos + dimmed starter trio | reads expeditionLog | partly | none |

### 3.3 Other kid surfaces

| Surface | File(s) | Lines | Reach | Purpose | Reads / writes | Core loop | Tests |
|---|---|---|---|---|---|---|---|
| RonkisTag parts | RonkisTag.jsx (MorningHeader, BlockStrip, StripScene, CheerMoment, AnchorCompleteCard, EndOfDayScene) | in 737 | Heute | see 2.1 to 2.4 | quests | yes | RonkisTag.test.jsx |
| ToothbrushTimer | ToothbrushTimer.jsx | 308 | effectively **unreachable** (id mismatch, RonkisTag.jsx:42) | 2-minute brush timer | completes quest | no | none |
| TonightRitual | drachennest/TonightRitual.jsx | 504 | RoomHub night card; EndOfDay "Ins Lager" | bedtime story ritual | none written | yes (end beat) | none |
| Profile: mood window, drawer Über / Details / Stärken, EvolutionTree | RonkiProfile.jsx:447-757, 1460-1531 | in 1554 | tab Ronki | quip, facts, "Tage zusammen" (always 0), Sterne, "Abenteuer" (arcs, 0), traits, growth tree | reads catEvo, hp, hatchTraits (never written), earnedTraits | partly | nickname test |
| Profile segment Freunde | RonkiProfile.jsx:1056-1117 | in 1554 | tab Ronki (default segment, 265) | "Ronkis Freunde", "{n} von {m} getroffen", opens Micropedia | micropediaDiscovered | no | none |
| Profile segment Feuer | RonkiProfile.jsx:1123-1125; FireBreathCollection.jsx; TeachRitualModal.jsx | 442, 238 | tab Ronki → "Feuer"; ritual card when `pendingRitual` (30/70/130/200 tasks) | fire-breath flavours, teach ritual | reads taughtBreaths, pendingRitual; writes teachBreath | partly | none |
| Profile segment Pflege (care, bad-day reactions, Box-Atmung teaching, Chronik, Kodex) | RonkiProfile.jsx:821-1055 | in 1554 | **unreachable** (segment list 775-782 has only freunde and feuer) | Füttern / Streicheln / Spielen, sad-day reactions, `Eure Chronik` → Buch, `kodex` (a view that no longer exists, 1026) | would write catFed/Petted/Played, catEvo, journalHistory | no | none |
| Profile segment Erinnerungen | RonkiProfile.jsx:1133-1135, 1304-1455 | in 1554 | **unreachable** | merged memories list | reads journalHistory, arcs, badges | no | none |
| Buch ("Unser Buch") | Buch.jsx | 426 | **unreachable** (only from Pflege ChronikCta 1019 and Erinnerungen) | storybook chapters | reads arcs, badges, journal | no | none |
| Micropedia | Micropedia.jsx, ChapterAmbient.jsx | 466, 144 | in Profile → Freunde card (RonkiProfile.jsx:1065) | creature grid, 5 chapters | micropediaDiscovered | no | none |
| FriendIntroCeremony | drachennest/FriendIntroCeremony.jsx | 319 | automatic on first discovery (App.jsx:256-273), 22 triggers (useMicropediaDiscovery.ts:20-54) | full-screen creature intro | reads creature data | no (interrupts it) | none |
| ChibiFriend | drachennest/ChibiFriend.jsx | 958 | renderer used by 12 files | SVG friend sprites | none | no | none |
| FreundCallbackCard | FreundCallbackCard.jsx, hooks/useEventSurface.ts | 170, 46 | mounted (App.jsx:645) but needs `freundCallbacksPending`, written only when an arc completes, which never happens | delayed friend callback | freundCallbacksPending | no | none |
| FreundIntroModal | FreundIntroModal.jsx | 206 | in ForscherEcke | a Freund introduces a MINT game | none | no | none |
| FreundSpriteReunion | FreundSpriteReunion.jsx | 379 | **unreachable** (only ArcOfferCard, commented out, App.jsx:36-37, 644) | arc reunion | arcEngine | no | none |
| MemoryWall | MemoryWall.jsx | 283 | **unreachable** (view `memories`, no navigator) | achievements wall | bossTrophies, badges | no | none |
| DiscoveryLog | DiscoveryLog.jsx | 214 | **unreachable** (view `discovery`) | arc timeline | arcEngine | no | none |
| ChibiGallery | ChibiGallery.jsx | 186 | dev `?gallery=1` | colourway review | none | no | none |
| RonkiCompendium + CampfireScene | RonkiCompendium.jsx, CampfireScene.jsx | 571, 808 | public URL `?compendium=1` (App.jsx:716-730) | public Sammelbuch | none | no | none |
| CelebrationQueue | context/CelebrationQueue.tsx | 228 | provider around everything | one takeover at a time, toast quiet days 1 to 2 | onboardingDate | infra | none |
| Celebration (victory, levelUp, evolution, chest, forscherGraduation) | Celebration.jsx, CooldownButton.jsx | 308, 81 | automatic from TaskContext queue | full-screen celebrations; levelUp and evolution hidden in public mode; chest never queued (streak chests removed, 1357-1358) | reads quests | partly | CooldownButton.test.jsx (6) |
| TabUnlockCelebration | TabUnlockCelebration.jsx | 346 | automatic | unlock toast + first-visit coachmark "Alles klar" (de.json:761-767) | tabUnlocksSeen, tabCoachmarksSeen | no | none |
| CompanionToast | CompanionToast.jsx, RonkiPortrait.jsx | 48, 93 | automatic on every completion | 1.2 s praise line | none | partly | none |
| SpendEffect | SpendEffect.jsx | 101 | automatic when hp drops | sparkle on spend | reads hp | no | none |
| QuestEater + PinnedRonki | QuestEater.jsx, PinnedRonki.jsx | 175, 227 | PinnedRonki only in Tagebuch and Laden top bars; flyer never runs on RonkisTag | quest-flies-into-Ronki beat, block ring | quests | half | none |
| CreatureDiscoveryToast | CreatureDiscoveryToast.jsx | 110 | **unreachable** (imported, not rendered, App.jsx:99, 647-649) | small discovery toast | | no | none |
| ParentIntroOverlay | ParentIntroOverlay.jsx | 93 | **unreachable** (not mounted, App.jsx:635-639) | parent-zone intro | louisSeenParentIntro | no | none |
| AlphaBanner | AlphaBanner.jsx | 71 | always, above everything (App.jsx:1072) | "Alpha · Frühe Version, Daten können sich ändern", kid-tappable "DE ▸ EN" and mailto "Rückmeldung" | language | no | none |
| SWUpdateBanner | SWUpdateBanner.jsx | 74 | mounted, but the SW is unregistered on every load (main.jsx:67-81) | update prompt | | no | none |
| PWAInstallSheet | PWAInstallSheet.jsx, hooks/usePWAPromptGate.js, usePWAInstall.js | 135, 150, 38 | automatic (1B/B5) | home-screen install | pwaPromptShown, lastLoginDate | partly | none |
| PinModal | PinModal.jsx | 86 | Laden lock | 4-digit gate; checks `state.parentPin` or default 1234 (12-21) | `parent.pin.enter` | no | none |

### 3.4 Spielzeug (MiniGames) and games

`MiniGames.jsx` (480 lines, not Bilderbuch-restyled, Material glyphs and gradients) is reached from RoomHub "Spielzeug" (RoomHub.jsx:524-531 → App.jsx:427 `games`). Gate `useGameAccess` (hooks/useGameAccess.ts; lib/minigameAccess.ts 72): fresh installs default to `routine` (TaskContext.tsx:865; older saves rehydrate to `frei`, 1094), so games stay locked until a routine block is done: "Erst deine Aufgaben!" / "Schließe eine Routine ab, dann darfst du spielen. 💪" (MiniGames.jsx:205-212). Stamina: `consumeStamina()` on start (138) and `claimGameReward()` again −1 on finish for the classic games (TaskContext.tsx:2159-2174), neither checks the `frei` mode.

| Game | File | Lines | Reach | Reward | Tests |
|---|---|---|---|---|---|
| Memory | MemoryGame.jsx | 280 | MiniGames tile | none (claimGameReward) | none |
| StarCatcher (Sternenfänger) | StarCatcherGame.jsx | 529 | MiniGames tile | none | none |
| Potion (Farbmix) | PotionGame.jsx | 267 | MiniGames tile | none | none |
| CloudJump (Wolkensprung) | CloudJumpGame.jsx | 440 | MiniGames tile (PRD 7 says delete) | none | none |
| Starfighter | StarfighterGame.jsx | 596 | MiniGames tile (PRD 7 says delete) | `reward.hp` + claim | none |
| Zahlenjagd | ZahlenjagdGame.jsx | 660 | ForscherEcke (≥ 10 tasks) / earned replay | +50 Sterne on win (632) | minigameAccess.test (gate only) |
| MusterMemory | MusterMemoryGame.jsx | 441 | ForscherEcke | +50 Sterne (426) | none |
| WurzelLabyrinth | WurzelLabyrinthGame.jsx | 609 | ForscherEcke | +50 Sterne (574) | none |
| PilzWaage | PilzWaageGame.jsx | 810 | ForscherEcke | +50 Sterne (787) | none |
| KristallKette | KristallKetteGame.jsx | 371 | ForscherEcke (`kristall-sortierer` id, App.jsx:520) | badge, hp | none |
| KristallHoehle | KristallHoehleGame.jsx | 655 | MiniGames tile at ≥ 15 tasks (MiniGames.jsx:101, 250-274) | adds crystalInventory, no sink | none |
| CampfireVisitors | CampfireVisitorsGame.jsx | 523 | dev `?visitors=1` only | spends crystals, freundFriendship | none |
| ForscherEcke | ForscherEcke.jsx, AttentionGlow.jsx, data/mintGames.ts | 274, 172, 120 | MiniGames at ≥ 10 tasks | sequential MINT chain, graduation celebration | none |
| StaminaIndicator / StaminaExhausted | StaminaIndicator.jsx, StaminaExhausted.jsx, hooks/useRonkiStamina.ts | 49, 233, 87 | MiniGames | stamina UI, voices `stamina_low_01`, `stamina_exhausted_01` | none |

One MINT win (+50) equals five routine tasks in Sterne.

### 3.5 Emotional tools

None has an in-app entry. The only routes are DEV URL params (App.jsx:160-166) mapped to views (App.jsx:545-593). No component calls `setView('drei-danke')` or similar (grep).

| Tool | File | Lines | Reach | Writes |
|---|---|---|---|---|
| DreiDanke | DreiDankeTool.jsx | 310 | dev `?dreiDanke=1` | practice / learned skills |
| Kraftwort | KraftwortTool.jsx | 249 | dev `?kraftwort=1` | practiceSkill('kraftwort') (70) |
| LöwenPose | LoewenPoseTool.jsx | 464 | dev `?loewe=1` | learned skill 'loewe' (233-236) |
| SteinUndGummi | SteinUndGummiTool.jsx | 380 | dev `?steinGummi=1` | skills |
| GedankenWolken | GedankenWolkenTool.jsx | 299 | dev `?gedankenWolken=1` | practiceSkill (92) |
| Hörmoment | HoermomentTool.jsx | 264 | dev `?hoermoment=1` | practiceSkill (79) |
| Box-Atmung | no component exists | 0 | copy only, inside the unreachable Pflege segment (RonkiProfile.jsx:883-911) | |
| BaumPose | BaumPoseBeat.jsx | 117 | **unreachable** (no importer) | |
| RonkiAusmalbild | RonkiAusmalbild.jsx | 434 | dev `?ausmalbild=1`; redeeming "Ronki-Ausmalbild" in the Laden only deducts 50 Sterne and does not open it | completedColoringPages; `ausmalbild.redeem` |

Tests: none for any tool. `tool.open/tool.complete` fire only for these dev-only views (App.jsx:124-135, 319-336).

### 3.6 Systems in code

| System | Files | Lines | Reach | State | Core loop | Tests |
|---|---|---|---|---|---|---|
| Special quests | hooks/useSpecialQuests.ts, data/specialQuests.ts | 153, 34 | runs in AppContent (App.jsx:244) | silently adds xp, completedSpecialQuests; offers Freund arcs via patchState | no | none |
| Arcs | src/arcs/ (ArcEngine 148, arcs 29, first-adventure 56, freund-pilzhueter 58, listening-game 52, narratorMap 52, persistence 12, ronkis-garden 53, types 73, useArc 129) | 662 | engine called in complete() and useSpecialQuests; no accept UI (ArcOfferCard commented out); `arcEngine` is missing from the rehydration list (TaskContext.tsx:1003-1199), so it resets on every reload | arcEngine | no | ArcEngine 14, arcs 5, persistence 3, types 2 |
| Dream | src/dream/ (dreamHighlights 20, types 21) | 41 | built in applyDayTransition | dreamHighlights, never read | no | dreamHighlights.test 11 |
| Companion voice engine | src/companion/ (VoiceEngine 108, useVoice 185, lines/de 138, lines/en 77, types 68, voiceLines 9) | 585 | **unreachable** (useVoice only in TaskList) | earnedTraits read | no | VoiceEngine.test 20 |
| Gear / ClothingSheet | ClothingSheet.jsx; GEAR_ITEMS constants.ts:586-613 | 79 | **unreachable** (TaskList only; equipGear no caller) | gearInventory, equippedGear | no | none |
| Legacy TaskList + DailyHabits + ToothBrushGuide | TaskList.jsx, DailyHabits.jsx, ToothBrushGuide.jsx | 793, 161, 314 | **unreachable** (imported App.jsx:11, never rendered) | only live `quest.complete` / `routine.complete` callers | no | none |
| Legacy GameContext stack | context/GameContext.tsx, hooks/useGameActions.ts, useGamePersistence.ts, useComputedState.ts, components/Weather.jsx, ui.jsx | 93, 648, 316, 40, 133, 105 | **unreachable** | totalTaskDays (only writer) | no | game-mechanics 24, validation 15 (constants only) |
| Other orphans | VitalsRing.jsx 121, VoiceBubble.jsx 119, ErrorBoundary.jsx 55, ArcOfferCard.jsx 76 | 371 | **unreachable** | | no | none |
| Background music | utils/backgroundMusic.ts | 315 | booted in AuthGate, off by default, dashboard toggle; synth pad, no file | localStorage | no | none |
| Voice system | utils/voiceAudio.ts, utils/sfx.js, utils/tts.ts | 221, 178, 94 | everywhere; narrator hard-muted (27-43); Ronki voice on by default | localStorage mute | partly | none |
| Voice files | public/audio/ronki (270 files) | | | missing but called: `meet_close_01`, `slowdown_01` (hooks/useQuietAttention.ts:41), `brush_done_01` | | |
| Onboarding previews | TeachFirePreview.jsx 172, TeachRitualPreview.jsx 147 | 319 | public URLs `?teachFirePreview=1`, `?teachRitualPreview=1`, `?onboardingPreview=1` | | no | none |
| Legal pages | pages/Impressum, Datenschutz, Nutzungsbedingungen | 148, 300, 263 | router routes (main.jsx:11-47) | | no | none |

### 3.7 ParentalDashboard (`src/components/ParentalDashboard.jsx`, 2036 lines; reach: Laden lock → PinModal)

Tabs "Übersicht", "Familie", "Einstellungen" (215-218; de.json:282-285). Fires `parent.dashboard.open` (76). Not Bilderbuch-restyled (teal).
- **Übersicht** (263-515): "Heute zeigen wir {Kind}:" status items (e.g. "Abenteuer läuft", "Abenteuer wartet", "Botschaft an"), StatCard "Sterne", "Stimmung (7 Tage)" chart, "Journal-Eintrag heute", "Aufgaben heute" list (main quests), "Begleiter-Pflege" (Gefüttert / Gestreichelt / Gespielt, always false because the care buttons are unreachable).
- **Familie** (516-822): Kind (name, pronouns, the childName-check note from the name split 569-585), Geschwister, Tägliche Gewohnheiten, Wiederkehrende Aktivitäten, Eltern-Nachricht (toggle, title, body, signature), Motto & Affirmation, save → `updateFamilyConfig`. Live kid effect: **childName only**. Habits and activities feed the unreachable TaskList; `parentMessage` and `familyMotto` have no reader; `affirmation` only KraftwortTool (dev).
- **Einstellungen** (1013-2036), in order: default-PIN banner "PIN ist noch 1234" (1255-1280); Zähneputzen-Modus Tasche / Schau (reader ToothBrushGuide, unreachable); Zeig-Moment toggle, Mama / Papa, counter reset (no reader anywhere); Minispiele: Frei / Mit Routine verbunden / Zeitfenster, "Ausdauer pro Tag" Streng 5 / Normal 10 / Locker 15, Von / Bis (live); Haptik Aus / Sanft / Normal (live); RPG-Modus (no reader); Nutzungsstatistiken (live, `analyticsEnabled`); Stimmen (Ronki voice mute, live); Hintergrundmusik (live); "Sprache / Language" Deutsch / English (live); Profil & Geräte: QR canvas, "Profil-Code", share link, print card, "Neues Profil anlegen (alten Code ungültig machen)"; PIN ändern; "Feedback an Marc" → FeedbackModal (FeedbackModal.jsx 262); "Ronki füttern (+Energie)" = restoreStamina; "Tag zurücksetzen".
- **PIN bug**: "PIN ändern" reads and writes `localStorage.ronki_pin` with default 1234 (1022, 1030-1052), while the real gate checks `state.parentPin` (PinModal.jsx:12-21). A PIN set at setup or on the website fails the dashboard's "Aktuellen PIN eingeben", and a PIN changed in the dashboard does not change the gate.

---

## 4. Economy and progression fields in TaskState

Type: TaskContext.tsx:162-542. Rehydration allowlist: 1003-1199. Fields in the type but **not rehydrated**: `arcEngine`, `totalQuestCompletions`, `poemQuest`, `zeigMomentCounts`, `zeigMomentShownDates` (they persist in storage through the save merge at 1290-1292 but load as undefined into live state).

| Field | Writers (live unless noted) | Live readers | Status |
|---|---|---|---|
| `hp` (Sterne) | complete +10 (1491); addHP from MINT/Starfighter (App.jsx:480-630); completeHabit (dead caller); feed/pet/play +1 (unreachable); drinkWater (no caller); redeemReward − (2117); capped at 50 once by migration (1201-1205) | Laden, Profile Details "Sterne", Laden unlock ≥ 50, SpendEffect, dashboard | **live currency** |
| `xp` | complete, special quests (2253-2265) | levelUp celebration only, hidden in public mode | **dead in public mode** |
| `totalTasksDone` | complete | tab unlocks, creatures, MiniGames gates 10/15, rituals 30/70/130/200, PWA prompt ≥ 2 | **live counter** (the real progression driver) |
| `catEvo` | completeOnboarding (sets 3); feed/pet/play (unreachable); drinkWater, missions (no caller); dev URL; RonkiProfile `?stage=` (prod) | stage art everywhere, EvolutionTree, hearth_0 trigger | **frozen at 3 (Baby)** |
| `totalTaskDays` | only unreachable useGameActions.ts:204 | Profile "Tage zusammen", Buch, CelebrationQueue fallback | **read, never written** |
| `drachenEier` | complete +1/+3 (1493, 1578) | useGameActions (unreachable); special-quest trigger `screenMin` (no quest uses it) | **dead** |
| `orbs` | complete (1536-1555) | none | **dead** |
| `heroStats` | complete (1557-1563) | none | **dead** |
| `boss`, `bossDmgToday`, `bossKilledToday` | complete, day transition | dreamHighlights (dead) | **dead**, invisible boss |
| `bossTrophies` | complete on boss kill (~8 dmg per task vs 60 to 80 hp tier-1 bosses, constants.ts:270-285) | creature `water_3` trigger (useMicropediaDiscovery.ts:41), MemoryWall (unreachable) | **hidden driver** of one creature |
| `unlockedBadges` | complete (1584-1601) | Buch, MemoryWall, Erinnerungen (all unreachable) | **dead** |
| `chestsClaimed` | day transition copies | none | **dead** |
| `activeMissions`, `completedMissions` | startMission (no caller) | dashboard | **dead** |
| `gearInventory`, `equippedGear` | missions, equipGear (no caller) | complete (courage bonus) | **dead** |
| `sm`, `quests[].streak` | day transition | syncRonkiMood `magisch` at 7/14/21... | **hidden streak**, no UI |
| `ronkiVitals`, `careTokens` | receiveMemento resets vitals to 70 (2066) | none | **dead** |
| `ronkiStamina` | consumeStamina, claimGameReward, restoreStamina, day refill | MiniGames, dashboard | live (minigame) |
| `taughtBreaths`, `pendingRitual` | completeOnboarding, complete, teachBreath | FireBreathCollection; flavorForQuest in RonkisTag (flyer skipped) | live via Ronki → Feuer |
| `expedition`, `expeditionLog` | start/depart/arrive/receive | RoomHub, Expedition | live |
| `micropediaDiscovered` | useMicropediaDiscovery | Micropedia, Profile Freunde, ceremonies, AwayLoop | live |
| `mintBadgesEarned`, `mintGamesPlayed`, `forscherFunkelUnlocked` | MINT games, ForscherEcke | MiniGames, ForscherEcke, hearth_2 | live (≥ 10 tasks) |
| `crystalInventory` | KristallHoehle | CampfireVisitors (dev) | **no sink** |
| `freundFriendship`, `todaysVisitor` | CampfireVisitors (dev) | same | **dead in prod** |
| `earnedTraits` | arc completion (never) | Profile Stärken | **dead**, traits come from `when()` rules |
| `hatchTraits` | none | EvolutionTree | **read, never written** |
| `ronkiSkillPractice`, `ronkiLearnedSkills`, `ronkiLearnBannerSeen` | tools (dev only) | Pflege (unreachable) | **dead in prod** |
| `feelingsLog` | logFeeling (no caller) | none | **dead** |
| `garden` | plantSeed / placeDecor (no caller) | none | **dead** |
| `dreamHighlights` | day transition | none | **dead** |
| `arcEngine` | complete, useSpecialQuests offer | Profile "Abenteuer" count, dashboard | **dead** (never active, not rehydrated) |
| `completedSpecialQuests` | useSpecialQuests | MemoryWall (unreachable) | **dead** (xp side effect only) |
| `completedColoringPages` | RonkiAusmalbild (dev) | same | **dead in prod** |
| `journal*`, `journalHistory` | Journal, day transition, pickRonkiSadReaction (unreachable) | Journal, dashboard, creature triggers | live |
| `moodAM` | RoomHub, Journal | RoomHub, Journal, Tagebuch unlock, dream_0 | live; `moodPM` never set by UI |
| `eggProgress`, `eggHatched`, `pendingEgg`, `collectedEggs`, `eggTriggersFired`, `funkelzeitMinutesToday`, `dailyWaterCount`, `loginBonusClaimed`, `emojiCode`, `friends`, `winks*`, `todaysKraftwort`, `caveStyle` | no live writer (caveStyle only from hidden sheet) | none that paints | **dead** |

---

## 5. Navigation weight from the home screen (RoomHub)

**One tap, day 1 before the mood pick (24 tappables):**
AlphaBanner "DE ▸ EN" (1), "Rückmeldung" mailto (1); "Wie geht's dir?" pill (1); Ronki (1); speech bubble (1); 6 mood tiles (6); "Bei Ronki sitzen" (1); "Heute Abend mit Ronki" (1); "Heute auf der Schriftrolle" (1); Morgens / Nachmittag / Abends tiles (3, all open the same strip); "Spielzeug" (1); "Karte" (1); nav Nest, Heute, Ronki, Tagebuch, Laden (5; the last three show a lock hint until unlocked, NavBar.jsx:103-116, de.json:758-760: "Mach deine erste Aufgabe {Gedankenstrich} dann kommt Ronki zu dir.", "Log deine Stimmung und erledige 3 Aufgaben, dann hast du was zu erzählen.", "Sammle 50 Sterne, dann kannst du sie hier eintauschen. Du hast {current} von 50."). Conditional: the "Ronki ist bereit" sun card (+1). After the mood pick the pill and 6 tiles disappear (17 left).
Distinct destinations: BeiRonkiSein, TonightRitual, RonkisTag, MiniGames, Expedition, plus RonkiProfile, Journal, Belohnungsbank once unlocked.

**Two taps (new tappables one level down, all tabs unlocked):**
- RonkisTag: back + 12 to 14 task cards + conditional "Reise verfolgen" / "Ins Lager" ≈ 14 to 16 (nav is covered, z 90).
- MiniGames: 5 classic tiles + Kristall-Höhle (≥ 15 tasks) + ForscherEcke game (≥ 10) + earned MINT replays ≈ 5 to 11.
- Expedition: back, CTA, diary sticker (waiting) ≈ 2 to 3.
- BeiRonkiSein: 1 (tap anywhere). TonightRitual: 1 (story tap), later 2 more ("Nochmal", "Schließen").
- RonkiProfile: chibi, 3 drawer tabs, 2 segments, Freunde card ≈ 7 (+ ritual card when pending).
- Journal: back, PinnedRonki, 6 moods, text field, 7 gratitude chips, 9 day emojis, 5 achievements, save ≈ 31.
- Belohnungsbank: back, PinnedRonki, Sterne pill, parent lock, up to 6 redeem buttons ≈ 4 to 10.
- Total two-tap tappables ≈ 65 to 80. Day 1 with tabs locked: ≈ 25 to 35.

---

## 6. Notifications, PWA, return triggers

- **No push or local notifications**: no `Notification`, `showNotification`, `pushManager`, `setAppBadge` anywhere in `src/` or `public/`. The service worker is actively unregistered and its caches cleared on every load (main.jsx:57-81); `public/sw.js` has no push handler. SWUpdateBanner can therefore never fire.
- Manifest: `display: standalone`, `start_url: /`, no shortcuts (public/manifest.json).
- The one PWA hook is the install sheet after ≥ 2 tasks with the line "…damit ihr euch morgen schneller wiederseht." (de.json:278), one day-2 retry.
- No reminder, no parent-set time, no widget.
- What brings a kid back tomorrow today: the close line "Bis morgen. Versprochen." (once, at onboarding), a trip that may still be out (visible only after tapping "Karte"), the Tagebuch that re-locks until the mood is picked, and the parent. Nothing in the evening names tomorrow.

---

## 7. Analytics events that actually fire

Allowlist (lib/analytics.ts:26-55): 23 names. Transport: batched insert into `telemetry_events` via supabase-js (297-301), offline queue in localStorage capped at 200 (223-235).

**Consent gate**: default off (TaskContext.tsx:884; analytics.ts:168-178). Two layers: the `useAnalytics` hook checks `state.analyticsEnabled` and mirrors it into the module flag + `localStorage.ronki_analytics_enabled` (hooks/useAnalytics.ts:20-41); raw `track()` checks only the module flag (analytics.ts:238-239). The hook is first mounted in AppContent (App.jsx:140), so during onboarding the module flag is whatever the device stored before. On a fresh device `ronki.hatch` is dropped even when the parent consented on the website.

**Transport caveat**: the only insert policy is `TO authenticated` (supabase/migrations/20260422000000_telemetry_events.sql:22-25) and the app never signs in (App.jsx:794; AuthContext has no automatic sign-in). Unless the live database has a different policy, every insert fails and events pile up in the capped offline queue.

| Event | Fired from | Gate |
|---|---|---|
| `app.open` | App.jsx:310 (once per session) | hook |
| `tool.open`, `tool.complete` | App.jsx:327, 333 (dev-only tool views) | hook |
| `ronki.hatch` | drachennest/MeetRonki.jsx:188 | raw |
| `companion.tap` | drachennest/RoomHub.jsx:199 | raw |
| `companion.sit` | drachennest/BeiRonkiSein.jsx:75 | raw |
| `tonight.start`, `tonight.complete` | drachennest/TonightRitual.jsx:106, 139 | raw |
| `expedition.start`, `expedition.return`, `memento.received` | context/TaskContext.tsx:2033, 2047, 2082 | raw |
| `journal.write` | Journal.jsx:135 | hook |
| `mood.pick` | Journal.jsx:316 only (not RoomHub) | hook |
| `game.start` | MiniGames.jsx:139, 330 | hook |
| `parent.dashboard.open` | ParentalDashboard.jsx:76 | hook |
| `parent.pin.enter` | PinModal.jsx:28 | hook |
| `ausmalbild.redeem` | RonkiAusmalbild.jsx:223 (dev-only view) | hook |
| `quest.complete`, `routine.complete` | TaskList.jsx:141, 154 (unreachable) | never fire |
| `game.end`, `ronki.evolve`, `parent.setting.change` | no caller | never fire |

No event covers the landing, the scan, the egg pick, the name, the teach beat, or any task completion on the live strip. Website funnel events go to Plausible separately (website/src/lib/profileSetup.ts:110).

---

## 8. Tests and guards

- Scripts (package.json): `npm test` = `vitest run`; `npm run test:watch`; `npm run test:web` (website config); `npm run check:names` = `node scripts/check-names.mjs`, which runs `tsc --noEmit --checkJs` and fails only on TS2304/TS2552 undefined-name errors outside test files (scripts/check-names.mjs:1-20); `npm run mock:supabase` (local PostgREST mock).
- Counts: HANDOFF.md:21-22 states **222 app tests green** and `check:names` clean at the end of the 25 Sep run, before `e089cfd`. `e089cfd` added tests to MeetRonki.test.jsx and RonkiProfile.nickname.test.jsx. A static grep of `it(`/`test(` finds about 249 declarations in 23 app test files (not run here, may differ from the vitest count). Website has 10 test files.
- Coverage of the areas that matter:
  - Onboarding: `src/components/drachennest/MeetRonki.test.jsx` (7: four eggs, phase run, six voiced chips, typing, chip after typing, 18-char cap, sticky bar). Nothing for NoProfileLanding, CombinedParentSetup, HandoffBackCard, TeachFireStep/TeachBreathBeat, the OnboardingGate phase logic.
  - QR load: `src/utils/storage.test.js` (16, includes "syncLoadByToken with a website card seed" and the sibling guard).
  - RoomHub: `src/components/drachennest/RoomHub.test.jsx` (6, all on the "Wie geht's dir?" entry and mood tiles).
  - RonkisTag: `src/components/drachennest/RonkisTag.test.jsx` (4: paint, tap completes and cheer < 1.5 s, sun check, night loop).
  - TaskContext rehydration: `src/context/TaskContext.companionName.test.jsx` (7, companionName and the childName split only); `src/context/TaskContext.test.ts` (1, no streak field). No test for complete(), applyDayTransition, expedition transitions, or the rehydration allowlist as a whole.
  - Others: analytics (19), minigameAccess (17), helpers (38), game-mechanics (24, constants), validation (15), arcs (24), VoiceEngine (20), dreamHighlights (11), bilderbuch primitives (10), companionVariants (9), haptics (8), CooldownButton (6), useWeather (4), RonkiProfile nickname (3).
- Known guard gaps: HANDOFF.md:21 notes 23 pre-existing tsc errors; `check:names` would not catch the id mismatches above (teeth ids, orb map), the `hdx2` key, or the PIN split, since those are valid names.
