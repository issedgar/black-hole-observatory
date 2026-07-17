import { useMemo } from 'react';
import * as THREE from 'three';
import { resolveIncludes } from '../../utils/shader';
import vertexShader from '../../shaders/environment/nebula.vertex.glsl?raw';
import fragmentSource from '../../shaders/environment/nebula.fragment.glsl?raw';
import noiseSource from '../../shaders/common/noise.glsl?raw';

// Large celestial-sphere shell enclosing the star shells (350–950 world units).
const NEBULA_RADIUS = 1200;

/**
 * Faint interstellar nebula and dust backdrop (brief §4). Deliberately subtle;
 * its main functional role here is to give gravitational lensing continuous
 * structure to bend so the effect is visible against the sparse starfield.
 *
 * Rendered on the inside of a big sphere in the offscreen background scene, so
 * it is lensed together with the stars. Static (no per-frame work).
 */
export function Nebula() {
    const fragmentShader = useMemo(
        () => resolveIncludes(fragmentSource, { noise: noiseSource }),
        [],
    );

    const uniforms = useMemo(
        () => ({
            uColorA: { value: new THREE.Color(0.1, 0.16, 0.3) },
            uColorB: { value: new THREE.Color(0.22, 0.13, 0.3) },
            uIntensity: { value: 0.55 },
        }),
        [],
    );

    return (
        <mesh renderOrder={-100} frustumCulled={false}>
            <sphereGeometry args={[NEBULA_RADIUS, 48, 32]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                side={THREE.BackSide}
                depthWrite={false}
            />
        </mesh>
    );
}
