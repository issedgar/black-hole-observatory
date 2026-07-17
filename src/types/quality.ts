/**
 * Graphics quality profiles. These drive every adaptive cost knob in the
 * renderer (device pixel ratio, particle counts, shader step counts, effect
 * toggles). Phase 0 only consumes the pixel-ratio cap; heavier fields are added
 * by the phases that own them (accretion, lensing, particles, post-processing).
 */
export type QualityProfile = 'low' | 'medium' | 'high' | 'ultra';

export const QUALITY_PROFILES: readonly QualityProfile[] = [
    'low',
    'medium',
    'high',
    'ultra',
] as const;

export interface QualitySettings {
    /**
     * Upper bound for the effective device pixel ratio. Resolution is the last
     * thing we degrade (see AGENTS.md performance strategy), so even the low
     * profile stays at native 1x rather than sub-native rendering.
     */
    readonly dprMax: number;
    /** Procedural background star count. */
    readonly starCount: number;
    /** Bent-ray march step budget for the accretion-disk pass. */
    readonly diskMarchSteps: number;
    /**
     * Resolution of the offscreen disk raymarch target relative to the
     * framebuffer. The field pass is by far the most expensive draw (a
     * bent-ray march with per-step noise), so lower tiers reduce this. The
     * dark edge-on seam this used to cause came from the march point-sampling
     * past the disk's thin midplane crossing — fixed at the source by
     * grazing-incidence sub-stepping in the field shader, independent of
     * target resolution. The composite blends the field over the
     * full-resolution direct background, so stars stay sharp at every tier.
     */
    readonly diskResolutionScale: number;
    /** Capacity of the shared fragment/plasma/dust particle pool. */
    readonly particleCount: number;
}

export const QUALITY_SETTINGS: Record<QualityProfile, QualitySettings> = {
    low: {
        dprMax: 1,
        starCount: 2500,
        diskMarchSteps: 64,
        diskResolutionScale: 0.6,
        particleCount: 1500,
    },
    medium: {
        dprMax: 1.5,
        starCount: 6000,
        diskMarchSteps: 96,
        diskResolutionScale: 0.85,
        particleCount: 3500,
    },
    high: {
        dprMax: 2,
        starCount: 12000,
        diskMarchSteps: 128,
        diskResolutionScale: 1.0,
        particleCount: 6500,
    },
    ultra: {
        dprMax: 2,
        starCount: 20000,
        diskMarchSteps: 150,
        diskResolutionScale: 1.0,
        particleCount: 11000,
    },
};
