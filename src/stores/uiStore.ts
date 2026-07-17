import { create } from 'zustand';
import type { ConceptId } from '../hud/educational/concepts';

/**
 * HUD interface state: educational mode, the selected concept, and which panels
 * are expanded. Panels default to collapsed on small screens so the scene stays
 * dominant.
 */
export interface UiState {
    educationalMode: boolean;
    selectedConcept: ConceptId | null;
    parametersOpen: boolean;
    objectOpen: boolean;
    controlsOpen: boolean;
    setEducationalMode: (value: boolean) => void;
    toggleEducationalMode: () => void;
    setSelectedConcept: (concept: ConceptId | null) => void;
    setParametersOpen: (value: boolean) => void;
    setObjectOpen: (value: boolean) => void;
    setControlsOpen: (value: boolean) => void;
}

const isWideScreen =
    typeof window === 'undefined' || window.innerWidth > 720;

export const useUiStore = create<UiState>((set) => ({
    educationalMode: false,
    selectedConcept: null,
    parametersOpen: isWideScreen,
    objectOpen: isWideScreen,
    controlsOpen: isWideScreen,
    setEducationalMode: (educationalMode) => set({ educationalMode }),
    toggleEducationalMode: () =>
        set((state) => ({ educationalMode: !state.educationalMode })),
    setSelectedConcept: (selectedConcept) => set({ selectedConcept }),
    setParametersOpen: (parametersOpen) => set({ parametersOpen }),
    setObjectOpen: (objectOpen) => set({ objectOpen }),
    setControlsOpen: (controlsOpen) => set({ controlsOpen }),
}));
