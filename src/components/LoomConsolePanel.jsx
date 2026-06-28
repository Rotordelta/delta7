import React, { useState, useEffect, useRef } from 'react';

export default function LoomConsolePanel({
  onClose,
  chronoCanvasRef,
  sculptTool,
  setSculptTool,
  liveRecTargetSlot,
  setLiveRecTargetSlot,
  setSelectedEditSlotId,
  liveRecBeats,
  setLiveRecBeats,
  recAlignGrid,
  setRecAlignGrid,
  recordingInputMode,
  setRecordingInputMode,
  quantizeOnBeat,
  setQuantizeOnBeat,
  recordingInputGain,
  setRecordingInputGain,
  inputGainSat,
  setInputGainSat,
  isLiveRecording,
  liveRecPendingStart,
  isArmed,
  liveRecOverdub,
  setLiveRecOverdub,
  clearLooperBuffer,
  undoLastLooperAction,
  looperHasUndo,
  recLatencyOffset,
  setRecLatencyOffset,
  selectedSlotNudge,
  setSelectedSlotNudge,
  isPlayingFxAutomation,
  isRecordingFxAutomation,
  toggleFxAutomationRec,
  toggleFxAutomationPlay,
  clearFxAutomation,
  fxAutomationEvents,
  startLiveLoopRecording,
  updateLiveInputSaturation,
  resamplerGainNodeRef,
  audioCtxRef,
  focusZoomEnabled,
  sculptWaveform
}) {
  const [position, setPosition] = useState({ x: 820, y: 80 });
  const [size, setSize] = useState({ width: 340, height: 600 });
  const [isMinimized, setIsMinimized] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, startWidth: 0, startHeight: 0 });

  // Load saved positions from localStorage if available
  useEffect(() => {
    const savedPos = localStorage.getItem('loom_panel_position');
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(parsed);
        }
      } catch (e) {}
    }
    const savedSize = localStorage.getItem('loom_panel_size');
    if (savedSize) {
      try {
        const parsed = JSON.parse(savedSize);
        if (parsed && typeof parsed.width === 'number' && typeof parsed.height === 'number') {
          setSize(parsed);
        }
      } catch (e) {}
    }
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
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

    // Clamp to viewport
    const minWidthRemaining = 120;
    const maxLeft = window.innerWidth - minWidthRemaining;
    const maxTop = window.innerHeight - 30;

    newX = Math.max(-minWidthRemaining, Math.min(maxLeft, newX));
    newY = Math.max(0, Math.min(maxTop, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    setPosition(currentPos => {
      localStorage.setItem('loom_panel_position', JSON.stringify(currentPos));
      return currentPos;
    });
  };

  const handleResizeMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };

    window.addEventListener('mousemove', handleResizeMouseMove);
    window.addEventListener('mouseup', handleResizeMouseUp);
  };

  const handleResizeMouseMove = (e) => {
    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;

    const newWidth = Math.max(280, resizeStartRef.current.startWidth + deltaX);
    const newHeight = Math.max(380, resizeStartRef.current.startHeight + deltaY);

    setSize({ width: newWidth, height: newHeight });
  };

  const handleResizeMouseUp = () => {
    window.removeEventListener('mousemove', handleResizeMouseMove);
    window.removeEventListener('mouseup', handleResizeMouseUp);
    setSize(currentSize => {
      localStorage.setItem('loom_panel_size', JSON.stringify(currentSize));
      return currentSize;
    });
  };

  const updateSlotParam = (slotId, key, value) => {
    // Shared fallback logic is within parent Delta7Synth.jsx
    setSelectedEditSlotId(slotId);
  };

  // Focus Zoom Scale styling
  const zoomClass = focusZoomEnabled ? 'focus-zoom-hoverable' : '';

  return (
    <div
      className="floating-focus-zoom-panel"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: isMinimized ? '38px' : `${size.height}px`,
        zIndex: 9999,
        background: 'rgba(5, 8, 18, 0.94)',
        border: '2px solid rgba(0, 243, 255, 0.75)',
        borderRadius: '8px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(0, 243, 255, 0.3)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        overflow: 'hidden',
        minWidth: '280px',
        minHeight: isMinimized ? '38px' : '380px',
        maxWidth: '96vw',
        maxHeight: isMinimized ? '38px' : '96vh',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.25s ease',
      }}
      className={`loom-floating-panel ${zoomClass}`}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setIsMinimized(prev => !prev)}
        style={{
          height: '36px',
          background: 'linear-gradient(180deg, rgba(0,243,255,0.2) 0%, rgba(0,243,255,0.05) 100%)',
          borderBottom: '1px solid rgba(0, 243, 255, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 10px',
          cursor: 'grab',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#00f3ff', fontSize: '0.85rem', fontWeight: 'bold', textShadow: '0 0 5px rgba(0,243,255,0.5)', fontFamily: 'monospace', letterSpacing: '1px' }}>
            ⚡ THE LOOM CONSOLE
          </span>
          <span style={{ fontSize: '0.42rem', background: 'rgba(0, 243, 255, 0.15)', color: '#00f3ff', border: '1px solid rgba(0, 243, 255, 0.3)', padding: '0.5px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>
            FLOATING
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={() => setIsMinimized(prev => !prev)}
            className="titlebar-btn"
            style={{
              background: 'transparent',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              color: '#00f3ff',
              fontSize: '0.5rem',
              padding: '1px 5px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            {isMinimized ? '🔳 EXPAND' : '➖ MIN'}
          </button>
          <button
            onClick={onClose}
            className="titlebar-btn"
            style={{
              background: 'rgba(255,0,85,0.15)',
              border: '1px solid rgba(255,0,85,0.4)',
              color: '#ff0055',
              fontSize: '0.5rem',
              padding: '1px 5px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }}
          >
            ❌ CLOSE
          </button>
        </div>
      </div>

      {/* Main Console Content */}
      {!isMinimized && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '8px',
            gap: '6px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
          className="font-mono text-cyan"
        >
          {/* Circular Chrono Visualizer Platter */}
          <div
            className="chrono-canvas-wrapper"
            style={{
              position: 'relative',
              width: '100%',
              height: '180px',
              background: '#020712',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              boxShadow: 'inset 0 0 15px rgba(0,243,255,0.15)',
              borderRadius: '6px',
              overflow: 'hidden',
              cursor: sculptTool !== 'none' ? 'crosshair' : 'default',
            }}
            onMouseDown={(e) => {
              if (sculptTool !== 'none') {
                const rect = e.currentTarget.getBoundingClientRect();
                sculptWaveform(e.clientX, e.clientY, rect, sculptTool);
              }
            }}
            onMouseMove={(e) => {
              if (e.buttons === 1 && sculptTool !== 'none') {
                const rect = e.currentTarget.getBoundingClientRect();
                sculptWaveform(e.clientX, e.clientY, rect, sculptTool);
              }
            }}
          >
            <canvas
              ref={chronoCanvasRef}
              width={280}
              height={180}
              style={{ display: 'block', width: '100%', height: '100%' }}
            />

            {/* Platter HUD elements */}
            <div style={{ position: 'absolute', top: '6px', left: '6px', pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '1px', fontSize: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isLiveRecording ? '#ff0055' : (liveRecPendingStart ? '#ffe600' : '#00f3ff'),
                    boxShadow: isLiveRecording ? '0 0 6px #ff0055' : (liveRecPendingStart ? '0 0 6px #ffe600' : '0 0 6px #00f3ff'),
                  }}
                />
                <span style={{ color: isLiveRecording ? '#ff0055' : (liveRecPendingStart ? '#ffe600' : '#00f3ff'), fontWeight: 'bold' }}>
                  {isLiveRecording ? 'RECORDING' : (liveRecPendingStart ? 'WAITING BEAT 1' : 'LOOPER READY')}
                </span>
              </div>
              <span style={{ color: '#888' }}>
                SLOT: {liveRecTargetSlot.toUpperCase()} ({liveRecBeats} BEATS)
              </span>
            </div>

            <div style={{ position: 'absolute', top: '6px', right: '6px', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.45rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#ffe600',
                  boxShadow: '0 0 6px #ffe600',
                  opacity: 0.8,
                }}
              />
              <span style={{ color: '#aaa' }}>SYNC CLK</span>
            </div>
          </div>

          {/* Level Meter */}
          <div style={{ width: '100%', marginTop: '1px' }}>
            <div className="mic-level-meter-container" style={{ padding: '1px 2px', height: '8px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,243,255,0.15)', borderRadius: '2px' }}>
              <div className="mic-level-bar-track" style={{ height: '4px', background: 'rgba(255,255,255,0.02)', borderRadius: '1px', overflow: 'hidden' }}>
                <div id="looper-level-bar-fill" className="mic-level-bar-fill" style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #00ff96 70%, #ffc000 85%, #ff0055 100%)', borderRadius: '1px', transition: 'width 0.05s ease' }} />
              </div>
            </div>
          </div>

          {/* Sculpting Brushes Panel */}
          <div className="steel-plate" style={{ padding: '4px', border: '1px solid rgba(0, 243, 255, 0.2)', borderRadius: '4px', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '0.36rem', color: '#888', marginBottom: '3px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              WAVEFORM SCULPTING BRUSHES
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px' }}>
              {[
                { id: 'none', label: 'SELECT 🔍', color: '#aaa', activeColor: 'rgba(255,255,255,0.12)', border: '#888' },
                { id: 'mute', label: 'GATE 🔴', color: '#ff4444', activeColor: 'rgba(255,0,85,0.2)', border: '#ff0055' },
                { id: 'boost', label: 'BOOST ⚡', color: '#00f3ff', activeColor: 'rgba(0,243,255,0.2)', border: '#00f3ff' },
                { id: 'attenuate', label: 'DAMP ⏳', color: '#ffe600', activeColor: 'rgba(255,230,0,0.2)', border: '#ffe600' },
                { id: 'reverse', label: 'FLIP 🔄', color: '#ff00ff', activeColor: 'rgba(255,0,255,0.2)', border: '#ff00ff' }
              ].map(tool => {
                const isSel = sculptTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setSculptTool(tool.id)}
                    className="btn btn-xs"
                    style={{
                      fontSize: '0.34rem',
                      padding: '2.5px 0',
                      margin: 0,
                      color: isSel ? '#fff' : tool.color,
                      background: isSel ? tool.activeColor : '#000',
                      borderColor: isSel ? tool.border : 'rgba(255,255,255,0.1)',
                      fontWeight: isSel ? 'bold' : 'normal',
                      boxShadow: isSel ? `0 0 6px ${tool.border}` : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {tool.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Config Controls Grid */}
          <div className="steel-plate" style={{ padding: '6px', border: '1px solid rgba(0, 243, 255, 0.2)', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontSize: '0.36rem', color: '#888' }}>TARGET PAD:</span>
                <select
                  value={liveRecTargetSlot}
                  onChange={(e) => {
                    setLiveRecTargetSlot(e.target.value);
                    setSelectedEditSlotId(e.target.value);
                  }}
                  style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffe600', fontSize: '0.45rem', padding: '1px 2px', borderRadius: '3px', outline: 'none', height: '20px' }}
                >
                  {Array.from({ length: 8 }).map((_, i) => <option key={`a-${i}`} value={`a0${i+1}`}>A{i+1}</option>)}
                  {Array.from({ length: 8 }).map((_, i) => <option key={`b-${i}`} value={`b0${i+1}`}>B{i+1}</option>)}
                  {Array.from({ length: 8 }).map((_, i) => <option key={`c-${i}`} value={`c0${i+1}`}>C{i+1}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontSize: '0.36rem', color: '#888' }}>LENGTH:</span>
                <select
                  value={liveRecBeats}
                  onChange={(e) => setLiveRecBeats(parseInt(e.target.value))}
                  style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.45rem', padding: '1px 2px', borderRadius: '3px', outline: 'none', height: '20px' }}
                >
                  {[2, 4, 8, 12, 16, 32, 64].map(b => <option key={b} value={b}>{b} Beats</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontSize: '0.36rem', color: '#888' }}>REC ALIGN:</span>
                <select
                  value={recAlignGrid}
                  onChange={(e) => setRecAlignGrid(e.target.value)}
                  style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffe600', fontSize: '0.45rem', padding: '1px 2px', borderRadius: '3px', outline: 'none', height: '20px' }}
                >
                  <option value="cycle">LOOP</option>
                  <option value="bar">BAR</option>
                  <option value="beat">BEAT</option>
                  <option value="immediate">IMMED</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontSize: '0.36rem', color: '#888' }}>REC SOURCE:</span>
                <select
                  value={recordingInputMode}
                  onChange={(e) => setRecordingInputMode(e.target.value)}
                  style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00ff96', fontSize: '0.45rem', padding: '1px 2px', borderRadius: '3px', outline: 'none', height: '20px' }}
                >
                  <option value="resample">INTERNAL</option>
                  <option value="mic">MIC/LINE</option>
                  <option value="monitor">MONITOR</option>
                  <option value="synth">DELTA-VI SYNTH</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '3px', border: '1px solid rgba(0,243,255,0.08)' }}>
              <span style={{ fontSize: '0.36rem', color: '#888', letterSpacing: '0.5px' }}>SNAP PLAYBACK TO BEAT:</span>
              <input
                type="checkbox"
                checked={quantizeOnBeat}
                onChange={(e) => setQuantizeOnBeat(e.target.checked)}
                style={{ accentColor: '#00f3ff', cursor: 'pointer', margin: 0, width: '10px', height: '10px' }}
              />
            </div>
          </div>

          {/* Gain and Drive Row */}
          <div className="steel-plate" style={{ padding: '6px', border: '1px solid rgba(0, 243, 255, 0.2)', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', display: 'flex', gap: '6px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.36rem', color: '#888' }}>
                <span>IN GAIN:</span>
                <span style={{ color: '#00f3ff' }}>{Math.round(recordingInputGain * 100)}%</span>
              </div>
              <input
                type="range" min="0" max="2" step="0.01"
                value={recordingInputGain}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setRecordingInputGain(val);
                  const ctx = audioCtxRef.current;
                  if (ctx && resamplerGainNodeRef.current) {
                    resamplerGainNodeRef.current.gain.setValueAtTime(val, ctx.currentTime);
                  }
                }}
                style={{ width: '100%', height: '5px', accentColor: '#00f3ff', cursor: 'pointer', margin: 0 }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.36rem', color: '#888' }}>
                <span>SAT DRIVE:</span>
                <span style={{ color: '#ff4c4c' }}>{Math.round(inputGainSat)}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="1"
                value={inputGainSat}
                onChange={(e) => setInputGainSat(parseFloat(e.target.value))}
                style={{ width: '100%', height: '5px', accentColor: '#ff4c4c', cursor: 'pointer', margin: 0 }}
              />
            </div>
          </div>

          {/* Primary Atomic ARM Button */}
          <button
            onClick={startLiveLoopRecording}
            className={`btn btn-xs ${isLiveRecording ? 'active-red' : (liveRecPendingStart ? 'active-yellow' : (isArmed ? 'active-yellow' : ''))}`}
            style={{
              width: '100%',
              fontSize: '0.45rem',
              padding: '5px 0',
              fontWeight: 'bold',
              margin: '2px 0 1px 0',
              color: isLiveRecording ? '#fff' : (liveRecPendingStart ? '#000' : (isArmed ? '#ffe600' : '#aaa')),
              borderColor: isLiveRecording ? '#ff0055' : (liveRecPendingStart ? '#ffe600' : (isArmed ? '#ffe600' : 'rgba(255,255,255,0.15)')),
              background: isLiveRecording
                ? 'rgba(255, 0, 85, 0.25)'
                : (liveRecPendingStart ? 'rgba(255, 230, 0, 0.85)' : (isArmed ? 'rgba(255,230,0,0.12)' : 'rgba(0,0,0,0.3)')),
              boxShadow: isLiveRecording
                ? '0 0 10px rgba(255, 0, 85, 0.5)'
                : (liveRecPendingStart ? '0 0 10px rgba(255, 230, 0, 0.5)' : 'none'),
              animation: liveRecPendingStart ? 'knob-pulse-yellow 0.6s infinite alternate' : 'none',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            {isLiveRecording
              ? '⏹️ STOP REC'
              : liveRecPendingStart
                ? '⏳ WAITING BEAT 1...'
                : isArmed
                  ? '⚡ ARM → QUEUE GATE'
                  : '🔴 ARM + REC'}
          </button>

          {/* Overdub & Clear & Undo Row */}
          <div style={{ display: 'flex', gap: '3px' }}>
            <button
              onClick={() => setLiveRecOverdub(prev => !prev)}
              className="btn btn-xs"
              style={{
                flex: 1,
                background: liveRecOverdub ? 'rgba(0, 243, 255, 0.08)' : '#000',
                borderColor: liveRecOverdub ? '#00f3ff' : 'rgba(255,255,255,0.15)',
                color: liveRecOverdub ? '#00f3ff' : '#aaa',
                fontSize: '0.36rem',
                padding: '3px 0',
                cursor: 'pointer',
              }}
            >
              {liveRecOverdub ? 'DUB: ON 🔄' : 'DUB: OFF'}
            </button>
            <button
              onClick={clearLooperBuffer}
              className="btn btn-xs"
              style={{ flex: 1, borderColor: '#ff4444', color: '#ff4444', fontSize: '0.36rem', padding: '3px 0', cursor: 'pointer' }}
            >
              🗑️ CLEAR LOOP
            </button>
            <button
              onClick={undoLastLooperAction}
              disabled={!looperHasUndo}
              className="btn btn-xs"
              style={{
                flex: 0.8,
                borderColor: '#ffe600',
                color: '#ffe600',
                fontSize: '0.36rem',
                padding: '3px 0',
                opacity: looperHasUndo ? 1 : 0.4,
                cursor: looperHasUndo ? 'pointer' : 'default',
              }}
            >
              ↩️ UNDO
            </button>
          </div>

          {/* Latency & Slip Row */}
          <div className="steel-plate" style={{ padding: '6px', border: '1px solid rgba(0, 243, 255, 0.2)', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.38rem', color: '#888' }}>
                <span>LATENCY:</span>
                <span style={{ color: '#ffe600', fontWeight: 'bold' }}>{recLatencyOffset} ms</span>
              </div>
              <input
                type="range" min="0" max="200" step="1"
                value={recLatencyOffset}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setRecLatencyOffset(val);
                }}
                style={{ width: '100%', height: '5px', accentColor: '#ffe600', cursor: 'pointer', margin: 0 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.38rem', color: '#888' }}>
                <span>NUDGE SLIP:</span>
                <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>{selectedSlotNudge} ms</span>
              </div>
              <input
                type="range" min="-100" max="100" step="1"
                value={selectedSlotNudge}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSelectedSlotNudge(val);
                  updateSlotParam(liveRecTargetSlot, 'nudgeMs', val);
                }}
                style={{ width: '100%', height: '5px', accentColor: '#00f3ff', cursor: 'pointer', margin: 0 }}
              />
            </div>
          </div>

          {/* FX Motion Automation */}
          <div className="steel-plate" style={{ padding: '5px', border: '1px solid rgba(255,0,255,0.2)', borderRadius: '4px', background: 'rgba(255,0,255,0.02)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.38rem', color: '#ff00ff', fontWeight: 'bold', letterSpacing: '0.5px' }}>FX MOTION AUTOMATION</span>
              <span style={{ fontSize: '0.36rem', color: isPlayingFxAutomation ? '#00f3ff' : (isRecordingFxAutomation ? '#ff0055' : '#666'), fontWeight: 'bold' }}>
                {isRecordingFxAutomation ? '● REC' : (isPlayingFxAutomation ? '▶ PLAY' : 'IDLE')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              <button
                onClick={toggleFxAutomationRec}
                className={`btn btn-xs ${isRecordingFxAutomation ? 'active-red blinking' : ''}`}
                style={{ flex: 1.1, borderColor: '#ff0055', color: '#ff0055', fontSize: '0.38rem', padding: '2.5px 0', cursor: 'pointer' }}
              >
                {isRecordingFxAutomation ? '⏹️ STOP REC' : '🔴 REC MOTION'}
              </button>
              <button
                onClick={toggleFxAutomationPlay}
                disabled={fxAutomationEvents.length === 0}
                className={`btn btn-xs ${isPlayingFxAutomation ? 'active-cyan' : ''}`}
                style={{ flex: 1.1, borderColor: '#00f3ff', color: '#00f3ff', fontSize: '0.38rem', padding: '2.5px 0', cursor: fxAutomationEvents.length > 0 ? 'pointer' : 'default', opacity: fxAutomationEvents.length > 0 ? 1 : 0.4 }}
              >
                {isPlayingFxAutomation ? '⏹️ STOP PLAY' : '▶️ PLAY MOTION'}
              </button>
              <button
                onClick={clearFxAutomation}
                className="btn btn-xs"
                style={{ flex: 0.6, borderColor: '#aaa', color: '#aaa', fontSize: '0.38rem', padding: '2.5px 0', cursor: 'pointer' }}
              >
                CLEAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resize handle */}
      {!isMinimized && (
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '15px',
            height: '15px',
            cursor: 'se-resize',
            background: 'linear-gradient(135deg, transparent 40%, rgba(0, 243, 255, 0.8) 100%)',
            borderBottomRightRadius: '6px',
            zIndex: 10000,
          }}
        />
      )}
    </div>
  );
}
