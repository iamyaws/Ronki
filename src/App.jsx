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
import TopAppBar from './components/TopAppBar';
import MysticNavBar from './components/MysticNavBar';

function AppContent() {
  const { state, boarding, computed, actions, onBoard, ui } = useGame();
  if (boarding === null) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#FFF8F0", color: "#1E1B4B", fontFamily: "'Nunito',sans-serif", fontSize: "1.2rem", fontWeight: 700 }}>Laden...</div>;
  if (boarding) return <div className="max-w-lg mx-auto"><Onboarding onComplete={onBoard} /></div>;
  if (!state) return null;
  const showChrome = !boarding && state;
  return (
    <>
      <Celebration active={ui.celeb} onDone={() => ui.setCeleb(false)} />

      {ui.showChest && <SurpriseChest onOpen={actions.collectChest} streakDays={state.sd} />}
      {ui.pinShow && <PinModal pin={ui.pin} setPin={ui.setPin} onSuccess={() => { ui.setPMode(true); ui.setPinShow(false); }} onClose={() => { ui.setPinShow(false); ui.setPin(""); }} />}
      {ui.showVictory && <VictoryScreen onClose={() => ui.setShowVictory(false)} onMemoryGame={() => { ui.setShowVictory(false); ui.setShowMemory(true); }} />}
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
      {showChrome && <TopAppBar />}
      <div className="min-h-screen bg-surface font-body text-on-surface max-w-lg mx-auto" style={{ paddingTop: showChrome ? 72 : 0, paddingBottom: showChrome ? 96 : 0 }}>
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
      {showChrome && <MysticNavBar />}
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
