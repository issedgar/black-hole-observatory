/**
 * Non-reactive simulation clock, advanced once per frame by <SimulationClock/>.
 * All animated systems (disk, objects, particles) read `time` and use
 * `scaledDelta` so pausing and time-scaling apply globally without per-frame
 * store reads (AGENTS.md §14).
 */
export const simClock = {
    /** Accumulated scaled simulation time (seconds). */
    time: 0,
    /** Scaled delta of the current frame (seconds). */
    scaledDelta: 0,
    /** True while the simulation is paused. */
    paused: false,
};
