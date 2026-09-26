import { describe, expect, it } from 'vitest';
import html from '../index.html?raw';

/** The transformRequest passed to plausible.init in index.html, as a function. */
function transform(): (p: { u: string }) => { u: string } {
  const match = /transformRequest:\s*(function\s*\(p\)\s*\{[\s\S]*?return p;\s*\})/.exec(html);
  if (!match) throw new Error('no transformRequest in index.html');
  return new Function(`return (${match[1]});`)() as (p: { u: string }) => { u: string };
}

describe('Plausible page address', () => {
  it('sends the path and campaign tags, never a tool plan or typed text', () => {
    const t = transform();
    expect(t({ u: 'https://www.ronki.de/vorlagen/morgenroutine?s=zdx&e=Medizin+nehmen&los=0740&utm_source=whatsapp' }).u)
      .toBe('https://www.ronki.de/vorlagen/morgenroutine?utm_source=whatsapp');
    expect(t({ u: 'https://www.ronki.de/tools/ranzen-packplan?di=g&fr=.Laterne' }).u).toBe(
      'https://www.ronki.de/tools/ranzen-packplan',
    );
    expect(t({ u: 'https://www.ronki.de/?ref=newsletter&x=1' }).u).toBe('https://www.ronki.de/?ref=newsletter');
  });
});
