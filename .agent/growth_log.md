# Growth Log

## Session: 2026-06-07
- **Aesthetic & UX Preferences**: Jimmy values highly tactile visual controls (such as the 2x2 grid for slice envelopes, pitch, and time stretching) and clean HSL-themed visual indicators that pop (yellow/magenta playheads and canvas slice highlights).
- **DSP Integrity**: Absolute requirement for click-free transients. Initializing nodes synchronously to zero and capping one-shot envelopes relative to playback length keeps the sound quality premium.
- **Workflow & Architecture**: Prefer unified layouts over nested tabs. Decoupling granular speed and pitch allows for classic sampler capabilities inside standard Web Audio parameters.
- **MIDI & Sync Integration**: Jimmy prefers low-latency external hardware integration. This includes continuous MIDI Clock (`0xF8`) sync, arpeggiator-bound Start/Stop commands, and a high-density, centralized MIDI CC Learn Matrix grid panel for immediate visual routing feedback.
- **Per-Slice Loop Override**: Slices should support independent looping behavior, overriding global sample loop parameters, which opens up more flexible rhythmic performance combinations.
- **Tactile Grid Previews**: Previewing slices via UI buttons should mimic hardware sampler pads—triggering immediately on press (mouse/touch down) and releasing on release (mouse/touch up/leave) to allow quick, responsive preview sweeps.
- **Decay & Capping Logic**: Looping slices should bypass envelope capping and allow the Attack-Decay envelope to decay completely to zero over the configured duration, while one-shot slices require capping to fit within the buffer limits to prevent clicks.
- **Granular Coordinate Mapping**: Reverse granular paths must align precisely with buffer coordinate spaces, preventing double-inverting offsets for reversed grain schedules.
- **Web Loopback Capture**: Capture high-quality browser tab audio using display media API, shutting down video tracks instantly to conserve processing resources.
- **Waveform Selection & DSP Splicing**: Enable fluid click-and-drag range selection overlay on the canvas and map Float32Array operations (Trim, Copy, Cut, Paste, Delete, Undo) to provide precise, destructive sample editing tools with undo history tracking.
- **Space Echo Ratios & Dub Ramper**: Integrated tempo-synced delay ratios (Free, 1/16 to 1/2) that automatically recalculate delay times on BPM shifts. Designed a Mod Wheel (CC 1) Dub Ramper that glides delay time (for tape-like pitch pitch-bends), scales feedback up to 0.99 for self-oscillation, and ramps tape saturation to create classic dub effects that reset cleanly to base parameters at 0.


