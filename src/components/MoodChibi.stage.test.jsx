import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import MoodChibi, { resolveRonkiArt } from './MoodChibi';

// Finch pass (26 Sep 2026), base design section 5: stage 3 (Stolz)
// stands up, so its calm art is proud.webp and differs from stage 2.
describe('MoodChibi growth stages', () => {
  it('stage 3 calm resolves to proud.webp', () => {
    expect(resolveRonkiArt({ stage: 3 })).toMatch(/ronki\/proud\.webp$/);
    expect(resolveRonkiArt({ stage: 3, mood: 'normal' })).toMatch(/ronki\/proud\.webp$/);
  });

  it('stage 3 calm keeps proud.webp even when animated', () => {
    expect(resolveRonkiArt({ stage: 3, animated: true })).toMatch(/ronki\/proud\.webp$/);
  });

  it('stages 2 and 3 look different', () => {
    expect(resolveRonkiArt({ stage: 2 })).not.toEqual(resolveRonkiArt({ stage: 3 }));
  });

  it('keeps every other mapping', () => {
    expect(resolveRonkiArt({ stage: 2 })).toMatch(/ronki\/calm\.webp$/);
    expect(resolveRonkiArt({ stage: 2, animated: true })).toMatch(/loops\/ronki-idle\.webp$/);
    expect(resolveRonkiArt({ stage: 3, mood: 'gut' })).toMatch(/ronki\/happy\.webp$/);
    expect(resolveRonkiArt({ stage: 3, mood: 'tired' })).toMatch(/ronki\/sleepy\.webp$/);
    expect(resolveRonkiArt({ stage: 4 })).toMatch(/ronki\/grown\.webp$/);
    expect(resolveRonkiArt({ stage: 5 })).toMatch(/ronki\/legendary\.webp$/);
  });

  it('renders the proud art for a stage 3 Ronki', () => {
    const { container } = render(<MoodChibi stage={3} mood="normal" label="Ronki" />);
    expect(container.querySelector('img').getAttribute('src')).toMatch(/ronki\/proud\.webp$/);
  });
});
