import React, { useState } from 'react';

export default function RecordCrates({ crates, onSaveCrate, onLoadCrate, onDeleteCrate, onRenameCrate }) {
  // pileLayers state: [layer0, layer1, layer2, layer3]
  // 0 means showing first crate (indices 0-3), 1 means showing second crate (indices 4-7)
  const [pileLayers, setPileLayers] = useState([0, 0, 0, 0]);
  const [editingCrateIdx, setEditingCrateIdx] = useState(null);
  const [tempName, setTempName] = useState('');

  const piles = [
    { id: 0, name: 'PILE I', indices: [0, 4] },
    { id: 1, name: 'PILE II', indices: [1, 5] },
    { id: 2, name: 'PILE III', indices: [2, 6] },
    { id: 3, name: 'PILE IV', indices: [3, 7] }
  ];

  const togglePile = (pileIdx) => {
    setPileLayers(prev => {
      const next = [...prev];
      next[pileIdx] = next[pileIdx] === 0 ? 1 : 0;
      return next;
    });
    // Stop editing if switching piles
    setEditingCrateIdx(null);
  };

  const handleRenameStart = (idx, currentName) => {
    setEditingCrateIdx(idx);
    setTempName(currentName);
  };

  const handleRenameSave = (idx) => {
    onRenameCrate(idx, tempName.trim() || `Crate ${idx + 1}`);
    setEditingCrateIdx(null);
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Enter') {
      handleRenameSave(idx);
    } else if (e.key === 'Escape') {
      setEditingCrateIdx(null);
    }
  };

  return (
    <div className="patches-quick-category font-mono" style={{ 
      marginTop: '6px', 
      background: 'rgba(0,0,0,0.35)', 
      border: '1px solid rgba(0, 243, 255, 0.18)', 
      borderRadius: '4px',
      padding: '8px',
      userSelect: 'none'
    }}>
      {/* Panel Header */}
      <span className="knob-label" style={{ 
        color: '#ffe600', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
        fontWeight: 'bold',
        fontSize: '0.55rem',
        letterSpacing: '0.5px'
      }}>
        <span>📚 RECORD PILES (4 STACKS)</span>
        <span style={{ fontSize: '0.38rem', color: '#888', fontWeight: 'normal' }}>DRAG TO DECK</span>
      </span>

      {/* 2x2 Pile Grid */}
      <div className="crates-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '10px 8px',
        paddingTop: '6px'
      }}>
        {piles.map((pile, pileIdx) => {
          const activeLayer = pileLayers[pileIdx]; // 0 or 1
          const activeCrateIdx = pile.indices[activeLayer];
          const inactiveCrateIdx = pile.indices[activeLayer === 0 ? 1 : 0];
          
          const activeCrate = crates[activeCrateIdx];
          const inactiveCrate = crates[inactiveCrateIdx];
          
          const isLoaded = activeCrate.loaded;
          const isInactiveLoaded = inactiveCrate.loaded;

          return (
            <div 
              key={pile.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                paddingTop: '6px' // space for back sleeve offset
              }}
            >
              {/* STACK CONTAINER */}
              <div style={{
                position: 'relative',
                width: '60px',
                height: '60px',
                marginBottom: '4px'
              }}>
                {/* 1. BACK SLEEVE (INACTIVE RECORD) */}
                <div 
                  onClick={() => togglePile(pileIdx)}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '6px',
                    width: '54px',
                    height: '54px',
                    background: 'linear-gradient(135deg, #090e17 0%, #030508 100%)',
                    border: isInactiveLoaded ? '1px solid rgba(0, 243, 255, 0.15)' : '1px dashed rgba(255, 255, 255, 0.06)',
                    borderRadius: '3px',
                    opacity: 0.45,
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}
                  title={`Flip to: ${inactiveCrate.name}`}
                >
                  <span style={{ fontSize: '0.34rem', color: isInactiveLoaded ? '#00f3ff' : '#444' }}>
                    #{inactiveCrateIdx + 1}
                  </span>
                </div>

                {/* 2. FRONT SLEEVE (ACTIVE RECORD) */}
                <div 
                  className={`crate-card-container ${isLoaded ? 'is-loaded' : ''}`}
                  draggable={isLoaded}
                  onDragStart={(e) => {
                    if (!isLoaded) return;
                    e.currentTarget.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData('text/plain', `crate_${activeCrateIdx}`);
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.classList.remove('dragging');
                  }}
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '54px',
                    height: '54px',
                    background: 'linear-gradient(135deg, #101622 0%, #06090e 100%)',
                    border: isLoaded ? '1px solid rgba(0, 243, 255, 0.45)' : '1px dashed rgba(255, 255, 255, 0.12)',
                    boxShadow: isLoaded ? '0 4px 10px rgba(0,0,0,0.7)' : 'none',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible',
                    zIndex: 2,
                    cursor: isLoaded ? 'grab' : 'default',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Vinyl record disc sticking out slightly when loaded */}
                  {isLoaded && (
                    <div 
                      className="vinyl-disc"
                      style={{
                        position: 'absolute',
                        right: '-5px',
                        top: '3px',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'repeating-radial-gradient(circle, #0c1017 0px, #0c1017 1px, #141b26 2px, #0c1017 3px)',
                        boxShadow: '1px 2px 4px rgba(0,0,0,0.6)',
                        zIndex: -1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.25s ease'
                      }}
                    >
                      {/* Vinyl Label */}
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#ffe600',
                        border: '1px solid #000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 0 2px rgba(0,0,0,0.8)'
                      }}>
                        <div style={{
                          width: '3px',
                          height: '3px',
                          borderRadius: '50%',
                          background: '#000'
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Sleeve Center Graphic */}
                  <div style={{
                    color: isLoaded ? '#00f3ff' : '#444',
                    fontFamily: 'monospace',
                    fontSize: '0.38rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1px'
                  }}>
                    <span style={{ fontSize: '0.42rem', color: isLoaded ? '#ffe600' : '#444' }}>CRT</span>
                    <span>{String(activeCrateIdx + 1).padStart(2, '0')}</span>
                  </div>
                  
                  {/* Sift/Flip trigger overlay tag */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePile(pileIdx);
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      background: '#111827',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '2px',
                      padding: '0 2px',
                      fontSize: '0.32rem',
                      color: '#ffe600',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                    }}
                    title="Flip Record Stack"
                  >
                    SIFT 🔄
                  </div>
                </div>
              </div>

              {/* Title / Rename Area */}
              <div style={{ width: '100%', minHeight: '13px', display: 'flex', justifyContent: 'center', marginBottom: '3px' }}>
                {editingCrateIdx === activeCrateIdx ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => handleRenameSave(activeCrateIdx)}
                    onKeyDown={(e) => handleKeyDown(e, activeCrateIdx)}
                    autoFocus
                    maxLength={14}
                    style={{
                      width: '95%',
                      background: '#000',
                      border: '1px solid #ffe600',
                      color: '#ffe600',
                      fontSize: '0.44rem',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      padding: '0px 1px',
                      outline: 'none',
                      borderRadius: '2px'
                    }}
                  />
                ) : (
                  <span 
                    onClick={() => handleRenameStart(activeCrateIdx, activeCrate.name)}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.46rem',
                      color: isLoaded ? '#fff' : '#555',
                      cursor: 'pointer',
                      textAlign: 'center',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: '115px',
                      display: 'block'
                    }}
                    title="Click to rename"
                  >
                    {activeCrate.name}
                  </span>
                )}
              </div>

              {/* Page Indicator dots */}
              <div style={{ display: 'flex', gap: '3px', marginBottom: '4px', alignItems: 'center' }}>
                <span 
                  onClick={() => activeLayer !== 0 && togglePile(pileIdx)}
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: activeLayer === 0 ? '#00f3ff' : '#444',
                    boxShadow: activeLayer === 0 ? '0 0 4px #00f3ff' : 'none',
                    cursor: 'pointer'
                  }}
                />
                <span 
                  onClick={() => activeLayer !== 1 && togglePile(pileIdx)}
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: activeLayer === 1 ? '#00f3ff' : '#444',
                    boxShadow: activeLayer === 1 ? '0 0 4px #00f3ff' : 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Save / Load / Clear Row controls */}
              <div style={{ 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2px',
                opacity: editingCrateIdx === activeCrateIdx ? 0.3 : 1,
                pointerEvents: editingCrateIdx === activeCrateIdx ? 'none' : 'auto'
              }}>
                {/* Save Buttons */}
                <div style={{ display: 'flex', gap: '2px', width: '100%' }}>
                  <button 
                    onClick={() => onSaveCrate(activeCrateIdx, 'a')}
                    className="btn btn-xs"
                    style={{
                      flex: 1,
                      fontSize: '0.34rem',
                      padding: '1px 0',
                      margin: 0,
                      borderColor: 'rgba(0, 243, 255, 0.25)',
                      color: '#00f3ff',
                      cursor: 'pointer'
                    }}
                    title="Save current Deck A samples to this crate"
                  >
                    SAVE A
                  </button>
                  <button 
                    onClick={() => onSaveCrate(activeCrateIdx, 'b')}
                    className="btn btn-xs"
                    style={{
                      flex: 1,
                      fontSize: '0.34rem',
                      padding: '1px 0',
                      margin: 0,
                      borderColor: 'rgba(255, 0, 255, 0.25)',
                      color: '#ff00ff',
                      cursor: 'pointer'
                    }}
                    title="Save current Deck B samples to this crate"
                  >
                    SAVE B
                  </button>
                </div>

                {/* Load & Clear Buttons */}
                {isLoaded && (
                  <div style={{ display: 'flex', gap: '2px', width: '100%' }}>
                    <button 
                      onClick={() => onLoadCrate(activeCrateIdx, 'a')}
                      className="btn btn-xs"
                      style={{
                        flex: 1,
                        fontSize: '0.34rem',
                        padding: '1px 0',
                        margin: 0,
                        borderColor: '#00f3ff',
                        color: '#00f3ff',
                        background: 'rgba(0, 243, 255, 0.08)',
                        cursor: 'pointer'
                      }}
                      title="Load crate samples into Deck A"
                    >
                      LD A
                    </button>
                    <button 
                      onClick={() => onLoadCrate(activeCrateIdx, 'b')}
                      className="btn btn-xs"
                      style={{
                        flex: 1,
                        fontSize: '0.34rem',
                        padding: '1px 0',
                        margin: 0,
                        borderColor: '#ff00ff',
                        color: '#ff00ff',
                        background: 'rgba(255, 0, 255, 0.08)',
                        cursor: 'pointer'
                      }}
                      title="Load crate samples into Deck B"
                    >
                      LD B
                    </button>
                    <button 
                      onClick={() => onDeleteCrate(activeCrateIdx)}
                      className="btn btn-xs"
                      style={{
                        flex: 0.4,
                        fontSize: '0.34rem',
                        padding: '1px 0',
                        margin: 0,
                        borderColor: '#ff4444',
                        color: '#ff4444',
                        cursor: 'pointer'
                      }}
                      title="Delete / Clear this crate"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
