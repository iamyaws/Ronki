import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VorlageAdhs from '../src/pages/VorlageAdhs';
import { VORLAGE_PRINT_ADHS } from '../src/pages/print/VorlagePrint';

describe('Vorlage für Kinder mit ADHS', () => {
  it('renders the six steps of the sheet', () => {
    render(
      <MemoryRouter>
        <VorlageAdhs />
      </MemoryRouter>,
    );

    for (const label of ['Aufwachen', 'Klo', 'Anziehen', 'Frühstück', 'Zähne', 'Ranzen']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it('offers the PDF and the print page without an email', () => {
    render(
      <MemoryRouter>
        <VorlageAdhs />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /diese seite ist selbst schon druckbar/i })).toHaveAttribute(
      'href',
      '/print/vorlage-adhs',
    );
  });

  it('keeps the print sheet free of clock pressure and streaks', () => {
    // The whole point of this sheet: a clip marks the current step, and
    // nothing on the paper counts days in a row.
    expect(VORLAGE_PRINT_ADHS.showTimes).toBeUndefined();
    expect(VORLAGE_PRINT_ADHS.clipLane).toBe(true);
    expect(VORLAGE_PRINT_ADHS.steps).toHaveLength(6);
  });
});
