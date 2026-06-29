import React, { useMemo } from 'react';
import Knob from './Knob.jsx';

const EIGHT_INDICES = Array.from({ length: 8 }, (_, i) => i);
const ringColors = [
  '#00f3ff', // Cyan
  '#ff00ff', // Magenta
  '#ffe600', // Yellow
  '#00ff96', // Emerald
  '#ff0055', // Red
  '#7b00ff', // Purple
  '#ff6e00', // Orange
  '#00ff00'  // Green
];

const ROTOR_PRESETS = [
  { name: '122 Slow', drive: 0.15, width: 0.45, crossover: 800 },
  { name: '122 Fast', drive: 0.35, width: 0.65, crossover: 800 },
  { name: '147 Heavy', drive: 0.55, width: 0.75, crossover: 600 }
];

export default function PerformanceView({
  params,
  setParams,
  uiScale,
  focusZoomScale,
  focusZoomDuration,
  isFocusZoomActive,
  perfEvents,
  setPerfEvents,
  highwayZoom,
  setHighwayZoom,
  perfTimeSignature,
  perfSeqLength,
  highwayEditMode,
  resizeDragTarget,
  setResizeDragTarget,
  selectedPill,
  setSelectedPill,
  sampleSlots,
  setSampleSlots,
  updateSlotParam,
  saveSlotMetadataToDb,
  platterAngleARef,
  platterAngleBRef,
  platterRefA,
  platterRefB,
  ringsContainerRefA,
  ringsContainerRefB,
  handlePlatterMouseDown,
  handlePlatterMouseMove,
  handlePlatterMouseUp,
  handlePlatterClick,
  handleRingsMouseMove,
  handleRingsMouseLeave,
  targetCirclesRefsA,
  targetCirclesRefsB,
  laneBgsRefsA,
  laneBgsRefsB,
  highwayEventsRefA,
  highwayEventsRefB,
  handleHighwayMouseDown,
  handleHighwayMouseMove,
  handleHighwayMouseUp,
  perfPlaybackActive,
  perfRecordActive,
  seqTimerDisplayRef,
  seqTimeDisplayRef,
  playVoice,
  stopVoice,
  cycleTriggerMode,
  toggleSlotLoop,
  getSlotLabel,
  stopProp,
  deckAPitch,
  deckBPitch,
  deckAKeyLock,
  deckBKeyLock,
  deckAStretch,
  deckBStretch,
  handleMidiCC,
  modWheelVal,
  userRotorPresets,
  handleLoadRotorPreset,
  handleSaveRotorPreset,
  selectedRotorPresetIdx,
  setSelectedRotorPresetIdx,
  userEchoPresets,
  handleLoadEchoPreset,
  handleSaveEchoPreset,
  selectedEchoPresetIdx,
  setSelectedEchoPresetIdx,
  masterGlueCompressorRef,
  masterLimiterRef,
  masterLimiterActive,
  setMasterLimiterActive,
  masterLimiterVuRefsArr,
  showExportModal,
  setShowExportModal,
  setPerformanceViewActive,

  deleteSelectedPill,
  handleCopyDeck,
  handlePasteDeck,
  highwayClipboard,
  handleClearDeck,
  seqCurrentBeatRef,
  seqStartBeatOffsetRef,
  perfPlaybackActiveRef,
  audioCtxRef,
  perfPlayStartTimeRef,
  schedulerNodeRef,
  sortedPerfEventsRef,
  showEditorStatus,
  stopPerformancePlayback,
  togglePerformancePlayback,
  perfIsDubbing,
  perfRecordArmed,
  togglePerformanceRecord,
  perfQuantizeMode,
  setPerfQuantizeMode,
  setPerfSeqLength,
  clearPerformance,
  macros,
  macroAssignMode,
  setMacroAssignMode,
  triggerPerfPadInternal,
  inputGainSat,
  setInputGainSat,
  duckerAmount,
  setDuckerAmount,
  glueMix,
  setGlueMix,
  perfSeqLengthRef,
  midiLearnParam,
  midiMappings,
  setMidiLearnParam,
  setPerfTimeSignature,
  metronomeOn,
  stopMetronome,
  setMetronomeOn,
  startMetronome,
  masterSyncActive,
  setMasterSyncActive,
  liveRecTargetSlot,
  setLiveRecTargetSlot,
  setSelectedEditSlotId,
  liveRecBeats,
  setLiveRecBeats,
  selectedAudioDevice,
  handleAudioDeviceChange,
  audioDevices,
  armLooperInput,
  isArmed,
  isLiveRecording,
  toggleLiveLoopRecording,
  liveRecPendingStart,
  slotMap,
  triggerStutterDeck,
  releaseStutterDeck,
  setDeckAKeyLock,
  setDeckBKeyLock,
  setDeckAPitch,
  setDeckBPitch,
  setDeckAStretch,
  setDeckBStretch,
  dragOverDeck,
  setDragOverDeck,
  handlePadGridMouseDown,
  handlePadGridMouseUp,
  handlePadGridMouseLeave,
  handlePadGridTouchStart,
  handlePadGridTouchEnd,
  handlePadGridContextMenu,
  loadCrateToDeck,
  selectedEditSlotId,
  setActiveEqSlotId,
  padDomRefsB,
  padDomRefsA,
  handleRevBadgeClick,
  handleLoopBadgeClick,
  handleTriggerModeBadgeClick,
  deckBSoloActive,
  setDeckBSoloActive,
  deckASoloActive,
  setDeckASoloActive,
  stopPerfVoice,
  setDeckBPlaying,
  setDeckAPlaying,
  deckBPlayBtnRef,
  deckAPlayBtnRef,
  sampleSlotsRef,
  paramsRef,
  deckBPlayingRef,
  deckAPlayingRef,
  setHighwayEditMode,
  copySelectedPill,
  copiedPill,
  pasteSelectedPill,
  deckAEqHigh,
  setDeckAEqHigh,
  deckAEqMid,
  setDeckAEqMid,
  deckAEqLow,
  setDeckAEqLow,
  deckBEqHigh,
  setDeckBEqHigh,
  deckBEqMid,
  setDeckBEqMid,
  deckBEqLow,
  setDeckBEqLow,
  vuSegLRefsArr,
  vuSegRRefsArr,
  deckAVolFader,
  setDeckAVolFader,
  deckBVolFader,
  setDeckBVolFader,
  crossfaderVal,
  setCrossfaderVal,
  masterGainRef
}) {
    const beatsPerBar = parseInt(perfTimeSignature.split('/')[0]) || 4;
    let endBeat = 16.0;
    const setting = perfSeqLength || 'Auto';
    if (setting === 'Auto') {
      if (sortedPerfEventsRef.current.length > 0) {
        const lastEvent = sortedPerfEventsRef.current[sortedPerfEventsRef.current.length - 1];
        endBeat = Math.max(16, Math.ceil(lastEvent.beat / 4) * 4);
      }
    } else if (setting !== 'Infinite') {
      endBeat = parseFloat(setting) || 16.0;
    } else {
      endBeat = Infinity;
    }

    const lastEventBeat = perfEvents.length > 0 ? Math.max(...perfEvents.map(e => e.beat)) : 0;
    const gridLength = setting === 'Infinite'
      ? Math.max(256, Math.ceil((lastEventBeat + 32) / 16) * 16)
      : endBeat;

    const numBars = Math.ceil(gridLength / beatsPerBar);
    const barIndices = Array.from({ length: numBars }, (_, i) => i);
    const gridBeats = Array.from({ length: Math.floor(gridLength) + 1 }, (_, i) => i);

    const getPillsForLane = (deck, index) => {
      const pills = [];
      const events = perfEvents.filter(e => e.deck === deck && (e.type === 'slot' || e.type === 'slice') && e.index === index);
      const sorted = [...events].sort((a, b) => a.beat - b.beat);
      
      let activePill = null;
      sorted.forEach(e => {
        if (e.isNoteOn) {
          if (activePill) {
            activePill.end = e.beat;
            pills.push(activePill);
          }
          activePill = { start: e.beat, end: null, triggerMode: e.triggerMode || 'hold', type: e.type, sliceIdx: e.sliceIdx };
        } else {
          if (activePill) {
            activePill.end = e.beat;
            pills.push(activePill);
            activePill = null;
          }
        }
      });
      if (activePill) {
        let endBeat = 16.0;
        const setting = perfSeqLengthRef.current || 'Auto';
        if (setting === 'Auto') {
          if (sortedPerfEventsRef.current.length > 0) {
            const lastEvent = sortedPerfEventsRef.current[sortedPerfEventsRef.current.length - 1];
            endBeat = Math.max(16, Math.ceil(lastEvent.beat / 4) * 4);
          }
        } else if (setting !== 'Infinite') {
          endBeat = parseFloat(setting) || 16.0;
        } else {
          endBeat = Math.max(32.0, activePill.start + 16.0);
        }
        activePill.end = endBeat;
        pills.push(activePill);
      }
      return pills;
    };

    const highwayA_JSX = useMemo(() => {
      return (
        <div className="highway-block-container">
          <div 
            className="vertical-highway deck-a-highway"
            onMouseDown={(e) => handleHighwayMouseDown('A', e)}
            onMouseMove={handleHighwayMouseMove}
            onMouseUp={handleHighwayMouseUp}
            onMouseLeave={handleHighwayMouseUp}
            style={{ cursor: highwayEditMode === 'perform' ? 'default' : highwayEditMode === 'draw' ? 'crosshair' : highwayEditMode === 'resize' ? 'ns-resize' : 'pointer' }}
          >
            {EIGHT_INDICES.map((_, idx) => (
              <div 
                key={`line-a-${idx}`} 
                className="highway-lane-line" 
                style={{ left: `${(idx + 0.5) * 28}px` }} 
              />
            ))}
            <div className="highway-playhead-line" style={{ bottom: '12px' }} />
            {EIGHT_INDICES.map((_, idx) => (
              <div 
                key={`target-a-${idx}`} 
                ref={el => { targetCirclesRefsA.current[idx] = el; }}
                className="highway-target-circle" 
                style={{ 
                  left: `${idx * 28 + 10}px`, 
                  bottom: '8px',
                  borderColor: ringColors[idx],
                  background: 'transparent',
                  boxShadow: 'none'
                }} 
              />
            ))}
            <div 
              ref={highwayEventsRefA} 
              className="highway-events-container"
              style={{ bottom: '12px' }}
            >
              {/* Alternating shaded bars */}
              {barIndices.map((i) => {
                const startBeat = i * beatsPerBar;
                const startY = startBeat * highwayZoom;
                const barHeight = beatsPerBar * highwayZoom;
                return (
                  <div 
                    key={`bar-shading-a-${i}`}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: `${startY}px`,
                      height: `${barHeight}px`,
                      background: i % 2 === 1 ? 'rgba(0, 243, 255, 0.02)' : 'rgba(0, 0, 0, 0.25)',
                      borderTop: i > 0 ? '1px solid rgba(0, 243, 255, 0.06)' : 'none',
                      pointerEvents: 'none',
                      zIndex: 0
                    }}
                  />
                );
              })}

              {/* Horizontal Grid lines (Tronesque Cyan) */}
              {gridBeats.map((b) => {
                const isBarStart = b % beatsPerBar === 0;
                const barNum = Math.floor(b / beatsPerBar) + 1;
                const beatInBar = (b % beatsPerBar) + 1;
                const startY = b * highwayZoom;
                
                return (
                  <div 
                    key={`grid-line-a-${b}`}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: `${startY}px`,
                      height: '1px',
                      background: isBarStart 
                        ? 'rgba(0, 243, 255, 0.65)' 
                        : 'rgba(0, 243, 255, 0.25)',
                      boxShadow: isBarStart
                        ? '0 0 6px rgba(0, 243, 255, 0.4)'
                        : 'none',
                      pointerEvents: 'none',
                      zIndex: 1
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
              {EIGHT_INDICES.map((_, laneIdx) => {
                const pills = getPillsForLane('A', laneIdx);
                const color = ringColors[laneIdx];
                return (
                  <div 
                    key={`hw-lane-a-${laneIdx}`} 
                    style={{ position: 'absolute', left: `${laneIdx * 28}px`, width: '28px', top: 0, bottom: 0, zIndex: 2 }}
                  >
                    {/* Dynamic lane highlight background */}
                    <div
                      ref={el => { laneBgsRefsA.current[laneIdx] = el; }}
                      style={{
                        position: 'absolute',
                        left: '2px',
                        right: '2px',
                        top: 0,
                        bottom: 0,
                        background: 'transparent',
                        pointerEvents: 'none',
                        transition: 'background 0.15s, opacity 0.15s',
                        zIndex: 0
                      }}
                    />
                    {pills.map((pill, pIdx) => {
                      const startY = pill.start * highwayZoom;
                      const endY = pill.end * highwayZoom;
                      const height = endY - startY;
                      
                      const mode = pill.triggerMode || 'hold';
                      const isSelected = selectedPill && 
                                         selectedPill.deck === 'A' && 
                                         selectedPill.laneIdx === laneIdx && 
                                         Math.abs(selectedPill.start - pill.start) < 0.001;

                      let pillColor = isSelected ? '#ffffff' : color;
                      let pillGlowColor = isSelected ? '#ffe600' : color;
                      let borderStyle = 'solid';
                      let background = '#000000';
                      let borderWidth = isSelected ? '2.5px' : '1.5px';
                      let glowScale = isSelected ? '14px' : '8px';
                      
                      if (!isSelected) {
                        if (mode === 'latch') {
                          background = color + '2a'; // glowy semi-transparent filled block
                          borderWidth = '2px';
                          glowScale = '12px';
                        } else if (mode === 'free') {
                          borderStyle = 'dashed';
                        } else if (mode === 'flux') {
                          borderStyle = 'double';
                          borderWidth = '3px';
                        } else if (mode === 'queue') {
                          borderStyle = 'dotted';
                          borderWidth = '2px';
                        }
                      } else {
                        background = 'rgba(255, 230, 0, 0.25)';
                      }
                      
                      return (
                        <div
                          key={`hw-pill-a-${laneIdx}-${pIdx}`}
                          style={{
                            position: 'absolute',
                            left: '3px',
                            width: '22px',
                            bottom: `${startY}px`,
                            height: `${Math.max(6, height)}px`,
                            background,
                            borderRadius: '3px',
                            border: `${borderWidth} ${borderStyle} ${pillColor}`,
                            boxShadow: `0 0 ${glowScale} ${pillGlowColor}, inset 0 0 ${glowScale} ${pillGlowColor}`,
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}
                        >
                          {pill.type === 'slice' && (
                            <span style={{ fontSize: '7px', color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}>
                              S{pill.sliceIdx !== undefined ? pill.sliceIdx : ''}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mixing controls row */}
          <div className="highway-mixing-row deck-a-mixing-row">
            {EIGHT_INDICES.map((_, idx) => {
              const slotId = `a0${idx + 1}`;
              const slot = sampleSlots.find(s => s.id === slotId);
              const isLoaded = slot && slot.buffer;
              const ringColor = ringColors[idx];
              
              if (!isLoaded) {
                return (
                  <div key={`ctrl-a-${idx}`} className="highway-mixing-col" style={{ left: `${idx * 28}px` }}>
                    <div className="highway-mix-label" style={{ color: 'rgba(255,255,255,0.15)' }}>A{idx + 1}</div>
                  </div>
                );
              }
              
              const vol = slot.volume !== undefined ? slot.volume : 1.0;
              const pan = slot.pan !== undefined ? slot.pan : 0.0;
              
              return (
                <div key={`ctrl-a-${idx}`} className="highway-mixing-col" style={{ left: `${idx * 28}px` }}>
                  {/* Volume slider (Vertical) */}
                  <input 
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.05"
                    value={vol}
                    title={`A${idx+1} Vol: ${Math.round(vol * 100)}%`}
                    onMouseDown={stopProp}
                    onMouseUp={stopProp}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateSlotParam(slotId, 'volume', val);
                      saveSlotMetadataToDb(slotId, { volume: val }).catch(() => {});
                    }}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '8px',
                      width: '8px',
                      height: '32px',
                      WebkitAppearance: 'slider-vertical',
                      appearance: 'slider-vertical',
                      background: 'rgba(255,255,255,0.15)',
                      accentColor: ringColor,
                      cursor: 'ns-resize',
                      outline: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0
                    }}
                  />
                  {/* Pan slider (Horizontal) */}
                  <input 
                    type="range"
                    min="-1.0"
                    max="1.0"
                    step="0.1"
                    value={pan}
                    title={`A${idx+1} Pan: ${pan === 0 ? 'C' : pan > 0 ? 'R' + Math.round(pan*100) : 'L' + Math.abs(Math.round(pan*100))}`}
                    onMouseDown={stopProp}
                    onMouseUp={stopProp}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateSlotParam(slotId, 'pan', val);
                      saveSlotMetadataToDb(slotId, { pan: val }).catch(() => {});
                    }}
                    onDoubleClick={() => {
                      updateSlotParam(slotId, 'pan', 0.0);
                      saveSlotMetadataToDb(slotId, { pan: 0.0 }).catch(() => {});
                    }}
                    style={{
                      position: 'absolute',
                      left: '3px',
                      top: '46px',
                      width: '22px',
                      height: '6px',
                      background: 'rgba(255,255,255,0.15)',
                      accentColor: ringColor,
                      cursor: 'ew-resize',
                      outline: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0
                    }}
                  />
                  {/* Label */}
                  <div className="highway-mix-label" style={{ color: ringColor }}>A{idx + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }, [perfEvents, highwayZoom, perfTimeSignature, perfSeqLength, highwayEditMode, resizeDragTarget, selectedPill, sampleSlots]);

    const highwayB_JSX = useMemo(() => {
      return (
        <div className="highway-block-container">
          <div 
            className="vertical-highway deck-b-highway"
            onMouseDown={(e) => handleHighwayMouseDown('B', e)}
            onMouseMove={handleHighwayMouseMove}
            onMouseUp={handleHighwayMouseUp}
            onMouseLeave={handleHighwayMouseUp}
            style={{ cursor: highwayEditMode === 'perform' ? 'default' : highwayEditMode === 'draw' ? 'crosshair' : highwayEditMode === 'resize' ? 'ns-resize' : 'pointer' }}
          >
            {EIGHT_INDICES.map((_, idx) => (
              <div 
                key={`line-b-${idx}`} 
                className="highway-lane-line" 
                style={{ left: `${(idx + 0.5) * 28}px` }} 
              />
            ))}
            <div className="highway-playhead-line" style={{ bottom: '12px' }} />
            {EIGHT_INDICES.map((_, idx) => (
              <div 
                key={`target-b-${idx}`} 
                ref={el => { targetCirclesRefsB.current[idx] = el; }}
                className="highway-target-circle" 
                style={{ 
                  left: `${idx * 28 + 10}px`, 
                  bottom: '8px',
                  borderColor: ringColors[idx],
                  background: 'transparent',
                  boxShadow: 'none'
                }} 
              />
            ))}
            <div 
              ref={highwayEventsRefB} 
              className="highway-events-container"
              style={{ bottom: '12px' }}
            >
              {/* Alternating shaded bars */}
              {barIndices.map((i) => {
                const startBeat = i * beatsPerBar;
                const startY = startBeat * highwayZoom;
                const barHeight = beatsPerBar * highwayZoom;
                return (
                  <div 
                    key={`bar-shading-b-${i}`}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: `${startY}px`,
                      height: `${barHeight}px`,
                      background: i % 2 === 1 ? 'rgba(0, 243, 255, 0.02)' : 'rgba(0, 0, 0, 0.25)',
                      borderTop: i > 0 ? '1px solid rgba(0, 243, 255, 0.06)' : 'none',
                      pointerEvents: 'none',
                      zIndex: 0
                    }}
                  />
                );
              })}

              {/* Horizontal Grid lines (Tronesque Cyan) */}
              {gridBeats.map((b) => {
                const isBarStart = b % beatsPerBar === 0;
                const barNum = Math.floor(b / beatsPerBar) + 1;
                const beatInBar = (b % beatsPerBar) + 1;
                const startY = b * highwayZoom;
                
                return (
                  <div 
                    key={`grid-line-b-${b}`}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: `${startY}px`,
                      height: '1px',
                      background: isBarStart 
                        ? 'rgba(0, 243, 255, 0.65)' 
                        : 'rgba(0, 243, 255, 0.25)',
                      boxShadow: isBarStart
                        ? '0 0 6px rgba(0, 243, 255, 0.4)'
                        : 'none',
                      pointerEvents: 'none',
                      zIndex: 1
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
              {EIGHT_INDICES.map((_, laneIdx) => {
                const pills = getPillsForLane('B', laneIdx);
                const color = ringColors[laneIdx];
                return (
                  <div 
                    key={`hw-lane-b-${laneIdx}`} 
                    style={{ position: 'absolute', left: `${laneIdx * 28}px`, width: '28px', top: 0, bottom: 0, zIndex: 2 }}
                  >
                    {/* Dynamic lane highlight background */}
                    <div
                      ref={el => { laneBgsRefsB.current[laneIdx] = el; }}
                      style={{
                        position: 'absolute',
                        left: '2px',
                        right: '2px',
                        top: 0,
                        bottom: 0,
                        background: 'transparent',
                        pointerEvents: 'none',
                        transition: 'background 0.15s, opacity 0.15s',
                        zIndex: 0
                      }}
                    />
                    {pills.map((pill, pIdx) => {
                      const startY = pill.start * highwayZoom;
                      const endY = pill.end * highwayZoom;
                      const height = endY - startY;
                      
                      const mode = pill.triggerMode || 'hold';
                      const isSelected = selectedPill && 
                                         selectedPill.deck === 'B' && 
                                         selectedPill.laneIdx === laneIdx && 
                                         Math.abs(selectedPill.start - pill.start) < 0.001;

                      let pillColor = isSelected ? '#ffffff' : color;
                      let pillGlowColor = isSelected ? '#ffe600' : color;
                      let borderStyle = 'solid';
                      let background = '#000000';
                      let borderWidth = isSelected ? '2.5px' : '1.5px';
                      let glowScale = isSelected ? '14px' : '8px';
                      
                      if (!isSelected) {
                        if (mode === 'latch') {
                          background = color + '2a'; // glowy semi-transparent filled block
                          borderWidth = '2px';
                          glowScale = '12px';
                        } else if (mode === 'free') {
                          borderStyle = 'dashed';
                        } else if (mode === 'flux') {
                          borderStyle = 'double';
                          borderWidth = '3px';
                        } else if (mode === 'queue') {
                          borderStyle = 'dotted';
                          borderWidth = '2px';
                        }
                      } else {
                        background = 'rgba(255, 230, 0, 0.25)';
                      }
                      
                      return (
                        <div
                          key={`hw-pill-b-${laneIdx}-${pIdx}`}
                          style={{
                            position: 'absolute',
                            left: '3px',
                            width: '22px',
                            bottom: `${startY}px`,
                            height: `${Math.max(6, height)}px`,
                            background,
                            borderRadius: '3px',
                            border: `${borderWidth} ${borderStyle} ${pillColor}`,
                            boxShadow: `0 0 ${glowScale} ${pillGlowColor}, inset 0 0 ${glowScale} ${pillGlowColor}`,
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}
                        >
                          {pill.type === 'slice' && (
                            <span style={{ fontSize: '7px', color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}>
                              S{pill.sliceIdx !== undefined ? pill.sliceIdx : ''}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mixing controls row */}
          <div className="highway-mixing-row deck-b-mixing-row">
            {EIGHT_INDICES.map((_, idx) => {
              const slotId = `b0${idx + 1}`;
              const slot = sampleSlots.find(s => s.id === slotId);
              const isLoaded = slot && slot.buffer;
              const ringColor = ringColors[idx];
              
              if (!isLoaded) {
                return (
                  <div key={`ctrl-b-${idx}`} className="highway-mixing-col" style={{ left: `${idx * 28}px` }}>
                    <div className="highway-mix-label" style={{ color: 'rgba(255,255,255,0.15)' }}>B{idx + 1}</div>
                  </div>
                );
              }
              
              const vol = slot.volume !== undefined ? slot.volume : 1.0;
              const pan = slot.pan !== undefined ? slot.pan : 0.0;
              
              return (
                <div key={`ctrl-b-${idx}`} className="highway-mixing-col" style={{ left: `${idx * 28}px` }}>
                  {/* Volume slider (Vertical) */}
                  <input 
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.05"
                    value={vol}
                    title={`B${idx+1} Vol: ${Math.round(vol * 100)}%`}
                    onMouseDown={stopProp}
                    onMouseUp={stopProp}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateSlotParam(slotId, 'volume', val);
                      saveSlotMetadataToDb(slotId, { volume: val }).catch(() => {});
                    }}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '8px',
                      width: '8px',
                      height: '32px',
                      WebkitAppearance: 'slider-vertical',
                      appearance: 'slider-vertical',
                      background: 'rgba(255,255,255,0.15)',
                      accentColor: ringColor,
                      cursor: 'ns-resize',
                      outline: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0
                    }}
                  />
                  {/* Pan slider (Horizontal) */}
                  <input 
                    type="range"
                    min="-1.0"
                    max="1.0"
                    step="0.1"
                    value={pan}
                    title={`B${idx+1} Pan: ${pan === 0 ? 'C' : pan > 0 ? 'R' + Math.round(pan*100) : 'L' + Math.abs(Math.round(pan*100))}`}
                    onMouseDown={stopProp}
                    onMouseUp={stopProp}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateSlotParam(slotId, 'pan', val);
                      saveSlotMetadataToDb(slotId, { pan: val }).catch(() => {});
                    }}
                    onDoubleClick={() => {
                      updateSlotParam(slotId, 'pan', 0.0);
                      saveSlotMetadataToDb(slotId, { pan: 0.0 }).catch(() => {});
                    }}
                    style={{
                      position: 'absolute',
                      left: '3px',
                      top: '46px',
                      width: '22px',
                      height: '6px',
                      background: 'rgba(255,255,255,0.15)',
                      accentColor: ringColor,
                      cursor: 'ew-resize',
                      outline: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0
                    }}
                  />
                  {/* Label */}
                  <div className="highway-mix-label" style={{ color: ringColor }}>B{idx + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }, [perfEvents, highwayZoom, perfTimeSignature, perfSeqLength, highwayEditMode, resizeDragTarget, selectedPill, sampleSlots]);

    return (
      <div className="deck-layout-wrapper">
        {/* TOP ROW: DECKS & MIXER */}
        <div className="deck-grid-layout">
        
        {/* LEFT DECK (DECK A) */}
        <div className="turntable-deck">
          <div className="deck-header-label">
            <span className="deck-title-text deck-title-text-a">
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

              {/* GPU-Accelerated Concentric Playhead Rings Container */}
              <div 
                ref={ringsContainerRefA} 
                style={{ position: 'absolute', top: 0, left: 0, width: '250px', height: '250px', pointerEvents: 'auto', cursor: 'pointer', zIndex: 3 }}
                onClick={(e) => handlePlatterClick('A', e)}
                onMouseMove={(e) => handleRingsMouseMove('A', e)}
                onMouseLeave={() => handleRingsMouseLeave('A')}
              />

              {/* Central display Hub SVG (Stationary Overlay) */}
              <svg 
                width="250" 
                height="250" 
                viewBox="0 0 250 250" 
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 4 }}
              >
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
                  {slotMap.get(params.oscAWave)?.name.substring(0, 6).toUpperCase() || 'EMPTY'}
                </text>
              </svg>
              
              {/* Momentary Stutter Button for Deck A */}
              <button
                className={`momentary-stutter-btn ${params.stutterAOn ? 'active' : ''}`}
                onMouseDown={(e) => { e.stopPropagation(); triggerStutterDeck(true); setParams(prev => ({ ...prev, stutterAOn: true })); }}
                onMouseUp={(e) => { e.stopPropagation(); releaseStutterDeck(true); setParams(prev => ({ ...prev, stutterAOn: false })); }}
                onMouseLeave={(e) => { e.stopPropagation(); releaseStutterDeck(true); setParams(prev => ({ ...prev, stutterAOn: false })); }}
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerStutterDeck(true); setParams(prev => ({ ...prev, stutterAOn: true })); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); releaseStutterDeck(true); setParams(prev => ({ ...prev, stutterAOn: false })); }}
                style={{
                  position: 'absolute',
                  left: '8px',
                  bottom: '8px',
                  zIndex: 15,
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: params.stutterAOn ? 'radial-gradient(circle, #00f3ff 0%, #006688 100%)' : 'radial-gradient(circle, #041620 0%, #010910 100%)',
                  border: params.stutterAOn ? '2px solid #00f3ff' : '1px solid rgba(0, 243, 255, 0.4)',
                  boxShadow: params.stutterAOn 
                    ? '0 0 15px rgba(0, 243, 255, 0.8), inset 0 0 8px rgba(255,255,255,0.4)' 
                    : '0 4px 6px rgba(0,0,0,0.6), 0 0 4px rgba(0, 243, 255, 0.1)',
                  color: params.stutterAOn ? '#fff' : '#00f3ff',
                  textShadow: params.stutterAOn ? '0 0 5px #fff' : '0 0 3px rgba(0, 243, 255, 0.5)',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  fontSize: '0.42rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  lineHeight: '1.1',
                  pointerEvents: 'auto',
                  transition: 'all 0.1s ease',
                  userSelect: 'none'
                }}
                title="Momentary Stutter Fill (Deck A) - Press & Hold"
              >
                <span style={{ fontSize: '0.3rem', opacity: 0.7, fontWeight: 'normal' }}>MOMENT</span>
                <span>STUTTER</span>
              </button>
            </div>

            {/* Granular Time-Stretcher and Key-Lock Controls */}
            <div className="deck-row" style={{ 
              width: '100%', 
              marginTop: '4px', 
              marginBottom: '4px',
              padding: '4px 6px', 
              background: 'rgba(0,0,0,0.4)', 
              borderRadius: '4px', 
              border: '1px solid rgba(0, 243, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              boxSizing: 'border-box'
            }}>
              {/* Key Lock Button */}
              <button
                className="deck-btn-xs"
                onClick={() => {
                  const nextLock = !deckAKeyLock;
                  setDeckAKeyLock(nextLock);
                  showEditorStatus(`Deck A Key Lock: ${nextLock ? 'ON' : 'OFF'} 🔒`);
                }}
                style={{
                  fontSize: '0.45rem',
                  padding: '2px 4px',
                  height: '22px',
                  background: deckAKeyLock ? '#00f3ff' : 'rgba(0, 243, 255, 0.05)',
                  color: deckAKeyLock ? '#000' : '#00f3ff',
                  border: '1px solid rgba(0, 243, 255, 0.3)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: deckAKeyLock ? '0 0 6px #00f3ff' : 'none',
                  flexShrink: 0,
                  transition: 'all 0.1s ease'
                }}
                title="Toggle Key Lock (Pitch Lock)"
              >
                KEY LOCK
              </button>

              {/* Pitch Fader */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.36rem', color: '#666', fontFamily: 'monospace' }}>
                  <span>PITCH</span>
                  <span style={{ color: '#00f3ff' }}>{deckAPitch > 0 ? `+${Math.round(deckAPitch)}` : Math.round(deckAPitch)}%</span>
                </div>
                <input 
                  type="range" min="-100" max="100" step="1" 
                  value={deckAPitch} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDeckAPitch(val);
                  }}
                  style={{
                    width: '100%',
                    height: '4px',
                    margin: '3px 0',
                    cursor: 'pointer',
                    accentColor: '#00f3ff'
                  }}
                />
              </div>

              {/* Stretch Fader */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.36rem', color: '#666', fontFamily: 'monospace' }}>
                  <span>STRETCH</span>
                  <span style={{ color: '#00f3ff' }}>{deckAStretch.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" min="0.25" max="4.0" step="0.05" 
                  value={deckAStretch} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDeckAStretch(val);
                  }}
                  style={{
                    width: '100%',
                    height: '4px',
                    margin: '3px 0',
                    cursor: 'pointer',
                    accentColor: '#00f3ff'
                  }}
                />
              </div>
            </div>

            {/* 2 Rows of 4 Pads (2x4 Grid) for Deck A */}
            <div className={`performance-pads-grid-2x4 ${dragOverDeck === 'A' ? 'drag-over-active-A' : ''}`}
              onMouseDown={handlePadGridMouseDown}
              onMouseUp={handlePadGridMouseUp}
              onMouseLeave={handlePadGridMouseLeave}
              onTouchStart={handlePadGridTouchStart}
              onTouchEnd={handlePadGridTouchEnd}
              onContextMenu={handlePadGridContextMenu}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverDeck('A');
              }}
              onDragLeave={() => setDragOverDeck(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverDeck(null);
                const crateId = e.dataTransfer.getData('text/plain');
                if (crateId && crateId.startsWith('crate_')) {
                  const crateIdx = parseInt(crateId.split('_')[1], 10);
                  loadCrateToDeck(crateIdx, 'A');
                }
              }}
            >
              {EIGHT_INDICES.map((_, idx) => {
                const slotId = `a0${idx + 1}`;
                const slot = slotMap.get(slotId);
                const isLoaded = slot && slot.buffer;
                
                const fxType = slot?.fxType || 'None';
                const fxSend = slot?.fxSend !== undefined ? slot.fxSend : 0.0;
                const pan = slot?.pan !== undefined ? slot.pan : 0.0;

                const ringColor = ringColors[idx];
                const padKey = `A-slot-${idx}`;

                const isSelected = selectedEditSlotId === slotId;
                return (
                  <div
                    key={slotId}
                    className={`perf-pad ${isSelected ? 'selected' : ''}`}
                    ref={(el) => { if (el) padDomRefsA.current[idx] = el; }}
                    data-deck="A"
                    data-idx={idx}
                    data-active="false"
                    data-pending="false"
                    data-loaded={isLoaded ? 'true' : 'false'}
                    data-macro-mapped={macroAssignMode && macros.find(m => m.id === macroAssignMode)?.activePads[padKey] ? 'true' : 'false'}
                    style={{ '--pad-color': ringColor }}
                    title={isLoaded ? `${slot.name} (Right-click to route)` : 'Empty Slot'}
                  >
                    <span className="perf-pad-label">A{idx + 1}</span>
                    <span className="perf-pad-name">{isLoaded ? slot.name.substring(0, 8) : '---'}</span>
                    
                    {/* Visual badges for FX and Pan */}
                    {isLoaded && (
                      <div className="perf-pad-routing-badges">
                        {slot.routeToXyPad === false && (
                          <span className="pad-badge-dry" title="Bypasses Delta XY Modulator">
                            BYP
                          </span>
                        )}
                        {fxType !== 'None' && (
                          <span className="pad-badge-fx" data-has-color="true" style={{ '--pad-color': ringColor }} title={`FX: ${fxType}${fxType !== 'Stutter' ? ` (${Math.round(fxSend * 100)}%)` : ''}`}>
                            {fxType === 'Space Echo' ? 'DLY' : fxType === 'Rotor Cabinet' ? 'ROT' : fxType === 'Stutter' ? 'STU' : 'RVB'}{fxType !== 'Stutter' ? `: ${Math.round(fxSend * 100)}%` : ''}
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
                        className="perf-pad-eq-badge"
                        data-active={slot.eq && slot.eq.enabled ? 'true' : 'false'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEditSlotId(slotId);
                          setActiveEqSlotId(slotId);
                        }}
                        onMouseDown={stopProp}
                        onMouseUp={stopProp}
                        onTouchStart={stopProp}
                        onTouchEnd={stopProp}
                      >
                        EQ
                      </button>
                    )}

                    {isLoaded && (
                      <button
                        className="perf-pad-rev-badge"
                        data-active={slot.reverseOn ? 'true' : 'false'}
                        onClick={handleRevBadgeClick}
                        onMouseDown={stopProp}
                        onMouseUp={stopProp}
                        onTouchStart={stopProp}
                        onTouchEnd={stopProp}
                      >
                        {slot.reverseOn ? 'REV' : 'FWD'}
                      </button>
                    )}

                    {isLoaded && (
                      <button
                        className="perf-pad-loop-badge"
                        data-active={slot.loopOn ? 'true' : 'false'}
                        style={{ '--pad-color': ringColor }}
                        onClick={handleLoopBadgeClick}
                        onMouseDown={stopProp}
                        onMouseUp={stopProp}
                        onTouchStart={stopProp}
                        onTouchEnd={stopProp}
                      >
                        {slot.loopOn ? 'LOOP' : '1-SHOT'}
                      </button>
                    )}
                    {isLoaded && (
                      <button
                        className="perf-pad-trigger-mode-badge"
                        data-mode={slot.triggerMode || 'hold'}
                        onClick={handleTriggerModeBadgeClick}
                        onMouseDown={stopProp}
                        onMouseUp={stopProp}
                        onTouchStart={stopProp}
                        onTouchEnd={stopProp}
                        title={`Trigger Mode: ${(slot.triggerMode || 'hold').toUpperCase()} (Click to toggle)`}
                      >
                        {(slot.triggerMode || 'hold').substring(0, 3).toUpperCase()}
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
                <MidiBadge paramKey="deckASolo" style={{ fontSize: '0.28rem', padding: '0px 1px', marginLeft: '2px' }} />
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
                className="deck-btn deck-btn-play"
                ref={deckAPlayBtnRef}
                onClick={() => {
                  const activeAIdx = sampleSlotsRef.current.findIndex(s => s.id === paramsRef.current.oscAWave);
                  const idx = activeAIdx >= 0 ? activeAIdx : 0;
                  triggerPerfPadInternal('A', 'slot', idx, 100, !deckAPlayingRef.current, false);
                }}
              >
                Play
              </button>
            </div>

            {/* Performance Sequencer Transport controls for Deck A */}
            <div className="deck-row" style={{ width: '280px', margin: '4px auto 2px auto', display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '3px 6px', borderRadius: '4px', border: '1px solid rgba(0, 243, 255, 0.2)' }}>
              <span style={{ fontSize: '0.45rem', color: '#00f3ff', fontFamily: 'monospace', fontWeight: 'bold', marginRight: 'auto', letterSpacing: '0.5px' }}>SEQ:</span>
              <button
                className="deck-btn-xs"
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
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: 'rgba(0, 243, 255, 0.05)', 
                  color: '#00f3ff', 
                  border: '1px solid rgba(0, 243, 255, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer' 
                }}
                title="Rewind 4 beats"
              >
                REW
              </button>
              <button
                className="deck-btn-xs"
                onClick={stopPerformancePlayback}
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: 'rgba(255, 68, 68, 0.05)', 
                  color: '#ff4444', 
                  border: '1px solid rgba(255, 68, 68, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer' 
                }}
                title="Stop and Reset Performance"
              >
                Stop
              </button>
              <button
                className={`deck-btn-xs ${perfPlaybackActive ? 'active' : ''}`}
                onClick={togglePerformancePlayback}
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: perfPlaybackActive ? '#00f3ff' : 'rgba(0, 243, 255, 0.05)', 
                  color: perfPlaybackActive ? '#000' : '#00f3ff', 
                  border: '1px solid rgba(0, 243, 255, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer',
                  boxShadow: perfPlaybackActive ? '0 0 6px #00f3ff' : 'none'
                }}
                title={perfPlaybackActive ? "Pause Performance" : "Play Performance"}
              >
                {perfPlaybackActive ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                className="deck-btn-xs"
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
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: 'rgba(0, 243, 255, 0.05)', 
                  color: '#00f3ff', 
                  border: '1px solid rgba(0, 243, 255, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer' 
                }}
                title="Forward 4 beats"
              >
                FWD
              </button>
              <button
                className={`deck-btn-xs ${perfRecordActive && !perfIsDubbing ? 'active' : ''}`}
                onClick={() => togglePerformanceRecord(false)}
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: perfRecordActive && !perfIsDubbing ? '#ff0055' : 'rgba(255, 0, 85, 0.05)', 
                  color: perfRecordActive && !perfIsDubbing ? '#000' : '#ff0055', 
                  border: '1px solid rgba(255, 0, 85, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer',
                  boxShadow: perfRecordActive && !perfIsDubbing ? '0 0 6px #ff0055' : 'none'
                }}
                title="Clean record live pad triggers (wipes previous notes)"
              >
                Rec
              </button>
              <button
                className={`deck-btn-xs ${perfRecordActive && perfIsDubbing ? 'active' : ''}`}
                onClick={() => togglePerformanceRecord(true)}
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: perfRecordActive && perfIsDubbing ? '#ff00ff' : 'rgba(255, 0, 255, 0.05)', 
                  color: perfRecordActive && perfIsDubbing ? '#000' : '#ff00ff', 
                  border: '1px solid rgba(255, 0, 255, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer',
                  boxShadow: perfRecordActive && perfIsDubbing ? '0 0 6px #ff00ff' : 'none'
                }}
                title="Overdub live pad triggers onto sequencer (retains previous notes)"
              >
                Dub
              </button>
            </div>

            {/* Highway Editor Controls for Deck A */}
            <div className="deck-row" style={{ width: '290px', margin: '4px auto 2px auto', display: 'flex', gap: '3px', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '3px 4px', borderRadius: '4px', border: '1px solid rgba(0, 243, 255, 0.15)' }}>
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
                  Play
                </button>
                <button
                  className={`deck-btn-xs ${highwayEditMode === 'select' ? 'active' : ''}`}
                  onClick={() => setHighwayEditMode('select')}
                  title="Select Mode (click notes to edit/move/copy/delete)"
                  style={{ 
                    fontSize: '0.42rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: highwayEditMode === 'select' ? 'rgba(255, 0, 255, 0.35)' : 'rgba(255,255,255,0.05)', 
                    color: highwayEditMode === 'select' ? '#ff00ff' : '#aaa',
                    border: `1px solid ${highwayEditMode === 'select' ? '#ff00ff' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Sel
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
                  Draw
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
                  Size
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
                  Del
                </button>
              </div>

              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {selectedPill && selectedPill.deck === 'A' ? (
                  <>
                    <button
                      className="deck-btn-xs"
                      onClick={copySelectedPill}
                      title="Copy selected note"
                      style={{ 
                        fontSize: '0.4rem', 
                        padding: '2px 3px', 
                        height: '16px', 
                        lineHeight: 1,
                        background: 'rgba(255, 230, 0, 0.25)',
                        color: '#ffe600',
                        border: '1px solid #ffe600',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                    >
                      Copy
                    </button>
                    {copiedPill && (
                      <button
                        className="deck-btn-xs"
                        onClick={() => pasteSelectedPill('A', selectedPill.laneIdx)}
                        title="Paste note at playhead"
                        style={{ 
                          fontSize: '0.4rem', 
                          padding: '2px 3px', 
                          height: '16px', 
                          lineHeight: 1,
                          background: 'rgba(0, 243, 255, 0.25)',
                          color: '#00f3ff',
                          border: '1px solid #00f3ff',
                          borderRadius: '2px',
                          cursor: 'pointer'
                        }}
                      >
                        Paste
                      </button>
                    )}
                    <button
                      className="deck-btn-xs"
                      onClick={deleteSelectedPill}
                      title="Delete selected note"
                      style={{ 
                        fontSize: '0.4rem', 
                        padding: '2px 3px', 
                        height: '16px', 
                        lineHeight: 1,
                        background: 'rgba(255, 0, 85, 0.25)',
                        color: '#ff0055',
                        border: '1px solid #ff0055',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                    >
                      Cut
                    </button>
                  </>
                ) : (
                  <>
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
                        opacity: highwayClipboard ? 1.0 : 0.4
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
                  </>
                )}
              </div>
            </div>

            {/* Vertical Highway for Deck A (sitting below Cue Play Sync row) */}
            {highwayA_JSX}
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
                <span className="mixer-fader-label">A<MidiBadge paramKey="deckAVolume" style={{ fontSize: '0.28rem', padding: '0px 1px', marginLeft: '2px' }} /></span>
                <input 
                  type="range" min="0.0" max="1.0" step="0.02" 
                  value={deckAVolFader} 
                  onChange={(e) => setDeckAVolFader(parseFloat(e.target.value))}
                  className="mixer-vol-slider"
                />
              </div>
              <div className="mixer-fader-wrapper">
                <span className="mixer-fader-label">B<MidiBadge paramKey="deckBVolume" style={{ fontSize: '0.28rem', padding: '0px 1px', marginLeft: '2px' }} /></span>
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
                <span className="crossfader-label" className="label-cyan">A</span>
                <span className="crossfader-label" style={{ fontSize: '0.38rem', color: '#666', letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
                  CROSSFADER
                  <MidiBadge paramKey="crossfader" style={{ fontSize: '0.28rem', padding: '0px 1px', marginLeft: '4px' }} />
                </span>
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
                label="Master"
                value={params.masterVolume}
                min={0} max={100} step={1} defaultValue={80}
                onChange={(v) => {
                  setParams(prev => ({ ...prev, masterVolume: Math.round(v) }));
                  if (masterGainRef.current) {
                    masterGainRef.current.gain.setTargetAtTime(v / 100 * 0.5, audioCtxRef.current?.currentTime || 0, 0.02);
                  }
                }}
                midiLearnParam={midiLearnParam}
                midiMappings={midiMappings}
                setMidiLearnParam={setMidiLearnParam}
                paramKey="masterVolume"
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
                {(parseFloat(params.arpBpm) || 120).toFixed(1)}
              </div>
            </div>

            {/* Tempo Speed Knob */}
            <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'center' }}>
              <Knob 
                label="Tempo"
                value={params.arpBpm || 120}
                min={40} max={250} step={0.1} defaultValue={120}
                onChange={(v) => setParams(prev => ({ ...prev, arpBpm: v }))}
                midiLearnParam={midiLearnParam}
                midiMappings={midiMappings}
                setMidiLearnParam={setMidiLearnParam}
                paramKey="tempo"
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
                    lineHeight: '15px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {metronomeOn ? 'ON' : 'OFF'}
                  <MidiBadge paramKey="metronomeToggle" style={{ fontSize: '0.28rem', padding: '0px 1px', marginLeft: '2px' }} />
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
                    onChange={(e) => {
                      setLiveRecTargetSlot(e.target.value);
                      setSelectedEditSlotId(e.target.value);
                    }}
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
                    {EIGHT_INDICES.map((_, i) => (
                      <option key={`a-${i}`} value={`a0${i+1}`}>A{i+1}</option>
                    ))}
                    {EIGHT_INDICES.map((_, i) => (
                      <option key={`b-${i}`} value={`b0${i+1}`}>B{i+1}</option>
                    ))}
                    {EIGHT_INDICES.map((_, i) => (
                      <option key={`c-${i}`} value={`c0${i+1}`}>C{i+1}</option>
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

              {/* Row 2: Arm & Live Record Buttons */}
              <div style={{ display: 'flex', width: '100%', gap: '4px' }}>
                <button
                  onClick={armLooperInput}
                  className={`deck-btn ${isArmed ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    padding: '3px 0',
                    fontSize: '0.44rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                    background: isArmed ? 'rgba(255, 230, 0, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${isArmed ? '#ffe600' : 'rgba(255,255,255,0.18)'}`,
                    color: isArmed ? '#ffe600' : '#8c9ba5',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {isArmed ? 'Disarm' : 'Arm In'}
                </button>
                <button
                  className={`deck-btn ${isLiveRecording ? 'active' : ''}`}
                  onClick={toggleLiveLoopRecording}
                  style={{
                    flex: 1.2,
                    padding: '3px 0',
                    fontSize: '0.44rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
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
                    : (liveRecPendingStart ? 'Pending...' : 'Live Rec')}
                </button>
              </div>

              {/* Row 3: Mini level meter */}
              <div style={{ width: '100%', marginTop: '2px' }}>
                <div className="mic-level-meter-container" style={{ padding: '1px 2px', height: '6px', background: 'rgba(0,0,0,0.4)', borderRadius: '2px' }}>
                  <div className="mic-level-bar-track" style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}>
                    <div id="looper-level-bar-fill-mini" className="mic-level-bar-fill" style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #00ff96 70%, #ffc000 85%, #ff0055 100%)', transition: 'width 0.05s ease' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT DECK (DECK B) */}
        <div className="turntable-deck" style={{ borderLeft: 'none' }}>
          <div className="deck-header-label">
            <span className="deck-title-text deck-title-text-b">
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

              {/* GPU-Accelerated Concentric Playhead Rings Container */}
              <div 
                ref={ringsContainerRefB} 
                style={{ position: 'absolute', top: 0, left: 0, width: '250px', height: '250px', pointerEvents: 'auto', cursor: 'pointer', zIndex: 3 }}
                onClick={(e) => handlePlatterClick('B', e)}
                onMouseMove={(e) => handleRingsMouseMove('B', e)}
                onMouseLeave={() => handleRingsMouseLeave('B')}
              />

              {/* Central display Hub SVG (Stationary Overlay) */}
              <svg 
                width="250" 
                height="250" 
                viewBox="0 0 250 250" 
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 4 }}
              >
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
                  {slotMap.get(params.oscBWave)?.name.substring(0, 6).toUpperCase() || 'EMPTY'}
                </text>
              </svg>
              
              {/* Momentary Stutter Button for Deck B */}
              <button
                className={`momentary-stutter-btn ${params.stutterBOn ? 'active' : ''}`}
                onMouseDown={(e) => { e.stopPropagation(); triggerStutterDeck(false); setParams(prev => ({ ...prev, stutterBOn: true })); }}
                onMouseUp={(e) => { e.stopPropagation(); releaseStutterDeck(false); setParams(prev => ({ ...prev, stutterBOn: false })); }}
                onMouseLeave={(e) => { e.stopPropagation(); releaseStutterDeck(false); setParams(prev => ({ ...prev, stutterBOn: false })); }}
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerStutterDeck(false); setParams(prev => ({ ...prev, stutterBOn: true })); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); releaseStutterDeck(false); setParams(prev => ({ ...prev, stutterBOn: false })); }}
                style={{
                  position: 'absolute',
                  left: '8px',
                  bottom: '8px',
                  zIndex: 15,
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: params.stutterBOn ? 'radial-gradient(circle, #ff00ff 0%, #880088 100%)' : 'radial-gradient(circle, #1e041a 0%, #09010a 100%)',
                  border: params.stutterBOn ? '2px solid #ff00ff' : '1px solid rgba(255, 0, 255, 0.4)',
                  boxShadow: params.stutterBOn 
                    ? '0 0 15px rgba(255, 0, 255, 0.8), inset 0 0 8px rgba(255,255,255,0.4)' 
                    : '0 4px 6px rgba(0,0,0,0.6), 0 0 4px rgba(255, 0, 255, 0.1)',
                  color: params.stutterBOn ? '#fff' : '#ff00ff',
                  textShadow: params.stutterBOn ? '0 0 5px #fff' : '0 0 3px rgba(255, 0, 255, 0.5)',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  fontSize: '0.42rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  lineHeight: '1.1',
                  pointerEvents: 'auto',
                  transition: 'all 0.1s ease',
                  userSelect: 'none'
                }}
                title="Momentary Stutter Fill (Deck B) - Press & Hold"
              >
                <span style={{ fontSize: '0.3rem', opacity: 0.7, fontWeight: 'normal' }}>MOMENT</span>
                <span>STUTTER</span>
              </button>
            </div>

            {/* Granular Time-Stretcher and Key-Lock Controls */}
            <div className="deck-row" style={{ 
              width: '100%', 
              marginTop: '4px', 
              marginBottom: '4px',
              padding: '4px 6px', 
              background: 'rgba(0,0,0,0.4)', 
              borderRadius: '4px', 
              border: '1px solid rgba(255, 0, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              boxSizing: 'border-box'
            }}>
              {/* Key Lock Button */}
              <button
                className="deck-btn-xs"
                onClick={() => {
                  const nextLock = !deckBKeyLock;
                  setDeckBKeyLock(nextLock);
                  showEditorStatus(`Deck B Key Lock: ${nextLock ? 'ON' : 'OFF'} 🔒`);
                }}
                style={{
                  fontSize: '0.45rem',
                  padding: '2px 4px',
                  height: '22px',
                  background: deckBKeyLock ? '#ff00ff' : 'rgba(255, 0, 255, 0.05)',
                  color: deckBKeyLock ? '#000' : '#ff00ff',
                  border: '1px solid rgba(255, 0, 255, 0.3)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: deckBKeyLock ? '0 0 6px #ff00ff' : 'none',
                  flexShrink: 0,
                  transition: 'all 0.1s ease'
                }}
                title="Toggle Key Lock (Pitch Lock)"
              >
                KEY LOCK
              </button>

              {/* Pitch Fader */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.36rem', color: '#666', fontFamily: 'monospace' }}>
                  <span>PITCH</span>
                  <span style={{ color: '#ff00ff' }}>{deckBPitch > 0 ? `+${Math.round(deckBPitch)}` : Math.round(deckBPitch)}%</span>
                </div>
                <input 
                  type="range" min="-100" max="100" step="1" 
                  value={deckBPitch} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDeckBPitch(val);
                  }}
                  style={{
                    width: '100%',
                    height: '4px',
                    margin: '3px 0',
                    cursor: 'pointer',
                    accentColor: '#ff00ff'
                  }}
                />
              </div>

              {/* Stretch Fader */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.36rem', color: '#666', fontFamily: 'monospace' }}>
                  <span>STRETCH</span>
                  <span style={{ color: '#ff00ff' }}>{deckBStretch.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" min="0.25" max="4.0" step="0.05" 
                  value={deckBStretch} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDeckBStretch(val);
                  }}
                  style={{
                    width: '100%',
                    height: '4px',
                    margin: '3px 0',
                    cursor: 'pointer',
                    accentColor: '#ff00ff'
                  }}
                />
              </div>
            </div>

            {/* 2 Rows of 4 Pads (2x4 Grid) for Deck B */}
            <div className={`performance-pads-grid-2x4 ${dragOverDeck === 'B' ? 'drag-over-active-B' : ''}`}
              onMouseDown={handlePadGridMouseDown}
              onMouseUp={handlePadGridMouseUp}
              onMouseLeave={handlePadGridMouseLeave}
              onTouchStart={handlePadGridTouchStart}
              onTouchEnd={handlePadGridTouchEnd}
              onContextMenu={handlePadGridContextMenu}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverDeck('B');
              }}
              onDragLeave={() => setDragOverDeck(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverDeck(null);
                const crateId = e.dataTransfer.getData('text/plain');
                if (crateId && crateId.startsWith('crate_')) {
                  const crateIdx = parseInt(crateId.split('_')[1], 10);
                  loadCrateToDeck(crateIdx, 'B');
                }
              }}
            >
              {EIGHT_INDICES.map((_, idx) => {
                const slotId = `b0${idx + 1}`;
                const slot = slotMap.get(slotId);
                const isLoaded = slot && slot.buffer;
                
                const fxType = slot?.fxType || 'None';
                const fxSend = slot?.fxSend !== undefined ? slot.fxSend : 0.0;
                const pan = slot?.pan !== undefined ? slot.pan : 0.0;

                const ringColor = ringColors[idx];
                const padKey = `B-slot-${idx}`;

                const isSelected = selectedEditSlotId === slotId;
                return (
                  <div
                    key={slotId}
                    className={`perf-pad ${isSelected ? 'selected' : ''}`}
                    ref={(el) => { if (el) padDomRefsB.current[idx] = el; }}
                    data-deck="B"
                    data-idx={idx}
                    data-active="false"
                    data-pending="false"
                    data-loaded={isLoaded ? 'true' : 'false'}
                    data-macro-mapped={macroAssignMode && macros.find(m => m.id === macroAssignMode)?.activePads[padKey] ? 'true' : 'false'}
                    style={{ '--pad-color': ringColor }}
                    title={isLoaded ? `${slot.name} (Right-click to route)` : 'Empty Slot'}
                  >
                    <span className="perf-pad-label">B{idx + 1}</span>
                    <span className="perf-pad-name">{isLoaded ? slot.name.substring(0, 8) : '---'}</span>
                    
                    {/* Visual badges for FX and Pan */}
                    {isLoaded && (
                      <div className="perf-pad-routing-badges">
                        {slot.routeToXyPad === false && (
                          <span className="pad-badge-dry" title="Bypasses Delta XY Modulator">
                            BYP
                          </span>
                        )}
                        {fxType !== 'None' && (
                          <span className="pad-badge-fx" data-has-color="true" style={{ '--pad-color': ringColor }} title={`FX: ${fxType}${fxType !== 'Stutter' ? ` (${Math.round(fxSend * 100)}%)` : ''}`}>
                            {fxType === 'Space Echo' ? 'DLY' : fxType === 'Rotor Cabinet' ? 'ROT' : fxType === 'Stutter' ? 'STU' : 'RVB'}{fxType !== 'Stutter' ? `: ${Math.round(fxSend * 100)}%` : ''}
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
                        className="perf-pad-eq-badge"
                        data-active={slot.eq && slot.eq.enabled ? 'true' : 'false'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEditSlotId(slotId);
                          setActiveEqSlotId(slotId);
                        }}
                        onMouseDown={stopProp}
                        onMouseUp={stopProp}
                        onTouchStart={stopProp}
                        onTouchEnd={stopProp}
                      >
                        EQ
                      </button>
                    )}

                    {isLoaded && (
                      <button
                        className="perf-pad-rev-badge"
                        data-active={slot.reverseOn ? 'true' : 'false'}
                        onClick={handleRevBadgeClick}
                        onMouseDown={stopProp}
                        onMouseUp={stopProp}
                        onTouchStart={stopProp}
                        onTouchEnd={stopProp}
                      >
                        {slot.reverseOn ? 'REV' : 'FWD'}
                      </button>
                    )}

                    {isLoaded && (
                      <button
                        className="perf-pad-loop-badge"
                        data-active={slot.loopOn ? 'true' : 'false'}
                        style={{ '--pad-color': ringColor }}
                        onClick={handleLoopBadgeClick}
                        onMouseDown={stopProp}
                        onMouseUp={stopProp}
                        onTouchStart={stopProp}
                        onTouchEnd={stopProp}
                      >
                        {slot.loopOn ? 'LOOP' : '1-SHOT'}
                      </button>
                    )}
                    {isLoaded && (
                      <button
                        className="perf-pad-trigger-mode-badge"
                        data-mode={slot.triggerMode || 'hold'}
                        onClick={handleTriggerModeBadgeClick}
                        onMouseDown={stopProp}
                        onMouseUp={stopProp}
                        onTouchStart={stopProp}
                        onTouchEnd={stopProp}
                        title={`Trigger Mode: ${(slot.triggerMode || 'hold').toUpperCase()} (Click to toggle)`}
                      >
                        {(slot.triggerMode || 'hold').substring(0, 3).toUpperCase()}
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
                <MidiBadge paramKey="deckBSolo" style={{ fontSize: '0.28rem', padding: '0px 1px', marginLeft: '2px' }} />
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
                className="deck-btn deck-btn-play"
                ref={deckBPlayBtnRef}
                onClick={() => {
                  const activeBIdx = sampleSlotsRef.current.findIndex(s => s.id === paramsRef.current.oscBWave);
                  const idx = activeBIdx >= 0 ? activeBIdx : 0;
                  triggerPerfPadInternal('B', 'slot', idx, 100, !deckBPlayingRef.current, false);
                }}
              >
                Play
              </button>
            </div>

            {/* Performance Sequencer Transport controls for Deck B */}
            <div className="deck-row" style={{ width: '280px', margin: '4px auto 2px auto', display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '3px 6px', borderRadius: '4px', border: '1px solid rgba(0, 243, 255, 0.2)' }}>
              <span style={{ fontSize: '0.45rem', color: '#00f3ff', fontFamily: 'monospace', fontWeight: 'bold', marginRight: 'auto', letterSpacing: '0.5px' }}>SEQ:</span>
              <button
                className="deck-btn-xs"
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
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: 'rgba(0, 243, 255, 0.05)', 
                  color: '#00f3ff', 
                  border: '1px solid rgba(0, 243, 255, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer' 
                }}
                title="Rewind 4 beats"
              >
                REW
              </button>
              <button
                className="deck-btn-xs"
                onClick={stopPerformancePlayback}
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: 'rgba(255, 68, 68, 0.05)', 
                  color: '#ff4444', 
                  border: '1px solid rgba(255, 68, 68, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer' 
                }}
                title="Stop and Reset Performance"
              >
                Stop
              </button>
              <button
                className={`deck-btn-xs ${perfPlaybackActive ? 'active' : ''}`}
                onClick={togglePerformancePlayback}
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: perfPlaybackActive ? '#00f3ff' : 'rgba(0, 243, 255, 0.05)', 
                  color: perfPlaybackActive ? '#000' : '#00f3ff', 
                  border: '1px solid rgba(0, 243, 255, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer',
                  boxShadow: perfPlaybackActive ? '0 0 6px #00f3ff' : 'none'
                }}
                title={perfPlaybackActive ? "Pause Performance" : "Play Performance"}
              >
                {perfPlaybackActive ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                className="deck-btn-xs"
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
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: 'rgba(0, 243, 255, 0.05)', 
                  color: '#00f3ff', 
                  border: '1px solid rgba(0, 243, 255, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer' 
                }}
                title="Forward 4 beats"
              >
                FWD
              </button>
              <button
                className={`deck-btn-xs ${perfRecordActive && !perfIsDubbing ? 'active' : ''}`}
                onClick={() => togglePerformanceRecord(false)}
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: perfRecordActive && !perfIsDubbing ? '#ff0055' : 'rgba(255, 0, 85, 0.05)', 
                  color: perfRecordActive && !perfIsDubbing ? '#000' : '#ff0055', 
                  border: '1px solid rgba(255, 0, 85, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer',
                  boxShadow: perfRecordActive && !perfIsDubbing ? '0 0 6px #ff0055' : 'none'
                }}
                title="Clean record live pad triggers (wipes previous notes)"
              >
                Rec
              </button>
              <button
                className={`deck-btn-xs ${perfRecordActive && perfIsDubbing ? 'active' : ''}`}
                onClick={() => togglePerformanceRecord(true)}
                style={{ 
                  fontSize: '0.45rem', 
                  padding: '2px 4px', 
                  height: '16px', 
                  background: perfRecordActive && perfIsDubbing ? '#ff00ff' : 'rgba(255, 0, 255, 0.05)', 
                  color: perfRecordActive && perfIsDubbing ? '#000' : '#ff00ff', 
                  border: '1px solid rgba(255, 0, 255, 0.3)', 
                  borderRadius: '2px', 
                  cursor: 'pointer',
                  boxShadow: perfRecordActive && perfIsDubbing ? '0 0 6px #ff00ff' : 'none'
                }}
                title="Overdub live pad triggers onto sequencer (retains previous notes)"
              >
                Dub
              </button>
            </div>

            {/* Highway Editor Controls for Deck B */}
            <div className="deck-row" style={{ width: '290px', margin: '4px auto 2px auto', display: 'flex', gap: '3px', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '3px 4px', borderRadius: '4px', border: '1px solid rgba(0, 243, 255, 0.15)' }}>
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
                  Play
                </button>
                <button
                  className={`deck-btn-xs ${highwayEditMode === 'select' ? 'active' : ''}`}
                  onClick={() => setHighwayEditMode('select')}
                  title="Select Mode (click notes to edit/move/copy/delete)"
                  style={{ 
                    fontSize: '0.42rem', 
                    padding: '2px 3px', 
                    height: '16px', 
                    lineHeight: 1,
                    background: highwayEditMode === 'select' ? 'rgba(255, 0, 255, 0.35)' : 'rgba(255,255,255,0.05)', 
                    color: highwayEditMode === 'select' ? '#ff00ff' : '#aaa',
                    border: `1px solid ${highwayEditMode === 'select' ? '#ff00ff' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Sel
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
                  Draw
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
                  Size
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
                  Del
                </button>
              </div>

              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {selectedPill && selectedPill.deck === 'B' ? (
                  <>
                    <button
                      className="deck-btn-xs"
                      onClick={copySelectedPill}
                      title="Copy selected note"
                      style={{ 
                        fontSize: '0.4rem', 
                        padding: '2px 3px', 
                        height: '16px', 
                        lineHeight: 1,
                        background: 'rgba(255, 230, 0, 0.25)',
                        color: '#ffe600',
                        border: '1px solid #ffe600',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                    >
                      Copy
                    </button>
                    {copiedPill && (
                      <button
                        className="deck-btn-xs"
                        onClick={() => pasteSelectedPill('B', selectedPill.laneIdx)}
                        title="Paste note at playhead"
                        style={{ 
                          fontSize: '0.4rem', 
                          padding: '2px 3px', 
                          height: '16px', 
                          lineHeight: 1,
                          background: 'rgba(0, 243, 255, 0.25)',
                          color: '#00f3ff',
                          border: '1px solid #00f3ff',
                          borderRadius: '2px',
                          cursor: 'pointer'
                        }}
                      >
                        Paste
                      </button>
                    )}
                    <button
                      className="deck-btn-xs"
                      onClick={deleteSelectedPill}
                      title="Delete selected note"
                      style={{ 
                        fontSize: '0.4rem', 
                        padding: '2px 3px', 
                        height: '16px', 
                        lineHeight: 1,
                        background: 'rgba(255, 0, 85, 0.25)',
                        color: '#ff0055',
                        border: '1px solid #ff0055',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                    >
                      Cut
                    </button>
                  </>
                ) : (
                  <>
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
                        opacity: highwayClipboard ? 1.0 : 0.4
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
                  </>
                )}
              </div>
            </div>

            {/* Vertical Highway for Deck B (sitting below Cue Play Sync row) */}
            {highwayB_JSX}
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

              {/* Digital Time display (Mins:Secs) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#000', border: '1px solid rgba(0, 243, 255, 0.3)', borderRadius: '3px', padding: '2px 6px', fontFamily: 'monospace' }}>
                <span style={{ fontSize: '0.48rem', color: '#888' }}>TIME:</span>
                <span ref={seqTimeDisplayRef} style={{ fontSize: '0.68rem', color: '#00f3ff', fontWeight: 'bold', minWidth: '48px', display: 'inline-block', textAlign: 'right' }}>00:00.0</span>
              </div>

              {/* Highway Zoom Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 243, 255, 0.2)', borderRadius: '4px', padding: '3px 8px', height: '26px' }}>
                <span style={{ fontSize: '0.48rem', color: '#888', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>ZOOM:</span>
                <input
                  type="range"
                  min="10"
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
                  REW
                </button>

                {/* Stop */}
                <button
                  className="deck-btn"
                  onClick={stopPerformancePlayback}
                  style={{ height: '18px', padding: '1px 6px', fontSize: '0.55rem', color: '#ff4444', background: 'rgba(255, 68, 68, 0.05)', border: '1px solid rgba(255, 68, 68, 0.3)' }}
                  title="Stop and Reset"
                >
                  Stop
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
                  FWD
                </button>

                {/* Record */}
                <button
                  className={`deck-btn ${perfRecordActive && !perfIsDubbing || (perfRecordArmed && !perfIsDubbing) ? 'active' : ''} ${perfRecordArmed && !perfIsDubbing ? 'blinking' : ''}`}
                  onClick={() => togglePerformanceRecord(false)}
                  style={{ 
                    height: '18px', 
                    padding: '1px 6px', 
                    fontSize: '0.55rem', 
                    color: perfRecordActive && !perfIsDubbing || (perfRecordArmed && !perfIsDubbing) ? '#fff' : '#ff3333', 
                    background: perfRecordActive && !perfIsDubbing ? '#ff3333' : (perfRecordArmed && !perfIsDubbing) ? 'rgba(255, 51, 51, 0.4)' : 'rgba(255, 51, 51, 0.05)', 
                    border: `1px solid ${perfRecordArmed && !perfIsDubbing ? '#ff3333' : 'rgba(255, 51, 51, 0.3)'}`,
                    boxShadow: perfRecordActive && !perfIsDubbing || (perfRecordArmed && !perfIsDubbing) ? '0 0 8px #ff3333' : 'none'
                  }}
                  title={perfRecordArmed && !perfIsDubbing ? "Disarm Record" : perfRecordActive && !perfIsDubbing ? "Stop Recording" : "Clean Record (clears sequence)"}
                >
                  {perfRecordActive && !perfIsDubbing ? '● REC...' : perfRecordArmed && !perfIsDubbing ? '● ARMED' : '● Record'}
                </button>

                {/* Dub */}
                <button
                  className={`deck-btn ${perfRecordActive && perfIsDubbing || (perfRecordArmed && perfIsDubbing) ? 'active' : ''} ${perfRecordArmed && perfIsDubbing ? 'blinking' : ''}`}
                  onClick={() => togglePerformanceRecord(true)}
                  style={{ 
                    height: '18px', 
                    padding: '1px 6px', 
                    fontSize: '0.55rem', 
                    color: perfRecordActive && perfIsDubbing || (perfRecordArmed && perfIsDubbing) ? '#fff' : '#ff00ff', 
                    background: perfRecordActive && perfIsDubbing ? '#ff00ff' : (perfRecordArmed && perfIsDubbing) ? 'rgba(255, 0, 255, 0.4)' : 'rgba(255, 0, 255, 0.05)', 
                    border: `1px solid ${perfRecordArmed && perfIsDubbing ? '#ff00ff' : 'rgba(255, 0, 255, 0.3)'}`,
                    boxShadow: perfRecordActive && perfIsDubbing || (perfRecordArmed && perfIsDubbing) ? '0 0 8px #ff00ff' : 'none'
                  }}
                  title={perfRecordArmed && perfIsDubbing ? "Disarm Dubbing" : perfRecordActive && perfIsDubbing ? "Stop Dubbing" : "Overdub (layers notes on top)"}
                >
                  {perfRecordActive && perfIsDubbing ? '● DUBBING' : perfRecordArmed && perfIsDubbing ? '● ARMED' : '● Dub'}
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

              {/* Timeline wrap length selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.4rem', color: '#888', fontFamily: 'monospace' }}>LENGTH:</span>
                <select
                  value={perfSeqLength}
                  onChange={(e) => setPerfSeqLength(e.target.value)}
                  style={{
                    background: '#0a101d', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '2px', color: '#ffe600', fontSize: '0.42rem',
                    padding: '1px 2px', outline: 'none', cursor: 'pointer', fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}
                  title="Wrap performance sequencer loop length after this many beats"
                >
                  <option value="Auto">Auto (Grow)</option>
                  <option value="16">16 Beats (4 Bars)</option>
                  <option value="32">32 Beats (8 Bars)</option>
                  <option value="64">64 Beats (16 Bars)</option>
                  <option value="128">128 Beats (32 Bars)</option>
                  <option value="256">256 Beats (64 Bars)</option>
                  <option value="Infinite">Infinite</option>
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

          {/* Macro Group Row */}
          <div className="macro-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', borderTop: '1px solid rgba(0, 243, 255, 0.15)', paddingTop: '6px' }}>
            <span style={{ fontSize: '0.48rem', color: '#ffe600', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '0.5px' }}>MACRO TRIGGERS:</span>
            {macros.map((m) => {
              const isAssigning = macroAssignMode === m.id;
              const mappedKeys = Object.keys(m.activePads);
              const hasPads = mappedKeys.length > 0;
              
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0, 0, 0, 0.3)', padding: '2px 4px', borderRadius: '3px', border: isAssigning ? '1px solid #ffaa00' : '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <button
                    className="deck-btn-xs"
                    onClick={() => {
                      if (!hasPads) {
                        showEditorStatus(`Macro ${m.name} has no mapped pads. Click MAP to assign some! ⚠️`);
                        return;
                      }
                      mappedKeys.forEach(padKey => {
                        const parts = padKey.split('-'); // e.g. ['A', 'slot', '0']
                        if (parts.length === 3) {
                          const deck = parts[0];
                          const type = parts[1];
                          const idx = parseInt(parts[2], 10);
                          
                          triggerPerfPadInternal(deck, type, idx, 100, true, true);
                        }
                      });
                      showEditorStatus(`Triggered Macro ${m.name} (${mappedKeys.length} pads) 🚀`);
                    }}
                    style={{ 
                      fontSize: '0.45rem', 
                      padding: '2px 5px', 
                      height: '16px', 
                      background: hasPads ? 'rgba(0, 243, 255, 0.15)' : 'rgba(255,255,255,0.03)', 
                      color: hasPads ? '#00f3ff' : '#666',
                      border: hasPads ? '1px solid rgba(0, 243, 255, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                      cursor: hasPads ? 'pointer' : 'default',
                      fontWeight: 'bold',
                      borderRadius: '2px'
                    }}
                    title={hasPads ? `Trigger mapped pads: ${mappedKeys.join(', ')}` : "No pads mapped"}
                  >
                    {m.name.toUpperCase()}
                  </button>
                  
                  <button
                    className="deck-btn-xs"
                    onClick={() => {
                      setMacroAssignMode(prev => prev === m.id ? null : m.id);
                    }}
                    style={{ 
                      fontSize: '0.4rem', 
                      padding: '1px 3px', 
                      height: '14px', 
                      background: isAssigning ? '#ffaa00' : 'rgba(255,255,255,0.05)', 
                      color: isAssigning ? '#000' : '#ffaa00',
                      border: isAssigning ? '1px solid #ffaa00' : '1px solid rgba(255, 170, 0, 0.3)',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                    title={isAssigning ? "Stop assigning pads" : `Map pads to ${m.name}`}
                  >
                    {isAssigning ? 'DONE' : 'MAP'}
                  </button>
                </div>
              );
            })}
            {macroAssignMode && (
              <span style={{ fontSize: '0.42rem', color: '#ffaa00', fontFamily: 'monospace', marginLeft: '6px', animation: 'pad-pending-pulse 1s infinite' }}>
                [CLICK PADS TO MAP/UNMAP TO ACTIVE MACRO]
              </span>
            )}
          </div>
        </div>

        {/* Master Bus Console */}
        <div className="master-bus-panel">
          <div className="master-bus-header">
            <span className="master-bus-title">MASTER BUS CONSOLE</span>
            <span style={{ fontSize: '0.45rem', color: '#ff0055', fontFamily: 'monospace', letterSpacing: '0.5px' }}>ANALOG SIGNAL CHAIN & DYNAMICS</span>
          </div>
          
          <div className="master-bus-strips">
            {/* Strip 1: Neve Saturation */}
            <div className="master-bus-strip">
              <span className="master-bus-strip-label">Neve Saturation</span>
              <div className="master-bus-slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={inputGainSat}
                  onChange={(e) => setInputGainSat(parseFloat(e.target.value))}
                  className="master-bus-slider"
                  style={{ accentColor: '#00f3ff' }}
                />
                <div className="master-bus-control-row">
                  <span style={{ fontSize: '0.45rem', color: '#888' }}>DRIVE:</span>
                  <span className="master-bus-value-display">{inputGainSat.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Strip 2: Sidechain Ducker */}
            <div className="master-bus-strip">
              <span className="master-bus-strip-label">Sidechain Ducker</span>
              <div className="master-bus-slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duckerAmount}
                  onChange={(e) => setDuckerAmount(parseFloat(e.target.value))}
                  className="master-bus-slider"
                  style={{ accentColor: '#ff0055' }}
                />
                <div className="master-bus-control-row">
                  <span style={{ fontSize: '0.45rem', color: '#888' }}>AMOUNT:</span>
                  <span className="master-bus-value-display">{duckerAmount.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Strip 3: Glue Compressor */}
            <div className="master-bus-strip">
              <span className="master-bus-strip-label">Parallel Glue Comp</span>
              <div className="master-bus-slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={glueMix}
                  onChange={(e) => setGlueMix(parseFloat(e.target.value))}
                  className="master-bus-slider"
                  style={{ accentColor: '#ffe600' }}
                />
                <div className="master-bus-control-row">
                  <span style={{ fontSize: '0.45rem', color: '#888' }}>MIX:</span>
                  <span className="master-bus-value-display">{glueMix.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Strip 4: Master Limiter VU */}
            <div className="master-bus-strip" style={{ flex: 1.2, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span className="master-bus-strip-label" style={{ margin: 0 }}>Brickwall Limiter</span>
                <button
                  className="deck-btn-xs"
                  onClick={() => setMasterLimiterActive(prev => !prev)}
                  style={{
                    fontSize: '0.4rem',
                    padding: '1px 4px',
                    height: '14px',
                    lineHeight: '12px',
                    background: masterLimiterActive ? 'rgba(255, 0, 85, 0.25)' : 'rgba(255,255,255,0.05)',
                    color: masterLimiterActive ? '#ff0055' : '#888',
                    border: `1px solid ${masterLimiterActive ? '#ff0055' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    boxShadow: masterLimiterActive ? '0 0 5px rgba(255, 0, 85, 0.4)' : 'none',
                    fontWeight: 'bold',
                    transition: 'all 0.1s ease'
                  }}
                  title="Toggle Master Limiter On/Off (Bypass)"
                >
                  {masterLimiterActive ? 'ACTIVE' : 'BYPASS'}
                </button>
              </div>
              <div className="master-vu-container" style={{ opacity: masterLimiterActive ? 1.0 : 0.25, transition: 'opacity 0.2s ease' }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      masterLimiterVuRefsArr.current[i] = el;
                    }}
                    className="master-vu-segment"
                  />
                ))}
              </div>
              <div className="master-bus-control-row" style={{ marginTop: '2px' }}>
                <span style={{ fontSize: '0.45rem', color: '#888' }}>LIMIT:</span>
                <span style={{ fontSize: '0.45rem', color: masterLimiterActive ? '#ff0055' : '#666', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {masterLimiterActive ? '-1.0 dB' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>


      </div>
    );
  };