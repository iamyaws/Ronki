# Own read before the reviews of Marc's two calls (25 Sep 2026, late)

Diff `40dfa34..978fc52`: CooldownButton becomes a 1 s guard without numbers; RoomHub gains the "Wie geht's dir?" entry. Written before opening Astra (`astra-code-r3.txt`) or the Claude review workflow.

1. **Game end screens are not celebrations.** StarCatcher and CloudJump show two guarded buttons at the end: "Nochmal" (restart, was 5 s) and "Einsammeln" (collect, was 3 s). A kid mid tap-burst can now hit "Nochmal" after 1 s and restart before collecting. If a restart drops the unclaimed reward, that is a real loss. SHOULD: check whether the reward survives a restart; if not, keep a longer guard on restart only, still without numbers.
2. **Opacity fade as a cue.** The button fades from 55 percent to full over the guard. That reads as "waking up", not as a timer. Fine.
3. **Entry placement.** Checked in the browser at 390 px: bottom-right of the room, clear of the speech bubble and of Ronki. Not checked at 320 px, where the pill (about 175 px wide) could reach the cushion. COULD.
4. **Focus.** Focus lands on the first tile ("Gut") after the scroll; the ChoiceTile focus style was not checked for visibility. COULD.
5. **Old saves.** The entry follows the picker's own condition (`moodAM === null`), so it can never point at a picker that is not there. No new edge.
