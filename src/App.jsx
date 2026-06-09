import React from 'react';
import Delta7Synth from './components/Delta7Synth.jsx';

export default function App() {
  return (
    <div className="standalone-container">
      <header className="standalone-header">
        <h1>Delta7 Workstation</h1>
      </header>

      <main className="standalone-main">
        <Delta7Synth />
      </main>

      <footer className="standalone-footer">
        <p>© 2026 Rotor Delta. Powered by Web Audio API & WebMIDI API.</p>
      </footer>

      <style>{`
        .standalone-container {
          background-color: #000000;
          color: #ffffff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
          overflow-y: auto;
        }

        .standalone-header {
          text-align: center;
          margin-bottom: 1rem;
        }

        .standalone-header h1 {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 1.8rem;
          color: #ffffff;
          letter-spacing: 2px;
          margin-bottom: 0.25rem;
          text-shadow: 0 0 8px #00f3ff;
          text-transform: uppercase;
        }

        .standalone-header p {
          font-size: 0.8rem;
          color: #ff00ff;
          text-shadow: 0 0 5px rgba(255, 0, 255, 0.4);
          letter-spacing: 1px;
        }

        .standalone-main {
          width: 100%;
          display: flex;
          justify-content: center;
          flex-grow: 1;
          margin: 1rem 0;
        }

        .standalone-footer {
          text-align: center;
          font-size: 0.7rem;
          color: #55aaff;
          margin-top: 1rem;
          text-shadow: 0 0 3px rgba(85, 170, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
