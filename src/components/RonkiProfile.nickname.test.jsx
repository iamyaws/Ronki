// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

vi.mock('../context/TaskContext', () => ({ useTask: () => ({ state: {}, actions: {} }) }));

import { withNickname } from './RonkiProfile';

// The profile title names Ronki by the kid's nickname from the hatch
// (MeetRonki name chips, 25 Sep 2026).
describe('withNickname', () => {
  it('puts the nickname where the title names Ronki', () => {
    expect(withNickname('Ronki ist gut drauf.', 'Funki')).toBe('Funki ist gut drauf.');
    expect(withNickname('Ronki is doing well.', 'Flämmchen')).toBe('Flämmchen is doing well.');
  });

  it('leaves the title alone without a nickname, for "Ronki", and away from the start', () => {
    expect(withNickname('Ronki ist heute müde.', '')).toBe('Ronki ist heute müde.');
    expect(withNickname('Ronki ist heute müde.', '   ')).toBe('Ronki ist heute müde.');
    expect(withNickname('Ronki ist heute müde.', 'Ronki')).toBe('Ronki ist heute müde.');
    expect(withNickname('Heute ist Ronki müde.', 'Funki')).toBe('Heute ist Ronki müde.');
    expect(withNickname('Ronkis Tag', 'Funki')).toBe('Ronkis Tag');
  });
});
