import { create } from 'zustand';

export type CameraMode = 'manual' | 'cinematic' | 'vista';

/**
 * Camera control state. The mode and reset trigger are set by user actions
 * (keyboard and HUD buttons) and consumed by the CameraRig, never on a per-frame
 * basis.
 */
export interface CameraState {
    mode: CameraMode;
    /** Incremented to request a smooth return to the default framing. */
    resetNonce: number;
    setMode: (mode: CameraMode) => void;
    toggleCinematic: () => void;
    /** Distant contemplative "vista" mode; the HUD hides while it is active. */
    enterVista: () => void;
    exitVista: () => void;
    toggleVista: () => void;
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
    enterVista: () => set({ mode: 'vista' }),
    // Leaving vista eases back to the default framing under manual control.
    exitVista: () =>
        set((state) => ({ resetNonce: state.resetNonce + 1, mode: 'manual' })),
    toggleVista: () =>
        set((state) =>
            state.mode === 'vista'
                ? { resetNonce: state.resetNonce + 1, mode: 'manual' }
                : { mode: 'vista' },
        ),
    // A reset always returns to manual control.
    requestReset: () =>
        set((state) => ({ resetNonce: state.resetNonce + 1, mode: 'manual' })),
}));
