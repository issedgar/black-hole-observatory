/** Kinds of matter that can be captured by the black hole (brief §7). */
export type CelestialObjectType =
    | 'rocky-planet'
    | 'ice-world'
    | 'moon'
    | 'asteroid-swarm'
    | 'gas-cloud'
    | 'spacecraft'
    | 'station-debris';

/** Explicit captured-matter event states (brief §7 / AGENTS.md §16). */
export type EventPhase =
    | 'detection'
    | 'approach'
    | 'gravitational-capture'
    | 'unstable-orbit'
    | 'tidal-deformation'
    | 'fragmentation'
    | 'accretion'
    | 'dissipation'
    | 'recovery';

/** Static, per-object descriptive + physical parameters (units noted). */
export interface CelestialObjectParams {
    readonly type: CelestialObjectType;
    /** Spanish display name for the HUD. */
    readonly displayName: string;
    /** Spanish composition label for the HUD. */
    readonly composition: string;
    /** Mass in solar masses (display). */
    readonly massSolar: number;
    /** Diameter in kilometres (display). */
    readonly diameterKm: number;
    /** Render radius in world units (r_g). */
    readonly radiusWorld: number;
    readonly baseColor: readonly [number, number, number];
    readonly accentColor: readonly [number, number, number];
    readonly hasAtmosphere: boolean;
    /** Per-instance seed for procedural variation. */
    readonly seed: number;
}

/**
 * Reactive event descriptor stored for the HUD. Per-frame kinematics live in the
 * non-reactive events runtime, not here (AGENTS.md §14).
 */
export interface ActiveEvent {
    readonly id: string;
    readonly type: CelestialObjectType;
    readonly params: CelestialObjectParams;
    /** Current state; mirrored from the runtime on transitions. */
    readonly phase: EventPhase;
    /** Simulation time (seconds) at spawn. */
    readonly spawnedAt: number;
}
