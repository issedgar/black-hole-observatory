import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { ActiveEvent } from '../../types/celestialObject';
import { resolveIncludes } from '../../utils/shader';
import planetVertex from '../../shaders/planets/planetSurface.vertex.glsl?raw';
import planetFragment from '../../shaders/planets/planetSurface.fragment.glsl?raw';
import gasVertex from '../../shaders/planets/gasCloud.vertex.glsl?raw';
import gasFragment from '../../shaders/planets/gasCloud.fragment.glsl?raw';
import noiseSource from '../../shaders/common/noise.glsl?raw';
import objectLensSource from '../../shaders/lensing/objectLens.glsl?raw';

interface CelestialObjectProps {
    event: ActiveEvent;
    onReady: (
        id: string,
        group: THREE.Group,
        material: THREE.ShaderMaterial,
    ) => void;
    onRelease: (id: string) => void;
}

// Geometry detail and displacement per solid type (asteroids are the lumpiest;
// craft/debris are undisplaced modular geometry).
const SOLID_CONFIG: Record<string, { detail: number; dispFactor: number }> = {
    'rocky-planet': { detail: 5, dispFactor: 0.16 },
    'ice-world': { detail: 4, dispFactor: 0.09 },
    moon: { detail: 4, dispFactor: 0.14 },
    'asteroid-swarm': { detail: 3, dispFactor: 0.3 },
    'station-debris': { detail: 0, dispFactor: 0.05 },
    spacecraft: { detail: 0, dispFactor: 0.0 },
};

/**
 * A single captured body. Builds procedural geometry and a shader material by
 * type, and hands its group + material to the EventsManager, which drives the
 * transform and thermal (`uHeat`) uniform each frame.
 */
export function CelestialObject({
    event,
    onReady,
    onRelease,
}: CelestialObjectProps) {
    const { params } = event;
    const groupRef = useRef<THREE.Group>(null);
    const isGas = params.type === 'gas-cloud';
    const radius = params.radiusWorld;

    const material = useMemo(() => {
        const vertexShader = resolveIncludes(isGas ? gasVertex : planetVertex, {
            noise: noiseSource,
            objectLens: objectLensSource,
        });
        const fragmentShader = resolveIncludes(
            isGas ? gasFragment : planetFragment,
            { noise: noiseSource },
        );
        const config = SOLID_CONFIG[params.type];
        const uniforms: Record<string, THREE.IUniform> = {
            uBaseColor: {
                value: new THREE.Color(...params.baseColor),
            },
            uAccentColor: {
                value: new THREE.Color(...params.accentColor),
            },
            uHeat: { value: 0 },
            uSeed: { value: params.seed },
            // Screen-space lensing (updated per frame by the EventsManager).
            uLensAspect: { value: 1 },
        };
        if (!isGas) {
            uniforms.uDisplacement = {
                value: radius * (config?.dispFactor ?? 0.1),
            };
            uniforms.uTidalStrength = { value: 0 };
            uniforms.uTidalDir = { value: new THREE.Vector3(0, 1, 0) };
            uniforms.uObjectRadius = { value: radius };
        }
        return new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: isGas,
            depthWrite: !isGas,
            blending: isGas ? THREE.AdditiveBlending : THREE.NormalBlending,
        });
    }, [isGas, params, radius]);

    useEffect(() => () => material.dispose(), [material]);

    useEffect(() => {
        if (groupRef.current) {
            onReady(event.id, groupRef.current, material);
        }
        return () => onRelease(event.id);
        // Register once per mounted event.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <group ref={groupRef}>{renderGeometry(params.type, radius, material)}</group>;
}

function renderGeometry(
    type: string,
    radius: number,
    material: THREE.ShaderMaterial,
) {
    if (type === 'gas-cloud') {
        return (
            <mesh material={material}>
                <sphereGeometry args={[radius, 24, 24]} />
            </mesh>
        );
    }

    if (type === 'spacecraft') {
        const r = radius;
        return (
            <group>
                <mesh material={material}>
                    <boxGeometry args={[r * 0.42, r * 0.42, r * 1.9]} />
                </mesh>
                <mesh material={material} position={[0, 0, r * 0.2]}>
                    <boxGeometry args={[r * 1.7, r * 0.08, r * 0.5]} />
                </mesh>
                <mesh material={material} position={[0, 0, -r * 1.05]}>
                    <boxGeometry args={[r * 0.55, r * 0.55, r * 0.35]} />
                </mesh>
            </group>
        );
    }

    if (type === 'station-debris') {
        // Offsets and sizes as fractions of the object radius.
        const pieces: readonly [number, number, number, number][] = [
            [0.5, 0.5, 0.4, 0.9],
            [-0.6, 0.3, 0.5, 0.7],
            [0.4, -0.5, -0.3, 0.6],
            [-0.3, -0.2, 0.6, 0.5],
        ];
        return (
            <group>
                {pieces.map(([x, y, z, s], index) => (
                    <mesh
                        key={index}
                        material={material}
                        position={[x * radius, y * radius, z * radius]}
                    >
                        <boxGeometry
                            args={[
                                s * radius,
                                s * radius * 0.7,
                                s * radius * 1.2,
                            ]}
                        />
                    </mesh>
                ))}
            </group>
        );
    }

    const detail = SOLID_CONFIG[type]?.detail ?? 4;
    return (
        <mesh material={material}>
            <icosahedronGeometry args={[radius, detail]} />
        </mesh>
    );
}
