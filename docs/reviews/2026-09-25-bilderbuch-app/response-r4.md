# Name chips: review record (25 Sep 2026, late)

Marc's asks: "add name chips to onboarding", then two decisions in chat: the pick is **a nickname for Ronki** (not the child's name), and **yes, generate six voice lines** with Harry.

- Build: `e089cfd`. Own read first: `own-read-r4.md`.
- Astra adversarial review of `09e622d..e089cfd`: `astra-code-r4.txt` (NOT YET, 1 finding).
- Claude review workflow `wf_f135aaca-300`: 3 lenses (data flow, kid UX and voice, edge cases and tests), 13 raw findings, top 6 checked by one skeptic each. 9 agents, about 1.1M tokens.
- Fixes: `6363c17`. Astra round 2 on the fixes: `astra-code-r4b.txt`.

## Found on the way (before the reviews)

The naming step asked for the dragon's name ("Hm, wie soll ich heißen?"), stored it as `heroName`, and `completeOnboarding` copied `heroName` into `familyConfig.childName`, over the child's name from the parent setup. Live since the April onboarding trim. Home greeted "Hallo {dragon name}!", the diary told "Die Geschichte von {dragon name} & Ronki", the QR card printed the dragon's name. Marc picked option A: the chips name Ronki.

## Confirmed and fixed

| Source | Finding | Fix |
|---|---|---|
| Astra R1 BLOCKER, workflow (verified BLOCKER) | `companionName` was saved but missing from the TaskContext rehydration list, so the nickname vanished on every reload | Rehydrated through `cleanNickname` (string, trimmed, at most 18 characters counted as characters). Regression test renders `TaskProvider` with a saved state and checks the nickname and the untouched child name. My own read had flagged the risk ("whitelist, to check"). |
| Workflow (verified SHOULD) | `completeOnboarding` still accepted `heroName` and copied it into `childName`; DevHubPrime still passed one | The copy and the `heroName` parameter are gone; DevHubPrime sets the dev child's name through `updateFamilyConfig`. Test: `completeOnboarding` with a stray `heroName` leaves `childName` "Louis". |
| Workflow (verified SHOULD) | Old saves keep the dragon's name as the child's name; nothing repairs them | One-time split on load (`_v_companion_name_split`): where `heroName` equals `childName`, the name becomes `companionName` and `childNameNeedsCheck` is set. The parent area shows a note in "Kind" ("Früher landete hier aus Versehen der Name, den euer Kind Ronki gegeben hat ..."); saving the family settings clears it. PARTLY: the verifier suggested clearing `childName`; I kept it, because the rule cannot tell a real name from a dragon name (a kid who named Ronki after themselves) and a parent should decide. Tests: split once, never on a save with a different child name. |
| Workflow (verified SHOULD) | After a chip tap, the only way on sat below the fold at 320 px, unvoiced | The confirm pill is a sticky bar at the bottom of the name page and hops once when it wakes up. Checked at 320 x 568: in view and active right after picking the last chip. |
| Own read 2 | The QR print card preferred `heroName` over the child's name | Prints `familyConfig.childName` only. RoomHub's greeting no longer falls back to `heroName`. |
| Workflow, unverified COULD | `withNickname` expanded `$&` in a typed name; "ronki" check was case-sensitive | Function replacement, case-insensitive check. Tests. |
| Workflow, unverified COULD | The 18-character cap could cut an emoji in half | `Array.from` for the typed name and in `cleanNickname`. Tests. |
| Workflow, unverified COULD | "selbst schreiben" sat between the chips and the pill in the kid's colour; a stray tap wiped the picked chip | Quiet ink link; opening it keeps the chip, only typing replaces it. Test. |

Eight of the new tests were run against `e089cfd` first: all eight fail there and pass on `6363c17`.

## Refuted

- **Muted device leaves pre-readers with six identical chips.** The app's mute cannot be switched on during first-run onboarding; the case does not arise in this flow.
- **The close line says the nickname only as text.** True but not a defect of this diff: the close recording (`de_meet_close_01`) never existed. Noted as polish: the close could replay the chip line.

## Voice lines

Generated with `scripts/gen-name-chip-voices.py` (Harry, `SOYHLrjzK2X1ezoPC6cr`, `eleven_multilingual_v2`, the April settings), checked with Whisper large-v3-turbo. Glut and Knisti came out unclear as single words ("Glott", "Christi"); regenerated as "Hmm... Glut. Gluut?" and "Hmm... Knisti. Knis-ti?", which transcribe cleanly. Eight generations in total, about 120 characters.

## Astra round 2 on the fixes (`astra-code-r4b.txt`)

NOT YET, one finding, **AGREE**: `updateFamilyConfig` cleared the child-name check on every save, and unrelated settings (tooth-brushing mode, Zeig-Moment) save through it, so the note could vanish unseen while the dragon's name stayed. Now the note clears only when the child's name really changes, or when a parent taps "Stimmt so" in the note (for a kid who named Ronki after themselves). Test: an unrelated save keeps the note, a real name change clears it; it fails on `6363c17` and passes on the fix. Astra agreed with keeping `childName` for a parent to decide ("reasonable, provided acknowledgment is explicit"), which "Stimmt so" now provides. No round 3.

Checks after all fixes: 249 tests green, `check:names` clean, 23 pre-existing tsc errors unchanged, build green, browser pass at 320 x 568, 375 x 667 and 390 x 844.

