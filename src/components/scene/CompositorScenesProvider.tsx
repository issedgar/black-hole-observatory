import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import {
    CompositorScenesContext,
    type CompositorScenes,
} from './compositorScenes';

/** Creates the shared offscreen scenes once and provides them to descendants. */
export function CompositorScenesProvider({ children }: { children: ReactNode }) {
    const value = useMemo<CompositorScenes>(() => {
        const backgroundScene = new THREE.Scene();
        backgroundScene.background = new THREE.Color(0x04060c);
        return { backgroundScene, diskScene: new THREE.Scene() };
    }, []);

    return (
        <CompositorScenesContext.Provider value={value}>
            {children}
        </CompositorScenesContext.Provider>
    );
}
