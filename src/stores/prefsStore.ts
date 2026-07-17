import { create } from 'zustand';

/**
 * User accessibility / experience preferences. Read outside the render loop; the
 * render loop consumes derived values (e.g. a motion scale) via component-level
 * subscriptions, not per-frame store reads.
 */
export interface PrefsState {
    reducedMotion: boolean;
    /** Audio is off until the user explicitly enables it (brief §13). */
    soundEnabled: boolean;
    volume: number;
    setReducedMotion: (reducedMotion: boolean) => void;
    setSoundEnabled: (soundEnabled: boolean) => void;
    setVolume: (volume: number) => void;
}

function prefersReducedMotion(): boolean {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}

export const usePrefsStore = create<PrefsState>((set) => ({
    reducedMotion: prefersReducedMotion(),
    soundEnabled: false,
    volume: 0.6,
    setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    setVolume: (volume) => set({ volume }),
}));
