import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Knob from './Knob.jsx';

// ==========================================
// 1. FACTORY PRESETS & WAVEFORMS
// ==========================================

const DEFAULT_PARAMS = {
  subOscVol: 0.0,
  subOscOctave: -1,
  noiseVol: 0.0,
  keyTracking: 0.5,
  unisonOn: false,
  unisonDetune: 10,
  preampDrive: 0.1,
  granularActive: false,
  grainSize: 100,
  grainRate: 40,
  grainPosition: 0.0,
  grainSpray: 0.05,
  grainPitchRandom: 0,
  grainSpeed: 1.0,
  grainReverse: false,
  spaceEchoActive: false,
  spaceEchoTime: 0.35,
  spaceEchoFeedback: 0.4,
  spaceEchoWow: 0.15,
  spaceEchoSaturation: 0.2,
  spaceEchoSpring: 0.15,
  leslieSpeed: 'Off',
  oscAWave: 's01',
  oscBWave: 's02',
  oscBalance: 0.5,
  oscATriggerMode: 'pitch',
  oscBTriggerMode: 'pitch',
  reverbMix: 0.15,
  ifx1Type: 'Bypass',
  ifx1Mix: 0.0,
  ifx2Type: 'Bypass',
  mfx1SendA: 0.0,
  mfx1SendB: 0.0,
  mfx2SendA: 0.0,
  mfx2SendB: 0.0,
  stutterOn: false,
  stutterRate: '1/16',
  stutterGate: 1.0,
  stutterSweepDir: 'None',
  stutterSweepTime: 1.0,
  stutterJitter: 0.0,
  stutterPitchSweep: 0
};

const FACTORY_PROGRAMS = Array.from({ length: 9 }, (_, i) => ({
  id: `p${(i + 1).toString().padStart(2, '0')}`,
  name: `A${(i + 1).toString().padStart(3, '0')}: Initialized`,
  category: 'User',
  oscMode: 'single',
  oscAWave: 's01',
  oscAOctave: 0,
  oscAPitch: 0,
  oscADetune: 0,
  oscAPan: 0,
  oscAVol: 0.5,
  oscADelay: 0,
  oscBWave: 's02',
  oscBOctave: 0,
  oscBPitch: 0,
  oscBDetune: 0,
  oscBPan: 0,
  oscBVol: 0,
  oscBDelay: 0,
  oscBalance: 0.5,
  filterMode: 'Single',
  filterType: 'lowpass',
  cutoff: 1000,
  resonance: 0,
  filterEnvAmt: 0,
  portamento: 0,
  vcfEG: { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.1, breakLevel: 0.8, slopeTime: 0.1, sustainLevel: 0.5, releaseTime: 0.1, releaseLevel: 0 },
  vcaEG: { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.1, breakLevel: 0.8, slopeTime: 0.1, sustainLevel: 0.5, releaseTime: 0.1, releaseLevel: 0 },
  pitchEG: { startLevel: 0, attackTime: 0.01, attackLevel: 0, decayTime: 0.1, releaseTime: 0.1 },
  lfo1Rate: 0, lfo1Depth: 0, lfo1Target: 'pitch', lfo1Shape: 'sine',
  lfo2Rate: 0, lfo2Depth: 0, lfo2Target: 'filter', lfo2Shape: 'sine',
  ifx1Type: 'Bypass', ifx1Mix: 0,
  ifx2Type: 'Bypass', ifx2Mix: 0,
  mfx1SendA: 0, mfx1SendB: 0, mfx2SendA: 0, mfx2SendB: 0,
  eqLow: 0, eqMid: 0, eqHigh: 0,
  arpOn: false, arpBpm: 120, arpPattern: 'UP', arpGate: 0.8, arpVelocity: 100, arpDivision: 8
}));

const FACTORY_COMBIS = Array.from({ length: 3 }, (_, i) => ({
  id: `c${(i + 1).toString().padStart(2, '0')}`,
  name: `C${(i + 1).toString().padStart(3, '0')}: Initialized`,
  t1ProgId: 'p01', t1Vol: 0.5, t1Pan: 0, t1MinKey: 0, t1MaxKey: 127, t1Octave: 0,
  t2ProgId: 'p01', t2Vol: 0,   t2Pan: 0, t2MinKey: 0, t2MaxKey: 127, t2Octave: 0,
  t3ProgId: 'p01', t3Vol: 0,   t3Pan: 0, t3MinKey: 0, t3MaxKey: 127, t3Octave: 0,
  t4ProgId: 'p01', t4Vol: 0,   t4Pan: 0, t4MinKey: 0, t4MaxKey: 127, t4Octave: 0,
}));

// MIDI Pitch to Frequency
const getFreq = (note) => 440 * Math.pow(2, (note - 69) / 12);

// ==========================================
// 2. MAIN COMPONENT DECLARATION
// ==========================================

export default function Delta7Synth() {
  // Synth operating state
  const [synthOn, setSynthOn] = useState(false);
  const [isMidiSupported, setIsMidiSupported] = useState(false);
  const [midiDevices, setMidiDevices] = useState([]);
  const [selectedMidiDevice, setSelectedMidiDevice] = useState('');
  const [midiActivity, setMidiActivity] = useState(false);
  const [activeNotes, setActiveNotes] = useState(new Set()); // Onscreen keyboard highlights

  // Workspace selections
  const [currentMode, setCurrentMode] = useState('PROG'); // PROG, COMBI
  const [selectedProgIndex, setSelectedProgIndex] = useState(0);
  const [selectedCombiIndex, setSelectedCombiIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('MAIN'); // MAIN, OSC, FILTER, AMP, FX, ARP, MIDI
  const [editEgTarget, setEditEgTarget] = useState('VCF'); // VCF, VCA in EDIT sub-views

  // Hardware knobs mode (A-mode or B-mode)
  const [realtimeKnobMode, setRealtimeKnobMode] = useState('A'); // 'A' or 'B'

  // MIDI Learn State
  const [midiLearnParam, setMidiLearnParam] = useState(null);
  const [midiMappings, setMidiMappings] = useState(() => {
    try {
      const saved = localStorage.getItem('delta7_midi_mappings');
      return saved ? JSON.parse(saved) : {
        cutoff: 74,
        resonance: 71,
        oscAVol: 7,
        oscBVol: 8,
        eqLow: 75,
        eqMid: 76,
        eqHigh: 77,
        masterVolume: 72,
        kaossX: 12,
        kaossY: 13,
      };
    } catch {
      return {};
    }
  });

  // Current operational parameters (dynamically updated from Program or Combi layers)
  const [params, setParams] = useState({ ...DEFAULT_PARAMS, ...FACTORY_PROGRAMS[0], masterVolume: 80 });

  // Joystick state
  const [joystick, setJoystick] = useState({ x: 0, y: 0 }); // X: Pitch bend (-1 to 1), Y: LFO pitch (+1) or filter modulation (-1)
  const [ribbonVal, setRibbonVal] = useState(0.5); // 0.0 to 1.0 (defaults middle)
  const [ribbonTouched, setRibbonTouched] = useState(false);

  // Kaoss Pad XY state
  const [kaossPad, setKaossPad] = useState({ x: 0.5, y: 0.5, isHolding: false, holdActive: false, touchActive: false });
  const [kaossTargetX, setKaossTargetX] = useState('cutoff'); // cutoff, lfoRate, ifxMix, delayTime
  const [kaossTargetY, setKaossTargetY] = useState('resonance'); // resonance, reverbDecay, chorusRate, ringModMix

  // Master Audio Context references
  const audioCtxRef = useRef(null);
  const activeVoicesRef = useRef(new Map()); // voiceKey (e.g. note-progId) -> voiceObjects
  const masterGainRef = useRef(null);
  const analyserRef = useRef(null);
  const midiOutputsRef = useRef([]); // Add this for MIDI outputs caching

  const playVoiceRef = useRef(null);
  const stopVoiceRef = useRef(null);
  const handleMidiCCRef = useRef(null);
  const joystickRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    playVoiceRef.current = playVoice;
    stopVoiceRef.current = stopVoice;
    handleMidiCCRef.current = handleMidiCC;
    joystickRef.current = joystick;
  });

  // FX Nodes
  const ifx1InputRef = useRef(null);
  const ifx1OutputRef = useRef(null);
  const ifx2InputRef = useRef(null);
  const ifx2OutputRef = useRef(null);
  const ifx1EffectRef = useRef(null);
  const ifx2EffectRef = useRef(null);
  const ifx1MixRef = useRef(null);
  const ifx2MixRef = useRef(null);
  const lastIfx1TypeRef = useRef(null);
  const lastIfx1MixRef = useRef(null);
  const lastIfx2TypeRef = useRef(null);
  const lastIfx2MixRef = useRef(null);
  
  const mfx1Ref = useRef(null); // standard input node or ref
  const delayInputRef = useRef(null);
  const delayOutputRef = useRef(null);
  const activeDelayRef = useRef(null);

  const mfx1SendGainRef = useRef(null); // combined send
  const mfx2Ref = useRef(null);
  const mfx2SendGainRef = useRef(null); // combined send
  const masterEqLowRef = useRef(null);
  const masterEqMidRef = useRef(null);
  const masterEqHighRef = useRef(null);

  // Visualizer Animation
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // --- Sampler States & Slots ---
  const [sampleSlots, setSampleSlots] = useState([
    { id: 's01', name: 'User Slot 1', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false })) },
    { id: 's02', name: 'User Slot 2', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false })) },
    { id: 's03', name: 'User Slot 3', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false })) },
    { id: 's04', name: 'User Slot 4', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false })) },
    { id: 's05', name: 'User Slot 5', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false })) },
    { id: 's06', name: 'User Slot 6', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false })) },
    { id: 's07', name: 'User Slot 7', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false })) },
    { id: 's08', name: 'User Slot 8', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false })) },
  ]);
  const sampleSlotsRef = useRef(sampleSlots);
  useEffect(() => {
    sampleSlotsRef.current = sampleSlots;
  }, [sampleSlots]);

  const [selectedEditSlotId, setSelectedEditSlotId] = useState('s01'); // Target slot in Editor
  const [selectedSliceIndex, setSelectedSliceIndex] = useState(0); // Selected slice index for editing
  const [tapTimes, setTapTimes] = useState([]); // Timestamps for tap tempo calculation
  const [isRecording, setIsRecording] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const [recordSlotId, setRecordSlotId] = useState('s01'); // Target recording user slot
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const activePreviewNodeRef = useRef(null);
  const previewStartTimeRef = useRef(0);
  const previewStartOffsetRef = useRef(0);

  // --- Waveform selection, clipboard, history & recording states ---
  const [recordingInputMode, setRecordingInputMode] = useState('mic'); // 'mic' or 'monitor'
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [undoHistory, setUndoHistory] = useState([]);
  const isDraggingSelectionRef = useRef(false);

  const [selectedDelayRatio, setSelectedDelayRatio] = useState('Free');
  const [modWheelVal, setModWheelVal] = useState(0); // 0 to 127

  const DELAY_RATIOS = useMemo(() => ({
    '1/16': 0.25,
    '1/8T': 1/3,
    '1/8': 0.5,
    '1/8D': 0.75,
    '1/4': 1.0,
    '1/4D': 1.5,
    '1/2': 2.0
  }), []);

  const getSlotLabel = (slotId) => {
    const num = parseInt(slotId.slice(2));
    return `U${num}`;
  };

  // Recorder and Canvas references
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const micAnalyserRef = useRef(null);
  const micSourceRef = useRef(null);
  const recordAnimationFrameIdRef = useRef(null);
  const samplerCanvasRef = useRef(null);

  // Delta Pad Gater FX Refs
  const gaterGainNodeRef = useRef(null);
  const gaterLfoRef = useRef(null);
  const gaterLfoGainRef = useRef(null);

  // Pre-amp Saturation Ref
  const preampNodeRef = useRef(null);

  // Glitch Loop Refs
  const [glitchActive, setGlitchActive] = useState(false);
  const glitchActiveRef = useRef(false);
  const glitchDryGainRef = useRef(null);
  const glitchInputGainRef = useRef(null);
  const glitchDelayRef = useRef(null);
  const glitchFeedbackRef = useRef(null);

  // White Noise Buffer cache (for hybrid subosc/noise layers)
  const whiteNoiseBufferRef = useRef(null);
  const getWhiteNoiseBuffer = (ctx) => {
    if (whiteNoiseBufferRef.current) return whiteNoiseBufferRef.current;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    whiteNoiseBufferRef.current = buffer;
    return buffer;
  };

  // Cleanup mic streaming on unmount & handle browser gesture unlock
  useEffect(() => {
    const handleGesture = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };
    window.addEventListener('click', handleGesture);
    window.addEventListener('keydown', handleGesture);

    return () => {
      cancelAnimationFrame(recordAnimationFrameIdRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  // --- Recorder Deck Action Handlers ---
  const armMicrophone = async () => {
    if (isArmed) {
      disarmMicrophone();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      if (!audioCtxRef.current) initAudio();
      const ctx = audioCtxRef.current;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      micAnalyserRef.current = analyser;
      
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      micSourceRef.current = source;
      
      setIsArmed(true);
      startMicMonitor();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access failed. Please ensure permissions are enabled.");
    }
  };

  const disarmMicrophone = () => {
    cancelAnimationFrame(recordAnimationFrameIdRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (micSourceRef.current) {
      try { micSourceRef.current.disconnect(); } catch {}
      micSourceRef.current = null;
    }
    setIsArmed(false);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    const bar = document.getElementById('mic-level-bar-fill');
    if (bar) bar.style.width = '0%';
  };

  const startMicMonitor = () => {
    const analyser = micAnalyserRef.current;
    if (!analyser) return;
    const array = new Uint8Array(analyser.frequencyBinCount);
    
    const updateLevel = () => {
      analyser.getByteFrequencyData(array);
      let sum = 0;
      for (let i = 0; i < array.length; i++) sum += array[i];
      const avg = sum / array.length;
      
      const bar = document.getElementById('mic-level-bar-fill');
      if (bar) {
        bar.style.width = `${Math.min(100, (avg / 150) * 100)}%`;
      }
      recordAnimationFrameIdRef.current = requestAnimationFrame(updateLevel);
    };
    updateLevel();
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    audioChunksRef.current = [];
    
    let options = { mimeType: 'audio/webm' };
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      options = { mimeType: 'audio/mp4' };
    }
    
    const recorder = new MediaRecorder(streamRef.current, options);
    mediaRecorderRef.current = recorder;
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };
    
    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: options.mimeType });
      const arrayBuffer = await blob.arrayBuffer();
      
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      
      ctx.decodeAudioData(arrayBuffer, (buffer) => {
        const nextSlots = sampleSlotsRef.current.map(slot => {
          if (slot.id === recordSlotId) {
            return {
              ...slot,
              name: `Rec: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
              buffer: buffer,
              revBuffer: getReversedBuffer(ctx, buffer),
              start: 0.0,
              end: 1.0,
              loopStart: 0.0,
              loopEnd: 1.0
            };
          }
          return slot;
        });
        sampleSlotsRef.current = nextSlots;
        setSampleSlots(nextSlots);
      }, (err) => {
        console.error("Decoding voice sample buffer failed:", err);
      });
    };
    
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const armMonitor = async () => {
    if (isArmed) {
      disarmMicrophone();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: true
      });
      // Stop the video tracks immediately to capture only the audio tracks
      stream.getVideoTracks().forEach(track => track.stop());

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach(t => t.stop());
        alert("No audio track found. Please check 'Share tab audio' in the screen share dialog.");
        return;
      }

      streamRef.current = stream;
      
      if (!audioCtxRef.current) initAudio();
      const ctx = audioCtxRef.current;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      micAnalyserRef.current = analyser;
      
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      micSourceRef.current = source;
      
      setIsArmed(true);
      startMicMonitor();
    } catch (err) {
      console.error("Error capturing browser tab audio:", err);
      alert("Screen audio capture failed or cancelled.");
    }
  };

  // --- Waveform Selection Mouse & Touch Handlers ---
  const handleCanvasMouseDown = (e) => {
    const canvas = samplerCanvasRef.current;
    if (!canvas) return;
    const slot = sampleSlots.find(s => s.id === selectedEditSlotId);
    if (!slot || !slot.buffer) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0.0, Math.min(1.0, x / rect.width));

    setSelectionStart(pct);
    setSelectionEnd(pct);
    isDraggingSelectionRef.current = true;
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingSelectionRef.current) return;
    const canvas = samplerCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0.0, Math.min(1.0, x / rect.width));
    setSelectionEnd(pct);
  };

  const handleCanvasMouseUp = () => {
    isDraggingSelectionRef.current = false;
    if (selectionStart !== null && selectionEnd !== null) {
      if (Math.abs(selectionStart - selectionEnd) < 0.005) {
        setSelectionStart(null);
        setSelectionEnd(null);
      }
    }
  };

  const handleCanvasTouchStart = (e) => {
    if (e.touches.length === 0) return;
    const canvas = samplerCanvasRef.current;
    if (!canvas) return;
    const slot = sampleSlots.find(s => s.id === selectedEditSlotId);
    if (!slot || !slot.buffer) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(0.0, Math.min(1.0, x / rect.width));

    setSelectionStart(pct);
    setSelectionEnd(pct);
    isDraggingSelectionRef.current = true;
  };

  const handleCanvasTouchMove = (e) => {
    if (!isDraggingSelectionRef.current || e.touches.length === 0) return;
    const canvas = samplerCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(0.0, Math.min(1.0, x / rect.width));
    setSelectionEnd(pct);
  };

  const handleCanvasTouchEnd = () => {
    isDraggingSelectionRef.current = false;
    if (selectionStart !== null && selectionEnd !== null) {
      if (Math.abs(selectionStart - selectionEnd) < 0.005) {
        setSelectionStart(null);
        setSelectionEnd(null);
      }
    }
  };

  // --- Splicing DSP helpers ---
  const pushUndoState = (slot) => {
    setUndoHistory(prev => {
      const next = [
        {
          slotId: slot.id,
          name: slot.name,
          buffer: slot.buffer,
          revBuffer: slot.revBuffer,
          start: slot.start,
          end: slot.end,
          loopStart: slot.loopStart,
          loopEnd: slot.loopEnd
        },
        ...prev
      ];
      if (next.length > 8) {
        next.pop();
      }
      return next;
    });
  };

  const undoLastAction = () => {
    if (undoHistory.length === 0) return;
    const [lastState, ...remainingHistory] = undoHistory;
    setUndoHistory(remainingHistory);

    const nextSlots = sampleSlotsRef.current.map(slot => {
      if (slot.id === lastState.slotId) {
        return {
          ...slot,
          name: lastState.name,
          buffer: lastState.buffer,
          revBuffer: lastState.revBuffer,
          start: lastState.start,
          end: lastState.end,
          loopStart: lastState.loopStart,
          loopEnd: lastState.loopEnd
        };
      }
      return slot;
    });
    sampleSlotsRef.current = nextSlots;
    setSampleSlots(nextSlots);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const updateBufferForSlot = (slotId, buffer, name) => {
    const ctx = audioCtxRef.current;
    const nextSlots = sampleSlotsRef.current.map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          name: name.slice(0, 24),
          buffer: buffer,
          revBuffer: buffer ? getReversedBuffer(ctx, buffer) : null,
          start: 0.0,
          end: 1.0,
          loopStart: 0.0,
          loopEnd: 1.0
        };
      }
      return slot;
    });
    sampleSlotsRef.current = nextSlots;
    setSampleSlots(nextSlots);
  };

  // --- Waveform Editor Actions ---
  const updateSlotParam = (slotId, param, val) => {
    const nextSlots = sampleSlotsRef.current.map(s => {
      if (s.id === slotId) {
        return { ...s, [param]: val };
      }
      return s;
    });
    sampleSlotsRef.current = nextSlots;
    setSampleSlots(nextSlots);
  };

  const handleStartChange = (val) => {
    const slot = sampleSlots.find(s => s.id === selectedEditSlotId);
    if (!slot) return;
    const clamped = Math.min(val, slot.end - 0.01);
    updateSlotParam(selectedEditSlotId, 'start', clamped);
  };

  const handleEndChange = (val) => {
    const slot = sampleSlots.find(s => s.id === selectedEditSlotId);
    if (!slot) return;
    const clamped = Math.max(val, slot.start + 0.01);
    updateSlotParam(selectedEditSlotId, 'end', clamped);
  };

  const handleLoopStartChange = (val) => {
    const slot = sampleSlots.find(s => s.id === selectedEditSlotId);
    if (!slot) return;
    const clamped = Math.min(val, slot.loopEnd - 0.01);
    updateSlotParam(selectedEditSlotId, 'loopStart', clamped);
  };

  const handleLoopEndChange = (val) => {
    const slot = sampleSlots.find(s => s.id === selectedEditSlotId);
    if (!slot) return;
    const clamped = Math.max(val, slot.loopStart + 0.01);
    updateSlotParam(selectedEditSlotId, 'loopEnd', clamped);
  };

  const handleTapTempo = () => {
    const now = performance.now();
    setTapTimes(prev => {
      const next = [...prev, now].filter(t => now - t < 2000);
      if (next.length >= 2) {
        const intervals = [];
        for (let i = 1; i < next.length; i++) {
          intervals.push(next[i] - next[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const computedBpm = Math.round(60000 / avgInterval);
        if (computedBpm >= 40 && computedBpm <= 250) {
          setParams(prev => ({ ...prev, arpBpm: computedBpm }));
        }
      }
      return next;
    });
  };

  const togglePreviewSample = (slotId) => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const slot = sampleSlotsRef.current.find(s => s.id === slotId);
    if (!slot || !slot.buffer) return;

    if (activePreviewNodeRef.current) {
      try { activePreviewNodeRef.current.stop(); } catch {}
      activePreviewNodeRef.current = null;
      setIsPlayingPreview(false);
      return;
    }

    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    
    const isReverse = slot.reverseOn;
    source.buffer = isReverse && slot.revBuffer ? slot.revBuffer : slot.buffer;

    const previewGain = ctx.createGain();
    const slotVol = slot.volume !== undefined ? slot.volume : 1.0;
    previewGain.gain.setValueAtTime(slotVol, now);
    source.connect(previewGain);

    if (ifx1InputRef.current) {
      previewGain.connect(ifx1InputRef.current);
    } else if (masterGainRef.current) {
      previewGain.connect(masterGainRef.current);
    } else {
      previewGain.connect(ctx.destination);
    }

    const startOffset = isReverse ? (1.0 - slot.end) * slot.buffer.duration : slot.start * slot.buffer.duration;
    const endOffset = isReverse ? (1.0 - slot.start) * slot.buffer.duration : slot.end * slot.buffer.duration;
    const duration = endOffset - startOffset;

    source.loop = slot.loopOn;
    if (slot.loopOn) {
      source.loopStart = isReverse ? (1.0 - slot.loopEnd) * slot.buffer.duration : slot.loopStart * slot.buffer.duration;
      source.loopEnd = isReverse ? (1.0 - slot.loopStart) * slot.buffer.duration : slot.loopEnd * slot.buffer.duration;
      source.start(now, startOffset);
    } else {
      source.start(now, startOffset, Math.max(0.01, duration));
      source.onended = () => {
        if (activePreviewNodeRef.current === source) {
          activePreviewNodeRef.current = null;
          setIsPlayingPreview(false);
        }
      };
    }

    previewStartTimeRef.current = now;
    previewStartOffsetRef.current = startOffset;
    activePreviewNodeRef.current = source;
    setIsPlayingPreview(true);
  };

  useEffect(() => {
    if (activePreviewNodeRef.current) {
      try { activePreviewNodeRef.current.stop(); } catch {}
      activePreviewNodeRef.current = null;
      setIsPlayingPreview(false);
    }
  }, [selectedEditSlotId, activeTab]);

  // Canvas Drawing & Playhead Loop
  const samplerCanvasAnimIdRef = useRef(null);
  useEffect(() => {
    const canvas = samplerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const drawWaveform = () => {
      samplerCanvasAnimIdRef.current = requestAnimationFrame(drawWaveform);
      
      const slot = sampleSlotsRef.current.find(s => s.id === selectedEditSlotId);
      if (!slot) return;
      
      // Clear canvas
      ctx.fillStyle = '#020d1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Center line
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      if (!slot.buffer) {
        ctx.fillStyle = 'rgba(0, 243, 255, 0.45)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NO SAMPLE RECORDED/LOADED', canvas.width / 2, canvas.height / 2 + 3);
        return;
      }
      
      const buffer = slot.buffer;
      const data = buffer.getChannelData(0);
      const step = Math.ceil(data.length / canvas.width);
      const amp = canvas.height / 2;
      
      // Draw Waveform
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
          const idx = i * step + j;
          if (idx < data.length) {
            const dat = data[idx];
            if (dat < min) min = dat;
            if (dat > max) max = dat;
          }
        }
        const x = i;
        const yMin = (1 + min) * amp;
        const yMax = (1 + max) * amp;
        ctx.moveTo(x, yMin);
        ctx.lineTo(x, yMax);
      }
      ctx.stroke();
      
      // Shading inactive start/end regions
      const startX = slot.start * canvas.width;
      const endX = slot.end * canvas.width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(0, 0, startX, canvas.height);
      ctx.fillRect(endX, 0, canvas.width - endX, canvas.height);

      // Selection highlight overlay
      if (selectionStart !== null && selectionEnd !== null) {
        const selStartX = Math.min(selectionStart, selectionEnd) * canvas.width;
        const selEndX = Math.max(selectionStart, selectionEnd) * canvas.width;
        ctx.fillStyle = 'rgba(0, 243, 255, 0.22)';
        ctx.fillRect(selStartX, 0, selEndX - selStartX, canvas.height);

        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(selStartX, 0); ctx.lineTo(selStartX, canvas.height);
        ctx.moveTo(selEndX, 0); ctx.lineTo(selEndX, canvas.height);
        ctx.stroke();
      }
      
      // Visual boundary markers
      ctx.lineWidth = 1.5;
      // Start (Yellow)
      ctx.strokeStyle = '#ffe600';
      ctx.beginPath(); ctx.moveTo(startX, 0); ctx.lineTo(startX, canvas.height); ctx.stroke();
      // End (Red)
      ctx.strokeStyle = '#ff0055';
      ctx.beginPath(); ctx.moveTo(endX, 0); ctx.lineTo(endX, canvas.height); ctx.stroke();
      
      // Loop bounds (dashed green)
      if (slot.loopOn) {
        const loopStartX = slot.loopStart * canvas.width;
        const loopEndX = slot.loopEnd * canvas.width;
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(loopStartX, 0); ctx.lineTo(loopStartX, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(loopEndX, 0); ctx.lineTo(loopEndX, canvas.height); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Slices & tags
      const sliceCount = slot.sliceCount || 16;
      const activeWidth = endX - startX;
      const sliceWidth = activeWidth / sliceCount;
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
      ctx.lineWidth = 1.0;
      ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      
      for (let i = 0; i < sliceCount; i++) {
        const sliceX = startX + i * sliceWidth;
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(sliceX, 0);
          ctx.lineTo(sliceX, canvas.height);
          ctx.stroke();
        }
        ctx.fillText((i + 1).toString(), sliceX + sliceWidth / 2, canvas.height - 4);
      }

      // Highlight the slice selected for editing
      const selX = startX + selectedSliceIndex * sliceWidth;
      ctx.fillStyle = 'rgba(0, 243, 255, 0.06)';
      ctx.fillRect(selX, 0, sliceWidth, canvas.height);
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.7)';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(selX, 0, sliceWidth, canvas.height);

      // Highlight active slices from keyboard voices
      if (activeVoicesRef.current) {
        activeVoicesRef.current.forEach(voiceList => {
          const list = Array.isArray(voiceList) ? voiceList : [voiceList];
          list.forEach(voice => {
            if (!voice) return;
            const isSlotA = voice.slotAId === selectedEditSlotId;
            const isSlotB = voice.slotBId === selectedEditSlotId;
            
            if ((isSlotA || isSlotB) && voice.startTime > 0 && voice.releasedRef && !voice.releasedRef.current) {
              const sliceCount = slot.sliceCount || 16;
              if (isSlotA && paramsRef.current.oscATriggerMode === 'slice') {
                const sliceIndex = ((voice.note - slot.rootNote) % sliceCount + sliceCount) % sliceCount;
                const sX = startX + sliceIndex * sliceWidth;
                ctx.fillStyle = 'rgba(255, 230, 0, 0.15)'; // yellow highlight for OSC A slice
                ctx.fillRect(sX, 0, sliceWidth, canvas.height);
              }
              if (isSlotB && paramsRef.current.oscBTriggerMode === 'slice') {
                const sliceIndex = ((voice.note - slot.rootNote) % sliceCount + sliceCount) % sliceCount;
                const sX = startX + sliceIndex * sliceWidth;
                ctx.fillStyle = 'rgba(255, 0, 255, 0.15)'; // magenta highlight for OSC B slice
                ctx.fillRect(sX, 0, sliceWidth, canvas.height);
              }
            }
          });
        });
      }
      
      // Draw playheads!
      const now = audioCtxRef.current ? audioCtxRef.current.currentTime : 0;
      
      // 1. Preview playhead
      if (isPlayingPreview && activePreviewNodeRef.current && previewStartTimeRef.current > 0) {
        const elapsed = now - previewStartTimeRef.current;
        let playheadSec = previewStartOffsetRef.current + elapsed;
        
        if (slot.loopOn) {
          const loopStartSec = slot.loopStart * buffer.duration;
          const loopEndSec = slot.loopEnd * buffer.duration;
          const loopLen = loopEndSec - loopStartSec;
          if (playheadSec > loopEndSec && loopLen > 0) {
            playheadSec = loopStartSec + ((playheadSec - loopStartSec) % loopLen);
          }
        }
        
        if (playheadSec <= buffer.duration && playheadSec >= 0) {
          const ratio = slot.reverseOn ? (1.0 - (playheadSec / buffer.duration)) : (playheadSec / buffer.duration);
          const playheadX = ratio * canvas.width;
          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(playheadX, 0);
          ctx.lineTo(playheadX, canvas.height);
          ctx.stroke();
        }
      }
      
      // 2. Keyboard voices playheads
      if (activeVoicesRef.current) {
        activeVoicesRef.current.forEach(voiceList => {
          const list = Array.isArray(voiceList) ? voiceList : [voiceList];
          list.forEach(voice => {
            if (!voice) return;
            const isSlotA = voice.slotAId === selectedEditSlotId;
            const isSlotB = voice.slotBId === selectedEditSlotId;
            
            if ((isSlotA || isSlotB) && voice.startTime > 0 && voice.releasedRef && !voice.releasedRef.current) {
              const elapsed = now - voice.startTime;
              
              if (isSlotA) {
                const startOffset = voice.startOffsetA || 0;
                const oscNode = voice.oscA || voice.oscA_L || voice.oscA_R;
                const rate = voice.playheadRateA !== undefined ? voice.playheadRateA : (oscNode && oscNode.playbackRate ? oscNode.playbackRate.value : 1.0);
                let playheadSec = startOffset + elapsed * rate;
                
                const isSliceA = paramsRef.current.oscATriggerMode === 'slice';
                let sliceLoopA = false;
                let sliceReverseA = false;
                const sliceCountA = slot.sliceCount || 16;
                if (isSliceA && slot.sliceParams) {
                  const sliceIndexA = ((voice.note - slot.rootNote) % sliceCountA + sliceCountA) % sliceCountA;
                  sliceLoopA = slot.sliceParams[sliceIndexA]?.loop || false;
                  sliceReverseA = slot.sliceParams[sliceIndexA]?.reverse || false;
                }
                const isLoopingA = isSliceA ? sliceLoopA : slot.loopOn;
                const isReverseForRatioA = isSliceA ? sliceReverseA : slot.reverseOn;
                let valid = true;
                
                if (isSliceA) {
                  const sliceIndex = ((voice.note - slot.rootNote) % sliceCountA + sliceCountA) % sliceCountA;
                  const activeDuration = (slot.end - slot.start) * buffer.duration;
                  const sliceDuration = activeDuration / sliceCountA;
                  const sliceStartSec = startOffset;
                  const sliceEndSec = sliceStartSec + sliceDuration;
                  
                  if (isLoopingA) {
                    if (playheadSec > sliceEndSec && sliceDuration > 0) {
                      playheadSec = sliceStartSec + ((playheadSec - sliceStartSec) % sliceDuration);
                    }
                  } else {
                    if (playheadSec > sliceEndSec) {
                      valid = false;
                    }
                  }
                } else {
                  // Pitch mode
                  if (isLoopingA) {
                    let loopStartSec, loopEndSec;
                    if (isReverseForRatioA) {
                      loopStartSec = (1.0 - slot.loopEnd) * buffer.duration;
                      loopEndSec = (1.0 - slot.loopStart) * buffer.duration;
                    } else {
                      loopStartSec = slot.loopStart * buffer.duration;
                      loopEndSec = slot.loopEnd * buffer.duration;
                    }
                    const loopLen = loopEndSec - loopStartSec;
                    if (playheadSec > loopEndSec && loopLen > 0) {
                      playheadSec = loopStartSec + ((playheadSec - loopStartSec) % loopLen);
                    }
                  } else {
                    let endSec = isReverseForRatioA ? ((1.0 - slot.start) * buffer.duration) : (slot.end * buffer.duration);
                    if (playheadSec > endSec) {
                      valid = false;
                    }
                  }
                }
                
                if (valid && playheadSec <= buffer.duration && playheadSec >= 0) {
                  const ratio = isReverseForRatioA ? (1.0 - (playheadSec / buffer.duration)) : (playheadSec / buffer.duration);
                  const playheadX = ratio * canvas.width;
                  ctx.strokeStyle = '#ffe600';
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.moveTo(playheadX, 0);
                  ctx.lineTo(playheadX, canvas.height);
                  ctx.stroke();
                }
              }
              
              if (isSlotB) {
                const startOffset = voice.startOffsetB || 0;
                const rate = voice.playheadRateB !== undefined ? voice.playheadRateB : (voice.oscB && voice.oscB.playbackRate ? voice.oscB.playbackRate.value : 1.0);
                let playheadSec = startOffset + elapsed * rate;
                
                const isSliceB = paramsRef.current.oscBTriggerMode === 'slice';
                let sliceLoopB = false;
                const sliceCountB = slot.sliceCount || 16;
                if (isSliceB && slot.sliceParams) {
                  const sliceIndexB = ((voice.note - slot.rootNote) % sliceCountB + sliceCountB) % sliceCountB;
                  sliceLoopB = slot.sliceParams[sliceIndexB]?.loop || false;
                }
                const isLoopingB = isSliceB ? sliceLoopB : slot.loopOn;
                let valid = true;
                
                if (isSliceB) {
                  const sliceIndex = ((voice.note - slot.rootNote) % sliceCountB + sliceCountB) % sliceCountB;
                  const activeDuration = (slot.end - slot.start) * buffer.duration;
                  const sliceDuration = activeDuration / sliceCountB;
                  const sliceStartSec = startOffset;
                  const sliceEndSec = sliceStartSec + sliceDuration;
                  
                  if (isLoopingB) {
                    if (playheadSec > sliceEndSec && sliceDuration > 0) {
                      playheadSec = sliceStartSec + ((playheadSec - sliceStartSec) % sliceDuration);
                    }
                  } else {
                    if (playheadSec > sliceEndSec) {
                      valid = false;
                    }
                  }
                } else {
                  // Pitch mode
                  if (isLoopingB) {
                    let loopStartSec, loopEndSec;
                    if (slot.reverseOn) {
                      loopStartSec = (1.0 - slot.loopEnd) * buffer.duration;
                      loopEndSec = (1.0 - slot.loopStart) * buffer.duration;
                    } else {
                      loopStartSec = slot.loopStart * buffer.duration;
                      loopEndSec = slot.loopEnd * buffer.duration;
                    }
                    const loopLen = loopEndSec - loopStartSec;
                    if (playheadSec > loopEndSec && loopLen > 0) {
                      playheadSec = loopStartSec + ((playheadSec - sliceStartSec) % loopLen); // wait, it was: playheadSec = loopStartSec + ((playheadSec - loopStartSec) % loopLen);
                    }
                  } else {
                    let endSec = slot.reverseOn ? ((1.0 - slot.start) * buffer.duration) : (slot.end * buffer.duration);
                    if (playheadSec > endSec) {
                      valid = false;
                    }
                  }
                }
                
                if (valid && playheadSec <= buffer.duration && playheadSec >= 0) {
                  const ratio = slot.reverseOn ? (1.0 - (playheadSec / buffer.duration)) : (playheadSec / buffer.duration);
                  const playheadX = ratio * canvas.width;
                  ctx.strokeStyle = '#ff00ff';
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.moveTo(playheadX, 0);
                  ctx.lineTo(playheadX, canvas.height);
                  ctx.stroke();
                }
              }
            }
          });
        });
      }
    };
    
    drawWaveform();
    
    return () => {
      cancelAnimationFrame(samplerCanvasAnimIdRef.current);
    };
  }, [selectedEditSlotId, isPlayingPreview, selectedSliceIndex, selectionStart, selectionEnd]);

  // Auto-update Tempo Synced Delay times when Master BPM changes
  useEffect(() => {
    if (selectedDelayRatio !== 'Free') {
      const multiplier = DELAY_RATIOS[selectedDelayRatio];
      if (multiplier) {
        const beatDuration = 60 / (params.arpBpm || 120);
        const computedTime = Math.min(1.5, Math.max(0.05, multiplier * beatDuration));
        setParams(prev => ({ ...prev, spaceEchoTime: parseFloat(computedTime.toFixed(3)) }));
      }
    }
  }, [params.arpBpm, selectedDelayRatio, DELAY_RATIOS]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    if (params.stutterOn) {
      activeVoicesRef.current.forEach(vList => {
        const triggerStutter = (v) => {
          if (v && !v.stutterTimeoutId) {
            startStutterModulation(v);
          }
        };
        if (Array.isArray(vList)) vList.forEach(triggerStutter); else triggerStutter(vList);
      });
    } else {
      activeVoicesRef.current.forEach(vList => {
        const stopStutter = (v) => {
          if (v) {
            if (v.stutterTimeoutId) {
              clearTimeout(v.stutterTimeoutId);
              v.stutterTimeoutId = null;
            }
            const now = ctx.currentTime;
            [v.oscA, v.oscA_L, v.oscA_R].forEach(osc => {
              if (osc) {
                osc.loop = v.isLoopA || false;
                if (v.isLoopA) {
                  osc.loopStart = v.origLoopStartA || 0;
                  osc.loopEnd = v.origLoopEndA || 0;
                } else {
                  osc.loopStart = 0;
                  osc.loopEnd = 0;
                }
                osc.playbackRate.setValueAtTime(v.freqScaleA || 1.0, now);
              }
            });
            if (v.oscB) {
              v.oscB.loop = v.isLoopB || false;
              if (v.isLoopB) {
                v.oscB.loopStart = v.origLoopStartB || 0;
                v.oscB.loopEnd = v.origLoopEndB || 0;
              } else {
                v.oscB.loopStart = 0;
                v.oscB.loopEnd = 0;
              }
              v.oscB.playbackRate.setValueAtTime(v.freqScaleB || 1.0, now);
            }
            if (v.stutterGateNode) {
              v.stutterGateNode.gain.cancelScheduledValues(now);
              v.stutterGateNode.gain.setValueAtTime(1.0, now);
            }
            v.stutterLoopStart = undefined;
            v.stutterLoopStartB = undefined;
          }
        };
        if (Array.isArray(vList)) vList.forEach(stopStutter); else stopStutter(vList);
      });
    }
  }, [params.stutterOn]);

  // Synced Parameters Ref (for low-latency access in loop)
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
    if (audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      
      const safeLow = typeof params.eqLow === 'number' && isFinite(params.eqLow) ? params.eqLow : 0;
      const safeMid = typeof params.eqMid === 'number' && isFinite(params.eqMid) ? params.eqMid : 0;
      const safeHigh = typeof params.eqHigh === 'number' && isFinite(params.eqHigh) ? params.eqHigh : 0;
      
      if (masterEqLowRef.current) masterEqLowRef.current.gain.setValueAtTime(safeLow * 3, now);
      if (masterEqMidRef.current) masterEqMidRef.current.gain.setValueAtTime(safeMid * 3, now);
      if (masterEqHighRef.current) masterEqHighRef.current.gain.setValueAtTime(safeHigh * 3, now);
      
      const sendA1 = typeof params.mfx1SendA === 'number' && isFinite(params.mfx1SendA) ? params.mfx1SendA : 0;
      const sendB1 = typeof params.mfx1SendB === 'number' && isFinite(params.mfx1SendB) ? params.mfx1SendB : 0;
      const sendA2 = typeof params.mfx2SendA === 'number' && isFinite(params.mfx2SendA) ? params.mfx2SendA : 0;
      const sendB2 = typeof params.mfx2SendB === 'number' && isFinite(params.mfx2SendB) ? params.mfx2SendB : 0;
      
      if (mfx1SendGainRef.current) {
        mfx1SendGainRef.current.gain.setValueAtTime((sendA1 + sendB1) * 0.5, now);
      }
      if (mfx2SendGainRef.current) {
        mfx2SendGainRef.current.gain.setValueAtTime((sendA2 + sendB2) * 0.5, now);
      }
      
      if (preampNodeRef.current && typeof params.preampDrive === 'number' && isFinite(params.preampDrive)) {
        preampNodeRef.current.curve = makeDistCurve(params.preampDrive);
      }

      // Rebuild or update IFX1 mix/type
      const type1 = params.ifx1Type || 'Bypass';
      const mix1 = typeof params.ifx1Mix === 'number' && isFinite(params.ifx1Mix) ? params.ifx1Mix : 0.0;
      if (type1 !== lastIfx1TypeRef.current) {
        connectIFXSlot(audioCtxRef.current, 1, type1, mix1);
        lastIfx1TypeRef.current = type1;
        lastIfx1MixRef.current = mix1;
      } else if (mix1 !== lastIfx1MixRef.current) {
        if (ifx1MixRef.current) {
          updateIFXMix(ifx1MixRef.current, mix1);
        }
        lastIfx1MixRef.current = mix1;
      }

      // Rebuild or update IFX2 mix/type
      const type2 = params.ifx2Type || 'Bypass';
      const mix2 = typeof params.ifx2Mix === 'number' && isFinite(params.ifx2Mix) ? params.ifx2Mix : 0.0;
      if (type2 !== lastIfx2TypeRef.current) {
        connectIFXSlot(audioCtxRef.current, 2, type2, mix2);
        lastIfx2TypeRef.current = type2;
        lastIfx2MixRef.current = mix2;
      } else if (mix2 !== lastIfx2MixRef.current) {
        if (ifx2MixRef.current) {
          updateIFXMix(ifx2MixRef.current, mix2);
        }
        lastIfx2MixRef.current = mix2;
      }

      // Update Reverb return/master wet gain
      const revMix = typeof params.reverbMix === 'number' && isFinite(params.reverbMix) ? params.reverbMix : 0.15;
      if (mfx2Ref.current && mfx2Ref.current.output) {
        mfx2Ref.current.output.gain.setValueAtTime(revMix, now);
      }

      // Update Space Echo and standard delay live parameters
      if (activeDelayRef.current) {
        const ad = activeDelayRef.current;
        if (params.spaceEchoActive) {
          const baseTime = typeof params.spaceEchoTime === 'number' && isFinite(params.spaceEchoTime) ? params.spaceEchoTime : 0.35;
          // Smooth tape speed sweeps for pitch-bending wow/flutter!
          if (ad.delay1) ad.delay1.delayTime.setTargetAtTime(baseTime, now, 0.05);
          if (ad.delay2) ad.delay2.delayTime.setTargetAtTime(baseTime * 1.5, now, 0.05);
          if (ad.delay3) ad.delay3.delayTime.setTargetAtTime(baseTime * 2.0, now, 0.05);

          // Wow depth modulation
          const wow = typeof params.spaceEchoWow === 'number' && isFinite(params.spaceEchoWow) ? params.spaceEchoWow : 0.15;
          if (ad.wowGain1) ad.wowGain1.gain.setValueAtTime(wow * 0.003, now);
          if (ad.wowGain2) ad.wowGain2.gain.setValueAtTime(wow * 0.004, now);
          if (ad.wowGain3) ad.wowGain3.gain.setValueAtTime(wow * 0.005, now);

          if (ad.flutterGain1) ad.flutterGain1.gain.setValueAtTime(wow * 0.0006, now);
          if (ad.flutterGain2) ad.flutterGain2.gain.setValueAtTime(wow * 0.0008, now);
          if (ad.flutterGain3) ad.flutterGain3.gain.setValueAtTime(wow * 0.0010, now);

          // Feedback levels
          const fb = typeof params.spaceEchoFeedback === 'number' && isFinite(params.spaceEchoFeedback) ? params.spaceEchoFeedback : 0.4;
          if (ad.feedbackGain1) ad.feedbackGain1.gain.setValueAtTime(fb * 0.5, now);
          if (ad.feedbackGain2) ad.feedbackGain2.gain.setValueAtTime(fb * 0.35, now);
          if (ad.feedbackGain3) ad.feedbackGain3.gain.setValueAtTime(fb * 0.25, now);

          // Spring Reverb mix and Tape Saturation drive
          const spring = typeof params.spaceEchoSpring === 'number' && isFinite(params.spaceEchoSpring) ? params.spaceEchoSpring : 0.15;
          if (ad.springGain) ad.springGain.gain.setValueAtTime(spring, now);
          
          const sat = typeof params.spaceEchoSaturation === 'number' && isFinite(params.spaceEchoSaturation) ? params.spaceEchoSaturation : 0.2;
          if (ad.tapeSat) ad.tapeSat.curve = makeDistCurve(sat * 0.5);
        } else {
          // Standard Stereo Delay update
          const delayTimeVal = typeof params.spaceEchoTime === 'number' && isFinite(params.spaceEchoTime) ? params.spaceEchoTime : 0.35;
          const fbVal = typeof params.spaceEchoFeedback === 'number' && isFinite(params.spaceEchoFeedback) ? params.spaceEchoFeedback : 0.4;
          if (ad.delayL && ad.delayR) {
            ad.delayL.delayTime.setTargetAtTime(delayTimeVal, now, 0.05);
            ad.delayR.setTargetAtTime ? ad.delayR.setTargetAtTime(delayTimeVal * 1.33, now, 0.05) : ad.delayR.delayTime.setTargetAtTime(delayTimeVal * 1.33, now, 0.05);
            ad.feedbackL.gain.setValueAtTime(fbVal, now);
            ad.feedbackR.gain.setValueAtTime(fbVal, now);
          }
        }
      }

      // Update Leslie Rotary speaker speed (Off / Slow: 1.1Hz / Fast: 6.8Hz) on both IFX slots
      const targetFreq = params.leslieSpeed === 'Fast' ? 6.8 : (params.leslieSpeed === 'Slow' ? 1.1 : 0);
      if (ifx1EffectRef.current && ifx1EffectRef.current.lfo) {
        ifx1EffectRef.current.lfo.frequency.setTargetAtTime(targetFreq, now, 0.8);
      }
      if (ifx2EffectRef.current && ifx2EffectRef.current.lfo) {
        ifx2EffectRef.current.lfo.frequency.setTargetAtTime(targetFreq, now, 0.8);
      }
    }
  }, [params]);

  // Load Programs
  const handleSelectProgram = (idx) => {
    setSelectedProgIndex(idx);
    if (currentMode === 'PROG') {
      setParams(prev => ({
        ...DEFAULT_PARAMS,
        ...prev,
        ...FACTORY_PROGRAMS[idx]
      }));
    }
  };

  // Load Combis
  const handleSelectCombi = (idx) => {
    setSelectedCombiIndex(idx);
    if (currentMode === 'COMBI') {
      const combi = FACTORY_COMBIS[idx];
      // Initialize with track 1 settings primarily but mark as combi Mode active
      const prog1 = FACTORY_PROGRAMS.find(p => p.id === combi.t1ProgId) || FACTORY_PROGRAMS[0];
      setParams(prev => ({
        ...DEFAULT_PARAMS,
        ...prev,
        ...prog1,
        arpOn: false // turn off standard arp
      }));
    }
  };

  // Switch PROG/COMBI Mode
  const toggleMode = (mode) => {
    setCurrentMode(mode);
    if (mode === 'PROG') {
      handleSelectProgram(selectedProgIndex);
    } else {
      handleSelectCombi(selectedCombiIndex);
    }
  };

  // ==========================================
  // 3. AUDIO ENGINE INITIALIZATION & ROUTING
  // ==========================================

  const initAudio = () => {
    if (audioCtxRef.current) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass({ latencyHint: 'interactive' });
    audioCtxRef.current = ctx;

    const now = ctx.currentTime;

    // Output analyzer
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Master Volume Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(paramsRef.current.masterVolume / 100 * 0.5, now);
    masterGainRef.current = masterGain;

    // 3-Band EQ Nodes
    const eqLow = ctx.createBiquadFilter();
    eqLow.type = 'lowshelf';
    eqLow.frequency.setValueAtTime(200, now);
    eqLow.gain.setValueAtTime(paramsRef.current.eqLow * 3, now);
    masterEqLowRef.current = eqLow;

    const eqMid = ctx.createBiquadFilter();
    eqMid.type = 'peaking';
    eqMid.Q.setValueAtTime(1.0, now);
    eqMid.frequency.setValueAtTime(1000, now);
    eqMid.gain.setValueAtTime(paramsRef.current.eqMid * 3, now);
    masterEqMidRef.current = eqMid;

    const eqHigh = ctx.createBiquadFilter();
    eqHigh.type = 'highshelf';
    eqHigh.frequency.setValueAtTime(5000, now);
    eqHigh.gain.setValueAtTime(paramsRef.current.eqHigh * 3, now);
    masterEqHighRef.current = eqHigh;

    // FX RACK SETUP - Static Input/Output nodes
    ifx1InputRef.current = ctx.createGain();
    ifx1OutputRef.current = ctx.createGain();
    ifx2InputRef.current = ctx.createGain();
    ifx2OutputRef.current = ctx.createGain();

    ifx1OutputRef.current.connect(ifx2InputRef.current);

    // Dynamic Chorus, Phaser, Autowah, Overdrive connections
    connectIFXSlot(ctx, 1, paramsRef.current.ifx1Type, paramsRef.current.ifx1Mix);
    connectIFXSlot(ctx, 2, paramsRef.current.ifx2Type, paramsRef.current.ifx2Mix);
    lastIfx1TypeRef.current = paramsRef.current.ifx1Type;
    lastIfx1MixRef.current = paramsRef.current.ifx1Mix;
    lastIfx2TypeRef.current = paramsRef.current.ifx2Type;
    lastIfx2MixRef.current = paramsRef.current.ifx2Mix;

    // MFX1 (Delay / Space Echo)
    delayInputRef.current = ctx.createGain();
    delayOutputRef.current = ctx.createGain();
    mfx1Ref.current = delayInputRef.current; // for backward compatibility in checks

    rebuildDelayEffect(ctx, paramsRef.current.spaceEchoActive);

    const mfx1SendGain = ctx.createGain();
    mfx1SendGain.gain.setValueAtTime(0.2, now);
    mfx1SendGainRef.current = mfx1SendGain;

    // MFX2 (Reverb)
    const mfx2 = createReverb(ctx);
    mfx2Ref.current = mfx2;
    const mfx2SendGain = ctx.createGain();
    mfx2SendGain.gain.setValueAtTime(0.3, now);
    mfx2SendGainRef.current = mfx2SendGain;

    // Tube Preamp Saturation
    const preampNode = ctx.createWaveShaper();
    preampNode.curve = makeDistCurve(paramsRef.current.preampDrive);
    preampNodeRef.current = preampNode;

    // Connections post-IFX2
    ifx2OutputRef.current.connect(preampNode);

    // Splits post-preamp
    preampNode.connect(eqLow); // Direct path to EQ

    // FX Sends
    preampNode.connect(mfx1SendGain);
    mfx1SendGain.connect(delayInputRef.current);
    delayOutputRef.current.connect(eqLow); // Delay/Echo output to master EQ

    preampNode.connect(mfx2SendGain);
    mfx2SendGain.connect(mfx2.input);
    mfx2.output.connect(eqLow); // Reverb output to master EQ

    // EQ chain
    eqLow.connect(eqMid);
    eqMid.connect(eqHigh);

    // Delta Pad Gater DSP Node setup
    const gaterGainNode = ctx.createGain();
    gaterGainNode.gain.setValueAtTime(1.0, now);
    gaterGainNodeRef.current = gaterGainNode;

    const gaterLfo = ctx.createOscillator();
    gaterLfo.type = 'square';
    gaterLfo.frequency.setValueAtTime(5, now); // default rate 5Hz
    gaterLfoRef.current = gaterLfo;

    const gaterLfoGain = ctx.createGain();
    gaterLfoGain.gain.setValueAtTime(0.0, now); // default depth 0 (bypass)
    gaterLfoGainRef.current = gaterLfoGain;

    gaterLfo.connect(gaterLfoGain);
    gaterLfoGain.connect(gaterGainNode.gain);
    gaterLfo.start(now);

    // Glitch loop chain insertion before masterGain
    const glitchDryGain = ctx.createGain();
    glitchDryGain.gain.setValueAtTime(1.0, now);
    glitchDryGainRef.current = glitchDryGain;

    const glitchInputGain = ctx.createGain();
    glitchInputGain.gain.setValueAtTime(0.0, now);
    glitchInputGainRef.current = glitchInputGain;

    const glitchDelay = ctx.createDelay(1.0);
    glitchDelay.delayTime.setValueAtTime(0.08, now);
    glitchDelayRef.current = glitchDelay;

    const glitchFeedback = ctx.createGain();
    glitchFeedback.gain.setValueAtTime(0.0, now);
    glitchFeedbackRef.current = glitchFeedback;

    // Glitch routing
    eqHigh.connect(gaterGainNode);

    // Dry path
    gaterGainNode.connect(glitchDryGain);
    glitchDryGain.connect(masterGain);

    // Wet (Glitch loop) path
    gaterGainNode.connect(glitchInputGain);
    glitchInputGain.connect(glitchDelay);
    glitchDelay.connect(glitchFeedback);
    glitchFeedback.connect(glitchDelay); // feedback loop
    glitchDelay.connect(masterGain);

    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    setSynthOn(true);
    startVisualizer();
  };

  const getReversedBuffer = (ctx, originalBuffer) => {
    if (!originalBuffer) return null;
    const reversed = ctx.createBuffer(
      originalBuffer.numberOfChannels,
      originalBuffer.length,
      originalBuffer.sampleRate
    );
    for (let c = 0; c < originalBuffer.numberOfChannels; c++) {
      const origData = originalBuffer.getChannelData(c);
      const revData = reversed.getChannelData(c);
      for (let i = 0; i < originalBuffer.length; i++) {
        revData[i] = origData[originalBuffer.length - 1 - i];
      }
    }
    return reversed;
  };

  const connectIFXSlot = (ctx, slotNum, type, mix) => {
    const inputNode = slotNum === 1 ? ifx1InputRef.current : ifx2InputRef.current;
    const outputNode = slotNum === 1 ? ifx1OutputRef.current : ifx2OutputRef.current;
    if (!inputNode || !outputNode) return;

    try { inputNode.disconnect(); } catch {}

    const oldEffect = slotNum === 1 ? ifx1EffectRef.current : ifx2EffectRef.current;
    if (oldEffect) {
      if (oldEffect.lfo) { try { oldEffect.lfo.stop(); } catch {} }
      if (oldEffect.carrier) { try { oldEffect.carrier.stop(); } catch {} }
    }

    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    const now = ctx.currentTime;

    dryGain.gain.setValueAtTime(1.0 - mix, now);
    wetGain.gain.setValueAtTime(mix, now);

    inputNode.connect(dryGain);
    dryGain.connect(outputNode);

    let fxNode = null;

    if (type === 'Chorus') {
      const delayL = ctx.createDelay();
      const delayR = ctx.createDelay();
      delayL.delayTime.setValueAtTime(0.015, now);
      delayR.delayTime.setValueAtTime(0.015, now);

      const lfo = ctx.createOscillator();
      lfo.type = 'triangle';
      lfo.frequency.setValueAtTime(1.5, now);

      const lfoGainL = ctx.createGain();
      lfoGainL.gain.setValueAtTime(0.004, now); 

      const lfoGainR = ctx.createGain();
      lfoGainR.gain.setValueAtTime(-0.004, now); // 180 out-of-phase

      lfo.connect(lfoGainL);
      lfoGainL.connect(delayL.delayTime);
      lfo.connect(lfoGainR);
      lfoGainR.connect(delayR.delayTime);
      lfo.start(now);

      inputNode.connect(delayL);
      inputNode.connect(delayR);

      const merger = ctx.createChannelMerger(2);
      delayL.connect(merger, 0, 0);
      delayR.connect(merger, 0, 1);
      merger.connect(wetGain);

      fxNode = { delayL, delayR, lfo };
    } else if (type === 'Overdrive') {
      const dist = ctx.createWaveShaper();
      dist.curve = makeDistCurve(0.4);
      inputNode.connect(dist);
      dist.connect(wetGain);
      fxNode = dist;
    } else if (type === 'Phaser') {
      const phaser = ctx.createBiquadFilter();
      phaser.type = 'allpass';
      phaser.frequency.setValueAtTime(800, now);
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.5, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(400, now);
      lfo.connect(lfoGain);
      lfoGain.connect(phaser.frequency);
      lfo.start(now);

      inputNode.connect(phaser);
      phaser.connect(wetGain);
      fxNode = { phaser, lfo };
    } else if (type === 'Autowah') {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(4.0, now);
      filter.frequency.setValueAtTime(600, now);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(2.0, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(500, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);

      inputNode.connect(filter);
      filter.connect(wetGain);
      fxNode = { filter, lfo };
    } else if (type === 'Rotary Speaker') {
      const delayL = ctx.createDelay();
      const delayR = ctx.createDelay();
      
      const speedHz = paramsRef.current.leslieSpeed === 'Fast' ? 6.8 : (paramsRef.current.leslieSpeed === 'Slow' ? 1.1 : 0);
      
      delayL.delayTime.setValueAtTime(0.007, now);
      delayR.delayTime.setValueAtTime(0.007, now);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(speedHz, now);

      const lfoGainL = ctx.createGain();
      lfoGainL.gain.setValueAtTime(0.003, now);
      
      const lfoGainR = ctx.createGain();
      lfoGainR.gain.setValueAtTime(-0.003, now); 

      lfo.connect(lfoGainL);
      lfoGainL.connect(delayL.delayTime);
      lfo.connect(lfoGainR);
      lfoGainR.connect(delayR.delayTime);

      const tremoloGainL = ctx.createGain();
      const tremoloGainR = ctx.createGain();
      tremoloGainL.gain.setValueAtTime(0.85, now);
      tremoloGainR.gain.setValueAtTime(0.85, now);

      const tremGainL = ctx.createGain();
      tremGainL.gain.setValueAtTime(0.15, now);
      const tremGainR = ctx.createGain();
      tremGainR.gain.setValueAtTime(-0.15, now);

      lfo.connect(tremGainL);
      tremGainL.connect(tremoloGainL.gain);
      lfo.connect(tremGainR);
      tremGainR.connect(tremoloGainR.gain);

      if (speedHz > 0) {
        lfo.start(now);
      }

      inputNode.connect(delayL);
      delayL.connect(tremoloGainL);
      inputNode.connect(delayR);
      delayR.connect(tremoloGainR);

      const merger = ctx.createChannelMerger(2);
      tremoloGainL.connect(merger, 0, 0);
      tremoloGainR.connect(merger, 0, 1);
      merger.connect(wetGain);

      fxNode = { delayL, delayR, lfo, tremoloGainL, tremoloGainR, speedHz };
    } else if (type === 'Flanger') {
      const delay = ctx.createDelay();
      delay.delayTime.setValueAtTime(0.003, now);
      const feedback = ctx.createGain();
      feedback.gain.setValueAtTime(0.65, now);
      
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.3, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.002, now);
      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);
      lfo.start(now);

      inputNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay); 
      delay.connect(wetGain);
      fxNode = { delay, lfo, feedback };
    } else if (type === 'Ring Modulator') {
      const ringMod = ctx.createGain();
      ringMod.gain.setValueAtTime(0.0, now);
      const carrier = ctx.createOscillator();
      carrier.frequency.setValueAtTime(440, now);
      
      carrier.connect(ringMod.gain);
      inputNode.connect(ringMod);
      ringMod.connect(wetGain);
      carrier.start(now);
      fxNode = { ringMod, carrier };
    } else { 
      inputNode.connect(wetGain);
    }

    wetGain.connect(outputNode);

    if (slotNum === 1) {
      ifx1EffectRef.current = fxNode;
      ifx1MixRef.current = { dryGain, wetGain };
    } else {
      ifx2EffectRef.current = fxNode;
      ifx2MixRef.current = { dryGain, wetGain };
    }
  };

  const rebuildDelayEffect = (ctx, useSpaceEcho) => {
    const input = delayInputRef.current;
    const output = delayOutputRef.current;
    if (!input || !output) return;

    try { input.disconnect(); } catch {}
    
    if (activeDelayRef.current) {
      const ad = activeDelayRef.current;
      if (ad.wowLfo) { try { ad.wowLfo.stop(); } catch {} }
      if (ad.flutterLfo) { try { ad.flutterLfo.stop(); } catch {} }
    }

    if (useSpaceEcho) {
      const echo = createSpaceEchoNode(ctx);
      input.connect(echo.input);
      echo.output.connect(output);
      activeDelayRef.current = echo;
    } else {
      const delay = createStereoDelay(ctx);
      input.connect(delay.input);
      delay.output.connect(output);
      activeDelayRef.current = delay;
    }
  };

  const createSpringReverb = (ctx) => {
    const input = ctx.createGain();
    const output = ctx.createGain();

    const delays = [0.033, 0.041, 0.047];
    const feedbacks = [0.75, -0.72, 0.70];

    delays.forEach((delayTime, idx) => {
      const delayNode = ctx.createDelay();
      delayNode.delayTime.setValueAtTime(delayTime, ctx.currentTime);

      const feedbackNode = ctx.createGain();
      feedbackNode.gain.setValueAtTime(feedbacks[idx], ctx.currentTime);

      input.connect(delayNode);
      delayNode.connect(feedbackNode);
      feedbackNode.connect(delayNode);
      delayNode.connect(output);
    });

    return { input, output };
  };

  const createSpaceEchoNode = (ctx) => {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const now = ctx.currentTime;

    const delay1 = ctx.createDelay(2.0);
    const delay2 = ctx.createDelay(2.0);
    const delay3 = ctx.createDelay(2.0);

    const baseTime = paramsRef.current.spaceEchoTime || 0.35;
    delay1.delayTime.setValueAtTime(baseTime, now);
    delay2.delayTime.setValueAtTime(baseTime * 1.5, now);
    delay3.delayTime.setValueAtTime(baseTime * 2.0, now);

    const wowLfo = ctx.createOscillator();
    wowLfo.frequency.setValueAtTime(0.4, now);
    const wowGain1 = ctx.createGain();
    const wowGain2 = ctx.createGain();
    const wowGain3 = ctx.createGain();
    
    const flutterLfo = ctx.createOscillator();
    flutterLfo.frequency.setValueAtTime(7.0, now);
    const flutterGain1 = ctx.createGain();
    const flutterGain2 = ctx.createGain();
    const flutterGain3 = ctx.createGain();

    const wowAmt = paramsRef.current.spaceEchoWow || 0.15;
    wowGain1.gain.setValueAtTime(wowAmt * 0.003, now);
    wowGain2.gain.setValueAtTime(wowAmt * 0.004, now);
    wowGain3.gain.setValueAtTime(wowAmt * 0.005, now);

    flutterGain1.gain.setValueAtTime(wowAmt * 0.0006, now);
    flutterGain2.gain.setValueAtTime(wowAmt * 0.0008, now);
    flutterGain3.gain.setValueAtTime(wowAmt * 0.0010, now);

    wowLfo.connect(wowGain1); wowGain1.connect(delay1.delayTime);
    wowLfo.connect(wowGain2); wowGain2.connect(delay2.delayTime);
    wowLfo.connect(wowGain3); wowGain3.connect(delay3.delayTime);

    flutterLfo.connect(flutterGain1); flutterGain1.connect(delay1.delayTime);
    flutterLfo.connect(flutterGain2); flutterGain2.connect(delay2.delayTime);
    flutterLfo.connect(flutterGain3); flutterGain3.connect(delay3.delayTime);

    wowLfo.start(now);
    flutterLfo.start(now);

    const tapeSat = ctx.createWaveShaper();
    tapeSat.curve = makeDistCurve(paramsRef.current.spaceEchoSaturation * 0.5);

    const feedbackGain1 = ctx.createGain();
    const feedbackGain2 = ctx.createGain();
    const feedbackGain3 = ctx.createGain();
    
    const fbVal = paramsRef.current.spaceEchoFeedback || 0.4;
    feedbackGain1.gain.setValueAtTime(fbVal * 0.5, now);
    feedbackGain2.gain.setValueAtTime(fbVal * 0.35, now);
    feedbackGain3.gain.setValueAtTime(fbVal * 0.25, now);

    input.connect(delay1);
    input.connect(delay2);
    input.connect(delay3);

    const panner1 = ctx.createStereoPanner();
    panner1.pan.setValueAtTime(-0.3, now);
    const panner2 = ctx.createStereoPanner();
    panner2.pan.setValueAtTime(0.1, now);
    const panner3 = ctx.createStereoPanner();
    panner3.pan.setValueAtTime(0.4, now);

    delay1.connect(panner1);
    delay2.connect(panner2);
    delay3.connect(panner3);

    const hpfNode = ctx.createBiquadFilter();
    hpfNode.type = 'highpass';
    hpfNode.frequency.setValueAtTime(150, now);
    hpfNode.Q.setValueAtTime(0.5, now);

    const lpfNode = ctx.createBiquadFilter();
    lpfNode.type = 'lowpass';
    lpfNode.frequency.setValueAtTime(1800, now);
    lpfNode.Q.setValueAtTime(0.5, now);

    panner1.connect(hpfNode);
    panner2.connect(hpfNode);
    panner3.connect(hpfNode);

    hpfNode.connect(lpfNode);
    lpfNode.connect(tapeSat);

    tapeSat.connect(feedbackGain1); feedbackGain1.connect(delay1);
    tapeSat.connect(feedbackGain2); feedbackGain2.connect(delay2);
    tapeSat.connect(feedbackGain3); feedbackGain3.connect(delay3);

    const springReverb = createSpringReverb(ctx);
    const springGain = ctx.createGain();
    const springMix = paramsRef.current.spaceEchoSpring || 0.15;
    springGain.gain.setValueAtTime(springMix, now);

    input.connect(springReverb.input);
    springReverb.output.connect(springGain);

    tapeSat.connect(output);
    springGain.connect(output);

    return {
      input, output,
      delay1, delay2, delay3,
      wowGain1, wowGain2, wowGain3,
      flutterGain1, flutterGain2, flutterGain3,
      feedbackGain1, feedbackGain2, feedbackGain3,
      springGain, tapeSat,
      hpfNode, lpfNode,
      wowLfo, flutterLfo
    };
  };

  const toggleGlitch = (active) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    glitchActiveRef.current = active;
    setGlitchActive(active);

    if (active) {
      if (glitchDryGainRef.current) glitchDryGainRef.current.gain.setTargetAtTime(0, now, 0.01);

      const glitchSize = 0.05 + Math.random() * 0.10;
      if (glitchDelayRef.current) glitchDelayRef.current.delayTime.setValueAtTime(glitchSize, now);

      if (glitchInputGainRef.current) {
        glitchInputGainRef.current.gain.setValueAtTime(1.0, now);
        glitchInputGainRef.current.gain.setValueAtTime(0.0, now + glitchSize);
      }

      if (glitchFeedbackRef.current) glitchFeedbackRef.current.gain.setValueAtTime(0.99, now);
    } else {
      if (glitchDryGainRef.current) glitchDryGainRef.current.gain.setTargetAtTime(1.0, now, 0.02);
      if (glitchFeedbackRef.current) glitchFeedbackRef.current.gain.setTargetAtTime(0.0, now, 0.02);
      if (glitchInputGainRef.current) glitchInputGainRef.current.gain.setValueAtTime(0.0, now);
    }
  };

  const updateIFXMix = (mixNode, mix) => {
    if (!audioCtxRef.current || !mixNode) return;
    const now = audioCtxRef.current.currentTime;
    mixNode.dryGain.gain.setValueAtTime(1.0 - mix, now);
    mixNode.wetGain.gain.setValueAtTime(mix, now);
  };

  const createStereoDelay = (ctx) => {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const delayL = ctx.createDelay();
    const delayR = ctx.createDelay();
    const feedbackL = ctx.createGain();
    const feedbackR = ctx.createGain();
    const now = ctx.currentTime;

    delayL.delayTime.setValueAtTime(0.375, now); // dotted 8th note at 120bpm
    delayR.delayTime.setValueAtTime(0.5, now);   // quarter note at 120bpm

    feedbackL.gain.setValueAtTime(0.4, now);
    feedbackR.gain.setValueAtTime(0.4, now);

    // Cross feedback for Ping Pong
    input.connect(delayL);
    delayL.connect(feedbackL);
    feedbackL.connect(delayR); // left feeds right

    delayR.connect(feedbackR);
    feedbackR.connect(delayL); // right feeds left

    delayL.connect(output);
    delayR.connect(output);

    return { input, output, delayL, delayR, feedbackL, feedbackR };
  };

  const createReverb = (ctx) => {
    // Generate exponential noise tail for algorithmic reverb
    const input = ctx.createGain();
    const output = ctx.createGain();
    const convolver = ctx.createConvolver();
    const now = ctx.currentTime;

    const sampleRate = ctx.sampleRate;
    const length = sampleRate * 2.5; // 2.5 second reverb tail
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (sampleRate * 0.7)); // decay constant
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }

    convolver.buffer = impulse;
    input.connect(convolver);
    convolver.connect(output);

    return { input, output };
  };

  const makeDistCurve = (amount) => {
    const k = typeof amount === 'number' ? amount * 100 : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  };

  // ==========================================
  // 4. VOICE ALLOCATION & SCHEDULING (HI SYNTH)
  // ==========================================

  const startStutterModulation = (voice) => {
    if (!voice || voice.stutterTimeoutId) return;
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const scheduleStutterStep = (stepIndex) => {
      if (voice.releasedRef && voice.releasedRef.current) {
        return;
      }
      
      const currentParams = paramsRef.current;
      if (!currentParams.stutterOn) {
        const now = ctx.currentTime;
        [voice.oscA, voice.oscA_L, voice.oscA_R].forEach(osc => {
          if (osc) {
            osc.loop = voice.isLoopA || false;
            if (voice.isLoopA) {
              osc.loopStart = voice.origLoopStartA || 0;
              osc.loopEnd = voice.origLoopEndA || 0;
            } else {
              osc.loopStart = 0;
              osc.loopEnd = 0;
            }
            osc.playbackRate.setValueAtTime(voice.freqScaleA || 1.0, now);
          }
        });

        if (voice.oscB) {
          voice.oscB.loop = voice.isLoopB || false;
          if (voice.isLoopB) {
            voice.oscB.loopStart = voice.origLoopStartB || 0;
            voice.oscB.loopEnd = voice.origLoopEndB || 0;
          } else {
            voice.oscB.loopStart = 0;
            voice.oscB.loopEnd = 0;
          }
          voice.oscB.playbackRate.setValueAtTime(voice.freqScaleB || 1.0, now);
        }

        if (voice.stutterGateNode) {
          voice.stutterGateNode.gain.cancelScheduledValues(now);
          voice.stutterGateNode.gain.setValueAtTime(1.0, now);
        }

        voice.stutterTimeoutId = null;
        voice.stutterLoopStart = undefined;
        voice.stutterLoopStartB = undefined;
        return;
      }

      let rate = currentParams.stutterRate || '1/16';
      const elapsed = ctx.currentTime - voice.startTime;

      if (currentParams.stutterSweepDir !== 'None') {
        const sweepDuration = currentParams.stutterSweepTime || 1.0;
        const progress = Math.min(1.0, elapsed / sweepDuration);
        
        const rates = ['1/4', '1/8', '1/12', '1/16', '1/24', '1/32', '1/64', '1/128'];
        const startIndex = rates.indexOf(currentParams.stutterRate || '1/16');
        if (startIndex !== -1) {
          if (currentParams.stutterSweepDir === 'Up') {
            const targetIndex = rates.length - 1;
            const currentIndex = Math.round(startIndex + (targetIndex - startIndex) * progress);
            rate = rates[currentIndex];
          } else {
            const startIdx = rates.length - 1;
            const targetIdx = startIndex;
            const currentIndex = Math.round(startIdx - (startIdx - targetIdx) * progress);
            rate = rates[currentIndex];
          }
        }
      }

      const bpm = currentParams.arpBpm || 120;
      const beatDuration = 60 / bpm;
      let stepDur = beatDuration * 0.25;
      if (rate === '1/4') stepDur = beatDuration;
      else if (rate === '1/8') stepDur = beatDuration * 0.5;
      else if (rate === '1/12') stepDur = beatDuration * (1/3);
      else if (rate === '1/16') stepDur = beatDuration * 0.25;
      else if (rate === '1/24') stepDur = beatDuration * (1/6);
      else if (rate === '1/32') stepDur = beatDuration * 0.125;
      else if (rate === '1/64') stepDur = beatDuration * 0.0625;
      else if (rate === '1/128') stepDur = beatDuration * 0.03125;

      if (currentParams.stutterJitter > 0) {
        const jitterAmount = (Math.random() * 2 - 1) * currentParams.stutterJitter * 0.3 * stepDur;
        stepDur = Math.max(0.01, stepDur + jitterAmount);
      }

      const gateDur = stepDur * (currentParams.stutterGate !== undefined ? currentParams.stutterGate : 1.0);

      let pitchOffset = 0;
      if (currentParams.stutterPitchSweep !== 0) {
        const sweepDuration = currentParams.stutterSweepTime || 1.0;
        const progress = Math.min(1.0, elapsed / sweepDuration);
        pitchOffset = progress * currentParams.stutterPitchSweep;
      }

      const now = ctx.currentTime;

      if (voice.stutterGateNode) {
        voice.stutterGateNode.gain.cancelScheduledValues(now);
        voice.stutterGateNode.gain.setValueAtTime(0, now);
        voice.stutterGateNode.gain.linearRampToValueAtTime(1, now + 0.003);
        voice.stutterGateNode.gain.setValueAtTime(1, now + Math.max(0.005, gateDur - 0.003));
        voice.stutterGateNode.gain.linearRampToValueAtTime(0, now + gateDur);
      }

      if (voice.bufferA && (voice.oscA || voice.oscA_L || voice.oscA_R)) {
        if (voice.stutterLoopStart === undefined) {
          const elapsedBufTime = elapsed * (voice.freqScaleA || 1.0);
          const activeDurationA = (voice.endA - voice.startA) * voice.bufferA.duration;
          voice.stutterLoopStart = voice.startOffsetA + (elapsedBufTime % Math.max(0.1, activeDurationA));
        }

        [voice.oscA, voice.oscA_L, voice.oscA_R].forEach(osc => {
          if (osc) {
            osc.loop = true;
            osc.loopStart = voice.stutterLoopStart;
            osc.loopEnd = Math.min(voice.bufferA.duration, voice.stutterLoopStart + stepDur * (voice.freqScaleA || 1.0));
            const finalPitchScale = (voice.freqScaleA || 1.0) * Math.pow(2, pitchOffset / 12);
            osc.playbackRate.setValueAtTime(finalPitchScale, now);
          }
        });
      }

      if (voice.bufferB && voice.oscB) {
        if (voice.stutterLoopStartB === undefined) {
          const elapsedBufTimeB = elapsed * (voice.freqScaleB || 1.0);
          const activeDurationB = (voice.endB - voice.startB) * voice.bufferB.duration;
          voice.stutterLoopStartB = voice.startOffsetB + (elapsedBufTimeB % Math.max(0.1, activeDurationB));
        }

        voice.oscB.loop = true;
        voice.oscB.loopStart = voice.stutterLoopStartB;
        voice.oscB.loopEnd = Math.min(voice.bufferB.duration, voice.stutterLoopStartB + stepDur * (voice.freqScaleB || 1.0));
        const finalPitchScaleB = (voice.freqScaleB || 1.0) * Math.pow(2, pitchOffset / 12);
        voice.oscB.playbackRate.setValueAtTime(finalPitchScaleB, now);
      }

      voice.stutterTimeoutId = setTimeout(() => {
        scheduleStutterStep(stepIndex + 1);
      }, stepDur * 1000);
    };

    scheduleStutterStep(0);
  };

  // Triggers one single program sound voice
  const playProgramVoice = (ctx, note, velocity, prog, voiceKey, delayOffset = 0, trackIdx = undefined) => {
    const now = ctx.currentTime + delayOffset;

    // Pitch bends
    const bendRange = 2; // +/- 2 semitones
    const pbFactor = Math.pow(2, (joystick.x * bendRange) / 12);
    
    // Ribbon cutoff modulation factor
    const cutoffMod = ribbonTouched ? (ribbonVal * 2000 - 1000) : 0;

    // Apply Kaoss Modulations (if targeted to VCF cutoff/resonance)
    let kaossCutoffOffset = 0;
    let kaossResonanceOffset = 0;
    if (kaossTargetX === 'cutoff') kaossCutoffOffset = (kaossPad.x * 3000 - 1500);
    if (kaossTargetY === 'resonance') kaossResonanceOffset = (kaossPad.y * 10);

    const baseFreq = getFreq(note) * pbFactor;

    // Look up sampler slots to get correct root notes and buffers
    const slotAId = prog.oscAWave || 's01';
    const slotA = sampleSlotsRef.current.find(s => s.id === slotAId) || sampleSlotsRef.current[0];
    const rootNoteA = slotA ? slotA.rootNote : 60;
    const rootFreqA = getFreq(rootNoteA);

    const slotBId = prog.oscBWave || 's02';
    const slotB = sampleSlotsRef.current.find(s => s.id === slotBId) || sampleSlotsRef.current[1];
    const rootNoteB = slotB ? slotB.rootNote : 60;
    const rootFreqB = getFreq(rootNoteB);

    // Resolve slice environments and parameters for trigger modes
    let sliceEnvA = null;
    let slicePitchA = 0;
    let sliceStretchA = 0;
    let sliceLoopA = false;
    let sliceReverseA = false;
    if (slotA && slotA.sliceParams && prog.oscATriggerMode === 'slice') {
      const sliceCountA = slotA.sliceCount || 16;
      const sliceIndexA = ((note - rootNoteA) % sliceCountA + sliceCountA) % sliceCountA;
      sliceEnvA = slotA.sliceParams[sliceIndexA] || { attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false };
      slicePitchA = sliceEnvA.pitch !== undefined ? sliceEnvA.pitch : 0;
      sliceStretchA = sliceEnvA.stretch !== undefined ? sliceEnvA.stretch : 0;
      sliceLoopA = sliceEnvA.loop !== undefined ? sliceEnvA.loop : false;
      sliceReverseA = sliceEnvA.reverse !== undefined ? sliceEnvA.reverse : false;
    }

    let sliceEnvB = null;
    let slicePitchB = 0;
    let sliceStretchB = 0;
    let sliceLoopB = false;
    let sliceReverseB = false;
    if (slotB && slotB.sliceParams && prog.oscBTriggerMode === 'slice') {
      const sliceCountB = slotB.sliceCount || 16;
      const sliceIndexB = ((note - rootNoteB) % sliceCountB + sliceCountB) % sliceCountB;
      sliceEnvB = slotB.sliceParams[sliceIndexB] || { attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false };
      slicePitchB = sliceEnvB.pitch !== undefined ? sliceEnvB.pitch : 0;
      sliceStretchB = sliceEnvB.stretch !== undefined ? sliceEnvB.stretch : 0;
      sliceLoopB = sliceEnvB.loop !== undefined ? sliceEnvB.loop : false;
      sliceReverseB = sliceEnvB.reverse !== undefined ? sliceEnvB.reverse : false;
    }

    const isReverseA = prog.oscATriggerMode === 'slice' ? sliceReverseA : (slotA ? slotA.reverseOn : false);
    const isReverseB = prog.oscBTriggerMode === 'slice' ? sliceReverseB : (slotB ? slotB.reverseOn : false);

    const bufferA = slotA ? (isReverseA ? slotA.revBuffer : slotA.buffer) : null;
    const revBufferA = slotA ? slotA.revBuffer : null;
    const bufferB = slotB ? (isReverseB ? slotB.revBuffer : slotB.buffer) : null;
    const revBufferB = slotB ? slotB.revBuffer : null;

    const isLoopA = prog.oscATriggerMode === 'slice' ? sliceLoopA : (slotA ? slotA.loopOn : false);
    const isLoopB = prog.oscBTriggerMode === 'slice' ? sliceLoopB : (slotB ? slotB.loopOn : false);

    const oscAOctave = prog.oscAOctave !== undefined ? prog.oscAOctave : 0;
    const oscAPitch = prog.oscAPitch !== undefined ? prog.oscAPitch : 0;
    const oscADetune = prog.oscADetune !== undefined ? prog.oscADetune : 0;

    const oscBOctave = prog.oscBOctave !== undefined ? prog.oscBOctave : 0;
    const oscBPitch = prog.oscBPitch !== undefined ? prog.oscBPitch : 0;
    const oscBDetune = prog.oscBDetune !== undefined ? prog.oscBDetune : 0;

    let freqScaleA = 1.0;
    if (bufferA) {
      if (prog.oscATriggerMode === 'slice') {
        freqScaleA = Math.pow(2, oscAOctave) * Math.pow(2, oscAPitch / 12) * Math.pow(2, slicePitchA / 12);
      } else {
        freqScaleA = (baseFreq * Math.pow(2, oscAOctave) * Math.pow(2, oscAPitch / 12)) / rootFreqA;
      }
    }

    let freqScaleB = 1.0;
    if (bufferB) {
      if (prog.oscBTriggerMode === 'slice') {
        freqScaleB = Math.pow(2, oscBOctave) * Math.pow(2, oscBPitch / 12) * Math.pow(2, slicePitchB / 12);
      } else {
        freqScaleB = (baseFreq * Math.pow(2, oscBOctave) * Math.pow(2, oscBPitch / 12)) / rootFreqB;
      }
    }

    // --- VCF Dual Filter ---
    const filter1 = ctx.createBiquadFilter();
    const filter2 = ctx.createBiquadFilter();

    filter1.type = prog.filterType;
    filter2.type = 'highpass'; // series HPF setup

    // Filter Key Tracking
    const trackingAmount = prog.keyTracking !== undefined ? prog.keyTracking : 0.5;
    const trackingOffset = trackingAmount * (note - 60) * 30; // 30Hz per MIDI note from C4
    const baseCutoff = Math.max(20, Math.min(20000, prog.cutoff + cutoffMod + kaossCutoffOffset + trackingOffset));
    const baseQ = Math.max(0.1, Math.min(25, prog.resonance + kaossResonanceOffset));

    filter1.frequency.setValueAtTime(baseCutoff, now);
    filter1.Q.setValueAtTime(baseQ, now);
    filter2.frequency.setValueAtTime(150, now); // Subtle low cut
    filter2.Q.setValueAtTime(1.0, now);

    // --- Create Oscillators A & B ---
    let oscA = null, oscB = null;
    let oscA_L = null, oscA_R = null;
    let gainA = null, gainB = null;
    let gainA_L = null, gainA_R = null;
    let subOsc = null, noiseSource = null;
    let subGain = null, noiseGain = null;

    // --- LFO Modulation Setup ---
    let vibratoLfo = null;
    let vibratoLfoGain = null;
    if (prog.lfo1Depth > 0) {
      vibratoLfo = ctx.createOscillator();
      vibratoLfo.frequency.setValueAtTime(prog.lfo1Rate, now);
      vibratoLfoGain = ctx.createGain();
      
      const joystickMod = joystick.y > 0 ? (joystick.y * 80) : 0;
      const totalDepth = prog.lfo1Depth + joystickMod;
      vibratoLfoGain.gain.setValueAtTime(totalDepth, now);
      vibratoLfo.connect(vibratoLfoGain);
      vibratoLfo.start(now);
    }

    // LFO 2 Filter Modulation
    let filterLfo = null;
    let filterLfoGain = null;
    const joyFilterMod = joystick.y < 0 ? (Math.abs(joystick.y) * 500) : 0;
    if (prog.lfo2Depth > 0 || joyFilterMod > 0) {
      filterLfo = ctx.createOscillator();
      filterLfo.frequency.setValueAtTime(prog.lfo2Rate, now);
      filterLfoGain = ctx.createGain();
      filterLfoGain.gain.setValueAtTime(prog.lfo2Depth + joyFilterMod, now);

      filterLfo.connect(filterLfoGain);
      filterLfoGain.connect(filter1.frequency);
      filterLfo.start(now);
    }

    // --- Pitch Drift LFO (Analog Instability) ---
    const driftLfo = ctx.createOscillator();
    driftLfo.frequency.setValueAtTime(0.15 + Math.random() * 0.2, now); // randomized 0.15Hz - 0.35Hz
    const driftGain = ctx.createGain();
    driftGain.gain.setValueAtTime(3.5, now); // 3.5 cents depth
    driftLfo.connect(driftGain);
    driftLfo.start(now);

    // Calculate equal-power crossfader gains
    const oscBalance = prog.oscBalance !== undefined ? prog.oscBalance : 0.5;
    const oscAVol = prog.oscAVol !== undefined ? prog.oscAVol : 0.8;
    const oscBVol = prog.oscBVol !== undefined ? prog.oscBVol : 0.5;
    const slotAVol = slotA && slotA.volume !== undefined ? slotA.volume : 1.0;
    const slotBVol = slotB && slotB.volume !== undefined ? slotB.volume : 1.0;
    const gainAVol = oscAVol * Math.sqrt(1 - oscBalance) * slotAVol;
    const gainBVol = oscBVol * Math.sqrt(oscBalance) * slotBVol;

    // Amp & Filter EG Setup
    const vca = prog.vcaEG || { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.3, breakLevel: 0.7, slopeTime: 0.5, sustainLevel: 0.5, releaseTime: 0.3 };
    const vcf = prog.vcfEG || { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.3, breakLevel: 0.7, slopeTime: 0.5, sustainLevel: 0.5, releaseTime: 0.3 };
    const vcaEnvAmt = (velocity / 127) * 0.45;
    
    gainA = ctx.createGain();
    gainA.gain.value = 0;
    gainA.gain.setValueAtTime(0, now);

    const releasedRef = { current: false };
    const voiceObj = {
      note,
      oscA: null, oscB: null, oscA_L: null, oscA_R: null, gainA, gainB: null, gainA_L: null, gainA_R: null,
      filter1, filter2, voiceOutGain: null,
      subOsc: null, noiseSource: null, noiseGain: null, subGain: null, driftLfo,
      vibratoLfo, vibratoLfoGain, filterLfo, filterLfoGain,
      vca, vcf, baseCutoff, oscAVol: prog.oscAVol, oscBVol: prog.oscBVol,
      granularTimerId: null, releasedRef, trackIdx
    };

    if (prog.granularActive || (prog.oscATriggerMode === 'slice' && sliceStretchA !== 0 && bufferA)) {
      // --- Granular Synthesis Engine ---
      if (bufferA) {
        const isSliceGranular = !prog.granularActive && (prog.oscATriggerMode === 'slice' && sliceStretchA !== 0);
        
        let playhead;
        let startOffsetA = 0;
        let sliceDurationA = 0;
        let sliceEndSecA = 0;
        
        if (isSliceGranular) {
          const sliceCountA = slotA.sliceCount || 16;
          const sliceIndex = ((note - rootNoteA) % sliceCountA + sliceCountA) % sliceCountA;
          const activeDurationA = (slotA.end - slotA.start) * bufferA.duration;
          sliceDurationA = activeDurationA / sliceCountA;
          if (isReverseA) {
            const origSliceStart = slotA.start * bufferA.duration + sliceIndex * sliceDurationA;
            startOffsetA = bufferA.duration - origSliceStart - sliceDurationA;
          } else {
            startOffsetA = slotA.start * bufferA.duration + sliceIndex * sliceDurationA;
          }
          sliceEndSecA = startOffsetA + sliceDurationA;
          playhead = startOffsetA;
        } else {
          playhead = (prog.grainPosition !== undefined ? prog.grainPosition : 0.0) * bufferA.duration;
        }
        
        const lookahead = 0.05; // 50ms lookahead to ensure Web Audio scheduling is always in the future
        let nextGrainTime = now + lookahead;

        const scheduleGrain = () => {
          if (releasedRef.current) return;
          const currentSlot = sampleSlotsRef.current.find(s => s.id === slotAId) || sampleSlotsRef.current[0];
          const currentBuf = currentSlot ? currentSlot.buffer : null;
          const currentRevBuf = currentSlot ? currentSlot.revBuffer : null;
          if (!currentBuf) return;

          const ctxNow = ctx.currentTime;
          if (nextGrainTime < ctxNow + lookahead) {
            const drift = (ctxNow + lookahead) - nextGrainTime;
            const speedFactor = isSliceGranular ? (freqScaleA / Math.max(0.05, 1 + sliceStretchA)) : (prog.grainSpeed !== undefined ? prog.grainSpeed : 1.0);
            playhead += drift * speedFactor;
            nextGrainTime = ctxNow + lookahead;
          }
          
          let gSize, gRate;
          if (isSliceGranular) {
            gSize = Math.max(0.03, Math.min(0.08, sliceDurationA));
            gRate = gSize * 0.4;
          } else {
            gSize = (prog.grainSize !== undefined ? prog.grainSize : 100) / 1000;
            gRate = (prog.grainRate !== undefined ? prog.grainRate : 40) / 1000;
          }

          while (nextGrainTime < ctxNow + lookahead + 0.1) {
            if (isSliceGranular && !sliceLoopA && playhead >= sliceEndSecA) {
              break; 
            }

            const grainSource = ctx.createBufferSource();
            const isReverse = isSliceGranular ? isReverseA : (prog.grainReverse || false);
            grainSource.buffer = isReverse ? currentRevBuf : currentBuf;

            const spray = isSliceGranular ? 0 : ((prog.grainSpray !== undefined ? prog.grainSpray : 0.05) * (Math.random() * 2 - 1));
            let grainStart = playhead + spray;
            if (grainStart < 0) grainStart = 0;
            if (grainStart >= currentBuf.duration) grainStart = currentBuf.duration - 0.01;

            const startOffset = (isReverse && !isSliceGranular) ? (currentBuf.duration - grainStart - gSize) : grainStart;
            const clampedStartOffset = Math.max(0, Math.min(currentBuf.duration - 0.005, startOffset));

            let currentFreqScale = freqScaleA;
            if (!isSliceGranular) {
              currentFreqScale = baseFreq / rootFreqA;
            }
            const detuneCents = isSliceGranular ? 0 : ((prog.grainPitchRandom !== undefined ? prog.grainPitchRandom : 0) * (Math.random() * 2 - 1));

            let stutterPitchOffset = 0;
            if (paramsRef.current.stutterOn && paramsRef.current.stutterPitchSweep !== 0) {
              const elapsed = nextGrainTime - voiceObj.startTime;
              const sweepDuration = paramsRef.current.stutterSweepTime || 1.0;
              const progress = Math.min(1.0, elapsed / sweepDuration);
              stutterPitchOffset = progress * paramsRef.current.stutterPitchSweep;
            }

            grainSource.playbackRate.setValueAtTime(currentFreqScale * Math.pow(2, (oscADetune + detuneCents + stutterPitchOffset * 100) / 1200), nextGrainTime);

            if (vibratoLfoGain) {
              const vScale = ctx.createGain();
              vScale.gain.setValueAtTime(1 / rootFreqA, nextGrainTime);
              vibratoLfoGain.connect(vScale);
              vScale.connect(grainSource.playbackRate);
            }
            if (driftGain) {
              const dScale = ctx.createGain();
              dScale.gain.setValueAtTime(1 / 1200, nextGrainTime);
              driftGain.connect(dScale);
              dScale.connect(grainSource.playbackRate);
            }

            const grainGain = ctx.createGain();
            grainGain.gain.setValueAtTime(0, nextGrainTime);

            const grainAttack = Math.min(0.005, gSize * 0.1);
            const grainRelease = Math.min(0.005, gSize * 0.1);

            grainGain.gain.linearRampToValueAtTime(1.0, nextGrainTime + grainAttack);
            grainGain.gain.linearRampToValueAtTime(1.0, nextGrainTime + gSize - grainRelease);
            grainGain.gain.linearRampToValueAtTime(0.0, nextGrainTime + gSize);

            grainSource.connect(grainGain);
            grainGain.connect(gainA);

            grainSource.start(nextGrainTime, clampedStartOffset, gSize);
            grainSource.stop(nextGrainTime + gSize + 0.01);

            let speedFactor;
            if (isSliceGranular) {
              speedFactor = freqScaleA / Math.max(0.05, 1 + sliceStretchA);
            } else {
              speedFactor = prog.grainSpeed !== undefined ? prog.grainSpeed : 1.0;
            }
            playhead += gRate * speedFactor;

            if (isSliceGranular) {
              if (sliceLoopA) {
                if (playhead >= sliceEndSecA) {
                  playhead = startOffsetA + ((playhead - startOffsetA) % sliceDurationA);
                }
              }
            } else {
              if (playhead >= currentBuf.duration) playhead = 0;
              if (playhead < 0) playhead = currentBuf.duration - 0.01;
            }

            nextGrainTime += gRate;
          }

          voiceObj.granularTimerId = setTimeout(scheduleGrain, 35);
        };

        scheduleGrain();
      }

      // Connect grain A gain to panner & filter
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(prog.oscAPan || 0, now);
      gainA.connect(panner);
      panner.connect(filter1);

      if (isSliceGranular) {
        const sliceCountA = slotA.sliceCount || 16;
        const sliceIndex = ((note - rootNoteA) % sliceCountA + sliceCountA) % sliceCountA;
        const activeDurationA = (slotA.end - slotA.start) * bufferA.duration;
        const sliceDurationA = activeDurationA / sliceCountA;
        let startOffsetA;
        if (isReverseA) {
          const origSliceStart = slotA.start * bufferA.duration + sliceIndex * sliceDurationA;
          startOffsetA = bufferA.duration - origSliceStart - sliceDurationA;
        } else {
          startOffsetA = slotA.start * bufferA.duration + sliceIndex * sliceDurationA;
        }
        voiceObj.startOffsetA = startOffsetA;
      }
    } else {
      // --- Standard Sampler OSC A ---
      if (bufferA) {
        if (prog.unisonOn) {
          oscA = ctx.createBufferSource();
          oscA.buffer = bufferA;
          oscA.playbackRate.setValueAtTime(freqScaleA, now);
          oscA.detune.setValueAtTime(prog.oscADetune, now);

          oscA_L = ctx.createBufferSource();
          oscA_L.buffer = bufferA;
          oscA_L.playbackRate.setValueAtTime(freqScaleA, now);
          oscA_L.detune.setValueAtTime(prog.oscADetune - prog.unisonDetune, now);

          oscA_R = ctx.createBufferSource();
          oscA_R.buffer = bufferA;
          oscA_R.playbackRate.setValueAtTime(freqScaleA, now);
          oscA_R.detune.setValueAtTime(prog.oscADetune + prog.unisonDetune, now);

          gainA_L = ctx.createGain();
          gainA_L.gain.value = 0;
          gainA_L.gain.setValueAtTime(0, now);
          gainA_R = ctx.createGain();
          gainA_R.gain.value = 0;
          gainA_R.gain.setValueAtTime(0, now);

          const pannerC = ctx.createStereoPanner();
          pannerC.pan.setValueAtTime(0, now);
          const pannerL = ctx.createStereoPanner();
          pannerL.pan.setValueAtTime(-0.85, now);
          const pannerR = ctx.createStereoPanner();
          pannerR.pan.setValueAtTime(0.85, now);

          oscA.connect(gainA);
          gainA.connect(pannerC);
          pannerC.connect(filter1);

          oscA_L.connect(gainA_L);
          gainA_L.connect(pannerL);
          pannerL.connect(filter1);

          oscA_R.connect(gainA_R);
          gainA_R.connect(pannerR);
          pannerR.connect(filter1);

          const isSliceA = prog.oscATriggerMode === 'slice';
          const sliceCountA = slotA.sliceCount || 16;
          let loopStartA, loopEndA;
          if (isReverseA) {
            if (isSliceA) {
              const sliceIndex = ((note - rootNoteA) % sliceCountA + sliceCountA) % sliceCountA;
              const activeDurationA = (slotA.end - slotA.start) * bufferA.duration;
              const sliceDurationA = activeDurationA / sliceCountA;
              const origSliceStart = slotA.start * bufferA.duration + sliceIndex * sliceDurationA;
              loopStartA = bufferA.duration - origSliceStart - sliceDurationA;
              loopEndA = loopStartA + sliceDurationA;
            } else {
              loopStartA = (1.0 - slotA.loopEnd) * bufferA.duration;
              loopEndA = (1.0 - slotA.loopStart) * bufferA.duration;
            }
          } else {
            loopStartA = slotA.loopStart * bufferA.duration;
            loopEndA = slotA.loopEnd * bufferA.duration;
            if (isSliceA) {
              const sliceIndex = ((note - rootNoteA) % sliceCountA + sliceCountA) % sliceCountA;
              const activeDurationA = (slotA.end - slotA.start) * bufferA.duration;
              const sliceDurationA = activeDurationA / sliceCountA;
              loopStartA = slotA.start * bufferA.duration + sliceIndex * sliceDurationA;
              loopEndA = loopStartA + sliceDurationA;
            }
          }

          [oscA, oscA_L, oscA_R].forEach(osc => {
            osc.loop = isLoopA;
            if (isLoopA) {
              osc.loopStart = loopStartA;
              osc.loopEnd = loopEndA;
            }
          });
          voiceObj.origLoopStartA = loopStartA;
          voiceObj.origLoopEndA = loopEndA;
          voiceObj.isLoopA = isLoopA;

          if (vibratoLfoGain) {
            vibratoLfoGain.connect(oscA.detune);
            vibratoLfoGain.connect(oscA_L.detune);
            vibratoLfoGain.connect(oscA_R.detune);
          }
          driftGain.connect(oscA.detune);
          driftGain.connect(oscA_L.detune);
          driftGain.connect(oscA_R.detune);

        } else {
          oscA = ctx.createBufferSource();
          oscA.buffer = bufferA;
          oscA.playbackRate.setValueAtTime(freqScaleA, now);
          oscA.detune.setValueAtTime(prog.oscADetune, now);

          oscA.connect(gainA);

          const panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(prog.oscAPan || 0, now);
          gainA.connect(panner);
          panner.connect(filter1);

          const isSliceA = prog.oscATriggerMode === 'slice';
          const sliceCountA = slotA.sliceCount || 16;
          let loopStartA, loopEndA;
          if (isReverseA) {
            if (isSliceA) {
              const sliceIndex = ((note - rootNoteA) % sliceCountA + sliceCountA) % sliceCountA;
              const activeDurationA = (slotA.end - slotA.start) * bufferA.duration;
              const sliceDurationA = activeDurationA / sliceCountA;
              const origSliceStart = slotA.start * bufferA.duration + sliceIndex * sliceDurationA;
              loopStartA = bufferA.duration - origSliceStart - sliceDurationA;
              loopEndA = loopStartA + sliceDurationA;
            } else {
              loopStartA = (1.0 - slotA.loopEnd) * bufferA.duration;
              loopEndA = (1.0 - slotA.loopStart) * bufferA.duration;
            }
          } else {
            loopStartA = slotA.loopStart * bufferA.duration;
            loopEndA = slotA.loopEnd * bufferA.duration;
            if (isSliceA) {
              const sliceIndex = ((note - rootNoteA) % sliceCountA + sliceCountA) % sliceCountA;
              const activeDurationA = (slotA.end - slotA.start) * bufferA.duration;
              const sliceDurationA = activeDurationA / sliceCountA;
              loopStartA = slotA.start * bufferA.duration + sliceIndex * sliceDurationA;
              loopEndA = loopStartA + sliceDurationA;
            }
          }

          oscA.loop = isLoopA;
          if (isLoopA) {
            oscA.loopStart = loopStartA;
            oscA.loopEnd = loopEndA;
          }
          voiceObj.origLoopStartA = loopStartA;
          voiceObj.origLoopEndA = loopEndA;
          voiceObj.isLoopA = isLoopA;

          if (vibratoLfoGain) vibratoLfoGain.connect(oscA.detune);
          driftGain.connect(oscA.detune);
        }
      }
    }

    // Oscillator B
    if (prog.oscMode === 'double' && bufferB) {
      const isSliceGranularB = prog.oscBTriggerMode === 'slice' && sliceStretchB !== 0;

      gainB = ctx.createGain();
      gainB.gain.value = 0;
      gainB.gain.setValueAtTime(0, now);

      if (isSliceGranularB) {
        // --- OSC B Granular Synthesis for Time-Stretching ---
        const sliceCountB = slotB.sliceCount || 16;
        const sliceIndex = ((note - rootNoteB) % sliceCountB + sliceCountB) % sliceCountB;
        const activeDurationB = (slotB.end - slotB.start) * bufferB.duration;
        const sliceDurationB = activeDurationB / sliceCountB;
        let startOffsetB;
        if (isReverseB) {
          const origSliceStart = slotB.start * bufferB.duration + sliceIndex * sliceDurationB;
          startOffsetB = bufferB.duration - origSliceStart - sliceDurationB;
        } else {
          startOffsetB = slotB.start * bufferB.duration + sliceIndex * sliceDurationB;
        }
        const sliceEndSecB = startOffsetB + sliceDurationB;
        let playhead = startOffsetB;

        const lookahead = 0.05; // 50ms lookahead to ensure Web Audio scheduling is always in the future
        let nextGrainTime = now + lookahead;

        const scheduleGrainB = () => {
          if (releasedRef.current) return;
          const currentSlot = sampleSlotsRef.current.find(s => s.id === slotBId) || sampleSlotsRef.current[1];
          const currentBuf = currentSlot ? currentSlot.buffer : null;
          const currentRevBuf = currentSlot ? currentSlot.revBuffer : null;
          if (!currentBuf) return;

          const ctxNow = ctx.currentTime;
          if (nextGrainTime < ctxNow + lookahead) {
            const drift = (ctxNow + lookahead) - nextGrainTime;
            const speedFactor = freqScaleB / Math.max(0.05, 1 + sliceStretchB);
            playhead += drift * speedFactor;
            nextGrainTime = ctxNow + lookahead;
          }
          const gSize = Math.max(0.03, Math.min(0.08, sliceDurationB));
          const gRate = gSize * 0.4;

          while (nextGrainTime < ctxNow + lookahead + 0.1) {
            if (!sliceLoopB && playhead >= sliceEndSecB) {
              break;
            }

            const grainSource = ctx.createBufferSource();
            grainSource.buffer = isReverseB && currentRevBuf ? currentRevBuf : currentBuf;

            let grainStart = playhead;
            if (grainStart < 0) grainStart = 0;
            if (grainStart >= currentBuf.duration) grainStart = currentBuf.duration - 0.01;

            const clampedStartOffset = Math.max(0, Math.min(currentBuf.duration - 0.005, grainStart));

            let stutterPitchOffset = 0;
            if (paramsRef.current.stutterOn && paramsRef.current.stutterPitchSweep !== 0) {
              const elapsed = nextGrainTime - voiceObj.startTime;
              const sweepDuration = paramsRef.current.stutterSweepTime || 1.0;
              const progress = Math.min(1.0, elapsed / sweepDuration);
              stutterPitchOffset = progress * paramsRef.current.stutterPitchSweep;
            }

            grainSource.playbackRate.setValueAtTime(freqScaleB * Math.pow(2, (oscBDetune + stutterPitchOffset * 100) / 1200), nextGrainTime);

            if (vibratoLfoGain) {
              const vScale = ctx.createGain();
              vScale.gain.setValueAtTime(1 / rootFreqB, nextGrainTime);
              vibratoLfoGain.connect(vScale);
              vScale.connect(grainSource.playbackRate);
            }
            if (driftGain) {
              const dScale = ctx.createGain();
              dScale.gain.setValueAtTime(1 / 1200, nextGrainTime);
              driftGain.connect(dScale);
              dScale.connect(grainSource.playbackRate);
            }

            const grainGain = ctx.createGain();
            grainGain.gain.setValueAtTime(0, nextGrainTime);

            const grainAttack = Math.min(0.005, gSize * 0.1);
            const grainRelease = Math.min(0.005, gSize * 0.1);

            grainGain.gain.linearRampToValueAtTime(1.0, nextGrainTime + grainAttack);
            grainGain.gain.linearRampToValueAtTime(1.0, nextGrainTime + gSize - grainRelease);
            grainGain.gain.linearRampToValueAtTime(0.0, nextGrainTime + gSize);

            grainSource.connect(grainGain);
            grainGain.connect(gainB);

            grainSource.start(nextGrainTime, clampedStartOffset, gSize);
            grainSource.stop(nextGrainTime + gSize + 0.01);

            const speedFactor = freqScaleB / Math.max(0.05, 1 + sliceStretchB);
            playhead += gRate * speedFactor;

            if (sliceLoopB) {
              if (playhead >= sliceEndSecB) {
                playhead = startOffsetB + ((playhead - startOffsetB) % sliceDurationB);
              }
            }

            nextGrainTime += gRate;
          }

          voiceObj.granularTimerIdB = setTimeout(scheduleGrainB, 35);
        };

        scheduleGrainB();

        const pannerB = ctx.createStereoPanner();
        pannerB.pan.setValueAtTime(prog.oscBPan || 0, now);
        gainB.connect(pannerB);
        pannerB.connect(filter1);

        voiceObj.startOffsetB = startOffsetB;

      } else {
        // --- Standard Sampler OSC B ---
        oscB = ctx.createBufferSource();
        oscB.buffer = bufferB;
        oscB.playbackRate.setValueAtTime(freqScaleB, now);
        oscB.detune.setValueAtTime(prog.oscBDetune, now);
        oscB.connect(gainB);

        const pannerB = ctx.createStereoPanner();
        pannerB.pan.setValueAtTime(prog.oscBPan || 0, now);
        gainB.connect(pannerB);
        pannerB.connect(filter1);

        const isSliceB = prog.oscBTriggerMode === 'slice';
        const sliceCountB = slotB.sliceCount || 16;
        let loopStartB, loopEndB;
        if (isReverseB) {
          if (isSliceB) {
            const sliceIndex = ((note - rootNoteB) % sliceCountB + sliceCountB) % sliceCountB;
            const activeDurationB = (slotB.end - slotB.start) * bufferB.duration;
            const sliceDurationB = activeDurationB / sliceCountB;
            const origSliceStart = slotB.start * bufferB.duration + sliceIndex * sliceDurationB;
            loopStartB = bufferB.duration - origSliceStart - sliceDurationB;
            loopEndB = loopStartB + sliceDurationB;
          } else {
            loopStartB = (1.0 - slotB.loopEnd) * bufferB.duration;
            loopEndB = (1.0 - slotB.loopStart) * bufferB.duration;
          }
        } else {
          loopStartB = slotB.loopStart * bufferB.duration;
          loopEndB = slotB.loopEnd * bufferB.duration;
          if (isSliceB) {
            const sliceIndex = ((note - rootNoteB) % sliceCountB + sliceCountB) % sliceCountB;
            const activeDurationB = (slotB.end - slotB.start) * bufferB.duration;
            const sliceDurationB = activeDurationB / sliceCountB;
            loopStartB = slotB.start * bufferB.duration + sliceIndex * sliceDurationB;
            loopEndB = loopStartB + sliceDurationB;
          }
        }

        oscB.loop = isLoopB;
        if (isLoopB) {
          oscB.loopStart = loopStartB;
          oscB.loopEnd = loopEndB;
        }
        voiceObj.origLoopStartB = loopStartB;
        voiceObj.origLoopEndB = loopEndB;
        voiceObj.isLoopB = isLoopB;

        if (vibratoLfoGain) vibratoLfoGain.connect(oscB.detune);
        driftGain.connect(oscB.detune);
      }
    }



    const voiceOutGain = ctx.createGain();
    voiceOutGain.gain.setValueAtTime(1.0, now);

    const stutterGateNode = ctx.createGain();
    stutterGateNode.gain.setValueAtTime(1.0, now);

    if (prog.filterMode === 'Double Series') {
      filter1.connect(filter2);
      filter2.connect(stutterGateNode);
    } else {
      filter1.connect(stutterGateNode);
    }
    stutterGateNode.connect(voiceOutGain);

    // Voice connects to global static IFX chain
    if (ifx1InputRef.current) {
      voiceOutGain.connect(ifx1InputRef.current);
    } else {
      voiceOutGain.connect(masterGainRef.current);
    }

    // Resolve slice environments and playback durations for slice trigger modes
    let dPlayA = 0;
    if (bufferA) {
      const sliceCountA = slotA.sliceCount || 16;
      const activeDurationA = (slotA.end - slotA.start) * bufferA.duration;
      const sliceDurationA = activeDurationA / sliceCountA;
      if (prog.oscATriggerMode === 'slice') {
        dPlayA = Math.max(0.01, (sliceDurationA * (1 + sliceStretchA)) / freqScaleA);
      } else {
        dPlayA = Math.max(0.01, activeDurationA / freqScaleA);
      }
    }

    let dPlayB = 0;
    if (bufferB) {
      const sliceCountB = slotB.sliceCount || 16;
      const activeDurationB = (slotB.end - slotB.start) * bufferB.duration;
      const sliceDurationB = activeDurationB / sliceCountB;
      if (prog.oscBTriggerMode === 'slice') {
        dPlayB = Math.max(0.01, (sliceDurationB * (1 + sliceStretchB)) / freqScaleB);
      } else {
        dPlayB = Math.max(0.01, activeDurationB / freqScaleB);
      }
    }

    // Amp EG Scheduling
    const aTime = now + vca.attackTime;
    const dTime = aTime + vca.decayTime;
    const sTime = dTime + vca.slopeTime;

    if (gainA && bufferA) {
      if (sliceEnvA) {
        let att = sliceEnvA.attack;
        let dec = sliceEnvA.decay;
        if (!isLoopA) {
          if (att >= dPlayA) {
            att = dPlayA * 0.1;
          }
          const maxDec = dPlayA - att;
          if (dec > maxDec) {
            dec = Math.max(0.005, maxDec - 0.003);
          }
        }
        const aTimeA = now + att;
        const dTimeA = aTimeA + dec;

        gainA.gain.setValueAtTime(0, now);
        gainA.gain.linearRampToValueAtTime(vcaEnvAmt * gainAVol, aTimeA);
        if (!isLoopA) {
          gainA.gain.linearRampToValueAtTime(0, dTimeA);
        }
      } else {
        gainA.gain.setValueAtTime(vca.startLevel * vcaEnvAmt * gainAVol, now);
        gainA.gain.linearRampToValueAtTime(vca.attackLevel * vcaEnvAmt * gainAVol, aTime);
        gainA.gain.linearRampToValueAtTime(vca.breakLevel * vcaEnvAmt * gainAVol, dTime);
        gainA.gain.linearRampToValueAtTime(vca.sustainLevel * vcaEnvAmt * gainAVol, sTime);
      }
    }

    if (gainA_L && gainA_R && bufferA) {
      if (sliceEnvA) {
        let att = sliceEnvA.attack;
        let dec = sliceEnvA.decay;
        if (!isLoopA) {
          if (att >= dPlayA) {
            att = dPlayA * 0.1;
          }
          const maxDec = dPlayA - att;
          if (dec > maxDec) {
            dec = Math.max(0.005, maxDec - 0.003);
          }
        }
        const aTimeA = now + att;
        const dTimeA = aTimeA + dec;

        [gainA_L, gainA_R].forEach(gNode => {
          gNode.gain.setValueAtTime(0, now);
          gNode.gain.linearRampToValueAtTime(vcaEnvAmt * gainAVol * 0.65, aTimeA);
          if (!isLoopA) {
            gNode.gain.linearRampToValueAtTime(0, dTimeA);
          }
        });
      } else {
        gainA_L.gain.setValueAtTime(vca.startLevel * vcaEnvAmt * gainAVol * 0.65, now);
        gainA_L.gain.linearRampToValueAtTime(vca.attackLevel * vcaEnvAmt * gainAVol * 0.65, aTime);
        gainA_L.gain.linearRampToValueAtTime(vca.breakLevel * vcaEnvAmt * gainAVol * 0.65, dTime);
        gainA_L.gain.linearRampToValueAtTime(vca.sustainLevel * vcaEnvAmt * gainAVol * 0.65, sTime);

        gainA_R.gain.setValueAtTime(vca.startLevel * vcaEnvAmt * gainAVol * 0.65, now);
        gainA_R.gain.linearRampToValueAtTime(vca.attackLevel * vcaEnvAmt * gainAVol * 0.65, aTime);
        gainA_R.gain.linearRampToValueAtTime(vca.breakLevel * vcaEnvAmt * gainAVol * 0.65, dTime);
        gainA_R.gain.linearRampToValueAtTime(vca.sustainLevel * vcaEnvAmt * gainAVol * 0.65, sTime);
      }
    }

    if (gainB && bufferB) {
      if (sliceEnvB) {
        let att = sliceEnvB.attack;
        let dec = sliceEnvB.decay;
        if (!isLoopB) {
          if (att >= dPlayB) {
            att = dPlayB * 0.1;
          }
          const maxDec = dPlayB - att;
          if (dec > maxDec) {
            dec = Math.max(0.005, maxDec - 0.003);
          }
        }
        const aTimeB = now + att;
        const dTimeB = aTimeB + dec;

        gainB.gain.setValueAtTime(0, now);
        gainB.gain.linearRampToValueAtTime(vcaEnvAmt * gainBVol, aTimeB);
        if (!isLoopB) {
          gainB.gain.linearRampToValueAtTime(0, dTimeB);
        }
      } else {
        gainB.gain.setValueAtTime(vca.startLevel * vcaEnvAmt * gainBVol, now);
        gainB.gain.linearRampToValueAtTime(vca.attackLevel * vcaEnvAmt * gainBVol, aTime);
        gainB.gain.linearRampToValueAtTime(vca.breakLevel * vcaEnvAmt * gainBVol, dTime);
        gainB.gain.linearRampToValueAtTime(vca.sustainLevel * vcaEnvAmt * gainBVol, sTime);
      }
    }



    // Filter EG
    if (prog.filterEnvAmt > 0) {
      const vcfEnvAmt = prog.filterEnvAmt;
      const vcfStart = baseCutoff + vcf.startLevel * vcfEnvAmt;
      const vcfAttack = baseCutoff + vcf.attackLevel * vcfEnvAmt;
      const vcfBreak = baseCutoff + vcf.breakLevel * vcfEnvAmt;
      const vcfSustain = baseCutoff + vcf.sustainLevel * vcfEnvAmt;

      filter1.frequency.setValueAtTime(vcfStart, now);
      filter1.frequency.linearRampToValueAtTime(vcfAttack, aTime);
      filter1.frequency.linearRampToValueAtTime(vcfBreak, dTime);
      filter1.frequency.linearRampToValueAtTime(vcfSustain, sTime);
    }

    // Start oscillators with playback boundary schedule
    if (!prog.granularActive && bufferA) {
      let startOffsetA;
      let durationToPlayA;

      if (prog.oscATriggerMode === 'slice') {
        const sliceCountA = slotA.sliceCount || 16;
        const sliceIndex = ((note - rootNoteA) % sliceCountA + sliceCountA) % sliceCountA;
        const activeDurationA = (slotA.end - slotA.start) * bufferA.duration;
        const sliceDurationA = activeDurationA / sliceCountA;
        if (isReverseA) {
          const origSliceStart = slotA.start * bufferA.duration + sliceIndex * sliceDurationA;
          startOffsetA = bufferA.duration - origSliceStart - sliceDurationA;
        } else {
          startOffsetA = slotA.start * bufferA.duration + sliceIndex * sliceDurationA;
        }
        durationToPlayA = sliceDurationA;
      } else {
        if (isReverseA) {
          startOffsetA = (1.0 - slotA.end) * bufferA.duration;
        } else {
          startOffsetA = slotA.start * bufferA.duration;
        }
        durationToPlayA = (slotA.end - slotA.start) * bufferA.duration;
      }

      if (isLoopA) {
        if (oscA) oscA.start(now, startOffsetA);
        if (oscA_L) oscA_L.start(now, startOffsetA);
        if (oscA_R) oscA_R.start(now, startOffsetA);
      } else {
        const dPlay = Math.max(0.01, durationToPlayA / freqScaleA);
        if (oscA) oscA.start(now, startOffsetA, dPlay);
        if (oscA_L) oscA_L.start(now, startOffsetA, dPlay);
        if (oscA_R) oscA_R.start(now, startOffsetA, dPlay);
      }
      voiceObj.startOffsetA = startOffsetA;
    }

    if (oscB && bufferB) {
      let startOffsetB;
      let durationToPlayB;

      if (prog.oscBTriggerMode === 'slice') {
        const sliceCountB = slotB.sliceCount || 16;
        const sliceIndex = ((note - rootNoteB) % sliceCountB + sliceCountB) % sliceCountB;
        const activeDurationB = (slotB.end - slotB.start) * bufferB.duration;
        const sliceDurationB = activeDurationB / sliceCountB;
        if (isReverseB) {
          const origSliceStart = slotB.start * bufferB.duration + sliceIndex * sliceDurationB;
          startOffsetB = bufferB.duration - origSliceStart - sliceDurationB;
        } else {
          startOffsetB = slotB.start * bufferB.duration + sliceIndex * sliceDurationB;
        }
        durationToPlayB = sliceDurationB;
      } else {
        if (isReverseB) {
          startOffsetB = (1.0 - slotB.end) * bufferB.duration;
        } else {
          startOffsetB = slotB.start * bufferB.duration;
        }
        durationToPlayB = (slotB.end - slotB.start) * bufferB.duration;
      }

      if (isLoopB) {
        oscB.start(now, startOffsetB);
      } else {
        oscB.start(now, startOffsetB, Math.max(0.01, durationToPlayB / freqScaleB));
      }
      voiceObj.startOffsetB = startOffsetB;
    }

    // Save final references back into voiceObj
    voiceObj.oscA = oscA;
    voiceObj.oscB = oscB;
    voiceObj.oscA_L = oscA_L;
    voiceObj.oscA_R = oscA_R;
    voiceObj.gainB = gainB;
    voiceObj.gainA_L = gainA_L;
    voiceObj.gainA_R = gainA_R;
    voiceObj.voiceOutGain = voiceOutGain;
    voiceObj.stutterGateNode = stutterGateNode;
    voiceObj.subOsc = subOsc;
    voiceObj.noiseSource = noiseSource;
    voiceObj.noiseGain = noiseGain;
    voiceObj.subGain = subGain;

    voiceObj.startTime = now;
    voiceObj.slotAId = slotAId;
    voiceObj.slotBId = slotBId;
    voiceObj.startA = slotA ? slotA.start : 0;
    voiceObj.endA = slotA ? slotA.end : 1;
    voiceObj.startB = slotB ? slotB.start : 0;
    voiceObj.endB = slotB ? slotB.end : 1;
    voiceObj.bufferA = bufferA;
    voiceObj.bufferB = bufferB;
    voiceObj.freqScaleA = freqScaleA;
    voiceObj.freqScaleB = freqScaleB;

    voiceObj.playheadRateA = freqScaleA / Math.max(0.05, 1 + sliceStretchA);
    voiceObj.playheadRateB = freqScaleB / Math.max(0.05, 1 + sliceStretchB);

    if (prog.stutterOn) {
      startStutterModulation(voiceObj);
    }

    return voiceObj;
  };;

  const playVoice = (note, velocity) => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Always stop the note first to prevent duplicates or orphans
    stopVoice(note);

    if (currentMode === 'PROG') {
      const voice = playProgramVoice(ctx, note, velocity, paramsRef.current, `${note}-prog`);
      activeVoicesRef.current.set(note, [voice]);
    } else {
      // COMBI MODE: Layer up to 4 tracks concurrently based on split key zones
      const combi = FACTORY_COMBIS[selectedCombiIndex];
      const voicesToTrigger = [];

      const tracks = [
        { id: combi.t1ProgId, vol: combi.t1Vol, min: combi.t1MinKey, max: combi.t1MaxKey, oct: combi.t1Octave },
        { id: combi.t2ProgId, vol: combi.t2Vol, min: combi.t2MinKey, max: combi.t2MaxKey, oct: combi.t2Octave },
        { id: combi.t3ProgId, vol: combi.t3Vol, min: combi.t3MinKey, max: combi.t3MaxKey, oct: combi.t3Octave },
        { id: combi.t4ProgId, vol: combi.t4Vol, min: combi.t4MinKey, max: combi.t4MaxKey, oct: combi.t4Octave },
      ];

      tracks.forEach((track, idx) => {
        if (track.vol > 0.01 && note >= track.min && note <= track.max) {
          const prog = FACTORY_PROGRAMS.find(p => p.id === track.id) || FACTORY_PROGRAMS[0];
          const adjustedProg = {
            ...prog,
            oscAVol: prog.oscAVol * track.vol,
            oscBVol: prog.oscBVol * track.vol
          };
          const voiceKey = `${note}-track-${idx}`;
          // Trigger split/layer oscillator with delay offsets
          const voice = playProgramVoice(ctx, note + track.oct * 12, velocity, adjustedProg, voiceKey, 0, idx);
          voicesToTrigger.push(voice);
        }
      });

      activeVoicesRef.current.set(note, voicesToTrigger);
    }

    setActiveNotes(prev => {
      const next = new Set(prev);
      next.add(note);
      return next;
    });
  };

  const stopVoice = (note) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    const releaseVoice = (voice) => {
      if (!voice) return;
      try {
        const releaseTime = Math.max(0.01, voice.vca.releaseTime);
        const timeConstant = releaseTime / 4;

        if (voice.releasedRef) {
          voice.releasedRef.current = true;
        }
        if (voice.granularTimerId) {
          clearTimeout(voice.granularTimerId);
        }
        if (voice.granularTimerIdB) {
          clearTimeout(voice.granularTimerIdB);
        }
        if (voice.stutterTimeoutId) {
          clearTimeout(voice.stutterTimeoutId);
        }

        // Cancel scheduled gain ramps and drop to zero over release duration
        if (voice.gainA) {
          voice.gainA.gain.cancelScheduledValues(now);
          voice.gainA.gain.setValueAtTime(voice.gainA.gain.value, now);
          voice.gainA.gain.setTargetAtTime(0, now, timeConstant);
        }

        if (voice.gainA_L) {
          voice.gainA_L.gain.cancelScheduledValues(now);
          voice.gainA_L.gain.setValueAtTime(voice.gainA_L.gain.value, now);
          voice.gainA_L.gain.setTargetAtTime(0, now, timeConstant);
        }

        if (voice.gainA_R) {
          voice.gainA_R.gain.cancelScheduledValues(now);
          voice.gainA_R.gain.setValueAtTime(voice.gainA_R.gain.value, now);
          voice.gainA_R.gain.setTargetAtTime(0, now, timeConstant);
        }

        if (voice.gainB) {
          voice.gainB.gain.cancelScheduledValues(now);
          voice.gainB.gain.setValueAtTime(voice.gainB.gain.value, now);
          voice.gainB.gain.setTargetAtTime(0, now, timeConstant);
        }

        if (voice.subGain) {
          voice.subGain.gain.cancelScheduledValues(now);
          voice.subGain.gain.setValueAtTime(voice.subGain.gain.value, now);
          voice.subGain.gain.setTargetAtTime(0, now, timeConstant);
        }

        if (voice.noiseGain) {
          voice.noiseGain.gain.cancelScheduledValues(now);
          voice.noiseGain.gain.setValueAtTime(voice.noiseGain.gain.value, now);
          voice.noiseGain.gain.setTargetAtTime(0, now, timeConstant);
        }

        // Filter decay on release
        if (voice.filter1) {
          voice.filter1.frequency.cancelScheduledValues(now);
          voice.filter1.frequency.setValueAtTime(voice.filter1.frequency.value, now);
          voice.filter1.frequency.setTargetAtTime(Math.max(20, voice.baseCutoff * 0.1), now, timeConstant);
        }

        // Clean up node references after release decays
        const oscA = voice.oscA;
        const oscB = voice.oscB;
        const oscA_L = voice.oscA_L;
        const oscA_R = voice.oscA_R;
        const subOsc = voice.subOsc;
        const noiseSource = voice.noiseSource;
        const driftLfo = voice.driftLfo;
        const lfo1 = voice.vibratoLfo;
        const lfo2 = voice.filterLfo;
        
        setTimeout(() => {
          try {
            if (oscA) oscA.stop();
            if (oscB) oscB.stop();
            if (oscA_L) oscA_L.stop();
            if (oscA_R) oscA_R.stop();
            if (subOsc) subOsc.stop();
            if (noiseSource) noiseSource.stop();
            if (driftLfo) driftLfo.stop();
            if (lfo1) lfo1.stop();
            if (lfo2) lfo2.stop();
          } catch {}
        }, (releaseTime + 0.1) * 1000);
      } catch (err) {
        console.warn('Error releasing voice nodes:', err);
      }
    };

    const voices = activeVoicesRef.current.get(note);
    if (voices) {
      voices.forEach(releaseVoice);
      activeVoicesRef.current.delete(note);
    }

    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  };

  const stopAllNotes = () => {
    if (!audioCtxRef.current) return;
    activeVoicesRef.current.forEach((val) => {
      const stopVoiceRef = (v) => {
        if (!v) return;
        if (v.releasedRef) v.releasedRef.current = true;
        if (v.granularTimerId) clearTimeout(v.granularTimerId);
        if (v.stutterTimeoutId) clearTimeout(v.stutterTimeoutId);
        try { if (v.oscA) v.oscA.stop(); } catch {}
        try { if (v.oscB) v.oscB.stop(); } catch {}
        try { if (v.oscA_L) v.oscA_L.stop(); } catch {}
        try { if (v.oscA_R) v.oscA_R.stop(); } catch {}
        try { if (v.subOsc) v.subOsc.stop(); } catch {}
        try { if (v.noiseSource) v.noiseSource.stop(); } catch {}
        try { if (v.driftLfo) v.driftLfo.stop(); } catch {}
        try { if (v.vibratoLfo) v.vibratoLfo.stop(); } catch {}
        try { if (v.filterLfo) v.filterLfo.stop(); } catch {}
      };
      if (Array.isArray(val)) {
        val.forEach(stopVoiceRef);
      } else {
        stopVoiceRef(val);
      }
    });
    activeVoicesRef.current.clear();
    setActiveNotes(new Set());
  };

  // ==========================================
  // 5. JOYSTICK & RIBBON MOVEMENT HANDLERS
  // ==========================================

  const handleJoystickDrag = (e, wellBounds) => {
    const xRaw = (e.clientX - wellBounds.left - wellBounds.width / 2) / (wellBounds.width / 2);
    const yRaw = -(e.clientY - wellBounds.top - wellBounds.height / 2) / (wellBounds.height / 2); // invert to match Y Cartesian
    
    const xClamped = Math.max(-1, Math.min(1, xRaw));
    const yClamped = Math.max(-1, Math.min(1, yRaw));

    setJoystick({ x: xClamped, y: yClamped });
    applyRealtimeModulation(xClamped, yClamped);
  };

  const applyRealtimeModulation = (x, y) => {
    // Dynamically apply pitch bend factor on X axis
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;

    activeVoicesRef.current.forEach((val) => {
      const applyModToVoice = (voice) => {
        if (!voice) return;
        const bendFactor = Math.pow(2, (x * 2) / 12);
        
        // Update primary frequency destinations
        if (voice.oscA.frequency) {
          voice.oscA.frequency.setValueAtTime(voice.oscA.frequency.value * bendFactor, now);
        } else if (voice.oscA.playbackRate) {
          voice.oscA.playbackRate.setValueAtTime(voice.oscA.playbackRate.value * bendFactor, now);
        }
        
        if (voice.oscB) {
          if (voice.oscB.frequency) {
            voice.oscB.frequency.setValueAtTime(voice.oscB.frequency.value * bendFactor, now);
          } else if (voice.oscB.playbackRate) {
            voice.oscB.playbackRate.setValueAtTime(voice.oscB.playbackRate.value * bendFactor, now);
          }
        }

        // Apply vibrato depth on joystick Y+ axis
        if (voice.vibratoLfoGain && y > 0) {
          voice.vibratoLfoGain.gain.setValueAtTime(paramsRef.current.lfo1Depth + y * 120, now);
        }
        // Apply filter envelope modulation on Y- axis
        if (voice.filterLfoGain && y < 0) {
          voice.filterLfoGain.gain.setValueAtTime(paramsRef.current.lfo2Depth + Math.abs(y) * 800, now);
        }
      };

      if (Array.isArray(val)) {
        val.forEach(applyModToVoice);
      } else {
        applyModToVoice(val);
      }
    });
  };

  // ==========================================
  // 6. KAOSS PAD CONTROLLER & MOD MATRIX
  // ==========================================

  const handleKaossTouch = (e, rect) => {
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)); // invert Y

    setKaossPad(prev => ({
      ...prev,
      x,
      y,
      touchActive: true
    }));

    modulateKaossParameters(x, y, true);
  };

  const modulateKaossParameters = (x, y, isTouched = false) => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;

    // --- Delta Pad Combi Morph Mixer ---
    if (currentMode === 'COMBI') {
      updateCombiVectorGains(x, y);
      return; 
    }

    // --- Delta Pad Gater FX Logic ---
    const isGaterTargeted = (kaossTargetX === 'gater' || kaossTargetY === 'gater');
    const isGaterActive = isGaterTargeted && (isTouched || kaossPad.holdActive);

    if (isGaterActive && gaterLfoGainRef.current && gaterGainNodeRef.current && gaterLfoRef.current) {
      const gaterRate = (kaossTargetX === 'gater') ? (x * 23 + 2) : (y * 23 + 2); // 2Hz to 25Hz
      gaterLfoRef.current.frequency.setValueAtTime(gaterRate, now);
      gaterLfoGainRef.current.gain.setTargetAtTime(0.5, now, 0.02);
      gaterGainNodeRef.current.gain.setTargetAtTime(0.5, now, 0.02);
    } else if (gaterLfoGainRef.current && gaterGainNodeRef.current) {
      gaterLfoGainRef.current.gain.setTargetAtTime(0.0, now, 0.02);
      gaterGainNodeRef.current.gain.setTargetAtTime(1.0, now, 0.02);
    }

    // 1. Modulate target parameter on X axis
    if (kaossTargetX === 'cutoff') {
      const cutVal = x * 4000 + 100;
      activeVoicesRef.current.forEach(vList => {
        const updateCut = (v) => { if (v && v.filter1) v.filter1.frequency.setValueAtTime(cutVal, now); };
        if (Array.isArray(vList)) vList.forEach(updateCut); else updateCut(vList);
      });
    } else if (kaossTargetX === 'lfoRate') {
      const rateVal = x * 15 + 0.5;
      activeVoicesRef.current.forEach(vList => {
        const updateRate = (v) => {
          if (v && v.vibratoLfo) v.vibratoLfo.frequency.setValueAtTime(rateVal, now);
          if (v && v.filterLfo) v.filterLfo.frequency.setValueAtTime(rateVal, now);
        };
        if (Array.isArray(vList)) vList.forEach(updateRate); else updateRate(vList);
      });
    } else if (kaossTargetX === 'ifxMix') {
      const mixVal = x * 0.8;
      if (ifx1MixRef.current) updateIFXMix(ifx1MixRef.current, mixVal);
    } else if (kaossTargetX === 'delayTime') {
      const delayTimeVal = x * 0.95 + 0.05;
      if (activeDelayRef.current) {
        const ad = activeDelayRef.current;
        if (ad.delayL && ad.delayR) {
          ad.delayL.delayTime.setTargetAtTime(delayTimeVal, now, 0.05);
          ad.delayR.delayTime.setTargetAtTime(delayTimeVal * 1.33, now, 0.05);
        } else if (ad.delay1) {
          ad.delay1.delayTime.setTargetAtTime(delayTimeVal, now, 0.05);
          ad.delay2.delayTime.setTargetAtTime(delayTimeVal * 1.5, now, 0.05);
          ad.delay3.delayTime.setTargetAtTime(delayTimeVal * 2.0, now, 0.05);
        }
      }
    }

    // 2. Modulate target parameter on Y axis
    if (kaossTargetY === 'resonance') {
      const resVal = y * 18 + 0.2;
      activeVoicesRef.current.forEach(vList => {
        const updateRes = (v) => { if (v && v.filter1) v.filter1.Q.setValueAtTime(resVal, now); };
        if (Array.isArray(vList)) vList.forEach(updateRes); else updateRes(vList);
      });
    } else if (kaossTargetY === 'reverbDecay') {
      const decaySend = y * 0.9;
      if (mfx2SendGainRef.current) mfx2SendGainRef.current.gain.setValueAtTime(decaySend, now);
    } else if (kaossTargetY === 'chorusRate') {
      const feedbackSend = y * 0.8;
      if (activeDelayRef.current) {
        const ad = activeDelayRef.current;
        if (ad.feedbackL && ad.feedbackR) {
          ad.feedbackL.gain.setValueAtTime(feedbackSend, now);
          ad.feedbackR.gain.setValueAtTime(feedbackSend, now);
        } else if (ad.feedbackGain1) {
          ad.feedbackGain1.gain.setValueAtTime(feedbackSend * 0.5, now);
          ad.feedbackGain2.gain.setValueAtTime(feedbackSend * 0.35, now);
          ad.feedbackGain3.gain.setValueAtTime(feedbackSend * 0.25, now);
        }
      }
    } else if (kaossTargetY === 'ringModMix') {
      const mixVal = y * 0.8;
      if (ifx2MixRef.current) updateIFXMix(ifx2MixRef.current, mixVal);
    } else if (kaossTargetY === 'ringModFreq') {
      const freqVal = y * 2000 + 50; 
      if (ifx2EffectRef.current && ifx2EffectRef.current.carrier) {
        ifx2EffectRef.current.carrier.frequency.setValueAtTime(freqVal, now);
      }
    }
  };

  const updateCombiVectorGains = (x, y) => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;

    const gain1 = (1 - x) * y;       
    const gain2 = x * y;           
    const gain3 = (1 - x) * (1 - y); 
    const gain4 = x * (1 - y);       
    const vectorGains = [gain1, gain2, gain3, gain4];

    activeVoicesRef.current.forEach((voicesList) => {
      if (Array.isArray(voicesList)) {
        voicesList.forEach((voice) => {
          if (voice && voice.trackIdx !== undefined && voice.voiceOutGain) {
            voice.voiceOutGain.gain.setValueAtTime(vectorGains[voice.trackIdx] * 1.5, now);
          }
        });
      }
    });
  };
  // ==========================================
  // 7. WEBMIDI INTEGRATION
  // ==========================================

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then((access) => {
          setIsMidiSupported(true);
          const inputs = Array.from(access.inputs.values());
          setMidiDevices(inputs);
          if (inputs.length > 0) {
            setSelectedMidiDevice(inputs[0].id);
            setupMidiListeners(inputs[0]);
          }
          // Enumerate and cache MIDI outputs in midiOutputsRef
          const outputs = Array.from(access.outputs.values());
          midiOutputsRef.current = outputs;
          
          access.onstatechange = (e) => {
            if (e.port && e.port.type === 'output') {
              midiOutputsRef.current = Array.from(access.outputs.values());
            }
          };
        })
        .catch(() => setIsMidiSupported(false));
    }
  }, []);

  // Continuous MIDI Clock Timing Messages (0xF8)
  useEffect(() => {
    const bpm = params.arpBpm || 120;
    const intervalMs = 2500 / bpm;
    const intervalId = setInterval(() => {
      if (midiOutputsRef.current && midiOutputsRef.current.length > 0) {
        midiOutputsRef.current.forEach(output => {
          try {
            output.send([0xF8]);
          } catch (e) {
            // Ignore closed port errors
          }
        });
      }
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [params.arpBpm]);

  // MIDI Start (0xFA) / Stop (0xFC) on Arpeggiator On/Off state toggle
  const isMidiArpMountedRef = useRef(false);
  useEffect(() => {
    if (!isMidiArpMountedRef.current) {
      isMidiArpMountedRef.current = true;
      return;
    }
    if (midiOutputsRef.current && midiOutputsRef.current.length > 0) {
      const msg = params.arpOn ? 0xFA : 0xFC;
      midiOutputsRef.current.forEach(output => {
        try {
          output.send([msg]);
        } catch (e) {
          // Ignore closed port errors
        }
      });
    }
  }, [params.arpOn]);

  const setupMidiListeners = (input) => {
    input.onmidimessage = (message) => {
      const [status, data1, data2] = message.data;
      const cmd = status >> 4;
      const channel = status & 0xf;

      setMidiActivity(true);
      setTimeout(() => setMidiActivity(false), 80);

      if (cmd === 9 && data2 > 0) { // Note On
        if (playVoiceRef.current) playVoiceRef.current(data1, data2);
      } else if (cmd === 8 || (cmd === 9 && data2 === 0)) { // Note Off
        if (stopVoiceRef.current) stopVoiceRef.current(data1);
      } else if (cmd === 11) { // Control Change (CC)
        if (handleMidiCCRef.current) handleMidiCCRef.current(data1, data2);
      } else if (cmd === 14) { // Pitch Bend
        const normalizedPb = ((data2 << 7) + data1 - 8192) / 8192; // -1 to 1
        setJoystick(prev => ({ ...prev, x: normalizedPb }));
        const joyY = joystickRef.current ? joystickRef.current.y : 0;
        applyRealtimeModulation(normalizedPb, joyY);
      }
    };
  };

  const handleMidiCC = (cc, val) => {
    // 0. Intercept CC 1 (Modulation Wheel) for the Dub Ramper
    if (cc === 1) {
      setModWheelVal(val);
      const modVal = val / 127;
      const now = audioCtxRef.current ? audioCtxRef.current.currentTime : 0;
      
      const currentFeedbackBase = paramsRef.current.spaceEchoFeedback;
      const targetFeedback = currentFeedbackBase + (0.99 - currentFeedbackBase) * modVal;
      
      const currentBaseTime = paramsRef.current.spaceEchoTime;
      const targetTime = currentBaseTime * (1.0 + modVal * 0.5); 
      
      const currentSat = paramsRef.current.spaceEchoSaturation;
      const targetSat = currentSat + (1.0 - currentSat) * modVal;

      if (activeDelayRef.current) {
        const ad = activeDelayRef.current;
        if (paramsRef.current.spaceEchoActive) {
          if (ad.delay1) ad.delay1.delayTime.setTargetAtTime(targetTime, now, 0.08);
          if (ad.delay2) ad.delay2.delayTime.setTargetAtTime(targetTime * 1.5, now, 0.08);
          if (ad.delay3) ad.delay3.delayTime.setTargetAtTime(targetTime * 2.0, now, 0.08);

          if (ad.feedbackGain1) {
            ad.feedbackGain1.gain.cancelScheduledValues(now);
            ad.feedbackGain1.gain.setValueAtTime(Math.max(0.0001, ad.feedbackGain1.gain.value), now);
            ad.feedbackGain1.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetFeedback * 0.5), now + 0.08);
          }
          if (ad.feedbackGain2) {
            ad.feedbackGain2.gain.cancelScheduledValues(now);
            ad.feedbackGain2.gain.setValueAtTime(Math.max(0.0001, ad.feedbackGain2.gain.value), now);
            ad.feedbackGain2.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetFeedback * 0.35), now + 0.08);
          }
          if (ad.feedbackGain3) {
            ad.feedbackGain3.gain.cancelScheduledValues(now);
            ad.feedbackGain3.gain.setValueAtTime(Math.max(0.0001, ad.feedbackGain3.gain.value), now);
            ad.feedbackGain3.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetFeedback * 0.25), now + 0.08);
          }

          if (ad.tapeSat) ad.tapeSat.curve = makeDistCurve(targetSat * 0.7);
        } else {
          if (ad.delayL && ad.delayR) {
            ad.delayL.delayTime.setTargetAtTime(targetTime, now, 0.08);
            if (ad.delayR.setTargetAtTime) {
              ad.delayR.setTargetAtTime(targetTime * 1.33, now, 0.08);
            } else {
              ad.delayR.delayTime.setTargetAtTime(targetTime * 1.33, now, 0.08);
            }
            ad.feedbackL.gain.cancelScheduledValues(now);
            ad.feedbackL.gain.setValueAtTime(Math.max(0.0001, ad.feedbackL.gain.value), now);
            ad.feedbackL.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetFeedback), now + 0.08);

            ad.feedbackR.gain.cancelScheduledValues(now);
            ad.feedbackR.gain.setValueAtTime(Math.max(0.0001, ad.feedbackR.gain.value), now);
            ad.feedbackR.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetFeedback), now + 0.08);
          }
        }
      }
      return;
    }

    // 1. Learning system hook
    if (midiLearnParam) {
      setMidiMappings(prev => {
        const next = { ...prev, [midiLearnParam]: cc };
        localStorage.setItem('delta7_midi_mappings', JSON.stringify(next));
        return next;
      });
      setMidiLearnParam(null);
      return;
    }

    // 2. Control routings mapping
    const valNormalized = val / 127;

    // Check custom mappings
    Object.keys(midiMappings).forEach((paramName) => {
      if (midiMappings[paramName] === cc) {
        const now = audioCtxRef.current ? audioCtxRef.current.currentTime : 0;
        if (paramName === 'cutoff') {
          const cutVal = Math.round(valNormalized * 8000 + 100);
          setParams(prev => ({ ...prev, cutoff: cutVal }));
          if (activeVoicesRef.current) {
            activeVoicesRef.current.forEach(vList => {
              const updateCut = (v) => { if (v && v.filter1) v.filter1.frequency.setValueAtTime(cutVal, now); };
              if (Array.isArray(vList)) vList.forEach(updateCut); else updateCut(vList);
            });
          }
        } else if (paramName === 'resonance') {
          const resVal = valNormalized * 15;
          setParams(prev => ({ ...prev, resonance: resVal }));
          if (activeVoicesRef.current) {
            activeVoicesRef.current.forEach(vList => {
              const updateRes = (v) => { if (v && v.filter1) v.filter1.Q.setValueAtTime(resVal, now); };
              if (Array.isArray(vList)) vList.forEach(updateRes); else updateRes(vList);
            });
          }
        } else if (paramName === 'oscAVol') {
          setParams(prev => ({ ...prev, oscAVol: valNormalized }));
        } else if (paramName === 'oscBVol') {
          setParams(prev => ({ ...prev, oscBVol: valNormalized }));
        } else if (paramName === 'eqLow') {
          setParams(prev => ({ ...prev, eqLow: Math.round(valNormalized * 10 - 5) }));
        } else if (paramName === 'eqMid') {
          setParams(prev => ({ ...prev, eqMid: Math.round(valNormalized * 10 - 5) }));
        } else if (paramName === 'eqHigh') {
          setParams(prev => ({ ...prev, eqHigh: Math.round(valNormalized * 10 - 5) }));
        } else if (paramName === 'masterVolume') {
          setParams(prev => ({ ...prev, masterVolume: Math.round(valNormalized * 100) }));
          if (masterGainRef.current) {
            masterGainRef.current.gain.setValueAtTime(valNormalized * 0.5, now);
          }
        } else if (paramName === 'kaossX') {
          setKaossPad(prev => ({ ...prev, x: valNormalized }));
          modulateKaossParameters(valNormalized, kaossPad.y);
        } else if (paramName === 'kaossY') {
          setKaossPad(prev => ({ ...prev, y: valNormalized }));
          modulateKaossParameters(kaossPad.x, valNormalized);
        } else if (paramName === 'spaceEchoTime') {
          setParams(prev => ({ ...prev, spaceEchoTime: valNormalized * 0.95 + 0.05 }));
        } else if (paramName === 'spaceEchoFeedback') {
          setParams(prev => ({ ...prev, spaceEchoFeedback: valNormalized * 0.95 }));
        } else if (paramName === 'spaceEchoWow') {
          setParams(prev => ({ ...prev, spaceEchoWow: valNormalized * 0.5 }));
        } else if (paramName === 'spaceEchoSaturation') {
          setParams(prev => ({ ...prev, spaceEchoSaturation: valNormalized }));
        } else if (paramName === 'spaceEchoSpring') {
          setParams(prev => ({ ...prev, spaceEchoSpring: valNormalized }));
        } else if (paramName === 'stutterOn') {
          const isStut = valNormalized >= 0.5;
          setParams(prev => ({ ...prev, stutterOn: isStut }));
        } else if (paramName === 'stutterRate') {
          const rates = ['1/4', '1/8', '1/12', '1/16', '1/24', '1/32', '1/64', '1/128'];
          const rateIdx = Math.min(rates.length - 1, Math.floor(valNormalized * rates.length));
          setParams(prev => ({ ...prev, stutterRate: rates[rateIdx] }));
        } else if (paramName === 'stutterGate') {
          setParams(prev => ({ ...prev, stutterGate: valNormalized * 0.9 + 0.1 }));
        } else if (paramName === 'stutterSweepTime') {
          setParams(prev => ({ ...prev, stutterSweepTime: valNormalized * 3.8 + 0.2 }));
        } else if (paramName === 'filterEnvAmt') {
          setParams(prev => ({ ...prev, filterEnvAmt: Math.round(valNormalized * 4000) }));
        } else if (paramName === 'vcaRelease') {
          updateEgParam('VCA', 'releaseTime', valNormalized * 3.99 + 0.01);
        } else if (paramName === 'lfo1Rate') {
          const rateVal = valNormalized * 14.9 + 0.1;
          setParams(prev => ({ ...prev, lfo1Rate: rateVal }));
          if (activeVoicesRef.current) {
            activeVoicesRef.current.forEach(vList => {
              const updateRate = (v) => {
                if (v) {
                  if (v.vibratoLfo) v.vibratoLfo.frequency.setValueAtTime(rateVal, now);
                  if (v.filterLfo) v.filterLfo.frequency.setValueAtTime(rateVal, now);
                }
              };
              if (Array.isArray(vList)) vList.forEach(updateRate); else updateRate(vList);
            });
          }
        } else if (paramName === 'ifxMix') {
          setParams(prev => ({ ...prev, ifx1Mix: valNormalized, ifx2Mix: valNormalized }));
        }
      }
    });
  };

  // ==========================================
  // 8. GRAPHICAL EDITORS & CRT VISUALIZERS
  // ==========================================

  const startVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameIdRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteTimeDomainData(dataArray);

      // LCD blue grid clear
      ctx.fillStyle = '#061328';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gridlines
      ctx.strokeStyle = '#0a2a4d';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw vector wave (phosphor cyan glow)
      ctx.beginPath();
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 8;

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    };

    draw();
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  // --- 5-Stage Envelope Editor canvas rendering & mouse triggers ---
  const handleEgCanvasClick = (e, canvas, egType) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = rect.height - (e.clientY - rect.top); // invert Y coordinates

    // Normalize coordinates to approximate times & levels (0 to 1)
    const normX = Math.min(1.0, Math.max(0.0, x / rect.width));
    const normY = Math.min(1.0, Math.max(0.0, y / rect.height));

    const eg = egType === 'VCF' ? params.vcfEG : params.vcaEG;

    // Simple snap-to nearest stage modification
    // Divide into 5 stages: Start, Attack, Decay, Slope, Release
    let target = 'attackTime';
    if (normX < 0.2) {
      target = 'startLevel';
      updateEgParam(egType, target, normY);
    } else if (normX < 0.4) {
      updateEgParam(egType, 'attackTime', normX * 1.5);
      updateEgParam(egType, 'attackLevel', normY);
    } else if (normX < 0.6) {
      updateEgParam(egType, 'decayTime', (normX - 0.3) * 1.8);
      updateEgParam(egType, 'breakLevel', normY);
    } else if (normX < 0.8) {
      updateEgParam(egType, 'slopeTime', (normX - 0.5) * 2.2);
      updateEgParam(egType, 'sustainLevel', normY);
    } else {
      updateEgParam(egType, 'releaseTime', (normX - 0.7) * 2.5);
    }
  };

  const updateEgParam = (egType, paramName, value) => {
    const rounded = parseFloat(value.toFixed(2));
    setParams(prev => {
      const egKey = egType === 'VCF' ? 'vcfEG' : 'vcaEG';
      return {
        ...prev,
        [egKey]: {
          ...prev[egKey],
          [paramName]: rounded
        }
      };
    });
  };

  const renderEgPreview = (canvas, eg) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background grids
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 30) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    for (let j = 0; j < h; j += 20) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke();
    }

    // Points mapping
    const pStart = { x: 0, y: h - eg.startLevel * h * 0.8 - 5 };
    
    // Scale widths
    const scaleT1 = Math.min(0.2, eg.attackTime * 0.1) * w * 4;
    const pAttack = { x: w * 0.15 + scaleT1, y: h - eg.attackLevel * h * 0.8 - 5 };
    
    const scaleT2 = Math.min(0.2, eg.decayTime * 0.1) * w * 4;
    const pDecay = { x: pAttack.x + w * 0.15 + scaleT2, y: h - eg.breakLevel * h * 0.8 - 5 };

    const scaleT3 = Math.min(0.2, eg.slopeTime * 0.1) * w * 4;
    const pSlope = { x: pDecay.x + w * 0.15 + scaleT3, y: h - eg.sustainLevel * h * 0.8 - 5 };

    const scaleT4 = Math.min(0.25, eg.releaseTime * 0.1) * w * 4;
    const pRelease = { x: pSlope.x + w * 0.15 + scaleT4, y: h - 5 };

    // Draw line path
    ctx.beginPath();
    ctx.moveTo(pStart.x, pStart.y);
    ctx.lineTo(pAttack.x, pAttack.y);
    ctx.lineTo(pDecay.x, pDecay.y);
    ctx.lineTo(pSlope.x, pSlope.y);
    ctx.lineTo(pRelease.x, pRelease.y);
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw dots
    ctx.fillStyle = '#ff3366';
    [pStart, pAttack, pDecay, pSlope, pRelease].forEach((pt, i) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // ==========================================
  // 9. THE HARDWARE & SOFTWARE INTERFACE RENDERING
  // ==========================================

  return (
    <div className="delta7-hardware-chassis">
      {/* Aluminum Top Rack Bar */}
      <div className="rack-header-bar">
        <div className="branding-title">delta7</div>
        <div className="branding-sub">HYPER INTEGRATED SYNTHESIS WORKSTATION</div>
        <div className="telemetry-bar">
          <div className={`telemetry-led ${synthOn ? 'led-on' : ''}`}></div>
          <span>POWER</span>
          <div className={`telemetry-led ${midiActivity ? 'led-midi' : ''}`}></div>
          <span>MIDI IN</span>
        </div>
      </div>

      {/* Main Rack console body split into Left, Center (Screen), Right panels */}
      <div className="rack-main-grid">
        
        {/* ================= LEFT SIDE CONTROLS ================= */}
        <div className="rack-panel-left steel-plate">
          <div className="section-label">Performance</div>
          
          {/* TAPE ECHO & LESLIE CONTROL DECK */}
          <div className="tape-leslie-deck">
            <span className="knob-label">TAPE ECHO DECK</span>
            
            {/* Spinning Tape Reels */}
            <div className="tape-deck-reels">
              <div className={`tape-reel ${params.spaceEchoActive ? 'spinning' : ''}`} style={{ animationDuration: `${Math.max(0.5, (params.spaceEchoTime || 0.35) * 5)}s` }}>
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="#00f3ff" strokeWidth="2" fill="none" />
                  <circle cx="50" cy="50" r="10" fill="#00f3ff" />
                  <line x1="50" y1="5" x2="50" y2="95" stroke="#00f3ff" strokeWidth="1.5" />
                  <line x1="5" y1="50" x2="95" y2="50" stroke="#00f3ff" strokeWidth="1.5" />
                  <circle cx="50" cy="20" r="4" fill="#00f3ff" />
                  <circle cx="50" cy="80" r="4" fill="#00f3ff" />
                  <circle cx="20" cy="50" r="4" fill="#00f3ff" />
                  <circle cx="80" cy="50" r="4" fill="#00f3ff" />
                </svg>
              </div>
              <div className={`tape-reel ${params.spaceEchoActive ? 'spinning' : ''}`} style={{ animationDuration: `${Math.max(0.5, (params.spaceEchoTime || 0.35) * 5)}s` }}>
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="#00f3ff" strokeWidth="2" fill="none" />
                  <circle cx="50" cy="50" r="10" fill="#00f3ff" />
                  <line x1="50" y1="5" x2="50" y2="95" stroke="#00f3ff" strokeWidth="1.5" />
                  <line x1="5" y1="50" x2="95" y2="50" stroke="#00f3ff" strokeWidth="1.5" />
                  <circle cx="50" cy="20" r="4" fill="#00f3ff" />
                  <circle cx="50" cy="80" r="4" fill="#00f3ff" />
                  <circle cx="20" cy="50" r="4" fill="#00f3ff" />
                  <circle cx="80" cy="50" r="4" fill="#00f3ff" />
                </svg>
              </div>
            </div>

            {/* Toggle switch for Space Echo */}
            <div className="flex-row-sub flex-space-between" style={{ width: '100%', margin: '0.4rem 0', justifyContent: 'space-between', display: 'flex' }}>
              <label style={{ color: '#00f3ff', fontWeight: 'bold' }}>SPACE ECHO:</label>
              <button 
                className={`btn btn-xs ${params.spaceEchoActive ? 'active-cyan' : ''}`}
                onClick={() => {
                  const nextActive = !params.spaceEchoActive;
                  setParams(prev => ({ ...prev, spaceEchoActive: nextActive }));
                  if (audioCtxRef.current) {
                    rebuildDelayEffect(audioCtxRef.current, nextActive);
                  }
                }}
              >
                {params.spaceEchoActive ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Space Echo Knobs Grid */}
            <div className="tape-knobs-grid">
              <Knob 
                label="Time" 
                value={params.spaceEchoTime} 
                min={0.05} max={1.5} step={0.01}
                onChange={(v) => {
                  setParams(prev => ({ ...prev, spaceEchoTime: v }));
                  setSelectedDelayRatio('Free');
                }} 
                midiLearnParam="spaceEchoTime" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="cyan"
                size={34}
              />
              <Knob 
                label="Feedback" 
                value={params.spaceEchoFeedback} 
                min={0.0} max={0.95} step={0.01}
                onChange={(v) => setParams(prev => ({ ...prev, spaceEchoFeedback: v }))} 
                midiLearnParam="spaceEchoFeedback" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="cyan"
                size={34}
              />
              <Knob 
                label="Wow" 
                value={params.spaceEchoWow} 
                min={0.0} max={1.0} step={0.01}
                onChange={(v) => setParams(prev => ({ ...prev, spaceEchoWow: v }))} 
                midiLearnParam="spaceEchoWow" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="cyan"
                size={34}
              />
              <Knob 
                label="Saturation" 
                value={params.spaceEchoSaturation} 
                min={0.0} max={1.0} step={0.01}
                onChange={(v) => setParams(prev => ({ ...prev, spaceEchoSaturation: v }))} 
                midiLearnParam="spaceEchoSaturation" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="cyan"
                size={34}
              />
              <Knob 
                label="Spring" 
                value={params.spaceEchoSpring} 
                min={0.0} max={1.0} step={0.01}
                onChange={(v) => setParams(prev => ({ ...prev, spaceEchoSpring: v }))} 
                midiLearnParam="spaceEchoSpring" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="cyan"
                size={34}
              />
            </div>

            {/* Delay Time Ratio Selector & Dub Ramper */}
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed rgba(0, 243, 255, 0.15)', paddingTop: '4px' }}>
              <div className="flex-row-sub" style={{ flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                <span style={{ color: '#00f3ff', fontSize: '0.55rem', fontWeight: 'bold' }}>DELAY TIME RATIO (TEMPO SYNC):</span>
                <div className="segmented-strip" style={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
                  {['Free', '1/16', '1/8T', '1/8', '1/8D', '1/4', '1/4D', '1/2'].map(ratio => (
                    <button
                      key={ratio}
                      className={`segmented-btn btn-xs ${selectedDelayRatio === ratio ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedDelayRatio(ratio);
                        if (ratio !== 'Free') {
                          const multiplier = DELAY_RATIOS[ratio];
                          const beatDuration = 60 / (params.arpBpm || 120);
                          const computedTime = Math.min(1.5, Math.max(0.05, multiplier * beatDuration));
                          setParams(prev => ({ ...prev, spaceEchoTime: parseFloat(computedTime.toFixed(3)) }));
                        }
                      }}
                      style={{ padding: '2px 3px', fontSize: '0.48rem', flexGrow: 1 }}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-row-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.58rem', marginTop: '2px' }}>
                <span style={{ color: '#ff5500', fontWeight: 'bold', fontSize: '0.55rem' }}>DUB RAMPER (MOD WHEEL):</span>
                <input 
                  type="range" min="0" max="127" step="1"
                  value={modWheelVal} 
                  onChange={(e) => handleMidiCC(1, parseInt(e.target.value))} 
                  style={{ flexGrow: 1, height: '8px', margin: '0 6px', accentColor: '#ff5500' }}
                />
                <span className="val-text font-mono" style={{ color: '#ffe600', fontSize: '0.52rem', width: '24px', textAlign: 'right' }}>
                  {Math.round((modWheelVal / 127) * 100)}%
                </span>
              </div>
            </div>

            <div className="leslie-separator"></div>

            <span className="knob-label">ROTOR CABINET (LESLIE)</span>
            {/* Leslie Speed Toggle */}
            <div className="flex-row-sub flex-space-between" style={{ width: '100%', margin: '0.4rem 0', justifyContent: 'space-between', display: 'flex' }}>
              <label style={{ color: '#ff00ff', fontWeight: 'bold' }}>SPEED:</label>
              <div style={{ display: 'flex', gap: '3px' }}>
                {['Off', 'Slow', 'Fast'].map(spd => (
                  <button 
                    key={spd}
                    className={`btn btn-xs ${params.leslieSpeed === spd ? 'active-magenta' : ''}`}
                    onClick={() => {
                      setParams(prev => ({ ...prev, leslieSpeed: spd }));
                    }}
                  >
                    {spd.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ribbon Controller */}
          <div className="ribbon-wrapper">
            <span className="knob-label">RIBBON CONTROLLER</span>
            <div 
              className="ribbon-strip"
              onMouseDown={(e) => {
                setRibbonTouched(true);
                const rect = e.currentTarget.getBoundingClientRect();
                const v = (e.clientX - rect.left) / rect.width;
                setRibbonVal(v);
              }}
              onMouseMove={(e) => {
                if (e.buttons === 1) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const v = (e.clientX - rect.left) / rect.width;
                  setRibbonVal(v);
                }
              }}
              onMouseUp={() => {
                setRibbonTouched(false);
                setRibbonVal(0.5);
              }}
              onMouseLeave={() => {
                setRibbonTouched(false);
                setRibbonVal(0.5);
              }}
            >
              <div 
                className="ribbon-indicator"
                style={{ 
                  left: `${ribbonVal * 100}%`,
                  opacity: ribbonTouched ? 1 : 0.2
                }}
              ></div>
            </div>
          </div>

          {/* Realtime Control Knobs 1-4 */}
          <div className="realtime-knobs-section">
            <div className="knob-mode-toggle">
              <button 
                className={`btn btn-xs ${realtimeKnobMode === 'A' ? 'active-amber' : ''}`}
                onClick={() => setRealtimeKnobMode('A')}
              >
                SELECT A (FILTER/EG)
              </button>
              <button 
                className={`btn btn-xs ${realtimeKnobMode === 'B' ? 'active-amber' : ''}`}
                onClick={() => setRealtimeKnobMode('B')}
              >
                SELECT B (ASSIGNABLE)
              </button>
            </div>

            <div className="knob-quad">
              {realtimeKnobMode === 'A' ? (
                <>
                  <Knob 
                    label="Cutoff" 
                    value={params.cutoff} 
                    min={100} max={10000} step={10}
                    onChange={(v) => setParams(prev => ({ ...prev, cutoff: v }))} 
                    midiLearnParam="cutoff" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                    glowColor="cyan"
                  />
                  <Knob 
                    label="Resonance" 
                    value={params.resonance} 
                    min={0.1} max={15} step={0.1}
                    onChange={(v) => setParams(prev => ({ ...prev, resonance: v }))}
                    midiLearnParam="resonance" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                    glowColor="magenta"
                  />
                  <Knob 
                    label="EG Intensity" 
                    value={params.filterEnvAmt} 
                    min={0} max={4000} step={50}
                    onChange={(v) => setParams(prev => ({ ...prev, filterEnvAmt: v }))}
                    midiLearnParam="filterEnvAmt" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                    glowColor="green"
                  />
                  <Knob 
                    label="EG Release" 
                    value={params.vcaEG.releaseTime} 
                    min={0.01} max={4.0} step={0.02}
                    onChange={(v) => updateEgParam('VCA', 'releaseTime', v)}
                    midiLearnParam="vcaRelease" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                    glowColor="yellow"
                  />
                </>
              ) : (
                <>
                  <Knob 
                    label="Osc A Vol" 
                    value={params.oscAVol} 
                    min={0} max={1.0} step={0.01}
                    onChange={(v) => setParams(prev => ({ ...prev, oscAVol: v }))}
                    midiLearnParam="oscAVol" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                    glowColor="cyan"
                  />
                  <Knob 
                    label="Osc B Vol" 
                    value={params.oscBVol} 
                    min={0} max={1.0} step={0.01}
                    onChange={(v) => setParams(prev => ({ ...prev, oscBVol: v }))}
                    midiLearnParam="oscBVol" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                    glowColor="pink"
                  />
                  <Knob 
                    label="LFO1 Rate" 
                    value={params.lfo1Rate} 
                    min={0.1} max={20} step={0.1}
                    onChange={(v) => setParams(prev => ({ ...prev, lfo1Rate: v }))}
                    midiLearnParam="lfo1Rate" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                    glowColor="green"
                  />
                  <Knob 
                    label="IFX Mix" 
                    value={params.ifx1Mix} 
                    min={0} max={1.0} step={0.02}
                    onChange={(v) => {
                      setParams(prev => ({ ...prev, ifx1Mix: v }));
                      if (ifx1MixRef.current) updateIFXMix(ifx1MixRef.current, v);
                    }}
                    midiLearnParam="ifxMix" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                    glowColor="magenta"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================= CENTER TOUCHVIEW SCREEN ================= */}
        <div className="rack-panel-center blue-screen-border">
          <div className="lcd-bezel-shadow">
            
            {/* Screen Header (No more menus!) */}
            <div className="screen-header-tabs" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px', height: '32px', alignItems: 'center', background: '#000000', borderBottom: '2px solid #00f3ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ffe600', boxShadow: '0 0 6px #ffe600' }} />
                <span className="font-mono text-cyan" style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>DELTA7 SAMPLER WORKSTATION</span>
              </div>
              
              {/* Presets & Mode Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* PROG / COMBI Toggle */}
                <div className="segmented-strip" style={{ display: 'flex', padding: '1px' }}>
                  {['PROG', 'COMBI'].map(mode => (
                    <button
                      key={mode}
                      className={`segmented-btn btn-xs ${currentMode === mode ? 'active' : ''}`}
                      onClick={() => toggleMode(mode)}
                      style={{ padding: '2px 6px', fontSize: '0.55rem' }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                
                {/* Active Preset Dropdown */}
                {currentMode === 'PROG' ? (
                  <select
                    value={selectedProgIndex}
                    onChange={(e) => handleSelectProgram(parseInt(e.target.value))}
                    style={{ background: '#000', border: '1px solid #00f3ff', color: '#00f3ff', fontSize: '0.58rem', padding: '1px 3px', borderRadius: '3px', width: '130px' }}
                  >
                    {FACTORY_PROGRAMS.map((prog, idx) => (
                      <option key={prog.id} value={idx}>
                        A{String(idx + 1).padStart(3, '0')}: {prog.name.split(': ')[1] || prog.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedCombiIndex}
                    onChange={(e) => handleSelectCombi(parseInt(e.target.value))}
                    style={{ background: '#000', border: '1px solid #ff00ff', color: '#ff00ff', fontSize: '0.58rem', padding: '1px 3px', borderRadius: '3px', width: '130px' }}
                  >
                    {FACTORY_COMBIS.map((combi, idx) => (
                      <option key={combi.id} value={idx}>
                        C{String(idx + 1).padStart(3, '0')}: {combi.name.split(': ')[1] || combi.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Screen Screen Display Contents */}
            <div className="screen-content-viewport" style={{ padding: '8px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* ================= ROW 1: WAVEFORM EDITOR ================= */}
                {(() => {
                  const slot = sampleSlots.find(s => s.id === selectedEditSlotId);
                  if (!slot) return null;
                  return (
                    <div className="box-section-sub" style={{ background: 'rgba(0, 243, 255, 0.02)', border: '1px solid rgba(0, 243, 255, 0.2)', padding: '6px 10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <h4 style={{ color: '#00f3ff', margin: 0, fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>WAVEFORM AUDIO EDITOR</h4>
                        <div className="font-mono text-cyan" style={{ fontSize: '0.7rem' }}>
                          EDIT SLOT: <span style={{ color: '#ffe600', fontWeight: 'bold' }}>{getSlotLabel(selectedEditSlotId)}</span> &mdash; <span style={{ color: '#fff' }}>{slot.name}</span> {slot.buffer ? `(${Math.round(slot.buffer.duration * 100) / 100}s)` : '(Empty)'}
                        </div>
                      </div>

                      {/* Canvas display */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '10px', alignItems: 'center' }}>
                        <div>
                          <canvas 
                            ref={samplerCanvasRef} 
                            width="480" 
                            height="75" 
                            className="waveform-draw-canvas"
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onTouchStart={handleCanvasTouchStart}
                            onTouchMove={handleCanvasTouchMove}
                            onTouchEnd={handleCanvasTouchEnd}
                            style={{ display: 'block', width: '100%', height: '75px', borderRadius: '4px', border: '1px solid rgba(0, 243, 255, 0.3)', background: '#020d1e', cursor: slot.buffer ? 'col-resize' : 'default' }}
                          />
                        </div>

                        {/* Trim start/end and Loop controls */}
                        <div style={{ fontSize: '0.68rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div className="flex-row-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ color: '#ffe600', width: '55px' }}>Start:</label>
                            <input 
                              type="range" min="0" max="1" step="0.01" 
                              value={slot.start} 
                              onChange={(e) => handleStartChange(parseFloat(e.target.value))} 
                              style={{ flexGrow: 1, height: '10px' }}
                            />
                            <span className="val-text font-mono" style={{ color: '#ffe600', width: '28px', textAlign: 'right' }}>{Math.round(slot.start * 100)}%</span>
                          </div>
                          <div className="flex-row-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ color: '#ff0055', width: '55px' }}>End:</label>
                            <input 
                              type="range" min="0" max="1" step="0.01" 
                              value={slot.end} 
                              onChange={(e) => handleEndChange(parseFloat(e.target.value))} 
                              style={{ flexGrow: 1, height: '10px' }}
                            />
                            <span className="val-text font-mono" style={{ color: '#ff0055', width: '28px', textAlign: 'right' }}>{Math.round(slot.end * 100)}%</span>
                          </div>

                          <div className="flex-row-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ color: '#00ff66', opacity: slot.loopOn ? 1 : 0.4, width: '55px' }}>Loop L:</label>
                            <input 
                              type="range" min="0" max="1" step="0.01" 
                              value={slot.loopStart} 
                              onChange={(e) => handleLoopStartChange(parseFloat(e.target.value))}
                              disabled={!slot.loopOn}
                              style={{ flexGrow: 1, height: '10px' }}
                            />
                            <span className="val-text font-mono" style={{ color: '#00ff66', opacity: slot.loopOn ? 1 : 0.4, width: '28px', textAlign: 'right' }}>{Math.round(slot.loopStart * 100)}%</span>
                          </div>
                          <div className="flex-row-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ color: '#00ff66', opacity: slot.loopOn ? 1 : 0.4, width: '55px' }}>Loop R:</label>
                            <input 
                              type="range" min="0" max="1" step="0.01" 
                              value={slot.loopEnd} 
                              onChange={(e) => handleLoopEndChange(parseFloat(e.target.value))}
                              disabled={!slot.loopOn}
                              style={{ flexGrow: 1, height: '10px' }}
                            />
                            <span className="val-text font-mono" style={{ color: '#00ff66', opacity: slot.loopOn ? 1 : 0.4, width: '28px', textAlign: 'right' }}>{Math.round(slot.loopEnd * 100)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Audio Editor Toolbar */}
                      <div style={{ display: 'flex', gap: '4px', margin: '4px 0', padding: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', border: '1px solid rgba(0, 243, 255, 0.15)', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.62rem', color: '#ffe600', fontWeight: 'bold' }}>EDIT TOOLS:</div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn-xs"
                            disabled={!slot.buffer}
                            onClick={() => {
                              setSelectionStart(0.0);
                              setSelectionEnd(1.0);
                            }}
                            style={{ margin: 0, padding: '2px 6px', fontSize: '0.55rem' }}
                          >
                            SELECT ALL
                          </button>
                          <button
                            className="btn btn-xs"
                            disabled={!slot.buffer || selectionStart === null || selectionEnd === null}
                            onClick={() => {
                              const buffer = slot.buffer;
                              if (!buffer) return;
                              pushUndoState(slot);
                              const totalSamples = buffer.length;
                              const startPct = Math.min(selectionStart, selectionEnd);
                              const endPct = Math.max(selectionStart, selectionEnd);
                              const startSample = Math.floor(startPct * totalSamples);
                              const endSample = Math.floor(endPct * totalSamples);
                              const selectionLength = endSample - startSample;
                              if (selectionLength <= 0) return;

                              const ctx = audioCtxRef.current;
                              const newBuffer = ctx.createBuffer(buffer.numberOfChannels, selectionLength, buffer.sampleRate);
                              for (let c = 0; c < buffer.numberOfChannels; c++) {
                                newBuffer.getChannelData(c).set(buffer.getChannelData(c).slice(startSample, endSample), 0);
                              }
                              updateBufferForSlot(selectedEditSlotId, newBuffer, `Trim: ${slot.name}`);
                              setSelectionStart(null);
                              setSelectionEnd(null);
                              if (activePreviewNodeRef.current) {
                                try { activePreviewNodeRef.current.stop(); } catch {}
                                activePreviewNodeRef.current = null;
                                setIsPlayingPreview(false);
                              }
                            }}
                            style={{ margin: 0, padding: '2px 6px', fontSize: '0.55rem', borderColor: '#ffe600', color: '#ffe600' }}
                          >
                            TRIM
                          </button>
                          <button
                            className="btn btn-xs"
                            disabled={!slot.buffer || selectionStart === null || selectionEnd === null}
                            onClick={() => {
                              const buffer = slot.buffer;
                              if (!buffer) return;
                              const totalSamples = buffer.length;
                              const startPct = Math.min(selectionStart, selectionEnd);
                              const endPct = Math.max(selectionStart, selectionEnd);
                              const startSample = Math.floor(startPct * totalSamples);
                              const endSample = Math.floor(endPct * totalSamples);
                              if (startSample >= endSample) return;

                              const channelsCopy = [];
                              for (let c = 0; c < buffer.numberOfChannels; c++) {
                                channelsCopy.push(buffer.getChannelData(c).slice(startSample, endSample));
                              }
                              setClipboard({
                                numberOfChannels: buffer.numberOfChannels,
                                sampleRate: buffer.sampleRate,
                                channels: channelsCopy
                              });
                            }}
                            style={{ margin: 0, padding: '2px 6px', fontSize: '0.55rem' }}
                          >
                            COPY
                          </button>
                          <button
                            className="btn btn-xs"
                            disabled={!slot.buffer || selectionStart === null || selectionEnd === null}
                            onClick={() => {
                              const buffer = slot.buffer;
                              if (!buffer) return;
                              pushUndoState(slot);
                              const totalSamples = buffer.length;
                              const startPct = Math.min(selectionStart, selectionEnd);
                              const endPct = Math.max(selectionStart, selectionEnd);
                              const startSample = Math.floor(startPct * totalSamples);
                              const endSample = Math.floor(endPct * totalSamples);
                              const selectionLength = endSample - startSample;
                              if (selectionLength <= 0) return;

                              const channelsCopy = [];
                              for (let c = 0; c < buffer.numberOfChannels; c++) {
                                channelsCopy.push(buffer.getChannelData(c).slice(startSample, endSample));
                              }
                              setClipboard({
                                numberOfChannels: buffer.numberOfChannels,
                                sampleRate: buffer.sampleRate,
                                channels: channelsCopy
                              });

                              const newLength = totalSamples - selectionLength;
                              if (newLength <= 0) {
                                updateBufferForSlot(selectedEditSlotId, null, "Cut (Empty)");
                              } else {
                                const ctx = audioCtxRef.current;
                                const newBuffer = ctx.createBuffer(buffer.numberOfChannels, newLength, buffer.sampleRate);
                                for (let c = 0; c < buffer.numberOfChannels; c++) {
                                  const orig = buffer.getChannelData(c);
                                  const dest = newBuffer.getChannelData(c);
                                  dest.set(orig.subarray(0, startSample), 0);
                                  dest.set(orig.subarray(endSample, totalSamples), startSample);
                                }
                                updateBufferForSlot(selectedEditSlotId, newBuffer, `Cut: ${slot.name}`);
                              }
                              setSelectionStart(null);
                              setSelectionEnd(null);
                              if (activePreviewNodeRef.current) {
                                try { activePreviewNodeRef.current.stop(); } catch {}
                                activePreviewNodeRef.current = null;
                                setIsPlayingPreview(false);
                              }
                            }}
                            style={{ margin: 0, padding: '2px 6px', fontSize: '0.55rem' }}
                          >
                            CUT
                          </button>
                          <button
                            className="btn btn-xs"
                            disabled={!clipboard}
                            onClick={() => {
                              if (!clipboard) return;
                              pushUndoState(slot);
                              const ctx = audioCtxRef.current;
                              const buffer = slot.buffer;

                              if (!buffer) {
                                const newBuffer = ctx.createBuffer(clipboard.numberOfChannels, clipboard.channels[0].length, clipboard.sampleRate);
                                for (let c = 0; c < clipboard.numberOfChannels; c++) {
                                  newBuffer.getChannelData(c).set(clipboard.channels[c], 0);
                                }
                                updateBufferForSlot(selectedEditSlotId, newBuffer, "Pasted Sample");
                                return;
                              }

                              const totalSamples = buffer.length;
                              const clipboardLength = clipboard.channels[0].length;
                              let startSample = totalSamples;
                              let endSample = totalSamples;

                              if (selectionStart !== null && selectionEnd !== null) {
                                const startPct = Math.min(selectionStart, selectionEnd);
                                const endPct = Math.max(selectionStart, selectionEnd);
                                startSample = Math.floor(startPct * totalSamples);
                                endSample = Math.floor(endPct * totalSamples);
                              }

                              const selectionLength = endSample - startSample;
                              const newLength = totalSamples - selectionLength + clipboardLength;
                              const newBuffer = ctx.createBuffer(buffer.numberOfChannels, newLength, buffer.sampleRate);

                              for (let c = 0; c < buffer.numberOfChannels; c++) {
                                const orig = buffer.getChannelData(c);
                                const dest = newBuffer.getChannelData(c);
                                const clip = clipboard.channels[c] || clipboard.channels[0];

                                dest.set(orig.subarray(0, startSample), 0);
                                dest.set(clip, startSample);
                                dest.set(orig.subarray(endSample, totalSamples), startSample + clipboardLength);
                              }
                              updateBufferForSlot(selectedEditSlotId, newBuffer, `Paste: ${slot.name}`);
                              setSelectionStart(null);
                              setSelectionEnd(null);
                              if (activePreviewNodeRef.current) {
                                try { activePreviewNodeRef.current.stop(); } catch {}
                                activePreviewNodeRef.current = null;
                                setIsPlayingPreview(false);
                              }
                            }}
                            style={{ margin: 0, padding: '2px 6px', fontSize: '0.55rem' }}
                          >
                            PASTE
                          </button>
                          <button
                            className="btn btn-xs"
                            disabled={!slot.buffer || selectionStart === null || selectionEnd === null}
                            onClick={() => {
                              const buffer = slot.buffer;
                              if (!buffer) return;
                              pushUndoState(slot);
                              const totalSamples = buffer.length;
                              const startPct = Math.min(selectionStart, selectionEnd);
                              const endPct = Math.max(selectionStart, selectionEnd);
                              const startSample = Math.floor(startPct * totalSamples);
                              const endSample = Math.floor(endPct * totalSamples);
                              const selectionLength = endSample - startSample;
                              if (selectionLength <= 0) return;

                              const newLength = totalSamples - selectionLength;
                              if (newLength <= 0) {
                                updateBufferForSlot(selectedEditSlotId, null, "Deleted (Empty)");
                              } else {
                                const ctx = audioCtxRef.current;
                                const newBuffer = ctx.createBuffer(buffer.numberOfChannels, newLength, buffer.sampleRate);
                                for (let c = 0; c < buffer.numberOfChannels; c++) {
                                  const orig = buffer.getChannelData(c);
                                  const dest = newBuffer.getChannelData(c);
                                  dest.set(orig.subarray(0, startSample), 0);
                                  dest.set(orig.subarray(endSample, totalSamples), startSample);
                                }
                                updateBufferForSlot(selectedEditSlotId, newBuffer, `Delete: ${slot.name}`);
                              }
                              setSelectionStart(null);
                              setSelectionEnd(null);
                              if (activePreviewNodeRef.current) {
                                try { activePreviewNodeRef.current.stop(); } catch {}
                                activePreviewNodeRef.current = null;
                                setIsPlayingPreview(false);
                              }
                            }}
                            style={{ margin: 0, padding: '2px 6px', fontSize: '0.55rem', borderColor: '#ff0055', color: '#ff0055' }}
                          >
                            DELETE
                          </button>
                          <button
                            className="btn btn-xs"
                            disabled={undoHistory.length === 0}
                            onClick={undoLastAction}
                            style={{ margin: 0, padding: '2px 6px', fontSize: '0.55rem', borderColor: '#00ff66', color: '#00ff66' }}
                          >
                            UNDO
                          </button>
                        </div>
                        {selectionStart !== null && selectionEnd !== null ? (
                          <div style={{ fontSize: '0.58rem', color: '#00f3ff', fontFamily: 'monospace' }}>
                            SEL: {Math.round(Math.min(selectionStart, selectionEnd) * 100)}% to {Math.round(Math.max(selectionStart, selectionEnd) * 100)}%
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.55rem', color: '#888', fontStyle: 'italic' }}>
                            Drag on wave to select
                          </div>
                        )}
                      </div>

                      {/* Loop Enable, Root Note, Volume and Preview buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '95px 75px 120px 1.3fr 110px', gap: '8px', marginTop: '4px', borderTop: '1px dashed rgba(0, 243, 255, 0.1)', paddingTop: '4px', alignItems: 'center' }}>
                        <button 
                          className={`btn btn-xs ${slot.loopOn ? 'active-green' : ''}`}
                          onClick={() => updateSlotParam(selectedEditSlotId, 'loopOn', !slot.loopOn)}
                          style={{ margin: 0, padding: '2px 4px', fontSize: '0.6rem' }}
                        >
                          {slot.loopOn ? 'LOOP: ON' : 'LOOP: OFF'}
                        </button>

                        <button 
                          className={`btn btn-xs ${slot.reverseOn ? 'active-pink' : ''}`}
                          onClick={() => updateSlotParam(selectedEditSlotId, 'reverseOn', !slot.reverseOn)}
                          style={{ margin: 0, padding: '2px 4px', fontSize: '0.6rem' }}
                        >
                          {slot.reverseOn ? 'REV: ON' : 'REV: OFF'}
                        </button>

                        {/* Sample Slot Level Volume control */}
                        <div className="flex-row-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem' }}>
                          <span style={{ color: '#00f3ff' }}>Vol:</span>
                          <input 
                            type="range" min="0" max="1.5" step="0.05"
                            value={slot.volume !== undefined ? slot.volume : 1.0}
                            onChange={(e) => updateSlotParam(selectedEditSlotId, 'volume', parseFloat(e.target.value))}
                            style={{ flexGrow: 1, height: '6px', accentColor: '#00f3ff' }}
                          />
                          <span className="font-mono" style={{ color: '#ffe600', fontSize: '0.52rem', width: '22px', textAlign: 'right' }}>
                            {Math.round((slot.volume !== undefined ? slot.volume : 1.0) * 100)}%
                          </span>
                        </div>

                        <div className="flex-row-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem' }}>
                          <span style={{ color: '#88ccee' }}>Root:</span>
                          <div className="segmented-strip" style={{ flexGrow: 1 }}>
                            {[36, 48, 60, 72, 84].map(val => (
                              <button
                                key={val}
                                className={`segmented-btn btn-xs ${slot.rootNote === val ? 'active' : ''}`}
                                onClick={() => updateSlotParam(selectedEditSlotId, 'rootNote', val)}
                                style={{ fontSize: '0.55rem', padding: '1px 3px' }}
                              >
                                C{val/12 - 1}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button 
                          className={`btn btn-xs ${isPlayingPreview ? 'active-cyan' : ''}`}
                          disabled={!slot.buffer}
                          onClick={() => togglePreviewSample(selectedEditSlotId)}
                          style={{ padding: '2px 6px', margin: 0, fontSize: '0.65rem' }}
                        >
                          {isPlayingPreview ? 'STOP PREVIEW' : 'PREVIEW SAMPLE'}
                        </button>
                      </div>

                      {/* Slice Editor Sub-Panel */}
                      <div style={{ marginTop: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', border: '1px dashed rgba(0, 243, 255, 0.2)', padding: '5px 8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#00f3ff', fontSize: '0.62rem' }}>
                              SLICE AD ENVELOPES (1-{slot.sliceCount || 16})
                            </span>
                            <div className="flex-row-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                              <span style={{ color: '#88ccee', fontSize: '0.55rem' }}>SLICES:</span>
                              <div className="segmented-strip" style={{ display: 'inline-flex' }}>
                                {[16, 12, 8, 4].map(count => (
                                  <button
                                    key={count}
                                    className={`segmented-btn btn-xs ${ (slot.sliceCount || 16) === count ? 'active' : '' }`}
                                    onClick={() => {
                                      updateSlotParam(selectedEditSlotId, 'sliceCount', count);
                                      if (selectedSliceIndex >= count) {
                                        setSelectedSliceIndex(0);
                                      }
                                    }}
                                    style={{ padding: '1px 3px', fontSize: '0.48rem', minWidth: '16px', height: '14px', lineHeight: '12px' }}
                                  >
                                    {count}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              className={`btn btn-xs ${slot.sliceParams?.[selectedSliceIndex]?.loop ? 'active-pink' : ''}`}
                              onClick={() => {
                                const nextSlots = sampleSlotsRef.current.map(s => {
                                  if (s.id === selectedEditSlotId) {
                                    const paramsList = s.sliceParams ? [...s.sliceParams] : Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false }));
                                    paramsList[selectedSliceIndex] = { 
                                      ...paramsList[selectedSliceIndex], 
                                      loop: !paramsList[selectedSliceIndex].loop 
                                    };
                                    return { ...s, sliceParams: paramsList };
                                  }
                                  return s;
                                });
                                sampleSlotsRef.current = nextSlots;
                                setSampleSlots(nextSlots);
                              }}
                              style={{ 
                                fontSize: '0.52rem', 
                                padding: '1px 4px', 
                                margin: 0, 
                                height: '16px', 
                                lineHeight: '14px',
                                backgroundColor: slot.sliceParams?.[selectedSliceIndex]?.loop ? '#ff0055' : '',
                                borderColor: slot.sliceParams?.[selectedSliceIndex]?.loop ? '#ff0055' : '',
                                color: '#fff'
                              }}
                            >
                              LOOP: {slot.sliceParams?.[selectedSliceIndex]?.loop ? 'ON' : 'OFF'}
                            </button>
                            <button
                              className={`btn btn-xs ${slot.sliceParams?.[selectedSliceIndex]?.reverse ? 'active-pink' : ''}`}
                              onClick={() => {
                                const nextSlots = sampleSlotsRef.current.map(s => {
                                  if (s.id === selectedEditSlotId) {
                                    const paramsList = s.sliceParams ? [...s.sliceParams] : Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false }));
                                    paramsList[selectedSliceIndex] = { 
                                      ...paramsList[selectedSliceIndex], 
                                      reverse: !paramsList[selectedSliceIndex].reverse 
                                    };
                                    return { ...s, sliceParams: paramsList };
                                  }
                                  return s;
                                });
                                sampleSlotsRef.current = nextSlots;
                                setSampleSlots(nextSlots);
                              }}
                              style={{ 
                                fontSize: '0.52rem', 
                                padding: '1px 4px', 
                                margin: 0, 
                                height: '16px', 
                                lineHeight: '14px',
                                backgroundColor: slot.sliceParams?.[selectedSliceIndex]?.reverse ? '#ff0055' : '',
                                borderColor: slot.sliceParams?.[selectedSliceIndex]?.reverse ? '#ff0055' : '',
                                color: '#fff'
                              }}
                            >
                              REV: {slot.sliceParams?.[selectedSliceIndex]?.reverse ? 'ON' : 'OFF'}
                            </button>
                            <button
                              className="btn btn-xs"
                              onClick={() => {
                                const nextSlots = sampleSlotsRef.current.map(s => {
                                  if (s.id === selectedEditSlotId) {
                                    const currentSlice = s.sliceParams?.[selectedSliceIndex] || { attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false };
                                    return {
                                      ...s,
                                      sliceParams: Array.from({ length: 16 }, () => ({ ...currentSlice }))
                                    };
                                  }
                                  return s;
                                });
                                sampleSlotsRef.current = nextSlots;
                                setSampleSlots(nextSlots);
                              }}
                              style={{ fontSize: '0.52rem', padding: '1px 4px', margin: 0, height: '16px', lineHeight: '14px' }}
                            >
                              COPY TO ALL
                            </button>
                          </div>
                        </div>
                        
                        {/* Dynamic Slice Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${slot.sliceCount || 16}, 1fr)`, gap: '2px', marginBottom: '4px' }}>
                          {Array.from({ length: slot.sliceCount || 16 }).map((_, idx) => {
                            const isSelected = selectedSliceIndex === idx;
                            const previewNote = slot.rootNote + idx;
                            return (
                              <button
                                key={idx}
                                className={`segmented-btn btn-xs ${isSelected ? 'active' : ''}`}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setSelectedSliceIndex(idx);
                                  if (!audioCtxRef.current) initAudio();
                                  const ctx = audioCtxRef.current;
                                  if (ctx.state === 'suspended') ctx.resume();
                                  
                                  stopVoice(previewNote);
                                  
                                  const tempProg = {
                                    ...paramsRef.current,
                                    oscMode: 'single',
                                    oscAWave: selectedEditSlotId,
                                    oscATriggerMode: 'slice'
                                  };
                                  const voice = playProgramVoice(ctx, previewNote, 100, tempProg, `${previewNote}-prog`);
                                  activeVoicesRef.current.set(previewNote, [voice]);
                                  
                                  setActiveNotes(prev => {
                                    const next = new Set(prev);
                                    next.add(previewNote);
                                    return next;
                                  });
                                }}
                                onMouseUp={() => {
                                  stopVoice(previewNote);
                                }}
                                onMouseLeave={() => {
                                  stopVoice(previewNote);
                                }}
                                onTouchStart={(e) => {
                                  e.preventDefault();
                                  setSelectedSliceIndex(idx);
                                  if (!audioCtxRef.current) initAudio();
                                  const ctx = audioCtxRef.current;
                                  if (ctx.state === 'suspended') ctx.resume();
                                  
                                  stopVoice(previewNote);
                                  
                                  const tempProg = {
                                    ...paramsRef.current,
                                    oscMode: 'single',
                                    oscAWave: selectedEditSlotId,
                                    oscATriggerMode: 'slice'
                                  };
                                  const voice = playProgramVoice(ctx, previewNote, 100, tempProg, `${previewNote}-prog`);
                                  activeVoicesRef.current.set(previewNote, [voice]);
                                  
                                  setActiveNotes(prev => {
                                    const next = new Set(prev);
                                    next.add(previewNote);
                                    return next;
                                  });
                                }}
                                onTouchEnd={(e) => {
                                  e.preventDefault();
                                  stopVoice(previewNote);
                                }}
                                style={{ fontSize: '0.5rem', padding: '2px 0', textAlign: 'center', border: isSelected ? '1px solid #00f3ff' : '1px solid rgba(255,255,255,0.08)' }}
                              >
                                {idx + 1}
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Slice Envelopes Sliders */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                          {/* Row 1: Attack and Decay */}
                          <div className="flex-row-sub" style={{ fontSize: '0.58rem' }}>
                            <span style={{ color: '#ffe600', width: '40px' }}>Attack:</span>
                            <input
                              type="range" min="0.001" max="2.0" step="0.01"
                              value={slot.sliceParams?.[selectedSliceIndex]?.attack || 0.01}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const nextSlots = sampleSlotsRef.current.map(s => {
                                  if (s.id === selectedEditSlotId) {
                                    const paramsList = s.sliceParams ? [...s.sliceParams] : Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false }));
                                    paramsList[selectedSliceIndex] = { ...paramsList[selectedSliceIndex], attack: val };
                                    return { ...s, sliceParams: paramsList };
                                  }
                                  return s;
                                });
                                sampleSlotsRef.current = nextSlots;
                                setSampleSlots(nextSlots);
                              }}
                              style={{ flexGrow: 1, height: '8px' }}
                            />
                            <span className="font-mono" style={{ color: '#fff', fontSize: '0.52rem', width: '42px', textAlign: 'right' }}>{(slot.sliceParams?.[selectedSliceIndex]?.attack || 0.01).toFixed(3)}s</span>
                          </div>
                          
                          <div className="flex-row-sub" style={{ fontSize: '0.58rem' }}>
                            <span style={{ color: '#ff0055', width: '40px' }}>Decay:</span>
                            <input
                              type="range" min="0.01" max="5.0" step="0.05"
                              value={slot.sliceParams?.[selectedSliceIndex]?.decay || 0.3}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const nextSlots = sampleSlotsRef.current.map(s => {
                                  if (s.id === selectedEditSlotId) {
                                    const paramsList = s.sliceParams ? [...s.sliceParams] : Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false }));
                                    paramsList[selectedSliceIndex] = { ...paramsList[selectedSliceIndex], decay: val };
                                    return { ...s, sliceParams: paramsList };
                                  }
                                  return s;
                                });
                                sampleSlotsRef.current = nextSlots;
                                setSampleSlots(nextSlots);
                              }}
                              style={{ flexGrow: 1, height: '8px' }}
                            />
                            <span className="font-mono" style={{ color: '#fff', fontSize: '0.52rem', width: '42px', textAlign: 'right' }}>{(slot.sliceParams?.[selectedSliceIndex]?.decay || 0.3).toFixed(2)}s</span>
                          </div>

                          {/* Row 2: Pitch and Stretch */}
                          <div className="flex-row-sub" style={{ fontSize: '0.58rem' }}>
                            <span style={{ color: '#00f3ff', width: '40px' }}>Pitch:</span>
                            <input
                              type="range" min="-24" max="24" step="1"
                              value={slot.sliceParams?.[selectedSliceIndex]?.pitch !== undefined ? slot.sliceParams[selectedSliceIndex].pitch : 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                const nextSlots = sampleSlotsRef.current.map(s => {
                                  if (s.id === selectedEditSlotId) {
                                    const paramsList = s.sliceParams ? [...s.sliceParams] : Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false }));
                                    paramsList[selectedSliceIndex] = { ...paramsList[selectedSliceIndex], pitch: val };
                                    return { ...s, sliceParams: paramsList };
                                  }
                                  return s;
                                });
                                sampleSlotsRef.current = nextSlots;
                                setSampleSlots(nextSlots);
                              }}
                              style={{ flexGrow: 1, height: '8px' }}
                            />
                            <span className="font-mono" style={{ color: '#fff', fontSize: '0.52rem', width: '42px', textAlign: 'right' }}>
                              {(slot.sliceParams?.[selectedSliceIndex]?.pitch > 0 ? '+' : '') + (slot.sliceParams?.[selectedSliceIndex]?.pitch || 0)}
                            </span>
                          </div>

                          <div className="flex-row-sub" style={{ fontSize: '0.58rem' }}>
                            <span style={{ color: '#ff00ff', width: '40px' }}>Stretch:</span>
                            <input
                              type="range" min="-1.0" max="1.0" step="0.25"
                              value={slot.sliceParams?.[selectedSliceIndex]?.stretch !== undefined ? slot.sliceParams[selectedSliceIndex].stretch : 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const nextSlots = sampleSlotsRef.current.map(s => {
                                  if (s.id === selectedEditSlotId) {
                                    const paramsList = s.sliceParams ? [...s.sliceParams] : Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false }));
                                    paramsList[selectedSliceIndex] = { ...paramsList[selectedSliceIndex], stretch: val };
                                    return { ...s, sliceParams: paramsList };
                                  }
                                  return s;
                                });
                                sampleSlotsRef.current = nextSlots;
                                setSampleSlots(nextSlots);
                              }}
                              style={{ flexGrow: 1, height: '8px' }}
                            />
                            <span className="font-mono" style={{ color: '#fff', fontSize: '0.52rem', width: '42px', textAlign: 'right' }}>
                              {(slot.sliceParams?.[selectedSliceIndex]?.stretch > 0 ? '+' : '') + Math.round((slot.sliceParams?.[selectedSliceIndex]?.stretch || 0) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ================= ROW 2: SAMPLER MAPPING & RECORDER ================= */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '8px' }}>
                  
                  {/* Left Column: OSC Mapping & Balance */}
                  <div className="box-section-sub" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0, 243, 255, 0.15)', padding: '6px 8px' }}>
                    <h4 style={{ color: '#ff00ff', margin: '0 0 4px 0', fontSize: '0.72rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>OSC 1 & 2 PCM ROUTING</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {/* OSC 1 (A) Setup */}
                      <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0, 243, 255, 0.08)', borderRadius: '4px', padding: '4px 6px' }}>
                        <div className="flex-row-sub" style={{ fontSize: '0.62rem', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 'bold', color: '#ffe600' }}>OSC 1 (A):</span>
                          <span style={{ color: '#fff', fontSize: '0.58rem' }}>{(sampleSlots.find(s => s.id === params.oscAWave)?.name || '').slice(0, 10)}</span>
                        </div>
                        <div className="segmented-grid" style={{ marginTop: '2px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                          {sampleSlots.map(slot => (
                            <button
                              key={slot.id}
                              className={`segmented-btn btn-xs ${params.oscAWave === slot.id ? 'active' : ''}`}
                              onClick={() => setParams(prev => ({ ...prev, oscAWave: slot.id }))}
                              style={{ fontSize: '0.52rem', padding: '1px 2px' }}
                            >
                              {getSlotLabel(slot.id)}
                            </button>
                          ))}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', marginTop: '4px' }}>
                          {/* Octave selection */}
                          <div className="flex-row-sub" style={{ fontSize: '0.58rem', flexDirection: 'column', gap: '1px', alignItems: 'flex-start' }}>
                            <span style={{ color: '#88ccee' }}>Octave:</span>
                            <div className="segmented-strip">
                              {[-2, -1, 0, 1, 2].map(oct => (
                                <button
                                  key={oct}
                                  className={`segmented-btn btn-xs ${params.oscAOctave === oct ? 'active' : ''}`}
                                  onClick={() => setParams(prev => ({ ...prev, oscAOctave: oct }))}
                                  style={{ padding: '0px 2px', fontSize: '0.5rem' }}
                                >
                                  {oct > 0 ? `+${oct}` : oct}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Trigger mode selection */}
                          <div className="flex-row-sub" style={{ fontSize: '0.58rem', flexDirection: 'column', gap: '1px', alignItems: 'flex-end' }}>
                            <span style={{ color: '#88ccee' }}>Play Mode:</span>
                            <div className="segmented-strip">
                              {['pitch', 'slice'].map(m => (
                                <button
                                  key={m}
                                  className={`segmented-btn btn-xs ${params.oscATriggerMode === m ? 'active' : ''}`}
                                  onClick={() => setParams(prev => ({ ...prev, oscATriggerMode: m }))}
                                  style={{ padding: '1px 3px', fontSize: '0.5rem' }}
                                >
                                  {m.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Detune slider */}
                        <div className="flex-row-sub" style={{ fontSize: '0.58rem', marginTop: '3px' }}>
                          <span style={{ color: '#88ccee' }}>Detune:</span>
                          <input 
                            type="range" min="-50" max="50" 
                            value={params.oscADetune} 
                            onChange={(e) => setParams(prev => ({ ...prev, oscADetune: parseInt(e.target.value) }))} 
                            style={{ flexGrow: 1, height: '8px' }}
                          />
                          <span className="val-text font-mono" style={{ color: '#fff', fontSize: '0.55rem' }}>{params.oscADetune}c</span>
                        </div>

                        {/* Echo Send slider */}
                        <div className="flex-row-sub" style={{ fontSize: '0.58rem', marginTop: '3px' }}>
                          <span style={{ color: '#88ccee' }}>Echo Send:</span>
                          <input 
                            type="range" min="0" max="1" step="0.05"
                            value={params.mfx1SendA} 
                            onChange={(e) => setParams(prev => ({ ...prev, mfx1SendA: parseFloat(e.target.value) }))} 
                            style={{ flexGrow: 1, height: '8px' }}
                          />
                          <span className="val-text font-mono" style={{ color: '#fff', fontSize: '0.55rem' }}>{Math.round(params.mfx1SendA * 100)}%</span>
                        </div>

                        {/* Reverb Send slider */}
                        <div className="flex-row-sub" style={{ fontSize: '0.58rem', marginTop: '3px' }}>
                          <span style={{ color: '#88ccee' }}>Reverb Send:</span>
                          <input 
                            type="range" min="0" max="1" step="0.05"
                            value={params.mfx2SendA} 
                            onChange={(e) => setParams(prev => ({ ...prev, mfx2SendA: parseFloat(e.target.value) }))} 
                            style={{ flexGrow: 1, height: '8px' }}
                          />
                          <span className="val-text font-mono" style={{ color: '#fff', fontSize: '0.55rem' }}>{Math.round(params.mfx2SendA * 100)}%</span>
                        </div>
                      </div>

                      {/* OSC 2 (B) Setup */}
                      <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0, 243, 255, 0.08)', borderRadius: '4px', padding: '4px 6px' }}>
                        <div className="flex-row-sub" style={{ fontSize: '0.62rem', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 'bold', color: '#ff00ff' }}>OSC 2 (B):</span>
                          <span style={{ color: '#fff', fontSize: '0.58rem' }}>{(sampleSlots.find(s => s.id === params.oscBWave)?.name || '').slice(0, 10)}</span>
                        </div>
                        <div className="segmented-grid" style={{ marginTop: '2px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                          {sampleSlots.map(slot => (
                            <button
                              key={slot.id}
                              className={`segmented-btn btn-xs ${params.oscBWave === slot.id ? 'active' : ''}`}
                              onClick={() => setParams(prev => ({ ...prev, oscBWave: slot.id }))}
                              disabled={params.oscMode === 'single'}
                              style={{ fontSize: '0.52rem', padding: '1px 2px' }}
                            >
                              {getSlotLabel(slot.id)}
                            </button>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', marginTop: '4px' }}>
                          {/* Octave selection */}
                          <div className="flex-row-sub" style={{ fontSize: '0.58rem', flexDirection: 'column', gap: '1px', alignItems: 'flex-start' }}>
                            <span style={{ color: '#88ccee', opacity: params.oscMode === 'single' ? 0.4 : 1 }}>Octave:</span>
                            <div className="segmented-strip">
                              {[-2, -1, 0, 1, 2].map(oct => (
                                <button
                                  key={oct}
                                  className={`segmented-btn btn-xs ${params.oscBOctave === oct ? 'active' : ''}`}
                                  onClick={() => setParams(prev => ({ ...prev, oscBOctave: oct }))}
                                  disabled={params.oscMode === 'single'}
                                  style={{ padding: '0px 2px', fontSize: '0.5rem' }}
                                >
                                  {oct > 0 ? `+${oct}` : oct}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Trigger mode selection */}
                          <div className="flex-row-sub" style={{ fontSize: '0.58rem', flexDirection: 'column', gap: '1px', alignItems: 'flex-end' }}>
                            <span style={{ color: '#88ccee', opacity: params.oscMode === 'single' ? 0.4 : 1 }}>Play Mode:</span>
                            <div className="segmented-strip">
                              {['pitch', 'slice'].map(m => (
                                <button
                                  key={m}
                                  className={`segmented-btn btn-xs ${params.oscBTriggerMode === m ? 'active' : ''}`}
                                  onClick={() => setParams(prev => ({ ...prev, oscBTriggerMode: m }))}
                                  disabled={params.oscMode === 'single'}
                                  style={{ padding: '1px 3px', fontSize: '0.5rem' }}
                                >
                                  {m.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Detune slider */}
                        <div className="flex-row-sub" style={{ fontSize: '0.58rem', marginTop: '3px' }}>
                          <span style={{ color: '#88ccee', opacity: params.oscMode === 'single' ? 0.4 : 1 }}>Detune:</span>
                          <input 
                            type="range" min="-50" max="50" 
                            value={params.oscBDetune} 
                            onChange={(e) => setParams(prev => ({ ...prev, oscBDetune: parseInt(e.target.value) }))} 
                            disabled={params.oscMode === 'single'}
                            style={{ flexGrow: 1, height: '8px' }}
                          />
                          <span className="val-text font-mono" style={{ color: '#fff', fontSize: '0.55rem', opacity: params.oscMode === 'single' ? 0.4 : 1 }}>{params.oscBDetune}c</span>
                        </div>

                        {/* Echo Send slider */}
                        <div className="flex-row-sub" style={{ fontSize: '0.58rem', marginTop: '3px' }}>
                          <span style={{ color: '#88ccee', opacity: params.oscMode === 'single' ? 0.4 : 1 }}>Echo Send:</span>
                          <input 
                            type="range" min="0" max="1" step="0.05"
                            value={params.mfx1SendB} 
                            onChange={(e) => setParams(prev => ({ ...prev, mfx1SendB: parseFloat(e.target.value) }))} 
                            disabled={params.oscMode === 'single'}
                            style={{ flexGrow: 1, height: '8px' }}
                          />
                          <span className="val-text font-mono" style={{ color: '#fff', fontSize: '0.55rem', opacity: params.oscMode === 'single' ? 0.4 : 1 }}>{Math.round(params.mfx1SendB * 100)}%</span>
                        </div>

                        {/* Reverb Send slider */}
                        <div className="flex-row-sub" style={{ fontSize: '0.58rem', marginTop: '3px' }}>
                          <span style={{ color: '#88ccee', opacity: params.oscMode === 'single' ? 0.4 : 1 }}>Reverb Send:</span>
                          <input 
                            type="range" min="0" max="1" step="0.05"
                            value={params.mfx2SendB} 
                            onChange={(e) => setParams(prev => ({ ...prev, mfx2SendB: parseFloat(e.target.value) }))} 
                            disabled={params.oscMode === 'single'}
                            style={{ flexGrow: 1, height: '8px' }}
                          />
                          <span className="val-text font-mono" style={{ color: '#fff', fontSize: '0.55rem', opacity: params.oscMode === 'single' ? 0.4 : 1 }}>{Math.round(params.mfx2SendB * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Oscillator Mode and Crossfader */}
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginTop: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '4px' }}>
                      <div className="flex-row-sub" style={{ fontSize: '0.62rem', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#88ccee' }}>OSC Mode:</span>
                        <button
                          className="segmented-btn btn-xs active"
                          style={{ margin: 0, padding: '1px 6px', fontSize: '0.55rem', fontWeight: 'bold' }}
                          onClick={() => setParams(prev => ({ ...prev, oscMode: prev.oscMode === 'single' ? 'double' : 'single' }))}
                        >
                          {params.oscMode.toUpperCase()}
                        </button>
                      </div>

                      <div className="flex-row-sub" style={{ fontSize: '0.62rem', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#88ccee', opacity: params.oscMode === 'single' ? 0.4 : 1 }}>Mix Crossfade (1:2):</span>
                        <input 
                          type="range" min="0" max="1" step="0.02" 
                          value={params.oscBalance} 
                          onChange={(e) => setParams(prev => ({ ...prev, oscBalance: parseFloat(e.target.value) }))} 
                          disabled={params.oscMode === 'single'}
                          style={{ flexGrow: 1, height: '10px' }}
                        />
                        <span className="font-mono text-cyan" style={{ fontSize: '0.65rem', minWidth: '32px', textAlign: 'right', opacity: params.oscMode === 'single' ? 0.4 : 1 }}>
                          {Math.round((1 - params.oscBalance) * 100)}:{Math.round(params.oscBalance * 100)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Recorder Deck */}
                  <div className="box-section-sub" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0, 243, 255, 0.15)', padding: '6px 8px' }}>
                    <h4 style={{ color: '#ffe600', margin: '0 0 4px 0', fontSize: '0.72rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>INPUT RECORDER DECK</h4>
                    
                    {/* Active Edit / Record target slots grid (replaces select menu!) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#88ccee', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Target User / Factory Slot:</span>
                      </div>
                      <div className="segmented-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px' }}>
                        {sampleSlots.map(s => (
                          <button
                            key={s.id}
                            className={`segmented-btn btn-xs ${selectedEditSlotId === s.id ? 'active' : ''}`}
                            onClick={() => setSelectedEditSlotId(s.id)}
                            style={{ fontSize: '0.52rem', padding: '2px 1px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                            title={`${getSlotLabel(s.id)}: ${s.name}`}
                          >
                            {getSlotLabel(s.id)}:{s.buffer ? '●' : '○'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Source Selector & Input Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.62rem', marginTop: '4px', marginBottom: '4px' }}>
                      <span style={{ color: '#88ccee' }}>REC SOURCE:</span>
                      <div className="segmented-strip">
                        {['mic', 'monitor'].map(mode => (
                          <button
                            key={mode}
                            className={`segmented-btn btn-xs ${recordingInputMode === mode ? 'active' : ''}`}
                            onClick={() => {
                              if (isArmed) disarmMicrophone();
                              setRecordingInputMode(mode);
                            }}
                            style={{ padding: '2px 6px', fontSize: '0.55rem' }}
                          >
                            {mode.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '6px', marginTop: '4px' }}>
                      <button 
                        className={`btn btn-xs ${isArmed ? 'active-yellow' : ''}`} 
                        onClick={recordingInputMode === 'mic' ? armMicrophone : armMonitor}
                        style={{ margin: 0, fontSize: '0.62rem', padding: '3px' }}
                      >
                        {isArmed ? `DISARM ${recordingInputMode.toUpperCase()}` : `ARM ${recordingInputMode.toUpperCase()}`}
                      </button>
                      <button 
                        className={`btn btn-xs ${isRecording ? 'active-red blinking' : ''}`} 
                        disabled={!isArmed}
                        onClick={isRecording ? stopRecording : startRecording}
                        style={{ margin: 0, fontSize: '0.62rem', padding: '3px' }}
                      >
                        {isRecording ? 'STOP REC' : 'RECORD (LIVE)'}
                      </button>
                    </div>

                    {/* Level meter and File selector */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
                      {/* Level meter */}
                      <div className="mic-level-meter-container" style={{ padding: '3px 6px', height: '22px' }}>
                        <div className="mic-level-bar-track" style={{ height: '4px' }}>
                          <div id="mic-level-bar-fill" className="mic-level-bar-fill"></div>
                        </div>
                      </div>

                      {/* File selector */}
                      <div>
                        <input 
                          type="file" 
                          id="sampler-file-loader-input" 
                          accept="audio/*" 
                          style={{ display: 'none' }} 
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (!audioCtxRef.current) initAudio();
                            const ctx = audioCtxRef.current;
                            try {
                              const arrayBuffer = await file.arrayBuffer();
                              ctx.decodeAudioData(arrayBuffer, (buffer) => {
                                const nextSlots = sampleSlotsRef.current.map(slot => {
                                  if (slot.id === selectedEditSlotId) {
                                    return {
                                      ...slot,
                                      name: file.name.slice(0, 20),
                                      buffer: buffer,
                                      revBuffer: getReversedBuffer(ctx, buffer),
                                      start: 0.0,
                                      end: 1.0,
                                      loopStart: 0.0,
                                      loopEnd: 1.0
                                    };
                                  }
                                  return slot;
                                });
                                sampleSlotsRef.current = nextSlots;
                                setSampleSlots(nextSlots);
                              }, (err) => {
                                console.error("Error decoding imported audio: ", err);
                                alert("Failed to decode. Verify the audio format is valid.");
                              });
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                        />
                        <button 
                          className="btn btn-xs" 
                          style={{ borderColor: '#ffe600', color: '#ffe600', width: '100%', margin: 0, fontSize: '0.62rem', padding: '3px' }}
                          onClick={() => document.getElementById('sampler-file-loader-input').click()}
                        >
                          IMPORT FILE...
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= ROW 3: MODULATION ENVELOPES & FX MIX ================= */}
                {/* ================= ROW 3: MODULATION ENVELOPES & FX MIX ================= */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr', gap: '8px' }}>
                  
                  {/* Left Column: Filter & Amp Envelopes */}
                  <div className="box-section-sub" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0, 243, 255, 0.15)', padding: '6px 8px' }}>
                    <h4 style={{ color: '#00ff66', margin: '0 0 4px 0', fontSize: '0.72rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>FILTER & AMPLIFIER ENVELOPES</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {/* VCF EG (Filter Env) */}
                      <div>
                        <div className="flex-row-sub" style={{ fontSize: '0.6rem', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 'bold', color: '#88ccee' }}>VCF Env (Filter):</span>
                          <span style={{ fontSize: '0.52rem', color: '#aaa' }} className="font-mono">A:{params.vcfEG.attackTime}s D:{params.vcfEG.decayTime}s S:{params.vcfEG.sustainLevel}</span>
                        </div>
                        <div className="canvas-container-sub" style={{ border: '1px solid rgba(0,243,255,0.25)', borderRadius: '3px', background: '#010915', height: '55px', padding: '1px' }}>
                          <canvas 
                            ref={(canvas) => { if (canvas) renderEgPreview(canvas, params.vcfEG); }}
                            width="160" height="50" 
                            className="eg-draw-canvas"
                            onClick={(e) => handleEgCanvasClick(e, e.currentTarget, 'VCF')}
                            style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
                          />
                        </div>
                        <div style={{ fontSize: '0.5rem', color: '#ff00ff', textAlign: 'center', marginTop: '1px' }}>
                          🖱️ Click & Drag to shape VCF Filter ADSR
                        </div>
                      </div>

                      {/* VCA EG (Amp Env) */}
                      <div>
                        <div className="flex-row-sub" style={{ fontSize: '0.6rem', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 'bold', color: '#88ccee' }}>VCA Env (Volume):</span>
                          <span style={{ fontSize: '0.52rem', color: '#aaa' }} className="font-mono">A:{params.vcaEG.attackTime}s D:{params.vcaEG.decayTime}s S:{params.vcaEG.sustainLevel}</span>
                        </div>
                        <div className="canvas-container-sub" style={{ border: '1px solid rgba(0,243,255,0.25)', borderRadius: '3px', background: '#010915', height: '55px', padding: '1px' }}>
                          <canvas 
                            ref={(canvas) => { if (canvas) renderEgPreview(canvas, params.vcaEG); }}
                            width="160" height="50" 
                            className="eg-draw-canvas"
                            onClick={(e) => handleEgCanvasClick(e, e.currentTarget, 'VCA')}
                            style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
                          />
                        </div>
                        <div style={{ fontSize: '0.5rem', color: '#ff00ff', textAlign: 'center', marginTop: '1px' }}>
                          🖱️ Click & Drag to shape VCA Amplitude ADSR
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: LFO, ARP & Global FX Mixer Controls */}
                  <div className="box-section-sub" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0, 243, 255, 0.15)', padding: '6px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h4 style={{ color: '#00f3ff', margin: '0 0 4px 0', fontSize: '0.72rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>LFO, ARP & GLOBAL FX</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.6rem' }}>
                      {/* LFO & ARP */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {/* LFO */}
                        <div className="flex-row-sub">
                          <label>LFO Rate:</label>
                          <input 
                            type="range" min="0.1" max="15" step="0.1" 
                            value={params.lfo1Rate} 
                            onChange={(e) => setParams(prev => ({ ...prev, lfo1Rate: parseFloat(e.target.value) }))} 
                            style={{ width: '45px', height: '8px' }}
                          />
                          <span className="font-mono text-cyan" style={{ fontSize: '0.52rem', width: '20px', textAlign: 'right' }}>{Math.round(params.lfo1Rate)}H</span>
                        </div>
                        <div className="flex-row-sub" style={{ alignItems: 'center' }}>
                          <label>LFO Tgt:</label>
                          <div className="segmented-strip" style={{ flexGrow: 1 }}>
                            {['pitch', 'filter'].map(t => (
                              <button
                                key={t}
                                className={`segmented-btn btn-xs ${params.lfo1Target === t ? 'active' : ''}`}
                                onClick={() => setParams(prev => ({ ...prev, lfo1Target: t }))}
                                style={{ fontSize: '0.48rem', padding: '0px 2px' }}
                              >
                                {t.slice(0, 3).toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Arpeggiator */}
                        <div className="flex-row-sub" style={{ alignItems: 'center', marginTop: '2px', borderTop: '1px dashed rgba(0, 243, 255, 0.1)', paddingTop: '2px', gap: '3px' }}>
                          <label style={{ width: '20px', flexShrink: 0 }}>Arp:</label>
                          <button
                            className={`segmented-btn btn-xs ${params.arpOn ? 'active' : ''}`}
                            onClick={() => setParams(prev => ({ ...prev, arpOn: !prev.arpOn }))}
                            style={{ padding: '0px 3px', fontSize: '0.48rem', flexShrink: 0 }}
                          >
                            {params.arpOn ? 'ON' : 'OFF'}
                          </button>
                          <input 
                            type="range" min="40" max="250" step="1"
                            value={params.arpBpm || 120} 
                            onChange={(e) => setParams(prev => ({ ...prev, arpBpm: parseInt(e.target.value) || 120 }))} 
                            style={{ flexGrow: 1, height: '8px', minWidth: '30px' }}
                          />
                          <input 
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={params.arpBpm} 
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val === '') {
                                setParams(prev => ({ ...prev, arpBpm: '' }));
                              } else {
                                const parsed = parseInt(val, 10);
                                setParams(prev => ({ ...prev, arpBpm: Math.min(250, parsed) }));
                              }
                            }}
                            onBlur={() => {
                              const parsed = parseInt(params.arpBpm, 10);
                              if (isNaN(parsed) || parsed < 40) {
                                setParams(prev => ({ ...prev, arpBpm: 40 }));
                              } else if (parsed > 250) {
                                setParams(prev => ({ ...prev, arpBpm: 250 }));
                              }
                            }}
                            style={{ 
                              width: '22px', 
                              background: '#000', 
                              border: '1px solid rgba(0, 243, 255, 0.4)', 
                              color: '#00f3ff', 
                              fontFamily: 'monospace', 
                              fontSize: '0.48rem', 
                              textAlign: 'center', 
                              borderRadius: '2px', 
                              padding: '0px',
                              outline: 'none',
                              flexShrink: 0
                            }}
                          />
                          <span className="font-mono text-cyan" style={{ fontSize: '0.48rem', flexShrink: 0 }}>B</span>
                          <button
                            className="segmented-btn btn-xs"
                            onClick={handleTapTempo}
                            style={{ 
                              padding: '0px 3px', 
                              fontSize: '0.45rem', 
                              height: '11px', 
                              border: '1px solid rgba(255, 0, 255, 0.6)', 
                              color: '#ff00ff', 
                              background: 'transparent', 
                              cursor: 'pointer', 
                              borderRadius: '2px',
                              flexShrink: 0,
                              textShadow: '0 0 2px rgba(255, 0, 255, 0.5)'
                            }}
                          >
                            TAP
                          </button>
                        </div>
                      </div>

                      {/* FX Parameters */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div className="flex-row-sub" style={{ justifyContent: 'space-between' }}>
                          <span style={{ color: '#ffe600' }}>IFX1:</span>
                          <select
                            value={params.ifx1Type}
                            onChange={(e) => setParams(prev => ({ ...prev, ifx1Type: e.target.value }))}
                            style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.55rem', padding: '1px', borderRadius: '3px', width: '75px' }}
                          >
                            {['Bypass', 'Chorus', 'Phaser', 'Autowah', 'Overdrive', 'Rotary Speaker', 'Flanger', 'Ring Modulator'].map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-row-sub">
                          <label>Mix1:</label>
                          <input 
                            type="range" min="0" max="1" step="0.05"
                            value={params.ifx1Mix} 
                            onChange={(e) => setParams(prev => ({ ...prev, ifx1Mix: parseFloat(e.target.value) }))} 
                            style={{ width: '45px', height: '8px' }}
                          />
                          <span className="font-mono text-cyan" style={{ fontSize: '0.52rem', width: '20px', textAlign: 'right' }}>{Math.round(params.ifx1Mix * 100)}%</span>
                        </div>

                        <div className="flex-row-sub" style={{ justifyContent: 'space-between', marginTop: '1px' }}>
                          <span style={{ color: '#ff00ff' }}>IFX2:</span>
                          <select
                            value={params.ifx2Type}
                            onChange={(e) => setParams(prev => ({ ...prev, ifx2Type: e.target.value }))}
                            style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.55rem', padding: '1px', borderRadius: '3px', width: '75px' }}
                          >
                            {['Bypass', 'Chorus', 'Phaser', 'Autowah', 'Overdrive', 'Rotary Speaker', 'Flanger', 'Ring Modulator'].map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-row-sub">
                          <label>Mix2:</label>
                          <input 
                            type="range" min="0" max="1" step="0.05"
                            value={params.ifx2Mix} 
                            onChange={(e) => setParams(prev => ({ ...prev, ifx2Mix: parseFloat(e.target.value) }))} 
                            style={{ width: '45px', height: '8px' }}
                          />
                          <span className="font-mono text-cyan" style={{ fontSize: '0.52rem', width: '20px', textAlign: 'right' }}>{Math.round(params.ifx2Mix * 100)}%</span>
                        </div>

                        <div className="flex-row-sub" style={{ marginTop: '1px' }}>
                          <label>Reverb:</label>
                          <input 
                            type="range" min="0" max="0.8" step="0.05"
                            value={params.reverbMix} 
                            onChange={(e) => setParams(prev => ({ ...prev, reverbMix: parseFloat(e.target.value) }))} 
                            style={{ width: '45px', height: '8px' }}
                          />
                          <span className="font-mono text-cyan" style={{ fontSize: '0.52rem', width: '20px', textAlign: 'right' }}>{Math.round(params.reverbMix * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* MIDI active device selection in footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.58rem', borderTop: '1px dashed rgba(0, 243, 255, 0.1)', paddingTop: '3px', marginTop: '3px' }}>
                      <span style={{ color: '#ffe600' }}>MIDI IN:</span>
                      <select 
                        value={selectedMidiDevice} 
                        onChange={(e) => {
                          setSelectedMidiDevice(e.target.value);
                          const dev = midiDevices.find(d => d.id === e.target.value);
                          if (dev) setupMidiListeners(dev);
                        }}
                        disabled={midiDevices.length === 0}
                        style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.55rem', padding: '1px', borderRadius: '3px', width: '120px' }}
                      >
                        {midiDevices.map((d) => (
                          <option key={d.id} value={d.id}>{d.name.slice(0, 22)}</option>
                        ))}
                        {midiDevices.length === 0 && <option>No Devices Found</option>}
                      </select>
                    </div>
                  </div>

                  {/* Column 3: Stutter Edit & MIDI CC Learn Matrix */}
                  <div className="box-section-sub" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0, 243, 255, 0.15)', padding: '6px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h4 style={{ color: '#ff00ff', margin: '0 0 4px 0', fontSize: '0.72rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>STUTTER & MOVEMENT</h4>
                    
                    {/* Stutter Controls */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4px 8px', fontSize: '0.55rem', marginBottom: '4px' }}>
                      <div className="flex-row-sub" style={{ gridColumn: 'span 2', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <button
                          className={`btn btn-xs ${params.stutterOn ? 'active-pink' : ''}`}
                          onClick={() => setParams(prev => ({ ...prev, stutterOn: !prev.stutterOn }))}
                          style={{ flexGrow: 1, fontWeight: 'bold', fontSize: '0.58rem', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: params.stutterOn ? '#ff0055' : '#888', boxShadow: params.stutterOn ? '0 0 4px #ff0055' : 'none' }} />
                          STUTTER EFFECT
                        </button>
                      </div>

                      <div className="flex-row-sub">
                        <label>Rate:</label>
                        <select
                          value={params.stutterRate}
                          onChange={(e) => setParams(prev => ({ ...prev, stutterRate: e.target.value }))}
                          style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.52rem', padding: '1px', borderRadius: '3px', width: '50px' }}
                        >
                          {['1/4', '1/8', '1/12', '1/16', '1/24', '1/32', '1/64', '1/128'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-row-sub">
                        <label>Gate:</label>
                        <input
                          type="range" min="0.1" max="1.0" step="0.05"
                          value={params.stutterGate}
                          onChange={(e) => setParams(prev => ({ ...prev, stutterGate: parseFloat(e.target.value) }))}
                          style={{ width: '40px', height: '8px' }}
                        />
                        <span className="font-mono text-cyan" style={{ fontSize: '0.5rem', width: '18px', textAlign: 'right' }}>{Math.round(params.stutterGate * 100)}%</span>
                      </div>

                      <div className="flex-row-sub">
                        <label>Sweep:</label>
                        <div className="segmented-strip" style={{ display: 'inline-flex' }}>
                          {['None', 'Up', 'Down'].map(dir => (
                            <button
                              key={dir}
                              className={`segmented-btn btn-xs ${params.stutterSweepDir === dir ? 'active' : ''}`}
                              onClick={() => setParams(prev => ({ ...prev, stutterSweepDir: dir }))}
                              style={{ fontSize: '0.45rem', padding: '0px 2px', height: '12px', lineHeight: '10px' }}
                            >
                              {dir.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex-row-sub">
                        <label>Time:</label>
                        <input
                          type="range" min="0.2" max="4.0" step="0.2"
                          value={params.stutterSweepTime}
                          onChange={(e) => setParams(prev => ({ ...prev, stutterSweepTime: parseFloat(e.target.value) }))}
                          style={{ width: '40px', height: '8px' }}
                        />
                        <span className="font-mono text-cyan" style={{ fontSize: '0.5rem', width: '18px', textAlign: 'right' }}>{params.stutterSweepTime}s</span>
                      </div>

                      <div className="flex-row-sub">
                        <label>Jitter:</label>
                        <input
                          type="range" min="0.0" max="1.0" step="0.1"
                          value={params.stutterJitter}
                          onChange={(e) => setParams(prev => ({ ...prev, stutterJitter: parseFloat(e.target.value) }))}
                          style={{ width: '40px', height: '8px' }}
                        />
                        <span className="font-mono text-cyan" style={{ fontSize: '0.5rem', width: '18px', textAlign: 'right' }}>{Math.round(params.stutterJitter * 100)}%</span>
                      </div>

                      <div className="flex-row-sub">
                        <label>Pitch Swp:</label>
                        <input
                          type="range" min="-12" max="12" step="1"
                          value={params.stutterPitchSweep}
                          onChange={(e) => setParams(prev => ({ ...prev, stutterPitchSweep: parseInt(e.target.value) }))}
                          style={{ width: '40px', height: '8px' }}
                        />
                        <span className="font-mono text-cyan" style={{ fontSize: '0.5rem', width: '18px', textAlign: 'right' }}>{params.stutterPitchSweep > 0 ? `+${params.stutterPitchSweep}` : params.stutterPitchSweep}</span>
                      </div>
                    </div>

                    {/* MIDI CC Learn Matrix Grid Panel */}
                    <div style={{ borderTop: '1px dashed rgba(0, 243, 255, 0.1)', paddingTop: '3px', marginTop: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ color: '#00f3ff', fontSize: '0.55rem', fontWeight: 'bold' }}>MIDI CC LEARN MATRIX</span>
                        <button
                          className="btn btn-xs"
                          onClick={() => {
                            setMidiMappings({});
                            localStorage.removeItem('delta7_midi_mappings');
                          }}
                          style={{ fontSize: '0.45rem', padding: '0px 3px', height: '12px', lineHeight: '10px' }}
                        >
                          CLEAR ALL
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
                        {[
                          { name: 'Cutoff', key: 'cutoff' },
                          { name: 'Reso', key: 'resonance' },
                          { name: 'OscA Vol', key: 'oscAVol' },
                          { name: 'OscB Vol', key: 'oscBVol' },
                          { name: 'LFO Rate', key: 'lfo1Rate' },
                          { name: 'IFX Mix', key: 'ifxMix' },
                          { name: 'EQ Low', key: 'eqLow' },
                          { name: 'EQ Mid', key: 'eqMid' },
                          { name: 'EQ High', key: 'eqHigh' },
                          { name: 'Kaoss X', key: 'kaossX' },
                          { name: 'Kaoss Y', key: 'kaossY' },
                          { name: 'Master', key: 'masterVolume' },
                          { name: 'Echo Time', key: 'spaceEchoTime' },
                          { name: 'Echo Fb', key: 'spaceEchoFeedback' },
                          { name: 'Echo Wow', key: 'spaceEchoWow' },
                          { name: 'Echo Sat', key: 'spaceEchoSaturation' },
                          { name: 'Echo Spring', key: 'spaceEchoSpring' },
                          { name: 'Stut On', key: 'stutterOn' },
                          { name: 'Stut Rate', key: 'stutterRate' },
                          { name: 'Stut Gate', key: 'stutterGate' },
                          { name: 'Stut Swp', key: 'stutterSweepTime' }
                        ].map(item => {
                          const isLearning = midiLearnParam === item.key;
                          const ccVal = midiMappings[item.key];
                          return (
                            <button
                              key={item.key}
                              onClick={() => setMidiLearnParam(isLearning ? null : item.key)}
                              className={`btn btn-xs ${isLearning ? 'active-pink' : ccVal !== undefined ? 'active-cyan' : ''}`}
                              style={{
                                fontSize: '0.48rem',
                                padding: '2px 0',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '22px',
                                border: isLearning ? '1px solid #ff0055' : ccVal !== undefined ? '1px solid #00f3ff' : '1px solid rgba(255,255,255,0.08)',
                                background: isLearning ? 'rgba(255, 0, 85, 0.15)' : ccVal !== undefined ? 'rgba(0, 243, 255, 0.05)' : 'rgba(0,0,0,0.2)'
                              }}
                            >
                              <span style={{ color: '#fff', fontSize: '0.46rem' }}>{item.name}</span>
                              <span style={{ color: isLearning ? '#ff0055' : ccVal !== undefined ? '#00f3ff' : '#888', fontSize: '0.42rem', fontWeight: 'bold' }}>
                                {isLearning ? 'LEARN' : ccVal !== undefined ? `CC ${ccVal}` : '---'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE CONTROLS & KAOSS PAD ================= */}
        <div className="rack-panel-right steel-plate">
          
          {/* Glowing Delta Pad Touch pad */}
          <div className="kaoss-pad-container">
            <div className="section-label">Delta Pad XY Modulator</div>
            <div className="kaoss-targets-selectors font-mono" style={{ gap: '6px' }}>
              <div className="target-select-row-new">
                <div className="target-row-label">X-AXIS TARGET:</div>
                <div className="target-btn-strip">
                  {[
                    { value: 'cutoff', label: 'CUTOFF' },
                    { value: 'lfoRate', label: 'LFO' },
                    { value: 'ifxMix', label: 'IFX' },
                    { value: 'delayTime', label: 'DELAY' },
                    { value: 'gater', label: 'GATER' }
                  ].map(tgt => (
                    <button
                      key={tgt.value}
                      className={`target-btn ${kaossTargetX === tgt.value ? 'selected-x' : ''}`}
                      onClick={() => {
                        setKaossTargetX(tgt.value);
                        modulateKaossParameters(kaossPad.x, kaossPad.y, kaossPad.touchActive);
                      }}
                    >
                      {tgt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="target-select-row-new">
                <div className="target-row-label">Y-AXIS TARGET:</div>
                <div className="target-btn-strip">
                  {[
                    { value: 'resonance', label: 'RESO' },
                    { value: 'reverbDecay', label: 'REVERB' },
                    { value: 'chorusRate', label: 'FB' },
                    { value: 'ringModMix', label: 'RM MIX' },
                    { value: 'ringModFreq', label: 'RM FREQ' },
                    { value: 'gater', label: 'GATER' }
                  ].map(tgt => (
                    <button
                      key={tgt.value}
                      className={`target-btn ${kaossTargetY === tgt.value ? 'selected-y' : ''}`}
                      onClick={() => {
                        setKaossTargetY(tgt.value);
                        modulateKaossParameters(kaossPad.x, kaossPad.y, kaossPad.touchActive);
                      }}
                    >
                      {tgt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Neon Touch pad Screen */}
            <div 
              className={`kaoss-touchpad ${kaossPad.touchActive ? 'glow-red' : ''}`}
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleKaossTouch(e, rect);
              }}
              onMouseMove={(e) => {
                if (e.buttons === 1) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  handleKaossTouch(e, rect);
                }
              }}
              onMouseUp={() => {
                setKaossPad(prev => ({ 
                  ...prev, 
                  touchActive: false 
                }));
                // Reset coordinates if Hold toggle is inactive
                if (!kaossPad.holdActive) {
                  setKaossPad(prev => ({ ...prev, x: 0.5, y: 0.5 }));
                  modulateKaossParameters(0.5, 0.5, false);
                }
              }}
              onMouseLeave={() => {
                setKaossPad(prev => ({ 
                  ...prev, 
                  touchActive: false 
                }));
                if (!kaossPad.holdActive) {
                  setKaossPad(prev => ({ ...prev, x: 0.5, y: 0.5 }));
                  modulateKaossParameters(0.5, 0.5, false);
                }
              }}
            >
              {/* Touch Crosshair Dot */}
              <div 
                className="kaoss-crosshair"
                style={{
                  left: `${kaossPad.x * 100}%`,
                  bottom: `${kaossPad.y * 100}%`
                }}
              ></div>

              {/* Grid Markings */}
              <div className="kaoss-gridlines">
                <span className="grid-center-cross"></span>
              </div>
            </div>

            <div className="kaoss-footer-actions">
              <button 
                className={`btn btn-sm ${kaossPad.holdActive ? 'active-red' : ''}`}
                onClick={() => {
                  const nextHold = !kaossPad.holdActive;
                  setKaossPad(prev => ({ ...prev, holdActive: nextHold }));
                  if (!nextHold && !kaossPad.touchActive) {
                    setKaossPad(prev => ({ ...prev, x: 0.5, y: 0.5 }));
                    modulateKaossParameters(0.5, 0.5, false);
                  } else {
                    modulateKaossParameters(kaossPad.x, kaossPad.y, kaossPad.touchActive);
                  }
                }}
              >
                HOLD COORDINATES
              </button>
              <button
                className={`btn btn-sm ${glitchActive ? 'btn-glitch-active' : ''}`}
                onMouseDown={() => toggleGlitch(true)}
                onMouseUp={() => toggleGlitch(false)}
                onMouseLeave={() => { if (glitchActive) toggleGlitch(false); }}
                style={{ borderColor: '#ffe600', color: '#ffe600' }}
              >
                GLITCH
              </button>
              <div className="coord-readout font-mono">
                X:{Math.round(kaossPad.x * 100)} | Y:{Math.round(kaossPad.y * 100)}
              </div>
            </div>
          </div>

          {/* Patches Selection Keys */}
          <div className="patches-quick-category">
            <span className="knob-label">Program Select category</span>
            <div className="patches-grid-buttons font-mono">
              {FACTORY_PROGRAMS.map((prog, idx) => (
                <button 
                  key={prog.id}
                  className={`patch-select-key ${currentMode === 'PROG' && selectedProgIndex === idx ? 'key-selected' : ''}`}
                  onClick={() => {
                    toggleMode('PROG');
                    handleSelectProgram(idx);
                  }}
                >
                  {prog.name.slice(0, 4)}
                </button>
              ))}
            </div>
            
            <div className="combi-select-buttons font-mono">
              {FACTORY_COMBIS.map((combi, idx) => (
                <button 
                  key={combi.id}
                  className={`patch-select-key combi-key ${currentMode === 'COMBI' && selectedCombiIndex === idx ? 'key-selected-combi' : ''}`}
                  onClick={() => {
                    toggleMode('COMBI');
                    handleSelectCombi(idx);
                  }}
                >
                  {combi.name.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Piano Keyboard on bottom */}
      <div className="keyboard-section-bezel">
        <div className="white-black-keys-row">
          {Array.from({ length: 37 }, (_, i) => {
            const baseNote = 48; // starting note C3
            const midiNote = baseNote + i;
            const isBlack = [1, 3, 6, 8, 10].includes(midiNote % 12);
            return (
              <button
                key={midiNote}
                className={`piano-key ${isBlack ? 'black-key' : 'white-key'} ${activeNotes.has(midiNote) ? 'key-triggered' : ''}`}
                onMouseDown={() => playVoice(midiNote, 100)}
                onMouseUp={() => stopVoice(midiNote)}
                onMouseLeave={() => {
                  if (activeNotes.has(midiNote)) stopVoice(midiNote);
                }}
              >
                {midiNote % 12 === 0 && <span className="label-key-c font-mono">C{3 + i/12}</span>}
              </button>
            );
          })}
        </div>
        <div className="keyboard-footer-strip">
          <button className="btn btn-sm btn-panic" onClick={stopAllNotes}>PANIC RESET</button>
          <span className="keyboard-notes-display font-mono">
            PLAY KEYS WITH COMPUTER KEYBOARD (A-K ROW ON HOME ROW)
          </span>
        </div>
      </div>

      {/* Computer Keyboard Triggers listener */}
      <KeyboardTrigger playVoice={playVoice} stopVoice={stopVoice} />

      {/* ================= STYLING SHEET EMBED ================= */}
      <style>{`
        .delta7-hardware-chassis {
          background: #040509;
          background-image: 
            linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px);
          background-size: 30px 30px;
          border: 2px solid rgba(0, 243, 255, 0.35);
          border-radius: 16px;
          box-shadow: 
            0 25px 60px rgba(0, 0, 0, 0.95), 
            0 0 40px rgba(0, 243, 255, 0.15),
            inset 0 0 30px rgba(0, 243, 255, 0.05);
          padding: 1.25rem;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          user-select: none;
        }

        .rack-header-bar {
          background: rgba(10, 12, 18, 0.95);
          backdrop-filter: blur(12px);
          border-radius: 8px;
          border: 1px solid rgba(255, 0, 255, 0.25);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1.25rem;
          color: #f1f5f9;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 12px rgba(255, 0, 255, 0.15);
        }

        .branding-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 2.0rem;
          letter-spacing: 5px;
          color: #ffffff;
          text-shadow: 
            0 0 5px #00f3ff,
            0 0 10px #00f3ff,
            0 0 20px #00f3ff,
            0 0 30px #ff00ff;
          text-transform: uppercase;
        }

        .branding-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          color: #00f3ff;
          letter-spacing: 2px;
          text-shadow: 0 0 5px rgba(0, 243, 255, 0.5);
        }

        .telemetry-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.65rem;
          font-family: monospace;
          color: #00f3ff;
        }

        .telemetry-led {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #111111;
          border: 1px solid #00f3ff;
          transition: background 0.15s ease;
        }

        .telemetry-led.led-on {
          background: #00ff66;
          box-shadow: 0 0 8px #00ff66, 0 0 15px #00ff66;
        }

        .telemetry-led.led-midi {
          background: #ffe600;
          box-shadow: 0 0 8px #ffe600, 0 0 15px #ffe600;
        }

        /* Panels layout grid */
        .rack-main-grid {
          display: grid;
          grid-template-columns: 260px 1fr 270px;
          gap: 1.25rem;
        }

        .steel-plate {
          background: rgba(10, 12, 18, 0.94);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 243, 255, 0.22);
          box-shadow: 
            0 8px 32px 0 rgba(0, 0, 0, 0.7),
            0 0 15px rgba(0, 243, 255, 0.08), 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .steel-plate:hover {
          border-color: rgba(0, 243, 255, 0.35);
          box-shadow: 
            0 12px 40px 0 rgba(0, 0, 0, 0.8),
            0 0 25px rgba(0, 243, 255, 0.15),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.12);
        }

        .section-label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.78rem;
          font-weight: 800;
          color: #ff00ff;
          text-transform: uppercase;
          border-bottom: 2px solid #00f3ff;
          padding-bottom: 0.25rem;
          margin-bottom: 0.5rem;
          letter-spacing: 1.5px;
          text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);
        }

        /* Tape Echo Deck reels and Knobs grid styling */
        .tape-leslie-deck {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          width: 100%;
        }

        .tape-deck-reels {
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: center;
          margin: 0.5rem 0;
          background: rgba(0, 0, 0, 0.5);
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          width: 100%;
        }

        .tape-reel {
          width: 48px;
          height: 48px;
          display: flex;
          justify-content: center;
          align-items: center;
          transform-origin: center;
        }

        .tape-reel.spinning {
          animation: spin linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .tape-knobs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px 10px;
          justify-items: center;
          width: 100%;
          margin-top: 0.4rem;
        }

        .leslie-separator {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.2), transparent);
          margin: 0.5rem 0;
        }

        .btn-xs.active-cyan {
          background: #00f3ff;
          color: #000000;
          border-color: #ffffff;
          box-shadow: 0 0 8px #00f3ff;
          text-shadow: none;
          font-weight: 800;
        }

        .btn-xs.active-magenta {
          background: #ff00ff;
          color: #000000;
          border-color: #ffffff;
          box-shadow: 0 0 8px #ff00ff;
          text-shadow: none;
          font-weight: 800;
        }

        .btn-glitch-active {
          background: #ffe600 !important;
          color: #000000 !important;
          border-color: #ffffff !important;
          box-shadow: 0 0 15px #ffe600, 0 0 30px #ffe600 !important;
          text-shadow: none !important;
          font-weight: 900;
          animation: pulse-yellow 0.15s infinite alternate;
        }

        @keyframes pulse-yellow {
          from { transform: scale(1.0); }
          to { transform: scale(1.05); }
        }

        /* Joystick styles */
        .joystick-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .joystick-well {
          width: 90px;
          height: 90px;
          background: #000000;
          border: 2px solid #00f3ff;
          border-radius: 50%;
          position: relative;
          cursor: grab;
          box-shadow: 
            0 0 12px rgba(0, 243, 255, 0.3),
            inset 0 0 15px rgba(0, 243, 255, 0.4);
          overflow: hidden;
        }

        .joystick-well::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            radial-gradient(circle, transparent 30%, rgba(0, 243, 255, 0.1) 70%),
            linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px);
          background-size: 100% 100%, 15px 15px, 15px 15px;
          pointer-events: none;
        }

        .joystick-well:active {
          cursor: grabbing;
        }

        .joystick-handle {
          position: absolute;
          left: calc(50% - 14px);
          top: calc(50% - 14px);
          width: 28px;
          height: 28px;
          transition: transform 0.05s ease-out;
        }

        .joystick-cap {
          width: 28px;
          height: 28px;
          background: #ff0055;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 10px #ff0055, 0 0 20px #ff0055;
        }

        .joystick-readout {
          font-size: 0.65rem;
          color: #00f3ff;
          text-shadow: 0 0 3px rgba(0, 243, 255, 0.3);
        }

        /* Ribbon controller styles */
        .ribbon-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .ribbon-strip {
          height: 18px;
          background: #000000;
          border: 2px solid #ff00ff;
          border-radius: 4px;
          position: relative;
          cursor: crosshair;
          box-shadow: 0 0 8px rgba(255, 0, 255, 0.3);
        }

        .ribbon-indicator {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #00f3ff;
          box-shadow: 0 0 10px #00f3ff, 0 0 20px #00f3ff;
          transform: translateX(-50%);
        }

        /* Knobs & toggle options */
        .realtime-knobs-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .knob-mode-toggle {
          display: flex;
          gap: 4px;
        }

        .knob-quad {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.85);
          border: 1px solid #ff00ff;
          box-shadow: inset 0 0 5px rgba(255, 0, 255, 0.2);
          padding: 0.5rem;
          border-radius: 6px;
        }

        /* LCD Screen Bezel & Panel styling */
        .blue-screen-border {
          background: #000000;
          border: 3px solid #39ff14;
          border-radius: 8px;
          padding: 0.5rem;
          box-shadow: 0 0 20px rgba(57, 255, 20, 0.3), inset 0 0 10px rgba(57, 255, 20, 0.2);
        }

        .lcd-bezel-shadow {
          background: radial-gradient(circle at center, #02122b 0%, #00040f 100%);
          border: 1px solid #00f3ff;
          height: 100%;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .screen-header-tabs {
          background: #000000;
          border-bottom: 2px solid #00f3ff;
          display: flex;
          align-items: center;
          gap: 1px;
          padding: 0 4px;
          flex-shrink: 0;
          overflow-x: auto;
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: #0088cc;
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.4rem 0.65rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tab-btn:hover {
          color: #00f3ff;
          background: rgba(0, 243, 255, 0.1);
        }

        .tab-btn.active-mode {
          color: #ffe600;
          font-weight: 800;
          text-shadow: 0 0 5px #ffe600;
        }

        .tab-btn.active-tab {
          color: #00f3ff;
          background: rgba(0, 243, 255, 0.05);
          border-top: 1.5px solid #00f3ff;
          text-shadow: 0 0 8px #00f3ff;
        }

        .divider-line {
          width: 1px;
          height: 18px;
          background: #00f3ff20;
          margin: 0 4px;
        }

        .screen-content-viewport {
          padding: 0.75rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          color: #00f3ff;
          overflow-y: auto;
        }

        .lcd-page {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          height: 100%;
        }

        .lcd-patch-card {
          background: #000000;
          border: 1.5px dashed #00f3ff;
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          box-shadow: 0 0 8px rgba(0, 243, 255, 0.1);
        }

        .lcd-cat-tag {
          font-size: 0.6rem;
          color: #ffe600;
          letter-spacing: 1.5px;
          text-shadow: 0 0 4px #ffe600;
        }

        .lcd-patch-name {
          font-family: 'Outfit', sans-serif;
          font-size: 1.15rem;
          color: #ffffff;
          margin: 0.2rem 0;
          text-shadow: 0 0 10px #00f3ff, 0 0 20px #00f3ff;
        }

        .lcd-routing-row {
          font-size: 0.62rem;
          color: #55aaff;
          display: flex;
          gap: 1.5rem;
          margin-top: 0.3rem;
          text-shadow: 0 0 3px rgba(85, 170, 255, 0.4);
        }

        .lcd-scope-canvas {
          background: #000000;
          border: 2px solid #00f3ff;
          box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
          border-radius: 4px;
          width: 100%;
          height: 90px;
        }

        /* Parameters editing layouts */
        .box-section-sub {
          background: #000000;
          border: 1px solid #00f3ff;
          box-shadow: 0 0 8px rgba(0, 243, 255, 0.1);
          border-radius: 5px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .box-section-sub h3, .box-section-sub h4 {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          color: #ffffff;
          border-bottom: 1px solid #00f3ff30;
          padding-bottom: 0.2rem;
          margin-bottom: 0.2rem;
          text-shadow: 0 0 5px #00f3ff;
        }

        .flex-row-sub {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.68rem;
          font-family: sans-serif;
          gap: 8px;
        }

        .flex-row-sub label {
          color: #55aaff;
          width: 70px;
          flex-shrink: 0;
          text-shadow: 0 0 3px rgba(85, 170, 255, 0.3);
        }

        .flex-row-sub select, .flex-row-sub input[type="number"] {
          background: #000000;
          border: 1px solid #00f3ff;
          color: #ffffff;
          font-size: 0.68rem;
          border-radius: 2px;
          padding: 1px 4px;
          outline: none;
          text-shadow: 0 0 3px #00f3ff;
        }

        .flex-row-sub input[type="range"] {
          flex-grow: 1;
          height: 3px;
          accent-color: #00f3ff;
        }

        .row-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        /* Envelope Canvas editor styles */
        .canvas-container-sub {
          background: #000000;
          border: 1px solid #00f3ff;
          border-radius: 4px;
          overflow: hidden;
          cursor: crosshair;
        }

        .eg-draw-canvas {
          display: block;
          width: 100%;
          height: 60px;
        }

        .eg-stages-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.6rem;
          color: #00f3ff;
          margin-top: 0.2rem;
        }

        /* Right panel / Kaoss Pad and Patches selector */
        .kaoss-pad-container {
          background: #000000;
          border: 2px solid #ff5500;
          border-radius: 8px;
          padding: 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          color: #ffe600;
          box-shadow: 
            0 0 15px rgba(255, 85, 0, 0.3), 
            inset 0 0 10px rgba(255, 85, 0, 0.1);
        }

        .kaoss-targets-selectors {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .target-select-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.6rem;
          color: #ff5500;
          text-shadow: 0 0 3px rgba(255, 85, 0, 0.3);
        }

        .target-select-row select {
          background: #000000;
          border: 1px solid #ff5500;
          color: #ffe600;
          font-size: 0.6rem;
          border-radius: 3px;
          outline: none;
          max-width: 130px;
          text-shadow: 0 0 3px #ffe600;
        }

        .kaoss-touchpad {
          height: 110px;
          background: radial-gradient(circle at center, #1b0000 0%, #000000 100%);
          border: 2px solid #ff5500;
          border-radius: 6px;
          position: relative;
          cursor: crosshair;
          overflow: hidden;
        }

        .kaoss-touchpad.glow-red {
          border-color: #ff0055;
          box-shadow: 0 0 15px #ff0055, 0 0 25px rgba(255, 0, 85, 0.3);
        }

        .kaoss-crosshair {
          position: absolute;
          width: 12px;
          height: 12px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          background: #ff5500;
          transform: translate(-50%, 50%);
          box-shadow: 0 0 10px #ff5500, 0 0 20px #ff5500;
          pointer-events: none;
          transition: left 0.05s ease-out, bottom 0.05s ease-out;
        }

        .kaoss-gridlines {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(255, 85, 0, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 85, 0, 0.15) 1px, transparent 1px);
          background-size: 15px 15px;
          pointer-events: none;
        }

        .grid-center-cross {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(255, 85, 0, 0.3);
        }

        .kaoss-footer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .coord-readout {
          font-size: 0.62rem;
          color: #ff5500;
        }

        .patches-quick-category {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .patches-grid-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }

        .combi-select-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          border-top: 1px solid rgba(255, 0, 255, 0.2);
          padding-top: 0.4rem;
          margin-top: 0.2rem;
        }

        .patch-select-key {
          background: #000000;
          border: 1px solid #00f3ff;
          color: #00f3ff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.35rem 0;
          border-radius: 4px;
          cursor: pointer;
          box-shadow: 0 0 5px rgba(0, 243, 255, 0.2);
          text-shadow: 0 0 2px #00f3ff;
        }

        .patch-select-key:hover {
          background: rgba(0, 243, 255, 0.15);
          box-shadow: 0 0 8px #00f3ff;
        }

        .patch-select-key.key-selected {
          background: #00f3ff;
          color: #000000;
          border-color: #ffffff;
          box-shadow: 0 0 12px #00f3ff, 0 0 20px #00f3ff;
          text-shadow: none;
        }

        .patch-select-key.combi-key {
          border-color: #ff00ff;
          color: #ff00ff;
          box-shadow: 0 0 5px rgba(255, 0, 255, 0.2);
          text-shadow: 0 0 2px #ff00ff;
        }

        .patch-select-key.combi-key:hover {
          background: rgba(255, 0, 255, 0.15);
          box-shadow: 0 0 8px #ff00ff;
        }

        .patch-select-key.key-selected-combi {
          background: #ff00ff;
          color: #000000;
          border-color: #ffffff;
          box-shadow: 0 0 12px #ff00ff, 0 0 20px #ff00ff;
          text-shadow: none;
        }

        /* Keyboard layout */
        .keyboard-section-bezel {
          background: #000000;
          border: 3px solid #ff00ff;
          border-radius: 6px;
          padding: 0.5rem;
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
        }

        .white-black-keys-row {
          display: flex;
          height: 100px;
          position: relative;
          background: #000000;
          border-radius: 3px;
          overflow: hidden;
        }

        .piano-key {
          flex: 1;
          border: 1px solid #111111;
          position: relative;
          outline: none;
          cursor: pointer;
        }

        .white-key {
          background: rgba(0, 15, 30, 0.95);
          border: 1px solid rgba(0, 243, 255, 0.3);
          z-index: 1;
        }

        .white-key::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border: 1px solid transparent;
          transition: border-color 0.1s;
        }

        .white-key:hover {
          border-color: #00f3ff;
          box-shadow: inset 0 0 8px rgba(0, 243, 255, 0.3);
        }

        .black-key {
          background: #000000;
          border: 1px solid rgba(255, 0, 255, 0.5);
          z-index: 2;
          height: 60px;
          margin-left: -2%;
          margin-right: -2%;
          width: 4%;
          box-shadow: 0 0 6px rgba(255, 0, 255, 0.2);
        }

        .black-key:hover {
          border-color: #ff00ff;
          box-shadow: 0 0 10px #ff00ff;
        }

        .piano-key.key-triggered {
          background: #ffe600 !important;
          border-color: #ffffff !important;
          box-shadow: 0 0 15px #ffe600, 0 0 25px #ffe600 !important;
        }

        .label-key-c {
          position: absolute;
          bottom: 4px;
          left: calc(50% - 4px);
          font-size: 0.65rem;
          color: #00f3ff;
          font-weight: 800;
          text-shadow: 0 0 3px #00f3ff;
        }

        .keyboard-footer-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.4rem;
          color: #00f3ff;
        }

        .keyboard-notes-display {
          font-size: 0.65rem;
          color: #55aaff;
          text-shadow: 0 0 3px rgba(85, 170, 255, 0.4);
        }

        /* Custom buttons styling */
        .btn {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          border: 1px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.1s ease;
          text-shadow: 0 0 2px currentColor;
        }

        .btn-xs {
          font-size: 0.55rem;
          padding: 2px 6px;
          background: #000000;
          color: #ff00ff;
          border: 1px solid #ff00ff;
        }

        .btn-xs.active-amber {
          background: #ff00ff;
          color: #000000;
          border-color: #ffffff;
          box-shadow: 0 0 8px #ff00ff;
          text-shadow: none;
        }

        .btn-sm {
          font-size: 0.72rem;
          padding: 0.35rem 0.75rem;
          background: #000000;
          color: #00f3ff;
          border: 1.5px solid #00f3ff;
          box-shadow: 0 0 6px rgba(0, 243, 255, 0.2);
        }

        .btn-sm:hover {
          background: rgba(0, 243, 255, 0.15);
          box-shadow: 0 0 10px #00f3ff;
        }

        .btn-sm.active-red {
          background: #ff0055;
          color: #ffffff;
          border-color: #ffffff;
          box-shadow: 0 0 12px #ff0055, 0 0 20px #ff0055;
          text-shadow: none;
        }

        .btn-panic {
          background: #000000;
          color: #ef4444;
          border-color: #ef4444;
          box-shadow: 0 0 6px rgba(239, 68, 68, 0.2);
        }

        .btn-panic:hover {
          background: rgba(239, 68, 68, 0.15);
          box-shadow: 0 0 10px #ef4444;
        }

        .text-cyan {
          color: #00f3ff;
          text-shadow: 0 0 6px #00f3ff;
        }

        .knob-label {
          font-size: 0.62rem;
          font-family: 'Outfit', sans-serif;
          text-transform: uppercase;
          color: #00f3ff;
          font-weight: 800;
          letter-spacing: 1px;
          text-shadow: 0 0 3px rgba(0, 243, 255, 0.4);
        }

        .mappings-tag-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 3px;
          max-height: 80px;
          overflow-y: auto;
          margin-top: 0.3rem;
          background: #000000;
          border: 1px solid #00f3ff30;
          padding: 0.3rem;
          border-radius: 4px;
        }

        .mapping-item-tag {
          font-size: 0.58rem;
          display: flex;
          justify-content: space-between;
          color: #ffffff;
          border-bottom: 1px solid rgba(0, 243, 255, 0.1);
        }

        .param-label-tag {
          color: #00f3ff;
        }

        .cc-number-tag {
          color: #ff00ff;
          text-shadow: 0 0 2px #ff00ff;
        }

        /* Upgraded Dashboard Grid & Sidebar Styles */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: 250px;
          gap: 12px;
        }

        .preset-dashboard-container {
          background: rgba(0, 0, 0, 0.45);
          border-right: 1px solid rgba(0, 243, 255, 0.15);
          padding: 6px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .preset-category-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .category-header {
          font-size: 0.58rem;
          color: #ff00ff;
          font-weight: bold;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 0, 255, 0.15);
          padding-bottom: 2px;
          margin-bottom: 2px;
        }

        .category-buttons-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }

        .preset-card {
          background: rgba(10, 12, 18, 0.8);
          border: 1px solid rgba(0, 243, 255, 0.15);
          border-radius: 4px;
          padding: 4px 6px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          cursor: pointer;
          transition: all 0.1s ease;
          min-height: 34px;
          justify-content: center;
        }

        .preset-card .card-id {
          font-size: 0.5rem;
          color: #00f3ff;
          opacity: 0.8;
          line-height: 1;
        }

        .preset-card .card-name {
          font-size: 0.58rem;
          color: #ffffff;
          font-weight: 500;
          text-align: left;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .preset-card:hover {
          background: rgba(0, 243, 255, 0.15);
          border-color: rgba(0, 243, 255, 0.4);
          box-shadow: 0 0 6px rgba(0, 243, 255, 0.15);
        }

        .preset-card.selected {
          background: rgba(0, 243, 255, 0.25);
          border-color: #00f3ff;
          box-shadow: 0 0 8px rgba(0, 243, 255, 0.25);
        }

        .preset-card.combi .card-id {
          color: #ff00ff;
        }

        .preset-card.combi.selected {
          background: rgba(255, 0, 255, 0.25);
          border-color: #ff00ff;
          box-shadow: 0 0 8px rgba(255, 0, 255, 0.25);
        }

        .dashboard-main-view {
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow: hidden;
        }

        /* Segmented Controls & Buttons */
        .segmented-strip {
          display: flex;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(0, 243, 255, 0.25);
          border-radius: 4px;
          overflow: hidden;
          padding: 1px;
        }

        .segmented-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 243, 255, 0.2);
          border-radius: 4px;
          padding: 2px;
        }

        .segmented-btn {
          background: transparent;
          border: none;
          color: #88ccee;
          font-family: var(--font-mono);
          font-size: 0.54rem;
          padding: 2px 4px;
          cursor: pointer;
          transition: all 0.1s ease;
          border-radius: 2px;
          text-align: center;
          white-space: nowrap;
        }

        .segmented-btn:hover {
          background: rgba(0, 243, 255, 0.15);
          color: #ffffff;
        }

        .segmented-btn.active {
          background: #00f3ff;
          color: #000000;
          font-weight: bold;
          box-shadow: 0 0 6px #00f3ff;
        }

        .segmented-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          background: transparent !important;
          color: #88ccee !important;
          box-shadow: none !important;
        }

        /* Delta Pad targets selections on right panel */
        .target-select-row-new {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .target-row-label {
          font-size: 0.55rem;
          color: #ff5500;
          font-weight: bold;
          letter-spacing: 0.5px;
        }

        .target-btn-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }

        .target-btn {
          background: #000000;
          border: 1px solid rgba(255, 85, 0, 0.3);
          color: #ffe600;
          font-family: var(--font-mono);
          font-size: 0.52rem;
          padding: 2px 4px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.1s;
        }

        .target-btn:hover {
          background: rgba(255, 85, 0, 0.15);
          border-color: rgba(255, 85, 0, 0.6);
        }

        .target-btn.selected-x {
          background: #ff5500;
          color: #ffffff;
          border-color: #ffffff;
          box-shadow: 0 0 6px #ff5500;
          font-weight: bold;
        }

        .target-btn.selected-y {
          background: #ff0055;
          color: #ffffff;
          border-color: #ffffff;
          box-shadow: 0 0 6px #ff0055;
          font-weight: bold;
        }

        /* Sampler LCD Page Styles */
        .sampler-page-lcd {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .mic-level-meter-container {
          background: rgba(0, 243, 255, 0.04);
          border: 1px solid rgba(0, 243, 255, 0.15);
          padding: 6px 10px;
          border-radius: 4px;
        }

        .mic-level-bar-label {
          font-size: 0.55rem;
          color: rgba(0, 243, 255, 0.75);
          margin-bottom: 3px;
        }

        .mic-level-bar-track {
          width: 100%;
          height: 6px;
          background: #020d1e;
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }

        .mic-level-bar-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #00ff66 0%, #ffe600 70%, #ff0055 100%);
          border-radius: 3px;
          transition: width 0.05s ease-out;
        }

        .active-yellow {
          background: rgba(255, 230, 0, 0.15) !important;
          border-color: #ffe600 !important;
          color: #ffe600 !important;
          box-shadow: 0 0 6px rgba(255, 230, 0, 0.3) !important;
        }

        .active-red {
          background: rgba(255, 0, 85, 0.25) !important;
          border-color: #ff0055 !important;
          color: #ffffff !important;
          box-shadow: 0 0 8px rgba(255, 0, 85, 0.5) !important;
        }

        .active-green {
          background: rgba(0, 255, 102, 0.15) !important;
          border-color: #00ff66 !important;
          color: #00ff66 !important;
          box-shadow: 0 0 6px rgba(0, 255, 102, 0.3) !important;
        }

        .active-pink {
          background: rgba(255, 0, 255, 0.15) !important;
          border-color: #ff00ff !important;
          color: #ff00ff !important;
          box-shadow: 0 0 6px rgba(255, 0, 255, 0.3) !important;
        }

        @keyframes blink-rec {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .blinking {
          animation: blink-rec 1s infinite;
        }

        .waveform-draw-canvas {
          box-shadow: inset 0 0 10px rgba(0, 243, 255, 0.15);
        }

        .sampler-help-alert {
          background: rgba(0, 243, 255, 0.05);
          border: 1px dashed rgba(0, 243, 255, 0.3);
          border-radius: 4px;
          padding: 6px 10px;
          margin-top: 6px;
          font-size: 0.62rem;
          color: #00f3ff;
          text-align: center;
          font-family: var(--font-mono);
          text-shadow: 0 0 2px rgba(0, 243, 255, 0.4);
        }
      `}</style>

    </div>
  );
}

// ==========================================
// 10. COMPUTER KEYBOARD TRIGGER LISTENER
// ==========================================

function KeyboardTrigger({ playVoice, stopVoice }) {
  useEffect(() => {
    // Map home-row keyboard layout to musical white/black scale notes
    const keysMap = {
      'a': 60, // C4
      'w': 61, // C#
      's': 62, // D
      'e': 63, // D#
      'd': 64, // E
      'f': 65, // F
      't': 66, // F#
      'g': 67, // G
      'y': 68, // G#
      'h': 69, // A
      'u': 70, // A#
      'j': 71, // B
      'k': 72, // C5
    };

    const keysActive = new Set();

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const note = keysMap[e.key.toLowerCase()];
      if (note && !keysActive.has(note)) {
        keysActive.add(note);
        playVoice(note, 100);
      }
    };

    const handleKeyUp = (e) => {
      const note = keysMap[e.key.toLowerCase()];
      if (note && keysActive.has(note)) {
        keysActive.delete(note);
        stopVoice(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playVoice, stopVoice]);

  return null;
}
