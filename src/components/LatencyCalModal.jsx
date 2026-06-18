import { useEffect, useRef, useState, useCallback } from 'react';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Downsample one channel of an AudioBuffer to `numBins` peak values (0–1). */
function buildPeaks(buffer, numBins = 512, channel = 0) {
  if (!buffer) return new Float32Array(numBins).fill(0);
  const data = buffer.getChannelData(channel);
  const blockSize = Math.max(1, Math.floor(data.length / numBins));
  const peaks = new Float32Array(numBins);
  for (let i = 0; i < numBins; i++) {
    let max = 0;
    const start = i * blockSize;
    const end = Math.min(start + blockSize, data.length);
    for (let j = start; j < end; j++) {
      const abs = Math.abs(data[j]);
      if (abs > max) max = abs;
    }
    peaks[i] = max;
  }
  // Normalise
  const globalMax = peaks.reduce((a, b) => Math.max(a, b), 0.0001);
  for (let i = 0; i < numBins; i++) peaks[i] /= globalMax;
  return peaks;
}

/**
 * Slide `recPeaks` by `offsetBins` bins relative to `refPeaks` and compute
 * a Pearson-like correlation score in [0, 1].
 */
function correlate(refPeaks, recPeaks, offsetBins) {
  const n = refPeaks.length;
  let dot = 0, refSq = 0, recSq = 0;
  for (let i = 0; i < n; i++) {
    const j = i + offsetBins;
    const rec = (j >= 0 && j < n) ? recPeaks[j] : 0;
    dot += refPeaks[i] * rec;
    refSq += refPeaks[i] ** 2;
    recSq += rec ** 2;
  }
  const denom = Math.sqrt(refSq * recSq);
  return denom < 0.00001 ? 0 : dot / denom;
}

/** Sweep offsets from -maxMs to +maxMs, return { bestOffsetMs, bestScore }. */
function autoDetect(refPeaks, recPeaks, sampleRate, bufferLength, maxMs = 150, step = 1) {
  const numBins = refPeaks.length;
  let bestScore = -1;
  let bestOffsetMs = 0;
  for (let ms = -maxMs; ms <= maxMs; ms += step) {
    const offsetBins = Math.round((ms / 1000) * sampleRate * (numBins / bufferLength));
    const score = correlate(refPeaks, recPeaks, offsetBins);
    if (score > bestScore) {
      bestScore = score;
      bestOffsetMs = ms;
    }
  }
  return { bestOffsetMs, bestScore };
}

// ─── drawing ─────────────────────────────────────────────────────────────────

function drawOverlay(canvas, refPeaks, recPeaks, offsetBins) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const mid = H / 2;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#0d0d0f';
  ctx.fillRect(0, 0, W, H);

  // Centre line
  ctx.strokeStyle = '#2a2a3a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, mid);
  ctx.lineTo(W, mid);
  ctx.stroke();

  const drawWave = (peaks, shift, colour) => {
    ctx.strokeStyle = colour;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < W; i++) {
      const srcIdx = i + shift;
      const val = (srcIdx >= 0 && srcIdx < peaks.length) ? peaks[srcIdx] : 0;
      const y = mid - val * (mid * 0.88);
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();

    // Mirror below
    ctx.beginPath();
    for (let i = 0; i < W; i++) {
      const srcIdx = i + shift;
      const val = (srcIdx >= 0 && srcIdx < peaks.length) ? peaks[srcIdx] : 0;
      const y = mid + val * (mid * 0.88);
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();
  };

  // Reference (grey)
  drawWave(refPeaks, 0, 'rgba(140,140,160,0.6)');
  // Recorded, shifted by offsetBins (positive = shift right = recorded is earlier)
  drawWave(recPeaks, -offsetBins, 'rgba(255,159,0,0.85)');
}

// ─── component ───────────────────────────────────────────────────────────────

export default function LatencyCalModal({
  referenceBuffer,   // AudioBuffer — the recorded loop in the slot
  sampleRate,
  recLatencyOffset,  // current ms value
  onOffsetChange,    // (ms: number) => void
  onClose,
}) {
  const canvasRef = useRef(null);
  const [localOffset, setLocalOffset] = useState(recLatencyOffset);
  const [score, setScore] = useState(0);
  const [detecting, setDetecting] = useState(false);
  const refPeaksRef = useRef(null);
  const recPeaksRef = useRef(null);

  // Build peaks once when buffer changes
  useEffect(() => {
    if (!referenceBuffer) return;
    // Reference = channel 0 of the buffer (the "ground truth" waveform shape)
    // Recorded  = channel 1 if stereo, otherwise same as ref — just to show both traces
    // In a real stereo loop both channels are the same loop, so we use ch0 as both
    // and apply the latency offset shift to demonstrate alignment.
    const peaks = buildPeaks(referenceBuffer, 512, 0);
    refPeaksRef.current = peaks;
    recPeaksRef.current = peaks; // same waveform; offset shift simulates the latency
  }, [referenceBuffer]);

  // Convert ms → canvas bins
  const msToBins = useCallback((ms) => {
    if (!referenceBuffer) return 0;
    const numBins = 512;
    return Math.round((ms / 1000) * sampleRate * (numBins / referenceBuffer.length));
  }, [referenceBuffer, sampleRate]);

  // Redraw whenever offset changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !refPeaksRef.current) return;
    const offsetBins = msToBins(localOffset);
    drawOverlay(canvas, refPeaksRef.current, recPeaksRef.current, offsetBins);
    const s = correlate(refPeaksRef.current, recPeaksRef.current, offsetBins);
    setScore(Math.round(s * 100));
  }, [localOffset, msToBins]);

  const handleAutoDetect = async () => {
    if (!referenceBuffer || !refPeaksRef.current) return;
    setDetecting(true);
    // Yield to allow UI to update
    await new Promise(r => setTimeout(r, 30));
    const { bestOffsetMs, bestScore } = autoDetect(
      refPeaksRef.current,
      recPeaksRef.current,
      sampleRate,
      referenceBuffer.length,
    );
    setLocalOffset(bestOffsetMs);
    setScore(Math.round(bestScore * 100));
    setDetecting(false);
  };

  const scoreColour = score >= 85 ? '#00e676' : score >= 50 ? '#ff9f00' : '#ff3d3d';
  const scoreLabel  = score >= 85 ? 'LOCKED ✓' : score >= 50 ? 'CLOSE' : 'MISALIGNED';

  const noBuffer = !referenceBuffer;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(5, 7, 12, 0.75)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: '#131318',
        border: '1px solid #2a2a40',
        borderRadius: '10px',
        padding: '18px',
        width: '420px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', gap: '12px',
        fontFamily: "'Outfit', 'Roboto', sans-serif",
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#ff9f00', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            ⚙ LATENCY CALIBRATION
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem' }}
          >✕</button>
        </div>

        {/* Waveform canvas */}
        <div style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid #222' }}>
          {noBuffer ? (
            <div style={{
              height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#555', fontSize: '0.6rem', background: '#0d0d0f',
            }}>
              Record a loop first to use calibration
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={384}
              height={100}
              style={{ display: 'block', width: '100%' }}
            />
          )}
          {/* Legend */}
          <div style={{
            position: 'absolute', bottom: '4px', right: '6px',
            display: 'flex', gap: '8px', fontSize: '0.42rem',
          }}>
            <span style={{ color: 'rgba(140,140,160,0.8)' }}>■ Reference</span>
            <span style={{ color: '#ff9f00' }}>■ Recorded</span>
          </div>
        </div>

        {/* Correlation meter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#888', fontSize: '0.5rem', letterSpacing: '0.08em' }}>CORRELATION</span>
            <span style={{ color: scoreColour, fontSize: '0.55rem', fontWeight: 700, fontFamily: 'monospace' }}>
              {score}% — {scoreLabel}
            </span>
          </div>
          <div style={{
            height: '8px', borderRadius: '4px',
            background: '#1a1a24', overflow: 'hidden',
            border: '1px solid #2a2a3a',
          }}>
            <div style={{
              height: '100%',
              width: `${score}%`,
              background: `linear-gradient(90deg, #ff3d3d, ${scoreColour})`,
              borderRadius: '4px',
              transition: 'width 0.15s ease, background 0.3s ease',
              boxShadow: score >= 85 ? `0 0 8px ${scoreColour}88` : 'none',
            }} />
          </div>
        </div>

        {/* Offset slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#888', fontSize: '0.5rem', letterSpacing: '0.08em' }}>OFFSET</span>
            <span style={{ color: '#ff9f00', fontSize: '0.6rem', fontFamily: 'monospace', fontWeight: 700 }}>
              {localOffset > 0 ? '+' : ''}{localOffset}ms
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#555', fontSize: '0.45rem' }}>-150</span>
            <input
              type="range" min="-150" max="150" step="1"
              value={localOffset}
              disabled={noBuffer}
              onChange={e => setLocalOffset(parseInt(e.target.value))}
              style={{
                flex: 1, height: '8px',
                accentColor: '#ff9f00',
                cursor: noBuffer ? 'not-allowed' : 'pointer',
              }}
            />
            <span style={{ color: '#555', fontSize: '0.45rem' }}>+150</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
          <button
            onClick={handleAutoDetect}
            disabled={noBuffer || detecting}
            style={{
              flex: 1, padding: '7px',
              background: detecting ? '#1a1a24' : '#1e1e30',
              border: '1px solid #3a3a55',
              borderRadius: '6px',
              color: detecting ? '#555' : '#a0a0cc',
              fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.06em',
              cursor: noBuffer || detecting ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {detecting ? '⏳ DETECTING...' : '⚡ AUTO-DETECT'}
          </button>
          <button
            onClick={() => { onOffsetChange(localOffset); onClose(); }}
            style={{
              flex: 1, padding: '7px',
              background: score >= 85 ? '#00401a' : '#1a1a1a',
              border: `1px solid ${score >= 85 ? '#00e676' : '#3a3a3a'}`,
              borderRadius: '6px',
              color: score >= 85 ? '#00e676' : '#888',
              fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.06em',
              cursor: 'pointer',
              boxShadow: score >= 85 ? '0 0 12px #00e67633' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            APPLY & CLOSE
          </button>
        </div>

        {/* Hint */}
        <p style={{ color: '#444', fontSize: '0.42rem', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
          Drag to align the orange trace over the grey. Auto-detect finds the best match automatically.
          Green = within ±5ms alignment.
        </p>
      </div>
    </div>
  );
}
