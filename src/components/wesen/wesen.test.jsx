import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WesenParentSection from './WesenParentSection';

vi.mock('../../context/TaskContext', () => ({ useTask: () => ({ state: null, actions: {} }) }));

const ROUTINE = {
  morning: ['wake', 'breakfast', 'teeth_am', 'dress', 'packcheck'],
  evening: ['teeth_pm', 'wash_pm', 'pyjama', 'cuddle'],
};
const base = (wesen) => ({ familyConfig: { childName: 'Louis', routine: ROUTINE }, wesen });

describe('WesenParentSection', () => {
  it('stays hidden until the card was offered with ?wesen=1', () => {
    const { container } = render(<WesenParentSection state={base(undefined)} actions={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the switch when offered and turns it on', () => {
    const wesenSetEnabled = vi.fn();
    render(<WesenParentSection state={base({ offered: true, friends: [] })} actions={{ wesenSetEnabled }} />);
    fireEvent.click(screen.getByTestId('switch-wesen'));
    expect(wesenSetEnabled).toHaveBeenCalledWith(true);
  });

  it('offers only daily self-care tasks from the routine, with the meaning of "allein"', () => {
    const wesenPickTask = vi.fn();
    render(<WesenParentSection state={base({ offered: true, enabled: true, friends: [] })} actions={{ wesenPickTask }} />);
    expect(screen.getByTestId('wesen-task-teeth_am')).toBeTruthy();
    expect(screen.getByTestId('wesen-task-pyjama')).toBeTruthy();
    expect(screen.queryByTestId('wesen-task-cuddle')).toBeNull();
    expect(screen.queryByTestId('wesen-task-packcheck')).toBeNull();
    expect(screen.queryByTestId('wesen-task-wash')).toBeNull(); // not in this routine
    fireEvent.click(screen.getByTestId('wesen-task-teeth_pm'));
    expect(wesenPickTask).toHaveBeenCalledWith('teeth_pm');
    expect(screen.getAllByText(/Allein heißt: Louis putzt abends/).length).toBe(1);
  });

  it('shows parents the count, never a date for the "allein" question ahead of time', () => {
    const friend = { id: 'w1', creatureId: 'tropfi', taskKind: 'teeth_pm', stepDays: ['2026-09-27', '2026-09-28'], pickedAt: '2026-09-27T06:00:00Z' };
    render(<WesenParentSection state={base({ offered: true, enabled: true, friends: [friend] })} actions={{}} />);
    expect(screen.getByTestId('wesen-status').textContent).toContain('2 von 5');
    expect(screen.queryByTestId('wesen-alone-yes')).toBeNull();
  });

  it('offers a restore for a moved-out task', () => {
    const wesenRestore = vi.fn();
    const friend = {
      id: 'w1', creatureId: 'glutfunke', taskKind: 'teeth_pm', stepDays: [], pickedAt: '2026-09-27T06:00:00Z',
      besideAt: '2026-10-01T06:00:00Z', aloneAt: '2026-10-09T06:00:00Z', moveOutConfirmedAt: '2026-12-04T19:00:00Z', movedOutAt: '2026-12-05',
    };
    render(<WesenParentSection state={base({ offered: true, enabled: true, friends: [friend] })} actions={{ wesenRestore }} />);
    fireEvent.click(screen.getByTestId('wesen-restore-w1'));
    expect(wesenRestore).toHaveBeenCalledWith('w1');
  });
});
