import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../src/lib/profileSetup', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/profileSetup')>();
  return { ...actual, createProfileOnSite: vi.fn() };
});

import ProfilErstellen from '../src/pages/ProfilErstellen';
import { createProfileOnSite } from '../src/lib/profileSetup';

function renderPage(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/profil-erstellen${search}`]}>
      <ProfilErstellen />
    </MemoryRouter>,
  );
}

async function submit(name = 'Louis') {
  fireEvent.change(screen.getByRole('textbox', { name: 'Name eures Kindes' }), { target: { value: name } });
  fireEvent.click(screen.getByRole('button', { name: /Karte erstellen/ }));
  await waitFor(() => expect(createProfileOnSite).toHaveBeenCalledTimes(1));
}

describe('Profil-Karte with steps from the Morgenroutine page', () => {
  beforeEach(() => {
    vi.mocked(createProfileOnSite).mockReset();
    vi.mocked(createProfileOnSite).mockResolvedValue({ ok: false, reason: 'error' });
  });

  it('shows the carried steps with their pictures and app labels above the form', () => {
    renderPage('?morgen=teeth_am,nope,dress,teeth_am,packcheck');
    const box = screen.getByRole('region', { name: 'Diese Schritte übernimmt Ronki' });
    const items = within(box).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(['Zähne putzen', 'Anziehen', 'Schultasche']);
    expect(Array.from(box.querySelectorAll('img')).map((img) => img.getAttribute('src'))).toEqual([
      '/art/bilderbuch/tasks/toothbrush.webp',
      '/art/bilderbuch/tasks/shirt.webp',
      '/art/bilderbuch/tasks/bag.webp',
    ]);
    // Above the form.
    const form = screen.getByRole('button', { name: /Karte erstellen/ }).closest('form')!;
    expect(box.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('passes the carried steps to createProfileOnSite', async () => {
    renderPage('?morgen=wake,water,wash,breakfast');
    await submit();
    expect(createProfileOnSite).toHaveBeenCalledWith({
      childName: 'Louis',
      pin: null,
      morning: ['wake', 'water', 'wash', 'breakfast'],
    });
  });

  it('works exactly as before without the parameter', async () => {
    renderPage();
    expect(screen.queryByText('Diese Schritte übernimmt Ronki')).toBeNull();
    await submit();
    expect(createProfileOnSite).toHaveBeenCalledWith({ childName: 'Louis', pin: null });
  });

  it('shows nothing and passes nothing when no step is one the app knows', async () => {
    renderPage('?morgen=pyjama,%3Cscript%3E,');
    expect(screen.queryByText('Diese Schritte übernimmt Ronki')).toBeNull();
    await submit();
    expect(createProfileOnSite).toHaveBeenCalledWith({ childName: 'Louis', pin: null });
  });
});
