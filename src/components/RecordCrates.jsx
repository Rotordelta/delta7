import React, { useState } from 'react';

export default function RecordCrates({ crates, onSaveCrate, onLoadCrate, onDeleteCrate, onRenameCrate }) {
  const [editingCrateIdx, setEditingCrateIdx] = useState(null);
  const [tempName, setTempName] = useState('');

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
      marginTop: '8px', 
      background: 'rgba(0,0,0,0.3)', 
      border: '1px solid rgba(0, 243, 255, 0.15)', 
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
        <span>⚡ RECORD CRATES (BANKS OF 8)</span>
        <span style={{ fontSize: '0.38rem', color: '#666', fontWeight: 'normal' }}>DRAG TO DECK</span>
      </span>

      {/* Crates 2x4 Grid */}
      <div className="crates-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '6px' 
      }}>
        {crates.map((crate, idx) => {
          const isLoaded = crate.loaded;
          return (
            <div 
              key={crate.id}
              className={`crate-card-container ${isLoaded ? 'is-loaded' : ''}`}
              draggable={isLoaded}
              onDragStart={(e) => {
                if (!isLoaded) return;
                e.currentTarget.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('text/plain', `crate_${idx}`);
              }}
              onDragEnd={(e) => {
                e.currentTarget.classList.remove('dragging');
              }}
              style={{
                background: 'rgba(5, 8, 16, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '3px',
                padding: '4px 5px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.15s ease',
                cursor: isLoaded ? 'grab' : 'default'
              }}
            >
              {/* Vinyl record representation */}
              <div 
                className="vinyl-sleeve-wrapper"
                style={{
                  width: '56px',
                  height: '56px',
                  position: 'relative',
                  background: 'linear-gradient(135deg, #101622 0%, #06090e 100%)',
                  border: isLoaded ? '1px solid rgba(0, 243, 255, 0.35)' : '1px dashed rgba(255, 255, 255, 0.12)',
                  boxShadow: isLoaded ? '0 3px 8px rgba(0,0,0,0.6)' : 'none',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'visible',
                  marginBottom: '4px'
                }}
              >
                {/* Vinyl record disc sticking out slightly when loaded */}
                {isLoaded && (
                  <div 
                    className="vinyl-disc"
                    style={{
                      position: 'absolute',
                      right: '-6px',
                      top: '3px',
                      width: '50px',
                      height: '50px',
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
                      width: '18px',
                      height: '18px',
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
                  fontSize: '0.4rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px'
                }}>
                  <span style={{ fontSize: '0.45rem', color: isLoaded ? '#ffe600' : '#444' }}>CRT</span>
                  <span>{String(idx + 1).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Title / Rename Area */}
              <div style={{ width: '100%', minHeight: '13px', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                {editingCrateIdx === idx ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => handleRenameSave(idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    autoFocus
                    maxLength={16}
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
                    onClick={() => handleRenameStart(idx, crate.name)}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.46rem',
                      color: isLoaded ? '#fff' : '#555',
                      cursor: 'pointer',
                      textAlign: 'center',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: '105px',
                      display: 'block'
                    }}
                    title="Click to rename"
                  >
                    {crate.name}
                  </span>
                )}
              </div>

              {/* Save / Load / Clear Row controls */}
              <div style={{ 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2.5px',
                opacity: editingCrateIdx === idx ? 0.3 : 1,
                pointerEvents: editingCrateIdx === idx ? 'none' : 'auto'
              }}>
                {/* Save Buttons */}
                <div style={{ display: 'flex', gap: '2px', width: '100%' }}>
                  <button 
                    onClick={() => onSaveCrate(idx, 'a')}
                    className="btn btn-xs"
                    style={{
                      flex: 1,
                      fontSize: '0.34rem',
                      padding: '1.5px 0',
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
                    onClick={() => onSaveCrate(idx, 'b')}
                    className="btn btn-xs"
                    style={{
                      flex: 1,
                      fontSize: '0.34rem',
                      padding: '1.5px 0',
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
                      onClick={() => onLoadCrate(idx, 'a')}
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
                      onClick={() => onLoadCrate(idx, 'b')}
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
                      onClick={() => onDeleteCrate(idx)}
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
