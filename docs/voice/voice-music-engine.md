# Background music + voice ducking — engine sketch

**Status:** spec, not built. Marc 27 Apr 2026: "soft and low volume but
we need something that also goes on low/mute when voicelines play."

This doc covers the engine architecture, the ducking behavior, and a
short list of sources Marc can pick a track from. Once a track lands
in `public/audio/music/` the wiring is ~120 LOC, ~1 hr.

---

## What we're building

A single very-soft ambient loop that plays under the whole app
whenever the kid is in the experience. When ANY voice fires
(Drachenmutter narrator, Ronki, mood-line, BeiRonkiSein story), the
music ducks to a near-silent level so the voice carries. After the
voice ends, music ramps back up over ~800ms.

Off by default. Parental toggle in dashboard turns it on. Companion
to the existing voice-mute toggles (Stimmen card).

## Why a singleton, not a React component

Music must outlive route changes. If it lives inside RoomHub, it
restarts every time the kid taps a tab. A page-level `<audio>`
element controlled by a singleton avoids that.

The singleton also owns the ducking lock — anyone (VoiceAudio,
TonightRitual's lullaby, MeetRonki) can call `BackgroundMusic.duck()`
and the music respects it. Multiple overlapping ducks (e.g.
Drachenmutter line during Ronki line) just keep the volume low until
the last one ends.

## Files this touches

```
src/utils/backgroundMusic.ts   ← new singleton, ~140 LOC
src/utils/voiceAudio.ts        ← 6 lines: duck/unduck around play calls
src/components/ParentalDashboard.jsx ← +1 toggle in the Stimmen card
public/audio/music/            ← new folder, holds the loop file(s)
```

No new context provider, no new hooks. The singleton mounts itself
once via a `<BackgroundMusicProvider />` in App.jsx that just calls
`BackgroundMusic.init()` on mount.

## API sketch

```ts
// src/utils/backgroundMusic.ts
const VOLUME_KEY = 'ronki_music_volume'; // 0..1, default 0
const ENABLED_KEY = 'ronki_music_enabled';

interface BackgroundMusicAPI {
  init(): void;                   // creates the audio element,
                                  // attaches user-gesture listener
                                  // for autoplay authorization
  start(): Promise<void>;         // begins loop playback
  stop(): void;                   // pauses + rewinds
  duck(reason?: string): void;    // ramp volume → DUCK_LEVEL over 200ms
  unduck(reason?: string): void;  // ramp back to base volume over 800ms
  setBaseVolume(v: number): void; // 0..1, persists to localStorage
  setEnabled(on: boolean): void;  // toggle on/off, persists
  isEnabled(): boolean;
  getBaseVolume(): number;
}

const BASE_VOLUME = 0.12;   // very soft default
const DUCK_LEVEL = 0.025;   // ~20% of base, audible but yields to voice
const DUCK_RAMP_MS = 200;
const UNDUCK_RAMP_MS = 800;
```

### Duck reference-counting

```ts
let activeDucks = new Set<string>();

duck(reason = 'default') {
  activeDucks.add(reason);
  rampTo(DUCK_LEVEL, DUCK_RAMP_MS);
}

unduck(reason = 'default') {
  activeDucks.delete(reason);
  if (activeDucks.size === 0) {
    rampTo(currentBase, UNDUCK_RAMP_MS);
  }
}
```

Each call site uses a unique reason string (`'narrator'`, `'ronki'`,
`'lullaby'`) so concurrent voicelines don't unduck prematurely.

### Wiring into VoiceAudio

In `src/utils/voiceAudio.ts`, the existing `playNarrator(lineId)` etc.
gain a thin wrapper:

```ts
import BackgroundMusic from './backgroundMusic';

playNarrator(lineId, delayMs = 600) {
  // ... existing mute checks ...
  BackgroundMusic.duck('narrator');
  const audio = new Audio(src);
  audio.addEventListener('ended', () => BackgroundMusic.unduck('narrator'));
  audio.addEventListener('error', () => BackgroundMusic.unduck('narrator'));
  audio.play().catch(() => BackgroundMusic.unduck('narrator'));
}
```

Same pattern for `play()` (Ronki) and `playLocalized()`. The `.catch`
ensures autoplay-block doesn't leave music ducked forever.

### Autoplay authorization

Browsers block `audio.play()` until the user has interacted with the
page. The init effect attaches a one-shot `pointerdown` listener
that calls `start()` on first tap. After that, the audio context is
authorized for the rest of the session.

```ts
init() {
  // ... build <audio> element, set src, loop=true ...
  const onFirstGesture = () => {
    if (this.isEnabled()) this.start();
    document.removeEventListener('pointerdown', onFirstGesture);
  };
  document.addEventListener('pointerdown', onFirstGesture, { once: true });
}
```

### Visibility pause

When the page goes hidden (kid switches apps), pause the loop to save
battery + so the music isn't playing into nothing. Resume on
visibility return.

```ts
document.addEventListener('visibilitychange', () => {
  if (document.hidden) audio.pause();
  else if (this.isEnabled()) audio.play();
});
```

## Parental dashboard toggle

Adds one row to the existing `Stimmen` card — same visual shape as
the Ronki + Drachenmutter toggles:

```
🎵 Hintergrundmusik
   An — Sanftes Plätschern unter der App.
[switch]
```

Default OFF. When the parent flips it on, the loop starts on next
user gesture.

Volume slider deferred to v1.5 — base volume of 0.12 should land in
the right zone for almost all phones; if a parent says "too loud" or
"can't hear it" we add a slider then.

## Ducking timing tuning

Marc may want different ramps for different voices. The current
defaults (200ms duck-down, 800ms duck-up) feel right for short
narrator beats but might be sluggish for back-to-back voicelines in
MeetRonki. If duck-up feels late, drop to 400ms. If duck-up creates
audible "swell" that distracts from the voice tail, bump to 1200ms.

These constants live at the top of the file; tune by ear once a real
track is in.

## Where to find a music file

Need: ~30-60s seamless loop, no vocals, no percussion, soft major-key
(or modal-melancholy if Marc wants it more "thoughtful cave"). Volume
should already be mastered low — we'll attenuate further at runtime.

### Free / royalty-free libraries

| Source | License | Notes |
|---|---|---|
| **Pixabay Music** (pixabay.com/music) | CC0 | Type "ambient lullaby kids" — plenty of soft piano + harp loops. Marc has used Pixabay before; trust signal. |
| **Free Music Archive** (freemusicarchive.org) | mostly CC-BY | Kim Lightyear, Kai Engel ambient stuff fits. CC-BY needs an Impressum credit line. |
| **Mixkit** (mixkit.co/free-stock-music) | royalty-free | Categorized; "kids" + "calm" filters give workable loops. |
| **YouTube Audio Library** (studio.youtube.com → audio library) | royalty-free for non-music products | Can use in the PWA without attribution. |
| **Bensound** (bensound.com) | free with attribution OR paid | "Slow Motion" + "Tenderness" tracks work well. Attribution required on free tier. |

### AI-generated (most flexible, ~free to ~€10)

| Source | Cost | Notes |
|---|---|---|
| **Suno** (suno.com) | $8/mo, can cancel after one batch | Prompt: "ambient lullaby, soft acoustic guitar fingerpicking, no percussion, no vocals, gentle, slightly melancholy, cave hollow sound, 60 seconds seamless loop". Can iterate prompts cheaply until one feels right. |
| **Udio** (udio.com) | $10/mo | Similar; some find it more controllable than Suno for ambient. |
| **ElevenLabs Music** | included in existing ElevenLabs sub | Newer feature; same account Marc uses for voice. Quality varies on ambient. |

### Commission

| Source | Cost | Notes |
|---|---|---|
| **Fiverr** ambient loop composer | €30-100 | Search "ambient loop composer kids app", filter by samples. 2-3 day turnaround. Owns the rights once paid. |
| **Local musician** | €100-300 | Friend-of-a-friend route. Higher quality, slower, more personal. |

### Recommendation

Start with **Pixabay Music** (10 minutes, free, no attribution, no
account needed). If nothing fits the cave atmosphere after 20 minutes
of browsing, **Suno** for €8/mo one-month — generate 5-10 variants
from the same prompt, pick the one that feels like Ronki. Either
path gets a usable loop in under an hour.

Once picked, drop the file as
`public/audio/music/cave_ambient_01.mp3` (60s seamless loop), wire
into BackgroundMusic.init() with that as the default src, ship the
toggle, parental dashboard.

## What I'll build when Marc says "go"

1. `src/utils/backgroundMusic.ts` — full singleton (~140 LOC)
2. `src/utils/voiceAudio.ts` — add duck/unduck around the 4 play
   methods (~12 LOC delta)
3. `src/components/ParentalDashboard.jsx` — add the music toggle to
   the Stimmen card (~30 LOC delta)
4. `src/App.jsx` — mount `<BackgroundMusicProvider />` near the auth
   gate (~5 LOC delta)
5. Smoke-test: walk MeetRonki + Tonight + RoomHub with music ON,
   verify ducking on each voiceline trigger.

Total: ~190 LOC, ~60 minutes of dev once the music file is in place.

---

_Last revised: 27 April 2026 (initial spec)._
