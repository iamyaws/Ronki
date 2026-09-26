# Own read before Astra: tomorrow as a picture, shelf favourite (26 Sep 2026)

What: (1) the good-night hook shows a small drawing of the next trip's place (`tonightHook` returns `picture` and `place`; `StoryLine` draws it, hides it on a load error); a dream-trip hook shows the place Ronki dreams of. 28 place pictures from Higgsfield pass 6. (2) The child picks Ronki's favourite treasure from its story card in the passport (heart button); it stands first on the passport shelf and on the Nest shelf with a heart; the same heart again clears it; when Ronki shelves a new treasure and a favourite exists, he says "Den stell ich neben meinen Lieblingsschatz." New state field `favoriteTreasure` (a shelf key), action `setFavoriteTreasure`, carried through load (the browser check found it was dropped at first).

Weak spots I see:
1. The dream hook picks `tripAt(tripCursor + pendingMemento ? 1 : 0)`, the same rule as the day hook; if `departTrip('night')` ever picked a different trip, the picture would promise the wrong place. Worth a check against `departTrip`.
2. The favourite key is a shelf key (`trip-tNN` or `m-<id>`); an old random memento without id/ts gets an index key in `shelfItems`, which shifts if the log changes. Rare, old saves only.
3. The Nest shelf now dedupes by trip (via `shelfItems`), where it used to show the last three log entries including repeats. Intended, but a behaviour change.
4. Two-device sync: `favoriteTreasure` has no merge rule, so a race takes this device's value when both changed; acceptable for a pick.
5. Guardrails: a favourite is a choice, not a score; no pressure, nothing to lose. The heart could read as "likes"; it is only Ronki's own shelf.
