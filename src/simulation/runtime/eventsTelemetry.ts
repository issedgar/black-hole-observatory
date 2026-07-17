import * as THREE from 'three';
import type { CelestialObjectParams, EventPhase } from '../../types/celestialObject';

/** Live snapshot of the most relevant captured object, for the HUD. */
export interface DetectedObjectSnapshot {
    params: CelestialObjectParams;
    phase: EventPhase;
    /** Distance from the black-hole centre, in gravitational radii. */
    distanceRg: number;
    /** Speed as a fraction of c (weak-field estimate). */
    speedFraction: number;
    /** Structural integrity 0..1. */
    integrity: number;
    /** Relative tidal-force indicator 0..1. */
    tidal: number;
    /** Estimated seconds until fragmentation, or null if not applicable. */
    secondsToDisruption: number | null;
}

interface EventsTelemetry {
    /** Throttled snapshot for the HUD (sampled by TelemetrySampler). */
    primary: DetectedObjectSnapshot | null;
    /** True when a primary object exists (read live by the diagram overlay). */
    hasPrimary: boolean;
    /** Live pose of the primary object, in reused vectors (no per-frame alloc). */
    pose: { position: THREE.Vector3; velocity: THREE.Vector3 };
}

/**
 * Non-reactive bridge written every frame by the EventsManager. `primary` is
 * sampled at a throttled rate into the telemetry store for the HUD; `pose` is
 * read live by the 3D educational diagram overlay.
 */
export const eventsTelemetry: EventsTelemetry = {
    primary: null,
    hasPrimary: false,
    pose: {
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
    },
};
