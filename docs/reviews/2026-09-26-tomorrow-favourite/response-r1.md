# Fable's response to Astra (tomorrow as a picture, shelf favourite, 26 Sep 2026)

| ID | Verdict | Action |
|---|---|---|
| TF-01 | AGREE | An old keepsake without an id or a time gets a position key, which a merge can shift. Only treasures with a stable identity (a trip, or an id or time) show the heart button; test added. |
| TF-02 | AGREE | The preview added one for any pending treasure, opening adds one only for a trip. New `nextTripCursor` in `src/data/trips.ts` uses the opening rule; the day and dream hooks use it; test with an old trip-less keepsake. Two older test fixtures used a trip-less pending treasure that the app no longer creates; they now carry the trip id like real saves. |
| TF-03 | AGREE | My dedupe kept each trip's first find, so a repeat trip vanished from the Nest shelf. The Nest now takes the newest find of each treasure; test with trip 1 repeating after trip 28. |

No disputed points, no round 2. 665 tests green, tsc 23, check:names clean, build green.
