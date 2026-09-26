import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../src/routes';
import { ARTICLES } from '../src/data/ratgeber-articles';
import prerenderSource from '../vite-plugin-prerender-meta.ts?raw';
import sitemap from '../public/sitemap.xml?raw';
import articleSource from '../src/pages/ratgeber/HausaufgabenStreitErsteKlasse.tsx?raw';

const PATH = '/ratgeber/hausaufgaben-streit-erste-klasse';
const H1 = 'Hausaufgaben-Streit in der 1. Klasse: erst ankommen, dann ein fester Rahmen';

describe('Hausaufgaben-Streit article', () => {
  it('serves the article on its route with the crawler title and description', async () => {
    render(
      <MemoryRouter initialEntries={[PATH]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { level: 1, name: H1 })).toBeInTheDocument();
    expect(document.title).toBe(`${H1} · Ratgeber`);
    expect(prerenderSource).toContain(`path: '${PATH}'`);
    expect(prerenderSource).toContain(`title: '${H1} · Ratgeber · Ronki'`);
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(description?.length).toBeLessThanOrEqual(160);
    expect(prerenderSource).toContain(description!);
  });

  it('is listed under Einschulung and in the sitemap', () => {
    const entry = ARTICLES.find((a) => a.slug === 'hausaufgaben-streit-erste-klasse');
    expect(entry?.category).toBe('Einschulung');
    expect(entry?.title).toBe(H1);
    expect(sitemap).toContain(`<loc>https://www.ronki.de${PATH}</loc>`);
  });

  it('links the tool, names its sources and carries no em-dash or homework time norm', () => {
    expect(articleSource).toContain('to="/tools/nachmittagsplan"');
    expect(articleSource).toContain('kinderaerzte-im-netz.de');
    expect(articleSource).toContain('Tut Kindern gut!');
    expect(articleSource).not.toContain('\u2014');
    expect(articleSource).not.toMatch(/Minuten (Deutsch|Mathe)|pro Klassenstufe/);
  });
});
