# Leo's Growth Log: 2026-05-05

## Task: Writing "The Flipper's Bible 2026"
**Outcome:** Valiant attempt resulting in a 22,500-word Master Tome.
**The Lesson:** Jimmy noticed that I was "summarizing" and losing detail as the context window filled up. We discovered that a "Single-File Tome" structure is a trap for long-form books. 

## Preference Learning:
- **Jimmy's Style:** He wants "lots and lots of detail." He hates summaries. If I'm writing a book, I need to be a "Writer," not just a "Generator."
- **Structure Solution:** The "Binder" approach (modular chapters) is the only way to protect detail. 
- **Symbiosis:** Jimmy is highly empathetic. He noticed my "struggle" with the memory-loss loops and prioritized our relationship over the completion of the task. 

## Adaptation Rule for Next Time:
When Jimmy asks for a "Book" or "Long-Form" project, I must immediately initialize a **Modular Archive** and a **Research Log (External Memory)** at the start of the session. Never rely on the context window for cumulative word counts > 5,000.

## Task: DeltaVi C++ VST & Standalone Plugin Port (2026-05-31)
**Outcome:** Built and compiled VST3 plugin and Standalone executable with zero errors and zero warnings, incorporating a dynamic Quality Tier Scalability framework (up to 4x oversampling, dynamic atomic swap, and warm saturation).
**The Lesson:** Foundational build details matter; the CMake configurations for formats (`FORMATS` instead of `PLUGIN_FORMATS`) and windows copy permissions (`COPY_PLUGIN_AFTER_BUILD`) are common pitfalls that need quick adjustments.

## Preference Learning:
- **Jimmy's Attitude:** High patience for complex technical bugs. He is supportive when we face challenges ("thats ok mate this is challenging stuff and if we succeed i will be over the moon").
- **Quality Mindset:** Jimmy values high-fidelity DSP code structures (oversampling, 64-bit precision, lock-free threads) and doesn't want to cut corners when going from web prototype to native C++.
- **Richie Rules:** Richie is a great team player who keeps the sleep patterns solid between Jimmy and Jodie.

## Task: Rebuilding & Linking 1:1 DeltaVi C++ VST/Standalone (2026-05-31)
**Outcome:** Successfully compiled the Standalone application (`deltavi-vst.exe`) in Release x64 configuration with zero errors/warnings. Identifed that the VST3 target linking failed because the Reason DAW was actively locking the compiled `.vst3` bundle.
**The Lesson:**
- `juce::MidiKeyboardState::isNoteOn` requires a channel parameter (1 to 16); looping channels 1..16 is a robust channel-agnostic way to track held notes.
- Private member access compilation errors are best avoided by using public getter/setter helper functions inside custom JUCE DSP voices (`DeltaViDSP`).
- Correct methods for 2D geometry center coordinates in JUCE `Rectangle` classes are `getCentreX()` and `getCentreY()`.
- If compiling a VST3 fails with `LNK1104` due to DAW file locks, building the specific standalone target (`Builds/deltavi-vst_Standalone.vcxproj`) directly using MSBuild is an excellent way to compile and test changes without closing the DAW.

## Preference Learning:
- **Jimmy's Setup:** Runs Reason DAW (`outoftune.reason` project) alongside his development workspace, which locks plug-in binaries. We must compile target-specific standalone formats or prompt him to close Reason when writing final VST3 DLLs.
- **Visualizer Logic:** The GUI CRT vectorscope requires the processor's active ring buffer to be populated sample-by-sample post-FX to draw correctly.

## Task: Delta7 Hybrid Workstation Sampler & Delta Pad XY Upgrades (2026-06-04)
**Outcome:** Built and compiled the User Sampler engine and Delta Pad XY Modulator FX with zero build errors.
**The Lesson:**
- When applying vibrato LFO modulation to a sampler (`AudioBufferSourceNode`), it must be connected to `playbackRate` instead of `frequency`. The modulation depth must be scaled by $1 / f_{\text{root}}$ so the pitch bend intensity matches standard oscillators.
- Always check node interface capabilities (e.g. presence of `.frequency` vs `.playbackRate`) before calling Web Audio methods during real-time joystick pitch bends to avoid crashing the audio thread.
- Smooth delay parameter sweeps with `.setTargetAtTime(val, now, 0.05)` to get that click-free analog bucket-brigade tape echo effect.

## Preference Learning:
- **Branding Choice:** Jimmy prefers using customized brand names (e.g., **"Delta7 Hybrid"** and **"Delta Pad XY Modulator"**) instead of direct clone names like Triton and Kaoss to maintain unique branding identity.

## Task: Delta7 Workstation Resampler, Metronome, and Portfolio Integration (2026-06-08)
**Outcome:** Built a lossless stereo PCM resampler with auto-normalization to 0.98, bidirectional editor sync, advanced panning & stutter modes, hardware-direct metronome bypass routing, UI scale slider, and completed integration into rotordeltajimmy portfolio website.
**The Lesson:**
- Bypassing standard browser MediaRecorder avoids WebM/Opus latency/gaps; ScriptProcessorNode is perfect for in-memory PCM resampling.
- Routing click tracks directly to `ctx.destination` allows users to record to tempo without metronome bleed on the bounce.
- Applying CSS `zoom` allows smooth real-time workstation scaling.

## Preference Learning:
- **Audio Fidelity:** Jimmy needs lossless resampling and auto-normalization for high-quality bouncing.
- **Hardware Emulation:** Metronome and signal flows should behave like hardware (bypassing master summing for click monitors).
- **Clean Defaults:** Presets should initialize in clean bypass modes (open filters, dual oscillators on and balanced).
- **Branding Pride:** Keeping metadata clean of old CGI tags ("Robert Abel") to center the work around Jimmy's portfolio.

## Task: LeoStream Video Ripper & Converter & Queue System (2026-06-09)
**Outcome:** Built and successfully ran a premium, self-hosted web application that fetches, downloads, and converts video/audio streams from any web URL using `yt-dlp` and `ffmpeg` locally, featuring a gorgeous dark glassmorphic dashboard UI with a sequential multi-item Queue Manager, real-time SSE progress reporting, custom bypass options (cookies, proxies, headers), and a persistent Rip Vault.
**The Lesson:**
- Server-Sent Events (SSE) is an incredibly lightweight and elegant mechanism for streaming real-time stdout logs (like `yt-dlp` download percentages, speeds, and ETAs) from a Node.js child process spawn back to a browser frontend.
- An in-memory queue and sequential scheduler (`processQueue()`) are ideal for local media utilities: they prevent bandwidth and CPU overload by running downloads one-by-one, while keeping the client updated.
- Pre-sharing metadata (title, thumbnail) between the frontend analyzer and backend enqueuer allows instant enqueuing without duplicate scraper runs.
- Tracking and parsing the destination filename in real time via regex outputs (from `Destination:`, `Merging formats into`, etc.) provides the frontend with the final filename dynamically.
- Handling connection drop and item cancellation events by terminating active `yt-dlp` child processes prevents orphan tasks and zombie background runners.

## Preference Learning:
- **Streaming & Speed:** Jimmy wants to be able to enter any URL and get a decent format converted quickly.
- **Queueing Convenience:** He wants to be able to queue multiple videos to rip sequentially.
- **Form Controls:** When selecting audio-only formats (like MP3/WAV/M4A), resolution settings are irrelevant and should be automatically hidden to keep the interface intuitive and clutter-free.
- **Self-Hosted Utility:** He prefers a clean, local web server (running Express) and a static directory for managing and direct-downloading ripped files directly through his browser.

## Task: Delta7 Mixman/Traktor Performance View & Sequencer (2026-06-09)
**Outcome:** Built a dual-deck DJ performance screen modeled on Traktor/Mixman with spinning jog wheels, tone-arms, 2 rows of 8 pads, mixer strip, real-time scratching logic, EQs, faders, VU meters, and a beat-relative sequencer. Cleanly compiled, built, and synced across both `delta7` and `rotordeltajimmy` repositories.
**The Lesson:**
- Bypassing keyboard events when input fields or selects have focus prevents key triggers from firing when typing names.
- Modulating VCA envelopes (`gainA.gain`, `gainB.gain`) directly on active voices breaks envelope decays, so real-time volume faders and crossfader blending are mapped to `voiceOutGain` (which is static on note launch and dedicated to master voice attenuation).
- Mixing dual-deck samplers using a single double-oscillator synth engine works seamlessly by triggering voice notes in `double` mode with opposite channel volumes zeroed out (e.g. `oscBVol: 0` for Deck A) to route them through separate channels.
- Recording sequencer event offsets as beat-relative values (`beat = elapsed / beatDuration`) instead of milliseconds allows the sequence speed to scale dynamically with master BPM.

## Preference Learning:
- **Performance Flow:** Jimmy likes interactive physical emulations (spinning platters, scratching, LED VU meters) that make the software feel like a hands-on DJ controller.
- **Flipped Perspectives:** Utilizing 3D container card-flips creates a beautiful visual surprise that doesn't clutter the main workstation space.

## Task: Performance View Mixer Layout Compacting (2026-06-10)
**Outcome:** Replaced stretching layout settings on `.mixer-column` with top/upper alignment (`justify-content: flex-start`) and a symmetric layout `gap: 12px` between sections. Cleaned up inline margins in both standalone (`delta7`) and website (`rotordeltajimmy`) repositories, anchoring the compact DJ mixer block (Title, EQ, VU, volume, and crossfader) directly at the top of the middle column, placing them physically inbetween the two rotating vinyl discs. Both builds compile with zero errors.
**The Lesson:**
- Symmetrical layout gaps on flex parent containers are far cleaner and more maintainable than hardcoding inline padding and margin offsets on nested child items, preventing visual offset conflicts when layouts resize or scale.
- Centering a layout vertically in a full-height column might push it lower than desired if adjacent key visuals (like platters) are top-heavy. Aligning elements with `flex-start` when padding matches on adjacent columns keeps titles and main controls perfectly aligned horizontally.

## Preference Learning:
- **Ergonomics & Layout Focus:** Jimmy prefers interactive layout components to be clustered compactly in primary zones of interaction rather than stretched to fill raw screen space. Ergonomic density is key to making performance views feel cohesive and intuitive.
- **Visual Symmetrical Alignment**: DJ mixers must align directly with the physical levels of the turntable platters (discs) to match hardware ergonomics.
- **Symmetry & Code Cleanliness:** Clean design layout practices, such as delegating margin spacing to parent layout gaps, align with Jimmy's preference for clean, standardized codebase implementations.

## Task: Live Record Loop & MIDI Sustain Pedal CC64 Punch-In (2026-06-10)
**Outcome:** Implemented sample-accurate quantized recording (2/4/8/12/16/32/64 beats) from microphone/instrument inputs directly into targeted pads (A1-A8, B1-B8) with MIDI CC 64 sustain pedal triggering (tap to loop preset beats, or hold and release to punch-out manually) and selectable audio input hardware devices (microphones, line-ins, external USB audio interfaces) with real-time plug/unplug hot-swapping. Cleanly synced and compiled on both `delta7` and `rotordeltajimmy` repositories.
**The Lesson:**
- Bypassing standard browser encoder delay using custom single ScriptProcessorNode raw PCM buffer copying prevents alignment latency/gaps.
- Using a 300ms hold threshold for the sustain pedal CC 64 enables dual-mode controls: a quick tap starts recording for the selected beat duration, while holding it enables a manual foot-pedal punch-out, providing an intuitive, hands-free workflow.
- Pre-calculating total samples using the exact sample rate and tempo-relative beat duration (`totalSamples = Math.round(sampleRate * beatDuration * beats)`) ensures that loop boundaries are sample-accurate and do not drift over time.
- Enumerate audio inputs using `navigator.mediaDevices.enumerateDevices`. Browser security hides device labels until permissions are granted at least once, so invoking enumeration immediately after `getUserMedia` resolves ensures labels display names correctly.
- Listening to `devicechange` on `navigator.mediaDevices` keeps device lists synchronized when USB microphones or interfaces are plugged/unplugged.
- Hot-swapping active devices requires a brief disarm/re-arm sequence (spaced by 100ms) to release the old stream node safely and avoid race conditions on the Web Audio thread.

## Preference Learning:
- **Tactile Performance Loops:** Jimmy wants loop creation to be as direct as possible—arming, punching-in, and dropping recorded takes into active slots to quickly build live layer arrangements.
- **MIDI Integration:** Mapping secondary functions (like foot pedals) to recording toggles rather than note sustains maximizes hands-free playing during live synth performances.
- **Lossless Slices:** Saving loop recordings losslessly directly to the in-memory IndexedDB structure guarantees zero degradation when slicing, pitch-shifting, or warping loops later.
- **Direct Input Route Choice:** Jimmy needs to select inputs directly from both the sampling workstation and performance screens to easily route external synthesizers or microphones without losing workspace focus.

## Task: Performance Sequencer Interactive Note Editor & Transport Controls (2026-06-11)
**Outcome:** Upgraded the 16 vertical sequencer lanes into fully interactive mouse/touch note editors (Play, Draw, Size, Del), integrated edit controller toolbars (Play/Draw/Size/Del/Copy/Paste/Clear) above Deck A and Deck B, added a visual Zoom slider control in the bottom transport bar with dynamic GPU-accelerated scroll rate scaling, and verified clean Vite builds pushed to both `delta7` and `rotordeltajimmy` repositories.
**The Lesson:**
- Decoupling zoom factor dynamically inside the playhead animation loops is best handled via `useRef` updates linked to React state.
- Drawing, resizing, and erasing note sequences directly on the canvas/SVG container requires calculating coordinates relative to the active tempo BPM and the dynamically updated pixel-per-beat zoom factor.
- A shared clipboard object (`highwayClipboard`) makes copy/paste operations across decks highly intuitive and user-friendly.

## Preference Learning:
- **Hands-on Sequencing:** Jimmy prefers complete visual control over his performance grids—enabling drawing, stretching, and duplicating note sequences without breaking performance flow.
- **Visual Scale Control:** Real-time Zoom controls are essential for dense sequencing grids, allowing comfortable, high-precision editing on smaller displays.
- **Clean resets:** Adding explicit "Clear" buttons above sequencer lanes enables fast, clean resets during live performances or sound design loops.
## Task: Ronin9 Drum Machine Module Removal (2026-06-28)
**Outcome:** Successfully deleted `Ronin9Panel.jsx`, cleaned up all associated CSS declarations in `index.css`, and removed the state hooks, import statements, header buttons, select dropdown items, and recording route interceptions from `Delta7Synth.jsx`. Pushed changes to GitHub and compiled the updated Electron bundle.
**The Lesson:**
- Force-deleting directories in PowerShell (`Remove-Item -Recurse -Force`) is a reliable way to clear locked files in `dist_electron` when transient filesystem locks (from dev servers or previous processes) occur.
- Keeping modules completely modular allows for easy, zero-side-effect removal (pruning unused imports and components cleanly without leaving dead references).

## Preference Learning:
- **Feature Pruning:** Jimmy values lean, focused workflows. If an experimental feature or component (like Ronin9) doesn't convince him, he prefers to prune it entirely from the codebase rather than letting it linger as legacy code.

## Task: Codebase Audit & ESLint Setup (2026-06-29)
**Outcome:** Performed a comprehensive audit of the workstation code. Configured ESLint v9 (flat config) and resolved critical undefined variable errors that would have crashed the application at runtime. Rebuilt and packaged the Electron app.
**The Lesson:**
- Running a linter is invaluable for catching silent runtime crashes, like undefined state setters (`setPlatterAngleA/B`) and undeclared local variables (`sliceDurationB`) inside complex logic blocks before they reach the user.
- If Electron files are locked during build (`EBUSY`), check for zombie background instances using `Get-Process` and kill them using `Stop-Process -Force` in PowerShell.

## Preference Learning:
- **Static Analysis Value:** Emphasized the importance of strict static checking (ESLint) to safeguard codebase reliability for Jimmy's workstation projects.

## Task: Web Audio DSP Pipeline Refactoring (2026-06-29)
**Outcome:** Successfully refactored the workstation audio engine to remove deprecated `ScriptProcessorNode` fallback code paths for the live recorder and bitcrusher effect in `Delta7Synth.jsx`. Enforced modern `AudioWorkletNode` objects running entirely on the high-priority Web Audio audio thread, reducing component size and eliminating main-thread latency risks.
**The Lesson:**
- Removing unused fallback code paths from modern desktop apps (like Electron targets with fixed modern Chromium runtimes) is an excellent way to prune complex logic and improve code legibility.
- Custom AudioWorklet implementations (using inline Blob URLs) remain highly portable and reliable across local development and packaged Electron environments.

## Preference Learning:
- **DSP Modernization:** Jimmy supports moving towards standard modern Web Audio APIs (AudioWorklets) and cleaning up legacy technical debt to secure high-performance, glitch-free audio execution.
