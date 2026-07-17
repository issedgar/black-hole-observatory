import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '../../stores/physicsStore';
import { simClock } from '../../simulation/runtime/simClock';

/**
 * Advances the global simulation clock once per frame (before any consumer), so
 * pausing and time-scaling apply uniformly to the disk, objects and particles.
 * Runs at the earliest frame priority.
 */
export function SimulationClock() {
    const timeScale = usePhysicsStore((state) => state.timeScale);
    const paused = usePhysicsStore((state) => state.paused);

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.05);
        simClock.paused = paused;
        const scaled = paused ? 0 : dt * timeScale;
        simClock.scaledDelta = scaled;
        simClock.time += scaled;
    }, -10);

    return null;
}
