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
    <div className="record-crates-panel steel-plate" style={{ 
      marginTop: '1.25rem', 
      background: 'linear-gradient(180deg, rgba(8, 12, 22, 0.95) 0%, rgba(3, 5, 10, 0.98) 100%)', 
      border: '2px solid rgba(0, 243, 255, 0.35)', 
      borderRadius: '6px',
      padding: '10px 16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.85), inset 0 0 15px rgba(0, 243, 255, 0.1)',
      userSelect: 'none'
    }}>
      {/* Panel Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid rgba(0, 243, 255, 0.2)',
        paddingBottom: '6px',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', animation: 'led-blink-cyan 1.5s infinite alternate' }}>⚡</span>
          <span style={{ 
            fontFamily: 'monospace', 
            fontSize: '0.72rem', 
            fontWeight: 'bold', 
            color: '#ffe600', 
            letterSpacing: '1px',
            textShadow: '0 0 5px rgba(255, 230, 0, 0.4)'
          }}>
            RECORD CRATES &mdash; 8-BANK SAMPLE GROOVE STORAGE
          </span>
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: '0.52rem', color: '#888' }}>
          DRAG & DROP RECORD SLEEVES TO LOAD INTO DECK A OR DECK B PADS GRID
        </span>
      </div>

      {/* Crates Grid */}
      <div className="crates-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(8, 1fr)', 
        gap: '12px' 
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
                // Add dragging state/classes
                e.currentTarget.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('text/plain', `crate_${idx}`);
              }}
              onDragEnd={(e) => {
                e.currentTarget.classList.remove('dragging');
              }}
              style={{
                background: 'rgba(5, 8, 16, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.2s ease',
                cursor: isLoaded ? 'grab' : 'default'
              }}
            >
              {/* Vinyl record representation */}
              <div 
                className="vinyl-sleeve-wrapper"
                style={{
                  width: '78px',
                  height: '78px',
                  position: 'relative',
                  background: 'linear-gradient(135deg, #141b29 0%, #080c14 100%)',
                  border: isLoaded ? '1px solid rgba(0, 243, 255, 0.4)' : '1px dashed rgba(255, 255, 255, 0.15)',
                  boxShadow: isLoaded ? '0 5px 12px rgba(0,0,0,0.6)' : 'none',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'visible',
                  marginBottom: '6px'
                }}
              >
                {/* Vinyl record disc sticking out slightly when loaded */}
                {isLoaded && (
                  <div 
                    className="vinyl-disc"
                    style={{
                      position: 'absolute',
                      right: '-8px',
                      top: '4px',
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      background: 'repeating-radial-gradient(circle, #0e121a 0px, #0e121a 1px, #181f2c 2px, #0e121a 3px)',
                      boxShadow: '2px 4px 8px rgba(0,0,0,0.7)',
                      zIndex: -1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    {/* Vinyl Label */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#ffe600',
                      border: '2px solid #000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 0 3px rgba(0,0,0,0.8)'
                    }}>
                      <div style={{
                        width: '4px',
                        height: '4px',
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
                  fontSize: '0.45rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <span style={{ fontSize: '0.52rem', color: isLoaded ? '#ffe600' : '#444' }}>CRATE</span>
                  <span>{String(idx + 1).padStart(2, '0')}</span>
                  {isLoaded && <span style={{ color: '#00ff96', fontSize: '0.4rem', marginTop: '3px' }}>● LOADED</span>}
                </div>
              </div>

              {/* Title / Rename Area */}
              <div style={{ width: '100%', minHeight: '18px', display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
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
                      width: '90%',
                      background: '#000',
                      border: '1px solid #ffe600',
                      color: '#ffe600',
                      fontSize: '0.48rem',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      padding: '1px 2px',
                      outline: 'none',
                      borderRadius: '2px'
                    }}
                  />
                ) : (
                  <span 
                    onClick={() => handleRenameStart(idx, crate.name)}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.5rem',
                      color: isLoaded ? '#fff' : '#666',
                      cursor: 'pointer',
                      textAlign: 'center',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: '85px',
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
                gap: '3px',
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
                      fontSize: '0.36rem',
                      padding: '2px 0',
                      margin: 0,
                      borderColor: 'rgba(0, 243, 255, 0.3)',
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
                      fontSize: '0.36rem',
                      padding: '2px 0',
                      margin: 0,
                      borderColor: 'rgba(255, 0, 255, 0.3)',
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
                        fontSize: '0.36rem',
                        padding: '1.5px 0',
                        margin: 0,
                        borderColor: '#00f3ff',
                        color: '#00f3ff',
                        background: 'rgba(0, 243, 255, 0.1)',
                        cursor: 'pointer'
                      }}
                      title="Load crate samples into Deck A"
                    >
                      LOAD A
                    </button>
                    <button 
                      onClick={() => onLoadCrate(idx, 'b')}
                      className="btn btn-xs"
                      style={{
                        flex: 1,
                        fontSize: '0.36rem',
                        padding: '1.5px 0',
                        margin: 0,
                        borderColor: '#ff00ff',
                        color: '#ff00ff',
                        background: 'rgba(255, 0, 255, 0.1)',
                        cursor: 'pointer'
                      }}
                      title="Load crate samples into Deck B"
                    >
                      LOAD B
                    </button>
                    <button 
                      onClick={() => onDeleteCrate(idx)}
                      className="btn btn-xs"
                      style={{
                        flex: 0.4,
                        fontSize: '0.36rem',
                        padding: '1.5px 0',
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
