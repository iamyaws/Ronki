# Friends + Sign-up Unique Code — Planning

Marc 25 Apr 2026: "we still have to address the sign-up/unique code
and friends invite each other or at least at each other in game too
see their friends ronki and nest."

This is a meaty multi-day feature. Capturing the design space + open
decisions here so we can pick a slice rather than scope-creeping into
a multi-week build.

---

## What the kid does, end to end

The five user stories the feature has to support:

1. **Parent sets up** — at first launch (or via Eltern-Bereich after
   onboarding), the parent enables the social layer for their kid +
   sees the kid's unique code.
2. **Parent shares the code** — by text / WhatsApp / written on a
   piece of paper at school. Other parents type it into THEIR kid's
   app to add a friend.
3. **Kid sees friend list** — small grid in the Drachennest with
   each friend's chibi Ronki + their first name.
4. **Kid taps a friend** — sees that friend's nest + Ronki + the
   trait they rolled at their last evolution. Read-only view.
5. **Kid waves at friend** — small interaction (tap a "Wink" button)
   that pings the other kid's app with a notification "Lina hat
   dir gewunken." No chat, no text, just a visit.

That's the v1 vision — visit, not interact.

---

## Open decisions (need Marc to react)

### 1. Code generation

**A. Server-issued (Supabase).** At sign-up, Supabase function
   generates a 6-character code (`AMBER-7K2X` or similar) tied to
   the user account. Server-authoritative.

**B. Client-derived.** Code is deterministic from `state.heroName +
   companionVariant + onboardingDate` hashed. Looks unique, costs
   nothing in backend, but two kids with the same name + variant on
   the same day collide.

**C. Hybrid.** Code is a 6-char string the kid PICKS during
   onboarding from a 4-letter dictionary (`MOND`, `STERN`, `BAUM`,
   etc.) + 2 random digits. Memorable + unlikely to collide.

  My read: **A** for production (need server uniqueness anyway),
  **C** for prototype (no backend needed, cute UX). Ship C now,
  migrate to A when accounts are real.

### 2. Friend visit fidelity

**A. Live snapshot.** When a friend visits, they see the host
   Ronki's CURRENT state — vitals, mood, expedition status. Pulled
   from a small JSON document on the server.

**B. Yesterday's snapshot.** When the host's kid closed the app
   yesterday, a snapshot was written. Friends visit that snapshot
   so the host's privacy / parental control isn't violated mid-day.

**C. Cached avatar only.** Friend sees just the chibi + variant +
   stage + 1 trait (latest evolution roll). No vitals, no mood, no
   expedition state. Smallest privacy surface.

  My read: **C** for v1 (lowest privacy + storage cost), evolves
  to **B** when we have a "wave" mechanic that ages well, **A**
  only if we add real-time co-play (which we shouldn't for years).

### 3. The wave/ping interaction

**A. Asynchronous wave.** Kid taps Wink. Host kid sees a small
   notification next time they open the app: "Lina hat dir
   gewunken." Wink count limited to 3/day per friend so it doesn't
   become spam.

**B. Reaction picker.** Kid taps a friend's chibi → small set of 3-4
   reactions appear (heart / smile / sparkle / hi). Picking one
   sends that emoji to the host. More expressive than a single
   "wave" but more cognitive load on a 6-year-old.

**C. No interaction yet.** v1 is read-only — kid sees friend's
   nest, can't ping. Save the social layer for v2.

  My read: **A** for v1. The single-button "Wink" matches the kid's
  cognitive level + the implementation is one Supabase realtime
  channel. No chat, no text, no read-receipts.

### 4. Privacy + parental controls

Hard requirements, regardless of which path above:
- Parent must enable the social layer per-kid (default: off)
- Parent can revoke a friend connection from the dashboard
- No DM, no free-text — only the structured wave action
- No stranger discovery — only invite-by-code, not "browse public Ronkis"
- Wink notifications obey quiet hours (9pm-7am no push)

### 5. Where it lives in the UI

**A. New "Freunde" tab in the bottom nav.** Replaces or sits
   alongside the existing tabs.

**B. New section inside the Ronki profile.** Below the existing
   segments (Freunde-creature gallery already exists; this would
   be a separate "Echte Freunde" block above it).

**C. New tile in the Drachennest object row.** Currently we have
   Spielzeug + Karte; add a third tile for friends.

  My read: **B** keeps the bottom nav uncluttered + groups social
  with the friend-creature gallery the kid already knows.

---

## Recommended v1 cut

If you want a small scope-able first slice that doesn't commit us
to a full social product, here's the recommendation:

- Code generation: **C** (kid picks 4-letter word + 2 digits during
  parent onboarding). 8000 possible codes (44 word stems × 100
  digit pairs is plenty for a beta).
- Friend visit fidelity: **C** (chibi + variant + stage + 1 trait).
- Wave: **A** (single-button Wink, 3/day cap).
- Privacy: parental opt-in default-off; kid never sees a
  free-text input.
- UI placement: **B** (new "Echte Freunde" section in the Ronki
  profile, sits above the existing creature gallery).

Estimated build: ~6-8 hours backend (Supabase auth/profile/wink
table) + ~6-8 hours frontend (code-pick onboarding, friend grid,
visit modal, wink CTA) = ~2 dev days end to end.

For tomorrow's Louis test the FRIENDS feature is not ready, but
we can ship a placeholder card "Bald hier — du wirst Freunde
einladen können" inside the Ronki profile so the kid knows it's
coming.

---

## Decision queue

I need your react on:

- [ ] Code generation — A / B / C ?
- [ ] Friend visit fidelity — A / B / C ?
- [ ] Wave interaction — A / B / C ?
- [ ] UI placement — A / B / C ?
- [ ] Build now (post-Louis-test) or defer to next sprint?

Once I have those five answers, I scope a real branch + start
shipping. The placeholder card for tomorrow's test is a 15-minute
ship I can do in the next session.
