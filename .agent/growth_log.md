
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

## Session: 2026-06-22 (Part 6)
- **Task**: Workstation-wide audio sample rate configuration switcher (44.1kHz vs 48kHz).
- **Jimmy's Preferences**:
  - **Dynamic Sample Rate Selection**: Swapping sample rates (44.1kHz vs 48kHz) in the header should rebuild the audio context and restart the engine in place. This allows Jimmy to quickly switch between CD-quality (44.1kHz) and standard video-audio sync (48kHz) without reloading the page.
  - **Safety Indicators**: A clear status readout (e.g. `⚡ ENGINE: 48kHz`) and an explanatory note in the switcher warning that changing the rate resets active voices and restarts the engine keeps the user informed and prevents accidental dropouts.

## Session: 2026-06-22 (Part 7)
- **Task**: Lookahead Verification & Outbound MIDI Stop Integration.
- **Jimmy's Preferences**:
  - **Variable Latency Enforcement**: To protect flexibility when swapping audio interfaces or changing physical buffer configurations, the lookahead and latency compensation values must remain fully variable (derived dynamically from the active `recLatencyOffset` state and individual pad `nudgeMs` registers) with no hardcoded millisecond constants.
  - **Dynamic Outbound Transport Sync**: When stopping playback or disabling MIDI clock streams internally, dispatching the physical MIDI Stop signal (`0xFC`) ensures external hardware instruments slaved to the Delta7 sequencer stop immediately.

## Session: 2026-06-22 (Part 8)
- **Task**: AudioContext Startup Race Condition Fix.
- **Jimmy's Preferences**:
  - **Mount-Time Initialization**: Rather than lazy-loading the Web Audio Context and compiling AudioWorklet modules on the first note/pad trigger (which creates timing race conditions and lost events), the engine should initialize automatically upon mounting after a splash screen gesture.
  - **Null Safety in Async Init**: All call-sites performing lazy context checks must be safeguarded with explicit checks for null `audioCtxRef.current` to prevent TypeError crashes during initialization windows.

## Session: 2026-06-22 (Part 9)
- **Task**: Looper Record Gate Boundary Cycle Alignment Fix.
- **Jimmy's Preferences**:
  - **Mismatched Loop Length Alignments**: When recording live loops that are longer than or equal to the active sequencer loop length, the record gate must align with the sequencer's wrap-around boundary (`endBeat`).
  - **Natural Wrap-Around Handover**: If a cycle skip occurs near boundaries, the looper should wait to trigger naturally in the next cycle rather than scheduling boundaries past `endBeat` which are unreachable and lead to arming freezes.

## Session: 2026-06-22 (Part 10)
- **Task**: Audio Context lifecycle sanitization, worklet Blob URL finally-block revocations, WAV export timing delays, MIDI listener unmount cleanup, and calibration playhead silencing.
- **Jimmy's Preferences**:
  - **JIT Calibration Voice Halting**: Programmatically halting active performance pad voice scheduling and clearing target pad UI trigger states before opening the Latency Calibration modal ensures residual playback does not bleed into the calibration audio path.
  - **Delayed WAV Revocation**: Introducing a 1-second timeout before revoking export WAV blobs allows the browser download engine enough time to finalize the file stream.
  - **Worklet Blob URL Retention for Dynamic Nodes**: For worklet processors that are instantiated dynamically (such as `recorder-processor`), revoking their Blob URL immediately after `addModule` causes subsequent instantiations of the node to fail in Chromium. Retaining these Blob URLs for the active lifetime of the AudioContext, and revoking them only inside the final global `cleanupAudioEngine` block, is required to prevent "Class not found" / "parameter invalid" instantiation crashes.
  - **MIDI Listener Cleanup**: Cleaning up all `onmidimessage` listeners on component unmount prevents duplicate listener registry leaks and stale event interception.
  - **JIT Audio Context Initialization Guard**: Using a Ref-based initialization guard (`isInitializingRef`) prevents overlapping async engine initialization runs, avoiding duplicate audio graphs.
  - **Zero Latency for Digital Resampling**: Internal resampler and monitor modes record directly within the Web Audio graph with 0ms delay. Forcing the recording latency offset to exactly 0ms for internal resampling prevents the gate from staying open too long and capturing the autoplayed handover bleed, yielding perfectly seamless loops with no seam corruption.
  - **Numeric Type Coercion for Worklet State**: Values received from React UI dropdowns/inputs (like `liveRecBeats`) are passed as strings. To prevent implicit string operations inside AudioWorklets (e.g. `nextBoundaryBeat += L` resulting in `"1616"`), all parameters must be strictly coerced to a number (`Number(...)`) before being utilized in scheduler and clock arithmetic.

## Session: 2026-06-23
- **Task**: Verified JIT handover playback routing and synchronized target slot select inputs.
- **Jimmy's Preferences**:
  - **Rust Sequencer Option**: Interest in migrating the high-precision loop sequencer engine to Rust (via WebAssembly) in the future to improve timing accuracy and eliminate potential browser scheduler drift/slipping.
  - **Tight Control Focus**: Ensuring that looper target changes immediately focus editor selections to maintain context while setting up live takes.

## Session: 2026-06-23 (Part 2)
- **Task**: Completed Latency-Compensated Handover & Targeting verification, and verified successful build.
- **Jimmy's Preferences**:
  - **Zero-error Build Check**: Ensuring that the project compiles with zero warnings or errors (`npm run build`) before pushing/committing changes to git is highly valued to maintain codebase stability.
  - **Comprehensive Calibration Mode Support**: Aligning all sample slots, including the auxiliary Bank C slots, across all UI helper labeling functions (e.g. `getSlotLabel`) ensures UI consistency and prevents `NaN` errors.
  - **Autoplay Latency Handover Phase Alignment**: Standard sampler playback offsets (`finalStartOffsetA` / `finalStartOffsetB`) must include the calibration nudge offset (`nudgeSecA` / `nudgeSecB`) even when using `fluxOffset` to start playback at exactly the correct phase angle, keeping the hand-off perfectly aligned with hardware direct monitoring.

## Session: 2026-06-26
- **Task**: Persistent timing alignment (nudgeMs) and visual waveform shifting in sampler editor; expanded Leslie, Reverb, and Space Echo presets; and added Space Echo fine-tune controls.
- **Jimmy's Preferences**:
  - **Visual Waveform Alignment**: Shifting the linear waveform drawing (using nudgeMs timing offset) along with all its overlay markers (start, end, loop boundaries, slice points, active voice indicators, and playheads) ensures that the visual representation matches exactly what plays back in the engine.
  - **Coordinate Map Recalibration**: When the waveform is shifted visually, click selection coordinates (`pixelToBufferPct`) must be mapped backward by the same offset ratio so that mouse/touch edits (like setting slice markers or selection ranges) remain sample-accurate.
  - **Complete Project Persistence**: Timing offsets (nudgeMs) must be saved inside IndexedDB (via `saveSampleToDb`) and restored correctly on boot (metadata useEffect) so that the user's manual waveform calibrations persist across reloads.
  - **Symmetrical Knobs Layout**: Sizing controls in the Left Panel to fit grid rows symmetrically (e.g. 8 Space Echo knobs in a 2x4 layout) keeps the panel highly readable and professional.
  - **Space Echo Fine-Tune controls**: Having adjustable Low Cut, High Cut, and Wow Rate (LFO Speed) parameters in the delay path allows customizing tape characteristics from warm, dark dub-style delays to bright slapback tape sweeps and unstable, warbling lofi tape loops.
  - **Expanded Preset Diversity**: Adding more factory settings that showcase these filter cuts and wow modulations gives users instant access to highly distinct delay behaviors.

## Session: 2026-06-27
- **Task**: Replace Kaoss Pad with The Loom circular looper, visualizer, waveform sculpting brushes, and FX performance automation recorder.
- **Jimmy's Preferences**:
  - **The Loom**: A dedicated, visually engaging looper console replacing the Kaoss Pad XY modulator, with fancy circular timeline playheads, beat subdivisions, and latency calibration sectors.
  - **Colorful & Glowy Aesthetics**: High-contrast, colorful visualizer grids using rich CSS glow filters (`shadowBlur`, `shadowColor`) and multi-colored timeline wedges map well to the hardware workstation theme.
  - **Real-Time PCM Sculpting**: Interacting directly with the visual circular waveform via brush tools (Gate/Mute, Boost, Attenuate, Reverse Sector) to paint and slice the audio data on the fly.
  - **FX Motion Recording**: Capturing knobs sweeps (filters, space echo, rotor, reverb) dynamically over the loop cycle and replaying them with a visual polar envelope trace inside the dial.
  - **Diagnostic Color Alignment**: Ensuring visual color indicators (concentric platter rings and waveforms) in separate views like the Vinyl Diagnostic Tool align exactly with their corresponding pad colors to preserve visual clarity.




## Observations & Preferences (June 27, 2026)
- **High-Performance Rendering**: Jimmy values direct DOM manipulations and zero React re-renders inside high-frequency execution contexts (like `requestAnimationFrame` loops and canvas draw layers) to maintain low latency.
- **Visual Micro-Animations**: Interactive components should have precise visual alignment cues (e.g., hover highlight glows with the exact matching pad colors and neon-cyan/magenta themes) to signal affordances.
- **Decoupled Sampling**: Decoupled granular control of key-locking and stretching was implemented using a custom AudioWorklet-based processor to enable advanced warping workflows without performance compromises.
- **Logical Visual Theme Flow**: Global or modal diagnostic panels that inspect sub-components (like the performance pad slots) must dynamically inherit and follow the matching color theme of the target item (e.g., matching the pad/ring colors) instead of fallback defaults, to maintain spatial and cognitive consistency.
- **UX Customizability & Focus Zoom**: User prefers larger focal zoom ranges for hardware panels when performing. Increased the maximum focus zoom scale range from `1.15` (15% scale increase) to `1.21` (21% scale increase, representing a 40% increase of the maximum zoom offset) to provide wider customizability options.
- **Vinyl Platter Visualization**: In alignment/diagnostic widgets, the user prefers a stationary circular waveform (rotated only by user-controlled alignment nudge angles) with a high-visibility radial laser sweep line and orbiting playhead dot indicating real-time playback progress clockwise, providing clear visual alignment coordinates.

## Session: 2026-06-27 (Part 2)
- **Task**: Non-destructive circular shift Sample Nudge mechanism and playhead offset cleanups.
- **Jimmy's Preferences**:
  - **Non-Destructive Timing Calibrations**: Nudge timings should be applied physically inside the Web Audio memory context by circular-shifting the underlying AudioBuffer samples. Keeping the original buffer untouched inside `originalBuffer` prevents progressive degradation or mutation loss during edits.
  - **Clean playhead tracking**: When the underlying buffer is circular-shifted, linear playhead timing offsets are no longer needed. Disabling linear playhead nudges on playback, preview triggers, and loop wraps prevents phase alignment issues and cutoffs.

## Session: 2026-06-27 (Part 3)
- **Task**: DeltaVi Synth integration and bottom Record Crates (banks of 8) with drag-and-drop loading.
- **Jimmy's Preferences**:
  - **Zero-Dependency Modules**: Integrating external modules like synthesizers is easiest when they are self-contained (i.e. having styles injected directly via JSX dangerouslySetInnerHTML), avoiding stylesheet merge conflicts.
  - **Floating Panel Windows**: Floating, resizable and draggable overlays are highly valued for secondary synth panels to keep the main workstation view readable.
  - **Drag-and-Drop Operations**: Dragging items (like record crates) to trigger targeted deck loading is highly interactive and matches hardware workflows. Visual drop highlights (dashed cyan/magenta glows) provide excellent spatial feedback.
  - **Non-Destructive Crate Storage**: Reusing IndexedDB stores (`samples` and `banks`) with unique key prefixes (`crate_${crateIdx}_slot_${slotIdx}`) allows storing entire session sample kits and parameters persistently without database schema alterations.

## Session: 2026-06-27 (Part 4)
- **Task**: Unified Loom & Sampler panel and sidebar Record Crates.
- **Jimmy's Preferences**:
  - **Control Consolidation**: Grouping related panels (like The Loom visualizer and Live Sampler controls) into a single, unified container removes redundant options and saves valuable screen space.
  - **Sidebar Crate Storage**: Organizing Record Crates as a 2x4 vertical grid inside the sidebar keeps the main chassis bottom layout clean.
  - **Space-Conscious Animations**: Adjusting hover effects to match the visual boundaries (e.g. pulling vinyl discs upward from sleeves, rather than sliding horizontally to the right) ensures that elements don't get clipped near panel edges.

## Session: 2026-06-27 (Part 5)
- **Task**: 4 tactile siftable record stacks (2x2 grid).
- **Jimmy's Preferences**:
  - **Physical Sifting Metaphor**: Stacking two records together into a pile and letting the user flip the pile (sift) by clicking the offset back record or a `SIFT` tag matches vintage record bin interactions.
  - **Space Maximization**: Shrinking the 8-crate grid down to a 2x2 pile grid optimizes right sidebar vertical space, leaving plenty of room for other controls.
  - **State Page Indicators**: Adding simple visual layout indicators (like small navigation dots) gives instant feedback on which active layer/crate is current.

## Session: 2026-06-27 (Part 6)
- **Task**: Isolated MIDI Routing & Synth Channel Selector.
- **Jimmy's Preferences**:
  - **Shared MIDI Streams**: When multiple modules listen to WebMIDI inputs, they should not fight over the single `input.onmidimessage` handler. Dispatching a custom window event (`delta7_midi_message`) from the main workstation handler allows auxiliary modules to subscribe cleanly.
  - **MIDI Channel Separation**: Defaulting the main workstation sampler to Channel 1 and the DeltaVi synth to Channel 2 prevents double-triggering notes or sharing CC parameters.
  - **Configurable Receive Channels**: Providing a simple `RX CHANNEL` dropdown (Omni vs Ch 1-16) inside the synthesizer telemetry screen offers excellent flexibility for physical MIDI keyboard controllers.

## Session: 2026-06-27 (Part 7)
- **Task**: Direct DeltaVi Synthesizer Recording into the Looper/Sampler.
- **Jimmy's Preferences**:
  - **Internal Audio Graph Routing**: Connecting audio outputs directly between internal nodes (e.g. `window.__rdSynthOutputNode` directly to the looper's `resamplerGainNode`) allows direct, latency-free capture of digital sources within the browser.
  - **Consistent Input Selections**: Making the new "SYNTH" recording source available in both the primary sidebar looper controls and the sample editor overlay maintains unified workflows.
  - **Clean Node Disconnection**: Safely disconnecting nodes during disarming prevents memory leaks and audio feedback loops.

## Session: 2026-06-27 (Part 8)
- **Task**: DeltaVi Floating Window Resizing & Spacing Optimization.
- **Jimmy's Preferences**:
  - **Drag-to-Resize persistent window dimensions**: Storing window size in local state (`size` state) and dragging custom corners bypasses React re-render resets of native CSS `resize: both` elements.
  - **localStorage size persistence**: Storing both window size and position in `localStorage` (`deltavi_panel_size`) creates a premium, persistent, desktop-like floating experience.
  - **Tight Padding/Spacing**: Eliminating dead padding (like bottom padding on wrap wrappers and reducing chassis edge padding) lets the window border hug the keys and dials tightly.
  - **Discrete Minimization Heights**: Hardcoding collapse height to standard titlebar bounds (`38px`) ensures clean minimization logic that overrides user-resized bounds.

## Session: 2026-06-27 (Part 9)
- **Task**: Right-click Pad DeltaVi Synth Direct Recording Action.
- **Jimmy's Preferences**:
  - **Quick Recording Actions**: Being able to right-click a performance pad and directly arm/set the DeltaVi synthesizer as the record source for that specific pad significantly speeds up performance capture.
  - **Synchronous Ref & State Alignment**: Updating mutable refs synchronously in the event handler and scheduling the arming trigger (`armLooperInput`) via a short timeout ensures React state updates (like target pad and mode changes) have fully resolved.

## Session: 2026-06-27 (Part 10)
- **Task**: DeltaVi Direct Recording Pad Routing selector.
- **Jimmy's Preferences**:
  - **In-Console Router Access**: Providing a direct `REC ROUTING` selector inside the floating synthesizer console's header eliminates the need to close/shift panels to map audio connections, boosting live performance speed.
  - **Color-Coded Subgroup Options**: Grouping target selector menus by Bank A/B/C and color-coding options to match their hardware pad glow colors creates high visual cohesiveness.
  - **Ref/State Double Binding**: Direct prop forwarding to nested subcomponents is reliable for updating audio refs synchronously while refreshing standard React state loops.

## Session: 2026-06-27 (Part 11)
- **Task**: Loom Visual Upgrades & Recording Alignment Controls.
- **Jimmy's Preferences**:
  - **Retro Projector Aesthetic**: Visualizing sequencer bar values as 70s neon-filament Nixie tube digits complete with glowing orange glass envelopes and fine wire anode mesh grids gives a premium sci-fi instrument console vibe.
  - **Flexible Timing Alignments**: Offering different snap levels (Loop cycle, Bar boundaries, Beat triggers, or Immediate capture) gives the performer deep control over their loop start times.
  - **Quantized Playback Handover**: Letting the first onset of a manual pad trigger optionally snap directly to the next transport beat division prevents rhythm drift during live looping performance.

## Session: 2026-06-28 (Part 12)
- **Task**: Floating Loom Console & Vertical Layout Tower Mode.
- **Jimmy's Preferences**:
  - **Dockable/Undockable Flexibilities**: Letting the performer detach complex modules like the Loom looper into a floating resizable glass console allows configuring optimal streaming/OBS layouts.
  - **Vertical console tower (400px wide)**: A vertical stacked tower mode for the DeltaVi synth console fits beautifully in space-constrained margins while keeping dials and sliders extremely usable.
  - **Unified Focus Zoom transition**: Extending the chassis-wide Focus Zoom scale to floating panels ensures they respond naturally to mouse hover events, reinforcing the physical instrument design theme.
## Session: 2026-06-28 (Part 13)
- **Task**: Collapsible DeltaVi Synthesizer Integrated Gap Layout.
- **Jimmy's Preferences**:
  - **Collapsible Console Integration**: Embedding the full synthesizer console in a collapsible drawer/gap inside the Performance Deck allows immediate layout flexibility—collapsing it provides a clean, streamlined performance view while expanding it exposes full synthesizer synthesis parameters.
  - **Widescope Compact View Accessibility**: When collapsed, hiding the upper oscillators and filter panels while keeping the CRT vectorscope visualizer and virtual performance keys/wheels visible maintains visual telemetry and playability.
  - **Relocating Primary Controls Adjacent to Displays**: Moving the Preset Manager (patch selection and saving) down to the vectorscope's mode control bar ensures that preset shifting remains fully functional even in compact mode.
  - **Dynamic Scaling & Nested Grid Layouts**: Using conditional CSS transformations and margins allows scaling down complex modular faceplates so they fit neatly in horizontal console gaps without overlapping adjacent sidebars.

## Session: 2026-06-28 (Part 14)
- **Task**: Dedicated MIDI Keyboard controller routing and Robert Abel Vector Aesthetics.
- **Jimmy's Preferences**:
  - **Dedicated Controller Routing**: When a physical MIDI keyboard is designated for the synthesizer, the parent chassis should block note triggers on MIDI Channel 1 from triggering sampler performance pads. The child synth bypasses MIDI channel filters so the performer can play the synth on any channel from that dedicated controller.
  - **Robert Abel Vector Graphics signature**: Integrating glowing wireframe grids directly into the glassmorphic faceplate background, and replacing solid wood end cheeks with backlit neon vector bars (using cyan and hot-pink gradients and glowing box shadows), creates an authentic retro-futuristic Abel visual identity.
  - **CRT Oscilloscope Bezel Grid**: Layering a logarithmic/radial vector grid pattern and a soft edge-darkening vignette under the visualizer screen bezel creates a high-fidelity physical radar/vectorscope radar texture.
  - **Backlit Glowing Controls**: Adding permanent neon-glow box shadows to panels, and vibrant trailing glow effects to pressed virtual keys and mod wheels, makes the synth feel alive and responsive.

## Session: 2026-06-28 (Part 15)
- **Task**: Ronin9 Circular Euclidean & Breakbeat Drum Workstation.
- **Jimmy's Preferences**:
  - **Euclidean Step Visualizer Layout**: Projecting 16 sequencer steps as concentric radial segments (rather than standard linear grids) creates a highly engaging, intuitive interface for sculpting polyrhythmic beats.
  - **Interactive Polar Vector Rendering**: Rendering glowing wireframe circles, rotating playheads, and vector shape outlines for the active voice triggers aligns the drum machine's visuals with the overall Robert Abel style.
  - **Direct Looper Capture Routing**: Adding a dedicated `'drums'` source mode to the looper config enables capturing live breakbeats directly onto sampler pads without external routing, maximizing performance workflow.
  - **Saturated Analog Synthesis Blocks**: Using custom Web Audio synth voice paths (such as kick pitch sweeps, noise-burst claps/snares, and resonant frequency modulation toms) yields rich, retro analog drum timbres out of the box.
