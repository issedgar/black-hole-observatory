import { create } from 'zustand';

export type CameraMode = 'manual' | 'cinematic';

/**
 * Camera control state. The mode and reset trigger are set by user actions
 * (keyboard now, HUD buttons in Phase 8) and consumed by the CameraRig, never on
 * a per-frame basis.
 */
export interface CameraState {
    mode: CameraMode;
    /** Incremented to request a smooth return to the default framing. */
    resetNonce: number;
    setMode: (mode: CameraMode) => void;
    toggleCinematic: () => void;
    requestReset: () => void;
}

export const useCameraStore = create<CameraState>((set) => ({
    mode: 'manual',
    resetNonce: 0,
    setMode: (mode) => set({ mode }),
    toggleCinematic: () =>
        set((state) => ({
            mode: state.mode === 'cinematic' ? 'manual' : 'cinematic',
        })),
    // A reset always returns to manual control.
    requestReset: () =>
        set((state) => ({ resetNonce: state.resetNonce + 1, mode: 'manual' })),
}));
