import { describe, it, expect } from 'vitest';
import indexHtml from '../index.html?raw';

// Guard for the Plausible to Umami switch (25 Sep 2026): the site must load
// exactly one analytics script, Umami's, with a real website id, limited to
// the production domain so previews and localhost never count.
describe('Umami snippet in index.html', () => {
  it('has no Plausible left', () => {
    expect(indexHtml.toLowerCase()).not.toContain('plausible');
  });

  it('loads Umami with a real website id on www.ronki.de only', () => {
    const tag = indexHtml.match(/<script[^>]*data-website-id="([^"]+)"[^>]*><\/script>/);
    expect(tag).not.toBeNull();
    expect(tag![1]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(tag![0]).toContain('data-domains="www.ronki.de"');
    expect(tag![0]).toContain('defer');
  });
});
