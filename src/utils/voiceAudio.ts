/**
 * VoiceAudio — plays pre-generated Ronki voice lines.
 * Audio files live at /audio/ronki/{lineId}.mp3
 * Falls back silently if file doesn't exist or audio is muted.
 *
 * Narrator mute (Apr 2026): Marc's decision is that Ronki is the only voice
 * Louis hears until Drachenmutter + Freunde voice re-cast is done. Instead
 * of deleting narrator call sites across the codebase, `playNarrator` +
 * `playNarratorWithCallback` no-op when NARRATOR_MUTED is true. Flip back
 * by setting localStorage['ronki_narrator_mute'] = '0' (or via setNarratorMuted).
 * The callback variant still fires onEnded so UI flows that await it don't
 * stall — they just proceed immediately as if the audio had played.
 */

import BackgroundMusic from './backgroundMusic';

const MUTE_KEY = 'ronki_voice_mute';
const NARRATOR_MUTE_KEY = 'ronki_narrator_mute';
// Mirrors src/i18n/LanguageContext STORAGE_KEY — duplicated here to avoid
// a circular import from a singleton util into a React context.
const LANG_STORAGE_KEY = 'ronki-lang';
const BASE = import.meta.env.BASE_URL;

let currentAudio: HTMLAudioElement | null = null;
let delayTimer: ReturnType<typeof setTimeout> | null = null;

function readNarratorMuted(): boolean {
  // Marc 27 Apr 2026: "remove the narrator and replace with Ronki's
  // voice only as I feel it should be only him." The Drachenmutter
  // narrator track is now hard-muted at the source — no localStorage
  // override path. All playNarrator(...) calls in the codebase no-op.
  // Audio files for narrator_meet_*, narrator_ritual_*, the arc beats
  // stay in public/audio/narrator/ as historical assets but are never
  // played. Re-enabling would require flipping this constant + bringing
  // back the dashboard toggle.
  //
  // Tier 2 (next session): rewrite the Drachenmutter beats as Ronki
  // lines (where Ronki is hatched) or as silent visual moments
  // (pre-hatch in MeetRonki). For now the speech bubbles still render
  // the German text on screen; the audio just doesn't play.
  return true;
}

/**
 * Read the current UI language from localStorage. Returns 'de' (default)
 * or 'en'. Used by playLocalized to pick the right audio file at play time
 * without making every feature component take a lang prop.
 */
function readLang(): 'de' | 'en' {
  if (typeof localStorage === 'undefined') return 'de';
  try {
    const raw = localStorage.getItem(LANG_STORAGE_KEY);
    return raw === 'en' ? 'en' : 'de';
  } catch {
    return 'de';
  }
}

const VoiceAudio = {
  /** Play a Drachenmutter narrator line (from /audio/narrator/*.mp3) */
  playNarrator(lineId: string, delayMs = 600) {
    if (readNarratorMuted()) return;
    if (this.isMuted()) return;
    if (!lineId) return;
    if (delayTimer) { clearTimeout(delayTimer); delayTimer = null; }
    const doPlay = () => {
      this.stop();
      const src = `${BASE}audio/narrator/${lineId}.mp3`;
      const audio = new Audio(src);
      audio.volume = 0.9;
      // Duck background music for the duration of this voice line.
      // Reference-counted by reason — 'narrator' is unique to Drachenmutter.
      BackgroundMusic.duck('narrator');
      const undock = () => BackgroundMusic.unduck('narrator');
      audio.addEventListener('ended', undock);
      audio.addEventListener('error', undock);
      audio.play().catch(() => undock());
      currentAudio = audio;
    };
    delayTimer = setTimeout(doPlay, delayMs);
  },

  /**
   * Play a narrator line with a callback on playback end.
   *
   * `onEnded` fires in two situations:
   *   - audio finishes naturally (`ended` event)
   *   - audio failed to load / autoplay blocked / was interrupted (via `error`
   *     event). Callers treat this as "we tried, move on" — never leave UI
   *     gated forever because a file is missing.
   *   - narrator audio is globally muted (current Marc policy) — fires
   *     immediately so any UI sequencing dependent on the callback proceeds.
   *
   * Always fires onEnded at most once.
   */
  playNarratorWithCallback(lineId: string, delayMs = 600, onEnded?: () => void) {
    if (readNarratorMuted()) { onEnded?.(); return; }
    if (this.isMuted()) { onEnded?.(); return; }
    if (!lineId) { onEnded?.(); return; }
    if (delayTimer) { clearTimeout(delayTimer); delayTimer = null; }

    let fired = false;
    const fireOnce = () => {
      if (fired) return;
      fired = true;
      onEnded?.();
    };

    const doPlay = () => {
      this.stop();
      const src = `${BASE}audio/narrator/${lineId}.mp3`;
      const audio = new Audio(src);
      audio.volume = 0.9;
      BackgroundMusic.duck('narrator-cb');
      const wrap = () => { BackgroundMusic.unduck('narrator-cb'); fireOnce(); };
      audio.addEventListener('ended', wrap);
      audio.addEventListener('error', wrap);
      audio.play().catch(() => { wrap(); });
      currentAudio = audio;
    };
    delayTimer = setTimeout(doPlay, delayMs);
  },

  /**
   * Play a voice line by base ID, prefixing with the current UI language.
   *
   * Example: `playLocalized('teeth_start')` plays `de_teeth_start.mp3` in
   * German mode, `en_teeth_start.mp3` in English mode. Added in the
   * 2026-04-25 EN parity pass so feature code (ToothbrushTimer, MiniGames,
   * ScreenTimer, CreatureDiscoveryToast, Journal) doesn't need to be lang-
   * aware — every direct-play call site uses the base ID and we route here.
   *
   * Callers that already know the full ID (e.g. engine-picked line IDs from
   * `useVoice`) should keep using `play()` directly.
   */
  playLocalized(baseId: string, delayMs = 0) {
    if (!baseId) return;
    const lang = readLang();
    // Finch pass fix round 1 (GUARDRAILS-4): most lines exist only as
    // de_ files. On a device set to English, a missing en_ file falls
    // back to the German file once, so Ronki never goes silent.
    const fallback = lang === 'de' ? undefined : `de_${baseId}`;
    this.play(`${lang}_${baseId}`, delayMs, fallback);
  },

  /**
   * Play a voice line by its ID (e.g., 'de_greet_01'). `fallbackId`, when
   * given, is tried once if the first file fails to load (missing file).
   */
  play(lineId: string, delayMs = 0, fallbackId?: string) {
    if (this.isMuted()) return;
    if (!lineId) return;

    // Clear any pending delayed play
    if (delayTimer) { clearTimeout(delayTimer); delayTimer = null; }

    const start = (id: string, nextFallback?: string) => {
      const src = `${BASE}audio/ronki/${id}.mp3`;
      const audio = new Audio(src);
      audio.volume = 0.85;
      // Duck for Ronki, a separate reason from narrator so concurrent
      // voicelines don't unduck prematurely.
      BackgroundMusic.duck('ronki');
      let undocked = false;
      const undock = () => {
        if (undocked) return;
        undocked = true;
        BackgroundMusic.unduck('ronki');
      };
      audio.addEventListener('ended', undock);
      audio.addEventListener('error', () => {
        undock();
        // Retry once with the fallback file, only if this line is still
        // the one playing (nothing stopped or replaced it meanwhile).
        if (nextFallback && currentAudio === audio) {
          currentAudio = null;
          start(nextFallback);
        }
      });
      currentAudio = audio;
      audio.play().catch(() => {
        // File doesn't exist or autoplay blocked: fail silently
        undock();
      });
    };

    const doPlay = () => {
      // Stop any currently playing line (don't overlap)
      this.stop();
      start(lineId, fallbackId);
    };

    if (delayMs > 0) {
      delayTimer = setTimeout(doPlay, delayMs);
    } else {
      doPlay();
    }
  },

  /** Stop current playback */
  stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  },

  isMuted(): boolean {
    if (typeof localStorage === 'undefined') return true;
    // Default is UNMUTED (Apr 2026 flip) — new users hear Ronki by default
    // now that Harry's voice bank has replaced the placeholder set. Explicit
    // '1' = muted by user choice. Anything else (null / '0' / absent) = unmuted.
    return localStorage.getItem(MUTE_KEY) === '1';
  },

  setMuted(muted: boolean): void {
    if (typeof localStorage === 'undefined') return;
    // '1' = user muted explicitly. '0' = user unmuted explicitly. The default
    // when no key is set is UNMUTED (see isMuted()). We still write '1'/'0'
    // so an explicit choice sticks across sessions/default flips.
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    if (muted) this.stop();
  },

  toggleMute(): boolean {
    const next = !this.isMuted();
    this.setMuted(next);
    return next;
  },

  /** Whether narrator (Drachenmutter + arc) audio is globally muted.
   *  Default UNMUTED since the 2026-04-27 voice ship. Returns true
   *  only when the parent flipped the toggle in the dashboard. */
  isNarratorMuted(): boolean {
    return readNarratorMuted();
  },

  setNarratorMuted(muted: boolean): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(NARRATOR_MUTE_KEY, muted ? '1' : '0');
    if (muted) this.stop();
  },
};

export default VoiceAudio;
