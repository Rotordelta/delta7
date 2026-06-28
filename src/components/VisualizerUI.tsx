
import React, { memo, useState, useRef } from 'react';

// --- TYPES ---
interface UIState {
    sceneMode: number;
    warpMode: number;
    spin: boolean;
    zoom: number;
    oscilloscope: boolean;
    mirrorOsc: boolean;
    threeDOsc: boolean;
    oscDodge: boolean;
    hueCycling: boolean;
    colorDodgeLevel: number;
    paletteMode: number;
    stretch: number;
    camSpeed: number;
    hue: number;
    saturation: number;
    brightness: number;
    contrast: number;
    grain: number;
    vhs: boolean;
    blur: boolean;
    optics: boolean;
    particles: boolean;
    gainLow: number;
    gainMid: number;
    gainHigh: number;
    fxShake: number;
    fxFlash: number;
    fxSolarize: number;
    bloomReact: number;
    swingAmount: number;
    geoScale: number;
    geoDeform: number;
    geoThickness: number;
    geoDetail: number;
    // Video Skybox Extras
    videoFade: number;
    videoPaletteMix: number;
    videoDiffusion: number;
}

interface VideoClip {
    id: string;
    file: File;
    url: string;
    name: string;
    playbackMode?: 'normal' | 'reverse' | 'oneshot';
    releaseTime?: number;
}

interface VisualizerUIProps {
    uiState: UIState;
    updateState: (updates: Partial<UIState>) => void;
    updateRef: (key: string, val: number) => void;

    // Video Props
    videoScale: number;
    setVideoScale: (v: number) => void;
    videoSpeed: number;
    setVideoSpeed: (v: number) => void;
    videoLoop: boolean;
    setVideoLoop: (v: boolean) => void;
    onLoadVideo: () => void;

    // Video FX
    videoWarp: number;
    setVideoWarp: (v: number) => void;
    videoDodge: number;
    setVideoDodge: (v: number) => void;
    videoMirror: number;
    setVideoMirror: (v: number) => void;
    videoGlitch: number;
    setVideoGlitch: (v: number) => void;

    // [NEW] Video Deck Props (Compact Compatibility)
    videoClips?: VideoClip[];
    activeClipId?: string | null;
    onClipSelect?: (id: string) => void;
    onClipsAdd?: (files: File[]) => void;
    onClipRemove?: (id: string) => void;
    onClipBind?: (id: string) => void;
    onClipUpdate?: (id: string, updates: Partial<VideoClip>) => void;

    // [NEW] Sync & Blend Props
    videoBlendMode?: number;
    setVideoBlendMode?: (v: number) => void;
    videoTargetBars?: number;
    setVideoTargetBars?: (v: number) => void;
    isVideoSynced?: boolean;
    setIsVideoSynced?: (v: boolean) => void;
    onVideoPlay?: () => void;
    onVideoPause?: () => void;
    onVideoRewind?: () => void;
    isVideoPlaying?: boolean;

    // Player Props
    mode: 'mic' | 'file';
    isPlaying: boolean;
    togglePlay: () => void;
    currentTime: number;
    duration: number;
    onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSkip: (sec: number) => void;
    volume: number;
    onVolume: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onLoadAudio: () => void;
    onLoadTexture: () => void;

    // Playlist Props
    playlist: File[];
    currentTrackIndex: number;
    onPlayTrack: (index: number) => void;
    onNextTrack: () => void;
    onPrevTrack: () => void;
    onAddTracks: (files: FileList) => void;
    isShuffle: boolean;
    toggleShuffle: () => void;

    // Recording
    isRecording: boolean;
    recordingTime: number;
    toggleRecording: () => void;
    formatTime: (t: number) => string;

    // Projector
    projectorMode: boolean;
    toggleProjector: () => void;
    targetResolution: { w: number, h: number, label: string };
    handleResolutionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    resolutions: { label: string, w: number, h: number }[];

    // Meta & Lists
    sceneName: string;
    warpName: string;
    paletteName: string;
    sceneList: string[];
    warpList: string[];
    paletteList: string[];
    bpm: number | null;
    setHoverInfo: (s: string | null) => void;
    hoverInfo: string | null;

    // MIDI
    midiLearnMode: boolean;
    toggleMidiLearn: () => void;
    onMidiLearnTarget: (param: string, min: number, max: number, type: 'continuous' | 'toggle' | 'action') => void;
    midiTarget: string | null;
    mappedParams: string[];
    midiMappings: Record<string, any>; // Full mapping object to display codes
    clearMidiMappings: () => void;

    // Actions
    triggerAction: (action: string) => void;
}

// --- SUB-COMPONENTS ---

const MappingItem = memo(({ label, paramKey, mappedCode, isLearning, onClick, shortcut, type, value, min, max }: any) => {
    // Calculate percentage for slider visualization
    let percent = 0;
    if (type === 'continuous' && typeof value === 'number') {
        percent = Math.max(0, Math.min(1, (value - min) / (max - min))) * 100;
    }

    return (
        <div
            onClick={onClick}
            className={`relative flex items-center justify-between p-2 rounded border cursor-pointer transition-all group overflow-hidden
            ${isLearning ? 'bg-orange-500/20 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
        >
            {/* Slider Fill Background */}
            {type === 'continuous' && (
                <div
                    className="absolute top-0 left-0 h-full bg-blue-500/10 pointer-events-none transition-all duration-75"
                    style={{ width: `${percent}%` }}
                />
            )}

            <div className="flex flex-col relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider">{label}</span>
                    {type === 'continuous' && (
                        <span className="text-[9px] font-mono text-gray-500">
                            {typeof value === 'number' ? value.toFixed(2) : ''}
                        </span>
                    )}
                </div>
                {shortcut && <span className="text-[9px] text-gray-500 font-mono">KEY: {shortcut}</span>}
            </div>

            <div className="flex items-center gap-2 relative z-10">
                {mappedCode ? (
                    <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                        {mappedCode}
                    </span>
                ) : (
                    <span className="text-[9px] font-mono text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">BIND</span>
                )}
            </div>
        </div>
    );
});

const MappingSection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 border-b border-white/10 pb-1">{title}</h3>
        <div className="grid grid-cols-2 gap-2">
            {children}
        </div>
    </div>
);

const GradingSlider = memo(({
    label, value, min, max, step, def, paramKey,
    onChange, onMouseEnter, onMouseLeave, desc,
    midiLearnMode, onMidiLearnTarget, isTarget, isMapped
}: any) => {
    const isActive = Math.abs(value - def) > 0.01;

    const handleContainerClick = (e: React.MouseEvent) => {
        if (midiLearnMode) {
            e.preventDefault();
            e.stopPropagation();
            onMidiLearnTarget(paramKey, min, max, 'continuous');
        }
    };

    return (
        <div
            className={`mb-2 group/slider relative p-1 rounded transition-all ${isTarget ? 'bg-orange-500/30 border border-orange-500 animate-pulse' : ''} ${midiLearnMode ? 'cursor-crosshair hover:bg-white/5' : ''}`}
            onMouseEnter={() => onMouseEnter(desc)}
            onMouseLeave={() => onMouseLeave(null)}
            onClick={handleContainerClick}
        >
            <div className="flex justify-between text-[10px] font-mono mb-1 transition-colors">
                <span className={`flex items-center gap-1 ${isActive ? "text-blue-400 font-bold drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]" : "text-gray-500 group-hover/slider:text-gray-300"}`}>
                    {label}
                    {isMapped && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,1)]" title="MIDI Mapped"></div>}
                </span>
                <span className={isActive ? "text-blue-300" : "text-gray-600"}>
                    {value.toFixed(2)}
                </span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={(e) => !midiLearnMode && onChange(parseFloat(e.target.value))}
                disabled={midiLearnMode}
                className={`w-full h-1 rounded-lg appearance-none transition-all ${midiLearnMode ? 'cursor-crosshair' : 'cursor-pointer'} ${isActive ? 'bg-blue-900/50' : 'bg-white/10'} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all ${isActive ? '[&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(96,165,250,0.8)]' : '[&::-webkit-slider-thumb]:bg-gray-400 group-hover/slider:[&::-webkit-slider-thumb]:bg-white'}`}
            />
        </div>
    );
});

const MidiButton = memo(({
    label, active, onClick, paramKey,
    midiLearnMode, onMidiLearnTarget, isTarget, isMapped, desc, onMouseEnter, onMouseLeave, type = 'toggle'
}: any) => {

    const handleContainerClick = (e: React.MouseEvent) => {
        if (midiLearnMode) {
            e.preventDefault();
            e.stopPropagation();
            onMidiLearnTarget(paramKey, 0, 1, type);
        } else {
            onClick();
        }
    };

    return (
        <button
            className={`relative w-full py-1 text-[9px] font-mono rounded border flex items-center justify-center gap-2 transition-all 
            ${isTarget ? 'bg-orange-500/30 border-orange-500 animate-pulse' : ''}
            ${active ? 'bg-blue-500/20 border-blue-400 text-blue-200' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}
            ${midiLearnMode ? 'cursor-crosshair' : 'cursor-pointer'}`}
            onClick={handleContainerClick}
            onMouseEnter={() => onMouseEnter && onMouseEnter(desc)}
            onMouseLeave={() => onMouseLeave && onMouseLeave(null)}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,1)]' : 'bg-gray-600'}`}></div>
            {label}
            {isMapped && <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,1)] transform translate-x-1/2 -translate-y-1/2"></div>}
        </button>
    );
});

const VisualizerUI: React.FC<VisualizerUIProps> = (props) => {
    const {
        uiState, updateState, updateRef,
        videoScale, setVideoScale, videoSpeed, setVideoSpeed, videoLoop, setVideoLoop, onLoadVideo,
        videoWarp, setVideoWarp, videoDodge, setVideoDodge, videoMirror, setVideoMirror, videoGlitch, setVideoGlitch,
        mode, isPlaying, togglePlay, currentTime, duration, onSeek, onSkip, volume, onVolume, onLoadAudio, onLoadTexture,
        playlist, currentTrackIndex, onPlayTrack, onNextTrack, onPrevTrack, onAddTracks, isShuffle, toggleShuffle,
        isRecording, recordingTime, toggleRecording, formatTime,
        projectorMode, toggleProjector, targetResolution, handleResolutionChange, resolutions,
        sceneName, warpName, paletteName, sceneList, warpList, paletteList, bpm, setHoverInfo, hoverInfo,
        midiLearnMode, toggleMidiLearn, onMidiLearnTarget, midiTarget, mappedParams, midiMappings, clearMidiMappings, triggerAction,
        // [NEW] Compatibility Props (Destructured but unused in Phase 2 UI)
        videoClips, activeClipId, onClipSelect, onClipsAdd, onClipRemove, onClipBind, onClipUpdate,
        videoBlendMode, setVideoBlendMode, videoTargetBars, setVideoTargetBars, isVideoSynced, setIsVideoSynced,
        onVideoPlay, onVideoPause, onVideoRewind, isVideoPlaying
    } = props;

    const [showMap, setShowMap] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const addTracksInputRef = useRef<HTMLInputElement>(null);
    const addClipsInputRef = useRef<HTMLInputElement>(null);

    // Handler for adding clips
    const handleAddClips = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && onClipsAdd) {
            // Convert FileList to array
            const files: File[] = Array.from(e.target.files);
            onClipsAdd(files);
        }
    };

    // Wrappers to update both State (for UI) and Ref (for Engine)
    const updateGrading = (key: keyof UIState, val: number) => {
        updateState({ [key]: val });
        updateRef(key, val);
    };

    const updateAudioReactor = (key: keyof UIState, val: number) => {
        updateState({ [key]: val });
        updateRef(key, val);
    };

    const toggleParam = (key: keyof UIState) => {
        const next = !uiState[key];
        updateState({ [key]: next });
        updateRef(key, next ? 1 : 0);
    };

    // Helper for Sliders
    const sliderProps = (key: string, label: string, min: number, max: number, step: number, def: number, desc: string, val: number, setter: any) => ({
        key, paramKey: key, label, value: val, min, max, step, def, desc,
        onChange: setter, onMouseEnter: setHoverInfo, onMouseLeave: setHoverInfo,
        midiLearnMode, onMidiLearnTarget, isTarget: midiTarget === key, isMapped: mappedParams.includes(key)
    });

    // Helper for Buttons
    const btnProps = (key: string, label: string, active: boolean, click: any, desc: string, type: 'toggle' | 'action' = 'toggle') => ({
        key, paramKey: key, label, active, onClick: click, desc, type,
        midiLearnMode, onMidiLearnTarget, isTarget: midiTarget === key, isMapped: mappedParams.includes(key),
        onMouseEnter: setHoverInfo, onMouseLeave: setHoverInfo
    });

    // Helper to find mapped MIDI code for a param
    const getMappedCode = (param: string) => {
        const entry = Object.entries(midiMappings).find(([_, v]: [string, any]) => v.param === param);
        if (!entry) return null;
        const [key, val] = entry;
        // key is "channel-cc"
        const [ch, cc] = key.split('-');
        // Try to determine if it's CC or Note based on usage, but simple display is fine
        return `CH${ch}:${cc}`;
    };

    const mapItemProps = (label: string, param: string, shortcut?: string, type: 'continuous' | 'toggle' | 'action' = 'toggle', min = 0, max = 1) => ({
        label,
        paramKey: param,
        shortcut,
        mappedCode: getMappedCode(param),
        isLearning: midiTarget === param,
        type,
        value: param in uiState ? (uiState as any)[param] : 0,
        min,
        max,
        onClick: () => {
            if (!midiLearnMode) toggleMidiLearn();
            onMidiLearnTarget(param, min, max, type);
        }
    });

    const handleAddTracks = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onAddTracks(e.target.files);
        }
    };

    return (
        <>
            <input type="file" ref={addClipsInputRef} onChange={handleAddClips} multiple className="hidden" accept="video/*" />

            {/* TOP MENU */}
            <div className={`absolute top-0 left-0 w-full z-[100] h-6 hover:h-auto hover:pb-4 group transition-all duration-300`}>
                {/* Visible Handle */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-white/5 rounded-b-lg border-b border-x border-white/10 flex items-center justify-center cursor-pointer group-hover:opacity-0 transition-opacity">
                    <span className="text-[8px] font-mono text-gray-500 tracking-widest uppercase">MENU</span>
                </div>

                <div className={`w-full bg-gradient-to-b from-black/95 to-black/0 p-4 -translate-y-[95%] group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center gap-4 border-b border-white/10 shadow-2xl`}>
                    <div className="flex items-center justify-center gap-6 pointer-events-auto">
                        <button onClick={onLoadVideo} className="px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded text-xs font-mono text-blue-100 hover:bg-blue-500/40 transition-colors uppercase tracking-widest flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            Load Sky Video
                        </button>
                        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded border border-white/10">
                            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Sync</span>
                            <button
                                onClick={() => setIsVideoSynced?.(!isVideoSynced)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${isVideoSynced ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {isVideoSynced ? 'SYNC ON' : 'SYNC OFF'}
                            </button>
                            {isVideoSynced && (
                                <select
                                    value={videoTargetBars}
                                    onChange={(e) => setVideoTargetBars?.(parseInt(e.target.value))}
                                    className="bg-black/60 text-[10px] font-mono text-cyan-400 border border-white/10 rounded px-1 outline-none"
                                >
                                    {[4, 8, 16, 32, 64].map(b => <option key={b} value={b}>{b} Bars</option>)}
                                </select>
                            )}
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded border border-white/10">
                            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Blend</span>
                            <select
                                value={videoBlendMode}
                                onChange={(e) => setVideoBlendMode?.(parseInt(e.target.value))}
                                className="bg-black/60 text-[10px] font-mono text-white border border-white/10 rounded px-2 outline-none hover:border-white/30"
                            >
                                <option value={0}>Mix</option>
                                <option value={1}>Add</option>
                                <option value={2}>Screen</option>
                                <option value={3}>Mult</option>
                                <option value={4}>Overlay</option>
                                <option value={5}>Dodge</option>
                                <option value={6}>BG</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded border border-white/10">
                            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Scale</span>
                            <input type="range" min="0.1" max="3.0" step="0.1" value={videoScale} onChange={(e) => setVideoScale(parseFloat(e.target.value))} className="w-24 h-1 bg-white/20 rounded-full cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded border border-white/10">
                            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Speed</span>
                            <input type="range" min="0.1" max="4.0" step="0.1" value={videoSpeed} onChange={(e) => setVideoSpeed(parseFloat(e.target.value))} className="w-24 h-1 bg-white/20 rounded-full cursor-pointer" />
                        </div>
                    </div>

                    {/* PLAYLIST ROW */}
                    {videoClips && (
                        <div className="w-full max-w-5xl border-t border-white/10 pt-4 pointer-events-auto">
                            <div className="flex items-center justify-between mb-2 px-4">
                                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                    Skybox Playlist ({videoClips.length})
                                </span>
                                <button onClick={() => addClipsInputRef.current?.click()} className="text-[9px] text-purple-300 hover:text-white transition-colors border border-purple-500/30 px-3 py-1 rounded bg-purple-500/10 hover:bg-purple-500/30 font-mono tracking-wider flex items-center gap-1">
                                    <span>+</span> ADD VIDEOS
                                </button>
                            </div>

                            {videoClips.length > 0 ? (
                                <div className="flex gap-2 overflow-x-auto custom-scroll pb-2 px-4 snap-x">
                                    {videoClips.map(clip => (
                                        <div key={clip.id}
                                            onClick={(e) => { e.stopPropagation(); onClipSelect?.(clip.id); }}
                                            className={`flex-shrink-0 w-40 p-2 rounded border cursor-pointer transition-all snap-start relative group/clip
                                                ${activeClipId === clip.id ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${activeClipId === clip.id ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,1)]' : 'bg-gray-600'}`}></div>
                                                <div className={`text-[9px] font-mono truncate flex-grow ${activeClipId === clip.id ? 'text-white font-bold' : 'text-gray-400'}`} title={clip.name}>{clip.name}</div>
                                            </div>

                                            <div className="flex justify-between items-center gap-2 opacity-50 group-hover/clip:opacity-100 transition-opacity">
                                                <select
                                                    value={clip.playbackMode || 'normal'}
                                                    onChange={(e) => { e.stopPropagation(); onClipUpdate?.(clip.id, { playbackMode: e.target.value as any }); }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="bg-black/50 text-[8px] text-cyan-300 border border-white/10 rounded px-1 py-0.5 outline-none hover:border-cyan-500/50 cursor-pointer"
                                                >
                                                    <option value="normal">Loop</option>
                                                    <option value="reverse">Rev</option>
                                                    <option value="oneshot">1-Shot</option>
                                                </select>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); if (confirm('Remove clip?')) onClipRemove?.(clip.id); }}
                                                    className="text-[10px] text-red-500 hover:text-red-200 w-4 h-4 flex items-center justify-center rounded hover:bg-red-500/20"
                                                    title="Remove"
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            {/* Playing Indicator Overlay */}
                                            {activeClipId === clip.id && isVideoPlaying && (
                                                <div className="absolute top-2 right-2 flex gap-0.5">
                                                    <div className="w-0.5 h-2 bg-green-400 animate-pulse"></div>
                                                    <div className="w-0.5 h-3 bg-green-400 animate-pulse delay-75"></div>
                                                    <div className="w-0.5 h-2 bg-green-400 animate-pulse delay-150"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full h-16 border border-dashed border-white/10 rounded flex items-center justify-center gap-2 text-gray-600 text-[10px] font-mono uppercase tracking-widest bg-white/5">
                                    <span>Empty Playlist</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* FULL SCREEN MAPPING OVERLAY */}
            {showMap && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-8 overflow-hidden animate-in fade-in duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold font-mono tracking-tighter text-white">MIDI / KEY CONTROL MAP</h2>
                        <div className="flex gap-4">
                            <div className={`px-4 py-2 rounded border font-mono text-xs ${midiLearnMode ? 'bg-orange-500 text-white border-orange-500 animate-pulse' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                {midiLearnMode ? "LEARNING ACTIVE... TOUCH CONTROL" : "CLICK A BOX TO BIND"}
                            </div>
                            <button onClick={() => setShowMap(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-mono text-xs border border-white/10">CLOSE</button>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scroll grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                        {/* 1. SCENES */}
                        <MappingSection title="Scene Select">
                            {sceneList.map((name, i) => (
                                <MappingItem key={i} {...mapItemProps(`${i + 1}. ${name}`, `sceneSet:${i}`, (i < 9 ? `${i + 1}` : undefined), 'action')} />
                            ))}
                            <MappingItem {...mapItemProps("PREV SCENE", "action:prevScene", "", "action")} />
                            <MappingItem {...mapItemProps("NEXT SCENE", "action:nextScene", "", "action")} />
                            <MappingItem {...mapItemProps("SCENE SLIDER", "sceneMode", "", "continuous", 0, 13)} />
                        </MappingSection>

                        {/* 2. WARPS */}
                        <MappingSection title="Space Warps">
                            {warpList.map((name, i) => (
                                <MappingItem key={i} {...mapItemProps(name, `warpSet:${i}`, ["Q", "W", "E", "R", "T"][i], 'action')} />
                            ))}
                            <MappingItem {...mapItemProps("WARP SLIDER", "warpMode", "", "continuous", 0, 4)} />
                        </MappingSection>

                        {/* 3. PALETTES */}
                        <MappingSection title="Color Palettes">
                            {paletteList.map((name, i) => (
                                <MappingItem key={i} {...mapItemProps(name, `paletteSet:${i}`, i === 0 ? "=" : undefined, 'action')} />
                            ))}
                            <MappingItem {...mapItemProps("PALETTE SLIDER", "paletteMode", "", "continuous", 0, 4)} />
                        </MappingSection>

                        {/* 4. GLOBAL TOGGLES */}
                        <MappingSection title="Global Toggles">
                            <MappingItem {...mapItemProps("PARTICLES 3D", "particles", "", "toggle")} />
                            <MappingItem {...mapItemProps("VHS MODE", "vhs", "K", "toggle")} />
                            <MappingItem {...mapItemProps("MOTION BLUR", "blur", "J", "toggle")} />
                            <MappingItem {...mapItemProps("OPTICS", "optics", "V", "toggle")} />
                            <MappingItem {...mapItemProps("OSCILLOSCOPE", "oscilloscope", "A", "toggle")} />
                            <MappingItem {...mapItemProps("MIRROR OSC", "mirrorOsc", "M", "toggle")} />
                            <MappingItem {...mapItemProps("3D SCOPE", "threeDOsc", "B", "toggle")} />
                            <MappingItem {...mapItemProps("SCOPE DODGE", "oscDodge", "7", "toggle")} />
                            <MappingItem {...mapItemProps("HUE CYCLE", "hueCycling", "8", "toggle")} />
                            <MappingItem {...mapItemProps("SKY LOOP", "videoLoop", "", "toggle")} />
                        </MappingSection>

                        {/* NEW: GEOMETRY MODIFIERS */}
                        <MappingSection title="Geometry Modifiers">
                            <MappingItem {...mapItemProps("GEO SCALE", "geoScale", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("DEFORM STRENGTH", "geoDeform", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("THICKNESS / WEIGHT", "geoThickness", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("SURFACE DETAIL", "geoDetail", "", "continuous", 0, 1)} />
                        </MappingSection>

                        {/* 5. SLIDERS - GRADING */}
                        <MappingSection title="Grading Controls">
                            <MappingItem {...mapItemProps("HUE SHIFT", "hue", "[ / ]", "continuous", -3.14, 3.14)} />
                            <MappingItem {...mapItemProps("SATURATION", "saturation", "; / '", "continuous", 0, 3)} />
                            <MappingItem {...mapItemProps("BRIGHTNESS", "brightness", "9 / 0", "continuous", 0, 3)} />
                            <MappingItem {...mapItemProps("CONTRAST", "contrast", "", "continuous", 0, 3)} />
                            <MappingItem {...mapItemProps("GRAIN", "grain", "", "continuous", 0, 0.5)} />
                        </MappingSection>

                        {/* 6. SLIDERS - REACTOR */}
                        <MappingSection title="Audio Reactor">
                            <MappingItem {...mapItemProps("GAIN LOW", "gainLow", "", "continuous", 0, 3)} />
                            <MappingItem {...mapItemProps("GAIN MID", "gainMid", "", "continuous", 0, 3)} />
                            <MappingItem {...mapItemProps("GAIN HIGH", "gainHigh", "", "continuous", 0, 3)} />
                            <MappingItem {...mapItemProps("FX SHAKE", "fxShake", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("FX FLASH", "fxFlash", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("FX SOLARIZE", "fxSolarize", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("BLOOM PULSE", "bloomReact", "", "continuous", 0, 2)} />
                            <MappingItem {...mapItemProps("SWING AMT", "swingAmount", "", "continuous", 0, 2)} />
                        </MappingSection>

                        {/* 7. SLIDERS - SKYBOX */}
                        <MappingSection title="Skybox FX">
                            <MappingItem {...mapItemProps("VIDEO WARP", "videoWarp", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("VIDEO DODGE", "videoDodge", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("VIDEO MIRROR", "videoMirror", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("VIDEO GLITCH", "videoGlitch", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("VIDEO FADE", "videoFade", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("PALETTE MIX", "videoPaletteMix", "", "continuous", 0, 1)} />
                            <MappingItem {...mapItemProps("DIFFUSION", "videoDiffusion", "", "continuous", 0, 1)} />
                        </MappingSection>

                        {/* 8. ACTIONS */}
                        <MappingSection title="System Actions">
                            <MappingItem {...mapItemProps("CENTER CAM", "action:centerCam", "HOME", "action")} />
                            <MappingItem {...mapItemProps("CAMERA SPEED", "camSpeed", "", "continuous", 0.01, 1.0)} />
                            <MappingItem {...mapItemProps("RANDOMIZE", "action:randomize", "/", "action")} />
                            <MappingItem {...mapItemProps("TAP BPM", "action:tapBpm", "ENTER", "action")} />
                            <MappingItem {...mapItemProps("RESET", "action:reset", "H", "action")} />
                        </MappingSection>

                        {/* 9. VIDEO SLOTS */}
                        <MappingSection title="Video Playlist Slots">
                            {Array.from({ length: 16 }).map((_, i) => {
                                const hasClip = videoClips && videoClips.length > i;
                                const clipName = hasClip ? videoClips[i].name : "Empty";
                                return (
                                    <MappingItem
                                        key={i}
                                        {...mapItemProps(`SLOT ${i + 1}: ${clipName}`, `videoSlot:${i + 1}`, undefined, 'action')}
                                    />
                                );
                            })}
                        </MappingSection>
                    </div>
                </div>
            )}

            {/* PLAYLIST PANEL */}
            {mode === 'file' && showPlaylist && (
                <div className="absolute bottom-24 left-6 z-[55] w-72 max-h-[50vh] flex flex-col bg-black/80 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
                    <div className="p-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">Playlist</span>
                        <span className="text-[9px] text-gray-500 font-mono">{playlist.length} Tracks</span>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scroll p-2 space-y-1">
                        {playlist.map((file, idx) => (
                            <div
                                key={idx}
                                onClick={() => onPlayTrack(idx)}
                                className={`group px-3 py-2 rounded flex items-center gap-3 cursor-pointer transition-colors ${currentTrackIndex === idx ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className={`text-[10px] font-mono w-4 text-center ${currentTrackIndex === idx ? 'text-blue-400' : 'text-gray-600'}`}>
                                    {currentTrackIndex === idx ? (isPlaying ? '▶' : 'II') : idx + 1}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className={`text-xs font-mono truncate ${currentTrackIndex === idx ? 'text-blue-100 font-bold shadow-blue-500' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                        {file.name.replace(/\.[^/.]+$/, "")}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-2 border-t border-white/10 bg-black/40">
                        <input
                            type="file"
                            multiple
                            accept="audio/*"
                            ref={addTracksInputRef}
                            className="hidden"
                            onChange={handleAddTracks}
                        />
                        <button
                            onClick={() => addTracksInputRef.current?.click()}
                            className="w-full py-2 text-[10px] font-mono text-gray-400 border border-white/10 rounded hover:bg-white/10 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            + Add Tracks
                        </button>
                    </div>
                </div>
            )}

            {/* HUD OVERLAY (Left) */}
            <div className="absolute top-24 left-6 z-40 text-white/50 font-mono text-[10px] space-y-2 pointer-events-none select-none bg-black/50 p-4 rounded backdrop-blur-sm border border-white/5 w-64">
                <div><span className="text-blue-400">SCENE: </span>{sceneName}</div>
                <div><span className="text-purple-400">WARP: </span>{warpName}</div>
                <div className="border-t border-white/10 my-1 pt-1"></div>
                <div><span className="text-teal-400">MIRROR BURN [M]: </span>{uiState.mirrorOsc ? "ACTIVE" : "OFF"}</div>
                <div><span className="text-red-400">VHS MODE [K]: </span>{uiState.vhs ? "ACTIVE" : "OFF"}</div>
                <div className="border-t border-white/10 my-1 pt-1"></div>
                <div><span className="text-white font-bold">PALETTE: </span><span className="text-white">{paletteName}</span></div>
                <div className="border-t border-white/10 my-1 pt-1"></div>

                {hoverInfo && (
                    <div className="mt-2 pt-2 border-t border-white/20 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Parameter Info</div>
                        <div className="text-white text-xs font-bold leading-tight">{hoverInfo}</div>
                    </div>
                )}
            </div>

            {/* RECORDER INDICATOR */}
            {isRecording && (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 bg-red-900/40 border border-red-500/50 px-3 py-1 rounded-full backdrop-blur-md animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-200 font-mono text-xs font-bold tracking-widest">REC {formatTime(recordingTime)}</span>
                </div>
            )}

            {/* FADING MUSIC PLAYER BAR */}
            {mode === 'file' && (
                <div className="absolute bottom-0 left-0 w-full h-8 hover:h-auto z-[60] group flex flex-col justify-end">
                    <div className="w-full p-4 bg-gradient-to-t from-black via-black/95 to-transparent flex flex-col items-center justify-end opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out pointer-events-none group-hover:pointer-events-auto">
                        {/* SEEK BAR */}
                        <div className="w-full max-w-4xl flex items-center gap-4 mb-2">
                            <span className="text-[10px] font-mono text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
                            <input type="range" min="0" max={duration || 0} value={currentTime} onChange={onSeek} className="flex-grow h-1 bg-white/20 rounded-full cursor-pointer hover:bg-blue-500/50 transition-colors" />
                            <span className="text-[10px] font-mono text-gray-400 w-10">{formatTime(duration)}</span>
                        </div>

                        {/* CONTROLS ROW */}
                        <div className="flex items-center justify-between w-full max-w-4xl px-4">
                            {/* LEFT: Playlist Toggle */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowPlaylist(!showPlaylist)}
                                    className={`text-gray-400 hover:text-white transition-colors p-2 rounded ${showPlaylist ? 'bg-white/10 text-white' : ''}`}
                                    title="Toggle Playlist"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-xs text-white font-mono font-bold truncate max-w-[200px]">
                                        {playlist[currentTrackIndex]?.name.replace(/\.[^/.]+$/, "") || "No Track"}
                                    </span>
                                    <span className="text-[9px] text-gray-500 font-mono">
                                        Track {currentTrackIndex + 1} / {playlist.length}
                                    </span>
                                </div>
                            </div>

                            {/* CENTER: Transport */}
                            <div className="flex items-center gap-6">
                                <button onClick={toggleShuffle} className={`transition-colors ${isShuffle ? 'text-blue-400' : 'text-gray-600 hover:text-gray-400'}`} title="Shuffle">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l-5 5-4-4"></path><path d="M4 4l5 5"></path></svg>
                                </button>

                                <button onClick={onPrevTrack} className="text-gray-400 hover:text-white transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
                                </button>

                                <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                                    {isPlaying ?
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> :
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    }
                                </button>

                                <button onClick={onNextTrack} className="text-gray-400 hover:text-white transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
                                </button>

                                <button onClick={() => setVideoLoop(!videoLoop)} className={`transition-colors ${videoLoop ? 'text-blue-400' : 'text-gray-600 hover:text-gray-400'}`} title="Loop Track">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                                </button>
                            </div>

                            {/* RIGHT: Volume & Load */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 group/vol">
                                    <svg width="14" height="14" className="text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={onVolume} className="w-20 h-1 bg-white/10 rounded-full cursor-pointer group-hover/vol:bg-white/30" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Upload for Texture */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto opacity-0 hover:opacity-100 transition-opacity duration-500 flex gap-2">
                <button onClick={onLoadTexture} className="px-3 py-1 bg-black/50 backdrop-blur border border-white/10 text-[9px] text-gray-400 font-mono rounded hover:bg-white/10 hover:text-white transition-colors">UPLOAD TEXTURE</button>
            </div>

            {/* RIGHT PANEL - CONTROLS */}
            <div className={`absolute top-6 right-6 z-50 p-4 bg-black/80 backdrop-blur-md border rounded-md flex flex-col gap-3 w-52 transition-all max-h-[85vh] overflow-y-auto custom-scroll ${midiLearnMode ? 'border-orange-500/50 opacity-100' : 'border-white/10 opacity-80 hover:opacity-100'}`}>

                {/* AUDIO REACTOR */}
                <div>
                    <label className="text-green-400 text-[10px] font-mono tracking-widest uppercase mb-1 block">Audio Reactor</label>
                    <div className="flex justify-between gap-1 mb-2">
                        {['LOW', 'MID', 'HIGH'].map((band, i) => (
                            <div key={band} className="flex flex-col items-center w-full">
                                <div className="h-12 w-full relative bg-white/5 rounded overflow-hidden group">
                                    <div className={`absolute bottom-0 w-full transition-all ${i === 0 ? 'bg-green-500/50' : i === 1 ? 'bg-blue-500/50' : 'bg-purple-500/50'}`} style={{ height: `${i === 0 ? uiState.gainLow * 33 : i === 1 ? uiState.gainMid * 33 : uiState.gainHigh * 33}%` }}></div>
                                    <input type="range" min="0" max="3" step="0.1" value={i === 0 ? uiState.gainLow : i === 1 ? uiState.gainMid : uiState.gainHigh} onChange={(e) => updateAudioReactor(i === 0 ? 'gainLow' : i === 1 ? 'gainMid' : 'gainHigh', parseFloat(e.target.value))} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <GradingSlider {...sliderProps('fxShake', 'Shake', 0, 1, 0.05, 0.0, "Screen jitter reactive to High frequencies.", uiState.fxShake, (v: number) => updateAudioReactor('fxShake', v))} />
                    <GradingSlider {...sliderProps('fxFlash', 'Flash', 0, 1, 0.05, 0.0, "Invert colors on strong beats.", uiState.fxFlash, (v: number) => updateAudioReactor('fxFlash', v))} />
                    <GradingSlider {...sliderProps('bloomReact', 'Bloom Pulse', 0, 2, 0.1, 0.0, "Bloom reacts to beat.", uiState.bloomReact, (v: number) => updateAudioReactor('bloomReact', v))} />
                </div>

                <div className="border-t border-white/10 my-1"></div>

                {/* SCENE & WARP */}
                <div>
                    <label className="text-blue-400 text-[10px] font-mono tracking-widest uppercase mb-1 block">Scene Control</label>
                    <div className="flex gap-2 mb-2">
                        <MidiButton {...btnProps('action:prevScene', 'PREV', false, () => triggerAction('prevScene'), "Previous Scene", 'action')} />
                        <MidiButton {...btnProps('action:nextScene', 'NEXT', false, () => triggerAction('nextScene'), "Next Scene", 'action')} />
                    </div>
                    <GradingSlider {...sliderProps('sceneMode', 'Scene Select', 0, 13, 1, 0, "Select Scene Index (0-13)", uiState.sceneMode, (v: number) => updateState({ sceneMode: Math.round(v) }))} />
                    <GradingSlider {...sliderProps('warpMode', 'Warp Select', 0, 4, 1, 0, "Select Warp Mode (0-4)", uiState.warpMode, (v: number) => updateState({ warpMode: Math.round(v) }))} />
                    <GradingSlider {...sliderProps('camSpeed', 'Camera Speed', 0.01, 1.0, 0.01, 0.15, "Adjust manual camera movement speed.", uiState.camSpeed, (v: number) => { updateState({ camSpeed: v }); updateRef('camSpeed', v); })} />

                    <div className="mt-2">
                        <label className="text-gray-500 text-[9px] font-mono tracking-wide uppercase mb-1 block">Geometry Modifiers</label>
                        <GradingSlider {...sliderProps('geoScale', 'Scale / Density', 0, 1, 0.01, 0.5, "Adjusts repetition density or object scale.", uiState.geoScale, (v: number) => updateGrading('geoScale', v))} />
                        <GradingSlider {...sliderProps('geoDeform', 'Deformation', 0, 1, 0.01, 0.5, "Adjusts math intensity or displacement strength.", uiState.geoDeform, (v: number) => updateGrading('geoDeform', v))} />
                        <GradingSlider {...sliderProps('geoThickness', 'Thickness / Weight', 0, 1, 0.01, 0.5, "Inflate to solid blocks or deflate to wireframes.", uiState.geoThickness, (v: number) => updateGrading('geoThickness', v))} />
                        <GradingSlider {...sliderProps('geoDetail', 'Surface Detail', 0, 1, 0.01, 0.5, "Increases noise frequency and complexity.", uiState.geoDetail, (v: number) => updateGrading('geoDetail', v))} />
                    </div>

                    <div className="mt-2">
                        <label className="text-pink-400 text-[9px] font-mono tracking-wide uppercase mb-1 block">Skybox Control</label>
                        <GradingSlider {...sliderProps('videoBlendMode', 'Blend Mode', 0, 5, 1, 0, "0:Nrm 1:Add 2:Scrn 3:Mult 4:Ovr 5:Dodge", videoBlendMode, (v: number) => { const val = Math.round(v); setVideoBlendMode(val); updateRef('videoBlendMode', val); })} />
                        <GradingSlider {...sliderProps('videoFade', 'Fade Out', 0, 1, 0.01, 0, "Fade video to black.", uiState.videoFade, (v: number) => { updateState({ videoFade: v }); updateRef('videoFade', v); })} />
                        <GradingSlider {...sliderProps('videoPaletteMix', 'Palette Mix', 0, 1, 0.01, 0, "Tint video with current palette.", uiState.videoPaletteMix, (v: number) => { updateState({ videoPaletteMix: v }); updateRef('videoPaletteMix', v); })} />
                        <GradingSlider {...sliderProps('videoDiffusion', 'Diffusion', 0, 1, 0.01, 0, "Soft blur effect.", uiState.videoDiffusion, (v: number) => { updateState({ videoDiffusion: v }); updateRef('videoDiffusion', v); })} />
                    </div>

                    {/* VIDEO DECK */}
                    <div className="mt-2 border-t border-white/5 pt-2">
                        <label className="text-purple-400 text-[9px] font-mono tracking-wide uppercase mb-1 flex justify-between items-center">
                            <span>Video Deck</span>
                            <button onClick={() => addClipsInputRef.current?.click()} className="text-[9px] border border-purple-500/50 px-2 rounded hover:bg-purple-500/20 transition-colors">+</button>
                        </label>
                        <div className="max-h-24 overflow-y-auto custom-scroll space-y-1 mb-2">
                            {videoClips?.map(clip => (
                                <div key={clip.id} className={`flex items-center gap-1 p-1 rounded border transition-all ${activeClipId === clip.id ? 'border-purple-500 bg-purple-500/20' : 'border-white/5 hover:border-white/10'}`}>
                                    <div onClick={(e) => { e.stopPropagation(); onClipSelect?.(clip.id); }} className="flex-grow min-w-0 cursor-pointer">
                                        <div className={`text-[9px] font-mono truncate ${activeClipId === clip.id ? 'text-purple-200' : 'text-gray-400'}`}>{clip.name}</div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onClipBind?.(clip.id); }}
                                        className={`relative px-1 text-[8px] h-4 flex items-center border rounded transition-colors 
                                            ${midiLearnMode && midiTarget === `clipSet:${clip.id}` ? 'bg-orange-500 text-white border-orange-500 animate-pulse' :
                                                mappedParams?.includes(`clipSet:${clip.id}`) ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' : 'border-white/10 hover:bg-white/10 text-gray-500 hover:text-orange-400'}`}
                                        title="Bind MIDI"
                                    >
                                        {midiLearnMode && midiTarget === `clipSet:${clip.id}` ? 'LRN' : 'BND'}
                                        {mappedParams?.includes(`clipSet:${clip.id}`) && <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_4px_rgba(249,115,22,0.8)]"></div>}
                                    </button>
                                </div>
                            ))}
                            {(!videoClips || videoClips.length === 0) && <div className="text-[8px] text-gray-600 italic text-center py-2">No clips loaded</div>}
                        </div>

                        {/* ACTIVE CLIP SETTINGS */}
                        {activeClipId && videoClips?.find(c => c.id === activeClipId) && (
                            <div className="bg-black/40 border border-white/5 p-2 rounded animate-in fade-in slide-in-from-top-1 duration-200">
                                {(() => {
                                    const activeClip = videoClips.find(c => c.id === activeClipId)!;
                                    return (
                                        <>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-mono text-purple-300 uppercase truncate max-w-[120px]" title={activeClip.name}>
                                                    Config: {activeClip.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={activeClip.playbackMode || 'normal'}
                                                        onChange={(e) => onClipUpdate?.(activeClip.id, { playbackMode: e.target.value as any })}
                                                        className="bg-black text-[9px] font-mono text-cyan-400 border border-white/20 rounded px-1 h-4 flex items-center outline-none focus:border-cyan-500"
                                                    >
                                                        <option value="normal">Normal</option>
                                                        <option value="reverse">Reverse</option>
                                                        <option value="oneshot">One Shot</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {activeClip.playbackMode === 'oneshot' && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[8px] font-mono text-gray-500">
                                                        <span>Release Fade</span>
                                                        <span>{(activeClip.releaseTime ?? 0.5).toFixed(1)}s</span>
                                                    </div>
                                                    <input
                                                        type="range" min="0.1" max="10.0" step="0.1"
                                                        value={activeClip.releaseTime ?? 0.5}
                                                        onChange={(e) => onClipUpdate?.(activeClip.id, { releaseTime: parseFloat(e.target.value) })}
                                                        className="w-full h-1 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors accent-purple-500"
                                                    />
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                {/* FX TOGGLES & ACTIONS */}
                <div className="grid grid-cols-2 gap-2">
                    <MidiButton {...btnProps('particles', 'PARTICLES', uiState.particles, () => toggleParam('particles'), "Toggle 3D Particles")} />
                    <MidiButton {...btnProps('videoLoop', 'SKY LOOP', videoLoop, () => setVideoLoop(!videoLoop), "Loop Video Skybox")} />
                    <MidiButton {...btnProps('vhs', 'VHS MODE', uiState.vhs, () => toggleParam('vhs'), "Analog VHS Glitch")} />
                    <MidiButton {...btnProps('blur', 'MOTION BLUR', uiState.blur, () => toggleParam('blur'), "Visual Echo/Blur")} />
                    <MidiButton {...btnProps('optics', 'OPTICS', uiState.optics, () => toggleParam('optics'), "Fish-eye Distortion")} />
                    <MidiButton {...btnProps('mirrorOsc', 'MIRROR OSC', uiState.mirrorOsc, () => toggleParam('mirrorOsc'), "Kaleidoscope Oscilloscope")} />
                    <MidiButton {...btnProps('oscilloscope', 'SCOPE', uiState.oscilloscope, () => toggleParam('oscilloscope'), "Waveform Overlay")} />

                    {/* ACTION BUTTONS */}
                    <MidiButton {...btnProps('action:randomize', 'RANDOMIZE', false, () => triggerAction('randomize'), "Randomize all settings", 'action')} />
                    <MidiButton {...btnProps('action:tapBpm', 'TAP BPM', false, () => triggerAction('tapBpm'), "Tap to set tempo", 'action')} />
                </div>

                <div className="border-t border-white/10 my-1"></div>

                {/* MIDI MASTER */}
                <div>
                    <label className="text-gray-400 text-[10px] font-mono tracking-widest uppercase flex justify-between items-center">
                        <span>MIDI Map</span>
                        <span className={`w-2 h-2 rounded-full ${midiLearnMode ? 'bg-orange-500 animate-pulse' : 'bg-gray-600'}`}></span>
                    </label>
                    <div className="mt-2 flex flex-col gap-2">
                        <button
                            onClick={() => setShowMap(true)}
                            className={`w-full py-2 text-[10px] font-mono rounded border transition-all bg-white/5 border-white/10 text-gray-300 hover:bg-white/10`}
                        >
                            OPEN MAP PANEL
                        </button>
                        {mappedParams.length > 0 && (
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[9px] text-gray-500">{mappedParams.length} Mapped</span>
                                <button onClick={clearMidiMappings} className="text-[9px] text-red-400 hover:text-red-200 underline">Clear All</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-white/10 my-1"></div>

                {/* PROJECTOR / OUTPUT */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-pink-400 text-[10px] font-mono tracking-widest uppercase block">Display Output</label>
                        {projectorMode && <span className="text-[9px] text-pink-500 animate-pulse font-bold">EXT ACTIVE</span>}
                    </div>

                    <div className="flex gap-2 mb-2">
                        <select
                            value={`${targetResolution.w},${targetResolution.h},${targetResolution.label}`}
                            onChange={handleResolutionChange}
                            disabled={projectorMode}
                            className="w-full bg-white/5 border border-white/10 text-[9px] text-gray-300 rounded px-2 py-1 font-mono focus:outline-none focus:border-pink-500 disabled:opacity-50 appearance-none hover:bg-white/10 cursor-pointer"
                        >
                            {resolutions.map(r => (
                                <option key={r.label} value={`${r.w},${r.h},${r.label}`}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={toggleProjector}
                        className={`w-full py-2 text-[10px] font-mono rounded border flex items-center justify-center gap-2 transition-all 
                ${projectorMode ? 'bg-pink-500/20 text-pink-200 border-pink-500' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                    >
                        <div className={`w-2 h-2 border border-current flex items-center justify-center ${projectorMode ? 'bg-pink-400' : ''}`}>
                            {projectorMode && <div className="w-1 h-1 bg-black"></div>}
                        </div>
                        {projectorMode ? "CLOSE PROJECTOR" : "OPEN PROJECTOR WINDOW"}
                    </button>
                </div>

                <div className="border-t border-white/10 my-1"></div>

                {/* REC */}
                <div>
                    <button onClick={toggleRecording} className={`w-full py-2 text-[10px] font-mono rounded border flex items-center justify-center gap-2 transition-all ${isRecording ? 'bg-red-500 text-white border-red-400' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}>
                        <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-red-500'}`}></div>
                        {isRecording ? "STOP REC" : "START REC"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default memo(VisualizerUI);
