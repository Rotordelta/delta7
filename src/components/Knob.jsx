import React, { useRef, useEffect } from 'react';

export default function Knob({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  defaultValue = min,
  midiLearnParam = null,
  midiMappings = {},
  setMidiLearnParam = () => {},
  displayFormat = (val) => val,
  glowColor = 'cyan', // 'cyan', 'pink', 'magenta', 'yellow', 'green'
  size = 50,
}) {
  const knobRef = useRef(null);
  const dragStartRef = useRef({ y: 0, val: 0 });

  // Map glowColor to actual neon hex codes
  const colors = {
    cyan: '#00f3ff',
    pink: '#ff007f',
    magenta: '#ff00ff',
    yellow: '#ffe600',
    green: '#00ff96',
  };

  const activeColor = colors[glowColor] || colors.cyan;

  // Calculate percentage (0 to 1) of current value
  const percentage = (value - min) / (max - min);

  // Knob rotation: -135deg (min) to +135deg (max)
  const rotation = percentage * 270 - 135;

  // SVG parameters for active arc glow ring
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  // Arc covers 270 degrees (3/4 of circle)
  const strokeDasharray = circumference;
  // Percentage of 270 degrees arc length
  const strokeDashoffset = circumference - (percentage * 270 / 360) * circumference;

  // Vertical drag handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    dragStartRef.current = {
      y: e.clientY,
      val: value,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const deltaY = dragStartRef.current.y - e.clientY; // drag up is positive value
    const range = max - min;
    // 150px of vertical movement to go from min to max
    const valueDelta = (deltaY / 150) * range;
    let newValue = dragStartRef.current.val + valueDelta;
    
    // Clamp values
    newValue = Math.max(min, Math.min(max, newValue));
    
    // Apply step resolution
    if (step) {
      newValue = Math.round(newValue / step) * step;
      // Truncate decimal issues
      newValue = parseFloat(newValue.toFixed(4));
    }
    onChange(newValue);
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Scroll wheel handler
  const handleWheel = (e) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const range = max - min;
    const scrollStep = step || range / 100;
    let newValue = value + direction * scrollStep * 2; // amplify wheel slightly
    newValue = Math.max(min, Math.min(max, newValue));
    if (step) {
      newValue = Math.round(newValue / step) * step;
      newValue = parseFloat(newValue.toFixed(4));
    }
    onChange(newValue);
  };

  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  // MIDI CC badges helper
  const isLearning = midiLearnParam === label;
  const cc = midiMappings[label];

  return (
    <div className="knob-container" style={{ width: `${size + 15}px` }}>
      {/* Knob Header: Label & MIDI CC badge */}
      <div className="knob-header">
        <span className="knob-label">{label.replace(/([A-Z])/g, ' $1')}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMidiLearnParam(isLearning ? null : label);
          }}
          className={`knob-midi-badge ${isLearning ? 'learning' : (cc !== null && cc !== undefined ? 'mapped' : '')}`}
          title="Map MIDI CC"
        >
          {isLearning ? 'LRN' : (cc !== null && cc !== undefined ? `CC${cc}` : 'MID')}
        </button>
      </div>

      {/* Rotating SVG Knob */}
      <div
        ref={knobRef}
        className="knob-wrapper"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg viewBox="0 0 50 50" className="knob-svg">
          {/* Track ring background */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            className="knob-track"
            strokeDasharray={circumference}
            strokeDashoffset={(90 / 360) * circumference} // leaves bottom 90 deg empty
            transform="rotate(135 25 25)"
          />

          {/* Active glow value ring */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            className="knob-active-ring"
            style={{
              stroke: activeColor,
              filter: `drop-shadow(0 0 3px ${activeColor}80)`,
            }}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(135 25 25)"
          />

          {/* Main Dial Body (rotating part) */}
          <g transform={`rotate(${rotation} 25 25)`}>
            <circle cx="25" cy="25" r="14" className="knob-dial-face" />
            {/* Position pointer dot */}
            <circle cx="25" cy="15" r="1.8" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Underneath value readout */}
      <span className="knob-value-readout font-mono">
        {displayFormat(value)}
      </span>

      <style dangerouslySetInnerHTML={{ __html: `
        .knob-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          user-select: none;
          margin-bottom: 0.25rem;
        }

        .knob-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          margin-bottom: 0.2rem;
          width: 100%;
        }

        .knob-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.45rem;
          color: #c5c6c7;
          opacity: 0.85;
          text-transform: uppercase;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 48px;
        }

        .knob-midi-badge {
          background: rgba(21, 26, 33, 0.65);
          border: 1px solid rgba(0, 243, 255, 0.2);
          color: rgba(0, 243, 255, 0.5);
          font-family: monospace;
          font-size: 0.35rem;
          padding: 0px 2px;
          border-radius: 1.5px;
          cursor: pointer;
          line-height: 1;
          outline: none;
          flex-shrink: 0;
          transition: all 0.1s ease;
        }

        .knob-midi-badge:hover {
          border-color: #00f3ff;
          color: #00f3ff;
          background: rgba(0, 243, 255, 0.1);
        }

        .knob-midi-badge.learning {
          border-color: #ffe600;
          color: #ffe600;
          background: rgba(255, 230, 0, 0.1);
          animation: knob-pulse-yellow 1s infinite alternate;
        }

        .knob-midi-badge.mapped {
          border-color: #00ff96;
          color: #00ff96;
          background: rgba(0, 255, 150, 0.1);
        }

        @keyframes knob-pulse-yellow {
          0% { box-shadow: 0 0 2px rgba(255, 230, 0, 0.2); }
          100% { box-shadow: 0 0 6px rgba(255, 230, 0, 0.6); }
        }

        .knob-wrapper {
          position: relative;
          cursor: ns-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }

        .knob-svg {
          width: 100%;
          height: 100%;
        }

        .knob-track {
          fill: none;
          stroke: #12161f;
          stroke-width: 3.5;
          stroke-linecap: round;
        }

        .knob-active-ring {
          fill: none;
          stroke-width: 3.5;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.08s ease-out;
        }

        .knob-dial-face {
          fill: #1f2833;
          stroke: #0a0c10;
          stroke-width: 1;
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.1);
        }

        .knob-value-readout {
          font-size: 0.48rem;
          color: #00ff96;
          text-align: center;
          margin-top: 0.15rem;
          opacity: 0.9;
          white-space: nowrap;
        }
      ` }} />
    </div>
  );
}
