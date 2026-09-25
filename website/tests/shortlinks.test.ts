import { describe, it, expect } from 'vitest';
import vercelConfig from '../../vercel.json';

// Short links for the launch (25 Sep 2026). Each one sends a channel to the
// morning template with UTM tags, so Umami can split visitors by source.
const EXPECTED: Record<string, string> = {
  '/morgen': 'whatsapp',
  '/li': 'linkedin',
  '/ig': 'instagram',
  '/tt': 'tiktok',
  '/yt': 'youtube',
};

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: { type: string; value: string }[];
};

describe('launch short links', () => {
  const redirects = ((vercelConfig as { redirects?: Redirect[] }).redirects ?? []);

  for (const [path, source] of Object.entries(EXPECTED)) {
    it(`${path} sends ${source} visitors to the morning template, tagged`, () => {
      const r = redirects.find((x) => x.source === path);
      expect(r).toBeDefined();
      expect(r!.permanent).toBe(false);
      // Root vercel.json also serves app.ronki.de; the links only fire on the website host.
      expect(r!.has).toEqual([{ type: 'host', value: 'www.ronki.de' }]);
      const url = new URL(r!.destination);
      expect(url.host).toBe('www.ronki.de');
      expect(url.pathname).toBe('/vorlagen/morgenroutine');
      expect(url.searchParams.get('utm_source')).toBe(source);
      expect(url.searchParams.get('utm_campaign')).toBe('morgenroutine-start');
    });
  }
});
