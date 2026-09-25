# Response to Astra's code review, round 2 (26 Sep 2026, night)

Round 2 is the last Astra round (PROTOCOL: no round 3). Everything still open after this goes to Marc.

| ID | Astra | Answer | What changed |
|---|---|---|---|
| FC-01-R2 | BLOCKER: a successful probe marks the read as done without loading the row, so a later save can overwrite it | **AGREE, fixed** | Every cloud write goes through `storage.cloudSaveChecked`: it reads the row first and writes only while the row still carries the stamp this session last saw (`_cloudStamp`, written on every save). A row this session never reconciled, or one another device wrote to since, is a conflict: nothing is written, writes freeze, the page reloads so the normal sync merges the newer row (loop guard: no second reload within a minute). A failed read writes nothing. |
| SAVES-1-R2 | BLOCKER: a phone hidden under 5 minutes wakes, runs arriveTrip on old state and saves; a pending save after sleep can run before the clock freezes writes | **AGREE, fixed at the write boundary** | The same stamp check: a stale device's save is refused because the tablet's write moved the stamp. The leave flush only writes within 20 s of a verified save. Verified in two real browser tabs against the local Supabase mock: the second device completed a task, the first device's save saw the newer row, wrote nothing, reloaded and showed the second device's progress; the cloud row kept it. Not done (needs a server change, goes to Marc): a server-side revision check in `profile_upsert`, which would also close the few milliseconds between the check-read and the write. |
| FC-05-R2 | SHOULD: happy and tired art lose the stage | **AGREE, fixed** | `MoodChibi keepStage` draws the stage's own calm portrait when a mood has no art for that stage (the shelled hatchling, the grown and the legendary Ronki). Used on the return, the send-off and the sleeping Ronki; a test asserts the resolved image paths. Checked in the browser: the return shows `baby-ember.webp` for a hatchling from the red egg. |
| FC-08-R2 | CHALLENGE: counting a dream trip from its evening start lets a 03:59 departure be followed by a 05:01 day trip | **AGREE** | The gap is measured between real departures again, and set to 6 hours: a 23:30 dream trip still lets the 07:10 morning trip go; a 03:59 departure blocks a day trip until 09:59. The UTC day key stays app-wide (a local-key migration of every saved day is a separate, riskier change; goes to Marc as a known limit: the day rolls over at 01:00 or 02:00 local time, not at midnight). |
| LOOP-3-R2 | SHOULD: queued speech can start in a hidden tab | **AGREE, fixed** | `VoiceAudio.stop()` also drops a queued line; a hidden tab stops speech (one module listener); a line never starts while the tab is hidden. |
| FC-02-R2 | SHOULD: a cap of 500 still drops the oldest keepsake | **AGREE, fixed** | No cap: every keepsake stays. |

Also fixed in this round from the verifier of fix round 1: every write freezes before a stale reload (the greeting, a timer or the leave flush can no longer save old state while the page reloads); a visible tab whose timers slept reloads instead of ticking; the Nest and the ritual ask the engine's own `tripAllowed` (moved to `src/loop/tripRules.ts`), so a send-off is never shown that the engine would refuse.

## After round 2: an independent verifier on the fix (26 Sep, about 01:30)

A Claude verifier ran ten real-storage experiments against the stamp design above and found it NOT SAFE in the common case: every app open wrote a new stamp, so a parent phone that only opened the app turned the child's next tap into a conflict; the conflict reload dropped that tap (the load picks a winner by date, it does not merge); and a second conflict within a minute left a session frozen with nothing saved, local included. So the stamp check was backed out. What ships instead is strictly no worse than main's last-writer-wins and fixes the failure modes both reviews found:

- No write to a card before a cloud read reached it (FC-01); a card this session never loaded writes nothing and reloads, with a scheduled retry instead of a frozen session (FC-01-R2, verifier B); local saving never stops.
- A stale tab, a sleep, or a save timer that fired more than 5 minutes late freezes and reloads before writing (SAVES-1, SAVES-1-R2).
- An unfinished local hatch never beats a card that has a dragon, and the hatch stash only applies after a successful read (verifier C); a failed read never clears another card's cache (verifier H).
- Checked in two real browser tabs against the Supabase mock: the passive second device no longer disturbs the active one; the active device's saves land.

Open for Marc (needs a backend change): true concurrent edits by two devices within seconds stay last-writer-wins, as before this pass. The fix is a compare-and-swap RPC in Supabase.
