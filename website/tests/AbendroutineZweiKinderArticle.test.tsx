import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../src/routes';
import { ARTICLES } from '../src/data/ratgeber-articles';
import prerenderSource from '../vite-plugin-prerender-meta.ts?raw';
import sitemap from '../public/sitemap.xml?raw';
import articleSource from '../src/pages/ratgeber/AbendroutineZweiKinder.tsx?raw';

const PATH = '/ratgeber/abendroutine-zwei-kinder';
const H1 = 'Abendroutine mit zwei Kindern: wer braucht wann deine Hilfe?';

describe('Abendroutine mit zwei Kindern article', () => {
  it('serves the article on its route with the crawler title and description', async () => {
    render(
      <MemoryRouter initialEntries={[PATH]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { level: 1, name: H1 }, { timeout: 5000 })).toBeInTheDocument();
    expect(document.title).toBe(`${H1} · Ratgeber`);
    expect(prerenderSource).toContain(`path: '${PATH}'`);
    expect(prerenderSource).toContain(`title: '${H1} · Ratgeber · Ronki'`);
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(description?.length).toBeLessThanOrEqual(160);
    expect(prerenderSource).toContain(description!);
  });

  it('is listed under Abendroutine and in the sitemap', () => {
    const entry = ARTICLES.find((a) => a.slug === 'abendroutine-zwei-kinder');
    expect(entry?.category).toBe('Abendroutine');
    expect(entry?.title).toBe(H1);
    expect(sitemap).toContain(`<loc>https://www.ronki.de${PATH}</loc>`);
  });

  it('links the tool and its neighbours, names its sources and promises no sleep times', () => {
    expect(articleSource).toContain('to="/tools/abend-mit-zwei-kindern"');
    expect(articleSource).toContain('to="/vorlagen/abendroutine"');
    expect(articleSource).toContain('to="/tools/schlafens-rechner"');
    expect(articleSource).toContain('to="/ratgeber/zaehneputzen-ohne-streit"');
    expect(articleSource).toContain('kindergesundheit-info.de');
    expect(articleSource).toContain('dgkj.de');
    expect(articleSource).not.toContain('—');
    expect(articleSource).not.toMatch(/Stunden Schlaf|schläft nach \d+ Minuten|Feierabend um/);
  });
});
