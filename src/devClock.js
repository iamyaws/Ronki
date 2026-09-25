/**
 * DEV-only clock shift for browser tests of the Finch-pass loop
 * (26 Sep 2026). `?clock=2026-09-28T07:10` moves the whole app's Date
 * (TaskContext's day keys and the loop's blocks alike) to that moment
 * and lets it run on from there. The offset survives reloads in the
 * same tab (sessionStorage), so a test can walk from morning to evening
 * with a second `?clock=`. `?clock=off` clears it.
 *
 * Imported first in main.jsx. In a production build the whole body is
 * dead code: `import.meta.env.DEV` is false and nothing is patched.
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const KEY = 'ronki_dev_clock_offset';
  let offset = 0;
  try {
    const raw = new URLSearchParams(window.location.search).get('clock');
    if (raw === 'off') {
      sessionStorage.removeItem(KEY);
    } else if (raw) {
      const target = new Date(raw).getTime();
      if (!Number.isNaN(target)) {
        offset = target - Date.now();
        sessionStorage.setItem(KEY, String(offset));
      }
    } else {
      offset = Number(sessionStorage.getItem(KEY) || 0) || 0;
    }
  } catch { /* private mode: no shift */ }

  if (offset !== 0) {
    const RealDate = Date;
    // eslint-disable-next-line no-global-assign
    class ShiftedDate extends RealDate {
      constructor(...args) {
        if (args.length === 0) super(RealDate.now() + offset);
        else super(...args);
      }
      static now() { return RealDate.now() + offset; }
    }
    globalThis.Date = ShiftedDate;
    // eslint-disable-next-line no-console
    console.info('[devClock] app clock set to', new ShiftedDate().toString());
  }
}
