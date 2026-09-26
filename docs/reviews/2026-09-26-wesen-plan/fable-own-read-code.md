# Fable's own read of the code (before opening Astra's code round 1)

Things I would look at first, ranked:

1. **Telemetry name.** `wesen.moveout` fires when the goodbye is finished (goodbyeSeen), not when the task actually leaves at the day start. Harmless for the test, but the event means "goodbye seen". Low.
2. **Pick on a stale card.** `WesenPick` shows the chosen creature even if `wesenPickCreature` was refused (another device picked first); after "Weiter" the Nest shows the other device's creature. Rare, low.
3. **Opening timer reads state from the effect's closure** (up to 2.6 s old). A friend that changed in between (e.g. merged from the other device) opens with the older object; `markSeen` works by id, so no harm. Low.
4. **`reconcileAfterMerge` runs after every merge** and always returns a new object when `wesen` exists. Equal content, so it should not cause extra writes, but worth confirming the sync layer does not compare by reference. Medium until checked.
5. **Moved-out kind vs. a later new friend on the same task.** If a parent later links the same task to a new creature after a restore, the old friend's restore keeps it in. Without a restore the parent cannot pick that task (it is not in the routine). Fine.
6. **Beside moment while the fire fills to departure.** On the 5th morning the fire may fill and Ronki leaves; the meeting waits until he is home in the evening. Intended (no moment without Ronki), but Louis may not see the meeting until evening. Worth telling Marc.
7. **Day rollover at 01:00 or 02:00 local** (UTC day keys, known limit): a brush after midnight UTC counts for the next day. Acceptable for the test.
