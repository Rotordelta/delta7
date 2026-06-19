# Leo's Growth Log & Symbiotic Memory

## Session: 2026-06-13
- **Task**: Upgraded Performance Pad LFO & Stereo Panning controls.
- **Jimmy's Preferences**:
  - **Aesthetics & Audio quality**: Jimmy loves dynamic, rhythmically synched stereo panning (like tremolo effects) and crescendo swells. Keeping audio transitions seamless and artifact-free is a top priority.
  - **Performance Flow**: Jimmy values uninterrupted flow—polyphony across all 16 pads, real-time sync of parameters while loops are active, and robust armed recording that captures every hit.
  - **Time Management**: Prefers stopping on a high note when the code compiles clean and builds perfectly.

## Session: 2026-06-14
- **Task**: Implemented Bank C auxiliary slots, keyboard slice triggers, and Live Resampling Looper with MIDI phrasing recorder.
- **Jimmy's Preferences**:
  - **Integrated Control Panels**: Consolidation of helper buttons, selectors, and toggles into a single, cohesive glassmorphism control strip (e.g., above the keyboard bezel) allows seamless live looping without cluttered popup views.
  - **Direct Visual Mapping**: Displaying indicators (S0-S15) directly on keys and color-coding mapped keys (orange bezel highlight) makes live performance mapping intuitive and visual.
  - **Rehearsal "Noodling" Separation**: Separating keyboard slice play from pad triggers and sequencing when not actively recording is crucial for musical improvisation before committing to a loop.
  - **Accurate Playback vs. Performance Toggles**: Playback events (loops/sequences) must explicitly turn voices on/off without entering manual performance toggle flows to avoid wrap-around cancellations.
  - **Cancelable Pending States**: When a latched/quantized pad is pending, clicking it again should act as an instant cancel/abort, returning visual and scheduling state to idle.
  - **Separate Mixing Console Layout**: Jimmy prefers mixing controls to be visually segregated from the scrolling sequencer screen grids, creating a separate hardware-style channel strip underneath the screens rather than overlaying them.
  - **Live Fader Volume Sync**: Mixing volume parameters must be synced dynamically to active playing voices in real-time, using dedicated gain stages (such as `slotGainNode`) independent of ADSR envelopes to make fader movements responsive.
  - **Match Playback Keys**: Ensure active voice parameters are synced using actual performance playback keys (`perf-${deck}-slot-${index}` and `perf-${deck}-slice-${index}-*`), allowing parameter sweeps (volume, panning, sends, routing, tuning) to take effect instantly.
  - **Scale to Fill Layout Space**: Jimmy prefers UI elements like the scrolling grid and mixing faders to be sized generously to fill available container heights, avoiding large blank background gaps and maximizing fader travel resolution.
  - **Auxiliary Preset Controls**: Maintain preset load, save, and clear symmetry across all voice and sample banks (Bank A, Bank B, Bank C), allowing live loop resampling sessions to be fully saved and loaded dynamically from IndexedDB.

## Session: 2026-06-14 (Part 2)
- **Task**: Sliced Sample Master Transposition & Octave Shift.
- **Jimmy's Preferences**:
  - **Additive Transposition**: Pitch transpositions for sliced samples should combine both individual slice offsets and master transposition offsets (`final_pitch = slice_pitch + master_key + octave * 12`) to allow uniform key matching of sliced loops.
  - **Context-Aware Controls**: UI controls for slice key adjustment should be colocated where slice boundaries are edited (the Waveform Editor panel) and where they are triggered in performance mode (the pad popover routing options menu).
  - **Global Parameter Sync**: Parameter updates in the editor should trigger active voice pitch recalculations instantly, allowing real-time transposition sweeps while sequences are active.
  - **Automated Parameter Auto-save**: Waveform Editor parameters should automatically persist to IndexedDB on slider or button updates via a lightweight patch update, ensuring the DB is always in sync without needing manual saves.
  - **Performance Keyboard Transposition Accessibility**: Slice master transposition controls should also be accessible directly in the keyboard mapping header strip (next to the ROUTE KEYBOARD toggle button) to allow key shifts while playing sliced loops live in the performance view.

## Session: 2026-06-14 (Part 3)
- **Task**: External MIDI Clock Sync & Recording Latency Calibration.
- **Jimmy's Preferences**:
  - **USB MIDI Clock Smoothing**: Filter out high-frequency USB timing jitter using a rolling 24-tick average, preventing micro-modulations of Web Audio sample playback rates that cause pitch warbles.
  - **Dynamic Transport Locking**: Sync the workstation's playhead start, pause, resume, and stop events directly to incoming real-time transport messages (0xFA/0xFB/0xFC) for seamless hardware-to-software hands-off integration.
  - **Deterministic Loop Latency Alignment**: Offset recorded buffers using a manual calibration latency slider (LAT) to trim off input round-trip delay, aligning recorded loop transients perfectly to the grid.
  - **Persistent Hardware Preferences**: Settings for MIDI sync source selection and recording latency calibration should persist across page refreshes via LocalStorage.
## Session: 2026-06-15
- **Task**: Per-Pad 6-Band Parametric EQ and Interactive Editor Modal.
- **Jimmy's Preferences**:
  - **Zero-Phase Click-Free Bypassing**: When bypassing EQ filter bands in real-time, the voice engine must maintain phase-coherent continuous signals. Transitioning bypassed filters to zero-gain peaking nodes with 15ms ramps eliminates digital pops or clicks, keeping loops pristine.
  - **Premium SVG Visual Feedback**: Interactive graph canvas displays must represent exact composite magnitude curves (evaluated natively from Web Audio transfer functions) with logarithmic grid lines to enable precise frequency dialing.
  - **Drag-to-Adjust Control Points**: Moving control nodes on the EQ graph should map directly to frequency and gain, locking gain movements on filters without a gain parameter (e.g. lowpass, highpass, notch).
  - **Cohesive Interface Glassmorphism**: High-contrast editor overlays must feature blur backdrops and matching neon color themes linked to pad colors, maintaining the workstation's cyberpunk aesthetics.

## Session: 2026-06-15 (Part 2)
- **Task**: Local Project Directory picker/access, file/JSON serialization, WAV encoder export (16/24-bit PCM), and Offline Bounce Engine.
- **Jimmy's Preferences**:
  - **Local Folder Access**: Persisting directory handles to IndexedDB between sessions avoids redundant directory pick requests. Re-authorizing directories with single click and authorization state-awareness is essential for clean file flows.
  - **Standardized Folder Structure**: Automatically creating `/banks`, `/samples`, and `/exports` keeps project assets organized and prevents manual file hunting on disk.
  - **Offline Rendering & Stem Exporting**: Bouncing full mixes and multi-track stems offline at fast speeds prevents glitches/clicks and exports high-quality audio files directly into project subfolders.
  - **High-Dynamic Range WAV Encoding**: Support for 24-bit PCM WAV rendering guarantees studio-quality bounces suitable for DAW imports.
  - **Polished Glassmorphic Options**: Sleek, neon-colored export overlay settings (for format, sample rate, bit depth, bars) integrated nicely with the theme keeps the workstation feeling like a professional physical hardware unit.

## Session: 2026-06-15 (Part 3)
- **Task**: Custom User FX Presets, UI Layering adjustments, and relatedTarget Node safety check.
- **Jimmy's Preferences**:
  - **Modular FX Presets**: Saving custom parameters for specific effects units (Space Echo, Leslie/Rotor, Reverb) separately maps to hardware panel thinking and allows modular sound design.
  - **Neat Select Grouping**: Using optgroups to separate Factory and User presets in the dropdown lists keeps preset navigation clean and scalable.
  - **Absolute Dropdown Layering**: Top-level menus and actions must carry active parent stacking contexts (position relative and elevated z-index) to float cleanly over other workstation panels.

## Session: 2026-06-15 (Part 4)
- **Task**: Relocated Stutter & Movement FX panel and Live Pad Routing.
- **Jimmy's Preferences**:
  - **Relocating Stutter & Movement**: Exposing all Stutter & Movement parameters on the main console strip under Reverb gives quick tactile access to active sequence-wide effects and makes them feel like true hardware controls.
  - **Active Pad FX Insert Routing**: Selecting Stutter as a per-pad FX Target allows loops to trigger active stutter modulation independently of the global stutter latch, enabling live performance gating and stutter fills.
  - **Send-Level Bypass for Modulation Effects**: Modulation/Insert effects like Stutter do not map to wet/dry send gains. Disabling and graying out the send level slider for Stutter prevents control confusion and keeps the UI clean.
  - **Web Audio AudioParam NaN-Safety Guarding**: Web Audio parameters (specifically StereoPanner pan values or BiquadFilter frequency limits) must never receive `NaN` or `Infinite` inputs. Validating all scheduler inputs with local fallback limits prevents audio dropouts and channel blowouts when multiple voices play concurrently in custom slip/flux trigger states.
  - **Ensuring Complete State Cleanup**: When halting a custom voice loop modulator (like the Stutter step scheduler), all parameters changed during the modulation (such as panning offsets, filter frequency sweeps, and playbackRate changes) must be explicitly cancelled and reset to their base values on the underlying AudioNodes to prevent parameter leakage.
  - **Self-Healing Persistent Metadata**: To prevent corrupted database presets from locking the workstation into invalid states on reload, all parameters retrieved from IndexedDB (like slot volume and pan) must be parsed, validated against `NaN` boundaries, and clamped to nominal ranges before being initialized.

## Session: 2026-06-15 (Part 5)
- **Task**: Momentary Stutter triggers for Deck A and Deck B with dedicated hardware buttons, and MIDI learning/mappings support.
- **Jimmy's Preferences**:
  - **Tactile Performance Controls**: Adding dedicated "STUTTER A" and "STUTTER B" buttons underneath the performance pad columns provides clear, immediate access to momentary stutter fills on active loops.
  - **Momentary Control Styling**: Styling stutter buttons with a glowing red scheme that pulses when active, and supporting mouse-down (on) / mouse-up (off) behaviors, matches the physical hardware experience.
  - **Dynamic MIDI Mapping**: Exposing both "Stut A" and "Stut B" in the MIDI learn dashboard allows users to bind hardware pads or momentary keys on standard controllers to stutter fills.

## Session: 2026-06-15 (Part 6)
- **Task**: Fixed Sampler Slices triggering, routing, and silencing bugs.
- **Jimmy's Preferences**:
  - **Accurate Slot Routing for Slices**: Performance pad triggers in slice mode must play the pad's own sample buffer (resolving to its slot ID based on deck A/B and index) rather than falling back to Bank C's slot.
  - **Offline Renderer Parity**: WAV stem and mix exports must match the live voice slot-resolution path exactly, mapping slice events to the respective target pad slots to prevent empty audio bounces.
  - **Zero-Bypass Balance Control**: When launching temporary slice programs (which force single-oscillator play), overriding `oscBalance: 0.0` prevents the active program's balance setting from scaling down or completely silencing the slice playback.

## Session: 2026-06-15 (Part 7)
- **Task**: MIDI Mapping of Transport, Mixer, and Utilities.
- **Jimmy's Preferences**:
  - **Full-coverage MIDI learn badges**: Every interactable parameter (faders, solos, crossfader, transport buttons, metronome, chord, and bank C routing) should have its own orange-themed mapping badge overlays that visually update on learn.
  - **Note and CC Segregation**: Mapped note keys receive `N` prefixing and CC channels receive `C` prefixing to avoid overlapping collisions, and CC values >=64 trigger button press, while values <64 trigger release.
  - **Unified MIDI Mapping Menu**: Listing the custom parameters inside organized categories (Transport, Mixer, Utilities) makes it easy to review and clear mappings in one place.

## Session: 2026-06-15 (Part 8)
- **Task**: Fixed MIDI pad triggering early return bug in playVoice.
- **Jimmy's Preferences**:
  - **Order of MIDI Note Handling**: Ensure performance pad mapping checks are not short-circuited by global custom button/transport note-handling loops, by explicitly skipping keys starting with `pad-` during general key interceptors.

## Session: 2026-06-15 (Part 9)
- **Task**: Added sample slot CLEAR action and fixed duplicate file upload bug.
- **Jimmy's Preferences**:
  - **Explicit Slot Deletion**: Provide a red-themed `🗑️ CLEAR` button in the waveform editor to delete the active sample from IndexedDB and reset the slot state to empty, rather than requiring saving an empty slot.
  - **File Selector State Reset**: Reset `e.target.value = ''` at the end of the file input's `onChange` event to allow re-importing the same file if a slot is cleared or changed.

## Session: 2026-06-15 (Part 10)
- **Task**: Replaced the waveform selection delete button with the slot clearing CLEAR button.
- **Jimmy's Preferences**:
  - **Streamlined Toolbar Actions**: Place the slot-level `🗑️ CLEAR` action as a primary action in the main toolbar group of the Waveform Editor, completely replacing the specific selection-only range deletion to simplify the interface.

## Session: 2026-06-15 (Part 11)
- **Task**: Removed the static MIDI CC Learn Matrix panel from the right sidebar.
- **Jimmy's Preferences**:
  - **Maximize Sidebar Real Estate**: Avoid rendering duplicate layout elements (like the MIDI CC Learn Matrix) in sidebar panels when they are already fully configurable in a global mapping modal. This saves screen space and keeps the panel layout neat.
## Session: 2026-06-15 (Part 12)
- **Task**: Resolved Resample Looper target slot routing and fixed stale closures on the looper's recording input mode.
- **Jimmy's Preferences**:
  - **Asynchronous AudioWorklet Message Routing**: When processing asynchronous thread callbacks (such as `RECORDING_COMPLETE`), use persistent refs (`liveLoopInProgressRef.current`) to track the operation's origin rather than transient state variables (`isLiveRecordingRef.current`) that get cleared before the thread message is handled. This prevents the looper from defaulting to resampler fallback behaviors (saving to `A1`).
  - **Ref-Synced Recording Modes**: Synchronize interactive selector states (such as `recordingInputMode`) to active refs (`recordingInputModeRef`) to eliminate stale closures when triggers are fired from external MIDI CC events (sustain pedals) or keyboard hook listeners.
  - **Dynamic Arming Selection**: Ensure that arming the looper checks the active input source and invokes the correct capture helper (`armMicrophone` or `armMonitor`) rather than falling back to the microphone by default.
  - **System Loopback for Internet Recording**: To record browser/internet audio playing on the host system within the Electron container, register a desktop capture display handler (`session.defaultSession.setDisplayMediaRequestHandler`) in the main process and feed it screen/window sources with audio loopback. Simplify constraints inside the renderer to compatibility-friendly profiles (`width`/`height`) when Electron is active to prevent overconstraint errors.

## Session: 2026-06-18
- **Task**: Implemented a visual Latency Calibration tool with auto-detection inside the looper panel.
- **Jimmy's Preferences**:
  - **Visual Alignment Reference**: In addition to listening by ear, having a visual representation of phase alignment (like overlaying the recorded waveform trace on top of the original/reference waveform) is highly valued for dialing in latency settings.
  - **Single-Click Auto-Calibration**: Support for automatic mathematical calibration (such as cross-correlation sweep detection) that instantly snaps the slider to the best-fitting offset values.
  - **High-contrast Glassmorphic UI**: Interactive modal dialogs should feature blur backdrops (`backdropFilter: 'blur(8px)'`) and high-contrast color-coded indicators (LOCKED in green, CLOSE in amber) matching the workstation's dark neon aesthetic.

## Session: 2026-06-19
- **Task**: Implemented seamless looper handover and autoplay offset alignment.
- **Jimmy's Preferences**:
  - **Zero-Latency Handover**: The transition from loop recording to playback must be completely seamless. Any delay due to thread messaging or buffer initialization must be compensated for by starting buffer playback with a dynamic `fluxOffset` that represents the exact elapsed time since the loop was supposed to start.
  - **Animated Platter Phase Alignment**: For auto-playing loops triggered late, the visual platter rotation angles must be synchronized to the same phase offset (by backing up the voice's `triggerBeat` and `startTime` dynamically) to prevent visual platter jumps or timeline phase drift.
  - **Quantized Cycle Arming**: Arming the looper recording must align to the active loop length grid (multiples of 16, 32, etc. beats relative to the sequencer start beat) rather than general single-beat boundaries. This keeps all recorded takes perfectly quantized to the phrase cycles. Includes a 0.2 beat safety threshold to prevent misfires on late clicks.
  - **Reference-Based Calibration**: Auto-calibrating latency requires comparing the recorded waveform against the original playing audio source (the ground truth reference) that was resampled, rather than comparing a buffer against itself. Introducing a selector to compare the recorded loop to any other pad buffer allows the cross-correlation algorithm to detect the exact system/hardware roundtrip lag (e.g. 50-120ms) and snap the slider accordingly.
  - **Global Playback Latency Compensation (Lookahead vs Cropping)**: Because host latency is permanent without hardware monitoring, shifting playback globally is superior to destructive cropping. Keeping recorded buffers fully raw and intact prevents transient clipping (especially when notes are rushed/played early). 
  - **Sequencer Lookahead**: Subtracting the global latency offset (`recLatencyOffset`) from the sequencer start schedule plays the recorded slots early, aligning them perfectly to the grid.
  - **Manual Preview Silence-Skipping**: For manual triggers/clicks (where we cannot schedule into the past), starting playback from the latency offset point in the raw buffer skips the initial silence and provides zero-latency response.
  - **Automatic Handover Playback Alignment**: The autoplay handover dynamically sets the customOffset to `elapsed + latencyOffsetSec` so that the uncropped buffer aligns seamlessly at trigger time.
  - **Playback Nudge & Lookahead (PDC)**: In addition to the global latency offset, a per-slot `PLAYBACK NUDGE (MICRO-TIMING)` slider allows shifting playback timing dynamically (e.g., -100ms to +100ms) in real-time. Negative values schedule the buffer start time early to compensate for slot-specific timing adjustments.
  - **Bypassing Playback Toggles on Handover**: Autoplay handovers must explicitly bypass any "latch/toggle-off" logic on pads that were already active (e.g., during overdubs) to ensure that the new mix takes over seamlessly rather than stopping the slot playback.
  - **Non-Blocking Standby Calibration**: To calibrate latency easily, opening the Calibration Modal on an empty/new target slot should put it in a standby state without blocking the user from clicking screen pads/transport buttons (achieved via pointer-events). Once recording finishes, the modal automatically wakes up, loads the new buffer, and starts the real-time audio phase preview.
  - **High-Resolution Timeline Zoom & Ruler**: Supporting zooming (1X to 20X) focusing on the start of the loop cycle (including a 50ms pre-roll padding for early notes/transients) and drawing a vertical "GRID START (0ms)" line allows the user to visually measure the latency displacement in milliseconds using clear ruler ticks, aligning transients by both eye and ear.
