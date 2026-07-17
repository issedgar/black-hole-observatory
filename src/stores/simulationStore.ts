import { create } from 'zustand';

/**
 * Aggregate simulation values for the HUD. Updated on discrete events (matter
 * accreted), not per frame.
 */
export interface SimulationState {
    /** Total mass absorbed by the hole over the session, in solar masses. */
    accretedMassSolar: number;
    /** Count of fully consumed objects. */
    consumedCount: number;
    registerAccretion: (massSolar: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
    accretedMassSolar: 0,
    consumedCount: 0,
    registerAccretion: (massSolar) =>
        set((state) => ({
            accretedMassSolar: state.accretedMassSolar + massSolar,
            consumedCount: state.consumedCount + 1,
        })),
}));
