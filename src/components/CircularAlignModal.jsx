import { useEffect, useRef, useState } from 'react';

// Color palette matching the visual rings on the workstation
const RING_COLORS = [
  '#ff0055', // Neon Pink/Red
  '#ff5500', // Neon Orange
  '#ffcc00', // Neon Yellow
  '#00ff66', // Neon Green
  '#00f3ff', // Neon Cyan
  '#0066ff', // Neon Blue
  '#9900ff', // Neon Purple
  '#ff00ff'  // Neon Magenta
];

export default function CircularAlignModal({
  deck,
  index,
  slotId,
  slot,
  recLatencyOffset,
  onUpdateNudge,
  onNudgeChangeInMemory,
  onUpdateGlobalLatency,
  onClose,
  audioCtx,
  triggerPerfPadInternal,
  getRingAngle,
  perfPlaybackActive,
  setPerfPlaybackActive
}) {
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevAngleRef = useRef(0);

  const buffer = slot?.buffer || null;
  const duration = buffer ? buffer.duration : 1.0;
  
  // Local state for the calibrated offset in milliseconds (starts at the pad's current nudgeMs)
  const [offsetMs, setOffsetMs] = useState(0);

  useEffect(() => {
    if (isDraggingRef.current) return;
    setOffsetMs(slot?.nudgeMs || 0);
  }, [slotId, slot?.nudgeMs]);

  const padColor = RING_COLORS[index] || '#00f3ff';
  
  // Real-time audio preview states
  const [isPlaying, setIsPlaying] = useState(false);

  // Downsample buffer to 360 bins for circular waveform rendering
  const [peaks, setPeaks] = useState(() => new Float32Array(360).fill(0));

  useEffect(() => {
    if (!buffer) {
      setPeaks(new Float32Array(360).fill(0));
      return;
    }
    const data = buffer.getChannelData(0);
    const numBins = 360;
    const blockSize = Math.max(1, Math.floor(data.length / numBins));
    const result = new Float32Array(numBins);
    for (let i = 0; i < numBins; i++) {
      let max = 0;
      const start = i * blockSize;
      const end = Math.min(start + blockSize, data.length);
      for (let j = start; j < end; j++) {
        const val = Math.abs(data[j]);
        if (val > max) max = val;
      }
      result[i] = max;
    }
    // Normalise
    const globalMax = result.reduce((a, b) => Math.max(a, b), 0.0001);
    for (let i = 0; i < numBins; i++) {
      result[i] = result[i] / globalMax;
    }
    setPeaks(result);
  }, [buffer]);

  // Calculate the rotation angle in radians corresponding to the current offsetMs
  const rotateAngle = -((offsetMs / 1000) / duration) * 2 * Math.PI;

  // Sync timing offset in-memory as the user adjusts it
  useEffect(() => {
    if (onNudgeChangeInMemory) {
      onNudgeChangeInMemory(offsetMs);
    }
  }, [offsetMs, onNudgeChangeInMemory]);

  // Render function for the circular vinyl platter
  const drawCanvas = (currentAngleDegrees = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const centerX = W / 2;
    const centerY = H / 2;
    
    ctx.clearRect(0, 0, W, H);
    
    // Draw background outer record vinyl plate
    ctx.beginPath();
    ctx.arc(centerX, centerY, 135, 0, 2 * Math.PI);
    ctx.fillStyle = '#08080c';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.stroke();

    // Draw vinyl groove lines
    for (let r = 50; r < 135; r += 12) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw active pad track ring under waveform
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Render the radial waveform
    const R_in = 72;
    const R_out_max = 125;
    
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    const playheadAngle = (currentAngleDegrees / 360) * 2 * Math.PI;
    const dynamicRotate = rotateAngle - playheadAngle;

    for (let i = 0; i < 360; i++) {
      const amp = peaks[i] || 0;
      if (amp <= 0) continue;
      
      const angle = -Math.PI / 2 + (i / 360) * 2 * Math.PI + dynamicRotate;
      
      const xStart = centerX + R_in * Math.cos(angle);
      const yStart = centerY + R_in * Math.sin(angle);
      const xEnd = centerX + (R_in + amp * (R_out_max - R_in)) * Math.cos(angle);
      const yEnd = centerY + (R_in + amp * (R_out_max - R_in)) * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(xStart, yStart);
      ctx.lineTo(xEnd, yEnd);
      ctx.strokeStyle = padColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw Center Brass Spindle / Hub (Stationary)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#141a29';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#d4af37';
    ctx.fill();

    // Draw vertical green anchor line at 12 o'clock representing GRID START (0ms)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 68);
    ctx.lineTo(centerX, centerY - 132);
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00ff66';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Add labels next to Grid Start line
    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GRID START (0ms)', centerX, centerY - 138);

    // Orbiting playhead dot
    if (isPlaying) {
      const phAngle = -Math.PI / 2 + playheadAngle;
      const phX = centerX + 70 * Math.cos(phAngle);
      const phY = centerY + 70 * Math.sin(phAngle);
      ctx.beginPath();
      ctx.arc(phX, phY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  // Redraw canvas on static parameter changes, or run animation frame loop if isPlaying
  useEffect(() => {
    if (!isPlaying) {
      drawCanvas(0);
      return;
    }

    let active = true;
    const tick = () => {
      if (!active) return;
      const angle = getRingAngle ? getRingAngle(deck, index) : 0;
      drawCanvas(angle);
      requestAnimationFrame(tick);
    };
    
    requestAnimationFrame(tick);
    return () => {
      active = false;
    };
  }, [peaks, rotateAngle, padColor, isPlaying]);

  // Drag interaction handlers
  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - 150;
    const dy = y - 150;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 22 || dist > 140) return;
    
    isDraggingRef.current = true;
    prevAngleRef.current = Math.atan2(dy, dx);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - 150;
    const dy = y - 150;
    const curAngle = Math.atan2(dy, dx);
    
    let deltaAngle = curAngle - prevAngleRef.current;
    if (deltaAngle > Math.PI) {
      deltaAngle -= 2 * Math.PI;
    } else if (deltaAngle < -Math.PI) {
      deltaAngle += 2 * Math.PI;
    }
    
    const stepMs = -(deltaAngle / (2 * Math.PI)) * duration * 1000;
    
    setOffsetMs(prev => {
      let nextOffset = Math.round(prev + stepMs);
      return Math.max(-300, Math.min(300, nextOffset));
    });
    
    prevAngleRef.current = curAngle;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch device support
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    
    const dx = x - 150;
    const dy = y - 150;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 22 || dist > 140) return;
    
    isDraggingRef.current = true;
    prevAngleRef.current = Math.atan2(dy, dx);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1 || !canvasRef.current) return;
    const t = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    
    const dx = x - 150;
    const dy = y - 150;
    const curAngle = Math.atan2(dy, dx);
    
    let deltaAngle = curAngle - prevAngleRef.current;
    if (deltaAngle > Math.PI) {
      deltaAngle -= 2 * Math.PI;
    } else if (deltaAngle < -Math.PI) {
      deltaAngle += 2 * Math.PI;
    }
    
    const stepMs = -(deltaAngle / (2 * Math.PI)) * duration * 1000;
    setOffsetMs(prev => {
      let nextOffset = Math.round(prev + stepMs);
      return Math.max(-300, Math.min(300, nextOffset));
    });
    
    prevAngleRef.current = curAngle;
  };

  // Audio Preview via actual performance voice triggers
  const togglePlayPreview = () => {
    if (isPlaying) {
      stopPreview();
    } else {
      startPreview();
    }
  };

  const startPreview = () => {
    if (!triggerPerfPadInternal) return;
    try {
      if (setPerfPlaybackActive && !perfPlaybackActive) {
        setPerfPlaybackActive(true);
      }
      
      // Stop and restart performance voice pad to align with current timings
      triggerPerfPadInternal(deck, 'slot', index, 0, false);
      triggerPerfPadInternal(deck, 'slot', index, 100, true);
      setIsPlaying(true);
    } catch (err) {
      console.error("[Vinyl Diagnostic] Failed to play preview:", err);
    }
  };

  const stopPreview = () => {
    if (!triggerPerfPadInternal) return;
    try {
      triggerPerfPadInternal(deck, 'slot', index, 0, false);
    } catch (e) {}
    setIsPlaying(false);
  };

  const handleClose = () => {
    stopPreview();
    if (onClose) onClose();
  };

  // Stop performance preview when modal unmounts
  useEffect(() => {
    return () => {
      if (triggerPerfPadInternal) {
        try {
          triggerPerfPadInternal(deck, 'slot', index, 0, false);
        } catch (e) {}
      }
    };
  }, [deck, index, triggerPerfPadInternal]);

  return (
    <div className="circular-align-overlay" style={overlayStyle}>
      <div className="circular-align-panel glass-morphic" style={panelStyle(padColor)}>
        
        {/* Title / Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ ...indicatorDot, backgroundColor: padColor }} />
            <h3 style={titleStyle}>VINYL DIAGNOSTIC TOOL</h3>
          </div>
          <button style={closeBtnStyle} onClick={handleClose}>✕</button>
        </div>

        {/* Target Details */}
        <div style={detailsRow}>
          <div>
            <div style={labelStyle}>TARGET SLOT</div>
            <div style={valStyle}>{deck}{index + 1} ({slot?.name || 'Empty'})</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={labelStyle}>DURATION</div>
            <div style={valStyle}>{duration.toFixed(3)}s</div>
          </div>
        </div>

        {/* Vinyl Canvas container */}
        <div style={canvasContainer}>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            style={{ display: 'block', cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          />
        </div>

        {/* Diagnostic Offset Display */}
        <div style={offsetGaugeContainer}>
          <div style={offsetLabel}>CALIBRATED TIMING OFFSET</div>
          <div style={offsetMsVal(offsetMs)}>
            {offsetMs > 0 ? `+${offsetMs}` : offsetMs} <span style={{ fontSize: '0.9rem' }}>ms</span>
          </div>
          <div style={offsetSubtext(offsetMs)}>
            {offsetMs > 0 
              ? `🔴 Audio starts ${offsetMs}ms late (pre-transient padding detected)` 
              : offsetMs < 0 
              ? `🔵 Audio starts early (transient cut off by ${Math.abs(offsetMs)}ms)`
              : `🟢 Perfectly aligned to Grid Start`
            }
          </div>
        </div>

        {/* Manual Adjust Slider */}
        <div style={sliderContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={labelStyle}>FINE TUNING</span>
            <span style={{ ...valStyle, color: '#ffe600' }}>{offsetMs} ms</span>
          </div>
          <input
            type="range"
            min="-300"
            max="300"
            value={offsetMs}
            onChange={(e) => setOffsetMs(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: padColor, cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.45rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
            <span>-300ms (EARLY)</span>
            <span>0ms</span>
            <span>+300ms (LATE)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={btnRow}>
          <button 
            style={secondaryBtnStyle(isPlaying)} 
            onClick={togglePlayPreview}
          >
            {isPlaying ? '⏹️ STOP PREVIEW' : '🔊 PREVIEW LOOP'}
          </button>
          
          <button 
            style={resetBtnStyle} 
            onClick={() => setOffsetMs(0)}
          >
            🔄 RESET (0ms)
          </button>
        </div>

        <div style={divider} />

        <div style={applySection}>
          <button 
            className="action-btn glow-cyan" 
            style={{ ...applyBtnStyle('#00f3ff'), fontSize: '0.75rem', padding: '10px' }} 
            onClick={() => {
              onUpdateNudge(offsetMs);
              handleClose();
            }}
          >
            💾 COMMIT ALIGNMENT TO PAD
          </button>
          <button 
            className="action-btn glow-yellow" 
            style={applyBtnStyle('#ffe600')}
            onClick={() => {
              onUpdateGlobalLatency(offsetMs);
              handleClose();
            }}
          >
            APPLY TO GLOBAL LATENCY
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Inline styles for absolute glassmorphic look ───────────────────────────

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(2, 4, 8, 0.45)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  pointerEvents: 'auto'
};

const panelStyle = (borderColor) => ({
  width: '350px',
  padding: '16px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, rgba(16, 22, 38, 0.88) 0%, rgba(8, 10, 18, 0.94) 100%)',
  border: `1.5px solid ${borderColor}`,
  boxShadow: `0 0 25px ${borderColor}33, inset 0 0 15px rgba(255,255,255,0.02)`,
  color: '#ffffff',
  fontFamily: 'Outfit, sans-serif'
});

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px'
};

const titleStyle = {
  margin: 0,
  fontSize: '0.85rem',
  fontWeight: 'bold',
  letterSpacing: '1.5px',
  fontFamily: 'Courier New, monospace',
  color: '#ffffff',
  textShadow: '0 0 8px rgba(255,255,255,0.3)'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: '1rem',
  cursor: 'pointer',
  padding: '4px',
  transition: 'color 0.2s ease',
  outline: 'none'
};

const indicatorDot = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  display: 'inline-block'
};

const detailsRow = {
  display: 'flex',
  justifyContent: 'space-between',
  background: 'rgba(255, 255, 255, 0.03)',
  padding: '8px 12px',
  borderRadius: '8px',
  marginBottom: '16px',
  fontSize: '0.65rem'
};

const labelStyle = {
  color: 'rgba(255, 255, 255, 0.4)',
  fontSize: '0.55rem',
  letterSpacing: '1px',
  marginBottom: '2px',
  fontWeight: 'bold'
};

const valStyle = {
  fontWeight: 'bold',
  fontFamily: 'monospace',
  fontSize: '0.65rem'
};

const canvasContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '16px',
  position: 'relative'
};

const offsetGaugeContainer = {
  textAlign: 'center',
  marginBottom: '14px',
  background: 'rgba(0, 0, 0, 0.2)',
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.04)'
};

const offsetLabel = {
  fontSize: '0.55rem',
  color: 'rgba(255,255,255,0.5)',
  letterSpacing: '1.5px',
  marginBottom: '4px',
  fontWeight: 'bold'
};

const offsetMsVal = (val) => {
  const color = val > 0 ? '#ff0055' : val < 0 ? '#00f3ff' : '#00ff66';
  return {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    fontFamily: 'Courier New, monospace',
    color,
    textShadow: `0 0 10px ${color}55`
  };
};

const offsetSubtext = (val) => ({
  fontSize: '0.55rem',
  color: val > 0 ? '#ff4d80' : val < 0 ? '#4de6ff' : '#66ff99',
  marginTop: '4px',
  fontWeight: '500'
});

const sliderContainer = {
  marginBottom: '16px',
  background: 'rgba(255,255,255,0.01)',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.02)'
};

const btnRow = {
  display: 'flex',
  gap: '10px',
  marginBottom: '12px'
};

const secondaryBtnStyle = (active) => ({
  flex: 1.2,
  padding: '6px 8px',
  fontSize: '0.65rem',
  backgroundColor: active ? 'rgba(255, 0, 85, 0.15)' : 'rgba(255, 255, 255, 0.05)',
  border: active ? '1px solid #ff0055' : '1px solid rgba(255, 255, 255, 0.1)',
  color: active ? '#ff0055' : '#ffffff',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'all 0.2s ease'
});

const resetBtnStyle = {
  flex: 0.8,
  padding: '6px 8px',
  fontSize: '0.65rem',
  backgroundColor: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: 'rgba(255,255,255,0.8)',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const divider = {
  height: '1px',
  background: 'rgba(255,255,255,0.06)',
  margin: '12px 0'
};

const applySection = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const applyBtnStyle = (color) => ({
  width: '100%',
  padding: '8px',
  fontSize: '0.65rem',
  fontWeight: 'bold',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  border: `1.2px solid ${color}`,
  color: '#ffffff',
  borderRadius: '6px',
  cursor: 'pointer',
  letterSpacing: '1px',
  transition: 'all 0.2s ease',
  outline: 'none',
  boxShadow: `inset 0 0 4px ${color}1a`
});
