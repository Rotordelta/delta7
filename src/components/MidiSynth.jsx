import React, { useState, useEffect, useRef } from 'react';
import Knob from './Knob.jsx';

// Factory presets definition
const FACTORY_PRESETS = [
  {
    name: "FACTORY: Aries Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 10,
    syncMode: true,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0.0,
    subVolume: 0.1,
    noiseVolume: 0.0,
    cutoff: 1400,
    resonance: 5.5,
    filterType: "lowpass",
    filterEnvAmt: 1200,
    shAmount: 0,
    attack: 0.03,
    decay: 0.3,
    sustain: 0.6,
    release: 0.25,
    portamento: 0.15,
    lfoRate: 3.5,
    lfoDepth: 100,
    lfoTarget: "pitch",
    chorusDepth: 0.2,
    delayTime: 0.35,
    delayFeedback: 0.4,
    delayMix: 0.15,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.0,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true
  },
  {
    name: "FACTORY: Libra Squelch Bass",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 5,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.0,
    ringModVol: 0.0,
    subVolume: 0.4,
    noiseVolume: 0.0,
    cutoff: 450,
    resonance: 9.0,
    filterType: "lowpass",
    filterEnvAmt: 1500,
    shAmount: 0,
    attack: 0.01,
    decay: 0.18,
    sustain: 0.2,
    release: 0.15,
    portamento: 0.12,
    lfoRate: 4.5,
    lfoDepth: 0,
    lfoTarget: "none",
    chorusDepth: 0.15,
    delayTime: 0.25,
    delayFeedback: 0.3,
    delayMix: 0.2,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 5,
    filterCircuit: "acid",
    filterDrive: 0.65,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true
  },
  {
    name: "FACTORY: Libra Sub Bass",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.0,
    ringModVol: 0.0,
    subVolume: 0.9,
    noiseVolume: 0.0,
    cutoff: 350,
    resonance: 6.5,
    filterType: "lowpass",
    filterEnvAmt: 600,
    shAmount: 0,
    attack: 0.05,
    decay: 0.4,
    sustain: 0.8,
    release: 0.3,
    portamento: 0.1,
    lfoRate: 2.0,
    lfoDepth: 0,
    lfoTarget: "none",
    chorusDepth: 0.3,
    delayTime: 0.25,
    delayFeedback: 0.2,
    delayMix: 0.1,
    oscDrift: 40,
    hpfBassBoost: true,
    unisonDetune: 15,
    filterCircuit: "classic",
    filterDrive: 0.25,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true
  },
  {
    name: "FACTORY: Aries Space Drone",
    voiceMode: "poly",
    osc1Waveform: "triangle",
    osc2Waveform: "square",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 15,
    syncMode: false,
    osc1Vol: 0.4,
    osc2Vol: 0.3,
    ringModVol: 0.5,
    subVolume: 0.2,
    noiseVolume: 0.25,
    cutoff: 800,
    resonance: 4.5,
    filterType: "bandpass",
    filterEnvAmt: 0,
    shAmount: 1200,
    attack: 0.1,
    decay: 0.5,
    sustain: 0.7,
    release: 0.8,
    portamento: 0.0,
    lfoRate: 6.0,
    lfoDepth: 150,
    lfoTarget: "filter",
    chorusDepth: 0.45,
    delayTime: 0.45,
    delayFeedback: 0.65,
    delayMix: 0.4,
    oscDrift: 50,
    hpfBassBoost: false,
    unisonDetune: 10,
    filterCircuit: "classic",
    filterDrive: 0.0,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: false
  },
  {
    name: "FACTORY: Leo Pad",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "triangle",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.4,
    ringModVol: 0.2,
    subVolume: 0.3,
    noiseVolume: 0.02,
    cutoff: 950,
    resonance: 3.0,
    filterType: "lowpass",
    filterEnvAmt: 1000,
    shAmount: 100,
    attack: 0.4,
    decay: 0.7,
    sustain: 0.6,
    release: 0.65,
    portamento: 0.0,
    lfoRate: 3.0,
    lfoDepth: 50,
    lfoTarget: "pitch",
    chorusDepth: 0.4,
    delayTime: 0.3,
    delayFeedback: 0.5,
    delayMix: 0.25,
    oscDrift: 65,
    hpfBassBoost: true,
    unisonDetune: 25,
    filterCircuit: "classic",
    filterDrive: 0.15,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true
  },
  {
    name: "FACTORY: Micro-K Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 18,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0.0,
    subVolume: 0.2,
    noiseVolume: 0.05,
    cutoff: 1200,
    resonance: 4.0,
    filterType: "lowpass",
    filterEnvAmt: 1400,
    shAmount: 0,
    attack: 0.02,
    decay: 0.35,
    sustain: 0.7,
    release: 0.2,
    portamento: 0.1,
    lfoRate: 4.5,
    lfoDepth: 15,
    lfoTarget: "pitch",
    lfo2Rate: 6.0,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.15,
    delayTime: 0.3,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 30,
    hpfBassBoost: false,
    unisonDetune: 8,
    filterCircuit: "classic",
    filterDrive: 0.1,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true
  },
  {
    name: "FACTORY: Vox Formant Organ",
    voiceMode: "poly",
    osc1Waveform: "vox",
    osc2Waveform: "organ",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 5,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.4,
    ringModVol: 0.3,
    subVolume: 0.2,
    noiseVolume: 0.0,
    cutoff: 1800,
    resonance: 3.0,
    filterType: "bandpass",
    filterEnvAmt: 0,
    shAmount: 0,
    attack: 0.05,
    decay: 0.4,
    sustain: 0.8,
    release: 0.3,
    portamento: 0.0,
    lfoRate: 6.2,
    lfoDepth: 30,
    lfoTarget: "filter",
    lfo2Rate: 5.0,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.25,
    delayFeedback: 0.2,
    delayMix: 0.1,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.0,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true
  },
  {
    name: "FACTORY: Cosmic Purr Pad",
    voiceMode: "poly",
    osc1Waveform: "strings",
    osc2Waveform: "triangle",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 15,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.4,
    ringModVol: 0.0,
    subVolume: 0.3,
    noiseVolume: 0.02,
    cutoff: 850,
    resonance: 2.5,
    filterType: "lowpass",
    filterEnvAmt: 800,
    shAmount: 0,
    attack: 0.5,
    decay: 0.8,
    sustain: 0.7,
    release: 0.75,
    portamento: 0.0,
    lfoRate: 2.5,
    lfoDepth: 45,
    lfoTarget: "pitch",
    lfo2Rate: 0.8,
    lfo2Depth: 80,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.45,
    delayTime: 0.4,
    delayFeedback: 0.5,
    delayMix: 0.2,
    oscDrift: 40,
    hpfBassBoost: true,
    unisonDetune: 12,
    filterCircuit: "classic",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: false
  },
  {
    name: "FACTORY: Deep Acid Saturation",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: -1,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.2,
    ringModVol: 0.1,
    subVolume: 0.5,
    noiseVolume: 0.02,
    cutoff: 380,
    resonance: 10.5,
    filterType: "lowpass",
    filterEnvAmt: 1600,
    shAmount: 0,
    attack: 0.01,
    decay: 0.15,
    sustain: 0.15,
    release: 0.12,
    portamento: 0.14,
    lfoRate: 5.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5.0,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.0,
    delayTime: 0.22,
    delayFeedback: 0.4,
    delayMix: 0.25,
    oscDrift: 35,
    hpfBassBoost: true,
    unisonDetune: 15,
    filterCircuit: "acid",
    filterDrive: 0.85,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true
  },
  {
    name: "FACTORY: EPiano Bell Tines",
    voiceMode: "poly",
    osc1Waveform: "bell",
    osc2Waveform: "epiano",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.4,
    osc2Vol: 0.6,
    ringModVol: 0.1,
    subVolume: 0.2,
    noiseVolume: 0.0,
    cutoff: 1500,
    resonance: 3.5,
    filterType: "lowpass",
    filterEnvAmt: 300,
    shAmount: 0,
    attack: 0.01,
    decay: 0.45,
    sustain: 0.3,
    release: 0.4,
    portamento: 0.0,
    lfoRate: 4.0,
    lfoDepth: 25,
    lfoTarget: "pitch",
    lfo2Rate: 2.2,
    lfo2Depth: 35,
    lfo2Target: "volume",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.35,
    delayTime: 0.33,
    delayFeedback: 0.3,
    delayMix: 0.2,
    oscDrift: 15,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.0,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true
  },
  {
    name: "FACTORY: 8-Bit Chiptune Arp",
    voiceMode: "poly",
    osc1Waveform: "square",
    osc2Waveform: "square",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 5,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.0,
    ringModVol: 0.0,
    subVolume: 0.0,
    noiseVolume: 0.0,
    cutoff: 2500,
    resonance: 2.0,
    filterType: "lowpass",
    filterEnvAmt: 500,
    shAmount: 0,
    attack: 0.01,
    decay: 0.1,
    sustain: 0.4,
    release: 0.08,
    portamento: 0.05,
    lfoRate: 6.0,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5.0,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.0,
    delayTime: 0.15,
    delayFeedback: 0.2,
    delayMix: 0.1,
    oscDrift: 0,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.0,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    arpOn: true,
    arpBpm: 135,
    arpPattern: "up",
    arpDivision: 16
  },
  {
    name: "FACTORY: Cyberpunk Drone",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: 0,
    osc2Detune: 25,
    syncMode: true,
    osc1Vol: 0.5,
    osc2Vol: 0.4,
    ringModVol: 0.6,
    subVolume: 0.3,
    noiseVolume: 0.15,
    cutoff: 750,
    resonance: 5.5,
    filterType: "lowpass",
    filterEnvAmt: 600,
    shAmount: 200,
    attack: 0.25,
    decay: 0.6,
    sustain: 0.8,
    release: 0.7,
    portamento: 0.0,
    lfoRate: 1.8,
    lfoDepth: 350,
    lfoTarget: "filter",
    lfo2Rate: 0.5,
    lfo2Depth: 40,
    lfo2Target: "pitch",
    lfo2Shape: "triangle",
    lfo2KeySync: false,
    chorusDepth: 0.3,
    delayTime: 0.45,
    delayFeedback: 0.5,
    delayMix: 0.3,
    oscDrift: 80,
    hpfBassBoost: true,
    unisonDetune: 30,
    filterCircuit: "classic",
    filterDrive: 0.45,
    subShape: "triangle",
    subOctave: -2,
    monoEnvelopeMode: "legato",
    lfoKeySync: false
  },
  {
    name: "FACTORY: Solar Wind Sweep",
    voiceMode: "poly",
    osc1Waveform: "harmon",
    osc2Waveform: "triangle",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.4,
    osc2Vol: 0.4,
    ringModVol: 0.2,
    subVolume: 0.1,
    noiseVolume: 0.2,
    cutoff: 500,
    resonance: 6.5,
    filterType: "highpass",
    filterEnvAmt: 2000,
    shAmount: 400,
    attack: 0.4,
    decay: 0.6,
    sustain: 0.6,
    release: 0.6,
    portamento: 0.0,
    lfoRate: 3.2,
    lfoDepth: 150,
    lfoTarget: "filter",
    lfo2Rate: 0.12,
    lfo2Depth: 450,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.4,
    delayTime: 0.38,
    delayFeedback: 0.5,
    delayMix: 0.25,
    oscDrift: 50,
    hpfBassBoost: false,
    unisonDetune: 15,
    filterCircuit: "classic",
    filterDrive: 0.0,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: false
  },
  {
    name: "FACTORY: Plucky Space Echo",
    voiceMode: "poly",
    osc1Waveform: "clavit",
    osc2Waveform: "triangle",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.3,
    ringModVol: 0.0,
    subVolume: 0.2,
    noiseVolume: 0.02,
    cutoff: 1100,
    resonance: 5.0,
    filterType: "lowpass",
    filterEnvAmt: 1500,
    shAmount: 0,
    attack: 0.01,
    decay: 0.18,
    sustain: 0.2,
    release: 0.22,
    portamento: 0.0,
    lfoRate: 4.2,
    lfoDepth: 10,
    lfoTarget: "pitch",
    lfo2Rate: 5.0,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.42,
    delayFeedback: 0.55,
    delayMix: 0.35,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 8,
    filterCircuit: "classic",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true
  },
  {
    name: "FACTORY: Neon Wave Bass",
    voiceMode: "mono",
    osc1Waveform: "synth-bass",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 15,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.3,
    ringModVol: 0.0,
    subVolume: 0.6,
    noiseVolume: 0.0,
    cutoff: 480,
    resonance: 7.5,
    filterType: "lowpass",
    filterEnvAmt: 800,
    shAmount: 0,
    attack: 0.03,
    decay: 0.28,
    sustain: 0.5,
    release: 0.2,
    portamento: 0.12,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 4.8,
    lfo2Depth: 250,
    lfo2Target: "filter",
    lfo2Shape: "sawtooth",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.25,
    delayFeedback: 0.2,
    delayMix: 0.1,
    oscDrift: 45,
    hpfBassBoost: true,
    unisonDetune: 20,
    filterCircuit: "classic",
    filterDrive: 0.3,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true
  },
  {
    name: "CARPENTER: Haddonfield 5/4",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 6,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.4,
    ringModVol: 0.0,
    subVolume: 0.5,
    noiseVolume: 0.0,
    cutoff: 400,
    resonance: 6.5,
    filterType: "lowpass",
    filterEnvAmt: 1200,
    shAmount: 0,
    attack: 0.01,
    decay: 0.15,
    sustain: 0.2,
    release: 0.15,
    filterAttack: 0.01,
    filterDecay: 0.12,
    filterSustain: 0.1,
    filterRelease: 0.15,
    feedbackVol: 0.2,
    portamento: 0.05,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5.0,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.1,
    delayTime: 0.3,
    delayFeedback: 0.3,
    delayMix: 0.2,
    oscDrift: 15,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.2,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    arpOn: true,
    arpBpm: 125,
    arpPattern: "up",
    arpDivision: 8
  },
  {
    name: "CARPENTER: The Fog Drone",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "triangle",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 15,
    syncMode: false,
    osc1Vol: 0.4,
    osc2Vol: 0.4,
    ringModVol: 0.5,
    subVolume: 0.3,
    noiseVolume: 0.2,
    cutoff: 550,
    resonance: 5.5,
    filterType: "lowpass",
    filterEnvAmt: 800,
    shAmount: 0,
    attack: 0.5,
    decay: 0.8,
    sustain: 0.8,
    release: 0.7,
    filterAttack: 0.6,
    filterDecay: 0.7,
    filterSustain: 0.6,
    filterRelease: 0.75,
    feedbackVol: 0.35,
    portamento: 0.0,
    lfoRate: 1.5,
    lfoDepth: 350,
    lfoTarget: "filter",
    lfo2Rate: 5.0,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.3,
    delayMix: 0.2,
    oscDrift: 40,
    hpfBassBoost: true,
    unisonDetune: 10,
    filterCircuit: "ladder",
    filterDrive: 0.15,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: false,
    reverbMix: 0.35,
    reverbDecay: 2.8
  },
  {
    name: "CARPENTER: Escape Pluck",
    voiceMode: "mono",
    osc1Waveform: "synth-bass",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.3,
    ringModVol: 0.0,
    subVolume: 0.6,
    noiseVolume: 0.02,
    cutoff: 350,
    resonance: 7.0,
    filterType: "lowpass",
    filterEnvAmt: 1500,
    shAmount: 0,
    attack: 0.01,
    decay: 0.2,
    sustain: 0.3,
    release: 0.2,
    filterAttack: 0.01,
    filterDecay: 0.15,
    filterSustain: 0.15,
    filterRelease: 0.2,
    feedbackVol: 0.4,
    portamento: 0.1,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5.0,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.15,
    delayTime: 0.42,
    delayFeedback: 0.55,
    delayMix: 0.45,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 8,
    filterCircuit: "ladder",
    filterDrive: 0.35,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true
  },
  {
    name: "CARPENTER: Sentinel Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0.0,
    subVolume: 0.1,
    noiseVolume: 0.05,
    cutoff: 1200,
    resonance: 4.5,
    filterType: "lowpass",
    filterEnvAmt: 500,
    shAmount: 0,
    attack: 0.08,
    decay: 0.35,
    sustain: 0.8,
    release: 0.3,
    filterAttack: 0.08,
    filterDecay: 0.4,
    filterSustain: 0.7,
    filterRelease: 0.3,
    feedbackVol: 0.1,
    portamento: 0.25,
    lfoRate: 4.8,
    lfoDepth: 60,
    lfoTarget: "pitch",
    lfo2Rate: 5.0,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.35,
    delayFeedback: 0.4,
    delayMix: 0.25,
    oscDrift: 30,
    hpfBassBoost: false,
    unisonDetune: 12,
    filterCircuit: "classic",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true
  },
  {
    name: "CARPENTER: Antarctic Chill",
    voiceMode: "poly",
    osc1Waveform: "vox",
    osc2Waveform: "bell",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.4,
    ringModVol: 0.3,
    subVolume: 0.2,
    noiseVolume: 0.05,
    cutoff: 950,
    resonance: 3.5,
    filterType: "lowpass",
    filterEnvAmt: 300,
    shAmount: 0,
    attack: 0.35,
    decay: 0.65,
    sustain: 0.7,
    release: 0.6,
    filterAttack: 0.45,
    filterDecay: 0.55,
    filterSustain: 0.5,
    filterRelease: 0.6,
    feedbackVol: 0.0,
    portamento: 0.0,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5.0,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.5,
    delayTime: 0.35,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 35,
    hpfBassBoost: true,
    unisonDetune: 10,
    filterCircuit: "ladder",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.3,
    reverbDecay: 2.2
  },
  {
    name: "70S: Cascade Solo Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 6,
    syncMode: false,
    osc1Vol: 0.65,
    osc2Vol: 0.55,
    ringModVol: 0,
    subVolume: 0.2,
    noiseVolume: 0.05,
    cutoff: 850,
    resonance: 4.5,
    filterType: "lowpass",
    filterEnvAmt: 1200,
    shAmount: 0,
    attack: 0.02,
    decay: 0.4,
    sustain: 0.8,
    release: 0.3,
    filterAttack: 0.04,
    filterDecay: 0.5,
    filterSustain: 0.6,
    filterRelease: 0.4,
    feedbackVol: 0.15,
    feedbackFilterType: "lowpass",
    portamento: 0.12,
    lfoRate: 4.2,
    lfoDepth: 120,
    lfoTarget: "pitch",
    lfo2Rate: 1.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.38,
    delayFeedback: 0.35,
    delayMix: 0.2,
    oscDrift: 22,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.15,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.25,
    reverbDecay: 1.8,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.1,
    haasDelay: 0
  },
  {
    name: "70S: Stellar Prog Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 8,
    syncMode: true,
    osc1Vol: 0.7,
    osc2Vol: 0.6,
    ringModVol: 0.1,
    subVolume: 0,
    noiseVolume: 0.02,
    cutoff: 950,
    resonance: 4.5,
    filterType: "lowpass",
    filterEnvAmt: 1800,
    shAmount: 0,
    attack: 0.01,
    decay: 0.35,
    sustain: 0.75,
    release: 0.25,
    filterAttack: 0.02,
    filterDecay: 0.45,
    filterSustain: 0.5,
    filterRelease: 0.3,
    feedbackVol: 0.25,
    feedbackFilterType: "lowpass",
    portamento: 0.18,
    lfoRate: 4.8,
    lfoDepth: 80,
    lfoTarget: "pitch",
    lfo2Rate: 6,
    lfo2Depth: 150,
    lfo2Target: "filter",
    lfo2Shape: "triangle",
    lfo2KeySync: true,
    chorusDepth: 0.3,
    delayTime: 0.4,
    delayFeedback: 0.4,
    delayMix: 0.25,
    oscDrift: 28,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.3,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.3,
    reverbDecay: 2,
    phaserMix: 0.3,
    phaserRate: 0.8,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.2,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.18,
    stereoWidth: 1.25,
    haasDelay: 0.008
  },
  {
    name: "70S: Solar Flare Sync",
    voiceMode: "mono",
    osc1Waveform: "triangle",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 2,
    osc2Detune: 15,
    syncMode: true,
    osc1Vol: 0.8,
    osc2Vol: 0.75,
    ringModVol: 0.15,
    subVolume: 0.1,
    noiseVolume: 0.05,
    cutoff: 1200,
    resonance: 5,
    filterType: "lowpass",
    filterEnvAmt: 2000,
    shAmount: 0,
    attack: 0.01,
    decay: 0.45,
    sustain: 0.7,
    release: 0.2,
    filterAttack: 0.05,
    filterDecay: 0.5,
    filterSustain: 0.4,
    filterRelease: 0.3,
    feedbackVol: 0.2,
    feedbackFilterType: "highpass",
    portamento: 0.15,
    lfoRate: 5.5,
    lfoDepth: 110,
    lfoTarget: "pitch",
    lfo2Rate: 0.4,
    lfo2Depth: 300,
    lfo2Target: "filter",
    lfo2Shape: "sawtooth",
    lfo2KeySync: false,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.5,
    delayMix: 0.3,
    oscDrift: 30,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "acid",
    filterDrive: 0.35,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.2,
    reverbDecay: 1.5,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.4,
    flangerRate: 0.8,
    flangerFeedback: 0.5,
    osc1Morph: 0.5,
    osc2Morph: 0.1,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.4,
    haasDelay: 0.012
  },
  {
    name: "70S: Odyssey Duophonic",
    voiceMode: "poly",
    osc1Waveform: "square",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.55,
    ringModVol: 0.2,
    subVolume: 0,
    noiseVolume: 0.08,
    cutoff: 1250,
    resonance: 3.8,
    filterType: "bandpass",
    filterEnvAmt: 800,
    shAmount: 0,
    attack: 0.05,
    decay: 0.3,
    sustain: 0.8,
    release: 0.4,
    filterAttack: 0.08,
    filterDecay: 0.4,
    filterSustain: 0.6,
    filterRelease: 0.5,
    feedbackVol: 0.1,
    feedbackFilterType: "bypass",
    portamento: 0.08,
    lfoRate: 3.2,
    lfoDepth: 40,
    lfoTarget: "pwm",
    lfo2Rate: 5.2,
    lfo2Depth: 60,
    lfo2Target: "pitch",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.4,
    delayTime: 0.28,
    delayFeedback: 0.25,
    delayMix: 0.15,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 8,
    filterCircuit: "classic",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.2,
    phaserMix: 0.25,
    phaserRate: 0.6,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.4,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.2,
    haasDelay: 0.005
  },
  {
    name: "70S: Heliocentric Sine",
    voiceMode: "poly",
    osc1Waveform: "sine",
    osc2Waveform: "triangle",
    osc1Pitch: 1,
    osc2Pitch: 1,
    osc2Detune: 4,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.3,
    ringModVol: 0,
    subVolume: 0.3,
    noiseVolume: 0.01,
    cutoff: 2400,
    resonance: 1.5,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.12,
    decay: 0.6,
    sustain: 0.85,
    release: 0.6,
    filterAttack: 0.15,
    filterDecay: 0.7,
    filterSustain: 0.8,
    filterRelease: 0.6,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 4,
    lfoDepth: 50,
    lfoTarget: "pitch",
    lfo2Rate: 0.15,
    lfo2Depth: 300,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.35,
    delayTime: 0.5,
    delayFeedback: 0.45,
    delayMix: 0.35,
    oscDrift: 12,
    hpfBassBoost: true,
    unisonDetune: 12,
    filterCircuit: "ladder",
    filterDrive: 0,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.5,
    reverbDecay: 3.2,
    phaserMix: 0.4,
    phaserRate: 0.3,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.1,
    osc2Morph: 0.5,
    saturationMode: "warm",
    saturationAmount: 0.05,
    stereoWidth: 1.6,
    haasDelay: 0.024
  },
  {
    name: "70S: Tarkus Sweep",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "square",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 18,
    syncMode: false,
    osc1Vol: 0.65,
    osc2Vol: 0.65,
    ringModVol: 0.3,
    subVolume: 0.25,
    noiseVolume: 0.04,
    cutoff: 360,
    resonance: 5.5,
    filterType: "lowpass",
    filterEnvAmt: 1800,
    shAmount: 0,
    attack: 0.02,
    decay: 0.38,
    sustain: 0.6,
    release: 0.25,
    filterAttack: 0.04,
    filterDecay: 0.45,
    filterSustain: 0.3,
    filterRelease: 0.3,
    feedbackVol: 0.4,
    feedbackFilterType: "lowpass",
    portamento: 0.1,
    lfoRate: 3.8,
    lfoDepth: 80,
    lfoTarget: "pitch",
    lfo2Rate: 5.6,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.33,
    delayFeedback: 0.4,
    delayMix: 0.25,
    oscDrift: 32,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.45,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.2,
    reverbDecay: 1.6,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.3,
    flangerRate: 0.6,
    flangerFeedback: 0.4,
    osc1Morph: 0.3,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.15,
    haasDelay: 0.003
  },
  {
    name: "70S: Minotaur Growl",
    voiceMode: "mono",
    osc1Waveform: "triangle",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: 0,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0.2,
    subVolume: 0.35,
    noiseVolume: 0.06,
    cutoff: 600,
    resonance: 5,
    filterType: "lowpass",
    filterEnvAmt: 1400,
    shAmount: 0,
    attack: 0.03,
    decay: 0.5,
    sustain: 0.7,
    release: 0.35,
    filterAttack: 0.06,
    filterDecay: 0.6,
    filterSustain: 0.5,
    filterRelease: 0.4,
    feedbackVol: 0.35,
    feedbackFilterType: "lowpass",
    portamento: 0.15,
    lfoRate: 4.5,
    lfoDepth: 70,
    lfoTarget: "pitch",
    lfo2Rate: 0.8,
    lfo2Depth: 180,
    lfo2Target: "filter",
    lfo2Shape: "triangle",
    lfo2KeySync: true,
    chorusDepth: 0.15,
    delayTime: 0.45,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 24,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.25,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.25,
    reverbDecay: 2.2,
    phaserMix: 0.15,
    phaserRate: 0.4,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.4,
    osc2Morph: 0.2,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1,
    haasDelay: 0
  },
  {
    name: "70S: Triangle Flute",
    voiceMode: "mono",
    osc1Waveform: "triangle",
    osc2Waveform: "triangle",
    osc1Pitch: 1,
    osc2Pitch: 1,
    osc2Detune: 4,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.2,
    ringModVol: 0,
    subVolume: 0,
    noiseVolume: 0.02,
    cutoff: 1400,
    resonance: 2,
    filterType: "lowpass",
    filterEnvAmt: 600,
    shAmount: 0,
    attack: 0.08,
    decay: 0.4,
    sustain: 0.9,
    release: 0.4,
    filterAttack: 0.1,
    filterDecay: 0.5,
    filterSustain: 0.7,
    filterRelease: 0.4,
    feedbackVol: 0.05,
    feedbackFilterType: "bypass",
    portamento: 0.08,
    lfoRate: 5.2,
    lfoDepth: 140,
    lfoTarget: "pitch",
    lfo2Rate: 0.2,
    lfo2Depth: 100,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.2,
    delayTime: 0.35,
    delayFeedback: 0.25,
    delayMix: 0.18,
    oscDrift: 15,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.35,
    reverbDecay: 2.4,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.1,
    osc2Morph: 0.2,
    saturationMode: "warm",
    saturationAmount: 0.05,
    stereoWidth: 1.3,
    haasDelay: 0.015
  },
  {
    name: "70S: Spacerock Laser",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "triangle",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.4,
    ringModVol: 0.15,
    subVolume: 0.2,
    noiseVolume: 0.1,
    cutoff: 720,
    resonance: 6.2,
    filterType: "lowpass",
    filterEnvAmt: 3200,
    shAmount: 0,
    attack: 0.02,
    decay: 0.3,
    sustain: 0.2,
    release: 0.3,
    filterAttack: 0.01,
    filterDecay: 0.22,
    filterSustain: 0.1,
    filterRelease: 0.3,
    feedbackVol: 0.25,
    feedbackFilterType: "highpass",
    portamento: 0.25,
    lfoRate: 8.5,
    lfoDepth: 1800,
    lfoTarget: "filter",
    lfo2Rate: 0.5,
    lfo2Depth: 800,
    lfo2Target: "filter",
    lfo2Shape: "sawtooth",
    lfo2KeySync: true,
    chorusDepth: 0.4,
    delayTime: 0.4,
    delayFeedback: 0.6,
    delayMix: 0.4,
    oscDrift: 35,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.2,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.3,
    reverbDecay: 2,
    phaserMix: 0.5,
    phaserRate: 2.2,
    flangerMix: 0.3,
    flangerRate: 1.2,
    flangerFeedback: 0.4,
    osc1Morph: 0.4,
    osc2Morph: 0.5,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.5,
    haasDelay: 0.028
  },
  {
    name: "70S: Vintage Brass Solo",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 14,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.1,
    noiseVolume: 0.02,
    cutoff: 550,
    resonance: 3,
    filterType: "lowpass",
    filterEnvAmt: 2000,
    shAmount: 0,
    attack: 0.06,
    decay: 0.45,
    sustain: 0.7,
    release: 0.3,
    filterAttack: 0.08,
    filterDecay: 0.55,
    filterSustain: 0.5,
    filterRelease: 0.4,
    feedbackVol: 0.1,
    feedbackFilterType: "lowpass",
    portamento: 0.05,
    lfoRate: 3.5,
    lfoDepth: 50,
    lfoTarget: "pitch",
    lfo2Rate: 2,
    lfo2Depth: 80,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.35,
    delayFeedback: 0.25,
    delayMix: 0.15,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.08,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.2,
    reverbDecay: 1.5,
    phaserMix: 0.1,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.1,
    haasDelay: 0
  },
  {
    name: "70S: Cascade Phase Pad",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "strings",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 16,
    syncMode: false,
    osc1Vol: 0.45,
    osc2Vol: 0.45,
    ringModVol: 0.05,
    subVolume: 0.15,
    noiseVolume: 0.03,
    cutoff: 850,
    resonance: 3.2,
    filterType: "lowpass",
    filterEnvAmt: 500,
    shAmount: 0,
    attack: 0.8,
    decay: 1.5,
    sustain: 0.8,
    release: 1.2,
    filterAttack: 1,
    filterDecay: 2,
    filterSustain: 0.7,
    filterRelease: 1.2,
    feedbackVol: 0.1,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 1.2,
    lfoDepth: 400,
    lfoTarget: "filter",
    lfo2Rate: 0.2,
    lfo2Depth: 150,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.5,
    delayTime: 0.45,
    delayFeedback: 0.35,
    delayMix: 0.2,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 14,
    filterCircuit: "ladder",
    filterDrive: 0.08,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.4,
    reverbDecay: 2.8,
    phaserMix: 0.65,
    phaserRate: 0.35,
    flangerMix: 0.2,
    flangerRate: 0.3,
    flangerFeedback: 0.3,
    osc1Morph: 0.2,
    osc2Morph: 0.4,
    saturationMode: "warm",
    saturationAmount: 0.12,
    stereoWidth: 1.6,
    haasDelay: 0.022
  },
  {
    name: "70S: Ethereal String Machine",
    voiceMode: "poly",
    osc1Waveform: "strings",
    osc2Waveform: "strings",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 18,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.45,
    ringModVol: 0,
    subVolume: 0.1,
    noiseVolume: 0.05,
    cutoff: 1800,
    resonance: 1.8,
    filterType: "lowpass",
    filterEnvAmt: 200,
    shAmount: 0,
    attack: 0.6,
    decay: 1.2,
    sustain: 0.9,
    release: 1,
    filterAttack: 0.8,
    filterDecay: 1.5,
    filterSustain: 0.85,
    filterRelease: 1,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 5.5,
    lfoDepth: 50,
    lfoTarget: "pitch",
    lfo2Rate: 0.1,
    lfo2Depth: 80,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.85,
    delayTime: 0.5,
    delayFeedback: 0.3,
    delayMix: 0.25,
    oscDrift: 30,
    hpfBassBoost: true,
    unisonDetune: 20,
    filterCircuit: "classic",
    filterDrive: 0,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.45,
    reverbDecay: 3,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.4,
    flangerRate: 0.25,
    flangerFeedback: 0.4,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.08,
    stereoWidth: 1.85,
    haasDelay: 0.035
  },
  {
    name: "70S: Andromeda Dream",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "strings",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 22,
    syncMode: false,
    osc1Vol: 0.4,
    osc2Vol: 0.5,
    ringModVol: 0.1,
    subVolume: 0.2,
    noiseVolume: 0.04,
    cutoff: 750,
    resonance: 3.5,
    filterType: "lowpass",
    filterEnvAmt: 700,
    shAmount: 0,
    attack: 1.2,
    decay: 2,
    sustain: 0.85,
    release: 1.5,
    filterAttack: 1.5,
    filterDecay: 2.5,
    filterSustain: 0.75,
    filterRelease: 1.5,
    feedbackVol: 0.15,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 0.8,
    lfoDepth: 500,
    lfoTarget: "filter",
    lfo2Rate: 3.8,
    lfo2Depth: 30,
    lfo2Target: "pwm",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.45,
    delayTime: 0.55,
    delayFeedback: 0.4,
    delayMix: 0.22,
    oscDrift: 35,
    hpfBassBoost: true,
    unisonDetune: 16,
    filterCircuit: "ladder",
    filterDrive: 0.12,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.5,
    reverbDecay: 3.5,
    phaserMix: 0.35,
    phaserRate: 0.2,
    flangerMix: 0.15,
    flangerRate: 0.4,
    flangerFeedback: 0.3,
    osc1Morph: 0.4,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.45,
    haasDelay: 0.016
  },
  {
    name: "70S: Mellotron Choir Pad",
    voiceMode: "poly",
    osc1Waveform: "vox",
    osc2Waveform: "vox",
    osc1Pitch: -1,
    osc2Pitch: 0,
    osc2Detune: 15,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.45,
    ringModVol: 0.15,
    subVolume: 0,
    noiseVolume: 0.06,
    cutoff: 1300,
    resonance: 2.2,
    filterType: "lowpass",
    filterEnvAmt: 300,
    shAmount: 0,
    attack: 0.45,
    decay: 1,
    sustain: 0.9,
    release: 0.8,
    filterAttack: 0.6,
    filterDecay: 1.2,
    filterSustain: 0.8,
    filterRelease: 0.8,
    feedbackVol: 0.1,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 4.8,
    lfoDepth: 60,
    lfoTarget: "pitch",
    lfo2Rate: 0.4,
    lfo2Depth: 180,
    lfo2Target: "filter",
    lfo2Shape: "triangle",
    lfo2KeySync: false,
    chorusDepth: 0.35,
    delayTime: 0.42,
    delayFeedback: 0.32,
    delayMix: 0.2,
    oscDrift: 40,
    hpfBassBoost: false,
    unisonDetune: 10,
    filterCircuit: "classic",
    filterDrive: 0.15,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.4,
    reverbDecay: 2.5,
    phaserMix: 0.2,
    phaserRate: 0.8,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.3,
    osc2Morph: 0.2,
    saturationMode: "warm",
    saturationAmount: 0.3,
    stereoWidth: 1.35,
    haasDelay: 0.01
  },
  {
    name: "70S: Orion Nebula",
    voiceMode: "poly",
    osc1Waveform: "triangle",
    osc2Waveform: "square",
    osc1Pitch: 0,
    osc2Pitch: -1,
    osc2Detune: 25,
    syncMode: false,
    osc1Vol: 0.4,
    osc2Vol: 0.4,
    ringModVol: 0.55,
    subVolume: 0.2,
    noiseVolume: 0.08,
    cutoff: 950,
    resonance: 4.8,
    filterType: "lowpass",
    filterEnvAmt: 900,
    shAmount: 0,
    attack: 1.5,
    decay: 2.2,
    sustain: 0.8,
    release: 2,
    filterAttack: 2,
    filterDecay: 3,
    filterSustain: 0.6,
    filterRelease: 2,
    feedbackVol: 0.25,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 0.35,
    lfoDepth: 800,
    lfoTarget: "filter",
    lfo2Rate: 0.15,
    lfo2Depth: 400,
    lfo2Target: "pwm",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.5,
    delayTime: 0.6,
    delayFeedback: 0.5,
    delayMix: 0.3,
    oscDrift: 45,
    hpfBassBoost: true,
    unisonDetune: 22,
    filterCircuit: "ladder",
    filterDrive: 0.2,
    subShape: "sine",
    subOctave: -2,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.55,
    reverbDecay: 4.2,
    phaserMix: 0.45,
    phaserRate: 0.15,
    flangerMix: 0.25,
    flangerRate: 0.35,
    flangerFeedback: 0.45,
    osc1Morph: 0.6,
    osc2Morph: 0.4,
    saturationMode: "warm",
    saturationAmount: 0.18,
    stereoWidth: 1.7,
    haasDelay: 0.03
  },
  {
    name: "70S: Glassmorphic Swell",
    voiceMode: "poly",
    osc1Waveform: "bell",
    osc2Waveform: "strings",
    osc1Pitch: 1,
    osc2Pitch: 0,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.55,
    osc2Vol: 0.45,
    ringModVol: 0.1,
    subVolume: 0,
    noiseVolume: 0.02,
    cutoff: 1600,
    resonance: 2.5,
    filterType: "lowpass",
    filterEnvAmt: 500,
    shAmount: 0,
    attack: 0.5,
    decay: 1.8,
    sustain: 0.8,
    release: 1.4,
    filterAttack: 0.6,
    filterDecay: 2,
    filterSustain: 0.7,
    filterRelease: 1.4,
    feedbackVol: 0.05,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 60,
    lfoTarget: "pitch",
    lfo2Rate: 0.25,
    lfo2Depth: 250,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.4,
    delayTime: 0.48,
    delayFeedback: 0.38,
    delayMix: 0.22,
    oscDrift: 18,
    hpfBassBoost: true,
    unisonDetune: 12,
    filterCircuit: "ladder",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.5,
    reverbDecay: 3.6,
    phaserMix: 0.3,
    phaserRate: 0.4,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.3,
    osc2Morph: 0.5,
    saturationMode: "warm",
    saturationAmount: 0.08,
    stereoWidth: 1.55,
    haasDelay: 0.02
  },
  {
    name: "70S: Space Odyssey Drone",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "triangle",
    osc1Pitch: 0,
    osc2Pitch: -1,
    osc2Detune: 30,
    syncMode: false,
    osc1Vol: 0.3,
    osc2Vol: 0.3,
    ringModVol: 0.4,
    subVolume: 0.1,
    noiseVolume: 0.45,
    cutoff: 500,
    resonance: 6,
    filterType: "lowpass",
    filterEnvAmt: 1200,
    shAmount: 0,
    attack: 2,
    decay: 3,
    sustain: 0.9,
    release: 2.5,
    filterAttack: 2.5,
    filterDecay: 3.5,
    filterSustain: 0.7,
    filterRelease: 2.5,
    feedbackVol: 0.3,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 0.2,
    lfoDepth: 1200,
    lfoTarget: "filter",
    lfo2Rate: 0.08,
    lfo2Depth: 800,
    lfo2Target: "filter",
    lfo2Shape: "sawtooth",
    lfo2KeySync: false,
    chorusDepth: 0.5,
    delayTime: 0.65,
    delayFeedback: 0.55,
    delayMix: 0.35,
    oscDrift: 50,
    hpfBassBoost: true,
    unisonDetune: 25,
    filterCircuit: "ladder",
    filterDrive: 0.25,
    subShape: "square",
    subOctave: -2,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.6,
    reverbDecay: 4.5,
    phaserMix: 0.55,
    phaserRate: 0.1,
    flangerMix: 0.35,
    flangerRate: 0.2,
    flangerFeedback: 0.5,
    osc1Morph: 0.5,
    osc2Morph: 0.7,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.8,
    haasDelay: 0.038
  },
  {
    name: "70S: Velvet Horizon",
    voiceMode: "poly",
    osc1Waveform: "triangle",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.55,
    osc2Vol: 0.4,
    ringModVol: 0,
    subVolume: 0.3,
    noiseVolume: 0.02,
    cutoff: 450,
    resonance: 2.5,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.5,
    decay: 1.5,
    sustain: 0.9,
    release: 0.8,
    filterAttack: 0.6,
    filterDecay: 1.8,
    filterSustain: 0.8,
    filterRelease: 0.8,
    feedbackVol: 0.2,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 1.5,
    lfoDepth: 80,
    lfoTarget: "filter",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.3,
    delayTime: 0.4,
    delayFeedback: 0.3,
    delayMix: 0.18,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 12,
    filterCircuit: "ladder",
    filterDrive: 0.15,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.35,
    reverbDecay: 2.4,
    phaserMix: 0.2,
    phaserRate: 0.3,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.2,
    osc2Morph: 0.1,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.5,
    haasDelay: 0.012
  },
  {
    name: "70S: Dark Star Sweep",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: 0,
    osc2Detune: 20,
    syncMode: false,
    osc1Vol: 0.45,
    osc2Vol: 0.45,
    ringModVol: 0.2,
    subVolume: 0.1,
    noiseVolume: 0.06,
    cutoff: 800,
    resonance: 5.5,
    filterType: "lowpass",
    filterEnvAmt: 1500,
    shAmount: 0,
    attack: 0.8,
    decay: 2,
    sustain: 0.7,
    release: 1.5,
    filterAttack: 1,
    filterDecay: 2.5,
    filterSustain: 0.5,
    filterRelease: 1.5,
    feedbackVol: 0.25,
    feedbackFilterType: "highpass",
    portamento: 0,
    lfoRate: 0.6,
    lfoDepth: 450,
    lfoTarget: "filter",
    lfo2Rate: 4.5,
    lfo2Depth: 40,
    lfo2Target: "pitch",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.4,
    delayTime: 0.48,
    delayFeedback: 0.4,
    delayMix: 0.2,
    oscDrift: 32,
    hpfBassBoost: true,
    unisonDetune: 18,
    filterCircuit: "acid",
    filterDrive: 0.22,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.4,
    reverbDecay: 3,
    phaserMix: 0.5,
    phaserRate: 0.4,
    flangerMix: 0.35,
    flangerRate: 0.6,
    flangerFeedback: 0.4,
    osc1Morph: 0.3,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.4,
    haasDelay: 0.015
  },
  {
    name: "70S: Genesis Organ Pad",
    voiceMode: "poly",
    osc1Waveform: "organ",
    osc2Waveform: "strings",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.4,
    ringModVol: 0.05,
    subVolume: 0.2,
    noiseVolume: 0.02,
    cutoff: 2000,
    resonance: 1.5,
    filterType: "lowpass",
    filterEnvAmt: 200,
    shAmount: 0,
    attack: 0.2,
    decay: 1,
    sustain: 0.95,
    release: 0.7,
    filterAttack: 0.3,
    filterDecay: 1.2,
    filterSustain: 0.9,
    filterRelease: 0.7,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 6.2,
    lfoDepth: 45,
    lfoTarget: "pitch",
    lfo2Rate: 0.3,
    lfo2Depth: 100,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.6,
    delayTime: 0.38,
    delayFeedback: 0.28,
    delayMix: 0.22,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 8,
    filterCircuit: "classic",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.35,
    reverbDecay: 2.2,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.2,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.4,
    haasDelay: 0.008
  },
  {
    name: "70S: Model D Bass",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.6,
    ringModVol: 0,
    subVolume: 0.5,
    noiseVolume: 0.04,
    cutoff: 350,
    resonance: 4.8,
    filterType: "lowpass",
    filterEnvAmt: 1800,
    shAmount: 0,
    attack: 0.01,
    decay: 0.22,
    sustain: 0,
    release: 0.08,
    filterAttack: 0.02,
    filterDecay: 0.26,
    filterSustain: 0.1,
    filterRelease: 0.1,
    feedbackVol: 0.3,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.1,
    delayTime: 0.25,
    delayFeedback: 0.2,
    delayMix: 0,
    oscDrift: 18,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.25,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.05,
    reverbDecay: 1,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1,
    haasDelay: 0
  },
  {
    name: "70S: Resonant Acid Growl",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 6,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.3,
    ringModVol: 0,
    subVolume: 0.4,
    noiseVolume: 0.02,
    cutoff: 380,
    resonance: 6.5,
    filterType: "lowpass",
    filterEnvAmt: 1600,
    shAmount: 0,
    attack: 0.01,
    decay: 0.18,
    sustain: 0.2,
    release: 0.12,
    filterAttack: 0.01,
    filterDecay: 0.2,
    filterSustain: 0.15,
    filterRelease: 0.12,
    feedbackVol: 0.28,
    feedbackFilterType: "lowpass",
    portamento: 0.1,
    lfoRate: 4.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 2.5,
    lfo2Depth: 80,
    lfo2Target: "filter",
    lfo2Shape: "sawtooth",
    lfo2KeySync: true,
    chorusDepth: 0.15,
    delayTime: 0.28,
    delayFeedback: 0.3,
    delayMix: 0.12,
    oscDrift: 24,
    hpfBassBoost: true,
    unisonDetune: 4,
    filterCircuit: "acid",
    filterDrive: 0.55,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.1,
    reverbDecay: 1.2,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.2,
    flangerRate: 0.8,
    flangerFeedback: 0.35,
    osc1Morph: 0.2,
    osc2Morph: 0.4,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.1,
    haasDelay: 0
  },
  {
    name: "70S: Taurus Pedal",
    voiceMode: "mono",
    osc1Waveform: "triangle",
    osc2Waveform: "sawtooth",
    osc1Pitch: -2,
    osc2Pitch: -2,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.8,
    osc2Vol: 0.4,
    ringModVol: 0,
    subVolume: 0.7,
    noiseVolume: 0.01,
    cutoff: 280,
    resonance: 3.5,
    filterType: "lowpass",
    filterEnvAmt: 800,
    shAmount: 0,
    attack: 0.05,
    decay: 0.4,
    sustain: 0.85,
    release: 0.35,
    filterAttack: 0.06,
    filterDecay: 0.45,
    filterSustain: 0.6,
    filterRelease: 0.35,
    feedbackVol: 0.25,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 3,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.2,
    delayMix: 0.08,
    oscDrift: 15,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.2,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.8,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.1,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.25,
    haasDelay: 0
  },
  {
    name: "70S: Prog Rock Rondo",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.65,
    osc2Vol: 0.55,
    ringModVol: 0.1,
    subVolume: 0.3,
    noiseVolume: 0.03,
    cutoff: 550,
    resonance: 5,
    filterType: "lowpass",
    filterEnvAmt: 1400,
    shAmount: 0,
    attack: 0.01,
    decay: 0.25,
    sustain: 0.4,
    release: 0.15,
    filterAttack: 0.02,
    filterDecay: 0.3,
    filterSustain: 0.3,
    filterRelease: 0.15,
    feedbackVol: 0.2,
    feedbackFilterType: "lowpass",
    portamento: 0.05,
    lfoRate: 4,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.32,
    delayFeedback: 0.3,
    delayMix: 0.2,
    oscDrift: 22,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.15,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.12,
    reverbDecay: 1.4,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.2,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.22,
    stereoWidth: 1.3,
    haasDelay: 0.006
  },
  {
    name: "70S: Wasp Squelch",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "triangle",
    osc1Pitch: -1,
    osc2Pitch: 0,
    osc2Detune: 14,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0.4,
    subVolume: 0.2,
    noiseVolume: 0.08,
    cutoff: 650,
    resonance: 5.8,
    filterType: "bandpass",
    filterEnvAmt: 1800,
    shAmount: 0,
    attack: 0.02,
    decay: 0.2,
    sustain: 0.3,
    release: 0.18,
    filterAttack: 0.03,
    filterDecay: 0.24,
    filterSustain: 0.2,
    filterRelease: 0.18,
    feedbackVol: 0.35,
    feedbackFilterType: "highpass",
    portamento: 0.08,
    lfoRate: 5,
    lfoDepth: 120,
    lfoTarget: "pwm",
    lfo2Rate: 6.5,
    lfo2Depth: 300,
    lfo2Target: "filter",
    lfo2Shape: "sawtooth",
    lfo2KeySync: true,
    chorusDepth: 0.3,
    delayTime: 0.26,
    delayFeedback: 0.45,
    delayMix: 0.25,
    oscDrift: 35,
    hpfBassBoost: false,
    unisonDetune: 6,
    filterCircuit: "classic",
    filterDrive: 0.4,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.2,
    reverbDecay: 1.5,
    phaserMix: 0.35,
    phaserRate: 1.8,
    flangerMix: 0.25,
    flangerRate: 0.7,
    flangerFeedback: 0.4,
    osc1Morph: 0.5,
    osc2Morph: 0.4,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.2,
    haasDelay: 0.008
  },
  {
    name: "70S: Funky Clavit Bass",
    voiceMode: "mono",
    osc1Waveform: "clavit",
    osc2Waveform: "clavit",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 6,
    syncMode: false,
    osc1Vol: 0.75,
    osc2Vol: 0.45,
    ringModVol: 0,
    subVolume: 0.3,
    noiseVolume: 0.02,
    cutoff: 650,
    resonance: 6.2,
    filterType: "lowpass",
    filterEnvAmt: 2800,
    shAmount: 0,
    attack: 0.01,
    decay: 0.15,
    sustain: 0.1,
    release: 0.1,
    filterAttack: 0.01,
    filterDecay: 0.16,
    filterSustain: 0,
    filterRelease: 0.1,
    feedbackVol: 0.12,
    feedbackFilterType: "lowpass",
    portamento: 0.02,
    lfoRate: 4,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.25,
    delayMix: 0.15,
    oscDrift: 18,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.1,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.1,
    reverbDecay: 1.1,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.15,
    flangerRate: 0.6,
    flangerFeedback: 0.3,
    osc1Morph: 0.3,
    osc2Morph: 0.1,
    saturationMode: "warm",
    saturationAmount: 0.18,
    stereoWidth: 1.25,
    haasDelay: 0.005
  },
  {
    name: "70S: Super-Sub Growl",
    voiceMode: "mono",
    osc1Waveform: "synth-bass",
    osc2Waveform: "triangle",
    osc1Pitch: -2,
    osc2Pitch: -1,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.3,
    ringModVol: 0.1,
    subVolume: 0.8,
    noiseVolume: 0.05,
    cutoff: 220,
    resonance: 4,
    filterType: "lowpass",
    filterEnvAmt: 600,
    shAmount: 0,
    attack: 0.04,
    decay: 0.35,
    sustain: 0.8,
    release: 0.3,
    filterAttack: 0.05,
    filterDecay: 0.4,
    filterSustain: 0.5,
    filterRelease: 0.3,
    feedbackVol: 0.45,
    feedbackFilterType: "lowpass",
    portamento: 0.08,
    lfoRate: 2.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.8,
    lfo2Depth: 120,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.3,
    delayTime: 0.35,
    delayFeedback: 0.3,
    delayMix: 0.12,
    oscDrift: 28,
    hpfBassBoost: true,
    unisonDetune: 8,
    filterCircuit: "ladder",
    filterDrive: 0.35,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.8,
    phaserMix: 0.2,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.4,
    osc2Morph: 0.2,
    saturationMode: "warm",
    saturationAmount: 0.4,
    stereoWidth: 1.4,
    haasDelay: 0.015
  },
  {
    name: "70S: Voyager Wobble",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.65,
    osc2Vol: 0.55,
    ringModVol: 0,
    subVolume: 0.4,
    noiseVolume: 0.03,
    cutoff: 350,
    resonance: 5.5,
    filterType: "lowpass",
    filterEnvAmt: 1200,
    shAmount: 0,
    attack: 0.03,
    decay: 0.4,
    sustain: 0.6,
    release: 0.25,
    filterAttack: 0.05,
    filterDecay: 0.5,
    filterSustain: 0.4,
    filterRelease: 0.25,
    feedbackVol: 0.25,
    feedbackFilterType: "lowpass",
    portamento: 0.05,
    lfoRate: 1.2,
    lfoDepth: 600,
    lfoTarget: "filter",
    lfo2Rate: 5.5,
    lfo2Depth: 35,
    lfo2Target: "pitch",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.33,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.3,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.18,
    reverbDecay: 1.5,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.1,
    osc2Morph: 0.1,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.15,
    haasDelay: 0
  },
  {
    name: "70S: Cybernetic Moog",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: 0,
    osc2Detune: 10,
    syncMode: true,
    osc1Vol: 0.7,
    osc2Vol: 0.5,
    ringModVol: 0.3,
    subVolume: 0.2,
    noiseVolume: 0.05,
    cutoff: 500,
    resonance: 5.2,
    filterType: "lowpass",
    filterEnvAmt: 1600,
    shAmount: 0,
    attack: 0.01,
    decay: 0.28,
    sustain: 0.45,
    release: 0.2,
    filterAttack: 0.02,
    filterDecay: 0.32,
    filterSustain: 0.3,
    filterRelease: 0.2,
    feedbackVol: 0.3,
    feedbackFilterType: "lowpass",
    portamento: 0.12,
    lfoRate: 4.8,
    lfoDepth: 80,
    lfoTarget: "pitch",
    lfo2Rate: 0.6,
    lfo2Depth: 350,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.3,
    delayFeedback: 0.35,
    delayMix: 0.2,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.4,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.4,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.2,
    flangerRate: 0.7,
    flangerFeedback: 0.4,
    osc1Morph: 0.3,
    osc2Morph: 0.4,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.25,
    haasDelay: 0.004
  },
  {
    name: "70S: Cosmic Sub-Drone",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "square",
    osc1Pitch: -2,
    osc2Pitch: -2,
    osc2Detune: 15,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0.2,
    subVolume: 0.5,
    noiseVolume: 0.1,
    cutoff: 180,
    resonance: 3,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.1,
    decay: 0.6,
    sustain: 0.9,
    release: 0.5,
    filterAttack: 0.12,
    filterDecay: 0.7,
    filterSustain: 0.8,
    filterRelease: 0.5,
    feedbackVol: 0.35,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 0.8,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.12,
    lfo2Depth: 180,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.35,
    delayTime: 0.4,
    delayFeedback: 0.4,
    delayMix: 0.15,
    oscDrift: 35,
    hpfBassBoost: true,
    unisonDetune: 8,
    filterCircuit: "ladder",
    filterDrive: 0.2,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.25,
    reverbDecay: 2.2,
    phaserMix: 0.35,
    phaserRate: 0.25,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.2,
    osc2Morph: 0.2,
    saturationMode: "warm",
    saturationAmount: 0.3,
    stereoWidth: 1.6,
    haasDelay: 0.02
  },
  {
    name: "80S: Laser Harp Solo",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "triangle",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 8,
    syncMode: true,
    osc1Vol: 0.65,
    osc2Vol: 0.55,
    ringModVol: 0.1,
    subVolume: 0.15,
    noiseVolume: 0.02,
    cutoff: 1400,
    resonance: 5.5,
    filterType: "lowpass",
    filterEnvAmt: 2200,
    shAmount: 0,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.6,
    release: 0.25,
    filterAttack: 0.02,
    filterDecay: 0.35,
    filterSustain: 0.4,
    filterRelease: 0.25,
    feedbackVol: 0.15,
    feedbackFilterType: "lowpass",
    portamento: 0.08,
    lfoRate: 5.5,
    lfoDepth: 120,
    lfoTarget: "pitch",
    lfo2Rate: 0.3,
    lfo2Depth: 150,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.4,
    delayTime: 0.35,
    delayFeedback: 0.4,
    delayMix: 0.3,
    oscDrift: 15,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.1,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.3,
    reverbDecay: 2,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.2,
    flangerRate: 0.6,
    flangerFeedback: 0.35,
    osc1Morph: 0.2,
    osc2Morph: 0.1,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.3,
    haasDelay: 0.01
  },
  {
    name: "80S: Synthwave Brass",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 14,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.2,
    noiseVolume: 0.03,
    cutoff: 850,
    resonance: 3,
    filterType: "lowpass",
    filterEnvAmt: 1800,
    shAmount: 0,
    attack: 0.12,
    decay: 0.5,
    sustain: 0.75,
    release: 0.45,
    filterAttack: 0.15,
    filterDecay: 0.6,
    filterSustain: 0.6,
    filterRelease: 0.45,
    feedbackVol: 0.1,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 4.2,
    lfoDepth: 45,
    lfoTarget: "pitch",
    lfo2Rate: 0.2,
    lfo2Depth: 100,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.5,
    delayTime: 0.4,
    delayFeedback: 0.3,
    delayMix: 0.2,
    oscDrift: 24,
    hpfBassBoost: true,
    unisonDetune: 12,
    filterCircuit: "ladder",
    filterDrive: 0.12,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.35,
    reverbDecay: 2.2,
    phaserMix: 0.15,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.45,
    haasDelay: 0.015
  },
  {
    name: "80S: FM Glassy Lead",
    voiceMode: "mono",
    osc1Waveform: "bell",
    osc2Waveform: "harmon",
    osc1Pitch: 1,
    osc2Pitch: 1,
    osc2Detune: 5,
    syncMode: false,
    osc1Vol: 0.55,
    osc2Vol: 0.45,
    ringModVol: 0.5,
    subVolume: 0,
    noiseVolume: 0.01,
    cutoff: 1600,
    resonance: 4.5,
    filterType: "lowpass",
    filterEnvAmt: 1200,
    shAmount: 0,
    attack: 0.03,
    decay: 0.4,
    sustain: 0.8,
    release: 0.35,
    filterAttack: 0.04,
    filterDecay: 0.45,
    filterSustain: 0.6,
    filterRelease: 0.35,
    feedbackVol: 0.1,
    feedbackFilterType: "bypass",
    portamento: 0.05,
    lfoRate: 5.2,
    lfoDepth: 140,
    lfoTarget: "pitch",
    lfo2Rate: 0.15,
    lfo2Depth: 300,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.35,
    delayTime: 0.48,
    delayFeedback: 0.38,
    delayMix: 0.25,
    oscDrift: 18,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.4,
    reverbDecay: 2.8,
    phaserMix: 0.25,
    phaserRate: 0.8,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.4,
    osc2Morph: 0.5,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.6,
    haasDelay: 0.02
  },
  {
    name: "80S: Miami Vice Solo",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0.15,
    subVolume: 0.2,
    noiseVolume: 0.04,
    cutoff: 1150,
    resonance: 3.8,
    filterType: "lowpass",
    filterEnvAmt: 1500,
    shAmount: 0,
    attack: 0.02,
    decay: 0.35,
    sustain: 0.7,
    release: 0.25,
    filterAttack: 0.04,
    filterDecay: 0.4,
    filterSustain: 0.5,
    filterRelease: 0.25,
    feedbackVol: 0.2,
    feedbackFilterType: "lowpass",
    portamento: 0.15,
    lfoRate: 4.8,
    lfoDepth: 95,
    lfoTarget: "pitch",
    lfo2Rate: 3.5,
    lfo2Depth: 80,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.3,
    delayTime: 0.35,
    delayFeedback: 0.45,
    delayMix: 0.35,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.15,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.25,
    reverbDecay: 1.8,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.35,
    flangerRate: 0.7,
    flangerFeedback: 0.4,
    osc1Morph: 0.3,
    osc2Morph: 0.2,
    saturationMode: "warm",
    saturationAmount: 0.22,
    stereoWidth: 1.35,
    haasDelay: 0.012
  },
  {
    name: "80S: Horizon Keytar",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 12,
    syncMode: true,
    osc1Vol: 0.7,
    osc2Vol: 0.6,
    ringModVol: 0.2,
    subVolume: 0.1,
    noiseVolume: 0.05,
    cutoff: 950,
    resonance: 4.5,
    filterType: "lowpass",
    filterEnvAmt: 1800,
    shAmount: 0,
    attack: 0.01,
    decay: 0.32,
    sustain: 0.75,
    release: 0.28,
    filterAttack: 0.02,
    filterDecay: 0.4,
    filterSustain: 0.5,
    filterRelease: 0.28,
    feedbackVol: 0.3,
    feedbackFilterType: "lowpass",
    portamento: 0.1,
    lfoRate: 5,
    lfoDepth: 110,
    lfoTarget: "pitch",
    lfo2Rate: 0.8,
    lfo2Depth: 200,
    lfo2Target: "filter",
    lfo2Shape: "triangle",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.38,
    delayFeedback: 0.4,
    delayMix: 0.28,
    oscDrift: 25,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.25,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.2,
    reverbDecay: 1.5,
    phaserMix: 0.2,
    phaserRate: 0.6,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.1,
    osc2Morph: 0.1,
    saturationMode: "warm",
    saturationAmount: 0.3,
    stereoWidth: 1.25,
    haasDelay: 0.008
  },
  {
    name: "80S: Digital Tines Solo",
    voiceMode: "poly",
    osc1Waveform: "epiano",
    osc2Waveform: "bell",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 6,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0.1,
    subVolume: 0.2,
    noiseVolume: 0.01,
    cutoff: 2200,
    resonance: 1.8,
    filterType: "lowpass",
    filterEnvAmt: 600,
    shAmount: 0,
    attack: 0.02,
    decay: 0.6,
    sustain: 0.7,
    release: 0.6,
    filterAttack: 0.03,
    filterDecay: 0.7,
    filterSustain: 0.6,
    filterRelease: 0.6,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 40,
    lfoTarget: "pitch",
    lfo2Rate: 0.1,
    lfo2Depth: 120,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.65,
    delayTime: 0.42,
    delayFeedback: 0.35,
    delayMix: 0.3,
    oscDrift: 12,
    hpfBassBoost: true,
    unisonDetune: 8,
    filterCircuit: "classic",
    filterDrive: 0,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.45,
    reverbDecay: 2.6,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.3,
    osc2Morph: 0.4,
    saturationMode: "warm",
    saturationAmount: 0.08,
    stereoWidth: 1.5,
    haasDelay: 0.018
  },
  {
    name: "80S: Neo-Classic Sync",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "triangle",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 10,
    syncMode: true,
    osc1Vol: 0.75,
    osc2Vol: 0.45,
    ringModVol: 0,
    subVolume: 0.15,
    noiseVolume: 0.03,
    cutoff: 720,
    resonance: 6.2,
    filterType: "lowpass",
    filterEnvAmt: 3200,
    shAmount: 0,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.55,
    release: 0.22,
    filterAttack: 0.02,
    filterDecay: 0.38,
    filterSustain: 0.3,
    filterRelease: 0.22,
    feedbackVol: 0.2,
    feedbackFilterType: "lowpass",
    portamento: 0.12,
    lfoRate: 6,
    lfoDepth: 100,
    lfoTarget: "pitch",
    lfo2Rate: 0.4,
    lfo2Depth: 400,
    lfo2Target: "filter",
    lfo2Shape: "sawtooth",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.4,
    delayMix: 0.2,
    oscDrift: 28,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.2,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.18,
    reverbDecay: 1.4,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.15,
    flangerRate: 0.8,
    flangerFeedback: 0.4,
    osc1Morph: 0.4,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.2,
    haasDelay: 0.005
  },
  {
    name: "80S: Poly-Mod Brass Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 15,
    syncMode: false,
    osc1Vol: 0.65,
    osc2Vol: 0.55,
    ringModVol: 0.05,
    subVolume: 0.1,
    noiseVolume: 0.02,
    cutoff: 950,
    resonance: 4.5,
    filterType: "lowpass",
    filterEnvAmt: 1800,
    shAmount: 0,
    attack: 0.04,
    decay: 0.45,
    sustain: 0.7,
    release: 0.3,
    filterAttack: 0.06,
    filterDecay: 0.55,
    filterSustain: 0.5,
    filterRelease: 0.3,
    feedbackVol: 0.18,
    feedbackFilterType: "lowpass",
    portamento: 0.05,
    lfoRate: 4.5,
    lfoDepth: 80,
    lfoTarget: "filter",
    lfo2Rate: 2.2,
    lfo2Depth: 120,
    lfo2Target: "pitch",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.35,
    delayTime: 0.38,
    delayFeedback: 0.3,
    delayMix: 0.18,
    oscDrift: 22,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.18,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.22,
    reverbDecay: 1.6,
    phaserMix: 0.2,
    phaserRate: 0.6,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.18,
    stereoWidth: 1.3,
    haasDelay: 0.008
  },
  {
    name: "80S: Skylines Flute",
    voiceMode: "mono",
    osc1Waveform: "triangle",
    osc2Waveform: "sine",
    osc1Pitch: 1,
    osc2Pitch: 1,
    osc2Detune: 4,
    syncMode: false,
    osc1Vol: 0.75,
    osc2Vol: 0.25,
    ringModVol: 0,
    subVolume: 0,
    noiseVolume: 0.02,
    cutoff: 1500,
    resonance: 2,
    filterType: "lowpass",
    filterEnvAmt: 500,
    shAmount: 0,
    attack: 0.08,
    decay: 0.5,
    sustain: 0.9,
    release: 0.45,
    filterAttack: 0.1,
    filterDecay: 0.6,
    filterSustain: 0.7,
    filterRelease: 0.45,
    feedbackVol: 0.05,
    feedbackFilterType: "bypass",
    portamento: 0.08,
    lfoRate: 5,
    lfoDepth: 130,
    lfoTarget: "pitch",
    lfo2Rate: 0.2,
    lfo2Depth: 80,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.25,
    delayTime: 0.4,
    delayFeedback: 0.3,
    delayMix: 0.22,
    oscDrift: 12,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.4,
    reverbDecay: 2.5,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.1,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.05,
    stereoWidth: 1.4,
    haasDelay: 0.016
  },
  {
    name: "80S: Outrun Laser",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "square",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.65,
    osc2Vol: 0.55,
    ringModVol: 0.1,
    subVolume: 0.3,
    noiseVolume: 0.08,
    cutoff: 750,
    resonance: 6.8,
    filterType: "lowpass",
    filterEnvAmt: 3800,
    shAmount: 0,
    attack: 0.01,
    decay: 0.22,
    sustain: 0.15,
    release: 0.2,
    filterAttack: 0.01,
    filterDecay: 0.24,
    filterSustain: 0.1,
    filterRelease: 0.2,
    feedbackVol: 0.25,
    feedbackFilterType: "highpass",
    portamento: 0.2,
    lfoRate: 7.2,
    lfoDepth: 1500,
    lfoTarget: "filter",
    lfo2Rate: 0.5,
    lfo2Depth: 600,
    lfo2Target: "filter",
    lfo2Shape: "sawtooth",
    lfo2KeySync: true,
    chorusDepth: 0.35,
    delayTime: 0.35,
    delayFeedback: 0.5,
    delayMix: 0.3,
    oscDrift: 30,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.25,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.25,
    reverbDecay: 1.8,
    phaserMix: 0.35,
    phaserRate: 1.8,
    flangerMix: 0.25,
    flangerRate: 0.8,
    flangerFeedback: 0.4,
    osc1Morph: 0.3,
    osc2Morph: 0.4,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.3,
    haasDelay: 0.012
  },
  {
    name: "80S: Hyper-Chorus Strings",
    voiceMode: "poly",
    osc1Waveform: "strings",
    osc2Waveform: "strings",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 20,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.45,
    ringModVol: 0,
    subVolume: 0.15,
    noiseVolume: 0.04,
    cutoff: 1600,
    resonance: 2.2,
    filterType: "lowpass",
    filterEnvAmt: 300,
    shAmount: 0,
    attack: 0.5,
    decay: 1.2,
    sustain: 0.9,
    release: 0.95,
    filterAttack: 0.7,
    filterDecay: 1.5,
    filterSustain: 0.8,
    filterRelease: 0.95,
    feedbackVol: 0.05,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 5.2,
    lfoDepth: 55,
    lfoTarget: "pitch",
    lfo2Rate: 0.1,
    lfo2Depth: 80,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.88,
    delayTime: 0.45,
    delayFeedback: 0.32,
    delayMix: 0.22,
    oscDrift: 32,
    hpfBassBoost: true,
    unisonDetune: 18,
    filterCircuit: "classic",
    filterDrive: 0.05,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.48,
    reverbDecay: 3.2,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.45,
    flangerRate: 0.22,
    flangerFeedback: 0.4,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.8,
    haasDelay: 0.032
  },
  {
    name: "80S: Digital Cloud Pad",
    voiceMode: "poly",
    osc1Waveform: "bell",
    osc2Waveform: "vox",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.45,
    osc2Vol: 0.4,
    ringModVol: 0.2,
    subVolume: 0,
    noiseVolume: 0.03,
    cutoff: 1200,
    resonance: 3,
    filterType: "lowpass",
    filterEnvAmt: 600,
    shAmount: 0,
    attack: 0.8,
    decay: 1.6,
    sustain: 0.85,
    release: 1.3,
    filterAttack: 1,
    filterDecay: 2,
    filterSustain: 0.75,
    filterRelease: 1.3,
    feedbackVol: 0.12,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 1,
    lfoDepth: 350,
    lfoTarget: "filter",
    lfo2Rate: 0.22,
    lfo2Depth: 200,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.5,
    delayTime: 0.5,
    delayFeedback: 0.4,
    delayMix: 0.3,
    oscDrift: 22,
    hpfBassBoost: true,
    unisonDetune: 14,
    filterCircuit: "ladder",
    filterDrive: 0.08,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.5,
    reverbDecay: 3.8,
    phaserMix: 0.35,
    phaserRate: 0.3,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.5,
    osc2Morph: 0.6,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.65,
    haasDelay: 0.024
  },
  {
    name: "80S: Sunset Boulevard",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 16,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.45,
    ringModVol: 0.05,
    subVolume: 0.25,
    noiseVolume: 0.02,
    cutoff: 650,
    resonance: 2.8,
    filterType: "lowpass",
    filterEnvAmt: 1200,
    shAmount: 0,
    attack: 0.3,
    decay: 1.2,
    sustain: 0.8,
    release: 0.8,
    filterAttack: 0.4,
    filterDecay: 1.5,
    filterSustain: 0.7,
    filterRelease: 0.8,
    feedbackVol: 0.15,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 1.8,
    lfoDepth: 100,
    lfoTarget: "filter",
    lfo2Rate: 5.2,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.45,
    delayTime: 0.42,
    delayFeedback: 0.32,
    delayMix: 0.22,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 15,
    filterCircuit: "ladder",
    filterDrive: 0.2,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.4,
    reverbDecay: 2.4,
    phaserMix: 0.2,
    phaserRate: 0.4,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.55,
    haasDelay: 0.015
  },
  {
    name: "80S: FM Ice Palace",
    voiceMode: "poly",
    osc1Waveform: "bell",
    osc2Waveform: "harmon",
    osc1Pitch: 1,
    osc2Pitch: 2,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.45,
    osc2Vol: 0.4,
    ringModVol: 0.3,
    subVolume: 0,
    noiseVolume: 0.02,
    cutoff: 1800,
    resonance: 2.5,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.2,
    decay: 1.4,
    sustain: 0.85,
    release: 1.2,
    filterAttack: 0.25,
    filterDecay: 1.6,
    filterSustain: 0.8,
    filterRelease: 1.2,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 4,
    lfoDepth: 40,
    lfoTarget: "pitch",
    lfo2Rate: 0.15,
    lfo2Depth: 180,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.4,
    delayTime: 0.5,
    delayFeedback: 0.4,
    delayMix: 0.3,
    oscDrift: 15,
    hpfBassBoost: false,
    unisonDetune: 10,
    filterCircuit: "classic",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.5,
    reverbDecay: 3.5,
    phaserMix: 0.45,
    phaserRate: 0.25,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.5,
    osc2Morph: 0.5,
    saturationMode: "warm",
    saturationAmount: 0.05,
    stereoWidth: 1.7,
    haasDelay: 0.025
  },
  {
    name: "80S: Vector Sweep Pad",
    voiceMode: "poly",
    osc1Waveform: "strings",
    osc2Waveform: "harmon",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 18,
    syncMode: false,
    osc1Vol: 0.4,
    osc2Vol: 0.4,
    ringModVol: 0.25,
    subVolume: 0.15,
    noiseVolume: 0.05,
    cutoff: 800,
    resonance: 3.8,
    filterType: "lowpass",
    filterEnvAmt: 1100,
    shAmount: 0,
    attack: 1,
    decay: 2,
    sustain: 0.8,
    release: 1.4,
    filterAttack: 1.2,
    filterDecay: 2.2,
    filterSustain: 0.7,
    filterRelease: 1.4,
    feedbackVol: 0.2,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 0.6,
    lfoDepth: 450,
    lfoTarget: "filter",
    lfo2Rate: 3.5,
    lfo2Depth: 30,
    lfo2Target: "pwm",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.45,
    delayTime: 0.55,
    delayFeedback: 0.4,
    delayMix: 0.25,
    oscDrift: 35,
    hpfBassBoost: true,
    unisonDetune: 16,
    filterCircuit: "ladder",
    filterDrive: 0.18,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.45,
    reverbDecay: 3.2,
    phaserMix: 0.45,
    phaserRate: 0.2,
    flangerMix: 0.2,
    flangerRate: 0.4,
    flangerFeedback: 0.3,
    osc1Morph: 0.6,
    osc2Morph: 0.4,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.5,
    haasDelay: 0.015
  },
  {
    name: "80S: Cyberpunk Skyline",
    voiceMode: "poly",
    osc1Waveform: "square",
    osc2Waveform: "synth-bass",
    osc1Pitch: -1,
    osc2Pitch: 0,
    osc2Detune: 25,
    syncMode: false,
    osc1Vol: 0.35,
    osc2Vol: 0.35,
    ringModVol: 0.45,
    subVolume: 0.25,
    noiseVolume: 0.12,
    cutoff: 480,
    resonance: 5.5,
    filterType: "lowpass",
    filterEnvAmt: 900,
    shAmount: 0,
    attack: 1.5,
    decay: 2.5,
    sustain: 0.8,
    release: 2.2,
    filterAttack: 1.8,
    filterDecay: 3,
    filterSustain: 0.6,
    filterRelease: 2.2,
    feedbackVol: 0.35,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 0.3,
    lfoDepth: 1000,
    lfoTarget: "filter",
    lfo2Rate: 0.1,
    lfo2Depth: 600,
    lfo2Target: "filter",
    lfo2Shape: "sawtooth",
    lfo2KeySync: false,
    chorusDepth: 0.5,
    delayTime: 0.6,
    delayFeedback: 0.55,
    delayMix: 0.35,
    oscDrift: 45,
    hpfBassBoost: true,
    unisonDetune: 20,
    filterCircuit: "ladder",
    filterDrive: 0.3,
    subShape: "square",
    subOctave: -2,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.55,
    reverbDecay: 4.2,
    phaserMix: 0.4,
    phaserRate: 0.1,
    flangerMix: 0.35,
    flangerRate: 0.3,
    flangerFeedback: 0.5,
    osc1Morph: 0.4,
    osc2Morph: 0.6,
    saturationMode: "warm",
    saturationAmount: 0.35,
    stereoWidth: 1.75,
    haasDelay: 0.038
  },
  {
    name: "80S: Nostalgia Glow",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "strings",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.45,
    osc2Vol: 0.45,
    ringModVol: 0,
    subVolume: 0.25,
    noiseVolume: 0.02,
    cutoff: 750,
    resonance: 2.2,
    filterType: "lowpass",
    filterEnvAmt: 800,
    shAmount: 0,
    attack: 0.4,
    decay: 1.4,
    sustain: 0.85,
    release: 0.8,
    filterAttack: 0.5,
    filterDecay: 1.8,
    filterSustain: 0.75,
    filterRelease: 0.8,
    feedbackVol: 0.1,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 1.2,
    lfoDepth: 80,
    lfoTarget: "filter",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.55,
    delayTime: 0.38,
    delayFeedback: 0.28,
    delayMix: 0.2,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 14,
    filterCircuit: "classic",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.38,
    reverbDecay: 2.5,
    phaserMix: 0.2,
    phaserRate: 0.35,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.2,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.12,
    stereoWidth: 1.5,
    haasDelay: 0.012
  },
  {
    name: "80S: Starship Cruiser",
    voiceMode: "poly",
    osc1Waveform: "organ",
    osc2Waveform: "strings",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.55,
    osc2Vol: 0.4,
    ringModVol: 0.1,
    subVolume: 0.2,
    noiseVolume: 0.02,
    cutoff: 1800,
    resonance: 1.8,
    filterType: "lowpass",
    filterEnvAmt: 300,
    shAmount: 0,
    attack: 0.25,
    decay: 1.2,
    sustain: 0.9,
    release: 0.75,
    filterAttack: 0.3,
    filterDecay: 1.4,
    filterSustain: 0.8,
    filterRelease: 0.75,
    feedbackVol: 0.05,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 6,
    lfoDepth: 40,
    lfoTarget: "pitch",
    lfo2Rate: 0.2,
    lfo2Depth: 120,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.6,
    delayTime: 0.4,
    delayFeedback: 0.3,
    delayMix: 0.25,
    oscDrift: 22,
    hpfBassBoost: true,
    unisonDetune: 10,
    filterCircuit: "classic",
    filterDrive: 0.08,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.4,
    reverbDecay: 2.4,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.4,
    osc2Morph: 0.2,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.4,
    haasDelay: 0.01
  },
  {
    name: "80S: Velvet Night Pad",
    voiceMode: "poly",
    osc1Waveform: "triangle",
    osc2Waveform: "strings",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 14,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.35,
    ringModVol: 0,
    subVolume: 0.3,
    noiseVolume: 0.02,
    cutoff: 500,
    resonance: 2.2,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.6,
    decay: 1.8,
    sustain: 0.9,
    release: 0.9,
    filterAttack: 0.7,
    filterDecay: 2,
    filterSustain: 0.8,
    filterRelease: 0.9,
    feedbackVol: 0.18,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 1.2,
    lfoDepth: 60,
    lfoTarget: "filter",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.35,
    delayTime: 0.45,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 18,
    hpfBassBoost: true,
    unisonDetune: 10,
    filterCircuit: "ladder",
    filterDrive: 0.15,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.35,
    reverbDecay: 2.2,
    phaserMix: 0.25,
    phaserRate: 0.3,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.1,
    osc2Morph: 0.4,
    saturationMode: "warm",
    saturationAmount: 0.18,
    stereoWidth: 1.6,
    haasDelay: 0.015
  },
  {
    name: "80S: Chrome Horizon",
    voiceMode: "poly",
    osc1Waveform: "bell",
    osc2Waveform: "strings",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 18,
    syncMode: false,
    osc1Vol: 0.4,
    osc2Vol: 0.5,
    ringModVol: 0.2,
    subVolume: 0.1,
    noiseVolume: 0.03,
    cutoff: 1000,
    resonance: 3.5,
    filterType: "lowpass",
    filterEnvAmt: 700,
    shAmount: 0,
    attack: 0.8,
    decay: 1.8,
    sustain: 0.8,
    release: 1.4,
    filterAttack: 0.9,
    filterDecay: 2.2,
    filterSustain: 0.7,
    filterRelease: 1.4,
    feedbackVol: 0.12,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 2.5,
    lfoDepth: 120,
    lfoTarget: "pitch",
    lfo2Rate: 0.2,
    lfo2Depth: 250,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: false,
    chorusDepth: 0.5,
    delayTime: 0.52,
    delayFeedback: 0.4,
    delayMix: 0.28,
    oscDrift: 24,
    hpfBassBoost: true,
    unisonDetune: 14,
    filterCircuit: "ladder",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.48,
    reverbDecay: 3.4,
    phaserMix: 0.4,
    phaserRate: 0.25,
    flangerMix: 0.15,
    flangerRate: 0.4,
    flangerFeedback: 0.35,
    osc1Morph: 0.4,
    osc2Morph: 0.5,
    saturationMode: "warm",
    saturationAmount: 0.12,
    stereoWidth: 1.7,
    haasDelay: 0.022
  },
  {
    name: "80S: Grid Runner Bass",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.45,
    noiseVolume: 0.03,
    cutoff: 350,
    resonance: 4.8,
    filterType: "lowpass",
    filterEnvAmt: 1500,
    shAmount: 0,
    attack: 0.01,
    decay: 0.22,
    sustain: 0,
    release: 0.08,
    filterAttack: 0.01,
    filterDecay: 0.26,
    filterSustain: 0.1,
    filterRelease: 0.1,
    feedbackVol: 0.25,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.2,
    delayMix: 0,
    oscDrift: 18,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.22,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.08,
    reverbDecay: 1,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.22,
    stereoWidth: 1,
    haasDelay: 0
  },
  {
    name: "80S: FM Slap Bass",
    voiceMode: "mono",
    osc1Waveform: "clavit",
    osc2Waveform: "harmon",
    osc1Pitch: -1,
    osc2Pitch: 0,
    osc2Detune: 6,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.4,
    ringModVol: 0.45,
    subVolume: 0.25,
    noiseVolume: 0.02,
    cutoff: 550,
    resonance: 5.8,
    filterType: "lowpass",
    filterEnvAmt: 2200,
    shAmount: 0,
    attack: 0.01,
    decay: 0.18,
    sustain: 0.15,
    release: 0.15,
    filterAttack: 0.01,
    filterDecay: 0.2,
    filterSustain: 0,
    filterRelease: 0.15,
    feedbackVol: 0.15,
    feedbackFilterType: "lowpass",
    portamento: 0.02,
    lfoRate: 4.2,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.28,
    delayFeedback: 0.2,
    delayMix: 0.1,
    oscDrift: 15,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.15,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.1,
    reverbDecay: 1.1,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.15,
    flangerRate: 0.6,
    flangerFeedback: 0.35,
    osc1Morph: 0.4,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.2,
    haasDelay: 0.005
  },
  {
    name: "80S: Turbo Charged Bass",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.65,
    osc2Vol: 0.55,
    ringModVol: 0,
    subVolume: 0.5,
    noiseVolume: 0.05,
    cutoff: 320,
    resonance: 4,
    filterType: "lowpass",
    filterEnvAmt: 1400,
    shAmount: 0,
    attack: 0.02,
    decay: 0.28,
    sustain: 0.5,
    release: 0.2,
    filterAttack: 0.03,
    filterDecay: 0.32,
    filterSustain: 0.4,
    filterRelease: 0.2,
    feedbackVol: 0.35,
    feedbackFilterType: "lowpass",
    portamento: 0.05,
    lfoRate: 3,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.32,
    delayFeedback: 0.25,
    delayMix: 0.12,
    oscDrift: 24,
    hpfBassBoost: true,
    unisonDetune: 6,
    filterCircuit: "ladder",
    filterDrive: 0.35,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.12,
    reverbDecay: 1.4,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.1,
    osc2Morph: 0.1,
    saturationMode: "warm",
    saturationAmount: 0.38,
    stereoWidth: 1.3,
    haasDelay: 0.008
  },
  {
    name: "80S: VHS Chrome Bass",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 15,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0.1,
    subVolume: 0.4,
    noiseVolume: 0.06,
    cutoff: 400,
    resonance: 3.5,
    filterType: "lowpass",
    filterEnvAmt: 1000,
    shAmount: 0,
    attack: 0.03,
    decay: 0.35,
    sustain: 0.6,
    release: 0.25,
    filterAttack: 0.05,
    filterDecay: 0.4,
    filterSustain: 0.4,
    filterRelease: 0.25,
    feedbackVol: 0.2,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 1.5,
    lfoDepth: 150,
    lfoTarget: "filter",
    lfo2Rate: 5.5,
    lfo2Depth: 25,
    lfo2Target: "pitch",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.55,
    delayTime: 0.33,
    delayFeedback: 0.3,
    delayMix: 0.22,
    oscDrift: 28,
    hpfBassBoost: true,
    unisonDetune: 10,
    filterCircuit: "ladder",
    filterDrive: 0.18,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.18,
    reverbDecay: 1.6,
    phaserMix: 0.2,
    phaserRate: 0.4,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.2,
    osc2Morph: 0.2,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.45,
    haasDelay: 0.015
  },
  {
    name: "80S: Neon Sequencer",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.3,
    ringModVol: 0,
    subVolume: 0.3,
    noiseVolume: 0.04,
    cutoff: 600,
    resonance: 5.5,
    filterType: "lowpass",
    filterEnvAmt: 2000,
    shAmount: 0,
    attack: 0.01,
    decay: 0.2,
    sustain: 0.3,
    release: 0.15,
    filterAttack: 0.02,
    filterDecay: 0.25,
    filterSustain: 0.2,
    filterRelease: 0.15,
    feedbackVol: 0.25,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 4.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.3,
    delayFeedback: 0.35,
    delayMix: 0.2,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 4,
    filterCircuit: "ladder",
    filterDrive: 0.2,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.1,
    reverbDecay: 1.2,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.15,
    flangerRate: 0.8,
    flangerFeedback: 0.35,
    osc1Morph: 0.1,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.3,
    stereoWidth: 1.3,
    haasDelay: 0.005
  },
  {
    name: "80S: Nightcall Sub",
    voiceMode: "mono",
    osc1Waveform: "triangle",
    osc2Waveform: "sine",
    osc1Pitch: -2,
    osc2Pitch: -1,
    osc2Detune: 6,
    syncMode: false,
    osc1Vol: 0.8,
    osc2Vol: 0.2,
    ringModVol: 0,
    subVolume: 0.6,
    noiseVolume: 0.01,
    cutoff: 180,
    resonance: 2.5,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.04,
    decay: 0.45,
    sustain: 0.8,
    release: 0.4,
    filterAttack: 0.05,
    filterDecay: 0.5,
    filterSustain: 0.6,
    filterRelease: 0.4,
    feedbackVol: 0.2,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 2,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.15,
    delayTime: 0.35,
    delayFeedback: 0.2,
    delayMix: 0.05,
    oscDrift: 15,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.1,
    reverbDecay: 1.5,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.2,
    haasDelay: 0
  },
  {
    name: "80S: Digital Clank Bass",
    voiceMode: "mono",
    osc1Waveform: "bell",
    osc2Waveform: "synth-bass",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.55,
    osc2Vol: 0.45,
    ringModVol: 0.5,
    subVolume: 0.2,
    noiseVolume: 0.03,
    cutoff: 800,
    resonance: 5.2,
    filterType: "lowpass",
    filterEnvAmt: 1500,
    shAmount: 0,
    attack: 0.01,
    decay: 0.2,
    sustain: 0.2,
    release: 0.18,
    filterAttack: 0.01,
    filterDecay: 0.22,
    filterSustain: 0.1,
    filterRelease: 0.18,
    feedbackVol: 0.2,
    feedbackFilterType: "lowpass",
    portamento: 0.04,
    lfoRate: 4.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 6,
    lfo2Depth: 180,
    lfo2Target: "filter",
    lfo2Shape: "sawtooth",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.32,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.18,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.3,
    phaserMix: 0.1,
    phaserRate: 0.8,
    flangerMix: 0.15,
    flangerRate: 0.6,
    flangerFeedback: 0.35,
    osc1Morph: 0.4,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.3,
    haasDelay: 0.006
  },
  {
    name: "80S: Voyager Acid Line",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 6,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.3,
    ringModVol: 0,
    subVolume: 0.4,
    noiseVolume: 0.02,
    cutoff: 380,
    resonance: 6.5,
    filterType: "lowpass",
    filterEnvAmt: 1600,
    shAmount: 0,
    attack: 0.01,
    decay: 0.18,
    sustain: 0.15,
    release: 0.12,
    filterAttack: 0.01,
    filterDecay: 0.2,
    filterSustain: 0,
    filterRelease: 0.12,
    feedbackVol: 0.25,
    feedbackFilterType: "lowpass",
    portamento: 0.05,
    lfoRate: 4.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.15,
    delayTime: 0.28,
    delayFeedback: 0.3,
    delayMix: 0.1,
    oscDrift: 24,
    hpfBassBoost: true,
    unisonDetune: 4,
    filterCircuit: "acid",
    filterDrive: 0.45,
    subShape: "square",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.08,
    reverbDecay: 1.1,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.15,
    flangerRate: 0.8,
    flangerFeedback: 0.3,
    osc1Morph: 0.1,
    osc2Morph: 0.1,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.15,
    haasDelay: 0
  },
  {
    name: "80S: Outrun Skyline",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: 0,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.65,
    osc2Vol: 0.45,
    ringModVol: 0.1,
    subVolume: 0.3,
    noiseVolume: 0.04,
    cutoff: 500,
    resonance: 5.2,
    filterType: "lowpass",
    filterEnvAmt: 1600,
    shAmount: 0,
    attack: 0.02,
    decay: 0.25,
    sustain: 0.4,
    release: 0.18,
    filterAttack: 0.02,
    filterDecay: 0.28,
    filterSustain: 0.3,
    filterRelease: 0.18,
    feedbackVol: 0.2,
    feedbackFilterType: "lowpass",
    portamento: 0.08,
    lfoRate: 4.8,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.28,
    delayTime: 0.3,
    delayFeedback: 0.3,
    delayMix: 0.18,
    oscDrift: 22,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.2,
    subShape: "triangle",
    subOctave: -1,
    monoEnvelopeMode: "retrig",
    lfoKeySync: true,
    reverbMix: 0.12,
    reverbDecay: 1.3,
    phaserMix: 0,
    phaserRate: 1,
    flangerMix: 0.15,
    flangerRate: 0.7,
    flangerFeedback: 0.3,
    osc1Morph: 0.2,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.25,
    haasDelay: 0.004
  },
  {
    name: "80S: Laser-Grid Sub",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "square",
    osc1Pitch: -2,
    osc2Pitch: -2,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.4,
    ringModVol: 0.2,
    subVolume: 0.6,
    noiseVolume: 0.05,
    cutoff: 200,
    resonance: 3,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.08,
    decay: 0.5,
    sustain: 0.85,
    release: 0.45,
    filterAttack: 0.1,
    filterDecay: 0.6,
    filterSustain: 0.7,
    filterRelease: 0.45,
    feedbackVol: 0.3,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 1.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.8,
    lfo2Depth: 150,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.3,
    delayTime: 0.35,
    delayFeedback: 0.3,
    delayMix: 0.12,
    oscDrift: 30,
    hpfBassBoost: true,
    unisonDetune: 6,
    filterCircuit: "ladder",
    filterDrive: 0.18,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.8,
    phaserMix: 0.2,
    phaserRate: 0.4,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0.3,
    osc2Morph: 0.2,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.4,
    haasDelay: 0.015
  },
  {
    name: "NUMAN: Vox Humana Pad",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 15,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.2,
    noiseVolume: 0,
    cutoff: 2000,
    resonance: 6,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.15,
    decay: 0.5,
    sustain: 0.8,
    release: 0.6,
    filterAttack: 0.18,
    filterDecay: 0.5,
    filterSustain: 0.7,
    filterRelease: 0.6,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.05,
    lfoRate: 4.2,
    lfoDepth: 100,
    lfoTarget: "filter",
    lfo2Rate: 0.2,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.5,
    delayTime: 0.35,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 4,
    filterCircuit: "ladder",
    filterDrive: 0.1,
    subShape: "sawtooth",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.2,
    reverbDecay: 2,
    phaserMix: 0.2,
    phaserRate: 0.3,
    flangerMix: 0.1,
    flangerRate: 0.2,
    flangerFeedback: 0.3,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.4,
    haasDelay: 0,
    ampDrive: 1.1,
    ampBass: 1,
    ampMid: 0,
    ampTreble: 1,
    cabType: "combo",
    compOn: true,
    compThreshold: -18,
    compRatio: 3.5,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 1.5
  },
  {
    name: "NUMAN: Electric Bass",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.4,
    ringModVol: 0,
    subVolume: 0.5,
    noiseVolume: 0,
    cutoff: 280,
    resonance: 4.5,
    filterType: "lowpass",
    filterEnvAmt: 1100,
    shAmount: 0,
    attack: 0.005,
    decay: 0.3,
    sustain: 0.7,
    release: 0.2,
    filterAttack: 0.005,
    filterDecay: 0.28,
    filterSustain: 0.1,
    filterRelease: 0.2,
    feedbackVol: 0.1,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.1,
    delayTime: 0.3,
    delayFeedback: 0.2,
    delayMix: 0,
    oscDrift: 15,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.3,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "retrigger",
    lfoKeySync: true,
    reverbMix: 0.05,
    reverbDecay: 1,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.3,
    stereoWidth: 1,
    haasDelay: 0,
    ampDrive: 1.8,
    ampBass: 2,
    ampMid: -1,
    ampTreble: 0,
    cabType: "tweed",
    compOn: true,
    compThreshold: -15,
    compRatio: 4,
    compAttack: 0.005,
    compRelease: 0.2,
    compMakeup: 2
  },
  {
    name: "NUMAN: Friends Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 18,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.1,
    noiseVolume: 0,
    cutoff: 3500,
    resonance: 3,
    filterType: "lowpass",
    filterEnvAmt: 500,
    shAmount: 0,
    attack: 0.02,
    decay: 0.4,
    sustain: 0.8,
    release: 0.3,
    filterAttack: 0.02,
    filterDecay: 0.4,
    filterSustain: 0.8,
    filterRelease: 0.3,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.05,
    lfoRate: 4.5,
    lfoDepth: 80,
    lfoTarget: "pitch",
    lfo2Rate: 0.3,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.3,
    delayTime: 0.4,
    delayFeedback: 0.3,
    delayMix: 0.1,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.1,
    reverbDecay: 1.5,
    phaserMix: 0.25,
    phaserRate: 0.2,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.05,
    stereoWidth: 1.2,
    haasDelay: 0.02,
    ampDrive: 1.2,
    ampBass: 0,
    ampMid: 1,
    ampTreble: 1,
    cabType: "combo",
    compOn: false,
    compThreshold: -24,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 0
  },
  {
    name: "NUMAN: Cars Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 24,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.6,
    ringModVol: 0,
    subVolume: 0.2,
    noiseVolume: 0.01,
    cutoff: 1500,
    resonance: 5,
    filterType: "lowpass",
    filterEnvAmt: 800,
    shAmount: 0,
    attack: 0.01,
    decay: 0.4,
    sustain: 0.7,
    release: 0.25,
    filterAttack: 0.02,
    filterDecay: 0.4,
    filterSustain: 0.6,
    filterRelease: 0.25,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.3,
    lfoRate: 5,
    lfoDepth: 50,
    lfoTarget: "pitch",
    lfo2Rate: 0.8,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.3,
    delayMix: 0.25,
    oscDrift: 30,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.8,
    phaserMix: 0,
    phaserRate: 0.4,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.2,
    haasDelay: 0,
    ampDrive: 1.3,
    ampBass: 1,
    ampMid: 0,
    ampTreble: 1,
    cabType: "combo",
    compOn: true,
    compThreshold: -16,
    compRatio: 3,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 1
  },
  {
    name: "NUMAN: Cars Bass",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: -1,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.4,
    noiseVolume: 0,
    cutoff: 350,
    resonance: 3.5,
    filterType: "lowpass",
    filterEnvAmt: 900,
    shAmount: 0,
    attack: 0.005,
    decay: 0.3,
    sustain: 0.6,
    release: 0.15,
    filterAttack: 0.005,
    filterDecay: 0.2,
    filterSustain: 0,
    filterRelease: 0.15,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.15,
    delayTime: 0.25,
    delayFeedback: 0.2,
    delayMix: 0.05,
    oscDrift: 15,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.2,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "retrigger",
    lfoKeySync: true,
    reverbMix: 0.05,
    reverbDecay: 1.2,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1,
    haasDelay: 0,
    ampDrive: 1.4,
    ampBass: 1,
    ampMid: 0,
    ampTreble: 0,
    cabType: "tweed",
    compOn: true,
    compThreshold: -14,
    compRatio: 4.5,
    compAttack: 0.005,
    compRelease: 0.15,
    compMakeup: 1.5
  },
  {
    name: "NUMAN: Films Brass",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.1,
    noiseVolume: 0.01,
    cutoff: 800,
    resonance: 7,
    filterType: "bandpass",
    filterEnvAmt: 2200,
    shAmount: 0,
    attack: 0.08,
    decay: 0.6,
    sustain: 0.4,
    release: 0.4,
    filterAttack: 0.12,
    filterDecay: 0.6,
    filterSustain: 0.2,
    filterRelease: 0.4,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 100,
    lfoTarget: "filter",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.4,
    delayTime: 0.35,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 4,
    filterCircuit: "classic",
    filterDrive: 0.15,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.5,
    phaserMix: 0.1,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.3,
    haasDelay: 0,
    ampDrive: 1.2,
    ampBass: 0,
    ampMid: 2,
    ampTreble: 1,
    cabType: "combo",
    compOn: true,
    compThreshold: -16,
    compRatio: 3,
    compAttack: 0.01,
    compRelease: 0.2,
    compMakeup: 1
  },
  {
    name: "NUMAN: Films Bass",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 14,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0.3,
    subVolume: 0.4,
    noiseVolume: 0.02,
    cutoff: 180,
    resonance: 4.5,
    filterType: "lowpass",
    filterEnvAmt: 1000,
    shAmount: 0,
    attack: 0.01,
    decay: 0.4,
    sustain: 0.75,
    release: 0.25,
    filterAttack: 0.01,
    filterDecay: 0.4,
    filterSustain: 0.5,
    filterRelease: 0.25,
    feedbackVol: 0.2,
    feedbackFilterType: "lowpass",
    portamento: 0.05,
    lfoRate: 2,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.2,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.3,
    delayMix: 0.1,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.4,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.1,
    reverbDecay: 1.5,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0.1,
    flangerRate: 0.3,
    flangerFeedback: 0.2,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.55,
    stereoWidth: 1.1,
    haasDelay: 0,
    ampDrive: 1.7,
    ampBass: 3,
    ampMid: -1,
    ampTreble: -1,
    cabType: "stack",
    compOn: true,
    compThreshold: -12,
    compRatio: 5,
    compAttack: 0.005,
    compRelease: 0.2,
    compMakeup: 2.5
  },
  {
    name: "NUMAN: Films Percussive",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 0,
    syncMode: false,
    osc1Vol: 0,
    osc2Vol: 0,
    ringModVol: 0,
    subVolume: 0,
    noiseVolume: 0.8,
    cutoff: 1200,
    resonance: 8.5,
    filterType: "lowpass",
    filterEnvAmt: 2400,
    shAmount: 0,
    attack: 0.002,
    decay: 0.1,
    sustain: 0,
    release: 0.1,
    filterAttack: 0.002,
    filterDecay: 0.08,
    filterSustain: 0,
    filterRelease: 0.1,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0,
    delayTime: 0.25,
    delayFeedback: 0.6,
    delayMix: 0.4,
    oscDrift: 0,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.2,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "retrigger",
    lfoKeySync: true,
    reverbMix: 0.2,
    reverbDecay: 1.2,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.3,
    stereoWidth: 1,
    haasDelay: 0,
    ampDrive: 1.5,
    ampBass: -2,
    ampMid: 3,
    ampTreble: 2,
    cabType: "tweed",
    compOn: true,
    compThreshold: -18,
    compRatio: 4,
    compAttack: 0.002,
    compRelease: 0.1,
    compMakeup: 3,
    arpOn: true,
    arpBpm: 125,
    arpPattern: "up",
    arpDivision: 16
  },
  {
    name: "NUMAN: M.E. Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 10,
    syncMode: true,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.1,
    noiseVolume: 0,
    cutoff: 2500,
    resonance: 4,
    filterType: "lowpass",
    filterEnvAmt: 1200,
    shAmount: 0,
    attack: 0.02,
    decay: 0.4,
    sustain: 0.7,
    release: 0.3,
    filterAttack: 0.02,
    filterDecay: 0.4,
    filterSustain: 0.6,
    filterRelease: 0.3,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.1,
    lfoRate: 0.8,
    lfoDepth: 400,
    lfoTarget: "pitch",
    lfo2Rate: 0.2,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.35,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.8,
    phaserMix: 0.2,
    phaserRate: 0.4,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0.3,
    osc1Morph: 0,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.2,
    haasDelay: 0,
    ampDrive: 1.2,
    ampBass: 1,
    ampMid: 1,
    ampTreble: 1,
    cabType: "combo",
    compOn: false,
    compThreshold: -24,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 0
  },
  {
    name: "NUMAN: M.E. Drone",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: -2,
    osc2Pitch: -2,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.5,
    ringModVol: 0.1,
    subVolume: 0.8,
    noiseVolume: 0.1,
    cutoff: 600,
    resonance: 3.5,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.25,
    decay: 0.8,
    sustain: 0.9,
    release: 0.8,
    filterAttack: 0.3,
    filterDecay: 0.8,
    filterSustain: 0.8,
    filterRelease: 0.8,
    feedbackVol: 0.2,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.15,
    lfo2Depth: 300,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.3,
    delayTime: 0.45,
    delayFeedback: 0.4,
    delayMix: 0.25,
    oscDrift: 30,
    hpfBassBoost: true,
    unisonDetune: 4,
    filterCircuit: "ladder",
    filterDrive: 0.2,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.35,
    reverbDecay: 3,
    phaserMix: 0.3,
    phaserRate: 0.2,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0.2,
    osc2Morph: 0.2,
    saturationMode: "warm",
    saturationAmount: 0.3,
    stereoWidth: 1.4,
    haasDelay: 0.015,
    ampDrive: 1.3,
    ampBass: 2,
    ampMid: 0,
    ampTreble: -1,
    cabType: "stack",
    compOn: true,
    compThreshold: -18,
    compRatio: 4,
    compAttack: 0.02,
    compRelease: 0.3,
    compMakeup: 2
  },
  {
    name: "NUMAN: Park Pad",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 16,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.6,
    ringModVol: 0,
    subVolume: 0.3,
    noiseVolume: 0.02,
    cutoff: 1200,
    resonance: 2,
    filterType: "lowpass",
    filterEnvAmt: 300,
    shAmount: 0,
    attack: 0.4,
    decay: 0.6,
    sustain: 0.9,
    release: 0.8,
    filterAttack: 0.4,
    filterDecay: 0.6,
    filterSustain: 0.8,
    filterRelease: 0.8,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 3.2,
    lfoDepth: 80,
    lfoTarget: "filter",
    lfo2Rate: 0.1,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.6,
    delayTime: 0.4,
    delayFeedback: 0.3,
    delayMix: 0.2,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 6,
    filterCircuit: "ladder",
    filterDrive: 0.08,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.3,
    reverbDecay: 2.2,
    phaserMix: 0.35,
    phaserRate: 0.15,
    flangerMix: 0.1,
    flangerRate: 0.2,
    flangerFeedback: 0.2,
    osc1Morph: 0.1,
    osc2Morph: 0.1,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.5,
    haasDelay: 0.015,
    ampDrive: 1.1,
    ampBass: 1,
    ampMid: 0,
    ampTreble: 1,
    cabType: "combo",
    compOn: true,
    compThreshold: -20,
    compRatio: 3,
    compAttack: 0.015,
    compRelease: 0.3,
    compMakeup: 1
  },
  {
    name: "NUMAN: Park Lead",
    voiceMode: "mono",
    osc1Waveform: "triangle",
    osc2Waveform: "triangle",
    osc1Pitch: 1,
    osc2Pitch: 2,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.4,
    ringModVol: 0,
    subVolume: 0.1,
    noiseVolume: 0,
    cutoff: 900,
    resonance: 5,
    filterType: "lowpass",
    filterEnvAmt: 600,
    shAmount: 0,
    attack: 0.03,
    decay: 0.4,
    sustain: 0.8,
    release: 0.35,
    filterAttack: 0.04,
    filterDecay: 0.4,
    filterSustain: 0.7,
    filterRelease: 0.35,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.2,
    lfoRate: 4.8,
    lfoDepth: 50,
    lfoTarget: "pitch",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.4,
    delayFeedback: 0.3,
    delayMix: 0.25,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.02,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.5,
    phaserMix: 0.1,
    phaserRate: 0.4,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0.4,
    osc2Morph: 0.4,
    saturationMode: "warm",
    saturationAmount: 0.05,
    stereoWidth: 1.2,
    haasDelay: 0,
    ampDrive: 1.2,
    ampBass: -1,
    ampMid: 2,
    ampTreble: 1,
    cabType: "combo",
    compOn: false,
    compThreshold: -24,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 0
  },
  {
    name: "NUMAN: Park Bass",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.4,
    noiseVolume: 0.01,
    cutoff: 250,
    resonance: 1.5,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.15,
    decay: 0.5,
    sustain: 0.8,
    release: 0.4,
    filterAttack: 0.12,
    filterDecay: 0.5,
    filterSustain: 0.8,
    filterRelease: 0.4,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.02,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.35,
    delayFeedback: 0.2,
    delayMix: 0.05,
    oscDrift: 18,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -2,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.1,
    reverbDecay: 1.8,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.1,
    haasDelay: 0,
    ampDrive: 1.3,
    ampBass: 3,
    ampMid: -1,
    ampTreble: 0,
    cabType: "tweed",
    compOn: true,
    compThreshold: -15,
    compRatio: 3.5,
    compAttack: 0.01,
    compRelease: 0.2,
    compMakeup: 1.5
  },
  {
    name: "NUMAN: Metal Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.4,
    ringModVol: 0.9,
    subVolume: 0.1,
    noiseVolume: 0.02,
    cutoff: 3200,
    resonance: 3,
    filterType: "lowpass",
    filterEnvAmt: 800,
    shAmount: 0,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.5,
    release: 0.2,
    filterAttack: 0.01,
    filterDecay: 0.3,
    filterSustain: 0.5,
    filterRelease: 0.2,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.02,
    lfoRate: 4.5,
    lfoDepth: 80,
    lfoTarget: "pitch",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.3,
    delayMix: 0.2,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "retrigger",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.4,
    phaserMix: 0.3,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.2,
    haasDelay: 0,
    ampDrive: 1.4,
    ampBass: 0,
    ampMid: 2,
    ampTreble: 1,
    cabType: "combo",
    compOn: true,
    compThreshold: -14,
    compRatio: 3,
    compAttack: 0.005,
    compRelease: 0.2,
    compMakeup: 1
  },
  {
    name: "NUMAN: Metal Bass",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "square",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 30,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.5,
    ringModVol: 0.6,
    subVolume: 0.3,
    noiseVolume: 0.02,
    cutoff: 400,
    resonance: 5.5,
    filterType: "lowpass",
    filterEnvAmt: 1400,
    shAmount: 0,
    attack: 0.005,
    decay: 0.3,
    sustain: 0.6,
    release: 0.2,
    filterAttack: 0.005,
    filterDecay: 0.28,
    filterSustain: 0.1,
    filterRelease: 0.2,
    feedbackVol: 0.15,
    feedbackFilterType: "lowpass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.1,
    delayTime: 0.25,
    delayFeedback: 0.2,
    delayMix: 0.05,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "ladder",
    filterDrive: 0.3,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "retrigger",
    lfoKeySync: true,
    reverbMix: 0.08,
    reverbDecay: 1.2,
    phaserMix: 0.1,
    phaserRate: 0.3,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.4,
    stereoWidth: 1.1,
    haasDelay: 0,
    ampDrive: 1.6,
    ampBass: 2,
    ampMid: -1,
    ampTreble: 1,
    cabType: "stack",
    compOn: true,
    compThreshold: -12,
    compRatio: 4.5,
    compAttack: 0.005,
    compRelease: 0.15,
    compMakeup: 2
  },
  {
    name: "NUMAN: We Are Glass Arp",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "square",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.4,
    ringModVol: 0,
    subVolume: 0.2,
    noiseVolume: 0,
    cutoff: 1800,
    resonance: 6,
    filterType: "lowpass",
    filterEnvAmt: 1600,
    shAmount: 0,
    attack: 0.002,
    decay: 0.15,
    sustain: 0.2,
    release: 0.15,
    filterAttack: 0.002,
    filterDecay: 0.12,
    filterSustain: 0.1,
    filterRelease: 0.15,
    feedbackVol: 0.1,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 5.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.3,
    delayTime: 0.2,
    delayFeedback: 0.4,
    delayMix: 0.3,
    oscDrift: 15,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.15,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "retrigger",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.3,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.3,
    haasDelay: 0,
    ampDrive: 1.3,
    ampBass: 0,
    ampMid: 1,
    ampTreble: 2,
    cabType: "combo",
    compOn: true,
    compThreshold: -15,
    compRatio: 3.5,
    compAttack: 0.005,
    compRelease: 0.15,
    compMakeup: 1.5,
    arpOn: true,
    arpBpm: 132,
    arpPattern: "updown",
    arpDivision: 16
  },
  {
    name: "NUMAN: Chameleon Bass",
    voiceMode: "mono",
    osc1Waveform: "triangle",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.7,
    osc2Vol: 0.3,
    ringModVol: 0,
    subVolume: 0.5,
    noiseVolume: 0.01,
    cutoff: 300,
    resonance: 6,
    filterType: "lowpass",
    filterEnvAmt: 1200,
    shAmount: 0,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.5,
    release: 0.2,
    filterAttack: 0.01,
    filterDecay: 0.22,
    filterSustain: 0,
    filterRelease: 0.2,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.1,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.15,
    delayTime: 0.3,
    delayFeedback: 0.2,
    delayMix: 0.05,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.2,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.05,
    reverbDecay: 1.2,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0.4,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1,
    haasDelay: 0,
    ampDrive: 1.4,
    ampBass: 2,
    ampMid: 0,
    ampTreble: -1,
    cabType: "combo",
    compOn: true,
    compThreshold: -14,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.2,
    compMakeup: 1.5
  },
  {
    name: "NUMAN: Chameleon Lead",
    voiceMode: "mono",
    osc1Waveform: "triangle",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 1,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.5,
    ringModVol: 0.2,
    subVolume: 0.1,
    noiseVolume: 0,
    cutoff: 2200,
    resonance: 3.5,
    filterType: "lowpass",
    filterEnvAmt: 600,
    shAmount: 0,
    attack: 0.005,
    decay: 0.4,
    sustain: 0.6,
    release: 0.3,
    filterAttack: 0.01,
    filterDecay: 0.3,
    filterSustain: 0.4,
    filterRelease: 0.3,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.05,
    lfoRate: 4.2,
    lfoDepth: 60,
    lfoTarget: "pitch",
    lfo2Rate: 0.2,
    lfo2Depth: 200,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.3,
    delayTime: 0.35,
    delayFeedback: 0.3,
    delayMix: 0.2,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.6,
    phaserMix: 0.4,
    phaserRate: 0.2,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0.5,
    osc2Morph: 0.3,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.3,
    haasDelay: 0,
    ampDrive: 1.1,
    ampBass: -1,
    ampMid: 2,
    ampTreble: 1,
    cabType: "combo",
    compOn: false,
    compThreshold: -24,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 0
  },
  {
    name: "NUMAN: Complex Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "triangle",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 14,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.4,
    ringModVol: 0,
    subVolume: 0.1,
    noiseVolume: 0,
    cutoff: 1100,
    resonance: 4.5,
    filterType: "lowpass",
    filterEnvAmt: 500,
    shAmount: 0,
    attack: 0.05,
    decay: 0.5,
    sustain: 0.7,
    release: 0.4,
    filterAttack: 0.05,
    filterDecay: 0.5,
    filterSustain: 0.6,
    filterRelease: 0.4,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.35,
    lfoRate: 4.8,
    lfoDepth: 80,
    lfoTarget: "pitch",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.35,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.02,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.3,
    reverbDecay: 2,
    phaserMix: 0.1,
    phaserRate: 0.3,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0.2,
    osc2Morph: 0.1,
    saturationMode: "warm",
    saturationAmount: 0.05,
    stereoWidth: 1.2,
    haasDelay: 0,
    ampDrive: 1.2,
    ampBass: 0,
    ampMid: 1,
    ampTreble: 1,
    cabType: "combo",
    compOn: false,
    compThreshold: -24,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 0
  },
  {
    name: "NUMAN: Die Phase Lead",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.2,
    noiseVolume: 0,
    cutoff: 1600,
    resonance: 3,
    filterType: "lowpass",
    filterEnvAmt: 600,
    shAmount: 0,
    attack: 0.02,
    decay: 0.4,
    sustain: 0.75,
    release: 0.3,
    filterAttack: 0.02,
    filterDecay: 0.4,
    filterSustain: 0.6,
    filterRelease: 0.3,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.08,
    lfoRate: 4,
    lfoDepth: 50,
    lfoTarget: "pitch",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.4,
    delayTime: 0.3,
    delayFeedback: 0.25,
    delayMix: 0.15,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.5,
    phaserMix: 0.7,
    phaserRate: 1.2,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.3,
    haasDelay: 0,
    ampDrive: 1.2,
    ampBass: 0,
    ampMid: 2,
    ampTreble: 1,
    cabType: "combo",
    compOn: false,
    compThreshold: -24,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 0
  },
  {
    name: "NUMAN: Die Bass",
    voiceMode: "mono",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 14,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.5,
    noiseVolume: 0,
    cutoff: 500,
    resonance: 5,
    filterType: "lowpass",
    filterEnvAmt: 1400,
    shAmount: 0,
    attack: 0.01,
    decay: 0.35,
    sustain: 0.65,
    release: 0.2,
    filterAttack: 0.01,
    filterDecay: 0.25,
    filterSustain: 0.1,
    filterRelease: 0.2,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.02,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.2,
    delayMix: 0.05,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.25,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "retrigger",
    lfoKeySync: true,
    reverbMix: 0.05,
    reverbDecay: 1.2,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.25,
    stereoWidth: 1.1,
    haasDelay: 0,
    ampDrive: 1.4,
    ampBass: 2,
    ampMid: 0,
    ampTreble: 1,
    cabType: "tweed",
    compOn: true,
    compThreshold: -14,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.2,
    compMakeup: 1.5
  },
  {
    name: "NUMAN: Replicas Drone",
    voiceMode: "poly",
    osc1Waveform: "square",
    osc2Waveform: "square",
    osc1Pitch: -2,
    osc2Pitch: -1,
    osc2Detune: 35,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.4,
    ringModVol: 0,
    subVolume: 0.6,
    noiseVolume: 0.4,
    cutoff: 600,
    resonance: 4,
    filterType: "lowpass",
    filterEnvAmt: 500,
    shAmount: 0,
    attack: 0.2,
    decay: 0.6,
    sustain: 0.85,
    release: 0.6,
    filterAttack: 0.25,
    filterDecay: 0.6,
    filterSustain: 0.7,
    filterRelease: 0.6,
    feedbackVol: 0.2,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.4,
    lfo2Depth: 400,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.3,
    delayTime: 0.4,
    delayFeedback: 0.35,
    delayMix: 0.2,
    oscDrift: 30,
    hpfBassBoost: true,
    unisonDetune: 4,
    filterCircuit: "ladder",
    filterDrive: 0.25,
    subShape: "square",
    subOctave: -2,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.25,
    reverbDecay: 2.2,
    phaserMix: 0.1,
    phaserRate: 0.4,
    flangerMix: 0.3,
    flangerRate: 0.2,
    flangerFeedback: 0.5,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.35,
    stereoWidth: 1.3,
    haasDelay: 0.01,
    ampDrive: 1.4,
    ampBass: 2,
    ampMid: 0,
    ampTreble: -2,
    cabType: "stack",
    compOn: true,
    compThreshold: -15,
    compRatio: 3.5,
    compAttack: 0.02,
    compRelease: 0.25,
    compMakeup: 2
  },
  {
    name: "NUMAN: Replicas Lead",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "square",
    osc1Pitch: 1,
    osc2Pitch: 1,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.1,
    noiseVolume: 0,
    cutoff: 1500,
    resonance: 3,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.01,
    decay: 0.4,
    sustain: 0.7,
    release: 0.15,
    filterAttack: 0.01,
    filterDecay: 0.4,
    filterSustain: 0.6,
    filterRelease: 0.15,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.05,
    lfoRate: 4.5,
    lfoDepth: 50,
    lfoTarget: "pitch",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.2,
    delayMix: 0.1,
    oscDrift: 15,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.2,
    reverbDecay: 1.5,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.1,
    haasDelay: 0,
    ampDrive: 1.2,
    ampBass: 0,
    ampMid: 1,
    ampTreble: 1,
    cabType: "combo",
    compOn: false,
    compThreshold: -24,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 0
  },
  {
    name: "NUMAN: Smile Pad",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 14,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.2,
    noiseVolume: 0,
    cutoff: 1300,
    resonance: 3.5,
    filterType: "lowpass",
    filterEnvAmt: 1000,
    shAmount: 0,
    attack: 0.05,
    decay: 0.4,
    sustain: 0.7,
    release: 0.35,
    filterAttack: 0.08,
    filterDecay: 0.4,
    filterSustain: 0.6,
    filterRelease: 0.35,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 80,
    lfoTarget: "filter",
    lfo2Rate: 0.2,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.5,
    delayTime: 0.35,
    delayFeedback: 0.3,
    delayMix: 0.1,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 4,
    filterCircuit: "classic",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.5,
    phaserMix: 0.2,
    phaserRate: 0.4,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.4,
    haasDelay: 0.01,
    ampDrive: 1.2,
    ampBass: 1,
    ampMid: 0,
    ampTreble: 1,
    cabType: "combo",
    compOn: true,
    compThreshold: -16,
    compRatio: 3,
    compAttack: 0.01,
    compRelease: 0.2,
    compMakeup: 1
  },
  {
    name: "NUMAN: Technical Bass",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 20,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.4,
    noiseVolume: 0,
    cutoff: 220,
    resonance: 7.5,
    filterType: "lowpass",
    filterEnvAmt: 1600,
    shAmount: 0,
    attack: 0.005,
    decay: 0.3,
    sustain: 0.5,
    release: 0.2,
    filterAttack: 0.005,
    filterDecay: 0.18,
    filterSustain: 0,
    filterRelease: 0.2,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.05,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.3,
    delayFeedback: 0.2,
    delayMix: 0.05,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.2,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.05,
    reverbDecay: 1.2,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1,
    haasDelay: 0,
    ampDrive: 1.4,
    ampBass: 2,
    ampMid: 0,
    ampTreble: -1,
    cabType: "combo",
    compOn: true,
    compThreshold: -14,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.2,
    compMakeup: 1.5
  },
  {
    name: "NUMAN: Telekon Pad",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: -1,
    osc2Pitch: -1,
    osc2Detune: 12,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.3,
    noiseVolume: 0.02,
    cutoff: 800,
    resonance: 5,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.2,
    decay: 0.6,
    sustain: 0.8,
    release: 0.6,
    filterAttack: 0.2,
    filterDecay: 0.6,
    filterSustain: 0.7,
    filterRelease: 0.6,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 0,
    lfoTarget: "none",
    lfo2Rate: 0.08,
    lfo2Depth: 500,
    lfo2Target: "filter",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.4,
    delayTime: 0.45,
    delayFeedback: 0.3,
    delayMix: 0.2,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 4,
    filterCircuit: "classic",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.4,
    reverbDecay: 3.5,
    phaserMix: 0.5,
    phaserRate: 0.1,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.4,
    haasDelay: 0.015,
    ampDrive: 1.2,
    ampBass: 1,
    ampMid: 0,
    ampTreble: 1,
    cabType: "combo",
    compOn: true,
    compThreshold: -18,
    compRatio: 3.5,
    compAttack: 0.015,
    compRelease: 0.25,
    compMakeup: 1.5
  },
  {
    name: "NUMAN: Telekon Lead",
    voiceMode: "mono",
    osc1Waveform: "triangle",
    osc2Waveform: "triangle",
    osc1Pitch: 2,
    osc2Pitch: 2,
    osc2Detune: 8,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.4,
    ringModVol: 0,
    subVolume: 0.1,
    noiseVolume: 0,
    cutoff: 1200,
    resonance: 4,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.05,
    decay: 0.4,
    sustain: 0.8,
    release: 0.35,
    filterAttack: 0.05,
    filterDecay: 0.4,
    filterSustain: 0.7,
    filterRelease: 0.35,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.15,
    lfoRate: 6.2,
    lfoDepth: 50,
    lfoTarget: "pitch",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.2,
    delayTime: 0.35,
    delayFeedback: 0.3,
    delayMix: 0.3,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.02,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.2,
    reverbDecay: 1.8,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0.2,
    osc2Morph: 0.2,
    saturationMode: "warm",
    saturationAmount: 0.05,
    stereoWidth: 1.2,
    haasDelay: 0,
    ampDrive: 1.2,
    ampBass: 0,
    ampMid: 1,
    ampTreble: 1,
    cabType: "combo",
    compOn: false,
    compThreshold: -24,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 0
  },
  {
    name: "NUMAN: Tracks Strings",
    voiceMode: "poly",
    osc1Waveform: "sawtooth",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 22,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.2,
    noiseVolume: 0,
    cutoff: 2200,
    resonance: 1.5,
    filterType: "lowpass",
    filterEnvAmt: 300,
    shAmount: 0,
    attack: 0.2,
    decay: 0.5,
    sustain: 0.8,
    release: 0.5,
    filterAttack: 0.2,
    filterDecay: 0.5,
    filterSustain: 0.8,
    filterRelease: 0.5,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0,
    lfoRate: 3.5,
    lfoDepth: 50,
    lfoTarget: "filter",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.75,
    delayTime: 0.35,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 25,
    hpfBassBoost: true,
    unisonDetune: 4,
    filterCircuit: "classic",
    filterDrive: 0.05,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.2,
    reverbDecay: 2,
    phaserMix: 0.2,
    phaserRate: 0.4,
    flangerMix: 0.25,
    flangerRate: 0.2,
    flangerFeedback: 0.4,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.15,
    stereoWidth: 1.4,
    haasDelay: 0,
    ampDrive: 1.1,
    ampBass: 1,
    ampMid: 0,
    ampTreble: 1,
    cabType: "combo",
    compOn: true,
    compThreshold: -18,
    compRatio: 3,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 1
  },
  {
    name: "NUMAN: Drones Chorus",
    voiceMode: "poly",
    osc1Waveform: "triangle",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 15,
    syncMode: false,
    osc1Vol: 0.5,
    osc2Vol: 0.4,
    ringModVol: 0.2,
    subVolume: 0.3,
    noiseVolume: 0.02,
    cutoff: 900,
    resonance: 8,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.15,
    decay: 0.5,
    sustain: 0.8,
    release: 0.5,
    filterAttack: 0.15,
    filterDecay: 0.5,
    filterSustain: 0.7,
    filterRelease: 0.5,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.05,
    lfoRate: 0.2,
    lfoDepth: 250,
    lfoTarget: "filter",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.4,
    delayTime: 0.4,
    delayFeedback: 0.3,
    delayMix: 0.2,
    oscDrift: 20,
    hpfBassBoost: true,
    unisonDetune: 4,
    filterCircuit: "classic",
    filterDrive: 0.1,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.3,
    reverbDecay: 2.2,
    phaserMix: 0.1,
    phaserRate: 0.4,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0.7,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.1,
    stereoWidth: 1.3,
    haasDelay: 0,
    ampDrive: 1.1,
    ampBass: 0,
    ampMid: 2,
    ampTreble: 1,
    cabType: "combo",
    compOn: true,
    compThreshold: -16,
    compRatio: 3.5,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 1.5
  },
  {
    name: "NUMAN: Wreckage Lead",
    voiceMode: "mono",
    osc1Waveform: "square",
    osc2Waveform: "sawtooth",
    osc1Pitch: 0,
    osc2Pitch: 0,
    osc2Detune: 10,
    syncMode: false,
    osc1Vol: 0.6,
    osc2Vol: 0.5,
    ringModVol: 0,
    subVolume: 0.2,
    noiseVolume: 0,
    cutoff: 750,
    resonance: 4.5,
    filterType: "lowpass",
    filterEnvAmt: 400,
    shAmount: 0,
    attack: 0.1,
    decay: 0.5,
    sustain: 0.7,
    release: 0.4,
    filterAttack: 0.1,
    filterDecay: 0.5,
    filterSustain: 0.7,
    filterRelease: 0.4,
    feedbackVol: 0,
    feedbackFilterType: "bypass",
    portamento: 0.1,
    lfoRate: 4.2,
    lfoDepth: 60,
    lfoTarget: "pitch",
    lfo2Rate: 0.5,
    lfo2Depth: 0,
    lfo2Target: "none",
    lfo2Shape: "sine",
    lfo2KeySync: true,
    chorusDepth: 0.25,
    delayTime: 0.3,
    delayFeedback: 0.3,
    delayMix: 0.15,
    oscDrift: 20,
    hpfBassBoost: false,
    unisonDetune: 0,
    filterCircuit: "classic",
    filterDrive: 0.15,
    subShape: "sine",
    subOctave: -1,
    monoEnvelopeMode: "legato",
    lfoKeySync: true,
    reverbMix: 0.15,
    reverbDecay: 1.5,
    phaserMix: 0,
    phaserRate: 0.5,
    flangerMix: 0,
    flangerRate: 0.5,
    flangerFeedback: 0,
    osc1Morph: 0,
    osc2Morph: 0,
    saturationMode: "warm",
    saturationAmount: 0.2,
    stereoWidth: 1.2,
    haasDelay: 0,
    ampDrive: 1.5,
    ampBass: 1,
    ampMid: 0,
    ampTreble: 1,
    cabType: "combo",
    compOn: false,
    compThreshold: -24,
    compRatio: 4,
    compAttack: 0.01,
    compRelease: 0.25,
    compMakeup: 0
  }
];

// --- DWGS Waveform Calculations ---
const dwgsWavesCache = new Map();

const getDwgsWave = (ctx, type) => {
  if (dwgsWavesCache.has(type)) {
    return dwgsWavesCache.get(type);
  }

  const numHarmonics = 32;
  const real = new Float32Array(numHarmonics);
  const imag = new Float32Array(numHarmonics);

  // real[0] and imag[0] must be 0 (DC offset)
  real[0] = 0;
  imag[0] = 0;

  switch (type) {
    case 'organ':
      imag[1] = 1.0;
      imag[2] = 0.5;
      imag[3] = 0.7;
      imag[5] = 0.4;
      imag[8] = 0.2;
      break;
    case 'vox':
      imag[1] = 0.8;
      imag[3] = 0.9;
      imag[4] = 0.5;
      imag[10] = 0.4;
      imag[12] = 0.3;
      break;
    case 'strings':
      for (let i = 1; i < numHarmonics; i++) {
        imag[i] = (1.0 / Math.pow(i, 1.1)) * (i % 2 === 0 ? 1 : -1);
      }
      break;
    case 'epiano':
      imag[1] = 1.0;
      imag[4] = 0.1;
      imag[8] = 0.5;
      imag[11] = 0.35;
      break;
    case 'bell':
      imag[1] = 0.5;
      imag[5] = 0.3;
      imag[9] = 0.7;
      imag[17] = 0.6;
      imag[25] = 0.4;
      break;
    case 'synth-bass':
      imag[1] = 1.0;
      imag[2] = 0.8;
      imag[3] = 0.6;
      imag[4] = 0.4;
      imag[5] = 0.2;
      break;
    case 'clavit':
      for (let i = 1; i < numHarmonics; i += 2) {
        imag[i] = 1.0 / i;
      }
      break;
    case 'harmon':
      imag[1] = 1.0;
      imag[2] = 0.5;
      imag[4] = 0.4;
      imag[8] = 0.3;
      imag[16] = 0.2;
      break;
    default:
      imag[1] = 1.0;
  }

  const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  dwgsWavesCache.set(type, wave);
  return wave;
};

export default function MidiSynth({
  layoutMode = 'horizontal',
  embeddedCompactMode = false,
  recordingInputMode = 'mic',
  setRecordingInputMode = () => {},
  liveRecTargetSlot = 'a01',
  setLiveRecTargetSlot = () => {},
  setSelectedEditSlotId = () => {},
  recordingTargetSlotIdRef = null,
  recordingInputModeRef = null,
  selectedMidiDeviceName = 'all',
  setSelectedMidiDeviceName = () => {}
}) {
  const [synthOn, setSynthOn] = useState(false);
  const [dwgsType, setDwgsType] = useState('organ');
  const [midiDevices, setMidiDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState('NO CONTROLLER DETECTED');
  const [lastMidiEvent, setLastMidiEvent] = useState('IDLE');
  const [synthMidiChannel, setSynthMidiChannel] = useState(() => parseInt(localStorage.getItem('deltaiv_midi_channel') || '2', 10));
  const synthMidiChannelRef = useRef(synthMidiChannel);
  useEffect(() => {
    synthMidiChannelRef.current = synthMidiChannel;
  }, [synthMidiChannel]);
  
  // UI scaling & range states
  const [uiScale, setUiScale] = useState(0.85);
  const [keyboardOctave, setKeyboardOctave] = useState(4); 

  // MIDI CC custom mappings
  const [midiMappings, setMidiMappings] = useState(() => {
    const saved = localStorage.getItem('deltavi_midi_mappings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      volume: 7,
      cutoff: 74,
      resonance: 71,
      attack: 73,
      release: 72,
      chorusDepth: 1,
      decay: null,
      sustain: null,
      osc1Vol: null,
      osc2Vol: null,
      ringModVol: null,
      subVolume: null,
      noiseVolume: null,
      lfoRate: null,
      lfoDepth: null,
      lfo2Rate: null,
      lfo2Depth: null,
      portamento: null,
      delayTime: null,
      delayMix: null,
      phaserMix: null,
      flangerMix: null,
      reverbMix: null,
      osc2Detune: null,
      oscDrift: null,
      unisonDetune: null,
      filterDrive: null,
      filterEnvAmt: null,
      reverbDecay: null,
      flangerFeedback: null,
      xMod: null,
      polyModFilterEnv: null,
      polyModOsc2: null,
      feedbackVol: null,
      filterAttack: null,
      filterDecay: null,
      filterSustain: null,
      filterRelease: null,
      syncMode: null,
      hpfBassBoost: null,
      lfoKeySync: null,
      lfo2KeySync: null,
      voiceMode: null,
      filterCircuit: null,
      osc1Waveform: null,
      osc2Waveform: null,
      subShape: null,
      subOctave: null,
      monoEnvelopeMode: null,
      lfoTarget: null,
      lfo2Target: null,
      lfo2Shape: null,
      arpOn: null,
      arpBpm: null,
      arpPattern: null,
      arpDivision: null,
      polyModOsc1Freq: null,
      polyModOsc1Pw: null,
      polyModFilter: null,
      osc1Morph: null,
      osc2Morph: null,
      feedbackFilterType: null,
      saturationMode: null,
      saturationAmount: null,
      stereoWidth: null,
      haasDelay: null,
      ampDrive: null,
      ampBass: null,
      ampMid: null,
      ampTreble: null,
      cabType: null,
      compOn: null,
      compThreshold: null,
      compRatio: null,
      compAttack: null,
      compRelease: null,
      compMakeup: null,
      subFilterType: null,
      subCutoff: null,
      subResonance: null,
      subOscFilterMod: null
    };
  });
  const [midiLearnParam, setMidiLearnParam] = useState(null);
  const [showLatencyGuide, setShowLatencyGuide] = useState(false);
  const [showMidiManager, setShowMidiManager] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualTab, setManualTab] = useState('layout');

  const midiLearnParamRef = useRef(midiLearnParam);
  const midiMappingsRef = useRef(midiMappings);
  const selectedMidiDeviceNameRef = useRef(selectedMidiDeviceName);
  useEffect(() => {
    midiLearnParamRef.current = midiLearnParam;
    midiMappingsRef.current = midiMappings;
    selectedMidiDeviceNameRef.current = selectedMidiDeviceName;
  });

  // Preset management
  const [presets, setPresets] = useState(FACTORY_PRESETS);
  const [selectedPresetName, setSelectedPresetName] = useState(FACTORY_PRESETS[0].name);
  const [customPresetName, setCustomPresetName] = useState('');

  // Voice & Allocation Mode
  const [voiceMode, setVoiceMode] = useState('poly'); 

  // Synthesizer parameters (state for UI controls)
  const [osc1Waveform, setOsc1Waveform] = useState('sawtooth');
  const [osc2Waveform, setOsc2Waveform] = useState('sawtooth');
  const [osc1Pitch, setOsc1Pitch] = useState(0); 
  const [osc2Pitch, setOsc2Pitch] = useState(0); 
  const [osc2Detune, setOsc2Detune] = useState(8); 
  const [syncMode, setSyncMode] = useState(false); 

  // Leo (DeepMind 12) features
  const [oscDrift, setOscDrift] = useState(15); 
  const [hpfBassBoost, setHpfBassBoost] = useState(false);
  const [unisonDetune, setUnisonDetune] = useState(0); 

  // Libra (Bass Station II) features
  const [filterCircuit, setFilterCircuit] = useState('classic'); // 'classic', 'acid'
  const [filterDrive, setFilterDrive] = useState(0.0); // 0.0 to 1.0 saturation
  const [subShape, setSubShape] = useState('sine'); // 'sine', 'square', 'triangle'
  const [subOctave, setSubOctave] = useState(-1); // -1 or -2
  const [subFilterType, setSubFilterType] = useState('bypass'); // 'bypass', 'lowpass', 'highpass', 'bandpass'
  const [subCutoff, setSubCutoff] = useState(1000); // 50 to 5000 Hz
  const [subResonance, setSubResonance] = useState(1.0); // 0.1 to 10.0
  const [subOscFilterMod, setSubOscFilterMod] = useState(0.0); // 0.0 to 1.0 (Filter FM from Sub Osc)
  const [monoEnvelopeMode, setMonoEnvelopeMode] = useState('legato'); // 'legato', 'retrig'
  const [lfoKeySync, setLfoKeySync] = useState(true);

  // Mixer Volumes
  const [osc1Vol, setOsc1Vol] = useState(0.4);
  const [osc2Vol, setOsc2Vol] = useState(0.3);
  const [ringModVol, setRingModVol] = useState(0.0);
  const [subVolume, setSubVolume] = useState(0.2);
  const [noiseVolume, setNoiseVolume] = useState(0.05);
  const [volume, setVolume] = useState(0.5); 
  
  // Inbuilt Amp and Audio Routing states
  const [ampDrive, setAmpDrive] = useState(1.0);
  const [ampBass, setAmpBass] = useState(0);
  const [ampMid, setAmpMid] = useState(0);
  const [ampTreble, setAmpTreble] = useState(0);
  const [cabType, setCabType] = useState('bypass');
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(localStorage.getItem('deltaiv_audio_sink') || 'default');

  // Compressor addon states
  const [compOn, setCompOn] = useState(false);
  const [compThreshold, setCompThreshold] = useState(-24); // -60 to 0 dB
  const [compRatio, setCompRatio] = useState(4); // 1 to 20
  const [compAttack, setCompAttack] = useState(0.01); // 0.001 to 0.1s (1ms to 100ms)
  const [compRelease, setCompRelease] = useState(0.25); // 0.01 to 1.0s (10ms to 1000ms)
  const [compMakeup, setCompMakeup] = useState(0); // 0 to 18 dB
  
  // Resonant Filter Settings
  const [cutoff, setCutoff] = useState(900);
  const [resonance, setResonance] = useState(4.0);
  const [filterType, setFilterType] = useState('lowpass');
  const [filterEnvAmt, setFilterEnvAmt] = useState(1000);
  const [shAmount, setShAmount] = useState(0); 

  // ADSR Envelope
  const [attack, setAttack] = useState(0.04);
  const [decay, setDecay] = useState(0.25);
  const [sustain, setSustain] = useState(0.5);
  const [release, setRelease] = useState(0.35);

  // Advanced Modulation & Effects
  const [portamento, setPortamento] = useState(0.1);
  const [lfoRate, setLfoRate] = useState(3.5);
  const [lfoDepth, setLfoDepth] = useState(0);
  const [lfoTarget, setLfoTarget] = useState('none');
  const [lfo2Rate, setLfo2Rate] = useState(5.0);
  const [lfo2Depth, setLfo2Depth] = useState(0);
  const [lfo2Target, setLfo2Target] = useState('none');
  const [lfo2Shape, setLfo2Shape] = useState('sine');
  const [lfo2KeySync, setLfo2KeySync] = useState(true);
  
  // Effects
  const [chorusDepth, setChorusDepth] = useState(0.25);
  const [delayTime, setDelayTime] = useState(0.3);
  const [delayFeedback, setDelayFeedback] = useState(0.4);
  const [delayMix, setDelayMix] = useState(0.2);

  // Multi-FX Section States
  const [fxTab, setFxTab] = useState('space'); // 'space', 'mod', 'arp'
  const [phaserMix, setPhaserMix] = useState(0.0);
  const [phaserRate, setPhaserRate] = useState(1.0);
  const [flangerMix, setFlangerMix] = useState(0.0);
  const [flangerRate, setFlangerRate] = useState(0.5);
  const [flangerFeedback, setFlangerFeedback] = useState(0.3);
  const [reverbMix, setReverbMix] = useState(0.0);
  const [reverbDecay, setReverbDecay] = useState(1.5);

  // Arpeggiator Settings
  const [arpOn, setArpOn] = useState(false);
  const [arpBpm, setArpBpm] = useState(120);
  const [arpPattern, setArpPattern] = useState('up');
  const [arpDivision, setArpDivision] = useState(16); // Default 16th notes

  // Vectra Modulation States (FM & Envelope Routings)
  const [xMod, setXMod] = useState(0.0);
  const [polyModFilterEnv, setPolyModFilterEnv] = useState(0.0);
  const [polyModOsc2, setPolyModOsc2] = useState(0.0);
  const [polyModOsc1Freq, setPolyModOsc1Freq] = useState(false);
  const [polyModOsc1Pw, setPolyModOsc1Pw] = useState(false);
  const [polyModFilter, setPolyModFilter] = useState(false);

  // Saturation, Morphing, and Feedback States
  const [feedbackVol, setFeedbackVol] = useState(0.0);
  const [feedbackFilterType, setFeedbackFilterType] = useState('bypass'); // 'bypass', 'lowpass', 'highpass'
  const [osc1Morph, setOsc1Morph] = useState(0.0); // 0.0 to 1.0 (Analog to Digital)
  const [osc2Morph, setOsc2Morph] = useState(0.0); // 0.0 to 1.0 (Analog to Digital)
  const [saturationMode, setSaturationMode] = useState('warm'); // 'warm', 'fold', 'decimate'
  const [saturationAmount, setSaturationAmount] = useState(0.0); // 0.0 to 1.0
  const [stereoWidth, setStereoWidth] = useState(1.0); // 0.0 to 2.0 (Mono to Wide)
  const [haasDelay, setHaasDelay] = useState(0.0); // 0.0 to 0.04 (0ms to 40ms)

  // VCF Filter Envelope ADSR States
  const [filterAttack, setFilterAttack] = useState(0.06);
  const [filterDecay, setFilterDecay] = useState(0.3);
  const [filterSustain, setFilterSustain] = useState(0.4);
  const [filterRelease, setFilterRelease] = useState(0.4);

  // Keyboard Wheels States
  const [pitchBend, setPitchBend] = useState(0.0); // -1.0 to 1.0
  const [modWheel, setModWheel] = useState(0.0); // 0.0 to 1.0

  // List of active notes pressed (for visual keyboard)
  const [pressedNotes, setPressedNotes] = useState(new Set());

  // Web Audio Context & Analyzer Node
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const bassBoostNodeRef = useRef(null);
  const analyserRef = useRef(null);
  const analyserLRef = useRef(null);
  const analyserRRef = useRef(null);
  const haasDelayNodeRef = useRef(null);
  const midScaleRef = useRef(null);
  const sideScaleRef = useRef(null);
  const haasLeftRef = useRef(null);
  const haasRightRef = useRef(null);
  const globalAudioNodesRef = useRef([]);
  
  const [scopeMode, setScopeMode] = useState('waveform'); // 'waveform', 'lissajous'
  const scopeModeRef = useRef(scopeMode);
  useEffect(() => {
    scopeModeRef.current = scopeMode;
  }, [scopeMode]);
  
  const activeVoices = useRef(new Map()); 
  const heldNotes = useRef([]); 
  const lastNoteFreq = useRef(null);

  // S&H state
  const shIntervalRef = useRef(null);
  const currentShValue = useRef(0);

  // Master Effect Refs
  const delayNodeRef = useRef(null);
  const delayFeedbackRef = useRef(null);
  const delayWetRef = useRef(null);
  const chorusWetLRef = useRef(null);
  const chorusWetRRef = useRef(null);
  const chorusLfoRef = useRef(null);

  // Phaser Refs
  const phaserLfoRef = useRef(null);
  const phaserApLRef = useRef([]);
  const phaserApRRef = useRef([]);
  const phaserWetRef = useRef(null);
  const phaserDryRef = useRef(null);

  // Flanger Refs
  const flangerLfoRef = useRef(null);
  const flangerDelayLRef = useRef(null);
  const flangerDelayRRef = useRef(null);
  const flangerFeedbackLRef = useRef(null);
  const flangerFeedbackRRef = useRef(null);
  const flangerWetRef = useRef(null);
  const flangerDryRef = useRef(null);

  // Reverb Refs
  const reverbConvolverRef = useRef(null);
  const reverbWetRef = useRef(null);
  const reverbDryRef = useRef(null);
  const masterDistortionRef = useRef(null);
  
  // Inbuilt Amp Simulator Refs
  const ampPreGainRef = useRef(null);
  const ampBassFilterRef = useRef(null);
  const ampMidFilterRef = useRef(null);
  const ampTrebleFilterRef = useRef(null);
  const cabHPRef = useRef(null);
  const cabPresenceRef = useRef(null);
  const cabLPRef = useRef(null);

  // Compressor addon Refs
  const compNodeRef = useRef(null);
  const compMakeupNodeRef = useRef(null);

  // Arpeggiator Refs
  const arpHeldNotes = useRef([]);
  const arpIndex = useRef(0);
  const arpTimer = useRef(null);
  const activeArpNote = useRef(null);

  // Canvas visualizer refs
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Reverb tail generator
  const createReverbBuffer = (ctx, decayTime) => {
    const rate = ctx.sampleRate;
    const len = rate * decayTime;
    const impulse = ctx.createBuffer(2, len, rate);
    const leftChan = impulse.getChannelData(0);
    const rightChan = impulse.getChannelData(1);
    for (let i = 0; i < len; i++) {
      const decay = Math.exp(-i / (rate * (decayTime / 4.5)));
      leftChan[i] = (Math.random() * 2 - 1) * decay;
      rightChan[i] = (Math.random() * 2 - 1) * decay;
    }
    return impulse;
  };

  // --- Audio Output Devices and Routing Setup ---
  useEffect(() => {
    // Request microphone permission to get device labels in browser/Electron
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop()); // Stop the tracks immediately
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(devices => {
        const outputs = devices.filter(d => d.kind === 'audiooutput');
        setAudioDevices(outputs);
      })
      .catch(err => {
        // Fallback if mic permission is denied or not supported
        navigator.mediaDevices.enumerateDevices().then(devices => {
          const outputs = devices.filter(d => d.kind === 'audiooutput');
          setAudioDevices(outputs);
        });
      });
  }, []);

  const handleDeviceChange = async (deviceId) => {
    setSelectedDevice(deviceId);
    localStorage.setItem('deltaiv_audio_sink', deviceId);
    if (audioCtxRef.current && typeof audioCtxRef.current.setSinkId === 'function') {
      try {
        await audioCtxRef.current.setSinkId(deviceId);
        console.log(`Routed audio context output to device: ${deviceId}`);
      } catch (err) {
        console.error("Failed to set audio output device:", err);
      }
    }
  };

  // Update Amp Drive in real-time
  useEffect(() => {
    if (ampPreGainRef.current && audioCtxRef.current) {
      ampPreGainRef.current.gain.setValueAtTime(ampDrive, audioCtxRef.current.currentTime);
    }
  }, [ampDrive]);

  // Update Amp 3-Band EQ in real-time
  useEffect(() => {
    if (audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      if (ampBassFilterRef.current) ampBassFilterRef.current.gain.setValueAtTime(ampBass, now);
      if (ampMidFilterRef.current) ampMidFilterRef.current.gain.setValueAtTime(ampMid, now);
      if (ampTrebleFilterRef.current) ampTrebleFilterRef.current.gain.setValueAtTime(ampTreble, now);
    }
  }, [ampBass, ampMid, ampTreble]);

  // Update Cabinet Filter settings in real-time
  useEffect(() => {
    if (audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const hp = cabHPRef.current;
      const presence = cabPresenceRef.current;
      const lp = cabLPRef.current;

      if (hp && presence && lp) {
        if (cabType === 'bypass') {
          hp.frequency.setValueAtTime(10, now);
          presence.gain.setValueAtTime(0, now);
          lp.frequency.setValueAtTime(22000, now);
        } else if (cabType === 'tweed') {
          hp.frequency.setValueAtTime(100, now);
          presence.frequency.setValueAtTime(2000, now);
          presence.gain.setValueAtTime(4, now);
          lp.frequency.setValueAtTime(4500, now);
        } else if (cabType === 'stack') {
          hp.frequency.setValueAtTime(75, now);
          presence.frequency.setValueAtTime(3000, now);
          presence.gain.setValueAtTime(6, now);
          lp.frequency.setValueAtTime(6000, now);
        } else if (cabType === 'combo') {
          hp.frequency.setValueAtTime(120, now);
          presence.frequency.setValueAtTime(3500, now);
          presence.gain.setValueAtTime(3, now);
          lp.frequency.setValueAtTime(5000, now);
        }
      }
    }
  }, [cabType]);

  const grCanvasRef = useRef(null);
  const grAnimationRef = useRef(null);

  // Update Compressor Parameters in real-time
  useEffect(() => {
    if (compNodeRef.current && compMakeupNodeRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const comp = compNodeRef.current;
      const makeup = compMakeupNodeRef.current;

      if (compOn) {
        comp.threshold.setValueAtTime(compThreshold, now);
        comp.ratio.setValueAtTime(compRatio, now);
        comp.attack.setValueAtTime(compAttack, now);
        comp.release.setValueAtTime(compRelease, now);
        
        const makeupGainVal = Math.pow(10, compMakeup / 20);
        makeup.gain.setValueAtTime(makeupGainVal, now);
      } else {
        // Bypass values
        comp.threshold.setValueAtTime(0, now);
        comp.ratio.setValueAtTime(1.0, now);
        makeup.gain.setValueAtTime(1.0, now);
      }
    }
  }, [compOn, compThreshold, compRatio, compAttack, compRelease, compMakeup]);

  // Gain Reduction Meter Animation Loop
  useEffect(() => {
    const canvas = grCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Pre-allocated gradient to prevent heap allocations at 60 FPS
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#00ffaa'); // Green for low compression
    grad.addColorStop(0.5, '#ffe600'); // Yellow for medium
    grad.addColorStop(1, '#ff0055'); // Red for heavy compression
    
    let active = true;
    const updateGrMeter = () => {
      if (!active) return;
      
      // Clear canvas
      ctx.fillStyle = '#070a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Read current reduction in dB
      let reduction = 0;
      if (compOn && compNodeRef.current) {
        reduction = compNodeRef.current.reduction;
        if (typeof reduction === 'object' && reduction.value !== undefined) {
          reduction = reduction.value;
        }
      }

      // Convert negative dB (e.g. -24 to 0) to a positive meter width.
      const maxDb = 24;
      const absDb = Math.abs(reduction);
      const pct = Math.min(1.0, absDb / maxDb);
      
      // Draw grid ticks
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; ++i) {
        const x = (i / 4) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      if (pct > 0.01) {
        const barWidth = pct * canvas.width;
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, barWidth, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px Courier New';
        ctx.fillText(`GR: -${absDb.toFixed(1)} dB`, 5, canvas.height - 4);
      } else {
        ctx.fillStyle = 'rgba(0, 255, 170, 0.4)';
        ctx.font = '8px Courier New';
        ctx.fillText('GR: 0.0 dB', 5, canvas.height - 4);
      }

      grAnimationRef.current = requestAnimationFrame(updateGrMeter);
    };

    updateGrMeter();

    return () => {
      active = false;
      if (grAnimationRef.current) {
        cancelAnimationFrame(grAnimationRef.current);
      }
    };
  }, [compOn, fxTab]);

  // --- Start & Stop Synth Audio Engine ---
  const startSynth = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      // Use shared audio context if available
      let ctx = window.__rdAudioContext;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AudioContext({ latencyHint: 'interactive' });
        window.__rdAudioContext = ctx;
      }
      audioCtxRef.current = ctx;

      // Apply saved output sink device if present and supported
      const savedSink = localStorage.getItem('deltaiv_audio_sink') || 'default';
      if (savedSink !== 'default' && typeof ctx.setSinkId === 'function') {
        ctx.setSinkId(savedSink).catch(err => console.error("Error setting initial sink ID:", err));
      }

      globalAudioNodesRef.current = [];
      const trackNode = (node) => {
        if (node) globalAudioNodesRef.current.push(node);
        return node;
      };
      const makeMono = (node) => {
        if (node) {
          node.channelCount = 1;
          node.channelCountMode = 'explicit';
          globalAudioNodesRef.current.push(node);
        }
        return node;
      };

      const master = trackNode(ctx.createGain());
      master.gain.setValueAtTime(volume, ctx.currentTime);
      masterGainRef.current = master;

      // DeepMind HPF Bass Boost Filter Node
      const bassBoostNode = trackNode(ctx.createBiquadFilter());
      bassBoostNode.type = 'lowshelf';
      bassBoostNode.frequency.setValueAtTime(80, ctx.currentTime);
      bassBoostNode.gain.setValueAtTime(hpfBassBoost ? 6.5 : 0, ctx.currentTime);
      bassBoostNodeRef.current = bassBoostNode;

      // Space Echo Delay (mono loop in parallel)
      const echoDelay = trackNode(ctx.createDelay(2.0));
      echoDelay.delayTime.setValueAtTime(delayTime, ctx.currentTime);
      delayNodeRef.current = echoDelay;

      const echoFeedback = trackNode(ctx.createGain());
      echoFeedback.gain.setValueAtTime(delayFeedback, ctx.currentTime);
      delayFeedbackRef.current = echoFeedback;

      const echoWetGain = trackNode(ctx.createGain());
      echoWetGain.gain.setValueAtTime(delayMix, ctx.currentTime);
      delayWetRef.current = echoWetGain;

      // Vectorscope Analysers
      const analyser = trackNode(ctx.createAnalyser());
      analyser.fftSize = 1024;
      analyserRef.current = analyser;

      const analyserL = trackNode(ctx.createAnalyser());
      analyserL.fftSize = 1024;
      analyserLRef.current = analyserL;

      const analyserR = trackNode(ctx.createAnalyser());
      analyserR.fftSize = 1024;
      analyserRRef.current = analyserR;

      // Stereo Chorus
      const splitter = trackNode(ctx.createChannelSplitter(2));
      const merger = trackNode(ctx.createChannelMerger(2));
      const delayL = trackNode(ctx.createDelay(0.1));
      delayL.delayTime.setValueAtTime(0.018, ctx.currentTime);
      const delayR = trackNode(ctx.createDelay(0.1));
      delayR.delayTime.setValueAtTime(0.024, ctx.currentTime);

      const chorusLfo = trackNode(ctx.createOscillator());
      chorusLfo.type = 'sine';
      chorusLfo.frequency.setValueAtTime(1.5, ctx.currentTime);
      chorusLfoRef.current = chorusLfo;

      const lfoGainL = trackNode(ctx.createGain());
      lfoGainL.gain.setValueAtTime(chorusDepth * 0.002, ctx.currentTime);
      const lfoGainR = trackNode(ctx.createGain());
      lfoGainR.gain.setValueAtTime(-chorusDepth * 0.002, ctx.currentTime);

      chorusLfo.connect(lfoGainL);
      chorusLfo.connect(lfoGainR);
      lfoGainL.connect(delayL.delayTime);
      lfoGainR.connect(delayR.delayTime);

      const chorusWetL = trackNode(ctx.createGain());
      const chorusWetR = trackNode(ctx.createGain());
      chorusWetL.gain.setValueAtTime(chorusDepth, ctx.currentTime);
      chorusWetR.gain.setValueAtTime(chorusDepth, ctx.currentTime);
      chorusWetLRef.current = chorusWetL;
      chorusWetRRef.current = chorusWetR;

      delayL.connect(chorusWetL);
      delayR.connect(chorusWetR);

      const dryL = trackNode(ctx.createGain());
      const dryR = trackNode(ctx.createGain());
      dryL.gain.setValueAtTime(1 - chorusDepth, ctx.currentTime);
      dryR.gain.setValueAtTime(1 - chorusDepth, ctx.currentTime);

      master.connect(bassBoostNode);
      bassBoostNode.connect(dryL);
      bassBoostNode.connect(dryR);

      bassBoostNode.connect(delayL);
      bassBoostNode.connect(delayR);

      dryL.connect(merger, 0, 0);
      dryR.connect(merger, 0, 1);

      chorusWetL.connect(merger, 0, 0);
      chorusWetR.connect(merger, 0, 1);

      // --- Phaser Stage ---
      const phaserSplitter = trackNode(ctx.createChannelSplitter(2));
      const phaserMerger = trackNode(ctx.createChannelMerger(2));
      merger.connect(phaserSplitter);

      const apL1 = trackNode(ctx.createBiquadFilter()); apL1.type = 'allpass';
      const apL2 = trackNode(ctx.createBiquadFilter()); apL2.type = 'allpass';
      const apL3 = trackNode(ctx.createBiquadFilter()); apL3.type = 'allpass';
      const apL4 = trackNode(ctx.createBiquadFilter()); apL4.type = 'allpass';
      apL1.frequency.setValueAtTime(1000, ctx.currentTime);
      apL2.frequency.setValueAtTime(1000, ctx.currentTime);
      apL3.frequency.setValueAtTime(1000, ctx.currentTime);
      apL4.frequency.setValueAtTime(1000, ctx.currentTime);

      const apR1 = trackNode(ctx.createBiquadFilter()); apR1.type = 'allpass';
      const apR2 = trackNode(ctx.createBiquadFilter()); apR2.type = 'allpass';
      const apR3 = trackNode(ctx.createBiquadFilter()); apR3.type = 'allpass';
      const apR4 = trackNode(ctx.createBiquadFilter()); apR4.type = 'allpass';
      apR1.frequency.setValueAtTime(1000, ctx.currentTime);
      apR2.frequency.setValueAtTime(1000, ctx.currentTime);
      apR3.frequency.setValueAtTime(1000, ctx.currentTime);
      apR4.frequency.setValueAtTime(1000, ctx.currentTime);

      phaserApLRef.current = [apL1, apL2, apL3, apL4];
      phaserApRRef.current = [apR1, apR2, apR3, apR4];

      phaserSplitter.connect(apL1, 0);
      apL1.connect(apL2); apL2.connect(apL3); apL3.connect(apL4);

      phaserSplitter.connect(apR1, 1);
      apR1.connect(apR2); apR2.connect(apR3); apR3.connect(apR4);

      const phaserLfo = trackNode(ctx.createOscillator());
      phaserLfo.type = 'sine';
      phaserLfo.frequency.setValueAtTime(phaserRate, ctx.currentTime);
      phaserLfoRef.current = phaserLfo;

      const phaserLfoGainL = trackNode(ctx.createGain());
      phaserLfoGainL.gain.setValueAtTime(800, ctx.currentTime);
      const phaserLfoGainR = trackNode(ctx.createGain());
      phaserLfoGainR.gain.setValueAtTime(-800, ctx.currentTime);

      phaserLfo.connect(phaserLfoGainL);
      phaserLfo.connect(phaserLfoGainR);
      [apL1, apL2, apL3, apL4].forEach(ap => phaserLfoGainL.connect(ap.frequency));
      [apR1, apR2, apR3, apR4].forEach(ap => phaserLfoGainR.connect(ap.frequency));
      phaserLfo.start();

      const phaserWetL = trackNode(ctx.createGain());
      const phaserWetR = trackNode(ctx.createGain());
      phaserWetL.gain.setValueAtTime(phaserMix, ctx.currentTime);
      phaserWetR.gain.setValueAtTime(phaserMix, ctx.currentTime);
      phaserWetRef.current = phaserWetL;

      const phaserDryL = trackNode(ctx.createGain());
      const phaserDryR = trackNode(ctx.createGain());
      phaserDryL.gain.setValueAtTime(1 - phaserMix, ctx.currentTime);
      phaserDryR.gain.setValueAtTime(1 - phaserMix, ctx.currentTime);
      phaserDryRef.current = phaserDryL;

      apL4.connect(phaserWetL);
      apR4.connect(phaserWetR);

      phaserSplitter.connect(phaserDryL, 0);
      phaserSplitter.connect(phaserDryR, 1);

      phaserWetL.connect(phaserMerger, 0, 0);
      phaserWetR.connect(phaserMerger, 0, 1);
      phaserDryL.connect(phaserMerger, 0, 0);
      phaserDryR.connect(phaserMerger, 0, 1);

      // --- Flanger Stage ---
      const flangerSplitter = trackNode(ctx.createChannelSplitter(2));
      const flangerMerger = trackNode(ctx.createChannelMerger(2));
      phaserMerger.connect(flangerSplitter);

      const flangerDelayL = trackNode(ctx.createDelay(0.1));
      flangerDelayL.delayTime.setValueAtTime(0.005, ctx.currentTime);
      const flangerDelayR = trackNode(ctx.createDelay(0.1));
      flangerDelayR.delayTime.setValueAtTime(0.005, ctx.currentTime);
      flangerDelayLRef.current = flangerDelayL;
      flangerDelayRRef.current = flangerDelayR;

      const flangerFeedbackL = trackNode(ctx.createGain());
      flangerFeedbackL.gain.setValueAtTime(flangerFeedback, ctx.currentTime);
      const flangerFeedbackR = trackNode(ctx.createGain());
      flangerFeedbackR.gain.setValueAtTime(flangerFeedback, ctx.currentTime);
      flangerFeedbackLRef.current = flangerFeedbackL;
      flangerFeedbackRRef.current = flangerFeedbackR;

      flangerDelayL.connect(flangerFeedbackL);
      flangerFeedbackL.connect(flangerDelayL);
      flangerDelayR.connect(flangerFeedbackR);
      flangerFeedbackR.connect(flangerDelayR);

      const flangerLfo = trackNode(ctx.createOscillator());
      flangerLfo.type = 'sine';
      flangerLfo.frequency.setValueAtTime(flangerRate, ctx.currentTime);
      flangerLfoRef.current = flangerLfo;

      const flangerLfoGainL = trackNode(ctx.createGain());
      flangerLfoGainL.gain.setValueAtTime(0.003, ctx.currentTime);
      const flangerLfoGainR = trackNode(ctx.createGain());
      flangerLfoGainR.gain.setValueAtTime(-0.003, ctx.currentTime);

      flangerLfo.connect(flangerLfoGainL);
      flangerLfo.connect(flangerLfoGainR);
      flangerLfoGainL.connect(flangerDelayL.delayTime);
      flangerLfoGainR.connect(flangerDelayR.delayTime);
      flangerLfo.start();

      const flangerWetL = trackNode(ctx.createGain());
      const flangerWetR = trackNode(ctx.createGain());
      flangerWetL.gain.setValueAtTime(flangerMix, ctx.currentTime);
      flangerWetR.gain.setValueAtTime(flangerMix, ctx.currentTime);
      flangerWetRef.current = flangerWetL;

      const flangerDryL = trackNode(ctx.createGain());
      const flangerDryR = trackNode(ctx.createGain());
      flangerDryL.gain.setValueAtTime(1 - flangerMix, ctx.currentTime);
      flangerDryR.gain.setValueAtTime(1 - flangerMix, ctx.currentTime);
      flangerDryRef.current = flangerDryL;

      flangerSplitter.connect(flangerDelayL, 0);
      flangerSplitter.connect(flangerDelayR, 1);
      flangerDelayL.connect(flangerWetL);
      flangerDelayR.connect(flangerWetR);

      flangerSplitter.connect(flangerDryL, 0);
      flangerSplitter.connect(flangerDryR, 1);

      flangerWetL.connect(flangerMerger, 0, 0);
      flangerWetR.connect(flangerMerger, 0, 1);
      flangerDryL.connect(flangerMerger, 0, 0);
      flangerDryR.connect(flangerMerger, 0, 1);

      // --- Echo Delay Stage ---
      echoDelay.connect(echoFeedback);
      echoFeedback.connect(echoDelay);

      flangerMerger.connect(echoDelay);
      echoDelay.connect(echoWetGain);

      const spaceMerger = trackNode(ctx.createGain());
      flangerMerger.connect(spaceMerger);
      echoWetGain.connect(spaceMerger);

      // --- Reverb Stage ---
      const convolver = trackNode(ctx.createConvolver());
      convolver.buffer = createReverbBuffer(ctx, reverbDecay);
      reverbConvolverRef.current = convolver;

      const reverbWet = trackNode(ctx.createGain());
      reverbWet.gain.setValueAtTime(reverbMix * 0.7, ctx.currentTime);
      reverbWetRef.current = reverbWet;

      const reverbDry = trackNode(ctx.createGain());
      reverbDry.gain.setValueAtTime(1 - reverbMix, ctx.currentTime);
      reverbDryRef.current = reverbDry;

      spaceMerger.connect(convolver);
      convolver.connect(reverbWet);
      spaceMerger.connect(reverbDry);

      const finalSum = trackNode(ctx.createGain());
      reverbWet.connect(finalSum);
      reverbDry.connect(finalSum);

      // Create Amp Pre-Gain node
      const ampPreGain = trackNode(ctx.createGain());
      ampPreGain.gain.setValueAtTime(ampDrive, ctx.currentTime);
      ampPreGainRef.current = ampPreGain;

      // Master distortion waveshaper (Drive + Saturation)
      const masterDistortion = trackNode(ctx.createWaveShaper());
      masterDistortion.curve = makeMasterDistortionCurve(saturationMode, saturationAmount);
      masterDistortion.oversample = '4x';
      masterDistortionRef.current = masterDistortion;

      // Amp 3-Band EQ Filters
      const ampBassFilter = trackNode(ctx.createBiquadFilter());
      ampBassFilter.type = 'lowshelf';
      ampBassFilter.frequency.setValueAtTime(150, ctx.currentTime);
      ampBassFilter.gain.setValueAtTime(ampBass, ctx.currentTime);
      ampBassFilterRef.current = ampBassFilter;

      const ampMidFilter = trackNode(ctx.createBiquadFilter());
      ampMidFilter.type = 'peaking';
      ampMidFilter.frequency.setValueAtTime(800, ctx.currentTime);
      ampMidFilter.Q.setValueAtTime(1.0, ctx.currentTime);
      ampMidFilter.gain.setValueAtTime(ampMid, ctx.currentTime);
      ampMidFilterRef.current = ampMidFilter;

      const ampTrebleFilter = trackNode(ctx.createBiquadFilter());
      ampTrebleFilter.type = 'highshelf';
      ampTrebleFilter.frequency.setValueAtTime(4000, ctx.currentTime);
      ampTrebleFilter.gain.setValueAtTime(ampTreble, ctx.currentTime);
      ampTrebleFilterRef.current = ampTrebleFilter;

      // Cabinet Simulation Filters (HPF, Presence, LPF)
      const cabHP = trackNode(ctx.createBiquadFilter());
      cabHP.type = 'highpass';
      cabHPRef.current = cabHP;

      const cabPresence = trackNode(ctx.createBiquadFilter());
      cabPresence.type = 'peaking';
      cabPresence.Q.setValueAtTime(1.0, ctx.currentTime);
      cabPresenceRef.current = cabPresence;

      const cabLP = trackNode(ctx.createBiquadFilter());
      cabLP.type = 'lowpass';
      cabLPRef.current = cabLP;

      // Apply initial Cabinet filter coefficients based on selected cabType
      const initNow = ctx.currentTime;
      if (cabType === 'bypass') {
        cabHP.frequency.setValueAtTime(10, initNow);
        cabPresence.gain.setValueAtTime(0, initNow);
        cabLP.frequency.setValueAtTime(22000, initNow);
      } else if (cabType === 'tweed') {
        cabHP.frequency.setValueAtTime(100, initNow);
        cabPresence.frequency.setValueAtTime(2000, initNow);
        cabPresence.gain.setValueAtTime(4, initNow);
        cabLP.frequency.setValueAtTime(4500, initNow);
      } else if (cabType === 'stack') {
        cabHP.frequency.setValueAtTime(75, initNow);
        cabPresence.frequency.setValueAtTime(3000, initNow);
        cabPresence.gain.setValueAtTime(6, initNow);
        cabLP.frequency.setValueAtTime(6000, initNow);
      } else if (cabType === 'combo') {
        cabHP.frequency.setValueAtTime(120, initNow);
        cabPresence.frequency.setValueAtTime(3500, initNow);
        cabPresence.gain.setValueAtTime(3, initNow);
        cabLP.frequency.setValueAtTime(5000, initNow);
      }

      // Create dynamics compressor node
      const compressor = trackNode(ctx.createDynamicsCompressor());
      compressor.knee.setValueAtTime(15, ctx.currentTime); // moderate knee
      
      // Create makeup gain node
      const compMakeupNode = trackNode(ctx.createGain());
      
      // Set initial values based on compOn
      const initNowComp = ctx.currentTime;
      if (compOn) {
        compressor.threshold.setValueAtTime(compThreshold, initNowComp);
        compressor.ratio.setValueAtTime(compRatio, initNowComp);
        compressor.attack.setValueAtTime(compAttack, initNowComp);
        compressor.release.setValueAtTime(compRelease, initNowComp);
        const makeupGainVal = Math.pow(10, compMakeup / 20);
        compMakeupNode.gain.setValueAtTime(makeupGainVal, initNowComp);
      } else {
        // Bypass values
        compressor.threshold.setValueAtTime(0, initNowComp);
        compressor.ratio.setValueAtTime(1.0, initNowComp);
        compMakeupNode.gain.setValueAtTime(1.0, initNowComp);
      }
      
      compNodeRef.current = compressor;
      compMakeupNodeRef.current = compMakeupNode;

      // Connect the preamp, EQ, cabinet, and compressor in series
      finalSum.connect(ampPreGain);
      ampPreGain.connect(masterDistortion);
      masterDistortion.connect(ampBassFilter);
      ampBassFilter.connect(ampMidFilter);
      ampMidFilter.connect(ampTrebleFilter);
      ampTrebleFilter.connect(cabHP);
      cabHP.connect(cabPresence);
      cabPresence.connect(cabLP);
      cabLP.connect(compressor);
      compressor.connect(compMakeupNode);

      // --- Haas & Stereo Width Stage ---
      // Split the stereo distortion + EQ + cabinet + compressor output
      const postDistSplitter = trackNode(ctx.createChannelSplitter(2));
      compMakeupNode.connect(postDistSplitter);

      // Haas Delay Line (Make Mono)
      const haasLeft = makeMono(ctx.createGain());
      const haasRight = makeMono(ctx.createGain());
      haasLeftRef.current = haasLeft;
      haasRightRef.current = haasRight;

      // Apply initial precedence compensation to haasLeft/Right gains
      const initialHaasFactor = 3.5;
      const initialLeftGain = 1.0 - (haasDelay * initialHaasFactor);
      const initialRightGain = 1.0 + (haasDelay * initialHaasFactor);
      haasLeft.gain.setValueAtTime(initialLeftGain, ctx.currentTime);
      haasRight.gain.setValueAtTime(initialRightGain, ctx.currentTime);
      
      const haasDelayNode = makeMono(ctx.createDelay(0.1));
      haasDelayNode.delayTime.setValueAtTime(haasDelay, ctx.currentTime);
      haasDelayNodeRef.current = haasDelayNode;

      postDistSplitter.connect(haasLeft, 0); // L channel directly
      postDistSplitter.connect(haasDelayNode, 1); // R channel through delay
      haasDelayNode.connect(haasRight);

      // Mid-Side Matrix (Make Mono)
      const midSum = makeMono(ctx.createGain());
      const sideDiff = makeMono(ctx.createGain());

      const gainL_to_mid = makeMono(ctx.createGain());
      gainL_to_mid.gain.setValueAtTime(0.5, ctx.currentTime);
      const gainR_to_mid = makeMono(ctx.createGain());
      gainR_to_mid.gain.setValueAtTime(0.5, ctx.currentTime);

      const gainL_to_side = makeMono(ctx.createGain());
      gainL_to_side.gain.setValueAtTime(0.5, ctx.currentTime);
      const gainR_to_side = makeMono(ctx.createGain());
      gainR_to_side.gain.setValueAtTime(-0.5, ctx.currentTime);

      haasLeft.connect(gainL_to_mid);
      gainL_to_mid.connect(midSum);

      haasRight.connect(gainR_to_mid);
      gainR_to_mid.connect(midSum);

      haasLeft.connect(gainL_to_side);
      gainL_to_side.connect(sideDiff);

      haasRight.connect(gainR_to_side);
      gainR_to_side.connect(sideDiff);

      // Mid-Side Gain Scaling (Make Mono)
      const midScale = makeMono(ctx.createGain());
      const midGainVal = Math.min(1.0, 2.0 - stereoWidth);
      midScale.gain.setValueAtTime(midGainVal, ctx.currentTime);
      midScaleRef.current = midScale;

      const sideScale = makeMono(ctx.createGain());
      const sideGainVal = Math.min(1.0, stereoWidth);
      sideScale.gain.setValueAtTime(sideGainVal, ctx.currentTime);
      sideScaleRef.current = sideScale;

      midSum.connect(midScale);
      sideDiff.connect(sideScale);

      // Reconstruct Left and Right from Mid/Side (Make Mono)
      const outL = makeMono(ctx.createGain());
      const outR = makeMono(ctx.createGain());

      const sideInverter = makeMono(ctx.createGain());
      sideInverter.gain.setValueAtTime(-1.0, ctx.currentTime);
      sideScale.connect(sideInverter);

      midScale.connect(outL);
      sideScale.connect(outL);

      midScale.connect(outR);
      sideInverter.connect(outR);

      // Merge back to stereo output
      const stereoMerger = trackNode(ctx.createChannelMerger(2));
      outL.connect(stereoMerger, 0, 0);
      outR.connect(stereoMerger, 0, 1);

      // Connect to final analyser and destination
      stereoMerger.connect(analyser);
      analyser.connect(ctx.destination);

      const finalSplitter = trackNode(ctx.createChannelSplitter(2));
      stereoMerger.connect(finalSplitter);
      finalSplitter.connect(analyserL, 0);
      finalSplitter.connect(analyserR, 1);

      // Expose the final output node for DeltaDecks sampling
      window.__rdSynthOutputNode = stereoMerger;

      chorusLfo.start();

      currentShValue.current = 0;
      if (shIntervalRef.current) clearInterval(shIntervalRef.current);
      shIntervalRef.current = setInterval(() => {
        currentShValue.current = Math.random() * 2 - 1;
        const now = ctx.currentTime;
        activeVoices.current.forEach(voice => {
          const startCutoff = paramsRef.current.cutoff + (currentShValue.current * paramsRef.current.shAmount);
          voice.filter.frequency.setValueAtTime(startCutoff, now);
        });
      }, 1000 / lfoRate);

      startOscilloscope(analyser);
      setSynthOn(true);
    } catch (e) {
      console.error("Failed to start synth:", e);
    }
  };

  const stopSynth = () => {
    try {
      if (shIntervalRef.current) {
        clearInterval(shIntervalRef.current);
        shIntervalRef.current = null;
      }
      if (chorusLfoRef.current) {
        chorusLfoRef.current.stop();
        chorusLfoRef.current = null;
      }
      if (phaserLfoRef.current) {
        phaserLfoRef.current.stop();
        phaserLfoRef.current = null;
      }
      if (flangerLfoRef.current) {
        flangerLfoRef.current.stop();
        flangerLfoRef.current = null;
      }
      activeVoices.current.forEach(voice => {
        try {
          voice.osc1.stop();
          voice.osc2.stop();
          if (voice.subOsc) voice.subOsc.stop();
          if (voice.noiseSource) voice.noiseSource.stop();
          if (voice.lfo) voice.lfo.stop();
          if (voice.lfo2) voice.lfo2.stop();
          if (voice.driftLfo) voice.driftLfo.stop();
          // Disconnect voice nodes immediately on hard stop
          voice.voiceGain.disconnect();
          voice.osc1.disconnect();
          if (voice.osc1Dig) voice.osc1Dig.disconnect();
          voice.osc2.disconnect();
          if (voice.osc2Dig) voice.osc2Dig.disconnect();
          if (voice.subOsc) voice.subOsc.disconnect();
          if (voice.noiseSource) voice.noiseSource.disconnect();
          if (voice.filter) voice.filter.disconnect();
          if (voice.filter2) voice.filter2.disconnect();
          if (voice.lfo) voice.lfo.disconnect();
          if (voice.lfo2) voice.lfo2.disconnect();
          if (voice.driftLfo) voice.driftLfo.disconnect();
        } catch (err) {}
      });
      activeVoices.current.clear();

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // Cleanup global tracked nodes to prevent context-bound memory leaks
      if (globalAudioNodesRef.current) {
        globalAudioNodesRef.current.forEach(node => {
          try {
            node.disconnect();
          } catch (e) {}
        });
        globalAudioNodesRef.current = [];
      }

      // Cleanup routing references
      if (window.__rdSynthOutputNode) {
        window.__rdSynthOutputNode = null;
      }
      masterDistortionRef.current = null;
      ampPreGainRef.current = null;
      ampBassFilterRef.current = null;
      ampMidFilterRef.current = null;
      ampTrebleFilterRef.current = null;
      cabHPRef.current = null;
      cabPresenceRef.current = null;
      cabLPRef.current = null;
      compNodeRef.current = null;
      compMakeupNodeRef.current = null;
      haasDelayNodeRef.current = null;
      midScaleRef.current = null;
      sideScaleRef.current = null;
      haasLeftRef.current = null;
      haasRightRef.current = null;

      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        if (audioCtxRef.current !== window.__rdAudioContext) {
          audioCtxRef.current.close();
        }
      }
      audioCtxRef.current = null;
      setSynthOn(false);
    } catch (e) {
      console.error("Failed to stop synth:", e);
    }
  };

  // Dynamic Parameter Sync Effects
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.01);
    }
  }, [volume]);

  useEffect(() => {
    if (bassBoostNodeRef.current && audioCtxRef.current) {
      bassBoostNodeRef.current.gain.setTargetAtTime(hpfBassBoost ? 6.5 : 0, audioCtxRef.current.currentTime, 0.02);
    }
  }, [hpfBassBoost]);

  useEffect(() => {
    if (delayNodeRef.current && audioCtxRef.current) {
      delayNodeRef.current.delayTime.setTargetAtTime(delayTime, audioCtxRef.current.currentTime, 0.05);
    }
  }, [delayTime]);

  useEffect(() => {
    if (delayFeedbackRef.current && audioCtxRef.current) {
      delayFeedbackRef.current.gain.setTargetAtTime(delayFeedback, audioCtxRef.current.currentTime, 0.02);
    }
  }, [delayFeedback]);

  useEffect(() => {
    if (delayWetRef.current && audioCtxRef.current) {
      delayWetRef.current.gain.setTargetAtTime(delayMix, audioCtxRef.current.currentTime, 0.02);
    }
  }, [delayMix]);

  useEffect(() => {
    if (chorusWetLRef.current && chorusWetRRef.current && audioCtxRef.current) {
      chorusWetLRef.current.gain.setTargetAtTime(chorusDepth, audioCtxRef.current.currentTime, 0.02);
      chorusWetRRef.current.gain.setTargetAtTime(chorusDepth, audioCtxRef.current.currentTime, 0.02);
    }
  }, [chorusDepth]);

  useEffect(() => {
    if (phaserWetRef.current && phaserDryRef.current && audioCtxRef.current) {
      phaserWetRef.current.gain.setTargetAtTime(phaserMix, audioCtxRef.current.currentTime, 0.02);
      phaserDryRef.current.gain.setTargetAtTime(1 - phaserMix, audioCtxRef.current.currentTime, 0.02);
    }
  }, [phaserMix]);

  useEffect(() => {
    if (phaserLfoRef.current && audioCtxRef.current) {
      phaserLfoRef.current.frequency.setTargetAtTime(phaserRate, audioCtxRef.current.currentTime, 0.05);
    }
  }, [phaserRate]);

  useEffect(() => {
    if (flangerWetRef.current && flangerDryRef.current && audioCtxRef.current) {
      flangerWetRef.current.gain.setTargetAtTime(flangerMix, audioCtxRef.current.currentTime, 0.02);
      flangerDryRef.current.gain.setTargetAtTime(1 - flangerMix, audioCtxRef.current.currentTime, 0.02);
    }
  }, [flangerMix]);

  useEffect(() => {
    if (flangerLfoRef.current && audioCtxRef.current) {
      flangerLfoRef.current.frequency.setTargetAtTime(flangerRate, audioCtxRef.current.currentTime, 0.05);
    }
  }, [flangerRate]);

  useEffect(() => {
    if (flangerFeedbackLRef.current && flangerFeedbackRRef.current && audioCtxRef.current) {
      flangerFeedbackLRef.current.gain.setTargetAtTime(flangerFeedback, audioCtxRef.current.currentTime, 0.02);
      flangerFeedbackRRef.current.gain.setTargetAtTime(flangerFeedback, audioCtxRef.current.currentTime, 0.02);
    }
  }, [flangerFeedback]);

  useEffect(() => {
    if (reverbWetRef.current && reverbDryRef.current && audioCtxRef.current) {
      reverbWetRef.current.gain.setTargetAtTime(reverbMix * 0.7, audioCtxRef.current.currentTime, 0.02);
      reverbDryRef.current.gain.setTargetAtTime(1 - reverbMix, audioCtxRef.current.currentTime, 0.02);
    }
  }, [reverbMix]);

  useEffect(() => {
    if (reverbConvolverRef.current && audioCtxRef.current) {
      try {
        reverbConvolverRef.current.buffer = createReverbBuffer(audioCtxRef.current, reverbDecay);
      } catch (err) {}
    }
  }, [reverbDecay]);

  useEffect(() => {
    if (synthOn && audioCtxRef.current) {
      if (shIntervalRef.current) clearInterval(shIntervalRef.current);
      shIntervalRef.current = setInterval(() => {
        currentShValue.current = Math.random() * 2 - 1;
        const now = audioCtxRef.current.currentTime;
        activeVoices.current.forEach(voice => {
          const startCutoff = paramsRef.current.cutoff + (currentShValue.current * paramsRef.current.shAmount);
          voice.filter.frequency.setValueAtTime(startCutoff, now);
        });
      }, 1000 / lfoRate);
    }
  }, [lfoRate, synthOn]);

  useEffect(() => {
    return () => {
      if (shIntervalRef.current) clearInterval(shIntervalRef.current);
      if (arpTimer.current) {
        clearInterval(arpTimer.current);
        arpTimer.current = null;
      }
      activeVoices.current.forEach(voice => {
        try {
          voice.osc1.stop();
          voice.osc2.stop();
          if (voice.subOsc) voice.subOsc.stop();
          if (voice.noiseSource) voice.noiseSource.stop();
          if (voice.lfo) voice.lfo.stop();
          if (voice.driftLfo) voice.driftLfo.stop();
          voice.voiceGain.disconnect();
          voice.osc1.disconnect();
          if (voice.osc1Dig) voice.osc1Dig.disconnect();
          voice.osc2.disconnect();
          if (voice.osc2Dig) voice.osc2Dig.disconnect();
          if (voice.subOsc) voice.subOsc.disconnect();
          if (voice.noiseSource) voice.noiseSource.disconnect();
          if (voice.filter) voice.filter.disconnect();
          if (voice.filter2) voice.filter2.disconnect();
        } catch (err) {}
      });
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      // Cleanup global tracked nodes
      if (globalAudioNodesRef.current) {
        globalAudioNodesRef.current.forEach(node => {
          try {
            node.disconnect();
          } catch (e) {}
        });
        globalAudioNodesRef.current = [];
      }

      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
      window.__rdAudioContext = null;
    };
  }, []);

  // --- Arpeggiator Step Loop Scheduler ---
  useEffect(() => {
    if (!synthOn || !arpOn) {
      if (arpTimer.current) {
        clearInterval(arpTimer.current);
        arpTimer.current = null;
      }
      if (activeArpNote.current !== null) {
        if (Array.isArray(activeArpNote.current)) {
          activeArpNote.current.forEach(n => handleNoteOff(n));
        } else {
          handleNoteOff(activeArpNote.current);
        }
        activeArpNote.current = null;
      }
      return;
    }

    const beatLen = 60000 / arpBpm;
    let stepMs = beatLen;
    if (arpDivision === 1) stepMs = beatLen * 4;
    else if (arpDivision === 2) stepMs = beatLen * 2;
    else if (arpDivision === 4) stepMs = beatLen;
    else if (arpDivision === 8) stepMs = beatLen * 0.5;
    else if (arpDivision === 12) stepMs = beatLen * (1 / 3);
    else if (arpDivision === 16) stepMs = beatLen * 0.25;
    else if (arpDivision === 24) stepMs = beatLen * (1 / 6);
    else if (arpDivision === 32) stepMs = beatLen * 0.125;
    else if (arpDivision === 64) stepMs = beatLen * 0.0625;
    else if (arpDivision === 128) stepMs = beatLen * 0.03125;

    let upDirection = true;

    if (arpTimer.current) clearInterval(arpTimer.current);

    arpTimer.current = setInterval(() => {
      const notes = [...arpHeldNotes.current];
      if (notes.length === 0) {
        if (activeArpNote.current !== null) {
          if (Array.isArray(activeArpNote.current)) {
            activeArpNote.current.forEach(n => handleNoteOff(n));
          } else {
            handleNoteOff(activeArpNote.current);
          }
          activeArpNote.current = null;
        }
        return;
      }

      notes.sort((a, b) => a - b);
      let nextNote = notes[0];

      // Patterns: 'up', 'down', 'up-down', 'down-up', 'random', 'chord'
      if (arpPattern === 'up') {
        if (arpIndex.current >= notes.length) arpIndex.current = 0;
        nextNote = notes[arpIndex.current];
        arpIndex.current = (arpIndex.current + 1) % notes.length;
      } else if (arpPattern === 'down') {
        if (arpIndex.current >= notes.length) arpIndex.current = notes.length - 1;
        nextNote = notes[arpIndex.current];
        arpIndex.current = (arpIndex.current - 1 + notes.length) % notes.length;
      } else if (arpPattern === 'up-down') {
        if (notes.length === 1) {
          nextNote = notes[0];
        } else {
          if (arpIndex.current >= notes.length) {
            arpIndex.current = notes.length - 2;
            upDirection = false;
          }
          if (arpIndex.current < 0) {
            arpIndex.current = 1;
            upDirection = true;
          }
          nextNote = notes[arpIndex.current];
          arpIndex.current = upDirection ? arpIndex.current + 1 : arpIndex.current - 1;
        }
      } else if (arpPattern === 'down-up') {
        if (notes.length === 1) {
          nextNote = notes[0];
        } else {
          if (arpIndex.current >= notes.length) {
            arpIndex.current = 1;
            upDirection = true;
          }
          if (arpIndex.current < 0) {
            arpIndex.current = notes.length - 2;
            upDirection = false;
          }
          nextNote = notes[arpIndex.current];
          arpIndex.current = upDirection ? arpIndex.current + 1 : arpIndex.current - 1;
        }
      } else if (arpPattern === 'random') {
        const randIdx = Math.floor(Math.random() * notes.length);
        nextNote = notes[randIdx];
      }

      if (arpPattern === 'chord') {
        if (Array.isArray(activeArpNote.current)) {
          activeArpNote.current.forEach(n => handleNoteOff(n));
        } else if (activeArpNote.current !== null) {
          handleNoteOff(activeArpNote.current);
        }
        notes.forEach(n => handleNoteOn(n, 100));
        activeArpNote.current = notes;
      } else {
        if (Array.isArray(activeArpNote.current)) {
          activeArpNote.current.forEach(n => handleNoteOff(n));
        } else if (activeArpNote.current !== null) {
          handleNoteOff(activeArpNote.current);
        }
        handleNoteOn(nextNote, 100);
        activeArpNote.current = nextNote;
      }
    }, stepMs);

    return () => {
      if (arpTimer.current) clearInterval(arpTimer.current);
    };
  }, [synthOn, arpOn, arpBpm, arpPattern, arpDivision]);

  // --- Web MIDI Access & CC Controller Mapping ---
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(access => {
        const inputs = Array.from(access.inputs.values());
        setMidiDevices(inputs.map(i => i.name));
        if (inputs.length > 0) {
          setConnectedDevice(inputs[0].name);
        } else {
          setConnectedDevice('NO CONTROLLER DETECTED');
        }
        
        access.onstatechange = () => {
          const currentInputs = Array.from(access.inputs.values());
          setMidiDevices(currentInputs.map(i => i.name));
          if (currentInputs.length > 0) {
            setConnectedDevice(currentInputs[0].name);
          } else {
            setConnectedDevice('NO CONTROLLER DETECTED');
          }
        };
      }).catch(err => {
        console.warn("Could not access MIDI devices:", err);
      });
    }

    const handleGlobalMidi = (e) => {
      const { data, deviceName } = e.detail;
      const targetDevice = selectedMidiDeviceNameRef.current;
      if (targetDevice && targetDevice !== 'all' && deviceName !== targetDevice) {
        return;
      }
      if (deviceName && deviceName !== connectedDevice) {
        setConnectedDevice(deviceName);
      }
      onMIDIMessage({ data });
    };

    window.addEventListener('delta7_midi_message', handleGlobalMidi);

    const onMIDIMessage = (event) => {
      const [status, data1, data2] = event.data;
      const command = status & 0xf0;
      
      if (status < 240) {
        const channel = (status & 0x0f) + 1;
        const targetDevice = selectedMidiDeviceNameRef.current;
        const bypassChannelFilter = targetDevice && targetDevice !== 'all';
        if (!bypassChannelFilter && synthMidiChannelRef.current !== 0 && channel !== synthMidiChannelRef.current) {
          return;
        }
      }

      // Note On
      if (command === 144 && data2 > 0) {
        const noteName = getNoteName(data1);
        setLastMidiEvent(`NOTE ON: ${noteName} (vel: ${data2})`);
        
        if (arpOnRef.current) {
          if (!arpHeldNotes.current.includes(data1)) {
            arpHeldNotes.current = [...arpHeldNotes.current, data1];
          }
        } else {
          if (handleNoteOnRef.current) {
            handleNoteOnRef.current(data1, data2);
          }
        }
      }
      // Note Off
      else if (command === 128 || (command === 144 && data2 === 0)) {
        const noteName = getNoteName(data1);
        setLastMidiEvent(`NOTE OFF: ${noteName}`);
        
        if (arpOnRef.current) {
          arpHeldNotes.current = arpHeldNotes.current.filter(n => n !== data1);
        } else {
          if (handleNoteOffRef.current) {
            handleNoteOffRef.current(data1);
          }
        }
      }
      // Pitch Bend
      else if (command === 224) {
        const bendValue = (data2 << 7) | data1;
        const bendFactor = (bendValue - 8192) / 8192; // -1.0 to 1.0
        setPitchBend(bendFactor);
        setLastMidiEvent(`PITCH BEND: ${bendFactor.toFixed(2)}`);
      }
      // Control Change (CC)
      else if (command === 176) {
        const ccNumber = data1;
        const ccValue = data2;

        // Mod Wheel (CC 1)
        if (ccNumber === 1) {
          setModWheel(ccValue / 127);
          setLastMidiEvent(`MOD WHEEL: ${ccValue}`);
        }

        const currentMidiLearnParam = midiLearnParamRef.current;
        const currentMidiMappings = midiMappingsRef.current;

        if (currentMidiLearnParam !== null) {
          setMidiMappings(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
              if (next[key] === ccNumber) {
                next[key] = null;
              }
            });
            next[currentMidiLearnParam] = ccNumber;
            localStorage.setItem('deltavi_midi_mappings', JSON.stringify(next));
            return next;
          });
          setLastMidiEvent(`MAPPED CC: #${ccNumber} to ${currentMidiLearnParam.toUpperCase()}`);
          setMidiLearnParam(null);
          return;
        }

        // Ignore displaying CC 1 event since it updates modWheel directly
        if (ccNumber !== 1) {
          setLastMidiEvent(`CC: #${ccNumber} (val: ${ccValue})`);
        }

        const mappedParam = Object.keys(currentMidiMappings).find(key => currentMidiMappings[key] === ccNumber);
        if (mappedParam) {
          if (handleMidiParamChangeRef.current) {
            handleMidiParamChangeRef.current(mappedParam, ccValue);
          }
        }
      }
    };

    return () => {
      window.removeEventListener('delta7_midi_message', handleGlobalMidi);
    };
  }, []);

  // Load and save presets locally
  useEffect(() => {
    const saved = localStorage.getItem('deltavi_presets_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPresets([...FACTORY_PRESETS, ...parsed]);
      } catch (e) {
        setPresets(FACTORY_PRESETS);
      }
    } else {
      setPresets(FACTORY_PRESETS);
    }
  }, []);

  const handleSavePreset = () => {
    if (!customPresetName.trim()) return;
    const newPreset = {
      name: customPresetName.trim(),
      voiceMode, osc1Waveform, osc2Waveform, osc1Pitch, osc2Pitch, osc2Detune, syncMode,
      oscDrift, hpfBassBoost, unisonDetune,
      filterCircuit, filterDrive, subShape, subOctave, monoEnvelopeMode, lfoKeySync,
      osc1Vol, osc2Vol, ringModVol, subVolume, noiseVolume, volume,
      cutoff, resonance, filterType, filterEnvAmt, shAmount,
      attack, decay, sustain, release, portamento, lfoRate, lfoDepth, lfoTarget,
      lfo2Rate, lfo2Depth, lfo2Target, lfo2Shape, lfo2KeySync,
      chorusDepth, delayTime, delayFeedback, delayMix,
      phaserMix, phaserRate, flangerMix, flangerRate, flangerFeedback, reverbMix, reverbDecay,
      arpOn, arpBpm, arpPattern, arpDivision,
      xMod, polyModFilterEnv, polyModOsc2, polyModOsc1Freq, polyModOsc1Pw, polyModFilter,
      feedbackVol, filterAttack, filterDecay, filterSustain, filterRelease,
      feedbackFilterType, osc1Morph, osc2Morph, saturationMode, saturationAmount
    };

    const updatedCustom = presets.filter(p => !p.name.startsWith("FACTORY:") && p.name !== newPreset.name);
    updatedCustom.push(newPreset);
    
    localStorage.setItem('deltavi_presets_db', JSON.stringify(updatedCustom));
    setPresets([...FACTORY_PRESETS, ...updatedCustom]);
    setSelectedPresetName(newPreset.name);
    setCustomPresetName('');
  };

  const handleLoadPreset = (name) => {
    const preset = presets.find(p => p.name === name);
    if (!preset) return;

    setSelectedPresetName(name);
    setVoiceMode(preset.voiceMode);
    setOsc1Waveform(preset.osc1Waveform);
    setOsc2Waveform(preset.osc2Waveform);
    setOsc1Pitch(preset.osc1Pitch);
    setOsc2Pitch(preset.osc2Pitch);
    setOsc2Detune(preset.osc2Detune);
    setSyncMode(preset.syncMode);
    setOscDrift(preset.oscDrift ?? 15);
    setHpfBassBoost(preset.hpfBassBoost ?? false);
    setUnisonDetune(preset.unisonDetune ?? 0);
    setFilterCircuit(preset.filterCircuit ?? 'classic');
    setFilterDrive(preset.filterDrive ?? 0.0);
    setSubShape(preset.subShape ?? 'sine');
    setSubOctave(preset.subOctave ?? -1);
    setMonoEnvelopeMode(preset.monoEnvelopeMode ?? 'legato');
    setLfoKeySync(preset.lfoKeySync ?? true);
    setOsc1Vol(preset.osc1Vol);
    setOsc2Vol(preset.osc2Vol);
    setRingModVol(preset.ringModVol);
    setSubVolume(preset.subVolume);
    setNoiseVolume(preset.noiseVolume);
    setCutoff(preset.cutoff);
    setResonance(preset.resonance);
    setFilterType(preset.filterType);
    setFilterEnvAmt(preset.filterEnvAmt);
    setShAmount(preset.shAmount);
    setAttack(preset.attack);
    setDecay(preset.decay);
    setSustain(preset.sustain);
    setRelease(preset.release);
    setPortamento(preset.portamento);
    setLfoRate(preset.lfoRate);
    setLfoDepth(preset.lfoDepth);
    setLfoTarget(preset.lfoTarget);
    setLfo2Rate(preset.lfo2Rate ?? 5.0);
    setLfo2Depth(preset.lfo2Depth ?? 0);
    setLfo2Target(preset.lfo2Target ?? 'none');
    setLfo2Shape(preset.lfo2Shape ?? 'sine');
    setLfo2KeySync(preset.lfo2KeySync ?? true);
    setChorusDepth(preset.chorusDepth);
    setDelayTime(preset.delayTime);
    setDelayFeedback(preset.delayFeedback);
    setDelayMix(preset.delayMix);
    setPhaserMix(preset.phaserMix ?? 0.0);
    setPhaserRate(preset.phaserRate ?? 1.0);
    setFlangerMix(preset.flangerMix ?? 0.0);
    setFlangerRate(preset.flangerRate ?? 0.5);
    setFlangerFeedback(preset.flangerFeedback ?? 0.3);
    setReverbMix(preset.reverbMix ?? 0.0);
    setReverbDecay(preset.reverbDecay ?? 1.5);
    if (preset.arpOn !== undefined) setArpOn(preset.arpOn);
    if (preset.arpBpm !== undefined) setArpBpm(preset.arpBpm);
    if (preset.arpPattern !== undefined) setArpPattern(preset.arpPattern);
    setArpDivision(preset.arpDivision ?? 16);

    setXMod(preset.xMod ?? 0.0);
    setPolyModFilterEnv(preset.polyModFilterEnv ?? 0.0);
    setPolyModOsc2(preset.polyModOsc2 ?? 0.0);
    setPolyModOsc1Freq(preset.polyModOsc1Freq ?? false);
    setPolyModOsc1Pw(preset.polyModOsc1Pw ?? false);
    setPolyModFilter(preset.polyModFilter ?? false);
    setFeedbackVol(preset.feedbackVol ?? 0.0);
    setFeedbackFilterType(preset.feedbackFilterType ?? 'bypass');
    setOsc1Morph(preset.osc1Morph ?? 0.0);
    setOsc2Morph(preset.osc2Morph ?? 0.0);
    setSaturationMode(preset.saturationMode ?? 'warm');
    setSaturationAmount(preset.saturationAmount ?? 0.0);
    setStereoWidth(preset.stereoWidth ?? 1.0);
    setHaasDelay(preset.haasDelay ?? 0.0);
    setAmpDrive(preset.ampDrive ?? 1.0);
    setAmpBass(preset.ampBass ?? 0);
    setAmpMid(preset.ampMid ?? 0);
    setAmpTreble(preset.ampTreble ?? 0);
    setCabType(preset.cabType ?? 'bypass');
    setCompOn(preset.compOn ?? false);
    setCompThreshold(preset.compThreshold ?? -24);
    setCompRatio(preset.compRatio ?? 4);
    setCompAttack(preset.compAttack ?? 0.01);
    setCompRelease(preset.compRelease ?? 0.25);
    setCompMakeup(preset.compMakeup ?? 0);
    setFilterAttack(preset.filterAttack ?? 0.06);
    setFilterDecay(preset.filterDecay ?? 0.3);
    setFilterSustain(preset.filterSustain ?? 0.4);
    setFilterRelease(preset.filterRelease ?? 0.4);
    setSubFilterType(preset.subFilterType ?? 'bypass');
    setSubCutoff(preset.subCutoff ?? 1000);
    setSubResonance(preset.subResonance ?? 1.0);
    setSubOscFilterMod(preset.subOscFilterMod ?? 0.0);
  };

  // Keep refs of current parameter values to avoid closure stale state in MIDI/audio callbacks
  const paramsRef = useRef({});
  useEffect(() => {
    paramsRef.current = {
      osc1Waveform, osc2Waveform, osc1Pitch, osc2Pitch, osc2Detune, syncMode,
      osc1Vol, osc2Vol, ringModVol, subVolume, noiseVolume, volume,
      cutoff, resonance, filterType, filterEnvAmt, shAmount,
      attack, decay, sustain, release, portamento, lfoRate, lfoDepth, lfoTarget,
      lfo2Rate, lfo2Depth, lfo2Target, lfo2Shape, lfo2KeySync,
      voiceMode, oscDrift, unisonDetune,
      filterCircuit, filterDrive, subShape, subOctave, monoEnvelopeMode, lfoKeySync,
      phaserMix, phaserRate, flangerMix, flangerRate, flangerFeedback, reverbMix, reverbDecay,
      arpOn, arpBpm, arpPattern, arpDivision,
      xMod, polyModFilterEnv, polyModOsc2, polyModOsc1Freq, polyModOsc1Pw, polyModFilter,
      feedbackVol, filterAttack, filterDecay, filterSustain, filterRelease,
      pitchBend, modWheel, feedbackFilterType, osc1Morph, osc2Morph, saturationMode, saturationAmount,
      stereoWidth, haasDelay, ampDrive, ampBass, ampMid, ampTreble, cabType,
      compOn, compThreshold, compRatio, compAttack, compRelease, compMakeup,
      subFilterType, subCutoff, subResonance, subOscFilterMod
    };
  }, [
      osc1Waveform, osc2Waveform, osc1Pitch, osc2Pitch, osc2Detune, syncMode,
      osc1Vol, osc2Vol, ringModVol, subVolume, noiseVolume, volume,
      cutoff, resonance, filterType, filterEnvAmt, shAmount,
      attack, decay, sustain, release, portamento, lfoRate, lfoDepth, lfoTarget,
      lfo2Rate, lfo2Depth, lfo2Target, lfo2Shape, lfo2KeySync,
      voiceMode, oscDrift, unisonDetune,
      filterCircuit, filterDrive, subShape, subOctave, monoEnvelopeMode, lfoKeySync,
      phaserMix, phaserRate, flangerMix, flangerRate, flangerFeedback, reverbMix, reverbDecay,
      arpOn, arpBpm, arpPattern, arpDivision,
      xMod, polyModFilterEnv, polyModOsc2, polyModOsc1Freq, polyModOsc1Pw, polyModFilter,
      feedbackVol, filterAttack, filterDecay, filterSustain, filterRelease,
      pitchBend, modWheel, feedbackFilterType, osc1Morph, osc2Morph, saturationMode, saturationAmount,
      stereoWidth, haasDelay, ampDrive, ampBass, ampMid, ampTreble, cabType,
      compOn, compThreshold, compRatio, compAttack, compRelease, compMakeup,
      subFilterType, subCutoff, subResonance, subOscFilterMod
  ]);

  // Saturating distortion waveshaper generator
  const makeDistortionCurve = (amount) => {
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    if (amount <= 0.01) {
      for (let i = 0; i < n_samples; ++i) {
        curve[i] = (i * 2) / n_samples - 1;
      }
      return curve;
    }
    const k = amount * 35;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x) / (3 + k * Math.abs(x));
    }
    return curve;
  };

  const makeMasterDistortionCurve = (mode, amount) => {
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    if (amount <= 0.01) {
      for (let i = 0; i < n_samples; ++i) {
        curve[i] = (i * 2) / n_samples - 1;
      }
      return curve;
    }

    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      if (mode === 'fold') {
        const drive = 1.0 + amount * 8.0;
        curve[i] = Math.sin(x * Math.PI * drive) * 0.7;
      } else if (mode === 'decimate') {
        const bits = Math.max(2.0, 16.0 - amount * 14.5);
        const steps = Math.pow(2, bits);
        curve[i] = Math.round(x * steps) / steps;
      } else {
        const k = amount * 12;
        if (x < 0) {
          curve[i] = Math.tanh(x * (1.5 + k * 0.5));
        } else {
          curve[i] = (Math.exp(x * (1.5 + k * 0.5)) - 1) / (Math.exp(1.5 + k * 0.5) - 1);
        }
      }
    }
    return curve;
  };

  useEffect(() => {
    if (masterDistortionRef.current && audioCtxRef.current) {
      masterDistortionRef.current.curve = makeMasterDistortionCurve(saturationMode, saturationAmount);
    }
  }, [saturationMode, saturationAmount]);

  useEffect(() => {
    if (midScaleRef.current && sideScaleRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const midGainVal = Math.min(1.0, 2.0 - stereoWidth);
      const sideGainVal = Math.min(1.0, stereoWidth);
      midScaleRef.current.gain.setTargetAtTime(midGainVal, now, 0.02);
      sideScaleRef.current.gain.setTargetAtTime(sideGainVal, now, 0.02);
    }
  }, [stereoWidth]);

  useEffect(() => {
    if (haasDelayNodeRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      haasDelayNodeRef.current.delayTime.setTargetAtTime(haasDelay, now, 0.02);
      if (haasLeftRef.current && haasRightRef.current) {
        const factor = 3.5;
        const leftGain = 1.0 - (haasDelay * factor);
        const rightGain = 1.0 + (haasDelay * factor);
        haasLeftRef.current.gain.setTargetAtTime(leftGain, now, 0.02);
        haasRightRef.current.gain.setTargetAtTime(rightGain, now, 0.02);
      }
    }
  }, [haasDelay]);

  // --- Voice Allocator ---
  const handleNoteOn = (note, velocity) => {
    if (!synthOn) return;
    setPressedNotes(prev => {
      const next = new Set(prev);
      next.add(note);
      return next;
    });

    if (voiceMode === 'poly') {
      playVoice(note, note, velocity);
    } else if (voiceMode === 'mono') {
      if (!heldNotes.current.includes(note)) heldNotes.current.push(note);
      const active = heldNotes.current[heldNotes.current.length - 1];
      
      if (activeVoices.current.has('mono')) {
        glideVoice('mono', active);
      } else {
        playVoice('mono', active, velocity);
      }
    } else if (voiceMode === 'duo') {
      if (!heldNotes.current.includes(note)) heldNotes.current.push(note);
      const sorted = [...heldNotes.current].sort((a,b) => a - b);
      
      if (sorted.length === 1) {
        if (activeVoices.current.has('duoH')) {
          stopVoice('duoH');
        }
        if (activeVoices.current.has('duoL')) {
          glideVoice('duoL', sorted[0], true); 
        } else {
          playVoice('duoL', sorted[0], velocity, true);
        }
      } else {
        const lower = sorted[0];
        const higher = sorted[sorted.length - 1];

        if (activeVoices.current.has('duoL')) {
          glideVoice('duoL', lower, false, 'osc1');
        } else {
          playVoice('duoL', lower, velocity, false, 'osc1');
        }

        if (activeVoices.current.has('duoH')) {
          glideVoice('duoH', higher, false, 'osc2');
        } else {
          playVoice('duoH', higher, velocity, false, 'osc2');
        }
      }
    }
  };

  const handleNoteOff = (note) => {
    if (!synthOn) return;
    setPressedNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });

    if (voiceMode === 'poly') {
      stopVoice(note);
    } else if (voiceMode === 'mono') {
      heldNotes.current = heldNotes.current.filter(n => n !== note);
      if (heldNotes.current.length === 0) {
        stopVoice('mono');
      } else {
        glideVoice('mono', heldNotes.current[heldNotes.current.length - 1]);
      }
    } else if (voiceMode === 'duo') {
      heldNotes.current = heldNotes.current.filter(n => n !== note);
      const sorted = [...heldNotes.current].sort((a,b) => a - b);
      
      if (sorted.length === 0) {
        stopVoice('duoL');
        stopVoice('duoH');
      } else if (sorted.length === 1) {
        stopVoice('duoH');
        if (activeVoices.current.has('duoL')) {
          glideVoice('duoL', sorted[0], true);
        } else {
          playVoice('duoL', sorted[0], 100, true);
        }
      } else {
        const lower = sorted[0];
        const higher = sorted[sorted.length - 1];
        
        if (activeVoices.current.has('duoL')) {
          glideVoice('duoL', lower, false, 'osc1');
        } else {
          playVoice('duoL', lower, 100, false, 'osc1');
        }

        if (activeVoices.current.has('duoH')) {
          glideVoice('duoH', higher, false, 'osc2');
        } else {
          playVoice('duoH', higher, 100, false, 'osc2');
        }
      }
    }
  };

  const handleNoteOnRef = useRef(handleNoteOn);
  const handleNoteOffRef = useRef(handleNoteOff);
  const arpOnRef = useRef(arpOn);
  useEffect(() => {
    handleNoteOnRef.current = handleNoteOn;
    handleNoteOffRef.current = handleNoteOff;
    arpOnRef.current = arpOn;
  });

  // Dynamic updates for Pitch Bend, Mod Wheel, and X-Mod inside active voices
  // Dynamic updates for Pitch Bend, Octaves, and Sub Octave inside active voices
  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    const pbFactor = Math.pow(2, (pitchBend * 2) / 12);
    activeVoices.current.forEach(voice => {
      const baseFreq = getFreq(voice.midiNote);
      const f1 = baseFreq * Math.pow(2, osc1Pitch) * pbFactor;
      const f2 = baseFreq * Math.pow(2, osc2Pitch) * pbFactor;
      voice.osc1.frequency.setTargetAtTime(f1, now, 0.015);
      if (voice.osc1Dig) voice.osc1Dig.frequency.setTargetAtTime(f1, now, 0.015);
      voice.osc2.frequency.setTargetAtTime(f2, now, 0.015);
      if (voice.osc2Dig) voice.osc2Dig.frequency.setTargetAtTime(f2, now, 0.015);
      if (voice.subOsc) {
        voice.subOsc.frequency.setTargetAtTime(f1 * Math.pow(2, subOctave), now, 0.015);
      }
    });
  }, [pitchBend, osc1Pitch, osc2Pitch, subOctave]);

  // Real-time sweeping of Osc Waveforms, Morphs, Detunes, Volumes, and Filters
  useEffect(() => {
    if (!audioCtxRef.current) return;
    activeVoices.current.forEach(voice => {
      const isAnalog = ['sine', 'triangle', 'sawtooth', 'square'].includes(osc1Waveform);
      if (isAnalog) {
        if (voice.osc1) voice.osc1.type = osc1Waveform;
      } else {
        const wave = getDwgsWave(audioCtxRef.current, osc1Waveform);
        if (voice.osc1Dig) voice.osc1Dig.setPeriodicWave(wave);
      }
    });
  }, [osc1Waveform]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    activeVoices.current.forEach(voice => {
      if (voice.osc2) voice.osc2.type = osc2Waveform;
    });
  }, [osc2Waveform]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.osc1MorphAnalogGain && voice.osc1MorphDigitalGain) {
        voice.osc1MorphAnalogGain.gain.setTargetAtTime(1.0 - osc1Morph, now, 0.015);
        voice.osc1MorphDigitalGain.gain.setTargetAtTime(osc1Morph, now, 0.015);
      }
    });
  }, [osc1Morph]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.osc2MorphAnalogGain && voice.osc2MorphDigitalGain) {
        voice.osc2MorphAnalogGain.gain.setTargetAtTime(1.0 - osc2Morph, now, 0.015);
        voice.osc2MorphDigitalGain.gain.setTargetAtTime(osc2Morph, now, 0.015);
      }
    });
  }, [osc2Morph]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      const totalDetune = osc2Detune + unisonDetune;
      if (voice.osc2) voice.osc2.detune.setTargetAtTime(totalDetune, now, 0.015);
      if (voice.osc2Dig) voice.osc2Dig.detune.setTargetAtTime(totalDetune, now, 0.015);
    });
  }, [osc2Detune, unisonDetune]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      let targetOsc1 = osc1Vol;
      let targetOsc2 = osc2Vol;
      let targetRing = ringModVol;

      if (voice.forceSingleOsc === 'osc1') {
        targetOsc2 = 0;
        targetRing = 0;
      } else if (voice.forceSingleOsc === 'osc2') {
        targetOsc1 = 0;
        targetRing = 0;
      }

      if (voice.osc1Gain) voice.osc1Gain.gain.setTargetAtTime(targetOsc1, now, 0.015);
      if (voice.osc2Gain) voice.osc2Gain.gain.setTargetAtTime(targetOsc2, now, 0.015);
      if (voice.ringGain) voice.ringGain.gain.setTargetAtTime(targetRing, now, 0.015);
    });
  }, [osc1Vol, osc2Vol, ringModVol]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.subGain) {
        voice.subGain.gain.setTargetAtTime(subVolume * 0.38, now, 0.015);
      }
    });
  }, [subVolume]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.noiseGain) {
        voice.noiseGain.gain.setTargetAtTime(noiseVolume * 0.22, now, 0.015);
      }
    });
  }, [noiseVolume]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.filter) {
        voice.filter.frequency.setTargetAtTime(cutoff, now, 0.015);
      }
      if (voice.filter2) {
        voice.filter2.frequency.setTargetAtTime(cutoff, now, 0.015);
      }
    });
  }, [cutoff]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.filter) {
        const isAcid = filterCircuit === 'acid';
        const isLadder = filterCircuit === 'ladder';
        const qVal = isAcid ? resonance * 1.55 : isLadder ? resonance * 0.75 : resonance;
        voice.filter.Q.setTargetAtTime(qVal, now, 0.015);
      }
      if (voice.filter2) {
        const isLadder = filterCircuit === 'ladder';
        const qVal = isLadder ? resonance * 0.75 : 0.0001;
        voice.filter2.Q.setTargetAtTime(qVal, now, 0.015);
      }
    });
  }, [resonance, filterCircuit]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    activeVoices.current.forEach(voice => {
      if (voice.driveNode) {
        voice.driveNode.curve = makeDistortionCurve(filterDrive);
      }
    });
  }, [filterDrive]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.feedbackGainNode) {
        voice.feedbackGainNode.gain.setTargetAtTime(feedbackVol * 0.95, now, 0.015);
      }
    });
  }, [feedbackVol]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    activeVoices.current.forEach(voice => {
      if (voice.subOsc) {
        voice.subOsc.type = subShape;
      }
    });
  }, [subShape]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.fmGain) {
        voice.fmGain.gain.setTargetAtTime(syncMode ? 1400 : 0, now, 0.015);
      }
    });
  }, [syncMode]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.lfoGainNode && paramsRef.current.lfoTarget === 'pitch') {
        const effectiveDepth = paramsRef.current.lfoDepth + (modWheel * 150);
        voice.lfoGainNode.gain.setTargetAtTime(effectiveDepth, now, 0.05);
      }
    });
  }, [modWheel]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.xModGain) {
        voice.xModGain.gain.setTargetAtTime(xMod * 3000, now, 0.02);
      }
    });
  }, [xMod]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.subFilterNode) {
        voice.subFilterNode.frequency.setTargetAtTime(subCutoff, now, 0.015);
      }
    });
  }, [subCutoff]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.subFilterNode) {
        voice.subFilterNode.Q.setTargetAtTime(subResonance, now, 0.015);
      }
    });
  }, [subResonance]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    activeVoices.current.forEach(voice => {
      if (voice.subFmGain) {
        voice.subFmGain.gain.setTargetAtTime(subOscFilterMod * 1800, now, 0.015);
      }
    });
  }, [subOscFilterMod]);

  const getFreq = (midiNote) => 440 * Math.pow(2, (midiNote - 69) / 12);

  // --- Voice Sound Generation & Nodes Routing ---
  const playVoice = (voiceId, midiNote, velocity, bothOscActive = true, forceSingleOsc = null) => {
    if (!audioCtxRef.current || !synthOn) return;

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    const pbFactor = Math.pow(2, (paramsRef.current.pitchBend * 2) / 12);
    const baseFreq = getFreq(midiNote);

    if (activeVoices.current.has(voiceId)) {
      stopVoice(voiceId);
    }

    const osc1 = ctx.createOscillator();
    const osc1Dig = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc2Dig = ctx.createOscillator();
    
    osc1.type = ['sine', 'triangle', 'sawtooth', 'square'].includes(paramsRef.current.osc1Waveform)
      ? paramsRef.current.osc1Waveform
      : 'sawtooth';
    osc2.type = ['sine', 'triangle', 'sawtooth', 'square'].includes(paramsRef.current.osc2Waveform)
      ? paramsRef.current.osc2Waveform
      : 'triangle';

    const dwgsWaveName = ['organ', 'vox', 'strings', 'epiano', 'bell', 'synth-bass', 'clavit', 'harmon'].includes(paramsRef.current.osc1Waveform)
      ? paramsRef.current.osc1Waveform
      : paramsRef.current.dwgsType || 'organ';
    const wave = getDwgsWave(ctx, dwgsWaveName);
    osc1Dig.setPeriodicWave(wave);
    osc2Dig.setPeriodicWave(wave);

    const freq1 = baseFreq * Math.pow(2, paramsRef.current.osc1Pitch) * pbFactor;
    const freq2 = baseFreq * Math.pow(2, paramsRef.current.osc2Pitch) * pbFactor;

    osc1.frequency.setValueAtTime(freq1, now);
    osc1Dig.frequency.setValueAtTime(freq1, now);
    osc2.frequency.setValueAtTime(freq2, now);
    osc2Dig.frequency.setValueAtTime(freq2, now);
    
    const totalDetune = paramsRef.current.osc2Detune + paramsRef.current.unisonDetune;
    osc2.detune.setValueAtTime(totalDetune, now);
    osc2Dig.detune.setValueAtTime(totalDetune, now);

    // Cross-Morphing Sum Nodes
    const osc1MorphedSum = ctx.createGain();
    const osc1MorphAnalogGain = ctx.createGain();
    const osc1MorphDigitalGain = ctx.createGain();
    const morphVal1 = paramsRef.current.osc1Morph ?? 0.0;
    osc1MorphAnalogGain.gain.setValueAtTime(1.0 - morphVal1, now);
    osc1MorphDigitalGain.gain.setValueAtTime(morphVal1, now);
    
    osc1.connect(osc1MorphAnalogGain);
    osc1Dig.connect(osc1MorphDigitalGain);
    osc1MorphAnalogGain.connect(osc1MorphedSum);
    osc1MorphDigitalGain.connect(osc1MorphedSum);

    const osc2MorphedSum = ctx.createGain();
    const osc2MorphAnalogGain = ctx.createGain();
    const osc2MorphDigitalGain = ctx.createGain();
    const morphVal2 = paramsRef.current.osc2Morph ?? 0.0;
    osc2MorphAnalogGain.gain.setValueAtTime(1.0 - morphVal2, now);
    osc2MorphDigitalGain.gain.setValueAtTime(morphVal2, now);
    
    osc2.connect(osc2MorphAnalogGain);
    osc2Dig.connect(osc2MorphDigitalGain);
    osc2MorphAnalogGain.connect(osc2MorphedSum);
    osc2MorphDigitalGain.connect(osc2MorphedSum);

    // Dynamic Parameter Drift
    let driftLfo = null;
    let driftGain = null;
    if (paramsRef.current.oscDrift > 0) {
      driftLfo = ctx.createOscillator();
      driftLfo.frequency.setValueAtTime(0.15 + Math.random() * 0.45, now);
      
      driftGain = ctx.createGain();
      driftGain.gain.setValueAtTime((paramsRef.current.oscDrift / 100) * 12, now); 
      
      driftLfo.connect(driftGain);
      driftGain.connect(osc1.frequency);
      driftGain.connect(osc1Dig.frequency);
      driftGain.connect(osc2.frequency);
      driftGain.connect(osc2Dig.frequency);
      driftLfo.start(now);
    }

    // Mixer gains
    const osc1Gain = ctx.createGain();
    const osc2Gain = ctx.createGain();
    const ringGain = ctx.createGain();
    
    if (forceSingleOsc === 'osc1') {
      osc1Gain.gain.setValueAtTime(paramsRef.current.osc1Vol, now);
      osc2Gain.gain.setValueAtTime(0, now);
      ringGain.gain.setValueAtTime(0, now);
    } else if (forceSingleOsc === 'osc2') {
      osc1Gain.gain.setValueAtTime(0, now);
      osc2Gain.gain.setValueAtTime(paramsRef.current.osc2Vol, now);
      ringGain.gain.setValueAtTime(0, now);
    } else if (bothOscActive) {
      osc1Gain.gain.setValueAtTime(paramsRef.current.osc1Vol, now);
      osc2Gain.gain.setValueAtTime(paramsRef.current.osc2Vol, now);
      ringGain.gain.setValueAtTime(paramsRef.current.ringModVol, now);
    } else {
      osc1Gain.gain.setValueAtTime(paramsRef.current.osc1Vol, now);
      osc2Gain.gain.setValueAtTime(paramsRef.current.osc2Vol, now);
      ringGain.gain.setValueAtTime(paramsRef.current.ringModVol, now);
    }

    // Osc Sync / FM
    const fmGain = ctx.createGain();
    fmGain.gain.setValueAtTime(paramsRef.current.syncMode ? 1400 : 0, now);

    // Ring Modulator
    const ringMod = ctx.createGain();
    ringMod.gain.setValueAtTime(0, now);
    osc2MorphedSum.connect(ringMod);
    osc1MorphedSum.connect(ringMod.gain);

    osc1MorphedSum.connect(osc1Gain);
    osc2MorphedSum.connect(osc2Gain);
    ringMod.connect(ringGain);
    
    osc1MorphedSum.connect(fmGain);
    fmGain.connect(osc2.frequency);
    fmGain.connect(osc2Dig.frequency);

    // Vectra Cross-Mod
    let xModGain = null;
    if (paramsRef.current.xMod > 0.01) {
      xModGain = ctx.createGain();
      xModGain.gain.setValueAtTime(paramsRef.current.xMod * 3000, now);
      osc2MorphedSum.connect(xModGain);
      xModGain.connect(osc1.frequency);
      xModGain.connect(osc1Dig.frequency);
    }

    // Filter Node Setup
    const filter = ctx.createBiquadFilter();
    const filter2 = ctx.createBiquadFilter();
    
    const isAcid = paramsRef.current.filterCircuit === 'acid';
    const isLadder = paramsRef.current.filterCircuit === 'ladder';
    filter.type = (isAcid || isLadder) ? 'lowpass' : paramsRef.current.filterType;
    filter2.type = 'lowpass';
    
    const baseQ = paramsRef.current.resonance;
    filter.Q.setValueAtTime(isAcid ? baseQ * 1.55 : isLadder ? baseQ * 0.75 : baseQ, now);
    filter2.Q.setValueAtTime(isLadder ? baseQ * 0.75 : 0.0001, now);

    osc1Gain.connect(filter);
    osc2Gain.connect(filter);
    ringGain.connect(filter);

    // Sub-Oscillator (custom shapes: sine, square, triangle)
    let subOsc = null;
    let subGain = null;
    let subFilterNode = null;
    let subFmGain = null;
    if (paramsRef.current.subVolume > 0.01) {
      subOsc = ctx.createOscillator();
      subOsc.type = paramsRef.current.subShape; // sine, square, triangle
      const subPitchShift = Math.pow(2, paramsRef.current.subOctave); // -1 or -2 octaves
      subOsc.frequency.setValueAtTime(freq1 * subPitchShift, now);
      subGain = ctx.createGain();
      subGain.gain.setValueAtTime(paramsRef.current.subVolume * 0.38, now);
      
      if (paramsRef.current.subFilterType && paramsRef.current.subFilterType !== 'bypass') {
        subFilterNode = ctx.createBiquadFilter();
        subFilterNode.type = paramsRef.current.subFilterType;
        subFilterNode.frequency.setValueAtTime(paramsRef.current.subCutoff, now);
        subFilterNode.Q.setValueAtTime(paramsRef.current.subResonance, now);
        subOsc.connect(subFilterNode);
        subFilterNode.connect(subGain);
      } else {
        subOsc.connect(subGain);
      }
      subGain.connect(filter);

      if (paramsRef.current.subOscFilterMod > 0.01) {
        subFmGain = ctx.createGain();
        subFmGain.gain.setValueAtTime(paramsRef.current.subOscFilterMod * 1800, now);
        subOsc.connect(subFmGain);
        subFmGain.connect(filter.frequency);
        if (isLadder) {
          subFmGain.connect(filter2.frequency);
        }
      }
      subOsc.start(now);
    }

    // Noise Generator
    let noiseSource = null;
    let noiseGain = null;
    if (paramsRef.current.noiseVolume > 0.01) {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(paramsRef.current.noiseVolume * 0.22, now);
      noiseSource.connect(noiseGain);
      noiseGain.connect(filter);
      noiseSource.start(now);
    }

    // Filter Saturation / Drive Waveshaper
    const driveNode = ctx.createWaveShaper();
    driveNode.curve = makeDistortionCurve(paramsRef.current.filterDrive);
    driveNode.oversample = '4x';

    if (isLadder) {
      filter.connect(filter2);
      filter2.connect(driveNode);
    } else {
      filter.connect(driveNode);
    }

    // Cascade Feedback Loop Setup (1ms delay loop)
    let feedbackGainNode = null;
    let feedbackDelayNode = null;
    let feedbackFilterNode = null;
    if (paramsRef.current.feedbackVol > 0.01) {
      feedbackDelayNode = ctx.createDelay(0.02);
      feedbackDelayNode.delayTime.setValueAtTime(0.001, now);
      
      if (paramsRef.current.feedbackFilterType !== 'bypass') {
        feedbackFilterNode = ctx.createBiquadFilter();
        feedbackFilterNode.type = paramsRef.current.feedbackFilterType;
        feedbackFilterNode.frequency.setValueAtTime(paramsRef.current.feedbackFilterType === 'highpass' ? 400 : 1000, now);
      }
      
      feedbackGainNode = ctx.createGain();
      feedbackGainNode.gain.setValueAtTime(paramsRef.current.feedbackVol * 0.95, now);
      
      driveNode.connect(feedbackDelayNode);
      if (feedbackFilterNode) {
        feedbackDelayNode.connect(feedbackFilterNode);
        feedbackFilterNode.connect(feedbackGainNode);
      } else {
        feedbackDelayNode.connect(feedbackGainNode);
      }
      feedbackGainNode.connect(filter);
    }

    // Vectra Poly-Mod Target: Filter Cutoff
    let polyModOsc2FilterGain = null;
    if (paramsRef.current.polyModFilter && paramsRef.current.polyModOsc2 > 0.01) {
      polyModOsc2FilterGain = ctx.createGain();
      polyModOsc2FilterGain.gain.setValueAtTime(paramsRef.current.polyModOsc2 * 2000, now);
      osc2MorphedSum.connect(polyModOsc2FilterGain);
      polyModOsc2FilterGain.connect(filter.frequency);
      if (isLadder) {
        polyModOsc2FilterGain.connect(filter2.frequency);
      }
    }

    // Vectra Poly-Mod Target: Osc 1 Pitch (Modulated by Filter Env and/or Osc 2)
    let polyModOsc2Osc1Gain = null;
    if (paramsRef.current.polyModOsc1Freq) {
      if (paramsRef.current.polyModOsc2 > 0.01) {
        polyModOsc2Osc1Gain = ctx.createGain();
        polyModOsc2Osc1Gain.gain.setValueAtTime(paramsRef.current.polyModOsc2 * 1500, now);
        osc2MorphedSum.connect(polyModOsc2Osc1Gain);
        polyModOsc2Osc1Gain.connect(osc1.frequency);
        polyModOsc2Osc1Gain.connect(osc1Dig.frequency);
      }
      if (paramsRef.current.polyModFilterEnv > 0.01) {
        const envAmt = paramsRef.current.polyModFilterEnv * 1200;
        const peakFreq = freq1 + envAmt;
        osc1.frequency.setValueAtTime(freq1, now);
        osc1Dig.frequency.setValueAtTime(freq1, now);
        osc1.frequency.linearRampToValueAtTime(peakFreq, now + paramsRef.current.filterAttack);
        osc1Dig.frequency.linearRampToValueAtTime(peakFreq, now + paramsRef.current.filterAttack);
        osc1.frequency.exponentialRampToValueAtTime(
          Math.max(20, freq1 + (peakFreq - freq1) * paramsRef.current.filterSustain),
          now + paramsRef.current.filterAttack + paramsRef.current.filterDecay
        );
        osc1Dig.frequency.exponentialRampToValueAtTime(
          Math.max(20, freq1 + (peakFreq - freq1) * paramsRef.current.filterSustain),
          now + paramsRef.current.filterAttack + paramsRef.current.filterDecay
        );
      }
    }

    // Filter Envelope (Separate VCF ADSR)
    const filterAttackTime = paramsRef.current.filterAttack;
    const filterDecayTime = paramsRef.current.filterDecay;
    const filterSustainVal = paramsRef.current.filterSustain;

    const startCutoff = paramsRef.current.cutoff + (currentShValue.current * paramsRef.current.shAmount);
    const peakCutoff = Math.min(20000, startCutoff + paramsRef.current.filterEnvAmt * (1 + paramsRef.current.polyModFilterEnv * 1.5));
    const attackEnd = now + filterAttackTime;
    const decayEnd = attackEnd + filterDecayTime;

    filter.frequency.setValueAtTime(startCutoff, now);
    filter.frequency.linearRampToValueAtTime(peakCutoff, attackEnd);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, startCutoff + (peakCutoff - startCutoff) * filterSustainVal), decayEnd);

    if (isLadder) {
      filter2.frequency.setValueAtTime(startCutoff, now);
      filter2.frequency.linearRampToValueAtTime(peakCutoff, attackEnd);
      filter2.frequency.exponentialRampToValueAtTime(Math.max(40, startCutoff + (peakCutoff - startCutoff) * filterSustainVal), decayEnd);
    }

    // LFO Modulation routing & Key Sync reset
    let lfo = null;
    let lfoGainNode = null;
    if (paramsRef.current.lfoTarget !== 'none' && paramsRef.current.lfoDepth > 1) {
      lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(paramsRef.current.lfoRate, now);
      lfoGainNode = ctx.createGain();
      
      let effectiveDepth = paramsRef.current.lfoDepth;
      if (paramsRef.current.lfoTarget === 'pitch') {
        effectiveDepth += paramsRef.current.modWheel * 150;
      }
      lfoGainNode.gain.setValueAtTime(effectiveDepth, now);
      lfo.connect(lfoGainNode);

      if (paramsRef.current.lfoTarget === 'filter') {
        lfoGainNode.connect(filter.frequency);
        if (isLadder) lfoGainNode.connect(filter2.frequency);
      } else if (paramsRef.current.lfoTarget === 'pitch') {
        lfoGainNode.connect(osc1.frequency);
        lfoGainNode.connect(osc1Dig.frequency);
        lfoGainNode.connect(osc2.frequency);
        lfoGainNode.connect(osc2Dig.frequency);
      }
      
      const startOffset = paramsRef.current.lfoKeySync ? 0 : Math.random() * 5.0;
      lfo.start(now - startOffset);
    }

    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(0, now);
    driveNode.connect(voiceGain); 
    voiceGain.connect(masterGainRef.current);

    const velScale = velocity / 127;
    const peakVolume = velScale * 0.4;
    const ampAttackEnd = now + paramsRef.current.attack;
    const ampDecayEnd = ampAttackEnd + paramsRef.current.decay;

    voiceGain.gain.linearRampToValueAtTime(peakVolume, ampAttackEnd);
    voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peakVolume * paramsRef.current.sustain), ampDecayEnd);

    // LFO 2 Modulation routing
    let lfo2 = null;
    let lfo2GainNode = null;
    if (paramsRef.current.lfo2Target !== 'none' && paramsRef.current.lfo2Depth > 1) {
      lfo2 = ctx.createOscillator();
      lfo2.type = paramsRef.current.lfo2Shape || 'sine';
      lfo2.frequency.setValueAtTime(paramsRef.current.lfo2Rate, now);
      lfo2GainNode = ctx.createGain();
      
      lfo2.connect(lfo2GainNode);
      if (paramsRef.current.lfo2Target === 'filter') {
        lfo2GainNode.gain.setValueAtTime(paramsRef.current.lfo2Depth, now);
        lfo2GainNode.connect(filter.frequency);
        if (isLadder) lfo2GainNode.connect(filter2.frequency);
      } else if (paramsRef.current.lfo2Target === 'pitch') {
        lfo2GainNode.gain.setValueAtTime(paramsRef.current.lfo2Depth, now);
        lfo2GainNode.connect(osc1.frequency);
        lfo2GainNode.connect(osc1Dig.frequency);
        lfo2GainNode.connect(osc2.frequency);
        lfo2GainNode.connect(osc2Dig.frequency);
      } else if (paramsRef.current.lfo2Target === 'volume') {
        lfo2GainNode.gain.setValueAtTime((paramsRef.current.lfo2Depth / 1000) * 0.25, now);
        lfo2GainNode.connect(voiceGain.gain);
      }
      
      const startOffset2 = paramsRef.current.lfo2KeySync ? 0 : Math.random() * 5.0;
      lfo2.start(now - startOffset2);
    }

    osc1.start(now);
    osc1Dig.start(now);
    osc2.start(now);
    osc2Dig.start(now);
    lastNoteFreq.current = baseFreq;

    activeVoices.current.set(voiceId, {
      osc1, osc1Dig, osc2, osc2Dig, subOsc, subFilterNode, subFmGain, noiseSource, filter, filter2: isLadder ? filter2 : null, lfo, lfo2, driftLfo, driveNode,
      osc1Gain, osc2Gain, ringGain, fmGain, lfoGainNode, lfo2GainNode,
      xModGain, polyModOsc2FilterGain, polyModOsc2Osc1Gain,
      osc1MorphAnalogGain, osc1MorphDigitalGain, osc2MorphAnalogGain, osc2MorphDigitalGain,
      voiceGain, midiNote, startTime: now, bothOscActive, forceSingleOsc,
      subGain, noiseGain, feedbackGainNode,
      osc1MorphedSum, osc2MorphedSum, driftGain, ringMod, feedbackDelayNode, feedbackFilterNode
    });
  };

  const glideVoice = (voiceId, targetMidiNote, bothOscActive = true, forceSingleOsc = null) => {
    const voice = activeVoices.current.get(voiceId);
    if (!voice || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const targetFreq = getFreq(targetMidiNote);
    const glideTime = paramsRef.current.portamento;

    // Apply real-time Pitch Bend factor
    const pbFactor = Math.pow(2, (paramsRef.current.pitchBend * 2) / 12);
    const f1 = targetFreq * Math.pow(2, paramsRef.current.osc1Pitch) * pbFactor;
    const f2 = targetFreq * Math.pow(2, paramsRef.current.osc2Pitch) * pbFactor;

    if (glideTime > 0.01) {
      voice.osc1.frequency.exponentialRampToValueAtTime(f1, now + glideTime);
      if (voice.osc1Dig) voice.osc1Dig.frequency.exponentialRampToValueAtTime(f1, now + glideTime);
      voice.osc2.frequency.exponentialRampToValueAtTime(f2, now + glideTime);
      if (voice.osc2Dig) voice.osc2Dig.frequency.exponentialRampToValueAtTime(f2, now + glideTime);
      if (voice.subOsc) {
        voice.subOsc.frequency.exponentialRampToValueAtTime(f1 * Math.pow(2, paramsRef.current.subOctave), now + glideTime);
      }
    } else {
      voice.osc1.frequency.setValueAtTime(f1, now);
      if (voice.osc1Dig) voice.osc1Dig.frequency.setValueAtTime(f1, now);
      voice.osc2.frequency.setValueAtTime(f2, now);
      if (voice.osc2Dig) voice.osc2Dig.frequency.setValueAtTime(f2, now);
      if (voice.subOsc) {
        voice.subOsc.frequency.setValueAtTime(f1 * Math.pow(2, paramsRef.current.subOctave), now);
      }
    }

    if (forceSingleOsc === 'osc1') {
      voice.osc1Gain.gain.setTargetAtTime(paramsRef.current.osc1Vol, now, 0.02);
      voice.osc2Gain.gain.setTargetAtTime(0, now, 0.02);
      voice.ringGain.gain.setTargetAtTime(0, now, 0.02);
    } else if (forceSingleOsc === 'osc2') {
      voice.osc1Gain.gain.setTargetAtTime(0, now, 0.02);
      voice.osc2Gain.gain.setTargetAtTime(paramsRef.current.osc2Vol, now, 0.02);
      voice.ringGain.gain.setTargetAtTime(0, now, 0.02);
    } else {
      voice.osc1Gain.gain.setTargetAtTime(paramsRef.current.osc1Vol, now, 0.02);
      voice.osc2Gain.gain.setTargetAtTime(paramsRef.current.osc2Vol, now, 0.02);
      voice.ringGain.gain.setTargetAtTime(paramsRef.current.ringModVol, now, 0.02);
    }

    // Separate VCF Envelope variables for glide
    const filterAttackTime = paramsRef.current.filterAttack;
    const filterDecayTime = paramsRef.current.filterDecay;
    const filterSustainVal = paramsRef.current.filterSustain;

    const startCutoff = paramsRef.current.cutoff + (currentShValue.current * paramsRef.current.shAmount);
    const peakCutoff = Math.min(20000, startCutoff + paramsRef.current.filterEnvAmt * (1 + paramsRef.current.polyModFilterEnv * 1.5));
    const attackEnd = now + filterAttackTime;
    const decayEnd = attackEnd + filterDecayTime;

    const ampAttackEnd = now + paramsRef.current.attack;
    const ampDecayEnd = ampAttackEnd + paramsRef.current.decay;

    if (voiceMode === 'mono' && paramsRef.current.monoEnvelopeMode === 'retrig') {
      voice.voiceGain.gain.cancelScheduledValues(now);
      voice.voiceGain.gain.setValueAtTime(0.0001, now);
      voice.voiceGain.gain.linearRampToValueAtTime(0.4, ampAttackEnd);
      voice.voiceGain.gain.exponentialRampToValueAtTime(0.4 * paramsRef.current.sustain, ampDecayEnd);

      voice.filter.frequency.cancelScheduledValues(now);
      voice.filter.frequency.setValueAtTime(startCutoff, now);
      voice.filter.frequency.linearRampToValueAtTime(peakCutoff, attackEnd);
      voice.filter.frequency.exponentialRampToValueAtTime(Math.max(40, startCutoff + (peakCutoff - startCutoff) * filterSustainVal), decayEnd);
      
      if (voice.filter2) {
        voice.filter2.frequency.cancelScheduledValues(now);
        voice.filter2.frequency.setValueAtTime(startCutoff, now);
        voice.filter2.frequency.linearRampToValueAtTime(peakCutoff, attackEnd);
        voice.filter2.frequency.exponentialRampToValueAtTime(Math.max(40, startCutoff + (peakCutoff - startCutoff) * filterSustainVal), decayEnd);
      }
    } else {
      voice.filter.frequency.setValueAtTime(voice.filter.frequency.value, now);
      voice.filter.frequency.linearRampToValueAtTime(peakCutoff, attackEnd);
      voice.filter.frequency.exponentialRampToValueAtTime(Math.max(40, startCutoff + (peakCutoff - startCutoff) * filterSustainVal), decayEnd);
      
      if (voice.filter2) {
        voice.filter2.frequency.setValueAtTime(voice.filter2.frequency.value, now);
        voice.filter2.frequency.linearRampToValueAtTime(peakCutoff, attackEnd);
        voice.filter2.frequency.exponentialRampToValueAtTime(Math.max(40, startCutoff + (peakCutoff - startCutoff) * filterSustainVal), decayEnd);
      }
    }
  };

  const stopVoice = (voiceId) => {
    const voice = activeVoices.current.get(voiceId);
    if (!voice) return;
    activeVoices.current.delete(voiceId);
    releaseVoiceNodes(voice, paramsRef.current.release);
  };

  const releaseVoiceNodes = (voice, releaseTime) => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    const safeReleaseTime = typeof releaseTime === 'number' && !isNaN(releaseTime) ? Math.max(0.001, releaseTime) : 0.35;
    const releaseEnd = now + safeReleaseTime;

    // Helper to safely schedule exponential ramp on gain
    try {
      const startGain = Math.max(0.0001, voice.voiceGain.gain.value);
      voice.voiceGain.gain.cancelScheduledValues(now);
      voice.voiceGain.gain.setValueAtTime(startGain, now);
      voice.voiceGain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);
    } catch (e) {
      console.warn("Failed to schedule voiceGain release:", e);
      try {
        voice.voiceGain.gain.setValueAtTime(0, now);
      } catch (err) {}
    }

    // Helper to safely schedule exponential ramp on filter cutoff
    try {
      const startCutoff = Math.max(20, voice.filter.frequency.value);
      const targetCutoff = Math.max(20, paramsRef.current.cutoff);
      voice.filter.frequency.cancelScheduledValues(now);
      voice.filter.frequency.setValueAtTime(startCutoff, now);
      voice.filter.frequency.exponentialRampToValueAtTime(targetCutoff, releaseEnd);
    } catch (e) {
      console.warn("Failed to schedule filter release:", e);
    }

    if (voice.filter2) {
      try {
        const startCutoff2 = Math.max(20, voice.filter2.frequency.value);
        const targetCutoff = Math.max(20, paramsRef.current.cutoff);
        voice.filter2.frequency.cancelScheduledValues(now);
        voice.filter2.frequency.setValueAtTime(startCutoff2, now);
        voice.filter2.frequency.exponentialRampToValueAtTime(targetCutoff, releaseEnd);
      } catch (e) {
        console.warn("Failed to schedule filter2 release:", e);
      }
    }

    try {
      voice.osc1.stop(releaseEnd);
      if (voice.osc1Dig) voice.osc1Dig.stop(releaseEnd);
      voice.osc2.stop(releaseEnd);
      if (voice.osc2Dig) voice.osc2Dig.stop(releaseEnd);
      if (voice.subOsc) voice.subOsc.stop(releaseEnd);
      if (voice.noiseSource) voice.noiseSource.stop(releaseEnd);
      if (voice.lfo) voice.lfo.stop(releaseEnd);
      if (voice.lfo2) voice.lfo2.stop(releaseEnd);
      if (voice.driftLfo) voice.driftLfo.stop(releaseEnd);
    } catch (e) {
      console.warn("Failed to stop oscillators:", e);
    }

    setTimeout(() => {
      try {
        voice.voiceGain.disconnect();
        voice.osc1.disconnect();
        if (voice.osc1Dig) voice.osc1Dig.disconnect();
        voice.osc2.disconnect();
        if (voice.osc2Dig) voice.osc2Dig.disconnect();
        if (voice.subOsc) voice.subOsc.disconnect();
        if (voice.noiseSource) voice.noiseSource.disconnect();
        if (voice.filter) voice.filter.disconnect();
        if (voice.filter2) voice.filter2.disconnect();
        if (voice.lfo) voice.lfo.disconnect();
        if (voice.lfo2) voice.lfo2.disconnect();
        if (voice.driftLfo) voice.driftLfo.disconnect();
        if (voice.driveNode) voice.driveNode.disconnect();
        if (voice.osc1Gain) voice.osc1Gain.disconnect();
        if (voice.osc2Gain) voice.osc2Gain.disconnect();
        if (voice.ringGain) voice.ringGain.disconnect();
        if (voice.fmGain) voice.fmGain.disconnect();
        if (voice.lfoGainNode) voice.lfoGainNode.disconnect();
        if (voice.lfo2GainNode) voice.lfo2GainNode.disconnect();
        if (voice.xModGain) voice.xModGain.disconnect();
        if (voice.polyModOsc2FilterGain) voice.polyModOsc2FilterGain.disconnect();
        if (voice.polyModOsc2Osc1Gain) voice.polyModOsc2Osc1Gain.disconnect();
        if (voice.subFilterNode) voice.subFilterNode.disconnect();
        if (voice.subFmGain) voice.subFmGain.disconnect();

        // Complete memory leak cleanup of intermediate node connections
        if (voice.osc1MorphAnalogGain) voice.osc1MorphAnalogGain.disconnect();
        if (voice.osc1MorphDigitalGain) voice.osc1MorphDigitalGain.disconnect();
        if (voice.osc2MorphAnalogGain) voice.osc2MorphAnalogGain.disconnect();
        if (voice.osc2MorphDigitalGain) voice.osc2MorphDigitalGain.disconnect();
        if (voice.subGain) voice.subGain.disconnect();
        if (voice.noiseGain) voice.noiseGain.disconnect();
        if (voice.feedbackGainNode) voice.feedbackGainNode.disconnect();
        if (voice.osc1MorphedSum) voice.osc1MorphedSum.disconnect();
        if (voice.osc2MorphedSum) voice.osc2MorphedSum.disconnect();
        if (voice.driftGain) voice.driftGain.disconnect();
        if (voice.ringMod) voice.ringMod.disconnect();
        if (voice.feedbackDelayNode) voice.feedbackDelayNode.disconnect();
        if (voice.feedbackFilterNode) voice.feedbackFilterNode.disconnect();
      } catch (e) {}
    }, (safeReleaseTime * 1000) + 100);
  };

  // --- Oscilloscope (CRT Vector Glow) ---
  const startOscilloscope = (analyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserNode.frequencyBinCount;
    
    // Pre-allocated typed arrays to prevent GC pressure in drawing loops
    const dataArray = new Uint8Array(bufferLength);
    const dataArrayL = new Uint8Array(bufferLength);
    const dataArrayR = new Uint8Array(bufferLength);

    const traces = [
      { color: 'rgba(255, 0, 150, 0.75)', offset: -1.5 }, 
      { color: 'rgba(0, 255, 150, 0.75)', offset: 0 },  
      { color: 'rgba(0, 200, 255, 0.75)', offset: 1.5 }   
    ];
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      canvasCtx.fillStyle = 'rgba(10, 10, 16, 0.2)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid lines
      canvasCtx.strokeStyle = 'rgba(0, 243, 255, 0.03)';
      canvasCtx.lineWidth = 0.5;
      for (let y = 20; y < canvas.height; y += 20) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, y);
        canvasCtx.lineTo(canvas.width, y);
        canvasCtx.stroke();
      }
      for (let x = 40; x < canvas.width; x += 40) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(x, 0);
        canvasCtx.lineTo(x, canvas.height);
        canvasCtx.stroke();
      }

      if (scopeModeRef.current === 'lissajous') {
        if (analyserLRef.current && analyserRRef.current) {
          analyserLRef.current.getByteTimeDomainData(dataArrayL);
          analyserRRef.current.getByteTimeDomainData(dataArrayR);

          canvasCtx.lineWidth = 1.8;
          canvasCtx.strokeStyle = 'rgba(0, 243, 255, 0.85)';
          canvasCtx.shadowBlur = 8;
          canvasCtx.shadowColor = 'rgba(0, 243, 255, 0.85)';
          canvasCtx.beginPath();

          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const scale = Math.min(canvas.width, canvas.height) * 0.45;
          const lissajousBufLen = analyserLRef.current.frequencyBinCount;

          for (let i = 0; i < lissajousBufLen; i++) {
            const xVal = (dataArrayL[i] - 128) / 128; // -1.0 to 1.0
            const yVal = (dataArrayR[i] - 128) / 128; // -1.0 to 1.0

            const posX = centerX + xVal * scale;
            const posY = centerY + yVal * scale;

            if (i === 0) {
              canvasCtx.moveTo(posX, posY);
            } else {
              canvasCtx.lineTo(posX, posY);
            }
          }
          canvasCtx.stroke();
        }
      } else {
        analyserNode.getByteTimeDomainData(dataArray);
        const sliceWidth = canvas.width / bufferLength;

        traces.forEach(trace => {
          canvasCtx.lineWidth = 1.5;
          canvasCtx.strokeStyle = trace.color;
          canvasCtx.shadowBlur = 6;
          canvasCtx.shadowColor = trace.color;
          canvasCtx.beginPath();

          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2 + trace.offset;

            if (i === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          canvasCtx.lineTo(canvas.width, canvas.height / 2 + trace.offset);
          canvasCtx.stroke();
        });
      }

      canvasCtx.shadowBlur = 0;
    };
    draw();
  };

  const getNoteName = (midiNumber) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNumber / 12) - 1;
    const noteIndex = midiNumber % 12;
    return `${notes[noteIndex]}${octave}`;
  };

  const keyboardKeys = [];
  const startMidiNote = keyboardOctave * 12; 
  for (let note = startMidiNote; note < startMidiNote + 64; note++) {
    const noteIndex = note % 12;
    const isBlack = [1, 3, 6, 8, 10].includes(noteIndex);
    keyboardKeys.push({ note, isBlack });
  }

  const handleMidiParamChange = (param, value) => {
    const pct = value / 127;
    switch (param) {
      case 'volume': setVolume(pct); break;
      case 'cutoff': setCutoff(Math.round(100 + pct * 3900)); break;
      case 'resonance': setResonance(0.5 + pct * 13.5); break;
      case 'attack': setAttack(0.01 + pct * 1.99); break;
      case 'decay': setDecay(0.01 + pct * 1.99); break;
      case 'sustain': setSustain(pct); break;
      case 'release': setRelease(0.01 + pct * 2.99); break;
      case 'osc1Vol': setOsc1Vol(pct); break;
      case 'osc2Vol': setOsc2Vol(pct); break;
      case 'ringModVol': setRingModVol(pct); break;
      case 'subVolume': setSubVolume(pct); break;
      case 'noiseVolume': setNoiseVolume(pct * 0.5); break;
      case 'lfoRate': setLfoRate(0.5 + pct * 19.5); break;
      case 'lfoDepth': setLfoDepth(Math.round(pct * 1000)); break;
      case 'lfo2Rate': setLfo2Rate(0.5 + pct * 19.5); break;
      case 'lfo2Depth': setLfo2Depth(Math.round(pct * 1000)); break;
      case 'portamento': setPortamento(pct * 0.5); break;
      case 'chorusDepth': setChorusDepth(pct); break;
      case 'delayTime': setDelayTime(0.05 + pct * 1.45); break;
      case 'delayMix': setDelayMix(pct * 0.80); break;
      case 'phaserMix': setPhaserMix(pct * 0.85); break;
      case 'flangerMix': setFlangerMix(pct * 0.80); break;
      case 'reverbMix': setReverbMix(pct * 0.90); break;
      case 'osc2Detune': setOsc2Detune(Math.round(-50 + pct * 100)); break;
      case 'oscDrift': setOscDrift(Math.round(pct * 100)); break;
      case 'unisonDetune': setUnisonDetune(Math.round(pct * 50)); break;
      case 'filterDrive': setFilterDrive(pct); break;
      case 'filterEnvAmt': setFilterEnvAmt(Math.round(pct * 3000)); break;
      case 'reverbDecay': setReverbDecay(0.5 + pct * 4.5); break;
      case 'flangerFeedback': setFlangerFeedback(pct * 0.85); break;
      case 'xMod': setXMod(pct); break;
      case 'polyModFilterEnv': setPolyModFilterEnv(pct); break;
      case 'polyModOsc2': setPolyModOsc2(pct); break;
      case 'feedbackVol': setFeedbackVol(pct); break;
      case 'filterAttack': setFilterAttack(0.01 + pct * 1.99); break;
      case 'filterDecay': setFilterDecay(0.01 + pct * 1.99); break;
      case 'filterSustain': setFilterSustain(pct); break;
      case 'filterRelease': setFilterRelease(0.01 + pct * 2.99); break;
      case 'syncMode': setSyncMode(value >= 64); break;
      case 'hpfBassBoost': setHpfBassBoost(value >= 64); break;
      case 'lfoKeySync': setLfoKeySync(value >= 64); break;
      case 'lfo2KeySync': setLfo2KeySync(value >= 64); break;
      case 'voiceMode': setVoiceMode(value < 64 ? 'mono' : 'poly'); break;
      case 'filterCircuit': setFilterCircuit(value < 42 ? 'classic' : (value < 85 ? 'acid' : 'ladder')); break;
      case 'osc1Waveform': {
        const waves = ['sine', 'triangle', 'sawtooth', 'square', 'vox', 'organ', 'strings', 'epiano', 'bell', 'clavit', 'harmon', 'synth-bass'];
        setOsc1Waveform(waves[Math.min(waves.length - 1, Math.floor(pct * waves.length))]);
        break;
      }
      case 'osc2Waveform': {
        const waves = ['sine', 'triangle', 'sawtooth', 'square', 'vox', 'organ', 'strings', 'epiano', 'bell', 'clavit', 'harmon', 'synth-bass'];
        setOsc2Waveform(waves[Math.min(waves.length - 1, Math.floor(pct * waves.length))]);
        break;
      }
      case 'subShape': {
        const shapes = ['sine', 'triangle', 'square'];
        setSubShape(shapes[Math.min(shapes.length - 1, Math.floor(pct * shapes.length))]);
        break;
      }
      case 'subOctave': setSubOctave(value < 64 ? -1 : -2); break;
      case 'subFilterType': {
        const types = ['bypass', 'lowpass', 'highpass', 'bandpass'];
        setSubFilterType(types[Math.min(types.length - 1, Math.floor(pct * types.length))]);
        break;
      }
      case 'subCutoff': setSubCutoff(Math.round(50 + pct * 4950)); break;
      case 'subResonance': setSubResonance(0.1 + pct * 9.9); break;
      case 'subOscFilterMod': setSubOscFilterMod(pct); break;
      case 'monoEnvelopeMode': setMonoEnvelopeMode(value < 64 ? 'legato' : 'retrig'); break;
      case 'lfoTarget': {
        const targets = ['none', 'pitch', 'filter', 'volume', 'pwm'];
        setLfoTarget(targets[Math.min(targets.length - 1, Math.floor(pct * targets.length))]);
        break;
      }
      case 'lfo2Target': {
        const targets = ['none', 'pitch', 'filter', 'volume', 'pwm'];
        setLfo2Target(targets[Math.min(targets.length - 1, Math.floor(pct * targets.length))]);
        break;
      }
      case 'lfo2Shape': {
        const shapes = ['sine', 'triangle', 'sawtooth', 'square', 'random'];
        setLfo2Shape(shapes[Math.min(shapes.length - 1, Math.floor(pct * shapes.length))]);
        break;
      }
      case 'arpOn': setArpOn(value >= 64); break;
      case 'arpBpm': setArpBpm(Math.round(40 + pct * 200)); break;
      case 'arpPattern': {
        const patterns = ['up', 'down', 'updown', 'random'];
        setArpPattern(patterns[Math.min(patterns.length - 1, Math.floor(pct * patterns.length))]);
        break;
      }
      case 'arpDivision': {
        const divisions = [4, 8, 16, 32];
        setArpDivision(divisions[Math.min(divisions.length - 1, Math.floor(pct * divisions.length))]);
        break;
      }
      case 'polyModOsc1Freq': setPolyModOsc1Freq(value >= 64); break;
      case 'polyModOsc1Pw': setPolyModOsc1Pw(value >= 64); break;
      case 'polyModFilter': setPolyModFilter(value >= 64); break;
      case 'osc1Morph': setOsc1Morph(pct); break;
      case 'osc2Morph': setOsc2Morph(pct); break;
      case 'feedbackFilterType': setFeedbackFilterType(value < 42 ? 'bypass' : (value < 85 ? 'lowpass' : 'highpass')); break;
      case 'saturationMode': setSaturationMode(value < 42 ? 'warm' : (value < 85 ? 'fold' : 'decimate')); break;
      case 'saturationAmount': setSaturationAmount(pct); break;
      case 'stereoWidth': setStereoWidth(pct * 2.0); break;
      case 'haasDelay': setHaasDelay(pct * 0.04); break;
      case 'ampDrive': setAmpDrive(1.0 + pct * 9.0); break;
      case 'ampBass': setAmpBass(Math.round(-12 + pct * 24)); break;
      case 'ampMid': setAmpMid(Math.round(-12 + pct * 24)); break;
      case 'ampTreble': setAmpTreble(Math.round(-12 + pct * 24)); break;
      case 'cabType': setCabType(pct < 0.25 ? 'bypass' : (pct < 0.5 ? 'tweed' : (pct < 0.75 ? 'stack' : 'combo'))); break;
      case 'compOn': setCompOn(value >= 64); break;
      case 'compThreshold': setCompThreshold(Math.round(-60 + pct * 60)); break;
      case 'compRatio': setCompRatio(1.0 + pct * 19.0); break;
      case 'compAttack': setCompAttack(0.001 + pct * 0.099); break;
      case 'compRelease': setCompRelease(0.01 + pct * 0.99); break;
      case 'compMakeup': setCompMakeup(pct * 18.0); break;
      default: break;
    }
  };
  const handleMidiParamChangeRef = useRef(handleMidiParamChange);
  useEffect(() => {
    handleMidiParamChangeRef.current = handleMidiParamChange;
  });

  const renderMidiLearnBadge = (paramName) => {
    const isLearning = midiLearnParam === paramName;
    const cc = midiMappings[paramName];
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMidiLearnParam(isLearning ? null : paramName);
        }}
        className={`midi-learn-badge ${isLearning ? 'learning' : (cc !== null && cc !== undefined ? 'mapped' : '')}`}
        title="Click to map MIDI CC (MIDI Learn)"
      >
        {isLearning ? 'LRN' : (cc !== null && cc !== undefined ? `CC ${cc}` : 'MID')}
      </button>
    );
  };

  // Performance Wheels Mouse & Touch Drag Handlers
  const handlePitchBendMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startValue = pitchBend;
    const range = 90; // drag travel pixels

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      let nextValue = startValue - (deltaY / range);
      nextValue = Math.max(-1.0, Math.min(1.0, nextValue));
      setPitchBend(nextValue);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      animateSpringBack();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handlePitchBendTouchStart = (e) => {
    const touch = e.touches[0];
    const startY = touch.clientY;
    const startValue = pitchBend;
    const range = 90;

    const handleTouchMove = (moveEvent) => {
      const touchMove = moveEvent.touches[0];
      const deltaY = touchMove.clientY - startY;
      let nextValue = startValue - (deltaY / range);
      nextValue = Math.max(-1.0, Math.min(1.0, nextValue));
      setPitchBend(nextValue);
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      animateSpringBack();
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const animateSpringBack = () => {
    const startTime = performance.now();
    const duration = 120; // Snap duration in ms
    const startVal = paramsRef.current.pitchBend;

    const tick = (now) => {
      const elapsed = now - startTime;
      if (elapsed < duration) {
        const pct = elapsed / duration;
        setPitchBend(startVal * (1 - pct));
        requestAnimationFrame(tick);
      } else {
        setPitchBend(0);
      }
    };
    requestAnimationFrame(tick);
  };

  const handleModWheelMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startValue = modWheel;
    const range = 90;

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      let nextValue = startValue - (deltaY / range);
      nextValue = Math.max(0.0, Math.min(1.0, nextValue));
      setModWheel(nextValue);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleModWheelTouchStart = (e) => {
    const touch = e.touches[0];
    const startY = touch.clientY;
    const startValue = modWheel;
    const range = 90;

    const handleTouchMove = (moveEvent) => {
      const touchMove = moveEvent.touches[0];
      const deltaY = touchMove.clientY - startY;
      let nextValue = startValue - (deltaY / range);
      nextValue = Math.max(0.0, Math.min(1.0, nextValue));
      setModWheel(nextValue);
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className="midi-synth-wrapper" style={{ maxWidth: '100%' }}>
      {/* UI Scaler Fader */}
      {!embeddedCompactMode && (
        <div className="synth-ui-scaler font-mono">
          <span>UI SCALE: {Math.round(uiScale * 100)}%</span>
          <input 
            type="range" 
            min="0.6" 
            max="1.0" 
            step="0.05" 
            value={uiScale}
            onChange={(e) => setUiScale(Number(e.target.value))}
            className="synth-slider scale-slider"
          />
        </div>
      )}

      <div 
        className={`midi-synth-rack ${layoutMode === 'vertical' ? 'vertical-console' : 'horizontal-console'}`}
        style={{ 
          transform: embeddedCompactMode ? 'scale(0.85)' : `scale(${uiScale})`,
          transformOrigin: 'top center',
          marginBottom: embeddedCompactMode 
            ? '-60px' 
            : (layoutMode === 'vertical' ? `${(1 - uiScale) * -800}px` : `${(1 - uiScale) * -520}px`)
        }}
      >
        <div className="vector-border top"></div>
        <div className="vector-border bottom"></div>

        <div className="synth-faceplate">
          {/* Header Panel */}
          {!embeddedCompactMode && (
            <div className="synth-header">
              <div className="header-left">
                <span className="brand-logo">DELTAVI</span>
                <span className="sub-brand">DUOPHONIC ARIES, LIBRA & LEO CONSOLE</span>
              </div>

              <div className="power-casing">
                <span className="section-title">ENGAGE</span>
                <button 
                  className={`power-switch ${synthOn ? 'power-on' : ''}`}
                  onClick={synthOn ? stopSynth : startSynth}
                  aria-label="Power Switch"
                >
                  <div className="switch-toggle"></div>
                </button>
                <div className={`power-led ${synthOn ? 'led-on' : ''}`}></div>
              </div>

              <div className="voice-allocator">
                <span className="section-title">VOICE MODE {renderMidiLearnBadge('voiceMode')}</span>
                <div className="button-group-row">
                  {['mono', 'duo', 'poly'].map(mode => (
                    <button
                      key={mode}
                      className={`nav-btn ${voiceMode === mode ? 'active' : ''}`}
                      onClick={() => setVoiceMode(mode)}
                      disabled={!synthOn}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sampler Recorder Router */}
              <div className="preset-dashboard" style={{ borderLeft: '1px solid rgba(0,243,255,0.15)', paddingLeft: '15px' }}>
                <span className="section-title" style={{ color: '#ff007f', textShadow: '0 0 4px rgba(255,0,127,0.3)' }}>REC ROUTING</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select 
                    className="preset-select font-mono"
                    style={{ 
                      borderColor: recordingInputMode === 'synth' ? '#ff007f' : 'rgba(255,255,255,0.15)',
                      color: recordingInputMode === 'synth' ? '#ff007f' : '#888',
                      maxWidth: '140px',
                      textShadow: recordingInputMode === 'synth' ? '0 0 3px rgba(255,0,127,0.3)' : 'none'
                    }}
                    value={recordingInputMode === 'synth' ? liveRecTargetSlot : 'None'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'None') {
                        setRecordingInputMode('mic');
                        if (recordingInputModeRef) recordingInputModeRef.current = 'mic';
                      } else {
                        setLiveRecTargetSlot(val);
                        setSelectedEditSlotId(val);
                        setRecordingInputMode('synth');
                        if (recordingTargetSlotIdRef) recordingTargetSlotIdRef.current = val;
                        if (recordingInputModeRef) recordingInputModeRef.current = 'synth';
                      }
                    }}
                >
                  <option value="None">❌ NOT ROUTED</option>
                  <optgroup label="BANK A" style={{ background: '#000', color: '#00f3ff' }}>
                    {Array.from({ length: 8 }).map((_, i) => <option key={`a-${i}`} value={`a0${i+1}`}>A{i+1}</option>)}
                  </optgroup>
                  <optgroup label="BANK B" style={{ background: '#000', color: '#ff007f' }}>
                    {Array.from({ length: 8 }).map((_, i) => <option key={`b-${i}`} value={`b0${i+1}`}>B{i+1}</option>)}
                  </optgroup>
                  <optgroup label="BANK C" style={{ background: '#000', color: '#ffe600' }}>
                    {Array.from({ length: 8 }).map((_, i) => <option key={`c-${i}`} value={`c0${i+1}`}>C{i+1}</option>)}
                  </optgroup>
                </select>

                <div 
                  className={`power-led ${recordingInputMode === 'synth' ? 'led-on' : ''}`}
                  style={{
                    background: recordingInputMode === 'synth' ? '#ff007f' : '#222',
                    boxShadow: recordingInputMode === 'synth' ? '0 0 8px #ff007f' : 'none',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%'
                  }}
                  title={recordingInputMode === 'synth' ? "Synth output routed to sampler looper" : "Routing inactive"}
                ></div>
              </div>
            </div>

            <div className="display-window">
              <div className="telemetry font-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="telemetry-lbl">MIDI IN:</span>
                <select
                  value={selectedMidiDeviceName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedMidiDeviceName(val);
                    localStorage.setItem('deltavi_selected_midi_device', val);
                  }}
                  style={{
                    background: '#000',
                    border: '1px solid rgba(0, 243, 255, 0.4)',
                    color: '#00f3ff',
                    fontSize: '0.45rem',
                    fontFamily: 'monospace',
                    padding: '0 2px',
                    borderRadius: '2px',
                    outline: 'none',
                    cursor: 'pointer',
                    width: '100px',
                    height: '16px',
                    lineHeight: '14px'
                  }}
                >
                  <option value="all">All Devices</option>
                  {midiDevices.map(name => (
                    <option key={name} value={name}>{name.slice(0, 18)}</option>
                  ))}
                </select>
              </div>
              <div className="telemetry font-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', borderBottom: '1px dashed rgba(0, 243, 255, 0.1)', paddingBottom: '2px' }}>
                <span className="telemetry-lbl">RX CHANNEL:</span>
                <select
                  value={synthMidiChannel}
                  onChange={(e) => {
                    const ch = parseInt(e.target.value, 10);
                    setSynthMidiChannel(ch);
                    localStorage.setItem('deltaiv_midi_channel', ch);
                  }}
                  style={{
                    background: '#000',
                    border: '1px solid rgba(0, 243, 255, 0.4)',
                    color: '#00f3ff',
                    fontSize: '0.45rem',
                    fontFamily: 'monospace',
                    padding: '0 2px',
                    borderRadius: '2px',
                    outline: 'none',
                    cursor: 'pointer',
                    height: '14px',
                    lineHeight: '12px'
                  }}
                >
                  <option value={0}>Omni (All)</option>
                  {Array.from({ length: 16 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Ch {i + 1}</option>
                  ))}
                </select>
              </div>
              <div className="telemetry font-mono">
                <span className="telemetry-lbl">EVENT:</span>
                <span className="telemetry-val text-magenta">{lastMidiEvent}</span>
              </div>
              <div className="telemetry font-mono" style={{ borderTop: '1px solid rgba(0, 243, 255, 0.1)', marginTop: '4px', paddingTop: '4px', justifyContent: 'center', gap: '8px' }}>
                <button 
                  onClick={() => setShowLatencyGuide(true)} 
                  className="latency-guide-trigger"
                  type="button"
                >
                  ⚡ ASIO GUIDE
                </button>
                <button 
                  onClick={() => setShowMidiManager(true)} 
                  className="latency-guide-trigger"
                  type="button"
                  style={{ borderColor: '#00ff96', color: '#00ff96' }}
                >
                  🎛️ MIDI MAPPINGS
                </button>
                <button 
                  onClick={() => setShowManual(true)} 
                  className="latency-guide-trigger"
                  type="button"
                  style={{ borderColor: '#ff00ff', color: '#ff00ff' }}
                >
                  📖 USER MANUAL
                </button>
              </div>
            </div>
          </div>
        )}

          <div className="synth-modules-horizontal">
            {!embeddedCompactMode && (
              <>
            
            {/* ROW 1 PANEL 1: ARIES OSCILLATORS */}
            <div className="rack-panel neon-glow-cyan">
              <span className="panel-label">ARIES: OSCILLATOR SECTION</span>
              <div className="control-grid-compact">
                <div className="control-item">
                  <span className="control-label">OSC 1 WAVE {renderMidiLearnBadge('osc1Waveform')}</span>
                  <div className="button-group-row" style={{ flexWrap: 'wrap', gap: '3px' }}>
                    {['sine', 'triangle', 'sawtooth', 'square'].map(w => (
                      <button
                        key={w}
                        className={`wave-btn-synth ${osc1Waveform === w ? 'active' : ''}`}
                        onClick={() => setOsc1Waveform(w)}
                        disabled={!synthOn}
                        style={{ padding: '0.15rem 0.2rem', minWidth: '40px' }}
                      >
                        {w.substring(0, 3).toUpperCase()}
                      </button>
                    ))}
                    <button
                      className={`wave-btn-synth ${['organ', 'vox', 'strings', 'epiano', 'bell', 'synth-bass', 'clavit', 'harmon'].includes(osc1Waveform) ? 'active' : ''}`}
                      onClick={() => setOsc1Waveform(dwgsType)}
                      disabled={!synthOn}
                      style={{ padding: '0.15rem 0.2rem', minWidth: '40px' }}
                    >
                      DWGS
                    </button>
                  </div>
                  {['organ', 'vox', 'strings', 'epiano', 'bell', 'synth-bass', 'clavit', 'harmon'].includes(osc1Waveform) && (
                    <div style={{ marginTop: '4px' }}>
                      <select
                        className="preset-select font-mono"
                        value={dwgsType}
                        onChange={(e) => {
                          setDwgsType(e.target.value);
                          setOsc1Waveform(e.target.value);
                        }}
                        disabled={!synthOn}
                        style={{ width: '100%', fontSize: '0.52rem', padding: '1px' }}
                      >
                        <option value="organ">DWGS: ORGAN</option>
                        <option value="vox">DWGS: VOX (FORMANT)</option>
                        <option value="strings">DWGS: STRINGS</option>
                        <option value="epiano">DWGS: E.PIANO</option>
                        <option value="bell">DWGS: BELL TINES</option>
                        <option value="synth-bass">DWGS: DIGITAL BASS</option>
                        <option value="clavit">DWGS: CLAVINET</option>
                        <option value="harmon">DWGS: HARMONIC SINE</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="control-item slider-row">
                  <span className="control-label">OSC 1 OCT {renderMidiLearnBadge('osc1Pitch')}</span>
                  <input 
                    type="range" 
                    min="-2" 
                    max="2" 
                    value={osc1Pitch}
                    onChange={(e) => setOsc1Pitch(Number(e.target.value))}
                    disabled={!synthOn}
                    className="synth-slider neon-cyan"
                    style={{
                      background: `linear-gradient(to right, #00f3ff 0%, #00f3ff ${((osc1Pitch - (-2)) / 4) * 100}%, #151a21 ${((osc1Pitch - (-2)) / 4) * 100}%, #151a21 100%)`,
                      boxShadow: `0 0 ${4 + ((osc1Pitch - (-2)) / 4) * 12}px rgba(0, 243, 255, ${0.3 + ((osc1Pitch - (-2)) / 4) * 0.7})`,
                      filter: `drop-shadow(0 0 ${((osc1Pitch - (-2)) / 4) * 5}px rgba(0, 243, 255, 0.8))`
                    }}
                  />
                  <span className="fader-value">{osc1Pitch > 0 ? `+${osc1Pitch}` : osc1Pitch}</span>
                </div>

                <div className="control-item slider-row">
                  <span className="control-label">OSC 1 MORPH {renderMidiLearnBadge('osc1Morph')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={osc1Morph}
                    onChange={(e) => setOsc1Morph(Number(e.target.value))}
                    disabled={!synthOn}
                    className="synth-slider neon-cyan"
                    style={{
                      background: `linear-gradient(to right, #00f3ff 0%, #00f3ff ${osc1Morph * 100}%, #151a21 ${osc1Morph * 100}%, #151a21 100%)`,
                      boxShadow: `0 0 ${4 + osc1Morph * 12}px rgba(0, 243, 255, ${0.3 + osc1Morph * 0.7})`,
                      filter: `drop-shadow(0 0 ${osc1Morph * 5}px rgba(0, 243, 255, 0.8))`
                    }}
                  />
                  <span className="fader-value">{Math.round(osc1Morph * 100)}%</span>
                </div>

                <div className="control-item">
                  <span className="control-label">OSC 2 WAVE {renderMidiLearnBadge('osc2Waveform')}</span>
                  <div className="button-group-row">
                    {['sine', 'triangle', 'sawtooth', 'square'].map(w => (
                      <button
                        key={w}
                        className={`wave-btn-synth ${osc2Waveform === w ? 'active' : ''}`}
                        onClick={() => setOsc2Waveform(w)}
                        disabled={!synthOn}
                      >
                        {w.substring(0, 3).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-item slider-row">
                  <span className="control-label">OSC 2 OCT {renderMidiLearnBadge('osc2Pitch')}</span>
                  <input 
                    type="range" 
                    min="-2" 
                    max="2" 
                    value={osc2Pitch}
                    onChange={(e) => setOsc2Pitch(Number(e.target.value))}
                    disabled={!synthOn}
                    className="synth-slider neon-pink"
                    style={{
                      background: `linear-gradient(to right, #ff007f 0%, #ff007f ${((osc2Pitch - (-2)) / 4) * 100}%, #151a21 ${((osc2Pitch - (-2)) / 4) * 100}%, #151a21 100%)`,
                      boxShadow: `0 0 ${4 + ((osc2Pitch - (-2)) / 4) * 12}px rgba(255, 0, 127, ${0.3 + ((osc2Pitch - (-2)) / 4) * 0.7})`,
                      filter: `drop-shadow(0 0 ${((osc2Pitch - (-2)) / 4) * 5}px rgba(255, 0, 127, 0.8))`
                    }}
                  />
                  <span className="fader-value">{osc2Pitch > 0 ? `+${osc2Pitch}` : osc2Pitch}</span>
                </div>

                <div className="control-item slider-row">
                  <span className="control-label">OSC 2 MORPH {renderMidiLearnBadge('osc2Morph')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={osc2Morph}
                    onChange={(e) => setOsc2Morph(Number(e.target.value))}
                    disabled={!synthOn}
                    className="synth-slider neon-pink"
                    style={{
                      background: `linear-gradient(to right, #ff007f 0%, #ff007f ${osc2Morph * 100}%, #151a21 ${osc2Morph * 100}%, #151a21 100%)`,
                      boxShadow: `0 0 ${4 + osc2Morph * 12}px rgba(255, 0, 127, ${0.3 + osc2Morph * 0.7})`,
                      filter: `drop-shadow(0 0 ${osc2Morph * 5}px rgba(255, 0, 127, 0.8))`
                    }}
                  />
                  <span className="fader-value">{Math.round(osc2Morph * 100)}%</span>
                </div>

                <div className="control-item slider-row">
                  <span className="control-label">DETUNE {renderMidiLearnBadge('osc2Detune')}</span>
                  <input 
                    type="range" 
                    min="-50" 
                    max="50" 
                    value={osc2Detune}
                    onChange={(e) => setOsc2Detune(Number(e.target.value))}
                    disabled={!synthOn}
                    className="synth-slider neon-pink"
                    style={{
                      background: `linear-gradient(to right, #ff007f 0%, #ff007f ${((osc2Detune - (-50)) / 100) * 100}%, #151a21 ${((osc2Detune - (-50)) / 100) * 100}%, #151a21 100%)`,
                      boxShadow: `0 0 ${4 + ((osc2Detune - (-50)) / 100) * 12}px rgba(255, 0, 127, ${0.3 + ((osc2Detune - (-50)) / 100) * 0.7})`,
                      filter: `drop-shadow(0 0 ${((osc2Detune - (-50)) / 100) * 5}px rgba(255, 0, 127, 0.8))`
                    }}
                  />
                  <span className="fader-value">{osc2Detune}c</span>
                </div>
              </div>
            </div>

            {/* ROW 1 PANEL 2: VECTRA DUAL-MODULATION HUB */}
            <div className="rack-panel neon-glow-pink">
              <span className="panel-label">VECTRA DUAL-MODULATION HUB</span>
              <div className="control-grid-compact">
                <div style={{ display: 'flex', justifyContent: 'space-around', margin: '0.2rem 0' }}>
                  <Knob
                    value={xMod}
                    onChange={setXMod}
                    min={0.0}
                    max={1.0}
                    step={0.02}
                    label="xMod"
                    defaultValue={0.0}
                    midiLearnParam={midiLearnParam}
                    midiMappings={midiMappings}
                    setMidiLearnParam={setMidiLearnParam}
                    displayFormat={(val) => `${Math.round(val * 100)}%`}
                    glowColor="pink"
                    size={38}
                  />
                  <Knob
                    value={polyModFilterEnv}
                    onChange={setPolyModFilterEnv}
                    min={0.0}
                    max={1.0}
                    step={0.02}
                    label="polyModFilterEnv"
                    defaultValue={0.0}
                    midiLearnParam={midiLearnParam}
                    midiMappings={midiMappings}
                    setMidiLearnParam={setMidiLearnParam}
                    displayFormat={(val) => `${Math.round(val * 100)}%`}
                    glowColor="magenta"
                    size={38}
                  />
                  <Knob
                    value={polyModOsc2}
                    onChange={setPolyModOsc2}
                    min={0.0}
                    max={1.0}
                    step={0.02}
                    label="polyModOsc2"
                    defaultValue={0.0}
                    midiLearnParam={midiLearnParam}
                    midiMappings={midiMappings}
                    setMidiLearnParam={setMidiLearnParam}
                    displayFormat={(val) => `${Math.round(val * 100)}%`}
                    glowColor="cyan"
                    size={38}
                  />
                </div>

                <div className="poly-destinations-grid" style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  <div className="sync-box">
                    <span className="control-label" style={{ fontSize: '0.4rem' }}>DEST: OSC 1 PITCH {renderMidiLearnBadge('polyModOsc1Freq')}</span>
                    <button
                      className={`action-btn-small ${polyModOsc1Freq ? 'active' : ''}`}
                      onClick={() => setPolyModOsc1Freq(!polyModOsc1Freq)}
                      disabled={!synthOn}
                      style={{ fontSize: '0.4rem', padding: '1px 4px' }}
                    >
                      {polyModOsc1Freq ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="sync-box">
                    <span className="control-label" style={{ fontSize: '0.4rem' }}>DEST: OSC 1 PW {renderMidiLearnBadge('polyModOsc1Pw')}</span>
                    <button
                      className={`action-btn-small ${polyModOsc1Pw ? 'active' : ''}`}
                      onClick={() => setPolyModOsc1Pw(!polyModOsc1Pw)}
                      disabled={!synthOn}
                      style={{ fontSize: '0.4rem', padding: '1px 4px' }}
                    >
                      {polyModOsc1Pw ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="sync-box">
                    <span className="control-label" style={{ fontSize: '0.4rem' }}>DEST: VCF CUTOFF {renderMidiLearnBadge('polyModFilter')}</span>
                    <button
                      className={`action-btn-small ${polyModFilter ? 'active' : ''}`}
                      onClick={() => setPolyModFilter(!polyModFilter)}
                      disabled={!synthOn}
                      style={{ fontSize: '0.4rem', padding: '1px 4px' }}
                    >
                      {polyModFilter ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 1 PANEL 3: LEO EXTENSIONS */}
            <div className="rack-panel neon-glow-yellow">
              <span className="panel-label">LEO: ANALOG EXTENSIONS</span>
              <div className="control-grid-compact">
                <div className="control-item slider-row">
                  <span className="control-label">ANALOG DRIFT {renderMidiLearnBadge('oscDrift')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={oscDrift}
                    onChange={(e) => setOscDrift(Number(e.target.value))}
                    disabled={!synthOn}
                    className="synth-slider neon-yellow"
                    style={{
                      background: `linear-gradient(to right, #ffe600 0%, #ffe600 ${oscDrift}%, #151a21 ${oscDrift}%, #151a21 100%)`,
                      boxShadow: `0 0 ${4 + (oscDrift / 100) * 12}px rgba(255, 230, 0, ${0.3 + (oscDrift / 100) * 0.7})`,
                      filter: `drop-shadow(0 0 ${(oscDrift / 100) * 5}px rgba(255, 230, 0, 0.8))`
                    }}
                  />
                  <span className="fader-value">{oscDrift}%</span>
                </div>

                <div className="control-item slider-row">
                  <span className="control-label">UNISON DETUNE {renderMidiLearnBadge('unisonDetune')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={unisonDetune}
                    onChange={(e) => setUnisonDetune(Number(e.target.value))}
                    disabled={!synthOn}
                    className="synth-slider neon-yellow"
                    style={{
                      background: `linear-gradient(to right, #ffe600 0%, #ffe600 ${(unisonDetune / 50) * 100}%, #151a21 ${(unisonDetune / 50) * 100}%, #151a21 100%)`,
                      boxShadow: `0 0 ${4 + (unisonDetune / 50) * 12}px rgba(255, 230, 0, ${0.3 + (unisonDetune / 50) * 0.7})`,
                      filter: `drop-shadow(0 0 ${(unisonDetune / 50) * 5}px rgba(255, 230, 0, 0.8))`
                    }}
                  />
                  <span className="fader-value">{unisonDetune}c</span>
                </div>

                <div className="sync-box">
                  <span className="control-label">HPF BASS BOOST (80Hz) {renderMidiLearnBadge('hpfBassBoost')}</span>
                  <button 
                    className={`action-btn-small ${hpfBassBoost ? 'active' : ''}`}
                    onClick={() => setHpfBassBoost(!hpfBassBoost)}
                    disabled={!synthOn}
                  >
                    {hpfBassBoost ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="sync-box" style={{ marginTop: '0.4rem' }}>
                  <span className="control-label">HARD SYNC / FM {renderMidiLearnBadge('syncMode')}</span>
                  <button 
                    className={`action-btn-small ${syncMode ? 'active' : ''}`}
                    onClick={() => setSyncMode(!syncMode)}
                    disabled={!synthOn}
                  >
                    {syncMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 1 PANEL 4: LIBRA SUB & SATURATION ENGINE */}
            <div className="rack-panel neon-glow-magenta">
              <span className="panel-label">LIBRA: SUB & SATURATION ENGINE</span>
              <div className="control-grid-compact">
                <div className="sync-box">
                  <span className="control-label">FILTER CIRCUIT {renderMidiLearnBadge('filterCircuit')}</span>
                  <div className="button-group-row" style={{ width: '100px' }}>
                    {['classic', 'acid', 'ladder'].map(c => (
                      <button
                        key={c}
                        className={`wave-btn-synth ${filterCircuit === c ? 'active' : ''}`}
                        onClick={() => setFilterCircuit(c)}
                        disabled={!synthOn}
                        style={{ padding: '0.15rem 0.25rem', fontSize: '0.4rem' }}
                      >
                        {c.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-item slider-row">
                  <span className="control-label">FILTER DRIVE {renderMidiLearnBadge('filterDrive')}</span>
                  <input 
                    type="range" 
                    min="0.0" 
                    max="1.0" 
                    step="0.05"
                    value={filterDrive}
                    onChange={(e) => setFilterDrive(Number(e.target.value))}
                    disabled={!synthOn}
                    className="synth-slider neon-magenta"
                    style={{
                      background: `linear-gradient(to right, #ff00ff 0%, #ff00ff ${filterDrive * 100}%, #151a21 ${filterDrive * 100}%, #151a21 100%)`,
                      boxShadow: `0 0 ${4 + filterDrive * 12}px rgba(255, 0, 255, ${0.3 + filterDrive * 0.7})`,
                      filter: `drop-shadow(0 0 ${filterDrive * 5}px rgba(255, 0, 255, 0.8))`
                    }}
                  />
                  <span className="fader-value">{Math.round(filterDrive * 100)}</span>
                </div>

                <div className="control-item">
                  <span className="control-label">SUB SHAPE {renderMidiLearnBadge('subShape')} / OCT {renderMidiLearnBadge('subOctave')}</span>
                  <div className="preset-row" style={{ marginTop: '0.1rem' }}>
                    <select
                      className="preset-select font-mono"
                      value={subShape}
                      onChange={(e) => setSubShape(e.target.value)}
                      disabled={!synthOn}
                      style={{ fontSize: '0.52rem', padding: '1px', maxWidth: '70px' }}
                    >
                      <option value="sine">SINE</option>
                      <option value="square">SQUARE</option>
                      <option value="triangle">TRIANGLE</option>
                    </select>

                    <div className="button-group-row">
                      {[-1, -2].map(o => (
                        <button
                          key={o}
                          className={`wave-btn-synth ${subOctave === o ? 'active' : ''}`}
                          onClick={() => setSubOctave(o)}
                          disabled={!synthOn}
                          style={{ padding: '1px 3px' }}
                        >
                          {o}OCT
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 0, 255, 0.15)', paddingTop: '4px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <div className="sync-box" style={{ flex: 1 }}>
                      <span className="control-label" style={{ fontSize: '0.36rem' }}>SUB FILTER {renderMidiLearnBadge('subFilterType')}</span>
                      <select
                        className="preset-select font-mono"
                        value={subFilterType}
                        onChange={(e) => setSubFilterType(e.target.value)}
                        disabled={!synthOn}
                        style={{ fontSize: '0.42rem', padding: '1px', maxWidth: '75px', background: '#08090d', color: '#ff00ff', border: '1px solid rgba(255,0,255,0.3)' }}
                      >
                        <option value="bypass">BYPASS</option>
                        <option value="lowpass">LOWPASS</option>
                        <option value="highpass">HIGHPASS</option>
                        <option value="bandpass">BANDPASS</option>
                      </select>
                    </div>

                    <div className="sync-box" style={{ flex: 1 }}>
                      <span className="control-label" style={{ fontSize: '0.36rem' }}>ENV LEGATO {renderMidiLearnBadge('monoEnvelopeMode')}</span>
                      <button
                        className={`action-btn-small ${monoEnvelopeMode === 'legato' ? 'active' : ''}`}
                        onClick={() => setMonoEnvelopeMode(prev => prev === 'legato' ? 'retrig' : 'legato')}
                        disabled={!synthOn || voiceMode !== 'mono'}
                        style={{ padding: '2px 4px', fontSize: '0.36rem' }}
                      >
                        {monoEnvelopeMode === 'legato' ? 'LEGATO' : 'RETRIG'}
                      </button>
                    </div>
                  </div>

                  {subFilterType !== 'bypass' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
                      <div className="control-item slider-row" style={{ flex: 1, margin: 0 }}>
                        <span className="control-label" style={{ fontSize: '0.32rem' }}>SUB CUTOFF {renderMidiLearnBadge('subCutoff')}</span>
                        <input 
                          type="range" 
                          min="50" 
                          max="5000" 
                          step="50"
                          value={subCutoff}
                          onChange={(e) => setSubCutoff(Number(e.target.value))}
                          disabled={!synthOn}
                          className="synth-slider neon-magenta"
                          style={{
                            background: `linear-gradient(to right, #ff00ff 0%, #ff00ff ${(subCutoff - 50) / 49.5}%, #151a21 ${(subCutoff - 50) / 49.5}%, #151a21 100%)`,
                            boxShadow: `0 0 4px rgba(255, 0, 255, 0.4)`
                          }}
                        />
                        <span className="fader-value" style={{ fontSize: '0.34rem' }}>{subCutoff}Hz</span>
                      </div>

                      <div className="control-item slider-row" style={{ flex: 1, margin: 0 }}>
                        <span className="control-label" style={{ fontSize: '0.32rem' }}>SUB RES {renderMidiLearnBadge('subResonance')}</span>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="10.0" 
                          step="0.1"
                          value={subResonance}
                          onChange={(e) => setSubResonance(Number(e.target.value))}
                          disabled={!synthOn}
                          className="synth-slider neon-magenta"
                          style={{
                            background: `linear-gradient(to right, #ff00ff 0%, #ff00ff ${(subResonance - 0.1) / 0.099}%, #151a21 ${(subResonance - 0.1) / 0.099}%, #151a21 100%)`,
                            boxShadow: `0 0 4px rgba(255, 0, 255, 0.4)`
                          }}
                        />
                        <span className="fader-value" style={{ fontSize: '0.34rem' }}>{subResonance.toFixed(1)}</span>
                      </div>
                    </div>
                  )}

                  <div className="control-item slider-row" style={{ marginTop: '3px' }}>
                    <span className="control-label" style={{ fontSize: '0.36rem' }}>SUB VCF MOD {renderMidiLearnBadge('subOscFilterMod')}</span>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="1.0" 
                      step="0.05"
                      value={subOscFilterMod}
                      onChange={(e) => setSubOscFilterMod(Number(e.target.value))}
                      disabled={!synthOn}
                      className="synth-slider neon-magenta"
                      style={{
                        background: `linear-gradient(to right, #ff00ff 0%, #ff00ff ${subOscFilterMod * 100}%, #151a21 ${subOscFilterMod * 100}%, #151a21 100%)`,
                        boxShadow: `0 0 ${4 + subOscFilterMod * 12}px rgba(255, 0, 255, ${0.3 + subOscFilterMod * 0.7})`,
                        filter: `drop-shadow(0 0 ${subOscFilterMod * 5}px rgba(255, 0, 255, 0.8))`
                      }}
                    />
                    <span className="fader-value" style={{ fontSize: '0.45rem' }}>{Math.round(subOscFilterMod * 100)}%</span>
                  </div>
                </div>

                {/* Master Saturation Cell */}
                <div style={{ borderTop: '1px solid rgba(255, 0, 255, 0.15)', paddingTop: '6px', marginTop: '6px' }}>
                  <div className="sync-box">
                    <span className="control-label" style={{ fontSize: '0.38rem' }}>SAT MODE {renderMidiLearnBadge('saturationMode')}</span>
                    <div className="button-group-row">
                      {['warm', 'fold', 'decimate'].map(mode => (
                        <button
                          key={mode}
                          className={`wave-btn-synth ${saturationMode === mode ? 'active' : ''}`}
                          onClick={() => setSaturationMode(mode)}
                          disabled={!synthOn}
                          style={{ padding: '1px 3px', fontSize: '0.36rem' }}
                        >
                          {mode === 'warm' ? 'WARM' : mode === 'fold' ? 'FOLD' : 'DEC'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="control-item slider-row" style={{ marginTop: '3px' }}>
                    <span className="control-label" style={{ fontSize: '0.38rem' }}>SAT AMOUNT {renderMidiLearnBadge('saturationAmount')}</span>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="1.0" 
                      step="0.05"
                      value={saturationAmount}
                      onChange={(e) => setSaturationAmount(Number(e.target.value))}
                      disabled={!synthOn}
                      className="synth-slider neon-magenta"
                      style={{
                        background: `linear-gradient(to right, #ff00ff 0%, #ff00ff ${saturationAmount * 100}%, #151a21 ${saturationAmount * 100}%, #151a21 100%)`,
                        boxShadow: `0 0 ${4 + saturationAmount * 12}px rgba(255, 0, 255, ${0.3 + saturationAmount * 0.7})`,
                        filter: `drop-shadow(0 0 ${saturationAmount * 5}px rgba(255, 0, 255, 0.8))`
                      }}
                    />
                    <span className="fader-value" style={{ fontSize: '0.45rem' }}>{Math.round(saturationAmount * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2 PANEL 1: LFO 1 MODULATION */}
            <div className="rack-panel neon-glow-yellow">
              <span className="panel-label">LFO 1 MODULATION</span>
              <div className="control-grid-compact">
                <div style={{ display: 'flex', justifyContent: 'space-around', margin: '0.4rem 0' }}>
                  <Knob
                    value={lfoRate}
                    onChange={setLfoRate}
                    min={0.5}
                    max={20}
                    step={0.5}
                    label="lfoRate"
                    defaultValue={3.5}
                    midiLearnParam={midiLearnParam}
                    midiMappings={midiMappings}
                    setMidiLearnParam={setMidiLearnParam}
                    displayFormat={(val) => `${val}Hz`}
                    glowColor="yellow"
                    size={42}
                  />
                  <Knob
                    value={lfoDepth}
                    onChange={setLfoDepth}
                    min={0}
                    max={1000}
                    step={10}
                    label="lfoDepth"
                    defaultValue={0}
                    midiLearnParam={midiLearnParam}
                    midiMappings={midiMappings}
                    setMidiLearnParam={setMidiLearnParam}
                    displayFormat={(val) => val}
                    glowColor="yellow"
                    size={42}
                  />
                </div>

                <div className="control-item">
                  <span className="control-label">LFO 1 TARGET {renderMidiLearnBadge('lfoTarget')}</span>
                  <div className="button-group-row">
                    {['none', 'pitch', 'filter'].map(t => (
                      <button
                        key={t}
                        className={`wave-btn-synth ${lfoTarget === t ? 'active' : ''}`}
                        onClick={() => setLfoTarget(t)}
                        disabled={!synthOn}
                      >
                        {t.substring(0, 4).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sync-box">
                  <span className="control-label">LFO 1 KEY SYNC {renderMidiLearnBadge('lfoKeySync')}</span>
                  <button
                    className={`action-btn-small ${lfoKeySync ? 'active' : ''}`}
                    onClick={() => setLfoKeySync(!lfoKeySync)}
                    disabled={!synthOn}
                  >
                    {lfoKeySync ? 'SYNC' : 'FREE'}
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 2 PANEL 2: LFO 2 MODULATION */}
            <div className="rack-panel neon-glow-pink">
              <span className="panel-label">LFO 2 MODULATION</span>
              <div className="control-grid-compact">
                <div style={{ display: 'flex', justifyContent: 'space-around', margin: '0.2rem 0' }}>
                  <Knob
                    value={lfo2Rate}
                    onChange={setLfo2Rate}
                    min={0.5}
                    max={20}
                    step={0.5}
                    label="lfo2Rate"
                    defaultValue={5.0}
                    midiLearnParam={midiLearnParam}
                    midiMappings={midiMappings}
                    setMidiLearnParam={setMidiLearnParam}
                    displayFormat={(val) => `${val}Hz`}
                    glowColor="pink"
                    size={42}
                  />
                  <Knob
                    value={lfo2Depth}
                    onChange={setLfo2Depth}
                    min={0}
                    max={1000}
                    step={10}
                    label="lfo2Depth"
                    defaultValue={0}
                    midiLearnParam={midiLearnParam}
                    midiMappings={midiMappings}
                    setMidiLearnParam={setMidiLearnParam}
                    displayFormat={(val) => val}
                    glowColor="pink"
                    size={42}
                  />
                </div>

                <div className="control-item">
                  <span className="control-label">LFO 2 SHAPE {renderMidiLearnBadge('lfo2Shape')}</span>
                  <div className="button-group-row">
                    {['sine', 'triangle', 'sawtooth', 'square'].map(s => (
                      <button
                        key={s}
                        className={`wave-btn-synth ${lfo2Shape === s ? 'active' : ''}`}
                        onClick={() => setLfo2Shape(s)}
                        disabled={!synthOn}
                        style={{ padding: '0.15rem 0.2rem', fontSize: '0.42rem' }}
                      >
                        {s.substring(0, 3).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-item">
                  <span className="control-label">LFO 2 TARGET {renderMidiLearnBadge('lfo2Target')}</span>
                  <div className="button-group-row">
                    {['none', 'pitch', 'filter', 'volume'].map(t => (
                      <button
                        key={t}
                        className={`wave-btn-synth ${lfo2Target === t ? 'active' : ''}`}
                        onClick={() => setLfo2Target(t)}
                        disabled={!synthOn}
                        style={{ padding: '0.15rem 0.2rem', fontSize: '0.42rem' }}
                      >
                        {t.substring(0, 4).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sync-box">
                  <span className="control-label">LFO 2 KEY SYNC {renderMidiLearnBadge('lfo2KeySync')}</span>
                  <button
                    className={`action-btn-small ${lfo2KeySync ? 'active' : ''}`}
                    onClick={() => setLfo2KeySync(!lfo2KeySync)}
                    disabled={!synthOn}
                  >
                    {lfo2KeySync ? 'SYNC' : 'FREE'}
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 2 PANEL 3: SIGNAL MIXER */}
            <div className="rack-panel neon-glow-cyan">
              <span className="panel-label">SIGNAL MIXER</span>
              <div className="mixer-sliders-grid">
                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.38rem' }}>OSC 1 {renderMidiLearnBadge('osc1Vol')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={osc1Vol}
                    onChange={(e) => setOsc1Vol(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-cyan"
                    style={{
                      boxShadow: `0 0 ${3 + osc1Vol * 14}px rgba(0, 243, 255, ${0.3 + osc1Vol * 0.7})`,
                      filter: `drop-shadow(0 0 ${osc1Vol * 6}px rgba(0, 243, 255, 0.85))`
                    }}
                  />
                  <span className="fader-value">{Math.round(osc1Vol * 100)}</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.38rem' }}>OSC 2 {renderMidiLearnBadge('osc2Vol')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={osc2Vol}
                    onChange={(e) => setOsc2Vol(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-pink"
                    style={{
                      boxShadow: `0 0 ${3 + osc2Vol * 14}px rgba(255, 0, 127, ${0.3 + osc2Vol * 0.7})`,
                      filter: `drop-shadow(0 0 ${osc2Vol * 6}px rgba(255, 0, 127, 0.85))`
                    }}
                  />
                  <span className="fader-value">{Math.round(osc2Vol * 100)}</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.38rem' }}>RING {renderMidiLearnBadge('ringModVol')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={ringModVol}
                    onChange={(e) => setRingModVol(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-magenta"
                    style={{
                      boxShadow: `0 0 ${3 + ringModVol * 14}px rgba(255, 0, 255, ${0.3 + ringModVol * 0.7})`,
                      filter: `drop-shadow(0 0 ${ringModVol * 6}px rgba(255, 0, 255, 0.85))`
                    }}
                  />
                  <span className="fader-value">{Math.round(ringModVol * 100)}</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.38rem' }}>SUB {renderMidiLearnBadge('subVolume')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={subVolume}
                    onChange={(e) => setSubVolume(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-yellow"
                    style={{
                      boxShadow: `0 0 ${3 + subVolume * 14}px rgba(255, 230, 0, ${0.3 + subVolume * 0.7})`,
                      filter: `drop-shadow(0 0 ${subVolume * 6}px rgba(255, 230, 0, 0.85))`
                    }}
                  />
                  <span className="fader-value">{Math.round(subVolume * 100)}</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.38rem' }}>NOISE {renderMidiLearnBadge('noiseVolume')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="0.5" 
                    step="0.05"
                    value={noiseVolume}
                    onChange={(e) => setNoiseVolume(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-green"
                    style={{
                      boxShadow: `0 0 ${3 + (noiseVolume / 0.5) * 14}px rgba(0, 255, 150, ${0.3 + (noiseVolume / 0.5) * 0.7})`,
                      filter: `drop-shadow(0 0 ${(noiseVolume / 0.5) * 6}px rgba(0, 255, 150, 0.85))`
                    }}
                  />
                  <span className="fader-value">{Math.round(noiseVolume * 200)}</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.38rem' }}>FEEDBACK {renderMidiLearnBadge('feedbackVol')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={feedbackVol}
                    onChange={(e) => setFeedbackVol(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-yellow"
                    style={{
                      boxShadow: `0 0 ${3 + feedbackVol * 14}px rgba(255, 230, 0, ${0.3 + feedbackVol * 0.7})`,
                      filter: `drop-shadow(0 0 ${feedbackVol * 6}px rgba(255, 230, 0, 0.85))`
                    }}
                  />
                  <span className="fader-value">{Math.round(feedbackVol * 100)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px', width: '100%', alignItems: 'center' }}>
                <span className="control-label" style={{ fontSize: '0.38rem' }}>FEEDBACK FILTER {renderMidiLearnBadge('feedbackFilterType')}</span>
                <div className="button-group-row" style={{ width: '100%', display: 'flex', gap: '4px' }}>
                  {['bypass', 'lowpass', 'highpass'].map(type => (
                    <button
                      key={type}
                      className={`wave-btn-synth ${feedbackFilterType === type ? 'active' : ''}`}
                      onClick={() => setFeedbackFilterType(type)}
                      disabled={!synthOn}
                      style={{ padding: '0.15rem 0.2rem', fontSize: '0.38rem', flex: 1, textAlign: 'center' }}
                    >
                      {type === 'bypass' ? 'BYPASS' : type === 'lowpass' ? 'LPF' : 'HPF'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 2 PANEL 4: VCF RESONANT FILTER */}
            <div className="rack-panel neon-glow-green">
              <span className="panel-label">VCF RESONANT FILTER</span>
              <div className="control-grid-compact">
                <div className="control-item">
                  <span className="control-label">FILTER TYPE</span>
                  <div className="button-group-row">
                    {['lowpass', 'bandpass', 'highpass'].map(t => (
                      <button
                        key={t}
                        className={`wave-btn-synth ${filterType === t ? 'active' : ''}`}
                        onClick={() => setFilterType(t)}
                        disabled={!synthOn || filterCircuit === 'acid' || filterCircuit === 'ladder'}
                      >
                        {t.substring(0, 4).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', margin: '0.4rem 0' }}>
                  <Knob
                    value={cutoff}
                    onChange={setCutoff}
                    min={100}
                    max={4000}
                    step={50}
                    label="cutoff"
                    defaultValue={900}
                    midiLearnParam={midiLearnParam}
                    midiMappings={midiMappings}
                    setMidiLearnParam={setMidiLearnParam}
                    displayFormat={(val) => `${val}Hz`}
                    glowColor="green"
                    size={42}
                  />
                  <Knob
                    value={resonance}
                    onChange={setResonance}
                    min={0.5}
                    max={14}
                    step={0.5}
                    label="resonance"
                    defaultValue={4.0}
                    midiLearnParam={midiLearnParam}
                    midiMappings={midiMappings}
                    setMidiLearnParam={setMidiLearnParam}
                    displayFormat={(val) => val.toFixed(1)}
                    glowColor="green"
                    size={42}
                  />
                  <Knob
                    value={filterEnvAmt}
                    onChange={setFilterEnvAmt}
                    min={0}
                    max={3000}
                    step={100}
                    label="filterEnvAmt"
                    defaultValue={1000}
                    midiLearnParam={midiLearnParam}
                    midiMappings={midiMappings}
                    setMidiLearnParam={setMidiLearnParam}
                    displayFormat={(val) => `+${val}Hz`}
                    glowColor="green"
                    size={42}
                  />
                </div>
              </div>
            </div>

            {/* ROW 3 PANEL 1: VCF FILTER ENVELOPE (ADSR) */}
            <div className="rack-panel neon-glow-green">
              <span className="panel-label">VCF FILTER ENVELOPE</span>
              <div className="mixer-sliders-grid">
                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.4rem' }}>ATTACK {renderMidiLearnBadge('filterAttack')}</span>
                  <input 
                    type="range" 
                    min="0.01" 
                    max="2.0" 
                    step="0.05"
                    value={filterAttack}
                    onChange={(e) => setFilterAttack(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-green"
                    style={{
                      boxShadow: `0 0 ${3 + (filterAttack / 2) * 14}px rgba(0, 255, 150, ${0.3 + (filterAttack / 2) * 0.7})`,
                      filter: `drop-shadow(0 0 ${(filterAttack / 2) * 6}px rgba(0, 255, 150, 0.85))`
                    }}
                  />
                  <span className="fader-value">{filterAttack}s</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.4rem' }}>DECAY {renderMidiLearnBadge('filterDecay')}</span>
                  <input 
                    type="range" 
                    min="0.01" 
                    max="2.0" 
                    step="0.05"
                    value={filterDecay}
                    onChange={(e) => setFilterDecay(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-green"
                    style={{
                      boxShadow: `0 0 ${3 + (filterDecay / 2) * 14}px rgba(0, 255, 150, ${0.3 + (filterDecay / 2) * 0.7})`,
                      filter: `drop-shadow(0 0 ${(filterDecay / 2) * 6}px rgba(0, 255, 150, 0.85))`
                    }}
                  />
                  <span className="fader-value">{filterDecay}s</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.4rem' }}>SUSTAIN {renderMidiLearnBadge('filterSustain')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={filterSustain}
                    onChange={(e) => setFilterSustain(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-green"
                    style={{
                      boxShadow: `0 0 ${3 + filterSustain * 14}px rgba(0, 255, 150, ${0.3 + filterSustain * 0.7})`,
                      filter: `drop-shadow(0 0 ${filterSustain * 6}px rgba(0, 255, 150, 0.85))`
                    }}
                  />
                  <span className="fader-value">{Math.round(filterSustain * 100)}%</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.4rem' }}>RELEASE {renderMidiLearnBadge('filterRelease')}</span>
                  <input 
                    type="range" 
                    min="0.01" 
                    max="3.0" 
                    step="0.05"
                    value={filterRelease}
                    onChange={(e) => setFilterRelease(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-green"
                    style={{
                      boxShadow: `0 0 ${3 + (filterRelease / 3) * 14}px rgba(0, 255, 150, ${0.3 + (filterRelease / 3) * 0.7})`,
                      filter: `drop-shadow(0 0 ${(filterRelease / 3) * 6}px rgba(0, 255, 150, 0.85))`
                    }}
                  />
                  <span className="fader-value">{filterRelease}s</span>
                </div>
              </div>
            </div>

            {/* ROW 3 PANEL 2: VCA AMPLIFIER ENVELOPE (ADSR) */}
            <div className="rack-panel neon-glow-cyan">
              <span className="panel-label">VCA AMPLIFIER ENVELOPE</span>
              <div className="mixer-sliders-grid">
                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.4rem' }}>ATTACK {renderMidiLearnBadge('attack')}</span>
                  <input 
                    type="range" 
                    min="0.01" 
                    max="2.0" 
                    step="0.05"
                    value={attack}
                    onChange={(e) => setAttack(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-cyan"
                    style={{
                      boxShadow: `0 0 ${3 + (attack / 2) * 14}px rgba(0, 243, 255, ${0.3 + (attack / 2) * 0.7})`,
                      filter: `drop-shadow(0 0 ${(attack / 2) * 6}px rgba(0, 243, 255, 0.85))`
                    }}
                  />
                  <span className="fader-value">{attack}s</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.4rem' }}>DECAY {renderMidiLearnBadge('decay')}</span>
                  <input 
                    type="range" 
                    min="0.01" 
                    max="2.0" 
                    step="0.05"
                    value={decay}
                    onChange={(e) => setDecay(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-cyan"
                    style={{
                      boxShadow: `0 0 ${3 + (decay / 2) * 14}px rgba(0, 243, 255, ${0.3 + (decay / 2) * 0.7})`,
                      filter: `drop-shadow(0 0 ${(decay / 2) * 6}px rgba(0, 243, 255, 0.85))`
                    }}
                  />
                  <span className="fader-value">{decay}s</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.4rem' }}>SUSTAIN {renderMidiLearnBadge('sustain')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={sustain}
                    onChange={(e) => setSustain(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-cyan"
                    style={{
                      boxShadow: `0 0 ${3 + sustain * 14}px rgba(0, 243, 255, ${0.3 + sustain * 0.7})`,
                      filter: `drop-shadow(0 0 ${sustain * 6}px rgba(0, 243, 255, 0.85))`
                    }}
                  />
                  <span className="fader-value">{Math.round(sustain * 100)}%</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.4rem' }}>RELEASE {renderMidiLearnBadge('release')}</span>
                  <input 
                    type="range" 
                    min="0.01" 
                    max="3.0" 
                    step="0.05"
                    value={release}
                    onChange={(e) => setRelease(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-cyan"
                    style={{
                      boxShadow: `0 0 ${3 + (release / 3) * 14}px rgba(0, 243, 255, ${0.3 + (release / 3) * 0.7})`,
                      filter: `drop-shadow(0 0 ${(release / 3) * 6}px rgba(0, 243, 255, 0.85))`
                    }}
                  />
                  <span className="fader-value">{release}s</span>
                </div>

                <div className="fader-col">
                  <span className="control-label" style={{ fontSize: '0.4rem' }}>MASTER {renderMidiLearnBadge('volume')}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    disabled={!synthOn}
                    className="adsr-fader neon-yellow"
                    style={{
                      boxShadow: `0 0 ${3 + volume * 14}px rgba(255, 230, 0, ${0.3 + volume * 0.7})`,
                      filter: `drop-shadow(0 0 ${volume * 6}px rgba(255, 230, 0, 0.85))`
                    }}
                  />
                  <span className="fader-value">{Math.round(volume * 100)}</span>
                </div>
              </div>
            </div>

            {/* ROW 3 PANEL 3: ARPEGGIATOR & MASTER MULTI-FX (Spans 2 columns) */}
            <div className="rack-panel arp-fx-panel-span neon-glow-yellow">
              <span className="panel-label">ARPEGGIATOR & MULTI-FX</span>
              
              <div className="button-group-row" style={{ marginBottom: '0.2rem', gap: '0.12rem', width: '100%', display: 'flex' }}>
                {['space', 'mod', 'arp', 'master', 'comp'].map(tab => (
                  <button
                    key={tab}
                    className={`nav-btn ${fxTab === tab ? 'active' : ''}`}
                    onClick={() => setFxTab(tab)}
                    style={{ padding: '0.1rem 0.12rem', fontSize: '0.4rem', flex: 1, textAlign: 'center' }}
                  >
                    {tab === 'master' ? 'AMP' : tab.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="control-grid-compact" style={{ height: '100%', justifyContent: 'space-around' }}>
                
                {/* SPACE TAB: Delay & Reverb */}
                {fxTab === 'space' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'space-around', margin: '0.2rem 0' }}>
                    <Knob
                      value={delayTime}
                      onChange={setDelayTime}
                      min={0.05}
                      max={1.5}
                      step={0.05}
                      label="delayTime"
                      defaultValue={0.3}
                      midiLearnParam={midiLearnParam}
                      midiMappings={midiMappings}
                      setMidiLearnParam={setMidiLearnParam}
                      displayFormat={(val) => `${val}s`}
                      glowColor="yellow"
                      size={40}
                    />
                    <Knob
                      value={delayMix}
                      onChange={setDelayMix}
                      min={0}
                      max={0.80}
                      step={0.05}
                      label="delayMix"
                      defaultValue={0.2}
                      midiLearnParam={midiLearnParam}
                      midiMappings={midiMappings}
                      setMidiLearnParam={setMidiLearnParam}
                      displayFormat={(val) => `${Math.round(val * 100)}%`}
                      glowColor="yellow"
                      size={40}
                    />
                    <Knob
                      value={reverbMix}
                      onChange={setReverbMix}
                      min={0}
                      max={0.90}
                      step={0.05}
                      label="reverbMix"
                      defaultValue={0.0}
                      midiLearnParam={midiLearnParam}
                      midiMappings={midiMappings}
                      setMidiLearnParam={setMidiLearnParam}
                      displayFormat={(val) => `${Math.round(val * 100)}%`}
                      glowColor="green"
                      size={40}
                    />
                    <Knob
                      value={reverbDecay}
                      onChange={setReverbDecay}
                      min={0.5}
                      max={5.0}
                      step={0.1}
                      label="reverbDecay"
                      defaultValue={1.5}
                      midiLearnParam={midiLearnParam}
                      midiMappings={midiMappings}
                      setMidiLearnParam={setMidiLearnParam}
                      displayFormat={(val) => `${val}s`}
                      glowColor="green"
                      size={40}
                    />
                  </div>
                )}

                {/* MOD TAB: Chorus, Flanger, Phaser */}
                {fxTab === 'mod' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'space-around', margin: '0.2rem 0' }}>
                    <Knob
                      value={chorusDepth}
                      onChange={setChorusDepth}
                      min={0}
                      max={1.0}
                      step={0.05}
                      label="chorusDepth"
                      defaultValue={0.25}
                      midiLearnParam={midiLearnParam}
                      midiMappings={midiMappings}
                      setMidiLearnParam={setMidiLearnParam}
                      displayFormat={(val) => `${Math.round(val * 100)}%`}
                      glowColor="magenta"
                      size={38}
                    />
                    <Knob
                      value={flangerMix}
                      onChange={setFlangerMix}
                      min={0}
                      max={0.80}
                      step={0.05}
                      label="flangerMix"
                      defaultValue={0.0}
                      midiLearnParam={midiLearnParam}
                      midiMappings={midiMappings}
                      setMidiLearnParam={setMidiLearnParam}
                      displayFormat={(val) => `${Math.round(val * 100)}%`}
                      glowColor="cyan"
                      size={38}
                    />
                    <Knob
                      value={flangerFeedback}
                      onChange={setFlangerFeedback}
                      min={0}
                      max={0.85}
                      step={0.05}
                      label="flangerFeedback"
                      defaultValue={0.3}
                      midiLearnParam={midiLearnParam}
                      midiMappings={midiMappings}
                      setMidiLearnParam={setMidiLearnParam}
                      displayFormat={(val) => `${Math.round(val * 100)}%`}
                      glowColor="cyan"
                      size={38}
                    />
                    <Knob
                      value={phaserMix}
                      onChange={setPhaserMix}
                      min={0}
                      max={0.85}
                      step={0.05}
                      label="phaserMix"
                      defaultValue={0.0}
                      midiLearnParam={midiLearnParam}
                      midiMappings={midiMappings}
                      setMidiLearnParam={setMidiLearnParam}
                      displayFormat={(val) => `${Math.round(val * 100)}%`}
                      glowColor="pink"
                      size={38}
                    />
                  </div>
                )}

                {/* ARP TAB: Arpeggiator Settings */}
                {fxTab === 'arp' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                    <div className="sync-box">
                      <span className="control-label">ARP {renderMidiLearnBadge('arpOn')}</span>
                      <button 
                        className={`action-btn-small ${arpOn ? 'active' : ''}`}
                        onClick={() => setArpOn(!arpOn)}
                        disabled={!synthOn}
                      >
                        {arpOn ? 'ON' : 'OFF'}
                      </button>
                      <span className="control-label" style={{ marginLeft: '10px' }}>BPM {renderMidiLearnBadge('arpBpm')}</span>
                      <input 
                        type="range" 
                        min="60" 
                        max="220" 
                        step="5"
                        value={arpBpm}
                        onChange={(e) => setArpBpm(Number(e.target.value))}
                        disabled={!synthOn || !arpOn}
                        className="synth-slider neon-yellow"
                        style={{
                          background: `linear-gradient(to right, #ffe600 0%, #ffe600 ${((arpBpm - 60) / 160) * 100}%, #151a21 ${((arpBpm - 60) / 160) * 100}%, #151a21 100%)`,
                          boxShadow: `0 0 ${4 + ((arpBpm - 60) / 160) * 12}px rgba(255, 230, 0, ${0.3 + ((arpBpm - 60) / 160) * 0.7})`,
                          filter: `drop-shadow(0 0 ${((arpBpm - 60) / 160) * 5}px rgba(255, 230, 0, 0.8))`,
                          width: '60px'
                        }}
                      />
                      <span className="fader-value">{arpBpm}</span>
                    </div>

                    <div className="control-item">
                      <span className="control-label">ARP PATTERN {renderMidiLearnBadge('arpPattern')}</span>
                      <select
                        className="preset-select font-mono"
                        value={arpPattern}
                        onChange={(e) => setArpPattern(e.target.value)}
                        disabled={!synthOn || !arpOn}
                        style={{ fontSize: '0.52rem', padding: '2px', maxWidth: '100%' }}
                      >
                        <option value="up">UP</option>
                        <option value="down">DOWN</option>
                        <option value="up-down">UP & DOWN</option>
                        <option value="down-up">DOWN & UP</option>
                        <option value="random">RANDOM</option>
                        <option value="chord">CHORD</option>
                      </select>
                    </div>

                    <div className="control-item" style={{ marginTop: '0.15rem' }}>
                      <span className="control-label">RATE DIVISION {renderMidiLearnBadge('arpDivision')}</span>
                      <select
                        className="preset-select font-mono"
                        value={arpDivision}
                        onChange={(e) => setArpDivision(Number(e.target.value))}
                        disabled={!synthOn || !arpOn}
                        style={{ fontSize: '0.52rem', padding: '2px', maxWidth: '100%' }}
                      >
                        <option value="1">1 (Whole Note)</option>
                        <option value="2">2 (Half Note)</option>
                        <option value="4">4 (Quarter Note)</option>
                        <option value="8">8 (8th Note)</option>
                        <option value="12">12 (8th Triplet)</option>
                        <option value="16">16 (16th Note)</option>
                        <option value="24">24 (16th Triplet)</option>
                        <option value="32">32 (32nd Note)</option>
                        <option value="64">64 (64th Note)</option>
                        <option value="128">128 (128th Note)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* AMP / MASTER TAB */}
                {fxTab === 'master' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', padding: '0 8px' }}>
                    {/* Audio Output Selector for DAW Routing */}
                    <div className="control-item" style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                      <span className="control-label" style={{ fontSize: '0.36rem', color: '#ff00ff' }}>
                        AUDIO OUTPUT ROUTING (DAW LINK)
                      </span>
                      <select
                        className="preset-select font-mono"
                        value={selectedDevice}
                        onChange={(e) => handleDeviceChange(e.target.value)}
                        style={{
                          fontSize: '0.45rem',
                          padding: '2px',
                          width: '100%',
                          background: '#0a0d14',
                          border: '1px solid rgba(255, 0, 255, 0.4)',
                          color: '#fff',
                          boxShadow: '0 0 5px rgba(255, 0, 255, 0.15)'
                        }}
                      >
                        <option value="default">DEFAULT SYSTEM OUTPUT</option>
                        {audioDevices.map(d => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `OUTPUT DEVICE (${d.deviceId.substring(0, 8)})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pre-amp Drive and EQ Controls */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', justifyContent: 'space-around', margin: '2px 0' }}>
                      <Knob
                        value={ampDrive}
                        onChange={setAmpDrive}
                        min={1.0}
                        max={10.0}
                        step={0.1}
                        label="ampDrive"
                        defaultValue={1.0}
                        midiLearnParam={midiLearnParam}
                        midiMappings={midiMappings}
                        setMidiLearnParam={setMidiLearnParam}
                        displayFormat={(val) => `${val.toFixed(1)}x`}
                        glowColor="magenta"
                        size={36}
                      />
                      <Knob
                        value={ampBass}
                        onChange={setAmpBass}
                        min={-12}
                        max={12}
                        step={1}
                        label="ampBass"
                        defaultValue={0}
                        midiLearnParam={midiLearnParam}
                        midiMappings={midiMappings}
                        setMidiLearnParam={setMidiLearnParam}
                        displayFormat={(val) => `${val > 0 ? '+' : ''}${val}dB`}
                        glowColor="cyan"
                        size={36}
                      />
                      <Knob
                        value={ampMid}
                        onChange={setAmpMid}
                        min={-12}
                        max={12}
                        step={1}
                        label="ampMid"
                        defaultValue={0}
                        midiLearnParam={midiLearnParam}
                        midiMappings={midiMappings}
                        setMidiLearnParam={setMidiLearnParam}
                        displayFormat={(val) => `${val > 0 ? '+' : ''}${val}dB`}
                        glowColor="cyan"
                        size={36}
                      />
                      <Knob
                        value={ampTreble}
                        onChange={setAmpTreble}
                        min={-12}
                        max={12}
                        step={1}
                        label="ampTreble"
                        defaultValue={0}
                        midiLearnParam={midiLearnParam}
                        midiMappings={midiMappings}
                        setMidiLearnParam={setMidiLearnParam}
                        displayFormat={(val) => `${val > 0 ? '+' : ''}${val}dB`}
                        glowColor="cyan"
                        size={36}
                      />
                    </div>

                    {/* Cabinet Selection & Master FX Knobs */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div className="control-item" style={{ flex: 1 }}>
                        <span className="control-label" style={{ fontSize: '0.36rem' }}>CABINET EMULATION</span>
                        <div className="button-group-row" style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                          {['bypass', 'tweed', 'stack', 'combo'].map(cab => (
                            <button
                              key={cab}
                              className={`wave-btn-synth ${cabType === cab ? 'active' : ''}`}
                              onClick={() => setCabType(cab)}
                              disabled={!synthOn}
                              style={{ padding: '1px 2px', fontSize: '0.34rem', flex: 1 }}
                            >
                              {cab.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Knob
                          value={volume}
                          onChange={setVolume}
                          min={0.0}
                          max={1.0}
                          step={0.02}
                          label="volume"
                          defaultValue={0.5}
                          midiLearnParam={midiLearnParam}
                          midiMappings={midiMappings}
                          setMidiLearnParam={setMidiLearnParam}
                          displayFormat={(val) => `${Math.round(val * 100)}%`}
                          glowColor="yellow"
                          size={36}
                        />
                        <Knob
                          value={stereoWidth}
                          onChange={setStereoWidth}
                          min={0.0}
                          max={2.0}
                          step={0.02}
                          label="stereoWidth"
                          defaultValue={1.0}
                          midiLearnParam={midiLearnParam}
                          midiMappings={midiMappings}
                          setMidiLearnParam={setMidiLearnParam}
                          displayFormat={(val) => `${Math.round(val * 100)}%`}
                          glowColor="cyan"
                          size={36}
                        />
                        <Knob
                          value={haasDelay}
                          onChange={setHaasDelay}
                          min={0.0}
                          max={0.04}
                          step={0.001}
                          label="haasDelay"
                          defaultValue={0.0}
                          midiLearnParam={midiLearnParam}
                          midiMappings={midiMappings}
                          setMidiLearnParam={setMidiLearnParam}
                          displayFormat={(val) => val === 0 ? 'OFF' : `${Math.round(val * 1000)}ms`}
                          glowColor="magenta"
                          size={36}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* COMPRESSOR TAB */}
                {fxTab === 'comp' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', padding: '0 8px' }}>
                    {/* Header Row with Toggle and GR Meter */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
                      <div className="sync-box" style={{ flex: 1 }}>
                        <span className="control-label" style={{ fontSize: '0.36rem', color: '#ff00ff' }}>
                          COMPRESSOR {renderMidiLearnBadge('compOn')}
                        </span>
                        <button
                          className={`action-btn-small ${compOn ? 'active' : ''}`}
                          onClick={() => setCompOn(!compOn)}
                          disabled={!synthOn}
                          style={{ padding: '1px 8px', fontSize: '0.38rem' }}
                        >
                          {compOn ? 'ACTIVE' : 'BYPASS'}
                        </button>
                      </div>
                      
                      {/* Gain Reduction Meter Canvas */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'flex-end' }}>
                        <span className="control-label" style={{ fontSize: '0.3rem', color: '#ffe600' }}>GAIN REDUCTION</span>
                        <canvas
                          ref={grCanvasRef}
                          width="120"
                          height="14"
                          style={{
                            background: '#070a0f',
                            border: '1px solid rgba(255, 230, 0, 0.3)',
                            borderRadius: '2px',
                            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Compressor Control Knobs */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', justifyContent: 'space-around', margin: '2px 0' }}>
                      <Knob
                        value={compThreshold}
                        onChange={setCompThreshold}
                        min={-60}
                        max={0}
                        step={1}
                        label="compThreshold"
                        defaultValue={-24}
                        midiLearnParam={midiLearnParam}
                        midiMappings={midiMappings}
                        setMidiLearnParam={setMidiLearnParam}
                        displayFormat={(val) => `${val}dB`}
                        glowColor="pink"
                        size={36}
                      />
                      <Knob
                        value={compRatio}
                        onChange={setCompRatio}
                        min={1.0}
                        max={20.0}
                        step={0.5}
                        label="compRatio"
                        defaultValue={4.0}
                        midiLearnParam={midiLearnParam}
                        midiMappings={midiMappings}
                        setMidiLearnParam={setMidiLearnParam}
                        displayFormat={(val) => `${val.toFixed(1)}:1`}
                        glowColor="yellow"
                        size={36}
                      />
                      <Knob
                        value={compAttack}
                        onChange={setCompAttack}
                        min={0.001}
                        max={0.1}
                        step={0.001}
                        label="compAttack"
                        defaultValue={0.01}
                        midiLearnParam={midiLearnParam}
                        midiMappings={midiMappings}
                        setMidiLearnParam={setMidiLearnParam}
                        displayFormat={(val) => `${Math.round(val * 1000)}ms`}
                        glowColor="cyan"
                        size={36}
                      />
                      <Knob
                        value={compRelease}
                        onChange={setCompRelease}
                        min={0.01}
                        max={1.0}
                        step={0.01}
                        label="compRelease"
                        defaultValue={0.25}
                        midiLearnParam={midiLearnParam}
                        midiMappings={midiMappings}
                        setMidiLearnParam={setMidiLearnParam}
                        displayFormat={(val) => `${Math.round(val * 1000)}ms`}
                        glowColor="cyan"
                        size={36}
                      />
                      <Knob
                        value={compMakeup}
                        onChange={setCompMakeup}
                        min={0}
                        max={18}
                        step={0.5}
                        label="compMakeup"
                        defaultValue={0}
                        midiLearnParam={midiLearnParam}
                        midiMappings={midiMappings}
                        setMidiLearnParam={setMidiLearnParam}
                        displayFormat={(val) => `+${val.toFixed(1)}dB`}
                        glowColor="magenta"
                        size={36}
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>
          </>)}

            {/* ROW 4 PANEL 1: WIDESCREEN CRT VECTORSCOPE (Spans all 4 columns) */}
            <div className="scope-outer vectorscope-full-span neon-glow-cyan">
              <span className="panel-label">CRT VECTORSCOPE VISUALIZER</span>
              <div className="scope-controls-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button
                    className={`wave-btn-synth ${scopeMode === 'waveform' ? 'active' : ''}`}
                    onClick={() => setScopeMode('waveform')}
                    style={{ maxWidth: '100px', fontSize: '0.45rem', padding: '2px 8px' }}
                  >
                    WAVEFORM
                  </button>
                  <button
                    className={`wave-btn-synth ${scopeMode === 'lissajous' ? 'active' : ''}`}
                    onClick={() => setScopeMode('lissajous')}
                    style={{ maxWidth: '100px', fontSize: '0.45rem', padding: '2px 8px' }}
                  >
                    LISSAJOUS (L/R)
                  </button>

                  <span style={{ fontSize: '0.45rem', color: '#00f3ff', fontFamily: 'monospace', fontWeight: 'bold', marginLeft: '6px' }}>MIDI IN:</span>
                  <select
                    value={selectedMidiDeviceName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMidiDeviceName(val);
                      localStorage.setItem('deltavi_selected_midi_device', val);
                    }}
                    style={{
                      background: '#000',
                      border: '1px solid rgba(0, 243, 255, 0.4)',
                      color: '#00f3ff',
                      fontSize: '0.48rem',
                      fontFamily: 'monospace',
                      padding: '0 3px',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer',
                      height: '18px',
                      lineHeight: '16px',
                      maxWidth: '100px'
                    }}
                  >
                    <option value="all">All Devices</option>
                    {midiDevices.map(name => (
                      <option key={name} value={name}>{name.slice(0, 15)}</option>
                    ))}
                  </select>
                </div>

                {/* Preset Manager (Moved next to scope buttons above keys) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '3px', border: '1px solid rgba(0, 243, 255, 0.25)' }}>
                  <span style={{ fontSize: '0.45rem', color: '#00f3ff', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '0.5px' }}>PRESET:</span>
                  <select 
                    className="preset-select font-mono"
                    value={selectedPresetName}
                    onChange={(e) => handleLoadPreset(e.target.value)}
                    style={{
                      background: '#000',
                      border: '1px solid rgba(0, 243, 255, 0.4)',
                      color: '#ffe600',
                      fontSize: '0.48rem',
                      fontFamily: 'monospace',
                      padding: '0 3px',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer',
                      height: '18px',
                      lineHeight: '16px'
                    }}
                  >
                    {presets.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>

                  <div className="preset-save-box" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <input 
                      type="text" 
                      placeholder="Save patch..." 
                      value={customPresetName}
                      onChange={(e) => setCustomPresetName(e.target.value)}
                      className="preset-input font-mono"
                      style={{
                        background: '#000',
                        border: '1px solid rgba(0, 243, 255, 0.2)',
                        color: '#fff',
                        fontSize: '0.45rem',
                        padding: '0 4px',
                        borderRadius: '2px',
                        outline: 'none',
                        width: '80px',
                        height: '18px'
                      }}
                    />
                    <button 
                      onClick={handleSavePreset}
                      disabled={!customPresetName.trim()}
                      className="action-btn-small active"
                      style={{
                        height: '18px',
                        lineHeight: '16px',
                        fontSize: '0.42rem',
                        padding: '0 6px',
                        background: 'rgba(255, 230, 0, 0.2)',
                        color: '#ffe600',
                        border: '1px solid #ffe600',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      SAVE
                    </button>
                  </div>
                </div>
              </div>
              <div className="scope-bezel">
                <canvas 
                  ref={canvasRef} 
                  width="960" 
                  height="160" 
                  className="scope-canvas"
                />
              </div>
            </div>

          </div>

          {/* 64-KEY PERFORMANCE KEYBOARD & CONTROLS */}
          <div className="keyboard-container-row">
            <div className="octave-scroll-controls">
              <span className="control-label">OCTAVE RANGE</span>
              <div className="button-group-row" style={{ marginTop: '0.15rem' }}>
                <button 
                  className="nav-btn" 
                  onClick={() => setKeyboardOctave(prev => Math.max(1, prev - 1))}
                  disabled={!synthOn}
                >
                  ▲ DOWN
                </button>
                <span className="octave-display text-cyan font-mono">
                  {getNoteName(startMidiNote)} - {getNoteName(startMidiNote + 63)}
                </span>
                <button 
                  className="nav-btn" 
                  onClick={() => setKeyboardOctave(prev => Math.min(5, prev + 1))}
                  disabled={!synthOn}
                >
                  ▼ UP
                </button>
              </div>
            </div>

            {/* Pitch & Mod Wheels */}
            <div className="keyboard-wheels-container">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div 
                  className="wheel-well pb-wheel"
                  onMouseDown={handlePitchBendMouseDown}
                  onTouchStart={handlePitchBendTouchStart}
                  title="Pitch Bend (Spring-Loaded)"
                >
                  <div 
                    className="wheel-body" 
                    style={{ top: `${4 + (1 - (pitchBend + 1) / 2) * 44}px` }}
                  >
                    <div className="wheel-ridge"></div>
                    <div className="wheel-ridge center-ridge"></div>
                    <div className="wheel-ridge"></div>
                  </div>
                </div>
                <span className="wheel-label">PITCH</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div 
                  className="wheel-well mod-wheel"
                  onMouseDown={handleModWheelMouseDown}
                  onTouchStart={handleModWheelTouchStart}
                  title="Modulation Wheel"
                >
                  <div 
                    className="wheel-body" 
                    style={{ top: `${4 + (1 - modWheel) * 44}px` }}
                  >
                    <div className="wheel-ridge"></div>
                    <div className="wheel-ridge center-ridge"></div>
                    <div className="wheel-ridge"></div>
                  </div>
                </div>
                <span className="wheel-label">MOD</span>
              </div>
            </div>

            {/* Piano Keyboard */}
            <div className={`virtual-keyboard ${synthOn ? 'synth-active' : ''}`}>
              {keyboardKeys.map((key) => (
                <button
                  key={key.note}
                  className={`piano-key ${key.isBlack ? 'black-key' : 'white-key'} ${pressedNotes.has(key.note) ? 'pressed' : ''}`}
                  onMouseDown={() => handleKeyMouseDown(key.note)}
                  onMouseUp={() => handleKeyMouseUp(key.note)}
                  onMouseLeave={() => handleKeyMouseUp(key.note)}
                  disabled={!synthOn}
                  aria-label={`Key ${getNoteName(key.note)}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {showLatencyGuide && (
        <div className="latency-guide-backdrop" onClick={() => setShowLatencyGuide(false)}>
          <div className="latency-guide-modal font-mono" onClick={(e) => e.stopPropagation()}>
            <div className="latency-modal-header">
              <span className="brand-logo" style={{ fontSize: '0.9rem' }}>ASIO & LATENCY GUIDE</span>
              <button className="latency-close-btn" onClick={() => setShowLatencyGuide(false)}>×</button>
            </div>
            <div className="latency-modal-body">
              <p className="latency-tip-title">⚡ BROWSER LATENCY OPTIMIZATION</p>
              <p>Chrome and Edge are sandboxed. They cannot load native ASIO drivers directly in Web Audio, but we have forced Chrome to use WASAPI's lowest buffer path via <strong>latencyHint: &apos;interactive&apos;</strong>.</p>
              
              <p className="latency-tip-title">🎛️ HOW TO GET ASIO PERFORMANCE IN CHROME</p>
              <ul>
                <li><strong>Method 1: FlexASIO (Recommended)</strong>
                  <br />Download the free <em>FlexASIO</em> utility. Set FlexASIO as your Windows output device, and configure it to run in <strong>Exclusive WASAPI</strong> mode for your Focusrite/Nektar sound card. This routes the browser straight to your hardware buffers with &lt;10ms latency!
                </li>
                <li><strong>Method 2: Windows Exclusive Mode</strong>
                  <br />Go to Windows Sound Control Panel &rarr; Device Properties &rarr; Advanced. Check <em>&quot;Allow applications to take exclusive control of this device&quot;</em>. This lets Chrome bypass the standard Windows audio resampler.
                </li>
                <li><strong>Method 3: ASIO4ALL</strong>
                  <br />Similar to FlexASIO, but requires setting up an audio bridge to route WASAPI shared audio streams into ASIO.
                </li>
              </ul>
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button className="action-btn-small active" onClick={() => setShowLatencyGuide(false)}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showManual && (
        <div className="latency-guide-backdrop" onClick={() => setShowManual(false)}>
          <div className="latency-guide-modal font-mono" style={{ maxWidth: '820px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="latency-modal-header">
              <span className="brand-logo" style={{ fontSize: '0.9rem' }}>📖 DELTAVI SYNTH USER MANUAL</span>
              <button className="latency-close-btn" onClick={() => setShowManual(false)}>×</button>
            </div>
            
            <div style={{ display: 'flex', gap: '14px', marginTop: '10px', height: '55vh' }}>
              {/* Sidebar Tabs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px', borderRight: '1px solid rgba(0, 243, 255, 0.15)', paddingRight: '10px' }}>
                {[
                  { id: 'layout', label: '1. CONSOLE GRID' },
                  { id: 'blocks', label: '2. SYNTH BLOCKS' },
                  { id: 'midi', label: '3. MIDI CC LEARN' },
                  { id: 'presets', label: '4. PAT FILM PRESETS' },
                  { id: 'latency', label: '5. ASIO LATENCY' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`nav-btn ${manualTab === tab.id ? 'active' : ''}`}
                    onClick={() => setManualTab(tab.id)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.45rem', textAlign: 'left', width: '100%' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Box */}
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', fontSize: '0.52rem', lineHeight: '1.4', color: '#c5c6c7' }}>
                {manualTab === 'layout' && (
                  <div>
                    <h3 style={{ color: '#00f3ff', borderBottom: '1px solid rgba(0, 243, 255, 0.2)', paddingBottom: '4px', marginTop: 0 }}>🎛️ THE WIDESCREEN CONSOLE LAYOUT</h3>
                    <p>The synth rack is organized into a widescreen 4-column module grid. A true stereo CRT vectorscope visualizer spans the entire bottom of the rack.</p>
                    
                    <div style={{ background: 'rgba(21, 26, 33, 0.6)', border: '1px solid rgba(0, 243, 255, 0.15)', borderRadius: '4px', padding: '8px', marginTop: '10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.48rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff' }}>
                            <th style={{ padding: '4px' }}>Column 1</th>
                            <th style={{ padding: '4px' }}>Column 2</th>
                            <th style={{ padding: '4px' }}>Column 3</th>
                            <th style={{ padding: '4px' }}>Column 4</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '6px 4px' }}><strong style={{ color: '#00f3ff' }}>Row 1:</strong> Aries Oscillators</td>
                            <td style={{ padding: '6px 4px' }}><strong style={{ color: '#ff007f' }}>Row 1:</strong> Vectra Dual-Mod</td>
                            <td style={{ padding: '6px 4px' }}><strong style={{ color: '#ffe600' }}>Row 1:</strong> Leo Extensions</td>
                            <td style={{ padding: '6px 4px' }}><strong style={{ color: '#ff00ff' }}>Row 1:</strong> Libra Saturation</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '6px 4px' }}><strong style={{ color: '#ffe600' }}>Row 2:</strong> LFO 1 Modulation</td>
                            <td style={{ padding: '6px 4px' }}><strong style={{ color: '#ff007f' }}>Row 2:</strong> LFO 2 Modulation</td>
                            <td style={{ padding: '6px 4px' }}><strong style={{ color: '#00f3ff' }}>Row 2:</strong> Signal Mixer</td>
                            <td style={{ padding: '6px 4px' }}><strong style={{ color: '#00ff96' }}>Row 2:</strong> VCF Resonant Filter</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '6px 4px' }}><strong style={{ color: '#00ff96' }}>Row 3:</strong> VCF Filter Env (ADSR)</td>
                            <td style={{ padding: '6px 4px' }}><strong style={{ color: '#00f3ff' }}>Row 3:</strong> VCA Amp Env (ADSR)</td>
                            <td style={{ padding: '6px 4px' }} colSpan={2}><strong style={{ color: '#ffe600' }}>Row 3:</strong> Arpeggiator & Multi-FX (Double-Width)</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 4px' }} colSpan={4}><strong style={{ color: '#00f3ff' }}>Row 4:</strong> CRT Vectorscope Visualizer (Full-Width)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {manualTab === 'blocks' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <h4 style={{ color: '#00f3ff', margin: '0 0 4px 0' }}>🪐 ARIES OSCILLATOR SECTION</h4>
                      <p>Select Sine, Triangle, Sawtooth, or Square, or load digital **DWGS** (Digital Waveform Generator System) waves: Organ, Vox (formant sweep), Strings, E.Piano, Bell, Digital Bass, Clavinet, or Harmonic Sine. Fine-tune Osc 2 relative to Osc 1 (+/- 50c).</p>
                    </div>
                    <div>
                      <h4 style={{ color: '#ff007f', margin: '0 0 4px 0' }}>⚡ VECTRA DUAL-MODULATION HUB</h4>
                      <p>**X-Mod**: Frequency Modulation (FM) where Osc 2 modulates Osc 1 pitch. **Dual-Mod**: Routes the VCF ADSR envelope or Osc 2 to modulate Osc 1 Pitch, Osc 1 Pulse Width, and/or Filter Cutoff.</p>
                    </div>
                    <div>
                      <h4 style={{ color: '#ffe600', margin: '0 0 4px 0' }}>🦁 LEO ANALOG EXTENSIONS</h4>
                      <p>**Analog Drift**: Slow thermal pitch drift simulation. **Unison Detune**: Stack voice oscillators with variable detune spread. **Bass Boost**: 80Hz resonant peak boost. **Hard Sync**: Phase-locks Osc 2 to Osc 1 cycles.</p>
                    </div>
                    <div>
                      <h4 style={{ color: '#ff00ff', margin: '0 0 4px 0' }}>⚖️ LIBRA SUB & SATURATION ENGINE</h4>
                      <p>Overdrive the post-filter gain up to 12dB. Emulate classic filter circuits: **Classic** (12dB/oct dual-pole OTA filter), **Acid** (snappy 18dB diode ladder filter), and **Ladder** (series-chained Delta-Cascade 4-Pole 24dB filter).</p>
                    </div>
                    <div>
                      <h4 style={{ color: '#00ff96', margin: '0 0 4px 0' }}>🎚️ MIXER & DUAL ADSR ENVELOPES</h4>
                      <p>Mix Osc 1, Osc 2, Ring Modulation, Sub-oscillator, Pink Noise, and **Feedback Saturated loop** (Resonant Feedback Path). Shape the cut-off envelope sweep with **VCF ADSR** and the loudness with **VCA ADSR** envelopes.</p>
                    </div>
                  </div>
                )}

                {manualTab === 'midi' && (
                  <div>
                    <h3 style={{ color: '#00f3ff', borderBottom: '1px solid rgba(0, 243, 255, 0.2)', paddingBottom: '4px', marginTop: 0 }}>🎹 CUSTOM MIDI LEARN SETUP</h3>
                    <p>DeltaVi supports rapid "click-to-learn" mapping for all knobs, faders, sliders, and selectors.</p>
                    <ol style={{ paddingLeft: '14px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li>Connect your hardware keyboard or MIDI pad controller before loading the synth page.</li>
                      <li>Click the small **MID** (or **CC ##**) badge next to any parameter label. The badge will pulse orange and display **LRN** (Learning).</li>
                      <li>Move any slider, rotary dial, or button on your physical MIDI hardware controller.</li>
                      <li>The badge will latch green and show the mapped CC index (e.g. `CC 74`). The control is now locked.</li>
                      <li>Click **🎛️ MIDI MAPPINGS** in the display window to open the full matrix manager, allowing you to load defaults, clear mappings, or copy mapping templates as a JSON string to/from your clipboard.</li>
                    </ol>
                  </div>
                )}

                {manualTab === 'presets' && (
                  <div>
                    <h3 style={{ color: '#ff007f', borderBottom: '1px solid rgba(255, 0, 127, 0.2)', paddingBottom: '4px', marginTop: 0 }}>🎬 JOHN CARPENTER PRESETS</h3>
                    <p>The factory presets include 5 custom scores inspired by the classic movie scores of director John Carpenter, demonstrating the Vectra and Cascade modulation capabilities:</p>
                    <ul style={{ paddingLeft: '14px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li><strong style={{ color: '#ffe600' }}>CARPENTER: Haddonfield 5/4</strong> - snappy filter decay, square wave bassline, and Resonant feedback saturation (Halloween theme).</li>
                      <li><strong style={{ color: '#00ff96' }}>CARPENTER: The Fog Drone</strong> - eerie pink noise LFO sweeps, Ring Modulation, and slow ladder filter swells.</li>
                      <li><strong style={{ color: '#00f3ff' }}>CARPENTER: Escape Pluck</strong> - highly resonant metallic pluck bass with short decay and space delay lines (Escape from New York).</li>
                      <li><strong style={{ color: '#ff00ff' }}>CARPENTER: Sentinel Lead</strong> - glide-heavy, high-pitched double sawtooth lead with slow vibrato.</li>
                      <li><strong style={{ color: '#ffe600' }}>CARPENTER: Antarctic Chill</strong> - glacial vocal formant sweep (`vox`) pad with slow chorus and lush reverb (The Thing).</li>
                    </ul>
                  </div>
                )}

                {manualTab === 'latency' && (
                  <div>
                    <h3 style={{ color: '#00ff96', borderBottom: '1px solid rgba(0, 255, 150, 0.2)', paddingBottom: '4px', marginTop: 0 }}>⚡ LOW-LATENCY ASIO AUDIO ROUTING</h3>
                    <p>Browsers run in secure sandboxes and cannot load native hardware ASIO driver DLLs directly. For keyboard tracking under 10ms, follow these setups:</p>
                    
                    <h4 style={{ color: '#ffe600', margin: '10px 0 4px 0' }}>Method 1: FlexASIO (Recommended)</h4>
                    <p>Download the free **FlexASIO** sound utility. Set Windows default device to FlexASIO. Configure `FlexASIO.toml` to run in **Exclusive WASAPI** mode connected to your soundcard. This bypasses the Windows shared audio resampler entirely.</p>
                    
                    <h4 style={{ color: '#00f3ff', margin: '10px 0 4px 0' }}>Method 2: Exclusive WASAPI</h4>
                    <p>Open Windows Control Panel &rarr; Sound &rarr; Device Properties &rarr; Advanced. Check **"Allow applications to take exclusive control of this device"** and **"Give exclusive mode applications priority"**.</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', borderTop: '1px solid rgba(0, 243, 255, 0.15)', paddingTop: '12px' }}>
              <button className="action-btn-small active" style={{ minWidth: '120px', height: '30px', fontSize: '0.52rem' }} onClick={() => setShowManual(false)}>
                CLOSE MANUAL
              </button>
            </div>
          </div>
        </div>
      )}

      {showMidiManager && (
        <div className="latency-guide-backdrop" onClick={() => setShowMidiManager(false)}>
          <div className="latency-guide-modal font-mono" style={{ maxWidth: '820px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="latency-modal-header">
              <span className="brand-logo" style={{ fontSize: '0.9rem' }}>🎛️ MIDI MAPPINGS MANAGER</span>
              <button className="latency-close-btn" onClick={() => setShowMidiManager(false)}>×</button>
            </div>
            
            <div className="latency-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(0, 243, 255, 0.15)', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div>
                    <span style={{ color: '#00f3ff', fontSize: '0.55rem', display: 'block', textTransform: 'uppercase', opacity: 0.8 }}>MIDI Input Device:</span>
                    <select
                      value={selectedMidiDeviceName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedMidiDeviceName(val);
                        localStorage.setItem('deltavi_selected_midi_device', val);
                      }}
                      style={{
                        background: '#000',
                        border: '1px solid rgba(0, 243, 255, 0.4)',
                        color: '#00f3ff',
                        fontSize: '0.55rem',
                        fontFamily: 'monospace',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        outline: 'none',
                        cursor: 'pointer',
                        marginTop: '2px'
                      }}
                    >
                      <option value="all">All Devices</option>
                      {midiDevices.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginLeft: '12px' }}>
                    <span style={{ color: '#00f3ff', fontSize: '0.55rem', display: 'block', textTransform: 'uppercase', opacity: 0.8 }}>Status:</span>
                    <span style={{ color: '#00ff96', fontSize: '0.65rem', fontWeight: 'bold' }}>{connectedDevice}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button 
                    className="action-btn-small" 
                    onClick={() => {
                      const defaults = {
                        volume: 7, cutoff: 74, resonance: 71, attack: 73, release: 72, chorusDepth: 1,
                        decay: null, sustain: null, osc1Vol: null, osc2Vol: null, ringModVol: null, subVolume: null, noiseVolume: null,
                        lfoRate: null, lfoDepth: null, lfo2Rate: null, lfo2Depth: null, portamento: null, delayTime: null, delayMix: null,
                        phaserMix: null, flangerMix: null, reverbMix: null, osc2Detune: null, oscDrift: null, unisonDetune: null, filterDrive: null,
                        filterEnvAmt: null, reverbDecay: null, flangerFeedback: null, xMod: null, polyModFilterEnv: null, polyModOsc2: null,
                        feedbackVol: null, filterAttack: null, filterDecay: null, filterSustain: null, filterRelease: null,
                        syncMode: null, hpfBassBoost: null, lfoKeySync: null, lfo2KeySync: null, voiceMode: null, filterCircuit: null,
                        osc1Waveform: null, osc2Waveform: null, subShape: null, subOctave: null, monoEnvelopeMode: null, lfoTarget: null,
                        lfo2Target: null, lfo2Shape: null, arpOn: null, arpBpm: null, arpPattern: null, arpDivision: null,
                        polyModOsc1Freq: null, polyModOsc1Pw: null, polyModFilter: null,
                        osc1Morph: null, osc2Morph: null, feedbackFilterType: null, saturationMode: null, saturationAmount: null,
                        stereoWidth: null, haasDelay: null,
                        subFilterType: null, subCutoff: null, subResonance: null, subOscFilterMod: null
                      };
                      setMidiMappings(defaults);
                      localStorage.setItem('deltavi_midi_mappings', JSON.stringify(defaults));
                    }}
                  >
                    DEFAULTS
                  </button>
                  <button 
                    className="action-btn-small" 
                    onClick={() => {
                      const allNull = {};
                      Object.keys(midiMappings).forEach(k => allNull[k] = null);
                      setMidiMappings(allNull);
                      localStorage.setItem('deltavi_midi_mappings', JSON.stringify(allNull));
                    }}
                    style={{ borderColor: '#ff0055', color: '#ff0055' }}
                  >
                    CLEAR ALL
                  </button>
                  <button 
                    className="action-btn-small" 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(midiMappings));
                      alert("MIDI Mappings copied to clipboard!");
                    }}
                  >
                    EXPORT
                  </button>
                  <button 
                    className="action-btn-small" 
                    onClick={() => {
                      const code = prompt("Paste your exported MIDI Mapping JSON here:");
                      if (code) {
                        try {
                          const parsed = JSON.parse(code);
                          if (parsed && typeof parsed === 'object') {
                            setMidiMappings(parsed);
                            localStorage.setItem('deltavi_midi_mappings', JSON.stringify(parsed));
                            alert("MIDI Mappings imported successfully!");
                          }
                        } catch (e) {
                          alert("Invalid JSON format!");
                        }
                      }
                    }}
                  >
                    IMPORT
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.55rem', color: '#c5c6c7', marginBottom: '14px', lineHeight: '1.4', background: 'rgba(255, 230, 0, 0.05)', border: '1px solid rgba(255, 230, 0, 0.15)', padding: '6px 10px', borderRadius: '3px' }}>
                💡 <strong>MIDI Learn Mechanism:</strong> Click the <strong>LEARN</strong> button next to any parameter, then move a knob, fader, or button on your MIDI controller. The CC number is mapped instantly. You can also map parameters directly on the synth panels by clicking the small <strong>MID</strong> badges next to labels/knobs.
              </p>

              {/* Parameter Grid grouped by sections */}
              {[
                {
                  title: 'OUTPUT & SIGNAL MIXER',
                  params: [
                    { id: 'volume', name: 'Master Volume' },
                    { id: 'osc1Vol', name: 'Oscillator 1 Vol' },
                    { id: 'osc2Vol', name: 'Oscillator 2 Vol' },
                    { id: 'subVolume', name: 'Sub Osc Volume' },
                    { id: 'subFilterType', name: 'Sub Filter Type' },
                    { id: 'subCutoff', name: 'Sub Filter Cutoff Freq' },
                    { id: 'subResonance', name: 'Sub Filter Resonance (Q)' },
                    { id: 'subOscFilterMod', name: 'Sub Osc VCF Cutoff Mod' },
                    { id: 'ringModVol', name: 'Ring Mod Volume' },
                    { id: 'noiseVolume', name: 'Noise Volume' },
                    { id: 'feedbackVol', name: 'Feedback Saturation' },
                    { id: 'feedbackFilterType', name: 'Feedback Filter Type' },
                    { id: 'saturationMode', name: 'Master Saturation Mode' },
                    { id: 'saturationAmount', name: 'Master Saturation Amount' },
                    { id: 'stereoWidth', name: 'Master Stereo Width' },
                    { id: 'haasDelay', name: 'Master Haas Delay' },
                    { id: 'ampDrive', name: 'Amp Drive Pre-Gain' },
                    { id: 'ampBass', name: 'Amp EQ Bass' },
                    { id: 'ampMid', name: 'Amp EQ Mid' },
                    { id: 'ampTreble', name: 'Amp EQ Treble' },
                    { id: 'cabType', name: 'Amp Cabinet Type' },
                    { id: 'compOn', name: 'Compressor Toggle' },
                    { id: 'compThreshold', name: 'Compressor Threshold' },
                    { id: 'compRatio', name: 'Compressor Ratio' },
                    { id: 'compAttack', name: 'Compressor Attack' },
                    { id: 'compRelease', name: 'Compressor Release' },
                    { id: 'compMakeup', name: 'Compressor Makeup Gain' }
                  ]
                },
                {
                  title: 'OSCILLATORS & DETUNING',
                  params: [
                    { id: 'osc1Waveform', name: 'Osc 1 Waveform' },
                    { id: 'osc2Waveform', name: 'Osc 2 Waveform' },
                    { id: 'osc1Pitch', name: 'Osc 1 Octave' },
                    { id: 'osc2Pitch', name: 'Osc 2 Octave' },
                    { id: 'osc2Detune', name: 'Osc 2 Detune' },
                    { id: 'osc1Morph', name: 'Osc 1 Spectral Morph' },
                    { id: 'osc2Morph', name: 'Osc 2 Spectral Morph' },
                    { id: 'syncMode', name: 'Oscillator Hard Sync' },
                    { id: 'oscDrift', name: 'Analog Drift Noise' },
                    { id: 'unisonDetune', name: 'Unison Detune Spread' },
                    { id: 'portamento', name: 'Portamento Glide' },
                    { id: 'voiceMode', name: 'Voice Mode (Mono/Poly)' },
                    { id: 'subShape', name: 'Sub Osc Waveform' },
                    { id: 'subOctave', name: 'Sub Osc Octave Offset' },
                    { id: 'monoEnvelopeMode', name: 'Mono Envelope Mode' }
                  ]
                },
                {
                  title: 'VCF FILTER',
                  params: [
                    { id: 'cutoff', name: 'Filter Cutoff Freq' },
                    { id: 'resonance', name: 'Filter Resonance (Q)' },
                    { id: 'filterDrive', name: 'Filter Drive Overdrive' },
                    { id: 'filterEnvAmt', name: 'Filter Envelope Amount' },
                    { id: 'filterCircuit', name: 'Filter Circuit' },
                    { id: 'hpfBassBoost', name: 'HPF Bass Boost' }
                  ]
                },
                {
                  title: 'ENVELOPES (ADSR)',
                  params: [
                    { id: 'filterAttack', name: 'VCF Filter Attack' },
                    { id: 'filterDecay', name: 'VCF Filter Decay' },
                    { id: 'filterSustain', name: 'VCF Filter Sustain' },
                    { id: 'filterRelease', name: 'VCF Filter Release' },
                    { id: 'attack', name: 'VCA Amp Attack' },
                    { id: 'decay', name: 'VCA Amp Decay' },
                    { id: 'sustain', name: 'VCA Amp Sustain' },
                    { id: 'release', name: 'VCA Amp Release' }
                  ]
                },
                {
                  title: 'MODULATION & LFO',
                  params: [
                    { id: 'lfoRate', name: 'LFO 1 Rate/Freq' },
                    { id: 'lfoDepth', name: 'LFO 1 Mod Depth' },
                    { id: 'lfoTarget', name: 'LFO 1 Destination' },
                    { id: 'lfoKeySync', name: 'LFO 1 Phase Key Sync' },
                    { id: 'lfo2Rate', name: 'LFO 2 Rate/Freq' },
                    { id: 'lfo2Depth', name: 'LFO 2 Mod Depth' },
                    { id: 'lfo2Shape', name: 'LFO 2 Waveform' },
                    { id: 'lfo2Target', name: 'LFO 2 Destination' },
                    { id: 'lfo2KeySync', name: 'LFO 2 Phase Key Sync' },
                    { id: 'xMod', name: 'Osc 2 Frequency X-Mod' },
                    { id: 'polyModFilterEnv', name: 'Poly-Mod Filter Env' },
                    { id: 'polyModOsc2', name: 'Poly-Mod Osc 2' },
                    { id: 'polyModOsc1Freq', name: 'Poly-Mod Target Osc 1' },
                    { id: 'polyModOsc1Pw', name: 'Poly-Mod Target Osc 1 PW' },
                    { id: 'polyModFilter', name: 'Poly-Mod Target Filter' }
                  ]
                },
                {
                  title: 'ARPEGGIATOR',
                  params: [
                    { id: 'arpOn', name: 'Arpeggiator Toggle' },
                    { id: 'arpBpm', name: 'Arp Tempo (BPM)' },
                    { id: 'arpPattern', name: 'Arp Octave Direction' },
                    { id: 'arpDivision', name: 'Arp Time Division' }
                  ]
                },
                {
                  title: 'MULTIPLE EFFECTS (FX)',
                  params: [
                    { id: 'chorusDepth', name: 'Chorus Depth' },
                    { id: 'delayTime', name: 'Delay Echo Time' },
                    { id: 'delayFeedback', name: 'Delay Feedback' },
                    { id: 'delayMix', name: 'Delay Mix' },
                    { id: 'phaserMix', name: 'Phaser Mix' },
                    { id: 'phaserRate', name: 'Phaser Speed Rate' },
                    { id: 'flangerMix', name: 'Flanger Mix' },
                    { id: 'flangerRate', name: 'Flanger Speed Rate' },
                    { id: 'flangerFeedback', name: 'Flanger Resonance Feedback' },
                    { id: 'reverbMix', name: 'Reverb Mix' },
                    { id: 'reverbDecay', name: 'Reverb Decay Size' }
                  ]
                }
              ].map((section, sIdx) => (
                <div key={sIdx} style={{ marginBottom: '18px' }}>
                  <div style={{ background: 'rgba(0, 243, 255, 0.08)', padding: '4px 8px', borderLeft: '3px solid #00f3ff', color: '#00f3ff', fontSize: '0.48rem', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {section.title}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '6px' }}>
                    {section.params.map((p) => {
                      const isLearning = midiLearnParam === p.id;
                      const cc = midiMappings[p.id];
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(21, 26, 33, 0.4)', border: '1px solid rgba(0, 243, 255, 0.05)', padding: '4px 8px', borderRadius: '3px' }}>
                          <span style={{ fontSize: '0.45rem', color: '#c5c6c7', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }} title={p.name}>
                            {p.name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.45rem', fontFamily: 'monospace', color: cc !== null ? '#00ff96' : 'rgba(255, 255, 255, 0.25)', padding: '1px 4px', background: cc !== null ? 'rgba(0, 255, 150, 0.1)' : 'rgba(255,255,255,0.01)', borderRadius: '2px', border: cc !== null ? '1px solid rgba(0, 255, 150, 0.2)' : '1px solid transparent' }}>
                              {cc !== null ? `CC ${cc}` : '—'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setMidiLearnParam(isLearning ? null : p.id)}
                              className={`action-btn-small ${isLearning ? 'active' : ''}`}
                              style={{ 
                                padding: '1px 5px', 
                                fontSize: '0.42rem', 
                                height: '18px', 
                                background: isLearning ? '#ffe600' : '',
                                borderColor: isLearning ? '#ffe600' : '',
                                color: isLearning ? '#000000' : ''
                              }}
                            >
                              {isLearning ? 'LRN...' : 'LEARN'}
                            </button>
                            {cc !== null && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMidiMappings(prev => {
                                    const next = { ...prev };
                                    next[p.id] = null;
                                    localStorage.setItem('deltavi_midi_mappings', JSON.stringify(next));
                                    return next;
                                  });
                                }}
                                className="action-btn-small"
                                style={{ padding: '1px 5px', fontSize: '0.42rem', height: '18px', borderColor: 'rgba(255,0,85,0.4)', color: '#ff0055' }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', borderTop: '1px solid rgba(0, 243, 255, 0.15)', paddingTop: '12px' }}>
              <button className="action-btn-small active" style={{ minWidth: '120px', height: '30px', fontSize: '0.52rem' }} onClick={() => setShowMidiManager(false)}>
                CLOSE MAPPING
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        /* Vertical console tower overrides */
        .vertical-console {
          max-width: 400px !important;
          flex-direction: column !important;
          padding: 1rem 0.75rem 0.5rem 0.75rem !important;
          gap: 0.8rem !important;
        }
        .vertical-console .synth-header {
          grid-template-columns: 1fr !important;
          gap: 0.65rem !important;
          border-bottom: 1.5px solid rgba(0, 243, 255, 0.15);
          padding-bottom: 0.65rem;
          text-align: center;
        }
        .vertical-console .synth-header > * {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .vertical-console .synth-header .header-left {
          flex-direction: column;
          align-items: center;
        }
        .vertical-console .synth-header .power-casing {
          flex-direction: row !important;
          gap: 8px !important;
        }
        .vertical-console .synth-modules-horizontal {
          grid-template-columns: 1fr !important;
          gap: 0.8rem !important;
        }
        .vertical-console .arp-fx-panel-span {
          grid-column: span 1 !important;
        }
        .vertical-console .vectorscope-full-span {
          grid-column: span 1 !important;
          min-height: 180px !important;
        }
        .vertical-console .keyboard-container-row {
          grid-template-columns: 1fr !important;
          gap: 0.75rem !important;
          border-top: 1.5px solid rgba(0, 243, 255, 0.15);
          padding-top: 0.75rem;
        }
        .vertical-console .keyboard-wheels-container {
          justify-content: center;
          margin: 0.4rem 0;
          height: 95px !important;
        }

        .midi-synth-wrapper {
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 0px;
        }

        .synth-ui-scaler {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          color: #00f3ff;
          font-size: 0.7rem;
          background: #050608;
          border: 1px solid rgba(0, 243, 255, 0.2);
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0, 243, 255, 0.1);
        }

        .scale-slider {
          width: 120px !important;
        }

        .midi-synth-rack {
          position: relative;
          background: 
            linear-gradient(rgba(0, 243, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.04) 1px, transparent 1px),
            rgba(5, 7, 12, 0.48);
          background-size: 24px 24px, 24px 24px, auto;
          background-position: center;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 2px solid rgba(0, 243, 255, 0.35);
          border-radius: 8px;
          padding: 1.25rem 1.25rem 0.5rem 1.25rem;
          box-shadow: 
            0 30px 60px rgba(0,0,0,0.85),
            inset 0 1px 2px rgba(255,255,255,0.05);
          overflow: hidden;
          width: 100%;
          max-width: 1500px;
          transition: transform 0.1s ease-out;
        }

        /* Glowing Vector Bars (Abel Look) */
        .midi-synth-rack::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 12px;
          height: 100%;
          background: linear-gradient(to right, rgba(0, 243, 255, 0.8), rgba(0, 243, 255, 0.2) 50%, rgba(0, 243, 255, 0.05));
          border-right: 1.5px solid #00f3ff;
          z-index: 10;
          box-shadow: 0 0 15px rgba(0, 243, 255, 0.6), inset 1px 0 2px rgba(255,255,255,0.2);
        }

        .midi-synth-rack::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 12px;
          height: 100%;
          background: linear-gradient(to left, rgba(255, 0, 127, 0.8), rgba(255, 0, 127, 0.2) 50%, rgba(255, 0, 127, 0.05));
          border-left: 1.5px solid #ff007f;
          z-index: 10;
          box-shadow: 0 0 15px rgba(255, 0, 127, 0.6), inset -1px 0 2px rgba(255,255,255,0.2);
        }

        /* Robert Abel Glow Accents */
        .vector-border {
          position: absolute;
          left: 12px;
          right: 12px;
          height: 2px;
          opacity: 0.9;
          box-shadow: 0 0 15px rgba(0, 243, 255, 0.85);
          z-index: 15;
        }
        .vector-border.top {
          top: 0;
          background: linear-gradient(90deg, #ff007f, #00f3ff, #00ff96);
        }
        .vector-border.bottom {
          bottom: 0;
          background: linear-gradient(90deg, #00ff96, #00f3ff, #ff007f);
        }

        .synth-faceplate {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        /* Header block */
        .synth-header {
          display: grid;
          grid-template-columns: auto 80px 140px 1fr 1fr 1fr;
          gap: 1rem;
          align-items: center;
          border-bottom: 1.5px solid rgba(0, 243, 255, 0.15);
          padding-bottom: 0.65rem;
        }

        @media (max-width: 1000px) {
          .synth-header {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        .brand-logo {
          display: block;
          font-family: 'Outfit', 'Inter', sans-serif;
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: 2px;
          background: linear-gradient(45deg, #00f3ff, #ff007f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 15px rgba(0, 243, 255, 0.35);
        }

        .sub-brand {
          font-size: 0.48rem;
          letter-spacing: 3px;
          color: #66fcf1;
          opacity: 0.8;
          text-transform: uppercase;
          display: block;
        }

        .section-title {
          font-size: 0.52rem;
          color: #45f3ff;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: bold;
          margin-bottom: 0.25rem;
          display: block;
        }

        /* Preset Manager Styles */
        .preset-dashboard {
          display: flex;
          flex-direction: column;
        }

        .preset-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .preset-select {
          background: #050608;
          border: 1px solid rgba(0, 243, 255, 0.3);
          color: #00f3ff;
          font-size: 0.65rem;
          padding: 0.2rem;
          border-radius: 2px;
          outline: none;
          max-width: 170px;
        }

        .preset-save-box {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .preset-input {
          background: #0a0c10;
          border: 1px solid rgba(255, 0, 127, 0.3);
          color: #ff007f;
          font-size: 0.62rem;
          padding: 0.2rem 0.4rem;
          border-radius: 2px;
          outline: none;
          width: 120px;
        }

        .preset-input::placeholder {
          color: rgba(255, 0, 127, 0.4);
        }

        /* Power switches */
        .power-casing {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .power-switch {
          position: relative;
          width: 28px;
          height: 18px;
          background: #1f2833;
          border: 1px solid #45f3ff;
          border-radius: 9px;
          cursor: pointer;
        }

        .power-switch .switch-toggle {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #c5c6c7;
          transition: all 0.2s ease;
        }

        .power-switch.power-on {
          background: #45f3ff;
        }

        .power-switch.power-on .switch-toggle {
          left: 12px;
          background: #0b0c10;
        }

        .power-led {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ff007f;
          opacity: 0.3;
        }

        .power-led.led-on {
          opacity: 1;
          background: #00ff96;
          box-shadow: 0 0 8px #00ff96;
        }

        .display-window {
          background: rgba(2, 6, 12, 0.75);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1.5px solid rgba(0, 243, 255, 0.45);
          border-radius: 6px;
          padding: 0.4rem 0.6rem;
          box-shadow: inset 0 0 15px rgba(0, 243, 255, 0.25), 0 0 8px rgba(0, 243, 255, 0.1);
          position: relative;
          overflow: hidden;
        }
        .display-window::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 2;
          background-size: 100% 3px, 3px 100%;
          pointer-events: none;
        }

        .telemetry {
          font-size: 0.58rem;
          display: flex;
          justify-content: space-between;
          line-height: 1.3;
        }

        .telemetry-lbl {
          color: #45f3ff;
          opacity: 0.6;
          margin-right: 0.5rem;
        }

        .text-cyan {
          color: #00f3ff;
        }

        .text-magenta {
          color: #ff007f;
        }

        /* 4-Column Layout Grid (Console Upgrade) */
        .synth-modules-horizontal {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.65rem;
          align-items: stretch;
        }

        @media (max-width: 900px) {
          .synth-modules-horizontal {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .synth-modules-horizontal {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 901px) {
          .arp-fx-panel-span {
            grid-column: span 2;
          }
          .vectorscope-full-span {
            grid-column: span 4;
            min-height: 210px;
          }
        }

        /* Premium Glassmorphism & Neon backlit outlines */
        .rack-panel, .scope-outer {
          background: rgba(10, 14, 20, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1.2px solid rgba(0, 243, 255, 0.12);
          border-radius: 6px;
          padding: 0.55rem;
          position: relative;
          box-shadow: 
            0 12px 32px rgba(0,0,0,0.6),
            inset 0 1px 2px rgba(255,255,255,0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 175px;
          transition: border-color 0.25s, box-shadow 0.25s;
        }

        .rack-panel:hover {
          border-color: rgba(0, 243, 255, 0.4);
          box-shadow: 
            0 12px 32px rgba(0,0,0,0.7),
            0 0 10px rgba(0, 243, 255, 0.15),
            inset 0 1px 2px rgba(255,255,255,0.05);
        }

        /* Unique section glowing border colors */
        .neon-glow-cyan {
          border-color: rgba(0, 243, 255, 0.35) !important;
          box-shadow: 0 0 10px rgba(0, 243, 255, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.03) !important;
        }
        .neon-glow-cyan:hover {
          border-color: rgba(0, 243, 255, 0.8) !important;
          box-shadow: 0 0 20px rgba(0, 243, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05) !important;
        }

        .neon-glow-pink {
          border-color: rgba(255, 0, 127, 0.35) !important;
          box-shadow: 0 0 10px rgba(255, 0, 127, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.03) !important;
        }
        .neon-glow-pink:hover {
          border-color: rgba(255, 0, 127, 0.8) !important;
          box-shadow: 0 0 20px rgba(255, 0, 127, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05) !important;
        }

        .neon-glow-magenta {
          border-color: rgba(255, 0, 255, 0.35) !important;
          box-shadow: 0 0 10px rgba(255, 0, 255, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.03) !important;
        }
        .neon-glow-magenta:hover {
          border-color: rgba(255, 0, 255, 0.8) !important;
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05) !important;
        }

        .neon-glow-yellow {
          border-color: rgba(255, 230, 0, 0.35) !important;
          box-shadow: 0 0 10px rgba(255, 230, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.03) !important;
        }
        .neon-glow-yellow:hover {
          border-color: rgba(255, 230, 0, 0.8) !important;
          box-shadow: 0 0 20px rgba(255, 230, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05) !important;
        }

        .neon-glow-green {
          border-color: rgba(0, 255, 150, 0.35) !important;
          box-shadow: 0 0 10px rgba(0, 255, 150, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.03) !important;
        }
        .neon-glow-green:hover {
          border-color: rgba(0, 255, 150, 0.8) !important;
          box-shadow: 0 0 20px rgba(0, 255, 150, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05) !important;
        }

        .scope-outer {
          background: rgba(4, 5, 7, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1.2px solid rgba(0, 243, 255, 0.35);
          padding: 0.7rem;
        }

        .panel-label {
          font-family: 'Outfit', 'Inter', sans-serif;
          font-size: 0.48rem;
          color: #00ff96;
          text-shadow: 0 0 3px rgba(0, 255, 150, 0.4);
          letter-spacing: 0.8px;
          font-weight: bold;
          position: absolute;
          top: -6px;
          left: 8px;
          background: rgba(8, 9, 13, 0.85);
          padding: 0 4px;
        }

        .control-grid-compact {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-top: 0.2rem;
          height: 100%;
          justify-content: space-around;
        }

        .control-item {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .control-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.48rem;
          color: #c5c6c7;
          opacity: 0.75;
          text-transform: uppercase;
        }

        .button-group-row {
          display: flex;
          gap: 0.15rem;
        }

        .nav-btn, .wave-btn-synth {
          flex: 1;
          background: #1f2833;
          border: 1px solid rgba(69, 243, 255, 0.25);
          color: #c5c6c7;
          font-size: 0.46rem;
          font-weight: bold;
          padding: 0.18rem 0.3rem;
          border-radius: 1.5px;
          cursor: pointer;
          transition: all 0.1s;
        }

        .nav-btn:hover, .wave-btn-synth:hover {
          border-color: #00f3ff;
          color: #fff;
        }

        .nav-btn.active, .wave-btn-synth.active {
          background: #00f3ff;
          color: #0b0c10;
          border-color: #00f3ff;
          box-shadow: 0 0 6px rgba(0, 243, 255, 0.5);
        }

        .action-btn-small {
          background: #1f2833;
          border: 1px solid #ff007f;
          color: #ff007f;
          font-size: 0.45rem;
          font-weight: bold;
          border-radius: 2px;
          cursor: pointer;
          padding: 0.12rem 0.3rem;
        }

        .action-btn-small.active {
          background: #ff007f;
          color: #fff;
          box-shadow: 0 0 6px #ff007f;
        }

        .sync-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.15rem;
        }

        /* Horizontal range tracks */
        .slider-row {
          display: flex;
          flex-direction: row !important;
          align-items: center;
          gap: 0.35rem;
          justify-content: space-between;
        }

        .slider-row .control-label {
          width: 65px;
          flex-shrink: 0;
        }

        .synth-slider {
          -webkit-appearance: none;
          appearance: none;
          flex: 1;
          height: 3px;
          background: #151a21;
          border-radius: 1px;
          outline: none;
        }

        .synth-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 8px;
          height: 12px;
          background: #ffffff;
          border: 1px solid #1f2833;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(255,255,255,0.85);
        }

        /* Neon Glow Sliders */
        .synth-slider.neon-cyan {
          box-shadow: 0 0 4px rgba(0, 243, 255, 0.3);
          background: linear-gradient(to right, #00f3ff, #151a21);
        }
        .synth-slider.neon-pink {
          box-shadow: 0 0 4px rgba(255, 0, 127, 0.3);
          background: linear-gradient(to right, #ff007f, #151a21);
        }
        .synth-slider.neon-magenta {
          box-shadow: 0 0 4px rgba(255, 0, 255, 0.3);
          background: linear-gradient(to right, #ff00ff, #151a21);
        }
        .synth-slider.neon-yellow {
          box-shadow: 0 0 4px rgba(255, 230, 0, 0.3);
          background: linear-gradient(to right, #ffe600, #151a21);
        }
        .synth-slider.neon-green {
          box-shadow: 0 0 4px rgba(0, 255, 150, 0.3);
          background: linear-gradient(to right, #00ff96, #151a21);
        }

        .fader-value {
          font-family: monospace;
          font-size: 0.52rem;
          color: #00ff96;
          width: 25px;
          text-align: right;
        }

        /* Scope bezel alignment inside equal-width column */
        .scope-bezel {
          background: 
            radial-gradient(circle, transparent 50%, rgba(2, 4, 6, 0.9)),
            linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px),
            #020406;
          background-size: auto, 15px 15px, 15px 15px, auto;
          background-position: center;
          border: 1.5px solid rgba(0, 243, 255, 0.55);
          border-radius: 4px;
          overflow: hidden;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 243, 255, 0.25);
        }

        .scope-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }

        .scope-controls-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
          z-index: 5;
        }

        /* Vertical Mixer Sliders */
        .mixer-sliders-grid {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 110px;
          margin-top: 0.25rem;
        }

        .fader-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 24px;
        }

        .fader-col .control-label {
          font-size: 0.42rem;
          margin-bottom: 0.2rem;
          text-align: center;
        }

        .fader-col .fader-value {
          width: auto;
          text-align: center;
          font-size: 0.48rem;
          margin-top: 0.1rem;
        }

        .adsr-fader {
          -webkit-appearance: slider-vertical;
          appearance: slider-vertical;
          writing-mode: bt-lr;
          width: 5px;
          height: 65px;
          background: #151a21;
          outline: none;
          cursor: ns-resize;
        }

        .adsr-fader.neon-cyan { box-shadow: 0 0 3px rgba(0,243,255,0.3); }
        .adsr-fader.neon-pink { box-shadow: 0 0 3px rgba(255,0,127,0.3); }
        .adsr-fader.neon-magenta { box-shadow: 0 0 3px rgba(255,0,255,0.3); }
        .adsr-fader.neon-yellow { box-shadow: 0 0 3px rgba(255,230,0,0.3); }
        .adsr-fader.neon-green { box-shadow: 0 0 3px rgba(0,255,150,0.3); }

        /* Keyboard Panel */
        .keyboard-container-row {
          display: grid;
          grid-template-columns: 160px 100px 1fr;
          gap: 1rem;
          align-items: center;
          border-top: 1.5px solid rgba(0, 243, 255, 0.15);
          padding-top: 0.75rem;
        }

        .octave-scroll-controls {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .octave-display {
          display: inline-block;
          font-size: 0.58rem;
          text-align: center;
          color: #00f3ff;
          text-shadow: 0 0 4px rgba(0, 243, 255, 0.4);
          line-height: 24px;
          flex: 1;
        }

        /* Keyboard Performance Wheels */
        .keyboard-wheels-container {
          display: flex;
          gap: 0.8rem;
          justify-content: center;
          align-items: center;
          height: 95px;
          background: rgba(5, 6, 8, 0.55);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 243, 255, 0.35);
          border-radius: 4px;
          padding: 0 0.5rem;
        }

        .wheel-well {
          position: relative;
          width: 22px;
          height: 76px;
          background: #020203;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          cursor: ns-resize;
          box-shadow: inset 0 0 5px rgba(0,0,0,0.9);
        }

        .wheel-well::before {
          content: "";
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 100%;
          background: rgba(255, 255, 255, 0.05);
        }

        .wheel-body {
          position: absolute;
          left: 2px;
          width: 16px;
          height: 24px;
          background: linear-gradient(to bottom, #1f2833 0%, #0b0c10 50%, #1f2833 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 2px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;
          padding: 2px 0;
          transition: transform 0.05s linear;
        }

        .wheel-ridge {
          width: 10px;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
        }

        .wheel-well.pb-wheel .wheel-body {
          border-color: rgba(0, 243, 255, 0.4);
          box-shadow: 0 0 6px rgba(0, 243, 255, 0.2);
        }
        .wheel-well.mod-wheel .wheel-body {
          border-color: rgba(255, 0, 127, 0.4);
          box-shadow: 0 0 6px rgba(255, 0, 127, 0.2);
        }
        .wheel-well.pb-wheel .wheel-ridge.center-ridge {
          background: #00f3ff;
          box-shadow: 0 0 4px #00f3ff;
        }
        .wheel-well.mod-wheel .wheel-ridge.center-ridge {
          background: #ff007f;
          box-shadow: 0 0 4px #ff007f;
        }

        .wheel-label {
          font-size: 0.35rem;
          color: #c5c6c7;
          opacity: 0.6;
          text-align: center;
          margin-top: 2px;
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
        }

        /* Keyboard Styling */
        .virtual-keyboard {
          position: relative;
          display: flex;
          background: rgba(8, 9, 12, 0.55);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 2.2px solid rgba(0, 243, 255, 0.35);
          border-radius: 4px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.85), 0 0 10px rgba(0, 243, 255, 0.1);
          height: 95px;
          overflow: hidden;
          width: 100%;
        }

        .piano-key {
          position: relative;
          cursor: pointer;
          outline: none;
          padding: 0;
          transition: background-color 0.1s;
        }

        .white-key {
          flex: 1;
          height: 100%;
          background: linear-gradient(to bottom, #cfd0d2 0%, #ffffff 90%, #efeff2 100%);
          border-right: 1.2px solid #000;
          z-index: 1;
        }

        .white-key.pressed {
          background: linear-gradient(to bottom, #00f3ff 0%, #00ff96 100%);
          box-shadow: 0 0 15px rgba(0, 243, 255, 0.8), inset 0 2px 4px rgba(0,0,0,0.5);
          z-index: 5;
        }

        .black-key {
          width: 1.8%;
          height: 58px;
          background: linear-gradient(to bottom, #0f1013 0%, #1c1f25 85%, #0b0c0e 100%);
          border: 1px solid #000;
          border-radius: 0 0 1.2px 1.2px;
          margin-left: -0.9%;
          margin-right: -0.9%;
          z-index: 2;
        }

        .black-key.pressed {
          background: linear-gradient(to bottom, #ff007f 0%, #ff00ff 100%);
          box-shadow: 0 0 15px rgba(255, 0, 127, 0.8), inset 0 2px 4px rgba(0,0,0,0.6);
          z-index: 5;
        }

        .virtual-keyboard.synth-active {
          border-color: #ff007f;
          box-shadow: 0 0 15px rgba(255, 0, 127, 0.5);
        }

        /* MIDI Learn Badges */
        .midi-learn-badge {
          background: rgba(21, 26, 33, 0.65);
          border: 1px solid rgba(0, 243, 255, 0.25);
          color: rgba(0, 243, 255, 0.6);
          font-family: monospace;
          font-size: 0.38rem;
          padding: 1px 3px;
          border-radius: 2px;
          cursor: pointer;
          margin-left: 4px;
          display: inline-block;
          vertical-align: middle;
          transition: all 0.15s ease-in-out;
          line-height: 1;
          outline: none;
        }

        .midi-learn-badge:hover {
          background: rgba(0, 243, 255, 0.12);
          border-color: #00f3ff;
          color: #00f3ff;
        }

        .midi-learn-badge.learning {
          background: rgba(255, 230, 0, 0.15);
          border-color: #ffe600;
          color: #ffe600;
          animation: pulse-yellow-synth 1s infinite alternate;
        }

        .midi-learn-badge.mapped {
          background: rgba(0, 255, 150, 0.15);
          border-color: #00ff96;
          color: #00ff96;
          text-shadow: 0 0 4px rgba(0, 255, 150, 0.5);
          box-shadow: 0 0 4px rgba(0, 255, 150, 0.2);
        }

        @keyframes pulse-yellow-synth {
          0% {
            box-shadow: 0 0 2px rgba(255, 230, 0, 0.3);
            opacity: 0.7;
          }
          100% {
            box-shadow: 0 0 8px rgba(255, 230, 0, 0.8);
            opacity: 1;
          }
        }

        /* Latency Guide Modal styling */
        .latency-guide-trigger {
          background: transparent;
          border: none;
          color: #ff007f;
          font-family: inherit;
          font-size: 0.5rem;
          letter-spacing: 1px;
          cursor: pointer;
          outline: none;
          padding: 2px 8px;
          transition: all 0.2s;
        }
        .latency-guide-trigger:hover {
          color: #00f3ff;
          text-shadow: 0 0 6px #00f3ff;
        }

        .latency-guide-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 6, 8, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        }

        .latency-guide-modal {
          background: #08090d;
          border: 2px solid #ff007f;
          border-radius: 6px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 0 25px rgba(255, 0, 127, 0.4);
          color: #c5c6c7;
          overflow: hidden;
        }

        .latency-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.6rem 0.8rem;
          background: #0d0e15;
          border-bottom: 1px solid rgba(255, 0, 127, 0.25);
        }

        .latency-close-btn {
          background: transparent;
          border: none;
          color: #ff007f;
          font-size: 1.2rem;
          cursor: pointer;
          outline: none;
        }
        .latency-close-btn:hover {
          color: #00f3ff;
          text-shadow: 0 0 4px #00f3ff;
        }

        .latency-modal-body {
          padding: 0.8rem;
          font-size: 0.62rem;
          line-height: 1.5;
        }

        .latency-tip-title {
          color: #00f3ff;
          font-weight: bold;
          margin-top: 0.8rem;
          margin-bottom: 0.3rem;
          border-bottom: 1px dashed rgba(0, 243, 255, 0.2);
          padding-bottom: 2px;
        }
        .latency-modal-body ul {
          margin-top: 0.4rem;
          padding-left: 1rem;
        }
        .latency-modal-body li {
          margin-bottom: 0.6rem;
        }
      ` }} />
    </div>
  );

  function handleKeyMouseDown(midiNote) {
    if (!synthOn) return;
    if (arpOn) {
      if (!arpHeldNotes.current.includes(midiNote)) {
        arpHeldNotes.current = [...arpHeldNotes.current, midiNote];
      }
    } else {
      handleNoteOn(midiNote, 100);
    }
  }

  function handleKeyMouseUp(midiNote) {
    if (!synthOn) return;
    if (arpOn) {
      arpHeldNotes.current = arpHeldNotes.current.filter(n => n !== midiNote);
    } else {
      handleNoteOff(midiNote);
    }
  }
}
