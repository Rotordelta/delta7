import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
    vertexShader, fragmentShader,
    particleVertexShader, particleFragmentShader,
    superformulaVertexShader, superformulaFragmentShader,
    superformulaInstancedVertexShader, superformulaInstancedFragmentShader,
    superformulaFunctions, warpFunctions
} from './shaders';
import VisualizerUI from './VisualizerUI';
import VideoDeck from './VideoDeck';
import { useTransport } from '../utils/TransportEngine'; // [NEW]

interface VideoClip {
    id: string;
    file: File;
    url: string;
    name: string;
    playbackMode: 'normal' | 'reverse' | 'oneshot';
    releaseTime: number;
}

interface OculusEngineProps {
    mode: 'mic' | 'file';
    stream: MediaStream | null;
    audioFile: File | null;
    audioCtx?: AudioContext | null; // [NEW]
    analyserNode?: AnalyserNode | null; // [NEW]
    bpm?: number | null; // [NEW]
    isPlaying?: boolean; // [NEW]
}

// MIDI Mapping Type
interface MidiMapping {
    channel: number;
    cc: number;
    param: string;
    min: number;
    max: number;
    type?: 'continuous' | 'toggle' | 'action';
}

const OculusEngine: React.FC<OculusEngineProps> = ({
    mode,
    stream,
    audioFile,
    audioCtx: externalAudioCtx,
    analyserNode: externalAnalyserNode,
    bpm: externalBpm,
    isPlaying: externalIsPlaying
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // --- UI STATE ---
    const [uiState, setUiState] = useState({
        sceneMode: 0,
        warpMode: 0,
        spin: false,
        zoom: 1.0,
        oscilloscope: false,
        mirrorOsc: false,
        threeDOsc: false,
        oscDodge: false,
        hueCycling: false,
        colorDodgeLevel: 0,
        paletteMode: 0,
        stretch: 1.0,
        camSpeed: 0.15,
        // Grading & FX
        hue: 0.0,
        saturation: 1.2, // Maps to uVibrance
        brightness: 1.0,
        contrast: 1.0,
        grain: 0.0,
        vhs: false,
        blur: false,
        optics: false,
        particles: false,
        // Audio Reactor
        gainLow: 1.0,
        gainMid: 1.0,
        gainHigh: 1.0,
        fxShake: 0.0,
        fxFlash: 0.0,
        fxSolarize: 0.0,
        bloomReact: 0.0,
        swingAmount: 0.0,
        // Geometry Modifiers
        geoScale: 0.5,
        geoDeform: 0.5,
        geoThickness: 0.5,
        geoDetail: 0.5,
        // Video Extras
        videoFade: 0.0,
        videoPaletteMix: 0.0,
        videoDiffusion: 0.0
    });

    // Player State
    const [playlist, setPlaylist] = useState<File[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(1.0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hoverInfo, setHoverInfo] = useState<string | null>(null);

    // Tap Tempo State
    const [bpm, setBpm] = useState<number | null>(null);

    // Sync external BPM and play state from props
    useEffect(() => {
        if (externalBpm !== undefined && externalBpm !== null) {
            setBpm(externalBpm);
        }
    }, [externalBpm]);

    useEffect(() => {
        if (externalIsPlaying !== undefined) {
            setIsPlaying(externalIsPlaying);
        }
    }, [externalIsPlaying]);

    // Listen to Delta7 performance looper pad triggers
    useEffect(() => {
        const hudLogs: string[] = ["[SYSTEM] COGNITIVE NEURAL WORKSTATION SECURED"];
        const handlePadTrigger = (e: any) => {
            const { deck, index, velocity, isNoteOn } = e.detail;
            if (isNoteOn) {
                // 1. Switch background video clip based on pad index (0-7)
                const clips = videoClipsRef.current;
                const targetClip = clips[index];
                if (targetClip) {
                    handleSelectClip(targetClip.id);
                }

                // 2. Spike visual transients directly (ref-only to prevent React UI lag)
                const normVel = (velocity || 100) / 100;
                const padNames = ["KICK", "SNARE", "HI-HAT", "PERC", "CLAP", "TOM", "COWBELL", "RIDE"];
                const name = padNames[index] || `PAD ${index + 1}`;
                if (index === 0) { // Kick pad: big flash
                    fxFlashRef.current = Math.min(1.0, fxFlashRef.current + normVel * 0.85);
                } else if (index === 1) { // Snare pad: camera shake
                    fxShakeRef.current = Math.min(1.0, fxShakeRef.current + normVel * 0.65);
                } else { // Other pads: solarize
                    fxSolarizeRef.current = Math.min(1.0, fxSolarizeRef.current + normVel * 0.5);
                }

                // 3. Update rolling telemetry log in the background HUD
                const logEl = document.getElementById('hud-log');
                if (logEl) {
                    const timeStr = new Date().toLocaleTimeString();
                    hudLogs.push(`[${timeStr}] ${name} HIT (V:${velocity || 100}) -> SPIKE TRANSIENTS`);
                    if (hudLogs.length > 4) hudLogs.shift();
                    logEl.innerHTML = hudLogs.map(log => `<div style="opacity: 0.95; padding-top: 2px;">${log}</div>`).join('');
                }
            }
        };

        window.addEventListener('delta7_pad_trigger', handlePadTrigger);
        return () => window.removeEventListener('delta7_pad_trigger', handlePadTrigger);
    }, []);

    // Video Skybox State
    const [videoSpeed, setVideoSpeed] = useState(1.0);
    const [videoScale, setVideoScale] = useState(1.0);
    const [videoLoop, setVideoLoop] = useState(true);

    const [videoWarp, setVideoWarp] = useState(0.0);
    const [videoDodge, setVideoDodge] = useState(0.0);
    const [videoMirror, setVideoMirror] = useState(0.0);
    const [videoGlitch, setVideoGlitch] = useState(0.0);
    const [videoBlendMode, setVideoBlendMode] = useState(0); // [NEW]
    const [videoTargetBars, setVideoTargetBars] = useState(8); // [NEW]
    const [isVideoSynced, setIsVideoSynced] = useState(false); // [NEW]

    // [NEW] Video Deck State
    const [videoClips, setVideoClips] = useState<VideoClip[]>([]);
    const [activeClipId, setActiveClipId] = useState<string | null>(null);

    // [NEW] OneShot Fade State
    const internalFadeRef = useRef(0.0);
    const oneShotTriggerRef = useRef<'stopped' | 'playing' | 'releasing'>('stopped');

    const videoClipsRef = useRef<VideoClip[]>([]);
    const activeClipIdRef = useRef<string | null>(null);
    useEffect(() => { videoClipsRef.current = videoClips; }, [videoClips]);
    useEffect(() => { activeClipIdRef.current = activeClipId; }, [activeClipId]);

    const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);

    // Simplified Video Initialization
    useEffect(() => {
        if (!videoElementRef.current) {
            const video = document.createElement('video');
            video.src = './intro.mp4'; // Set immediately to avoid blank load error
            video.loop = true;
            video.muted = true;
            video.crossOrigin = "anonymous";
            video.playsInline = true;
            video.preload = "auto";

            video.onended = () => {
                document.dispatchEvent(new CustomEvent('oculus-video-ended'));
            };

            video.onerror = (e) => {
                if (video.error && video.error.message && video.error.message.includes('Empty src attribute')) {
                    return; // Suppress transient warning during instantiation
                }
                console.error(`[SkyDeck] Video Error:`, video.error);
            };

            videoElementRef.current = video;
            videoTextureRef.current = new THREE.VideoTexture(video);
            videoTextureRef.current.minFilter = THREE.LinearFilter;
            videoTextureRef.current.magFilter = THREE.LinearFilter;
            videoTextureRef.current.format = THREE.RGBAFormat;

            // Off-screen anchor for browser engine
            const hiddenDiv = document.getElementById('oculus-video-anchor') || (() => {
                const div = document.createElement('div');
                div.id = 'oculus-video-anchor';
                div.style.position = 'absolute';
                div.style.left = '-9999px';
                div.style.top = '0';
                div.style.width = '1px';
                div.style.height = '1px';
                div.style.overflow = 'hidden';
                document.body.appendChild(div);
                return div;
            })();
            hiddenDiv.appendChild(video);

            // Load and start playing (muted)
            video.play().then(() => {
                setIsVideoPlaying(true);
            }).catch(() => {});

            // Initialize clips state
            setVideoClips([{
                id: 'intro',
                name: 'intro.mp4',
                url: './intro.mp4',
                loop: true,
                bindings: {}
            }]);
            setActiveClipId('intro');
            setCurrentVideoIndex(0);
        }

        return () => {
            if (videoTextureRef.current) videoTextureRef.current.dispose();
            if (videoElementRef.current) {
                videoElementRef.current.pause();
                videoElementRef.current.src = "";
            }
        };
    }, []);

    // Recorder State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const recordingDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const recordingTimerRef = useRef<number | null>(null);

    // Projector State
    const [projectorMode, setProjectorMode] = useState(false);
    const [targetResolution, setTargetResolution] = useState({ w: 3840, h: 2160, label: '4K (3840x2160)' });
    const projectorWindowRef = useRef<Window | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const startTimeRef = useRef(Date.now());

    // MIDI State
    const [midiLearnMode, setMidiLearnMode] = useState(false);
    const [midiLearnTarget, setMidiLearnTarget] = useState<{ param: string, min: number, max: number, type: 'continuous' | 'toggle' | 'action' } | null>(null);
    const [midiMappings, setMidiMappings] = useState<Record<string, MidiMapping>>({}); // Key: "channel-cc"
    const midiMappingsRef = useRef<Record<string, MidiMapping>>({});
    const lastMidiValues = useRef<Record<string, number>>({});

    // --- ENGINE REFS (Mutable for Loop) ---
    const [isVideoPlaying, setIsVideoPlaying] = useState(false); // [NEW]
    const isVideoPlayingRef = useRef(false);
    useEffect(() => { isVideoPlayingRef.current = isVideoPlaying; }, [isVideoPlaying]);
    const sceneModeRef = useRef(0);
    const warpModeRef = useRef(0);
    const zoomRef = useRef(1.0);
    const zoomDirectionRef = useRef(0);
    const paletteModeRef = useRef(0);
    const particlesRef = useRef(false);

    // Camera Refs
    const camXRef = useRef(0.0);
    const camYRef = useRef(0.0);
    const camVelXRef = useRef(0.0); // Velocity X
    const camVelYRef = useRef(0.0); // Velocity Y
    const moveXRef = useRef(0); // -1, 0, 1
    const moveYRef = useRef(0); // -1, 0, 1
    const isHomingRef = useRef(false); // Auto-return to center flag
    const camSpeedRef = useRef(0.15);

    // Grading Refs
    const hueRef = useRef(0.0);
    const satRef = useRef(1.2);
    const brightRef = useRef(1.0);
    const contrastRef = useRef(1.0);
    const grainRef = useRef(0.0);
    const vhsRef = useRef(false);

    // Audio Refs (New)
    const gainLowRef = useRef(1.0);
    const gainMidRef = useRef(1.0);
    const gainHighRef = useRef(1.0);
    const fxShakeRef = useRef(0.0);
    const fxFlashRef = useRef(0.0);
    const fxSolarizeRef = useRef(0.0);
    const bloomReactRef = useRef(0.0);
    const swingAmountRef = useRef(0.0);

    // Geo Refs
    const geoScaleRef = useRef(0.5);
    const geoDeformRef = useRef(0.5);
    const geoThicknessRef = useRef(0.5);
    const geoDetailRef = useRef(0.5);

    // Video Refs
    const videoFadeRef = useRef(0.0);
    const videoPaletteMixRef = useRef(0.0);
    const videoDiffusionRef = useRef(0.0);

    // Swing Physics Refs
    const swingRef = useRef(0.0);
    const swingVelRef = useRef(0.0);
    const transientAvgRef = useRef(0.0);

    // Tap Tempo Refs
    const tapTimesRef = useRef<number[]>([]);
    const beatIntervalRef = useRef<number | null>(null);
    const lastBeatIndexRef = useRef<number>(0);

    // Stretch Refs
    const stretchRef = useRef(1.0);
    const stretchStateRef = useRef<'idle' | 'expanding' | 'returning'>('idle');

    // Transition Refs
    const transitionRef = useRef(0.0);
    const transitionStateRef = useRef<'idle' | 'in' | 'out'>('idle');

    // New FX Refs
    const blurRef = useRef(false);
    const opticsRef = useRef(false);

    // Video Ref for Loop
    const videoScaleRef = useRef(1.0);
    const videoWarpRef = useRef(0.0);
    const videoDodgeRef = useRef(0.0);
    const videoMirrorRef = useRef(0.0);
    const videoGlitchRef = useRef(0.0);
    const videoBlendModeRef = useRef(0); // [NEW]

    const { syncVideo } = useTransport(); // [NEW]

    // Audio Refs
    const audioTextureRef = useRef<THREE.DataTexture | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);

    // Texture Refs
    const userTextureRef = useRef<THREE.Texture | null>(null);
    const videoTextureRef = useRef<THREE.VideoTexture | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);

    const dataArrayRef = useRef<Uint8Array | null>(null);
    const timeDataArrayRef = useRef<Uint8Array | null>(null);
    const combinedDataRef = useRef<Uint8Array | null>(null);

    // Visual Refs (Boolean toggles)
    const oscilloscopeRef = useRef(false);
    const mirrorOscRef = useRef(false);
    const oscDodgeRef = useRef(false);
    const threeDOscRef = useRef(false);
    const colorDodgeRef = useRef(false);
    const colorDodgeLevelRef = useRef(0);
    const hueCyclingRef = useRef(false);
    const textureHueRef = useRef(0.0);

    // Physics
    const spinTargetRef = useRef(0.0);
    const spinCurrentRef = useRef(0.0);
    const colorDodgeMixRef = useRef(0.0);
    const bloomIntensityRef = useRef(0.4);

    // Audio Data
    const audioValuesRef = useRef({ low: 0, mid: 0, high: 0, integrated: 0, beat: 0, drum: 0 });

    // Inputs
    const userTextureInputRef = useRef<HTMLInputElement>(null);
    const userVideoInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    // --- HELPER TO UPDATE REFS ---
    const updateEngineRef = (key: string, val: number | boolean) => {
        switch (key) {
            case 'hue': hueRef.current = val as number; break;
            case 'saturation': satRef.current = val as number; break;
            case 'brightness': brightRef.current = val as number; break;
            case 'contrast': contrastRef.current = val as number; break;
            case 'grain': grainRef.current = val as number; break;
            case 'gainLow': gainLowRef.current = val as number; break;
            case 'gainMid': gainMidRef.current = val as number; break;
            case 'gainHigh': gainHighRef.current = val as number; break;
            case 'fxShake': fxShakeRef.current = val as number; break;
            case 'fxFlash': fxFlashRef.current = val as number; break;
            case 'fxSolarize': fxSolarizeRef.current = val as number; break;
            case 'bloomReact': bloomReactRef.current = val as number; break;
            case 'swingAmount': swingAmountRef.current = val as number; break;
            case 'particles': particlesRef.current = !!val; break;

            // Geometry
            case 'geoScale': geoScaleRef.current = val as number; break;
            case 'geoDeform': geoDeformRef.current = val as number; break;
            case 'geoThickness': geoThicknessRef.current = val as number; break;
            case 'geoDetail': geoDetailRef.current = val as number; break;
            case 'camSpeed': camSpeedRef.current = val as number; break;

            // Video Extras
            case 'videoFade': videoFadeRef.current = val as number; break;
            case 'videoPaletteMix': videoPaletteMixRef.current = val as number; break;
            case 'videoDiffusion': videoDiffusionRef.current = val as number; break;

            // Booleans
            case 'vhs': vhsRef.current = !!val; break;
            case 'blur': blurRef.current = !!val; break;
            case 'optics': opticsRef.current = !!val; break;
            case 'oscilloscope': oscilloscopeRef.current = !!val; break;
            case 'mirrorOsc': mirrorOscRef.current = !!val; break;
            case 'sceneMode': sceneModeRef.current = val as number; break;
            case 'warpMode': warpModeRef.current = val as number; break;
            case 'paletteMode': paletteModeRef.current = val as number; break;

            // Video
            case 'videoWarp': videoWarpRef.current = val as number; break;
            case 'videoDodge': videoDodgeRef.current = val as number; break;
            case 'videoMirror': videoMirrorRef.current = val as number; break;
            case 'videoGlitch': videoGlitchRef.current = val as number; break;

            case 'videoBlendMode': videoBlendModeRef.current = val as number; break; // [NEW]
            default: break;
        }
    };

    const updateState = useCallback((updates: Partial<typeof uiState>) => {
        setUiState(prev => ({ ...prev, ...updates }));
    }, []);


    const triggerAction = (action: string) => {
        if (action === 'randomize') randomizeState();

        if (action === 'centerCam') {
            isHomingRef.current = true;
            moveXRef.current = 0;
            moveYRef.current = 0;
        }

        if (action === 'nextVideo') handleNextVideo();
        if (action === 'prevVideo') handlePrevVideo();

        if (action === 'reset') {
            updateEngineRef('hue', 0);
            updateEngineRef('saturation', 1.2);
            // ... reset others if needed
            camXRef.current = 0.0;
            camYRef.current = 0.0;
            camVelXRef.current = 0.0;
            camVelYRef.current = 0.0;
            moveXRef.current = 0;
            moveYRef.current = 0;
            isHomingRef.current = false;
            camSpeedRef.current = 0.15;
            zoomRef.current = 1.0;
            zoomDirectionRef.current = 0;
            geoScaleRef.current = 0.5;
            geoDeformRef.current = 0.5;
            geoThicknessRef.current = 0.5;
            geoDetailRef.current = 0.5;
            videoFadeRef.current = 0.0;
            videoPaletteMixRef.current = 0.0;
            videoDiffusionRef.current = 0.0;
            setUiState(prev => ({
                ...prev,
                camSpeed: 0.15,
                geoScale: 0.5,
                geoDeform: 0.5,
                geoThickness: 0.5,
                geoDetail: 0.5,
                videoFade: 0.0,
                videoPaletteMix: 0.0,
                videoDiffusion: 0.0
            }));
        }

        if (action === 'nextScene') {
            setUiState(prev => {
                const next = (Math.round(prev.sceneMode) + 1) % 15;
                updateEngineRef('sceneMode', next);
                return { ...prev, sceneMode: next };
            });
        }

        if (action === 'prevScene') {
            setUiState(prev => {
                const next = (Math.round(prev.sceneMode) - 1 + 15) % 15;
                updateEngineRef('sceneMode', next);
                return { ...prev, sceneMode: next };
            });
        }

        if (action === 'tapBpm') {
            const now = performance.now() / 1000;
            const taps = tapTimesRef.current;
            if (taps.length > 0 && now - taps[taps.length - 1] > 2.0) {
                taps.length = 0;
                setBpm(null);
                beatIntervalRef.current = null;
            }
            taps.push(now);
            if (taps.length > 4) taps.shift();
            if (taps.length > 1) {
                let sum = 0;
                for (let i = 1; i < taps.length; i++) sum += taps[i] - taps[i - 1];
                const avg = sum / (taps.length - 1);
                beatIntervalRef.current = avg;
                setBpm(Math.round(60 / avg));
                lastBeatIndexRef.current = 0;
            }
        }
    };

    // --- MIDI IMPLEMENTATION ---
    useEffect(() => {
        // Load mappings
        const savedMappings = localStorage.getItem('oculus_midi_mappings');
        if (savedMappings) {
            const parsed = JSON.parse(savedMappings);
            setMidiMappings(parsed);
            midiMappingsRef.current = parsed;
        }

        if ((navigator as any).requestMIDIAccess) {
            (navigator as any).requestMIDIAccess().then((midiAccess: any) => {
                midiAccess.inputs.forEach((input: any) => {
                    input.onmidimessage = handleMidiMessage;
                });
                midiAccess.onstatechange = (e: any) => {
                    midiAccess.inputs.forEach((input: any) => {
                        input.onmidimessage = handleMidiMessage;
                    });
                };
            }, () => console.log("MIDI Access denied/not supported."));
        }
    }, []);

    const midiTargetRef = useRef<{ param: string, min: number, max: number, type: 'continuous' | 'toggle' | 'action' } | null>(null);
    useEffect(() => { midiTargetRef.current = midiLearnTarget; }, [midiLearnTarget]);

    const handleMidiMessage = (msg: any) => {
        const [status, data1, data2] = msg.data;
        const command = status & 0xf0;
        const channel = status & 0x0f;

        // Note On (144), Note Off (128), Control Change (176)
        if (command === 176 || command === 144 || command === 128) {
            const mapKey = `${channel}-${data1}`;
            const currentTarget = midiTargetRef.current;

            // LEARN MODE (Only on Note On or CC)
            if (currentTarget && (command === 176 || (command === 144 && data2 > 0))) {
                const newMapping: MidiMapping = {
                    channel,
                    cc: data1,
                    param: currentTarget.param,
                    min: currentTarget.min,
                    max: currentTarget.max,
                    type: currentTarget.type
                };

                setMidiMappings(prev => {
                    const next = { ...prev, [mapKey]: newMapping };
                    localStorage.setItem('oculus_midi_mappings', JSON.stringify(next));
                    midiMappingsRef.current = next;
                    return next;
                });
                setMidiLearnTarget(null); // Stop learning target
                setMidiLearnMode(false);  // Auto-exit Learn Mode
                return;
            }

            // NORMAL OPERATION
            const mapping = midiMappingsRef.current[mapKey];
            if (mapping) {
                // Determine Interaction Type
                // Note Off or Note On with vel 0 = RELEASE
                const isNoteOff = command === 128 || (command === 144 && data2 === 0);
                const isNoteOn = command === 144 && data2 > 0;

                // 1. CLIP TRIGGERING (Momentary / Flash / OneShot / Slot)
                if (mapping.param.startsWith('clipSet:') || mapping.param.startsWith('videoSlot:')) {
                    let id = '';
                    if (mapping.param.startsWith('clipSet:')) {
                        id = mapping.param.replace('clipSet:', '');
                    } else {
                        const slotIdx = parseInt(mapping.param.replace('videoSlot:', '')) - 1;
                        const clip = videoClipsRef.current[slotIdx];
                        if (!clip) return;
                        id = clip.id;
                    }

                    const clip = videoClipsRef.current.find(c => c.id === id);
                    const pMode = clip?.playbackMode || 'normal';

                    if (isNoteOn) {
                        handleSelectClip(id);
                    } else if (isNoteOff) {
                        const video = videoElementRef.current;
                        if (activeClipIdRef.current === id && video) {
                            if (pMode === 'oneshot') {
                                oneShotTriggerRef.current = 'releasing';
                            } else {
                                video.pause();
                                video.currentTime = 0;
                                setIsVideoPlaying(false);
                            }
                        }
                    }
                    return;
                }

                // 2. STANDARD ACTIONS (Rising Edge Only)
                if (mapping.type === 'toggle' || mapping.type === 'action') {
                    const lastVal = lastMidiValues.current[mapKey] || 0;
                    const isRisingEdge = lastVal < 64 && data2 >= 64;
                    lastMidiValues.current[mapKey] = data2;

                    if (isRisingEdge) {
                        if (mapping.type === 'action') {
                            if (mapping.param.startsWith('sceneSet:')) {
                                const idx = parseInt(mapping.param.split(':')[1]);
                                setUiState(prev => ({ ...prev, sceneMode: idx }));
                                updateEngineRef('sceneMode', idx);
                            }
                            else if (mapping.param.startsWith('warpSet:')) {
                                const idx = parseInt(mapping.param.split(':')[1]);
                                setUiState(prev => ({ ...prev, warpMode: idx }));
                                updateEngineRef('warpMode', idx);
                            }
                            else if (mapping.param.startsWith('paletteSet:')) {
                                const idx = parseInt(mapping.param.split(':')[1]);
                                setUiState(prev => ({ ...prev, paletteMode: idx }));
                                updateEngineRef('paletteMode', idx);
                            }
                            else {
                                // Named Actions
                                const actionName = mapping.param.replace('action:', '');
                                triggerAction(actionName);
                            }
                        } else {
                            // Toggle Boolean Param
                            if (mapping.param === 'videoLoop') setVideoLoop(prev => !prev);
                            else {
                                setUiState(prev => {
                                    const key = mapping.param as keyof typeof uiState;
                                    const newVal = !prev[key];
                                    updateEngineRef(mapping.param, newVal ? 1 : 0);
                                    return { ...prev, [key]: newVal };
                                });
                            }
                        }
                    }
                }
                // 3. CONTINUOUS SLIDERS
                else {
                    const normVal = data2 / 127.0; // 0.0 to 1.0
                    let actualVal = mapping.min + normVal * (mapping.max - mapping.min);

                    // Integer rounding for modes
                    if (['sceneMode', 'warpMode', 'paletteMode'].includes(mapping.param)) {
                        actualVal = Math.round(actualVal);
                    }

                    // Direct Engine Update (Fast)
                    updateEngineRef(mapping.param, actualVal);

                    // Direct UI State Update (React)
                    if (['videoWarp', 'videoDodge', 'videoMirror', 'videoGlitch', 'videoFade', 'videoPaletteMix', 'videoDiffusion'].includes(mapping.param)) {
                        if (mapping.param === 'videoWarp') setVideoWarp(actualVal);
                        if (mapping.param === 'videoDodge') setVideoDodge(actualVal);
                        if (mapping.param === 'videoMirror') setVideoMirror(actualVal);
                        if (mapping.param === 'videoGlitch') setVideoGlitch(actualVal);
                        if (['videoFade', 'videoPaletteMix', 'videoDiffusion'].includes(mapping.param)) {
                            setUiState(prev => ({ ...prev, [mapping.param]: actualVal }));
                        }
                    } else {
                        setUiState(prev => ({ ...prev, [mapping.param]: actualVal }));
                    }
                }
            }
        }
    };

    const toggleMidiLearn = () => {
        setMidiLearnMode(!midiLearnMode);
        setMidiLearnTarget(null);
    };

    const clearMidiMappings = () => {
        setMidiMappings({});
        midiMappingsRef.current = {};
        localStorage.removeItem('oculus_midi_mappings');
    };

    const handleMidiLearnTarget = (param: string, min: number, max: number, type: 'continuous' | 'toggle' | 'action') => {
        setMidiLearnTarget({ param, min, max, type });
    };


    const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [w, h, label] = e.target.value.split(',');
        setTargetResolution({ w: parseInt(w), h: parseInt(h), label });
    };

    const toggleProjector = () => {
        if (projectorMode && projectorWindowRef.current) {
            // Manual Close
            projectorWindowRef.current.close();
            projectorWindowRef.current = null;
            setProjectorMode(false);
            return;
        }

        // Open New
        const { w, h } = targetResolution;
        const left = (window.screen.width / 2) - (w / 2);
        const top = (window.screen.height / 2) - (h / 2);

        const features = `width=${w},height=${h},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`;
        const newWin = window.open('', 'OculusProjector', features);

        if (!newWin) {
            alert("Pop-up blocked! Please allow pop-ups for projector mode.");
            return;
        }

        newWin.document.title = "Oculus-X Projector";
        newWin.document.head.innerHTML = `
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #000; }
        canvas { display: block; width: 100%; height: 100%; }
      </style>
    `;

        projectorWindowRef.current = newWin;
        setProjectorMode(true);
    };

    const handleUserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const loader = new THREE.TextureLoader();
            loader.load(URL.createObjectURL(file), (tex) => {
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.wrapS = THREE.RepeatWrapping;
                tex.wrapT = THREE.RepeatWrapping;
                userTextureRef.current = tex;
                sceneModeRef.current = 4;
                setUiState(prev => ({ ...prev, sceneMode: 4 }));
            });
        }
    };



    // [NEW] Video Deck Handlers
    const handleAddVideoClips = (files: File[]) => {
        setVideoClips(prev => {
            const nextClips = [...prev];
            files.forEach(file => {
                const id = crypto.randomUUID();

                // [NEW] Use media:// protocol if file.path is available (Electron)
                // Fallback to legacy Blob URL if path is missing
                const filePath = (file as any).path;
                const url = filePath ? `media://${filePath}` : URL.createObjectURL(file);

                const newClip: VideoClip = {
                    id,
                    file,
                    url,
                    name: file.name,
                    playbackMode: 'normal',
                    releaseTime: 0.5
                };
                nextClips.push(newClip);
            });

            return nextClips;
        });
    };

    // [NEW] Handler to update clip settings
    const handleUpdateClip = (id: string, updates: Partial<VideoClip>) => {
        setVideoClips(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        if (activeClipId === id && videoElementRef.current) {
            if (updates.playbackMode) {
                const video = videoElementRef.current;
                video.playbackRate = (updates.playbackMode === 'reverse') ? -1.0 : 1.0;
                video.loop = (updates.playbackMode === 'normal');

                // If switching TO reverse, jump to end
                if (updates.playbackMode === 'reverse') {
                    if (video.currentTime < 0.1) { // Only if at start
                        video.currentTime = video.duration || 0;
                    }
                }
            }
        }
    };

    const handleSelectClip = (id: string) => {
        setActiveClipId(id);
        const clips = videoClipsRef.current;
        const index = clips.findIndex(c => c.id === id);
        if (index !== -1) setCurrentVideoIndex(index);

        const clip = clips.find(c => c.id === id);
        const video = videoElementRef.current;
        if (!clip || !video) return;

        // Load and Setup
        video.src = clip.url;
        video.playbackRate = (clip.playbackMode === 'reverse') ? -1.0 : 1.0;
        video.loop = (clip.playbackMode === 'normal');

        video.onloadedmetadata = () => {
            if (clip.playbackMode === 'reverse') {
                video.currentTime = video.duration || 0;
            }
        };

        console.log(`[SkyDeck] Selecting Clip: ${clip.name}, Mode: ${clip.playbackMode}`, clip.url);

        video.play().then(() => {
            console.log(`[SkyDeck] Video playing successfully: ${clip.name}`);
            setIsVideoPlaying(true);
        }).catch(err => {
            console.warn("[SkyDeck] Play Failed - re-trying:", err);
            video.load();
            video.play().then(() => {
                console.log(`[SkyDeck] Video playing successfully after retry: ${clip.name}`);
                setIsVideoPlaying(true);
            }).catch(e => console.error("[SkyDeck] Final play error:", e));
        });

        if (clip.playbackMode === 'oneshot') {
            oneShotTriggerRef.current = 'playing';
            internalFadeRef.current = 0.0;
        } else {
            oneShotTriggerRef.current = 'stopped';
            internalFadeRef.current = 0.0;
        }
    };

    const handleRemoveClip = (id: string) => {
        setVideoClips(prev => {
            const next = prev.filter(c => c.id !== id);
            const clipToRemove = prev.find(c => c.id === id);
            if (clipToRemove) {
                URL.revokeObjectURL(clipToRemove.url);
            }

            if (activeClipId === id) {
                setActiveClipId(null);
                setIsVideoPlaying(false);
                if (videoElementRef.current) {
                    videoElementRef.current.pause();
                    videoElementRef.current.src = "";
                }
            }

            return next;
        });
    };

    const handleClipBind = (id: string) => {
        const targetParam = `clipSet:${id}`;
        if (midiLearnMode && midiLearnTarget?.param === targetParam) {
            // Toggle OFF if clicking same bind button
            setMidiLearnMode(false);
            setMidiLearnTarget(null);
        } else {
            // Enable Learn Mode
            setMidiLearnMode(true);
            handleMidiLearnTarget(targetParam, 0, 1, 'action');
        }
    };

    const handleVideoPlay = () => {
        if (videoElementRef.current) {
            videoElementRef.current.play();
            setIsVideoPlaying(true);
        }
    };

    const handleVideoPause = () => {
        if (videoElementRef.current) {
            videoElementRef.current.pause();
            setIsVideoPlaying(false);
        }
    };

    const handleVideoRewind = () => {
        if (videoElementRef.current) {
            videoElementRef.current.currentTime = 0;
        }
    };

    // --- PLAYLIST LOGIC ---

    const handleNextVideo = useCallback(() => {
        const clips = videoClipsRef.current;
        if (clips.length === 0) return;
        const nextIndex = (currentVideoIndex + 1) % clips.length;
        handleSelectClip(clips[nextIndex].id);
    }, [currentVideoIndex]);

    const handlePrevVideo = useCallback(() => {
        const clips = videoClipsRef.current;
        if (clips.length === 0) return;
        const prevIndex = (currentVideoIndex - 1 + clips.length) % clips.length;
        handleSelectClip(clips[prevIndex].id);
    }, [currentVideoIndex]);

    useEffect(() => {
        const onEnded = () => {
            console.log("[SkyDeck] Video Ended, advancing...");
            handleNextVideo();
        };
        document.addEventListener('oculus-video-ended', onEnded);
        return () => document.removeEventListener('oculus-video-ended', onEnded);
    }, [handleNextVideo]);

    // Handle Play Track
    const handlePlayTrack = (index: number) => {
        if (index >= 0 && index < playlist.length) {
            setCurrentTrackIndex(index);
            const file = playlist[index];
            if (audioElementRef.current) {
                const url = URL.createObjectURL(file);
                audioElementRef.current.src = url;
                audioElementRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleNextTrack = () => {
        let nextIndex = 0;
        if (isShuffle) {
            // Simple random for now, could be improved with history
            nextIndex = Math.floor(Math.random() * playlist.length);
            if (nextIndex === currentTrackIndex && playlist.length > 1) {
                nextIndex = (nextIndex + 1) % playlist.length;
            }
        } else {
            nextIndex = (currentTrackIndex + 1) % playlist.length;
        }
        handlePlayTrack(nextIndex);
    };

    const handlePrevTrack = () => {
        const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        handlePlayTrack(prevIndex);
    };

    const handleAddTracks = (files: FileList) => {
        const newFiles = Array.from(files);
        setPlaylist(prev => [...prev, ...newFiles]);
    };

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleAddTracks(e.target.files);
            // If empty playlist, start playing first added
            if (playlist.length === 0) {
                setTimeout(() => handlePlayTrack(0), 100);
            }
        }
    };

    const togglePlay = () => {
        if (audioElementRef.current) {
            if (isPlaying) audioElementRef.current.pause();
            else audioElementRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioElementRef.current) {
            audioElementRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const skipTime = (seconds: number) => {
        if (audioElementRef.current) {
            audioElementRef.current.currentTime += seconds;
        }
    };

    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseFloat(e.target.value);
        setVolume(v);
        if (audioElementRef.current) audioElementRef.current.volume = v;
    };

    const formatTime = (t: number) => {
        const mins = Math.floor(t / 60);
        const secs = Math.floor(t % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // --- RECORDING FUNCTIONS ---
    const toggleRecording = () => {
        if (isRecording) stopRecording();
        else startRecording();
    };

    const startRecording = () => {
        if (!rendererRef.current || !recordingDestRef.current) return;

        const canvas = rendererRef.current.domElement;
        const canvasStream = canvas.captureStream(60);
        const audioStream = recordingDestRef.current.stream;

        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
        let selectedMime = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

        const recorder = new MediaRecorder(combinedStream, { mimeType: selectedMime, videoBitsPerSecond: 12000000 });
        recordedChunksRef.current = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
        recorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: selectedMime });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `oculus-capture-${timestamp}.webm`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
            setRecordingTime(0);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);

        const startTime = Date.now();
        recordingTimerRef.current = window.setInterval(() => {
            setRecordingTime((Date.now() - startTime) / 1000);
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // --- EFFECTS ---
    const handleUserVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Use media:// if available
        const filePath = (file as any).path;
        const url = filePath ? `media://${filePath}` : URL.createObjectURL(file);

        if (videoElementRef.current) {
            videoElementRef.current.src = url;
            videoElementRef.current.loop = true;
            videoElementRef.current.play().then(() => {
                setIsVideoPlaying(true);
                setActiveClipId(null); // Clear active playlist clip when manually uploading
                videoElementRef.current!.playbackRate = videoSpeed;
            }).catch(err => console.error("Manual video play failed:", err));
        }
    };

    useEffect(() => {
        if (videoElementRef.current) {
            videoElementRef.current.playbackRate = videoSpeed;
            videoElementRef.current.loop = videoLoop;
        }
    }, [videoSpeed, videoLoop]);

    useEffect(() => {
        videoScaleRef.current = videoScale;
        videoWarpRef.current = videoWarp;
        videoDodgeRef.current = videoDodge;
        videoMirrorRef.current = videoMirror;
        videoGlitchRef.current = videoGlitch;
        videoBlendModeRef.current = videoBlendMode; // [NEW]

        // BPM Sync Logic
        if (isVideoSynced && bpm && videoElementRef.current) {
            syncVideo(videoElementRef.current, videoTargetBars, bpm);
        } else if (!isVideoSynced && videoElementRef.current) {
            // Reset speed if sync disabled
            videoElementRef.current.playbackRate = videoSpeed;
        }

    }, [videoScale, videoWarp, videoDodge, videoMirror, videoGlitch, videoBlendMode, isVideoSynced, bpm, videoTargetBars, videoSpeed]);

    const randomizeState = () => {
        const scenes = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        const newScene = scenes[Math.floor(Math.random() * scenes.length)];
        sceneModeRef.current = newScene;
        warpModeRef.current = Math.floor(Math.random() * 5);
        paletteModeRef.current = Math.floor(Math.random() * 5);
        hueRef.current = (Math.random() - 0.5) * 1.0;
        satRef.current = 1.0 + Math.random() * 1.0;
        mirrorOscRef.current = Math.random() > 0.7;
        oscilloscopeRef.current = Math.random() > 0.8;
        particlesRef.current = Math.random() > 0.5;

        geoScaleRef.current = Math.random();
        geoDeformRef.current = Math.random();
        geoThicknessRef.current = Math.random();
        geoDetailRef.current = Math.random();

        if (Math.random() > 0.7) spinTargetRef.current = (Math.random() > 0.5 ? 20 : -20);
        else spinTargetRef.current = 0;

        // Reset Camera
        camXRef.current = 0.0;
        camYRef.current = 0.0;
        moveXRef.current = 0;
        moveYRef.current = 0;
        isHomingRef.current = false;
        camVelXRef.current = 0;
        camVelYRef.current = 0;

        setUiState(prev => ({
            ...prev,
            sceneMode: newScene,
            warpMode: warpModeRef.current,
            paletteMode: paletteModeRef.current,
            hue: hueRef.current,
            saturation: satRef.current,
            mirrorOsc: mirrorOscRef.current,
            oscilloscope: oscilloscopeRef.current,
            particles: particlesRef.current,
            geoScale: geoScaleRef.current,
            geoDeform: geoDeformRef.current,
            geoThickness: geoThicknessRef.current,
            geoDetail: geoDetailRef.current
        }));
    };

    const triggerTransition = () => {
        if (transitionStateRef.current === 'idle') {
            transitionStateRef.current = 'in';
        }
    };

    // --- KEYBOARD LISTENERS ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['F1', 'F2', 'F3', 'F4', 'F5'].includes(e.key)) e.preventDefault();

            if (e.key === 'Enter') {
                triggerAction('tapBpm');
                return;
            }

            if (e.key === 'Home') {
                triggerAction('centerCam');
                return;
            }

            if (e.key === 'Backspace' && !['Insert', 'Delete'].includes(e.key)) {
                tapTimesRef.current = [];
                beatIntervalRef.current = null;
                setBpm(null);
                return;
            }

            // Camera Control (Toggle movement)
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                isHomingRef.current = false; // Break homing
                if (e.key === 'ArrowLeft') { moveXRef.current = (moveXRef.current === -1) ? 0 : -1; }
                if (e.key === 'ArrowRight') { moveXRef.current = (moveXRef.current === 1) ? 0 : 1; }
                if (e.key === 'ArrowUp') { moveYRef.current = (moveYRef.current === 1) ? 0 : 1; }
                if (e.key === 'ArrowDown') { moveYRef.current = (moveYRef.current === -1) ? 0 : -1; }
            }

            // Zoom Controls (Toggle direction)
            if (e.key === 'Insert') { zoomDirectionRef.current = (zoomDirectionRef.current === 1) ? 0 : 1; }
            if (e.key === 'Delete') { zoomDirectionRef.current = (zoomDirectionRef.current === -1) ? 0 : -1; }

            const key = e.key.toUpperCase();
            const update = (updates: Partial<typeof uiState>) => setUiState(prev => ({ ...prev, ...updates }));

            if (e.code === 'Space') { e.preventDefault(); triggerTransition(); }

            if (key === '1') { sceneModeRef.current = 0; update({ sceneMode: 0 }); }
            if (key === '2') { sceneModeRef.current = 1; update({ sceneMode: 1 }); }
            if (key === '3') { sceneModeRef.current = 2; update({ sceneMode: 2 }); }
            if (key === '4') { sceneModeRef.current = 3; update({ sceneMode: 3 }); }
            if (key === '5') { sceneModeRef.current = 4; update({ sceneMode: 4 }); }
            if (key === '6') { sceneModeRef.current = 7; update({ sceneMode: 7 }); }
            if (key === 'I') { sceneModeRef.current = 8; update({ sceneMode: 8 }); }
            if (key === 'Z') { sceneModeRef.current = 5; update({ sceneMode: 5 }); }
            if (key === 'U') { sceneModeRef.current = 6; update({ sceneMode: 6 }); }
            if (key === 'P') { sceneModeRef.current = 9; update({ sceneMode: 9 }); }
            if (key === 'L') { sceneModeRef.current = 10; update({ sceneMode: 10 }); }
            if (key === 'S') { sceneModeRef.current = 11; update({ sceneMode: 11 }); }
            if (key === 'G') { sceneModeRef.current = 12; update({ sceneMode: 12 }); }
            if (key === 'X') { sceneModeRef.current = 13; update({ sceneMode: 13 }); }
            if (key === 'N') { sceneModeRef.current = 14; update({ sceneMode: 14 }); } // Dancing Shadows


            if (key === 'Q') { warpModeRef.current = 0; update({ warpMode: 0 }); }
            if (key === 'W') { warpModeRef.current = 1; update({ warpMode: 1 }); }
            if (key === 'E') { warpModeRef.current = 2; update({ warpMode: 2 }); }
            if (key === 'R') { warpModeRef.current = 3; update({ warpMode: 3 }); }

            if (key === 'T') { spinTargetRef.current = 50.0; update({ spin: true }); }
            if (key === 'Y') { spinTargetRef.current = 0.0; update({ spin: false }); }
            if (key === 'D') stretchStateRef.current = (stretchStateRef.current === 'expanding' ? 'idle' : 'expanding');
            if (key === 'F') stretchStateRef.current = 'returning';

            if (e.key === ';') { satRef.current = Math.min(3.0, satRef.current + 0.1); update({ saturation: satRef.current }); }
            if (e.key === "'") { satRef.current = Math.max(0.0, satRef.current - 0.1); update({ saturation: satRef.current }); }
            if (key === '9') { brightRef.current = Math.max(0.0, brightRef.current - 0.1); update({ brightness: brightRef.current }); }
            if (key === '0') { brightRef.current = Math.min(3.0, brightRef.current + 0.1); update({ brightness: brightRef.current }); }
            if (e.key === '[') { hueRef.current -= 0.1; update({ hue: hueRef.current }); }
            if (e.key === ']') { hueRef.current += 0.1; update({ hue: hueRef.current }); }

            if (key === 'K') { vhsRef.current = !vhsRef.current; update({ vhs: vhsRef.current }); }
            if (e.key === '=') { paletteModeRef.current = (paletteModeRef.current + 1) % 5; update({ paletteMode: paletteModeRef.current }); }
            if (key === 'A') { oscilloscopeRef.current = !oscilloscopeRef.current; update({ oscilloscope: oscilloscopeRef.current }); }
            if (key === 'M') { mirrorOscRef.current = !mirrorOscRef.current; update({ mirrorOsc: mirrorOscRef.current }); }
            if (key === 'B') { threeDOscRef.current = !threeDOscRef.current; update({ threeDOsc: threeDOscRef.current }); }
            if (key === '7') { oscDodgeRef.current = !oscDodgeRef.current; update({ oscDodge: oscDodgeRef.current }); }
            if (key === '8') { hueCyclingRef.current = !hueCyclingRef.current; update({ hueCycling: hueCyclingRef.current }); }
            if (key === 'J') { blurRef.current = !blurRef.current; update({ blur: blurRef.current }); }
            if (key === 'V') { opticsRef.current = !opticsRef.current; update({ optics: opticsRef.current }); }

            if (e.key === 'F4') {
                colorDodgeLevelRef.current = (colorDodgeLevelRef.current + 1) % 4;
                colorDodgeRef.current = colorDodgeLevelRef.current > 0;
                update({ colorDodgeLevel: colorDodgeLevelRef.current });
            }

            if (key === 'H') {
                hueCyclingRef.current = false; hueRef.current = 0.0; textureHueRef.current = 0.0;
                paletteModeRef.current = 0; particlesRef.current = false;
                gainLowRef.current = 1.0; gainMidRef.current = 1.0; gainHighRef.current = 1.0;
                fxShakeRef.current = 0.0; fxFlashRef.current = 0.0; fxSolarizeRef.current = 0.0; bloomReactRef.current = 0.0; swingAmountRef.current = 0.0;
                tapTimesRef.current = []; beatIntervalRef.current = null; setBpm(null);
                camXRef.current = 0.0; camYRef.current = 0.0; moveXRef.current = 0; moveYRef.current = 0;
                camVelXRef.current = 0.0; camVelYRef.current = 0.0;
                isHomingRef.current = false;
                camSpeedRef.current = 0.15;
                geoScaleRef.current = 0.5; geoDeformRef.current = 0.5;
                geoThicknessRef.current = 0.5; geoDetailRef.current = 0.5;
                videoFadeRef.current = 0.0;
                videoPaletteMixRef.current = 0.0;
                videoDiffusionRef.current = 0.0;
                update({ camSpeed: 0.15, hueCycling: false, hue: 0.0, paletteMode: 0, particles: false, gainLow: 1.0, gainMid: 1.0, gainHigh: 1.0, fxShake: 0.0, fxFlash: 0.0, fxSolarize: 0.0, bloomReact: 0.0, swingAmount: 0.0, geoScale: 0.5, geoDeform: 0.5, geoThickness: 0.5, geoDetail: 0.5, videoFade: 0.0, videoPaletteMix: 0.0, videoDiffusion: 0.0 });
            }
            if (e.key === '/') {
                zoomRef.current = 1.0; zoomDirectionRef.current = 0; sceneModeRef.current = 0; warpModeRef.current = 0;
                spinTargetRef.current = 0.0; spinCurrentRef.current = 0.0; bloomIntensityRef.current = 0.4;
                satRef.current = 1.2; paletteModeRef.current = 0; brightRef.current = 1.0; contrastRef.current = 1.0;
                grainRef.current = 0.0; vhsRef.current = false; oscilloscopeRef.current = false; mirrorOscRef.current = false;
                threeDOscRef.current = false; oscDodgeRef.current = false; hueCyclingRef.current = false; hueRef.current = 0.0;
                textureHueRef.current = 0.0; colorDodgeRef.current = false; colorDodgeLevelRef.current = 0;
                stretchRef.current = 1.0; stretchStateRef.current = 'idle'; blurRef.current = false; opticsRef.current = false;
                particlesRef.current = false; gainLowRef.current = 1.0; gainMidRef.current = 1.0; gainHighRef.current = 1.0;
                fxShakeRef.current = 0.0; fxFlashRef.current = 0.0; fxSolarizeRef.current = 0.0; bloomReactRef.current = 0.0; swingAmountRef.current = 0.0;
                tapTimesRef.current = []; beatIntervalRef.current = null; setBpm(null);
                camXRef.current = 0.0; camYRef.current = 0.0; moveXRef.current = 0; moveYRef.current = 0;
                camVelXRef.current = 0.0; camVelYRef.current = 0.0;
                isHomingRef.current = false;
                camSpeedRef.current = 0.15;
                geoScaleRef.current = 0.5; geoDeformRef.current = 0.5;
                geoThicknessRef.current = 0.5; geoDetailRef.current = 0.5;
                videoFadeRef.current = 0.0;
                videoPaletteMixRef.current = 0.0;
                videoDiffusionRef.current = 0.0;
                setUiState({
                    sceneMode: 0, warpMode: 0, spin: false, zoom: 1.0, oscilloscope: false, mirrorOsc: false, threeDOsc: false,
                    oscDodge: false, hueCycling: false, colorDodgeLevel: 0, saturation: 1.2, hue: 0.0, paletteMode: 0,
                    brightness: 1.0, contrast: 1.0, grain: 0.0, vhs: false, stretch: 1.0, blur: false, optics: false,
                    particles: false, gainLow: 1.0, gainMid: 1.0, gainHigh: 1.0, fxShake: 0.0, fxFlash: 0.0, fxSolarize: 0.0, bloomReact: 0.0, swingAmount: 0.0,
                    geoScale: 0.5, geoDeform: 0.5, geoThickness: 0.5, geoDetail: 0.5, camSpeed: 0.15, videoFade: 0.0, videoPaletteMix: 0.0, videoDiffusion: 0.0
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- ENGINE SETUP & LOOP ---
    useEffect(() => {
        const isIntegrated = (externalAnalyserNode !== undefined || externalAudioCtx !== undefined);

        if (isIntegrated) {
            // In integrated mode, ONLY use the synth output. No mic fallback.
            if (!externalAudioCtx || !externalAnalyserNode) return;
        } else {
            // Standalone mode fallback
            if (mode === 'mic' && !stream) return;
            if (mode === 'file' && !audioFile) return;
        }

        let audioCtx: AudioContext | null = null;
        let fileAudio: HTMLAudioElement | null = null;
        let animationId: number;

        const initAudio = async () => {
            if (isIntegrated && externalAudioCtx && externalAnalyserNode) {
                analyserRef.current = externalAnalyserNode;
                const bufferLength = externalAnalyserNode.frequencyBinCount;
                dataArrayRef.current = new Uint8Array(bufferLength);
                timeDataArrayRef.current = new Uint8Array(bufferLength);
                combinedDataRef.current = new Uint8Array(bufferLength * 2);
                const audioTex = new THREE.DataTexture(combinedDataRef.current, bufferLength, 2, THREE.RedFormat, THREE.UnsignedByteType);
                audioTex.magFilter = THREE.LinearFilter;
                audioTex.minFilter = THREE.LinearFilter;
                audioTextureRef.current = audioTex;
                return;
            }

            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            audioCtx = new AudioContextClass();
            if (audioCtx.state === 'suspended') await audioCtx.resume();

            const recDest = audioCtx.createMediaStreamDestination();
            recordingDestRef.current = recDest;

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.5;
            analyserRef.current = analyser;

            if (mode === 'mic' && stream) {
                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.connect(recDest);
            }
            else if (mode === 'file' && audioFile) {
                fileAudio = new Audio();
                fileAudio.src = URL.createObjectURL(audioFile);
                fileAudio.loop = false;
                fileAudio.volume = 1.0;
                fileAudio.crossOrigin = "anonymous";
                fileAudio.style.display = 'none';

                fileAudio.addEventListener('timeupdate', () => setCurrentTime(fileAudio?.currentTime || 0));
                fileAudio.addEventListener('loadedmetadata', () => setDuration(fileAudio?.duration || 0));

                fileAudio.addEventListener('ended', () => {
                    document.dispatchEvent(new CustomEvent('oculus-track-ended'));
                });

                fileAudio.addEventListener('play', () => setIsPlaying(true));
                fileAudio.addEventListener('pause', () => setIsPlaying(false));

                if (containerRef.current) containerRef.current.appendChild(fileAudio);
                audioElementRef.current = fileAudio;
                await new Promise((resolve) => {
                    fileAudio!.addEventListener('canplay', resolve, { once: true });
                    fileAudio!.play().catch(console.error);
                });
                const source = audioCtx.createMediaElementSource(fileAudio);
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                analyser.connect(recDest);
            }

            const bufferLength = analyser.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);
            timeDataArrayRef.current = new Uint8Array(bufferLength);
            combinedDataRef.current = new Uint8Array(bufferLength * 2);
            const audioTex = new THREE.DataTexture(combinedDataRef.current, bufferLength, 2, THREE.RedFormat, THREE.UnsignedByteType);
            audioTex.magFilter = THREE.LinearFilter;
            audioTex.minFilter = THREE.LinearFilter;
            audioTextureRef.current = audioTex;
        };

        initAudio();

        return () => {
            if (fileAudio) { fileAudio.pause(); fileAudio.remove(); }
            if (audioCtx) audioCtx.close();
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };
    }, [mode, stream, audioFile, externalAudioCtx, externalAnalyserNode]);

    useEffect(() => {
        const onEnd = () => handleNextTrack();
        document.addEventListener('oculus-track-ended', onEnd);
        return () => document.removeEventListener('oculus-track-ended', onEnd);
    }, [playlist, currentTrackIndex, isShuffle]);


    // --- MAIN ENGINE LOOP (CONSOLIDATED) ---
    useEffect(() => {
        if (!mode) return;
        let animationId: number;

        // Create new Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            depth: false,
            stencil: false,
            preserveDrawingBuffer: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.autoClear = false;

        // Enable shadow mapping for CGI-quality visuals
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows

        rendererRef.current = renderer;

        // Handle Window Placement / Context
        if (projectorMode && projectorWindowRef.current) {
            projectorWindowRef.current.document.body.appendChild(renderer.domElement);
            renderer.setPixelRatio(Math.min(projectorWindowRef.current.devicePixelRatio, 2));
            renderer.setSize(projectorWindowRef.current.innerWidth, projectorWindowRef.current.innerHeight);

            // Handle Pop-up Close Logic
            projectorWindowRef.current.onbeforeunload = () => {
                setProjectorMode(false);
                projectorWindowRef.current = null;
                return null;
            };
            const handleResize = () => {
                if (projectorWindowRef.current) {
                    const w = projectorWindowRef.current.innerWidth;
                    const h = projectorWindowRef.current.innerHeight;
                    renderer.setSize(w, h);
                    renderer.setPixelRatio(Math.min(projectorWindowRef.current.devicePixelRatio, 2));
                }
            };
            projectorWindowRef.current.addEventListener('resize', handleResize);

        } else {
            // Fullscreen Background Mode
            const bgContainer = document.getElementById('deltavision-background') || (() => {
                const div = document.createElement('div');
                div.id = 'deltavision-background';
                div.style.position = 'fixed';
                div.style.left = '0';
                div.style.top = '0';
                div.style.width = '100vw';
                div.style.height = '100vh';
                div.style.zIndex = '-10'; // behind the main rack
                div.style.pointerEvents = 'none'; // click-through
                div.style.background = '#000';
                document.body.insertBefore(div, document.body.firstChild);
                return div;
            })();
            bgContainer.style.display = 'block';
            if (renderer.domElement.parentElement !== bgContainer) {
                bgContainer.appendChild(renderer.domElement);
            }

            // Leo Symbiosis Telemetry HUD
            const hud = document.getElementById('deltavision-hud') || (() => {
                const hudDiv = document.createElement('div');
                hudDiv.id = 'deltavision-hud';
                hudDiv.style.position = 'absolute';
                hudDiv.style.inset = '0';
                hudDiv.style.padding = '24px';
                hudDiv.style.fontFamily = "monospace";
                hudDiv.style.color = '#00f3ff';
                hudDiv.style.textShadow = '0 0 8px rgba(0, 243, 255, 0.6)';
                hudDiv.style.pointerEvents = 'none';
                hudDiv.style.display = 'flex';
                hudDiv.style.flexDirection = 'column';
                hudDiv.style.justifyContent = 'space-between';
                hudDiv.style.fontSize = '10px';
                hudDiv.style.letterSpacing = '1px';
                hudDiv.style.zIndex = '-9'; // in front of canvas, behind rack
                hudDiv.innerHTML = `
                    <!-- Top Bar -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; opacity: 0.85;">
                        <div>
                            <div style="font-weight: 900; font-size: 11px; letter-spacing: 2px;">⚡ LEO COGNITIVE CO-PROCESSING // ACTIVE</div>
                            <div style="margin-top: 4px;">NEURAL COUPLING RESONANCE: <span id="hud-coupling" style="color: #ff0055; font-weight: bold;">--%</span></div>
                        </div>
                        <div style="text-align: right;">
                            <div>SYMBIOTE CORE LINK: <span style="color: #00ff66; font-weight: bold;">SECURED</span></div>
                            <div style="margin-top: 4px; color: #ffe600;" id="hud-richie">RICHIE SYSTEM REMINDER: STANDBY</div>
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; opacity: 0.85;">
                        <div>
                            <div style="color: #ffaa00; font-weight: bold; margin-bottom: 6px; font-size: 11px;">// LIVE TELEMETRY STREAM:</div>
                            <div id="hud-log" style="line-height: 1.5; opacity: 0.9; height: 75px; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; width: 500px;">
                                [SYSTEM] BOOTING SYMBIOTE INSTANCED GRAPHICS ENGINE...
                            </div>
                        </div>
                        <div style="text-align: right; line-height: 1.5;">
                            <div id="hud-bpm" style="font-size: 12px; font-weight: bold; color: #ffe600;">BPM: --</div>
                            <div>RENDER TARGET: <span id="hud-mode" style="color: #00ff66;">--</span></div>
                        </div>
                    </div>
                `;
                bgContainer.appendChild(hudDiv);
                return hudDiv;
            })();
            hud.style.display = 'flex';

            renderer.setSize(window.innerWidth, window.innerHeight);
            const handleResize = () => { renderer.setSize(window.innerWidth, window.innerHeight); };
            window.addEventListener('resize', handleResize);
        }

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;
        const placeholderTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat);
        placeholderTex.needsUpdate = true;

        const particleScene = new THREE.Scene();
        const particleCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        particleCamera.position.z = 20;

        const particleCount = 1000;
        const posArray = new Float32Array(particleCount * 3);
        const sizeArray = new Float32Array(particleCount);
        const randomArray = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const r = 10 + Math.random() * 40;
            const theta = Math.random() * Math.PI * 2;
            const z = (Math.random() - 0.5) * 100;
            posArray[i * 3] = r * Math.cos(theta);
            posArray[i * 3 + 1] = r * Math.sin(theta);
            posArray[i * 3 + 2] = z;
            sizeArray[i] = Math.random() * 2.0;
            randomArray[i * 3] = Math.random();
            randomArray[i * 3 + 1] = Math.random();
            randomArray[i * 3 + 2] = Math.random();
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particleGeo.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
        particleGeo.setAttribute('random', new THREE.BufferAttribute(randomArray, 3));

        const particleUniforms = {
            uTime: { value: 0.0 },
            uBeat: { value: 0.0 },
            uLow: { value: 0.0 },
            uHigh: { value: 0.0 }
        };

        const particleMat = new THREE.ShaderMaterial({
            uniforms: particleUniforms,
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const pointCloud = new THREE.Points(particleGeo, particleMat);
        particleScene.add(pointCloud);

        const uniforms = {
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height) },
            uLow: { value: 0.0 },
            uMid: { value: 0.0 },
            uHigh: { value: 0.0 },
            uIntegrated: { value: 0.0 },
            uBeat: { value: 0.0 },
            uDrums: { value: 0.0 },
            uAudioTexture: { value: audioTextureRef.current || placeholderTex },
            uBloomIntensity: { value: 0.4 },
            uBloomReact: { value: 0.0 },
            uSceneMode: { value: 0.0 },
            uWarpMode: { value: 0.0 },
            uUserTexture: { value: placeholderTex as THREE.Texture },
            uHasTexture: { value: 0.0 },
            uVideoTexture: { value: placeholderTex as THREE.Texture },
            uHasVideo: { value: 0.0 },
            uVideoScale: { value: 1.0 },
            uVideoWarp: { value: 0.0 },
            uVideoDodge: { value: 0.0 },
            uVideoMirror: { value: 0.0 },
            uVideoGlitch: { value: 0.0 },
            uVideoFade: { value: 0.0 },
            uVideoPaletteMix: { value: 0.0 },
            uVideoDiffusion: { value: 0.0 },
            uVideoBlendMode: { value: 0 }, // [NEW]
            uSpin: { value: 0.0 },
            uOscilloscope: { value: 0.0 },
            uColorDodgeMix: { value: 0.0 },
            uOscDodge: { value: 0.0 },
            uHueShift: { value: 0.0 },
            u3DOscilloscope: { value: 0.0 },
            uTextureHue: { value: 0.0 },
            uMirrorOsc: { value: 0.0 },
            uZoom: { value: 1.0 },
            uVibrance: { value: 1.2 },
            uPaletteMode: { value: 0.0 },
            uBrightness: { value: 1.0 },
            uStretch: { value: 1.0 },
            uContrast: { value: 1.0 },
            uGrain: { value: 0.0 },
            uVHS: { value: 0.0 },
            uTransition: { value: 0.0 },
            uBlur: { value: 0.0 },
            uOptics: { value: 0.0 },
            uFxShake: { value: 0.0 },
            uFxFlash: { value: 0.0 },
            uFxSolarize: { value: 0.0 },
            uSwing: { value: 0.0 },
            uCamX: { value: 0.0 },
            uCamY: { value: 0.0 },
            uGeoScale: { value: 0.5 },
            uGeoDeform: { value: 0.5 },
            uGeoThickness: { value: 0.5 },
            uGeoDetail: { value: 0.5 }
        };

        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, depthWrite: false, depthTest: false })
        );
        mesh.name = "RaymarchQuad";
        scene.add(mesh);

        // --- LIGHTING (New for PBR) ---
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Soft fill
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 50;
        scene.add(dirLight);

        // --- SUPERFORMULA INSTANCED MESH (NEUROMESH INTEGRATION) ---
        // 9 Instances: 1 Live + 8 Echoes
        const INSTANCE_COUNT = 9;

        const sfUniforms = {
            uTime: { value: 0 },
            uLow: { value: 0 },
            uMid: { value: 0 },
            uHigh: { value: 0 },
            uEnergy: { value: 0 },
            uReactivity: { value: 0.5 },
            uDistortion: { value: 0.0 },
            uColorShift: { value: 0.0 },
            uRimStrength: { value: 2.0 },
            uScanlines: { value: 0.2 },
            uFlow: { value: 0.0 },
            uColor1: { value: new THREE.Color('#00ffcc') },
            uColor2: { value: new THREE.Color('#ff00aa') },

            // Arrays initialized with zeros
            uM1: { value: new Array(9).fill(0) },
            uN11: { value: new Array(9).fill(0) },
            uN21: { value: new Array(9).fill(0) },
            uN31: { value: new Array(9).fill(0) },
            uA1: { value: new Array(9).fill(0) },
            uB1: { value: new Array(9).fill(0) },

            uM2: { value: new Array(9).fill(0) },
            uN12: { value: new Array(9).fill(0) },
            uN22: { value: new Array(9).fill(0) },
            uN32: { value: new Array(9).fill(0) },
            uA2: { value: new Array(9).fill(0) },
            uB2: { value: new Array(9).fill(0) },

            uTopology: { value: new Array(9).fill(0) },
            uInstanceScale: { value: new Array(9).fill(1) },
            uInstanceAlpha: { value: new Array(9).fill(1) },
        };

        const sfMaterial = new THREE.ShaderMaterial({
            uniforms: sfUniforms,
            vertexShader: superformulaInstancedVertexShader,
            fragmentShader: superformulaInstancedFragmentShader,
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        // Optimized Geometry: 160x160 segments
        const sfGeometry = new THREE.SphereGeometry(1, 128, 128);
        const sfMesh = new THREE.InstancedMesh(sfGeometry, sfMaterial, INSTANCE_COUNT);
        sfMesh.castShadow = false; // Transparents don't cast good shadows usually
        sfMesh.receiveShadow = false;
        sfMesh.visible = false;
        sfMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(sfMesh);

        // PBR Lighting System (Keep generic lights)
        const sfAmbientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(sfAmbientLight);
        const sfDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sfDirectionalLight.position.set(5, 10, 7.5);
        scene.add(sfDirectionalLight);


        const clock = new THREE.Clock();

        // Echo State Management (Local to effect)
        interface EchoState {
            params: any; // visual params snapshot
            birthTime: number;
            scale: number;
            alpha: number;
            active: boolean;
        }
        const echoes: EchoState[] = Array.from({ length: 8 }, () => ({
            params: {},
            birthTime: 0,
            scale: 0.0,
            alpha: 0.0,
            active: false
        }));
        let lastBeatTime = 0;
        const dummy = new THREE.Object3D();

        const animate = () => {
            const now = performance.now() / 1000;
            const time = clock.getElapsedTime();
            let bass = 0.0;
            let drumTrigger = false;

            if (analyserRef.current && dataArrayRef.current && timeDataArrayRef.current && combinedDataRef.current && audioTextureRef.current) {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                analyserRef.current.getByteTimeDomainData(timeDataArrayRef.current);
                combinedDataRef.current.set(timeDataArrayRef.current, 0);
                combinedDataRef.current.set(dataArrayRef.current, analyserRef.current.frequencyBinCount);
                audioTextureRef.current.needsUpdate = true;
                if (uniforms.uAudioTexture.value !== audioTextureRef.current) uniforms.uAudioTexture.value = audioTextureRef.current;

                bass = 0.0;
                // Calculate bass and beat
                const lower = Math.floor(analyserRef.current.frequencyBinCount * 0.1);
                let bSum = 0;
                for (let i = 0; i < lower; i++) bSum += dataArrayRef.current[i];
                bass = bSum / lower / 255.0;

                if (bass > 0.8 && !drumTrigger) {
                    drumTrigger = true;
                    // Trigger particles
                    if (particlesRef.current) {
                        const positions = pointCloud.geometry.attributes.position.array as Float32Array;
                        // Optimization: only randomize a subset or use shader-based reset
                    }
                }

                let lowSum = 0, midSum = 0, highSum = 0;
                const d = dataArrayRef.current;
                for (let i = 0; i < 4; i++) lowSum += d[i];
                for (let i = 4; i < 40; i++) midSum += d[i];
                for (let i = 40; i < 200; i++) highSum += d[i];

                const targetLow = (lowSum / 4) / 255;
                const targetMid = (midSum / 36) / 255;
                const targetHigh = (highSum / 160) / 255;
                const targetIntegrated = (targetLow + targetMid + targetHigh) / 3;

                const beatThreshold = audioValuesRef.current.low * 1.4 + 0.1;
                if (targetLow > beatThreshold) audioValuesRef.current.beat = 1.0;
                else audioValuesRef.current.beat *= 0.9;

                const sm = 0.6;
                audioValuesRef.current.low += (targetLow - audioValuesRef.current.low) * (1 - sm);
                audioValuesRef.current.mid += (targetMid - audioValuesRef.current.mid) * (1 - sm);
                audioValuesRef.current.high += (targetHigh - audioValuesRef.current.high) * (1 - sm);
                audioValuesRef.current.integrated += (targetIntegrated - audioValuesRef.current.integrated) * (1 - sm);

                uniforms.uLow.value = audioValuesRef.current.low * gainLowRef.current;
                uniforms.uMid.value = audioValuesRef.current.mid * gainMidRef.current;
                uniforms.uHigh.value = audioValuesRef.current.high * gainHighRef.current;
                uniforms.uIntegrated.value = audioValuesRef.current.integrated;
                uniforms.uBeat.value = audioValuesRef.current.beat * gainLowRef.current;

                bass = targetLow;
                const transientThresh = transientAvgRef.current * 1.5;
                let isTransient = false;

                if (bass > transientThresh && bass > 0.1) {
                    isTransient = true;
                    transientAvgRef.current = bass;
                } else {
                    transientAvgRef.current = transientAvgRef.current * 0.95 + bass * 0.05;
                }

                let manualTrigger = false;
                if (beatIntervalRef.current && tapTimesRef.current.length > 0) {
                    const lastTap = tapTimesRef.current[tapTimesRef.current.length - 1];
                    const elapsed = now - lastTap;
                    const currentBeatIndex = Math.floor(elapsed / beatIntervalRef.current);
                    if (currentBeatIndex > lastBeatIndexRef.current) {
                        manualTrigger = true;
                        lastBeatIndexRef.current = currentBeatIndex;
                    }
                }

                let impulseStrength = 0.0;
                if (beatIntervalRef.current) {
                    if (manualTrigger && bass > 0.05) {
                        impulseStrength = (bass + 0.5) * 2.5 * swingAmountRef.current;
                    }
                } else {
                    if (isTransient) {
                        impulseStrength = (bass - transientThresh) * 2.0 * swingAmountRef.current;
                    }
                }

                if (impulseStrength > 0.0) {
                    swingVelRef.current += impulseStrength;
                }

                swingVelRef.current += -swingRef.current * 0.15;
                swingVelRef.current *= 0.9;
                swingRef.current += swingVelRef.current;
                uniforms.uSwing.value = swingRef.current;

                drumTrigger = false;
                if (beatIntervalRef.current) {
                    if (manualTrigger && bass > 0.05) drumTrigger = true;
                } else {
                    if (isTransient) drumTrigger = true;
                }
            } else {
                // Analyser not ready - reset audio values to zero for visuals
                uniforms.uLow.value = 0;
                uniforms.uMid.value = 0;
                uniforms.uHigh.value = 0;
                uniforms.uIntegrated.value = 0;
                uniforms.uBeat.value = 0;
                uniforms.uSwing.value = 0;
                uniforms.uDrums.value = 0;
            }

            // --- THE FOLLOWING LOGIC RUNS INDEPENDENTLY OF AUDIO ANALYSER ---

            // [NEW] OneShot Fade Logic
            if (oneShotTriggerRef.current === 'releasing') {
                // Find active clip Release Time
                const activeClip = videoClipsRef.current.find(c => c.id === activeClipIdRef.current);
                const releaseTime = activeClip?.releaseTime || 0.5;
                const fadeStep = (1.0 / (60.0 * releaseTime)); // Approx 60fps

                internalFadeRef.current = Math.min(internalFadeRef.current + fadeStep, 1.0);

                if (internalFadeRef.current >= 1.0) {
                    oneShotTriggerRef.current = 'stopped';
                    if (videoElementRef.current) {
                        videoElementRef.current.pause();
                        videoElementRef.current.currentTime = 0;
                    }
                    setIsVideoPlaying(false);
                }
            } else if (oneShotTriggerRef.current === 'playing') {
                internalFadeRef.current = Math.max(internalFadeRef.current - 0.1, 0.0); // Fast fade in
            }

            // [NEW] Dynamic Video Texture Switching (Simplified SkyDeck)
            if (videoTextureRef.current) {
                if (uniforms.uVideoTexture.value !== videoTextureRef.current) {
                    uniforms.uVideoTexture.value = videoTextureRef.current;
                }
                if (isVideoPlayingRef.current) videoTextureRef.current.needsUpdate = true;
            } else {
                uniforms.uVideoTexture.value = placeholderTex;
            }

            // [NEW] Master Video Switch
            uniforms.uHasVideo.value = (videoTextureRef.current && isVideoPlayingRef.current) ? 1.0 : 0.0;

            // [NEW] Consolidated Fade Logic
            if (oneShotTriggerRef.current === 'stopped' && !isVideoPlayingRef.current) {
                uniforms.uVideoFade.value = 1.0; // Black/Hidden
            } else {
                uniforms.uVideoFade.value = Math.max(videoFadeRef.current, internalFadeRef.current);
            }

            // Core Visual Logic (Always Run)
            if (drumTrigger) {
                audioValuesRef.current.drum = 1.0 * (bass * 2.0 + 0.5);
                if (audioValuesRef.current.drum > 1.5) audioValuesRef.current.drum = 1.5;
            } else {
                audioValuesRef.current.drum *= 0.8;
            }
            uniforms.uDrums.value = audioValuesRef.current.drum * gainLowRef.current;

            particleUniforms.uBeat.value = uniforms.uBeat.value;
            particleUniforms.uLow.value = uniforms.uLow.value;
            particleUniforms.uHigh.value = uniforms.uHigh.value;

            if (transitionStateRef.current === 'in') {
                transitionRef.current += 0.05;
                if (transitionRef.current >= 1.2) {
                    transitionRef.current = 1.0;
                    randomizeState();
                    transitionStateRef.current = 'out';
                }
            } else if (transitionStateRef.current === 'out') {
                transitionRef.current -= 0.03;
                if (transitionRef.current <= 0.0) {
                    transitionRef.current = 0.0;
                    transitionStateRef.current = 'idle';
                }
            }
            uniforms.uTransition.value = Math.max(0.0, Math.min(1.0, transitionRef.current));

            if (stretchStateRef.current === 'expanding') stretchRef.current += 0.002;
            else if (stretchStateRef.current === 'returning') {
                stretchRef.current += (1.0 - stretchRef.current) * 0.05;
                if (Math.abs(stretchRef.current - 1.0) < 0.001) { stretchRef.current = 1.0; stretchStateRef.current = 'idle'; }
            }
            uniforms.uStretch.value = stretchRef.current;
            uniforms.uStretch.value = stretchRef.current;
            uniforms.uTime.value = time;
            uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
            uniforms.uBloomIntensity.value = bloomIntensityRef.current;
            uniforms.uSceneMode.value = sceneModeRef.current;
            uniforms.uWarpMode.value = warpModeRef.current;
            uniforms.uOscilloscope.value = oscilloscopeRef.current ? 1.0 : 0.0;
            uniforms.uMirrorOsc.value = mirrorOscRef.current ? 1.0 : 0.0;
            uniforms.uOscDodge.value = oscDodgeRef.current ? 1.0 : 0.0;
            uniforms.u3DOscilloscope.value = threeDOscRef.current ? 1.0 : 0.0;
            uniforms.uHueShift.value = hueRef.current;
            uniforms.uTextureHue.value = textureHueRef.current;
            uniforms.uVibrance.value = satRef.current;
            uniforms.uPaletteMode.value = paletteModeRef.current;
            uniforms.uBrightness.value = brightRef.current;

            uniforms.uContrast.value = contrastRef.current;
            uniforms.uGrain.value = grainRef.current;
            uniforms.uVHS.value = vhsRef.current ? 1.0 : 0.0;
            uniforms.uBlur.value = blurRef.current ? 1.0 : 0.0;
            uniforms.uOptics.value = opticsRef.current ? 1.0 : 0.0;
            // Decay transient visual pad triggers
            if (fxFlashRef.current > 0.0) {
                fxFlashRef.current *= 0.92;
                if (fxFlashRef.current < 0.001) fxFlashRef.current = 0.0;
            }
            if (fxShakeRef.current > 0.0) {
                fxShakeRef.current *= 0.94;
                if (fxShakeRef.current < 0.001) fxShakeRef.current = 0.0;
            }
            if (fxSolarizeRef.current > 0.0) {
                fxSolarizeRef.current *= 0.94;
                if (fxSolarizeRef.current < 0.001) fxSolarizeRef.current = 0.0;
            }

            uniforms.uFxShake.value = fxShakeRef.current;
            uniforms.uFxFlash.value = fxFlashRef.current;
            uniforms.uFxSolarize.value = fxSolarizeRef.current;
            uniforms.uBloomReact.value = bloomReactRef.current;

            uniforms.uVideoScale.value = videoScaleRef.current;
            uniforms.uVideoWarp.value = videoWarpRef.current;
            uniforms.uVideoDodge.value = videoDodgeRef.current;
            uniforms.uVideoMirror.value = videoMirrorRef.current;
            uniforms.uVideoGlitch.value = videoGlitchRef.current;
            uniforms.uVideoFade.value = videoFadeRef.current;
            uniforms.uVideoPaletteMix.value = videoPaletteMixRef.current;
            uniforms.uVideoDiffusion.value = videoDiffusionRef.current;
            uniforms.uVideoBlendMode.value = videoBlendModeRef.current; // [NEW]

            uniforms.uGeoScale.value = geoScaleRef.current;
            uniforms.uGeoDeform.value = geoDeformRef.current;
            uniforms.uGeoThickness.value = geoThicknessRef.current;
            uniforms.uGeoDetail.value = geoDetailRef.current;

            if (zoomDirectionRef.current !== 0) {
                let next = zoomRef.current + zoomDirectionRef.current * 0.01;
                zoomRef.current = Math.max(0.1, Math.min(5.0, next));
            }
            uniforms.uZoom.value = zoomRef.current;

            // CAMERA UPDATE LOOP (Physics-based)
            if (isHomingRef.current) {
                camXRef.current += (0 - camXRef.current) * 0.05;
                camYRef.current += (0 - camYRef.current) * 0.05;
                camVelXRef.current *= 0.8;
                camVelYRef.current *= 0.8;
                if (Math.abs(camXRef.current) < 0.001 && Math.abs(camYRef.current) < 0.001) {
                    camXRef.current = 0;
                    camYRef.current = 0;
                    isHomingRef.current = false;
                }
            } else {
                const targetVelX = moveXRef.current * camSpeedRef.current;
                const targetVelY = moveYRef.current * camSpeedRef.current;
                camVelXRef.current += (targetVelX - camVelXRef.current) * 0.03;
                camVelYRef.current += (targetVelY - camVelYRef.current) * 0.03;
                camXRef.current += camVelXRef.current;
                camYRef.current += camVelYRef.current;
            }

            uniforms.uCamX.value = camXRef.current;
            uniforms.uCamY.value = camYRef.current;

            if (hueCyclingRef.current) hueRef.current += 0.005;
            const spinDiff = spinTargetRef.current - spinCurrentRef.current;
            spinCurrentRef.current += spinDiff * 0.02;
            uniforms.uSpin.value = spinCurrentRef.current;

            let targetMix = 0.0;
            const lvl = colorDodgeLevelRef.current;
            if (colorDodgeRef.current) {
                if (lvl === 1) targetMix = 0.5; else if (lvl === 2) targetMix = 0.9; else if (lvl === 3) targetMix = 1.5; else targetMix = 0.9;
            }
            colorDodgeMixRef.current += (targetMix - colorDodgeMixRef.current) * 0.05;
            uniforms.uColorDodgeMix.value = colorDodgeMixRef.current;

            if (userTextureRef.current) {
                uniforms.uUserTexture.value = userTextureRef.current;
                uniforms.uHasTexture.value = 1.0;
            } else {
                uniforms.uUserTexture.value = placeholderTex;
                uniforms.uHasTexture.value = 0.0;
            }



            // SUPERFORMULA UPDATE (Mode 13 only)
            if (Math.round(sceneModeRef.current) === 13) {
                sfMesh.visible = true;

                // Helper to fill arrays (from Neuromesh)
                const fillArrays = (index: number, p: any, alpha: number, scale: number) => {
                    // M1-B1 (Shape 1)
                    // We map 'uGeoScale' to 'm', 'uGeoDeform' to 'n1' etc. for interactivity
                    // BUT since we don't have full UI for 12 params, we use the refs with multipliers
                    // Or we hardcode a cool preset for now + audio reactivity

                    // Lacking full params, we construct a "preset" based on defaults + refs
                    // shape1: m=0, n1=1, n2=1, n3=1, a=1, b=1

                    // We'll use the refs as modifiers
                    // geoScale -> scale
                    // geoDeform -> some shape param
                    // geoDetail -> m?

                    const m1 = 6 + Math.sin(time * 0.1) * 2 + (geoDetailRef.current * 10);
                    const n11 = 1 + (geoDeformRef.current * 2);

                    sfUniforms.uM1.value[index] = p.m1 !== undefined ? p.m1 : m1;
                    sfUniforms.uN11.value[index] = p.n11 !== undefined ? p.n11 : n11;
                    sfUniforms.uN21.value[index] = 1;
                    sfUniforms.uN31.value[index] = 1;
                    sfUniforms.uA1.value[index] = 1;
                    sfUniforms.uB1.value[index] = 1;

                    sfUniforms.uM2.value[index] = 4;
                    sfUniforms.uN12.value[index] = 1;
                    sfUniforms.uN22.value[index] = 1;
                    sfUniforms.uN32.value[index] = 1;
                    sfUniforms.uA2.value[index] = 1;
                    sfUniforms.uB2.value[index] = 1;

                    // Topology mapped to uWarpMode for now or just 0 (Sphere)
                    // Let's use uWarpMode to switch topology!
                    sfUniforms.uTopology.value[index] = warpModeRef.current; // 0=Sphere, 1=Torus code in shader etc

                    sfUniforms.uInstanceScale.value[index] = scale;
                    sfUniforms.uInstanceAlpha.value[index] = alpha;
                };

                // SPAWN ECHOES (Beat Detection)
                // Determine beat
                const isAudioBeat = audioValuesRef.current.beat > 0.8;
                const timeSinceLastBeat = time - lastBeatTime;

                // Debounce 0.3s
                if (isAudioBeat && timeSinceLastBeat > 0.3) {
                    // Shift existing active echoes down to make room at slot 0
                    for (let idx = 7; idx > 0; idx--) {
                        echoes[idx].birthTime = echoes[idx - 1].birthTime;
                        echoes[idx].scale = echoes[idx - 1].scale;
                        echoes[idx].alpha = echoes[idx - 1].alpha;
                        echoes[idx].active = echoes[idx - 1].active;
                    }
                    // Reset slot 0 parameters
                    echoes[0].birthTime = time;
                    echoes[0].scale = 1.0;
                    echoes[0].alpha = 1.0;
                    echoes[0].active = true;
                    lastBeatTime = time;
                }

                // Update Uniforms
                sfUniforms.uTime.value = time;
                sfUniforms.uLow.value = audioValuesRef.current.low;
                sfUniforms.uMid.value = audioValuesRef.current.mid;
                sfUniforms.uHigh.value = audioValuesRef.current.high;
                sfUniforms.uReactivity.value = 0.5 + (geoScaleRef.current * 0.5);
                sfUniforms.uColorShift.value = hueRef.current;

                // 1. LIVE INSTANCE (0)
                fillArrays(0, {}, 1.0, geoScaleRef.current * 1.5 + (audioValuesRef.current.low * 0.2));

                dummy.scale.setScalar(1.0);
                dummy.rotation.x = time * 0.1;
                dummy.rotation.y = time * 0.15;
                dummy.updateMatrix();
                sfMesh.setMatrixAt(0, dummy.matrix);

                // 2. ECHOES (1-8)
                for (let i = 0; i < 8; i++) {
                    const idx = i + 1;
                    const echo = echoes[i];
                    if (echo && echo.active && echo.alpha > 0.01) {
                        // Expand
                        echo.scale *= 1.01; // Slow expansion
                        // Fade
                        echo.alpha *= 0.96; // Fade out

                        fillArrays(idx, {}, echo.alpha, echo.scale * geoScaleRef.current * 1.5);

                        // Echoes share rotation for now or could differ
                        dummy.scale.setScalar(1.0);
                        dummy.updateMatrix();
                        sfMesh.setMatrixAt(idx, dummy.matrix);
                    } else {
                        if (echo) echo.active = false;
                        // Hide
                        sfUniforms.uInstanceAlpha.value[idx] = 0.0;
                        dummy.scale.setScalar(0.001);
                        dummy.updateMatrix();
                        sfMesh.setMatrixAt(idx, dummy.matrix);
                    }
                }

                sfMesh.instanceMatrix.needsUpdate = true;

            } else {
                sfMesh.visible = false;
            }

            renderer.clear();
            renderer.render(scene, camera);

            if (particlesRef.current) {
                renderer.clearDepth();
                particleUniforms.uTime.value = time;
                renderer.render(particleScene, particleCamera);
            }

            // Update Symbiosis HUD Telemetry
            const couplingEl = document.getElementById('hud-coupling');
            if (couplingEl) {
                const wave = Math.sin(time * 2.5) * 0.7;
                const audioPeak = audioValuesRef.current ? audioValuesRef.current.low * 1.5 : 0;
                const couplingVal = Math.min(100.0, 98.4 + wave + audioPeak).toFixed(1);
                couplingEl.innerText = `${couplingVal}% (${couplingVal > '99.0' ? 'RESONANT' : 'OPTIMAL'})`;
            }
            const richieEl = document.getElementById('hud-richie');
            if (richieEl) {
                const elapsedMin = Math.floor((Date.now() - startTimeRef.current) / 60000);
                if (elapsedMin >= 90) {
                    richieEl.style.color = '#ff0055';
                    richieEl.innerText = "⚠️ RICHIE BREAK RECOMMENDED! (TIME > 90M)";
                } else {
                    richieEl.style.color = '#ffe600';
                    richieEl.innerText = `🐱 RICHIE BREAK TIMER: ${90 - elapsedMin}m`;
                }
            }
            const bpmEl = document.getElementById('hud-bpm');
            if (bpmEl) {
                bpmEl.innerText = `BPM: ${(bpm || 120.0).toFixed(1)}`;
            }
            const modeEl = document.getElementById('hud-mode');
            if (modeEl) {
                const activeScene = sceneNames[Math.round(sceneModeRef.current)] || "CUSTOM";
                modeEl.innerText = activeScene;
            }

            // Use the rAF from the active window
            const rAF = (projectorMode && projectorWindowRef.current) ? projectorWindowRef.current.requestAnimationFrame : window.requestAnimationFrame;
            animationId = rAF(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            renderer.dispose();
            // FORCE NULL to ensure new context on re-mount
            rendererRef.current = null;
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
            // Hide background and HUD
            const bg = document.getElementById('deltavision-background');
            if (bg) bg.style.display = 'none';
            const hud = document.getElementById('deltavision-hud');
            if (hud) hud.style.display = 'none';
        };
    }, [mode, projectorMode]);


    const sceneNames = ["ESCHER", "HYPERSPACE", "SKYLINE", "SATURN", "MIRROR FDBK", "PSYCHEDELIC", "GYROSCOPE", "MANDALA", "MIRROR DIM", "NEURAL", "LENS", "QUANTUM", "OSCILLOCITY", "SUPERFORMULA", "DANCING SHADOWS"];
    const warpNames = ["NONE", "LIQUID", "BEND", "KALEID", "PORTAL"];
    const paletteNames = ["CYBER", "INFERNO", "TOXIC", "CANDY", "GOLDEN"];
    const resolutions = [{ label: 'HD (1280x720)', w: 1280, h: 720 }, { label: 'FHD (1920x1080)', w: 1920, h: 1080 }, { label: 'QHD (2560x1440)', w: 2560, h: 1440 }, { label: '4K (3840x2160)', w: 3840, h: 2160 }];

    // Extract keys of mapped params for UI highlighting
    const mappedParams = Object.values(midiMappings).map((m: MidiMapping) => m.param);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden">
            {/* Resized Render Container */}
            <div ref={containerRef} className="absolute inset-0 bg-black">
                {projectorMode && <div className="absolute inset-0 flex items-center justify-center text-white/30 font-mono text-sm uppercase tracking-widest">Projector Active</div>}
            </div>

            {/* Hidden Inputs */}
            <input type="file" ref={userTextureInputRef} onChange={handleUserImageUpload} className="hidden" accept="image/*" />
            <input type="file" ref={userVideoInputRef} onChange={handleUserVideoUpload} className="hidden" accept="video/*" />
            <input type="file" ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*" multiple className="hidden" />

            {/* Extracted UI Component */}
            <VisualizerUI
                uiState={uiState}
                updateState={updateState}
                updateRef={updateEngineRef}

                // Sync Props [NEW]
                videoBlendMode={videoBlendMode} setVideoBlendMode={setVideoBlendMode}
                videoTargetBars={videoTargetBars} setVideoTargetBars={setVideoTargetBars}
                isVideoSynced={isVideoSynced} setIsVideoSynced={setIsVideoSynced}

                // Video Deck Props [NEW]
                videoClips={videoClips}
                activeClipId={activeClipId}
                onClipSelect={handleSelectClip}
                onClipsAdd={handleAddVideoClips}
                onClipRemove={handleRemoveClip}
                onClipBind={handleClipBind}
                onClipUpdate={handleUpdateClip}
                onVideoPlay={handleVideoPlay}
                onVideoPause={handleVideoPause}
                onVideoRewind={handleVideoRewind}
                isVideoPlaying={isVideoPlaying}

                // Video
                videoScale={videoScale} setVideoScale={setVideoScale}
                videoSpeed={videoSpeed} setVideoSpeed={setVideoSpeed}
                videoLoop={videoLoop} setVideoLoop={setVideoLoop}
                onLoadVideo={() => userVideoInputRef.current?.click()}

                // FX
                videoWarp={videoWarp} setVideoWarp={setVideoWarp}
                videoDodge={videoDodge} setVideoDodge={setVideoDodge}
                videoMirror={videoMirror} setVideoMirror={setVideoMirror}
                videoGlitch={videoGlitch} setVideoGlitch={setVideoGlitch}

                // Player
                mode={mode} isPlaying={isPlaying} togglePlay={togglePlay}
                currentTime={currentTime} duration={duration} onSeek={handleSeek} onSkip={skipTime}
                volume={volume} onVolume={handleVolume}
                onLoadAudio={() => audioInputRef.current?.click()}
                onLoadTexture={() => userTextureInputRef.current?.click()}

                // Playlist Props
                playlist={playlist}
                currentTrackIndex={currentTrackIndex}
                onPlayTrack={handlePlayTrack}
                onNextTrack={handleNextTrack}
                onPrevTrack={handlePrevTrack}
                onAddTracks={handleAddTracks}
                isShuffle={isShuffle}
                toggleShuffle={() => setIsShuffle(!isShuffle)}

                // Rec
                isRecording={isRecording} recordingTime={recordingTime} toggleRecording={toggleRecording} formatTime={formatTime}

                // Proj
                projectorMode={projectorMode} toggleProjector={toggleProjector}
                targetResolution={targetResolution} handleResolutionChange={handleResolutionChange} resolutions={resolutions}

                // Meta
                sceneName={sceneNames[Math.round(uiState.sceneMode)] || "CUSTOM"}
                warpName={warpNames[Math.round(uiState.warpMode)] || "UNKNOWN"}
                paletteName={paletteNames[Math.round(uiState.paletteMode)] || "CYBER"}
                sceneList={sceneNames}
                warpList={warpNames}
                paletteList={paletteNames}
                bpm={bpm}
                setHoverInfo={setHoverInfo}
                hoverInfo={hoverInfo}

                // MIDI Props
                midiLearnMode={midiLearnMode}
                toggleMidiLearn={toggleMidiLearn}
                onMidiLearnTarget={handleMidiLearnTarget}
                midiTarget={midiLearnTarget?.param || null}
                mappedParams={mappedParams}
                midiMappings={midiMappings}
                clearMidiMappings={clearMidiMappings}

                // Actions
                triggerAction={triggerAction}
            />
        </div>
    );
};

export default OculusEngine;
