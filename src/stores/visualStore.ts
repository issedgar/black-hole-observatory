import { create } from 'zustand';
import type { QualityProfile } from '../types/quality';

/**
 * Visual and rendering-quality state. Kept separate from physics state so that
 * changing how the scene looks never perturbs the simulation model.
 *
 * This store is read outside the render loop (setup and user input), never on a
 * per-frame basis. Frame-hot data lives in the non-reactive simulation runtime
 * introduced in later phases.
 */
export interface VisualState {
    qualityProfile: QualityProfile;
    /** When true, quality auto-adjusts to sustained measured FPS. */
    autoQuality: boolean;
    /** Post-processing exposure multiplier. */
    exposure: number;
    /** Bloom contribution strength. */
    bloomStrength: number;
    /** Accretion-disk optical density multiplier. */
    diskDensity: number;
    /** Gravitational-lensing strength multiplier. */
    lensingIntensity: number;
    /** Fragment/plasma emission-count multiplier. */
    particleDensity: number;
    setQualityProfile: (profile: QualityProfile) => void;
    /** Auto-adjustment sets the profile without disabling auto mode. */
    setQualityProfileAuto: (profile: QualityProfile) => void;
    setAutoQuality: (autoQuality: boolean) => void;
    setExposure: (exposure: number) => void;
    setBloomStrength: (bloomStrength: number) => void;
    setDiskDensity: (diskDensity: number) => void;
    setLensingIntensity: (lensingIntensity: number) => void;
    setParticleDensity: (particleDensity: number) => void;
}

export const useVisualStore = create<VisualState>((set) => ({
    // Provisional default; App overrides it with the capability-detected profile
    // before the Canvas mounts.
    qualityProfile: 'high',
    autoQuality: true,
    exposure: 0.52,
    bloomStrength: 0.35,
    diskDensity: 1,
    lensingIntensity: 1,
    particleDensity: 1,
    // A manual quality change turns auto mode off so the user's choice sticks.
    setQualityProfile: (qualityProfile) =>
        set({ qualityProfile, autoQuality: false }),
    setQualityProfileAuto: (qualityProfile) => set({ qualityProfile }),
    setAutoQuality: (autoQuality) => set({ autoQuality }),
    setExposure: (exposure) => set({ exposure }),
    setBloomStrength: (bloomStrength) => set({ bloomStrength }),
    setDiskDensity: (diskDensity) => set({ diskDensity }),
    setLensingIntensity: (lensingIntensity) => set({ lensingIntensity }),
    setParticleDensity: (particleDensity) => set({ particleDensity }),
}));
