import { describe, expect, it } from 'vitest';
import html from '../index.html?raw';

/** The transformRequest passed to plausible.init in index.html, as a function. */
function transform(): (p: { u: string }) => { u: string } {
  const match = /transformRequest:\s*(function\s*\(p\)\s*\{[\s\S]*?return p;\s*\})/.exec(html);
  if (!match) throw new Error('no transformRequest in index.html');
  return new Function(`return (${match[1]});`)() as (p: { u: string }) => { u: string };
}

describe('Plausible page address with the clock style', () => {
  it('drops the clock style and the wake-up time, keeps campaign tags', () => {
    const t = transform();
    expect(t({ u: 'https://www.ronki.de/vorlagen/morgenroutine?s=azx&e=Medizin&los=0740&u=beides&utm_source=whatsapp' }).u).toBe(
      'https://www.ronki.de/vorlagen/morgenroutine?utm_source=whatsapp',
    );
    expect(t({ u: 'https://www.ronki.de/vorlagen/morgenroutine?los=0740&u=uhr' }).u).toBe(
      'https://www.ronki.de/vorlagen/morgenroutine',
    );
    expect(t({ u: 'https://www.ronki.de/tools/schlafens-rechner?auf=0650' }).u).toBe(
      'https://www.ronki.de/tools/schlafens-rechner',
    );
  });
});
