import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ZeitumstellungKinder from '../src/pages/ratgeber/ZeitumstellungKinder';
import prerenderSource from '../vite-plugin-prerender-meta.ts?raw';

const H1 = 'Zeitumstellung im Herbst: So kommt dein Kind gut durch die Umstellung';

function setup() {
  return render(
    <MemoryRouter>
      <ZeitumstellungKinder />
    </MemoryRouter>,
  );
}

describe('Ratgeber Zeitumstellung Kinder', () => {
  it('has exactly one H1 with the search phrase', () => {
    setup();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(H1);
  });

  it('links the printable evening template', () => {
    setup();
    expect(
      screen.getByRole('link', { name: 'Abendroutine Vorlage zum Ausdrucken' }),
    ).toHaveAttribute('href', '/vorlagen/abendroutine');
  });

  it('lists at least three sources under Quellen', () => {
    setup();
    const heading = screen.getByRole('heading', { level: 2, name: 'Quellen' });
    const list = heading.nextElementSibling;
    expect(list?.tagName).toBe('UL');
    const links = Array.from(list!.querySelectorAll('a'));
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^https:\/\//);
    }
  });

  it('uses the same title and description for the browser and the prerendered crawler HTML', () => {
    setup();
    expect(document.title).toBe(`${H1} · Ratgeber`);
    expect(prerenderSource).toContain(`path: '/ratgeber/zeitumstellung-kinder'`);
    expect(prerenderSource).toContain(`title: '${document.title} · Ronki'`);
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeLessThan(160);
    expect(prerenderSource).toContain(description!);
  });
});
