# Wesen: the Louis test (plan, 26 Sep 2026)

Concept: `docs/concepts/2026-09-26-ronki-sammler/index.html` (live page https://claude.ai/artifact/1pRUyWuUJJEZbxgMHUvEEV).

Marc's calls (26 Sep 2026): **befriend** (never "fangen"), **the task leaves the Nest** when its creature moves out, **no 12+ band**. Build the one-creature test for Louis, improve the art (new generations allowed), Astra reviews this plan before the build.

## Revised after Astra round 1 (built this way)

Astra's verdict was NOT YET; every point was taken except one method choice. Full table: `docs/reviews/2026-09-26-wesen-plan/fable-response-round1.md`. What changed against the text below:
- The creature is a friendly visitor from day one, not a shadow; the 5 days are shared moments, not a price. The child picks between three real small creatures (faces visible); the other two go home.
- Meeting: no progress ring. The child rests a finger, the creature walks over while it rests, Ronki shifts over to make room.
- Only daily self-care tasks can be linked, each with a written observable step for "allein". The "allein?" question appears on its own 7 days after the meeting; no date is shown ahead of time; "Noch nicht" asks again after 7 days.
- Move-out is a parent review point (4, 8 or 12 weeks after "allein"), never automatic. After "Ja" the task leaves at the next day start; the goodbye shows the task picture; "Wieder zurückholen" puts it back in its old place.
- The switch stops everything (no steps, no move-out) and appears only on a card whose parent area was opened once with `?wesen=1`.
- Sync: friends merge by instance id; after the merge, readiness comes from the merged days and a moved-out task stays out unless restored later.
- Go rule: a good two weeks earns a longer one-creature test through the departure, not the full book.

## Observation sheet for Marc (two weeks)

Before day 1, note once: how often does Louis need a reminder for the linked task, and does he need help? Then each day, one line:

| Day | Reminded? (0, 1, 2+) | Help needed? | Mentioned the creature without being asked? (his words) | Bargaining? (his exact words) | Anything else |
|---|---|---|---|---|---|

## The one idea

One habit = one creature. A shadow waits at the edge of the Nest. Each real completion of its task brings it one paw step closer. After 5 steps the child holds a finger still, the creature sniffs and joins Ronki at the fire. It grows when a parent says the child does the task alone. About 8 weeks later it moves out into the world, and the task leaves the routine.

## What the test has to answer (two weeks, Louis)

1. Does Louis talk about the creature when the app is closed? (Marc notes it; yes/no per day.)
2. Does the linked task get easier, or does Louis start bargaining ("I only brush if the creature comes")? (Marc notes it.)
3. Does the befriend moment land (he wants to show someone) or fall flat?

Go rule after two weeks: talks about it and no bargaining = draw more creatures and build the full book. Bargaining = stop, the reward is crowding out the reason.

## Scope of the MVP

In:
- **Parent switch** "Wesen ausprobieren" in the dashboard section "Ronkis Tag", off for every family. Only a card with the switch on sees anything. Plus a code switch `FEATURES.wesen` (on) so the whole thing can be pulled with one value.
- **Parent pick:** one task from the family's own routine (the task pictures the parent already sees). One creature at a time.
- **Child pick:** the next Nest open shows three shadows in a small sheet: "Wer soll zu dir kommen?" The child taps one. Choice, not luck. The other two stay silhouettes for later.
- **Steps:** each completion of the linked task counts one step, at most one per day key. Five paw marks beside the fire show how close it is. Ronki says one line after the step ("Es ist ein Stück näher gekommen!"). No step is ever taken away.
- **Befriend moment** at step 5: full-screen overlay, creature in the middle, a hold circle ("Halt deinen Finger ganz still"), no failure: lifting the finger just pauses the ring. On complete: sparkle, Ronki's line, the creature now sits at the fire in the Nest scene (small, beside Ronki, idle bob).
- **Grow:** in "Ronkis Tag", once the creature is a friend: "Macht {Kind} {Aufgabe} inzwischen allein?" with "Ja, allein" / "Noch nicht". Earliest 7 days after befriending (the button shows the date it opens). "Ja" sets stage grown; the next Nest open plays a growth beat (the existing GrowthBeat pattern with the creature art).
- **Move out:** a set number of weeks after "allein" (default 8, parent can pick 4, 8 or 12). The next Nest open shows the goodbye: creature flies off, Ronki: "{Name} kann das jetzt allein. Es zieht in die Welt." The linked task is removed from `familyConfig.routine` (Marc's call). A parent can put it back in "Ronkis Tag" any time. The dashboard shows one line before it happens: "Am {Datum} zieht {Name} aus, dann fällt {Aufgabe} aus Ronkis Tag."
- **Passport:** a small "Wesen" block under the stones: the current creature (shadow, friend or grown) with its paw marks, and a row "In die Welt gezogen" with each moved-out creature, its task and the child's age or the date.
- **Voice:** about 12 new Ronki lines in Harry's voice through `scripts/gen-finch-voice.py`, Whisper-checked.
- **Telemetry:** `wesen.pick`, `wesen.step`, `wesen.befriend`, `wesen.grow`, `wesen.moveout`, `wesen.parent_toggle`. (Known: the telemetry insert policy may drop client events; Marc's notes are the real data.)

Out (on purpose): more than one creature at a time, the book of 20, trouble creatures, Freunde as mentors, the world map, trading, any currency, any push or reminder, any decay. Age bands: the test is Louis (6, 1st grade) only; befriendAt stays 5.

## Art (new, Bilderbuch style)

Three creatures, three looks each (small, friend, grown); the shadow is the small look rendered as a silhouette in code. Same look as the Bilderbuch Ronki: flat confident colours, dark marker outline with a slight wobble, crayon and risograph grain, cut-out on transparent. Higgsfield `gpt_image_2_5`, high, 2k, 1:1 transparent, with Ronki's master cut-out as style reference; one creature sheet per line first so the three looks stay one character. About 12 generations, about 33 credits. Every prompt logged in `docs/design-briefs/2026-09-26-wesen-art-log.md`.

Draft cast (names short, sayable by a first grader):
- **Glutfunke**: a small round ember sprite, flame tuft, stubby feet. Grows arms and a longer flame; grown: a proud fire-fox shape with a flame tail.
- **Moosmops**: a round mossy forest pup with leaf ears. Grows a sprout on its head; grown: a small tree with a bird nest on its back.
- **Tropfi**: a water-drop axolotl with frilly gills. Grows longer frills and a fin; grown: carries its own small rain cloud.

## State and rules

```ts
// state.wesen (new top-level field; absent = test never started)
interface WesenState {
  enabled: boolean;                 // parent switch
  current: null | {
    creatureId: 'glutfunke' | 'moosmops' | 'tropfi' | null; // null = parent picked the task, child has not picked yet
    taskKind: TaskKind;             // from the family routine
    steps: number;                  // real completions, max 1 per day
    stepDays: string[];             // day keys that counted (dedup and merge)
    stage: 'shadow' | 'friend' | 'grown';
    pickedAt: string;               // ISO
    befriendedAt?: string;
    befriendSeen?: boolean;         // overlay shown
    aloneSince?: string;            // parent "Ja, allein"
    growSeen?: boolean;
    moveOutWeeks: 4 | 8 | 12;
  };
  movedOut: Array<{ creatureId: string; taskKind: TaskKind; movedOutAt: string }>;
}
```

Pure rules in `src/loop/wesen.ts` (unit-tested like `growth.ts`):
- `stepOnComplete(wesen, questId, dayKey)`: if the quest's `taskKind` equals `current.taskKind`, `creatureId` is set and `dayKey` is not in `stepDays`, add one step; `stage` becomes `friend` at 5 (overlay pending via `befriendSeen false`).
- `canAskAlone(wesen, now)`: stage friend and 7 days since `befriendedAt`.
- `moveOutDue(wesen, now)`: stage grown and `aloneSince + moveOutWeeks` passed.
- `applyMoveOut(state)`: appends to `movedOut`, clears `current`, removes the kind from `familyConfig.routine` (both blocks) and rebuilds today's quests the same way `setRoutine` does.

Hooks: `complete()` in `TaskContext` calls `stepOnComplete` inside the same `setState` (one write). New actions: `wesenSetEnabled`, `wesenPickTask`, `wesenPickCreature`, `wesenMarkBefriendSeen`, `wesenSetAlone`, `wesenMarkGrowSeen`, `wesenMoveOut`, `wesenSetMoveOutWeeks`.

**Sync merge (`src/utils/mergeState.ts`):** a rule for `wesen`: `stepDays` union and `steps = stepDays.length` capped; stage the further one of the two (shadow < friend < grown); dates the earlier set value (`befriendedAt`, `aloneSince`); seen flags only turn on; `movedOut` union by creatureId+movedOutAt; `current` null on either side after a move-out wins over a stale non-null only if its creature is in the merged `movedOut`. Tests for each case.

## Screens touched

- `RoomHub.jsx`: shadow and paw marks beside the fire (scene geometry already known), the friend sitting at the fire, overlays in the existing overlay chain (pick sheet, befriend, growth, move-out), never while the treasure reveal, growth beat or departure sheet is open. The step line joins `sayPassing` after `fire_lit_01`.
- New components in `src/components/wesen/`: `WesenPickSheet`, `WesenShadow`, `BefriendOverlay`, `WesenGrowBeat`, `WesenMoveOut`, `WesenPassportBlock`.
- `ParentalDashboard.jsx`, section "Ronkis Tag": switch, task pick, alone question, move-out weeks and date line.
- `RonkiPassport.jsx`: the Wesen block.

## Guardrails (checked in review)

- The creature never depends on anything but the linked task. It never looks sad, never leaves because of a gap, never waits "today only".
- No numbers for the child: paw marks, not "3/5". Parents see numbers.
- The hold moment has no fail state and no timer pressure (ring pauses, never resets).
- Moving out is a happy moment. Ronki's line praises the child's skill, not the app.
- The task leaving the routine is shown to the parent a week ahead and can be undone.

## Build and ship steps

1. Astra reviews this plan (rep in `docs/reviews/2026-09-26-wesen-plan/`). Round 2 only on disputed points. Open calls go to Marc.
2. Art: creature sheets, then the nine cut-outs; log; cut and export to `public/art/bilderbuch/wesen/` as WebP (existing pipeline).
3. Build in worktree `C:\Users\öööö\ronki-wesen` (branch `feat/wesen-louis-test`): rules and tests first, then TaskContext and merge rule, then screens, then voice.
4. Checks: `npm test`, `npm run check:names`, both builds, tsc unchanged at 23. Browser walk with the DEV clock (`?clock=`): switch on, pick task, pick creature, five days of ticks, befriend, parent "allein", jump 8 weeks, move out, routine without the task, passport row.
5. Astra code review on the diff, fixes, PR. **Merge only on Marc's go** (it's live for every family but invisible until a parent turns it on).
6. After merge: live bundle check, Marc turns it on for Louis's card, the two-week notes start. HANDOFF updated.

## Budget

No Claude subagents planned (Fable builds). Astra: plan review and code review, two passes on the Codex quota. Higgsfield about 33 credits. ElevenLabs about 12 short lines.
