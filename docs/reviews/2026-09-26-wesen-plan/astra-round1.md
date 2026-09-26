Read-only review of the plan and named sources. No files changed. Code inspected; browser, audio and sync tests not run. New creature art is not supplied, so art judgments concern the proposed designs.

| ID | Severity | Where | Claim | Why it matters | Fix |
|---|---|---|---|---|---|
| W-01 | high | Steps; concept’s Nest and meeting copy | Friendship is earned through compliance. | Five completions buy access to a friend; removing currency does not remove that bargain. The concept explicitly makes affection depend on attendance. | Let the creature greet Louis from day one. Completions record shared experiences; step five marks moving beside Ronki, not earning affection. Remove attendance-based affection. |
| W-02 | high | Two-week go rule | Enthusiasm without bargaining does not justify the full book. | Novelty can produce conversation while the task remains equally difficult. | Record prompting, help and resistance alongside spontaneous mentions. A positive result earns a longer one-creature test, including departure. |
| W-03 | high | Growth; task picker | “Alone” has no task-specific meaning. | The routine includes shared reading. Doing that alone changes the activity. Parents also become gatekeepers of a desirable transformation. | Choose one suitable task and define the observable step Louis is learning before starting. Keep parent assessment private and remove the unlock-date display. |
| W-04 | high | Move-out | Elapsed weeks trigger removal without renewed readiness. | A previously independent task may need support again; a dashboard notice can go unread. | Make the date a parent review point. Confirm removal, show Louis the task picture during goodbye, and provide direct restoration without reversing creature growth. |
| W-05 | high | `wesen` merge | Species identity cannot identify a particular friendship. | Different task selections can combine progress; an old departure can erase a later creature of the same species. Concurrent departures can create duplicate records. | Add a stable instance ID. Merge progress only within that instance; identify departure by instance. Specify conflicts for task choice, enabled state and schedule separately. |
| W-06 | high | `applyMoveOut`; `mergeState.ts` | Atomic local removal does not survive independent field merging reliably. | `questsRule` unions same-day quests, including removed tasks. `familyConfig.routine` resolves separately from `wesen`. | Reconcile departure, routine and quests together after merging. Preserve deliberate later restoration and unrelated edits. Verify with real-save, two-tab races. |
| W-07 | medium | `RoomHub.jsx` | The proposed overlay exclusions are incomplete. | Feelings, sitting, departure timers and voice can collide with creature scenes. `sayPassing` replaces speech; it is not a queue. | Use one overlay selector and speech sequence covering all surfaces. Persist pending moments; acknowledge after completion. |
| W-08 | high | Parent switch; shutdown | “Off” behavior is unspecified. | Hiding the creature could leave steps or automatic routine removal running. The switch would not reliably stop the experiment. | Gate mutations as well as UI. Preserve progress while off; require parent review before overdue departure on resumption. Restrict switch availability to Louis’s test card. |

**1. Does the loop pass the positioning test?**

Not yet. The strongest idea is a visible record of growing capability that eventually leaves the routine. The weakest is withholding friendship until five completions.

W-01 changes that relationship mechanically. Keep five real completion days, but allow a friendly response immediately. Remove the two unchosen silhouettes after selection, so they do not advertise the next acquisition.

Growth carries a second bargain: “Tell the app I can do it alone.” Remove the scheduled unlock and assess a concrete skill privately. These changes reduce pressure; Louis’s response still needs observation.

**2. Can two weeks answer Marc’s question?**

They can test attraction, comprehension and early bargaining, not independence or departure.

Keep five actual completion days. Do not compress them. Growth around day 12 is acceptable if the observed skill warrants it; no growth is also a valid result. Choose a daily task because school-bag tasks do not appear every day.

Before starting, note how much prompting and help the task currently needs. During the test, record those same observations, spontaneous creature mentions and Louis’s exact bargaining words. Distinguish unprompted comments from answers to Marc’s questions.

Use the developer clock only on a separate test save for departure checks. Do not accelerate Louis’s history. Extend the trial before approving the full book.

**3. How should the task leave?**

Keep Marc’s decision. Change the execution.

At the review date, the parent confirms that the app reminder can go. The child then sees the familiar task picture move into the passport with the creature. Explain that the real activity continues.

Remove it at the next routine boundary, avoiding a mid-routine change to the fire. Save its former block and position for a direct restore action. Restoration brings back support, without shrinking the creature or presenting failure. Re-adding a checkbox manually is weaker than the promised undo.

**4. Three shadows or a fixed creature?**

Keep a brief choice, but show three actual small creatures. Shadows hide the faces Louis needs to choose between and create an unnecessary reveal gamble.

One spoken invitation, one tap, no second confirmation. Remove the unchosen options afterward. If that choice confuses him, use a fixed creature for this trial.

**5. Engineering risks**

Alongside W-05 to W-08:

- **Completion:** `complete()` rejects already-done quests but also supports partial completions. Award a step only when the matching quest becomes done. Use `taskKind(id)`, deduplicate the day, and keep the update pure.
- **Merged threshold:** two devices can each remain below five while their combined days reach five. Derive readiness from merged days, not only the maximum stored stage.
- **Routine rebuilding:** reuse `questsForRoutine`, preserving completed work and side quests. Check removal of the final task and unintended departure triggers.
- **Time:** use the shared clock and UTC day key consistently. Test rollover, sleep/wake and DST. The documented local-midnight mismatch is acceptable for this bounded trial.
- **Verification:** add lost-response, offline, disable-versus-complete, departure-versus-routine-edit and restore-versus-stale-save cases. The happy-path clock walk is insufficient.

**6. Art cast**

These are hypotheses, not verified child appeal or visual clearance.

- **Glutfunke:** the ember sprite has charm. Becoming a fire fox loses continuity and invites comparison with the existing Fire-type fox [Fennekin](https://www.pokemon.com/uk/pokedex/fennekin). Keep the rounded ember identity throughout.
- **Moosmops:** strongest companion premise. Keep the puppy’s face, feet and posture as moss grows; becoming a tree risks replacing the friend.
- **Tropfi:** promising tactile character. Keep the cloud small and playful, so it does not read as sadness.

Judge all three beside Ronki at actual Nest size before producing nine finished cut-outs. Consistent outlines alone will not establish character continuity.

**7. What would make the meeting land?**

Let the creature approach Louis’s resting finger and gently touch it. Replace the progress ring with the creature’s movement, so the moment feels reciprocal rather than like completing a control.

Then Ronki quietly shifts over to make room. That makes him the welcoming host and preserves his place in the bond.

| Assumption | Likelihood wrong | At home if wrong | Cheapest test | Fallback |
|---|---|---|---|---|
| A1: Paws communicate progress | medium | Louis misses change or sees decoration. | Ask what changed after completion two. | Move the creature visibly along the path. |
| A2: Parent answers honestly and promptly | high | Pressure or missed growth. | Record observed help before opening the dashboard. | Private, task-specific assessment without deadline. |
| A3: Hold feels special | medium | Repeated tapping or frustration. | Observe first attempt without coaching. | One touch, then automatic approach. |
| A4: One creature reveals bargaining | high | A quiet fortnight is mistaken for safety. | Observe through growth and later departure. | Continue one creature; defer collection. |
| A5: Removal is understood | high | Louis thinks the real task ended. | Show a separate goodbye storyboard; ask what happens tomorrow. | Task-picture explanation and direct restore. |
| A6: Ronki remains central | medium | Louis opens mainly for the newcomer. | Note whom he addresses and mentions spontaneously. | Ronki hosts; newcomer stays visually secondary. |

**NOT YET.** The biggest reason is that the plan still makes friendship something Louis earns, while its success rule could approve expansion without showing that the real task became easier.

