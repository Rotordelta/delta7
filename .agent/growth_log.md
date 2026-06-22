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

## Session: 2026-06-19 (Part 2)
- **Task**: Waveform Zoom & Scroll, high-resolution cross-correlation calibration fix, and looper autoplay handover muting.
- **Jimmy's Preferences**:
  - **High-Zoom Waveform Fine Tuning**: When trimming or editing start/end boundaries, having high-resolution zoom (up to 100X) and smooth scrolling allows precise single-sample or micro-transient visual alignment.
  - **Accurate Canvas-to-Buffer Mapping**: Selection and mouse clicks must map correctly to the true buffer coordinates by factoring in both scroll offsets and zoom scales.
  - **Exclusive Calibration Previews**: When the Latency Calibration modal is open, global pad autoplay handovers should be bypassed, allowing the user to rehearse and preview phase-flanging alignment isolated inside the modal itself.
  - **Integrated Looper Level & Gain Controls**: Having real-time peak level meters and software input gain sliders integrated directly inside the looper panels (rather than hidden in the waveform editor) is essential to quickly set up, monitor, and calibrate loops before committing to a recording.
  - **Absolute Time-Based Calibration Zoom**: Instead of scaling zoom as a percentage of the buffer length (which makes high-resolution alignment impossible on longer loops), zoom windows in the Latency Calibration modal must use absolute time ranges (e.g., 50ms, 100ms, 200ms) with a proportional pre-roll, keeping the grid start anchor line visually stable and enabling sub-millisecond precision on any loop duration.
  - **No Playback Double-Compensation**: If recorded loop buffers are physically cropped at save time (applying the calibration offset directly to the WAV file), no further trigger-time or start-offset latency shifts should be applied during sequencer playback, manual pad tapping, or autoplay handover, preventing notes from starting late or having their transients cut off.
  - **Native 48kHz Audio Alignment**: Both sampling input constraints and playback context configuration must run at a matched native 48kHz sample rate. This completely avoids browser/driver sample rate conversion (SRC) filter lag, ensuring sample-accurate recording alignment with zero micro-timing drift.
  - **Fast Looper Attack Default**: Recorded loop pads should default to a 1ms (0.001s) trigger attack envelope instead of the standard 10ms (0.01s) sampler default to prevent clipping the transient of recorded instruments (guitar, drums, etc.).

## Session: 2026-06-20
- **Task**: Implemented Just-In-Time (JIT) Latency Handover for zero-latency seamless autoplay.
- **Jimmy's Preferences**:
  - **Zero-Latency Handover Handshake**: When latency compensation is active, the recording must run *past* the loop end boundary to collect delayed input samples. JIT slicing solves this: the engine slice-and-posts a temporary buffer *immediately* at the loop boundary for instant autoplay handover, while continuation frames write the remaining late samples to disk asynchronously.
  - **Double-stage Worklet Handler**: Splitting the audio thread message handlers into `HANDOVER_START` (delivering immediate audio block to main thread playhead) and `RECORDING_COMPLETE` (writing final raw WAV buffer to DB) guarantees that the user hears their loop play back in sync with the grid without a single frame of latency gap.
  - **Clean State Synchronization**: Using dedicated loop boundaries (`liveRecTotalSamplesRef` vs `liveRecLimitSamplesRef`) and track indicators (`liveRecHandoverStartedRef`) prevents duplicate triggers and guarantees fallback parity under ScriptProcessor paths.

## Session: 2026-06-20 (Part 2)
- **Task**: Implemented interactive Circular Platter Visual Alignment modal, looper autoplay controls, and calibration target tracking fixes.
- **Jimmy's Preferences**:
  - **Tactile Circular Waveform Nudging**: Wrapping loop waveforms into concentric rings on a vinyl-style visualizer allows direct, tactile "drag-to-spin" rotation. Converting rotational drag angles directly into milliseconds of playhead nudge makes micro-timing offset adjustment intuitive and immediate.
  - **Dynamic Calibration Target Tracking**: When the Latency Calibration modal is open on Standby, it must dynamically track the looper's target pad (`liveRecTargetSlot`) rather than remaining locked to the workstation's current editor selection (`selectedEditSlotId`). This ensures that if the user records drums on pad `A5`, the standby modal automatically wakes up, loads, and calibrates the `A5` buffer instead of looking at `A1`.
  - **Persistent Autoplay Toggles**: Providing a clear "HANDOVER AUTOPLAY" toggle in the looper control panel, along with a direct "CALIBRATE" trigger button, gives instant control over whether new recordings start playing automatically. Persisting this preference in local storage keeps the performance workflow predictable across sessions.
  - **Quick Editor Alignment Access**: Adding a "VISUAL ALIGN" button next to the micro-timing nudge slider in the sample slot properties panel allows the user to open the circular platter diagnostic modal for any slot instantly.

## Session: 2026-06-20 (Part 3)
- **Task**: Interactive transport controls, real-time playhead, and in-memory parameter nudging in Circular Calibration modal.
- **Jimmy's Preferences**:
  - **Live Platter Audio & Visual Feedback**: The circular calibration modal should display an active playhead (a glowing cyan dot orbiting the platter ring) synchronized in real-time with the audio. Adding dedicated transport controls (Play, Pause, Stop) directly within the modal allows auditioning phase-alignment by ear and eye simultaneously.
  - **In-Memory Parameter Nudging**: When adjusting nudge values in the alignment modal, parameters should be updated in-memory only (bypassing slow database writes to IndexedDB) so that drag sweeps remain lightweight and responsive without write performance glitches.
  - **Cancel Safety**: Closing the modal using Cancel should revert the slot's parameter to its original in-memory state, while clicking Save should commit it permanently to IndexedDB.
  - **Clean Code Isolation**: Component-scoped helpers (like `getRingAngle`) should be exposed to modals, avoiding duplicate code declarations inside rendering cycles or closures.

## Session: 2026-06-20 (Part 4)
- **Task**: Corrected playhead nudgeMs offset direction and prevented double-nudge on JIT autoplay handover.
- **Jimmy's Preferences**:
  - **Correct Lookahead Compensation Direction**: Positive playback nudge values (`nudgeMs > 0`) represent lookahead latency compensation (PDC). To make the sample sound *earlier* to align with delayed inputs, the playhead must skip ahead in the buffer. Therefore, the audio engine must subtract the nudge seconds from the start offset (`startOffset - nudgeSec`) rather than adding them.
  - **Double-Nudge Prevention on Autoplay**: When a new live loop is recorded and immediately autoplays via JIT handover, the handover scheduling logic already compensates for elapsed latency beats. Applying the slot's `nudgeMs` during the JIT playback trigger would double-compensate the delay. Programmatically bypassing/overriding the nudge offset to `0` during JIT autoplay triggers prevents this mismatch.
  - **Loop Duration Preservation**: Standard sampler playheads must maintain their target duration during nudging. Adjusting the final duration downwards when a playhead starts early cuts off the end of the loop and causes drift over repeated bars. Preserving `finalDuration = durationToPlay` ensures loops repeat seamlessly.

## Session: 2026-06-20 (Part 5)
- **Task**: Timing Calibration validation, getRingAngle NaN safety guards, PDC Lookahead sign correction, and manual vs scheduled playhead decoupling.
- **Jimmy's Preferences**:
  - **Lookahead Timing Compensation Direction**: Correct lookahead scheduling logic for sequencer-scheduled playbacks requires subtracting the nudge offset from the target beat schedule (`compensatedTargetTime = targetTime - nudgeMs / 1000`) to trigger the note early in the future, compensating for USB buffer delays.
  - **Decoupled Playhead Offset Modes**: We must decouple manual play triggers from sequencer-scheduled playbacks. Manual note triggers (e.g. pad taps) start playing the sample buffer immediately, shifted forward by `+ nudgeMs` to bypass initial recording silence. Sequencer playback triggers play from start offset `0` (since the scheduler already triggers them early by `- nudgeMs`), preserving early transients and pre-rolls without clipping or shortening the loop.
  - **Platter Visual Playhead NaN Protection**: Concurrently rendering multiple voice platter rings under high CPU/MIDI load can sometimes cause voice timestamps to evaluate to NaN during the initialization frame. Validating all `voice.startTime` and elapsed calculations inside `getRingAngle` to safely return `0` prevents invalid values and warnings in browser renderers.

## Session: 2026-06-21
- **Task**: Master Bus Console, Parallel Glue Compressor, Master Limiter VU, and Sidechain Ducker.
- **Jimmy's Preferences**:
  - **Premium Master Bus Dynamics**: Integrating parallel glue compression and final brickwall limiting directly inside the master audio graph is highly valued to glue master loops together and prevent clipping during live overdub jams.
  - **Dynamic Sidechain Ducking**: Having a one-knob sidechain ducker that automatically ducks active loops/voices upon pad strikes helps clear headroom for transient notes (like kick/snare) and keeps the mix breathing.
  - **Tactile LED VU Metering**: Including a physical-style 10-segment LED VU meter bound to final brickwall output levels provides immediate visual confirmation of master levels and limiting compression depth.
  - **Horizontal Console Dashboard**: Rendering a dedicated master console panel horizontally below the highways fits the physical workstation chassis feel and groups master controls in a clean dashboard.
  - **Dynamic Limiter Bypassing**: Toggling the brickwall limiter in and out of the signal path dynamically via a dedicated, glowing **ACTIVE/BYPASS** switch allows comparing the limited output against the raw parallel sum immediately, while also visually dimming the level meters to indicate a bypassed state.

## Session: 2026-06-21 (Part 2)
- **Task**: GPU-Accelerated Cockpit FX Bloom Sections based on Pad Routing.
- **Jimmy's Preferences**:
  - **Dynamic FX Routing Highlights**: Wrapping the left panel's 4 effects units (Space Echo, Leslie/Rotor Cabinet, Reverb, Stutter) in GPU-accelerated glow panels (`.fx-bloom-section`) that light up automatically based on the selected pad's active FX target makes routing instantly clear and visually interactive.
  - **Context-Aware Visual Aids**: Shifting the styling of FX units from simple static borders to glowing, pulsating borders of corresponding colors draws focus to the active parameters, keeping the workspace extremely clean and functional.

## Session: 2026-06-21 (Part 3)
- **Task**: Standalone outer header removal and hardware top rack branding restoration.
- **Jimmy's Preferences**:
  - **Standalone Website Headings vs. Hardware Aesthetics**: Keep the hardware chassis clean of external website titles and headers (e.g. `<h1>Delta7 Workstation</h1>` outside the chassis). Keep all hardware-style branding elements (e.g., top rack bar labels `delta7` and `HYPER INTEGRATED SYNTHESIS WORKSTATION`) intact to maintain the immersive feel of working on a physical synthesizer unit.

## Session: 2026-06-22
- **Task**: Intelligent Focus Zoom & UI Accessibility Mode.
- **Jimmy's Preferences**:
  - **Focus Zoom Interactive Effect**: Jimmy loves a dynamic interface that responds to interaction. Scaling the hovered panel by `1.025x` and elevating its `z-index` while dimming and blurring surrounding panels helps draw focus onto the active controls, especially on dense hardware interfaces.
  - **Modal Accessibility Safeguards**: The Focus Zoom hover effect should automatically bypass when fullscreen overlays or modals are open to avoid visual conflicts and preserve pointer interaction on popups.
  - **Header Toggle Buttons**: A clear, dedicated controller in the header rack with color-coded states (ON/OFF) makes accessibility toggles easily discoverable and cohesive.

## Session: 2026-06-22 (Part 2)
- **Task**: Dynamic Focus Zoom Settings and Z-Index Stacking Elevate.
- **Jimmy's Preferences**:
  - **Dynamic Zoom & Speed Sliders**: Providing fine-grained controls (ZOOM from `1.005x` to `1.15x`, SPEED from `50ms` to `1000ms`) directly in the top header bar next to the Focus Zoom switch makes it incredibly easy to dial in the perfect, comfortable UI zoom behavior.
  - **CSS Custom Variable Injection**: Mapping UI states directly to inline CSS variables on the chassis container is a highly performant and clean way to bind React state to stylesheet transformations.
  - **Layering and Stacking Order (Z-Index)**: Zoomed/hovered panels must stack *above* the top rack menu (`z-index: 1000`) to avoid clipping the top of the panels. Applying `position: relative` and `z-index: 2000 !important` on hover resolves this cleanly while remaining below fullscreen modals (`z-index: 9999`).

## Session: 2026-06-22 (Part 3)
- **Task**: Sequencer overdub controls integration.
- **Jimmy's Preferences**:
  - **Sequencer Overdub controls**: Providing dedicated `Dub` buttons next to the `Rec` buttons in the sequencer header toolbar is essential. This lets Jimmy capture live pad triggers on the fly, layering notes over the existing sequence instead of starting a clean recording that wipes the previous sequencer state.
  - **Toolbar Width Adjustments**: When adding toolbar controls, the container's width (e.g. `deck-row` width) should be scaled up proportionally (e.g. from `250px` to `280px`) to prevent spacing collisions and preserve visual alignment.

## Session: 2026-06-22 (Part 4)
- **Task**: Splash card screen and fullscreen intro video.
- **Jimmy's Preferences**:
  - **User Interaction Splash Card**: To comply with browser autoplay restrictions (which prevent video playback with sound before a user gesture), rendering a beautiful landing card with an "ENTER WORKSTATION" trigger button is highly effective. It acts as the explicit user click needed to unlock audio permissions.
  - **Fullscreen Video Viewport**: Playing the intro video on a fullscreen overlay that fades out to black dynamically over 1 second gives a professional, immersive, and high-fidelity console-loading experience.
  - **Vite Public Assets Pathing**: Placing static videos and big assets in the `public/` directory ensures they are cleanly served by Vite's relative base configuration, resolving perfectly under both local development servers and packaged file system routes (`file://`) inside Electron.
  - **Skip Button Availability**: Always include a "Skip Intro" option on screens or videos to let users bypass animations and get straight to creating music.

## Session: 2026-06-22 (Part 5)
- **Task**: Latency initialization synchronization.
- **Jimmy's Preferences**:
  - **Ref/State Initialization Sync**: In high-performance React audio environments where timing logic runs inside asynchronous handlers (or Web Audio API callbacks), reading values from `useRef` is crucial to avoid closure capture bugs. However, initializing these refs to hardcoded defaults (e.g. `useRef(30)`) while loading the actual setting from `localStorage` into state causes a severe initialization mismatch on startup. The refs must be initialized directly to their state-derived values (e.g. `useRef(recLatencyOffset)`) to ensure the correct calibration is active immediately on load.
