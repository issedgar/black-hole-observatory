import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { simClock } from '../../simulation/runtime/simClock';
import { eventsTelemetry } from '../../simulation/runtime/eventsTelemetry';

const SAMPLE_INTERVAL_SEC = 0.2; // 5 Hz — well below the frame rate

/**
 * Bridges the render loop to the HUD: measures real FPS and samples the camera
 * distance, simulation time and primary captured object into the telemetry
 * store at a throttled rate, so the HUD never re-renders per frame.
 */
export function TelemetrySampler() {
    const update = useTelemetryStore((state) => state.update);
    const frames = useRef(0);
    const elapsed = useRef(0);
    const sinceSample = useRef(0);

    useFrame((state, delta) => {
        frames.current += 1;
        elapsed.current += delta;
        sinceSample.current += delta;

        if (sinceSample.current < SAMPLE_INTERVAL_SEC) {
            return;
        }

        const fps = frames.current / elapsed.current;
        const frameTimeMs = (elapsed.current / frames.current) * 1000;
        const primary = eventsTelemetry.primary;

        update({
            fps: Math.round(fps),
            frameTimeMs: Number(frameTimeMs.toFixed(2)),
            simTimeSec: simClock.time,
            cameraDistanceRg: state.camera.position.length(),
            // Copy so later mutations of the runtime object don't leak in.
            detectedObject: primary ? { ...primary } : null,
        });

        frames.current = 0;
        elapsed.current = 0;
        sinceSample.current = 0;
    });

    return null;
}
