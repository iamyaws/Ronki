import React from 'react';
import { useGame } from '../context/GameContext';
import SFX from '../utils/sfx';

const TABS = [
  { id: 'hub',       label: 'Hub',     icon: 'grid_view' },
  { id: 'quest',     label: 'Quests',  icon: 'swords' },
  { id: 'room',      label: 'Room',    icon: 'potted_plant' },
  { id: 'shop',      label: 'Shop',    icon: 'shopping_bag' },
  { id: 'journal',   label: 'Journal', icon: 'menu_book' },
];

export default function MysticNavBar() {
  const { ui } = useGame();
  const { view, setView, setQuestOpen } = ui;

  const getIsActive = (tabId) => {
    if (tabId === 'hub') return view === 'hub';
    if (tabId === 'quest') return view === 'quest' || ui.questOpen;
    if (tabId === 'shop') return view === 'shop' || view === 'time';
    return view === tabId;
  };

  const handleClick = (tabId) => {
    SFX.play('tap');
    if (tabId === 'quest') {
      setQuestOpen(true);
    } else if (tabId === 'shop') {
      setView('shop');
    } else {
      setView(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-8px_24px_rgba(30,27,23,0.04)]">
      <div className="flex justify-around items-end px-4 pb-6 pt-2"
           style={{ paddingBottom: `max(1.5rem, env(safe-area-inset-bottom, 1.5rem))` }}>
        {TABS.map(tab => {
          const isActive = getIsActive(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              aria-label={tab.label}
              className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                isActive
                  ? 'bg-primary-container text-white rounded-full p-3 transform scale-110 -translate-y-2'
                  : 'text-on-surface/50 hover:text-primary'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="font-label text-[11px] font-bold uppercase tracking-wider mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
