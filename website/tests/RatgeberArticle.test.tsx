import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RatgeberArticle } from '../src/components/RatgeberArticle';

function setup(updatedAt?: string) {
  return render(
    <MemoryRouter>
      <RatgeberArticle
        slug="test-artikel"
        title="Testartikel"
        description="Beschreibung"
        category="Morgen"
        readMinutes={5}
        publishedAt="2026-04-19"
        updatedAt={updatedAt}
      >
        <p>Text</p>
      </RatgeberArticle>
    </MemoryRouter>,
  );
}

function articleSchema(container: HTMLElement) {
  const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
  const data = scripts.map((s) => JSON.parse(s.textContent ?? '{}'));
  return data.find((d) => d['@type'] === 'Article');
}

describe('RatgeberArticle dates', () => {
  it('shows the update date and sets dateModified when updatedAt is given', () => {
    const { container } = setup('2026-09-15');
    expect(screen.getByText(/aktualisiert am 15\. September 2026/)).toBeInTheDocument();
    const schema = articleSchema(container);
    expect(schema.datePublished).toBe('2026-04-19');
    expect(schema.dateModified).toBe('2026-09-15');
  });

  it('shows only the publish date and mirrors it in dateModified without updatedAt', () => {
    const { container } = setup();
    expect(screen.queryByText(/aktualisiert am/)).toBeNull();
    expect(screen.getByText(/19\. April 2026/)).toBeInTheDocument();
    expect(articleSchema(container).dateModified).toBe('2026-04-19');
  });
});
