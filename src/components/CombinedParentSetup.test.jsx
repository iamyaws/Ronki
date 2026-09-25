// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import CombinedParentSetup from './CombinedParentSetup';
import { DEFAULT_ROUTINE } from '../data/taskKinds';

function typeName(v) {
  fireEvent.change(screen.getByLabelText('Wie heißt euer Kind?'), { target: { value: v } });
}

describe('CombinedParentSetup (parent step after the hatch)', () => {
  it('shows the new top lines and the tip, and keeps the pill off until a name', () => {
    const onComplete = vi.fn();
    render(<CombinedParentSetup onComplete={onComplete} />);
    expect(screen.getByText('Ronki ist geschlüpft.')).toBeTruthy();
    expect(screen.getByText(/Dann fliegt Ronki los und kommt mit einer kleinen Geschichte zurück\./)).toBeTruthy();
    expect(screen.getByText(/Schau mal, ob Ronki zurück ist\./)).toBeTruthy();
    const pill = screen.getByText('Zurück zum Kind').closest('button');
    expect(pill.disabled).toBe(true);
    typeName('Mia');
    expect(screen.getByText('Zurück zu Mia').closest('button').disabled).toBe(false);
  });

  it('sends the old payload plus the default routine and 17:00', () => {
    const onComplete = vi.fn();
    render(<CombinedParentSetup existingFamilyConfig={{ childName: '', familyMotto: 'x' }} onComplete={onComplete} />);
    typeName('  Mia ');
    fireEvent.click(screen.getByText('Zurück zu Mia').closest('button'));
    expect(onComplete).toHaveBeenCalledWith({
      parentOnboardingDone: true,
      parentPin: null,
      parentPinIsDefault: true,
      analyticsEnabled: false,
      familyConfig: { childName: 'Mia', familyMotto: 'x', siblings: [], routine: DEFAULT_ROUTINE, eveningStart: '17:00' },
    });
  });

  it('routine and evening start land in familyConfig; PIN and consent as before', () => {
    const onComplete = vi.fn();
    render(<CombinedParentSetup onComplete={onComplete} />);
    typeName('Louis');
    // collapsed until asked
    expect(document.querySelector('[data-kind="water"]')).toBeNull();
    fireEvent.click(screen.getByText('Ronkis Morgen und Abend anpassen').closest('button'));
    fireEvent.click(document.querySelector('[data-kind="water"]'));
    fireEvent.click(document.querySelector('[data-kind="cuddle"]'));
    fireEvent.click(screen.getByText('18:00'));
    fireEvent.click(screen.getByText('PIN festlegen').closest('button'));
    fireEvent.change(screen.getByLabelText('PIN für den Eltern-Bereich (optional)'), { target: { value: '4711' } });
    fireEvent.click(screen.getByText('Anonyme Nutzungsdaten teilen?').closest('button'));
    fireEvent.click(screen.getByText('Zurück zu Louis').closest('button'));
    const p = onComplete.mock.calls[0][0];
    expect(p.parentPin).toBe('4711');
    expect(p.parentPinIsDefault).toBe(false);
    expect(p.analyticsEnabled).toBe(true);
    expect(p.familyConfig.routine).toEqual({
      morning: ['wake', 'water', 'breakfast', 'teeth_am', 'dress', 'packcheck'],
      evening: ['teeth_pm', 'wash_pm', 'pyjama'],
    });
    expect(p.familyConfig.eveningStart).toBe('18:00');
  });

  it('a short PIN shows the error and does not submit', () => {
    const onComplete = vi.fn();
    render(<CombinedParentSetup onComplete={onComplete} />);
    typeName('Mia');
    fireEvent.click(screen.getByText('PIN festlegen').closest('button'));
    fireEvent.change(screen.getByLabelText('PIN für den Eltern-Bereich (optional)'), { target: { value: '12' } });
    fireEvent.click(screen.getByText('Zurück zu Mia').closest('button'));
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('Vier Ziffern');
  });

  it('the card link shows only with onScanCard', () => {
    const onScanCard = vi.fn();
    const { unmount } = render(<CombinedParentSetup onComplete={vi.fn()} onScanCard={onScanCard} />);
    fireEvent.click(screen.getByText('Karte scannen').closest('button'));
    expect(onScanCard).toHaveBeenCalledTimes(1);
    unmount();
    render(<CombinedParentSetup onComplete={vi.fn()} />);
    expect(screen.queryByText('Karte scannen')).toBeNull();
  });

  it('shortens a very long name on the pill so it never runs off the screen', () => {
    render(<CombinedParentSetup onComplete={vi.fn()} />);
    typeName('Maximilian-Alexander');
    const label = screen.getByText(/^Zurück zu /).textContent;
    expect(Array.from(label.replace('Zurück zu ', ''))).toHaveLength(14);
  });
});
