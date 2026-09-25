# Orchestrator's own read before Astra's code review, round 1 (25 Sep 2026)

Scope: the foundation commits (`fe9efd7..1c3d8d9`), from agent A's report, its screenshots and a skim of the diff. Written after a glimpse of the last lines of Astra's output (the variant finding), so that one point is not independent.

1. **Variant (not independent).** `MoodChibi` ignores `variant` on purpose (Ronki is always red-orange, plan section 5). Anything that still promises six colours to the kid now lies: `RonkiCompendium` (public `?compendium=1`) and the egg choice in `MeetRonki` until lane B lands. The saved `companionVariant` must stay readable, not migrated. SHOULD: fix the copy, keep the field.
2. **Missing-image memory.** The fallback chain records failed URLs in a session-level set. A single flaky load on a tablet (offline start, service worker miss) would pin the fallback for the whole session. SHOULD: remember failures per element, or retry on the next mount.
3. **Celebration rewrite.** Agent A says "full rewrite on the same logic". A rewrite of a queue-driven component is where timers and `onDone` callbacks drift. Needs a diff read of the effects and the queue calls.
4. **Animated WebP weight.** `MoodChibi animated` decodes a 1.2 MB animated WebP per instance. If the room, the pinned Ronki and a card all animate at once, a Fire tablet decodes three copies. COULD: only one animated instance per screen, the rest stills.
5. **Fonts.** Be Vietnam Pro 700 now falls back to 600 (website has no 700). Headlines are Fredoka, so this only touches bold body text. COULD.
6. **Material Symbols** stays loaded from Google until the last kid screen drops it; it is also a privacy leak to Google on every start (the app's own Datenschutz page talks about self-hosting). SHOULD after the lanes: drop the link once no glyph is left, or self-host the subset.
7. Tokens look right in agent A's hub screenshot; the remaining teal and cream are hard-coded values inside screens, which the lanes own.

Rating of the assumptions in the brief: A1 (animated WebP smooth on old iPad and Fire) medium risk, untested; A3 (variant collapse safe for existing saves) low risk if the field stays; A5 (Fredoka readable) low risk, the website already ships it.
