import React from 'react';
import { useTask } from '../context/TaskContext';
import { useAnalytics } from '../hooks/useAnalytics';

export default function PinModal({ pin, setPin, onSuccess, onClose }) {
  // PIN validation — accepts either the custom parentPin (once set during
  // Track A or via Parental Dashboard) or the default "1234" while
  // parentPinIsDefault is still true. Existing users who haven't set a
  // custom PIN keep working because parentPin is null and parentPinIsDefault
  // is true. Once a parent sets a PIN, 1234 stops working.
  const { state } = useTask();
  const { track } = useAnalytics();
  const expectedPin = state?.parentPin || '1234';
  const isDefault = state?.parentPinIsDefault !== false;

  const handleKey = (n) => {
    if (n === null) return;
    if (n === "⌫") { setPin(p => p.slice(0, -1)); return; }
    const nx = pin + n;
    setPin(nx);
    if (nx.length === 4) {
      const ok = nx === expectedPin || (isDefault && nx === '1234');
      // Analytics: parent.pin.enter. Fire once per completed 4-digit
      // attempt with success=true|false. The digits themselves never
      // leave the device — we only record whether the attempt matched.
      // Useful for spotting brute-force guessing patterns (many fails)
      // vs. parent forgetting their PIN.
      track('parent.pin.enter', { success: !!ok });
      if (ok) { onSuccess(); }
      setPin("");
    }
  };

  // Bilderbuch look (25 Sep 2026): white card with an ink outline and
  // 28 px corners, paper keys with a press edge, Fredoka digits. Logic
  // above is untouched.
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(4,34,94,0.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .2s ease' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Eltern-PIN"
        className="bg-white text-ink border-[3px] border-ink rounded-[28px] bb-lift"
        style={{ padding: 24, textAlign: 'center', minWidth: 288 }}
      >
        <div className="bb-display text-2xl" style={{ marginBottom: 16 }}>Eltern-PIN</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="bg-paper-warm border-[2.5px] border-ink font-headline font-bold text-cobalt"
              style={{ width: 48, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}
            >
              {pin[i] ? "●" : ""}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, maxWidth: 232, margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((n, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleKey(n)}
              aria-label={n === "⌫" ? 'Löschen' : undefined}
              className={n === null ? '' : 'bg-paper text-ink border-[2.5px] border-ink bb-press font-headline font-bold'}
              style={{
                borderRadius: 14,
                padding: '12px 0',
                fontSize: '1.3rem',
                cursor: n === null ? 'default' : 'pointer',
                visibility: n === null ? 'hidden' : 'visible',
                minHeight: 52,
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
