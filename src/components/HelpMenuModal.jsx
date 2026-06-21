import React, { useState, useMemo } from 'react';

export default function HelpMenuModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');

  const chapters = useMemo(() => [
    {
      id: 'OVERVIEW',
      title: '1. Overview & UI Layout',
      icon: '🎛️',
      content: (
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#00f0ff', fontSize: '0.9rem' }}>Delta7 Sampler Workstation Overview</h3>
          <p>
            Delta7 is a professional-grade synthesizer and performance sampler workstation. It combines twin turntable decks, a phrasing sequencer, granular pitch warping, parametric equalizers, master FX, and a live resampler looper with zero-latency handovers.
          </p>
          <div style={styles.grid2}>
            <div style={styles.infoBox}>
              <strong style={{ color: '#00f0ff' }}>Top Header Bar</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', lineHeight: '1.3', color: '#a2b6c9' }}>
                Houses the Master Volume, BPM Speed, Metronome, Chord Mode selectors, 📁 Project dropdown, 🎛️ MIDI Mappings learn toggle, and UI bezel scaling slider.
              </p>
            </div>
            <div style={styles.infoBox}>
              <strong style={{ color: '#ff007f' }}>Center Screen</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', lineHeight: '1.3', color: '#a2b6c9' }}>
                A flip-card workspace displaying either the <strong>Waveform Visualizer</strong> (for trimming, looping, and slicing) or the <strong>Performance Sequencer</strong> (for note placement).
              </p>
            </div>
            <div style={styles.infoBox}>
              <strong style={{ color: '#ffe600' }}>8-Knob Console Strip</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', lineHeight: '1.3', color: '#a2b6c9' }}>
                Located at the bottom center, providing instant control over Filter Cutoff, Resonance, EG Intensity, EG Release, Osc A/B levels, LFO Rate, and IFX Mix.
              </p>
            </div>
            <div style={styles.infoBox}>
              <strong style={{ color: '#00ff66' }}>Mixing Console Strip</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', lineHeight: '1.3', color: '#a2b6c9' }}>
                Directly below the sequencer lanes, providing dedicated volume faders, panners, solos, mutes, and EQ editor launch triggers.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'PLATTERS',
      title: '2. Turntable Platters',
      icon: '💿',
      content: (
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#00f0ff', fontSize: '0.9rem' }}>Turntable Platter Decks (A & B)</h3>
          <p>
            The concentric vinyl platters on the left and right sides of the chassis represent Deck A (cyan) and Deck B (magenta). They provide both visual feedback and tactile playhead triggering.
          </p>
          <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Concentric Progress Rings</strong>: Each of the 8 loaded slots on a deck is rendered as a nested circular ring.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Orbiting Playheads</strong>: When a loop is playing, a satellite playhead dot orbits clockwise, representing the exact phase angle of the sample buffer in real-time.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Click-to-Select</strong>: Clicking on any platter ring resolves the closest ring index, allowing you to select that pad slot immediately.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Voice Start Scaling</strong>: Triggering a pad fires a visual impulse that swells the ring and decays exponentially.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'BANKS',
      title: '3. Sample Banks (A, B, C)',
      icon: '📁',
      content: (
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#00f0ff', fontSize: '0.9rem' }}>Sample Bank Configuration</h3>
          <p>Delta7 supports 24 total sample slots organized into three distinct 8-pad banks:</p>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Bank</th>
                <th style={styles.th}>Color Theme</th>
                <th style={styles.th}>Pads</th>
                <th style={styles.th}>Primary Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}><strong>Bank A</strong></td>
                <td style={{ ...styles.td, color: '#00f0ff' }}>Cyan</td>
                <td style={styles.td}>A1 - A8</td>
                <td style={styles.td}>Melodic loops, leads, and drum hits.</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Bank B</strong></td>
                <td style={{ ...styles.td, color: '#ff007f' }}>Magenta</td>
                <td style={styles.td}>B1 - B8</td>
                <td style={styles.td}>Sub-bass, pads, long chords, and textures.</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Bank C</strong></td>
                <td style={{ ...styles.td, color: '#ffe600' }}>Yellow</td>
                <td style={styles.td}>C1 - C8</td>
                <td style={styles.td}>Auxiliary loop storage & Live Resampling destination.</td>
              </tr>
            </tbody>
          </table>
          <h4 style={{ marginTop: '14px', marginBottom: '6px', color: '#ffe600', fontSize: '0.78rem' }}>Route Keyboard to Slices (Bank C)</h4>
          <p>
            When a Bank C slot is selected, enabling the <strong>ROUTE KEYBOARD (C3-D#4) TO SLICES</strong> toggle routes MIDI notes 48-63 to trigger individual slices `0` to `15` of that slot. Keys display slice indices (`S0` to `S15`) with an orange bottom bezel highlight, allowing slice jamming rehearsals without triggering performance sequencer recordings.
          </p>
        </div>
      )
    },
    {
      id: 'WAVEFORM',
      title: '4. Waveform & Slicing',
      icon: '📊',
      content: (
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#00f0ff', fontSize: '0.9rem' }}>Waveform Visualizer & Slices</h3>
          <p>
            Selecting a slot and flipping the center card to the Waveform screen opens the editor. Here you can manipulate boundaries, slice grids, and amp/filter envelopes.
          </p>
          <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Zoom & Scroll</strong>: Zoom up to **100X** by dragging the zoom slider to locate precise transient starts. Scroll horizontally to inspect long loops.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Boundary Brackets</strong>: Drag the green sliders to adjust Sample Start (`start`) and Sample End (`end`). Double-click the brackets to snap back to the absolute file boundaries.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Slicing Modes</strong>:
              <ul style={{ paddingLeft: '14px', marginTop: '4px' }}>
                <li><strong>Auto Grid</strong>: Evenly slices the buffer into 4, 8, 12, or 16 divisions.</li>
                <li><strong>Manual Slices</strong>: Double-click inside the waveform to add custom slice markers. Drag markers to adjust, and right-click to delete individual points.</li>
              </ul>
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#ff4444' }}>🗑️ CLEAR Slot</strong>: Deletes the sample buffer and presets from database storage, resetting the slot to an empty state.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'GRANULAR',
      title: '5. Granular Warp Engine',
      icon: '🧬',
      content: (
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#00f0ff', fontSize: '0.9rem' }}>Granular Warp & Decoupled Pitch</h3>
          <p>
            The Granular Warp Engine allows you to transpose loop pitches without altering their speed, or warp their tempo to match the master sequencer BPM.
          </p>
          <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Warp Mode Toggle</strong>: Forces the sample into the granular time-stretcher. It utilizes **4x overlapping grain windows** (25ms) to eliminate tremolo flutter and metallic buzzing.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Decoupled Transposition</strong>: Sweep the Tuning slider (-12.0 to +12.0 semitones) or adjust the Octave buttons (-2 to +2). The pitch shifts smoothly in real-time while the loop remains locked to the grid.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Anti-Zipper Glides</strong>: Tuning updates use `linearRampToValueAtTime` over a 35ms window to prevent digital step clicks.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Clean bypass</strong>: If Pitch Tuning is set to 0 semitones, the warp engine automatically bypasses, routing raw high-fidelity CD-quality PCM to preserve transient clarity.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'SEQUENCER',
      title: '6. Phrasing Sequencer',
      icon: '🎹',
      content: (
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#00f0ff', fontSize: '0.9rem' }}>Tron-Style Phrasing Sequencer</h3>
          <p>
            The sequencer scrolls note lanes downward towards the trigger boundaries at the bottom of the screens.
          </p>
          <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Glowing Voids note pills</strong>: Notes display as hollow neon boxes that mask the cyan grid lines behind them.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Trigger-Mode Borders</strong>:
              <ul style={{ paddingLeft: '14px', marginTop: '4px' }}>
                <li><strong>Latch</strong>: Solid continuous neon blocks indicating loops.</li>
                <li><strong>Hold</strong>: Hollow neon boxes.</li>
                <li><strong>Free</strong>: Dashed borders (async one-shots).</li>
                <li><strong>Flux</strong>: Double borders (slip mode phase synchronization).</li>
                <li><strong>Queue</strong>: Dotted borders (quantized loop queue triggers).</li>
              </ul>
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Armed Record (Auto-Rec)</strong>: Activating `ARM REC` puts the sequencer on standby at beat `0.0`. It starts running only when you hit the first pad, guaranteeing perfectly aligned takes.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Editor Tools</strong>: Select (`Sel`) notes, drag to shift pitch or beat position, and copy, cut, or paste using the right actions panel or keyboard shortcuts (`Ctrl+C`, `Ctrl+X`, `Ctrl+V`).
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'EFFECTS',
      title: '7. Master Effects & Reverb',
      icon: '🌌',
      content: (
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#00f0ff', fontSize: '0.9rem' }}>Master Effects Panel</h3>
          <p>Exposes global processors to color the workstation master bus:</p>
          <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Space Echo</strong>: Vintage tape delay simulator with Time, Feedback, and Mix settings.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Leslie Cabinet</strong>: Rotary speaker simulator featuring Fast/Slow speed modes and Mix control.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Algorithmic Reverb Unit</strong>: Synthesizes high-density impulse responses on the fly.
              <ul style={{ paddingLeft: '14px', marginTop: '4px' }}>
                <li><strong>Profiles</strong>: PLATE, LONG, SHORT, HALL, and REVERSE.</li>
                <li><strong>Freeze Toggle</strong>: Forces the feedback loop to 90%, sustaining tails indefinitely.</li>
              </ul>
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Master Preamp</strong>: Soft-clipper saturation stage. When set to `0.0`, it engages a 100% transparent hardware bypass.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'EQ',
      title: '8. 6-Band Parametric EQ',
      icon: '📊',
      content: (
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#00f0ff', fontSize: '0.9rem' }}>Per-Pad 6-Band EQ</h3>
          <p>
            Clicking the <strong>EQ</strong> badge at the top-left of any loaded pad opens the interactive 6-band parametric equalizer.
          </p>
          <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Logarithmic SVG Response Graph</strong>: Displays the exact composite magnitude transfer function of the filter chain from 20Hz to 20kHz.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Draggable Node Points</strong>: Click and drag nodes on the graph. Dragging vertically scales Gain (-12dB to +12dB), and dragging horizontally scales Frequency.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Zero-Phase Click-Free Bypassing</strong>: Toggling filters on/off dynamically scales parameters using a 15ms ramp rather than disconnecting audio nodes, completely eliminating digital pops.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'LOOPER',
      title: '9. Resampler & Calibration',
      icon: '🎙️',
      content: (
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#00f0ff', fontSize: '0.9rem' }}>Live Resampler & Latency Compensation</h3>
          <p>
            Delta7 features a Live Resampling Looper supporting internal resampling (mixdown recording) or external hardware line/mic capture at 48kHz.
          </p>
          <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#ffe600' }}>Just-In-Time (JIT) Handover</strong>: To gather late samples without clipping, the looper continues recording past the boundary. It posts a `HANDOVER_START` chunk for instant autoplay, then merges the final frames asynchronously.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#ffe600' }}>Visual Latency Calibration Modal</strong>: Open the modal to align loops:
              <ul style={{ paddingLeft: '14px', marginTop: '4px' }}>
                <li><strong>Auto-Calibration</strong>: Runs cross-correlation analysis between recorded waveforms and reference buffers, snapping the offset slider to the exact latency.</li>
                <li><strong>Ruler & Zoom</strong>: Zoom up to 20X on the loop start, with a 50ms pre-roll to reveal early/rushed transients.</li>
              </ul>
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#ffe600' }}>Circular Platter Alignment (Visual Align)</strong>: Wraps the waveforms in concentric circles. Drag and spin the platter to align visual phase angles, which adjusts playing voices in real-time.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'MIDI',
      title: '10. MIDI Sync & Learning',
      icon: '🎹',
      content: (
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#00f0ff', fontSize: '0.9rem' }}>MIDI Clock & Hardware Learning</h3>
          <p>
            Delta7 integrates MIDI control mapping and clock synchronization.
          </p>
          <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Outbound Clock Scheduler</strong>: Emits high-precision midi clock ticks (`0xF8`) using an lookahead scheduler running every 50ms, achieving sub-millisecond hardware stability.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Inbound Sync Jitter Filter</strong>: Smooths incoming clock timings using a rolling 24-tick average, preventing pitch warbles on tempo shifts.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#ff00ff' }}>Hardware Port Filtering</strong>: Automatically filters out note, CC, and pitch bend data from any port containing `TR-8` or `TR8` to isolate synth triggers from drum machine patterns.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#ffe600' }}>MIDI Learn matrix</strong>: Click `🎛️ MIDI MAPPINGS` in the header bar. Every dial, button, or pad overlay turns orange. Trigger a MIDI control on your hardware to bind it.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'PROJECT',
      title: '11. Project & WAV Export',
      icon: '💾',
      content: (
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#00f0ff', fontSize: '0.9rem' }}>Project Directory & Offline Bounce</h3>
          <p>
            Delta7 maps folders directly onto local disk space via the File System Access API.
          </p>
          <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Project Directory</strong>: Creates `/banks` (metadata JSON), `/samples` (user WAVs), and `/exports` (bounces) inside the selected folder.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Offline Bounce Engine</strong>:
              <ul style={{ paddingLeft: '14px', marginTop: '4px' }}>
                <li><strong>Stereo Mixdown</strong>: Bounces the master output channel containing all active decks, effects, and automation.</li>
                <li><strong>Multi-Track Stems</strong>: Renders separate WAV files for each of the 24 individual sample slots, exporting them to the local directory.</li>
              </ul>
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>WAV Encoder</strong>: Outputs studio-grade **16-bit** or **24-bit PCM** WAV files with correct RIFF headers.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#00f0ff' }}>Self-Healing Loader</strong>: Filters and clamps `NaN` or `Infinite` database values during project loading to ensure database stability.
            </li>
          </ul>
        </div>
      )
    }
  ], []);

  const filteredChapters = useMemo(() => {
    if (!searchQuery) return chapters;
    const query = searchQuery.toLowerCase();
    return chapters.filter(ch => 
      ch.title.toLowerCase().includes(query) || 
      ch.id.toLowerCase().includes(query)
    );
  }, [chapters, searchQuery]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Modal Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem', color: '#00f0ff' }}>📖</span>
            <span style={styles.titleText}>WORKSTATION USER GUIDE & FEATURE LIST</span>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div style={styles.body}>
          {/* Sidebar */}
          <div style={styles.sidebar}>
            {/* Search Input */}
            <div style={{ padding: '10px', borderBottom: '1px solid rgba(0, 243, 255, 0.15)' }}>
              <input
                type="text"
                placeholder="Search guide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            {/* Chapters List */}
            <div style={styles.sidebarList}>
              {filteredChapters.map((ch) => {
                const isActive = activeTab === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveTab(ch.id)}
                    style={{
                      ...styles.sidebarItem,
                      backgroundColor: isActive ? 'rgba(0, 243, 255, 0.12)' : 'transparent',
                      color: isActive ? '#00f0ff' : '#9bb0c5',
                      borderLeft: isActive ? '3px solid #00f0ff' : '3px solid transparent'
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>{ch.icon}</span>
                    <span>{ch.title}</span>
                  </button>
                );
              })}
              {filteredChapters.length === 0 && (
                <div style={{ padding: '20px 10px', color: '#687e96', fontSize: '0.65rem', textAlign: 'center' }}>
                  No chapters found
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div style={styles.contentArea}>
            {chapters.find(ch => ch.id === activeTab)?.content || (
              <div style={{ color: '#687e96' }}>Select a chapter to read details.</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={{ fontSize: '0.62rem', color: '#687e96' }}>
            Delta7 Workstation v1.2.0 • Press Esc or click Close to return
          </span>
          <button style={styles.footerCloseBtn} onClick={onClose}>
            CLOSE GUIDE
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(5, 7, 12, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 20000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
    pointerEvents: 'auto'
  },
  modal: {
    width: '940px',
    height: '640px',
    background: 'rgba(15, 20, 32, 0.96)',
    border: '1px solid rgba(0, 243, 255, 0.25)',
    borderRadius: '8px',
    boxShadow: '0 0 35px rgba(0, 243, 255, 0.18)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    height: '45px',
    borderBottom: '1px solid rgba(0, 243, 255, 0.2)',
    background: 'rgba(10, 14, 24, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
  },
  titleText: {
    fontSize: '0.76rem',
    fontWeight: 'bold',
    color: '#00f0ff',
    letterSpacing: '1px'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#687e96',
    cursor: 'pointer',
    fontSize: '1rem',
    outline: 'none',
    transition: 'color 0.2s',
  },
  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  sidebar: {
    width: '240px',
    borderRight: '1px solid rgba(0, 243, 255, 0.15)',
    background: 'rgba(10, 14, 24, 0.4)',
    display: 'flex',
    flexDirection: 'column'
  },
  searchInput: {
    width: '100%',
    background: 'rgba(5, 7, 12, 0.6)',
    border: '1px solid rgba(0, 243, 255, 0.2)',
    borderRadius: '4px',
    color: '#00f0ff',
    fontSize: '0.68rem',
    padding: '6px 8px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'monospace'
  },
  sidebarList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0'
  },
  sidebarItem: {
    background: 'transparent',
    border: 'none',
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '0.68rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    outline: 'none',
    transition: 'all 0.15s',
    fontFamily: 'monospace',
    letterSpacing: '0.3px'
  },
  contentArea: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    fontSize: '0.72rem',
    lineHeight: '1.5',
    color: '#d4e2f0',
    background: 'rgba(5, 7, 12, 0.15)'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginTop: '16px'
  },
  infoBox: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '6px',
    padding: '12px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '12px',
    fontSize: '0.68rem',
    textAlign: 'left'
  },
  th: {
    borderBottom: '1px solid rgba(0, 243, 255, 0.2)',
    padding: '8px',
    color: '#00f0ff',
    fontWeight: 'bold'
  },
  td: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '8px',
    color: '#bcccdb'
  },
  footer: {
    height: '50px',
    borderTop: '1px solid rgba(0, 243, 255, 0.2)',
    background: 'rgba(10, 14, 24, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px'
  },
  footerCloseBtn: {
    background: 'transparent',
    border: '1px solid #00f0ff',
    borderRadius: '4px',
    color: '#00f0ff',
    fontSize: '0.68rem',
    fontWeight: 'bold',
    padding: '6px 16px',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 0 10px rgba(0, 243, 255, 0.2)',
    fontFamily: 'monospace',
    transition: 'all 0.2s',
  }
};
