import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVisualStore } from '../../stores/visualStore';
import { QUALITY_PROFILES, type QualityProfile } from '../../types/quality';

// Auto-adjustment stays within low..high; ultra is opt-in only.
const AUTO_MIN_INDEX = 0;
const AUTO_MAX_INDEX = 2;
const WINDOW_SEC = 2;
const COOLDOWN_SEC = 4;
const DOWN_FPS = 45;
const UP_FPS = 58;

/**
 * Adaptive quality (brief §15): watches the measured frame rate and steps the
 * quality profile down when performance is sustainedly low, or cautiously up
 * when there is headroom. Each profile scales device pixel ratio, particle and
 * star counts, disk march steps and disk resolution — degrading resolution last.
 * Disabled once the user picks a quality manually.
 */
export function AdaptiveQuality() {
    const frames = useRef(0);
    const elapsed = useRef(0);
    const cooldown = useRef(0);

    useFrame((_, delta) => {
        const { autoQuality, qualityProfile, setQualityProfileAuto } =
            useVisualStore.getState();
        if (!autoQuality) {
            return;
        }

        frames.current += 1;
        elapsed.current += delta;
        cooldown.current += delta;

        if (elapsed.current < WINDOW_SEC) {
            return;
        }

        const fps = frames.current / elapsed.current;
        frames.current = 0;
        elapsed.current = 0;

        if (cooldown.current < COOLDOWN_SEC) {
            return;
        }

        const index = QUALITY_PROFILES.indexOf(qualityProfile);
        let nextIndex = index;
        if (fps < DOWN_FPS && index > AUTO_MIN_INDEX) {
            nextIndex = index - 1;
        } else if (fps > UP_FPS && index < AUTO_MAX_INDEX) {
            nextIndex = index + 1;
        }

        if (nextIndex !== index) {
            cooldown.current = 0;
            setQualityProfileAuto(QUALITY_PROFILES[nextIndex] as QualityProfile);
        }
    });

    return null;
}
