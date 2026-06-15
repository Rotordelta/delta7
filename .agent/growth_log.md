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
