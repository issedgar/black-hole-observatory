import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualStore } from '../../stores/visualStore';
import { useDocumentVisible } from '../../hooks/useDocumentVisible';
import { QUALITY_SETTINGS } from '../../types/quality';
import { SceneRoot } from './SceneRoot';

/**
 * Hosts the React Three Fiber Canvas and owns renderer-level configuration:
 * color management, cinematic tone mapping, adaptive pixel ratio, and
 * visibility-based loop suspension. Scene content lives in SceneRoot.
 */
export function CanvasHost() {
    const qualityProfile = useVisualStore((state) => state.qualityProfile);
    const visible = useDocumentVisible();
    const dprMax = QUALITY_SETTINGS[qualityProfile].dprMax;

    return (
        <Canvas
            // Resolution scales with the quality profile but never drops below
            // native 1x. Sub-native resolution is a last resort handled later.
            dpr={[1, dprMax]}
            // Suspend rendering entirely while the tab is hidden.
            frameloop={visible ? 'always' : 'never'}
            gl={{
                antialias: true,
                alpha: false,
                // Stencil is reserved for the horizon shadow mask (Phase 2).
                stencil: true,
                depth: true,
                powerPreference: 'high-performance',
                // Tone mapping is applied by the custom post-processing pass, not
                // the renderer (the scene is composited through custom shaders).
                toneMapping: THREE.NoToneMapping,
            }}
            // Framing chosen so the monumental shadow and the disk bending
            // around it read clearly, with a slight downward tilt.
            camera={{ position: [0, 4, 34], fov: 45, near: 0.1, far: 2000 }}
            onCreated={({ gl, camera }) => {
                gl.setClearColor(CLEAR_COLOR, 1);
                camera.lookAt(0, 0, 0);
            }}
        >
            <SceneRoot />
        </Canvas>
    );
}

const CLEAR_COLOR = new THREE.Color(0x04060c);
