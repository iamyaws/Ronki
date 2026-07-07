# MeetRonki voicelines — handoff brief

**Status:** spec ready, awaiting generation + wiring (Apr 26 2026).

`MeetRonki.jsx` is the 30-second cinematic that NORTHSTAR specs as the
single most important onboarding moment ("60s Meet-Ronki"). The
component currently ships voiceless: speech bubbles + a `SPRICHT`
waveform indicator stand in for actual TTS while voice direction is
locked. This brief covers the 6 audio takes needed to flip MeetRonki
from "voiceless cinematic" to "voiced cinematic."

Voice profiles are already locked in `docs/voice/ronki-voicelines.md`:
- **Ronki** — Harry (`SOYHLrjzK2X1ezoPC6cr`)
- **Drachenmutter** — Charlotte (`XB0fDUnXU5powFXDhCwa`)

## What needs generating

6 audio files — 4 Drachenmutter, 2 Ronki.

| # | Phase | Character | File path | Text | Max length |
|---|---|---|---|---|---|
| 1 | approach | Drachenmutter | `public/audio/narrator/narrator_meet_approach.mp3` | "Schau. Da hinten. Komm näher." | ≤ 4.0s |
| 2 | shelf | Drachenmutter | `public/audio/narrator/narrator_meet_shelf.mp3` | "Welches fühlt sich richtig an?" | ≤ 3.5s |
| 3 | wobble | Drachenmutter | `public/audio/narrator/narrator_meet_wobble.mp3` | "Oh. Das hier hat dich gehört." | ≤ 1.4s ⚠ tight |
| 4 | meet | Ronki | `public/audio/ronki/de_meet_hello_01.mp3` | "Hallo. Ich hab auf dich gewartet, glaub ich." | ≤ 4.0s |
| 5 | name | Ronki | `public/audio/ronki/de_meet_namequest_01.mp3` | "Wie soll ich heißen?" | ≤ 2.5s |
| 6 | close | Drachenmutter | `public/audio/narrator/narrator_meet_close.mp3` | "Er bleibt hier. Du findest ihn morgen wieder." | ≤ 4.0s |

## DB entries to add

Paste into `docs/voice/ronki-voicelines.md` inside the `## Lines` JSON array
(after the existing `de_onboarding_kid_intro_01` block):

```json
{
  "id": "narrator_meet_approach",
  "character": "drachenmutter",
  "tier": "onboarding",
  "text": "Schau. Da hinten. Komm näher.",
  "direct_play": true,
  "notes": "MeetRonki phase 1. Plays as the camera pushes into the cave. Auto-advances at 4.4s — leave ≥400ms tail. Soft inviting whisper, not theatrical."
},
{
  "id": "narrator_meet_shelf",
  "character": "drachenmutter",
  "tier": "onboarding",
  "text": "Welches fühlt sich richtig an?",
  "direct_play": true,
  "notes": "MeetRonki phase 2. Plays once when 6 eggs appear. Kid is browsing — line is brief, no hurry. Pause naturally on the comma."
},
{
  "id": "narrator_meet_wobble",
  "character": "drachenmutter",
  "tier": "onboarding",
  "text": "Oh. Das hier hat dich gehört.",
  "direct_play": true,
  "notes": "MeetRonki phase 3. Plays when kid picks an egg. Phase is only 1.6s long — TIGHT, must finish under 1.4s. Two beats: surprise 'Oh.' (small intake), then quiet certainty 'Das hier hat dich gehört.'"
},
{
  "id": "de_meet_hello_01",
  "character": "ronki",
  "tier": "onboarding",
  "text": "Hallo. Ich hab auf dich gewartet, glaub ich.",
  "direct_play": true,
  "notes": "MeetRonki phase 5 — Ronki's FIRST EVER LINE in the product. Just hatched, eyes still adjusting. Soft, slightly stumbly, hedge on 'glaub ich' (the BeiRonkiSein voice rule — Ronki is uncertain, not confident). Auto-advances at 4.5s — leave 500ms tail."
},
{
  "id": "de_meet_namequest_01",
  "character": "ronki",
  "tier": "onboarding",
  "text": "Wie soll ich heißen?",
  "direct_play": true,
  "notes": "MeetRonki phase 6. Kid is about to type. Open, curious, not pleading. No urgency."
},
{
  "id": "narrator_meet_close",
  "character": "drachenmutter",
  "tier": "onboarding",
  "text": "Er bleibt hier. Du findest ihn morgen wieder.",
  "direct_play": true,
  "notes": "MeetRonki phase 7 — Drachenmutter pulls the camera back out of the cave. Soft sign-off, lower energy. Sets up the 'companion-that-fades' framing — Ronki stays put, kid leaves."
}
```

## Wiring patch (`src/components/drachennest/MeetRonki.jsx`)

```diff
 import React, { useEffect, useState } from 'react';
 import { useTask } from '../../context/TaskContext';
 import { track } from '../../lib/analytics';
+import VoiceAudio from '../../utils/voiceAudio';

 // ... existing code ...

   useEffect(() => {
     if (phase === 'approach') {
+      VoiceAudio.playNarrator('narrator_meet_approach', 600);
       const t = setTimeout(() => { setPhase('shelf'); setVoiceKey(v => v + 1); }, 4400);
       return () => clearTimeout(t);
     }
+    if (phase === 'shelf') {
+      VoiceAudio.playNarrator('narrator_meet_shelf', 300);
+    }
     if (phase === 'wobble') {
+      VoiceAudio.playNarrator('narrator_meet_wobble', 100);
       const t = setTimeout(() => setPhase('hatch'), 1600);
       return () => clearTimeout(t);
     }
     if (phase === 'hatch') {
       const t = setTimeout(() => { setPhase('meet'); setVoiceKey(v => v + 1); }, 1400);
       return () => clearTimeout(t);
     }
     if (phase === 'meet') {
+      VoiceAudio.playLocalized('meet_hello_01', 200);
       const t = setTimeout(() => { setPhase('name'); setVoiceKey(v => v + 1); }, 4500);
       return () => clearTimeout(t);
     }
+    if (phase === 'name') {
+      VoiceAudio.playLocalized('meet_namequest_01', 400);
+    }
+    if (phase === 'close') {
+      VoiceAudio.playNarrator('narrator_meet_close', 600);
+    }
   }, [phase]);
```

⚠ **Note on Ronki IDs**: `playLocalized('meet_hello_01')` resolves at
runtime to `${lang}_meet_hello_01.mp3`, so the file on disk MUST be
named `de_meet_hello_01.mp3` (the `de_` prefix is added by the
runtime, NOT in the call). Same for `de_meet_namequest_01`.
Drachenmutter's `playNarrator(id)` uses the id verbatim, so files
keep the `narrator_meet_*` prefix.

## Generation command

```bash
cd ronki
python scripts/gen-ronki-voicelines.py --full
# generates only missing files (skips existing); cost ≈ €0.30-0.50
```

The script reads `docs/voice/ronki-voicelines.md`, picks the 6 new IDs,
calls ElevenLabs with the voice profile from the JSON block at the
top of that doc, writes mp3s to the right `output_dir` per character.

Smoke-test before full run:

```bash
python scripts/gen-ronki-voicelines.py --smoke
# 3-line umlaut + voice check, ≈ €0.10
```

## Direction notes for the voice talent

### Drachenmutter (Charlotte) — overall

- Mature gentle narrator. Storytelling cadence, not lecturing. Small
  breath before each line — these are observations, not announcements.
- Soft consonants on `Sch-`, `D-`. German umlauts crisp but not pinched.
- Volume floor: not a whisper, but never above conversational.
- Reference for tone: the 10 BeiRonkiSein stories
  (`src/components/drachennest/BeiRonkiSein.jsx:31-42`) are the
  canonical voice bar.

### Ronki (Harry) — overall

- *Just hatched*. The first two lines (`de_meet_hello_01`,
  `de_meet_namequest_01`) are the kid's first impression of who Ronki
  is. Soft, hedge-y, occasionally forgetful. No bravado, no "I'm
  here!" energy. Slight uncertainty — eyes still adjusting to the
  cave.

### Per-line direction

1. **approach** — invitation, slightly mysterious. Pause between
   "Schau." and "Da hinten."
2. **shelf** — patient question, no quiz energy. The kid IS the one
   feeling, Drachenmutter just witnesses.
3. **wobble** — TIGHT timing. "Oh." is a small surprised intake, then
   certainty: "Das hier hat dich gehört." Two distinct beats in 1.4s.
4. **hello (Ronki)** — *first ever spoken line*. Don't oversell. The
   hedge "glaub ich" is the entire personality reveal.
5. **namequest (Ronki)** — open curiosity. Not "what's MY name", more
   "what should I be called". Slight rise on "heißen?"
6. **close** — soft sign-off. Lower energy than approach. Reassuring
   without being saccharine.

## After generation

1. Drop the 6 mp3s into `public/audio/{narrator,ronki}/` (script does
   this automatically).
2. Apply the wiring patch above to `MeetRonki.jsx`.
3. Reload `?meet=1` or `?onboardingPreview=1` — audio fires per phase.
4. Update the comment in `MeetRonki.jsx:25-27` to remove the "stand
   in for actual TTS" note.
5. Smoke-test on a real phone — Charlotte's voice timbre on phone
   speakers vs laptop sounds different; the wobble line in particular
   may need a re-take if it muddies on small drivers.

## Cost summary

- 6 lines × ≈ €0.05 each = **≈ €0.30** ElevenLabs credit
- 0 design hours (text + direction in this doc)
- ≈ 10 minutes of dev work to apply the patch + commit

---

_Last revised: 26 April 2026 (initial spec)._
