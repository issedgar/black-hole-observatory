import { create } from 'zustand';

/**
 * Physical parameters of the black hole and the simulation clock. Mass and spin
 * primarily drive the derived HUD values (the scene geometry stays normalized);
 * timeScale and paused gate the global simulation clock.
 */
export interface PhysicsState {
    massSolar: number;
    /** Dimensionless spin a* ∈ [0, 0.998]. */
    spin: number;
    timeScale: number;
    paused: boolean;
    setMassSolar: (massSolar: number) => void;
    setSpin: (spin: number) => void;
    setTimeScale: (timeScale: number) => void;
    setPaused: (paused: boolean) => void;
    togglePaused: () => void;
}

export const usePhysicsStore = create<PhysicsState>((set) => ({
    massSolar: 15,
    spin: 0.6,
    timeScale: 1,
    paused: false,
    setMassSolar: (massSolar) => set({ massSolar }),
    setSpin: (spin) => set({ spin }),
    setTimeScale: (timeScale) => set({ timeScale }),
    setPaused: (paused) => set({ paused }),
    togglePaused: () => set((state) => ({ paused: !state.paused })),
}));
