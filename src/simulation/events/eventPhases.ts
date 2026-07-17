import type { EventPhase } from '../../types/celestialObject';

/**
 * Captured-matter state machine. Transitions are driven primarily by the radial
 * distance to the black hole, with a minimum dwell time per state so every phase
 * is observable even for a fast infall. Each call advances at most one step.
 */

interface PhaseRule {
    readonly next: EventPhase;
    /** Advance once the object is at or inside this radius (world units). */
    readonly radiusBelow: number;
    /** ...and after at least this long in the current phase (seconds). */
    readonly minDwellSec: number;
}

// Radius gates are relative to the apparent shadow (~5.2) and disk (6–24).
const RULES: Partial<Record<EventPhase, PhaseRule>> = {
    detection: { next: 'approach', radiusBelow: Infinity, minDwellSec: 0.8 },
    approach: {
        next: 'gravitational-capture',
        radiusBelow: 50,
        minDwellSec: 0.5,
    },
    'gravitational-capture': {
        next: 'unstable-orbit',
        radiusBelow: 32,
        minDwellSec: 0.6,
    },
    'unstable-orbit': {
        next: 'tidal-deformation',
        radiusBelow: 16,
        minDwellSec: 0.8,
    },
    'tidal-deformation': {
        next: 'fragmentation',
        radiusBelow: 10,
        minDwellSec: 0.7,
    },
    fragmentation: { next: 'accretion', radiusBelow: 7.2, minDwellSec: 0.6 },
    accretion: { next: 'dissipation', radiusBelow: 5.6, minDwellSec: 1.2 },
    dissipation: { next: 'recovery', radiusBelow: Infinity, minDwellSec: 1.8 },
};

/** Returns the next phase, or the same phase if no transition applies yet. */
export function advancePhase(
    phase: EventPhase,
    radius: number,
    timeInPhase: number,
): EventPhase {
    const rule = RULES[phase];
    if (!rule) {
        return phase; // 'recovery' is terminal (manager removes the event).
    }
    if (timeInPhase >= rule.minDwellSec && radius <= rule.radiusBelow) {
        return rule.next;
    }
    return phase;
}

export function isTerminalPhase(phase: EventPhase): boolean {
    return phase === 'recovery';
}

/** Phases in which the body is being torn apart (used for heat/integrity). */
export function isDisruptionPhase(phase: EventPhase): boolean {
    return (
        phase === 'tidal-deformation' ||
        phase === 'fragmentation' ||
        phase === 'accretion'
    );
}
