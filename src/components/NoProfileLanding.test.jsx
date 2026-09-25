// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';

const mocks = vi.hoisted(() => ({ setActiveToken: null, track: null, playLocalized: null }));
vi.mock('../lib/profileToken', () => {
  mocks.setActiveToken = vi.fn();
  return { setActiveToken: mocks.setActiveToken };
});
vi.mock('../lib/analytics', () => {
  mocks.track = vi.fn();
  return { track: mocks.track };
});
vi.mock('../utils/voiceAudio', () => {
  mocks.playLocalized = vi.fn();
  return { default: { play: vi.fn(), playLocalized: mocks.playLocalized, stop: vi.fn(), isMuted: () => false } };
});

import NoProfileLanding, { tokenFromPasted } from './NoProfileLanding';
import { lineText } from '../data/ronkiLines';

const TOKEN = 'a3f7c2e1b9d5408f2761c8e4ab90f3d6';

function typeCode(value) {
  fireEvent.change(screen.getByLabelText('Profil-Code oder Link einfügen'), { target: { value } });
  fireEvent.click(screen.getByText('Öffnen').closest('button'));
}

describe('NoProfileLanding as the scan sheet', () => {
  let savedMedia;
  beforeEach(() => {
    mocks.setActiveToken.mockClear();
    mocks.track.mockClear();
    mocks.playLocalized.mockClear();
    savedMedia = navigator.mediaDevices;
  });
  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', { value: savedMedia, configurable: true });
  });

  it('a full share link calls setActiveToken and reloads, after onBeforeOpen', () => {
    const reload = vi.fn();
    const order = [];
    const onBeforeOpen = vi.fn(() => order.push('before'));
    mocks.setActiveToken.mockImplementation(() => order.push('token'));
    render(<NoProfileLanding reload={reload} onBeforeOpen={onBeforeOpen} />);
    typeCode(`https://app.ronki.de/?p=${TOKEN}`);
    expect(mocks.setActiveToken).toHaveBeenCalledWith(TOKEN);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['before', 'token']);
    mocks.setActiveToken.mockImplementation(() => {});
  });

  it('a bare token (any case, with spaces) works too', () => {
    const reload = vi.fn();
    render(<NoProfileLanding reload={reload} />);
    typeCode(`  ${TOKEN.toUpperCase().slice(0, 16)} ${TOKEN.toUpperCase().slice(16)} `);
    expect(mocks.setActiveToken).toHaveBeenCalledWith(TOKEN);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('rejects text that holds no token', () => {
    const reload = vi.fn();
    render(<NoProfileLanding reload={reload} />);
    typeCode('hallo');
    expect(mocks.setActiveToken).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('tokenFromPasted reads every form', () => {
    expect(tokenFromPasted(TOKEN)).toBe(TOKEN);
    expect(tokenFromPasted(`https://app.ronki.de/?p=${TOKEN}`)).toBe(TOKEN);
    expect(tokenFromPasted(`app.ronki.de/?p=${TOKEN}`)).toBe(TOKEN);
    expect(tokenFromPasted(`a3f7-c2e1-b9d5-408f-2761-c8e4-ab90-f3d6`)).toBe(TOKEN);
    expect(tokenFromPasted('a3f7-c2e1')).toBeNull();
    expect(tokenFromPasted('')).toBeNull();
  });

  it("a denied camera shows and speaks Ronki's kid line and keeps the code field", async () => {
    const err = Object.assign(new Error('denied'), { name: 'NotAllowedError' });
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn(() => Promise.reject(err)) },
      configurable: true,
    });
    render(<NoProfileLanding reload={vi.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByText('QR-Code scannen').closest('button'));
    });
    expect(await screen.findByText(lineText('scan_camera_sleep_01'))).toBeTruthy();
    expect(mocks.playLocalized).toHaveBeenCalledWith('scan_camera_sleep_01', 200);
    expect(screen.getByLabelText('Profil-Code oder Link einfügen')).toBeTruthy();
    const names = mocks.track.mock.calls.map(c => c[0]);
    expect(names).toContain('onboarding.landing.view');
    expect(names).toContain('onboarding.scan.start');
    expect(mocks.track).toHaveBeenCalledWith('onboarding.scan.result', { result: 'denied' });
  });

  it('no camera at all also gets the kid line (result failed)', async () => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
    render(<NoProfileLanding reload={vi.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByText('QR-Code scannen').closest('button'));
    });
    expect(await screen.findByText(lineText('scan_camera_sleep_01'))).toBeTruthy();
    expect(mocks.track).toHaveBeenCalledWith('onboarding.scan.result', { result: 'failed' });
  });

  it('"Zurück zum Ei" shows only with onBack and calls it', () => {
    const onBack = vi.fn();
    const { unmount } = render(<NoProfileLanding onBack={onBack} reload={vi.fn()} />);
    fireEvent.click(screen.getByText('Zurück zum Ei').closest('button'));
    expect(onBack).toHaveBeenCalledTimes(1);
    unmount();
    render(<NoProfileLanding reload={vi.fn()} />);
    expect(screen.queryByText('Zurück zum Ei')).toBeNull();
  });
});
