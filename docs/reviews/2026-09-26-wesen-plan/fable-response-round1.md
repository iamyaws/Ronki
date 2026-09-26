# Fable's response to Astra round 1 (verdict NOT YET)

Independent agreement with my own read (written before opening Astra's): the three-shadow collection pull (own read 2, Astra Q1/Q4), the step line praising attendance (own read 1, W-01), no mid-day routine rewrite (own read 4, Q3), the merge of `current` (own read 5, W-05/W-06), Ronki stays central (own read 6, A6), and the art: I had already dropped the fire fox and the tree-on-back before the round came in (Astra Q6). Astra found what I missed: "allein" is not defined per task, the parent becomes a gatekeeper, the off switch was undefined, instance ids, and `questsRule` re-adding a removed task.

| ID | Answer | What changes |
|---|---|---|
| W-01 | AGREE | The creature is visible and friendly from day one (shy, at the edge, waves). Completion days are shared moments ("Es hat dir zugeguckt"), not a price. Step 5 = it moves over to sit beside Ronki. No line ties affection to attendance; the concept line "Es mag dich. Weil du jeden Abend da warst" is cut. |
| W-02 | AGREE | Go rule rewritten: baseline notes before day 1 (how much prompting and help the task needs), the same notes daily, spontaneous mentions separate from answers, bargaining words verbatim. A good result earns a longer one-creature test through departure, not the full book. |
| W-03 | AGREE | Parent picks from a short list of daily, self-care tasks with one written observable step each (teeth: "putzt ohne Erinnerung und ohne Hilfe, zwei Minuten"). Vorlesen, Aufstehen, Abendbrot and Schultasche are not offered. The child never sees that growth waits for a parent; the dashboard shows no unlock date. The question appears on its own once 7 days have passed since the creature moved beside Ronki. |
| W-04 | AGREE | The weeks after "allein" set a parent review point, not an automatic removal. The parent confirms; removal happens at the next day's build; the goodbye shows the task picture moving into the passport with the creature; "Wieder zurückholen" restores the task in its old block and position without shrinking the creature. |
| W-05 | AGREE | Each friendship gets a stable instance id. Merge only within an instance; departures keyed by instance. |
| W-06 | AGREE | A post-merge reconcile step: departures with confirmed removal and no later restore take the kind out of the routine and today's not-done quests; a restore with a later timestamp wins. Tests with two-tab races on real-shaped saves. |
| W-07 | AGREE | One overlay selector for every Nest overlay (treasure, growth, departure sheet, feelings, sit, and the four Wesen moments), one at a time. Pending Wesen moments are stored and only marked seen when finished. Wesen lines wait for the passing line to end instead of replacing it. |
| W-08 | PARTLY | Agree: the switch gates mutations too; off keeps progress frozen, nothing steps and nothing departs; turning it back on with an overdue review asks the parent first. Different method for "only Louis's card": the switch appears only after the parent area was opened once with `?wesen=1` on that card (stored as `wesen.offered`). No card identifier in the bundle, and other families never see it. |
| Q2 | AGREE | Daily task only; DEV clock only on a throwaway test save. |
| Q4 | AGREE | Three real small creatures, faces visible, one spoken invitation, one tap. The other two go back into the forest and are not shown again in this test. |
| Q5 | AGREE | Step only when the matching quest becomes done (`!q.done` before, `done` after); readiness derived from merged days; `questsForRoutine` reused; DST and rollover tests; lost-response, offline, disable-vs-complete, departure-vs-routine-edit, restore-vs-stale cases. |
| Q6 | AGREE | Rounded identity kept through all three looks; judged at Nest size beside Ronki before the nine cut-outs. |
| Q7 | AGREE | No progress ring. Louis rests a finger; the creature walks over and touches it; Ronki shifts over to make room. Lifting the finger just makes it wait. |

Assumption table accepted as written; A2, A4, A5 are the ones the notes sheet watches.

Round 2: not requested. The only PARTLY (W-08) is a method choice with the same outcome; it goes to Marc as a note, and Astra reviews the built code before merge.
