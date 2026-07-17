import { createContext, useContext } from 'react';
import type * as THREE from 'three';

/**
 * Shared offscreen scenes for the compositor. The background scene (nebula,
 * stars and captured objects) is rendered to RT_bg and then gravitationally
 * lensed; the disk scene holds the bent-ray raymarch quad. Sharing them lets
 * other systems render into the lensed background without the compositor owning
 * their content.
 */
export interface CompositorScenes {
    readonly backgroundScene: THREE.Scene;
    readonly diskScene: THREE.Scene;
}

export const CompositorScenesContext = createContext<CompositorScenes | null>(
    null,
);

export function useCompositorScenes(): CompositorScenes {
    const value = useContext(CompositorScenesContext);
    if (!value) {
        throw new Error(
            'useCompositorScenes must be used within a CompositorScenesProvider',
        );
    }
    return value;
}
