import React from 'react';
import { T } from '../constants';
import { ViewHeader } from './ui';
import useWeather, { getWeatherInfo, getClothingRecs } from '../hooks/useWeather';
import { useGame } from '../context/GameContext';

const DAY_NAMES = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export default function Weather() {
  const { ui } = useGame();
  const { weather, loading, error } = useWeather();

  if (loading) {
    return (
      <div className="view-enter" style={{ minHeight: "100vh", padding: "12px 16px 100px", background: "#EFF3FB" }}>
        <ViewHeader onBack={() => ui.setView("hub")} title="Wetter" />
        <div style={{ textAlign: "center", padding: 40, color: T.textSecondary }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{"\u{1F324}\uFE0F"}</div>
          <div style={{ fontWeight: 700 }}>Wetter wird geladen...</div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="view-enter" style={{ minHeight: "100vh", padding: "12px 16px 100px", background: "#EFF3FB" }}>
        <ViewHeader onBack={() => ui.setView("hub")} title="Wetter" />
        <div style={{ textAlign: "center", padding: 40, color: T.textSecondary }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{"\u{1F327}\uFE0F"}</div>
          <div style={{ fontWeight: 700 }}>Wetter nicht verfügbar</div>
          <div style={{ fontSize: ".8rem", marginTop: 4 }}>Prüfe deine Internetverbindung</div>
        </div>
      </div>
    );
  }

  const { current, daily } = weather;
  const currentInfo = getWeatherInfo(current.weatherCode);
  const clothes = getClothingRecs(current.temp, current.feelsLike, current.weatherCode, current.windSpeed);

  // Temperature color
  const tempColor = current.temp < 0 ? "#60A5FA" : current.temp < 10 ? "#38BDF8" : current.temp < 18 ? "#34D399" : current.temp < 25 ? "#F59E0B" : "#EF4444";

  return (
    <div className="view-enter" style={{ minHeight: "100vh", padding: "12px 16px 100px", background: "#EFF3FB" }}>
      <ViewHeader onBack={() => ui.setView("hub")} title="Wetter" />

      {/* ── Current Weather Card ── */}
      <div className="game-card" style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}>
        {/* Top: big temperature display */}
        <div style={{
          background: `linear-gradient(135deg, ${tempColor}15, ${tempColor}08)`,
          padding: "20px 20px 16px",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>{currentInfo.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "2.8rem", fontWeight: 700, color: tempColor, lineHeight: 1 }}>{current.temp}°</div>
            <div style={{ fontSize: ".8rem", color: T.textSecondary, fontWeight: 600 }}>Fühlt sich an wie {current.feelsLike}°</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: ".85rem", color: T.textPrimary }}>{currentInfo.label}</div>
            <div style={{ fontSize: ".7rem", color: T.textSecondary, fontWeight: 600, marginTop: 2 }}>Unterföhring</div>
          </div>
        </div>

        {/* Weather details row */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 16px", borderTop: "2px solid rgba(180,120,40,0.06)" }}>
          {[
            { icon: "\u{1F4A8}", value: `${current.windSpeed} km/h`, label: "Wind" },
            { icon: "\u{1F4A7}", value: `${current.humidity}%`, label: "Feuchtigkeit" },
            { icon: "\u{1F321}\uFE0F", value: `${daily[0]?.tempMax}°/${daily[0]?.tempMin}°`, label: "Max/Min" },
            { icon: "\u{1F327}\uFE0F", value: `${daily[0]?.precipProb || 0}%`, label: "Regen" },
          ].map((d, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1rem" }}>{d.icon}</div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".8rem", fontWeight: 700, color: T.textPrimary }}>{d.value}</div>
              <div style={{ fontSize: ".55rem", fontWeight: 700, color: T.textLight }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3-Day Forecast ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {daily.map((day, i) => {
          const info = getWeatherInfo(day.weatherCode);
          const dateObj = new Date(day.date);
          const dayName = i === 0 ? "Heute" : DAY_NAMES[dateObj.getDay()];
          return (
            <div key={i} className="game-card" style={{ flex: 1, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: ".7rem", fontWeight: 800, color: i === 0 ? T.primary : T.textSecondary, textTransform: "uppercase", marginBottom: 6 }}>{dayName}</div>
              <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{info.emoji}</div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".85rem", fontWeight: 700, color: T.textPrimary }}>{day.tempMax}°</div>
              <div style={{ fontSize: ".7rem", color: T.textLight, fontWeight: 600 }}>{day.tempMin}°</div>
              {day.precipProb > 30 && <div style={{ fontSize: ".6rem", color: "#3B82F6", fontWeight: 700, marginTop: 4 }}>{"\u{1F4A7}"} {day.precipProb}%</div>}
            </div>
          );
        })}
      </div>

      {/* ── What to Wear ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: ".85rem", color: "#1E1B4B", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.1rem" }}>{"\u{1F455}"}</span>
          Was soll ich heute anziehen?
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {clothes.map((item, i) => (
            <div key={i} className="game-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: `${tempColor}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: ".9rem", color: T.textPrimary }}>{item.name}</div>
                <div style={{ fontSize: ".7rem", color: T.textSecondary, fontWeight: 600 }}>{item.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div style={{ textAlign: "center", fontSize: ".7rem", color: "#94A3B8", marginTop: 16, fontStyle: "italic" }}>
        {current.temp >= 20 && current.weatherCode <= 3
          ? "\u2600\uFE0F Vergiss die Sonnencreme nicht!"
          : current.temp < 5
          ? "\u2744\uFE0F Zieh dich warm an — es ist kalt draußen!"
          : "\u{1F43E} Deine Katze findet, du siehst toll aus!"}
      </div>
    </div>
  );
}
