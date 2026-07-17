/**
 * Non-reactive, per-frame accretion signal shared between the event system
 * (which pulses it when matter is absorbed) and the accretion-disk pass (which
 * reads and decays it). Kept out of a React store because it changes every
 * frame (AGENTS.md §14).
 */
export const accretionRuntime = {
    /** Current disk-reaction intensity, 0..1, decaying over time. */
    reaction: 0,
};

/** Adds a reaction pulse (clamped) when matter is accreted. */
export function pulseAccretion(amount: number): void {
    accretionRuntime.reaction = Math.min(1, accretionRuntime.reaction + amount);
}
