import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { TRIPS } from './trips';

// Tomorrow as a picture (26 Sep 2026): every trip's place drawing ships with the app.
describe('trip place pictures', () => {
  it('every trip has its picture on disk', () => {
    for (const t of TRIPS) {
      const rel = t.picture.replace(/^.*?art\//, 'art/');
      expect(rel).toBe(`art/bilderbuch/places/${t.id}.webp`);
      expect(existsSync(resolve(process.cwd(), 'public', rel))).toBe(true);
    }
  });
});
