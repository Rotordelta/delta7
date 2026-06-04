import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Knob from './Knob.jsx';

// ==========================================
// 1. FACTORY PRESETS & WAVEFORMS
// ==========================================

const FACTORY_PROGRAMS = [
  {
    id: 'p01',
    name: 'A001: Triton Grand Piano',
    category: 'Keyboard',
    oscMode: 'double',
    oscAWave: 'Triton Piano',
    oscAOctave: 0,
    oscAPitch: 0,
    oscADetune: 0,
    oscAPan: -0.2,
    oscAVol: 0.8,
    oscADelay: 0,
    oscBWave: 'Warm Pad',
    oscBOctave: 0,
    oscBPitch: 0,
    oscBDetune: 5,
    oscBPan: 0.2,
    oscBVol: 0.25,
    oscBDelay: 0.1,
    filterMode: 'Single',
    filterType: 'lowpass',
    cutoff: 2400,
    resonance: 3.0,
    filterEnvAmt: 1200,
    portamento: 0,
    vcfEG: { startLevel: 0.2, attackTime: 0.05, attackLevel: 1.0, decayTime: 0.3, breakLevel: 0.6, slopeTime: 0.5, sustainLevel: 0.4, releaseTime: 0.25, releaseLevel: 0 },
    vcaEG: { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.4, breakLevel: 0.7, slopeTime: 1.0, sustainLevel: 0.5, releaseTime: 0.3, releaseLevel: 0 },
    pitchEG: { startLevel: 0, attackTime: 0.01, attackLevel: 0, decayTime: 0.1, releaseTime: 0.1 },
    lfo1Rate: 4.5, lfo1Depth: 15, lfo1Target: 'pitch', lfo1Shape: 'sine',
    lfo2Rate: 3.0, lfo2Depth: 0, lfo2Target: 'filter', lfo2Shape: 'triangle',
    ifx1Type: 'Bypass', ifx1Mix: 0.3,
    ifx2Type: 'Bypass', ifx2Mix: 0.3,
    mfx1SendA: 0.15, mfx1SendB: 0.15, mfx2SendA: 0.3, mfx2SendB: 0.3,
    eqLow: 0, eqMid: 1, eqHigh: 0,
    arpOn: false, arpBpm: 120, arpPattern: 'UP', arpGate: 0.8, arpVelocity: 100, arpDivision: 8
  },
  {
    id: 'p02',
    name: 'A002: Stereo Orchestra',
    category: 'Strings',
    oscMode: 'double',
    oscAWave: 'Stereo Strings',
    oscAOctave: 0,
    oscAPitch: 0,
    oscADetune: -6,
    oscAPan: -0.5,
    oscAVol: 0.6,
    oscADelay: 0,
    oscBWave: 'Stereo Strings',
    oscBOctave: 0,
    oscBPitch: 0,
    oscBDetune: 8,
    oscBPan: 0.5,
    oscBVol: 0.6,
    oscBDelay: 0.05,
    filterMode: 'Double Series',
    filterType: 'lowpass',
    cutoff: 1300,
    resonance: 2.0,
    filterEnvAmt: 1000,
    portamento: 0.05,
    vcfEG: { startLevel: 0, attackTime: 0.4, attackLevel: 1.0, decayTime: 0.8, breakLevel: 0.8, slopeTime: 1.2, sustainLevel: 0.7, releaseTime: 0.8, releaseLevel: 0 },
    vcaEG: { startLevel: 0, attackTime: 0.3, attackLevel: 1.0, decayTime: 0.6, breakLevel: 0.8, slopeTime: 1.5, sustainLevel: 0.8, releaseTime: 0.75, releaseLevel: 0 },
    pitchEG: { startLevel: 0, attackTime: 0.05, attackLevel: 0, decayTime: 0.2, releaseTime: 0.2 },
    lfo1Rate: 5.2, lfo1Depth: 25, lfo1Target: 'pitch', lfo1Shape: 'sine',
    lfo2Rate: 0.8, lfo2Depth: 150, lfo2Target: 'filter', lfo2Shape: 'sine',
    ifx1Type: 'Chorus', ifx1Mix: 0.45,
    ifx2Type: 'Bypass', ifx2Mix: 0.3,
    mfx1SendA: 0.2, mfx1SendB: 0.2, mfx2SendA: 0.45, mfx2SendB: 0.45,
    eqLow: 2, eqMid: -1, eqHigh: 3,
    arpOn: false, arpBpm: 120, arpPattern: 'UP', arpGate: 0.8, arpVelocity: 100, arpDivision: 8
  },
  {
    id: 'p03',
    name: 'A003: Sweet Warm Pad',
    category: 'Pad',
    oscMode: 'double',
    oscAWave: 'Warm Pad',
    oscAOctave: 0,
    oscAPitch: 0,
    oscADetune: -5,
    oscAPan: -0.4,
    oscAVol: 0.65,
    oscADelay: 0,
    oscBWave: 'Bell Tines',
    oscBOctave: 1,
    oscBPitch: 0,
    oscBDetune: 5,
    oscBPan: 0.4,
    oscBVol: 0.2,
    oscBDelay: 0.15,
    filterMode: 'Single',
    filterType: 'lowpass',
    cutoff: 850,
    resonance: 3.5,
    filterEnvAmt: 1200,
    portamento: 0,
    vcfEG: { startLevel: 0.1, attackTime: 0.6, attackLevel: 0.8, decayTime: 1.0, breakLevel: 0.7, slopeTime: 1.5, sustainLevel: 0.65, releaseTime: 0.9, releaseLevel: 0 },
    vcaEG: { startLevel: 0, attackTime: 0.5, attackLevel: 1.0, decayTime: 0.8, breakLevel: 0.75, slopeTime: 2.0, sustainLevel: 0.7, releaseTime: 0.85, releaseLevel: 0 },
    pitchEG: { startLevel: 0, attackTime: 0.1, attackLevel: 0, decayTime: 0.2, releaseTime: 0.2 },
    lfo1Rate: 3.5, lfo1Depth: 20, lfo1Target: 'pitch', lfo1Shape: 'sine',
    lfo2Rate: 0.2, lfo2Depth: 250, lfo2Target: 'filter', lfo2Shape: 'triangle',
    ifx1Type: 'Phaser', ifx1Mix: 0.35,
    ifx2Type: 'Bypass', ifx2Mix: 0.3,
    mfx1SendA: 0.3, mfx1SendB: 0.3, mfx2SendA: 0.5, mfx2SendB: 0.5,
    eqLow: 3, eqMid: 0, eqHigh: 2,
    arpOn: false, arpBpm: 120, arpPattern: 'UP', arpGate: 0.8, arpVelocity: 100, arpDivision: 8
  },
  {
    id: 'p04',
    name: 'A004: Classic Brass Horns',
    category: 'Brass',
    oscMode: 'double',
    oscAWave: 'Classic Brass',
    oscAOctave: 0,
    oscAPitch: 0,
    oscADetune: -3,
    oscAPan: -0.15,
    oscAVol: 0.7,
    oscADelay: 0,
    oscBWave: 'Classic Brass',
    oscBOctave: 0,
    oscBPitch: 12,
    oscBDetune: 8,
    oscBPan: 0.15,
    oscBVol: 0.4,
    oscBDelay: 0.02,
    filterMode: 'Single',
    filterType: 'lowpass',
    cutoff: 750,
    resonance: 4.0,
    filterEnvAmt: 2400,
    portamento: 0,
    vcfEG: { startLevel: 0, attackTime: 0.08, attackLevel: 1.0, decayTime: 0.35, breakLevel: 0.5, slopeTime: 0.6, sustainLevel: 0.4, releaseTime: 0.25, releaseLevel: 0 },
    vcaEG: { startLevel: 0, attackTime: 0.04, attackLevel: 1.0, decayTime: 0.3, breakLevel: 0.7, slopeTime: 0.8, sustainLevel: 0.6, releaseTime: 0.28, releaseLevel: 0 },
    pitchEG: { startLevel: 0, attackTime: 0.02, attackLevel: 0.08, decayTime: 0.1, releaseTime: 0.15 },
    lfo1Rate: 4.8, lfo1Depth: 18, lfo1Target: 'pitch', lfo1Shape: 'sine',
    lfo2Rate: 5.5, lfo2Depth: 50, lfo2Target: 'filter', lfo2Shape: 'sine',
    ifx1Type: 'Overdrive', ifx1Mix: 0.15,
    ifx2Type: 'Bypass', ifx2Mix: 0.3,
    mfx1SendA: 0.1, mfx1SendB: 0.1, mfx2SendA: 0.25, mfx2SendB: 0.25,
    eqLow: 1, eqMid: 2, eqHigh: 1,
    arpOn: false, arpBpm: 120, arpPattern: 'UP', arpGate: 0.8, arpVelocity: 100, arpDivision: 8
  },
  {
    id: 'p05',
    name: 'A005: 90s Drawbar Organ',
    category: 'Organ',
    oscMode: 'double',
    oscAWave: 'Triton Organ',
    oscAOctave: 0,
    oscAPitch: 0,
    oscADetune: 0,
    oscAPan: -0.1,
    oscAVol: 0.7,
    oscADelay: 0,
    oscBWave: 'Triton Organ',
    oscBOctave: 0,
    oscBPitch: 7,
    oscBDetune: 4,
    oscBPan: 0.1,
    oscBVol: 0.4,
    oscBDelay: 0,
    filterMode: 'Single',
    filterType: 'lowpass',
    cutoff: 3500,
    resonance: 1.5,
    filterEnvAmt: 0,
    portamento: 0,
    vcfEG: { startLevel: 1.0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.1, breakLevel: 1.0, slopeTime: 0.1, sustainLevel: 1.0, releaseTime: 0.05, releaseLevel: 0 },
    vcaEG: { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.1, breakLevel: 1.0, slopeTime: 0.1, sustainLevel: 0.9, releaseTime: 0.08, releaseLevel: 0 },
    pitchEG: { startLevel: 0, attackTime: 0.01, attackLevel: 0, decayTime: 0.1, releaseTime: 0.1 },
    lfo1Rate: 6.2, lfo1Depth: 22, lfo1Target: 'pitch', lfo1Shape: 'sine',
    lfo2Rate: 5.5, lfo2Depth: 0, lfo2Target: 'filter', lfo2Shape: 'sine',
    ifx1Type: 'Rotary Speaker', ifx1Mix: 0.65,
    ifx2Type: 'Bypass', ifx2Mix: 0.3,
    mfx1SendA: 0.15, mfx1SendB: 0.15, mfx2SendA: 0.3, mfx2SendB: 0.3,
    eqLow: 2, eqMid: 1, eqHigh: 0,
    arpOn: false, arpBpm: 120, arpPattern: 'UP', arpGate: 0.8, arpVelocity: 100, arpDivision: 8
  },
  {
    id: 'p06',
    name: 'A006: Acoustic Nylon Guitar',
    category: 'Guitar',
    oscMode: 'double',
    oscAWave: 'Nylon Guitar',
    oscAOctave: 0,
    oscAPitch: 0,
    oscADetune: 0,
    oscAPan: -0.2,
    oscAVol: 0.75,
    oscADelay: 0,
    oscBWave: 'Bell Tines',
    oscBOctave: 1,
    oscBPitch: 0,
    oscBDetune: 8,
    oscBPan: 0.2,
    oscBVol: 0.15,
    oscBDelay: 0.08,
    filterMode: 'Single',
    filterType: 'lowpass',
    cutoff: 1800,
    resonance: 2.5,
    filterEnvAmt: 600,
    portamento: 0,
    vcfEG: { startLevel: 0.2, attackTime: 0.02, attackLevel: 1.0, decayTime: 0.22, breakLevel: 0.5, slopeTime: 0.4, sustainLevel: 0.2, releaseTime: 0.3, releaseLevel: 0 },
    vcaEG: { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.4, breakLevel: 0.3, slopeTime: 0.5, sustainLevel: 0, releaseTime: 0.32, releaseLevel: 0 },
    pitchEG: { startLevel: 0, attackTime: 0.01, attackLevel: 0, decayTime: 0.1, releaseTime: 0.1 },
    lfo1Rate: 4.0, lfo1Depth: 10, lfo1Target: 'pitch', lfo1Shape: 'sine',
    lfo2Rate: 3.5, lfo2Depth: 0, lfo2Target: 'filter', lfo2Shape: 'sine',
    ifx1Type: 'Chorus', ifx1Mix: 0.3,
    ifx2Type: 'Bypass', ifx2Mix: 0.3,
    mfx1SendA: 0.2, mfx1SendB: 0.2, mfx2SendA: 0.4, mfx2SendB: 0.4,
    eqLow: 0, eqMid: 2, eqHigh: 3,
    arpOn: false, arpBpm: 120, arpPattern: 'UP', arpGate: 0.8, arpVelocity: 100, arpDivision: 8
  },
  {
    id: 'p07',
    name: 'A007: Mellow Fretless Bass',
    category: 'Bass',
    oscMode: 'single',
    oscAWave: 'Fretless Bass',
    oscAOctave: -1,
    oscAPitch: 0,
    oscADetune: 0,
    oscAPan: 0.0,
    oscAVol: 0.95,
    oscADelay: 0,
    oscBWave: 'Fretless Bass',
    oscBOctave: -1,
    oscBPitch: 0,
    oscBDetune: 8,
    oscBPan: 0.1,
    oscBVol: 0,
    oscBDelay: 0,
    filterMode: 'Single',
    filterType: 'lowpass',
    cutoff: 600,
    resonance: 3.5,
    filterEnvAmt: 400,
    portamento: 0.15,
    vcfEG: { startLevel: 0, attackTime: 0.08, attackLevel: 0.8, decayTime: 0.4, breakLevel: 0.5, slopeTime: 0.6, sustainLevel: 0.4, releaseTime: 0.22, releaseLevel: 0 },
    vcaEG: { startLevel: 0, attackTime: 0.06, attackLevel: 1.0, decayTime: 0.5, breakLevel: 0.6, slopeTime: 0.8, sustainLevel: 0.5, releaseTime: 0.25, releaseLevel: 0 },
    pitchEG: { startLevel: 0, attackTime: 0.05, attackLevel: 0, decayTime: 0.1, releaseTime: 0.1 },
    lfo1Rate: 3.8, lfo1Depth: 12, lfo1Target: 'pitch', lfo1Shape: 'sine',
    lfo2Rate: 4.5, lfo2Depth: 0, lfo2Target: 'filter', lfo2Shape: 'triangle',
    ifx1Type: 'Bypass', ifx1Mix: 0.3,
    ifx2Type: 'Bypass', ifx2Mix: 0.3,
    mfx1SendA: 0.05, mfx1SendB: 0.05, mfx2SendA: 0.15, mfx2SendB: 0.15,
    eqLow: 3, eqMid: 2, eqHigh: -1,
    arpOn: false, arpBpm: 120, arpPattern: 'UP', arpGate: 0.8, arpVelocity: 100, arpDivision: 8
  },
  {
    id: 'p08',
    name: 'A008: Poly Trance Synth',
    category: 'Synth',
    oscMode: 'double',
    oscAWave: 'Polysynth',
    oscAOctave: 0,
    oscAPitch: 0,
    oscADetune: -8,
    oscAPan: -0.3,
    oscAVol: 0.6,
    oscADelay: 0,
    oscBWave: 'Trident Square',
    oscBOctave: 0,
    oscBPitch: 0,
    oscBDetune: 10,
    oscBPan: 0.3,
    oscBVol: 0.5,
    oscBDelay: 0.01,
    filterMode: 'Double Series',
    filterType: 'lowpass',
    cutoff: 950,
    resonance: 6.0,
    filterEnvAmt: 2000,
    portamento: 0,
    vcfEG: { startLevel: 0.1, attackTime: 0.02, attackLevel: 1.0, decayTime: 0.25, breakLevel: 0.4, slopeTime: 0.5, sustainLevel: 0.3, releaseTime: 0.35, releaseLevel: 0 },
    vcaEG: { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.35, breakLevel: 0.6, slopeTime: 0.8, sustainLevel: 0.55, releaseTime: 0.38, releaseLevel: 0 },
    pitchEG: { startLevel: 0, attackTime: 0.01, attackLevel: 0, decayTime: 0.1, releaseTime: 0.1 },
    lfo1Rate: 5.5, lfo1Depth: 0, lfo1Target: 'pitch', lfo1Shape: 'sine',
    lfo2Rate: 6.5, lfo2Depth: 80, lfo2Target: 'filter', lfo2Shape: 'triangle',
    ifx1Type: 'Phaser', ifx1Mix: 0.25,
    ifx2Type: 'Bypass', ifx2Mix: 0.3,
    mfx1SendA: 0.25, mfx1SendB: 0.25, mfx2SendA: 0.35, mfx2SendB: 0.35,
    eqLow: 1, eqMid: 0, eqHigh: 3,
    arpOn: true, arpBpm: 135, arpPattern: 'ALT1', arpGate: 0.7, arpVelocity: 110, arpDivision: 16
  },
  {
    id: 'p09',
    name: 'A009: Tubular Bell Tines',
    category: 'Bell',
    oscMode: 'double',
    oscAWave: 'Bell Tines',
    oscAOctave: 1,
    oscAPitch: 0,
    oscADetune: -2,
    oscAPan: -0.25,
    oscAVol: 0.55,
    oscADelay: 0,
    oscBWave: 'Bell Tines',
    oscBOctave: 1,
    oscBPitch: 19, // perfect fifth above an octave
    oscBDetune: 6,
    oscBPan: 0.25,
    oscBVol: 0.35,
    oscBDelay: 0.05,
    filterMode: 'Single',
    filterType: 'lowpass',
    cutoff: 1600,
    resonance: 4.5,
    filterEnvAmt: 400,
    portamento: 0,
    vcfEG: { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.4, breakLevel: 0.3, slopeTime: 0.6, sustainLevel: 0.1, releaseTime: 0.6, releaseLevel: 0 },
    vcaEG: { startLevel: 0, attackTime: 0.01, attackLevel: 1.0, decayTime: 0.6, breakLevel: 0.4, slopeTime: 0.8, sustainLevel: 0.1, releaseTime: 0.7, releaseLevel: 0 },
    pitchEG: { startLevel: 0, attackTime: 0.01, attackLevel: 0, decayTime: 0.1, releaseTime: 0.1 },
    lfo1Rate: 2.5, lfo1Depth: 25, lfo1Target: 'pitch', lfo1Shape: 'sine',
    lfo2Rate: 1.5, lfo2Depth: 80, lfo2Target: 'filter', lfo2Shape: 'sine',
    ifx1Type: 'Bypass', ifx1Mix: 0.3,
    ifx2Type: 'Bypass', ifx2Mix: 0.3,
    mfx1SendA: 0.3, mfx1SendB: 0.3, mfx2SendA: 0.6, mfx2SendB: 0.6,
    eqLow: 0, eqMid: 1, eqHigh: 4,
    arpOn: false, arpBpm: 120, arpPattern: 'UP', arpGate: 0.8, arpVelocity: 100, arpDivision: 8
  }
];

const FACTORY_COMBIS = [
  {
    id: 'c01',
    name: 'C001: Piano & String Layer',
    t1ProgId: 'p01', t1Vol: 0.85, t1Pan: -0.1, t1MinKey: 0, t1MaxKey: 127, t1Octave: 0,
    t2ProgId: 'p02', t2Vol: 0.45, t2Pan: 0.2,  t2MinKey: 0, t2MaxKey: 127, t2Octave: 0,
    t3ProgId: 'p09', t3Vol: 0.25, t3Pan: 0.4,  t3MinKey: 48, t3MaxKey: 127, t3Octave: 0,
    t4ProgId: 'p03', t4Vol: 0.0,  t4Pan: -0.3, t4MinKey: 0, t4MaxKey: 127, t4Octave: 0,
  },
  {
    id: 'c02',
    name: 'C002: Bass / Lead Split',
    t1ProgId: 'p07', t1Vol: 0.95, t1Pan: -0.1, t1MinKey: 0, t1MaxKey: 59,  t1Octave: 0, // Bass left
    t2ProgId: 'p08', t2Vol: 0.70, t2Pan: 0.2,  t2MinKey: 60, t2MaxKey: 127, t2Octave: 0, // Lead right
    t3ProgId: 'p03', t3Vol: 0.35, t3Pan: -0.4, t3MinKey: 60, t3MaxKey: 127, t3Octave: -1, // Pad right octave lower
    t4ProgId: 'p09', t4Vol: 0.0,  t4Pan: 0.3,  t4MinKey: 0, t4MaxKey: 127, t4Octave: 0,
  },
  {
    id: 'c03',
    name: 'C003: Cosmic Bell Station',
    t1ProgId: 'p03', t1Vol: 0.70, t1Pan: -0.3, t1MinKey: 0, t1MaxKey: 127, t1Octave: -1,
    t2ProgId: 'p09', t2Vol: 0.65, t2Pan: 0.3,  t2MinKey: 48, t2MaxKey: 127, t2Octave: 0,
    t3ProgId: 'p08', t3Vol: 0.30, t3Pan: 0.0,  t3MinKey: 0, t3MaxKey: 127, t3Octave: 0,
    t4ProgId: 'p01', t4Vol: 0.20, t4Pan: -0.2, t4MinKey: 0, t4MaxKey: 127, t4Octave: 0,
  }
];

// --- Custom Harmonic Generators for PCM Waveforms ---
const tritonWaveformsCache = new Map();

const getDelta7Wave = (ctx, type) => {
  if (tritonWaveformsCache.has(type)) {
    return tritonWaveformsCache.get(type);
  }

  const numHarmonics = 32;
  const real = new Float32Array(numHarmonics);
  const imag = new Float32Array(numHarmonics);
  real[0] = 0;
  imag[0] = 0;

  switch (type) {
    case 'Triton Piano':
      imag[1] = 1.0;
      imag[2] = 0.55;
      imag[3] = 0.35;
      imag[4] = 0.20;
      imag[5] = 0.12;
      imag[6] = 0.08;
      imag[7] = 0.05;
      imag[8] = 0.03;
      break;
    case 'Stereo Strings':
      for (let i = 1; i < numHarmonics; i++) {
        imag[i] = (1.0 / Math.pow(i, 0.95)) * (i % 2 === 0 ? 1 : -0.7);
      }
      break;
    case 'Warm Pad':
      imag[1] = 1.0;
      imag[2] = 0.25;
      imag[3] = 0.08;
      imag[4] = 0.02;
      break;
    case 'Classic Brass':
      imag[1] = 0.6;
      imag[2] = 0.8;
      imag[3] = 0.65;
      imag[4] = 0.35;
      imag[5] = 0.2;
      imag[6] = 0.1;
      break;
    case 'Triton Organ':
      imag[1] = 0.95;
      imag[2] = 0.0;
      imag[3] = 0.72;
      imag[4] = 0.0;
      imag[5] = 0.45;
      imag[8] = 0.28;
      break;
    case 'Nylon Guitar':
      imag[1] = 1.0;
      imag[2] = 0.68;
      imag[3] = 0.42;
      imag[4] = 0.25;
      imag[5] = 0.18;
      imag[7] = 0.12;
      break;
    case 'Fretless Bass':
      imag[1] = 1.0;
      imag[2] = 0.48;
      imag[3] = 0.08;
      imag[4] = 0.03;
      break;
    case 'Polysynth':
      for (let i = 1; i < numHarmonics; i++) {
        imag[i] = 1.0 / i;
      }
      break;
    case 'Bell Tines':
      imag[1] = 0.25;
      imag[5] = 0.55;
      imag[9] = 0.75;
      imag[14] = 0.45;
      imag[21] = 0.25;
      break;
    case 'Trident Square':
      for (let i = 1; i < numHarmonics; i += 2) {
        imag[i] = 1.0 / i;
      }
      break;
    default: // Sine
      imag[1] = 1.0;
  }

  const periodicWave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  tritonWaveformsCache.set(type, periodicWave);
  return periodicWave;
};

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
  const [params, setParams] = useState({ ...FACTORY_PROGRAMS[0], masterVolume: 80 });

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

  // FX Nodes
  const ifx1Ref = useRef(null);
  const ifx1MixRef = useRef(null);
  const ifx2Ref = useRef(null);
  const ifx2MixRef = useRef(null);
  const mfx1Ref = useRef(null);
  const mfx1SendGainRef = useRef(null); // combined send
  const mfx2Ref = useRef(null);
  const mfx2SendGainRef = useRef(null); // combined send
  const masterEqLowRef = useRef(null);
  const masterEqMidRef = useRef(null);
  const masterEqHighRef = useRef(null);

  // Visualizer Animation
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Synced Parameters Ref (for low-latency access in loop)
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
    // Update live static nodes when params change
    if (audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      if (masterEqLowRef.current) masterEqLowRef.current.gain.setValueAtTime(params.eqLow * 3, now);
      if (masterEqMidRef.current) masterEqMidRef.current.gain.setValueAtTime(params.eqMid * 3, now);
      if (masterEqHighRef.current) masterEqHighRef.current.gain.setValueAtTime(params.eqHigh * 3, now);
      
      // Update delay/reverb mix live
      if (mfx1SendGainRef.current) {
        // Approximate average of Program Sends or explicit sends
        mfx1SendGainRef.current.gain.setValueAtTime((params.mfx1SendA + (params.mfx1SendB || 0)) * 0.5, now);
      }
      if (mfx2SendGainRef.current) {
        mfx2SendGainRef.current.gain.setValueAtTime((params.mfx2SendA + (params.mfx2SendB || 0)) * 0.5, now);
      }
    }
  }, [params]);

  // Load Programs
  const handleSelectProgram = (idx) => {
    setSelectedProgIndex(idx);
    if (currentMode === 'PROG') {
      setParams(prev => ({
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

    // FX RACK SETUP
    // IFX1: Chorus or Overdrive or Phaser or Autowah
    const ifx1Container = setupIFXNode(ctx, paramsRef.current.ifx1Type, paramsRef.current.ifx1Mix);
    ifx1Ref.current = ifx1Container.effectNode;
    ifx1MixRef.current = ifx1Container.mixNode;

    // IFX2: Flanger or Rotary Speaker or RingMod
    const ifx2Container = setupIFXNode(ctx, paramsRef.current.ifx2Type, paramsRef.current.ifx2Mix);
    ifx2Ref.current = ifx2Container.effectNode;
    ifx2MixRef.current = ifx2Container.mixNode;

    // MFX1 (Stereo Delay)
    const mfx1 = createStereoDelay(ctx);
    mfx1Ref.current = mfx1;
    const mfx1SendGain = ctx.createGain();
    mfx1SendGain.gain.setValueAtTime(0.2, now);
    mfx1SendGainRef.current = mfx1SendGain;

    // MFX2 (Reverb)
    const mfx2 = createReverb(ctx);
    mfx2Ref.current = mfx2;
    const mfx2SendGain = ctx.createGain();
    mfx2SendGain.gain.setValueAtTime(0.3, now);
    mfx2SendGainRef.current = mfx2SendGain;

    // CONNECTIONS
    // Voices will connect to IFX1 Input.
    // IFX1 output connects to IFX2 Input.
    // IFX2 output splits into:
    //   - Direct path -> Master EQ
    //   - MFX1 Send Path -> MFX1 Delay -> Master EQ
    //   - MFX2 Send Path -> MFX2 Reverb -> Master EQ

    ifx1Container.outputNode.connect(ifx2Container.inputNode);

    // Splits post-IFX2
    const postIfx2Bus = ifx2Container.outputNode;
    postIfx2Bus.connect(eqLow); // Direct path to EQ

    // FX Sends
    postIfx2Bus.connect(mfx1SendGain);
    mfx1SendGain.connect(mfx1.input);
    mfx1.output.connect(eqLow); // Delay output to master EQ

    postIfx2Bus.connect(mfx2SendGain);
    mfx2SendGain.connect(mfx2.input);
    mfx2.output.connect(eqLow); // Reverb output to master EQ

    // EQ chain -> Master Gain -> Analyzer -> Destination
    eqLow.connect(eqMid);
    eqMid.connect(eqHigh);
    eqHigh.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    setSynthOn(true);
    startVisualizer();
  };

  // Helper to build IFX Node structures
  const setupIFXNode = (ctx, type, mix) => {
    const inputNode = ctx.createGain();
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    const outputNode = ctx.createGain();
    const now = ctx.currentTime;

    dryGain.gain.setValueAtTime(1.0 - mix, now);
    wetGain.gain.setValueAtTime(mix, now);

    inputNode.connect(dryGain);
    dryGain.connect(outputNode);

    let fxNode = null;

    if (type === 'Chorus') {
      const chorus = ctx.createDelay();
      chorus.delayTime.setValueAtTime(0.02, now);
      // Sweeper LFO
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(1.5, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.005, now); // 5ms wobble
      lfo.connect(lfoGain);
      lfoGain.connect(chorus.delayTime);
      lfo.start(now);
      
      inputNode.connect(chorus);
      chorus.connect(wetGain);
      fxNode = { chorus, lfo };
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
      // Swept delay + vibrato
      const delay = ctx.createDelay();
      delay.delayTime.setValueAtTime(0.01, now);
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(5.8, now); // Leslie fast speed
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.003, now);
      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);
      lfo.start(now);

      inputNode.connect(delay);
      delay.connect(wetGain);
      fxNode = { delay, lfo };
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
      feedback.connect(delay); // feedback loop
      delay.connect(wetGain);
      fxNode = { delay, lfo, feedback };
    } else if (type === 'Ring Modulator') {
      const ringMod = ctx.createGain();
      ringMod.gain.setValueAtTime(0.0, now);
      const carrier = ctx.createOscillator();
      carrier.frequency.setValueAtTime(440, now);
      
      // Connect carrier to gain control of multiplier
      carrier.connect(ringMod.gain);
      inputNode.connect(ringMod);
      ringMod.connect(wetGain);
      carrier.start(now);
      fxNode = { ringMod, carrier };
    } else { // Bypass
      inputNode.connect(wetGain);
    }

    wetGain.connect(outputNode);

    return {
      inputNode,
      outputNode,
      effectNode: fxNode,
      mixNode: { dryGain, wetGain }
    };
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

  // Triggers one single program sound voice
  const playProgramVoice = (ctx, note, velocity, prog, voiceKey, delayOffset = 0) => {
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

    // --- Create Oscillators A & B ---
    let oscA = null, oscB = null;
    let gainA = null, gainB = null;

    // Oscillator A
    const freqA = baseFreq * Math.pow(2, prog.oscAOctave) * Math.pow(2, prog.oscAPitch / 12);
    oscA = ctx.createOscillator();
    const waveA = getDelta7Wave(ctx, prog.oscAWave);
    oscA.setPeriodicWave(waveA);
    oscA.frequency.setValueAtTime(freqA, now);
    oscA.detune.setValueAtTime(prog.oscADetune, now);

    gainA = ctx.createGain();
    gainA.gain.setValueAtTime(0, now);
    oscA.connect(gainA);

    // Oscillator B
    if (prog.oscMode === 'double') {
      const freqB = baseFreq * Math.pow(2, prog.oscBOctave) * Math.pow(2, prog.oscBPitch / 12);
      oscB = ctx.createOscillator();
      const waveB = getDelta7Wave(ctx, prog.oscBWave);
      oscB.setPeriodicWave(waveB);
      oscB.frequency.setValueAtTime(freqB, now);
      oscB.detune.setValueAtTime(prog.oscBDetune, now);

      gainB = ctx.createGain();
      gainB.gain.setValueAtTime(0, now);
      oscB.connect(gainB);
    }

    // --- VCF Dual Filter ---
    const filter1 = ctx.createBiquadFilter();
    const filter2 = ctx.createBiquadFilter();

    filter1.type = prog.filterType;
    filter2.type = 'highpass'; // series HPF setup

    const baseCutoff = Math.max(20, Math.min(20000, prog.cutoff + cutoffMod + kaossCutoffOffset));
    const baseQ = Math.max(0.1, Math.min(25, prog.resonance + kaossResonanceOffset));

    filter1.frequency.setValueAtTime(baseCutoff, now);
    filter1.Q.setValueAtTime(baseQ, now);
    filter2.frequency.setValueAtTime(150, now); // Subtle low cut on Triton
    filter2.Q.setValueAtTime(1.0, now);

    // Connections: Osc Gains -> VCF
    gainA.connect(filter1);
    if (gainB) gainB.connect(filter1);

    const voiceOutGain = ctx.createGain();
    voiceOutGain.gain.setValueAtTime(1.0, now);

    if (prog.filterMode === 'Double Series') {
      filter1.connect(filter2);
      filter2.connect(voiceOutGain);
    } else {
      filter1.connect(voiceOutGain);
    }

    // Voice connects to global IFX chain
    if (ifx1Ref.current) {
      voiceOutGain.connect(ifx1Ref.current);
    } else {
      voiceOutGain.connect(masterGainRef.current);
    }

    // --- LFO Modulation Setup ---
    let vibratoLfo = null;
    let vibratoLfoGain = null;
    if (prog.lfo1Depth > 0) {
      vibratoLfo = ctx.createOscillator();
      vibratoLfo.frequency.setValueAtTime(prog.lfo1Rate, now);
      vibratoLfoGain = ctx.createGain();
      
      // Calculate Vibrato depth (including joystick modulation Y+ direction)
      const joystickMod = joystick.y > 0 ? (joystick.y * 80) : 0;
      const totalDepth = prog.lfo1Depth + joystickMod;
      vibratoLfoGain.gain.setValueAtTime(totalDepth, now);

      vibratoLfo.connect(vibratoLfoGain);
      vibratoLfoGain.connect(oscA.frequency);
      if (oscB) vibratoLfoGain.connect(oscB.frequency);
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

    // --- Envelopes Scheduling (5-Stage EGs) ---
    // Amp EG
    const vca = prog.vcaEG;
    const vcaEnvAmt = (velocity / 127) * 0.45;
    
    gainA.gain.setValueAtTime(vca.startLevel * vcaEnvAmt * prog.oscAVol, now);
    const aTime = now + vca.attackTime;
    gainA.gain.linearRampToValueAtTime(vca.attackLevel * vcaEnvAmt * prog.oscAVol, aTime);
    const dTime = aTime + vca.decayTime;
    gainA.gain.linearRampToValueAtTime(vca.breakLevel * vcaEnvAmt * prog.oscAVol, dTime);
    const sTime = dTime + vca.slopeTime;
    gainA.gain.linearRampToValueAtTime(vca.sustainLevel * vcaEnvAmt * prog.oscAVol, sTime);

    if (gainB) {
      gainB.gain.setValueAtTime(vca.startLevel * vcaEnvAmt * prog.oscBVol, now);
      gainB.gain.linearRampToValueAtTime(vca.attackLevel * vcaEnvAmt * prog.oscBVol, aTime);
      gainB.gain.linearRampToValueAtTime(vca.breakLevel * vcaEnvAmt * prog.oscBVol, dTime);
      gainB.gain.linearRampToValueAtTime(vca.sustainLevel * vcaEnvAmt * prog.oscBVol, sTime);
    }

    // Filter EG
    const vcf = prog.vcfEG;
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

    // Start Oscillators
    oscA.start(now);
    if (oscB) oscB.start(now);

    return {
      oscA, oscB, gainA, gainB, filter1, filter2, voiceOutGain,
      vibratoLfo, vibratoLfoGain, filterLfo, filterLfoGain,
      vca, vcf, baseCutoff, oscAVol: prog.oscAVol, oscBVol: prog.oscBVol
    };
  };

  const playVoice = (note, velocity) => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    if (currentMode === 'PROG') {
      const voiceKey = `${note}-prog`;
      if (activeVoicesRef.current.has(voiceKey)) {
        stopVoice(note);
      }
      const voice = playProgramVoice(ctx, note, velocity, paramsRef.current, voiceKey);
      activeVoicesRef.current.set(voiceKey, [voice]);
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
          const voice = playProgramVoice(ctx, note + track.oct * 12, velocity, adjustedProg, voiceKey, 0);
          voicesToTrigger.push(voice);
          activeVoicesRef.current.set(voiceKey, voice);
        }
      });

      // Save references tied to the source note for release
      activeVoicesRef.current.set(`combi-${note}`, voicesToTrigger);
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
        const releaseTime = voice.vca.releaseTime;

        // Cancel scheduled gain ramps and drop to zero over release duration
        voice.gainA.gain.cancelScheduledValues(now);
        voice.gainA.gain.setValueAtTime(voice.gainA.gain.value, now);
        voice.gainA.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

        if (voice.gainB) {
          voice.gainB.gain.cancelScheduledValues(now);
          voice.gainB.gain.setValueAtTime(voice.gainB.gain.value, now);
          voice.gainB.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);
        }

        // Filter decay on release
        if (voice.filter1) {
          voice.filter1.frequency.cancelScheduledValues(now);
          voice.filter1.frequency.setValueAtTime(voice.filter1.frequency.value, now);
          voice.filter1.frequency.exponentialRampToValueAtTime(Math.max(20, voice.baseCutoff * 0.1), now + releaseTime);
        }

        // Clean up node references after release decays
        const oscA = voice.oscA;
        const oscB = voice.oscB;
        const lfo1 = voice.vibratoLfo;
        const lfo2 = voice.filterLfo;
        
        setTimeout(() => {
          try {
            oscA.stop();
            if (oscB) oscB.stop();
            if (lfo1) lfo1.stop();
            if (lfo2) lfo2.stop();
          } catch {}
        }, (releaseTime + 0.1) * 1000);
      } catch (err) {
        console.warn('Error releasing voice nodes:', err);
      }
    };

    if (currentMode === 'PROG') {
      const voiceKey = `${note}-prog`;
      const voices = activeVoicesRef.current.get(voiceKey);
      if (voices) {
        voices.forEach(releaseVoice);
        activeVoicesRef.current.delete(voiceKey);
      }
    } else {
      const voiceKey = `combi-${note}`;
      const voices = activeVoicesRef.current.get(voiceKey);
      if (voices) {
        voices.forEach(releaseVoice);
        activeVoicesRef.current.delete(voiceKey);
      }
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
      if (Array.isArray(val)) {
        val.forEach(v => {
          try { v.oscA.stop(); if (v.oscB) v.oscB.stop(); } catch {}
        });
      } else {
        try { val.oscA.stop(); if (val.oscB) val.oscB.stop(); } catch {}
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
        const freqA = getFreq(60) * bendFactor; // just scale proportionately
        voice.oscA.frequency.setValueAtTime(voice.oscA.frequency.value * bendFactor, now);
        if (voice.oscB) {
          voice.oscB.frequency.setValueAtTime(voice.oscB.frequency.value * bendFactor, now);
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

    modulateKaossParameters(x, y);
  };

  const modulateKaossParameters = (x, y) => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;

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
      if (mfx1Ref.current) {
        mfx1Ref.current.delayL.delayTime.setValueAtTime(delayTimeVal, now);
        mfx1Ref.current.delayR.delayTime.setValueAtTime(delayTimeVal * 1.33, now);
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
      // Reverb size modifier
      const decaySend = y * 0.9;
      if (mfx2SendGainRef.current) mfx2SendGainRef.current.gain.setValueAtTime(decaySend, now);
    } else if (kaossTargetY === 'chorusRate') {
      const feedbackSend = y * 0.8;
      if (mfx1Ref.current) {
        mfx1Ref.current.feedbackL.gain.setValueAtTime(feedbackSend, now);
        mfx1Ref.current.feedbackR.gain.setValueAtTime(feedbackSend, now);
      }
    } else if (kaossTargetY === 'ringModMix') {
      const mixVal = y * 0.8;
      if (ifx2MixRef.current) updateIFXMix(ifx2MixRef.current, mixVal);
    }
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
        })
        .catch(() => setIsMidiSupported(false));
    }
  }, []);

  const setupMidiListeners = (input) => {
    input.onmidimessage = (message) => {
      const [status, data1, data2] = message.data;
      const cmd = status >> 4;
      const channel = status & 0xf;

      setMidiActivity(true);
      setTimeout(() => setMidiActivity(false), 80);

      if (cmd === 9 && data2 > 0) { // Note On
        playVoice(data1, data2);
      } else if (cmd === 8 || (cmd === 9 && data2 === 0)) { // Note Off
        stopVoice(data1);
      } else if (cmd === 11) { // Control Change (CC)
        handleMidiCC(data1, data2);
      } else if (cmd === 14) { // Pitch Bend
        const normalizedPb = ((data2 << 7) + data1 - 8192) / 8192; // -1 to 1
        setJoystick(prev => ({ ...prev, x: normalizedPb }));
        applyRealtimeModulation(normalizedPb, joystick.y);
      }
    };
  };

  const handleMidiCC = (cc, val) => {
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
        if (paramName === 'cutoff') {
          setParams(prev => ({ ...prev, cutoff: Math.round(valNormalized * 8000 + 100) }));
        } else if (paramName === 'resonance') {
          setParams(prev => ({ ...prev, resonance: valNormalized * 15 }));
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
            masterGainRef.current.gain.setValueAtTime(valNormalized * 0.5, audioCtxRef.current.currentTime);
          }
        } else if (paramName === 'kaossX') {
          setKaossPad(prev => ({ ...prev, x: valNormalized }));
          modulateKaossParameters(valNormalized, kaossPad.y);
        } else if (paramName === 'kaossY') {
          setKaossPad(prev => ({ ...prev, y: valNormalized }));
          modulateKaossParameters(kaossPad.x, valNormalized);
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
          
          {/* Animated pitch joystick */}
          <div className="joystick-wrapper">
            <span className="knob-label">JOYSTICK</span>
            <div 
              className="joystick-well"
              onMouseMove={(e) => {
                if (e.buttons === 1) {
                  const bounds = e.currentTarget.getBoundingClientRect();
                  handleJoystickDrag(e, bounds);
                }
              }}
              onMouseLeave={() => {
                setJoystick({ x: 0, y: 0 });
                applyRealtimeModulation(0, 0);
              }}
              onMouseUp={() => {
                setJoystick({ x: 0, y: 0 });
                applyRealtimeModulation(0, 0);
              }}
            >
              <div 
                className="joystick-handle"
                style={{
                  transform: `translate(${joystick.x * 25}px, ${-joystick.y * 25}px)`
                }}
              >
                <div className="joystick-cap"></div>
              </div>
            </div>
            <div className="joystick-readout font-mono">
              X: {joystick.x.toFixed(2)} | Y: {joystick.y.toFixed(2)}
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
            
            {/* Screen Header Tabs */}
            <div className="screen-header-tabs">
              <button className={`tab-btn ${currentMode === 'PROG' ? 'active-mode' : ''}`} onClick={() => toggleMode('PROG')}>PROG</button>
              <button className={`tab-btn ${currentMode === 'COMBI' ? 'active-mode' : ''}`} onClick={() => toggleMode('COMBI')}>COMBI</button>
              
              <div className="divider-line"></div>
              
              <button className={`tab-btn ${activeTab === 'MAIN' ? 'active-tab' : ''}`} onClick={() => setActiveTab('MAIN')}>MAIN</button>
              <button className={`tab-btn ${activeTab === 'OSC' ? 'active-tab' : ''}`} onClick={() => setActiveTab('OSC')}>OSC</button>
              <button className={`tab-btn ${activeTab === 'FILTER' ? 'active-tab' : ''}`} onClick={() => setActiveTab('FILTER')}>FILTER</button>
              <button className={`tab-btn ${activeTab === 'AMP' ? 'active-tab' : ''}`} onClick={() => setActiveTab('AMP')}>AMP</button>
              <button className={`tab-btn ${activeTab === 'FX' ? 'active-tab' : ''}`} onClick={() => setActiveTab('FX')}>FX</button>
              <button className={`tab-btn ${activeTab === 'ARP' ? 'active-tab' : ''}`} onClick={() => setActiveTab('ARP')}>ARP</button>
              <button className={`tab-btn ${activeTab === 'MIDI' ? 'active-tab' : ''}`} onClick={() => setActiveTab('MIDI')}>MIDI</button>
            </div>

            {/* Screen Screen Display Contents */}
            <div className="screen-content-viewport">
              
              {/* --- MAIN PAGE VIEW --- */}
              {activeTab === 'MAIN' && (
                <div className="lcd-page main-page-lcd">
                  <div className="lcd-patch-card">
                    <span className="lcd-cat-tag font-mono">{params.category.toUpperCase()}</span>
                    <h2 className="lcd-patch-name">
                      {currentMode === 'PROG' 
                        ? FACTORY_PROGRAMS[selectedProgIndex].name 
                        : FACTORY_COMBIS[selectedCombiIndex].name
                      }
                    </h2>
                    <div className="lcd-routing-row font-mono">
                      <span>MODE: {params.oscMode.toUpperCase()}</span>
                      <span>FILTER: {params.filterMode.toUpperCase()}</span>
                      <span>POLYPHONY: 16-VOICES</span>
                    </div>
                  </div>

                  {/* Oscilloscope canvas display */}
                  <div className="oscilloscope-rack-panel">
                    <canvas ref={canvasRef} width="400" height="120" className="lcd-scope-canvas"></canvas>
                  </div>
                </div>
              )}

              {/* --- OSCILLATORS PAGE VIEW --- */}
              {activeTab === 'OSC' && (
                <div className="lcd-page osc-page-lcd">
                  <div className="parameter-table">
                    <h3>Oscillator Configurations</h3>
                    <div className="row-grid-2">
                      <div className="box-section-sub">
                        <h4>OSC 1 (A)</h4>
                        <div className="flex-row-sub">
                          <label>PCM Wave:</label>
                          <select 
                            value={params.oscAWave} 
                            onChange={(e) => setParams(prev => ({ ...prev, oscAWave: e.target.value }))}
                          >
                            <option>Triton Piano</option>
                            <option>Stereo Strings</option>
                            <option>Warm Pad</option>
                            <option>Classic Brass</option>
                            <option>Triton Organ</option>
                            <option>Nylon Guitar</option>
                            <option>Fretless Bass</option>
                            <option>Polysynth</option>
                            <option>Bell Tines</option>
                            <option>Trident Square</option>
                          </select>
                        </div>
                        <div className="flex-row-sub">
                          <label>Octave:</label>
                          <input type="number" min="-2" max="2" value={params.oscAOctave} onChange={(e) => setParams(prev => ({ ...prev, oscAOctave: parseInt(e.target.value) }))} />
                        </div>
                        <div className="flex-row-sub">
                          <label>Detune:</label>
                          <input type="range" min="-50" max="50" value={params.oscADetune} onChange={(e) => setParams(prev => ({ ...prev, oscADetune: parseInt(e.target.value) }))} />
                          <span className="val-text font-mono">{params.oscADetune}c</span>
                        </div>
                      </div>

                      <div className="box-section-sub">
                        <h4>OSC 2 (B)</h4>
                        <div className="flex-row-sub">
                          <label>PCM Wave:</label>
                          <select 
                            value={params.oscBWave} 
                            onChange={(e) => setParams(prev => ({ ...prev, oscBWave: e.target.value }))}
                            disabled={params.oscMode === 'single'}
                          >
                            <option>Triton Piano</option>
                            <option>Stereo Strings</option>
                            <option>Warm Pad</option>
                            <option>Classic Brass</option>
                            <option>Triton Organ</option>
                            <option>Nylon Guitar</option>
                            <option>Fretless Bass</option>
                            <option>Polysynth</option>
                            <option>Bell Tines</option>
                            <option>Trident Square</option>
                          </select>
                        </div>
                        <div className="flex-row-sub">
                          <label>Octave:</label>
                          <input type="number" min="-2" max="2" value={params.oscBOctave} onChange={(e) => setParams(prev => ({ ...prev, oscBOctave: parseInt(e.target.value) }))} disabled={params.oscMode === 'single'} />
                        </div>
                        <div className="flex-row-sub">
                          <label>Detune:</label>
                          <input type="range" min="-50" max="50" value={params.oscBDetune} onChange={(e) => setParams(prev => ({ ...prev, oscBDetune: parseInt(e.target.value) }))} disabled={params.oscMode === 'single'} />
                          <span className="val-text font-mono">{params.oscBDetune}c</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- FILTER PAGE VIEW (WITH VISUAL 5-STAGE EG DRAWING) --- */}
              {activeTab === 'FILTER' && (
                <div className="lcd-page filter-page-lcd">
                  <div className="row-grid-2">
                    <div className="box-section-sub">
                      <h3>VCF Resonance Filter</h3>
                      <div className="flex-row-sub">
                        <label>Routing:</label>
                        <select value={params.filterMode} onChange={(e) => setParams(prev => ({ ...prev, filterMode: e.target.value }))}>
                          <option>Single</option>
                          <option>Double Series</option>
                        </select>
                      </div>
                      <div className="flex-row-sub">
                        <label>VCF Type:</label>
                        <select value={params.filterType} onChange={(e) => setParams(prev => ({ ...prev, filterType: e.target.value }))}>
                          <option>lowpass</option>
                          <option>bandpass</option>
                        </select>
                      </div>
                      <div className="flex-row-sub">
                        <label>Cutoff:</label>
                        <input type="range" min="100" max="10000" value={params.cutoff} onChange={(e) => setParams(prev => ({ ...prev, cutoff: parseInt(e.target.value) }))} />
                      </div>
                      <div className="flex-row-sub">
                        <label>Resonance:</label>
                        <input type="range" min="0.1" max="15.0" step="0.1" value={params.resonance} onChange={(e) => setParams(prev => ({ ...prev, resonance: parseFloat(e.target.value) }))} />
                      </div>
                    </div>

                    <div className="box-section-sub">
                      <h4>VCF 5-Stage Envelope Editor</h4>
                      <div className="canvas-container-sub">
                        <canvas 
                          ref={(canvas) => {
                            if (canvas) renderEgPreview(canvas, params.vcfEG);
                          }}
                          width="240" height="90" 
                          className="eg-draw-canvas"
                          onClick={(e) => handleEgCanvasClick(e, e.currentTarget, 'VCF')}
                        ></canvas>
                      </div>
                      <div className="eg-stages-labels font-mono">
                        <span>A:{params.vcfEG.attackTime}s</span>
                        <span>D:{params.vcfEG.decayTime}s</span>
                        <span>S:{params.vcfEG.sustainLevel}</span>
                        <span>R:{params.vcfEG.releaseTime}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- AMP PAGE VIEW (WITH VISUAL 5-STAGE EG DRAWING) --- */}
              {activeTab === 'AMP' && (
                <div className="lcd-page amp-page-lcd">
                  <div className="row-grid-2">
                    <div className="box-section-sub">
                      <h3>VCA Amplifier</h3>
                      <div className="flex-row-sub">
                        <label>Osc A Pan:</label>
                        <input type="range" min="-1" max="1" step="0.05" value={params.oscAPan} onChange={(e) => setParams(prev => ({ ...prev, oscAPan: parseFloat(e.target.value) }))} />
                      </div>
                      <div className="flex-row-sub">
                        <label>Osc B Pan:</label>
                        <input type="range" min="-1" max="1" step="0.05" value={params.oscBPan} onChange={(e) => setParams(prev => ({ ...prev, oscBPan: parseFloat(e.target.value) }))} disabled={params.oscMode === 'single'} />
                      </div>
                      <div className="flex-row-sub">
                        <label>Portamento:</label>
                        <input type="range" min="0" max="0.5" step="0.01" value={params.portamento} onChange={(e) => setParams(prev => ({ ...prev, portamento: parseFloat(e.target.value) }))} />
                      </div>
                    </div>

                    <div className="box-section-sub">
                      <h4>VCA 5-Stage Envelope Editor</h4>
                      <div className="canvas-container-sub">
                        <canvas 
                          ref={(canvas) => {
                            if (canvas) renderEgPreview(canvas, params.vcaEG);
                          }}
                          width="240" height="90" 
                          className="eg-draw-canvas"
                          onClick={(e) => handleEgCanvasClick(e, e.currentTarget, 'VCA')}
                        ></canvas>
                      </div>
                      <div className="eg-stages-labels font-mono">
                        <span>A:{params.vcaEG.attackTime}s</span>
                        <span>D:{params.vcaEG.decayTime}s</span>
                        <span>S:{params.vcaEG.sustainLevel}</span>
                        <span>R:{params.vcaEG.releaseTime}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- EFFECTS PAGE VIEW --- */}
              {activeTab === 'FX' && (
                <div className="lcd-page fx-page-lcd">
                  <h3>Hyper Integrated FX Routing</h3>
                  
                  <div className="row-grid-2">
                    <div className="box-section-sub">
                      <h4>Insert FX (IFX 1 & 2)</h4>
                      <div className="flex-row-sub">
                        <label>IFX 1:</label>
                        <select 
                          value={params.ifx1Type} 
                          onChange={(e) => {
                            setParams(prev => ({ ...prev, ifx1Type: e.target.value }));
                            if (audioCtxRef.current) {
                              // Reset node structure
                              const container = setupIFXNode(audioCtxRef.current, e.target.value, params.ifx1Mix);
                              ifx1Ref.current = container.effectNode;
                              ifx1MixRef.current = container.mixNode;
                            }
                          }}
                        >
                          <option>Bypass</option>
                          <option>Chorus</option>
                          <option>Overdrive</option>
                          <option>Phaser</option>
                          <option>Autowah</option>
                        </select>
                      </div>
                      <div className="flex-row-sub">
                        <label>IFX 2:</label>
                        <select 
                          value={params.ifx2Type} 
                          onChange={(e) => {
                            setParams(prev => ({ ...prev, ifx2Type: e.target.value }));
                            if (audioCtxRef.current) {
                              const container = setupIFXNode(audioCtxRef.current, e.target.value, params.ifx2Mix);
                              ifx2Ref.current = container.effectNode;
                              ifx2MixRef.current = container.mixNode;
                            }
                          }}
                        >
                          <option>Bypass</option>
                          <option>Flanger</option>
                          <option>Rotary Speaker</option>
                          <option>Ring Modulator</option>
                        </select>
                      </div>
                    </div>

                    <div className="box-section-sub">
                      <h4>Master FX Sends (MFX)</h4>
                      <div className="flex-row-sub">
                        <label>MFX 1 Send (Delay):</label>
                        <input type="range" min="0" max="1" step="0.05" value={params.mfx1SendA} onChange={(e) => setParams(prev => ({ ...prev, mfx1SendA: parseFloat(e.target.value) }))} />
                      </div>
                      <div className="flex-row-sub">
                        <label>MFX 2 Send (Reverb):</label>
                        <input type="range" min="0" max="1" step="0.05" value={params.mfx2SendA} onChange={(e) => setParams(prev => ({ ...prev, mfx2SendA: parseFloat(e.target.value) }))} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- ARPEGGIATOR PAGE VIEW --- */}
              {activeTab === 'ARP' && (
                <div className="lcd-page arp-page-lcd">
                  <h3>Dual Polyphonic Arpeggiator</h3>
                  <div className="row-grid-2">
                    <div className="box-section-sub">
                      <div className="flex-row-sub">
                        <label>Arp Enabled:</label>
                        <input type="checkbox" checked={params.arpOn} onChange={(e) => setParams(prev => ({ ...prev, arpOn: e.target.checked }))} />
                      </div>
                      <div className="flex-row-sub">
                        <label>BPM Clock:</label>
                        <input type="number" min="60" max="240" value={params.arpBpm} onChange={(e) => setParams(prev => ({ ...prev, arpBpm: parseInt(e.target.value) }))} />
                      </div>
                      <div className="flex-row-sub">
                        <label>Step Div:</label>
                        <select value={params.arpDivision} onChange={(e) => setParams(prev => ({ ...prev, arpDivision: parseInt(e.target.value) }))}>
                          <option value="4">Quarter</option>
                          <option value="8">8th</option>
                          <option value="16">16th</option>
                        </select>
                      </div>
                    </div>

                    <div className="box-section-sub">
                      <div className="flex-row-sub">
                        <label>Direction:</label>
                        <select value={params.arpPattern} onChange={(e) => setParams(prev => ({ ...prev, arpPattern: e.target.value }))}>
                          <option>UP</option>
                          <option>DOWN</option>
                          <option>ALT1</option>
                          <option>RANDOM</option>
                        </select>
                      </div>
                      <div className="flex-row-sub">
                        <label>Gate Length:</label>
                        <input type="range" min="0.1" max="1.0" step="0.05" value={params.arpGate} onChange={(e) => setParams(prev => ({ ...prev, arpGate: parseFloat(e.target.value) }))} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- MIDI SETTINGS VIEW --- */}
              {activeTab === 'MIDI' && (
                <div className="lcd-page midi-page-lcd">
                  <h3>WebMIDI Connectivity & Learn Dashboard</h3>
                  <div className="box-section-sub">
                    <div className="flex-row-sub">
                      <label>MIDI Status:</label>
                      <span className="font-mono text-cyan">{isMidiSupported ? 'SUPPORTED' : 'NOT SUPPORTED'}</span>
                    </div>
                    <div className="flex-row-sub">
                      <label>Active Input:</label>
                      <select 
                        value={selectedMidiDevice} 
                        onChange={(e) => {
                          setSelectedMidiDevice(e.target.value);
                          const dev = midiDevices.find(d => d.id === e.target.value);
                          if (dev) setupMidiListeners(dev);
                        }}
                        disabled={midiDevices.length === 0}
                      >
                        {midiDevices.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                        {midiDevices.length === 0 && <option>No Devices Found</option>}
                      </select>
                    </div>

                    <div className="midi-mappings-dashboard">
                      <h4>Mapped CC Parameters</h4>
                      <div className="mappings-tag-grid font-mono">
                        {Object.entries(midiMappings).map(([param, cc]) => (
                          <div className="mapping-item-tag" key={param}>
                            <span className="param-label-tag">{param}:</span>
                            <span className="cc-number-tag">CC {cc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE CONTROLS & KAOSS PAD ================= */}
        <div className="rack-panel-right steel-plate">
          
          {/* Glowing Kaoss Pad Touch pad */}
          <div className="kaoss-pad-container">
            <div className="section-label">Kaoss Pad XY Modulator</div>
            <div className="kaoss-targets-selectors font-mono">
              <div className="target-select-row">
                <label>X-AXIS:</label>
                <select value={kaossTargetX} onChange={(e) => setKaossTargetX(e.target.value)}>
                  <option value="cutoff">Filter Cutoff</option>
                  <option value="lfoRate">LFO Rate</option>
                  <option value="ifxMix">IFX Wet Mix</option>
                  <option value="delayTime">Delay Feed/Time</option>
                </select>
              </div>
              <div className="target-select-row">
                <label>Y-AXIS:</label>
                <select value={kaossTargetY} onChange={(e) => setKaossTargetY(e.target.value)}>
                  <option value="resonance">Filter Resonance</option>
                  <option value="reverbDecay">Reverb Send</option>
                  <option value="chorusRate">Delay Feedback</option>
                  <option value="ringModMix">RingMod mix</option>
                </select>
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
                  modulateKaossParameters(0.5, 0.5);
                }
              }}
              onMouseLeave={() => {
                setKaossPad(prev => ({ 
                  ...prev, 
                  touchActive: false 
                }));
                if (!kaossPad.holdActive) {
                  setKaossPad(prev => ({ ...prev, x: 0.5, y: 0.5 }));
                  modulateKaossParameters(0.5, 0.5);
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
                onClick={() => setKaossPad(prev => ({ ...prev, holdActive: !prev.holdActive }))}
              >
                HOLD COORDINATES
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
          {Array.from({ length: 25 }, (_, i) => {
            const baseNote = 48; // starting note C3
            const midiNote = baseNote + i;
            const isBlack = [1, 3, 6, 8, 10, 13, 15, 18, 20, 22].includes(midiNote % 12);
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
                {midiNote % 12 === 0 && <span className="label-key-c font-mono">C</span>}
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
          background: #000000;
          background-image: 
            linear-gradient(rgba(0, 243, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.08) 1px, transparent 1px);
          background-size: 25px 25px;
          border: 3px solid #00f3ff;
          border-radius: 12px;
          box-shadow: 
            0 0 25px rgba(0, 243, 255, 0.4), 
            inset 0 0 20px rgba(0, 243, 255, 0.2);
          padding: 1.25rem;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          user-select: none;
        }

        .rack-header-bar {
          background: #000000;
          border-radius: 6px;
          border: 2px solid #ff00ff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1.25rem;
          color: #f1f5f9;
          box-shadow: 0 0 12px rgba(255, 0, 255, 0.3);
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
          grid-template-columns: 240px 1fr 260px;
          gap: 1.25rem;
        }

        .steel-plate {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid #ff00ff;
          box-shadow: 
            0 0 15px rgba(255, 0, 255, 0.3), 
            inset 0 0 10px rgba(255, 0, 255, 0.15);
          border-radius: 8px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
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
