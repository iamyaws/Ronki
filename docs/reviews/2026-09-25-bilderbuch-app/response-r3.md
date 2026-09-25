# Response to the reviews of Marc's two calls (25 Sep 2026, late)

Marc's go: "go with your recommendations on home order and countdown". Built in `978fc52`, reviewed twice in parallel, fixed in the commit after this file.

- Own read first: `own-read-r3.md`.
- Astra adversarial review of `40dfa34..978fc52`: `astra-code-r3.txt`, NOT YET, 1 finding.
- Claude review workflow `wf_3d8afdcb-a61`: 3 lenses (call sites, kid UX and a11y, edge cases and tests), 15 raw findings, the top 6 each checked by one skeptic told to refute. 9 agents, about 1.2M tokens.

## Confirmed and fixed

| Source | Finding | Fix |
|---|---|---|
| Astra R1 (SHOULD) | Focus moved to "Gut" 450 ms after the tap, pulling a keyboard user back from the tile they had already reached | Focus moves at once (`preventScroll`), then the section scrolls; no delayed focus. Regression test: focus a second tile, advance 2 s, focus stays. |
| Workflow, kid UX (verified SHOULD) | Inside the frame, the pill covered Ronki's belly on short phones (375 x 548, 360 x 560, 320 x 548), taking the petting tap | First tried hanging it on the frame's bottom edge; the browser showed Ronki still reaches that edge on short screens. Final: the pill sits in the header row beside "Hallo {Name}!", outside the picture. Checked at 320 x 548, 375 x 548 (with "Maximilian"), 390 x 844 and 768 x 1024: no overlap with the greeting or the frame, no sideways scroll. |
| Workflow, kid UX (verified SHOULD) | The pill used the "Gut" sun, so a pre-reader sees an answer, not a question | A heart doodle, which is not one of the six answers. |
| Workflow, call sites (verified COULD, two lenses) | Under reduced motion the guard button looked ready one frame after mount but ignored taps for a second | Stays dim until the tap counts, then a plain switch. Test with `matchMedia` mocked. |
| Workflow, unverified COULD (two lenses) | The inline `transition: none` after ready killed the `.bb-press` sink on the celebration pill | No inline transition once ready. Test. |
| Workflow, unverified COULD | Grid tiles overflowed at 320 px (minimum width 104) | `minWidth: 0` on the feeling tiles; narrowest tile 88 px at 320. |
| Workflow, unverified | Tests passed for the wrong reasons (any `svg`, any scrolled element, no focus or reduced-motion case) | Tests pin the scrolled element, focus at once, the icon hidden while guarding, the pill outside the frame and in the header, a second tap restarting the ring, unmount during the ring. The new regression tests were run against `978fc52` first: four of them fail there and pass on the fix. |
| Workflow, unverified COULD | Stale comment in `Celebration.jsx` still promised the ring and delay | Rewritten. |

## Refuted

- **"Nochmal" now wakes together with "Einsammeln" at 1 s, so a tap burst could restart a mini-game before the reward is collected.** Raised by two lenses and by my own read. Both skeptics refuted it with code evidence. The mechanics are right: both buttons now wake together. But in CloudJump and StarCatcher the collect path only marks the game as played (`claimGameReward`, TaskContext), so an early "Nochmal" loses nothing. Starfighter pays a few HP but is steered by dragging, and a touch that began on the canvas cannot click a button that did not exist yet. No second guard length; watch for it in Louis's test.

Checks after the fixes: 234 tests green, `check:names` clean, 23 pre-existing tsc errors unchanged, build green.
