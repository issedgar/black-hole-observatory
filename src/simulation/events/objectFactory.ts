import * as THREE from 'three';
import type {
    CelestialObjectParams,
    CelestialObjectType,
} from '../../types/celestialObject';
import { circularSpeed } from '../trajectories/orbitIntegrator';

/** Radius (world units) at which new objects are detected and spawned. */
export const SPAWN_RADIUS = 34;

export const OBJECT_TYPES: readonly CelestialObjectType[] = [
    'rocky-planet',
    'ice-world',
    'moon',
    'asteroid-swarm',
    'gas-cloud',
    'spacecraft',
    'station-debris',
] as const;

type BaseParams = Omit<CelestialObjectParams, 'type' | 'seed'>;

// Descriptive/physical templates. Display values are plausible order-of-magnitude
// figures shown in the HUD; render radii are scene-scaled (1 unit = r_g).
const BASE_PARAMS: Record<CelestialObjectType, BaseParams> = {
    'rocky-planet': {
        displayName: 'Exoplaneta rocoso',
        composition: 'Silicatos y hierro',
        massSolar: 3.0e-6,
        diameterKm: 12800,
        radiusWorld: 1.35,
        baseColor: [0.42, 0.3, 0.22],
        accentColor: [0.62, 0.5, 0.4],
        hasAtmosphere: true,
    },
    'ice-world': {
        displayName: 'Mundo helado',
        composition: 'Hielo de agua y roca',
        massSolar: 1.1e-6,
        diameterKm: 9200,
        radiusWorld: 1.15,
        baseColor: [0.6, 0.72, 0.85],
        accentColor: [0.9, 0.95, 1.0],
        hasAtmosphere: true,
    },
    moon: {
        displayName: 'Luna',
        composition: 'Roca y regolito',
        massSolar: 3.7e-8,
        diameterKm: 3400,
        radiusWorld: 0.7,
        baseColor: [0.4, 0.4, 0.42],
        accentColor: [0.6, 0.6, 0.63],
        hasAtmosphere: false,
    },
    'asteroid-swarm': {
        displayName: 'Enjambre de asteroides',
        composition: 'Roca carbonácea y metal',
        massSolar: 5.0e-12,
        diameterKm: 180,
        radiusWorld: 0.55,
        baseColor: [0.33, 0.29, 0.26],
        accentColor: [0.5, 0.45, 0.4],
        hasAtmosphere: false,
    },
    'gas-cloud': {
        displayName: 'Nube de gas',
        composition: 'Hidrógeno y helio',
        massSolar: 8.0e-5,
        diameterKm: 240000,
        radiusWorld: 2.4,
        baseColor: [0.45, 0.4, 0.7],
        accentColor: [0.85, 0.5, 0.6],
        hasAtmosphere: false,
    },
    spacecraft: {
        displayName: 'Nave de exploración',
        composition: 'Aleaciones metálicas',
        massSolar: 5.0e-25,
        diameterKm: 0.15,
        radiusWorld: 0.9,
        baseColor: [0.62, 0.64, 0.68],
        accentColor: [0.3, 0.36, 0.42],
        hasAtmosphere: false,
    },
    'station-debris': {
        displayName: 'Restos de estación orbital',
        composition: 'Metal y composites',
        massSolar: 2.0e-24,
        diameterKm: 2.4,
        radiusWorld: 0.85,
        baseColor: [0.5, 0.5, 0.53],
        accentColor: [0.72, 0.62, 0.42],
        hasAtmosphere: false,
    },
};

export function createObjectParams(
    type: CelestialObjectType,
): CelestialObjectParams {
    const base = BASE_PARAMS[type];
    // Modest per-instance size variation so repeats are not identical; the
    // global factor gives captured bodies a stronger, more cosmic-scale read.
    const sizeVariation = 0.82 + Math.random() * 0.36;
    return {
        type,
        seed: Math.random() * 1000,
        ...base,
        radiusWorld: base.radiusWorld * sizeVariation * 1.35,
    };
}

export interface InitialKinematics {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
}

/**
 * Places a new object at the spawn radius in a random orbital plane, moving on an
 * eccentric, sub-circular trajectory with a slight inward component so that drag
 * decays it into the hole rather than it flying past.
 */
export function createInitialKinematics(): InitialKinematics {
    const position = new THREE.Vector3()
        .randomDirection()
        .multiplyScalar(SPAWN_RADIUS);

    // Tangential direction in a random plane through the spawn point.
    const tangential = new THREE.Vector3()
        .randomDirection()
        .cross(position)
        .normalize();

    // Sub-circular tangential speed with a notable inward component produces an
    // eccentric, plunging orbit that curves in over a cinematic timescale.
    const speed = circularSpeed(SPAWN_RADIUS) * (0.52 + Math.random() * 0.22);
    const inwardSpeed = speed * (0.28 + Math.random() * 0.18);

    const velocity = tangential
        .multiplyScalar(speed)
        .addScaledVector(position.clone().normalize(), -inwardSpeed);

    return { position, velocity };
}

export function pickRandomType(): CelestialObjectType {
    return OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
}
