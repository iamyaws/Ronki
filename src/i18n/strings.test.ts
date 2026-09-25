import { describe, it, expect } from 'vitest';
import de from './de.json';
import en from './en.json';

// Fix round 1 (Astra FC-11): no em dash or en dash in any shipped string
// value. Keys and source comments are not checked. Written as escapes so
// this file holds no literal dash itself.
const DASHES = new RegExp('[\\u2013\\u2014]');

describe.each([
  ['de.json', de as Record<string, string>],
  ['en.json', en as Record<string, string>],
])('%s', (_name, table) => {
  it('has no em or en dash in any string value', () => {
    const bad = Object.entries(table).filter(([, v]) => typeof v === 'string' && DASHES.test(v));
    expect(bad).toEqual([]);
  });
});
