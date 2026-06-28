import React, { useState, useEffect, useRef } from 'react';

// bjorklund algorithm for Euclidean rhythms
function generateEuclidean(steps, pulses, rotation = 0) {
  let pattern = Array(steps).fill(false);
  if (pulses <= 0) return pattern;
  if (pulses >= steps) return Array(steps).fill(true);

  let groups = [];
  for (let i = 0; i < steps; i++) {
    groups.push([i < pulses]);
  }

  while (groups.length > 1) {
    let current = groups[0].length;
    let firstGroupSize = 0;
    while (firstGroupSize < groups.length && groups[firstGroupSize].length === current) {
      firstGroupSize++;
    }

    let nextGroupSize = 0;
    while (firstGroupSize + nextGroupSize < groups.length && groups[firstGroupSize + nextGroupSize].length === groups[firstGroupSize].length) {
      nextGroupSize++;
    }

    let mergeCount = Math.min(firstGroupSize, nextGroupSize);
    if (mergeCount === 0) break;

    for (let i = 0; i < mergeCount; i++) {
      groups[i] = groups[i].concat(groups[groups.length - 1 - i]);
    }
    groups.splice(groups.length - mergeCount, mergeCount);
  }

  let flatPattern = groups.flat();
  for (let i = 0; i < steps; i++) {
    pattern[i] = flatPattern[(i + rotation) % steps];
  }
  return pattern;
}

// Global cached noise buffer
let cachedNoiseBuffer = null;
function getNoiseBuffer(ctx) {
  if (cachedNoiseBuffer) return cachedNoiseBuffer;
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  cachedNoiseBuffer = buffer;
  return buffer;
}

// Generate stereo exponential decay noise buffer for convolution reverb
function createReverbImpulseResponse(ctx, duration = 1.8, decay = 2.0) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);
  for (let i = 0; i < length; i++) {
    const pct = i / length;
    const val = (Math.random() * 2 - 1) * Math.pow(1 - pct, decay);
    left[i] = val;
    right[i] = (Math.random() * 2 - 1) * Math.pow(1 - pct, decay);
  }
  return impulse;
}


// A circular vector knob with a retro neon indicator and click-drag tracking
function VectorKnob({ value, onChange, min = 0, max = 1, step = 0.01, label = '', color = '#00f3ff', size = 36 }) {
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startValueRef.current = value;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaY = startYRef.current - e.clientY; // drag up increases value
    const range = max - min;
    const dragSensitivity = 150; // pixels to drag full range
    const deltaVal = (deltaY / dragSensitivity) * range;
    let nextVal = startValueRef.current + deltaVal;
    
    // Snapping to step
    nextVal = Math.round(nextVal / step) * step;
    nextVal = Math.max(min, Math.min(max, nextVal));
    onChange(nextVal);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Calculate angle for indicator dot (from -135deg to +135deg)
  const pct = (value - min) / (max - min || 1);
  const startAngle = -135;
  const endAngle = 135;
  const angle = startAngle + pct * (endAngle - startAngle);
  const rad = (angle * Math.PI) / 180;

  // Dot coordinates relative to center (radius = size / 2)
  const r = size * 0.32;
  const cx = size / 2;
  const cy = size / 2;
  const dx = cx + Math.sin(rad) * r;
  const dy = cy - Math.cos(rad) * r; // invert Y for SVG space

  // Arc path for the value track
  const pathRadius = size * 0.38;
  const x1 = cx + Math.sin((startAngle * Math.PI) / 180) * pathRadius;
  const y1 = cy - Math.cos((startAngle * Math.PI) / 180) * pathRadius;
  const x2 = cx + Math.sin((angle * Math.PI) / 180) * pathRadius;
  const y2 = cy - Math.cos((angle * Math.PI) / 180) * pathRadius;
  
  const largeArcFlag = angle - startAngle > 180 ? 1 : 0;
  const arcPath = pct > 0.01 
    ? `M ${x1} ${y1} A ${pathRadius} ${pathRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
    : '';

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '4px',
        userSelect: 'none',
        cursor: 'ns-resize'
      }}
      title={`${label}: ${value}`}
    >
      {label && <span style={{ fontSize: '0.36rem', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 'bold' }}>{label}</span>}
      <div 
        onMouseDown={handleMouseDown}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'rgba(5, 10, 18, 0.85)',
          border: `1.5px solid rgba(255, 255, 255, 0.05)`,
          boxShadow: `inset 0 0 10px rgba(0, 0, 0, 0.8)`
        }}
      >
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
          {/* Base background ring */}
          <circle cx={cx} cy={cy} r={pathRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" strokeDasharray="3 2" />
          
          {/* Active glowing value track */}
          {arcPath && (
            <path 
              d={arcPath} 
              fill="none" 
              stroke={color} 
              strokeWidth="2.5" 
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
          )}

          {/* Indicator dial face */}
          <circle cx={cx} cy={cy} r={r} fill="rgba(10, 14, 23, 0.9)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          
          {/* Neon pointer line */}
          <line x1={cx} y1={cy} x2={dx} y2={dy} stroke={color} strokeWidth="2.5" style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
          
          {/* Center axis cap */}
          <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />
        </svg>
      </div>
    </div>
  );
}

export default function Ronin9Panel({
  onClose,
  audioCtx,
  seqCurrentBeatRef,
  isPlaying,
  activeSampleRegistry = [], // [{ slotId: 'A1', buffer: AudioBuffer }]
  recordingInputMode,
  setRecordingInputMode,
  liveRecTargetSlot,
  setLiveRecTargetSlot,
  setSelectedEditSlotId,
  recordingTargetSlotIdRef,
  recordingInputModeRef
}) {
  const [position, setPosition] = useState({ x: 150, y: 100 });
  const [size, setSize] = useState({ width: 950, height: 680 });
  const [activeChannel, setActiveChannel] = useState(0); // 0=Kick, 1=Snare, 2=Cl.Hat, 3=Op.Hat, 4=Clap, 5=Tom

  const getMaxSliceIndex = (slotId) => {
    if (!slotId) return 15;
    const normalizedSlotId = slotId.toLowerCase().trim().replace(/^([a-c])(\d)$/, '$10$2');
    const activeSample = activeSampleRegistry.find(s => s.id === normalizedSlotId);
    if (activeSample) {
      return (activeSample.sliceCount || 16) - 1;
    }
    return 15; // default
  };


  // Sequencer playback settings
  const [tempo, setTempo] = useState(120);
  const [swing, setSwing] = useState(0); // 0 - 75%
  const [feelMode, setFeelMode] = useState('strict'); // 'strict' | 'human' | 'lazy' | 'rushed'
  const [snapOn, setSnapOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [masterSaturation, setMasterSaturation] = useState(0.1);
  const [masterHeavyLight, setMasterHeavyLight] = useState(0.3); // dynamics dial

  // Bitcrusher controls
  const [crushActive, setCrushActive] = useState(false);
  const [crushBits, setCrushBits] = useState(12);
  const [crushSR, setCrushSR] = useState(48000);
  const [crushLowpass, setCrushLowpass] = useState(15000);
  // Onboard Studio FX Rack controls
  const [delayTime, setDelayTime] = useState(0.3);
  const [delayFeedback, setDelayFeedback] = useState(0.4);
  const [delayMix, setDelayMix] = useState(0.0);
  const [reverbMix, setReverbMix] = useState(0.0);
  const [filterType, setFilterType] = useState('lowpass');
  const [filterCutoff, setFilterCutoff] = useState(20000);
  const [filterReso, setFilterReso] = useState(0.7);

  // Rec Routing
  const [recRoutingSlot, setRecRoutingSlot] = useState('none');

  // Channels settings state
  const [channels, setChannels] = useState([
    { name: 'KICK', source: 'synth', pitch: 0, decay: 0.35, saturation: 0.1, attack: 0.001, volume: 0.8, stepsCount: 16, pulses: 4, rotation: 0, grid: Array(16).fill(false), microOffsets: Array(16).fill(0), sampleSlot: 'A1', sliceIdx: 0, lfoRate: 0, lfoDepth: 0 },
    { name: 'SNARE', source: 'synth', pitch: 0, decay: 0.3, saturation: 0.1, attack: 0.001, volume: 0.75, stepsCount: 16, pulses: 0, rotation: 0, grid: Array(16).fill(false), microOffsets: Array(16).fill(0), sampleSlot: 'A2', sliceIdx: 0, lfoRate: 0, lfoDepth: 0 },
    { name: 'CLOSED HAT', source: 'synth', pitch: 0, decay: 0.15, saturation: 0, attack: 0.001, volume: 0.65, stepsCount: 16, pulses: 0, rotation: 0, grid: Array(16).fill(false), microOffsets: Array(16).fill(0), sampleSlot: 'A3', sliceIdx: 0, lfoRate: 0, lfoDepth: 0 },
    { name: 'OPEN HAT', source: 'synth', pitch: 0, decay: 0.45, saturation: 0, attack: 0.001, volume: 0.6, stepsCount: 16, pulses: 0, rotation: 0, grid: Array(16).fill(false), microOffsets: Array(16).fill(0), sampleSlot: 'A4', sliceIdx: 0, lfoRate: 0, lfoDepth: 0 },
    { name: 'CLAP', source: 'synth', pitch: 0, decay: 0.25, saturation: 0.1, attack: 0.001, volume: 0.65, stepsCount: 16, pulses: 0, rotation: 0, grid: Array(16).fill(false), microOffsets: Array(16).fill(0), sampleSlot: 'A5', sliceIdx: 0, lfoRate: 0, lfoDepth: 0 },
    { name: 'LASER/TOM', source: 'synth', pitch: 0, decay: 0.4, saturation: 0.2, attack: 0.001, volume: 0.7, stepsCount: 16, pulses: 0, rotation: 0, grid: Array(16).fill(false), microOffsets: Array(16).fill(0), sampleSlot: 'A6', sliceIdx: 0, lfoRate: 0, lfoDepth: 0 },
  ]);

  // UI state for pads pulsing
  const [padPulsars, setPadPulsars] = useState([false, false, false, false, false, false]);
  const [vectorscopeEnergy, setVectorscopeEnergy] = useState([0, 0, 0, 0, 0, 0]);

  // MIDI CC Mapping properties
  const [midiLearnParam, setMidiLearnParam] = useState(null);
  const [midiMappings, setMidiMappings] = useState({});

  // Refs for audio routing
  const audioCtxRef = useRef(audioCtx || window.__rdAudioContext);
  const masterGainRef = useRef(null);
  const dynamicsCompressorRef = useRef(null);
  const masterSaturationRef = useRef(null);
  const bitcrusherNodeRef = useRef(null);
  const bitcrusherLpRef = useRef(null);
  const studioFilterRef = useRef(null);
  const studioDelayRef = useRef(null);
  const studioDelayFeedbackRef = useRef(null);
  const studioDelayWetRef = useRef(null);
  const studioReverbRef = useRef(null);
  const studioReverbWetRef = useRef(null);


  // References for scheduler loop
  const nextStepTimeRef = useRef(0);
  const lastScheduledBeatRef = useRef(0);
  const channelsRef = useRef(channels);
  channelsRef.current = channels;

  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, startWidth: 0, startHeight: 0 });
  const canvasRef = useRef(null);

  // Colors for visualization
  const channelColors = ['#ff0055', '#00f3ff', '#ffe600', '#ff6e00', '#ff00ff', '#00ff96'];

  // Initialize Position & Size from LocalStorage
  useEffect(() => {
    const savedPos = localStorage.getItem('ronin9_panel_position');
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') setPosition(parsed);
      } catch (e) {}
    }
    const savedSize = localStorage.getItem('ronin9_panel_size');
    if (savedSize) {
      try {
        const parsed = JSON.parse(savedSize);
        if (parsed && typeof parsed.width === 'number' && typeof parsed.height === 'number') setSize(parsed);
      } catch (e) {}
    }
    const savedMappings = localStorage.getItem('ronin9_midi_mappings');
    if (savedMappings) {
      try { setMidiMappings(JSON.parse(savedMappings)); } catch (e) {}
    }
  }, []);

  // Setup Web Audio Graph
  useEffect(() => {
    const ctx = audioCtxRef.current || window.__rdAudioContext;
    if (!ctx) return;

    // Create saturator shaper curve
    const shaper = ctx.createWaveShaper();
    const makeDistortionCurve = (amount) => {
      const k = typeof amount === 'number' ? amount : 50;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      return curve;
    };
    shaper.curve = makeDistortionCurve(10);
    shaper.oversample = '4x';
    masterSaturationRef.current = shaper;

    // Create dynamics compressor
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-15, ctx.currentTime);
    comp.knee.setValueAtTime(8, ctx.currentTime);
    comp.ratio.setValueAtTime(6, ctx.currentTime);
    comp.attack.setValueAtTime(0.003, ctx.currentTime);
    comp.release.setValueAtTime(0.08, ctx.currentTime);
    dynamicsCompressorRef.current = comp;

    // Create 12-bit resampler bitcrusher ScriptProcessor node
    const crusher = ctx.createScriptProcessor(4096, 2, 2);
    crusher.bits = 12;
    crusher.normFreq = 1.0;
    crusher.active = false;
    let phaser = 0;
    let lastL = 0;
    let lastR = 0;

    crusher.onaudioprocess = (e) => {
      const inputL = e.inputBuffer.getChannelData(0);
      const inputR = e.inputBuffer.getChannelData(1);
      const outputL = e.outputBuffer.getChannelData(0);
      const outputR = e.outputBuffer.getChannelData(1);

      if (!crusher.active) {
        for (let i = 0; i < inputL.length; i++) {
          outputL[i] = inputL[i];
          outputR[i] = inputR[i];
        }
        return;
      }

      const step = Math.pow(0.5, crusher.bits);
      const freq = crusher.normFreq;

      for (let i = 0; i < inputL.length; i++) {
        phaser += freq;
        if (phaser >= 1.0) {
          phaser -= 1.0;
          lastL = Math.round(inputL[i] / step) * step;
          lastR = Math.round(inputR[i] / step) * step;
        }
        outputL[i] = lastL;
        outputR[i] = lastR;
      }
    };
    bitcrusherNodeRef.current = crusher;

    // Crusher lowpass filter
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(15000, ctx.currentTime);
    bitcrusherLpRef.current = lp;

    // Master volume gain node
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    masterGainRef.current = gain;

    // 1. Studio Resonant Filter Sweep Node
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(20000, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);
    studioFilterRef.current = filter;

    // 2. Studio Space Echo Delay Node
    const delay = ctx.createDelay(2.0);
    delay.delayTime.setValueAtTime(0.3, ctx.currentTime);
    const fb = ctx.createGain();
    fb.gain.setValueAtTime(0.4, ctx.currentTime);
    const delayWet = ctx.createGain();
    delayWet.gain.setValueAtTime(0.0, ctx.currentTime);
    
    delay.connect(fb);
    fb.connect(delay);
    
    studioDelayRef.current = delay;
    studioDelayFeedbackRef.current = fb;
    studioDelayWetRef.current = delayWet;

    // 3. Studio Convolution Reverb Node
    const reverb = ctx.createConvolver();
    reverb.buffer = createReverbImpulseResponse(ctx, 1.8, 2.0);
    const reverbWet = ctx.createGain();
    reverbWet.gain.setValueAtTime(0.0, ctx.currentTime);
    
    studioReverbRef.current = reverb;
    studioReverbWetRef.current = reverbWet;

    // Audio Graph Connections
    shaper.connect(comp);
    comp.connect(crusher);
    crusher.connect(lp);
    
    // Crusher LP -> Studio Resonant Filter
    lp.connect(filter);
    
    // Filter output -> splits to Dry / Delay / Reverb sends
    // Dry send
    filter.connect(gain);
    // Delay send
    filter.connect(delay);
    delay.connect(delayWet);
    delayWet.connect(gain);
    // Reverb send
    filter.connect(reverb);
    reverb.connect(reverbWet);
    reverbWet.connect(gain);

    gain.connect(ctx.destination);

    // Save master output gain to global hook
    window.__rdDrumMachineOutputNode = gain;

    return () => {
      try {
        shaper.disconnect();
        comp.disconnect();
        crusher.disconnect();
        lp.disconnect();
        filter.disconnect();
        delay.disconnect();
        fb.disconnect();
        delayWet.disconnect();
        reverb.disconnect();
        reverbWet.disconnect();
        gain.disconnect();
      } catch (e) {}
    };
  }, []);

  // Update DSP Graph parameters
  useEffect(() => {
    const ctx = audioCtxRef.current || window.__rdAudioContext;
    if (!ctx) return;

    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.02);
    }
    if (dynamicsCompressorRef.current) {
      // Adjust ratio and threshold based on masterHeavyLight dynamics dial
      const thresholdVal = -15 - masterHeavyLight * 20; // -15dB to -35dB
      const ratioVal = 6 + masterHeavyLight * 14;       // 6:1 to 20:1
      dynamicsCompressorRef.current.threshold.setTargetAtTime(thresholdVal, ctx.currentTime, 0.03);
      dynamicsCompressorRef.current.ratio.setTargetAtTime(ratioVal, ctx.currentTime, 0.03);
    }
    if (bitcrusherNodeRef.current) {
      bitcrusherNodeRef.current.active = crushActive;
      bitcrusherNodeRef.current.bits = crushBits;
      bitcrusherNodeRef.current.normFreq = crushSR / 48000;
    }
    if (bitcrusherLpRef.current) {
      bitcrusherLpRef.current.frequency.setTargetAtTime(crushLowpass, ctx.currentTime, 0.03);
    }
    if (studioFilterRef.current) {
      studioFilterRef.current.type = filterType;
      studioFilterRef.current.frequency.setTargetAtTime(filterCutoff, ctx.currentTime, 0.02);
      studioFilterRef.current.Q.setTargetAtTime(filterReso, ctx.currentTime, 0.02);
    }
    if (studioDelayRef.current) {
      studioDelayRef.current.delayTime.setTargetAtTime(delayTime, ctx.currentTime, 0.02);
    }
    if (studioDelayFeedbackRef.current) {
      studioDelayFeedbackRef.current.gain.setTargetAtTime(delayFeedback, ctx.currentTime, 0.02);
    }
    if (studioDelayWetRef.current) {
      studioDelayWetRef.current.gain.setTargetAtTime(delayMix, ctx.currentTime, 0.02);
    }
    if (studioReverbWetRef.current) {
      studioReverbWetRef.current.gain.setTargetAtTime(reverbMix, ctx.currentTime, 0.02);
    }
  }, [masterVolume, masterHeavyLight, crushActive, crushBits, crushSR, crushLowpass, delayTime, delayFeedback, delayMix, reverbMix, filterType, filterCutoff, filterReso]);

  // Bjorklund Pattern Generator triggers
  const triggerGenerateEuclidean = (idx) => {
    setChannels(prev => {
      const next = [...prev];
      const ch = { ...next[idx] };
      const pattern = generateEuclidean(ch.stepsCount, ch.pulses, ch.rotation);
      ch.grid = pattern;
      next[idx] = ch;
      return next;
    });
  };

  // Sound generator synthesis algorithms
  const triggerDrumSound = (chIdx, time = 0, velocity = 1.0) => {
    const ctx = audioCtxRef.current || window.__rdAudioContext;
    if (!ctx) return;
    if (time === 0) time = ctx.currentTime;

    const ch = channelsRef.current[chIdx];
    const chGain = ctx.createGain();
    const finalVolume = ch.volume * velocity;
    chGain.gain.setValueAtTime(0, time);
    chGain.gain.linearRampToValueAtTime(finalVolume, time + Math.max(0.001, ch.attack));
    chGain.gain.exponentialRampToValueAtTime(0.001, time + ch.decay);

    // Saturation Clipper per channel
    const chSaturation = ctx.createWaveShaper();
    const shaperCurve = new Float32Array(44100);
    const amount = ch.saturation * 120;
    for (let i = 0; i < 44100; ++i) {
      const x = (i * 2) / 44100 - 1;
      shaperCurve[i] = ((3 + amount) * x) / (Math.PI + amount * Math.abs(x));
    }
    chSaturation.curve = shaperCurve;
    chSaturation.oversample = '2x';

    chGain.connect(chSaturation);
    chSaturation.connect(masterSaturationRef.current);

    // Pulse UI indicators
    setTimeout(() => {
      setPadPulsars(prev => {
        const next = [...prev];
        next[chIdx] = true;
        return next;
      });
      setVectorscopeEnergy(prev => {
        const next = [...prev];
        next[chIdx] = 1.0;
        return next;
      });
      setTimeout(() => {
        setPadPulsars(prev => {
          const next = [...prev];
          next[chIdx] = false;
          return next;
        });
      }, 80);
    }, Math.max(0, (time - ctx.currentTime) * 1000));

    if (ch.source === 'synth') {
      // 1. Kick synthesis
      if (chIdx === 0) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const startFreq = 130 + ch.pitch * 10;
        const endFreq = 30 + ch.pitch * 5;
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.12);
        
        osc.connect(chGain);
        osc.start(time);
        osc.stop(time + ch.decay);
      }
      // 2. Snare synthesis
      else if (chIdx === 1) {
        // Swept Tone component
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180 + ch.pitch * 15, time);
        osc.frequency.exponentialRampToValueAtTime(90, time + 0.08);

        const toneGain = ctx.createGain();
        toneGain.gain.setValueAtTime(0.35, time);
        toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

        // Filtered Noise component
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = getNoiseBuffer(ctx);
        const snareFilter = ctx.createBiquadFilter();
        snareFilter.type = 'bandpass';
        snareFilter.frequency.setValueAtTime(1500, time);
        snareFilter.Q.setValueAtTime(2.0, time);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + ch.decay);

        osc.connect(toneGain);
        toneGain.connect(chGain);
        
        noiseNode.connect(snareFilter);
        snareFilter.connect(noiseGain);
        noiseGain.connect(chGain);

        osc.start(time);
        osc.stop(time + 0.1);
        noiseNode.start(time);
        noiseNode.stop(time + ch.decay);
      }
      // 3. Closed Hat
      else if (chIdx === 2) {
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = getNoiseBuffer(ctx);

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8000 + ch.pitch * 400, time);

        noiseNode.connect(filter);
        filter.connect(chGain);

        noiseNode.start(time);
        noiseNode.stop(time + ch.decay);
      }
      // 4. Open Hat
      else if (chIdx === 3) {
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = getNoiseBuffer(ctx);

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7500 + ch.pitch * 400, time);

        noiseNode.connect(filter);
        filter.connect(chGain);

        noiseNode.start(time);
        noiseNode.stop(time + ch.decay);
      }
      // 5. Clap synthesis (Triple impulse click)
      else if (chIdx === 4) {
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = getNoiseBuffer(ctx);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200 + ch.pitch * 80, time);

        const clapGain = ctx.createGain();
        clapGain.gain.setValueAtTime(0, time);
        // Triple snap envelope
        clapGain.gain.linearRampToValueAtTime(1.0, time + 0.002);
        clapGain.gain.exponentialRampToValueAtTime(0.02, time + 0.012);
        clapGain.gain.linearRampToValueAtTime(1.0, time + 0.014);
        clapGain.gain.exponentialRampToValueAtTime(0.02, time + 0.024);
        clapGain.gain.linearRampToValueAtTime(1.0, time + 0.026);
        clapGain.gain.exponentialRampToValueAtTime(0.001, time + ch.decay);

        noiseNode.connect(filter);
        filter.connect(clapGain);
        clapGain.connect(chGain);

        noiseNode.start(time);
        noiseNode.stop(time + ch.decay);
      }
      // 6. Laser / Tom sweep
      else if (chIdx === 5) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500 + ch.pitch * 50, time);
        osc.frequency.exponentialRampToValueAtTime(90, time + ch.decay);

        osc.connect(chGain);
        osc.start(time);
        osc.stop(time + ch.decay);
      }
    } else {
      // 2. Play from Sample buffer registries
      const normalizedSlotId = ch.sampleSlot.toLowerCase().trim().replace(/^([a-c])(\d)$/, '$10$2');
      const activeSample = activeSampleRegistry.find(s => s.id === normalizedSlotId);
      if (activeSample && activeSample.buffer) {
        const src = ctx.createBufferSource();
        src.buffer = activeSample.buffer;
        
        // Pitch mapping
        const playbackRateVal = Math.pow(2.0, ch.pitch / 12.0);
        src.playbackRate.setValueAtTime(playbackRateVal, time);

        // Slice calculations
        const sliceCount = activeSample.sliceCount || 16;
        const sliceIndex = (ch.sliceIdx || 0) % sliceCount;
        const sliceParam = (activeSample.sliceParams && activeSample.sliceParams[sliceIndex]) || {};

        let sliceStartNorm = sliceParam.start !== undefined ? sliceParam.start : (activeSample.start + (sliceIndex / sliceCount) * (activeSample.end - activeSample.start));
        let sliceEndNorm = sliceParam.end !== undefined ? sliceParam.end : (activeSample.start + ((sliceIndex + 1) / sliceCount) * (activeSample.end - activeSample.start));
        
        sliceStartNorm = Math.max(0, Math.min(1, sliceStartNorm));
        sliceEndNorm = Math.max(0, Math.min(1, sliceEndNorm));
        if (sliceStartNorm > sliceEndNorm) {
          const tmp = sliceStartNorm;
          sliceStartNorm = sliceEndNorm;
          sliceEndNorm = tmp;
        }

        const startOffsetSec = sliceStartNorm * activeSample.buffer.duration;
        const sliceDurationSec = (sliceEndNorm - sliceStartNorm) * activeSample.buffer.duration;

        src.connect(chGain);
        // Play the calculated slice portion
        src.start(time, startOffsetSec, Math.min(ch.decay, sliceDurationSec));
      } else {
        // Fallback tone if sample is missing
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(440 + chIdx * 100, time);
        osc.connect(chGain);
        osc.start(time);
        osc.stop(time + 0.1);
      }
    }
  };

  // High-precision step scheduler locked to the workstation beat transport
  useEffect(() => {
    const ctx = audioCtxRef.current || window.__rdAudioContext;
    if (!ctx || !isPlaying) return;

    const intervalId = setInterval(() => {
      const currentBeat = seqCurrentBeatRef.current;
      const lookahead = 0.15; // 150ms lookahead
      const lastScheduledBeat = lastScheduledBeatRef.current;

      // Scan beats inside lookahead window
      const bpm = window.__rdSequencerBpm || 120;
      setTempo(bpm);
      const beatsPerSecond = bpm / 60;
      const secondsPerBeat = 1 / beatsPerSecond;

      const windowStart = lastScheduledBeat;
      const windowEnd = currentBeat + (lookahead * beatsPerSecond);

      channelsRef.current.forEach((ch, chIdx) => {
        const steps = ch.stepsCount;
        for (let s = 0; s < steps; s++) {
          const stepBeat = s * 0.25; // assumes 16th note steps

          // Check for step inside active beat loop
          let isMatch = false;

          // Align to loop window cycles
          const beatInCycle = stepBeat;
          const currentBeatCycle = Math.floor(currentBeat / (steps * 0.25)) * (steps * 0.25);
          const targetBeat = currentBeatCycle + beatInCycle;

          if (targetBeat >= windowStart && targetBeat < windowEnd) {
            isMatch = true;
          }

          if (isMatch && ch.grid[s]) {
            // Calculate absolute time of beat schedule
            const beatDiff = targetBeat - currentBeat;
            let triggerTime = ctx.currentTime + beatDiff * secondsPerBeat;

            // Apply custom micro-timing offsets
            triggerTime += (ch.microOffsets[s] || 0) / 1000;

            // Apply groove feel offsets
            if (feelMode === 'human') {
              triggerTime += (Math.random() - 0.5) * 0.005; // +/-2.5ms jitter
            } else if (feelMode === 'lazy') {
              if (chIdx === 1 || chIdx === 4) { // Snare and Clap laid back
                triggerTime += 0.015; // +15ms late
              } else if (chIdx === 2 || chIdx === 3) { // Hats slightly relaxed
                triggerTime += 0.008; // +8ms late
              }
            } else if (feelMode === 'rushed') {
              triggerTime -= 0.007; // -7ms early
            }

            // Apply grid swing
            if (swing > 0 && (s % 2 !== 0)) {
              const swingDelayBeats = (swing / 100) * 0.25;
              triggerTime += swingDelayBeats * secondsPerBeat;
            }

            // Schedule play sound
            triggerDrumSound(chIdx, triggerTime);
          }
        }
      });

      lastScheduledBeatRef.current = windowEnd;
    }, 25);

    return () => clearInterval(intervalId);
  }, [isPlaying, feelMode, swing]);

  // Live Freehand Keyboard input listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Bind keyboard keys '1' to '6'
      if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        triggerDrumSound(idx);

        // Record on-the-fly step if recording mode is active
        if (isRecording && isPlaying) {
          const bpm = window.__rdSequencerBpm || 120;
          const currentBeat = seqCurrentBeatRef.current;
          const ch = channelsRef.current[idx];
          const steps = ch.stepsCount;

          const exactBeatPos = currentBeat % (steps * 0.25);
          const rawStep = exactBeatPos * 4;
          const closestStep = Math.round(rawStep) % steps;

          setChannels(prev => {
            const next = [...prev];
            const updatedCh = { ...next[idx] };
            updatedCh.grid = [...updatedCh.grid];
            updatedCh.microOffsets = [...updatedCh.microOffsets];

            updatedCh.grid[closestStep] = true;

            if (snapOn) {
              updatedCh.microOffsets[closestStep] = 0;
            } else {
              // Calculate deviation offset in ms
              const devBeats = rawStep - closestStep;
              const devMs = devBeats * (60000 / bpm) / 4;
              updatedCh.microOffsets[closestStep] = devMs;
            }

            next[idx] = updatedCh;
            return next;
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, snapOn, isPlaying]);

  // MIDI Event listener for note triggers & CC maps
  useEffect(() => {
    const handleMidiInput = (e) => {
      const { data } = e.detail;
      const status = data[0];
      const msgChannel = (status & 0x0F) + 1;
      const cmd = status >> 4;

      // Default MIDI channel 10
      if (msgChannel !== 10) return;

      const noteNumber = data[1];
      const velocity = data[2];

      if (cmd === 9 && velocity > 0) { // Note On
        // Map pads dynamically to notes (e.g. C2 = 36 -> Kick, D2 = 38 -> Snare, F#2 = 42 -> Hat etc.)
        let chIdx = -1;
        if (noteNumber === 36) chIdx = 0;
        else if (noteNumber === 38) chIdx = 1;
        else if (noteNumber === 42) chIdx = 2;
        else if (noteNumber === 46) chIdx = 3;
        else if (noteNumber === 39) chIdx = 4;
        else if (noteNumber === 45) chIdx = 5;

        if (chIdx !== -1) {
          triggerDrumSound(chIdx, 0, velocity / 127);
        }
      }
    };

    window.addEventListener('delta7_midi_message', handleMidiInput);
    return () => window.removeEventListener('delta7_midi_message', handleMidiInput);
  }, []);

  // Rec Routing Trigger Logic
  useEffect(() => {
    if (recRoutingSlot !== 'none') {
      setLiveRecTargetSlot(recRoutingSlot);
      if (recordingTargetSlotIdRef) recordingTargetSlotIdRef.current = recRoutingSlot;
      setRecordingInputMode('drums');
      if (recordingInputModeRef) recordingInputModeRef.current = 'drums';
    }
  }, [recRoutingSlot]);

  // Drag listeners
  const handleDragMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.titlebar-btn') || e.target.closest('select')) return;
    e.preventDefault();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y,
    };
    window.addEventListener('mousemove', handleDragMouseMove);
    window.addEventListener('mouseup', handleDragMouseUp);
  };

  const handleDragMouseMove = (e) => {
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    let newX = dragStartRef.current.startX + deltaX;
    let newY = dragStartRef.current.startY + deltaY;

    // Viewport Boundary Constraints (min 120px stays inside screen)
    const padding = 120;
    newX = Math.max(-padding, Math.min(window.innerWidth - padding, newX));
    newY = Math.max(0, Math.min(window.innerHeight - 38, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleDragMouseUp = () => {
    window.removeEventListener('mousemove', handleDragMouseMove);
    window.removeEventListener('mouseup', handleDragMouseUp);
    setPosition(current => {
      localStorage.setItem('ronin9_panel_position', JSON.stringify(current));
      return current;
    });
  };

  // Resize listeners
  const handleResizeMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
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
    const newWidth = Math.max(650, resizeStartRef.current.startWidth + deltaX);
    const newHeight = Math.max(480, resizeStartRef.current.startHeight + deltaY);
    setSize({ width: newWidth, height: newHeight });
  };

  const handleResizeMouseUp = () => {
    window.removeEventListener('mousemove', handleResizeMouseMove);
    window.removeEventListener('mouseup', handleResizeMouseUp);
    setSize(current => {
      localStorage.setItem('ronin9_panel_size', JSON.stringify(current));
      return current;
    });
  };

  // Canvas Phosphor decay render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // 1. Phosphor decay effect (trails)
      ctx.fillStyle = 'rgba(2, 4, 6, 0.18)';
      ctx.fillRect(0, 0, w, h);

      // 2. Background Sonar Radar scanner line
      const now = performance.now();
      const sweepAngle = (now / 3500) % (2 * Math.PI);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sweepAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -140);
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // 3. Central vectorscope deforming visualizer
      const energySum = vectorscopeEnergy.reduce((a, b) => a + b, 0) / 6;
      ctx.beginPath();
      const numPoints = 64;
      const baseR = 30;
      for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * 2 * Math.PI;
        const noiseFactor = Math.sin(theta * 8 + now / 100) * Math.cos(theta * 16) * 5 * energySum;
        const r = baseR + noiseFactor;
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0, 255, 150, ${0.35 + energySum * 0.55})`;
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = energySum * 12;
      ctx.shadowColor = '#00ff96';
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      // Decay visualizer energy levels
      setVectorscopeEnergy(current => current.map(e => e * 0.9));

      // 4. Concentric circular sequencer rings
      const currentBeat = seqCurrentBeatRef.current;
      channelsRef.current.forEach((ch, chIdx) => {
        const r = 42 + chIdx * 17; // concentric radiuses
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.12)';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Orbiting playhead for this ring
        const steps = ch.stepsCount;
        const elapsedPct = (currentBeat % (steps * 0.25)) / (steps * 0.25);
        const playheadAngle = elapsedPct * 2 * Math.PI - Math.PI / 2;
        const px = cx + Math.cos(playheadAngle) * r;
        const py = cy + Math.sin(playheadAngle) * r;

        // Draw active step nodes
        for (let s = 0; s < steps; s++) {
          const stepAngle = (s / steps) * 2 * Math.PI - Math.PI / 2;
          const sx = cx + Math.cos(stepAngle) * r;
          const sy = cy + Math.sin(stepAngle) * r;

          if (ch.grid[s]) {
            ctx.beginPath();
            ctx.arc(sx, sy, 3.5, 0, 2 * Math.PI);
            ctx.fillStyle = channelColors[chIdx];
            ctx.shadowBlur = 8;
            ctx.shadowColor = channelColors[chIdx];
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.beginPath();
            ctx.arc(sx, sy, 1.2, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(197, 198, 199, 0.25)';
            ctx.fill();
          }
        }

        // Draw playhead dot
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const clearSteps = (idx) => {
    setChannels(prev => {
      const next = [...prev];
      const ch = { ...next[idx] };
      ch.grid = Array(ch.stepsCount).fill(false);
      next[idx] = ch;
      return next;
    });
  };

  const handleStepClick = (chIdx, stepIdx) => {
    setChannels(prev => {
      const next = [...prev];
      const ch = { ...next[chIdx] };
      ch.grid = [...ch.grid];
      ch.grid[stepIdx] = !ch.grid[stepIdx];
      next[chIdx] = ch;
      return next;
    });
  };

  const ch = channels[activeChannel];

  return (
    <div
      className="ronin9-panel font-mono"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 99999,
        background: 'rgba(8, 10, 15, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 110, 0, 0.45)',
        borderRadius: '8px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 110, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Titlebar */}
      <div
        className="ronin9-titlebar"
        onMouseDown={handleDragMouseDown}
        style={{
          height: '36px',
          background: 'linear-gradient(90deg, #090e1a 0%, #1a0f05 100%)',
          borderBottom: '1px solid rgba(255, 110, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          cursor: 'move',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ff6e00', animation: 'led-blink-orange 1.5s infinite alternate' }}>⚡</span>
          <span style={{ color: '#ff6e00', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', textShadow: '0 0 5px rgba(255, 110, 0, 0.5)' }}>
            RONIN9 : RADIAL BEAT WORKSTATION
          </span>
        </div>

        {/* Header Rec Routing & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="rec-route-box" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.52rem', color: '#ff0055', opacity: 0.8 }}>REC ROUTE:</span>
            <select
              value={recRoutingSlot}
              onChange={(e) => setRecRoutingSlot(e.target.value)}
              style={{
                background: '#040508',
                border: '1px solid rgba(255, 0, 85, 0.35)',
                borderRadius: '3px',
                color: '#ff0055',
                fontSize: '0.52rem',
                outline: 'none',
                padding: '2px 4px',
                cursor: 'pointer'
              }}
            >
              <option value="none">❌ NOT ROUTED</option>
              {Array.from({ length: 8 }).map((_, i) => (
                <option key={`a${i+1}`} value={`a0${i+1}`}>{`PAD A${i+1}`}</option>
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <option key={`b${i+1}`} value={`b0${i+1}`}>{`PAD B${i+1}`}</option>
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <option key={`c${i+1}`} value={`c0${i+1}`}>{`PAD C${i+1}`}</option>
              ))}
            </select>
            {recRoutingSlot !== 'none' && (
              <span className="route-led blinking-magenta" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff0055', boxShadow: '0 0 6px #ff0055' }}></span>
            )}
          </div>

          <button
            className="titlebar-btn"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ff4444',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              fontFamily: 'monospace'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Console Frame */}
      <div className="ronin9-body" style={{ flex: 1, display: 'flex', minHeight: 0, padding: '12px' }}>
        {/* Left Column: Visualizer Platter & Pads */}
        <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', borderRight: '1px solid rgba(255, 255, 255, 0.05)', paddingRight: '12px' }}>
          
          {/* Radial Canvas Platter */}
          <div className="platter-casing" style={{
            background: 'rgba(5, 7, 10, 0.75)',
            border: '2px solid rgba(0, 243, 255, 0.35)',
            boxShadow: 'inset 0 0 20px rgba(0, 243, 255, 0.05), 0 0 15px rgba(0, 243, 255, 0.1)',
            borderRadius: '50%',
            overflow: 'hidden',
            width: '304px',
            height: '304px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <canvas ref={canvasRef} width="300" height="300" style={{ display: 'block' }} />
          </div>

          {/* Trigger Pads (6 Channels) */}
          <div className="pads-grid" style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
            {channels.map((c, idx) => {
              const isPulsing = padPulsars[idx];
              return (
                <button
                  key={idx}
                  onMouseDown={() => triggerDrumSound(idx)}
                  style={{
                    background: isPulsing ? channelColors[idx] : 'rgba(5, 6, 8, 0.6)',
                    border: `1.5px solid ${channelColors[idx]}`,
                    boxShadow: isPulsing 
                      ? `0 0 15px ${channelColors[idx]}, inset 0 0 5px rgba(255,255,255,0.4)`
                      : `0 0 5px rgba(${idx===0?255:idx===1?0:255}, ${idx===2?230:idx===3?110:0}, ${idx===5?150:255}, 0.15)`,
                    borderRadius: '4px',
                    color: isPulsing ? '#000000' : channelColors[idx],
                    fontWeight: 'bold',
                    fontSize: '0.52rem',
                    height: '42px',
                    cursor: 'pointer',
                    transition: 'all 0.08s ease',
                    textShadow: isPulsing ? 'none' : `0 0 3px ${channelColors[idx]}`
                  }}
                >
                  {c.name}
                  <span style={{ display: 'block', fontSize: '0.38rem', opacity: 0.7 }}>
                    KEY {idx+1}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Column: Settings, Groove, & Presets */}
        <div style={{ flex: '1.4', display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '12px', overflowY: 'auto' }}>
          
          {/* Channel selector tabs */}
          <div className="channel-selector" style={{ display: 'flex', width: '100%', gap: '4px' }}>
            {channels.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setActiveChannel(idx)}
                style={{
                  flex: 1,
                  background: activeChannel === idx ? 'rgba(5, 7, 10, 0.85)' : 'rgba(12, 14, 18, 0.45)',
                  border: activeChannel === idx 
                    ? `1.5px solid ${channelColors[idx]}`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderBottom: activeChannel === idx ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px 4px 0 0',
                  color: activeChannel === idx ? channelColors[idx] : '#c5c6c7',
                  fontSize: '0.45rem',
                  fontWeight: 'bold',
                  padding: '5px 2px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  outline: 'none',
                  textTransform: 'uppercase'
                }}
              >
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Active channel settings editor */}
          <div className="channel-editor" style={{
            background: 'rgba(5, 7, 10, 0.75)',
            border: `1.5px solid ${channelColors[activeChannel]}`,
            boxShadow: `inset 0 0 10px rgba(0, 243, 255, 0.03), 0 0 8px rgba(${activeChannel===0?255:activeChannel===1?0:255}, 110, 255, 0.05)`,
            borderRadius: '4px',
            padding: '10px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            
            {/* Header with Source selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: channelColors[activeChannel] }}>
                CHANNEL CONFIG: {ch.name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.45rem', color: '#8892b0' }}>SOURCE:</span>
                <select
                  value={ch.source}
                  onChange={(e) => setChannels(prev => {
                    const next = [...prev];
                    next[activeChannel] = { ...next[activeChannel], source: e.target.value };
                    return next;
                  })}
                  style={{
                    background: '#040508',
                    border: '1px solid rgba(0, 243, 255, 0.25)',
                    borderRadius: '3px',
                    color: '#00f3ff',
                    fontSize: '0.5rem',
                    outline: 'none',
                    padding: '2px 4px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="synth">⚡ ANALOG SYNTH</option>
                  <option value="sample">📁 BREAKBEAT SAMPLE</option>
                </select>
              </div>
            </div>

            {/* Source controls */}
            {ch.source === 'synth' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', alignItems: 'center', justifyContent: 'center', minHeight: '62px' }}>
                <VectorKnob
                  value={ch.pitch}
                  min={-12}
                  max={12}
                  step={1}
                  label="PITCH OFFSET"
                  color={channelColors[activeChannel]}
                  onChange={(val) => setChannels(prev => {
                    const next = [...prev];
                    next[activeChannel] = { ...next[activeChannel], pitch: val };
                    return next;
                  })}
                />
                <VectorKnob
                  value={ch.decay}
                  min={0.05}
                  max={1.5}
                  step={0.05}
                  label="DECAY LENGTH"
                  color={channelColors[activeChannel]}
                  onChange={(val) => setChannels(prev => {
                    const next = [...prev];
                    next[activeChannel] = { ...next[activeChannel], decay: val };
                    return next;
                  })}
                />
                <VectorKnob
                  value={ch.saturation}
                  min={0}
                  max={0.8}
                  step={0.05}
                  label="DRIVE SHAPE"
                  color={channelColors[activeChannel]}
                  onChange={(val) => setChannels(prev => {
                    const next = [...prev];
                    next[activeChannel] = { ...next[activeChannel], saturation: val };
                    return next;
                  })}
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', alignItems: 'center', minHeight: '62px' }}>
                <div className="control-node" style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.36rem', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 'bold' }}>PAD BUFFER</span>
                  <select
                    value={ch.sampleSlot}
                    onChange={(e) => setChannels(prev => {
                      const next = [...prev];
                      const slotVal = e.target.value;
                      const maxIdx = getMaxSliceIndex(slotVal);
                      const currentSliceIdx = next[activeChannel].sliceIdx || 0;
                      next[activeChannel] = { 
                        ...next[activeChannel], 
                        sampleSlot: slotVal,
                        sliceIdx: Math.min(currentSliceIdx, maxIdx)
                      };
                      return next;
                    })}
                    style={{
                      background: '#040508',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '3px',
                      color: '#ffffff',
                      fontSize: '0.48rem',
                      outline: 'none',
                      padding: '2px 4px',
                      cursor: 'pointer',
                      height: '24px',
                      marginTop: '6px'
                    }}
                  >
                    {Array.from({ length: 8 }).map((_, i) => (
                      <option key={`a${i+1}`} value={`a0${i+1}`}>{`A${i+1}`}</option>
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <option key={`b${i+1}`} value={`b0${i+1}`}>{`B${i+1}`}</option>
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <option key={`c${i+1}`} value={`c0${i+1}`}>{`C${i+1}`}</option>
                    ))}
                  </select>
                </div>
                <VectorKnob
                  value={ch.pitch}
                  min={-12}
                  max={12}
                  step={1}
                  label="PITCH TRANS"
                  color={channelColors[activeChannel]}
                  onChange={(val) => setChannels(prev => {
                    const next = [...prev];
                    next[activeChannel] = { ...next[activeChannel], pitch: val };
                    return next;
                  })}
                />
                <VectorKnob
                  value={ch.decay}
                  min={0.05}
                  max={1.5}
                  step={0.05}
                  label="GATE TIME"
                  color={channelColors[activeChannel]}
                  onChange={(val) => setChannels(prev => {
                    const next = [...prev];
                    next[activeChannel] = { ...next[activeChannel], decay: val };
                    return next;
                  })}
                />
                <VectorKnob
                  value={ch.sliceIdx || 0}
                  min={0}
                  max={getMaxSliceIndex(ch.sampleSlot)}
                  step={1}
                  label="SLICE INDEX"
                  color={channelColors[activeChannel]}
                  onChange={(val) => setChannels(prev => {
                    const next = [...prev];
                    next[activeChannel] = { ...next[activeChannel], sliceIdx: val };
                    return next;
                  })}
                />
              </div>
            )}

            {/* Euclidean Pattern Controls */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
              <span style={{ fontSize: '0.48rem', color: '#ffe600', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                EUCLIDEAN RHYTHM CONFIG
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.42rem', color: '#8892b0' }}>STEPS (m)</span>
                  <input
                    type="range" min="4" max="32" step="1" value={ch.stepsCount}
                    onChange={(e) => setChannels(prev => {
                      const next = [...prev];
                      const val = parseInt(e.target.value);
                      const updatedCh = { ...next[activeChannel], stepsCount: val };
                      updatedCh.grid = Array(val).fill(false);
                      next[activeChannel] = updatedCh;
                      return next;
                    })}
                    className="synth-slider neon-yellow"
                  />
                  <span style={{ fontSize: '0.45rem', color: '#ffe600', textAlign: 'right' }}>{ch.stepsCount} steps</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.42rem', color: '#8892b0' }}>PULSES (n)</span>
                  <input
                    type="range" min="0" max={ch.stepsCount} step="1" value={ch.pulses}
                    onChange={(e) => setChannels(prev => {
                      const next = [...prev];
                      next[activeChannel] = { ...next[activeChannel], pulses: parseInt(e.target.value) };
                      return next;
                    })}
                    className="synth-slider neon-yellow"
                  />
                  <span style={{ fontSize: '0.45rem', color: '#ffe600', textAlign: 'right' }}>{ch.pulses} hits</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.42rem', color: '#8892b0' }}>ROTATION (offset)</span>
                  <input
                    type="range" min="0" max={ch.stepsCount - 1} step="1" value={ch.rotation}
                    onChange={(e) => setChannels(prev => {
                      const next = [...prev];
                      next[activeChannel] = { ...next[activeChannel], rotation: parseInt(e.target.value) };
                      return next;
                    })}
                    className="synth-slider neon-yellow"
                  />
                  <span style={{ fontSize: '0.45rem', color: '#ffe600', textAlign: 'right' }}>+{ch.rotation}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    onClick={() => triggerGenerateEuclidean(activeChannel)}
                    style={{
                      background: '#0c0f05',
                      border: '1.2px solid #ffe600',
                      borderRadius: '3px',
                      color: '#ffe600',
                      fontSize: '0.46rem',
                      fontWeight: 'bold',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      boxShadow: '0 0 6px rgba(255, 230, 0, 0.25)'
                    }}
                  >
                    GENERATE RHYTHM
                  </button>
                  <button
                    onClick={() => clearSteps(activeChannel)}
                    style={{
                      background: '#1a0505',
                      border: '1.2px solid #ff4444',
                      borderRadius: '3px',
                      color: '#ff4444',
                      fontSize: '0.46rem',
                      fontWeight: 'bold',
                      padding: '3px 6px',
                      cursor: 'pointer'
                    }}
                  >
                    CLEAR STEPS
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Manual Override */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.45rem', color: '#8892b0' }}>MANUAL STEP EDITOR:</span>
              <div style={{ display: 'flex', gap: '3px', overflowX: 'auto', paddingBottom: '3px' }}>
                {ch.grid.map((val, stepIdx) => (
                  <button
                    key={stepIdx}
                    onClick={() => handleStepClick(activeChannel, stepIdx)}
                    style={{
                      width: '18px',
                      height: '18px',
                      background: val ? channelColors[activeChannel] : '#040508',
                      border: `1px solid ${val ? channelColors[activeChannel] : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '2px',
                      color: val ? '#000000' : '#8892b0',
                      fontSize: '0.4rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {stepIdx + 1}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Master parameters & Groove section */}
          <div className="master-deck" style={{
            background: 'rgba(5, 7, 10, 0.75)',
            border: '1.5px solid rgba(255, 110, 0, 0.35)',
            boxShadow: '0 0 10px rgba(255, 110, 0, 0.1)',
            borderRadius: '4px',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            
            {/* Top Row: Play/Stop, Rec, Feel modes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setIsRecording(prev => !prev)}
                  style={{
                    background: isRecording ? '#ff0055' : '#040508',
                    border: '1.5px solid #ff0055',
                    borderRadius: '4px',
                    color: isRecording ? '#ffffff' : '#ff0055',
                    fontSize: '0.52rem',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    boxShadow: isRecording ? '0 0 10px #ff0055' : 'none',
                    animation: isRecording ? 'pulse-red 1s infinite alternate' : 'none'
                  }}
                >
                  🔴 OVERDUB REC
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#040508', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', padding: '2px 6px' }}>
                  <span style={{ fontSize: '0.45rem', color: '#c5c6c7' }}>SNAP GRID</span>
                  <input
                    type="checkbox"
                    checked={snapOn}
                    onChange={() => setSnapOn(prev => !prev)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Tempo display and Feel engine */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.52rem', color: '#ffe600' }}>⚡ SYNC: {tempo} BPM</span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.48rem', color: '#8892b0' }}>FEEL:</span>
                  <select
                    value={feelMode}
                    onChange={(e) => setFeelMode(e.target.value)}
                    style={{
                      background: '#040508',
                      border: '1px solid rgba(255, 110, 0, 0.35)',
                      borderRadius: '3px',
                      color: '#ff6e00',
                      fontSize: '0.5rem',
                      outline: 'none',
                      padding: '2px 4px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="strict">STRICT GRID</option>
                    <option value="human">HUMAN JITTER</option>
                    <option value="lazy">LAZY POCKET</option>
                    <option value="rushed">ON THE RUSH</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Middle Row: Knobs & Bitcrusher */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.8fr 2.4fr 1.6fr', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', minHeight: '105px' }}>
              
              {/* Column 1: Master Dynamics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.42rem', color: '#ff0055', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 0, 85, 0.15)', paddingBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Master Dynamics</span>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-around', marginTop: '4px' }}>
                  <VectorKnob
                    value={masterVolume}
                    min={0}
                    max={1}
                    step={0.05}
                    label="VOL"
                    color="#ff0055"
                    size={36}
                    onChange={(val) => setMasterVolume(val)}
                  />
                  <VectorKnob
                    value={masterHeavyLight}
                    min={0}
                    max={1}
                    step={0.05}
                    label="COMP"
                    color="#ff0055"
                    size={36}
                    onChange={(val) => setMasterHeavyLight(val)}
                  />
                </div>
                <span style={{ fontSize: '0.36rem', color: '#8892b0', textAlign: 'center', marginTop: '2px' }}>Vol: {Math.round(masterVolume * 100)}% | Comp: {Math.round(masterHeavyLight * 100)}%</span>
              </div>

              {/* Column 2: Bitcrusher */}
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 243, 255, 0.15)', paddingBottom: '2px' }}>
                  <span style={{ fontSize: '0.42rem', color: '#00f3ff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>12-Bit Crusher</span>
                  <button
                    onClick={() => setCrushActive(prev => !prev)}
                    style={{
                      background: crushActive ? '#00f3ff' : '#040508',
                      border: '1px solid #00f3ff',
                      borderRadius: '2px',
                      color: crushActive ? '#000000' : '#00f3ff',
                      fontSize: '0.38rem',
                      fontWeight: 'bold',
                      padding: '0px 4px',
                      cursor: 'pointer',
                      height: '14px',
                      lineHeight: '12px'
                    }}
                  >
                    {crushActive ? 'ON' : 'BYP'}
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between', marginTop: '4px' }}>
                  <VectorKnob
                    value={crushBits}
                    min={8}
                    max={16}
                    step={1}
                    label="BITS"
                    color="#00f3ff"
                    size={32}
                    onChange={(val) => setCrushBits(val)}
                  />
                  <VectorKnob
                    value={crushSR}
                    min={8000}
                    max={48000}
                    step={1000}
                    label="SR"
                    color="#00f3ff"
                    size={32}
                    onChange={(val) => setCrushSR(val)}
                  />
                  <VectorKnob
                    value={crushLowpass}
                    min={2000}
                    max={20000}
                    step={500}
                    label="LPF"
                    color="#00f3ff"
                    size={32}
                    onChange={(val) => setCrushLowpass(val)}
                  />
                </div>
                <span style={{ fontSize: '0.36rem', color: '#8892b0', textAlign: 'center', marginTop: '2px' }}>{crushBits}bit | {(crushSR/1000).toFixed(1)}k | {(crushLowpass/1000).toFixed(1)}k</span>
              </div>

              {/* Column 3: Space FX (Delay & Reverb) */}
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.42rem', color: '#ff6e00', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 110, 0, 0.15)', paddingBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Space Delay & Reverb Send</span>
                
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between', marginTop: '4px' }}>
                  <VectorKnob
                    value={delayTime}
                    min={0.05}
                    max={1.0}
                    step={0.05}
                    label="TIME"
                    color="#ff6e00"
                    size={32}
                    onChange={(val) => setDelayTime(val)}
                  />
                  <VectorKnob
                    value={delayFeedback}
                    min={0.0}
                    max={0.9}
                    step={0.05}
                    label="FDBK"
                    color="#ff6e00"
                    size={32}
                    onChange={(val) => setDelayFeedback(val)}
                  />
                  <VectorKnob
                    value={delayMix}
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    label="D-MIX"
                    color="#ff6e00"
                    size={32}
                    onChange={(val) => setDelayMix(val)}
                  />
                  <VectorKnob
                    value={reverbMix}
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    label="R-MIX"
                    color="#ff6e00"
                    size={32}
                    onChange={(val) => setReverbMix(val)}
                  />
                </div>
                <span style={{ fontSize: '0.36rem', color: '#8892b0', textAlign: 'center', marginTop: '2px' }}>Dly: {delayTime.toFixed(2)}s ({Math.round(delayMix*100)}%) | Rev: {Math.round(reverbMix*100)}%</span>
              </div>

              {/* Column 4: Resonant Filter Sweep */}
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 255, 150, 0.15)', paddingBottom: '2px' }}>
                  <span style={{ fontSize: '0.42rem', color: '#00ff96', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter Sweep</span>
                  <button
                    onClick={() => setFilterType(prev => prev === 'lowpass' ? 'highpass' : 'lowpass')}
                    style={{
                      background: '#040508',
                      border: '1px solid #00ff96',
                      borderRadius: '2px',
                      color: '#00ff96',
                      fontSize: '0.38rem',
                      fontWeight: 'bold',
                      padding: '0px 4px',
                      cursor: 'pointer',
                      height: '14px',
                      lineHeight: '12px'
                    }}
                  >
                    {filterType === 'lowpass' ? 'LPF' : 'HPF'}
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-around', marginTop: '4px' }}>
                  <VectorKnob
                    value={filterCutoff}
                    min={100}
                    max={18000}
                    step={50}
                    label="CUTOFF"
                    color="#00ff96"
                    size={36}
                    onChange={(val) => setFilterCutoff(val)}
                  />
                  <VectorKnob
                    value={filterReso}
                    min={0.1}
                    max={10.0}
                    step={0.1}
                    label="RESO"
                    color="#00ff96"
                    size={36}
                    onChange={(val) => setFilterReso(val)}
                  />
                </div>
                <span style={{ fontSize: '0.36rem', color: '#8892b0', textAlign: 'center', marginTop: '2px' }}>Cut: {filterCutoff}Hz | Res: {filterReso.toFixed(1)}</span>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '16px',
          height: '16px',
          cursor: 'se-resize',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '0 2px 2px 0'
        }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" style={{ pointerEvents: 'none' }}>
          <line x1="6" y1="0" x2="0" y2="6" stroke="rgba(255, 110, 0, 0.6)" strokeWidth="1.5" />
          <line x1="6" y1="3" x2="3" y2="6" stroke="rgba(255, 110, 0, 0.6)" strokeWidth="1.5" />
          <line x1="6" y1="6" x2="6" y2="6" stroke="rgba(255, 110, 0, 0.6)" strokeWidth="1.5" />
        </svg>
      </div>

      <style>{`
        /* Segmented range slider customizations */
        .synth-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 3px;
          background: #11141a;
          border-radius: 1px;
          outline: none;
        }

        .synth-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 6px;
          height: 10px;
          background: #ffffff;
          border: 1px solid #ff6e00;
          cursor: pointer;
          box-shadow: 0 0 3px rgba(255, 110, 0, 0.85);
        }

        .synth-slider.neon-pink::-webkit-slider-thumb {
          border-color: #ff00ff;
          box-shadow: 0 0 3px #ff00ff;
        }

        .synth-slider.neon-yellow::-webkit-slider-thumb {
          border-color: #ffe600;
          box-shadow: 0 0 3px #ffe600;
        }

        /* LED Blink animations */
        @keyframes led-blink-orange {
          0% { opacity: 0.35; text-shadow: 0 0 1px rgba(255,110,0,0.2); }
          100% { opacity: 1; text-shadow: 0 0 8px rgba(255,110,0,0.8); }
        }

        @keyframes pulse-red {
          0% { box-shadow: 0 0 3px rgba(255,0,85,0.3); opacity: 0.8; }
          100% { box-shadow: 0 0 12px rgba(255,0,85,0.95); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
