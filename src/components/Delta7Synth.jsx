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
  filterType: 'bypass',
  cutoff: 20000,
  resonance: 0.0,
  oscMode: 'double',
  oscAVol: 0.8,
  oscBVol: 0.8,
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
  leslieDrive: 0.25,
  leslieWidth: 0.5,
  leslieCrossover: 800,
  oscAWave: 'a01',
  oscBWave: 'b01',
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
  stutterPitchSweep: 0,
  stutterPattern: 'None',
  stutterPanMode: 'None',
  stutterFilterSweep: 0
};

const FACTORY_PROGRAMS = Array.from({ length: 9 }, (_, i) => ({
  id: `p${(i + 1).toString().padStart(2, '0')}`,
  name: `A${(i + 1).toString().padStart(3, '0')}: Initialized`,
  category: 'User',
  oscMode: 'double',
  oscAWave: 'a01',
  oscAOctave: 0,
  oscAPitch: 0,
  oscADetune: 0,
  oscAPan: 0,
  oscAVol: 0.8,
  oscADelay: 0,
  oscBWave: 'b01',
  oscBOctave: 0,
  oscBPitch: 0,
  oscBDetune: 0,
  oscBPan: 0,
  oscBVol: 0.8,
  oscBDelay: 0,
  oscBalance: 0.5,
  filterMode: 'Single',
  filterType: 'bypass',
  cutoff: 20000,
  resonance: 0,
  filterEnvAmt: 0,
  portamento: 0,
  vcfEG: { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.1, breakLevel: 0.8, slopeTime: 0.1, sustainLevel: 0.5, releaseTime: 0.1, releaseLevel: 0 },
  vcaEG: { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.0, breakLevel: 1.0, slopeTime: 0.0, sustainLevel: 1.0, releaseTime: 0.1, releaseLevel: 0 },
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

const ECHO_PRESETS = [
  { name: 'Default Space Echo', params: { spaceEchoActive: true, spaceEchoTime: 0.35, spaceEchoFeedback: 0.5, spaceEchoWow: 0.25, spaceEchoSaturation: 0.3, spaceEchoSpring: 0.15 } },
  { name: 'Dub Self-Oscillator', params: { spaceEchoActive: true, spaceEchoTime: 0.45, spaceEchoFeedback: 0.88, spaceEchoWow: 0.4, spaceEchoSaturation: 0.7, spaceEchoSpring: 0.25 } },
  { name: 'Slapback Tape', params: { spaceEchoActive: true, spaceEchoTime: 0.08, spaceEchoFeedback: 0.15, spaceEchoWow: 0.1, spaceEchoSaturation: 0.5, spaceEchoSpring: 0.05 } },
  { name: 'Spring Reverb Tank', params: { spaceEchoActive: true, spaceEchoTime: 0.2, spaceEchoFeedback: 0.1, spaceEchoWow: 0.05, spaceEchoSaturation: 0.1, spaceEchoSpring: 0.8 } },
  { name: 'Clean Stereo Delay', params: { spaceEchoActive: false, spaceEchoTime: 0.375, spaceEchoFeedback: 0.4 } }
];

const ROTOR_PRESETS = [
  { name: 'Classic Slow Spin', params: { leslieSpeed: 'Slow', leslieDrive: 0.1, leslieWidth: 0.5, leslieCrossover: 800 } },
  { name: 'Gritty Rock Fast', params: { leslieSpeed: 'Fast', leslieDrive: 0.65, leslieWidth: 0.7, leslieCrossover: 800 } },
  { name: 'Deep Stereo Swirl', params: { leslieSpeed: 'Fast', leslieDrive: 0.2, leslieWidth: 1.0, leslieCrossover: 500 } },
  { name: 'Cabinet Growl (Stop)', params: { leslieSpeed: 'Off', leslieDrive: 0.8, leslieWidth: 0.0, leslieCrossover: 700 } },
  { name: 'Vocal Horn Crossover', params: { leslieSpeed: 'Slow', leslieDrive: 0.25, leslieWidth: 0.6, leslieCrossover: 1400 } }
];

// Helper to synthesize sample kits on-the-fly
const generateSynthesizedKit = (ctx, kitType) => {
  const sampleRate = ctx.sampleRate;
  const createBuffer = (seconds) => ctx.createBuffer(1, Math.round(seconds * sampleRate), sampleRate);
  const kit = [];

  if (kitType === 'DRUMS') {
    // 1. Kick
    const kick = createBuffer(0.3);
    const kData = kick.getChannelData(0);
    for (let i = 0; i < kData.length; i++) {
      const t = i / sampleRate;
      const freq = 150 * Math.exp(-t * 40) + 45;
      const env = Math.exp(-t * 15);
      kData[i] = Math.sin(2 * Math.PI * freq * t) * env;
    }
    kit.push({ name: 'Synth Kick', buffer: kick });

    // 2. Snare
    const snare = createBuffer(0.25);
    const sData = snare.getChannelData(0);
    for (let i = 0; i < sData.length; i++) {
      const t = i / sampleRate;
      const noise = Math.random() * 2 - 1;
      const noiseEnv = Math.exp(-t * 20);
      const tone = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 40);
      sData[i] = (noise * noiseEnv * 0.7 + tone * 0.3) * Math.exp(-t * 5);
    }
    kit.push({ name: 'Synth Snare', buffer: snare });

    // 3. Closed Hat
    const hat = createBuffer(0.08);
    const hData = hat.getChannelData(0);
    let lastNoise = 0;
    for (let i = 0; i < hData.length; i++) {
      const t = i / sampleRate;
      const noise = Math.random() * 2 - 1;
      const filtered = noise - lastNoise;
      lastNoise = noise;
      const env = Math.exp(-t * 70);
      hData[i] = filtered * env * 0.5;
    }
    kit.push({ name: 'Synth Hat', buffer: hat });

    // 4. Open Hat
    const oHat = createBuffer(0.35);
    const ohData = oHat.getChannelData(0);
    let lastNoiseO = 0;
    for (let i = 0; i < ohData.length; i++) {
      const t = i / sampleRate;
      const noise = Math.random() * 2 - 1;
      const filtered = noise - lastNoiseO;
      lastNoiseO = noise;
      const env = Math.exp(-t * 12);
      ohData[i] = filtered * env * 0.4;
    }
    kit.push({ name: 'Open Hat', buffer: oHat });

    // 5. Synth Tom
    const tom = createBuffer(0.4);
    const tData = tom.getChannelData(0);
    for (let i = 0; i < tData.length; i++) {
      const t = i / sampleRate;
      const freq = 120 * Math.exp(-t * 10) + 60;
      const env = Math.exp(-t * 8);
      tData[i] = Math.sin(2 * Math.PI * freq * t) * env;
    }
    kit.push({ name: 'Synth Tom', buffer: tom });

    // 6. Cowbell
    const bell = createBuffer(0.25);
    const bData = bell.getChannelData(0);
    for (let i = 0; i < bData.length; i++) {
      const t = i / sampleRate;
      const f1 = 800;
      const f2 = 540;
      const s1 = Math.sin(2 * Math.PI * f1 * t) > 0 ? 1 : -1;
      const s2 = Math.sin(2 * Math.PI * f2 * t) > 0 ? 1 : -1;
      const env = Math.exp(-t * 15);
      bData[i] = (s1 + s2) * 0.3 * env;
    }
    kit.push({ name: 'Cowbell', buffer: bell });

    // 7. Clap
    const clap = createBuffer(0.3);
    const cData = clap.getChannelData(0);
    for (let i = 0; i < cData.length; i++) {
      const t = i / sampleRate;
      let env = 0;
      if (t < 0.01) env = Math.exp(-t * 200);
      else if (t < 0.02) env = Math.exp(-(t - 0.01) * 200);
      else if (t < 0.03) env = Math.exp(-(t - 0.02) * 200);
      else env = Math.exp(-(t - 0.03) * 15);
      cData[i] = (Math.random() * 2 - 1) * env * 0.5;
    }
    kit.push({ name: 'Hand Clap', buffer: clap });

    // 8. Sub Bass
    const sub = createBuffer(0.6);
    const subData = sub.getChannelData(0);
    for (let i = 0; i < subData.length; i++) {
      const t = i / sampleRate;
      const freq = 55;
      const env = Math.exp(-t * 3) * (1 - Math.exp(-t * 50));
      subData[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.8;
    }
    kit.push({ name: 'Sub Bass 55Hz', buffer: sub });
  } 
  else if (kitType === 'WAVES') {
    const addWave = (name, lengthSec, func) => {
      const buf = createBuffer(lengthSec);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = func(i / sampleRate);
      }
      kit.push({ name, buffer: buf });
    };

    addWave('Classic Saw', 0.5, (t) => {
      const f = 220;
      return (2 * (t * f - Math.floor(0.5 + t * f))) * 0.5;
    });
    addWave('Hollow Square', 0.5, (t) => {
      const f = 220;
      return (Math.sin(2 * Math.PI * f * t) >= 0 ? 0.4 : -0.4);
    });
    addWave('Pure Sine', 0.5, (t) => {
      return Math.sin(2 * Math.PI * 220 * t) * 0.6;
    });
    addWave('Bright Triangle', 0.5, (t) => {
      const f = 220;
      return (Math.abs((t * f) % 1 - 0.5) * 4 - 1) * 0.6;
    });
    addWave('Pulse 20%', 0.5, (t) => {
      const f = 220;
      return (((t * f) % 1) < 0.20 ? 0.4 : -0.1);
    });
    addWave('Digital Organ', 0.5, (t) => {
      const f = 220;
      return (Math.sin(2 * Math.PI * f * t) + 
              0.5 * Math.sin(2 * Math.PI * f * 2 * t) + 
              0.25 * Math.sin(2 * Math.PI * f * 3 * t)) * 0.4;
    });
    addWave('Vocal Ahh', 0.5, (t) => {
      const f = 220;
      let val = 0;
      for (let h = 1; h <= 12; h++) {
        const freq = f * h;
        const amp1 = 1 / (1 + Math.pow((freq - 800) / 150, 2));
        const amp2 = 0.5 / (1 + Math.pow((freq - 1200) / 200, 2));
        val += Math.sin(2 * Math.PI * freq * t) * (amp1 + amp2);
      }
      return val * 0.15;
    });
    addWave('White Noise', 0.5, () => (Math.random() * 2 - 1) * 0.25);
  }
  else if (kitType === 'CHIPTUNE') {
    // 1. Laser
    const laser = createBuffer(0.4);
    const lData = laser.getChannelData(0);
    for (let i = 0; i < lData.length; i++) {
      const t = i / sampleRate;
      const freq = 1200 * Math.exp(-t * 12) + 100;
      const val = Math.sin(2 * Math.PI * freq * t) >= 0 ? 0.3 : -0.3;
      lData[i] = val * Math.exp(-t * 6);
    }
    kit.push({ name: 'Arcade Laser', buffer: laser });

    // 2. Coin
    const coin = createBuffer(0.35);
    const coData = coin.getChannelData(0);
    for (let i = 0; i < coData.length; i++) {
      const t = i / sampleRate;
      const freq = t < 0.08 ? 987.77 : 1318.51;
      const val = Math.sin(2 * Math.PI * freq * t) >= 0 ? 0.3 : -0.3;
      coData[i] = val * Math.exp(-t * 8);
    }
    kit.push({ name: 'Coin Blip', buffer: coin });

    // 3. Power Up
    const pup = createBuffer(0.5);
    const pData = pup.getChannelData(0);
    for (let i = 0; i < pData.length; i++) {
      const t = i / sampleRate;
      const freq = 150 + t * 1500;
      const val = Math.sin(2 * Math.PI * freq * t) >= 0 ? 0.25 : -0.25;
      pData[i] = val * Math.exp(-t * 4);
    }
    kit.push({ name: 'Power Up', buffer: pup });

    // 4. Power Down
    const pdown = createBuffer(0.5);
    const pdData = pdown.getChannelData(0);
    for (let i = 0; i < pdData.length; i++) {
      const t = i / sampleRate;
      const freq = 800 - t * 700;
      const val = Math.sin(2 * Math.PI * freq * t) >= 0 ? 0.25 : -0.25;
      pdData[i] = val * Math.exp(-t * 4);
    }
    kit.push({ name: 'Power Down', buffer: pdown });

    // 5. Jump
    const jump = createBuffer(0.25);
    const jData = jump.getChannelData(0);
    for (let i = 0; i < jData.length; i++) {
      const t = i / sampleRate;
      const freq = 100 + Math.pow(t * 12, 2) * 50;
      const val = Math.sin(2 * Math.PI * freq * t) >= 0 ? 0.25 : -0.25;
      jData[i] = val * Math.exp(-t * 12);
    }
    kit.push({ name: 'Arcade Jump', buffer: jump });

    // 6. Explosion
    const exp = createBuffer(0.6);
    const eData = exp.getChannelData(0);
    for (let i = 0; i < eData.length; i++) {
      const t = i / sampleRate;
      const noise = Math.random() * 2 - 1;
      const freq = 100 * Math.exp(-t * 6) + 30;
      const tone = Math.sin(2 * Math.PI * freq * t) >= 0 ? 0.4 : -0.4;
      eData[i] = (noise * 0.6 + tone * 0.4) * Math.exp(-t * 5);
    }
    kit.push({ name: 'Explosion', buffer: exp });

    // 7. Hit Hurt
    const hit = createBuffer(0.18);
    const hiData = hit.getChannelData(0);
    for (let i = 0; i < hiData.length; i++) {
      const t = i / sampleRate;
      const freq = 300 * Math.exp(-t * 25) + 80;
      const val = Math.sin(2 * Math.PI * freq * t) >= 0 ? 0.3 : -0.3;
      hiData[i] = val * Math.exp(-t * 15);
    }
    kit.push({ name: 'Hit Hurt', buffer: hit });

    // 8. 8-Bit Melody
    const mel = createBuffer(0.8);
    const mData = mel.getChannelData(0);
    for (let i = 0; i < mData.length; i++) {
      const t = i / sampleRate;
      let freq = 261.63;
      if (t > 0.6) freq = 523.25;
      else if (t > 0.4) freq = 392.00;
      else if (t > 0.2) freq = 329.63;
      const val = Math.sin(2 * Math.PI * freq * t) >= 0 ? 0.25 : -0.25;
      mData[i] = val * Math.exp(-t * 1.5);
    }
    kit.push({ name: 'Blip Arp', buffer: mel });
  }
  else if (kitType === 'AMBIENT') {
    // 1. Vinyl Crackle
    const vinyl = createBuffer(1.0);
    const vData = vinyl.getChannelData(0);
    for (let i = 0; i < vData.length; i++) {
      const r = Math.random();
      let pop = 0;
      if (r > 0.9992) pop = (Math.random() * 2 - 1) * 0.7;
      const rumble = Math.sin(2 * Math.PI * (Math.random() * 10 + 20) * (i / sampleRate)) * 0.03;
      vData[i] = (rumble + pop) * 0.6;
    }
    kit.push({ name: 'Vinyl Dust & Pop', buffer: vinyl });

    // 2. Synth Pad
    const pad = createBuffer(1.2);
    const pData = pad.getChannelData(0);
    for (let i = 0; i < pData.length; i++) {
      const t = i / sampleRate;
      const f1 = 130.81;
      const f2 = 164.81;
      const f3 = 196.00;
      const f4 = 246.94;
      const env = Math.sin(Math.PI * t / 1.2) * 0.35;
      pData[i] = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t) + Math.sin(2 * Math.PI * f3 * t) + Math.sin(2 * Math.PI * f4 * t)) * env;
    }
    kit.push({ name: 'Ambient Pad', buffer: pad });

    // 3. FM E-Piano
    const ep = createBuffer(0.9);
    const epData = ep.getChannelData(0);
    for (let i = 0; i < epData.length; i++) {
      const t = i / sampleRate;
      const carrier = 440;
      const modulator = 440 * 2.5;
      const index = 5.0 * Math.exp(-t * 4);
      const modVal = Math.sin(2 * Math.PI * modulator * t) * index;
      const env = Math.exp(-t * 2.2);
      epData[i] = Math.sin(2 * Math.PI * carrier * t + modVal) * env * 0.4;
    }
    kit.push({ name: 'FM E-Piano A4', buffer: ep });

    // 4. Tape Lofi Sine
    const sine = createBuffer(0.8);
    const sData = sine.getChannelData(0);
    for (let i = 0; i < sData.length; i++) {
      const t = i / sampleRate;
      const vibrato = Math.sin(2 * Math.PI * 6 * t) * 2;
      const freq = 329.63 + vibrato;
      const env = Math.exp(-t * 1.5) * (1 - Math.exp(-t * 30));
      sData[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.6;
    }
    kit.push({ name: 'Lofi Tape Sine', buffer: sine });

    // 5. Wooden Block
    const wood = createBuffer(0.18);
    const wData = wood.getChannelData(0);
    for (let i = 0; i < wData.length; i++) {
      const t = i / sampleRate;
      const freq = 600 * Math.exp(-t * 20);
      const env = Math.exp(-t * 35);
      wData[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.65;
    }
    kit.push({ name: 'Wood Block', buffer: wood });

    // 6. FM Bell
    const bell = createBuffer(0.7);
    const bData = bell.getChannelData(0);
    for (let i = 0; i < bData.length; i++) {
      const t = i / sampleRate;
      const carrier = 880;
      const modulator = 880 * 3.5;
      const index = 8.0 * Math.exp(-t * 12);
      const modVal = Math.sin(2 * Math.PI * modulator * t) * index;
      const env = Math.exp(-t * 3.5);
      bData[i] = Math.sin(2 * Math.PI * carrier * t + modVal) * env * 0.45;
    }
    kit.push({ name: 'FM Bell A5', buffer: bell });

    // 7. Drone
    const drone = createBuffer(1.2);
    const dData = drone.getChannelData(0);
    for (let i = 0; i < dData.length; i++) {
      const t = i / sampleRate;
      const f1 = 65.41;
      const f2 = 65.80;
      const env = Math.sin(Math.PI * t / 1.2) * 0.45;
      dData[i] = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t)) * env;
    }
    kit.push({ name: 'Low Detuned Drone', buffer: drone });

    // 8. Chime
    const chime = createBuffer(0.9);
    const chData = chime.getChannelData(0);
    for (let i = 0; i < chData.length; i++) {
      const t = i / sampleRate;
      const f1 = 1200;
      const f2 = 1750;
      const f3 = 2400;
      const env = Math.exp(-t * 6);
      chData[i] = (Math.sin(2 * Math.PI * f1 * t) * 0.4 + Math.sin(2 * Math.PI * f2 * t) * 0.3 + Math.sin(2 * Math.PI * f3 * t) * 0.2) * env;
    }
    kit.push({ name: 'Chime Bell', buffer: chime });
  }

  return kit.map(item => {
    const mono = item.buffer;
    const stereo = ctx.createBuffer(2, mono.length, mono.sampleRate);
    stereo.getChannelData(0).set(mono.getChannelData(0));
    stereo.getChannelData(1).set(mono.getChannelData(0));
    return { name: item.name, buffer: stereo };
  });
};

// MIDI Pitch to Frequency
const getFreq = (note) => 440 * Math.pow(2, (note - 69) / 12);

const ringColors = [
  '#ff0055', // Neon Pink/Red
  '#ff5500', // Neon Orange
  '#ffcc00', // Neon Yellow
  '#00ff66', // Neon Green
  '#00f3ff', // Neon Cyan
  '#0066ff', // Neon Blue
  '#9900ff', // Neon Purple
  '#ff00ff'  // Neon Magenta
];

// ==========================================
// 2. MAIN COMPONENT DECLARATION
// ==========================================

export default function Delta7Synth() {
  // Synth operating state
  const [synthOn, setSynthOn] = useState(false);
  const [isMidiSupported, setIsMidiSupported] = useState(false);
  const [midiDevices, setMidiDevices] = useState([]);
  const [selectedMidiDevice, setSelectedMidiDevice] = useState('');
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
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
  const [padReturnMode, setPadReturnMode] = useState('hold'); // hold, snap, spring, throw
  const [isRecordingGesture, setIsRecordingGesture] = useState(false);
  const [isPlayingGesture, setIsPlayingGesture] = useState(false);
  const [gestureMode, setGestureMode] = useState('loop'); // loop, one-shot, ping-pong
  
  const padReturnModeRef = useRef('hold');
  useEffect(() => {
    padReturnModeRef.current = padReturnMode;
  }, [padReturnMode]);

  const kaossPhysicsRef = useRef({
    x: 0.5,
    y: 0.5,
    vx: 0,
    vy: 0,
    lastX: 0.5,
    lastY: 0.5,
    lastTime: 0,
    isTouched: false,
    ripple: null,
    trails: [],
    rafId: null
  });

  const gestureRef = useRef({
    isRecording: false,
    isPlaying: false,
    buffer: [],
    playIndex: 0,
    direction: 1,
    mode: 'loop'
  });
  useEffect(() => {
    gestureRef.current.mode = gestureMode;
  }, [gestureMode]);

  // Arpeggiator engine states & refs
  const [arpRunning, setArpRunning] = useState(false);
  const heldNotesRef = useRef([]);
  const activeArpKeysRef = useRef(new Set());
  const arpRef = useRef({
    nextNoteTime: 0.0,
    stepIndex: 0,
    timerId: null,
    isPlaying: false
  });

  // Metronome click track states & refs
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [metronomeVolume, setMetronomeVolume] = useState(0.4);
  const metronomeVolumeRef = useRef(0.4);
  const metronomeRef = useRef({
    isPlaying: false,
    timerId: null,
    nextNoteTime: 0,
    beatIndex: 0
  });

  const dubSirenOscRef = useRef(null);
  const dubSirenGainRef = useRef(null);
  const formantInputRef = useRef(null);
  const formantF1Ref = useRef(null);
  const formantF2Ref = useRef(null);
  const formantF3Ref = useRef(null);
  const formantMixGainRef = useRef(null);
  const formantDryGainRef = useRef(null);

  const bitcrusherInputRef = useRef(null);
  const bitcrusherOutputRef = useRef(null);
  const bitcrusherDryGainRef = useRef(null);
  const bitcrusherMixGainRef = useRef(null);
  const bitcrusherNodeRef = useRef(null); // stores AudioWorkletNode or ScriptProcessorNode
  const bitDepthRef = useRef(16.0);
  const sampleRateRatioRef = useRef(1.0);

  const reverbHPFRef = useRef(null);
  const reverbFeedbackGainRef = useRef(null);

  // Master Audio Context references
  const audioCtxRef = useRef(null);
  const activeVoicesRef = useRef(new Map()); // voiceKey (e.g. note-progId) -> voiceObjects
  const schedulerNodeRef = useRef(null);
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
  const leslieInputRef = useRef(null);
  const leslieOutputRef = useRef(null);
  const leslieEffectRef = useRef(null);

  const mfx1SendGainRef = useRef(null); // combined send
  const mfx2Ref = useRef(null);
  const mfx2SendGainRef = useRef(null); // combined send
  const masterEqLowRef = useRef(null);
  const masterEqMidRef = useRef(null);
  const masterEqHighRef = useRef(null);

  const deckAEqLowValRef = useRef(0.0);
  const deckAEqMidValRef = useRef(0.0);
  const deckAEqHighValRef = useRef(0.0);
  const deckBEqLowValRef = useRef(0.0);
  const deckBEqMidValRef = useRef(0.0);
  const deckBEqHighValRef = useRef(0.0);

  // Visualizer Animation
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // --- Sampler States & Slots ---
  const [sampleSlots, setSampleSlots] = useState([
    { id: 'a01', name: 'Bank A Slot 1', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'a02', name: 'Bank A Slot 2', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'a03', name: 'Bank A Slot 3', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'a04', name: 'Bank A Slot 4', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'a05', name: 'Bank A Slot 5', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'a06', name: 'Bank A Slot 6', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'a07', name: 'Bank A Slot 7', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'a08', name: 'Bank A Slot 8', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'b01', name: 'Bank B Slot 1', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'b02', name: 'Bank B Slot 2', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'b03', name: 'Bank B Slot 3', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'b04', name: 'Bank B Slot 4', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'b05', name: 'Bank B Slot 5', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'b06', name: 'Bank B Slot 6', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'b07', name: 'Bank B Slot 7', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
    { id: 'b08', name: 'Bank B Slot 8', buffer: null, revBuffer: null, rootNote: 60, volume: 1.0, sliceCount: 16, start: 0.0, end: 1.0, loopStart: 0.0, loopEnd: 1.0, loopOn: false, reverseOn: false, warpOn: false, warpBeats: 4, tuning: 0, sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false })) },
  ]);
  const sampleSlotsRef = useRef(sampleSlots);
  useEffect(() => {
    sampleSlotsRef.current = sampleSlots;
  }, [sampleSlots]);



  const [selectedEditSlotId, setSelectedEditSlotId] = useState('a01'); // Target slot in Editor
  const [uiScale, setUiScale] = useState(1.0);
  const [performanceViewActive, setPerformanceViewActive] = useState(false);
  const [perfRecordActive, setPerfRecordActive] = useState(false);
  const [perfIsDubbing, setPerfIsDubbing] = useState(false);
  const [perfPlaybackActive, setPerfPlaybackActive] = useState(false);
  const [perfEvents, setPerfEvents] = useState([]);
  const [highwayEditMode, setHighwayEditMode] = useState('perform'); // 'perform', 'draw', 'resize', 'erase'
  const [highwayZoom, setHighwayZoom] = useState(60); // px per beat
  const highwayZoomRef = useRef(60);
  useEffect(() => { highwayZoomRef.current = highwayZoom; }, [highwayZoom]);
  const [resizeDragTarget, setResizeDragTarget] = useState(null);
  const [highwayClipboard, setHighwayClipboard] = useState(null);
  const [perfRecordStartBpm, setPerfRecordStartBpm] = useState(120);

  // Count-in pre-click states and refs
  const [perfCountInEnabled, setPerfCountInEnabled] = useState(true);
  const [perfCountInActive, setPerfCountInActive] = useState(false);
  const [perfCountInRemaining, setPerfCountInRemaining] = useState(4);
  const perfCountInActiveRef = useRef(false);
  const perfCountInRemainingRef = useRef(4);
  const perfCountInIsDubRef = useRef(false);

  useEffect(() => { perfCountInActiveRef.current = perfCountInActive; }, [perfCountInActive]);
  useEffect(() => { perfCountInRemainingRef.current = perfCountInRemaining; }, [perfCountInRemaining]);
  const [activePerfPads, setActivePerfPads] = useState({});
  const [deckAPlaying, setDeckAPlaying] = useState(false);
  const [deckBPlaying, setDeckBPlaying] = useState(false);
  // Refs to avoid tickLoop teardown on every state change (Issues 2, 8)
  const deckAPlayingRef = useRef(false);
  const deckBPlayingRef = useRef(false);
  const crossfaderValRef = useRef(0.0);
  const [deckASoloActive, setDeckASoloActive] = useState(false);
  const [deckBSoloActive, setDeckBSoloActive] = useState(false);
  const deckASoloActiveRef = useRef(false);
  const deckBSoloActiveRef = useRef(false);
  useEffect(() => { deckASoloActiveRef.current = deckASoloActive; }, [deckASoloActive]);
  useEffect(() => { deckBSoloActiveRef.current = deckBSoloActive; }, [deckBSoloActive]);
  const [padMenuState, setPadMenuState] = useState({ visible: false, x: 0, y: 0, deck: 'A', index: 0 });
  const platterAngleARef = useRef(0);
  const platterAngleBRef = useRef(0);
  const platterRefA = useRef(null);
  const platterRefB = useRef(null);
  const ringTracksRefA = useRef([]);
  const ringDotsRefA = useRef([]);
  const ringTracksRefB = useRef([]);
  const ringDotsRefB = useRef([]);
  const seqTimerDisplayRef = useRef(null);
  const seqCurrentBeatRef = useRef(0.0);
  const seqStartBeatOffsetRef = useRef(0.0);
  const highwayEventsRefA = useRef(null);
  const highwayEventsRefB = useRef(null);
  // VU meter DOM refs — updated directly in tickLoop to avoid React re-renders (Issue 1)
  const vuLevelLRef = useRef(0);
  const vuLevelRRef = useRef(0);
  const vuSegLRefsArr = useRef([]);
  const vuSegRRefsArr = useRef([]);
  const [deckAVolFader, setDeckAVolFader] = useState(0.8);
  const [deckBVolFader, setDeckBVolFader] = useState(0.8);
  const [crossfaderVal, setCrossfaderVal] = useState(0.0);
  const [deckAEqLow, setDeckAEqLow] = useState(0.0);
  const [deckAEqMid, setDeckAEqMid] = useState(0.0);
  const [deckAEqHigh, setDeckAEqHigh] = useState(0.0);
  const [deckBEqLow, setDeckBEqLow] = useState(0.0);
  const [deckBEqMid, setDeckBEqMid] = useState(0.0);
  const [deckBEqHigh, setDeckBEqHigh] = useState(0.0);
  // Keep vuLevelL/R state only for initial render; live updates go through refs (Issue 1)
  const [vuLevelL] = useState(0);
  const [vuLevelR] = useState(0);
  const [deckAPitch, setDeckAPitch] = useState(0.0);
  const [deckBPitch, setDeckBPitch] = useState(0.0);
  const [deckALoopSize, setDeckALoopSize] = useState(4);
  const [deckBLoopSize, setDeckBLoopSize] = useState(4);
  const [deckALoopActive, setDeckALoopActive] = useState(false);
  const [deckBLoopActive, setDeckBLoopActive] = useState(false);
  const [deckAKeyLock, setDeckAKeyLock] = useState(true);
  const [deckBKeyLock, setDeckBKeyLock] = useState(true);

  // Sync state → refs for tickLoop so the loop never needs to restart (Issue 2)
  useEffect(() => { deckAPlayingRef.current = deckAPlaying; }, [deckAPlaying]);
  useEffect(() => { deckBPlayingRef.current = deckBPlaying; }, [deckBPlaying]);
  useEffect(() => { crossfaderValRef.current = crossfaderVal; }, [crossfaderVal]);

  const deckAVolFaderRef = useRef(0.8);
  const deckBVolFaderRef = useRef(0.8);
  useEffect(() => { deckAVolFaderRef.current = deckAVolFader; }, [deckAVolFader]);
  useEffect(() => { deckBVolFaderRef.current = deckBVolFader; }, [deckBVolFader]);

  // Playback timeout tracker to cancel stale timers on stop (Issue 6)
  const perfPlaybackTimersRef = useRef([]);
  // Pre-sorted events array — populated once when recording stops (Issue 4)
  const sortedPerfEventsRef = useRef([]);

  const [masterSyncActive, setMasterSyncActive] = useState(false);
  const masterSyncActiveRef = useRef(false);
  useEffect(() => { masterSyncActiveRef.current = masterSyncActive; }, [masterSyncActive]);

  const [ringAnglesA, setRingAnglesA] = useState(new Array(8).fill(0));
  const [ringAnglesB, setRingAnglesB] = useState(new Array(8).fill(0));
  const [currentPerfPlayBeat, setCurrentPerfPlayBeat] = useState(0);
  const [perfQuantizeMode, setPerfQuantizeMode] = useState('None');
  const [perfTimeSignature, setPerfTimeSignature] = useState('4/4');

  const perfQuantizeModeRef = useRef('None');
  const perfTimeSignatureRef = useRef('4/4');
  useEffect(() => { perfQuantizeModeRef.current = perfQuantizeMode; }, [perfQuantizeMode]);
  useEffect(() => { perfTimeSignatureRef.current = perfTimeSignature; }, [perfTimeSignature]);

  const [liveRecBeats, setLiveRecBeats] = useState(8);
  const liveRecBeatsRef = useRef(8);
  useEffect(() => { liveRecBeatsRef.current = liveRecBeats; }, [liveRecBeats]);

  const [liveRecTargetSlot, setLiveRecTargetSlot] = useState('a01');
  const liveRecTargetSlotRef = useRef('a01');
  useEffect(() => { liveRecTargetSlotRef.current = liveRecTargetSlot; }, [liveRecTargetSlot]);

  const [isLiveRecording, setIsLiveRecording] = useState(false);
  const isLiveRecordingRef = useRef(false);

  const [liveRecPendingStart, setLiveRecPendingStart] = useState(false);
  const liveRecPendingStartRef = useRef(false);
  useEffect(() => { liveRecPendingStartRef.current = liveRecPendingStart; }, [liveRecPendingStart]);

  const liveRecStartTimeRef = useRef(0);
  const liveRecTotalSamplesRef = useRef(0);
  const liveRecCollectedSamplesRef = useRef(0);

  const [manualRecPendingStart, setManualRecPendingStart] = useState(false);
  const manualRecPendingStartRef = useRef(false);
  useEffect(() => { manualRecPendingStartRef.current = manualRecPendingStart; }, [manualRecPendingStart]);

  const [manualRecPendingStop, setManualRecPendingStop] = useState(false);
  const manualRecPendingStopRef = useRef(false);
  useEffect(() => { manualRecPendingStopRef.current = manualRecPendingStop; }, [manualRecPendingStop]);

  const manualRecStartTimeRef = useRef(0);
  const manualRecStopTimeRef = useRef(0);
  const manualRecBeatsRef = useRef(0);

  const sustainPedalPressedRef = useRef(false);
  const sustainPedalPressTimeRef = useRef(0);

  const deckAPitchRef = useRef(0.0);
  const deckBPitchRef = useRef(0.0);
  useEffect(() => { deckAPitchRef.current = deckAPitch; }, [deckAPitch]);
  useEffect(() => { deckBPitchRef.current = deckBPitch; }, [deckBPitch]);

  const perfEventsRef = useRef([]);
  useEffect(() => {
    perfEventsRef.current = perfEvents;
  }, [perfEvents]);

  const timelineScrollRef = useRef(null);

  const perfRecordActiveRef = useRef(false);
  useEffect(() => {
    perfRecordActiveRef.current = perfRecordActive;
  }, [perfRecordActive]);

  const perfPlaybackActiveRef = useRef(false);
  useEffect(() => {
    perfPlaybackActiveRef.current = perfPlaybackActive;
  }, [perfPlaybackActive]);

  const perfStartTimeRef = useRef(0);
  const perfPlaybackTimerRef = useRef(null);
  const perfPlayNextEventIdxRef = useRef(0);
  const perfPlayStartTimeRef = useRef(0);
  const deckATimerRef = useRef(null);
  const deckBTimerRef = useRef(null);
  const isScratchingA = useRef(false);

  useEffect(() => {
    if (schedulerNodeRef.current) {
      schedulerNodeRef.current.port.postMessage({
        type: 'SET_PARAMS',
        bpm: params.arpBpm,
        arpDivision: params.arpDivision,
        quantizeMode: perfQuantizeMode,
        timeSignature: parseInt(perfTimeSignature.split('/')[0]) || 4,
        perfRecordActive: perfRecordActive,
        perfStartTime: perfStartTimeRef.current
      });
    }
  }, [params.arpBpm, params.arpDivision, perfQuantizeMode, perfTimeSignature, perfRecordActive]);
  const isScratchingB = useRef(false);
  const scratchStartAngleA = useRef(0);
  const scratchStartAngleB = useRef(0);
  const [selectedSliceIndex, setSelectedSliceIndex] = useState(0); // Selected slice index for editing
  const [tapTimes, setTapTimes] = useState([]); // Timestamps for tap tempo calculation
  const [selectedEchoPresetIdx, setSelectedEchoPresetIdx] = useState(''); // Current echo preset index
  const [selectedRotorPresetIdx, setSelectedRotorPresetIdx] = useState(''); // Current rotor preset index
  const [editorStatus, setEditorStatus] = useState('');
  const editorStatusTimeoutRef = useRef(null);
  const showEditorStatus = (msg) => {
    setEditorStatus(msg);
    if (editorStatusTimeoutRef.current) {
      clearTimeout(editorStatusTimeoutRef.current);
    }
    editorStatusTimeoutRef.current = setTimeout(() => {
      setEditorStatus('');
    }, 2500);
  };
  const [bankAPreset, setBankAPreset] = useState(1);
  const [bankBPreset, setBankBPreset] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const [recordingInputGain, setRecordingInputGain] = useState(1.0);
  const recordingInputGainRef = useRef(1.0);
  const resamplerGainNodeRef = useRef(null);
  const recordingTargetSlotIdRef = useRef('a01');
  const recordingScriptNodeRef = useRef(null);
  const recordingWorkletNodeRef = useRef(null);
  const recorderBlobUrlRef = useRef(null);
  const recordedChunksL = useRef([]);
  const recordedChunksR = useRef([]);
  const isRecordingRef = useRef(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const activePreviewNodeRef = useRef(null);
  const previewStartTimeRef = useRef(0);
  const previewStartOffsetRef = useRef(0);

  // Toggle Performance View with Tab key and map triggers
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Tab') {
        const activeEl = document.activeElement;
        const tag = activeEl ? activeEl.tagName.toLowerCase() : '';
        const isEditable = activeEl ? (activeEl.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select') : false;
        
        if (!isEditable) {
          e.preventDefault();
          setPerformanceViewActive(prev => !prev);
        }
        return;
      }

      if (performanceViewActive) {
        const activeEl = document.activeElement;
        const tag = activeEl ? activeEl.tagName.toLowerCase() : '';
        const isEditable = activeEl ? (activeEl.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select') : false;
        if (isEditable) return;

        if (e.repeat) return;
        const key = e.key.toLowerCase();
        
        // Deck A slots: 1 to 8 keys
        const deckAKeys = ['1', '2', '3', '4', '5', '6', '7', '8'];
        const aIdx = deckAKeys.indexOf(key);
        if (aIdx !== -1) {
          e.preventDefault();
          triggerPerfPadInternal('A', 'slot', aIdx, 100, true, true);
        }

        // Deck B slots: Q to I keys
        const deckBKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'];
        const bIdx = deckBKeys.indexOf(key);
        if (bIdx !== -1) {
          e.preventDefault();
          triggerPerfPadInternal('B', 'slot', bIdx, 100, true, true);
        }
      }
    };

    const handleGlobalKeyUp = (e) => {
      if (performanceViewActive) {
        const activeEl = document.activeElement;
        const tag = activeEl ? activeEl.tagName.toLowerCase() : '';
        const isEditable = activeEl ? (activeEl.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select') : false;
        if (isEditable) return;

        const key = e.key.toLowerCase();

        // Deck A slots release
        const deckAKeys = ['1', '2', '3', '4', '5', '6', '7', '8'];
        const aIdx = deckAKeys.indexOf(key);
        if (aIdx !== -1) {
          e.preventDefault();
          triggerPerfPadInternal('A', 'slot', aIdx, 100, false, true);
        }

        // Deck B slots release
        const deckBKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'];
        const bIdx = deckBKeys.indexOf(key);
        if (bIdx !== -1) {
          e.preventDefault();
          triggerPerfPadInternal('B', 'slot', bIdx, 100, false, true);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [performanceViewActive]);

  // Clean up recording / playback / active voices when exiting Performance View
  useEffect(() => {
    if (!performanceViewActive) {
      setPerfPlaybackActive(false);
      setPerfRecordActive(false);
      if (schedulerNodeRef.current) {
        schedulerNodeRef.current.port.postMessage({ type: 'STOP_PLAYBACK' });
        schedulerNodeRef.current.port.postMessage({ type: 'STOP_METRONOME' });
        schedulerNodeRef.current.port.postMessage({ type: 'STOP_ARP' });
        schedulerNodeRef.current.port.postMessage({
          type: 'SET_PARAMS',
          perfRecordActive: false
        });
      }
      [...activeVoicesRef.current.keys()].forEach(k => {
        if (typeof k === 'string' && k.startsWith('perf-')) {
          stopPerfVoice(k);
        }
      });
      setActivePerfPads({});
    }
  }, [performanceViewActive]);

  // Platter angle rotation and live VU meter loop
  useEffect(() => {
    if (!performanceViewActive) return;
    
    let animId;
    let lastTime = performance.now();
    
    const bufferLength = 32;
    const dataArray = new Uint8Array(bufferLength);
    
    // Issue 8: replaced Map spread with early-exit for...of — eliminates 240 array allocations/sec
    const getIsDeckActive = (deck) => {
      if (deck === 'A') {
        if (deckAPlayingRef.current) return true;
      } else {
        if (deckBPlayingRef.current) return true;
      }
      const prefix = `perf-${deck.toLowerCase()}`;
      for (const key of activeVoicesRef.current.keys()) {
        if (typeof key === 'string' && key.startsWith(prefix)) return true;
      }
      return false;
    };
    
    const getIsDeckReverse = (deck) => {
      const prefix = `perf-${deck.toLowerCase()}`;
      for (const [key, voices] of activeVoicesRef.current.entries()) {
        if (typeof key === 'string' && key.startsWith(prefix) && voices && voices.length > 0) {
          const v = voices[0];
          if (deck === 'A' && v.isReverseA) return true;
          if (deck === 'B' && v.isReverseB) return true;
        }
      }
      if (deck === 'A') {
        const slotA = sampleSlotsRef.current.find(s => s.id === paramsRef.current.oscAWave);
        if (slotA && slotA.reverseOn) return true;
      } else {
        const slotB = sampleSlotsRef.current.find(s => s.id === paramsRef.current.oscBWave);
        if (slotB && slotB.reverseOn) return true;
      }
      return false;
    };

    const tickLoop = () => {
      animId = requestAnimationFrame(tickLoop);
      const tNow = performance.now();
      const delta = (tNow - lastTime) / 1000;
      lastTime = tNow;
      
      // Platter spin increment
      if (getIsDeckActive('A') && !isScratchingA.current) {
        const dir = getIsDeckReverse('A') ? -1 : 1;
        platterAngleARef.current = (platterAngleARef.current + dir * delta * 180 + 360) % 360;
        if (platterRefA.current) {
          platterRefA.current.style.transform = `rotate(${platterAngleARef.current}deg)`;
        }
      }
      if (getIsDeckActive('B') && !isScratchingB.current) {
        const dir = getIsDeckReverse('B') ? -1 : 1;
        platterAngleBRef.current = (platterAngleBRef.current + dir * delta * 180 + 360) % 360;
        if (platterRefB.current) {
          platterRefB.current.style.transform = `rotate(${platterAngleBRef.current}deg)`;
        }
      }

      // Concentric rings & timeline beat
      const ctx = audioCtxRef.current;
      if (ctx) {
        // Timeline beat & auto-scroll
        let currentBeat = 0;
        if (perfPlaybackActiveRef.current && perfPlayStartTimeRef.current > 0) {
          const elapsed = ctx.currentTime - perfPlayStartTimeRef.current;
          const bpm = paramsRef.current.arpBpm || 120;
          const beatDuration = 60 / bpm;
          currentBeat = elapsed / beatDuration + seqStartBeatOffsetRef.current;
          seqCurrentBeatRef.current = currentBeat;
        } else if (perfRecordActiveRef.current && perfStartTimeRef.current > 0) {
          const elapsed = ctx.currentTime - perfStartTimeRef.current;
          const bpm = paramsRef.current.arpBpm || 120;
          const beatDuration = 60 / bpm;
          currentBeat = elapsed / beatDuration;
          seqCurrentBeatRef.current = currentBeat;
        } else {
          currentBeat = seqCurrentBeatRef.current;
        }

        // Update timer display DOM element
        if (seqTimerDisplayRef.current) {
          seqTimerDisplayRef.current.innerText = currentBeat.toFixed(1);
        }

        // Translate Guitar Hero highways downwards (GPU transform)
        const translatePx = currentBeat * highwayZoomRef.current;
        if (highwayEventsRefA.current) {
          highwayEventsRefA.current.style.transform = `translateY(${translatePx}px)`;
        }
        if (highwayEventsRefB.current) {
          highwayEventsRefB.current.style.transform = `translateY(${translatePx}px)`;
        }

        // Concentric Rings calculation
        const getRingAngle = (deck, slotIdx) => {
          const voiceKey = `perf-${deck.toLowerCase()}-slot-${slotIdx}`;
          const voices = activeVoicesRef.current.get(voiceKey);
          if (!voices || voices.length === 0) return 0;
          
          const voice = voices[0];
          if (!voice) return 0;
          
          const elapsed = ctx.currentTime - voice.startTime;
          if (elapsed < 0) return 0;
          
          const isA = deck === 'A';
          const duration = isA ? voice.activeDurationA : voice.activeDurationB;
          const rate = isA ? (voice.orig_oscA_rate || 1.0) : (voice.orig_oscB_rate || 1.0);
          const isLoop = isA ? voice.isLoopA : voice.isLoopB;
          const isReverse = isA ? voice.isReverseA : voice.isReverseB;
          
          if (duration <= 0) return 0;
          
          let pos = elapsed * rate;
          if (isLoop) {
            pos = pos % duration;
          } else {
            if (pos >= duration) return 0;
          }
          const progress = pos / duration;
          return (isReverse ? (1.0 - progress) : progress) * 360;
        };

        // Mutate concentric playhead rings and satellite dots directly in the DOM
        for (let i = 0; i < 8; i++) {
          const angleA = getRingAngle('A', i);
          const voiceKeyA = `perf-a-slot-${i}`;
          const voicesA = activeVoicesRef.current.get(voiceKeyA);
          const isActiveA = voicesA && voicesA.length > 0;
          
          const trackA = ringTracksRefA.current[i];
          const dotA = ringDotsRefA.current[i];
          
          if (trackA) {
            trackA.style.transform = `rotate(${angleA}deg)`;
            trackA.style.opacity = isActiveA ? '0.9' : '0.18';
            // Issue 9: toggle class instead of setting filter string every frame
            if (isActiveA) {
              if (!trackA._wasActive) { trackA.classList.add('ring-active'); trackA._wasActive = true; }
            } else {
              if (trackA._wasActive) { trackA.classList.remove('ring-active'); trackA._wasActive = false; }
            }
          }
          if (dotA) {
            dotA.style.transform = `rotate(${angleA}deg)`;
            dotA.style.opacity = isActiveA ? '1' : '0';
          }

          const angleB = getRingAngle('B', i);
          const voiceKeyB = `perf-b-slot-${i}`;
          const voicesB = activeVoicesRef.current.get(voiceKeyB);
          const isActiveB = voicesB && voicesB.length > 0;
          
          const trackB = ringTracksRefB.current[i];
          const dotB = ringDotsRefB.current[i];
          
          if (trackB) {
            trackB.style.transform = `rotate(${angleB}deg)`;
            trackB.style.opacity = isActiveB ? '0.9' : '0.18';
            // Issue 9: toggle class instead of setting filter string every frame
            if (isActiveB) {
              if (!trackB._wasActive) { trackB.classList.add('ring-active'); trackB._wasActive = true; }
            } else {
              if (trackB._wasActive) { trackB.classList.remove('ring-active'); trackB._wasActive = false; }
            }
          }
          if (dotB) {
            dotB.style.transform = `rotate(${angleB}deg)`;
            dotB.style.opacity = isActiveB ? '1' : '0';
          }
        }
      }

      // Issue 1: VU Meter — direct DOM mutation, NO setState, zero React re-renders
      if (analyserRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = (dataArray[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / bufferLength);
        let db = rms * 100;
        
        // Dynamic fallback animation when audio context is silent/suspended but decks are playing
        if (db < 2.0) {
          if (getIsDeckActive('A') || getIsDeckActive('B')) {
            db = 15.0 + Math.random() * 25.0;
          }
        }
        
        const pan = crossfaderValRef.current;
        const panL = pan <= 0 ? 1.0 : Math.cos(pan * Math.PI / 2);
        const panR = pan >= 0 ? 1.0 : Math.cos(-pan * Math.PI / 2);

        const newL = Math.max(0, Math.min(100, Math.round(db * 2.2 * panL * 0.25 + vuLevelLRef.current * 0.75)));
        const newR = Math.max(0, Math.min(100, Math.round(db * 2.2 * panR * 0.25 + vuLevelRRef.current * 0.75)));
        vuLevelLRef.current = newL;
        vuLevelRRef.current = newR;

        // Update VU segment DOM elements directly
        const segsL = vuSegLRefsArr.current;
        const segsR = vuSegRRefsArr.current;
        for (let si = 0; si < 10; si++) {
          const segIdx = 9 - si;
          const color = segIdx > 8 ? '#ff0055' : segIdx > 6 ? '#ffe600' : '#00ff66';
          if (segsL[si]) {
            const litL = newL >= (segIdx + 1) * 10;
            segsL[si].style.background = litL ? color : '#111827';
            segsL[si].style.boxShadow = litL ? `0 0 3px ${color}` : 'none';
          }
          if (segsR[si]) {
            const litR = newR >= (segIdx + 1) * 10;
            segsR[si].style.background = litR ? color : '#111827';
            segsR[si].style.boxShadow = litR ? `0 0 3px ${color}` : 'none';
          }
        }
      }
    };
    
    tickLoop();
    return () => {
      cancelAnimationFrame(animId);
    };
  // Issue 2: deps trimmed to only performanceViewActive — crossfaderVal, deckAPlaying, deckBPlaying
  // are now read via refs inside the loop so the loop never tears down on those changes
  }, [performanceViewActive]);

  // Real-time Mixer Fader & EQ voice modulator
  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    
    deckAEqLowValRef.current = deckAEqLow;
    deckAEqMidValRef.current = deckAEqMid;
    deckAEqHighValRef.current = deckAEqHigh;
    deckBEqLowValRef.current = deckBEqLow;
    deckBEqMidValRef.current = deckBEqMid;
    deckBEqHighValRef.current = deckBEqHigh;

    activeVoicesRef.current.forEach((vList, voiceKey) => {
      if (typeof voiceKey === 'string' && voiceKey.startsWith('perf-')) {
        const isDeckA = voiceKey.includes('perf-a');
        const faderVol = isDeckA ? deckAVolFader : deckBVolFader;
        let cfGain = 1.0;
        if (isDeckA) {
          if (crossfaderVal > 0) {
            cfGain = Math.cos(crossfaderVal * Math.PI / 2);
          }
        } else {
          if (crossfaderVal < 0) {
            cfGain = Math.cos(crossfaderVal * Math.PI / 2);
          }
        }
        const finalGain = faderVol * cfGain;
        const list = Array.isArray(vList) ? vList : [vList];
        
        list.forEach(voice => {
          if (voice && voice.voiceOutGain) {
            voice.voiceOutGain.gain.setValueAtTime(finalGain, now);
          }
          if (voice) {
            const eqLow = isDeckA ? deckAEqLow : deckBEqLow;
            const eqMid = isDeckA ? deckAEqMid : deckBEqMid;
            const eqHigh = isDeckA ? deckAEqHigh : deckBEqHigh;
            const lowGainDb = eqLow < 0 ? eqLow * 26.0 : eqLow * 6.0;
            const midGainDb = eqMid < 0 ? eqMid * 26.0 : eqMid * 6.0;
            const highGainDb = eqHigh < 0 ? eqHigh * 26.0 : eqHigh * 6.0;

            if (voice.eqLowNode) {
              voice.eqLowNode.gain.setTargetAtTime(lowGainDb, now, 0.015);
            }
            if (voice.eqMidNode) {
              voice.eqMidNode.gain.setTargetAtTime(midGainDb, now, 0.015);
            }
            if (voice.eqHighNode) {
              voice.eqHighNode.gain.setTargetAtTime(highGainDb, now, 0.015);
            }
          }
        });
      }
    });
  }, [deckAVolFader, deckBVolFader, crossfaderVal, deckAEqLow, deckAEqMid, deckAEqHigh, deckBEqLow, deckBEqMid, deckBEqHigh]);

  // --- Waveform selection, clipboard, history & recording states ---
  const [recordingInputMode, setRecordingInputMode] = useState('mic'); // 'mic', 'monitor', or 'resample'
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
    if (!slotId) return '';
    if (slotId.startsWith('a')) return `A${parseInt(slotId.slice(1))}`;
    if (slotId.startsWith('b')) return `B${parseInt(slotId.slice(1))}`;
    const num = parseInt(slotId.slice(2));
    return `U${num}`;
  };

  // Recorder and Canvas references
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const micAnalyserRef = useRef(null);
  const micSourceRef = useRef(null);
  const micInputGainNodeRef = useRef(null);
  const recordingDestRef = useRef(null);
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
      if (metronomeRef.current.timerId) {
        clearTimeout(metronomeRef.current.timerId);
      }
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);

      // Robust cleanup of Web Audio nodes and AudioContext closure to prevent leaks on component unmount
      if (audioCtxRef.current) {
        // Stop any active scheduled worklet clocks
        if (schedulerNodeRef.current) {
          try { schedulerNodeRef.current.port.postMessage({ type: 'STOP_PLAYBACK' }); } catch {}
          try { schedulerNodeRef.current.port.postMessage({ type: 'STOP_ARP' }); } catch {}
          try { schedulerNodeRef.current.port.postMessage({ type: 'STOP_METRONOME' }); } catch {}
          try { schedulerNodeRef.current.disconnect(); } catch {}
          schedulerNodeRef.current = null;
        }
        
        // Stop and disconnect all currently active voice node sub-graphs
        activeVoicesRef.current.forEach(voices => {
          voices.forEach(voice => {
            const sources = [
              voice.oscA, voice.oscB, voice.oscA_L, voice.oscA_R, voice.subOsc, voice.noiseSource,
              voice.driftLfo, voice.vibratoLfo, voice.filterLfo
            ];
            sources.forEach(src => {
              if (src) { try { src.stop(); } catch {} }
            });

            const nodes = [
              voice.oscA, voice.oscB, voice.oscA_L, voice.oscA_R, voice.subOsc, voice.noiseSource,
              voice.driftLfo, voice.vibratoLfo, voice.filterLfo,
              voice.gainA, voice.gainB, voice.gainA_L, voice.gainA_R, voice.subGain, voice.noiseGain,
              voice.vibratoLfoGain, voice.filterLfoGain, voice.filter1, voice.filter2,
              voice.eqLowNode, voice.eqMidNode, voice.eqHighNode, voice.sendGainNode, voice.voiceOutGain
            ];
            nodes.forEach(node => {
              if (node && typeof node.disconnect === 'function') {
                try { node.disconnect(); } catch {}
              }
            });
          });
        });
        activeVoicesRef.current.clear();
        
        // Disconnect global rack nodes to free memory
        const globalNodes = [
          analyserRef.current, masterGainRef.current, preampNodeRef.current,
          ifx1InputRef.current, ifx1OutputRef.current, ifx2InputRef.current, ifx2OutputRef.current,
          delayInputRef.current, delayOutputRef.current, leslieInputRef.current, leslieOutputRef.current,
          dubSirenOscRef.current, dubSirenGainRef.current, formantInputRef.current, formantMixGainRef.current,
          formantDryGainRef.current, formantF1Ref.current, formantF2Ref.current, formantF3Ref.current
        ];
        globalNodes.forEach(node => {
          if (node && typeof node.disconnect === 'function') {
            try { node.disconnect(); } catch {}
          }
        });
        
        if (dubSirenOscRef.current) {
          try { dubSirenOscRef.current.stop(); } catch {}
        }

        // Close the AudioContext to release hardware device channels
        try {
          audioCtxRef.current.close().then(() => {
            console.log("[Leo Audit] AudioContext closed successfully to prevent hardware device leaks.");
          });
        } catch (err) {
          console.warn("Error closing AudioContext on unmount:", err);
        }
        audioCtxRef.current = null;
      }
    };
  }, []);

  // --- Recorder Deck Action Handlers ---
  const setupLosslessRecorderNode = (ctx, sourceNode) => {
    if (recordingWorkletNodeRef.current) {
      try { recordingWorkletNodeRef.current.disconnect(); } catch {}
      recordingWorkletNodeRef.current = null;
    }
    if (recordingScriptNodeRef.current) {
      try { recordingScriptNodeRef.current.disconnect(); } catch {}
      recordingScriptNodeRef.current = null;
    }

    try {
      const workletNode = new AudioWorkletNode(ctx, 'recorder-processor');
      workletNode.port.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'STARTED') {
          if (liveRecPendingStartRef.current) {
            isLiveRecordingRef.current = true;
            liveRecPendingStartRef.current = false;
            setIsLiveRecording(true);
            setLiveRecPendingStart(false);
            showEditorStatus("Live Recording Started! 🔴");
          } else {
            isRecordingRef.current = true;
            manualRecPendingStartRef.current = false;
            setIsRecording(true);
            setManualRecPendingStart(false);
            showEditorStatus("Recording Started... ⏺️");
          }
        } else if (msg.type === 'STOPPED') {
          if (isLiveRecordingRef.current) {
            isLiveRecordingRef.current = false;
            setIsLiveRecording(false);
          } else {
            isRecordingRef.current = false;
            setIsRecording(false);
            manualRecPendingStopRef.current = false;
            setManualRecPendingStop(false);
          }
        } else if (msg.type === 'RECORDING_COMPLETE') {
          recordedChunksL.current = [msg.bufferL];
          recordedChunksR.current = [msg.bufferR];
          
          if (liveRecTargetSlotRef.current && liveRecBeatsRef.current > 0 && (isLiveRecordingRef.current || liveRecCollectedSamplesRef.current > 0 || liveRecPendingStartRef.current)) {
            liveRecCollectedSamplesRef.current = msg.bufferL.length;
            isLiveRecordingRef.current = false;
            setIsLiveRecording(false);
            saveLiveLoopRecording();
            liveRecCollectedSamplesRef.current = 0;
          } else {
            isRecordingRef.current = false;
            setIsRecording(false);
            manualRecPendingStopRef.current = false;
            setManualRecPendingStop(false);
            saveResampledAudio();
          }
        }
      };

      recordingWorkletNodeRef.current = workletNode;
      sourceNode.connect(workletNode);
      workletNode.connect(ctx.destination);
      return;
    } catch (err) {
      console.warn("Failed to create AudioWorkletNode for recorder, falling back to ScriptProcessorNode:", err);
    }

    // FALLBACK: Legacy ScriptProcessorNode
    const scriptNode = ctx.createScriptProcessor(8192, 2, 2);
    scriptNode.onaudioprocess = (e) => {
      const inputL = e.inputBuffer.getChannelData(0);
      const inputR = e.inputBuffer.getChannelData(1);
      
      const outputL = e.outputBuffer.getChannelData(0);
      const outputR = e.outputBuffer.getChannelData(1);
      outputL.fill(0);
      outputR.fill(0);
      
      const blockTime = e.playbackTime || ctx.currentTime;
      const blockLength = inputL.length;
      const sampleDuration = 1.0 / ctx.sampleRate;
      const blockEndTime = blockTime + blockLength * sampleDuration;

      // Handle beat-synced start
      if (manualRecPendingStartRef.current) {
        const targetStartTime = manualRecStartTimeRef.current;
        if (blockTime <= targetStartTime && targetStartTime < blockEndTime) {
          const startOffset = Math.max(0, Math.min(blockLength - 1, Math.round((targetStartTime - blockTime) * ctx.sampleRate)));
          const countToCopy = blockLength - startOffset;
          
          recordedChunksL.current = [];
          recordedChunksR.current = [];
          
          const chunkL = new Float32Array(countToCopy);
          const chunkR = new Float32Array(countToCopy);
          for (let i = 0; i < countToCopy; i++) {
            chunkL[i] = inputL[startOffset + i];
            chunkR[i] = inputR[startOffset + i];
          }
          recordedChunksL.current.push(chunkL);
          recordedChunksR.current.push(chunkR);
          
          isRecordingRef.current = true;
          manualRecPendingStartRef.current = false;
          
          setTimeout(() => {
            setIsRecording(true);
            setManualRecPendingStart(false);
            showEditorStatus("Recording Started... ⏺️");
          }, 0);
          return;
        }
      }

      // Handle beat-synced stop
      if (manualRecPendingStopRef.current && isRecordingRef.current) {
        const targetStopTime = manualRecStopTimeRef.current;
        if (blockTime <= targetStopTime && targetStopTime < blockEndTime) {
          const stopOffset = Math.max(0, Math.min(blockLength - 1, Math.round((targetStopTime - blockTime) * ctx.sampleRate)));
          
          const chunkL = new Float32Array(stopOffset);
          const chunkR = new Float32Array(stopOffset);
          for (let i = 0; i < stopOffset; i++) {
            chunkL[i] = inputL[i];
            chunkR[i] = inputR[i];
          }
          recordedChunksL.current.push(chunkL);
          recordedChunksR.current.push(chunkR);
          
          isRecordingRef.current = false;
          manualRecPendingStopRef.current = false;
          
          const bpm = paramsRef.current.arpBpm || 120;
          const beatDuration = 60 / bpm;
          const duration = targetStopTime - manualRecStartTimeRef.current;
          manualRecBeatsRef.current = Math.max(1, Math.round(duration / beatDuration));

          setTimeout(() => {
            setIsRecording(false);
            setManualRecPendingStop(false);
            saveResampledAudio();
          }, 0);
          return;
        }
      }

      if (liveRecPendingStartRef.current) {
        const targetStartTime = liveRecStartTimeRef.current;
        if (blockTime <= targetStartTime && targetStartTime < blockEndTime) {
          const startOffset = Math.max(0, Math.min(blockLength - 1, Math.round((targetStartTime - blockTime) * ctx.sampleRate)));
          const countToCopy = blockLength - startOffset;
          
          recordedChunksL.current = [];
          recordedChunksR.current = [];
          liveRecCollectedSamplesRef.current = 0;
          
          const chunkL = new Float32Array(countToCopy);
          const chunkR = new Float32Array(countToCopy);
          for (let i = 0; i < countToCopy; i++) {
            chunkL[i] = inputL[startOffset + i];
            chunkR[i] = inputR[startOffset + i];
          }
          recordedChunksL.current.push(chunkL);
          recordedChunksR.current.push(chunkR);
          liveRecCollectedSamplesRef.current += countToCopy;
          
          isLiveRecordingRef.current = true;
          liveRecPendingStartRef.current = false;
          
          setTimeout(() => {
            setIsLiveRecording(true);
            setLiveRecPendingStart(false);
            showEditorStatus("Live Recording Started! 🔴");
          }, 0);
          return;
        }
      }

      if (isLiveRecordingRef.current) {
        const blockLength = inputL.length;
        const remaining = liveRecTotalSamplesRef.current - liveRecCollectedSamplesRef.current;
        if (remaining > 0) {
          const countToCopy = Math.min(blockLength, remaining);
          const chunkL = new Float32Array(countToCopy);
          const chunkR = new Float32Array(countToCopy);
          for (let i = 0; i < countToCopy; i++) {
            chunkL[i] = inputL[i];
            chunkR[i] = inputR[i];
          }
          recordedChunksL.current.push(chunkL);
          recordedChunksR.current.push(chunkR);
          liveRecCollectedSamplesRef.current += countToCopy;
          
          if (liveRecCollectedSamplesRef.current >= liveRecTotalSamplesRef.current) {
            isLiveRecordingRef.current = false;
            setTimeout(() => {
              setIsLiveRecording(false);
              saveLiveLoopRecording();
            }, 0);
          }
        }
        return;
      }

      if (isRecordingRef.current) {
        recordedChunksL.current.push(new Float32Array(inputL));
        recordedChunksR.current.push(new Float32Array(inputR));
      }
    };
    recordingScriptNodeRef.current = scriptNode;
    sourceNode.connect(scriptNode);
    scriptNode.connect(ctx.destination);
  };

  const startLiveLoopRecording = () => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    if (!streamRef.current) {
      showEditorStatus("Arming mic/instrument input... 🎤");
      armMicrophone()
        .then(() => {
          triggerLiveLoopRecInternal();
        })
        .catch(err => {
          console.error("Arming microphone failed:", err);
          showEditorStatus("Failed to arm input source! ❌");
        });
    } else {
      triggerLiveLoopRecInternal();
    }
  };

  const triggerLiveLoopRecInternal = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const bpm = paramsRef.current.arpBpm || 120;
    const beatDuration = 60 / bpm;
    const totalSec = beatDuration * liveRecBeatsRef.current;
    liveRecTotalSamplesRef.current = Math.round(ctx.sampleRate * totalSec);
    liveRecCollectedSamplesRef.current = 0;
    recordedChunksL.current = [];
    recordedChunksR.current = [];
    
    const isPlaying = metronomeRef.current.isPlaying || perfPlaybackActiveRef.current || perfRecordActiveRef.current;
    const useWorklet = recordingWorkletNodeRef.current !== null;

    if (isPlaying) {
      let nextBeatTime = metronomeRef.current.nextNoteTime;
      if (nextBeatTime < ctx.currentTime) {
        nextBeatTime = ctx.currentTime + 0.05;
      }
      liveRecStartTimeRef.current = nextBeatTime;
      liveRecPendingStartRef.current = true;
      setLiveRecPendingStart(true);
      showEditorStatus("Armed: Waiting for next beat... ⏳");
      
      if (useWorklet) {
        recordingWorkletNodeRef.current.port.postMessage({
          type: 'ARM_LIVE_LOOP',
          startTime: nextBeatTime,
          totalSamples: liveRecTotalSamplesRef.current
        });
      }
    } else {
      liveRecStartTimeRef.current = ctx.currentTime;
      liveRecPendingStartRef.current = false;
      setLiveRecPendingStart(false);
      isLiveRecordingRef.current = true;
      setIsLiveRecording(true);
      showEditorStatus("Live Recording Started! 🔴");
      
      if (useWorklet) {
        recordingWorkletNodeRef.current.port.postMessage({
          type: 'ARM_LIVE_LOOP',
          startTime: ctx.currentTime,
          totalSamples: liveRecTotalSamplesRef.current
        });
      }
    }
  };

  const saveLiveLoopRecording = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const chunksL = recordedChunksL.current;
    const chunksR = recordedChunksR.current;
    if (chunksL.length === 0) return;
    
    let totalLength = 0;
    for (let i = 0; i < chunksL.length; i++) {
      totalLength += chunksL[i].length;
    }
    
    const buffer = ctx.createBuffer(2, totalLength, ctx.sampleRate);
    const channelL = buffer.getChannelData(0);
    const channelR = buffer.getChannelData(1);
    
    let offset = 0;
    for (let i = 0; i < chunksL.length; i++) {
      channelL.set(chunksL[i], offset);
      channelR.set(chunksR[i], offset);
      offset += chunksL[i].length;
    }
    
    normalizeBuffer(buffer);
    
    let updatedSlot = null;
    const targetSlotId = liveRecTargetSlotRef.current;
    const nextSlots = sampleSlotsRef.current.map(slot => {
      if (slot.id === targetSlotId) {
        updatedSlot = {
          ...slot,
          name: `Live Loop (${liveRecBeatsRef.current}b)`,
          buffer: buffer,
          revBuffer: getReversedBuffer(ctx, buffer),
          start: 0.0,
          end: 1.0,
          loopStart: 0.0,
          loopEnd: 1.0,
          loopOn: true,
          warpOn: true,
          warpBeats: liveRecBeatsRef.current
        };
        return updatedSlot;
      }
      return slot;
    });
    sampleSlotsRef.current = nextSlots;
    setSampleSlots(nextSlots);

    if (updatedSlot) {
      saveSampleToDb(updatedSlot)
        .then(() => {
          showEditorStatus(`Live Loop Saved to ${getSlotLabel(targetSlotId)}! 💾`);
        })
        .catch((e) => {
          console.error("Failed to save live loop to DB:", e);
        });
    }
  };

  const toggleLiveLoopRecording = () => {
    if (isLiveRecordingRef.current || liveRecPendingStartRef.current) {
      isLiveRecordingRef.current = false;
      liveRecPendingStartRef.current = false;
      setIsLiveRecording(false);
      setLiveRecPendingStart(false);
      showEditorStatus("Live Recording Cancelled ⏹️");
      if (recordingWorkletNodeRef.current) {
        recordingWorkletNodeRef.current.port.postMessage({ type: 'STOP' });
      }
    } else {
      startLiveLoopRecording();
    }
  };

  const handleSustainPedalDown = () => {
    sustainPedalPressTimeRef.current = performance.now();
    if (!isLiveRecordingRef.current && !liveRecPendingStartRef.current) {
      startLiveLoopRecording();
    }
  };

  const handleSustainPedalUp = () => {
    const holdDuration = performance.now() - sustainPedalPressTimeRef.current;
    if (holdDuration > 300 && (isLiveRecordingRef.current || liveRecPendingStartRef.current)) {
      if (isLiveRecordingRef.current) {
        isLiveRecordingRef.current = false;
        setIsLiveRecording(false);
        saveLiveLoopRecording();
      } else {
        liveRecPendingStartRef.current = false;
        setLiveRecPendingStart(false);
        showEditorStatus("Live Recording Aborted ⏹️");
      }
    }
  };

  // Issue 7: selectedAudioDeviceRef prevents stale closure in devicechange listener
  const selectedAudioDeviceRef = useRef('');
  useEffect(() => { selectedAudioDeviceRef.current = selectedAudioDevice; }, [selectedAudioDevice]);

  const loadAudioInputDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputs);
        // Read ref not state — avoids stale closure resetting selection on hot-plug
        if (audioInputs.length > 0 && !selectedAudioDeviceRef.current) {
          const defaultDevice = audioInputs.find(d => d.deviceId === 'default') || audioInputs[0];
          setSelectedAudioDevice(defaultDevice.deviceId);
        }
      }
    } catch (err) {
      console.error("Error enumerating audio devices:", err);
    }
  };

  const handleAudioDeviceChange = async (deviceId) => {
    setSelectedAudioDevice(deviceId);
    if (isArmed) {
      const targetSlot = recordingTargetSlotIdRef.current;
      disarmMicrophone();
      setTimeout(async () => {
        recordingTargetSlotIdRef.current = targetSlot;
        try {
          const audioConstraints = {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            deviceId: { exact: deviceId }
          };
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints
          });
          streamRef.current = stream;
          
          if (!audioCtxRef.current) initAudio();
          const ctx = audioCtxRef.current;
          
          const source = ctx.createMediaStreamSource(stream);
          micSourceRef.current = source;

          const inputGainNode = ctx.createGain();
          inputGainNode.gain.setValueAtTime(recordingInputGainRef.current, ctx.currentTime);
          micInputGainNodeRef.current = inputGainNode;

          const recordingDest = ctx.createMediaStreamDestination();
          recordingDestRef.current = recordingDest;

          source.connect(inputGainNode);
          inputGainNode.connect(recordingDest);

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          micAnalyserRef.current = analyser;
          inputGainNode.connect(analyser);

          setupLosslessRecorderNode(ctx, inputGainNode);
          
          setIsArmed(true);
          startMicMonitor();
        } catch (err) {
          console.error("Error changing audio input device:", err);
        }
      }, 100);
    }
  };

  const armMicrophone = async () => {
    if (isArmed) {
      disarmMicrophone();
      return;
    }
    recordingTargetSlotIdRef.current = selectedEditSlotId;
    try {
      const audioConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      };
      if (selectedAudioDevice) {
        audioConstraints.deviceId = { exact: selectedAudioDevice };
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints
      });
      streamRef.current = stream;
      
      await loadAudioInputDevices();
      
      if (!audioCtxRef.current) initAudio();
      const ctx = audioCtxRef.current;
      
      const source = ctx.createMediaStreamSource(stream);
      micSourceRef.current = source;

      // Create recording input gain node
      const inputGainNode = ctx.createGain();
      inputGainNode.gain.setValueAtTime(recordingInputGainRef.current, ctx.currentTime);
      micInputGainNodeRef.current = inputGainNode;

      // Create media stream destination node
      const recordingDest = ctx.createMediaStreamDestination();
      recordingDestRef.current = recordingDest;

      // Connect source -> inputGainNode -> recordingDest
      source.connect(inputGainNode);
      inputGainNode.connect(recordingDest);

      // Connect inputGainNode -> level analyser
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      micAnalyserRef.current = analyser;
      inputGainNode.connect(analyser);

      setupLosslessRecorderNode(ctx, inputGainNode);
      
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
    if (recordingScriptNodeRef.current) {
      try { recordingScriptNodeRef.current.disconnect(); } catch {}
      recordingScriptNodeRef.current = null;
    }
    if (recordingWorkletNodeRef.current) {
      try { recordingWorkletNodeRef.current.disconnect(); } catch {}
      recordingWorkletNodeRef.current = null;
    }
    if (micSourceRef.current) {
      try { micSourceRef.current.disconnect(); } catch {}
      micSourceRef.current = null;
    }
    if (micInputGainNodeRef.current) {
      try { micInputGainNodeRef.current.disconnect(); } catch {}
      micInputGainNodeRef.current = null;
    }
    if (analyserRef.current && resamplerGainNodeRef.current) {
      try { analyserRef.current.disconnect(resamplerGainNodeRef.current); } catch {}
    }
    if (resamplerGainNodeRef.current) {
      try { resamplerGainNodeRef.current.disconnect(); } catch {}
      resamplerGainNodeRef.current = null;
    }
    recordedChunksL.current = [];
    recordedChunksR.current = [];
    isRecordingRef.current = false;
    recordingDestRef.current = null;
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

  const normalizeBuffer = (buffer) => {
    const channels = buffer.numberOfChannels;
    const length = buffer.length;
    let maxVal = 0;
    
    // Find the absolute peak amplitude across all channels
    for (let c = 0; c < channels; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < length; i++) {
        const val = Math.abs(data[i]);
        if (val > maxVal) {
          maxVal = val;
        }
      }
    }
    
    // Scale the buffer so the peak is exactly 0.98
    if (maxVal > 0 && maxVal < 0.99) {
      const scale = 0.98 / maxVal;
      for (let c = 0; c < channels; c++) {
        const data = buffer.getChannelData(c);
        for (let i = 0; i < length; i++) {
          data[i] *= scale;
        }
      }
    }
  };

  const saveResampledAudio = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const chunksL = recordedChunksL.current;
    const chunksR = recordedChunksR.current;
    if (chunksL.length === 0) return;
    
    // Calculate total length
    let totalLength = 0;
    for (let i = 0; i < chunksL.length; i++) {
      totalLength += chunksL[i].length;
    }
    
    // Create new AudioBuffer
    const buffer = ctx.createBuffer(2, totalLength, ctx.sampleRate);
    const channelL = buffer.getChannelData(0);
    const channelR = buffer.getChannelData(1);
    
    // Copy data
    let offset = 0;
    for (let i = 0; i < chunksL.length; i++) {
      channelL.set(chunksL[i], offset);
      channelR.set(chunksR[i], offset);
      offset += chunksL[i].length;
    }
    
    // Normalize the buffer to 98% peak amplitude (lossless gain maximization)
    normalizeBuffer(buffer);
    
    let updatedSlot = null;
    const targetSlotId = recordingTargetSlotIdRef.current || selectedEditSlotId;
    const nextSlots = sampleSlotsRef.current.map(slot => {
      if (slot.id === targetSlotId) {
        const isBeatSynced = metronomeRef.current.isPlaying && manualRecBeatsRef.current > 0;
        updatedSlot = {
          ...slot,
          name: `${recordingInputMode === 'resample' ? 'Resample' : 'Rec'}: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
          buffer: buffer,
          revBuffer: getReversedBuffer(ctx, buffer),
          start: 0.0,
          end: 1.0,
          loopStart: 0.0,
          loopEnd: 1.0,
          ...(isBeatSynced ? { warpOn: true, warpBeats: manualRecBeatsRef.current } : {})
        };
        return updatedSlot;
      }
      return slot;
    });
    sampleSlotsRef.current = nextSlots;
    setSampleSlots(nextSlots);

    // Auto-save recorded/resampled audio to IndexedDB so it persists on reload!
    if (updatedSlot) {
      saveSampleToDb(updatedSlot)
        .then(() => {
          showEditorStatus(`Saved Lossless Resample to ${getSlotLabel(targetSlotId)}! 💾`);
        })
        .catch((e) => {
          console.error("Failed to auto-save resampled sample to DB:", e);
        });
    }
  };

  const startRecording = () => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    recordedChunksL.current = [];
    recordedChunksR.current = [];
    manualRecBeatsRef.current = 0;

    const isClickPlaying = metronomeRef.current.isPlaying;
    const useWorklet = recordingWorkletNodeRef.current !== null;

    if (isClickPlaying) {
      let nextBeatTime = metronomeRef.current.nextNoteTime;
      if (nextBeatTime < ctx.currentTime) {
        nextBeatTime = ctx.currentTime + 0.05;
      }
      manualRecStartTimeRef.current = nextBeatTime;
      manualRecPendingStartRef.current = true;
      setManualRecPendingStart(true);
      showEditorStatus("Record Armed: starting on next beat... ⏳");
      
      if (useWorklet) {
        recordingWorkletNodeRef.current.port.postMessage({
          type: 'ARM_START',
          startTime: nextBeatTime
        });
      }
    } else {
      if (!streamRef.current && recordingInputMode !== 'resample') {
        showEditorStatus("Arming input first... 🎤");
        const armFunc = recordingInputMode === 'mic' ? armMicrophone : armMonitor;
        armFunc()
          .then(() => {
            recordedChunksL.current = [];
            recordedChunksR.current = [];
            isRecordingRef.current = true;
            setIsRecording(true);
            showEditorStatus("Recording Started... ⏺️");
            
            if (useWorklet) {
              recordingWorkletNodeRef.current.port.postMessage({ type: 'START' });
            }
          })
          .catch(err => {
            console.error("Recording arm failed:", err);
          });
        return;
      }

      recordedChunksL.current = [];
      recordedChunksR.current = [];
      isRecordingRef.current = true;
      setIsRecording(true);
      showEditorStatus("Recording Started... ⏺️");
      
      if (useWorklet) {
        recordingWorkletNodeRef.current.port.postMessage({ type: 'START' });
      }
    }
  };

  const stopRecording = () => {
    const ctx = audioCtxRef.current;
    const isClickPlaying = metronomeRef.current.isPlaying;
    const useWorklet = recordingWorkletNodeRef.current !== null;

    if (isClickPlaying && isRecordingRef.current) {
      let nextBeatTime = metronomeRef.current.nextNoteTime;
      if (nextBeatTime < ctx.currentTime) {
        nextBeatTime = ctx.currentTime + 0.05;
      }
      manualRecStopTimeRef.current = nextBeatTime;
      manualRecPendingStopRef.current = true;
      setManualRecPendingStop(true);
      showEditorStatus("Record Stop Armed: stopping on next beat... ⏳");
      
      const bpm = paramsRef.current.arpBpm || 120;
      const beatDuration = 60 / bpm;
      const duration = nextBeatTime - manualRecStartTimeRef.current;
      manualRecBeatsRef.current = Math.max(1, Math.round(duration / beatDuration));

      if (useWorklet) {
        recordingWorkletNodeRef.current.port.postMessage({
          type: 'ARM_STOP',
          stopTime: nextBeatTime
        });
      }
    } else {
      isRecordingRef.current = false;
      setIsRecording(false);
      
      if (useWorklet) {
        recordingWorkletNodeRef.current.port.postMessage({ type: 'STOP' });
      } else {
        saveResampledAudio();
      }
    }
  };

  const armMonitor = async () => {
    if (isArmed) {
      disarmMicrophone();
      return;
    }
    recordingTargetSlotIdRef.current = selectedEditSlotId;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
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
      
      const source = ctx.createMediaStreamSource(stream);
      micSourceRef.current = source;

      // Create recording input gain node
      const inputGainNode = ctx.createGain();
      inputGainNode.gain.setValueAtTime(recordingInputGainRef.current, ctx.currentTime);
      micInputGainNodeRef.current = inputGainNode;

      // Create media stream destination node
      const recordingDest = ctx.createMediaStreamDestination();
      recordingDestRef.current = recordingDest;

      // Connect source -> inputGainNode -> recordingDest
      source.connect(inputGainNode);
      inputGainNode.connect(recordingDest);

      // Connect inputGainNode -> level analyser
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      micAnalyserRef.current = analyser;
      inputGainNode.connect(analyser);

      setupLosslessRecorderNode(ctx, inputGainNode);
      
      setIsArmed(true);
      startMicMonitor();
    } catch (err) {
      console.error("Error capturing browser tab audio:", err);
      alert("Screen audio capture failed or cancelled.");
    }
  };

    const armResampler = () => {
    if (isArmed) {
      disarmMicrophone();
      return;
    }
    
    let destInput = window.prompt("Enter destination slot to record to (e.g. A1-A8 or B1-B8):", selectedEditSlotId.toUpperCase());
    if (destInput === null) return; // User cancelled
    destInput = destInput.trim().toLowerCase();
    
    // Determine bank prefix: 'a' or 'b'
    let prefix = selectedEditSlotId[0]; // default to current bank
    if (destInput.startsWith('a')) {
      prefix = 'a';
    } else if (destInput.startsWith('b')) {
      prefix = 'b';
    }
    
    const match = destInput.match(/\d+/);
    if (!match) {
      alert("Invalid slot. Please enter a slot like A1-A8 or B1-B8.");
      return;
    }
    const slotNum = parseInt(match[0]);
    if (slotNum < 1 || slotNum > 8) {
      alert("Invalid slot number. Please enter a slot between 1 and 8 (e.g., A2 or B3).");
      return;
    }
    const targetSlotId = `${prefix}0${slotNum}`;
    setSelectedEditSlotId(targetSlotId);
    
    // Update active program oscillator routing to point to the new recorded slot
    if (prefix === 'a') {
      setParams(prev => ({ ...prev, oscAWave: targetSlotId }));
    } else {
      setParams(prev => ({ ...prev, oscBWave: targetSlotId }));
    }
    recordingTargetSlotIdRef.current = targetSlotId;
 
    try {
      if (!audioCtxRef.current) initAudio();
      const ctx = audioCtxRef.current;
 
      // Create resampler gain node to apply REC GAIN
      const resamplerGainNode = ctx.createGain();
      resamplerGainNode.gain.setValueAtTime(recordingInputGainRef.current, ctx.currentTime);
      resamplerGainNodeRef.current = resamplerGainNode;
 
      // Connect synth master output analyser to resamplerGainNode
      if (analyserRef.current) {
        analyserRef.current.connect(resamplerGainNode);
      }
 
      // Connect resamplerGainNode -> level analyser for visual feedback
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      micAnalyserRef.current = analyser;
      resamplerGainNode.connect(analyser);
 
      setupLosslessRecorderNode(ctx, resamplerGainNode);
 
      setIsArmed(true);
      startMicMonitor();
      showEditorStatus(`Resampler armed for ${prefix.toUpperCase()}${slotNum}! ⏺️`);
    } catch (err) {
      console.error("Error arming resampler:", err);
      alert("Resampler arming failed.");
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

  const handleSaveActiveSlotToDb = async () => {
    const slot = sampleSlots.find(s => s.id === selectedEditSlotId);
    if (!slot) return;
    
    if (!slot.buffer) {
      const activeNum = selectedEditSlotId.slice(2);
      const prefix = selectedEditSlotId[0];
      const bankLabel = prefix.toUpperCase();
      const clearInput = window.prompt(`Active slot is empty. Which slot would you like to clear from the browser database? Enter slot number (1-8):`, parseInt(activeNum).toString());
      if (clearInput === null) return;
      
      const cleanedInput = clearInput.replace(/[^0-9]/g, '');
      const targetNum = parseInt(cleanedInput);
      if (isNaN(targetNum) || targetNum < 1 || targetNum > 8) {
        alert("Invalid slot number. Must be between 1 and 8.");
        return;
      }
      
      const targetId = `${prefix}0${targetNum}`;
      const confirmClear = window.confirm(`Clear slot ${bankLabel}${targetNum} from the browser database?`);
      if (confirmClear) {
        try {
          await deleteSampleFromDb(targetId);
          setSampleSlots(prev => prev.map(s => {
            if (s.id === targetId) {
              return {
                ...s,
                name: `${bankLabel} Slot ${targetNum}`,
                buffer: null,
                revBuffer: null,
                start: 0.0,
                end: 1.0,
                loopStart: 0.0,
                loopEnd: 1.0
              };
            }
            return s;
          }));
          showEditorStatus(`Cleared ${bankLabel}${targetNum} from DB! 🗑️`);
        } catch (err) {
          console.error(err);
          alert('Failed to clear database record.');
        }
      }
      return;
    }
    
    const nameInput = window.prompt("Enter sample name:", slot.name);
    if (nameInput === null) return;
    const finalName = nameInput.trim() || slot.name;
    
    const activeLabel = getSlotLabel(selectedEditSlotId);
    const slotInput = window.prompt("Save to which slot? (e.g. A1-A8, B1-B8):", activeLabel);
    if (slotInput === null) return;
    
    const match = slotInput.trim().toUpperCase().match(/^([AB])([1-8])$/);
    if (!match) {
      alert("Invalid slot label. Must be e.g. A1-A8 or B1-B8.");
      return;
    }
    const targetBank = match[1].toLowerCase();
    const targetIdx = match[2];
    const targetId = `${targetBank}0${targetIdx}`;
    
    const targetSlotData = {
      ...slot,
      id: targetId,
      name: finalName.slice(0, 24)
    };
    
    try {
      await saveSampleToDb(targetSlotData);
      
      setSampleSlots(prev => {
        const next = prev.map(s => {
          if (s.id === targetId) {
            return {
              ...s,
              name: targetSlotData.name,
              buffer: slot.buffer,
              revBuffer: slot.revBuffer,
              rootNote: slot.rootNote,
              volume: slot.volume,
              sliceCount: slot.sliceCount,
              start: slot.start,
              end: slot.end,
              loopStart: slot.loopStart,
              loopEnd: slot.loopEnd,
              loopOn: slot.loopOn,
              reverseOn: slot.reverseOn,
              sliceParams: JSON.parse(JSON.stringify(slot.sliceParams))
            };
          }
          return s;
        });
        sampleSlotsRef.current = next;
        return next;
      });
      
      showEditorStatus(`Saved to ${slotInput.toUpperCase()}! 💾`);
    } catch (err) {
      console.error(err);
      alert('Failed to save to database. Make sure your browser supports IndexedDB.');
    }
  };

  const handleExportActiveSlotWav = () => {
    const slot = sampleSlots.find(s => s.id === selectedEditSlotId);
    if (!slot || !slot.buffer) return;
    
    try {
      const wavBlob = audioBufferToWav(slot.buffer);
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement('a');
      
      const cleanName = slot.name.replace(/[^a-zA-Z0-9 _-]/g, '').trim().substring(0, 30);
      const filename = `${getSlotLabel(slot.id)}_${cleanName || 'sample'}.wav`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showEditorStatus('Exported WAV! 📥');
    } catch (err) {
      console.error(err);
      alert('Failed to export sample as WAV.');
    }
  };

  const loadSavedBuffersIntoContext = async (ctx) => {
    try {
      const savedRecords = await loadSavedMetadata();
      if (savedRecords.length === 0) return;
      
      setSampleSlots(prev => {
        const nextSlots = prev.map(slot => {
          const saved = savedRecords.find(r => r.id === slot.id);
          if (saved && saved.channels && saved.channels.length > 0) {
            const numChannels = saved.channels.length;
            const length = saved.channels[0].length;
            const sampleRate = saved.sampleRate || ctx.sampleRate;
            try {
              const buffer = ctx.createBuffer(numChannels, length, sampleRate);
              for (let c = 0; c < numChannels; c++) {
                buffer.getChannelData(c).set(saved.channels[c]);
              }
              return {
                ...slot,
                buffer: buffer,
                revBuffer: getReversedBuffer(ctx, buffer)
              };
            } catch (err) {
              console.error(`Error reconstructing buffer for slot ${slot.id}:`, err);
            }
          }
          return slot;
        });
        sampleSlotsRef.current = nextSlots;
        return nextSlots;
      });
    } catch (err) {
      console.error("Failed to restore saved buffers: ", err);
    }
  };

  // On mount, load metadata (names and parameters) from IndexedDB
  useEffect(() => {
    const initLoad = async () => {
      try {
        const savedRecords = await loadSavedMetadata();
        if (savedRecords.length > 0) {
          setSampleSlots(prev => prev.map(slot => {
            const saved = savedRecords.find(r => r.id === slot.id);
            if (saved) {
              return {
                ...slot,
                name: saved.name,
                rootNote: saved.rootNote ?? slot.rootNote,
                volume: saved.volume ?? slot.volume,
                sliceCount: saved.sliceCount ?? slot.sliceCount,
                start: saved.start ?? slot.start,
                end: saved.end ?? slot.end,
                loopStart: saved.loopStart ?? slot.loopStart,
                loopEnd: saved.loopEnd ?? slot.loopEnd,
                loopOn: saved.loopOn ?? slot.loopOn,
                reverseOn: saved.reverseOn ?? slot.reverseOn,
                sliceParams: saved.sliceParams ?? slot.sliceParams,
                warpOn: saved.warpOn ?? slot.warpOn,
                warpBeats: saved.warpBeats ?? slot.warpBeats,
                pan: saved.pan ?? slot.pan,
                fxType: saved.fxType ?? slot.fxType,
                fxSend: saved.fxSend ?? slot.fxSend,
                routeToXyPad: saved.routeToXyPad ?? slot.routeToXyPad,
                tuning: saved.tuning ?? slot.tuning,
              };
            }
            return slot;
          }));
        }
      } catch (err) {
        console.error("Error loading saved sampler metadata: ", err);
      }
    };
    initLoad();
  }, []);

  // Handle audio input device enumeration and device changes on mount
  useEffect(() => {
    loadAudioInputDevices();
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      const handleDeviceChange = () => {
        loadAudioInputDevices();
      };
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, []);

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
        const computedBpm = Math.round((60000 / avgInterval) * 10) / 10;
        if (computedBpm >= 40 && computedBpm <= 250) {
          setParams(prev => ({ ...prev, arpBpm: computedBpm }));
        }
      }
      return next;
    });
  };

  const handleLoadEchoPreset = (presetIdx) => {
    if (presetIdx === '') {
      setSelectedEchoPresetIdx('');
      return;
    }
    const idx = parseInt(presetIdx, 10);
    const prst = ECHO_PRESETS[idx];
    if (!prst) return;
    setSelectedEchoPresetIdx(presetIdx);
    setParams(prev => {
      const next = { ...prev, ...prst.params };
      if (prev.spaceEchoActive !== next.spaceEchoActive && audioCtxRef.current) {
        rebuildDelayEffect(audioCtxRef.current, next.spaceEchoActive);
      }
      return next;
    });
    setSelectedDelayRatio('Free');
  };

  const handleLoadRotorPreset = (presetIdx) => {
    if (presetIdx === '') {
      setSelectedRotorPresetIdx('');
      return;
    }
    const idx = parseInt(presetIdx, 10);
    const prst = ROTOR_PRESETS[idx];
    if (!prst) return;
    setSelectedRotorPresetIdx(presetIdx);
    setParams(prev => ({ ...prev, ...prst.params }));
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
      // Issue 12: skip RAF when performance view is active — sampler canvas is not visible
      if (performanceViewActive) {
        samplerCanvasAnimIdRef.current = requestAnimationFrame(drawWaveform);
        return;
      }
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
        const sliceParam = slot.sliceParams?.[i] || {};
        const sliceStartNorm = sliceParam.start !== undefined ? sliceParam.start : (slot.start + (i / sliceCount) * (slot.end - slot.start));
        const sliceEndNorm = sliceParam.end !== undefined ? sliceParam.end : (slot.start + ((i + 1) / sliceCount) * (slot.end - slot.start));
        
        const sliceStartX = sliceStartNorm * canvas.width;
        const sliceEndX = sliceEndNorm * canvas.width;
        
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(sliceStartX, 0);
          ctx.lineTo(sliceStartX, canvas.height);
          ctx.stroke();
        }
        
        ctx.fillText((i + 1).toString(), (sliceStartX + sliceEndX) / 2, canvas.height - 4);
      }

      // Highlight the slice selected for editing
      const selSliceParam = slot.sliceParams?.[selectedSliceIndex] || {};
      const selStartNorm = selSliceParam.start !== undefined ? selSliceParam.start : (slot.start + (selectedSliceIndex / sliceCount) * (slot.end - slot.start));
      const selEndNorm = selSliceParam.end !== undefined ? selSliceParam.end : (slot.start + ((selectedSliceIndex + 1) / sliceCount) * (slot.end - slot.start));
      
      const selStartX = selStartNorm * canvas.width;
      const selWidth = (selEndNorm - selStartNorm) * canvas.width;
      
      ctx.fillStyle = 'rgba(0, 243, 255, 0.06)';
      ctx.fillRect(selStartX, 0, selWidth, canvas.height);
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.7)';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(selStartX, 0, selWidth, canvas.height);

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
                const vSliceParam = slot.sliceParams?.[sliceIndex] || {};
                const vStartNorm = vSliceParam.start !== undefined ? vSliceParam.start : (slot.start + (sliceIndex / sliceCount) * (slot.end - slot.start));
                const vEndNorm = vSliceParam.end !== undefined ? vSliceParam.end : (slot.start + ((sliceIndex + 1) / sliceCount) * (slot.end - slot.start));
                
                const vStartX = vStartNorm * canvas.width;
                const vWidth = (vEndNorm - vStartNorm) * canvas.width;
                
                ctx.fillStyle = 'rgba(255, 230, 0, 0.15)'; // yellow highlight for OSC A slice
                ctx.fillRect(vStartX, 0, vWidth, canvas.height);
              }
              if (isSlotB && paramsRef.current.oscBTriggerMode === 'slice') {
                const sliceIndex = ((voice.note - slot.rootNote) % sliceCount + sliceCount) % sliceCount;
                const vSliceParam = slot.sliceParams?.[sliceIndex] || {};
                const vStartNorm = vSliceParam.start !== undefined ? vSliceParam.start : (slot.start + (sliceIndex / sliceCount) * (slot.end - slot.start));
                const vEndNorm = vSliceParam.end !== undefined ? vSliceParam.end : (slot.start + ((sliceIndex + 1) / sliceCount) * (slot.end - slot.start));
                
                const vStartX = vStartNorm * canvas.width;
                const vWidth = (vEndNorm - vStartNorm) * canvas.width;
                
                ctx.fillStyle = 'rgba(255, 0, 255, 0.15)'; // magenta highlight for OSC B slice
                ctx.fillRect(vStartX, 0, vWidth, canvas.height);
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
                      playheadSec = loopStartSec + ((playheadSec - loopStartSec) % loopLen);
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
  const tapeStopFactorRef = useRef(1.0);
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

      // Update Leslie speed (treble and bass LFOs), drive, width, and crossover on both IFX slots
      const targetTreble = params.leslieSpeed === 'Fast' ? 7.25 : (params.leslieSpeed === 'Slow' ? 1.2 : 0);
      const targetBass = params.leslieSpeed === 'Fast' ? 6.0 : (params.leslieSpeed === 'Slow' ? 0.95 : 0);

      const driveVal = typeof params.leslieDrive === 'number' ? params.leslieDrive : 0.25;
      const widthVal = typeof params.leslieWidth === 'number' ? params.leslieWidth : 0.5;
      const crossoverVal = typeof params.leslieCrossover === 'number' ? params.leslieCrossover : 800;

      const updateLeslieNode = (fxNode) => {
        if (!fxNode) return;
        
        // Frequencies / Speed (horn has time constant 0.6s, drum has time constant 2.2s)
        if (fxNode.lfoTreble) {
          fxNode.lfoTreble.frequency.setTargetAtTime(targetTreble, now, 0.6);
        }
        if (fxNode.lfoBass) {
          fxNode.lfoBass.frequency.setTargetAtTime(targetBass, now, 2.2);
        }
        
        // Drive (distortion curve)
        if (fxNode.driveNode) {
          fxNode.driveNode.curve = makeDistCurve(driveVal * 0.45);
        }

        // Crossover split frequency
        if (fxNode.crossoverHP) {
          fxNode.crossoverHP.frequency.setTargetAtTime(crossoverVal, now, 0.05);
        }
        if (fxNode.crossoverLP) {
          fxNode.crossoverLP.frequency.setTargetAtTime(crossoverVal, now, 0.05);
        }

        // Width modulation depths
        if (fxNode.trebleLfoGainL && fxNode.trebleLfoGainR && fxNode.bassLfoGainL && fxNode.bassLfoGainR) {
          const targetTrebleMod = 0.0022 * widthVal;
          fxNode.trebleLfoGainL.gain.setTargetAtTime(targetTrebleMod, now, 0.05);
          fxNode.trebleLfoGainR.gain.setTargetAtTime(-targetTrebleMod, now, 0.05);

          const targetBassMod = 0.0012 * widthVal;
          fxNode.bassLfoGainL.gain.setTargetAtTime(targetBassMod, now, 0.05);
          fxNode.bassLfoGainR.gain.setTargetAtTime(-targetBassMod, now, 0.05);
        }

        // Tremolo depths
        if (fxNode.tremTrebleL && fxNode.tremTrebleR && fxNode.tremBassL && fxNode.tremBassR) {
          fxNode.tremTrebleL.gain.setTargetAtTime(0.3 * widthVal, now, 0.05);
          fxNode.tremTrebleR.gain.setTargetAtTime(-0.3 * widthVal, now, 0.05);
          fxNode.tremBassL.gain.setTargetAtTime(0.15 * widthVal, now, 0.05);
          fxNode.tremBassR.gain.setTargetAtTime(-0.15 * widthVal, now, 0.05);
        }
      };

      if (ifx1EffectRef.current) updateLeslieNode(ifx1EffectRef.current);
      if (ifx2EffectRef.current) updateLeslieNode(ifx2EffectRef.current);
      if (leslieEffectRef.current) updateLeslieNode(leslieEffectRef.current);
    }
  }, [params]);

  // Load Programs
  const handleSelectProgram = (idx) => {
    setSelectedProgIndex(idx);
    if (currentMode === 'PROG') {
      const prog = FACTORY_PROGRAMS[idx];
      setParams(prev => ({
        ...DEFAULT_PARAMS,
        ...prev,
        ...prog
      }));
      if (prog) {
        setSelectedEditSlotId(prog.oscAWave || 'a01');
      }
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

  const initAudio = async () => {
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

    const sendA1 = typeof paramsRef.current.mfx1SendA === 'number' && isFinite(paramsRef.current.mfx1SendA) ? paramsRef.current.mfx1SendA : 0;
    const sendB1 = typeof paramsRef.current.mfx1SendB === 'number' && isFinite(paramsRef.current.mfx1SendB) ? paramsRef.current.mfx1SendB : 0;
    const mfx1SendGain = ctx.createGain();
    mfx1SendGain.gain.setValueAtTime((sendA1 + sendB1) * 0.5, now);
    mfx1SendGainRef.current = mfx1SendGain;

    // MFX2 (Reverb)
    const mfx2 = createReverb(ctx);
    mfx2Ref.current = mfx2;
    const sendA2 = typeof paramsRef.current.mfx2SendA === 'number' && isFinite(paramsRef.current.mfx2SendA) ? paramsRef.current.mfx2SendA : 0;
    const sendB2 = typeof paramsRef.current.mfx2SendB === 'number' && isFinite(paramsRef.current.mfx2SendB) ? paramsRef.current.mfx2SendB : 0;
    const mfx2SendGain = ctx.createGain();
    mfx2SendGain.gain.setValueAtTime((sendA2 + sendB2) * 0.5, now);
    mfx2SendGainRef.current = mfx2SendGain;

    // Dedicated Leslie cabinet (for per-pad sends)
    leslieInputRef.current = ctx.createGain();
    leslieOutputRef.current = ctx.createGain();
    leslieOutputRef.current.connect(eqLow);
    leslieEffectRef.current = createLeslieCabinetNode(ctx, leslieInputRef.current, leslieOutputRef.current);

    // Tube Preamp Saturation
    const preampNode = ctx.createWaveShaper();
    preampNode.curve = makeDistCurve(paramsRef.current.preampDrive);
    preampNodeRef.current = preampNode;

    // Dub Siren oscillator & gain (sends to echo & master EQ)
    const dubSirenOsc = ctx.createOscillator();
    dubSirenOsc.type = 'square';
    const dubSirenGain = ctx.createGain();
    dubSirenGain.gain.setValueAtTime(0, now);
    dubSirenOsc.connect(dubSirenGain);
    dubSirenGain.connect(delayInputRef.current);
    dubSirenGain.connect(eqLow);
    dubSirenOsc.start(now);
    dubSirenOscRef.current = dubSirenOsc;
    dubSirenGainRef.current = dubSirenGain;

    // Formant Filter Bank (3 parallel bandpass filters)
    const formantInput = ctx.createGain();
    const formantOutput = ctx.createGain();
    const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.setValueAtTime(8, now);
    const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.setValueAtTime(8, now);
    const f3 = ctx.createBiquadFilter(); f3.type = 'bandpass'; f3.Q.setValueAtTime(8, now);
    formantInput.connect(f1);
    formantInput.connect(f2);
    formantInput.connect(f3);
    f1.connect(formantOutput);
    f2.connect(formantOutput);
    f3.connect(formantOutput);
    formantInputRef.current = formantInput;
    formantF1Ref.current = f1;
    formantF2Ref.current = f2;
    formantF3Ref.current = f3;

    const formantMixGain = ctx.createGain();
    formantMixGain.gain.setValueAtTime(0, now);
    formantMixGainRef.current = formantMixGain;
    formantOutput.connect(formantMixGain);

    const formantDryGain = ctx.createGain();
    formantDryGain.gain.setValueAtTime(1.0, now);
    formantDryGainRef.current = formantDryGain;

    // Issue 3: replaced ScriptProcessor bitcrusher with AudioWorklet — runs OFF main thread
    const bitcrusherInput = ctx.createGain();
    const bitcrusherOutput = ctx.createGain();

    // Inline AudioWorklet as Blob URL so no separate file is needed
    const bitcrusherCode = `
      class BitcrusherProcessor extends AudioWorkletProcessor {
        static get parameterDescriptors() {
          return [
            { name: 'bitDepth', defaultValue: 16, minValue: 1, maxValue: 16 },
            { name: 'sampleRateRatio', defaultValue: 1, minValue: 1, maxValue: 32 }
          ];
        }
        constructor() { super(); this._lastVal = 0; }
        process(inputs, outputs, parameters) {
          const input = inputs[0];
          const output = outputs[0];
          if (!input || !input[0]) return true;
          const inp = input[0];
          const out = output[0];
          const depth = parameters.bitDepth[0];
          const ratio = parameters.sampleRateRatio[0];
          const step = Math.pow(0.5, depth);
          for (let i = 0; i < inp.length; i++) {
            if (ratio <= 1.0) {
              let val = inp[i];
              if (depth < 16.0) val = Math.round(val / step) * step;
              out[i] = val;
            } else {
              if (i % Math.floor(ratio) === 0) {
                let val = inp[i];
                if (depth < 16.0) val = Math.round(val / step) * step;
                this._lastVal = val;
              }
              out[i] = this._lastVal;
            }
          }
          return true;
        }
      }
      registerProcessor('bitcrusher-processor', BitcrusherProcessor);
    `;
    const bitcrusherBlob = new Blob([bitcrusherCode], { type: 'application/javascript' });
    const bitcrusherBlobUrl = URL.createObjectURL(bitcrusherBlob);

    let bitcrusherNode;
    try {
      await ctx.audioWorklet.addModule(bitcrusherBlobUrl);
      bitcrusherNode = new AudioWorkletNode(ctx, 'bitcrusher-processor');
      // Expose parameter setters on the node for compatibility with existing update code
      bitcrusherNode._isBitcrusherWorklet = true;
      bitcrusherNode._blobUrl = bitcrusherBlobUrl;
    } catch (err) {
      // Fallback: keep ScriptProcessor if AudioWorklet unavailable
      console.warn('BitcrusherWorklet failed, falling back to ScriptProcessor:', err);
      URL.revokeObjectURL(bitcrusherBlobUrl);
      bitcrusherNode = ctx.createScriptProcessor(1024, 1, 1);
      bitcrusherNode.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const output = e.outputBuffer.getChannelData(0);
        const depth = bitDepthRef.current;
        const ratio = sampleRateRatioRef.current;
        const step = Math.pow(0.5, depth);
        let lastVal = 0;
        for (let i = 0; i < input.length; i++) {
          if (ratio <= 1.0) {
            let val = input[i];
            if (depth < 16.0) val = Math.round(val / step) * step;
            output[i] = val;
          } else {
            if (i % Math.floor(ratio) === 0) {
              let val = input[i];
              if (depth < 16.0) val = Math.round(val / step) * step;
              lastVal = val;
            }
            output[i] = lastVal;
          }
        }
      };
    }
    bitcrusherInput.connect(bitcrusherNode);
    bitcrusherNode.connect(bitcrusherOutput);
    bitcrusherInputRef.current = bitcrusherInput;
    bitcrusherOutputRef.current = bitcrusherOutput;
    bitcrusherNodeRef.current = bitcrusherNode;

    const bitcrusherMixGain = ctx.createGain();
    bitcrusherMixGain.gain.setValueAtTime(0, now);
    bitcrusherMixGainRef.current = bitcrusherMixGain;
    bitcrusherOutput.connect(bitcrusherMixGain);

    const bitcrusherDryGain = ctx.createGain();
    bitcrusherDryGain.gain.setValueAtTime(1.0, now);
    bitcrusherDryGainRef.current = bitcrusherDryGain;

    // Connections post-preamp
    ifx2OutputRef.current.connect(preampNode);

    // Crossfaded parallel effect routing splits post-preamp
    preampNode.connect(formantDryGain);
    formantDryGain.connect(bitcrusherDryGain);
    bitcrusherDryGain.connect(eqLow); // Clean dry path

    preampNode.connect(formantInput);
    formantMixGain.connect(eqLow); // Formant wet path

    preampNode.connect(bitcrusherInput);
    bitcrusherMixGain.connect(eqLow); // Bitcrusher wet path

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

    // Register Recorder AudioWorklet module
    const recorderCode = `
      class RecorderProcessor extends AudioWorkletProcessor {
        constructor() {
          super();
          this.isRecording = false;
          this.pendingStart = false;
          this.pendingStop = false;
          this.startTime = 0;
          this.stopTime = 0;
          this.totalSamplesLimit = 0;
          this.collectedSamples = 0;
          this.liveLoopMode = false;
          this.recordedL = [];
          this.recordedR = [];

          this.port.onmessage = (e) => {
            const msg = e.data;
            if (msg.type === 'START') {
              this.isRecording = true;
              this.pendingStart = false;
              this.pendingStop = false;
              this.recordedL = [];
              this.recordedR = [];
              this.collectedSamples = 0;
              this.totalSamplesLimit = 0;
              this.liveLoopMode = false;
            } else if (msg.type === 'STOP') {
              this.isRecording = false;
              this.pendingStart = false;
              this.pendingStop = false;
              this.sendBuffers();
            } else if (msg.type === 'ARM_START') {
              this.startTime = msg.startTime;
              this.pendingStart = true;
              this.liveLoopMode = false;
            } else if (msg.type === 'ARM_STOP') {
              this.stopTime = msg.stopTime;
              this.pendingStop = true;
            } else if (msg.type === 'ARM_LIVE_LOOP') {
              this.startTime = msg.startTime;
              this.totalSamplesLimit = msg.totalSamples;
              this.pendingStart = true;
              this.liveLoopMode = true;
              this.recordedL = [];
              this.recordedR = [];
              this.collectedSamples = 0;
            }
          };
        }

        sendBuffers() {
          let totalLen = 0;
          for (let i = 0; i < this.recordedL.length; i++) {
            totalLen += this.recordedL[i].length;
          }
          const bufferL = new Float32Array(totalLen);
          const bufferR = new Float32Array(totalLen);
          let offset = 0;
          for (let i = 0; i < this.recordedL.length; i++) {
            bufferL.set(this.recordedL[i], offset);
            bufferR.set(this.recordedR[i], offset);
            offset += this.recordedL[i].length;
          }
          this.port.postMessage({
            type: 'RECORDING_COMPLETE',
            bufferL,
            bufferR
          });
          this.recordedL = [];
          this.recordedR = [];
          this.collectedSamples = 0;
        }

        process(inputs, outputs, parameters) {
          const input = inputs[0];
          const output = outputs[0];
          if (!input || !input[0]) return true;

          const inputL = input[0];
          const inputR = input[1] || input[0];
          const length = inputL.length;

          if (output && output[0]) {
            output[0].fill(0);
            if (output[1]) output[1].fill(0);
          }

          const blockTime = currentTime;
          const sampleDuration = 1.0 / sampleRate;
          const blockEndTime = blockTime + length * sampleDuration;

          if (this.pendingStart) {
            if (blockTime <= this.startTime && this.startTime < blockEndTime) {
              const startOffset = Math.max(0, Math.min(length - 1, Math.round((this.startTime - blockTime) * sampleRate)));
              const countToCopy = length - startOffset;

              this.recordedL = [];
              this.recordedR = [];
              this.collectedSamples = 0;

              const sliceL = inputL.subarray(startOffset);
              const sliceR = inputR.subarray(startOffset);
              
              this.recordedL.push(new Float32Array(sliceL));
              this.recordedR.push(new Float32Array(sliceR));
              this.collectedSamples += countToCopy;

              this.isRecording = true;
              this.pendingStart = false;

              this.port.postMessage({ type: 'STARTED' });
            }
          } else if (this.isRecording) {
            if (this.pendingStop) {
              if (blockTime <= this.stopTime && this.stopTime < blockEndTime) {
                const stopOffset = Math.max(0, Math.min(length - 1, Math.round((this.stopTime - blockTime) * sampleRate)));
                
                if (stopOffset > 0) {
                  const sliceL = inputL.subarray(0, stopOffset);
                  const sliceR = inputR.subarray(0, stopOffset);
                  this.recordedL.push(new Float32Array(sliceL));
                  this.recordedR.push(new Float32Array(sliceR));
                  this.collectedSamples += stopOffset;
                }

                this.isRecording = false;
                this.pendingStop = false;
                this.port.postMessage({ type: 'STOPPED' });
                this.sendBuffers();
                return true;
              }
            }

            if (this.liveLoopMode) {
              const remaining = this.totalSamplesLimit - this.collectedSamples;
              if (remaining <= 0) {
                this.isRecording = false;
                this.port.postMessage({ type: 'STOPPED' });
                this.sendBuffers();
                return true;
              }

              if (length <= remaining) {
                this.recordedL.push(new Float32Array(inputL));
                this.recordedR.push(new Float32Array(inputR));
                this.collectedSamples += length;
                
                if (this.collectedSamples >= this.totalSamplesLimit) {
                  this.isRecording = false;
                  this.port.postMessage({ type: 'STOPPED' });
                  this.sendBuffers();
                }
              } else {
                const sliceL = inputL.subarray(0, remaining);
                const sliceR = inputR.subarray(0, remaining);
                this.recordedL.push(new Float32Array(sliceL));
                this.recordedR.push(new Float32Array(sliceR));
                this.collectedSamples += remaining;
                
                this.isRecording = false;
                this.port.postMessage({ type: 'STOPPED' });
                this.sendBuffers();
              }
            } else {
              this.recordedL.push(new Float32Array(inputL));
              this.recordedR.push(new Float32Array(inputR));
              this.collectedSamples += length;
            }
          }

          return true;
        }
      }
      registerProcessor('recorder-processor', RecorderProcessor);
    `;
    const recorderBlob = new Blob([recorderCode], { type: 'application/javascript' });
    const recorderBlobUrl = URL.createObjectURL(recorderBlob);
    try {
      await ctx.audioWorklet.addModule(recorderBlobUrl);
      recorderBlobUrlRef.current = recorderBlobUrl;
    } catch (err) {
      console.warn("Failed to load Recorder AudioWorklet module:", err);
      URL.revokeObjectURL(recorderBlobUrl);
    }

    // Register Scheduler AudioWorklet module
    const schedulerCode = `
      class SchedulerProcessor extends AudioWorkletProcessor {
        constructor() {
          super();
          this.port.onmessage = this.handleMessage.bind(this);
          
          // Metronome state
          this.metronomePlaying = false;
          this.metronomeNextTime = 0;
          this.metronomeBeatIndex = 0;
          this.bpm = 120;
          this.timeSignature = 4;
          
          // Arpeggiator state
          this.arpPlaying = false;
          this.arpNextTime = 0;
          this.arpStepIndex = 0;
          this.arpDivision = 8;
          
          // Playback state
          this.playbackActive = false;
          this.playbackStartTime = 0;
          this.playbackNextEventIdx = 0;
          this.sortedEvents = [];
          
          // Performance state
          this.perfStartTime = 0;
          this.perfRecordActive = false;
          this.quantizeMode = 'None';
          
          // Event queue for lookahead scheduling
          this.eventQueue = [];
        }

        handleMessage(e) {
          const msg = e.data;
          switch (msg.type) {
            case 'SET_PARAMS':
              if (msg.bpm !== undefined) this.bpm = msg.bpm;
              if (msg.timeSignature !== undefined) this.timeSignature = msg.timeSignature;
              if (msg.quantizeMode !== undefined) this.quantizeMode = msg.quantizeMode;
              if (msg.arpDivision !== undefined) this.arpDivision = msg.arpDivision;
              if (msg.perfStartTime !== undefined) this.perfStartTime = msg.perfStartTime;
              if (msg.perfRecordActive !== undefined) this.perfRecordActive = msg.perfRecordActive;
              break;
              
            case 'START_METRONOME':
              this.metronomePlaying = true;
              this.metronomeBeatIndex = 0;
              this.metronomeNextTime = msg.startTime;
              break;
              
            case 'STOP_METRONOME':
              this.metronomePlaying = false;
              break;
              
            case 'START_ARP':
              this.arpPlaying = true;
              this.arpStepIndex = 0;
              this.arpNextTime = msg.startTime;
              break;
              
            case 'STOP_ARP':
              this.arpPlaying = false;
              break;
              
            case 'START_PLAYBACK':
              this.playbackActive = true;
              this.playbackStartTime = msg.startTime;
              this.playbackStartBeatOffset = msg.startBeatOffset || 0.0;
              this.playbackNextEventIdx = 0;
              this.sortedEvents = msg.sortedEvents || [];
              while (this.playbackNextEventIdx < this.sortedEvents.length && 
                     this.sortedEvents[this.playbackNextEventIdx].beat < this.playbackStartBeatOffset) {
                this.playbackNextEventIdx++;
              }
              break;
              
            case 'UPDATE_EVENTS':
              this.sortedEvents = msg.sortedEvents || [];
              if (this.playbackActive) {
                const elapsed = currentTime - this.playbackStartTime;
                const currentBeat = elapsed / (60 / this.bpm) + this.playbackStartBeatOffset;
                this.playbackNextEventIdx = 0;
                while (this.playbackNextEventIdx < this.sortedEvents.length && 
                       this.sortedEvents[this.playbackNextEventIdx].beat < currentBeat) {
                  this.playbackNextEventIdx++;
                }
              }
              break;
              
            case 'STOP_PLAYBACK':
              this.playbackActive = false;
              break;
              
            case 'LIVE_TRIGGER':
              this.handleLiveTrigger(msg);
              break;
          }
        }

        handleLiveTrigger(msg) {
          const now = currentTime;
          const beatDuration = 60 / this.bpm;
          const shouldQuantize = msg.isNoteOn && this.perfRecordActive && this.quantizeMode !== 'None';
          
          let targetTime = now;
          let targetBeat = 0;
          
          if (this.perfStartTime > 0) {
            targetBeat = Math.max(0.0, (now - this.perfStartTime) / beatDuration);
          }
          
          if (shouldQuantize) {
            const elapsed = Math.max(0.0, now - this.perfStartTime);
            const currentBeat = elapsed / beatDuration;
            
            let gridSize = 1.0;
            if (this.quantizeMode === '1/128') gridSize = 0.03125;
            else if (this.quantizeMode === '1/64') gridSize = 0.0625;
            else if (this.quantizeMode === '1/32') gridSize = 0.125;
            else if (this.quantizeMode === '1/16') gridSize = 0.25;
            else if (this.quantizeMode === '1/8') gridSize = 0.5;
            else if (this.quantizeMode === '1/4') gridSize = 1.0;
            else if (this.quantizeMode === '1/2') gridSize = 2.0;
            else if (this.quantizeMode === 'Bar') gridSize = 4.0;
            
            const nextGridBeat = Math.ceil(currentBeat / gridSize) * gridSize;
            targetBeat = nextGridBeat;
            targetTime = this.perfStartTime + nextGridBeat * beatDuration;
          }
          
          const event = {
            type: msg.isNoteKey ? 'SCHEDULE_KEY' : 'SCHEDULE_PAD',
            targetTime: targetTime,
            beat: targetBeat,
            deck: msg.deck,
            index: msg.index,
            velocity: msg.velocity,
            isNoteOn: msg.isNoteOn,
            note: msg.note,
            shouldRecord: msg.shouldRecord
          };
          
          this.eventQueue.push(event);
        }

        process(inputs, outputs, parameters) {
          const now = currentTime;
          const lookahead = 0.05; // 50ms look-ahead buffer
          const beatDuration = 60 / this.bpm;
          
          // 1. Metronome clicks
          if (this.metronomePlaying) {
            if (this.metronomeNextTime < now - lookahead || this.metronomeNextTime > now + 2.0) {
              this.metronomeNextTime = now + 0.01;
            }
            while (this.metronomeNextTime < now + lookahead) {
              const isDownbeat = (this.metronomeBeatIndex % this.timeSignature === 0);
              this.port.postMessage({
                type: 'METRONOME_CLICK',
                time: this.metronomeNextTime,
                isDownbeat
              });
              this.metronomeNextTime += beatDuration;
              this.metronomeBeatIndex++;
            }
          }
          
          // 2. Arpeggiator ticks
          if (this.arpPlaying) {
            const stepDuration = beatDuration * (4 / this.arpDivision);
            if (this.arpNextTime < now - lookahead || this.arpNextTime > now + 2.0) {
              this.arpNextTime = now + 0.01;
            }
            while (this.arpNextTime < now + lookahead) {
              this.port.postMessage({
                type: 'ARP_TICK',
                time: this.arpNextTime,
                stepIndex: this.arpStepIndex
              });
              this.arpNextTime += stepDuration;
              this.arpStepIndex++;
            }
          }
          
          // 3. Performance playback events
          if (this.playbackActive && this.sortedEvents.length > 0) {
            const elapsed = now - this.playbackStartTime;
            const elapsedBeats = elapsed / beatDuration + this.playbackStartBeatOffset;
            const lookaheadBeats = lookahead / beatDuration;
            
            while (this.playbackNextEventIdx < this.sortedEvents.length) {
              const event = this.sortedEvents[this.playbackNextEventIdx];
              if (event.beat < elapsedBeats + lookaheadBeats) {
                const eventTime = this.playbackStartTime + (event.beat - this.playbackStartBeatOffset) * beatDuration;
                this.port.postMessage({
                  type: 'PLAYBACK_EVENT',
                  event: event,
                  time: eventTime
                });
                this.playbackNextEventIdx++;
              } else {
                break;
              }
            }
            
            // Handle playback loop wrap
            if (this.playbackNextEventIdx >= this.sortedEvents.length && this.sortedEvents.length > 0) {
              const lastEvent = this.sortedEvents[this.sortedEvents.length - 1];
              const endBeat = Math.ceil(lastEvent.beat / 4) * 4;
              if (elapsedBeats >= endBeat) {
                this.playbackStartTime = now;
                this.playbackStartBeatOffset = 0.0;
                this.playbackNextEventIdx = 0;
              }
            }
          }
          
          // 4. Lookahead queue events
          for (let i = this.eventQueue.length - 1; i >= 0; i--) {
            const event = this.eventQueue[i];
            if (event.targetTime < now + lookahead) {
              this.port.postMessage(event);
              this.eventQueue.splice(i, 1);
            }
          }
          
          return true;
        }
      }
      registerProcessor('scheduler-processor', SchedulerProcessor);
    `;
    const schedulerBlob = new Blob([schedulerCode], { type: 'application/javascript' });
    const schedulerBlobUrl = URL.createObjectURL(schedulerBlob);
    try {
      await ctx.audioWorklet.addModule(schedulerBlobUrl);
      const schedulerNode = new AudioWorkletNode(ctx, 'scheduler-processor');
      schedulerNode.connect(ctx.destination);
      
      schedulerNode.port.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'METRONOME_CLICK') {
          playMetronomeClick(ctx, msg.time, msg.isDownbeat);
          
          if (perfCountInActiveRef.current) {
            perfCountInRemainingRef.current--;
            setPerfCountInRemaining(perfCountInRemainingRef.current);
            
            if (perfCountInRemainingRef.current === 0) {
              const targetStartTime = msg.time;
              perfCountInActiveRef.current = false;
              setPerfCountInActive(false);
              
              const isDub = perfCountInIsDubRef.current;
              const bpm = paramsRef.current.arpBpm || 120;
              
              perfStartTimeRef.current = targetStartTime;
              setPerfRecordStartBpm(bpm);
              setPerfRecordActive(true);
              setPerfIsDubbing(isDub);
              
              if (schedulerNodeRef.current) {
                schedulerNodeRef.current.port.postMessage({
                  type: 'SET_PARAMS',
                  perfStartTime: targetStartTime,
                  perfRecordActive: true
                });
              }
              
              if (isDub) {
                setPerfPlaybackActive(true);
                perfPlayStartTimeRef.current = targetStartTime;
                seqStartBeatOffsetRef.current = 0.0;
                
                if (schedulerNodeRef.current) {
                  schedulerNodeRef.current.port.postMessage({
                    type: 'START_PLAYBACK',
                    startTime: targetStartTime,
                    startBeatOffset: 0.0,
                    sortedEvents: sortedPerfEventsRef.current
                  });
                }
                showEditorStatus("Overdub recording started! 🎙️");
              } else {
                showEditorStatus("Recording started! 🎙️");
              }
              
              if (!paramsRef.current.metronomeOn) {
                setTimeout(() => {
                  if (!perfCountInActiveRef.current && !paramsRef.current.metronomeOn) {
                    stopMetronome();
                  }
                }, 100);
              }
            }
          }
        } else if (msg.type === 'ARP_TICK') {
          handleArpTick(msg.time, msg.stepIndex);
        } else if (msg.type === 'PLAYBACK_EVENT') {
          triggerPerfPadDSP(
            msg.event.deck,
            msg.event.type,
            msg.event.index,
            msg.event.velocity,
            msg.event.isNoteOn,
            false,
            msg.time,
            msg.event.beat
          );
        } else if (msg.type === 'SCHEDULE_PAD') {
          triggerPerfPadDSP(
            msg.deck,
            msg.note, // note holds type
            msg.index,
            msg.velocity,
            msg.isNoteOn,
            msg.shouldRecord,
            msg.targetTime,
            msg.beat
          );
        }
      };
      
      schedulerNodeRef.current = schedulerNode;
    } catch (err) {
      console.warn("Failed to load Scheduler AudioWorklet module:", err);
      URL.revokeObjectURL(schedulerBlobUrl);
    }

    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    setSynthOn(true);
    startVisualizer();
    loadSavedBuffersIntoContext(ctx);
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

  const loadKitPreset = async (kitType, bankType) => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    showEditorStatus(`Generating ${kitType} Kit... ⏳`);
    try {
      const generatedSamples = generateSynthesizedKit(ctx, kitType);
      
      const nextSlots = sampleSlotsRef.current.map((slot) => {
        if (slot.id.startsWith(bankType)) {
          const idx = parseInt(slot.id.slice(1)) - 1;
          if (idx < generatedSamples.length) {
            const item = generatedSamples[idx];
            return {
              ...slot,
              name: item.name,
              buffer: item.buffer,
              revBuffer: getReversedBuffer(ctx, item.buffer),
              start: 0.0,
              end: 1.0,
              loopStart: 0.0,
              loopEnd: 1.0,
              loopOn: false,
              reverseOn: false,
              sliceCount: 16,
              sliceParams: Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false }))
            };
          }
        }
        return slot;
      });

      sampleSlotsRef.current = nextSlots;
      setSampleSlots(nextSlots);

      // Save to DB
      for (const slot of nextSlots) {
        if (slot.id.startsWith(bankType)) {
          await saveSampleToDb(slot);
        }
      }

      showEditorStatus(`Loaded ${kitType} Kit to Bank ${bankType.toUpperCase()}! 💾`);
    } catch (err) {
      console.error("Error loading kit preset:", err);
      showEditorStatus("Failed to generate kit preset.");
    }
  };

  const saveBankPreset = async (bankType, presetNum) => {
    if (!audioCtxRef.current) initAudio();
    
    const bankName = prompt(
      `Enter name for Bank ${bankType.toUpperCase()} Preset ${presetNum}:`,
      `User ${bankType.toUpperCase()} Preset ${presetNum}`
    );
    if (bankName === null) return; // cancelled
    
    showEditorStatus(`Saving Bank ${bankType.toUpperCase()} Preset ${presetNum}... ⏳`);
    try {
      const slotsToSave = sampleSlotsRef.current.filter(s => s.id.startsWith(bankType));
      
      const slotsData = [];
      for (const slot of slotsToSave) {
        let channels = null;
        let sampleRate = null;
        if (slot.buffer) {
          channels = [];
          for (let c = 0; c < slot.buffer.numberOfChannels; c++) {
            channels.push(slot.buffer.getChannelData(c).slice());
          }
          sampleRate = slot.buffer.sampleRate;
        }
        slotsData.push({
          id: slot.id,
          name: slot.name,
          rootNote: slot.rootNote,
          volume: slot.volume,
          sliceCount: slot.sliceCount,
          start: slot.start,
          end: slot.end,
          loopStart: slot.loopStart,
          loopEnd: slot.loopEnd,
          loopOn: slot.loopOn,
          reverseOn: slot.reverseOn,
          sliceParams: slot.sliceParams,
          warpOn: slot.warpOn,
          warpBeats: slot.warpBeats,
          pan: slot.pan,
          fxType: slot.fxType,
          fxSend: slot.fxSend,
          routeToXyPad: slot.routeToXyPad,
    tuning: slot.tuning,
          tuning: slot.tuning,
          channels: channels,
          sampleRate: sampleRate
        });
      }
      
      const record = {
        id: `bank_${bankType}_preset_${presetNum}`,
        bankType,
        presetNum,
        name: bankName || `User Bank ${bankType.toUpperCase()} Preset ${presetNum}`,
        slots: slotsData,
        timestamp: Date.now()
      };
      
      await saveBankToDb(record);
      showEditorStatus(`Bank ${bankType.toUpperCase()} Preset ${presetNum} Saved! 💾`);
    } catch (err) {
      console.error("Failed to save bank preset:", err);
      showEditorStatus("Error saving bank preset.");
    }
  };

  const clearBank = async (bankType) => {
    const confirmClear = confirm(`Are you sure you want to clear all samples in BANK ${bankType.toUpperCase()}? This will wipe the samples from the workstation, stop active playback, and clear database records.`);
    if (!confirmClear) return;

    // Stop active voices for this bank
    for (const k of activeVoicesRef.current.keys()) {
      if (typeof k === 'string' && k.startsWith(`perf-${bankType.toLowerCase()}`)) {
        stopPerfVoice(k);
      }
    }

    const nextSlots = sampleSlotsRef.current.map(slot => {
      if (slot.id.startsWith(bankType.toLowerCase())) {
        return {
          ...slot,
          name: 'EMPTY',
          buffer: null,
          revBuffer: null,
          rootNote: 60,
          volume: 0.8,
          sliceCount: 16,
          start: 0,
          end: 1.0,
          loopStart: 0,
          loopEnd: 1.0,
          loopOn: false,
          reverseOn: false,
          warpOn: false,
          warpBeats: 4,
          pan: 0.0,
          fxType: 'None',
          fxSend: 0.0,
          routeToXyPad: true,
          tuning: 0,
          sliceParams: Array.from({ length: 16 }, (_, i) => ({ start: i / 16, end: (i + 1) / 16, decay: 0.5, sustain: false }))
        };
      }
      return slot;
    });

    sampleSlotsRef.current = nextSlots;
    setSampleSlots(nextSlots);

    // Delete database records
    try {
      const bankSlots = sampleSlotsRef.current.filter(s => s.id.startsWith(bankType.toLowerCase()));
      for (const slot of bankSlots) {
        await deleteSampleFromDb(slot.id);
      }
      showEditorStatus(`Bank ${bankType.toUpperCase()} Cleared! 🗑️`);
    } catch (err) {
      console.error("Failed to clear database records for bank:", err);
      showEditorStatus("Error clearing bank database.");
    }
  };

  const loadBankPreset = async (bankType, presetNum) => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    showEditorStatus(`Loading Bank ${bankType.toUpperCase()} Preset ${presetNum}... ⏳`);
    try {
      const savedBank = await getSavedBankFromDb(`bank_${bankType}_preset_${presetNum}`);
      if (!savedBank) {
        const loadDefault = confirm(
          `Bank ${bankType.toUpperCase()} Preset ${presetNum} is empty. Would you like to load the factory default kit?`
        );
        if (loadDefault) {
          const defaultKit = bankType === 'a' ? 'DRUMS' : 'AMBIENT';
          await loadKitPreset(defaultKit, bankType);
        } else {
          showEditorStatus("Load cancelled.");
        }
        return;
      }
      
      const nextSlots = sampleSlotsRef.current.map(slot => {
        if (slot.id.startsWith(bankType)) {
          const savedSlot = savedBank.slots.find(s => s.id === slot.id);
          if (savedSlot) {
            let buffer = null;
            let revBuffer = null;
            if (savedSlot.channels && savedSlot.channels.length > 0) {
              const numChannels = savedSlot.channels.length;
              const length = savedSlot.channels[0].length;
              const sampleRate = savedSlot.sampleRate || ctx.sampleRate;
              try {
                buffer = ctx.createBuffer(numChannels, length, sampleRate);
                for (let c = 0; c < numChannels; c++) {
                  buffer.getChannelData(c).set(savedSlot.channels[c]);
                }
                revBuffer = getReversedBuffer(ctx, buffer);
              } catch (err) {
                console.error("Error recreating buffer for slot:", savedSlot.id, err);
              }
            }
            return {
              ...slot,
              name: savedSlot.name,
              buffer,
              revBuffer,
              rootNote: savedSlot.rootNote ?? slot.rootNote,
              volume: savedSlot.volume ?? slot.volume,
              sliceCount: savedSlot.sliceCount ?? slot.sliceCount,
              start: savedSlot.start ?? slot.start,
              end: savedSlot.end ?? slot.end,
              loopStart: savedSlot.loopStart ?? slot.loopStart,
              loopEnd: savedSlot.loopEnd ?? slot.loopEnd,
              loopOn: savedSlot.loopOn ?? slot.loopOn,
              reverseOn: savedSlot.reverseOn ?? slot.reverseOn,
              sliceParams: savedSlot.sliceParams ?? slot.sliceParams,
              warpOn: savedSlot.warpOn ?? slot.warpOn,
              warpBeats: savedSlot.warpBeats ?? slot.warpBeats,
              pan: savedSlot.pan ?? slot.pan,
              fxType: savedSlot.fxType ?? slot.fxType,
              fxSend: savedSlot.fxSend ?? slot.fxSend,
              routeToXyPad: savedSlot.routeToXyPad ?? slot.routeToXyPad,
              tuning: savedSlot.tuning ?? slot.tuning
            };
          }
        }
        return slot;
      });
      
      sampleSlotsRef.current = nextSlots;
      setSampleSlots(nextSlots);
      
      for (const slot of nextSlots) {
        if (slot.id.startsWith(bankType)) {
          await saveSampleToDb(slot);
        }
      }
      
      showEditorStatus(`Loaded Preset: ${savedBank.name}! 💾`);
    } catch (err) {
      console.error("Failed to load bank preset:", err);
      showEditorStatus("Error loading bank preset.");
    }
  };

  const createLeslieCabinetNode = (ctx, inputNode, outputNode) => {
    const now = ctx.currentTime;
    const crossoverVal = typeof paramsRef.current.leslieCrossover === 'number' ? paramsRef.current.leslieCrossover : 800;
    
    const crossoverHP = ctx.createBiquadFilter();
    crossoverHP.type = 'highpass';
    crossoverHP.frequency.setValueAtTime(crossoverVal, now);
    crossoverHP.Q.setValueAtTime(0.707, now);
    
    const crossoverLP = ctx.createBiquadFilter();
    crossoverLP.type = 'lowpass';
    crossoverLP.frequency.setValueAtTime(crossoverVal, now);
    crossoverLP.Q.setValueAtTime(0.707, now);

    const driveNode = ctx.createWaveShaper();
    const driveAmt = typeof paramsRef.current.leslieDrive === 'number' ? paramsRef.current.leslieDrive : 0.25;
    driveNode.curve = makeDistCurve(driveAmt * 0.45);

    inputNode.connect(driveNode);
    driveNode.connect(crossoverHP);
    driveNode.connect(crossoverLP);

    // --- Treble Horn ---
    const delayTrebleL = ctx.createDelay(1.0);
    const delayTrebleR = ctx.createDelay(1.0);
    delayTrebleL.delayTime.setValueAtTime(0.005, now);
    delayTrebleR.delayTime.setValueAtTime(0.005, now);

    const trebleSpeedHz = paramsRef.current.leslieSpeed === 'Fast' ? 7.25 : (paramsRef.current.leslieSpeed === 'Slow' ? 1.2 : 0);
    const lfoTreble = ctx.createOscillator();
    lfoTreble.type = 'sine';
    lfoTreble.frequency.setValueAtTime(trebleSpeedHz, now);

    const widthAmt = typeof paramsRef.current.leslieWidth === 'number' ? paramsRef.current.leslieWidth : 0.5;
    const trebleModDepth = 0.0022 * widthAmt;

    const trebleLfoGainL = ctx.createGain();
    trebleLfoGainL.gain.setValueAtTime(trebleModDepth, now);
    const trebleLfoGainR = ctx.createGain();
    trebleLfoGainR.gain.setValueAtTime(-trebleModDepth, now);

    lfoTreble.connect(trebleLfoGainL);
    trebleLfoGainL.connect(delayTrebleL.delayTime);
    lfoTreble.connect(trebleLfoGainR);
    trebleLfoGainR.connect(delayTrebleR.delayTime);

    const tremoloTrebleGainL = ctx.createGain();
    const tremoloTrebleGainR = ctx.createGain();
    tremoloTrebleGainL.gain.setValueAtTime(0.7, now);
    tremoloTrebleGainR.gain.setValueAtTime(0.7, now);

    const tremTrebleL = ctx.createGain();
    tremTrebleL.gain.setValueAtTime(0.3 * widthAmt, now);
    const tremTrebleR = ctx.createGain();
    tremTrebleR.gain.setValueAtTime(-0.3 * widthAmt, now);

    lfoTreble.connect(tremTrebleL);
    tremTrebleL.connect(tremoloTrebleGainL.gain);
    lfoTreble.connect(tremTrebleR);
    tremTrebleR.connect(tremoloTrebleGainR.gain);

    crossoverHP.connect(delayTrebleL);
    crossoverHP.connect(delayTrebleR);
    delayTrebleL.connect(tremoloTrebleGainL);
    delayTrebleR.connect(tremoloTrebleGainR);

    // --- Bass Drum ---
    const delayBassL = ctx.createDelay(1.0);
    const delayBassR = ctx.createDelay(1.0);
    delayBassL.delayTime.setValueAtTime(0.009, now);
    delayBassR.delayTime.setValueAtTime(0.009, now);

    const bassSpeedHz = paramsRef.current.leslieSpeed === 'Fast' ? 6.0 : (paramsRef.current.leslieSpeed === 'Slow' ? 0.95 : 0);
    const lfoBass = ctx.createOscillator();
    lfoBass.type = 'sine';
    lfoBass.frequency.setValueAtTime(bassSpeedHz, now);

    const bassModDepth = 0.0012 * widthAmt;

    const bassLfoGainL = ctx.createGain();
    bassLfoGainL.gain.setValueAtTime(bassModDepth, now);
    const bassLfoGainR = ctx.createGain();
    bassLfoGainR.gain.setValueAtTime(-bassModDepth, now);

    lfoBass.connect(bassLfoGainL);
    bassLfoGainL.connect(delayBassL.delayTime);
    lfoBass.connect(bassLfoGainR);
    bassLfoGainR.connect(delayBassR.delayTime);

    const tremoloBassGainL = ctx.createGain();
    const tremoloBassGainR = ctx.createGain();
    tremoloBassGainL.gain.setValueAtTime(0.85, now);
    tremoloBassGainR.gain.setValueAtTime(0.85, now);

    const tremBassL = ctx.createGain();
    tremBassL.gain.setValueAtTime(0.15 * widthAmt, now);
    const tremBassR = ctx.createGain();
    tremBassR.gain.setValueAtTime(-0.15 * widthAmt, now);

    lfoBass.connect(tremBassL);
    tremBassL.connect(tremoloBassGainL.gain);
    lfoBass.connect(tremBassR);
    tremBassR.connect(tremoloBassGainR.gain);

    crossoverLP.connect(delayBassL);
    crossoverLP.connect(delayBassR);
    delayBassL.connect(tremoloBassGainL);
    delayBassR.connect(tremoloBassGainR);

    lfoTreble.start(now);
    lfoBass.start(now);

    const merger = ctx.createChannelMerger(2);
    tremoloTrebleGainL.connect(merger, 0, 0);
    tremoloBassGainL.connect(merger, 0, 0);
    tremoloTrebleGainR.connect(merger, 0, 1);
    tremoloBassGainR.connect(merger, 0, 1);
    merger.connect(outputNode);

    return { 
      crossoverHP, crossoverLP, driveNode,
      delayTrebleL, delayTrebleR, lfoTreble, tremoloTrebleGainL, tremoloTrebleGainR, 
      delayBassL, delayBassR, lfoBass, tremoloBassGainL, tremoloBassGainR,
      trebleLfoGainL, trebleLfoGainR, tremTrebleL, tremTrebleR,
      bassLfoGainL, bassLfoGainR, tremBassL, tremBassR
    };
  };

  const connectIFXSlot = (ctx, slotNum, type, mix) => {
    const inputNode = slotNum === 1 ? ifx1InputRef.current : ifx2InputRef.current;
    const outputNode = slotNum === 1 ? ifx1OutputRef.current : ifx2OutputRef.current;
    if (!inputNode || !outputNode) return;

    try { inputNode.disconnect(); } catch {}

    const oldEffect = slotNum === 1 ? ifx1EffectRef.current : ifx2EffectRef.current;
    if (oldEffect) {
      if (oldEffect.lfo) { try { oldEffect.lfo.stop(); } catch {} }
      if (oldEffect.lfoTreble) { try { oldEffect.lfoTreble.stop(); } catch {} }
      if (oldEffect.lfoBass) { try { oldEffect.lfoBass.stop(); } catch {} }
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
      fxNode = createLeslieCabinetNode(ctx, inputNode, wetGain);
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

    // Reverb Freeze feedback path
    const fbHPF = ctx.createBiquadFilter();
    fbHPF.type = 'highpass';
    fbHPF.frequency.setValueAtTime(20, now);
    reverbHPFRef.current = fbHPF;

    const fbGain = ctx.createGain();
    fbGain.gain.setValueAtTime(0.0, now);
    reverbFeedbackGainRef.current = fbGain;

    // Connect feedback loop: convolver -> highpass filter -> feedback gain -> input
    convolver.connect(fbHPF);
    fbHPF.connect(fbGain);
    fbGain.connect(input);

    return { input, output };
  };

  const makeDistCurve = (amount) => {
    const k = typeof amount === 'number' ? amount * 100 : 50;
    const n_samples = 512; // 512 is sufficient precision for a waveshaper curve
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

        if (voice.stutterPannerNode) {
          voice.stutterPannerNode.pan.cancelScheduledValues(now);
          voice.stutterPannerNode.pan.setValueAtTime(0.0, now);
        }

        if (voice.filter1) {
          voice.filter1.frequency.cancelScheduledValues(now);
          voice.filter1.frequency.setValueAtTime(voice.baseCutoff || 1000, now);
        }
        if (voice.filter2) {
          voice.filter2.frequency.cancelScheduledValues(now);
          voice.filter2.frequency.setValueAtTime(voice.baseCutoff || 1000, now);
        }

        voice.stutterTimeoutId = null;
        voice.stutterLoopStart = undefined;
        voice.stutterLoopStartB = undefined;
        return;
      }

      let rate = currentParams.stutterRate || '1/16';
      const elapsed = ctx.currentTime - voice.startTime;
      const sweepDuration = currentParams.stutterSweepTime || 1.0;
      const progress = Math.min(1.0, elapsed / sweepDuration);

      if (currentParams.stutterSweepDir !== 'None') {
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

      // Apply Stutter Pattern Modulations
      let skipStep = false;
      const pattern = currentParams.stutterPattern || 'None';
      if (pattern === 'BouncingBall') {
        // Exponentially decrease step duration on each step to sound like a bouncing ball
        stepDur = stepDur * Math.pow(0.85, stepIndex);
      } else if (pattern === 'Swing') {
        // Shuffle alternate steps
        const swingRatio = 1.33;
        stepDur = (stepIndex % 2 === 0) ? (stepDur * 2 / (1 + swingRatio)) : (stepDur * 2 * swingRatio / (1 + swingRatio));
      } else if (pattern === 'RandomSkip') {
        // 30% chance to mute the step entirely for a glitch breakbeat feel
        if (Math.random() < 0.3) {
          skipStep = true;
        }
      }

      if (currentParams.stutterJitter > 0) {
        const jitterAmount = (Math.random() * 2 - 1) * currentParams.stutterJitter * 0.3 * stepDur;
        stepDur = Math.max(0.005, stepDur + jitterAmount);
      }

      const gateDur = stepDur * (currentParams.stutterGate !== undefined ? currentParams.stutterGate : 1.0);

      let pitchOffset = 0;
      if (currentParams.stutterPitchSweep !== 0) {
        pitchOffset = progress * currentParams.stutterPitchSweep;
      }

      const now = ctx.currentTime;

      // Gate the volume
      if (voice.stutterGateNode) {
        voice.stutterGateNode.gain.cancelScheduledValues(now);
        if (skipStep) {
          voice.stutterGateNode.gain.setValueAtTime(0, now);
        } else {
          voice.stutterGateNode.gain.setValueAtTime(0, now);
          voice.stutterGateNode.gain.linearRampToValueAtTime(1, now + 0.002);
          voice.stutterGateNode.gain.setValueAtTime(1, now + Math.max(0.003, gateDur - 0.002));
          voice.stutterGateNode.gain.linearRampToValueAtTime(0, now + gateDur);
        }
      }

      // Pan the voice
      if (voice.stutterPannerNode) {
        let panVal = 0.0;
        const panMode = currentParams.stutterPanMode || 'None';
        if (panMode === 'Alternating') {
          panVal = (stepIndex % 2 === 0) ? -0.85 : 0.85;
        } else if (panMode === 'LCR') {
          const lcrCycle = [-0.8, 0.0, 0.8, 0.0];
          panVal = lcrCycle[stepIndex % 4];
        } else if (panMode === 'Sine') {
          panVal = Math.sin(elapsed * Math.PI); // cycles every 2s
        }
        voice.stutterPannerNode.pan.cancelScheduledValues(now);
        voice.stutterPannerNode.pan.linearRampToValueAtTime(panVal, now + 0.005);
      }

      // Sweep filter cutoff
      if (currentParams.stutterFilterSweep && currentParams.stutterFilterSweep !== 0) {
        const filterOffset = progress * currentParams.stutterFilterSweep;
        const baseCutoff = voice.baseCutoff !== undefined ? voice.baseCutoff : 1000;
        const targetCutoff = Math.max(20, Math.min(20000, baseCutoff + filterOffset));
        
        if (voice.filter1) {
          voice.filter1.frequency.cancelScheduledValues(now);
          voice.filter1.frequency.linearRampToValueAtTime(targetCutoff, now + 0.005);
        }
        if (voice.filter2) {
          voice.filter2.frequency.cancelScheduledValues(now);
          voice.filter2.frequency.linearRampToValueAtTime(targetCutoff, now + 0.005);
        }
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
    
    const padPan = prog.perfPadPan !== undefined ? prog.perfPadPan : 0.0;
    const padFxType = prog.perfPadFxType || 'None';
    const padFxSend = prog.perfPadFxSend !== undefined ? prog.perfPadFxSend : 0.0;

    // Pitch bends
    const bendRange = 2; // +/- 2 semitones
    const pbFactor = Math.pow(2, (joystick.x * bendRange) / 12);
    
    // Ribbon cutoff modulation factor
    const cutoffMod = ribbonTouched ? (ribbonVal * 2000 - 1000) : 0;

    // Look up sampler slots to get correct root notes and buffers
    const slotAId = prog.oscAWave || 'a01';
    const slotA = sampleSlotsRef.current.find(s => s.id === slotAId) || sampleSlotsRef.current[0];
    const rootNoteA = slotA ? slotA.rootNote : 60;
    const rootFreqA = getFreq(rootNoteA);

    const slotBId = prog.oscBWave || 'b01';
    const slotB = sampleSlotsRef.current.find(s => s.id === slotBId) || sampleSlotsRef.current[1];
    const rootNoteB = slotB ? slotB.rootNote : 60;
    const rootFreqB = getFreq(rootNoteB);

    // Determine if we route to Delta XY Pad
    let routeToXyPad = true;
    if (prog.oscAVol > 0 && slotA && slotA.routeToXyPad === false) {
      routeToXyPad = false;
    }
    if (prog.oscBVol > 0 && slotB && slotB.routeToXyPad === false) {
      routeToXyPad = false;
    }

    // Apply Kaoss Modulations (if targeted to VCF cutoff/resonance and not bypassed)
    let kaossCutoffOffset = 0;
    let kaossResonanceOffset = 0;
    if (routeToXyPad) {
      if (kaossTargetX === 'cutoff') kaossCutoffOffset = (kaossPad.x * 3000 - 1500);
      if (kaossTargetY === 'resonance') kaossResonanceOffset = (kaossPad.y * 10);
    }

    const baseFreq = getFreq(note) * pbFactor;

    // Resolve slice environments and parameters for trigger modes
    let sliceEnvA = null;
    let slicePitchA = 0;
    let sliceStretchA = 0;
    let sliceLoopA = false;
    let sliceReverseA = false;
    let sliceSustainA = false;
    if (slotA && slotA.sliceParams && prog.oscATriggerMode === 'slice') {
      const sliceCountA = slotA.sliceCount || 16;
      const sliceIndexA = ((note - rootNoteA) % sliceCountA + sliceCountA) % sliceCountA;
      sliceEnvA = slotA.sliceParams[sliceIndexA] || { attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false };
      slicePitchA = sliceEnvA.pitch !== undefined ? sliceEnvA.pitch : 0;
      sliceStretchA = sliceEnvA.stretch !== undefined ? sliceEnvA.stretch : 0;
      sliceLoopA = sliceEnvA.loop !== undefined ? sliceEnvA.loop : false;
      sliceReverseA = sliceEnvA.reverse !== undefined ? sliceEnvA.reverse : false;
      sliceSustainA = sliceEnvA.sustain !== undefined ? sliceEnvA.sustain : false;
    }

    let sliceEnvB = null;
    let slicePitchB = 0;
    let sliceStretchB = 0;
    let sliceLoopB = false;
    let sliceReverseB = false;
    let sliceSustainB = false;
    if (slotB && slotB.sliceParams && prog.oscBTriggerMode === 'slice') {
      const sliceCountB = slotB.sliceCount || 16;
      const sliceIndexB = ((note - rootNoteB) % sliceCountB + sliceCountB) % sliceCountB;
      sliceEnvB = slotB.sliceParams[sliceIndexB] || { attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false };
      slicePitchB = sliceEnvB.pitch !== undefined ? sliceEnvB.pitch : 0;
      sliceStretchB = sliceEnvB.stretch !== undefined ? sliceEnvB.stretch : 0;
      sliceLoopB = sliceEnvB.loop !== undefined ? sliceEnvB.loop : false;
      sliceReverseB = sliceEnvB.reverse !== undefined ? sliceEnvB.reverse : false;
      sliceSustainB = sliceEnvB.sustain !== undefined ? sliceEnvB.sustain : false;
    }

    const isReverseA = prog.oscATriggerMode === 'slice' ? sliceReverseA : (slotA ? slotA.reverseOn : false);
    const isReverseB = prog.oscBTriggerMode === 'slice' ? sliceReverseB : (slotB ? slotB.reverseOn : false);

    const bufferA = slotA ? (isReverseA ? slotA.revBuffer : slotA.buffer) : null;
    const revBufferA = slotA ? slotA.revBuffer : null;
    const bufferB = slotB ? (isReverseB ? slotB.revBuffer : slotB.buffer) : null;
    const revBufferB = slotB ? slotB.revBuffer : null;

    const isLoopA = prog.oscATriggerMode === 'slice' ? (sliceLoopA || sliceSustainA) : (slotA ? slotA.loopOn : false);
    const isLoopB = prog.oscBTriggerMode === 'slice' ? (sliceLoopB || sliceSustainB) : (slotB ? slotB.loopOn : false);

    // Pre-calculate custom slice bounds and timings
    let sliceStartNormAPrecalc = 0;
    let sliceEndNormAPrecalc = 1;
    let sliceDurationAPrecalc = 0;
    let sliceStartOffsetAPrecalc = 0;
    if (slotA && bufferA && prog.oscATriggerMode === 'slice') {
      const sliceCountA = slotA.sliceCount || 16;
      const sliceIndexA = ((note - rootNoteA) % sliceCountA + sliceCountA) % sliceCountA;
      const sliceParam = slotA.sliceParams?.[sliceIndexA] || {};
      
      sliceStartNormAPrecalc = sliceParam.start !== undefined ? sliceParam.start : (slotA.start + (sliceIndexA / sliceCountA) * (slotA.end - slotA.start));
      sliceEndNormAPrecalc = sliceParam.end !== undefined ? sliceParam.end : (slotA.start + ((sliceIndexA + 1) / sliceCountA) * (slotA.end - slotA.start));
      
      sliceStartNormAPrecalc = Math.max(0, Math.min(1, sliceStartNormAPrecalc));
      sliceEndNormAPrecalc = Math.max(0, Math.min(1, sliceEndNormAPrecalc));
      if (sliceStartNormAPrecalc > sliceEndNormAPrecalc) {
        const tmp = sliceStartNormAPrecalc;
        sliceStartNormAPrecalc = sliceEndNormAPrecalc;
        sliceEndNormAPrecalc = tmp;
      }
      
      sliceDurationAPrecalc = (sliceEndNormAPrecalc - sliceStartNormAPrecalc) * bufferA.duration;
      if (isReverseA) {
        sliceStartOffsetAPrecalc = bufferA.duration - (sliceEndNormAPrecalc * bufferA.duration);
      } else {
        sliceStartOffsetAPrecalc = sliceStartNormAPrecalc * bufferA.duration;
      }
    }

    let sliceStartNormBPrecalc = 0;
    let sliceEndNormBPrecalc = 1;
    let sliceDurationBPrecalc = 0;
    let sliceStartOffsetBPrecalc = 0;
    if (slotB && bufferB && prog.oscBTriggerMode === 'slice') {
      const sliceCountB = slotB.sliceCount || 16;
      const sliceIndexB = ((note - rootNoteB) % sliceCountB + sliceCountB) % sliceCountB;
      const sliceParam = slotB.sliceParams?.[sliceIndexB] || {};
      
      sliceStartNormBPrecalc = sliceParam.start !== undefined ? sliceParam.start : (slotB.start + (sliceIndexB / sliceCountB) * (slotB.end - slotB.start));
      sliceEndNormBPrecalc = sliceParam.end !== undefined ? sliceParam.end : (slotB.start + ((sliceIndexB + 1) / sliceCountB) * (slotB.end - slotB.start));
      
      sliceStartNormBPrecalc = Math.max(0, Math.min(1, sliceStartNormBPrecalc));
      sliceEndNormBPrecalc = Math.max(0, Math.min(1, sliceEndNormBPrecalc));
      if (sliceStartNormBPrecalc > sliceEndNormBPrecalc) {
        const tmp = sliceStartNormBPrecalc;
        sliceStartNormBPrecalc = sliceEndNormBPrecalc;
        sliceEndNormBPrecalc = tmp;
      }
      
      sliceDurationBPrecalc = (sliceEndNormBPrecalc - sliceStartNormBPrecalc) * bufferB.duration;
      if (isReverseB) {
        sliceStartOffsetBPrecalc = bufferB.duration - (sliceEndNormBPrecalc * bufferB.duration);
      } else {
        sliceStartOffsetBPrecalc = sliceStartNormBPrecalc * bufferB.duration;
      }
    }

    const oscAOctave = prog.oscAOctave !== undefined ? prog.oscAOctave : 0;
    const oscAPitch = prog.oscAPitch !== undefined ? prog.oscAPitch : 0;
    const oscADetune = prog.oscADetune !== undefined ? prog.oscADetune : 0;

    const oscBOctave = prog.oscBOctave !== undefined ? prog.oscBOctave : 0;
    const oscBPitch = prog.oscBPitch !== undefined ? prog.oscBPitch : 0;
    const oscBDetune = prog.oscBDetune !== undefined ? prog.oscBDetune : 0;

    let freqScaleA = 1.0;
    let warpBaseRateA = 1.0;
    if (bufferA) {
      if (prog.oscATriggerMode === 'slice') {
        warpBaseRateA = Math.pow(2, oscAOctave) * Math.pow(2, oscAPitch / 12) * Math.pow(2, slicePitchA / 12);
      } else {
        const rootNoteA = slotA ? slotA.rootNote : 60;
        warpBaseRateA = Math.pow(2, (note - rootNoteA + oscAPitch + oscAOctave * 12) / 12) * pbFactor;
      }
      
      const isWarpedA = slotA && (slotA.warpOn || masterSyncActiveRef.current);
      if (isWarpedA) {
        const activeDurationA = bufferA.duration * (slotA.end - slotA.start);
        const bpm = prog.arpBpm || 120;
        const targetDuration = (60 / bpm) * (slotA.warpBeats || 4);
        const warpFactor = activeDurationA / targetDuration;
        freqScaleA = warpFactor * warpBaseRateA;
      } else {
        freqScaleA = warpBaseRateA;
      }
    }

    let freqScaleB = 1.0;
    let warpBaseRateB = 1.0;
    if (bufferB) {
      if (prog.oscBTriggerMode === 'slice') {
        warpBaseRateB = Math.pow(2, oscBOctave) * Math.pow(2, oscBPitch / 12) * Math.pow(2, slicePitchB / 12);
      } else {
        const rootNoteB = slotB ? slotB.rootNote : 60;
        warpBaseRateB = Math.pow(2, (note - rootNoteB + oscBPitch + oscBOctave * 12) / 12) * pbFactor;
      }
      
      const isWarpedB = slotB && (slotB.warpOn || masterSyncActiveRef.current);
      if (isWarpedB) {
        const activeDurationB = bufferB.duration * (slotB.end - slotB.start);
        const bpm = prog.arpBpm || 120;
        const targetDuration = (60 / bpm) * (slotB.warpBeats || 4);
        const warpFactor = activeDurationB / targetDuration;
        freqScaleB = warpFactor * warpBaseRateB;
      } else {
        freqScaleB = warpBaseRateB;
      }
    }

    // Apply Deck Pitch Fader scaling for performance voices
    let pitchFactorA = 1.0;
    let pitchFactorB = 1.0;
    if (voiceKey && typeof voiceKey === 'string' && voiceKey.startsWith('perf-')) {
      if (voiceKey.includes('perf-a')) {
        pitchFactorA = 1.0 + (deckAPitchRef.current / 100);
      } else if (voiceKey.includes('perf-b')) {
        pitchFactorB = 1.0 + (deckBPitchRef.current / 100);
      }
    }
    freqScaleA *= pitchFactorA;
    freqScaleB *= pitchFactorB;

    // --- VCF Dual Filter ---
    const filter1 = ctx.createBiquadFilter();
    const filter2 = ctx.createBiquadFilter();

    filter1.type = (prog.filterType === 'bypass') ? 'allpass' : (prog.filterType || 'lowpass');
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
      granularTimerId: null, releasedRef, trackIdx,
      base_oscA_rate: freqScaleA / pitchFactorA,
      base_oscB_rate: freqScaleB / pitchFactorB,
      orig_oscA_rate: freqScaleA,
      orig_oscA_L_rate: freqScaleA,
      orig_oscA_R_rate: freqScaleA,
      orig_oscB_rate: freqScaleB,
      orig_oscB_L_rate: freqScaleB,
      orig_oscB_R_rate: freqScaleB,
      
      // Warp fields
      warpOnA: slotA ? (!!slotA.warpOn || masterSyncActiveRef.current) : false,
      warpBeatsA: slotA ? (slotA.warpBeats || 4) : 4,
      activeDurationA: slotA && bufferA ? bufferA.duration * (slotA.end - slotA.start) : 0,
      warpBaseRateA: warpBaseRateA,
      
      warpOnB: slotB ? (!!slotB.warpOn || masterSyncActiveRef.current) : false,
      warpBeatsB: slotB ? (slotB.warpBeats || 4) : 4,
      activeDurationB: slotB && bufferB ? bufferB.duration * (slotB.end - slotB.start) : 0,
      warpBaseRateB: warpBaseRateB,

      isReverseA: isReverseA,
      isReverseB: isReverseB
    };

    // isSliceGranular must be hoisted outside if(bufferA) — it's used in the panner block after that inner if closes
    const isSliceGranular = !prog.granularActive && (prog.oscATriggerMode === 'slice' && sliceStretchA !== 0);
    const isWarpedGranularA = !!(slotA && bufferA && (slotA.warpOn || masterSyncActiveRef.current) && (slotA.tuning || 0) !== 0 && prog.oscATriggerMode !== 'slice');
    const isWarpedGranularB = !!(slotB && bufferB && (slotB.warpOn || masterSyncActiveRef.current) && (slotB.tuning || 0) !== 0 && prog.oscBTriggerMode !== 'slice');

    if (prog.granularActive || (prog.oscATriggerMode === 'slice' && sliceStretchA !== 0 && bufferA) || isWarpedGranularA) {
      // --- Granular Synthesis Engine ---
      if (bufferA) {
        
        let playhead;
        let startOffsetA = 0;
        let endOffsetA = bufferA.duration;
        let isLoopA = false;
        let useReverseA = false;
        let sliceDurationA = 0;
        
        if (isSliceGranular) {
          sliceDurationA = sliceDurationAPrecalc;
          startOffsetA = sliceStartOffsetAPrecalc;
          endOffsetA = startOffsetA + sliceDurationA;
          playhead = startOffsetA;
          isLoopA = sliceLoopA;
          useReverseA = isReverseA;
        } else if (isWarpedGranularA) {
          useReverseA = !!slotA.reverseOn;
          startOffsetA = useReverseA 
            ? (1.0 - slotA.end) * bufferA.duration 
            : slotA.start * bufferA.duration;
          endOffsetA = useReverseA 
            ? (1.0 - slotA.start) * bufferA.duration 
            : slotA.end * bufferA.duration;
          playhead = startOffsetA;
          isLoopA = !!slotA.loopOn;
        } else {
          playhead = (prog.grainPosition !== undefined ? prog.grainPosition : 0.0) * bufferA.duration;
          isLoopA = true;
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

          let gSize, gRate;
          if (isSliceGranular) {
            // Serato-style time-stretch: grain size 80-120ms, hop = 25% of grain (4 grains overlapping)
            // Clamped to at most the full slice duration to avoid reading beyond boundaries
            gSize = Math.min(Math.max(0.08, sliceDurationA * 0.5), 0.12);
            gRate = gSize * 0.25;
          } else {
            gSize = (prog.grainSize !== undefined ? prog.grainSize : 100) / 1000;
            gRate = (prog.grainRate !== undefined ? prog.grainRate : 40) / 1000;
          }

          if (nextGrainTime < ctxNow + lookahead) {
            const drift = (ctxNow + lookahead) - nextGrainTime;
            // Playhead speed: for slice stretch, 1/(1+stretch) — stretch=0 → 1.0 (normal), stretch=1 → 0.5 (half speed = 2× longer)
            const playheadSpeed = isSliceGranular ? (1.0 / Math.max(0.05, 1.0 + sliceStretchA)) : (isWarpedGranularA ? freqScaleA : (prog.grainSpeed !== undefined ? prog.grainSpeed : 1.0));
            playhead += drift * playheadSpeed;
            nextGrainTime = ctxNow + lookahead;
          }

          while (nextGrainTime < ctxNow + lookahead + 0.1) {
            if ((isSliceGranular || isWarpedGranularA) && !isLoopA && !sliceSustainA && playhead >= endOffsetA) {
              break; 
            }

            const grainSource = ctx.createBufferSource();
            const isReverse = isSliceGranular ? isReverseA : (isWarpedGranularA ? useReverseA : (prog.grainReverse || false));
            grainSource.buffer = isReverse ? currentRevBuf : currentBuf;

            const spray = isSliceGranular ? 0 : ((prog.grainSpray !== undefined ? prog.grainSpray : 0.05) * (Math.random() * 2 - 1));
            let grainStart = playhead + spray;
            if (grainStart < 0) grainStart = 0;
            if (grainStart >= currentBuf.duration) grainStart = currentBuf.duration - 0.01;

            const startOffset = (isReverse && !isSliceGranular) ? (currentBuf.duration - grainStart - gSize) : grainStart;
            const clampedStartOffset = Math.max(0, Math.min(currentBuf.duration - 0.005, startOffset));

            // CRITICAL: For slice time-stretch, grain playback rate = pitch shift ONLY (1.0 base).
            // The tempo/duration change is controlled purely by the playhead advance speed above.
            // For standard granular mode, use baseFreq ratio as before.
            let grainPlaybackRate;
            if (isSliceGranular) {
              // Pitch offset from slice pitch param + OSC A pitch + detune, base rate = 1.0 (no pitch from note)
              grainPlaybackRate = Math.pow(2, (slicePitchA + oscAPitch + oscAOctave * 12) / 12) * Math.pow(2, oscADetune / 1200);
            } else if (isWarpedGranularA) {
              // Lock speed to warpFactor and pitch shift by tuning semitones
              grainPlaybackRate = freqScaleA * Math.pow(2, (slotA.tuning || 0) / 12);
            } else {
              grainPlaybackRate = (baseFreq / rootFreqA) * Math.pow(2, oscADetune / 1200);
            }

            const detuneCents = isSliceGranular ? 0 : ((prog.grainPitchRandom !== undefined ? prog.grainPitchRandom : 0) * (Math.random() * 2 - 1));

            let stutterPitchOffset = 0;
            if (paramsRef.current.stutterOn && paramsRef.current.stutterPitchSweep !== 0) {
              const elapsed = nextGrainTime - voiceObj.startTime;
              const sweepDuration = paramsRef.current.stutterSweepTime || 1.0;
              const progress = Math.min(1.0, elapsed / sweepDuration);
              stutterPitchOffset = progress * paramsRef.current.stutterPitchSweep;
            }

            grainSource.playbackRate.setValueAtTime(
              grainPlaybackRate * Math.pow(2, (detuneCents + stutterPitchOffset * 100) / 1200),
              nextGrainTime
            );

            if (vibratoLfoGain && !isSliceGranular) {
              const vScale = ctx.createGain();
              vScale.gain.setValueAtTime(1 / rootFreqA, nextGrainTime);
              vibratoLfoGain.connect(vScale);
              vScale.connect(grainSource.playbackRate);
            }
            if (driftGain && !isSliceGranular) {
              const dScale = ctx.createGain();
              dScale.gain.setValueAtTime(1 / 1200, nextGrainTime);
              driftGain.connect(dScale);
              dScale.connect(grainSource.playbackRate);
            }

            // Raised-cosine envelope (Hann-like): peak at 50% of grain, zero at boundaries
            // Eliminates inter-grain clicks without costly AudioParam scheduling loops
            const grainGain = ctx.createGain();
            grainGain.gain.setValueAtTime(0, nextGrainTime);
            grainGain.gain.linearRampToValueAtTime(1.0, nextGrainTime + gSize * 0.5);
            grainGain.gain.linearRampToValueAtTime(0.0, nextGrainTime + gSize);


            grainSource.connect(grainGain);
            grainGain.connect(gainA);

            grainSource.start(nextGrainTime, clampedStartOffset, gSize);
            grainSource.stop(nextGrainTime + gSize + 0.01);

            // Advance playhead at the correct time-stretched speed
            const playheadSpeed = isSliceGranular
              ? (1.0 / Math.max(0.05, 1.0 + sliceStretchA))
              : (isWarpedGranularA ? freqScaleA : (prog.grainSpeed !== undefined ? prog.grainSpeed : 1.0));
            playhead += gRate * playheadSpeed;

            if (isSliceGranular || isWarpedGranularA) {
              if (isLoopA) {
                if (playhead >= endOffsetA) {
                  const loopLen = endOffsetA - startOffsetA;
                  playhead = startOffsetA + ((playhead - startOffsetA) % Math.max(0.01, loopLen));
                }
              } else if (sliceSustainA && isSliceGranular) {
                if (playhead >= endOffsetA) {
                  const sustainLength = Math.min(0.05, (endOffsetA - startOffsetA) * 0.2);
                  const sustainStart = endOffsetA - sustainLength;
                  playhead = sustainStart + ((playhead - sustainStart) % sustainLength);
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
          const stopFactor = tapeStopFactorRef.current;
          oscA = ctx.createBufferSource();
          oscA.buffer = bufferA;
          oscA.playbackRate.setValueAtTime(freqScaleA * stopFactor, now);
          oscA.detune.setValueAtTime(prog.oscADetune, now);

          oscA_L = ctx.createBufferSource();
          oscA_L.buffer = bufferA;
          oscA_L.playbackRate.setValueAtTime(freqScaleA * stopFactor, now);
          oscA_L.detune.setValueAtTime(prog.oscADetune - prog.unisonDetune, now);

          oscA_R = ctx.createBufferSource();
          oscA_R.buffer = bufferA;
          oscA_R.playbackRate.setValueAtTime(freqScaleA * stopFactor, now);
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
              if (sliceSustainA) {
                loopEndA = sliceStartOffsetAPrecalc + sliceDurationAPrecalc;
                loopStartA = loopEndA - Math.min(0.05, sliceDurationAPrecalc * 0.2);
              } else {
                loopStartA = sliceStartOffsetAPrecalc;
                loopEndA = loopStartA + sliceDurationAPrecalc;
              }
            } else {
              loopStartA = (1.0 - slotA.loopEnd) * bufferA.duration;
              loopEndA = (1.0 - slotA.loopStart) * bufferA.duration;
            }
          } else {
            loopStartA = slotA.loopStart * bufferA.duration;
            loopEndA = slotA.loopEnd * bufferA.duration;
            if (isSliceA) {
              if (sliceSustainA) {
                loopEndA = sliceStartOffsetAPrecalc + sliceDurationAPrecalc;
                loopStartA = loopEndA - Math.min(0.05, sliceDurationAPrecalc * 0.2);
              } else {
                loopStartA = sliceStartOffsetAPrecalc;
                loopEndA = loopStartA + sliceDurationAPrecalc;
              }
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
          const stopFactor = tapeStopFactorRef.current;
          oscA = ctx.createBufferSource();
          oscA.buffer = bufferA;
          oscA.playbackRate.setValueAtTime(freqScaleA * stopFactor, now);
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
              if (sliceSustainA) {
                loopEndA = sliceStartOffsetAPrecalc + sliceDurationAPrecalc;
                loopStartA = loopEndA - Math.min(0.05, sliceDurationAPrecalc * 0.2);
              } else {
                loopStartA = sliceStartOffsetAPrecalc;
                loopEndA = loopStartA + sliceDurationAPrecalc;
              }
            } else {
              loopStartA = (1.0 - slotA.loopEnd) * bufferA.duration;
              loopEndA = (1.0 - slotA.loopStart) * bufferA.duration;
            }
          } else {
            loopStartA = slotA.loopStart * bufferA.duration;
            loopEndA = slotA.loopEnd * bufferA.duration;
            if (isSliceA) {
              if (sliceSustainA) {
                loopEndA = sliceStartOffsetAPrecalc + sliceDurationAPrecalc;
                loopStartA = loopEndA - Math.min(0.05, sliceDurationAPrecalc * 0.2);
              } else {
                loopStartA = sliceStartOffsetAPrecalc;
                loopEndA = loopStartA + sliceDurationAPrecalc;
              }
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

      if (isSliceGranularB || isWarpedGranularB) {
        // --- OSC B Granular Synthesis for Time-Stretching / Tuning ---
        let startOffsetB = 0;
        let endOffsetB = bufferB.duration;
        let isLoopB = false;
        let useReverseB = false;
        let playhead;

        if (isSliceGranularB) {
          sliceDurationB = sliceDurationBPrecalc;
          startOffsetB = sliceStartOffsetBPrecalc;
          endOffsetB = startOffsetB + sliceDurationB;
          playhead = startOffsetB;
          isLoopB = sliceLoopB;
          useReverseB = isReverseB;
        } else {
          useReverseB = !!slotB.reverseOn;
          startOffsetB = useReverseB 
            ? (1.0 - slotB.end) * bufferB.duration 
            : slotB.start * bufferB.duration;
          endOffsetB = useReverseB 
            ? (1.0 - slotB.start) * bufferB.duration 
            : slotB.end * bufferB.duration;
          playhead = startOffsetB;
          isLoopB = !!slotB.loopOn;
        }

        const lookahead = 0.05; // 50ms lookahead to ensure Web Audio scheduling is always in the future
        let nextGrainTime = now + lookahead;

        const scheduleGrainB = () => {
          if (releasedRef.current) return;
          const currentSlot = sampleSlotsRef.current.find(s => s.id === slotBId) || sampleSlotsRef.current[1];
          const currentBuf = currentSlot ? currentSlot.buffer : null;
          const currentRevBuf = currentSlot ? currentSlot.revBuffer : null;
          if (!currentBuf) return;

          const ctxNow = ctx.currentTime;

          // Serato-style time-stretch: grain size 80-120ms, hop = 25% (4 grains overlapping)
          const gSize = isSliceGranularB ? Math.min(Math.max(0.08, sliceDurationB * 0.5), 0.12) : 0.1;
          const gRate = gSize * 0.25;

          if (nextGrainTime < ctxNow + lookahead) {
            const drift = (ctxNow + lookahead) - nextGrainTime;
            const playheadSpeed = isSliceGranularB ? (1.0 / Math.max(0.05, 1.0 + sliceStretchB)) : freqScaleB;
            playhead += drift * playheadSpeed;
            nextGrainTime = ctxNow + lookahead;
          }

          while (nextGrainTime < ctxNow + lookahead + 0.1) {
            if ((isSliceGranularB || isWarpedGranularB) && !isLoopB && !sliceSustainB && playhead >= endOffsetB) {
              break;
            }

            const grainSource = ctx.createBufferSource();
            const isRevB = isSliceGranularB ? isReverseB : (isWarpedGranularB ? useReverseB : false);
grainSource.buffer = isRevB && currentRevBuf ? currentRevBuf : currentBuf;

            let grainStart = playhead;
            if (grainStart < 0) grainStart = 0;
            if (grainStart >= currentBuf.duration) grainStart = currentBuf.duration - 0.01;

            const clampedStartOffset = Math.max(0, Math.min(currentBuf.duration - 0.005, grainStart));

            // Grain playback rate = pitch-only (base 1.0) — tempo controlled by playhead speed
            let grainPlaybackRateB = 1.0;
            if (isSliceGranularB) {
              grainPlaybackRateB = Math.pow(2, (slicePitchB + oscBPitch + oscBOctave * 12) / 12) * Math.pow(2, oscBDetune / 1200);
            } else if (isWarpedGranularB) {
              grainPlaybackRateB = freqScaleB * Math.pow(2, (slotB.tuning || 0) / 12);
            }

            let stutterPitchOffset = 0;
            if (paramsRef.current.stutterOn && paramsRef.current.stutterPitchSweep !== 0) {
              const elapsed = nextGrainTime - voiceObj.startTime;
              const sweepDuration = paramsRef.current.stutterSweepTime || 1.0;
              const progress = Math.min(1.0, elapsed / sweepDuration);
              stutterPitchOffset = progress * paramsRef.current.stutterPitchSweep;
            }

            grainSource.playbackRate.setValueAtTime(
              grainPlaybackRateB * Math.pow(2, (stutterPitchOffset * 100) / 1200),
              nextGrainTime
            );

            // Raised-cosine (Hann-like) envelope for click-free grain transitions
            const grainGain = ctx.createGain();
            grainGain.gain.setValueAtTime(0, nextGrainTime);
            grainGain.gain.linearRampToValueAtTime(1.0, nextGrainTime + gSize * 0.5);
            grainGain.gain.linearRampToValueAtTime(0.0, nextGrainTime + gSize);

            grainSource.connect(grainGain);
            grainGain.connect(gainB);

            grainSource.start(nextGrainTime, clampedStartOffset, gSize);
            grainSource.stop(nextGrainTime + gSize + 0.01);

            // Advance playhead at time-stretched speed (independent of pitch)
            const playheadSpeed = isSliceGranularB ? (1.0 / Math.max(0.05, 1.0 + sliceStretchB)) : freqScaleB;
            playhead += gRate * playheadSpeed;

            if (sliceLoopB) {
              if (playhead >= sliceEndSecB) {
                playhead = startOffsetB + ((playhead - startOffsetB) % sliceDurationB);
              }
            } else if (sliceSustainB) {
              if (playhead >= sliceEndSecB) {
                const sustainLength = Math.min(0.05, sliceDurationB * 0.2);
                const sustainStart = sliceEndSecB - sustainLength;
                playhead = sustainStart + ((playhead - sustainStart) % sustainLength);
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
        const stopFactor = tapeStopFactorRef.current;
        oscB = ctx.createBufferSource();
        oscB.buffer = bufferB;
        oscB.playbackRate.setValueAtTime(freqScaleB * stopFactor, now);
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
            if (sliceSustainB) {
              loopEndB = sliceStartOffsetBPrecalc + sliceDurationBPrecalc;
              loopStartB = loopEndB - Math.min(0.05, sliceDurationBPrecalc * 0.2);
            } else {
              loopStartB = sliceStartOffsetBPrecalc;
              loopEndB = loopStartB + sliceDurationBPrecalc;
            }
          } else {
            loopStartB = (1.0 - slotB.loopEnd) * bufferB.duration;
            loopEndB = (1.0 - slotB.loopStart) * bufferB.duration;
          }
        } else {
          loopStartB = slotB.loopStart * bufferB.duration;
          loopEndB = slotB.loopEnd * bufferB.duration;
          if (isSliceB) {
            if (sliceSustainB) {
              loopEndB = sliceStartOffsetBPrecalc + sliceDurationBPrecalc;
              loopStartB = loopEndB - Math.min(0.05, sliceDurationBPrecalc * 0.2);
            } else {
              loopStartB = sliceStartOffsetBPrecalc;
              loopEndB = loopStartB + sliceDurationBPrecalc;
            }
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
    let initialVolume = 1.0;
    if (voiceKey && typeof voiceKey === 'string' && voiceKey.startsWith('perf-')) {
      const isDeckA = voiceKey.includes('perf-a');
      const faderVol = isDeckA ? deckAVolFaderRef.current : deckBVolFaderRef.current;
      const x = crossfaderValRef.current;
      let cfGain = 1.0;
      if (isDeckA) {
        if (x > 0) {
          cfGain = Math.cos(x * Math.PI / 2);
        }
      } else {
        if (x < 0) {
          cfGain = Math.cos(x * Math.PI / 2);
        }
      }
      initialVolume = faderVol * cfGain;
    }
    voiceOutGain.gain.setValueAtTime(initialVolume, now);

    const stutterGateNode = ctx.createGain();
    stutterGateNode.gain.setValueAtTime(1.0, now);

    const stutterPannerNode = ctx.createStereoPanner();
    stutterPannerNode.pan.setValueAtTime(0.0, now);

    const padPannerNode = ctx.createStereoPanner();
    padPannerNode.pan.setValueAtTime(padPan, now);

    if (prog.filterMode === 'Double Series') {
      filter1.connect(filter2);
      filter2.connect(stutterGateNode);
    } else {
      filter1.connect(stutterGateNode);
    }
    stutterGateNode.connect(stutterPannerNode);
    stutterPannerNode.connect(padPannerNode);
    
    if (voiceKey && typeof voiceKey === 'string' && voiceKey.startsWith('perf-')) {
      const isDeckA = voiceKey.includes('perf-a');
      const now = ctx.currentTime;
      
      const vEqLow = ctx.createBiquadFilter();
      vEqLow.type = 'lowshelf';
      vEqLow.frequency.setValueAtTime(200, now);
      const initialLow = isDeckA ? deckAEqLowValRef.current : deckBEqLowValRef.current;
      vEqLow.gain.setValueAtTime(initialLow < 0 ? initialLow * 26.0 : initialLow * 6.0, now);
      
      const vEqMid = ctx.createBiquadFilter();
      vEqMid.type = 'peaking';
      vEqMid.Q.setValueAtTime(1.0, now);
      vEqMid.frequency.setValueAtTime(1000, now);
      const initialMid = isDeckA ? deckAEqMidValRef.current : deckBEqMidValRef.current;
      vEqMid.gain.setValueAtTime(initialMid < 0 ? initialMid * 26.0 : initialMid * 6.0, now);

      const vEqHigh = ctx.createBiquadFilter();
      vEqHigh.type = 'highshelf';
      vEqHigh.frequency.setValueAtTime(5000, now);
      const initialHigh = isDeckA ? deckAEqHighValRef.current : deckBEqHighValRef.current;
      vEqHigh.gain.setValueAtTime(initialHigh < 0 ? initialHigh * 26.0 : initialHigh * 6.0, now);

      padPannerNode.connect(vEqLow);
      vEqLow.connect(vEqMid);
      vEqMid.connect(vEqHigh);
      vEqHigh.connect(voiceOutGain);
      
      voiceObj.eqLowNode = vEqLow;
      voiceObj.eqMidNode = vEqMid;
      voiceObj.eqHighNode = vEqHigh;
    } else {
      padPannerNode.connect(voiceOutGain);
    }

    if (padFxType !== 'None' && padFxSend > 0) {
      const sendGainNode = ctx.createGain();
      sendGainNode.gain.setValueAtTime(padFxSend, now);
      padPannerNode.connect(sendGainNode);

      if (padFxType === 'Space Echo' && delayInputRef.current) {
        sendGainNode.connect(delayInputRef.current);
      } else if (padFxType === 'Reverb' && mfx2Ref.current && mfx2Ref.current.input) {
        sendGainNode.connect(mfx2Ref.current.input);
      } else if (padFxType === 'Rotor Cabinet' && leslieInputRef.current) {
        sendGainNode.connect(leslieInputRef.current);
      }
      
      voiceObj.sendGainNode = sendGainNode;
    }


    if (routeToXyPad && ifx1InputRef.current) {
      voiceOutGain.connect(ifx1InputRef.current);
      voiceObj.routeToXyPad = true;
    } else if (masterEqLowRef.current) {
      voiceOutGain.connect(masterEqLowRef.current);
      voiceObj.routeToXyPad = false;
    } else {
      voiceOutGain.connect(masterGainRef.current);
      voiceObj.routeToXyPad = false;
    }

    // Resolve slice environments and playback durations for slice trigger modes
    let dPlayA = 0;
    if (bufferA) {
      if (prog.oscATriggerMode === 'slice') {
        dPlayA = Math.max(0.01, (sliceDurationAPrecalc * (1 + sliceStretchA)) / freqScaleA);
      } else {
        const activeDurationA = (slotA.end - slotA.start) * bufferA.duration;
        dPlayA = Math.max(0.01, activeDurationA / freqScaleA);
      }
    }

    let dPlayB = 0;
    if (bufferB) {
      if (prog.oscBTriggerMode === 'slice') {
        dPlayB = Math.max(0.01, (sliceDurationBPrecalc * (1 + sliceStretchB)) / freqScaleB);
      } else {
        const activeDurationB = (slotB.end - slotB.start) * bufferB.duration;
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
        // Only clamp attack/decay to dPlayA for standard (non-stretched) slice playback.
        // When granular time-stretch is active the grain windows handle their own decay —
        // clamping gainA here would silence the grains before they're audible.
        const isGranularStretch = sliceStretchA !== 0;
        if (!isLoopA && !isGranularStretch) {
          if (att >= dPlayA) {
            att = dPlayA * 0.1;
          }
          const maxDec = dPlayA - att;
          if (dec > maxDec) {
            dec = Math.max(0.005, maxDec - 0.003);
          }
        }
        const aTimeA = now + att;

        gainA.gain.setValueAtTime(0, now);
        gainA.gain.linearRampToValueAtTime(vcaEnvAmt * gainAVol, aTimeA);
        // For granular stretch: sustain open (grains fade themselves), only close on note release.
        // For standard slices, use an exponential decay (release curve) instead of linear gate close.
        if (!isLoopA && !isGranularStretch) {
          gainA.gain.setTargetAtTime(0, aTimeA, dec / 4);
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

        [gainA_L, gainA_R].forEach(gNode => {
          gNode.gain.setValueAtTime(0, now);
          gNode.gain.linearRampToValueAtTime(vcaEnvAmt * gainAVol * 0.65, aTimeA);
          if (!isLoopA) {
            gNode.gain.setTargetAtTime(0, aTimeA, dec / 4);
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

        gainB.gain.setValueAtTime(0, now);
        gainB.gain.linearRampToValueAtTime(vcaEnvAmt * gainBVol, aTimeB);
        if (!isLoopB) {
          gainB.gain.setTargetAtTime(0, aTimeB, dec / 4);
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
        startOffsetA = sliceStartOffsetAPrecalc;
        durationToPlayA = sliceDurationAPrecalc;
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
        startOffsetB = sliceStartOffsetBPrecalc;
        durationToPlayB = sliceDurationBPrecalc;
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
    voiceObj.stutterPannerNode = stutterPannerNode;
    voiceObj.filter1 = filter1;
    voiceObj.filter2 = filter2;
    voiceObj.baseCutoff = baseCutoff;
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
  };

  const playVoice = (note, velocity) => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (paramsRef.current.arpOn) {
      if (!heldNotesRef.current.includes(note)) {
        heldNotesRef.current.push(note);
      }
      startArpeggiator();
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.add(note);
        return next;
      });
      return;
    }

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

  const releaseVoice = (voice) => {
    if (!audioCtxRef.current || !voice) return;
    const now = audioCtxRef.current.currentTime;
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
          if (oscA) { try { oscA.stop(); } catch {} }
          if (oscB) { try { oscB.stop(); } catch {} }
          if (oscA_L) { try { oscA_L.stop(); } catch {} }
          if (oscA_R) { try { oscA_R.stop(); } catch {} }
          if (subOsc) { try { subOsc.stop(); } catch {} }
          if (noiseSource) { try { noiseSource.stop(); } catch {} }
          if (driftLfo) { try { driftLfo.stop(); } catch {} }
          if (lfo1) { try { lfo1.stop(); } catch {} }
          if (lfo2) { try { lfo2.stop(); } catch {} }

          // Explicitly disconnect all voice-level nodes to release audio thread memory
          const nodesToDisconnect = [
            oscA, oscB, oscA_L, oscA_R, subOsc, noiseSource, driftLfo, lfo1, lfo2,
            voice.gainA, voice.gainB, voice.gainA_L, voice.gainA_R, voice.subGain, voice.noiseGain,
            voice.vibratoLfoGain, voice.filterLfoGain,
            voice.filter1, voice.filter2,
            voice.eqLowNode, voice.eqMidNode, voice.eqHighNode,
            voice.sendGainNode,
            voice.voiceOutGain
          ];

          nodesToDisconnect.forEach(node => {
            if (node && typeof node.disconnect === 'function') {
              try { node.disconnect(); } catch {}
            }
          });
        } catch {}
      }, (releaseTime + 0.1) * 1000);
    } catch (err) {
      console.warn('Error releasing voice nodes:', err);
    }
  };

  const stopVoice = (note) => {
    if (!audioCtxRef.current) return;

    if (paramsRef.current.arpOn) {
      heldNotesRef.current = heldNotesRef.current.filter(n => n !== note);
      if (heldNotesRef.current.length === 0) {
        stopArpeggiator();
      }
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      return;
    }

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

  const stopPerfVoice = (voiceKey) => {
    if (!audioCtxRef.current) return;
    const voices = activeVoicesRef.current.get(voiceKey);
    if (voices) {
      voices.forEach(releaseVoice);
      activeVoicesRef.current.delete(voiceKey);
    }
  };

  const toggleSlotLoop = (slotId, e) => {
    if (e) e.stopPropagation();
    setSampleSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        const nextLoop = !s.loopOn;
        const updated = { ...s, loopOn: nextLoop };
        saveSampleToDb(updated).catch(err => console.error("Failed to auto-save loop setting to IndexedDB:", err));
        showEditorStatus(`${getSlotLabel(slotId)} Play Mode: ${nextLoop ? 'LOOP' : 'ONE-SHOT'} 🔄`);
        return updated;
      }
      return s;
    }));
  };

  const handlePadRightClick = (e, deck, index) => {
    e.preventDefault();
    setPadMenuState({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      deck,
      index
    });
  };

  const triggerPerfPadInternal = (deck, type, index, velocity, isNoteOn, shouldRecord = false) => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (schedulerNodeRef.current) {
      schedulerNodeRef.current.port.postMessage({
        type: 'LIVE_TRIGGER',
        deck,
        index,
        velocity,
        isNoteOn,
        isNoteKey: false,
        shouldRecord,
        note: type // store the type ('slot' or 'slice') inside note
      });
    } else {
      // Fallback
      triggerPerfPadDSP(deck, type, index, velocity, isNoteOn, shouldRecord, ctx.currentTime, 0);
    }
  };

  const triggerPerfPadDSP = (deck, type, index, velocity, isNoteOn, shouldRecord, targetTime, targetBeat) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;

    const voiceKey = `perf-${deck.toLowerCase()}-${type}-${index}`;
    const padKey = `${deck}-${type}-${index}`;

    if (!isNoteOn) {
      stopPerfVoice(voiceKey);
      setActivePerfPads(prev => {
        const next = { ...prev };
        delete next[padKey];
        delete next[`${padKey}-pending`];
        return next;
      });
      
      if (shouldRecord && perfRecordActiveRef.current) {
        perfEventsRef.current.push({ beat: targetBeat, deck, type, index, velocity, isNoteOn: false });
      }
      return;
    }

    stopPerfVoice(voiceKey);

    // Solo Mode logic: Cut out all other pads on the active deck
    if (deck === 'A' && deckASoloActiveRef.current) {
      for (let i = 0; i < 8; i++) {
        if (type !== 'slot' || i !== index) {
          stopPerfVoice(`perf-a-slot-${i}`);
        }
        if (type !== 'slice' || i !== index) {
          stopPerfVoice(`perf-a-slice-${i}`);
        }
      }
      setActivePerfPads(prev => {
        const next = { ...prev };
        for (let i = 0; i < 8; i++) {
          if (type !== 'slot' || i !== index) {
            delete next[`A-slot-${i}`];
            delete next[`A-slot-${i}-pending`];
          }
          if (type !== 'slice' || i !== index) {
            delete next[`A-slice-${i}`];
            delete next[`A-slice-${i}-pending`];
          }
        }
        return next;
      });
    } else if (deck === 'B' && deckBSoloActiveRef.current) {
      for (let i = 0; i < 8; i++) {
        if (type !== 'slot' || i !== index) {
          stopPerfVoice(`perf-b-slot-${i}`);
        }
        if (type !== 'slice' || i !== index) {
          stopPerfVoice(`perf-b-slice-${i}`);
        }
      }
      setActivePerfPads(prev => {
        const next = { ...prev };
        for (let i = 0; i < 8; i++) {
          if (type !== 'slot' || i !== index) {
            delete next[`B-slot-${i}`];
            delete next[`B-slot-${i}-pending`];
          }
          if (type !== 'slice' || i !== index) {
            delete next[`B-slice-${i}`];
            delete next[`B-slice-${i}-pending`];
          }
        }
        return next;
      });
    }

    const currentParams = paramsRef.current;
    let slotId = '';
    
    if (type === 'slot') {
      slotId = (deck === 'A' ? 'a0' : 'b0') + (index + 1);
    } else {
      slotId = deck === 'A' ? currentParams.oscAWave : currentParams.oscBWave;
    }

    const slot = sampleSlotsRef.current.find(s => s.id === slotId);
    if (!slot || !slot.buffer) return;

    const rootNote = slot.rootNote || 60;
    const triggerNote = type === 'slot' ? rootNote : rootNote + index;

    // Use double mode but mute opposite channel to mix separately
    const tempProg = {
      ...currentParams,
      oscMode: 'double',
      oscAWave: deck === 'A' ? slotId : currentParams.oscAWave,
      oscBWave: deck === 'B' ? slotId : currentParams.oscBWave,
      oscATriggerMode: type === 'slice' ? 'slice' : 'normal',
      oscBTriggerMode: type === 'slice' ? 'slice' : 'normal',
      oscAVol: deck === 'A' ? currentParams.oscAVol : 0,
      oscBVol: deck === 'B' ? currentParams.oscBVol : 0,
      perfPadPan: slot ? (slot.pan !== undefined ? slot.pan : 0) : 0,
      perfPadFxType: slot ? (slot.fxType || 'None') : 'None',
      perfPadFxSend: slot ? (slot.fxSend !== undefined ? slot.fxSend : 0) : 0
    };

    const delayOffset = Math.max(0, targetTime - now);

    const startVoiceTrigger = () => {
      const voice = playProgramVoice(ctx, triggerNote, velocity, tempProg, voiceKey, delayOffset);
      activeVoicesRef.current.set(voiceKey, [voice]);
      setActivePerfPads(prev => ({ ...prev, [padKey]: true }));

      if (deck === 'A') {
        setDeckAPlaying(true);
        if (deckATimerRef.current) clearTimeout(deckATimerRef.current);
        const dur = slot.buffer.duration * (slot.end - slot.start);
        deckATimerRef.current = setTimeout(() => setDeckAPlaying(false), dur * 1000);
      } else {
        setDeckBPlaying(true);
        if (deckBTimerRef.current) clearTimeout(deckBTimerRef.current);
        const dur = slot.buffer.duration * (slot.end - slot.start);
        deckBTimerRef.current = setTimeout(() => setDeckBPlaying(false), dur * 1000);
      }
    };

    if (delayOffset > 0.03) {
      setActivePerfPads(prev => ({ ...prev, [`${padKey}-pending`]: true }));
      setTimeout(() => {
        setActivePerfPads(prev => {
          const next = { ...prev };
          delete next[`${padKey}-pending`];
          return next;
        });
        startVoiceTrigger();
      }, delayOffset * 1000 - 15); // Trigger slightly before target time to avoid JS task queue lag
    } else {
      startVoiceTrigger();
    }

    if (shouldRecord && perfRecordActiveRef.current) {
      perfEventsRef.current.push({ beat: targetBeat, deck, type, index, velocity, isNoteOn: true });
    }
  };

  const togglePerformanceRecord = (isDub = false) => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    if (perfRecordActive) {
      // Issue 5: flush ref to state now that recording is done — one single setState call
      const recorded = [...perfEventsRef.current];
      setPerfEvents(recorded);
      // Issue 4: pre-sort once here so runPerfScheduler never sorts again
      sortedPerfEventsRef.current = [...recorded].sort((a, b) => a.beat - b.beat);
      setPerfRecordActive(false);

      const elapsed = ctx.currentTime - perfStartTimeRef.current;
      const bpm = paramsRef.current.arpBpm || 120;
      const beatDuration = 60 / bpm;
      seqCurrentBeatRef.current = elapsed / beatDuration;
      seqStartBeatOffsetRef.current = seqCurrentBeatRef.current;

      if (schedulerNodeRef.current) {
        schedulerNodeRef.current.port.postMessage({
          type: 'SET_PARAMS',
          perfRecordActive: false
        });
      }

      if (perfIsDubbing) {
        // Exiting dubbing transitions smoothly to standard playback
        setPerfPlaybackActive(true);
        perfPlayStartTimeRef.current = perfStartTimeRef.current;
        seqStartBeatOffsetRef.current = 0.0;
        showEditorStatus(`Overdub Complete! Seamlessly Playing... ▶️`);
      } else {
        setPerfPlaybackActive(false);
        if (schedulerNodeRef.current) {
          schedulerNodeRef.current.port.postMessage({ type: 'STOP_PLAYBACK' });
        }
        showEditorStatus(`Performance Recorded! (${recorded.length} events) ⏹️`);
      }
      setPerfIsDubbing(false);
    } else {
      const bpm = paramsRef.current.arpBpm || 120;
      const beatDuration = 60 / bpm;

      if (perfPlaybackActive) {
        if (isDub) {
          // Live Overdub Punch-In: engage recording on the fly while staying aligned
          setPerfRecordActive(true);
          setPerfIsDubbing(true);
          perfStartTimeRef.current = perfPlayStartTimeRef.current;
          
          if (schedulerNodeRef.current) {
            schedulerNodeRef.current.port.postMessage({
              type: 'SET_PARAMS',
              perfStartTime: perfPlayStartTimeRef.current,
              perfRecordActive: true
            });
          }
          showEditorStatus("Overdub engaged on the fly! 🎙️");
          return;
        } else {
          // Clean Record from active playback: halt playback first
          setPerfPlaybackActive(false);
          if (schedulerNodeRef.current) {
            schedulerNodeRef.current.port.postMessage({ type: 'STOP_PLAYBACK' });
          }
        }
      }

      if (perfCountInEnabled) {
        if (!isDub) {
          perfEventsRef.current = [];
          sortedPerfEventsRef.current = [];
          setPerfEvents([]);
          seqCurrentBeatRef.current = 0.0;
          seqStartBeatOffsetRef.current = 0.0;
        }
        perfCountInRemainingRef.current = 4;
        setPerfCountInRemaining(4);
        perfCountInIsDubRef.current = isDub;
        perfCountInActiveRef.current = true;
        setPerfCountInActive(true);
        
        showEditorStatus("Count-in Armed... Get Ready! ⏱️");
        startMetronome();
        return;
      }

      if (!isDub) {
        // Clean recording: wipe previous events
        perfEventsRef.current = [];
        sortedPerfEventsRef.current = [];
        setPerfEvents([]);
        seqCurrentBeatRef.current = 0.0;
        seqStartBeatOffsetRef.current = 0.0;
      }

      // Calculate start time relative to current playhead so we align grids
      const startBeat = seqCurrentBeatRef.current;
      const startTime = ctx.currentTime - (startBeat * beatDuration);
      perfStartTimeRef.current = startTime;
      
      setPerfRecordStartBpm(bpm);
      setPerfRecordActive(true);
      setPerfIsDubbing(isDub);

      if (schedulerNodeRef.current) {
        schedulerNodeRef.current.port.postMessage({
          type: 'SET_PARAMS',
          perfStartTime: startTime,
          perfRecordActive: true
        });
      }

      if (isDub) {
        // Start playing back existing events immediately during dub
        setPerfPlaybackActive(true);
        perfPlayStartTimeRef.current = startTime;
        seqStartBeatOffsetRef.current = 0.0;

        if (schedulerNodeRef.current) {
          schedulerNodeRef.current.port.postMessage({
            type: 'START_PLAYBACK',
            startTime: startTime,
            startBeatOffset: 0.0,
            sortedEvents: sortedPerfEventsRef.current
          });
        }
        showEditorStatus("Overdubbing Performance... 🎙️");
      } else {
        setPerfPlaybackActive(false);
        if (schedulerNodeRef.current) {
          schedulerNodeRef.current.port.postMessage({ type: 'STOP_PLAYBACK' });
        }
        showEditorStatus("Recording Performance (Clean)... ⏺️");
      }
    }
  };

  const togglePerformancePlayback = () => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;

    if (perfPlaybackActive) {
      setPerfPlaybackActive(false);

      const elapsed = ctx.currentTime - perfPlayStartTimeRef.current;
      const bpm = paramsRef.current.arpBpm || 120;
      const beatDuration = 60 / bpm;
      seqCurrentBeatRef.current = elapsed / beatDuration + seqStartBeatOffsetRef.current;
      seqStartBeatOffsetRef.current = seqCurrentBeatRef.current;

      if (schedulerNodeRef.current) {
        schedulerNodeRef.current.port.postMessage({ type: 'STOP_PLAYBACK' });
      }
      // Stop all playing performance voices
      for (const k of activeVoicesRef.current.keys()) {
        if (typeof k === 'string' && k.startsWith('perf-')) stopPerfVoice(k);
      }
      setActivePerfPads({});
      showEditorStatus("Playback Stopped. ⏹️");
    } else {
      if (sortedPerfEventsRef.current.length === 0 && perfEventsRef.current.length === 0) {
        showEditorStatus("No performance events recorded yet! ⚠️");
        return;
      }
      // Ensure sorted events are populated (fallback if stop-recording path was skipped)
      if (sortedPerfEventsRef.current.length === 0 && perfEventsRef.current.length > 0) {
        sortedPerfEventsRef.current = [...perfEventsRef.current].sort((a, b) => a.beat - b.beat);
      }
      // Stop recording first
      setPerfRecordActive(false);
      setPerfIsDubbing(false);
      setPerfPlaybackActive(true);
      
      const startTime = ctx.currentTime;
      perfPlayStartTimeRef.current = startTime;
      seqStartBeatOffsetRef.current = seqCurrentBeatRef.current;
      
      if (schedulerNodeRef.current) {
        schedulerNodeRef.current.port.postMessage({
          type: 'START_PLAYBACK',
          startTime,
          startBeatOffset: seqStartBeatOffsetRef.current,
          sortedEvents: sortedPerfEventsRef.current
        });
      }
      showEditorStatus("Playing Performance... ▶️");
    }
  };

  const stopPerformancePlayback = () => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;

    // Finalize recording if active
    if (perfRecordActive) {
      const recorded = [...perfEventsRef.current];
      setPerfEvents(recorded);
      sortedPerfEventsRef.current = [...recorded].sort((a, b) => a.beat - b.beat);
    }

    setPerfPlaybackActive(false);
    setPerfRecordActive(false);
    setPerfIsDubbing(false);
    seqCurrentBeatRef.current = 0.0;
    seqStartBeatOffsetRef.current = 0.0;
    
    perfCountInActiveRef.current = false;
    setPerfCountInActive(false);
    perfCountInRemainingRef.current = 4;
    setPerfCountInRemaining(4);
    if (!paramsRef.current.metronomeOn) {
      stopMetronome();
    }

    if (schedulerNodeRef.current) {
      schedulerNodeRef.current.port.postMessage({ type: 'STOP_PLAYBACK' });
      schedulerNodeRef.current.port.postMessage({
        type: 'SET_PARAMS',
        perfRecordActive: false
      });
    }

    // Stop all playing performance voices
    for (const k of activeVoicesRef.current.keys()) {
      if (typeof k === 'string' && k.startsWith('perf-')) stopPerfVoice(k);
    }
    setActivePerfPads({});
    showEditorStatus("Playback Stopped and Reset. ⏹️");
  };

  const clearPerformance = () => {
    setPerfEvents([]);
    perfEventsRef.current = [];
    sortedPerfEventsRef.current = [];
    seqCurrentBeatRef.current = 0.0;
    seqStartBeatOffsetRef.current = 0.0;
    if (schedulerNodeRef.current) {
      schedulerNodeRef.current.port.postMessage({ type: 'STOP_PLAYBACK' });
    }
    showEditorStatus("Performance Cleared! 🗑️");
  };

  const getPlatterAngle = (e, rect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = e.clientX;
    const py = e.clientY;
    return Math.atan2(py - cy, px - cx);
  };

  const handlePlatterMouseDown = (deck, e) => {
    e.preventDefault();
    const isA = deck === 'A';
    const rect = e.currentTarget.getBoundingClientRect();
    const angle = getPlatterAngle(e, rect);
    
    if (isA) {
      isScratchingA.current = true;
      scratchStartAngleA.current = angle;
    } else {
      isScratchingB.current = true;
      scratchStartAngleB.current = angle;
    }
  };

  const handlePlatterMouseMove = (deck, e) => {
    const isA = deck === 'A';
    const isScratching = isA ? isScratchingA.current : isScratchingB.current;
    if (!isScratching) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const angle = getPlatterAngle(e, rect);
    const lastAngle = isA ? scratchStartAngleA.current : scratchStartAngleB.current;
    
    let delta = angle - lastAngle;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    
    if (isA) {
      scratchStartAngleA.current = angle;
      setPlatterAngleA(prev => (prev + delta * (180 / Math.PI)) % 360);
    } else {
      scratchStartAngleB.current = angle;
      setPlatterAngleB(prev => (prev + delta * (180 / Math.PI)) % 360);
    }
    
    const speed = delta * 20;
    const playbackRateMultiplier = Math.max(0.08, Math.min(3.0, Math.abs(speed)));
    
    if (audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      activeVoicesRef.current.forEach((vList, voiceKey) => {
        if (typeof voiceKey === 'string' && voiceKey.startsWith('perf-')) {
          const isVoiceA = voiceKey.includes('perf-a');
          if ((isA && isVoiceA) || (!isA && !isVoiceA)) {
            const list = Array.isArray(vList) ? vList : [vList];
            list.forEach(voice => {
              const oscs = [voice.oscA, voice.oscA_L, voice.oscA_R, voice.oscB].filter(Boolean);
              oscs.forEach(osc => {
                const baseRate = isVoiceA ? (voice.orig_oscA_rate || 1.0) : (voice.orig_oscB_rate || 1.0);
                osc.playbackRate.setValueAtTime(baseRate * playbackRateMultiplier, now);
              });
            });
          }
        }
      });
    }
  };

  const handlePlatterMouseUp = (deck) => {
    const isA = deck === 'A';
    if (isA) {
      isScratchingA.current = false;
    } else {
      isScratchingB.current = false;
    }
    
    if (audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      activeVoicesRef.current.forEach((vList, voiceKey) => {
        if (typeof voiceKey === 'string' && voiceKey.startsWith('perf-')) {
          const isVoiceA = voiceKey.includes('perf-a');
          if ((isA && isVoiceA) || (!isA && !isVoiceA)) {
            const list = Array.isArray(vList) ? vList : [vList];
            list.forEach(voice => {
              const oscs = [voice.oscA, voice.oscA_L, voice.oscA_R, voice.oscB].filter(Boolean);
              oscs.forEach(osc => {
                const baseRate = isVoiceA ? (voice.orig_oscA_rate || 1.0) : (voice.orig_oscB_rate || 1.0);
                osc.playbackRate.setValueAtTime(baseRate, now);
              });
            });
          }
        }
      });
    }
  };

  const startArpeggiator = () => {
    if (arpRef.current.isPlaying) return;
    
    arpRef.current.isPlaying = true;
    arpRef.current.stepIndex = 0;
    arpRef.current.nextNoteTime = audioCtxRef.current.currentTime;
    setArpRunning(true);
    
    if (schedulerNodeRef.current) {
      schedulerNodeRef.current.port.postMessage({
        type: 'START_ARP',
        startTime: audioCtxRef.current.currentTime
      });
    }
  };

  const stopArpeggiator = () => {
    arpRef.current.isPlaying = false;
    if (schedulerNodeRef.current) {
      schedulerNodeRef.current.port.postMessage({ type: 'STOP_ARP' });
    }
    
    activeArpKeysRef.current.forEach(voiceKey => {
      const voices = activeVoicesRef.current.get(voiceKey);
      if (voices) {
        voices.forEach(releaseVoice);
        activeVoicesRef.current.delete(voiceKey);
      }
    });
    activeArpKeysRef.current.clear();
    setArpRunning(false);
  };

  const handleArpTick = (time, stepIndex) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const held = heldNotesRef.current;
    const isOscASlice = paramsRef.current.oscATriggerMode === 'slice';
    const isOscBSlice = paramsRef.current.oscMode === 'double' && paramsRef.current.oscBTriggerMode === 'slice';
    const isSliceMode = isOscASlice || isOscBSlice;
    console.log("[Leo Debug] handleArpTick stepIndex:", stepIndex, "held:", held, "isSliceMode:", isSliceMode);
    if (held.length === 0) {
      stopArpeggiator();
      return;
    }
    
    const bpm = paramsRef.current.arpBpm || 120;
    const division = paramsRef.current.arpDivision || 8;
    const gate = paramsRef.current.arpGate !== undefined ? paramsRef.current.arpGate : 0.8;
    const velocity = paramsRef.current.arpVelocity || 100;
    const pattern = paramsRef.current.arpPattern || 'UP';
    
    const stepDuration = (60 / bpm) * (4 / division);
    
    let noteToPlay = 60;
    
    if (isSliceMode && held.length === 1) {
      const activeSlotId = isOscASlice ? (paramsRef.current.oscAWave || 'a01') : (paramsRef.current.oscBWave || 'b01');
      const activeSlot = sampleSlotsRef.current.find(s => s.id === activeSlotId) || sampleSlotsRef.current[0];
      const sliceCount = activeSlot ? activeSlot.sliceCount || 16 : 16;
      
      const baseNote = held[0];
      let offset = stepIndex % sliceCount;
      if (pattern === 'DOWN') {
        offset = sliceCount - 1 - (stepIndex % sliceCount);
      } else if (pattern === 'RANDOM') {
        offset = Math.floor(Math.random() * sliceCount);
      }
      noteToPlay = baseNote + offset;
    } else {
      const sortedHeld = [...held].sort((a, b) => a - b);
      let noteIdx = stepIndex % sortedHeld.length;
      
      if (pattern === 'DOWN') {
        noteIdx = sortedHeld.length - 1 - (stepIndex % sortedHeld.length);
      } else if (pattern === 'RANDOM') {
        noteIdx = Math.floor(Math.random() * sortedHeld.length);
      }
      
      noteToPlay = sortedHeld[noteIdx];
    }
    
    const delayOffset = Math.max(0, time - ctx.currentTime);
    const voiceKey = `arp-${stepIndex}-${noteToPlay}`;
    
    const voice = playProgramVoice(ctx, noteToPlay, velocity, paramsRef.current, voiceKey, delayOffset);
    
    activeVoicesRef.current.set(voiceKey, [voice]);
    activeArpKeysRef.current.add(voiceKey);
    
    // Release note schedule
    const stopTimeMs = (delayOffset + stepDuration * gate) * 1000;
    setTimeout(() => {
      const voices = activeVoicesRef.current.get(voiceKey);
      if (voices) {
        voices.forEach(releaseVoice);
        activeVoicesRef.current.delete(voiceKey);
      }
      activeArpKeysRef.current.delete(voiceKey);
    }, stopTimeMs);
  };

  const playMetronomeClick = (ctx, time, isDownbeat) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'triangle';
    const freq = isDownbeat ? 1000 : 700;
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(150, time + 0.04);
    
    const vol = metronomeVolumeRef.current;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(vol * 0.35, time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    
    osc.connect(gainNode);
    // Connect DIRECTLY to ctx.destination to completely bypass the master analyser / resampler!
    gainNode.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.05);
  };

  const startMetronome = () => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    if (metronomeRef.current.isPlaying) return;
    
    metronomeRef.current.isPlaying = true;
    metronomeRef.current.beatIndex = 0;
    metronomeRef.current.nextNoteTime = ctx.currentTime + 0.05;
    
    if (schedulerNodeRef.current) {
      schedulerNodeRef.current.port.postMessage({
        type: 'START_METRONOME',
        startTime: ctx.currentTime + 0.02
      });
    }
  };

  const stopMetronome = () => {
    metronomeRef.current.isPlaying = false;
    if (schedulerNodeRef.current) {
      schedulerNodeRef.current.port.postMessage({ type: 'STOP_METRONOME' });
    }
  };

  const stopAllNotes = () => {
    heldNotesRef.current = [];
    stopArpeggiator();
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
        if (voice.oscA) {
          if (voice.oscA.frequency) {
            voice.oscA.frequency.setValueAtTime(voice.oscA.frequency.value * bendFactor, now);
          } else if (voice.oscA.playbackRate) {
            voice.oscA.playbackRate.setValueAtTime(voice.oscA.playbackRate.value * bendFactor, now);
          }
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

  const kaossCanvasRef = useRef(null);

  const sendKaossMidiOut = (x, y, isTouched) => {
    if (midiOutputsRef.current && midiOutputsRef.current.length > 0) {
      const valX = Math.round(x * 127);
      const valY = Math.round(y * 127);
      const valTouch = isTouched ? 127 : 0;
      const valHold = kaossPad.holdActive ? 127 : 0;
      
      midiOutputsRef.current.forEach(output => {
        try {
          output.send([0xB0, 12, valX]);
          output.send([0xB0, 13, valY]);
          output.send([0xB0, 92, valTouch]);
          output.send([0xB0, 95, valHold]);
        } catch (e) {}
      });
    }
  };

  const updateFormantFrequencies = (x, y) => {
    if (!audioCtxRef.current || !formantF1Ref.current) return;
    const now = audioCtxRef.current.currentTime;
    
    // Bottom-Left (0, 0) = U ("Oo")
    // Bottom-Right (1, 0) = O ("Oh")
    // Top-Left (0, 1) = E ("Ee")
    // Top-Right (1, 1) = A ("Ah")
    const vowels = {
      u: [320, 800, 2200],
      o: [500, 850, 2400],
      e: [350, 2200, 3000],
      a: [750, 1200, 2400]
    };
    
    const f1 = (1 - x) * (1 - y) * vowels.u[0] + x * (1 - y) * vowels.o[0] + (1 - x) * y * vowels.e[0] + x * y * vowels.a[0];
    const f2 = (1 - x) * (1 - y) * vowels.u[1] + x * (1 - y) * vowels.o[1] + (1 - x) * y * vowels.e[1] + x * y * vowels.a[1];
    const f3 = (1 - x) * (1 - y) * vowels.u[2] + x * (1 - y) * vowels.o[2] + (1 - x) * y * vowels.e[2] + x * y * vowels.a[2];
    
    formantF1Ref.current.frequency.setTargetAtTime(f1, now, 0.05);
    formantF2Ref.current.frequency.setTargetAtTime(f2, now, 0.05);
    formantF3Ref.current.frequency.setTargetAtTime(f3, now, 0.05);
  };

  // Physics and Render loop for Kaoss Pad
  useEffect(() => {
    let active = true;
    let lastTime = performance.now();
    
    const tick = () => {
      if (!active) return;
      
      const now = performance.now();
      let dt = (now - lastTime) / 1000;
      if (dt > 0.1) dt = 0.1; // clamp delta
      lastTime = now;
      
      const physics = kaossPhysicsRef.current;
      const gesture = gestureRef.current;
      
      // 1. Gesture Recording
      if (gesture.isRecording && physics.isTouched) {
        gesture.buffer.push({ x: physics.x, y: physics.y });
        if (gesture.buffer.length > 240) gesture.buffer.shift();
      }
      
      // 2. Gesture Playback
      if (gesture.isPlaying && gesture.buffer.length > 0 && !physics.isTouched) {
        const pt = gesture.buffer[Math.floor(gesture.playIndex)];
        if (pt) {
          physics.x = pt.x;
          physics.y = pt.y;
          physics.vx = 0;
          physics.vy = 0;
          
          setKaossPad(prev => ({ ...prev, x: pt.x, y: pt.y }));
          modulateKaossParameters(pt.x, pt.y, false);
          sendKaossMidiOut(pt.x, pt.y, false);
        }
        
        // Playback movement
        if (gesture.mode === 'loop') {
          gesture.playIndex = (gesture.playIndex + 1) % gesture.buffer.length;
        } else if (gesture.mode === 'one-shot') {
          gesture.playIndex++;
          if (gesture.playIndex >= gesture.buffer.length) {
            gesture.isPlaying = false;
            setIsPlayingGesture(false);
            handleKaossRelease();
          }
        } else if (gesture.mode === 'ping-pong') {
          gesture.playIndex += gesture.direction;
          if (gesture.playIndex >= gesture.buffer.length) {
            gesture.playIndex = gesture.buffer.length - 1;
            gesture.direction = -1;
          } else if (gesture.playIndex < 0) {
            gesture.playIndex = 0;
            gesture.direction = 1;
          }
        }
      }
      
      // 3. Physics return mode (only if NOT touched and NOT playing a gesture)
      if (!physics.isTouched && !gesture.isPlaying) {
        const mode = padReturnModeRef.current;
        if (mode === 'snap') {
          if (physics.x !== 0.5 || physics.y !== 0.5) {
            physics.x = 0.5;
            physics.y = 0.5;
            physics.vx = 0;
            physics.vy = 0;
            setKaossPad(prev => ({ ...prev, x: 0.5, y: 0.5 }));
            modulateKaossParameters(0.5, 0.5, false);
            sendKaossMidiOut(0.5, 0.5, false);
          }
        } else if (mode === 'spring') {
          const targetX = 0.5;
          const targetY = 0.5;
          const k = 15.0; // spring tension
          const damping = 3.5; // spring friction damping
          
          const ax = k * (targetX - physics.x) - damping * physics.vx;
          const ay = k * (targetY - physics.y) - damping * physics.vy;
          
          physics.vx += ax * dt;
          physics.vy += ay * dt;
          physics.x += physics.vx * dt;
          physics.y += physics.vy * dt;
          
          // stop spring when close
          if (Math.abs(physics.x - targetX) < 0.002 && Math.abs(physics.vx) < 0.002) {
            physics.x = targetX;
            physics.vx = 0;
          }
          if (Math.abs(physics.y - targetY) < 0.002 && Math.abs(physics.vy) < 0.002) {
            physics.y = targetY;
            physics.vy = 0;
          }
          
          setKaossPad(prev => ({ ...prev, x: physics.x, y: physics.y }));
          modulateKaossParameters(physics.x, physics.y, false);
          sendKaossMidiOut(physics.x, physics.y, false);
        } else if (mode === 'throw') {
          if (Math.abs(physics.vx) > 0.005 || Math.abs(physics.vy) > 0.005) {
            physics.x += physics.vx * dt;
            physics.y += physics.vy * dt;
            
            // drag friction
            physics.vx *= Math.exp(-1.8 * dt);
            physics.vy *= Math.exp(-1.8 * dt);
            
            // boundaries bounce
            const coef = -0.7;
            if (physics.x <= 0) { physics.x = 0; physics.vx *= coef; }
            else if (physics.x >= 1) { physics.x = 1; physics.vx *= coef; }
            if (physics.y <= 0) { physics.y = 0; physics.vy *= coef; }
            else if (physics.y >= 1) { physics.y = 1; physics.vy *= coef; }
            
            setKaossPad(prev => ({ ...prev, x: physics.x, y: physics.y }));
            modulateKaossParameters(physics.x, physics.y, false);
            sendKaossMidiOut(physics.x, physics.y, false);
          }
        }
      }
      
      // Update trail opacity
      physics.trails.forEach(t => {
        t.alpha -= 1.8 * dt;
      });
      physics.trails = physics.trails.filter(t => t.alpha > 0);
      
      // Update ripple
      if (physics.ripple) {
        physics.ripple.radius += 110 * dt;
        physics.ripple.alpha -= 2.2 * dt;
        if (physics.ripple.alpha <= 0) {
          physics.ripple = null;
        }
      }
      
      // Draw elements
      drawCanvas();
      
      physics.rafId = requestAnimationFrame(tick);
    };
    
    const drawCanvas = () => {
      const canvas = kaossCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      
      const physics = kaossPhysicsRef.current;
      
      // 1. Gridlines
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i < 4; i++) {
        ctx.moveTo((i / 4) * w, 0);
        ctx.lineTo((i / 4) * w, h);
        ctx.moveTo(0, (i / 4) * h);
        ctx.lineTo(w, (i / 4) * h);
      }
      ctx.stroke();
      
      // Center cross
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
      ctx.stroke();
      
      // 2. Draw Trails
      if (physics.trails.length > 1) {
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < physics.trails.length; i++) {
          const p1 = physics.trails[i - 1];
          const p2 = physics.trails[i];
          ctx.beginPath();
          ctx.moveTo(p1.x * w, (1 - p1.y) * h);
          ctx.lineTo(p2.x * w, (1 - p2.y) * h);
          ctx.strokeStyle = `rgba(0, 243, 255, ${p2.alpha})`;
          ctx.stroke();
        }
      }
      
      // 3. Draw Touch Ripple
      if (physics.ripple) {
        ctx.beginPath();
        ctx.arc(physics.x * w, (1 - physics.y) * h, physics.ripple.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(255, 0, 85, ${physics.ripple.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // 4. Draw Current Dot
      ctx.beginPath();
      ctx.arc(physics.x * w, (1 - physics.y) * h, 6.5, 0, 2 * Math.PI);
      ctx.fillStyle = physics.isTouched ? '#ff0055' : '#00f3ff';
      ctx.shadowColor = physics.isTouched ? '#ff0055' : '#00f3ff';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow
    };
    
    kaossPhysicsRef.current.rafId = requestAnimationFrame(tick);
    
    return () => {
      active = false;
      if (kaossPhysicsRef.current.rafId) {
        cancelAnimationFrame(kaossPhysicsRef.current.rafId);
      }
    };
  }, []);

  const handleKaossTouch = (e, rect) => {
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)); // invert Y

    const physics = kaossPhysicsRef.current;
    const now = performance.now();
    const dt = (now - physics.lastTime) / 1000;
    
    if (physics.isTouched && dt > 0) {
      physics.vx = (x - physics.x) / dt;
      physics.vy = (y - physics.y) / dt;
    } else {
      physics.vx = 0;
      physics.vy = 0;
    }
    
    physics.x = x;
    physics.y = y;
    physics.lastTime = now;
    physics.isTouched = true;
    
    // Add to trails
    physics.trails.push({ x, y, alpha: 1.0 });
    if (physics.trails.length > 20) physics.trails.shift();
    
    // Trigger ripple if just touched
    if (!physics.ripple) {
      physics.ripple = { radius: 2, alpha: 1.0 };
    }

    setKaossPad(prev => ({
      ...prev,
      x,
      y,
      touchActive: true
    }));

    modulateKaossParameters(x, y, true);
    sendKaossMidiOut(x, y, true);
  };

  const handleKaossRelease = () => {
    const physics = kaossPhysicsRef.current;
    physics.isTouched = false;
    physics.ripple = null;
    
    setKaossPad(prev => ({
      ...prev,
      touchActive: false
    }));
    
    sendKaossMidiOut(physics.x, physics.y, false);
    
    if (padReturnModeRef.current === 'snap') {
      physics.x = 0.5;
      physics.y = 0.5;
      physics.vx = 0;
      physics.vy = 0;
      setKaossPad(prev => ({ ...prev, x: 0.5, y: 0.5 }));
      modulateKaossParameters(0.5, 0.5, false);
    }
  };

  const modulateKaossParameters = (x, y, isTouched = false) => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;

    // --- Delta Pad Combi Morph Mixer ---
    if (currentMode === 'COMBI') {
      updateCombiVectorGains(x, y);
      return; 
    }

    const isTouchedOrHolding = isTouched || kaossPad.holdActive;

    // --- Dub Siren (Tone Generator + Tape Delay Pitch Ramps) ---
    const isDubSirenActive = (kaossTargetX === 'dubSiren' || kaossTargetY === 'dubSiren') && isTouchedOrHolding;
    if (dubSirenOscRef.current && dubSirenGainRef.current) {
      if (isDubSirenActive) {
        const sirenX = (kaossTargetX === 'dubSiren') ? x : y;
        const sirenY = (kaossTargetX === 'dubSiren') ? y : x;
        const baseFreq = sirenX * 800 + 80; // 80Hz to 880Hz
        const lfoRate = sirenY * 20 + 2; // 2Hz to 22Hz
        const freqOffset = Math.sin(now * Math.PI * 2 * lfoRate) * baseFreq * 0.45;
        
        dubSirenOscRef.current.frequency.setValueAtTime(baseFreq + freqOffset, now);
        dubSirenGainRef.current.gain.setTargetAtTime(0.25, now, 0.02);
        
        // Also feed into space echo with high feedback and slow catch-up time for tape pitch sweeps
        if (activeDelayRef.current) {
          const ad = activeDelayRef.current;
          const delayTimeVal = sirenX * 0.7 + 0.1; // 100ms to 800ms
          const feedbackVal = sirenY * 0.35 + 0.65; // 65% to 100%
          if (ad.delayL && ad.delayR) {
            ad.delayL.delayTime.setTargetAtTime(delayTimeVal, now, 0.1);
            ad.delayR.delayTime.setTargetAtTime(delayTimeVal * 1.33, now, 0.1);
            ad.feedbackL.gain.setValueAtTime(feedbackVal, now);
            ad.feedbackR.gain.setValueAtTime(feedbackVal, now);
          } else if (ad.delay1) {
            ad.delay1.delayTime.setTargetAtTime(delayTimeVal, now, 0.1);
            ad.delay2.delayTime.setTargetAtTime(delayTimeVal * 1.5, now, 0.1);
            ad.delay3.delayTime.setTargetAtTime(delayTimeVal * 2.0, now, 0.1);
            ad.feedbackGain1.gain.setValueAtTime(feedbackVal * 0.5, now);
            ad.feedbackGain2.gain.setValueAtTime(feedbackVal * 0.35, now);
            ad.feedbackGain3.gain.setValueAtTime(feedbackVal * 0.25, now);
          }
        }
      } else {
        dubSirenGainRef.current.gain.setTargetAtTime(0.0, now, 0.05);
      }
    }

    // --- Vinyl Break / Tape Stop (Slowing playhead/pitch of active voices) ---
    const isTapeStopActive = (kaossTargetX === 'tapeStop' || kaossTargetY === 'tapeStop') && isTouchedOrHolding;
    const stopAmt = isTapeStopActive ? (kaossTargetX === 'tapeStop' ? x : y) : 1.0;
    activeVoicesRef.current.forEach(vList => {
      const voices = Array.isArray(vList) ? vList : [vList];
      voices.forEach(voice => {
        if (!voice) return;
        if (voice.routeToXyPad === false) return;
        ['oscA', 'oscA_L', 'oscA_R', 'oscB', 'oscB_L', 'oscB_R'].forEach(key => {
          const node = voice[key];
          if (node && node.playbackRate) {
            if (voice[`orig_${key}_rate`] === undefined) {
              voice[`orig_${key}_rate`] = node.playbackRate.value;
            }
            node.playbackRate.setTargetAtTime(voice[`orig_${key}_rate`] * stopAmt, now, 0.06);
          }
        });
        ['oscA', 'oscB'].forEach(key => {
          const node = voice[key];
          if (node && node.frequency && node.type !== 'buffer') {
            if (voice[`orig_${key}_freq`] === undefined) {
              voice[`orig_${key}_freq`] = node.frequency.value;
            }
            node.frequency.setTargetAtTime(voice[`orig_${key}_freq`] * stopAmt, now, 0.06);
          }
        });
      });
    });

    // --- Formant Vowel Filter ---
    const isFormantActive = (kaossTargetX === 'formant' || kaossTargetY === 'formant') && isTouchedOrHolding;
    if (formantDryGainRef.current && formantMixGainRef.current) {
      if (isFormantActive) {
        const formantMix = 0.95;
        formantDryGainRef.current.gain.setTargetAtTime(1.0 - formantMix, now, 0.02);
        formantMixGainRef.current.gain.setTargetAtTime(formantMix, now, 0.02);
        updateFormantFrequencies(x, y);
      } else {
        formantDryGainRef.current.gain.setTargetAtTime(1.0, now, 0.02);
        formantMixGainRef.current.gain.setTargetAtTime(0.0, now, 0.02);
      }
    }

    // --- Bitcrusher ---
    const isBitcrushActive = (kaossTargetX === 'bitcrush' || kaossTargetY === 'bitcrush') && isTouchedOrHolding;
    if (bitcrusherDryGainRef.current && bitcrusherMixGainRef.current) {
      if (isBitcrushActive) {
        const crushMix = 0.85;
        bitcrusherDryGainRef.current.gain.setTargetAtTime(1.0 - crushMix, now, 0.02);
        bitcrusherMixGainRef.current.gain.setTargetAtTime(crushMix, now, 0.02);
        
        const ratioVal = (kaossTargetX === 'bitcrush') ? (x * 23 + 1) : (y * 23 + 1);
        const depthVal = (kaossTargetX === 'bitcrush') ? (16 - x * 14) : (16 - y * 14);
        sampleRateRatioRef.current = ratioVal;
        bitDepthRef.current = depthVal;
        // Push params to AudioWorklet if available
        if (bitcrusherNodeRef.current && bitcrusherNodeRef.current._isBitcrusherWorklet) {
          try {
            bitcrusherNodeRef.current.parameters.get('bitDepth').setTargetAtTime(depthVal, now, 0.02);
            bitcrusherNodeRef.current.parameters.get('sampleRateRatio').setTargetAtTime(ratioVal, now, 0.02);
          } catch {}
        }
      } else {
        bitcrusherDryGainRef.current.gain.setTargetAtTime(1.0, now, 0.02);
        bitcrusherMixGainRef.current.gain.setTargetAtTime(0.0, now, 0.02);
        sampleRateRatioRef.current = 1.0;
        bitDepthRef.current = 16.0;
        if (bitcrusherNodeRef.current && bitcrusherNodeRef.current._isBitcrusherWorklet) {
          try {
            bitcrusherNodeRef.current.parameters.get('bitDepth').setTargetAtTime(16.0, now, 0.02);
            bitcrusherNodeRef.current.parameters.get('sampleRateRatio').setTargetAtTime(1.0, now, 0.02);
          } catch {}
        }
      }
    }

    // --- Reverb Freeze ---
    const isReverbFreezeActive = (kaossTargetX === 'reverbFreeze' || kaossTargetY === 'reverbFreeze') && isTouchedOrHolding;
    if (reverbFeedbackGainRef.current && reverbHPFRef.current) {
      if (isReverbFreezeActive) {
        const fbVal = (kaossTargetX === 'reverbFreeze') ? (x * 0.88) : (y * 0.88);
        reverbFeedbackGainRef.current.gain.setTargetAtTime(fbVal, now, 0.05);
        
        const hpfVal = (kaossTargetX === 'reverbFreeze') ? (x * 3980 + 20) : (y * 3980 + 20);
        reverbHPFRef.current.frequency.setTargetAtTime(hpfVal, now, 0.05);
      } else {
        reverbFeedbackGainRef.current.gain.setTargetAtTime(0.0, now, 0.05);
        reverbHPFRef.current.frequency.setTargetAtTime(20, now, 0.05);
      }
    }

    // --- Delta Pad Gater FX Logic ---
    const isGaterTargeted = (kaossTargetX === 'gater' || kaossTargetY === 'gater');
    const isGaterActive = isGaterTargeted && isTouchedOrHolding;

    if (isGaterActive && gaterLfoGainRef.current && gaterGainNodeRef.current && gaterLfoRef.current) {
      const gaterRate = (kaossTargetX === 'gater') ? (x * 23 + 2) : (y * 23 + 2); // 2Hz to 25Hz
      gaterLfoRef.current.frequency.setValueAtTime(gaterRate, now);
      gaterLfoGainRef.current.gain.setTargetAtTime(0.5, now, 0.02);
      gaterGainNodeRef.current.gain.setTargetAtTime(0.5, now, 0.02);
    } else if (gaterLfoGainRef.current && gaterGainNodeRef.current) {
      gaterLfoGainRef.current.gain.setTargetAtTime(0.0, now, 0.02);
      gaterGainNodeRef.current.gain.setTargetAtTime(1.0, now, 0.02);
    }

    // Standard X target modulations
    if (kaossTargetX === 'cutoff') {
      const cutVal = x * 4000 + 100;
      activeVoicesRef.current.forEach(vList => {
        const updateCut = (v) => {
          if (!v) return;
          if (v.routeToXyPad === false) return;
          if (v.filter1) v.filter1.frequency.setValueAtTime(cutVal, now);
        };
        if (Array.isArray(vList)) vList.forEach(updateCut); else updateCut(vList);
      });
    } else if (kaossTargetX === 'lfoRate') {
      const rateVal = x * 15 + 0.5;
      activeVoicesRef.current.forEach(vList => {
        const updateRate = (v) => {
          if (!v) return;
          if (v.routeToXyPad === false) return;
          if (v.vibratoLfo) v.vibratoLfo.frequency.setValueAtTime(rateVal, now);
          if (v.filterLfo) v.filterLfo.frequency.setValueAtTime(rateVal, now);
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

    // Standard Y target modulations
    if (kaossTargetY === 'resonance') {
      const resVal = y * 18 + 0.2;
      activeVoicesRef.current.forEach(vList => {
        const updateRes = (v) => {
          if (!v) return;
          if (v.routeToXyPad === false) return;
          if (v.filter1) v.filter1.Q.setValueAtTime(resVal, now);
        };
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

  // Update playbackRate of warped active voices in real-time when master tempo changes
  useEffect(() => {
    const bpm = params.arpBpm || 120;
    const now = audioCtxRef.current ? audioCtxRef.current.currentTime : 0;
    
    activeVoicesRef.current.forEach(vList => {
      const updateVoiceRates = (v) => {
        if (!v) return;
        
        if (v.warpOnA && v.activeDurationA && v.warpBeatsA) {
          const targetDuration = (60 / bpm) * v.warpBeatsA;
          const warpFactor = v.activeDurationA / targetDuration;
          const finalRate = warpFactor * (v.warpBaseRateA || 1.0);
          
          v.orig_oscA_rate = finalRate;
          v.orig_oscA_L_rate = finalRate;
          v.orig_oscA_R_rate = finalRate;
          v.playheadRateA = warpFactor;
          
          if (v.oscA && v.oscA.playbackRate) {
            v.oscA.playbackRate.setValueAtTime(finalRate, now);
          }
          if (v.oscA_L && v.oscA_L.playbackRate) {
            v.oscA_L.playbackRate.setValueAtTime(finalRate, now);
          }
          if (v.oscA_R && v.oscA_R.playbackRate) {
            v.oscA_R.playbackRate.setValueAtTime(finalRate, now);
          }
        }
        
        if (v.warpOnB && v.activeDurationB && v.warpBeatsB) {
          const targetDuration = (60 / bpm) * v.warpBeatsB;
          const warpFactor = v.activeDurationB / targetDuration;
          const finalRate = warpFactor * (v.warpBaseRateB || 1.0);
          
          v.orig_oscB_rate = finalRate;
          v.orig_oscB_L_rate = finalRate;
          v.orig_oscB_R_rate = finalRate;
          v.playheadRateB = warpFactor;
          
          if (v.oscB && v.oscB.playbackRate) {
            v.oscB.playbackRate.setValueAtTime(finalRate, now);
          }
          if (v.oscB_L && v.oscB_L.playbackRate) {
            v.oscB_L.playbackRate.setValueAtTime(finalRate, now);
          }
          if (v.oscB_R && v.oscB_R.playbackRate) {
            v.oscB_R.playbackRate.setValueAtTime(finalRate, now);
          }
        }
      };
      
      if (Array.isArray(vList)) {
        vList.forEach(updateVoiceRates);
      } else {
        updateVoiceRates(vList);
      }
    });
  }, [params.arpBpm]);

  // Update playbackRate of performance voices when deck pitch slider is moved in real-time
  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    
    activeVoicesRef.current.forEach((vList, voiceKey) => {
      if (typeof voiceKey === 'string' && voiceKey.startsWith('perf-')) {
        const isVoiceA = voiceKey.includes('perf-a');
        const pitchFactor = 1.0 + ((isVoiceA ? deckAPitch : deckBPitch) / 100);
        
        const list = Array.isArray(vList) ? vList : [vList];
        list.forEach(voice => {
          if (isVoiceA) {
            const baseRate = voice.base_oscA_rate || 1.0;
            const finalRate = baseRate * pitchFactor;
            voice.orig_oscA_rate = finalRate;
            voice.orig_oscA_L_rate = finalRate;
            voice.orig_oscA_R_rate = finalRate;
            
            const oscs = [voice.oscA, voice.oscA_L, voice.oscA_R].filter(Boolean);
            oscs.forEach(osc => {
              osc.playbackRate.setValueAtTime(finalRate, now);
            });
          } else {
            const baseRate = voice.base_oscB_rate || 1.0;
            const finalRate = baseRate * pitchFactor;
            voice.orig_oscB_rate = finalRate;
            voice.orig_oscB_L_rate = finalRate;
            voice.orig_oscB_R_rate = finalRate;
            
            const oscs = [voice.oscB, voice.oscB_L, voice.oscB_R].filter(Boolean);
            oscs.forEach(osc => {
              osc.playbackRate.setValueAtTime(finalRate, now);
            });
          }
        });
      }
    });
  }, [deckAPitch, deckBPitch]);

  // MIDI Start (0xFA) / Stop (0xFC) on Arpeggiator On/Off state toggle
  const isMidiArpMountedRef = useRef(false);
  useEffect(() => {
    if (!params.arpOn) {
      heldNotesRef.current = [];
      stopArpeggiator();
    }
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
    // Intercept CC 64 (Sustain Pedal) for live record loop triggering!
    if (cc === 64) {
      const isPressed = val >= 64;
      if (isPressed && !sustainPedalPressedRef.current) {
        sustainPedalPressedRef.current = true;
        handleSustainPedalDown();
      } else if (!isPressed && sustainPedalPressedRef.current) {
        sustainPedalPressedRef.current = false;
        handleSustainPedalUp();
      }
      return;
    }

    // Intercept hardware Kaoss Pad controller MIDI mapping
    const valNormalized = val / 127;
    const now = audioCtxRef.current ? audioCtxRef.current.currentTime : 0;

    if (cc === 12) {
      const physics = kaossPhysicsRef.current;
      physics.x = valNormalized;
      setKaossPad(prev => ({ ...prev, x: valNormalized }));
      modulateKaossParameters(valNormalized, physics.y, physics.isTouched || kaossPad.holdActive);
      return;
    }
    if (cc === 13) {
      const physics = kaossPhysicsRef.current;
      physics.y = valNormalized;
      setKaossPad(prev => ({ ...prev, y: valNormalized }));
      modulateKaossParameters(physics.x, valNormalized, physics.isTouched || kaossPad.holdActive);
      return;
    }
    if (cc === 92) {
      const physics = kaossPhysicsRef.current;
      const isTouched = val >= 64;
      physics.isTouched = isTouched;
      setKaossPad(prev => ({ ...prev, touchActive: isTouched }));
      if (!isTouched) {
        handleKaossRelease();
      } else {
        if (!physics.ripple) physics.ripple = { radius: 2, alpha: 1.0 };
      }
      return;
    }
    if (cc === 95) {
      const isHold = val >= 64;
      setKaossPad(prev => ({ ...prev, holdActive: isHold }));
      return;
    }

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

    // Check custom mappings
    Object.keys(midiMappings).forEach((paramName) => {
      if (midiMappings[paramName] === cc) {
        const now = audioCtxRef.current ? audioCtxRef.current.currentTime : 0;
        if (paramName === 'cutoff') {
          const cutVal = Math.round(valNormalized * 19980 + 20);
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
        } else if (paramName === 'leslieDrive') {
          setParams(prev => ({ ...prev, leslieDrive: valNormalized }));
        } else if (paramName === 'leslieWidth') {
          setParams(prev => ({ ...prev, leslieWidth: valNormalized }));
        } else if (paramName === 'leslieCrossover') {
          setParams(prev => ({ ...prev, leslieCrossover: Math.round(valNormalized * 1700 + 300) }));
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

  const drawNote = (deck, laneIdx, startBeat, endBeat) => {
    const noteOn = {
      beat: startBeat,
      deck,
      type: 'slot',
      index: laneIdx,
      velocity: 100,
      isNoteOn: true
    };
    const noteOff = {
      beat: endBeat,
      deck,
      type: 'slot',
      index: laneIdx,
      velocity: 100,
      isNoteOn: false
    };

    const nextEvents = [...perfEvents, noteOn, noteOff];
    setPerfEvents(nextEvents);
    perfEventsRef.current = nextEvents;
    sortedPerfEventsRef.current = [...nextEvents].sort((a, b) => a.beat - b.beat);
    
    if (schedulerNodeRef.current && perfPlaybackActiveRef.current) {
      schedulerNodeRef.current.port.postMessage({
        type: 'UPDATE_EVENTS',
        sortedEvents: sortedPerfEventsRef.current
      });
    }
    showEditorStatus(`Drawn Note at Beat ${startBeat.toFixed(2)} ✏️`);
  };

  const erasePill = (deck, laneIdx, pill) => {
    const nextEvents = perfEvents.filter(evt => {
      const matchLane = evt.deck === deck && evt.type === 'slot' && evt.index === laneIdx;
      if (matchLane) {
        if (evt.isNoteOn && Math.abs(evt.beat - pill.start) < 0.001) return false;
        if (!evt.isNoteOn && Math.abs(evt.beat - pill.end) < 0.001) return false;
      }
      return true;
    });

    setPerfEvents(nextEvents);
    perfEventsRef.current = nextEvents;
    sortedPerfEventsRef.current = [...nextEvents].sort((a, b) => a.beat - b.beat);
    
    if (schedulerNodeRef.current && perfPlaybackActiveRef.current) {
      schedulerNodeRef.current.port.postMessage({
        type: 'UPDATE_EVENTS',
        sortedEvents: sortedPerfEventsRef.current
      });
    }
    showEditorStatus(`Erased Note at Beat ${pill.start.toFixed(2)} ❌`);
  };

  const handleCopyDeck = (deck) => {
    const eventsToCopy = perfEvents.filter(evt => evt.deck === deck);
    if (eventsToCopy.length === 0) {
      showEditorStatus(`No notes to copy on Deck ${deck}! 📑`);
      return;
    }
    setHighwayClipboard({
      deck,
      events: JSON.parse(JSON.stringify(eventsToCopy))
    });
    showEditorStatus(`Copied Deck ${deck} notes to clipboard! 📑`);
  };

  const handlePasteDeck = (targetDeck) => {
    if (!highwayClipboard) return;
    const otherEvents = perfEvents.filter(evt => evt.deck !== targetDeck);
    const pastedEvents = highwayClipboard.events.map(evt => ({
      ...evt,
      deck: targetDeck
    }));

    const nextEvents = [...otherEvents, ...pastedEvents];
    setPerfEvents(nextEvents);
    perfEventsRef.current = nextEvents;
    sortedPerfEventsRef.current = [...nextEvents].sort((a, b) => a.beat - b.beat);
    
    if (schedulerNodeRef.current && perfPlaybackActiveRef.current) {
      schedulerNodeRef.current.port.postMessage({
        type: 'UPDATE_EVENTS',
        sortedEvents: sortedPerfEventsRef.current
      });
    }
    showEditorStatus(`Pasted clipboard onto Deck ${targetDeck}! 📑`);
  };

  const handleClearDeck = (deck) => {
    if (window.confirm(`Are you sure you want to clear ALL performance notes on Deck ${deck}?`)) {
      const nextEvents = perfEvents.filter(evt => evt.deck !== deck);
      setPerfEvents(nextEvents);
      perfEventsRef.current = nextEvents;
      sortedPerfEventsRef.current = [...nextEvents].sort((a, b) => a.beat - b.beat);
      
      if (schedulerNodeRef.current && perfPlaybackActiveRef.current) {
        schedulerNodeRef.current.port.postMessage({
          type: 'UPDATE_EVENTS',
          sortedEvents: sortedPerfEventsRef.current
        });
      }
      showEditorStatus(`Cleared all notes on Deck ${deck}! 🧹`);
    }
  };

  const handleHighwayMouseDown = (deck, e) => {
    if (highwayEditMode === 'perform') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const laneIdx = Math.max(0, Math.min(7, Math.floor(x / 31.25))); // 250px wide / 8 lanes = 31.25px per lane
    const playheadY = 400 - 35; // 400 height, playhead at bottom 35
    const distY = playheadY - y;
    const beatOffset = distY / highwayZoom;
    let clickedBeat = seqCurrentBeatRef.current + beatOffset;
    if (clickedBeat < 0) clickedBeat = 0;

    let gridSize = 0.25;
    if (perfQuantizeMode === '1/128') gridSize = 0.03125;
    else if (perfQuantizeMode === '1/64') gridSize = 0.0625;
    else if (perfQuantizeMode === '1/32') gridSize = 0.125;
    else if (perfQuantizeMode === '1/16') gridSize = 0.25;
    else if (perfQuantizeMode === '1/8') gridSize = 0.5;
    else if (perfQuantizeMode === '1/4') gridSize = 1.0;
    else if (perfQuantizeMode === '1/2') gridSize = 2.0;
    else if (perfQuantizeMode === 'Bar') gridSize = 4.0;

    const snappedBeat = Math.round(clickedBeat / gridSize) * gridSize;

    // Helper to get pills
    const getPillsForLane = (d, index) => {
      const pills = [];
      const events = perfEvents.filter(evt => evt.deck === d && evt.type === 'slot' && evt.index === index);
      const sorted = [...events].sort((a, b) => a.beat - b.beat);
      
      let activePill = null;
      sorted.forEach(evt => {
        if (evt.isNoteOn) {
          if (activePill) {
            activePill.end = evt.beat;
            pills.push(activePill);
          }
          activePill = { start: evt.beat, end: evt.beat + 1.0 };
        } else {
          if (activePill) {
            activePill.end = evt.beat;
            pills.push(activePill);
            activePill = null;
          }
        }
      });
      if (activePill) {
        pills.push(activePill);
      }
      return pills;
    };

    if (highwayEditMode === 'draw') {
      const pills = getPillsForLane(deck, laneIdx);
      const existingPill = pills.find(p => snappedBeat >= p.start - 0.01 && snappedBeat <= p.end + 0.01);
      
      if (existingPill) {
        erasePill(deck, laneIdx, existingPill);
      } else {
        const noteLength = gridSize;
        drawNote(deck, laneIdx, snappedBeat, snappedBeat + noteLength);
      }
    } else if (highwayEditMode === 'erase') {
      const pills = getPillsForLane(deck, laneIdx);
      const existingPill = pills.find(p => snappedBeat >= p.start - 0.01 && snappedBeat <= p.end + 0.01);
      if (existingPill) {
        erasePill(deck, laneIdx, existingPill);
      }
    } else if (highwayEditMode === 'resize') {
      const pills = getPillsForLane(deck, laneIdx);
      const existingPill = pills.find(p => snappedBeat >= p.start - 0.05 && snappedBeat <= p.end + 0.05);
      if (existingPill) {
        setResizeDragTarget({
          deck,
          laneIdx,
          startBeat: existingPill.start,
          originalEndBeat: existingPill.end
        });
      }
    }
  };

  const handleHighwayMouseMove = (e) => {
    if (highwayEditMode !== 'resize' || !resizeDragTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const playheadY = 400 - 35;
    const distY = playheadY - y;
    const beatOffset = distY / highwayZoom;
    let hoverBeat = seqCurrentBeatRef.current + beatOffset;
    if (hoverBeat < resizeDragTarget.startBeat + 0.05) {
      hoverBeat = resizeDragTarget.startBeat + 0.05;
    }

    let gridSize = 0.25;
    if (perfQuantizeMode === '1/128') gridSize = 0.03125;
    else if (perfQuantizeMode === '1/64') gridSize = 0.0625;
    else if (perfQuantizeMode === '1/32') gridSize = 0.125;
    else if (perfQuantizeMode === '1/16') gridSize = 0.25;
    else if (perfQuantizeMode === '1/8') gridSize = 0.5;
    else if (perfQuantizeMode === '1/4') gridSize = 1.0;
    else if (perfQuantizeMode === '1/2') gridSize = 2.0;
    else if (perfQuantizeMode === 'Bar') gridSize = 4.0;

    const snappedHoverBeat = Math.round(hoverBeat / gridSize) * gridSize;
    const finalEndBeat = Math.max(resizeDragTarget.startBeat + gridSize, snappedHoverBeat);

    const updatedEvents = perfEvents.map(evt => {
      if (evt.deck === resizeDragTarget.deck && 
          evt.type === 'slot' && 
          evt.index === resizeDragTarget.laneIdx) {
        if (!evt.isNoteOn && Math.abs(evt.beat - resizeDragTarget.originalEndBeat) < 0.001) {
          return { ...evt, beat: finalEndBeat };
        }
      }
      return evt;
    });

    setPerfEvents(updatedEvents);
    perfEventsRef.current = updatedEvents;
    sortedPerfEventsRef.current = [...updatedEvents].sort((a, b) => a.beat - b.beat);
    
    if (schedulerNodeRef.current && perfPlaybackActiveRef.current) {
      schedulerNodeRef.current.port.postMessage({
        type: 'UPDATE_EVENTS',
        sortedEvents: sortedPerfEventsRef.current
      });
    }

    setResizeDragTarget(prev => ({
      ...prev,
      originalEndBeat: finalEndBeat
    }));
  };

  const handleHighwayMouseUp = () => {
    setResizeDragTarget(null);
  };

  const renderPerformanceDeck = () => {
    const getPillsForLane = (deck, index) => {
      const pills = [];
      const events = perfEvents.filter(e => e.deck === deck && e.type === 'slot' && e.index === index);
      const sorted = [...events].sort((a, b) => a.beat - b.beat);
      
      let activePill = null;
      sorted.forEach(e => {
        if (e.isNoteOn) {
          if (activePill) {
            activePill.end = e.beat;
            pills.push(activePill);
          }
          activePill = { start: e.beat, end: e.beat + 1.0 };
        } else {
          if (activePill) {
            activePill.end = e.beat;
            pills.push(activePill);
            activePill = null;
          }
        }
      });
      if (activePill) {
        pills.push(activePill);
      }
      return pills;
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 32px)', background: '#020509', flexGrow: 1, minHeight: 0 }}>
        {/* TOP ROW: DECKS & MIXER */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 1fr', flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* LEFT DECK (DECK A) */}
        <div className="turntable-deck">
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#00f3ff', letterSpacing: '2px', fontFamily: 'monospace' }}>
              DECK A &mdash; {getSlotLabel(params.oscAWave)}
            </span>
            
            <div className="vinyl-platter-wrapper">
              <div 
                ref={platterRefA}
                className="vinyl-platter"
                onMouseDown={(e) => handlePlatterMouseDown('A', e)}
                onMouseMove={(e) => handlePlatterMouseMove('A', e)}
                onMouseUp={() => handlePlatterMouseUp('A')}
                onMouseLeave={() => handlePlatterMouseUp('A')}
                onTouchStart={(e) => { e.preventDefault(); handlePlatterMouseDown('A', e.touches[0]); }}
                onTouchMove={(e) => { e.preventDefault(); handlePlatterMouseMove('A', e.touches[0]); }}
                onTouchEnd={() => handlePlatterMouseUp('A')}
                style={{ 
                  transform: `rotate(${platterAngleARef.current}deg)`,
                  transition: 'none'
                }}
              >
                {/* Vector Vinyl Disc inside the rotating div */}
                <svg width="250" height="250" viewBox="0 0 250 250" style={{ display: 'block', pointerEvents: 'none' }}>
                  <defs>
                    <radialGradient id="vinylGradA" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#2c2c2c" />
                      <stop offset="25%" stopColor="#181818" />
                      <stop offset="60%" stopColor="#080808" />
                      <stop offset="90%" stopColor="#020202" />
                      <stop offset="100%" stopColor="#000000" />
                    </radialGradient>
                  </defs>
                  {/* Black Vinyl Grooves Background */}
                  <circle cx="125" cy="125" r="123" fill="url(#vinylGradA)" stroke="#333" strokeWidth="2.5" />
                  {/* Groove lines details */}
                  <circle cx="125" cy="125" r="110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <circle cx="125" cy="125" r="95" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <circle cx="125" cy="125" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                </svg>
              </div>

              {/* 8 Concentric Playhead Rings & Central display (Stationary Overlay) */}
              <svg 
                width="250" 
                height="250" 
                viewBox="0 0 250 250" 
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 3 }}
              >
                {ringColors.map((color, idx) => {
                  const r = 115 - idx * 9;
                  return (
                    <g key={idx}>
                      {/* Dashed track circle */}
                      <circle
                        ref={(el) => { if (el) ringTracksRefA.current[idx] = el; }}
                        cx="125"
                        cy="125"
                        r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth="2.2"
                        strokeDasharray="4, 5"
                        style={{
                          transformOrigin: '125px 125px',
                          opacity: 0.18,
                          transition: 'opacity 0.2s ease'
                        }}
                      />
                      {/* Bright glowing playhead dot */}
                      <circle
                        ref={(el) => { if (el) ringDotsRefA.current[idx] = el; }}
                        cx="125"
                        cy={125 - r}
                        r="3.5"
                        fill="#ffffff"
                        stroke={color}
                        strokeWidth="1.5"
                        style={{
                          opacity: 0,
                          transformOrigin: '125px 125px',
                          filter: `drop-shadow(0 0 5px ${color})`,
                          transition: 'opacity 0.1s ease'
                        }}
                      />
                    </g>
                  );
                })}

                {/* Center Display Hub (Stationary) */}
                <circle cx="125" cy="125" r="38" fill="#0c1220" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                <circle cx="125" cy="125" r="34" fill="#040810" />
                
                <text 
                  x="125" 
                  y="117" 
                  textAnchor="middle" 
                  fill="#00f3ff" 
                  fontSize="8" 
                  fontWeight="bold" 
                  fontFamily="monospace"
                  letterSpacing="0.5px"
                >
                  OSC A
                </text>
                <text 
                  x="125" 
                  y="133" 
                  textAnchor="middle" 
                  fill="#ffffff" 
                  fontSize="7" 
                  fontFamily="monospace"
                  opacity="0.85"
                >
                  {sampleSlotsRef.current.find(s => s.id === params.oscAWave)?.name.substring(0, 6).toUpperCase() || 'EMPTY'}
                </text>
              </svg>
            </div>

            {/* 2 Rows of 4 Pads (2x4 Grid) for Deck A */}
            <div className="performance-pads-grid-2x4">
              {Array.from({ length: 8 }).map((_, idx) => {
                const slotId = `a0${idx + 1}`;
                const slot = sampleSlots.find(s => s.id === slotId);
                const isLoaded = slot && slot.buffer;
                const padKey = `A-slot-${idx}`;
                const isActive = activePerfPads[padKey];
                const isPending = activePerfPads[`${padKey}-pending`];
                
                const fxType = slot?.fxType || 'None';
                const fxSend = slot?.fxSend !== undefined ? slot.fxSend : 0.0;
                const pan = slot?.pan !== undefined ? slot.pan : 0.0;

                const ringColor = ringColors[idx];
                const padStyle = isLoaded ? {
                  borderColor: isActive ? '#ffffff' : `${ringColor}73`,
                  background: isActive ? ringColor : `${ringColor}14`,
                  color: isActive ? '#000000' : ringColor,
                  boxShadow: isActive ? `0 0 15px ${ringColor}, inset 0 0 4px rgba(255,255,255,0.8)` : `inset 0 0 6px ${ringColor}1a`,
                } : {};

                return (
                  <div
                    key={slotId}
                    className={`perf-pad ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}
                    style={padStyle}
                    onMouseDown={() => triggerPerfPadInternal('A', 'slot', idx, 100, true, true)}
                    onMouseUp={() => triggerPerfPadInternal('A', 'slot', idx, 100, false, true)}
                    onMouseLeave={() => triggerPerfPadInternal('A', 'slot', idx, 100, false, true)}
                    onTouchStart={(e) => { e.preventDefault(); triggerPerfPadInternal('A', 'slot', idx, 100, true, true); }}
                    onTouchEnd={(e) => { e.preventDefault(); triggerPerfPadInternal('A', 'slot', idx, 100, false, true); }}
                    onContextMenu={(e) => handlePadRightClick(e, 'A', idx)}
                    title={isLoaded ? `${slot.name} (Right-click to route)` : 'Empty Slot'}
                  >
                    <span className="perf-pad-label">A{idx + 1}</span>
                    <span className="perf-pad-name">{isLoaded ? slot.name.substring(0, 8) : '---'}</span>
                    
                    {/* Visual badges for FX and Pan */}
                    {isLoaded && (
                      <div className="perf-pad-routing-badges">
                        {slot.routeToXyPad === false && (
                          <span className="pad-badge-dry" style={{ border: '1px solid #718096', color: '#a0aec0', background: 'rgba(113, 128, 150, 0.15)', fontSize: '0.38rem', padding: '0px 2px', borderRadius: '2px', lineHeight: 1 }} title="Bypasses Delta XY Modulator">
                            BYP
                          </span>
                        )}
                        {fxType !== 'None' && (
                          <span className="pad-badge-fx" style={{ border: `1px solid ${ringColor}`, color: ringColor, background: `${ringColor}18` }} title={`FX: ${fxType} (${Math.round(fxSend * 100)}%)`}>
                            {fxType === 'Space Echo' ? 'DLY' : fxType === 'Rotor Cabinet' ? 'ROT' : 'RVB'}: {Math.round(fxSend * 100)}%
                          </span>
                        )}
                        {Math.abs(pan) > 0.02 && (
                          <span className="pad-badge-pan" title={`Pan: ${pan > 0 ? 'R' : 'L'}${Math.abs(Math.round(pan * 100))}%`}>
                            P: {pan > 0 ? 'R' : 'L'}{Math.abs(Math.round(pan * 100))}%
                          </span>
                        )}
                      </div>
                    )}

                    {isLoaded && (
                      <button
                        className="perf-pad-rev-badge"
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          left: '2px',
                          background: slot.reverseOn ? 'rgba(255, 70, 70, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                          border: `1px solid ${slot.reverseOn ? '#ff4444' : 'rgba(255,255,255,0.2)'}`,
                          borderRadius: '2px',
                          color: slot.reverseOn ? '#ff4444' : '#aaa',
                          fontSize: '0.42rem',
                          padding: '1px 3px',
                          lineHeight: 1,
                          cursor: 'pointer',
                          zIndex: 5
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = { ...slot, reverseOn: !slot.reverseOn };
                          setSampleSlots(prev => prev.map(s => s.id === slotId ? updated : s));
                          saveSampleToDb(updated).catch(err => console.error("Failed to save slot reverse:", err));
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                      >
                        {slot.reverseOn ? 'REV' : 'FWD'}
                      </button>
                    )}

                    {isLoaded && (
                      <button
                        className="perf-pad-loop-badge"
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          background: slot.loopOn ? `${ringColor}40` : 'rgba(255, 255, 255, 0.08)',
                          border: `1px solid ${slot.loopOn ? ringColor : 'rgba(255,255,255,0.2)'}`,
                          borderRadius: '2px',
                          color: slot.loopOn ? ringColor : '#aaa',
                          fontSize: '0.42rem',
                          padding: '1px 3px',
                          lineHeight: 1,
                          cursor: 'pointer',
                          zIndex: 5
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSlotLoop(slotId, e);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                      >
                        {slot.loopOn ? 'LOOP' : '1-SHOT'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Transport controls */}
            <div className="deck-row" style={{ width: '100%', marginTop: '6px', padding: '0 4px' }}>
              <button 
                className={`deck-btn deck-btn-sync ${deckASoloActive ? 'active' : ''}`}
                onClick={() => {
                  const nextSolo = !deckASoloActive;
                  setDeckASoloActive(nextSolo);
                  showEditorStatus(`Deck A Solo Mode: ${nextSolo ? 'ON' : 'OFF'} 🎧`);
                }}
                title="Solo Deck A (Only one pad plays at a time)"
              >
                Solo
              </button>
              <button 
                className="deck-btn deck-btn-cue"
                onClick={() => {
                  for (let i = 0; i < 8; i++) {
                    stopPerfVoice(`perf-a-slice-${i}`);
                    stopPerfVoice(`perf-a-slot-${i}`);
                  }
                  setDeckAPlaying(false);
                  showEditorStatus("Deck A Cued ⏹️");
                }}
              >
                Cue
              </button>
              <button 
                className={`deck-btn deck-btn-play ${deckAPlaying ? 'active' : ''}`}
                onClick={() => {
                  const activeAIdx = sampleSlots.findIndex(s => s.id === params.oscAWave);
                  const idx = activeAIdx >= 0 ? activeAIdx : 0;
                  triggerPerfPadInternal('A', 'slot', idx, 100, !deckAPlaying, false);
                }}
              >
                {deckAPlaying ? 'Pause' : 'Play'}
              </button>
            </div>

            {/* Highway Editor Controls for Deck A */}
            <div className="deck-row" style={{ width: '250px', margin: '4px auto 2px auto', display: 'flex', gap: '3px', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '3px 4px', borderRadius: '4px', border: '1px solid rgba(0, 243, 255, 0.15)' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  className={`deck-btn-xs ${highwayEditMode === 'perform' ? 'active' : ''}`}
                  onClick={() => setHighwayEditMode('perform')}
                  title="Perform Mode (pads trigger live)"
                  style={{ 
                    fontSize: '0.42rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: highwayEditMode === 'perform' ? 'rgba(0, 243, 255, 0.35)' : 'rgba(255,255,255,0.05)', 
                    color: highwayEditMode === 'perform' ? '#00f3ff' : '#aaa',
                    border: `1px solid ${highwayEditMode === 'perform' ? '#00f3ff' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  🖐️ Play
                </button>
                <button
                  className={`deck-btn-xs ${highwayEditMode === 'draw' ? 'active' : ''}`}
                  onClick={() => setHighwayEditMode('draw')}
                  title="Draw Mode (click lane to add/remove notes)"
                  style={{ 
                    fontSize: '0.42rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: highwayEditMode === 'draw' ? 'rgba(0, 255, 102, 0.35)' : 'rgba(255,255,255,0.05)', 
                    color: highwayEditMode === 'draw' ? '#00ff66' : '#aaa',
                    border: `1px solid ${highwayEditMode === 'draw' ? '#00ff66' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Draw
                </button>
                <button
                  className={`deck-btn-xs ${highwayEditMode === 'resize' ? 'active' : ''}`}
                  onClick={() => setHighwayEditMode('resize')}
                  title="Resize Mode (drag notes to change length)"
                  style={{ 
                    fontSize: '0.42rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: highwayEditMode === 'resize' ? 'rgba(255, 230, 0, 0.35)' : 'rgba(255,255,255,0.05)', 
                    color: highwayEditMode === 'resize' ? '#ffe600' : '#aaa',
                    border: `1px solid ${highwayEditMode === 'resize' ? '#ffe600' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  ↔️ Size
                </button>
                <button
                  className={`deck-btn-xs ${highwayEditMode === 'erase' ? 'active' : ''}`}
                  onClick={() => setHighwayEditMode('erase')}
                  title="Erase Mode (click notes to delete)"
                  style={{ 
                    fontSize: '0.42rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: highwayEditMode === 'erase' ? 'rgba(255, 0, 85, 0.35)' : 'rgba(255,255,255,0.05)', 
                    color: highwayEditMode === 'erase' ? '#ff0055' : '#aaa',
                    border: `1px solid ${highwayEditMode === 'erase' ? '#ff0055' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Del
                </button>
              </div>

              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <button
                  className="deck-btn-xs"
                  onClick={() => handleCopyDeck('A')}
                  title="Copy Deck A notes"
                  style={{ 
                    fontSize: '0.4rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: 'rgba(255,255,255,0.05)',
                    color: '#ffe600',
                    border: '1px solid rgba(255, 230, 0, 0.3)',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Copy
                </button>
                <button
                  className="deck-btn-xs"
                  onClick={() => handlePasteDeck('A')}
                  disabled={!highwayClipboard}
                  title="Paste notes to Deck A"
                  style={{ 
                    fontSize: '0.4rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: 'rgba(255,255,255,0.05)',
                    color: '#00f3ff',
                    border: '1px solid rgba(0, 243, 255, 0.3)',
                    borderRadius: '2px',
                    cursor: highwayClipboard ? 'pointer' : 'default',
                    opacity: highwayClipboard ? 1 : 0.4
                  }}
                >
                  Paste
                </button>
                <button
                  className="deck-btn-xs"
                  onClick={() => handleClearDeck('A')}
                  title="Clear all notes on Deck A"
                  style={{ 
                    fontSize: '0.4rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: 'rgba(255,255,255,0.05)',
                    color: '#ff0055',
                    border: '1px solid rgba(255, 0, 85, 0.3)',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Vertical Highway for Deck A (sitting below Cue Play Sync row) */}
            <div 
              className="vertical-highway deck-a-highway"
              onMouseDown={(e) => handleHighwayMouseDown('A', e)}
              onMouseMove={handleHighwayMouseMove}
              onMouseUp={handleHighwayMouseUp}
              onMouseLeave={handleHighwayMouseUp}
              style={{ cursor: highwayEditMode === 'perform' ? 'default' : highwayEditMode === 'draw' ? 'crosshair' : highwayEditMode === 'resize' ? 'ns-resize' : 'pointer' }}
            >
              {Array.from({ length: 8 }).map((_, idx) => (
                <div 
                  key={`line-a-${idx}`} 
                  className="highway-lane-line" 
                  style={{ left: `${(idx + 0.5) * 31}px` }} 
                />
              ))}
              <div className="highway-playhead-line" />
              {Array.from({ length: 8 }).map((_, idx) => (
                <div 
                  key={`target-a-${idx}`} 
                  className="highway-target-circle" 
                  style={{ 
                    left: `${idx * 31 + 11.5}px`, 
                    borderColor: ringColors[idx],
                    background: activePerfPads[`A-slot-${idx}`] ? ringColors[idx] : 'transparent',
                    boxShadow: activePerfPads[`A-slot-${idx}`] ? `0 0 6px ${ringColors[idx]}` : 'none'
                  }} 
                />
              ))}
              {Array.from({ length: 8 }).map((_, idx) => (
                <div 
                  key={`lbl-a-${idx}`} 
                  className="highway-label" 
                  style={{ left: `${idx * 31 + 9.5}px`, color: ringColors[idx] }}
                >
                  A{idx + 1}
                </div>
              ))}
              <div 
                ref={highwayEventsRefA} 
                className="highway-events-container"
              >
                {/* Horizontal Grid lines (Tronesque Cyan) */}
                {Array.from({ length: 256 }).map((_, b) => {
                  const beatsPerBar = parseInt(perfTimeSignature.split('/')[0]) || 4;
                  const isBarStart = b % beatsPerBar === 0;
                  const barNum = Math.floor(b / beatsPerBar) + 1;
                  const beatInBar = (b % beatsPerBar) + 1;
                  const startY = - (b * highwayZoom);
                  
                  return (
                    <div 
                      key={`grid-line-a-${b}`}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: `${startY}px`,
                        height: 0,
                        borderBottom: isBarStart 
                          ? '1px solid rgba(0, 243, 255, 0.45)' 
                          : '1px dashed rgba(0, 243, 255, 0.18)',
                        pointerEvents: 'none'
                      }}
                    >
                      {/* Bar/Beat labels on the left and right sides */}
                      <span
                        style={{
                          position: 'absolute',
                          left: '4px',
                          bottom: '2px',
                          fontSize: '0.36rem',
                          fontFamily: 'monospace',
                          color: isBarStart ? '#00f3ff' : 'rgba(0, 243, 255, 0.6)',
                          textShadow: isBarStart ? '0 0 3px rgba(0, 243, 255, 0.8)' : 'none',
                          fontWeight: isBarStart ? 'bold' : 'normal',
                          lineHeight: 1,
                          userSelect: 'none'
                        }}
                      >
                        {isBarStart ? `BAR ${barNum}` : `${barNum}.${beatInBar}`}
                      </span>
                      <span
                        style={{
                          position: 'absolute',
                          right: '4px',
                          bottom: '2px',
                          fontSize: '0.36rem',
                          fontFamily: 'monospace',
                          color: isBarStart ? '#00f3ff' : 'rgba(0, 243, 255, 0.6)',
                          textShadow: isBarStart ? '0 0 3px rgba(0, 243, 255, 0.8)' : 'none',
                          fontWeight: isBarStart ? 'bold' : 'normal',
                          lineHeight: 1,
                          userSelect: 'none'
                        }}
                      >
                        {isBarStart ? `BAR ${barNum}` : `${barNum}.${beatInBar}`}
                      </span>
                    </div>
                  );
                })}
                {Array.from({ length: 8 }).map((_, laneIdx) => {
                  const pills = getPillsForLane('A', laneIdx);
                  const color = ringColors[laneIdx];
                  return (
                    <div key={`hw-lane-a-${laneIdx}`} style={{ position: 'absolute', left: `${laneIdx * 31}px`, width: '31px', top: 0, bottom: 0 }}>
                      {pills.map((pill, pIdx) => {
                        const startY = - (pill.start * highwayZoom);
                        const endY = - (pill.end * highwayZoom);
                        const height = startY - endY;
                        return (
                          <div
                            key={`hw-pill-a-${laneIdx}-${pIdx}`}
                            style={{
                              position: 'absolute',
                              left: '11.5px',
                              width: '8px',
                              bottom: `${startY}px`,
                              height: `${Math.max(6, height)}px`,
                              background: color,
                              borderRadius: '4px',
                              boxShadow: `0 0 6px ${color}`,
                              border: `1.5px solid ${color}`
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER MIXER COLUMN */}
        <div className="mixer-column" style={{ padding: '8px 4px' }}>
          <span style={{ fontSize: '0.52rem', color: '#ffe600', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Mixer
          </span>
          
          {/* EQ Knobs / Vertical sliders & VU Meter Section */}
          <div className="mixer-eq-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {/* EQ Channel A */}
            <div className="mixer-eq-channel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <Knob 
                label="HI"
                value={deckAEqHigh}
                min={-1.0} max={1.0} step={0.05} defaultValue={0.0}
                onChange={setDeckAEqHigh}
                displayFormat={(v) => v > 0 ? `+${Math.round(v * 100)}` : Math.round(v * 100)}
                glowColor="cyan"
                size={26}
              />
              <Knob 
                label="MID"
                value={deckAEqMid}
                min={-1.0} max={1.0} step={0.05} defaultValue={0.0}
                onChange={setDeckAEqMid}
                displayFormat={(v) => v > 0 ? `+${Math.round(v * 100)}` : Math.round(v * 100)}
                glowColor="cyan"
                size={26}
              />
              <Knob 
                label="LOW"
                value={deckAEqLow}
                min={-1.0} max={1.0} step={0.05} defaultValue={0.0}
                onChange={setDeckAEqLow}
                displayFormat={(v) => v > 0 ? `+${Math.round(v * 100)}` : Math.round(v * 100)}
                glowColor="cyan"
                size={26}
              />
            </div>
            
            {/* Central LED VU Meter — segments driven by DOM refs, NOT React state (Issue 1) */}
            <div style={{ 
              display: 'flex', 
              gap: '3px', 
              background: '#040812', 
              padding: '6px 4px', 
              borderRadius: '5px', 
              border: '1px solid rgba(0, 243, 255, 0.15)',
              height: '135px',
              margin: '0 6px',
              alignItems: 'center'
            }}>
              {/* Left Channel (Deck A) */}
              <div style={{ display: 'flex', gap: '2px', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                {[...Array(10)].map((_, idx) => {
                  const segIdx = 9 - idx;
                  return (
                    <div 
                      key={`vu-l-${segIdx}`}
                      ref={el => { vuSegLRefsArr.current[idx] = el; }}
                      style={{ 
                        width: '4px', 
                        height: '9px', 
                        background: '#111827', 
                        borderRadius: '0.8px',
                      }} 
                    />
                  );
                })}
              </div>
              
              {/* Right Channel (Deck B) */}
              <div style={{ display: 'flex', gap: '2px', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                {[...Array(10)].map((_, idx) => {
                  const segIdx = 9 - idx;
                  return (
                    <div 
                      key={`vu-r-${segIdx}`}
                      ref={el => { vuSegRRefsArr.current[idx] = el; }}
                      style={{ 
                        width: '4px', 
                        height: '9px', 
                        background: '#111827', 
                        borderRadius: '0.8px',
                      }} 
                    />
                  );
                })}
              </div>
            </div>

            {/* EQ Channel B */}
            <div className="mixer-eq-channel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <Knob 
                label="HI"
                value={deckBEqHigh}
                min={-1.0} max={1.0} step={0.05} defaultValue={0.0}
                onChange={setDeckBEqHigh}
                displayFormat={(v) => v > 0 ? `+${Math.round(v * 100)}` : Math.round(v * 100)}
                glowColor="pink"
                size={26}
              />
              <Knob 
                label="MID"
                value={deckBEqMid}
                min={-1.0} max={1.0} step={0.05} defaultValue={0.0}
                onChange={setDeckBEqMid}
                displayFormat={(v) => v > 0 ? `+${Math.round(v * 100)}` : Math.round(v * 100)}
                glowColor="pink"
                size={26}
              />
              <Knob 
                label="LOW"
                value={deckBEqLow}
                min={-1.0} max={1.0} step={0.05} defaultValue={0.0}
                onChange={setDeckBEqLow}
                displayFormat={(v) => v > 0 ? `+${Math.round(v * 100)}` : Math.round(v * 100)}
                glowColor="pink"
                size={26}
              />
            </div>
          </div>

          {/* Lower controls: Channel Volume faders and Crossfader directly below the EQ/VU Section */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', gap: '6px' }}>
            {/* Channel volume faders */}
            <div className="mixer-vol-faders" style={{ margin: '0', padding: '0 4px', width: '100%', display: 'flex', justifyContent: 'space-around' }}>
              <div className="mixer-fader-wrapper">
                <span className="mixer-fader-label">A</span>
                <input 
                  type="range" min="0.0" max="1.0" step="0.02" 
                  value={deckAVolFader} 
                  onChange={(e) => setDeckAVolFader(parseFloat(e.target.value))}
                  className="mixer-vol-slider"
                />
              </div>
              <div className="mixer-fader-wrapper">
                <span className="mixer-fader-label">B</span>
                <input 
                  type="range" min="0.0" max="1.0" step="0.02" 
                  value={deckBVolFader} 
                  onChange={(e) => setDeckBVolFader(parseFloat(e.target.value))}
                  className="mixer-vol-slider"
                />
              </div>
            </div>

            {/* Crossfader */}
            <div className="crossfader-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 6px' }}>
                <span className="crossfader-label" style={{ color: '#00f3ff' }}>A</span>
                <span className="crossfader-label" style={{ fontSize: '0.38rem', color: '#666', letterSpacing: '1px' }}>CROSSFADER</span>
                <span className="crossfader-label" style={{ color: '#ff5599' }}>B</span>
              </div>
              <input 
                type="range" min="-1.0" max="1.0" step="0.01" 
                value={crossfaderVal} 
                onChange={(e) => setCrossfaderVal(parseFloat(e.target.value))}
                className="crossfader-slider"
              />
              {/* Centre snap indicator */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
                <button
                  onClick={() => setCrossfaderVal(0)}
                  style={{
                    background: crossfaderVal === 0 ? 'rgba(0,243,255,0.18)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${crossfaderVal === 0 ? '#00f3ff' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: '3px', color: crossfaderVal === 0 ? '#00f3ff' : '#555',
                    fontSize: '0.35rem', padding: '1px 6px', cursor: 'pointer',
                    fontFamily: 'monospace', letterSpacing: '0.5px', transition: 'all 0.15s'
                  }}
                >CTR</button>
              </div>
            </div>

            {/* Master Volume Knob */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              marginTop: '4px', gap: '2px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '5px', padding: '4px 10px'
            }}>
              <span style={{
                fontSize: '0.34rem', color: '#8c9ba5', textTransform: 'uppercase',
                fontFamily: 'monospace', letterSpacing: '1px', lineHeight: 1
              }}>Master Vol</span>
              <Knob
                label=""
                value={params.masterVolume}
                min={0} max={100} step={1} defaultValue={80}
                onChange={(v) => {
                  setParams(prev => ({ ...prev, masterVolume: Math.round(v) }));
                  if (masterGainRef.current) {
                    masterGainRef.current.gain.setTargetAtTime(v / 100 * 0.5, audioCtxRef.current?.currentTime || 0, 0.02);
                  }
                }}
                displayFormat={(v) => `${Math.round(v)}`}
                glowColor="white"
                size={32}
              />
            </div>

            {/* Red Digital Tempo Clock */}
            <div style={{
              marginTop: '6px',
              background: '#120202',
              border: '1px solid #ff1a1a',
              boxShadow: '0 0 6px rgba(255,0,0,0.35), inset 0 0 3px rgba(255,0,0,0.2)',
              borderRadius: '4px',
              padding: '3px 6px',
              width: '94%',
              textAlign: 'center',
              fontFamily: 'monospace',
              userSelect: 'none'
            }}>
              <div style={{ fontSize: '0.36rem', color: 'rgba(255, 30, 30, 0.6)', textTransform: 'uppercase', letterSpacing: '0.8px', lineHeight: 1 }}>
                TEMPO BPM
              </div>
              <div style={{ fontSize: '0.82rem', color: '#ff2828', fontWeight: 'bold', textShadow: '0 0 4px #ff0000', letterSpacing: '0.5px', marginTop: '1px', lineHeight: 1 }}>
                {(params.arpBpm || 120).toFixed(1)}
              </div>
            </div>

            {/* Tempo Speed Knob */}
            <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'center' }}>
              <Knob 
                label="Tempo"
                value={params.arpBpm || 120}
                min={40} max={250} step={0.1} defaultValue={120}
                onChange={(v) => setParams(prev => ({ ...prev, arpBpm: v }))}
                displayFormat={(v) => `${v.toFixed(1)}`}
                glowColor="yellow"
                size={26}
              />
            </div>

            {/* Time Signature & Click controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '94%', marginTop: '5px', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '0.36rem', color: '#8c9ba5', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '2px', lineHeight: 1 }}>SIG</span>
                <select
                  value={perfTimeSignature}
                  onChange={(e) => setPerfTimeSignature(e.target.value)}
                  style={{
                    background: 'rgba(21, 26, 33, 0.85)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#ffe600',
                    fontSize: '0.45rem',
                    borderRadius: '3px',
                    padding: '2px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    outline: 'none',
                    width: '44px',
                    height: '17px',
                    textAlign: 'center'
                  }}
                >
                  <option value="4/4">4/4</option>
                  <option value="3/4">3/4</option>
                  <option value="2/4">2/4</option>
                  <option value="6/8">6/8</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '0.36rem', color: '#8c9ba5', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '2px', lineHeight: 1 }}>METRO</span>
                <button
                  className={`deck-btn ${metronomeOn ? 'active' : ''}`}
                  onClick={() => {
                    if (metronomeOn) {
                      stopMetronome();
                      setMetronomeOn(false);
                    } else {
                      setMetronomeOn(true);
                      startMetronome();
                    }
                  }}
                  style={{
                    width: '44px',
                    height: '17px',
                    padding: '0',
                    fontSize: '0.40rem',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    background: metronomeOn ? 'rgba(0, 255, 150, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${metronomeOn ? '#00ff96' : 'rgba(255,255,255,0.18)'}`,
                    color: metronomeOn ? '#00ff96' : '#8c9ba5',
                    boxShadow: metronomeOn ? '0 0 5px rgba(0, 255, 150, 0.25)' : 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    lineHeight: '15px'
                  }}
                >
                  {metronomeOn ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Master Sync Button */}
            <button
              className={`deck-btn ${masterSyncActive ? 'active' : ''}`}
              onClick={() => {
                const nextActive = !masterSyncActive;
                setMasterSyncActive(nextActive);
                showEditorStatus(`Master Tempo Sync: ${nextActive ? 'ON' : 'OFF'} 🔄`);
              }}
              style={{
                marginTop: '6px',
                width: '94%',
                padding: '3px 0',
                fontSize: '0.50rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                fontFamily: 'monospace',
                background: masterSyncActive ? 'rgba(255, 230, 0, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${masterSyncActive ? '#ffe600' : 'rgba(255,255,255,0.18)'}`,
                color: masterSyncActive ? '#ffe600' : '#8c9ba5',
                boxShadow: masterSyncActive ? '0 0 6px rgba(255, 230, 0, 0.25)' : 'none',
                cursor: 'pointer',
                borderRadius: '3px',
                transition: 'all 0.12s ease'
              }}
            >
              {masterSyncActive ? 'Sync Active' : 'Master Sync'}
            </button>

            {/* Live Looper Dashboard */}
            <div style={{
              marginTop: '6px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '6px',
              width: '94%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '0.40rem', color: '#00f3ff', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Live Loop Rec
              </span>
              
              {/* Row 1: Target slot & Beats select */}
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <span style={{ fontSize: '0.34rem', color: '#8c9ba5', fontFamily: 'monospace', marginBottom: '2px' }}>TARGET</span>
                  <select
                    value={liveRecTargetSlot}
                    onChange={(e) => setLiveRecTargetSlot(e.target.value)}
                    style={{
                      background: 'rgba(21, 26, 33, 0.85)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#00f3ff',
                      fontSize: '0.45rem',
                      borderRadius: '3px',
                      padding: '1px 2px',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      outline: 'none',
                      width: '100%',
                      height: '17px',
                      textAlign: 'center'
                    }}
                  >
                    {Array.from({ length: 8 }).map((_, i) => (
                      <option key={`a-${i}`} value={`a0${i+1}`}>A{i+1}</option>
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <option key={`b-${i}`} value={`b0${i+1}`}>B{i+1}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <span style={{ fontSize: '0.34rem', color: '#8c9ba5', fontFamily: 'monospace', marginBottom: '2px' }}>BEATS</span>
                  <select
                    value={liveRecBeats}
                    onChange={(e) => setLiveRecBeats(parseInt(e.target.value))}
                    style={{
                      background: 'rgba(21, 26, 33, 0.85)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#00f3ff',
                      fontSize: '0.45rem',
                      borderRadius: '3px',
                      padding: '1px 2px',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      outline: 'none',
                      width: '100%',
                      height: '17px',
                      textAlign: 'center'
                    }}
                  >
                    {[2, 4, 8, 12, 16, 32, 64].map(b => (
                      <option key={b} value={b}>{b}b</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 1.5: Input device selector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1px' }}>
                <span style={{ fontSize: '0.34rem', color: '#8c9ba5', fontFamily: 'monospace' }}>INPUT HARDWARE</span>
                <select
                  value={selectedAudioDevice}
                  onChange={(e) => handleAudioDeviceChange(e.target.value)}
                  style={{
                    background: 'rgba(21, 26, 33, 0.85)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#00f3ff',
                    fontSize: '0.45rem',
                    borderRadius: '3px',
                    padding: '1px 2px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    outline: 'none',
                    width: '100%',
                    height: '17px',
                    textAlign: 'center'
                  }}
                >
                  {audioDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Dev ${d.deviceId.slice(0, 5)}...`}
                    </option>
                  ))}
                  {audioDevices.length === 0 && <option value="">Default Input</option>}
                </select>
              </div>

              {/* Row 2: Live Record Button */}
              <button
                className={`deck-btn ${isLiveRecording ? 'active' : ''}`}
                onClick={toggleLiveLoopRecording}
                style={{
                  width: '100%',
                  padding: '3px 0',
                  fontSize: '0.46rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  fontFamily: 'monospace',
                  background: isLiveRecording 
                    ? 'rgba(255, 0, 85, 0.25)' 
                    : (liveRecPendingStart ? 'rgba(255, 230, 0, 0.22)' : 'rgba(255, 255, 255, 0.05)'),
                  border: `1px solid ${isLiveRecording 
                    ? '#ff0055' 
                    : (liveRecPendingStart ? '#ffe600' : 'rgba(255,255,255,0.18)')}`,
                  color: isLiveRecording 
                    ? '#ff0055' 
                    : (liveRecPendingStart ? '#ffe600' : '#8c9ba5'),
                  boxShadow: isLiveRecording 
                    ? '0 0 6px rgba(255, 0, 85, 0.35)' 
                    : (liveRecPendingStart ? '0 0 6px rgba(255, 230, 0, 0.25)' : 'none'),
                  cursor: 'pointer',
                  borderRadius: '3px',
                  transition: 'all 0.12s ease',
                  animation: liveRecPendingStart ? 'knob-pulse-yellow 0.6s infinite alternate' : 'none'
                }}
              >
                {isLiveRecording 
                  ? 'Rec Active' 
                  : (liveRecPendingStart ? 'Pending Beat...' : 'Live Rec (Pedal CC64)')}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT DECK (DECK B) */}
        <div className="turntable-deck" style={{ borderLeft: 'none' }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#ff00ff', letterSpacing: '2px', fontFamily: 'monospace' }}>
              DECK B &mdash; {getSlotLabel(params.oscBWave)}
            </span>
            
            <div className="vinyl-platter-wrapper">
              <div 
                ref={platterRefB}
                className="vinyl-platter"
                onMouseDown={(e) => handlePlatterMouseDown('B', e)}
                onMouseMove={(e) => handlePlatterMouseMove('B', e)}
                onMouseUp={() => handlePlatterMouseUp('B')}
                onMouseLeave={() => handlePlatterMouseUp('B')}
                onTouchStart={(e) => { e.preventDefault(); handlePlatterMouseDown('B', e.touches[0]); }}
                onTouchMove={(e) => { e.preventDefault(); handlePlatterMouseMove('B', e.touches[0]); }}
                onTouchEnd={() => handlePlatterMouseUp('B')}
                style={{ 
                  transform: `rotate(${platterAngleBRef.current}deg)`,
                  transition: 'none'
                }}
              >
                {/* Vector Vinyl Disc inside the rotating div */}
                <svg width="250" height="250" viewBox="0 0 250 250" style={{ display: 'block', pointerEvents: 'none' }}>
                  <defs>
                    <radialGradient id="vinylGradB" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#2c2c2c" />
                      <stop offset="25%" stopColor="#181818" />
                      <stop offset="60%" stopColor="#080808" />
                      <stop offset="90%" stopColor="#020202" />
                      <stop offset="100%" stopColor="#000000" />
                    </radialGradient>
                  </defs>
                  {/* Black Vinyl Grooves Background */}
                  <circle cx="125" cy="125" r="123" fill="url(#vinylGradB)" stroke="#333" strokeWidth="2.5" />
                  {/* Groove lines details */}
                  <circle cx="125" cy="125" r="110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <circle cx="125" cy="125" r="95" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <circle cx="125" cy="125" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                </svg>
              </div>

              {/* 8 Concentric Playhead Rings & Central display (Stationary Overlay) */}
              <svg 
                width="250" 
                height="250" 
                viewBox="0 0 250 250" 
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 3 }}
              >
                {ringColors.map((color, idx) => {
                  const r = 115 - idx * 9;
                  return (
                    <g key={idx}>
                      {/* Dashed track circle */}
                      <circle
                        ref={(el) => { if (el) ringTracksRefB.current[idx] = el; }}
                        cx="125"
                        cy="125"
                        r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth="2.2"
                        strokeDasharray="4, 5"
                        style={{
                          transformOrigin: '125px 125px',
                          opacity: 0.18,
                          transition: 'opacity 0.2s ease'
                        }}
                      />
                      {/* Bright glowing playhead dot */}
                      <circle
                        ref={(el) => { if (el) ringDotsRefB.current[idx] = el; }}
                        cx="125"
                        cy={125 - r}
                        r="3.5"
                        fill="#ffffff"
                        stroke={color}
                        strokeWidth="1.5"
                        style={{
                          opacity: 0,
                          transformOrigin: '125px 125px',
                          filter: `drop-shadow(0 0 5px ${color})`,
                          transition: 'opacity 0.1s ease'
                        }}
                      />
                    </g>
                  );
                })}

                {/* Center Display Hub (Stationary) */}
                <circle cx="125" cy="125" r="38" fill="#0c1220" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                <circle cx="125" cy="125" r="34" fill="#040810" />
                
                <text 
                  x="125" 
                  y="117" 
                  textAnchor="middle" 
                  fill="#ff00ff" 
                  fontSize="8" 
                  fontWeight="bold" 
                  fontFamily="monospace"
                  letterSpacing="0.5px"
                >
                  OSC B
                </text>
                <text 
                  x="125" 
                  y="133" 
                  textAnchor="middle" 
                  fill="#ffffff" 
                  fontSize="7" 
                  fontFamily="monospace"
                  opacity="0.85"
                >
                  {sampleSlotsRef.current.find(s => s.id === params.oscBWave)?.name.substring(0, 6).toUpperCase() || 'EMPTY'}
                </text>
              </svg>
            </div>

            {/* 2 Rows of 4 Pads (2x4 Grid) for Deck B */}
            <div className="performance-pads-grid-2x4">
              {Array.from({ length: 8 }).map((_, idx) => {
                const slotId = `b0${idx + 1}`;
                const slot = sampleSlots.find(s => s.id === slotId);
                const isLoaded = slot && slot.buffer;
                const padKey = `B-slot-${idx}`;
                const isActive = activePerfPads[padKey];
                const isPending = activePerfPads[`${padKey}-pending`];
                
                const fxType = slot?.fxType || 'None';
                const fxSend = slot?.fxSend !== undefined ? slot.fxSend : 0.0;
                const pan = slot?.pan !== undefined ? slot.pan : 0.0;

                const ringColor = ringColors[idx];
                const padStyle = isLoaded ? {
                  borderColor: isActive ? '#ffffff' : `${ringColor}73`,
                  background: isActive ? ringColor : `${ringColor}14`,
                  color: isActive ? '#000000' : ringColor,
                  boxShadow: isActive ? `0 0 15px ${ringColor}, inset 0 0 4px rgba(255,255,255,0.8)` : `inset 0 0 6px ${ringColor}1a`,
                } : {};

                return (
                  <div
                    key={slotId}
                    className={`perf-pad ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}
                    style={padStyle}
                    onMouseDown={() => triggerPerfPadInternal('B', 'slot', idx, 100, true, true)}
                    onMouseUp={() => triggerPerfPadInternal('B', 'slot', idx, 100, false, true)}
                    onMouseLeave={() => triggerPerfPadInternal('B', 'slot', idx, 100, false, true)}
                    onTouchStart={(e) => { e.preventDefault(); triggerPerfPadInternal('B', 'slot', idx, 100, true, true); }}
                    onTouchEnd={(e) => { e.preventDefault(); triggerPerfPadInternal('B', 'slot', idx, 100, false, true); }}
                    onContextMenu={(e) => handlePadRightClick(e, 'B', idx)}
                    title={isLoaded ? `${slot.name} (Right-click to route)` : 'Empty Slot'}
                  >
                    <span className="perf-pad-label">B{idx + 1}</span>
                    <span className="perf-pad-name">{isLoaded ? slot.name.substring(0, 8) : '---'}</span>
                    
                    {/* Visual badges for FX and Pan */}
                    {isLoaded && (
                      <div className="perf-pad-routing-badges">
                        {slot.routeToXyPad === false && (
                          <span className="pad-badge-dry" style={{ border: '1px solid #718096', color: '#a0aec0', background: 'rgba(113, 128, 150, 0.15)', fontSize: '0.38rem', padding: '0px 2px', borderRadius: '2px', lineHeight: 1 }} title="Bypasses Delta XY Modulator">
                            BYP
                          </span>
                        )}
                        {fxType !== 'None' && (
                          <span className="pad-badge-fx" style={{ border: `1px solid ${ringColor}`, color: ringColor, background: `${ringColor}18` }} title={`FX: ${fxType} (${Math.round(fxSend * 100)}%)`}>
                            {fxType === 'Space Echo' ? 'DLY' : fxType === 'Rotor Cabinet' ? 'ROT' : 'RVB'}: {Math.round(fxSend * 100)}%
                          </span>
                        )}
                        {Math.abs(pan) > 0.02 && (
                          <span className="pad-badge-pan" title={`Pan: ${pan > 0 ? 'R' : 'L'}${Math.abs(Math.round(pan * 100))}%`}>
                            P: {pan > 0 ? 'R' : 'L'}{Math.abs(Math.round(pan * 100))}%
                          </span>
                        )}
                      </div>
                    )}

                    {isLoaded && (
                      <button
                        className="perf-pad-rev-badge"
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          left: '2px',
                          background: slot.reverseOn ? 'rgba(255, 70, 70, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                          border: `1px solid ${slot.reverseOn ? '#ff4444' : 'rgba(255,255,255,0.2)'}`,
                          borderRadius: '2px',
                          color: slot.reverseOn ? '#ff4444' : '#aaa',
                          fontSize: '0.42rem',
                          padding: '1px 3px',
                          lineHeight: 1,
                          cursor: 'pointer',
                          zIndex: 5
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = { ...slot, reverseOn: !slot.reverseOn };
                          setSampleSlots(prev => prev.map(s => s.id === slotId ? updated : s));
                          saveSampleToDb(updated).catch(err => console.error("Failed to save slot reverse:", err));
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                      >
                        {slot.reverseOn ? 'REV' : 'FWD'}
                      </button>
                    )}

                    {isLoaded && (
                      <button
                        className="perf-pad-loop-badge"
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          background: slot.loopOn ? `${ringColor}40` : 'rgba(255, 255, 255, 0.08)',
                          border: `1px solid ${slot.loopOn ? ringColor : 'rgba(255,255,255,0.2)'}`,
                          borderRadius: '2px',
                          color: slot.loopOn ? ringColor : '#aaa',
                          fontSize: '0.42rem',
                          padding: '1px 3px',
                          lineHeight: 1,
                          cursor: 'pointer',
                          zIndex: 5
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSlotLoop(slotId, e);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                      >
                        {slot.loopOn ? 'LOOP' : '1-SHOT'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Transport controls */}
            <div className="deck-row" style={{ width: '100%', marginTop: '6px', padding: '0 4px' }}>
              <button 
                className={`deck-btn deck-btn-sync ${deckBSoloActive ? 'active' : ''}`}
                onClick={() => {
                  const nextSolo = !deckBSoloActive;
                  setDeckBSoloActive(nextSolo);
                  showEditorStatus(`Deck B Solo Mode: ${nextSolo ? 'ON' : 'OFF'} 🎧`);
                }}
                title="Solo Deck B (Only one pad plays at a time)"
              >
                Solo
              </button>
              <button 
                className="deck-btn deck-btn-cue"
                onClick={() => {
                  for (let i = 0; i < 8; i++) {
                    stopPerfVoice(`perf-b-slice-${i}`);
                    stopPerfVoice(`perf-b-slot-${i}`);
                  }
                  setDeckBPlaying(false);
                  showEditorStatus("Deck B Cued ⏹️");
                }}
              >
                Cue
              </button>
              <button 
                className={`deck-btn deck-btn-play ${deckBPlaying ? 'active' : ''}`}
                onClick={() => {
                  const activeBIdx = sampleSlots.findIndex(s => s.id === params.oscBWave);
                  const idx = activeBIdx >= 0 ? activeBIdx : 0;
                  triggerPerfPadInternal('B', 'slot', idx, 100, !deckBPlaying, false);
                }}
              >
                {deckBPlaying ? 'Pause' : 'Play'}
              </button>
            </div>

            {/* Highway Editor Controls for Deck B */}
            <div className="deck-row" style={{ width: '250px', margin: '4px auto 2px auto', display: 'flex', gap: '3px', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '3px 4px', borderRadius: '4px', border: '1px solid rgba(0, 243, 255, 0.15)' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  className={`deck-btn-xs ${highwayEditMode === 'perform' ? 'active' : ''}`}
                  onClick={() => setHighwayEditMode('perform')}
                  title="Perform Mode (pads trigger live)"
                  style={{ 
                    fontSize: '0.42rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: highwayEditMode === 'perform' ? 'rgba(0, 243, 255, 0.35)' : 'rgba(255,255,255,0.05)', 
                    color: highwayEditMode === 'perform' ? '#00f3ff' : '#aaa',
                    border: `1px solid ${highwayEditMode === 'perform' ? '#00f3ff' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  🖐️ Play
                </button>
                <button
                  className={`deck-btn-xs ${highwayEditMode === 'draw' ? 'active' : ''}`}
                  onClick={() => setHighwayEditMode('draw')}
                  title="Draw Mode (click lane to add/remove notes)"
                  style={{ 
                    fontSize: '0.42rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: highwayEditMode === 'draw' ? 'rgba(0, 255, 102, 0.35)' : 'rgba(255,255,255,0.05)', 
                    color: highwayEditMode === 'draw' ? '#00ff66' : '#aaa',
                    border: `1px solid ${highwayEditMode === 'draw' ? '#00ff66' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Draw
                </button>
                <button
                  className={`deck-btn-xs ${highwayEditMode === 'resize' ? 'active' : ''}`}
                  onClick={() => setHighwayEditMode('resize')}
                  title="Resize Mode (drag notes to change length)"
                  style={{ 
                    fontSize: '0.42rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: highwayEditMode === 'resize' ? 'rgba(255, 230, 0, 0.35)' : 'rgba(255,255,255,0.05)', 
                    color: highwayEditMode === 'resize' ? '#ffe600' : '#aaa',
                    border: `1px solid ${highwayEditMode === 'resize' ? '#ffe600' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  ↔️ Size
                </button>
                <button
                  className={`deck-btn-xs ${highwayEditMode === 'erase' ? 'active' : ''}`}
                  onClick={() => setHighwayEditMode('erase')}
                  title="Erase Mode (click notes to delete)"
                  style={{ 
                    fontSize: '0.42rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: highwayEditMode === 'erase' ? 'rgba(255, 0, 85, 0.35)' : 'rgba(255,255,255,0.05)', 
                    color: highwayEditMode === 'erase' ? '#ff0055' : '#aaa',
                    border: `1px solid ${highwayEditMode === 'erase' ? '#ff0055' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Del
                </button>
              </div>

              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <button
                  className="deck-btn-xs"
                  onClick={() => handleCopyDeck('B')}
                  title="Copy Deck B notes"
                  style={{ 
                    fontSize: '0.4rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: 'rgba(255,255,255,0.05)',
                    color: '#ffe600',
                    border: '1px solid rgba(255, 230, 0, 0.3)',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Copy
                </button>
                <button
                  className="deck-btn-xs"
                  onClick={() => handlePasteDeck('B')}
                  disabled={!highwayClipboard}
                  title="Paste notes to Deck B"
                  style={{ 
                    fontSize: '0.4rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: 'rgba(255,255,255,0.05)',
                    color: '#00f3ff',
                    border: '1px solid rgba(0, 243, 255, 0.3)',
                    borderRadius: '2px',
                    cursor: highwayClipboard ? 'pointer' : 'default',
                    opacity: highwayClipboard ? 1 : 0.4
                  }}
                >
                  Paste
                </button>
                <button
                  className="deck-btn-xs"
                  onClick={() => handleClearDeck('B')}
                  title="Clear all notes on Deck B"
                  style={{ 
                    fontSize: '0.4rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: 'rgba(255,255,255,0.05)',
                    color: '#ff0055',
                    border: '1px solid rgba(255, 0, 85, 0.3)',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Vertical Highway for Deck B (sitting below Cue Play Sync row) */}
            <div 
              className="vertical-highway deck-b-highway"
              onMouseDown={(e) => handleHighwayMouseDown('B', e)}
              onMouseMove={handleHighwayMouseMove}
              onMouseUp={handleHighwayMouseUp}
              onMouseLeave={handleHighwayMouseUp}
              style={{ cursor: highwayEditMode === 'perform' ? 'default' : highwayEditMode === 'draw' ? 'crosshair' : highwayEditMode === 'resize' ? 'ns-resize' : 'pointer' }}
            >
              {Array.from({ length: 8 }).map((_, idx) => (
                <div 
                  key={`line-b-${idx}`} 
                  className="highway-lane-line" 
                  style={{ left: `${(idx + 0.5) * 31}px` }} 
                />
              ))}
              <div className="highway-playhead-line" />
              {Array.from({ length: 8 }).map((_, idx) => (
                <div 
                  key={`target-b-${idx}`} 
                  className="highway-target-circle" 
                  style={{ 
                    left: `${idx * 31 + 11.5}px`, 
                    borderColor: ringColors[idx],
                    background: activePerfPads[`B-slot-${idx}`] ? ringColors[idx] : 'transparent',
                    boxShadow: activePerfPads[`B-slot-${idx}`] ? `0 0 6px ${ringColors[idx]}` : 'none'
                  }} 
                />
              ))}
              {Array.from({ length: 8 }).map((_, idx) => (
                <div 
                  key={`lbl-b-${idx}`} 
                  className="highway-label" 
                  style={{ left: `${idx * 31 + 9.5}px`, color: ringColors[idx] }}
                >
                  B{idx + 1}
                </div>
              ))}
              <div 
                ref={highwayEventsRefB} 
                className="highway-events-container"
              >
                {/* Horizontal Grid lines (Tronesque Cyan) */}
                {Array.from({ length: 256 }).map((_, b) => {
                  const beatsPerBar = parseInt(perfTimeSignature.split('/')[0]) || 4;
                  const isBarStart = b % beatsPerBar === 0;
                  const barNum = Math.floor(b / beatsPerBar) + 1;
                  const beatInBar = (b % beatsPerBar) + 1;
                  const startY = - (b * highwayZoom);
                  
                  return (
                    <div 
                      key={`grid-line-b-${b}`}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: `${startY}px`,
                        height: 0,
                        borderBottom: isBarStart 
                          ? '1px solid rgba(0, 243, 255, 0.45)' 
                          : '1px dashed rgba(0, 243, 255, 0.18)',
                        pointerEvents: 'none'
                      }}
                    >
                      {/* Bar/Beat labels on the left and right sides */}
                      <span
                        style={{
                          position: 'absolute',
                          left: '4px',
                          bottom: '2px',
                          fontSize: '0.36rem',
                          fontFamily: 'monospace',
                          color: isBarStart ? '#00f3ff' : 'rgba(0, 243, 255, 0.6)',
                          textShadow: isBarStart ? '0 0 3px rgba(0, 243, 255, 0.8)' : 'none',
                          fontWeight: isBarStart ? 'bold' : 'normal',
                          lineHeight: 1,
                          userSelect: 'none'
                        }}
                      >
                        {isBarStart ? `BAR ${barNum}` : `${barNum}.${beatInBar}`}
                      </span>
                      <span
                        style={{
                          position: 'absolute',
                          right: '4px',
                          bottom: '2px',
                          fontSize: '0.36rem',
                          fontFamily: 'monospace',
                          color: isBarStart ? '#00f3ff' : 'rgba(0, 243, 255, 0.6)',
                          textShadow: isBarStart ? '0 0 3px rgba(0, 243, 255, 0.8)' : 'none',
                          fontWeight: isBarStart ? 'bold' : 'normal',
                          lineHeight: 1,
                          userSelect: 'none'
                        }}
                      >
                        {isBarStart ? `BAR ${barNum}` : `${barNum}.${beatInBar}`}
                      </span>
                    </div>
                  );
                })}
                {Array.from({ length: 8 }).map((_, laneIdx) => {
                  const pills = getPillsForLane('B', laneIdx);
                  const color = ringColors[laneIdx];
                  return (
                    <div key={`hw-lane-b-${laneIdx}`} style={{ position: 'absolute', left: `${laneIdx * 31}px`, width: '31px', top: 0, bottom: 0 }}>
                      {pills.map((pill, pIdx) => {
                        const startY = - (pill.start * highwayZoom);
                        const endY = - (pill.end * highwayZoom);
                        const height = startY - endY;
                        return (
                          <div
                            key={`hw-pill-b-${laneIdx}-${pIdx}`}
                            style={{
                              position: 'absolute',
                              left: '11.5px',
                              width: '8px',
                              bottom: `${startY}px`,
                              height: `${Math.max(6, height)}px`,
                              background: color,
                              borderRadius: '4px',
                              boxShadow: `0 0 6px ${color}`,
                              border: `1.5px solid ${color}`
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* BOTTOM ROW: PERFORMANCE SEQUENCER DIGITAL CONTROL PANEL */}
        <div className="perf-timeline-panel" style={{ padding: '8px 12px', background: 'rgba(5, 10, 20, 0.9)', borderTop: '1px solid rgba(0, 243, 255, 0.25)', borderRadius: '0 0 8px 8px' }}>
          <div className="perf-timeline-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div className="perf-timeline-title" style={{ fontSize: '0.62rem', letterSpacing: '1px', color: '#ffe600', fontWeight: 'bold', fontFamily: 'monospace' }}>
              16-LANE VERTICAL HIGHWAY PERFORMANCE SEQUENCER
            </div>
            <div className="perf-timeline-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              
              {/* Digital Beat Timer display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', borderRadius: '3px', padding: '2px 6px', fontFamily: 'monospace' }}>
                <span style={{ fontSize: '0.48rem', color: '#888' }}>BEAT:</span>
                <span ref={seqTimerDisplayRef} style={{ fontSize: '0.68rem', color: '#00f3ff', fontWeight: 'bold', minWidth: '40px', display: 'inline-block', textAlign: 'right' }}>0.0</span>
              </div>

              {/* Highway Zoom Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 243, 255, 0.2)', borderRadius: '4px', padding: '3px 8px', height: '26px' }}>
                <span style={{ fontSize: '0.48rem', color: '#888', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>ZOOM:</span>
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={highwayZoom}
                  onChange={(e) => setHighwayZoom(parseInt(e.target.value))}
                  style={{ width: '60px', height: '6px', accentColor: '#00f3ff', cursor: 'pointer' }}
                  title="Zoom in/out of the performance sequencer highways"
                />
                <span style={{ fontSize: '0.48rem', color: '#00f3ff', fontFamily: 'monospace', minWidth: '22px' }}>{highwayZoom}px</span>
              </div>

              {/* Tape-style DAW Transport Controls */}
              <div className="transport-strip" style={{ display: 'flex', gap: '3px', background: 'rgba(0, 0, 0, 0.4)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(0, 243, 255, 0.2)' }}>
                {/* Rewind */}
                <button
                  className="deck-btn"
                  onClick={() => {
                    const nextBeat = Math.max(0.0, seqCurrentBeatRef.current - 4.0);
                    seqCurrentBeatRef.current = nextBeat;
                    seqStartBeatOffsetRef.current = nextBeat;
                    if (perfPlaybackActiveRef.current) {
                      const ctx = audioCtxRef.current;
                      if (ctx) {
                        perfPlayStartTimeRef.current = ctx.currentTime;
                        if (schedulerNodeRef.current) {
                          schedulerNodeRef.current.port.postMessage({
                            type: 'START_PLAYBACK',
                            startTime: ctx.currentTime,
                            startBeatOffset: nextBeat,
                            sortedEvents: sortedPerfEventsRef.current
                          });
                        }
                      }
                    }
                    showEditorStatus(`Rewound 4 Beats (to ${nextBeat.toFixed(1)}) ⏪`);
                  }}
                  style={{ height: '18px', padding: '1px 6px', fontSize: '0.55rem', color: '#00f3ff', background: 'rgba(0, 243, 255, 0.05)', border: '1px solid rgba(0, 243, 255, 0.3)' }}
                  title="Rewind 4 beats"
                >
                  ⏪
                </button>

                {/* Stop */}
                <button
                  className="deck-btn"
                  onClick={stopPerformancePlayback}
                  style={{ height: '18px', padding: '1px 6px', fontSize: '0.55rem', color: '#ff4444', background: 'rgba(255, 68, 68, 0.05)', border: '1px solid rgba(255, 68, 68, 0.3)' }}
                  title="Stop and Reset"
                >
                  ■ Stop
                </button>

                {/* Play / Pause */}
                <button
                  className={`deck-btn ${perfPlaybackActive ? 'active' : ''}`}
                  onClick={togglePerformancePlayback}
                  style={{ 
                    height: '18px', 
                    padding: '1px 6px', 
                    fontSize: '0.55rem', 
                    color: perfPlaybackActive ? '#000' : '#00f3ff', 
                    background: perfPlaybackActive ? '#00f3ff' : 'rgba(0, 243, 255, 0.05)', 
                    border: '1px solid rgba(0, 243, 255, 0.3)',
                    boxShadow: perfPlaybackActive ? '0 0 8px #00f3ff' : 'none'
                  }}
                  title={perfPlaybackActive ? "Pause" : "Play"}
                >
                  {perfPlaybackActive ? '⏸ Pause' : '▶ Play'}
                </button>

                {/* Forward */}
                <button
                  className="deck-btn"
                  onClick={() => {
                    const nextBeat = seqCurrentBeatRef.current + 4.0;
                    seqCurrentBeatRef.current = nextBeat;
                    seqStartBeatOffsetRef.current = nextBeat;
                    if (perfPlaybackActiveRef.current) {
                      const ctx = audioCtxRef.current;
                      if (ctx) {
                        perfPlayStartTimeRef.current = ctx.currentTime;
                        if (schedulerNodeRef.current) {
                          schedulerNodeRef.current.port.postMessage({
                            type: 'START_PLAYBACK',
                            startTime: ctx.currentTime,
                            startBeatOffset: nextBeat,
                            sortedEvents: sortedPerfEventsRef.current
                          });
                        }
                      }
                    }
                    showEditorStatus(`Forwarded 4 Beats (to ${nextBeat.toFixed(1)}) ⏩`);
                  }}
                  style={{ height: '18px', padding: '1px 6px', fontSize: '0.55rem', color: '#00f3ff', background: 'rgba(0, 243, 255, 0.05)', border: '1px solid rgba(0, 243, 255, 0.3)' }}
                  title="Forward 4 beats"
                >
                  ⏩
                </button>

                {/* Record */}
                <button
                  className={`deck-btn ${perfRecordActive && !perfIsDubbing ? 'active' : ''}`}
                  onClick={() => togglePerformanceRecord(false)}
                  style={{ 
                    height: '18px', 
                    padding: '1px 6px', 
                    fontSize: '0.55rem', 
                    color: perfRecordActive && !perfIsDubbing ? '#fff' : '#ff3333', 
                    background: perfRecordActive && !perfIsDubbing ? '#ff3333' : 'rgba(255, 51, 51, 0.05)', 
                    border: '1px solid rgba(255, 51, 51, 0.3)',
                    boxShadow: perfRecordActive && !perfIsDubbing ? '0 0 8px #ff3333' : 'none'
                  }}
                  title={perfRecordActive && !perfIsDubbing ? "Stop Recording" : "Clean Record (clears sequence)"}
                >
                  {perfRecordActive && !perfIsDubbing ? '● REC...' : '● Record'}
                </button>

                {/* Dub */}
                <button
                  className={`deck-btn ${perfRecordActive && perfIsDubbing ? 'active' : ''}`}
                  onClick={() => togglePerformanceRecord(true)}
                  style={{ 
                    height: '18px', 
                    padding: '1px 6px', 
                    fontSize: '0.55rem', 
                    color: perfRecordActive && perfIsDubbing ? '#fff' : '#ff00ff', 
                    background: perfRecordActive && perfIsDubbing ? '#ff00ff' : 'rgba(255, 0, 255, 0.05)', 
                    border: '1px solid rgba(255, 0, 255, 0.3)',
                    boxShadow: perfRecordActive && perfIsDubbing ? '0 0 8px #ff00ff' : 'none'
                  }}
                  title={perfRecordActive && perfIsDubbing ? "Stop Dubbing" : "Overdub (layers notes on top)"}
                >
                  {perfRecordActive && perfIsDubbing ? '● DUBBING' : '● Dub'}
                </button>
              </div>

              {/* Quantize options */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.4rem', color: '#888', fontFamily: 'monospace' }}>QUANTIZE:</span>
                <select
                  value={perfQuantizeMode}
                  onChange={(e) => setPerfQuantizeMode(e.target.value)}
                  style={{
                    background: '#0a101d', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '2px', color: '#00f3ff', fontSize: '0.42rem',
                    padding: '1px 2px', outline: 'none', cursor: 'pointer', fontFamily: 'monospace'
                  }}
                >
                  <option value="None">None</option>
                  <option value="1/16">1/16 Beat</option>
                  <option value="1">1 Beat</option>
                  <option value="4">4 Beats</option>
                </select>
              </div>

              {/* Clear performance */}
              <button
                className="deck-btn"
                style={{ height: '18px', fontSize: '0.48rem', padding: '1px 5px', background: 'rgba(255,0,0,0.15)', color: '#ff4444', border: '1px solid #ff4444' }}
                onClick={clearPerformance}
              >
                Clear
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // 9. THE HARDWARE & SOFTWARE INTERFACE RENDERING
  // ==========================================

  return (
    <div className="delta7-hardware-chassis" style={{ zoom: uiScale }}>
      {/* Aluminum Top Rack Bar */}
      <div className="rack-header-bar">
        <div className="branding-title">delta7</div>
        <div className="branding-sub">HYPER INTEGRATED SYNTHESIS WORKSTATION</div>
        <div className="ui-resize-slider-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.62rem', color: '#ff00ff', marginLeft: 'auto', marginRight: '24px' }}>
          <span style={{ fontWeight: 'bold', letterSpacing: '0.5px' }}>UI RESIZE:</span>
          <input 
            type="range" min="0.6" max="1.4" step="0.05"
            value={uiScale}
            onChange={(e) => setUiScale(parseFloat(e.target.value))}
            style={{ width: '80px', height: '8px', cursor: 'pointer', accentColor: '#ff00ff' }}
          />
          <span className="font-mono text-cyan" style={{ fontSize: '0.62rem', minWidth: '32px', textAlign: 'right' }}>
            {Math.round(uiScale * 100)}%
          </span>
        </div>
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
                  setSelectedEchoPresetIdx('');
                }}
              >
                {params.spaceEchoActive ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Echo Preset Selector */}
            <div className="flex-row-sub flex-space-between" style={{ width: '100%', margin: '0.2rem 0', justifyContent: 'space-between', display: 'flex' }}>
              <label style={{ color: '#00f3ff', fontWeight: 'bold' }}>PRST:</label>
              <select
                value={selectedEchoPresetIdx}
                onChange={(e) => handleLoadEchoPreset(e.target.value)}
                style={{ 
                  background: '#000', 
                  border: '1px solid rgba(0, 243, 255, 0.3)', 
                  color: '#00f3ff', 
                  fontSize: '0.55rem', 
                  padding: '1px', 
                  borderRadius: '3px', 
                  width: '90px' 
                }}
              >
                <option value="">-- CUSTOM --</option>
                {ECHO_PRESETS.map((prst, idx) => (
                  <option key={idx} value={idx}>{prst.name}</option>
                ))}
              </select>
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
                  setSelectedEchoPresetIdx('');
                }} 
                midiLearnParam="spaceEchoTime" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="cyan"
                size={34}
              />
              <Knob 
                label="Feedback" 
                value={params.spaceEchoFeedback} 
                min={0.0} max={0.95} step={0.01}
                onChange={(v) => {
                  setParams(prev => ({ ...prev, spaceEchoFeedback: v }));
                  setSelectedEchoPresetIdx('');
                }} 
                midiLearnParam="spaceEchoFeedback" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="cyan"
                size={34}
              />
              <Knob 
                label="Wow" 
                value={params.spaceEchoWow} 
                min={0.0} max={1.0} step={0.01}
                onChange={(v) => {
                  setParams(prev => ({ ...prev, spaceEchoWow: v }));
                  setSelectedEchoPresetIdx('');
                }} 
                midiLearnParam="spaceEchoWow" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="cyan"
                size={34}
              />
              <Knob 
                label="Saturation" 
                value={params.spaceEchoSaturation} 
                min={0.0} max={1.0} step={0.01}
                onChange={(v) => {
                  setParams(prev => ({ ...prev, spaceEchoSaturation: v }));
                  setSelectedEchoPresetIdx('');
                }} 
                midiLearnParam="spaceEchoSaturation" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="cyan"
                size={34}
              />
              <Knob 
                label="Spring" 
                value={params.spaceEchoSpring} 
                min={0.0} max={1.0} step={0.01}
                onChange={(v) => {
                  setParams(prev => ({ ...prev, spaceEchoSpring: v }));
                  setSelectedEchoPresetIdx('');
                }} 
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
                      setSelectedRotorPresetIdx('');
                    }}
                  >
                    {spd.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Leslie Preset Selector */}
            <div className="flex-row-sub flex-space-between" style={{ width: '100%', margin: '0.2rem 0', justifyContent: 'space-between', display: 'flex' }}>
              <label style={{ color: '#ff00ff', fontWeight: 'bold' }}>PRST:</label>
              <select
                value={selectedRotorPresetIdx}
                onChange={(e) => handleLoadRotorPreset(e.target.value)}
                style={{ 
                  background: '#000', 
                  border: '1px solid rgba(255, 0, 255, 0.3)', 
                  color: '#ff00ff', 
                  fontSize: '0.55rem', 
                  padding: '1px', 
                  borderRadius: '3px', 
                  width: '90px' 
                }}
              >
                <option value="">-- CUSTOM --</option>
                {ROTOR_PRESETS.map((prst, idx) => (
                  <option key={idx} value={idx}>{prst.name}</option>
                ))}
              </select>
            </div>

            {/* Leslie Knobs Grid */}
            <div className="leslie-knobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 10px', justifyItems: 'center', width: '100%', marginTop: '0.4rem' }}>
              <Knob 
                label="Drive" 
                value={params.leslieDrive !== undefined ? params.leslieDrive : 0.25} 
                min={0.0} max={1.0} step={0.01}
                onChange={(v) => {
                  setParams(prev => ({ ...prev, leslieDrive: v }));
                  setSelectedRotorPresetIdx('');
                }} 
                midiLearnParam="leslieDrive" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="magenta"
                size={34}
              />
              <Knob 
                label="Width" 
                value={params.leslieWidth !== undefined ? params.leslieWidth : 0.5} 
                min={0.0} max={1.0} step={0.01}
                onChange={(v) => {
                  setParams(prev => ({ ...prev, leslieWidth: v }));
                  setSelectedRotorPresetIdx('');
                }} 
                midiLearnParam="leslieWidth" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="magenta"
                size={34}
              />
              <Knob 
                label="X-Over" 
                value={params.leslieCrossover !== undefined ? params.leslieCrossover : 800} 
                min={300} max={2000} step={10}
                onChange={(v) => {
                  setParams(prev => ({ ...prev, leslieCrossover: v }));
                  setSelectedRotorPresetIdx('');
                }} 
                midiLearnParam="leslieCrossover" midiMappings={midiMappings} setMidiLearnParam={setMidiLearnParam}
                glowColor="magenta"
                size={34}
              />
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
                    min={20} max={20000} step={10}
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
        <div className="rack-panel-center blue-screen-border" style={{ minHeight: '585px', padding: 0 }}>
          <div className={`screen-flip-container ${performanceViewActive ? 'flipped' : ''}`}>
            {/* FRONT CARD: NORMAL WORKSTATION */}
            <div className="screen-front" style={{ padding: '0.5rem' }}>
              <div className="lcd-bezel-shadow" style={{ height: '100%' }}>
            
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
                          <button
                            className="btn btn-xs"
                            disabled={!slot.buffer}
                            onClick={() => {
                              const buffer = slot.buffer;
                              if (!buffer) return;
                              const input = window.prompt("Enter gain scaling factor (e.g. 2.0 to double volume, 1.5 to boost, 0.5 to fade/quiet):", "1.5");
                              if (input === null) return;
                              const factor = parseFloat(input);
                              if (isNaN(factor) || factor <= 0 || factor === 1.0) return;
                              
                              pushUndoState(slot);
                              const ctx = audioCtxRef.current;
                              const newBuffer = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
                              
                              const startPct = selectionStart !== null && selectionEnd !== null ? Math.min(selectionStart, selectionEnd) : 0.0;
                              const endPct = selectionStart !== null && selectionEnd !== null ? Math.max(selectionStart, selectionEnd) : 1.0;
                              
                              const startSample = Math.floor(startPct * buffer.length);
                              const endSample = Math.floor(endPct * buffer.length);
                              
                              for (let c = 0; c < buffer.numberOfChannels; c++) {
                                const origData = buffer.getChannelData(c);
                                const destData = newBuffer.getChannelData(c);
                                destData.set(origData);
                                for (let i = startSample; i < endSample; i++) {
                                  destData[i] = Math.max(-1.0, Math.min(1.0, destData[i] * factor));
                                }
                              }
                              
                              updateBufferForSlot(selectedEditSlotId, newBuffer, `Gain x${factor}: ${slot.name}`);
                              showEditorStatus(`Gain scaled x${factor}! 🔊`);
                            }}
                            style={{ margin: 0, padding: '2px 6px', fontSize: '0.55rem', borderColor: '#ffe600', color: '#ffe600' }}
                            title="Adjust amplitude/gain of selection or entire sample"
                          >
                            🔊 GAIN
                          </button>
                          <button
                            className="btn btn-xs"
                            onClick={handleSaveActiveSlotToDb}
                            style={{ margin: 0, padding: '2px 6px', fontSize: '0.55rem', borderColor: '#00f3ff', color: '#00f3ff' }}
                            title="Save sample buffer and settings to browser database"
                          >
                            💾 SAVE
                          </button>
                          <button
                            className="btn btn-xs"
                            disabled={!slot.buffer}
                            onClick={handleExportActiveSlotWav}
                            style={{ margin: 0, padding: '2px 6px', fontSize: '0.55rem', borderColor: '#ff00ff', color: '#ff00ff' }}
                            title="Export sample as WAV file"
                          >
                            📥 EXPORT
                          </button>
                        </div>
                        {editorStatus ? (
                          <div style={{ fontSize: '0.58rem', color: '#00ff66', fontFamily: 'monospace', fontWeight: 'bold', textShadow: '0 0 4px rgba(0,255,102,0.4)' }}>
                            {editorStatus}
                          </div>
                        ) : selectionStart !== null && selectionEnd !== null ? (
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

                      {/* Warp Sync controls */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', marginTop: '4px', borderTop: '1px dashed rgba(0, 243, 255, 0.1)', paddingTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button 
                            className={`btn btn-xs ${slot.warpOn ? 'active-yellow' : ''}`}
                            onClick={() => updateSlotParam(selectedEditSlotId, 'warpOn', !slot.warpOn)}
                            style={{ margin: 0, padding: '2px 6px', fontSize: '0.6rem' }}
                          >
                            {slot.warpOn ? 'WARP: ON' : 'WARP: OFF'}
                          </button>
                        </div>
                        {slot.warpOn && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.62rem' }}>
                            <span style={{ color: '#00f3ff' }}>LOOP LENGTH (BEATS):</span>
                            <div className="segmented-strip">
                              {[1, 2, 4, 8, 16, 32].map(beats => (
                                <button
                                  key={beats}
                                  className={`segmented-btn btn-xs ${ (slot.warpBeats || 4) === beats ? 'active' : '' }`}
                                  onClick={() => updateSlotParam(selectedEditSlotId, 'warpBeats', beats)}
                                  style={{ padding: '2px 6px', fontSize: '0.55rem' }}
                                >
                                  {beats}
                                </button>
                              ))}
                            </div>
                            <span style={{ color: '#88ccee', fontSize: '0.55rem', fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              Target Speed: {Math.round(((slot.buffer ? slot.buffer.duration * (slot.end - slot.start) : 0) / ((60 / (params.arpBpm || 120)) * (slot.warpBeats || 4))) * 100)}%
                              <button
                                className="btn btn-xs"
                                disabled={!slot.buffer}
                                onClick={() => {
                                  const origDur = slot.buffer ? slot.buffer.duration * (slot.end - slot.start) : 0;
                                  if (origDur > 0) {
                                    const beats = slot.warpBeats || 4;
                                    const calculatedBpm = Math.round(Math.max(40, Math.min(250, (60 * beats) / origDur)) * 10) / 10;
                                    setParams(prev => ({ ...prev, arpBpm: calculatedBpm }));
                                    showEditorStatus(`Synced Master Tempo to Slot BPM: ${calculatedBpm.toFixed(1)}! ⏱️`);
                                  }
                                }}
                                style={{
                                  margin: 0,
                                  padding: '1px 4px',
                                  fontSize: '0.52rem',
                                  borderColor: '#ffe600',
                                  color: '#ffe600',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  lineHeight: '1',
                                  height: '14px',
                                  verticalAlign: 'middle'
                                }}
                              >
                                FIT BPM
                              </button>
                            </span>
                          </div>
                        )}
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
                                    const paramsList = s.sliceParams ? [...s.sliceParams] : Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false }));
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
                              className={`btn btn-xs ${slot.sliceParams?.[selectedSliceIndex]?.sustain ? 'active-pink' : ''}`}
                              onClick={() => {
                                const nextSlots = sampleSlotsRef.current.map(s => {
                                  if (s.id === selectedEditSlotId) {
                                    const paramsList = s.sliceParams ? [...s.sliceParams] : Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false }));
                                    paramsList[selectedSliceIndex] = { 
                                      ...paramsList[selectedSliceIndex], 
                                      sustain: !paramsList[selectedSliceIndex].sustain 
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
                                backgroundColor: slot.sliceParams?.[selectedSliceIndex]?.sustain ? '#ff0055' : '',
                                borderColor: slot.sliceParams?.[selectedSliceIndex]?.sustain ? '#ff0055' : '',
                                color: '#fff'
                              }}
                            >
                              SUSTAIN: {slot.sliceParams?.[selectedSliceIndex]?.sustain ? 'ON' : 'OFF'}
                            </button>
                            <button
                              className={`btn btn-xs ${slot.sliceParams?.[selectedSliceIndex]?.reverse ? 'active-pink' : ''}`}
                              onClick={() => {
                                const nextSlots = sampleSlotsRef.current.map(s => {
                                  if (s.id === selectedEditSlotId) {
                                    const paramsList = s.sliceParams ? [...s.sliceParams] : Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false }));
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
                                    const currentSlice = s.sliceParams?.[selectedSliceIndex] || { attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false, sustain: false };
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
                                    oscATriggerMode: 'slice',
                                    oscAVol: 1.0,
                                    oscBVol: 0.0,
                                    oscBalance: 0.0,
                                    filterType: 'bypass'
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
                                    oscATriggerMode: 'slice',
                                    oscAVol: 1.0,
                                    oscBVol: 0.0,
                                    oscBalance: 0.0,
                                    filterType: 'bypass'
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
                          
                          {/* Row 3: Slice Start & End points */}
                          <div className="flex-row-sub" style={{ fontSize: '0.58rem' }}>
                            <span style={{ color: '#00ff66', width: '40px' }}>Start:</span>
                            <input
                              type="range" min="0.0" max="1.0" step="0.001"
                              value={(() => {
                                const sliceParam = slot.sliceParams?.[selectedSliceIndex] || {};
                                if (sliceParam.start !== undefined) return sliceParam.start;
                                return slot.start + (selectedSliceIndex / (slot.sliceCount || 16)) * (slot.end - slot.start);
                              })()}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const nextSlots = sampleSlotsRef.current.map(s => {
                                  if (s.id === selectedEditSlotId) {
                                    const paramsList = s.sliceParams ? [...s.sliceParams] : Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false }));
                                    const sliceCount = s.sliceCount || 16;
                                    
                                    const oldStart = paramsList[selectedSliceIndex].start !== undefined ? paramsList[selectedSliceIndex].start : (s.start + (selectedSliceIndex / sliceCount) * (s.end - s.start));
                                    const oldEnd = paramsList[selectedSliceIndex].end !== undefined ? paramsList[selectedSliceIndex].end : (s.start + ((selectedSliceIndex + 1) / sliceCount) * (s.end - s.start));
                                    
                                    const oldLen = Math.max(0.001, oldEnd - oldStart);
                                    const newLen = Math.max(0.001, oldEnd - val);
                                    const oldDecay = paramsList[selectedSliceIndex].decay !== undefined ? paramsList[selectedSliceIndex].decay : 0.3;
                                    const newDecay = Math.max(0.01, Math.min(5.0, oldDecay * (newLen / oldLen)));
                                    
                                    paramsList[selectedSliceIndex] = { 
                                      ...paramsList[selectedSliceIndex], 
                                      start: val,
                                      decay: newDecay
                                    };
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
                              {(() => {
                                const sliceParam = slot.sliceParams?.[selectedSliceIndex] || {};
                                const startVal = sliceParam.start !== undefined ? sliceParam.start : (slot.start + (selectedSliceIndex / (slot.sliceCount || 16)) * (slot.end - slot.start));
                                return slot.buffer ? (startVal * slot.buffer.duration).toFixed(3) + 's' : Math.round(startVal * 100) + '%';
                              })()}
                            </span>
                          </div>

                          <div className="flex-row-sub" style={{ fontSize: '0.58rem' }}>
                            <span style={{ color: '#ffea00', width: '40px' }}>End:</span>
                            <input
                              type="range" min="0.0" max="1.0" step="0.001"
                              value={(() => {
                                const sliceParam = slot.sliceParams?.[selectedSliceIndex] || {};
                                if (sliceParam.end !== undefined) return sliceParam.end;
                                return slot.start + ((selectedSliceIndex + 1) / (slot.sliceCount || 16)) * (slot.end - slot.start);
                              })()}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const nextSlots = sampleSlotsRef.current.map(s => {
                                  if (s.id === selectedEditSlotId) {
                                    const paramsList = s.sliceParams ? [...s.sliceParams] : Array.from({ length: 16 }, () => ({ attack: 0.01, decay: 0.3, pitch: 0, stretch: 0, loop: false, reverse: false }));
                                    const sliceCount = s.sliceCount || 16;
                                    
                                    const oldStart = paramsList[selectedSliceIndex].start !== undefined ? paramsList[selectedSliceIndex].start : (s.start + (selectedSliceIndex / sliceCount) * (s.end - s.start));
                                    const oldEnd = paramsList[selectedSliceIndex].end !== undefined ? paramsList[selectedSliceIndex].end : (s.start + ((selectedSliceIndex + 1) / sliceCount) * (s.end - s.start));
                                    
                                    const oldLen = Math.max(0.001, oldEnd - oldStart);
                                    const newLen = Math.max(0.001, val - oldStart);
                                    const oldDecay = paramsList[selectedSliceIndex].decay !== undefined ? paramsList[selectedSliceIndex].decay : 0.3;
                                    const newDecay = Math.max(0.01, Math.min(5.0, oldDecay * (newLen / oldLen)));
                                    
                                    paramsList[selectedSliceIndex] = { 
                                      ...paramsList[selectedSliceIndex], 
                                      end: val,
                                      decay: newDecay
                                    };
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
                              {(() => {
                                const sliceParam = slot.sliceParams?.[selectedSliceIndex] || {};
                                const endVal = sliceParam.end !== undefined ? sliceParam.end : (slot.start + ((selectedSliceIndex + 1) / (slot.sliceCount || 16)) * (slot.end - slot.start));
                                return slot.buffer ? (endVal * slot.buffer.duration).toFixed(3) + 's' : Math.round(endVal * 100) + '%';
                              })()}
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
                          {sampleSlots.filter(s => s.id.startsWith('a')).map(slot => (
                            <button
                              key={slot.id}
                              className={`segmented-btn btn-xs ${params.oscAWave === slot.id ? 'active' : ''}`}
                              onClick={() => {
                                setParams(prev => ({ ...prev, oscAWave: slot.id }));
                                setSelectedEditSlotId(slot.id);
                              }}
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
                          {sampleSlots.filter(s => s.id.startsWith('b')).map(slot => (
                            <button
                              key={slot.id}
                              className={`segmented-btn btn-xs ${params.oscBWave === slot.id ? 'active' : ''}`}
                              onClick={() => {
                                setParams(prev => ({ ...prev, oscBWave: slot.id }));
                                setSelectedEditSlotId(slot.id);
                              }}
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
                        <div className="segmented-grid" style={{ marginTop: '2px', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px' }}>
                          {sampleSlots.filter(s => s.id.startsWith('a')).map(s => (
                            <button
                              key={s.id}
                              className={`segmented-btn btn-xs ${selectedEditSlotId === s.id ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedEditSlotId(s.id);
                                setParams(prev => ({ ...prev, oscAWave: s.id }));
                              }}
                              style={{ fontSize: '0.48rem', padding: '2px 1px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                              title={`${getSlotLabel(s.id)}: ${s.name}`}
                            >
                              {getSlotLabel(s.id)}:{s.buffer ? '●' : '○'}
                            </button>
                          ))}
                        </div>
                        <div className="segmented-grid" style={{ marginTop: '2px', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px' }}>
                          {sampleSlots.filter(s => s.id.startsWith('b')).map(s => (
                            <button
                              key={s.id}
                              className={`segmented-btn btn-xs ${selectedEditSlotId === s.id ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedEditSlotId(s.id);
                                setParams(prev => ({ ...prev, oscBWave: s.id }));
                              }}
                              style={{ fontSize: '0.48rem', padding: '2px 1px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
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
                        {['mic', 'monitor', 'resample'].map(mode => (
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

                    {/* Audio Input Device Select (rendered only when REC SOURCE is 'mic') */}
                    {recordingInputMode === 'mic' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.62rem', marginTop: '4px', marginBottom: '4px' }}>
                        <span style={{ color: '#ffe600', fontWeight: 'bold' }}>INPUT HW:</span>
                        <select
                          value={selectedAudioDevice}
                          onChange={(e) => handleAudioDeviceChange(e.target.value)}
                          style={{
                            background: '#000',
                            border: '1px solid rgba(0, 243, 255, 0.3)',
                            color: '#00f3ff',
                            fontSize: '0.55rem',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            width: '140px',
                            height: '20px',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {audioDevices.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>
                              {d.label || `Device ${d.deviceId.slice(0, 5)}...`}
                            </option>
                          ))}
                          {audioDevices.length === 0 && <option value="">Default Input</option>}
                        </select>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '6px', marginTop: '4px' }}>
                      <button 
                        className={`btn btn-xs ${isArmed ? 'active-yellow' : ''}`} 
                        onClick={recordingInputMode === 'mic' ? armMicrophone : (recordingInputMode === 'monitor' ? armMonitor : armResampler)}
                        style={{ margin: 0, fontSize: '0.62rem', padding: '3px' }}
                      >
                        {isArmed ? `DISARM ${recordingInputMode.toUpperCase()}` : `ARM ${recordingInputMode.toUpperCase()}`}
                      </button>
                      <button 
                        className={`btn btn-xs ${isRecording ? 'active-red blinking' : (manualRecPendingStart ? 'active-yellow blinking' : '')}`} 
                        disabled={!isArmed}
                        onClick={isRecording ? stopRecording : startRecording}
                        style={{ margin: 0, fontSize: '0.62rem', padding: '3px' }}
                      >
                        {isRecording 
                          ? (manualRecPendingStop ? 'STOP PENDING...' : 'STOP REC') 
                          : (manualRecPendingStart ? 'PENDING...' : 'RECORD (LIVE)')}
                      </button>
                    </div>

                    {/* Recording Input Gain Slider */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.62rem' }}>
                      <label style={{ color: '#00f3ff', marginRight: '6px' }}>REC GAIN:</label>
                      <input 
                        type="range" 
                        min="0.0" 
                        max="4.0" 
                        step="0.1" 
                        value={recordingInputGain} 
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setRecordingInputGain(val);
                          recordingInputGainRef.current = val;
                          const ctx = audioCtxRef.current;
                          if (ctx) {
                            if (micInputGainNodeRef.current) {
                              micInputGainNodeRef.current.gain.setValueAtTime(val, ctx.currentTime);
                            }
                            if (resamplerGainNodeRef.current) {
                              resamplerGainNodeRef.current.gain.setValueAtTime(val, ctx.currentTime);
                            }
                          }
                        }}
                        style={{ flexGrow: 1, height: '8px' }}
                      />
                      <span className="font-mono text-cyan" style={{ width: '30px', textAlign: 'right', marginLeft: '6px' }}>
                        {Math.round(recordingInputGain * 100)}%
                      </span>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.05fr', gap: '8px' }}>
                  
                  {/* Left Column: Filter & Amp Envelopes */}
                  <div className="box-section-sub" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0, 243, 255, 0.15)', padding: '6px 8px' }}>
                    <h4 style={{ color: '#00ff66', margin: '0 0 4px 0', fontSize: '0.72rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>FILTER & AMPLIFIER ENVELOPES</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {/* VCF EG (Filter Env) */}
                      <div>
                        <div className="flex-row-sub" style={{ fontSize: '0.6rem', justifyContent: 'space-between', marginBottom: '2px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontWeight: 'bold', color: '#88ccee' }}>VCF Type:</span>
                            <select
                              value={params.filterType || 'lowpass'}
                              onChange={(e) => setParams(prev => ({ ...prev, filterType: e.target.value }))}
                              style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.48rem', padding: '0px 1px', borderRadius: '2px', outline: 'none' }}
                            >
                              <option value="bypass">BYPASS</option>
                              <option value="lowpass">LOWPASS</option>
                              <option value="highpass">HIGHPASS</option>
                              <option value="bandpass">BANDPASS</option>
                              <option value="notch">NOTCH</option>
                            </select>
                          </div>
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

                  {/* Right Column: LFO, ARP, STUTTER & GLOBAL FX */}
                  <div className="box-section-sub" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0, 243, 255, 0.15)', padding: '6px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h4 style={{ color: '#00f3ff', margin: '0 0 4px 0', fontSize: '0.72rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>LFO, ARP, STUTTER & GLOBAL FX</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.05fr 0.9fr', gap: '6px', fontSize: '0.55rem' }}>
                      {/* Sub-column 1: LFO & Arpeggiator */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ color: '#ffe600', fontWeight: 'bold', fontSize: '0.55rem', borderBottom: '1px solid rgba(255,230,0,0.15)', paddingBottom: '2px', marginBottom: '2px' }}>
                          LFO & ARPEGGIATOR
                        </div>
                        {/* LFO */}
                        <div className="flex-row-sub">
                          <label>LFO Rate:</label>
                          <input 
                            type="range" min="0.1" max="15" step="0.1" 
                            value={params.lfo1Rate} 
                            onChange={(e) => setParams(prev => ({ ...prev, lfo1Rate: parseFloat(e.target.value) }))} 
                            style={{ width: '45px', height: '8px' }}
                          />
                          <span className="font-mono text-cyan" style={{ fontSize: '0.48rem', width: '20px', textAlign: 'right' }}>{Math.round(params.lfo1Rate)}H</span>
                        </div>
                        <div className="flex-row-sub" style={{ alignItems: 'center' }}>
                          <label>LFO Tgt:</label>
                          <div className="segmented-strip" style={{ flexGrow: 1 }}>
                            {['pitch', 'filter'].map(t => (
                              <button
                                key={t}
                                className={`segmented-btn btn-xs ${params.lfo1Target === t ? 'active' : ''}`}
                                onClick={() => setParams(prev => ({ ...prev, lfo1Target: t }))}
                                style={{ fontSize: '0.42rem', padding: '0px 2px' }}
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
                            style={{ padding: '0px 3px', fontSize: '0.45rem', flexShrink: 0 }}
                          >
                            {params.arpOn ? 'ON' : 'OFF'}
                          </button>
                          <input 
                            type="range" min="40" max="250" step="0.1"
                            value={params.arpBpm || 120} 
                            onChange={(e) => setParams(prev => ({ ...prev, arpBpm: parseFloat(e.target.value) || 120 }))} 
                            style={{ flexGrow: 1, height: '8px', minWidth: '25px' }}
                          />
                        </div>
                        
                        {/* Arpeggiator Parameters (Pattern, Div, Gate) */}
                        <div className="flex-row-sub" style={{ alignItems: 'center', gap: '3px', fontSize: '0.5rem' }}>
                          <span style={{ color: '#00f3ff', opacity: 0.8 }}>Ptn:</span>
                          <select
                            value={params.arpPattern || 'UP'}
                            onChange={(e) => setParams(prev => ({ ...prev, arpPattern: e.target.value }))}
                            style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.45rem', padding: '0px 1px', borderRadius: '2px', width: '36px', outline: 'none' }}
                          >
                            <option value="UP">UP</option>
                            <option value="DOWN">DN</option>
                            <option value="RANDOM">RND</option>
                          </select>
                          
                          <span style={{ color: '#00f3ff', opacity: 0.8, marginLeft: '2px' }}>Div:</span>
                          <select
                            value={params.arpDivision || 8}
                            onChange={(e) => setParams(prev => ({ ...prev, arpDivision: parseInt(e.target.value) || 8 }))}
                            style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.45rem', padding: '0px 1px', borderRadius: '2px', width: '28px', outline: 'none' }}
                          >
                            <option value="4">1/4</option>
                            <option value="8">1/8</option>
                            <option value="12">1/12</option>
                            <option value="16">1/16</option>
                            <option value="24">1/24</option>
                            <option value="32">1/32</option>
                          </select>
                        </div>
                        <div className="flex-row-sub" style={{ alignItems: 'center', gap: '3px', fontSize: '0.5rem' }}>
                          <span style={{ color: '#00f3ff', opacity: 0.8 }}>Gate:</span>
                          <input 
                            type="range" min="0.1" max="1.0" step="0.05"
                            value={params.arpGate !== undefined ? params.arpGate : 0.8} 
                            onChange={(e) => setParams(prev => ({ ...prev, arpGate: parseFloat(e.target.value) }))} 
                            style={{ flexGrow: 1, height: '8px' }}
                          />
                          <span style={{ fontFamily: 'monospace', fontSize: '0.45rem', width: '15px', textAlign: 'right', color: '#00f3ff' }}>
                            {Math.round((params.arpGate !== undefined ? params.arpGate : 0.8) * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Sub-column 2: Stutter & Movement */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ color: '#ff00ff', fontWeight: 'bold', fontSize: '0.55rem', borderBottom: '1px solid rgba(255,0,255,0.15)', paddingBottom: '2px', marginBottom: '2px' }}>
                          STUTTER & MOVEMENT
                        </div>
                        
                        <div className="flex-row-sub" style={{ justifyContent: 'space-between', marginBottom: '1px' }}>
                          <button
                            className={`btn btn-xs ${params.stutterOn ? 'active-pink' : ''}`}
                            onClick={() => setParams(prev => ({ ...prev, stutterOn: !prev.stutterOn }))}
                            style={{ flexGrow: 1, fontWeight: 'bold', fontSize: '0.52rem', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', margin: 0, padding: 0 }}
                          >
                            <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: params.stutterOn ? '#ff0055' : '#888', boxShadow: params.stutterOn ? '0 0 3px #ff0055' : 'none' }} />
                            STUTTER
                          </button>
                        </div>

                        <div className="flex-row-sub">
                          <label>Rate:</label>
                          <select
                            value={params.stutterRate}
                            onChange={(e) => setParams(prev => ({ ...prev, stutterRate: e.target.value }))}
                            style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.45rem', padding: '0px 1px', borderRadius: '2px', width: '40px', outline: 'none' }}
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
                          <span className="font-mono text-cyan" style={{ fontSize: '0.45rem', width: '15px', textAlign: 'right' }}>{Math.round(params.stutterGate * 100)}%</span>
                        </div>

                        <div className="flex-row-sub">
                          <label>Sweep:</label>
                          <div className="segmented-strip" style={{ display: 'inline-flex' }}>
                            {['None', 'Up', 'Down'].map(dir => (
                              <button
                                key={dir}
                                className={`segmented-btn btn-xs ${params.stutterSweepDir === dir ? 'active' : ''}`}
                                onClick={() => setParams(prev => ({ ...prev, stutterSweepDir: dir }))}
                                style={{ fontSize: '0.42rem', padding: '0px 2px', height: '11px', lineHeight: '9px' }}
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
                          <span className="font-mono text-cyan" style={{ fontSize: '0.45rem', width: '15px', textAlign: 'right' }}>{params.stutterSweepTime}s</span>
                        </div>

                        <div className="flex-row-sub">
                          <label>Pan:</label>
                          <select
                            value={params.stutterPanMode || 'None'}
                            onChange={(e) => setParams(prev => ({ ...prev, stutterPanMode: e.target.value }))}
                            style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.48rem', padding: '0px 1px', borderRadius: '2px', width: '40px', outline: 'none' }}
                          >
                            <option value="None">None</option>
                            <option value="Alternating">Alt L-R</option>
                            <option value="LCR">L-C-R</option>
                            <option value="Sine">Sweep</option>
                          </select>
                        </div>
                      </div>

                      {/* Sub-column 3: Global FX Mixer */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ color: '#00f3ff', fontWeight: 'bold', fontSize: '0.55rem', borderBottom: '1px solid rgba(0,243,255,0.15)', paddingBottom: '2px', marginBottom: '2px' }}>
                          GLOBAL FX
                        </div>
                        <div className="flex-row-sub" style={{ justifyContent: 'space-between' }}>
                          <span style={{ color: '#ffe600' }}>IFX1:</span>
                          <select
                            value={params.ifx1Type}
                            onChange={(e) => setParams(prev => ({ ...prev, ifx1Type: e.target.value }))}
                            style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.48rem', padding: '0px 1px', borderRadius: '2px', width: '50px', outline: 'none' }}
                          >
                            {['Bypass', 'Chorus', 'Phaser', 'Autowah', 'Overdrive', 'Rotary Speaker', 'Flanger', 'Ring Modulator'].map(type => (
                              <option key={type} value={type}>{type.split(' ')[0]}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-row-sub">
                          <label>Mix1:</label>
                          <input 
                            type="range" min="0" max="1" step="0.05"
                            value={params.ifx1Mix} 
                            onChange={(e) => setParams(prev => ({ ...prev, ifx1Mix: parseFloat(e.target.value) }))} 
                            style={{ width: '35px', height: '8px' }}
                          />
                          <span className="font-mono text-cyan" style={{ fontSize: '0.45rem', width: '15px', textAlign: 'right' }}>{Math.round(params.ifx1Mix * 100)}%</span>
                        </div>

                        <div className="flex-row-sub" style={{ justifyContent: 'space-between', marginTop: '2px' }}>
                          <span style={{ color: '#ffe600' }}>IFX2:</span>
                          <select
                            value={params.ifx2Type}
                            onChange={(e) => setParams(prev => ({ ...prev, ifx2Type: e.target.value }))}
                            style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.48rem', padding: '0px 1px', borderRadius: '2px', width: '50px', outline: 'none' }}
                          >
                            {['Bypass', 'Chorus', 'Phaser', 'Autowah', 'Overdrive', 'Rotary Speaker', 'Flanger', 'Ring Modulator'].map(type => (
                              <option key={type} value={type}>{type.split(' ')[0]}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-row-sub">
                          <label>Mix2:</label>
                          <input 
                            type="range" min="0" max="1" step="0.05"
                            value={params.ifx2Mix} 
                            onChange={(e) => setParams(prev => ({ ...prev, ifx2Mix: parseFloat(e.target.value) }))} 
                            style={{ width: '35px', height: '8px' }}
                          />
                          <span className="font-mono text-cyan" style={{ fontSize: '0.45rem', width: '15px', textAlign: 'right' }}>{Math.round(params.ifx2Mix * 100)}%</span>
                        </div>

                        <div className="flex-row-sub" style={{ marginTop: '2px', borderTop: '1px dashed rgba(255, 230, 0, 0.1)', paddingTop: '2px' }}>
                          <label>Reverb:</label>
                          <input 
                            type="range" min="0" max="0.8" step="0.05"
                            value={params.reverbMix} 
                            onChange={(e) => setParams(prev => ({ ...prev, reverbMix: parseFloat(e.target.value) }))} 
                            style={{ width: '35px', height: '8px' }}
                          />
                          <span className="font-mono text-cyan" style={{ fontSize: '0.45rem', width: '15px', textAlign: 'right' }}>{Math.round(params.reverbMix * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* MIDI active device selection in footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.52rem', borderTop: '1px dashed rgba(0, 243, 255, 0.12)', paddingTop: '4px', marginTop: '4px' }}>
                      <span style={{ color: '#ffe600', fontWeight: 'bold' }}>MIDI IN:</span>
                      <select 
                        value={selectedMidiDevice} 
                        onChange={(e) => {
                          setSelectedMidiDevice(e.target.value);
                          const dev = midiDevices.find(d => d.id === e.target.value);
                          if (dev) setupMidiListeners(dev);
                        }}
                        disabled={midiDevices.length === 0}
                        style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff', fontSize: '0.52rem', padding: '1px', borderRadius: '3px', width: '150px' }}
                      >
                        {midiDevices.map((d) => (
                          <option key={d.id} value={d.id}>{d.name.slice(0, 25)}</option>
                        ))}
                        {midiDevices.length === 0 && <option>No Devices Found</option>}
                      </select>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div> {/* closes screen-front */}

        {/* BACK CARD: PERFORMANCE WORKSTATION */}
        <div className="screen-back" style={{ padding: '0.5rem' }}>
          <div className="lcd-bezel-shadow" style={{ height: '100%', border: '1px solid #ffe600', background: 'radial-gradient(circle at center, #0b0f19 0%, #010408 100%)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Performance Header */}
            <div className="screen-header-tabs" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px', height: '32px', alignItems: 'center', background: '#000000', borderBottom: '2px solid #ffe600', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', color: '#ffe600' }}>
                  PERFORMANCE DECK
                </span>
                {perfPlaybackActive && (
                  <span className="font-mono" style={{ fontSize: '0.55rem', color: '#00ff66', animation: 'pulse-yellow 1s infinite alternate' }}>
                    [PLAYBACK ACTIVE]
                  </span>
                )}
                {perfRecordActive && (
                  <span className="font-mono" style={{ fontSize: '0.55rem', color: '#ff0055', animation: 'pulse-red 0.5s infinite alternate' }}>
                    [REC ACTIVE: {perfEvents.length} EVTS]
                  </span>
                )}
              </div>
              
              {/* Sequencer controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  className={`btn btn-xs ${perfRecordActive && !perfIsDubbing ? 'btn-panic' : ''}`}
                  onClick={() => togglePerformanceRecord(false)}
                  style={{ padding: '2px 8px', fontSize: '0.55rem', fontWeight: 'bold', margin: 0 }}
                  title="Clean Record (clears sequence)"
                >
                  {perfRecordActive && !perfIsDubbing ? '● REC ON' : '● REC'}
                </button>
                <button
                  className="btn btn-xs"
                  onClick={() => togglePerformanceRecord(true)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.55rem',
                    fontWeight: 'bold',
                    margin: 0,
                    borderColor: perfRecordActive && perfIsDubbing ? '#ff00ff' : 'rgba(255, 0, 255, 0.4)',
                    color: perfRecordActive && perfIsDubbing ? '#fff' : '#ff00ff',
                    background: perfRecordActive && perfIsDubbing ? '#ff00ff' : 'transparent',
                    boxShadow: perfRecordActive && perfIsDubbing ? '0 0 6px #ff00ff' : 'none'
                  }}
                  title="Overdub (layers notes on top)"
                >
                  {perfRecordActive && perfIsDubbing ? '● DUB ON' : '● DUB'}
                </button>
                <button
                  className={`btn btn-xs ${perfPlaybackActive ? 'active-green' : ''}`}
                  onClick={togglePerformancePlayback}
                  style={{ padding: '2px 8px', fontSize: '0.55rem', fontWeight: 'bold', margin: 0 }}
                  title="Play/Pause"
                >
                  {perfPlaybackActive ? '⏸ PAUSE' : '► PLAY'}
                </button>
                <button
                  className="btn btn-xs"
                  onClick={stopPerformancePlayback}
                  style={{ padding: '2px 8px', fontSize: '0.55rem', fontWeight: 'bold', margin: 0, borderColor: '#ff4444', color: '#ff4444' }}
                  title="Stop & Reset"
                >
                  ■ STOP
                </button>
                <button
                  className="btn btn-xs"
                  onClick={clearPerformance}
                  style={{ padding: '2px 8px', fontSize: '0.55rem', fontWeight: 'bold', margin: 0, borderColor: '#ff0055', color: '#ff0055' }}
                  title="Clear Performance"
                >
                  CLEAR
                </button>
                <button
                  className="btn btn-xs"
                  onClick={() => setPerformanceViewActive(false)}
                  style={{ padding: '2px 8px', fontSize: '0.55rem', fontWeight: 'bold', margin: 0, borderColor: '#ffe600', color: '#ffe600' }}
                >
                  EXIT [TAB]
                </button>
              </div>
            </div>

            {/* Performance View contents */}
            {renderPerformanceDeck()}
          </div>
        </div>

      </div> {/* closes screen-flip-container */}
    </div>

        {/* ================= RIGHT SIDE CONTROLS & KAOSS PAD ================= */}
        <div className="rack-panel-right steel-plate">
          
          {/* Glowing Delta Pad Touch pad */}
          <div className="kaoss-pad-container">
            <div className="section-label">Delta Pad XY Modulator</div>
            <div className="kaoss-targets-selectors font-mono" style={{ gap: '4px' }}>
              <div className="target-select-row-new" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div className="target-row-label" style={{ fontSize: '0.42rem', marginBottom: '2px' }}>X-AXIS TARGET:</div>
                <div className="target-btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px' }}>
                  {[
                    { value: 'cutoff', label: 'CUTOFF' },
                    { value: 'lfoRate', label: 'LFO' },
                    { value: 'ifxMix', label: 'IFX' },
                    { value: 'delayTime', label: 'DELAY' },
                    { value: 'gater', label: 'GATER' },
                    { value: 'dubSiren', label: 'SIREN' },
                    { value: 'tapeStop', label: 'T-STOP' },
                    { value: 'formant', label: 'VOWEL' },
                    { value: 'bitcrush', label: 'CRUSH' },
                    { value: 'reverbFreeze', label: 'FREEZE' }
                  ].map(tgt => (
                    <button
                      key={tgt.value}
                      className={`target-btn ${kaossTargetX === tgt.value ? 'selected-x' : ''}`}
                      style={{ fontSize: '0.36rem', padding: '2px 0' }}
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
              <div className="target-select-row-new" style={{ flexDirection: 'column', alignItems: 'stretch', marginTop: '4px' }}>
                <div className="target-row-label" style={{ fontSize: '0.42rem', marginBottom: '2px' }}>Y-AXIS TARGET:</div>
                <div className="target-btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px' }}>
                  {[
                    { value: 'resonance', label: 'RESO' },
                    { value: 'reverbDecay', label: 'REVERB' },
                    { value: 'chorusRate', label: 'FB' },
                    { value: 'ringModMix', label: 'RM MIX' },
                    { value: 'ringModFreq', label: 'RM FREQ' },
                    { value: 'gater', label: 'GATER' },
                    { value: 'dubSiren', label: 'SIREN' },
                    { value: 'tapeStop', label: 'T-STOP' },
                    { value: 'formant', label: 'VOWEL' },
                    { value: 'bitcrush', label: 'CRUSH' },
                    { value: 'reverbFreeze', label: 'FREEZE' }
                  ].map(tgt => (
                    <button
                      key={tgt.value}
                      className={`target-btn ${kaossTargetY === tgt.value ? 'selected-y' : ''}`}
                      style={{ fontSize: '0.36rem', padding: '2px 0' }}
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
              style={{ position: 'relative', overflow: 'hidden', height: '170px', marginTop: '8px' }}
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
              onMouseUp={handleKaossRelease}
              onMouseLeave={handleKaossRelease}
            >
              <canvas
                ref={kaossCanvasRef}
                width={280}
                height={170}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'block'
                }}
              />
            </div>

            {/* Physics Return Modes */}
            <div className="pad-settings-row font-mono" style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#aaa', marginRight: '4px', fontSize: '0.38rem' }}>RETURN:</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {['hold', 'snap', 'spring', 'throw'].map(mode => (
                    <button
                      key={mode}
                      className={`btn btn-xs ${padReturnMode === mode ? 'active-red' : ''}`}
                      style={{ fontSize: '0.36rem', padding: '1px 3px' }}
                      onClick={() => setPadReturnMode(mode)}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                className={`btn btn-xs ${kaossPad.holdActive ? 'active-red' : ''}`}
                style={{ fontSize: '0.36rem', padding: '1px 4px' }}
                onClick={() => {
                  const nextHold = !kaossPad.holdActive;
                  setKaossPad(prev => ({ ...prev, holdActive: nextHold }));
                  if (!nextHold && !kaossPad.touchActive) {
                    const physics = kaossPhysicsRef.current;
                    physics.x = 0.5;
                    physics.y = 0.5;
                    physics.vx = 0;
                    physics.vy = 0;
                    setKaossPad(prev => ({ ...prev, x: 0.5, y: 0.5 }));
                    modulateKaossParameters(0.5, 0.5, false);
                    sendKaossMidiOut(0.5, 0.5, false);
                  } else {
                    modulateKaossParameters(kaossPad.x, kaossPad.y, kaossPad.touchActive);
                  }
                }}
              >
                HOLD
              </button>
            </div>

            {/* Gesture Recorder & Player */}
            <div className="pad-settings-row font-mono" style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.45rem' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  className={`btn btn-xs ${isRecordingGesture ? 'active-red' : ''}`}
                  style={{ fontSize: '0.36rem', padding: '1px 3px', borderColor: isRecordingGesture ? '#ff0055' : '#888' }}
                  onClick={() => {
                    const nextRec = !isRecordingGesture;
                    setIsRecordingGesture(nextRec);
                    gestureRef.current.isRecording = nextRec;
                    if (nextRec) {
                      gestureRef.current.buffer = [];
                      gestureRef.current.playIndex = 0;
                      gestureRef.current.isPlaying = false;
                      setIsPlayingGesture(false);
                    }
                  }}
                >
                  ● REC
                </button>
                <button
                  className={`btn btn-xs ${isPlayingGesture ? 'active-cyan' : ''}`}
                  style={{ fontSize: '0.36rem', padding: '1px 3px', borderColor: isPlayingGesture ? '#00f3ff' : '#888', opacity: gestureRef.current.buffer.length > 0 ? 1 : 0.5 }}
                  disabled={gestureRef.current.buffer.length === 0}
                  onClick={() => {
                    const nextPlay = !isPlayingGesture;
                    setIsPlayingGesture(nextPlay);
                    gestureRef.current.isPlaying = nextPlay;
                    if (nextPlay) {
                      gestureRef.current.playIndex = 0;
                    }
                  }}
                >
                  ► PLAY
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#aaa', marginRight: '4px', fontSize: '0.38rem' }}>MODE:</span>
                <select
                  value={gestureMode}
                  onChange={(e) => setGestureMode(e.target.value)}
                  style={{ background: '#051122', color: '#00f3ff', border: '1px solid #0a2a4d', fontSize: '0.38rem', padding: '0 2px', borderRadius: '3px' }}
                >
                  <option value="loop">LOOP</option>
                  <option value="one-shot">1-SHOT</option>
                  <option value="ping-pong">PINGPONG</option>
                </select>
              </div>
            </div>

            <div className="kaoss-footer-actions" style={{ marginTop: '8px' }}>
              <button
                className={`btn btn-sm ${glitchActive ? 'btn-glitch-active' : ''}`}
                onMouseDown={() => toggleGlitch(true)}
                onMouseUp={() => toggleGlitch(false)}
                onMouseLeave={() => { if (glitchActive) toggleGlitch(false); }}
                style={{ borderColor: '#ffe600', color: '#ffe600', flex: 1 }}
              >
                GLITCH
              </button>
              <div className="coord-readout font-mono" style={{ fontSize: '0.42rem' }}>
                X:{Math.round(kaossPad.x * 127)} | Y:{Math.round(kaossPad.y * 127)}
              </div>
            </div>
          </div>

          {/* Sample Kit Banks */}
          <div className="patches-quick-category">
            <span className="knob-label">BANK A (OSC 1) PATCH PRESET</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', gap: '4px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    className={`segmented-btn btn-xs ${bankAPreset === num ? 'active' : ''}`}
                    onClick={() => setBankAPreset(num)}
                    style={{ padding: '2px 5px', fontSize: '0.55rem' }}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button 
                  className="btn btn-xs" 
                  style={{ fontSize: '0.52rem', padding: '2px 4px', borderColor: '#00f3ff', color: '#00f3ff', margin: 0 }}
                  onClick={() => loadBankPreset('a', bankAPreset)}
                >
                  LOAD
                </button>
                <button 
                  className="btn btn-xs" 
                  style={{ fontSize: '0.52rem', padding: '2px 4px', borderColor: '#ffe600', color: '#ffe600', margin: 0 }}
                  onClick={() => saveBankPreset('a', bankAPreset)}
                >
                  SAVE
                </button>
                <button 
                  className="btn btn-xs" 
                  style={{ fontSize: '0.52rem', padding: '2px 4px', borderColor: '#ff4444', color: '#ff4444', margin: 0 }}
                  onClick={() => clearBank('a')}
                >
                  CLEAR
                </button>
              </div>
            </div>

            <span className="knob-label" style={{ color: '#ff00ff', marginTop: '6px', display: 'block' }}>BANK B (OSC 2) PATCH PRESET</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '4px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    className={`segmented-btn btn-xs ${bankBPreset === num ? 'active' : ''}`}
                    onClick={() => setBankBPreset(num)}
                    style={{ padding: '2px 5px', fontSize: '0.55rem' }}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button 
                  className="btn btn-xs" 
                  style={{ fontSize: '0.52rem', padding: '2px 4px', borderColor: '#ff00ff', color: '#ff00ff', margin: 0 }}
                  onClick={() => loadBankPreset('b', bankBPreset)}
                >
                  LOAD
                </button>
                <button 
                  className="btn btn-xs" 
                  style={{ fontSize: '0.52rem', padding: '2px 4px', borderColor: '#ffe600', color: '#ffe600', margin: 0 }}
                  onClick={() => saveBankPreset('b', bankBPreset)}
                >
                  SAVE
                </button>
                <button 
                  className="btn btn-xs" 
                  style={{ fontSize: '0.52rem', padding: '2px 4px', borderColor: '#ff4444', color: '#ff4444', margin: 0 }}
                  onClick={() => clearBank('b')}
                >
                  CLEAR
                </button>
              </div>
            </div>

            {/* Active Directory List of loaded slot names */}
            <span className="knob-label" style={{ marginTop: '8px', display: 'block' }}>Sample Slot Registry</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0, 243, 255, 0.15)', borderRadius: '4px', padding: '4px', maxHeight: '110px', overflowY: 'auto' }}>
              {/* Bank A Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#00f3ff', borderBottom: '1px solid rgba(0, 243, 255, 0.2)', paddingBottom: '2px', textAlign: 'center', fontFamily: 'monospace' }}>BANK A</div>
                {sampleSlots.filter(s => s.id.startsWith('a')).map((slot) => {
                  const isSelected = slot.id === selectedEditSlotId;
                  return (
                    <div 
                      key={slot.id}
                      onClick={() => {
                        setSelectedEditSlotId(slot.id);
                        setParams(prev => ({
                          ...prev,
                          oscAWave: slot.id
                        }));
                      }}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '1px 3px', 
                        fontSize: '0.48rem', 
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        background: isSelected ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                        border: isSelected ? '1px solid rgba(0, 243, 255, 0.3)' : '1px solid transparent',
                        color: isSelected ? '#ffe600' : '#88ccee',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontWeight: 'bold' }}>{getSlotLabel(slot.id)}:</span>
                      <span style={{ 
                        textOverflow: 'ellipsis', 
                        overflow: 'hidden', 
                        whiteSpace: 'nowrap', 
                        maxWidth: '55px',
                        color: slot.buffer ? '#fff' : '#555'
                      }} title={slot.name}>
                        {slot.buffer ? slot.name : 'empty'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bank B Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#ff00ff', borderBottom: '1px solid rgba(255, 0, 255, 0.2)', paddingBottom: '2px', textAlign: 'center', fontFamily: 'monospace' }}>BANK B</div>
                {sampleSlots.filter(s => s.id.startsWith('b')).map((slot) => {
                  const isSelected = slot.id === selectedEditSlotId;
                  return (
                    <div 
                      key={slot.id}
                      onClick={() => {
                        setSelectedEditSlotId(slot.id);
                        setParams(prev => ({
                          ...prev,
                          oscBWave: slot.id
                        }));
                      }}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '1px 3px', 
                        fontSize: '0.48rem', 
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        background: isSelected ? 'rgba(255, 0, 255, 0.15)' : 'transparent',
                        border: isSelected ? '1px solid rgba(255, 0, 255, 0.3)' : '1px solid transparent',
                        color: isSelected ? '#ffe600' : '#88ccee',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontWeight: 'bold' }}>{getSlotLabel(slot.id)}:</span>
                      <span style={{ 
                        textOverflow: 'ellipsis', 
                        overflow: 'hidden', 
                        whiteSpace: 'nowrap', 
                        maxWidth: '55px',
                        color: slot.buffer ? '#fff' : '#555'
                      }} title={slot.name}>
                        {slot.buffer ? slot.name : 'empty'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Master Tempo & Click Control */}
          <div className="patches-quick-category" style={{ marginTop: '8px' }}>
            <span className="knob-label">Master Tempo & Metronome</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0, 243, 255, 0.15)', borderRadius: '4px', padding: '6px' }}>
              {/* Tempo row */}
              <div className="flex-row-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span className="font-mono" style={{ color: '#00f3ff', fontSize: '0.55rem' }}>TEMPO:</span>
                <input 
                  type="range" min="40" max="250" step="0.1"
                  value={params.arpBpm || 120} 
                  onChange={(e) => setParams(prev => ({ ...prev, arpBpm: parseFloat(e.target.value) || 120 }))} 
                  style={{ flexGrow: 1, height: '8px' }}
                />
                <input 
                  type="text"
                  inputMode="decimal"
                  value={params.arpBpm} 
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow digits and at most one decimal point
                    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                      setParams(prev => ({ ...prev, arpBpm: val }));
                    }
                  }}
                  onBlur={() => {
                    const parsed = parseFloat(params.arpBpm);
                    if (isNaN(parsed) || parsed < 40) {
                      setParams(prev => ({ ...prev, arpBpm: 40 }));
                    } else if (parsed > 250) {
                      setParams(prev => ({ ...prev, arpBpm: 250 }));
                    } else {
                      // Round to 1 decimal place
                      setParams(prev => ({ ...prev, arpBpm: Math.round(parsed * 10) / 10 }));
                    }
                  }}
                  style={{ 
                    width: '32px', // slightly wider for decimal value display
                    background: '#000', 
                    border: '1px solid rgba(0, 243, 255, 0.4)', 
                    color: '#00f3ff', 
                    fontFamily: 'monospace', 
                    fontSize: '0.52rem', 
                    textAlign: 'center', 
                    borderRadius: '2px', 
                    padding: '1px 0',
                    outline: 'none'
                  }}
                />
                <button
                  className="segmented-btn btn-xs"
                  onClick={handleTapTempo}
                  style={{ 
                    padding: '1px 4px', 
                    fontSize: '0.5rem', 
                    border: '1px solid rgba(255, 0, 255, 0.6)', 
                    color: '#ff00ff', 
                    background: 'transparent', 
                    cursor: 'pointer', 
                    borderRadius: '2px',
                    textShadow: '0 0 2px rgba(255, 0, 255, 0.5)'
                  }}
                >
                  TAP
                </button>
              </div>

              {/* Metronome row */}
              <div className="flex-row-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', borderTop: '1px dashed rgba(255, 0, 255, 0.15)', paddingTop: '4px' }}>
                <span className="font-mono" style={{ color: '#ff00ff', fontSize: '0.55rem' }}>CLICK:</span>
                <button
                  className={`segmented-btn btn-xs ${metronomeOn ? 'active' : ''}`}
                  onClick={() => {
                    if (metronomeOn) {
                      stopMetronome();
                      setMetronomeOn(false);
                    } else {
                      setMetronomeOn(true);
                      startMetronome();
                    }
                  }}
                  style={{ padding: '2px 8px', fontSize: '0.52rem', borderColor: '#ff00ff', color: '#ff00ff' }}
                >
                  {metronomeOn ? 'ON' : 'OFF'}
                </button>
                <span className="font-mono" style={{ color: '#ff00ff', opacity: 0.8, fontSize: '0.52rem', marginLeft: '4px' }}>VOL:</span>
                <input 
                  type="range" min="0.0" max="1.0" step="0.05"
                  value={metronomeVolume} 
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setMetronomeVolume(v);
                    metronomeVolumeRef.current = v;
                  }} 
                  style={{ flexGrow: 1, height: '8px', accentColor: '#ff00ff' }}
                />
                <span style={{ fontFamily: 'monospace', fontSize: '0.52rem', width: '24px', textAlign: 'right', color: '#ff00ff' }}>
                  {Math.round(metronomeVolume * 100)}%
                </span>
              </div>

              {/* Sequencer Settings (Quantize & Count-in) */}
              <div className="flex-row-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', borderTop: '1px dashed rgba(0, 243, 255, 0.15)', paddingTop: '4px', marginTop: '4px' }}>
                <span className="font-mono" style={{ color: '#00f3ff', fontSize: '0.52rem' }}>GRID:</span>
                <select 
                  value={perfQuantizeMode} 
                  onChange={(e) => {
                    setPerfQuantizeMode(e.target.value);
                    showEditorStatus(`Quantize Grid: ${e.target.value} 📐`);
                  }}
                  style={{ background: '#000', border: '1px solid rgba(0, 243, 255, 0.4)', color: '#00f3ff', fontSize: '0.52rem', padding: '1px', borderRadius: '3px', width: '62px', outline: 'none' }}
                >
                  <option value="None">Off</option>
                  <option value="1/128">1/128</option>
                  <option value="1/64">1/64</option>
                  <option value="1/32">1/32</option>
                  <option value="1/16">1/16</option>
                  <option value="1/8">1/8</option>
                  <option value="1/4">1/4</option>
                  <option value="1/2">1/2</option>
                  <option value="Bar">Bar</option>
                </select>

                <span className="font-mono" style={{ color: '#ffe600', fontSize: '0.52rem', marginLeft: '4px' }}>COUNT-IN:</span>
                <button
                  className={`segmented-btn btn-xs ${perfCountInEnabled ? 'active' : ''}`}
                  onClick={() => {
                    const nextEnabled = !perfCountInEnabled;
                    setPerfCountInEnabled(nextEnabled);
                    showEditorStatus(`Record Count-in (1 Bar): ${nextEnabled ? 'ON' : 'OFF'} ⏱️`);
                  }}
                  style={{ padding: '2px 6px', fontSize: '0.5rem', borderColor: '#ffe600', color: '#ffe600', textShadow: perfCountInEnabled ? '0 0 4px #ffe600' : 'none', minWidth: '40px' }}
                >
                  {perfCountInEnabled ? '1 BAR' : 'OFF'}
                </button>
                
                {perfCountInActive && (
                  <span className="font-mono" style={{ color: '#ff0055', fontSize: '0.55rem', fontWeight: 'bold', textShadow: '0 0 6px #ff0055', animation: 'pulse-red 0.5s infinite alternate', marginLeft: '4px' }}>
                    {perfCountInRemaining}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* MIDI CC Learn Matrix Grid Panel */}
          <div className="patches-quick-category" style={{ marginTop: '8px' }}>
            <span className="knob-label">MIDI CC Learn Matrix</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0, 243, 255, 0.15)', borderRadius: '4px', padding: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ color: '#00f3ff', fontSize: '0.52rem', fontWeight: 'bold' }}>CC ASSIGNMENTS</span>
                <button
                  className="btn btn-xs"
                  onClick={() => {
                    setMidiMappings({});
                    localStorage.removeItem('delta7_midi_mappings');
                  }}
                  style={{ fontSize: '0.45rem', padding: '0px 4px', height: '12px', lineHeight: '10px' }}
                >
                  CLEAR ALL
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5px' }}>
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
                  { name: 'Rotr Drv', key: 'leslieDrive' },
                  { name: 'Rotr Wid', key: 'leslieWidth' },
                  { name: 'Rotr Crs', key: 'leslieCrossover' },
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
                        fontSize: '0.45rem',
                        padding: '1.5px 0',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '20px',
                        border: isLearning ? '1px solid #ff0055' : ccVal !== undefined ? '1px solid #00f3ff' : '1px solid rgba(255,255,255,0.08)',
                        background: isLearning ? 'rgba(255, 0, 85, 0.15)' : ccVal !== undefined ? 'rgba(0, 243, 255, 0.05)' : 'rgba(0,0,0,0.2)'
                      }}
                    >
                      <span style={{ color: '#fff', fontSize: '0.44rem' }}>{item.name}</span>
                      <span style={{ color: isLearning ? '#ff0055' : ccVal !== undefined ? '#00f3ff' : '#888', fontSize: '0.4rem', fontWeight: 'bold' }}>
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

      <style>{`
        /* 3D Card Flip CSS */
        .rack-panel-center {
          perspective: 1500px;
          position: relative;
        }

        .screen-flip-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 585px;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .screen-flip-container.flipped {
          transform: rotateY(180deg);
        }

        .screen-front, .screen-back {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
        }

        .screen-back {
          transform: rotateY(180deg);
        }

        /* Turntable UI Styles */
        .turntable-deck {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 8px;
          background: #02070f;
          height: 100%;
          user-select: none;
        }

        /* Guitar Hero Vertical Sequencer Highway Styles */
        .vertical-highway {
          position: relative;
          width: 250px;
          height: 400px;
          background: rgba(4, 8, 16, 0.78);
          border-radius: 6px;
          overflow: hidden;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.85);
          user-select: none;
          flex-shrink: 0;
          margin: 6px auto;
        }
        .deck-a-highway {
          border: 1px solid rgba(0, 243, 255, 0.25);
          box-shadow: 0 0 8px rgba(0, 243, 255, 0.12), inset 0 0 10px rgba(0,0,0,0.85);
        }
        .deck-b-highway {
          border: 1px solid rgba(255, 0, 255, 0.25);
          box-shadow: 0 0 8px rgba(255, 0, 255, 0.12), inset 0 0 10px rgba(0,0,0,0.85);
        }
        .highway-lane-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 0;
          border-right: 1px dashed rgba(0, 243, 255, 0.25);
          pointer-events: none;
        }
        .highway-playhead-line {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 35px;
          height: 0;
          border-bottom: 2px solid #ffe600;
          box-shadow: 0 0 6px #ffe600;
          z-index: 5;
          pointer-events: none;
        }
        .highway-target-circle {
          position: absolute;
          bottom: 31px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border-width: 1.5px;
          border-style: solid;
          background: transparent;
          z-index: 4;
          pointer-events: none;
          transition: background 0.08s, box-shadow 0.08s;
        }
        .highway-label {
          position: absolute;
          bottom: 6px;
          font-size: 0.38rem;
          font-weight: bold;
          font-family: monospace;
          text-align: center;
          width: 12px;
          z-index: 4;
          pointer-events: none;
        }
        .highway-events-container {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 35px;
          transform: translateY(0px);
          pointer-events: none;
        }

        .vinyl-platter-wrapper {
          position: relative;
          width: 250px;
          height: 250px;
          margin: 6px auto;
        }

        .vinyl-platter {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          position: relative;
          cursor: grab;
          transform-origin: center;
          box-shadow: 
            0 8px 16px rgba(0,0,0,0.6), 
            inset 0 0 10px rgba(0,0,0,0.8),
            0 0 4px rgba(0,243,255,0.1);
        }

        .vinyl-platter:active {
          cursor: grabbing;
        }


        .performance-pads-grid {
          display: grid;
          grid-template-rows: repeat(2, 1fr);
          gap: 6px;
          width: 100%;
          padding: 4px;
        }

        .performance-pads-grid-2x4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 8px;
          width: 100%;
          padding: 4px;
        }

        .performance-pads-grid-2x4 .perf-pad {
          aspect-ratio: 1;
          position: relative;
          padding: 6px 4px;
        }

        .perf-pad-routing-badges {
          position: absolute;
          top: 3px;
          left: 3px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          pointer-events: none;
        }

        .pad-badge-fx {
          background: rgba(180, 70, 255, 0.25);
          border: 1px solid rgba(180, 70, 255, 0.6);
          color: #c58cff;
          font-size: 0.38rem;
          padding: 0px 2px;
          border-radius: 2px;
          line-height: 1;
        }

        .pad-badge-pan {
          background: rgba(0, 180, 255, 0.25);
          border: 1px solid rgba(0, 180, 255, 0.6);
          color: #66ccff;
          font-size: 0.38rem;
          padding: 0px 2px;
          border-radius: 2px;
          line-height: 1;
        }

        .pad-badge-dry {
          background: rgba(113, 128, 150, 0.15);
          border: 1px solid #718096;
          color: #a0aec0;
          font-size: 0.38rem;
          padding: 0px 2px;
          border-radius: 2px;
          line-height: 1;
        }

        .performance-pads-row {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
          width: 100%;
        }

        .perf-pad {
          aspect-ratio: 1;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(10,15,25,0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-family: monospace;
          font-weight: bold;
          user-select: none;
          transition: all 0.08s ease;
          padding: 2px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .perf-pad.active {
          transform: scale(0.96);
        }

        .perf-pad.slice-loaded {
          border-color: rgba(255, 230, 0, 0.35);
          background: rgba(255, 230, 0, 0.05);
          color: #ffe600;
        }

        .perf-pad.slice-active {
          background: #ffe600 !important;
          border-color: #fff !important;
          color: #000 !important;
          box-shadow: 0 0 15px #ffe600, inset 0 0 4px rgba(255,255,255,0.8) !important;
          transform: scale(0.96);
        }

        .perf-pad-label {
          font-size: 0.52rem;
          line-height: 1;
        }

        .perf-pad-name {
          font-size: 0.36rem;
          color: #fff;
          opacity: 0.8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          text-align: center;
          margin-top: 2px;
        }

        /* Mixer column styles */
        .mixer-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          border-left: 1px solid rgba(0, 243, 255, 0.1);
          border-right: 1px solid rgba(0, 243, 255, 0.1);
          background: #010408;
          padding: 8px 6px;
          height: 100%;
        }

        .mixer-eq-section {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .mixer-eq-channel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .mixer-eq-label {
          font-size: 0.42rem;
          color: #88ccee;
          font-family: monospace;
          text-transform: uppercase;
        }

        .mixer-vertical-slider {
          writing-mode: vertical-lr;
          direction: rtl;
          width: 8px;
          height: 48px;
          margin: 0;
          cursor: pointer;
          accent-color: #ffe600;
        }

        .mixer-vol-faders {
          display: flex;
          justify-content: space-around;
          width: 100%;
          margin: 8px 0;
        }

        .mixer-fader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .mixer-fader-label {
          font-size: 0.5rem;
          color: #ffe600;
          font-weight: bold;
          font-family: monospace;
        }

        .mixer-vol-slider {
          writing-mode: vertical-lr;
          direction: rtl;
          width: 12px;
          height: 85px;
          cursor: pointer;
          accent-color: #ffe600;
        }

        .crossfader-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          margin-top: 4px;
        }

        .crossfader-label {
          font-size: 0.48rem;
          font-family: monospace;
          color: #ffe600;
          letter-spacing: 1px;
        }

        .crossfader-slider {
          width: 100%;
          height: 10px;
          cursor: pointer;
          accent-color: #ffe600;
        }

        @keyframes pulse-red {
          from { background: rgba(255, 0, 85, 0.2); }
          to { background: rgba(255, 0, 85, 0.7); }
        }

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
          max-width: 1400px;
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

        /* Deck Lower Controls Panel Styles */
        .deck-lower-controls {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 52px;
          gap: 8px;
          padding: 8px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          margin-top: auto;
          box-sizing: border-box;
        }

        .deck-left-panel {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .deck-pitch-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.35);
          padding: 4px 2px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .deck-pitch-slider-wrapper {
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .deck-pitch-slider {
          writing-mode: vertical-lr;
          direction: rtl;
          width: 16px;
          height: 110px;
          cursor: pointer;
          accent-color: #ffe600;
        }

        .deck-row {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: space-between;
        }

        .deck-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 24px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-family: monospace;
          font-size: 0.55rem;
          font-weight: bold;
          text-transform: uppercase;
          cursor: pointer;
          background: rgba(10, 15, 25, 0.8);
          color: #888;
          transition: all 0.1s ease;
          user-select: none;
        }

        .deck-btn:active {
          transform: scale(0.95);
        }

        .deck-btn-sync {
          border-color: #00f3ff;
          color: #00f3ff;
        }
        .deck-btn-sync.active {
          background: #00f3ff;
          color: #000;
          box-shadow: 0 0 8px #00f3ff;
        }

        .deck-btn-cue {
          border-color: #ffaa00;
          color: #ffaa00;
        }
        .deck-btn-cue.active {
          background: #ffaa00;
          color: #000;
          box-shadow: 0 0 8px #ffaa00;
        }

        .deck-btn-play {
          border-color: #00ff66;
          color: #00ff66;
        }
        .deck-btn-play.active {
          background: #00ff66;
          color: #000;
          box-shadow: 0 0 8px #00ff66;
        }

        .deck-loop-display {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 22px;
          background: #000;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.55rem;
          color: #00ff66;
          text-shadow: 0 0 3px #00ff66;
        }

        .deck-readout-label {
          font-family: monospace;
          font-size: 0.45rem;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Performance Timeline Panel Styles */
        .perf-timeline-panel {
          display: flex;
          flex-direction: column;
          background: #020509;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 2px;
          height: 120px;
          box-sizing: border-box;
        }
        .perf-timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2px 4px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 2px;
        }
        .perf-timeline-title {
          font-size: 0.45rem;
          font-weight: bold;
          color: #ff00ff;
          letter-spacing: 1px;
          font-family: monospace;
        }
        .perf-timeline-controls {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .perf-timeline-body {
          display: flex;
          flex: 1;
          min-height: 0;
          position: relative;
        }
        .perf-timeline-labels {
          width: 25px;
          display: flex;
          flex-direction: column;
          background: rgba(0, 0, 0, 0.3);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          user-select: none;
          box-sizing: border-box;
          padding-top: 12px;
        }
        .perf-lane-label {
          height: 5.5px;
          font-size: 0.35rem;
          line-height: 5.5px;
          font-family: monospace;
          text-align: center;
          font-weight: bold;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          box-sizing: border-box;
        }
        .perf-lane-label.label-deck-a {
          color: #00f3ff;
        }
        .perf-lane-label.label-deck-b {
          color: #ff00ff;
        }
        .perf-timeline-scroll-container {
          flex: 1;
          overflow-x: auto;
          overflow-y: hidden;
          position: relative;
          background: rgba(0, 0, 0, 0.2);
        }
        .perf-timeline-scroll-container::-webkit-scrollbar {
          height: 4px;
        }
        .perf-timeline-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
        }
        .perf-timeline-grid-canvas {
          height: 100%;
          position: relative;
          box-sizing: border-box;
          padding-top: 12px;
        }
        .perf-timeline-grid-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          pointer-events: none;
        }
        .perf-timeline-grid-line.minor {
          border-left: 1px dashed rgba(255, 255, 255, 0.04);
        }
        .perf-timeline-grid-line.major {
          border-left: 1px solid rgba(255, 255, 255, 0.12);
        }
        .beat-number {
          position: absolute;
          top: 1px;
          left: 2px;
          font-size: 0.32rem;
          color: rgba(255, 255, 255, 0.35);
          font-family: monospace;
        }
        .perf-timeline-lane {
          height: 5.5px;
          position: relative;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          box-sizing: border-box;
        }
        .perf-timeline-pill {
          position: absolute;
          top: 1px;
          height: 3.5px;
          border-radius: 1.5px;
          opacity: 0.85;
        }
        .perf-timeline-playhead {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1.5px;
          background: #ffe600;
          box-shadow: 0 0 6px #ffe600;
          z-index: 10;
          pointer-events: none;
        }

        .perf-pad.pending {
          animation: perf-pad-blink 0.3s infinite alternate;
        }
        @keyframes perf-pad-blink {
          from { opacity: 0.4; filter: brightness(0.6); }
          to { opacity: 1.0; filter: brightness(1.4) drop-shadow(0 0 5px currentColor); }
        }

        /* Pad Context Menu Popover */
        .pad-fx-popover-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          background: transparent;
        }
        .pad-fx-popover {
          position: absolute;
          background: rgba(13, 20, 32, 0.96);
          border: 1px solid rgba(0, 243, 255, 0.45);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85), 0 0 15px rgba(0, 243, 255, 0.15);
          border-radius: 8px;
          padding: 14px;
          width: 240px;
          backdrop-filter: blur(8px);
          font-family: 'Inter', system-ui, sans-serif;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 10000;
          animation: popoverFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes popoverFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(-5px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .popover-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 6px;
          margin-bottom: 4px;
        }
        .popover-title {
          font-weight: 700;
          font-size: 0.85rem;
          color: #00f3ff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .popover-close-btn {
          background: transparent;
          border: none;
          color: #a0aec0;
          cursor: pointer;
          font-size: 0.95rem;
          line-height: 1;
          padding: 2px;
          transition: color 0.2s;
        }
        .popover-close-btn:hover {
          color: #f56565;
        }
        .popover-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .popover-field label {
          font-size: 0.72rem;
          color: #a0aec0;
          font-weight: 500;
          text-transform: uppercase;
        }
        .popover-select {
          background: rgba(26, 32, 44, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
          border-radius: 4px;
          padding: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: border-color 0.2s;
          outline: none;
        }
        .popover-select:focus {
          border-color: #00f3ff;
        }
        .popover-slider-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .popover-slider-row input[type="range"] {
          flex: 1;
          accent-color: #00f3ff;
          cursor: pointer;
        }
        .popover-val-span {
          font-size: 0.75rem;
          font-family: monospace;
          color: #00f3ff;
          min-width: 36px;
          text-align: right;
        }
        .popover-reset-hint {
          font-size: 0.62rem;
          color: #718096;
          text-align: center;
          margin-top: -4px;
        }
      `}</style>

      {padMenuState.visible && (() => {
        const prefix = padMenuState.deck === 'A' ? 'a0' : 'b0';
        const slotId = prefix + (padMenuState.index + 1);
        const slot = sampleSlots.find(s => s.id === slotId);
        if (!slot) return null;

        const fxType = slot.fxType || 'None';
        const fxSend = slot.fxSend !== undefined ? slot.fxSend : 0.0;
        const pan = slot.pan !== undefined ? slot.pan : 0.0;
        const routeToXyPad = slot.routeToXyPad !== false;
        const tuning = slot.tuning !== undefined ? slot.tuning : 0;

        const updateSlotParam = (key, value) => {
          setSampleSlots(prev => prev.map(s => {
            if (s.id === slotId) {
              const updated = { ...s, [key]: value };
              saveSampleToDb(updated).catch(err => console.error("Failed to save slot route to DB:", err));
              return updated;
            }
            return s;
          }));
        };

        return (
          <>
            <div 
              className="pad-fx-popover-overlay" 
              onClick={() => setPadMenuState(prev => ({ ...prev, visible: false }))}
              onContextMenu={(e) => {
                e.preventDefault();
                setPadMenuState(prev => ({ ...prev, visible: false }));
              }}
            />
            <div 
              className="pad-fx-popover"
              style={{
                top: `${padMenuState.y}px`,
                left: `${padMenuState.x}px`,
                transform: padMenuState.x > window.innerWidth - 260 ? 'translateX(-100%)' : 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="popover-header">
                <span className="popover-title">Pad {padMenuState.deck}{padMenuState.index + 1} Routing</span>
                <button 
                  className="popover-close-btn"
                  onClick={() => setPadMenuState(prev => ({ ...prev, visible: false }))}
                >
                  ✕
                </button>
              </div>

              <div className="popover-field">
                <label>FX Target</label>
                <select 
                  className="popover-select"
                  value={fxType}
                  onChange={(e) => updateSlotParam('fxType', e.target.value)}
                >
                  <option value="None">None</option>
                  <option value="Space Echo">Space Echo (Delay)</option>
                  <option value="Reverb">Reverb</option>
                  <option value="Rotor Cabinet">Rotor Cabinet</option>
                </select>
              </div>

              <div className="popover-field">
                <label>FX Send Level ({Math.round(fxSend * 100)}%)</label>
                <div className="popover-slider-row">
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={fxSend}
                    onChange={(e) => updateSlotParam('fxSend', parseFloat(e.target.value))}
                    disabled={fxType === 'None'}
                  />
                  <span className="popover-val-span">{Math.round(fxSend * 100)}%</span>
                </div>
              </div>

              <div className="popover-field">
                <label>Stereo Pan ({pan > 0 ? 'R' : pan < 0 ? 'L' : ''}{Math.abs(Math.round(pan * 100))}%)</label>
                <div className="popover-slider-row">
                  <input 
                    type="range"
                    min="-1"
                    max="1"
                    step="0.02"
                    value={pan}
                    onChange={(e) => updateSlotParam('pan', parseFloat(e.target.value))}
                    onDoubleClick={() => updateSlotParam('pan', 0.0)}
                  />
                  <span className="popover-val-span">
                    {pan > 0 ? 'R' : pan < 0 ? 'L' : ''}{Math.abs(Math.round(pan * 100))}%
                  </span>
                </div>
                <div className="popover-reset-hint">Double-click slider to center</div>
              </div>

              <div className="popover-field">
                <label>Tuning ({tuning > 0 ? '+' : ''}{tuning} semitones)</label>
                <div className="popover-slider-row">
                  <input 
                    type="range"
                    min="-24"
                    max="24"
                    step="1"
                    value={tuning}
                    onChange={(e) => updateSlotParam('tuning', parseInt(e.target.value))}
                    onDoubleClick={() => updateSlotParam('tuning', 0)}
                  />
                  <span className="popover-val-span">
                    {tuning > 0 ? '+' : ''}{tuning}st
                  </span>
                </div>
                <div className="popover-reset-hint">Double-click slider to reset to 0</div>
              </div>

              <div className="popover-field" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '0 4px' }}>
                <label style={{ margin: 0, fontSize: '0.48rem', letterSpacing: '0.5px' }}>ROUTE TO DELTA XY</label>
                <input 
                  type="checkbox"
                  checked={routeToXyPad}
                  onChange={(e) => updateSlotParam('routeToXyPad', e.target.checked)}
                  style={{
                    accentColor: '#00f3ff',
                    cursor: 'pointer',
                    width: '14px',
                    height: '14px',
                    margin: 0
                  }}
                />
              </div>
            </div>
          </>
        );
      })()}

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

// ==========================================
// 11. SAMPLER DB (INDEXEDDB) & WAV EXPORT UTILITIES
// ==========================================

export const openSamplerDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('Delta7SamplerDB', 2);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('samples')) {
        db.createObjectStore('samples', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('banks')) {
        db.createObjectStore('banks', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const saveSampleToDb = async (slot) => {
  if (!slot.buffer) return;
  const db = await openSamplerDB();
  const tx = db.transaction('samples', 'readwrite');
  const store = tx.objectStore('samples');
  
  // Extract Float32Array from each channel
  const channels = [];
  for (let c = 0; c < slot.buffer.numberOfChannels; c++) {
    // Slice to get a copy/snapshot
    channels.push(slot.buffer.getChannelData(c).slice());
  }
  
  const record = {
    id: slot.id,
    name: slot.name,
    rootNote: slot.rootNote,
    volume: slot.volume,
    sliceCount: slot.sliceCount,
    start: slot.start,
    end: slot.end,
    loopStart: slot.loopStart,
    loopEnd: slot.loopEnd,
    loopOn: slot.loopOn,
    reverseOn: slot.reverseOn,
    sliceParams: slot.sliceParams,
    warpOn: slot.warpOn,
    warpBeats: slot.warpBeats,
    pan: slot.pan,
    fxType: slot.fxType,
    fxSend: slot.fxSend,
    routeToXyPad: slot.routeToXyPad,
    tuning: slot.tuning,
    channels: channels,
    sampleRate: slot.buffer.sampleRate
  };
  
  return new Promise((resolve, reject) => {
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
};

export const getSavedSampleFromDb = async (id) => {
  const db = await openSamplerDB();
  const tx = db.transaction('samples', 'readonly');
  const store = tx.objectStore('samples');
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
};

export const deleteSampleFromDb = async (id) => {
  const db = await openSamplerDB();
  const tx = db.transaction('samples', 'readwrite');
  const store = tx.objectStore('samples');
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
};

export const loadSavedMetadata = async () => {
  try {
    const db = await openSamplerDB();
    const tx = db.transaction('samples', 'readonly');
    const store = tx.objectStore('samples');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("Failed to load saved sampler metadata: ", err);
    return [];
  }
};

export const saveBankToDb = async (bankRecord) => {
  const db = await openSamplerDB();
  const tx = db.transaction('banks', 'readwrite');
  const store = tx.objectStore('banks');
  return new Promise((resolve, reject) => {
    const req = store.put(bankRecord);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
};

export const getSavedBankFromDb = async (id) => {
  const db = await openSamplerDB();
  const tx = db.transaction('banks', 'readonly');
  const store = tx.objectStore('banks');
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
};

export const audioBufferToWav = (buffer) => {
  const numOfChan = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // 1 = raw PCM
  const bitDepth = 16;
  
  let result;
  if (numOfChan === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else if (numOfChan > 2) {
    const length = buffer.length * numOfChan;
    result = new Float32Array(length);
    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numOfChan; c++) {
        result[i * numOfChan + c] = buffer.getChannelData(c)[i];
      }
    }
  } else {
    result = buffer.getChannelData(0);
  }
  
  const bufferLength = result.length;
  const byteLength = bufferLength * 2;
  const bufferArray = new ArrayBuffer(44 + byteLength);
  const view = new DataView(bufferArray);
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + byteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numOfChan * 2, true);
  view.setUint16(32, numOfChan * 2, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, byteLength, true);
  
  floatTo16BitPCM(view, 44, result);
  
  return new Blob([view], { type: 'audio/wav' });
};

const interleave = (inputL, inputR) => {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);
  let index = 0;
  let inputIndex = 0;
  
  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
};

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const floatTo16BitPCM = (output, offset, input) => {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
};
