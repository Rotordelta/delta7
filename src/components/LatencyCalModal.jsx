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

/** Downsample one channel of an AudioBuffer to `numBins` peaks within a specific sample range. */
function buildPeaksRange(buffer, startSample, endSample, numBins = 512, channel = 0) {
  if (!buffer) return new Float32Array(numBins).fill(0);
  const data = buffer.getChannelData(channel);
  const rangeLength = Math.max(1, endSample - startSample);
  const blockSize = Math.max(1, Math.floor(rangeLength / numBins));
  const peaks = new Float32Array(numBins);
  for (let i = 0; i < numBins; i++) {
    let max = 0;
    const start = startSample + i * blockSize;
    const end = Math.min(start + blockSize, data.length);
    for (let j = Math.max(0, start); j < Math.min(end, data.length); j++) {
      const abs = Math.abs(data[j]);
      if (abs > max) max = abs;
    }
    peaks[i] = max;
  }
  // Normalise based on local peaks
  const localMax = peaks.reduce((a, b) => Math.max(a, b), 0.0001);
  for (let i = 0; i < numBins; i++) peaks[i] /= localMax;
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

function getSlotLabel(id) {
  if (!id) return '';
  const deck = id.startsWith('b') ? 'B' : 'A';
  const index = parseInt(id.replace(/[ab]0*/, ''), 10);
  return `${deck}${index}`;
}

// ─── drawing ─────────────────────────────────────────────────────────────────

function drawOverlay(canvas, refPeaks, recPeaks, offsetBins, zoom, sampleRate, bufferLength, refSlotId) {
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
      const y = mid - val * (mid * 0.72);
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();

    // Mirror below
    ctx.beginPath();
    for (let i = 0; i < W; i++) {
      const srcIdx = i + shift;
      const val = (srcIdx >= 0 && srcIdx < peaks.length) ? peaks[srcIdx] : 0;
      const y = mid + val * (mid * 0.72);
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();
  };

  // Reference (grey) - only draw if reference is selected
  if (refPeaks && refSlotId) {
    drawWave(refPeaks, 0, 'rgba(140,140,160,0.6)');
  }
  // Recorded (orange), shifted by offsetBins
  drawWave(recPeaks, offsetBins, 'rgba(255,159,0,0.85)');

  // Draw timeline grid lines and ms labels at the top of the canvas
  const fullDurationMs = (bufferLength / sampleRate) * 1000;
  let windowDurationMs = fullDurationMs;
  if (zoom === 2) windowDurationMs = Math.min(fullDurationMs, 2000);
  else if (zoom === 5) windowDurationMs = Math.min(fullDurationMs, 1000);
  else if (zoom === 10) windowDurationMs = Math.min(fullDurationMs, 500);
  else if (zoom === 20) windowDurationMs = Math.min(fullDurationMs, 200);
  else if (zoom === 50) windowDurationMs = Math.min(fullDurationMs, 100);
  else if (zoom === 100) windowDurationMs = Math.min(fullDurationMs, 50);

  const preRollMs = zoom === 1 ? 0 : windowDurationMs * 0.20;

  // Pixel position of 0ms (Beat 1 Grid Start)
  const x_0 = zoom === 1 ? 0 : (preRollMs / windowDurationMs) * W;

  if (zoom > 1) {
    // Draw glowing GRID START beat line in cyan
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x_0, 0);
    ctx.lineTo(x_0, H);
    ctx.stroke();

    // Add "GRID START" label at the bottom of the line
    ctx.fillStyle = '#00e676';
    ctx.font = '7px monospace';
    ctx.fillText('GRID START (0ms)', x_0 + 3, H - 4);
  }
  
  ctx.fillStyle = '#666';
  ctx.font = '8px monospace';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;

  // Determine tick spacing based on window duration
  let tickIntervalMs = 100;
  if (windowDurationMs <= 50) tickIntervalMs = 5;
  else if (windowDurationMs <= 100) tickIntervalMs = 10;
  else if (windowDurationMs <= 250) tickIntervalMs = 25;
  else if (windowDurationMs <= 500) tickIntervalMs = 50;
  else if (windowDurationMs <= 1000) tickIntervalMs = 100;
  else if (windowDurationMs <= 2000) tickIntervalMs = 250;
  else tickIntervalMs = 500;

  // Draw ticks relative to the 0ms line
  // Start from the closest round tick left of -preRollMs
  const startMs = Math.ceil(-preRollMs / tickIntervalMs) * tickIntervalMs;
  const endMs = windowDurationMs - preRollMs;

  for (let ms = startMs; ms <= endMs; ms += tickIntervalMs) {
    const x = zoom === 1
      ? (ms / windowDurationMs) * W
      : ((ms + preRollMs) / windowDurationMs) * W;
    
    // Draw tick line (skip drawing directly on x_0 to prevent overlaying the cyan line)
    if (zoom === 1 || Math.abs(x - x_0) > 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      
      // Label at top
      if (ms !== 0 || zoom === 1) {
        ctx.fillText(`${ms > 0 ? '+' : ''}${Math.round(ms)}ms`, x + 2, 10);
      }
    }
  }
}

// ─── component ───────────────────────────────────────────────────────────────

export default function LatencyCalModal({
  referenceBuffer,   // AudioBuffer — the recorded loop in the slot
  sampleSlots = [],  // Array of all sample slots to choose reference from
  targetSlotId = '', // Target slot ID
  sampleRate,
  recLatencyOffset,  // current ms value
  onOffsetChange,    // (ms: number) => void
  onClose,
  audioCtx,          // Web Audio AudioContext passed from main thread
}) {
  const canvasRef = useRef(null);
  const [localOffset, setLocalOffset] = useState(recLatencyOffset);
  const [score, setScore] = useState(0);
  const [detecting, setDetecting] = useState(false);
  const [refSlotId, setRefSlotId] = useState('');
  const [zoom, setZoom] = useState(1); // Zoom level: 1x, 2x, 5x, 10x, 20x, 50x, 100x
  const [peaks, setPeaks] = useState({ refFull: null, recFull: null, refZoom: null, recZoom: null });
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);

  // Audio refs
  const sourceRefNodeRef = useRef(null);
  const sourceRecNodeRef = useRef(null);
  const delayRefNodeRef = useRef(null);
  const delayRecNodeRef = useRef(null);
  const gainRefNodeRef = useRef(null);
  const gainRecNodeRef = useRef(null);
  const masterGainNodeRef = useRef(null);

  // Build peaks when targetBuffer, selected refSlot, or zoom changes
  useEffect(() => {
    if (!referenceBuffer) return;
    
    // Full peaks (for correlation)
    const recPeaksFull = buildPeaks(referenceBuffer, 512, 0);
    const refSlot = sampleSlots.find(s => s.id === refSlotId);
    const refPeaksFull = (refSlot && refSlot.buffer) ? buildPeaks(refSlot.buffer, 512, 0) : recPeaksFull;

    // Zoomed peaks based on window durations
    const fullDurationMs = (referenceBuffer.length / sampleRate) * 1000;
    let windowDurationMs = fullDurationMs;
    if (zoom === 2) windowDurationMs = Math.min(fullDurationMs, 2000);
    else if (zoom === 5) windowDurationMs = Math.min(fullDurationMs, 1000);
    else if (zoom === 10) windowDurationMs = Math.min(fullDurationMs, 500);
    else if (zoom === 20) windowDurationMs = Math.min(fullDurationMs, 200);
    else if (zoom === 50) windowDurationMs = Math.min(fullDurationMs, 100);
    else if (zoom === 100) windowDurationMs = Math.min(fullDurationMs, 50);

    const preRollMs = zoom === 1 ? 0 : windowDurationMs * 0.20;
    const preRollSamples = Math.round((preRollMs / 1000) * sampleRate);
    const windowLength = Math.round((windowDurationMs / 1000) * sampleRate);

    const startSample = zoom === 1 ? 0 : -preRollSamples;
    const endSample = zoom === 1 ? referenceBuffer.length : (windowLength - preRollSamples);

    const recPeaksZoom = buildPeaksRange(referenceBuffer, startSample, endSample, 512, 0);
    const refPeaksZoom = (refSlot && refSlot.buffer) 
      ? buildPeaksRange(refSlot.buffer, startSample, endSample, 512, 0)
      : null;

    setPeaks({
      refFull: refPeaksFull,
      recFull: recPeaksFull,
      refZoom: refPeaksZoom,
      recZoom: recPeaksZoom
    });
  }, [referenceBuffer, refSlotId, sampleSlots, zoom, sampleRate]);

  // Convert ms → canvas bins
  const msToBins = useCallback((ms) => {
    if (!referenceBuffer) return 0;
    const fullDurationMs = (referenceBuffer.length / sampleRate) * 1000;
    let windowDurationMs = fullDurationMs;
    if (zoom === 2) windowDurationMs = Math.min(fullDurationMs, 2000);
    else if (zoom === 5) windowDurationMs = Math.min(fullDurationMs, 1000);
    else if (zoom === 10) windowDurationMs = Math.min(fullDurationMs, 500);
    else if (zoom === 20) windowDurationMs = Math.min(fullDurationMs, 200);
    else if (zoom === 50) windowDurationMs = Math.min(fullDurationMs, 100);
    else if (zoom === 100) windowDurationMs = Math.min(fullDurationMs, 50);

    const numBins = 512;
    return Math.round((ms / windowDurationMs) * numBins);
  }, [referenceBuffer, sampleRate, zoom]);

  // Redraw whenever offset, peaks, or zoom changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks.recZoom) return;
    const offsetBins = msToBins(localOffset);
    
    // Draw the zoomed peaks in the canvas
    drawOverlay(canvas, peaks.refZoom, peaks.recZoom, offsetBins, zoom, sampleRate, referenceBuffer.length, refSlotId);
    
    // Pearson correlation score is always calculated on the full 512-bin waveforms so it stays stable
    const fullOffsetBins = Math.round((localOffset / 1000) * sampleRate * (512 / referenceBuffer.length));
    const s = correlate(peaks.refFull, peaks.recFull, fullOffsetBins);
    setScore(Math.round(s * 100));
  }, [localOffset, msToBins, peaks, zoom, sampleRate, referenceBuffer, refSlotId]);

  // Setup preview audio looping
  useEffect(() => {
    if (!audioCtx || !referenceBuffer) return;

    const ctx = audioCtx;
    
    // Create master preview gain node
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(isPlayingPreview ? 0.7 : 0.0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainNodeRef.current = masterGain;

    const refSlot = sampleSlots.find(s => s.id === refSlotId);
    const refBuffer = refSlot?.buffer;

    let srcRef = null;
    let srcRec = null;

    const startTime = ctx.currentTime + 0.05;

    // Set up reference path (original loop loopback)
    if (refBuffer) {
      srcRef = ctx.createBufferSource();
      srcRef.buffer = refBuffer;
      srcRef.loop = true;

      const delayRef = ctx.createDelay(1.0);
      delayRef.delayTime.value = 0.2; // 200ms base delay
      delayRefNodeRef.current = delayRef;

      const gainRef = ctx.createGain();
      gainRef.gain.value = 0.45;

      srcRef.connect(delayRef);
      delayRef.connect(gainRef);
      gainRef.connect(masterGain);

      srcRef.start(startTime);
      sourceRefNodeRef.current = srcRef;
    }

    // Set up recorded path (newly recorded loop)
    if (referenceBuffer) {
      srcRec = ctx.createBufferSource();
      srcRec.buffer = referenceBuffer;
      srcRec.loop = true;

      const delayRec = ctx.createDelay(1.0);
      // Align initial delay time to current local offset value
      delayRec.delayTime.value = 0.2 + (localOffset / 1000);
      delayRecNodeRef.current = delayRec;

      const gainRec = ctx.createGain();
      gainRec.gain.value = 0.45;

      srcRec.connect(delayRec);
      delayRec.connect(gainRec);
      gainRec.connect(masterGain);

      srcRec.start(startTime);
      sourceRecNodeRef.current = srcRec;
    }

    // Clean up
    return () => {
      try {
        if (sourceRefNodeRef.current) sourceRefNodeRef.current.stop();
      } catch (e) {}
      try {
        if (sourceRecNodeRef.current) sourceRecNodeRef.current.stop();
      } catch (e) {}
      
      if (sourceRefNodeRef.current) sourceRefNodeRef.current.disconnect();
      if (sourceRecNodeRef.current) sourceRecNodeRef.current.disconnect();
      if (delayRefNodeRef.current) delayRefNodeRef.current.disconnect();
      if (delayRecNodeRef.current) delayRecNodeRef.current.disconnect();
      if (gainRefNodeRef.current) gainRefNodeRef.current.disconnect();
      if (gainRecNodeRef.current) gainRecNodeRef.current.disconnect();
      if (masterGainNodeRef.current) masterGainNodeRef.current.disconnect();
    };
  }, [audioCtx, referenceBuffer, refSlotId, sampleSlots]);

  // Dynamically update variable delay as slider drags
  useEffect(() => {
    if (delayRecNodeRef.current && audioCtx) {
      const timeVal = 0.2 + (localOffset / 1000);
      delayRecNodeRef.current.delayTime.setValueAtTime(timeVal, audioCtx.currentTime);
    }
  }, [localOffset, audioCtx]);

  // Dynamically update preview volume (mute/unmute)
  useEffect(() => {
    if (masterGainNodeRef.current && audioCtx) {
      masterGainNodeRef.current.gain.setTargetAtTime(isPlayingPreview ? 0.7 : 0.0, audioCtx.currentTime, 0.015);
    }
  }, [isPlayingPreview, audioCtx]);

  const handleAutoDetect = async () => {
    if (!referenceBuffer || !peaks.refFull || !peaks.recFull) return;
    setDetecting(true);
    // Yield to allow UI to update
    await new Promise(r => setTimeout(r, 30));
    const { bestOffsetMs, bestScore } = autoDetect(
      peaks.refFull,
      peaks.recFull,
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
      background: 'none',
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes calPulse {
          0% { opacity: 0.5; }
          50% { opacity: 1.0; }
          100% { opacity: 0.5; }
        }
      `}</style>
      <div style={{
        background: 'rgba(19, 19, 24, 0.9)',
        border: '1px solid #2a2a40',
        borderRadius: '10px',
        padding: '18px',
        width: '420px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.85), 0 0 15px rgba(255, 159, 0, 0.1)',
        display: 'flex', flexDirection: 'column', gap: '12px',
        fontFamily: "'Outfit', 'Roboto', sans-serif",
        backdropFilter: 'blur(12px)',
        pointerEvents: 'auto',
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

        {/* Reference Selector */}
        {!noBuffer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: '#888', fontSize: '0.45rem', letterSpacing: '0.05em', fontWeight: 600 }}>
              COMPARE TO REFERENCE PAD:
            </span>
            <select
              value={refSlotId}
              onChange={(e) => setRefSlotId(e.target.value)}
              style={{
                background: '#181822',
                border: '1px solid #2a2a40',
                borderRadius: '4px',
                color: '#fff',
                padding: '5px',
                fontSize: '0.52rem',
                fontFamily: 'inherit',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">(None - Compare against self)</option>
              {sampleSlots
                .filter(s => s.buffer && s.id !== targetSlotId)
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {getSlotLabel(s.id)} - {s.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Waveform canvas */}
        <div style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid #222' }}>
          {noBuffer ? (
            <div style={{
              height: '110px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#888', fontSize: '0.52rem', background: '#0a0a0f', gap: '8px', padding: '12px',
              textAlign: 'center', border: '1px dashed #3a3a55', borderRadius: '6px'
            }}>
              <span style={{ color: '#ff3d3d', fontWeight: 700, animation: 'calPulse 1.5s infinite', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔴 STANDBY — AWAITING LOOP RECORDING
              </span>
              <span style={{ color: '#666', fontSize: '0.45rem', lineHeight: 1.4 }}>
                Keep your drum machine/reference track running.<br/>
                Arm the looper and record into this pad ({getSlotLabel(targetSlotId)}).<br/>
                Calibration will activate automatically upon completion.
              </span>
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

        {/* Zoom Selector */}
        {!noBuffer && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#181822', padding: '6px 8px', borderRadius: '6px',
            border: '1px solid #2a2a3e'
          }}>
            <span style={{ color: '#a0a0b2', fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              🔍 ZOOM WAVEFORM
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 5, 10, 20, 50, 100].map(z => (
                <button
                  key={z}
                  onClick={() => setZoom(z)}
                  style={{
                    background: zoom === z ? '#ff9f00' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${zoom === z ? '#ff9f00' : '#2a2a40'}`,
                    borderRadius: '4px',
                    color: zoom === z ? '#131318' : '#a0a0cc',
                    padding: '3.5px 6px',
                    fontSize: '0.45rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {z}X
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Audio monitor controller */}
        {!noBuffer && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#181822', padding: '6px 8px', borderRadius: '6px',
            border: '1px solid #2a2a3e'
          }}>
            <span style={{ color: '#a0a0b2', fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              🔊 LIVE AUDIO PREVIEW
            </span>
            <button
              onClick={() => setIsPlayingPreview(!isPlayingPreview)}
              style={{
                background: isPlayingPreview ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 61, 61, 0.1)',
                border: `1px solid ${isPlayingPreview ? '#00e676' : '#ff3d3d'}`,
                borderRadius: '4px',
                color: isPlayingPreview ? '#00e676' : '#ff3d3d',
                padding: '3px 8px',
                fontSize: '0.5rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isPlayingPreview ? 'MUTE PREVIEW' : 'UNMUTE PREVIEW'}
            </button>
          </div>
        )}

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
        <p style={{ color: '#555', fontSize: '0.42rem', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
          {refSlotId ? 
            "Drag the slider to shift the recorded (orange) peaks until they align with the reference (grey) peaks and sound perfectly in phase." : 
            "To calibrate, select the original loop pad you recorded as the Reference Pad above."
          }
        </p>
      </div>
    </div>
  );
}
