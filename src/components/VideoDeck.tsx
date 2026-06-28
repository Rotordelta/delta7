import React, { useRef } from 'react';

interface VideoClip {
    id: string;
    file: File;
    url: string;
    name: string;
}

interface VideoDeckProps {
    clips: VideoClip[];
    activeClipId: string | null;
    onClipSelect: (id: string) => void;
    onClipsAdd: (files: File[]) => void;
    onClipRemove: (id: string) => void;
    onClipBind: (id: string) => void; // [NEW]
}

const VideoDeck: React.FC<VideoDeckProps> = ({
    clips,
    activeClipId,
    onClipSelect,
    onClipsAdd,
    onClipRemove,
    onClipBind // [NEW]
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onClipsAdd(Array.from(e.dataTransfer.files));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onClipsAdd(Array.from(e.target.files));
        }
    };

    return (
        <div className="video-deck-container"
            style={{
                padding: '10px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#eee',
                marginTop: '10px'
            }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Video Deck</h4>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        background: 'transparent',
                        border: '1px solid #444',
                        color: '#aaa',
                        cursor: 'pointer',
                        padding: '2px 8px',
                        fontSize: '0.8rem',
                        borderRadius: '4px'
                    }}
                >
                    + ADD CLIP
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="video/*"
                    multiple
                    onChange={handleFileSelect}
                />
            </div>

            <div
                className="deck-dropzone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    minHeight: '80px',
                    border: '1px dashed rgba(255, 255, 255, 0.2)',
                    padding: '8px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.3)'
                }}
            >
                {clips.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.8rem' }}>
                        Drag & Drop Videos Here
                    </div>
                )}

                {clips.map((clip) => (
                    <div
                        key={clip.id}
                        onClick={() => onClipSelect(clip.id)}
                        style={{
                            position: 'relative',
                            aspectRatio: '16/9',
                            background: '#000',
                            border: clip.id === activeClipId ? '2px solid #00f0ff' : '1px solid #333',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <video
                            src={clip.url}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                            muted // thumbnail only
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(0,0,0,0.7)',
                            padding: '2px 4px',
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {clip.name}
                        </div>
                        {/* Bind Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onClipBind(clip.id); }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                background: 'rgba(0,0,255,0.8)',
                                border: 'none',
                                color: '#fff',
                                cursor: 'crosshair',
                                fontSize: '0.6rem',
                                padding: '2px 4px',
                                borderRadius: '0 0 4px 0',
                                zIndex: 10
                            }}
                            title="Bind to MIDI/Key"
                        >
                            BIND
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClipRemove(clip.id); }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                background: 'rgba(0,0,0,0.8)',
                                border: 'none',
                                color: '#f00',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                padding: '0 4px',
                                display: 'none' // Hover handling handled via CSS in main sheet if desired, or always visible
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoDeck;
