import { useState } from 'react';
import type { QualityProfile } from '../types/quality';

export interface DeviceCapability {
    /** WebGL2 is a hard requirement for the renderer (see brief §15). */
    readonly webgl2: boolean;
    /** Initial quality profile inferred from coarse device signals. */
    readonly initialProfile: QualityProfile;
}

/**
 * Coarse, one-shot capability probe. It creates a throwaway WebGL2 context to
 * confirm support, then picks a conservative starting profile from device
 * signals. It intentionally never *measures* performance — runtime FPS-based
 * auto-adjustment (added in the performance phase) is responsible for that.
 */
function detectCapability(): DeviceCapability {
    if (typeof document === 'undefined') {
        return { webgl2: false, initialProfile: 'medium' };
    }

    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2');
    const webgl2 = gl !== null;

    // Release the probe context promptly so it does not linger against the
    // browser's WebGL context budget.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();

    return { webgl2, initialProfile: inferInitialProfile() };
}

function inferInitialProfile(): QualityProfile {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 4;
    const memoryGb = nav.deviceMemory ?? 4;
    const coarsePointer =
        typeof window !== 'undefined' &&
        window.matchMedia('(pointer: coarse)').matches;

    // Touch-first devices start conservatively; the user can raise quality later.
    if (coarsePointer) {
        return cores >= 8 && memoryGb >= 6 ? 'medium' : 'low';
    }
    if (cores >= 8 && memoryGb >= 8) {
        return 'high';
    }
    if (cores >= 4) {
        return 'medium';
    }
    return 'low';
}

/**
 * Returns the capability probe result, computed once per mount. Detection is
 * synchronous, so lazy state initialization avoids a re-render and keeps the
 * value stable for the component lifetime.
 */
export function useCapabilityDetection(): DeviceCapability {
    const [capability] = useState(detectCapability);
    return capability;
}
