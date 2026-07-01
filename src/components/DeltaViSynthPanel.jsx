import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import MidiSynth from './MidiSynth.jsx';

export default function DeltaViSynthPanel({
  onClose,
  recordingInputMode,
  setRecordingInputMode,
  liveRecTargetSlot,
  setLiveRecTargetSlot,
  selectedEditSlotId,
  setSelectedEditSlotId,
  recordingTargetSlotIdRef,
  recordingInputModeRef,
  selectedMidiDeviceName,
  setSelectedMidiDeviceName
}) {
  const [position, setPosition] = useState({ x: 100, y: 80 });
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const [midiActivity, setMidiActivity] = useState(null);

  useEffect(() => {
    let timeoutId;
    const handleMidiMessage = (e) => {
      const { data } = e.detail;
      const [status, , data2] = data;
      const cmd = status & 0xf0;
      
      if (cmd === 0x90 && data2 > 0) {
        setMidiActivity('note');
      } else if (cmd === 0xB0) {
        setMidiActivity('cc');
      } else {
        return;
      }
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setMidiActivity(null);
      }, 80);
    };
    
    window.addEventListener('delta7_midi_message', handleMidiMessage);
    return () => {
      window.removeEventListener('delta7_midi_message', handleMidiMessage);
      clearTimeout(timeoutId);
    };
  }, []);
  const [isMinimized, setIsMinimized] = useState(false);
  const [size, setSize] = useState({ width: 1000, height: 835 });
  const [layoutMode, setLayoutMode] = useState(() => {
    return localStorage.getItem('deltavi_layout_mode') || 'horizontal';
  });

  const toggleLayoutMode = () => {
    setLayoutMode(prev => {
      const next = prev === 'horizontal' ? 'vertical' : 'horizontal';
      localStorage.setItem('deltavi_layout_mode', next);
      if (next === 'vertical') {
        setSize({ width: 420, height: 800 });
        localStorage.setItem('deltavi_panel_size', JSON.stringify({ width: 420, height: 800 }));
      } else {
        setSize({ width: 1000, height: 835 });
        localStorage.setItem('deltavi_panel_size', JSON.stringify({ width: 1000, height: 835 }));
      }
      return next;
    });
  };
  
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, startWidth: 0, startHeight: 0 });
  const panelRef = useRef(null);

  // Load saved window position & size from localStorage if available
  useEffect(() => {
    const savedPos = localStorage.getItem('deltavi_panel_position');
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(parsed);
        }
      } catch (e) { return; }
    }
    const savedSize = localStorage.getItem('deltavi_panel_size');
    if (savedSize) {
      try {
        const parsed = JSON.parse(savedSize);
        if (parsed && typeof parsed.width === 'number' && typeof parsed.height === 'number') {
          if (parsed.width === 1180 && parsed.height === 650) {
            setSize({ width: 1000, height: 835 });
            localStorage.setItem('deltavi_panel_size', JSON.stringify({ width: 1000, height: 835 }));
          } else {
            setSize(parsed);
          }
        }
      } catch (e) { return; }
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
    setPosition(currentPos => {
      localStorage.setItem('deltavi_panel_position', JSON.stringify(currentPos));
      return currentPos;
    });
  };

  const handleDoubleClick = () => {
    setIsMinimized(prev => !prev);
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

    const newWidth = Math.max(500, resizeStartRef.current.startWidth + deltaX);
    const newHeight = Math.max(250, resizeStartRef.current.startHeight + deltaY);

    setSize({ width: newWidth, height: newHeight });
  };

  const handleResizeMouseUp = () => {
    window.removeEventListener('mousemove', handleResizeMouseMove);
    window.removeEventListener('mouseup', handleResizeMouseUp);

    setSize(currentSize => {
      localStorage.setItem('deltavi_panel_size', JSON.stringify(currentSize));
      return currentSize;
    });
  };

  if (isPoppedOut) {
    return (
      <div
        ref={panelRef}
        className="floating-focus-zoom-panel"
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '320px',
          height: '110px',
          zIndex: 9999,
          background: 'rgba(8, 9, 13, 0.95)',
          border: '2px solid rgba(0, 243, 255, 0.65)',
          borderRadius: '6px',
          boxShadow: '0 15px 45px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 243, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          overflow: 'hidden'
        }}
      >
        <div
          className="panel-titlebar"
          onMouseDown={handleMouseDown}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, #050d1a 0%, #0a1733 100%)',
            borderBottom: '1px solid rgba(0, 243, 255, 0.3)',
            padding: '5px 12px',
            cursor: 'move',
            height: '24px',
            flexShrink: 0
          }}
        >
          <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', fontWeight: 'bold', color: '#00f3ff' }}>
            DELTAVI SYNTH (POPPED OUT)
          </span>
          <button
            className="titlebar-btn"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.7rem' }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
          <span style={{ fontSize: '0.52rem', color: '#888', marginBottom: '8px' }}>Active on separate screen</span>
          <button
            onClick={() => setIsPoppedOut(false)}
            style={{
              background: '#0a1733',
              border: '1px solid #00f3ff',
              borderRadius: '4px',
              color: '#00f3ff',
              fontSize: '0.55rem',
              padding: '3px 8px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            🗗 DOCK WINDOW
          </button>
        </div>

        <PopoutWindow title="DeltaVi Synthesizer Dashboard" onClose={() => setIsPoppedOut(false)}>
          <div style={{ padding: '8px' }}>
            <MidiSynth 
              layoutMode="horizontal"
              recordingInputMode={recordingInputMode}
              setRecordingInputMode={setRecordingInputMode}
              liveRecTargetSlot={liveRecTargetSlot}
              setLiveRecTargetSlot={setLiveRecTargetSlot}
              selectedEditSlotId={selectedEditSlotId}
              setSelectedEditSlotId={setSelectedEditSlotId}
              recordingTargetSlotIdRef={recordingTargetSlotIdRef}
              recordingInputModeRef={recordingInputModeRef}
              selectedMidiDeviceName={selectedMidiDeviceName}
              setSelectedMidiDeviceName={setSelectedMidiDeviceName}
            />
          </div>
        </PopoutWindow>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="floating-focus-zoom-panel"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: isMinimized ? '38px' : `${size.height}px`,
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
        minWidth: '400px',
        minHeight: isMinimized ? '38px' : '250px',
        maxWidth: '96vw',
        maxHeight: isMinimized ? '38px' : '96vh',
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
          height: '24px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span 
            style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: midiActivity === 'note' ? '#00ff88' : midiActivity === 'cc' ? '#ffa000' : '#444', 
              boxShadow: midiActivity === 'note' ? '0 0 8px #00ff88' : midiActivity === 'cc' ? '0 0 8px #ffa000' : 'none',
              transition: 'background 0.05s, box-shadow 0.05s',
              display: 'inline-block',
              marginRight: '2px'
            }} 
            title="MIDI Activity LED (Green: Notes, Orange: CC)"
          />
          <span style={{ fontSize: '0.58rem', animation: 'led-blink-cyan 1.5s infinite alternate' }}>⚡</span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', fontWeight: 'bold', color: '#00f3ff', letterSpacing: '0.8px', textShadow: '0 0 4px rgba(0, 243, 255, 0.5)' }}>
            DELTAVI SYNTH CONSOLE (ARIES/LIBRA/LEO)
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Popout button */}
          <button
            className="titlebar-btn"
            onClick={() => setIsPoppedOut(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00f3ff',
              cursor: 'pointer',
              fontSize: '0.55rem',
              fontWeight: 'bold',
              padding: '0 4px',
              fontFamily: 'monospace',
              letterSpacing: '0.5px'
            }}
            title="Pop out window to another monitor"
          >
            ❐ POP OUT
          </button>

          {/* Layout mode button */}
          <button
            className="titlebar-btn"
            onClick={toggleLayoutMode}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00f3ff',
              cursor: 'pointer',
              fontSize: '0.55rem',
              fontWeight: 'bold',
              padding: '0 4px',
              fontFamily: 'monospace',
              letterSpacing: '0.5px'
            }}
            title="Toggle Horizontal/Vertical Layout"
          >
            {layoutMode === 'horizontal' ? '⇄ HORIZ' : '⇅ VERT'}
          </button>

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
            padding: '8px 8px 0px 8px',
            maxHeight: 'calc(100% - 34px)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#00f3ff rgba(0,0,0,0.3)',
            position: 'relative'
          }}
        >
          <MidiSynth 
            layoutMode={layoutMode}
            recordingInputMode={recordingInputMode}
            setRecordingInputMode={setRecordingInputMode}
            liveRecTargetSlot={liveRecTargetSlot}
            setLiveRecTargetSlot={setLiveRecTargetSlot}
            selectedEditSlotId={selectedEditSlotId}
            setSelectedEditSlotId={setSelectedEditSlotId}
            recordingTargetSlotIdRef={recordingTargetSlotIdRef}
            recordingInputModeRef={recordingInputModeRef}
            selectedMidiDeviceName={selectedMidiDeviceName}
            setSelectedMidiDeviceName={setSelectedMidiDeviceName}
          />
        </div>
      )}

      {/* Resize Handle */}
      {!isMinimized && (
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '16px',
            height: '16px',
            cursor: 'se-resize',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: '0 2px 2px 0',
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" style={{ pointerEvents: 'none' }}>
            <line x1="6" y1="0" x2="0" y2="6" stroke="rgba(0, 243, 255, 0.5)" strokeWidth="1.5" />
            <line x1="6" y1="3" x2="3" y2="6" stroke="rgba(0, 243, 255, 0.5)" strokeWidth="1.5" />
            <line x1="6" y1="6" x2="6" y2="6" stroke="rgba(0, 243, 255, 0.5)" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  );
}

// PopoutWindow component using ReactDOM.createPortal
function PopoutWindow({ title, onClose, children }) {
  const [container, setContainer] = useState(null);
  const externalWindow = useRef(null);
  const onCloseRef = useRef(onClose);

  // Maintain reference to the latest callback to prevent stale closures
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // Open a new, opaque native window
    const width = 1000;
    const height = 835;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    
    const win = window.open(
      'about:blank',
      'deltavi_popout',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,menubar=no,toolbar=no`
    );
    
    if (!win) {
      alert("Popout blocked! Please allow popups for Delta7 Workstation.");
      if (onCloseRef.current) onCloseRef.current();
      return;
    }

    externalWindow.current = win;
    win.document.title = title || 'DeltaVi Synthesizer';

    // Set background color to opaque black/dark
    win.document.body.style.background = '#08090d';
    win.document.body.style.margin = '0';
    win.document.body.style.padding = '8px';
    win.document.body.style.overflowX = 'hidden';
    win.document.body.style.color = '#ffffff';

    // Create container element
    const div = win.document.createElement('div');
    div.id = 'popout-root';
    win.document.body.appendChild(div);
    setContainer(div);

    // Copy parent document head elements (stylesheets, links, google fonts, style tags)
    // so that the exact same neon styling is applied in the popout window!
    const headElements = document.head.cloneNode(true);
    win.document.head.innerHTML = headElements.innerHTML;

    // Monitor popout window closure
    const checkClosedInterval = setInterval(() => {
      if (win.closed) {
        clearInterval(checkClosedInterval);
        if (onCloseRef.current) onCloseRef.current();
      }
    }, 500);

    // Handle beforeunload to notify parent
    const handleBeforeUnload = () => {
      clearInterval(checkClosedInterval);
      if (onCloseRef.current) onCloseRef.current();
    };
    win.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(checkClosedInterval);
      win.removeEventListener('beforeunload', handleBeforeUnload);
      if (!win.closed) {
        win.close();
      }
    };
  }, [title]);

  if (!container) return null;

  return ReactDOM.createPortal(children, container);
}
