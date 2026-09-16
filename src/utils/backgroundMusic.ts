/**
 * BackgroundMusic — soft ambient layer + voice ducking.
 *
 * Marc 27 Apr 2026: "soft and low volume but we need something
 * that also goes on low/mute when voicelines play."
 *
 * Two modes, picked at init:
 *   · 'synth' (CURRENT) — Web Audio oscillator graph synthesizes a
 *     cave-ambient pad in code. No asset file. Quality bar: a believable
 *     ambient drone, not a composed track. Used as a placeholder until
 *     Marc picks a real mp3 (see docs/voice/voice-music-engine.md sourcing
 *     section). Loops infinitely while the audio context is alive.
 *   · 'file' (FUTURE) — plays public/audio/music/<id>.mp3 via an
 *     <audio loop> element. Activated by setSource(path). Same duck
 *     API; the source switch is one line of code.
 *
 * Ducking: reference-counted. Each caller passes a unique reason
 * string ('narrator', 'ronki', 'lullaby'). Multiple overlapping ducks
 * keep music low until the LAST reason calls unduck. Prevents the
 * "duck flicker" you'd get from naive paired duck/unduck.
 *
 * Autoplay: browsers block .play() until first user gesture. init()
 * attaches a one-shot pointerdown listener; until then the engine is
 * built but silent. Once authorized, music starts (if enabled).
 *
 * Off by default. Parent toggles via the dashboard.
 */

const ENABLED_KEY = 'ronki_music_enabled';

/** Volume the synth pad runs at when not ducked. Tuned to be a low
 *  ambient floor — present, never competing with voice. */
const BASE_VOLUME = 0.12;

/** Volume during voice playback. ~20% of base. Audible enough that
 *  the cave "feels alive" but well below voice intelligibility floor. */
const DUCK_LEVEL = 0.025;

/** Ramp time when ducking down (faster than ducking up — voice should
 *  cut through immediately, music returns gently). */
const DUCK_RAMP_MS = 200;

/** Ramp time when restoring volume after voice ends. */
const UNDUCK_RAMP_MS = 800;

interface SynthGraph {
  ctx: AudioContext;
  master: GainNode;
  oscillators: OscillatorNode[];
  lfoGain: GainNode | null;
  delayWet: GainNode | null;
}

class BackgroundMusicSingleton {
  private graph: SynthGraph | null = null;
  private fileAudio: HTMLAudioElement | null = null;
  private mode: 'synth' | 'file' = 'synth';
  private fileSrc: string | null = null;
  private activeDucks: Set<string> = new Set();
  private started = false;
  private pendingStart = false;
  private gestureHandlerAttached = false;
  private boundHandleVisibility: (() => void) | null = null;

  /**
   * Build the engine + attach the first-gesture listener. Call once
   * from the React app shell (e.g. AuthGate). Idempotent.
   */
  init(): void {
    if (this.started || this.pendingStart) return;
    if (typeof window === 'undefined') return;
    this.pendingStart = true;

    const onFirstGesture = () => {
      this.pendingStart = false;
      this.gestureHandlerAttached = false;
      document.removeEventListener('pointerdown', onFirstGesture);
      document.removeEventListener('keydown', onFirstGesture);
      if (this.isEnabled()) this.start();
    };
    document.addEventListener('pointerdown', onFirstGesture, { once: true });
    document.addEventListener('keydown', onFirstGesture, { once: true });
    this.gestureHandlerAttached = true;

    // Pause when the page hides (kid switches apps), resume on return.
    this.boundHandleVisibility = () => {
      if (!this.started) return;
      if (document.hidden) this.suspend();
      else if (this.isEnabled()) this.resume();
    };
    document.addEventListener('visibilitychange', this.boundHandleVisibility);
  }

  /** Begin playback. Requires prior user gesture. */
  async start(): Promise<void> {
    if (this.started) return;
    try {
      if (this.mode === 'file' && this.fileSrc) {
        await this.startFile();
      } else {
        await this.startSynth();
      }
      this.started = true;
    } catch (err) {
      // Swallow — autoplay block, audio context unavailable, etc.
      // The engine just stays silent; nothing else in the app cares.
    }
  }

  /** Pause without tearing down. Used by visibility-change. */
  suspend(): void {
    if (this.graph) this.graph.ctx.suspend().catch(() => {});
    if (this.fileAudio) this.fileAudio.pause();
  }

  resume(): void {
    if (this.graph) this.graph.ctx.resume().catch(() => {});
    if (this.fileAudio) this.fileAudio.play().catch(() => {});
  }

  /** Tear down completely. Used by setEnabled(false). */
  stop(): void {
    if (this.graph) {
      try {
        this.graph.oscillators.forEach(o => o.stop());
        this.graph.ctx.close().catch(() => {});
      } catch {}
      this.graph = null;
    }
    if (this.fileAudio) {
      this.fileAudio.pause();
      this.fileAudio.currentTime = 0;
      this.fileAudio = null;
    }
    this.started = false;
    this.activeDucks.clear();
  }

  /** Reference-counted duck. Each caller must pair with unduck(reason). */
  duck(reason = 'default'): void {
    this.activeDucks.add(reason);
    this.rampVolume(DUCK_LEVEL, DUCK_RAMP_MS);
  }

  unduck(reason = 'default'): void {
    this.activeDucks.delete(reason);
    if (this.activeDucks.size === 0) {
      this.rampVolume(BASE_VOLUME, UNDUCK_RAMP_MS);
    }
  }

  /** Replace the current source with a file-based track. Future use:
   *  once Marc picks a real mp3, call setSource('/audio/music/foo.mp3')
   *  on app boot. The synth graph tears down and the file element takes
   *  over. */
  setSource(filePath: string | null): void {
    const wasStarted = this.started;
    this.stop();
    if (filePath) {
      this.mode = 'file';
      this.fileSrc = filePath;
    } else {
      this.mode = 'synth';
      this.fileSrc = null;
    }
    if (wasStarted && this.isEnabled()) {
      // Restart on next gesture — start() may have been gesture-gated.
      this.start();
    }
  }

  isEnabled(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(ENABLED_KEY) === '1';
  }

  setEnabled(on: boolean): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(ENABLED_KEY, on ? '1' : '0');
    if (on) {
      // Try to start now. If gesture not yet received, init's first-
      // gesture handler will start once the user taps.
      if (!this.gestureHandlerAttached) this.init();
      this.start();
    } else {
      this.stop();
    }
  }

  // ── Internals ──────────────────────────────────────────────────

  private async startSynth(): Promise<void> {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) throw new Error('Web Audio not supported');
    const ctx = new Ctx();

    // ── Voicing: open A-major drone (A2 + E3 + A3 + C#4) ───────
    // Low energy, slightly "cave-modal" via the C#. Each oscillator
    // is paired with a subtle detune partner so the chord beats
    // gently — that's where the "alive" feeling comes from.
    const FREQS: Array<{ base: number; type: OscillatorType; detune: number; gain: number }> = [
      { base: 110.00, type: 'sine',     detune: 0,    gain: 0.55 }, // A2 — root
      { base: 110.00, type: 'triangle', detune: 4,    gain: 0.20 }, // A2 detuned
      { base: 164.81, type: 'sine',     detune: 0,    gain: 0.35 }, // E3
      { base: 220.00, type: 'sine',     detune: -3,   gain: 0.30 }, // A3
      { base: 277.18, type: 'sine',     detune: 0,    gain: 0.18 }, // C#4 (subtle high)
    ];

    // Master gain — what duck/unduck animates.
    const master = ctx.createGain();
    master.gain.value = 0; // ramp up gently below
    master.connect(ctx.destination);

    // Low-pass filter for warmth — strips brittle high harmonics.
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 850;
    lp.Q.value = 0.4;
    lp.connect(master);

    // Long delay tap for cave-reverb feel.
    const delay = ctx.createDelay(2.5);
    delay.delayTime.value = 1.4;
    const delayWet = ctx.createGain();
    delayWet.gain.value = 0.32;
    const delayFb = ctx.createGain();
    delayFb.gain.value = 0.42;
    delay.connect(delayWet);
    delayWet.connect(lp);
    delay.connect(delayFb);
    delayFb.connect(delay);

    // Build the oscillator stack.
    const oscillators: OscillatorNode[] = [];
    for (const f of FREQS) {
      const osc = ctx.createOscillator();
      osc.type = f.type;
      osc.frequency.value = f.base;
      osc.detune.value = f.detune;
      const oscGain = ctx.createGain();
      oscGain.gain.value = f.gain;
      osc.connect(oscGain);
      oscGain.connect(lp);
      oscGain.connect(delay); // also into the delay tap
      osc.start();
      oscillators.push(osc);
    }

    // LFO breathing on the master — ±15% over a 14-second cycle.
    // Subtle "the cave is alive" feel without being seasick.
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.071; // ~14s period
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = BASE_VOLUME * 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();
    oscillators.push(lfo);

    // Ramp master gain up to BASE_VOLUME over 1.6s — soft fade-in
    // so the music doesn't slap on hard the first time.
    const now = ctx.currentTime;
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(BASE_VOLUME, now + 1.6);

    this.graph = { ctx, master, oscillators, lfoGain, delayWet };
  }

  private async startFile(): Promise<void> {
    if (!this.fileSrc) throw new Error('no source');
    const audio = new Audio(this.fileSrc);
    audio.loop = true;
    audio.volume = 0;
    await audio.play();
    // Soft fade-in
    const start = Date.now();
    const fadeIn = setInterval(() => {
      const t = (Date.now() - start) / 1600;
      if (t >= 1) {
        audio.volume = BASE_VOLUME;
        clearInterval(fadeIn);
      } else {
        audio.volume = BASE_VOLUME * t;
      }
    }, 50);
    this.fileAudio = audio;
  }

  private rampVolume(target: number, ms: number): void {
    if (this.graph) {
      const now = this.graph.ctx.currentTime;
      const param = this.graph.master.gain;
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      param.linearRampToValueAtTime(target, now + ms / 1000);
    }
    if (this.fileAudio) {
      // No native ramp on HTMLAudioElement; do it in JS.
      const audio = this.fileAudio;
      const start = audio.volume;
      const startedAt = Date.now();
      const tick = () => {
        if (audio !== this.fileAudio) return;
        const t = Math.min(1, (Date.now() - startedAt) / ms);
        audio.volume = start + (target - start) * t;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }
}

const BackgroundMusic = new BackgroundMusicSingleton();
export default BackgroundMusic;
