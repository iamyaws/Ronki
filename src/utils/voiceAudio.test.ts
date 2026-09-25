// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Fix round 1 (GUARDRAILS-4 / INTEGRATION-3): on a device set to English,
// a line that exists only as a de_ file must still sound. A fake Audio
// records every file the player tries and lets a test fire 'error'.
vi.mock('./backgroundMusic', () => ({ default: { duck: vi.fn(), unduck: vi.fn() } }));

type FakeAudio = {
  src: string;
  volume: number;
  listeners: Record<string, Array<() => void>>;
  addEventListener: (ev: string, fn: () => void) => void;
  play: () => Promise<void>;
  pause: () => void;
  currentTime: number;
  fire: (ev: string) => void;
};
let created: FakeAudio[] = [];

class Audio {
  src: string;
  volume = 1;
  currentTime = 0;
  listeners: Record<string, Array<() => void>> = {};
  constructor(src: string) {
    this.src = src;
    created.push(this as unknown as FakeAudio);
  }
  addEventListener(ev: string, fn: () => void) {
    (this.listeners[ev] ||= []).push(fn);
  }
  play() { return Promise.resolve(); }
  pause() {}
  fire(ev: string) { (this.listeners[ev] || []).forEach((fn) => fn()); }
}

import VoiceAudio from './voiceAudio';

const file = (a: FakeAudio) => a.src.split('/').pop();

describe('VoiceAudio.playLocalized language fallback', () => {
  beforeEach(() => {
    created = [];
    vi.stubGlobal('Audio', Audio);
    localStorage.clear();
  });
  afterEach(() => {
    VoiceAudio.stop();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('plays the de_ file on a German device, with no second try', () => {
    VoiceAudio.playLocalized('task_ask_01');
    expect(created.map(file)).toEqual(['de_task_ask_01.mp3']);
    created[0].fire('error');
    expect(created.map(file)).toEqual(['de_task_ask_01.mp3']);
  });

  it('falls back to the de_ file when the en_ file is missing', () => {
    localStorage.setItem('ronki-lang', 'en');
    VoiceAudio.playLocalized('task_ask_01');
    expect(created.map(file)).toEqual(['en_task_ask_01.mp3']);
    created[0].fire('error');
    expect(created.map(file)).toEqual(['en_task_ask_01.mp3', 'de_task_ask_01.mp3']);
  });

  it('tries the fallback only once', () => {
    localStorage.setItem('ronki-lang', 'en');
    VoiceAudio.playLocalized('slowdown_01');
    created[0].fire('error');
    created[1].fire('error');
    expect(created).toHaveLength(2);
  });

  it('keeps the en_ file when it loads', () => {
    localStorage.setItem('ronki-lang', 'en');
    VoiceAudio.playLocalized('nav_tap_nest');
    created[0].fire('ended');
    expect(created.map(file)).toEqual(['en_nav_tap_nest.mp3']);
  });

  it('does not bring back a line that was stopped or replaced before its error', () => {
    localStorage.setItem('ronki-lang', 'en');
    VoiceAudio.playLocalized('task_ask_01');
    VoiceAudio.stop();
    created[0].fire('error');
    expect(created).toHaveLength(1);

    VoiceAudio.playLocalized('task_ask_02');
    VoiceAudio.playLocalized('task_ask_03');
    created[1].fire('error');
    expect(created.map(file)).toEqual(['en_task_ask_01.mp3', 'en_task_ask_02.mp3', 'en_task_ask_03.mp3']);
  });
});
