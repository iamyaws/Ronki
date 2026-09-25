import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../src/lib/analytics', () => ({ trackEvent: vi.fn() }));

import { trackEvent } from '../src/lib/analytics';
import VorlageMorgen from '../src/pages/VorlageMorgen';

afterEach(() => vi.restoreAllMocks());

// Astra rep 2 (25 Sep 2026): the main print button was not counted, so the
// weekly check could not see print attempts. It now sends its own event,
// separate from "Vorlage Download" (PDF after the email form).
describe('print button on a template page', () => {
  it('counts the click as "Vorlage Drucken" and opens the print dialog', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <VorlageMorgen />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Drucken/ }));
    expect(trackEvent).toHaveBeenCalledWith('Vorlage Drucken', { vorlage: 'morgenroutine', weg: 'browser' });
    expect(print).toHaveBeenCalled();
  });
});
