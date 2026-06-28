import { useRef, useCallback } from 'react';

export class Transport {
    bpm: number = 120;
    isPlaying: boolean = false;
    startTime: number = 0;

    constructor() {
        this.startTime = performance.now();
    }

    setBpm(bpm: number) {
        this.bpm = bpm;
    }

    // Calculate playback rate to fit videoDuration into targetBars at current BPM
    // targetBars: 4, 8, 16, 32, 64
    getSyncedPlaybackRate(videoDuration: number, targetBars: number): number {
        if (targetBars <= 0 || this.bpm <= 0 || videoDuration <= 0) return 1.0;

        const secondsPerBeat = 60.0 / this.bpm;
        const targetDuration = secondsPerBeat * 4 * targetBars; // 4 beats per bar

        return videoDuration / targetDuration;
    }
}

export const useTransport = () => {
    const transportRef = useRef(new Transport());

    const syncVideo = useCallback((videoElement: HTMLVideoElement, targetBars: number, bpm: number | null) => {
        if (!bpm || !videoElement || !videoElement.duration) return;

        transportRef.current.setBpm(bpm);
        const rate = transportRef.current.getSyncedPlaybackRate(videoElement.duration, targetBars);

        // Safety clamp
        const safeRate = Math.max(0.1, Math.min(4.0, rate));
        videoElement.playbackRate = safeRate;
    }, []);

    return {
        transport: transportRef.current,
        syncVideo
    };
};
