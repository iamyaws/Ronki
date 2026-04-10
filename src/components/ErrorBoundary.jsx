import React from 'react';
import { T } from '../constants';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: 32,
          background: T.bg, fontFamily: "'Nunito',sans-serif", color: T.textPrimary,
          textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>{"\u{1F431}"}</div>
          <h2 style={{
            fontFamily: "'Fredoka',sans-serif", fontWeight: 800,
            fontSize: "1.2rem", marginBottom: 8,
          }}>
            Ups! Da ist etwas schiefgelaufen.
          </h2>
          <p style={{ fontSize: ".85rem", color: T.textSecondary, marginBottom: 24, maxWidth: 320 }}>
            Keine Sorge, deine Daten sind sicher gespeichert. Versuche es nochmal!
          </p>
          <button
            onClick={this.handleReset}
            style={{
              background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`,
              border: "none", borderRadius: 50, padding: "14px 32px",
              color: "white", fontWeight: 800, fontSize: ".95rem", cursor: "pointer",
              fontFamily: "'Fredoka',sans-serif", minHeight: 48,
              boxShadow: `0 8px 24px ${T.primary}40`,
            }}
          >
            Nochmal versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
