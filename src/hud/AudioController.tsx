import { useEffect, useRef } from 'react';
import { usePrefsStore } from '../stores/prefsStore';
import { AudioEngine } from '../audio/AudioEngine';
import { accretionRuntime } from '../simulation/runtime/accretionRuntime';

/**
 * Non-visual bridge between the audio preferences and the procedural engine.
 * Starts/stops on opt-in (the toggle click is the required user gesture), tracks
 * volume, and feeds the accretion-event intensity to the swell.
 */
export function AudioController() {
    const soundEnabled = usePrefsStore((state) => state.soundEnabled);
    const volume = usePrefsStore((state) => state.volume);
    const engineRef = useRef<AudioEngine | null>(null);

    if (engineRef.current === null) {
        engineRef.current = new AudioEngine();
    }

    useEffect(() => {
        const engine = engineRef.current;
        if (!engine) {
            return;
        }
        if (soundEnabled) {
            void engine.start();
        } else {
            void engine.stop();
        }
    }, [soundEnabled]);

    useEffect(() => {
        engineRef.current?.setVolume(volume);
    }, [volume]);

    useEffect(() => {
        if (!soundEnabled) {
            return;
        }
        const id = window.setInterval(() => {
            engineRef.current?.setEventIntensity(accretionRuntime.reaction);
        }, 150);
        return () => window.clearInterval(id);
    }, [soundEnabled]);

    // Release the audio context if the component ever unmounts.
    useEffect(() => {
        const engine = engineRef.current;
        return () => {
            void engine?.stop();
        };
    }, []);

    return null;
}
