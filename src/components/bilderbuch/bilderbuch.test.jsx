// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import MoodChibi, { RonkiArt, resolveRonkiArt } from '../MoodChibi';
import { PillButton, SpeechBubble, ChoiceTile, DoodleIcon, StickerBurst, SceneLoop, TopBar, PaperCard, QuietLink, MotionTicks } from './index';

describe('resolveRonkiArt', () => {
  it('maps the old mood names to the Bilderbuch files', () => {
    expect(resolveRonkiArt({ mood: 'normal' })).toMatch(/ronki\/calm\.webp$/);
    expect(resolveRonkiArt({ mood: 'gut' })).toMatch(/ronki\/happy\.webp$/);
    expect(resolveRonkiArt({ mood: 'tired' })).toMatch(/ronki\/sleepy\.webp$/);
    expect(resolveRonkiArt({ mood: 'sad' })).toMatch(/ronki\/heavy\.webp$/);
    expect(resolveRonkiArt({ mood: 'besorgt' })).toMatch(/ronki\/worried\.webp$/);
    expect(resolveRonkiArt({ mood: 'magisch' })).toMatch(/ronki\/proud\.webp$/);
  });
  it('uses the stage files for egg, baby, grown and legendary', () => {
    expect(resolveRonkiArt({ stage: 0 })).toMatch(/eggs\/egg-cream\.webp$/);
    expect(resolveRonkiArt({ stage: 1 })).toMatch(/ronki\/baby\.webp$/);
    expect(resolveRonkiArt({ stage: 1, mood: 'gut' })).toMatch(/ronki\/baby\.webp$/);
    // a hatchling keeps its feelings visible (Astra code review R2)
    expect(resolveRonkiArt({ stage: 1, mood: 'sad' })).toMatch(/ronki\/heavy\.webp$/);
    expect(resolveRonkiArt({ stage: 1, mood: 'besorgt' })).toMatch(/ronki\/worried\.webp$/);
    expect(resolveRonkiArt({ stage: 4 })).toMatch(/ronki\/grown\.webp$/);
    // the picked egg shows in the egg and in the hatchling's shell hat
    expect(resolveRonkiArt({ stage: 0, variant: 'sunset' })).toMatch(/eggs\/egg-ember\.webp$/);
    expect(resolveRonkiArt({ stage: 1, variant: 'teal' })).toMatch(/ronki\/baby-cobalt\.webp$/);
    expect(resolveRonkiArt({ stage: 1, variant: 'forest' })).toMatch(/ronki\/baby\.webp$/);
    expect(resolveRonkiArt({ stage: 1, variant: 'rose' })).toMatch(/ronki\/baby\.webp$/);
    expect(resolveRonkiArt({ stage: 2, variant: 'amber' })).toMatch(/ronki\/calm\.webp$/);
    expect(resolveRonkiArt({ stage: 5 })).toMatch(/ronki\/legendary\.webp$/);
    expect(resolveRonkiArt({ stage: 4, mood: 'gut' })).toMatch(/ronki\/happy\.webp$/);
  });
  it('only plays the idle loop for calm or happy, stage 2 up, motion allowed', () => {
    expect(resolveRonkiArt({ animated: true })).toMatch(/loops\/ronki-idle\.webp$/);
    expect(resolveRonkiArt({ animated: true, mood: 'sad' })).toMatch(/ronki\/heavy\.webp$/);
    expect(resolveRonkiArt({ animated: true, stage: 1 })).toMatch(/ronki\/baby\.webp$/);
    expect(resolveRonkiArt({ animated: true, reduced: true })).toMatch(/ronki\/calm\.webp$/);
    // grown and legendary keep their look with motion on (Astra design review R4)
    expect(resolveRonkiArt({ animated: true, stage: 4 })).toMatch(/ronki\/grown\.webp$/);
    expect(resolveRonkiArt({ animated: true, stage: 5 })).toMatch(/ronki\/legendary\.webp$/);
  });
});

describe('MoodChibi fallbacks', () => {
  it('falls back to calm and then to nothing without a broken image', () => {
    const { container } = render(<MoodChibi mood="magisch" size={100} />);
    let img = container.querySelector('img');
    expect(img.getAttribute('src')).toMatch(/proud\.webp$/);
    fireEvent.error(img);
    img = container.querySelector('img');
    expect(img.getAttribute('src')).toMatch(/calm\.webp$/);
    fireEvent.error(img);
    expect(container.querySelector('img')).toBeNull();
    // The outer square keeps its size so layouts do not jump.
    const outer = container.firstChild;
    expect(outer.style.width).toBe('100px');
  });
  it('keeps accepting the old props', () => {
    const { container } = render(<MoodChibi variant="teal" stage={3} face bare mood="tired" />);
    expect(container.querySelector('img').getAttribute('src')).toMatch(/sleepy\.webp$/);
  });
  it('renders poses through RonkiArt', () => {
    const { container } = render(<RonkiArt pose="cheer" size={80} />);
    expect(container.querySelector('img').getAttribute('src')).toMatch(/ronki\/cheer\.webp$/);
    const eggs = render(<RonkiArt pose="egg-sun" />);
    expect(eggs.container.querySelector('img').getAttribute('src')).toMatch(/eggs\/egg-sun\.webp$/);
  });
});

describe('primitives render', () => {
  it('PillButton, QuietLink, SpeechBubble, ChoiceTile, TopBar, PaperCard, DoodleIcon, MotionTicks', () => {
    const onClick = vi.fn();
    const { getByText, getByLabelText, container } = render(
      <div>
        <PillButton onClick={onClick} arrow icon="sun">Los</PillButton>
        <PillButton tone="sun" disabled onClick={onClick}>Aus</PillButton>
        <QuietLink onClick={onClick}>Später</QuietLink>
        <SpeechBubble side="right">Hallo du.</SpeechBubble>
        <ChoiceTile label="Leicht" doodle="sun" selected doodleColor="#fdd134" />
        <TopBar title="Heute" onBack={onClick} right="sound" onRight={onClick} />
        <PaperCard tone="paper" lift>Karte</PaperCard>
        <DoodleIcon name="dragon" label="Ronki" />
        <MotionTicks tone="cobalt" />
      </div>
    );
    fireEvent.click(getByText('Los'));
    fireEvent.click(getByText('Aus'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getByLabelText('Vorlesen')).toBeTruthy();
    expect(getByLabelText('Ronki')).toBeTruthy();
    expect(container.querySelector('[aria-pressed="true"]')).toBeTruthy();
  });
});

describe('StickerBurst', () => {
  it('mounts particles on a rising edge and calls onDone', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    const { container } = render(<StickerBurst active onDone={onDone} count={13} />);
    expect(container.querySelectorAll('svg').length).toBe(13);
    act(() => { vi.advanceTimersByTime(1400); });
    expect(onDone).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('SceneLoop', () => {
  it('renders the poster as base layer and a muted looping video on top', () => {
    const { container } = render(<SceneLoop poster="/p.webp" video="/v.mp4" objectPosition="50% 30%" />);
    const img = container.querySelector('img');
    const video = container.querySelector('video');
    expect(img.getAttribute('src')).toBe('/p.webp');
    expect(video).toBeTruthy();
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.style.opacity).toBe('0');
    expect(video.style.objectPosition).toBe('50% 30%');
  });
  it('never mounts the video under reduced motion', () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const { container } = render(<SceneLoop poster="/p.webp" video="/v.mp4" />);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).toBeTruthy();
    window.matchMedia = original;
  });
});
