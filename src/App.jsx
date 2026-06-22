import React, { useState, useRef, useEffect } from 'react';
import Delta7Synth from './components/Delta7Synth.jsx';

export default function App() {
  const [appState, setAppState] = useState('splash'); // 'splash' | 'video' | 'fading' | 'ready'
  const videoRef = useRef(null);

  const startIntro = () => {
    // Resume audio context pre-emptively on user click if available
    if (window.AudioContext || window.webkitAudioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const tempCtx = new AudioContextClass();
      tempCtx.resume().then(() => tempCtx.close());
    }
    setAppState('video');
  };

  useEffect(() => {
    if (appState === 'video' && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn("Autoplay blocked or failed, skipping intro:", err);
        setAppState('ready');
      });
    }
  }, [appState]);

  const handleVideoEnd = () => {
    setAppState('fading');
    setTimeout(() => {
      setAppState('ready');
    }, 1000); // 1s fade out
  };

  const skipIntro = () => {
    setAppState('fading');
    setTimeout(() => {
      setAppState('ready');
    }, 800); // slightly faster fade out on skip
  };

  return (
    <div className="standalone-container">
      {appState !== 'ready' && (
        <div className={`intro-overlay-container ${appState === 'fading' ? 'fade-out' : ''}`}>
          {appState === 'splash' && (
            <div className="splash-card">
              <div className="logo-glow">delta7</div>
              <div className="subtitle-glow">HYPER INTEGRATED SYNTHESIS WORKSTATION</div>
              <p className="splash-desc">
                An advanced physical synthesis and loop workstation with integrated Kaoss Pad, master bus dynamics, and latency-compensated looper.
              </p>
              <button className="start-btn" onClick={startIntro}>
                ⚡ ENTER WORKSTATION
              </button>
            </div>
          )}

          {appState === 'video' && (
            <div className="video-viewport">
              <video
                ref={videoRef}
                src="./introvideo.mp4"
                className="fullscreen-video"
                onEnded={handleVideoEnd}
                playsInline
                autoPlay
              />
              <button className="skip-btn" onClick={skipIntro}>
                Skip Intro ⏭️
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Workstation app - render when splash/intro is finished */}
      {(appState === 'ready' || appState === 'fading') && (
        <main className="standalone-main">
          <Delta7Synth />
        </main>
      )}

      {(appState === 'ready' || appState === 'fading') && (
        <footer className="standalone-footer">
          <p>© 2026 Rotor Delta. Powered by Web Audio API & WebMIDI API.</p>
        </footer>
      )}

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
          position: relative;
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

        /* Intro & Splash Overlay */
        .intro-overlay-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          transition: opacity 1s cubic-bezier(0.25, 1, 0.5, 1);
          opacity: 1;
        }

        .intro-overlay-container.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        /* Splash Screen Card */
        .splash-card {
          text-align: center;
          background: rgba(10, 12, 18, 0.85);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(0, 243, 255, 0.3);
          border-radius: 16px;
          padding: 3rem 2.5rem;
          max-width: 480px;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.9),
            0 0 40px rgba(0, 243, 255, 0.15),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          animation: splashCardAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes splashCardAppear {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .logo-glow {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 3.5rem;
          color: #ffffff;
          letter-spacing: 4px;
          text-shadow: 
            0 0 10px rgba(0, 243, 255, 0.8),
            0 0 30px rgba(0, 243, 255, 0.4);
          text-transform: uppercase;
        }

        .subtitle-glow {
          font-family: 'Outfit', sans-serif;
          font-size: 0.62rem;
          color: #ff00ff;
          text-shadow: 0 0 10px rgba(255, 0, 255, 0.8);
          letter-spacing: 2.5px;
          font-weight: bold;
        }

        .splash-desc {
          font-size: 0.78rem;
          color: #8892b0;
          line-height: 1.6;
          text-align: center;
        }

        .start-btn {
          margin-top: 1rem;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 1px;
          color: #000000;
          background: #00ff88;
          border: none;
          border-radius: 8px;
          padding: 0.8rem 2.2rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
        }

        .start-btn:hover {
          background: #00f3ff;
          color: #000000;
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(0, 243, 255, 0.7);
        }

        .start-btn:active {
          transform: translateY(0);
        }

        /* Video Container */
        .video-viewport {
          position: relative;
          width: 100vw;
          height: 100vh;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fullscreen-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000000;
        }

        .skip-btn {
          position: absolute;
          bottom: 2rem;
          right: 2.5rem;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          padding: 0.5rem 1.2rem;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 1000000;
          backdrop-filter: blur(10px);
        }

        .skip-btn:hover {
          border-color: #00f3ff;
          color: #00f3ff;
          box-shadow: 0 0 12px rgba(0, 243, 255, 0.3);
          background: rgba(0, 243, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
