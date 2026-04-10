import React from 'react';
import { T } from './constants';
import { GameProvider, useGame } from './context/GameContext';
import SFX from './utils/sfx';

import Onboarding from './components/Onboarding';
import Hub from './components/Hub';
import QuestBoard from './components/QuestBoard';
import TimeBank from './components/TimeBank';
import Achievements from './components/Achievements';
import Room from './components/Room';
import Shop from './components/Shop';
import Journal from './components/Journal';
import VictoryScreen from './components/VictoryScreen';
import Celebration from './components/Celebration';
import { RareDropToast } from './components/Celebration';
import SpinWheel from './components/SpinWheel';
import SurpriseChest from './components/SurpriseChest';
import PinModal from './components/PinModal';
import MemoryGame from './components/MemoryGame';
import Weather from './components/Weather';
import CatCare from './components/CatCare';
import CompanionProfile from './components/CompanionProfile';
import Familienregeln from './components/Familienregeln';
import BossChest from './components/BossChest';
import EvolutionCelebration from './components/EvolutionCelebration';
import ErrorBoundary from './components/ErrorBoundary';

// ── SVG Tab Icons (consistent, themeable, cross-platform) ──
const TabIconWeather = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#B45309" : "#9C977E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/>
  </svg>
);
const TabIconTrophy = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#B45309" : "#9C977E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22m10 0c0-2-.85-3.25-2.03-3.79A1.07 1.07 0 0 1 14 17v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);
const TabIconHome = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#B45309" : "#9C977E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const TabIconBox = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#B45309" : "#9C977E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
  </svg>
);

const TABS = [
  { id: "weather", label: "Wetter", Icon: TabIconWeather },
  { id: "stats", label: "Erfolge", Icon: TabIconTrophy },
  { id: "quest", label: "", icon: null, isCta: true },
  { id: "room", label: "Zimmer", Icon: TabIconHome },
  { id: "shop", label: "Sammlung", Icon: TabIconBox },
];

function BottomTabBar() {
  const { ui } = useGame();
  const { view, setView, setQuestOpen } = ui;
  return (
    <div className="tab-bar">
      {TABS.map(tab => {
        if (tab.isCta) {
          return (
            <button key={tab.id} className="tab-cta" onClick={() => { SFX.play("tap"); setQuestOpen(true); }} aria-label="Aufgaben öffnen">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </button>
          );
        }
        const isActive = view === tab.id;
        return (
          <button key={tab.id} className={`tab-item ${isActive ? "tab-item-active" : ""}`} onClick={() => { SFX.play("tap"); setView(tab.id); }} aria-label={tab.label}>
            <div className={`tab-icon ${isActive ? "tab-icon-active" : ""}`}><tab.Icon active={isActive} /></div>
            <span className={`tab-label ${isActive ? "tab-label-active" : ""}`}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function AppContent() {
  const { state, boarding, computed, actions, onBoard, ui } = useGame();
  if (boarding === null) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#FFF8F0", color: "#1E1B4B", fontFamily: "'Nunito',sans-serif", fontSize: "1.2rem", fontWeight: 700 }}>Laden...</div>;
  if (boarding) return <Onboarding onComplete={onBoard} />;
  if (!state) return null;
  const showChrome = !boarding && state;
  return (
    <>
      <Celebration active={ui.celeb} onDone={() => ui.setCeleb(false)} />
      <RareDropToast drop={ui.rareDrop} onDone={() => ui.setRareDrop(null)} />
      {ui.showWheel && <SpinWheel onResult={actions.collectWheel} />}
      {ui.showChest && <SurpriseChest onOpen={actions.collectChest} streakDays={state.sd} />}
      {ui.pinShow && <PinModal pin={ui.pin} setPin={ui.setPin} onSuccess={() => { ui.setPMode(true); ui.setPinShow(false); }} onClose={() => { ui.setPinShow(false); ui.setPin(""); }} />}
      {ui.showVictory && <VictoryScreen onClose={() => ui.setShowVictory(false)} onSpinWheel={() => { ui.setShowVictory(false); ui.setShowWheel(true); }} onMemoryGame={() => { ui.setShowVictory(false); ui.setShowMemory(true); }} />}
      {ui.showMemory && <MemoryGame onComplete={actions.collectMemory} />}
      {state.bossDefeatReward && <BossChest bossName={state.bossDefeatReward.bossName} bossIcon={state.bossDefeatReward.bossIcon} hpReward={state.bossDefeatReward.hp} unlockedItem={state.bossDefeatReward.item} onClose={() => actions.clearBossReward()} />}
      {state.evolutionEvent && (
        <EvolutionCelebration
          companionType={state.companionType || "cat"}
          companionVariant={state.catVariant}
          oldStage={state.evolutionEvent.oldStage}
          newStage={state.evolutionEvent.newStage}
          newBossTier={state.evolutionEvent.newBossTier}
          onClose={() => actions.clearEvolution()}
        />
      )}
      <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: "'Nunito',sans-serif", color: T.textPrimary, paddingTop: ui.view === "hub" ? 0 : 60, paddingBottom: 80 }}>
        {ui.view === "hub" && <Hub />}
        {ui.view === "time" && <TimeBank />}
        {ui.view === "stats" && <Achievements />}
        {ui.view === "room" && <Room />}
        {ui.view === "shop" && <Shop />}
        {ui.view === "journal" && <Journal />}
        {ui.view === "weather" && <Weather />}
        {ui.view === "cat" && <CatCare />}
        {ui.view === "companion" && <CompanionProfile />}
        {ui.view === "regeln" && <Familienregeln />}
        {ui.questOpen && <QuestBoard />}
      </div>
      {showChrome && <BottomTabBar />}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ErrorBoundary>
  );
}
