import React from 'react';
import { T } from '../constants';
import { ViewHeader } from './ui';
import { useGame } from '../context/GameContext';

const SECTIONS = [
  {
    emoji: "\uD83D\uDC9B",
    title: "Was uns als Familie gl\u00FCcklich macht",
    highlight: true,
    content: "Lieb zueinander sein. Sich M\u00FChe geben. Zeit miteinander verbringen.\nDas ist wichtiger als alles andere auf der Welt.",
    affirmation: "\u2728 Ich bin geliebt, so wie ich bin.",
  },
  {
    emoji: "1\uFE0F\u20E3",
    title: "Was kommt zuerst?",
    items: [
      { icon: "\uD83D\uDE34", text: "Gut schlafen \u2014 damit du Energie hast" },
      { icon: "\uD83E\uDD66", text: "Gesund essen \u2014 damit du stark wirst" },
      { icon: "\uD83C\uDFC3", text: "Drau\u00DFen spielen \u2014 damit dein K\u00F6rper sich freut" },
      { icon: "\uD83D\uDCDA", text: "Lernen \u2014 damit du die Welt verstehst" },
      { icon: "\uD83E\uDDF9", text: "Mithelfen \u2014 weil wir ein Team sind" },
    ],
    footer: "Wenn diese Sachen erledigt sind, kommt alles andere.",
    affirmation: "\uD83D\uDCAA Ich schaffe das \u2014 Schritt f\u00FCr Schritt!",
  },
  {
    emoji: "2\uFE0F\u20E3",
    title: "Was uns stolz macht",
    wish: [
      "Wenn du deine Aufgaben mit guter Laune machst",
      "Wenn du aufh\u00F6rst, obwohl du gerne weitermachen w\u00FCrdest",
      "Wenn du selbst gute Entscheidungen triffst",
      "Wenn du kreativ bist und gut mit anderen zusammenarbeitest",
      "Wenn du ehrlich bist \u2014 auch wenn es schwer ist",
    ],
    worry: [
      "Wenn du Sachen versteckst oder heimlich machst",
      "Wenn Wut st\u00E4rker wird als du",
      "Wenn du nur noch an Bildschirme denkst",
      "Wenn du wichtige Dinge vergisst",
    ],
    affirmation: "\uD83C\uDF1F Ich kann stolz auf mich sein!",
  },
  {
    emoji: "3\uFE0F\u20E3",
    title: "Fehler geh\u00F6ren dazu",
    items: [
      { icon: "\uD83D\uDCAC", text: "Sag uns, was passiert ist" },
      { icon: "\uD83E\uDD1D", text: "Wir reden zusammen dar\u00FCber" },
      { icon: "\uD83D\uDD04", text: "Morgen versuchst du es nochmal" },
    ],
    footer: "Jeder macht Fehler \u2014 Mama und Papa auch! Wichtig ist, dass wir ehrlich zueinander sind.",
    affirmation: "\uD83C\uDF31 Aus Fehlern wachse ich!",
  },
  {
    emoji: "4\uFE0F\u20E3",
    title: "Du darfst Kind sein",
    items: [
      { icon: "\uD83C\uDF88", text: "Spielen, lachen, Spa\u00DF haben" },
      { icon: "\uD83D\uDCA1", text: "Neues lernen und ausprobieren" },
      { icon: "\uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1", text: "Freundschaften pflegen" },
      { icon: "\uD83C\uDF1F", text: "Kleine Entscheidungen selber treffen" },
    ],
    footer: "Um die gro\u00DFen Sachen k\u00FCmmern sich Mama & Papa. Du musst dir keine Sorgen machen.",
    affirmation: "\uD83E\uDD8B Ich bin ein Kind \u2014 und das ist wunderbar!",
  },
  {
    emoji: "\uD83E\uDD17",
    title: "Unser Versprechen an dich",
    highlight: true,
    content: "Wir sind immer f\u00FCr dich da \u2014 egal was passiert.\nWir helfen dir beim Lernen, Wachsen und Gro\u00DFwerden.\nWenn du unsicher bist: frag einfach. Zusammen finden wir immer einen Weg.",
    affirmation: "\uD83D\uDC9B Ich bin nicht allein. Liam, Papa und Mama sind immer f\u00FCr mich da und lieben mich.",
  },
];

export default function Familienregeln() {
  const { ui } = useGame();

  return (
    <div className="view-enter" style={{ minHeight: "100vh" }}>
      <ViewHeader title="Helden-Kodex" icon="🛡️" onBack={() => ui.setView("hub")} />

      <div style={{ padding: "0 16px 100px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20, padding: "0 8px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🛡️</div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: "1.3rem", fontWeight: 700,
            color: T.textPrimary, lineHeight: 1.3,
          }}>
            Helden-Kodex
          </div>
          <div style={{
            fontSize: "1rem", color: T.textSecondary, fontWeight: 600, marginTop: 4,
          }}>
            Der Kodex eines wahren Helden
          </div>
        </div>

        {SECTIONS.map((section, i) => (
          <div key={i} className="game-card" style={{
            padding: 18, marginBottom: 14,
            background: section.highlight
              ? "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(245,158,11,0.05))"
              : "white",
            borderColor: section.highlight ? "rgba(245,158,11,0.20)" : undefined,
          }}>
            {/* Section title */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: "1.6rem" }}>{section.emoji}</span>
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700,
                color: section.highlight ? "#B45309" : T.primary,
              }}>
                {section.title}
              </div>
            </div>

            {/* Highlighted content (intro + outro sections) */}
            {section.content && (
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 600,
                color: T.textPrimary, lineHeight: 1.5,
                padding: "0 4px",
              }}>
                {section.content.split("\n").map((line, j) => (
                  <div key={j} style={{ marginBottom: j === 0 ? 8 : 0 }}>{line}</div>
                ))}
              </div>
            )}

            {/* Item list (checkmarks) */}
            {section.items && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {section.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{item.icon}</span>
                    <span style={{
                      fontFamily: "'Nunito',sans-serif", fontSize: "1.05rem", fontWeight: 700,
                      color: T.textPrimary,
                    }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Wish list (what makes us proud) */}
            {section.wish && (
              <div style={{ marginBottom: section.worry ? 14 : 0 }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: ".9rem", fontWeight: 800,
                  color: "#059669", textTransform: "uppercase", marginBottom: 8,
                }}>
                  {"\uD83D\uDE0A"} Das macht uns stolz:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {section.wish.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingLeft: 4 }}>
                      <span style={{ color: "#059669", fontWeight: 800, fontSize: "1rem", lineHeight: 1.4 }}>{"\u2714\uFE0F"}</span>
                      <span style={{
                        fontFamily: "'Nunito',sans-serif", fontSize: "1.05rem", fontWeight: 700,
                        color: T.textPrimary, lineHeight: 1.4,
                      }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Worry list (what concerns us) */}
            {section.worry && (
              <div>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: ".9rem", fontWeight: 800,
                  color: "#B45309", textTransform: "uppercase", marginBottom: 8,
                }}>
                  {"\uD83D\uDE1F"} Das macht uns Sorgen:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {section.worry.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingLeft: 4 }}>
                      <span style={{ color: "#B45309", fontWeight: 800, fontSize: "1rem", lineHeight: 1.4 }}>{"\u26A0\uFE0F"}</span>
                      <span style={{
                        fontFamily: "'Nunito',sans-serif", fontSize: "1.05rem", fontWeight: 700,
                        color: T.textPrimary, lineHeight: 1.4,
                      }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            {section.footer && (
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 600,
                color: section.highlight ? "#B45309" : T.primary,
                marginTop: 12, paddingTop: 10,
                borderTop: "2px solid rgba(180,120,40,0.08)",
              }}>
                {section.footer}
              </div>
            )}

            {/* Affirmation */}
            {section.affirmation && (
              <div style={{
                marginTop: 12, padding: "10px 14px",
                background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(255,215,0,0.08))",
                borderRadius: 14,
                fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700,
                color: "#92400E", textAlign: "center",
              }}>
                {section.affirmation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
