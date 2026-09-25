import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VorlageMorgen from '../src/pages/VorlageMorgen';
import prerenderSource from '../vite-plugin-prerender-meta.ts?raw';

function setup() {
  return render(
    <MemoryRouter>
      <VorlageMorgen />
    </MemoryRouter>,
  );
}

describe('Morgenroutine Vorlage', () => {
  it('has one H1 that carries the search phrase', () => {
    setup();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Morgenroutine Vorlage für Kinder zum Ausdrucken');
  });

  it('shows the FAQ and matching FAQPage JSON-LD', () => {
    const { container } = setup();
    expect(screen.getByRole('heading', { level: 2, name: 'Häufige Fragen' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Mit oder ohne Belohnung?' })).toBeInTheDocument();

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent ?? '{}');
    expect(data['@type']).toBe('FAQPage');

    // Every answer in the structured data is visible on the page, word for word.
    for (const entry of data.mainEntity) {
      expect(screen.getByRole('heading', { level: 3, name: entry.name })).toBeInTheDocument();
      expect(screen.getByText(entry.acceptedAnswer.text)).toBeInTheDocument();
    }
  });

  it('shows the PDF preview image lazily with alt text and size', () => {
    setup();
    const img = screen.getByAltText(/PDF der Morgenroutine-Vorlage/);
    expect(img).toHaveAttribute('src', '/vorlagen/previews/morgenroutine.png');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('width');
    expect(img).toHaveAttribute('height');
  });

  it('keeps the no-email print route and links the ADHS variant', () => {
    setup();
    expect(screen.getByRole('link', { name: /diese seite ist selbst schon druckbar/i })).toHaveAttribute(
      'href',
      '/print/vorlage-morgen',
    );
    expect(screen.getByRole('link', { name: 'Vorlage bei ADHS' })).toHaveAttribute('href', '/vorlagen/adhs');
  });

  it('uses the same title for the browser and the prerendered crawler HTML', () => {
    setup();
    const plugin = prerenderSource;
    expect(document.title).toBe('Morgenroutine Vorlage für Kinder zum Ausdrucken · Ronki');
    expect(plugin).toContain(`title: '${document.title}'`);
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(description).toBeTruthy();
    expect(plugin).toContain(description!);
  });

  it('shares with a picture of the real sheet, in the browser and in the crawler HTML', () => {
    setup();
    const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    expect(image).toBe('https://www.ronki.de/og-vorlage-morgenroutine.jpg');
    expect(prerenderSource).toContain("ogImage: '/og-vorlage-morgenroutine.jpg'");
  });
});
