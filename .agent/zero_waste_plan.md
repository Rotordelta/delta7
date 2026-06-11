# Delta7 Zero-Waste Architecture — Total System Reset

A comprehensive performance overhaul of [Delta7Synth.jsx](file:///C:/Users/hotwo/.gemini/antigravity/scratch/delta7/src/components/Delta7Synth.jsx) (16,760 lines / 722KB) to eliminate GC spikes, fix memory leaks, remove dead code, and achieve buttery-smooth real-time audio.

---

## Forensic Audit Results

### The Numbers

| Metric | Count | Verdict |
|--------|-------|---------|
| Inline `style={{}}` objects | **552** | 🔴 Each creates a new object every render |
| Anonymous `onClick/onChange/onMouse*` closures | **229** | 🔴 New function allocation per render |
| `useState` calls | **102** | 🔴 Every setState re-renders the ENTIRE 16K-line component |
| `useCallback` calls | **0** | 🔴 Zero memoization of callbacks |
| `useMemo` calls | **1** | 🔴 Zero memoization of computations |
| `ctx.create*` AudioNode calls | **190** | 🟡 Per-voice nodes — need pooling |
| `.disconnect()` calls | **14** | 🔴 Massive mismatch vs 190 creates |
| Spread `{...}` operators | **233** | 🟡 Many in hot voice-trigger paths |
| `.map()` calls | **88** | 🟡 Many unmemoized in render JSX |
| `.find()` calls | **38** | 🟡 Linear scans on every trigger |
| Embedded CSS `<style>` block | **1,953 lines** | 🟡 Re-parsed on mount, should be external |
| `requestAnimationFrame` loops | **7** | 🟢 Already using direct DOM mutation (good) |
| `addEventListener`/`removeEventListener` | **7/7** | 🟢 Balanced (good) |

### Critical Issues Found

#### 🔴 P0: GC Pressure from Render Churn

Every `setState` call re-renders the entire 16,760-line component. With **102 useState hooks**, a single pad trigger can cascade:
1. `setActivePerfPads()` → full re-render → **552 new style objects** + **229 new closures** allocated
2. `setDeckAPlaying()` → full re-render → same allocation storm
3. `setActiveNotes()` → full re-render → same allocation storm

**Result**: Triggering 1 pad = ~3 full re-renders = **~2,300 object allocations** → GC spike → audio stutter.

#### 🔴 P0: AudioNode Memory Leaks

Nodes created per voice in `playProgramVoice` but **missing from the `releaseVoice` disconnect list**:
- `stutterGateNode` — created line 6389, saved on voiceObj line 6697, **never disconnected**
- `stutterPannerNode` — created line 6392, saved line 6698, **never disconnected**
- `padPannerNode` — created line 6395, **never saved on voiceObj, never disconnected**
- Per-grain `grainSource`, `grainGain`, `vScale`, `dScale` — created inside granular loops (lines 5883–5939, 6235–6267), **never tracked or disconnected**
- Per-grain `panner` nodes — created line 5985, 6031–6035, 6109, 6302, 6318 — **never tracked or disconnected**

#### 🔴 P0: Voice Object Allocation Churn

Every note trigger creates a massive `voiceObj` with ~40 properties via object literal (line 5764). On release, nodes are cleaned up via `setTimeout` (line 6867) which itself allocates a closure + array (`nodesToDisconnect`). The voice object is never pooled — it's GC'd after release.

#### 🟡 P1: Dead/Redundant State

| State Variable | Issue |
|---|---|
| `ringAnglesA`, `ringAnglesB` | Declared (line 832-833) but rings are updated via direct DOM mutation in rAF loop. **Dead state**. |
| `currentPerfPlayBeat` | Declared (line 834) but beat tracking uses `seqCurrentBeatRef`. **Dead state**. |
| `vuLevelL`, `vuLevelR` | Declared (line 802-803) but VU uses refs directly. **Dead state**. |
| `deckAPlaying`, `deckBPlaying` | Used only for platter spin visual — could be ref-only since rAF loop already checks `deckAPlayingRef`. |

#### 🟡 P1: Inline Style Objects in Map Loops

The worst offenders are the performance pad grids (Deck A lines ~9350–9510, Deck B lines ~10550–10710). Each pad in the 2×4 grid renders with **~6 inline style objects** and **~8 anonymous closures**. With 16 pads across 2 decks = **~96 style objects + ~128 closures per render** just from pads alone.

---

## Proposed Changes — Phased Approach

> [!IMPORTANT]
> This is a large refactor. I propose executing it in **3 phases**, each independently testable and committable. Each phase targets a different layer of the stack.

### Phase 1: Audio Engine — Zero-Allocation Hot Paths
*Goal: Eliminate all GC pressure from voice triggering, release, and audio callbacks.*

#### [MODIFY] [Delta7Synth.jsx](file:///C:/Users/hotwo/.gemini/antigravity/scratch/delta7/src/components/Delta7Synth.jsx)

1. **Fix AudioNode leak in `releaseVoice`** (~line 6880):
   - Add `voice.stutterGateNode`, `voice.stutterPannerNode`, `voice.padPannerNode` to the `nodesToDisconnect` array.
   - Replace the `nodesToDisconnect` array allocation + `.forEach` with a flat sequence of inline `if (node) try { node.disconnect(); } catch {}` calls — zero array/closure allocation on every release.

2. **Track and clean up per-grain nodes**:
   - Add `voice.grainNodes = []` array on the voiceObj.
   - Push each `grainSource`, `grainGain`, `vScale`, `dScale`, and `panner` node into `voice.grainNodes` when created in the granular scheduling loops.
   - In `releaseVoice`, iterate `voice.grainNodes` and disconnect/stop each.

3. **Save `padPannerNode` on voiceObj**:
   - Store `voiceObj.padPannerNode = padPannerNode` alongside existing saves (~line 6697).

4. **Eliminate spread operators in `triggerPerfPadDSP`**:
   - Replace `const tempProg = { ...currentParams, ... }` (line ~7235) with a reusable pre-allocated `tempProgRef` object that is mutated in place. Reset specific fields instead of cloning 50+ properties.

5. **Convert audio-path `setActivePerfPads` to ref-only**:
   - Remove `setActivePerfPads` calls from `triggerPerfPadDSP` (called on every pad trigger from audio thread).
   - Use `activePerfPadsRef.current` directly. Update React state only on a throttled `requestAnimationFrame` tick for visual sync (batch UI updates at 60fps instead of per-trigger).

6. **Convert `setActiveNotes` to ref-only in voice path**:
   - Same pattern — use ref for audio logic, batch setState at 60fps for keyboard highlight visuals.

7. **Convert `setDeckAPlaying` / `setDeckBPlaying` to ref-only**:
   - These are already shadowed by `deckAPlayingRef` / `deckBPlayingRef`. Remove the useState entirely and read from ref in the rAF loop (which already does this).

### Phase 2: Render Path — Eliminate Per-Render Allocations
*Goal: Stop creating hundreds of objects and closures on every render.*

#### [NEW] [delta7-styles.css](file:///C:/Users/hotwo/.gemini/antigravity/scratch/delta7/src/components/delta7-styles.css)
- Extract the 1,953-line `<style>` block (lines 14411–16364) into a dedicated CSS file.
- Move all inline styles that are static (non-dynamic) into CSS classes.

#### [MODIFY] [Delta7Synth.jsx](file:///C:/Users/hotwo/.gemini/antigravity/scratch/delta7/src/components/Delta7Synth.jsx)

1. **Replace static inline `style={{}}` with CSS classes**:
   - Audit all 552 inline style objects.
   - Any style that doesn't depend on React state/props becomes a CSS class.
   - For dynamic styles (color based on slot state, etc.), use `className` toggling + CSS custom properties (`style={{ '--pad-color': ringColor }}`) — one property assignment vs a whole object.

2. **Pre-allocate dynamic style objects as constants**:
   - For styles that depend on a small number of states (e.g. pad active/inactive), create static style objects outside the component and select between them.

3. **Eliminate anonymous closures in pad loops**:
   - Replace `onClick={() => triggerPerfPadInternal('A', 'slot', idx, 100, true, true)}` with a single stable handler that reads the index from a `data-index` attribute:
     ```jsx
     onMouseDown={handlePadMouseDownA}
     data-index={idx}
     ```
   - Define `handlePadMouseDownA` once with `useCallback`.

4. **Remove dead useState hooks**:
   - Delete `ringAnglesA`, `ringAnglesB`, `currentPerfPlayBeat`, `vuLevelL`, `vuLevelR`.
   - Convert `deckAPlaying`/`deckBPlaying` to ref-only (done in Phase 1).

5. **Add `useMemo` for expensive render computations**:
   - Memoize `.map()` / `.find()` / `.filter()` calls in JSX that depend on `sampleSlots`, `perfEvents`, or `params`.

### Phase 3: Architecture — Structural Optimization
*Goal: Reduce the blast radius of state changes and enable component-level memoization.*

#### [MODIFY] [Delta7Synth.jsx](file:///C:/Users/hotwo/.gemini/antigravity/scratch/delta7/src/components/Delta7Synth.jsx)

1. **Batch audio-triggered UI updates**:
   - Create a single `uiSyncRef` object holding all audio-rate visual state (`activePerfPads`, `activeNotes`, `deckPlaying`, `vuLevels`).
   - Update this ref from audio callbacks (zero GC).
   - A single rAF loop reads the ref and calls one batched `setState` at 60fps if anything changed (using a dirty flag).

2. **Convert slot lookups from `.find()` to `Map`**:
   - Replace `sampleSlotsRef.current.find(s => s.id === slotId)` (38 occurrences, O(n) linear scan each) with a `slotMapRef = new Map()` keyed by slot ID. O(1) lookups.

3. **Pre-allocate `tempProg` voice parameter object**:
   - Create a single `tempProgRef = useRef({...DEFAULT_PARAMS})` and reuse it for every voice trigger. Mutate fields in-place instead of spreading.

---

## Open Questions

> [!IMPORTANT]
> **Execution Strategy**: Should I execute all 3 phases in one session, or would you prefer to test after each phase? Phase 1 (audio engine) alone will give you the biggest timing improvement — the render optimizations in Phase 2-3 are for overall smoothness and long-session stability.

---

## Verification Plan

### Automated Tests
- `npm run build` after each phase — zero errors/warnings.

### Manual Verification
- Load samples into both banks and trigger rapid pad sequences.
- Monitor Chrome DevTools Performance tab for GC spikes during playback.
- Check Chrome Task Manager for memory growth over 10+ minutes of continuous use.
- Verify all trigger modes (Hold, Latch, Free, Flux) still work correctly.
- Verify metronome, sequencer, and arpeggiator timing stability.
