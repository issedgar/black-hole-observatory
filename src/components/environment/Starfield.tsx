import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualStore } from '../../stores/visualStore';
import { usePrefsStore } from '../../stores/prefsStore';
import { simClock } from '../../simulation/runtime/simClock';
import { QUALITY_SETTINGS } from '../../types/quality';
import vertexShader from '../../shaders/environment/starfield.vertex.glsl?raw';
import fragmentShader from '../../shaders/environment/starfield.fragment.glsl?raw';

// Depth shells the stars are distributed across; the spread is what produces
// parallax as the camera orbits.
const INNER_SHELL_RADIUS = 350;
const OUTER_SHELL_RADIUS = 950;

// Representative stellar colours ordered blue → red, sampled with a bias toward
// the cooler-looking white/blue end so the field reads as a deep sky.
const STAR_COLORS: readonly [number, number, number][] = [
    [0.72, 0.82, 1.0], // blue-white
    [0.9, 0.95, 1.0], // white
    [1.0, 0.98, 0.92], // yellow-white
    [1.0, 0.85, 0.66], // orange
    [1.0, 0.74, 0.62], // red
];

// Deterministic PRNG (mulberry32) so the sky is stable across reloads.
function createRng(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

interface StarGeometryResult {
    geometry: THREE.BufferGeometry;
}

function buildStarGeometry(count: number): StarGeometryResult {
    const random = createRng(0x9e3779b9);

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);
    const twinklePhase = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        // Uniform direction on the sphere.
        const u = random() * 2 - 1;
        const theta = random() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        const radius =
            INNER_SHELL_RADIUS +
            random() * (OUTER_SHELL_RADIUS - INNER_SHELL_RADIUS);

        positions[i * 3] = s * Math.cos(theta) * radius;
        positions[i * 3 + 1] = s * Math.sin(theta) * radius;
        positions[i * 3 + 2] = u * radius;

        // Colour: bias toward the blue/white end (index skewed low).
        const colorIndex = Math.min(
            STAR_COLORS.length - 1,
            Math.floor(Math.pow(random(), 2.2) * STAR_COLORS.length),
        );
        const color = STAR_COLORS[colorIndex];
        colors[i * 3] = color[0];
        colors[i * 3 + 1] = color[1];
        colors[i * 3 + 2] = color[2];

        // Most stars faint, a few bright (skewed).
        brightness[i] = 0.2 + Math.pow(random(), 3) * 0.8;
        sizes[i] = 0.7 + Math.pow(random(), 4) * 3.2;
        twinklePhase[i] = random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3),
    );
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute(
        'aBrightness',
        new THREE.BufferAttribute(brightness, 1),
    );
    geometry.setAttribute(
        'aTwinklePhase',
        new THREE.BufferAttribute(twinklePhase, 1),
    );

    return { geometry };
}

/**
 * Multilayer procedural starfield. Stars are distributed across depth shells so
 * the field has parallax, vary in colour temperature and brightness, and twinkle
 * subtly. Rendered additively and depth-tested, so the black-hole shadow occludes
 * the stars behind it. Star count scales with the quality profile.
 */
export function Starfield() {
    const qualityProfile = useVisualStore((state) => state.qualityProfile);
    const starCount = QUALITY_SETTINGS[qualityProfile].starCount;
    const reducedMotion = usePrefsStore((state) => state.reducedMotion);
    const gl = useThree((state) => state.gl);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const { geometry } = useMemo(
        () => buildStarGeometry(starCount),
        [starCount],
    );

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uPixelRatio: { value: gl.getPixelRatio() },
            uMotionScale: { value: 1 },
        }),
        [gl],
    );

    // Explicit disposal: the geometry is created imperatively, so R3F does not
    // own its lifecycle.
    useEffect(() => () => geometry.dispose(), [geometry]);

    useFrame((state) => {
        const material = materialRef.current;
        if (material) {
            material.uniforms.uTime.value = simClock.time;
            material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
            material.uniforms.uMotionScale.value = reducedMotion ? 0 : 1;
        }
    });

    return (
        <points geometry={geometry} frustumCulled={false}>
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
