import React, { useState, useEffect, useRef } from 'react';
import MidiSynth from './MidiSynth.jsx';

export default function DeltaViSynthPanel({ onClose }) {
  const [position, setPosition] = useState({ x: 100, y: 80 });
  const [isMinimized, setIsMinimized] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const panelRef = useRef(null);

  // Load saved window position from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('deltavi_panel_position');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(parsed);
        }
      } catch (e) {}
    }
  }, []);

  const handleMouseDown = (e) => {
    // Only drag with left mouse button click on titlebar
    if (e.button !== 0) return;
    
    // Ignore if clicking buttons inside the titlebar
    if (e.target.closest('.titlebar-btn')) return;

    e.preventDefault();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y,
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    let newX = dragStartRef.current.startX + deltaX;
    let newY = dragStartRef.current.startY + deltaY;

    // Clamp to viewport bounds so titlebar stays reachable
    const minWidthRemaining = 120;
    const maxLeft = window.innerWidth - minWidthRemaining;
    const maxTop = window.innerHeight - 30; // height of titlebar

    newX = Math.max(-minWidthRemaining, Math.min(maxLeft, newX));
    newY = Math.max(0, Math.min(maxTop, newY));

    const nextPos = { x: newX, y: newY };
    setPosition(nextPos);
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    
    // Save position to localStorage
    localStorage.setItem('deltavi_panel_position', JSON.stringify(dragStartRef.current.startX !== position.x ? position : dragStartRef.current));
  };

  const handleDoubleClick = () => {
    setIsMinimized(prev => !prev);
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        background: 'rgba(8, 9, 13, 0.95)',
        border: '2px solid rgba(0, 243, 255, 0.65)',
        borderRadius: '6px',
        boxShadow: '0 15px 45px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 243, 255, 0.25)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        overflow: 'hidden',
        minWidth: '550px',
        maxWidth: '92vw',
        maxHeight: isMinimized ? 'auto' : '90vh',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      {/* Titlebar with Draggable capability */}
      <div
        className="panel-titlebar"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, #050d1a 0%, #0a1733 100%)',
          borderBottom: isMinimized ? 'none' : '1px solid rgba(0, 243, 255, 0.3)',
          padding: '5px 12px',
          cursor: 'move',
          height: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.58rem', animation: 'led-blink-cyan 1.5s infinite alternate' }}>⚡</span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', fontWeight: 'bold', color: '#00f3ff', letterSpacing: '0.8px', textShadow: '0 0 4px rgba(0, 243, 255, 0.5)' }}>
            DELTAVI SYNTH CONSOLE (ARIES/LIBRA/LEO)
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Minimize button */}
          <button
            className="titlebar-btn"
            onClick={() => setIsMinimized(prev => !prev)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffe600',
              cursor: 'pointer',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              padding: '0 3px',
              fontFamily: 'monospace'
            }}
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? '🗖' : '🗕'}
          </button>
          
          {/* Close button */}
          <button
            className="titlebar-btn"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ff4444',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              padding: '0 3px',
              fontFamily: 'monospace'
            }}
            title="Close Panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isMinimized && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 18px 0px 18px',
            maxHeight: 'calc(90vh - 35px)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#00f3ff rgba(0,0,0,0.3)'
          }}
        >
          <MidiSynth />
        </div>
      )}
    </div>
  );
}
