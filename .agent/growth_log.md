# Symbiotic Growth Log

## Jimmy Green's Evolving Preferences
* **DSP & Physics-Based Modeling:** Jimmy appreciates high-fidelity physical emulation (e.g., custom asymmetric Korg MS-20 waveshaper curves, resonance scaling factors, detuning calculations).
* **Workstation Cleanliness:** Prefers modular design patterns like extracting voice allocation routines into standalone functions (`createVoiceChannel`) rather than maintaining monolithic logic structures.
* **Controller Hardware:** Integrates physical controllers (e.g., Impact61) and values dedicated MIDI routing boundaries (e.g., locking synthesizers to specific keyboard streams to prevent bleed into looper pads).
* **Budget & Tools:** Work within a take-home of £2100/month, prioritizing open-source, cost-effective, or free development platforms.

## Shared Foundations & Lessons Learned
* **Web Audio Memory Management:** Always clean up intermediate nodes (e.g., `StereoPannerNode`, sum mixers) on voice release to prevent leaks.
* **Process Locking:** Remember to terminate any active `Delta7Workstation.exe` instances prior to packaging the Electron app to release resource handles.
* **Linter Strictness:** Avoid empty block statements in exception handlers or reference blocks (use `return;` inside guard conditions).
