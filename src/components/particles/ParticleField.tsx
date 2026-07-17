import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useParticlePool } from './particlePoolContext';
import { simClock } from '../../simulation/runtime/simClock';
import vertexShader from '../../shaders/particles/particle.vertex.glsl?raw';
import fragmentShader from '../../shaders/particles/particle.fragment.glsl?raw';

/**
 * Renders and integrates the shared particle pool.
 *
 * Particles are drawn as an additive foreground pass in the main scene, over the
 * accretion disk so incandescent fragments stay visible, and depth-tested against
 * the HorizonOcclusion sphere so the shadow still occludes matter behind the hole.
 * This trades screen-space lensing of the particles for visibility and a correct
 * black shadow; the captured bodies that emit them get a bounded screen-space lens
 * bend instead (see objectLens.glsl).
 */
export function ParticleField() {
    const pool = useParticlePool();
    const gl = useThree((state) => state.gl);

    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const positionRef = useRef<THREE.BufferAttribute>(null);
    const tempRef = useRef<THREE.BufferAttribute>(null);
    const sizeRef = useRef<THREE.BufferAttribute>(null);
    const alphaRef = useRef<THREE.BufferAttribute>(null);

    const uniforms = useMemo(
        () => ({ uPixelRatio: { value: gl.getPixelRatio() } }),
        [gl],
    );

    useFrame((state) => {
        pool.update(simClock.scaledDelta);
        if (positionRef.current) positionRef.current.needsUpdate = true;
        if (tempRef.current) tempRef.current.needsUpdate = true;
        if (sizeRef.current) sizeRef.current.needsUpdate = true;
        if (alphaRef.current) alphaRef.current.needsUpdate = true;
        if (materialRef.current) {
            materialRef.current.uniforms.uPixelRatio.value =
                state.gl.getPixelRatio();
        }
    });

    return (
        <points frustumCulled={false} renderOrder={25}>
            <bufferGeometry>
                <bufferAttribute
                    ref={positionRef}
                    attach="attributes-position"
                    args={[pool.position, 3]}
                />
                <bufferAttribute
                    ref={tempRef}
                    attach="attributes-aTemp"
                    args={[pool.temperature, 1]}
                />
                <bufferAttribute
                    ref={sizeRef}
                    attach="attributes-aSize"
                    args={[pool.size, 1]}
                />
                <bufferAttribute
                    ref={alphaRef}
                    attach="attributes-aAlpha"
                    args={[pool.alpha, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
