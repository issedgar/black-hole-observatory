import { create } from 'zustand';
import type { DetectedObjectSnapshot } from '../simulation/runtime/eventsTelemetry';

/**
 * Throttled telemetry snapshot for the HUD, written a few times per second by
 * the TelemetrySampler (never per frame). The HUD subscribes to this rather than
 * to the render loop.
 */
export interface TelemetryState {
    fps: number;
    frameTimeMs: number;
    simTimeSec: number;
    cameraDistanceRg: number;
    detectedObject: DetectedObjectSnapshot | null;
    update: (snapshot: Partial<TelemetryState>) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
    fps: 0,
    frameTimeMs: 0,
    simTimeSec: 0,
    cameraDistanceRg: 26,
    detectedObject: null,
    update: (snapshot) => set(snapshot),
}));
