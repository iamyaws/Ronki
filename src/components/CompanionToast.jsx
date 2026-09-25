import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import RonkiPortrait from './RonkiPortrait';
import DoodleIcon from './bilderbuch/DoodleIcon';

// Doodle per message (Bilderbuch, 25 Sep 2026): the drawn marks replace
// the Material glyphs. Keys and timing are unchanged.
const MESSAGES = [
  { key: 'toast.stronger', icon: 'bolt', tone: 'text-cobalt' },
  { key: 'toast.proud', icon: 'heart', tone: 'text-ember' },
  { key: 'toast.energy', icon: 'flame', tone: 'text-ember' },
  { key: 'toast.joyful', icon: 'sparkle', tone: 'text-sun-deep' },
  { key: 'toast.wellDone', icon: 'star', tone: 'text-sun-deep' },
  { key: 'toast.growing', icon: 'leaf', tone: 'text-leaf' },
];

export default function CompanionToast({ trigger }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState(MESSAGES[0]);
  const [lastTrigger, setLastTrigger] = useState(0);

  useEffect(() => {
    if (trigger > lastTrigger && trigger > 0) {
      setLastTrigger(trigger);
      setMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [trigger, lastTrigger]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] animate-slide-in-toast pointer-events-none">
      <div className="flex items-center gap-3 pl-3 pr-5 py-2.5 rounded-full bg-white border-[3px] border-ink">
        <div className="shrink-0" style={{ width: 36, height: 36 }}>
          <RonkiPortrait size={36} bare />
        </div>
        <span className={msg.tone} aria-hidden="true">
          <DoodleIcon name={msg.icon} size={22} filled={msg.icon === 'star' || msg.icon === 'heart' || msg.icon === 'sparkle'} />
        </span>
        <span className="font-headline font-bold text-lg text-ink whitespace-nowrap">{t(msg.key)}</span>
      </div>
    </div>
  );
}
